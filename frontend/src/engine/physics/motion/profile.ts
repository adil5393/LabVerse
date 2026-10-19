/**
 * Motion with constant acceleration in each stretch (PHY-1C), one dimension, SI units (m, s, m/s, m/s²).
 *
 * A profile is a start position, a start velocity and a list of segments, each with a duration and a
 * CONSTANT acceleration. Inside a segment the formulas are exact (no time stepping):
 *   v(t) = u + a t        x(t) = x0 + u t + ½ a t²
 * The position–time graph, the velocity–time graph, the numerical readouts and the distance all come
 * from this one function, so they can never disagree. Distance needs |v|, so a segment is split at the
 * instant the velocity passes through zero (the object turns back). The model is an idealisation:
 * real accelerations change gradually. With a = 0 everywhere it reduces to the uniform-motion legs of
 * the PHY-1A/1B path model (a test checks that they agree).
 */

export type GraphKind = 'xt' | 'vt' | 'at';

export interface Segment { durationS: number; a: number }
export interface Profile { x0: number; v0: number; segments: Segment[] }

export interface MotionState {
  t: number;
  /** Position from the reference point O, in metres (signed). */
  x: number;
  /** Instantaneous velocity in m/s (signed). */
  v: number;
  /** Acceleration in m/s² of the stretch containing t (signed). */
  a: number;
  /** Total path length travelled since t = 0. */
  distance: number;
  /** x(t) − x(0). */
  displacement: number;
}

export const LIMITS = { maxV: 40, maxA: 10, maxT: 30, maxX: 200 } as const;

export const totalTime = (p: Profile): number => p.segments.reduce((s, g) => s + g.durationS, 0);

interface Run { t: number; x: number; v: number; dist: number }

/** Advance a run state through `dt` seconds of constant acceleration `a`, adding |v| to the distance exactly. */
function advance(r: Run, a: number, dt: number): Run {
  const x1 = r.x + r.v * dt + 0.5 * a * dt * dt;
  const v1 = r.v + a * dt;
  let d = Math.abs(x1 - r.x);
  if (a !== 0) {
    const tt = -r.v / a; // time at which v = 0
    if (tt > 0 && tt < dt) {
      const xt = r.x + r.v * tt + 0.5 * a * tt * tt;
      d = Math.abs(xt - r.x) + Math.abs(x1 - xt);
    }
  }
  return { t: r.t + dt, x: x1, v: v1, dist: r.dist + d };
}

export function stateAt(p: Profile, tIn: number): MotionState {
  const total = totalTime(p);
  const t = Math.min(Math.max(0, tIn), total);
  let r: Run = { t: 0, x: p.x0, v: p.v0, dist: 0 };
  let a = p.segments[0]?.a ?? 0;
  let start = 0;
  for (let i = 0; i < p.segments.length; i++) {
    const g = p.segments[i];
    const end = start + g.durationS;
    if (t < end || i === p.segments.length - 1) {
      a = g.a;
      r = advance(r, g.a, t - start);
      return { t, x: r.x, v: r.v, a, distance: r.dist, displacement: r.x - p.x0 };
    }
    r = advance(r, g.a, g.durationS);
    start = end;
  }
  return { t, x: p.x0, v: p.v0, a, distance: 0, displacement: 0 };
}

/** Times (s) at which the velocity passes through zero strictly inside a segment: the object turns back. */
export function turningTimes(p: Profile): number[] {
  const out: number[] = [];
  let v = p.v0, start = 0;
  for (const g of p.segments) {
    if (g.a !== 0) { const tt = -v / g.a; if (tt > 1e-12 && tt < g.durationS - 1e-12) out.push(start + tt); }
    v += g.a * g.durationS; start += g.durationS;
  }
  return out;
}

/** Evenly spaced states for drawing a graph. */
export function series(p: Profile, n = 200): MotionState[] {
  const T = totalTime(p);
  const times = new Set<number>();
  for (let i = 0; i <= n; i++) times.add((T * i) / n);
  for (const t of turningTimes(p)) times.add(t);
  return [...times].sort((a, b) => a - b).map((t) => stateAt(p, t));
}

/** Average acceleration over [t0, t1]: change in velocity ÷ time taken. */
export function averageAcceleration(p: Profile, t0: number, t1: number): number | null {
  if (t1 === t0) return null;
  return (stateAt(p, t1).v - stateAt(p, t0).v) / (t1 - t0);
}

/** Area under the v–t graph between two times: signed area = displacement, area of |v| = distance. */
export function areaVT(p: Profile, t0: number, t1: number): { signed: number; absolute: number } {
  const a = stateAt(p, Math.min(t0, t1)), b = stateAt(p, Math.max(t0, t1));
  return { signed: b.displacement - a.displacement, absolute: b.distance - a.distance };
}

export type ProfileKind = 'rest' | 'constant velocity' | 'speeding up' | 'slowing down' | 'turns back' | 'changing';

/** Name of the motion for a single-segment profile (with several segments: 'changing'). */
export function classify(p: Profile): ProfileKind {
  if (p.segments.length !== 1) return 'changing';
  const { a } = p.segments[0];
  if (turningTimes(p).length > 0) return 'turns back';
  if (a === 0) return p.v0 === 0 ? 'rest' : 'constant velocity';
  if (p.v0 === 0) return 'speeding up';
  return a * p.v0 > 0 ? 'speeding up' : 'slowing down';
}

/** Reasons a profile is refused. Returns null if it is a legitimate motion within the lab's limits. */
export function validateProfile(p: Profile): string | null {
  if (!Number.isFinite(p.x0) || !Number.isFinite(p.v0)) return 'Start position and start velocity must be numbers.';
  if (p.segments.length === 0) return 'The motion needs at least one stretch of time.';
  if (Math.abs(p.v0) > LIMITS.maxV) return `Start velocity must be between −${LIMITS.maxV} and ${LIMITS.maxV} m/s.`;
  for (const g of p.segments) {
    if (!Number.isFinite(g.a) || !Number.isFinite(g.durationS)) return 'Acceleration and time must be numbers.';
    if (g.durationS <= 0) return 'Time must be greater than zero.';
    if (Math.abs(g.a) > LIMITS.maxA) return `Acceleration must be between −${LIMITS.maxA} and ${LIMITS.maxA} m/s².`;
  }
  if (totalTime(p) > LIMITS.maxT) return `The motion can last at most ${LIMITS.maxT} s.`;
  let r: Run = { t: 0, x: p.x0, v: p.v0, dist: 0 };
  for (const g of p.segments) {
    r = advance(r, g.a, g.durationS);
    if (Math.abs(r.v) > LIMITS.maxV * 2) return 'The velocity would become too large for this laboratory.';
  }
  for (const s of series(p, 60)) if (Math.abs(s.x) > LIMITS.maxX * 5) return 'The object would leave the range of this laboratory.';
  return null;
}

export const fmt = (n: number, places = 2): string => {
  const r = Math.round(n * 10 ** places) / 10 ** places;
  return `${r < 0 ? '−' : ''}${Math.abs(r)}`;
};
export const fmtSign = (n: number, places = 2): string => (n > 0 ? '+' : '') + fmt(n, places);

/** Plain-language description of the whole motion for screen readers and text alternatives. */
export function describeProfile(p: Profile, intro: string): string {
  const e = stateAt(p, totalTime(p));
  const tt = turningTimes(p);
  const g = p.segments.length === 1 ? p.segments[0] : null;
  const how = g
    ? g.a === 0 ? (p.v0 === 0 ? 'The object stays at rest.' : `The velocity stays constant at ${fmtSign(p.v0)} m/s.`)
      : `The acceleration is ${fmtSign(g.a)} m/s², constant, so the velocity changes by ${fmtSign(g.a)} m/s every second.`
    : 'The acceleration changes between stretches.';
  return `${intro} Start: position ${fmt(p.x0)} m, velocity ${fmtSign(p.v0)} m/s. ${how} After ${fmt(totalTime(p))} s the velocity is ${fmtSign(e.v)} m/s and the position is ${fmt(e.x)} m. The displacement is ${fmtSign(e.displacement)} m and the distance travelled is ${fmt(e.distance)} m.${tt.length ? ` The object turns back at ${fmt(tt[0])} s, when its velocity is zero.` : ''}`;
}

export interface Scenario {
  id: string;
  title: string;
  profile: Profile;
  /** What the student should notice. */
  notice: string;
  /** A prediction to make before running the scenario. */
  predict: { prompt: string; options: string[]; correct: number; explain: string };
}

const one = (x0: number, v0: number, a: number, durationS: number): Profile => ({ x0, v0, segments: [{ durationS, a }] });

export const SCENARIOS: Scenario[] = [
  { id: 'rest', title: 'At rest', profile: one(20, 0, 0, 10), notice: 'The x–t graph is a horizontal line (slope zero) and the v–t graph lies on the time axis.',
    predict: { prompt: 'The object stays at +20 m. What does its position–time graph look like?', options: ['A horizontal line', 'A line sloping upwards', 'A curve'], correct: 0, explain: 'The position never changes, so the slope of the x–t graph (the velocity) is zero: a horizontal line at 20 m.' } },
  { id: 'const-pos', title: 'Constant positive velocity', profile: one(0, 4, 0, 10), notice: 'x–t is a straight line sloping up with slope +4 m/s; v–t is a horizontal line at +4 m/s.',
    predict: { prompt: 'The velocity is a constant +4 m/s. What does the position–time graph look like?', options: ['A straight line sloping upwards', 'A horizontal line', 'A curve bending upwards'], correct: 0, explain: 'Equal changes of position in equal times make a straight line; its slope is the velocity, +4 m/s.' } },
  { id: 'const-neg', title: 'Constant negative velocity', profile: one(40, -4, 0, 10), notice: 'x–t slopes downward (slope −4 m/s); v–t is a horizontal line below the axis. The distance still grows.',
    predict: { prompt: 'The object moves left at a constant 4 m/s. The position–time graph is:', options: ['A straight line sloping downwards', 'A straight line sloping upwards', 'A horizontal line'], correct: 0, explain: 'The position decreases steadily, so the slope is negative, −4 m/s.' } },
  { id: 'speed-up', title: 'Increasing velocity', profile: one(0, 2, 2, 8), notice: 'v–t is a straight line with slope +2 m/s². x–t is a curve that gets steeper, because the slope is the velocity and it is increasing.',
    predict: { prompt: 'The velocity increases by 2 m/s every second. The position–time graph is:', options: ['A curve that gets steeper', 'A straight line', 'A curve that flattens'], correct: 0, explain: 'The slope of x–t is the velocity, which keeps increasing, so the graph steepens.' } },
  { id: 'slow-down', title: 'Decreasing speed', profile: one(0, 16, -2, 8), notice: 'The acceleration is negative while the velocity is positive: the speed falls to zero at 8 s. x–t flattens until its slope is zero.',
    predict: { prompt: 'The velocity is +16 m/s and the acceleration is −2 m/s². What happens to the speed?', options: ['It decreases to zero', 'It increases', 'It stays at 16 m/s'], correct: 0, explain: 'Acceleration opposite to the velocity reduces the speed by 2 m/s every second: zero after 8 s.' } },
  { id: 'reversal', title: 'Direction reversal', profile: one(0, 10, -2, 10), notice: 'The velocity passes through zero at 5 s, where x–t reaches its highest point (slope zero). After that the velocity is negative and the position falls. Distance 50 m, displacement 0.',
    predict: { prompt: 'The velocity starts at +10 m/s with acceleration −2 m/s². At 10 s the object is:', options: ['Back at its start, having turned back at 5 s', 'Still moving right, but slower', 'At rest at +25 m'], correct: 0, explain: 'v = 10 − 2t is zero at 5 s, then negative. x = 10t − t² is zero again at 10 s, so the displacement is 0.' } },
  { id: 'uniform-acc', title: 'Uniform acceleration', profile: one(0, 4, 2, 8), notice: 'The velocity changes by the same amount every second: v–t is a straight line with slope 2 m/s². The area under it is the displacement.',
    predict: { prompt: 'v starts at 4 m/s and rises by 2 m/s each second. What is v after 8 s?', options: ['20 m/s', '16 m/s', '12 m/s'], correct: 0, explain: 'v = u + at = 4 + 2 × 8 = 20 m/s.' } },
];

export const scenarioById = (id: string | null | undefined): Scenario | undefined => SCENARIOS.find((s) => s.id === id);
