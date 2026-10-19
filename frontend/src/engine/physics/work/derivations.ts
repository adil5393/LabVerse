/**
 * Guided derivations for Chapter 7 (PHY-3B to PHY-3D). Each derivation has: physical assumptions, a starting principle,
 * step-by-step mathematics with the reason for every step, student-controlled parameters, a missing-step question in the
 * key steps (the mathematics of that step stays hidden until the student supplies the reasoning), and a short final summary.
 * Every `relation` evaluates both sides of a step from the parameters for ONE case: a numerical illustration, never a proof.
 *
 *  K  W_net = change in kinetic energy, K = 1/2 m v^2   (textbook Eqs. 7.4 to 7.6, derived here for a constant net force)
 *  U  U = m g h and the near-Earth change dU = m g dh    (Eqs. 7.7 and 7.8, reference level added as enrichment)
 *  C  K + U constant in free fall                        (Eqs. 7.9 and 7.10)
 *  R  inclined plane: F' L = m g h, MA = L / h           (Eq. 7.13)
 *  L  lever: F1 d1 = F2 d2, F1 L1 = F2 L2, MA = L1 / L2  (Eqs. 7.14 to 7.16; Eq. 7.15 is an experiment result in the book)
 *  P  power P = W / t                                    (Eq. 7.11)
 */

import type { Question } from '../../education/types';
import { pick } from '../../education/builders';
import { computeKinetic } from './kineticModel';
import { G } from './workModel';

export type DerivationId = 'K' | 'U' | 'C' | 'R' | 'L' | 'P';
export type Ctx = Record<string, number>;

export interface ParamSpec { id: string; label: string; unit: string; min: number; max: number; step: number }

export interface DerivStep {
  id: string;
  title: string;
  math: string[];
  why: string;
  /** Quantities this step uses (the figure highlights them). */
  uses: string[];
  check?: Question;
  relation?: (c: Ctx) => { label: string; lhs: number; rhs: number };
}

export interface Derivation {
  id: DerivationId;
  title: string;
  source: string;
  kind: 'textbook' | 'enrichment';
  assumptions: string[];
  params: ParamSpec[];
  defaults: Ctx;
  /** Returns valid: 0 and reason via `why` when the parameters are not physical. */
  context: (p: Ctx) => { ctx: Ctx; problem?: string };
  steps: DerivStep[];
  summary: string[];
}

const P = (id: string, label: string, unit: string, min: number, max: number, step: number): ParamSpec => ({ id, label, unit, min, max, step });

// --------------------------------------------------------------------------- K
const kContext = (p: Ctx) => {
  const r = computeKinetic({ massKg: p.m, netForce: p.F, u: p.u, displacement: p.s });
  if (!r.valid) return { ctx: { ...p, a: r.a }, problem: r.reason };
  return { ctx: { ...p, a: r.a, v: r.v, t: r.tEnd, W: r.wNet, K0: r.K0, K1: r.K1, dK: r.dK, as: r.a * p.s, halfV: (r.v * r.v - p.u * p.u) / 2 } };
};

const K_DERIVATION: Derivation = {
  id: 'K', title: 'Kinetic energy K = ½mv² and W_net = ΔK', kind: 'textbook',
  source: 'NCERT 7.2 and 7.4.1: Eqs. 7.2 to 7.6 (the book gives this derivation for a constant force)',
  assumptions: ['The object moves along a straight line with a CONSTANT net force F, so its acceleration a is constant.', 'The mass m is constant. Right is positive, so F, s, u and v can be negative.', 'This derives the theorem for a constant net force. The textbook says it also holds for forces that change and for systems; that is stated there, not proved here.'],
  params: [P('m', 'Mass', 'kg', 0.5, 20, 0.5), P('F', 'Net force', 'N', -40, 40, 1), P('u', 'Initial velocity', 'm/s', -10, 10, 0.5), P('s', 'Displacement', 'm', -20, 20, 0.5)],
  defaults: { m: 2, F: 6, u: 0, s: 4 },
  context: kContext,
  steps: [
    { id: 'kd1', title: 'The work of the net force', uses: ['force', 'disp'],
      math: ['W_net = F × s', 'F = the net force on the object, s = its displacement along the force (signed)'],
      check: pick('kd-1', 'The net force is constant. On a graph of net force (vertical) against position (horizontal) the force is a horizontal line. What does the area of the rectangle under the line from the start to the end represent?', [
        ['The work done by the net force, F × s', null],
        ['The kinetic energy at the end', 'The area is force times distance, which has units of work. It gives the CHANGE in kinetic energy, not the kinetic energy itself.', 'area_is_K'],
        ['The velocity of the object', 'The area of a force-position graph has units N × m = J, not m/s.', 'area_is_v'],
      ], 'Area under the F-x graph = work = F × s.'),
      why: 'Work by a constant force is force times displacement (Eq. 7.2). The same number is the area of the rectangle under the force-position graph. If s is negative the rectangle lies on the other side and the work is negative.',
      relation: (c) => ({ label: 'W_net from the model and F × s', lhs: c.W, rhs: c.F * c.s }) },
    { id: 'kd2', title: 'Use Newton\'s second law', uses: ['force', 'mass', 'acc'],
      math: ['F = m a  (Eq. 6.2)', 'so W_net = F s = (m a) s = m a s'],
      why: 'The net force on the object equals its mass times its acceleration. Replacing F by m a turns the force into something we can find from the motion.',
      relation: (c) => ({ label: 'W_net and m × a × s', lhs: c.W, rhs: c.m * c.a * c.s }) },
    { id: 'kd3', title: 'An equation of motion with no time in it', uses: ['velocity', 'acc', 'disp'],
      math: ['v² = u² + 2 a s  (Eq. 7.4, from Chapter 4)', 'so a s = (v² − u²) ÷ 2'],
      check: pick('kd-3', 'We have W = m a s and want an expression that uses speeds. Which equation of motion connects a, s, u and v without time?', [
        ['v² = u² + 2 a s', null],
        ['v = u + a t', 'That equation contains the time t and not the displacement s, so it does not give a s.', 'time_eq'],
        ['s = u t + ½ a t²', 'This contains t. We need a relation between a, s, u and v only.', 'time_eq'],
      ], 'v² = u² + 2as links velocities and displacement.'),
      why: 'This equation of motion for constant acceleration (Chapter 4) links the two velocities to the acceleration and the displacement. Rearranged, it gives the product a s that appears in the work.',
      relation: (c) => ({ label: 'a × s and (v² − u²) ÷ 2', lhs: c.as, rhs: c.halfV }) },
    { id: 'kd4', title: 'Substitute', uses: ['mass', 'velocity'],
      math: ['W_net = m × (v² − u²) ÷ 2', 'W_net = ½ m v² − ½ m u²'],
      why: 'Replace a s in W = m a s by (v² − u²) ÷ 2 and multiply out. Each term is half the mass times a velocity squared.',
      relation: (c) => ({ label: 'W_net and ½ m (v² − u²)', lhs: c.W, rhs: 0.5 * c.m * (c.v * c.v - c.u * c.u) }) },
    { id: 'kd5', title: 'Name the energy: K = ½ m v²', uses: ['mass', 'velocity', 'energy'],
      math: ['Define the kinetic energy K = ½ m v²  (Eq. 7.6)', 'W_net = K_final − K_initial = ΔK', 'object starts from rest (u = 0): W_net = ½ m v² = K'],
      check: pick('kd-5', 'The expression ½ m v² can never be negative. Why?', [
        ['Because v² is never negative (even for a negative velocity) and m is positive', null],
        ['Because energy is always positive by definition', 'It is the squared velocity that makes it non-negative, not a definition. The change in kinetic energy can be negative.', 'definition_only'],
        ['Because v is always positive', 'Velocity can be negative; but squaring a negative number gives a positive number, so K is not negative.', 'v_positive'],
      ], 'v² ≥ 0 so K ≥ 0.'),
      why: 'Work done on the object appears as a change in its energy (Eq. 7.3). The quantity ½mv² is what the work changes, so it is called the kinetic energy. Starting from rest, the work equals the kinetic energy gained.',
      relation: (c) => ({ label: 'W_net and K_final − K_initial', lhs: c.W, rhs: c.K1 - c.K0 }) },
    { id: 'kd6', title: 'Signs, reversals and speed', uses: ['energy', 'disp'],
      math: ['W_net > 0:  K increases (speeds up)', 'W_net < 0:  K decreases (slows down)', 'W_net = 0:  K unchanged', 'K depends on v², so it does not depend on the direction of motion'],
      why: 'The kinetic energy has no direction and is never negative, but its CHANGE can be either sign. If the object turns round, the work still uses the net displacement (start to end), not the length of the path. Doubling the speed multiplies v² by 4, so it multiplies K by 4.',
      relation: (c) => ({ label: 'K at double the initial speed and 4 × K at the initial speed', lhs: 0.5 * c.m * (2 * c.u) * (2 * c.u), rhs: 4 * c.K0 }) },
  ],
  summary: ['W_net = F s  =  m a s     (F = ma)', 'a s = (v² − u²) ÷ 2     (v² = u² + 2as)', 'W_net = ½ m v² − ½ m u²  =  K_final − K_initial = ΔK', 'K = ½ m v² ≥ 0   (doubling v multiplies K by 4)'],
};

// --------------------------------------------------------------------------- U
const uContext = (p: Ctx) => {
  const g = p.g, m = p.m, h1 = p.h0 + p.dh;
  if (h1 < -1e-9) return { ctx: { ...p }, problem: 'The final height would be below the ground (0 m). Choose a smaller drop.' };
  return { ctx: { ...p, h1, F: m * g, Wlift: m * g * p.dh, Wgrav: -m * g * p.dh, dU: m * g * p.dh, U0: m * g * (p.h0 - p.ref), U1: m * g * (h1 - p.ref) } };
};

const U_DERIVATION: Derivation = {
  id: 'U', title: 'Gravitational potential energy: U = mgh and ΔU = mgΔh', kind: 'textbook',
  source: 'NCERT 7.4.2: Eqs. 7.7 and 7.8. The reference-level discussion (step 4) is LabVerse enrichment.',
  assumptions: ['The object is near the Earth\'s surface, so g is constant (the book notes the formula is valid only there).', 'The object is lifted slowly (at constant speed), so its kinetic energy does not change.', 'Up is positive. The potential energy is measured from a chosen reference height.'],
  params: [P('m', 'Mass', 'kg', 0.5, 20, 0.5), P('g', 'g', 'm/s²', 1.6, 12, 0.1), P('h0', 'Start height', 'm', 0, 20, 0.5), P('dh', 'Height change', 'm', -10, 10, 0.5), P('ref', 'Reference height', 'm', 0, 10, 0.5)],
  defaults: { m: 2, g: G, h0: 1, dh: 3, ref: 0 },
  context: uContext,
  steps: [
    { id: 'ud1', title: 'Lift slowly: the lifting force equals the weight', uses: ['force', 'mass'],
      math: ['Slow lifting: constant speed, so the net force is zero', 'lifting force = weight:  F = m g'],
      check: pick('ud-1', 'You lift an object slowly at a steady speed. Why must the upward force you apply equal its weight?', [
        ['Constant speed means zero net force, so the upward force balances the downward weight', null],
        ['Because the object is heavy', 'Heaviness alone does not decide it. Steady speed means zero acceleration, so the forces balance.', 'heavy_only'],
        ['Because gravity stops acting once the object moves', 'Gravity keeps acting on the object. The balance of the two forces is what keeps the speed constant.', 'gravity_stops'],
      ], 'Constant velocity: balanced forces.'),
      why: 'By Newton\'s first law, a steady speed means balanced forces. The object only gains height, not speed, which is why we can say the energy supplied goes into the height.',
      relation: (c) => ({ label: 'lifting force and m g (N)', lhs: c.F, rhs: c.m * c.g }) },
    { id: 'ud2', title: 'The work done by the lifting force', uses: ['force', 'height'],
      math: ['W = force × displacement = (m g) × Δh', 'W = m g Δh   (Eq. 7.7 for a lift of height h)'],
      why: 'The lifting force and the vertical displacement both point up, so the work is positive and equals the force times the height gained.',
      relation: (c) => ({ label: 'work by the lifting force and m g Δh (J)', lhs: c.Wlift, rhs: c.m * c.g * c.dh }) },
    { id: 'ud3', title: 'The work appears as stored energy', uses: ['energy', 'height'],
      math: ['Work done on the object = change in its energy (Eq. 7.3)', 'the kinetic energy is unchanged, so the energy changes only through position', 'ΔU = m g Δh   (Eq. 7.8: U = m g h)'],
      check: pick('ud-3', 'You lift the object slowly, so its kinetic energy stays the same. Where does the work you do go?', [
        ['Into the potential energy of the object and the Earth, stored by the greater height', null],
        ['Into more kinetic energy', 'The speed is constant, so the kinetic energy does not change. The energy is stored by position.', 'goes_to_K'],
        ['Nowhere: work done lifting is lost', 'If the object is released it falls and gains kinetic energy, so the energy was stored, not lost.', 'lost'],
      ], 'Stored as potential energy.'),
      why: 'By the work-energy relation the work is a change in energy. With no change in kinetic energy it is stored as potential energy, which can be recovered when the object falls. Gravity does the opposite work: −m g Δh.',
      relation: (c) => ({ label: 'ΔU and the work by the lifting force (J)', lhs: c.dU, rhs: c.Wlift }) },
    { id: 'ud4', title: 'Reference level: only differences matter (enrichment)', uses: ['height', 'energy'],
      math: ['U = m g (h − h_ref),  where h_ref is the chosen zero level', 'U₂ − U₁ = m g (h₂ − h_ref) − m g (h₁ − h_ref) = m g (h₂ − h₁)', 'the reference cancels in every change'],
      check: pick('ud-4', 'You move the zero level of potential energy from the ground to a table top. What changes?', [
        ['Every U value shifts by the same amount, but the change ΔU between two heights does not', null],
        ['The change ΔU between two heights changes', 'The reference height cancels when you subtract, so ΔU is the same.', 'reference_changes_delta'],
        ['Nothing changes: the potential energy has an absolute value', 'The value of U depends on the chosen zero level; only differences are the same.', 'absolute_zero'],
      ], 'Potential energy has a chosen zero; changes do not depend on it.'),
      why: 'Only changes of potential energy have physical consequences (the work done, the speed gained in a fall). Choosing the ground or a table as zero shifts every value equally. In the textbook the ground is the zero level.',
      relation: (c) => ({ label: 'U(final) − U(start) with your reference and ΔU = m g Δh', lhs: c.U1 - c.U0, rhs: c.dU }) },
    { id: 'ud5', title: 'Going down, and the path', uses: ['height', 'energy'],
      math: ['going down: Δh < 0 so ΔU < 0 (potential energy is released)', 'ΔU depends on the vertical height change only, not on the path'],
      why: 'Lowering by Δh releases m g |Δh| of potential energy and gravity does positive work. A student lifted straight up by a lift or climbing stairs to the same height gains the same potential energy: the gain depends on the height, not the path (Exercise 5).',
      relation: (c) => ({ label: 'work by gravity and −ΔU (J)', lhs: c.Wgrav, rhs: -c.dU }) },
  ],
  summary: ['lift slowly: F = m g  (balanced forces)', 'W = F × Δh = m g Δh', 'work stored as potential energy: ΔU = m g Δh;  U = m g h from a chosen zero level', 'valid near the Earth\'s surface where g is constant; only changes of U are physical'],
};

// --------------------------------------------------------------------------- C
const cContext = (p: Ctx) => {
  const g = G, m = p.m, h = p.h, tFall = Math.sqrt((2 * h) / g);
  if (p.t > tFall + 1e-9) return { ctx: { ...p }, problem: `The object reaches the ground after ${Math.round(tFall * 1000) / 1000} s, so t cannot be larger.` };
  const v = g * p.t, drop = 0.5 * g * p.t * p.t, hp = h - drop;
  return { ctx: { ...p, v, drop, hp, U0: m * g * h, K0: 0, E0: m * g * h, U1: m * g * hp, K1: 0.5 * m * v * v, E1: m * g * hp + 0.5 * m * v * v, tFall } };
};

const C_DERIVATION: Derivation = {
  id: 'C', title: 'Conservation of mechanical energy in free fall', kind: 'textbook',
  source: 'NCERT 7.4.3: Eqs. 7.9 and 7.10 and the surrounding text',
  assumptions: ['The object falls from rest, so its initial velocity u = 0.', 'Only gravity acts (no air resistance, no friction), so a = g, a constant.', 'Potential energy is measured from the ground, which is also the lowest point.'],
  params: [P('m', 'Mass', 'kg', 0.5, 20, 0.5), P('h', 'Start height', 'm', 1, 20, 0.5), P('t', 'Time of fall', 's', 0, 4, 0.1)],
  defaults: { m: 2, h: 10, t: 1 },
  context: cContext,
  steps: [
    { id: 'cd1', title: 'At the start (point A)', uses: ['energy', 'height'],
      math: ['potential energy U = m g h', 'kinetic energy K = 0  (at rest)', 'mechanical energy E = K + U = m g h   (Eqs. 7.9a to 7.9c)'],
      why: 'Mechanical energy is the sum of the kinetic and the potential energy. At the top the object is not moving, so all of its energy is potential.',
      relation: (c) => ({ label: 'E at the start and m g h (J)', lhs: c.E0, rhs: c.m * G * c.h }) },
    { id: 'cd2', title: 'The motion after a time t (point B)', uses: ['time', 'velocity', 'height'],
      math: ['v = u + g t = g t', 'distance fallen = ½ g t²,  so the height is h′ = h − ½ g t²'],
      check: pick('cd-2', 'The object starts from rest and falls with acceleration g. Why is its velocity after time t equal to g t?', [
        ['From v = u + a t with u = 0 and a = g', null],
        ['Because velocity is always g × time for any object', 'It follows from the equation of motion v = u + at; here u = 0 and a = g. If u were not zero it would be different.', 'always'],
        ['From v² = 2 g h only', 'That equation also holds, but it uses the height, not the time. For a given time we use v = u + at.', 'wrong_equation'],
      ], 'v = u + at with u = 0.'),
      why: 'The kinematic equations of Chapter 4 with u = 0 and a = g give the velocity and the distance fallen. Subtracting the distance fallen from the starting height gives the height at B.',
      relation: (c) => ({ label: 'height at B from the fall and h − ½ g t² (m)', lhs: c.hp, rhs: c.h - 0.5 * G * c.t * c.t }) },
    { id: 'cd3', title: 'Potential energy at B', uses: ['energy', 'height'],
      math: ['U = m g h′ = m g (h − ½ g t²)', 'U = m g h − ½ m g² t²   (Eq. 7.10a)'],
      why: 'Put the height h′ into U = m g h′ and multiply out. The potential energy has FALLEN by ½ m g² t².',
      relation: (c) => ({ label: 'U at B and m g h − ½ m g² t² (J)', lhs: c.U1, rhs: c.m * G * c.h - 0.5 * c.m * G * G * c.t * c.t }) },
    { id: 'cd4', title: 'Kinetic energy at B', uses: ['energy', 'velocity'],
      math: ['K = ½ m v² = ½ m (g t)²', 'K = ½ m g² t²   (Eq. 7.10b)'],
      why: 'Put v = g t into K = ½ m v². The kinetic energy has RISEN by ½ m g² t².',
      relation: (c) => ({ label: 'K at B and ½ m g² t² (J)', lhs: c.K1, rhs: 0.5 * c.m * G * G * c.t * c.t }) },
    { id: 'cd5', title: 'Add them', uses: ['energy'],
      math: ['E = K + U = (½ m g² t²) + (m g h − ½ m g² t²)', 'E = m g h   (Eq. 7.10c)'],
      check: pick('cd-5', 'In K + U the terms ½mg²t² (from K) and −½mg²t² (from U) appear. What happens to them?', [
        ['They cancel, leaving m g h, which does not depend on t', null],
        ['They add to give mg²t²', 'U contains MINUS ½mg²t² and K contains PLUS ½mg²t², so they cancel.', 'signs'],
        ['They remain, so the energy grows with time', 'They cancel exactly. The total is the same at every time.', 'grows'],
      ], 'The time-dependent terms cancel.'),
      why: 'The same amount leaves the potential energy and enters the kinetic energy. The sum does not depend on t, so it is the same at every instant: the mechanical energy is conserved.',
      relation: (c) => ({ label: 'E at B and E at the start (J)', lhs: c.E1, rhs: c.E0 }) },
    { id: 'cd6', title: 'When it applies, and the bigger picture', uses: ['energy'],
      math: ['K + U = constant only if no other external force does work', 'with friction or air resistance: mechanical energy decreases and thermal energy increases', 'total energy of an isolated system is constant'],
      why: 'The conservation of mechanical energy held because only gravity acted. Real pendulums slow down and stop because friction at the support and air resistance take mechanical energy and turn it into thermal energy; the total energy is still conserved. Do not say energy is "destroyed".' },
  ],
  summary: ['A: U = m g h, K = 0, E = m g h', 'B: v = g t, h′ = h − ½ g t²', 'U = m g h − ½ m g² t²,  K = ½ m g² t²', 'E = K + U = m g h: constant while only gravity acts'],
};

// --------------------------------------------------------------------------- R
const rContext = (p: Ctx) => {
  if (p.L < p.h) return { ctx: { ...p }, problem: 'The ramp length L cannot be shorter than the height h.' };
  const mg = p.m * G;
  return { ctx: { ...p, mg, Fe: (mg * p.h) / p.L, Win: ((mg * p.h) / p.L) * p.L, dU: mg * p.h, sinT: p.h / p.L, MA: p.L / p.h, FeForce: mg * (p.h / p.L), lift: mg } };
};

const R_DERIVATION: Derivation = {
  id: 'R', title: 'The inclined plane: F′ × L = m g h and MA = L ÷ h', kind: 'textbook',
  source: 'NCERT 7.6.2: Eq. 7.13 (the energy argument is the book\'s; the forces check in step 5 is enrichment)',
  assumptions: ['The ramp is smooth: no friction.', 'The object is pushed up at constant speed, so its kinetic energy does not change.', 'The effort F′ is parallel to the ramp and constant.'],
  params: [P('m', 'Mass', 'kg', 1, 50, 1), P('h', 'Height h', 'm', 0.1, 3, 0.1), P('L', 'Ramp length L', 'm', 0.2, 12, 0.1)],
  defaults: { m: 20, h: 1, L: 4 },
  context: rContext,
  steps: [
    { id: 'rd1', title: 'The task: lift mg through a height h', uses: ['load', 'height'],
      math: ['load = weight = m g', 'lifting straight up needs an effort equal to m g, over a distance h'],
      why: 'The load is the weight of the object. Lifting it straight up needs an upward force of m g acting through the height h.', relation: (c) => ({ label: 'load m g (N)', lhs: c.lift, rhs: c.mg }) },
    { id: 'rd2', title: 'The work done by the effort along the ramp', uses: ['effort', 'length'],
      math: ['effort F′ acts along the ramp, the object moves a distance L along it', 'work done by you = F′ × L   (Eq. 7.2)'],
      why: 'The effort and the displacement along the ramp are in the same direction, so the work is positive and equals the effort times the length of the ramp.' },
    { id: 'rd3', title: 'The energy gained', uses: ['load', 'height'],
      math: ['constant speed: the kinetic energy is unchanged', 'the potential energy gained is m g h   (Eq. 7.8)', 'no friction: all the work goes into potential energy'],
      check: pick('rd-3', 'The object is pushed up a smooth ramp at constant speed. What does the work you do become?', [
        ['The potential energy of the object (m g h): nothing is lost to friction', null],
        ['Kinetic energy, because the object moves', 'The speed is constant so the kinetic energy does not change.', 'goes_to_K'],
        ['Thermal energy by friction', 'The ramp is smooth, so there is no friction to turn the work into thermal energy.', 'friction_present'],
      ], 'W = ΔU: F′L = mgh.'),
      why: 'By the work-energy theorem the work done equals the change in energy. Only the potential energy changes.',
      relation: (c) => ({ label: 'm g h (J)', lhs: c.dU, rhs: c.m * G * c.h }) },
    { id: 'rd4', title: 'Equate them', uses: ['effort', 'length', 'height', 'load'],
      math: ['F′ × L = m g × h', 'so F′ ÷ (m g) = h ÷ L', 'F′ = m g × (h ÷ L)   (Eq. 7.13 left side)'],
      why: 'Setting the work done equal to the energy gained links the effort to the load and the geometry of the ramp.',
      relation: (c) => ({ label: 'F′ × L and m g h (J)', lhs: c.Fe * c.L, rhs: c.dU }) },
    { id: 'rd5', title: 'Mechanical advantage', uses: ['effort', 'load'],
      math: ['mechanical advantage = load ÷ effort = m g ÷ F′  (Eq. 7.12)', 'MA = L ÷ h   (Eq. 7.13)'],
      check: pick('rd-5', 'A longer, gentler ramp reaches the same height h. What happens to the effort needed (without friction)?', [
        ['It is smaller, because the same work is spread over a longer distance', null],
        ['It is larger, because the ramp is longer', 'F′ = m g h ÷ L: a longer L makes the effort SMALLER.', 'longer_more_effort'],
        ['It stays the same, because the load is the same', 'The load is the same, but the effort also depends on L: F′ = mgh ÷ L.', 'effort_constant'],
      ], 'Longer ramp: smaller effort.'),
      why: 'Since L is greater than h, the effort is less than the load and the mechanical advantage is greater than 1. Lengthening the ramp increases it.',
      relation: (c) => ({ label: 'load ÷ effort and L ÷ h', lhs: c.mg / c.Fe, rhs: c.MA }) },
    { id: 'rd6', title: 'What the ramp does not do', uses: ['effort', 'length'],
      math: ['effort × distance = F′ L = m g h, the same for every ramp', 'smaller force, larger distance, the same work', 'forces check (enrichment): F′ = m g sin θ with sin θ = h ÷ L, the same result'],
      why: 'The ramp makes the task easier by reducing the force, not by reducing the work. With friction you would need extra effort and the input work would be greater than m g h: the difference is energy turned into thermal energy.',
      relation: (c) => ({ label: 'force found from m g sin θ and F′ (N)', lhs: c.FeForce, rhs: c.Fe }) },
  ],
  summary: ['work by the effort = F′ L;  energy gained = m g h', 'F′ L = m g h, so F′ = m g (h ÷ L)', 'MA = load ÷ effort = L ÷ h  (> 1)', 'smaller force, larger distance: the work is the same'],
};

// --------------------------------------------------------------------------- L
const lContext = (p: Ctx) => {
  const phi = (p.phi * Math.PI) / 180;
  const F1 = (p.F2 * p.L2) / p.L1;
  return { ctx: { ...p, phiRad: phi, d1: p.L1 * phi, d2: p.L2 * phi, F1, MA: p.F2 / F1, MAarms: p.L1 / p.L2 } };
};

const L_DERIVATION: Derivation = {
  id: 'L', title: 'The lever: F₁d₁ = F₂d₂, F₁L₁ = F₂L₂ and MA = L₁ ÷ L₂', kind: 'textbook',
  source: 'NCERT 7.6.3: Eqs. 7.14 to 7.16. The book finds Eq. 7.15 from Activity 7.5; the small-rotation geometry used here to connect it to Eq. 7.14 is LabVerse enrichment.',
  assumptions: ['The lever is a rigid, light bar that turns about a fixed point (the fulcrum); friction at the fulcrum is negligible.', 'The lever is turned slowly through a small angle φ, so the load and the effort end move almost straight.', 'Ideal lever: the work done on one end is transferred to the other end (nothing is created or lost).'],
  params: [P('F2', 'Load F₂', 'N', 5, 200, 5), P('L2', 'Load arm L₂', 'm', 0.1, 2, 0.1), P('L1', 'Effort arm L₁', 'm', 0.1, 4, 0.1), P('phi', 'Turn angle φ', '°', 1, 10, 1)],
  defaults: { F2: 100, L2: 0.5, L1: 2, phi: 5 },
  context: lContext,
  steps: [
    { id: 'ld1', title: 'How far each end moves', uses: ['arm', 'distance'],
      math: ['turn the bar about the fulcrum by a small angle φ (in radians)', 'distance moved by a point at arm length L: arc ≈ L φ', 'effort end: d₁ = L₁ φ,   load end: d₂ = L₂ φ'],
      why: 'Every point of a rigid bar turns through the same angle. A point farther from the fulcrum moves along a bigger arc, in proportion to its distance from the fulcrum.',
      relation: (c) => ({ label: 'd₁ ÷ d₂ and L₁ ÷ L₂', lhs: c.d1 / c.d2, rhs: c.L1 / c.L2 }) },
    { id: 'ld2', title: 'Work in = work out (ideal lever)', uses: ['effort', 'load', 'distance'],
      math: ['work done by the effort = F₁ × d₁', 'work done on the load = F₂ × d₂', 'F₁ d₁ = F₂ d₂   (Eq. 7.14)'],
      check: pick('ld-2', 'The effort F₁ turns the lever and lifts the load F₂ slowly. Why is F₁d₁ equal to F₂d₂ for an ideal lever?', [
        ['The lever only transfers the work from one end to the other; it creates and wastes no energy', null],
        ['Because the two forces are equal', 'The forces are generally different: a small effort balances a large load. The WORKS are equal.', 'forces_equal'],
        ['Because the two distances are equal', 'The distances differ: the effort end moves farther than the load end. The works are equal.', 'distances_equal'],
      ], 'Ideal machine: input work = output work.'),
      why: 'By conservation of energy an ideal lever cannot give out more work than it takes in. (A real lever gives out slightly less because of friction at the fulcrum.)' },
    { id: 'ld3', title: 'Replace the distances by the arms', uses: ['effort', 'load', 'arm'],
      math: ['F₁ × (L₁ φ) = F₂ × (L₂ φ)', 'divide both sides by φ (φ ≠ 0)'],
      check: pick('ld-3', 'After substituting d₁ = L₁φ and d₂ = L₂φ, what can be cancelled from both sides?', [
        ['The angle φ', null],
        ['The forces F₁ and F₂', 'F₁ and F₂ are different quantities and appear on different sides; φ is the common factor.', 'forces_cancel'],
        ['Nothing can be cancelled', 'φ multiplies both sides, so it can be divided out.', 'nothing'],
      ], 'φ is common to both sides.'),
      why: 'The angle φ is the same for both ends, so it divides out. What remains does not depend on how far the lever is turned.',
      relation: (c) => ({ label: 'F₁ L₁ φ and F₂ L₂ φ', lhs: c.F1 * c.L1 * c.phiRad, rhs: c.F2 * c.L2 * c.phiRad }) },
    { id: 'ld4', title: 'The balance condition', uses: ['effort', 'load', 'arm'],
      math: ['F₁ × L₁ = F₂ × L₂', 'effort × effort arm = load × load arm   (Eq. 7.15)'],
      why: 'This is the same relation the beam balance gives in Activity 7.5 (n₁ × L₁ = n₂ × L₂). The book finds it by experiment; here it follows from "work in = work out" for a small turn.',
      relation: (c) => ({ label: 'F₁ × L₁ and F₂ × L₂ (N m)', lhs: c.F1 * c.L1, rhs: c.F2 * c.L2 }) },
    { id: 'ld5', title: 'Mechanical advantage', uses: ['effort', 'load', 'arm'],
      math: ['mechanical advantage = load ÷ effort = F₂ ÷ F₁', 'from F₁L₁ = F₂L₂:  F₂ ÷ F₁ = L₁ ÷ L₂   (Eq. 7.16)'],
      check: pick('ld-5', 'How can you make a lever give a bigger mechanical advantage?', [
        ['Increase the effort arm (apply the effort farther from the fulcrum)', null],
        ['Increase the effort force', 'A bigger effort does not change the ratio L₁ ÷ L₂. Lengthening the effort arm does, so a smaller effort is needed.', 'more_effort'],
        ['Move the load farther from the fulcrum', 'That increases the load arm L₂ and makes the mechanical advantage SMALLER.', 'load_arm_longer'],
      ], 'MA = L₁ ÷ L₂.'),
      why: 'The effort arm is longer than the load arm when the mechanical advantage is greater than 1. Class I levers can have any value, Class II always more than 1 and Class III always less than 1.',
      relation: (c) => ({ label: 'F₂ ÷ F₁ and L₁ ÷ L₂', lhs: c.MA, rhs: c.MAarms }) },
    { id: 'ld6', title: 'The trade: force against distance', uses: ['effort', 'distance'],
      math: ['small effort × large distance = large load × small distance', 'the total work is the same: a lever reduces the force needed, not the work'],
      why: 'A lever makes a task easier by letting a small force act over a long distance. It does not create energy. Machines only help us use it more effectively.',
      relation: (c) => ({ label: 'work by effort F₁d₁ and work on load F₂d₂ (J)', lhs: c.F1 * c.d1, rhs: c.F2 * c.d2 }) },
  ],
  summary: ['d₁ = L₁φ,  d₂ = L₂φ  (a rigid bar turns by the same angle)', 'ideal lever: F₁ d₁ = F₂ d₂  (work in = work out)', 'so F₁ L₁ = F₂ L₂  (effort × effort arm = load × load arm)', 'MA = F₂ ÷ F₁ = L₁ ÷ L₂; smaller effort moves farther; the work is the same'],
};

// --------------------------------------------------------------------------- P
const pContext = (p: Ctx) => {
  if (p.t <= 0) return { ctx: { ...p }, problem: 'The time must be greater than zero.' };
  const P1 = p.W / p.t;
  return { ctx: { ...p, P1, P2: p.W / (p.t / 2), Wback: P1 * p.t, F: p.W / p.d, v: p.d / p.t, Fv: (p.W / p.d) * (p.d / p.t) } };
};

const P_DERIVATION: Derivation = {
  id: 'P', title: 'Power: P = W ÷ t', kind: 'textbook',
  source: 'NCERT 7.5: Eq. 7.11 and the watt. Step 5 (P = F v) is LabVerse enrichment.',
  assumptions: ['The work is done at a steady rate, or we use the AVERAGE power over the time taken.', 'The work W is the work done on the object (or the energy transferred), in joules.'],
  params: [P('W', 'Work', 'J', 10, 5000, 10), P('t', 'Time', 's', 0.5, 120, 0.5), P('d', 'Distance (step 5)', 'm', 1, 50, 1)],
  defaults: { W: 1500, t: 5, d: 10 },
  context: pContext,
  steps: [
    { id: 'pd1', title: 'Same work, different times', uses: ['work', 'time'],
      math: ['carry a bag up the stairs in 5 minutes or run up in 1 minute', 'the work done (against gravity) is the same; the time is not'],
      check: pick('pd-1', 'Running up a flight of stairs feels harder than walking up it, although the same work is done. What quantity differs?', [
        ['The rate at which the work is done (the power)', null],
        ['The total work', 'The stairs and the person are the same, so the work against gravity is the same. The time differs.', 'work_differs'],
        ['The potential energy gained', 'Both end at the same height, so the potential energy gained is the same.', 'energy_differs'],
      ], 'Power is the rate of doing work.'),
      why: 'Work tells how much energy is transferred; it does not say how quickly. To describe how quickly, we need a new quantity that involves time.' },
    { id: 'pd2', title: 'Define average power', uses: ['work', 'time', 'power'],
      math: ['power = work done ÷ time taken', 'P = W ÷ t   (Eq. 7.11)'],
      check: pick('pd-2', 'The same work is done in half the time. What happens to the power?', [
        ['It doubles', null],
        ['It halves', 'Power is work divided by time, so a shorter time gives a LARGER power.', 'inverse_mistake'],
        ['It stays the same', 'The work is the same but the time is shorter, so the ratio W ÷ t is larger.', 'time_ignored'],
      ], 'P = W ÷ t: half the time, twice the power.'),
      why: 'A rate is an amount divided by the time taken. More work in the same time, or the same work in a shorter time, both mean more power.',
      relation: (c) => ({ label: 'P = W ÷ t and the same work in half the time (W)', lhs: c.P2, rhs: 2 * c.P1 }) },
    { id: 'pd3', title: 'The unit: the watt', uses: ['power', 'work', 'time'],
      math: ['unit of P = unit of work ÷ unit of time = J ÷ s', '1 W = 1 J s⁻¹'],
      why: 'Dividing a joule by a second gives the watt (named after James Watt). 1 watt is 1 joule of work done each second. A larger unit is the kilowatt, 1 kW = 1000 W.',
      relation: (c) => ({ label: 'P × t returns the work (J)', lhs: c.Wback, rhs: c.W }) },
    { id: 'pd4', title: 'Work from power', uses: ['work', 'time', 'power'],
      math: ['W = P × t', 'a larger power or a longer time means more work'],
      why: 'Rearranging P = W ÷ t gives the work done by a machine of power P running for a time t. This is what a bill for electrical energy measures.' },
    { id: 'pd5', title: 'Enrichment: P = F v', uses: ['force', 'distance', 'power'],
      math: ['W = F × s for a steady force along the motion', 'P = W ÷ t = F × (s ÷ t) = F v   (v = average velocity)'],
      why: 'For a constant force along the line of motion the power is the force times the average velocity. It is not needed for the textbook exercises.',
      relation: (c) => ({ label: 'F × v and W ÷ t (W)', lhs: c.Fv, rhs: c.P1 }) },
  ],
  summary: ['P = W ÷ t  (average rate of doing work)', 'unit: 1 W = 1 J ÷ 1 s', 'W = P t', 'enrichment: for a steady force along the motion P = F v'],
};

export const DERIVATIONS: Derivation[] = [K_DERIVATION, U_DERIVATION, C_DERIVATION, R_DERIVATION, L_DERIVATION, P_DERIVATION];
export const derivationById = (id: string | null | undefined): Derivation | undefined => DERIVATIONS.find((d) => d.id === id);
