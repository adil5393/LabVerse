import { describe, it, expect } from 'vitest';
import { q, eq, parseQ, toNumber, formatDecimal, formatExact, add, mul, ZERO } from '../rational';
import { makeDataset, setCell, groupTotal, groupShares, cell, parseDatasetCsv, validateDataset } from '../charts';
import { pieSectors, sectorPath } from '../pie';
import { clusterLayout, columnFraction, tallestColumns } from '../clustered';
import { averageDay, closestGroup, meanPerActivity, hoursBudgetIssues, withAverageRow, sameDistribution, AVERAGE_ROW_ID } from '../averageDay';
import {
  mixVarna, validateVarna, varnaToGoldFraction, varnaToGoldPercent, goldPercentToVarna, varnaToKarat, massToReachTarget,
  describeVarna, type VarnaPiece,
} from '../varna';
import { mixConstituents } from '../mixture';
import { weightedMean } from '../weightedMean';
import { CHART_PRESETS } from '../presets';

describe('pie sectors', () => {
  const ds = makeDataset('t', 'n', ['a', 'b', 'c', 'd'], [{ label: 'G', values: [5, 15, 12, 8] }]);

  it('angles are 360° × share, computed exactly, and sum to 360°', () => {
    const r = pieSectors(ds, 'g1');
    if (r.status !== 'ok') throw new Error('x');
    // independent arithmetic: total 40 → 45°, 135°, 108°, 72°
    expect(r.sectors.map((s) => toNumber(s.angle))).toEqual([45, 135, 108, 72]);
    expect(r.sectors.map((s) => s.angleText)).toEqual(['45', '135', '108', '72']);
    expect(r.sectors.map((s) => s.percentText)).toEqual(['12.5', '37.5', '30', '20']);
    expect(eq(r.sectors.reduce((a, s) => add(a, s.angle), ZERO), q(360))).toBe(true);
    expect(r.sectors.reduce((a, s) => a + (s.endDeg - s.startDeg), 0)).toBeCloseTo(360, 9);
    expect(r.sectors[0].startDeg).toBe(0);
    expect(r.sectors[3].endDeg).toBeCloseTo(360, 9);
    expect(r.roundingNote).toBeNull();
  });

  it('angles and percentages come from the same exact shares', () => {
    const r = pieSectors(ds, 'g1');
    if (r.status !== 'ok') throw new Error('x');
    for (const s of r.sectors) {
      expect(eq(s.angle, mul(q(360), s.share))).toBe(true); // angle is exactly 360 × share
      expect(toNumber(s.angle)).toBeCloseTo(toNumber(s.share) * 360, 9);
      expect(toNumber(s.percent)).toBeCloseTo(toNumber(s.share) * 100, 9);
    }
  });

  it('is honest about rounding (thirds)', () => {
    const t = makeDataset('t', 'n', ['a', 'b', 'c'], [{ label: 'G', values: [1, 1, 1] }]);
    const r = pieSectors(t, 'g1');
    if (r.status !== 'ok') throw new Error('x');
    expect(r.sectors.map((s) => s.angleText)).toEqual(['120', '120', '120']);
    expect(r.sectors.map((s) => s.percentText)).toEqual(['33.3', '33.3', '33.3']);
    expect(r.percentSumText).toBe('99.9');
    expect(r.roundingNote).toMatch(/exactly 100%/);
    const sevenths = makeDataset('t', 'n', ['a', 'b'], [{ label: 'G', values: [1, 6] }]);
    const s7 = pieSectors(sevenths, 'g1', 1);
    if (s7.status !== 'ok') throw new Error('x');
    expect(s7.sectors[0].angleText).toBe('51.4'); // 360/7 = 51.428…
    expect(s7.exactAngleSumIs360).toBe(true);
  });

  it('a zero-total group has no sectors at all', () => {
    const z = makeDataset('t', 'n', ['a', 'b'], [{ label: 'empty', values: [0, 0] }, { label: 'miss', values: [null, null] }]);
    expect(pieSectors(z, 'g1').status).toBe('no_data');
    expect(pieSectors(z, 'g2').status).toBe('no_data');
  });

  it('zero categories are listed but never drawn; a single non-zero category is a full circle', () => {
    const t = makeDataset('t', 'n', ['a', 'b', 'c'], [{ label: 'G', values: [0, 7, 0] }]);
    const r = pieSectors(t, 'g1');
    if (r.status !== 'ok') throw new Error('x');
    expect(r.sectors.map((s) => s.isZero)).toEqual([true, false, true]);
    expect(r.sectors[1].isFullCircle).toBe(true);
    expect(r.sectors[1].angleText).toBe('360');
    expect(r.sectors[0].startDeg).toBe(r.sectors[0].endDeg);
  });

  it('missing cells count as 0 and never poison the angles', () => {
    const t = makeDataset('t', 'n', ['a', 'b'], [{ label: 'G', values: [10, null] }]);
    const r = pieSectors(t, 'g1');
    if (r.status !== 'ok') throw new Error('x');
    expect(r.sectors.map((s) => s.angleText)).toEqual(['360', '0']);
  });

  it('matches the share percentages of the 100% stacked chart for the same group', () => {
    for (const make of Object.values(CHART_PRESETS)) {
      const d = make();
      for (const g of d.groups) {
        const p = pieSectors(d, g.id);
        const s = groupShares(d, g.id);
        if (p.status !== 'ok' || s.status !== 'ok') continue;
        p.sectors.forEach((sec, i) => expect(sec.percentText).toBe(s.rows[i].text));
      }
    }
  });

  it('draws valid SVG arcs (large-arc flag, closed path)', () => {
    expect(sectorPath(0, 0, 10, 0, 90)).toMatch(/A 10 10 0 0 1/);
    expect(sectorPath(0, 0, 10, 0, 200)).toMatch(/A 10 10 0 1 1/);
    expect(sectorPath(0, 0, 10, 0, 90)).toMatch(/Z$/);
  });
});

describe('clustered columns', () => {
  const ds = makeDataset('Sales', 'units', ['Books', 'Pens', 'Toys'], [
    { label: 'S1', values: [30, 50, 20] },
    { label: 'S2', values: [90, 40, null] },
  ]);

  it('clustering by group puts a cluster per group and a column per category', () => {
    const l = clusterLayout(ds, 'group');
    expect(l.clusters.map((c) => c.label)).toEqual(['S1', 'S2']);
    expect(l.series.map((s) => s.label)).toEqual(['Books', 'Pens', 'Toys']);
    expect(l.clusters[0].bars.map((b) => toNumber(b.value!))).toEqual([30, 50, 20]);
    expect(l.clusters[1].bars[2].value).toBeNull(); // missing stays missing, not 0
  });

  it('clustering by category swaps the roles but shows the SAME numbers', () => {
    const byG = clusterLayout(ds, 'group');
    const byC = clusterLayout(ds, 'category');
    expect(byC.clusters.map((c) => c.label)).toEqual(['Books', 'Pens', 'Toys']);
    expect(byC.series.map((s) => s.label)).toEqual(['S1', 'S2']);
    for (const g of byG.clusters) for (const b of g.bars) {
      const twin = byC.clusters.find((c) => c.id === b.categoryId)!.bars.find((x) => x.groupId === b.groupId)!;
      expect(twin.value === null ? null : formatExact(twin.value)).toBe(b.value === null ? null : formatExact(b.value));
    }
  });

  it('series colours follow the series index consistently (same index in every cluster)', () => {
    const l = clusterLayout(ds, 'group');
    for (const c of l.clusters) expect(c.bars.map((b) => b.seriesIndex)).toEqual([0, 1, 2]);
    // categories keep the same index as in the stacked chart's legend
    expect(l.series.map((s, i) => ds.categories[i].id === s.id)).toEqual([true, true, true]);
  });

  it('the axis starts at zero and covers the tallest column; heights are proportional', () => {
    const l = clusterLayout(ds, 'group');
    expect(l.axis.ticks[0]).toBe(0);
    expect(l.axis.max).toBeGreaterThanOrEqual(90);
    expect(columnFraction(q(90), l.axis.max)).toBeCloseTo(90 / l.axis.max, 12);
    expect(columnFraction(q(45), l.axis.max) * 2).toBeCloseTo(columnFraction(q(90), l.axis.max), 12);
    expect(columnFraction(null, l.axis.max)).toBe(0);
    expect(columnFraction(q(0), l.axis.max)).toBe(0);
  });

  it('never mutates the dataset and rejects negative data at the source', () => {
    const before = JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    clusterLayout(ds, 'group');
    clusterLayout(ds, 'category');
    expect(JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))).toBe(before);
    expect(setCell(ds, 'g1', 'c1', q(-1)).ok).toBe(false);
    expect(parseDatasetCsv('G,a\nx,-3\n').ok).toBe(false);
    const bad = makeDataset('t', 'n', ['a'], [{ label: 'g', values: [-4] }]);
    expect(validateDataset(bad).some((i) => i.code === 'negative_value')).toBe(true);
    expect(clusterLayout(bad, 'group').maxValue).toEqual(q(0)); // a negative value can never draw a column
  });

  it('finds the tallest column(s), reporting ties', () => {
    expect(tallestColumns(ds)).toEqual([{ groupId: 'g2', categoryId: 'c1' }]);
    const tie = makeDataset('t', 'n', ['a', 'b'], [{ label: 'g', values: [5, 5] }]);
    expect(tallestColumns(tie)).toHaveLength(2);
  });

  it('all-zero data still gets a usable axis', () => {
    const z = makeDataset('t', 'n', ['a'], [{ label: 'g', values: [0] }]);
    const l = clusterLayout(z, 'group');
    expect(l.axis.max).toBeGreaterThan(0);
  });
});

describe('average day vs distributions', () => {
  const ds = CHART_PRESETS.daytime(); // Children 9/6/5/4, Adults 7/8/3/6, Elderly 8/1/8/7
  const w = { g1: q(3), g2: q(5), g3: q(2) };

  it('the average day is the weighted mean per activity (independent arithmetic)', () => {
    const r = averageDay(ds, w);
    if (!r.ok) throw new Error('x');
    const oracle = (i: number) => (3 * [9, 6, 5, 4][i] + 5 * [7, 8, 3, 6][i] + 2 * [8, 1, 8, 7][i]) / 10;
    r.rows.forEach((row, i) => expect(toNumber(row.mean)).toBeCloseTo(oracle(i), 12));
    expect(r.rows.map((x) => formatDecimal(x.mean, 2))).toEqual(['7.8', '6', '4.6', '5.6']);
    expect(eq(r.total, q(24))).toBe(true); // 24-hour days average to a 24-hour day
  });

  it('weights of 0 remove a group; all zero is a clear error', () => {
    const r = averageDay(ds, { g1: q(0), g2: q(1), g3: q(0) });
    if (!r.ok) throw new Error('x');
    expect(r.rows.map((x) => formatDecimal(x.mean, 2))).toEqual(['7', '8', '3', '6']); // exactly the Adults' day
    expect(averageDay(ds, { g1: q(0), g2: q(0), g3: q(0) }).ok).toBe(false);
    expect(averageDay(ds, { g1: q(-1), g2: q(1), g3: q(1) }).ok).toBe(false);
  });

  it('no group lives the average day: the closest differs by a computed number of hours', () => {
    const r = averageDay(ds, w);
    if (!r.ok) throw new Error('x');
    const c = closestGroup(ds, r.rows)!;
    // |9-7.8|+|6-6|+|5-4.6|+|4-5.6| = 1.2+0+0.4+1.6 = 3.2 for Children; Adults 4.8; Elderly 10
    expect(c.groupId).toBe('g1');
    expect(toNumber(c.distance)).toBeCloseTo(3.2, 12);
    expect(toNumber(c.hoursToShift)).toBeCloseTo(1.6, 12);
  });

  it('every group has the same MEAN per activity yet different days', () => {
    for (const g of ds.groups) expect(eq(meanPerActivity(ds, g.id)!, q(6))).toBe(true);
    expect(sameDistribution(ds, 'g1', 'g2')).toBe(false);
    expect(sameDistribution(ds, 'g1', 'g1')).toBe(true);
  });

  it('flags groups whose hours do not make a 24 h day', () => {
    expect(hoursBudgetIssues(ds)).toEqual([]);
    const edited = setCell(ds, 'g1', 'c1', q(10));
    if (!edited.ok) throw new Error('x');
    expect(hoursBudgetIssues(edited.dataset)).toEqual([{ groupId: 'g1', total: q(25) }]);
  });

  it('adds a read-only average row without touching the original dataset', () => {
    const before = JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v));
    const { dataset, result } = withAverageRow(ds, w);
    expect(result.ok).toBe(true);
    expect(dataset.groups.map((g) => g.id)).toEqual(['g1', 'g2', 'g3', AVERAGE_ROW_ID]);
    expect(eq(groupTotal(dataset, AVERAGE_ROW_ID), q(24))).toBe(true);
    expect(JSON.stringify(ds, (_k, v) => (typeof v === 'bigint' ? v.toString() : v))).toBe(before);
  });

  it('agrees with the general weighted-mean engine', () => {
    const r = averageDay(ds, w);
    if (!r.ok) throw new Error('x');
    const direct = weightedMean(ds.groups.map((g) => ({ id: g.id, label: g.label, value: cell(ds, g.id, 'c1')!, weight: w[g.id as 'g1'] })));
    expect(direct.ok && eq(direct.mean, r.rows[0].mean)).toBe(true);
  });
});

describe('gold purity in varṇa', () => {
  const piece = (id: string, mass: string, varna: string, unit: 'g' | 'kg' = 'g'): VarnaPiece => ({ id, label: id, mass: parseQ(mass)!, unit, varna: parseQ(varna)! });

  it('uses the textbook definition: k varṇa is k/16 gold, 16 is pure, 16 varṇa = 24 karat', () => {
    expect(eq(varnaToGoldFraction(q(16)), q(1))).toBe(true);
    expect(eq(varnaToGoldFraction(q(12)), q(3, 4))).toBe(true);
    expect(eq(varnaToGoldPercent(q(12)), q(75))).toBe(true);
    expect(eq(varnaToKarat(q(16)), q(24))).toBe(true);
    expect(eq(varnaToKarat(q(12)), q(18))).toBe(true);
    expect(eq(goldPercentToVarna(q(75)), q(12))).toBe(true);
  });

  it('melting pieces: final varṇa is the mass-weighted mean (independent arithmetic)', () => {
    const r = mixVarna([piece('a', '6', '14'), piece('b', '4', '10')]);
    if (!r.ok) throw new Error('x');
    expect(toNumber(r.finalVarna)).toBeCloseTo((6 * 14 + 4 * 10) / 10, 12); // 12.4
    expect(eq(r.goldGrams, parseQ('7.75')!)).toBe(true); // 6·14/16 + 4·10/16 = 5.25 + 2.5
    expect(eq(r.totalGrams, q(10))).toBe(true);
    expect(eq(r.goldPercent, parseQ('77.5')!)).toBe(true);
    expect(eq(r.karatEquivalent, parseQ('18.6')!)).toBe(true);
    // the same answer through the general weighted-mean engine
    const w = weightedMean([{ id: 'a', label: 'a', value: q(14), weight: q(6) }, { id: 'b', label: 'b', value: q(10), weight: q(4) }]);
    expect(w.ok && eq(w.mean, r.finalVarna)).toBe(true);
  });

  it('agrees with the percent-by-mass mixture model through the explicit k/16 relationship', () => {
    const pieces = [piece('a', '6', '14'), piece('b', '4', '10')];
    const v = mixVarna(pieces);
    const m = mixConstituents(pieces.map((p) => ({ id: p.id, label: p.label, quantity: p.mass, unit: 'g' as const, solutes: { gold: varnaToGoldPercent(p.varna) } })));
    if (!v.ok || !m.ok) throw new Error('x');
    expect(eq(m.concentrations.gold, v.goldPercent)).toBe(true);
    expect(eq(goldPercentToVarna(m.concentrations.gold), v.finalVarna)).toBe(true);
  });

  it('converts kilograms to grams and equal masses give the midpoint', () => {
    const r = mixVarna([piece('a', '1', '16', 'kg'), piece('b', '1000', '8', 'g')]);
    if (!r.ok) throw new Error('x');
    expect(eq(r.finalVarna, q(12))).toBe(true);
    expect(eq(r.totalGrams, q(2000))).toBe(true);
  });

  it('the result always lies between the lowest and highest purity (property)', () => {
    for (let a = 0; a <= 16; a += 4) for (let b = 0; b <= 16; b += 5) for (const [x, y] of [[1, 1], [1, 9], [7, 2]]) {
      const r = mixVarna([piece('a', String(x), String(a)), piece('b', String(y), String(b))]);
      if (!r.ok) throw new Error('x');
      expect(toNumber(r.finalVarna)).toBeGreaterThanOrEqual(Math.min(a, b) - 1e-12);
      expect(toNumber(r.finalVarna)).toBeLessThanOrEqual(Math.max(a, b) + 1e-12);
    }
  });

  it('rejects impossible input explicitly', () => {
    expect(validateVarna([])?.code).toBe('empty');
    expect(validateVarna([piece('a', '-1', '10')])?.code).toBe('negative_mass');
    expect(validateVarna([piece('a', '1', '17')])?.code).toBe('bad_varna');
    expect(validateVarna([piece('a', '1', '-1')])?.code).toBe('bad_varna');
    expect(validateVarna([piece('a', '0', '10'), piece('b', '0', '12')])?.code).toBe('zero_total');
    const zero = mixVarna([piece('a', '0', '5'), piece('b', '5', '12')]);
    expect(zero.ok && eq(zero.finalVarna, q(12))).toBe(true); // zero-mass piece has no effect
  });

  it('solves how much extra gold is needed, and detects impossible targets', () => {
    // 10 g at 12 varṇa + y g at 16 varṇa = 14 varṇa → y = 10
    const s = massToReachTarget([piece('a', '10', '12')], q(16), q(14));
    expect(s.kind === 'mass' && eq(s.grams, q(10))).toBe(true);
    expect(massToReachTarget([piece('a', '10', '12')], q(16), q(11)).kind).toBe('impossible');
    expect(massToReachTarget([piece('a', '10', '12')], q(12), q(12)).kind).toBe('any_mass');
    expect(massToReachTarget([piece('a', '10', '12')], q(20), q(14)).kind).toBe('impossible');
  });

  it('the calculation text shows every contribution and the equivalent weighted mean', () => {
    const pieces = [piece('a', '6', '14'), piece('b', '4', '10')];
    const r = mixVarna(pieces);
    if (!r.ok) throw new Error('x');
    const text = describeVarna(pieces, r).join(' | ');
    expect(text).toMatch(/a: 6 g at 14 varṇa → 14 ÷ 16 = 0\.875 gold → 5\.25 g of gold/);
    expect(text).toMatch(/Final purity = gold fraction × 16 = 12\.4 varṇa/);
    expect(text).toMatch(/weighted mean of the varṇa values/);
  });
});
