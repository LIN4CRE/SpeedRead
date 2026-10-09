import * as pdfjsLib from 'pdfjs-dist';
import { DocumentSource, DocumentChapter, ParsedWord } from '../types/reader';
import { tokenizeText } from './orp';

// Initialize PDF.js worker with local bundled asset and CDN fallback
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  try {
    // Vite bundles this as an asset, enabling 100% offline PDF parsing
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  }
}

export interface PDFParseProgress {
  currentPage: number;
  totalPages: number;
  percent: number;
}

export async function parsePdfFile(
  file: File,
  onProgress?: (progress: PDFParseProgress) => void
): Promise<DocumentSource> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  let metadataTitle = file.name.replace(/\.[^/.]+$/, '');
  let metadataAuthor: string | undefined;

  try {
    const meta = await pdfDoc.getMetadata();
    if (meta?.info) {
      const info = meta.info as Record<string, unknown>;
      if (typeof info.Title === 'string' && info.Title.trim()) {
        metadataTitle = info.Title.trim();
      }
      if (typeof info.Author === 'string' && info.Author.trim()) {
        metadataAuthor = info.Author.trim();
      }
    }
  } catch {
    // Non-fatal if metadata read fails
  }

  const allWords: ParsedWord[] = [];
  const chapters: DocumentChapter[] = [];
  let fullTextAcc = '';

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    
    // Group text items with attention to vertical positioning for line breaks
    let pageText = '';
    let lastY: number | null = null;

    for (const item of textContent.items) {
      if ('str' in item) {
        const textItem = item as { str: string; transform: number[] };
        const currentY = textItem.transform[5];
        
        if (lastY !== null && Math.abs(currentY - lastY) > 8) {
          pageText += '\n';
        } else if (pageText.length > 0 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
          pageText += ' ';
        }
        
        pageText += textItem.str;
        lastY = currentY;
      }
    }

    const cleanPageText = pageText.trim();
    if (cleanPageText) {
      const pageStartWordIdx = allWords.length;
      const pageWords = tokenizeText(cleanPageText, pageNum - 1, pageNum, pageStartWordIdx);
      
      allWords.push(...pageWords);
      fullTextAcc += (fullTextAcc ? '\n\n' : '') + `[Page ${pageNum}]\n` + cleanPageText;

      chapters.push({
        id: `page-${pageNum}`,
        title: `Page ${pageNum}`,
        startWordIndex: pageStartWordIdx,
        wordCount: pageWords.length,
        pageNumber: pageNum,
      });
    }

    if (onProgress) {
      onProgress({
        currentPage: pageNum,
        totalPages,
        percent: Math.round((pageNum / totalPages) * 100),
      });
    }
  }

  return {
    id: `pdf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: metadataTitle,
    author: metadataAuthor,
    type: 'pdf',
    totalPages,
    totalWords: allWords.length,
    chapters,
    rawText: fullTextAcc,
    words: allWords,
    fileSize: file.size,
    dateAdded: Date.now(),
  };
}
