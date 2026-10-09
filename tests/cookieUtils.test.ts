import { describe, it, expect, beforeEach } from 'vitest';
import { getCookie, setCookie, removeCookie } from '../src/utils/cookieUtils';

describe('cookieUtils', () => {
  let cookieStore: Record<string, string> = {};

  beforeEach(() => {
    cookieStore = {};
    (globalThis as any).document = {
      get cookie() {
        return Object.entries(cookieStore)
          .map(([k, v]) => `${k}=${v}`)
          .join('; ');
      },
      set cookie(str: string) {
        const [pair] = str.split(';');
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          const key = pair.slice(0, eqIdx).trim();
          const val = pair.slice(eqIdx + 1);
          if (str.includes('max-age=0')) {
            delete cookieStore[key];
          } else {
            cookieStore[key] = val;
          }
        }
      }
    };
  });

  it('sets and retrieves a cookie correctly', () => {
    setCookie('speed_test_key', 'test_value_123', 7);
    const value = getCookie('speed_test_key');
    expect(value).toBe('test_value_123');
  });

  it('removes a cookie correctly', () => {
    setCookie('to_be_deleted', 'temporary', 1);
    expect(getCookie('to_be_deleted')).toBe('temporary');

    removeCookie('to_be_deleted');
    expect(getCookie('to_be_deleted')).toBeNull();
  });

  it('handles non-existent cookies gracefully', () => {
    expect(getCookie('non_existent_key_999')).toBeNull();
  });

  it('safely handles malformed percent-encoded cookie strings without throwing URIError', () => {
    // Inject a malformed third-party cookie into the store
    cookieStore['corrupt_tracker'] = '%E0%A4%A';
    cookieStore['valid_key'] = encodeURIComponent('safe_value');

    // Attempting to read valid key should succeed and not crash
    expect(() => {
      const val = getCookie('valid_key');
      expect(val).toBe('safe_value');
    }).not.toThrow();
  });
});
