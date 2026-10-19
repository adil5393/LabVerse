/**
 * Guided investigations A to F for the Work-Energy Laboratory (PHY-3B). Each follows Predict, Experiment, Observe, Explain; exactly
 * one prediction option holds in the model for every route, and the explanation is built from the same result that is drawn.
 */

import { computeKinetic, DEFAULT_KINETIC, type KineticResult, type KineticSetup } from './kineticModel';

export interface KineticOption { label: string; holds: (r: KineticResult) => boolean; why: string }
export interface KineticRoute { id: string; label: string; setup: KineticSetup; prompt: string; options: KineticOption[]; explain: (r: KineticResult) => string }
export interface KineticExperiment { id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; title: string; goal: string; routes: KineticRoute[]; lesson: string }

const k = (o: Partial<KineticSetup>): KineticSetup => ({ ...DEFAULT_KINETIC, ...o });
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const r2 = (n: number) => String(Math.round(n * 100) / 100).replace('-', '−');
const J = (n: number) => `${n > 0 ? '+' : ''}${r2(n)} J`;

export const KINETIC_EXPERIMENTS: KineticExperiment[] = [
  {
    id: 'A', title: 'Same speed, different masses', goal: 'Find how the kinetic energy depends on the mass when the speed is the same.',
    routes: [
      { id: 'a1', label: 'A 1 kg cart coasts at 4 m/s (zero net force) for 3 m', setup: k({ massKg: 1, u: 4, netForce: 0, displacement: 3 }), prompt: 'What is its kinetic energy?',
        options: [{ label: '8 J', holds: (r) => near(r.K0, 8), why: 'K = ½ m v² = ½ × 1 × 4² = 8 J.' }, { label: '4 J', holds: (r) => near(r.K0, 4), why: 'You used ½ m v with v not squared. The speed must be squared: ½ × 1 × 16 = 8 J.' }, { label: '16 J', holds: (r) => near(r.K0, 16), why: 'You squared the speed but left out the ½: ½ × 1 × 16 = 8 J.' }],
        explain: (r) => `K = ½ × ${r2(r.setup.massKg)} × ${r2(r.setup.u)}² = ${r2(r.K0)} J. With zero net work the kinetic energy stays ${r2(r.K1)} J.` },
      { id: 'a2', label: 'A 3 kg cart coasts at the same 4 m/s for 3 m', setup: k({ massKg: 3, u: 4, netForce: 0, displacement: 3 }), prompt: 'Compared with the 1 kg cart (8 J), its kinetic energy is:',
        options: [{ label: '3 times as much (24 J)', holds: (r) => near(r.K0, 24), why: 'K is proportional to the mass at a fixed speed: ½ × 3 × 16 = 24 J.' }, { label: 'the same (8 J)', holds: (r) => near(r.K0, 8), why: 'The speed is the same but the mass is larger, and K depends on both.' }, { label: '9 times as much (72 J)', holds: (r) => near(r.K0, 72), why: 'Only the speed is squared. Tripling the mass triples K.' }],
        explain: (r) => `K = ½ × ${r2(r.setup.massKg)} × 4² = ${r2(r.K0)} J: three times the mass, three times the kinetic energy.` },
    ],
    lesson: 'At the same speed, the kinetic energy is proportional to the mass: K = ½mv².',
  },
  {
    id: 'B', title: 'Same mass, different speeds', goal: 'Find how the kinetic energy depends on the speed for the same mass.',
    routes: [
      { id: 'b1', label: 'A 2 kg cart coasts at 2 m/s (zero net force) for 3 m', setup: k({ massKg: 2, u: 2, netForce: 0, displacement: 3 }), prompt: 'Its kinetic energy is:',
        options: [{ label: '4 J', holds: (r) => near(r.K0, 4), why: 'K = ½ × 2 × 2² = 4 J.' }, { label: '2 J', holds: (r) => near(r.K0, 2), why: 'That is ½ m v with v not squared.' }],
        explain: (r) => `K = ½ × 2 × 2² = ${r2(r.K0)} J.` },
      { id: 'b2', label: 'The same cart coasts at three times the speed, 6 m/s', setup: k({ massKg: 2, u: 6, netForce: 0, displacement: 3 }), prompt: 'Compared with 4 J, its kinetic energy is:',
        options: [{ label: '9 times as much (36 J)', holds: (r) => near(r.K0, 36), why: 'K depends on v²: (3 v)² = 9 v², so three times the speed gives nine times the energy.' }, { label: '3 times as much (12 J)', holds: (r) => near(r.K0, 12), why: 'That would be so if K were proportional to the speed. It is proportional to the square of the speed.' }],
        explain: (r) => `K = ½ × 2 × 6² = ${r2(r.K0)} J: three times the speed, nine times the energy.` },
    ],
    lesson: 'For the same mass, K is proportional to v²: tripling the speed multiplies the kinetic energy by nine.',
  },
  {
    id: 'C', title: 'Doubling the speed', goal: 'See that doubling the speed quadruples the kinetic energy (Example 7.4 of the textbook, with a cart).',
    routes: [
      { id: 'c1', label: 'A 2 kg cart at 3 m/s', setup: k({ massKg: 2, u: 3, netForce: 0, displacement: 3 }), prompt: 'Its kinetic energy is:',
        options: [{ label: '9 J', holds: (r) => near(r.K0, 9), why: 'K = ½ × 2 × 3² = 9 J.' }, { label: '6 J', holds: (r) => near(r.K0, 6), why: 'You multiplied mass and speed without squaring the speed.' }],
        explain: (r) => `K = ½ × 2 × 3² = ${r2(r.K0)} J.` },
      { id: 'c2', label: 'The same cart at double the speed, 6 m/s', setup: k({ massKg: 2, u: 6, netForce: 0, displacement: 3 }), prompt: 'When the speed doubles, the kinetic energy:',
        options: [{ label: 'becomes 4 times as large (36 J)', holds: (r) => near(r.K0, 36), why: '(2v)² = 4v², so the kinetic energy is four times as large.' }, { label: 'doubles (18 J)', holds: (r) => near(r.K0, 18), why: 'Kinetic energy is not proportional to the speed; it depends on the square of the speed.' }],
        explain: (r) => `K = ½ × 2 × 6² = ${r2(r.K0)} J, four times 9 J.` },
    ],
    lesson: 'Doubling the speed makes the kinetic energy four times as large, whatever the mass.',
  },
  {
    id: 'D', title: 'Positive net work', goal: 'See net work speed an object up: the work done becomes kinetic energy.',
    routes: [
      { id: 'd1', label: 'A 2 kg cart at rest is pushed by a net force of +6 N through 4 m', setup: k({ massKg: 2, u: 0, netForce: 6, displacement: 4 }), prompt: 'What are the net work and the final kinetic energy?',
        options: [{ label: 'net work +24 J, final kinetic energy 24 J', holds: (r) => near(r.wNet, 24) && near(r.K1, 24), why: 'W = F s = 6 × 4 = 24 J, and the cart started with no kinetic energy, so all 24 J becomes kinetic energy (v = √24 ≈ 4.9 m/s).' }, { label: 'net work +24 J, final kinetic energy 12 J', holds: (r) => near(r.wNet, 24) && near(r.K1, 12), why: 'Starting from rest, the change in kinetic energy equals the work, 24 J, so K = 24 J, not half of it.' }, { label: 'net work 0 J', holds: (r) => near(r.wNet, 0), why: 'The net force and the displacement are in the same direction, so the net work is positive.' }],
        explain: (r) => `Net work ${J(r.wNet)}; kinetic energy rises from ${r2(r.K0)} J to ${r2(r.K1)} J (v = ${r2(r.v)} m/s).` },
    ],
    lesson: 'Positive net work increases the kinetic energy by exactly the amount of the work.',
  },
  {
    id: 'E', title: 'Negative net work', goal: 'See that a net force against the motion takes kinetic energy away.',
    routes: [
      { id: 'e1', label: 'A 2 kg cart moving at +6 m/s feels a net force of −6 N while it moves 4 m', setup: k({ massKg: 2, u: 6, netForce: -6, displacement: 4 }), prompt: 'What are the net work and the final kinetic energy?',
        options: [{ label: 'net work −24 J, final kinetic energy 12 J', holds: (r) => near(r.wNet, -24) && near(r.K1, 12), why: 'The net force is opposite to the displacement: W = (−6) × 4 = −24 J. The kinetic energy falls from 36 J to 12 J (the speed drops to about 3.5 m/s).' }, { label: 'net work −24 J, final kinetic energy −12 J', holds: (r) => near(r.K1, -12), why: 'Kinetic energy can never be negative: it is ½mv², and v² is not negative.' }, { label: 'net work +24 J', holds: (r) => near(r.wNet, 24), why: 'The net force acts against the motion, so the net work is negative.' }],
        explain: (r) => `Net work ${J(r.wNet)}: kinetic energy falls from ${r2(r.K0)} J to ${r2(r.K1)} J. It cannot fall below 0 J: with more negative work the cart stops first.` },
    ],
    lesson: 'Negative net work decreases the kinetic energy; the kinetic energy never goes below zero because the object stops first.',
  },
  {
    id: 'F', title: 'Work changing kinetic energy', goal: 'Check W_net = ΔK, including a case where the object turns round.',
    routes: [
      { id: 'f1', label: 'A 2 kg cart at +2 m/s is pushed by +5 N through 3 m', setup: k({ massKg: 2, u: 2, netForce: 5, displacement: 3 }), prompt: 'What is the final kinetic energy?',
        options: [{ label: '19 J (4 J + 15 J)', holds: (r) => near(r.K1, 19), why: 'K1 = K0 + W_net = ½ × 2 × 2² + 5 × 3 = 4 + 15 = 19 J.' }, { label: '15 J', holds: (r) => near(r.K1, 15), why: 'The 15 J of work is the CHANGE in kinetic energy; the cart already had 4 J.' }],
        explain: (r) => `K0 = ${r2(r.K0)} J, W_net = ${J(r.wNet)}, K1 = ${r2(r.K1)} J: the change ${J(r.dK)} equals the net work.` },
      { id: 'f2', label: 'A 1 kg cart is pushed right at +4 m/s; a net force of −4 N slows it, turns it round, and it ends 2 m to the LEFT of its start', setup: k({ massKg: 1, u: 4, netForce: -4, displacement: -2 }), prompt: 'What are the net work and the final kinetic energy?',
        options: [{ label: 'net work +8 J, final kinetic energy 16 J (moving left at about 5.7 m/s)', holds: (r) => near(r.wNet, 8) && near(r.K1, 16), why: 'The work uses the net displacement (−2 m): W = (−4)(−2) = +8 J. The cart gains 8 J (8 J to 16 J): so the kinetic energy rises from 8 J to 16 J.' }, { label: 'net work 0 J, because it turned round', holds: (r) => near(r.wNet, 0), why: 'Turning round does not make the work zero. Work is the net force times the net displacement, here (−4) × (−2) = +8 J.' }, { label: 'net work −8 J', holds: (r) => near(r.wNet, -8), why: 'The net force (left) and the net displacement (left) point the same way, so the net work is positive.' }],
        explain: (r) => `Net displacement ${r2(r.setup.displacement)} m, net work ${J(r.wNet)}, kinetic energy ${r2(r.K0)} J to ${r2(r.K1)} J. The path is ${r2(r.distance)} m long because the cart turned round after ${r2(r.tTurn ?? 0)} s.` },
    ],
    lesson: 'W_net = K_final − K_initial. The work uses the net displacement even when the object turns round.',
  },
];

export const kineticExperimentById = (id: string | null | undefined): KineticExperiment | undefined => KINETIC_EXPERIMENTS.find((e) => e.id === id);

export function kineticRouteOutcome(r: KineticRoute) {
  const result = computeKinetic(r.setup);
  return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) };
}
