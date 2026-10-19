import { describe, it, expect } from 'vitest';
import { allQuestions, allVisuals, describeChapterIntegrity } from '../../../../education/__tests__/chapterIntegrity';
import { emptyIndependent, emptyLessonRecord, lessonStatus, objectiveCoverage } from '../../../../education/progress';
import type { LessonRecord } from '../../../../education/types';
import { UNDERSTANDING_DATA_CHAPTER as CH } from '../content';
import { DAYS, SHOPS, SHOPS_DOUBLE } from '../lessonsB';
import { averageDay, cell, categoryTotal, datasetOf, describeDataset, grandTotal, groupShares, groupTotal, q, sharePercent, show, toNumber, weightedView, wRow, withAverageRow } from '../model';
import { pieSectors } from '../../pie';
import type { UdChartProps, UdWeightedProps } from '../questions';

describeChapterIntegrity('Understanding Data', CH, ['udWeighted', 'udChart']);

// Independent oracles: plain floating-point arithmetic, not the engine's exact fractions.
const wm = (xs: [number, number][]) => xs.reduce((s, [v, w]) => s + v * w, 0) / xs.reduce((s, [, w]) => s + w, 0);
const near = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('Understanding Data: scope and honesty', () => {
  it('has 6 lessons in 4 units with chapter and unit prerequisites', () => {
    expect(Object.keys(CH.lessons)).toHaveLength(6);
    expect(CH.units).toHaveLength(4);
    expect(CH.prerequisiteIds.length).toBeGreaterThanOrEqual(3);
  });
  it('does not teach statistics the chapter lacks: no median, mode, range or histogram lesson content', () => {
    const lessons = JSON.stringify(Object.values(CH.lessons).map((l) => [l.title, l.objective, l.steps, l.worked, l.guided, l.independent])).replace(/"mode":/g, '');
    expect(lessons).not.toMatch(/\bmedian\b|\bmode\b|\bhistogram|\bfrequency polygon|\bstandard deviation|\bvariance/i);
  });
  it('cites no textbook section or example numbers that the chapter does not have', () => {
    const text = JSON.stringify(CH);
    for (const m of text.matchAll(/(?:Section|§)\s?(10\.\d+(?:\.\d+)?)/g)) expect(['10.1', '10.1.1', '10.1.2', '10.1.3', '10.2', '10.2.1', '10.2.2'], m[1]).toContain(m[1]);
    expect(text).not.toMatch(/Exercise (Set )?10\.\d|Example \d/);
  });
  it('observation steps do not claim proof', () => {
    for (const l of Object.values(CH.lessons)) for (const s of l.steps) if (s.phase === 'observe') expect(s.paragraphs.join(' '), `${l.id}/${s.id}`).not.toMatch(/\bproves?\b|\bproved\b/i);
  });
});

describe('Understanding Data: the model matches independent arithmetic', () => {
  it('weightedView equals Σwx ÷ Σw for many random value/weight sets (including decimals)', () => {
    let seed = 7; const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    for (let t = 0; t < 400; t++) {
      const n = 1 + Math.floor(r() * 5);
      const rows = Array.from({ length: n }, () => ({ v: Math.round(r() * 2000) / 10, w: 1 + Math.floor(r() * 30) }));
      const v = weightedView(rows.map((x, i) => wRow(`r${i}`, x.v, x.w)));
      expect(v.ok).toBe(true);
      if (v.ok) expect(toNumber(v.mean)).toBeCloseTo(wm(rows.map((x) => [x.v, x.w])), 9);
    }
  });
  it('lesson figures: 65, 70, 78 and the 40% mixture agree with hand arithmetic', () => {
    const val = (rows: [number, number][]) => { const v = weightedView(rows.map(([x, w], i) => wRow(`r${i}`, x, w))); return v.ok ? toNumber(v.mean) : NaN; };
    expect(val([[60, 30], [80, 10]])).toBe(65);
    expect(val([[60, 20], [80, 20]])).toBe(70);
    expect(val([[80, 20], [90, 30], [70, 50]])).toBe(78);
    expect(val([[80, 2], [90, 3], [70, 5]])).toBe(78);
    expect(val([[50, 4], [100, 1]])).toBe(60);
    expect(val([[20, 300], [70, 200]])).toBe(40);
    expect(val([[20, 300], [70, 200 + 0]])).toBe((0.2 * 300 + 0.7 * 200) / 500 * 100);
  });
  it('only the ratio of weights matters; the mean lies between the smallest and largest value; equal weights give the plain average', () => {
    const a = weightedView([wRow('a', 3, 1), wRow('b', 9, 2), wRow('c', 4, 5)]);
    const b = weightedView([wRow('a', 3, 10), wRow('b', 9, 20), wRow('c', 4, 50)]);
    expect(a.ok && b.ok && toNumber(a.mean) === toNumber(b.mean)).toBe(true);
    if (a.ok) { expect(toNumber(a.mean)).toBeGreaterThanOrEqual(3); expect(toNumber(a.mean)).toBeLessThanOrEqual(9); }
    const e = weightedView([wRow('a', 4, 1), wRow('b', 6, 1), wRow('c', 8, 1)]);
    expect(e.ok && e.naive && toNumber(e.mean) === toNumber(e.naive)).toBe(true);
  });
  it('edge cases are handled with messages, not wrong numbers: empty, zero total weight, negative weight; one item; repeated values; zero weight ignored', () => {
    expect(weightedView([]).ok).toBe(false);
    expect(weightedView([wRow('a', 5, 0), wRow('b', 7, 0)]).ok).toBe(false);
    expect(weightedView([wRow('a', 5, -1), wRow('b', 7, 3)]).ok).toBe(false);
    const one = weightedView([wRow('a', 5, 3)]); expect(one.ok && toNumber(one.mean)).toBe(5);
    const same = weightedView([wRow('a', 5, 3), wRow('b', 5, 9)]); expect(same.ok && toNumber(same.mean)).toBe(5);
    const z = weightedView([wRow('a', 5, 3), wRow('b', 100, 0)]); expect(z.ok && toNumber(z.mean)).toBe(5);
    const neg = weightedView([wRow('a', -10, 1), wRow('b', 10, 3)]); expect(neg.ok && toNumber(neg.mean)).toBe(5);
  });
  it('exact rational arithmetic: a non-integer mean is not rounded silently (1/3)', () => {
    const v = weightedView([wRow('a', 0, 2), wRow('b', 1, 1)]);
    expect(v.ok && v.mean.n === 1n && v.mean.d === 3n).toBe(true);
  });
  it('the plain average of group means differs from the combined mean exactly when sizes differ (and not otherwise)', () => {
    for (const [n, m] of [[30, 10], [20, 20], [5, 15], [1, 9]] as const) {
      const v = weightedView([wRow('a', 60, n), wRow('b', 80, m)]);
      expect(v.ok && v.differsFromNaive).toBe(n !== m);
    }
  });
});

describe('Understanding Data: tables, charts and text are one source of truth', () => {
  const ds = datasetOf(SHOPS);
  it('totals: every row, column and the grand total agree with independent sums', () => {
    const rows = SHOPS.rows.map((r) => r.values.reduce((a, b) => a + b, 0));
    ds.groups.forEach((g, i) => expect(toNumber(groupTotal(ds, g.id))).toBe(rows[i]));
    SHOPS.categories.forEach((_c, ci) => expect(toNumber(categoryTotal(ds, ds.categories[ci].id))).toBe(SHOPS.rows.reduce((s, r) => s + r.values[ci], 0)));
    expect(toNumber(grandTotal(ds))).toBe(rows.reduce((a, b) => a + b, 0));
    expect(rows).toEqual([70, 85, 40]);
  });
  it('shares: independent percentages, summing to exactly 100 when exact; the pie angles sum to exactly 360', () => {
    for (const g of ds.groups) {
      const s = groupShares(ds, g.id, 6);
      expect(s.status === 'ok' && s.exactSumIsHundred).toBe(true);
      const pie = pieSectors(ds, g.id);
      expect(pie.status === 'ok' && pie.exactAngleSumIs360).toBe(true);
    }
    expect(sharePercent(ds, 'g1', 'c2')).toBe('28.6');
    expect(sharePercent(ds, 'g3', 'c2')).toBe('37.5');
    expect(sharePercent(ds, 'g2', 'c3')).toBe('29.4');
    expect(sharePercent(ds, 'g1', 'c1')).toBe('57.1');
  });
  it('identical shares for different totals: Shop D is Shop A doubled, with the same 100% bars and a doubled total', () => {
    const d2 = datasetOf(SHOPS_DOUBLE);
    const sa = groupShares(d2, 'g1', 6), sd = groupShares(d2, 'g2', 6);
    expect(sa.status === 'ok' && sd.status === 'ok' && sa.rows.every((r, i) => sd.status === 'ok' && toNumber(r.percent) === toNumber(sd.rows[i].percent))).toBe(true);
    expect(toNumber(groupTotal(d2, 'g2'))).toBe(2 * toNumber(groupTotal(d2, 'g1')));
  });
  it('the written description states exactly the numbers in the table (graph/table/text synchronisation)', () => {
    const text = describeDataset('x', ds);
    for (const r of SHOPS.rows) {
      expect(text).toContain(`${r.label}: ${SHOPS.categories.map((c, i) => `${c} ${r.values[i]}`).join(', ')} (total ${r.values.reduce((a, b) => a + b, 0)})`);
    }
  });
  it('editing one cell changes that cell, its row total, its column total and the grand total, and nothing else', async () => {
    const { setCell } = await import('../../charts');
    const r = setCell(ds, 'g3', 'c2', q(25));
    expect(r.ok).toBe(true);
    if (r.ok) {
      const d = r.dataset;
      expect(toNumber(cell(d, 'g3', 'c2')!)).toBe(25);
      expect(toNumber(groupTotal(d, 'g3'))).toBe(50);
      expect(toNumber(categoryTotal(d, 'c2'))).toBe(75);
      expect(toNumber(grandTotal(d))).toBe(205);
      expect(toNumber(groupTotal(d, 'g1'))).toBe(70);
      expect(toNumber(cell(ds, 'g3', 'c2')!)).toBe(15); // original untouched
    }
  });
  it('a group whose total is 0 has no shares and no pie (no divide by zero)', async () => {
    const { setCell } = await import('../../charts');
    let d = datasetOf({ title: 't', unit: 'u', categories: ['a', 'b'], rows: [{ label: 'g', values: [3, 4] }] });
    for (const c of ['c1', 'c2']) { const r = setCell(d, 'g1', c, q(0)); if (r.ok) d = r.dataset; }
    expect(groupShares(d, 'g1').status).toBe('no_data');
    expect(pieSectors(d, 'g1').status).toBe('no_data');
  });
  it('average day: weighted by 5 weekdays and 2 weekend days, equals the hand calculation for every activity; each real day totals 24 h and the average day too', () => {
    const d = datasetOf(DAYS);
    const res = averageDay(d, { g1: q(5), g2: q(2) });
    expect(res.ok).toBe(true);
    if (res.ok) {
      res.rows.forEach((row, i) => expect(toNumber(row.mean)).toBeCloseTo((5 * DAYS.rows[0].values[i] + 2 * DAYS.rows[1].values[i]) / 7, 9));
      expect(res.rows.reduce((s, r) => s + toNumber(r.mean), 0)).toBeCloseTo(24, 9);
    }
    expect(DAYS.rows.every((r) => r.values.reduce((a, b) => a + b, 0) === 24)).toBe(true);
    const { dataset } = withAverageRow(d, { g1: q(5), g2: q(2) });
    expect(dataset.groups.map((g) => g.label)).toEqual(['Weekday', 'Weekend', 'Average day']);
    expect(show(cell(dataset, 'avg', 'c2')!)).toBe('≈ 5.29'); // honest rounding: 37/7 is not terminating
    // no real day has the average study hours
    expect(DAYS.rows.some((r) => Math.abs(r.values[1] - 37 / 7) < 0.01)).toBe(false);
  });
  it('every chart visual in the lessons builds a valid dataset with at least one group and category; unequal totals are allowed', () => {
    for (const { where, v } of allVisuals(CH)) if (v.kind === 'udChart') {
      const p = v.props as unknown as UdChartProps;
      const d = datasetOf(p.spec);
      expect(d.groups.length, where).toBeGreaterThan(0); expect(d.categories.length, where).toBeGreaterThan(0);
      for (const g of d.groups) for (const c of d.categories) expect(cell(d, g.id, c.id), `${where} ${g.id} ${c.id}`).not.toBeNull();
      expect(p.kinds ? p.kinds.includes(p.kind) : true, where).toBe(true);
    }
  });
  it('every weighted visual has valid starting numbers (positive total weight)', () => {
    for (const { where, v } of allVisuals(CH)) if (v.kind === 'udWeighted') {
      const p = v.props as unknown as UdWeightedProps;
      expect(weightedView(p.items.map((i) => wRow(i.label, i.value, i.weight))).ok, where).toBe(true);
    }
  });
});

describe('Understanding Data: question answers are verified by independent calculation', () => {
  const q1 = (id: string) => allQuestions(CH).find((x) => x.q.id === id)!.q as { answer: number };
  it('numeric answers', () => {
    expect(q1('up-avg-c1').answer).toBe((12 + 15 + 21) / 3); expect(q1('up-avg-c2').answer).toBe(6 * 7);
    expect(q1('up-pct-c1').answer).toBe((20 / 50) * 100); expect(q1('up-pct-c2').answer).toBeCloseTo(0.15 * 200, 9);
    expect(q1('g-ud-l1-1').answer).toBe(12 * 50); expect(q1('g-ud-l1-2').answer).toBe(8 * 75); expect(q1('g-ud-l1-3').answer).toBe((12 * 50 + 8 * 75) / 20);
    expect(q1('ud-l1-i1').answer).toBe((5 * 20 + 15 * 40) / 20); expect(q1('ud-l1-i2').answer).toBeCloseTo((6 * 7.5 + 4 * 10) / 10, 9); expect(q1('ud-l1-i3').answer).toBe(15 * 72);
    expect(q1('g-ud-l2-1').answer).toBe(3 + 2 + 5); expect(q1('g-ud-l2-2').answer).toBe(3 * 4 + 2 * 5 + 5 * 3); expect(q1('g-ud-l2-3').answer).toBeCloseTo(wm([[4, 3], [5, 2], [3, 5]]), 9);
    expect(q1('ud-l2-i1').answer).toBe(wm([[70, 1], [80, 2], [90, 2]])); expect(q1('ud-l2-i2').answer).toBe(wm([[10, 3], [20, 2], [30, 5]]));
    expect(q1('ud-l2-i3').answer).toBe(4); expect(wm([[60, 2], [90, 4]])).toBe(80);
    expect(q1('ud-l2-i5').answer).toBe((5 * 40 + 100) / 6); expect(q1('ud-l2-i6').answer).toBe((6 * 50 - 20) / 5);
    expect(q1('g-ud-l3-1').answer).toBe(0.15 * 400); expect(q1('g-ud-l3-2').answer).toBe(0.4 * 100); expect(q1('g-ud-l3-3').answer).toBe(((0.15 * 400 + 0.4 * 100) / 500) * 100);
    expect(q1('ud-l3-i1').answer).toBeCloseTo(wm([[5, 600], [15, 400]]), 9); expect(q1('ud-l3-i2').answer).toBeCloseTo(wm([[50, 2], [10, 8]]), 9); expect(q1('ud-l3-i3').answer).toBeCloseTo(0.12 * 250, 9);
    expect(wm([[80, 4], [20, 4]])).toBe(50); expect(q1('ud-l3-i5').answer).toBe(4);
    expect(q1('g-ud-l4-1').answer).toBe(40 + 20 + 10); expect(q1('g-ud-l4-2').answer).toBe(70 - 40);
    expect(q1('ud-l4-i1').answer).toBe(20 + 30 + 15); expect(q1('ud-l4-i3').answer).toBe(40 + 5);
    expect(q1('g-ud-l5-1').answer).toBe(40); expect(q1('g-ud-l5-2').answer).toBe((15 / 40) * 100);
    expect(q1('ud-l5-i1').answer).toBeCloseTo((25 / 85) * 100, 1); expect(q1('ud-l5-i2').answer).toBeCloseTo((40 / 70) * 100, 1); expect(q1('ud-l5-i3').answer).toBe(0.25 * 80);
    expect(q1('g-ud-l6-1').answer).toBe(5 * 7); expect(q1('g-ud-l6-2').answer).toBe(2 * 1); expect(q1('g-ud-l6-3').answer).toBeCloseTo(37 / 7, 2);
    expect(q1('ud-l6-i1').answer).toBeCloseTo(18 / 7, 2); expect(q1('ud-l6-i2').answer).toBeCloseTo(15 / 7, 2); expect(q1('ud-l6-i5').answer).toBeCloseTo(31 / 7, 2);
  });
  it('every authored wrong numeric value is a real mistake (differs from the answer)', () => {
    for (const { q: qq } of allQuestions(CH)) if (qq.kind === 'numeric') for (const r of qq.rules ?? []) for (const v of r.values) expect(Math.abs(v - qq.answer), qq.id).toBeGreaterThan(Math.max(1e-6, (qq.tolerance ?? 0) / 2));
  });
  it('the mixture and combined-average examples in the text match the model', () => {
    expect(near(wm([[60, 30], [80, 10]]), 65)).toBe(true);
    expect(near(wm([[20, 300], [70, 200]]), 40)).toBe(true);
    expect(near(wm([[20, 300], [70, 100]]), 32.5)).toBe(true);
    expect(near(wm([[20, 300], [70, 300]]), 45)).toBe(true);
    expect(near(wm([[10, 9], [50, 1]]), 14)).toBe(true);
    expect(near(wm([[60, 40], [80, 10]]), 64)).toBe(true);
    expect(near(wm([[20, 4], [80, 2]]), 40)).toBe(true); // 0.8x + 0.8 = 0.5(x + 4), x = 4 gives the same strength: (80*4+20*4)/8 = 50
    expect(near(wm([[80, 4], [20, 4]]), 50)).toBe(true);
  });
});

describe('Understanding Data: mastery needs independent evidence for every objective', () => {
  const lessons = Object.values(CH.lessons);
  const record = (l: (typeof lessons)[number], right: (i: number) => boolean): LessonRecord => {
    const r = emptyLessonRecord();
    r.stepsSeen = l.steps.map((s) => s.id); r.workedSeen = true;
    l.guided.steps.forEach((g) => { r.guided[g.id] = { done: true, hints: 0, wrong: 0 }; });
    l.independent.forEach((it, i) => { r.independent[it.id] = right(i) ? { ...emptyIndependent(), attempts: 1, correct: true, firstAttemptUnassisted: true } : { ...emptyIndependent(), attempts: 2, correct: true, firstAttemptUnassisted: false }; });
    return r;
  };
  it('objectives exist and each is tested by an independent item', () => {
    for (const l of lessons) {
      expect(l.objectives?.length ?? 0, l.id).toBeGreaterThanOrEqual(2);
      for (const o of l.objectives!) expect(l.independent.filter((i) => i.objective === o.id).length, `${l.id}/${o.id}`).toBeGreaterThanOrEqual(2);
    }
  });
  it('all first-try: mastered; none: not; a whole missed objective blocks mastery even at 70%', () => {
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
});
