import { describe, it, expect } from 'vitest';
import { 
  cleanWordKey, 
  lookupDefinition, 
  calculateSM2, 
  exportToAnkiTSV 
} from '../src/utils/vocabulary';
import { VocabularyItem } from '../src/types/reader';

describe('Vocabulary & Spaced Repetition Utility', () => {
  it('cleanWordKey cleans punctuation and lowercases words', () => {
    expect(cleanWordKey('"Ephemeral,"')).toBe('ephemeral');
    expect(cleanWordKey('—Saccade!—')).toBe('saccade');
    expect(cleanWordKey('Subvocalization.')).toBe('subvocalization');
  });

  it('lookupDefinition returns embedded offline definitions accurately', async () => {
    const res = await lookupDefinition('ephemeral');
    expect(res.definition).toContain('short time');
    expect(res.pos).toBe('adj.');

    const resSaccade = await lookupDefinition('saccade');
    expect(resSaccade.definition).toContain('movement of the eye');
  });

  it('calculateSM2 accurately updates repetitions and intervals on correct answers', () => {
    const item: VocabularyItem = {
      id: 'v1',
      word: 'perspicacity',
      cleanWord: 'perspicacity',
      contextSentence: 'His perspicacity was renowned.',
      documentTitle: 'Test Book',
      timestamp: Date.now(),
      definition: 'Insight',
      repetition: 0,
      intervalDays: 1,
      easeFactor: 2.5,
      nextReviewDate: Date.now(),
    };

    // First successful review (Quality 4: Good) -> repetition 1, interval 1
    const review1 = calculateSM2(item, 4);
    expect(review1.repetition).toBe(1);
    expect(review1.intervalDays).toBe(1);

    // Second successful review (Quality 4: Good) -> repetition 2, interval 6
    const review2 = calculateSM2(review1, 4);
    expect(review2.repetition).toBe(2);
    expect(review2.intervalDays).toBe(6);

    // Third successful review -> interval = 6 * 2.5 = 15
    const review3 = calculateSM2(review2, 4);
    expect(review3.repetition).toBe(3);
    expect(review3.intervalDays).toBe(15);
  });

  it('calculateSM2 resets repetition on blackout or failure', () => {
    const item: VocabularyItem = {
      id: 'v2',
      word: 'taciturn',
      cleanWord: 'taciturn',
      contextSentence: 'A taciturn fellow.',
      documentTitle: 'Novel',
      timestamp: Date.now(),
      definition: 'Quiet',
      repetition: 4,
      intervalDays: 30,
      easeFactor: 2.3,
      nextReviewDate: Date.now(),
    };

    // Failed review (Quality 1: Wrong)
    const reset = calculateSM2(item, 1);
    expect(reset.repetition).toBe(0);
    expect(reset.intervalDays).toBe(1);
  });

  it('exportToAnkiTSV generates compliant tab-separated output', () => {
    const items: VocabularyItem[] = [
      {
        id: 'v1',
        word: 'alacrity',
        cleanWord: 'alacrity',
        contextSentence: 'She accepted with alacrity.',
        documentTitle: 'Pride and Prejudice',
        timestamp: Date.now(),
        definition: 'Eagerness',
        partOfSpeech: 'noun',
        repetition: 1,
        intervalDays: 1,
        easeFactor: 2.5,
        nextReviewDate: Date.now(),
      },
    ];

    const tsv = exportToAnkiTSV(items);
    expect(tsv).toContain('#separator:tab');
    expect(tsv).toContain('#html:true');
    expect(tsv).toContain('alacrity');
    expect(tsv).toContain('Eagerness');
    expect(tsv).toContain('Pride and Prejudice');
  });
});
