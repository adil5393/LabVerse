/**
 * Chapter 7 (Work, Energy, and Simple Machines) chapter assessment: ten original questions across Lessons 1 to 10, at the three
 * CBSE competency levels. Numeric answers are checked by `__tests__/assessment.test.ts`. Feedback appears only after submission.
 */

import type { ChapterAssessment } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const WORK_ASSESSMENT: ChapterAssessment = {
  id: 'work-assessment-1',
  title: 'Work, Energy and Simple Machines: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Take g = 10 m/s² wherever it is needed. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'wa-1', topic: 'Zero work', lessonId: 'pw-l2', competency: 'knowledge', marks: 1, prompt: 'Holding a bag.', question: choose('wa-1q', 'You hold a heavy bag still for five minutes. In physics, the work you do on the bag is…', [['zero, because the bag does not move', null], ['large, because you get tired', 'Feeling tired is not work in the physics sense; work needs a displacement.'], ['negative', 'There is no displacement, so the work is zero, not negative.']], 'No displacement, no work.'), solution: ['W = F × s.', 'The bag does not move: s = 0, so W = 0.'] },
        { id: 'wa-2', topic: 'Negative work', lessonId: 'pw-l3', competency: 'knowledge', marks: 1, prompt: 'Friction on a sliding box.', question: choose('wa-2q', 'The work done by friction on a box sliding across a floor is…', [['negative, because friction opposes the displacement', null], ['positive, because friction is a force', 'Work is positive only when the force has a component along the displacement.'], ['zero', 'Friction acts along the line of motion, so it does work.']], 'Force opposite to displacement: negative work.'), solution: ['Friction acts opposite to the motion.', 'So the work done by friction is negative.'] },
        { id: 'wa-3', topic: 'Conservation', lessonId: 'pw-l7', competency: 'knowledge', marks: 1, prompt: 'A falling ball.', question: choose('wa-3q', 'As a ball falls freely (no air resistance), its…', [['potential energy turns into kinetic energy; the total stays the same', null], ['kinetic and potential energy both increase', 'The total mechanical energy cannot increase without work from outside.'], ['total energy decreases', 'With no air resistance, mechanical energy is conserved.']], 'Mechanical energy is conserved.'), solution: ['Height falls, so U = mgh falls.', 'Speed rises, so K rises by the same amount; K + U stays constant.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'wa-4', topic: 'W = F s', lessonId: 'pw-l1', competency: 'application', marks: 2, prompt: 'Pushing a cart.', question: num('wa-4q', 'A 40 N push moves a cart 5 m along the direction of the push. How much work is done, in joules?', 200, 'W = 40 × 5 = 200 J.', { unit: 'J' }), solution: ['W = F × s.', 'W = 40 × 5 = 200 J.'] },
        { id: 'wa-5', topic: 'Kinetic energy', lessonId: 'pw-l5', competency: 'application', marks: 2, prompt: 'A cyclist.', question: num('wa-5q', 'A cyclist and bicycle together have a mass of 60 kg and move at 5 m/s. What is their kinetic energy, in joules?', 750, 'K = ½ × 60 × 25 = 750 J.', { unit: 'J', rules: [[[1500], 'Remember the ½ in K = ½ m v².', 'forgot-half'], [[150], 'Square the speed: v² = 25.', 'forgot-square']] }), solution: ['K = ½ m v².', 'K = ½ × 60 × 5² = 750 J.'] },
        { id: 'wa-6', topic: 'Potential energy', lessonId: 'pw-l6', competency: 'application', marks: 2, prompt: 'Lifting a box.', question: num('wa-6q', 'A 12 kg box is lifted onto a shelf 1.5 m high. What potential energy does it gain, in joules? (g = 10 m/s²)', 180, 'U = 12 × 10 × 1.5 = 180 J.', { unit: 'J' }), solution: ['U = m g h.', 'U = 12 × 10 × 1.5 = 180 J.'] },
        { id: 'wa-7', topic: 'Power', lessonId: 'pw-l8', competency: 'application', marks: 2, prompt: 'Climbing stairs.', question: num('wa-7q', 'A 50 kg student climbs stairs 6 m high in 12 s. What is the average power, in watts? (g = 10 m/s²)', 250, 'W = 50 × 10 × 6 = 3000 J; P = 3000 ÷ 12 = 250 W.', { unit: 'W', rules: [[[3000], 'That is the work done. Power is work divided by time.', 'work-not-power']] }), solution: ['Work against gravity = m g h = 50 × 10 × 6 = 3000 J.', 'P = W ÷ t = 3000 ÷ 12 = 250 W.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'wa-8', topic: 'Speed from height', lessonId: 'pw-l7', competency: 'analysis', marks: 2, prompt: 'A slide.', question: num('wa-8q', 'A child starts from rest at the top of a smooth slide 5 m high. Using conservation of energy, what is the speed at the bottom, in m/s? (g = 10 m/s²)', 10, 'mgh = ½mv² gives v² = 2gh = 100, so v = 10 m/s.', { unit: 'm/s', rules: [[[100], 'That is v²; take the square root.', 'forgot-root']] }), solution: ['Loss of U = gain of K: m g h = ½ m v².', 'v² = 2 × 10 × 5 = 100, so v = 10 m/s.', 'The mass cancels.'] },
        { id: 'wa-9', topic: 'Lever', lessonId: 'pw-l10', competency: 'analysis', marks: 2, prompt: 'A balanced see-saw.', question: num('wa-9q', 'A 300 N load sits 0.5 m from the fulcrum of a lever. What effort, in newtons, applied 1.5 m from the fulcrum on the other side, balances it?', 100, 'Load × load arm = effort × effort arm: 300 × 0.5 = E × 1.5, so E = 100 N.', { unit: 'N', rules: [[[900], 'A longer effort arm reduces the effort needed, not increases it.', 'lever-inverse']] }), solution: ['Balance: load × load arm = effort × effort arm.', '300 × 0.5 = E × 1.5, so E = 150 ÷ 1.5 = 100 N.'] },
        { id: 'wa-10', topic: 'Inclined plane', lessonId: 'pw-l9', competency: 'analysis', marks: 2, prompt: 'A ramp and the work done.', question: choose('wa-10q', 'A smooth ramp lets you push a load up to a platform with a smaller force than lifting it straight up. Compared with lifting, the work you do is…', [['the same, because the smaller force acts over a longer distance', null], ['less, because the force is smaller', 'The force is smaller, but you push it over a longer distance; on a smooth ramp the work is the same.'], ['more, because the ramp is longer', 'With no friction, the extra distance exactly makes up for the smaller force.']], 'A machine trades force for distance; it does not save work.'), solution: ['Work = force × distance along the ramp.', 'On a smooth ramp this equals m g h, the same as lifting straight up.', 'The ramp makes the job easier, not smaller.'] },
      ],
    },
  ],
};
