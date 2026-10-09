/**
 * Bionic Reading Utility
 * Emphasizes the initial fixation characters of words to guide the eye's saccades
 * during peripheral reading and paragraph context preview.
 */

export interface BionicWordSegment {
  leadingPunct: string;
  boldPart: string;
  normalPart: string;
  trailingPunct: string;
}

/**
 * Calculates the fixation partition for a single word.
 * Typically 40-50% of alphanumeric characters are emphasized.
 */
export function partitionBionicWord(rawWord: string): BionicWordSegment {
  if (!rawWord) {
    return { leadingPunct: '', boldPart: '', normalPart: '', trailingPunct: '' };
  }

  // Extract leading punctuation
  const leadingMatch = rawWord.match(/^[^\p{L}\p{N}]+/u);
  const leadingPunct = leadingMatch ? leadingMatch[0] : '';
  const withoutLeading = rawWord.slice(leadingPunct.length);

  // Extract trailing punctuation
  const trailingMatch = withoutLeading.match(/[^\p{L}\p{N}]+$/u);
  const trailingPunct = trailingMatch ? trailingMatch[0] : '';
  const coreAlpha = withoutLeading.slice(0, withoutLeading.length - trailingPunct.length);

  if (!coreAlpha) {
    return { leadingPunct: rawWord, boldPart: '', normalPart: '', trailingPunct: '' };
  }

  const len = coreAlpha.length;
  let boldLength = 1;

  if (len <= 1) {
    boldLength = 1;
  } else if (len <= 3) {
    boldLength = 1; // "the" -> "t" or "th", 1-2 chars
  } else if (len <= 5) {
    boldLength = 2; // "speed" -> "sp"
  } else if (len <= 8) {
    boldLength = 3; // "reading" -> "rea"
  } else if (len <= 11) {
    boldLength = 4; // "cognition" -> "cogn"
  } else {
    boldLength = Math.ceil(len * 0.45);
  }

  const boldPart = coreAlpha.slice(0, boldLength);
  const normalPart = coreAlpha.slice(boldLength);

  return {
    leadingPunct,
    boldPart,
    normalPart,
    trailingPunct,
  };
}
