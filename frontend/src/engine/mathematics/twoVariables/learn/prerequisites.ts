/**
 * Two Variables, One Line: chapter and unit prerequisites (EDU-1M5). Only what the
 * chapter really uses: letters standing for numbers, signed numbers, solving a
 * one-variable equation, and ordered pairs on the coordinate plane. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { numQ, pick, tvVisual } from './questions';

export const TP_VARIABLES: Prerequisite = {
  id: 'tp-variables',
  title: 'Letters for numbers, and putting numbers in',
  why: 'A linear equation in two variables is a sentence about two unknown numbers, x and y. To test an answer you will keep replacing the letters by numbers.',
  connection: 'Grade 7 and 8: algebraic expressions',
  refresher: [
    {
      id: 'tp-var-step', title: 'A letter stands for a number',
      paragraphs: [
        'In 5x, the letter x stands for a number and 5x means 5 times that number. If x = 3 then 5x = 5 × 3 = 15.',
        'Putting a number in for a letter is called substituting. In 2x + 3y with x = 4 and y = 1, you get 2 × 4 + 3 × 1 = 8 + 3 = 11.',
      ],
      misconception: { wrong: '5x means the digits 5 and x side by side, so with x = 3 it is 53.', right: '5x means 5 times x. With x = 3 it is 5 × 3 = 15, not 53.' },
    },
  ],
  checks: [
    numQ('tp-var-c1', 'Find the value of 2x + 3y when x = 4 and y = 1.', 11, '2 × 4 + 3 × 1 = 8 + 3 = 11.', { refresherId: 'tp-var-step', rules: [[[241], 'Do not write the digits side by side. 2x means 2 times x, so work out 2 × 4 and 3 × 1 and add.', 'digits_side_by_side'], [[8], '8 is only the 2x part. The 3y part, 3 × 1 = 3, must be added too.', 'forgot_a_term']] }),
    pick('tp-var-c2', 'In 7y, what does the letter y stand for?', [
      ['Some number; 7y is 7 times it.', null],
      ['The number 7.', 'The 7 is the coefficient. The letter y stands for another number, and 7y is 7 times it.', 'letter_is_coefficient'],
      ['The word "year".', 'In algebra a letter is just a number we do not know yet.', 'letter_is_label'],
    ], 'y is a number and 7y means 7 × y.', undefined, 'tp-var-step'),
  ],
};

export const TP_SIGNED: Prerequisite = {
  id: 'tp-signed',
  title: 'Positive and negative numbers',
  why: 'Points on a graph can have negative coordinates, and slopes and constants are often negative. A single sign error changes whether a pair is a solution.',
  connection: 'Grade 7: integers',
  refresher: [
    {
      id: 'tp-sgn-step', title: 'Signs in sums and products',
      paragraphs: [
        'Positive × positive and negative × negative are positive; a positive times a negative is negative. So 3 × (−4) = −12 and (−3) × (−4) = 12.',
        'Subtracting a negative adds: 5 − (−2) = 7. Take care when a negative number is substituted into 2x: with x = −3, 2x = 2 × (−3) = −6.',
      ],
      misconception: { wrong: '5 − (−2) = 3.', right: 'Subtracting −2 is the same as adding 2, so 5 − (−2) = 7.' },
    },
  ],
  checks: [
    numQ('tp-sgn-c1', 'Find the value of 2x + 5 when x = −3.', -1, '2 × (−3) + 5 = −6 + 5 = −1.', { refresherId: 'tp-sgn-step', rules: [[[11], '11 comes from 2 × 3 + 5. x is −3, so 2x is −6, not 6.', 'sign_dropped'], [[-11], '−11 comes from −6 − 5. The 5 is added: −6 + 5.', 'sign_error']] }),
    numQ('tp-sgn-c2', 'Find 5 − (−2).', 7, 'Subtracting −2 adds 2: 5 + 2 = 7.', { refresherId: 'tp-sgn-step', rules: [[[3], '3 is 5 − 2. Subtracting a negative number adds.', 'double_negative']] }),
  ],
};

export const TP_EQUATIONS: Prerequisite = {
  id: 'tp-equations',
  title: 'Solving a simple equation',
  why: 'To find a solution of an equation in two variables you choose a value for x and then solve an ordinary one-variable equation for y.',
  connection: 'Grade 7 and 8: linear equations in one variable',
  refresher: [
    {
      id: 'tp-eq-step', title: 'Undo what was done to the unknown',
      paragraphs: [
        'To solve 2y + 6 = 14, undo what was done to y, in reverse order: take 6 from both sides to get 2y = 8, then divide both sides by 2 to get y = 4. Check: 2 × 4 + 6 = 14.',
        'The same steps work with negatives: −2y = 8 gives y = 8 ÷ (−2) = −4.',
      ],
      misconception: { wrong: 'In 2y + 6 = 14, divide by 2 first: y + 6 = 7.', right: 'Dividing by 2 must be applied to every term, not only 2y: (2y + 6) ÷ 2 = y + 3. Subtracting 6 first is simpler.' },
    },
  ],
  checks: [
    numQ('tp-eq-c1', 'Solve 2y + 6 = 14 for y.', 4, '2y = 14 − 6 = 8, so y = 4.', { refresherId: 'tp-eq-step', rules: [[[8], '8 is the value of 2y. y is half of that.', 'stopped_early'], [[10], '10 comes from 14 − 2 − 2. Subtract the 6 first, then divide by 2.', 'wrong_order']] }),
    numQ('tp-eq-c2', 'Solve −2y = 8 for y.', -4, 'y = 8 ÷ (−2) = −4.', { refresherId: 'tp-eq-step', rules: [[[4], 'Dividing 8 by −2 gives a negative number.', 'sign_dropped']] }),
  ],
};

export const TP_PLANE: Prerequisite = {
  id: 'tp-plane',
  title: 'Ordered pairs and the coordinate plane',
  why: 'A solution of an equation in two variables is an ordered pair (x, y), and its graph is drawn on the coordinate plane. You need to read and place points with confidence.',
  connection: 'Grade 8 and the chapter on Coordinate Geometry',
  refresher: [
    {
      id: 'tp-pl-step', title: 'x first, then y',
      paragraphs: [
        'The pair (3, 2) means: go 3 along the x-axis (right if positive, left if negative), then 2 up the y-axis (up if positive, down if negative). The order matters: (3, 2) and (2, 3) are different points.',
        'The axes cut the plane into four quadrants. A point with x < 0 and y > 0 is in the upper left.',
      ],
      visual: tvVisual({ mode: 'plane', point: [3, 2], swap: true, extent: 5 }, 'Optional demo: a point (x, y) you can move, and the reversed pair (y, x).'),
      notice: 'Optional demo: move the point and watch where (y, x) lands. They match only on the line where x = y.',
      misconception: { wrong: '(2, 3) and (3, 2) are the same point.', right: 'The first number is always the x-value. (2, 3) is 2 right and 3 up; (3, 2) is 3 right and 2 up.' },
    },
  ],
  checks: [
    pick('tp-pl-c1', 'Which point is 2 units LEFT of the y-axis and 3 units UP from the x-axis?', [
      ['(−2, 3)', null],
      ['(3, −2)', 'That is 3 right and 2 down. x comes first: left 2 means x = −2.', 'swapped_coordinates'],
      ['(2, 3)', 'x = 2 is to the right of the y-axis. Left of it means a negative x.', 'sign_dropped'],
    ], 'x = −2 (left) and y = 3 (up).', undefined, 'tp-pl-step'),
    pick('tp-pl-c2', 'Are (4, 1) and (1, 4) the same point?', [
      ['No: (4, 1) is 4 right and 1 up; (1, 4) is 1 right and 4 up.', null],
      ['Yes: they use the same two numbers.', 'The order matters. The first number is x and the second is y, so they are different points.', 'pair_order_ignored'],
    ], 'An ordered pair has a first and a second place.', undefined, 'tp-pl-step'),
  ],
};

export const TV_PREREQUISITES: Prerequisite[] = [TP_VARIABLES, TP_SIGNED, TP_EQUATIONS, TP_PLANE];

export const TV_UNITS: EduUnit[] = [
  {
    id: 'tunit-1', number: 1, title: 'Equations in two variables',
    centralIdea: 'Two unknown quantities that together make a total can be written as one equation ax + by + c = 0, called a linear equation in two variables.',
    connection: 'It extends equations in one variable to two unknowns.',
    vocabulary: [{ term: 'variable', meaning: 'a letter standing for an unknown number' }, { term: 'standard form', meaning: 'ax + by + c = 0 with a and b not both zero' }, { term: 'coefficient', meaning: 'the number multiplying a variable' }],
    discover: ['How a situation becomes an equation', 'What a, b and c are', 'Why one equation has many solutions'],
    prerequisiteIds: ['tp-variables'], lessonIds: ['tv-l1', 'tv-l2'],
  },
  {
    id: 'tunit-2', number: 2, title: 'Solutions as ordered pairs',
    centralIdea: 'A solution is a pair of values (x, y), in that order, that makes the equation true, and a table of solutions comes from choosing one value and finding the other.',
    connection: 'It uses substitution and solving a one-variable equation.',
    vocabulary: [{ term: 'solution', meaning: 'a pair (x, y) that satisfies the equation' }, { term: 'ordered pair', meaning: 'two numbers where the order matters' }],
    discover: ['How to test a pair', 'Why (x, y) is not (y, x)', 'How to find more solutions'],
    prerequisiteIds: ['tp-variables', 'tp-signed', 'tp-equations'], lessonIds: ['tv-l3'],
  },
  {
    id: 'tunit-3', number: 3, title: 'The graph of an equation',
    centralIdea: 'Every solution is a point of the line and every point of the line is a solution; points off the line are not solutions.',
    connection: 'It plots the solutions you found on the coordinate plane.',
    vocabulary: [{ term: 'graph', meaning: 'all the points whose coordinates are solutions' }, { term: 'intercept', meaning: 'where the line meets an axis' }],
    discover: ['From table to points to line', 'Which points are on the line', 'Which solutions make sense in a real problem'],
    prerequisiteIds: ['tp-plane', 'tp-equations'], lessonIds: ['tv-l4', 'tv-l5'],
  },
  {
    id: 'tunit-4', number: 4, title: 'Slope and the line y = mx + d',
    centralIdea: 'The steepness of a line is its slope, rise over run, and when an equation is written y = mx + d the number m is the slope and d is where the line cuts the y-axis.',
    connection: 'It reads a line from its graph and from its equation.',
    vocabulary: [{ term: 'slope', meaning: 'rise ÷ run, the steepness of the line' }, { term: 'y-intercept', meaning: 'the value of y where the line meets the y-axis' }],
    discover: ['What slope means', 'Positive, negative, zero and undefined slope', 'Why m is the slope in y = mx + d'],
    prerequisiteIds: ['tp-signed', 'tp-plane'], lessonIds: ['tv-l6', 'tv-l7'],
  },
  {
    id: 'tunit-5', number: 5, title: 'Pairs of equations',
    centralIdea: 'Two facts about the same two unknowns give a pair of equations; their common solution is the point where the two lines meet, found by substitution, elimination or a graph, and a pair can have one, no or infinitely many solutions.',
    connection: 'It puts two of the lines from Units 3 and 4 on one graph and asks what they share.',
    vocabulary: [{ term: 'pair of linear equations', meaning: 'two linear equations in the same two variables' }, { term: 'consistent pair', meaning: 'a pair with at least one solution' }, { term: 'inconsistent pair', meaning: 'a pair with no solution (parallel lines)' }],
    discover: ['Why one equation is not enough', 'How substitution and elimination reduce a pair to one equation', 'When a pair has one, no or infinitely many solutions', 'How to read a solution from two lines'],
    prerequisiteIds: ['tp-equations', 'tp-plane'], lessonIds: ['tv-l8', 'tv-l9', 'tv-l10', 'tv-l11'],
  },
];
