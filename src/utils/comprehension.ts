import { DocumentSource, ComprehensionQuestion, ComprehensionAttempt } from '../types/reader';

/**
 * Calculates comprehension-adjusted Effective Reading Speed:
 * True WPM = round(Raw WPM * (score / totalQuestions))
 */
export function calculateTrueWpm(
  rawWpm: number,
  correctCount: number,
  totalQuestions = 3
): number {
  if (rawWpm <= 0 || totalQuestions <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, correctCount / totalQuestions));
  return Math.round(rawWpm * ratio);
}

export interface ComprehensionFeedback {
  title: string;
  grade: string;
  message: string;
  colorClass: string;
  recommendedWpm: number;
}

export function getComprehensionFeedback(
  score: number,
  total = 3,
  rawWpm = 600
): ComprehensionFeedback {
  const percentage = total > 0 ? (score / total) * 100 : 0;

  if (percentage >= 90) {
    return {
      title: 'Mastery Comprehension',
      grade: 'A+',
      message: 'Exceptional retention! Your working memory captured 100% of key semantic markers at this velocity.',
      colorClass: 'text-emerald-400',
      recommendedWpm: Math.min(1200, rawWpm + 50),
    };
  } else if (percentage >= 60) {
    return {
      title: 'Solid Retention',
      grade: 'B',
      message: 'Reliable comprehension with minimal information loss. You are sustaining high visual throughput.',
      colorClass: 'text-cyan-400',
      recommendedWpm: rawWpm,
    };
  } else if (percentage >= 30) {
    return {
      title: 'Cognitive Strain',
      grade: 'C',
      message: 'Partial recall. Your eyes are scanning slightly faster than deep comprehension integration. Dial back by 50-100 WPM.',
      colorClass: 'text-amber-400',
      recommendedWpm: Math.max(150, rawWpm - 75),
    };
  } else {
    return {
      title: 'Subvocalization Saturation',
      grade: 'D',
      message: 'Cognitive overload detected. RSVP velocity outpaced memory buffering. Dial down speed by 150 WPM to re-anchor comprehension.',
      colorClass: 'text-rose-400',
      recommendedWpm: Math.max(150, rawWpm - 150),
    };
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Extracts sentences and candidate vocabulary from the read portion of a document
 * to generate a tailored 3-question retention quiz.
 */
export function generateComprehensionQuiz(
  doc: DocumentSource,
  readWordIndex: number
): ComprehensionQuestion[] {
  if (!doc || !doc.words || doc.words.length === 0) {
    return createFallbackQuestions('Reading Passage');
  }

  // Define pool of words to quiz from (the portion read so far, or first 120 words)
  const poolEnd = Math.max(25, Math.min(doc.words.length, readWordIndex + 1));
  const pool = doc.words.slice(0, poolEnd);

  // Group pool into sentences
  const sentences: { text: string; words: string[] }[] = [];
  let currentSentenceWords: string[] = [];

  for (const w of pool) {
    currentSentenceWords.push(w.clean || w.raw);
    if (w.isSentenceEnd && currentSentenceWords.length >= 5) {
      sentences.push({
        text: currentSentenceWords.join(' '),
        words: [...currentSentenceWords],
      });
      currentSentenceWords = [];
    }
  }

  // If there's an ongoing sentence with enough words, include it
  if (currentSentenceWords.length >= 5) {
    sentences.push({
      text: currentSentenceWords.join(' '),
      words: [...currentSentenceWords],
    });
  }

  if (sentences.length < 2) {
    return createFallbackQuestions(doc.title);
  }

  const questions: ComprehensionQuestion[] = [];
  const contentWords = pool
    .map((w) => w.clean)
    .filter((w) => w && w.length >= 4 && !/^\d+$/.test(w));

  const uniqueContentWords = Array.from(new Set(contentWords));

  // --- Question 1: Cloze Blank Recall ---
  const q1Sentence = sentences[0];
  const q1Candidates = q1Sentence.words.filter(
    (w) => w.length >= 4 && w !== q1Sentence.words[0] && w !== q1Sentence.words[q1Sentence.words.length - 1]
  );
  const q1TargetWord = q1Candidates.length > 0 
    ? q1Candidates[Math.floor(q1Candidates.length / 2)] 
    : q1Sentence.words[2] || 'world';

  const q1BlankText = q1Sentence.text.replace(new RegExp(`\\b${q1TargetWord}\\b`, 'i'), '_______');
  const q1Distractors = uniqueContentWords
    .filter((w) => w.toLowerCase() !== q1TargetWord.toLowerCase())
    .slice(0, 3);

  while (q1Distractors.length < 3) {
    q1Distractors.push(`choice_${q1Distractors.length + 1}`);
  }

  const q1AllOptions = shuffleArray([q1TargetWord, ...q1Distractors]);
  questions.push({
    id: 'q1-cloze',
    type: 'cloze',
    question: `Complete the sentence from the text:\n"${q1BlankText}"`,
    options: q1AllOptions,
    correctIndex: q1AllOptions.indexOf(q1TargetWord),
    explanation: `Original context: "${q1Sentence.text}"`,
  });

  // --- Question 2: Specific Key Term Context ---
  const q2Sentence = sentences[Math.min(sentences.length - 1, 1)];
  const q2Candidates = q2Sentence.words.filter(
    (w) => w.length >= 5 && w.toLowerCase() !== q1TargetWord.toLowerCase()
  );
  const q2TargetWord = q2Candidates.length > 0
    ? q2Candidates[q2Candidates.length - 1]
    : q2Sentence.words[Math.min(q2Sentence.words.length - 1, 3)] || 'passage';

  const q2Index = q2Sentence.words.indexOf(q2TargetWord);
  const q2Start = Math.max(0, q2Index - 2);
  const q2End = Math.min(q2Sentence.words.length, q2Index + 3);
  const q2Phrase = q2Sentence.words
    .slice(q2Start, q2End)
    .map((w) => (w.toLowerCase() === q2TargetWord.toLowerCase() ? '_______' : w))
    .join(' ');

  const q2Distractors = uniqueContentWords
    .filter((w) => w.toLowerCase() !== q2TargetWord.toLowerCase() && !q1Distractors.includes(w))
    .slice(0, 3);

  while (q2Distractors.length < 3) {
    q2Distractors.push(`term_${q2Distractors.length + 1}`);
  }

  const q2AllOptions = shuffleArray([q2TargetWord, ...q2Distractors]);
  questions.push({
    id: 'q2-vocab',
    type: 'vocabulary',
    question: `Which word was used in this phrase: "... ${q2Phrase} ..."?`,
    options: q2AllOptions,
    correctIndex: q2AllOptions.indexOf(q2TargetWord),
    explanation: `Found in section: "${q2Sentence.text}"`,
  });

  // --- Question 3: Passage Sequence & Detail Recall ---
  const q3Sentence = sentences[sentences.length - 1];
  const q3Words = q3Sentence.words.slice(0, Math.min(4, q3Sentence.words.length));
  const q3CorrectPhrase = q3Words.join(' ');

  const q3Distractors = [
    q3Words.slice().reverse().join(' '),
    `beyond the ${q3Words[0] || 'horizon'}`,
    `under the ${q3Words[q3Words.length - 1] || 'surface'}`,
  ];

  const q3AllOptions = shuffleArray([q3CorrectPhrase, ...q3Distractors]);
  questions.push({
    id: 'q3-theme',
    type: 'theme',
    question: `Which phrase accurately appeared in the text of "${doc.title}"?`,
    options: q3AllOptions,
    correctIndex: q3AllOptions.indexOf(q3CorrectPhrase),
    explanation: `From the concluding sentence of this section: "${q3Sentence.text}"`,
  });

  return questions;
}

function createFallbackQuestions(title: string): ComprehensionQuestion[] {
  return [
    {
      id: 'fb-1',
      type: 'cloze',
      question: `What primary subject was explored in "${title}"?`,
      options: ['The main narrative thread', 'An unrelated footnote', 'A completely separate dialogue', 'Numerical statistical data'],
      correctIndex: 0,
      explanation: 'The primary passage centers around its core narrative theme.',
    },
    {
      id: 'fb-2',
      type: 'vocabulary',
      question: `What was the prevailing narrative cadence of the passage?`,
      options: ['Continuous descriptive prose', 'Tabular rows and columns', 'Morse code notation', 'Inverted punctuation'],
      correctIndex: 0,
      explanation: 'The excerpt is structured as continuous literary prose.',
    },
    {
      id: 'fb-3',
      type: 'theme',
      question: `How did the passage develop its central idea?`,
      options: ['Sequential thematic progression', 'Random disconnected symbols', 'Repeated single-word echoes', 'Abrupt reversed chapters'],
      correctIndex: 0,
      explanation: 'The author develops ideas sequentially through coherent sentences.',
    },
  ];
}
