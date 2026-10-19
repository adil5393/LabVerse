import { describe, it, expect, beforeEach, vi } from 'vitest';
import { evaluateAnswer, parseNumberInput, describeCorrectAnswer } from '../evaluate';
import { lessonStatus, summarizeLesson, migratePersisted, emptyLessonRecord, readinessLabel, nextReadinessStatus, reviewRecommendations, EDU_SCHEMA_VERSION } from '../progress';
import type { ChoiceQuestion, EduLesson, NumericQuestion, VisualQuestion } from '../types';

const choice: ChoiceQuestion = {
  kind: 'choice', id: 'c1', prompt: 'p', options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctId: 'a',
  feedback: { b: { message: 'B is the chord, not the radius.', refresherId: 'ref-radius', misconception: 'chord_vs_radius' } }, explanation: 'Because.',
};
const numeric: NumericQuestion = {
  kind: 'numeric', id: 'n1', prompt: 'p', answer: 5, rules: [{ values: [-5], entry: { message: 'Check the sign.', misconception: 'sign' } }],
  defaultFeedback: { message: 'Try again.' }, explanation: 'Five.',
};
const visual: VisualQuestion = {
  kind: 'visual', id: 'v1', prompt: 'p', visual: { kind: 'x', alt: 'diagram' }, correctId: 'OA',
  feedback: { BC: { message: 'BC joins two points on the circle: that is a chord.', misconception: 'chord_vs_radius' } }, defaultFeedback: { message: 'Look for the segment from the centre.' }, explanation: 'OA starts at the centre.',
};

describe('answer evaluation', () => {
  it('parses numbers strictly', () => {
    expect(parseNumberInput('12')).toBe(12);
    expect(parseNumberInput(' -3.5 ')).toBe(-3.5);
    expect(parseNumberInput('1/2')).toBe(0.5);
    for (const bad of ['', 'abc', '1/0', 'NaN', 'Infinity', '1e400', '--2']) expect(parseNumberInput(bad), bad).toBeNull();
  });
  it('never returns a bare "incorrect": wrong answers get the specific explanation and tags', () => {
    const w = evaluateAnswer(choice, { kind: 'choice', id: 'b' });
    expect(w).toMatchObject({ correct: false, refresherId: 'ref-radius', misconception: 'chord_vs_radius' });
    expect(w.message).toMatch(/chord/);
    expect(evaluateAnswer(choice, { kind: 'choice', id: 'a' }).correct).toBe(true);
    const n = evaluateAnswer(numeric, { kind: 'numeric', text: '-5' });
    expect(n).toMatchObject({ correct: false, misconception: 'sign' });
    expect(evaluateAnswer(numeric, { kind: 'numeric', text: '7' }).message).toBe('Try again.');
    expect(evaluateAnswer(numeric, { kind: 'numeric', text: '10/2' }).correct).toBe(true);
    expect(evaluateAnswer(visual, { kind: 'visual', id: 'BC' }).misconception).toBe('chord_vs_radius');
    expect(evaluateAnswer(visual, { kind: 'visual', id: 'zzz' }).message).toMatch(/centre/);
  });
  it('unreadable or mismatched input is invalid, not wrong', () => {
    expect(evaluateAnswer(numeric, { kind: 'numeric', text: 'abc' }).invalid).toBe(true);
    expect(evaluateAnswer(choice, { kind: 'numeric', text: '1' }).invalid).toBe(true);
    expect(evaluateAnswer(visual, { kind: 'choice', id: 'OA' }).invalid).toBe(true);
  });
  it('describes the correct answer for solution review', () => {
    expect(describeCorrectAnswer(choice)).toBe('A');
    expect(describeCorrectAnswer(numeric)).toBe('5');
  });
});

const lesson = (): EduLesson => ({
  id: 'l1', unitId: 'u1', number: 1, title: 't', objective: 'o', prerequisiteIds: [],
  steps: [{ id: 's1', title: 'a', paragraphs: ['x'] }, { id: 's2', title: 'b', paragraphs: ['y'] }],
  worked: { id: 'w', title: 'w', given: [], ask: '', steps: [{ text: 't', why: 'w' }], verify: 'v' },
  guided: { id: 'g', prompt: '', conclusion: '', steps: [{ id: 'g1', prompt: '', question: numeric, hints: ['h'] }] },
  independent: [
    { id: 'i1', topic: 'topic A', prompt: '', question: numeric, hints: [], solution: [] },
    { id: 'i2', topic: 'topic B', prompt: '', question: numeric, hints: [], solution: [] },
    { id: 'i3', topic: 'topic C', prompt: '', question: numeric, hints: [], solution: [] },
  ],
  reflection: { discover: '', evidence: '', stillConfusing: [] },
});

const ind = (o: Partial<ReturnType<typeof emptyIndep>>) => ({ ...emptyIndep(), ...o });
function emptyIndep() {
  return { attempts: 0, firstAttemptUnassisted: null as boolean | null, correct: false, hintsUsed: 0, solutionShown: false, assisted: false, misconceptions: [] as string[] };
}
const completeRecord = (over: Partial<ReturnType<typeof emptyLessonRecord>> = {}) => ({
  ...emptyLessonRecord(), stepsSeen: ['s1', 's2'], workedSeen: true, guided: { g1: { done: true, hints: 0, wrong: 0 } },
  independent: { i1: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }), i2: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }), i3: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) },
  ...over,
});

describe('honest learning status', () => {
  const L = lesson();
  it('not started / in progress', () => {
    expect(lessonStatus(L, undefined)).toBe('not_started');
    expect(lessonStatus(L, emptyLessonRecord())).toBe('not_started');
    expect(lessonStatus(L, { ...emptyLessonRecord(), stepsSeen: ['s1'] })).toBe('in_progress');
  });
  it('viewing every explanation and the worked example is NOT completion or mastery', () => {
    const r = { ...emptyLessonRecord(), stepsSeen: ['s1', 's2'], workedSeen: true };
    expect(lessonStatus(L, r)).toBe('in_progress');
  });
  it('mastery needs independent, first-attempt, unassisted success', () => {
    expect(lessonStatus(L, completeRecord())).toBe('mastered');
    expect(summarizeLesson(L, completeRecord()).independentUnassisted).toBe(3);
  });
  it('a correct answer after revealing the solution is completion, not mastery', () => {
    const r = completeRecord({ independent: { i1: ind({ attempts: 1, correct: true, firstAttemptUnassisted: false, solutionShown: true, assisted: true }), i2: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }), i3: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) } });
    expect(lessonStatus(L, r)).toBe('needs_review'); // 2 of 3 unassisted = 66.7% < 70%
  });
  it('hints before the first answer make that item assisted', () => {
    const r = completeRecord({ independent: { i1: ind({ attempts: 1, correct: true, firstAttemptUnassisted: false, hintsUsed: 1, assisted: true }), i2: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }), i3: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) } });
    expect(lessonStatus(L, r)).not.toBe('mastered');
  });
  it('a teacher demonstration is "demonstrated" and can never be mastery', () => {
    expect(lessonStatus(L, completeRecord({ teacherDemo: true }))).toBe('demonstrated');
    expect(lessonStatus(L, { ...emptyLessonRecord(), teacherDemo: true })).toBe('demonstrated');
  });
  it('a lesson with items skipped is not complete; abandoned attempts need review once finished', () => {
    const r = completeRecord({ independent: { i1: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) } });
    expect(lessonStatus(L, r)).toBe('in_progress');
  });
  it('review recommendations list each topic once even when several problems share it', () => {
    const L2 = lesson();
    L2.independent[1].topic = 'topic A';
    const r = completeRecord({ independent: { i1: ind({ attempts: 1, correct: true, firstAttemptUnassisted: false, hintsUsed: 1, assisted: true }), i2: ind({ attempts: 2, correct: true, firstAttemptUnassisted: false, misconceptions: ['sign'] }), i3: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) } });
    expect(reviewRecommendations(L2, r)).toEqual([{ topic: 'topic A', misconceptions: ['sign'] }]);
  });
  it('a retry success after an unassisted miss completes but does not master; review recommends the topic and mistakes', () => {
    const r = completeRecord({ independent: { i1: ind({ attempts: 2, correct: true, firstAttemptUnassisted: false, misconceptions: ['sign'] }), i2: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }), i3: ind({ attempts: 1, correct: true, firstAttemptUnassisted: true }) } });
    expect(lessonStatus(L, r)).toBe('needs_review');
    expect(reviewRecommendations(L, r)).toEqual([{ topic: 'topic A', misconceptions: ['sign'] }]);
  });
});

describe('readiness semantics', () => {
  it('bypassed is never "passed"', () => {
    expect(readinessLabel({ status: 'bypassed', attempts: 0, correct: [], missed: [], updatedAt: 0 })).toMatch(/not assessed/);
    expect(readinessLabel(undefined)).toBe('Not checked');
    expect(readinessLabel({ status: 'passed', attempts: 1, correct: ['a'], missed: [], updatedAt: 0 })).toBe('Ready');
    expect(nextReadinessStatus(3, ['a', 'b'])).toBe('needs_review');
    expect(nextReadinessStatus(3, ['a', 'b', 'c'])).toBe('passed');
    expect(nextReadinessStatus(0, [])).toBe('needs_review');
  });
});

describe('persistence migration', () => {
  it('upgrades empty, corrupt and unknown data without throwing', () => {
    for (const bad of [null, undefined, 5, 'x', [], { lessons: 3 }, { readiness: [] }]) {
      const m = migratePersisted(bad);
      expect(m.version).toBe(EDU_SCHEMA_VERSION);
      expect(m.lessons).toEqual({});
    }
  });
  it('preserves valid current-schema records exactly', () => {
    const rec = completeRecord({ updatedAt: 123 });
    const m = migratePersisted({ version: 1, readiness: { p1: { status: 'passed', attempts: 2, correct: ['a'], missed: [], updatedAt: 9 } }, lessons: { l1: rec } });
    expect(m.lessons.l1).toEqual(rec);
    expect(m.readiness.p1.status).toBe('passed');
  });
  it('version-0 boolean results can never become mastery', () => {
    const m = migratePersisted({ lessons: { l1: { stepsSeen: ['s1', 's2'], workedSeen: true, guided: { g1: { done: true } }, independent: { i1: true, i2: true, i3: true } } } });
    expect(lessonStatus(lesson(), m.lessons.l1)).not.toBe('mastered');
    expect(m.lessons.l1.independent.i1.firstAttemptUnassisted).toBe(false);
  });
  it('keeps where the student was for resume, ignores an invalid stage, and treats it as navigation only', () => {
    const m = migratePersisted({ lessons: { l1: { lastStage: 'guided' }, l2: { lastStage: 'bogus' } } });
    expect(m.lessons.l1.lastStage).toBe('guided');
    expect(m.lessons.l2.lastStage).toBeUndefined();
    expect(lessonStatus(lesson(), m.lessons.l1)).toBe('not_started'); // browsing is not progress
  });
  it('drops malformed pieces but keeps the good ones', () => {
    const m = migratePersisted({ lessons: { good: { stepsSeen: ['s1', 5, null] }, bad: 7 }, readiness: { r: { status: 'weird' } } });
    expect(m.lessons.good.stepsSeen).toEqual(['s1']);
    expect(m.lessons.bad).toBeUndefined();
    expect(m.readiness.r.status).toBe('needs_review');
  });
});

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
async function fresh() {
  vi.resetModules();
  return (await import('../../../store/useEducationStore')).useEducationStore;
}

describe('education store', () => {
  beforeEach(() => vi.stubGlobal('localStorage', new MemoryStorage()));
  const KEY = 'labverse_edu_progress_v1';

  it('first-attempt unassisted success is recorded; later retries never rewrite it', async () => {
    const s = (await fresh()).getState;
    s().submitIndependent('l1', 'i1', { correct: true });
    s().submitIndependent('l1', 'i1', { correct: false, misconception: 'x' });
    const r = s().lessons.l1.independent.i1;
    expect(r.firstAttemptUnassisted).toBe(true);
    expect(r.attempts).toBe(2);
    expect(r.correct).toBe(true);
  });
  it('a hint or revealed solution before the first answer makes the item assisted', async () => {
    const s = (await fresh()).getState;
    s().recordIndependentHint('l1', 'i1');
    s().submitIndependent('l1', 'i1', { correct: true });
    expect(s().lessons.l1.independent.i1).toMatchObject({ assisted: true, firstAttemptUnassisted: false, hintsUsed: 1 });
    s().revealIndependentSolution('l1', 'i2');
    s().submitIndependent('l1', 'i2', { correct: true });
    expect(s().lessons.l1.independent.i2.firstAttemptUnassisted).toBe(false);
  });
  it('invalid input is not an attempt', async () => {
    const s = (await fresh()).getState;
    s().submitIndependent('l1', 'i1', { correct: false, invalid: true });
    expect(s().lessons.l1).toBeUndefined();
  });
  it('teacher mode marks the lesson demonstrated and everything assisted', async () => {
    const st = await fresh();
    st.getState().setTeacherMode(true);
    st.getState().submitIndependent('l1', 'i1', { correct: true });
    st.getState().markStepSeen('l1', 's1');
    expect(st.getState().lessons.l1.teacherDemo).toBe(true);
    expect(st.getState().lessons.l1.independent.i1.firstAttemptUnassisted).toBe(false);
    st.getState().setTeacherMode(false);
    expect(st.getState().lessons.l1.teacherDemo).toBe(true); // the flag is sticky
  });
  it('retryAssisted keeps legitimate unassisted work and clears only assisted attempts', async () => {
    const s = (await fresh()).getState;
    s().submitIndependent('l1', 'i1', { correct: true });
    s().revealIndependentSolution('l1', 'i2');
    s().submitIndependent('l1', 'i2', { correct: true });
    s().retryAssisted('l1');
    expect(s().lessons.l1.independent.i1.firstAttemptUnassisted).toBe(true);
    expect(s().lessons.l1.independent.i2).toBeUndefined();
  });
  it('readiness: bypass is recorded as bypassed, never downgrades a pass, and a later pass replaces it', async () => {
    const s = (await fresh()).getState;
    s().bypassReadiness('p1');
    expect(s().readiness.p1.status).toBe('bypassed');
    s().submitReadiness('p1', 2, [{ questionId: 'a', correct: true }, { questionId: 'b', correct: false, refresherId: 'r1', misconception: 'm' }]);
    expect(s().readiness.p1).toMatchObject({ status: 'needs_review', attempts: 1 });
    expect(s().readiness.p1.missed[0]).toMatchObject({ questionId: 'b', refresherId: 'r1' });
    s().submitReadiness('p1', 2, [{ questionId: 'b', correct: true }]);
    expect(s().readiness.p1.status).toBe('passed');
    s().bypassReadiness('p1');
    expect(s().readiness.p1.status).toBe('passed');
  });
  it('remembers the last stage for resume without recording any evidence', async () => {
    const st = await fresh();
    st.getState().setLastStage('l1', 'independent');
    expect(st.getState().lessons.l1.lastStage).toBe('independent');
    expect(st.getState().lessons.l1.stepsSeen).toEqual([]);
    expect(st.getState().lessons.l1.independent).toEqual({});
    const again = await fresh();
    expect(again.getState().lessons.l1.lastStage).toBe('independent');
  });
  it('persists locally, restores in a new session and survives corrupt storage', async () => {
    const first = await fresh();
    first.getState().markStepSeen('l1', 's1');
    first.getState().bypassReadiness('p9');
    expect(JSON.parse(localStorage.getItem(KEY)!).version).toBe(EDU_SCHEMA_VERSION);
    const second = await fresh();
    expect(second.getState().lessons.l1.stepsSeen).toEqual(['s1']);
    expect(second.getState().readiness.p9.status).toBe('bypassed');
    second.getState().resetEducation();
    expect(localStorage.getItem(KEY)).toBeNull();
    localStorage.setItem(KEY, '{broken');
    const third = await fresh();
    expect(third.getState().lessons).toEqual({});
    vi.stubGlobal('localStorage', undefined);
    const fourth = await fresh();
    expect(() => fourth.getState().markStepSeen('l', 's')).not.toThrow();
  });
});
