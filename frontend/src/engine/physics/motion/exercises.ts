/**
 * NCERT exercise foundation for Class 9 Physics, Chapter 4.
 *
 * The chapter ends with sixteen questions under "Revise, Reflect, Refine" (numbered 1 to 16,
 * some with parts). This file keeps that numbering and order. The summaries are ORIGINAL
 * paraphrases, not the textbook wording. A question is 'solved' only when it has a worked,
 * verified solution; every other question is honestly 'upcoming' and has no solution.
 *
 * Solutions follow: Try yourself, Hint, Step-by-step reasoning, Final answer, Explore in the lab.
 * Viewing a solution is never mastery evidence: this module is separate from the learning-progress
 * store and nothing here is recorded anywhere.
 */

import { addMove, newPath, summary, type MotionPath } from './kinematics';

export type ExerciseStatus = 'solved' | 'upcoming';

export interface SolutionStep { text: string; why: string }
export interface FinalAnswer { label: string; value: string }

export interface ModelCheck {
  /** Positions in metres: the starting position, then each target in turn (units: metres). */
  startM: number;
  targetsM: number[];
  /** Values the solution states, in metres; the tests recompute them from the motion model. */
  expect: { distanceM: number; displacementM: number };
}

export interface ExerciseSolution {
  given: string[];
  find: string[];
  assumptions?: string[];
  hint: string;
  steps: SolutionStep[];
  answers: FinalAnswer[];
  model?: ModelCheck;
  lab?: { href: string; label: string };
  verification: { status: 'verified'; method: string };
}

export interface ExercisePart { id: string; label: string }

export interface MotionExercise {
  /** The number printed in the textbook. */
  number: number;
  parts?: ExercisePart[];
  /** Original summary of what is asked. */
  summary: string;
  topic: string;
  sections: string[];
  status: ExerciseStatus;
  /** Learn lessons that teach what is needed. */
  lessonIds: string[];
  solution?: ExerciseSolution;
}

const up = (number: number, summary_: string, topic: string, sections: string[], parts?: ExercisePart[]): MotionExercise => ({ number, summary: summary_, topic, sections, status: 'upcoming', lessonIds: [], parts });

export const MOTION_EXERCISES: MotionExercise[] = [
  {
    number: 1,
    summary: 'A person walks 250 m along a straight road to a shop, returns home for a forgotten bag, goes to the shop again and finally comes home. Find the total distance and the displacement from home.',
    topic: 'Distance and displacement', sections: ['4.1.2'], status: 'solved', lessonIds: ['pm-l2', 'pm-l3'],
    solution: {
      given: ['The shop is 250 m from home on a straight road.', 'Trip: home to shop, shop to home, home to shop, shop to home.'],
      find: ['The total distance travelled.', 'The displacement from home at the end.'],
      assumptions: ['Take home as the reference point O and the direction of the shop as positive.'],
      hint: 'Count how many times the 250 m stretch is walked. Then ask where the person is at the end compared with the start.',
      steps: [
        { text: 'Put home at O = 0 m and the shop at +250 m.', why: 'A reference point and a direction are needed to describe positions.' },
        { text: 'The four legs are 0 → 250, 250 → 0, 0 → 250, 250 → 0. Each is 250 m long.', why: 'Distance adds up the length of every leg, whichever way it goes.' },
        { text: 'Total distance = 4 × 250 m = 1000 m.', why: 'Distance is path length, so every leg counts in full.' },
        { text: 'The final position is home, 0 m. Displacement = final − initial = 0 − 0 = 0 m.', why: 'Displacement depends only on where the person starts and ends.' },
      ],
      answers: [{ label: 'Total distance', value: '1000 m' }, { label: 'Displacement from home', value: '0 m' }],
      model: { startM: 0, targetsM: [250, 0, 250, 0], expect: { distanceM: 1000, displacementM: 0 } },
      lab: { href: '/physics/motion/lab?experiment=B', label: 'Explore returning home' },
      verification: { status: 'verified', method: 'Recomputed from the motion model (automated test); matches hand calculation.' },
    },
  },
  {
    number: 2,
    parts: [{ id: 'i', label: '(i) total vertical distance' }, { id: 'ii', label: '(ii) displacement from the starting point' }],
    summary: 'A student climbs from the ground floor to the fourth floor of a school, then walks down to the second floor. Each floor is 3 m high. Find the total vertical distance travelled and the displacement from the start.',
    topic: 'Distance and displacement (vertical line)', sections: ['4.1.2'], status: 'solved', lessonIds: ['pm-l2', 'pm-l3'],
    solution: {
      given: ['Each floor is 3 m above the one below.', 'Start: ground floor. Up to the fourth floor, then down to the second floor.'],
      find: ['(i) The total vertical distance travelled.', '(ii) The displacement from the starting point.'],
      assumptions: ['The ground floor is height 0 m, so the fourth floor is 4 × 3 = 12 m up and the second floor is 2 × 3 = 6 m up. Up is taken as positive.'],
      hint: 'Write the three heights above the ground. Then add the lengths of the two legs, and subtract start from end for the displacement.',
      steps: [
        { text: 'Heights above the ground floor: ground 0 m, second floor 6 m, fourth floor 12 m.', why: 'Choosing the ground floor as the reference point turns the building into a vertical number line.' },
        { text: 'Leg 1: 0 → 12 m, length 12 m. Leg 2: 12 → 6 m, length 6 m.', why: 'Each leg is a straight movement in one direction.' },
        { text: 'Total vertical distance = 12 m + 6 m = 18 m.', why: 'Distance adds the lengths of all legs; the downward leg counts as a positive length.' },
        { text: 'Displacement = final − initial = 6 m − 0 m = +6 m, that is 6 m upward from the start.', why: 'Only the start and end positions matter for displacement, and its sign gives the direction.' },
      ],
      answers: [{ label: '(i) Total vertical distance', value: '18 m' }, { label: '(ii) Displacement', value: '6 m upward (+6 m)' }],
      model: { startM: 0, targetsM: [12, 6], expect: { distanceM: 18, displacementM: 6 } },
      lab: { href: '/physics/motion/lab?experiment=C', label: 'Explore changing direction' },
      verification: { status: 'verified', method: 'Recomputed from the motion model (automated test); matches hand calculation.' },
    },
  },
  up(3, 'A scooter\'s speedometer reading stays constant. Can the scooter still be accelerating, and how?', 'Acceleration and direction of motion', ['4.1.4', '4.4.1']),
  up(4, 'A car starts from rest and reaches 24 m/s in 6 s. Find the average acceleration and the distance covered in those 6 s.', 'Average acceleration; kinematic equations', ['4.1.4', '4.3']),
  up(5, 'A motorbike at 28 m/s slows with constant acceleration and stops after 98 m. Find the acceleration and the time to stop.', 'Kinematic equations', ['4.3']),
  up(6, 'Two objects move on parallel tracks in the same direction; their position-time graphs are given. Do they ever have equal velocity? Justify.', 'Position-time graphs', ['4.2.2']),
  up(7, 'From the position-time graphs of two objects over 10 s, choose the correct statements about their average velocity and average speed.', 'Average speed and velocity from graphs', ['4.1.3', '4.2.2'], [{ id: 'i', label: '(i)' }, { id: 'ii', label: '(ii)' }, { id: 'iii', label: '(iii)' }, { id: 'iv', label: '(iv)' }]),
  up(8, 'A truck driver slows from 54 km/h to 36 km/h in 36 s because of a speed-limit sign. Find the distance covered, assuming constant acceleration.', 'Kinematic equations; unit conversion', ['4.3']),
  up(9, 'A car accelerates from rest to 20 m/s in 5 s, moves at 20 m/s for 10 s, then stops in 6 s. Find the total distance.', 'Velocity-time graph areas', ['4.2.3', '4.3']),
  up(10, 'A bus at 36 km/h sees an obstacle 30 m ahead; the driver reacts after 0.5 s, then brakes at 2.5 m/s². Can the bus stop in time?', 'Reaction time and stopping distance', ['4.3']),
  {
    number: 11,
    summary: 'Someone says "the Earth moves around the Sun". Discuss whether an object kept on the Earth can be called at rest.',
    topic: 'Reference point; rest and motion', sections: ['4.1.1'], status: 'solved', lessonIds: ['pm-l1'],
    solution: {
      given: ['An object sits on the Earth (for example a book on a table).', 'The Earth moves around the Sun.'],
      find: ['Whether the object can be called at rest.'],
      hint: 'The textbook defines "at rest" using a reference point. Ask: at rest compared with what?',
      steps: [
        { text: 'An object is at rest when its position with respect to the chosen reference point does not change with time.', why: 'This is the textbook\'s definition; rest and motion are always stated with respect to a reference point.' },
        { text: 'Take the table (or the Earth\'s surface) as the reference point: the book\'s distance and direction from it never change, so the book is at rest.', why: 'Its position with respect to that reference point stays the same.' },
        { text: 'Take the Sun as the reference point: the book\'s position with respect to the Sun keeps changing, because the Earth moves around the Sun, so the book is in motion.', why: 'A different reference point can give a different answer.' },
        { text: 'So the statement "at rest" is complete only when the reference point is named. On the Earth it is natural to use the Earth itself, and then the object is at rest.', why: 'There is no reference-free "absolute rest" in this chapter.' },
      ],
      answers: [{ label: 'Conclusion', value: 'At rest with respect to the Earth; in motion with respect to the Sun. Rest and motion depend on the reference point.' }],
      lab: { href: '/physics/motion/learn/pm-l1', label: 'Revisit reference points' },
      verification: { status: 'verified', method: 'Reasoned directly from the textbook definition of rest and motion in Section 4.1.1.' },
    },
  },
  up(12, 'From a cyclist\'s velocity-time graph over 120 s, shade the areas for constant velocity and decreasing velocity, and find the displacement and average acceleration.', 'Velocity-time graph', ['4.2.3'], [{ id: 'i', label: '(i)' }, { id: 'ii', label: '(ii)' }]),
  up(13, 'A marathon runner\'s velocity-time graph is given; estimate the distance she ran.', 'Area under a velocity-time graph', ['4.2.3']),
  up(14, 'A car moves at 6 m/s for 2 minutes then accelerates at 1 m/s² for 6 s. Find the displacement over 2 min 6 s using a velocity-time graph.', 'Velocity-time graph; unit conversion', ['4.2.3', '4.3']),
  up(15, 'Two cars start from rest with constant accelerations (5 m/s in 5 s, and 3 m/s in 10 s). Plot both velocity-time graphs on one graph and find each displacement.', 'Velocity-time graphs', ['4.2.3', '4.3']),
  up(16, 'The tip of a 7 cm minute hand is followed from 6 PM to 7:30 PM. Find its distance travelled, displacement, speed and velocity.', 'Uniform circular motion', ['4.4.1'], [{ id: 'i', label: '(i) distance' }, { id: 'ii', label: '(ii) displacement' }, { id: 'iii', label: '(iii) speed' }, { id: 'iv', label: '(iv) velocity' }]),
];

export const solvedExerciseNumbers = (): number[] => MOTION_EXERCISES.filter((e) => e.status === 'solved').map((e) => e.number);

/** Replay a solution's motion model and return its distance and displacement in metres. */
export function recomputeModel(m: ModelCheck): { distanceM: number; displacementM: number } {
  let p: MotionPath = newPath(m.startM, Math.min(m.startM, ...m.targetsM, 0) - 10, Math.max(m.startM, ...m.targetsM, 0) + 10);
  for (const t of m.targetsM) { const r = addMove(p, t); if (!r.ok) throw new Error(r.reason); p = r.path; }
  const s = summary(p);
  return { distanceM: s.distanceCm / 100, displacementM: s.displacementCm / 100 };
}
