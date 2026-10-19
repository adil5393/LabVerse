/**
 * Guided investigations for the Force Laboratory (PHY-2A), each following
 * Predict → Experiment → Observe → Explain. They are optional: the Free Laboratory needs none of them.
 * A prediction option "holds" when the MODEL's outcome satisfies it, so the observation is computed from the same
 * model the cart is drawn from; the tests check that exactly one option holds for every route.
 */

import { DEFAULT_SETUP, sampleAtTime, stopTime, type Sample, type Setup } from './forceModel';

export interface PredictionOption { label: string; holds: (end: Sample, start: Sample) => boolean; why: string }

export interface ForceRoute {
  id: string;
  label: string;
  setup: Setup;
  /** Simulated time (s) at which the outcome is read. */
  tEnd: number;
  prompt: string;
  options: PredictionOption[];
  /** Plain-language explanation shown after the experiment (the model's reasoning, not a proof). */
  explain: (end: Sample, start: Sample) => string;
}

export interface ForceExperiment {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  title: string;
  goal: string;
  routes: ForceRoute[];
  lesson: string;
}

const base = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => String(Math.round(n * 100) / 100);

export const FORCE_EXPERIMENTS: ForceExperiment[] = [
  {
    id: 'A', title: 'Equal and opposite forces', goal: 'Two equal pushes act on the cart in opposite directions. Predict what happens to its velocity.',
    routes: [
      { id: 'a1', label: 'Cart at rest: 10 N to the right and 10 N to the left (2 kg, no friction)', setup: base({ massKg: 2, forceA: 10, forceB: 10, dirB: 'left' }), tEnd: 5,
        prompt: 'The cart starts at rest. After 5 s its velocity will be:',
        options: [
          { label: 'Still zero', holds: (e) => near(e.v, 0), why: 'The forces are equal and opposite, so the net force is zero and the velocity does not change.' },
          { label: 'Positive: moving to the right', holds: (e) => e.v > 1e-9, why: 'The rightward push is cancelled by an equal leftward push, so there is nothing to speed the cart up to the right.' },
          { label: 'Negative: moving to the left', holds: (e) => e.v < -1e-9, why: 'The leftward push is cancelled by an equal rightward push.' },
        ],
        explain: (e) => `The pushes add up to ${r2(e.forceA + e.forceB)} N: balanced forces. With zero net force the acceleration is ${r2(e.a)} m/s², so the velocity stays ${r2(e.v)} m/s.` },
      { id: 'a2', label: 'Cart moving at 3 m/s: 10 N to the right and 10 N to the left (2 kg, no friction)', setup: base({ massKg: 2, forceA: 10, forceB: 10, dirB: 'left', startVelocity: 3 }), tEnd: 5,
        prompt: 'The cart starts at 3 m/s with the same balanced forces. After 5 s its velocity will be:',
        options: [
          { label: 'Still 3 m/s', holds: (e) => near(e.v, 3), why: 'Zero net force means no change in velocity, even for a moving cart: balanced forces do not make a moving object stop.' },
          { label: 'Zero: the cart stops', holds: (e) => near(e.v, 0), why: 'Nothing slows the cart down. Only an unbalanced force changes velocity.' },
          { label: 'More than 3 m/s', holds: (e) => e.v > 3 + 1e-9, why: 'There is no net force to speed it up.' },
        ],
        explain: (e) => `The net force is ${r2(e.net)} N, so the cart keeps its velocity of ${r2(e.v)} m/s. Balanced forces do not change velocity; they do not make it zero.` },
    ],
    lesson: 'Balanced forces (zero net force) do not change the velocity: a cart at rest stays at rest and a moving cart keeps moving at a constant velocity.',
  },
  {
    id: 'B', title: 'Unbalanced forces', goal: 'Make one push bigger than the other. Predict the direction and size of the acceleration.',
    routes: [
      { id: 'b1', label: 'Cart at rest: 10 N to the right and 6 N to the left (2 kg, no friction)', setup: base({ massKg: 2, forceA: 10, forceB: 6, dirB: 'left' }), tEnd: 3,
        prompt: 'What is the acceleration of the cart?',
        options: [
          { label: '2 m/s² to the right', holds: (_e, s) => near(s.a, 2), why: 'Net force = 10 − 6 = 4 N to the right, the direction of the larger force; 4 N ÷ 2 kg = 2 m/s² to the right.' },
          { label: '2 m/s² to the left', holds: (_e, s) => near(s.a, -2), why: 'The net force points the way of the larger force, to the right.' },
          { label: 'Zero', holds: (_e, s) => near(s.a, 0), why: 'The forces are not equal, so they do not balance.' },
        ],
        explain: (e, s) => `Net force = ${r2(s.net)} N, mass 2 kg, so the acceleration is ${r2(s.a)} m/s² in the direction of the net force. After 3 s the velocity is ${r2(e.v)} m/s.` },
      { id: 'b2', label: 'Cart at rest: 6 N to the right and 10 N to the left (2 kg, no friction)', setup: base({ massKg: 2, forceA: 6, forceB: 10, dirB: 'left' }), tEnd: 3,
        prompt: 'Now the larger force is on the left. What is the acceleration?',
        options: [
          { label: '2 m/s² to the left', holds: (_e, s) => near(s.a, -2), why: 'Net force = 4 N to the left, so the acceleration points left.' },
          { label: '2 m/s² to the right', holds: (_e, s) => near(s.a, 2), why: 'The acceleration points the way of the net force, which is the larger force: to the left.' },
          { label: 'Zero', holds: (_e, s) => near(s.a, 0), why: 'The forces are unequal.' },
        ],
        explain: (e, s) => `Net force = ${r2(s.net)} N, so the acceleration is ${r2(s.a)} m/s². The cart ends at ${r2(e.v)} m/s.` },
    ],
    lesson: 'An unbalanced force gives a net force in the direction of the larger force, and the cart accelerates in that direction.',
  },
  {
    id: 'C', title: 'Same force, different mass', goal: 'Apply the same 8 N push to carts of different mass. Predict the acceleration.',
    routes: [
      { id: 'c1', label: '8 N to the right on a 1 kg cart (no friction)', setup: base({ massKg: 1, forceA: 8 }), tEnd: 3,
        prompt: 'The acceleration of the 1 kg cart is:',
        options: [{ label: '8 m/s²', holds: (_e, s) => near(s.a, 8), why: 'Net force 8 N ÷ 1 kg = 8 m/s².' }, { label: '4 m/s²', holds: (_e, s) => near(s.a, 4), why: 'That would be for a 2 kg cart.' }, { label: '2 m/s²', holds: (_e, s) => near(s.a, 2), why: 'That would be for a 4 kg cart.' }],
        explain: (_e, s) => `Net force ${r2(s.net)} N on ${r2(s.net / s.a)} kg gives ${r2(s.a)} m/s².` },
      { id: 'c2', label: '8 N to the right on a 4 kg cart (no friction)', setup: base({ massKg: 4, forceA: 8 }), tEnd: 3,
        prompt: 'The same push on a cart with four times the mass gives an acceleration of:',
        options: [{ label: '2 m/s²', holds: (_e, s) => near(s.a, 2), why: 'The heavier cart accelerates less: 8 N ÷ 4 kg = 2 m/s², a quarter of 8 m/s².' }, { label: '8 m/s²', holds: (_e, s) => near(s.a, 8), why: 'Mass matters: the same force gives a smaller acceleration to a larger mass.' }, { label: '32 m/s²', holds: (_e, s) => near(s.a, 32), why: 'A larger mass accelerates less, not more.' }],
        explain: (e, s) => `The same net force ${r2(s.net)} N on a larger mass gives a smaller acceleration, ${r2(s.a)} m/s²; after 3 s the cart is moving at only ${r2(e.v)} m/s.` },
    ],
    lesson: 'For the same net force, a cart with more mass accelerates less. (The exact rule, Newton\'s second law, comes in a later milestone; here you only observe the pattern.)',
  },
  {
    id: 'D', title: 'Friction and surfaces', goal: 'Give the cart a push of 6 m/s, then let it slide with no push on different surfaces. Compare how far it goes.',
    routes: [
      { id: 'd1', label: 'Sliding at 6 m/s on ice, no push (2 kg)', setup: base({ massKg: 2, surfaceId: 'ice', startVelocity: 6 }), tEnd: 25,
        prompt: 'On ice (very little friction) the cart will:',
        options: [
          { label: 'Slide a long way (about 20 s, 60 m) before stopping', holds: (e) => near(stopTime(base({ massKg: 2, surfaceId: 'ice', startVelocity: 6 }), 25) ?? -1, 20, 0.05) && near(e.x, 60, 0.01), why: 'Kinetic friction on ice is small (0.6 N here), so the velocity falls slowly.' },
          { label: 'Stop after about 2 s (6 m)', holds: (e) => near(e.x, 6, 0.01), why: 'That is the wooden table; ice has much less friction.' },
          { label: 'Never stop', holds: (e) => e.v > 1e-9, why: 'Ice is slippery but still has friction, so the cart slows and stops.' },
        ],
        explain: (e) => `Only the friction force acts on the cart horizontally, so it slows down gently and stops at ${r2(e.x)} m.` },
      { id: 'd2', label: 'Sliding at 6 m/s on a wooden table, no push (2 kg)', setup: base({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }), tEnd: 25,
        prompt: 'On the wooden table the cart will:',
        options: [
          { label: 'Stop after about 2 s, 6 m', holds: (e) => near(e.x, 6, 0.01) && near(e.v, 0), why: 'Friction of 6 N gives a deceleration of 3 m/s², so it stops in 2 s.' },
          { label: 'Slide a long way (60 m)', holds: (e) => near(e.x, 60, 0.01), why: 'That is the ice case; the table has about ten times as much friction.' },
          { label: 'Never stop', holds: (e) => e.v > 1e-9, why: 'Friction is present, so the cart stops.' },
        ],
        explain: (e) => `Friction acts opposite to the sliding, so the velocity falls to zero and stays there: the cart rests at ${r2(e.x)} m.` },
      { id: 'd3', label: 'Sliding at 6 m/s on a frictionless surface, no push (2 kg)', setup: base({ massKg: 2, surfaceId: 'frictionless', startVelocity: 6 }), tEnd: 25,
        prompt: 'On the idealised frictionless surface the cart will:',
        options: [
          { label: 'Never stop: keep 6 m/s', holds: (e) => near(e.v, 6), why: 'With no friction and no push there is no force at all, so the velocity stays constant. No real surface is perfectly frictionless.' },
          { label: 'Stop after a long time', holds: (e) => near(e.v, 0), why: 'Nothing acts on the cart to slow it down in this idealised model.' },
          { label: 'Speed up', holds: (e) => e.v > 6 + 1e-9, why: 'There is no force to speed it up.' },
        ],
        explain: (e) => `There is no friction and no push, so the net force is zero and the velocity stays ${r2(e.v)} m/s. This is an idealised model; a real surface always has some friction.` },
      { id: 'd4', label: 'At rest on a wooden table, gently pushed with 3 N (2 kg; the largest static friction is 8 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 3 }), tEnd: 5,
        prompt: 'A gentle 3 N push on the resting cart will:',
        options: [
          { label: 'Not move it: static friction balances the push', holds: (e) => near(e.x, 0) && near(e.v, 0), why: 'Static friction on a resting cart matches the push, up to a limit. Here 3 N is below the 8 N limit, so the net force is zero.' },
          { label: 'Make it accelerate slowly', holds: (e) => e.v > 1e-9, why: 'The push is smaller than the largest friction, so the friction cancels it.' },
          { label: 'Move it at a constant velocity', holds: (e) => e.v > 1e-9 && near(e.a, 0), why: 'It does not start moving at all.' },
        ],
        explain: (e) => `Friction pushes back with ${r2(Math.abs(e.friction))} N, exactly the push, so the net force is ${r2(e.net)} N and the cart stays at rest. You need a bigger force to start it moving.` },
      { id: 'd5', label: 'At rest on a wooden table, pushed with 12 N (2 kg; the largest static friction is 8 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 12 }), tEnd: 3,
        prompt: 'A 12 N push on the resting cart will:',
        options: [
          { label: 'Make it slide and accelerate at 3 m/s²', holds: (_e, s) => near(s.a, 3), why: 'The push beats friction: net force = 12 − 6 (sliding friction) = 6 N, and 6 ÷ 2 = 3 m/s².' },
          { label: 'Not move it', holds: (e) => near(e.v, 0), why: '12 N is more than the largest static friction (8 N), so the cart starts sliding.' },
          { label: 'Make it accelerate at 6 m/s²', holds: (_e, s) => near(s.a, 6), why: 'That ignores friction: the net force is 12 − 6 = 6 N, giving 3 m/s².' },
        ],
        explain: (e, s) => `The push is larger than the friction, so a net force of ${r2(s.net)} N acts forwards and the cart accelerates at ${r2(s.a)} m/s²; after 3 s it moves at ${r2(e.v)} m/s.` },
    ],
    lesson: 'Friction is a contact force that depends on the surfaces: less friction means the cart slows more gradually and slides farther. On a resting cart friction can match a gentle push, so nothing moves. The frictionless surface is an idealisation.',
  },
  {
    id: 'E', title: 'Moving without a net force', goal: 'Give the cart a starting velocity and make the net force zero. Predict its velocity.',
    routes: [
      { id: 'e1', label: 'Moving at 4 m/s, no pushes, frictionless (2 kg)', setup: base({ massKg: 2, startVelocity: 4 }), tEnd: 10,
        prompt: 'With no force at all, after 10 s the cart\'s velocity is:',
        options: [
          { label: '4 m/s, unchanged', holds: (e) => near(e.v, 4), why: 'Zero net force: the velocity does not change, so the cart keeps moving.' },
          { label: 'Smaller: it slows down by itself', holds: (e) => e.v < 4 - 1e-9 && e.v >= 0, why: 'A moving object does not need a force to keep going; it slows only if an unbalanced force (such as friction) acts.' },
          { label: 'Zero: motion needs a force', holds: (e) => near(e.v, 0), why: 'Continuing to move at a constant velocity does not need a force.' },
        ],
        explain: (e) => `There is no net force, so the velocity stays ${r2(e.v)} m/s and the cart is ${r2(e.x)} m from the start after ${r2(e.t)} s.` },
      { id: 'e2', label: 'Moving at 4 m/s on a wooden table, pushed forward with 6 N (2 kg; friction is 6 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 6, startVelocity: 4 }), tEnd: 10,
        prompt: 'The push equals the sliding friction. After 10 s the cart\'s velocity is:',
        options: [
          { label: '4 m/s, unchanged', holds: (e) => near(e.v, 4), why: 'The push (6 N forward) and the friction (6 N backward) balance, so the net force is zero and the velocity is constant.' },
          { label: 'Zero: friction stops it', holds: (e) => near(e.v, 0), why: 'Friction is balanced by the push, so it cannot slow the cart.' },
          { label: 'Larger: the push speeds it up', holds: (e) => e.v > 4 + 1e-9, why: 'The push is cancelled by friction.' },
        ],
        explain: (e, s) => `Push 6 N forward and friction ${r2(Math.abs(s.friction))} N backward: net ${r2(s.net)} N. The velocity stays ${r2(e.v)} m/s. To keep a cart moving at a constant velocity against friction you must push with exactly the friction force.` },
    ],
    lesson: 'No net force means no change in velocity: a moving cart keeps its velocity. On a rough surface you can still have zero net force if the push equals the friction.',
  },
];

export const forceExperimentById = (id: string | null | undefined): ForceExperiment | undefined => FORCE_EXPERIMENTS.find((e) => e.id === id);

export interface RouteOutcome { start: Sample; end: Sample; holdsIndex: number }

/** The model's outcome for a route and which prediction option it supports (exactly one by construction). */
export function routeOutcome(r: ForceRoute): RouteOutcome {
  const start = sampleAtTime(r.setup, 0, r.tEnd), end = sampleAtTime(r.setup, r.tEnd, r.tEnd);
  const holds = r.options.map((o) => o.holds(end, start));
  return { start, end, holdsIndex: holds.indexOf(true) };
}
