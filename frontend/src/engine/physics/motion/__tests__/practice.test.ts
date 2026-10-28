import { describe, expect, it } from 'vitest';
import { evaluateAnswer } from '../../../education/evaluate';
import { allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { MOTION_CHAPTER } from '../learn/content';
import { PRACTICE_CATEGORIES, PRACTICE_ITEMS, practiceByCategory } from '../practice';
import { MOTION_EXERCISES } from '../exercises';
import { MOTION_CHAPTER as CH } from '../learn/content';

// Hand-computed answers for every numerical practice question (independent of the question data).
const HAND: Record<string, number> = {
  'pr-n1': 540 / 6 / 3.6, 'pr-n2': (12 - 2) / 5, 'pr-n3': (12 * 12) / (2 * 1.5), 'pr-n4': (300 - 60) / (100 + 50),
  'pr-g1': 16 * 4 - 0.5 * 2 * 16, 'pr-g2': 2 * 8 + 0.5 * 2 * 64, 'pr-g3': 10 / 2,
  'pr-p1': 6 + -2 * 3, 'pr-p4': 2 * 2,
  'pr-e2': 108 / 3.6, 'pr-m2': 10 * 10 - 0.5 * 2 * 100, 'pr-m4': 100 / 12.5 / (200 / 25),
  'pr-r2': (2 * 3.14 * 20) / 50, 'pr-r3': 2 * 20,
};

describe('Chapter Practice bank', () => {
  it('has original questions in every category, with unique ids', () => {
    expect(PRACTICE_ITEMS.length).toBe(28);
    expect(new Set(PRACTICE_ITEMS.map((i) => i.id)).size).toBe(28);
    for (const c of PRACTICE_CATEGORIES) expect(practiceByCategory(c.id).length, c.id).toBe(4);
  });

  it('does not repeat any lesson question or NCERT exercise question (no repeats to manufacture mastery)', () => {
    const lessonPrompts = new Set(allQuestions(CH).map((x) => x.q.prompt.trim().toLowerCase()));
    const ids = new Set(allQuestions(CH).map((x) => x.q.id));
    const exercisePrompts = MOTION_EXERCISES.map((e) => e.summary.trim().toLowerCase());
    const seen = new Set<string>();
    for (const i of PRACTICE_ITEMS) {
      const p = i.question.prompt.trim().toLowerCase();
      expect(lessonPrompts.has(p), i.id).toBe(false); expect(ids.has(i.id)).toBe(false);
      expect(exercisePrompts.includes(p)).toBe(false); expect(seen.has(p), `${i.id} duplicated`).toBe(false); seen.add(p);
    }
  });

  it('each question points to a real lesson, names a specific mistake for wrong answers, and has a correct option', () => {
    for (const i of PRACTICE_ITEMS) {
      expect(MOTION_CHAPTER.lessons[i.lessonId], i.id).toBeDefined();
      const q = i.question;
      if (q.kind === 'choice') {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        for (const o of q.options) if (o.id !== q.correctId) expect(q.feedback[o.id]?.message.length, `${i.id}/${o.id}`).toBeGreaterThan(20);
      }
      if (q.kind === 'numeric') for (const r of q.rules ?? []) { expect(r.values.every((v) => Math.abs(v - q.answer) > (q.tolerance ?? 0)), `${i.id} rule hits the right answer`).toBe(true); expect(r.entry.message.length).toBeGreaterThan(20); }
    }
  });

  it('every numerical answer equals the hand calculation and is accepted', () => {
    for (const i of PRACTICE_ITEMS) if (i.question.kind === 'numeric') {
      const q = i.question; const want = HAND[i.id];
      expect(want, `${i.id} needs a hand value`).toBeDefined();
      expect(Math.abs(q.answer - want), i.id).toBeLessThanOrEqual(Math.max(q.tolerance ?? 0, 0.01));
      expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }, {}).correct, i.id).toBe(true);
      for (const r of q.rules ?? []) for (const v of r.values) expect(evaluateAnswer(q, { kind: 'numeric', text: String(v) }, {}).correct, `${i.id} wrong ${v}`).toBe(false);
    }
  });

  it('practice is saved only as chapter practice: it never writes lesson evidence', async () => {
    const src = await import('../practice?raw').then((m) => (m as unknown as { default: string }).default);
    expect(src.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/useEducationStore|localStorage/);
    const page = await import('../../../../features/physics/motion/MotionPractice.tsx?raw').then((m) => (m as unknown as { default: string }).default);
    const code = page.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).toMatch(/submitPractice\('motion'/);
    expect(code).not.toMatch(/recordIndependent|submitIndependent|markStepSeen|localStorage/);
  });

  it('the chapter route table now has a practice page', () => { expect(CH.routes.practice).toBe('/physics/motion/practice'); });
});
