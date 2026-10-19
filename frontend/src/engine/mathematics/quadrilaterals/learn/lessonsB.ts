/**
 * Quadrilaterals Learn lessons 4 to 8 (EDU-1Q): the Midpoint Theorem and its
 * converse, medians and the centroid, the Varignon parallelogram, and tiling.
 * Wording, figures and questions are original.
 */

import type { EduLesson } from '../../../education/types';
import { FIG } from './figure';
import { LAB } from './lessonsA';
import { freeVisual, ind, num, ord, pick, quadVisual, triVisual } from './questions';

const lab = (description: string) => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

// ---------------------------------------------------------------------------
// Lesson 4: The Midpoint Theorem  (textbook 12.3.1, Theorem 6)
// ---------------------------------------------------------------------------

const MIDPOINT_PROOF = [
  { id: 'p1', text: 'Extend PQ beyond Q to a point R with QR = PQ.', needs: [] },
  { id: 'p2', text: 'APCR is a parallelogram, because its diagonals AC and PR bisect each other at Q.', needs: ['p1'] },
  { id: 'p3', text: 'So CR ∥ AP and CR = AP; and since AP = PB, CR is equal and parallel to PB.', needs: ['p2'] },
  { id: 'p4', text: 'BCRP is a parallelogram, by the test "one pair of opposite sides equal and parallel".', needs: ['p3'] },
  { id: 'p5', text: 'So PR ∥ BC and PR = BC, and PQ = ½ PR = ½ BC, since Q is the midpoint of PR.', needs: ['p4', 'p1'] },
];

export const L4: EduLesson = {
  id: 'quad-l4', unitId: 'qunit-3', number: 4, title: 'The Midpoint Theorem',
  objective: 'state the Midpoint Theorem exactly, use it to find lengths and parallel lines, and follow its proof built from parallelograms.',
  prerequisiteIds: ['qp-midpoint', 'qp-parallel-lines'],
  objectives: [
    { id: 'use', label: 'Use the theorem to find lengths and angles' },
    { id: 'reason', label: 'State it exactly and follow why it works' },
  ],
  steps: [
    {
      id: 'q4-obs', title: 'Join two midpoints', phase: 'observe',
      paragraphs: [
        'In triangle ABC let P be the midpoint of AB and Q the midpoint of AC. Join P and Q. Move the corners of the triangle and compare PQ with BC.',
      ],
      visual: triVisual('midpoint', FIG.tri, 'Triangle ABC with P the midpoint of AB and Q the midpoint of AC.'),
      notice: 'Look at the ratio PQ ÷ BC and at the angle between the two lines.',
      check: pick('chk-q4-obs', 'P and Q are the midpoints of AB and AC, and BC = 10 cm. What is PQ?', [
        ['5 cm', null],
        ['10 cm', 'PQ is shorter than BC. The readout shows PQ ÷ BC staying at 0.5.', 'same_length'],
        ['20 cm', 'PQ is not longer than BC. It is half of it.', 'doubled_not_halved'],
      ], 'PQ = ½ × 10 = 5.', undefined, 'q4-obs'),
    },
    {
      id: 'q4-statement', title: 'What the theorem says', phase: 'conjecture',
      paragraphs: [
        'However you move the triangle, PQ stays parallel to BC and exactly half as long. This is the Midpoint Theorem: the segment joining the midpoints of two sides of a triangle is parallel to the third side and has half its length.',
        'Notice what it needs: BOTH P and Q must be midpoints. A segment from the midpoint of AB to some other point of AC does not have to be half of BC.',
      ],
      misconception: { wrong: 'Any segment from the midpoint of one side to a point on another side is half the third side.', right: 'The theorem needs both endpoints to be midpoints.' },
    },
    {
      id: 'q4-proof', title: 'Why it works', phase: 'proof',
      paragraphs: ['Parallelograms do the work. Watch which figure each line talks about.'],
      visual: triVisual('midpoint', FIG.tri, 'Triangle ABC with midpoints P and Q, the point R on line PQ with QR = PQ, and the figure BCRP.', { proof: true }),
      proof: [
        { claim: 'Extend PQ to R so that QR = PQ.', reason: 'Construction.', show: ['P', 'Q', 'R'] },
        { claim: 'APCR is a parallelogram.', reason: 'Its diagonals AC and PR bisect each other at Q (Q is the midpoint of both).', show: ['A', 'P', 'C', 'R'] },
        { claim: 'CR ∥ AP and CR = AP, so CR = PB.', reason: 'Opposite sides of a parallelogram, and P is the midpoint of AB.', show: ['CR', 'AP', 'PB'] },
        { claim: 'BCRP is a parallelogram.', reason: 'Test: one pair of opposite sides (PB and CR) is equal and parallel.', show: ['B', 'C', 'R', 'P'] },
        { claim: 'PR ∥ BC and PR = BC.', reason: 'Opposite sides of the parallelogram BCRP.', show: ['PR', 'BC'] },
        { claim: 'PQ ∥ BC and PQ = ½ BC.', reason: 'PQ is part of PR and is half of it (Q is the midpoint of PR).', show: ['PQ', 'BC'] },
      ],
      check: pick('chk-q4-proof', 'Which earlier result shows that BCRP is a parallelogram?', [
        ['One pair of opposite sides is equal and parallel.', null],
        ['The diagonals of a rectangle are equal.', 'BCRP is not given to be a rectangle, and that fact is not what we are using.', 'wrong_theorem'],
        ['The angles of a triangle add to 180°.', 'That is about triangles. For BCRP we use a test for parallelograms: CR and PB are equal and parallel.', 'wrong_theorem'],
      ], 'CR and PB are equal and parallel.', undefined, 'q4-proof'),
    },
  ],
  investigation: lab('Construct a triangle and its midpoints in the laboratory and check the theorem.'),
  worked: {
    id: 'w-quad-l4', title: 'The medial triangle',
    given: ['In triangle ABC, D, E and F are the midpoints of AB, BC and CA.', 'AB = 12 cm, BC = 16 cm, CA = 10 cm.'], ask: 'Find the sides of triangle DEF and its perimeter.',
    steps: [
      { text: 'DE joins the midpoints of AB and BC, so DE ∥ CA and DE = ½ × 10 = 5 cm.', why: 'Midpoint Theorem in triangle ABC: the segment joins two midpoints, the third side is CA.' },
      { text: 'EF joins the midpoints of BC and CA, so EF = ½ × 12 = 6 cm.', why: 'The third side is AB.' },
      { text: 'FD joins the midpoints of CA and AB, so FD = ½ × 16 = 8 cm.', why: 'The third side is BC.' },
      { text: 'Perimeter of DEF = 5 + 6 + 8 = 19 cm.', why: 'Add the three sides.' },
    ],
    verify: 'The perimeter 19 is half of 12 + 16 + 10 = 38, as expected.',
  },
  guided: {
    id: 'g-quad-l4', prompt: 'In triangle ABC, P and Q are the midpoints of AB and AC. BC = 14 cm and ∠ABC = 58°.',
    steps: [
      { id: 'g1', prompt: 'Find PQ.', question: num('g-quad-l4-1', 'Find PQ, in cm.', 7, 'PQ = ½ BC = 7.', { unit: 'cm', refresherId: 'q4-statement', rules: [[[14], '14 is BC. PQ is half of it.', 'same_length'], [[28], '28 is double BC. PQ is smaller, half of BC.', 'doubled_not_halved']] }), hints: ['Which side is the "third side"?'] },
      { id: 'g2', prompt: 'Which line is PQ parallel to?', question: pick('g-quad-l4-2', 'PQ is parallel to which line?', [
        ['BC', null],
        ['AB', 'PQ starts on AB, so it cannot be parallel to it. The Midpoint Theorem gives the third side, the side that is not touched.', 'wrong_side'],
        ['AC', 'Q is on AC, so PQ meets AC. The parallel line is the third side.', 'wrong_side'],
      ], 'PQ ∥ BC.', undefined, 'q4-statement'), hints: ['Which side does not touch P or Q?'] },
      { id: 'g3', prompt: 'Find ∠APQ.', question: num('g-quad-l4-3', 'Find ∠APQ, in degrees (PQ ∥ BC).', 58, 'PQ ∥ BC and AB is a transversal, so the corresponding angles ∠APQ and ∠ABC are equal.', { unit: '°', refresherId: 'q4-statement', rules: [[[122], '122° is 180 − 58. That would be the co-interior angle on the other side. ∠APQ is a corresponding angle to ∠ABC.', 'corresponding_vs_cointerior']] }), hints: ['PQ ∥ BC with transversal AB.'] },
    ],
    conclusion: 'PQ = 7 cm, PQ ∥ BC and ∠APQ = 58°.',
  },
  independent: [
    ind('i1', 'Length', 'use', 'Find the third side.', num('quad-l4-i1', 'P and Q are the midpoints of AB and AC in triangle ABC. BC = 18 cm. Find PQ.', 9, 'PQ = ½ × 18 = 9.', { unit: 'cm', refresherId: 'q4-statement', rules: [[[36], '36 is double BC. PQ is half of it.', 'doubled_not_halved']] }), ['PQ is half the third side.'], ['9 cm.']),
    ind('i2', 'Length', 'use', 'Work backwards.', num('quad-l4-i2', 'P and Q are the midpoints of AB and AC. PQ = 7.5 cm. Find BC.', 15, 'BC = 2 × PQ = 15.', { unit: 'cm', refresherId: 'q4-statement', rules: [[[3.75], '3.75 is half of PQ. PQ is half of BC, so BC is twice PQ.', 'halved_not_doubled']] }), ['BC is twice PQ.'], ['15 cm.']),
    ind('i3', 'Angle', 'use', 'Parallel lines.', num('quad-l4-i3', 'P and Q are the midpoints of AB and AC and ∠ABC = 62°. Find ∠APQ.', 62, 'PQ ∥ BC, so the corresponding angles ∠APQ and ∠ABC are equal.', { unit: '°', refresherId: 'q4-statement', rules: [[[118], '118° is 180 − 62. ∠APQ and ∠ABC are corresponding angles, so they are equal.', 'corresponding_vs_cointerior']] }), ['PQ ∥ BC.'], ['62°.']),
    ind('i4', 'Perimeter', 'use', 'The triangle of midpoints.', num('quad-l4-i4', 'The sides of triangle ABC are 10 cm, 12 cm and 14 cm. D, E and F are the midpoints of its sides. Find the perimeter of triangle DEF.', 18, 'Each side of DEF is half of a side of ABC, so the perimeter is half of 36: 18.', { unit: 'cm', refresherId: 'q4-statement', rules: [[[36], '36 is the perimeter of ABC. Each side of DEF is half the matching side, so its perimeter is half of 36.', 'same_perimeter']] }), ['Each side of DEF is half of a side of ABC.'], ['½ × (10 + 12 + 14) = 18.']),
    ind('i5', 'Conditions', 'reason', 'What does it need?', pick('quad-l4-i5', 'P is the midpoint of AB, but Q is just some point on AC. Is PQ = ½ BC guaranteed?', [
      ['No: the theorem needs Q to be the midpoint of AC as well.', null],
      ['Yes: P is a midpoint, which is enough.', 'The theorem needs both endpoints to be midpoints. With Q elsewhere on AC the length of PQ can be anything.', 'one_midpoint_enough'],
      ['Yes, whenever PQ is parallel to AB.', 'PQ starts on AB, so it cannot be parallel to it unless it lies along it.', 'confused_parallel'],
    ], 'Both P and Q must be midpoints.', undefined, 'q4-statement'), ['Check what the theorem assumes.'], ['Q must be the midpoint of AC.']),
    ind('i6', 'Statement', 'reason', 'Which is the theorem?', pick('quad-l4-i6', 'Which statement is the Midpoint Theorem?', [
      ['The segment joining the midpoints of two sides of a triangle is parallel to the third side and half as long.', null],
      ['The segment joining the midpoints of two sides of a triangle is equal to the third side.', 'It is half the third side, not equal to it.', 'same_length'],
      ['A segment parallel to a side of a triangle is half as long as that side.', 'A segment parallel to a side can have any length shorter than it. The theorem is about the segment that joins two midpoints.', 'forgot_midpoints'],
    ], 'It needs the two midpoints and it gives parallel and half.', undefined, 'q4-statement'), ['Which statement mentions midpoints?'], ['Parallel and half, joining two midpoints.']),
    ind('i7', 'Proof', 'reason', 'Arrange the proof.', ord('quad-l4-i7', 'Arrange the steps of the proof of the Midpoint Theorem.', MIDPOINT_PROOF, ['p4', 'p2', 'p5', 'p1', 'p3'], 'First build R, then the two parallelograms in order, then read off the conclusion.'), ['What must exist before you can talk about APCR?'], ['Extend to R, APCR, equal and parallel to PB, BCRP, conclusion.']),
  ],
  reflection: {
    discover: 'The segment joining the midpoints of two sides of a triangle is parallel to the third side and exactly half as long. The proof builds a parallelogram by doubling the segment.',
    evidence: 'You moved a triangle to see PQ stay parallel and half as long, and followed the proof step by step.',
    stillConfusing: [{ text: 'What does the theorem say?', refresherId: 'q4-statement' }, { text: 'Why does it work?', refresherId: 'q4-proof' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Converse of the Midpoint Theorem  (textbook 12.3.1, Theorem 7)
// ---------------------------------------------------------------------------

const CONVERSE_PROOF = [
  { id: 'c1', text: 'Let Q′ be the midpoint of AC. P is the midpoint of AB.', needs: [] },
  { id: 'c2', text: 'By the Midpoint Theorem, PQ′ ∥ BC.', needs: ['c1'] },
  { id: 'c3', text: 'Through P there is exactly one line parallel to BC. Both PQ and PQ′ are such lines, so they are the same line.', needs: ['c2'] },
  { id: 'c4', text: 'PQ and PQ′ meet AC at one point, so Q = Q′, the midpoint of AC.', needs: ['c3'] },
];

export const L5: EduLesson = {
  id: 'quad-l5', unitId: 'qunit-3', number: 5, title: 'The converse of the Midpoint Theorem',
  objective: 'state the converse, apply it, and explain why the starting point must be a midpoint.',
  prerequisiteIds: ['qp-midpoint', 'qp-parallel-lines', 'qp-if-then'],
  objectives: [
    { id: 'apply', label: 'Apply the converse to find lengths' },
    { id: 'direction', label: 'Know which direction and which conditions' },
    { id: 'reason', label: 'Say why it holds' },
  ],
  steps: [
    {
      id: 'q5-obs', title: 'Start from a midpoint', phase: 'observe',
      paragraphs: ['This time you only know that P is the midpoint of AB. Draw the line through P parallel to BC and see where it meets AC.'],
      visual: triVisual('converse', FIG.tri, 'Triangle ABC, P the midpoint of AB, and the line through P parallel to BC meeting AC at Q.', { t: 0.5 }),
      notice: 'Compare AQ and QC.',
      check: pick('chk-q5-obs', 'The line through the midpoint P of AB, parallel to BC, meets AC at Q. If AC = 14 cm, what is AQ?', [
        ['7 cm', null],
        ['14 cm', '14 cm is the whole of AC. Q is half way along it.', 'whole_for_half'],
        ['It cannot be found.', 'It can: the converse says Q is the midpoint of AC.', 'cannot_conclude'],
      ], 'Q is the midpoint of AC, so AQ = 7.', undefined, 'q5-obs'),
    },
    {
      id: 'q5-slide', title: 'What if P is not the midpoint?', phase: 'observe',
      paragraphs: ['Slide P along AB. The line through P parallel to BC still meets AC at some Q, but look at the ratio AQ : QC.'],
      visual: triVisual('converse', FIG.tri, 'Triangle ABC with a point P you can slide along AB, and the parallel to BC through P.', { t: 0.5, slider: true }),
      notice: 'Which position of P makes AQ equal to QC?',
      check: pick('chk-q5-slide', 'P is NOT the midpoint of AB. The line through P parallel to BC meets AC at Q. Is Q the midpoint of AC?', [
        ['No: Q is the midpoint only when P is.', null],
        ['Yes: a parallel line always meets AC at its midpoint.', 'Slide P: AQ and QC are equal only at the midpoint position.', 'any_parallel_bisects'],
      ], 'The condition "P is the midpoint" is essential.', undefined, 'q5-slide'),
    },
    {
      id: 'q5-statement', title: 'The converse, exactly', phase: 'conjecture',
      paragraphs: [
        'The textbook states it like this: the line drawn through the midpoint of one side of a triangle, parallel to another side, bisects the third side (and the resulting segment is half the length of the parallel side).',
        'It is called a converse because it runs the Midpoint Theorem in the other direction. But it does not simply swap the two parts of the Midpoint Theorem. It starts from a midpoint and a parallel line, and it concludes the second midpoint.',
      ],
      vocabulary: [{ term: 'bisect', meaning: 'cut into two equal parts' }],
    },
    {
      id: 'q5-proof', title: 'Why it works', phase: 'proof',
      paragraphs: ['The proof uses the Midpoint Theorem and the fact that there is only one line through a point parallel to a given line.'],
      visual: triVisual('converse', FIG.tri, 'Triangle ABC with midpoint P of AB and the parallel to BC through P.', { t: 0.5 }),
      proof: [
        { claim: 'Let Q′ be the midpoint of AC.', reason: 'Construction. P is already the midpoint of AB.', show: ['P', 'Q'] },
        { claim: 'PQ′ ∥ BC.', reason: 'Midpoint Theorem: P and Q′ are midpoints of AB and AC.', show: ['PQ', 'BC'] },
        { claim: 'The line through P parallel to BC is PQ′ and also the given line PQ.', reason: 'Through a point there is only one line parallel to a given line.', show: ['PQ'] },
        { claim: 'Q = Q′, so Q is the midpoint of AC.', reason: 'The two lines are the same, so they meet AC at the same point.', show: ['Q', 'AQ', 'QC'] },
      ],
      check: pick('chk-q5-proof', 'Which fact says that the line PQ and the line PQ′ are the same line?', [
        ['Through a point there is only one line parallel to a given line.', null],
        ['The angles of a triangle add to 180°.', 'That fact is not used here. We use that two lines through P that are both parallel to BC must coincide.', 'wrong_fact'],
        ['P is the midpoint of AB.', 'That is true, but it does not make two parallel lines the same line. Uniqueness of the parallel through P does.', 'wrong_fact'],
      ], 'There is only one line through P parallel to BC.', undefined, 'q5-proof'),
    },
  ],
  investigation: lab('Draw a parallel through a midpoint in the laboratory and see where it meets the other side.'),
  worked: {
    id: 'w-quad-l5', title: 'Using the converse',
    given: ['In triangle ABC, P is the midpoint of AB. The line through P parallel to BC meets AC at Q.', 'AC = 18 cm and BC = 15 cm.'], ask: 'Find AQ and PQ.',
    steps: [
      { text: 'Q is the midpoint of AC, so AQ = ½ × 18 = 9 cm.', why: 'Converse of the Midpoint Theorem: a line through the midpoint of one side parallel to another bisects the third side.' },
      { text: 'PQ joins the midpoints P and Q, so PQ = ½ × 15 = 7.5 cm.', why: 'Midpoint Theorem: the segment joining two midpoints is half the third side.' },
    ],
    verify: 'Both theorems were used in turn: the converse to find Q, then the theorem for PQ.',
  },
  guided: {
    id: 'g-quad-l5', prompt: 'In triangle ABC, P is the midpoint of AB. The line through P parallel to BC meets AC at Q. AC = 26 cm.',
    steps: [
      { id: 'g1', prompt: 'Which fact gives that Q is the midpoint?', question: pick('g-quad-l5-1', 'What lets you say Q is the midpoint of AC?', [
        ['P is the midpoint of AB and PQ ∥ BC.', null],
        ['PQ ∥ BC alone.', 'A line parallel to BC through another point of AB meets AC somewhere else, not at the midpoint. P being the midpoint is essential.', 'any_parallel_bisects'],
        ['AC = 26 cm.', 'The length of AC does not tell where Q is. The reason is the midpoint P and the parallel line.', 'wrong_fact'],
      ], 'Midpoint P and the parallel through P.', undefined, 'q5-statement'), hints: ['What is known about P?'] },
      { id: 'g2', prompt: 'Find AQ.', question: num('g-quad-l5-2', 'Find AQ, in cm.', 13, 'Q is the midpoint of AC: 26 ÷ 2 = 13.', { unit: 'cm', refresherId: 'q5-obs', rules: [[[26], '26 is the whole of AC. Q is half way along it.', 'whole_for_half']] }), hints: ['Q is half way along AC.'] },
      { id: 'g3', prompt: 'If QC = 13 cm, what does that tell you about AQ and QC?', question: pick('g-quad-l5-3', 'AQ and QC are:', [
        ['Equal: Q bisects AC.', null],
        ['Different: AQ is bigger.', 'Q is the midpoint, so AQ = QC = 13.', 'wrong_conclusion'],
      ], 'AQ = QC = 13 cm.', undefined, 'q5-obs'), hints: ['What does "bisect" mean?'] },
    ],
    conclusion: 'AQ = QC = 13 cm.',
  },
  independent: [
    ind('i1', 'Length', 'apply', 'Half of AC.', num('quad-l5-i1', 'P is the midpoint of AB and the line through P parallel to BC meets AC at Q. AC = 26 cm. Find AQ.', 13, 'Q is the midpoint of AC: AQ = 13.', { unit: 'cm', refresherId: 'q5-obs', rules: [[[26], '26 is all of AC. Q is half way along it.', 'whole_for_half']] }), ['Which point is Q?'], ['13 cm.']),
    ind('i2', 'Length', 'apply', 'Half of BC.', num('quad-l5-i2', 'P is the midpoint of AB and PQ ∥ BC with Q on AC. PQ = 4.2 cm. Find BC.', 8.4, 'PQ joins the midpoints P and Q, so BC = 2 × PQ = 8.4.', { unit: 'cm', tolerance: 0.01, refresherId: 'q5-statement', rules: [[[2.1], '2.1 is half of PQ. PQ is half of BC, so BC is double PQ.', 'halved_not_doubled']] }), ['PQ is half the parallel side.'], ['8.4 cm.']),
    ind('i3', 'Length', 'apply', 'Find AC.', num('quad-l5-i3', 'P is the midpoint of AB and the line through P parallel to BC meets AC at Q with QC = 6.5 cm. Find AC.', 13, 'Q is the midpoint of AC, so AC = 2 × QC = 13.', { unit: 'cm', refresherId: 'q5-obs', rules: [[[6.5], '6.5 is only QC, half of AC.', 'half_for_whole']] }), ['QC is half of AC.'], ['13 cm.']),
    ind('i4', 'Conditions', 'direction', 'What is needed?', pick('quad-l5-i4', 'What do you need to know to conclude that Q is the midpoint of AC?', [
      ['P is the midpoint of AB, and the line PQ is parallel to BC.', null],
      ['Only that PQ is parallel to BC.', 'Slide P in the lesson: for a P that is not the midpoint, the parallel through P does not bisect AC.', 'any_parallel_bisects'],
      ['Only that P is the midpoint of AB.', 'Without the parallel line, Q could be anywhere on AC. Both facts are needed.', 'one_condition'],
    ], 'Both the midpoint and the parallel are needed.', undefined, 'q5-slide'), ['What changes when you slide P?'], ['Midpoint and parallel.']),
    ind('i5', 'Reason', 'reason', 'Why the line is the same.', pick('quad-l5-i5', 'In the proof, why can we say the lines PQ and PQ′ are the same line?', [
      ['Both pass through P and are parallel to BC, and only one such line exists.', null],
      ['Because the triangle is drawn carefully.', 'A drawing is not a reason. The reason is that through P there is exactly one line parallel to BC.', 'drawing_as_reason'],
      ['Because Q and Q′ are midpoints.', 'That is what we want to prove, and assuming it would be circular.', 'circular'],
    ], 'Uniqueness of the parallel through P.', undefined, 'q5-proof'), ['What do the two lines have in common?'], ['Same point P and same direction.']),
    ind('i6', 'Proof', 'reason', 'Arrange the proof.', ord('quad-l5-i6', 'Arrange the steps of the proof of the converse of the Midpoint Theorem.', CONVERSE_PROOF, ['c3', 'c1', 'c4', 'c2'], 'Choose the midpoint of AC first, apply the Midpoint Theorem, use uniqueness of the parallel, and conclude.'), ['What do you construct first?'], ['Q′, then PQ′ ∥ BC, then the lines coincide, then Q = Q′.']),
  ],
  reflection: {
    discover: 'A line through the midpoint of one side of a triangle, parallel to another side, bisects the third side. It needs both the midpoint and the parallel; the proof uses the Midpoint Theorem and uniqueness of the parallel line.',
    evidence: 'You slid P to see that only the midpoint works, applied the converse to find lengths, and arranged its proof.',
    stillConfusing: [{ text: 'What does the converse say?', refresherId: 'q5-statement' }, { text: 'Why must P be the midpoint?', refresherId: 'q5-slide' }, { text: 'Why does it work?', refresherId: 'q5-proof' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 6: Medians and the centroid  (textbook 12.3.2, Theorem 8)
// ---------------------------------------------------------------------------

const CENTROID_PROOF = [
  { id: 'm1', text: 'Let medians BE and CF meet at G, and let M and N be the midpoints of GB and GC.', needs: [] },
  { id: 'm2', text: 'In triangle ABC, FE ∥ BC and FE = ½ BC (Midpoint Theorem, F and E are midpoints).', needs: ['m1'] },
  { id: 'm3', text: 'In triangle GBC, MN ∥ BC and MN = ½ BC (Midpoint Theorem).', needs: ['m1'] },
  { id: 'm4', text: 'FENM has a pair of opposite sides equal and parallel, so it is a parallelogram.', needs: ['m2', 'm3'] },
  { id: 'm5', text: 'Its diagonals FN and EM bisect each other at G, so GF = GN = NC and GE = GM = MB.', needs: ['m4'] },
  { id: 'm6', text: 'Hence CG = 2 GF and BG = 2 GE: G cuts each median in the ratio 2 : 1.', needs: ['m5'] },
];

export const L6: EduLesson = {
  id: 'quad-l6', unitId: 'qunit-4', number: 6, title: 'Medians and the centroid',
  objective: 'say what a median is, use the 2 : 1 ratio at the centroid, and follow why the three medians meet at one point.',
  prerequisiteIds: ['qp-midpoint', 'qp-congruence'],
  objectives: [
    { id: 'ratio', label: 'Use the 2 : 1 ratio' },
    { id: 'why', label: 'Say why the medians meet and why the ratio holds' },
  ],
  steps: [
    {
      id: 'q6-median', title: 'Medians', phase: 'observe',
      paragraphs: ['A median of a triangle joins a vertex to the midpoint of the opposite side. A triangle has three medians, AD, BE and CF, where D, E and F are the midpoints of BC, CA and AB.'],
      vocabulary: [{ term: 'median', meaning: 'a segment from a vertex to the midpoint of the opposite side' }],
      visual: triVisual('centroid', FIG.tri, 'Triangle ABC with its three medians AD, BE and CF and the point G where they meet.'),
      notice: 'Move the corners: do the three medians always pass through one point?',
      check: pick('chk-q6-median', 'D is the midpoint of BC. Which segment is a median of triangle ABC?', [
        ['AD', null],
        ['BC', 'BC is a side. A median joins a vertex to the midpoint of the opposite side.', 'median_side'],
        ['The perpendicular from A to BC', 'That is an altitude. It need not end at the midpoint of BC.', 'median_altitude'],
      ], 'AD joins A to the midpoint D of BC.', undefined, 'q6-median'),
    },
    {
      id: 'q6-ratio', title: 'Where do they meet, and how are they cut?', phase: 'conjecture',
      paragraphs: [
        'The point G is found as the crossing of two medians, and the readout checks whether the third median also passes through it. Then compare AG with GD, BG with GE, and CG with GF.',
        'Each median is cut into two parts in the ratio 2 : 1, the longer part next to the vertex. This is the Centroid Theorem: the three medians of a triangle pass through a common point, called the centroid, which divides each median in the ratio 2 : 1.',
      ],
      visual: triVisual('centroid', FIG.triWide, 'A triangle with its medians; G is the intersection of two medians, and the readout shows how far the third median is from G and the three ratios.'),
      notice: 'Read the three ratios. The longer part is always the one touching the vertex.',
      check: pick('chk-q6-ratio', 'G is the centroid and median AD = 12 cm. Which is correct?', [
        ['AG = 8 cm and GD = 4 cm', null],
        ['AG = 6 cm and GD = 6 cm', 'G is not the midpoint of the median. It is nearer to the side BC: AG is twice GD.', 'centroid_is_midpoint'],
        ['AG = 4 cm and GD = 8 cm', 'The longer part is next to the vertex A, not next to the side: AG = 8 and GD = 4.', 'ratio_reversed'],
      ], 'AG : GD = 2 : 1, so AG = 8 and GD = 4.', undefined, 'q6-ratio'),
    },
    {
      id: 'q6-proof', title: 'Why it works', phase: 'proof',
      paragraphs: ['This proof uses the Midpoint Theorem twice and the test "one pair of opposite sides equal and parallel". It shows the ratio for two medians; the third median is then the same point, since each median has just one point cutting it 2 : 1.'],
      visual: triVisual('centroid', FIG.tri, 'Triangle ABC with medians BE and CF meeting at G, and the midpoints M of GB and N of GC.', { proof: true }),
      proof: [
        { claim: 'Medians BE and CF meet at G. M and N are the midpoints of GB and GC.', reason: 'Setting up.', show: ['G', 'M', 'N'] },
        { claim: 'FE ∥ BC and FE = ½ BC.', reason: 'Midpoint Theorem in triangle ABC (F, E are midpoints).', show: ['FE', 'BC'] },
        { claim: 'MN ∥ BC and MN = ½ BC.', reason: 'Midpoint Theorem in triangle GBC (M, N are midpoints).', show: ['MN', 'BC'] },
        { claim: 'FENM is a parallelogram.', reason: 'FE and NM are equal and parallel.', show: ['F', 'E', 'N', 'M'] },
        { claim: 'GF = GN = NC and GE = GM = MB.', reason: 'The diagonals FN and EM of the parallelogram bisect each other at G, and N, M are midpoints.', show: ['GF', 'GN', 'NC', 'GE', 'GM', 'MB'] },
        { claim: 'CG = 2 GF and BG = 2 GE.', reason: 'From the line above.', show: ['CG', 'GF', 'BG', 'GE'] },
      ],
    },
  ],
  investigation: lab('Draw the three medians in the laboratory and check the 2 : 1 ratio.'),
  worked: {
    id: 'w-quad-l6', title: 'Using the 2 : 1 ratio',
    given: ['G is the centroid of triangle ABC. Median AD = 18 cm. Median BE: BG = 10 cm.'], ask: 'Find AG, GD and GE.',
    steps: [
      { text: 'AG : GD = 2 : 1, so AG is ⅔ of AD: AG = 12 cm.', why: 'The centroid divides each median in the ratio 2 : 1 from the vertex.' },
      { text: 'GD = 18 − 12 = 6 cm.', why: 'The two parts make up the median.' },
      { text: 'BG : GE = 2 : 1, so GE = ½ × 10 = 5 cm.', why: 'The same ratio holds on the median BE.' },
    ],
    verify: 'AG = 2 × GD (12 = 2 × 6) and BG = 2 × GE (10 = 2 × 5).',
  },
  guided: {
    id: 'g-quad-l6', prompt: 'G is the centroid of triangle ABC and the median AD = 21 cm.',
    steps: [
      { id: 'g1', prompt: 'Which part is longer?', question: pick('g-quad-l6-1', 'Which part of the median AD is longer?', [
        ['AG, next to the vertex A.', null],
        ['GD, next to the side BC.', 'The centroid is closer to the side: GD is the shorter part and AG is twice as long.', 'ratio_reversed'],
        ['They are equal.', 'The ratio is 2 : 1, not 1 : 1.', 'centroid_is_midpoint'],
      ], 'AG : GD = 2 : 1.', undefined, 'q6-ratio'), hints: ['AG : GD = 2 : 1.'] },
      { id: 'g2', prompt: 'Find AG.', question: num('g-quad-l6-2', 'Find AG, in cm.', 14, 'AG = ⅔ × 21 = 14.', { unit: 'cm', refresherId: 'q6-ratio', rules: [[[7], '7 cm is GD (one third). AG is the longer part, two thirds.', 'ratio_reversed'], [[10.5], '10.5 is half of AD. G is not the midpoint of AD.', 'centroid_is_midpoint']] }), hints: ['AG is 2 parts out of 3.'] },
      { id: 'g3', prompt: 'Find GD.', question: num('g-quad-l6-3', 'Find GD, in cm.', 7, 'GD = 21 − 14 = 7 (one third of AD).', { unit: 'cm', refresherId: 'q6-ratio', rules: [[[14], '14 is AG. GD is the shorter part.', 'ratio_reversed']] }), hints: ['GD is the remaining part.'] },
    ],
    conclusion: 'AG = 14 cm and GD = 7 cm.',
  },
  independent: [
    ind('i1', 'Ratio', 'ratio', 'The ratio.', pick('quad-l6-i1', 'G is the centroid of triangle ABC and D is the midpoint of BC. Which statement is true?', [
      ['AG = 2 × GD', null],
      ['AG = GD', 'G is not the midpoint of AD. It is closer to D: AG is twice GD.', 'centroid_is_midpoint'],
      ['GD = 2 × AG', 'The ratio is the other way round. The longer part is next to the vertex A.', 'ratio_reversed'],
    ], 'AG : GD = 2 : 1.', undefined, 'q6-ratio'), ['Which part touches the vertex?'], ['AG = 2 GD.']),
    ind('i2', 'Ratio', 'ratio', 'Part of a median.', num('quad-l6-i2', 'G is the centroid and the median CF = 27 cm. Find CG.', 18, 'CG = ⅔ × 27 = 18.', { unit: 'cm', refresherId: 'q6-ratio', rules: [[[9], '9 cm is GF, the shorter part. CG runs from the vertex C to G.', 'ratio_reversed'], [[13.5], '13.5 is half of CF. G is not the midpoint.', 'centroid_is_midpoint']] }), ['CG is the part next to the vertex.'], ['18 cm.']),
    ind('i3', 'Ratio', 'ratio', 'Work backwards.', num('quad-l6-i3', 'G is the centroid and GE = 4.5 cm on the median BE. Find the whole median BE.', 13.5, 'BG = 2 × GE = 9, so BE = 9 + 4.5 = 13.5.', { unit: 'cm', tolerance: 0.01, refresherId: 'q6-ratio', rules: [[[9], '9 is BG only. The whole median is BG + GE.', 'part_for_whole'], [[4.5], '4.5 is GE, only one third of BE.', 'part_for_whole']] }), ['First find BG.'], ['BE = 3 × GE = 13.5.']),
    ind('i4', 'Reasons', 'why', 'Spot the flaw.', pick('quad-l6-i4', 'A student says: "G is where the medians cross, so G is the midpoint of each median." What is wrong?', [
      ['G cuts each median in the ratio 2 : 1, not 1 : 1.', null],
      ['Nothing: medians always cross at their midpoints.', 'Median AD runs from A to the midpoint D of BC, but G is two thirds of the way from A, not half way.', 'centroid_is_midpoint'],
      ['The medians do not meet at one point.', 'They do: the three medians of any triangle pass through one point, the centroid.', 'medians_dont_meet'],
    ], 'The centroid is 2/3 of the way along each median from its vertex.', undefined, 'q6-ratio'), ['Is G half way along AD?'], ['No: it is 2/3 of the way.']),
    ind('i5', 'Reasons', 'why', 'Which theorem?', pick('quad-l6-i5', 'In the proof, which result shows that MN ∥ BC and MN = ½ BC in triangle GBC?', [
      ['The Midpoint Theorem, because M and N are midpoints of GB and GC.', null],
      ['The Centroid Theorem.', 'That is what we are proving, so we cannot use it. We use the Midpoint Theorem.', 'circular'],
      ['The angle sum of a triangle.', 'The angle sum is about angles. Parallel and half-length come from the Midpoint Theorem.', 'wrong_theorem'],
    ], 'M and N are midpoints of two sides of triangle GBC.', undefined, 'q6-proof'), ['Which two sides do M and N lie on?'], ['The Midpoint Theorem.']),
    ind('i6', 'Proof', 'why', 'Arrange the proof.', ord('quad-l6-i6', 'Arrange the steps of the proof that the centroid divides a median in the ratio 2 : 1.', CENTROID_PROOF, ['m5', 'm3', 'm1', 'm6', 'm4', 'm2'], 'Set up G, M and N; apply the Midpoint Theorem twice; get a parallelogram; use its diagonals; conclude the ratio.'), ['Which steps use only the set-up?'], ['Set-up, two midpoint results, parallelogram, diagonals, ratio.']),
  ],
  reflection: {
    discover: 'The three medians of a triangle meet at one point, the centroid, which cuts every median in the ratio 2 : 1 with the longer part at the vertex.',
    evidence: 'You dragged a triangle and watched G cut each median 2 : 1, then followed a proof built from the Midpoint Theorem.',
    stillConfusing: [{ text: 'What is a median?', refresherId: 'q6-median' }, { text: 'What is the ratio?', refresherId: 'q6-ratio' }, { text: 'Why does it work?', refresherId: 'q6-proof' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 7: The Varignon parallelogram  (textbook 12.3.2, Theorem 9)
// ---------------------------------------------------------------------------

const VARIGNON_PROOF = [
  { id: 'v1', text: 'Draw the diagonal AC.', needs: [] },
  { id: 'v2', text: 'In triangle ABC, P and Q are midpoints of AB and BC, so PQ ∥ AC and PQ = ½ AC.', needs: ['v1'] },
  { id: 'v3', text: 'In triangle ADC, S and R are midpoints of AD and DC, so SR ∥ AC and SR = ½ AC.', needs: ['v1'] },
  { id: 'v4', text: 'So PQ ∥ SR and PQ = SR.', needs: ['v2', 'v3'] },
  { id: 'v5', text: 'PQRS has a pair of opposite sides equal and parallel, so it is a parallelogram.', needs: ['v4'] },
];

export const L7: EduLesson = {
  id: 'quad-l7', unitId: 'qunit-4', number: 7, title: 'The midpoints of a quadrilateral',
  objective: 'state the theorem about the midpoints of the sides of a quadrilateral, use it to find lengths, and follow its proof.',
  prerequisiteIds: ['qp-midpoint', 'qp-congruence'],
  objectives: [
    { id: 'apply', label: 'Use the theorem to find lengths' },
    { id: 'why', label: 'Say why it holds, for every quadrilateral' },
  ],
  steps: [
    {
      id: 'q7-obs', title: 'Join the four midpoints', phase: 'observe',
      paragraphs: ['Mark the midpoints P, Q, R, S of the sides AB, BC, CD, DA and join them in order. What kind of figure is PQRS? Move the vertices of ABCD and see.'],
      visual: freeVisual(FIG.general, 'Quadrilateral ABCD with the midpoints P, Q, R, S of its sides joined to make PQRS.', { focus: 'varignon', diagonals: true }),
      notice: 'Read the lines at the bottom: are the opposite sides of PQRS parallel and equal?',
      check: pick('chk-q7-obs', 'ABCD is a convex quadrilateral. What can you say about PQRS, the figure joining the midpoints of its sides?', [
        ['It is a parallelogram.', null],
        ['It is a square.', 'Only for special ABCD. For most figures you drag, PQRS is not a square.', 'special_for_general'],
        ['It is a quadrilateral of the same shape as ABCD.', 'PQRS is a different shape from ABCD. It is always a parallelogram.', 'same_shape'],
      ], 'It is a parallelogram.', undefined, 'q7-obs'),
    },
    {
      id: 'q7-dent', title: 'Does a dent matter?', phase: 'conjecture',
      paragraphs: ['Drag D inward so ABCD becomes a dart. Does PQRS stop being a parallelogram? The statement is for every quadrilateral, not only convex ones. This is the Midpoint Theorem for Quadrilaterals: the midpoints of the four sides of a quadrilateral are the vertices of a parallelogram (the Varignon parallelogram).'],
      visual: freeVisual(FIG.dart, 'A dart ABCD with the midpoints of its sides joined as PQRS.', { focus: 'varignon', diagonals: true }),
      notice: 'The readout still says PQRS is a parallelogram.',
      check: pick('chk-q7-dent', 'Is PQRS a parallelogram when ABCD is a dart (non-convex)?', [
        ['Yes: the theorem holds for every quadrilateral.', null],
        ['No: the theorem only works for convex quadrilaterals.', 'Drag D inward: PQRS stays a parallelogram. The proof uses only a diagonal and the Midpoint Theorem, so it never needs convexity.', 'convex_needed'],
      ], 'The proof does not depend on convexity.', undefined, 'q7-dent'),
    },
    {
      id: 'q7-proof', title: 'Why it works', phase: 'proof',
      paragraphs: ['The diagonal AC splits ABCD into two triangles, and the Midpoint Theorem is used in each.'],
      visual: freeVisual(FIG.general, 'Quadrilateral ABCD with diagonal AC and the midpoints P, Q, R, S.', { focus: 'varignon', diagonals: true, drag: false }),
      proof: [
        { claim: 'Draw the diagonal AC.', reason: 'Construction.', show: ['AC'] },
        { claim: 'PQ ∥ AC and PQ = ½ AC.', reason: 'Midpoint Theorem in triangle ABC (P, Q are midpoints of AB, BC).', show: ['PQ', 'AC'] },
        { claim: 'SR ∥ AC and SR = ½ AC.', reason: 'Midpoint Theorem in triangle ADC (S, R are midpoints of AD, DC).', show: ['SR', 'AC'] },
        { claim: 'PQ ∥ SR and PQ = SR.', reason: 'Both are parallel to AC and both are half of AC.', show: ['PQ', 'SR'] },
        { claim: 'PQRS is a parallelogram.', reason: 'One pair of opposite sides is equal and parallel.', show: ['P', 'Q', 'R', 'S'] },
      ],
    },
    {
      id: 'q7-special', title: 'Which parallelogram? (extension)', phase: 'apply',
      paragraphs: ['The same proof shows PQ = ½ AC and QR = ½ BD. So PQRS has equal sides (it is a rhombus) exactly when the diagonals of ABCD are equal, and it has a right angle (it is a rectangle) exactly when the diagonals are perpendicular. This goes beyond the textbook; try it with a rectangle, a kite and a rhombus.'],
      visual: freeVisual(FIG.rectangle, 'A rectangle ABCD, whose diagonals are equal, with the midpoint figure PQRS.', { focus: 'varignon', diagonals: true }),
      notice: 'Make the diagonals equal, then perpendicular, and read the last line.',
    },
  ],
  investigation: lab('Draw any quadrilateral in the laboratory and construct the Varignon parallelogram.'),
  worked: {
    id: 'w-quad-l7', title: 'Sides of the midpoint parallelogram',
    given: ['ABCD is a quadrilateral with diagonals AC = 14 cm and BD = 10 cm.', 'P, Q, R, S are the midpoints of AB, BC, CD, DA.'], ask: 'Find the sides and the perimeter of PQRS.',
    steps: [
      { text: 'PQ = SR = ½ AC = 7 cm.', why: 'Midpoint Theorem in triangles ABC and ADC: each of these sides is half of the diagonal AC.' },
      { text: 'QR = PS = ½ BD = 5 cm.', why: 'Midpoint Theorem in triangles BCD and BAD: each is half of the diagonal BD.' },
      { text: 'Perimeter = 2 × (7 + 5) = 24 cm.', why: 'A parallelogram has two pairs of equal sides.' },
    ],
    verify: 'The perimeter 24 is the sum of the two diagonals, 14 + 10.',
  },
  guided: {
    id: 'g-quad-l7', prompt: 'In quadrilateral ABCD, AC = 20 cm and BD = 12 cm. P, Q, R, S are the midpoints of the sides.',
    steps: [
      { id: 'g1', prompt: 'Which theorem gives the sides?', question: pick('g-quad-l7-1', 'Which result gives PQ in terms of AC?', [
        ['The Midpoint Theorem in triangle ABC.', null],
        ['The Centroid Theorem.', 'The Centroid Theorem is about medians. PQ joins two midpoints, which is the Midpoint Theorem.', 'wrong_theorem'],
        ['The angle sum of a quadrilateral.', 'The angle sum is about angles. The length of PQ comes from the Midpoint Theorem.', 'wrong_theorem'],
      ], 'P, Q are midpoints of AB, BC in triangle ABC.', undefined, 'q7-proof'), hints: ['PQ joins the midpoints of two sides of triangle ABC.'] },
      { id: 'g2', prompt: 'Find PQ.', question: num('g-quad-l7-2', 'Find PQ, in cm.', 10, 'PQ = ½ AC = 10.', { unit: 'cm', refresherId: 'q7-proof', rules: [[[20], '20 is AC itself. PQ is half of it.', 'same_length'], [[6], '6 is half of BD. PQ is parallel to AC, so it is half of AC.', 'wrong_diagonal']] }), hints: ['PQ is half of AC.'] },
      { id: 'g3', prompt: 'Find the perimeter of PQRS.', question: num('g-quad-l7-3', 'Find the perimeter of PQRS, in cm.', 32, 'PQ = SR = 10 and QR = PS = 6, so the perimeter is 2 × (10 + 6) = 32.', { unit: 'cm', refresherId: 'q7-proof', rules: [[[16], '16 is only PQ + QR. PQRS has four sides.', 'half_perimeter']] }), hints: ['QR is half of BD.'] },
    ],
    conclusion: 'PQRS is a parallelogram with sides 10 cm and 6 cm and perimeter 32 cm.',
  },
  independent: [
    ind('i1', 'Lengths', 'apply', 'Perimeter.', num('quad-l7-i1', 'In quadrilateral ABCD, AC = 16 cm and BD = 9 cm. Find the perimeter of the parallelogram PQRS formed by the midpoints of its sides.', 25, 'The sides are 8 and 4.5: perimeter 2 × (8 + 4.5) = 25.', { unit: 'cm', refresherId: 'q7-proof', rules: [[[50], '50 is double the answer: the sides of PQRS are half the diagonals, 8 and 4.5.', 'doubled_not_halved'], [[12.5], '12.5 is only PQ + QR. The perimeter counts all four sides.', 'half_perimeter']] }), ['Each side of PQRS is half a diagonal.'], ['2 × (8 + 4.5) = 25.']),
    ind('i2', 'Lengths', 'apply', 'One side.', num('quad-l7-i2', 'The midpoints of the sides of ABCD form the parallelogram PQRS. QR = 7 cm. Find the diagonal BD.', 14, 'QR is half of BD, so BD = 14.', { unit: 'cm', refresherId: 'q7-proof', rules: [[[3.5], '3.5 is half of QR. QR is half of BD, so BD is twice QR.', 'halved_not_doubled']] }), ['QR is parallel to BD.'], ['14 cm.']),
    ind('i3', 'Reasons', 'why', 'Only convex?', pick('quad-l7-i3', 'A student says: "PQRS is a parallelogram only if ABCD is convex." Is that right?', [
      ['No: the proof uses a diagonal and the Midpoint Theorem and never needs convexity.', null],
      ['Yes: a dent breaks the parallelogram.', 'In the lesson you dragged D inward and PQRS stayed a parallelogram.', 'convex_needed'],
    ], 'The theorem holds for every quadrilateral.', undefined, 'q7-dent'), ['What did you see when ABCD was a dart?'], ['It stayed a parallelogram.']),
    ind('i4', 'Proof', 'why', 'Arrange the proof.', ord('quad-l7-i4', 'Arrange the steps of the proof that the midpoints of the sides of a quadrilateral form a parallelogram.', VARIGNON_PROOF, ['v5', 'v3', 'v1', 'v4', 'v2'], 'Draw the diagonal, apply the Midpoint Theorem in both triangles, compare the two segments, and conclude.'), ['What do you draw first?'], ['Diagonal, two midpoint results, equal and parallel, parallelogram.']),
    ind('i5', 'Extension', undefined, 'Equal diagonals (extension).', pick('quad-l7-i5', 'The diagonals of ABCD are equal in length. What kind of parallelogram is PQRS?', [
      ['A rhombus, since PQ = ½ AC and QR = ½ BD are equal.', null],
      ['A rectangle.', 'A rectangle needs perpendicular diagonals in ABCD. Equal diagonals make PQ = QR, which gives equal sides.', 'rhombus_rectangle'],
      ['Just a parallelogram, nothing special.', 'With AC = BD the adjacent sides PQ and QR are equal, which makes it a rhombus.', 'missed_special'],
    ], 'PQ = ½ AC and QR = ½ BD, so equal diagonals give equal sides.', undefined, 'q7-special'), ['Compare PQ and QR.'], ['A rhombus.']),
    ind('i6', 'Extension', undefined, 'Perpendicular diagonals (extension).', pick('quad-l7-i6', 'The diagonals of kite ABCD are perpendicular. What kind of parallelogram is PQRS?', [
      ['A rectangle, since PQ ∥ AC is perpendicular to QR ∥ BD.', null],
      ['A rhombus.', 'A rhombus needs equal diagonals in ABCD. A kite generally has unequal diagonals.', 'rhombus_rectangle'],
      ['A square, always.', 'It is a square only if the diagonals are also equal.', 'special_for_general'],
    ], 'PQ is parallel to AC and QR to BD, so a right angle between the diagonals gives a right angle in PQRS.', undefined, 'q7-special'), ['PQ ∥ AC and QR ∥ BD.'], ['A rectangle.']),
  ],
  reflection: {
    discover: 'The midpoints of the four sides of ANY quadrilateral form a parallelogram, because the diagonal AC makes PQ and SR both parallel to AC and half of it.',
    evidence: 'You dragged a convex quadrilateral and a dart and read the result off the figure, then followed the Midpoint Theorem proof.',
    stillConfusing: [{ text: 'What is PQRS?', refresherId: 'q7-obs' }, { text: 'Does a dent matter?', refresherId: 'q7-dent' }, { text: 'Why does it work?', refresherId: 'q7-proof' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 8: Tiling the plane with any quadrilateral  (textbook 12.4)
// ---------------------------------------------------------------------------

export const L8: EduLesson = {
  id: 'quad-l8', unitId: 'qunit-5', number: 8, title: 'Tiling the plane with a quadrilateral',
  objective: 'explain why four copies of a quadrilateral fit around a point, and why any quadrilateral can tile the plane.',
  prerequisiteIds: ['qp-angles'],
  objectives: [
    { id: 'angles', label: 'Use the angle sum around a point' },
    { id: 'method', label: 'Explain why any quadrilateral tiles' },
  ],
  steps: [
    {
      id: 'q8-wheel', title: 'Four angles, one full turn', phase: 'observe',
      paragraphs: [
        'To tile the plane we need copies of a shape to fit together with no gaps and no overlaps. Around any point where the copies meet, the angles must add up to a full turn, 360°.',
        'The four angles of a quadrilateral add up to exactly 360°. So four copies, one with each corner, can meet at a point and fill the whole turn. Move a vertex of the quadrilateral: the four wedges always fill the circle.',
      ],
      visual: quadVisual({ mode: 'wheel', pts: FIG.general }, 'The four angles of a quadrilateral placed side by side around one point.'),
      notice: 'The sum of the four wedges stays 360° however you move the vertices.',
      check: pick('chk-q8-wheel', 'Why do four copies of a quadrilateral fit around a point with no gap?', [
        ['The four angles of a quadrilateral add up to 360°, a full turn.', null],
        ['Because each angle is 90°.', 'Only a rectangle has four right angles. For other quadrilaterals the angles differ but the total is still 360°.', 'all_right_angles'],
        ['Because the sides are equal.', 'Equal sides are not needed. It is the angle total of 360° that closes the gap.', 'sides_not_angles'],
      ], 'Their angles sum to 360°.', undefined, 'q8-wheel'),
    },
    {
      id: 'q8-tiling', title: 'A tiling from any quadrilateral', phase: 'apply',
      paragraphs: [
        'One way to build the whole tiling: take ABCD and its half-turn about the midpoint of side BC. Together they make a six-sided shape. Copies of this pair, slid along the two diagonal directions AC and DB, cover the plane.',
        'Drag a vertex and watch the pattern follow. This is a check by eye for each figure you try. The textbook asks you to explore the method experimentally and invites you to prove it; the lesson on the angle sum above is the reason the corners fit.',
      ],
      vocabulary: [{ term: 'tiling', meaning: 'covering the plane with copies of a shape, with no gaps and no overlaps' }],
      visual: quadVisual({ mode: 'tiling', pts: FIG.general }, 'A tiling of the plane made from copies of a quadrilateral ABCD and its half-turns.'),
      notice: 'Make the quadrilateral non-convex (a dart): the tiling still has no gaps.',
      check: pick('chk-q8-tiling', 'Can a non-convex quadrilateral (a dart) also tile the plane?', [
        ['Yes: the chapter says the plane can be tiled with any quadrilateral.', null],
        ['No: only convex quadrilaterals tile.', 'Drag the quadrilateral into a dart in the lesson: the tiling still fits. Its four angles still add to 360°.', 'convex_needed'],
      ], 'Any quadrilateral tiles the plane.', undefined, 'q8-tiling'),
    },
  ],
  investigation: lab('Open the tiling tool in the laboratory and tile the plane with your own quadrilateral.'),
  worked: {
    id: 'w-quad-l8', title: 'Does a set of angles fit around a point?',
    given: ['A quadrilateral has angles 85°, 95° and 110°.'], ask: 'Find the fourth angle, and say what happens when four copies meet at a point, one corner of each.',
    steps: [
      { text: 'The fourth angle is 360 − (85 + 95 + 110) = 70°.', why: 'The four angles of a quadrilateral add up to 360°.' },
      { text: 'Placing 85°, 95°, 110° and 70° around a point gives 360°.', why: 'This is the angle sum, so it equals a full turn.' },
      { text: 'There is no gap and no overlap at that point.', why: 'A full turn is exactly 360°.' },
    ],
    verify: '85 + 95 + 110 + 70 = 360.',
  },
  guided: {
    id: 'g-quad-l8', prompt: 'Four copies of a quadrilateral meet at a point, each showing a different corner. Three of the angles at the point are 100°, 80° and 75°.',
    steps: [
      { id: 'g1', prompt: 'What must the angles at the point add up to?', question: pick('g-quad-l8-1', 'What do all the angles at the point add up to?', [
        ['360°', null],
        ['180°', '180° is half a turn. Going all the way around the point is 360°.', 'turn_halved'],
      ], 'A full turn.', undefined, 'q8-wheel'), hints: ['All the way round.'] },
      { id: 'g2', prompt: 'Find the fourth angle.', question: num('g-quad-l8-2', 'Find the fourth angle, in degrees.', 105, '360 − (100 + 80 + 75) = 105.', { unit: '°', refresherId: 'q8-wheel', rules: [[[255], '255 is the sum of the three angles. The fourth angle is what is left of 360°.', 'sum_not_remainder']] }), hints: ['Subtract from 360.'] },
    ],
    conclusion: 'The fourth angle is 105°, and these are also the four angles of the quadrilateral.',
  },
  independent: [
    ind('i1', 'Angles at a point', 'angles', 'Missing angle.', num('quad-l8-i1', 'Three angles of a quadrilateral are 72°, 98° and 105°. Find the fourth, which fills the gap around a point.', 85, '360 − (72 + 98 + 105) = 85.', { unit: '°', refresherId: 'q8-wheel', rules: [[[275], '275 is the sum of the three angles. The fourth angle is what is left of 360°.', 'sum_not_remainder']] }), ['The four angles make a full turn.'], ['85°.']),
    ind('i2', 'Angles at a point', 'angles', 'A reflex angle.', num('quad-l8-i2', 'A non-convex quadrilateral has angles 45°, 55° and 35°. Find the fourth angle.', 225, '360 − (45 + 55 + 35) = 225, which is more than 180°.', { unit: '°', refresherId: 'q8-wheel', rules: [[[135], '135 is the sum of the given angles. The fourth angle is what is left of 360°.', 'sum_not_remainder']] }), ['The angle sum still holds.'], ['225°.']),
    ind('i3', 'Angles at a point', 'angles', 'Spot the error.', pick('quad-l8-i3', 'A student measures the four angles of a quadrilateral and gets a total of 350°. What should the student conclude?', [
      ['A measurement is off, because the angles of a quadrilateral always add to 360°.', null],
      ['This quadrilateral cannot tile the plane.', 'Every quadrilateral can. Its four angles add to 360°, so 350° means a measurement slipped.', 'measure_over_theory'],
      ['The angle sum can differ from figure to figure.', 'The angle sum of a quadrilateral is always 360°, as shown by splitting it into two triangles.', 'sum_varies'],
    ], 'The angle sum is 360° for every quadrilateral.', undefined, 'q8-wheel'), ['Is the angle sum fixed?'], ['A measurement is off.']),
    ind('i4', 'Method', 'method', 'Why it fits.', pick('quad-l8-i4', 'What is the key fact that makes four copies of any quadrilateral fit around a point?', [
      ['Its four angles add up to 360°.', null],
      ['Its opposite sides are parallel.', 'Only parallelograms have parallel opposite sides, but every quadrilateral tiles.', 'only_parallelograms'],
      ['Its diagonals bisect each other.', 'That is true only for parallelograms. The key fact for all quadrilaterals is the angle sum.', 'only_parallelograms'],
    ], 'The angle sum of 360°.', undefined, 'q8-wheel'), ['What do the corners fill at a point?'], ['A full turn.']),
    ind('i5', 'Method', 'method', 'Which quadrilaterals tile?', pick('quad-l8-i5', 'Which quadrilaterals can tile the plane?', [
      ['Every quadrilateral, including non-convex ones.', null],
      ['Only rectangles and squares.', 'The textbook shows that any quadrilateral tiles. Rectangles and squares are just the easy ones.', 'only_special'],
      ['Only convex quadrilaterals.', 'Dart-shaped (non-convex) quadrilaterals also tile.', 'convex_needed'],
    ], 'The plane can be tiled with any given quadrilateral.', undefined, 'q8-tiling'), ['Recall the chapter summary.'], ['Every quadrilateral.']),
  ],
  reflection: {
    discover: 'The four angles of any quadrilateral add to 360°, so copies fit around a point; arranged with half-turns they extend to a tiling of the whole plane.',
    evidence: 'You moved a quadrilateral and kept the tiling gap-free, even for a dart, and used 360° to find missing angles.',
    stillConfusing: [{ text: 'Why do the angles fit?', refresherId: 'q8-wheel' }, { text: 'How does the pattern continue?', refresherId: 'q8-tiling' }],
  },
};
