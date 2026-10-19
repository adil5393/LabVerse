import { describe, it, expect, beforeEach, vi } from 'vitest';
import { applyAnswer, applyHelp, emptyEvidence, isLessonPracticeMastered, migrateLessons, parseEvidence, type PracticeEvidence } from '../progressRules';
import { PROP_GUIDED_LESSONS } from '../curriculumPath';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
const KEY = 'labverse_propositions_progress_v1';

async function fresh(seed?: unknown) {
  vi.resetModules();
  const ls = new MemoryStorage();
  if (seed !== undefined) ls.setItem(KEY, typeof seed === 'string' ? seed : JSON.stringify(seed));
  vi.stubGlobal('localStorage', ls);
  return (await import('../../../../store/usePropositionsStore')).usePropositionsStore;
}

const L1_IDS = PROP_GUIDED_LESSONS['prop-l1'].practiceQuestionIds;

describe('Propositions progress rules (pure)', () => {
  it('only the first answer decides independence; a wrong first try can never become a first-try success', () => {
    let ev = applyAnswer(undefined, false);
    ev = applyAnswer(ev, true);
    expect(ev).toMatchObject({ attempts: 2, correct: true, firstAttemptCorrect: false });
    expect(applyAnswer(applyAnswer(undefined, true), false).firstAttemptCorrect).toBe(true);
  });
  it('help before the first answer is recorded and blocks independence; help after it changes nothing', () => {
    expect(applyAnswer(applyHelp(undefined, 'hint'), true)).toMatchObject({ firstAttemptCorrect: false, assisted: true, hintsUsed: 1 });
    expect(applyAnswer(applyHelp(undefined, 'solution'), true)).toMatchObject({ firstAttemptCorrect: false, assisted: true, solutionShown: true });
    const after = applyHelp(applyAnswer(undefined, true), 'solution');
    expect(after.firstAttemptCorrect).toBe(true);
    expect(after.assisted).toBe(false);
  });
  it('mastery needs the shared 70% of the lesson’s DISTINCT questions on the first try, unassisted', () => {
    const ok: PracticeEvidence = { ...emptyEvidence(), attempts: 1, correct: true, firstAttemptCorrect: true };
    expect(isLessonPracticeMastered(['a', 'b', 'c'], { a: ok, b: ok })).toBe(false);
    expect(isLessonPracticeMastered(['a', 'b', 'c'], { a: ok, b: ok, c: ok })).toBe(true);
    expect(isLessonPracticeMastered(['a', 'a', 'a'], { a: ok })).toBe(true); // one distinct question, answered right
    expect(isLessonPracticeMastered(['a', 'b', 'c'], { a: ok, b: ok, c: { ...ok, firstAttemptCorrect: false } })).toBe(false);
    expect(isLessonPracticeMastered([], {})).toBe(false);
  });
  it('migration keeps every record and withdraws trust from unearned mastery', () => {
    const lessons = {
      l1: { lessonId: 'l1', completed: true, mastered: true, extra: 1 },
      l2: { lessonId: 'l2', completed: true, mastered: false },
    };
    const m = migrateLessons(lessons, {}, () => ['q']);
    expect(m.l1).toMatchObject({ completed: true, mastered: false, legacyMasteryUnverified: true, extra: 1 });
    expect(m.l2).toMatchObject({ completed: true, mastered: false });
    expect((m.l2 as { legacyMasteryUnverified?: boolean }).legacyMasteryUnverified).toBeUndefined();
    const earned = migrateLessons(lessons, { q: { ...emptyEvidence(), attempts: 1, correct: true, firstAttemptCorrect: true } }, () => ['q']);
    expect(earned.l1).toMatchObject({ mastered: true, legacyMasteryUnverified: false });
  });
  it('corrupt evidence is ignored field by field', () => {
    expect(parseEvidence(null)).toEqual({});
    expect(parseEvidence({ a: 5, b: { attempts: 'x', firstAttemptCorrect: 'yes' }, c: { attempts: 2, firstAttemptCorrect: true } })).toEqual({
      b: emptyEvidence(),
      c: { ...emptyEvidence(), attempts: 2, firstAttemptCorrect: true },
    });
  });
});

describe('Propositions store: navigation never produces mastery (the observed P0, fixed)', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('clicking Next through every stage of every lesson and completing it gives completed but NOT mastered', async () => {
    const s = await fresh();
    for (const id of Object.keys(PROP_GUIDED_LESSONS)) {
      s.getState().selectLesson(id);
      for (let i = 0; i < 10; i++) s.getState().advanceToNextStage();
      expect(s.getState().lessons[id]).toMatchObject({ completed: true, mastered: false });
    }
    expect(s.getState().getCompletionStats()).toMatchObject({ completedLessonsCount: 12, masteredLessonsCount: 0 });
  });
  it('calling completeLesson directly cannot award mastery either', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l2');
    s.getState().completeLesson('prop-l2');
    expect(s.getState().lessons['prop-l2'].mastered).toBe(false);
  });
  it('selecting, resuming and reloading create no evidence', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    s.getState().setStage('practice');
    expect(Object.keys(s.getState().practiceEvidence)).toHaveLength(0);
    const again = await fresh(localStorage.getItem(KEY) ?? undefined);
    expect(Object.keys(again.getState().practiceEvidence)).toHaveLength(0);
    expect(again.getState().lessons['prop-l1']?.mastered ?? false).toBe(false);
  });
  it('answering every question of a lesson right on the first try with no help earns mastery, and it survives a refresh', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    for (const q of L1_IDS) s.getState().submitPracticeAnswer(q, 1, true);
    expect(s.getState().lessons['prop-l1'].mastered).toBe(true);
    const again = await fresh(localStorage.getItem(KEY)!);
    expect(again.getState().lessons['prop-l1'].mastered).toBe(true);
    expect(again.getState().practiceEvidence[L1_IDS[0]].firstAttemptCorrect).toBe(true);
  });
  it('mastery earned in practice mode (no lesson record) is still counted from the evidence', async () => {
    const s = await fresh();
    const ids = PROP_GUIDED_LESSONS['prop-l2'].practiceQuestionIds;
    for (const q of ids) s.getState().submitPracticeAnswer(q, 1, true);
    expect(s.getState().lessons['prop-l2']).toBeUndefined();
    expect(s.getState().getCompletionStats().masteredLessonsCount).toBe(1);
  });
  it('the same question answered correctly five times is one piece of evidence, not mastery', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    for (let i = 0; i < 5; i++) { s.getState().submitPracticeAnswer(L1_IDS[0], 1, true); s.getState().retryPracticeQuestion(L1_IDS[0]); }
    expect(s.getState().lessons['prop-l1'].mastered).toBe(false);
    expect(s.getState().practiceEvidence[L1_IDS[0]].attempts).toBe(5);
  });
  it('a hint or a revealed solution before the answer is recorded and prevents independent credit', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    s.getState().revealPracticeHint(L1_IDS[0]);
    s.getState().togglePracticeSolution(L1_IDS[1]);
    for (const q of L1_IDS) s.getState().submitPracticeAnswer(q, 1, true);
    expect(s.getState().practiceEvidence[L1_IDS[0]]).toMatchObject({ assisted: true, firstAttemptCorrect: false, hintsUsed: 1 });
    expect(s.getState().practiceEvidence[L1_IDS[1]]).toMatchObject({ assisted: true, firstAttemptCorrect: false, solutionShown: true });
    expect(s.getState().lessons['prop-l1'].mastered).toBe(false);
  });
  it('taking a hint or opening the solution does NOT lock the question (observed defect: it did)', async () => {
    const s = await fresh();
    s.getState().revealPracticeHint(L1_IDS[0]);
    s.getState().togglePracticeSolution(L1_IDS[0]);
    expect(s.getState().practiceAnswers[L1_IDS[0]].attempted).toBe(false);
    s.getState().submitPracticeAnswer(L1_IDS[0], 1, true);
    expect(s.getState().practiceAnswers[L1_IDS[0]].attempted).toBe(true);
    expect(s.getState().practiceEvidence[L1_IDS[0]]).toMatchObject({ attempts: 1, firstAttemptCorrect: false, assisted: true });
  });
  it('retrying after a wrong first attempt keeps the wrong first attempt on record', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    s.getState().submitPracticeAnswer(L1_IDS[0], 0, false);
    s.getState().retryPracticeQuestion(L1_IDS[0]);
    s.getState().submitPracticeAnswer(L1_IDS[0], 1, true);
    expect(s.getState().practiceEvidence[L1_IDS[0]]).toMatchObject({ attempts: 2, correct: true, firstAttemptCorrect: false });
    for (const q of L1_IDS.slice(1)) s.getState().submitPracticeAnswer(q, 1, true);
    expect(s.getState().lessons['prop-l1'].mastered).toBe(false);
  });
  it('reset erases everything on request', async () => {
    const s = await fresh();
    s.getState().selectLesson('prop-l1');
    s.getState().submitPracticeAnswer(L1_IDS[0], 1, true);
    s.getState().resetProgress();
    expect(s.getState().practiceEvidence).toEqual({});
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});

describe('Propositions store: migration of existing student progress', () => {
  beforeEach(() => vi.unstubAllGlobals());
  const OLD = {
    version: 1, updatedAt: 1,
    lessons: {
      'prop-l1': { lessonId: 'prop-l1', completed: true, mastered: true, activeStage: 'practice', stagesCompleted: { understand: true, predict: true, experiment: true, observe: true, explain: true, practice: true }, predictionSelectedOption: 2, predictionIsCorrect: true },
      'prop-l2': { lessonId: 'prop-l2', completed: false, mastered: false, activeStage: 'predict', stagesCompleted: { understand: true, predict: false, experiment: false, observe: false, explain: false, practice: false } },
    },
  };
  it('keeps completed stages and predictions, marks old unearned mastery as Unverified', async () => {
    const s = await fresh(OLD);
    const l1 = s.getState().lessons['prop-l1'];
    expect(l1).toMatchObject({ completed: true, mastered: false, legacyMasteryUnverified: true, predictionSelectedOption: 2, activeStage: 'practice' });
    expect(l1.stagesCompleted.practice).toBe(true);
    expect(s.getState().lessons['prop-l2']).toMatchObject({ completed: false, activeStage: 'predict' });
    expect(s.getState().getCompletionStats()).toMatchObject({ completedLessonsCount: 1, masteredLessonsCount: 0, unverifiedLessonsCount: 1 });
  });
  it('writes the migrated form back without deleting anything, and later evidence clears the Unverified flag', async () => {
    const s = await fresh(OLD);
    s.getState().selectLesson('prop-l1');
    const saved = JSON.parse(localStorage.getItem(KEY)!);
    expect(saved.version).toBe(2);
    expect(saved.lessons['prop-l1'].legacyMasteryUnverified).toBe(true);
    expect(saved.lessons['prop-l2'].stagesCompleted.understand).toBe(true);
    for (const q of L1_IDS) s.getState().submitPracticeAnswer(q, 1, true);
    expect(s.getState().lessons['prop-l1']).toMatchObject({ mastered: true, legacyMasteryUnverified: false });
  });
  it('survives corrupt or hostile storage without throwing', async () => {
    for (const bad of ['{not json', 'null', '[]', '"x"', JSON.stringify({ lessons: 5 }), JSON.stringify({ lessons: { 'prop-l1': 7 } })]) {
      const s = await fresh(bad);
      expect(() => s.getState().getCompletionStats()).not.toThrow();
    }
  });
  it('works without any storage (private mode)', async () => {
    vi.resetModules();
    vi.stubGlobal('localStorage', undefined);
    const s = (await import('../../../../store/usePropositionsStore')).usePropositionsStore;
    s.getState().selectLesson('prop-l1');
    expect(() => s.getState().submitPracticeAnswer(L1_IDS[0], 1, true)).not.toThrow();
  });
});
