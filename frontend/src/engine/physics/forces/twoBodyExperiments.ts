/**
 * Third-law investigations P to T (PHY-2D) on the interactions page. P and Q use the two-body model (twoBody.ts) with
 * Predict → Experiment → Observe → Explain, every option judged by the model (exactly one holds). R, S and T use the force-pair
 * scenarios of pairs.ts: R asks the student to pick a genuine action–reaction pair, S puts balanced forces and pairs side by
 * side on free-body diagrams, T studies everyday interactions from the textbook (walking, wall, canoe, rocket, magnets).
 */

import { DEFAULT_TWO_BODY, twoBodyAt, tbFmt, type TwoBodySample, type TwoBodySetup } from './twoBody';

export interface TbOption { label: string; holds: (start: TwoBodySample, end: TwoBodySample, s: TwoBodySetup) => boolean; why: string }

export interface TbRoute {
  id: string;
  label: string;
  setup: TwoBodySetup;
  tEnd: number;
  prompt: string;
  options: TbOption[];
  explain: (start: TwoBodySample, end: TwoBodySample, s: TwoBodySetup) => string;
}

export interface TbExperiment { id: 'P' | 'Q'; title: string; goal: string; routes: TbRoute[]; lesson: string }

const base = (o: Partial<TwoBodySetup>): TwoBodySetup => ({ ...DEFAULT_TWO_BODY, ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;

export const TB_EXPERIMENTS: TbExperiment[] = [
  {
    id: 'P', title: 'Two carts pushing apart', goal: 'Two carts at rest push each other apart for 2 s (a 2 kg cart A and a 4 kg cart B, 6 N). Compare the forces, the accelerations and the momentum.',
    routes: [
      { id: 'p1', label: 'A (2 kg) and B (4 kg) push each other apart with 6 N for 2 s', setup: base({}), tEnd: 4,
        prompt: 'During the push, the force on A (exerted by B) and the force on B (exerted by A) are:',
        options: [
          { label: 'equal in size and opposite in direction (6 N each)', holds: (s0) => near(Math.abs(s0.fOnAByB), Math.abs(s0.fOnBByA)) && s0.fOnAByB * s0.fOnBByA < 0, why: 'Newton\'s third law: whenever B pushes A, A pushes B with an equal and opposite force at the same moment.' },
          { label: 'larger on the lighter cart A', holds: (s0) => Math.abs(s0.fOnAByB) > Math.abs(s0.fOnBByA) + 1e-9, why: 'The forces are always equal. The lighter cart has the larger ACCELERATION, not the larger force.' },
          { label: 'larger on the heavier cart B', holds: (s0) => Math.abs(s0.fOnBByA) > Math.abs(s0.fOnAByB) + 1e-9, why: 'A heavier object does not exert or feel a larger interaction force. The two forces of a pair are equal.' },
        ],
        explain: (s0) => `The force on A is ${tbFmt(s0.fOnAByB)} N and the force on B is ${tbFmt(s0.fOnBByA)} N: equal and opposite, acting at the same time on different carts.` },
      { id: 'p2', label: 'The same push, 2 s', setup: base({}), tEnd: 4,
        prompt: 'After the push has ended, the velocities of A and B are:',
        options: [
          { label: 'A: 6 m/s to the left; B: 3 m/s to the right', holds: (_a, e) => near(e.vA, -6) && near(e.vB, 3), why: 'a(A) = 6 ÷ 2 = 3 m/s² to the left for 2 s gives 6 m/s; a(B) = 6 ÷ 4 = 1.5 m/s² to the right for 2 s gives 3 m/s.' },
          { label: 'Both 3 m/s, in opposite directions', holds: (_a, e) => near(Math.abs(e.vA), 3) && near(Math.abs(e.vB), 3), why: 'The forces are equal but the masses are not, so the accelerations and the velocities differ: the lighter cart ends up faster.' },
          { label: 'A: 3 m/s to the left; B: 6 m/s to the right', holds: (_a, e) => near(e.vA, -3) && near(e.vB, 6), why: 'It is the lighter cart A that gets the larger acceleration and the larger velocity.' },
        ],
        explain: (_a, e) => `A moves at ${tbFmt(e.vA)} m/s and B at ${tbFmt(e.vB)} m/s. The lighter cart has the larger acceleration because the same force acts on a smaller mass.` },
      { id: 'p3', label: 'The same push: the momentum of the whole system', setup: base({}), tEnd: 4,
        prompt: 'The total momentum of the two carts after the push (they started at rest) is:',
        options: [
          { label: 'zero: the momentum of A (−12 kg m/s) cancels that of B (+12 kg m/s)', holds: (_a, e) => near(e.pTotal, 0) && near(e.pA, -e.pB) && !near(e.pA, 0), why: 'Only internal forces acted, equal and opposite for the same time, so the total momentum is unchanged: it was zero at the start and is zero now.' },
          { label: '+12 kg m/s: the carts gained momentum', holds: (_a, e) => near(e.pTotal, 12), why: 'Each cart gained momentum, but in opposite directions, so the total is unchanged.' },
          { label: '−12 kg m/s', holds: (_a, e) => near(e.pTotal, -12), why: 'Cart A has −12 kg m/s but B has +12 kg m/s; their sum is zero.' },
        ],
        explain: (_a, e) => `Cart A has momentum ${tbFmt(e.pA)} kg m/s and cart B has ${tbFmt(e.pB)} kg m/s; the total is ${tbFmt(e.pTotal)} kg m/s, the same as at the start.` },
    ],
    lesson: 'The two interaction forces are equal and opposite and act for the same time on different carts, so the carts gain equal and opposite momenta (the total stays zero) but unequal velocities when their masses differ.',
  },
  {
    id: 'Q', title: 'Different masses, equal interaction forces', goal: 'The forces of a pair are equal, so why are the accelerations different? Try a light cart and a heavy cart, and the gun and bullet of Example 6.8.',
    routes: [
      { id: 'q1', label: 'A 1 kg cart and a 9 kg cart push apart with 10 N for 1 s', setup: base({ massA: 1, massB: 9, force: 10, durationS: 1 }), tEnd: 3,
        prompt: 'Which cart has the larger acceleration while they push?',
        options: [
          { label: 'The 1 kg cart: 10 m/s² against 1.11 m/s²', holds: (s0) => Math.abs(s0.aA) > Math.abs(s0.aB) && near(Math.abs(s0.aA), 10), why: 'a = F ÷ m: the same 10 N on a smaller mass gives a larger acceleration. The forces are equal; the masses are not.' },
          { label: 'The 9 kg cart, because it is heavier', holds: (s0) => Math.abs(s0.aB) > Math.abs(s0.aA), why: 'A heavier cart has more inertia and accelerates less for the same force.' },
          { label: 'Both the same, because the forces are equal', holds: (s0) => near(Math.abs(s0.aA), Math.abs(s0.aB)), why: 'Equal forces give equal accelerations only for equal masses. a = F ÷ m depends on the mass too.' },
        ],
        explain: (s0) => `a(A) = ${tbFmt(s0.netA)} N ÷ 1 kg = ${tbFmt(s0.aA)} m/s² and a(B) = ${tbFmt(s0.netB)} N ÷ 9 kg = ${tbFmt(s0.aB)} m/s²: equal forces, unequal accelerations.` },
      { id: 'q2', label: 'Example 6.8 as a push-apart: a 0.1 kg bullet (B) and a 5 kg gun (A), 2 N', setup: base({ massA: 5, massB: 0.1, force: 2, durationS: 0.01 }), tEnd: 1,
        prompt: 'The initial accelerations of the gun and the bullet are:',
        options: [
          { label: 'gun 0.4 m/s², bullet 20 m/s²', holds: (s0) => near(Math.abs(s0.aA), 0.4) && near(Math.abs(s0.aB), 20), why: 'Both feel 2 N. Gun: 2 ÷ 5 = 0.4 m/s². Bullet: 2 ÷ 0.1 = 20 m/s².' },
          { label: 'both 2 m/s²', holds: (s0) => near(Math.abs(s0.aA), 2) && near(Math.abs(s0.aB), 2), why: '2 N is the force, not the acceleration. Divide each force by its own mass.' },
          { label: 'gun 20 m/s², bullet 0.4 m/s²', holds: (s0) => near(Math.abs(s0.aA), 20), why: 'The gun is the heavier object, so its acceleration is the smaller one.' },
        ],
        explain: (s0) => `Gun: ${tbFmt(s0.netA)} N ÷ 5 kg = ${tbFmt(s0.aA)} m/s². Bullet: ${tbFmt(s0.netB)} N ÷ 0.1 kg = ${tbFmt(s0.aB)} m/s². The recoil force on the gun equals the force on the bullet, as the third law says. (An idealised push-apart: the real firing involves gases and is not modelled.)` },
    ],
    lesson: 'The forces of a pair are always equal, but the accelerations are equal only if the masses are: the lighter object accelerates more (a = F ÷ m). This is why the fruit falls to the Earth while the Earth seems not to move towards the fruit.',
  },
];

export const tbExperimentById = (id: string | null | undefined): TbExperiment | undefined => TB_EXPERIMENTS.find((e) => e.id === id);

export function tbOutcome(r: TbRoute) {
  const start = twoBodyAt(r.setup, 0), end = twoBodyAt(r.setup, r.tEnd);
  return { start, end, holdsIndex: r.options.map((o) => o.holds(start, end, r.setup)).indexOf(true) };
}

export const PAIR_EXPERIMENTS = [
  { id: 'R', title: 'Identifying force pairs', goal: 'Pick the two forces that make a genuine action–reaction pair, and say which object each acts on.', scenarios: ['book', 'wall', 'canoe'] },
  { id: 'S', title: 'Balanced forces versus action–reaction', goal: 'Compare the forces on ONE object (balanced forces) with the forces BETWEEN two objects (a pair) on side-by-side free-body diagrams.', scenarios: ['book'] },
  { id: 'T', title: 'Everyday interactions', goal: 'Walking, pushing a wall, rowing, a rocket and two magnets: find the pair in each.', scenarios: ['walk', 'wall', 'canoe', 'rocket', 'magnets'] },
] as const;
