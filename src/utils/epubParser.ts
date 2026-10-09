import JSZip from 'jszip';
import { DocumentSource, DocumentChapter, ParsedWord } from '../types/reader';
import { tokenizeText } from './orp';

export interface EPubParseProgress {
  currentChapter: number;
  totalChapters: number;
  percent: number;
  status: string;
}

export function normalizeZipPath(baseDir: string, relativeHref: string): string {
  const cleanHref = relativeHref.split('#')[0].split('?')[0];
  const combined = baseDir ? `${baseDir}/${cleanHref}` : cleanHref;
  const parts = decodeURIComponent(combined).replace(/\\/g, '/').split('/');
  const stack: string[] = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      stack.pop();
    } else {
      stack.push(part);
    }
  }
  return stack.join('/');
}

function findZipFile(zip: JSZip, targetPath: string) {
  let file = zip.file(targetPath);
  if (file) return file;

  const trimmed = targetPath.replace(/^\/+/, '');
  file = zip.file(trimmed);
  if (file) return file;

  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(zip.files)) {
    if (key.toLowerCase() === lower || key.toLowerCase().endsWith('/' + lower)) {
      return zip.files[key];
    }
  }
  return null;
}

export async function parseEpubFile(
  file: File,
  onProgress?: (progress: EPubParseProgress) => void
): Promise<DocumentSource> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Locate container.xml
  const containerFile = findZipFile(zip, 'META-INF/container.xml');
  if (!containerFile) {
    throw new Error('Invalid EPUB: META-INF/container.xml not found.');
  }

  const containerXml = await containerFile.async('string');
  const parser = new DOMParser();
  const containerDoc = parser.parseFromString(containerXml, 'application/xml');
  
  const rootfileEl = containerDoc.querySelector('rootfile') || containerDoc.getElementsByTagName('rootfile')[0];
  const opfPath = rootfileEl?.getAttribute('full-path');
  if (!opfPath) {
    throw new Error('Invalid EPUB: Unable to determine OPF package path.');
  }

  // 2. Read OPF file
  const opfFile = findZipFile(zip, opfPath);
  if (!opfFile) {
    throw new Error(`Invalid EPUB: OPF file at "${opfPath}" not found.`);
  }

  const opfXml = await opfFile.async('string');
  const opfDoc = parser.parseFromString(opfXml, 'application/xml');

  // Extract metadata
  let title = file.name.replace(/\.[^/.]+$/, '');
  const titleEl = opfDoc.querySelector('title') || opfDoc.querySelector('dc\\:title');
  if (titleEl && titleEl.textContent?.trim()) {
    title = titleEl.textContent.trim();
  }

  let author: string | undefined;
  const creatorEl = opfDoc.querySelector('creator') || opfDoc.querySelector('dc\\:creator');
  if (creatorEl && creatorEl.textContent?.trim()) {
    author = creatorEl.textContent.trim();
  }

  // Directory of OPF file to resolve relative links
  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // 3. Build manifest map: id -> href
  const manifestMap = new Map<string, string>();
  const itemEls = opfDoc.querySelectorAll('manifest > item');
  itemEls.forEach((item) => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      manifestMap.set(id, href);
    }
  });

  // 4. Read spine in reading order
  const itemrefEls = opfDoc.querySelectorAll('spine > itemref');
  const spineHrefs: string[] = [];
  itemrefEls.forEach((itemref) => {
    const idref = itemref.getAttribute('idref');
    if (idref && manifestMap.has(idref)) {
      spineHrefs.push(manifestMap.get(idref)!);
    }
  });

  const allWords: ParsedWord[] = [];
  const chapters: DocumentChapter[] = [];
  let fullTextAcc = '';
  const totalItems = spineHrefs.length;

  for (let i = 0; i < totalItems; i++) {
    const rawHref = spineHrefs[i];
    // Resolve relative path using full normalizer and fallback search
    const normalizedHref = normalizeZipPath(opfDir, rawHref);
    const docFile = findZipFile(zip, normalizedHref);

    if (onProgress) {
      onProgress({
        currentChapter: i + 1,
        totalChapters: totalItems,
        percent: Math.round(((i + 1) / totalItems) * 100),
        status: `Extracting section ${i + 1} of ${totalItems}...`,
      });
    }

    if (!docFile) continue;

    const htmlContent = await docFile.async('string');
    const sectionDoc = parser.parseFromString(htmlContent, 'text/html');

    // Remove unwanted elements: script, style, nav, svg
    const unwanted = sectionDoc.querySelectorAll('script, style, nav, svg');
    unwanted.forEach(el => el.remove());

    // Try finding chapter title from h1, h2, h3 or title tag
    let chapterTitle = '';
    const headingEl = sectionDoc.querySelector('h1, h2, h3, title');
    if (headingEl && headingEl.textContent?.trim()) {
      chapterTitle = headingEl.textContent.trim().replace(/\s+/g, ' ').substring(0, 80);
    }
    if (!chapterTitle) {
      chapterTitle = `Chapter ${chapters.length + 1}`;
    }

    // Extract text blocks with spacing
    const blockSelectors = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, dt, dd';
    const blocks = sectionDoc.querySelectorAll(blockSelectors);
    let sectionText = '';

    if (blocks.length > 0) {
      blocks.forEach((b) => {
        const text = b.textContent?.trim();
        if (text) {
          sectionText += (sectionText ? '\n\n' : '') + text;
        }
      });
    } else {
      // Fallback to body text
      sectionText = sectionDoc.body?.textContent?.trim() || '';
    }

    if (sectionText.length > 0) {
      const chapterStartIdx = allWords.length;
      const chapterWords = tokenizeText(sectionText, chapters.length, 1, chapterStartIdx);

      if (chapterWords.length > 0) {
        allWords.push(...chapterWords);
        fullTextAcc += (fullTextAcc ? '\n\n' : '') + `=== ${chapterTitle} ===\n` + sectionText;

        chapters.push({
          id: `chap-${chapters.length + 1}`,
          title: chapterTitle,
          startWordIndex: chapterStartIdx,
          wordCount: chapterWords.length,
        });
      }
    }
  }

  // Fallback if no spine chapters produced words (e.g., non-standard EPUB)
  if (allWords.length === 0) {
    throw new Error('Could not extract readable text from this EPUB file.');
  }

  return {
    id: `epub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    author,
    type: 'epub',
    totalPages: chapters.length,
    totalWords: allWords.length,
    chapters,
    rawText: fullTextAcc,
    words: allWords,
    fileSize: file.size,
    dateAdded: Date.now(),
  };
}
