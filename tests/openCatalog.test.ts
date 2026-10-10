import { describe, it, expect } from 'vitest';
import { 
  CURATED_OPEN_CATALOG, 
  parseOpdsFeedXml, 
  cleanGutenbergBoilerplate, 
  extractChaptersFromText 
} from '../src/utils/openCatalog';

describe('Open Ebook Catalog & OPDS Parser', () => {
  it('contains expected curated public domain classics', () => {
    expect(CURATED_OPEN_CATALOG.length).toBeGreaterThanOrEqual(5);

    const titles = CURATED_OPEN_CATALOG.map((b) => b.title);
    expect(titles).toContain('The Time Machine');
    expect(titles).toContain('The Picture of Dorian Gray');
    expect(titles).toContain('A Scandal in Bohemia');
    expect(titles).toContain('The Art of War');
    expect(titles).toContain('Meditations');
  });

  it('validates each catalog item has complete narrative content and metadata', () => {
    for (const book of CURATED_OPEN_CATALOG) {
      expect(book.id).toBeTruthy();
      expect(book.title).toBeTruthy();
      expect(book.author).toBeTruthy();
      expect(book.category).toBeTruthy();
      expect(book.description.length).toBeGreaterThan(20);
      expect(book.content.length).toBeGreaterThan(500);
      expect(book.wordCount).toBeGreaterThan(100);
    }
  });

  it('parses OPDS Atom XML feed properly', () => {
    const sampleXml = `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>Standard Ebooks Feed</title>
        <entry>
          <id>urn:standardebooks.org:mary-shelley_frankenstein</id>
          <title>Frankenstein</title>
          <author><name>Mary Shelley</name></author>
          <summary>A young scientist creates a sentient monster.</summary>
          <link type="application/epub+zip" href="https://standardebooks.org/ebooks/mary-shelley/frankenstein/dist/frankenstein.epub" rel="http://opds-spec.org/acquisition" />
        </entry>
      </feed>`;

    const entries = parseOpdsFeedXml(sampleXml);
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe('Frankenstein');
    expect(entries[0].author).toBe('Mary Shelley');
    expect(entries[0].summary).toContain('sentient monster');
    expect(entries[0].downloadUrl).toContain('frankenstein.epub');
  });

  it('strips Project Gutenberg legal boilerplate cleanly', () => {
    const raw = `*** START OF THE PROJECT GUTENBERG EBOOK FRANKENSTEIN ***\n\nChapter 1\nI am by birth a Genevese...\n\n*** END OF THE PROJECT GUTENBERG EBOOK FRANKENSTEIN ***`;
    const cleaned = cleanGutenbergBoilerplate(raw);
    expect(cleaned).not.toContain('*** START OF');
    expect(cleaned).not.toContain('*** END OF');
    expect(cleaned).toContain('I am by birth a Genevese');
  });

  it('extracts structured chapters from text', () => {
    const text = `CHAPTER I: Down the Rabbit Hole\n\nAlice was beginning to get very tired of sitting by her sister on the bank...\n\nCHAPTER II: The Pool of Tears\n\nCuriouser and curiouser cried Alice...`;
    const chapters = extractChaptersFromText(text);
    expect(chapters.length).toBe(2);
    expect(chapters[0].title).toContain('CHAPTER I');
    expect(chapters[1].title).toContain('CHAPTER II');
  });
});
