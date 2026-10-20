/**
 * Power model (PHY-3D): the average power P = W / t (Eq. 7.11), SI unit the watt (1 W = 1 J/s), with the work found from a
 * chosen situation: a direct amount of work, lifting a load, or speeding up from rest (work = change of kinetic energy).
 * 1 horsepower = 746 W (the textbook's "Threads of Curiosity" note). Pure functions, g = 10 m/s^2.
 */

import { G } from './workModel';

export const HORSEPOWER_W = 746;
export type PowerScenario = 'work' | 'lift' | 'accelerate';

export interface PowerSetup {
  scenario: PowerScenario;
  /** scenario 'work': the work done, J. */
  workJ: number;
  /** scenarios 'lift' and 'accelerate': mass, kg. */
  massKg: number;
  /** scenario 'lift': height raised, m. */
  height: number;
  /** scenario 'accelerate': final speed from rest, m/s. */
  speed: number;
  /** Time taken, s. */
  timeS: number;
}

export const DEFAULT_POWER: PowerSetup = { scenario: 'lift', workJ: 1500, massKg: 60, height: 3, speed: 20, timeS: 4 };
export const POWER_LIMITS = { workMax: 1e7, massMin: 0.1, massMax: 20000, heightMax: 500, speedMax: 100, timeMin: 0.1, timeMax: 3600 } as const;

export interface PowerResult {
  valid: boolean; reason?: string; setup: PowerSetup;
  work: number; power: number; kilowatts: number; horsepower: number;
  /** The same work done in half the time, and in twice the time. */
  powerHalfTime: number; powerDoubleTime: number;
  /** Work done in one second at this power (equals the power in joules). */
  workPerSecond: number;
}

const clean = (n: number): number => (Math.abs(n) < 1e-12 ? 0 : Math.round(n * 1e9) / 1e9);

export const workOf = (s: PowerSetup): number => (s.scenario === 'work' ? s.workJ : s.scenario === 'lift' ? s.massKg * G * s.height : 0.5 * s.massKg * s.speed * s.speed);

export function validatePower(s: PowerSetup): string | null {
  const L = POWER_LIMITS;
  if (![s.workJ, s.massKg, s.height, s.speed, s.timeS].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.timeS < L.timeMin || s.timeS > L.timeMax) return `The time must be between ${L.timeMin} and ${L.timeMax} s (power needs a time greater than zero).`;
  if (s.scenario === 'work' && (s.workJ < 0 || s.workJ > L.workMax)) return `The work must be between 0 and ${L.workMax} J.`;
  if (s.scenario !== 'work' && (s.massKg < L.massMin || s.massKg > L.massMax)) return `The mass must be between ${L.massMin} and ${L.massMax} kg.`;
  if (s.scenario === 'lift' && (s.height < 0 || s.height > L.heightMax)) return `The height must be between 0 and ${L.heightMax} m.`;
  if (s.scenario === 'accelerate' && (s.speed < 0 || s.speed > L.speedMax)) return `The final speed must be between 0 and ${L.speedMax} m/s.`;
  return null;
}

export function computePower(setup: PowerSetup): PowerResult {
  const reason = validatePower(setup);
  const z = { setup, work: 0, power: 0, kilowatts: 0, horsepower: 0, powerHalfTime: 0, powerDoubleTime: 0, workPerSecond: 0 };
  if (reason) return { ...z, valid: false, reason };
  const w = workOf(setup), p = w / setup.timeS;
  return { valid: true, setup, work: clean(w), power: clean(p), kilowatts: clean(p / 1000), horsepower: clean(p / HORSEPOWER_W), powerHalfTime: clean(w / (setup.timeS / 2)), powerDoubleTime: clean(w / (setup.timeS * 2)), workPerSecond: clean(p) };
}

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

export function describePower(r: PowerResult): string {
  if (!r.valid) return `This setup is not valid: ${r.reason}`;
  const { scenario, massKg, height, speed, timeS } = r.setup;
  const what = scenario === 'work' ? `Work of ${f2(r.work)} J` : scenario === 'lift' ? `Lifting ${f2(massKg)} kg through ${f2(height)} m needs the work m g h = ${f2(r.work)} J` : `Speeding ${f2(massKg)} kg from rest to ${f2(speed)} m/s needs the work ${f2(r.work)} J (the kinetic energy gained)`;
  return `${what}, done in ${f2(timeS)} s. The average power is P = W ÷ t = ${f2(r.work)} ÷ ${f2(timeS)} = ${f2(r.power)} W (${f2(r.kilowatts)} kW, ${f2(r.horsepower)} horsepower). The same work in half the time needs ${f2(r.powerHalfTime)} W; in twice the time ${f2(r.powerDoubleTime)} W.`;
}
