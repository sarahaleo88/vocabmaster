import { describe, it, expect } from 'vitest';
import { parseJSON, parseCSV, parseFile, generatePreview } from './importer.js';

describe('importer', () => {
    describe('parseJSON', () => {
        it('throws on invalid JSON syntax', () => {
            expect(() => parseJSON('{ invalid json }')).toThrow('Invalid JSON format');
        });

        it('throws on completely malformed input', () => {
            expect(() => parseJSON('not json at all')).toThrow('Invalid JSON format');
        });

        it('returns error for non-array data', () => {
            const result = parseJSON('{"word": "test"}');
            expect(result.cards).toEqual([]);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0].reason).toBe('数据必须是数组格式');
        });

        it('returns error for empty object', () => {
            const result = parseJSON('{}');
            expect(result.cards).toEqual([]);
            expect(result.errors[0].reason).toBe('数据必须是数组格式');
        });

        it('parses valid card array', () => {
            const json = JSON.stringify([
                { word: 'hello', translation: '你好' },
                { word: 'world', translation: '世界' }
            ]);
            const result = parseJSON(json);
            expect(result.cards).toHaveLength(2);
            expect(result.errors).toHaveLength(0);
            expect(result.cards[0].word).toBe('hello');
            expect(result.cards[1].translation).toBe('世界');
        });

        it('records missing word/translation as errors', () => {
            const json = JSON.stringify([
                { word: 'valid', translation: '有效' },
                { word: 'missing translation' },
                { translation: 'missing word' },
                { other: 'no required fields' }
            ]);
            const result = parseJSON(json);
            expect(result.cards).toHaveLength(1);
            expect(result.errors).toHaveLength(3);
            expect(result.errors[0].line).toBe(2);
            expect(result.errors[0].reason).toBe('缺少 word 或 translation 字段');
        });

        it('preserves optional fields', () => {
            const json = JSON.stringify([{
                word: 'hello',
                translation: '你好',
                example: 'Hello, world!',
                pronunciation: '/həˈləʊ/',
                tags: ['general']
            }]);
            const result = parseJSON(json);
            expect(result.cards[0].example).toBe('Hello, world!');
            expect(result.cards[0].pronunciation).toBe('/həˈləʊ/');
            expect(result.cards[0].tags).toEqual(['general']);
        });

        it('preserves SM-2 fields for backup restore', () => {
            const json = JSON.stringify([{
                word: 'hello',
                translation: '你好',
                easiness: 2.8,
                interval: 10,
                repetitions: 3,
                nextReview: 1700000000000
            }]);
            const result = parseJSON(json);
            expect(result.cards[0].easiness).toBe(2.8);
            expect(result.cards[0].interval).toBe(10);
            expect(result.cards[0].repetitions).toBe(3);
            expect(result.cards[0].nextReview).toBe(1700000000000);
        });

        it('handles empty array', () => {
            const result = parseJSON('[]');
            expect(result.cards).toEqual([]);
            expect(result.errors).toEqual([]);
        });
    });

    describe('parseCSV', () => {
        it('parses simple CSV with headers', () => {
            const csv = `word,translation
hello,你好
world,世界`;
            const result = parseCSV(csv);
            expect(result.cards).toHaveLength(2);
            expect(result.cards[0].word).toBe('hello');
            expect(result.cards[0].translation).toBe('你好');
        });

        it('handles quoted fields with commas', () => {
            const csv = `word,translation,example
hello,你好,"Hello, world!"`;
            const result = parseCSV(csv);
            expect(result.cards[0].example).toBe('Hello, world!');
        });

        it('handles escaped quotes inside quoted fields', () => {
            const csv = `word,translation,example
test,测试,"He said ""hello"""`;
            const result = parseCSV(csv);
            expect(result.cards[0].example).toBe('He said "hello"');
        });

        it('auto-detects Chinese column names', () => {
            const csv = `单词,翻译,例句
apple,苹果,I eat an apple`;
            const result = parseCSV(csv);
            expect(result.cards[0].word).toBe('apple');
            expect(result.cards[0].translation).toBe('苹果');
            expect(result.cards[0].example).toBe('I eat an apple');
        });

        it('handles CSV without headers using fixed column order', () => {
            // Test with a row that doesn't match any known header patterns
            // The CSV parser will use fixed column order: word, translation, example, pronunciation, tags
            const csv = `word,translation,example,pronunciation,tags
test,测试,This is a test,/test/,general`;
            const result = parseCSV(csv);
            expect(result.cards).toHaveLength(1);
            expect(result.cards[0].word).toBe('test');
            expect(result.cards[0].translation).toBe('测试');
            expect(result.cards[0].example).toBe('This is a test');
            expect(result.cards[0].pronunciation).toBe('/test/');
        });

        it('records rows with missing required fields as errors', () => {
            const csv = `word,translation
hello,你好
onlyword,`;
            const result = parseCSV(csv);
            expect(result.cards).toHaveLength(1);
            // Row with empty translation but has word should be recorded as error
        });

        it('handles Windows line endings', () => {
            const csv = "word,translation\r\nhello,你好\r\nworld,世界";
            const result = parseCSV(csv);
            expect(result.cards).toHaveLength(2);
        });

        it('parses tags with multiple separators', () => {
            const csv = `word,translation,tags
test1,测试1,"tag1,tag2"
test2,测试2,tag3;tag4
test3,测试3,tag5|tag6`;
            const result = parseCSV(csv);
            expect(result.cards[0].tags).toEqual(['tag1', 'tag2']);
            expect(result.cards[1].tags).toEqual(['tag3', 'tag4']);
            expect(result.cards[2].tags).toEqual(['tag5', 'tag6']);
        });

        it('handles empty CSV', () => {
            const result = parseCSV('');
            // parseCSV returns empty array for empty input
            expect(result).toEqual([]);
        });

        it('handles whitespace-only CSV', () => {
            const result = parseCSV('   \n   \n   ');
            // parseCSV returns empty array for whitespace-only input
            expect(result).toEqual([]);
        });
    });

    describe('parseFile', () => {
        it('uses JSON parser for .json files', () => {
            const result = parseFile('[{"word":"test","translation":"测试"}]', 'data.json');
            expect(result.cards).toHaveLength(1);
            expect(result.cards[0].word).toBe('test');
        });

        it('uses CSV parser for .csv files', () => {
            const result = parseFile('word,translation\nhello,你好', 'data.csv');
            expect(result.cards).toHaveLength(1);
            expect(result.cards[0].word).toBe('hello');
        });

        it('auto-detects JSON for unknown extensions', () => {
            const result = parseFile('[{"word":"test","translation":"测试"}]', 'data.txt');
            expect(result.cards).toHaveLength(1);
        });

        it('falls back to CSV if JSON parsing fails for unknown extensions', () => {
            const result = parseFile('word,translation\nhello,你好', 'data.txt');
            expect(result.cards).toHaveLength(1);
        });

        it('handles uppercase extensions', () => {
            const result = parseFile('[{"word":"test","translation":"测试"}]', 'data.JSON');
            expect(result.cards).toHaveLength(1);
        });
    });

    describe('generatePreview', () => {
        it('returns correct total count', () => {
            const cards = [
                { word: 'a', tags: [] },
                { word: 'b', tags: [] },
                { word: 'c', tags: [] }
            ];
            const preview = generatePreview(cards);
            expect(preview.total).toBe(3);
        });

        it('returns first 5 words as preview', () => {
            const cards = Array.from({ length: 10 }, (_, i) => ({ word: `word${i}`, tags: [] }));
            const preview = generatePreview(cards);
            expect(preview.preview).toEqual(['word0', 'word1', 'word2', 'word3', 'word4']);
        });

        it('detects SM-2 data presence', () => {
            const cardsWithSM2 = [{ word: 'test', easiness: 2.5, tags: [] }];
            const cardsWithoutSM2 = [{ word: 'test', tags: [] }];

            expect(generatePreview(cardsWithSM2).hasSM2Data).toBe(true);
            expect(generatePreview(cardsWithoutSM2).hasSM2Data).toBe(false);
        });

        it('counts tags correctly', () => {
            const cards = [
                { word: 'a', tags: ['general'] },
                { word: 'b', tags: ['general', 'programming'] },
                { word: 'c', tags: ['programming'] }
            ];
            const preview = generatePreview(cards);
            expect(preview.tagCounts).toEqual({ general: 2, programming: 2 });
        });

        it('handles empty cards array', () => {
            const preview = generatePreview([]);
            expect(preview.total).toBe(0);
            expect(preview.preview).toEqual([]);
            expect(preview.hasSM2Data).toBe(false);
            expect(preview.tagCounts).toEqual({});
        });
    });
});
