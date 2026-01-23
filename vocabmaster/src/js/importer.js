/**
 * VocabMaster Importer Module
 * CSV and JSON import with smart column detection
 */

/**
 * Column name mappings for smart detection
 */
const COLUMN_MAPPINGS = {
    word: ['word', 'english', 'term', 'vocabulary', '单词', '英文', '词汇'],
    translation: ['translation', 'chinese', 'meaning', 'definition', '翻译', '中文', '释义', '意思'],
    example: ['example', 'sentence', 'usage', '例句', '句子', '用法'],
    pronunciation: ['pronunciation', 'ipa', 'phonetic', '音标', '发音'],
    tags: ['tags', 'tag', 'category', 'type', '标签', '分类', '类型']
};

/**
 * Parse CSV content with smart column detection
 * 
 * @param {string} text - CSV content
 * @returns {Array} - Parsed card data array
 */
function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return [];

    // Parse first row to check for headers
    const firstRow = parseCSVRow(lines[0]);
    const columnMap = detectColumns(firstRow);

    // Determine if first row is headers
    const hasHeaders = Object.values(columnMap).some(i => i >= 0);
    const startRow = hasHeaders ? 1 : 0;

    // If no headers detected, use fixed column order
    if (!hasHeaders) {
        columnMap.word = 0;
        columnMap.translation = 1;
        columnMap.example = 2;
        columnMap.pronunciation = 3;
        columnMap.tags = 4;
    }

    const results = [];
    const errors = [];

    for (let i = startRow; i < lines.length; i++) {
        try {
            const cols = parseCSVRow(lines[i]);
            const card = extractCardData(cols, columnMap);

            if (card.word && card.translation) {
                results.push(card);
            } else if (card.word || card.translation) {
                errors.push({ line: i + 1, reason: '缺少必填字段' });
            }
        } catch (error) {
            errors.push({ line: i + 1, reason: error.message });
        }
    }

    return { cards: results, errors };
}

/**
 * Parse a single CSV row (handles quoted fields)
 */
function parseCSVRow(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

/**
 * Detect column mappings from header row
 */
function detectColumns(headerRow) {
    const columnMap = {
        word: -1,
        translation: -1,
        example: -1,
        pronunciation: -1,
        tags: -1
    };

    headerRow.forEach((header, index) => {
        const normalized = header.toLowerCase().trim();

        for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
            if (aliases.includes(normalized)) {
                columnMap[field] = index;
                break;
            }
        }
    });

    return columnMap;
}

/**
 * Extract card data from columns based on mapping
 */
function extractCardData(cols, columnMap) {
    return {
        word: cols[columnMap.word] || '',
        translation: cols[columnMap.translation] || '',
        example: cols[columnMap.example] || '',
        pronunciation: cols[columnMap.pronunciation] || '',
        tags: parseTags(cols[columnMap.tags])
    };
}

/**
 * Parse tags string to array
 */
function parseTags(tagsStr) {
    if (!tagsStr) return ['user-added'];

    const tags = tagsStr.split(/[,;|]/).map(t => t.trim()).filter(Boolean);
    return tags.length > 0 ? tags : ['user-added'];
}

/**
 * Parse JSON content
 * 
 * @param {string} text - JSON content
 * @returns {Object} - Parsed result with cards and errors
 */
function parseJSON(text) {
    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        throw new Error('Invalid JSON format: ' + error.message);
    }

    if (!Array.isArray(data)) {
        return { cards: [], errors: [{ line: 1, reason: '数据必须是数组格式' }] };
    }

    const cards = [];
    const errors = [];

    data.forEach((item, index) => {
        if (item.word && item.translation) {
            cards.push({
                word: item.word,
                translation: item.translation,
                example: item.example || '',
                pronunciation: item.pronunciation || '',
                tags: Array.isArray(item.tags) ? item.tags : parseTags(item.tags),
                // Preserve SM-2 fields if present (for backup restore)
                ...(item.easiness !== undefined && {
                    easiness: item.easiness,
                    interval: item.interval,
                    repetitions: item.repetitions,
                    nextReview: item.nextReview
                }),
                isBuiltIn: item.isBuiltIn || false
            });
        } else {
            errors.push({ line: index + 1, reason: '缺少 word 或 translation 字段' });
        }
    });

    return { cards, errors };
}

/**
 * Auto-detect format and parse file content
 * 
 * @param {string} content - File content
 * @param {string} filename - Original filename
 * @returns {Object} - Parsed result
 */
function parseFile(content, filename) {
    const extension = filename.split('.').pop().toLowerCase();

    if (extension === 'json') {
        return parseJSON(content);
    } else if (extension === 'csv') {
        return parseCSV(content);
    } else {
        // Try JSON first, then CSV
        try {
            return parseJSON(content);
        } catch {
            return parseCSV(content);
        }
    }
}

/**
 * Generate preview summary for import confirmation
 * 
 * @param {Array} cards - Parsed cards array
 * @returns {Object} - Preview data
 */
function generatePreview(cards) {
    return {
        total: cards.length,
        preview: cards.slice(0, 5).map(c => c.word),
        hasSM2Data: cards.some(c => c.easiness !== undefined),
        tagCounts: cards.reduce((acc, c) => {
            (c.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {})
    };
}

export {
    parseCSV,
    parseJSON,
    parseFile,
    generatePreview,
    COLUMN_MAPPINGS
};
