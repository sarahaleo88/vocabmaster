/**
 * VocabMaster Card Service
 * High-level card operations and review session management
 */

import * as db from './db.js';
import * as sm2 from './sm2.js';
import * as settings from './settings.js';

const WORD_MAX = 120;
const TRANS_MAX = 240;
const PRON_MAX = 120;
const EXAMPLE_MAX = 800;
const TAG_MAX = 40;

function normalizeAndValidateCardInput({ word, translation, example, pronunciation, tags } = {}) {
    const normalizedWord = String(word ?? '').trim();
    const normalizedTranslation = String(translation ?? '').trim();
    const normalizedExample = String(example ?? '').trim();
    const normalizedPronunciation = String(pronunciation ?? '').trim();

    if (!normalizedWord || !normalizedTranslation) {
        throw new Error('单词和翻译为必填项');
    }

    if (normalizedWord.length > WORD_MAX) {
        throw new Error(`单词长度不能超过 ${WORD_MAX} 字符`);
    }

    if (normalizedTranslation.length > TRANS_MAX) {
        throw new Error(`翻译长度不能超过 ${TRANS_MAX} 字符`);
    }

    if (normalizedPronunciation.length > PRON_MAX) {
        throw new Error(`音标长度不能超过 ${PRON_MAX} 字符`);
    }

    if (normalizedExample.length > EXAMPLE_MAX) {
        throw new Error(`例句长度不能超过 ${EXAMPLE_MAX} 字符`);
    }

    const rawTags = Array.isArray(tags)
        ? tags
        : (typeof tags === 'string' ? [tags] : []);

    const normalizedTags = rawTags
        .map(tag => String(tag ?? '').trim())
        .filter(Boolean);

    normalizedTags.forEach(tag => {
        if (tag.length > TAG_MAX) {
            throw new Error(`标签长度不能超过 ${TAG_MAX} 字符`);
        }
    });

    return {
        word: normalizedWord,
        translation: normalizedTranslation,
        example: normalizedExample,
        pronunciation: normalizedPronunciation,
        tags: normalizedTags
    };
}

/**
 * Initialize database with built-in vocabulary if empty
 */
async function initializeVocabulary() {
    const count = await db.getCardCount();

    if (count === 0) {
        try {
            const response = await fetch('/data/vocabulary.json');
            const vocabulary = await response.json();

            const cardsData = vocabulary.map(item => ({
                ...item,
                isBuiltIn: true
            }));

            await db.importCards(cardsData);
            if (import.meta.env.DEV) {
                console.log(`Loaded ${vocabulary.length} built-in vocabulary words`);
            }
        } catch (error) {
            console.error('Failed to load built-in vocabulary:', error);
        }
    }
}

/**
 * Get today's review session cards
 * Combines due cards (unlimited) + new cards (limited by daily setting)
 */
async function getReviewSession() {
    // Check and reset daily count if new day
    settings.checkAndResetDailyCount();

    // Get all due cards (no limit)
    const dueCards = await db.getDueCards();

    // Calculate remaining new cards for today
    const newCardsPerDay = settings.getNewCardsPerDay();
    const todayNewCount = settings.getTodayNewCardsCount();
    const remainingNewSlots = Math.max(0, newCardsPerDay - todayNewCount);

    // Get new cards up to remaining limit
    const newCards = await db.getNewCards(remainingNewSlots);

    // Combine and shuffle
    const allCards = [...dueCards, ...newCards];
    return shuffleArray(allCards);
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Process a card review with rating
 * Updates SM-2 fields and saves to database
 */
async function reviewCard(card, rating) {
    // Process with SM-2 algorithm
    const updatedCard = sm2.processReview(card, rating);

    // If this was a new card (first successful review), increment daily count
    if (card.repetitions === 0 && rating >= 2) {
        settings.incrementTodayNewCardsCount();
    }

    // Save updated card
    await db.updateCard(updatedCard);

    return updatedCard;
}

/**
 * Get statistics for home screen
 */
async function getStats() {
    const allCards = await db.getAllCards();
    const now = Date.now();

    const dueCount = allCards.filter(card => card.nextReview <= now).length;
    const newCount = allCards.filter(card => card.repetitions === 0).length;
    const totalCount = allCards.length;

    // New cards left for today
    const newCardsPerDay = settings.getNewCardsPerDay();
    const todayNewCount = settings.getTodayNewCardsCount();
    const newCardsRemaining = Math.min(newCount, Math.max(0, newCardsPerDay - todayNewCount));

    return {
        dueToday: dueCount + newCardsRemaining,
        newCards: {
            studied: todayNewCount,
            limit: newCardsPerDay,
            remaining: newCardsRemaining
        },
        totalCards: totalCount
    };
}

/**
 * Add a new user card
 */
async function addUserCard(cardData) {
    const normalized = normalizeAndValidateCardInput(cardData);

    return db.addCard({
        ...normalized,
        isBuiltIn: false,
        tags: normalized.tags.length > 0 ? normalized.tags : ['user-added']
    });
}

/**
 * Get all cards for browsing
 */
async function getAllCards() {
    return db.getAllCards();
}

/**
 * Search cards
 */
async function searchCards(query) {
    return db.searchCards(query);
}

/**
 * Get cards filtered by tag
 */
async function getCardsByTag(tag) {
    if (tag === 'all') {
        return db.getAllCards();
    }
    return db.getCardsByTag(tag);
}

/**
 * Update a card (for editing)
 */
async function updateCard(card) {
    const normalized = normalizeAndValidateCardInput(card);
    const updatedCard = {
        ...card,
        ...normalized,
        tags: normalized.tags.length > 0
            ? normalized.tags
            : (Array.isArray(card.tags) && card.tags.length > 0 ? card.tags : ['user-added'])
    };

    return db.updateCard(updatedCard);
}

/**
 * Delete a card
 */
async function deleteCard(id) {
    return db.deleteCard(id);
}

/**
 * Export cards (full backup or word list)
 */
async function exportCards(includeStats = true) {
    return db.exportCards(includeStats);
}

/**
 * Import cards with validation (skip duplicates)
 */
async function importCards(cardsData) {
    const results = { added: 0, skipped: 0, errors: [] };

    for (const data of cardsData) {
        try {
            const normalized = normalizeAndValidateCardInput(data);
            const payload = {
                ...normalized,
                isBuiltIn: Boolean(data.isBuiltIn),
                tags: normalized.tags.length > 0 ? normalized.tags : ['user-added']
            };

            if (await db.cardExists(payload.word)) {
                results.skipped++;
            } else {
                await db.addCard(payload);
                results.added++;
            }
        } catch (error) {
            results.errors.push({ word: data?.word, error: error.message });
        }
    }

    return results;
}

/**
 * Get next review date for a card
 */
function getNextReviewDate(card) {
    const date = new Date(card.nextReview);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reviewDate = new Date(card.nextReview);
    reviewDate.setHours(0, 0, 0, 0);

    if (reviewDate.getTime() === today.getTime()) {
        return '今天';
    } else if (reviewDate.getTime() === tomorrow.getTime()) {
        return '明天';
    } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

export {
    initializeVocabulary,
    getReviewSession,
    reviewCard,
    getStats,
    addUserCard,
    getAllCards,
    searchCards,
    getCardsByTag,
    updateCard,
    deleteCard,
    exportCards,
    importCards,
    normalizeAndValidateCardInput,
    getNextReviewDate
};
