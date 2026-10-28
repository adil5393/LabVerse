/**
 * Two Variables, One Line: Unit 5, pairs of linear equations (Lessons 8 to 11), aligned to Ganita Manjari Part II Chapter 13,
 * Sections 13.4 (a pair of linear equations), 13.5 and 13.5.1 (algebraic methods: substitution and elimination; one, none or
 * infinitely many solutions) and 13.6 (the graphical method). Checked against the chapter PDF (iemh205). Wording, situations and
 * numbers are original; every answer is checked by `__tests__/pairs.test.ts`.
 */

import type { EduLesson, MultiNumericQuestion, VisualRef } from '../../../education/types';
import { ind, numQ, pick } from './questions';
import type { Eq3 } from './pairs';

const pairVisual = (eqs: [Eq3, Eq3], labels: [string, string], alt: string, extent = 10): VisualRef => ({ kind: 'tvPair', props: { eqs, labels, extent }, alt });

const solvePair = (id: string, prompt: string, x: number, y: number, explanation: string, wrong: string, visual?: VisualRef): MultiNumericQuestion => ({
  kind: 'multi', id, prompt, visual,
  parts: [{ id: 'x', label: 'x', answer: x, tolerance: 0.001 }, { id: 'y', label: 'y', answer: y, tolerance: 0.001 }],
  defaultFeedback: { message: wrong, misconception: 'pair-solution' }, explanation,
});

const LAB = { title: 'Try it in the System Explorer', description: 'Enter two equations and watch the lines, their meeting point and the algebra together.', href: '/mathematics/two-variables/workbench?tab=system', buttonLabel: 'Open the System Explorer' };

// ---------------------------------------------------------------------------
// Lesson 8: A pair of equations (13.4)
// ---------------------------------------------------------------------------

export const L8: EduLesson = {
  id: 'tv-l8', unitId: 'tunit-5', number: 8, title: 'A pair of equations',
  objective: 'write a pair of linear equations for a situation with two unknowns, and check whether an ordered pair is a solution of BOTH equations.',
  prerequisiteIds: ['tp-equations'],
  objectives: [{ id: 'frame', label: 'Write the pair of equations for a situation' }, { id: 'both', label: 'Check a pair against both equations' }],
  steps: [
    {
      id: 'tp8-why', title: 'One equation is not enough', phase: 'observe',
      paragraphs: [
        'A notebook and two pens cost ₹50. If a notebook costs ₹x and a pen ₹y, then x + 2y = 50. Many pairs fit this: (50, 0), (40, 5), (30, 10), (10, 20) and infinitely more.',
        'Now add a second fact: two notebooks and one pen cost ₹70, so 2x + y = 70. Only a pair that fits BOTH facts can be the real prices. On the graph each equation is a line, and the shared pair is where the lines meet.',
      ],
      visual: pairVisual([[1, 2, -50], [2, 1, -70]], ['x + 2y = 50', '2x + y = 70'], 'The lines x + 2y = 50 and 2x + y = 70 meeting at the point (30, 10).', 40),
      notice: 'The two lines cross at exactly one point. Read its coordinates.',
      check: pick('chk-tp8-why', 'Which pair (x, y) fits BOTH x + 2y = 50 and 2x + y = 70?', [
        ['(30, 10)', null],
        ['(10, 20)', 'It fits the first (10 + 40 = 50) but not the second: 2 × 10 + 20 = 40, not 70.', 'fits-one-only'],
        ['(35, 0)', 'It fits the second (70 + 0 = 70) but not the first: 35 + 0 = 35, not 50.', 'fits-one-only'],
      ], 'Check each pair in both equations: only (30, 10) gives 50 and 70.', undefined, 'tp8-why'),
    },
    {
      id: 'tp8-frame', title: 'Writing the pair', phase: 'reasoning',
      paragraphs: [
        'To write a pair of equations: name the two unknowns (say x and y, with units), then turn each separate fact into one equation. A pair is usually written a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0.',
        'Example: two numbers add up to 30 and differ by 6. With x the larger and y the smaller: x + y = 30 and x − y = 6.',
      ],
      vocabulary: [{ term: 'pair of linear equations', meaning: 'two linear equations in the same two variables, to be true at the same time' }, { term: 'solution of the pair', meaning: 'an ordered pair that satisfies both equations' }],
      misconception: { wrong: 'A solution of one equation is a solution of the pair.', right: 'It must satisfy both equations; most solutions of one equation fail the other.' },
      check: pick('chk-tp8-frame', 'Three pencils and one eraser cost ₹26 (pencil ₹x, eraser ₹y). Which equation says this?', [
        ['3x + y = 26', null],
        ['x + 3y = 26', 'That would be one pencil and three erasers. The number in front of a variable counts how many of that item.', 'swapped-roles'],
        ['3(x + y) = 26', 'That would be three pencils AND three erasers.', 'distributed-count'],
      ], '3 pencils cost 3x and 1 eraser costs y.', undefined, 'tp8-frame'),
    },
    {
      id: 'tp8-check', title: 'Checking a pair', phase: 'apply',
      paragraphs: ['To check whether (a, b) solves a pair, put x = a and y = b into EACH equation. It is a solution only if both come out true. One failure is enough to reject it.'],
      check: pick('chk-tp8-check', 'Is (18, 12) a solution of x + y = 30 and x − y = 6?', [
        ['Yes: 18 + 12 = 30 and 18 − 12 = 6', null],
        ['No: 18 − 12 is not 30', 'Each value is compared with its OWN equation: the difference should be 6, and 18 − 12 = 6.', 'wrong-equation'],
      ], 'Both equations hold.', undefined, 'tp8-check'),
    },
  ],
  investigation: LAB,
  worked: {
    id: 'w-tv-l8', title: 'Tickets for a show',
    given: ['2 adult tickets and 1 child ticket cost ₹250.', '1 adult ticket and 3 child tickets cost ₹250.'],
    ask: 'Write the pair of equations, and check whether adult ₹100, child ₹50 fits both.',
    steps: [
      { text: 'Let one adult ticket cost ₹x and one child ticket ₹y.', why: 'Name both unknowns with their units before writing anything.' },
      { text: 'First fact: 2x + y = 250. Second fact: x + 3y = 250.', why: 'Each fact becomes one equation; the coefficient counts the tickets.' },
      { text: 'Check (100, 50) in the first: 2 × 100 + 50 = 250. True.', why: 'Substitute x = 100, y = 50.' },
      { text: 'Check (100, 50) in the second: 100 + 3 × 50 = 250. True.', why: 'A solution of the pair must satisfy both equations.' },
    ],
    verify: 'Both equations hold, so adult ₹100 and child ₹50 are the prices.',
  },
  guided: {
    id: 'g-tv-l8', prompt: '3 apples and 2 mangoes cost ₹80. 1 apple and 4 mangoes cost ₹110. Let an apple cost ₹x and a mango ₹y.',
    steps: [
      { id: 'g1', prompt: 'The first fact.', question: pick('tv-l8-g1', 'Which equation is the first fact?', [
        ['3x + 2y = 80', null],
        ['2x + 3y = 80', 'There are 3 apples (x) and 2 mangoes (y): 3x + 2y.', 'swapped-roles'],
      ], '3 apples and 2 mangoes.', undefined, 'tp8-frame'), hints: ['Count the apples: that number multiplies x.'] },
      { id: 'g2', prompt: 'A pair that fits only one fact.', question: pick('tv-l8-g2', 'Does (20, 10) solve the pair 3x + 2y = 80, x + 4y = 110?', [
        ['No: it fits the first (80) but the second gives 60', null],
        ['Yes: 3 × 20 + 2 × 10 = 80', 'That checks only the first equation. In the second, 20 + 40 = 60, not 110.', 'fits-one-only'],
      ], 'A solution must satisfy both.', undefined, 'tp8-check'), hints: ['Check the second equation too.'] },
      { id: 'g3', prompt: 'The real prices.', question: pick('tv-l8-g3', 'Does (10, 25) solve the pair?', [
        ['Yes: 30 + 50 = 80 and 10 + 100 = 110', null],
        ['No: 10 + 25 is not 80', 'Substitute into each equation as written: 3 × 10 + 2 × 25 = 80 and 10 + 4 × 25 = 110.', 'added-values'],
      ], 'Both hold.', undefined, 'tp8-check'), hints: ['Use the coefficients: 3x + 2y and x + 4y.'] },
    ],
    conclusion: 'The pair is 3x + 2y = 80 and x + 4y = 110; (10, 25) satisfies both, so an apple costs ₹10 and a mango ₹25.',
  },
  independent: [
    ind('i1', 'Writing a pair', 'frame', 'Sum and difference.', pick('tv-l8-i1', 'Two numbers add up to 40 and the larger is 10 more than the smaller. With x the larger and y the smaller, which pair describes them?', [
      ['x + y = 40 and x − y = 10', null],
      ['x + y = 40 and y − x = 10', 'y is the smaller number, so y − x is negative. The larger minus the smaller is x − y = 10.', 'difference-order'],
      ['x − y = 40 and x + y = 10', 'The sum is 40 and the difference is 10; these are swapped.', 'swapped-roles'],
    ], 'x + y = 40, x − y = 10.'), ['Which expression is the larger minus the smaller?'], ['x + y = 40 and x − y = 10.']),
    ind('i2', 'Checking a pair', 'both', 'Check.', pick('tv-l8-i2', 'Is (7, 3) a solution of x + y = 10 and x − y = 4?', [
      ['Yes', null],
      ['No', '7 + 3 = 10 and 7 − 3 = 4: both equations hold.', 'not-checked'],
    ], 'Both hold.'), ['Substitute into both.'], ['7 + 3 = 10 ✓, 7 − 3 = 4 ✓.']),
    ind('i3', 'Checking a pair', 'both', 'Check again.', pick('tv-l8-i3', 'Is (6, 4) a solution of x + y = 10 and 2x − y = 9?', [
      ['No: the second equation gives 8, not 9', null],
      ['Yes: 6 + 4 = 10', 'That checks only the first equation. 2 × 6 − 4 = 8, not 9.', 'fits-one-only'],
    ], 'It fails the second equation.'), ['Check the second equation.'], ['6 + 4 = 10 ✓ but 12 − 4 = 8 ≠ 9, so no.']),
    ind('i4', 'Writing a pair', 'frame', 'A table.', solvePair('tv-l8-i4', 'Two numbers add up to 20 and differ by 4. Make a table of pairs that add up to 20 and find the one that also differs by 4. Give x (the larger) and y.', 12, 8, '12 + 8 = 20 and 12 − 8 = 4.', 'List pairs with sum 20: (19, 1), (18, 2), …; find the one whose difference is 4.'), ['Try (12, 8).'], ['Pairs with sum 20: (11, 9) differs by 2, (12, 8) differs by 4.', 'x = 12, y = 8.']),
  ],
  reflection: {
    discover: 'A pair of equations describes two facts at once, and its solution is the ordered pair that satisfies both; on a graph it is where the two lines meet.',
    evidence: 'You checked pairs that fitted one equation but not the other, and found the one that fitted both.',
    stillConfusing: [{ text: 'Why is one equation not enough?', refresherId: 'tp8-why' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 9: Substitution and elimination (13.5.1)
// ---------------------------------------------------------------------------

export const L9: EduLesson = {
  id: 'tv-l9', unitId: 'tunit-5', number: 9, title: 'Substitution and elimination',
  objective: 'solve a pair of linear equations by substitution and by elimination, reducing it to one equation in one variable, and check the answer in both equations.',
  prerequisiteIds: ['tp-equations'],
  objectives: [{ id: 'sub', label: 'Solve by substitution' }, { id: 'elim', label: 'Solve by elimination' }],
  steps: [
    {
      id: 'tp9-sub', title: 'Substitution: replace one variable', phase: 'reasoning',
      paragraphs: [
        'Solve x + y = 14 and x − y = 2. From the first, x = 14 − y. Put this into the second: (14 − y) − y = 2, so 14 − 2y = 2, 2y = 12 and y = 6. Then x = 14 − 6 = 8.',
        'Substitution turns a pair in two variables into ONE equation in one variable, which you already know how to solve. Always check: 8 + 6 = 14 and 8 − 6 = 2.',
      ],
      visual: pairVisual([[1, 1, -14], [1, -1, -2]], ['x + y = 14', 'x − y = 2'], 'The lines x + y = 14 and x − y = 2 meeting at (8, 6).', 16),
      check: pick('chk-tp9-sub', 'Solve y = 3x and x + y = 12 by substitution. What is x?', [
        ['3', null],
        ['9', '9 is y. With y = 3x, the second equation becomes 4x = 12, so x = 3.', 'gave-other-variable'],
        ['4', '4 is the coefficient after substituting (4x = 12). Divide: x = 3.', 'stopped-early'],
      ], 'x + 3x = 12, so x = 3 (then y = 9).', undefined, 'tp9-sub'),
    },
    {
      id: 'tp9-elim', title: 'Elimination: add or subtract the equations', phase: 'reasoning',
      paragraphs: [
        'Solve 3x + 2y = 16 and x − 2y = 0. The y-terms are +2y and −2y, so ADDING the equations removes y: 4x = 16, x = 4. Then 4 − 2y = 0 gives y = 2.',
        'When the coefficients of one variable are equal, subtract; when they are opposite, add. Check: 3 × 4 + 2 × 2 = 16 and 4 − 4 = 0.',
      ],
      check: pick('chk-tp9-elim', 'To solve 5x + 2y = 19 and 3x − 2y = 5, what removes y?', [
        ['Add the equations', null],
        ['Subtract the equations', 'Subtracting gives 2x + 4y = 14: y is still there. +2y and −2y cancel when you ADD.', 'add-vs-subtract'],
        ['Multiply both equations by 2', 'Multiplying both by the same number keeps the y-terms as +4y and −4y; you still need to add.', 'scaling-not-eliminating'],
      ], 'Opposite coefficients cancel when added.'),
    },
    {
      id: 'tp9-scale', title: 'When nothing matches yet', phase: 'apply',
      paragraphs: [
        'Solve 2x + 3y = 12 and 3x + 2y = 13. No coefficients match, so first multiply: the first equation by 3 and the second by 2. That gives 6x + 9y = 36 and 6x + 4y = 26.',
        'Now the x-coefficients are equal, so subtract: 5y = 10, y = 2. Then 2x + 6 = 12 gives x = 3. Check: 6 + 6 = 12 and 9 + 4 = 13.',
      ],
      check: pick('chk-tp9-scale', 'Solve x + 2y = 7 and 2x + 3y = 12 by elimination (multiply the first by 2). What is y?', [
        ['2', null],
        ['3', '3 is x. Subtracting 2x + 3y = 12 from 2x + 4y = 14 leaves y = 2.', 'gave-other-variable'],
        ['14', '14 is the constant after doubling. Subtract the equations: y = 14 − 12 = 2.', 'stopped-early'],
      ], '2x + 4y = 14 minus 2x + 3y = 12 gives y = 2 (then x = 3).', undefined, 'tp9-scale'),
    },
  ],
  investigation: LAB,
  worked: {
    id: 'w-tv-l9', title: 'Substitution, step by step',
    given: ['2x + y = 11', 'x + 3y = 13'],
    ask: 'Solve the pair by substitution.',
    steps: [
      { text: 'From the first equation, y = 11 − 2x.', why: 'Choose the variable that is easiest to make the subject (here y has coefficient 1).' },
      { text: 'Substitute into the second: x + 3(11 − 2x) = 13, so x + 33 − 6x = 13.', why: 'Replacing y leaves one equation in x only.' },
      { text: '−5x = −20, so x = 4.', why: 'Collect the x-terms and constants, then divide.' },
      { text: 'y = 11 − 2 × 4 = 3.', why: 'Put the value of x back into y = 11 − 2x.' },
    ],
    verify: 'Check: 2 × 4 + 3 = 11 and 4 + 3 × 3 = 13. Both hold.',
  },
  guided: {
    id: 'g-tv-l9', prompt: 'Solve 5x + 2y = 19 and 3x − 2y = 5 by elimination.',
    steps: [
      { id: 'g1', prompt: 'Remove y.', question: pick('tv-l9-g1', 'Add the two equations. What do you get?', [
        ['8x = 24', null],
        ['2x + 4y = 14', 'That is the difference. Adding: 5x + 3x = 8x, 2y − 2y = 0, 19 + 5 = 24.', 'add-vs-subtract'],
      ], '8x = 24.', undefined, 'tp9-elim'), hints: ['+2y and −2y.'] },
      { id: 'g2', prompt: 'Find x.', question: numQ('tv-l9-g2', 'What is x?', 3, '8x = 24, so x = 3.'), hints: ['24 ÷ 8.'] },
      { id: 'g3', prompt: 'Find y.', question: numQ('tv-l9-g3', 'Use 5x + 2y = 19 with x = 3. What is y?', 2, '15 + 2y = 19, so y = 2.', { rules: [[[4], '4 is 2y. Divide by 2: y = 2.', 'stopped-early']] }), hints: ['15 + 2y = 19.'] },
    ],
    conclusion: 'x = 3, y = 2. Check: 15 + 4 = 19 and 9 − 4 = 5.',
  },
  independent: [
    ind('i1', 'Elimination', 'elim', 'Add them.', solvePair('tv-l9-i1', 'Solve x + y = 9 and x − y = 3.', 6, 3, 'Adding: 2x = 12, x = 6; then y = 3.', 'Add the equations to remove y, then substitute back.'), ['Add the equations.'], ['2x = 12, x = 6.', 'y = 9 − 6 = 3.']),
    ind('i2', 'Substitution', 'sub', 'y is given.', solvePair('tv-l9-i2', 'Solve y = 2x and x + y = 12.', 4, 8, 'x + 2x = 12, so x = 4 and y = 8.', 'Replace y by 2x in the second equation.'), ['x + 2x = 12.'], ['3x = 12, x = 4.', 'y = 2 × 4 = 8.']),
    ind('i3', 'Elimination', 'elim', 'Subtract them.', solvePair('tv-l9-i3', 'Solve 2x + 3y = 13 and 2x − y = 1.', 2, 3, 'Subtracting: 4y = 12, y = 3; then 2x − 3 = 1, x = 2.', 'The x-coefficients are equal: subtract the equations.'), ['(2x + 3y) − (2x − y) = 4y.'], ['4y = 12, y = 3.', '2x − 3 = 1, x = 2.']),
    ind('i4', 'Substitution', 'sub', 'A word problem.', numQ('tv-l9-i4', 'Two numbers add up to 50 and differ by 14. What is the larger number?', 32, 'x + y = 50 and x − y = 14 give 2x = 64, x = 32.', { rules: [[[18], '18 is the smaller number. The larger is 50 − 18 = 32.', 'gave-other-variable']] }), ['Add the two equations.'], ['x + y = 50, x − y = 14.', '2x = 64, x = 32.']),
    ind('i5', 'Choosing a method', 'sub', 'Which method?', pick('tv-l9-i5', 'Which method is quickest for y = x + 3 and 2x + y = 9?', [
      ['Substitution: y is already alone', null],
      ['Elimination: always quickest', 'Either works, but y = x + 3 already gives y, so substituting is one step.', 'one-method-only'],
    ], 'Substitute y = x + 3: 3x + 3 = 9, x = 2, y = 5.'), ['Is one variable already by itself?'], ['Substitution: 2x + x + 3 = 9, x = 2, y = 5.']),
  ],
  reflection: {
    discover: 'Substitution and elimination both turn a pair of equations into one equation in one variable; the answer must then be checked in both equations.',
    evidence: 'You solved pairs both ways and checked each answer in both equations.',
    stillConfusing: [{ text: 'When do I add and when do I subtract?', refresherId: 'tp9-elim' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 10: One, none or infinitely many (13.5)
// ---------------------------------------------------------------------------

export const L10: EduLesson = {
  id: 'tv-l10', unitId: 'tunit-5', number: 10, title: 'One, none or infinitely many',
  objective: 'recognise when a pair of linear equations has exactly one solution, no solution, or infinitely many, from the algebra and from the graph.',
  prerequisiteIds: ['tp-equations', 'tp-plane'],
  objectives: [{ id: 'none', label: 'Recognise a pair with no solution' }, { id: 'many', label: 'Recognise a pair with infinitely many solutions' }, { id: 'one', label: 'Recognise a pair with exactly one solution' }],
  steps: [
    {
      id: 'tp10-none', title: 'No solution: parallel lines', phase: 'observe',
      paragraphs: [
        'Try x + y = 5 and x + y = 8. Subtracting gives 0 = 3, which is impossible. No pair can make x + y equal 5 and 8 at the same time.',
        'On the graph the two lines have the same steepness but different positions: they are parallel and never meet. The pair is called inconsistent.',
      ],
      visual: pairVisual([[1, 1, -5], [1, 1, -8]], ['x + y = 5', 'x + y = 8'], 'Two parallel lines, x + y = 5 and x + y = 8, that never meet.'),
      check: pick('chk-tp10-none', 'Eliminating x from a pair gives 0 = 7. What does this tell you?', [
        ['The pair has no solution', null],
        ['x = 7', 'x has disappeared; 0 = 7 is a false statement, so no pair works.', 'false-statement-as-value'],
        ['Every pair is a solution', 'That happens when you get a TRUE statement such as 0 = 0.', 'none-vs-many'],
      ], 'A false statement means no solution.', undefined, 'tp10-none'),
    },
    {
      id: 'tp10-many', title: 'Infinitely many: the same line', phase: 'observe',
      paragraphs: [
        'Try x + 2y = 4 and 2x + 4y = 8. The second is just the first multiplied by 2. Eliminating gives 0 = 0, which is always true.',
        'Both equations describe the same line, so every point of that line solves the pair: infinitely many solutions. The pair is consistent but its solution is not unique.',
      ],
      visual: pairVisual([[1, 2, -4], [2, 4, -8]], ['x + 2y = 4', '2x + 4y = 8'], 'Two equations drawn on top of each other: they are the same line.'),
      check: pick('chk-tp10-many', 'Eliminating from a pair gives 0 = 0. What does this tell you?', [
        ['The equations describe the same line: infinitely many solutions', null],
        ['The solution is x = 0, y = 0', '0 = 0 is a true statement with no variables left: it does not give values for x and y.', 'false-statement-as-value'],
        ['No solution', 'No solution comes from a FALSE statement such as 0 = 3.', 'none-vs-many'],
      ], 'A true statement with nothing left means the same line.', undefined, 'tp10-many'),
    },
    {
      id: 'tp10-compare', title: 'Spotting it before you solve', phase: 'reasoning',
      paragraphs: [
        'If the x- and y-parts of one equation are the same multiple of the other’s (as in x + y and 2x + 2y), the lines have the same steepness: they are parallel or the same line.',
        'Then compare the constants: if they follow the same multiple too, it is the same line (infinitely many solutions); if not, the lines are parallel (no solution). If the x- and y-parts are NOT in the same ratio, the lines cross once: exactly one solution.',
      ],
      check: pick('chk-tp10-compare', 'How many solutions do 3x + y = 6 and 6x + 2y = 12 have?', [
        ['Infinitely many: the second is twice the first', null],
        ['Exactly one', 'Doubling the first equation gives the second exactly, so they are the same line.', 'missed-multiple'],
        ['None', 'The constants are also doubled (6 → 12), so the lines coincide; they are not just parallel.', 'none-vs-many'],
      ], 'Same multiple everywhere: same line.', undefined, 'tp10-compare'),
    },
  ],
  investigation: LAB,
  worked: {
    id: 'w-tv-l10', title: 'Is there a solution?',
    given: ['2x − y = 3', '4x − 2y = 10'],
    ask: 'Decide how many solutions the pair has.',
    steps: [
      { text: 'Multiply the first equation by 2: 4x − 2y = 6.', why: 'Make the x-terms match so they can be eliminated.' },
      { text: 'Subtract from the second: (4x − 2y) − (4x − 2y) = 10 − 6, so 0 = 4.', why: 'Both variables disappear, leaving a statement about numbers only.' },
      { text: '0 = 4 is false, so no pair satisfies both: the lines are parallel.', why: 'A false statement means the equations contradict each other.' },
    ],
    verify: 'The x- and y-parts are in ratio 2 : 1 but the constants are 10 and 3 (not 2 : 1), which also says "parallel".',
  },
  guided: {
    id: 'g-tv-l10', prompt: 'Classify the pair x − 2y = 1 and 3x − 6y = 3.',
    steps: [
      { id: 'g1', prompt: 'Compare the equations.', question: pick('tv-l10-g1', 'How is the second equation related to the first?', [
        ['It is the first multiplied by 3', null],
        ['It is the first plus 3', 'Each term is multiplied: x → 3x, −2y → −6y, 1 → 3.', 'added-instead'],
      ], '×3 throughout.', undefined, 'tp10-compare'), hints: ['Divide each term of the second by 3.'] },
      { id: 'g2', prompt: 'Classify.', question: pick('tv-l10-g2', 'How many solutions does the pair have?', [
        ['Infinitely many', null],
        ['Exactly one', 'They are the same line, so they share every point.', 'missed-multiple'],
        ['None', 'The constants also multiply by 3, so the lines coincide.', 'none-vs-many'],
      ], 'Same line.', undefined, 'tp10-many'), hints: ['Are the constants in the same ratio?'] },
    ],
    conclusion: 'The second equation is 3 times the first, so they are one line: infinitely many solutions.',
  },
  independent: [
    ind('i1', 'No solution', 'none', 'Classify.', pick('tv-l10-i1', 'How many solutions do x − y = 1 and x − y = 4 have?', [
      ['None', null],
      ['Exactly one', 'The left sides are identical but the right sides differ, so subtracting gives 0 = 3: impossible.', 'missed-contradiction'],
      ['Infinitely many', 'They would need the same right-hand side to be the same line.', 'none-vs-many'],
    ], 'Parallel lines.'), ['Subtract the equations.'], ['0 = 3 is false, so no solution.']),
    ind('i2', 'Infinitely many', 'many', 'Classify.', pick('tv-l10-i2', 'How many solutions do 2x + 6y = 10 and x + 3y = 5 have?', [
      ['Infinitely many', null],
      ['None', 'The first is exactly twice the second, constants included: the same line.', 'none-vs-many'],
      ['Exactly one', 'They are the same line, so they share every point.', 'missed-multiple'],
    ], 'Same line.'), ['Halve the first equation.'], ['Half of 2x + 6y = 10 is x + 3y = 5: the same equation.']),
    ind('i3', 'One solution', 'one', 'Classify.', pick('tv-l10-i3', 'How many solutions do x + y = 4 and x − y = 2 have?', [
      ['Exactly one', null],
      ['None', 'The y-parts have different signs, so the lines have different steepness and must cross.', 'none-vs-many'],
      ['Infinitely many', 'Neither equation is a multiple of the other.', 'missed-multiple'],
    ], 'They cross at (3, 1).'), ['Are the x- and y-parts in the same ratio?'], ['1 : 1 vs 1 : −1 are different ratios, so one solution: (3, 1).']),
    ind('i4', 'Infinitely many', 'many', 'Find k.', numQ('tv-l10-i4', 'For which k do x + 2y = 3 and 2x + ky = 6 have infinitely many solutions?', 4, 'The second must be twice the first: 2x + 4y = 6, so k = 4.', { rules: [[[2], 'With k = 2 the second equation is 2x + 2y = 6, which is not a multiple of x + 2y = 3.', 'partial-multiple']] }), ['The second equation must be the first times 2.'], ['2 × (x + 2y = 3) is 2x + 4y = 6, so k = 4.']),
  ],
  reflection: {
    discover: 'A pair of linear equations has exactly one solution (lines cross), none (parallel lines) or infinitely many (the same line), and the algebra shows which: a value, a false statement, or a true statement.',
    evidence: 'Elimination gave 0 = 3 for parallel lines and 0 = 0 for the same line.',
    stillConfusing: [{ text: 'What does 0 = 0 mean?', refresherId: 'tp10-many' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 11: Solving a pair by drawing lines (13.6)
// ---------------------------------------------------------------------------

export const L11: EduLesson = {
  id: 'tv-l11', unitId: 'tunit-5', number: 11, title: 'Solving a pair by drawing lines',
  objective: 'solve a pair of linear equations graphically by drawing both lines and reading the meeting point, and know when the graph can only give an approximate answer.',
  prerequisiteIds: ['tp-plane'],
  objectives: [{ id: 'read', label: 'Read the solution from the meeting point' }, { id: 'limits', label: 'Know when a graph gives only an estimate' }],
  steps: [
    {
      id: 'tp11-meet', title: 'Where the lines meet', phase: 'observe',
      paragraphs: [
        'Draw x + y = 6 (through (0, 6) and (6, 0)) and x − y = 2 (through (2, 0) and (4, 2)). The lines meet at (4, 2).',
        'The meeting point is on both lines, so it satisfies both equations: it is the solution. Check: 4 + 2 = 6 and 4 − 2 = 2.',
      ],
      visual: pairVisual([[1, 1, -6], [1, -1, -2]], ['x + y = 6', 'x − y = 2'], 'The lines x + y = 6 and x − y = 2 meeting at (4, 2).', 8),
      check: pick('chk-tp11-meet', 'Why is the meeting point the solution of the pair?', [
        ['It lies on both lines, so it satisfies both equations', null],
        ['It is the highest point of the graph', 'Height has nothing to do with it; the point must lie on both lines.', 'graph-feature-confusion'],
        ['It is where a line crosses an axis', 'An axis crossing satisfies only one equation (and x = 0 or y = 0).', 'intercept-confusion'],
      ], 'On both lines means it satisfies both equations.', undefined, 'tp11-meet'),
    },
    {
      id: 'tp11-cases', title: 'Three possible pictures', phase: 'reasoning',
      paragraphs: [
        'Two lines in a plane can cross at one point (one solution), be parallel (no solution), or lie on top of each other (infinitely many). The graph shows at a glance which case you are in.',
      ],
      visual: pairVisual([[2, -1, 1], [2, -1, -3]], ['y = 2x + 1', 'y = 2x − 3'], 'Two parallel lines with the same steepness: y = 2x + 1 and y = 2x − 3.'),
      check: pick('chk-tp11-cases', 'Two lines on a graph are parallel. How many solutions does the pair have?', [
        ['None', null],
        ['Exactly one', 'Parallel lines never meet, so there is no shared point.', 'none-vs-many'],
        ['Infinitely many', 'That is when the lines lie on top of each other, not side by side.', 'none-vs-many'],
      ], 'No meeting point, no solution.', undefined, 'tp11-cases'),
    },
    {
      id: 'tp11-limits', title: 'When the graph can only estimate', phase: 'apply',
      paragraphs: [
        'x + y = 5 and x − y = 2 meet at (3.5, 1.5). On squared paper you can see the lines cross "between 3 and 4", but you cannot read 3.5 exactly unless the grid is fine enough.',
        'Graphs show how many solutions there are and roughly where; algebra (substitution or elimination) gives the exact values.',
      ],
      visual: pairVisual([[1, 1, -5], [1, -1, -2]], ['x + y = 5', 'x − y = 2'], 'The lines x + y = 5 and x − y = 2 meeting at (3.5, 1.5), between grid points.', 6),
      check: pick('chk-tp11-limits', 'A graph shows two lines crossing between x = 3 and x = 4. How do you find the exact x?', [
        ['Solve the pair by substitution or elimination', null],
        ['Read it more carefully from the graph', 'A drawing can only be as precise as its grid; algebra gives the exact value.', 'graph-exact'],
      ], 'Use algebra for exact values.', undefined, 'tp11-limits'),
    },
  ],
  investigation: LAB,
  worked: {
    id: 'w-tv-l11', title: 'A graphical solution',
    given: ['2x + y = 7', 'x − y = 2'],
    ask: 'Solve the pair by drawing both lines.',
    steps: [
      { text: 'For 2x + y = 7, two points: (0, 7) and (3, 1). Draw the line through them.', why: 'Two solutions of an equation fix its line.' },
      { text: 'For x − y = 2, two points: (2, 0) and (4, 2). Draw the line.', why: 'Choose x, work out y, plot.' },
      { text: 'The lines meet at (3, 1).', why: 'The meeting point lies on both lines.' },
      { text: 'Check: 2 × 3 + 1 = 7 and 3 − 1 = 2.', why: 'A graphical answer should always be checked in both equations.' },
    ],
    verify: 'Both equations hold at (3, 1).',
  },
  guided: {
    id: 'g-tv-l11', prompt: 'Solve y = x + 1 and y = −x + 5 by drawing.',
    steps: [
      { id: 'g1', prompt: 'Start the first line.', question: numQ('tv-l11-g1', 'Where does y = x + 1 cross the y-axis (the value of y when x = 0)?', 1, 'x = 0 gives y = 1.'), hints: ['Put x = 0.'] },
      { id: 'g2', prompt: 'The meeting point.', question: solvePair('tv-l11-g2', 'Where do the two lines meet?', 2, 3, 'x + 1 = −x + 5 gives x = 2, y = 3.', 'The meeting point has the same y on both lines: x + 1 = −x + 5.', pairVisual([[1, -1, 1], [1, 1, -5]], ['y = x + 1', 'y = −x + 5'], 'The lines y = x + 1 and y = −x + 5.', 6)), hints: ['Read where the lines cross, then check.'] },
    ],
    conclusion: 'They meet at (2, 3): 3 = 2 + 1 and 3 = −2 + 5.',
  },
  independent: [
    ind('i1', 'Reading the solution', 'read', 'From the graph.', solvePair('tv-l11-i1', 'Solve x + 2y = 8 and x − y = 2 from the graph (then check).', 4, 2, 'They meet at (4, 2): 4 + 4 = 8 and 4 − 2 = 2.', 'Read the crossing point, then check it in both equations.', pairVisual([[1, 2, -8], [1, -1, -2]], ['x + 2y = 8', 'x − y = 2'], 'The lines x + 2y = 8 and x − y = 2.', 8)), ['Find where the lines cross.'], ['They meet at (4, 2).', 'Check: 4 + 4 = 8 ✓, 4 − 2 = 2 ✓.']),
    ind('i2', 'Three pictures', 'read', 'Same line.', pick('tv-l11-i2', 'The graphs of two equations lie exactly on top of each other. How many solutions does the pair have?', [
      ['Infinitely many', null],
      ['Exactly one', 'Every point of the line is on both graphs.', 'none-vs-many'],
      ['None', 'They share every point, not none.', 'none-vs-many'],
    ], 'The same line.'), ['How many points do they share?'], ['Every point of the line: infinitely many.']),
    ind('i3', 'Estimates', 'limits', 'Exact or estimate?', pick('tv-l11-i3', 'Lines drawn on a 1-unit grid seem to cross near (3.5, 1.5). What is the best statement?', [
      ['The graph suggests about (3.5, 1.5); solve algebraically to be sure', null],
      ['The answer is exactly (3.5, 1.5) because the graph shows it', 'A drawing is only as accurate as the grid and the pencil; confirm with algebra.', 'graph-exact'],
    ], 'Confirm with algebra.'), ['How precise is a hand-drawn graph?'], ['Use algebra to confirm the exact values.']),
    ind('i4', 'Reading the solution', 'read', 'A horizontal line.', numQ('tv-l11-i4', 'Where do y = 2x and y = 6 meet? Give x.', 3, '2x = 6, so x = 3 (the point is (3, 6)).', { rules: [[[6], '6 is y. The x-value on y = 2x where y = 6 is 3.', 'gave-other-variable']] }), ['y = 6 is horizontal.'], ['2x = 6, x = 3.']),
  ],
  reflection: {
    discover: 'Drawing both lines solves a pair of equations: the meeting point is the solution, parallel lines mean no solution, and one line means infinitely many. Algebra confirms exact values.',
    evidence: 'You read meeting points, checked them in both equations, and saw a crossing that falls between grid points.',
    stillConfusing: [{ text: 'Why is the crossing the solution?', refresherId: 'tp11-meet' }],
  },
};
