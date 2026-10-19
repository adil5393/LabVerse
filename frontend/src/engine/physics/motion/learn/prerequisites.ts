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

export const PM_PREREQUISITES: Prerequisite[] = [PMP_UNITS, PMP_SIGNED, PMP_LINE];

export const PM_UNITS: EduUnit[] = [
  {
    id: 'pm-unit-1', number: 1, title: 'Describing motion',
    centralIdea: 'To describe motion we first choose a reference point, then give positions with a direction. How far an object travelled (distance) and how its position changed (displacement) are different quantities.',
    connection: 'This is the start of Chapter 4 (Sections 4.1.1 and 4.1.2); speed, velocity, acceleration and graphs build on it.',
    vocabulary: [{ term: 'reference point', meaning: 'a fixed point from which positions are measured' }, { term: 'displacement', meaning: 'the net change in position, with a direction' }, { term: 'distance', meaning: 'the total length of the path travelled' }],
    discover: ['What a reference point is and why we need one', 'The difference between distance and displacement', 'When displacement is zero and when the two are equal'],
    prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-line'], lessonIds: ['pm-l1', 'pm-l2', 'pm-l3'],
  },
];
