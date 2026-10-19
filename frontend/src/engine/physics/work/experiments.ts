/**
 * Guided investigations A to E for the Work Laboratory (PHY-3A). Each follows Predict, Experiment, Observe, Explain. Exactly one
 * prediction option holds in the model for every route, and the explanation is built from the same result that is drawn.
 * The displacement is prescribed (a kinematic work model); the routes are chosen so that the forces are also dynamically sensible.
 */

import { computeWork, DEFAULT_WORK, fmt, fmtSigned, type WorkResult, type WorkSetup } from './workModel';

export interface WorkOption { label: string; holds: (r: WorkResult) => boolean; why: string }
export interface WorkRoute { id: string; label: string; setup: WorkSetup; prompt: string; options: WorkOption[]; explain: (r: WorkResult) => string }
export interface WorkExperiment { id: 'A' | 'B' | 'C' | 'D' | 'E'; title: string; goal: string; routes: WorkRoute[]; lesson: string }

const s = (o: Partial<WorkSetup>): WorkSetup => ({ ...DEFAULT_WORK, ...o });
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const J = (n: number) => `${fmtSigned(n)} J`;

export const WORK_EXPERIMENTS: WorkExperiment[] = [
  {
    id: 'A', title: 'Force and displacement', goal: 'Find how the work done by a force along the displacement depends on the size of the force and on the displacement.',
    routes: [
      { id: 'a1', label: 'A 10 N push to the right moves a box 3 m to the right on a smooth track', setup: s({ forceN: 10, displacement: 3 }), prompt: 'How much work does the push do on the box?',
        options: [{ label: '30 J', holds: (r) => near(r.appliedWork, 30), why: 'W = F × s = 10 N × 3 m = 30 J: the force and displacement are in the same direction.' }, { label: '13 J', holds: (r) => near(r.appliedWork, 13), why: 'Work is the product of force and displacement, not their sum.' }, { label: '3.3 J', holds: (r) => near(r.appliedWork, 10 / 3), why: 'Work is the force multiplied by the displacement; dividing would not give joules.' }],
        explain: (r) => `The push does ${J(r.appliedWork)} (${fmt(r.applied.alongAxis)} N × ${fmt(r.setup.displacement)} m).` },
      { id: 'a2', label: 'The same 3 m displacement, but the push is doubled to 20 N', setup: s({ forceN: 20, displacement: 3 }), prompt: 'Compared with 30 J, the work done by the push is:',
        options: [{ label: 'twice as much (60 J)', holds: (r) => near(r.appliedWork, 60), why: 'Work is proportional to the force for the same displacement: 20 N × 3 m = 60 J.' }, { label: 'the same (30 J)', holds: (r) => near(r.appliedWork, 30), why: 'The displacement is unchanged but the force is larger, so the work is larger.' }],
        explain: (r) => `With 20 N the work is ${J(r.appliedWork)}: twice the force, twice the work.` },
      { id: 'a3', label: 'You lift a 5 kg bag slowly, straight up, by 3 m (the lifting force equals the weight, 50 N)', setup: s({ axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 3, startPos: 0, massKg: 5 }), prompt: 'How much work does your lifting force do on the bag?',
        options: [{ label: '150 J', holds: (r) => near(r.appliedWork, 150), why: 'The lifting force is mg = 5 × 10 = 50 N, and W = 50 N × 3 m = 150 J. Lifting 3 m takes 3 times the work of lifting 1 m (50 J).' }, { label: '50 J', holds: (r) => near(r.appliedWork, 50), why: '50 N is the force; the displacement is 3 m, so multiply: 150 J.' }, { label: '15 J', holds: (r) => near(r.appliedWork, 15), why: 'The weight is 5 kg × 10 N/kg = 50 N, not 5 N, and work is force times displacement.' }],
        explain: (r) => `Your lifting force does ${J(r.appliedWork)}. Gravity does ${J(r.forces.find((f) => f.id === 'weight')!.work)} at the same time.` },
    ],
    lesson: 'For a force along the displacement, work = force × displacement. Doubling either one doubles the work, and the unit is the joule (1 J = 1 N × 1 m).',
  },
  {
    id: 'B', title: 'No displacement', goal: 'Find when a force that you apply does no work on an object.',
    routes: [
      { id: 'b1', label: 'You push a 5 kg block on wood with 10 N. The most that static friction can give is 15 N, so the block stays where it is', setup: s({ forceN: 10, displacement: 0, massKg: 5, surfaceId: 'wood' }), prompt: 'How much work does your push do on the block?',
        options: [{ label: '0 J: the block does not move', holds: (r) => near(r.appliedWork, 0), why: 'Work needs displacement. The block stays at rest, so s = 0 and W = 10 N × 0 m = 0 J.' }, { label: '10 J', holds: (r) => near(r.appliedWork, 10), why: 'A force alone does not do work; the object must also be displaced. Here it is not.' }],
        explain: (r) => `The block stays at rest (displacement ${fmt(r.setup.displacement)} m), so your push does ${J(r.appliedWork)}. Static friction pushes back with ${fmt(Math.abs(r.forces.find((f) => f.id === 'friction')?.fx ?? 0))} N and also does 0 J.` },
      { id: 'b2', label: 'You hold a 2 kg box still in your hands: your upward force is 20 N and the displacement is 0 m', setup: s({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 0, startPos: 1, massKg: 2 }), prompt: 'You get tired. How much mechanical work do you do ON THE BOX?',
        options: [{ label: '0 J: the box is not displaced', holds: (r) => near(r.appliedWork, 0), why: 'Your muscles use up energy and you tire, but work on the box needs displacement of the box.' }, { label: '20 J', holds: (r) => near(r.appliedWork, 20), why: 'Tiredness is not work done on the box. With no displacement of the box, W = 20 N × 0 m = 0 J.' }],
        explain: (r) => `With no displacement the work is ${J(r.appliedWork)}. The forces on the box add to ${fmt(r.netFy)} N, so it is in balance. Your body still uses internal energy, which is why you feel tired.` },
      { id: 'b3', label: 'A box slides 3 m to the right on a smooth floor with NO force applied by you (applied force 0 N)', setup: s({ forceN: 0, displacement: 3, massKg: 2 }), prompt: 'How much work does the applied force do?',
        options: [{ label: '0 J: the applied force is zero', holds: (r) => near(r.appliedWork, 0), why: 'If F = 0 then W = 0 × 3 m = 0 J, even though the box moves.' }, { label: '3 J', holds: (r) => near(r.appliedWork, 3), why: 'Work is force times displacement; with a zero force the product is zero.' }],
        explain: (r) => `With zero force the work is ${J(r.appliedWork)}, although the displacement is ${fmt(r.setup.displacement)} m.` },
    ],
    lesson: 'Work is done on an object only when a force acts AND the object is displaced along the force. A zero force or a zero displacement means zero work. Feeling tired is not the same as doing work on the object.',
  },
  {
    id: 'C', title: 'Positive and negative work', goal: 'Compare a force along the displacement with a force against it.',
    routes: [
      { id: 'c1', label: 'A 10 N push to the right; the box is displaced 3 m to the right', setup: s({ forceN: 10, displacement: 3 }), prompt: 'The work done by the push is:',
        options: [{ label: 'positive: +30 J', holds: (r) => near(r.appliedWork, 30), why: 'The displacement is in the direction of the force, so the work is positive.' }, { label: 'negative: −30 J', holds: (r) => near(r.appliedWork, -30), why: 'The displacement is along the force, not against it.' }],
        explain: (r) => `Force to the right, displacement to the right: ${J(r.appliedWork)}.` },
      { id: 'c2', label: 'The same 10 N push to the right, but the box (already sliding left) is displaced 3 m to the LEFT', setup: s({ forceN: 10, displacement: -3, startPos: 5 }), prompt: 'Now the work done by the push is:',
        options: [{ label: 'negative: −30 J', holds: (r) => near(r.appliedWork, -30), why: 'The displacement (left) is opposite to the force (right): W = 10 N × (−3 m) = −30 J.' }, { label: 'positive: +30 J', holds: (r) => near(r.appliedWork, 30), why: 'A force opposite to the displacement does negative work, like a goalkeeper stopping a ball.' }, { label: 'zero', holds: (r) => near(r.appliedWork, 0), why: 'There is a force and a displacement along the line of the force, so the work is not zero.' }],
        explain: (r) => `Force to the right, displacement to the left: ${J(r.appliedWork)}. The push takes energy away from the box. The model prescribes the displacement; for the box to move this far against the net force it needs at least ${fmt(r.minInitialKE)} J of kinetic energy to start with.` },
      { id: 'c3', label: 'You lift a 2 kg box slowly UP by 2 m. Your force is 20 N up. Then you lower it slowly back DOWN by 2 m with the same 20 N up', setup: s({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 2, startPos: 0, massKg: 2 }), prompt: 'Your hands do work on the box: going up, and then going down. The signs are:',
        options: [{ label: 'positive going up, negative going down', holds: (r) => r.appliedWork > 0, why: 'Up: force and displacement both up, +40 J. Down: the force is still up but the displacement is down, −40 J.' }, { label: 'positive both ways', holds: (r) => r.appliedWork < 0, why: 'On the way down your upward force is opposite to the downward displacement, so it is negative work.' }],
        explain: (r) => `Going up your hands do ${J(r.appliedWork)} and gravity does ${J(r.forces.find((f) => f.id === 'weight')!.work)}. Set the displacement to −2 m to see the way down: your hands then do ${J(-r.appliedWork)} and gravity does ${J(-r.forces.find((f) => f.id === 'weight')!.work)}.` },
    ],
    lesson: 'The sign of the work comes from the directions: along the displacement is positive, opposite to it is negative. The same force can do positive or negative work depending on which way the object is displaced.',
  },
  {
    id: 'D', title: 'A force perpendicular to the displacement', goal: 'Find why a force at right angles to the displacement does no work in this idealised case.',
    routes: [
      { id: 'd1', label: 'A 2 kg block slides 4 m to the right on a smooth track while a 10 N force pulls it straight UP (it stays on the track)', setup: s({ forceN: 10, angleDeg: 90, displacement: 4, massKg: 2 }), prompt: 'How much work does the upward pull do on the block?',
        options: [{ label: '0 J: the pull is perpendicular to the displacement', holds: (r) => near(r.appliedWork, 0), why: 'The block moves right, but the pull has no part along the displacement: W = 0.' }, { label: '40 J', holds: (r) => near(r.appliedWork, 40), why: 'The block is not displaced upward, so the upward pull gets no displacement in its own direction.' }],
        explain: (r) => `The upward pull does ${J(r.appliedWork)}. It does reduce the push the track gives (the normal force is ${fmt(r.forces.find((f) => f.id === 'normal')?.magnitude ?? 0)} N), but that is a force, not work.` },
      { id: 'd2', label: 'A girl carries a 2 kg box 4 m horizontally, holding it up with 20 N (equal to its weight)', setup: s({ forceN: 20, angleDeg: 90, displacement: 4, massKg: 2 }), prompt: 'How much work does the girl\'s upward force do on the box?',
        options: [{ label: '0 J', holds: (r) => near(r.appliedWork, 0), why: 'Her force is upward and the displacement is horizontal, so they are perpendicular.' }, { label: '80 J', holds: (r) => near(r.appliedWork, 80), why: 'Her force would do 20 N × 4 m only if the box moved 4 m upward; it moves horizontally.' }],
        explain: (r) => `Her upward force does ${J(r.appliedWork)}. Gravity also does ${J(r.forces.find((f) => f.id === 'weight')!.work)}. To speed the box up she would also need a horizontal force, and that force would do work.` },
      { id: 'd3', label: 'A 10 N force pushes a block straight DOWN onto the track while it slides 4 m to the right', setup: s({ forceN: 10, angleDeg: 270, displacement: 4, massKg: 2 }), prompt: 'How much work does the downward force do on the block?',
        options: [{ label: '0 J', holds: (r) => near(r.appliedWork, 0), why: 'Down is perpendicular to the horizontal displacement.' }, { label: '−40 J', holds: (r) => near(r.appliedWork, -40), why: 'The block is not displaced upward, so the downward force has no displacement along or against it.' }],
        explain: (r) => `The downward force does ${J(r.appliedWork)}. The normal force from the track rises to ${fmt(r.forces.find((f) => f.id === 'normal')?.magnitude ?? 0)} N, which also does 0 J.` },
    ],
    lesson: 'A force perpendicular to the displacement does zero work. Weight and the normal force do zero work on an object that moves horizontally. (For a force at another angle only its component along the displacement counts: that general rule is enrichment, found with the angle control.)',
  },
  {
    id: 'E', title: 'Work against friction', goal: 'Compare the work of the applied force, the work of friction and the net work.',
    routes: [
      { id: 'e1', label: 'A 10 N push moves a box 3 m to the right on a SMOOTH track', setup: s({ forceN: 10, displacement: 3, massKg: 5 }), prompt: 'There is no friction. The net work is:',
        options: [{ label: '+30 J, all from the push', holds: (r) => near(r.netWork, 30), why: 'Only the push does work (weight and the normal force are perpendicular), so the net work equals the work of the push.' }, { label: '0 J', holds: (r) => near(r.netWork, 0), why: 'Nothing takes energy away here, so the net work is not zero.' }],
        explain: (r) => `Push ${J(r.appliedWork)}, friction ${J(r.frictionWork)}, net ${J(r.netWork)}. Positive net work: the box gains kinetic energy.` },
      { id: 'e2', label: 'A 5 kg box on wood is pushed 4 m at a steady speed. The sliding friction is 0.3 × 50 N = 15 N, so the push is 15 N', setup: s({ forceN: 15, displacement: 4, massKg: 5, surfaceId: 'wood' }), prompt: 'The work done by the push, by friction, and the net work are:',
        options: [{ label: '+60 J, −60 J and net 0 J', holds: (r) => near(r.appliedWork, 60) && near(r.frictionWork, -60) && near(r.netWork, 0), why: 'Push: 15 N × 4 m = +60 J. Friction (15 N to the left, displacement to the right): −60 J. Net 0 J, so the speed does not change.' }, { label: '+60 J, −60 J and net 60 J', holds: (r) => near(r.netWork, 60), why: 'The net work is the sum of the work of every force: +60 + (−60) = 0, not 60.' }, { label: '+60 J, 0 J and net 60 J', holds: (r) => near(r.frictionWork, 0), why: 'Friction acts against the displacement over the whole 4 m, so it does negative work, not zero.' }],
        explain: (r) => `Push ${J(r.appliedWork)}, friction ${J(r.frictionWork)}, net ${J(r.netWork)}. The push does positive work; friction does the same amount of negative work; the net work is zero and the kinetic energy stays the same.` },
      { id: 'e3', label: 'The same box on wood is pushed with 20 N for the same 4 m', setup: s({ forceN: 20, displacement: 4, massKg: 5, surfaceId: 'wood' }), prompt: 'The net work is now:',
        options: [{ label: '+20 J', holds: (r) => near(r.netWork, 20), why: 'Push: 20 × 4 = +80 J. Friction: −15 × 4 = −60 J. Net = +20 J: the box speeds up.' }, { label: '+80 J', holds: (r) => near(r.netWork, 80), why: 'That is the work of the push alone. Friction still does −60 J, so the net work is 20 J.' }, { label: '0 J', holds: (r) => near(r.netWork, 0), why: 'The push (20 N) is more than the friction (15 N), so the net work is positive.' }],
        explain: (r) => `Push ${J(r.appliedWork)}, friction ${J(r.frictionWork)}, net ${J(r.netWork)}.` },
    ],
    lesson: 'Each force does its own work, with its own sign. Friction on a sliding object does negative work. The net work is the sum of all of them; it is zero when the push only just balances friction.',
  },
];

export const workExperimentById = (id: string | null | undefined): WorkExperiment | undefined => WORK_EXPERIMENTS.find((e) => e.id === id);

export function workRouteOutcome(r: WorkRoute) {
  const result = computeWork(r.setup);
  return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) };
}
