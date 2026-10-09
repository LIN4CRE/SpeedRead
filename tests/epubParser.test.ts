import { describe, it, expect } from 'vitest';
import { normalizeZipPath } from '../src/utils/epubParser';

describe('normalizeZipPath', () => {
  it('combines base directory and relative filename', () => {
    expect(normalizeZipPath('OEBPS', 'chapter1.xhtml')).toBe('OEBPS/chapter1.xhtml');
    expect(normalizeZipPath('EPUB/text', 'sec01.html')).toBe('EPUB/text/sec01.html');
  });

  it('resolves parent directory .. references correctly', () => {
    expect(normalizeZipPath('OEBPS/text', '../images/cover.jpg')).toBe('OEBPS/images/cover.jpg');
    expect(normalizeZipPath('OPS/chapters/sub', '../../toc.ncx')).toBe('OPS/toc.ncx');
  });

  it('strips hash fragments and query strings', () => {
    expect(normalizeZipPath('OEBPS', 'ch1.html#anchor-target')).toBe('OEBPS/ch1.html');
    expect(normalizeZipPath('text', 'page.xhtml?query=param#fragment')).toBe('text/page.xhtml');
  });

  it('handles empty baseDir safely', () => {
    expect(normalizeZipPath('', 'content.opf')).toBe('content.opf');
    expect(normalizeZipPath('', 'OPS/toc.xhtml')).toBe('OPS/toc.xhtml');
  });

  it('decodes percent-encoded path characters', () => {
    expect(normalizeZipPath('OEBPS', 'Chapter%20One.xhtml')).toBe('OEBPS/Chapter One.xhtml');
  });
});
