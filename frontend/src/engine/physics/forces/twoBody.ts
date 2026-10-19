/**
 * The two-body interaction model (PHY-2D): two carts A (left) and B (right) on a horizontal frictionless track, SI units,
 * right positive, exact closed-form motion sampled on the same fixed 0.01 s step as the single-cart Force Laboratory.
 * Two modes, each with a clearly defined interaction and NO contact, impact, rebound or deformation modelling:
 *   push: the carts exert an equal and opposite force on each other for a finite time (a spring or a push between them),
 *         then it stops and they coast. The system is isolated, so the total momentum is conserved. B is never behind A
 *         (u_B ≥ u_A is required), so the carts never need to pass through each other.
 *   tow:  a string joins A and B (Section 6.7, Fig. 6.34); an external force F pulls A for a finite time; the string is taut,
 *         so both carts have the same acceleration a = F ÷ (m_A + m_B), and the tension T = m_B a is the internal pair.
 * In every sample the force on A by B and the force on B by A are exactly equal in size and opposite in direction (Newton's
 * third law), act on DIFFERENT bodies, and are never added together to find the net force on one body.
 */

import { DT } from './forceModel';

export type TwoBodyMode = 'push' | 'tow';

export interface TwoBodySetup {
  mode: TwoBodyMode;
  massA: number;
  massB: number;
  /** Push mode: size of the internal interaction force (N). Tow mode: size of the external force on A (N). */
  force: number;
  uA: number;
  uB: number;
  /** How long the force acts (s); 0 means no interaction at all. */
  durationS: number;
}

export const TB_LIMITS = { minMass: 0.01, maxMass: 1000, maxForce: 1000, maxDuration: 10, maxSpeed: 20 } as const;
export const START_A = -0.5;
export const START_B = 0.5;

export function validateTwoBody(s: TwoBodySetup): string | null {
  const nums = [s.massA, s.massB, s.force, s.uA, s.uB, s.durationS];
  if (nums.some((n) => !Number.isFinite(n))) return 'Every value must be a number.';
  if (s.massA < TB_LIMITS.minMass || s.massB < TB_LIMITS.minMass || s.massA > TB_LIMITS.maxMass || s.massB > TB_LIMITS.maxMass) return `Each mass must be between ${TB_LIMITS.minMass} and ${TB_LIMITS.maxMass} kg.`;
  if (s.force < 0 || s.force > TB_LIMITS.maxForce) return `The force must be between 0 and ${TB_LIMITS.maxForce} N (its size is never negative; its direction is fixed by the arrangement).`;
  if (s.durationS < 0 || s.durationS > TB_LIMITS.maxDuration) return `The interaction can last between 0 and ${TB_LIMITS.maxDuration} s.`;
  if (Math.abs(s.uA) > TB_LIMITS.maxSpeed || Math.abs(s.uB) > TB_LIMITS.maxSpeed) return `Starting velocities must be between −${TB_LIMITS.maxSpeed} and ${TB_LIMITS.maxSpeed} m/s.`;
  if (s.mode === 'push' && s.uB < s.uA) return 'In this model B must not be moving towards A before the push: choose u(B) at least u(A). Collisions are not modelled.';
  if (s.mode === 'tow' && s.uA !== s.uB) return 'With the string taut both carts start with the same velocity.';
  return null;
}

export interface TwoBodySample {
  t: number;
  xA: number; vA: number; aA: number;
  xB: number; vB: number; aB: number;
  /** Force on A exerted BY B, and force on B exerted BY A (signed, right positive). Always equal and opposite. */
  fOnAByB: number;
  fOnBByA: number;
  /** External force on A (tow mode only). */
  external: number;
  netA: number; netB: number;
  pA: number; pB: number; pTotal: number;
  /** Velocity of the centre of mass (total momentum ÷ total mass). */
  vCm: number;
  active: boolean;
}

/** Accelerations and forces while the interaction acts. */
function forces(s: TwoBodySetup): { fOnAByB: number; fOnBByA: number; external: number; aA: number; aB: number } {
  if (s.mode === 'push') {
    // push apart: B is pushed to the right by A, A is pushed to the left by B
    const f = s.force;
    return { fOnAByB: -f, fOnBByA: f, external: 0, aA: -f / s.massA, aB: f / s.massB };
  }
  const a = s.force / (s.massA + s.massB);
  const T = s.massB * a;
  return { fOnAByB: -T, fOnBByA: T, external: s.force, aA: a, aB: a };
}

/** Exact state at time t. */
export function twoBodyAt(s: TwoBodySetup, tIn: number): TwoBodySample {
  const t = Math.max(0, tIn);
  const f = forces(s);
  const dur = s.durationS;
  const t1 = Math.min(t, dur); // time under the interaction
  const t2 = Math.max(0, t - dur); // coasting time
  const vA1 = s.uA + f.aA * t1, vB1 = s.uB + f.aB * t1;
  const xA = START_A + s.uA * t1 + 0.5 * f.aA * t1 * t1 + vA1 * t2;
  const xB = START_B + s.uB * t1 + 0.5 * f.aB * t1 * t1 + vB1 * t2;
  const active = t < dur - 1e-9;
  const vA = vA1, vB = vB1;
  const fA = active ? f.fOnAByB : 0, fB = active ? f.fOnBByA : 0, ext = active ? f.external : 0;
  const netA = fA + ext, netB = fB;
  return {
    t, xA, vA, aA: netA / s.massA, xB, vB, aB: netB / s.massB,
    fOnAByB: fA, fOnBByA: fB, external: ext, netA, netB,
    pA: s.massA * vA, pB: s.massB * vB, pTotal: s.massA * vA + s.massB * vB, vCm: (s.massA * vA + s.massB * vB) / (s.massA + s.massB),
    active,
  };
}

/** Fixed-step history (0.01 s), deterministic. */
export function twoBodyHistory(s: TwoBodySetup, tMax: number): TwoBodySample[] {
  const n = Math.round(tMax / DT);
  return Array.from({ length: n + 1 }, (_, i) => twoBodyAt(s, Math.round(i * DT * 1000) / 1000));
}

export const DEFAULT_TWO_BODY: TwoBodySetup = { mode: 'push', massA: 2, massB: 4, force: 6, uA: 0, uB: 0, durationS: 2 };

export const tbFmt = (n: number): string => { const r = Math.round(n * 1000) / 1000; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };

/** One sentence per moment, naming source and recipient of the pair and why the accelerations differ. */
export function explainTwoBody(s: TwoBodySetup, p: TwoBodySample): string {
  if (!p.active && s.durationS > 0) return `The interaction has ended (it lasted ${tbFmt(s.durationS)} s). The net force on each cart is zero, so each keeps its velocity (A ${tbFmt(p.vA)} m/s, B ${tbFmt(p.vB)} m/s). The total momentum is ${tbFmt(p.pTotal)} kg m/s, unchanged from the start.`;
  if (s.durationS === 0 || s.force === 0) return 'There is no interaction force, so neither cart is accelerated and both keep their starting velocities.';
  const pair = `B pushes A with ${tbFmt(Math.abs(p.fOnAByB))} N ${p.fOnAByB < 0 ? 'to the left' : 'to the right'} and A pushes B with ${tbFmt(Math.abs(p.fOnBByA))} N ${p.fOnBByA < 0 ? 'to the left' : 'to the right'}: equal in size, opposite in direction, acting on different carts.`;
  const acc = Math.abs(p.aA - p.aB) < 1e-12 ? `Both carts have the same acceleration ${tbFmt(p.aA)} m/s² (they are joined by the string).` : `The accelerations differ: A has ${tbFmt(p.netA)} N ÷ ${tbFmt(s.massA)} kg = ${tbFmt(p.aA)} m/s² and B has ${tbFmt(p.netB)} N ÷ ${tbFmt(s.massB)} kg = ${tbFmt(p.aB)} m/s², because the masses differ.`;
  return `${pair} ${acc}`;
}
