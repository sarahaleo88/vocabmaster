import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Script is in /scripts/, data is in /src/data/
const dataDir = path.join(__dirname, '..', 'src', 'data');
const outputFile = path.join(dataDir, 'vocabulary.json');

// Get all batch_*.json files
if (!fs.existsSync(dataDir)) {
    console.error(`Directory not found: ${dataDir}`);
    process.exit(1);
}

const files = fs.readdirSync(dataDir).filter(f => f.startsWith('batch_') && f.endsWith('.json'));
files.sort((a, b) => {
    // extract number from batch_N.json
    const numA = parseInt(a.match(/\d+/)[0]);
    const numB = parseInt(b.match(/\d+/)[0]);
    return numA - numB;
});

let allWords = [];

files.forEach(file => {
    const filePath = path.join(dataDir, file);
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);
        if (Array.isArray(json)) {
            // Add batch info to help debugging if needed, or just merge
            // We'll just merge
            allWords = allWords.concat(json);
        }
    } catch (e) {
        console.error(`Error reading ${file}:`, e);
    }
});

fs.writeFileSync(outputFile, JSON.stringify(allWords, null, 4));
console.log(`Merged ${files.length} batches into vocabulary.json. Total words: ${allWords.length}`);
