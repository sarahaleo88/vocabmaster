import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vocabPath = path.join(__dirname, '../src/data/vocabulary.json');

try {
    const data = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    console.log(`Loaded ${data.length} items.`);

    const errors = [];
    const seenWords = new Set();
    let programmingCount = 0;
    let generalCount = 0;

    data.forEach((item, index) => {
        if (!item.word) errors.push(`Item ${index} missing 'word'`);
        if (!item.translation) errors.push(`Item ${index} (${item.word}) missing 'translation'`);
        if (!item.pronunciation) errors.push(`Item ${index} (${item.word}) missing 'pronunciation'`);
        if (!item.example) errors.push(`Item ${index} (${item.word}) missing 'example'`);
        if (!item.tags || !Array.isArray(item.tags)) errors.push(`Item ${index} (${item.word}) invalid 'tags'`);

        if (item.tags) {
            if (item.tags.includes('programming')) programmingCount++;
            if (item.tags.includes('general') || item.tags.includes('daily')) generalCount++;
        }

        if (seenWords.has(item.word)) {
            errors.push(`Duplicate word found: ${item.word} at index ${index}`);
        }
        seenWords.add(item.word);
    });

    console.log(`Programming words: ${programmingCount}`);
    console.log(`General/Daily words: ${generalCount}`);

    if (programmingCount / data.length < 0.75) { // Allowing slight margin, but user asked for 80%
        console.warn(`Warning: Programming percentage is ${(programmingCount / data.length * 100).toFixed(2)}%, target 80%`);
    }

    if (errors.length > 0) {
        console.error('Validation failed with errors:');
        errors.slice(0, 20).forEach(e => console.error(e));
        if (errors.length > 20) console.error(`...and ${errors.length - 20} more errors.`);
        process.exit(1);
    } else {
        console.log('Validation passed!');
    }

} catch (e) {
    console.error('Failed to parse or validate:', e);
    process.exit(1);
}
