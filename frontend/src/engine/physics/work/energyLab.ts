/**
 * Energy Laboratory model (PHY-3C): an object released on a ramp of angle theta (90 degrees is a vertical drop, a free fall).
 *
 * Exact closed-form motion along the slope, so there is no numerical drift and energy bookkeeping closes to rounding error:
 *   a = g (sin theta - mu cos theta)   (mu cos theta = 0 for a vertical drop),  s(t) = u t + a t^2 / 2,  v(t) = u + a t
 *   h = h0 - s sin theta                      height above the bottom (the ground)
 *   K = 1/2 m v^2,   U = m g (h - h_ref)      the potential energy is measured from a CHOSEN reference height h_ref
 *   Q = mu m g cos theta * s                  energy dissipated by sliding friction: thermal (internal) energy, never "lost"
 * Conservation: K + U + Q = K0 + U0 at every instant. Without friction Q = 0 and the mechanical energy K + U is constant.
 * Valid range: release from the top, moving DOWN the slope (initial speed along the slope >= 0). If the friction is too large for
 * the object to start moving (or it stops on the way) it stays at rest there, held by static friction. Collisions with the ground are
 * not modelled: the run ends when the object reaches the bottom.
 */

export const ENERGY_LIMITS = { massMin: 0.1, massMax: 1000, heightMin: 0.1, heightMax: 100, angleMin: 5, angleMax: 90, muMax: 1, gMin: 1, gMax: 30, uMax: 30, refMin: -20, refMax: 100 } as const;

export interface EnergySetup {
  massKg: number;
  /** Height of the release point above the bottom of the ramp (the ground), m. */
  startHeight: number;
  /** Ramp angle from the horizontal, degrees (90 = vertical drop). */
  angleDeg: number;
  /** Coefficient of kinetic friction (0 = frictionless). Ignored for a vertical drop. */
  mu: number;
  /** Gravitational field strength, m/s^2. */
  g: number;
  /** Initial speed along the slope, downwards, m/s. */
  u0: number;
  /** Height at which the potential energy is defined to be zero, m (the reference level). */
  refHeight: number;
}

export const DEFAULT_ENERGY: EnergySetup = { massKg: 2, startHeight: 5, angleDeg: 90, mu: 0, g: 10, u0: 0, refHeight: 0 };

export interface EnergyResult {
  valid: boolean;
  reason?: string;
  setup: EnergySetup;
  /** Length of the slope from the release point to the bottom, m. */
  slopeLength: number;
  /** Acceleration along the slope (positive: speeding up down the slope), m/s^2. */
  a: number;
  /** The object moves at all. */
  slides: boolean;
  /** The object reaches the bottom. */
  reachesBottom: boolean;
  /** Time at which the run ends (the bottom, or the stop), s. */
  tEnd: number;
  /** Distance moved along the slope when the run ends, m. */
  sEnd: number;
  K0: number; U0: number; E0: number;
}

export interface EnergyState {
  t: number;
  /** Distance moved along the slope, m. */
  s: number;
  /** Speed along the slope (never negative here), m/s. */
  v: number;
  /** Height above the bottom, m. */
  h: number;
  K: number;
  U: number;
  /** Energy dissipated by friction so far (thermal energy), J. */
  Q: number;
  /** K + U. */
  mechanical: number;
  /** K + U + Q: constant. */
  total: number;
}

const clean = (n: number): number => (Math.abs(n) < 1e-12 ? 0 : Math.round(n * 1e12) / 1e12);
const rad = (d: number): number => (d * Math.PI) / 180;
export const sinT = (deg: number): number => (deg === 90 ? 1 : Math.sin(rad(deg)));
export const cosT = (deg: number): number => (deg === 90 ? 0 : Math.cos(rad(deg)));

export function validateEnergy(s: EnergySetup): string | null {
  const L = ENERGY_LIMITS;
  if (![s.massKg, s.startHeight, s.angleDeg, s.mu, s.g, s.u0, s.refHeight].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.massKg < L.massMin || s.massKg > L.massMax) return `The mass must be between ${L.massMin} and ${L.massMax} kg.`;
  if (s.startHeight < L.heightMin || s.startHeight > L.heightMax) return `The starting height must be between ${L.heightMin} and ${L.heightMax} m.`;
  if (s.angleDeg < L.angleMin || s.angleDeg > L.angleMax) return `The ramp angle must be between ${L.angleMin} and ${L.angleMax} degrees (90 is a vertical drop).`;
  if (s.mu < 0 || s.mu > L.muMax) return `The friction coefficient must be between 0 and ${L.muMax}.`;
  if (s.g < L.gMin || s.g > L.gMax) return `g must be between ${L.gMin} and ${L.gMax} m/s².`;
  if (s.u0 < 0 || s.u0 > L.uMax) return `The initial speed (down the slope) must be between 0 and ${L.uMax} m/s.`;
  if (s.refHeight < L.refMin || s.refHeight > L.refMax) return `The reference height must be between ${L.refMin} and ${L.refMax} m.`;
  return null;
}

export function computeEnergy(setup: EnergySetup): EnergyResult {
  const base = { setup, slopeLength: 0, a: 0, slides: false, reachesBottom: false, tEnd: 0, sEnd: 0, K0: 0, U0: 0, E0: 0 };
  const reason = validateEnergy(setup);
  if (reason) return { ...base, valid: false, reason };
  const { massKg: m, startHeight: h0, angleDeg: th, mu, g, u0, refHeight } = setup;
  const sin = sinT(th), cos = cosT(th);
  const d = h0 / sin;
  const a = g * (sin - mu * cos);
  const K0 = 0.5 * m * u0 * u0, U0 = m * g * (h0 - refHeight);
  let tEnd = 0, sEnd = 0, reaches = false;
  if (u0 === 0 && a <= 1e-12) { /* friction holds it at rest */ }
  else if (a >= 0) { // speeds up (or constant speed): reaches the bottom
    reaches = true; sEnd = d;
    tEnd = a === 0 ? d / u0 : (-u0 + Math.sqrt(u0 * u0 + 2 * a * d)) / a;
  } else { // decelerates: stops after u0^2 / (2 |a|), or reaches the bottom first
    const stop = (u0 * u0) / (2 * -a);
    if (stop >= d) { reaches = true; sEnd = d; tEnd = (-u0 + Math.sqrt(Math.max(0, u0 * u0 + 2 * a * d))) / a; }
    else { sEnd = stop; tEnd = u0 / -a; }
  }
  return { valid: true, setup, slopeLength: clean(d), a: clean(a), slides: tEnd > 0, reachesBottom: reaches, tEnd: clean(tEnd), sEnd: clean(sEnd), K0: clean(K0), U0: clean(U0), E0: clean(K0 + U0) };
}

/** State after moving a distance s along the slope (clamped to the run). */
export function energyAtDistance(r: EnergyResult, s: number): EnergyState {
  const { massKg: m, startHeight: h0, angleDeg: th, mu, g, u0, refHeight } = r.setup;
  const ss = Math.max(0, Math.min(r.sEnd, s));
  const v2 = u0 * u0 + 2 * r.a * ss;
  const v = Math.sqrt(Math.max(0, v2));
  const h = h0 - ss * sinT(th);
  const K = 0.5 * m * v * v, U = m * g * (h - refHeight), Q = mu * m * g * cosT(th) * ss;
  const t = timeAtDistance(r, ss);
  return { t: clean(t), s: clean(ss), v: clean(v), h: clean(h), K: clean(K), U: clean(U), Q: clean(Q), mechanical: clean(K + U), total: clean(K + U + Q) };
}

function timeAtDistance(r: EnergyResult, s: number): number {
  const { u0 } = r.setup, a = r.a;
  if (s <= 0) return 0;
  if (Math.abs(a) < 1e-12) return u0 > 0 ? s / u0 : 0;
  const disc = Math.max(0, u0 * u0 + 2 * a * s);
  return (-u0 + Math.sqrt(disc)) / a;
}

/** State at simulated time t (clamped to the run). */
export function energyAtTime(r: EnergyResult, t: number): EnergyState {
  const tt = Math.max(0, Math.min(r.tEnd, t));
  const s = r.setup.u0 * tt + 0.5 * r.a * tt * tt;
  return { ...energyAtDistance(r, s), t: clean(tt) };
}

export const energySeries = (r: EnergyResult, n = 80): EnergyState[] => Array.from({ length: n + 1 }, (_, i) => energyAtTime(r, (r.tEnd * i) / n));

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

/** Complete text alternative, derived from the same result that is drawn. */
export function describeEnergy(r: EnergyResult): string {
  if (!r.valid) return `This setup is not valid: ${r.reason}`;
  const { massKg: m, startHeight: h0, angleDeg: th, mu, g, refHeight } = r.setup;
  const shape = th === 90 ? `falls vertically from ${f2(h0)} m` : `slides down a ${f2(th)}° ramp from a height of ${f2(h0)} m`;
  const end = energyAtDistance(r, r.sEnd);
  const fr = mu > 0 && th < 90 ? `with friction (coefficient ${f2(mu)})` : 'with no friction';
  const moves = !r.slides ? ' It does not move: friction holds it at rest, so all its energy stays potential.' : r.reachesBottom ? ` It reaches the bottom after ${f2(r.tEnd)} s at ${f2(end.v)} m/s.` : ` It stops after ${f2(r.tEnd)} s and ${f2(r.sEnd)} m along the slope.`;
  return `A ${f2(m)} kg object ${shape}, ${fr}, with g = ${f2(g)} m/s². Potential energy is measured from a reference height of ${f2(refHeight)} m.${moves} At the start K = ${f2(r.K0)} J and U = ${f2(r.U0)} J. At the end K = ${f2(end.K)} J, U = ${f2(end.U)} J, thermal energy from friction Q = ${f2(end.Q)} J. K + U + Q = ${f2(end.total)} J at every instant.${mu > 0 && th < 90 && r.slides ? ' The mechanical energy K + U decreases by exactly the thermal energy Q: no energy is destroyed.' : r.slides ? ' With no friction the mechanical energy K + U stays constant.' : ''}`;
}
