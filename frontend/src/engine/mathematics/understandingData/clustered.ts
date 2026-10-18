/**
 * Clustered-column model (M6.1), as taught in §10.2.1: the same table can be
 * clustered two ways depending on the focus.
 *
 *   by 'group'    : one cluster per group, one column per category
 *   by 'category' : one cluster per category, one column per group
 *
 * The raw dataset is only read. Values must be non-negative (the dataset
 * editor, CSV import and setCell all enforce this), the axis always starts at
 * 0, and a MISSING cell is kept distinct from a zero-height column.
 */

import { type Q, ZERO, isNeg, cmp, toNumber } from './rational';
import { type ChartDataset, cell, niceAxis, type Axis } from './charts';

export type ClusterBy = 'group' | 'category';

export interface ClusterBar {
  /** Id of the series member (a category when clustering by group, a group when by category). */
  seriesId: string;
  seriesLabel: string;
  /** Position in the series legend (drives the colour). */
  seriesIndex: number;
  groupId: string;
  categoryId: string;
  /** null = MISSING (drawn as a gap with a marker, never as 0). */
  value: Q | null;
}

export interface Cluster {
  id: string;
  label: string;
  bars: ClusterBar[];
}

export interface ClusterLayout {
  by: ClusterBy;
  clusters: Cluster[];
  series: { id: string; label: string }[];
  maxValue: Q;
  axis: Axis;
}

export function clusterLayout(ds: ChartDataset, by: ClusterBy): ClusterLayout {
  const series = by === 'group' ? ds.categories : ds.groups;
  const clusters: Cluster[] = (by === 'group' ? ds.groups : ds.categories).map((owner) => ({
    id: owner.id,
    label: owner.label,
    bars: series.map((s, i) => {
      const groupId = by === 'group' ? owner.id : s.id;
      const categoryId = by === 'group' ? s.id : owner.id;
      return { seriesId: s.id, seriesLabel: s.label, seriesIndex: i, groupId, categoryId, value: cell(ds, groupId, categoryId) };
    }),
  }));
  let max = ZERO;
  for (const c of clusters) for (const b of c.bars) if (b.value && !isNeg(b.value) && cmp(b.value, max) > 0) max = b.value;
  return { by, clusters, series: series.map((s) => ({ id: s.id, label: s.label })), maxValue: max, axis: niceAxis(toNumber(max)) };
}

/** Column height as a fraction of the axis (0..1). Missing and negative values give 0. */
export const columnFraction = (value: Q | null, axisMax: number): number => (value && !isNeg(value) && axisMax > 0 ? Math.min(1, toNumber(value) / axisMax) : 0);

/** Largest single column (ties reported), for "tap the tallest column" questions. */
export function tallestColumns(ds: ChartDataset): { groupId: string; categoryId: string }[] {
  let best: Q | null = null;
  let out: { groupId: string; categoryId: string }[] = [];
  for (const g of ds.groups) {
    for (const c of ds.categories) {
      const v = cell(ds, g.id, c.id);
      if (!v || isNeg(v)) continue;
      if (best === null || cmp(v, best) > 0) {
        best = v;
        out = [{ groupId: g.id, categoryId: c.id }];
      } else if (cmp(v, best) === 0) out.push({ groupId: g.id, categoryId: c.id });
    }
  }
  return out;
}
