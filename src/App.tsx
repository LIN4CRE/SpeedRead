import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  BookOpen, 
  Sliders, 
  Keyboard, 
  Maximize, 
  Minimize, 
  Sun, 
  Moon, 
  Upload,
  FileUp,
  FileText,
  Sparkles,
  Zap,
  Loader2,
  Globe
} from 'lucide-react';
import { 
  DocumentSource, 
  TypographySettings, 
  ThemeColors, 
  PacingConfig, 
  SavedBookmark 
} from './types/reader';
import { computeWordDelay, tokenizeText } from './utils/orp';
import { parsePdfFile } from './utils/pdfParser';
import { parseEpubFile } from './utils/epubParser';
import { THEMES } from './utils/themes';
import { 
  loadSettings, 
  saveSettings, 
  loadThemeId, 
  saveThemeId, 
  loadPacing, 
  savePacing,
  loadBookmarks,
  saveBookmark,
  removeBookmark,
  loadCustomAccent,
  saveCustomAccent,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_PACING
} from './utils/storage';
import { SAMPLE_LIBRARY, createDocumentFromSample } from './utils/sampleTexts';
import { ReticleDisplay } from './components/ReticleDisplay';
import { Controls } from './components/Controls';
import { SettingsModal } from './components/SettingsModal';
import { DocumentDrawer } from './components/DocumentDrawer';
import { ContextPeek } from './components/ContextPeek';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FreeBooksModal } from './components/FreeBooksModal';

export default function App() {
  // 1. Settings & Persistence State
  const [typography, setTypography] = useState<TypographySettings>(() => {
    const s = loadSettings();
    const customAccent = loadCustomAccent();
    if (customAccent) s.highlightColor = customAccent;
    return s;
  });

  const [themeId, setThemeId] = useState<string>(() => loadThemeId());
  const [pacing, setPacing] = useState<PacingConfig>(() => loadPacing());
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>(() => loadBookmarks());

  // 2. Document & Playback State - starts with 600 WPM
  const [activeDoc, setActiveDoc] = useState<DocumentSource>(() => {
    return createDocumentFromSample(SAMPLE_LIBRARY[0]);
  });

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [wpm, setWpm] = useState<number>(600); // 600 WPM default matching the video & user goal

  // 3. UI Dialog States
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isContextPeekOpen, setIsContextPeekOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFreeBooksOpen, setIsFreeBooksOpen] = useState<boolean>(false);

  // 4. Drag & Drop state for effortless book addition
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isDroppingAndParsing, setIsDroppingAndParsing] = useState<boolean>(false);
  const [dropStatus, setDropStatus] = useState<string>('');

  // 5. Timer Reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTheme: ThemeColors = THEMES[themeId] || THEMES.oled;

  // Persist typography changes
  const handleUpdateTypography = (newSettings: TypographySettings) => {
    setTypography(newSettings);
    saveSettings(newSettings);
  };

  // Persist theme changes
  const handleSelectTheme = (newThemeId: string) => {
    setThemeId(newThemeId);
    saveThemeId(newThemeId);
  };

  // Persist accent changes
  const handleSelectAccent = (accent: string) => {
    saveCustomAccent(accent);
  };

  // Persist pacing changes
  const handleUpdatePacing = (newPacing: PacingConfig) => {
    setPacing(newPacing);
    savePacing(newPacing);
  };

  // Cycle through themes quickly
  const cycleTheme = useCallback(() => {
    const themeKeys = Object.keys(THEMES);
    const currentIndex = themeKeys.indexOf(themeId);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    handleSelectTheme(themeKeys[nextIndex]);
  }, [themeId]);

  // Update bookmark for current document
  const recordBookmark = useCallback((doc: DocumentSource, index: number, speed: number) => {
    if (!doc || doc.totalWords === 0) return;
    const bm: SavedBookmark = {
      documentId: doc.id,
      title: doc.title,
      type: doc.type,
      lastWordIndex: index,
      totalWords: doc.totalWords,
      wpm: speed,
      lastReadTimestamp: Date.now(),
    };
    saveBookmark(bm);
    setBookmarks(loadBookmarks());
  }, []);

  // Handle document switch
  const handleSelectDocument = (newDoc: DocumentSource, startWordIndex = 0) => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setActiveDoc(newDoc);
    setCurrentWordIndex(startWordIndex);
    recordBookmark(newDoc, startWordIndex, wpm);
  };

  const handleRemoveBookmark = (docId: string) => {
    removeBookmark(docId);
    setBookmarks(loadBookmarks());
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (activeDoc.words.length === 0) return;

    if (isPlaying) {
      setIsPlaying(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      recordBookmark(activeDoc, currentWordIndex, wpm);
    } else {
      // If at end, wrap to start
      if (currentWordIndex >= activeDoc.words.length - 1) {
        setCurrentWordIndex(0);
      }
      setIsPlaying(true);
    }
  }, [activeDoc, isPlaying, currentWordIndex, wpm, recordBookmark]);

  // Step forward or backward by words
  const stepWords = useCallback((delta: number) => {
    setCurrentWordIndex((prev) => {
      const next = Math.max(0, Math.min(activeDoc.words.length - 1, prev + delta));
      return next;
    });
  }, [activeDoc.words.length]);

  // Jump to previous sentence
  const jumpPrevSentence = useCallback(() => {
    if (currentWordIndex <= 0) return;
    
    let target = currentWordIndex - 1;
    if (target > 0 && activeDoc.words[target].isSentenceEnd) {
      target--;
    }
    
    while (target > 0 && !activeDoc.words[target].isSentenceEnd) {
      target--;
    }

    const newIndex = target > 0 ? target + 1 : 0;
    setCurrentWordIndex(newIndex);
  }, [currentWordIndex, activeDoc.words]);

  // Reset to beginning
  const resetPlayback = useCallback(() => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentWordIndex(0);
  }, []);

  // Main RSVP loop execution
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (currentWordIndex >= activeDoc.words.length) {
      setIsPlaying(false);
      recordBookmark(activeDoc, currentWordIndex, wpm);
      return;
    }

    const currentWord = activeDoc.words[currentWordIndex];
    const delay = computeWordDelay(currentWord, wpm, pacing);

    timerRef.current = setTimeout(() => {
      setCurrentWordIndex((prev) => {
        const next = prev + 1;
        if (next >= activeDoc.words.length) {
          setIsPlaying(false);
          recordBookmark(activeDoc, next, wpm);
          return prev;
        }
        return next;
      });
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentWordIndex, activeDoc, wpm, pacing, recordBookmark]);

  // Drag and Drop anywhere on screen
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    setIsDroppingAndParsing(true);
    try {
      if (fileName.endsWith('.pdf')) {
        setDropStatus('Extracting PDF book...');
        const doc = await parsePdfFile(file);
        handleSelectDocument(doc, 0);
      } else if (fileName.endsWith('.epub')) {
        setDropStatus('Unpacking ePub chapters...');
        const doc = await parseEpubFile(file);
        handleSelectDocument(doc, 0);
      } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        setDropStatus('Loading text...');
        const text = await file.text();
        const words = tokenizeText(text);
        const doc: DocumentSource = {
          id: `txt-${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, ''),
          type: 'txt',
          totalWords: words.length,
          chapters: [{ id: '1', title: 'Complete Text', startWordIndex: 0, wordCount: words.length }],
          rawText: text,
          words,
          dateAdded: Date.now(),
        };
        handleSelectDocument(doc, 0);
      }
    } catch (err) {
      console.error('Failed to parse dropped file:', err);
    } finally {
      setIsDroppingAndParsing(false);
      setDropStatus('');
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            jumpPrevSentence();
          } else {
            stepWords(-10);
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          stepWords(10);
          break;

        case 'ArrowUp':
          e.preventDefault();
          setWpm((prev) => Math.min(1200, prev + 25));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setWpm((prev) => Math.max(100, prev - 25));
          break;

        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            resetPlayback();
          }
          break;

        case 'KeyC':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsContextPeekOpen((prev) => !prev);
          }
          break;

        case 'KeyT':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            cycleTheme();
          }
          break;

        case 'KeyF':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;

        case 'Escape':
          setIsSettingsOpen(false);
          setIsLibraryOpen(false);
          setIsShortcutsOpen(false);
          if (window.document.fullscreenElement) {
            window.document.exitFullscreen().catch(() => null);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, jumpPrevSentence, stepWords, resetPlayback, cycleTheme]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => null);
    } else {
      window.document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => null);
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(window.document.fullscreenElement));
    };
    window.document.addEventListener('fullscreenchange', onFsChange);
    return () => window.document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Words for reticle
  const activeWord = activeDoc.words[currentWordIndex] || null;
  const previousWord = currentWordIndex > 0 ? activeDoc.words[currentWordIndex - 1] : null;
  const nextWord = currentWordIndex < activeDoc.words.length - 1 ? activeDoc.words[currentWordIndex + 1] : null;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen w-full flex flex-col justify-between transition-colors duration-200 select-none overflow-x-hidden font-sans relative"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.textBright,
      }}
    >
      {/* Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md border-4 border-dashed border-red-500/80 flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
          <Upload className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-2">Drop Your Book to Start Reading</h2>
          <p className="text-sm text-neutral-300 max-w-md">
            Release to parse PDF, ePub, or Text instantly at {wpm} WPM.
          </p>
        </div>
      )}

      {/* Parsing Drop Progress Overlay */}
      {isDroppingAndParsing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <Loader2 className="w-12 h-12 text-red-500 animate-spin mb-4" />
          <h3 className="text-xl font-bold text-white mb-1">{dropStatus || 'Preparing your reading flow...'}</h3>
          <p className="text-xs text-neutral-400">Extracting chapters and aligning Optimal Recognition Points...</p>
        </div>
      )}

      {/* 1. Header Bar */}
      <header
        className={`w-full border-b px-3 sm:px-8 py-3 flex items-center justify-between transition-all ${
          isFullscreen && isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        }`}
        style={{
          borderColor: currentTheme.border,
          backgroundColor: `${currentTheme.surface}99`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Brand & Book Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs tracking-wider"
            style={{
              backgroundColor: `${typography.highlightColor}22`,
              color: typography.highlightColor,
              border: `1px solid ${typography.highlightColor}44`,
            }}
          >
            ORP
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-xs sm:text-sm tracking-tight flex items-center gap-1.5 truncate">
              <span className="truncate">Kinetic RSVP</span>
              <span className="text-[9px] sm:text-[10px] font-mono px-1 py-0.2 rounded border shrink-0" style={{ borderColor: currentTheme.border, color: currentTheme.textDim }}>
                {wpm} WPM
              </span>
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] truncate" style={{ color: currentTheme.textDim }}>
              <span className="truncate max-w-[140px] sm:max-w-xs font-medium" style={{ color: currentTheme.textBright }}>
                {activeDoc.title}
              </span>
              <span aria-hidden="true">·</span>
              <span className="uppercase font-mono text-[10px] shrink-0">{activeDoc.type}</span>
            </div>
          </div>
        </div>

        {/* Top Actions: Free Books, Add Book, Shortcuts, Theme, Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setIsFreeBooksOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
            title="Browse 70,000+ Free Ebooks & EPUBs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Get Free Books</span>
            <span className="sm:hidden">Free</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm text-white"
            style={{
              backgroundColor: currentTheme.accent,
              borderColor: currentTheme.accent,
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Add Book</span>
          </button>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl border transition-all active:scale-95"
            style={{
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
              color: currentTheme.textDim,
            }}
            title="Cycle Next Theme (T)"
          >
            {currentTheme.isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsShortcutsOpen(true)}
            className="p-2 rounded-xl border transition-all active:scale-95 hidden md:flex"
            style={{
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
              color: currentTheme.textDim,
            }}
            title="Keyboard Shortcuts (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl border transition-all active:scale-95"
            style={{
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
              color: currentTheme.textDim,
            }}
            title="Typography & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Center Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center items-center gap-5 sm:gap-6">
        {/* Quick Reading Material Switcher (Dead simple 1-tap book starters!) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs select-none w-full">
          <button
            onClick={() => handleSelectDocument(createDocumentFromSample(SAMPLE_LIBRARY[0]), 0)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 text-xs ${
              activeDoc.id === SAMPLE_LIBRARY[0].id
                ? 'font-bold ring-2 shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeDoc.id === SAMPLE_LIBRARY[0].id ? currentTheme.surfaceHover : currentTheme.surface,
              borderColor: activeDoc.id === SAMPLE_LIBRARY[0].id ? currentTheme.accent : currentTheme.border,
              color: activeDoc.id === SAMPLE_LIBRARY[0].id ? currentTheme.accent : currentTheme.textBright,
            }}
          >
            <Zap className="w-3.5 h-3.5 shrink-0" />
            <span>600 WPM Video Drill</span>
          </button>

          <button
            onClick={() => handleSelectDocument(createDocumentFromSample(SAMPLE_LIBRARY[1]), 0)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 text-xs ${
              activeDoc.id === SAMPLE_LIBRARY[1].id
                ? 'font-bold ring-2 shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeDoc.id === SAMPLE_LIBRARY[1].id ? currentTheme.surfaceHover : currentTheme.surface,
              borderColor: activeDoc.id === SAMPLE_LIBRARY[1].id ? currentTheme.accent : currentTheme.border,
              color: activeDoc.id === SAMPLE_LIBRARY[1].id ? currentTheme.accent : currentTheme.textBright,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Alice in Wonderland</span>
          </button>

          <button
            onClick={() => setIsLibraryOpen(true)}
            className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 opacity-80 hover:opacity-100 text-xs"
            style={{
              backgroundColor: currentTheme.surface,
              borderColor: currentTheme.border,
              color: currentTheme.textDim,
            }}
          >
            <Upload className="w-3.5 h-3.5 shrink-0" />
            <span>+ Upload (PDF/ePub)</span>
          </button>

          <button
            onClick={() => setIsFreeBooksOpen(true)}
            className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>Free Books (70k+)</span>
          </button>
        </div>

        {/* Kinetic RSVP Reticle (Exact Video Style Support) */}
        <div className="w-full">
          <ReticleDisplay
            currentWord={activeWord}
            previousWord={previousWord}
            nextWord={nextWord}
            isPlaying={isPlaying}
            typography={typography}
            theme={currentTheme}
            wpm={wpm}
            documentTitle={activeDoc.title}
            onBoxClick={togglePlay}
          />
        </div>

        {/* Synchronized Context Peek (Toggleable with 'C' or button) */}
        <ContextPeek
          isOpen={isContextPeekOpen}
          onClose={() => setIsContextPeekOpen(false)}
          words={activeDoc.words}
          currentWordIndex={currentWordIndex}
          onSelectWord={(idx) => setCurrentWordIndex(idx)}
          theme={currentTheme}
        />

        {/* Reading Playback Control Panel */}
        <div className="w-full">
          <Controls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onReset={resetPlayback}
            onStep={stepWords}
            onPrevSentence={jumpPrevSentence}
            currentWordIndex={currentWordIndex}
            totalWords={activeDoc.words.length}
            wpm={wpm}
            onWpmChange={setWpm}
            onSeek={(idx) => setCurrentWordIndex(idx)}
            theme={currentTheme}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenLibrary={() => setIsLibraryOpen(true)}
            onToggleContextPeek={() => setIsContextPeekOpen((prev) => !prev)}
            isContextPeekOpen={isContextPeekOpen}
            disabled={activeDoc.words.length === 0}
          />
        </div>
      </main>

      {/* 3. Footer Bar with Hotkey & Device Cues */}
      <footer
        className="w-full border-t px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono select-none"
        style={{
          borderColor: currentTheme.border,
          color: currentTheme.textDim,
          backgroundColor: `${currentTheme.surface}66`,
        }}
      >
        <div className="hidden sm:flex items-center gap-4">
          <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">Space / Tap</kbd> Play/Pause</span>
          <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">← / →</kbd> ±10 Words</span>
          <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">↑ / ↓</kbd> ±25 WPM</span>
          <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">C</kbd> Context Peek</span>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-[11px]">
          <span>Velocity: <strong style={{ color: currentTheme.accent }}>{wpm} WPM</strong></span>
          <span aria-hidden="true">·</span>
          <span>Drop any file to read</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        typography={typography}
        onUpdateTypography={handleUpdateTypography}
        currentThemeId={themeId}
        onSelectTheme={handleSelectTheme}
        theme={currentTheme}
        pacing={pacing}
        onUpdatePacing={handleUpdatePacing}
        onSelectAccent={handleSelectAccent}
      />

      <DocumentDrawer
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        activeDocument={activeDoc}
        onSelectDocument={handleSelectDocument}
        onJumpToWord={(idx) => setCurrentWordIndex(idx)}
        currentWordIndex={currentWordIndex}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onOpenFreeBooks={() => setIsFreeBooksOpen(true)}
        theme={currentTheme}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        theme={currentTheme}
      />

      <FreeBooksModal
        isOpen={isFreeBooksOpen}
        onClose={() => setIsFreeBooksOpen(false)}
        theme={currentTheme}
      />
    </div>
  );
}
