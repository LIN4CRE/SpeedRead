export type FontFamily = 
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Space Mono'
  | 'Inter'
  | 'Atkinson Hyperlegible'
  | 'Merriweather';

export type ReticleStyle = 'videoSlot' | 'ticks' | 'crosshairs' | 'bracket' | 'laser' | 'minimal';

export type TextTransform = 'none' | 'uppercase' | 'lowercase';

export type ChunkSize = 1 | 2 | 3;

export interface TypographySettings {
  fontFamily: FontFamily;
  fontSize: number; // in px: 32 - 80
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing: number; // in px: -1 to 4
  textTransform: TextTransform;
  reticleStyle: ReticleStyle;
  reticleWidth: 'compact' | 'normal' | 'wide';
  showOrpMarker: boolean;
  highlightColor: string; // focal letter color hex
}

export interface ThemeColors {
  id: string;
  name: string;
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  textBright: string;
  textDim: string;
  accent: string;
  isDark: boolean;
}

export interface PacingConfig {
  sentencePauseMultiplier: number; // default 2.5x
  commaPauseMultiplier: number;    // default 1.7x
  longWordMultiplier: number;      // default 1.25x (words > 8 chars)
  numberMultiplier: number;        // default 1.3x
  paragraphPauseMultiplier: number;// default 2.2x
}

export interface ParsedWord {
  id: number;
  raw: string;
  clean: string;
  orpIndex: number;
  isSentenceEnd: boolean;
  isClauseEnd: boolean;
  isParagraphEnd: boolean;
  isNumber: boolean;
  charCount: number;
  chapterIndex?: number;
  pageNumber?: number;
}

export interface DocumentChapter {
  id: string;
  title: string;
  startWordIndex: number;
  wordCount: number;
  pageNumber?: number;
}

export interface DocumentSource {
  id: string;
  title: string;
  author?: string;
  type: 'txt' | 'pdf' | 'epub' | 'paste' | 'sample';
  totalPages?: number;
  totalWords: number;
  chapters: DocumentChapter[];
  rawText: string;
  words: ParsedWord[];
  fileSize?: number;
  dateAdded: number;
}

export interface SavedBookmark {
  documentId: string;
  title: string;
  type: string;
  lastWordIndex: number;
  totalWords: number;
  wpm: number;
  lastReadTimestamp: number;
}

export interface ReadingSession {
  id: string;
  timestamp: number;
  dateStr: string;
  durationSeconds: number;
  wordsRead: number;
  avgWpm: number;
  peakWpm: number;
  bookTitle: string;
}

export interface ReadingInsightsData {
  totalWordsRead: number;
  totalReadingSeconds: number;
  peakWpmEver: number;
  sessions: ReadingSession[];
}

export interface SpeechRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  mode: 'commands' | 'cadence';
  lastHeardCommand: string | null;
  lastCommandTimestamp: number;
  detectedCadenceWpm: number | null;
}

export interface PomodoroSettings {
  focusDurationMinutes: number; // default 25
  breakDurationMinutes: number; // default 5
  soundEnabled: boolean;
  autoPauseOnBreak: boolean;
}

export interface PomodoroState {
  mode: 'focus' | 'break';
  secondsRemaining: number;
  streakCount: number;
  isActive: boolean;
}

