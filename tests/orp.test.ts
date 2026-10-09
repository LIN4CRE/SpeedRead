import { describe, it, expect } from 'vitest';
import { calculateORP, splitWordAtORP, tokenizeText, computeWordDelay, calculateLexicalSurprisal } from '../src/utils/orp';
import { PacingConfig } from '../src/types/reader';

const testPacing: PacingConfig = {
  sentencePauseMultiplier: 2.5,
  commaPauseMultiplier: 1.7,
  longWordMultiplier: 1.25,
  numberMultiplier: 1.3,
  paragraphPauseMultiplier: 2.2,
};

describe('calculateORP', () => {
  it('correctly calculates ORP index for various word lengths', () => {
    // 0-1 char -> index 0
    expect(calculateORP('a')).toBe(0);
    expect(calculateORP('I')).toBe(0);

    // 2-5 chars -> index 1
    expect(calculateORP('at')).toBe(1);
    expect(calculateORP('cat')).toBe(1);
    expect(calculateORP('read')).toBe(1);
    expect(calculateORP('speed')).toBe(1);

    // 6-9 chars -> index 2
    expect(calculateORP('reader')).toBe(2);
    expect(calculateORP('kinetic')).toBe(2);
    expect(calculateORP('accuracy')).toBe(2);
    expect(calculateORP('focalized')).toBe(2);

    // 10-13 chars -> index 3
    expect(calculateORP('processing')).toBe(3);
    expect(calculateORP('comprehends')).toBe(3);

    // >13 chars -> index 4
    expect(calculateORP('characterization')).toBe(4);
    expect(calculateORP('hyperlegibility')).toBe(4);
  });

  it('handles leading punctuation without offsetting relative focal point', () => {
    // '"speed"' -> leading quote offset + index 1
    const idx = calculateORP('"speed"');
    expect(idx).toBe(2); // 1 (quote) + 1 (letter 'p')
  });

  it('supports Unicode letters and accented words', () => {
    // 'café' has 4 letters -> orp in alpha is 1
    expect(calculateORP('café')).toBe(1);

    // 'résumé' has 6 letters -> orp in alpha is 2
    expect(calculateORP('résumé')).toBe(2);

    // 'Über' has 4 letters -> orp in alpha is 1
    expect(calculateORP('Über')).toBe(1);
  });

  it('handles empty strings and edge cases', () => {
    expect(calculateORP('')).toBe(0);
  });
});

describe('splitWordAtORP', () => {
  it('correctly splits word into left, focal, and right parts', () => {
    const word = 'speed';
    const orpIdx = calculateORP(word); // 1
    const result = splitWordAtORP(word, orpIdx);

    expect(result.focal).toBe('p');
    expect(result.left).toBe('s');
    expect(result.right).toBe('eed');
    expect(result.left + result.focal + result.right).toBe('speed');
  });

  it('handles single character words', () => {
    const result = splitWordAtORP('a', 0);
    expect(result.left).toBe('');
    expect(result.focal).toBe('a');
    expect(result.right).toBe('');
  });

  it('handles empty strings safely', () => {
    const result = splitWordAtORP('', 0);
    expect(result.left).toBe('');
    expect(result.focal).toBe('');
    expect(result.right).toBe('');
  });
});

describe('computeWordDelay', () => {
  it('calculates baseline delay for 300 WPM', () => {
    const words = tokenizeText('hello world');
    const delay = computeWordDelay(words[0], 300, testPacing);
    // 60,000 / 300 = 200 ms
    expect(delay).toBe(200);
  });

  it('applies pause multiplier for sentence endings', () => {
    const words = tokenizeText('We pause here. We continue moving forward.');
    const sentenceEndWord = words[2]; // 'here.' (isSentenceEnd = true, isParagraphEnd = false)
    const normalWord = words[4]; // 'moving' (isSentenceEnd = false, isParagraphEnd = false)

    const endDelay = computeWordDelay(sentenceEndWord, 300, testPacing);
    const normalDelay = computeWordDelay(normalWord, 300, testPacing);

    expect(endDelay).toBeGreaterThan(normalDelay);
    // 200 * 2.5 = 500ms
    expect(endDelay).toBe(500);
  });

  it('applies pause multiplier for commas and clauses', () => {
    const words = tokenizeText('First, we read the entire document today.');
    const commaWord = words[0]; // 'First,' (isClauseEnd = true, isParagraphEnd = false)
    const normalWord = words[2]; // 'read' (isSentenceEnd = false, isParagraphEnd = false)

    const commaDelay = computeWordDelay(commaWord, 300, testPacing);
    const normalDelay = computeWordDelay(normalWord, 300, testPacing);

    expect(commaDelay).toBeGreaterThan(normalDelay);
    // 200 * 1.7 = 340ms
    expect(commaDelay).toBe(340);
  });
});

describe('tokenizeText', () => {
  it('tokenizes standard sentences into ParsedWord tokens', () => {
    const tokens = tokenizeText('The quick brown fox jumps over the lazy dog.');
    expect(tokens.length).toBe(9);
    expect(tokens[0].raw).toBe('The');
    expect(tokens[8].raw).toBe('dog.');
    expect(tokens[8].isSentenceEnd).toBe(true);
  });

  it('normalizes unspaced em-dashes into discrete tokens', () => {
    const tokens = tokenizeText('Science—discovery');
    const rawTokens = tokens.map((t) => t.raw);
    expect(rawTokens).toContain('Science');
    expect(rawTokens).toContain('—');
    expect(rawTokens).toContain('discovery');
  });

  it('preserves accented Unicode characters', () => {
    const tokens = tokenizeText('Le café et la crème fraîche.');
    const rawTokens = tokens.map((t) => t.raw);
    expect(rawTokens).toContain('café');
    expect(rawTokens).toContain('crème');
    expect(rawTokens).toContain('fraîche.');
  });
});

describe('calculateLexicalSurprisal', () => {
  it('discounts common functional stop words for rapid cadence', () => {
    expect(calculateLexicalSurprisal('the')).toBe(0.88);
    expect(calculateLexicalSurprisal('and')).toBe(0.88);
    expect(calculateLexicalSurprisal('with')).toBe(0.88);
    expect(calculateLexicalSurprisal('their')).toBe(0.88);
  });

  it('dwells longer on acronyms and all-caps sequences', () => {
    expect(calculateLexicalSurprisal('NASA')).toBe(1.20);
    expect(calculateLexicalSurprisal('RSVP')).toBe(1.20);
  });

  it('dwells longer on dense polysyllabic content words', () => {
    // 'epistemological' has >= 4 syllables / >= 11 chars
    expect(calculateLexicalSurprisal('epistemological')).toBe(1.20);
    // 'fantastic' has 3 syllables / 9 chars (< 11)
    expect(calculateLexicalSurprisal('fantastic')).toBe(1.10);
  });

  it('keeps baseline 1.0 for normal moderate vocabulary', () => {
    expect(calculateLexicalSurprisal('green')).toBe(1.0);
    expect(calculateLexicalSurprisal('chair')).toBe(1.0);
  });

  it('modulates computeWordDelay when enableSurprisal is toggled', () => {
    const tokens = tokenizeText('the epistemological');
    const stopWord = tokens[0]; // 'the'
    const denseWord = tokens[1]; // 'epistemological'

    // With surprisal enabled (default)
    const stopDelay = computeWordDelay(stopWord, 300, testPacing);
    const denseDelay = computeWordDelay(denseWord, 300, testPacing);

    expect(denseDelay).toBeGreaterThan(stopDelay);

    // With surprisal disabled
    const pacingNoSurprisal = { ...testPacing, enableSurprisal: false };
    const stopDelayRaw = computeWordDelay(stopWord, 300, pacingNoSurprisal);
    expect(stopDelayRaw).toBeGreaterThan(stopDelay);
  });
});

