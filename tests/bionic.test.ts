import { describe, it, expect } from 'vitest';
import { partitionBionicWord } from '../src/utils/bionic';

describe('partitionBionicWord', () => {
  it('handles empty or blank string gracefully', () => {
    const res = partitionBionicWord('');
    expect(res).toEqual({
      leadingPunct: '',
      boldPart: '',
      normalPart: '',
      trailingPunct: '',
    });
  });

  it('handles pure punctuation', () => {
    const res = partitionBionicWord('---');
    expect(res.leadingPunct).toBe('---');
    expect(res.boldPart).toBe('');
    expect(res.normalPart).toBe('');
    expect(res.trailingPunct).toBe('');
  });

  it('partitions 1-character words', () => {
    const res = partitionBionicWord('I');
    expect(res.boldPart).toBe('I');
    expect(res.normalPart).toBe('');
  });

  it('partitions short words (2-3 characters)', () => {
    const resAt = partitionBionicWord('at');
    expect(resAt.boldPart).toBe('a');
    expect(resAt.normalPart).toBe('t');

    const resThe = partitionBionicWord('the');
    expect(resThe.boldPart).toBe('t');
    expect(resThe.normalPart).toBe('he');
  });

  it('partitions medium words (4-5 characters)', () => {
    const res = partitionBionicWord('speed');
    expect(res.boldPart).toBe('sp');
    expect(res.normalPart).toBe('eed');
  });

  it('partitions 6-8 character words', () => {
    const res = partitionBionicWord('reading');
    expect(res.boldPart).toBe('rea');
    expect(res.normalPart).toBe('ding');
  });

  it('partitions 9-11 character words', () => {
    const res = partitionBionicWord('cognition');
    expect(res.boldPart).toBe('cogn');
    expect(res.normalPart).toBe('ition');
  });

  it('partitions long words (>11 characters)', () => {
    const res = partitionBionicWord('comprehension');
    // length is 13, ceil(13 * 0.45) = 6
    expect(res.boldPart).toBe('compre');
    expect(res.normalPart).toBe('hension');
  });

  it('preserves surrounding punctuation and quotes properly', () => {
    const res = partitionBionicWord('"acceleration!"');
    expect(res.leadingPunct).toBe('"');
    expect(res.boldPart).toBe('accele'); // 12 chars -> ceil(12 * 0.45) = 6 ('accele')
    expect(res.normalPart).toBe('ration');
    expect(res.trailingPunct).toBe('!"');
    expect(res.leadingPunct + res.boldPart + res.normalPart + res.trailingPunct).toBe('"acceleration!"');
  });

  it('ensures all segments perfectly reconstruct the source string', () => {
    const testWords = ['hello', 'world.', '(neuroplasticity)', '—speed—', '12345'];
    for (const w of testWords) {
      const seg = partitionBionicWord(w);
      expect(seg.leadingPunct + seg.boldPart + seg.normalPart + seg.trailingPunct).toBe(w);
    }
  });
});
