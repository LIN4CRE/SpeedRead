import { TypographySettings, PacingConfig, SavedBookmark } from '../types/reader';

const STORAGE_KEYS = {
  SETTINGS: 'kinetic_rsvp_settings_v1',
  PACING: 'kinetic_rsvp_pacing_v1',
  THEME_ID: 'kinetic_rsvp_theme_id_v1',
  CUSTOM_ACCENT: 'kinetic_rsvp_accent_v1',
  BOOKMARKS: 'kinetic_rsvp_bookmarks_v1',
  LAST_DOC: 'kinetic_rsvp_last_doc_v1',
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
