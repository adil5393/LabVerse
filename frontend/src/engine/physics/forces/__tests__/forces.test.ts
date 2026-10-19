import { describe, expect, it, vi } from 'vitest';
import appSource from '../../../../App.tsx?raw';
import hubSource from '../../../../features/physics/motion/MotionHub.tsx?raw';
import cartSource from '../../../../features/physics/forces/ForceCart.tsx?raw';
import exercisesSource from '../exercises?raw';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../education/__tests__/chapterIntegrity';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../education/progress';
import type { LessonRecord } from '../../../education/types';
import { subjectCrumb } from '../../../education/subjects';
import { FORCES_CHAPTER as CH } from '../learn/content';
import { FORCES_MAP, FORCES_TEXTBOOK_INVENTORY, forcesCoverageCounts } from '../curriculum';
import { FORCE_EXPERIMENTS, routeOutcome } from '../experiments';
import { FORCE_EXERCISES, forceExerciseCoverage, recomputeForceAnswers, solvedForceExerciseNumbers } from '../exercises';
import { MOTION_CHAPTER } from '../../motion/learn/content';
import { sampleAtTime, DEFAULT_SETUP } from '../forceModel';
import { describeDiagram, netArrow } from '../forceDiagram';
import { toArrows } from '../learn/questions';

describeChapterIntegrity('Forces', CH, ['forceCart', 'forceArrows']);

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
async function fresh() {
  vi.resetModules();
  vi.stubGlobal('localStorage', new MemoryStorage());
  return (await import('../../../../store/useEducationStore')).useEducationStore;
}

describe('Forces chapter registration and Physics preservation', () => {
  it('is a Physics chapter with Physics breadcrumbs and its own routes; Motion and Electricity are untouched', () => {
    expect(subjectCrumb(CH)).toEqual({ label: 'Physics', href: '/physics' });
    expect(CH.routes.landing).toBe('/physics/forces'); expect(CH.routes.learn('pf-l1')).toBe('/physics/forces/learn/pf-l1'); expect(CH.routes.lab).toBe('/physics/forces/lab');
    for (const r of ['/physics/forces', '/physics/forces/lab', '/physics/forces/exercises', '/physics/forces/learn/:lessonId', '/physics/motion', '/physics/motion/learn/:lessonId', '/physics/motion/exercises', '/physics/electricity', '/physics/electricity/workbench']) expect(appSource, r).toContain(`path="${r}"`);
    expect(hubSource).toContain('data-chapter-card="forces"'); expect(hubSource).toContain('data-chapter-card="motion"'); expect(hubSource).toContain('data-chapter-card="electricity"');
  });
  it('lesson and prerequisite ids are distinct from the Motion chapter (progress is stored by id)', () => {
    const mine = [...Object.keys(CH.lessons), ...Object.keys(CH.prerequisites)];
    const theirs = new Set([...Object.keys(MOTION_CHAPTER.lessons), ...Object.keys(MOTION_CHAPTER.prerequisites)]);
    for (const id of mine) expect(theirs.has(id), id).toBe(false);
    const qids = new Set(allQuestions(MOTION_CHAPTER).map((x) => x.q.id));
    for (const x of allQuestions(CH)) expect(qids.has(x.q.id), x.q.id).toBe(false);
  });
  it('the lab never uses the render frame rate as time and respects reduced motion', () => {
    expect(cartSource).toMatch(/tickClock/); expect(cartSource).toContain('useReducedMotion'); expect(cartSource).not.toMatch(/frameCount|frames\s*\+\+/);
  });
  it('figures state the same forces as the arrows that are drawn', () => {
    for (const { where, v } of allVisuals(CH)) if (v.kind === 'forceArrows') {
      const p = v.props as { object: string; forces: { label: string; by: string; magnitude: number; direction: 'left' | 'right' | 'up' | 'down' }[] };
      const arrows = toArrows(p.object, p.forces);
      expect(v.alt, where).toContain(describeDiagram(arrows, netArrow(arrows), { a: 0 }));
    }
    for (const { where, v } of allVisuals(CH)) if (v.kind === 'forceCart') {
      const p = v.props as { setup: typeof DEFAULT_SETUP; t?: number };
      const s = sampleAtTime(p.setup, p.t ?? 0, 20);
      expect(v.alt, where).toContain('Force diagram of the cart.');
      expect(v.alt, where).toContain(Math.abs(s.net) < 1e-9 ? 'net force is zero' : `Net horizontal force ${Math.round(Math.abs(s.net) * 100) / 100} N`);
    }
  });
});

describe('curriculum map and textbook inventory', () => {
  it('lists every verified Section 6.1 to 6.7 and the sixteen exercises, with honest status', () => {
    const sections = FORCES_MAP.map((r) => r.section).join(' ');
    for (const s of FORCES_TEXTBOOK_INVENTORY.sections) expect(sections, s).toContain(s);
    expect(FORCES_TEXTBOOK_INVENTORY.exercises).toBe(16); expect(FORCE_EXERCISES).toHaveLength(16);
    for (const r of FORCES_MAP) { if (r.status === 'planned') { expect(r.lessonIds).toEqual([]); if (r.section !== 'The Journey Beyond') expect(r.milestone, r.id).toBeDefined(); } for (const id of r.lessonIds) expect(CH.lessons[id], `${r.id} -> ${id}`).toBeDefined(); if (r.kind === 'enrichment') expect(r.section).toBe('enrichment'); }
    const c = forcesCoverageCounts(); expect(c.planned).toBeGreaterThanOrEqual(5); expect(c.available + c.planned).toBe(c.total);
  });
  it('only Sections 6.1 to 6.3 are claimed by the Learn lessons', () => {
    const text = JSON.stringify(CH);
    for (const m of text.matchAll(/Section[s]? (6\.\d+(?:\.\d+)?)/g)) expect(['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7'], m[1]).toContain(m[1]);
    expect(CH.ncertNote).toMatch(/upcoming/);
    for (const l of Object.values(CH.lessons)) for (const s of l.steps) if (s.phase === 'observe') expect(s.paragraphs.join(' '), `${l.id}/${s.id}`).not.toMatch(/\bproves?\b|\bproved\b/i);
  });
  it('does not teach that friction always opposes the overall motion', () => {
    const text = JSON.stringify(CH);
    expect(text).toMatch(/tendency to slide/);
    expect(text).toMatch(/truck/);
  });
});

describe('guided investigations A to E follow predict, experiment, observe, explain', () => {
  it('exactly one prediction option holds for every route, and every option explains itself', () => {
    expect(FORCE_EXPERIMENTS.map((e) => e.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
    for (const e of FORCE_EXPERIMENTS) for (const r of e.routes) {
      const out = routeOutcome(r);
      const holds = r.options.filter((o) => o.holds(out.end, out.start));
      expect(holds.length, `${e.id}/${r.id}`).toBe(1);
      for (const o of r.options) expect(o.why.length).toBeGreaterThan(20);
      expect(r.explain(out.end, out.start).length).toBeGreaterThan(20);
    }
  });
  it('model outcomes match hand values', () => {
    const o = (e: string, i: number) => { const r = FORCE_EXPERIMENTS.find((x) => x.id === e)!.routes[i]; return routeOutcome(r); };
    expect(o('A', 0).end.v).toBe(0); expect(o('A', 1).end.v).toBeCloseTo(3, 9);
    expect(o('B', 0).start.a).toBe(2); expect(o('B', 1).start.a).toBe(-2);
    expect(o('C', 0).start.a).toBe(8); expect(o('C', 1).start.a).toBe(2);
    expect(o('D', 0).end.x).toBeCloseTo(60, 6); expect(o('D', 1).end.x).toBeCloseTo(6, 6); expect(o('D', 2).end.v).toBe(6);
    expect(o('D', 3).end.x).toBe(0); expect(o('D', 4).start.a).toBe(3);
    expect(o('E', 0).end.x).toBeCloseTo(40, 9); expect(o('E', 1).end.v).toBeCloseTo(4, 9);
  });
});

describe('NCERT exercise inventory and solutions', () => {
  it('keeps textbook numbering 1 to 16 with the textbook subparts', () => {
    expect(FORCE_EXERCISES.map((e) => e.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    expect(FORCE_EXERCISES[1].parts!.map((p) => p.id)).toEqual(['i', 'ii', 'iii']);
    expect(FORCE_EXERCISES[5].parts).toHaveLength(4);
  });
  it('only questions 1 to 4 are solved; the others are upcoming with a milestone and no solution', () => {
    expect(solvedForceExerciseNumbers()).toEqual([1, 2, 3, 4]);
    for (const e of FORCE_EXERCISES) { expect(e.status === 'solved').toBe(Boolean(e.solution)); if (e.status === 'upcoming') { expect(e.milestone).toBeDefined(); expect(e.lessonIds).toEqual([]); } }
    for (const c of forceExerciseCoverage()) expect(c.missing, `Q${c.number}`).toEqual([]);
  });
  it('every solved solution is complete', () => {
    for (const e of FORCE_EXERCISES.filter((x) => x.solution)) {
      const s = e.solution!;
      expect(s.hint.length).toBeGreaterThan(20); expect(s.principle.length).toBeGreaterThan(30); expect(s.steps.length).toBeGreaterThanOrEqual(3);
      for (const st of s.steps) expect(st.why.length).toBeGreaterThan(10);
      expect(s.commonMistakes.length).toBeGreaterThan(0); expect(s.explanation.length).toBeGreaterThan(20); expect(s.verification.status).toBe('verified');
      expect(s.labs?.length || s.labNote, `Q${e.number} lab or note`).toBeTruthy();
      for (const id of e.lessonIds) expect(CH.lessons[id]).toBeDefined();
    }
  });
  it('numerical results recomputed independently', () => {
    const r = recomputeForceAnswers();
    expect(r.q4).toBe(95 * 200 - 5 * 200); expect(r.q4).toBe(18000);
    expect(r.q3P).toBe(1); expect(r.q3Q).toBeCloseTo(0, 9);
    expect(r.q1FrictionMinusPush).toBeCloseTo(0, 9); expect(r.q1Net).toBeCloseTo(0, 9); expect(r.q1VelocityChange).toBeCloseTo(0, 9);
    expect(Math.abs(r.q2i)).toBeLessThan(1e-12); expect(r.q2ii).toBeGreaterThan(0); expect(r.q2iii).toBeLessThan(0);
  });
  it('the exercise module is isolated from learning progress: viewing a solution can never be mastery evidence', () => {
    const code = exercisesSource.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/useEducationStore|localStorage/);
    for (const i of [...code.matchAll(/^import .* from '([^']+)'/gm)].map((m) => m[1])) expect(i, i).not.toMatch(/store/);
  });
  it('question summaries are original wording', () => {
    const verbatim = ['Using a horizontal force F, a table is moved across the floor', 'While practising for the snake boat race', 'A sailor jumps out from a small boat to the shore'];
    for (const e of FORCE_EXERCISES) for (const v of verbatim) expect(e.summary.includes(v)).toBe(false);
  });
});

describe('Forces mastery uses the shared evidence model', () => {
  const lesson = CH.lessons['pf-l2'];
  it('a hint before a correct first answer is assisted, not independent evidence', async () => {
    const store = await fresh();
    store.getState().recordIndependentHint(lesson.id, 'i1');
    store.getState().submitIndependent(lesson.id, 'i1', { correct: true });
    expect(store.getState().lessons[lesson.id].independent.i1).toMatchObject({ correct: true, assisted: true, firstAttemptUnassisted: false });
  });
  it('navigation alone (completing every step, no independent answers) is not mastery', async () => {
    const store = await fresh();
    for (const s of lesson.steps) store.getState().markStepSeen(lesson.id, s.id);
    expect(lessonStatus(lesson, store.getState().lessons[lesson.id])).not.toBe('mastered');
  });
  const lessons = Object.values(CH.lessons);
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id); r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('every objective is tested by at least two independent items', () => {
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
        expect(lessonStatus(l, rec), `${l.id}/${o.id}`).not.toBe('mastered');
      }
    }
  });
  it('a teacher demonstration is never mastery, and viewing a solution is never a first-try answer', () => {
    const l = lessons[0]; const r = record(l, () => true); r.teacherDemo = true;
    expect(lessonStatus(l, r)).not.toBe('mastered');
    const rec = record(l, () => true); for (const it of l.independent.filter((x) => x.objective === l.objectives![0].id)) rec.independent[it.id] = { ...emptyIndependent(), attempts: 1, correct: true, solutionShown: true, assisted: true, firstAttemptUnassisted: false };
    expect(lessonStatus(l, rec)).not.toBe('mastered');
  });
});
