/**
 * NCERT exercises for Class 9 Physics, Chapter 6 "How Forces Affect Motion" (PHY-2A foundation).
 *
 * The chapter ends with sixteen questions under "Revise, Reflect, Refine" (numbered 1 to 16, some with parts).
 * This file keeps that numbering and order. The summaries are ORIGINAL paraphrases, not the textbook wording.
 * Only questions fully supported by the PHY-2A lessons (Sections 6.1 to 6.3 and the net-force ideas of 6.2) have a
 * verified solution: questions 1 to 4. Every other question is honestly 'upcoming' with the milestone that will cover it,
 * and shows no hint, steps or answer.
 *
 * Solutions follow: Try yourself, Hint, Step-by-step reasoning, Final answer, Common mistakes, Explore.
 * Viewing a solution is never mastery evidence: this module imports nothing from the learning-progress store.
 */

import { netFromArrows } from './forceDiagram';
import { DEFAULT_SETUP, sampleAtTime, type Setup } from './forceModel';
import { toArrows, type ForceArrowSpec } from './learn/questions';
import { SOLVED_2C } from './exercisesSecondLaw';
import { SOLVED_2D } from './exercisesThirdLaw';
import type { TwoBodySetup } from './twoBody';
import type { GraphKind, Profile } from '../motion/profile';

export interface SolutionStep { text: string; why: string }
export interface FinalAnswer { label: string; value: string; part?: string; numeric?: number }

export type Illustration =
  | { kind: 'arrows'; caption: string; object: string; forces: ForceArrowSpec[]; showNet: boolean }
  | { kind: 'cart'; caption: string; setup: Setup; t: number; graphs?: boolean }
  | { kind: 'massSweep'; caption: string; force: number; masses: number[] }
  | { kind: 'twoBody'; caption: string; setup: TwoBodySetup; t: number }
  | { kind: 'graph'; caption: string; profile: Profile; graphs: GraphKind[] };

export interface LabLink { href: string; label: string }

export interface ExerciseSolution {
  kind: 'numerical' | 'conceptual' | 'multiple-choice';
  given: string[];
  find: string[];
  assumptions?: string[];
  principle: string;
  formulas?: { formula: string; why: string }[];
  hint: string;
  steps: SolutionStep[];
  answers: FinalAnswer[];
  explanation: string;
  commonMistakes: { mistake: string; fix: string }[];
  illustrations?: Illustration[];
  labs?: LabLink[];
  labNote?: string;
  verification: { status: 'verified'; method: string };
}

export interface ExercisePart { id: string; label: string }

export interface ForceExercise {
  /** The number printed in the textbook. */
  number: number;
  parts?: ExercisePart[];
  /** Original summary of what is asked. */
  summary: string;
  topic: string;
  sections: string[];
  status: 'solved' | 'upcoming';
  lessonIds: string[];
  /** The planned milestone for an upcoming question. */
  milestone?: string;
  solution?: ExerciseSolution;
}

const V = (method: string) => ({ status: 'verified' as const, method });
const up = (number: number, summary: string, topic: string, sections: string[], milestone: string, parts?: ExercisePart[]): ForceExercise => ({ number, summary, topic, sections, status: 'upcoming', lessonIds: [], milestone, parts });
const c = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });

const BASE_EXERCISES: ForceExercise[] = [
  {
    number: 1, sections: ['6.2', '6.3'], topic: 'Friction and balanced forces', status: 'solved', lessonIds: ['pf-l2', 'pf-l3'],
    summary: 'A table is pulled across the floor with a horizontal force F and moves at a constant velocity. How large is the friction the floor exerts on the table?',
    solution: {
      kind: 'conceptual',
      given: ['The table is pulled by a horizontal force F.', 'It moves at a constant velocity.'],
      find: ['The friction force exerted by the floor on the table.'],
      assumptions: ['The table moves in a straight line; the only horizontal forces are F and friction.'],
      principle: 'A constant velocity means zero acceleration, so the net force is zero: the forces are balanced.',
      hint: 'What does a constant velocity tell you about the net force? Then ask which two horizontal forces must be equal.',
      steps: [
        { text: 'The velocity is constant, so the acceleration is zero.', why: 'A change of velocity is an acceleration; here the velocity does not change.' },
        { text: 'Zero acceleration means the net force on the table is zero: the forces are balanced.', why: 'An unbalanced force would change the velocity.' },
        { text: 'Along the floor the only forces are the pull F and the friction f. Weight and the normal force balance vertically.', why: 'Only the horizontal forces decide the motion along the floor.' },
        { text: 'For zero net force, f must be equal in size to F and opposite in direction, so the friction is F, acting against the pull.', why: '(+F) + (−f) = 0 gives f = F.' },
      ],
      answers: [{ label: 'Friction on the table', value: 'F, equal in size to the pull and opposite in direction', numeric: 1 }],
      explanation: 'The pull does not make the table speed up because friction cancels it exactly. A larger pull than F would make the table accelerate.',
      commonMistakes: [{ mistake: 'Saying the friction is zero because the table is moving.', fix: 'Friction acts on a sliding object; it is balanced by the pull.' }, { mistake: 'Saying the friction is greater than F.', fix: 'Then the net force would be backwards and the table would slow down.' }],
      illustrations: [{ kind: 'arrows', caption: 'Example with F = 40 N: the pull and the friction are equal and opposite, so the net force is zero.', object: 'table', forces: [{ label: 'Pull F', by: 'the person', magnitude: 40, direction: 'right' }, { label: 'Friction', by: 'the floor', magnitude: 40, direction: 'left' }], showNet: true }],
      labs: [{ href: '/physics/forces/lab?experiment=E', label: 'Experiment E: a push that equals the friction gives constant velocity' }],
      verification: V('The Force Laboratory model confirms that a push equal to the sliding friction gives net force 0 and constant velocity (automated test).'),
    },
  },
  {
    number: 2, sections: ['6.2', '6.3'], topic: 'Net force and the velocity of a ball on a frictionless surface', status: 'solved', lessonIds: ['pf-l2', 'pf-l3'],
    parts: [{ id: 'i', label: '(i) no net force' }, { id: 'ii', label: '(ii) net force along the motion' }, { id: 'iii', label: '(iii) net force against the motion' }],
    summary: 'A ball moves on a smooth, frictionless surface. Choose whether its velocity stays the same, increases or decreases when (i) there is no net force, (ii) a net force acts along its motion, (iii) a net force acts opposite to its motion.',
    solution: {
      kind: 'multiple-choice',
      given: ['A ball moves on a frictionless surface.'],
      find: ['(i) The velocity when no net force acts.', '(ii) The speed when a net force acts along the motion.', '(iii) The speed when a net force acts against the motion.'],
      principle: 'A change of velocity needs an unbalanced net force. A net force gives an acceleration in its own direction.',
      hint: 'Ask whether there is an acceleration, and whether it points with or against the velocity.',
      steps: [
        { text: '(i) Zero net force means zero acceleration, so the velocity stays the same.', why: 'Balanced forces do not change the velocity of a moving object.' },
        { text: '(ii) A net force in the direction of motion gives an acceleration in that direction, so the speed increases.', why: 'The acceleration points the way of the net force, adding to the velocity.' },
        { text: '(iii) A net force opposite to the motion gives an acceleration against the motion, so the speed decreases.', why: 'The acceleration subtracts from the velocity.' },
      ],
      answers: [{ label: '(i)', value: 'remain the same', part: 'i' }, { label: '(ii)', value: 'increase', part: 'ii' }, { label: '(iii)', value: 'decrease', part: 'iii' }],
      explanation: 'Because the surface is frictionless there is no hidden force: only the stated net force changes the velocity, and it does so in its own direction.',
      commonMistakes: [{ mistake: 'In (i), choosing "decrease" because things slow down.', fix: 'Slowing down needs a force such as friction; there is none here.' }, { mistake: 'In (iii), choosing "increase" because a force is applied.', fix: 'A force against the motion reduces the speed.' }],
      illustrations: [
        { kind: 'cart', caption: '(i) No net force: the cart keeps its 3 m/s.', setup: c({ startVelocity: 3 }), t: 2 },
        { kind: 'cart', caption: '(ii) 4 N along the motion: the speed increases.', setup: c({ forceA: 4, startVelocity: 2 }), t: 2 },
        { kind: 'cart', caption: '(iii) 4 N against the motion: the speed decreases.', setup: c({ forceA: 4, dirA: 'left', startVelocity: 2 }), t: 2 },
      ],
      labs: [{ href: '/physics/forces/lab?experiment=E', label: 'Experiment E: moving without a net force' }, { href: '/physics/forces/lab?experiment=B', label: 'Experiment B: unbalanced forces' }],
      verification: V('Each case recomputed with the Force Laboratory model on a frictionless surface (automated test).'),
    },
  },
  {
    number: 3, sections: ['6.2'], topic: 'Net force on two blocks', status: 'solved', lessonIds: ['pf-l2'],
    parts: [{ id: 'a', label: 'which statement is correct' }],
    summary: 'Block P on a smooth table has forces of 4 N and 5 N acting on it in opposite directions; block Q moves with a constant velocity. Which of four statements about net force is correct?',
    solution: {
      kind: 'multiple-choice',
      given: ['Block P: 4 N and 5 N in opposite directions.', 'Block Q: moving with a constant velocity.'],
      find: ['Which block has a net force on it.'],
      principle: 'The net force on an object is the sum of its forces with directions. A constant velocity means zero net force.',
      formulas: [{ formula: 'net force = (+5 N) + (−4 N)', why: 'Opposite forces on a line subtract.' }],
      hint: 'Find the net force on P. Then ask what a constant velocity says about Q.',
      steps: [
        { text: 'P: the two forces are in opposite directions, so net force = 5 N − 4 N = 1 N, in the direction of the 5 N force.', why: 'Opposite forces subtract, and the net force points the way of the larger one.' },
        { text: 'The net force on P is not zero, so P experiences a net force (it accelerates).', why: 'Unequal opposite forces are unbalanced.' },
        { text: 'Q moves with a constant velocity, so its acceleration is zero and the net force on it is zero.', why: 'Only an unbalanced force changes the velocity.' },
        { text: 'So P experiences a net force and Q does not: statement (i).', why: 'This matches option (i).' },
      ],
      answers: [{ label: 'Correct statement', value: '(i) P experiences a net force and Q does not', part: 'a', numeric: 1 }],
      explanation: 'P has a small net force of 1 N; Q has none even though it is moving.',
      commonMistakes: [{ mistake: 'Thinking Q must have a net force because it is moving.', fix: 'A constant velocity needs no net force.' }, { mistake: 'Adding 4 N and 5 N to get 9 N for P.', fix: 'The forces are in opposite directions, so they subtract.' }],
      illustrations: [{ kind: 'arrows', caption: 'Block P: 5 N one way and 4 N the other; the net force is 1 N.', object: 'block P', forces: [{ label: '5 N', by: 'a hand', magnitude: 5, direction: 'right' }, { label: '4 N', by: 'a hand', magnitude: 4, direction: 'left' }], showNet: true }],
      labs: [{ href: '/physics/forces/lab?experiment=B', label: 'Experiment B: unbalanced forces' }, { href: '/physics/forces/lab?experiment=A', label: 'Experiment A: a moving cart with balanced forces' }],
      verification: V('Net force of P recomputed from the force arrows (automated test); Q checked with the model at constant velocity.'),
    },
  },
  {
    number: 4, sections: ['6.2'], topic: 'Net force of many collinear forces', status: 'solved', lessonIds: ['pf-l2'],
    summary: 'In a snake boat race 100 oarsmen row a boat; 95 row to push it forward but 5 row the wrong way. Each applies a horizontal force of 200 N. Ignoring drag, what is the net force on the boat?',
    solution: {
      kind: 'numerical',
      given: ['100 oarsmen, each exerting 200 N.', '95 push the boat forward and 5 push it backward.'],
      find: ['The net force on the boat.'],
      assumptions: ['Drag and air friction are ignored; all forces act along the line of the boat.'],
      principle: 'Forces in the same direction add; forces in opposite directions subtract. The net force is in the direction of the larger total.',
      formulas: [{ formula: 'net force = forward total − backward total', why: 'The two groups act in opposite directions along one line.' }],
      hint: 'Find the total forward force and the total backward force separately, then subtract.',
      steps: [
        { text: 'Forward force = 95 × 200 N = 19 000 N.', why: 'The 95 forces are in the same direction, so they add.' },
        { text: 'Backward force = 5 × 200 N = 1000 N.', why: 'The 5 wrong-way oarsmen also add up among themselves.' },
        { text: 'Net force = 19 000 N − 1000 N = 18 000 N.', why: 'The two totals are in opposite directions, so they subtract.' },
        { text: 'The net force is 18 000 N in the forward direction.', why: 'It points the way of the larger total.' },
      ],
      answers: [{ label: 'Net force on the boat', value: '18 000 N, forwards', numeric: 18000 }],
      explanation: 'The five mistaken oarsmen cancel the effort of five others, so the net force is that of 90 oarsmen: 90 × 200 N = 18 000 N.',
      commonMistakes: [{ mistake: 'Adding all 100 forces to get 20 000 N.', fix: 'The 5 oarsmen act in the opposite direction, so they subtract.' }, { mistake: 'Subtracting only one 200 N force (19 800 N).', fix: 'Each of the five wrong-way oarsmen applies 200 N: 5 × 200 N = 1000 N.' }],
      illustrations: [{ kind: 'arrows', caption: 'The two totals on the boat: 19 000 N forward and 1000 N backward.', object: 'boat', forces: [{ label: '95 oarsmen', by: 'the 95 oarsmen', magnitude: 19000, direction: 'right' }, { label: '5 oarsmen', by: 'the 5 oarsmen', magnitude: 1000, direction: 'left' }], showNet: true }],
      labNote: 'The Force Laboratory allows forces up to 100 N, so a net force of 18 000 N is outside its range; the arrow diagram shows the same collinear addition.',
      verification: V('Recomputed by adding the signed arrows (automated test): 95 × 200 − 5 × 200 = 18 000 N.'),
    },
  },
  up(5, 'When a net force acts on an object, which description of the resulting acceleration is correct (four options about its direction and how it depends on force or mass)?', "Newton's second law (statement)", ['6.5'], 'PHY-2C'),
  {
    number: 6, sections: ['6.4'], topic: 'Position-time graphs and net force', status: 'solved', lessonIds: ['pf-l4'],
    parts: [{ id: 'i', label: '(i) object A' }, { id: 'ii', label: '(ii) object B' }, { id: 'iii', label: '(iii) object C' }, { id: 'iv', label: '(iv) object D' }],
    summary: 'Position-time graphs of four objects moving along a straight line are given: A is a rising straight line, B a horizontal line, C a curve that bends upward, D a falling straight line. On which of them does a net force act?',
    solution: {
      kind: 'multiple-choice',
      given: ['Fig. 6.37: A is a straight line sloping up; B is a horizontal line; C is a curve that gets steeper; D is a straight line sloping down.'],
      find: ['(i) to (iv) For each of the objects A, B, C and D, whether a net force acts.'],
      principle: 'By the first law, with zero net force an object is at rest or moves with a constant velocity. A net force is present only if the velocity changes, that is, if the slope of the position-time graph changes.',
      hint: 'The slope of a position-time graph is the velocity. For each graph ask: is the slope constant?',
      steps: [
        { text: 'A: a straight sloping line has a constant slope, so a constant velocity. No net force acts on A.', why: 'Constant velocity means zero acceleration, so the net force is zero.' },
        { text: 'B: a horizontal line has zero slope: B is at rest. No net force acts on B.', why: 'An object at rest with no change of velocity has zero net force.' },
        { text: 'C: the curve gets steeper, so the slope (the velocity) keeps increasing. C accelerates, so a net force acts on C.', why: 'A changing velocity needs an unbalanced force.' },
        { text: 'D: a straight line sloping down has a constant (negative) slope: a constant velocity in the negative direction. No net force acts on D.', why: 'A constant velocity, in either direction, means zero net force.' },
      ],
      answers: [{ label: '(i) Object A', value: 'No net force (constant velocity)', part: 'i' }, { label: '(ii) Object B', value: 'No net force (at rest)', part: 'ii' }, { label: '(iii) Object C', value: 'A net force acts (the velocity increases)', part: 'iii' }, { label: '(iv) Object D', value: 'No net force (constant velocity in the negative direction)', part: 'iv' }],
      explanation: 'Only the curved graph shows a changing velocity, so only object C has a net force. The graphs of A and D show a constant velocity, one positive and one negative, and the graph of B shows rest.',
      commonMistakes: [{ mistake: 'Saying a net force acts on A because it is moving.', fix: 'A constant velocity needs no net force.' }, { mistake: 'Saying a net force acts on D because the graph slopes downwards.', fix: 'The slope is constant: the object moves steadily in the negative direction.' }, { mistake: 'Saying no net force acts on B because it is not moving.', fix: 'That is correct for B: at rest with no change. Check C, not B, for the changing velocity.' }],
      illustrations: [
        { kind: 'graph', caption: 'A (illustrative values with the same shape): a straight sloping line, constant velocity.', profile: { x0: 0, v0: 2, segments: [{ durationS: 10, a: 0 }] }, graphs: ['xt', 'vt'] },
        { kind: 'graph', caption: 'B: a horizontal line, at rest.', profile: { x0: 5, v0: 0, segments: [{ durationS: 10, a: 0 }] }, graphs: ['xt', 'vt'] },
        { kind: 'graph', caption: 'C: a curve that gets steeper, so the velocity increases: a net force acts.', profile: { x0: 0, v0: 0, segments: [{ durationS: 10, a: 1 }] }, graphs: ['xt', 'vt'] },
        { kind: 'graph', caption: 'D: a straight line sloping down, constant negative velocity.', profile: { x0: 20, v0: -2, segments: [{ durationS: 10, a: 0 }] }, graphs: ['xt', 'vt'] },
      ],
      labs: [{ href: '/physics/forces/lab?experiment=G', label: 'Experiment G: zero net force with different starting velocities' }],
      labNote: 'The textbook graphs have no scale; the illustrations use stated values with the same shapes. Their velocity-time graphs show the constant velocity (A, D), zero velocity (B) and changing velocity (C).',
      verification: V('The slope behaviour of each illustrative profile was recomputed (automated test): constant for A, B and D, changing for C.'),
    },
  },
  up(7, 'A sailor jumps from a small boat towards the shore. Does the boat move, and in which direction and why?', "Newton's third law", ['6.6'], 'PHY-2D'),
  up(8, 'Explain why a landing mat or sand bed is placed for a high-jump athlete.', "Newton's second law (time of contact)", ['6.5'], 'PHY-2C'),
  up(9, 'A loaded hand cart collides with an identical empty one. Which statement about the forces during the collision is correct?', "Newton's third law", ['6.6'], 'PHY-2D'),
  up(10, 'The acceleration-mass graph for a force acting on objects of different masses is given. Plot the force-mass graph.', "Newton's second law (graph)", ['6.5'], 'PHY-2C'),
  up(11, 'The velocity-time graph of a 10 kg object is given. Find the force acting on it using the graph.', "Newton's second law (graph)", ['6.5'], 'PHY-2C'),
  up(12, 'A 50 g bullet at 100 m/s stops after 50 cm in a wooden block. Estimate the stopping force, assuming constant acceleration.', "Newton's second law with the equations of motion", ['6.5'], 'PHY-2C'),
  up(13, 'A footballer kicks a 0.4 kg ball to 108 km/h with an estimated force of 800 N. Find the time of contact.', "Newton's second law", ['6.5'], 'PHY-2C'),
  up(14, 'A 2 kg object moving at 10 m/s enters a rough patch with friction 7 N while an extra 3 N opposes the motion. How far does it go before stopping?', 'Net force, friction and the equations of motion', ['6.3', '6.5'], 'PHY-2C'),
  up(15, 'A tractor with force F gives harrow m1 acceleration a1 and trolley m2 acceleration a2. Find the acceleration when the harrow is placed on the trolley.', "Newton's second law (expression)", ['6.5'], 'PHY-2C'),
  up(16, 'A bar magnet and a compass needle exert equal and opposite magnetic forces on each other, yet only the needle moves. Explain.', "Newton's third law and second law", ['6.6'], 'PHY-2D'),
];

/** The sixteen questions: those supported by the first and second laws are solved, the third-law questions stay upcoming. */
export const FORCE_EXERCISES: ForceExercise[] = BASE_EXERCISES.map((e) => SOLVED_2C[e.number] ?? SOLVED_2D[e.number] ?? e);

export const solvedForceExerciseNumbers = (): number[] => FORCE_EXERCISES.filter((e) => e.status === 'solved').map((e) => e.number);

/** Recompute the numerical results of the solved questions from the model and the force arrows. */
export function recomputeForceAnswers(): Record<string, number> {
  // Q1: a push equal to the sliding friction on a wooden surface gives net force 0 and constant velocity
  const q1 = c({ massKg: 2, surfaceId: 'wood', forceA: 6, startVelocity: 4 });
  const s1 = sampleAtTime(q1, 5, 20);
  // Q2: frictionless ball, three cases
  const f = (o: Partial<Setup>) => { const s = c(o); return { v0: sampleAtTime(s, 0, 20).v, v2: sampleAtTime(s, 2, 20).v }; };
  const i = f({ startVelocity: 3 }), ii = f({ forceA: 4, startVelocity: 2 }), iii = f({ forceA: 4, dirA: 'left', startVelocity: 2 });
  // Q3: block P from arrows, block Q at constant velocity
  const p = toArrows('P', [{ label: '5 N', by: 'a', magnitude: 5, direction: 'right' }, { label: '4 N', by: 'b', magnitude: 4, direction: 'left' }]);
  const q = sampleAtTime(c({ startVelocity: 2 }), 3, 20);
  // Q4: boat
  const boat = toArrows('boat', [{ label: 'forward', by: 'x', magnitude: 95 * 200, direction: 'right' }, { label: 'backward', by: 'y', magnitude: 5 * 200, direction: 'left' }]);
  return {
    q1FrictionMinusPush: Math.abs(s1.friction) - s1.forceA, q1Net: s1.net, q1VelocityChange: s1.v - 4,
    q2i: i.v2 - i.v0, q2ii: ii.v2 - ii.v0, q2iii: iii.v2 - iii.v0,
    q3P: netFromArrows(p), q3Q: q.net,
    q4: netFromArrows(boat),
  };
}

export function forceExerciseCoverage() {
  return FORCE_EXERCISES.map((e) => {
    const partIds = e.parts?.map((p) => p.id) ?? [];
    const answered = e.solution?.answers.map((a) => a.part).filter((p): p is string => Boolean(p)) ?? [];
    return { number: e.number, status: e.status, partIds, answered, missing: e.status === 'solved' ? partIds.filter((p) => !answered.includes(p)) : [], milestone: e.milestone };
  });
}
