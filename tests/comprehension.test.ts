import { describe, it, expect } from 'vitest';
import { 
  calculateTrueWpm, 
  getComprehensionFeedback, 
  generateComprehensionQuiz 
} from '../src/utils/comprehension';
import { SAMPLE_LIBRARY, createDocumentFromSample } from '../src/utils/sampleTexts';
import { DocumentSource } from '../src/types/reader';

describe('calculateTrueWpm', () => {
  it('correctly calculates True WPM based on retention ratio', () => {
    // 600 WPM, 3/3 (100%) -> 600 True WPM
    expect(calculateTrueWpm(600, 3, 3)).toBe(600);
    // 600 WPM, 2/3 (66.7%) -> 400 True WPM
    expect(calculateTrueWpm(600, 2, 3)).toBe(400);
    // 600 WPM, 1/3 (33.3%) -> 200 True WPM
    expect(calculateTrueWpm(600, 1, 3)).toBe(200);
    // 600 WPM, 0/3 (0%) -> 0 True WPM
    expect(calculateTrueWpm(600, 0, 3)).toBe(0);
  });

  it('safely handles non-positive WPM or zero total questions', () => {
    expect(calculateTrueWpm(0, 3, 3)).toBe(0);
    expect(calculateTrueWpm(600, 2, 0)).toBe(0);
  });
});

describe('getComprehensionFeedback', () => {
  it('awards A+ Mastery for perfect score', () => {
    const feedback = getComprehensionFeedback(3, 3, 600);
    expect(feedback.grade).toBe('A+');
    expect(feedback.title).toBe('Mastery Comprehension');
    expect(feedback.recommendedWpm).toBe(650);
  });

  it('awards B Solid Retention for 2/3 score', () => {
    const feedback = getComprehensionFeedback(2, 3, 600);
    expect(feedback.grade).toBe('B');
    expect(feedback.recommendedWpm).toBe(600);
  });

  it('provides corrective recommendations for lower scores', () => {
    const fb1 = getComprehensionFeedback(1, 3, 600);
    expect(fb1.grade).toBe('C');
    expect(fb1.recommendedWpm).toBeLessThan(600);

    const fb0 = getComprehensionFeedback(0, 3, 600);
    expect(fb0.grade).toBe('D');
    expect(fb0.recommendedWpm).toBeLessThan(500);
  });
});

describe('generateComprehensionQuiz', () => {
  it('generates 3 structured questions from a sample book', () => {
    const doc = createDocumentFromSample(SAMPLE_LIBRARY[0]); // Frankenstein
    const questions = generateComprehensionQuiz(doc, 80);

    expect(questions.length).toBe(3);
    for (const q of questions) {
      expect(q.id).toBeDefined();
      expect(q.question.length).toBeGreaterThan(10);
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(5);
    }
  });

  it('falls back gracefully on empty or single-word documents', () => {
    const emptyDoc: DocumentSource = {
      id: 'empty',
      title: 'Empty Note',
      type: 'txt',
      totalWords: 0,
      chapters: [],
      rawText: '',
      words: [],
      dateAdded: Date.now(),
    };

    const questions = generateComprehensionQuiz(emptyDoc, 0);
    expect(questions.length).toBe(3);
    expect(questions[0].options.length).toBe(4);
  });
});
