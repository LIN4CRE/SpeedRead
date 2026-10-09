import { ParsedWord } from '../types/reader';

/**
 * Calculates the Optimal Recognition Point (ORP) index within a word.
 * Research shows readers process words most efficiently when the gaze lands
 * approximately 30-35% into the word.
 */
export function calculateORP(word: string): number {
  if (!word) return 0;
  
  // Strip leading punctuation to find real word characters
  const trimmed = word.replace(/^[^\w\s]+/, '');
  const leadingOffset = word.length - trimmed.length;
  
  // Calculate based on alphanumeric content length
  const alphaChars = trimmed.replace(/[^\w\s]+$/, '');
  const len = alphaChars.length;
  
  let orpInAlpha = 0;
  if (len <= 1) {
    orpInAlpha = 0;
  } else if (len <= 5) {
    orpInAlpha = 1; // 2nd letter
  } else if (len <= 9) {
    orpInAlpha = 2; // 3rd letter
  } else if (len <= 13) {
    orpInAlpha = 3; // 4th letter
  } else {
    orpInAlpha = 4; // 5th letter
  }

  const finalIndex = Math.min(leadingOffset + orpInAlpha, word.length - 1);
  return Math.max(0, finalIndex);
}

/**
 * Parses raw text into enriched ParsedWord objects with punctuation & cadence signals.
 */
export function tokenizeText(
  text: string, 
  chapterIndex = 0, 
  pageNumber = 1,
  startId = 0
): ParsedWord[] {
  if (!text || !text.trim()) return [];

  // Normalize line breaks
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split into paragraphs first to track paragraph breaks
  const rawParagraphs = normalized.split(/\n{2,}/);
  const words: ParsedWord[] = [];
  let currentId = startId;

  for (let pIdx = 0; pIdx < rawParagraphs.length; pIdx++) {
    const para = rawParagraphs[pIdx].trim();
    if (!para) continue;

    // Split on whitespace
    const tokens = para.split(/\s+/).filter(Boolean);
    
    for (let tIdx = 0; tIdx < tokens.length; tIdx++) {
      const raw = tokens[tIdx];
      const isParagraphEnd = tIdx === tokens.length - 1;
      
      const isSentenceEnd = /[.!?…]+["')\]]*$/.test(raw);
      const isClauseEnd = /[,;:\-—]+["')\]]*$/.test(raw);
      const isNumber = /\d/.test(raw);

      words.push({
        id: currentId++,
        raw,
        clean: raw.replace(/^[^\w\d]+|[^\w\d]+$/g, ''),
        orpIndex: calculateORP(raw),
        isSentenceEnd,
        isClauseEnd,
        isParagraphEnd,
        isNumber,
        charCount: raw.length,
        chapterIndex,
        pageNumber,
      });
    }
  }

  return words;
}

/**
 * Calculates word display segments for perfect ORP alignment:
 * returns [leftPart, focalChar, rightPart]
 */
export function splitWordAtORP(word: string, orpIdx: number): {
  left: string;
  focal: string;
  right: string;
} {
  if (!word) return { left: '', focal: '', right: '' };
  const idx = Math.min(Math.max(0, orpIdx), word.length - 1);
  
  return {
    left: word.slice(0, idx),
    focal: word.charAt(idx),
    right: word.slice(idx + 1),
  };
}

/**
 * Compute the delay in milliseconds for a specific word given WPM and pacing settings.
 */
export function computeWordDelay(
  word: ParsedWord,
  wpm: number,
  pacing: {
    sentencePauseMultiplier: number;
    commaPauseMultiplier: number;
    longWordMultiplier: number;
    numberMultiplier: number;
    paragraphPauseMultiplier: number;
  }
): number {
  if (wpm <= 0) return 200;
  
  // Base delay: standard 60,000 ms / WPM
  let delay = 60000 / wpm;

  // Intelligent Punctuation & Morphology Pacing
  if (word.isParagraphEnd) {
    delay *= pacing.paragraphPauseMultiplier;
  } else if (word.isSentenceEnd) {
    delay *= pacing.sentencePauseMultiplier;
  } else if (word.isClauseEnd) {
    delay *= pacing.commaPauseMultiplier;
  }

  // Length modifier
  if (word.charCount >= 9) {
    delay *= pacing.longWordMultiplier;
  } else if (word.charCount <= 2 && !word.isSentenceEnd && !word.isClauseEnd) {
    // Very short words like "a", "to", "in" can be read slightly faster
    delay *= 0.92;
  }

  // Number modifier (brain needs slightly longer to decode numeric sequences)
  if (word.isNumber) {
    delay *= pacing.numberMultiplier;
  }

  return Math.round(delay);
}
