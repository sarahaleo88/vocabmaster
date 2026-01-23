/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm
 */

/**
 * Rating scores
 * 0 = Again (complete blackout)
 * 1 = Hard (incorrect, but upon being shown answer, remembered)
 * 2 = Good (correct with difficulty)
 * 3 = Easy (correct with no difficulty)
 */
const RATINGS = {
    AGAIN: 0,
    HARD: 1,
    GOOD: 2,
    EASY: 3
};

/**
 * Calculate new easiness factor (EF)
 * EF = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))
 * Minimum EF = 1.3
 * 
 * @param {number} currentEF - Current easiness factor
 * @param {number} rating - Rating score (0-3)
 * @returns {number} - New easiness factor
 */
function calculateEasiness(currentEF, rating) {
    const newEF = currentEF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
    return Math.max(1.3, newEF);
}

/**
 * Calculate next interval in days
 * 
 * @param {number} rating - Rating score (0-3)
 * @param {number} repetitions - Number of successful reviews
 * @param {number} previousInterval - Previous interval in days
 * @param {number} easiness - Easiness factor
 * @returns {number} - Next interval in days
 */
function calculateInterval(rating, repetitions, previousInterval, easiness) {
    // If rating < 2, reset to 1 day
    if (rating < 2) {
        return 1;
    }

    // Successful review
    if (repetitions === 0) {
        return 1;
    } else if (repetitions === 1) {
        return 6;
    } else {
        return Math.round(previousInterval * easiness);
    }
}

/**
 * Process a card review and update SM-2 fields
 * 
 * @param {Object} card - Card object with SM-2 fields
 * @param {number} rating - Rating score (0-3)
 * @returns {Object} - Updated card object
 */
function processReview(card, rating) {
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    // Calculate new easiness factor
    const newEasiness = calculateEasiness(card.easiness, rating);

    // Calculate new repetitions count
    let newRepetitions;
    if (rating < 2) {
        // Failed review - reset repetitions
        newRepetitions = 0;
    } else {
        // Successful review - increment repetitions
        newRepetitions = card.repetitions + 1;
    }

    // Calculate new interval
    const newInterval = calculateInterval(
        rating,
        newRepetitions,
        card.interval,
        newEasiness
    );

    // Calculate next review date
    const nextReview = now + (newInterval * DAY_MS);

    return {
        ...card,
        easiness: newEasiness,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReview: nextReview
    };
}

/**
 * Get preview of next intervals for all ratings
 * Useful for showing user what each button will do
 * 
 * @param {Object} card - Card object with SM-2 fields
 * @returns {Object} - Preview of intervals for each rating
 */
function getIntervalPreview(card) {
    const previews = {};

    for (const [name, rating] of Object.entries(RATINGS)) {
        const result = processReview(card, rating);
        previews[name.toLowerCase()] = result.interval;
    }

    return previews;
}

/**
 * Format interval for display
 * 
 * @param {number} days - Interval in days
 * @returns {string} - Formatted string (e.g., "1天", "2周", "1月")
 */
function formatInterval(days) {
    if (days === 0) {
        return '今天';
    } else if (days === 1) {
        return '1天';
    } else if (days < 7) {
        return `${days}天`;
    } else if (days < 30) {
        const weeks = Math.round(days / 7);
        return `${weeks}周`;
    } else if (days < 365) {
        const months = Math.round(days / 30);
        return `${months}月`;
    } else {
        const years = Math.round(days / 365);
        return `${years}年`;
    }
}

/**
 * Check if a card is due for review
 * 
 * @param {Object} card - Card object
 * @returns {boolean} - True if due
 */
function isDue(card) {
    return card.nextReview <= Date.now();
}

/**
 * Check if a card is new (never reviewed)
 * 
 * @param {Object} card - Card object
 * @returns {boolean} - True if new
 */
function isNew(card) {
    return card.repetitions === 0;
}

export {
    RATINGS,
    calculateEasiness,
    calculateInterval,
    processReview,
    getIntervalPreview,
    formatInterval,
    isDue,
    isNew
};
