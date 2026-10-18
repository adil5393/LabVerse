import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeEq, formatStandard } from '../linearEquation';
import { rat } from '../rational';
import { TV_GUIDED_LESSONS } from '../curriculumPath';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

async function freshStore() {
  vi.resetModules();
  const mod = await import('../../../../store/useTwoVariablesStore');
  return mod.useTwoVariablesStore;
}

describe('Two Variables store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('gates the Predict stage until a prediction is made, and keeps the first prediction', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l3');
    s().advanceToNextStage(); // understand → predict
    expect(s().activeStage).toBe('predict');
    expect(s().canAdvance().ok).toBe(false);
    s().advanceToNextStage();
    expect(s().activeStage).toBe('predict'); // blocked
    s().recordPrediction(0, false);
    s().recordPrediction(1, true); // ignored: first prediction stands
    expect(s().lessons['tv-l3'].predictionSelectedOption).toBe(0);
    expect(s().canAdvance().ok).toBe(true);
  });

  it('counts only qualifying, distinct interactions toward the experiment gate', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l3'); // target: solution_found, needs 3
    // Interactions in the Understand stage are not recorded.
    expect(s().recordInteraction('solution_found', 'x', 'a')).toBe(false);
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    s().advanceToNextStage();
    expect(s().activeStage).toBe('experiment');
    expect(s().recordInteraction('solution_found', '(3, 2)', '3,2')).toBe(true);
    expect(s().recordInteraction('solution_found', '(3, 2)', '3,2')).toBe(false); // repeat does not count
    expect(s().recordInteraction('coefficient_change', 'wrong kind')).toBe(false);
    expect(s().canAdvance().ok).toBe(false);
    s().recordInteraction('solution_found', '(0, 4)', '0,4');
    s().recordInteraction('solution_found', '(6, 0)', '6,0');
    expect(s().lessons['tv-l3'].interactionsRecorded).toBe(3);
    expect(s().canAdvance().ok).toBe(true);
    s().advanceToNextStage();
    expect(s().activeStage).toBe('observe');
    expect(s().lessons['tv-l3'].observations.length).toBeGreaterThanOrEqual(3);
  });

  it('records nothing when the free laboratory is open', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l3');
    s().setStage('experiment');
    s().setGuidedActive(false);
    expect(s().recordInteraction('solution_found', 'free', 'free')).toBe(false);
    expect(s().lessons['tv-l3'].interactionsRecorded).toBe(0);
  });

  it('teacher demonstration passes every gate without recording mastery', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l9');
    s().setTeacherMode(true);
    const lesson = TV_GUIDED_LESSONS['tv-l9'];
    for (let i = 0; i < lesson.stages.length; i++) s().advanceToNextStage();
    const p = s().lessons['tv-l9'];
    expect(p.completed).toBe(true);
    expect(p.teacherBypassed).toBe(true);
    expect(p.mastered).toBe(false);
    expect(p.interactionsRecorded).toBe(0);
    expect(p.predictionSelectedOption).toBeUndefined();
    expect(s().getCompletionStats().masteredLessonsCount).toBe(0);
    expect(s().getCompletionStats().completedLessonsCount).toBe(1);
  });

  it('a genuine run earns mastery only with first-attempt practice success', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l1'); // target table_row ×3, practice q1 q5
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    s().advanceToNextStage();
    for (const k of ['0,10', '1,8', '2,6']) s().recordInteraction('table_row', `row ${k}`, k);
    s().advanceToNextStage(); // observe
    s().advanceToNextStage(); // explain
    s().advanceToNextStage(); // practice
    expect(s().activeStage).toBe('practice');
    expect(s().canAdvance().ok).toBe(false); // unanswered
    s().revealPracticeHint('q-tv-1'); // a hint alone is not an answer
    expect(s().canAdvance().ok).toBe(false);
    s().submitPracticeAnswer('q-tv-1', 'option A', true);
    s().submitPracticeAnswer('q-tv-5', 'option B', false);
    s().retryPracticeQuestion('q-tv-5');
    s().submitPracticeAnswer('q-tv-5', 'option A', true); // retry success does not rewrite the first attempt
    expect(s().practiceAnswers['q-tv-5'].firstAttemptCorrect).toBe(false);
    s().advanceToNextStage(); // finish
    const p = s().lessons['tv-l1'];
    expect(p.completed).toBe(true);
    expect(p.teacherBypassed).toBe(false);
    expect(p.mastered).toBe(false); // 1 of 2 first-try correct = 50% < 70%
    expect(s().getCompletionStats().masteredLessonsCount).toBe(0);
  });

  it('awards mastery when everything is genuinely earned', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().selectLesson('tv-l1');
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    s().advanceToNextStage();
    for (const k of ['0,10', '1,8', '2,6']) s().recordInteraction('table_row', `row ${k}`, k);
    for (let i = 0; i < 3; i++) s().advanceToNextStage();
    s().submitPracticeAnswer('q-tv-1', 'option A', true);
    s().submitPracticeAnswer('q-tv-5', 'option A', true);
    s().advanceToNextStage();
    expect(s().lessons['tv-l1'].mastered).toBe(true);
    expect(s().getCompletionStats().nextRecommendedLessonId).toBe('tv-l2');
  });

  it('persists progress locally and restores it in a fresh session', async () => {
    const first = await freshStore();
    first.getState().selectLesson('tv-l2');
    first.getState().setStage('predict');
    first.getState().recordPrediction(1, true);
    first.getState().submitPracticeAnswer('q-tv-3', '-5', true);
    const raw = JSON.parse(localStorage.getItem('labverse_two_variables_progress_v1')!);
    expect(raw.lessons['tv-l2'].predictionSelectedOption).toBe(1);

    const second = await freshStore();
    expect(second.getState().lessons['tv-l2'].predictionSelectedOption).toBe(1);
    expect(second.getState().practiceAnswers['q-tv-3'].firstAttemptCorrect).toBe(true);

    second.getState().resetProgress();
    expect(localStorage.getItem('labverse_two_variables_progress_v1')).toBeNull();
    expect(second.getState().lessons).toEqual({});
  });

  it('survives corrupt or unavailable storage', async () => {
    localStorage.setItem('labverse_two_variables_progress_v1', '{not json');
    const store = await freshStore();
    expect(store.getState().lessons).toEqual({});
    vi.stubGlobal('localStorage', undefined);
    const store2 = await freshStore();
    expect(() => store2.getState().selectLesson('tv-l1')).not.toThrow();
  });

  it('undo/redo restores equations; a drag gesture is a single undo step', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().setExperiment('tv-standard-form');
    const start = formatStandard(s().eq1);
    s().nudgeCoefficient(1, 'a', rat(1));
    s().nudgeCoefficient(1, 'c', rat(2));
    expect(formatStandard(s().eq1)).not.toBe(start);
    s().undo();
    s().undo();
    expect(formatStandard(s().eq1)).toBe(start);
    s().redo();
    expect(s().eq1.a).toEqual(rat(3));
    // A gesture: many live updates, one history entry.
    const before = s().past.length;
    for (let i = 0; i < 10; i++) s().setEquationLive(1, makeEq(3, 3, -i), false);
    s().setEquationLive(1, makeEq(3, 3, -20), true);
    expect(s().past.length).toBe(before + 1);
    s().undo();
    expect(s().eq1.c).toEqual(rat(-12));
    expect(s().future.length).toBeGreaterThan(0);
    // A new edit clears redo.
    s().nudgeCoefficient(1, 'b', rat(1));
    expect(s().future.length).toBe(0);
  });

  it('selecting an experiment resets equations, history and table', async () => {
    const store = await freshStore();
    const s = () => store.getState();
    s().addTableRow(rat(1), rat(2));
    s().nudgeCoefficient(1, 'a', rat(1));
    s().setExperiment('tv-two-lines');
    expect(s().tableRows).toHaveLength(0);
    expect(s().past).toHaveLength(0);
    expect(formatStandard(s().eq1)).toBe('2x + 3y = 12');
    expect(formatStandard(s().eq2)).toBe('x + y = 5');
    expect(s().activeTab).toBe('system');
    expect(s().addTableRow(rat(1), rat(2))).toBe(true);
    expect(s().addTableRow(rat(1), rat(2))).toBe(false); // duplicate x rejected
  });
});
