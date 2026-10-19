/**
 * Two Variables, One Line: Learn lessons 1 to 3 (EDU-1M5): from a situation to
 * an equation, standard form, and solutions as ordered pairs. Textbook
 * Sections 13.1, 13.1.1 and 13.2.1. Wording, figures and questions are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { ind, numQ, pick, tvVisual } from './questions';

export const LAB = '/mathematics/two-variables/workbench';
const lab = (description: string): Investigation => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

// ---------------------------------------------------------------------------
// Lesson 1: Two quantities, one equation  (13.1)
// ---------------------------------------------------------------------------

export const L1: EduLesson = {
  id: 'tv-l1', unitId: 'tunit-1', number: 1, title: 'Two quantities, one equation',
  objective: 'turn a situation with two unknown quantities into an equation, say what each part means, and see why one equation has many solutions.',
  prerequisiteIds: ['tp-variables'],
  objectives: [
    { id: 'write', label: 'Write an equation for a situation' },
    { id: 'interpret', label: 'Say what the parts and the solutions mean' },
    { id: 'identify', label: 'Tell a linear equation in two variables from other equations' },
  ],
  steps: [
    {
      id: 't1-story', title: 'A shopping story', phase: 'observe',
      paragraphs: [
        'Radha buys some kilograms of mangoes at ₹60 per kg and some kilograms of bananas at ₹50 per kg, and pays ₹280 in all. We do not know how much of each she bought, so we give the unknowns letters: x = kilograms of mangoes and y = kilograms of bananas.',
        'The mangoes cost 60x rupees and the bananas cost 50y rupees. Together that is ₹280, so 60x + 50y = 280. Both sides of the equation are the same thing, the total cost in rupees. This is a linear equation in two variables.',
      ],
      vocabulary: [{ term: 'variable', meaning: 'a letter for an unknown number, here x and y' }],
      visual: tvVisual({ mode: 'line', eq: [60, 50, -280], point: [2, 3], step: 0.5, restrict: 'nonneg', extent: 6, edit: 'none' }, 'The shopping equation 60x + 50y = 280 with a test point you can move.'),
      notice: 'Move the test point. The check under the graph substitutes it into 60x + 50y and compares with 280.',
      check: pick('chk-t1-story', 'Mangoes cost ₹60 per kg and bananas ₹50 per kg. x kg of mangoes and y kg of bananas cost ₹280 in all. Which equation says this?', [
        ['60x + 50y = 280', null],
        ['50x + 60y = 280', 'The prices are swapped. Mangoes cost ₹60 per kg and x is the kilograms of mangoes, so 60 goes with x.', 'coefficient_swapped'],
        ['60 + 50 = 280', 'This has no x or y, and it is false. The cost of mangoes is 60 times the number of kilograms: 60x.', 'no_variables'],
        ['60xy = 280', 'xy would multiply the two amounts together. The costs are added: 60x plus 50y.', 'product_for_sum'],
      ], 'Cost of mangoes plus cost of bananas equals the total.', undefined, 't1-story'),
    },
    {
      id: 't1-many', title: 'Why one equation has many solutions', phase: 'observe',
      paragraphs: [
        'Radha could have bought 3 kg of mangoes and 2 kg of bananas: 60 × 3 + 50 × 2 = 180 + 100 = 280. She could also have bought 0.5 kg of mangoes and 5 kg of bananas: 30 + 250 = 280. There is only one equation but two unknowns, so we can choose one amount freely and the other is then decided.',
        'Each choice that works is a solution: a pair of values for x and y. The table lists some. This is evidence from a few rows; Lesson 3 explains why there are always infinitely many.',
      ],
      visual: tvVisual({ mode: 'line', eq: [60, 50, -280], table: [0, 1, 2, 3, 4], step: 0.5, restrict: 'nonneg', extent: 6, edit: 'none' }, 'A table of solutions of 60x + 50y = 280.'),
      notice: 'Change an x in the table. The y beside it is worked out from the equation, and the point appears on the graph.',
      check: pick('chk-t1-many', '3 kg of mangoes and 2 kg of bananas cost ₹280. Is that the only way to spend exactly ₹280?', [
        ['No: for example 0.5 kg of mangoes and 5 kg of bananas also cost ₹280.', null],
        ['Yes: the equation gives one answer.', 'One equation with two unknowns usually has many answers. Try x = 0.5: 60 × 0.5 + 50y = 280 gives y = 5.', 'one_solution_only'],
      ], 'Choose one quantity freely and the other follows.', undefined, 't1-many'),
    },
    {
      id: 't1-other', title: 'The same idea in other stories',
      paragraphs: [
        'Any time two unknown amounts combine into a known total you can write an equation like this. A notebook costs ₹12 and a pen ₹5: x notebooks and y pens for ₹100 give 12x + 5y = 100. A cyclist rides x hours at 12 km per hour and y hours at 8 km per hour to cover 40 km: 12x + 8y = 40 (distance is speed times time, added up). Two numbers with total 10: x + y = 10.',
        'In each case the numbers beside x and y are the unit prices or speeds, and the number on the right is the total.',
      ],
      check: pick('chk-t1-other', 'A notebook costs ₹12 and a pen ₹5. You buy x notebooks and y pens for ₹100 in all. Which equation fits?', [
        ['12x + 5y = 100', null],
        ['5x + 12y = 100', 'That gives the notebooks the price of a pen. x notebooks cost 12 each: 12x.', 'coefficient_swapped'],
        ['17xy = 100', 'The costs of the notebooks and the pens are added, not multiplied together.', 'product_for_sum'],
      ], 'Notebooks 12x plus pens 5y make 100.', undefined, 't1-other'),
    },
  ],
  investigation: lab('Type 60x + 50y = 280 in the free laboratory and drag a point along the line.'),
  worked: {
    id: 'w-tv-l1', title: 'Writing and testing an equation',
    given: ['Adult tickets cost ₹30 and child tickets cost ₹20.', 'A group pays ₹250 in all.'], ask: 'Write an equation, then test whether 5 adult and 5 child tickets could be the purchase.',
    steps: [
      { text: 'Let x = number of adult tickets and y = number of child tickets.', why: 'Name the two unknown amounts first.' },
      { text: 'Adults cost 30x and children cost 20y rupees, so 30x + 20y = 250.', why: 'The two costs add up to the total.' },
      { text: 'Test x = 5, y = 5: 30 × 5 + 20 × 5 = 150 + 100 = 250.', why: 'Substitute the numbers into the left side.' },
      { text: '250 = 250, so 5 adult and 5 child tickets match the total.', why: 'The left side equals the right side, so the pair satisfies the equation.' },
    ],
    verify: 'One more pair that works: x = 3, y = 8 gives 90 + 160 = 250.',
  },
  guided: {
    id: 'g-tv-l1', prompt: 'Pens cost ₹8 and notebooks cost ₹25. A student pays ₹130 for x pens and y notebooks.',
    steps: [
      { id: 'g1', prompt: 'What does 25y stand for?', question: pick('g-tv-l1-1', 'What does 25y stand for?', [
        ['The cost of the notebooks in rupees.', null],
        ['The number of notebooks.', 'The number of notebooks is y. 25y is 25 rupees times that number, the money spent on notebooks.', 'quantity_vs_cost'],
        ['The price of one notebook.', 'The price of one notebook is 25. 25y is the cost of all y notebooks.', 'price_vs_cost'],
      ], '25 rupees times y notebooks.', undefined, 't1-story'), hints: ['Price times number is cost.'] },
      { id: 'g2', prompt: 'Write the equation.', question: pick('g-tv-l1-2', 'Which equation says the pens and notebooks cost ₹130 in all?', [
        ['8x + 25y = 130', null],
        ['25x + 8y = 130', 'The prices are swapped. Pens cost 8 each and x is the number of pens.', 'coefficient_swapped'],
        ['x + y = 130', 'This says the numbers of items total 130, not the money. Use the prices.', 'count_for_cost'],
      ], 'Pens 8x plus notebooks 25y.', undefined, 't1-other'), hints: ['Pens: 8 rupees each, x of them.'] },
      { id: 'g3', prompt: 'Test 5 pens and 4 notebooks.', question: numQ('g-tv-l1-3', 'Work out 8x + 25y for x = 5 and y = 4.', 140, '8 × 5 + 25 × 4 = 40 + 100 = 140, which is not 130.', { refresherId: 't1-story', rules: [[[130], '130 is the total we want. The question asks for the value of 8x + 25y at this pair, which is 40 + 100.', 'target_for_value'], [[65], '65 is 40 + 25. The notebooks cost 25 × 4, not 25 × 1.', 'partial_substitution']] }), hints: ['Substitute x = 5 and y = 4.'] },
    ],
    conclusion: 'The pair (5, 4) gives 140, not 130, so it is not a solution.',
  },
  independent: [
    ind('i1', 'Writing', 'write', 'Pencils and erasers.', pick('tv-l1-i1', 'Pencils cost ₹4 and erasers ₹3. x pencils and y erasers cost ₹30 in all. Which equation fits?', [
      ['4x + 3y = 30', null],
      ['3x + 4y = 30', 'The prices are swapped. A pencil costs 4 and x is the number of pencils.', 'coefficient_swapped'],
      ['7xy = 30', 'The two costs are added, not multiplied.', 'product_for_sum'],
    ], 'Pencils 4x plus erasers 3y.', undefined, 't1-other'), ['Price × number for each, then add.'], ['4x + 3y = 30.']),
    ind('i2', 'Writing', 'write', 'Distance.', pick('tv-l1-i2', 'A person walks x hours at 5 km per hour and cycles y hours at 15 km per hour, covering 45 km. Which equation fits?', [
      ['5x + 15y = 45', null],
      ['5 + 15 = 45', 'This has no x or y. Distance is speed times time: 5x for walking and 15y for cycling.', 'no_variables'],
      ['5y + 15x = 45', 'The speeds are swapped. x is the walking time, so it goes with 5.', 'coefficient_swapped'],
    ], 'Distance = speed × time for each part.', undefined, 't1-other'), ['Distance = speed × time.'], ['5x + 15y = 45.']),
    ind('i3', 'Meaning', 'interpret', 'What is 50y?', pick('tv-l1-i3', 'In 60x + 50y = 280, what does 50y stand for?', [
      ['The money spent on bananas, in rupees.', null],
      ['The number of kilograms of bananas.', 'The number of kilograms is y. 50y is 50 rupees times that number.', 'quantity_vs_cost'],
      ['The price of a banana.', 'The price per kg is the 50. 50y is the cost of y kg.', 'price_vs_cost'],
    ], '50 rupees per kg times y kg.', undefined, 't1-story'), ['Look at the units: price times quantity.'], ['The money for bananas.']),
    ind('i4', 'Meaning', 'interpret', 'Only one solution?', pick('tv-l1-i4', '(3, 2) satisfies 60x + 50y = 280. Is it the only pair that does?', [
      ['No: choose any x and the equation gives a matching y, so there are many.', null],
      ['Yes: 280 can only be made one way.', 'Try x = 0.5: 60 × 0.5 + 50y = 280 gives y = 5. Another solution.', 'one_solution_only'],
      ['Yes, because the answer is a whole number.', 'Solutions need not be whole numbers, and there are others, such as (0.5, 5).', 'one_solution_only'],
    ], 'One equation, two unknowns: many solutions.', undefined, 't1-many'), ['Try a different x.'], ['(0.5, 5) also works.']),
    ind('i5', 'Identify', 'identify', 'Which is linear?', pick('tv-l1-i5', 'Which of these is a linear equation in two variables?', [
      ['2x + 3y = 7', null],
      ['xy = 6', 'xy multiplies the two variables, so it is not linear in x and y. A linear equation has x and y alone, not multiplied together.', 'product_of_variables'],
      ['x² + y = 3', 'x² has a square, so it is not linear.', 'power_not_linear'],
    ], 'x and y appear to the first power only, added with numbers.', undefined, 't1-story'), ['Linear means no products or powers of the variables.'], ['2x + 3y = 7.']),
    ind('i6', 'Identify', 'identify', 'Count the variables.', pick('tv-l1-i6', 'Which of these is NOT an equation in two variables?', [
      ['x + y + z = 9', null],
      ['x + y = 10', 'This has exactly two variables, x and y.', 'miscount'],
      ['2x − y = 4', 'This also has exactly two variables, x and y.', 'miscount'],
    ], 'x + y + z has three variables.', undefined, 't1-story'), ['How many different letters?'], ['Three letters: x, y, z.']),
  ],
  reflection: {
    discover: 'Two unknown amounts that make a total give one equation in two variables, such as 60x + 50y = 280. The number beside each letter is a price or rate, and the equation has many solutions.',
    evidence: 'You moved a test point, filled a table, and wrote equations for new stories.',
    stillConfusing: [{ text: 'How do I write the equation?', refresherId: 't1-story' }, { text: 'Why are there many solutions?', refresherId: 't1-many' }, { text: 'Other stories?', refresherId: 't1-other' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: Standard form  (13.1.1)
// ---------------------------------------------------------------------------

export const L2: EduLesson = {
  id: 'tv-l2', unitId: 'tunit-1', number: 2, title: 'Standard form: ax + by + c = 0',
  objective: 'write any linear equation in two variables as ax + by + c = 0, read off a, b and c, and handle the special cases.',
  prerequisiteIds: ['tp-variables', 'tp-signed'],
  objectives: [
    { id: 'read', label: 'Read a, b and c' },
    { id: 'convert', label: 'Rewrite an equation in standard form' },
    { id: 'special', label: 'Handle the special cases' },
  ],
  steps: [
    {
      id: 't2-form', title: 'One shape for every equation', phase: 'observe',
      paragraphs: [
        'Every linear equation in two variables can be written as ax + by + c = 0, where a, b and c are numbers and a and b are not both zero. This is the standard form. The numbers a and b are the coefficients of x and y, and c is the constant.',
        'For example 3x + 2y = 12 becomes 3x + 2y − 12 = 0: here a = 3, b = 2, c = −12. Move the 12 to the left side and its sign changes.',
      ],
      vocabulary: [{ term: 'coefficient', meaning: 'the number multiplying a variable' }, { term: 'constant', meaning: 'the number with no variable, c' }],
      visual: tvVisual({ mode: 'line', eq: [3, 2, -12], edit: 'abc', extent: 10 }, 'The equation 3x + 2y − 12 = 0 with a, b and c you can change.'),
      notice: 'Change a, b or c and watch both forms of the equation and the line.',
      check: pick('chk-t2-form', 'Write 3x + 2y = 12 in the form ax + by + c = 0. What is c?', [
        ['−12', null],
        ['12', 'Moving 12 from the right side to the left changes its sign: 3x + 2y − 12 = 0, so c = −12.', 'sign_not_changed'],
        ['0', 'c is the constant left on the left side after everything is moved over. Here it is −12.', 'c_is_zero'],
      ], 'Subtract 12 from both sides.', undefined, 't2-form'),
    },
    {
      id: 't2-convert', title: 'Moving terms and clearing fractions',
      paragraphs: [
        'To reach standard form, move every term to the left side so that the right side is 0. Moving a term across the equals sign changes its sign. So 2x − 3 = 5y − 1 becomes 2x − 5y − 3 + 1 = 0, that is 2x − 5y − 2 = 0, and a = 2, b = −5, c = −2.',
        'If there are fractions you may multiply the whole equation by a number to clear them, which keeps the same solutions. x/2 + y/3 − 1 = 0 times 6 gives 3x + 2y − 6 = 0.',
      ],
      misconception: { wrong: 'In 2x − 5y − 2 = 0, b = 5.', right: 'The sign belongs to the coefficient: the term is −5y, so b = −5.' },
      check: pick('chk-t2-convert', 'In 2x − 5y − 2 = 0, what is b?', [
        ['−5', null],
        ['5', 'The term is −5y, so the coefficient of y is −5. Keep the minus sign.', 'sign_dropped'],
        ['−2', '−2 is the constant c. b is the coefficient of y.', 'coefficient_confused'],
      ], 'b goes with y, sign included.', undefined, 't2-convert'),
    },
    {
      id: 't2-special', title: 'Special cases', phase: 'reasoning',
      paragraphs: [
        'An equation with only x, such as 7 + 4x = 0, is also an equation in two variables: write it as 4x + 0 × y + 7 = 0, so a = 4, b = 0, c = 7. Likewise 3y − 6 = 0 has a = 0.',
        'But a and b cannot both be zero. If a = 0 and b = 0 the equation says c = 0, which is either always true or never true, and there is no line. Set a and b both to 0 in the figure above to see this.',
      ],
      visual: tvVisual({ mode: 'line', eq: [4, 0, 7], edit: 'abc', extent: 10 }, 'The equation 4x + 0y + 7 = 0, a vertical line, with a, b and c you can change.'),
      notice: 'Set b = 0: the line becomes vertical. Set both a and b to 0: there is no line.',
      check: pick('chk-t2-special', 'For 7 + 4x = 0 written as ax + by + c = 0, which is right?', [
        ['a = 4, b = 0, c = 7', null],
        ['a = 7, b = 4, c = 0', 'The coefficients are not read in the order they appear. 4x is the x-term, so a = 4, and there is no y-term, so b = 0.', 'order_misread'],
        ['It cannot be written this way.', 'It can: 4x + 0y + 7 = 0 has a = 4, b = 0, c = 7. Only a = b = 0 is excluded.', 'special_case_excluded'],
      ], 'A missing term has coefficient 0.', undefined, 't2-special'),
    },
  ],
  investigation: lab('Change a, b and c in the free laboratory and see the equation and line together.'),
  worked: {
    id: 'w-tv-l2', title: 'Rewriting in standard form',
    given: ['The equation 4 + 3y = 2x − 5.'], ask: 'Write it as ax + by + c = 0 and state a, b and c.',
    steps: [
      { text: 'Move everything to the left: 4 + 3y − 2x + 5 = 0.', why: 'Subtract 2x and add 5 on both sides, so the right side becomes 0.' },
      { text: 'Collect and order the terms: −2x + 3y + 9 = 0.', why: '4 + 5 = 9, and the x-term is written first.' },
      { text: 'So a = −2, b = 3, c = 9.', why: 'Read each coefficient with its sign.' },
      { text: 'Multiplying by −1 gives 2x − 3y − 9 = 0, with a = 2, b = −3, c = −9.', why: 'Multiplying the whole equation by a nonzero number keeps the same solutions, so both forms are correct.' },
    ],
    verify: 'Check with the pair (9, 3): the original gives 4 + 3 × 3 = 13 and 2 × 9 − 5 = 13, so both sides agree.',
  },
  guided: {
    id: 'g-tv-l2', prompt: 'Write 2x + 3y = 7 in standard form.',
    steps: [
      { id: 'g1', prompt: 'Move 7 to the left.', question: pick('g-tv-l2-1', 'What do you get after moving 7 to the left side?', [
        ['2x + 3y − 7 = 0', null],
        ['2x + 3y + 7 = 0', 'The sign must change when a term crosses the equals sign: +7 on the right becomes −7 on the left.', 'sign_not_changed'],
      ], 'Subtract 7 from both sides.', undefined, 't2-convert'), hints: ['Subtract 7 from both sides.'] },
      { id: 'g2', prompt: 'Find c.', question: numQ('g-tv-l2-2', 'In 2x + 3y − 7 = 0, what is c?', -7, 'c is the constant, with its sign: −7.', { refresherId: 't2-form', rules: [[[7], 'The constant is −7. The minus sign belongs to c.', 'sign_dropped']] }), hints: ['Look at the number without a letter.'] },
    ],
    conclusion: 'a = 2, b = 3, c = −7.',
  },
  independent: [
    ind('i1', 'Reading', 'read', 'Find c.', numQ('tv-l2-i1', 'In 5x + 2y − 7 = 0, what is c?', -7, 'c is the number without a variable, with its sign: −7.', { refresherId: 't2-form', rules: [[[7], 'The sign belongs to c: the term is − 7, so c = −7.', 'sign_dropped'], [[2], '2 is b. c is the term with no letter.', 'coefficient_confused']] }), ['Which term has no letter?'], ['c = −7.']),
    ind('i2', 'Reading', 'read', 'Find b.', numQ('tv-l2-i2', 'In 2x − 5y + 3 = 0, what is b?', -5, 'The y-term is −5y, so b = −5.', { refresherId: 't2-convert', rules: [[[5], 'Keep the minus sign: the term is −5y.', 'sign_dropped'], [[3], '3 is c, the constant.', 'coefficient_confused']] }), ['b goes with y.'], ['b = −5.']),
    ind('i3', 'Converting', 'convert', 'Move the constant.', numQ('tv-l2-i3', 'Write 4x + y = 9 as ax + by + c = 0. Find c.', -9, 'Subtract 9 from both sides: 4x + y − 9 = 0, so c = −9.', { refresherId: 't2-convert', rules: [[[9], 'Moving 9 across the equals sign changes its sign, so c = −9.', 'sign_not_changed']] }), ['Subtract 9 from both sides.'], ['c = −9.']),
    ind('i4', 'Converting', 'convert', 'Both sides.', numQ('tv-l2-i4', 'Write 2x − 3 = 5y − 1 as ax + by + c = 0 with a = 2. Find c.', -2, 'Move everything to the left: 2x − 5y − 3 + 1 = 0, so 2x − 5y − 2 = 0 and c = −2.', { refresherId: 't2-convert', rules: [[[-4], '−4 is −3 − 1. The −1 on the right moves across and becomes +1, so c = −3 + 1.', 'sign_not_changed'], [[2], 'c = −3 + 1 = −2. Check the signs.', 'sign_error']] }), ['Subtract 5y and add 1 on both sides.'], ['c = −2.']),
    ind('i5', 'Converting', 'convert', 'Clear fractions.', numQ('tv-l2-i5', 'Multiply x/2 + y/3 − 1 = 0 by 6. What is the coefficient of y in the new equation?', 2, '6 × y/3 = 2y, so the coefficient of y is 2 (the equation becomes 3x + 2y − 6 = 0).', { refresherId: 't2-convert', rules: [[[3], '3 is the coefficient of x (6 × x/2). The y-term is 6 × y/3 = 2y.', 'coefficient_confused'], [[1], 'The whole equation is multiplied by 6, including the y-term: 6 × y/3 = 2y.', 'multiplied_one_term']] }), ['Multiply every term by 6.'], ['2.']),
    ind('i6', 'Special cases', 'special', 'Only x.', pick('tv-l2-i6', 'Write 7 + 4x = 0 as ax + by + c = 0. Which is right?', [
      ['a = 4, b = 0, c = 7', null],
      ['a = 7, b = 4, c = 0', 'The coefficients are not read in the order written. 4x is the x-term, and there is no y-term.', 'order_misread'],
      ['It is not an equation in two variables.', 'It is, as 4x + 0y + 7 = 0. A missing term has coefficient 0.', 'special_case_excluded'],
    ], 'A missing y-term means b = 0.', undefined, 't2-special'), ['Where is the y-term?'], ['4x + 0y + 7 = 0.']),
    ind('i7', 'Special cases', 'special', 'Not allowed.', pick('tv-l2-i7', 'For which values of a and b is ax + by + c = 0 NOT a linear equation in two variables?', [
      ['a = 0 and b = 0', null],
      ['a = 0 and b = 5', 'With a = 0 it is 5y + c = 0, a horizontal line, which is allowed. Only both zero is excluded.', 'one_zero_excluded'],
      ['c = 0', 'c = 0 is fine: the line passes through the origin.', 'c_zero_excluded'],
    ], 'a and b cannot both be zero.', undefined, 't2-special'), ['What happens to the line when both are zero?'], ['a = b = 0.']),
  ],
  reflection: {
    discover: 'Every linear equation in two variables can be written ax + by + c = 0 with a, b not both zero. Moving a term changes its sign; a missing term has coefficient 0.',
    evidence: 'You changed a, b and c and watched the line, and converted equations to standard form.',
    stillConfusing: [{ text: 'What are a, b and c?', refresherId: 't2-form' }, { text: 'How do I move terms?', refresherId: 't2-convert' }, { text: 'What about special cases?', refresherId: 't2-special' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: Solutions are ordered pairs  (13.2.1)
// ---------------------------------------------------------------------------

export const L3: EduLesson = {
  id: 'tv-l3', unitId: 'tunit-2', number: 3, title: 'Solutions are ordered pairs',
  objective: 'test an ordered pair by substitution, see why the order matters, find new solutions by choosing a value, and understand why there are infinitely many.',
  prerequisiteIds: ['tp-variables', 'tp-signed', 'tp-equations'],
  objectives: [
    { id: 'check', label: 'Test a pair by substitution' },
    { id: 'find', label: 'Find solutions from a chosen value' },
    { id: 'order', label: 'Know that (x, y) is not (y, x)' },
  ],
  steps: [
    {
      id: 't3-check', title: 'Does a pair fit?', phase: 'observe',
      paragraphs: [
        'A solution of an equation in two variables is a pair of values for x and y that make the equation true. For 3x + 2y = 12, x = 2 and y = 3 works: 3 × 2 + 2 × 3 = 6 + 6 = 12. We write the pair as (2, 3).',
        'To test any pair, put the numbers in and compare both sides. If they are equal the pair is a solution; if not, it is not.',
      ],
      visual: tvVisual({ mode: 'line', eq: [3, 2, -12], point: [2, 3], extent: 8, edit: 'none' }, 'The equation 3x + 2y = 12 with a test point (2, 3) you can move.'),
      notice: 'Move the point and read the substitution. Which points are solutions?',
      check: pick('chk-t3-check', 'Is (4, 0) a solution of 3x + 2y = 12?', [
        ['Yes: 3 × 4 + 2 × 0 = 12.', null],
        ['No: y = 0 means nothing is there.', 'y = 0 is a perfectly good value. 3 × 4 + 2 × 0 = 12 + 0 = 12, so (4, 0) is a solution.', 'zero_not_a_value'],
        ['No: 3 × 4 = 12 is too big.', 'The left side is 12 and the right side is 12, so they match. It is a solution.', 'miscalculation'],
      ], 'Substitute and compare: 12 = 12.', undefined, 't3-check'),
    },
    {
      id: 't3-order', title: 'The order matters', phase: 'observe',
      paragraphs: [
        'In (2, 3) the first number is x and the second is y. If we swap them we get (3, 2), a different pair and a different point. For 3x + 2y = 12: (2, 3) gives 12, but (3, 2) gives 3 × 3 + 2 × 2 = 13, which is not 12. So (2, 3) is a solution and (3, 2) is not.',
      ],
      visual: tvVisual({ mode: 'line', eq: [3, 2, -12], point: [2, 3], extent: 8, edit: 'none', swap: true }, 'The equation 3x + 2y = 12 with the test point (2, 3) and its reversed pair (3, 2) both checked.'),
      notice: 'The reversed pair is checked too. Find a point where both the pair and its reverse are solutions.',
      misconception: { wrong: '(2, 3) and (3, 2) are the same solution.', right: 'The first number is x. Swapping gives a different pair, and it may not satisfy the equation.' },
      check: pick('chk-t3-order', '(2, 3) is a solution of 3x + 2y = 12. Is (3, 2)?', [
        ['No: 3 × 3 + 2 × 2 = 13, not 12.', null],
        ['Yes: it uses the same numbers.', 'The numbers must go to the right variables. For (3, 2), x = 3 and y = 2, and 3 × 3 + 2 × 2 = 13.', 'pair_order_ignored'],
      ], 'Order matters: x comes first.', undefined, 't3-order'),
    },
    {
      id: 't3-find', title: 'Finding solutions', phase: 'apply',
      paragraphs: [
        'To find a solution, choose any value for x, put it in, and solve the one-variable equation for y. In 3x + 2y = 12 take x = 4: 12 + 2y = 12, so y = 0 and (4, 0) is a solution. Take x = 0: 2y = 12 so y = 6, and (0, 6) is a solution. Take x = 1: 3 + 2y = 12 so y = 4.5.',
        'You can choose x as any number at all, and each choice gives a matching y. So there are infinitely many solutions.',
      ],
      visual: tvVisual({ mode: 'line', eq: [3, 2, -12], table: [0, 1, 2, 4], extent: 8, edit: 'none' }, 'A table for 3x + 2y = 12: choose x, and y is worked out.'),
      notice: 'Type any x in the table, including negatives and fractions.',
      check: pick('chk-t3-find', 'In 3x + 2y = 12, you choose x = 2. What is y?', [
        ['3', null],
        ['6', '6 is the value of 3x. Then 6 + 2y = 12, so 2y = 6 and y = 3.', 'stopped_early'],
        ['12', '12 is the total. Substitute x = 2: 6 + 2y = 12, so y = 3.', 'target_for_value'],
      ], '6 + 2y = 12, so y = 3.', undefined, 't3-find'),
    },
  ],
  investigation: lab('Use the solution checker in the free laboratory on 3x + 2y = 12.'),
  worked: {
    id: 'w-tv-l3', title: 'Testing two pairs',
    given: ['The equation 2x + 5y = 20.'], ask: 'Is (5, 2) a solution? Is (2, 5)?',
    steps: [
      { text: 'Test (5, 2): x = 5 and y = 2.', why: 'The first number is x, the second is y.' },
      { text: '2 × 5 + 5 × 2 = 10 + 10 = 20, which equals the right side.', why: 'Substitute and compare both sides.' },
      { text: 'So (5, 2) is a solution.', why: 'Both sides are equal.' },
      { text: 'Test (2, 5): 2 × 2 + 5 × 5 = 4 + 25 = 29, not 20. So (2, 5) is not a solution.', why: 'Swapping the numbers puts them in the wrong places.' },
    ],
    verify: 'The same two numbers give a solution in one order and not in the other.',
  },
  guided: {
    id: 'g-tv-l3', prompt: 'Is (1, 5) a solution of 4x + y = 9?',
    steps: [
      { id: 'g1', prompt: 'Substitute.', question: numQ('g-tv-l3-1', 'Work out 4x + y for x = 1 and y = 5.', 9, '4 × 1 + 5 = 9.', { refresherId: 't3-check', rules: [[[21], '21 comes from 4 × 5 + 1 (x and y swapped). x = 1 and y = 5.', 'pair_order_ignored'], [[6], '6 is 1 + 5. The x-term is 4x, so use 4 × 1.', 'forgot_coefficient']] }), hints: ['4 × 1, then add 5.'] },
      { id: 'g2', prompt: 'Compare.', question: pick('g-tv-l3-2', 'The left side is 9 and the right side is 9. So (1, 5) is:', [
        ['a solution', null],
        ['not a solution', 'Equal sides mean the pair satisfies the equation.', 'miscomparison'],
      ], 'Equal sides mean a solution.', undefined, 't3-check'), hints: ['Equal means it works.'] },
    ],
    conclusion: '(1, 5) is a solution of 4x + y = 9.',
  },
  independent: [
    ind('i1', 'Checking', 'check', 'Left side value.', numQ('tv-l3-i1', 'For 4x + 3y = 20, find 4x + 3y at the pair (2, 5).', 23, '4 × 2 + 3 × 5 = 8 + 15 = 23, which is not 20, so (2, 5) is not a solution.', { refresherId: 't3-check', rules: [[[26], '26 comes from 4 × 5 + 3 × 2 (swapped). x = 2 and y = 5.', 'pair_order_ignored'], [[20], '20 is the right side. The question asks for the left side at this pair.', 'target_for_value']] }), ['Put x = 2 and y = 5 in.'], ['23.']),
    ind('i2', 'Checking', 'check', 'Which is a solution?', pick('tv-l3-i2', 'Which pair is a solution of x + 2y = 8?', [
      ['(2, 3)', null],
      ['(3, 2)', '3 + 2 × 2 = 7, not 8. The numbers are in the wrong order.', 'pair_order_ignored'],
      ['(8, 2)', '8 + 2 × 2 = 12, not 8.', 'miscalculation'],
      ['(0, 8)', '0 + 2 × 8 = 16, not 8: y was not doubled correctly.', 'miscalculation'],
    ], '2 + 2 × 3 = 8.', undefined, 't3-check'), ['Substitute each pair.'], ['(2, 3).']),
    ind('i3', 'Checking', 'check', 'Negative values.', pick('tv-l3-i3', 'Which pair is a solution of 2x − y = 7?', [
      ['(3, −1)', null],
      ['(3, 1)', '2 × 3 − 1 = 5, not 7. When y = 1 the term −y is −1, but the solution needs y = −1: 6 − (−1) = 7.', 'sign_error'],
      ['(−3, 1)', '2 × (−3) − 1 = −7, not 7.', 'sign_error'],
    ], '2 × 3 − (−1) = 6 + 1 = 7.', undefined, 't3-check'), ['Subtracting a negative adds.'], ['(3, −1).']),
    ind('i4', 'Finding', 'find', 'Choose x.', numQ('tv-l3-i4', 'In x + 2y = 8, x = 4. Find y.', 2, '4 + 2y = 8, so 2y = 4 and y = 2.', { refresherId: 't3-find', rules: [[[4], '4 is x. Then 2y = 8 − 4 = 4, so y = 2.', 'x_for_y'], [[8], '8 is the right side. Solve 4 + 2y = 8 for y.', 'target_for_value']] }), ['Substitute x = 4.'], ['y = 2.']),
    ind('i5', 'Finding', 'find', 'Choose y.', numQ('tv-l3-i5', 'In 3x − y = 5, y = −2. Find x.', 1, '3x − (−2) = 5, so 3x + 2 = 5, 3x = 3 and x = 1.', { refresherId: 't3-find', rules: [[[7 / 3], '7/3 comes from 3x = 5 + 2. Check the sign: −(−2) = +2, so 3x = 5 − 2 = 3.', 'sign_error'], [[-1], 'Check: 3 × (−1) − (−2) = −1, not 5.', 'sign_error']] }), ['−(−2) is +2.'], ['x = 1.']),
    ind('i6', 'Order', 'order', 'Swap them.', pick('tv-l3-i6', '(3, 2) is a solution of 2x + y = 8. Is (2, 3)?', [
      ['No: 2 × 2 + 3 = 7, not 8.', null],
      ['Yes: it is the same pair.', 'The order matters. In (2, 3), x = 2 and y = 3, and 2 × 2 + 3 = 7.', 'pair_order_ignored'],
    ], '(x, y) is not (y, x).', undefined, 't3-order'), ['Put x = 2 and y = 3 in.'], ['No.']),
    ind('i7', 'Order', 'order', 'Same numbers.', pick('tv-l3-i7', '(2, 1) is a solution of 5x + y = 11. Which is true of (1, 2)?', [
      ['It is not a solution: 5 × 1 + 2 = 7.', null],
      ['It is also a solution because it uses the same numbers.', 'The numbers must go to the right variables. For (1, 2), x = 1 and y = 2, and 5 × 1 + 2 = 7.', 'pair_order_ignored'],
    ], 'Order matters.', undefined, 't3-order'), ['Substitute x = 1, y = 2.'], ['7 ≠ 11.']),
  ],
  reflection: {
    discover: 'A solution is an ordered pair (x, y) that makes the equation true; swapping the numbers usually breaks it. Choosing any x and solving for y gives infinitely many solutions.',
    evidence: 'You tested pairs by substitution, tested their reverses, and used a table to find new solutions.',
    stillConfusing: [{ text: 'How do I test a pair?', refresherId: 't3-check' }, { text: 'Why does the order matter?', refresherId: 't3-order' }, { text: 'How do I find solutions?', refresherId: 't3-find' }],
  },
};
