import { CookieBreakPlace } from '../types/reader';

const COOKIE_NAMES = {
  BREAK_PLACE: 'kinetic_break_place_v1',
  ACTIVE_USER: 'kinetic_active_user_v1',
};

/**
 * Standard browser cookie getter
 */
export function getCookie(name: string): string | null {
  try {
    if (typeof document === 'undefined') return null;
    const prefix = `${name}=`;
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(prefix) === 0) {
        const rawValue = c.substring(prefix.length);
        try {
          return decodeURIComponent(rawValue);
        } catch {
          return rawValue;
        }
      }
    }
  } catch (e) {
    console.warn('Could not read cookie:', e);
  }

  // Fallback to localStorage if cookie access is restricted
  try {
    return localStorage.getItem(`cookie_fallback_${name}`);
  } catch {
    return null;
  }
}

/**
 * Standard browser cookie setter with SameSite=Lax and configurable max-age
 */
export function setCookie(name: string, value: string, days = 365): void {
  try {
    if (typeof document !== 'undefined') {
      const maxAge = days * 24 * 60 * 60;
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('Could not write cookie:', e);
  }

  // Synchronize with localStorage for high durability in embedded iframes
  try {
    localStorage.setItem(`cookie_fallback_${name}`, value);
  } catch {
    // Ignore storage quota
  }
}

/**
 * Delete a cookie
 */
export function removeCookie(name: string): void {
  try {
    if (typeof document !== 'undefined') {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch (e) {
    console.warn('Could not delete cookie:', e);
  }

  try {
    localStorage.removeItem(`cookie_fallback_${name}`);
  } catch {
    // Ignore
  }
}

/**
 * Save current reading place in browser cookie when taking a break or pausing
 */
export function saveBreakPlaceCookie(place: CookieBreakPlace): void {
  try {
    const raw = JSON.stringify(place);
    setCookie(COOKIE_NAMES.BREAK_PLACE, raw, 180); // 180 days retention
  } catch (e) {
    console.error('Failed to save break place cookie', e);
  }
}

/**
 * Retrieve saved break place from browser cookie
 */
export function loadBreakPlaceCookie(): CookieBreakPlace | null {
  try {
    const raw = getCookie(COOKIE_NAMES.BREAK_PLACE);
    if (raw) {
      return JSON.parse(raw) as CookieBreakPlace;
    }
  } catch (e) {
    console.warn('Failed to parse break place cookie', e);
  }
  return null;
}

/**
 * Clear the saved break place cookie
 */
export function clearBreakPlaceCookie(): void {
  removeCookie(COOKIE_NAMES.BREAK_PLACE);
}
