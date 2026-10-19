import { describe, it, expect, vi } from 'vitest';
import { UD_GUIDED_LESSONS } from '../curriculumPath';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  dump() { return Object.fromEntries(this.m); }
}
const KEY = 'labverse_understanding_data_progress_v1';

async function fresh(seed?: unknown) {
  vi.resetModules();
  const ls = new MemoryStorage();
  if (seed !== undefined) ls.setItem(KEY, typeof seed === 'string' ? seed : JSON.stringify(seed));
  vi.stubGlobal('localStorage', ls);
  const mod = await import('../../../../store/useUnderstandingDataStore');
  return { store: mod.useUnderstandingDataStore, ls };
}

const Q = 'ud-q-sample';

describe('Understanding Data: hint-aware evidence (the EDU-1 P1 defect)', () => {
  it('REGRESSION: a hint requested BEFORE a correct first answer is not an unassisted first-attempt success', async () => {
    const { store } = await fresh();
    store.getState().revealPracticeHint(Q);
    store.getState().submitPracticeAnswer(Q, '42', true);
    const a = store.getState().practiceAnswers[Q];
    expect(a.isCorrect).toBe(true);
    expect(a.firstAttemptCorrect).toBe(false);
    expect(a.assisted).toBe(true);
  });
  it('a solution viewed before the first answer is also assisted, even if the solution is hidden again or the question retried', async () => {
    const { store } = await fresh();
    store.getState().togglePracticeSolution(Q);
    store.getState().togglePracticeSolution(Q);
    store.getState().retryPracticeQuestion(Q);
    store.getState().submitPracticeAnswer(Q, '42', true);
    expect(store.getState().practiceAnswers[Q]).toMatchObject({ firstAttemptCorrect: false, assisted: true });
  });
  it('no help: a correct first answer is independent evidence', async () => {
    const { store } = await fresh();
    store.getState().submitPracticeAnswer(Q, '42', true);
    expect(store.getState().practiceAnswers[Q]).toMatchObject({ firstAttemptCorrect: true, assisted: false });
  });
  it('help AFTER the first answer does not rewrite it', async () => {
    const { store } = await fresh();
    store.getState().submitPracticeAnswer(Q, '42', true);
    store.getState().revealPracticeHint(Q);
    store.getState().togglePracticeSolution(Q);
    expect(store.getState().practiceAnswers[Q]).toMatchObject({ firstAttemptCorrect: true, assisted: false });
  });
  it('wrong then right is not first-try; repeating a question never raises the count', async () => {
    const { store } = await fresh();
    store.getState().submitPracticeAnswer(Q, '1', false);
    store.getState().submitPracticeAnswer(Q, '42', true);
    expect(store.getState().practiceAnswers[Q]).toMatchObject({ firstAttemptCorrect: false, attempts: 2, isCorrect: true });
    store.getState().submitPracticeAnswer('ud-q-other', '42', true);
    store.getState().submitPracticeAnswer('ud-q-other', '42', true);
    store.getState().submitPracticeAnswer('ud-q-other', '42', true);
    expect(Object.values(store.getState().practiceAnswers).filter((x) => x.firstAttemptCorrect)).toHaveLength(1);
  });
  it('a lesson whose every practice answer was given after a hint is not mastered, and one without hints is', async () => {
    const lesson = Object.values(UD_GUIDED_LESSONS).find((l) => l.practiceQuestionIds.length >= 2 && l.stages.length > 0)!;
    for (const helped of [true, false]) {
      const { store } = await fresh();
      store.getState().selectLesson(lesson.id, 'understand');
      for (const id of lesson.practiceQuestionIds) {
        if (helped) store.getState().revealPracticeHint(id);
        store.getState().submitPracticeAnswer(id, 'x', true);
      }
      // satisfy the non-practice requirements so only the help can matter
      const cur = store.getState().lessons[lesson.id];
      const p = { ...cur, predictionMade: true, interactionsRecorded: 99, viewsSeen: lesson.mustVisitViews ?? [], completed: false, mastered: false };
      store.setState({ lessons: { ...store.getState().lessons, [lesson.id]: p } });
      store.getState().completeLesson(lesson.id);
      expect(store.getState().lessons[lesson.id].mastered, `helped=${helped}`).toBe(!helped);
    }
  });
});

describe('Understanding Data: legacy mastery without evidence is kept and marked Unverified', () => {
  const lesson = Object.values(UD_GUIDED_LESSONS).find((l) => l.practiceQuestionIds.length >= 1)!;
  const [first, ...rest] = lesson.practiceQuestionIds;
  const att = (o: object) => ({ userAnswerText: 'x', isCorrect: true, firstAttemptCorrect: true, attempts: 1, hintsRevealed: 0, showSolution: false, ...o });
  const rec = (mastered: boolean) => ({ lessonId: lesson.id, completed: true, mastered, teacherBypassed: false, activeStage: 'practice', stagesCompleted: {}, predictionMade: true, interactionsRecorded: 99, observations: [], countedKeys: [], viewsSeen: lesson.mustVisitViews ?? [] });
  const practice = (firstExtra: object) => Object.fromEntries([[first, att(firstExtra)], ...rest.map((id) => [id, att({})])]);

  it('old "first attempt correct" that also used a hint cannot be verified: mastery becomes Unverified, history kept', async () => {
    const seed = { version: 1, updatedAt: 1, lessons: { [lesson.id]: rec(true) }, practiceAnswers: practice({ hintsRevealed: 1 }) };
    const { store } = await fresh(seed);
    const l = store.getState().lessons[lesson.id];
    expect(l).toMatchObject({ completed: true, mastered: false, legacyMasteryUnverified: true, interactionsRecorded: 99 });
    expect(store.getState().practiceAnswers[first].attempts).toBe(1);
    expect(store.getState().getCompletionStats().completed).toBeGreaterThanOrEqual(1);
    expect(store.getState().getCompletionStats().mastered).toBe(0);
  });
  it('clean legacy evidence keeps its mastery', async () => {
    const seed = { version: 1, updatedAt: 1, lessons: { [lesson.id]: rec(true) }, practiceAnswers: practice({}) };
    const { store } = await fresh(seed);
    expect(store.getState().lessons[lesson.id]).toMatchObject({ mastered: true });
    expect(store.getState().lessons[lesson.id].legacyMasteryUnverified).toBeFalsy();
  });
  it('corrupt storage does not throw', async () => {
    for (const bad of ['nope', '{"lessons":[1]}', 'null']) { const { store } = await fresh(bad); expect(() => store.getState().getCompletionStats()).not.toThrow(); }
  });
});
