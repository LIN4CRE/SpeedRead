<div align="center">

<img src="./public/banner.svg" alt="Kinetic RSVP Speed Reader Pro Banner" width="100%" />

# Kinetic RSVP Speed Reader Pro

**Read full books at 600+ WPM with frictionless Rapid Serial Visual Presentation (RSVP) & Optimal Recognition Point (ORP) tracking.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Formats](https://img.shields.io/badge/Formats-PDF%20%7C%20ePub%20%7C%20TXT-emerald.svg)](#supported-formats)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Client--Side-rose.svg)](#privacy--security)

[Live Demo](https://ais-pre-oxqz67m22d52nzjusqj4xj-183479119885.europe-west2.run.app) · [Features](#key-features) · [The Science](#the-science-of-rsvp) · [Keyboard Shortcuts](#keyboard-shortcuts) · [Free Ebooks](#free-ebooks-directory) · [Installation](#getting-started)

</div>

---

## ⚡ The Problem: Why Traditional Reading is Slow

When reading a physical book or standard screen, your eyes don't glide smoothly—they execute rapid, jerky jumps called **saccades**. 

- **Fixation Overhead:** Your eyes stop on each word cluster for 200–250ms.
- **Involuntary Regressions:** Up to **20%** of reading time is wasted on unconscious backward eye skips to re-read words.
- **Subvocalization Bottleneck:** Traditional reading forces you to pronounce every syllable in your head, limiting speed to human talking speed (~200–250 WPM).

## 🎯 The Solution: Stationary ORP Reticle

**Rapid Serial Visual Presentation (RSVP)** eliminates eye movement altogether. By flashing words sequentially at a fixed physical coordinate:
1. **Your eyes remain completely still**, eliminating ocular fatigue and saccadic travel time.
2. Every word is mathematically centered on its **Optimal Recognition Point (ORP)**—the physiological sweet spot (approx. 35% into the word) where the visual cortex recognizes word morphology instantly.
3. The ORP letter is locked in place between **vertical notch ticks** and highlighted in vibrant red, allowing your brain to process vocabulary directly into ideas at **600 to 1,000+ words per minute**.

---

## ✨ Key Features

### 🎬 Cinematic Video-Style Reticle (As Seen on Speed Reading Challenges)
- **Letterbox Slot Mode:** Pitch black OLED background (`#000000`) framed by top and bottom guidelines.
- **Precision Notch Ticks:** Upper tick descending and lower tick ascending to frame the focal character with zero jitter.
- **Corner Velocity Indicator:** Discrete `{wpm} wpm` badge in the corner.
- **Tap Anywhere to Play/Pause:** Tap the reader box to toggle flow on touchscreens.

### 📚 Full Book Support: PDF & ePub Ingestion
- **Native PDF Parsing (`pdfjs-dist`):** Extracts text page-by-page, extracts titles and metadata, and provides page jumps.
- **Native ePub Parsing (`jszip`):** Parses ePub packages directly in the browser, cleans HTML boilerplate, preserves chapter titles, and generates a Table of Contents.
- **Drag-and-Drop Anywhere:** Drag any `.pdf`, `.epub`, or `.txt` file onto the window to begin reading immediately.
- **Clipboard Paste:** Paste essays, articles, or news snippets with instant word count analysis.
- **Persistent Bookmarks:** Automatically saves your reading position, chapter, and speed in `localStorage` so you can finish full novels over multiple sessions.

### 🎨 Custom Themes & Visual Customization
- **8 Themes:** Void Obsidian, OLED Pure Black, Warm Parchment (traditional book paper), Solarized Dark, Solarized Cream, Nordic Frost, Midnight Emerald, and Clean Studio White.
- **9 Focal Accent Swatches:** Crimson Neon, Sunset Coral, Amber Gold, Emerald Mint, Electric Cyan, Cobalt Blue, Vibrant Violet, Hot Magenta, and Optic White.
- **6 Typefaces:** *Merriweather* (book serif), *JetBrains Mono*, *Fira Code*, *Space Mono*, *Inter*, and *Atkinson Hyperlegible* (engineered by the Braille Institute for high character distinction and dyslexia).
- **Adjustable Reticle Guides:** Video Slot, Classic Ticks, Crosshairs, Brackets, Laser Beam, or Minimal Dot.

### 🧠 Intelligent Pacing Engine
Reading speed isn't robotic—the brain needs microscopic pauses to synthesize clauses:
- **Sentence End Pause (. ! ?):** Configurable 2.5x multiplier.
- **Clause Pause (, ; : —):** Configurable 1.7x multiplier.
- **Long Word Modifier (>8 chars):** Micro-delay for complex morphological decoding.
- **Numeric Sequences:** Delay multiplier for numbers and currency.
- **Paragraph Transition Pause:** Pacing cushion between paragraphs.

### 🔍 Synchronized Context Peek (`C` Key)
Lost your train of thought? Toggle the **Context Peek window** to view the active paragraph in real-time with your current word highlighted, and click any word to seek immediately.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| <kbd>Space</kbd> | Play / Pause reading flow |
| <kbd>←</kbd> / <kbd>→</kbd> | Step backward / forward 10 words |
| <kbd>Shift</kbd> + <kbd>←</kbd> | Jump back to the beginning of current sentence |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Increase / decrease speed by 25 WPM |
| <kbd>C</kbd> | Toggle synchronized paragraph Context Peek |
| <kbd>F</kbd> | Toggle full-screen Zen reading mode |
| <kbd>T</kbd> | Cycle next color theme |
| <kbd>R</kbd> | Restart document from the beginning |
| <kbd>Esc</kbd> | Close modals / exit fullscreen |

---

## 📖 Supported Formats

| Format | Extensions | Features Supported |
|:---|:---|:---|
| **ePub** | `.epub` | Spine ordering, Table of Contents, chapter jumps, clean text extraction |
| **PDF** | `.pdf` | Page-by-page extraction, page navigation, metadata title/author |
| **Plain Text** | `.txt`, `.md` | Paragraph segmentation, instant tokenization |
| **Clipboard** | Copy / Paste | Real-time word count and reading time estimator |

---

## 🌐 Free Ebooks Directory

Looking for books to read? The app includes a built-in directory linking to over 70,000+ free digital books:

1. **[Standard Ebooks](https://standardebooks.org):** Free, beautifully typeset public domain ebooks (e.g. *Frankenstein*, *Sherlock Holmes*, *The Great Gatsby*).
2. **[Project Gutenberg](https://www.gutenberg.org):** 70,000+ free ebooks across world literature.
3. **[Open Library](https://openlibrary.org):** Millions of books available for digital lending and downloads.
4. **[ManyBooks](https://manybooks.net):** 50,000+ free books across genres (Sci-Fi, Fantasy, Mystery).
5. **[Planet eBook](https://www.planetebook.com):** Handcrafted classic novels formatted for e-readers.

*To read any book:* Download the `.epub` or `.pdf` file from any of the sites above, drag and drop it into Kinetic RSVP Reader, and read at 600 WPM!

---

## 🔒 Privacy & Security

- **100% Client-Side Processing:** All PDF and ePub parsing happens locally in your browser using JavaScript Web APIs and WebAssembly.
- **Zero Cloud Uploads:** No books or reading texts are ever transmitted to any remote server or third-party service.
- **Local Persistence:** Bookmarks and configuration are stored exclusively in your browser's private `localStorage`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/kinetic-rsvp-speed-reader.git

# Navigate to the project directory
cd kinetic-rsvp-speed-reader

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will launch at `http://localhost:3000`.

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Architecture & Tech Stack

```
kinetic-rsvp-speed-reader/
├── public/
│   ├── banner.svg            # High-resolution vector repository banner
│   └── favicon.svg           # High-DPI ORP vector favicon
├── src/
│   ├── components/
│   │   ├── ReticleDisplay.tsx       # Core RSVP viewer with ORP fixed-axis pinning
│   │   ├── Controls.tsx             # Playback bar, velocity scrubber, speed dial
│   │   ├── DocumentDrawer.tsx       # PDF/ePub file loader, chapters & history
│   │   ├── SettingsModal.tsx        # Typography, theme & pacing engine tuning
│   │   ├── FreeBooksModal.tsx       # Curated directory of free ebook archives
│   │   ├── ContextPeek.tsx          # Real-time synchronized paragraph drawer
│   │   └── KeyboardShortcutsModal.tsx # Hotkey cheat sheet
│   ├── utils/
│   │   ├── orp.ts                   # Optimal Recognition Point calculation & cadence
│   │   ├── pdfParser.ts             # Client-side PDF.js text extractor
│   │   ├── epubParser.ts            # Client-side JSZip ePub archive reader
│   │   ├── sampleTexts.ts           # Preloaded public domain classic books
│   │   ├── storage.ts               # LocalStorage bookmark and settings persistence
│   │   └── themes.ts                # 8 Curated color themes and focal accents
│   ├── types/
│   │   └── reader.ts                # TypeScript interfaces
│   ├── App.tsx                      # Root application coordinating state & hotkeys
│   ├── main.tsx                     # React 19 entry point
│   └── index.css                    # Tailwind CSS v4 styling & animations
└── package.json
```

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
