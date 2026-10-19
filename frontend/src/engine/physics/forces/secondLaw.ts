/**
 * Newton's second law, momentum and impulse (PHY-2C). Everything here is a pure function of the Force Laboratory model
 * (forceModel.ts): the graphs, the derivation numbers and the exercises all read the same `Sample` history, so a graph can
 * never disagree with the cart. SI units: kg, m/s, m/s², N, kg·m/s.
 *
 *   F = ma                      (Eq. 6.2, net force; a points the way the net force points)
 *   p = mv                      momentum, same direction as the velocity
 *   Δp = m(v − u) = mΔv         (constant mass)
 *   F = Δp/Δt = m(v − u)/t = ma
 *   impulse = F·Δt = area under the force–time graph = Δp (for a constant force; the sum of F·dt in general)
 * Mass is not weight: weight = m g (Eq. 6.3) is a force in newtons, mass is in kilograms.
 */

import { DT, G, simulate, type Sample, type Setup } from './forceModel';

export const momentum = (massKg: number, v: number): number => massKg * v;
export const momentumChange = (massKg: number, u: number, v: number): number => massKg * (v - u);
export const netForceOf = (massKg: number, a: number): number => massKg * a;
export const accelerationOf = (netN: number, massKg: number): number => netN / massKg;
export const massOf = (netN: number, a: number): number => netN / a;
/** Weight of a mass (N): Eq. 6.3 with the laboratory's g. */
export const weightOf = (massKg: number, g = G): number => massKg * g;
/** Average force on an object whose momentum changes by dp in time dt. */
export const forceFromMomentum = (dp: number, dt: number): number => dp / dt;

/** 1 kg × 1 m/s² = 1 kg·m/s² = 1 N: the newton as it is defined from F = ma. */
export const NEWTON_DEFINITION = { massKg: 1, a: 1, force: 1 } as const;

export interface Moment { t: number; p: number; v: number; net: number; a: number; massKg: number }

/** Momentum, velocity and net force over time, straight from the cart model. */
export function momentumHistory(s: Setup, tMax: number): Moment[] {
  return simulate(s, tMax).map((x: Sample) => ({ t: x.t, p: s.massKg * x.v, v: x.v, net: x.net, a: x.a, massKg: s.massKg }));
}

/** Impulse (N·s) between two times: the sum of net force × step over the fixed steps. */
export function impulseBetween(s: Setup, t0: number, t1: number, tMax: number): number {
  const h = simulate(s, tMax);
  const i0 = Math.round(t0 / DT), i1 = Math.round(t1 / DT);
  let sum = 0;
  for (let i = i0; i < i1 && i < h.length; i++) sum += h[i].net * DT;
  return sum;
}

/** Change of momentum between two times (kg·m/s). */
export function momentumChangeBetween(s: Setup, t0: number, t1: number, tMax: number): number {
  const h = simulate(s, tMax);
  const a = h[Math.min(h.length - 1, Math.round(t0 / DT))], b = h[Math.min(h.length - 1, Math.round(t1 / DT))];
  return s.massKg * (b.v - a.v);
}

/** Points of the linear relationship a = F/m for a fixed mass (force on the horizontal axis). */
export function forceAccelerationLine(massKg: number, fMin: number, fMax: number, n = 20): { f: number; a: number }[] {
  return Array.from({ length: n + 1 }, (_, i) => { const f = fMin + ((fMax - fMin) * i) / n; return { f, a: f / massKg }; });
}

/** Points of the inverse relationship a = F/m for a fixed net force (mass on the horizontal axis). */
export function accelerationMassCurve(netN: number, mMin: number, mMax: number, n = 60): { m: number; a: number }[] {
  return Array.from({ length: n + 1 }, (_, i) => { const m = mMin + ((mMax - mMin) * i) / n; return { m, a: netN / m }; });
}

/** Doubling the net force doubles a (linear); doubling the mass halves a (inverse). */
export const doublingForce = (netN: number, massKg: number): { before: number; after: number } => ({ before: netN / massKg, after: (2 * netN) / massKg });
export const doublingMass = (netN: number, massKg: number): { before: number; after: number } => ({ before: netN / massKg, after: netN / (2 * massKg) });

/** The textbook's timing analysis (Activities 6.3 and 6.4): from rest over the same distance, a₁/a₂ = T₂²/T₁². */
export const accelerationRatioFromTimes = (t1: number, t2: number): number => (t2 * t2) / (t1 * t1);
/** s = ½ a T² from rest: the distance, used to check the two cart runs. */
export const distanceFromRest = (a: number, t: number): number => 0.5 * a * t * t;

/** Acceleration of two objects of masses m1 and m2 stuck together under force F, in terms of their separate accelerations (Q15). */
export const combinedAcceleration = (a1: number, a2: number): number => (a1 * a2) / (a1 + a2);
