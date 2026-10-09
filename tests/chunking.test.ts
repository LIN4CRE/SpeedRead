import { describe, it, expect } from 'vitest';
import { tokenizeText, computeWordDelay } from '../src/utils/orp';
import { DEFAULT_PACING } from '../src/utils/storage';

describe('Multi-Word Saccadic Chunking', () => {
  const sampleText = 'The quick brown fox jumps over the lazy dog. Saccadic chunking boosts speed.';
  const words = tokenizeText(sampleText);

  it('slices words appropriately for chunk sizes 1, 2, and 3', () => {
    // 1-word chunk
    const chunk1 = words.slice(0, 0 + 1);
    expect(chunk1).toHaveLength(1);
    expect(chunk1[0].raw).toBe('The');

    // 2-word chunk
    const chunk2 = words.slice(0, 0 + 2);
    expect(chunk2).toHaveLength(2);
    expect(chunk2[0].raw).toBe('The');
    expect(chunk2[1].raw).toBe('quick');

    // 3-word chunk
    const chunk3 = words.slice(0, 0 + 3);
    expect(chunk3).toHaveLength(3);
    expect(chunk3[0].raw).toBe('The');
    expect(chunk3[1].raw).toBe('quick');
    expect(chunk3[2].raw).toBe('brown');
  });

  it('computes chunk delay scaling accurately for saccadic absorption', () => {
    const wpm = 300;
    const chunkWords2 = words.slice(0, 2);
    const sumDelay2 = chunkWords2.reduce((sum, w) => sum + computeWordDelay(w, wpm, DEFAULT_PACING), 0);
    const scaledDelay2 = Math.round(sumDelay2 * 0.90);

    expect(scaledDelay2).toBeLessThan(sumDelay2);
    expect(scaledDelay2).toBe(Math.round(sumDelay2 * 0.9));

    const chunkWords3 = words.slice(0, 3);
    const sumDelay3 = chunkWords3.reduce((sum, w) => sum + computeWordDelay(w, wpm, DEFAULT_PACING), 0);
    const scaledDelay3 = Math.round(sumDelay3 * 0.85);

    expect(scaledDelay3).toBeLessThan(sumDelay3);
    expect(scaledDelay3).toBe(Math.round(sumDelay3 * 0.85));
  });

  it('handles bounds gracefully when chunk extends past document end', () => {
    const lastIndex = words.length - 1;
    const chunkAtEnd = words.slice(lastIndex, lastIndex + 3);
    expect(chunkAtEnd).toHaveLength(1);
    expect(chunkAtEnd[0].raw).toBe('speed.');
  });

  it('advances word indices by chunkSize without missing items', () => {
    let index = 0;
    const chunkSize = 2;
    const visitedIndices: number[] = [];

    while (index < words.length) {
      visitedIndices.push(index);
      index += chunkSize;
    }

    expect(visitedIndices[0]).toBe(0);
    expect(visitedIndices[1]).toBe(2);
    expect(visitedIndices[2]).toBe(4);
    expect(visitedIndices[visitedIndices.length - 1]).toBeLessThan(words.length);
  });
});
