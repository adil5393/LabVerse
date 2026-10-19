/**
 * Second-law investigations K to O (PHY-2C), extending A to E (PHY-2A) and F to J (PHY-2B), all unchanged. Same pattern:
 * Predict → Experiment → Observe → Explain, with every option judged by the Force Laboratory model (exactly one holds).
 *   K same mass, different net forces      L same net force, different masses      M equal-duration force pulses
 *   N changes in momentum                  O a force that opposes the velocity
 * They use the existing cart, friction and pulse model; nothing new is simulated.
 */

import { DEFAULT_SETUP, sampleAtTime, type Setup } from './forceModel';
import type { FirstLawRoute } from './firstLaw';

export interface SecondLawExperiment {
  id: 'K' | 'L' | 'M' | 'N' | 'O';
  title: string;
  goal: string;
  routes: FirstLawRoute[];
  lesson: string;
}

const base = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };

const accRoute = (id: string, m: number, f: number, a: number, why: string): FirstLawRoute => ({
  id, label: `A ${m} kg cart at rest with a ${f} N net force to the right (frictionless)`, setup: base({ massKg: m, forceA: f }), tEnd: 3,
  prompt: `The acceleration of the ${m} kg cart under ${f} N is:`,
  options: [a, a * 2, a / 2].map((x, i) => ({ label: `${r2(x)} m/s²`, holds: (_e, s) => near(s.a, x), why: i === 0 ? why : i === 1 ? `That is double the correct value. Check a = F ÷ m = ${f} ÷ ${m}.` : `That is half the correct value. Check a = F ÷ m = ${f} ÷ ${m}.` })),
  explain: (e, s) => `a = F ÷ m = ${r2(s.net)} N ÷ ${m} kg = ${r2(s.a)} m/s². After 3 s the velocity is ${r2(e.v)} m/s.`,
});

export const SECOND_LAW_EXPERIMENTS: SecondLawExperiment[] = [
  {
    id: 'K', title: 'Same mass, different net forces', goal: 'Apply 4 N, 8 N and 12 N to the same 2 kg cart. Predict each acceleration and notice what happens when the force doubles.',
    routes: [
      accRoute('k1', 2, 4, 2, 'The net force is 4 N and the mass 2 kg: a = F ÷ m = 4 ÷ 2 = 2 m/s².'),
      accRoute('k2', 2, 8, 4, 'Double the force on the same mass doubles the acceleration: 8 ÷ 2 = 4 m/s².'),
      accRoute('k3', 2, 12, 6, 'Three times the force gives three times the acceleration: 12 ÷ 2 = 6 m/s². Acceleration is proportional to the net force: a straight-line relationship.'),
    ],
    lesson: 'For a fixed mass the acceleration is proportional to the net force (a ∝ F): doubling F doubles a. On a graph of a against F this is a straight line through the origin.',
  },
  {
    id: 'L', title: 'Same net force, different masses', goal: 'Apply the same 12 N to carts of 1, 2 and 4 kg. Predict each acceleration and notice what happens when the mass doubles.',
    routes: [
      accRoute('l1', 1, 12, 12, 'The net force is 12 N and the mass 1 kg: a = F ÷ m = 12 ÷ 1 = 12 m/s².'),
      accRoute('l2', 2, 12, 6, 'Double the mass halves the acceleration: 12 ÷ 2 = 6 m/s².'),
      accRoute('l3', 4, 12, 3, 'Four times the mass gives a quarter of the acceleration: 12 ÷ 4 = 3 m/s². Acceleration is inversely proportional to the mass.'),
    ],
    lesson: 'For a fixed net force the acceleration is inversely proportional to the mass (a ∝ 1/m): doubling m halves a. On a graph of a against m this is a curve, not a straight line; it is a straight line only if you plot a against 1/m.',
  },
  {
    id: 'M', title: 'Equal-duration force pulses', goal: 'Apply a force for exactly 2 s (a pulse) and compare the changes in velocity and in momentum.',
    routes: [
      { id: 'm1', label: 'A 2 kg cart at rest gets 6 N for 2 s (frictionless)', setup: base({ massKg: 2, forceA: 6, pulseS: 2 }), tEnd: 6,
        prompt: 'After the pulse the 2 kg cart\'s velocity is:',
        options: [{ label: '6 m/s', holds: (e) => near(e.v, 6), why: 'a = 6 ÷ 2 = 3 m/s² for 2 s: v = 3 × 2 = 6 m/s, and it stays constant after the pulse because the net force is then zero.' }, { label: '3 m/s', holds: (e) => near(e.v, 3), why: '3 m/s² is the acceleration. The velocity after 2 s is 3 × 2 = 6 m/s.' }, { label: '12 m/s', holds: (e) => near(e.v, 12), why: '12 kg m/s is the momentum gained (m × v = 2 × 6), not the velocity.' }],
        explain: (e) => `The velocity is ${r2(e.v)} m/s and the momentum is ${r2(2 * e.v)} kg m/s. The net force is zero after the pulse, so both stay constant.` },
      { id: 'm2', label: 'The same 2 kg cart gets 12 N for 2 s (frictionless)', setup: base({ massKg: 2, forceA: 12, pulseS: 2 }), tEnd: 6,
        prompt: 'With twice the force for the same 2 s the velocity after the pulse is:',
        options: [{ label: '12 m/s', holds: (e) => near(e.v, 12), why: 'Double the force, double the acceleration (6 m/s²) for the same time: 12 m/s.' }, { label: '6 m/s', holds: (e) => near(e.v, 6), why: 'That was for 6 N. Twice the force for the same time gives twice the change in velocity.' }, { label: '24 m/s', holds: (e) => near(e.v, 24), why: 'The change is proportional to the force, so doubling it doubles the change (12 m/s), not quadruples it.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s: twice the force for the same time gave twice the change of velocity.` },
    ],
    lesson: 'For the same time, a larger force gives a larger change of velocity and a larger change of momentum. After the pulse the net force is zero, so the cart keeps its velocity (the first law).',
  },
  {
    id: 'N', title: 'Changes in momentum', goal: 'Apply the same 5 N pulse for 3 s to a light and a heavy cart. Compare the changes in velocity and in momentum.',
    routes: [
      { id: 'n1', label: 'A 1 kg cart at rest gets 5 N for 3 s (frictionless)', setup: base({ massKg: 1, forceA: 5, pulseS: 3 }), tEnd: 6,
        prompt: 'The momentum of the 1 kg cart after the pulse is:',
        options: [{ label: '15 kg m/s', holds: (e) => near(e.v * 1, 15), why: 'a = 5 m/s² for 3 s: v = 15 m/s, p = 1 × 15 = 15 kg m/s. This equals force × time = 5 × 3.' }, { label: '5 kg m/s', holds: (e) => near(e.v, 5), why: '5 is the force in newtons. The momentum gained is force × time = 5 N × 3 s = 15 kg m/s.' }, { label: '3 kg m/s', holds: (e) => near(e.v, 3), why: '3 s is the time. Momentum gained = force × time = 15 kg m/s.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s, momentum ${r2(e.v)} kg m/s = 5 N × 3 s.` },
      { id: 'n2', label: 'A 5 kg cart at rest gets the same 5 N for 3 s (frictionless)', setup: base({ massKg: 5, forceA: 5, pulseS: 3 }), tEnd: 6,
        prompt: 'The momentum of the 5 kg cart after the same pulse is:',
        options: [{ label: '15 kg m/s, the same as the 1 kg cart', holds: (e) => near(5 * e.v, 15), why: 'The same force for the same time changes the momentum by the same amount, whatever the mass. The heavier cart just ends up with a smaller velocity (3 m/s).' }, { label: '75 kg m/s, because it is heavier', holds: (e) => near(5 * e.v, 75), why: 'A heavier cart is not given more momentum by the same pulse: momentum gained = force × time = 15 kg m/s.' }, { label: '3 kg m/s', holds: (e) => near(5 * e.v, 3), why: '3 m/s is the velocity of the heavy cart; its momentum is 5 × 3 = 15 kg m/s.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s but momentum ${r2(5 * e.v)} kg m/s: the same change in momentum as the light cart, because the force and the time are the same.` },
    ],
    lesson: 'The change in momentum is force × time, whatever the mass: the same pulse gives a light cart and a heavy cart the same momentum, but the heavy cart gets the smaller velocity.',
  },
  {
    id: 'O', title: 'A force that opposes the velocity', goal: 'Push a moving cart against its motion, then keep pushing. A negative force does not always slow a cart down: it depends on the direction of the velocity.',
    routes: [
      { id: 'o1', label: 'A 2 kg cart moving right at 6 m/s gets a constant 4 N to the left (frictionless)', setup: base({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: 6 }), tEnd: 3,
        prompt: 'After 3 s the cart\'s velocity is:',
        options: [{ label: '0: it has just stopped', holds: (e) => near(e.v, 0), why: 'a = −4 ÷ 2 = −2 m/s². The velocity falls 2 m/s every second: 6, 4, 2, 0 after 3 s.' }, { label: '6 m/s, unchanged', holds: (e) => near(e.v, 6), why: 'There is a net force of 4 N, so the velocity changes.' }, { label: '−6 m/s', holds: (e) => near(e.v, -6), why: 'It reaches zero after 3 s; it has not yet reversed.' }],
        explain: (e) => `The force is against the velocity, so the speed falls to ${r2(e.v)} m/s at 3 s. The force does not stop acting: after this instant it will start moving the cart to the left.` },
      { id: 'o2', label: 'The same cart and force, followed for 6 s (frictionless)', setup: base({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: 6 }), tEnd: 6,
        prompt: 'After 6 s the velocity is:',
        options: [{ label: '−6 m/s: it has reversed and is speeding up to the left', holds: (e) => near(e.v, -6), why: 'The acceleration is still −2 m/s², so from 6 m/s the velocity goes 6, 4, 2, 0, −2, −4, −6. Now the force and the velocity both point left: the cart speeds up.' }, { label: '0: it stays stopped', holds: (e) => near(e.v, 0), why: 'The net force is still 4 N to the left, so the cart cannot stay at rest.' }, { label: '6 m/s again', holds: (e) => near(e.v, 6), why: 'The velocity changes at a steady −2 m/s each second, so it is −6 m/s, not 6 m/s.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s: the same negative force first slowed the cart and then sped it up (to the left) once it moved left. A negative force slows an object only while the velocity is positive.` },
      { id: 'o3', label: 'A 2 kg cart moving LEFT at 2 m/s gets 4 N to the left (frictionless)', setup: base({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: -2 }), tEnd: 2,
        prompt: 'This negative force on a cart moving left will make it:',
        options: [{ label: 'speed up (to the left): the velocity becomes −6 m/s after 2 s', holds: (e) => near(e.v, -6), why: 'The force and the velocity point the same way (both left), so the speed increases by 2 m/s each second.' }, { label: 'slow down, because the force is negative', holds: (e) => Math.abs(e.v) < 2 - 1e-9, why: 'A negative force slows a cart only if the velocity is positive. Here the velocity is negative too.' }, { label: 'keep its velocity', holds: (e) => near(e.v, -2), why: 'The net force is not zero.' }],
        explain: (e) => `The velocity changes from −2 to ${r2(e.v)} m/s: the speed rises because the force points the way the cart is moving.` },
    ],
    lesson: 'The acceleration points the way the net force points, not necessarily the way the object moves. A force against the velocity slows the object; a force along the velocity speeds it up, whichever sign they have.',
  },
];

export const secondLawExperimentById = (id: string | null | undefined): SecondLawExperiment | undefined => SECOND_LAW_EXPERIMENTS.find((e) => e.id === id);

export function secondLawOutcome(r: FirstLawRoute) {
  const start = sampleAtTime(r.setup, 0, r.tEnd), end = sampleAtTime(r.setup, r.tEnd, r.tEnd);
  return { start, end, holdsIndex: r.options.map((o) => o.holds(end, start)).indexOf(true) };
}
