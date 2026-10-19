/**
 * Guided investigations for the Motion Laboratory (optional; the Free Laboratory needs none of them).
 * Each route is a list of target positions in metres starting from the experiment's start position.
 * The "model values" shown to students are computed from the motion model, never stored here.
 */

import { addMove, newPath, summary } from './kinematics';

export interface MotionRoute { id: string; label: string; moves: number[] }

export interface MotionExperiment {
  id: 'A' | 'B' | 'C' | 'D';
  title: string;
  goal: string;
  start: number;
  range: [number, number];
  routes: MotionRoute[];
  /** What to notice after comparing prediction and model. */
  lesson: string;
}

export const MOTION_EXPERIMENTS: MotionExperiment[] = [
  { id: 'A', title: 'Moving forward', goal: 'Predict the distance and the displacement of a trip that never turns back.', start: 0, range: [-50, 100], routes: [{ id: 'a1', label: 'Forward to +30 m, then forward to +50 m', moves: [30, 50] }], lesson: 'With no turning back, the distance equals the size of the displacement.' },
  { id: 'B', title: 'Returning home', goal: 'Go out and come back. Predict what happens to the displacement, and to the distance.', start: 0, range: [-50, 100], routes: [{ id: 'b1', label: 'Out to +40 m, then back to the start (0 m)', moves: [40, 0] }], lesson: 'The object ends where it began, so the displacement is zero, but the whole path still counts as distance.' },
  { id: 'C', title: 'Changing direction', goal: 'Go forward, backward and forward again. Compare the length of the path with the displacement.', start: 0, range: [-50, 100], routes: [{ id: 'c1', label: 'To +40 m, back to +10 m, then forward to +60 m', moves: [40, 10, 60] }], lesson: 'Each reversal adds distance; the displacement only depends on the start and the end.' },
  { id: 'D', title: 'Different routes, same displacement', goal: 'Two routes start and end at the same places. Predict their distances and displacements.', start: 0, range: [-50, 100], routes: [{ id: 'd1', label: 'Route 1: straight to +30 m', moves: [30] }, { id: 'd2', label: 'Route 2: to +50 m, then back to +30 m', moves: [50, 30] }], lesson: 'Same start and end give the same displacement, but the longer route has the larger distance.' },
];

export const experimentById = (id: string | null | undefined): MotionExperiment | undefined => MOTION_EXPERIMENTS.find((e) => e.id === id);

/** Model values for a route, in metres. */
export function routeValues(e: MotionExperiment, r: MotionRoute): { distanceM: number; displacementM: number } {
  let p = newPath(e.start, e.range[0], e.range[1]);
  for (const t of r.moves) { const x = addMove(p, t); if (!x.ok) throw new Error(x.reason); p = x.path; }
  const s = summary(p);
  return { distanceM: s.distanceCm / 100, displacementM: s.displacementCm / 100 };
}

export interface PredictionFeedback { distanceRight: boolean; displacementRight: boolean; messages: string[] }

/** Compare a student's prediction with the model, with a specific reason for each kind of miss. */
export function comparePrediction(actual: { distanceM: number; displacementM: number }, pred: { distanceM: number; displacementM: number }): PredictionFeedback {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const distanceRight = near(actual.distanceM, pred.distanceM), displacementRight = near(actual.displacementM, pred.displacementM);
  const messages: string[] = [];
  if (!distanceRight) {
    if (pred.distanceM < 0) messages.push('Distance is a length, so it cannot be negative.');
    else if (near(pred.distanceM, Math.abs(actual.displacementM))) messages.push(`You gave the size of the displacement (${Math.abs(actual.displacementM)} m). Distance adds the length of every leg, so the model gives ${actual.distanceM} m.`);
    else messages.push(`Add the length of every leg: the model gives ${actual.distanceM} m, not ${pred.distanceM} m.`);
  }
  if (!displacementRight) {
    if (near(pred.displacementM, actual.distanceM) && actual.distanceM !== Math.abs(actual.displacementM)) messages.push(`You gave the distance (${actual.distanceM} m). Displacement is final position minus initial position, which is ${actual.displacementM} m.`);
    else if (near(pred.displacementM, -actual.displacementM)) messages.push('Check the sign: right of the start is positive, left is negative.');
    else messages.push(`Displacement is final position minus initial position: the model gives ${actual.displacementM} m, not ${pred.displacementM} m.`);
  }
  if (distanceRight && displacementRight) messages.push('Your prediction matches the model.');
  return { distanceRight, displacementRight, messages };
}
