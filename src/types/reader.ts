export type FontFamily = 
  | 'JetBrains Mono'
  | 'Fira Code'
  | 'Space Mono'
  | 'Inter'
  | 'Atkinson Hyperlegible'
  | 'Merriweather';

export type ReticleStyle = 
  | 'videoSlot' 
  | 'ticks' 
  | 'line' 
  | 'highlighter' 
  | 'spotlight' 
  | 'underline' 
  | 'crosshairs' 
  | 'bracket' 
  | 'laser' 
  | 'minimal';

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
  chunkSize: ChunkSize; // 1, 2, or 3 words
  bionicReading: boolean; // Bionic reading syllable bolding in context preview
  dyslexiaRuler: boolean; // High-contrast horizontal focus ruler guide
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
  enableSurprisal?: boolean;       // Lexical density & information surprisal pacing
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

export interface ComprehensionAttempt {
  id: string;
  timestamp: number;
  documentTitle: string;
  rawWpm: number;
  trueWpm: number;
  score: number; // 0 to 3
  totalQuestions: number;
  percentage: number;
}

export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'cloze' | 'vocabulary' | 'theme';
}

export interface ReadingInsightsData {
  totalWordsRead: number;
  totalReadingSeconds: number;
  peakWpmEver: number;
  sessions: ReadingSession[];
  comprehensionAttempts?: ComprehensionAttempt[];
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

export interface CookieBreakPlace {
  documentId: string;
  documentTitle: string;
  wordIndex: number;
  totalWords: number;
  chapterIndex?: number;
  chapterTitle?: string;
  wpm: number;
  timestamp: number;
  dateStr: string;
}

export interface UserAccount {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string;
  createdAt: number;
  lastActive: number;
}

export interface SaveState {
  id: string;
  userId: string;
  name: string;
  note?: string;
  documentId: string;
  documentTitle: string;
  documentType: string;
  wordIndex: number;
  totalWords: number;
  chapterTitle?: string;
  wpm: number;
  reticleStyle?: ReticleStyle;
  fontSize?: number;
  fontFamily?: FontFamily;
  highlightColor?: string;
  excerptPreview?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  cleanWord: string;
  contextSentence: string;
  documentTitle: string;
  timestamp: number;
  definition?: string;
  partOfSpeech?: string;
  // SM-2 Spaced Repetition fields
  repetition: number;        // consecutive successful reviews
  intervalDays: number;      // days until next review (e.g. 1, 6, ...)
  easeFactor: number;        // SM-2 difficulty multiplier (starts at 2.5)
  nextReviewDate: number;    // timestamp for next scheduled review
  lastReviewedDate?: number;
}

export interface CloudlessSyncPayload {
  version: number;
  exportedAt: number;
  activeDocumentId: string;
  activeDocumentTitle: string;
  activeDocumentType: string;
  currentWordIndex: number;
  wpm: number;
  bookmarks: SavedBookmark[];
  vocabulary: VocabularyItem[];
}

export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  year?: string;
  category: string;
  description: string;
  wordCount: number;
  coverAccent: string;
  content: string;
}

export interface WebClipperResult {
  title: string;
  byline?: string;
  siteName?: string;
  cleanedText: string;
  wordCount: number;
  sourceUrl?: string;
}

