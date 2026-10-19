/**
 * Circles: chapter and unit prerequisites (EDU-1). Original wording; the
 * ideas are those the NCERT chapter itself builds on (equal distance, the
 * perpendicular bisector, angle facts, isosceles and right triangles).
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { chordFigure, type Figure } from './figure';
import { altForFigure, circleVisual, pick } from './questions';

const SMALL: Figure = { r: 5, points: [{ id: 'P', angle: 40 }], segments: [{ id: 'OP', from: 'O', to: 'P', kind: 'radius' }] };

export const CPRE_EQUAL_DISTANCE: Prerequisite = {
  id: 'cpre-equal-distance',
  title: 'Points the same distance from a centre',
  why: 'A circle is defined by equal distance from one point. If this idea is firm, every circle fact that follows is easier to see.',
  connection: 'Earlier grades: using a compass',
  refresher: [
    {
      id: 'cir-pre-compass', title: 'What a compass does',
      paragraphs: ['Fix the compass point at O, set it to 5 cm, and turn the pencil all the way round. Every mark is exactly 5 cm from O.', 'That set of marks is a circle. O is its centre and 5 cm is its radius.'],
      visual: circleVisual(SMALL, altForFigure('A point P on the circle, joined to the centre O.', SMALL), { highlight: ['OP'] }),
      notice: 'Wherever P sits on the circle, the length OP stays the same.',
    },
  ],
  checks: [
    pick('cpre-eq-c1', 'A circle has centre O and radius 4 cm. A point X is 4 cm from O. Where is X?', [
      ['On the circle', null],
      ['Inside the circle', 'Points inside the circle are closer to O than 4 cm. X is exactly 4 cm away.'],
      ['Outside the circle', 'Points outside are farther than 4 cm from O. X is exactly 4 cm away.'],
    ], 'Exactly the radius away means on the circle.', undefined, 'cir-pre-compass'),
  ],
};

const MID: Figure = chordFigure(5, 8);
export const CPRE_PERP_BISECTOR: Prerequisite = {
  id: 'cpre-perp-bisector',
  title: 'The perpendicular bisector of a segment',
  why: 'The centre of a circle through two points lies on the perpendicular bisector of the segment joining them. Chord facts depend on it.',
  connection: 'Earlier grades: constructions',
  refresher: [
    {
      id: 'cir-pre-bisector', title: 'Equal distance from both ends',
      paragraphs: ['A perpendicular bisector of a segment AB cuts it into two equal halves at right angles.', 'Every point on this line is the same distance from A as from B. That is why it helps us find equal-distance points.'],
      visual: circleVisual(MID, altForFigure('Segment AB with the line from O meeting it at right angles at its midpoint M.', MID), { highlight: ['OM'] }),
      notice: 'The small square marks the right angle at M. M is halfway along AB.',
    },
  ],
  checks: [
    pick('cpre-pb-c1', 'P is on the perpendicular bisector of AB. Which is true?', [
      ['PA = PB', null],
      ['PA = AB', 'The bisector does not make P as far from A as AB is long. It makes P equally far from the TWO ends.'],
      ['P is the midpoint of AB', 'Only one point of the bisector (where it crosses AB) is the midpoint. Other points are equally far from A and B but are not on AB.'],
    ], 'Every point on the perpendicular bisector is equally far from A and B.', undefined, 'cir-pre-bisector'),
  ],
};

export const CPRE_ANGLES: Prerequisite = {
  id: 'cpre-angles',
  title: 'Angle facts you will use',
  why: 'Almost every circle theorem is used by finding angles. You need the angle sum of a triangle and the angle on a straight line.',
  connection: 'Earlier grades: lines and angles, triangles',
  refresher: [
    {
      id: 'cir-pre-angles', title: 'Angles that add to 180°',
      paragraphs: ['The three angles of any triangle add up to 180°. Angles on a straight line also add up to 180°, and a full turn is 360°.', 'A right angle is 90°.'],
    },
  ],
  checks: [
    {
      kind: 'numeric', id: 'cpre-ang-c1', prompt: 'Two angles of a triangle are 50° and 60°. What is the third angle?', answer: 70, unit: '°',
      rules: [{ values: [110], entry: { message: '110° is 50 + 60. The three angles must add to 180°, so the third is 180 − 110.', refresherId: 'cir-pre-angles', misconception: 'forgot_subtract_from_180' } }, { values: [130], entry: { message: '130° is 180 − 50. Subtract BOTH known angles from 180°.', refresherId: 'cir-pre-angles', misconception: 'subtracted_one_angle' } }],
      defaultFeedback: { message: 'Add the two known angles, then subtract the total from 180°.', refresherId: 'cir-pre-angles' }, explanation: '180 − (50 + 60) = 70.',
    },
  ],
};

export const CPRE_TRIANGLES: Prerequisite = {
  id: 'cpre-triangles',
  title: 'Isosceles triangles and the Pythagoras theorem',
  why: 'Two radii and a chord make an isosceles triangle, and the distance from the centre to a chord comes from a right triangle.',
  connection: 'Earlier grades: triangles; Class 9: Pythagoras theorem',
  refresher: [
    {
      id: 'cir-pre-triangles', title: 'Equal sides, equal angles; squares on the sides',
      paragraphs: ['In an isosceles triangle the angles opposite the equal sides are equal. Two radii of a circle are equal, so a triangle with two radii as sides is isosceles.', 'In a right triangle with short sides a and b and longest side c: a² + b² = c². For 3 and 4: 9 + 16 = 25, so c = 5.'],
    },
  ],
  checks: [
    {
      kind: 'numeric', id: 'cpre-tri-c1', prompt: 'A right triangle has hypotenuse 5 cm and one short side 3 cm. How long is the other short side?', answer: 4, unit: 'cm',
      rules: [{ values: [2], entry: { message: '5 − 3 = 2 subtracts the lengths. Use squares: the other side² = 5² − 3².', refresherId: 'cir-pre-triangles', misconception: 'subtracted_lengths' } }, { values: [16], entry: { message: '16 is the SQUARE of the other side (25 − 9). Take the square root.', refresherId: 'cir-pre-triangles', misconception: 'forgot_square_root' } }],
      defaultFeedback: { message: 'Use a² + b² = c²: b² = 25 − 9, then the square root.', refresherId: 'cir-pre-triangles' }, explanation: '25 − 9 = 16 and √16 = 4.',
    },
  ],
};

export const CPRE_PROOF: Prerequisite = {
  id: 'cpre-proof',
  title: 'Reading a proof: claim and reason',
  why: 'Circle theorems come with proofs. A proof is a chain of claims, each with a reason, ending at what we wanted to show. Measuring a drawing is not a proof.',
  connection: 'Class 9: proofs in geometry',
  refresher: [
    {
      id: 'cir-pre-proof', title: 'Every claim needs a reason',
      paragraphs: ['A proof is a list: each line says something and says why it must be true (a definition, a given fact, or an earlier line).', 'Measuring a figure only tests one drawing. A proof works for every figure of that kind because its reasons do not depend on the measurements.'],
    },
  ],
  checks: [
    pick('cpre-pr-c1', 'Which is a valid reason for the claim "OA = OB"?', [
      ['OA and OB are both radii of the same circle', null],
      ['They look the same length in the drawing', 'Appearance is not a reason. A proof needs a fact such as a definition or an earlier result.'],
      ['I measured them with a ruler and got 4 cm', 'A measurement checks one drawing. The reason must hold for every circle: both are radii.'],
    ], 'Both are radii of one circle, and all radii are equal by definition.', undefined, 'cir-pre-proof'),
  ],
};

export const CIRCLES_PREREQUISITES: Prerequisite[] = [CPRE_EQUAL_DISTANCE, CPRE_PERP_BISECTOR, CPRE_ANGLES, CPRE_TRIANGLES, CPRE_PROOF];

export const CIRCLES_UNITS: EduUnit[] = [
  {
    id: 'unit-1-foundations', number: 1, title: 'Foundations & symmetries',
    centralIdea: 'A circle is every point at one distance from a centre, and that single idea explains its parts, its symmetry and which circles pass through given points.',
    connection: 'This unit sets up the words and facts that every later theorem uses.',
    vocabulary: [{ term: 'radius', meaning: 'the fixed distance from the centre to the circle' }, { term: 'chord', meaning: 'a segment with both ends on the circle' }, { term: 'diameter', meaning: 'a chord through the centre; twice the radius' }],
    discover: ['Why every diameter is a line of symmetry', 'How many circles pass through one, two or three points'],
    prerequisiteIds: ['cpre-equal-distance', 'cpre-perp-bisector'], lessonIds: ['circles-l1', 'circles-l2', 'circles-l3'],
  },
  {
    id: 'unit-2-chords', number: 2, title: 'Chords & distances',
    centralIdea: 'A chord, the centre and the perpendicular from the centre fit together in right triangles, linking length, angle and distance.',
    connection: 'It uses the perpendicular bisector and the equal radii from Unit 1.',
    vocabulary: [{ term: 'subtend', meaning: 'a chord subtends the angle formed at a point by lines to its two ends' }, { term: 'equidistant', meaning: 'the same distance from a point or line' }],
    discover: ['The perpendicular from the centre bisects a chord', 'Equal chords subtend equal angles at the centre', 'Longer chords are closer to the centre'],
    prerequisiteIds: ['cpre-triangles', 'cpre-perp-bisector'], lessonIds: ['circles-l4', 'circles-l5', 'circles-l6'],
  },
  {
    id: 'unit-3-angles', number: 3, title: 'Angles & theorems',
    centralIdea: 'Angles made by an arc are tied together: the angle at the centre is twice the angle at the circle, which forces equal angles in a segment and 180° across a cyclic quadrilateral.',
    connection: 'It builds on chord facts and the isosceles triangles made by radii.',
    vocabulary: [{ term: 'arc', meaning: 'a part of the circle between two points' }, { term: 'cyclic quadrilateral', meaning: 'a four-sided figure with all four corners on a circle' }, { term: 'concyclic', meaning: 'lying on one circle' }],
    discover: ['Why the angle at the centre is double', 'Why the angle in a semicircle is 90°', 'When four points lie on one circle'],
    prerequisiteIds: ['cpre-angles', 'cpre-triangles'], lessonIds: ['circles-l7', 'circles-l8', 'circles-l9', 'circles-l10'],
  },
  {
    id: 'unit-4-mastery', number: 4, title: 'Mastery & revision',
    centralIdea: 'Solving circle problems is choosing the right theorem for what the figure gives you, then reasoning one step at a time.',
    connection: 'It pulls together every theorem from Units 1 to 3.',
    vocabulary: [{ term: 'angle chase', meaning: 'finding unknown angles by applying known facts one after another' }],
    discover: ['How to decide which theorem applies', 'How to write a short, complete argument'],
    prerequisiteIds: ['cpre-angles', 'cpre-proof'], lessonIds: ['circles-l11'],
  },
];
