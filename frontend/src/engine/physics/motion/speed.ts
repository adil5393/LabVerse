/**
 * Speed and velocity from a motion history (PHY-1B), built on the same path model as PHY-1A.
 *
 * A path is a list of legs; inside a leg the object moves uniformly (a stated idealisation: its velocity
 * jumps at the turns). From the history we can ask, for ANY time interval [t0, t1] of simulated time:
 *   average speed    = total distance travelled ÷ time interval        (a size, never negative)
 *   average velocity = displacement ÷ time interval                    (signed: the direction matters)
 * These are AVERAGES over the interval, not instantaneous values. Replay speed (a screen setting) plays no
 * part: only simulated time does. SI units: metres, seconds, m/s.
 */

import { addMove, newPath, sampleAt, totalDurationMs, type Leg, type MotionPath } from './kinematics';

export interface RouteLeg { toM: number; durationS: number }
export interface Route { startM: number; legs: RouteLeg[] }

export const TRACK_RANGE: [number, number] = [-100, 200];

export function pathFromRoute(route: Route, range: [number, number] = TRACK_RANGE): MotionPath {
  let p = newPath(route.startM, range[0], range[1]);
  for (const l of route.legs) {
    const r = addMove(p, l.toM, Math.round(l.durationS * 1000));
    if (!r.ok) throw new Error(r.reason);
    p = r.path;
  }
  return p;
}

export interface IntervalStats {
  timeS: number;
  distanceM: number;
  /** Signed: final position minus initial position over the interval. */
  displacementM: number;
  /** distance ÷ time; null when the interval has no length. */
  averageSpeed: number | null;
  /** displacement ÷ time; null when the interval has no length. */
  averageVelocity: number | null;
}

export function intervalStats(p: MotionPath, t0Ms: number, t1Ms: number): IntervalStats {
  const total = totalDurationMs(p);
  const a = Math.min(Math.max(0, t0Ms), total), b = Math.min(Math.max(0, t1Ms), total);
  const lo = Math.min(a, b), hi = Math.max(a, b);
  const s0 = sampleAt(p, lo), s1 = sampleAt(p, hi);
  const timeS = (hi - lo) / 1000;
  const distanceM = (s1.distanceCm - s0.distanceCm) / 100;
  const displacementM = (s1.positionCm - s0.positionCm) / 100;
  return { timeS, distanceM, displacementM, averageSpeed: timeS > 0 ? distanceM / timeS : null, averageVelocity: timeS > 0 ? displacementM / timeS : null };
}

export const wholeTrip = (p: MotionPath): IntervalStats => intervalStats(p, 0, totalDurationMs(p));

/** Signed velocity of one leg, in m/s (uniform inside the leg). */
export const legVelocity = (l: Leg): number => (l.toCm - l.fromCm) / 100 / (l.durationMs / 1000);
export const legSpeed = (l: Leg): number => Math.abs(legVelocity(l));

export type MotionKind = 'at rest' | 'uniform motion' | 'non-uniform motion';

/**
 * Textbook (4.1.3): uniform motion is equal distances in equal intervals of time, for every choice of intervals.
 * In a straight line that means the same velocity in every leg (same speed and the same direction).
 * A route with equal speed but a turn is uniform SPEED but not uniform VELOCITY: reported as non-uniform motion
 * with `uniformSpeed` true.
 */
export function motionKind(p: MotionPath): { kind: MotionKind; uniformSpeed: boolean; uniformVelocity: boolean } {
  const legs = p.legs;
  if (legs.length === 0 || legs.every((l) => l.toCm === l.fromCm)) return { kind: 'at rest', uniformSpeed: true, uniformVelocity: true };
  const v = legs.map(legVelocity);
  const eq = (a: number, b: number) => Math.abs(a - b) < 1e-9;
  const uniformVelocity = v.every((x) => eq(x, v[0]));
  const uniformSpeed = v.every((x) => eq(Math.abs(x), Math.abs(v[0])));
  return { kind: uniformVelocity ? 'uniform motion' : 'non-uniform motion', uniformSpeed, uniformVelocity };
}

export const KMH_PER_MS = 3.6;
export const msToKmh = (v: number): number => v * KMH_PER_MS;
export const kmhToMs = (v: number): number => v / KMH_PER_MS;

const trim = (n: number, places = 2): string => String(Math.round(n * 10 ** places) / 10 ** places);
const MINUS = '−';
export const fmtRate = (v: number): string => `${v < 0 ? MINUS : ''}${trim(Math.abs(v))} m/s`;
export const fmtSignedRate = (v: number): string => `${v > 0 ? '+' : v < 0 ? MINUS : ''}${trim(Math.abs(v))} m/s`;

/** The substitutions, as sentences ready to show. */
export function speedVelocityLines(s: IntervalStats): { speed: string; velocity: string; direction: string } {
  if (s.timeS <= 0 || s.averageSpeed === null || s.averageVelocity === null) return { speed: 'No time has passed, so no average can be found.', velocity: '', direction: '' };
  const speed = `average speed = distance ÷ time = ${trim(s.distanceM)} m ÷ ${trim(s.timeS)} s = ${trim(s.averageSpeed)} m/s`;
  const velocity = `average velocity = displacement ÷ time = ${s.displacementM < 0 ? MINUS : ''}${trim(Math.abs(s.displacementM))} m ÷ ${trim(s.timeS)} s = ${fmtSignedRate(s.averageVelocity)}`;
  const direction = Math.abs(s.averageVelocity) < 1e-9 ? 'The average velocity is zero: the object ends where it started.' : `The average velocity points in the ${s.averageVelocity > 0 ? 'positive (right)' : 'negative (left)'} direction, the direction of the displacement.`;
  return { speed, velocity, direction };
}

/** The textbook's condition: magnitude of average velocity equals average speed exactly when the object never turns back. */
export function speedEqualsVelocityMagnitude(s: IntervalStats): boolean {
  if (s.averageSpeed === null || s.averageVelocity === null) return true;
  return Math.abs(Math.abs(s.averageVelocity) - s.averageSpeed) < 1e-9;
}

/** Velocity (m/s, signed) of the leg containing time t; at the very end, the last leg; 0 for an empty path. */
export function velocityAt(p: MotionPath, tMs: number): number {
  let start = 0;
  for (let i = 0; i < p.legs.length; i++) {
    const end = start + p.legs[i].durationMs;
    if (tMs < end || i === p.legs.length - 1) return legVelocity(p.legs[i]);
    start = end;
  }
  return 0;
}
