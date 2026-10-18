import { describe, it, expect, beforeEach, vi } from 'vitest';
import { q, parseQ, eq, formatExact } from '../rational';
import { UD_GUIDED_LESSONS } from '../curriculumPath';
import { cell } from '../charts';
import { weightedMean } from '../weightedMean';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}

async function fresh() {
  vi.resetModules();
  const mod = await import('../../../../store/useUnderstandingDataStore');
  return { store: mod.useUnderstandingDataStore, lessonStatus: mod.lessonStatus, hasAnswered: mod.hasAnswered };
}

const KEY = 'labverse_understanding_data_progress_v1';

describe('Understanding Data store', () => {
  beforeEach(() => vi.stubGlobal('localStorage', new MemoryStorage()));

  it('numeric prediction: hides results until made, classifies the guess, keeps the first', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l1');
    expect(s().isLocked()).toBe(true); // results hidden before the prediction
    s().advanceToNextStage(); // understand → predict
    expect(s().activeStage).toBe('predict');
    expect(s().canAdvance().ok).toBe(false);
    expect(s().recordNumericPrediction('not a number')).toBeNull();
    expect(s().isLocked()).toBe(true);
    expect(s().recordNumericPrediction('65')).toBe('naive');
    expect(s().isLocked()).toBe(false);
    expect(s().lessons['ud-l1'].predictionText).toBe('65');
    expect(s().recordNumericPrediction('57.5')).toBeNull(); // first prediction stands
    expect(s().lessons['ud-l1'].predictionVerdict).toBe('naive');
    expect(s().canAdvance().ok).toBe(true);
  });

  it('classifies exact, close and other numeric predictions', async () => {
    for (const [guess, verdict] of [['57.5', 'exact'], ['115/2', 'exact'], ['58', 'close'], ['40', 'other']] as const) {
      localStorage.clear(); // each guess starts from a new student
      const { store } = await fresh();
      store.getState().selectLesson('ud-l1');
      store.getState().advanceToNextStage();
      expect(store.getState().recordNumericPrediction(guess), guess).toBe(verdict);
    }
  });

  it('seeds Lesson 1 with the brief example: sizes 10 and 30, means 80 and 50', async () => {
    const { store } = await fresh();
    store.getState().selectLesson('ud-l1');
    const r = weightedMean(store.getState().rows);
    expect(r.ok && eq(r.mean, q(115, 2))).toBe(true);
  });

  it('only distinct qualifying interactions count; understand and predict stages record nothing', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l1');
    const [a] = s().rows;
    s().setRowNumber(a.id, 'weight', q(11)); // in Understand: ignored
    expect(s().lessons['ud-l1'].interactionsRecorded).toBe(0);
    s().advanceToNextStage();
    s().recordNumericPrediction('60');
    s().advanceToNextStage();
    expect(s().activeStage).toBe('experiment');
    s().setRowNumber(a.id, 'weight', q(12));
    expect(s().lessons['ud-l1'].interactionsRecorded).toBe(1);
    s().setRowNumber(a.id, 'weight', q(12)); // same state again: not counted
    expect(s().lessons['ud-l1'].interactionsRecorded).toBe(1);
    s().setRowNumber(a.id, 'weight', q(13));
    s().setRowNumber(a.id, 'weight', q(14));
    expect(s().lessons['ud-l1'].interactionsRecorded).toBe(3);
    expect(s().canAdvance().ok).toBe(true);
    s().advanceToNextStage();
    const obs = s().lessons['ud-l1'].observations;
    expect(obs.length).toBeGreaterThanOrEqual(3);
    // observations are calculated, true statements
    expect(obs[0].text).toMatch(/weighted mean/);
    expect(obs[0].text).toMatch(/plain average/);
  });

  it('records nothing in the free laboratory', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l1');
    s().setStage('experiment');
    s().setGuidedActive(false);
    s().setRowNumber(s().rows[0].id, 'weight', q(99));
    expect(s().lessons['ud-l1'].interactionsRecorded).toBe(0);
    expect(s().lessons['ud-l1'].observations).toHaveLength(0);
  });

  it('teacher demonstration passes gates but is recorded as demonstrated, never mastered', async () => {
    const { store, lessonStatus } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l7');
    s().setTeacherMode(true);
    for (let i = 0; i < UD_GUIDED_LESSONS['ud-l7'].stages.length; i++) s().advanceToNextStage();
    const p = s().lessons['ud-l7'];
    expect(p.completed).toBe(true);
    expect(p.teacherBypassed).toBe(true);
    expect(p.mastered).toBe(false);
    expect(p.predictionMade).toBe(false);
    expect(p.interactionsRecorded).toBe(0);
    expect(lessonStatus(p)).toBe('demonstrated');
    expect(s().getCompletionStats().mastered).toBe(0);
    expect(s().getCompletionStats().completed).toBe(1);
  });

  it('a genuine run earns mastery only with first-attempt practice success; statuses are distinct', async () => {
    const { store, lessonStatus } = await fresh();
    const s = () => store.getState();
    expect(lessonStatus(undefined)).toBe('not_started');
    s().selectLesson('ud-l7'); // 3 segment selections, 3 practice questions
    expect(lessonStatus(s().lessons['ud-l7'])).toBe('not_started');
    s().advanceToNextStage();
    s().recordPrediction(0, true);
    expect(lessonStatus(s().lessons['ud-l7'])).toBe('attempted');
    s().advanceToNextStage();
    const ds = s().dataset;
    for (const [g, c] of [[0, 0], [0, 1], [1, 2]]) s().selectSegment(ds.groups[g].id, ds.categories[c].id);
    expect(s().lessons['ud-l7'].interactionsRecorded).toBe(3);
    // Lesson 7 also requires the student to open the clustered-column view.
    expect(s().canAdvance().ok).toBe(false);
    expect(s().canAdvance().reason).toMatch(/clustered-column view/);
    s().advanceToNextStage();
    expect(s().activeStage).toBe('experiment'); // still blocked
    s().setChartView('pie'); // not offered in this lesson
    expect(s().chartView).toBe('absolute');
    s().setChartView('clustered');
    expect(s().chartView).toBe('clustered');
    expect(s().canAdvance().ok).toBe(true);
    for (let i = 0; i < 3; i++) s().advanceToNextStage(); // observe, explain, practice
    expect(s().activeStage).toBe('practice');
    const ids = UD_GUIDED_LESSONS['ud-l7'].practiceQuestionIds;
    expect(s().canAdvance().ok).toBe(false);
    s().revealPracticeHint(ids[0]); // a hint alone is not an answer
    expect(s().canAdvance().ok).toBe(false);
    expect(ids).toHaveLength(4);
    s().submitPracticeAnswer(ids[0], 'x', true);
    s().submitPracticeAnswer(ids[1], 'x', false);
    s().retryPracticeQuestion(ids[1]);
    s().submitPracticeAnswer(ids[1], 'x', true); // retry success does not rewrite the first attempt
    expect(s().practiceAnswers[ids[1]].firstAttemptCorrect).toBe(false);
    s().submitPracticeAnswer(ids[2], 'x', false);
    s().submitPracticeAnswer(ids[3], 'x', true);
    s().advanceToNextStage();
    let p = s().lessons['ud-l7'];
    expect(p.completed).toBe(true);
    expect(p.mastered).toBe(false); // 2 of 4 first-try correct = 50% < 70%
    expect(lessonStatus(p)).toBe('completed');

    // second lesson, everything right the first time
    s().selectLesson('ud-l8');
    s().advanceToNextStage();
    s().recordPrediction(0, true);
    s().advanceToNextStage();
    const g = s().dataset.groups[0].id;
    const c = s().dataset.categories[0].id;
    for (let v = 1; v <= 5; v++) expect(s().setChartCell(g, c, q(100 + v))).toBeNull();
    for (let i = 0; i < 3; i++) s().advanceToNextStage();
    for (const id of UD_GUIDED_LESSONS['ud-l8'].practiceQuestionIds) s().submitPracticeAnswer(id, 'x', true);
    s().advanceToNextStage();
    p = s().lessons['ud-l8'];
    expect(p.mastered).toBe(true);
    expect(lessonStatus(p)).toBe('mastered');
    expect(s().getCompletionStats().mastered).toBe(1);
  });

  it('chart toggle needs both views; the percent view is locked before the prediction', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l9');
    expect(s().isLocked()).toBe(true);
    s().setChartView('percent');
    expect(s().chartView).toBe('absolute'); // locked
    s().advanceToNextStage();
    s().recordPrediction(0, true);
    expect(s().isLocked()).toBe(false);
    s().advanceToNextStage();
    s().setChartView('percent');
    expect(s().chartView).toBe('percent');
    expect(s().lessons['ud-l9'].interactionsRecorded).toBe(1);
    expect(s().canAdvance().ok).toBe(false);
    s().setChartView('absolute');
    expect(s().lessons['ud-l9'].interactionsRecorded).toBe(2);
    expect(s().canAdvance().ok).toBe(true);
  });

  it('switching chart view never changes the raw dataset', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-stacked-build');
    const before = JSON.stringify(s().dataset, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    s().setChartView('percent');
    s().setChartView('both');
    s().setChartView('absolute');
    expect(JSON.stringify(s().dataset, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))).toBe(before);
  });

  it('dataset editing: valid edits, rejected negatives, undo/redo, reset', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-stacked-build');
    const g = s().dataset.groups[0].id;
    const c = s().dataset.categories[0].id;
    expect(eq(cell(s().dataset, g, c)!, q(120))).toBe(true);
    expect(s().setChartCell(g, c, q(130))).toBeNull();
    expect(eq(cell(s().dataset, g, c)!, q(130))).toBe(true);
    expect(s().setChartCell(g, c, q(-5))).toMatch(/negative/);
    expect(eq(cell(s().dataset, g, c)!, q(130))).toBe(true); // unchanged by the rejected edit
    s().undo();
    expect(eq(cell(s().dataset, g, c)!, q(120))).toBe(true);
    s().redo();
    expect(eq(cell(s().dataset, g, c)!, q(130))).toBe(true);
    s().addChartGroup();
    expect(s().dataset.groups).toHaveLength(3);
    s().undo();
    expect(s().dataset.groups).toHaveLength(2);
    s().setChartCell(g, c, q(1));
    s().resetExperiment();
    expect(eq(cell(s().dataset, g, c)!, q(120))).toBe(true);
    expect(s().past).toHaveLength(0);
  });

  it('weighted edits support undo/redo and scale/shift operations', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-solving');
    const mean0 = (weightedMean(s().rows) as { ok: true; mean: ReturnType<typeof q> }).mean;
    s().scaleAllWeights(q(3));
    const afterScale = weightedMean(s().rows);
    expect(afterScale.ok && eq(afterScale.mean, mean0)).toBe(true);
    s().shiftAllWeights(q(1));
    const afterShift = weightedMean(s().rows);
    expect(afterShift.ok && eq(afterShift.mean, mean0)).toBe(false);
    s().shiftAllWeights(q(-1000)); // would make weights negative: refused
    expect(weightedMean(s().rows).ok).toBe(true);
    s().undo();
    s().undo();
    const back = weightedMean(s().rows);
    expect(back.ok && eq(back.mean, mean0)).toBe(true);
    s().redo();
    expect(eq(s().rows[0].weight, q(3))).toBe(true);
  });

  it('mixture edits record truthful calculations and respect limits', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l4');
    s().advanceToNextStage();
    s().recordPrediction(2, true);
    s().advanceToNextStage();
    const [a, b] = s().constituents;
    s().setConstituent(a.id, { quantity: parseQ('300')! });
    s().setConstituent(b.id, { percent: parseQ('30')! });
    const obs = s().lessons['ud-l4'].observations;
    expect(obs[0].text).toMatch(/300 mL at 10% \+ 300 mL at 20% → 600 mL, 15% jaggery/);
    expect(obs[1].text).toMatch(/300 mL at 30%/);
    s().addConstituent();
    s().addConstituent();
    s().addConstituent();
    expect(s().constituents.length).toBe(4); // limit
    s().removeConstituent(s().constituents[3].id);
    expect(s().constituents.length).toBe(3);
  });

  it('chart interpretation challenges and opposite-case views are recorded as distinct actions', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l12');
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    s().advanceToNextStage();
    expect(s().showOppositeCase(1)).toBeNull();
    expect(s().showOppositeCase(1)).toBeNull(); // repeat does not count twice
    expect(s().lessons['ud-l12'].interactionsRecorded).toBe(1);
    expect(s().showOppositeCase(2)).toBeNull();
    expect(s().lessons['ud-l12'].interactionsRecorded).toBe(2);
    expect(s().canAdvance().ok).toBe(true);
    expect(s().lessons['ud-l12'].observations.some((o) => /100% chart is identical/.test(o.text))).toBe(true);
  });

  it('persists progress and restores it in a fresh session; survives corrupt or missing storage', async () => {
    const first = await fresh();
    first.store.getState().selectLesson('ud-l2');
    first.store.getState().setStage('predict');
    first.store.getState().recordPrediction(0, true);
    first.store.getState().submitPracticeAnswer('q-ud-3', '18', true);
    const raw = JSON.parse(localStorage.getItem(KEY)!);
    expect(raw.lessons['ud-l2'].predictionMade).toBe(true);
    expect(raw.lastLessonId).toBe('ud-l2');

    const second = await fresh();
    expect(second.store.getState().lessons['ud-l2'].predictionMade).toBe(true);
    expect(second.store.getState().practiceAnswers['q-ud-3'].firstAttemptCorrect).toBe(true);
    expect(second.store.getState().activeLessonId).toBe('ud-l2');
    second.store.getState().resetProgress();
    expect(localStorage.getItem(KEY)).toBeNull();
    expect(second.store.getState().lessons).toEqual({});

    localStorage.setItem(KEY, '{not json');
    const third = await fresh();
    expect(third.store.getState().lessons).toEqual({});
    vi.stubGlobal('localStorage', undefined);
    const fourth = await fresh();
    expect(() => fourth.store.getState().selectLesson('ud-l1')).not.toThrow();
  });

  it('next recommended lesson prefers one in progress, then the first incomplete', async () => {
    const { store } = await fresh();
    const s = () => store.getState();
    expect(s().getCompletionStats().nextRecommendedLessonId).toBe('ud-l1');
    s().selectLesson('ud-l3');
    s().advanceToNextStage();
    s().recordPrediction(2, true);
    expect(s().getCompletionStats().nextRecommendedLessonId).toBe('ud-l3');
  });

  it('numbers shown stay exact', async () => {
    const { store } = await fresh();
    store.getState().setExperiment('ud-misleading');
    const r = weightedMean(store.getState().rows);
    expect(r.ok && formatExact(r.mean)).toBe('115/2');
  });
});
