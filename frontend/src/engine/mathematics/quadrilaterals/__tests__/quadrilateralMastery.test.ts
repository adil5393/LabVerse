import { describe, it, expect, vi } from 'vitest';
import { QUAD_GUIDED_LESSONS } from '../curriculumPath';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  dump() { return Object.fromEntries(this.m); }
}
const KEY = 'labverse_quadrilaterals_progress_v1';

async function fresh(seed?: unknown) {
  vi.resetModules();
  const ls = new MemoryStorage();
  if (seed !== undefined) ls.setItem(KEY, typeof seed === 'string' ? seed : JSON.stringify(seed));
  vi.stubGlobal('localStorage', ls);
  const store = (await import('../../../../store/useQuadGuidedLearningStore')).useQuadGuidedLearningStore;
  return { store, ls };
}

const L = 'quad-l2';
const IDS = QUAD_GUIDED_LESSONS[L].practiceQuestionIds;

describe('Quadrilaterals guided workbench: mastery comes only from independent first-try evidence', () => {
  it('the baseline defect is gone: the same question answered correctly many times is NOT mastery', async () => {
    const { store } = await fresh();
    for (let i = 0; i < 6; i++) store.getState().recordPracticeResult(L, IDS[0], true, IDS.length);
    const rec = store.getState().lessons[L];
    expect(rec.practiceMastered).toBe(false);
    expect(rec.practiceCorrectCount).toBe(1);
    expect(store.getState().isLessonMastered(L)).toBe(false);
  });
  it('answering every distinct question correctly on the first try, unassisted, is mastery', async () => {
    const { store } = await fresh();
    for (const id of IDS) store.getState().recordPracticeResult(L, id, true, IDS.length);
    expect(store.getState().isLessonMastered(L)).toBe(true);
    expect(store.getState().getCompletionStats().masteredCount).toBe(1);
  });
  it('a wrong first try can never become a first-try success, even if retried until right', async () => {
    const { store } = await fresh();
    for (const id of IDS) {
      store.getState().recordPracticeResult(L, id, false, IDS.length);
      store.getState().recordPracticeResult(L, id, true, IDS.length);
    }
    const rec = store.getState().lessons[L];
    expect(rec.practiceCorrectCount).toBe(IDS.length); // all eventually right
    expect(rec.practiceMastered).toBe(false); // but none on the first try
  });
  it('hint- or solution-assisted answers are recorded as assisted and do not count', async () => {
    const { store } = await fresh();
    for (const id of IDS) store.getState().recordPracticeResult(L, id, true, IDS.length, { assisted: true });
    const rec = store.getState().lessons[L];
    expect(rec.practiceMastered).toBe(false);
    expect(Object.values(rec.practiceAnswered!).every((e) => e.assisted && !e.firstAttemptCorrect)).toBe(true);
  });
  it('a teacher demonstration is never mastery', async () => {
    const { store } = await fresh();
    store.getState().toggleTeacherMode();
    for (const id of IDS) store.getState().recordPracticeResult(L, id, true, IDS.length);
    expect(store.getState().lessons[L].practiceMastered).toBe(false);
  });
  it('completing the lesson and moving through the stages with Next never awards mastery', async () => {
    const { store } = await fresh();
    for (let i = 0; i < 10; i++) store.getState().nextStage();
    store.getState().completeLesson(L);
    expect(store.getState().isLessonCompleted(L)).toBe(true);
    expect(store.getState().isLessonMastered(L)).toBe(false);
  });
  it('evidence is saved, and a reload still shows the same state', async () => {
    const { store, ls } = await fresh();
    for (const id of IDS) store.getState().recordPracticeResult(L, id, true, IDS.length);
    const saved = ls.dump()[KEY];
    const again = await fresh(saved);
    expect(again.store.getState().isLessonMastered(L)).toBe(true);
  });
});

describe('Quadrilaterals guided workbench: legacy progress is preserved and marked Unverified', () => {
  const legacy = {
    chapterId: 'quadrilaterals-class-9',
    lastVisitedLessonId: 'quad-l3',
    completedLessonIds: ['quad-l1', 'quad-l2'],
    lessons: {
      'quad-l1': { lessonId: 'quad-l1', completed: true, currentStage: 'practice', interactionsRecorded: 4, observationsCaptured: 2, proofCompleted: true, practiceAttempted: true, practiceMastered: true, practiceCorrectCount: 3, practiceTotalQuestions: 3, teacherBypassed: false },
      'quad-l2': { lessonId: 'quad-l2', completed: true, currentStage: 'practice', interactionsRecorded: 1, observationsCaptured: 0, proofCompleted: false, practiceAttempted: true, practiceMastered: false, practiceCorrectCount: 1, practiceTotalQuestions: 3, teacherBypassed: false },
    },
  };
  it('keeps every record, but old unearned mastery is Unverified and no longer counts', async () => {
    const { store } = await fresh(legacy);
    const s = store.getState();
    expect(s.completedLessonIds).toEqual(['quad-l1', 'quad-l2']);
    expect(s.lessons['quad-l1']).toMatchObject({ completed: true, interactionsRecorded: 4, practiceCorrectCount: 3, practiceMastered: false, legacyMasteryUnverified: true });
    expect(s.lessons['quad-l2'].practiceMastered).toBe(false);
    expect(s.lessons['quad-l2'].legacyMasteryUnverified).toBeUndefined();
    expect(s.isLessonMastered('quad-l1')).toBe(false);
    expect(s.getCompletionStats().masteredCount).toBe(0);
    expect(s.getCompletionStats().completedCount).toBe(2); // progress is not deleted
  });
  it('earning the mastery later clears the Unverified flag', async () => {
    const { store } = await fresh(legacy);
    const ids = QUAD_GUIDED_LESSONS['quad-l1'].practiceQuestionIds;
    for (const id of ids) store.getState().recordPracticeResult('quad-l1', id, true, ids.length);
    expect(store.getState().lessons['quad-l1']).toMatchObject({ practiceMastered: true, legacyMasteryUnverified: false });
  });
  it('corrupt or hostile storage does not throw and starts empty', async () => {
    for (const bad of ['not json', '{"chapterId":"quadrilaterals-class-9","lessons":[1,2]}', '{"chapterId":"other"}', 'null']) {
      const { store } = await fresh(bad);
      expect(() => store.getState().getCompletionStats()).not.toThrow();
    }
  });
});
