/**
 * Work-energy theorem laboratory model (PHY-3B): one object on a straight line under a CONSTANT net force.
 *
 * Exact closed-form kinematics (no numerical integration, so no drift; time is simulated time, never the frame count):
 *   a = F / m,  x(t) = u t + 1/2 a t^2,  v(t) = u + a t.
 * The student chooses a signed net displacement s. The run ends the first time the object reaches x = s. If the object can
 * never get there (the net force turns it back first, or it moves away from the target) the setup is refused with the reason.
 *
 * Quantities (all SI, signed along the line, right positive):
 *   W_net = F s              work of the net force over the NET displacement (signed)
 *   K = 1/2 m v^2            kinetic energy, never negative (it depends on v^2)
 *   W_net = K_final - K_initial   (the work-energy theorem; the model reports both sides computed independently)
 * A direction reversal (the object stops and comes back) is reported: the work uses the net displacement, the distance
 * travelled is longer.
 */

export const KIN_LIMITS = { massMin: 0.1, massMax: 10000, forceMax: 100000, speedMax: 100, dispMax: 1000 } as const;

export interface KineticSetup {
  massKg: number;
  /** Signed net force, N. */
  netForce: number;
  /** Signed initial velocity, m/s. */
  u: number;
  /** Signed net displacement, m. */
  displacement: number;
}

export const DEFAULT_KINETIC: KineticSetup = { massKg: 2, netForce: 6, u: 0, displacement: 4 };

export interface KineticResult {
  valid: boolean;
  reason?: string;
  setup: KineticSetup;
  a: number;
  /** Time at which the object reaches the displacement, s. */
  tEnd: number;
  /** Final velocity (signed). */
  v: number;
  K0: number;
  K1: number;
  /** Work of the net force, F s. */
  wNet: number;
  /** K1 - K0, computed from the velocities (independent of wNet). */
  dK: number;
  /** The object stops and comes back before reaching the target. */
  reversal: boolean;
  /** Time of the turning point (when reversal is true). */
  tTurn: number | null;
  /** Total length of the path (longer than |s| after a reversal). */
  distance: number;
}

const clean = (n: number): number => (Math.abs(n) < 1e-9 ? 0 : Math.round(n * 1e12) / 1e12);
export const kinetic = (m: number, v: number): number => 0.5 * m * v * v;

export function validateKinetic(s: KineticSetup): string | null {
  if (![s.massKg, s.netForce, s.u, s.displacement].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.massKg < KIN_LIMITS.massMin || s.massKg > KIN_LIMITS.massMax) return `The mass must be between ${KIN_LIMITS.massMin} and ${KIN_LIMITS.massMax} kg.`;
  if (Math.abs(s.netForce) > KIN_LIMITS.forceMax) return `The net force must be between −${KIN_LIMITS.forceMax} and ${KIN_LIMITS.forceMax} N.`;
  if (Math.abs(s.u) > KIN_LIMITS.speedMax) return `The initial velocity must be between −${KIN_LIMITS.speedMax} and ${KIN_LIMITS.speedMax} m/s.`;
  if (Math.abs(s.displacement) > KIN_LIMITS.dispMax) return `The displacement must be between −${KIN_LIMITS.dispMax} and ${KIN_LIMITS.dispMax} m.`;
  return null;
}

/** The first time t > 0 at which x(t) = s, or null when the object never gets there. */
function timeToReach(a: number, u: number, s: number): { t: number | null; why?: string } {
  if (s === 0) return { t: 0 };
  if (a === 0) {
    if (u === 0) return { t: null, why: 'The object is at rest and the net force is zero, so it never moves.' };
    const t = s / u;
    return t > 0 ? { t } : { t: null, why: 'With zero net force the object keeps moving at its starting velocity, away from the target. Change the sign of the displacement.' };
  }
  let disc = u * u + 2 * a * s;
  if (disc < 0 && disc > -1e-9) disc = 0; // the object just reaches the target and stops
  if (disc < 0) {
    const stop = -(u * u) / (2 * a);
    return { t: null, why: `The net force stops the object after ${Math.abs(clean(stop))} m (at ${clean(stop)} m) and turns it back before it reaches ${clean(s)} m. Choose a displacement between 0 and ${clean(stop)} m, or a force that pushes towards the target.` };
  }
  const r = Math.sqrt(disc);
  const roots = [(-u + r) / a, (-u - r) / a].filter((t) => t > 1e-12).sort((x, y) => x - y);
  return roots.length ? { t: roots[0] } : { t: null, why: 'The object never reaches that displacement under this net force.' };
}

export function computeKinetic(setup: KineticSetup): KineticResult {
  const base = { setup, a: 0, tEnd: 0, v: 0, K0: 0, K1: 0, wNet: 0, dK: 0, reversal: false, tTurn: null as number | null, distance: 0 };
  const reason = validateKinetic(setup);
  if (reason) return { ...base, valid: false, reason };
  const { massKg: m, netForce: F, u, displacement: s } = setup;
  const a = F / m;
  const hit = timeToReach(a, u, s);
  if (hit.t === null) return { ...base, a, valid: false, reason: hit.why };
  const t = hit.t;
  const v = u + a * t;
  const tTurn = a !== 0 && u !== 0 && Math.sign(u) !== Math.sign(a) ? -u / a : null;
  const reversal = tTurn !== null && tTurn < t - 1e-12;
  const xTurn = tTurn === null ? 0 : u * tTurn + 0.5 * a * tTurn * tTurn;
  const distance = reversal ? Math.abs(xTurn) + Math.abs(xTurn - s) : Math.abs(s);
  const K0 = kinetic(m, u), K1 = kinetic(m, v);
  return { valid: true, setup, a: clean(a), tEnd: t, v: clean(v), K0: clean(K0), K1: clean(K1), wNet: clean(F * s), dK: clean(K1 - K0), reversal, tTurn: reversal ? tTurn : null, distance: clean(distance) };
}

export interface KineticSample { t: number; x: number; v: number; K: number; workSoFar: number }

/** State at simulated time t (clamped to the run). workSoFar = F x(t): the work of the net force up to now. */
export function kineticAt(r: KineticResult, t: number): KineticSample {
  const { massKg: m, netForce: F, u } = r.setup;
  const tt = Math.max(0, Math.min(r.tEnd, t));
  const x = u * tt + 0.5 * r.a * tt * tt, v = u + r.a * tt;
  return { t: tt, x: clean(x), v: clean(v), K: clean(kinetic(m, v)), workSoFar: clean(F * x) };
}

export const kineticSeries = (r: KineticResult, n = 80): KineticSample[] => Array.from({ length: n + 1 }, (_, i) => kineticAt(r, (r.tEnd * i) / n));

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');
const sg = (n: number): string => (n > 0 ? `+${f2(n)}` : f2(n));

/** Complete text alternative, derived from the same result that is drawn. */
export function describeKinetic(r: KineticResult): string {
  if (!r.valid) return `This setup is not valid: ${r.reason}`;
  const { massKg: m, netForce: F, u, displacement: s } = r.setup;
  const trend = r.dK > 1e-9 ? 'The net work is positive, so the kinetic energy increases.' : r.dK < -1e-9 ? 'The net work is negative, so the kinetic energy decreases.' : 'The net work is zero, so the kinetic energy does not change.';
  return `A ${f2(m)} kg object moves on a straight line with a constant net force of ${sg(F)} N (acceleration ${sg(r.a)} m/s²) and starts at ${sg(u)} m/s. It reaches a displacement of ${sg(s)} m after ${f2(r.tEnd)} s with velocity ${sg(r.v)} m/s${r.reversal ? `, after stopping at ${f2(r.tTurn!)} s and turning back (the path is ${f2(r.distance)} m long, the displacement ${f2(Math.abs(s))} m)` : ''}. Net work = F × s = ${sg(F)} × ${sg(s)} = ${sg(r.wNet)} J. Kinetic energy: ${f2(r.K0)} J at the start, ${f2(r.K1)} J at the end, a change of ${sg(r.dK)} J. ${trend}`;
}
