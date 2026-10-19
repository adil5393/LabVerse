/**
 * Understanding Data: Learn lessons 1 to 3 (EDU-1M6): average of averages, weighted
 * means, and mixtures. Textbook Sections 10.1.1, 10.1.3 and 10.1.2. Wording,
 * figures and numbers are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { ind, numQ, pick, weightedVisual } from './questions';

export const LAB = '/mathematics/understanding-data/workbench';
const lab = (description: string): Investigation => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

const marks = (a: number, b: number, na: number, nb: number, intro: string) =>
  weightedVisual({ mode: 'groups', items: [{ label: 'Class A', value: a, weight: na }, { label: 'Class B', value: b, weight: nb }], valueLabel: 'average mark', weightLabel: 'students' }, intro);

// ---------------------------------------------------------------------------
// Lesson 1: Average of averages  (10.1.1)
// ---------------------------------------------------------------------------

export const L1: EduLesson = {
  id: 'ud-l1', unitId: 'uunit-1', number: 1, title: 'The average of averages',
  objective: 'find the true average of two groups from their averages and sizes, and say when the plain average of the two averages does and does not work.',
  prerequisiteIds: ['up-average'],
  objectives: [
    { id: 'combine', label: 'Combine group averages using the group sizes' },
    { id: 'judge', label: 'Judge when the plain average of averages works' },
  ],
  steps: [
    {
      id: 'u1-trap', title: 'A tempting shortcut', phase: 'observe',
      paragraphs: [
        'Class A has 30 students with an average mark of 60. Class B has 10 students with an average mark of 80. What is the average mark of all 40 students together?',
        'It is tempting to average the two averages: (60 + 80) ÷ 2 = 70. The figure below shows both. The wide bar is Class A (many students) and the narrow one is Class B (few students); the area of each bar is its total marks.',
      ],
      visual: marks(60, 80, 30, 10, 'Two classes: the average of averages and the true combined average.'),
      notice: 'Compare the plain average with the weighted mean. Which class pulls the true average more, and why?',
      check: pick('chk-u1-trap', 'Class A: 30 students, average 60. Class B: 10 students, average 80. What is the average of all 40 students?', [
        ['65', null],
        ['70', '70 treats the two classes as if they had the same number of students. Class A has three times as many, so it should count three times as much.', 'average_of_averages'],
        ['140', '140 adds the two averages. An average is not a total, and the answer must lie between 60 and 80.', 'added_averages'],
        ['60', 'The average of everyone is not just Class A\'s average: Class B\'s higher marks must pull it up a little.', 'one_group_only'],
      ], '(30 × 60 + 10 × 80) ÷ 40 = 2600 ÷ 40 = 65.', undefined, 'u1-trap'),
    },
    {
      id: 'u1-why', title: 'Why it works: totals, not averages', phase: 'reasoning',
      paragraphs: ['An average is a total divided by a count, so a total is an average times a count. To combine groups, add the TOTALS and divide by the combined COUNT. This is a reason, not just a pattern from one example.'],
      visual: marks(60, 80, 30, 10, 'The same two classes: area is total marks.'),
      proof: [
        { claim: 'Class A\'s total marks = 30 × 60 = 1800.', reason: 'Average = total ÷ count, so total = average × count.' },
        { claim: 'Class B\'s total marks = 10 × 80 = 800.', reason: 'The same rule for Class B.' },
        { claim: 'Everyone together: total 1800 + 800 = 2600 marks and 30 + 10 = 40 students.', reason: 'Totals add and counts add.' },
        { claim: 'Combined average = 2600 ÷ 40 = 65.', reason: 'Average = total ÷ count. In general it is (a × n + b × m) ÷ (n + m) for averages a and b of n and m values.' },
      ],
      check: pick('chk-u1-why', 'Group P has 5 values with average 10 and group Q has 15 values with average 20. What is P\'s total?', [
        ['50', null],
        ['10', '10 is the average. The total is the average times the count: 5 × 10.', 'average_for_total'],
        ['15', '15 is the plain average of 10 and 20, not the total of P. That total is 5 × 10.', 'confused'],
      ], 'Total = average × count = 5 × 10 = 50.', undefined, 'u1-why'),
    },
    {
      id: 'u1-equal', title: 'When the shortcut does work', phase: 'conjecture',
      paragraphs: ['Make the two groups the same size and watch the weighted mean and the plain average agree. If both groups have the same number of values, each counts equally, so averaging the averages is fine.'],
      visual: marks(60, 80, 20, 20, 'Two classes of equal size.'),
      notice: 'Change one size. When do the two figures differ?',
      check: pick('chk-u1-equal', 'Two classes have 20 students each, with averages 60 and 80. What is the combined average?', [
        ['70', null],
        ['65', '65 would be right if the sizes were 30 and 10. With equal sizes each class counts the same.', 'weights_ignored_reversed'],
        ['140', 'That adds the averages. The combined average is between 60 and 80.', 'added_averages'],
      ], 'Equal sizes: (60 + 80) ÷ 2 = 70.', undefined, 'u1-equal'),
    },
  ],
  investigation: lab('Open the weighted average explorer and change group sizes.'),
  worked: {
    id: 'w-ud-l1', title: 'Heights of two training groups',
    given: ['6 seniors have an average height of 170 cm.', '4 juniors have an average height of 150 cm.'], ask: 'Find the average height of all 10 players.',
    steps: [
      { text: 'Seniors\' total height = 6 × 170 = 1020 cm.', why: 'Total = average × count.' },
      { text: 'Juniors\' total height = 4 × 150 = 600 cm.', why: 'The same rule.' },
      { text: 'Everyone: 1020 + 600 = 1620 cm for 6 + 4 = 10 players.', why: 'Add totals, add counts.' },
      { text: 'Average = 1620 ÷ 10 = 162 cm.', why: 'Total ÷ count. The plain average of 170 and 150 is 160: the seniors outnumber the juniors, so the true average is higher.' },
    ],
    verify: '162 lies between 150 and 170 and is closer to 170, because there are more seniors.',
  },
  guided: {
    id: 'g-ud-l1', prompt: 'Group A has 12 students with an average of 50. Group B has 8 students with an average of 75.',
    steps: [
      { id: 'g1', prompt: 'Group A\'s total.', question: numQ('g-ud-l1-1', 'What is the total of Group A\'s values?', 600, '12 × 50 = 600.', { refresherId: 'u1-why', rules: [[[50], '50 is the average. The total is the average times the count.', 'average_for_total'], [[62], '62 is 12 + 50. Multiply the count by the average.', 'added_for_multiplied']] }), hints: ['Average × count.'] },
      { id: 'g2', prompt: 'Group B\'s total.', question: numQ('g-ud-l1-2', 'What is the total of Group B\'s values?', 600, '8 × 75 = 600.', { refresherId: 'u1-why', rules: [[[75], '75 is the average. The total is 8 × 75.', 'average_for_total']] }), hints: ['The same rule.'] },
      { id: 'g3', prompt: 'The combined average.', question: numQ('g-ud-l1-3', 'What is the average of all 20 values?', 60, '(600 + 600) ÷ 20 = 60.', { refresherId: 'u1-why', rules: [[[62.5], '62.5 is the plain average of 50 and 75. Group A has more values, so the true average is nearer 50.', 'average_of_averages'], [[1200], '1200 is the combined total. Divide by 20 values.', 'forgot_to_divide']] }), hints: ['Total ÷ count.'] },
    ],
    conclusion: 'The combined average is 60, not 62.5.',
  },
  independent: [
    ind('i1', 'Combining', 'combine', 'Two teams.', numQ('ud-l1-i1', 'Team X: 5 players, average 20 points. Team Y: 15 players, average 40 points. What is the average of all 20 players?', 35, '(5 × 20 + 15 × 40) ÷ 20 = (100 + 600) ÷ 20 = 35.', { refresherId: 'u1-why', rules: [[[30], '30 is the plain average of 20 and 40. Team Y has three times as many players.', 'average_of_averages'], [[700], '700 is the combined total. Divide by the 20 players.', 'forgot_to_divide']] }), ['Totals first.'], ['35.']),
    ind('i2', 'Combining', 'combine', 'Decimals.', numQ('ud-l1-i2', 'Group S has 6 values with an average of 7.5 and group T has 4 values with an average of 10. Find the average of all 10 values.', 8.5, '(45 + 40) ÷ 10 = 8.5.', { refresherId: 'u1-why', rules: [[[8.75], '8.75 is the plain average of 7.5 and 10. Group S has more values.', 'average_of_averages']] }), ['6 × 7.5 = 45.'], ['8.5.']),
    ind('i3', 'Combining', 'combine', 'Back to the total.', numQ('ud-l1-i3', '15 values have an average of 72. What is their total?', 1080, 'Total = 15 × 72 = 1080.', { refresherId: 'u1-why', rules: [[[72], '72 is the average. Multiply by 15 for the total.', 'average_for_total'], [[87], '87 is 15 + 72. The total is the product.', 'added_for_multiplied']] }), ['Average × count.'], ['1080.']),
    ind('i4', 'Judging', 'judge', 'When is it fine?', pick('ud-l1-i4', 'When is the plain average of two group averages equal to the true combined average?', [
      ['When the two groups have the same number of values.', null],
      ['Always: averages can always be averaged.', 'Not when the groups differ in size: a big group must count for more.', 'always_fine'],
      ['Only when one group is empty.', 'An empty group has no average to combine. Equal sizes are the key.', 'wrong_condition'],
    ], 'Equal sizes give each group equal weight.', undefined, 'u1-equal'), ['What did you change in the figure?'], ['Equal sizes.']),
    ind('i5', 'Judging', 'judge', 'Which way does it move?', pick('ud-l1-i5', '9 values have an average of 10 and 1 value is 50. Is the combined average closer to 10 or to 50?', [
      ['Closer to 10: the group of 9 counts nine times as much.', null],
      ['Exactly half way, 30.', '30 is the plain average of 10 and 50. The true combined average is (90 + 50) ÷ 10 = 14.', 'average_of_averages'],
      ['Closer to 50, the bigger value.', 'A single value cannot pull the average as far as nine values do.', 'largest_value_wins'],
    ], '(9 × 10 + 50) ÷ 10 = 14.', undefined, 'u1-trap'), ['How many values are in each group?'], ['Closer to 10.']),
    ind('i6', 'Judging', 'judge', 'Spot the error.', pick('ud-l1-i6', 'A student says: "Class A (40 students) averaged 60 and Class B (10 students) averaged 80, so the school average is (60 + 80) ÷ 2 = 70." What is wrong?', [
      ['The classes have different sizes, so they cannot count equally: the true average is 64.', null],
      ['Nothing: that is the correct method.', 'The method only works for equal group sizes. Here the true average is (2400 + 800) ÷ 50 = 64.', 'average_of_averages'],
      ['The student should have added instead of averaging.', 'An average is not a total, so adding averages gives a meaningless number.', 'added_averages'],
    ], 'Class A has four times the students; weight by size.', undefined, 'u1-why'), ['Compare the class sizes.'], ['(40 × 60 + 10 × 80) ÷ 50 = 64.']),
  ],
  reflection: {
    discover: 'To combine group averages, multiply each by its group size, add, and divide by the total size. The plain average of averages is right only when the groups are the same size.',
    evidence: 'You compared the plain and the true average while changing group sizes, and computed combined averages from totals.',
    stillConfusing: [{ text: 'Why not just average the averages?', refresherId: 'u1-trap' }, { text: 'Why do totals work?', refresherId: 'u1-why' }, { text: 'When does the shortcut work?', refresherId: 'u1-equal' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: Weights pull the mean  (10.1.3 and the chapter summary)
// ---------------------------------------------------------------------------

const course = (w1: number, w2: number, w3: number, intro: string) =>
  weightedVisual({ mode: 'weights', items: [{ label: 'Assignments', value: 80, weight: w1 }, { label: 'Project', value: 90, weight: w2 }, { label: 'Exam', value: 70, weight: w3 }], valueLabel: 'mark', weightLabel: 'weight' }, intro);

export const L2: EduLesson = {
  id: 'ud-l2', unitId: 'uunit-2', number: 2, title: 'Weights pull the mean',
  objective: 'compute a weighted mean when values count for different amounts, see that only the ratio of the weights matters, and update a mean when a value is added or removed.',
  prerequisiteIds: ['up-average', 'up-percent'],
  objectives: [
    { id: 'compute', label: 'Compute a weighted mean' },
    { id: 'change', label: 'Predict what changes the mean' },
  ],
  steps: [
    {
      id: 'u2-pull', title: 'Some marks count for more', phase: 'observe',
      paragraphs: [
        'A course has three parts: assignments (mark 80, weight 20), a project (mark 90, weight 30) and an exam (mark 70, weight 50). The exam counts for half of the final mark. The plain average of the three marks is 80, but the final mark must respect the weights.',
        'In the figure the width of each bar is its weight and the height is its mark, so the area is weight × mark. The weighted mean is the height of a bar with the same total area and the same total width.',
      ],
      visual: course(20, 30, 50, 'Three marks with weights 20, 30 and 50.'),
      notice: 'Change a weight. Which mark does the mean follow when its weight grows?',
      check: pick('chk-u2-pull', 'Marks 80, 90 and 70 have weights 20, 30 and 50. What is the weighted mean?', [
        ['78', null],
        ['80', '80 is the plain average. The exam, the lowest mark, has the biggest weight, so the weighted mean is lower.', 'weights_ignored'],
        ['78.5', 'Check the arithmetic: 80 × 20 + 90 × 30 + 70 × 50 = 7800, and 7800 ÷ 100 = 78.', 'arithmetic'],
      ], '(1600 + 2700 + 3500) ÷ 100 = 78.', undefined, 'u2-pull'),
    },
    {
      id: 'u2-formula', title: 'Only the ratio of weights matters', phase: 'conjecture',
      paragraphs: [
        'The weighted mean is (w₁x₁ + w₂x₂ + …) ÷ (w₁ + w₂ + …): multiply each value by its weight, add, and divide by the total weight. The weights 20 : 30 : 50 are the same ratio as 2 : 3 : 5, and give the same mean. Doubling every weight changes nothing, because both the top and the bottom of the fraction double.',
      ],
      visual: course(2, 3, 5, 'The same marks with weights 2, 3 and 5.'),
      notice: 'Compare with the weights 20, 30, 50. What do you notice?',
      check: pick('chk-u2-formula', 'Every weight is doubled but the values stay the same. What happens to the weighted mean?', [
        ['It stays the same.', null],
        ['It doubles.', 'The sum of weight × value doubles, but so does the total weight, so the ratio is unchanged.', 'scaled_wrongly'],
        ['It halves.', 'Both the top and the bottom are doubled, so the quotient is the same.', 'scaled_wrongly'],
      ], 'Only the ratio of the weights matters.', undefined, 'u2-formula'),
    },
    {
      id: 'u2-change', title: 'Adding a value to a set', phase: 'apply',
      paragraphs: ['If 4 values have a mean of 50 and a fifth value 100 is added, treat the old mean as a value with weight 4 and the new value as one with weight 1: (4 × 50 + 1 × 100) ÷ 5 = 60. The same idea works for removing a value.'],
      visual: weightedVisual({ mode: 'weights', items: [{ label: 'Old mean', value: 50, weight: 4 }, { label: 'New value', value: 100, weight: 1 }], valueLabel: 'value', weightLabel: 'count' }, 'Four values with mean 50, and one new value 100.'),
      notice: 'Change the new value. How far does one extra value move a mean of 4 values?',
      check: pick('chk-u2-change', '4 values have a mean of 50. A fifth value, 100, is added. What is the new mean?', [
        ['60', null],
        ['75', '75 is the plain average of 50 and 100. The old mean stands for four values, so it counts four times.', 'average_of_averages'],
        ['150', '150 adds the mean and the new value. Divide the new total, 300, by 5.', 'forgot_to_divide'],
      ], '(200 + 100) ÷ 5 = 60.', undefined, 'u2-change'),
    },
  ],
  investigation: lab('Give each value a weight in the weighted average explorer.'),
  worked: {
    id: 'w-ud-l2', title: 'A final mark with weights 2 : 3 : 5',
    given: ['Marks 60, 80 and 90 with weights in the ratio 2 : 3 : 5.'], ask: 'Find the weighted mean.',
    steps: [
      { text: 'Multiply each mark by its weight: 2 × 60 = 120, 3 × 80 = 240, 5 × 90 = 450.', why: 'Each value counts in proportion to its weight.' },
      { text: 'Add: 120 + 240 + 450 = 810.', why: 'This is the weighted total.' },
      { text: 'Add the weights: 2 + 3 + 5 = 10.', why: 'The total weight is the divisor.' },
      { text: 'Weighted mean = 810 ÷ 10 = 81.', why: 'Weighted total ÷ total weight. It lies between 60 and 90 and is nearer 90 because 90 has the largest weight.' },
    ],
    verify: 'The plain average of 60, 80 and 90 is 76.67; the weights raise the mean to 81.',
  },
  guided: {
    id: 'g-ud-l2', prompt: 'A hotel is rated 4 for food (weight 3), 5 for service (weight 2) and 3 for cleanliness (weight 5).',
    steps: [
      { id: 'g1', prompt: 'The total weight.', question: numQ('g-ud-l2-1', 'What is the total weight?', 10, '3 + 2 + 5 = 10.', { refresherId: 'u2-formula', rules: [[[3], '3 is just one of the weights. Add all three.', 'partial_sum']] }), hints: ['Add 3, 2 and 5.'] },
      { id: 'g2', prompt: 'The weighted total.', question: numQ('g-ud-l2-2', 'What is 3 × 4 + 2 × 5 + 5 × 3?', 37, '12 + 10 + 15 = 37.', { refresherId: 'u2-formula', rules: [[[12], '12 is only the food part. Add the service (2 × 5) and the cleanliness (5 × 3) parts.', 'partial_sum']] }), hints: ['Multiply each rating by its weight first.'] },
      { id: 'g3', prompt: 'The weighted rating.', question: numQ('g-ud-l2-3', 'What is the weighted rating?', 3.7, '37 ÷ 10 = 3.7.', { refresherId: 'u2-formula', rules: [[[4], '4 is the plain average of 4, 5 and 3. Cleanliness has the biggest weight and the lowest rating.', 'weights_ignored']] }), hints: ['Weighted total ÷ total weight.'] },
    ],
    conclusion: 'The weighted rating is 3.7 out of 5.',
  },
  independent: [
    ind('i1', 'Weighted mean', 'compute', 'Marks and weights.', numQ('ud-l2-i1', 'Marks 70, 80 and 90 have weights 1, 2 and 2. Find the weighted mean.', 82, '(70 + 160 + 180) ÷ 5 = 82.', { refresherId: 'u2-formula', rules: [[[80], '80 is the plain average. The weights 1, 2, 2 give 80 and 90 more say.', 'weights_ignored'], [[410], '410 is the weighted total. Divide by the total weight, 5.', 'forgot_to_divide']] }), ['Multiply, add, divide by the total weight.'], ['82.']),
    ind('i2', 'Weighted mean', 'compute', 'A ratio.', numQ('ud-l2-i2', 'Values 10, 20 and 30 are weighted in the ratio 3 : 2 : 5. Find the weighted mean.', 22, '(30 + 40 + 150) ÷ 10 = 22.', { refresherId: 'u2-formula', rules: [[[20], '20 is the plain average. The value 30 has the largest weight, 5, so the mean is higher.', 'weights_ignored']] }), ['The weights are 3, 2 and 5.'], ['22.']),
    ind('i3', 'Weighted mean', 'compute', 'Missing weight.', numQ('ud-l2-i3', 'The value 60 has weight 2 and the value 90 has an unknown weight w. The weighted mean is 80. Find w.', 4, '(120 + 90w) ÷ (2 + w) = 80 gives 120 + 90w = 160 + 80w, so w = 4.', { refresherId: 'u2-formula', rules: [[[2], 'With w = 2 the mean would be 75, half way. A mean of 80 needs more weight on 90.', 'guess'], [[8], 'Check: with w = 8 the mean is (120 + 720) ÷ 10 = 84.', 'arithmetic']] }), ['80 is two thirds of the way from 60 to 90.'], ['w = 4.']),
    ind('i4', 'Changes', 'change', 'Scaling weights.', pick('ud-l2-i4', 'Weights 1, 2, 3 are changed to 10, 20, 30. The values stay the same. What happens to the weighted mean?', [
      ['Nothing: the ratio is the same.', null],
      ['It becomes ten times bigger.', 'The top and the bottom of the fraction both become ten times bigger.', 'scaled_wrongly'],
      ['It changes a little.', 'It does not change at all: only the ratio 1 : 2 : 3 matters.', 'scaled_wrongly'],
    ], 'Same ratio, same mean.', undefined, 'u2-formula'), ['What is the ratio 10 : 20 : 30?'], ['Nothing changes.']),
    ind('i5', 'Changes', 'change', 'Add a value.', numQ('ud-l2-i5', '5 values have a mean of 40. A sixth value, 100, is added. What is the new mean?', 50, '(5 × 40 + 100) ÷ 6 = 300 ÷ 6 = 50.', { refresherId: 'u2-change', rules: [[[70], '70 is the plain average of 40 and 100. The old mean stands for five values.', 'average_of_averages'], [[300], '300 is the new total. Divide by 6.', 'forgot_to_divide']] }), ['Old total = 5 × 40.'], ['50.']),
    ind('i6', 'Changes', 'change', 'Remove a value.', numQ('ud-l2-i6', '6 values have a mean of 50. The value 20 is removed. What is the mean of the remaining 5?', 56, '(6 × 50 − 20) ÷ 5 = 280 ÷ 5 = 56.', { refresherId: 'u2-change', rules: [[[30], '30 is 50 − 20. Remove 20 from the total, then divide by 5.', 'subtracted_from_mean'], [[46.67], '46.67 divides the reduced total by 6; one value is gone, so divide by 5.', 'wrong_count']] }), ['Old total = 300.'], ['56.']),
  ],
  reflection: {
    discover: 'A weighted mean is Σ(weight × value) ÷ Σ(weight). Only the ratio of the weights matters, and adding or removing a value is a weighted mean with the old mean carrying the old count.',
    evidence: 'You changed weights and watched the mean move toward the heavier values, and updated means by adding and removing values.',
    stillConfusing: [{ text: 'What do the weights do?', refresherId: 'u2-pull' }, { text: 'Why only the ratio?', refresherId: 'u2-formula' }, { text: 'How does adding a value change the mean?', refresherId: 'u2-change' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: Mixtures  (10.1.2)
// ---------------------------------------------------------------------------

const mix = (x: number, intro: string) =>
  weightedVisual({ mode: 'mixture', items: [{ label: 'Juice A', value: 20, weight: 300 }, { label: 'Juice B', value: 70, weight: x }], valueLabel: 'concentration (%)', weightLabel: 'mL' }, intro);

export const L3: EduLesson = {
  id: 'ud-l3', unitId: 'uunit-2', number: 3, title: 'Mixtures',
  objective: 'find the strength of a mixture as a weighted mean of its ingredients, explain why it lies between them, and find an unknown quantity.',
  prerequisiteIds: ['up-average', 'up-percent'],
  objectives: [
    { id: 'mix', label: 'Compute the strength or amount in a mixture' },
    { id: 'reason', label: 'Reason about what a mixture can be' },
  ],
  steps: [
    {
      id: 'u3-mix', title: 'Mixing two juices', phase: 'observe',
      paragraphs: ['Juice A is 20% fruit and Juice B is 70% fruit. Mix 300 mL of A with 200 mL of B. What percentage of the mixture is fruit? The amounts of liquid are the weights.'],
      visual: mix(200, 'Mixing 300 mL of 20% juice with some 70% juice.'),
      notice: 'Change the quantity of Juice B. Where is the mixture\'s strength for 200 mL?',
      check: pick('chk-u3-mix', 'Mix 300 mL of 20% juice with 200 mL of 70% juice. What is the percentage of fruit in the mixture?', [
        ['40%', null],
        ['45%', '45% is the plain average of 20 and 70. There is more of the weaker juice, so the mixture is weaker than 45%.', 'average_of_averages'],
        ['90%', '90% adds the two strengths. A mixture can never be stronger than its strongest ingredient.', 'added_percentages'],
      ], '(300 × 20 + 200 × 70) ÷ 500 = 40.', undefined, 'u3-mix'),
    },
    {
      id: 'u3-why', title: 'Why: count the pure fruit', phase: 'reasoning',
      paragraphs: ['Count the actual amount of fruit, then divide by the whole mixture. This also shows why the strength must lie between the two ingredients. We assume the volumes simply add (a simplification of real liquids).'],
      visual: mix(200, 'The same mixture: 60 mL of fruit and 140 mL of fruit.'),
      proof: [
        { claim: '20% of 300 mL = 60 mL of fruit in A.', reason: 'Percentage of a quantity.' },
        { claim: '70% of 200 mL = 140 mL of fruit in B.', reason: 'The same rule for B.' },
        { claim: 'Fruit in the mixture: 60 + 140 = 200 mL out of 300 + 200 = 500 mL.', reason: 'Amounts add (we assume the volumes add).' },
        { claim: 'Strength = 200 ÷ 500 = 40%.', reason: 'Part ÷ whole. This is the weighted mean with quantities as weights.' },
      ],
      check: pick('chk-u3-why', 'Can mixing a 20% juice with a 70% juice ever give a 75% juice?', [
        ['No: a mixture is between its ingredients, 20% to 70%.', null],
        ['Yes, if you add enough of the 70% juice.', 'Adding more of B moves the mixture closer to 70%, but never past it.', 'beyond_range'],
      ], 'A weighted mean lies between the smallest and largest values.', undefined, 'u3-why'),
    },
    {
      id: 'u3-target', title: 'How much do I need?', phase: 'apply',
      paragraphs: ['Suppose you have 300 mL of the 20% juice and want a 40% mixture. How much of the 70% juice must you add? Let it be x mL. The fruit is 0.2 × 300 + 0.7x and the whole is 300 + x, so 60 + 0.7x = 0.4(300 + x) = 120 + 0.4x. That gives 0.3x = 60, so x = 200 mL.'],
      visual: mix(200, 'Adjust the quantity of Juice B until the mixture is 40%.'),
      notice: 'Try 100 mL and 300 mL. What does the mixture strength become?',
      check: pick('chk-u3-target', 'You want 40% from 300 mL of 20% juice and x mL of 70% juice. What is x?', [
        ['200 mL', null],
        ['100 mL', 'With 100 mL the mixture is (60 + 70) ÷ 400 = 32.5%, too weak.', 'guess'],
        ['300 mL', 'With 300 mL the mixture is (60 + 210) ÷ 600 = 45%, too strong.', 'guess'],
      ], '60 + 0.7x = 120 + 0.4x gives x = 200.', undefined, 'u3-target'),
    },
  ],
  investigation: lab('Open the mixture laboratory and change the amounts.'),
  worked: {
    id: 'w-ud-l3', title: 'Two bottles',
    given: ['2 L of a 10% solution is mixed with 3 L of a 30% solution.'], ask: 'Find the percentage of the mixture.',
    steps: [
      { text: 'Pure amount in the first: 10% of 2 L = 0.2 L.', why: 'Percentage of a quantity.' },
      { text: 'Pure amount in the second: 30% of 3 L = 0.9 L.', why: 'The same rule.' },
      { text: 'Together: 0.2 + 0.9 = 1.1 L in 2 + 3 = 5 L.', why: 'Amounts and volumes add.' },
      { text: 'Strength = 1.1 ÷ 5 = 22%.', why: 'Part ÷ whole. It lies between 10% and 30%, nearer 30% because there is more of it.' },
    ],
    verify: 'As a weighted mean: (2 × 10 + 3 × 30) ÷ 5 = 22.',
  },
  guided: {
    id: 'g-ud-l3', prompt: 'Mix 400 mL of a 15% solution with 100 mL of a 40% solution.',
    steps: [
      { id: 'g1', prompt: 'Pure amount in the first.', question: numQ('g-ud-l3-1', 'How many mL of pure substance are in 400 mL of the 15% solution?', 60, '0.15 × 400 = 60.', { unit: 'mL', refresherId: 'u3-why', rules: [[[15], '15 is the percentage. Take 15% of 400: 0.15 × 400.', 'percent_for_amount']] }), hints: ['15% of 400.'] },
      { id: 'g2', prompt: 'Pure amount in the second.', question: numQ('g-ud-l3-2', 'How many mL of pure substance are in 100 mL of the 40% solution?', 40, '0.4 × 100 = 40.', { unit: 'mL', refresherId: 'u3-why', rules: [[[100], '100 is the whole volume. Only 40% of it is pure.', 'whole_for_part']] }), hints: ['40% of 100.'] },
      { id: 'g3', prompt: 'The mixture.', question: numQ('g-ud-l3-3', 'What is the percentage of the mixture?', 20, '(60 + 40) ÷ 500 = 20%.', { unit: '%', refresherId: 'u3-mix', rules: [[[27.5], '27.5 is the plain average of 15 and 40. There is more of the weaker solution.', 'average_of_averages']] }), hints: ['100 mL of pure substance in 500 mL.'] },
    ],
    conclusion: 'The mixture is 20%.',
  },
  independent: [
    ind('i1', 'Mixture', 'mix', 'Two solutions.', numQ('ud-l3-i1', 'Mix 600 mL of a 5% solution with 400 mL of a 15% solution. What percentage is the mixture?', 9, '(30 + 60) ÷ 1000 = 9%.', { unit: '%', refresherId: 'u3-mix', rules: [[[10], '10 is the plain average of 5 and 15. There is more of the weaker solution.', 'average_of_averages']] }), ['Pure amounts first.'], ['9%.']),
    ind('i2', 'Mixture', 'mix', 'Litres.', numQ('ud-l3-i2', 'Mix 2 L of a 50% solution with 8 L of a 10% solution. What percentage is the mixture?', 18, '(1 + 0.8) ÷ 10 = 18%.', { unit: '%', refresherId: 'u3-mix', rules: [[[30], '30 is the plain average of 50 and 10. There is four times as much of the 10% solution.', 'average_of_averages']] }), ['50% of 2 L is 1 L.'], ['18%.']),
    ind('i3', 'Mixture', 'mix', 'Pure amount.', numQ('ud-l3-i3', 'How many mL of pure substance are in 250 mL of a 12% solution?', 30, '0.12 × 250 = 30.', { unit: 'mL', refresherId: 'u3-why', rules: [[[12], '12 is the percentage. Take 12% of 250.', 'percent_for_amount']] }), ['12% of 250.'], ['30 mL.']),
    ind('i4', 'Reasoning', 'reason', 'Is it possible?', pick('ud-l3-i4', 'Can mixing a 10% solution with a 30% solution give a 35% solution?', [
      ['No: the mixture is always between 10% and 30%.', null],
      ['Yes, with enough of the 30% solution.', 'More of the 30% solution moves the mixture toward 30%, never beyond it.', 'beyond_range'],
    ], 'A mixture lies between its ingredients.', undefined, 'u3-why'), ['What is the range?'], ['No.']),
    ind('i5', 'Reasoning', 'reason', 'How much to add?', numQ('ud-l3-i5', 'How many litres of an 80% solution must be added to 4 L of a 20% solution to get a 50% solution?', 4, '0.8x + 0.8 = 0.5(x + 4) gives 0.3x = 1.2, so x = 4.', { unit: 'L', refresherId: 'u3-target', rules: [[[2], 'With 2 L the mixture is (1.6 + 0.8) ÷ 6 = 40%, too weak.', 'guess'], [[8], 'With 8 L the mixture is (6.4 + 0.8) ÷ 12 = 60%, too strong.', 'guess']] }), ['50% is half way between 20% and 80%.'], ['4 L.']),
    ind('i6', 'Reasoning', 'reason', 'Equal amounts.', pick('ud-l3-i6', 'Equal amounts of a 20% and a 60% solution are mixed. What is the strength?', [
      ['40%', null],
      ['80%', '80% adds the two strengths. A mixture cannot exceed 60%.', 'added_percentages'],
      ['30%', 'With equal amounts the strength is half way between 20% and 60%, which is 40%.', 'guess'],
    ], 'Equal amounts: the plain average, 40%.', undefined, 'u3-mix'), ['Equal weights.'], ['40%.']),
  ],
  reflection: {
    discover: 'A mixture\'s strength is the weighted mean of its ingredients, with the amounts as weights, so it lies between them. To hit a target strength, solve for the unknown amount.',
    evidence: 'You changed the amounts, counted pure substance, and solved for an unknown quantity.',
    stillConfusing: [{ text: 'How do I find the strength?', refresherId: 'u3-mix' }, { text: 'Why is it between the ingredients?', refresherId: 'u3-why' }, { text: 'How do I find the amount to add?', refresherId: 'u3-target' }],
  },
};
