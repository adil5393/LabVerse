/**
 * Question Bank Validation Tests for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 */

import { describe, it, expect } from 'vitest';
import { CHAPTER_PRACTICE_BANK } from '../practiceBank';
import { validatePracticeAnswer } from '../geometry';

describe('Quadrilateral Practice Question Bank', () => {
  it('contains comprehensive questions across Basic, Standard, and Challenge difficulty tiers', () => {
    expect(CHAPTER_PRACTICE_BANK.length).toBeGreaterThanOrEqual(15);

    const basicCount = CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === 'basic').length;
    const standardCount = CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === 'standard').length;
    const challengeCount = CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === 'challenge').length;

    expect(basicCount).toBeGreaterThan(0);
    expect(standardCount).toBeGreaterThan(0);
    expect(challengeCount).toBeGreaterThan(0);
  });

  it('validates each question has non-empty metadata, hints, and worked solution', () => {
    CHAPTER_PRACTICE_BANK.forEach((q) => {
      expect(q.id).toBeDefined();
      expect(q.title).toBeTruthy();
      expect(q.statement).toBeTruthy();
      expect(q.hints.length).toBeGreaterThan(0);
      expect(q.workedSolution.length).toBeGreaterThan(0);

      if (q.questionType === 'multiple_choice') {
        expect(q.options).toBeDefined();
        expect(q.options?.length).toBeGreaterThanOrEqual(3);
        expect(q.options).toContain(q.correctAnswer);
      }
    });
  });

  it('accurately validates numerical answers with tolerance', () => {
    const q1 = CHAPTER_PRACTICE_BANK.find((q) => q.id === 'quad-q1');
    expect(q1).toBeDefined();
    if (q1) {
      expect(validatePracticeAnswer('85', q1.correctAnswer, q1.acceptableTolerance)).toBe(true);
      expect(validatePracticeAnswer('85.05', q1.correctAnswer, q1.acceptableTolerance)).toBe(true);
      expect(validatePracticeAnswer('90', q1.correctAnswer, q1.acceptableTolerance)).toBe(false);
    }
  });

  it('accurately validates multiple choice string answers with normalization', () => {
    const q3 = CHAPTER_PRACTICE_BANK.find((q) => q.id === 'quad-q3');
    expect(q3).toBeDefined();
    if (q3) {
      expect(validatePracticeAnswer(String(q3.correctAnswer), q3.correctAnswer)).toBe(true);
      expect(validatePracticeAnswer('Wrong answer', q3.correctAnswer)).toBe(false);
    }
  });

  it('verifies that diagram givens contain valid coordinate points', () => {
    CHAPTER_PRACTICE_BANK.forEach((q) => {
      if (q.diagramGivens) {
        expect(Object.keys(q.diagramGivens.points).length).toBeGreaterThan(0);
        Object.values(q.diagramGivens.points).forEach((pt) => {
          expect(typeof pt.x).toBe('number');
          expect(typeof pt.y).toBe('number');
          expect(isNaN(pt.x)).toBe(false);
          expect(isNaN(pt.y)).toBe(false);
        });
      }
    });
  });
});
