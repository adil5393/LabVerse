/**
 * Class 9 Physics, Chapter 6: chapter and unit prerequisites (PHY-2A). Four short, optional refreshers; each links to the
 * Chapter 4 lesson that teaches the idea in full. They never block a lesson. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { numQ, pick } from './questions';

export const PFP_MOTION: Prerequisite = {
  id: 'pfp-motion',
  title: 'Velocity and acceleration',
  why: 'Forces are studied through what they do to motion. A change of velocity is an acceleration, so you need to know what velocity and acceleration mean.',
  connection: 'Chapter 4: Describing Motion Around Us, lessons 5 and 6 (/physics/motion/learn/pm-l6)',
  refresher: [
    {
      id: 'pfp-mo-step', title: 'Constant velocity means no acceleration',
      paragraphs: [
        'Velocity says how fast an object moves and in which direction. Acceleration is how quickly the velocity changes: a = (v − u) ÷ t, in m/s². If the velocity does not change, the acceleration is zero, even if the object is moving fast.',
        'A car at rest has zero velocity. A car moving steadily at 20 m/s in a straight line has a velocity of 20 m/s and zero acceleration. A car that speeds up from 0 to 20 m/s has an acceleration.',
      ],
      misconception: { wrong: 'A moving object must be accelerating.', right: 'Only a change of velocity is an acceleration. A steady velocity, however large, has zero acceleration.' },
    },
  ],
  checks: [
    pick('pfp-mo-c1', 'A cart moves along a straight line at a steady 4 m/s. What is its acceleration?', [
      ['Zero', null],
      ['4 m/s²', '4 m/s is the velocity. The acceleration is the change of velocity per second, and it is not changing.', 'velocity_is_acceleration'],
    ], 'Constant velocity: zero acceleration.', undefined, 'pfp-mo-step'),
    numQ('pfp-mo-c2', 'A cart\'s velocity rises from 2 m/s to 8 m/s in 3 s. What is its acceleration, in m/s²?', 2, '(8 − 2) ÷ 3 = 2 m/s².', { unit: 'm/s²', refresherId: 'pfp-mo-step', rules: [[[6], '6 m/s is the change in velocity. Divide it by the 3 s.', 'change_for_acceleration']] }),
  ],
};

export const PFP_DIRECTION: Prerequisite = {
  id: 'pfp-direction',
  title: 'Direction and positive and negative values',
  why: 'A force has a direction. On a straight line we show the two directions with plus and minus, so adding forces means adding signed numbers.',
  connection: 'Chapter 4: lesson 1 (positive and negative positions) and lesson 5 (the sign of velocity)',
  refresher: [
    {
      id: 'pfp-di-step', title: 'Right is positive, left is negative',
      paragraphs: [
        'On a straight line we choose one direction as positive (usually right) and the opposite as negative (left). A quantity to the right is written +, to the left −. So 6 N to the left is −6 N.',
        'To combine quantities on a line, add them with their signs: (+10) + (−6) = +4. The sign of the result tells the direction.',
      ],
      misconception: { wrong: 'A negative value is a smaller or weaker value.', right: 'The sign only tells the direction. −6 N is as strong as +6 N, pointing the other way.' },
    },
  ],
  checks: [
    numQ('pfp-di-c1', 'Right is positive. What is (+9) + (−4)?', 5, '9 − 4 = 5, so +5.', { refresherId: 'pfp-di-step', rules: [[[13], 'You added the sizes. The −4 points the other way, so it subtracts.', 'sign_ignored']] }),
    pick('pfp-di-c2', 'Right is positive. What does −7 N mean?', [
      ['7 N to the left', null],
      ['A force weaker than 7 N', 'The sign gives direction, not strength.', 'negative_means_weak'],
    ], 'Negative means left.', undefined, 'pfp-di-step'),
  ],
};

export const PFP_MASS: Prerequisite = {
  id: 'pfp-mass',
  title: 'Mass and the kilogram',
  why: 'The same force affects a light cart differently from a heavy one, so the laboratory asks for the mass of the cart in kilograms.',
  connection: 'Earlier grades: measuring mass; Chapter 6 uses kg as the unit of mass',
  refresher: [
    {
      id: 'pfp-ma-step', title: 'Mass is the amount of matter, measured in kg',
      paragraphs: [
        'Mass tells how much matter an object contains. Its SI unit is the kilogram (kg). A litre of water has a mass of about 1 kg; a cricket ball about 0.16 kg.',
        'Mass is not weight. Mass is how much matter there is; weight is the downward force of the Earth\'s gravity on the object, measured in newtons. A 2 kg cart has a weight of about 20 N on the Earth (using 10 N for every kilogram, as the laboratory does).',
      ],
      misconception: { wrong: 'Mass and weight are the same thing, so mass is measured in newtons.', right: 'Mass is in kilograms; weight is a force in newtons.' },
    },
  ],
  checks: [
    pick('pfp-ma-c1', 'In which unit is mass measured in the SI system?', [
      ['kilogram (kg)', null],
      ['newton (N)', 'The newton is the unit of force (and weight). Mass is in kilograms.', 'mass_in_newtons'],
    ], 'Mass: kilograms.', undefined, 'pfp-ma-step'),
    numQ('pfp-ma-c2', 'A cart has a mass of 3 kg. Using 10 N per kilogram, what is its weight, in newtons?', 30, '3 × 10 = 30 N.', { unit: 'N', refresherId: 'pfp-ma-step', rules: [[[3], '3 is the mass in kg. The weight is the force: multiply by 10 N per kg.', 'mass_for_weight']] }),
  ],
};

export const PFP_ARROWS: Prerequisite = {
  id: 'pfp-arrows',
  title: 'Reading arrows',
  why: 'Force diagrams show a force as an arrow. You need to read what an arrow tells you: its direction and its length.',
  connection: 'Chapter 4: velocity and displacement arrows in the motion figures',
  refresher: [
    {
      id: 'pfp-ar-step', title: 'An arrow shows a direction and a size',
      paragraphs: [
        'In a force diagram the arrow points the way the force acts, and a longer arrow stands for a larger force. The tail is where the force acts, and each arrow is labelled with its size in newtons.',
        'Always ask two questions: which object does the arrow act ON, and which way does it point? Arrows that act on different objects are never added together.',
      ],
      misconception: { wrong: 'The arrow shows where the object is going.', right: 'The arrow shows the direction of the force, which can differ from the direction the object is moving.' },
    },
  ],
  checks: [
    pick('pfp-ar-c1', 'Two arrows act on the same box: one 10 N long and one 5 N long, both pointing right. Which is the stronger force?', [
      ['The 10 N arrow', null],
      ['The 5 N arrow', 'A longer arrow stands for a larger force, and the label gives the size in newtons: 10 N is larger than 5 N.', 'shorter_is_bigger'],
    ], 'Larger number, longer arrow.', undefined, 'pfp-ar-step'),
    pick('pfp-ar-c2', 'An arrow on a box points to the left. This shows that the force on the box:', [
      ['acts towards the left', null],
      ['shows the box is moving left', 'The arrow gives the direction of the force. The box could be moving in any direction.', 'arrow_is_motion'],
    ], 'The arrow is the direction of the force.', undefined, 'pfp-ar-step'),
  ],
};

export const PF_PREREQUISITES: Prerequisite[] = [PFP_MOTION, PFP_DIRECTION, PFP_MASS, PFP_ARROWS];

export const PF_UNITS: EduUnit[] = [
  {
    id: 'pf-unit-1', number: 1, title: 'Force and balanced forces',
    centralIdea: 'A force is a push or a pull with a size and a direction. When several forces act on one object, only their net force decides whether the velocity changes: balanced forces do not change it, unbalanced forces do.',
    connection: 'This is Sections 6.1 and 6.2. It uses velocity and acceleration from Chapter 4 and prepares Newton\'s laws.',
    vocabulary: [{ term: 'force', meaning: 'a push or a pull, with a magnitude and a direction (unit: newton, N)' }, { term: 'net force', meaning: 'the combined effect of all the forces on an object' }, { term: 'balanced forces', meaning: 'forces whose net force is zero' }],
    discover: ['What a force is and how it is measured', 'How to find the net force of forces on a line', 'Why balanced forces do not change velocity, and unbalanced forces do'],
    prerequisiteIds: ['pfp-direction', 'pfp-arrows', 'pfp-mass', 'pfp-motion'], lessonIds: ['pf-l1', 'pf-l2'],
  },
  {
    id: 'pf-unit-2', number: 2, title: 'Friction',
    centralIdea: 'Friction is a contact force between surfaces that resists sliding, or the tendency to slide. Its size depends on the surfaces, it can balance a push on a resting object, and it is both a nuisance and a necessity.',
    connection: 'This is Section 6.3. It applies net force and balanced forces to a force that is always there.',
    vocabulary: [{ term: 'friction', meaning: 'the contact force between surfaces that resists sliding' }, { term: 'static friction', meaning: 'friction on an object that is not sliding; it matches the push up to a limit' }, { term: 'kinetic friction', meaning: 'friction on a sliding object' }],
    discover: ['What decides the direction of friction', 'Why objects slow down and stop', 'Why a gentle push may not move an object'],
    prerequisiteIds: ['pfp-motion', 'pfp-direction'], lessonIds: ['pf-l3'],
  },
];
