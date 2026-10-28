import { describe, expect, it } from 'vitest';
import { SOUND_CHAPTER as CH } from '../learn/content';
import { frequencyFromCount, frequencyOf, periodFromFrequency, reflectorDistance, roundTripTime, travelTime, wavelengthOf } from '../characteristics';
import { evaluateAnswer } from '../../../education/evaluate';
import type { NumericQuestion, Question } from '../../../education/types';

const numQ = (lessonId: string, id: string): NumericQuestion => {
  const l = CH.lessons[lessonId];
  const all: Question[] = [...l.independent.map((i) => i.question), ...l.guided.steps.map((g) => g.question)];
  const q = all.find((x) => x.id === id);
  if (!q || q.kind !== 'numeric') throw new Error(`no numeric question ${id}`);
  return q;
};

describe('Lessons 7 to 12: every numeric answer equals the model', () => {
  it('Lesson 7 (T ν = 1)', () => {
    expect(numQ('ps-l7', 'ps-g7-1').answer).toBe(frequencyFromCount(12, 3));
    expect(numQ('ps-l7', 'ps-g7-2').answer).toBeCloseTo(periodFromFrequency(4), 12);
    expect(numQ('ps-l7', 'ps-l7-i3').answer).toBeCloseTo(periodFromFrequency(250), 12);
    expect(numQ('ps-l7', 'ps-l7-i4').answer).toBeCloseTo(1 / 0.002, 9);
  });
  it('Lesson 9 (v = ν λ)', () => {
    expect(numQ('ps-l9', 'ps-g9-1').answer).toBeCloseTo(wavelengthOf(340, 680), 12);
    expect(numQ('ps-l9', 'ps-g9-2').answer).toBeCloseTo(travelTime(1700, 340), 12);
    expect(numQ('ps-l9', 'ps-l9-i1').answer).toBeCloseTo(400 * 0.85, 9);
    expect(numQ('ps-l9', 'ps-l9-i2').answer).toBeCloseTo(wavelengthOf(343, 1000), 12);
    expect(numQ('ps-l9', 'ps-l9-i4').answer).toBeCloseTo(1500 / 340, 2);
  });
  it('Lessons 11 and 12 (d = v t ÷ 2)', () => {
    expect(numQ('ps-l11', 'ps-g11-2').answer).toBe(reflectorDistance(340, 1));
    expect(numQ('ps-l11', 'ps-l11-i3').answer).toBe(reflectorDistance(330, 2));
    expect(numQ('ps-l11', 'ps-l11-i4').answer).toBeCloseTo(reflectorDistance(344, 0.1), 12);
    expect(numQ('ps-l12', 'ps-g12-2').answer).toBe(reflectorDistance(1500, 5));
    expect(numQ('ps-l12', 'ps-l12-i5').answer).toBe(reflectorDistance(1500, 4));
    expect(numQ('ps-l12', 'ps-l12-i6').answer).toBe(roundTripTime(750, 1500));
  });
  it('worked examples agree with the model', () => {
    expect(wavelengthOf(340, 500)).toBeCloseTo(0.68, 12);
    expect(wavelengthOf(1500, 500)).toBe(3);
    expect(reflectorDistance(340, 0.6)).toBeCloseTo(102, 9);
    expect(roundTripTime(10, 340)).toBeLessThan(0.1);
    expect(reflectorDistance(1530, 0.4)).toBeCloseTo(306, 9);
    expect(frequencyOf(340, 2)).toBe(170);
  });
});

describe('chapter practice bank', () => {
  const items = CH.practice!.groups.flatMap((g) => g.items);
  it('covers every unit, has difficulty and marks, and every right answer is accepted', () => {
    expect(CH.practice!.groups.map((g) => g.id)).toEqual(['g-making', 'g-wave', 'g-describe', 'g-reflect']);
    for (const it of items) {
      expect(it.difficulty, it.id).toBeDefined();
      const q = it.question;
      const input = q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : null;
      expect(evaluateAnswer(q, input!).correct, it.id).toBe(true);
    }
  });
  it('numeric practice answers equal the model', () => {
    const a = (id: string) => (items.find((i) => i.id === id)!.question as NumericQuestion).answer;
    expect(a('sp-7')).toBeCloseTo(periodFromFrequency(400), 12);
    expect(a('sp-9')).toBeCloseTo(wavelengthOf(344, 256), 2);
    expect(a('sp-10')).toBeCloseTo(frequencyOf(340, 0.68), 9);
    expect(a('sp-11')).toBeCloseTo(travelTime(1000, 5000), 12);
    expect(a('sp-14')).toBeCloseTo(travelTime(1324, 331), 12);
    expect(a('sp-15')).toBeCloseTo(reflectorDistance(340, 0.2), 12);
    expect(a('sp-17')).toBeCloseTo(reflectorDistance(1500, 1.2), 9);
  });
});
