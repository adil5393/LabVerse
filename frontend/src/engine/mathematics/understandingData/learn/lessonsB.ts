/**
 * Understanding Data: Learn lessons 4 to 6 (EDU-1M6): clustered and stacked columns,
 * 100% stacked bars and pie charts, and what an average hides. Textbook Sections
 * 10.2.1 and 10.2.2 (including the Typical Day example). Wording, figures and
 * numbers are original.
 */

import type { EduLesson } from '../../../education/types';
import { LAB } from './lessonsA';
import type { ChartSpec } from './model';
import { chartVisual, ind, numQ, pick } from './questions';

const lab = (description: string) => ({ title: 'Try it in the free laboratory', description, href: LAB, buttonLabel: 'Open the Free Laboratory' });

export const SHOPS: ChartSpec = {
  title: 'Monthly sales of three shops', unit: '₹ thousand', categories: ['Phones', 'Laptops', 'Tablets'],
  rows: [{ label: 'Shop A', values: [40, 20, 10] }, { label: 'Shop B', values: [30, 30, 25] }, { label: 'Shop C', values: [20, 15, 5] }],
};
export const SHOPS_DOUBLE: ChartSpec = {
  title: 'Two shops with the same shares', unit: '₹ thousand', categories: ['Phones', 'Laptops', 'Tablets'],
  rows: [{ label: 'Shop A', values: [40, 20, 10] }, { label: 'Shop D', values: [80, 40, 20] }],
};
export const DAYS: ChartSpec = {
  title: 'Hours in a day', unit: 'hours', categories: ['Sleep', 'Study', 'Screen', 'Play', 'Other'],
  rows: [{ label: 'Weekday', values: [8, 7, 2, 1, 6] }, { label: 'Weekend', values: [9, 1, 4, 5, 5] }],
};

// ---------------------------------------------------------------------------
// Lesson 4: Clustered and stacked columns  (10.2.1)
// ---------------------------------------------------------------------------

export const L4: EduLesson = {
  id: 'ud-l4', unitId: 'uunit-3', number: 4, title: 'Clustered and stacked columns',
  objective: 'read values and totals from clustered and stacked column charts, choose how to group the bars for the question being asked, and see how a change in the table changes the chart.',
  prerequisiteIds: ['up-reading'],
  objectives: [
    { id: 'read', label: 'Read values and totals' },
    { id: 'choose', label: 'Choose a suitable chart' },
  ],
  steps: [
    {
      id: 'u4-cluster', title: 'The same table, grouped two ways', phase: 'observe',
      paragraphs: ['Three shops sell phones, laptops and tablets. A clustered column chart puts bars side by side. You can cluster by shop (each cluster is one shop) or by product (each cluster is one product). The numbers are identical; the question you want to ask decides the grouping.'],
      visual: chartVisual({ spec: SHOPS, kind: 'clustered-group', kinds: ['clustered-group', 'clustered-category'], edit: false }, 'Sales of three shops in a clustered column chart.'),
      notice: 'Switch the grouping. Which one makes it easier to compare shops on laptops?',
      check: pick('chk-u4-cluster', 'You want to compare the three shops on LAPTOPS. Which clustering puts the three laptop bars next to each other?', [
        ['Cluster by product: each cluster is one product, with a bar for each shop.', null],
        ['Cluster by shop: each cluster is one shop.', 'Then each laptop bar sits in a different cluster, far apart. Cluster by product to put the three shops side by side.', 'wrong_grouping'],
      ], 'Group so the things you compare are next to each other.', undefined, 'u4-cluster'),
    },
    {
      id: 'u4-stack', title: 'Stacking when totals matter', phase: 'observe',
      paragraphs: ['If the total of each shop also matters, stack the bars: the segments sit on top of each other and the whole bar is the shop\'s total. A segment\'s value is its HEIGHT, not the number where its top edge sits.'],
      visual: chartVisual({ spec: SHOPS, kind: 'absolute', kinds: ['absolute', 'clustered-group'], edit: false }, 'Sales of three shops in a stacked column chart.'),
      notice: 'Which bar is tallest? Read each total in the table beside it.',
      check: pick('chk-u4-stack', 'Which shop has the largest total sales?', [
        ['Shop B: 30 + 30 + 25 = 85', null],
        ['Shop A: it sold the most phones.', 'Shop A has the most phones, but its total is 40 + 20 + 10 = 70. Shop B\'s total is 85.', 'largest_part_for_total'],
        ['Shop C', 'Shop C has the shortest bar: 20 + 15 + 5 = 40.', 'misread'],
      ], 'Compare the totals, the heights of the whole bars.', undefined, 'u4-stack'),
    },
    {
      id: 'u4-edit', title: 'Change a number, see everything move', phase: 'apply',
      paragraphs: ['Edit a number in the table. The bar, the totals and the written summary all change together, because they all come from the same table.'],
      visual: chartVisual({ spec: SHOPS, kind: 'absolute', kinds: ['absolute', 'clustered-group', 'clustered-category'], edit: true }, 'Editable sales table with a chart.'),
      notice: 'Raise Shop C\'s laptops from 15 to 25 and watch its total.',
      check: pick('chk-u4-edit', 'Shop C\'s laptop sales rise from 15 to 25. What is its new total?', [
        ['50', null],
        ['40', '40 is the old total. The laptops rose by 10, so the total rises by 10.', 'forgot_update'],
        ['65', '65 is the laptop total of all three shops, not Shop C\'s total.', 'wrong_total'],
      ], '20 + 25 + 5 = 50.', undefined, 'u4-edit'),
    },
  ],
  investigation: lab('Build a stacked chart from your own table in the free laboratory.'),
  worked: {
    id: 'w-ud-l4', title: 'Reading the shop chart',
    given: ['The shop sales table: Shop A 40, 20, 10; Shop B 30, 30, 25; Shop C 20, 15, 5 (phones, laptops, tablets).'], ask: 'Which shop sells most overall, and which sells most laptops?',
    steps: [
      { text: 'Totals: A = 70, B = 85, C = 40.', why: 'Add the segments of each stacked bar.' },
      { text: 'Shop B has the largest total, 85.', why: 'Compare the heights of the whole bars.' },
      { text: 'Laptops: A 20, B 30, C 15, so Shop B again.', why: 'For one product, compare the laptop segments (or cluster by product).' },
    ],
    verify: 'The three totals add to 195, the total of every number in the table.',
  },
  guided: {
    id: 'g-ud-l4', prompt: 'Use the shop table.',
    visual: chartVisual({ spec: SHOPS, kind: 'absolute', edit: false }, 'The shop sales as a stacked chart.'),
    steps: [
      { id: 'g1', prompt: 'Shop A\'s total.', question: numQ('g-ud-l4-1', 'What is Shop A\'s total sales, in ₹ thousand?', 70, '40 + 20 + 10 = 70.', { refresherId: 'u4-stack', rules: [[[40], '40 is only Shop A\'s phones. Add the laptops and tablets too.', 'partial_sum']] }), hints: ['Add the three segments.'] },
      { id: 'g2', prompt: 'Compare two totals.', question: numQ('g-ud-l4-2', 'How much larger is Shop A\'s total than Shop C\'s? (C = 40)', 30, '70 − 40 = 30.', { refresherId: 'u4-stack', rules: [[[110], '110 adds the totals. To find how much larger, subtract.', 'added_for_subtracted']] }), hints: ['Subtract the totals.'] },
      { id: 'g3', prompt: 'Which product?', question: pick('g-ud-l4-3', 'Which product has the largest sales over all three shops?', [
        ['Phones: 40 + 30 + 20 = 90', null],
        ['Laptops: 65', 'Laptops total 20 + 30 + 15 = 65, less than phones (90).', 'misread'],
        ['Tablets: 40', 'Tablets total 10 + 25 + 5 = 40, the smallest.', 'misread'],
      ], 'Add each product across the shops.', undefined, 'u4-cluster'), hints: ['Add down each column.'] },
    ],
    conclusion: 'Shop B has the largest total, but phones are the best-selling product.',
  },
  independent: [
    ind('i1', 'Reading', 'read', 'Product total.', numQ('ud-l4-i1', 'What are the total laptop sales of the three shops, in ₹ thousand?', 65, '20 + 30 + 15 = 65.', { refresherId: 'u4-cluster', rules: [[[30], '30 is Shop B\'s laptops. Add the laptops of all three shops.', 'partial_sum']] }), ['Add the laptop segments.'], ['65.']),
    ind('i2', 'Reading', 'read', 'Largest total.', pick('ud-l4-i2', 'Which shop has the smallest total sales?', [
      ['Shop C: 40', null],
      ['Shop A', 'Shop A\'s total is 70, more than Shop C\'s.', 'misread'],
      ['Shop B', 'Shop B\'s total is 85, the largest.', 'misread'],
    ], 'Add each shop\'s segments.', chartVisual({ spec: SHOPS, kind: 'absolute', edit: false }, 'Sales of the three shops, stacked.'), 'u4-stack'), ['Totals first.'], ['Shop C.']),
    ind('i3', 'Reading', 'read', 'Two cells.', numQ('ud-l4-i3', 'What are Shop A\'s phone sales plus Shop C\'s tablet sales, in ₹ thousand?', 45, '40 + 5 = 45.', { refresherId: 'u4-cluster', rules: [[[25], '25 is Shop B\'s tablets. Shop C\'s tablets are 5.', 'misread']] }), ['Find each cell.'], ['45.']),
    ind('i4', 'Choosing', 'choose', 'Totals matter.', pick('ud-l4-i4', 'You care about each shop\'s total as well as the split by product. Which chart shows both?', [
      ['A stacked column chart', null],
      ['A clustered column chart', 'A clustered chart shows each value but not the total of a shop at a glance.', 'wrong_chart'],
      ['A 100% stacked chart', 'A 100% chart makes every bar the same height, so the totals disappear.', 'wrong_chart'],
    ], 'Stack the segments so the whole bar is the total.', undefined, 'u4-stack'), ['Which one makes the whole bar the total?'], ['Stacked.']),
    ind('i5', 'Choosing', 'choose', 'Compare within a product.', pick('ud-l4-i5', 'You want to compare how the three shops sell TABLETS. How should you cluster the columns?', [
      ['By product, so the three tablet bars are side by side.', null],
      ['By shop, so each shop has its own cluster.', 'Then the three tablet bars are in different clusters, which makes the comparison harder.', 'wrong_grouping'],
    ], 'Group the things you want to compare.', undefined, 'u4-cluster'), ['What do you want side by side?'], ['By product.']),
    ind('i6', 'Choosing', 'choose', 'Reading a segment.', pick('ud-l4-i6', 'In the stacked bar for Shop A (phones 40, laptops 20, tablets 10) the laptop segment starts at 40 and its top is at 60. What are Shop A\'s laptop sales?', [
      ['20, the height of the segment', null],
      ['60, where the top edge is', '60 is where the segment ends on the scale. Its value is how tall it is: 60 − 40 = 20.', 'top_for_value'],
      ['40, where it starts', '40 is the phones below it. The value of a segment is its own height.', 'start_for_value'],
    ], 'Value = top − bottom.', undefined, 'u4-stack'), ['Subtract the start from the end.'], ['20.']),
  ],
  reflection: {
    discover: 'Cluster the bars so the things you want to compare are side by side; stack them when each total matters. A stacked segment\'s value is its height, not the position of its top.',
    evidence: 'You regrouped the same data, read totals, and watched a table edit update the chart and the totals together.',
    stillConfusing: [{ text: 'How should I group?', refresherId: 'u4-cluster' }, { text: 'How do I read a stacked bar?', refresherId: 'u4-stack' }, { text: 'What changes when I edit?', refresherId: 'u4-edit' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: 100% stacked bars and pie charts  (10.2.2)
// ---------------------------------------------------------------------------

export const L5: EduLesson = {
  id: 'ud-l5', unitId: 'uunit-3', number: 5, title: '100% stacked bars and pie charts',
  objective: 'turn a table into shares, read shares from a 100% bar or a pie, and say what a share chart can and cannot tell you.',
  prerequisiteIds: ['up-reading', 'up-percent'],
  objectives: [
    { id: 'calc', label: 'Work out shares and amounts from percentages' },
    { id: 'infer', label: 'Say what a share chart can and cannot show' },
  ],
  steps: [
    {
      id: 'u5-share', title: 'Shares inside each bar', phase: 'observe',
      paragraphs: ['A 100% stacked bar makes every bar the same height, so each segment is a share of its own shop\'s total. Shop A\'s laptops are 20 out of 70, which is 20 ÷ 70 = 28.6% (to one decimal place). A pie chart shows the same shares as slices of one circle.'],
      visual: chartVisual({ spec: SHOPS, kind: 'percent', kinds: ['percent', 'pie', 'absolute'], edit: true }, 'Sales as shares inside each shop.'),
      notice: 'Switch between the chart kinds, then change a number: the shares are recomputed. What does the percent view not show any more?',
      check: pick('chk-u5-share', 'Shop A sells 20 of its 70 (₹ thousand) in laptops. What share is that?', [
        ['28.6%', null],
        ['20%', '20 is the amount in ₹ thousand, not the percentage. Divide by the total: 20 ÷ 70.', 'amount_for_percent'],
        ['35%', '35% would be 20 out of 57. The whole is Shop A\'s total, 70.', 'wrong_whole'],
      ], '20 ÷ 70 = 0.2857… = 28.6%.', undefined, 'u5-share'),
    },
    {
      id: 'u5-infer', title: 'What a share chart cannot tell you', phase: 'reasoning',
      paragraphs: ['Shop D sells exactly twice as much as Shop A in every product, so the two shops have the same shares and identical 100% bars. A share chart shows proportions, not amounts: it cannot say which shop sells more, or even whether the bars are of the same size.'],
      visual: chartVisual({ spec: SHOPS_DOUBLE, kind: 'percent', kinds: ['percent', 'absolute'], edit: false }, 'Shop A and Shop D have the same shares but different totals.'),
      notice: 'Switch to the stacked view and compare the two shops.',
      check: pick('chk-u5-infer', 'Shop A and Shop D have identical 100% bars. Do they sell the same amount?', [
        ['Not necessarily: Shop D sells twice as much; only the shares are equal.', null],
        ['Yes: identical bars mean identical sales.', 'A 100% bar hides the total. In the stacked view Shop D is twice as tall.', 'share_for_amount'],
      ], 'Equal shares do not mean equal amounts.', undefined, 'u5-infer'),
    },
    {
      id: 'u5-pie', title: 'Stacked to 100%, but not back', phase: 'reasoning',
      paragraphs: ['From a stacked chart you can always work out the 100% chart: divide each segment by its bar\'s total. But from a 100% chart you cannot rebuild the stacked chart, because the totals were thrown away. A pie chart has the same limitation: it shows proportions of one whole, not the size of the whole.'],
      visual: chartVisual({ spec: { ...SHOPS, rows: [SHOPS.rows[2]] }, kind: 'pie', kinds: ['pie', 'percent'], edit: false }, 'Shop C as a pie chart.'),
      notice: 'Shop C\'s shares are 50%, 37.5% and 12.5%. Can you read its total from the pie?',
      check: pick('chk-u5-pie', 'Can you work out Shop C\'s total sales from its pie chart alone?', [
        ['No: a pie shows shares of the whole, not the size of the whole.', null],
        ['Yes: add the slices.', 'The slices always add to 100%, whatever the total is, so they cannot tell you the total.', 'share_for_amount'],
      ], 'The total is not in the picture.', undefined, 'u5-pie'),
    },
  ],
  investigation: lab('Switch one table between stacked, 100% and pie charts in the free laboratory.'),
  worked: {
    id: 'w-ud-l5', title: 'Shares for Shop C',
    given: ['Shop C sells phones 20, laptops 15 and tablets 5 (₹ thousand).'], ask: 'Find each product\'s share of Shop C\'s sales.',
    steps: [
      { text: 'Total = 20 + 15 + 5 = 40.', why: 'The whole that the shares are taken of.' },
      { text: 'Phones: 20 ÷ 40 = 50%. Laptops: 15 ÷ 40 = 37.5%. Tablets: 5 ÷ 40 = 12.5%.', why: 'Share = part ÷ whole.' },
      { text: 'Check: 50 + 37.5 + 12.5 = 100%.', why: 'The shares of one whole always add to 100%.' },
    ],
    verify: 'The pie slices would be 180°, 135° and 45°, which add to 360°.',
  },
  guided: {
    id: 'g-ud-l5', prompt: 'Use Shop C: phones 20, laptops 15, tablets 5.',
    steps: [
      { id: 'g1', prompt: 'The total.', question: numQ('g-ud-l5-1', 'What is Shop C\'s total sales?', 40, '20 + 15 + 5 = 40.', { refresherId: 'u5-share', rules: [[[15], '15 is only the laptops. Add all three products.', 'partial_sum']] }), hints: ['Add the three amounts.'] },
      { id: 'g2', prompt: 'The laptop share.', question: numQ('g-ud-l5-2', 'What percentage of Shop C\'s sales are laptops?', 37.5, '15 ÷ 40 = 0.375 = 37.5%.', { unit: '%', refresherId: 'u5-share', rules: [[[15], '15 is the amount. Divide by the total, 40.', 'amount_for_percent'], [[26.7], '26.7 divides by 56. The whole is Shop C\'s total, 40.', 'wrong_whole']] }), hints: ['15 ÷ 40.'] },
      { id: 'g3', prompt: 'Recover the total?', question: pick('g-ud-l5-3', 'Given only that laptops are 37.5% of Shop C\'s sales, can you find Shop C\'s total?', [
        ['No: you also need an amount, such as the laptop sales.', null],
        ['Yes: it is 100.', '100 is the total of the percentages, not of the sales.', 'share_for_amount'],
      ], 'Shares alone do not fix the total.', undefined, 'u5-pie'), hints: ['Would a bigger shop have different shares?'] },
    ],
    conclusion: 'Shop C: 50%, 37.5% and 12.5%. The percentages do not reveal that its total is 40.',
  },
  independent: [
    ind('i1', 'Shares', 'calc', 'A share.', numQ('ud-l5-i1', 'Shop B sold tablets worth 25 out of a total of 85. What percentage is that, to one decimal place?', 29.4, '25 ÷ 85 = 0.2941… = 29.4%.', { unit: '%', tolerance: 0.1, refresherId: 'u5-share', rules: [[[25], '25 is the amount. Divide by the total, 85.', 'amount_for_percent'], [[34.1], '34.1 divides by 73. The whole is Shop B\'s total, 85.', 'wrong_whole']] }), ['25 ÷ 85.'], ['29.4%.']),
    ind('i2', 'Shares', 'calc', 'Another share.', numQ('ud-l5-i2', 'Shop A sold phones worth 40 out of a total of 70. What percentage is that, to one decimal place?', 57.1, '40 ÷ 70 = 0.5714… = 57.1%.', { unit: '%', tolerance: 0.1, refresherId: 'u5-share', rules: [[[40], '40 is the amount. Divide by the total, 70.', 'amount_for_percent']] }), ['40 ÷ 70.'], ['57.1%.']),
    ind('i3', 'Shares', 'calc', 'Back to an amount.', numQ('ud-l5-i3', 'A group\'s total is 80 and one category is 25% of it. What is the amount in that category?', 20, '25% of 80 = 0.25 × 80 = 20.', { refresherId: 'u5-share', rules: [[[25], '25 is the percentage. Take 25% of the total, 80.', 'percent_for_amount'], [[320], '320 is 80 ÷ 0.25. The category is a quarter of the total: multiply by 0.25.', 'inverted_operation']] }), ['0.25 × 80.'], ['20.']),
    ind('i4', 'Inference', 'infer', 'Which shop sells more?', pick('ud-l5-i4', 'A 100% stacked chart shows Shop A with 30% laptops and Shop B with 20% laptops. Can you tell which shop sold more laptops?', [
      ['No: the shops may have different totals.', null],
      ['Yes: Shop A, since 30% is more than 20%.', 'A smaller share of a much bigger total can be a larger amount. A share chart cannot compare amounts between bars.', 'share_for_amount'],
    ], 'Shares do not give amounts.', undefined, 'u5-infer'), ['Does the chart show the totals?'], ['No.']),
    ind('i5', 'Inference', 'infer', 'Equal shares.', pick('ud-l5-i5', 'Two shops have identical 100% bars. Which is possible?', [
      ['One shop sells three times as much as the other.', null],
      ['Their stacked bars must also be identical.', 'Identical shares allow different totals: the stacked bars can differ in height.', 'share_for_amount'],
    ], 'Same proportions, different sizes.', undefined, 'u5-infer'), ['Think of Shop A and Shop D.'], ['Different totals are possible.']),
    ind('i6', 'Inference', 'infer', 'Which way round?', pick('ud-l5-i6', 'Which statement is true?', [
      ['A 100% stacked chart can be made from a stacked chart, but not the other way round.', null],
      ['A stacked chart can be rebuilt from a 100% stacked chart.', 'The 100% chart no longer contains the totals, so the stacked heights cannot be recovered.', 'wrong_direction'],
      ['Neither can be made from the other.', 'Dividing every segment by its bar\'s total turns a stacked chart into a 100% chart.', 'wrong_direction'],
    ], 'Totals are lost when moving to shares.', undefined, 'u5-pie'), ['Which direction throws information away?'], ['Stacked to 100% only.']),
  ],
  reflection: {
    discover: 'A 100% stacked bar and a pie show shares of a whole. They can be made from a stacked chart but hide the totals, so they cannot compare amounts across bars.',
    evidence: 'You turned amounts into shares, compared two shops with identical shares, and saw the total disappear.',
    stillConfusing: [{ text: 'How do I find a share?', refresherId: 'u5-share' }, { text: 'What can\'t a share chart show?', refresherId: 'u5-infer' }, { text: 'Why not back to stacked?', refresherId: 'u5-pie' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 6: What an average hides  (Typical Day example; optional)
// ---------------------------------------------------------------------------

export const L6: EduLesson = {
  id: 'ud-l6', unitId: 'uunit-4', number: 6, title: 'What an average hides',
  objective: 'build an average day as a weighted mean and explain why it can describe a day nobody actually lives.',
  prerequisiteIds: ['up-average', 'up-reading'],
  objectives: [
    { id: 'compute', label: 'Build the average day' },
    { id: 'interpret', label: 'Explain what the average hides' },
  ],
  steps: [
    {
      id: 'u6-avg', title: 'The average day', phase: 'observe',
      paragraphs: ['A week has 5 weekdays and 2 weekend days. Weekdays and weekends are spent differently. The average day is the weighted mean of each activity, with weights 5 and 2: study is (5 × 7 + 2 × 1) ÷ 7 = 37 ÷ 7 = 5.29 hours.'],
      visual: chartVisual({ spec: DAYS, kind: 'absolute', kinds: ['absolute', 'clustered-category'], edit: false, avgWeights: [5, 2] }, 'A weekday, a weekend day and the average day, in hours.'),
      notice: 'Compare the "Average day" row with the weekday and the weekend. Which real day does it look like?',
      check: pick('chk-u6-avg', 'Weekdays have 7 hours of study and weekends have 1 hour. With 5 weekdays and 2 weekend days, what is the average study per day?', [
        ['5.29 hours', null],
        ['4 hours', '4 is the plain average of 7 and 1. There are five weekdays and only two weekend days.', 'average_of_averages'],
        ['37 hours', '37 is the total over the week\'s weighted days. Divide by the 7 days.', 'forgot_to_divide'],
      ], '(5 × 7 + 2 × 1) ÷ 7 = 5.29.', undefined, 'u6-avg'),
    },
    {
      id: 'u6-hide', title: 'A day nobody lives', phase: 'reasoning',
      paragraphs: ['No real day has 5.29 hours of study: weekdays have 7 and weekends have 1. The average describes a blend that nobody lives. It is still a correct weighted mean, but if we only look at it we miss that weekdays and weekends are very different.'],
      visual: chartVisual({ spec: DAYS, kind: 'clustered-category', kinds: ['clustered-category', 'absolute'], edit: false, avgWeights: [5, 2] }, 'Weekday, weekend and average day side by side for each activity.'),
      notice: 'For each activity, is the average day close to either real day?',
      check: pick('chk-u6-hide', 'The average day has 5.29 hours of study. What does that hide?', [
        ['That weekdays have much more study (7 hours) than weekends (1 hour).', null],
        ['Nothing: the average tells the whole story.', 'An average of very different days hides the difference between them: no real day has 5.29 hours.', 'average_tells_all'],
      ], 'The average hides the spread of the data.', undefined, 'u6-hide'),
    },
  ],
  investigation: lab('Open the average-day laboratory and change the group sizes.'),
  worked: {
    id: 'w-ud-l6', title: 'Sleep in the average day',
    given: ['Weekdays: 8 hours of sleep. Weekends: 9 hours. 5 weekdays and 2 weekend days in a week.'], ask: 'Find the average sleep per day.',
    steps: [
      { text: 'Weekday sleep in a week: 5 × 8 = 40 hours.', why: 'Weight each day type by how often it occurs.' },
      { text: 'Weekend sleep: 2 × 9 = 18 hours.', why: 'The same rule.' },
      { text: 'Average = (40 + 18) ÷ 7 = 58 ÷ 7 = 8.29 hours.', why: 'Weighted total ÷ total weight. Here the two days are alike, so the average describes both well.' },
    ],
    verify: '8.29 lies between 8 and 9, nearer 8 because there are more weekdays.',
  },
  guided: {
    id: 'g-ud-l6', prompt: 'Study: 7 hours on weekdays and 1 hour on weekends.',
    steps: [
      { id: 'g1', prompt: 'Weekday total.', question: numQ('g-ud-l6-1', 'Study hours over the 5 weekdays?', 35, '5 × 7 = 35.', { unit: 'hours', refresherId: 'u6-avg', rules: [[[7], '7 is one weekday. There are five.', 'one_day_only']] }), hints: ['5 × 7.'] },
      { id: 'g2', prompt: 'Weekend total.', question: numQ('g-ud-l6-2', 'Study hours over the 2 weekend days?', 2, '2 × 1 = 2.', { unit: 'hours', refresherId: 'u6-avg', rules: [[[1], '1 is one weekend day. There are two.', 'one_day_only']] }), hints: ['2 × 1.'] },
      { id: 'g3', prompt: 'The average day.', question: numQ('g-ud-l6-3', 'Average study per day (to two decimals)?', 5.29, '37 ÷ 7 = 5.2857… ≈ 5.29.', { unit: 'hours', tolerance: 0.01, refresherId: 'u6-avg', rules: [[[4], '4 ignores that weekdays are more frequent.', 'average_of_averages']] }), hints: ['(35 + 2) ÷ 7.'] },
    ],
    conclusion: 'The average day has 5.29 hours of study, a number no real day has.',
  },
  independent: [
    ind('i1', 'Average day', 'compute', 'Screen time.', numQ('ud-l6-i1', 'Screen time is 2 hours on weekdays and 4 hours on weekends (5 weekdays, 2 weekend days). What is the average per day, to two decimals?', 2.57, '(10 + 8) ÷ 7 = 18 ÷ 7 = 2.571….', { unit: 'hours', tolerance: 0.01, refresherId: 'u6-avg', rules: [[[3], '3 is the plain average of 2 and 4. Weekdays are more frequent.', 'average_of_averages']] }), ['5 × 2 + 2 × 4.'], ['2.57.']),
    ind('i2', 'Average day', 'compute', 'Play time.', numQ('ud-l6-i2', 'Play is 1 hour on weekdays and 5 hours on weekends. What is the average per day, to two decimals?', 2.14, '(5 + 10) ÷ 7 = 15 ÷ 7 = 2.142….', { unit: 'hours', tolerance: 0.01, refresherId: 'u6-avg', rules: [[[3], '3 is the plain average of 1 and 5. Use the weights 5 and 2.', 'average_of_averages']] }), ['5 × 1 + 2 × 5.'], ['2.14.']),
    ind('i3', 'Interpreting', 'interpret', 'Is it real?', pick('ud-l6-i3', 'The average day has 2.14 hours of play. Weekdays have 1 hour and weekends have 5. Does any real day have 2.14 hours of play?', [
      ['No: real days have 1 or 5 hours.', null],
      ['Yes: it is the average, so some day must match.', 'An average need not equal any actual value. Here no day has 2.14 hours.', 'average_is_a_value'],
    ], 'An average can describe a value nobody has.', undefined, 'u6-hide'), ['Which values do real days take?'], ['No.']),
    ind('i4', 'Interpreting', 'interpret', 'A careless claim.', pick('ud-l6-i4', 'Which claim is misleading?', [
      ['"On a typical day I study 5.29 hours."', null],
      ['"Over a whole week I study 37 hours in total."', 'That is a correct total for the week (35 + 2).', 'wrong_pick'],
      ['"On weekdays I study 7 hours and on weekends 1 hour."', 'That describes the real days and is accurate.', 'wrong_pick'],
    ], 'No typical day has 5.29 hours.', undefined, 'u6-hide'), ['Which claim describes a day that never happens?'], ['The typical day.']),
    ind('i5', 'Average day', 'compute', 'Different mix of days.', numQ('ud-l6-i5', 'In a different week there are 4 weekdays and 3 rest days. Study is 7 hours on a weekday and 1 hour on a rest day. What is the average per day, to two decimals?', 4.43, '(28 + 3) ÷ 7 = 31 ÷ 7 = 4.428….', { unit: 'hours', tolerance: 0.01, refresherId: 'u6-avg', rules: [[[5.29], '5.29 uses 5 weekdays and 2 rest days. Here the weights are 4 and 3.', 'old_weights']] }), ['4 × 7 + 3 × 1.'], ['4.43.']),
  ],
  reflection: {
    discover: 'An average day is a weighted mean of the different kinds of day. It can describe a day that nobody lives and hide how different the days are.',
    evidence: 'You built an average day with weights 5 and 2 and compared it with the real days.',
    stillConfusing: [{ text: 'How do I build the average day?', refresherId: 'u6-avg' }, { text: 'What does it hide?', refresherId: 'u6-hide' }],
  },
};
