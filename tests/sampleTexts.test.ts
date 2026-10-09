import { describe, it, expect } from 'vitest';
import { SAMPLE_LIBRARY, createDocumentFromSample } from '../src/utils/sampleTexts';

describe('SAMPLE_LIBRARY', () => {
  it('contains expected sample books catalog', () => {
    expect(SAMPLE_LIBRARY.length).toBeGreaterThan(0);
    const titles = SAMPLE_LIBRARY.map((b) => b.title);
    expect(titles).toContain('Frankenstein; or, The Modern Prometheus');
  });

  it('validates Frankenstein is public domain with Mary Shelley attribution', () => {
    const frankenstein = SAMPLE_LIBRARY.find((b) => b.title.includes('Frankenstein'));
    expect(frankenstein).toBeDefined();
    expect(frankenstein?.author).toBe('Mary Shelley');
    expect(frankenstein?.chapters.length).toBeGreaterThanOrEqual(4);
  });

  it('ensures no copyrighted Harry Potter text is present', () => {
    const serialized = JSON.stringify(SAMPLE_LIBRARY).toLowerCase();
    expect(serialized.includes('harry potter')).toBe(false);
    expect(serialized.includes('dumbledore')).toBe(false);
    expect(serialized.includes('privet drive')).toBe(false);
    expect(serialized.includes('voldemort')).toBe(false);
  });

  it('ensures every chapter has valid title and text', () => {
    for (const book of SAMPLE_LIBRARY) {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      for (const chapter of book.chapters) {
        expect(chapter.title).toBeTruthy();
        expect(chapter.text.length).toBeGreaterThan(50);
      }
    }
  });

  it('successfully creates parsed DocumentSource from sample book', () => {
    const frankensteinDef = SAMPLE_LIBRARY.find((b) => b.title.includes('Frankenstein'))!;
    const frankensteinDoc = createDocumentFromSample(frankensteinDef);
    expect(frankensteinDoc).toBeDefined();
    expect(frankensteinDoc.title).toBe('Frankenstein; or, The Modern Prometheus');
    expect(frankensteinDoc.chapters.length).toBeGreaterThanOrEqual(4);
    expect(frankensteinDoc.totalWords).toBeGreaterThan(1000);
    expect(frankensteinDoc.words.length).toBe(frankensteinDoc.totalWords);
  });
});
