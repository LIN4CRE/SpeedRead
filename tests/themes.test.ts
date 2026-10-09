import { describe, it, expect } from 'vitest';
import { THEMES, ACCENT_PALETTE } from '../src/utils/themes';

describe('THEMES', () => {
  it('provides all expected theme presets', () => {
    const keys = Object.keys(THEMES);
    expect(keys.length).toBeGreaterThanOrEqual(8);
    expect(keys).toContain('cyberpunk');
    expect(keys).toContain('oled');
    expect(keys).toContain('sepia');
  });

  it('validates each theme contains required color properties', () => {
    for (const [key, theme] of Object.entries(THEMES)) {
      expect(theme.id).toBe(key);
      expect(theme.name).toBeTruthy();
      expect(theme.bg).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.surface).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.border).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.textBright).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(typeof theme.isDark).toBe('boolean');
    }
  });

  it('provides valid accent palette swatches', () => {
    expect(ACCENT_PALETTE.length).toBeGreaterThanOrEqual(9);
    for (const accent of ACCENT_PALETTE) {
      expect(accent.name).toBeTruthy();
      expect(accent.value).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
