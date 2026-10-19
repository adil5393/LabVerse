/**
 * NCERT exercises for Class 9 Physics, Chapter 4 "Describing Motion Around Us" (PHY-1A and PHY-1E).
 *
 * The chapter ends with sixteen questions under "Revise, Reflect, Refine". This file keeps that numbering and
 * order and gives every question, and every part of every question, a verified solution. The question summaries
 * are ORIGINAL paraphrases, not the textbook wording. Graph data for questions 6, 7, 12 and 13 were read from
 * the printed figures (the book gives no scale for 6 and 7, so those illustrations use stated, illustrative values
 * with the same shape; the data for 12 and 13 are read from the figures and question 13 is an estimate).
 *
 * Solutions follow: Try yourself, Hint, Step-by-step reasoning, Final answer, Explore in the lab.
 * Viewing a solution is never mastery evidence: this module is separate from the learning-progress store,
 * imports nothing from it, and nothing here is recorded anywhere.
 *
 * Every numerical answer can be recomputed from the motion engines (`recomputeAnswers`), which the tests do
 * against independent hand calculations.
 */

import { addMove, newPath, summary, type MotionPath } from './kinematics';
import { circleStateAt } from './circular';
import { equationValues } from './equations';
import { areaVT, averageAcceleration, stateAt, type GraphKind, type Profile } from './profile';
import { pathFromRoute, wholeTrip } from './speed';

export type ExerciseKind = 'numerical' | 'conceptual' | 'graph' | 'multi-select';

export interface SolutionStep { text: string; why: string }
export interface FinalAnswer {
  label: string;
  value: string;
  /** The part of the question this answers (a part id of the exercise). */
  part?: string;
  /** The number the answer states, for the automated recomputation. */
  numeric?: number;
  tolerance?: number;
}

export interface ModelCheck {
  /** Positions in metres: the starting position, then each target in turn (units: metres). */
  startM: number;
  targetsM: number[];
  /** Values the solution states, in metres; the tests recompute them from the motion model. */
  expect: { distanceM: number; displacementM: number };
}

export interface Shade { t0: number; t1: number; label: string; color: 'displacement' | 'distance' | 'velocity' | 'acceleration' }

export type Illustration =
  | { kind: 'graph'; caption: string; profile: Profile; graphs: GraphKind[]; shade?: Shade[] }
  | { kind: 'track'; caption: string; start: number; range: [number, number]; moves: number[]; durations: number[] }
  | { kind: 'circle'; caption: string; radiusM: number; periodS: number; startTime: number };

export interface LabLink { href: string; label: string }

export interface ExerciseSolution {
  kind: ExerciseKind;
  given: string[];
  find: string[];
  assumptions?: string[];
  /** The physical principle that settles the question. */
  principle: string;
  /** Formula selection and why each is the right one (numerical and graph questions). */
  formulas?: { formula: string; why: string }[];
  hint: string;
  steps: SolutionStep[];
  answers: FinalAnswer[];
  /** What the result means, in words. */
  explanation: string;
  model?: ModelCheck;
  illustrations?: Illustration[];
  /** Laboratories whose physical model is compatible with this question. */
  labs?: LabLink[];
  /** Why no laboratory is linked, when none fits. */
  labNote?: string;
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
  status: 'solved';
  /** Learn lessons that teach what is needed. */
  lessonIds: string[];
  solution: ExerciseSolution;
}

const V = (method: string) => ({ status: 'verified' as const, method });
const gp = (x0: number, v0: number, segs: [number, number][]): Profile => ({ x0, v0, segments: segs.map(([durationS, a]) => ({ durationS, a })) });

// Profiles used by both the illustrations and the recomputation.
const P4 = gp(0, 0, [[6, (24 - 0) / 6]]);
const P5 = (() => { const a = (0 - 28 * 28) / (2 * 98); return gp(0, 28, [[(0 - 28) / a, a]]); })();
const P6A = gp(0, 12, [[10, 0]]);
const P6B = gp(25, 7, [[10, 0]]);
const P8 = (() => { const u = 54 / 3.6, v = 36 / 3.6; return gp(0, u, [[36, (v - u) / 36]]); })();
const P9 = gp(0, 0, [[5, 20 / 5], [10, 0], [6, (0 - 20) / 6]]);
const P10 = gp(0, 36 / 3.6, [[0.5, 0], [4, -2.5]]);
const P12 = gp(0, 0, [[20, 3 / 20], [80, 0], [20, (2 - 3) / 20]]);
const P14 = gp(0, 6, [[120, 0], [6, 1]]);
const P15A = gp(0, 0, [[5, 5 / 5]]);
const P15B = gp(0, 0, [[10, 3 / 10]]);
const Q7_A = { start: 0, range: [-10, 100] as [number, number], moves: [80], durations: [10] };
const Q7_B = { start: 0, range: [-10, 100] as [number, number], moves: [13, 43, 80], durations: [4, 3.6, 2.4] };

/** Velocity (km/h) at the times (h) read from Fig. 4.31; question 13 is an estimate from these readings. */
export const Q13_POINTS: [number, number][] = [[0, 7], [0.6, 7], [1.6, 7.5], [3.0, 7.5], [4.6, 7], [5.6, 6.5], [6.6, 6.5]];
export const trapezoidArea = (pts: [number, number][]): number => pts.slice(1).reduce((s, [t, v], i) => s + ((pts[i][1] + v) / 2) * (t - pts[i][0]), 0);

export const MOTION_EXERCISES: MotionExercise[] = [
  {
    number: 1,
    parts: [{ id: 'a', label: 'total distance travelled' }, { id: 'b', label: 'displacement from home' }],
    summary: 'A person walks 250 m along a straight road to a shop, returns home for a forgotten bag, goes to the shop again and finally comes home. Find the total distance and the displacement from home.',
    topic: 'Distance and displacement', sections: ['4.1.2'], status: 'solved', lessonIds: ['pm-l2', 'pm-l3'],
    solution: {
      kind: 'numerical',
      given: ['The shop is 250 m from home on a straight road.', 'Trip: home to shop, shop to home, home to shop, shop to home.'],
      find: ['(a) The total distance travelled.', '(b) The displacement from home at the end.'],
      assumptions: ['Take home as the reference point O and the direction of the shop as positive.'],
      principle: 'Distance is the total length of the path; displacement is the final position minus the initial position.',
      formulas: [{ formula: 'distance = sum of the lengths of all legs', why: 'The path is made of four straight legs.' }, { formula: 'displacement = final position − initial position', why: 'Only where the walk starts and ends matters.' }],
      hint: 'Count how many times the 250 m stretch is walked. Then ask where the person is at the end compared with the start.',
      steps: [
        { text: 'Put home at O = 0 m and the shop at +250 m.', why: 'A reference point and a direction are needed to describe positions.' },
        { text: 'The four legs are 0 → 250, 250 → 0, 0 → 250, 250 → 0. Each is 250 m long.', why: 'Distance adds up the length of every leg, whichever way it goes.' },
        { text: 'Total distance = 4 × 250 m = 1000 m.', why: 'Distance is path length, so every leg counts in full.' },
        { text: 'The final position is home, 0 m. Displacement = final − initial = 0 − 0 = 0 m.', why: 'Displacement depends only on where the person starts and ends.' },
      ],
      answers: [{ label: '(a) Total distance', value: '1000 m', part: 'a', numeric: 1000 }, { label: '(b) Displacement from home', value: '0 m', part: 'b', numeric: 0 }],
      explanation: 'The person walked a long way (1000 m) but ended where the walk began, so the net change of position is zero.',
      model: { startM: 0, targetsM: [250, 0, 250, 0], expect: { distanceM: 1000, displacementM: 0 } },
      labs: [{ href: '/physics/motion/lab?experiment=B', label: 'Explore returning home' }],
      verification: V('Recomputed from the motion model (automated test); matches hand calculation.'),
    },
  },
  {
    number: 2,
    parts: [{ id: 'i', label: '(i) total vertical distance' }, { id: 'ii', label: '(ii) displacement from the starting point' }],
    summary: 'A student climbs from the ground floor to the fourth floor of a school, then walks down to the second floor. Each floor is 3 m high. Find the total vertical distance travelled and the displacement from the start.',
    topic: 'Distance and displacement (vertical line)', sections: ['4.1.2'], status: 'solved', lessonIds: ['pm-l2', 'pm-l3'],
    solution: {
      kind: 'numerical',
      given: ['Each floor is 3 m above the one below.', 'Start: ground floor. Up to the fourth floor, then down to the second floor.'],
      find: ['(i) The total vertical distance travelled.', '(ii) The displacement from the starting point.'],
      assumptions: ['The ground floor is height 0 m, so the fourth floor is 4 × 3 = 12 m up and the second floor is 2 × 3 = 6 m up. Up is taken as positive.'],
      principle: 'Distance is path length (every leg counts in full); displacement is final position minus initial position.',
      formulas: [{ formula: 'distance = Σ |leg|', why: 'Two legs, one up and one down.' }, { formula: 'displacement = final − initial', why: 'Only the start and end heights matter.' }],
      hint: 'Write the three heights above the ground. Then add the lengths of the two legs, and subtract start from end for the displacement.',
      steps: [
        { text: 'Heights above the ground floor: ground 0 m, second floor 6 m, fourth floor 12 m.', why: 'Choosing the ground floor as the reference point turns the building into a vertical number line.' },
        { text: 'Leg 1: 0 → 12 m, length 12 m. Leg 2: 12 → 6 m, length 6 m.', why: 'Each leg is a straight movement in one direction.' },
        { text: 'Total vertical distance = 12 m + 6 m = 18 m.', why: 'Distance adds the lengths of all legs; the downward leg counts as a positive length.' },
        { text: 'Displacement = final − initial = 6 m − 0 m = +6 m, that is 6 m upward from the start.', why: 'Only the start and end positions matter for displacement, and its sign gives the direction.' },
      ],
      answers: [{ label: '(i) Total vertical distance', value: '18 m', part: 'i', numeric: 18 }, { label: '(ii) Displacement', value: '6 m upward (+6 m)', part: 'ii', numeric: 6 }],
      explanation: 'The student travelled 18 m of path but is only 6 m (two floors) above the start, because the downward leg undid part of the climb.',
      model: { startM: 0, targetsM: [12, 6], expect: { distanceM: 18, displacementM: 6 } },
      labs: [{ href: '/physics/motion/lab?experiment=C', label: 'Explore changing direction' }],
      verification: V('Recomputed from the motion model (automated test); matches hand calculation.'),
    },
  },
  {
    number: 3,
    parts: [{ id: 'a', label: 'is it possible to accelerate at a constant speedometer reading' }, { id: 'b', label: 'how' }],
    summary: 'A girl rides a scooter whose speedometer reading stays constant. Can the scooter still be accelerating? If so, how?',
    topic: 'Acceleration and direction of motion', sections: ['4.1.4', '4.4.1'], status: 'solved', lessonIds: ['pm-l6', 'pm-l10'],
    solution: {
      kind: 'conceptual',
      given: ['The speedometer reading, which is the speed, does not change.'],
      find: ['(a) Whether the scooter can be accelerating.', '(b) How that can happen.'],
      principle: 'Acceleration is the rate of change of velocity. Velocity has a size (the speed) and a direction, so it changes if either of them changes.',
      hint: 'A speedometer shows only the size of the velocity. What else could change?',
      steps: [
        { text: 'The speedometer shows the speed, which is the size of the velocity. It says nothing about the direction.', why: 'Speed has no direction; velocity does.' },
        { text: 'Acceleration is (change in velocity) ÷ time. The velocity changes if its size changes or if its direction changes.', why: 'A change in either part of the velocity is a change in the velocity.' },
        { text: 'On a straight road at a constant speed the direction does not change either, so the velocity is constant and the acceleration is zero.', why: 'This is the case where the answer is "no".' },
        { text: 'If the scooter takes a bend or goes round a circular track at a constant speed, the direction of its velocity keeps changing, so its velocity changes and it is accelerating (towards the centre of the curve).', why: 'This is uniform circular motion: constant speed, changing velocity.' },
      ],
      answers: [{ label: '(a) Possible?', value: 'Yes', part: 'a' }, { label: '(b) How', value: 'By changing direction: on a curve or a circle the velocity changes even though the speed does not.', part: 'b' }],
      explanation: 'A constant speedometer reading only means a constant speed. Turning changes the direction of the velocity, and that is enough for an acceleration.',
      illustrations: [{ kind: 'circle', caption: 'Radius 10 m, period 20 s: the speed stays 3.14 m/s but the velocity keeps turning.', radiusM: 10, periodS: 20, startTime: 5 }],
      labs: [{ href: '/physics/motion/circular', label: 'Explore constant speed with changing velocity' }],
      verification: V('Reasoned from the definition of acceleration; the circular-motion engine confirms constant speed with a turning velocity (automated test).'),
    },
  },
  {
    number: 4,
    parts: [{ id: 'a', label: 'average acceleration' }, { id: 'b', label: 'distance travelled in the 6 s' }],
    summary: 'A car starts from rest and reaches 24 m/s in 6 s. Find the average acceleration and the distance covered in those 6 s.',
    topic: 'Average acceleration; kinematic equations', sections: ['4.1.4', '4.3'], status: 'solved', lessonIds: ['pm-l6', 'pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['u = 0 (starts from rest)', 'v = 24 m/s', 't = 6 s'],
      find: ['(a) The average acceleration a.', '(b) The distance travelled in 6 s.'],
      assumptions: ['Straight-line motion with constant acceleration, so the distance equals the displacement.'],
      principle: 'Acceleration is the change in velocity per unit time; for constant acceleration in a straight line the equations of motion apply.',
      formulas: [{ formula: 'a = (v − u) ÷ t', why: 'u, v and t are known and a is wanted.' }, { formula: 's = ut + ½at²', why: 'Now u, a and t are known and s is wanted.' }],
      hint: 'First find how much the velocity changes each second. Then use the equation that has the displacement, the acceleration and the time.',
      steps: [
        { text: 'a = (v − u) ÷ t = (24 − 0) m/s ÷ 6 s = 4 m/s².', why: 'Average acceleration = change in velocity ÷ time.' },
        { text: 's = ut + ½at² = 0 × 6 + ½ × 4 × 6² = 72 m.', why: 'u = 0, so only the acceleration term remains.' },
        { text: 'Check: s = ½(u + v)t = ½ × 24 × 6 = 72 m (the area of the triangle on the velocity–time graph).', why: 'A second route must give the same distance.' },
      ],
      answers: [{ label: '(a) Average acceleration', value: '4 m/s²', part: 'a', numeric: 4 }, { label: '(b) Distance', value: '72 m', part: 'b', numeric: 72 }],
      explanation: 'The velocity rises by 4 m/s each second. The car covers 72 m, which is more than half of the 144 m it would cover at the final speed for 6 s.',
      illustrations: [{ kind: 'graph', caption: 'u = 0, a = 4 m/s² for 6 s. The area under the v–t graph is the distance.', profile: P4, graphs: ['xt', 'vt'] }],
      labs: [{ href: '/physics/motion/equations?u=0&a=4&d=6', label: 'Equation Laboratory with u = 0, a = 4 m/s², t = 6 s' }],
      verification: V('Recomputed with the equation and constant-acceleration engines; checked by the trapezoid area.'),
    },
  },
  {
    number: 5,
    parts: [{ id: 'a', label: 'acceleration' }, { id: 'b', label: 'time to stop' }],
    summary: 'A motorbike at 28 m/s moves with constant acceleration and stops after 98 m. Find the acceleration and the time taken to stop.',
    topic: 'Kinematic equations', sections: ['4.3'], status: 'solved', lessonIds: ['pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['u = 28 m/s', 'v = 0 (it stops)', 's = 98 m'],
      find: ['(a) The acceleration a.', '(b) The time t to stop.'],
      assumptions: ['Constant acceleration in a straight line; the direction of motion is positive.'],
      principle: 'For constant acceleration the three equations of motion connect u, v, a, t and s.',
      formulas: [{ formula: 'v² = u² + 2as', why: 'u, v and s are known, the time is not, and a is wanted.' }, { formula: 'v = u + at', why: 'With a known, this gives the time directly.' }],
      hint: 'Which equation has no time in it? Use it for the acceleration, then find the time.',
      steps: [
        { text: '0 = 28² + 2 × a × 98, so 196a = −784 and a = −4 m/s².', why: 'The time is not given, so use v² = u² + 2as.' },
        { text: 'The negative sign means the acceleration points opposite to the velocity: the bike slows down.', why: 'Signs carry the direction.' },
        { text: '0 = 28 + (−4) × t, so t = 28 ÷ 4 = 7 s.', why: 'v = u + at with the known acceleration.' },
        { text: 'Check: s = ut + ½at² = 28 × 7 + ½(−4)(49) = 196 − 98 = 98 m.', why: 'A second equation must reproduce the given distance.' },
      ],
      answers: [{ label: '(a) Acceleration', value: '−4 m/s² (4 m/s² opposite to the motion)', part: 'a', numeric: -4 }, { label: '(b) Time to stop', value: '7 s', part: 'b', numeric: 7 }],
      explanation: 'The bike loses 4 m/s every second, so it takes 7 s to lose its 28 m/s, and it covers 98 m in that time.',
      illustrations: [{ kind: 'graph', caption: 'u = 28 m/s, a = −4 m/s² for 7 s: the velocity reaches zero and the position reaches 98 m.', profile: P5, graphs: ['xt', 'vt'] }],
      labs: [{ href: '/physics/motion/equations?u=28&a=-4&d=7', label: 'Equation Laboratory with u = 28 m/s, a = −4 m/s², t = 7 s' }],
      verification: V('Recomputed with the equation engine and the exact motion profile; checked with s = ut + ½at².'),
    },
  },
  {
    number: 6,
    summary: 'Two objects A and B move in the same direction on parallel tracks and their position–time graphs are two straight lines that cross at t = 5 s. Do they ever have equal velocity? Justify.',
    topic: 'Position–time graphs', sections: ['4.2.2'], status: 'solved', lessonIds: ['pm-l7'],
    solution: {
      kind: 'graph',
      given: ['Fig. 4.27: both graphs are straight lines with different slopes (A steeper than B).', 'The lines cross at t = 5 s.'],
      find: ['Whether A and B ever have the same velocity.'],
      principle: 'The slope of a position–time graph is the velocity. A straight line has the same slope everywhere, so its velocity is constant.',
      formulas: [{ formula: 'velocity = slope = Δx ÷ Δt', why: 'The graph gives positions at different times.' }],
      hint: 'Compare the slopes of the two lines. What does the crossing point tell you?',
      steps: [
        { text: 'Each graph is a straight line, so each object moves with a constant velocity (uniform motion).', why: 'A constant slope means a constant velocity.' },
        { text: 'The two lines have different slopes: A is steeper, so A has the larger velocity at all times.', why: 'The slope is the velocity, and steeper means faster.' },
        { text: 'The lines cross at t = 5 s. That means both objects are at the same position at that instant (they meet), not that they have the same velocity.', why: 'A shared point means equal position; equal velocity needs equal slopes.' },
        { text: 'Since the slopes never change, the velocities are never equal.', why: 'Two different constants never become equal.' },
      ],
      answers: [{ label: 'Do they ever have equal velocity?', value: 'No. Their slopes differ, so A is always faster than B; they only share a position at 5 s.' }],
      explanation: 'Meeting and moving with the same velocity are different things: A overtakes B at 5 s precisely because it is faster.',
      illustrations: [
        { kind: 'graph', caption: 'Object A (illustrative values with the same shape as Fig. 4.27): starts at O, moves at 12 m/s.', profile: P6A, graphs: ['xt', 'vt'] },
        { kind: 'graph', caption: 'Object B (illustrative): starts at +25 m, moves at 7 m/s. Both are at 60 m at t = 5 s.', profile: P6B, graphs: ['xt', 'vt'] },
      ],
      labNote: 'The textbook figure has no scale. The two illustrations use values with the same shape (the lines cross at 5 s with A steeper); they are not data from the book.',
      verification: V('Slopes of the two straight lines compared; the illustrative values reproduce the crossing at 5 s (automated test).'),
    },
  },
  {
    number: 7,
    parts: [{ id: 'i', label: '(i) equal average velocity' }, { id: 'ii', label: '(ii) equal average speeds' }, { id: 'iii', label: '(iii) A slower than B' }, { id: 'iv', label: '(iv) A faster than B' }],
    summary: 'Two objects A and B move in a straight line from 0 to 10 s. A\'s graph is a straight line; B\'s graph goes up in steps of different steepness but ends at the same place. Choose the correct statements about their average velocities and average speeds.',
    topic: 'Average speed and velocity from graphs', sections: ['4.1.3', '4.2.2'], status: 'solved', lessonIds: ['pm-l4', 'pm-l5', 'pm-l7'],
    solution: {
      kind: 'multi-select',
      given: ['Fig. 4.28: A is a straight line from the origin; B starts at the same point, rises with three different slopes and ends at the same point as A at 10 s.', 'Neither graph ever goes downward: neither object turns back.'],
      find: ['Which of the four statements are correct.'],
      principle: 'Average velocity = displacement ÷ time; average speed = distance ÷ time. When an object never turns back, the distance equals the size of the displacement.',
      hint: 'Compare the start and end positions for the displacement. Then ask whether either object ever moved backwards.',
      steps: [
        { text: 'Both start at the same position and end at the same position after 10 s, so both have the same displacement over 10 s.', why: 'Displacement depends only on the start and end positions.' },
        { text: '(i) Average velocity = displacement ÷ time, and the displacements and times are equal, so the average velocities are equal. Statement (i) is correct.', why: 'Same numerator, same denominator.' },
        { text: 'Neither graph goes down at any time, so neither object turns back: for each one the distance equals its displacement.', why: 'Without turning back, distance and displacement have the same size.' },
        { text: '(ii) The distances are equal and the times are equal, so the average speeds are equal. Statement (ii) is correct.', why: 'Average speed = distance ÷ time.' },
        { text: '(iii) is false, because A does not cover a shorter distance. (iv) is false: B is slower than A in the first segments but faster in the last one, and those differences cancel over the 10 s.', why: 'A speed that is lower in some segments and higher in others does not make the average speed lower or higher by itself.' },
      ],
      answers: [
        { label: '(i)', value: 'Correct', part: 'i' }, { label: '(ii)', value: 'Correct', part: 'ii' },
        { label: '(iii)', value: 'Incorrect', part: 'iii' }, { label: '(iv)', value: 'Incorrect', part: 'iv' },
      ],
      explanation: 'Only the totals matter for averages: the same displacement and distance in the same time give the same average velocity and the same average speed, even though B\'s speed varies from segment to segment.',
      illustrations: [
        { kind: 'track', caption: 'Object A (illustrative values): O to +80 m in 10 s at a steady speed.', ...Q7_A },
        { kind: 'track', caption: 'Object B (illustrative values with the same shape as Fig. 4.28): three segments of increasing speed, ending at +80 m after 10 s.', ...Q7_B },
      ],
      labNote: 'The textbook figure has no scale. The illustrations use stated values with the same shape; the model idealises the changes of speed as instantaneous.',
      verification: V('Average speed and velocity of the illustrative paths recomputed with the motion engine (automated test): equal for A and B.'),
    },
  },
  {
    number: 8,
    summary: 'A truck driver slows from 54 km/h to 36 km/h in 36 s because of a speed-limit sign. Find the distance covered during this time, assuming constant acceleration.',
    topic: 'Kinematic equations; unit conversion', sections: ['4.3'], status: 'solved', lessonIds: ['pm-l4', 'pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['u = 54 km/h', 'v = 36 km/h', 't = 36 s'],
      find: ['The distance travelled in the 36 s.'],
      assumptions: ['Constant acceleration in a straight line, so the distance equals the displacement.'],
      principle: 'For constant acceleration the displacement equals the average velocity times the time. All quantities must be in the same units (SI).',
      formulas: [{ formula: 'a = (v − u) ÷ t', why: 'To find the acceleration first.' }, { formula: 's = ut + ½at²', why: 'u, a and t are then known.' }],
      hint: 'Change the speeds to m/s first (divide km/h by 3.6). Then find the acceleration and use the equation for the displacement.',
      steps: [
        { text: 'u = 54 ÷ 3.6 = 15 m/s and v = 36 ÷ 3.6 = 10 m/s.', why: 'Use SI units so that metres and seconds agree.' },
        { text: 'a = (10 − 15) ÷ 36 = −5/36 m/s² ≈ −0.139 m/s².', why: 'The truck slows down, so the acceleration is negative.' },
        { text: 's = ut + ½at² = 15 × 36 + ½ × (−5/36) × 36² = 540 − 90 = 450 m.', why: 'The second term is negative because of the deceleration.' },
        { text: 'Check: s = ½(u + v)t = ½ × (15 + 10) × 36 = 450 m.', why: 'The average velocity 12.5 m/s times 36 s agrees.' },
      ],
      answers: [{ label: 'Distance travelled', value: '450 m', numeric: 450 }],
      explanation: 'The truck\'s average speed over the 36 s is halfway between 15 m/s and 10 m/s, 12.5 m/s, and 12.5 m/s × 36 s = 450 m.',
      illustrations: [{ kind: 'graph', caption: 'u = 15 m/s and a = −5/36 m/s² for 36 s (exact): the position reaches 450 m.', profile: P8, graphs: ['xt', 'vt'] }],
      labNote: 'The deceleration (−5/36 m/s²) is not a round number, so it is not offered as a typed value in the laboratory; the illustration uses the exact value.',
      verification: V('Recomputed with the exact motion profile; matches s = ½(u + v)t.'),
    },
  },
  {
    number: 9,
    summary: 'A car starts from rest and accelerates uniformly to 20 m/s in 5 s, then travels at 20 m/s for 10 s and finally brakes uniformly to a stop in 6 s. Find the total distance travelled.',
    topic: 'Velocity–time graph areas', sections: ['4.2.3', '4.3'], status: 'solved', lessonIds: ['pm-l8', 'pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['Stage 1: from rest to 20 m/s in 5 s.', 'Stage 2: constant 20 m/s for 10 s.', 'Stage 3: from 20 m/s to rest in 6 s.'],
      find: ['The total distance travelled.'],
      assumptions: ['Straight-line motion in one direction, so the distance equals the displacement. Each stage has its own constant acceleration.'],
      principle: 'The area under a velocity–time graph is the displacement, and the three stages form a triangle, a rectangle and a triangle.',
      formulas: [{ formula: 'displacement = area under the v–t graph', why: 'The acceleration changes between stages, so one equation of motion cannot cover them all.' }, { formula: 's = ½ × base × height, s = base × height', why: 'Areas of the triangles and the rectangle.' }],
      hint: 'Sketch the velocity–time graph: up, flat, down. Find the area of each piece.',
      steps: [
        { text: 'Stage 1 (triangle): ½ × 5 s × 20 m/s = 50 m.', why: 'The velocity rises uniformly from 0 to 20 m/s.' },
        { text: 'Stage 2 (rectangle): 10 s × 20 m/s = 200 m.', why: 'Constant velocity.' },
        { text: 'Stage 3 (triangle): ½ × 6 s × 20 m/s = 60 m.', why: 'The velocity falls uniformly from 20 m/s to 0.' },
        { text: 'Total = 50 + 200 + 60 = 310 m.', why: 'The whole area is the total distance (the car never reverses).' },
      ],
      answers: [{ label: 'Total distance', value: '310 m', numeric: 310 }],
      explanation: 'Most of the distance is covered in the steady stage, but the speeding-up and braking stages together add 110 m.',
      illustrations: [{ kind: 'graph', caption: 'The three stages as one motion (accelerations +4, 0 and −3.33 m/s²). Move to 21 s to read the total.', profile: P9, graphs: ['xt', 'vt'], shade: [{ t0: 0, t1: 5, label: 'Stage 1: 50 m', color: 'displacement' }, { t0: 5, t1: 15, label: 'Stage 2: 200 m', color: 'distance' }, { t0: 15, t1: 21, label: 'Stage 3: 60 m', color: 'acceleration' }] }],
      labNote: 'The Graph Studio presets use a single constant acceleration, so this three-stage motion is shown as an illustration only.',
      verification: V('Recomputed as the signed area of the three-stage profile (automated test); checked by adding the three areas by hand.'),
    },
  },
  {
    number: 10,
    summary: 'A bus travelling at 36 km/h sees an obstacle 30 m ahead. The driver takes 0.5 s to react, then brakes with a constant deceleration of 2.5 m/s². Will the bus stop before reaching the obstacle?',
    topic: 'Reaction time and stopping distance', sections: ['4.3'], status: 'solved', lessonIds: ['pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['u = 36 km/h = 10 m/s', 'reaction time 0.5 s (the bus keeps its speed)', 'braking deceleration 2.5 m/s²', 'the obstacle is 30 m ahead'],
      find: ['The total stopping distance, and whether it is less than 30 m.'],
      assumptions: ['The bus moves at a constant 10 m/s during the reaction time; the deceleration is then constant.'],
      principle: 'Total stopping distance = distance covered during the reaction time (constant velocity) + braking distance (constant deceleration).',
      formulas: [{ formula: 's = vt', why: 'During the reaction time the velocity is constant.' }, { formula: 'v² = u² + 2as', why: 'For the braking stage the time is not needed.' }],
      hint: 'Split the motion into two stages: before braking starts and after it. Add their distances.',
      steps: [
        { text: 'u = 36 ÷ 3.6 = 10 m/s.', why: 'Convert to SI units.' },
        { text: 'Reaction stage: s₁ = 10 m/s × 0.5 s = 5 m.', why: 'No acceleration yet: distance = velocity × time.' },
        { text: 'Braking stage: 0 = 10² + 2 × (−2.5) × s₂, so s₂ = 100 ÷ 5 = 20 m.', why: 'The bus must lose all of its velocity; the time is not needed.' },
        { text: 'Total distance = 5 m + 20 m = 25 m, which is less than 30 m.', why: 'Compare with the distance to the obstacle.' },
      ],
      answers: [{ label: 'Total stopping distance', value: '25 m', numeric: 25 }, { label: 'Does it stop before the obstacle?', value: 'Yes, with 5 m to spare' }],
      explanation: 'The reaction time alone costs 5 m, a quarter of the braking distance. With a slower reaction (about 1.0 s) the bus would need 30 m and would just reach the obstacle.',
      illustrations: [{ kind: 'graph', caption: 'A 0.5 s stage at constant 10 m/s then braking at −2.5 m/s²: the bus stops at 25 m.', profile: P10, graphs: ['xt', 'vt'] }],
      labNote: 'The motion has two stages with different accelerations, so it is shown as an illustration; the Equation Laboratory (one constant acceleration) is used for the braking stage alone.',
      verification: V('Recomputed with the two-stage motion profile (automated test); matches the hand calculation.'),
    },
  },
  {
    number: 11,
    summary: 'Someone says "the Earth moves around the Sun". Discuss whether an object kept on the Earth can be called at rest.',
    topic: 'Reference point; rest and motion', sections: ['4.1.1'], status: 'solved', lessonIds: ['pm-l1'],
    solution: {
      kind: 'conceptual',
      given: ['An object sits on the Earth (for example a book on a table).', 'The Earth moves around the Sun.'],
      find: ['Whether the object can be called at rest.'],
      principle: 'Rest and motion are defined with respect to a reference point: an object is at rest if its position with respect to that point does not change with time.',
      hint: 'The textbook defines "at rest" using a reference point. Ask: at rest compared with what?',
      steps: [
        { text: 'An object is at rest when its position with respect to the chosen reference point does not change with time.', why: 'This is the textbook\'s definition; rest and motion are always stated with respect to a reference point.' },
        { text: 'Take the table (or the Earth\'s surface) as the reference point: the book\'s distance and direction from it never change, so the book is at rest.', why: 'Its position with respect to that reference point stays the same.' },
        { text: 'Take the Sun as the reference point: the book\'s position with respect to the Sun keeps changing, because the Earth moves around the Sun, so the book is in motion.', why: 'A different reference point can give a different answer.' },
        { text: 'So the statement "at rest" is complete only when the reference point is named. On the Earth it is natural to use the Earth itself, and then the object is at rest.', why: 'There is no reference-free "absolute rest" in this chapter.' },
      ],
      answers: [{ label: 'Conclusion', value: 'At rest with respect to the Earth; in motion with respect to the Sun. Rest and motion depend on the reference point.' }],
      explanation: 'Neither statement is wrong; they use different reference points.',
      labs: [{ href: '/physics/motion/learn/pm-l1', label: 'Revisit reference points' }],
      verification: V('Reasoned directly from the textbook definition of rest and motion in Section 4.1.1.'),
    },
  },
  {
    number: 12,
    parts: [{ id: 'i', label: '(i) area while the velocity is constant' }, { id: 'ii', label: '(ii) area while the velocity is decreasing' }, { id: 'iii', label: 'displacement in 120 s' }, { id: 'iv', label: 'average acceleration in 120 s' }],
    summary: 'A cyclist\'s velocity–time graph runs for 120 s. Shade the area for the constant-velocity stage and the area for the decreasing-velocity stage, then find the displacement and the average acceleration over the 120 s.',
    topic: 'Velocity–time graph', sections: ['4.2.3'], status: 'solved', lessonIds: ['pm-l8'],
    solution: {
      kind: 'graph',
      given: ['Fig. 4.30 (read from the figure): v rises from 0 to 3 m/s in the first 20 s, stays at 3 m/s from 20 s to 100 s, then falls to 2 m/s at 120 s.'],
      find: ['(i) Shade the constant-velocity stage; (ii) shade the decreasing-velocity stage.', '(iii) The displacement in 120 s.', '(iv) The average acceleration in 120 s.'],
      assumptions: ['Values are read from the printed graph; the cyclist moves in one direction.'],
      principle: 'The area under a velocity–time graph is the displacement; the average acceleration is the change in velocity divided by the time.',
      formulas: [{ formula: 'displacement = area under the v–t graph', why: 'Each stage is a triangle, a rectangle or a trapezoid.' }, { formula: 'a = (v − u) ÷ t', why: 'Average acceleration over the whole interval.' }],
      hint: 'Split the graph into three pieces: the rise, the flat part and the fall. The flat part is a rectangle; the fall is a trapezoid.',
      steps: [
        { text: '(i) The constant-velocity stage is from 20 s to 100 s at 3 m/s. Its area is the rectangle 80 s × 3 m/s = 240 m.', why: 'Rectangle: base × height.' },
        { text: '(ii) The decreasing-velocity stage is from 100 s to 120 s, from 3 m/s down to 2 m/s. Its area is the trapezoid ½ × (3 + 2) × 20 = 50 m.', why: 'Trapezoid: ½ × (sum of the parallel sides) × width.' },
        { text: 'The first 20 s (rising from 0 to 3 m/s) is a triangle: ½ × 20 × 3 = 30 m.', why: 'It also belongs to the displacement.' },
        { text: '(iii) Displacement = 30 + 240 + 50 = 320 m.', why: 'The whole area under the graph.' },
        { text: '(iv) Average acceleration = (2 − 0) m/s ÷ 120 s = 1/60 m/s² ≈ 0.017 m/s².', why: 'Change in velocity over the whole interval, ignoring what happens in between.' },
      ],
      answers: [
        { label: '(i) Constant-velocity area', value: '240 m', part: 'i', numeric: 240 },
        { label: '(ii) Decreasing-velocity area', value: '50 m', part: 'ii', numeric: 50 },
        { label: '(iii) Displacement', value: '320 m', part: 'iii', numeric: 320 },
        { label: '(iv) Average acceleration', value: '≈ 0.017 m/s² (1/60 m/s²)', part: 'iv', numeric: 1 / 60, tolerance: 0.001 },
      ],
      explanation: 'The average acceleration is small and positive because the cyclist ends slightly faster than she began, even though she slowed down at the end.',
      illustrations: [{ kind: 'graph', caption: 'The cyclist\'s velocity–time graph with the two stages shaded and labelled (values read from Fig. 4.30).', profile: P12, graphs: ['vt', 'xt'], shade: [{ t0: 20, t1: 100, label: '(i) constant velocity: 240 m', color: 'displacement' }, { t0: 100, t1: 120, label: '(ii) velocity decreasing: 50 m', color: 'distance' }] }],
      labNote: 'The values are read from the printed figure. The shaded graph above is an illustration; the Graph Studio presets use a single constant acceleration.',
      verification: V('Areas recomputed from the multi-stage profile (automated test) and by adding triangle, rectangle and trapezoid areas by hand.'),
    },
  },
  {
    number: 13,
    summary: 'A girl preparing for her first marathon runs on a straight road. Her velocity–time graph (velocity in km/h against time in hours) is given. Estimate the distance she ran.',
    topic: 'Area under a velocity–time graph', sections: ['4.2.3'], status: 'solved', lessonIds: ['pm-l8'],
    solution: {
      kind: 'graph',
      given: ['Fig. 4.31 (read from the figure, approximate): the velocity is about 7 km/h at 0 h and 0.6 h, about 7.5 km/h between 1.6 h and 3.0 h, about 7 km/h at 4.6 h and about 6.5 km/h from 5.6 h to 6.6 h.'],
      find: ['An estimate of the distance run.'],
      assumptions: ['The readings are approximate, so the answer is an estimate; the straight road means the distance equals the displacement.'],
      principle: 'The area between a velocity–time graph and the time axis is the displacement, which here equals the distance. Between the read points the graph is treated as straight lines (trapezoids).',
      formulas: [{ formula: 'distance ≈ Σ ½ (v₁ + v₂) Δt', why: 'Each strip between two readings is a trapezoid.' }],
      hint: 'Cut the area into strips between the read points. Each strip is a trapezoid with the velocity values as its parallel sides.',
      steps: [
        { text: '0 to 0.6 h: 7 × 0.6 = 4.2 km.', why: 'Constant velocity: a rectangle.' },
        { text: '0.6 to 1.6 h: ½ (7 + 7.5) × 1.0 = 7.25 km.', why: 'The velocity changes between the two readings: a trapezoid.' },
        { text: '1.6 to 3.0 h: 7.5 × 1.4 = 10.5 km.', why: 'The velocity is constant here: a rectangle.' },
        { text: '3.0 to 4.6 h: ½ (7.5 + 7) × 1.6 = 11.6 km. 4.6 to 5.6 h: ½ (7 + 6.5) × 1.0 = 6.75 km. 5.6 to 6.6 h: 6.5 × 1.0 = 6.5 km.', why: 'Two trapezoids and a rectangle, added strip by strip.' },
        { text: 'Total ≈ 4.2 + 7.25 + 10.5 + 11.6 + 6.75 + 6.5 = 46.8 km, about 47 km.', why: 'Add the strips. Because the readings are approximate, an answer of roughly 45 to 49 km is reasonable.' },
      ],
      answers: [{ label: 'Estimated distance', value: 'about 47 km (roughly 45 to 49 km, depending on how closely the graph is read)', numeric: 46.8, tolerance: 2 }],
      explanation: 'Her velocity stays close to 7 km/h throughout, so the distance is about 7 km/h × 6.6 h ≈ 46 km, in agreement with the strip-by-strip estimate.',
      labNote: 'This graph uses km/h and hours. The Graph Studio works in m/s and seconds with a constant acceleration, so it does not reproduce this graph; the strip method is the one used in Lesson 8.',
      verification: V('Strip areas recomputed (automated test); the result is an estimate from approximate readings of the printed figure.'),
    },
  },
  {
    number: 14,
    summary: 'On entering a state highway a car moves with a constant velocity of 6 m/s for 2 minutes and then accelerates at 1 m/s² for 6 s. Find the displacement over the 2 min 6 s using a velocity–time graph.',
    topic: 'Velocity–time graph; unit conversion', sections: ['4.2.3', '4.3'], status: 'solved', lessonIds: ['pm-l8', 'pm-l9'],
    solution: {
      kind: 'numerical',
      given: ['Stage 1: constant velocity 6 m/s for 2 min = 120 s.', 'Stage 2: acceleration 1 m/s² for 6 s, starting from 6 m/s.'],
      find: ['The displacement in 2 min 6 s (126 s).'],
      assumptions: ['Straight-line motion in one direction.'],
      principle: 'The area under the velocity–time graph is the displacement.',
      formulas: [{ formula: 'area = base × height; area of a trapezoid = ½ (v₁ + v₂) t', why: 'The graph is a rectangle followed by a trapezoid.' }, { formula: 'v = u + at', why: 'The velocity at the end of stage 2.' }],
      hint: 'Change the 2 minutes to seconds. The graph is flat for 120 s, then slopes up for 6 s.',
      steps: [
        { text: '2 min = 120 s. Stage 1 area (rectangle) = 120 s × 6 m/s = 720 m.', why: 'Convert to seconds first.' },
        { text: 'The velocity at the end of stage 2: v = 6 + 1 × 6 = 12 m/s.', why: 'v = u + at.' },
        { text: 'Stage 2 area (trapezoid) = ½ × (6 + 12) × 6 = 54 m.', why: 'The velocity rises uniformly from 6 to 12 m/s.' },
        { text: 'Displacement = 720 + 54 = 774 m.', why: 'Total area under the graph.' },
        { text: 'Check: stage 2 by s = ut + ½at² = 6 × 6 + ½ × 1 × 36 = 54 m.', why: 'A second route agrees.' },
      ],
      answers: [{ label: 'Displacement', value: '774 m', numeric: 774 }],
      explanation: 'Almost all of the displacement comes from the long steady stage; the 6 s of acceleration adds only 54 m.',
      illustrations: [{ kind: 'graph', caption: 'A 120 s stage at 6 m/s, then 6 s at 1 m/s²: move to 126 s to read the displacement.', profile: P14, graphs: ['vt', 'xt'], shade: [{ t0: 0, t1: 120, label: 'Stage 1: 720 m', color: 'displacement' }, { t0: 120, t1: 126, label: 'Stage 2: 54 m', color: 'distance' }] }],
      labNote: 'Two stages with different accelerations are shown as an illustration; the Equation Laboratory is used for one stage at a time.',
      verification: V('Recomputed with the two-stage motion profile (automated test); stage 2 checked with s = ut + ½at².'),
    },
  },
  {
    number: 15,
    parts: [{ id: 'a', label: 'accelerations of A and B; velocities at five instants for the graph' }, { id: 'b', label: 'displacement of A in 5 s' }, { id: 'c', label: 'displacement of B in 10 s' }],
    summary: 'Two cars A and B start from rest with constant accelerations. A reaches 5 m/s in 5 s and B reaches 3 m/s in 10 s. Draw both velocity–time graphs on one set of axes and use them to find each displacement over the time stated.',
    topic: 'Velocity–time graphs', sections: ['4.2.3', '4.3'], status: 'solved', lessonIds: ['pm-l8', 'pm-l9'],
    solution: {
      kind: 'graph',
      given: ['Car A: from rest to 5 m/s in 5 s.', 'Car B: from rest to 3 m/s in 10 s.'],
      find: ['(a) The accelerations and five points for each graph.', '(b) The displacement of A in 5 s.', '(c) The displacement of B in 10 s.'],
      assumptions: ['Both cars move in a straight line in one direction with constant acceleration.'],
      principle: 'For constant acceleration the velocity–time graph is a straight line through the origin (starting from rest) and its slope is the acceleration; the area is the displacement.',
      formulas: [{ formula: 'a = (v − u) ÷ t', why: 'The velocity change and the time are given.' }, { formula: 'v = u + at', why: 'To find the velocity at each instant for the graph.' }, { formula: 'displacement = ½ × base × height', why: 'Each graph is a triangle.' }],
      hint: 'Find each acceleration first. Then use v = at to get the velocity at five equally spaced instants and plot them.',
      steps: [
        { text: 'A: a = 5 ÷ 5 = 1 m/s². B: a = 3 ÷ 10 = 0.3 m/s².', why: 'a = (v − u) ÷ t with u = 0.' },
        { text: 'A at t = 1, 2, 3, 4, 5 s: v = 1, 2, 3, 4, 5 m/s. B at t = 2, 4, 6, 8, 10 s: v = 0.6, 1.2, 1.8, 2.4, 3.0 m/s.', why: 'v = at, five instants for each car.' },
        { text: 'Plot the points with time on the horizontal axis and velocity on the vertical axis: two straight lines through the origin. A\'s line is steeper (greater acceleration) but ends at 5 s; B\'s is flatter and runs to 10 s.', why: 'The slope of each line is its acceleration.' },
        { text: 'Displacement of A in 5 s = ½ × 5 s × 5 m/s = 12.5 m.', why: 'Area of the triangle under A\'s line.' },
        { text: 'Displacement of B in 10 s = ½ × 10 s × 3 m/s = 15 m.', why: 'Area of the triangle under B\'s line.' },
      ],
      answers: [
        { label: '(a) Accelerations', value: 'A: 1 m/s²; B: 0.3 m/s²', part: 'a', numeric: 1 },
        { label: '(b) Displacement of A in 5 s', value: '12.5 m', part: 'b', numeric: 12.5 },
        { label: '(c) Displacement of B in 10 s', value: '15 m', part: 'c', numeric: 15 },
      ],
      explanation: 'A accelerates faster but only for 5 s; B accelerates gently for twice as long and covers a little more ground. The two displacements are for different time intervals, so they are not a race.',
      illustrations: [
        { kind: 'graph', caption: 'Car A: u = 0, a = 1 m/s² for 5 s.', profile: P15A, graphs: ['vt', 'xt'] },
        { kind: 'graph', caption: 'Car B: u = 0, a = 0.3 m/s² for 10 s.', profile: P15B, graphs: ['vt', 'xt'] },
      ],
      labs: [{ href: '/physics/motion/equations?u=0&a=1&d=5', label: 'Equation Laboratory: car A' }, { href: '/physics/motion/equations?u=0&a=0.3&d=10', label: 'Equation Laboratory: car B' }],
      verification: V('Both motions recomputed with the constant-acceleration engine (automated test); the areas agree with s = ½at².'),
    },
  },
  {
    number: 16,
    parts: [{ id: 'i', label: '(i) distance travelled' }, { id: 'ii', label: '(ii) displacement' }, { id: 'iii', label: '(iii) speed' }, { id: 'iv', label: '(iv) velocity' }],
    summary: 'Rohan studies from 6 PM to 7:30 PM. Follow the tip of the 7 cm minute hand of the wall clock over this time. Find its distance travelled, displacement, speed and velocity.',
    topic: 'Uniform circular motion', sections: ['4.4.1'], status: 'solved', lessonIds: ['pm-l10'],
    solution: {
      kind: 'numerical',
      given: ['Radius r = 7 cm (the length of the minute hand).', 'Time interval from 6:00 PM to 7:30 PM = 90 min = 5400 s.', 'The minute hand makes one turn in 60 min = 3600 s.'],
      find: ['(i) The distance travelled by the tip.', '(ii) Its displacement.', '(iii) Its speed.', '(iv) Its velocity.'],
      assumptions: ['The tip moves at a constant speed round a circle (use π = 22/7, which suits r = 7 cm). Speed and velocity are taken as the averages over the interval, and the velocity is also described at an instant.'],
      principle: 'Distance is the arc length travelled; displacement is the straight line from the start to the end; speed is distance ÷ time and average velocity is displacement ÷ time.',
      formulas: [{ formula: 'circumference = 2πr', why: 'The distance for one turn.' }, { formula: 'number of turns = time ÷ period', why: '90 min is a whole number of half-turns.' }, { formula: 'speed = distance ÷ time; average velocity = displacement ÷ time', why: 'Definitions of the two averages.' }],
      hint: 'How many turns does the minute hand make in 90 minutes? Where is the tip at the end compared with where it started?',
      steps: [
        { text: 'Turns = 90 min ÷ 60 min = 1.5 turns.', why: 'One turn takes 60 minutes.' },
        { text: 'Circumference = 2πr = 2 × (22/7) × 7 = 44 cm.', why: 'The distance for one turn.' },
        { text: '(i) Distance = 1.5 × 44 cm = 66 cm.', why: 'The arc length covered in 1.5 turns.' },
        { text: '(ii) After 1.5 turns the tip is half a turn from where it began: from the 12 mark to the 6 mark. The displacement is the diameter, 2 × 7 = 14 cm, directed from the 12 mark towards the 6 mark.', why: 'The displacement is the straight line from the start to the end, not the arc.' },
        { text: '(iii) Speed = 66 cm ÷ 5400 s = 0.0122 cm/s (about 1.2 × 10⁻² cm/s). This is the constant speed of the tip: 44 cm ÷ 3600 s gives the same.', why: 'In uniform circular motion the speed is constant.' },
        { text: '(iv) Average velocity = 14 cm ÷ 5400 s = 0.0026 cm/s (about 2.6 × 10⁻³ cm/s), directed from the 12 mark towards the 6 mark.', why: 'Velocity uses the displacement, so it is smaller than the speed and has a direction.' },
        { text: 'The velocity at any instant has the constant size 0.0122 cm/s, but its direction (tangent to the clock face) keeps changing, so the velocity is not constant.', why: 'Speed is constant, velocity is not.' },
      ],
      answers: [
        { label: '(i) Distance', value: '66 cm', part: 'i', numeric: 66, tolerance: 0.1 },
        { label: '(ii) Displacement', value: '14 cm, from the 12 mark towards the 6 mark', part: 'ii', numeric: 14 },
        { label: '(iii) Speed', value: '≈ 0.0122 cm/s', part: 'iii', numeric: 0.01222, tolerance: 0.0002 },
        { label: '(iv) Average velocity', value: '≈ 0.0026 cm/s, from the 12 mark towards the 6 mark', part: 'iv', numeric: 0.002593, tolerance: 0.00005 },
      ],
      explanation: 'The tip travels 66 cm of arc but ends only 14 cm from where it began, so the average velocity is much smaller than the speed.',
      illustrations: [{ kind: 'circle', caption: 'Scaled model: a radius of 7 m and a period of 60 s stand in for 7 cm and 60 min, so 90 s here is 90 min. The geometry (1.5 turns, displacement along a diameter) is the same; the units are not.', radiusM: 7, periodS: 60, startTime: 90 }],
      labNote: 'The circular motion laboratory works in metres and seconds with periods up to 60 s, so it cannot show a 7 cm hand taking an hour; the scaled illustration shows only the geometry.',
      verification: V('Recomputed with the circular-motion engine (r = 7, T = 3600 s, t = 5400 s) and by hand with π = 22/7 (automated test).'),
    },
  },
];

export const solvedExerciseNumbers = (): number[] => MOTION_EXERCISES.filter((e) => e.status === 'solved').map((e) => e.number);

/** Replay a solution's motion model and return its distance and displacement in metres. */
export function recomputeModel(m: ModelCheck): { distanceM: number; displacementM: number } {
  let p: MotionPath = newPath(m.startM, Math.min(m.startM, ...m.targetsM, 0) - 10, Math.max(m.startM, ...m.targetsM, 0) + 10);
  for (const t of m.targetsM) { const r = addMove(p, t); if (!r.ok) throw new Error(r.reason); p = r.path; }
  const s = summary(p);
  return { distanceM: s.distanceCm / 100, displacementM: s.displacementCm / 100 };
}

/**
 * Recompute the numerical answers of a question with the motion engines. Keys are part ids (or `answer`
 * for a single answer). Used by the automated tests; returns {} for purely conceptual questions.
 */
export function recomputeAnswers(n: number): Record<string, number> {
  switch (n) {
    case 1: { const m = recomputeModel(MOTION_EXERCISES[0].solution.model!); return { a: m.distanceM, b: m.displacementM }; }
    case 2: { const m = recomputeModel(MOTION_EXERCISES[1].solution.model!); return { i: m.distanceM, ii: m.displacementM }; }
    case 4: return { a: averageAcceleration(P4, 0, 6)!, b: stateAt(P4, 6).displacement };
    case 5: return { a: P5.segments[0].a, b: P5.segments[0].durationS, s: stateAt(P5, P5.segments[0].durationS).displacement, v: stateAt(P5, P5.segments[0].durationS).v };
    case 8: return { answer: stateAt(P8, 36).displacement, v: stateAt(P8, 36).v * 3.6 };
    case 9: return { answer: stateAt(P9, 21).distance, v: stateAt(P9, 21).v };
    case 10: return { answer: stateAt(P10, 4.5).displacement, v: stateAt(P10, 4.5).v };
    case 12: return { i: areaVT(P12, 20, 100).signed, ii: areaVT(P12, 100, 120).signed, iii: stateAt(P12, 120).displacement, iv: averageAcceleration(P12, 0, 120)! };
    case 13: return { answer: trapezoidArea(Q13_POINTS) };
    case 14: return { answer: stateAt(P14, 126).displacement };
    case 15: return { a: averageAcceleration(P15A, 0, 5)!, aB: averageAcceleration(P15B, 0, 10)!, b: stateAt(P15A, 5).displacement, c: stateAt(P15B, 10).displacement };
    case 16: {
      const c = { radiusM: 7, periodS: 3600, spin: 'clockwise' as const };
      const s = circleStateAt(c, 5400);
      return { i: (s.distance / Math.PI) * (22 / 7), ii: s.displacement, iii: (s.speed * (22 / 7)) / Math.PI, iv: s.averageVelocity! };
    }
    default: return {};
  }
}

/** Facts about the illustrative paths of questions 6 and 7, for the tests. */
export function illustrationFacts() {
  const speedOf = (r: { start: number; range: [number, number]; moves: number[]; durations: number[] }) =>
    wholeTrip(pathFromRoute({ startM: r.start, legs: r.moves.map((m, i) => ({ toM: m, durationS: r.durations[i] })) }, r.range));
  return {
    q6: { aAt5: stateAt(P6A, 5).x, bAt5: stateAt(P6B, 5).x, aVelocity: P6A.v0, bVelocity: P6B.v0 },
    q7: { A: speedOf(Q7_A), B: speedOf(Q7_B) },
    q3: { speedAt: [1, 4, 9].map((t) => circleStateAt({ radiusM: 10, periodS: 20, spin: 'counterclockwise' }, t).speed), angleAt: [1, 4, 9].map((t) => circleStateAt({ radiusM: 10, periodS: 20, spin: 'counterclockwise' }, t).velocityAngleDeg) },
    q5Eq: equationValues(28, -4, 7),
  };
}

/** The exercise coverage audit: for every question, the parts the textbook asks and the parts answered. */
export function exerciseCoverage() {
  return MOTION_EXERCISES.map((e) => {
    const partIds = e.parts?.map((p) => p.id) ?? [];
    const answered = e.solution.answers.map((a) => a.part).filter((p): p is string => Boolean(p));
    return { number: e.number, kind: e.solution.kind, partIds, answered, missing: partIds.filter((p) => !answered.includes(p)), answerCount: e.solution.answers.length };
  });
}
