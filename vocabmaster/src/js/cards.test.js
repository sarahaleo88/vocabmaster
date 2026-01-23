import { describe, it, expect } from 'vitest';
import { normalizeAndValidateCardInput } from './cards.js';

describe('normalizeAndValidateCardInput', () => {
    describe('required fields validation', () => {
        it('throws on empty word', () => {
            expect(() => normalizeAndValidateCardInput({ word: '', translation: '测试' }))
                .toThrow('单词和翻译为必填项');
        });

        it('throws on empty translation', () => {
            expect(() => normalizeAndValidateCardInput({ word: 'test', translation: '' }))
                .toThrow('单词和翻译为必填项');
        });

        it('throws on whitespace-only word', () => {
            expect(() => normalizeAndValidateCardInput({ word: '   ', translation: '测试' }))
                .toThrow('单词和翻译为必填项');
        });

        it('throws on null/undefined values', () => {
            expect(() => normalizeAndValidateCardInput({ word: null, translation: '测试' }))
                .toThrow('单词和翻译为必填项');
            expect(() => normalizeAndValidateCardInput({ word: 'test', translation: undefined }))
                .toThrow('单词和翻译为必填项');
        });
    });

    describe('length validation', () => {
        it('throws on word exceeding 120 characters', () => {
            const longWord = 'a'.repeat(121);
            expect(() => normalizeAndValidateCardInput({ word: longWord, translation: '测试' }))
                .toThrow('单词长度不能超过 120 字符');
        });

        it('throws on translation exceeding 240 characters', () => {
            const longTranslation = '测'.repeat(241);
            expect(() => normalizeAndValidateCardInput({ word: 'test', translation: longTranslation }))
                .toThrow('翻译长度不能超过 240 字符');
        });

        it('throws on pronunciation exceeding 120 characters', () => {
            const longPronunciation = '/'.repeat(121);
            expect(() => normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                pronunciation: longPronunciation
            })).toThrow('音标长度不能超过 120 字符');
        });

        it('throws on example exceeding 800 characters', () => {
            const longExample = 'x'.repeat(801);
            expect(() => normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                example: longExample
            })).toThrow('例句长度不能超过 800 字符');
        });

        it('throws on tag exceeding 40 characters', () => {
            const longTag = 'tag'.repeat(20);
            expect(() => normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                tags: [longTag]
            })).toThrow('标签长度不能超过 40 字符');
        });

        it('accepts values at maximum length', () => {
            const result = normalizeAndValidateCardInput({
                word: 'a'.repeat(120),
                translation: '测'.repeat(240),
                pronunciation: '/'.repeat(120),
                example: 'x'.repeat(800),
                tags: ['t'.repeat(40)]
            });
            expect(result.word.length).toBe(120);
            expect(result.translation.length).toBe(240);
        });
    });

    describe('whitespace normalization', () => {
        it('trims leading/trailing whitespace from word', () => {
            const result = normalizeAndValidateCardInput({ word: '  hello  ', translation: '你好' });
            expect(result.word).toBe('hello');
        });

        it('trims leading/trailing whitespace from translation', () => {
            const result = normalizeAndValidateCardInput({ word: 'hello', translation: '  你好  ' });
            expect(result.translation).toBe('你好');
        });

        it('trims optional fields', () => {
            const result = normalizeAndValidateCardInput({
                word: 'hello',
                translation: '你好',
                example: '  This is an example.  ',
                pronunciation: '  /həˈləʊ/  '
            });
            expect(result.example).toBe('This is an example.');
            expect(result.pronunciation).toBe('/həˈləʊ/');
        });
    });

    describe('tags normalization', () => {
        it('converts string tag to array', () => {
            const result = normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                tags: 'programming'
            });
            expect(result.tags).toEqual(['programming']);
        });

        it('filters empty tags', () => {
            const result = normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                tags: ['valid', '', '  ', 'another']
            });
            expect(result.tags).toEqual(['valid', 'another']);
        });

        it('trims whitespace from tags', () => {
            const result = normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                tags: ['  programming  ', '  general  ']
            });
            expect(result.tags).toEqual(['programming', 'general']);
        });

        it('returns empty array for undefined tags', () => {
            const result = normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试'
            });
            expect(result.tags).toEqual([]);
        });

        it('handles null tags gracefully', () => {
            const result = normalizeAndValidateCardInput({
                word: 'test',
                translation: '测试',
                tags: null
            });
            expect(result.tags).toEqual([]);
        });
    });

    describe('successful validation', () => {
        it('returns normalized card data', () => {
            const result = normalizeAndValidateCardInput({
                word: '  Hello  ',
                translation: '  你好  ',
                example: 'Hello, World!',
                pronunciation: '/həˈləʊ/',
                tags: ['general']
            });

            expect(result).toEqual({
                word: 'Hello',
                translation: '你好',
                example: 'Hello, World!',
                pronunciation: '/həˈləʊ/',
                tags: ['general']
            });
        });

        it('handles minimal valid input', () => {
            const result = normalizeAndValidateCardInput({
                word: 'a',
                translation: 'b'
            });

            expect(result).toEqual({
                word: 'a',
                translation: 'b',
                example: '',
                pronunciation: '',
                tags: []
            });
        });
    });
});
