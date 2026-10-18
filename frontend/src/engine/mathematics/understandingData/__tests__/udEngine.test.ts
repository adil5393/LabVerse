import { describe, it, expect } from 'vitest';
import {
  q, parseQ, formatDecimal, formatExact, formatSmart, isTerminating, toNumber, add, mul, div, eq, ZERO, cmp,
} from '../rational';
import {
  weightedMean, naiveMean, combineGroups, compareNaiveWeighted, scaleWeights, shiftWeights,
  meanAfterAdding, meanAfterRemoving, missingGroupMean, describeCalculation, type WeightedItem,
} from '../weightedMean';
import {
  mixConstituents, quantityToReachTarget, reachableRange, validateConstituents, type Constituent,
} from '../mixture';
import {
  makeDataset, groupTotal, categoryTotal, grandTotal, groupShares, niceAxis, setCell, addGroup, removeGroup,
  addCategory, removeCategory, validateDataset, missingCells, largestGroupTotal, largestSegmentInGroup,
  largestShareInCategory, largestAbsoluteInCategory, inferenceVerdict, equalShareDifferentTotals,
  buildOppositeCases, parseDatasetCsv, datasetToCsv, describeChart, cell,
} from '../charts';

const item = (id: string, value: string, weight: string, rounded = false): WeightedItem => ({
  id, label: id, value: parseQ(value)!, weight: parseQ(weight)!, valueIsRounded: rounded,
});

describe('exact rational base', () => {
  it('parses decimals, fractions and exponents exactly and rejects junk', () => {
    expect(parseQ('2.5')).toEqual(q(5, 2));
    expect(parseQ('-1/3')).toEqual(q(-1, 3));
    expect(parseQ('1e3')).toEqual(q(1000));
    expect(parseQ('0.000000001')).toEqual(q(1, 1000000000));
    expect(parseQ('1,200')).toEqual(q(1200));
    for (const bad of ['', 'abc', '1/0', 'NaN', 'Infinity', '1e999', '--3', '.']) expect(parseQ(bad), bad).toBeNull();
  });
  it('0.1 + 0.2 is exactly 0.3 (unlike floats)', () => {
    expect(eq(add(parseQ('0.1')!, parseQ('0.2')!), parseQ('0.3')!)).toBe(true);
  });
  it('formats rounded values honestly', () => {
    expect(formatDecimal(q(1772, 11), 2)).toBe('161.09');
    expect(formatDecimal(q(115, 2), 1)).toBe('57.5');
    expect(formatDecimal(q(-1, 3), 2)).toBe('-0.33');
    expect(formatDecimal(q(-1, 1000), 2)).toBe('0');
    expect(formatDecimal(q(1, 8), 2)).toBe('0.13'); // half-up
    expect(isTerminating(q(1, 8))).toBe(true);
    expect(isTerminating(q(1, 3))).toBe(false);
    expect(formatSmart(q(115, 2))).toBe('57.5');
    expect(formatSmart(q(1772, 11))).toBe('≈ 161.091');
    expect(formatExact(q(6, 4))).toBe('3/2');
  });
  it('handles huge and tiny magnitudes without overflow', () => {
    const big = parseQ('123456789012345678901234567890')!;
    expect(eq(div(mul(big, q(2)), q(2)), big)).toBe(true);
    expect(toNumber(parseQ('1e-12')!)).toBeCloseTo(1e-12, 20);
    expect(toNumber(parseQ('1e30')!)).toBe(1e30);
  });
});

describe('weighted mean (independent float oracle)', () => {
  const oracle = (xs: number[], ws: number[]) => xs.reduce((a, x, i) => a + x * ws[i], 0) / ws.reduce((a, b) => a + b, 0);

  it('matches the brief example: 10 students at 80 and 30 at 50 → 57.5, naive 65', () => {
    const items = [item('A', '80', '10'), item('B', '50', '30')];
    const r = weightedMean(items);
    expect(r.ok && formatDecimal(r.mean, 4)).toBe('57.5');
    expect(formatDecimal(naiveMean(items)!, 4)).toBe('65');
    const cmpRes = compareNaiveWeighted(items)!;
    expect(cmpRes.agree).toBe(false);
    expect(cmpRes.heaviestId).toBe('B');
    expect(formatDecimal(cmpRes.difference, 4)).toBe('-7.5');
  });

  it('agrees with a float oracle on many random-like cases', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rnd() * 5);
      const xs = Array.from({ length: n }, () => Math.round((rnd() * 200 - 50) * 10) / 10);
      const ws = Array.from({ length: n }, () => Math.round(rnd() * 20 * 10) / 10);
      if (ws.every((w) => w === 0)) continue;
      const r = weightedMean(xs.map((x, i) => item(`i${i}`, String(x), String(ws[i]))));
      expect(r.ok).toBe(true);
      if (r.ok) expect(toNumber(r.mean)).toBeCloseTo(oracle(xs, ws), 9);
    }
  });

  it('equal weights make naive and weighted agree (the textbook cycling case)', () => {
    const items = [item('w1', '12.8', '5'), item('w2', '15.8', '5'), item('w3', '18', '5')];
    const c = compareNaiveWeighted(items)!;
    expect(c.agree).toBe(true);
    expect(c.equalWeights).toBe(true);
    expect(c.direction).toBe('none');
  });

  it('zero weights are ignored but a positive total is required', () => {
    const r = weightedMean([item('a', '10', '0'), item('b', '20', '4')]);
    expect(r.ok && eq(r.mean, q(20))).toBe(true);
    if (r.ok) expect(r.ignored).toEqual(['a']);
    const z = weightedMean([item('a', '10', '0'), item('b', '20', '0')]);
    expect(z.ok).toBe(false);
    if (!z.ok) expect(z.error.code).toBe('zero_total_weight');
  });

  it('rejects empty data and negative weights with structured errors', () => {
    const e = weightedMean([]);
    expect(!e.ok && e.error.code).toBe('empty');
    const n = weightedMean([item('a', '1', '-2'), item('b', '2', '5')]);
    expect(!n.ok && n.error.code).toBe('negative_weight');
    if (!n.ok) expect(n.error.itemId).toBe('a');
  });

  it('allows negative VALUES (e.g. temperatures) and fractional values', () => {
    const r = weightedMean([item('a', '-10', '2'), item('b', '5.5', '6')]);
    expect(r.ok && toNumber(r.mean)).toBeCloseTo((-20 + 33) / 8, 12);
  });

  it('handles very large and very small values exactly', () => {
    const r = weightedMean([item('a', '1e15', '1'), item('b', '1e-9', '1')]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(eq(r.sumProducts, add(parseQ('1e15')!, parseQ('1e-9')!))).toBe(true);
      expect(eq(r.mean, div(add(parseQ('1e15')!, parseQ('1e-9')!), q(2)))).toBe(true);
    }
  });

  it('weightShares sum to 1 and contributions sum to the mean', () => {
    const r = weightedMean([item('a', '3', '1'), item('b', '9', '2'), item('c', '4', '5')]);
    if (!r.ok) throw new Error('unexpected');
    expect(eq(r.contributions.reduce((s, c) => add(s, c.weightShare), ZERO), q(1))).toBe(true);
    expect(eq(r.contributions.reduce((s, c) => add(s, c.pullOnMean), ZERO), ZERO)).toBe(true);
  });

  it('flags results built from rounded group means as estimates', () => {
    const r = combineGroups([
      { id: 's', label: 'Seniors', mean: parseQ('165.5')!, size: q(8) },
      { id: 'j', label: 'Juniors', mean: parseQ('149.33')!, size: q(3), meanIsRounded: true },
    ]);
    expect(r.ok && r.isEstimate).toBe(true);
    const exact = combineGroups([{ id: 's', label: 'S', mean: q(165), size: q(8) }]);
    expect(exact.ok && exact.isEstimate).toBe(false);
    if (r.ok) expect(describeCalculation([item('x', '1', '1', true)], (v) => formatDecimal(v, 2)).join(' ')).toMatch(/estimate/);
  });

  it('scaling all weights leaves the mean unchanged; adding a constant generally changes it', () => {
    const items = [item('a', '6', '2'), item('b', '10', '3'), item('c', '15', '5')];
    const base = weightedMean(items);
    const scaled = weightedMean(scaleWeights(items, q(7, 2)));
    const shifted = weightedMean(shiftWeights(items, q(1)));
    if (!base.ok || !scaled.ok || !shifted.ok) throw new Error('unexpected');
    expect(formatDecimal(base.mean, 2)).toBe('11.7');
    expect(eq(base.mean, scaled.mean)).toBe(true);
    expect(eq(base.mean, shifted.mean)).toBe(false);
    expect(() => scaleWeights(items, q(0))).toThrow();
  });

  it('adding / removing values and the reverse problem', () => {
    expect(formatDecimal(meanAfterAdding(q(445, 10), q(20), q(55), q(1))!, 4)).toBe('45'); // (44.5×20 + 55) ÷ 21 = 945 ÷ 21
    expect(meanAfterRemoving(q(10), q(1), q(10), q(1))).toBeNull();
    expect(eq(meanAfterRemoving(q(10), q(4), q(10), q(2))!, q(10))).toBe(true);
    expect(eq(missingGroupMean(q(69), q(40), q(24), q(65))!, q(75))).toBe(true);
    expect(missingGroupMean(q(1), q(5), q(5), q(1))).toBeNull();
  });
});

const con = (id: string, qty: string, unit: Constituent['unit'], pct: string, solute = 'solute'): Constituent => ({
  id, label: id, quantity: parseQ(qty)!, unit, solutes: { [solute]: parseQ(pct)! },
});

describe('mixtures', () => {
  it('200 mL of 10% + 300 mL of 20% → 16% (80 mL solute in 500 mL)', () => {
    const r = mixConstituents([con('a', '200', 'mL', '10'), con('b', '300', 'mL', '20')]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(eq(r.soluteTotals.solute, q(80))).toBe(true);
      expect(eq(r.totalQuantity, q(500))).toBe(true);
      expect(eq(r.concentrations.solute, q(16))).toBe(true);
      expect(r.assumptions.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('equal quantities give the midpoint; unequal pull toward the larger quantity', () => {
    const mid = mixConstituents([con('a', '1', 'L', '10'), con('b', '1', 'L', '20')]);
    expect(mid.ok && eq(mid.concentrations.solute, q(15))).toBe(true);
    const bowl = mixConstituents([con('a', '500', 'mL', '10'), con('b', '200', 'mL', '20')]);
    expect(bowl.ok && formatDecimal(bowl.concentrations.solute, 3)).toBe('12.857');
  });
  it('converts litres to millilitres and kilograms to grams', () => {
    const r = mixConstituents([con('a', '0.2', 'L', '10'), con('b', '300', 'mL', '20')]);
    expect(r.ok && eq(r.concentrations.solute, q(16))).toBe(true);
    const m = mixConstituents([con('a', '0.2', 'kg', '70'), con('b', '120', 'g', '50')]);
    expect(m.ok && m.baseUnit).toBe('g');
  });
  it('refuses to mix volume with mass without conversion', () => {
    const r = mixConstituents([con('a', '100', 'mL', '10'), con('b', '100', 'g', '10')]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.code).toBe('incompatible_basis');
      expect(r.error.message).toMatch(/explicit conversion/);
    }
  });
  it('handles zero-volume constituents and the all-zero case', () => {
    const r = mixConstituents([con('a', '0', 'mL', '50'), con('b', '100', 'mL', '20')]);
    expect(r.ok && eq(r.concentrations.solute, q(20))).toBe(true);
    const z = mixConstituents([con('a', '0', 'mL', '50'), con('b', '0', 'mL', '20')]);
    expect(!z.ok && z.error.code).toBe('zero_total');
    expect(reachableRange([con('a', '0', 'mL', '50'), con('b', '5', 'mL', '20')], 'solute')).toEqual({ min: q(20), max: q(20) });
  });
  it('validates quantities and percentages', () => {
    expect(validateConstituents([con('a', '-1', 'mL', '10')])?.code).toBe('negative_quantity');
    expect(validateConstituents([con('a', '1', 'mL', '101')])?.code).toBe('bad_percent');
    expect(validateConstituents([con('a', '1', 'mL', '-1')])?.code).toBe('bad_percent');
    expect(validateConstituents([])?.code).toBe('empty');
  });
  it('tracks different solutes separately (salt vs sugar)', () => {
    const r = mixConstituents([
      { id: 'a', label: 'salt soln', quantity: q(600), unit: 'mL', solutes: { salt: q(5) } },
      { id: 'b', label: 'sugar soln', quantity: q(300), unit: 'mL', solutes: { sugar: q(8) } },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(formatDecimal(r.concentrations.salt, 4)).toBe('3.3333');
      expect(formatDecimal(r.concentrations.sugar, 4)).toBe('2.6667');
    }
  });
  it('solves for an unknown quantity and detects impossible targets', () => {
    // 200 kg of 70% + 120 kg of 50% + y kg of 45% → 55%  ⇒ y = 240
    const known = [con('a', '200', 'kg', '70'), con('b', '120', 'kg', '50')];
    const s = quantityToReachTarget(known, 'solute', q(45), q(55));
    expect(s.kind === 'quantity' && eq(s.amount, q(240000))).toBe(true); // base unit g
    const dil = quantityToReachTarget([con('p', '10', 'L', '8')], 'solute', q(0), q(6));
    expect(dil.kind === 'quantity' && eq(dil.amount, q(10000, 3))).toBe(true); // 10 L → 3.333… L water
    const impossible = quantityToReachTarget([con('p', '1', 'L', '34')], 'solute', q(0), q(35, 1000 * 1));
    expect(impossible.kind).toBe('quantity');
    const imp2 = quantityToReachTarget([con('p', '1', 'L', '5')], 'solute', q(0), q(8));
    expect(imp2.kind).toBe('impossible');
    const same = quantityToReachTarget([con('p', '1', 'L', '5')], 'solute', q(5), q(5));
    expect(same.kind).toBe('any_quantity');
  });
  it('final concentration always lies between the ingredient concentrations (property)', () => {
    for (let a = 0; a <= 100; a += 20)
      for (let b = 0; b <= 100; b += 25)
        for (const [x, y] of [[1, 1], [1, 7], [9, 2]]) {
          const r = mixConstituents([con('a', String(x), 'L', String(a)), con('b', String(y), 'L', String(b))]);
          if (!r.ok) throw new Error('unexpected');
          expect(cmp(r.concentrations.solute, q(Math.min(a, b))) >= 0).toBe(true);
          expect(cmp(r.concentrations.solute, q(Math.max(a, b))) <= 0).toBe(true);
        }
  });
});

const houses = () => makeDataset('Students by house', 'students', ['Boys', 'Girls'], [
  { label: 'House A', values: [120, 80] },
  { label: 'House B', values: [60, 140] },
]);

describe('charts: totals, shares and normalisation', () => {
  it('computes totals and preserves the grand total', () => {
    const ds = houses();
    expect(eq(groupTotal(ds, 'g1'), q(200))).toBe(true);
    expect(eq(groupTotal(ds, 'g2'), q(200))).toBe(true);
    expect(eq(categoryTotal(ds, 'c1'), q(180))).toBe(true);
    expect(eq(grandTotal(ds), q(400))).toBe(true);
    // sum of group totals == sum of category totals == sum of cells
    const byCat = ds.categories.reduce((s, c) => add(s, categoryTotal(ds, c.id)), ZERO);
    expect(eq(byCat, grandTotal(ds))).toBe(true);
  });
  it('shares of each valid group are exact and sum to exactly 100%', () => {
    const s = groupShares(houses(), 'g1');
    expect(s.status).toBe('ok');
    if (s.status === 'ok') {
      expect(s.rows.map((r) => r.text)).toEqual(['60', '40']);
      expect(s.exactSumIsHundred).toBe(true);
      expect(s.roundingNote).toBeNull();
    }
  });
  it('is honest when rounded figures do not add to 100', () => {
    const ds = makeDataset('t', 'n', ['a', 'b', 'c'], [{ label: 'g', values: [1, 1, 1] }]);
    const s = groupShares(ds, 'g1');
    if (s.status !== 'ok') throw new Error('unexpected');
    expect(s.rows.map((r) => r.text)).toEqual(['33.3', '33.3', '33.3']);
    expect(s.displayedSum).toBe('99.9');
    expect(s.exactSumIsHundred).toBe(true);
    expect(s.roundingNote).toMatch(/exactly 100%/);
  });
  it('a zero-total group has NO percentages (no division by zero)', () => {
    const ds = makeDataset('t', 'n', ['a', 'b'], [{ label: 'empty', values: [0, 0] }, { label: 'full', values: [1, 3] }]);
    const s = groupShares(ds, 'g1');
    expect(s.status).toBe('no_data');
    expect(describeChart(ds, 'percent').join(' ')).toMatch(/no data/);
    expect(largestShareInCategory(ds, 'c2')!.ids).toEqual(['g2']); // empty group skipped
  });
  it('missing cells are reported, not silently zero', () => {
    const ds = makeDataset('t', 'n', ['a', 'b'], [{ label: 'g', values: [5, null] }]);
    expect(missingCells(ds)).toEqual([{ groupId: 'g1', categoryId: 'c2' }]);
    expect(cell(ds, 'g1', 'c2')).toBeNull();
    expect(describeChart(ds, 'absolute').join(' ')).toMatch(/missing/);
  });
  it('switching mode never changes the raw data (percentages are derived, not stored)', () => {
    const ds = houses();
    const before = JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    groupShares(ds, 'g1');
    groupShares(ds, 'g2');
    describeChart(ds, 'percent');
    expect(JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))).toBe(before);
  });
  it('axis always starts at zero and covers the maximum with nice ticks', () => {
    const a = niceAxis(200);
    expect(a.ticks[0]).toBe(0);
    expect(a.max).toBeGreaterThanOrEqual(200);
    expect(a.ticks[a.ticks.length - 1]).toBe(a.max);
    expect(niceAxis(0).max).toBeGreaterThan(0);
    expect(niceAxis(Number.NaN).ticks[0]).toBe(0);
    expect(niceAxis(7).ticks).toEqual([0, 2, 4, 6, 8]);
  });
});

describe('charts: editing and validation', () => {
  it('edits cells immutably and rejects negatives', () => {
    const ds = houses();
    const r = setCell(ds, 'g1', 'c1', q(130));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(eq(cell(r.dataset, 'g1', 'c1')!, q(130))).toBe(true);
      expect(eq(cell(ds, 'g1', 'c1')!, q(120))).toBe(true);
    }
    expect(setCell(ds, 'g1', 'c1', q(-1)).ok).toBe(false);
    expect(setCell(ds, 'nope', 'c1', q(1)).ok).toBe(false);
  });
  it('adds and removes groups and categories keeping the grid consistent', () => {
    let ds = houses();
    const g = addGroup(ds);
    if (!g.ok) throw new Error('x');
    ds = g.dataset;
    expect(ds.groups).toHaveLength(3);
    const c = addCategory(ds, 'Other');
    if (!c.ok) throw new Error('x');
    ds = c.dataset;
    for (const gr of ds.groups) for (const cat of ds.categories) expect(cell(ds, gr.id, cat.id)).not.toBeUndefined();
    const rc = removeCategory(ds, 'c1');
    if (!rc.ok) throw new Error('x');
    expect(Object.keys(rc.dataset.values.g1)).not.toContain('c1');
    const rg = removeGroup(rc.dataset, 'g1');
    expect(rg.ok && rg.dataset.groups.map((x) => x.id)).not.toContain('g1');
    expect(removeGroup(makeDataset('t', 'n', ['a'], [{ label: 'g', values: [1] }]), 'g1').ok).toBe(false);
    expect(removeCategory(makeDataset('t', 'n', ['a'], [{ label: 'g', values: [1] }]), 'c1').ok).toBe(false);
  });
  it('limits groups and categories', () => {
    let ds = houses();
    for (let i = 0; i < 20; i++) { const r = addGroup(ds); if (r.ok) ds = r.dataset; }
    expect(ds.groups.length).toBe(12);
    expect(addGroup(ds).ok).toBe(false);
  });
  it('validation reports negatives and duplicate names', () => {
    const ds = houses();
    ds.values.g1.c1 = q(-5);
    expect(validateDataset(ds).some((i) => i.code === 'negative_value')).toBe(true);
    const dup = makeDataset('t', 'n', ['a', 'A'], [{ label: 'g', values: [1, 2] }]);
    expect(validateDataset(dup).some((i) => i.code === 'duplicate_label')).toBe(true);
  });
});

describe('charts: answers come from the data', () => {
  it('finds largest totals, segments and shares, reporting ties', () => {
    const ds = makeDataset('t', 'n', ['x', 'y'], [{ label: 'A', values: [10, 30] }, { label: 'B', values: [70, 10] }, { label: 'C', values: [20, 20] }]);
    expect(largestGroupTotal(ds)!.ids).toEqual(['g2']);
    expect(largestSegmentInGroup(ds, 'g1')!.ids).toEqual(['c2']);
    expect(largestSegmentInGroup(ds, 'g3')!.tied).toBe(true);
    expect(largestAbsoluteInCategory(ds, 'c1')!.ids).toEqual(['g2']);
    expect(largestShareInCategory(ds, 'c2')!.ids).toEqual(['g1']);
    expect(largestGroupTotal(houses())!.tied).toBe(true);
  });
  it('absolute and percentage comparisons can disagree', () => {
    const ds = makeDataset('t', 'n', ['x', 'y'], [{ label: 'Small', values: [5, 5] }, { label: 'Large', values: [40, 160] }]);
    expect(largestShareInCategory(ds, 'c1')!.ids).toEqual(['g1']); // 50% vs 20%
    expect(largestAbsoluteInCategory(ds, 'c1')!.ids).toEqual(['g2']); // 5 vs 40
  });
  it('inference verdicts match the chapter summary', () => {
    expect(inferenceVerdict('totals_from_percent').canInfer).toBe(false);
    expect(inferenceVerdict('across_groups_counts_from_percent').canInfer).toBe(false);
    expect(inferenceVerdict('equal_percent_means_equal_quantity').canInfer).toBe(false);
    expect(inferenceVerdict('within_group_order_from_percent').canInfer).toBe(true);
    expect(inferenceVerdict('percent_from_stacked').canInfer).toBe(true);
    expect(inferenceVerdict('stacked_from_percent').canInfer).toBe(false);
  });
  it('finds groups with equal shares but different totals', () => {
    const ds = makeDataset('t', 'n', ['x', 'y'], [{ label: 'A', values: [10, 30] }, { label: 'B', values: [20, 60] }, { label: 'C', values: [1, 1] }]);
    expect(equalShareDifferentTotals(ds)).toEqual([{ a: 'g1', b: 'g2' }]);
  });
  it('builds two datasets with identical 100% bars and opposite absolute comparisons', () => {
    const ds = makeDataset('Flowers', 'flowers', ['Summer', 'Monsoon', 'Winter'], [
      { label: 'Fatima', values: [50, 30, 20] }, { label: 'Naveen', values: [40, 35, 25] },
    ]);
    const oc = buildOppositeCases(ds, 'g1', 'g2', 'c1')!;
    expect(oc).not.toBeNull();
    for (const g of ['g1', 'g2']) {
      const orig = groupShares(ds, g);
      for (const c of [oc.case1, oc.case2]) {
        const s = groupShares(c, g);
        if (orig.status !== 'ok' || s.status !== 'ok') throw new Error('x');
        expect(s.rows.map((r) => r.percent)).toEqual(orig.rows.map((r) => r.percent));
      }
    }
    const abs = (d: typeof oc.case1) => cmp(cell(d, 'g1', 'c1')!, cell(d, 'g2', 'c1')!);
    expect(abs(oc.case1)).toBeGreaterThan(0);
    expect(abs(oc.case2)).toBeLessThan(0);
    // all counts are whole numbers
    for (const d of [oc.case1, oc.case2]) for (const g of d.groups) for (const c of d.categories) expect(cell(d, g.id, c.id)!.d).toBe(1n);
    expect(buildOppositeCases(ds, 'g1', 'g1', 'c1')).toBeNull();
    const eqShares = makeDataset('t', 'n', ['a', 'b'], [{ label: 'x', values: [1, 1] }, { label: 'y', values: [2, 2] }]);
    expect(buildOppositeCases(eqShares, 'g1', 'g2', 'c1')).toBeNull();
  });
});

describe('CSV import / export', () => {
  const csv = 'Group,Boys,Girls\nHouse A,120,80\nHouse B,60,140\n';
  it('imports a valid file and round-trips', () => {
    const r = parseDatasetCsv(csv);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(eq(groupTotal(r.dataset, 'g2'), q(200))).toBe(true);
      expect(datasetToCsv(r.dataset)).toBe(csv);
    }
  });
  it('handles BOM, CRLF, quotes and decimals', () => {
    const r = parseDatasetCsv('﻿Group,"Food, drink",Other\r\n"A ""x""",1.5,2\r\n');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.dataset.categories[0].label).toBe('Food, drink');
      expect(r.dataset.groups[0].label).toBe('A "x"');
      expect(eq(cell(r.dataset, 'g1', 'c1')!, q(3, 2))).toBe(true);
    }
  });
  it('treats empty cells as missing with a warning', () => {
    const r = parseDatasetCsv('Group,a,b\nG,1,\n');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(cell(r.dataset, 'g1', 'c2')).toBeNull();
      expect(r.warnings[0].message).toMatch(/MISSING/);
    }
  });
  it('rejects malformed input with line numbers', () => {
    const cases: [string, RegExp][] = [
      ['', /header row/],
      ['Group\nA\n', /at least one category|header/],
      ['Group,a,b\nA,1\n', /cells/],
      ['Group,a,b\nA,1,x\n', /not a number/],
      ['Group,a,b\nA,1,-2\n', /negative/],
      ['Group,a,a\nA,1,2\n', /different/],
      ['Group,a,b\nA,1,2\nA,3,4\n', /different/],
      ['Group,a,b\nNaN,Infinity,2\n', /not a number/],
    ];
    for (const [text, re] of cases) {
      const r = parseDatasetCsv(text);
      expect(r.ok, text).toBe(false);
      if (!r.ok) expect(r.errors.map((e) => e.message).join(' '), text).toMatch(re);
    }
    const r = parseDatasetCsv('Group,a\nA,x\n');
    if (!r.ok) expect(r.errors[0].line).toBe(2);
  });
});

import { solveUnknownWeight } from '../weightedMean';

describe('unknown weight', () => {
  it('finds the weight that reaches a target mean', () => {
    // 80 with weight 10, 50 with weight w, target 62 → w = 15
    const r = solveUnknownWeight([item('a', '80', '10')], q(50), q(62));
    expect(r.kind === 'weight' && eq(r.value, q(15))).toBe(true);
    const check = weightedMean([item('a', '80', '10'), item('b', '50', '15')]);
    expect(check.ok && eq(check.mean, q(62))).toBe(true);
  });
  it('reports impossible targets and the degenerate equal case', () => {
    expect(solveUnknownWeight([item('a', '80', '10')], q(50), q(90)).kind).toBe('impossible');
    expect(solveUnknownWeight([item('a', '80', '10')], q(80), q(80)).kind).toBe('any_weight');
    expect(solveUnknownWeight([item('a', '80', '10')], q(80), q(70)).kind).toBe('impossible');
    expect(solveUnknownWeight([item('a', '80', '-1')], q(50), q(60)).kind).toBe('impossible');
  });
});
