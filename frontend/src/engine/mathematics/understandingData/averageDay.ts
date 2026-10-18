/**
 * "An average hides differences" (M6.1), after Example 9 (A Typical Day).
 *
 * A population is made of groups (e.g. age groups) whose members spend a day
 * in different ways. The AVERAGE day is the weighted mean, activity by
 * activity, of the groups' days, weighted by population. It is an ordinary
 * weighted mean (§10.1), but no real group may live that day.
 *
 * Only means and the raw distributions are used. No variance or standard
 * deviation is introduced.
 */

import { type Q, ZERO, ONE, add, sub, div, abs, cmp, sum, q, eq } from './rational';
import { weightedMean, type WeightedItem } from './weightedMean';
import { type ChartDataset, cell, groupTotal } from './charts';

export type GroupWeights = Record<string, Q>;

export interface AverageRow {
  categoryId: string;
  mean: Q;
}

export type AverageDayResult =
  | { ok: true; rows: AverageRow[]; total: Q; totalWeight: Q }
  | { ok: false; error: string };

const weightOf = (w: GroupWeights, id: string): Q => w[id] ?? ONE;

/** Population-weighted average of each activity across groups. Missing cells count as 0. */
export function averageDay(ds: ChartDataset, weights: GroupWeights): AverageDayResult {
  const rows: AverageRow[] = [];
  let totalWeight = ZERO;
  for (const c of ds.categories) {
    const items: WeightedItem[] = ds.groups.map((g) => ({ id: g.id, label: g.label, value: cell(ds, g.id, c.id) ?? ZERO, weight: weightOf(weights, g.id) }));
    const r = weightedMean(items);
    if (!r.ok) return { ok: false, error: r.error.message };
    rows.push({ categoryId: c.id, mean: r.mean });
    totalWeight = r.totalWeight;
  }
  return { ok: true, rows, total: sum(rows.map((r) => r.mean)), totalWeight };
}

export interface ClosestGroup {
  groupId: string;
  /** Σ |group hours − average hours| over all activities. */
  distance: Q;
  /** Hours of the day that would have to be spent differently to match: distance ÷ 2 (when totals are equal). */
  hoursToShift: Q;
}

/** The real group whose day is nearest the average day (ties: the first). */
export function closestGroup(ds: ChartDataset, avg: AverageRow[]): ClosestGroup | null {
  let best: ClosestGroup | null = null;
  for (const g of ds.groups) {
    let d = ZERO;
    for (const r of avg) d = add(d, abs(sub(cell(ds, g.id, r.categoryId) ?? ZERO, r.mean)));
    if (best === null || cmp(d, best.distance) < 0) best = { groupId: g.id, distance: d, hoursToShift: div(d, q(2)) };
  }
  return best;
}

/** Mean hours per activity for one group = total ÷ number of activities. */
export const meanPerActivity = (ds: ChartDataset, groupId: string): Q | null => (ds.categories.length === 0 ? null : div(groupTotal(ds, groupId), q(ds.categories.length)));

/** Groups whose hours do not add up to the day length (default 24 h). */
export const hoursBudgetIssues = (ds: ChartDataset, hours = 24): { groupId: string; total: Q }[] =>
  ds.groups.filter((g) => !eq(groupTotal(ds, g.id), q(hours))).map((g) => ({ groupId: g.id, total: groupTotal(ds, g.id) }));

export const AVERAGE_ROW_ID = 'avg';

/** The dataset with one extra, read-only row holding the average day. */
export function withAverageRow(ds: ChartDataset, weights: GroupWeights, label = 'Average day'): { dataset: ChartDataset; result: AverageDayResult } {
  const result = averageDay(ds, weights);
  if (!result.ok) return { dataset: ds, result };
  const row: Record<string, Q | null> = {};
  for (const r of result.rows) row[r.categoryId] = r.mean;
  return {
    result,
    dataset: { ...ds, groups: [...ds.groups, { id: AVERAGE_ROW_ID, label }], values: { ...ds.values, [AVERAGE_ROW_ID]: row } },
  };
}

/** True when two groups have exactly the same value in every category (identical distributions). */
export const sameDistribution = (ds: ChartDataset, a: string, b: string): boolean => ds.categories.every((c) => eq(cell(ds, a, c.id) ?? ZERO, cell(ds, b, c.id) ?? ZERO));
