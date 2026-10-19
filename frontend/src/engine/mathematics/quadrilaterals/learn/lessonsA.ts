/**
 * Quadrilaterals Learn lessons 1 to 3 (EDU-1Q): what a quadrilateral is,
 * the properties of a parallelogram, and the tests for a parallelogram.
 * Wording, figures and questions are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { FIG, type Quad } from './figure';
import { freeVisual, galleryQ, ind, num, ord, pick, quadVisual } from './questions';

export const LAB = '/mathematics/quadrilaterals/workbench';
const lab = (description: string): Investigation => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

const fig = (id: string, label: string, pts: Quad) => ({ id, label, pts });

// ---------------------------------------------------------------------------
// Lesson 1: What is a quadrilateral?  (textbook 12.1)
// ---------------------------------------------------------------------------

const GAL_CROSS = [fig('a', 'P', FIG.general), fig('b', 'Q', FIG.bowtie), fig('c', 'R', FIG.dart), fig('d', 'S', FIG.parallelogram)];
const GAL_LINE = [fig('a', 'P', FIG.collinear), fig('b', 'Q', FIG.kite), fig('c', 'R', FIG.dart), fig('d', 'S', FIG.trapezium)];
const GAL_CONVEX = [fig('a', 'P', FIG.parallelogram), fig('b', 'Q', FIG.dart), fig('c', 'R', FIG.kite), fig('d', 'S', FIG.general)];

export const L1: EduLesson = {
  id: 'quad-l1', unitId: 'qunit-1', number: 1, title: 'What is a quadrilateral?',
  objective: 'say what makes four points and four segments a quadrilateral, name its parts, tell convex from non-convex, and use the angle sum of 360°.',
  prerequisiteIds: ['qp-angles'],
  objectives: [
    { id: 'shape', label: 'Say what is and is not a quadrilateral, and name its parts' },
    { id: 'convex', label: 'Tell convex from non-convex' },
    { id: 'sum', label: 'Use the angle sum of 360°' },
  ],
  steps: [
    {
      id: 'q1-def', title: 'Four points, four sides', phase: 'observe',
      paragraphs: [
        'Take four points A, B, C, D and join A to B, B to C, C to D and D to A. Sometimes you get the four-sided figure you expect. Sometimes you do not.',
        'To count as a quadrilateral the four points must be different, no three of them may lie on one line, and the sides must not cross each other. A figure with three points on a line is really a triangle with an extra point; a figure whose sides cross is a self-intersecting four-sided figure.',
        'Unless stated otherwise, "quadrilateral" in this chapter means a plane figure whose sides do not cross.',
      ],
      vocabulary: [{ term: 'vertices', meaning: 'the corners A, B, C, D' }, { term: 'sides', meaning: 'the segments AB, BC, CD, DA' }],
      visual: freeVisual(FIG.general, 'Four vertices you can move.', { focus: 'shape', diagonals: true }),
      notice: 'Drag a vertex so that two sides cross, or three vertices line up, and watch the readout say what the figure now is.',
      check: pick('chk-q1-def', 'A, B and C lie on one straight line and D is off the line. Is ABCD a quadrilateral?', [
        ['No: three of the points are on one line, so the figure is really a triangle.', null],
        ['Yes: any four points joined in order make a quadrilateral.', 'Not when three points are on one line: the two sides through the middle point lie along the same line, so the figure collapses into a triangle.', 'collinear_allowed'],
        ['Yes, but only if it is also convex.', 'Convexity is a separate question. First the four points must have no three on one line, and here three are.', 'convex_for_definition'],
      ], 'No three of the four points may be on one line.', undefined, 'q1-def'),
    },
    {
      id: 'q1-parts', title: 'Naming the parts',
      paragraphs: [
        'The corners are vertices, the segments AB, BC, CD, DA are sides, and the segments AC and BD that join opposite corners are diagonals. Two sides that meet at a corner are adjacent; sides that do not meet, like AB and CD, are opposite. The same words are used for angles: ∠A and ∠B are adjacent, ∠A and ∠C are opposite.',
        'You may name the quadrilateral by going round it in either direction, starting anywhere: ABCD, BCDA, CDAB, DABC, DCBA, ADCB, BADC or CBAD. A name such as ACBD describes a different figure, because A and C are not neighbours.',
      ],
      vocabulary: [{ term: 'diagonal', meaning: 'a segment joining two opposite vertices' }, { term: 'adjacent', meaning: 'next to each other, sharing a vertex' }, { term: 'opposite', meaning: 'not touching: AB and CD' }],
      misconception: { wrong: 'Any order of the four letters names the same quadrilateral.', right: 'The letters must follow the sides round the figure. ACBD would join A to C and B to D along sides, which are really the diagonals.' },
      check: pick('chk-q1-parts', 'In quadrilateral ABCD, which side is opposite to side BC?', [
        ['DA', null],
        ['AB', 'AB meets BC at the vertex B, so it is adjacent, not opposite.', 'adjacent_for_opposite'],
        ['AC', 'AC is a diagonal, not a side.', 'diagonal_is_side'],
      ], 'Opposite sides do not touch: BC and DA.', undefined, 'q1-parts'),
    },
    {
      id: 'q1-convex', title: 'Convex or not?', phase: 'conjecture',
      paragraphs: [
        'A quadrilateral is convex when it has no dent. Precisely: all four interior angles are less than 180°. In a non-convex quadrilateral (a "dart") one interior angle is bigger than 180°.',
        'There is a second way to test. Draw the two diagonals. In a convex quadrilateral they cross each other; in a non-convex one they do not.',
      ],
      vocabulary: [{ term: 'convex', meaning: 'every interior angle is less than 180°' }, { term: 'non-convex', meaning: 'one interior angle is more than 180°' }],
      visual: freeVisual(FIG.dart, 'A dart-shaped quadrilateral with vertices you can move.', { focus: 'shape', diagonals: true }),
      notice: 'Drag D until the dent disappears. At that moment the largest angle drops below 180° and the diagonals start to cross.',
      check: pick('chk-q1-convex', 'The two diagonals of a quadrilateral do NOT cross each other. What can you say?', [
        ['It is non-convex: one of its angles is more than 180°.', null],
        ['It is convex.', 'In a convex quadrilateral the diagonals cross. Diagonals that do not cross show a dent.', 'diagonal_test_reversed'],
        ['It is not a quadrilateral.', 'It can still be a quadrilateral: a dart is a quadrilateral, just not a convex one.', 'dart_not_quadrilateral'],
      ], 'Diagonals that do not cross mean a reflex angle, so the quadrilateral is non-convex.', undefined, 'q1-convex'),
    },
    {
      id: 'q1-sum', title: 'The four angles add up to 360°', phase: 'proof',
      paragraphs: [
        'Move the vertices and watch the four angles in the readout. They change, but their sum stays 360°. Watching is only evidence. A reason is better, and here it is short.',
      ],
      visual: freeVisual(FIG.general, 'A quadrilateral with its four angles and their sum.', { focus: 'shape', diagonals: true }),
      notice: 'Look at the sum of the four angles as you move each vertex.',
      proof: [
        { claim: 'Draw a diagonal that lies inside the quadrilateral, for example AC.', reason: 'A convex quadrilateral has both diagonals inside. A dart has one diagonal inside.', show: ['AC'] },
        { claim: 'The quadrilateral splits into two triangles, ABC and ACD.', reason: 'The diagonal joins two opposite vertices.', show: ['ABC', 'ACD'] },
        { claim: 'The angles of each triangle add to 180°.', reason: 'Angle sum of a triangle.', show: ['ABC', 'ACD'] },
        { claim: 'The angles of the quadrilateral are exactly the angles of the two triangles put together, so they add to 180° + 180° = 360°.', reason: 'The angles at A and C are split by the diagonal into one part in each triangle.', show: ['AC'] },
      ],
      check: pick('chk-q1-sum', 'Three angles of a quadrilateral are 100°, 80° and 90°. What is the fourth?', [
        ['90°', null],
        ['270°', '270° is the total of the three angles you were given. The fourth angle is what is missing from 360°.', 'sum_not_remainder'],
        ['80°', 'Check: 100 + 80 + 90 + 80 = 350, not 360. Subtract 270 from 360.', 'guess'],
      ], '360 − (100 + 80 + 90) = 90.', undefined, 'q1-sum'),
    },
  ],
  investigation: lab('Drag the vertices of a quadrilateral and watch the angles, sides and diagonals.'),
  worked: {
    id: 'w-quad-l1', title: 'The missing angle of a quadrilateral',
    given: ['Three angles of a quadrilateral are 70°, 110° and 60°.'], ask: 'Find the fourth angle, and decide whether the quadrilateral is convex.',
    steps: [
      { text: 'Add the three known angles: 70 + 110 + 60 = 240°.', why: 'We need how much of the 360° is used already.' },
      { text: 'The fourth angle is 360 − 240 = 120°.', why: 'The four interior angles of a quadrilateral add up to 360°.' },
      { text: 'All four angles (70°, 110°, 60°, 120°) are below 180°, so the quadrilateral is convex.', why: 'Convex means every interior angle is less than 180°.' },
    ],
    verify: 'Check: 70 + 110 + 60 + 120 = 360.',
  },
  guided: {
    id: 'g-quad-l1', prompt: 'Look at the dart ABCD. Its angle at D is the "dent".',
    visual: freeVisual(FIG.dart, 'A dart ABCD with a dent at D.', { focus: 'shape', diagonals: true, drag: false }),
    steps: [
      { id: 'g1', prompt: 'Is this quadrilateral convex?', question: pick('g-quad-l1-1', 'Is the dart convex?', [
        ['No: it has a dent at D.', null],
        ['Yes: all its sides are straight.', 'Straight sides are not enough. A convex quadrilateral also has no dent: all angles below 180°.', 'straight_means_convex'],
      ], 'It has an angle bigger than 180°, so it is non-convex.', undefined, 'q1-convex'), hints: ['Look at the angle at D from inside the figure.'] },
      { id: 'g2', prompt: 'Which vertex has the reflex angle?', question: pick('g-quad-l1-2', 'Which vertex of the dart has the angle bigger than 180°?', [
        ['D', null],
        ['A', 'The angle at A is small, much less than 180°.', 'wrong_vertex'],
        ['B', 'The angle at B is the sharp tip of the dart and is small.', 'wrong_vertex'],
      ], 'The dent is at D.', undefined, 'q1-convex'), hints: ['The reflex angle is at the dent.'] },
      { id: 'g3', prompt: 'The angle ADC measured the short way (outside the dart) is 90°. What is the interior angle at D?', question: num('g-quad-l1-3', 'The short-way angle at D is 90°. What is the interior angle of the quadrilateral at D?', 270, 'The interior angle is the long way round: 360 − 90 = 270°.', {
        unit: '°', refresherId: 'q1-convex', rules: [[[90], '90° is the angle outside the dart. The interior angle is on the other side, the long way round.', 'exterior_for_interior']],
      }), hints: ['A full turn is 360°.'] },
    ],
    conclusion: 'A reflex interior angle (270°) means the quadrilateral is non-convex.',
  },
  independent: [
    ind('i1', 'Quadrilateral or not', 'shape', 'Tap the figure with crossing sides.', galleryQ('quad-l1-i1', 'Tap the figure whose sides cross each other.', GAL_CROSS, 'Four figures P, Q, R, S.', 'b', {
      a: ['Figure P has four sides and none of them cross, so it is an ordinary convex quadrilateral.', 'not_crossing'],
      c: ['Figure R has a dent but its sides do not cross; it is a non-convex quadrilateral.', 'dent_is_crossing'],
      d: ['Figure S is a parallelogram: its sides do not cross.', 'not_crossing'],
    }, 'In figure Q the sides AB and CD cross, so it is self-intersecting.', 'q1-def'), ['Which figure looks like a bow-tie?'], ['Q: the sides AB and CD cross.']),
    ind('i2', 'Quadrilateral or not', 'shape', 'Tap the figure with three vertices on a line.', galleryQ('quad-l1-i2', 'Tap the figure that is not a quadrilateral because three of its vertices lie on one line.', GAL_LINE, 'Four figures P, Q, R, S.', 'a', {
      b: ['Figure Q is a kite: no three of its vertices are on one line.', 'not_collinear'],
      c: ['Figure R is a dart: it has a dent but no three vertices on one line.', 'dent_is_collinear'],
      d: ['Figure S has one pair of parallel sides, but no three vertices are collinear.', 'not_collinear'],
    }, 'In figure P the vertices A, B and C lie on one line.', 'q1-def'), ['Look for a side that continues straight into the next side.'], ['P: A, B and C are on a line.']),
    ind('i3', 'Parts', 'shape', 'Name a part.', pick('quad-l1-i3', 'In quadrilateral PQRS, which of these is a diagonal?', [
      ['PR', null],
      ['PQ', 'PQ joins neighbouring vertices, so it is a side.', 'side_for_diagonal'],
      ['RS', 'RS is a side of the quadrilateral.', 'side_for_diagonal'],
    ], 'A diagonal joins opposite vertices: P and R.', undefined, 'q1-parts'), ['Which vertex is opposite P?'], ['R is opposite P, so PR is a diagonal.']),
    ind('i4', 'Convexity', 'convex', 'Tap the non-convex quadrilateral.', galleryQ('quad-l1-i4', 'Tap the non-convex quadrilateral.', GAL_CONVEX, 'Four quadrilaterals P, Q, R, S.', 'b', {
      a: ['Figure P is a parallelogram; all its angles are below 180°.', 'dent_confusion'],
      c: ['Figure R is a kite; every angle is below 180°.', 'dent_confusion'],
      d: ['Figure S has all angles below 180°, so it is convex.', 'dent_confusion'],
    }, 'Figure Q has a dent: one interior angle is more than 180°.', 'q1-convex'), ['Which one has a dent?'], ['Q is a dart.']),
    ind('i5', 'Convexity', 'convex', 'Use the diagonal test.', pick('quad-l1-i5', 'In which case do the two diagonals of a quadrilateral cross each other?', [
      ['When all four angles are less than 180° (convex).', null],
      ['When one angle is more than 180° (non-convex).', 'Then the diagonals do not cross: one lies outside the dent.', 'diagonal_test_reversed'],
      ['Always, for every quadrilateral.', 'Not for a dart: its diagonals do not cross.', 'diagonals_always_cross'],
    ], 'The diagonals cross exactly in convex quadrilaterals.', undefined, 'q1-convex'), ['Think about the dart you moved.'], ['Convex ⇔ diagonals cross.']),
    ind('i6', 'Angle sum', 'sum', 'Find the missing angle.', num('quad-l1-i6', 'Three angles of a quadrilateral are 105°, 85° and 70°. Find the fourth angle.', 100, '360 − (105 + 85 + 70) = 360 − 260 = 100.', {
      unit: '°', refresherId: 'q1-sum', rules: [[[260], '260° is the sum of the three given angles. The fourth angle is 360° minus that.', 'sum_not_remainder'], [[80], '80° comes from 180 − 100. The angle sum of a quadrilateral is 360°, not 180°.', 'angle_sum_180']],
    }), ['Add the three angles first.'], ['360 − 260 = 100.']),
    ind('i7', 'Angle sum', 'sum', 'A reflex angle.', num('quad-l1-i7', 'Three angles of a quadrilateral are 40°, 50° and 60°. Find the fourth angle.', 210, '360 − (40 + 50 + 60) = 210. This angle is bigger than 180°, so the quadrilateral is non-convex.', {
      unit: '°', refresherId: 'q1-sum', rules: [[[150], '150° is the sum of the three given angles. The fourth angle is what is left of 360°.', 'sum_not_remainder'], [[30], '30° is 180 − 150, using the triangle angle sum. For a quadrilateral the total is 360°.', 'angle_sum_180']],
    }), ['Subtract from 360.'], ['The fourth angle is 210°, which is more than 180°.']),
  ],
  reflection: {
    discover: 'A quadrilateral is four points, no three on a line, joined by sides that do not cross. It is convex when all angles are below 180° (the diagonals cross), and its four angles always add up to 360°.',
    evidence: 'You moved the vertices to see when a figure stops being a quadrilateral and when it stops being convex, and you used 360° to find a missing angle.',
    stillConfusing: [{ text: 'What exactly counts as a quadrilateral?', refresherId: 'q1-def' }, { text: 'Which sides and angles are opposite?', refresherId: 'q1-parts' }, { text: 'How do I tell convex from non-convex?', refresherId: 'q1-convex' }, { text: 'Why do the angles add to 360°?', refresherId: 'q1-sum' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: Properties of a parallelogram  (textbook 12.2, Theorem 1)
// ---------------------------------------------------------------------------

export const L2: EduLesson = {
  id: 'quad-l2', unitId: 'qunit-2', number: 2, title: 'Properties of a parallelogram',
  objective: 'state the three properties of a parallelogram, use them to find sides, angles and diagonal parts, and explain why they hold.',
  prerequisiteIds: ['qp-parallel-lines', 'qp-congruence'],
  objectives: [
    { id: 'sides-angles', label: 'Use equal opposite sides and angles' },
    { id: 'diagonals', label: 'Use the diagonals of a parallelogram' },
    { id: 'reason', label: 'Say why the properties hold' },
  ],
  steps: [
    {
      id: 'q2-def', title: 'What is a parallelogram?',
      paragraphs: [
        'A parallelogram is a quadrilateral whose opposite sides are parallel. Rectangles, rhombuses and squares are all parallelograms, because their opposite sides are parallel too.',
        'In the figure below you move A, B and C. The fourth vertex D follows so that the figure stays a parallelogram.',
      ],
      vocabulary: [{ term: 'parallelogram', meaning: 'a quadrilateral whose opposite sides are parallel' }],
      visual: quadVisual({ mode: 'parallelogram', pts: FIG.parallelogram, diagonals: false }, 'Parallelogram ABCD. Move A, B or C and D follows.'),
      notice: 'Whatever you do, AB stays parallel to DC and BC stays parallel to AD.',
      check: pick('chk-q2-def', 'Is every rectangle a parallelogram?', [
        ['Yes: its opposite sides are parallel.', null],
        ['No: a parallelogram cannot have right angles.', 'Right angles do not stop opposite sides being parallel. A rectangle has two pairs of parallel sides, so it is a parallelogram.', 'special_not_included'],
        ['Only if it is also a square.', 'Every rectangle has opposite sides parallel, square or not.', 'special_not_included'],
      ], 'The definition only asks for opposite sides to be parallel.', undefined, 'q2-def'),
    },
    {
      id: 'q2-observe', title: 'Look for patterns', phase: 'observe',
      paragraphs: [
        'Drag the vertices and read the numbers. Compare the opposite sides, the opposite angles, and where the diagonals cross.',
        'Three patterns appear every time: opposite sides are equal, opposite angles are equal, and the diagonals cut each other in half. These are conjectures from a few drawings. The next steps give the reasons.',
      ],
      visual: quadVisual({ mode: 'parallelogram', pts: FIG.parallelogram, diagonals: true }, 'Parallelogram ABCD with its diagonals. Move A, B or C.'),
      notice: 'Compare AB with DC, ∠A with ∠C, and the two halves of each diagonal.',
      check: pick('chk-q2-obs', 'In parallelogram ABCD, ∠A = 65°. What is ∠C?', [
        ['65°', null],
        ['115°', '115° is ∠B (180° − 65°). ∠C is opposite ∠A, and opposite angles are equal.', 'opposite_vs_adjacent'],
        ['25°', 'Nothing in a parallelogram makes an angle 90° less than its opposite. Opposite angles are equal.', 'guess'],
      ], 'Opposite angles of a parallelogram are equal.', undefined, 'q2-observe'),
    },
    {
      id: 'q2-why', title: 'Why: sides and angles', phase: 'proof',
      paragraphs: [
        'We cut the parallelogram along the diagonal AC and compare the two triangles. A drawing that agrees with the numbers is not a proof; each line below needs a reason.',
      ],
      visual: quadVisual({ mode: 'parallelogram', pts: FIG.parallelogram, triangles: true }, 'Parallelogram ABCD cut by diagonal AC into triangles ABC and CDA.'),
      proof: [
        { claim: '∠BAC = ∠DCA', reason: 'AB ∥ DC and AC is a transversal: alternate angles are equal.', show: ['ABC', 'CDA', 'AC'] },
        { claim: '∠BCA = ∠DAC', reason: 'BC ∥ AD and AC is a transversal: alternate angles are equal.', show: ['ABC', 'CDA', 'AC'] },
        { claim: 'AC = CA', reason: 'The diagonal AC is a side of both triangles.', show: ['AC'] },
        { claim: 'Triangle ABC ≅ triangle CDA', reason: 'ASA: two angles and the side between them.', show: ['ABC', 'CDA'] },
        { claim: 'AB = CD and BC = DA', reason: 'Corresponding sides of congruent triangles.', show: ['AB', 'CD', 'BC', 'DA'] },
        { claim: '∠B = ∠D, and ∠A = ∠C', reason: 'Corresponding angles of the congruent triangles; and ∠A = ∠BAC + ∠CAD is matched with ∠C = ∠DCA + ∠ACB.', show: ['B', 'D'] },
      ],
    },
    {
      id: 'q2-diag', title: 'Why: the diagonals bisect each other', phase: 'proof',
      paragraphs: ['The diagonals AC and BD cross at O. We compare triangles AOB and COD.'],
      visual: quadVisual({ mode: 'parallelogram', pts: FIG.parallelogram, diagonals: true }, 'Parallelogram ABCD with diagonals AC and BD crossing at O.'),
      proof: [
        { claim: 'AB = CD', reason: 'Opposite sides of a parallelogram (shown above).', show: ['AB', 'CD'] },
        { claim: '∠OAB = ∠OCD and ∠OBA = ∠ODC', reason: 'AB ∥ DC: alternate angles along the transversals AC and BD.', show: ['AOB', 'COD'] },
        { claim: 'Triangle AOB ≅ triangle COD', reason: 'ASA.', show: ['AOB', 'COD'] },
        { claim: 'OA = OC and OB = OD', reason: 'Corresponding sides of congruent triangles. So O is the midpoint of both diagonals.', show: ['AO', 'OC', 'BO', 'OD'] },
      ],
    },
  ],
  investigation: lab('Build a parallelogram on the board and compare opposite sides, angles and diagonals.'),
  worked: {
    id: 'w-quad-l2', title: 'Sides and angles of a parallelogram',
    given: ['ABCD is a parallelogram with AB = 7 cm, BC = 4 cm and ∠A = 65°.'], ask: 'Find CD, DA, ∠B, ∠C, ∠D and the perimeter.',
    steps: [
      { text: 'CD = AB = 7 cm and DA = BC = 4 cm.', why: 'Opposite sides of a parallelogram are equal.' },
      { text: '∠C = ∠A = 65°.', why: 'Opposite angles of a parallelogram are equal.' },
      { text: '∠B = 180° − 65° = 115°, and ∠D = ∠B = 115°.', why: 'AD ∥ BC, so the co-interior angles ∠A and ∠B add up to 180°; ∠D is opposite ∠B.' },
      { text: 'Perimeter = 7 + 4 + 7 + 4 = 22 cm.', why: 'Add the four sides.' },
    ],
    verify: 'The four angles 65° + 115° + 65° + 115° add up to 360°.',
  },
  guided: {
    id: 'g-quad-l2', prompt: 'In parallelogram ABCD the diagonals AC and BD meet at O. AC = 16 cm and BD = 10 cm.',
    steps: [
      { id: 'g1', prompt: 'Which property tells you OA = OC?', question: pick('g-quad-l2-1', 'Which property of a parallelogram tells you that OA = OC?', [
        ['The diagonals bisect each other.', null],
        ['Opposite sides are equal.', 'That property gives AB = CD, not OA = OC. OA and OC are parts of a diagonal.', 'wrong_property'],
        ['The diagonals are equal.', 'The diagonals of a parallelogram are not equal in general (here 16 and 10).', 'equal_diagonals'],
      ], 'O is the midpoint of AC.', undefined, 'q2-diag'), hints: ['Diagonals meet at O.'] },
      { id: 'g2', prompt: 'Find OA.', question: num('g-quad-l2-2', 'Find OA, in cm.', 8, 'OA is half of AC: 16 ÷ 2 = 8.', { unit: 'cm', refresherId: 'q2-diag', rules: [[[16], '16 is the whole diagonal AC. OA is only half of it.', 'whole_for_half']] }), hints: ['O is the midpoint of AC.'] },
      { id: 'g3', prompt: 'Find OB.', question: num('g-quad-l2-3', 'Find OB, in cm.', 5, 'OB is half of BD: 10 ÷ 2 = 5.', { unit: 'cm', refresherId: 'q2-diag', rules: [[[8], '8 is OA. OB is half of the other diagonal, BD.', 'wrong_diagonal'], [[10], '10 is the whole of BD. OB is only half of it.', 'whole_for_half']] }), hints: ['Use BD, not AC.'] },
    ],
    conclusion: 'OA = OC = 8 cm and OB = OD = 5 cm.',
  },
  independent: [
    ind('i1', 'Sides', 'sides-angles', 'Perimeter.', num('quad-l2-i1', 'ABCD is a parallelogram with AB = 6.5 cm and BC = 3.5 cm. Find its perimeter in cm.', 20, 'CD = 6.5 and DA = 3.5, so the perimeter is 2 × (6.5 + 3.5) = 20.', { unit: 'cm', refresherId: 'q2-observe', rules: [[[10], '10 is only AB + BC. A parallelogram has four sides, and the other two equal these.', 'half_perimeter']] }), ['The other two sides equal these two.'], ['2 × (6.5 + 3.5) = 20.']),
    ind('i2', 'Sides', 'sides-angles', 'Use an equation.', num('quad-l2-i2', 'In parallelogram PQRS, PQ = 3x + 2 and SR = 17. Find x.', 5, 'Opposite sides are equal: 3x + 2 = 17, so x = 5.', { refresherId: 'q2-why', rules: [[[15], '15 is the value of 3x. Remember the "+ 2": 3x + 2 = 17 gives 3x = 15 and then x = 5.', 'forgot_constant'], [[17], '17 is the length SR. The question asks for the number x.', 'length_for_x']] }), ['Which sides are opposite?'], ['PQ = SR, so 3x + 2 = 17.']),
    ind('i3', 'Angles', 'sides-angles', 'Adjacent angle.', num('quad-l2-i3', 'In parallelogram ABCD, ∠A = 72°. Find ∠B.', 108, 'Adjacent angles of a parallelogram add up to 180°: 180 − 72 = 108.', { unit: '°', refresherId: 'q2-observe', rules: [[[72], '72° is ∠C, the opposite angle. ∠B is next to ∠A, so the two add to 180°.', 'opposite_vs_adjacent'], [[288], '288° is 360 − 72. Two adjacent angles add to 180°, not 360°.', 'sum_360_pair']] }), ['Is ∠B opposite to ∠A, or next to it?'], ['180 − 72 = 108.']),
    ind('i4', 'Angles', 'sides-angles', 'Angle relation.', num('quad-l2-i4', 'In parallelogram ABCD, ∠A is twice ∠B. Find ∠A.', 120, '∠A + ∠B = 180 and ∠A = 2∠B, so 3∠B = 180, ∠B = 60 and ∠A = 120.', { unit: '°', refresherId: 'q2-observe', rules: [[[60], '60° is ∠B. The question asks for ∠A, which is twice as big.', 'asked_other'], [[90], 'A parallelogram with ∠A = 90° would have ∠B = 90°, but ∠A is twice ∠B.', 'guess']] }), ['A and B are adjacent angles, so they add to 180°.'], ['∠B = 60°, ∠A = 120°.']),
    ind('i5', 'Diagonals', 'diagonals', 'Half a diagonal.', num('quad-l2-i5', 'The diagonals of parallelogram ABCD meet at O. OA = 5.5 cm and OB = 4 cm. Find the length of diagonal BD.', 8, 'O is the midpoint of BD, so BD = 2 × OB = 8.', { unit: 'cm', refresherId: 'q2-diag', rules: [[[11], '11 is AC (twice OA). The question asks about BD.', 'wrong_diagonal'], [[4], '4 is only OB, half of BD.', 'half_for_whole']] }), ['BD is made of OB and OD.'], ['OD = OB = 4, so BD = 8.']),
    ind('i6', 'Diagonals', 'diagonals', 'A true property.', pick('quad-l2-i6', 'Which statement is true for EVERY parallelogram?', [
      ['The diagonals cut each other in half.', null],
      ['The diagonals are equal.', 'That is true for a rectangle, but a general parallelogram has unequal diagonals (as in the figure you dragged).', 'equal_diagonals'],
      ['The diagonals are perpendicular.', 'That is true for a rhombus, not for every parallelogram.', 'perpendicular_diagonals'],
    ], 'Bisecting each other is true for every parallelogram.', undefined, 'q2-diag'), ['Test the three with a very slanted parallelogram.'], ['Only "bisect each other" holds for all.']),
    ind('i7', 'Reasons', 'reason', 'Is a measurement a proof?', pick('quad-l2-i7', 'A student draws one parallelogram, measures AB = CD = 4.2 cm and says "so Theorem 1 is proved". What is wrong?', [
      ['One measured drawing shows one case; a proof must give a reason that covers every parallelogram.', null],
      ['The student should have measured with a more accurate ruler.', 'Even perfect measurements of one drawing cannot cover every parallelogram. A reason (congruent triangles) can.', 'measurement_as_proof'],
      ['Nothing is wrong: measurement is the best proof.', 'Measuring checks a case. A proof uses reasons that hold for all parallelograms.', 'measurement_as_proof'],
    ], 'The proof used congruent triangles, so it holds for every parallelogram.', undefined, 'q2-why'), ['Does the measurement cover other parallelograms?'], ['It checks one case only.']),
  ],
  reflection: {
    discover: 'In a parallelogram, opposite sides are equal, opposite angles are equal, adjacent angles add to 180°, and the diagonals bisect each other. Cutting along a diagonal and using congruent triangles explains why.',
    evidence: 'You dragged a parallelogram to see the patterns, then followed the triangle argument that shows they always hold.',
    stillConfusing: [{ text: 'What is a parallelogram?', refresherId: 'q2-def' }, { text: 'Which properties are always true?', refresherId: 'q2-observe' }, { text: 'Why are opposite sides equal?', refresherId: 'q2-why' }, { text: 'Why do the diagonals bisect each other?', refresherId: 'q2-diag' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: When is a quadrilateral a parallelogram?  (textbook 12.2, Theorems 2 to 5)
// ---------------------------------------------------------------------------

const THM2 = [
  { id: 't1', text: 'AC = CA, because AC is a side of both triangles ABC and CDA.', needs: [] },
  { id: 't2', text: 'Triangle ABC ≅ triangle CDA by SSS (AB = CD, BC = DA, AC = CA).', needs: ['t1'] },
  { id: 't3', text: '∠BAC = ∠DCA and ∠BCA = ∠DAC, corresponding angles of congruent triangles.', needs: ['t2'] },
  { id: 't4', text: 'AB ∥ DC and BC ∥ AD, because equal alternate angles along the transversal AC mean parallel lines.', needs: ['t3'] },
  { id: 't5', text: 'So both pairs of opposite sides are parallel: ABCD is a parallelogram.', needs: ['t4'] },
];

const GAL_NOT_ENOUGH_SIDES = [fig('a', 'P', FIG.parallelogram), fig('b', 'Q', FIG.rectangle), fig('c', 'R', FIG.isoscelesTrapezium)];
const GAL_NOT_ENOUGH_PERP = [fig('a', 'P', FIG.rhombus), fig('b', 'Q', FIG.kite), fig('c', 'R', FIG.rectangle)];

export const L3: EduLesson = {
  id: 'quad-l3', unitId: 'qunit-2', number: 3, title: 'When is a quadrilateral a parallelogram?',
  objective: 'turn the properties of a parallelogram around into tests, say which conditions are enough to prove a parallelogram and which are not, and follow the proofs.',
  prerequisiteIds: ['qp-congruence', 'qp-if-then'],
  objectives: [
    { id: 'tests', label: 'Use the four tests for a parallelogram' },
    { id: 'not-enough', label: 'Recognise conditions that are NOT enough' },
    { id: 'argue', label: 'Follow and judge the arguments' },
  ],
  steps: [
    {
      id: 'q3-conv', title: 'Turn the facts around',
      paragraphs: [
        'Lesson 2 showed: if a quadrilateral is a parallelogram, then its opposite sides are equal; its opposite angles are equal; its diagonals bisect each other. Swapping the two parts of each statement gives its converse, for example: "If the opposite sides of a quadrilateral are equal, then it is a parallelogram."',
        'A converse is a new claim. It might be false. The question is whether each converse could serve as a test for a parallelogram.',
      ],
      misconception: { wrong: 'If a statement is true, its converse must be true.', right: 'The converse has to be checked separately. In this chapter the converses of the three parallelogram properties turn out to be true; we shall see that other tempting converses are not.' },
      check: pick('chk-q3-conv', 'What is the converse of "If a quadrilateral is a parallelogram, then its diagonals bisect each other"?', [
        ['If the diagonals of a quadrilateral bisect each other, then it is a parallelogram.', null],
        ['If a quadrilateral is not a parallelogram, then its diagonals do not bisect each other.', 'That negates both parts (the inverse). The converse swaps the parts without negating.', 'inverse_for_converse'],
        ['If the diagonals of a parallelogram bisect each other, then it is a quadrilateral.', 'That keeps the word "parallelogram" in the condition. In the converse, the conclusion "it is a parallelogram" becomes the thing you prove.', 'wrong_swap'],
      ], 'Swap the two parts.', undefined, 'q3-conv'),
    },
    {
      id: 'q3-try', title: 'Try to break a test', phase: 'conjecture',
      paragraphs: [
        'Drag the vertices to make both pairs of opposite sides equal. Does a quadrilateral that is NOT a parallelogram ever appear? Then try the other tests: opposite angles equal, diagonals bisecting each other.',
        'Every figure you build this way will turn out to be a parallelogram. That is a strong hint, but trying cases never covers all of them. The next step gives a proof.',
      ],
      visual: freeVisual(FIG.general, 'A quadrilateral with readouts for the four tests.', { focus: 'tests', diagonals: true }),
      notice: 'Try to satisfy one test at a time and read the last line: what kind of figure is it?',
      check: pick('chk-q3-try', 'You build ten quadrilaterals with both pairs of opposite sides equal and every one is a parallelogram. What have you shown?', [
        ['The idea is very likely true, but ten cases are not a proof.', null],
        ['The converse is proved, because ten cases is a lot.', 'No number of cases proves a statement for all quadrilaterals. A proof gives a reason that covers every case.', 'testing_as_proof'],
        ['Nothing: the cases are useless.', 'Cases are useful: they suggest what to try to prove. They just do not prove it.', 'cases_useless'],
      ], 'Examples suggest; only a proof settles it.', undefined, 'q3-try'),
    },
    {
      id: 'q3-proof2', title: 'Why: opposite sides equal', phase: 'proof',
      paragraphs: ['The proof retraces the proof for a parallelogram backwards. It uses the same diagonal AC and the same two triangles, but a different test for congruence (SSS) and a different conclusion.'],
      visual: quadVisual({ mode: 'free', pts: FIG.parallelogram, focus: 'tests', drag: false, triangles: true }, 'Quadrilateral ABCD with both pairs of opposite sides equal, cut by diagonal AC.'),
      proof: [
        { claim: 'AB = CD, BC = DA (given) and AC = CA', reason: 'The first two are the given; the third is the common side.', show: ['AC'] },
        { claim: 'Triangle ABC ≅ triangle CDA', reason: 'SSS.', show: ['ABC', 'CDA'] },
        { claim: '∠BAC = ∠DCA and ∠BCA = ∠DAC', reason: 'Corresponding angles of congruent triangles.', show: ['ABC', 'CDA'] },
        { claim: 'AB ∥ DC and BC ∥ AD', reason: 'Equal alternate angles along the transversal AC.', show: ['AB', 'CD', 'BC', 'DA'] },
        { claim: 'ABCD is a parallelogram', reason: 'Both pairs of opposite sides are parallel (definition).', show: ['AB', 'CD', 'BC', 'DA'] },
      ],
    },
    {
      id: 'q3-others', title: 'The other tests', phase: 'proof',
      paragraphs: [
        'Opposite angles equal: if ∠A = ∠C and ∠B = ∠D then 2(∠A + ∠B) = 360°, so ∠A + ∠B = 180° and ∠B + ∠C = 180°. Co-interior angles adding to 180° make the lines parallel, so AD ∥ BC and AB ∥ DC.',
        'Diagonals bisect each other: with O the common midpoint, triangles AOD and COB are congruent by SAS (the angles at O are vertically opposite), which gives AD ∥ BC; the same with AOB and COD gives AB ∥ DC.',
        'Equal and parallel opposite sides: if one pair of opposite sides is both equal and parallel, then ABCD is a parallelogram. The key is that the SAME pair must be both equal and parallel.',
      ],
      misconception: { wrong: 'One pair of opposite sides equal and the OTHER pair parallel makes a parallelogram.', right: 'The equal pair and the parallel pair must be the same pair. In an isosceles trapezium one pair is parallel and the other pair is equal, yet it is not a parallelogram.' },
    },
    {
      id: 'q3-notenough', title: 'Tests that are not enough', phase: 'reasoning',
      paragraphs: [
        'Some conditions look promising but fail, and a single figure that satisfies the condition without being a parallelogram settles it (a counterexample). Here are three.',
        'Figure P is an isosceles trapezium: its diagonals are equal, and it has a pair of equal opposite sides (the slanting ones), but it is not a parallelogram. Figure Q is a kite: its diagonals are perpendicular and one pair of opposite angles is equal, but it is not a parallelogram. Figure R has exactly one pair of parallel sides.',
      ],
      visual: { kind: 'quadGallery', props: { figures: [fig('a', 'P', FIG.isoscelesTrapezium), fig('b', 'Q', FIG.kite), fig('c', 'R', FIG.trapezium)] } as unknown as Record<string, unknown>, alt: 'Three quadrilaterals that are not parallelograms: P is an isosceles trapezium with equal diagonals; Q is a kite with perpendicular diagonals; R has exactly one pair of parallel sides.' },
      check: pick('chk-q3-notenough', 'A quadrilateral has equal diagonals. Must it be a parallelogram?', [
        ['No: an isosceles trapezium has equal diagonals and is not a parallelogram.', null],
        ['Yes: equal diagonals make it a parallelogram.', 'The isosceles trapezium in figure P has equal diagonals but is not a parallelogram. Equal diagonals are not enough.', 'equal_diagonals'],
        ['Yes, if it is also convex.', 'The isosceles trapezium is convex and has equal diagonals, and it is still not a parallelogram.', 'equal_diagonals'],
      ], 'One counterexample is enough to show a condition does not guarantee a parallelogram.', undefined, 'q3-notenough'),
    },
  ],
  investigation: lab('In the laboratory, build a quadrilateral that satisfies one test and see what it is.'),
  worked: {
    id: 'w-quad-l3', title: 'Is it a parallelogram?',
    given: ['In quadrilateral PQRS, PQ = SR = 5 cm and PQ ∥ SR.', 'In quadrilateral WXYZ, the diagonals are equal (both 8 cm).'], ask: 'Decide for each whether it must be a parallelogram.',
    steps: [
      { text: 'PQRS: the SAME pair of sides, PQ and SR, is equal and parallel.', why: 'This is exactly the hypothesis of the equal-and-parallel test.' },
      { text: 'So PQRS is a parallelogram.', why: 'A quadrilateral with one pair of opposite sides equal and parallel is a parallelogram.' },
      { text: 'WXYZ: equal diagonals alone are not a test for a parallelogram.', why: 'An isosceles trapezium has equal diagonals and is not a parallelogram, so the condition does not guarantee it.' },
      { text: 'We cannot conclude that WXYZ is a parallelogram.', why: 'To conclude it we would need a test that is known to work, such as diagonals that bisect each other.' },
    ],
    verify: 'The first case uses a proven test; the second is blocked by a counterexample.',
  },
  guided: {
    id: 'g-quad-l3', prompt: 'In quadrilateral PQRS, ∠P = ∠R = 110° and ∠Q = ∠S.',
    steps: [
      { id: 'g1', prompt: 'Find ∠Q.', question: num('g-quad-l3-1', 'Find ∠Q, in degrees.', 70, '110 + 110 + ∠Q + ∠S = 360 and ∠Q = ∠S, so 2∠Q = 140 and ∠Q = 70.', { unit: '°', refresherId: 'q1-sum', rules: [[[140], '140° is ∠Q + ∠S together. They are equal, so each is half of that.', 'pair_for_one']] }), hints: ['Four angles add to 360°.'] },
      { id: 'g2', prompt: 'What are the opposite angles?', question: pick('g-quad-l3-2', 'Are both pairs of opposite angles equal?', [
        ['Yes: ∠P = ∠R = 110° and ∠Q = ∠S = 70°.', null],
        ['No: only one pair is equal.', 'You are told ∠P = ∠R and ∠Q = ∠S; those are both pairs of opposite angles.', 'miscount_pairs'],
      ], 'Both pairs of opposite angles are equal.', undefined, 'q3-others'), hints: ['P and R are opposite; so are Q and S.'] },
      { id: 'g3', prompt: 'Draw the conclusion.', question: pick('g-quad-l3-3', 'What can you conclude about PQRS?', [
        ['It is a parallelogram, because both pairs of opposite angles are equal.', null],
        ['It is a rectangle.', 'A rectangle needs right angles. Here the angles are 110° and 70°.', 'rectangle_assumed'],
        ['Nothing: angles are not enough.', 'Both pairs of opposite angles equal is one of the tests for a parallelogram.', 'test_unknown'],
      ], 'Opposite angles equal in both pairs: parallelogram.', undefined, 'q3-others'), hints: ['Which of the four tests is this?'] },
    ],
    conclusion: 'PQRS is a parallelogram, by the opposite-angles test.',
  },
  independent: [
    ind('i1', 'Tests', 'tests', 'Which fact is enough?', pick('quad-l3-i1', 'Which ONE fact is enough to prove that quadrilateral ABCD is a parallelogram?', [
      ['The diagonals AC and BD bisect each other.', null],
      ['The diagonals AC and BD are equal.', 'An isosceles trapezium has equal diagonals and is not a parallelogram.', 'equal_diagonals'],
      ['The diagonals AC and BD are perpendicular.', 'A kite has perpendicular diagonals and is not a parallelogram.', 'perpendicular_diagonals'],
      ['One pair of opposite sides is equal.', 'The slanting sides of an isosceles trapezium are equal and it is not a parallelogram.', 'one_pair_enough'],
    ], 'Diagonals that bisect each other is one of the four tests.', undefined, 'q3-others'), ['Which one has a counterexample?'], ['Only "bisect each other" is a test.']),
    ind('i2', 'Tests', 'tests', 'Equal and parallel.', pick('quad-l3-i2', 'In quadrilateral ABCD, AB = DC and AB ∥ DC. What follows?', [
      ['ABCD is a parallelogram.', null],
      ['ABCD is only a trapezium.', 'One pair of opposite sides that is both equal and parallel already makes a parallelogram.', 'test_unknown'],
      ['Nothing, until we also know BC = AD.', 'That extra fact is not needed: one pair equal and parallel is enough.', 'extra_condition'],
    ], 'One pair of opposite sides, equal and parallel, is a test.', undefined, 'q3-others'), ['Is it the same pair that is equal and parallel?'], ['Yes: AB and DC.']),
    ind('i3', 'Converse', 'tests', 'Write the converse.', pick('quad-l3-i3', 'What is the converse of "If a quadrilateral is a parallelogram, then its opposite angles are equal"?', [
      ['If the opposite angles of a quadrilateral are equal, then it is a parallelogram.', null],
      ['If the opposite angles of a quadrilateral are not equal, then it is not a parallelogram.', 'That is the inverse, which negates both parts.', 'inverse_for_converse'],
      ['If a quadrilateral has equal opposite angles, then it has equal opposite sides.', 'That changes the conclusion to something new. The converse puts "it is a parallelogram" back as the conclusion.', 'wrong_swap'],
    ], 'Swap the two parts.', undefined, 'q3-conv'), ['Which part becomes the condition?'], ['The conclusion becomes the condition.']),
    ind('i4', 'Not enough', 'not-enough', 'Find the counterexample.', galleryQ('quad-l3-i4', 'Tap the figure that shows "one pair of equal opposite sides" is not enough to be a parallelogram.', GAL_NOT_ENOUGH_SIDES, 'Three quadrilaterals P, Q, R.', 'c', {
      a: ['Figure P is a parallelogram, so it cannot show that the condition fails.', 'example_not_counter'],
      b: ['Figure Q is a rectangle, which is a parallelogram. A counterexample has to satisfy the condition but NOT be a parallelogram.', 'example_not_counter'],
    }, 'Figure R has one pair of equal sides (the slanting ones) but is not a parallelogram.', 'q3-notenough'), ['A counterexample must not be a parallelogram.'], ['R is an isosceles trapezium.']),
    ind('i5', 'Not enough', 'not-enough', 'Perpendicular diagonals.', galleryQ('quad-l3-i5', 'Tap the figure that has perpendicular diagonals but is NOT a parallelogram.', GAL_NOT_ENOUGH_PERP, 'Three quadrilaterals P, Q, R.', 'b', {
      a: ['Figure P is a rhombus. Its diagonals are perpendicular, but a rhombus is a parallelogram.', 'example_not_counter'],
      c: ['Figure R is a rectangle: a parallelogram, and its diagonals are not perpendicular.', 'example_not_counter'],
    }, 'Figure Q is a kite: its diagonals are perpendicular but it is not a parallelogram.', 'q3-notenough'), ['Which one is not a parallelogram?'], ['Q is the kite.']),
    ind('i6', 'Proof', 'argue', 'Arrange the proof.', ord('quad-l3-i6', 'Arrange the steps of the proof that a quadrilateral with both pairs of opposite sides equal is a parallelogram.', THM2, ['t4', 't2', 't5', 't1', 't3'], 'The common side and SSS come first; then equal angles, parallel lines and the conclusion.'), ['Which step needs nothing before it?'], ['Common side, SSS, corresponding angles, parallel lines, parallelogram.']),
    ind('i7', 'Proof', 'argue', 'Examples are not a proof.', pick('quad-l3-i7', 'A student drags a quadrilateral until its opposite angles are equal, six times, and each time it is a parallelogram. "So Theorem 3 is proved." Is it?', [
      ['No: six cases do not cover all quadrilaterals; the angle-sum argument does.', null],
      ['Yes: six is enough.', 'No number of cases is enough. The proof uses the angle sum of 360° and parallel lines, which holds for every such quadrilateral.', 'testing_as_proof'],
      ['No: the student should have used seven cases.', 'It is not about the count. A proof is a chain of reasons, not a longer list of cases.', 'testing_as_proof'],
    ], 'The angle-sum argument works for all of them at once.', undefined, 'q3-try'), ['Does the number of cases ever reach "all"?'], ['A proof gives a reason for every case.']),
  ],
  reflection: {
    discover: 'Four tests prove a parallelogram: opposite sides equal, opposite angles equal, diagonals bisecting each other, or one pair of sides both equal and parallel. Equal diagonals, perpendicular diagonals, or just one pair of equal sides are not enough.',
    evidence: 'You tried to break each test by dragging, followed a proof, and used counterexamples to show that some conditions fail.',
    stillConfusing: [{ text: 'What is a converse?', refresherId: 'q3-conv' }, { text: 'Why is trying cases not enough?', refresherId: 'q3-try' }, { text: 'How is the SSS proof arranged?', refresherId: 'q3-proof2' }, { text: 'Which conditions fail?', refresherId: 'q3-notenough' }],
  },
};
