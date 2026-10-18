import { describe, it, expect } from 'vitest';
import {
  UNDERSTANDING_DATA_PRACTICE_BANK as BANK, checkPracticeAnswer, PRACTICE_COUNTS, getPracticeQuestionById,
} from '../practiceBank';
import { UD_GUIDED_LESSONS, UD_GUIDED_UNITS, UD_LESSON_ORDER } from '../curriculumPath';
import { UD_EXPERIMENTS, getUDExperiment } from '../experimentRegistry';
import { UD_COVERAGE } from '../curriculumRegistry';
import { CHART_PRESETS } from '../presets';
import { buildChallenges } from '../challenges';
import { groupShares, groupTotal, cell, largestGroupTotal } from '../charts';
import { formatExact, toNumber, q, eq } from '../rational';
import type { UDPracticeQuestion } from '../types';

const byTitle = (t: string): UDPracticeQuestion => {
  const f = BANK.find((x) => x.title === t);
  if (!f) throw new Error(`no question ${t}`);
  return f;
};

describe('practice bank integrity', () => {
  it('has at least 35 questions across all tiers, with unique ids and titles', () => {
    expect(BANK.length).toBeGreaterThanOrEqual(35);
    expect(new Set(BANK.map((x) => x.id)).size).toBe(BANK.length);
    expect(new Set(BANK.map((x) => x.title)).size).toBe(BANK.length);
    expect(PRACTICE_COUNTS.basic).toBeGreaterThanOrEqual(10);
    expect(PRACTICE_COUNTS.standard).toBeGreaterThanOrEqual(10);
    expect(PRACTICE_COUNTS.challenge).toBeGreaterThanOrEqual(8);
    expect(PRACTICE_COUNTS.basic + PRACTICE_COUNTS.standard + PRACTICE_COUNTS.challenge).toBe(BANK.length);
  });

  it('covers all required types and topics', () => {
    expect(new Set(BANK.map((x) => x.inputType))).toEqual(new Set(['multiple_choice', 'numeric', 'chart_select']));
    const topics = new Set(BANK.map((x) => x.topicId));
    for (const t of ['average_of_averages', 'weighted_mean', 'custom_weights', 'adding_removing', 'weight_changes', 'mixture', 'mixture_assumptions', 'stacked_reading', 'percent_reading', 'absolute_vs_percent', 'chart_choice', 'error_detection', 'chart_comparison']) {
      expect(topics.has(t as never), t).toBe(true);
    }
  });

  it('every question has hints, a worked solution and an explanation; MC options are distinct and in range', () => {
    for (const x of BANK) {
      expect(x.hints.length, x.id).toBeGreaterThan(0);
      expect(x.workedSolution.length, x.id).toBeGreaterThan(0);
      expect(x.explanation.length, x.id).toBeGreaterThan(10);
      if (x.inputType === 'multiple_choice') {
        expect(new Set(x.options).size, x.id).toBe(x.options!.length);
        expect(x.options!.length, x.id).toBeGreaterThanOrEqual(3);
        expect((x.answer as { index: number }).index, x.id).toBeLessThan(x.options!.length);
      }
      if (x.inputType === 'chart_select') expect(x.chart, x.id).toBeDefined();
    }
  });

  // Hand-computed oracle: plain arithmetic, independent of the engine.
  const NUMBERS: Record<string, number> = {
    'Combine two classes': (15 * 72 + 25 * 56) / 40,
    'Equal sizes': (14 + 18 + 22) / 3,
    'Marks with weights 2 : 3 : 5': (2 * 60 + 3 * 70 + 5 * 90) / 10,
    'Equal quantities, midpoint': (100 * 10 + 100 * 30) / 200,
    'Total of a bar': 120 + 80,
    'Percentage share of a part': (120 / 200) * 100,
    'A zero weight changes nothing': (1 * 10 + 3 * 20) / 4,
    'Combine, rounded answer': (6 * 172.5 + 4 * 160.25) / 10,
    'Three groups': (8 * 50 + 12 * 60 + 20 * 70) / 40,
    'Restaurant rating, weights 5 : 3 : 2': (5 * 4 + 3 * 5 + 2 * 3) / 10,
    'Average after one more test': (62 * 10 + 84) / 11,
    'Average after removing a value': (50 * 12 - 74) / 11,
    'Find the missing group average': (68 * 50 - 64 * 30) / 20,
    'Add 1 to every weight': (2 * 4 + 3 * 8 + 4 * 12) / 9,
    'Unequal quantities': (400 * 5 + 100 * 30) / 500,
    'Mixed units': (2000 * 12 + 3000 * 22) / 5000,
    'Amount of solute': 250 * 0.08 + 750 * 0.12,
    'Dilution with water': (6000 * 0.1) / 0.06 - 6000,
    'Salt and sugar separately': ((600 * 0.05) / 900) * 100,
    'Find the missing weight': (62 * 10 - 800) / (50 - 62),
    'Unknown alloy batch': (50 * 250 - (150 * 60 + 100 * 40)) / (45 - 50),
    'Three-part mixture': (100 * 5 + 200 * 10 + 300 * 15) / 600,
    'Ratings table with weights': (4.2 * 6 + 3.1 * 4 + 4.8 * 5) / 15,
    'Grand total from two bars': 30 + 50 + 20 + 90 + 40 + 130 + 10 + 15 + 5,
    'Category total across groups': 80 + 140,
  };

  it('numeric answers match the independent oracle', () => {
    for (const [title, expected] of Object.entries(NUMBERS)) {
      const x = byTitle(title);
      expect(x.answer.kind, title).toBe('number');
      if (x.answer.kind !== 'number') continue;
      expect(toNumber(x.answer.value), title).toBeCloseTo(expected, 9);
      expect(checkPracticeAnswer(x, { kind: 'number', text: formatExact(x.answer.value) }).correct, title).toBe(true);
      expect(checkPracticeAnswer(x, { kind: 'number', text: String(expected + 1000) }).correct, title).toBe(false);
      if (x.answer.decimals !== undefined) {
        const rounded = expected.toFixed(x.answer.decimals);
        expect(checkPracticeAnswer(x, { kind: 'number', text: rounded }).correct, `${title} rounded`).toBe(true);
        const off = (expected + 10 ** -x.answer.decimals).toFixed(x.answer.decimals);
        expect(checkPracticeAnswer(x, { kind: 'number', text: off }).correct, `${title} off by one unit`).toBe(false);
      }
    }
  });

  it('rejects unparseable numeric input as invalid, not wrong', () => {
    const x = byTitle('Combine two classes');
    for (const bad of ['', 'abc', '1/0', 'NaN']) expect(checkPracticeAnswer(x, { kind: 'number', text: bad }).invalid, bad).toBe(true);
    expect(checkPracticeAnswer(x, { kind: 'choice', index: 0 }).invalid).toBe(true);
  });

  const CHOICES: Record<string, string> = {
    'Spot the flaw in averaging averages': 'It ignores that the classes have different sizes',
    'Do 100% segments add up?': '100%',
    'Can you recover counts?': 'No, the totals are not shown',
    'Which chart type?': 'Stacked bar chart of actual amounts',
    'Doubling all weights': 'It stays the same',
    'Impossible target': 'No, a mixture lies between 5% and 8%',
    'Different bases': 'No, they need an explicit conversion first',
    'Empty group': 'No data: percentages are undefined',
    'Equal percentages': 'No: 30 passed in P but 300 in Q',
    'Spot the invalid inference': 'Equal percentages do not tell you the totals',
    'Pick the matching raw data': 'Set A only',
    'Why not stacked → percent?': 'A 100% chart can be made from a stacked chart, but not the other way round',
    'Larger percentage, smaller amount': 'Large club',
    'Which group has more?': 'School B',
    'Choose the expression': '(7×18 + 3×42) ÷ (7 + 3)',
  };
  it('multiple-choice correct options match the oracle', () => {
    for (const [title, text] of Object.entries(CHOICES)) {
      const x = byTitle(title);
      expect(x.options![(x.answer as { index: number }).index], title).toBe(text);
    }
  });

  it('chart-select answers agree with raw data computed independently', () => {
    const bar = byTitle('Tap the largest total');
    expect(bar.answer).toEqual({ kind: 'bar', groupId: 'g2' }); // totals 100, 260, 30
    const seg = byTitle('Largest segment');
    expect(seg.answer).toEqual({ kind: 'segment', groupId: 'g2', categoryId: 'c3' }); // 130 toys
    const fam = byTitle('Largest segment in another bar');
    expect(fam.answer).toEqual({ kind: 'segment', groupId: 'g2', categoryId: 'c1' }); // family Y: 60 rent
    // Family travel share: X 10/80 = 12.5%, Y 30/145 = 20.7% → Y
    expect(byTitle('Biggest percentage share').answer).toEqual({ kind: 'segment', groupId: 'g2', categoryId: 'c3' });
    // Spending data: travel shares H1 300/1000, H2 200/2000, H3 250/500 → H3
    expect(byTitle('Biggest share, spending data').answer).toEqual({ kind: 'segment', groupId: 'g3', categoryId: 'c2' });
    expect(checkPracticeAnswer(bar, { kind: 'bar', groupId: 'g2' }).correct).toBe(true);
    expect(checkPracticeAnswer(bar, { kind: 'bar', groupId: 'g1' }).correct).toBe(false);
    expect(checkPracticeAnswer(seg, { kind: 'segment', groupId: 'g2', categoryId: 'c3' }).correct).toBe(true);
    expect(checkPracticeAnswer(seg, { kind: 'segment', groupId: 'g2', categoryId: 'c1' }).correct).toBe(false);
    expect(checkPracticeAnswer(seg, { kind: 'bar', groupId: 'g2' }).invalid).toBe(true);
  });

  it('charts shown with a question are the same data the answer was computed from', () => {
    for (const x of BANK) {
      if (!x.chart) continue;
      const ds = x.chart.dataset;
      if (x.answer.kind === 'bar') expect(largestGroupTotal(ds)!.ids).toEqual([x.answer.groupId]);
      if (x.answer.kind === 'segment') {
        expect(ds.groups.some((g) => g.id === (x.answer as { groupId: string }).groupId), x.id).toBe(true);
        expect(ds.categories.some((c) => c.id === (x.answer as { categoryId: string }).categoryId), x.id).toBe(true);
      }
    }
    const empty = byTitle('Empty group').chart!.dataset;
    expect(groupShares(empty, 'g1').status).toBe('no_data');
  });

  it('worked solutions state the final answer for numeric questions', () => {
    for (const x of BANK) {
      if (x.answer.kind !== 'number') continue;
      const text = x.workedSolution.join(' ');
      const exact = formatExact(x.answer.value);
      const dp = x.answer.decimals;
      const candidates = [exact, ...(dp !== undefined ? [toNumber(x.answer.value).toFixed(dp), String(Number(toNumber(x.answer.value).toFixed(dp)))] : [])];
      expect(candidates.some((c) => text.includes(c)), `${x.id} ${x.title}: solution should mention ${candidates.join(' or ')}`).toBe(true);
    }
  });

  it('givens tables list exactly the numbers used', () => {
    const g = byTitle('Combine two classes').givens!;
    expect(g.rows).toEqual([['Class P', '72', '15'], ['Class Q', '56', '25']]);
  });
});

describe('chart challenges derive from the data', () => {
  it('are generated for every preset and are never ambiguous', () => {
    for (const [name, make] of Object.entries(CHART_PRESETS)) {
      const ds = make();
      const ch = buildChallenges(ds);
      expect(ch.length, name).toBeGreaterThan(2);
      for (const c of ch) {
        expect(c.explanation.length, `${name}/${c.id}`).toBeGreaterThan(10);
        if (c.answer.kind === 'bar') expect(ds.groups.some((g) => g.id === (c.answer as { groupId: string }).groupId)).toBe(true);
        if (c.answer.kind === 'choice') expect((c.answer as { index: number }).index).toBeLessThan(c.options!.length);
      }
    }
  });
  it('largest-total challenge matches an independent calculation', () => {
    const ds = CHART_PRESETS.spending();
    const totals = ds.groups.map((g) => ds.categories.reduce((s, c) => s + toNumber(cell(ds, g.id, c.id)!), 0));
    const best = ds.groups[totals.indexOf(Math.max(...totals))].id;
    const ch = buildChallenges(ds).find((c) => c.id === 'largest-total')!;
    expect(ch.answer).toEqual({ kind: 'bar', groupId: best });
    expect(ch.explanation).toContain(String(Math.max(...totals)));
  });
  it('skips a challenge when the answer would be a tie', () => {
    expect(buildChallenges(CHART_PRESETS.houses()).some((c) => c.id === 'largest-total')).toBe(false); // both houses total 200
  });
  it('the percent versus amount challenge exposes the difference when it exists', () => {
    const ds = CHART_PRESETS.blooms();
    const ch = buildChallenges(ds).find((c) => c.id.startsWith('largest-share'))!;
    expect(ch).toBeDefined();
    expect(ch.explanation).toMatch(/larger percentage is not a larger amount/);
  });
});

describe('curriculum', () => {
  it('has 13 lessons in 4 units in order', () => {
    expect(Object.keys(UD_GUIDED_LESSONS)).toHaveLength(13);
    expect(UD_GUIDED_UNITS).toHaveLength(4);
    UD_LESSON_ORDER.forEach((id, i) => expect(UD_GUIDED_LESSONS[id].lessonNumber).toBe(i + 1));
  });
  it('lessons reference real experiments and questions, and follow the stage order', () => {
    const order = ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
    for (const l of Object.values(UD_GUIDED_LESSONS)) {
      expect(UD_EXPERIMENTS.some((e) => e.id === l.experimentId), l.id).toBe(true);
      expect(getUDExperiment(l.experimentId).id).toBe(l.experimentId);
      for (const id of l.practiceQuestionIds) expect(getPracticeQuestionById(id), `${l.id}→${id}`).toBeDefined();
      const pos = l.stages.map((s) => order.indexOf(s));
      expect(pos, l.id).toEqual([...pos].sort((a, b) => a - b));
      expect(l.stages[0]).toBe('understand');
      expect(l.stages[l.stages.length - 1]).toBe('practice');
      if (l.stages.includes('predict')) expect(Boolean(l.predictionQuestion) !== Boolean(l.numericPrediction), `${l.id}: exactly one kind of prediction`).toBe(true);
      if (l.stages.includes('experiment')) expect(l.experimentGuide.minInteractionsNeeded ?? 0, l.id).toBeGreaterThan(0);
    }
    expect(Object.values(UD_GUIDED_LESSONS).filter((l) => l.stages.length === 6)).toHaveLength(12);
  });
  it('never states the prediction answer in the Understand stage', () => {
    for (const l of Object.values(UD_GUIDED_LESSONS)) {
      const text = [l.concept.summary, ...l.concept.detailedPoints].join(' ').toLowerCase();
      if (l.numericPrediction) {
        expect(text.includes('57.5'), l.id).toBe(false);
        expect(text.includes(formatExact(l.numericPrediction.correct).toLowerCase()), l.id).toBe(false);
      }
      if (l.predictionQuestion) {
        const correct = l.predictionQuestion.options[l.predictionQuestion.correctIndex].toLowerCase();
        expect(text.includes(correct), `${l.id}: Understand text contains the correct prediction option`).toBe(false);
      }
    }
  });
  it('Lesson 1 matches the brief: 57.5 versus 65 for classes of 10 and 30', () => {
    const l = UD_GUIDED_LESSONS['ud-l1'];
    expect(eq(l.numericPrediction!.correct, q(115, 2))).toBe(true);
    expect(eq(l.numericPrediction!.naive!, q(65))).toBe(true);
    expect(l.hidesResultsUntilPrediction).toBe(true);
  });
  it('experiment presets build valid seeds', () => {
    for (const e of UD_EXPERIMENTS) {
      expect(e.title.length).toBeGreaterThan(3);
      if (e.defaultTab === 'weighted') expect(e.weighted).toBeDefined();
      if (e.defaultTab === 'mixture') expect(e.mixture).toBeDefined();
      if (e.defaultTab === 'charts') expect(e.chart).toBeDefined();
    }
    for (const make of Object.values(CHART_PRESETS)) {
      const ds = make();
      expect(toNumber(groupTotal(ds, ds.groups[0].id))).toBeGreaterThan(0);
    }
  });
});

describe('coverage registry honesty', () => {
  it('uses the evidence levels and points at real lessons', () => {
    const levels = new Set(UD_COVERAGE.map((r) => r.evidence));
    expect(levels.has('verified_textbook')).toBe(true);
    expect(levels.has('labverse_extension')).toBe(true);
    for (const r of UD_COVERAGE) {
      for (const id of r.lessonIds) expect(UD_GUIDED_LESSONS[id], `${r.topic}→${id}`).toBeDefined();
      if (r.evidence === 'verified_textbook') expect(r.textbookRef, r.topic).toBeTruthy();
      if (r.status !== 'covered') expect(r.note, r.topic).toBeTruthy();
    }
  });
  it('does not invent question numbers or reproduce textbook problem data', () => {
    const all = JSON.stringify([UD_COVERAGE, UD_GUIDED_LESSONS, BANK.map((x) => x.statement)], (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    expect(/Exercise\s*(Set\s*)?10\.\d+\s*[,:]?\s*(Q|Question|No\.?)\s*\d/i.test(all)).toBe(false);
    for (const banned of ['165.5', '149.33', 'badminton', 'Rehmat', 'Jaspreet', 'Fatima', 'Naveen']) expect(all.includes(banned), banned).toBe(false);
  });
});
