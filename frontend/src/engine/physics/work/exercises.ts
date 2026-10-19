/**
 * NCERT exercises for Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines" (PHY-3A foundation).
 *
 * The chapter ends with fifteen questions under "Revise, Reflect, Refine" (numbered 1 to 15, most with subparts). This file keeps
 * that numbering and order and lists every subpart. The summaries are ORIGINAL paraphrases, not the textbook wording.
 * Only the SUBPARTS that the work lessons (Sections 7.1 to 7.1.2) fully support have a verified solution: 1(i), 1(ii), 2(i), 2(ii)
 * and 10(i). Every other subpart is honestly 'upcoming' and shows no hint, steps or answer. A question is "solved" only when all of
 * its parts are.
 *
 * Solutions follow: Try yourself, Hint, Reasoning, Calculation, Final answer, Explore in the lab (only a real, matching link).
 * Viewing a solution is never mastery evidence: this module imports nothing from the learning-progress store.
 */

import { computeWork, DEFAULT_WORK } from './workModel';

export interface SolutionStep { text: string; why: string }

export interface WorkSolution {
  given: string[];
  find: string[];
  assumptions?: string[];
  hint: string;
  reasoning: SolutionStep[];
  calculation: string[];
  finalAnswer: string;
  commonMistake: string;
  /** A real laboratory link that shows the same idea, or null with the reason. */
  lab: { href: string; label: string } | null;
  labNote?: string;
  verification: string;
}

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

const ENERGY = 'the energy lessons (Sections 7.2 to 7.4)';
const POWER_MACHINES = 'power and simple machines (Sections 7.5 and 7.6)';
const roman = (n: number) => ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix'][n - 1];
const upParts = (labels: string[], needs: string): WorkExercisePart[] => labels.map((label, k) => ({ id: roman(k + 1), label: `(${roman(k + 1)}) ${label}`, status: 'upcoming', needs }));
const single = (needs: string): WorkExercisePart[] => [{ id: 'all', label: 'The whole question', status: 'upcoming', needs }];

const LAB = '/physics/work/lab';

export const WORK_EXERCISES: WorkExercise[] = [
  {
    number: 1, topic: 'True or false: work and energy ideas', sections: ['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4.2'], lessonIds: ['pw-l1', 'pw-l2', 'pw-l3'],
    summary: 'Decide whether five statements are true or false: work when a force acts on an object that does not move, lifting a bucket upwards, the unit shared by work and energy, a stretched rubber band at rest and kinetic energy, and energy changing form.',
    parts: [
      {
        id: 'i', label: '(i) work when the object does not move', status: 'solved',
        solution: {
          given: ['A force is applied to an object.', 'The object does not move.'], find: ['Is work said to be done?'],
          hint: 'What two things must happen before a force does work on an object? Check whether both happen here.',
          reasoning: [
            { text: 'A force does work on an object only if the object is displaced in the direction of the force (or against it).', why: 'Work is defined as force multiplied by displacement, W = F × s.' },
            { text: 'The object does not move, so its displacement is zero.', why: 'Zero displacement is given.' },
            { text: 'Whatever the size of the force, the product of force and zero displacement is zero.', why: 'Anything multiplied by zero is zero.' },
          ],
          calculation: ['W = F × s = F × 0 m = 0 J'],
          finalAnswer: 'False: no work is done on the object, however large the force is.',
          commonMistake: 'Saying work is done because you push hard or feel tired. Tiredness comes from your muscles using energy; no work is done on the object if it is not displaced.',
          lab: { href: `${LAB}?experiment=B`, label: 'Experiment B: no displacement' },
          verification: 'The Work Laboratory model gives 0 J for a 10 N push with zero displacement (automated test).',
        },
      },
      {
        id: 'ii', label: '(ii) lifting a bucket upwards', status: 'solved',
        solution: {
          given: ['A bucket is lifted vertically upwards.'], find: ['Is the work done on the bucket by the lifting force positive?'],
          assumptions: ['"The work done" means the work done by the lifting force of the person (the bucket is lifted slowly, so the force is about the bucket\'s weight).'],
          hint: 'Compare the direction of the lifting force with the direction of the bucket\'s displacement.',
          reasoning: [
            { text: 'To lift the bucket you pull it upwards.', why: 'The lifting force acts upwards.' },
            { text: 'The bucket moves upwards, in the direction of that force.', why: 'The displacement is upwards.' },
            { text: 'A force along the displacement does positive work.', why: 'The force and displacement have the same sign, so W = F × s is positive.' },
          ],
          calculation: ['For a bucket of mass m lifted through a height h: F = mg and s = +h, so W = mg × h = +mgh (positive).'],
          finalAnswer: 'True: the lifting force does positive work on the bucket. (Gravity, which pulls down while the bucket goes up, does negative work.)',
          commonMistake: 'Forgetting to say which force. The weight of the bucket does negative work as it is lifted, but the question is about the lifting force.',
          lab: { href: `${LAB}?experiment=C`, label: 'Experiment C: positive and negative work' },
          verification: 'For 2 kg lifted 2 m the model gives +40 J for the lifting force and −40 J for gravity (automated test).',
        },
      },
      { id: 'iii', label: '(iii) the unit shared by work and energy', status: 'upcoming', needs: ENERGY },
      { id: 'iv', label: '(iv) a stretched rubber band at rest and kinetic energy', status: 'upcoming', needs: ENERGY },
      { id: 'v', label: '(v) energy changing from one form to another', status: 'upcoming', needs: ENERGY },
    ],
  },
  {
    number: 2, topic: 'Fill in the blanks', sections: ['7.1', '7.4.1', '7.4.2', '7.5'], lessonIds: ['pw-l1'],
    summary: 'Complete five sentences: what work is the product of, how many newtons make a joule, the expressions for kinetic and for potential energy, and what power measures.',
    parts: [
      {
        id: 'i', label: '(i) work as a product', status: 'solved',
        solution: {
          given: ['Work done = ____ × ____ (measured in the direction of the force).'], find: ['The two quantities that are multiplied.'],
          hint: 'Recall how you found the work of lifting the bag: what did you multiply?',
          reasoning: [
            { text: 'The work done by a constant force is the force multiplied by the displacement of the object in the direction of the force.', why: 'This is the definition of work, W = F × s.' },
            { text: 'The second blank is already "(in the direction of the force)", so it is the displacement.', why: 'The phrase says in which direction the displacement is measured.' },
          ],
          calculation: ['W = F × s: work (J) = force (N) × displacement (m)'],
          finalAnswer: 'Work done = force × displacement (in the direction of the force).',
          commonMistake: 'Writing force × distance travelled for a path with turns, or force × time. Only the displacement along the force counts.',
          lab: { href: `${LAB}?experiment=A`, label: 'Experiment A: force and displacement' },
          verification: 'For 10 N and 3 m along the force the model gives 30 J = 10 × 3 (automated test).',
        },
      },
      {
        id: 'ii', label: '(ii) the size of a joule', status: 'solved',
        solution: {
          given: ['1 joule is done when a force of ____ N displaces an object by 1 m in the direction of the force.'], find: ['The missing force in newtons.'],
          hint: 'Start from 1 J = (force) × (1 m) and solve for the force.',
          reasoning: [
            { text: 'The joule is defined through W = F × s: 1 J = 1 N × 1 m.', why: 'The unit of work is the unit of force times the unit of displacement.' },
            { text: 'Compare 1 J = F × 1 m with 1 J = 1 N × 1 m: F must be 1 N.', why: 'Both sides have the same displacement, so the forces match.' },
          ],
          calculation: ['F = W ÷ s = 1 J ÷ 1 m = 1 N'],
          finalAnswer: '1 newton.',
          commonMistake: 'Answering 10 N (using g = 10) or 1 kg. The question is about a force of 1 N, not a weight or a mass.',
          lab: { href: `${LAB}?experiment=A`, label: 'Experiment A: force and displacement' },
          verification: 'The model gives exactly 1 J for a 1 N force and a 1 m displacement along it (automated test).',
        },
      },
      { id: 'iii', label: '(iii) the expression for kinetic energy', status: 'upcoming', needs: ENERGY },
      { id: 'iv', label: '(iv) the expression for potential energy at a small height', status: 'upcoming', needs: ENERGY },
      { id: 'v', label: '(v) what power measures', status: 'upcoming', needs: POWER_MACHINES },
    ],
  },
  { number: 3, topic: 'A ball at its highest point', sections: ['7.4'], lessonIds: [], summary: 'For a ball thrown upwards, choose which of four statements about its force, acceleration, kinetic energy and potential energy are correct at the top.', parts: upParts(['the force on the ball', 'the acceleration of the ball', 'its kinetic energy', 'its potential energy'], ENERGY) },
  { number: 4, topic: 'Energy transformations', sections: ['7.3'], lessonIds: [], summary: 'Name the energy change in nine everyday situations, from a truck climbing a hill to a solar panel.', parts: upParts(['a truck moving uphill', 'unwinding of a watch spring', 'photosynthesis in green leaves', 'water flowing from a dam', 'burning of a matchstick', 'explosion of a fire cracker', 'speaking into a microphone', 'a glowing electric bulb', 'a solar panel'], ENERGY) },
  { number: 5, topic: 'Potential energy of a student in a lift and on stairs', sections: ['7.4.2'], lessonIds: [], summary: 'A student is lifted to the top of a building by an elevator and later climbs the stairs. Find the gain in potential energy each way and say how it depends on the path.', parts: upParts(['the gain in potential energy when lifted straight up', 'the gain in potential energy when climbing the stairs', 'what this shows about the path'], ENERGY) },
  { number: 6, topic: 'Crane: energy and power for two heights', sections: ['7.4.2', '7.5'], lessonIds: [], summary: 'A crane raises a mass to the 10th floor, then to the 20th floor in twice the time. Compare the extra energy and the power.', parts: single(`${ENERGY} and power`) },
  { number: 7, topic: 'Raising a flag with a pulley', sections: ['7.4.2', '7.5', '7.6.1'], lessonIds: [], summary: 'Say which factors fix the energy needed to raise a flag, whether raising it faster changes the work, and how the power changes if the speed doubles.', parts: single('the energy lessons, power and the pulley') },
  { number: 8, topic: 'Scooter fuel with one or two riders', sections: ['7.4.1', '7.5'], lessonIds: [], summary: 'A scooter and rider reach the same speed in the same time with and without a passenger. Compare the fuel used.', parts: single(ENERGY) },
  { number: 9, topic: 'A balanced seesaw', sections: ['7.6.3'], lessonIds: [], summary: 'Draw a seesaw balanced by a child and an adult who weighs twice as much, showing the distances from the pivot.', parts: single('the lever (Section 7.6.3)') },
  { number: 10, topic: 'A ball thrown upwards: gravity and air resistance', sections: ['7.1.2', '7.4'], lessonIds: ['pw-l3'], summary: 'A 2 kg ball is thrown up at 20 m/s. Give the sign of the work done by gravity going up and coming down, and find the work done by air resistance when it only reaches 19.4 m.',
    parts: [
      {
        id: 'i', label: '(i) the sign of the work done by gravity on the way up and on the way down', status: 'solved',
        solution: {
          given: ['A 2 kg ball is thrown upwards and later comes back down.'], find: ['The sign of the work done by gravity during the upward motion and during the downward motion.'],
          assumptions: ['Only the direction of gravity and of the displacement is needed, so the speed and the mass do not change the signs.'],
          hint: 'Which way does gravity act? Compare that with the displacement of the ball, first going up, then coming down.',
          reasoning: [
            { text: 'Gravity pulls the ball downwards all the time.', why: 'The weight acts towards the Earth, whichever way the ball moves.' },
            { text: 'Going up, the displacement is upwards, opposite to gravity, so gravity does negative work.', why: 'A force opposite to the displacement does negative work (like the goalkeeper stopping a ball).' },
            { text: 'Coming down, the displacement is downwards, along gravity, so gravity does positive work.', why: 'A force along the displacement does positive work.' },
          ],
          calculation: ['Going up through a height h: W = (−mg) × (+h) = −mgh (negative).', 'Coming down through h: W = (−mg) × (−h) = +mgh (positive).', 'For example with m = 2 kg, h = 10 m, g = 10 m/s²: −200 J going up and +200 J coming down.'],
          finalAnswer: 'Negative work on the way up; positive work on the way down.',
          commonMistake: 'Saying gravity does positive work because it is "the force that acts". The sign depends on the direction of the displacement relative to the force.',
          lab: { href: `${LAB}?experiment=C`, label: 'Experiment C: positive and negative work (the lifted box: gravity does the opposite sign to the hands)' },
          verification: 'The model gives −mgh for a displacement of +h and +mgh for −h, for several masses and heights (automated test).',
        },
      },
      { id: 'ii', label: '(ii) the work done by air resistance when the ball reaches 19.4 m', status: 'upcoming', needs: `${ENERGY} (kinetic and potential energy and the work-energy theorem)` },
    ],
  },
  { number: 11, topic: 'Variable force on a block', sections: ['7.1', '7.2', '7.4.1'], lessonIds: [], summary: 'A force that changes along the path acts on a 10 kg block on a frictionless floor, which starts with 180 J of kinetic energy. Read the graph to find its speed at 0 m and at 4 m, and say whether the acceleration is ever negative.', parts: upParts(['the speed at 0 m', 'the speed at 4 m', 'whether the block has negative acceleration anywhere'], `${ENERGY} and the area under a force-displacement graph`) },
  { number: 12, topic: 'Throwing a ball on the Moon', sections: ['7.4.2', '7.4.3'], lessonIds: [], summary: 'The Moon\'s gravity is about one sixth of the Earth\'s. A ball thrown up reaches 8 m on the Earth; find the height on the Moon with the same upward velocity.', parts: single(ENERGY) },
  { number: 13, topic: 'A braking car and its graph', sections: ['7.1.2', '7.4.1'], lessonIds: [], summary: 'A 1000 kg car brakes to a stop; a speed-time graph shows its motion. Describe the motion between two marked points, find its kinetic energy, the work done by the brakes, and where the kinetic energy goes.', parts: upParts(['how the car moves between A and B', 'the kinetic energy of the car at A', 'the work done by the brakes between B and C', 'what the kinetic energy changes into'], `${ENERGY} and reading the graph`) },
  { number: 14, topic: 'Potential energy graph of a ball on a track', sections: ['7.4.3'], lessonIds: [], summary: 'Use a potential energy against displacement graph for a 0.5 kg ball on a frictionless track to find its speed at three marked points.', parts: single('conservation of mechanical energy') },
  { number: 15, topic: 'A falling coconut', sections: ['7.4.3', '7.2'], lessonIds: [], summary: 'A 1.5 kg coconut falls 10 m onto wet sand. Find its speed just before it hits and the depth of the dent if the sand resists with 3000 N.', parts: upParts(['the speed just before hitting the sand', 'the depth of the depression'], ENERGY) },
];

export const exerciseSolved = (e: WorkExercise): boolean => e.parts.every((p) => p.status === 'solved');
export const solvedWorkParts = (): { number: number; part: string }[] => WORK_EXERCISES.flatMap((e) => e.parts.filter((p) => p.status === 'solved').map((p) => ({ number: e.number, part: p.id })));
export const workExerciseCounts = () => ({
  questions: WORK_EXERCISES.length,
  parts: WORK_EXERCISES.reduce((a, e) => a + e.parts.length, 0),
  solvedParts: solvedWorkParts().length,
  solvedQuestions: WORK_EXERCISES.filter(exerciseSolved).length,
});

/** Independent recomputation of every numerical or sign result stated in the solutions, from the Work Laboratory model. */
export function recomputeWorkAnswers(): { id: string; ok: boolean; detail: string }[] {
  const lab = (o: Partial<typeof DEFAULT_WORK>) => computeWork({ ...DEFAULT_WORK, ...o });
  const weightWork = (r: ReturnType<typeof computeWork>) => r.forces.find((f) => f.id === 'weight')!.work;
  const out: { id: string; ok: boolean; detail: string }[] = [];
  const push = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });
  push('1(i)', lab({ forceN: 10, displacement: 0 }).appliedWork === 0, 'a force with zero displacement does 0 J');
  const up = lab({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 2, startPos: 0, massKg: 2 });
  push('1(ii)', up.appliedWork === 40 && weightWork(up) === -40, 'lifting 2 kg by 2 m: +40 J by the lift, -40 J by gravity');
  push('2(i)', lab({ forceN: 10, displacement: 3 }).appliedWork === 30, 'W = F x s for force along the displacement');
  push('2(ii)', lab({ forceN: 1, displacement: 1, startPos: 0 }).appliedWork === 1, '1 N through 1 m is 1 J');
  for (const m of [0.5, 2, 7]) for (const h of [1, 4.5, 10]) {
    const upG = weightWork(lab({ axis: 'vertical', forceN: 0, displacement: h, startPos: 0, massKg: m }));
    const downG = weightWork(lab({ axis: 'vertical', forceN: 0, displacement: -h, startPos: h, massKg: m }));
    push(`10(i) m=${m} h=${h}`, Math.abs(upG + m * 10 * h) < 1e-9 && Math.abs(downG - m * 10 * h) < 1e-9, '-mgh up, +mgh down');
  }
  return out;
}
