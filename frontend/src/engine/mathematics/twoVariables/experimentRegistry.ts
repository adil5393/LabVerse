/**
 * Workbench presets ("experiments") for the Two Variables laboratory.
 * Guided lessons reference these by id; the free laboratory lists them.
 */

import type { TVExperiment } from './types';

const base = {
  showTable: false,
  showSlope: false,
  showIntercepts: false,
  simpleControls: false,
};

export const TV_EXPERIMENTS: TVExperiment[] = [
  { ...base, id: 'tv-situations', title: 'Two Quantities, One Total', subtitle: 'Pens and pencils for ₹10', defaultTab: 'graph', eq1: '2x + y = 10', showTable: true, simpleControls: true },
  { ...base, id: 'tv-standard-form', title: 'Anatomy of ax + by + c = 0', subtitle: 'Change a, b and c', defaultTab: 'graph', eq1: '2x + 3y = 12' },
  { ...base, id: 'tv-solutions', title: 'Solution Finder', subtitle: 'Choose x, calculate y', defaultTab: 'graph', eq1: '2x + 3y = 12', showTable: true, simpleControls: true },
  { ...base, id: 'tv-points', title: 'Solutions as Points', subtitle: 'Plot ordered pairs', defaultTab: 'graph', eq1: '2x + 3y = 12', showTable: true, simpleControls: true },
  { ...base, id: 'tv-line', title: 'Many Points, One Line', subtitle: 'Drag a point along the line', defaultTab: 'graph', eq1: '2x + 3y = 12', showTable: true, simpleControls: true },
  { ...base, id: 'tv-slope-intercept', title: 'Slope and Intercepts', subtitle: 'Watch slope, x- and y-intercepts', defaultTab: 'graph', eq1: '2x + 3y = 12', showSlope: true, showIntercepts: true },
  { ...base, id: 'tv-two-lines', title: 'Two Lines on One Graph', subtitle: 'Edit both equations', defaultTab: 'system', eq1: '2x + 3y = 12', eq2: 'x + y = 5' },
  { ...base, id: 'tv-intersection', title: 'The Intersection Is a Solution', subtitle: 'Verify by substitution', defaultTab: 'system', eq1: '2x + 3y = 12', eq2: 'x + y = 5' },
  { ...base, id: 'tv-classification', title: 'One, None or Infinitely Many', subtitle: 'Intersecting, parallel and coincident', defaultTab: 'system', eq1: 'x + 2y = 4', eq2: '2x + 3y = 9' },
  { ...base, id: 'tv-substitution', title: 'Solve by Substitution', subtitle: 'Step-by-step algebra linked to the graph', defaultTab: 'algebra', eq1: '2x + 3y = 12', eq2: 'x + y = 5' },
  { ...base, id: 'tv-elimination', title: 'Solve by Elimination', subtitle: 'Multiply, add or subtract', defaultTab: 'algebra', eq1: '2x + 3y = 12', eq2: 'x + y = 5' },
  { ...base, id: 'tv-models', title: 'Real-World Linear Models', subtitle: 'Fixed fee plus a rate', defaultTab: 'graph', eq1: 'y = 3x + 10', showTable: true, showIntercepts: true, showSlope: true },
  { ...base, id: 'tv-investigation', title: 'Why Many Solutions?', subtitle: 'One equation, infinitely many pairs', defaultTab: 'graph', eq1: '2x + 3y = 12', showTable: true },
  { ...base, id: 'tv-practice', title: 'Chapter Practice', subtitle: 'Basic, Standard and Challenge', defaultTab: 'graph', eq1: '2x + 3y = 12' },
];

export const getTVExperiment = (id: string): TVExperiment =>
  TV_EXPERIMENTS.find((e) => e.id === id) ?? TV_EXPERIMENTS[0];
