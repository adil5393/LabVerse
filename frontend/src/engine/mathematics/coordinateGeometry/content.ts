/**
 * Coordinate Geometry, Class 9: original explanations and practice (EDU-1).
 *
 * Aligned to the topics of NCERT Ganita Manjari Grade 9 Part I, Chapter 1
 * "Orienting Yourself: The Use of Coordinates": the Cartesian plane (1.3),
 * quadrants and axes, and distance between two points (1.4). Section titles
 * are the book's; all wording and every question here is original. Midpoint
 * is taught as an application of averaging, following the book's exercises on
 * midpoints without naming any formula the book does not name.
 */

import type { EduChapter, EduLesson, EduUnit, Prerequisite } from '../../education/types';
import { axisDistanceQ, choice, coordinateQ, distanceQ, gridDistanceQ, legQ, midpointQ, plane, plotQ, quadrantQ, readQ, altForPoints } from './questions';
import { fmtPoint } from './learn';

const P = (x: number, y: number) => ({ x, y });

// ---------------------------------------------------------------------------
// Prerequisites
// ---------------------------------------------------------------------------

const numberLineVisual = (marks: { v: number; label: string }[], alt: string, explore = false) => ({ kind: 'numberLine', props: { min: -6, max: 6, marks, ...(explore ? { explore: true } : {}) }, alt });

const PRE_NUMBER_LINE: Prerequisite = {
  id: 'pre-number-line',
  title: 'Negative numbers on the number line',
  why: 'Coordinates use negative numbers for left of and below the starting point. Distances along an axis use the number line too.',
  connection: 'Earlier grades: integers and the number line',
  refresher: [
    {
      id: 'cg-nl-sign', title: 'Left of zero is negative',
      paragraphs: [
        'On a number line, zero is the starting point. Numbers to the right of zero are positive. Numbers to the left are negative.',
        'The farther left you go, the smaller the number: −5 is smaller than −2.',
      ],
      visual: numberLineVisual([{ v: -4, label: 'A' }, { v: 2, label: 'B' }], 'A number line from −6 to 6 with point A at −4 and point B at 2. You can tap any number to see how far it is from 0.', true),
      notice: 'A is 4 steps left of 0, so it is −4. B is 2 steps right of 0, so it is +2. Try tapping other numbers (optional).',
      check: choice('chk-nl-1', 'Which number is greater, −3 or −1?', [
        ['−3', 'Be careful: −3 is farther left than −1, so it is smaller.'],
        ['−1', null],
      ], '−1 is to the right of −3, so it is greater.'),
    },
    {
      id: 'cg-nl-dist', title: 'Distance between two numbers',
      paragraphs: [
        'The distance between two numbers on the line is how many steps lie between them. It is never negative.',
        'If both numbers are on the same side of zero, subtract the smaller size from the bigger. If they are on opposite sides, the steps to zero add up: from −2 to 3 is 2 + 3 = 5 steps.',
      ],
      visual: numberLineVisual([{ v: -2, label: 'M' }, { v: 3, label: 'N' }], 'A number line with M at −2 and N at 3. There are 5 steps between them.'),
      notice: 'Count the unit gaps from M to N: 2 to reach 0, then 3 more.',
    },
  ],
  checks: [
    choice('pre-nl-c1', 'Which of these is the smallest number?', [
      ['−5', null],
      ['−2', 'Compare on the number line. −5 is farther left than −2, so −5 is smaller.'],
      ['0', 'Every negative number is smaller than 0.'],
      ['4', 'Positive numbers are the largest.'],
    ], '−5 is farthest to the left.'),
    {
      kind: 'visual', id: 'pre-nl-c2', prompt: 'Choose the number −4 on the number line.',
      visual: { kind: 'numberLine', props: { min: -6, max: 6, pick: true }, alt: 'A number line from −6 to 6. Choose a number with the arrow buttons or by tapping.' },
      correctId: '-4',
      feedback: { '4': { message: 'That is +4, on the right of zero. Negative numbers are on the left.', refresherId: 'cg-nl-sign', misconception: 'sign_side' } },
      defaultFeedback: { message: 'Start at 0 and count 4 steps to the LEFT.', refresherId: 'cg-nl-sign' },
      explanation: '−4 is 4 steps left of 0.',
    },
    {
      kind: 'numeric', id: 'pre-nl-c3', prompt: 'How many steps are there from −2 to 3 on the number line?', answer: 5,
      rules: [{ values: [1], entry: { message: '3 − 2 = 1 treats −2 as if it were +2. But −2 is on the other side of zero: 2 steps to reach 0, then 3 more.', refresherId: 'cg-nl-dist', misconception: 'ignored_signs_in_distance' } }],
      defaultFeedback: { message: 'Count the steps from −2 to 0, then from 0 to 3, and add them.', refresherId: 'cg-nl-dist' },
      explanation: '2 steps to zero plus 3 steps beyond it is 5.',
    },
  ],
};

const PRE_DIRECTIONS: Prerequisite = {
  id: 'pre-directions',
  title: 'Horizontal, vertical and right angles',
  why: 'The two axes are a horizontal line and a vertical line meeting at a right angle. You need to tell sideways from up-and-down.',
  connection: 'Earlier grades: lines and angles',
  refresher: [
    {
      id: 'cg-dir-1', title: 'Sideways and up-and-down',
      paragraphs: ['A horizontal line runs left to right, like the horizon. A vertical line runs up and down, like a wall.', 'When a horizontal line and a vertical line cross, they make four right angles (90° each).'],
      notice: 'Where the axes cross in the diagram below, all four corners are right angles.',
      visual: plane({ mode: 'view' }, 'A plane with a horizontal line and a vertical line crossing at a right angle in the middle.'),
    },
  ],
  checks: [
    choice('pre-dir-c1', 'A line that runs straight up and down is called:', [
      ['horizontal', 'Horizontal lines run sideways, like a table top. Up-and-down lines are vertical.'],
      ['vertical', null],
    ], 'Vertical means up and down.'),
    choice('pre-dir-c2', 'Two lines cross and make four equal angles. How big is each angle?', [
      ['45°', 'Four 45° angles make only 180°. Four equal angles must fill 360°.'],
      ['90°', null],
      ['180°', 'Four 180° angles would be 720°. A full turn is 360°.'],
    ], 'Four equal parts of 360° gives 90° each, which are right angles.'),
  ],
};

const PRE_ORDERED: Prerequisite = {
  id: 'pre-ordered-pairs',
  title: 'Ordered pairs: the order carries meaning',
  why: 'A point is named by two numbers where the first and second have different jobs. Swapping them names a different place.',
  connection: 'Everyday life: row and seat numbers',
  refresher: [
    {
      id: 'cg-pre-seat', title: 'Row first, then seat',
      paragraphs: ['Suppose a cinema ticket says (row 3, seat 5). The row comes first and the seat second. (row 5, seat 3) would be a different seat.', 'Whenever two numbers describe one place, an agreed order tells you which number is which. Coordinates work the same way.'],
      visual: plane({ mode: 'explore', start: P(3, 2), projections: true, range: [0, 6, 0, 6] }, 'A small grid from 0 to 6 with a movable dot. The text below says how far across and how far up it is. Optional demo.'),
      notice: 'Move the dot. The FIRST number is how far across; the SECOND is how far up. Optional: you can skip this.',
    },
  ],
  checks: [
    choice('pre-ord-c1', 'A seat is written (row, seat). Where is (2, 7)?', [
      ['Row 2, seat 7', null],
      ['Row 7, seat 2', 'The first number is the row. (2, 7) means row 2, seat 7. Row 7, seat 2 would be written (7, 2).'],
    ], 'The first number names the row, the second the seat.'),
  ],
};

const PRE_PYTHAGORAS: Prerequisite = {
  id: 'pre-pythagoras',
  title: 'Right triangles and the Pythagoras theorem',
  why: 'The distance between two points is the longest side of a right triangle. You need to know how its sides are linked.',
  connection: 'Earlier grades: squares, square roots, and triangles',
  refresher: [
    {
      id: 'cg-pyth', title: 'The longest side of a right triangle',
      paragraphs: [
        'In a right triangle, the side opposite the right angle is the longest. It is called the hypotenuse.',
        'If the other two sides are a and b, then a² + b² equals the square of the hypotenuse c. The NCERT book calls this the Baudhāyana–Pythagoras Theorem.',
        'For sides 3 and 4: 9 + 16 = 25, and √25 = 5.',
      ],
      why: 'Squares on the two short sides together cover exactly as much area as the square on the long side.',
      check: choice('chk-pyth', 'A right triangle has short sides 6 and 8. What is the hypotenuse?', [
        ['14', '6 + 8 = 14 adds the sides. The rule adds the SQUARES (36 + 64 = 100) and then takes the square root.'],
        ['10', null],
        ['100', '36 + 64 = 100 is the square of the hypotenuse. One more step: take the square root.'],
      ], '36 + 64 = 100 and √100 = 10.'),
    },
  ],
  checks: [
    {
      kind: 'numeric', id: 'pre-pyth-c1', prompt: 'A right triangle has short sides 5 and 12. How long is the hypotenuse?', answer: 13,
      rules: [
        { values: [17], entry: { message: '5 + 12 = 17 adds the sides. Add their squares, 25 + 144, then take the square root.', refresherId: 'cg-pyth', misconception: 'added_legs' } },
        { values: [169], entry: { message: '169 is 25 + 144, the square of the hypotenuse. Take the square root to get its length.', refresherId: 'cg-pyth', misconception: 'forgot_square_root' } },
      ],
      defaultFeedback: { message: 'Use a² + b² = c², then take the square root of c².', refresherId: 'cg-pyth' },
      explanation: '25 + 144 = 169 and √169 = 13.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Units
// ---------------------------------------------------------------------------

const UNITS: EduUnit[] = [
  {
    id: 'cg-u1', number: 1, title: 'Finding a place with two numbers',
    centralIdea: 'Two perpendicular number lines let two numbers name any point on a flat surface.',
    connection: 'It extends the one-dimensional number line you know into two dimensions.',
    vocabulary: [{ term: 'x-axis', meaning: 'the horizontal number line' }, { term: 'y-axis', meaning: 'the vertical number line' }, { term: 'origin', meaning: 'the point (0, 0) where the axes meet' }, { term: 'coordinates', meaning: 'the ordered pair (x, y) that names a point' }],
    discover: ['Every point on the plane has exactly one pair of coordinates.', 'The order of the two numbers matters.'],
    prerequisiteIds: ['pre-number-line', 'pre-directions', 'pre-ordered-pairs'], lessonIds: ['cg-l1', 'cg-l2'],
  },
  {
    id: 'cg-u2', number: 2, title: 'Quadrants and the axes',
    centralIdea: 'The signs of the coordinates tell you which region of the plane a point is in.',
    connection: 'Builds directly on reading and plotting coordinates from Unit 1.',
    vocabulary: [{ term: 'quadrant', meaning: 'one of the four regions the axes cut the plane into' }, { term: 'abscissa and ordinate', meaning: 'older names for the x- and y-coordinate' }],
    discover: ['Which sign pairs belong to which quadrant.', 'Points on an axis have a zero coordinate and belong to no quadrant.'],
    prerequisiteIds: ['pre-number-line', 'pre-ordered-pairs'], lessonIds: ['cg-l3', 'cg-l4'],
  },
  {
    id: 'cg-u3', number: 3, title: 'Distance and midpoint',
    centralIdea: 'Coordinates turn geometry questions about length and halfway points into arithmetic.',
    connection: 'Uses differences on a number line and the Pythagoras theorem to measure with coordinates.',
    vocabulary: [{ term: 'distance', meaning: 'the length of the straight segment between two points' }, { term: 'midpoint', meaning: 'the point halfway along a segment' }],
    discover: ['Distances along a grid line come from subtracting coordinates.', 'A slanted distance is the hypotenuse of a right triangle.', 'The midpoint averages the coordinates.'],
    prerequisiteIds: ['pre-number-line', 'pre-pythagoras'], lessonIds: ['cg-l5', 'cg-l6', 'cg-l7'],
  },
];

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

const L1_A = P(3, 2);
const L1_Q = P(-4, 2);
const L1: EduLesson = {
  id: 'cg-l1', unitId: 'cg-u1', number: 1, title: 'Two number lines make a plane',
  objective: 'explain what the axes and origin are, and say what the two numbers of a point mean.',
  prerequisiteIds: ['pre-number-line', 'pre-directions'],
  steps: [
    {
      id: 'cg-axes', title: 'From one number line to two',
      paragraphs: [
        'One number line can place a point on a line, but a page is flat. We need two numbers, so we use two number lines at right angles.',
        'The horizontal one is the x-axis. The vertical one is the y-axis. They cross at the origin O, which is the zero of both lines.',
        'Going right or up is positive. Going left or down is negative.',
      ],
      vocabulary: [{ term: 'x-axis', meaning: 'the horizontal number line' }, { term: 'y-axis', meaning: 'the vertical number line' }, { term: 'origin O', meaning: 'where they cross, named (0, 0)' }],
      visual: plane({ mode: 'view', points: [{ x: 0, y: 0, label: 'O', color: '#fbbf24' }] }, 'A coordinate plane from −6 to 6 on both axes. The horizontal x-axis and the vertical y-axis cross at the origin O (0, 0).'),
      check: choice('chk-axes', 'Which line is the y-axis?', [
        ['The horizontal line', 'The horizontal line is the x-axis. Think: the y-axis goes up like the letter Y reaches up.'],
        ['The vertical line', null],
      ], 'The y-axis is vertical.'),
    },
    {
      id: 'cg-explore', title: 'Explore: two numbers for every point',
      paragraphs: [
        'Every point gets two numbers: how far ACROSS from the y-axis (the x-coordinate) and how far UP or DOWN from the x-axis (the y-coordinate). We write them as (x, y).',
        'Move the point P with the arrow buttons, the arrow keys, or by dragging it. Watch the two numbers change.',
      ],
      visual: plane({ mode: 'explore', start: P(2, 3), projections: true }, 'A coordinate plane with a movable point P, starting at (2, 3). Dashed lines run from P to each axis. The text below the diagram states its coordinates.'),
      notice: 'The cyan dashed line is the across distance (x). The rose dashed line is the up/down distance (y).',
      check: choice('chk-explore', 'P is at (2, 3). What does the 2 tell you?', [
        ['P is 2 units to the right of the y-axis', null],
        ['P is 2 units above the x-axis', 'That describes the second number. The first number, 2, says how far across; the 3 says how far up.'],
      ], 'The first coordinate is the across distance.'),
    },
  ],
  worked: {
    id: 'w-cg-l1', title: `Reading the coordinates of A`,
    given: ['Point A is shown on the coordinate plane.'],
    ask: 'What are the coordinates of A?',
    visual: plane({ mode: 'view', points: [{ ...L1_A, label: 'A' }], projections: true }, altForPoints('A coordinate plane with', [{ ...L1_A, label: 'A' }])),
    steps: [
      { text: 'Start at the origin O.', why: 'Every coordinate is measured from O.' },
      { text: 'Count across to A: it is 3 units to the right of the y-axis, so x = 3.', why: 'Right of the y-axis is positive.' },
      { text: 'Count up to A: it is 2 units above the x-axis, so y = 2.', why: 'Above the x-axis is positive.' },
      { text: 'Write the pair with x first: A = (3, 2).', why: 'By agreement the across number always comes first.' },
    ],
    verify: 'Walk back from O: 3 right and 2 up lands exactly on A.',
  },
  guided: {
    id: 'g-cg-l1', prompt: 'Now read point Q together. Q is shown on the plane.',
    visual: plane({ mode: 'view', points: [{ ...L1_Q, label: 'Q' }], projections: true }, altForPoints('A coordinate plane with', [{ ...L1_Q, label: 'Q' }])),
    steps: [
      { id: 'g1', prompt: 'First decide the side.', question: choice('g-cg-l1-1', 'Is Q to the left or the right of the y-axis?', [['Left', null], ['Right', 'Look at the diagram: Q is on the side of the y-axis where the numbers are negative.']], 'Q is left of the y-axis.'), hints: ['The y-axis is the vertical line through O.'] },
      { id: 'g2', prompt: 'Now count across.', question: coordinateQ('g-cg-l1-2', L1_Q, 'x', 'Q'), hints: ['Count the squares between Q and the y-axis, then think about the side.'] },
      { id: 'g3', prompt: 'Now count up or down.', question: coordinateQ('g-cg-l1-3', L1_Q, 'y', 'Q'), hints: ['Count the squares between Q and the x-axis.'] },
    ],
    conclusion: `So Q = ${fmtPoint(L1_Q)}: 4 left and 2 up from O.`,
  },
  independent: [
    { id: 'i1', topic: 'Plotting a point from its coordinates', prompt: 'Place a point using its coordinates.', question: plotQ('cg-l1-i1', P(4, 3)), hints: ['Start at O. Do the x move first, then the y move.', 'Both numbers are positive: right, then up.'], solution: ['Start at the origin.', 'x = 4: move 4 units right.', 'y = 3: move 3 units up.'] },
    { id: 'i2', topic: 'Reading a coordinate from a diagram', prompt: 'Read a coordinate.', question: coordinateQ('cg-l1-i2', P(-3, 5), 'y', 'R'), hints: ['The y-coordinate is measured from the x-axis.'], solution: ['R is above the x-axis, so y is positive.', 'Count 5 units up.', 'y = 5.'] },
    { id: 'i3', topic: 'Plotting a point from its coordinates', prompt: 'Place a point with a negative x.', question: plotQ('cg-l1-i3', P(-2, 4)), hints: ['Negative x means left of the y-axis.'], solution: ['Start at the origin.', 'x = −2: 2 units left.', 'y = 4: 4 units up.'] },
  ],
  reflection: {
    discover: 'Every point has two numbers, (x, y): how far across from the y-axis, and how far up or down from the x-axis.',
    evidence: 'You read the coordinates of Q and plotted points by moving across first, then up or down.',
    stillConfusing: [{ text: 'Which number comes first?', refresherId: 'cg-explore' }, { text: 'What do negative numbers mean here?', refresherId: 'cg-nl-sign' }],
  },
};

const L2_PQ = P(1, 6);
const L2: EduLesson = {
  id: 'cg-l2', unitId: 'cg-u1', number: 2, title: 'x first, then y',
  objective: 'plot and read points correctly, and explain why (x, y) and (y, x) usually name different points.',
  prerequisiteIds: ['pre-ordered-pairs'],
  steps: [
    {
      id: 'cg-ord-order', title: 'The order matters',
      paragraphs: [
        'In (3, 5) the first number, 3, is the across distance and the second, 5, is the up distance. In (5, 3) the jobs are swapped, so it is a different point.',
        'The two points only coincide when the numbers are equal, like (4, 4).',
      ],
      visual: plane({ mode: 'view', points: [{ x: 3, y: 5, label: 'A', color: '#22d3ee' }, { x: 5, y: 3, label: 'B', color: '#fb7185' }] }, altForPoints('A coordinate plane showing', [{ x: 3, y: 5, label: 'A' }, { x: 5, y: 3, label: 'B' }]) + ' They are different places.'),
      notice: 'A = (3, 5) is farther up. B = (5, 3) is farther across.',
      misconception: { wrong: '(3, 5) and (5, 3) are the same point, because they use the same numbers.', right: 'The same numbers in a different order give a different point, unless the two numbers are equal.' },
      check: choice('chk-ord', 'Are (2, 4) and (4, 2) the same point?', [
        ['Yes, they use the same numbers', 'Same numbers but a different order: (2, 4) is 2 across and 4 up; (4, 2) is 4 across and 2 up.'],
        ['No, they are different points', null],
      ], 'Different order, different place, because 2 ≠ 4.'),
    },
    {
      id: 'cg-ord-plot', title: 'Plotting: across first, then up or down',
      paragraphs: [
        'To plot (x, y): start at O. Move across x units (right if positive, left if negative). Then move y units up or down. Mark the spot.',
        'Try it: move P to (3, 1). Then to (1, 3). Watch which way P goes.',
      ],
      visual: plane({ mode: 'explore', start: P(3, 1), projections: true }, 'A coordinate plane with a movable point P, starting at (3, 1), with dashed lines to the axes.'),
      why: 'Because the x-axis is measured first, the across move always comes before the up/down move.',
    },
  ],
  worked: {
    id: 'w-cg-l2', title: 'Plotting (5, 2)',
    given: ['The point is (5, 2).'],
    ask: 'Where does this point go on the plane?',
    visual: plane({ mode: 'view', points: [{ x: 5, y: 2, label: 'P' }], projections: true }, altForPoints('A coordinate plane with', [{ x: 5, y: 2, label: 'P' }])),
    steps: [
      { text: 'Start at the origin O.', why: 'All coordinates are measured from O.' },
      { text: 'x = 5: move 5 units to the right along the x-axis.', why: 'The first number is the across distance, and 5 is positive.' },
      { text: 'y = 2: from there, move 2 units up.', why: 'The second number is the up/down distance, and 2 is positive.' },
      { text: 'Mark the point and label it P(5, 2).', why: 'Now the point sits 5 across and 2 up from O.' },
    ],
    verify: 'Reading it back: 5 units from the y-axis and 2 units from the x-axis gives (5, 2).',
  },
  guided: {
    id: 'g-cg-l2', prompt: 'Plot the point (−3, 4) step by step.',
    steps: [
      { id: 'g1', prompt: 'Decide the direction for x.', question: choice('g-cg-l2-1', 'x = −3. Which way do you move from O?', [['3 units left', null], ['3 units right', 'Negative x means left of the y-axis.'], ['3 units up', 'The first number moves you across, not up. Up and down use the second number.']], 'Negative x: left.'), hints: ['Negative means left or down. The first number is across.'] },
      { id: 'g2', prompt: 'Decide the direction for y.', question: choice('g-cg-l2-2', 'y = 4. Which way do you move next?', [['4 units up', null], ['4 units down', 'Positive y means above the x-axis.'], ['4 units left', 'The second number moves you up or down, not left or right.']], 'Positive y: up.'), hints: ['Positive means up.'] },
      { id: 'g3', prompt: 'Now place the point.', question: plotQ('g-cg-l2-3', P(-3, 4)), hints: ['3 left, then 4 up.'] },
    ],
    conclusion: 'The point (−3, 4) is 3 left of the y-axis and 4 above the x-axis.',
  },
  independent: [
    { id: 'i1', topic: 'Coordinate order (x before y)', prompt: 'Place a point whose two numbers are very different.', question: plotQ('cg-l2-i1', L2_PQ), hints: ['x = 1 is a short move. y = 6 is a long one.'], solution: ['x = 1: one unit right.', 'y = 6: six units up.', 'The point is close to the y-axis and high up.'] },
    { id: 'i2', topic: 'Coordinate order (x before y)', prompt: 'Find the point in a picture.', question: readQ('cg-l2-i2', P(2, -3)), hints: ['x = 2 is right of the y-axis. y = −3 is below the x-axis.'], solution: ['x = 2: 2 units to the right.', 'y = −3: 3 units down.', 'Check which labelled point is right and below.'] },
    { id: 'i3', topic: 'Plotting with negative coordinates', prompt: 'Place a point with a negative x.', question: plotQ('cg-l2-i3', P(-4, 3)), hints: ['Negative x: left.'], solution: ['x = −4: 4 left.', 'y = 3: 3 up.'] },
  ],
  reflection: {
    discover: 'The order of the coordinates is a rule: x comes first, y second, and swapping them gives another point unless the numbers are equal.',
    evidence: 'You plotted points where the two numbers were different and picked the right one among look-alikes.',
    stillConfusing: [{ text: 'Why does the order matter?', refresherId: 'cg-ord-order' }],
  },
};

const L3_W = P(-4, -2);
const L3_G = P(5, -3);
const L3: EduLesson = {
  id: 'cg-l3', unitId: 'cg-u2', number: 3, title: 'Signs tell the region',
  objective: 'name the quadrant of a point from the signs of its coordinates.',
  prerequisiteIds: ['pre-number-line'],
  steps: [
    {
      id: 'cg-q-signs', title: 'Four quadrants, four sign patterns',
      paragraphs: [
        'The axes cut the plane into four regions called quadrants. They are numbered I, II, III, IV, going counter-clockwise from the top right.',
        'In Quadrant I both coordinates are positive (+, +). In II it is (−, +). In III it is (−, −). In IV it is (+, −).',
      ],
      visual: plane({ mode: 'view', quadrants: true }, 'A coordinate plane with four shaded regions: Quadrant I top right (+, +), II top left (−, +), III bottom left (−, −), IV bottom right (+, −).'),
      check: choice('chk-q', 'A point has x negative and y positive. Which quadrant?', [
        ['I', 'Quadrant I has BOTH positive. Here x is negative.'],
        ['II', null],
        ['III', 'Quadrant III has both negative. Here y is positive.'],
        ['IV', 'Quadrant IV is (+, −), the other way round.'],
      ], 'Negative x (left) and positive y (up) is the top-left region, Quadrant II.'),
    },
    {
      id: 'cg-q-explore', title: 'Explore: the region follows the signs',
      paragraphs: ['Move P around. The text under the diagram tells you the region. Notice that the region only changes when P crosses an axis.', 'A point on an axis is in no quadrant.'],
      visual: plane({ mode: 'explore', start: P(-2, 3), quadrants: true, projections: false }, 'A coordinate plane with shaded quadrants and a movable point P starting at (−2, 3). The text under the diagram names the region P is in.'),
      misconception: { wrong: 'A point on the axis, like (3, 0), is in Quadrant I.', right: 'Axis points have a zero coordinate and belong to no quadrant.' },
    },
  ],
  worked: {
    id: 'w-cg-l3', title: 'Which quadrant is W?',
    given: [`W = ${fmtPoint(L3_W)}`],
    ask: 'In which quadrant does W lie?',
    visual: plane({ mode: 'view', points: [{ ...L3_W, label: 'W' }], quadrants: true, projections: false }, altForPoints('A coordinate plane with quadrants and', [{ ...L3_W, label: 'W' }])),
    steps: [
      { text: 'The x-coordinate is −4, which is negative.', why: 'Negative x means W is left of the y-axis.' },
      { text: 'The y-coordinate is −2, which is negative.', why: 'Negative y means W is below the x-axis.' },
      { text: 'Left and below is the bottom-left region.', why: 'The bottom-left region has signs (−, −).' },
    ],
    verify: 'W is in Quadrant III, and the diagram agrees.',
  },
  guided: {
    id: 'g-cg-l3', prompt: `Find the quadrant of G = ${fmtPoint(L3_G)}.`,
    visual: plane({ mode: 'view', points: [{ ...L3_G, label: 'G' }], quadrants: true, projections: false }, altForPoints('A coordinate plane with quadrants and', [{ ...L3_G, label: 'G' }])),
    steps: [
      { id: 'g1', prompt: 'Look at x.', question: choice('g-cg-l3-1', 'Is the x-coordinate of G positive or negative?', [['Positive', null], ['Negative', 'G is to the right of the y-axis, so x is positive (5).']], 'x = 5 is positive.'), hints: ['Which side of the y-axis is G on?'] },
      { id: 'g2', prompt: 'Look at y.', question: choice('g-cg-l3-2', 'Is the y-coordinate of G positive or negative?', [['Negative', null], ['Positive', 'G is below the x-axis, so y is negative (−3).']], 'y = −3 is negative.'), hints: ['Is G above or below the x-axis?'] },
      { id: 'g3', prompt: 'Combine.', question: quadrantQ('g-cg-l3-3', L3_G, 'G'), hints: ['Signs (+, −): which quadrant?'] },
    ],
    conclusion: 'G has signs (+, −), so it lies in Quadrant IV.',
  },
  independent: [
    { id: 'i1', topic: 'Quadrants from signs', prompt: 'Name the quadrant.', question: quadrantQ('cg-l3-i1', P(-2, -5), 'A'), hints: ['Write the two signs.'], solution: ['x = −2 is negative.', 'y = −5 is negative.', '(−, −) is Quadrant III.'] },
    { id: 'i2', topic: 'Quadrants from signs', prompt: 'Name the quadrant.', question: quadrantQ('cg-l3-i2', P(3, -4), 'B'), hints: ['Right of the y-axis, below the x-axis.'], solution: ['x = 3 positive, y = −4 negative.', '(+, −) is Quadrant IV.'] },
    { id: 'i3', topic: 'Quadrants from signs', prompt: 'Name the quadrant.', question: quadrantQ('cg-l3-i3', P(-5, 1), 'C'), hints: ['Negative x, positive y.'], solution: ['x = −5 negative, y = 1 positive.', '(−, +) is Quadrant II.'] },
  ],
  reflection: {
    discover: 'The quadrant comes from the pair of signs: I (+, +), II (−, +), III (−, −), IV (+, −).',
    evidence: 'You named quadrants by reading the signs, not by guessing from the picture.',
    stillConfusing: [{ text: 'What if a coordinate is 0?', refresherId: 'cg-q-explore' }],
  },
};

const L4: EduLesson = {
  id: 'cg-l4', unitId: 'cg-u2', number: 4, title: 'Points on the axes',
  objective: 'recognise points on an axis from a zero coordinate and find a point’s distance from each axis.',
  prerequisiteIds: ['pre-number-line'],
  steps: [
    {
      id: 'cg-ax-points', title: 'A zero coordinate puts a point on an axis',
      paragraphs: ['A point on the x-axis is zero units above or below it, so its y-coordinate is 0: it looks like (x, 0). A point on the y-axis has x = 0: (0, y).', 'The origin is on both axes: (0, 0). None of these points lie in a quadrant.'],
      visual: plane({ mode: 'view', points: [{ x: 4, y: 0, label: 'B', color: '#22d3ee' }, { x: 0, y: -4, label: 'G', color: '#fb7185' }, { x: 0, y: 0, label: 'O' }] }, altForPoints('A coordinate plane with', [{ x: 4, y: 0, label: 'B' }, { x: 0, y: -4, label: 'G' }, { x: 0, y: 0, label: 'O' }])),
      check: choice('chk-axp', 'Which of these points is on the y-axis?', [['(5, 0)', '(5, 0) has y = 0, so it is on the x-axis.'], ['(0, 5)', null], ['(5, 5)', 'Neither coordinate is 0, so (5, 5) is inside a quadrant.']], 'x = 0 puts a point on the y-axis.'),
    },
    {
      id: 'cg-ax-dist', title: 'How far from each axis?',
      paragraphs: ['The distance of a point from the y-axis is the size of its x-coordinate. The distance from the x-axis is the size of its y-coordinate.', 'A distance has no sign: (−4, 3) is 4 units from the y-axis and 3 units from the x-axis.'],
      visual: plane({ mode: 'explore', start: P(-4, 3), projections: true }, 'A coordinate plane with a movable point P starting at (−4, 3), joined to both axes by dashed lines.'),
      notice: 'The cyan line to the y-axis has length |x|. The rose line to the x-axis has length |y|.',
      misconception: { wrong: 'The distance of (−4, 3) from the x-axis is 4.', right: 'Distance from the x-axis is the size of y, here 3. Distance from the y-axis is the size of x, here 4.' },
    },
  ],
  worked: {
    id: 'w-cg-l4', title: 'Distance of (−5, 2) from the axes',
    given: ['P = (−5, 2)'],
    ask: 'How far is P from the x-axis, and from the y-axis?',
    visual: plane({ mode: 'view', points: [{ x: -5, y: 2, label: 'P' }], projections: true }, altForPoints('A coordinate plane with', [{ x: -5, y: 2, label: 'P' }]) + ' Dashed lines join it to each axis.'),
    steps: [
      { text: 'Distance from the x-axis is the size of the y-coordinate: |2| = 2.', why: 'The x-axis is the line y = 0, and P is 2 units above it.' },
      { text: 'Distance from the y-axis is the size of the x-coordinate: |−5| = 5.', why: 'The y-axis is the line x = 0, and P is 5 units to its left.' },
    ],
    verify: 'The sign only tells the side (left of the y-axis). The distance itself is 5.',
  },
  guided: {
    id: 'g-cg-l4', prompt: 'Find how far Q = (6, −3) is from each axis.',
    steps: [
      { id: 'g1', prompt: 'The x-axis first.', question: axisDistanceQ('g-cg-l4-1', P(6, -3), 'x-axis', 'Q'), hints: ['Which coordinate measures up and down?'] },
      { id: 'g2', prompt: 'Now the y-axis.', question: axisDistanceQ('g-cg-l4-2', P(6, -3), 'y-axis', 'Q'), hints: ['Which coordinate measures across?'] },
    ],
    conclusion: 'Q is 3 units from the x-axis and 6 units from the y-axis.',
  },
  independent: [
    { id: 'i1', topic: 'Distance from an axis', prompt: 'Find a distance from the x-axis.', question: axisDistanceQ('cg-l4-i1', P(-4, 3), 'x-axis', 'A'), hints: ['Look at y.'], solution: ['The distance from the x-axis is |y|.', '|3| = 3.'] },
    { id: 'i2', topic: 'Distance from an axis', prompt: 'Find a distance from the y-axis.', question: axisDistanceQ('cg-l4-i2', P(2, -6), 'y-axis', 'B'), hints: ['Look at x.'], solution: ['The distance from the y-axis is |x|.', '|2| = 2.'] },
    {
      id: 'i3', topic: 'Points on the axes', prompt: 'Decide where a point lies.',
      question: choice('cg-l4-i3', 'Where is the point (0, −3)?', [['Quadrant III', 'Quadrant III needs BOTH coordinates negative. Here x is 0.'], ['On the y-axis', null], ['On the x-axis', 'On the x-axis y would be 0. Here x is the one that is 0.']], 'x = 0 means the point is on the y-axis, 3 units below the origin.', plane({ mode: 'view', points: [{ x: 0, y: -3, label: 'D' }] }, altForPoints('A coordinate plane with', [{ x: 0, y: -3, label: 'D' }])), { o0: { misconception: 'axis_vs_quadrant' }, o2: { misconception: 'axis_swapped' } }),
      hints: ['Which coordinate is zero?'], solution: ['x = 0, so the point is on the y-axis.', 'y = −3, so it is 3 units below O.'],
    },
  ],
  reflection: {
    discover: 'A zero coordinate puts a point on an axis, and a point’s distance from an axis is the size of the other coordinate.',
    evidence: 'You told apart distance from the x-axis (|y|) and from the y-axis (|x|).',
    stillConfusing: [{ text: 'Which coordinate gives which distance?', refresherId: 'cg-ax-dist' }],
  },
};

const L5: EduLesson = {
  id: 'cg-l5', unitId: 'cg-u3', number: 5, title: 'Distance along a grid line',
  objective: 'find the distance between two points that share an x- or y-coordinate.',
  prerequisiteIds: ['pre-number-line'],
  steps: [
    {
      id: 'cg-gd', title: 'Same row or same column',
      paragraphs: ['If two points have the same y-coordinate they lie on one horizontal line. The distance between them is the size of the difference of their x-coordinates: |x₂ − x₁|.', 'If they have the same x-coordinate, use the y-coordinates: |y₂ − y₁|.'],
      visual: plane({ mode: 'view', points: [{ x: -3, y: 2, label: 'A', color: '#22d3ee' }, { x: 4, y: 2, label: 'B', color: '#fb7185' }], segment: true }, altForPoints('A coordinate plane with', [{ x: -3, y: 2, label: 'A' }, { x: 4, y: 2, label: 'B' }]) + ' They are on one horizontal line, 7 units apart.'),
      notice: 'From −3 to 0 is 3 steps, and from 0 to 4 is 4 more: 7 in all.',
      why: 'Taking the size of the difference works for points on either side of zero, because |4 − (−3)| = |7| = 7.',
      check: choice('chk-gd', 'The points (1, 5) and (6, 5) share y = 5. How far apart are they?', [['11', '1 + 6 adds the coordinates. Both points are on the same side of 0, so subtract: 6 − 1.'], ['5', null], ['6', '6 is just one of the coordinates. Subtract: 6 − 1.']], '6 − 1 = 5.'),
    },
    {
      id: 'cg-gd-explore', title: 'Explore: move the points',
      paragraphs: ['Move A and B. When they share a y-coordinate, the vertical side is 0 and the distance is just the horizontal side.', 'Try making them share an x-coordinate instead.'],
      visual: plane({ mode: 'distance', a: P(-3, 2), b: P(4, 2), legs: true }, 'A coordinate plane with two movable points A and B and a segment between them. The sides of the right triangle on that segment are labelled.'),
    },
  ],
  worked: {
    id: 'w-cg-l5', title: 'Distance between (−3, 2) and (4, 2)',
    given: ['A = (−3, 2)', 'B = (4, 2)'],
    ask: 'How far apart are A and B?',
    visual: plane({ mode: 'view', points: [{ x: -3, y: 2, label: 'A', color: '#22d3ee' }, { x: 4, y: 2, label: 'B', color: '#fb7185' }], segment: true }, altForPoints('A coordinate plane with', [{ x: -3, y: 2, label: 'A' }, { x: 4, y: 2, label: 'B' }])),
    steps: [
      { text: 'Both points have y = 2, so they are on one horizontal line.', why: 'Then only the x-coordinates differ.' },
      { text: 'Subtract the x-coordinates: 4 − (−3) = 7.', why: 'Subtracting a negative adds, matching the 3 + 4 steps either side of 0.' },
      { text: 'The distance is |7| = 7 units.', why: 'A distance is never negative.' },
    ],
    verify: 'Counting grid squares from A to B also gives 7.',
  },
  guided: {
    id: 'g-cg-l5', prompt: 'Find the distance between C = (−5, −2) and D = (−1, −2).',
    steps: [
      { id: 'g1', prompt: 'Which line are they on?', question: choice('g-cg-l5-1', 'Both points have y = −2. So C and D lie on a:', [['horizontal line', null], ['vertical line', 'A vertical line would keep x the same. Here it is y that is the same.']], 'Same y: a horizontal line.'), hints: ['Which coordinate is shared?'] },
      { id: 'g2', prompt: 'Now the distance.', question: gridDistanceQ('g-cg-l5-2', P(-5, -2), P(-1, -2)), hints: ['Subtract the x-coordinates and take the size.'] },
    ],
    conclusion: 'CD = |−1 − (−5)| = 4 units.',
  },
  independent: [
    { id: 'i1', topic: 'Distance on a horizontal line', prompt: 'One point on each side of the y-axis.', question: gridDistanceQ('cg-l5-i1', P(-2, 3), P(5, 3)), hints: ['They are on opposite sides of 0.'], solution: ['Same y, so horizontal.', '|5 − (−2)| = 7.'] },
    { id: 'i2', topic: 'Distance on a vertical line', prompt: 'Same x this time.', question: gridDistanceQ('cg-l5-i2', P(2, -4), P(2, 3)), hints: ['Use the y-coordinates.'], solution: ['Same x, so vertical.', '|3 − (−4)| = 7.'] },
    { id: 'i3', topic: 'Distance on a horizontal line', prompt: 'Both points on the same side.', question: gridDistanceQ('cg-l5-i3', P(-6, -1), P(-2, -1)), hints: ['Same side of 0: subtract the smaller size from the larger.'], solution: ['|−2 − (−6)| = 4.'] },
  ],
  reflection: {
    discover: 'Along a horizontal or vertical line the distance is the size of the difference of the coordinates that change.',
    evidence: 'You found distances for points on opposite sides of zero without mixing up the signs.',
    stillConfusing: [{ text: 'Why do points on opposite sides add up?', refresherId: 'cg-nl-dist' }],
  },
};

const L6_A = P(1, 1);
const L6_B = P(4, 5);
const L6: EduLesson = {
  id: 'cg-l6', unitId: 'cg-u3', number: 6, title: 'Distance between any two points',
  objective: 'find the distance between two points by building a right triangle and using the Pythagoras theorem.',
  prerequisiteIds: ['pre-pythagoras'],
  steps: [
    {
      id: 'cg-dist-triangle', title: 'Slanted segment, right triangle',
      paragraphs: ['If two points are not on a grid line, draw a horizontal line from one and a vertical line from the other. They meet and form a right triangle. The segment you want is its hypotenuse.', 'The horizontal side has length |x₂ − x₁| and the vertical side |y₂ − y₁|, using the idea from the last lesson.'],
      visual: plane({ mode: 'distance', a: L6_A, b: L6_B, legs: true }, `A coordinate plane with movable points A and B, starting at ${fmtPoint(L6_A)} and ${fmtPoint(L6_B)}. A right triangle is drawn on the segment AB with its two shorter sides labelled.`),
      notice: 'The labels show the two short sides. Drag B and watch them, and AB, change together.',
      check: choice('chk-dist-tri', 'A(1, 1) and B(4, 5): what are the two short sides of the triangle?', [['3 and 4', null], ['5 and 6', '5 and 6 are sums (1 + 4 and 1 + 5). The sides come from differences: 4 − 1 and 5 − 1.'], ['4 and 5', 'Those are the coordinates of B alone. Subtract A’s from B’s: 4 − 1 and 5 − 1.']], 'Across 4 − 1 = 3 and up 5 − 1 = 4.'),
    },
    {
      id: 'cg-dist-formula', title: 'The distance rule',
      paragraphs: ['By the Pythagoras theorem (the NCERT book calls it the Baudhāyana–Pythagoras Theorem), AB² = (x₂ − x₁)² + (y₂ − y₁)².', 'So AB = √[(x₂ − x₁)² + (y₂ − y₁)²]. For A(1, 1) and B(4, 5): 3² + 4² = 25, so AB = 5.'],
      why: 'Squaring removes signs, so it does not matter which point you call first.',
      misconception: { wrong: 'AB = 3 + 4 = 7.', right: 'Walking around the corner is 7, but the straight segment is shorter: √(3² + 4²) = 5.' },
    },
  ],
  investigation: { title: 'Try it in the Distance Laboratory', description: 'Place your own points in the free workbench and compare its measured distance with the calculation you did by hand.', href: '/mathematics/workbench?module=coordinate-geometry&experiment=distance', buttonLabel: 'Open the Distance experiment' },
  worked: {
    id: 'w-cg-l6', title: 'Distance from (1, 1) to (4, 5)',
    given: [`A = ${fmtPoint(L6_A)}`, `B = ${fmtPoint(L6_B)}`],
    ask: 'Find AB.',
    visual: plane({ mode: 'view', points: [{ ...L6_A, label: 'A', color: '#22d3ee' }, { ...L6_B, label: 'B', color: '#fb7185' }], segment: true }, altForPoints('A coordinate plane with', [{ ...L6_A, label: 'A' }, { ...L6_B, label: 'B' }]) + ' A segment joins them.'),
    steps: [
      { text: 'Across: |4 − 1| = 3.', why: 'This is the horizontal side of the right triangle.' },
      { text: 'Up: |5 − 1| = 4.', why: 'This is the vertical side.' },
      { text: 'Square and add: 3² + 4² = 9 + 16 = 25.', why: 'The Pythagoras theorem gives the square of the hypotenuse.' },
      { text: 'Take the square root: AB = √25 = 5.', why: 'We want the length itself, not its square.' },
    ],
    verify: 'The segment is longer than each short side (5 > 4) but shorter than their sum (5 < 7), as it must be.',
  },
  guided: {
    id: 'g-cg-l6', prompt: 'Find the distance between E = (−2, 1) and F = (2, 4).',
    visual: plane({ mode: 'view', points: [{ x: -2, y: 1, label: 'E', color: '#22d3ee' }, { x: 2, y: 4, label: 'F', color: '#fb7185' }], segment: true }, altForPoints('A coordinate plane with', [{ x: -2, y: 1, label: 'E' }, { x: 2, y: 4, label: 'F' }]) + ' A segment joins them.'),
    steps: [
      { id: 'g1', prompt: 'The horizontal side.', question: legQ('g-cg-l6-1', P(-2, 1), P(2, 4), 'dx'), hints: ['|2 − (−2)|'] },
      { id: 'g2', prompt: 'The vertical side.', question: legQ('g-cg-l6-2', P(-2, 1), P(2, 4), 'dy'), hints: ['|4 − 1|'] },
      { id: 'g3', prompt: 'Put it together.', question: distanceQ('g-cg-l6-3', P(-2, 1), P(2, 4)), hints: ['4² + 3² = 25, then the square root.'] },
    ],
    conclusion: 'EF = √(4² + 3²) = √25 = 5 units.',
  },
  independent: [
    { id: 'i1', topic: 'Distance formula', prompt: 'One point is the origin.', question: distanceQ('cg-l6-i1', P(0, 0), P(6, 8)), hints: ['The sides are just 6 and 8.'], solution: ['6² + 8² = 36 + 64 = 100.', '√100 = 10.'] },
    { id: 'i2', topic: 'Distance formula', prompt: 'Points in different quadrants.', question: distanceQ('cg-l6-i2', P(-3, -1), P(2, 11)), hints: ['Across 5 and up 12.'], solution: ['Across: |2 − (−3)| = 5.', 'Up: |11 − (−1)| = 12.', '25 + 144 = 169, √169 = 13.'] },
    { id: 'i3', topic: 'Distance with a square root that is not whole', prompt: 'Give your answer to 2 decimal places.', question: distanceQ('cg-l6-i3', P(0, 0), P(2, 3), 2), hints: ['2² + 3² = 13. A calculator gives √13.'], solution: ['4 + 9 = 13.', '√13 ≈ 3.61.'] },
  ],
  reflection: {
    discover: 'The distance between two points is the hypotenuse of a right triangle whose short sides are the coordinate differences.',
    evidence: 'You turned a slanted segment into two grid-line distances and used the Pythagoras theorem.',
    stillConfusing: [{ text: 'Why add squares, not lengths?', refresherId: 'cg-pyth' }, { text: 'What if one difference is negative?', refresherId: 'cg-dist-formula' }],
  },
};

const L7: EduLesson = {
  id: 'cg-l7', unitId: 'cg-u3', number: 7, title: 'The midpoint',
  objective: 'find the midpoint of a segment from its end-points and use it to find a missing end-point.',
  prerequisiteIds: ['pre-number-line'],
  steps: [
    {
      id: 'cg-mid', title: 'Halfway means the average',
      paragraphs: ['The midpoint M of a segment is halfway between the end-points. Halfway in x is the average of the two x-coordinates; halfway in y is the average of the y-coordinates.', 'For A(2, 1) and B(8, 7): x is (2 + 8) ÷ 2 = 5, y is (1 + 7) ÷ 2 = 4, so M = (5, 4).'],
      visual: plane({ mode: 'distance', a: P(2, 1), b: P(8, 7), legs: false, midpoint: true, range: [-1, 9, -1, 9] }, 'A coordinate plane with movable points A and B starting at (2, 1) and (8, 7) and their midpoint marked in green on the segment.'),
      notice: 'The green dot is always the same distance from A as from B.',
      misconception: { wrong: 'To find the midpoint, subtract the coordinates and halve.', right: 'Subtracting gives how far apart they are. The midpoint adds the coordinates and halves.' },
      check: choice('chk-mid', 'What is the midpoint of the numbers 2 and 8 on a number line?', [['6', '6 is 8 − 2, the gap between them. Halfway needs the average: (2 + 8) ÷ 2.'], ['5', null], ['10', '10 is the sum. Halve it to find the number halfway between.']], '(2 + 8) ÷ 2 = 5.'),
    },
  ],
  worked: {
    id: 'w-cg-l7', title: 'Midpoint of (2, 1) and (8, 7)',
    given: ['A = (2, 1)', 'B = (8, 7)'],
    ask: 'Find the midpoint M.',
    visual: plane({ mode: 'view', points: [{ x: 2, y: 1, label: 'A', color: '#22d3ee' }, { x: 8, y: 7, label: 'B', color: '#fb7185' }], segment: true, midpoint: true, range: [-1, 9, -1, 9] }, altForPoints('A coordinate plane with', [{ x: 2, y: 1, label: 'A' }, { x: 8, y: 7, label: 'B' }]) + ' Their midpoint is marked.'),
    steps: [
      { text: 'x-coordinate of M: (2 + 8) ÷ 2 = 5.', why: 'The number halfway between 2 and 8 is their average.' },
      { text: 'y-coordinate of M: (1 + 7) ÷ 2 = 4.', why: 'The same idea works for y.' },
      { text: 'So M = (5, 4).', why: 'M is halfway across and halfway up.' },
    ],
    verify: 'From A to M is 3 across and 3 up; from M to B is also 3 across and 3 up, so M is halfway.',
  },
  guided: {
    id: 'g-cg-l7', prompt: 'Find the midpoint of A = (−4, 2) and B = (2, −6).',
    steps: [
      { id: 'g1', prompt: 'The x-coordinate.', question: midpointQ('g-cg-l7-1', P(-4, 2), P(2, -6), 'x'), hints: ['Add −4 and 2, then halve.'] },
      { id: 'g2', prompt: 'The y-coordinate.', question: midpointQ('g-cg-l7-2', P(-4, 2), P(2, -6), 'y'), hints: ['Add 2 and −6, then halve.'] },
    ],
    conclusion: 'M = (−1, −2).',
  },
  independent: [
    { id: 'i1', topic: 'Midpoint', prompt: 'Find the x-coordinate of the midpoint.', question: midpointQ('cg-l7-i1', P(-6, -2), P(4, 8), 'x'), hints: ['Add, then halve.'], solution: ['(−6 + 4) ÷ 2 = −1.'] },
    { id: 'i2', topic: 'Midpoint', prompt: 'Find the y-coordinate of the midpoint.', question: midpointQ('cg-l7-i2', P(-6, -2), P(4, 8), 'y'), hints: ['Add, then halve.'], solution: ['(−2 + 8) ÷ 2 = 3.'] },
    {
      id: 'i3', topic: 'Midpoint', prompt: 'Work backwards.',
      question: {
        kind: 'numeric', id: 'cg-l7-i3', prompt: 'M = (1, 2) is the midpoint of A = (−3, 0) and B = (x, y). What is x?', answer: 5,
        rules: [
          { values: [-1], entry: { message: '−1 averages A’s x with M’s x. M is the average of A and B: (−3 + x) ÷ 2 = 1.', refresherId: 'cg-mid', misconception: 'backwards_midpoint' } },
          { values: [2], entry: { message: '2 doubles M’s x only. Use (−3 + x) ÷ 2 = 1, so −3 + x = 2.', refresherId: 'cg-mid', misconception: 'backwards_midpoint' } },
        ],
        defaultFeedback: { message: 'Write (−3 + x) ÷ 2 = 1, then solve for x.', refresherId: 'cg-mid' }, explanation: '−3 + x = 2, so x = 5.',
      },
      hints: ['Doubling the midpoint’s x gives the sum of the two end-points’ x-coordinates.'], solution: ['(−3 + x) ÷ 2 = 1.', '−3 + x = 2.', 'x = 5.'],
    },
  ],
  reflection: {
    discover: 'The midpoint’s coordinates are the averages of the end-points’ coordinates.',
    evidence: 'You found a midpoint, and worked backwards from a midpoint to a missing end-point.',
    stillConfusing: [{ text: 'Why average, not subtract?', refresherId: 'cg-mid' }],
  },
};

const LESSON_LIST = [L1, L2, L3, L4, L5, L6, L7];

import { CG_ASSESSMENT } from './assessment';

export const COORDINATE_GEOMETRY: EduChapter = {
  assessment: CG_ASSESSMENT,
  id: 'coordinate-geometry',
  title: 'Coordinate Geometry',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part I, Chapter 1 (sections 1.3 and 1.4 and the chapter summary). Explanations and questions are original; none are copied from the textbook.',
  purpose: 'Coordinates are a way of describing where things are with numbers. By the end you can name any point on a flat surface, tell which region it is in, and calculate distances and halfway points without measuring.',
  learn: ['What the axes and origin are', 'How (x, y) names a point', 'Quadrants and points on the axes', 'Distance between two points', 'The midpoint of a segment'],
  realWorld: ['Reading a map grid', 'Locating a pixel on a screen', 'Planning routes and distances', 'Designing games and drawings'],
  outcomes: ['Plot and read any point', 'Name the quadrant from signs', 'Find distances with the Pythagoras theorem', 'Find a midpoint'],
  prerequisiteIds: ['pre-number-line', 'pre-directions', 'pre-ordered-pairs'],
  units: UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries([PRE_NUMBER_LINE, PRE_DIRECTIONS, PRE_ORDERED, PRE_PYTHAGORAS].map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/coordinate-geometry',
    learn: (id) => `/mathematics/coordinate-geometry/learn/${id}`,
    prerequisites: (id) => `/mathematics/coordinate-geometry#${id}`,
    lab: '/mathematics/workbench?module=coordinate-geometry&experiment=distance',
    practice: '/mathematics/coordinate-geometry/practice',
    assessment: '/mathematics/coordinate-geometry/assessment',
  },
};

