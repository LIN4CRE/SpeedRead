import { ParsedWord } from '../types/reader';

/**
 * Calculates the Optimal Recognition Point (ORP) index within a word.
 * Research shows readers process words most efficiently when the gaze lands
 * approximately 30-35% into the word.
 */
export function calculateORP(word: string): number {
  if (!word) return 0;
  
  // Strip leading punctuation to find real word characters (supports all Unicode letters)
  const trimmed = word.replace(/^[^\p{L}\p{N}\s]+/u, '');
  const leadingOffset = word.length - trimmed.length;
  
  // Calculate based on alphanumeric content length
  const alphaChars = trimmed.replace(/[^\p{L}\p{N}\s]+$/u, '');
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

  // Normalize line breaks and unspaced em-dashes
  const normalized = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/(\p{L})—(\p{L})/gu, '$1 — $2')
    .replace(/(\p{L})--(\p{L})/gu, '$1 -- $2');
  
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
      
      const isSentenceEnd = /[.!?…]+["')\]”’]*$/.test(raw);
      const isClauseEnd = /[,;:\-—]+["')\]”’]*$/.test(raw);
      const isNumber = /^\d+$/.test(raw.replace(/[^\d]/g, ''));

      words.push({
        id: currentId++,
        raw,
        clean: raw.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''),
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

// Common English functional stop words
const COMMON_STOP_WORDS = new Set([
  'a', 'about', 'all', 'also', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'been',
  'but', 'by', 'can', 'do', 'down', 'even', 'for', 'from', 'get', 'had', 'has',
  'have', 'he', 'her', 'here', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is',
  'it', 'its', 'just', 'like', 'me', 'more', 'my', 'no', 'not', 'now', 'of', 'on',
  'one', 'only', 'or', 'other', 'our', 'out', 'over', 'said', 'she', 'so', 'some',
  'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'time', 'to', 'two', 'up', 'us', 'was', 'we', 'were', 'what', 'when', 'which',
  'who', 'will', 'with', 'would', 'you', 'your'
]);

/**
 * Calculates estimated lexical surprisal / cognitive decoding multiplier.
 * Stop words have near-zero surprisal and are processed rapidly (~0.88x delay).
 * Polysyllabic, rare, or dense words require longer dwell (~1.10x - 1.25x delay).
 */
export function calculateLexicalSurprisal(rawWord: string): number {
  if (!rawWord) return 1.0;
  const word = rawWord.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
  if (!word) return 1.0;

  // Acronym check (e.g. NASA, DNA, RSVP, LLM, PWA)
  if (rawWord.length >= 2 && rawWord === rawWord.toUpperCase() && /^[A-Z]+$/.test(rawWord)) {
    return 1.20;
  }

  // Hyphenated compound check (e.g. state-of-the-art)
  if (rawWord.includes('-') && rawWord.length >= 6) {
    return 1.15;
  }

  // High-frequency functional stop words
  if (COMMON_STOP_WORDS.has(word)) {
    return 0.88;
  }

  // Syllable count estimation
  const cleanVowels = word.replace(/e$/i, '').match(/[aeiouy]{1,2}/gi);
  const syllables = cleanVowels ? cleanVowels.length : 1;

  if (syllables >= 4 || word.length >= 11) {
    return 1.20;
  } else if (syllables >= 3 || word.length >= 8) {
    return 1.10;
  }

  return 1.0;
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
    enableSurprisal?: boolean;
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

  // Lexical Surprisal & Complexity-Adaptive Pacing
  if (pacing.enableSurprisal !== false) {
    if (!word.isSentenceEnd && !word.isClauseEnd && !word.isParagraphEnd && !word.isNumber) {
      const surprisal = calculateLexicalSurprisal(word.clean || word.raw);
      if (word.charCount <= 2 && surprisal < 1.0) {
        delay *= 0.96;
      } else {
        delay *= surprisal;
      }
    }
  }

  return Math.round(delay);
}
