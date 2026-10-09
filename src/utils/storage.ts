import { 
  TypographySettings, 
  PacingConfig, 
  SavedBookmark, 
  ReadingInsightsData, 
  ReadingSession, 
  PomodoroSettings 
} from '../types/reader';

const STORAGE_KEYS = {
  SETTINGS: 'kinetic_rsvp_settings_v1',
  PACING: 'kinetic_rsvp_pacing_v1',
  THEME_ID: 'kinetic_rsvp_theme_id_v1',
  CUSTOM_ACCENT: 'kinetic_rsvp_accent_v1',
  BOOKMARKS: 'kinetic_rsvp_bookmarks_v1',
  LAST_DOC: 'kinetic_rsvp_last_doc_v1',
  INSIGHTS: 'kinetic_rsvp_insights_v1',
  POMODORO: 'kinetic_rsvp_pomodoro_v1',
};

export const DEFAULT_TYPOGRAPHY: TypographySettings = {
  fontFamily: 'Merriweather',
  fontSize: 56,
  fontWeight: '400',
  letterSpacing: 0,
  textTransform: 'none',
  reticleStyle: 'videoSlot',
  reticleWidth: 'normal',
  showOrpMarker: true,
  highlightColor: '#ff3b30',
  chunkSize: 1,
  bionicReading: false,
  dyslexiaRuler: false,
};

export const DEFAULT_PACING: PacingConfig = {
  sentencePauseMultiplier: 2.5,
  commaPauseMultiplier: 1.7,
  longWordMultiplier: 1.25,
  numberMultiplier: 1.3,
  paragraphPauseMultiplier: 2.2,
};

export function loadSettings(): TypographySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_TYPOGRAPHY, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_TYPOGRAPHY;
}

export function saveSettings(settings: TypographySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save typography settings', e);
  }
}

export function loadPacing(): PacingConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PACING);
    if (raw) return { ...DEFAULT_PACING, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_PACING;
}

export function savePacing(pacing: PacingConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PACING, JSON.stringify(pacing));
  } catch (e) {
    console.error('Failed to save pacing settings', e);
  }
}

export function loadThemeId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME_ID) || 'oled';
  } catch {
    return 'oled';
  }
}

export function saveThemeId(themeId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_ID, themeId);
  } catch (e) {
    console.error('Failed to save theme ID', e);
  }
}

export function loadCustomAccent(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_ACCENT);
  } catch {
    return null;
  }
}

export function saveCustomAccent(accent: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ACCENT, accent);
  } catch (e) {
    console.error('Failed to save accent', e);
  }
}

export function loadBookmarks(): SavedBookmark[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveBookmark(bookmark: SavedBookmark): void {
  try {
    const current = loadBookmarks().filter(b => b.documentId !== bookmark.documentId);
    current.unshift(bookmark);
    // Keep max 20 bookmarks
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(current.slice(0, 20)));
  } catch (e) {
    console.error('Failed to save bookmark', e);
  }
}

export function removeBookmark(documentId: string): void {
  try {
    const current = loadBookmarks().filter(b => b.documentId !== documentId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to remove bookmark', e);
  }
}

export const DEFAULT_POMODORO: PomodoroSettings = {
  focusDurationMinutes: 25,
  breakDurationMinutes: 5,
  soundEnabled: true,
  autoPauseOnBreak: true,
};

export function loadPomodoroSettings(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.POMODORO);
    if (raw) return { ...DEFAULT_POMODORO, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_POMODORO;
}

export function savePomodoroSettings(settings: PomodoroSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.POMODORO, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save Pomodoro settings', e);
  }
}

// Seed historical reading sessions so user immediately sees rich trend data
const INITIAL_HISTORICAL_SESSIONS: ReadingSession[] = [
  {
    id: 'seed-1',
    timestamp: Date.now() - 86400000 * 4,
    dateStr: '4 days ago',
    durationSeconds: 900,
    wordsRead: 4500,
    avgWpm: 300,
    peakWpm: 360,
    bookTitle: 'Speed Reading Fundamentals',
  },
  {
    id: 'seed-2',
    timestamp: Date.now() - 86400000 * 3,
    dateStr: '3 days ago',
    durationSeconds: 1200,
    wordsRead: 7200,
    avgWpm: 360,
    peakWpm: 450,
    bookTitle: 'The Time Machine',
  },
  {
    id: 'seed-3',
    timestamp: Date.now() - 86400000 * 2,
    dateStr: '2 days ago',
    durationSeconds: 1500,
    wordsRead: 11250,
    avgWpm: 450,
    peakWpm: 550,
    bookTitle: 'Alice in Wonderland',
  },
  {
    id: 'seed-4',
    timestamp: Date.now() - 86400000 * 1,
    dateStr: 'Yesterday',
    durationSeconds: 1800,
    wordsRead: 18000,
    avgWpm: 600,
    peakWpm: 700,
    bookTitle: '600 WPM Video Training Drill',
  },
];

export function loadReadingInsights(): ReadingInsightsData {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INSIGHTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.sessions && parsed.sessions.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  // Initial seed state
  const totalWords = INITIAL_HISTORICAL_SESSIONS.reduce((acc, s) => acc + s.wordsRead, 0);
  const totalSeconds = INITIAL_HISTORICAL_SESSIONS.reduce((acc, s) => acc + s.durationSeconds, 0);
  const peakWpm = Math.max(...INITIAL_HISTORICAL_SESSIONS.map(s => s.peakWpm));

  return {
    totalWordsRead: totalWords,
    totalReadingSeconds: totalSeconds,
    peakWpmEver: peakWpm,
    sessions: INITIAL_HISTORICAL_SESSIONS,
  };
}

export function recordReadingSession(sessionData: {
  durationSeconds: number;
  wordsRead: number;
  avgWpm: number;
  peakWpm: number;
  bookTitle: string;
}): void {
  if (sessionData.wordsRead < 5) return; // skip accidental micro-clicks

  try {
    const current = loadReadingInsights();
    const newSession: ReadingSession = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      dateStr: 'Today',
      ...sessionData,
    };

    const updatedSessions = [newSession, ...current.sessions].slice(0, 30); // keep last 30 sessions
    const updatedInsights: ReadingInsightsData = {
      totalWordsRead: current.totalWordsRead + sessionData.wordsRead,
      totalReadingSeconds: current.totalReadingSeconds + sessionData.durationSeconds,
      peakWpmEver: Math.max(current.peakWpmEver, sessionData.peakWpm),
      sessions: updatedSessions,
    };

    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(updatedInsights));
  } catch (e) {
    console.error('Failed to record reading session', e);
  }
}

