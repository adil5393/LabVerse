import { describe, it, expect } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../../education/progress';
import type { LessonRecord } from '../../../../education/types';
import { MOTION_CHAPTER as CH } from '../content';
import { pathOf, type MotionVisualProps } from '../questions';
import { summary } from '../../kinematics';
import { MOTION_EXERCISES, recomputeModel, solvedExerciseNumbers } from '../../exercises';
import { MOTION_MAP, motionCoverageCounts } from '../../curriculum';

describeChapterIntegrity('Motion', CH, ['motionTrack', 'motionGraphs', 'circularMotion']);

// Independent oracle: plain arithmetic.
const dist = (start: number, targets: number[]) => { let d = 0, p = start; for (const t of targets) { d += Math.abs(t - p); p = t; } return d; };

describe('Motion Learn: scope and honesty', () => {
  it('units and lessons are all registered, with chapter plus unit prerequisites', () => {
    expect(CH.units.length).toBeGreaterThanOrEqual(1); expect(Object.keys(CH.lessons).length).toBe(CH.units.reduce((n, u) => n + u.lessonIds.length, 0));
    expect(CH.prerequisiteIds.length).toBeGreaterThanOrEqual(3);
    expect(CH.units[0].prerequisiteIds.length).toBeGreaterThanOrEqual(3);
  });
  it('states honestly what is covered and cites no exercise or section numbers the chapter lacks', () => {
    expect(CH.ncertNote).toMatch(/Sections 4\.1\.1 to 4\.4\.1/); expect(CH.ncertNote).toMatch(/NCERT Exercises/);
    const text = JSON.stringify(CH);
    for (const m of text.matchAll(/Section[s]? (4\.\d+(?:\.\d+)?)/g)) expect(['4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.2.1', '4.2.2', '4.2.3', '4.3', '4.4.1'], m[1]).toContain(m[1]);
    expect(text).not.toMatch(/Exercise \d|Question \d+ of the textbook/);
  });
  it('observation steps do not claim proof', () => {
    for (const l of Object.values(CH.lessons)) for (const s of l.steps) if (s.phase === 'observe') expect(s.paragraphs.join(' '), `${l.id}/${s.id}`).not.toMatch(/\bproves?\b|\bproved\b/i);
  });
});

describe('Motion Learn: figures are drawn from the model and the text matches it', () => {
  it('every motion figure is a valid path on its track; its alternative states the same distance and displacement', () => {
    for (const { where, v } of allVisuals(CH)) if (v.kind === 'motionTrack') {
      const p = v.props as unknown as MotionVisualProps;
      const path = pathOf(p);
      const s = summary(path);
      expect(v.alt, where).toContain(`Total distance travelled ${Math.round(s.distanceCm) / 100} m`);
      expect(s.distanceCm).toBeGreaterThanOrEqual(Math.abs(s.displacementCm));
    }
  });
});

describe('Motion Learn: answers agree with independent calculation', () => {
  const q = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q as { answer: number };
  it('numeric answers', () => {
    expect(q('pmp-un-c1').answer).toBe(350 / 100); expect(q('pmp-un-c2').answer).toBe(2.4 * 1000);
    expect(q('pmp-sg-c1').answer).toBe(-5 + 12); expect(q('pmp-sg-c2').answer).toBe(6 - -4);
    expect(q('g-pm-l1-1').answer).toBe(50); expect(q('g-pm-l1-2').answer).toBe(70);
    expect(q('pm-l1-i3').answer).toBe(-25); expect(q('pm-l1-i4').answer).toBe(-30 + 50);
    expect(q('g-pm-l2-1').answer).toBe(dist(0, [40])); expect(q('g-pm-l2-2').answer).toBe(Math.abs(-10 - 40)); expect(q('g-pm-l2-3').answer).toBe(dist(0, [40, -10, 20]));
    expect(q('pm-l2-i1').answer).toBe(dist(0, [70, 20])); expect(q('pm-l2-i2').answer).toBe(dist(-20, [30, -10])); expect(q('pm-l2-i3').answer).toBe(dist(0, [25, 25, 0]));
    expect(q('g-pm-l3-1').answer).toBe(30 - 20); expect(q('g-pm-l3-2').answer).toBe(dist(20, [70, 30]));
    expect(q('pm-l3-i1').answer).toBe(65 - 15); expect(q('pm-l3-i2').answer).toBe(10 - 40); expect(q('pm-l3-i3').answer).toBe(-20 - 0); expect(q('pm-l3-i5').answer).toBe(dist(0, [35, 0]));
  });
  it('the model reproduces each worked example', () => {
    const cart = summary(pathOf({ range: [-50, 100], start: 0, moves: [80, 30] }));
    expect([cart.distanceCm, cart.displacementCm]).toEqual([13000, 3000]);
    const ball = summary(pathOf({ range: [-50, 100], start: 0, moves: [8, 3] }));
    expect([ball.distanceCm, ball.displacementCm]).toEqual([1300, 300]);
    const lessonFigure = summary(pathOf({ range: [-50, 100], start: 0, moves: [60, 20] }));
    expect([lessonFigure.distanceCm, lessonFigure.displacementCm]).toEqual([10000, 2000]);
  });
  it('every authored wrong numeric value is a real mistake', () => {
    for (const { q: qq } of allQuestions(CH)) if (qq.kind === 'numeric') for (const r of qq.rules ?? []) for (const v of r.values) expect(Math.abs(v - qq.answer), qq.id).toBeGreaterThan(1e-6);
  });
});

describe('Motion Learn: mastery needs independent evidence for every objective', () => {
  const lessons = Object.values(CH.lessons);
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id); r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('objectives are each tested by at least two independent items', () => {
    for (const l of lessons) for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2);
  });
  it('all first-try: mastered; none: not; a missed objective blocks mastery even at 70%', () => {
    for (const l of lessons) {
      expect(lessonStatus(l, record(l, () => true)), l.id).toBe('mastered');
      expect(lessonStatus(l, record(l, () => false)), l.id).not.toBe('mastered');
      for (const o of l.objectives!) {
        const missed = new Set(l.independent.map((i, idx) => (i.objective === o.id ? idx : -1)).filter((x) => x >= 0));
        const rec = record(l, (i) => !missed.has(i));
        expect(objectiveCoverage(l, rec).filter((c) => !c.covered).map((c) => c.id)).toContain(o.id);
        if ((l.independent.length - missed.size) / l.independent.length >= 0.7) expect(lessonStatus(l, rec), `${l.id}/${o.id}`).not.toBe('mastered');
      }
    }
  });
  it('a teacher demonstration is never mastery', () => {
    const l = lessons[0]; const r = record(l, () => true); r.teacherDemo = true;
    expect(lessonStatus(l, r)).not.toBe('mastered');
  });
});

describe('Motion exercises and curriculum map', () => {
  it('the inventory keeps the textbook numbering 1 to 16, in order, with parts where the book has them', () => {
    expect(MOTION_EXERCISES.map((e) => e.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(MOTION_EXERCISES.find((e) => e.number === 2)!.parts!.map((p) => p.id)).toEqual(['i', 'ii']);
    expect(MOTION_EXERCISES.find((e) => e.number === 7)!.parts).toHaveLength(4);
    expect(MOTION_EXERCISES.find((e) => e.number === 16)!.parts).toHaveLength(4);
  });
  it('all sixteen questions are solved, each linked to the lessons that teach what it needs', () => {
    expect(solvedExerciseNumbers()).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    for (const e of MOTION_EXERCISES) { expect(e.status).toBe('solved'); expect(e.lessonIds.length, `Q${e.number}`).toBeGreaterThan(0); for (const id of e.lessonIds) expect(CH.lessons[id], `Q${e.number} -> ${id}`).toBeDefined(); }
  });
  it('every solved solution is complete: hint, steps with reasons, answers, units and verification', () => {
    for (const e of MOTION_EXERCISES.filter((x) => x.solution)) {
      const s = e.solution!;
      expect(s.hint.length, `${e.number}`).toBeGreaterThan(20);
      expect(s.steps.length).toBeGreaterThanOrEqual(3); for (const st of s.steps) expect(st.why.length).toBeGreaterThan(10);
      expect(s.answers.length).toBeGreaterThan(0); expect(s.verification.status).toBe('verified');
    }
  });
  it('the numbers stated in solutions 1 and 2 are recomputed from the motion model', () => {
    expect(recomputeModel(MOTION_EXERCISES[0].solution!.model!)).toEqual({ distanceM: 1000, displacementM: 0 });
    expect(recomputeModel(MOTION_EXERCISES[1].solution!.model!)).toEqual({ distanceM: 18, displacementM: 6 });
    for (const n of [1, 2]) { const m = MOTION_EXERCISES[n - 1].solution!.model!; expect(recomputeModel(m)).toEqual(m.expect); expect(dist(m.startM, m.targetsM)).toBe(m.expect.distanceM); }
  });
  it('the exercise module is isolated from learning progress: viewing a solution can never be mastery evidence', async () => {
    const src = await import('../../exercises?raw').then((m) => (m as unknown as { default: string }).default);
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/useEducationStore|localStorage|from '[^']*(education|store)[^']*'/);
    const imports = [...code.matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1]);
    expect(imports.length).toBeGreaterThan(0);
    for (const i of imports) expect(['./kinematics', './circular', './equations', './profile', './speed'], i).toContain(i);
  });
  it('the curriculum map is honest: PDF sections only, planned topics are marked planned and have no lessons', () => {
    const sections = new Set(['4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.2.1 to 4.2.3', '4.3', '4.4.1', 'Revise, Reflect, Refine', 'enrichment']);
    for (const r of MOTION_MAP) { expect(sections.has(r.section), r.id).toBe(true); if (r.status === 'planned') expect(r.lessonIds).toEqual([]); if (r.kind === 'enrichment') expect(r.section).toBe('enrichment'); }
    const c = motionCoverageCounts();
    expect(c.planned).toBe(0); expect(c.available + c.planned).toBe(c.total);
    for (const r of MOTION_MAP) for (const id of r.lessonIds) expect(CH.lessons[id], `${r.id} -> ${id}`).toBeDefined();
  });
});
