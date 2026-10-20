/**
 * NCERT exercises for Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines".
 *
 * The chapter ends with fifteen questions under "Revise, Reflect, Refine" (numbered 1 to 15, most with subparts: 43 parts in all).
 * This file keeps that numbering and order and lists every subpart. The summaries are ORIGINAL paraphrases, not the textbook wording.
 * A part is 'solved' when a verified solution exists for it in one of the solutions files (solutionsA: Section 7.1; solutionsB:
 * Sections 7.2 to 7.4.1; later files are added by later milestones). Every other part is honestly 'upcoming': it shows what must be
 * taught first and no hint, steps or answer. A question is "solved" only when all of its parts are.
 *
 * Solutions follow: Try yourself, Hint, Reasoning, Calculation, Final answer, Explore in the lab (only a real, matching link).
 * Viewing a solution is never mastery evidence: this module imports nothing from the learning-progress store.
 */

import type { WorkSolution } from './exerciseTypes';
import { SOLUTIONS_A } from './solutionsA';
import { SOLUTIONS_B } from './solutionsB';
import { SOLUTIONS_C } from './solutionsC';
import { SOLUTIONS_D } from './solutionsD';

export type { WorkSolution, ExerciseIllustration, SolutionStep } from './exerciseTypes';

export const SOLUTIONS: Record<string, WorkSolution> = { ...SOLUTIONS_A, ...SOLUTIONS_B, ...SOLUTIONS_C, ...SOLUTIONS_D };

export interface WorkExercisePart {
  /** i, ii, ... or 'all' when the question has no labelled subparts. */
  id: string;
  label: string;
  status: 'solved' | 'upcoming';
  /** What must be taught before this part can be solved. */
  needs?: string;
  solution?: WorkSolution;
}

export interface WorkExercise {
  number: number;
  /** Original summary of what is asked. */
  summary: string;
  topic: string;
  sections: string[];
  parts: WorkExercisePart[];
  lessonIds: string[];
}

const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'];

const mk = (number: number, labels: string[] | null, defaults: string): WorkExercisePart[] => {
  const ids = labels ? labels.map((_, k) => ROMAN[k]) : ['all'];
  return ids.map((id, k) => {
    const solution = SOLUTIONS[`${number}-${id}`];
    return { id, label: labels ? `(${id}) ${labels[k]}` : 'The whole question', status: solution ? 'solved' : 'upcoming', needs: solution ? undefined : defaults, solution } as WorkExercisePart;
  });
};

export const WORK_EXERCISES: WorkExercise[] = [
  { number: 1, topic: 'True or false: work and energy ideas', sections: ['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4.2'], lessonIds: ['pw-l1', 'pw-l2', 'pw-l3', 'pw-l4', 'pw-l6'],
    summary: 'Decide whether five statements are true or false: work when a force acts on an object that does not move, lifting a bucket upwards, the unit shared by work and energy, a stretched rubber band at rest and kinetic energy, and energy changing form.',
    parts: mk(1, ['work when the object does not move', 'lifting a bucket upwards', 'the unit shared by work and energy', 'a stretched rubber band at rest and kinetic energy', 'energy changing from one form to another'], 'potential energy (Section 7.4.2)') },
  { number: 2, topic: 'Fill in the blanks', sections: ['7.1', '7.4.1', '7.4.2', '7.5'], lessonIds: ['pw-l1', 'pw-l5', 'pw-l6', 'pw-l8'],
    summary: 'Complete five sentences: what work is the product of, how many newtons make a joule, the expressions for kinetic and for potential energy, and what power measures.',
    parts: mk(2, ['work as a product', 'the size of a joule', 'the expression for kinetic energy', 'the expression for potential energy at a small height', 'what power measures'], 'potential energy and power (Sections 7.4.2 and 7.5)') },
  { number: 3, topic: 'A ball at its highest point', sections: ['7.4'], lessonIds: ['pw-l6', 'pw-l7'], summary: 'For a ball thrown upwards, choose which of four statements about its force, acceleration, kinetic energy and potential energy are correct at the top.', parts: mk(3, ['the force on the ball', 'the acceleration of the ball', 'its kinetic energy', 'its potential energy'], 'potential energy (Section 7.4.2)') },
  { number: 4, topic: 'Energy transformations', sections: ['7.3'], lessonIds: ['pw-l4', 'pw-l6'], summary: 'Name the energy change in nine everyday situations, from a truck climbing a hill to a solar panel.', parts: mk(4, ['a truck moving uphill', 'unwinding of a watch spring', 'photosynthesis in green leaves', 'water flowing from a dam', 'burning of a matchstick', 'explosion of a fire cracker', 'speaking into a microphone', 'a glowing electric bulb', 'a solar panel'], 'potential energy (Section 7.4.2)') },
  { number: 5, topic: 'Potential energy of a student in a lift and on stairs', sections: ['7.4.2'], lessonIds: ['pw-l6'], summary: 'A student is lifted to the top of a building by an elevator and later climbs the stairs. Find the gain in potential energy each way and say how it depends on the path.', parts: mk(5, ['the gain in potential energy when lifted straight up', 'the gain in potential energy when climbing the stairs', 'what this shows about the path'], 'potential energy (Section 7.4.2)') },
  { number: 6, topic: 'Crane: energy and power for two heights', sections: ['7.4.2', '7.5'], lessonIds: ['pw-l6', 'pw-l8'], summary: 'A crane raises a mass to the 10th floor, then to the 20th floor in twice the time. Compare the extra energy and the power.', parts: mk(6, null, 'potential energy and power') },
  { number: 7, topic: 'Raising a flag with a pulley', sections: ['7.4.2', '7.5', '7.6.1'], lessonIds: ['pw-l6', 'pw-l8', 'pw-l9'], summary: 'Say which factors fix the energy needed to raise a flag, whether raising it faster changes the work, and how the power changes if the speed doubles.', parts: mk(7, null, 'potential energy, power and the pulley') },
  { number: 8, topic: 'Scooter fuel with one or two riders', sections: ['7.4.1', '7.5'], lessonIds: ['pw-l5'], summary: 'A scooter and rider reach the same speed in the same time with and without a passenger. Compare the fuel used.', parts: mk(8, null, 'kinetic energy') },
  { number: 9, topic: 'A balanced seesaw', sections: ['7.6.3'], lessonIds: ['pw-l10'], summary: 'Draw a seesaw balanced by a child and an adult who weighs twice as much, showing the distances from the pivot.', parts: mk(9, null, 'the lever (Section 7.6.3)') },
  { number: 10, topic: 'A ball thrown upwards: gravity and air resistance', sections: ['7.1.2', '7.4'], lessonIds: ['pw-l3', 'pw-l7'], summary: 'A 2 kg ball is thrown up at 20 m/s. Give the sign of the work done by gravity going up and coming down, and find the work done by air resistance when it only reaches 19.4 m.',
    parts: mk(10, ['the sign of the work done by gravity on the way up and on the way down', 'the work done by air resistance when the ball reaches 19.4 m'], 'potential energy (Section 7.4.2)') },
  { number: 11, topic: 'Variable force on a block', sections: ['7.1', '7.2', '7.4.1'], lessonIds: ['pw-l1', 'pw-l4', 'pw-l5'], summary: 'A force that changes along the path acts on a 10 kg block on a frictionless floor, which starts with 180 J of kinetic energy. Read the graph to find its speed at 0 m and at 4 m, and say whether the acceleration is ever negative.', parts: mk(11, ['the speed at 0 m', 'the speed at 4 m', 'whether the block has negative acceleration anywhere'], 'kinetic energy') },
  { number: 12, topic: 'Throwing a ball on the Moon', sections: ['7.4.2', '7.4.3'], lessonIds: ['pw-l7'], summary: 'The Moon\'s gravity is about one sixth of the Earth\'s. A ball thrown up reaches 8 m on the Earth; find the height on the Moon with the same upward velocity.', parts: mk(12, null, 'conservation of energy') },
  { number: 13, topic: 'A braking car and its graph', sections: ['7.1.2', '7.4.1'], lessonIds: ['pw-l4', 'pw-l5'], summary: 'A 1000 kg car brakes to a stop; a speed-time graph shows its motion. Describe the motion between two marked points, find its kinetic energy, the work done by the brakes, and where the kinetic energy goes.', parts: mk(13, ['how the car moves between A and B', 'the kinetic energy of the car at A', 'the work done by the brakes between B and C', 'what the kinetic energy changes into'], 'kinetic energy') },
  { number: 14, topic: 'Potential energy graph of a ball on a track', sections: ['7.4.3'], lessonIds: ['pw-l7'], summary: 'Use a potential energy against displacement graph for a 0.5 kg ball on a frictionless track to find its speed at three marked points.', parts: mk(14, null, 'conservation of mechanical energy') },
  { number: 15, topic: 'A falling coconut', sections: ['7.4.3', '7.2'], lessonIds: ['pw-l5', 'pw-l7'], summary: 'A 1.5 kg coconut falls 10 m onto wet sand. Find its speed just before it hits and the depth of the dent if the sand resists with 3000 N.', parts: mk(15, ['the speed just before hitting the sand', 'the depth of the depression'], 'conservation of energy') },
];

export const exerciseSolved = (e: WorkExercise): boolean => e.parts.every((p) => p.status === 'solved');
export const solvedWorkParts = (): { number: number; part: string }[] => WORK_EXERCISES.flatMap((e) => e.parts.filter((p) => p.status === 'solved').map((p) => ({ number: e.number, part: p.id })));
export const workExerciseCounts = () => ({
  questions: WORK_EXERCISES.length,
  parts: WORK_EXERCISES.reduce((a, e) => a + e.parts.length, 0),
  solvedParts: solvedWorkParts().length,
  solvedQuestions: WORK_EXERCISES.filter(exerciseSolved).length,
});
