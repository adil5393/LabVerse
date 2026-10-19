/** Visual references for the Understanding Data lessons; alternatives are generated from the same data. */

import type { VisualRef } from '../../../education/types';
import { datasetOf, describeDataset, describeWeighted, wRow, type ChartSpec } from './model';

export { ind, num as numQ, ord, pick } from '../../../education/builders';

export interface UdWeightedProps {
  mode: 'groups' | 'weights' | 'mixture';
  items: { label: string; value: number; weight: number }[];
  valueLabel: string;
  weightLabel: string;
  /** Items can be edited and added. Default true. */
  edit?: boolean;
}

export type UdChartKind = 'absolute' | 'percent' | 'clustered-group' | 'clustered-category' | 'pie';

export interface UdChartProps {
  spec: ChartSpec;
  kind: UdChartKind;
  /** Which chart kinds the student can switch between. */
  kinds?: UdChartKind[];
  edit?: boolean;
  /** Add an "Average day" row computed with these weights, one per group. */
  avgWeights?: number[];
}

export const weightedVisual = (p: UdWeightedProps, intro: string): VisualRef => ({
  kind: 'udWeighted', props: p as unknown as Record<string, unknown>,
  alt: describeWeighted(intro, p.items.map((i) => wRow(i.label, i.value, i.weight)), p.valueLabel, p.weightLabel),
});

export const chartVisual = (p: UdChartProps, intro: string): VisualRef => ({
  kind: 'udChart', props: p as unknown as Record<string, unknown>, alt: describeDataset(intro, datasetOf(p.spec)),
});
