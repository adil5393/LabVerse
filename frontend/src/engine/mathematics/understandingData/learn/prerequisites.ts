/**
 * Understanding Data: chapter and unit prerequisites (EDU-1M6). The chapter opens
 * by recalling the average from earlier grades, and its charts need percentages
 * and the habit of reading a table or a bar. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { chartVisual, numQ, pick, weightedVisual } from './questions';

export const UP_AVERAGE: Prerequisite = {
  id: 'up-average',
  title: 'The average (mean) of some numbers',
  why: 'The whole chapter extends the average: it asks what to do when the numbers come in groups of different sizes, or when some count for more.',
  connection: 'Earlier grades: average = total ÷ number of values',
  refresher: [
    {
      id: 'up-avg-step', title: 'Total divided by how many',
      paragraphs: [
        'The average (mean) of some numbers is their total divided by how many there are. The average of 4, 6 and 8 is (4 + 6 + 8) ÷ 3 = 18 ÷ 3 = 6.',
        'It also works backwards: if 5 numbers have an average of 20, their total must be 5 × 20 = 100.',
      ],
      visual: weightedVisual({ mode: 'groups', items: [{ label: 'First', value: 4, weight: 1 }, { label: 'Second', value: 6, weight: 1 }, { label: 'Third', value: 8, weight: 1 }], valueLabel: 'value', weightLabel: 'count' }, 'Optional demo: three values with equal weight.'),
      notice: 'Optional demo: with equal weights the weighted mean is the ordinary average. Change a value and watch it move.',
      misconception: { wrong: 'The average is the middle number.', right: 'The average is the total divided by the count. For 1, 2 and 9 it is 4, not 2.' },
    },
  ],
  checks: [
    numQ('up-avg-c1', 'Find the average of 12, 15 and 21.', 16, '(12 + 15 + 21) ÷ 3 = 48 ÷ 3 = 16.', { refresherId: 'up-avg-step', rules: [[[48], '48 is the total. Divide it by how many numbers there are (3).', 'forgot_to_divide'], [[15], '15 is the middle number, not the average. Add all three and divide by 3.', 'middle_for_mean']] }),
    numQ('up-avg-c2', 'Six numbers have an average of 7. What is their total?', 42, 'Total = average × count = 6 × 7 = 42.', { refresherId: 'up-avg-step', rules: [[[13], '13 is 6 + 7. The total is found by multiplying: 6 × 7.', 'added_for_multiplied'], [[7], '7 is the average. The total of six such numbers is bigger.', 'average_for_total']] }),
  ],
};

export const UP_PERCENT: Prerequisite = {
  id: 'up-percent',
  title: 'Fractions, percentages and ratios',
  why: 'Shares in a chart are percentages, mixtures have a percentage strength, and weights are often given as a ratio such as 3 : 2.',
  connection: 'Earlier grades: percentages and ratio',
  refresher: [
    {
      id: 'up-pct-step', title: 'Part out of whole',
      paragraphs: [
        'A percentage is a part out of 100. If a class has 40 students and 10 walk to school, the share who walk is 10 ÷ 40 = 0.25 = 25%. And 25% of 80 is 0.25 × 80 = 20.',
        'A ratio 3 : 2 says that for every 3 of one thing there are 2 of the other, so the two parts are 3/5 and 2/5 of the whole.',
      ],
      misconception: { wrong: '10 out of 40 is 10%.', right: 'The percentage is the part divided by the WHOLE: 10 ÷ 40 = 25%.' },
    },
  ],
  checks: [
    numQ('up-pct-c1', 'In a group of 50, 20 are girls. What percentage are girls?', 40, '20 ÷ 50 = 0.4 = 40%.', { unit: '%', refresherId: 'up-pct-step', rules: [[[20], '20 is the number of girls, not a percentage. Divide by the whole group: 20 ÷ 50.', 'count_for_percent'], [[2.5], '2.5 is 50 ÷ 20, the wrong way round. The part goes on top: 20 ÷ 50.', 'inverted_fraction']] }),
    numQ('up-pct-c2', 'What is 15% of 200?', 30, '0.15 × 200 = 30.', { refresherId: 'up-pct-step', rules: [[[15], '15 is the percentage itself. Take 15 out of every 100: 15% of 200 is 2 × 15.', 'percent_for_amount']] }),
  ],
};

export const UP_READING: Prerequisite = {
  id: 'up-reading',
  title: 'Reading a table and a bar chart',
  why: 'The second half of the chapter is about reading charts built from tables: what a bar means, what a total means, and what the scale hides.',
  connection: 'Earlier grades: tables and bar graphs',
  refresher: [
    {
      id: 'up-read-step', title: 'Rows, columns and bars',
      paragraphs: [
        'In a table each row is one group and each column one category. A number is where a row and a column meet. In a bar chart the height of a bar is that number, read on the vertical scale starting at 0.',
        'To read a value, find the right bar, then read across to the scale. To compare, look at which bar is taller, not which looks more colourful.',
      ],
      visual: chartVisual({ spec: { title: 'Books read in a month', unit: 'books', categories: ['Stories', 'Comics'], rows: [{ label: 'Asha', values: [5, 3] }, { label: 'Ravi', values: [2, 6] }] }, kind: 'clustered-group', edit: false }, 'Optional demo: two readers and two kinds of book.'),
      notice: 'Optional demo: find Ravi\'s comics bar. Does its height match the table?',
      misconception: { wrong: 'A longer-looking bar is always a bigger number.', right: 'Check the scale. A bar chart that does not start at 0 can make small differences look large.' },
    },
  ],
  checks: [
    pick('up-read-c1', 'A table shows Asha read 5 stories and 3 comics, and Ravi read 2 stories and 6 comics. Who read more comics?', [
      ['Ravi: 6 compared with 3.', null],
      ['Asha: she read more books altogether.', 'Asha read 8 books and Ravi read 8. In any case the question asks about comics: Ravi 6, Asha 3.', 'wrong_column'],
      ['Both the same.', 'Their comic counts are different: Asha 3 and Ravi 6.', 'misread_table'],
    ], 'Compare the comics column: 6 > 3.', undefined, 'up-read-step'),
    pick('up-read-c2', 'A bar chart\'s vertical scale starts at 50 instead of 0. A bar for 60 looks twice as tall as a bar for 55. What is the real ratio of the values?', [
      ['60 to 55, only slightly different.', null],
      ['2 to 1, as the bars look.', 'The bars are cut off at 50, so their visible heights are 10 and 5. The values are 60 and 55.', 'truncated_axis'],
    ], 'Heights compare the values only when the scale starts at 0.', undefined, 'up-read-step'),
  ],
};

export const UD_PREREQUISITES: Prerequisite[] = [UP_AVERAGE, UP_PERCENT, UP_READING];

export const UD_UNITS: EduUnit[] = [
  {
    id: 'uunit-1', number: 1, title: 'Combining groups',
    centralIdea: 'The average of two groups is not the average of their two averages unless the groups are the same size: each group counts in proportion to how many values it holds.',
    connection: 'It builds on the average as total ÷ count (Section 10.1.1).',
    vocabulary: [{ term: 'average of averages', meaning: 'the plain average of group averages, which is usually wrong' }, { term: 'combined mean', meaning: 'the true average of all the values together' }],
    discover: ['Why the average of averages misleads', 'How to get the true combined average', 'When the shortcut does work'],
    prerequisiteIds: ['up-average'], lessonIds: ['ud-l1'],
  },
  {
    id: 'uunit-2', number: 2, title: 'Weighted averages and mixtures',
    centralIdea: 'A weighted mean multiplies each value by its weight, adds, and divides by the total weight; mixtures and marks with different importance are weighted means.',
    connection: 'It generalises the combined mean, using weights instead of counts (Sections 10.1.2 and 10.1.3).',
    vocabulary: [{ term: 'weight', meaning: 'how much a value counts: a count, a quantity or an importance' }, { term: 'concentration', meaning: 'the percentage of a substance in a mixture' }],
    discover: ['What weights do', 'Why only the ratio of the weights matters', 'Why a mixture lies between its ingredients'],
    prerequisiteIds: ['up-average', 'up-percent'], lessonIds: ['ud-l2', 'ud-l3'],
  },
  {
    id: 'uunit-3', number: 3, title: 'Reading and comparing charts',
    centralIdea: 'Clustered and stacked columns show actual amounts; 100% stacked bars and pie charts show shares, so each answers different questions.',
    connection: 'It uses percentages and tables to compare groups (Sections 10.2.1 and 10.2.2).',
    vocabulary: [{ term: 'stacked bar', meaning: 'segments stacked so the whole bar shows a total' }, { term: '100% stacked bar', meaning: 'every bar scaled to the same height to show shares' }],
    discover: ['Which chart answers which question', 'What a share chart cannot show', 'Why a percentage chart can be made from a stacked chart but not the other way round'],
    prerequisiteIds: ['up-reading', 'up-percent'], lessonIds: ['ud-l4', 'ud-l5'],
  },
  {
    id: 'uunit-4', number: 4, title: 'What an average hides',
    centralIdea: 'An average of very different groups can describe a day or a value that nobody actually has.',
    connection: 'It applies weighted means to data shown in a chart (the Typical Day example).',
    vocabulary: [{ term: 'average day', meaning: 'the weighted mean of each activity over the groups' }],
    discover: ['How an average day is built', 'Why it can mislead'],
    prerequisiteIds: ['up-average', 'up-reading'], lessonIds: ['ud-l6'],
  },
];
