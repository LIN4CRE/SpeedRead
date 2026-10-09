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
  FileText, 
  Sparkles, 
  Zap, 
  Loader2, 
  Globe, 
  PanelLeft, 
  EyeOff, 
  Eye, 
  Check, 
  TrendingUp, 
  Mic, 
  MicOff, 
  Flame, 
  Clock,
  Volume2,
  VolumeX,
  Cookie,
  Save,
  Coffee,
  User,
  X,
  Activity
} from 'lucide-react';
import { 
  DocumentSource, 
  TypographySettings, 
  ThemeColors, 
  PacingConfig, 
  SavedBookmark, 
  ReadingInsightsData,
  ReticleStyle,
  UserAccount,
  SaveState,
  CookieBreakPlace
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
  loadReadingInsights, 
  recordReadingSession, 
  DEFAULT_TYPOGRAPHY, 
  DEFAULT_PACING 
} from './utils/storage';
import { SAMPLE_LIBRARY, createDocumentFromSample } from './utils/sampleTexts';
import { getCurrentUser } from './utils/saveStateManager';
import { saveBreakPlaceCookie, loadBreakPlaceCookie, clearBreakPlaceCookie } from './utils/cookieUtils';
import { audioPacer } from './utils/audioPacer';
import { ReticleDisplay, RETICLE_STYLE_OPTIONS } from './components/ReticleDisplay';
import { Controls } from './components/Controls';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { ContextPeek } from './components/ContextPeek';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { FreeBooksModal } from './components/FreeBooksModal';
import { ReadingInsightsModal } from './components/ReadingInsightsModal';
import { EyeRestModal } from './components/EyeRestModal';
import { SaveStateModal } from './components/SaveStateModal';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

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

  // 3. UI Dialog & Sidebar States
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAudioPacer, setIsAudioPacer] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isContextPeekOpen, setIsContextPeekOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFreeBooksOpen, setIsFreeBooksOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState<boolean>(false);
  const [isEyeRestOpen, setIsEyeRestOpen] = useState<boolean>(false);
  const [isSaveStateOpen, setIsSaveStateOpen] = useState<boolean>(false);

  // User Accounts & Cookie Break Place States
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentUser());
  const [savedCookiePlace, setSavedCookiePlace] = useState<CookieBreakPlace | null>(() => loadBreakPlaceCookie());
  const [showCookieResumeBanner, setShowCookieResumeBanner] = useState<boolean>(() => {
    const c = loadBreakPlaceCookie();
    return !!(c && c.wordIndex > 0);
  });

  // 4. Reading Insights & Session Analytics
  const [insights, setInsights] = useState<ReadingInsightsData>(() => loadReadingInsights());
  const sessionStartWordIndex = useRef<number>(0);
  const sessionStartTime = useRef<number>(0);
  const sessionPeakWpm = useRef<number>(wpm);

  // 5. Pomodoro 25-Minute Reading Timer & 5-Minute Eye Break
  const [pomodoroFocusSeconds, setPomodoroFocusSeconds] = useState<number>(0);
  const [pomodoroStreak, setPomodoroStreak] = useState<number>(0);

  // 6. Read-Aloud Web Speech Synthesis State
  const [isReadAloud, setIsReadAloud] = useState<boolean>(false);

  // 7. Drag & Drop state for effortless book addition
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [isDroppingAndParsing, setIsDroppingAndParsing] = useState<boolean>(false);
  const [dropStatus, setDropStatus] = useState<string>('');

  // 8. Timer Reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentTheme: ThemeColors = THEMES[themeId] || THEMES.oled;

  // Web Speech API Text-to-Speech Hook for Read-Aloud Mode
  const {
    isSupported: isTtsSupported,
    speakWord,
    cancel: cancelTts,
  } = useSpeechSynthesis({
    enabled: isReadAloud,
    wpm,
  });

  // Cycle reticle styles (standard line, highlighter, spotlight, underline, etc.)
  const cycleReticleStyle = useCallback(() => {
    setTypography((prev) => {
      const currentIdx = RETICLE_STYLE_OPTIONS.findIndex((s) => s.id === prev.reticleStyle);
      const nextIdx = (currentIdx + 1) % RETICLE_STYLE_OPTIONS.length;
      const nextStyle = RETICLE_STYLE_OPTIONS[nextIdx].id;
      const updated = { ...prev, reticleStyle: nextStyle };
      saveSettings(updated);
      return updated;
    });
  }, []);

  const selectReticleStyle = useCallback((newStyle: ReticleStyle) => {
    setTypography((prev) => {
      const updated = { ...prev, reticleStyle: newStyle };
      saveSettings(updated);
      return updated;
    });
  }, []);

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
    if (isPlaying) {
      const wordsRead = Math.max(0, currentWordIndex - sessionStartWordIndex.current);
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 1000));
      if (wordsRead >= 5) {
        recordReadingSession({
          durationSeconds: duration,
          wordsRead,
          avgWpm: wpm,
          peakWpm: Math.max(sessionPeakWpm.current, wpm),
          bookTitle: activeDoc.title,
        });
        setInsights(loadReadingInsights());
      }
    }

    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    setActiveDoc(newDoc);
    setCurrentWordIndex(startWordIndex);
    recordBookmark(newDoc, startWordIndex, wpm);

    // Save place into browser cookies for breaks
    const currentChapter = newDoc.chapters.slice().reverse().find(
      c => startWordIndex >= c.startWordIndex
    ) || newDoc.chapters[0];
    saveBreakPlaceCookie({
      documentId: newDoc.id,
      documentTitle: newDoc.title,
      wordIndex: startWordIndex,
      totalWords: newDoc.totalWords,
      chapterTitle: currentChapter?.title,
      wpm,
      timestamp: Date.now(),
      dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setSavedCookiePlace(loadBreakPlaceCookie());
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

      // Save exact reading place into browser cookie for breaks
      const currentChapter = activeDoc.chapters.slice().reverse().find(
        c => currentWordIndex >= c.startWordIndex
      ) || activeDoc.chapters[0];

      saveBreakPlaceCookie({
        documentId: activeDoc.id,
        documentTitle: activeDoc.title,
        wordIndex: currentWordIndex,
        totalWords: activeDoc.totalWords,
        chapterTitle: currentChapter?.title,
        wpm,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setSavedCookiePlace(loadBreakPlaceCookie());

      // Record reading session for Insights analytics
      const wordsRead = Math.max(0, currentWordIndex - sessionStartWordIndex.current);
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime.current) / 1000));
      if (wordsRead >= 5) {
        recordReadingSession({
          durationSeconds: duration,
          wordsRead,
          avgWpm: wpm,
          peakWpm: Math.max(sessionPeakWpm.current, wpm),
          bookTitle: activeDoc.title,
        });
        setInsights(loadReadingInsights());
      }
    } else {
      if (currentWordIndex >= activeDoc.words.length - 1) {
        setCurrentWordIndex(0);
      }
      sessionStartWordIndex.current = currentWordIndex;
      sessionStartTime.current = Date.now();
      sessionPeakWpm.current = wpm;
      setIsPlaying(true);
    }
  }, [activeDoc, isPlaying, currentWordIndex, wpm, recordBookmark]);

  // Load a full saved state (restoring book, word index, WPM, and reticle)
  const handleLoadSaveState = useCallback((state: SaveState) => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelTts();

    const foundSample = SAMPLE_LIBRARY.find(s => s.id === state.documentId);
    if (foundSample && activeDoc.id !== state.documentId) {
      const doc = createDocumentFromSample(foundSample);
      setActiveDoc(doc);
    }

    setCurrentWordIndex(state.wordIndex);
    if (state.wpm) setWpm(state.wpm);
    if (state.reticleStyle) selectReticleStyle(state.reticleStyle);
    if (state.fontSize) {
      setTypography(prev => {
        const next = { ...prev, fontSize: state.fontSize! };
        saveSettings(next);
        return next;
      });
    }
  }, [activeDoc.id, cancelTts, selectReticleStyle]);

  // Resume from saved cookie break place
  const handleResumeCookiePlace = useCallback((place: CookieBreakPlace) => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    cancelTts();

    const foundSample = SAMPLE_LIBRARY.find(s => s.id === place.documentId);
    if (foundSample && activeDoc.id !== place.documentId) {
      const doc = createDocumentFromSample(foundSample);
      setActiveDoc(doc);
    }

    setCurrentWordIndex(place.wordIndex);
    if (place.wpm) setWpm(place.wpm);
    setShowCookieResumeBanner(false);
  }, [activeDoc.id, cancelTts]);

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

  // Speech Recognition hook integration
  const handleVoiceAdjustWpm = useCallback((delta: number) => {
    setWpm((prev) => Math.min(1200, Math.max(100, prev + delta)));
  }, []);

  const handleVoiceSetWpm = useCallback((targetWpm: number) => {
    setWpm(Math.min(1200, Math.max(100, targetWpm)));
  }, []);

  const handleVoicePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleVoiceResume = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const {
    isSupported: isSpeechSupported,
    isListening: isSpeechListening,
    mode: speechMode,
    setMode: setSpeechMode,
    toggleListening: toggleSpeechListening,
    feedbackToast: speechToast,
  } = useSpeechRecognition({
    onAdjustWpm: handleVoiceAdjustWpm,
    onSetWpm: handleVoiceSetWpm,
    onTogglePlay: () => togglePlay(),
    onPause: handleVoicePause,
    onResume: handleVoiceResume,
    onRewind: jumpPrevSentence,
    currentWpm: wpm,
  });

  // Pomodoro Continuous Reading Timer (25 min focus -> 5 min eye rest break)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPomodoroFocusSeconds((prev) => {
        const next = prev + 1;
        // 25 minutes = 1500 seconds
        if (next >= 25 * 60) {
          setIsPlaying(false);
          setPomodoroStreak((s) => s + 1);
          setIsEyeRestOpen(true);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

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

    // Audio Metronome Pacer cadence ticker
    if (isAudioPacer && currentWord) {
      audioPacer.playTick(currentWord.isSentenceEnd || currentWord.isParagraphEnd);
    }

    // Read-Aloud Web Speech API multi-sensory synthesis
    if (isReadAloud && currentWord) {
      speakWord(currentWord.clean || currentWord.raw);
    }

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

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => null);
    } else {
      window.document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => null);
    }
  }, []);

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

        case 'KeyB':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsSidebarOpen((prev) => !prev);
          }
          break;

        case 'KeyK':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsSaveStateOpen((prev) => !prev);
          }
          break;

        case 'KeyV':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsReadAloud((prev) => !prev);
          }
          break;

        case 'KeyM':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsAudioPacer((prev) => {
              const next = !prev;
              audioPacer.setEnabled(next);
              return next;
            });
          }
          break;

        case 'KeyS':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            cycleReticleStyle();
          }
          break;

        case 'KeyZ':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            setIsZenMode((prev) => !prev);
          }
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
          setIsShortcutsOpen(false);
          setIsFreeBooksOpen(false);
          setIsSidebarOpen(false);
          setIsInsightsOpen(false);
          setIsEyeRestOpen(false);
          setIsSaveStateOpen(false);
          setIsContextPeekOpen(false);
          setIsZenMode(false);
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
  }, [togglePlay, jumpPrevSentence, stepWords, resetPlayback, cycleTheme, cycleReticleStyle, toggleFullscreen]);

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
      {/* 1. Global Drag & Drop Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md border-4 border-dashed border-red-500/80 flex flex-col items-center justify-center p-6 text-center animate-fadeIn pointer-events-none">
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

      {/* Floating Zen Mode Exit Button */}
      {isZenMode && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <button
            onClick={() => setIsZenMode(false)}
            className="px-3 py-1.5 rounded-full text-xs font-mono font-medium border bg-black/80 text-white/70 hover:text-white border-white/20 backdrop-blur-md flex items-center gap-1.5 shadow-lg"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Exit Zen (Z)</span>
          </button>
        </div>
      )}

      {/* 2. Top Navigation Bar (Hidden in Zen mode) */}
      {!isZenMode && (
        <header
          className={`w-full border-b px-3 sm:px-6 py-2.5 flex items-center justify-between transition-all duration-200 ${
            isFullscreen && isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
          style={{
            borderColor: currentTheme.border,
            backgroundColor: `${currentTheme.surface}cc`,
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Left: Bookshelf Sidebar Toggle & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-xl border transition-all active:scale-95 flex items-center gap-1.5 ${
                isSidebarOpen ? 'ring-2 font-semibold' : ''
              }`}
              style={{
                backgroundColor: currentTheme.surface,
                borderColor: isSidebarOpen ? currentTheme.accent : currentTheme.border,
                color: isSidebarOpen ? currentTheme.accent : currentTheme.textBright,
              }}
              title="Toggle Bookshelf & Table of Contents (B)"
            >
              <PanelLeft className="w-4 h-4" />
              <span className="text-xs hidden md:inline">Bookshelf</span>
            </button>

            <div className="h-5 w-[1px] bg-slate-700/40 hidden sm:block" />

            <div className="min-w-0 flex items-center gap-2">
              <h1 className="font-semibold text-xs sm:text-sm tracking-tight truncate flex items-center gap-1.5">
                <span className="truncate">{activeDoc.title}</span>
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase shrink-0" style={{ borderColor: currentTheme.border, color: currentTheme.textDim }}>
                {activeDoc.type}
              </span>
            </div>
          </div>

          {/* Right: Insights, Voice Control, Pomodoro, Free Books, Zen, Theme, Shortcuts, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Read-Aloud Web Speech Synthesis Toggle */}
            <button
              onClick={() => {
                const nextState = !isReadAloud;
                setIsReadAloud(nextState);
                if (!nextState) cancelTts();
              }}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isReadAloud
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/50 shadow-emerald-500/10'
                  : 'hover:opacity-100 opacity-80'
              }`}
              style={{
                backgroundColor: isReadAloud ? undefined : currentTheme.surface,
                borderColor: isReadAloud ? undefined : currentTheme.border,
                color: isReadAloud ? undefined : currentTheme.textDim,
              }}
              title={
                isReadAloud
                  ? 'Read-Aloud Active (Listening while reading). Press V to turn off.'
                  : 'Enable Read-Aloud Voice Synthesis for Multi-Sensory Reinforcement (V)'
              }
            >
              {isReadAloud ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isReadAloud ? 'Read-Aloud: ON' : 'Read-Aloud'}</span>
            </button>

            {/* Audio Metronome Cadence Pacer Toggle (M) */}
            <button
              onClick={() => {
                const nextState = !isAudioPacer;
                setIsAudioPacer(nextState);
                audioPacer.setEnabled(nextState);
              }}
              className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isAudioPacer
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/50 shadow-amber-500/10'
                  : 'hover:opacity-100 opacity-80'
              }`}
              style={{
                backgroundColor: isAudioPacer ? undefined : currentTheme.surface,
                borderColor: isAudioPacer ? undefined : currentTheme.border,
                color: isAudioPacer ? undefined : currentTheme.textDim,
              }}
              title={
                isAudioPacer
                  ? 'Audio Cadence Metronome Active. Press M to turn off.'
                  : 'Enable Audio Metronome Cadence Pacer for Rhythmic Focus (M)'
              }
            >
              <Activity className={`w-3.5 h-3.5 ${isAudioPacer ? 'text-amber-400 animate-pulse' : ''}`} />
              <span className="hidden lg:inline">{isAudioPacer ? 'Metronome: ON' : 'Metronome'}</span>
            </button>

            {/* Save States & Cookie Breaks (K) */}
            <button
              onClick={() => setIsSaveStateOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
              title="Save States & Cookie Places / Take a Break (K)"
            >
              <Cookie className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.displayName : 'Save States'}
              </span>
            </button>

            {/* Reading Insights Dashboard */}
            <button
              onClick={() => {
                setInsights(loadReadingInsights());
                setIsInsightsOpen(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20"
              title="Reading Insights & Analytics (Speed History, Words Read, Time Remaining)"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Insights</span>
            </button>

            {/* Voice Control (Speech Recognition) */}
            {isSpeechSupported && (
              <button
                onClick={toggleSpeechListening}
                className={`px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                  isSpeechListening
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : 'hover:opacity-100 opacity-80'
                }`}
                style={{
                  backgroundColor: isSpeechListening ? undefined : currentTheme.surface,
                  borderColor: isSpeechListening ? undefined : currentTheme.border,
                  color: isSpeechListening ? undefined : currentTheme.textDim,
                }}
                title={
                  isSpeechListening 
                    ? 'Voice Control Active - Say "faster", "slower", "pause", "resume", "600"' 
                    : 'Enable Voice Speed & Cadence Control (Microphone)'
                }
              >
                {isSpeechListening ? <Mic className="w-3.5 h-3.5 text-rose-400" /> : <MicOff className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{isSpeechListening ? 'Listening...' : 'Voice'}</span>
              </button>
            )}

            {/* Pomodoro Focus Timer Status */}
            <button
              onClick={() => setIsEyeRestOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl border transition-all active:scale-95"
              style={{
                backgroundColor: currentTheme.surface,
                borderColor: pomodoroFocusSeconds >= 1200 ? '#f43f5e' : currentTheme.border,
                color: pomodoroFocusSeconds >= 1200 ? '#f43f5e' : currentTheme.textDim,
              }}
              title="Pomodoro 25-Min Eye Care Timer. Click to start a 5-minute eye-rest break now."
            >
              <Flame className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
              <span>Focus: {Math.floor(pomodoroFocusSeconds / 60)}/25m</span>
            </button>

            {/* Free Books Link */}
            <button
              onClick={() => setIsFreeBooksOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 shadow-sm text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20"
              title="Browse 70,000+ Free Ebooks & EPUBs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Free Books</span>
              <span className="sm:hidden">Free</span>
            </button>

            <button
              onClick={() => setIsZenMode(true)}
              className="p-2 rounded-xl border transition-all active:scale-95 text-xs flex items-center gap-1"
              style={{
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                color: currentTheme.textDim,
              }}
              title="Enter Pure Zen Focus Mode (Z)"
            >
              <EyeOff className="w-4 h-4" />
              <span className="hidden lg:inline text-xs">Zen</span>
            </button>

            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl border transition-all active:scale-95"
              style={{
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                color: currentTheme.textDim,
              }}
              title="Cycle Theme (T)"
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
      )}

      {/* Floating Voice Control Feedback Toast */}
      {speechToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-fadeIn pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-black/90 border border-rose-500/40 text-white shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-rose-300">{speechToast.action}</span>
            <span className="text-white/60">({speechToast.message})</span>
          </div>
        </div>
      )}

      {/* 3. Main Center Stage */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col justify-center items-center gap-5 sm:gap-6">
        {/* Cookie Break Resume Banner */}
        {showCookieResumeBanner && savedCookiePlace && (
          <div 
            className="w-full px-4 py-2.5 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-fadeIn shadow-lg select-none"
            style={{ 
              backgroundColor: `${currentTheme.surface}f5`, 
              borderColor: `${currentTheme.accent}50`,
              color: currentTheme.textBright
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div 
                className="p-1.5 rounded-lg shrink-0"
                style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
              >
                <Cookie className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-xs truncate">
                  Break Place Saved in Cookies: <span style={{ color: currentTheme.accent }}>{savedCookiePlace.documentTitle}</span>
                </div>
                <div className="text-[10px] font-mono opacity-70" style={{ color: currentTheme.textDim }}>
                  Word {savedCookiePlace.wordIndex.toLocaleString()} of {savedCookiePlace.totalWords.toLocaleString()} · {savedCookiePlace.wpm} WPM · Saved on break
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleResumeCookiePlace(savedCookiePlace)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-transform active:scale-95 shadow-sm"
                style={{ backgroundColor: currentTheme.accent }}
              >
                Resume Place
              </button>
              <button
                onClick={() => setShowCookieResumeBanner(false)}
                className="p-1 rounded-lg border transition-colors hover:opacity-80"
                style={{ borderColor: currentTheme.border, color: currentTheme.textDim }}
                title="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Reading Starters Bar (Hidden in Zen Mode) */}
        {!isZenMode && (
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap text-xs select-none w-full">
            {/* 1. Fairytales for Kids */}
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
              <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Fairytales for Kids</span>
            </button>

            {/* 2. Peter Pan (Full Book) */}
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
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span>Peter Pan (Full Book)</span>
            </button>

            {/* 3. Alice in Wonderland (Complete Book) */}
            <button
              onClick={() => handleSelectDocument(createDocumentFromSample(SAMPLE_LIBRARY[2]), 0)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 text-xs ${
                activeDoc.id === SAMPLE_LIBRARY[2].id
                  ? 'font-bold ring-2 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeDoc.id === SAMPLE_LIBRARY[2].id ? currentTheme.surfaceHover : currentTheme.surface,
                borderColor: activeDoc.id === SAMPLE_LIBRARY[2].id ? currentTheme.accent : currentTheme.border,
                color: activeDoc.id === SAMPLE_LIBRARY[2].id ? currentTheme.accent : currentTheme.textBright,
              }}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-sky-400" />
              <span>Alice in Wonderland (Complete)</span>
            </button>

            {/* 4. The 600 WPM Video Drill */}
            <button
              onClick={() => {
                const drill = SAMPLE_LIBRARY.find(s => s.id === 'sample-video-speed-challenge') || SAMPLE_LIBRARY[5];
                handleSelectDocument(createDocumentFromSample(drill), 0);
              }}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 text-xs ${
                activeDoc.id === 'sample-video-speed-challenge'
                  ? 'font-bold ring-2 shadow-sm'
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeDoc.id === 'sample-video-speed-challenge' ? currentTheme.surfaceHover : currentTheme.surface,
                borderColor: activeDoc.id === 'sample-video-speed-challenge' ? currentTheme.accent : currentTheme.border,
                color: activeDoc.id === 'sample-video-speed-challenge' ? currentTheme.accent : currentTheme.textBright,
              }}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>600 WPM Video Drill</span>
            </button>

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all active:scale-95 opacity-80 hover:opacity-100 text-xs"
              style={{
                backgroundColor: currentTheme.surface,
                borderColor: currentTheme.border,
                color: currentTheme.textDim,
              }}
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>+ Upload / Library</span>
            </button>
          </div>
        )}

        {/* The RSVP Kinetic Reticle (Exact Video Letterbox Slot) */}
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
            isReadAloudActive={isReadAloud}
            onToggleReticleStyle={cycleReticleStyle}
            onSelectReticleStyle={selectReticleStyle}
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

        {/* Reading Playback Controls Bar */}
        <div className={`w-full transition-opacity duration-200 ${isZenMode && isPlaying ? 'opacity-20 hover:opacity-100' : 'opacity-100'}`}>
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
            onOpenLibrary={() => setIsSidebarOpen(true)}
            onToggleContextPeek={() => setIsContextPeekOpen((prev) => !prev)}
            isContextPeekOpen={isContextPeekOpen}
            disabled={activeDoc.words.length === 0}
            isReadAloud={isReadAloud}
            onToggleReadAloud={() => {
              const next = !isReadAloud;
              setIsReadAloud(next);
              if (!next) cancelTts();
            }}
            isAudioPacer={isAudioPacer}
            onToggleAudioPacer={() => {
              const next = !isAudioPacer;
              setIsAudioPacer(next);
              audioPacer.setEnabled(next);
            }}
            onToggleReticleStyle={cycleReticleStyle}
            onOpenSaveStates={() => setIsSaveStateOpen(true)}
          />
        </div>
      </main>

      {/* 4. Bottom Footer (Hidden in Zen Mode) */}
      {!isZenMode && (
        <footer
          className="w-full border-t px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono select-none"
          style={{
            borderColor: currentTheme.border,
            color: currentTheme.textDim,
            backgroundColor: `${currentTheme.surface}66`,
          }}
        >
          <div className="hidden sm:flex items-center gap-3 text-[11px] flex-wrap">
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">Space</kbd> Play/Pause</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">K</kbd> Save State</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">V</kbd> Read-Aloud</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">M</kbd> Metronome</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">S</kbd> Reticle Style</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">B</kbd> Bookshelf</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">Z</kbd> Zen</span>
            <span><kbd className="px-1.5 py-0.5 rounded border mr-1 font-bold">C</kbd> Context</span>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 text-[11px]">
            <span>Velocity: <strong style={{ color: currentTheme.accent }}>{wpm} WPM</strong></span>
            <span aria-hidden="true">·</span>
            <span>Drop file anywhere</span>
          </div>
        </footer>
      )}

      {/* 5. Drawers & Modals */}
      {/* Bookshelf & Chapters Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeDoc={activeDoc}
        onSelectDocument={handleSelectDocument}
        currentWordIndex={currentWordIndex}
        onJumpToWord={(idx) => setCurrentWordIndex(idx)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
        onOpenFreeBooks={() => setIsFreeBooksOpen(true)}
        onOpenSaveStates={() => setIsSaveStateOpen(true)}
        theme={currentTheme}
        wpm={wpm}
      />

      {/* Multi-Slot Save States & Cookie Places Modal */}
      <SaveStateModal
        isOpen={isSaveStateOpen}
        onClose={() => setIsSaveStateOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        activeDoc={activeDoc}
        currentWordIndex={currentWordIndex}
        wpm={wpm}
        typography={typography}
        onLoadSaveState={handleLoadSaveState}
        onResumeCookiePlace={handleResumeCookiePlace}
        theme={currentTheme}
      />

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

      {/* Reading Insights Dashboard */}
      <ReadingInsightsModal
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
        insights={insights}
        activeDoc={activeDoc}
        currentWordIndex={currentWordIndex}
        currentWpm={wpm}
        theme={currentTheme}
      />

      {/* 25-Min Pomodoro Eye-Rest Break Modal */}
      <EyeRestModal
        isOpen={isEyeRestOpen}
        onClose={() => setIsEyeRestOpen(false)}
        onResumeReading={() => {
          setIsEyeRestOpen(false);
          setIsPlaying(true);
        }}
        streakCount={pomodoroStreak}
        breakDurationMinutes={5}
        theme={currentTheme}
      />
    </div>
  );
}
