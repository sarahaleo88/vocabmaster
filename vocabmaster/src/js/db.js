/**
 * VocabMaster Database Module
 * IndexedDB wrapper using idb library
 */

import { openDB } from 'idb';

const DB_NAME = 'vocabmaster';
const DB_VERSION = 1;
const STORE_NAME = 'cards';

let dbInstance = null;

/**
 * Initialize and get database instance
 */
async function getDB() {
    if (dbInstance) return dbInstance;

    dbInstance = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('nextReview', 'nextReview');
                store.createIndex('isBuiltIn', 'isBuiltIn');
                store.createIndex('word', 'word');
            }
        }
    });

    return dbInstance;
}

/**
 * Generate UUID
 */
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Create a new card with default SM-2 values
 */
function createCard(data) {
    const now = Date.now();
    return {
        id: generateId(),
        word: data.word || '',
        translation: data.translation || '',
        example: data.example || '',
        pronunciation: data.pronunciation || '',
        tags: data.tags || ['general'],

        // SM-2 fields with defaults
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        nextReview: now,

        // Metadata
        createdAt: now,
        isBuiltIn: data.isBuiltIn || false
    };
}

/**
 * Add a card to the database
 */
async function addCard(cardData) {
    const db = await getDB();
    const card = createCard(cardData);
    await db.put(STORE_NAME, card);
    return card;
}

/**
 * Get a card by ID
 */
async function getCard(id) {
    const db = await getDB();
    return db.get(STORE_NAME, id);
}

/**
 * Update a card
 */
async function updateCard(card) {
    const db = await getDB();
    await db.put(STORE_NAME, card);
    return card;
}

/**
 * Delete a card by ID
 */
async function deleteCard(id) {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
}

/**
 * Get all cards
 */
async function getAllCards() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}

/**
 * Get cards due for review (nextReview <= now)
 */
async function getDueCards() {
    const db = await getDB();
    const now = Date.now();
    const allCards = await db.getAll(STORE_NAME);
    return allCards.filter(card => card.nextReview <= now);
}

/**
 * Get new cards (never reviewed, repetitions === 0)
 */
async function getNewCards(limit = 20) {
    const db = await getDB();
    const allCards = await db.getAll(STORE_NAME);
    return allCards
        .filter(card => card.repetitions === 0)
        .slice(0, limit);
}

/**
 * Get total card count
 */
async function getCardCount() {
    const db = await getDB();
    return db.count(STORE_NAME);
}

/**
 * Search cards by word
 */
async function searchCards(query) {
    const db = await getDB();
    const allCards = await db.getAll(STORE_NAME);
    const lowerQuery = query.toLowerCase();
    return allCards.filter(card =>
        card.word.toLowerCase().includes(lowerQuery) ||
        card.translation.includes(query)
    );
}

/**
 * Get cards by tag
 */
async function getCardsByTag(tag) {
    const db = await getDB();
    const allCards = await db.getAll(STORE_NAME);
    return allCards.filter(card => card.tags.includes(tag));
}

/**
 * Check if card with word already exists
 */
async function cardExists(word) {
    const db = await getDB();
    const allCards = await db.getAll(STORE_NAME);
    return allCards.some(card => card.word.toLowerCase() === word.toLowerCase());
}

/**
 * Clear all cards
 */
async function clearAllCards() {
    const db = await getDB();
    await db.clear(STORE_NAME);
}

/**
 * Import multiple cards (skip duplicates)
 */
async function importCards(cardsData) {
    const results = { added: 0, skipped: 0, errors: [] };

    for (const data of cardsData) {
        try {
            if (await cardExists(data.word)) {
                results.skipped++;
            } else {
                await addCard(data);
                results.added++;
            }
        } catch (error) {
            results.errors.push({ word: data.word, error: error.message });
        }
    }

    return results;
}

/**
 * Export all cards
 */
async function exportCards(includeStats = true) {
    const cards = await getAllCards();

    if (includeStats) {
        return cards;
    }

    // Word list only - remove SM-2 and metadata
    return cards.map(({ word, translation, example, pronunciation, tags }) => ({
        word,
        translation,
        example,
        pronunciation,
        tags
    }));
}

export {
    getDB,
    generateId,
    createCard,
    addCard,
    getCard,
    updateCard,
    deleteCard,
    getAllCards,
    getDueCards,
    getNewCards,
    getCardCount,
    searchCards,
    getCardsByTag,
    cardExists,
    clearAllCards,
    importCards,
    exportCards
};
