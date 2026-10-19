/**
 * Guided investigations for the Motion Laboratory (optional; the Free Laboratory needs none of them).
 * Each route is a list of target positions in metres starting from the experiment's start position.
 * The "model values" shown to students are computed from the motion model, never stored here.
 */

import { addMove, newPath, summary } from './kinematics';
import { wholeTrip } from './speed';

export interface MotionRoute { id: string; label: string; moves: number[]; /** Seconds for each leg (default 1 s). */ durations?: number[] }

export interface MotionExperiment {
  id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I';
  /** What the student predicts: distance and displacement (PHY-1A) or average speed and average velocity (PHY-1B). */
  predict?: 'distance' | 'speed';
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
  { id: 'E', predict: 'speed', title: 'Equal distances, different times', goal: 'Two objects travel the same distance in different times. Predict the average speed and the average velocity of each.', start: 0, range: [-70, 100], routes: [{ id: 'e1', label: 'Slow trip: O to +60 m in 12 s', moves: [60], durations: [12] }, { id: 'e2', label: 'Quick trip: O to +60 m in 6 s', moves: [60], durations: [6] }], lesson: 'The same distance in less time means a greater average speed. Both trips go one way, so the average velocity has the same size as the average speed.' },
  { id: 'F', predict: 'speed', title: 'Equal times, different distances', goal: 'Two objects move for the same time but cover different distances. Predict the average speed and average velocity of each.', start: 0, range: [-70, 100], routes: [{ id: 'f1', label: 'O to +30 m in 10 s', moves: [30], durations: [10] }, { id: 'f2', label: 'O to +80 m in 10 s', moves: [80], durations: [10] }], lesson: 'In the same time, the longer distance means the greater average speed: speed = distance ÷ time.' },
  { id: 'G', predict: 'speed', title: 'Reversing direction', goal: 'An object goes out, then comes part of the way back. Predict its average speed and its average velocity.', start: 0, range: [-70, 100], routes: [{ id: 'g1', label: 'O to +40 m in 4 s, then back to +10 m in 6 s', moves: [40, 10], durations: [4, 6] }], lesson: 'The distance is 70 m but the displacement is only +10 m, so the average speed (7 m/s) is much greater than the size of the average velocity (1 m/s).' },
  { id: 'H', predict: 'speed', title: 'Returning to the start', goal: 'An object goes out and comes back to where it began. Predict its average speed and its average velocity.', start: 0, range: [-70, 100], routes: [{ id: 'h1', label: 'O to +30 m in 5 s, then back to O in 5 s', moves: [30, 0], durations: [5, 5] }], lesson: 'The displacement is zero, so the average velocity is zero, even though the object was moving all the time and its average speed is not zero.' },
  { id: 'I', predict: 'speed', title: 'Same average speed, different average velocity', goal: 'Three trips cover the same distance in the same time. Predict how their average speeds and average velocities compare.', start: 0, range: [-70, 100], routes: [{ id: 'i1', label: 'O to +60 m in 10 s', moves: [60], durations: [10] }, { id: 'i2', label: 'O to +30 m in 5 s, then back to O in 5 s', moves: [30, 0], durations: [5, 5] }, { id: 'i3', label: 'O to −60 m in 10 s', moves: [-60], durations: [10] }], lesson: 'All three have an average speed of 6 m/s, but the average velocities are +6 m/s, 0 and −6 m/s. Speed ignores direction; velocity does not.' },
];

export const experimentById = (id: string | null | undefined): MotionExperiment | undefined => MOTION_EXPERIMENTS.find((e) => e.id === id);

/** Model values for a route, in metres. */
export function routeValues(e: MotionExperiment, r: MotionRoute): { distanceM: number; displacementM: number } {
  let p = newPath(e.start, e.range[0], e.range[1]);
  for (const [i, t] of r.moves.entries()) { const x = addMove(p, t, Math.round((r.durations?.[i] ?? 1) * 1000)); if (!x.ok) throw new Error(x.reason); p = x.path; }
  const s = summary(p);
  return { distanceM: s.distanceCm / 100, displacementM: s.displacementCm / 100 };
}

/** Model average speed and average velocity (m/s) for a route, derived from the same path. */
export function routeRates(e: MotionExperiment, r: MotionRoute): { averageSpeed: number; averageVelocity: number; timeS: number } {
  let p = newPath(e.start, e.range[0], e.range[1]);
  for (const [i, t] of r.moves.entries()) { const x = addMove(p, t, Math.round((r.durations?.[i] ?? 1) * 1000)); if (!x.ok) throw new Error(x.reason); p = x.path; }
  const w = wholeTrip(p);
  return { averageSpeed: w.averageSpeed ?? 0, averageVelocity: w.averageVelocity ?? 0, timeS: w.timeS };
}

export interface RateFeedback { speedRight: boolean; velocityRight: boolean; messages: string[] }

/** Compare predicted average speed and velocity with the model, with a specific message for each common mistake. */
export function compareRatePrediction(actual: { averageSpeed: number; averageVelocity: number; timeS: number }, pred: { speed: number; velocity: number }): RateFeedback {
  const near = (a: number, b: number) => Math.abs(a - b) < 0.005;
  const speedRight = near(actual.averageSpeed, pred.speed), velocityRight = near(actual.averageVelocity, pred.velocity);
  const messages: string[] = [];
  if (!speedRight) {
    if (pred.speed < 0) messages.push('Speed is distance ÷ time, and a distance cannot be negative, so average speed is never negative.');
    else if (near(pred.speed, Math.abs(actual.averageVelocity)) && !near(actual.averageSpeed, Math.abs(actual.averageVelocity))) messages.push(`You used the displacement. Average speed uses the total distance travelled (all legs): the model gives ${actual.averageSpeed} m/s.`);
    else messages.push(`Average speed = total distance ÷ total time. The model gives ${actual.averageSpeed} m/s, not ${pred.speed} m/s.`);
  }
  if (!velocityRight) {
    if (near(pred.velocity, actual.averageSpeed) && !near(actual.averageSpeed, actual.averageVelocity)) messages.push(`You gave the average speed. Average velocity = displacement ÷ time, and it keeps its sign: the model gives ${actual.averageVelocity} m/s.`);
    else if (near(pred.velocity, -actual.averageVelocity)) messages.push('Check the sign: velocity is positive to the right and negative to the left, the direction of the displacement.');
    else messages.push(`Average velocity = displacement ÷ time. The model gives ${actual.averageVelocity} m/s, not ${pred.velocity} m/s.`);
  }
  if (speedRight && velocityRight) messages.push('Your prediction matches the model.');
  return { speedRight, velocityRight, messages };
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
