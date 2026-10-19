/**
 * Guided derivations of Newton's second law (PHY-2C), Section 6.5 of the NCERT chapter.
 *  A. "From the cart experiments": the textbook's own route (Activities 6.3 and 6.4, Eqs. 6.1 and 6.2): compare accelerations,
 *     find a ∝ F and a ∝ 1/m, then choose the unit (the newton) so that the constant is 1. This is an empirical argument,
 *     and the lesson says so; it is not a mathematical proof.
 *  B. "From momentum": p = mv, Δp = m(v − u), Δp/Δt = ma, so F = Δp/Δt = ma for a constant mass. The textbook states the momentum
 *     form in "Ready to Go Beyond" without a derivation; this derivation is LabVerse enrichment and is labelled as such.
 * Each step names the quantities it uses, why it is valid, and (optionally) a `relation`: both sides of the step's equation
 * evaluated from the Force Laboratory model, so the numbers come from the same model as the cart and the graphs.
 */

import type { Question } from '../../education/types';
import { pick } from '../../education/builders';
import { DEFAULT_SETUP, sampleAtTime, type Setup } from './forceModel';

export type SecondLawId = 'A' | 'B';
export type SLHighlight = 'force' | 'mass' | 'acc' | 'momentum' | 'dp' | 'time' | 'velocity';

export interface SLContext {
  massKg: number; u: number; v: number; t: number;
  /** Net force (N) and acceleration (m/s²), constant over the run. */
  net: number; a: number;
  p0: number; p1: number; dp: number;
  /** The same cart with twice the net force / with twice the mass (for the proportionality steps). */
  aDoubleForce: number; aDoubleMass: number;
}

const base = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });

export function contextOf(s: Setup, t: number): SLContext {
  const s0 = sampleAtTime(s, 0, 20), s1 = sampleAtTime(s, t, 20);
  const dbl = (o: Partial<Setup>) => sampleAtTime({ ...s, ...o }, 0, 20).a;
  return {
    massKg: s.massKg, u: s0.v, v: s1.v, t, net: s0.net, a: s0.a,
    p0: s.massKg * s0.v, p1: s.massKg * s1.v, dp: s.massKg * (s1.v - s0.v),
    aDoubleForce: dbl({ forceA: s.forceA * 2, forceB: s.forceB * 2 }), aDoubleMass: dbl({ massKg: s.massKg * 2 }),
  };
}

export interface SLStep {
  id: string;
  title: string;
  math: string[];
  why: string;
  uses: SLHighlight[];
  check?: Question;
  relation?: (c: SLContext) => { label: string; lhs: number; rhs: number };
}

export interface SLDerivation {
  id: SecondLawId;
  title: string;
  source: string;
  assumptions: string[];
  steps: SLStep[];
  summary: string[];
}

export const SECOND_LAW_DERIVATIONS: SLDerivation[] = [
  {
    id: 'A', title: 'F = ma from the cart experiments (the textbook\'s route)', source: 'NCERT 6.5: Activities 6.3 and 6.4, Eqs. 6.1 and 6.2',
    assumptions: ['A cart moves along a straight line and starts from rest, so the net force and the acceleration are constant.', 'Friction on the real cart is small, so the net force is the pull. (A real experiment gives numbers a little off because of friction and measurement errors.)', 'This is an experimental argument: it finds the pattern and then chooses a unit. It is not a mathematical proof.'],
    steps: [
      { id: 'sa1', title: 'Compare accelerations from the times', uses: ['acc', 'time'],
        math: ['From rest: s = ½ a T²', 'Same distance s in both runs: ½ a₁ T₁² = ½ a₂ T₂²', 'so a₁ ÷ a₂ = T₂² ÷ T₁²'],
        check: pick('sl-a1', 'Two runs cover the same distance from rest. In the second run the cart arrives in a shorter time. What do you conclude about its acceleration?', [
          ['It was larger: the same distance in less time needs a bigger acceleration', null],
          ['It was smaller, because the cart took less time', 'Reaching the same distance sooner means speeding up faster, so the acceleration is larger.', 'time_inverted'],
          ['It was the same, because the distance was the same', 'The distance is the same but the time is not, so the accelerations differ: a₁T₁² = a₂T₂².', 'distance_only'],
        ], 'a₁T₁² = a₂T₂², so a shorter T means a larger a.'),
        why: 'Starting from rest, s = ½aT² (an equation of motion from Chapter 4). Setting the two distances equal lets us find the ratio of the accelerations from the measured times alone.' },
      { id: 'sa2', title: 'Double the force, same mass', uses: ['force', 'acc'],
        math: ['Force doubled, same cart: T₂ is shorter and a₂ = 2 a₁', 'so a ∝ F (for a fixed mass)'],
        why: 'When the pulling force (the weight in the cup) is doubled the measured acceleration roughly doubles (a little less in a real experiment because of friction). Doubling F doubles a: a straight-line, proportional relationship.',
        relation: (c) => ({ label: 'a with doubled force and 2 × a', lhs: c.aDoubleForce, rhs: 2 * c.a }) },
      { id: 'sa3', title: 'Double the mass, same force', uses: ['mass', 'acc'],
        math: ['Mass doubled, same force: a₂ = a₁ ÷ 2', 'so a ∝ 1 ÷ m (for a fixed force)'],
        why: 'A heavier cart (more inertia) accelerates less under the same force: doubling the mass halves the acceleration. This is an inverse relationship, not a linear one: as m grows, a shrinks.',
        relation: (c) => ({ label: 'a with doubled mass and a ÷ 2', lhs: c.aDoubleMass, rhs: c.a / 2 }) },
      { id: 'sa4', title: 'Put the two patterns together', uses: ['force', 'mass', 'acc'],
        math: ['a ∝ F and a ∝ 1 ÷ m', 'so a ∝ F ÷ m, that is a = k F ÷ m for a constant k'],
        check: pick('sl-a4', 'Acceleration is proportional to the force and inversely proportional to the mass. Which expression combines both?', [
          ['a is proportional to F ÷ m', null],
          ['a is proportional to F × m', 'A larger mass makes the acceleration smaller, so m must be in the denominator.', 'mass_in_numerator'],
          ['a is proportional to m ÷ F', 'A larger force makes the acceleration larger, so F must be in the numerator.', 'force_in_denominator'],
        ], 'a ∝ F/m.'),
        why: 'Both patterns hold at the same time, so a depends on F and m only through the ratio F ÷ m. The constant k depends only on the units chosen.',
        relation: (c) => ({ label: 'a and F ÷ m (with k = 1)', lhs: c.a, rhs: c.net / c.massKg }) },
      { id: 'sa5', title: 'Choose the unit of force: k = 1', uses: ['force', 'mass', 'acc'],
        math: ['Define 1 newton: the force that gives 1 kg an acceleration of 1 m/s²', 'then with F = 1 N, m = 1 kg, a = 1 m/s²: k = 1', 'so a = F ÷ m, that is F = m a   (Eqs. 6.1 and 6.2)', '1 N = 1 kg × 1 m/s² = 1 kg m/s²'],
        why: 'The constant k is not discovered by the experiment: it is fixed by how we define the unit of force. Defining the newton as the force that gives 1 kg an acceleration of 1 m/s² makes k = 1. Then F = ma holds in newtons, kilograms and m/s².',
        relation: (c) => ({ label: 'm × a (kg·m/s²) and the net force (N)', lhs: c.massKg * c.a, rhs: c.net }) },
      { id: 'sa6', title: 'The result (Eq. 6.2) and its direction', uses: ['force', 'acc'],
        math: ['F = m a    (a = F ÷ m)', 'The acceleration has the same direction as the net force'],
        why: 'F is the NET force. The acceleration points the way the net force points, which need not be the way the object is moving: a net force against the motion slows the object.' },
    ],
    summary: ['½a₁T₁² = ½a₂T₂²  →  a₁/a₂ = T₂²/T₁²', 'double F → double a (a ∝ F);  double m → half a (a ∝ 1/m)', 'a = kF/m;  define 1 N = 1 kg·m/s², so k = 1:   F = ma   Eq. 6.2'],
  },
  {
    id: 'B', title: 'F = ma from momentum (enrichment, for a constant mass)', source: 'NCERT 6.5 "Ready to Go Beyond" states the momentum form; this derivation is LabVerse enrichment',
    assumptions: ['The mass of the object is constant.', 'The net force is constant over the time interval, so the acceleration is constant and the average equals the instantaneous value.', 'Straight-line motion with signs: right is positive, so p, Δp, F and a can be negative.'],
    steps: [
      { id: 'sb1', title: 'Define momentum', uses: ['momentum', 'mass', 'velocity'],
        math: ['p = m v', 'unit: kg × m/s = kg m/s', 'direction of p = direction of v'],
        why: 'Momentum is the product of mass and velocity. Because velocity has a direction, so does momentum: a cart moving left has negative momentum. Momentum is not a force: force is measured in newtons, momentum in kg m/s.',
        relation: (c) => ({ label: 'm × u and the initial momentum', lhs: c.massKg * c.u, rhs: c.p0 }) },
      { id: 'sb2', title: 'The change in momentum', uses: ['dp', 'mass', 'velocity'],
        math: ['initial momentum m u,  final momentum m v', 'Δp = m v − m u = m (v − u)'],
        check: pick('sl-b2', 'The mass stays constant. Why can we write m v − m u as m (v − u)?', [
          ['m is a common factor of both terms, and it does not change between the start and the end', null],
          ['Because v − u is always positive', 'The sign of v − u does not matter: m is simply a common factor.', 'sign_reason'],
          ['Because momentum does not depend on mass', 'Momentum is mass × velocity, so it does depend on mass. The factorising works because the mass is the same at the start and at the end.', 'mass_irrelevant'],
        ], 'A constant mass can be taken outside the bracket.'),
        why: 'Change = final − initial. For a constant mass, m is a common factor, so the change in momentum is the mass times the change in velocity. Do not confuse the momentum change Δp with the momentum p itself.',
        relation: (c) => ({ label: 'm v − m u and m (v − u)', lhs: c.massKg * c.v - c.massKg * c.u, rhs: c.massKg * (c.v - c.u) }) },
      { id: 'sb3', title: 'The rate of change of momentum', uses: ['dp', 'time'],
        math: ['rate of change of momentum = Δp ÷ Δt', '= m (v − u) ÷ t    (taking Δt = t)', 'unit: kg m/s ÷ s = kg m/s²'],
        why: 'A rate is a change divided by the time taken. Dividing Δp by the time t gives how fast the momentum changes.',
        relation: (c) => ({ label: 'Δp ÷ t and m (v − u) ÷ t', lhs: c.dp / c.t, rhs: (c.massKg * (c.v - c.u)) / c.t }) },
      { id: 'sb4', title: 'Recognise the acceleration', uses: ['acc', 'mass'],
        math: ['from Chapter 4: a = (v − u) ÷ t', 'so m (v − u) ÷ t = m × [(v − u) ÷ t] = m a'],
        why: '(v − u) ÷ t is exactly the average acceleration (Eq. 4.3c of the Motion chapter). For a constant acceleration it is the acceleration at every instant.',
        relation: (c) => ({ label: 'Δp ÷ t and m a', lhs: c.dp / c.t, rhs: c.massKg * c.a }) },
      { id: 'sb5', title: 'Force is the rate of change of momentum', uses: ['force', 'dp', 'acc'],
        math: ['Newton\'s second law: net force ∝ rate of change of momentum, in the direction of the net force', 'choose the newton so the constant is 1:  F = Δp ÷ Δt', 'so F = m a   (for a constant mass)', 'units: 1 N = 1 kg m/s²  (from kg m/s ÷ s)'],
        check: pick('sl-b5', 'Force equals the rate of change of momentum, Δp ÷ Δt. In what units is Δp ÷ Δt?', [
          ['kg m/s²: which is a newton', null],
          ['kg m/s: the unit of momentum', 'That is the unit of Δp. Dividing by time gives kg m/s ÷ s = kg m/s².', 'unit_of_momentum'],
          ['m/s²: the unit of acceleration', 'There is a mass in Δp, so the unit is kg m/s², not m/s².', 'unit_of_acceleration'],
        ], 'kg·m/s ÷ s = kg·m/s² = N.'),
        why: 'The law says the net force is proportional to the rate of change of momentum. With the newton defined as in Eq. 6.2, the constant of proportionality is 1. Momentum changes only when a net force acts: zero net force means zero change in momentum, not zero momentum.',
        relation: (c) => ({ label: 'net force (N) and Δp ÷ t', lhs: c.net, rhs: c.dp / c.t }) },
      { id: 'sb6', title: 'Signs, and what the result does not say', uses: ['force', 'momentum'],
        math: ['F and a have the same sign: both follow the net force', 'F opposite to the velocity: |p| falls (the object slows)', 'F = 0: Δp = 0, so p is constant (not necessarily zero)'],
        why: 'A negative force does not always slow an object: if the velocity is also negative (moving left) a negative force speeds it up. Whether the speed rises or falls depends on whether the force and the velocity point the same way. And zero force does not mean zero momentum: a moving cart with zero net force keeps its momentum.',
        relation: (c) => ({ label: 'net force and m a (signs kept)', lhs: c.net, rhs: c.massKg * c.a }) },
    ],
    summary: ['p = mv   (kg m/s)', 'Δp = m v − m u = m (v − u)', 'Δp ÷ Δt = m (v − u) ÷ t = m a', 'F = Δp ÷ Δt = m a   (constant mass; 1 N = 1 kg m/s²)'],
  },
];

export const secondLawDerivationById = (id: string | null | undefined): SLDerivation | undefined => SECOND_LAW_DERIVATIONS.find((d) => d.id === id);

export interface SLCase { id: string; title: string; setup: Setup; t: number }

export const SL_CASES: SLCase[] = [
  { id: 'push', title: 'Pushed along its motion (2 kg, +6 N, u = 2 m/s, 4 s)', setup: base({ massKg: 2, forceA: 6, startVelocity: 2 }), t: 4 },
  { id: 'against', title: 'Force against the motion (2 kg, −6 N, u = +6 m/s, 2 s)', setup: base({ massKg: 2, forceA: 6, dirA: 'left', startVelocity: 6 }), t: 2 },
  { id: 'left', title: 'Moving left, force left: speeds up (2 kg, −6 N, u = −2 m/s, 3 s)', setup: base({ massKg: 2, forceA: 6, dirA: 'left', startVelocity: -2 }), t: 3 },
  { id: 'zero', title: 'Zero net force, moving (2 kg, u = 4 m/s, 5 s)', setup: base({ massKg: 2, startVelocity: 4 }), t: 5 },
  { id: 'heavy', title: 'Heavier cart, same force (5 kg, +6 N, u = 0, 4 s)', setup: base({ massKg: 5, forceA: 6 }), t: 4 },
];
