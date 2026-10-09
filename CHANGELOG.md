# Changelog

All notable changes to **SpeedRead (Kinetic RSVP Speed Reader)** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-09

### Added
- **Multi-Word Saccadic Chunking (1, 2, 3 Words):** Support for reading 1, 2, or 3 words simultaneously. Word pairs render with dual focal markers; trios render with stationary center anchoring. Pacing delays automatically scale (0.90x for 2w, 0.85x for 3w) for enhanced cognitive throughput. Includes quick cycle toolbar button and <kbd>W</kbd> keyboard shortcut.
- **Offline PWA Service Worker:** `public/sw.js` with Cache-First strategy for Google Web Fonts, Stale-While-Revalidate for JS/CSS chunks, and offline navigation fallback.
- **Mobile Touch Gesture Navigation:**
  - Horizontal swipe left/right (±10 words).
  - Vertical edge drag (±25 WPM) with haptic vibration feedback (`navigator.vibrate`).
  - Pinch-to-scale font size dynamically on the reader letterbox.
  - Two-finger tap to toggle playback without covering text.
- **Dyslexia Focus Ruler:** High-contrast reading highlight band in typography settings to eliminate visual line drift.
- **Bionic Reading Preview:** Fixation character bolding in synchronized Context Peek (`partitionBionicWord`) to accelerate peripheral context absorption.
- **Expanded Test Suite:** Added unit test suites `tests/bionic.test.ts` and `tests/chunking.test.ts`, raising total test coverage to 48 passing tests.

---

## [1.0.0] - 2026-10-09

### Added
- **Audio Cadence Metronome (`AudioPacer`):** Built-in Web Audio API micro-acoustic click ticker (<kbd>M</kbd> shortcut) providing rhythm pacing up to 1,200 WPM without audio latency.
- **Automated Vitest Test Suite:** Added 26 unit tests covering ORP focal indexing, punctuation delays, Unicode tokenization, cookie resilience, and audio pacer state.
- **Rollup Vendor Chunking:** Code splitting in `vite.config.ts` separating `pdfjs-dist`, `recharts`, and `jszip` into asynchronous chunks (56.8% reduction in initial bundle size).
- **Universal Relative Base (`./`):** Enables out-of-the-box hosting on root domains, subdirectories (GitHub Pages), and static previews.
- **Continuous Integration Pipeline:** Automated GitHub Actions workflows for testing, linting, building, and deployment (`.github/workflows/ci.yml`, `deploy.yml`).
- **Open Source Community Infrastructure:** Contributor guide, Code of Conduct, Security policy, EditorConfig, Prettier, Vercel/Netlify configs, and Issue/PR templates.
- **PWA Manifest & Metadata:** Added `manifest.json` and mobile app icons.

### Fixed
- **Focal Jitter in RSVP Reticle:** Replaced variable-width flexbox layout with an absolute-anchored 40% focal axis (`left: 40%; -translate-x-1/2` with fixed `0.28ch` wing padding), achieving `0.00px` horizontal drift across all words and fonts.
- **Unicode & Diacritics Truncation:** Replaced ASCII-limited `\w` in `calculateORP` and `tokenizeText` with Unicode property escapes `\p{L}\p{N}` (`/gu`), fixing truncation of accented words (`café`, `résumé`, `Über`).
- **Em-Dash Pacing:** Added regex normalization for compound words connected by unspaced em-dashes (`word—another`).
- **EPUB Parser Path Resolution:** Added `normalizeZipPath` resolving `../` parent relative paths and case-insensitive fallback matching for complex EPUB spine manifests.
- **Speech Synthesis Daemon Crashing:** Clamped maximum rate to 2.5 and added 120ms debounce to prevent browser speech queue deadlock at 600+ WPM.
- **Third-Party Cookie `URIError`:** Isolated `decodeURIComponent` exclusively to targeted cookie values in `cookieUtils.ts`.
- **React DOM Warning:** Fixed `stop-color` invalid DOM property (`stopColor`) in `ReadingInsightsModal.tsx`.
- **Build Install Conflicts:** Removed conflicting `esbuild 0.25` and corrected TypeScript version to `^5.7.3`.
- **Cross-Platform Script:** Replaced Unix-only `rm -rf` in clean script with cross-platform Node.js `fs.rmSync`.

### Removed
- **Redundant Code:** Removed 28 KB obsolete `DocumentDrawer.tsx` superseded by `Sidebar.tsx`.
- **Copyrighted Text:** Replaced in-copyright *Harry Potter* excerpt with Mary Shelley's public-domain *Frankenstein*.
- **Unused Cloud Dependencies:** Removed unused `@google/genai`, `dotenv`, `express`, `@types/express`, and `tsx`.
