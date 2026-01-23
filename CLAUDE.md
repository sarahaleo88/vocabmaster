# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a multi-project monorepo containing:
- **tea-shop/**: Vite-based vanilla JS web application (Aether Tea House branding site)
- **vocabmaster/**: Cross-platform vocabulary flashcard app (Vite + Capacitor for Android)
- **docs/plans/**: Design specifications and planning documents
- **.claude/skills/**: Custom Claude skills (UI/UX Pro Max design system)

## Development Commands

### Tea Shop

```bash
cd tea-shop
npm install
npm run dev      # Dev server at localhost:5173
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### VocabMaster

```bash
cd vocabmaster
npm install
npm run dev      # Dev server at localhost:5173
npm run build    # Build for production

# Android deployment (requires Android Studio)
npx cap sync           # Sync web assets to Android
npx cap open android   # Open in Android Studio, then build APK
```

## Architecture

### Tea Shop (`tea-shop/`)

**Tech Stack**: Vite 7.x + Vanilla JavaScript (ES modules) + CSS3

**Design System** (defined in `src/style.css`):
- CSS custom properties for theming (dark theme with pale gold accent `#d4c5a3`)
- Typography: Cormorant Garamond (display) + Montserrat (body)
- Custom easing: `--ease-out-expo` for animations

**Key Patterns**:
- **Scroll Animations**: IntersectionObserver triggers `.reveal` → `.active` transitions at 10% visibility
- **Parallax**: Scroll-driven `translateY` transforms on `.parallax-img` elements within their parent bounds
- **Layout**: Full-viewport sections, CSS Grid for multi-column content, Flexbox for navigation
- **Visual Effects**: SVG fractal noise texture overlay (5% opacity), radial gradients, `mix-blend-mode: difference` on fixed nav

### VocabMaster (`vocabmaster/`)

**Tech Stack**: Vite 7.x + Vanilla JavaScript + Capacitor 8.x + IndexedDB (via `idb`)

**App Purpose**: SM-2 spaced repetition vocabulary learning for Chinese speakers learning English. 800 built-in words (general + programming vocabulary).

**Core Modules** (in `src/js/`):
- `db.js` - IndexedDB wrapper using `idb` library
- `sm2.js` - SM-2 spaced repetition algorithm (EF calculation, interval scheduling)
- `cards.js` - Card CRUD operations, due card queries
- `importer.js` - CSV/JSON import with duplicate detection
- `settings.js` - User preferences (daily limits, notifications)
- `app.js` - Hash-based routing between screens

**Data Model** (Card schema):
```javascript
{
  id, word, translation, example, pronunciation, tags,
  easiness,      // SM-2 easiness factor (min 1.3)
  interval,      // Days until next review
  repetitions,   // Successful review count
  nextReview,    // ISO date string
  createdAt, isBuiltIn
}
```

**SM-2 Algorithm** (`sm2.js`):
- Quality ratings 0-3 (Forgot, Hard, Good, Easy)
- EF adjustment: `EF = EF + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02))`
- Minimum EF: 1.3
- Interval progression: 1 day → 6 days → interval × EF

**Built-in Data**: `src/data/vocabulary.json` contains 800 words across 8 batches

**Android Project**: `android/` directory with Capacitor configuration, Gradle build (8.14.3), and app resources

**Entry Points**:
- `index.html` - Main app shell
- `src/js/app.js` - Application entry and routing
- `capacitor.config.json` - Android app config (com.vocabmaster.app)

## Design System

The `.claude/skills/ui-ux-pro-max/` directory contains a comprehensive design system with:
- CSV-based data files for colors, typography, styles, charts
- Python scripts for searching design recommendations
- Stack-specific guidance (React, Vue, Svelte, Flutter, etc.)

Query the design system:
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "keyword" --design-system
```
