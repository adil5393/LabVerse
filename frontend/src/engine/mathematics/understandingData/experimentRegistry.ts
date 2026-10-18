/**
 * Workbench presets ("experiments") for the Understanding Data laboratory.
 * Guided lessons reference these by id; the free laboratory lists them.
 */

import type { UDExperiment } from './types';
import { WEIGHTED_SEEDS, MIXTURE_SEEDS } from './presets';

export const UD_EXPERIMENTS: UDExperiment[] = [
  { id: 'ud-misleading', title: 'Why Averages Can Mislead', subtitle: 'Two classes, one combined average', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.classes, simpleControls: true },
  { id: 'ud-sizes', title: 'Groups of Different Sizes', subtitle: 'When does a plain average work?', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.equalWeeks, simpleControls: true },
  { id: 'ud-weighted', title: 'Weighted Average Explorer', subtitle: 'Any number of groups and weights', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.threeGroups, simpleControls: false },
  { id: 'ud-ratings', title: 'Importance Weights and Ratings', subtitle: 'Marks and ratings with custom weights', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.ratings, simpleControls: false },
  { id: 'ud-solving', title: 'Changing the Weights', subtitle: 'Scale or shift every weight', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.scaling, simpleControls: false },
  { id: 'ud-mixture', title: 'Mixture Laboratory', subtitle: 'Quantities, concentrations and the final mix', defaultTab: 'mixture', mixture: MIXTURE_SEEDS.twoGlasses, simpleControls: true },
  { id: 'ud-stacked-read', title: 'Reading Stacked Bars', subtitle: 'Totals and parts together', defaultTab: 'charts', chart: { preset: 'spending', mode: 'absolute' }, simpleControls: true },
  { id: 'ud-stacked-build', title: 'Building Stacked Bars', subtitle: 'Enter your own data', defaultTab: 'charts', chart: { preset: 'houses', mode: 'absolute' }, simpleControls: false },
  { id: 'ud-percent', title: '100% Stacked Bars', subtitle: 'Shares inside each group', defaultTab: 'charts', chart: { preset: 'spending', mode: 'percent' }, simpleControls: true },
  { id: 'ud-compare', title: 'Counts versus Percentages', subtitle: 'Same data, two charts', defaultTab: 'charts', chart: { preset: 'blooms', mode: 'absolute' }, simpleControls: true },
  { id: 'ud-clustered', title: 'Clustered Columns or Stacked Bars?', subtitle: 'Same table, two ways to draw it', defaultTab: 'charts', chart: { preset: 'spending', mode: 'absolute', view: 'clustered' }, simpleControls: true },
  { id: 'ud-pie', title: 'Pie Chart of One Group', subtitle: 'Parts of one whole, with angles', defaultTab: 'charts', chart: { preset: 'spending', mode: 'absolute', view: 'pie', pieGroup: 0 }, simpleControls: true },
  { id: 'ud-choose', title: 'Choosing the Chart', subtitle: 'Which chart answers which question?', defaultTab: 'charts', chart: { preset: 'daytime', mode: 'absolute' }, simpleControls: true },
  { id: 'ud-claims', title: 'Misleading Conclusions', subtitle: 'What a chart cannot tell you', defaultTab: 'charts', chart: { preset: 'blooms', mode: 'percent' }, simpleControls: true },
  { id: 'ud-average-day', title: 'What an Average Hides', subtitle: 'The average day versus real days', defaultTab: 'average', chart: { preset: 'daytime', mode: 'absolute', weights: [3, 5, 2] }, simpleControls: false },
  { id: 'ud-varna', title: 'Gold Purity in Varṇa', subtitle: 'Melting pieces of different purity', defaultTab: 'mixture', mixture: MIXTURE_SEEDS.varna, simpleControls: false },
  { id: 'ud-practice', title: 'Chapter Practice', subtitle: 'Basic, Standard and Challenge', defaultTab: 'weighted', weighted: WEIGHTED_SEEDS.classes, simpleControls: false },
];

export const getUDExperiment = (id: string): UDExperiment => UD_EXPERIMENTS.find((e) => e.id === id) ?? UD_EXPERIMENTS[0];
