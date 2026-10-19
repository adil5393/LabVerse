/**
 * Two Variables, One Line: Learn lessons 4 to 7 (EDU-1M5): from table to graph,
 * solutions that make sense in a story, slope, and y = mx + d. Textbook
 * Sections 13.2.2, 13.3.1 and 13.3.2. Wording, figures and questions are original.
 */

import type { EduLesson } from '../../../education/types';
import { LAB } from './lessonsA';
import { ind, numQ, ord, pick, tvVisual } from './questions';

const lab = (description: string) => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

// ---------------------------------------------------------------------------
// Lesson 4: From a table to a graph  (13.2.2)
// ---------------------------------------------------------------------------

const PLANE_FOUR = [{ id: 'A', x: -2, y: 3 }, { id: 'B', x: 3, y: -2 }, { id: 'C', x: 2, y: 3 }, { id: 'D', x: -3, y: -2 }];

export const L4: EduLesson = {
  id: 'tv-l4', unitId: 'tunit-3', number: 4, title: 'From a table to a graph',
  objective: 'build a table of solutions, plot them as points, and see that the solutions fall on a line and that points off the line are not solutions.',
  prerequisiteIds: ['tp-plane', 'tp-equations'],
  objectives: [
    { id: 'table', label: 'Complete a table of solutions' },
    { id: 'plot', label: 'Place and read points' },
    { id: 'online', label: 'Decide whether a point is on the line' },
  ],
  steps: [
    {
      id: 't4-table', title: 'Equation → solutions → table', phase: 'observe',
      paragraphs: ['Take x + 2y = 6. Choose a value for x, then work out y. With x = 0: 2y = 6 so y = 3. With x = 2: 2 + 2y = 6 so y = 2. Each row of the table is one solution (x, y).'],
      visual: tvVisual({ mode: 'line', eq: [1, 2, -6], table: [0, 2, 4, 6], extent: 8, edit: 'none' }, 'A table of solutions of x + 2y = 6.'),
      notice: 'Change an x in the table. The y is recomputed from the equation, and its point moves on the graph.',
      check: pick('chk-t4-table', 'In x + 2y = 6 you choose x = −2. What is y?', [
        ['4', null],
        ['2', 'That is the y for x = 2. For x = −2: −2 + 2y = 6, so 2y = 8 and y = 4.', 'sign_error'],
        ['−4', 'Check: −2 + 2 × (−4) = −10, not 6. Solve −2 + 2y = 6 for y: 2y = 8, y = 4.', 'sign_error'],
      ], '−2 + 2y = 6, so y = 4.', undefined, 't4-table'),
    },
    {
      id: 't4-plot', title: 'Solutions are points', phase: 'observe',
      paragraphs: [
        'Each solution (x, y) is a point on the coordinate plane: go x along the x-axis, then y up or down. The solutions (0, 3), (2, 2), (4, 1) and (6, 0) of x + 2y = 6 are plotted below, each labelled with its pair.',
      ],
      visual: tvVisual({ mode: 'plane', points: [{ id: 'P', x: 0, y: 3 }, { id: 'Q', x: 2, y: 2 }, { id: 'R', x: 4, y: 1 }, { id: 'S', x: 6, y: 0 }], extent: 7, movePoint: false }, 'The points (0, 3), (2, 2), (4, 1) and (6, 0) on the coordinate plane.'),
      notice: 'What do you see about where the four points lie?',
      check: pick('chk-t4-plot', 'To plot (4, 1), how do you move from the origin?', [
        ['4 to the right, then 1 up.', null],
        ['1 to the right, then 4 up.', 'x comes first: the first number moves along the x-axis. 4 right, then 1 up.', 'swapped_coordinates'],
        ['4 up, then 1 to the left.', 'Positive x means right and positive y means up.', 'direction_error'],
      ], 'x is horizontal, y is vertical.', undefined, 't4-plot'),
    },
    {
      id: 't4-line', title: 'The graph is a line', phase: 'conjecture',
      paragraphs: [
        'The four points lie along one straight line. Join them and extend the line in both directions. The textbook shows that every solution of an equation like this lies on the line and every point of the line is a solution.',
        'So a point ON the line satisfies the equation; a point OFF the line does not. Move the test point below on and off the line and watch the check.',
      ],
      visual: tvVisual({ mode: 'line', eq: [1, 2, -6], point: [5, 2], extent: 8, edit: 'none' }, 'The line x + 2y = 6 with a test point you can move on and off the line.'),
      notice: 'Which test points are on the line, and what does the check say for them?',
      check: pick('chk-t4-line', '(5, 2) is not on the line x + 2y = 6. Is it a solution?', [
        ['No: 5 + 2 × 2 = 9, not 6.', null],
        ['Yes: every point of the plane is a solution.', 'Only points ON the line are solutions. Substituting (5, 2) gives 9, not 6.', 'every_point_solution'],
      ], 'Points off the line do not satisfy the equation.', undefined, 't4-line'),
    },
    {
      id: 't4-origin', title: 'Where the line meets the axes', phase: 'reasoning',
      paragraphs: [
        'Put x = 0 to find where the line crosses the y-axis, and y = 0 for the x-axis. For x + 2y = 6: x = 0 gives (0, 3); y = 0 gives (6, 0).',
        'If c = 0, as in 2x + 3y = 0, then x = 0 and y = 0 satisfy the equation, so the line passes through the origin. This is true for every equation with c = 0. Change c in the figure to see the line move away from the origin.',
      ],
      visual: tvVisual({ mode: 'line', eq: [2, 3, 0], edit: 'abc', showIntercepts: true, extent: 8 }, 'The line 2x + 3y = 0 through the origin, with a, b and c you can change.'),
      notice: 'Which value of c puts the line through the origin?',
      check: pick('chk-t4-origin', 'Does the line 2x + 3y = 0 pass through the origin (0, 0)?', [
        ['Yes: 2 × 0 + 3 × 0 = 0.', null],
        ['No: lines only pass through the origin when x = y.', 'The origin is on the line when (0, 0) satisfies the equation. 0 = 0 here.', 'origin_confusion'],
      ], 'Substitute (0, 0).', undefined, 't4-origin'),
    },
  ],
  investigation: lab('Draw x + 2y = 6 in the free laboratory and drag a point along the line.'),
  worked: {
    id: 'w-tv-l4', title: 'Graphing x + 2y = 6',
    given: ['The equation x + 2y = 6.'], ask: 'Find two solutions, plot them, and decide whether (2, 2) is on the graph.',
    steps: [
      { text: 'Put x = 0: 2y = 6, so y = 3. The pair is (0, 3).', why: 'Choose x, then solve the one-variable equation for y.' },
      { text: 'Put y = 0: x = 6. The pair is (6, 0).', why: 'The same idea with y chosen first.' },
      { text: 'Plot (0, 3) and (6, 0) and draw the line through them.', why: 'Two points fix a straight line; the graph of a linear equation is a line.' },
      { text: 'Test (2, 2): 2 + 2 × 2 = 6. It satisfies the equation, so it is on the line.', why: 'A point is on the line exactly when it satisfies the equation.' },
    ],
    verify: 'Reading the graph at x = 2 gives y = 2, matching the calculation.',
  },
  guided: {
    id: 'g-tv-l4', prompt: 'Graph 2x + y = 8.',
    steps: [
      { id: 'g1', prompt: 'Put x = 0.', question: numQ('g-tv-l4-1', 'In 2x + y = 8, put x = 0. What is y?', 8, '2 × 0 + y = 8, so y = 8.', { refresherId: 't4-table', rules: [[[4], '4 is the x for y = 0. Here x = 0, so y = 8 directly.', 'swapped_roles']] }), hints: ['2 × 0 is 0.'] },
      { id: 'g2', prompt: 'Put y = 0.', question: numQ('g-tv-l4-2', 'In 2x + y = 8, put y = 0. What is x?', 4, '2x + 0 = 8, so x = 4.', { refresherId: 't4-table', rules: [[[8], '8 is the value of 2x. Divide by 2 to get x.', 'stopped_early']] }), hints: ['2x = 8.'] },
      { id: 'g3', prompt: 'Is (3, 2) on the line?', question: pick('g-tv-l4-3', 'Is (3, 2) on the graph of 2x + y = 8?', [
        ['Yes: 2 × 3 + 2 = 8.', null],
        ['No: it is not one of the points we plotted.', 'Every point of the line is a solution, not just the ones we plotted. 2 × 3 + 2 = 8, so (3, 2) is on the line.', 'only_plotted_points'],
      ], 'It satisfies the equation, so it is on the line.', undefined, 't4-line'), hints: ['Substitute x = 3, y = 2.'] },
    ],
    conclusion: 'The line passes through (0, 8), (4, 0) and (3, 2).',
  },
  independent: [
    ind('i1', 'Table', 'table', 'Complete the table.', numQ('tv-l4-i1', 'For x + 2y = 6, complete the table: when x = 2, y = ?', 2, '2 + 2y = 6, so 2y = 4 and y = 2.', { refresherId: 't4-table', rules: [[[4], '4 is 6 − 2. Then divide by 2: y = 2.', 'stopped_early']] }), ['Substitute x = 2.'], ['y = 2.']),
    ind('i2', 'Table', 'table', 'A negative x.', numQ('tv-l4-i2', 'For x + 2y = 6, when x = −2, y = ?', 4, '−2 + 2y = 6, so 2y = 8 and y = 4.', { refresherId: 't4-table', rules: [[[2], '2 is the y for x = 2. Here x = −2: 2y = 6 − (−2) = 8.', 'sign_error'], [[-4], 'Check: −2 + 2 × (−4) = −10, not 6.', 'sign_error']] }), ['Subtracting −2 adds 2.'], ['y = 4.']),
    ind('i3', 'Plotting', 'plot', 'Which letter?', pick('tv-l4-i3', 'Which letter marks the point (−2, 3)?', [
      ['A', null],
      ['B', 'B is (3, −2). You swapped x and y: x = −2 is 2 units LEFT, y = 3 is 3 units UP.', 'swapped_coordinates'],
      ['C', 'C is (2, 3). The x-value is −2, so the point is to the left of the y-axis.', 'sign_dropped'],
      ['D', 'D is (−3, −2). The y-value is 3, so the point is above the x-axis.', 'sign_error'],
    ], 'Left 2 and up 3.', tvVisual({ mode: 'plane', points: PLANE_FOUR, extent: 5, movePoint: false }, 'Four labelled points A, B, C, D on the plane: A (−2, 3), B (3, −2), C (2, 3), D (−3, −2).'), 't4-plot'), ['x first: left or right.'], ['A.']),
    ind('i4', 'Plotting', 'plot', 'On an axis.', pick('tv-l4-i4', 'Where does the point (0, 3) lie?', [
      ['On the y-axis, 3 units above the origin.', null],
      ['On the x-axis, 3 units to the right of the origin.', 'x = 0 means no movement along the x-axis, so the point is on the y-axis. The 3 is the y-value.', 'swapped_coordinates'],
      ['In the first quadrant, not on an axis.', 'A point with x = 0 is on the y-axis, which is the border between quadrants.', 'quadrant_vs_axis'],
    ], 'x = 0 puts it on the y-axis.', undefined, 't4-plot'), ['What does x = 0 say?'], ['On the y-axis.']),
    ind('i5', 'On the line', 'online', 'Is it on the line?', pick('tv-l4-i5', 'Is (4, 1) on the graph of x + 2y = 6?', [
      ['Yes: 4 + 2 × 1 = 6.', null],
      ['No: 4 + 1 = 5.', 'The y-term is 2y, so use 2 × 1: 4 + 2 = 6.', 'forgot_coefficient'],
    ], '4 + 2 = 6.', undefined, 't4-line'), ['Substitute and compare.'], ['Yes.']),
    ind('i6', 'On the line', 'online', 'Find k.', numQ('tv-l4-i6', 'The point (k, 2) lies on x + 2y = 6. Find k.', 2, 'k + 2 × 2 = 6, so k = 2.', { refresherId: 't4-line', rules: [[[6], '6 is the right side. Substitute y = 2: k + 4 = 6.', 'target_for_value'], [[4], '4 is 2y. Then k = 6 − 4 = 2.', 'stopped_early']] }), ['Put y = 2 in.'], ['k = 2.']),
    ind('i7', 'On the line', 'online', 'Every point?', pick('tv-l4-i7', 'A student says "every point on the coordinate plane satisfies x + 2y = 6". What is wrong?', [
      ['Only points on the line do; for example (1, 1) gives 3, not 6.', null],
      ['Nothing is wrong.', 'Try (1, 1): 1 + 2 = 3, not 6. Only the points of the line satisfy the equation.', 'every_point_solution'],
      ['No point satisfies it.', 'Many do: (0, 3), (2, 2), (6, 0), and all the points of the line.', 'no_point_solution'],
    ], 'Only points on the line are solutions.', undefined, 't4-line'), ['Try a point that is not on the line.'], ['Only the line.']),
  ],
  reflection: {
    discover: 'Choosing x gives a table of solutions; plotted as points they lie on a straight line. Points on the line satisfy the equation; points off it do not.',
    evidence: 'You filled a table, saw the points line up, and tested points on and off the line.',
    stillConfusing: [{ text: 'How do I fill a table?', refresherId: 't4-table' }, { text: 'How do I plot a point?', refresherId: 't4-plot' }, { text: 'Which points are on the line?', refresherId: 't4-line' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Solutions that make sense  (applying the graph)
// ---------------------------------------------------------------------------

export const L5: EduLesson = {
  id: 'tv-l5', unitId: 'tunit-3', number: 5, title: 'Solutions that make sense',
  objective: 'tell mathematical solutions from solutions that are possible in a real situation, and read the graph of a story.',
  prerequisiteIds: ['tp-plane', 'tp-equations'],
  objectives: [
    { id: 'meaning', label: 'Decide whether a solution makes sense' },
    { id: 'graph', label: 'Read a story from its graph' },
  ],
  steps: [
    {
      id: 't5-meaning', title: 'Solutions and sensible answers', phase: 'apply',
      paragraphs: [
        'A café sells tea at ₹10 and coffee at ₹20 a cup. A group spends ₹100: 10x + 20y = 100, where x is the number of cups of tea and y the number of cups of coffee.',
        'The pair (−2, 6) satisfies the equation: −20 + 120 = 100. But −2 cups of tea makes no sense. And (5, 2.5) satisfies it, but 2.5 cups is not a count you can order. The equation has infinitely many solutions; only some answer the real question.',
      ],
      visual: tvVisual({ mode: 'line', eq: [10, 20, -100], point: [4, 3], table: [0, 2, 4, 5], restrict: 'whole', extent: 12, edit: 'none' }, 'The café equation 10x + 20y = 100, with whole-number solutions marked.'),
      notice: 'Move the test point. It can satisfy the equation without being a sensible number of cups: read the second line of the check.',
      check: pick('chk-t5-meaning', '(−2, 6) satisfies 10x + 20y = 100. Does it describe a possible order of cups?', [
        ['No: you cannot order −2 cups of tea.', null],
        ['Yes: it satisfies the equation, so it is a solution of the problem.', 'It solves the equation, but the story needs a whole number of cups that is not negative. Both conditions have to hold.', 'math_vs_meaning'],
      ], 'A solution of the equation must also fit the story.', undefined, 't5-meaning'),
    },
    {
      id: 't5-graph', title: 'Reading the graph of a story', phase: 'apply',
      paragraphs: [
        'The line crosses the x-axis at (10, 0) and the y-axis at (0, 5). In the story: 10 cups of tea and no coffee, or 5 cups of coffee and no tea. Between them, only the points with whole-number coordinates are possible orders: (0, 5), (2, 4), (4, 3), (6, 2), (8, 1) and (10, 0). The rest of the line is not an order, although every one of its points satisfies the equation.',
      ],
      visual: tvVisual({ mode: 'line', eq: [10, 20, -100], restrict: 'whole', showIntercepts: true, extent: 12, edit: 'none', movePoint: false }, 'The line 10x + 20y = 100 with its whole-number points marked and its intercepts (10, 0) and (0, 5).'),
      notice: 'Count the marked points on the line.',
      check: pick('chk-t5-graph', 'The line 10x + 20y = 100 meets the y-axis at (0, 5). What does that say about the orders?', [
        ['5 cups of coffee and no tea is an order that costs ₹100.', null],
        ['5 cups of tea and no coffee.', 'The first number is the tea. (0, 5) has no tea and 5 cups of coffee.', 'swapped_coordinates'],
      ], 'x = 0 tea, y = 5 coffee.', undefined, 't5-graph'),
    },
  ],
  investigation: lab('Draw a story equation in the free laboratory and look for the whole-number points.'),
  worked: {
    id: 'w-tv-l5', title: 'Tickets for a trip',
    given: ['Adult tickets cost ₹30 and child tickets ₹20. A group pays ₹250 in all.'], ask: 'List every possible whole-number purchase.',
    steps: [
      { text: 'The equation is 30x + 20y = 250, which is 3x + 2y = 25 after dividing by 10.', why: 'Dividing by a nonzero number keeps the same solutions.' },
      { text: 'Since 2y is even and 25 is odd, 3x must be odd, so x must be odd.', why: 'Odd minus even is odd.' },
      { text: 'Try x = 1, 3, 5, 7: y = 11, 8, 5, 2.', why: 'y = (25 − 3x) ÷ 2 each time.' },
      { text: 'x = 9 would give y = −1, which is impossible. So the purchases are (1, 11), (3, 8), (5, 5), (7, 2).', why: 'A number of tickets cannot be negative.' },
    ],
    verify: 'Check (7, 2): 30 × 7 + 20 × 2 = 210 + 40 = 250.',
  },
  guided: {
    id: 'g-tv-l5', prompt: 'Adult tickets cost ₹30 and child tickets ₹20; the total is ₹250.',
    steps: [
      { id: 'g1', prompt: 'Which pair satisfies the equation?', question: pick('g-tv-l5-1', 'Which pair satisfies 30x + 20y = 250?', [
        ['(5, 5)', null],
        ['(5, 4)', '30 × 5 + 20 × 4 = 230, not 250.', 'miscalculation'],
        ['(4, 5)', '30 × 4 + 20 × 5 = 220: the numbers are in the wrong order for this equation.', 'pair_order_ignored'],
      ], '150 + 100 = 250.', undefined, 't5-meaning'), hints: ['Substitute each pair.'] },
      { id: 'g2', prompt: 'Is (2.5, 8.75) a sensible purchase?', question: pick('g-tv-l5-2', '(2.5, 8.75) satisfies the equation (75 + 175 = 250). Is it a possible purchase?', [
        ['No: you cannot buy 2.5 tickets.', null],
        ['Yes: it satisfies the equation.', 'The equation is satisfied, but tickets are counted in whole numbers.', 'math_vs_meaning'],
      ], 'A count must be a whole number.', undefined, 't5-meaning'), hints: ['Can you buy half a ticket?'] },
      { id: 'g3', prompt: 'Find the child tickets if 7 adult tickets are bought.', question: numQ('g-tv-l5-3', '7 adult tickets are bought. How many child tickets complete the ₹250?', 2, '30 × 7 = 210, so 20y = 40 and y = 2.', { refresherId: 't5-meaning', rules: [[[40], '40 is the money left. Each child ticket is ₹20, so divide.', 'stopped_early']] }), hints: ['210 is spent on adults.'] },
    ],
    conclusion: '7 adult and 2 child tickets is one possible purchase.',
  },
  independent: [
    ind('i1', 'Meaning', 'meaning', 'Negative cups.', pick('tv-l5-i1', 'In 10x + 20y = 100 (x cups of tea, y cups of coffee), (12, −1) satisfies the equation. Is it a possible order?', [
      ['No: −1 cups of coffee is impossible.', null],
      ['Yes: it satisfies the equation.', 'A count cannot be negative. The pair solves the equation but not the problem.', 'math_vs_meaning'],
    ], '120 − 20 = 100, but a count is not negative.', undefined, 't5-meaning'), ['Look at the sign of y.'], ['No.']),
    ind('i2', 'Meaning', 'meaning', 'Whole numbers.', pick('tv-l5-i2', 'Which solution of 10x + 20y = 100 is a possible order of whole cups?', [
      ['(4, 3)', null],
      ['(5, 2.5)', 'It satisfies the equation (50 + 50 = 100) but 2.5 cups is not a whole number.', 'math_vs_meaning'],
      ['(12, −1)', 'It satisfies the equation but a negative number of cups is impossible.', 'math_vs_meaning'],
    ], 'Both numbers are whole and not negative.', undefined, 't5-meaning'), ['Check both numbers.'], ['(4, 3).']),
    ind('i3', 'Meaning', 'meaning', 'How many orders?', numQ('tv-l5-i3', 'How many different whole-number orders (x, y), with x and y not negative, satisfy 10x + 20y = 100?', 6, 'x must be even: (0, 5), (2, 4), (4, 3), (6, 2), (8, 1), (10, 0). That is 6.', { refresherId: 't5-graph', rules: [[[5], '5 misses one. List x = 0, 2, 4, 6, 8, 10, and find y each time.', 'miscount'], [[11], '11 counts every x from 0 to 10, but y is only a whole number when x is even.', 'miscount']] }), ['Which x give a whole y?'], ['6.']),
    ind('i4', 'Graph', 'graph', 'The intercept.', pick('tv-l5-i4', 'The line 10x + 20y = 100 crosses the x-axis at (10, 0). What does that mean for the café?', [
      ['10 cups of tea and no coffee cost ₹100.', null],
      ['10 cups of coffee and no tea.', 'x is the tea. (10, 0) has x = 10 and y = 0.', 'swapped_coordinates'],
    ], 'x = 10 tea, y = 0 coffee.', undefined, 't5-graph'), ['Which variable is 0?'], ['Tea only.']),
    ind('i5', 'Graph', 'graph', 'Not a count.', pick('tv-l5-i5', 'Which point on the line 10x + 20y = 100 cannot be a number of cups?', [
      ['(7, 1.5)', null],
      ['(6, 2)', 'Both numbers are whole and not negative, so it is a possible order.', 'wrong_pick'],
      ['(8, 1)', 'Both numbers are whole and not negative, so it is a possible order.', 'wrong_pick'],
    ], '1.5 cups is not a whole number.', undefined, 't5-graph'), ['Look for a decimal.'], ['(7, 1.5).']),
    ind('i6', 'Graph', 'graph', 'Read a value.', numQ('tv-l5-i6', 'Six cups of tea are ordered (x = 6). How many cups of coffee make the total ₹100?', 2, '60 + 20y = 100, so y = 2.', { refresherId: 't5-meaning', rules: [[[40], '40 is the money left. Divide by ₹20 a cup.', 'stopped_early']] }), ['Tea costs 10 × 6.'], ['2.']),
  ],
  reflection: {
    discover: 'An equation has infinitely many solutions, but a story may allow only some: counts must be whole and not negative. Check every solution against the situation.',
    evidence: 'You compared solutions of the equation with possible orders and read the intercepts in the story.',
    stillConfusing: [{ text: 'Which solutions make sense?', refresherId: 't5-meaning' }, { text: 'What does the graph tell me?', refresherId: 't5-graph' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 6: Slope  (13.3.1)
// ---------------------------------------------------------------------------

export const L6: EduLesson = {
  id: 'tv-l6', unitId: 'tunit-4', number: 6, title: 'The steepness of a line',
  objective: 'measure steepness as rise over run, tell positive, negative, zero and undefined slopes apart, and see that any two points of a line give the same slope.',
  prerequisiteIds: ['tp-signed', 'tp-plane'],
  objectives: [
    { id: 'compute', label: 'Compute a slope from two points' },
    { id: 'interpret', label: 'Read what a slope says' },
  ],
  steps: [
    {
      id: 't6-steep', title: 'Rise over run', phase: 'observe',
      paragraphs: [
        'How steep is a line? Pick two points on it. The run is how far you move to the right (the change in x); the rise is how far you move up (the change in y). The slope is rise ÷ run. A positive slope goes upward from left to right, and a negative slope goes downward.',
      ],
      vocabulary: [{ term: 'rise', meaning: 'the change in y between two points' }, { term: 'run', meaning: 'the change in x between the same two points' }],
      visual: tvVisual({ mode: 'slope', eq: [2, -1, 1], slopeX: [1, 4], extent: 10, edit: 'none' }, 'The line 2x − y + 1 = 0 with two marked points, and the rise and run between them.'),
      notice: 'Change the two x-values. Read the rise, the run and the slope.',
      check: pick('chk-t6-steep', 'A line rises 6 units while it runs 3 units to the right. What is its slope?', [
        ['2', null],
        ['1/2', 'That is run ÷ rise. The slope is rise ÷ run = 6 ÷ 3.', 'rise_run_swapped'],
        ['18', '18 is 6 × 3. The slope divides the rise by the run.', 'product_for_quotient'],
      ], '6 ÷ 3 = 2.', undefined, 't6-steep'),
    },
    {
      id: 't6-same', title: 'Does it matter which two points?', phase: 'conjecture',
      paragraphs: [
        'Choose different pairs of points on the same line. The rise and the run change but their ratio does not. This suggests the slope belongs to the whole line. Lesson 7 shows why it must, for a line written as y = mx + d.',
      ],
      visual: tvVisual({ mode: 'slope', eq: [2, -1, 1], slopeX: [-2, 3], extent: 10, edit: 'none' }, 'The line 2x − y + 1 = 0 with two different marked points, giving the same slope.'),
      notice: 'Try several pairs. What stays the same?',
      check: pick('chk-t6-same', 'You find the slope of a line using two points and get 2. A friend uses two different points of the same line. What does your friend get?', [
        ['2 as well: a line has one slope.', null],
        ['A different number, because the points are different.', 'The rise and run change but the ratio stays the same on a straight line.', 'slope_depends_on_points'],
      ], 'A line has one slope.', undefined, 't6-same'),
    },
    {
      id: 't6-special', title: 'Flat and upright lines', phase: 'reasoning',
      paragraphs: [
        'A horizontal line has rise 0, so its slope is 0 ÷ run = 0. A vertical line has run 0, and dividing by 0 is not possible, so the slope of a vertical line is undefined. Change a and b in the figure to see each case.',
      ],
      visual: tvVisual({ mode: 'slope', eq: [0, 1, -3], slopeX: [1, 4], extent: 8, edit: 'abc' }, 'The horizontal line y = 3 with a, b and c you can change; set b = 0 for a vertical line.'),
      notice: 'Set b = 0 and read what happens to the slope.',
      check: pick('chk-t6-special', 'What is the slope of the horizontal line y = 3?', [
        ['0', null],
        ['3', '3 is the y-value of the line, not its slope. A horizontal line does not rise, so rise ÷ run = 0.', 'intercept_for_slope'],
        ['Undefined', 'That is for a vertical line, where the run is 0. A horizontal line has rise 0.', 'horizontal_vertical_confused'],
      ], 'No rise: slope 0.', undefined, 't6-special'),
    },
  ],
  investigation: lab('Mark two points on a line in the free laboratory and read its slope.'),
  worked: {
    id: 'w-tv-l6', title: 'Two slopes',
    given: ['Points (1, 2) and (4, 8) on one line, and points (−1, 5) and (3, 1) on another.'], ask: 'Find both slopes.',
    steps: [
      { text: 'First line: rise = 8 − 2 = 6 and run = 4 − 1 = 3.', why: 'Subtract the y-values and the x-values in the same order.' },
      { text: 'Slope = 6 ÷ 3 = 2. It goes upward from left to right.', why: 'Positive slope.' },
      { text: 'Second line: rise = 1 − 5 = −4 and run = 3 − (−1) = 4.', why: 'Keep the same order and watch the signs.' },
      { text: 'Slope = −4 ÷ 4 = −1. It goes downward from left to right.', why: 'Negative slope.' },
    ],
    verify: 'Swapping the points gives (−6) ÷ (−3) = 2 for the first line, the same slope.',
  },
  guided: {
    id: 'g-tv-l6', prompt: 'Find the slope of the line through (2, −3) and (6, 5).',
    steps: [
      { id: 'g1', prompt: 'The rise.', question: numQ('g-tv-l6-1', 'What is the rise from (2, −3) to (6, 5)?', 8, '5 − (−3) = 8.', { refresherId: 't6-steep', rules: [[[2], '2 is 5 − 3. The first y-value is −3, so subtract −3: 5 − (−3) = 8.', 'sign_error']] }), hints: ['5 minus −3.'] },
      { id: 'g2', prompt: 'The run.', question: numQ('g-tv-l6-2', 'What is the run from (2, −3) to (6, 5)?', 4, '6 − 2 = 4.', { refresherId: 't6-steep', rules: [[[8], '8 is the rise. The run is the change in x: 6 − 2.', 'rise_run_swapped']] }), hints: ['The change in x.'] },
      { id: 'g3', prompt: 'The slope.', question: numQ('g-tv-l6-3', 'What is the slope?', 2, '8 ÷ 4 = 2.', { refresherId: 't6-steep', rules: [[[0.5], '0.5 is run ÷ rise. The slope is rise ÷ run.', 'rise_run_swapped']] }), hints: ['Rise ÷ run.'] },
    ],
    conclusion: 'The slope is 2.',
  },
  independent: [
    ind('i1', 'Computing', 'compute', 'Slope from two points.', numQ('tv-l6-i1', 'Find the slope of the line through (1, 3) and (4, 9).', 2, '(9 − 3) ÷ (4 − 1) = 6 ÷ 3 = 2.', { refresherId: 't6-steep', rules: [[[0.5], '0.5 is run ÷ rise. Slope is rise ÷ run.', 'rise_run_swapped'], [[3], '3 is the run. The rise is 9 − 3 = 6.', 'rise_run_swapped']] }), ['Rise: change in y.'], ['2.']),
    ind('i2', 'Computing', 'compute', 'A negative slope.', numQ('tv-l6-i2', 'Find the slope of the line through (−1, 5) and (3, 1).', -1, '(1 − 5) ÷ (3 − (−1)) = −4 ÷ 4 = −1.', { refresherId: 't6-steep', rules: [[[1], 'The line goes down as x increases: the rise is 1 − 5 = −4, so the slope is negative.', 'sign_error'], [[-2], '−2 comes from using 3 − 1 as the run. The run is 3 − (−1) = 4.', 'sign_error']] }), ['Subtract in the same order.'], ['−1.']),
    ind('i3', 'Computing', 'compute', 'With negatives.', numQ('tv-l6-i3', 'Find the slope of the line through (2, −3) and (6, 5).', 2, '(5 − (−3)) ÷ (6 − 2) = 8 ÷ 4 = 2.', { refresherId: 't6-steep', rules: [[[0.5], 'That is run ÷ rise. The slope is rise ÷ run.', 'rise_run_swapped'], [[0.25], 'The rise is 5 − (−3) = 8, not 2.', 'sign_error']] }), ['5 minus −3 is 8.'], ['2.']),
    ind('i4', 'Reading', 'interpret', 'Direction.', pick('tv-l6-i4', 'A line goes downward as you move from left to right. Its slope is:', [
      ['negative', null],
      ['positive', 'A positive slope goes upward from left to right.', 'sign_direction'],
      ['zero', 'A line with slope 0 is flat, neither up nor down.', 'zero_slope_confused'],
    ], 'Downward means negative.', undefined, 't6-steep'), ['Think of walking from left to right.'], ['Negative.']),
    ind('i5', 'Reading', 'interpret', 'Horizontal.', pick('tv-l6-i5', 'The line y = 3 is horizontal. What is its slope?', [
      ['0', null],
      ['3', 'The 3 tells where it crosses the y-axis, not its slope. A flat line does not rise.', 'intercept_for_slope'],
      ['undefined', 'Undefined is for vertical lines. A horizontal line has rise 0 and slope 0.', 'horizontal_vertical_confused'],
    ], 'No rise, slope 0.', undefined, 't6-special'), ['How much does it rise?'], ['0.']),
    ind('i6', 'Reading', 'interpret', 'Vertical.', pick('tv-l6-i6', 'The line x = 2 is vertical. What is its slope?', [
      ['undefined', null],
      ['0', 'A vertical line has run 0, and you cannot divide by 0. Slope 0 belongs to a horizontal line.', 'horizontal_vertical_confused'],
      ['2', 'The 2 tells where it crosses the x-axis, not its slope.', 'intercept_for_slope'],
    ], 'Run is 0, so the slope is undefined.', undefined, 't6-special'), ['What is the run?'], ['Undefined.']),
  ],
  reflection: {
    discover: 'Slope is rise ÷ run: positive upward, negative downward, 0 for a flat line, undefined for an upright one. Any two points of a line give the same slope.',
    evidence: 'You moved two points on a line, read the rise and run, and computed slopes with negative numbers.',
    stillConfusing: [{ text: 'What is rise over run?', refresherId: 't6-steep' }, { text: 'Is the slope always the same?', refresherId: 't6-same' }, { text: 'Flat and upright lines?', refresherId: 't6-special' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 7: y = mx + d  (13.3.2)
// ---------------------------------------------------------------------------

const SLOPE_PROOF = [
  { id: 'p1', text: 'Take any two points A (x₁, y₁) and B (x₂, y₂) on the line y = mx + d, with x₁ ≠ x₂.', needs: [] },
  { id: 'p2', text: 'Both points satisfy the equation: y₁ = mx₁ + d and y₂ = mx₂ + d.', needs: ['p1'] },
  { id: 'p3', text: 'Subtract: y₂ − y₁ = mx₂ − mx₁ = m(x₂ − x₁).', needs: ['p2'] },
  { id: 'p4', text: 'Divide by x₂ − x₁, which is not 0: (y₂ − y₁) ÷ (x₂ − x₁) = m.', needs: ['p3'] },
  { id: 'p5', text: 'So the slope of the line is m, whichever two points were chosen.', needs: ['p4'] },
];

export const L7: EduLesson = {
  id: 'tv-l7', unitId: 'tunit-4', number: 7, title: 'The line y = mx + d',
  objective: 'read the slope and the y-intercept from y = mx + d, convert from standard form, and explain why m is the slope.',
  prerequisiteIds: ['tp-signed', 'tp-equations'],
  objectives: [
    { id: 'read', label: 'Read m and d from y = mx + d' },
    { id: 'convert', label: 'Convert ax + by + c = 0 to y = mx + d' },
    { id: 'why', label: 'Explain why m is the slope' },
  ],
  steps: [
    {
      id: 't7-form', title: 'Reading a line from its equation', phase: 'observe',
      paragraphs: [
        'An equation written y = mx + d is in slope-intercept form. Here m is the slope and d is the y-intercept: the line crosses the y-axis at (0, d). Change m and d in the figure and watch the line.',
      ],
      vocabulary: [{ term: 'y-intercept', meaning: 'the y-value where the line crosses the y-axis, d' }],
      visual: tvVisual({ mode: 'line', eq: [-1, 1, -2], edit: 'md', showIntercepts: true, extent: 10 }, 'The line y = x + 2 with m and d you can change.'),
      notice: 'Which control tilts the line and which slides it up and down?',
      check: pick('chk-t7-form', 'For the line y = 3x − 4, which is right?', [
        ['slope 3 and y-intercept −4', null],
        ['slope −4 and y-intercept 3', 'The number multiplying x is the slope (3). The constant is the y-intercept (−4).', 'm_d_swapped'],
        ['slope 3 and y-intercept 4', 'Keep the sign: y = 3x − 4 is y = 3x + (−4), so d = −4.', 'sign_dropped'],
      ], 'm = 3 and d = −4.', undefined, 't7-form'),
    },
    {
      id: 't7-why', title: 'Why m is the slope', phase: 'proof',
      paragraphs: ['Dragging points shows the slope does not change. A proof shows why, for every line written this way.'],
      visual: tvVisual({ mode: 'slope', eq: [-2, 1, -1], slopeX: [0, 2], extent: 10, edit: 'none' }, 'The line y = 2x + 1 with two marked points A and B and their rise and run.'),
      proof: [
        { claim: 'Take two points A (x₁, y₁) and B (x₂, y₂) on y = mx + d.', reason: 'Any two points with different x-values.', show: ['P1', 'P2'] },
        { claim: 'y₁ = mx₁ + d and y₂ = mx₂ + d.', reason: 'Points on the line satisfy its equation.', show: ['P1', 'P2'] },
        { claim: 'y₂ − y₁ = m(x₂ − x₁).', reason: 'Subtract the two equations; d cancels.', show: ['rise', 'run'] },
        { claim: '(y₂ − y₁) ÷ (x₂ − x₁) = m.', reason: 'Divide by x₂ − x₁, which is not zero.', show: ['rise', 'run'] },
      ],
    },
    {
      id: 't7-convert', title: 'From standard form', phase: 'apply',
      paragraphs: [
        'ax + by + c = 0 can be rewritten as by = −ax − c, and when b ≠ 0, y = (−a/b)x + (−c/b). So m = −a/b and d = −c/b. For 3x + 2y − 12 = 0: m = −3/2 and d = −(−12)/2 = 6, so y = −(3/2)x + 6.',
        'If b = 0 the line is vertical and has no slope-intercept form.',
      ],
      visual: tvVisual({ mode: 'line', eq: [3, 2, -12], edit: 'abc', showIntercepts: true, extent: 10 }, 'The line 3x + 2y − 12 = 0 with its slope-intercept form shown.'),
      notice: 'Change a, b, c and watch the slope-intercept form.',
      check: pick('chk-t7-convert', 'Write 2x + y − 6 = 0 as y = mx + d. Which is right?', [
        ['y = −2x + 6', null],
        ['y = 2x + 6', 'Moving 2x to the other side changes its sign: y = −2x + 6.', 'sign_not_changed'],
        ['y = −2x − 6', 'Moving −6 to the other side gives +6: y = −2x + 6.', 'sign_not_changed'],
      ], 'y = −2x + 6.', undefined, 't7-convert'),
    },
  ],
  investigation: lab('Type y = 2x + 1 in the free laboratory and read the slope and intercept.'),
  worked: {
    id: 'w-tv-l7', title: 'From standard form to y = mx + d',
    given: ['The equation 3x + 2y = 12.'], ask: 'Find the slope and the y-intercept.',
    steps: [
      { text: 'Subtract 3x from both sides: 2y = −3x + 12.', why: 'Get the y-term alone on the left.' },
      { text: 'Divide every term by 2: y = −(3/2)x + 6.', why: 'Divide the whole right side, not only one term.' },
      { text: 'So m = −3/2 and d = 6.', why: 'Compare with y = mx + d.' },
      { text: 'Check: (0, 6) satisfies 3x + 2y = 12 since 12 = 12.', why: 'The y-intercept point must satisfy the original equation.' },
    ],
    verify: 'The slope is negative, and the line does go downward from left to right.',
  },
  guided: {
    id: 'g-tv-l7', prompt: 'Write 2x + y = 6 as y = mx + d.',
    steps: [
      { id: 'g1', prompt: 'Solve for y.', question: pick('g-tv-l7-1', 'Which is 2x + y = 6 solved for y?', [
        ['y = −2x + 6', null],
        ['y = 2x + 6', 'Moving 2x across changes its sign: y = 6 − 2x.', 'sign_not_changed'],
      ], 'Subtract 2x from both sides.', undefined, 't7-convert'), hints: ['Subtract 2x.'] },
      { id: 'g2', prompt: 'The slope.', question: numQ('g-tv-l7-2', 'What is the slope m?', -2, 'm is the number multiplying x: −2.', { refresherId: 't7-form', rules: [[[2], 'Keep the sign: the slope is −2.', 'sign_dropped'], [[6], '6 is the y-intercept.', 'm_d_swapped']] }), hints: ['The number with x.'] },
      { id: 'g3', prompt: 'The y-intercept.', question: numQ('g-tv-l7-3', 'What is the y-intercept d?', 6, 'd is the constant: 6.', { refresherId: 't7-form', rules: [[[-2], '−2 is the slope. d is the constant term.', 'm_d_swapped']] }), hints: ['The constant term.'] },
    ],
    conclusion: 'm = −2 and d = 6.',
  },
  independent: [
    ind('i1', 'Reading', 'read', 'The slope.', numQ('tv-l7-i1', 'Find the slope of y = 4x − 7.', 4, 'In y = mx + d, m = 4.', { refresherId: 't7-form', rules: [[[-7], '−7 is the y-intercept.', 'm_d_swapped'], [[7], '7 is the size of the intercept, not the slope.', 'm_d_swapped']] }), ['The number multiplying x.'], ['4.']),
    ind('i2', 'Reading', 'read', 'The y-intercept.', numQ('tv-l7-i2', 'Find the y-intercept d of y = 4x − 7.', -7, 'y = 4x + (−7), so d = −7.', { refresherId: 't7-form', rules: [[[7], 'Keep the sign: d = −7.', 'sign_dropped'], [[4], '4 is the slope, the number multiplying x. The y-intercept is the constant.', 'm_d_swapped']] }), ['The constant, with its sign.'], ['−7.']),
    ind('i3', 'Reading', 'read', 'A point.', pick('tv-l7-i3', 'The line y = −x/2 + 3 crosses the y-axis at:', [
      ['(0, 3)', null],
      ['(3, 0)', 'The y-intercept is where x = 0, so the point is (0, 3).', 'swapped_coordinates'],
      ['(0, −1/2)', '−1/2 is the slope, not the intercept.', 'm_d_swapped'],
    ], 'x = 0 gives y = 3.', undefined, 't7-form'), ['Put x = 0.'], ['(0, 3).']),
    ind('i4', 'Converting', 'convert', 'Standard to slope.', numQ('tv-l7-i4', 'Find the slope of 2x + y − 6 = 0.', -2, 'y = −2x + 6, so m = −2.', { refresherId: 't7-convert', rules: [[[2], 'Moving 2x to the other side changes its sign: m = −2.', 'sign_not_changed']] }), ['Solve for y.'], ['−2.']),
    ind('i5', 'Converting', 'convert', 'Standard to intercept.', numQ('tv-l7-i5', 'Find the y-intercept of x + 2y − 8 = 0.', 4, '2y = −x + 8, so y = −x/2 + 4 and d = 4.', { refresherId: 't7-convert', rules: [[[8], '8 is the constant before dividing by 2. Divide the whole equation by 2: d = 4.', 'divided_one_term'], [[-4], 'Moving −8 across gives +8, so d = +4.', 'sign_not_changed']] }), ['Divide every term by 2.'], ['4.']),
    ind('i6', 'Reason', 'why', 'Arrange the proof.', ord('tv-l7-i6', 'Arrange the steps that show the slope between any two points of y = mx + d is m.', SLOPE_PROOF, ['p4', 'p2', 'p5', 'p1', 'p3'], 'Take two points, use their equations, subtract, divide, conclude.'), ['What do you choose first?'], ['Two points, both satisfy the equation, subtract, divide, conclude.']),
    ind('i7', 'Reason', 'why', 'Why not just measure?', pick('tv-l7-i7', 'A student measures the slope of y = 2x + 1 on one graph and says "so m is always the slope". What is missing?', [
      ['A proof for any two points: the subtraction argument works for every line y = mx + d.', null],
      ['Nothing: measuring is a proof.', 'One measurement on one graph checks one case. The subtraction argument shows it for every line of this form.', 'testing_as_proof'],
    ], 'The algebra covers every pair of points.', undefined, 't7-why'), ['Does measuring cover all lines?'], ['The proof.']),
  ],
  reflection: {
    discover: 'In y = mx + d, m is the slope and d is where the line meets the y-axis. From ax + by + c = 0 you get m = −a/b and d = −c/b when b ≠ 0, and subtraction of two points on the line shows m is the slope.',
    evidence: 'You changed m and d and watched the line, converted equations, and followed the proof.',
    stillConfusing: [{ text: 'What are m and d?', refresherId: 't7-form' }, { text: 'Why is m the slope?', refresherId: 't7-why' }, { text: 'How do I convert?', refresherId: 't7-convert' }],
  },
};
