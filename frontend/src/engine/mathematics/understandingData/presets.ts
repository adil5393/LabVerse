/**
 * Chart presets, weighted-average seeds and mixture seeds shared by the free
 * laboratory, the guided lessons and the practice bank. All numbers here are
 * original LabVerse data (not copied from the textbook).
 */

import { makeDataset, type ChartDataset } from './charts';
import { parseQ } from './rational';
import type { Constituent } from './mixture';
import type { ChartPresetId, MixtureSeed, WeightedRow, WeightedSeed } from './types';

export const CHART_PRESETS: Record<ChartPresetId, () => ChartDataset> = {
  houses: () =>
    makeDataset('Students in two school houses', 'students', ['Boys', 'Girls'], [
      { label: 'House A', values: [120, 80] },
      { label: 'House B', values: [60, 140] },
    ]),
  spending: () =>
    makeDataset('Weekly spending of three households', '₹', ['Housing', 'Food', 'Travel', 'Other'], [
      { label: 'Home 1', values: [900, 700, 300, 100] },
      { label: 'Home 2', values: [450, 350, 150, 50] },
      { label: 'Home 3', values: [600, 1200, 500, 700] },
    ]),
  blooms: () =>
    makeDataset('Blooms in two gardens', 'blooms', ['Summer', 'Monsoon', 'Winter'], [
      { label: 'Garden P', values: [90, 60, 30] },
      { label: 'Garden Q', values: [150, 200, 50] },
    ]),
  daytime: () =>
    makeDataset('Hours of the day by age group', 'hours', ['Sleep', 'School/Work', 'Leisure', 'Other'], [
      { label: 'Children', values: [9, 6, 5, 4] },
      { label: 'Adults', values: [7, 8, 3, 6] },
      { label: 'Elderly', values: [8, 1, 8, 7] },
    ]),
  race: () =>
    makeDataset('Minutes spent in each leg of a relay', 'minutes', ['Swim', 'Cycle', 'Run'], [
      { label: 'Team 1', values: [20, 60, 40] },
      { label: 'Team 2', values: [25, 55, 45] },
      { label: 'Team 3', values: [30, 70, 50] },
    ]),
};

export const WEIGHTED_SEEDS: Record<string, WeightedSeed> = {
  classes: {
    meaning: 'size',
    valueLabel: 'Average marks',
    weightLabel: 'Students',
    unit: 'marks',
    rows: [
      { label: 'Class A', value: '80', weight: '10' },
      { label: 'Class B', value: '50', weight: '30' },
    ],
  },
  equalWeeks: {
    meaning: 'size',
    valueLabel: 'Weekly average (min)',
    weightLabel: 'Days',
    unit: 'min',
    rows: [
      { label: 'Week 1', value: '12', weight: '5' },
      { label: 'Week 2', value: '16', weight: '5' },
      { label: 'Week 3', value: '20', weight: '5' },
    ],
  },
  ratings: {
    meaning: 'importance',
    valueLabel: 'Score (out of 100)',
    weightLabel: 'Weight',
    unit: 'marks',
    rows: [
      { label: 'Class tests', value: '60', weight: '3' },
      { label: 'Project', value: '70', weight: '2' },
      { label: 'Final exam', value: '85', weight: '5' },
    ],
  },
  threeGroups: {
    meaning: 'size',
    valueLabel: 'Average',
    weightLabel: 'Group size',
    unit: '',
    rows: [
      { label: 'Group 1', value: '40', weight: '8' },
      { label: 'Group 2', value: '55', weight: '12' },
      { label: 'Group 3', value: '70', weight: '20' },
    ],
  },
  scaling: {
    meaning: 'importance',
    valueLabel: 'Value',
    weightLabel: 'Weight',
    unit: '',
    rows: [
      { label: 'x₁', value: '4', weight: '1' },
      { label: 'x₂', value: '8', weight: '2' },
      { label: 'x₃', value: '12', weight: '3' },
    ],
  },
};

export const MIXTURE_SEEDS: Record<string, MixtureSeed> = {
  twoGlasses: {
    solute: 'jaggery',
    rows: [
      { label: 'Glass 1', quantity: '200', unit: 'mL', percent: '10' },
      { label: 'Glass 2', quantity: '300', unit: 'mL', percent: '20' },
    ],
  },
  equalGlasses: {
    solute: 'jaggery',
    rows: [
      { label: 'Glass 1', quantity: '250', unit: 'mL', percent: '10' },
      { label: 'Glass 2', quantity: '250', unit: 'mL', percent: '20' },
    ],
  },
};

let rowCounter = 0;
export const newId = (prefix: string): string => `${prefix}${++rowCounter}`;

export function weightedRowsFromSeed(seed: WeightedSeed): WeightedRow[] {
  return seed.rows.map((r) => ({
    id: newId('r'),
    label: r.label,
    value: parseQ(r.value)!,
    weight: parseQ(r.weight)!,
    valueIsRounded: r.rounded,
  }));
}

export function constituentsFromSeed(seed: MixtureSeed): Constituent[] {
  return seed.rows.map((r) => ({
    id: newId('m'),
    label: r.label,
    quantity: parseQ(r.quantity)!,
    unit: r.unit,
    solutes: { [seed.solute]: parseQ(r.percent)! },
  }));
}
