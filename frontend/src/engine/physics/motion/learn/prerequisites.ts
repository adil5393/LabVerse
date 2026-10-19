/**
 * Class 9 Physics, Chapter 4: chapter and unit prerequisites (PHY-1A). Only what the opening
 * unit needs: units of length and time, signed numbers, and reading a position on a line.
 * Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { motionVisual, numQ, pick } from './questions';

export const PMP_UNITS: Prerequisite = {
  id: 'pmp-units',
  title: 'Units of length and time',
  why: 'Every distance in this chapter has a unit, usually metres (m), and every time is in seconds (s). Mixing units, such as adding centimetres to metres, gives wrong answers.',
  connection: 'Earlier grades: measurement and the SI unit of length',
  refresher: [
    {
      id: 'pmp-un-step', title: 'Metres, centimetres, kilometres',
      paragraphs: [
        '1 m = 100 cm and 1 km = 1000 m. To change cm to m divide by 100: 350 cm = 3.5 m. To change km to m multiply by 1000: 2.4 km = 2400 m. For time, 1 min = 60 s.',
        'The SI unit of length is the metre. Always write the unit with the number, and use the same unit for every length in one calculation.',
      ],
      misconception: { wrong: '350 cm = 350 m / 100 = 3.5 cm.', right: 'Dividing by 100 changes the number but the unit changes too: 350 cm = 3.5 m.' },
    },
  ],
  checks: [
    numQ('pmp-un-c1', 'Write 350 cm in metres.', 3.5, '350 ÷ 100 = 3.5 m.', { unit: 'm', refresherId: 'pmp-un-step', rules: [[[35000], '35 000 comes from multiplying by 100. A centimetre is smaller than a metre, so the number of metres is smaller: divide.', 'multiplied_not_divided'], [[0.35], '0.35 divides by 1000. There are 100 cm in 1 m.', 'wrong_factor']] }),
    numQ('pmp-un-c2', 'Write 2.4 km in metres.', 2400, '2.4 × 1000 = 2400 m.', { unit: 'm', refresherId: 'pmp-un-step', rules: [[[0.0024], 'A kilometre is bigger than a metre, so the number of metres is bigger: multiply by 1000.', 'divided_not_multiplied'], [[240], '240 multiplies by 100. There are 1000 m in 1 km.', 'wrong_factor']] }),
  ],
};

export const PMP_SIGNED: Prerequisite = {
  id: 'pmp-signed',
  title: 'Positive and negative numbers',
  why: 'Positions to the left of a reference point are negative. Finding how far something moved means subtracting positions, which often involves negative numbers.',
  connection: 'Grade 7: integers',
  refresher: [
    {
      id: 'pmp-sg-step', title: 'Adding and subtracting with signs',
      paragraphs: [
        'On a number line, adding a positive number moves right and adding a negative number moves left. So −5 + 12 = 7 and 3 − 8 = −5.',
        'The change from a first number to a second is second − first. From −4 to 6 the change is 6 − (−4) = 10. Subtracting a negative number adds.',
      ],
      misconception: { wrong: 'From −4 to 6 is a change of 2.', right: 'Count along the line: 4 steps to reach 0 and 6 more to reach 6, which is 10. In symbols, 6 − (−4) = 10.' },
    },
  ],
  checks: [
    numQ('pmp-sg-c1', 'Work out −5 + 12.', 7, 'Start at −5 and move 12 to the right: 7.', { refresherId: 'pmp-sg-step', rules: [[[-7], 'The negative number is smaller, but 12 is bigger, so the answer is positive: 12 − 5.', 'sign_error'], [[17], '17 adds the sizes. A negative number takes away: 12 − 5.', 'sign_ignored']] }),
    numQ('pmp-sg-c2', 'How far is it from the position −4 to the position 6? (Work out 6 − (−4).)', 10, 'Subtracting −4 is the same as adding 4: 6 + 4 = 10.', { refresherId: 'pmp-sg-step', rules: [[[2], '2 comes from 6 − 4. The first position is −4, so subtract −4, which adds 4.', 'double_negative'], [[-10], 'The change from −4 up to 6 is to the right, so it is positive.', 'sign_error']] }),
  ],
};

export const PMP_LINE: Prerequisite = {
  id: 'pmp-line',
  title: 'Reading a position on a straight scale',
  why: 'A position on a straight line is read from a scale with a zero (the reference point), marks in a unit, and two directions.',
  connection: 'Grade 6 to 8: number line and the athlete on a track',
  refresher: [
    {
      id: 'pmp-ln-step', title: 'Zero, marks and two directions',
      paragraphs: [
        'A scale has a zero mark, called the reference point O, and equally spaced marks with a unit (here metres). The mark you read is the distance from O. Marks to the right are positive and marks to the left are negative.',
        'To read a position, find the object, then read the mark below it. A mark to the left of O has a minus sign.',
      ],
      visual: motionVisual({ range: [-40, 40], start: -20, moves: [], editable: true, show: ['position'], stepM: 10 }, 'Optional demo: a scale from −40 m to 40 m with an object you can move.'),
      notice: 'Optional demo: move the object across O and watch the sign of its position change.',
      misconception: { wrong: 'A position to the left of O is a positive distance from it, so it is written without a sign.', right: 'Distance is a length, but a position also gives the direction. On the left of O, the position has a minus sign.' },
    },
  ],
  checks: [
    pick('pmp-ln-c1', 'An object is 20 m to the left of the reference point O. What is its position?', [
      ['−20 m', null],
      ['20 m', 'That is only the distance from O. To give the position we also give the direction, and left is negative: −20 m.', 'sign_dropped'],
      ['+20 m to the right', 'The object is on the left, so the position is negative.', 'wrong_side'],
    ], 'Left of O is negative.', undefined, 'pmp-ln-step'),
    pick('pmp-ln-c2', 'On a position scale, which side of O is usually taken as positive?', [
      ['The right', null],
      ['The left', 'The convention in this chapter is that positions to the right of O are positive and to the left are negative.', 'wrong_convention'],
    ], 'Right is positive.', undefined, 'pmp-ln-step'),
  ],
};

export const PMP_RATE: Prerequisite = {
  id: 'pmp-rate',
  title: 'Rates: dividing a quantity by time',
  why: 'Speed and velocity are rates: how much distance or displacement for each second. You need to divide a quantity by another and keep the units.',
  connection: 'Grade 6 to 8: ratio and unitary method',
  refresher: [
    {
      id: 'pmp-rt-step', title: 'Per second means divide by seconds',
      paragraphs: [
        'If 40 m is covered in 8 s, the distance covered in 1 s is 40 ÷ 8 = 5 m. We write 5 m/s ("5 metres per second"). A rate is one quantity divided by another, and the unit shows the division.',
        'To find the quantity back, multiply: 5 m/s for 6 s gives 5 × 6 = 30 m.',
      ],
      misconception: { wrong: '40 m in 8 s is 40 × 8 = 320 m/s.', right: 'A rate divides: 40 ÷ 8 = 5 m/s. Multiplying gives a number whose unit is not m/s.' },
    },
  ],
  checks: [
    numQ('pmp-rt-c1', '30 m is covered in 6 s. How many metres are covered in each second?', 5, '30 ÷ 6 = 5 m in each second.', { unit: 'm/s', refresherId: 'pmp-rt-step', rules: [[[180], '180 comes from multiplying. A rate divides the distance by the time.', 'multiplied_not_divided'], [[0.2], '0.2 divides the time by the distance. Divide the distance by the time.', 'inverted_ratio']] }),
    numQ('pmp-rt-c2', 'An object moves at 4 m/s for 10 s. How far does it go, in metres?', 40, '4 × 10 = 40 m.', { unit: 'm', refresherId: 'pmp-rt-step', rules: [[[2.5], '2.5 comes from dividing. To find the distance from a rate and a time, multiply.', 'divided_not_multiplied']] }),
  ],
};

export const PMP_FORMULA: Prerequisite = {
  id: 'pmp-formula',
  title: 'Using a formula: substitute, square, rearrange',
  why: 'The equations of motion are formulas. You substitute numbers with their signs, square a number, and sometimes rearrange the formula to find another quantity.',
  connection: 'Grade 7 and 8: algebraic expressions and linear equations',
  refresher: [
    {
      id: 'pmp-fm-step', title: 'Substitute carefully, keep the signs',
      paragraphs: [
        'To use a formula, replace each letter by its number and then calculate in order: squares first, then multiplication, then addition. For y = 3 + 2x with x = 4: y = 3 + 2 × 4 = 11.',
        'Put a negative number in brackets: with a = −2 and t = 3, a × t = (−2) × 3 = −6, and ½ × a × t² = ½ × (−2) × 9 = −9. To undo a formula, do the opposite operations in reverse: from 2as = 64 and s = 16 we get a = 64 ÷ (2 × 16) = 2.',
      ],
      misconception: { wrong: 'With a = −2, a × t² means −2 × 3² = (−6)² = 36.', right: 'Square the 3 first: t² = 9, then multiply: (−2) × 9 = −18. Squaring comes before multiplying.' },
    },
  ],
  checks: [
    numQ('pmp-fm-c1', 'Find y = 5 + 3x for x = 4.', 17, '5 + 3 × 4 = 5 + 12 = 17.', { refresherId: 'pmp-fm-step', rules: [[[32], '32 comes from (5 + 3) × 4. Multiply before adding.', 'order_of_operations']] }),
    numQ('pmp-fm-c2', 'Find ½ × a × t² for a = −2 and t = 3.', -9, '½ × (−2) × 9 = −9.', { refresherId: 'pmp-fm-step', rules: [[[9], 'The acceleration is negative, so the result is negative.', 'sign_dropped'], [[-3], '−3 uses 3 instead of 3² = 9.', 'forgot_square']] }),
  ],
};

export const PMP_CIRCLE: Prerequisite = {
  id: 'pmp-circle',
  title: 'Circle: radius, diameter and circumference',
  why: 'Motion on a circle needs the length of the circle (the circumference) and the straight distance across it (the diameter).',
  connection: 'Grade 6 to 8: circles and the value of π',
  refresher: [
    {
      id: 'pmp-ci-step', title: 'Diameter, circumference and π',
      paragraphs: [
        'The radius r is the distance from the centre to the circle. The diameter is twice the radius, d = 2r. The circumference, the length once round the circle, is 2πr, where π is about 3.14.',
        'For r = 10 m: diameter = 20 m and circumference = 2 × 3.14 × 10 = 62.8 m. Half the circumference is 31.4 m, but the straight line across the circle is the diameter, 20 m.',
      ],
      misconception: { wrong: 'Half way round a circle is the same distance as straight across.', right: 'The curved path (half the circumference) is longer than the straight line across (the diameter).' },
    },
  ],
  checks: [
    numQ('pmp-ci-c1', 'What is the circumference of a circle of radius 5 m (use π = 3.14), in metres?', 31.4, '2 × 3.14 × 5 = 31.4 m.', { unit: 'm', tolerance: 0.1, refresherId: 'pmp-ci-step', rules: [[[15.7], '15.7 m is only πr. The circumference is 2πr.', 'forgot_two'], [[78.5], '78.5 is the area πr², not the circumference.', 'area_for_circumference']] }),
    numQ('pmp-ci-c2', 'What is the diameter of a circle of radius 7 m, in metres?', 14, 'd = 2r = 14 m.', { unit: 'm', refresherId: 'pmp-ci-step', rules: [[[3.5], '3.5 is half the radius. The diameter is twice the radius.', 'halved_not_doubled']] }),
  ],
};

export const PM_PREREQUISITES: Prerequisite[] = [PMP_UNITS, PMP_SIGNED, PMP_LINE, PMP_RATE, PMP_FORMULA, PMP_CIRCLE];

export const PM_UNITS: EduUnit[] = [
  {
    id: 'pm-unit-1', number: 1, title: 'Describing motion',
    centralIdea: 'To describe motion we first choose a reference point, then give positions with a direction. How far an object travelled (distance) and how its position changed (displacement) are different quantities.',
    connection: 'This is the start of Chapter 4 (Sections 4.1.1 and 4.1.2); speed, velocity, acceleration and graphs build on it.',
    vocabulary: [{ term: 'reference point', meaning: 'a fixed point from which positions are measured' }, { term: 'displacement', meaning: 'the net change in position, with a direction' }, { term: 'distance', meaning: 'the total length of the path travelled' }],
    discover: ['What a reference point is and why we need one', 'The difference between distance and displacement', 'When displacement is zero and when the two are equal'],
    prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-line'], lessonIds: ['pm-l1', 'pm-l2', 'pm-l3'],
  },
  {
    id: 'pm-unit-2', number: 2, title: 'Speed and velocity',
    centralIdea: 'How fast an object moves is measured by dividing a quantity by time. Speed divides the distance and has no direction. Velocity divides the displacement and has a direction.',
    connection: 'This is Section 4.1.3. It uses distance and displacement from Unit 1, and leads to acceleration and graphs.',
    vocabulary: [{ term: 'average speed', meaning: 'total distance ÷ total time' }, { term: 'average velocity', meaning: 'displacement ÷ time, with a direction' }, { term: 'uniform motion', meaning: 'equal distances in equal intervals of time' }],
    discover: ['How to calculate average speed and average velocity', 'Why the two can differ for the same trip', 'Why replay speed on screen is not the speed of the object'],
    prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-rate'], lessonIds: ['pm-l4', 'pm-l5'],
  },
  {
    id: 'pm-unit-3', number: 3, title: 'Acceleration and graphs',
    centralIdea: 'Acceleration is the rate of change of velocity. Graphs show motion at a glance: on a position–time graph the slope is the velocity, and on a velocity–time graph the slope is the acceleration and the area is the displacement.',
    connection: 'This is Sections 4.1.4 and 4.2. It builds on speed and velocity, and prepares the equations of motion.',
    vocabulary: [{ term: 'acceleration', meaning: 'change in velocity ÷ time taken (m/s²)' }, { term: 'slope', meaning: 'rise ÷ run on a graph' }, { term: 'uniform acceleration', meaning: 'equal changes of velocity in equal intervals of time' }],
    discover: ['How to calculate average acceleration and read its sign', 'What the slope of each graph means', 'Why the area under a velocity–time graph is the displacement'],
    prerequisiteIds: ['pmp-signed', 'pmp-rate', 'pmp-units'], lessonIds: ['pm-l6', 'pm-l7', 'pm-l8'],
  },
  {
    id: 'pm-unit-4', number: 4, title: 'Equations of motion',
    centralIdea: 'For a constant acceleration in a straight line, three equations connect the initial velocity, final velocity, acceleration, time and displacement. They come from the slope and the area of the velocity–time graph.',
    connection: 'This is Section 4.3. It uses acceleration and the velocity–time graph from Unit 3.',
    vocabulary: [{ term: 'initial velocity u', meaning: 'the velocity at the start' }, { term: 'final velocity v', meaning: 'the velocity at the end' }, { term: 'constant acceleration', meaning: 'the same acceleration throughout the motion' }],
    discover: ['How the three equations are derived', 'How to choose the right equation', 'When the equations must not be used'],
    prerequisiteIds: ['pmp-signed', 'pmp-formula', 'pmp-rate'], lessonIds: ['pm-l9'],
  },
  {
    id: 'pm-unit-5', number: 5, title: 'Uniform circular motion',
    centralIdea: 'An object can move at a constant speed and still have a changing velocity, because velocity includes direction. Going round a circle, the velocity keeps turning.',
    connection: 'This is Section 4.4.1. It applies speed, velocity, distance and displacement to motion that is not on a straight line.',
    vocabulary: [{ term: 'uniform circular motion', meaning: 'motion round a circle at a constant speed' }, { term: 'period', meaning: 'the time for one complete turn' }],
    discover: ['Why the speed is constant but the velocity is not', 'The distance along the arc and the displacement along the chord', 'Why the average velocity after a full turn is zero'],
    prerequisiteIds: ['pmp-units', 'pmp-circle'], lessonIds: ['pm-l10'],
  },
];
