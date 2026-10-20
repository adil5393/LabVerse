import { describe, expect, it } from 'vitest';
import practiceSource from '../practice?raw';
import { evaluateAnswer } from '../../../education/evaluate';
import { allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { FORCES_CHAPTER as CH } from '../learn/content';
import { FORCE_EXERCISES } from '../exercises';
import { FORCE_PRACTICE_CATEGORIES, FORCE_PRACTICE_ITEMS, forcePracticeByCategory } from '../practice';
import { JOURNEY_ITEMS, QUEST_EXPERIMENTS, questOutcome } from '../journeyBeyond';
import { sampleAtTime } from '../forceModel';

// Independent hand calculations for every numerical practice question.
const HAND: Record<string, number> = {
  'fp-b1': 14 - 9, 'fp-b3': 520 - 450, 'fp-f1': 35, 'fp-f2': 22, 'fp-i3': (2 * 6) / 6,
  'fp-s1': 1200 * 1.5, 'fp-s2': 30 / 6, 'fp-s3': (50 - 30) / 10, 'fp-s5': 70 * 10,
  'fp-m1': 4 * 3, 'fp-m2': 5 * (-3 - 2), 'fp-m3': 30 / 0.1, 'fp-t3': 10 / 4, 'fp-t5': 12000 - 8000,
  'fp-y1': 24 / (2 + 4), 'fp-y2': 4 * (24 / 6), 'fp-y3': 24 - 4 * (24 / 6),
};

describe('Chapter 6 practice bank', () => {
  it('has 29 original questions with unique ids in every category', () => {
    expect(FORCE_PRACTICE_ITEMS.length).toBe(29);
    expect(new Set(FORCE_PRACTICE_ITEMS.map((i) => i.id)).size).toBe(29);
    for (const c of FORCE_PRACTICE_CATEGORIES) expect(forcePracticeByCategory(c.id).length, c.id).toBeGreaterThanOrEqual(3);
    expect(FORCE_PRACTICE_CATEGORIES.find((c) => c.id === 'momentum')!.enrichment).toBe(true);
  });
  it('repeats no lesson question or NCERT exercise, and points at real lessons', () => {
    const prompts = new Set(allQuestions(CH).map((x) => x.q.prompt.trim().toLowerCase()));
    const ids = new Set(allQuestions(CH).map((x) => x.q.id));
    const ex = FORCE_EXERCISES.map((e) => e.summary.trim().toLowerCase());
    for (const i of FORCE_PRACTICE_ITEMS) {
      const p = i.question.prompt.trim().toLowerCase();
      expect(prompts.has(p), i.id).toBe(false); expect(ids.has(i.id), i.id).toBe(false); expect(ex.includes(p)).toBe(false);
      expect(CH.lessons[i.lessonId], i.id).toBeDefined();
    }
  });
  it('every wrong option or wrong-value rule explains itself and cannot match the right answer', () => {
    for (const { question: q, id } of FORCE_PRACTICE_ITEMS) {
      if (q.kind === 'choice') {
        expect(evaluateAnswer(q, { kind: 'choice', id: q.correctId }).correct, id).toBe(true);
        for (const o of q.options) if (o.id !== q.correctId) expect(q.feedback[o.id]?.message?.length ?? 0, `${id}/${o.id}`).toBeGreaterThan(15);
      } else if (q.kind === 'numeric') {
        expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, id).toBe(true);
        for (const r of q.rules ?? []) for (const v of r.values) expect(Math.abs(v - q.answer), `${id} rule equals the answer`).toBeGreaterThan(q.tolerance ?? 1e-9);
      }
    }
  });
  it('every numerical answer matches an independent hand calculation', () => {
    const numeric = FORCE_PRACTICE_ITEMS.filter((i) => i.question.kind === 'numeric');
    for (const i of numeric) { expect(HAND[i.id], `${i.id} missing hand value`).toBeDefined(); expect((i.question as { answer: number }).answer, i.id).toBeCloseTo(HAND[i.id], 9); }
    expect(Object.keys(HAND).length).toBe(numeric.length);
  });
  it('is isolated from learning progress: no store, no storage', () => {
    expect(practiceSource.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/useEducationStore|localStorage/);
  });
});

describe('Journey Beyond: friction questions (investigation U)', () => {
  it('exactly one prediction option holds for every route, with hand values from the cart model', () => {
    expect(QUEST_EXPERIMENTS.map((e) => e.id)).toEqual(['U']);
    for (const r of QUEST_EXPERIMENTS[0].routes) { const o = questOutcome(r); expect(o.holdsIndex).toBeLessThan(r.options.length); expect(o.holdsIndex, r.id).toBeGreaterThanOrEqual(0); for (const x of r.options) expect(x.why.length).toBeGreaterThan(25); }
    const at = (id: string) => { const r = QUEST_EXPERIMENTS[0].routes.find((x) => x.id === id)!; return sampleAtTime(r.setup, r.tEnd, r.tEnd); };
    expect(at('u3').v).toBe(0); expect(at('u2').v).toBe(0); expect(at('u1').v).toBeGreaterThan(0); expect(at('u4').a).toBeCloseTo(0.5, 9);
  });
  it('lists the four closing activities with an honest status', () => {
    expect(JOURNEY_ITEMS.map((j) => j.status)).toEqual(['explorable', 'follow-up', 'follow-up', 'external']);
  });
});
