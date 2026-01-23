import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_Total = 1000;
const TARGET_PROGRAMMING = 800;
const TARGET_GENERAL = 200;

const originalVocabPath = path.join(__dirname, '../src/data/vocabulary.original.json');
const additionalVocabPath1 = path.join(__dirname, '../src/data/vocab_batch_1.json');
const additionalVocabPath2 = path.join(__dirname, '../src/data/vocab_batch_2.json');
const additionalVocabPath3 = path.join(__dirname, '../src/data/vocab_batch_3.json');
const additionalVocabPath4 = path.join(__dirname, '../src/data/vocab_batch_4.json');
const additionalVocabPathSupplement = path.join(__dirname, '../src/data/vocab_batch_supplement.json');
const additionalVocabPathSupplement2 = path.join(__dirname, '../src/data/vocab_batch_supplement_2.json');
const outputPath = path.join(__dirname, '../src/data/vocabulary.json');

function loadJSON(filepath) {
    if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf8'));
    }
    return [];
}

const originalVocab = loadJSON(originalVocabPath);
console.log(`Loaded ${originalVocab.length} words from original vocabulary.`);

// Take top 200 general words
const generalVocab = originalVocab.slice(0, TARGET_GENERAL);
console.log(`Selected ${generalVocab.length} words for General category.`);

// Load valid batches
const batch1 = loadJSON(additionalVocabPath1);
const batch2 = loadJSON(additionalVocabPath2);
const batch3 = loadJSON(additionalVocabPath3);
const batch4 = loadJSON(additionalVocabPath4);
const batchSupplement = loadJSON(additionalVocabPathSupplement);
const batchSupplement2 = loadJSON(additionalVocabPathSupplement2);

let allWords = [
    ...generalVocab,
    ...batch1,
    ...batch2,
    ...batch3,
    ...batch4,
    ...batchSupplement,
    ...batchSupplement2
];

// Dedup
const uniqueMap = new Map();
allWords.forEach(item => {
    if (uniqueMap.has(item.word)) {
        // Merge tags
        const existing = uniqueMap.get(item.word);
        const newTags = new Set([...existing.tags, ...item.tags]);
        existing.tags = Array.from(newTags);
        // Maybe update translation/example if the new one is more specific? 
        // Let's keep the existing one unless it's from general and new is programming?
        // Simple strategy: Keep existing but merge tags.
        // Actually, general words were first. If I have a programming definition later, maybe I prefer that?
        // But general words are useful. 
        // Let's just keep the *last* one (programming ones are later) but preserve all tags.
        const merged = { ...existing, ...item };
        merged.tags = Array.from(newTags);
        uniqueMap.set(item.word, merged);
    } else {
        uniqueMap.set(item.word, item);
    }
});

const finalVocab = Array.from(uniqueMap.values());

console.log(`Total unique vocabulary size: ${finalVocab.length}`);

if (finalVocab.length < TARGET_Total) {
    console.log(`WARNING: Total count is ${finalVocab.length}, aiming for ${TARGET_Total}. Need ${TARGET_Total - finalVocab.length} more words.`);
}

fs.writeFileSync(outputPath, JSON.stringify(finalVocab, null, 4));
console.log(`Written final vocabulary to ${outputPath}`);
