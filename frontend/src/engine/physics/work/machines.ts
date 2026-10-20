/**
 * Simple machines models (PHY-3D): the inclined plane, the pulley system and the lever (Section 7.6, Eqs. 7.12 to 7.16).
 * Pure functions, SI units, g = 10 m/s^2 by default. Every machine reports the effort, the load, the mechanical advantage
 * MA = load / effort (Eq. 7.12), the work put in (effort x distance the effort moves) and the useful work done on the load.
 *
 * Ideal machines: input work = useful output work. Non-ideal machines have EXPLICIT physical losses (friction on a ramp,
 * the weight of the movable pulley), never an invented efficiency: output work <= input work always, and the difference is
 * accounted for (thermal energy by friction, or potential energy stored in the lifted pulley block).
 */

import { G } from './workModel';

const clean = (n: number): number => (Math.abs(n) < 1e-12 ? 0 : Math.round(n * 1e12) / 1e12);

// --------------------------------------------------------------------------- inclined plane
export interface RampSetup {
  massKg: number;
  /** Vertical height to be gained, m. */
  height: number;
  /** Length of the ramp along its slope, m (at least the height). */
  length: number;
  /** Coefficient of kinetic friction between the load and the ramp (0 = smooth). */
  mu: number;
  g: number;
}

export const RAMP_LIMITS = { massMin: 1, massMax: 500, heightMin: 0.1, heightMax: 5, lengthMax: 20, muMax: 1 } as const;
export const DEFAULT_RAMP: RampSetup = { massKg: 20, height: 1, length: 4, mu: 0, g: G };

export interface RampResult {
  valid: boolean; reason?: string; setup: RampSetup;
  /** Horizontal width of the ramp, sqrt(L^2 - h^2). */
  width: number; angleDeg: number;
  load: number;
  /** Effort along the ramp on a smooth ramp, m g h / L (Eq. 7.13). */
  idealEffort: number;
  /** Effort along the ramp for a steady push up (adds the friction). */
  effort: number;
  idealMA: number; actualMA: number;
  /** Work done by the effort over the length of the ramp. */
  inputWork: number;
  /** Useful work: the potential energy gained, m g h. */
  outputWork: number;
  /** Energy turned into thermal energy by friction. */
  lost: number;
  /** output / input, a RESULT of the friction model (1 for a smooth ramp). */
  efficiency: number;
  /** Lifting the load straight up instead: effort m g over the height h. */
  directEffort: number; directWork: number;
}

export function validateRamp(s: RampSetup): string | null {
  const L = RAMP_LIMITS;
  if (![s.massKg, s.height, s.length, s.mu, s.g].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.massKg < L.massMin || s.massKg > L.massMax) return `The mass must be between ${L.massMin} and ${L.massMax} kg.`;
  if (s.height < L.heightMin || s.height > L.heightMax) return `The height must be between ${L.heightMin} and ${L.heightMax} m.`;
  if (s.length < s.height) return 'The ramp cannot be shorter than the height it reaches (the slope is the longest side of the right-angled triangle).';
  if (s.length > L.lengthMax) return `The ramp length must be at most ${L.lengthMax} m.`;
  if (s.mu < 0 || s.mu > L.muMax) return `The friction coefficient must be between 0 and ${L.muMax}.`;
  if (s.g < 1 || s.g > 30) return 'g must be between 1 and 30 m/s².';
  return null;
}

export function computeRamp(setup: RampSetup): RampResult {
  const reason = validateRamp(setup);
  const z = { setup, width: 0, angleDeg: 0, load: 0, idealEffort: 0, effort: 0, idealMA: 0, actualMA: 0, inputWork: 0, outputWork: 0, lost: 0, efficiency: 0, directEffort: 0, directWork: 0 };
  if (reason) return { ...z, valid: false, reason };
  const { massKg: m, height: h, length: L, mu, g } = setup;
  const sin = h / L, cos = Math.sqrt(L * L - h * h) / L;
  const load = m * g, ideal = load * sin, effort = ideal + mu * load * cos;
  const input = effort * L, output = load * h;
  return {
    valid: true, setup, width: clean(Math.sqrt(L * L - h * h)), angleDeg: clean((Math.asin(sin) * 180) / Math.PI), load: clean(load), idealEffort: clean(ideal), effort: clean(effort),
    idealMA: clean(L / h), actualMA: clean(load / effort), inputWork: clean(input), outputWork: clean(output), lost: clean(input - output), efficiency: clean(output / input),
    directEffort: clean(load), directWork: clean(output),
  };
}

// --------------------------------------------------------------------------- pulley
export interface PulleySetup {
  massKg: number;
  /** Number of rope strands that support the load (1 = a single fixed pulley, 2 = the textbook movable pulley, ...). */
  strands: number;
  /** Mass of the movable pulley block (kg); it is lifted with the load. Ignored for a single fixed pulley. */
  blockKg: number;
  /** Height the load is raised, m. */
  lift: number;
  g: number;
}

export const PULLEY_LIMITS = { massMin: 1, massMax: 500, strandsMax: 6, blockMax: 20, liftMin: 0.1, liftMax: 5 } as const;
export const DEFAULT_PULLEY: PulleySetup = { massKg: 20, strands: 2, blockKg: 0, lift: 1, g: G };

export interface PulleyResult {
  valid: boolean; reason?: string; setup: PulleySetup;
  load: number;
  /** The weight the effort must also support: the movable block (0 for a fixed pulley). */
  blockWeight: number;
  effort: number;
  /** Length of rope the effort end must be pulled: strands x the rise of the load. */
  ropePulled: number;
  idealMA: number; actualMA: number;
  inputWork: number; outputWork: number;
  /** Potential energy given to the movable block (not useful work). */
  storedInBlock: number;
  efficiency: number;
  changesDirectionOnly: boolean;
}

export function validatePulley(s: PulleySetup): string | null {
  const L = PULLEY_LIMITS;
  if (![s.massKg, s.strands, s.blockKg, s.lift, s.g].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.massKg < L.massMin || s.massKg > L.massMax) return `The load must be between ${L.massMin} and ${L.massMax} kg.`;
  if (!Number.isInteger(s.strands) || s.strands < 1 || s.strands > L.strandsMax) return `The number of supporting strands must be a whole number from 1 to ${L.strandsMax}.`;
  if (s.blockKg < 0 || s.blockKg > L.blockMax) return `The movable block must have a mass between 0 and ${L.blockMax} kg.`;
  if (s.lift < L.liftMin || s.lift > L.liftMax) return `The lift must be between ${L.liftMin} and ${L.liftMax} m.`;
  if (s.g < 1 || s.g > 30) return 'g must be between 1 and 30 m/s².';
  return null;
}

export function computePulley(setup: PulleySetup): PulleyResult {
  const reason = validatePulley(setup);
  const z = { setup, load: 0, blockWeight: 0, effort: 0, ropePulled: 0, idealMA: 0, actualMA: 0, inputWork: 0, outputWork: 0, storedInBlock: 0, efficiency: 0, changesDirectionOnly: false };
  if (reason) return { ...z, valid: false, reason };
  const { massKg: m, strands: n, blockKg, lift, g } = setup;
  const load = m * g, bw = n > 1 ? blockKg * g : 0;
  const effort = (load + bw) / n;
  const rope = n * lift;
  return {
    valid: true, setup, load: clean(load), blockWeight: clean(bw), effort: clean(effort), ropePulled: clean(rope), idealMA: n, actualMA: clean(load / effort),
    inputWork: clean(effort * rope), outputWork: clean(load * lift), storedInBlock: clean(bw * lift), efficiency: clean((load * lift) / (effort * rope)), changesDirectionOnly: n === 1,
  };
}

/** Rope pulled and load raised at a fraction p (0 to 1) of the lift: always rope = strands x rise (the constraint). */
export const pulleyAt = (r: PulleyResult, p: number) => { const q = Math.max(0, Math.min(1, p)); const rise = r.setup.lift * q; return { rise: clean(rise), rope: clean(r.setup.strands * rise), inWork: clean(r.effort * r.setup.strands * rise), outWork: clean(r.load * rise) }; };

// --------------------------------------------------------------------------- lever
export type LeverClass = 'I' | 'II' | 'III';

export interface LeverSetup {
  /** Mass of the load, kg (its weight is the load force). */
  loadKg: number;
  /** Distance of the load from the fulcrum, m. */
  loadArm: number;
  /** Distance of the effort from the fulcrum, m. */
  effortArm: number;
  /** I: fulcrum between effort and load. II: load between fulcrum and effort. III: effort between fulcrum and load. */
  kind: LeverClass;
  /** The effort force the student applies (in the direction that raises the load), N. */
  effort: number;
  /** Small turn of the bar, degrees, used for the distance moved by each end. */
  turnDeg: number;
  g: number;
}

export const LEVER_LIMITS = { loadMin: 0.1, loadMax: 200, armMin: 0.1, armMax: 4, effortMax: 5000, turnMax: 10 } as const;
export const DEFAULT_LEVER: LeverSetup = { loadKg: 10, loadArm: 0.5, effortArm: 2, kind: 'I', effort: 25, turnDeg: 5, g: G };

export interface LeverResult {
  valid: boolean; reason?: string; setup: LeverSetup;
  load: number;
  /** The effort that just balances the load (and, for a slow lift, the effort needed): load x load arm / effort arm (Eq. 7.15). */
  balanceEffort: number;
  mechanicalAdvantage: number;
  /** Torque of the applied effort and of the load about the fulcrum (N m); positive raises the load side. */
  effortTorque: number; loadTorque: number; netTorque: number;
  state: 'balanced' | 'load rises' | 'load falls';
  /** Distances moved by the effort and the load for the small turn. */
  effortDistance: number; loadDistance: number;
  /** Work by the balancing effort over its distance, and work on the load over its distance: equal for an ideal lever. */
  effortWork: number; loadWork: number;
  geometryOk: boolean;
}

export function validateLever(s: LeverSetup): string | null {
  const L = LEVER_LIMITS;
  if (![s.loadKg, s.loadArm, s.effortArm, s.effort, s.turnDeg, s.g].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.loadKg < L.loadMin || s.loadKg > L.loadMax) return `The load must be between ${L.loadMin} and ${L.loadMax} kg.`;
  if (s.loadArm < L.armMin || s.loadArm > L.armMax || s.effortArm < L.armMin || s.effortArm > L.armMax) return `Each arm must be between ${L.armMin} and ${L.armMax} m.`;
  if (s.effort < 0 || s.effort > L.effortMax) return `The effort must be between 0 and ${L.effortMax} N.`;
  if (s.turnDeg < 0 || s.turnDeg > L.turnMax) return `The turn must be between 0 and ${L.turnMax} degrees (the small-angle model).`;
  if (s.kind === 'II' && s.effortArm <= s.loadArm) return 'In a Class II lever the load is between the fulcrum and the effort, so the effort arm must be longer than the load arm.';
  if (s.kind === 'III' && s.effortArm >= s.loadArm) return 'In a Class III lever the effort is between the fulcrum and the load, so the effort arm must be shorter than the load arm.';
  return null;
}

export function computeLever(setup: LeverSetup): LeverResult {
  const reason = validateLever(setup);
  const z = { setup, load: 0, balanceEffort: 0, mechanicalAdvantage: 0, effortTorque: 0, loadTorque: 0, netTorque: 0, state: 'balanced' as const, effortDistance: 0, loadDistance: 0, effortWork: 0, loadWork: 0, geometryOk: false };
  if (reason) return { ...z, valid: false, reason };
  const { loadKg, loadArm: l2, effortArm: l1, effort, turnDeg, g } = setup;
  const load = loadKg * g;
  const balance = (load * l2) / l1;
  const tE = effort * l1, tL = load * l2, net = tE - tL;
  const phi = (turnDeg * Math.PI) / 180;
  const d1 = l1 * phi, d2 = l2 * phi;
  return {
    valid: true, setup, load: clean(load), balanceEffort: clean(balance), mechanicalAdvantage: clean(load / balance), effortTorque: clean(tE), loadTorque: clean(tL), netTorque: clean(net),
    state: Math.abs(net) < 1e-9 ? 'balanced' : net > 0 ? 'load rises' : 'load falls', effortDistance: clean(d1), loadDistance: clean(d2), effortWork: clean(balance * d1), loadWork: clean(load * d2), geometryOk: true,
  };
}

/** The class of a lever from the signed positions of the effort and load (fulcrum at 0): used to check the three classes. */
export function leverClassOf(effortPos: number, loadPos: number): LeverClass {
  if (effortPos * loadPos < 0) return 'I';
  return Math.abs(loadPos) < Math.abs(effortPos) ? 'II' : 'III';
}
