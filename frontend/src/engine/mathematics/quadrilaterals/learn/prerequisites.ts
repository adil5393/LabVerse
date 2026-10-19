/**
 * Quadrilaterals: chapter and unit prerequisites (EDU-1Q). Only ideas the
 * chapter really uses: angles, parallel lines, congruent triangles, "if ... then"
 * and its converse, and midpoints. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { FIG } from './figure';
import { num, pick, triVisual } from './questions';

export const QP_ANGLES: Prerequisite = {
  id: 'qp-angles',
  title: 'Angles: in a triangle, on a line, around a point',
  why: 'Almost every fact about a quadrilateral is about its angles. You will use that the three angles of a triangle add to 180°, and that angles around a point fill a full turn of 360°.',
  connection: 'Grades 6 to 8: angle sum of a triangle',
  refresher: [
    {
      id: 'qp-ang-step', title: 'Three numbers you must know',
      paragraphs: [
        'The three angles of any triangle add up to 180°. Angles that together make a straight line add up to 180°. Angles that go all the way around one point add up to 360°.',
        'So if two angles of a triangle are 50° and 60°, the third is 180 − 50 − 60 = 70°.',
      ],
      visual: triVisual('triangleAngles', FIG.tri, 'Optional demo: a triangle whose corners you can move, with its three angles and their sum.'),
      notice: 'Optional demo: move any corner. The angles change but their sum stays 180°.',
      misconception: { wrong: 'A bigger triangle has a bigger angle sum.', right: 'The angle sum is 180° for every triangle, large or small. Only the angles themselves change.' },
    },
  ],
  checks: [
    num('qp-ang-c1', 'Two angles of a triangle are 50° and 60°. What is the third angle?', 70, '180 − (50 + 60) = 70.', {
      unit: '°', refresherId: 'qp-ang-step',
      rules: [[[110], '110° is 50 + 60. The three angles must add to 180°, so the third angle is 180 − 110.', 'forgot_subtract_from_180'], [[130], '130° is 180 − 50. You also have to subtract the 60°.', 'one_angle_only']],
      wrong: 'Add the two known angles, then subtract the total from 180°.',
    }),
    pick('qp-ang-c2', 'Four angles meet at one point and fill the whole space around it. What do they add up to?', [
      ['360°', null],
      ['180°', '180° is a straight line, half a turn. Going all the way around the point is a full turn.', 'turn_halved'],
      ['90°', '90° is a quarter turn, one corner of a square. Four such corners fill the whole turn, 4 × 90 = 360.', 'turn_halved'],
    ], 'A full turn is 360°.', undefined, 'qp-ang-step'),
  ],
};

export const QP_PARALLEL: Prerequisite = {
  id: 'qp-parallel-lines',
  title: 'Parallel lines and a transversal',
  why: 'Parallel sides are what make a parallelogram. The proofs here use two facts: parallel lines cut by a transversal make equal alternate angles, and the reverse, equal alternate angles tell you the lines are parallel.',
  connection: 'Grade 7: lines and angles',
  refresher: [
    {
      id: 'qp-par-step', title: 'Alternate angles and co-interior angles',
      paragraphs: [
        'A transversal is a line that crosses two other lines. If the two lines are parallel, then the alternate angles (the "Z" shape) are equal, and the co-interior angles (the "C" shape) add up to 180°.',
        'It also works backwards: if a transversal makes equal alternate angles, or co-interior angles adding to 180°, then the two lines are parallel. The textbook uses this direction to show that sides are parallel.',
      ],
      misconception: { wrong: 'Alternate angles are always equal.', right: 'They are equal only when the two lines are parallel. If the lines are not parallel, the alternate angles differ.' },
    },
  ],
  checks: [
    num('qp-par-c1', 'AB ∥ DC and the transversal AC makes ∠BAC = 40°. What is the alternate angle ∠ACD?', 40, 'Alternate angles between parallel lines are equal.', {
      unit: '°', refresherId: 'qp-par-step',
      rules: [[[140], '140° is 180 − 40. That would be a co-interior pair. Alternate angles (the "Z" shape) are equal to each other.', 'alternate_vs_cointerior']],
      wrong: 'Alternate angles ("Z" shape) between parallel lines are equal to each other.',
    }),
    pick('qp-par-c2', 'A transversal crosses two lines and makes equal alternate angles. What follows?', [
      ['The two lines are parallel.', null],
      ['Nothing: the lines could be anything.', 'Equal alternate angles are exactly the sign of parallel lines. The statement works in both directions.', 'one_direction_only'],
      ['The two lines are perpendicular.', 'Perpendicular means they meet at 90°. Equal alternate angles tell you the lines are parallel.', 'parallel_vs_perpendicular'],
    ], 'Equal alternate angles show the lines are parallel.', undefined, 'qp-par-step'),
  ],
};

export const QP_CONGRUENCE: Prerequisite = {
  id: 'qp-congruence',
  title: 'Congruent triangles: SSS, SAS, ASA',
  why: 'The proofs about quadrilaterals work by cutting them into triangles and showing two triangles are congruent. Then their matching sides and angles are equal.',
  connection: 'Grade 7: congruence of triangles',
  refresher: [
    {
      id: 'qp-con-step', title: 'Three ways to know two triangles are the same',
      paragraphs: [
        'Two triangles are congruent if they match exactly. You do not need to check everything: SSS (three pairs of sides equal), SAS (two sides and the angle BETWEEN them), or ASA (two angles and the side between them) is enough.',
        'Once the triangles are congruent, every matching side and angle is equal. This step is often written "corresponding parts of congruent triangles".',
      ],
      misconception: { wrong: 'Two sides and any angle make the triangles congruent.', right: 'For SAS the angle must be the one between the two sides. Two sides and a different angle can give two different triangles.' },
    },
  ],
  checks: [
    pick('qp-con-c1', 'Triangles PQR and XYZ have PQ = XY, PR = XZ and ∠P = ∠X. Why are they congruent?', [
      ['SAS: two sides and the angle between them.', null],
      ['SSS: all three sides.', 'We are not told that QR = YZ. We know two sides and an angle, which is SAS.', 'wrong_test'],
      ['ASA: two angles and a side.', 'Only one angle is given as equal. Two sides and the angle between them make SAS.', 'wrong_test'],
    ], 'The equal angle P is between the equal sides PQ and PR (and X between XY and XZ).', undefined, 'qp-con-step'),
    pick('qp-con-c2', 'Triangles ABC and DEF are congruent with A matching D, B matching E, C matching F. Which must be equal?', [
      ['BC and EF', null],
      ['BC and DF', 'BC is opposite A; its partner is EF, opposite D. DF joins D and F, which match A and C.', 'wrong_correspondence'],
      ['AB and EF', 'AB joins A and B, so its partner joins D and E, which is DE.', 'wrong_correspondence'],
    ], 'Matching vertices give matching sides: B→E and C→F, so BC = EF.', undefined, 'qp-con-step'),
  ],
};

export const QP_IF_THEN: Prerequisite = {
  id: 'qp-if-then',
  title: '"If … then …" and its converse',
  why: 'This chapter is built around converses: "if a quadrilateral is a parallelogram then its diagonals bisect each other" and the question of whether the reverse is true as well.',
  connection: 'The chapter before this one: Propositions and Their Converses',
  refresher: [
    {
      id: 'qp-if-step', title: 'Swapping the two parts',
      paragraphs: [
        'A statement "if P then Q" has a converse "if Q then P". The converse can be true or false on its own: "if a number is a multiple of 6 then it is a multiple of 3" is true, but its converse is false (9).',
        'So when a theorem is known, you cannot assume the converse. You must check it, by finding a counterexample or by proving it.',
      ],
      misconception: { wrong: 'If a statement is true, its converse is true too.', right: 'The converse is a different statement. Check it separately.' },
    },
  ],
  checks: [
    pick('qp-if-c1', 'What is the converse of "If a figure is a square, then it has four equal sides"?', [
      ['If a figure has four equal sides, then it is a square.', null],
      ['If a figure is not a square, then it does not have four equal sides.', 'That negates both parts (the inverse). The converse just swaps the parts.', 'inverse_for_converse'],
      ['If a figure is a square, then it has four sides.', 'That keeps "if a figure is a square" and changes the conclusion. The converse swaps the two parts.', 'wrong_swap'],
    ], 'Swap the parts: the conclusion becomes the condition.', undefined, 'qp-if-step'),
    pick('qp-if-c2', 'The converse above is false. Which figure shows it?', [
      ['A rhombus that is not a square', null],
      ['A square', 'A square has four equal sides AND is a square, so it fits the statement; it cannot be a counterexample.', 'example_not_counter'],
      ['A triangle', 'A triangle does not have four sides, so it does not even meet the condition "four equal sides".', 'hypothesis_not_met'],
    ], 'A rhombus has four equal sides but its angles need not be right angles.', undefined, 'qp-if-step'),
  ],
};

export const QP_MIDPOINT: Prerequisite = {
  id: 'qp-midpoint',
  title: 'The midpoint of a segment',
  why: 'The Midpoint Theorem, the medians and the Varignon parallelogram are all about joining midpoints. You need to be sure what a midpoint is and what it gives you.',
  connection: 'Grade 6: line segments',
  refresher: [
    {
      id: 'qp-mid-step', title: 'Half way, exactly',
      paragraphs: [
        'The midpoint of a segment AB is the point M on AB with AM = MB. So AM is half of AB.',
        'A median of a triangle joins a corner to the midpoint of the opposite side. A triangle has three medians.',
      ],
      visual: triVisual('midpoint', FIG.tri, 'Optional demo: triangle ABC with P the midpoint of AB and Q the midpoint of AC.'),
      notice: 'Optional demo: move the corners and watch P stay exactly half way along AB.',
      misconception: { wrong: 'A midpoint is somewhere near the middle.', right: 'A midpoint is exactly half way: the two parts are equal.' },
    },
  ],
  checks: [
    num('qp-mid-c1', 'M is the midpoint of AB and AB = 14 cm. How long is AM?', 7, 'AM is half of AB: 14 ÷ 2 = 7.', {
      unit: 'cm', refresherId: 'qp-mid-step', rules: [[[28], '28 is double AB. The midpoint cuts AB into two equal halves, so AM is half of AB.', 'doubled_not_halved']],
      wrong: 'AM is half of AB.',
    }),
    pick('qp-mid-c2', 'Which segment is a median of triangle ABC?', [
      ['From A to the midpoint of BC', null],
      ['From A to the foot of the perpendicular on BC', 'That is an altitude. A median goes to the midpoint of the opposite side, which need not be where the perpendicular lands.', 'median_altitude'],
      ['The segment joining B and C', 'BC is a side of the triangle. A median joins a corner to the midpoint of the opposite side.', 'median_side'],
    ], 'A median joins a vertex to the midpoint of the opposite side.', undefined, 'qp-mid-step'),
  ],
};

export const QUAD_PREREQUISITES: Prerequisite[] = [QP_ANGLES, QP_PARALLEL, QP_CONGRUENCE, QP_IF_THEN, QP_MIDPOINT];

export const QUAD_UNITS: EduUnit[] = [
  {
    id: 'qunit-1', number: 1, title: 'What is a quadrilateral?',
    centralIdea: 'A quadrilateral is four points joined by four sides that do not cross, and its four angles always add up to 360°.',
    connection: 'It builds on triangles: every fact about a quadrilateral starts by cutting it into triangles.',
    vocabulary: [{ term: 'vertex', meaning: 'a corner of the figure' }, { term: 'diagonal', meaning: 'a segment joining two opposite vertices' }, { term: 'convex', meaning: 'every interior angle is less than 180°' }],
    discover: ['Which four-sided figures count as quadrilaterals', 'How to tell convex from non-convex', 'Why the angles add up to 360°'],
    prerequisiteIds: ['qp-angles'], lessonIds: ['quad-l1'],
  },
  {
    id: 'qunit-2', number: 2, title: 'Parallelograms and the tests for them',
    centralIdea: 'A parallelogram has three properties, and each one reversed is also true: any one of four simple tests proves a quadrilateral is a parallelogram.',
    connection: 'It uses congruent triangles and parallel lines, and it is the first real example of a converse that holds.',
    vocabulary: [{ term: 'parallelogram', meaning: 'a quadrilateral whose opposite sides are parallel' }, { term: 'converse', meaning: 'the statement with its two parts swapped' }],
    discover: ['What every parallelogram has in common', 'Which conditions are enough to prove a parallelogram', 'Which look enough but are not'],
    prerequisiteIds: ['qp-parallel-lines', 'qp-congruence', 'qp-if-then'], lessonIds: ['quad-l2', 'quad-l3'],
  },
  {
    id: 'qunit-3', number: 3, title: 'The Midpoint Theorem',
    centralIdea: 'Joining the midpoints of two sides of a triangle gives a segment parallel to the third side and half as long; and the reverse also holds.',
    connection: 'Parallelograms are the tool: the proof builds a parallelogram and uses the equal-and-parallel test.',
    vocabulary: [{ term: 'midpoint', meaning: 'the point exactly half way along a segment' }],
    discover: ['What the theorem says and what it needs', 'Why the converse works', 'Why the midpoint matters'],
    prerequisiteIds: ['qp-midpoint', 'qp-parallel-lines'], lessonIds: ['quad-l4', 'quad-l5'],
  },
  {
    id: 'qunit-4', number: 4, title: 'Medians and midpoints of a quadrilateral',
    centralIdea: 'The three medians of a triangle meet at one point that cuts each in the ratio 2 : 1, and the midpoints of the sides of ANY quadrilateral form a parallelogram.',
    connection: 'Both facts come from the Midpoint Theorem and the parallelogram tests.',
    vocabulary: [{ term: 'median', meaning: 'a segment from a vertex to the midpoint of the opposite side' }, { term: 'centroid', meaning: 'the point where the three medians meet' }],
    discover: ['Why the three medians always meet', 'The ratio 2 : 1', 'A parallelogram hiding inside every quadrilateral'],
    prerequisiteIds: ['qp-midpoint', 'qp-congruence'], lessonIds: ['quad-l6', 'quad-l7'],
  },
  {
    id: 'qunit-5', number: 5, title: 'Tiling the plane',
    centralIdea: 'Because the four angles of a quadrilateral add to 360°, copies of any quadrilateral can be fitted together around a point, and this extends to cover the whole plane.',
    connection: 'It reuses the angle sum from Unit 1.',
    vocabulary: [{ term: 'tiling', meaning: 'covering the plane with copies of a shape with no gaps and no overlaps' }],
    discover: ['Four angles fill a full turn', 'A pattern that tiles with any quadrilateral'],
    prerequisiteIds: ['qp-angles'], lessonIds: ['quad-l8'],
  },
];
