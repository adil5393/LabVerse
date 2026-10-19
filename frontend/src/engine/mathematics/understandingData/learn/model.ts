/**
 * Understanding Data: the one model behind every Learn figure, readout, text
 * alternative and answer (EDU-1M6). It only composes the existing exact-rational
 * engines (weightedMean, charts, pie, averageDay), so a graph, a table, a
 * calculation and the written explanation cannot disagree.
 */

import { type ChartDataset, cell, groupShares, groupTotal, makeDataset, categoryTotal, grandTotal } from '../charts';
import { averageDay, withAverageRow } from '../averageDay';
import { type Q, ZERO, formatDecimal, formatSmart, parseQ, q, toNumber } from '../rational';
import { compareNaiveWeighted, describeCalculation, weightedMean, type WeightedItem } from '../weightedMean';

export type { ChartDataset, Q };
export { cell, groupShares, groupTotal, categoryTotal, grandTotal, makeDataset, averageDay, withAverageRow, q, toNumber, formatDecimal, formatSmart };

export const show = (x: Q): string => formatSmart(x, 2);

// ---------------------------------------------------------------------------
// Weighted means
// ---------------------------------------------------------------------------

export interface WeightedRowIn { label: string; value: Q; weight: Q }

export type WeightedView =
  | { ok: false; message: string }
  | { ok: true; mean: Q; naive: Q | null; totalWeight: Q; sumProducts: Q; steps: string[]; differsFromNaive: boolean; products: { label: string; product: Q }[] };

export function weightedView(rows: readonly WeightedRowIn[]): WeightedView {
  const items: WeightedItem[] = rows.map((r, i) => ({ id: `r${i}`, label: r.label, value: r.value, weight: r.weight }));
  const w = weightedMean(items);
  if (!w.ok) return { ok: false, message: w.error.message };
  const cmp = compareNaiveWeighted(items);
  return {
    ok: true, mean: w.mean, naive: cmp?.naive ?? null, totalWeight: w.totalWeight, sumProducts: w.sumProducts,
    steps: describeCalculation(items, show), differsFromNaive: cmp ? !cmp.agree : false,
    products: w.contributions.map((c) => ({ label: c.label, product: c.product })),
  };
}

export const wRow = (label: string, value: number, weight: number): WeightedRowIn => ({ label, value: parseQ(String(value)) ?? ZERO, weight: parseQ(String(weight)) ?? ZERO });

export function describeWeighted(intro: string, rows: readonly WeightedRowIn[], valueLabel: string, weightLabel: string): string {
  const v = weightedView(rows);
  const list = rows.map((r) => `${r.label}: ${valueLabel} ${show(r.value)}, ${weightLabel} ${show(r.weight)}`).join('; ');
  if (!v.ok) return `${intro} ${list}. ${v.message}`;
  return `${intro} ${list}. The weighted mean is ${show(v.mean)}${v.naive ? ` and the plain average of the ${valueLabel} figures is ${show(v.naive)}` : ''}.`;
}

// ---------------------------------------------------------------------------
// Charts
// ---------------------------------------------------------------------------

export interface ChartSpec { title: string; unit: string; categories: string[]; rows: { label: string; values: number[] }[] }

export const datasetOf = (s: ChartSpec): ChartDataset => makeDataset(s.title, s.unit, s.categories, s.rows);

export function describeDataset(intro: string, ds: ChartDataset): string {
  const rows = ds.groups.map((g) => `${g.label}: ${ds.categories.map((c) => `${c.label} ${cell(ds, g.id, c.id) === null ? 'missing' : show(cell(ds, g.id, c.id)!)}`).join(', ')} (total ${show(groupTotal(ds, g.id))})`);
  return `${intro} ${ds.title}, in ${ds.unit}. ${rows.join('. ')}.`;
}

/** Percentage of a group's total taken by one category, exact then rounded for display. */
export function sharePercent(ds: ChartDataset, groupId: string, categoryId: string, places = 1): string | null {
  const s = groupShares(ds, groupId, places);
  if (s.status !== 'ok') return null;
  return s.rows.find((r) => r.categoryId === categoryId)?.text ?? null;
}

export { ZERO };
