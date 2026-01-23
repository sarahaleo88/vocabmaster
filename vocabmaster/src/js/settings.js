/**
 * VocabMaster Settings Module
 * User preferences stored in localStorage
 */

const STORAGE_KEYS = {
    NEW_CARDS_PER_DAY: 'vocabmaster_newCardsPerDay',
    TODAY_NEW_CARDS_COUNT: 'vocabmaster_todayNewCardsCount',
    LAST_REVIEW_DATE: 'vocabmaster_lastReviewDate'
};

const DEFAULTS = {
    NEW_CARDS_PER_DAY: 20,
    MIN_NEW_CARDS: 5,
    MAX_NEW_CARDS: 50
};

/**
 * Get new cards per day setting
 */
function getNewCardsPerDay() {
    const value = localStorage.getItem(STORAGE_KEYS.NEW_CARDS_PER_DAY);
    return value ? parseInt(value, 10) : DEFAULTS.NEW_CARDS_PER_DAY;
}

/**
 * Set new cards per day
 */
function setNewCardsPerDay(count) {
    const value = Math.max(DEFAULTS.MIN_NEW_CARDS, Math.min(DEFAULTS.MAX_NEW_CARDS, count));
    localStorage.setItem(STORAGE_KEYS.NEW_CARDS_PER_DAY, value.toString());
    return value;
}

/**
 * Get today's new cards count
 */
function getTodayNewCardsCount() {
    const value = localStorage.getItem(STORAGE_KEYS.TODAY_NEW_CARDS_COUNT);
    return value ? parseInt(value, 10) : 0;
}

/**
 * Increment today's new cards count
 */
function incrementTodayNewCardsCount() {
    const current = getTodayNewCardsCount();
    localStorage.setItem(STORAGE_KEYS.TODAY_NEW_CARDS_COUNT, (current + 1).toString());
}

/**
 * Reset today's new cards count
 */
function resetTodayNewCardsCount() {
    localStorage.setItem(STORAGE_KEYS.TODAY_NEW_CARDS_COUNT, '0');
}

/**
 * Get last review date
 */
function getLastReviewDate() {
    return localStorage.getItem(STORAGE_KEYS.LAST_REVIEW_DATE) || '';
}

/**
 * Set last review date
 */
function setLastReviewDate(dateString) {
    localStorage.setItem(STORAGE_KEYS.LAST_REVIEW_DATE, dateString);
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

/**
 * Check if it's a new day and reset daily count if needed
 */
function checkAndResetDailyCount() {
    const today = getTodayString();
    const lastDate = getLastReviewDate();

    if (lastDate !== today) {
        resetTodayNewCardsCount();
        setLastReviewDate(today);
    }
}

/**
 * Get all settings
 */
function getAllSettings() {
    return {
        newCardsPerDay: getNewCardsPerDay(),
        todayNewCardsCount: getTodayNewCardsCount(),
        lastReviewDate: getLastReviewDate()
    };
}

/**
 * Reset all settings to defaults
 */
function resetAllSettings() {
    localStorage.removeItem(STORAGE_KEYS.NEW_CARDS_PER_DAY);
    localStorage.removeItem(STORAGE_KEYS.TODAY_NEW_CARDS_COUNT);
    localStorage.removeItem(STORAGE_KEYS.LAST_REVIEW_DATE);
}

/**
 * Get storage usage estimate
 */
async function getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
            used: estimate.usage || 0,
            quota: estimate.quota || 0,
            usedFormatted: formatBytes(estimate.usage || 0),
            quotaFormatted: formatBytes(estimate.quota || 0),
            percentUsed: estimate.quota ? Math.round((estimate.usage / estimate.quota) * 100) : 0
        };
    }
    return null;
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Get app version
 */
function getAppVersion() {
    return '1.0.0';
}

export {
    DEFAULTS,
    getNewCardsPerDay,
    setNewCardsPerDay,
    getTodayNewCardsCount,
    incrementTodayNewCardsCount,
    resetTodayNewCardsCount,
    getLastReviewDate,
    setLastReviewDate,
    checkAndResetDailyCount,
    getAllSettings,
    resetAllSettings,
    getStorageUsage,
    formatBytes,
    getAppVersion
};
