/**
 * First-law investigations F to J (PHY-2B). They extend the PHY-2A investigations A to E (kept unchanged) and follow the same
 * Predict → Experiment → Observe → Explain pattern, judged by the same model. F to I use the Force Laboratory cart; J uses the
 * simple braking demonstration in vehicle.ts. None of them introduces the formal second law: the pulse comparison (I) only
 * observes that, for the same force pulse, a larger mass changes its velocity less.
 */

import { DEFAULT_SETUP, sampleAtTime, type Sample, type Setup } from './forceModel';
import type { PredictionOption } from './experiments';
import { brakingAt, DEFAULT_BRAKING, endTime, GAP_M, type BrakingSample, type BrakingSetup } from './vehicle';

export interface FirstLawRoute {
  id: string;
  label: string;
  setup: Setup;
  tEnd: number;
  prompt: string;
  options: PredictionOption[];
  explain: (end: Sample, start: Sample) => string;
}

export interface FirstLawExperiment {
  id: 'F' | 'G' | 'H' | 'I' | 'J';
  title: string;
  goal: string;
  /** Cart routes (F to I). */
  routes: FirstLawRoute[];
  lesson: string;
}

const base = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => String(Math.round(n * 100) / 100);

export const FIRST_LAW_EXPERIMENTS: FirstLawExperiment[] = [
  {
    id: 'F', title: 'Motion without a driving force', goal: 'Give the cart a starting velocity on an ideal frictionless track, then apply no force at all. Predict what happens to its velocity.',
    routes: [{
      id: 'f1', label: 'Moving right at 4 m/s on a frictionless track, no pushes (2 kg)', setup: base({ massKg: 2, startVelocity: 4 }), tEnd: 10,
      prompt: 'With no force acting on it, after 10 s the cart\'s velocity will be:',
      options: [
        { label: '4 m/s to the right, unchanged', holds: (e) => near(e.v, 4), why: 'The net force is zero, so the acceleration is zero and the velocity does not change. A moving object does not need a forward force to keep moving.' },
        { label: 'Smaller: it slows down gradually', holds: (e) => e.v >= 0 && e.v < 4 - 1e-9, why: 'Slowing down needs an unbalanced force against the motion, such as friction. There is none on this idealised track.' },
        { label: 'Zero: it stops by itself', holds: (e) => near(e.v, 0), why: 'Nothing acts on the cart to stop it. Motion does not "run out" by itself.' },
      ],
      explain: (e, s) => `The net force is ${r2(s.net)} N and the acceleration is ${r2(s.a)} m/s², so the velocity stays ${r2(e.v)} m/s and the cart has moved ${r2(e.x)} m in ${r2(e.t)} s. A frictionless track is an idealised model: no real surface is perfectly frictionless.`,
    }],
    lesson: 'With zero net force a moving object keeps its velocity: no forward force is needed to keep it moving. (The frictionless track is an idealisation.)',
  },
  {
    id: 'G', title: 'Zero net force, different starting velocities', goal: 'Make the net force zero (5 N each way) and compare a cart at rest, one moving right and one moving left.',
    routes: [
      { id: 'g1', label: 'At rest: 5 N right and 5 N left (2 kg, frictionless)', setup: base({ massKg: 2, forceA: 5, forceB: 5, startVelocity: 0 }), tEnd: 8,
        prompt: 'After 8 s the cart that started at rest:',
        options: [{ label: 'is still at rest', holds: (e) => near(e.v, 0) && near(e.x, 0), why: 'Zero net force: an object at rest remains at rest.' }, { label: 'has started to move to the right', holds: (e) => e.v > 1e-9, why: 'The rightward push is cancelled by the leftward one, so nothing accelerates the cart.' }, { label: 'has started to move to the left', holds: (e) => e.v < -1e-9, why: 'The leftward push is cancelled by the rightward one.' }],
        explain: (e) => `The net force is zero, so the velocity stays ${r2(e.v)} m/s and the cart is still at ${r2(e.x)} m.` },
      { id: 'g2', label: 'Moving right at 3 m/s: 5 N right and 5 N left (2 kg, frictionless)', setup: base({ massKg: 2, forceA: 5, forceB: 5, startVelocity: 3 }), tEnd: 8,
        prompt: 'After 8 s the cart that started at 3 m/s to the right has a velocity of:',
        options: [{ label: '3 m/s to the right', holds: (e) => near(e.v, 3), why: 'Zero net force: the velocity stays the same.' }, { label: 'Zero', holds: (e) => near(e.v, 0), why: 'Balanced forces do not stop a moving cart.' }, { label: 'More than 3 m/s', holds: (e) => e.v > 3 + 1e-9, why: 'There is no net force to speed it up.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s, position ${r2(e.x)} m: it covered 3 m every second.` },
      { id: 'g3', label: 'Moving left at 3 m/s: 5 N right and 5 N left (2 kg, frictionless)', setup: base({ massKg: 2, forceA: 5, forceB: 5, startVelocity: -3 }), tEnd: 8,
        prompt: 'After 8 s the cart that started at 3 m/s to the left has a velocity of:',
        options: [{ label: '3 m/s to the left (−3 m/s)', holds: (e) => near(e.v, -3), why: 'Zero net force: the velocity, including its direction, stays the same.' }, { label: 'Zero', holds: (e) => near(e.v, 0), why: 'Balanced forces do not stop a moving cart.' }, { label: '3 m/s to the right', holds: (e) => near(e.v, 3), why: 'Nothing reverses the cart: a force would be needed to change its direction.' }],
        explain: (e) => `Velocity ${r2(e.v)} m/s and position ${r2(e.x)} m: it keeps moving left at the same speed.` },
    ],
    lesson: 'With zero net force a cart at rest stays at rest, and a moving cart keeps its velocity (speed and direction), whichever way it moves.',
  },
  {
    id: 'H', title: 'The effect of friction', goal: 'Compare the same sliding cart on a frictionless surface and on a wooden table. Why does it slow down on one and not the other?',
    routes: [
      { id: 'h1', label: 'Sliding at 6 m/s on a frictionless surface, no pushes (2 kg)', setup: base({ massKg: 2, startVelocity: 6 }), tEnd: 10,
        prompt: 'After 10 s the cart on the frictionless surface:',
        options: [{ label: 'still moves at 6 m/s', holds: (e) => near(e.v, 6), why: 'No force acts, so the velocity does not change.' }, { label: 'has slowed down', holds: (e) => e.v < 6 - 1e-9, why: 'Slowing needs a force against the motion, and there is none.' }],
        explain: (e) => `With no friction the net force is zero and the velocity stays ${r2(e.v)} m/s.` },
      { id: 'h2', label: 'Sliding at 6 m/s on a wooden table, no pushes (2 kg)', setup: base({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }), tEnd: 10,
        prompt: 'On the wooden table the cart slows down because:',
        options: [
          { label: 'friction acts on it against its motion: an unbalanced force', holds: (e, s) => near(s.net, -6) && near(e.v, 0), why: 'Friction (6 N here) is the only horizontal force, so the net force is not zero and the cart accelerates backwards (a deceleration) until it stops.' },
          { label: 'moving objects slowly run out of motion', holds: () => false, why: 'There is no "supply" of motion that runs out. An object slows only when an unbalanced force such as friction acts.' },
          { label: 'the cart needs a forward force to keep moving, and there is none', holds: () => false, why: 'A forward force is not needed to keep moving. The cart slows because friction pushes against its motion.' },
        ],
        explain: (e, s) => `Friction of ${r2(Math.abs(s.friction))} N acts against the sliding, so the net force is ${r2(s.net)} N and the cart decelerates at ${r2(Math.abs(s.a))} m/s² until it stops at ${r2(e.x)} m. The cart does not need a force to keep moving; it needs one to be slowed.` },
    ],
    lesson: 'Moving objects slow down in everyday life because friction (or another resistance) is an unbalanced force against their motion. Remove it and the velocity is constant.',
  },
  {
    id: 'I', title: 'Inertia and mass', goal: 'Give carts of different mass the same force pulse (8 N for 1 s) and compare how much their velocity changes.',
    routes: [1, 2, 4].map((m, i) => ({
      id: `i${i + 1}`, label: `A ${m} kg cart at rest gets an 8 N push for 1 s (frictionless)`, setup: base({ massKg: m, forceA: 8, pulseS: 1 }), tEnd: 5,
      prompt: `After the pulse the ${m} kg cart moves at:`,
      options: [8, 4, 2].map((v) => ({ label: `${v} m/s`, holds: (e: Sample) => near(e.v, v), why: m === 1 ? 'The 1 kg cart changes its velocity the most: 8 m/s.' : m === 2 ? 'Twice the mass, half the velocity change: 4 m/s.' : 'Four times the mass, a quarter of the velocity change: 2 m/s.' })),
      explain: (e: Sample) => `The same pulse changed the velocity of the ${m} kg cart by ${r2(e.v)} m/s. After the pulse the net force is zero, so the velocity stays constant. A cart with more mass resists a change of velocity more: it has more inertia.`,
    })),
    lesson: 'For the same force pulse, a cart with more mass changes its velocity less: mass is a measure of inertia, the resistance to a change of velocity. A heavier cart does not move faster; it is harder to speed up or slow down. (The exact relationship is for the second law, a later lesson.)',
  },
  {
    id: 'J', title: 'Sudden braking and inertia', goal: 'A vehicle brakes suddenly. Follow a passenger with and without a belt, relative to the road and relative to the vehicle.',
    routes: [],
    lesson: 'When the vehicle slows, nothing pushes the unrestrained passenger forwards: they keep the velocity they had (inertia) while the seat slows under them. A belt supplies a backward force that slows the passenger with the vehicle. This is a simplified model, not crash safety data.',
  },
];

export const firstLawExperimentById = (id: string | null | undefined): FirstLawExperiment | undefined => FIRST_LAW_EXPERIMENTS.find((e) => e.id === id);

export function firstLawOutcome(r: FirstLawRoute) {
  const start = sampleAtTime(r.setup, 0, r.tEnd), end = sampleAtTime(r.setup, r.tEnd, r.tEnd);
  return { start, end, holdsIndex: r.options.map((o) => o.holds(end, start)).indexOf(true) };
}

// ---- J: braking routes ----

export interface BrakingOption { label: string; holds: (end: BrakingSample, setup: BrakingSetup) => boolean; why: string }
export interface BrakingRoute { id: string; label: string; setup: BrakingSetup; prompt: string; options: BrakingOption[]; explain: (end: BrakingSample, setup: BrakingSetup) => string }

export const BRAKING_ROUTES: BrakingRoute[] = [
  {
    id: 'j1', label: 'A passenger with no belt, vehicle at 15 m/s braking at 5 m/s²', setup: { ...DEFAULT_BRAKING, restrained: false },
    prompt: 'The vehicle brakes. Relative to the road, what happens to the unbelted passenger just after braking starts?',
    options: [
      { label: 'They keep moving at 15 m/s (nothing slows them)', holds: (e, s) => Math.abs(e.passengerV - s.speed) < 1e-9, why: 'No horizontal force acts on them, so by the first law their velocity does not change. They appear to move forward only because the vehicle slows under them.' },
      { label: 'They are pushed forward by a new forward force', holds: () => false, why: 'No new forward force appears when a vehicle brakes. The passenger simply keeps the velocity they had, while the vehicle slows.' },
      { label: 'They slow down with the vehicle automatically', holds: () => false, why: 'To slow down they need a backward force, and with nothing holding them (no belt, a slippery seat) there is none.' },
    ],
    explain: (e) => `The passenger's velocity relative to the road stays ${Math.round(e.passengerV * 100) / 100} m/s while the vehicle slows, so they move ${Math.round(e.relative * 100) / 100} m forward of their seat; the model stops after a gap of ${GAP_M} m, before any contact. This is inertia: the tendency to keep the same velocity.`,
  },
  {
    id: 'j2', label: 'A passenger wearing a belt, same braking', setup: { ...DEFAULT_BRAKING, restrained: true },
    prompt: 'Now the passenger wears a belt. Compared with the vehicle, the passenger:',
    options: [
      { label: 'slows down with the vehicle because the belt exerts a backward force on them', holds: (e) => Math.abs(e.relative) < 1e-9 && e.passengerForce < 0, why: 'The belt provides the backward force the passenger needs to change velocity along with the vehicle.' },
      { label: 'still keeps moving at the old velocity', holds: () => false, why: 'The belt is an external force. It changes the passenger\'s velocity so they slow down together with the vehicle.' },
      { label: 'is pushed forward even harder', holds: () => false, why: 'There is still no forward force; the belt exerts a backward one.' },
    ],
    explain: (_e, s) => `The belt exerts a backward force of ${Math.round(s.passengerMassKg * s.decel)} N (the passenger's mass × the vehicle's deceleration in this model), so the passenger's velocity falls with the vehicle's and they do not move forward relative to the seat. Real belts stretch and real forces vary; this is a teaching model.`,
  },
];

export function brakingOutcome(r: BrakingRoute): { end: BrakingSample; holdsIndex: number } {
  const t = r.setup.restrained ? 2.5 : endTime(r.setup);
  const end = brakingAt(r.setup, t);
  return { end, holdsIndex: r.options.map((o) => o.holds(end, r.setup)).indexOf(true) };
}
