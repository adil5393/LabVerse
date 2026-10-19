/**
 * Equations of motion for ONE constant acceleration in a straight line (PHY-1D), Section 4.3:
 *   v = u + a t        s = u t + ½ a t²        v² = u² + 2 a s
 * Here u is the initial velocity, v the final velocity, a the (constant) acceleration, t the elapsed time and
 * s the DISPLACEMENT (final position − initial position). They hold only while the acceleration is constant
 * and the motion stays on one straight line; `equationsApply` refuses anything else.
 * Every value is cross-checked against the exact profile engine in profile.ts.
 */

import { stateAt, totalTime, type Profile } from './profile';

export interface EquationValues {
  u: number; a: number; t: number;
  /** v = u + a t */
  v: number;
  /** s = u t + ½ a t² (signed displacement) */
  s: number;
  /** Both sides of v² = u² + 2 a s, which must agree. */
  v2Left: number; v2Right: number;
}

export function equationValues(u: number, a: number, t: number): EquationValues {
  const v = u + a * t;
  const s = u * t + 0.5 * a * t * t;
  return { u, a, t, v, s, v2Left: v * v, v2Right: u * u + 2 * a * s };
}

/** The equations need one constant acceleration over the whole interval. */
export function equationsApply(p: Profile): { ok: true } | { ok: false; reason: string } {
  const a0 = p.segments[0]?.a;
  if (p.segments.some((g) => g.a !== a0)) {
    let t = 0; const joins: number[] = [];
    for (let i = 0; i < p.segments.length - 1; i++) { t += p.segments[i].durationS; if (p.segments[i + 1].a !== p.segments[i].a) joins.push(t); }
    return { ok: false, reason: `The acceleration changes at ${joins.join(' s and ')} s. The three equations need one constant acceleration, so use them separately on each stage.` };
  }
  return { ok: true };
}

/** Which equation to choose, from the quantities given and the one wanted (Class 9 problem-solving). */
export type Quantity = 'u' | 'v' | 'a' | 't' | 's';
export function chooseEquation(given: Quantity[], wanted: Quantity): { equation: 'v = u + at' | 's = ut + ½at²' | 'v² = u² + 2as'; missing: Quantity } | null {
  const all: Quantity[] = ['u', 'v', 'a', 't', 's'];
  const eqs: { equation: 'v = u + at' | 's = ut + ½at²' | 'v² = u² + 2as'; uses: Quantity[]; missing: Quantity }[] = [
    { equation: 'v = u + at', uses: ['v', 'u', 'a', 't'], missing: 's' },
    { equation: 's = ut + ½at²', uses: ['s', 'u', 't', 'a'], missing: 'v' },
    { equation: 'v² = u² + 2as', uses: ['v', 'u', 'a', 's'], missing: 't' },
  ];
  for (const e of eqs) if (e.uses.includes(wanted) && e.uses.every((q) => q === wanted || given.includes(q))) return { equation: e.equation, missing: e.missing };
  void all;
  return null;
}

/** Stopping distance for a braking vehicle with constant deceleration: v = 0, so s = u² ÷ (2 |a|). */
export const stoppingDistance = (u: number, aMagnitude: number): number => (u * u) / (2 * aMagnitude);

const r2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const sgn = (n: number): string => (Math.round(n * 100) === 0 ? '0' : `${n < 0 ? '−' : '+'}${r2(Math.abs(n))}`);
const bracket = (n: number): string => (n < 0 ? `(${r2(n)})` : r2(n));

export interface Substitution { law: string; working: string; result: string; meaning: string }

/** Substitutions with the signs kept, and what each result means physically. */
export function substitutions(e: EquationValues): Substitution[] {
  const dir = (x: number) => (x > 0 ? 'to the right' : x < 0 ? 'to the left' : 'zero');
  return [
    { law: 'v = u + at', working: `v = ${bracket(e.u)} + ${bracket(e.a)} × ${r2(e.t)}`, result: `v = ${sgn(e.v)} m/s`,
      meaning: e.v === 0 ? 'The object is momentarily at rest.' : `The velocity at ${r2(e.t)} s is ${r2(Math.abs(e.v))} m/s ${dir(e.v)}.` },
    { law: 's = ut + ½at²', working: `s = ${bracket(e.u)} × ${r2(e.t)} + ½ × ${bracket(e.a)} × ${r2(e.t)}²`, result: `s = ${sgn(e.s)} m`,
      meaning: e.s === 0 ? 'The object is back at its starting position: zero displacement.' : `The displacement from the start is ${r2(Math.abs(e.s))} m ${dir(e.s)}.` },
    { law: 'v² = u² + 2as', working: `v² = ${r2(e.u)}² + 2 × ${bracket(e.a)} × ${bracket(e.s)}`, result: `v² = ${r2(e.v2Right)} m²/s²`,
      meaning: `This matches v² = ${r2(e.v)}² = ${r2(e.v2Left)}. The equation gives v², so the sign of v must come from v = u + at.` },
  ];
}

/** Cross-check of the closed-form equations against the profile engine; returns the largest absolute error. */
export function checkAgainstProfile(p: Profile, t: number): number {
  const g = p.segments[0];
  const e = equationValues(p.v0, g.a, Math.min(t, totalTime(p)));
  const s = stateAt(p, e.t);
  return Math.max(Math.abs(s.v - e.v), Math.abs(s.displacement - e.s), Math.abs(e.v2Left - e.v2Right));
}

export interface EquationPreset { id: string; title: string; profile: Profile; note: string }

const seg = (x0: number, v0: number, a: number, d: number): Profile => ({ x0, v0, segments: [{ durationS: d, a }] });

export const EQUATION_PRESETS: EquationPreset[] = [
  { id: 'from-rest', title: 'Starting from rest', profile: seg(0, 0, 3, 8), note: 'u = 0, so v = at and s = ½at².' },
  { id: 'braking', title: 'Braking to a stop', profile: seg(0, 20, -4, 5), note: 'v = 0 after 5 s; the stopping distance is u² ÷ 2|a| = 50 m.' },
  { id: 'zero-a', title: 'No acceleration', profile: seg(0, 6, 0, 10), note: 'With a = 0 the equations reduce to v = u and s = ut.' },
  { id: 'throw-up', title: 'Turns back (enrichment)', profile: seg(0, 10, -2, 10), note: 'The velocity passes through zero at 5 s. s is the displacement; the distance travelled is larger once the object turns back.' },
  { id: 'leftward', title: 'Moving left, speeding up', profile: seg(0, -3, -2, 6), note: 'Negative u and negative a: the speed increases to the left.' },
  { id: 'two-stage', title: 'Acceleration changes (not allowed)', profile: { x0: 0, v0: 0, segments: [{ durationS: 4, a: 3 }, { durationS: 4, a: -1 }] }, note: 'One equation cannot cover both stages.' },
];
