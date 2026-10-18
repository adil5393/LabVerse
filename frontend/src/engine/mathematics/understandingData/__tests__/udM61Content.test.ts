import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UNDERSTANDING_DATA_PRACTICE_BANK as BANK, checkPracticeAnswer, PRACTICE_COUNTS } from '../practiceBank';
import { UD_GUIDED_LESSONS, UD_LESSON_ORDER, UD_OPTIONAL_LESSON_IDS } from '../curriculumPath';
import { UD_COVERAGE } from '../curriculumRegistry';
import { getUDExperiment } from '../experimentRegistry';
import { q, eq, toNumber, formatExact } from '../rational';
import { cell } from '../charts';
import type { UDPracticeQuestion } from '../types';

const byTitle = (t: string): UDPracticeQuestion => {
  const f = BANK.find((x) => x.title === t);
  if (!f) throw new Error(`no question ${t}`);
  return f;
};

describe('M6.1 practice questions', () => {
  it('keeps every earlier question id and title, appending the new ones', () => {
    expect(BANK).toHaveLength(57);
    expect(BANK.slice(0, 3).map((x) => [x.id, x.title])).toEqual([
      ['q-ud-1', 'Combine two classes'], ['q-ud-2', 'Spot the flaw in averaging averages'], ['q-ud-3', 'Equal sizes'],
    ]);
    expect(BANK[9]).toMatchObject({ id: 'q-ud-10', title: 'Tap the largest total' });
    expect(BANK[44]).toMatchObject({ id: 'q-ud-45', title: 'Category total across groups' });
    BANK.forEach((x, i) => expect(x.id).toBe(`q-ud-${i + 1}`));
    expect(new Set(BANK.map((x) => x.id)).size).toBe(BANK.length);
    expect(PRACTICE_COUNTS.total).toBe(57);
  });

  // Independent arithmetic (never reads the builders' own results).
  const NUM: Record<string, number> = {
    'Compare two columns': 700 - 350, // Home 1 vs Home 2 food
    'Angle of a pie sector': (7 * 360) / 40, // 63° (multiply first so floating point stays exact)
    'From angle to percentage': (72 * 100) / 360, // Food 8/40 → 72° → 20%
    'Average hours of the town': (3 * 9 + 5 * 7 + 2 * 8) / 10, // sleep
    'From varṇa to percent gold': (12 * 100) / 16,
    'Melting gold pieces': (6 * 14 + 4 * 10) / 10,
    'Gold needed for a target purity': (14 * 10 - 12 * 10) / (16 - 14),
  };
  it('numeric answers match the independent oracle and accept equal decimal/fraction forms', () => {
    for (const [title, expected] of Object.entries(NUM)) {
      const x = byTitle(title);
      if (x.answer.kind !== 'number') throw new Error(title);
      expect(toNumber(x.answer.value), title).toBeCloseTo(expected, 9);
      expect(checkPracticeAnswer(x, { kind: 'number', text: String(expected) }).correct, title).toBe(true);
      expect(checkPracticeAnswer(x, { kind: 'number', text: String(expected + 1) }).correct, `${title} +1`).toBe(false);
    }
    // 12.4 can be typed as a fraction too
    expect(checkPracticeAnswer(byTitle('Melting gold pieces'), { kind: 'number', text: '62/5' }).correct).toBe(true);
  });

  it('multiple-choice and chart-select answers match the oracle', () => {
    const tall = byTitle('Tap the tallest column');
    expect(tall.answer).toEqual({ kind: 'segment', groupId: 'g3', categoryId: 'c2' }); // Home 3 Food 1200
    expect(checkPracticeAnswer(tall, { kind: 'segment', groupId: 'g3', categoryId: 'c2' }).correct).toBe(true);
    expect(checkPracticeAnswer(tall, { kind: 'segment', groupId: 'g1', categoryId: 'c1' }).correct).toBe(false);
    expect(tall.chart!.mode).toBe('clustered');

    const pick = (title: string) => { const x = byTitle(title); return x.options![(x.answer as { index: number }).index]; };
    expect(pick('Clustered or stacked?')).toBe('Clustered columns, grouped by category');
    expect(pick('Equal averages, different days')).toBe('No: the daily numbers are different even though the averages are equal');
    expect(pick('Pie slices across different pies')).toBe('Large club (40 seniors)');
    expect(pick('Does anyone live the average day?')).toMatch(/^No: even the closest group, Children, would have to spend 1\.6 hours/);
  });

  it('the pie questions use data whose angles really are whole degrees', () => {
    const ds = byTitle('Angle of a pie sector').chart!.dataset;
    const vals = ds.categories.map((c) => toNumber(cell(ds, 'g1', c.id)!));
    const total = vals.reduce((a, b) => a + b, 0);
    expect(vals.map((v) => (v * 360) / total)).toEqual([180, 72, 63, 45]);
    expect(byTitle('Angle of a pie sector').chart).toMatchObject({ mode: 'pie', pieGroupId: 'g1' });
  });

  it('the "equal averages" question really has equal means and different data', () => {
    const ds = byTitle('Equal averages, different days').chart!.dataset;
    const sum = (g: string) => ds.categories.reduce((a, c) => a + toNumber(cell(ds, g, c.id)!), 0);
    expect(sum('g1') / 4).toBe(sum('g2') / 4);
    expect(ds.categories.map((c) => toNumber(cell(ds, 'g1', c.id)!))).not.toEqual(ds.categories.map((c) => toNumber(cell(ds, 'g2', c.id)!)));
  });

  it('every new question has hints, a worked solution that states the answer, and a topic', () => {
    const topics = new Set(['clustered_reading', 'pie_charts', 'average_hides', 'gold_purity']);
    const added = BANK.slice(45);
    expect(added.length).toBe(12);
    for (const x of added) {
      expect(topics.has(x.topicId), x.id).toBe(true);
      expect(x.hints.length, x.id).toBeGreaterThanOrEqual(1);
      expect(x.workedSolution.length, x.id).toBeGreaterThan(0);
      if (x.options) expect(new Set(x.options).size, x.id).toBe(x.options.length);
    }
    expect(new Set(added.map((x) => x.topicId))).toEqual(topics);
  });

  it('does not copy textbook problems or data', () => {
    const all = JSON.stringify(BANK.map((x) => [x.statement, x.givens, x.workedSolution]), (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    // the textbook's varṇa exercise pieces are 9, 5 and 17 units at 12, 10 and 11 varṇa
    expect(/9 units|17 units|12 varṇa, 5 units/.test(all)).toBe(false);
    for (const banned of ['Family A', 'Family B', 'Family C', 'IUCN', 'National Time Use']) expect(all.includes(banned), banned).toBe(false);
  });
});

describe('M6.1 curriculum', () => {
  it('lessons 7 and 11 introduce clustered columns; the optional lessons are well formed', () => {
    expect(UD_GUIDED_LESSONS['ud-l7'].mustVisitViews).toEqual(['clustered']);
    expect(UD_GUIDED_LESSONS['ud-l7'].allowedViews).toEqual(['absolute', 'clustered']);
    expect(UD_GUIDED_LESSONS['ud-l11'].allowedViews).toEqual(['absolute', 'clustered', 'percent', 'pie']);
    for (const id of UD_OPTIONAL_LESSON_IDS) {
      const l = UD_GUIDED_LESSONS[id];
      expect(l.stages).toHaveLength(6);
      expect(l.predictionQuestion, id).toBeDefined();
      expect(l.hidesResultsUntilPrediction, id).toBe(true);
      expect(getUDExperiment(l.experimentId).id).toBe(l.experimentId);
    }
    // new chart types do not arrive all at once: earlier lessons never offer pie or clustered
    for (const id of ['ud-l8', 'ud-l9', 'ud-l10', 'ud-l12']) expect(UD_GUIDED_LESSONS[id].allowedViews ?? ['absolute', 'percent', 'both']).not.toContain('pie');
  });

  it('the optional lessons never state their prediction answers in the Understand stage', () => {
    for (const id of UD_OPTIONAL_LESSON_IDS) {
      const l = UD_GUIDED_LESSONS[id];
      const text = [l.concept.summary, ...l.concept.detailedPoints].join(' ').toLowerCase();
      const correct = l.predictionQuestion!.options[l.predictionQuestion!.correctIndex].toLowerCase();
      expect(text.includes(correct), id).toBe(false);
      expect(text.includes('162'), `${id} must not reveal the pie angle`).toBe(false);
      expect(text.includes('12.4'), `${id} must not reveal the melt purity`).toBe(false);
    }
  });

  it('the pie prediction is arithmetically right: 900 of 2000 is 162°', () => {
    const l = UD_GUIDED_LESSONS['ud-l14'];
    expect(l.predictionQuestion!.options[l.predictionQuestion!.correctIndex]).toBe('162°');
    expect((900 * 360) / 2000).toBe(162);
  });

  it('coverage registry now covers the four gaps, honestly', () => {
    const row = (start: string) => UD_COVERAGE.find((r) => r.topic.startsWith(start))!;
    expect(row('Cluster-column').status).toBe('covered');
    expect(row('Cluster-column').lessonIds).toContain('ud-l7');
    expect(row('Pie charts').lessonIds).toEqual(['ud-l14']);
    expect(row('Pie charts').note).toMatch(/only recalls/);
    expect(row('Averages of diverse').lessonIds).toEqual(['ud-l15']);
    expect(row('Gold purity').textbookRef).toMatch(/16 = pure/);
    expect(row('Gold purity').note).toMatch(/labelled derived equivalents/);
    for (const r of UD_COVERAGE) {
      for (const id of r.lessonIds) expect(UD_GUIDED_LESSONS[id], `${r.topic} → ${id}`).toBeDefined();
      if (r.status !== 'covered') expect(r.note, r.topic).toBeTruthy();
    }
  });

  it('required lessons are still exactly the original 13 in order', () => {
    expect(UD_LESSON_ORDER).toEqual(['ud-l1', 'ud-l2', 'ud-l3', 'ud-l4', 'ud-l5', 'ud-l6', 'ud-l7', 'ud-l8', 'ud-l9', 'ud-l10', 'ud-l11', 'ud-l12', 'ud-l13']);
  });

  it('experiment seeds for the new activities are consistent', () => {
    expect(getUDExperiment('ud-average-day')).toMatchObject({ defaultTab: 'average', chart: { preset: 'daytime', weights: [3, 5, 2] } });
    expect(getUDExperiment('ud-pie').chart).toMatchObject({ view: 'pie' });
    expect(getUDExperiment('ud-clustered').chart).toMatchObject({ view: 'clustered' });
    expect(getUDExperiment('ud-varna').mixture).toMatchObject({ scale: 'varna', solute: 'gold' });
    const seed = getUDExperiment('ud-varna').mixture!;
    // 87.5% and 62.5% gold are exactly 14 and 10 varṇa
    expect(seed.rows.map((r) => (Number(r.percent) * 16) / 100)).toEqual([14, 10]);
  });
});

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
const KEY = 'labverse_understanding_data_progress_v1';
async function fresh() {
  vi.resetModules();
  return (await import('../../../../store/useUnderstandingDataStore')).useUnderstandingDataStore;
}

describe('M6.1 store behaviour', () => {
  beforeEach(() => vi.stubGlobal('localStorage', new MemoryStorage()));

  it('progress saved before M6.1 loads unchanged (no viewsSeen, no reset, mastery kept)', async () => {
    const old = {
      version: 1,
      lessons: {
        'ud-l1': { lessonId: 'ud-l1', completed: true, mastered: true, teacherBypassed: false, activeStage: 'practice', stagesCompleted: { understand: true, predict: true, experiment: true, observe: true, explain: true, practice: true }, predictionMade: true, predictionText: '65', predictionVerdict: 'naive', interactionsRecorded: 3, observations: [], countedKeys: [] },
        'ud-l7': { lessonId: 'ud-l7', completed: false, mastered: false, teacherBypassed: false, activeStage: 'experiment', stagesCompleted: { understand: true, predict: true, experiment: false, observe: false, explain: false, practice: false }, predictionMade: true, interactionsRecorded: 2, observations: [], countedKeys: [] },
      },
      practiceAnswers: { 'q-ud-1': { userAnswerText: '62', isCorrect: true, firstAttemptCorrect: true, attempts: 1, hintsRevealed: 0, showSolution: false } },
      lastLessonId: 'ud-l7',
    };
    localStorage.setItem(KEY, JSON.stringify(old));
    const store = await fresh();
    const s = () => store.getState();
    expect(s().lessons['ud-l1'].mastered).toBe(true);
    expect(s().practiceAnswers['q-ud-1'].firstAttemptCorrect).toBe(true);
    expect(s().activeLessonId).toBe('ud-l7');
    expect(s().getCompletionStats()).toMatchObject({ completed: 1, mastered: 1, total: 13 });
    // the student resumes lesson 7 and is simply asked to open the new view
    s().selectLesson('ud-l7', 'experiment');
    s().selectSegment('g1', 'c1');
    expect(s().canAdvance().reason).toMatch(/clustered-column view|Do the experiment first/);
    for (const [g, c] of [['g1', 'c2'], ['g2', 'c1']]) s().selectSegment(g, c);
    expect(s().lessons['ud-l7'].interactionsRecorded).toBe(5); // 2 saved + 3 new
    s().setChartView('clustered');
    expect(s().canAdvance().ok).toBe(true);
    // nothing was wiped from storage by the upgrade
    expect(JSON.parse(localStorage.getItem(KEY)!).lessons['ud-l1'].mastered).toBe(true);
  });

  it('reopening an unfinished lesson resumes at the saved stage; finished lessons restart for review', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l3');
    s().advanceToNextStage();
    s().recordPrediction(2, true);
    s().advanceToNextStage();
    expect(s().activeStage).toBe('experiment');
    s().setStage('understand'); // wandering around does not change the saved stage…
    s().selectLesson('ud-l5'); // …switching away and back resumes lesson 3 where it was
    s().selectLesson('ud-l3');
    expect(s().activeStage).toBe('experiment');
    expect(s().lessons['ud-l3'].predictionMade).toBe(true);
    // an explicit stage still wins (e.g. a teacher jumping in)
    s().selectLesson('ud-l3', 'understand');
    expect(s().activeStage).toBe('understand');
    // a completed lesson reopens at the start
    s().selectLesson('ud-l2');
    s().setTeacherMode(true);
    for (let i = 0; i < 6; i++) s().advanceToNextStage();
    s().setTeacherMode(false);
    s().selectLesson('ud-l2');
    expect(s().activeStage).toBe('understand');
  });

  it('optional lessons never change the chapter percentage', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l16');
    s().setTeacherMode(true);
    for (let i = 0; i < 6; i++) s().advanceToNextStage();
    expect(s().lessons['ud-l16'].completed).toBe(true);
    expect(s().lessons['ud-l16'].mastered).toBe(false); // demonstrated only
    expect(s().getCompletionStats()).toMatchObject({ completed: 0, mastered: 0, total: 13, percentage: 0 });
    expect(s().getCompletionStats().nextRecommendedLessonId).toBe('ud-l1');
  });

  it('each lesson offers only its own chart views; free laboratory offers all', async () => {
    const store = await fresh();
    const s = () => store.getState();
    expect(s().allowedViews()).toEqual(['absolute', 'percent', 'clustered', 'pie', 'both']);
    s().selectLesson('ud-l8');
    expect(s().allowedViews()).toEqual(['absolute', 'percent', 'both']);
    s().setChartView('pie');
    expect(s().chartView).not.toBe('pie');
    s().selectLesson('ud-l11');
    expect(s().allowedViews()).toEqual(['absolute', 'clustered', 'percent', 'pie']);
    s().setGuidedActive(false);
    s().setChartView('pie');
    expect(s().chartView).toBe('pie');
  });

  it('a locked lesson cannot open the revealing views before the prediction', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l14'); // pie lesson, results hidden until predicted
    expect(s().chartView).toBe('absolute');
    expect(s().allowedViews()).toEqual(['absolute']);
    s().setChartView('pie');
    expect(s().chartView).toBe('absolute');
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    expect(s().allowedViews()).toEqual(['absolute', 'percent', 'pie']);
    s().advanceToNextStage();
    s().setChartView('pie');
    expect(s().chartView).toBe('pie');
  });

  it('switching among every view never changes the raw dataset; cluster grouping and pie group are view state only', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-stacked-build');
    const snap = () => JSON.stringify(s().dataset, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    const before = snap();
    for (const v of ['percent', 'clustered', 'pie', 'both', 'absolute'] as const) s().setChartView(v);
    s().setClusterBy('category');
    s().setPieGroup('g2');
    expect(snap()).toBe(before);
    expect(s().clusterBy).toBe('category');
    expect(s().pieGroupId).toBe('g2');
  });

  it('removing the group a pie is showing falls back to a group that exists', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-stacked-build');
    s().setPieGroup('g2');
    expect(s().removeChartGroup('g2')).toBeNull();
    expect(s().pieGroupId).toBe('g1');
  });

  it('average-day weights: seeded 3:5:2, negatives ignored, observations are calculated', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().selectLesson('ud-l15');
    expect(Object.values(s().popWeights).map(formatExact)).toEqual(['3', '5', '2']);
    expect(s().isLocked()).toBe(true);
    s().advanceToNextStage();
    s().recordPrediction(1, true);
    s().advanceToNextStage();
    s().setPopWeight('g1', q(-4));
    expect(eq(s().popWeights.g1, q(3))).toBe(true);
    s().setPopWeight('g1', q(4));
    s().setPopWeight('g2', q(4));
    const obs = s().lessons['ud-l15'].observations.map((o) => o.text);
    expect(obs[0]).toMatch(/Population weights 4 : 5 : 2 → average day: Sleep (≈ )?7\.\d+ h/);
    expect(obs[0]).toMatch(/closest real group: Children/);
    expect(s().lessons['ud-l15'].interactionsRecorded).toBe(2);
    // editing hours on this tab reports the new average
    s().setChartCell('g1', 'c1', q(10));
    expect(s().lessons['ud-l15'].observations.at(-1)!.text).toMatch(/average Sleep is now/);
  });

  it('varṇa experiment seeds the scale and keeps exact conversions', async () => {
    const store = await fresh();
    const s = () => store.getState();
    s().setExperiment('ud-varna');
    expect(s().mixtureScale).toBe('varna');
    expect(s().constituents.map((c) => formatExact(c.quantity))).toEqual(['6', '4']);
    expect(s().constituents.map((c) => formatExact(c.solutes.gold))).toEqual(['175/2', '125/2']);
    s().setExperiment('ud-mixture');
    expect(s().mixtureScale).toBe('percent');
  });
});
