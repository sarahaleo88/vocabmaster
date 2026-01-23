/**
 * VocabMaster App - Main Entry Point
 * Routing and Screen Management
 */

import '../css/style.css';
import * as cards from './cards.js';
import * as settings from './settings.js';
import { formatInterval, getIntervalPreview } from './sm2.js';
import { clearAllCards } from './db.js';
import { parseFile, generatePreview } from './importer.js';
import { el, setText } from './utils/dom.js';
import { Icons } from './utils/icons.js';

// App State
const state = {
  currentScreen: 'home',
  reviewSession: [],
  currentCardIndex: 0,
  isFlipped: false,
  editingCard: null,
  listFilter: 'all',
  listQuery: ''
};

// Screen Templates
const screens = {
  home: () => `
    <div class="screen active" id="home-screen">
      <div class="header">
        <h1>VocabMaster</h1>
        <button class="header-btn" id="btn-settings" aria-label="Settings">${Icons.settings}</button>
      </div>
      
      <div class="card" id="stats-card">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value" id="stat-due">--</div>
            <div class="stat-label">Review</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="stat-new">--</div>
            <div class="stat-label">New</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="stat-total">--</div>
            <div class="stat-label">Total</div>
          </div>
        </div>
        <button class="btn btn-primary btn-block" id="btn-start-review">
           ${Icons.play} Start Session
        </button>
      </div>

      <div class="btn-group">
        <button class="btn btn-secondary btn-block" id="btn-add">
          ${Icons.plus} Add Word
        </button>
        <button class="btn btn-secondary btn-block" id="btn-list">
          ${Icons.book} Library
        </button>
      </div>
    </div>
  `,

  review: () => `
    <div class="screen active" id="review-screen">
      <div class="progress-header">
        <div class="progress-track">
          <div class="progress-fill" id="review-progress" style="width: 0%"></div>
        </div>
        <span class="progress-text" id="review-count">0 / 0</span>
        <button class="header-btn" id="btn-exit-review" aria-label="Exit">${Icons.close}</button>
      </div>

      <div class="flashcard-container">
        <div class="flashcard" id="flashcard">
          <!-- Question - Always Visible -->
          <div class="flashcard-front">
            <div class="card-word" id="card-word">--</div>
            <div class="card-ipa" id="card-pronunciation">--</div>
            <div class="card-hint" id="card-hint">Tap to reveal</div>
          </div>
          <!-- Answer - Progressive Reveal -->
          <div class="flashcard-back">
            <div class="flashcard-back-inner">
              <div class="flashcard-back-content">
                <div class="card-translation" id="card-translation">--</div>
                <div class="card-example" id="card-example">--</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rating-bar" id="rating-buttons">
        <button class="rating-btn again" type="button" data-rating="0">
          <span class="rating-label">Again</span>
          <span class="rating-time" id="interval-again">1d</span>
        </button>
        <button class="rating-btn hard" type="button" data-rating="1">
          <span class="rating-label">Hard</span>
          <span class="rating-time" id="interval-hard">1d</span>
        </button>
        <button class="rating-btn good" type="button" data-rating="2">
          <span class="rating-label">Good</span>
          <span class="rating-time" id="interval-good">3d</span>
        </button>
        <button class="rating-btn easy" type="button" data-rating="3">
          <span class="rating-label">Easy</span>
          <span class="rating-time" id="interval-easy">7d</span>
        </button>
      </div>
    </div>
  `,

  list: () => `
    <div class="screen active" id="list-screen">
      <div class="header">
        <button class="header-btn" id="btn-list-back" aria-label="Back">${Icons.arrowLeft}</button>
        <h1>Library</h1>
        <div style="width: 44px"></div> <!-- Spacer -->
      </div>
      
      <div class="search-wrapper">
        <span class="search-icon-wrapper">${Icons.search}</span>
        <input type="text" class="search-input" id="search-input" placeholder="Search vocabulary...">
      </div>

      <div class="filter-tabs" id="filter-tabs">
        <button class="filter-tab active" data-tag="all">All</button>
        <button class="filter-tab" data-tag="general">General</button>
        <button class="filter-tab" data-tag="programming">Code</button>
        <button class="filter-tab" data-tag="user-added">Custom</button>
      </div>

      <div id="cards-list"></div>
    </div>
  `,

  add: () => `
    <div class="screen active" id="add-screen">
      <div class="header">
        <button class="header-btn" id="btn-cancel-edit" aria-label="Cancel">${Icons.arrowLeft}</button>
        <h1 id="add-title">${state.editingCard ? 'Edit Word' : 'New Word'}</h1>
        <button class="header-btn" id="btn-save-card" aria-label="Save" style="color: var(--primary)">${Icons.check}</button>
      </div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">Word</label>
          <input type="text" class="form-input" id="input-word" placeholder="e.g. Ephemeral">
        </div>
        <div class="form-group">
          <label class="form-label">Translation</label>
          <input type="text" class="form-input" id="input-translation" placeholder="Meaning">
        </div>
        <div class="form-group">
          <label class="form-label">Example</label>
          <textarea class="form-input" id="input-example" placeholder="Context sentence..."></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">IPA / Pronunciation</label>
          <input type="text" class="form-input" id="input-pronunciation" placeholder="/əˈfem(ə)rəl/">
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-input" id="input-tag">
            <option value="user-added">Custom</option>
            <option value="general">General</option>
            <option value="programming">Programming</option>
          </select>
        </div>
        
        <button class="btn btn-secondary btn-block hidden" id="btn-delete-card" 
                style="color: var(--error); border-color: var(--error); margin-top: 16px;" type="button">
          ${Icons.trash} Delete Word
        </button>
      </div>
    </div>
  `,

  settings: () => `
    <div class="screen active" id="settings-screen">
      <div class="header">
        <button class="header-btn" id="btn-settings-back" aria-label="Back">${Icons.arrowLeft}</button>
        <h1>Settings</h1>
        <div style="width: 44px"></div>
      </div>

      <div class="card">
        <div class="form-group">
          <label class="form-label">New Cards Per Day: <span id="new-cards-value">${settings.getNewCardsPerDay()}</span></label>
          <input type="range" class="form-input" id="new-cards-slider" 
                 min="5" max="50" value="${settings.getNewCardsPerDay()}" style="padding: 0;">
        </div>
        <div class="form-group">
          <label class="form-label">Storage Used</label>
          <div style="font-size: 1.1rem; font-weight: 600;" id="storage-usage">Calculating...</div>
        </div>
        <div class="form-group">
          <label class="form-label">Version</label>
          <div style="font-size: 0.9rem; color: var(--text-secondary);">${settings.getAppVersion()}</div>
        </div>
      </div>

      <div class="card">
        <h3 style="margin-bottom: 20px; font-weight: 600;">Data Management</h3>
        <button class="btn btn-secondary btn-block mb-4" id="btn-export-backup">
          ${Icons.download} Full Backup
        </button>
        <button class="btn btn-secondary btn-block mb-4" id="btn-export-words">
          ${Icons.download} Export Words Only
        </button>
        <button class="btn btn-secondary btn-block mb-4" id="btn-import-data">
          ${Icons.upload} Import Data
        </button>
        <button class="btn btn-secondary btn-block" style="color: var(--error); border-color: var(--error);"
                id="btn-reset-progress">
          ${Icons.refresh} Reset All Progress
        </button>
      </div>
      <input type="file" id="import-file" accept=".json,.csv" style="display: none">
    </div>
  `,

  complete: () => `
    <div class="screen active" id="complete-screen" style="justify-content: center;">
      <div class="empty-state">
        <div class="empty-state-icon" style="color: var(--success); transform: scale(1.5);">
          ${Icons.check}
        </div>
        <div class="empty-state-title" style="font-size: 1.5rem;">Session Complete!</div>
        <div class="empty-state-text" id="next-review-info" style="margin-bottom: 32px;">Great job. Come back tomorrow for more.</div>
        <button class="btn btn-primary" id="btn-complete-home">Return Home</button>
      </div>
    </div>
  `
};

// App Methods
const app = {
  async init() {
    await cards.initializeVocabulary();
    this.navigate('home');
    window.app = this;
  },

  navigate(screen) {
    state.currentScreen = screen;
    state.isFlipped = false;
    const appRoot = document.getElementById('app');
    appRoot.innerHTML = screens[screen]();
    this.bindScreenEvents(screen);

    if (screen === 'home') {
      this.loadStats();
    } else if (screen === 'list') {
      this.loadCardsList();
    } else if (screen === 'settings') {
      this.loadStorageUsage();
    }
  },

  bindScreenEvents(screen) {
    if (screen === 'home') {
      document.getElementById('btn-settings')?.addEventListener('click', () => this.navigate('settings'));
      document.getElementById('btn-start-review')?.addEventListener('click', () => this.startReview());
      document.getElementById('btn-add')?.addEventListener('click', () => this.navigate('add'));
      document.getElementById('btn-list')?.addEventListener('click', () => this.navigate('list'));
      return;
    }

    if (screen === 'review') {
      document.getElementById('btn-exit-review')?.addEventListener('click', () => this.exitReview());
      document.getElementById('flashcard')?.addEventListener('click', () => this.flipCard());

      const ratingButtons = document.getElementById('rating-buttons');
      if (ratingButtons) {
        ratingButtons.addEventListener('click', (event) => {
          const button = event.target.closest('.rating-btn');
          if (!button) return;
          const rating = Number(button.dataset.rating);
          if (Number.isNaN(rating)) return;
          this.rateCard(rating);
        });
      }
      return;
    }

    if (screen === 'list') {
      document.getElementById('btn-list-back')?.addEventListener('click', () => this.navigate('home'));

      const searchInput = document.getElementById('search-input');
      searchInput?.addEventListener('input', () => this.searchCards());

      const filterTabs = document.getElementById('filter-tabs');
      filterTabs?.addEventListener('click', (event) => {
        const button = event.target.closest('.filter-tab');
        if (!button) return;
        this.filterByTag(button.dataset.tag);
      });

      const cardsList = document.getElementById('cards-list');
      cardsList?.addEventListener('click', (event) => this.handleListContainerClick(event));
      return;
    }

    if (screen === 'add') {
      document.getElementById('btn-cancel-edit')?.addEventListener('click', () => this.cancelEdit());
      document.getElementById('btn-save-card')?.addEventListener('click', () => this.saveCard());
      document.getElementById('btn-delete-card')?.addEventListener('click', () => this.deleteCurrentCard());
      this.populateEditForm();
      return;
    }

    if (screen === 'settings') {
      document.getElementById('btn-settings-back')?.addEventListener('click', () => this.navigate('home'));
      document.getElementById('btn-export-backup')?.addEventListener('click', () => this.exportFullBackup());
      document.getElementById('btn-export-words')?.addEventListener('click', () => this.exportWordList());
      document.getElementById('btn-import-data')?.addEventListener('click', () => this.importData());
      document.getElementById('btn-reset-progress')?.addEventListener('click', () => this.resetProgress());

      const slider = document.getElementById('new-cards-slider');
      slider?.addEventListener('input', () => this.updateNewCardsLimit());

      const importFile = document.getElementById('import-file');
      importFile?.addEventListener('change', (event) => this.handleImport(event));
      return;
    }

    if (screen === 'complete') {
      document.getElementById('btn-complete-home')?.addEventListener('click', () => this.navigate('home'));
    }
  },

  populateEditForm() {
    const wordInput = document.getElementById('input-word');
    const translationInput = document.getElementById('input-translation');
    const exampleInput = document.getElementById('input-example');
    const pronunciationInput = document.getElementById('input-pronunciation');
    const tagSelect = document.getElementById('input-tag');
    const deleteButton = document.getElementById('btn-delete-card');
    const title = document.getElementById('add-title');

    if (state.editingCard) {
      if (title) title.textContent = 'Edit Word';
      if (wordInput) wordInput.value = state.editingCard.word || '';
      if (translationInput) translationInput.value = state.editingCard.translation || '';
      if (exampleInput) exampleInput.value = state.editingCard.example || '';
      if (pronunciationInput) pronunciationInput.value = state.editingCard.pronunciation || '';

      if (tagSelect) {
        tagSelect.value = state.editingCard.tags?.[0] || 'user-added';
      }

      deleteButton?.classList.remove('hidden');
    } else {
      if (title) title.textContent = 'New Word';
      if (wordInput) wordInput.value = '';
      if (translationInput) translationInput.value = '';
      if (exampleInput) exampleInput.value = '';
      if (pronunciationInput) pronunciationInput.value = '';
      if (tagSelect) tagSelect.value = 'user-added';
      deleteButton?.classList.add('hidden');
    }
  },

  async handleListContainerClick(event) {
    const deleteButton = event.target.closest('[data-action="delete-card"]');
    if (deleteButton) {
      event.stopPropagation();
      const cardId = deleteButton.dataset.id;
      if (!cardId) return;

      if (confirm('Delete this word?')) {
        await cards.deleteCard(cardId);
        this.showToast('Word deleted');
        this.loadCardsList(state.listFilter, state.listQuery);
      }
      return;
    }

    const item = event.target.closest('.list-item');
    if (item?.dataset.id) {
      this.editCard(item.dataset.id);
    }
  },

  async loadStats() {
    const stats = await cards.getStats();
    setText(document.getElementById('stat-due'), stats.dueToday);
    setText(document.getElementById('stat-new'), `${stats.newCards.studied}/${stats.newCards.limit}`);
    setText(document.getElementById('stat-total'), stats.totalCards);
  },

  async startReview() {
    state.reviewSession = await cards.getReviewSession();
    state.currentCardIndex = 0;

    if (state.reviewSession.length === 0) {
      this.navigate('complete');
      return;
    }

    this.navigate('review');
    this.showCurrentCard();
  },

  showCurrentCard() {
    const card = state.reviewSession[state.currentCardIndex];
    if (!card) {
      this.navigate('complete');
      return;
    }

    // Update progress
    const progress = (state.currentCardIndex / state.reviewSession.length) * 100;
    document.getElementById('review-progress').style.width = `${progress}%`;
    setText(
      document.getElementById('review-count'),
      `${state.currentCardIndex + 1} / ${state.reviewSession.length}`
    );

    // Update card content
    setText(document.getElementById('card-word'), card.word);
    setText(document.getElementById('card-pronunciation'), card.pronunciation || '');
    setText(document.getElementById('card-translation'), card.translation);
    setText(document.getElementById('card-example'), card.example || '');

    // Reset flip state (Soft Focus)
    state.isFlipped = false;
    document.getElementById('flashcard').classList.remove('revealed');
    document.getElementById('rating-buttons').classList.remove('visible');

    // Update interval previews
    const previews = getIntervalPreview(card);
    setText(document.getElementById('interval-again'), formatInterval(previews.again));
    setText(document.getElementById('interval-hard'), formatInterval(previews.hard));
    setText(document.getElementById('interval-good'), formatInterval(previews.good));
    setText(document.getElementById('interval-easy'), formatInterval(previews.easy));
  },

  flipCard() {
    if (!state.isFlipped) {
      state.isFlipped = true;
      document.getElementById('flashcard').classList.add('revealed');
      document.getElementById('rating-buttons').classList.add('visible');
    }
  },

  async rateCard(rating) {
    const card = state.reviewSession[state.currentCardIndex];
    await cards.reviewCard(card, rating);

    // If "Again", add card back to end of session
    if (rating === 0) {
      state.reviewSession.push(card);
    }

    state.currentCardIndex++;

    if (state.currentCardIndex >= state.reviewSession.length) {
      this.navigate('complete');
    } else {
      this.showCurrentCard();
    }
  },

  exitReview() {
    if (confirm('Exit review session?')) {
      this.navigate('home');
    }
  },

  async loadCardsList(filter = 'all', query = '') {
    state.listFilter = filter;
    state.listQuery = query;

    let cardsList;

    if (query) {
      cardsList = await cards.searchCards(query);
    } else if (filter !== 'all') {
      cardsList = await cards.getCardsByTag(filter);
    } else {
      cardsList = await cards.getAllCards();
    }

    const container = document.getElementById('cards-list');
    if (!container) return;

    if (cardsList.length === 0) {
      this.renderEmptyList(container);
      return;
    }

    const fragment = document.createDocumentFragment();
    cardsList.forEach(card => fragment.appendChild(this.buildListItem(card)));
    container.replaceChildren(fragment);
  },

  buildListItem(card) {
    const item = el('div', { className: 'list-item', attrs: { 'data-id': card.id } });
    const content = el('div', { className: 'list-item-content' });
    const title = el('div', { className: 'list-item-title', text: card.word });
    const subtitle = el('div', { className: 'list-item-subtitle', text: card.translation });
    content.append(title, subtitle);

    const tagsWrapper = el('div', { className: 'list-item-tags' });
    const tags = Array.isArray(card.tags) ? card.tags : (card.tags ? [card.tags] : []);
    tags.forEach(tag => {
      const safeTag = String(tag ?? '').trim();
      if (!safeTag) return;
      tagsWrapper.appendChild(el('span', { className: 'tag', text: safeTag }));
    });

    // Using a simpler delete approach for the list view
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'header-btn'; // Reusing header button style for icon only
    deleteBtn.innerHTML = Icons.trash;
    deleteBtn.style.color = 'var(--text-tertiary)';
    deleteBtn.dataset.action = 'delete-card';
    deleteBtn.dataset.id = card.id;
    deleteBtn.onclick = (e) => { // Prevent item click
      // Handled by container delegate but we stop propagation here just in case? 
      // No, delegate is improved.
    };

    const action = el('div', { className: 'list-item-action' });
    action.innerHTML = Icons.chevronRight;
    action.style.color = 'var(--text-tertiary)';

    // Layout: content | tags | action
    // We'll skip the inline delete button in list view to keep it clean, relying on Edit screen to delete.
    // Or we can add it. Let's stick to the design which implies clean rows.
    // Actually, let's keep it simple: Click to edit.

    item.append(content, tagsWrapper, action);
    return item;
  },

  renderEmptyList(container) {
    const emptyState = el('div', { className: 'empty-state' });
    emptyState.innerHTML = `
      <div class="empty-state-icon">${Icons.empty}</div>
      <div class="empty-state-title">No Words Found</div>
      <div class="empty-state-text">Tap the + button to add new vocabulary.</div>
    `;
    container.replaceChildren(emptyState);
  },

  searchCards() {
    const query = document.getElementById('search-input').value;
    this.loadCardsList('all', query);
  },

  filterByTag(tag) {
    document.querySelectorAll('.filter-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    this.loadCardsList(tag);
  },

  async editCard(id) {
    const allCards = await cards.getAllCards();
    state.editingCard = allCards.find(c => c.id === id);
    this.navigate('add');
  },

  cancelEdit() {
    state.editingCard = null;
    this.navigate(state.currentScreen === 'add' ? 'list' : 'home');
  },

  async saveCard() {
    const word = document.getElementById('input-word').value.trim();
    const translation = document.getElementById('input-translation').value.trim();
    const example = document.getElementById('input-example').value.trim();
    const pronunciation = document.getElementById('input-pronunciation').value.trim();
    const tag = document.getElementById('input-tag').value;

    if (!word || !translation) {
      this.showToast('Word and translation required');
      return;
    }

    try {
      if (state.editingCard) {
        await cards.updateCard({
          ...state.editingCard,
          word, translation, example, pronunciation,
          tags: [tag]
        });
        this.showToast('Word updated');
      } else {
        await cards.addUserCard({
          word, translation, example, pronunciation,
          tags: [tag]
        });
        this.showToast('Word added');
      }
    } catch (error) {
      this.showToast(error.message || 'Save failed');
      return;
    }

    state.editingCard = null;
    this.navigate('list');
  },

  async deleteCurrentCard() {
    if (state.editingCard && confirm('Delete this word?')) {
      await cards.deleteCard(state.editingCard.id);
      state.editingCard = null;
      this.showToast('Word deleted');
      this.navigate('list');
    }
  },

  updateNewCardsLimit() {
    const value = document.getElementById('new-cards-slider').value;
    document.getElementById('new-cards-value').textContent = value;
    settings.setNewCardsPerDay(parseInt(value, 10));
  },

  async loadStorageUsage() {
    const usage = await settings.getStorageUsage();
    if (usage) {
      document.getElementById('storage-usage').textContent =
        `${usage.usedFormatted} / ${usage.quotaFormatted}`;
    } else {
      document.getElementById('storage-usage').textContent = 'Unknown';
    }
  },

  async exportFullBackup() {
    const data = await cards.exportCards(true);
    this.downloadJSON(data, 'vocabmaster-backup.json');
    this.showToast('Backup downloaded');
  },

  async exportWordList() {
    const data = await cards.exportCards(false);
    this.downloadJSON(data, 'vocabmaster-words.json');
    this.showToast('List downloaded');
  },

  downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData() {
    document.getElementById('import-file').click();
  },

  async handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const { cards: parsedCards, errors } = parseFile(text, file.name);

      if (!Array.isArray(parsedCards) || parsedCards.length === 0) {
        throw new Error('No words found');
      }

      const preview = generatePreview(parsedCards);
      const previewText = preview.preview.join(', ');
      const errorNotice = errors.length ? `\nSkipping ${errors.length} errors.` : '';

      if (confirm(`Import ${preview.total} words?${errorNotice}\nPreview: ${previewText}`)) {
        const result = await cards.importCards(parsedCards);
        this.showToast(`Imported: ${result.added}, Skipped: ${result.skipped}`);
        this.loadStorageUsage();
      }
    } catch (error) {
      this.showToast('Import failed: ' + error.message);
    }

    event.target.value = '';
  },

  async resetProgress() {
    if (confirm('⚠️ Reset ALL progress and data?')) {
      if (confirm('Are you sure? This cannot be undone.')) {
        await clearAllCards();
        settings.resetAllSettings();
        await cards.initializeVocabulary();
        this.showToast('App reset complete');
        this.navigate('home');
      }
    }
  },

  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  app.init().catch((error) => {
    console.error('App initialization failed:', error);
    const appRoot = document.getElementById('app');
    if (appRoot) {
      const errorState = el('div', { className: 'empty-state' });
      errorState.innerHTML = `
        <div class="empty-state-icon">${Icons.warning}</div>
        <div class="empty-state-title">Initialization Failed</div>
        <div class="empty-state-text">Please refresh the page.</div>
      `;
      appRoot.replaceChildren(errorState);
    }
  });
});
