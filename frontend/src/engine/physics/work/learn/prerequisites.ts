/**
 * Class 9 Physics, Chapter 7: chapter and unit prerequisites (PHY-3A). Six short, optional refreshers; each links to the
 * Chapter 4 or Chapter 6 lesson that teaches the idea in full. They never block a lesson. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { numQ, pick } from './questions';

export const PWP_FORCE: Prerequisite = {
  id: 'pwp-force',
  title: 'Force and Newton\'s laws',
  why: 'Work is done BY a force on an object. You need to know what a force is, that a net force changes velocity, and that forces come in pairs, so that you can say which force does the work and on which object.',
  connection: 'Chapter 6: How Forces Affect Motion, lessons 1, 6 and 8 (/physics/forces/learn/pf-l1)',
  refresher: [
    {
      id: 'pwp-fo-step', title: 'A force acts on an object; F = ma',
      paragraphs: [
        'A force is a push or a pull on an object, measured in newtons (N). If the forces on an object are balanced, its velocity does not change. If they are not, the object accelerates: F = ma, where F is the net force on the object.',
        'When one object pushes another, the second pushes back with an equal and opposite force on the first. These two forces act on different objects.',
      ],
      misconception: { wrong: 'A moving object always has a force pushing it along.', right: 'A steady velocity needs no net force; a net force is needed only to change the velocity.' },
    },
  ],
  checks: [
    pick('pwp-fo-c1', 'A box slides along the floor at a steady speed while you push it. What do you know about the forces on the box along the floor?', [
      ['The push and the friction are equal and opposite (balanced)', null],
      ['The push is bigger than the friction, because the box is moving', 'A steady speed means no acceleration, so the forces along the floor are balanced. A bigger push would speed the box up.', 'motion_needs_force'],
    ], 'Constant velocity: balanced forces.', undefined, 'pwp-fo-step'),
    numQ('pwp-fo-c2', 'A net force acts on a 3 kg cart and gives it an acceleration of 2 m/s². What is the net force, in newtons?', 6, 'F = ma = 3 × 2 = 6 N.', { unit: 'N', refresherId: 'pwp-fo-step', rules: [[[1.5], 'You divided. F = m × a.', 'divided'], [[5], 'You added the numbers. The force is the product of mass and acceleration.', 'added']] }),
  ],
};

export const PWP_DISPLACEMENT: Prerequisite = {
  id: 'pwp-displacement',
  title: 'Displacement and direction',
  why: 'Work uses the displacement of the object along the force, so you need to know that displacement is the change of position with a direction, and that on a line it has a sign.',
  connection: 'Chapter 4: Describing Motion Around Us, lesson 3 (/physics/motion/learn/pm-l3)',
  refresher: [
    {
      id: 'pwp-di-step', title: 'Displacement is final position minus initial position',
      paragraphs: [
        'On a straight line, choose one direction as positive (right or up) and the other as negative. The displacement is the final position minus the initial position, with its sign: from 2 m to 7 m it is +5 m, from 7 m to 2 m it is −5 m.',
        'Displacement is not distance. Distance is the length of the path and is never negative.',
      ],
      misconception: { wrong: 'A displacement of −5 m means a smaller displacement than +5 m.', right: 'The sign shows the direction only. −5 m and +5 m are the same size in opposite directions.' },
    },
  ],
  checks: [
    numQ('pwp-di-c1', 'An object moves along a line from 7 m to 2 m (right is positive). What is its displacement, in metres?', -5, '2 − 7 = −5 m: 5 m in the negative direction.', { unit: 'm', refresherId: 'pwp-di-step', rules: [[[5], 'You gave the size of the move. Displacement has a direction: going from 7 m to 2 m is to the left, so it is negative.', 'sign_ignored'], [[9], 'You added the two positions. Subtract the initial position from the final position.', 'added']] }),
    pick('pwp-di-c2', 'A cart rolls 4 m to the right and then 4 m back to the left. What is its displacement?', [
      ['0 m: it is back where it started', null],
      ['8 m', '8 m is the distance travelled. The displacement is the change of position, which is zero here.', 'distance_for_displacement'],
    ], 'Displacement is the change of position.', undefined, 'pwp-di-step'),
  ],
};

export const PWP_VELOCITY: Prerequisite = {
  id: 'pwp-velocity',
  title: 'Speed and velocity',
  why: 'Later parts of this chapter (kinetic energy and power) use the speed and velocity of a moving object.',
  connection: 'Chapter 4: lessons 4 and 5 (/physics/motion/learn/pm-l5)',
  refresher: [
    {
      id: 'pwp-ve-step', title: 'Velocity is displacement divided by time',
      paragraphs: [
        'Speed is the distance covered per second, in m/s, and is never negative. Velocity is the displacement per second and has a direction: v = displacement ÷ time. A car moving 12 m to the right in 4 s has a velocity of +3 m/s.',
        'A negative velocity means motion in the negative direction. Its speed is the same size without the sign.',
      ],
      misconception: { wrong: 'Speed and velocity are the same thing.', right: 'Velocity has a direction, so it can be negative; speed is its size.' },
    },
  ],
  checks: [
    numQ('pwp-ve-c1', 'A cyclist covers 12 m in a straight line in 4 s. What is the speed, in m/s?', 3, '12 ÷ 4 = 3 m/s.', { unit: 'm/s', refresherId: 'pwp-ve-step', rules: [[[48], 'You multiplied. Speed = distance ÷ time.', 'multiplied']] }),
    pick('pwp-ve-c2', 'An object has a velocity of −3 m/s. What does that tell you?', [
      ['It moves at 3 m/s in the negative direction', null],
      ['It is moving more slowly than an object at +3 m/s', 'The sign gives direction only. The speeds are the same.', 'negative_means_slow'],
    ], 'The sign is the direction.', undefined, 'pwp-ve-step'),
  ],
};

export const PWP_WEIGHT: Prerequisite = {
  id: 'pwp-weight',
  title: 'Mass and weight',
  why: 'To lift an object slowly you must pull up with a force equal to its weight, so you need to turn a mass in kilograms into a weight in newtons.',
  connection: 'Chapter 6, lesson 1: weight as a force (/physics/forces/learn/pf-l1)',
  refresher: [
    {
      id: 'pwp-we-step', title: 'Weight = mass × 10 N per kilogram',
      paragraphs: [
        'Mass (in kg) is how much matter an object has. Its weight is the Earth\'s pull on it, a force in newtons: weight = m × g. In this chapter, as in the textbook, g = 10 m/s², so every kilogram weighs about 10 N.',
        'To lift an object slowly at a steady speed, the upward force must equal its weight: a 5 kg bag needs 50 N.',
      ],
      misconception: { wrong: 'A 5 kg bag needs a 5 N force to lift it.', right: 'A 5 kg bag weighs about 50 N. The 5 is the mass in kg, not the force in newtons.' },
    },
  ],
  checks: [
    numQ('pwp-we-c1', 'What is the weight of a 3 kg bag, in newtons? (use g = 10 m/s²)', 30, '3 × 10 = 30 N.', { unit: 'N', refresherId: 'pwp-we-step', rules: [[[3], 'You gave the mass. The weight is the force: multiply by 10 N per kg.', 'mass_for_weight']] }),
    pick('pwp-we-c2', 'You lift a 4 kg box slowly at a steady speed. What upward force must you apply?', [
      ['About 40 N, equal to the weight', null],
      ['4 N, because the mass is 4 kg', 'The mass is 4 kg but the weight is 40 N, and the lifting force must equal the weight.', 'mass_for_weight'],
    ], 'Lifting force equals weight.', undefined, 'pwp-we-step'),
  ],
};

export const PWP_UNITS: Prerequisite = {
  id: 'pwp-units',
  title: 'Multiplying, dividing and units',
  why: 'Work is a product of a force and a displacement, and its unit combines the units of both. You will also change centimetres into metres.',
  connection: 'Earlier grades: multiplication, division and SI units',
  refresher: [
    {
      id: 'pwp-un-step', title: 'Multiply the numbers and the units together',
      paragraphs: [
        'When you multiply two quantities, multiply the numbers and combine the units: 8 N × 2.5 m = 20 N·m. In this chapter 1 N·m is called 1 joule (J).',
        'Use SI units in a calculation: metres, kilograms, seconds. To change centimetres into metres, divide by 100: 15 cm = 0.15 m.',
      ],
      misconception: { wrong: 'It does not matter whether the displacement is in cm or m.', right: 'The joule is newton × metre, so the displacement must be in metres. 15 cm must become 0.15 m first.' },
    },
  ],
  checks: [
    numQ('pwp-un-c1', 'Multiply: 8 N × 2.5 m. Give the number (the unit is N·m).', 20, '8 × 2.5 = 20 N·m.', { unit: 'N·m', refresherId: 'pwp-un-step', rules: [[[10.5], 'You added. Multiply the two numbers.', 'added'], [[3.2], 'You divided. The two quantities are multiplied.', 'divided']] }),
    numQ('pwp-un-c2', 'Change 15 cm into metres.', 0.15, '15 ÷ 100 = 0.15 m.', { unit: 'm', refresherId: 'pwp-un-step', rules: [[[1500], 'You multiplied by 100. A centimetre is smaller than a metre, so the number of metres is smaller: divide by 100.', 'wrong_direction_conversion'], [[15], 'The number must change when the unit changes: 15 cm is not 15 m.', 'unit_ignored']] }),
  ],
};

export const PWP_GRAPH: Prerequisite = {
  id: 'pwp-graph',
  title: 'Reading a basic graph',
  why: 'The work done by a force can be read from a force-displacement graph as the area under the line, which for a steady force is a rectangle.',
  connection: 'Chapter 4: lessons 7 and 8 (reading graphs, the area under a velocity-time graph) (/physics/motion/learn/pm-l8)',
  refresher: [
    {
      id: 'pwp-gr-step', title: 'A horizontal line is a constant value; area is height times width',
      paragraphs: [
        'On a graph the horizontal axis shows one quantity (here displacement) and the vertical axis shows another (here force). A horizontal line means the vertical quantity stays constant as the horizontal one changes.',
        'The area of a rectangle is its height multiplied by its width. For a force of 10 N from 0 m to 1 m the rectangle is 10 tall and 1 wide, so its area is 10 N × 1 m = 10 J. The area of a triangle is half its base times its height, and a trapezoid can be split into rectangles and triangles.',
      ],
      misconception: { wrong: 'The area under a graph is just a picture and has no meaning.', right: 'The area is the product of the two axis quantities, so on a force-displacement graph it has the units of work.' },
    },
  ],
  checks: [
    numQ('pwp-gr-c1', 'A horizontal line at 6 on the vertical axis runs from 0 to 4 on the horizontal axis. What is the area of the rectangle between the line and the horizontal axis?', 24, 'Height × width = 6 × 4 = 24.', { refresherId: 'pwp-gr-step', rules: [[[10], 'You added 6 and 4. The area of a rectangle is height × width.', 'added']] }),
    numQ('pwp-gr-c3', 'A line rises straight from 0 at x = 0 to 10 at x = 2. What is the area of the triangle under the line, in the units of the graph?', 10, 'Area of a triangle = ½ × base × height = ½ × 2 × 10 = 10.', { refresherId: 'pwp-gr-step', rules: [[[20], 'You used base × height (a rectangle). A triangle is half of that.', 'triangle_as_rectangle']] }),
    pick('pwp-gr-c2', 'On a graph of force (vertical) against displacement (horizontal), the line is horizontal. What does that mean?', [
      ['The force is constant', null],
      ['The object is not moving', 'The horizontal axis is the displacement, which changes along the line. A horizontal line means the force does not change.', 'axis_confused'],
    ], 'Horizontal line: constant force.', undefined, 'pwp-gr-step'),
  ],
};

export const PWP_EQMOTION: Prerequisite = {
  id: 'pwp-eqmotion',
  title: 'Equations of motion',
  why: 'The derivation of kinetic energy uses the equation of motion v² = u² + 2as and the facts that velocity can be negative and that acceleration is the change of velocity per second.',
  connection: 'Chapter 4: lesson 9 (/physics/motion/learn/pm-l9)',
  refresher: [
    {
      id: 'pwp-eq-step', title: 'v = u + at and v² = u² + 2as',
      paragraphs: [
        'For a constant acceleration a along a line, an object starting with velocity u has velocity v = u + at after a time t, and v² = u² + 2as after a displacement s. The second equation links the velocities to the displacement without needing the time.',
        'The signs matter: right is positive, so u, v, a and s can be negative. A negative a with a positive u slows the object down.',
      ],
      misconception: { wrong: 'v² = u² + 2as gives the sign of the velocity.', right: 'It gives v², so it gives the speed; the direction of v has to be found from the motion (for example from v = u + at).' },
    },
  ],
  checks: [
    numQ('pwp-eq-c1', 'An object starts from rest (u = 0) and has a constant acceleration of 2 m/s². What is its speed after a displacement of 9 m, in m/s?', 6, 'v² = 0 + 2 × 2 × 9 = 36, so v = 6 m/s.', { unit: 'm/s', refresherId: 'pwp-eq-step', rules: [[[36], 'You found v² = 36. The speed is the square root of it.', 'forgot_root'], [[18], 'You stopped at 2as without finishing: v² = 2as = 36, so v = 6.', 'formula_misused']] }),
    pick('pwp-eq-c2', 'A cart moving at +5 m/s has a constant acceleration of −2 m/s². What happens to its speed?', [
      ['It decreases', null],
      ['It increases, because the acceleration is large', 'The acceleration is opposite to the velocity, so it reduces the speed.', 'sign_ignored'],
    ], 'Opposite signs: slowing down.', undefined, 'pwp-eq-step'),
  ],
};

export const PWP_ALGEBRA: Prerequisite = {
  id: 'pwp-algebra',
  title: 'Squares and rearranging a formula',
  why: 'Kinetic energy contains the SQUARE of the speed, and the lessons rearrange formulas such as W = F × s and P = W ÷ t to find a missing quantity.',
  connection: 'Earlier grades: squares and simple algebra',
  refresher: [
    {
      id: 'pwp-al-step', title: 'Square first, and do the same to both sides',
      paragraphs: [
        'To square a number multiply it by itself: 3² = 9. If a quantity doubles, its square becomes four times as large: (2v)² = 4v². A negative number squared is positive: (−3)² = 9.',
        'To find a quantity from a formula, do the same thing to both sides. From W = F × s, divide both sides by s to get F = W ÷ s. In ½ m v², square the speed first, then multiply by ½ and the mass.',
      ],
      misconception: { wrong: '½ m v² means ½ × m × v, or the square of (½ m v).', right: 'Only v is squared: ½ × m × (v × v). Square the speed first.' },
    },
  ],
  checks: [
    numQ('pwp-al-c1', 'Calculate ½ × 2 × 4². Give the number.', 16, '4² = 16, then ½ × 2 × 16 = 16.', { refresherId: 'pwp-al-step', rules: [[[4], 'You did not square the 4. Square it first: 4² = 16.', 'not_squared'], [[64], 'You squared (2 × 4) or forgot the ½. Square only the 4, then multiply by ½ and 2.', 'order_of_operations']] }),
    pick('pwp-al-c2', 'A quantity doubles. By what factor does its square change?', [
      ['4', null],
      ['2', 'Squaring is not doubling: (2x)² = 4x².', 'square_is_double'],
    ], 'Double the quantity, four times its square.', undefined, 'pwp-al-step'),
  ],
};

export const PW_PREREQUISITES: Prerequisite[] = [PWP_FORCE, PWP_DISPLACEMENT, PWP_VELOCITY, PWP_WEIGHT, PWP_UNITS, PWP_GRAPH, PWP_EQMOTION, PWP_ALGEBRA];

export const PW_UNITS: EduUnit[] = [
  {
    id: 'pw-unit-1', number: 1, title: 'Understanding work',
    centralIdea: 'In physics, a force does work on an object when the object is displaced along the force. Work = force × displacement, measured in joules; it can be positive, negative or zero, and it is always the work of a named force on a named object.',
    connection: 'This is Section 7.1. It uses force, weight and displacement from Chapters 4 and 6 and prepares the work-energy theorem.',
    vocabulary: [
      { term: 'work', meaning: 'W = F × s: the force along the displacement times the displacement' },
      { term: 'joule (J)', meaning: 'the SI unit of work; 1 J = 1 N × 1 m' },
      { term: 'positive, negative and zero work', meaning: 'force along, opposite to or perpendicular to the displacement (or no force or no displacement)' },
    ],
    discover: ['How work in physics differs from the everyday word', 'How to calculate the work of a constant force and what a joule is', 'Why a force on an object that does not move, or at right angles to its motion, does no work', 'Why work can be negative, and why friction usually does negative work'],
    prerequisiteIds: ['pwp-force', 'pwp-displacement', 'pwp-weight', 'pwp-units', 'pwp-graph'], lessonIds: ['pw-l1', 'pw-l2', 'pw-l3'],
  },
  {
    id: 'pw-unit-2', number: 2, title: 'Energy and the work-energy theorem',
    centralIdea: 'Energy is the capacity to do work. Work done on an object appears as a change in its energy (the work-energy theorem), and the energy of motion is the kinetic energy K = ½mv², which depends on the mass and on the square of the speed.',
    connection: 'This is Sections 7.2, 7.3 and 7.4.1. It uses work from Unit 1 and the equations of motion from Chapter 4.',
    vocabulary: [
      { term: 'energy', meaning: 'the capacity to do work (unit: joule)' },
      { term: 'work-energy theorem', meaning: 'work done on an object = change in its energy' },
      { term: 'kinetic energy', meaning: 'the energy of motion, K = ½mv²' },
    ],
    discover: ['What energy is and how work transfers it', 'The forms of energy and how they change from one to another', 'Why K = ½mv² and why doubling the speed quadruples K', 'How to use work and energy to find a speed or a stopping distance'],
    prerequisiteIds: ['pwp-force', 'pwp-eqmotion', 'pwp-algebra', 'pwp-graph', 'pwp-velocity'], lessonIds: ['pw-l4', 'pw-l5'],
  },
];
