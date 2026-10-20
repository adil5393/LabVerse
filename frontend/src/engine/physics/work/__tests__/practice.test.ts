import { describe, expect, it } from 'vitest';
import practiceSource from '../practice?raw';
import pageSource from '../../../../features/physics/work/WorkPractice.tsx?raw';
import { evaluateAnswer } from '../../../education/evaluate';
import { allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { WORK_CHAPTER as CH } from '../learn/content';
import { WORK_EXERCISES } from '../exercises';
import { WORK_PRACTICE_CATEGORIES, WORK_PRACTICE_ITEMS, workPracticeByCategory } from '../practice';
import { MOTION_CHAPTER } from '../../motion/learn/content';
import { FORCES_CHAPTER } from '../../forces/learn/content';
import { computeKinetic } from '../kineticModel';
import { computeEnergy, energyAtDistance } from '../energyLab';

// Independent hand calculations for every numerical practice question (not taken from the question data).
const HAND: Record<string, number> = {
  'pr7-w1': 45 * 6, 'pr7-w3': -6 * 0.8,
  'pr7-k1': 0.5 * 70 * 6 * 6, 'pr7-k3': Math.sqrt((2 * 50) / 4), 'pr7-k5': (0.5 * 600 * 10 * 10) / 3000,
  'pr7-u1': 0.8 * 10 * (2.25 - 0.75), 'pr7-u2': 2 * 10 * (3 - 1),
  'pr7-c1': Math.sqrt(2 * 10 * 20), 'pr7-c2': Math.sqrt(2 * 10 * 0.2), 'pr7-c4': (15 * 15) / (2 * 10),
  'pr7-f1': 5 * 10 * 3 - 110,
  'pr7-r1': (150 * 10 * 8) / 12, 'pr7-r3': 40 * 120,
  'pr7-m1': 90 / 3, 'pr7-m2': 4 * 1.5, 'pr7-m3': 6 / 1.5,
  'pr7-l1': (90 * 0.2) / 0.9,
  'pr7-g1': 5 * 6, 'pr7-g2': 4 * 10 * 3, 'pr7-g3': (60 * 10 * 3) / 9,
};

describe('Chapter 7 Chapter Practice bank', () => {
  it('has 33 original questions in every category, with unique ids', () => {
    expect(WORK_PRACTICE_ITEMS.length).toBe(33);
    expect(new Set(WORK_PRACTICE_ITEMS.map((i) => i.id)).size).toBe(33);
    expect(WORK_PRACTICE_CATEGORIES.map((c) => workPracticeByCategory(c.id).length)).toEqual([3, 5, 3, 4, 2, 3, 4, 3, 3, 3]);
    expect(WORK_PRACTICE_ITEMS.filter((i) => i.question.kind === 'numeric').length).toBeGreaterThanOrEqual(18);
    expect(WORK_PRACTICE_ITEMS.filter((i) => i.question.kind === 'choice').length).toBeGreaterThanOrEqual(10);
    expect(WORK_PRACTICE_ITEMS.filter((i) => i.question.visual).length).toBeGreaterThanOrEqual(4);
  });
  it('does not repeat any lesson question, derivation question or NCERT exercise (no repeats to manufacture mastery)', () => {
    const lessonPrompts = new Set(allQuestions(CH).map((x) => x.q.prompt.trim().toLowerCase()));
    const ids = new Set(allQuestions(CH).map((x) => x.q.id));
    const exercisePrompts = WORK_EXERCISES.map((e) => e.summary.trim().toLowerCase());
    const otherIds = new Set([...allQuestions(MOTION_CHAPTER), ...allQuestions(FORCES_CHAPTER)].map((x) => x.q.id));
    const seen = new Set<string>();
    for (const i of WORK_PRACTICE_ITEMS) {
      const p = i.question.prompt.trim().toLowerCase();
      expect(lessonPrompts.has(p), i.id).toBe(false); expect(ids.has(i.id), i.id).toBe(false); expect(otherIds.has(i.id), i.id).toBe(false);
      expect(exercisePrompts.includes(p)).toBe(false); expect(seen.has(p), `${i.id} duplicated`).toBe(false); seen.add(p);
    }
  });
  it('every item maps to a real lesson and one of that lesson\'s objectives, and every lesson is practised', () => {
    for (const i of WORK_PRACTICE_ITEMS) {
      const l = CH.lessons[i.lessonId]; expect(l, i.id).toBeDefined();
      const [lesson, obj] = i.objective.split('/'); expect(lesson).toBe(i.lessonId);
      expect(l.objectives!.map((o) => o.id), `${i.id} objective ${obj}`).toContain(obj);
    }
    for (const id of Object.keys(CH.lessons)) expect(WORK_PRACTICE_ITEMS.some((i) => i.lessonId === id), id).toBe(true);
    const objectives = new Set(WORK_PRACTICE_ITEMS.map((i) => i.objective)); expect(objectives.size).toBeGreaterThanOrEqual(22);
  });
  it('questions are specific: every wrong option explains itself, numeric rules cannot match the right answer, remedial links point at real teaching content', () => {
    const targets = new Set<string>(); for (const l of Object.values(CH.lessons)) l.steps.forEach((s) => targets.add(s.id));
    for (const { question: q, id } of WORK_PRACTICE_ITEMS) {
      expect(q.explanation.length, id).toBeGreaterThan(5);
      if (q.kind === 'choice') {
        expect(new Set(q.options.map((o) => o.text)).size).toBe(q.options.length);
        expect(evaluateAnswer(q, { kind: 'choice', id: q.correctId }).correct).toBe(true);
        for (const o of q.options) if (o.id !== q.correctId) { expect(q.feedback[o.id]?.message?.length ?? 0, `${id} ${o.id}`).toBeGreaterThan(15); const ev = evaluateAnswer(q, { kind: 'choice', id: o.id }); expect(ev.correct).toBe(false); expect(ev.message).toBe(q.feedback[o.id].message); if (q.feedback[o.id].refresherId) expect(targets.has(q.feedback[o.id].refresherId!), `${id}->${q.feedback[o.id].refresherId}`).toBe(true); }
      } else if (q.kind === 'numeric') {
        expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, id).toBe(true);
        for (const r of q.rules ?? []) for (const v of r.values) { expect(Math.abs(v - q.answer), `${id} rule equals the answer`).toBeGreaterThan(q.tolerance ?? 1e-9); expect(evaluateAnswer(q, { kind: 'numeric', text: String(v) }).message).toBe(r.entry.message); if (r.entry.refresherId) expect(targets.has(r.entry.refresherId), `${id}->${r.entry.refresherId}`).toBe(true); expect(r.entry.message.length).toBeGreaterThan(15); }
        if (q.defaultFeedback.refresherId) expect(targets.has(q.defaultFeedback.refresherId), id).toBe(true);
      }
    }
  });
  it('every numerical answer matches an independent hand calculation', () => {
    const numeric = WORK_PRACTICE_ITEMS.filter((i) => i.question.kind === 'numeric');
    for (const i of numeric) { expect(HAND[i.id], `${i.id} missing hand value`).toBeDefined(); expect((i.question as { answer: number }).answer, i.id).toBeCloseTo(HAND[i.id], 9); }
    for (const id of Object.keys(HAND)) expect(numeric.some((i) => i.id === id), `${id} not a numeric item`).toBe(true);
    // figure-based questions agree with the models that draw their figures
    expect(computeKinetic({ massKg: 2, netForce: 5, u: 0, displacement: 6 }).K1).toBe(30);
    const e = computeEnergy({ massKg: 4, startHeight: 3, angleDeg: 90, mu: 0, g: 10, u0: 0, refHeight: 0 }); expect(energyAtDistance(e, e.sEnd).K).toBeCloseTo(120, 9);
  });
  it('practice is isolated from learning progress: it never writes to the store and scores only the first answer', () => {
    for (const src of [practiceSource, pageSource]) { const code = src.replace(/\/\*[\s\S]*?\*\//g, ''); expect(code).not.toMatch(/useEducationStore|localStorage|submitIndependent|markStepSeen/); }
    expect(pageSource).toMatch(/it\.id in f \? f/); expect(pageSource).toMatch(/ev\.invalid/);
  });
});
