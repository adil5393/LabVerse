/**
 * Chapter 6 (How Forces Affect Motion) chapter assessment: ten original questions across Lessons 1 to 10, at the three CBSE
 * competency levels. Numeric answers are checked by `__tests__/assessment.test.ts`. Feedback appears only after submission.
 */

import type { ChapterAssessment } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const FORCES_ASSESSMENT: ChapterAssessment = {
  id: 'forces-assessment-1',
  title: 'How Forces Affect Motion: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Use the values each question gives. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'fa-1', topic: 'Balanced forces', lessonId: 'pf-l2', competency: 'knowledge', marks: 1, prompt: 'A book on a table.', question: choose('fa-1q', 'A book rests on a table. The forces on it are…', [['balanced, so its state of motion does not change', null], ['unbalanced, because gravity pulls it down', 'The table pushes up with an equal force, so the forces balance.'], ['absent: no force acts on a resting object', 'Gravity and the push of the table both act; they cancel.']], 'Balanced forces: no change in motion.'), solution: ['Gravity pulls down; the table pushes up equally.', 'The net force is zero, so the book stays at rest.'] },
        { id: 'fa-2', topic: 'Inertia', lessonId: 'pf-l5', competency: 'knowledge', marks: 1, prompt: 'More inertia.', question: choose('fa-2q', 'Which has more inertia?', [['A 5 kg stone', null], ['A 1 kg stone moving fast', 'Inertia depends on mass, not on speed.'], ['They have the same inertia', 'The heavier stone has more mass, so more inertia.']], 'Mass measures inertia.'), solution: ['Inertia is measured by mass.', '5 kg > 1 kg, so the 5 kg stone has more inertia.'] },
        { id: 'fa-3', topic: 'Third law', lessonId: 'pf-l8', competency: 'knowledge', marks: 1, prompt: 'Action and reaction.', question: choose('fa-3q', 'Action and reaction forces never cancel each other because…', [['they act on different objects', null], ['one is always larger than the other', 'They are equal in size.'], ['they act at different times', 'They act at the same instant.']], 'They act on different bodies.'), solution: ['Third-law pairs are equal and opposite but act on two different objects, so they cannot cancel on one object.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'fa-4', topic: 'F = ma', lessonId: 'pf-l6', competency: 'application', marks: 2, prompt: 'Net force.', question: num('fa-4q', 'What net force, in newtons, gives a 1200 kg car an acceleration of 1.5 m/s²?', 1800, 'F = 1200 × 1.5 = 1800 N.', { unit: 'N' }), solution: ['F = m a.', 'F = 1200 × 1.5 = 1800 N.'] },
        { id: 'fa-5', topic: 'Momentum', lessonId: 'pf-l7', competency: 'application', marks: 2, prompt: 'A moving ball.', question: num('fa-5q', 'A 0.4 kg ball moves at 15 m/s. What is its momentum, in kg m/s?', 6, 'p = 0.4 × 15 = 6 kg m/s.', { unit: 'kg m/s' }), solution: ['p = m v.', 'p = 0.4 × 15 = 6 kg m/s.'] },
        { id: 'fa-6', topic: 'Change of momentum', lessonId: 'pf-l7', competency: 'application', marks: 2, prompt: 'Force from a change of momentum.', question: num('fa-6q', 'A 2 kg trolley speeds up from 3 m/s to 7 m/s in 0.5 s. What average net force acts on it, in newtons?', 16, 'Δp = 2 × (7 − 3) = 8 kg m/s; F = 8 ÷ 0.5 = 16 N.', { unit: 'N', rules: [[[4], 'Divide the change of momentum by the time, 0.5 s.', 'forgot-time']] }), solution: ['Change of momentum = m (v − u) = 2 × 4 = 8 kg m/s.', 'F = Δp ÷ t = 8 ÷ 0.5 = 16 N.'] },
        { id: 'fa-7', topic: 'Unbalanced forces', lessonId: 'pf-l2', competency: 'application', marks: 2, prompt: 'Two pulls.', question: num('fa-7q', 'Two children pull a 10 kg box on a smooth floor: one with 50 N to the right, the other with 30 N to the left. What is the acceleration of the box, in m/s², right positive?', 2, 'Net force = 50 − 30 = 20 N; a = 20 ÷ 10 = 2 m/s².', { unit: 'm/s²', rules: [[[8], 'The forces are opposite: subtract them before dividing by the mass.', 'add-opposite-forces']] }), solution: ['Net force = 50 − 30 = 20 N to the right.', 'a = F ÷ m = 20 ÷ 10 = 2 m/s².'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'fa-8', topic: 'Friction', lessonId: 'pf-l3', competency: 'analysis', marks: 2, prompt: 'A steady push.', question: choose('fa-8q', 'You push a crate across a floor at a steady speed with a 120 N force. What is the friction force on the crate?', [['120 N, opposite to the push', null], ['Less than 120 N, or the crate would not move', 'At steady speed the velocity does not change, so the net force is zero.'], ['More than 120 N', 'Then the net force would point backwards and the crate would slow down.']], 'Constant velocity means balanced forces.'), solution: ['Steady speed in a straight line: no acceleration.', 'So the net force is zero: friction = 120 N, opposite to the push.'] },
        { id: 'fa-9', topic: 'Recoil', lessonId: 'pf-l9', competency: 'analysis', marks: 2, prompt: 'Jumping off a boat.', question: num('fa-9q', 'A 50 kg girl jumps from a 100 kg boat at rest, at 2 m/s towards the shore. Ignoring water resistance, what is the speed of the boat just after, in m/s?', 1, 'Total momentum stays 0: 50 × 2 = 100 × v, so v = 1 m/s away from the shore.', { unit: 'm/s', rules: [[[2], 'The boat has twice the mass, so it moves at half the speed.', 'equal-speeds']] }), solution: ['Before: total momentum = 0.', 'After: 50 × 2 + 100 × v = 0, so v = −1 m/s.', 'The boat moves at 1 m/s away from the shore.'] },
        { id: 'fa-10', topic: 'System of objects', lessonId: 'pf-l10', competency: 'analysis', marks: 2, prompt: 'Two blocks pushed together.', question: num('fa-10q', 'A 30 N push acts on a 4 kg block, which pushes a 2 kg block in front of it on a smooth floor. What force, in newtons, does the 4 kg block exert on the 2 kg block?', 10, 'a = 30 ÷ 6 = 5 m/s²; the 2 kg block needs 2 × 5 = 10 N.', { unit: 'N', rules: [[[30], 'The 30 N accelerates both blocks; the front block needs only the force for its own mass.', 'whole-force-passed']] }), solution: ['Treat both blocks as one system: a = 30 ÷ (4 + 2) = 5 m/s².', 'The front block alone: F = 2 × 5 = 10 N.'] },
      ],
    },
  ],
};
