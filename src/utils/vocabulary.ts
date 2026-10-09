import { VocabularyItem } from '../types/reader';

const VOCAB_STORAGE_KEY = 'speedread_vocabulary_vault_v1';

// Embedded offline definitions for high-frequency speed reading literature words
const OFFLINE_DICTIONARY: Record<string, { definition: string; pos: string }> = {
  ephemeral: { definition: 'Lasting for a very short time; transitory.', pos: 'adj.' },
  saccade: { definition: 'A rapid, jerky movement of the eye between fixation points.', pos: 'noun' },
  reticle: { definition: 'A net of fine lines or markings in the eyepiece of an optical instrument acting as a visual guide.', pos: 'noun' },
  subvocalization: { definition: 'The internal speech made when reading words; silent speech that limits reading speed.', pos: 'noun' },
  ineffable: { definition: 'Too great or extreme to be expressed or described in words.', pos: 'adj.' },
  alacrity: { definition: 'Brisk and cheerful readiness; eager promptness.', pos: 'noun' },
  ubiquitous: { definition: 'Present, appearing, or found everywhere.', pos: 'adj.' },
  perspicacity: { definition: 'The quality of having a ready insight into things; shrewdness.', pos: 'noun' },
  eloquence: { definition: 'Fluent or persuasive speaking or writing.', pos: 'noun' },
  serendipity: { definition: 'The occurrence and development of events by chance in a happy or beneficial way.', pos: 'noun' },
  paradigm: { definition: 'A typical example or pattern of something; a model or overarching framework.', pos: 'noun' },
  taciturn: { definition: 'Reserved or uncommunicative in speech; saying little.', pos: 'adj.' },
  pernicious: { definition: 'Having a harmful effect, especially in a gradual or subtle way.', pos: 'adj.' },
  sagacious: { definition: 'Having or showing keen mental discernment and good judgment; wise.', pos: 'adj.' },
  meticulous: { definition: 'Showing great attention to detail; very careful and precise.', pos: 'adj.' },
  epistemology: { definition: 'The theory of knowledge, especially with regard to its methods, validity, and scope.', pos: 'noun' },
  tenacious: { definition: 'Tending to keep a firm hold of something; clinging or adhering closely; persistent.', pos: 'adj.' },
  cacophony: { definition: 'A harsh, discordant mixture of sounds.', pos: 'noun' },
  luminous: { definition: 'Giving off light; bright or shining.', pos: 'adj.' },
  surprisal: { definition: 'In information theory, a measure of information content or unexpectedness of an event.', pos: 'noun' },
};

/**
 * Load all saved vocabulary items from localStorage
 */
export function loadVocabularyItems(): VocabularyItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(VOCAB_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse vocabulary vault:', err);
    return [];
  }
}

/**
 * Persist vocabulary items to localStorage
 */
export function saveVocabularyItems(items: VocabularyItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save vocabulary items:', err);
  }
}

/**
 * Clean a word token down to lowercase alphanumeric characters
 */
export function cleanWordKey(word: string): string {
  return word.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

/**
 * Look up word definition locally or via public free dictionary API
 */
export async function lookupDefinition(rawWord: string): Promise<{ definition: string; pos: string }> {
  const clean = cleanWordKey(rawWord);
  if (!clean) {
    return { definition: 'Word not recognized', pos: '' };
  }

  // 1. Check embedded offline lexicon
  if (OFFLINE_DICTIONARY[clean]) {
    return OFFLINE_DICTIONARY[clean];
  }

  // 2. Network query to Free Dictionary API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(clean)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].meanings?.length > 0) {
        const meaning = data[0].meanings[0];
        const def = meaning.definitions?.[0]?.definition || '';
        const pos = meaning.partOfSpeech || '';
        if (def) {
          return { definition: def, pos };
        }
      }
    }
  } catch (e) {
    // API unavailable or offline
  }

  return {
    definition: `Definition for '${clean}'. Tap to write custom note or definition.`,
    pos: '',
  };
}

/**
 * Add a new vocabulary item to the vault
 */
export async function addVocabularyItem(
  word: string,
  contextSentence: string,
  documentTitle: string
): Promise<VocabularyItem> {
  const items = loadVocabularyItems();
  const clean = cleanWordKey(word);

  // Check if item already exists
  const existing = items.find((i) => i.cleanWord === clean);
  if (existing) {
    return existing;
  }

  const { definition, pos } = await lookupDefinition(word);

  const newItem: VocabularyItem = {
    id: `vocab_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    word,
    cleanWord: clean,
    contextSentence: contextSentence.trim(),
    documentTitle,
    timestamp: Date.now(),
    definition,
    partOfSpeech: pos,
    repetition: 0,
    intervalDays: 1,
    easeFactor: 2.5,
    nextReviewDate: Date.now(), // Due immediately for initial review
  };

  const updated = [newItem, ...items];
  saveVocabularyItems(updated);
  return newItem;
}

/**
 * SuperMemo SM-2 Spaced Repetition calculation
 * quality: 0 (Blackout), 1 (Wrong), 2 (Hard wrong), 3 (Hard correct), 4 (Good), 5 (Easy)
 */
export function calculateSM2(
  item: VocabularyItem,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): VocabularyItem {
  let { repetition, intervalDays, easeFactor } = item;

  if (quality >= 3) {
    if (repetition === 0) {
      intervalDays = 1;
    } else if (repetition === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetition += 1;
  } else {
    repetition = 0;
    intervalDays = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const nextReviewDate = Date.now() + intervalDays * ONE_DAY_MS;

  return {
    ...item,
    repetition,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(3)),
    nextReviewDate,
    lastReviewedDate: Date.now(),
  };
}

/**
 * Export vocabulary items to Anki-compatible TSV format
 */
export function exportToAnkiTSV(items: VocabularyItem[]): string {
  // Front: Word [Part of Speech] <br><i>Context Sentence</i>
  // Back: Definition <br><small>Source: Book Title</small>
  // Tags: SpeedRead Vocabulary
  const lines = [
    '#separator:tab',
    '#html:true',
    '#tags column:3',
  ];

  for (const item of items) {
    const front = `<b>${item.cleanWord}</b> ${item.partOfSpeech ? `<i>(${item.partOfSpeech})</i>` : ''}<br><br><span style="color:#888;">"${item.contextSentence.replace(/\t/g, ' ')}"</span>`;
    const back = `${item.definition?.replace(/\t/g, ' ') || 'No definition'}<br><br><small style="color:#666;">Source: ${item.documentTitle.replace(/\t/g, ' ')}</small>`;
    const tag = 'SpeedRead_Vocabulary';
    lines.push(`${front}\t${back}\t${tag}`);
  }

  return lines.join('\n');
}

/**
 * Helper to download text as a file in browser
 */
export function downloadTextFile(filename: string, content: string, mimeType = 'text/tab-separated-values;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
