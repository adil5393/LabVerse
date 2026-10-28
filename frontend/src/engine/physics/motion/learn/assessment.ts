/**
 * Chapter 4 (Describing Motion Around Us) chapter assessment: ten original questions across Lessons 1 to 10, at the three
 * CBSE competency levels. Every numeric answer is checked against the motion model by `__tests__/assessment.test.ts`.
 * Feedback and solutions are shown only after the student submits.
 */

import type { ChapterAssessment } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const MOTION_ASSESSMENT: ChapterAssessment = {
  id: 'motion-assessment-1',
  title: 'Describing Motion: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Take right as positive unless a question says otherwise. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'ma-1', topic: 'Reference point', lessonId: 'pm-l1', competency: 'knowledge', marks: 1, prompt: 'Describing a position.', question: choose('ma-1q', 'To state where an object is on a straight road, you need…', [['a reference point, a distance from it and a direction', null], ['only the distance travelled so far', 'Distance travelled does not say where the object is now.'], ['only the speed of the object', 'Speed says how fast, not where.']], 'Position needs a reference point, a distance and a direction.'), solution: ['A position is always measured from a chosen reference point, with a direction.'] },
        { id: 'ma-2', topic: 'Distance and displacement', lessonId: 'pm-l3', competency: 'knowledge', marks: 1, prompt: 'A round trip.', question: choose('ma-2q', 'A runner completes one full lap of a track and stops at the start line. Which is true?', [['The displacement is zero but the distance is not', null], ['Both distance and displacement are zero', 'The runner covered the length of the lap, so the distance is not zero.'], ['The displacement equals the length of the lap', 'Displacement is the net change in position; the runner ends where they began.']], 'Same start and end: zero displacement.'), solution: ['Distance = the length of the lap.', 'Start and finish coincide, so displacement = 0.'] },
        { id: 'ma-3', topic: 'Uniform circular motion', lessonId: 'pm-l10', competency: 'knowledge', marks: 1, prompt: 'Constant speed on a circle.', question: choose('ma-3q', 'A stone whirled in a circle at constant speed is accelerating because…', [['its direction of motion keeps changing', null], ['its speed keeps increasing', 'The speed is constant in uniform circular motion.'], ['it is not accelerating at all', 'Velocity includes direction; a changing direction means a changing velocity.']], 'Changing direction means changing velocity.'), solution: ['Velocity has a direction.', 'On a circle the direction changes all the time, so the velocity changes: the stone accelerates.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'ma-4', topic: 'Average speed', lessonId: 'pm-l4', competency: 'application', marks: 2, prompt: 'A bus trip.', question: num('ma-4q', 'A bus covers 90 km in 1.5 h. What is its average speed, in km/h?', 60, '90 ÷ 1.5 = 60 km/h.', { unit: 'km/h' }), solution: ['Average speed = total distance ÷ total time.', '90 km ÷ 1.5 h = 60 km/h.'] },
        { id: 'ma-5', topic: 'Average velocity', lessonId: 'pm-l5', competency: 'application', marks: 2, prompt: 'There and part of the way back.', question: num('ma-5q', 'A cyclist rides 400 m east and then 100 m west, taking 100 s in total. What is the average velocity, in m/s, east positive?', 3, 'Displacement = 400 − 100 = 300 m east; 300 ÷ 100 = 3 m/s.', { unit: 'm/s', rules: [[[5], 'That is the average speed (500 m ÷ 100 s). Velocity uses the displacement.', 'velocity-uses-distance']] }), solution: ['Displacement = +400 − 100 = +300 m.', 'Average velocity = 300 m ÷ 100 s = 3 m/s east.'] },
        { id: 'ma-6', topic: 'Acceleration', lessonId: 'pm-l6', competency: 'application', marks: 2, prompt: 'Braking.', question: num('ma-6q', 'A car slows from 20 m/s to 8 m/s in 4 s. What is its acceleration, in m/s²? (include the sign)', -3, 'a = (8 − 20) ÷ 4 = −3 m/s².', { unit: 'm/s²', rules: [[[3], 'Check the sign: the velocity decreased, so the acceleration is negative.', 'sign-of-deceleration']] }), solution: ['a = (v − u) ÷ t.', 'a = (8 − 20) ÷ 4 = −3 m/s².'] },
        { id: 'ma-7', topic: 'Equations of motion', lessonId: 'pm-l9', competency: 'application', marks: 2, prompt: 'Starting from rest.', question: num('ma-7q', 'A scooter starts from rest and accelerates uniformly at 2 m/s² for 5 s. How far does it travel, in metres?', 25, 's = ut + ½at² = 0 + ½ × 2 × 25 = 25 m.', { unit: 'm' }), solution: ['u = 0, a = 2 m/s², t = 5 s.', 's = ut + ½at² = ½ × 2 × 5² = 25 m.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'ma-8', topic: 'Position–time graph', lessonId: 'pm-l7', competency: 'analysis', marks: 2, prompt: 'Reading a graph.', question: choose('ma-8q', 'On a position–time graph, line P is steeper than line Q, and both are straight. What does this tell you?', [['P moves with a larger constant velocity than Q', null], ['P is accelerating and Q is not', 'A straight line on a position–time graph means constant velocity, for both.'], ['P has travelled further than Q at every instant', 'The slope gives velocity, not the position at a given time.']], 'Slope of a position–time graph is velocity.'), solution: ['Each straight line has a constant slope, so each object has a constant velocity.', 'The steeper line has the larger slope: P is faster.'] },
        { id: 'ma-9', topic: 'Velocity–time graph area', lessonId: 'pm-l8', competency: 'analysis', marks: 2, prompt: 'Area under a graph.', question: num('ma-9q', 'A velocity–time graph rises in a straight line from 0 m/s at t = 0 to 12 m/s at t = 6 s. What displacement does the area under it give, in metres?', 36, 'Triangle area = ½ × 6 × 12 = 36 m.', { unit: 'm', rules: [[[72], 'That is the rectangle 6 × 12; the area under a rising line is a triangle, half of it.', 'area-rectangle']] }), solution: ['The area under a velocity–time graph equals the displacement.', 'Triangle: ½ × base × height = ½ × 6 × 12 = 36 m.'] },
        { id: 'ma-10', topic: 'Stopping distance', lessonId: 'pm-l9', competency: 'analysis', marks: 2, prompt: 'Twice as fast.', question: num('ma-10q', 'A car moving at 10 m/s stops in 10 m with a steady deceleration. With the same deceleration, what stopping distance is needed from 20 m/s, in metres?', 40, 'v² = u² + 2as gives s ∝ u²: doubling u multiplies s by 4, so 40 m.', { unit: 'm', rules: [[[20], 'Stopping distance grows with the square of the speed, not in proportion to it.', 'stopping-linear']] }), solution: ['From v² = u² + 2as with v = 0: s = u² ÷ (2a).', 'From 10 m/s in 10 m: a = 100 ÷ 20 = 5 m/s².', 'From 20 m/s: s = 400 ÷ 10 = 40 m.'] },
      ],
    },
  ],
};
