import { describe, it, expect } from 'vitest';
import { audioPacer } from '../src/utils/audioPacer';

describe('AudioPacer', () => {
  it('initializes with default settings', () => {
    expect(audioPacer).toBeDefined();
    expect(typeof audioPacer.getEnabled()).toBe('boolean');
    expect(typeof audioPacer.getVolume()).toBe('number');
  });

  it('toggles enabled status', () => {
    const initial = audioPacer.getEnabled();
    audioPacer.setEnabled(!initial);
    expect(audioPacer.getEnabled()).toBe(!initial);

    // Reset back
    audioPacer.setEnabled(initial);
    expect(audioPacer.getEnabled()).toBe(initial);
  });

  it('clamps volume between 0.0 and 1.0', () => {
    audioPacer.setVolume(1.5);
    expect(audioPacer.getVolume()).toBe(1.0);

    audioPacer.setVolume(-0.5);
    expect(audioPacer.getVolume()).toBe(0.0);

    audioPacer.setVolume(0.35);
    expect(audioPacer.getVolume()).toBeCloseTo(0.35, 2);
  });

  it('does not throw when playTick is called in non-audio or browserless environments', () => {
    expect(() => {
      audioPacer.playTick(false);
      audioPacer.playTick(true);
    }).not.toThrow();
  });
});
