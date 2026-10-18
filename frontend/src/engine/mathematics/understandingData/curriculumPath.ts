/**
 * Guided curriculum for How Quantities Combine: Understanding Data (M6).
 * Built on the chapter-neutral Guided Learning definitions (M2.5) unchanged.
 *
 * Authoring rule: the Understand stage introduces the situation but never
 * states the result that the Predict stage asks about. In guided mode the
 * experiment's computed results stay hidden until the prediction is made.
 */

import type { GuidedChapterCurriculum, GuidedLessonDefinition, GuidedStageId, GuidedUnitDefinition } from '../guidedLearning/types';
import { UNDERSTANDING_DATA_PRACTICE_BANK } from './practiceBank';
import type { ChartView, InteractionKind } from './types';
import { q, type Q } from './rational';

const FULL: GuidedStageId[] = ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];

/** A prediction the student types as a number (e.g. "predict the combined average"). */
export interface NumericPrediction {
  prompt: string;
  unit: string;
  correct: Q;
  /** Within this distance a guess counts as "close". */
  closeWithin: Q;
  /** The tempting but wrong plain average, when there is one. */
  naive?: Q;
  explanation: string;
}

export interface UDLessonDefinition extends GuidedLessonDefinition {
  numericPrediction?: NumericPrediction;
  targetMetric: InteractionKind;
  /** True while predictions are pending: hides computed results in the experiment. */
  hidesResultsUntilPrediction: boolean;
  /** Chart views offered in this lesson (default: stacked, 100% and both). Keeps new chart types from arriving all at once. */
  allowedViews?: ChartView[];
  /** Views the student must actually open during the experiment before moving on. */
  mustVisitViews?: ChartView[];
}

const idByTitle = (title: string): string => {
  const f = UNDERSTANDING_DATA_PRACTICE_BANK.find((x) => x.title === title);
  if (!f) throw new Error(`Understanding Data curriculum: no practice question titled "${title}"`);
  return f.id;
};

export const UD_GUIDED_UNITS: GuidedUnitDefinition[] = [
  { id: 'ud-unit-1', unitNumber: 1, title: 'Understanding Combined Data', badge: 'Unit 1', description: 'Why averaging averages can go wrong, and how group sizes fix it.', lessonIds: ['ud-l1', 'ud-l2', 'ud-l3'] },
  { id: 'ud-unit-2', unitNumber: 2, title: 'Applying Weights', badge: 'Unit 2', description: 'Importance weights, mixtures and weighted-average problems.', lessonIds: ['ud-l4', 'ud-l5', 'ud-l6'] },
  { id: 'ud-unit-3', unitNumber: 3, title: 'Visualising Multi-Part Data', badge: 'Unit 3', description: 'Stacked bars, 100% stacked bars, and what each one can answer.', lessonIds: ['ud-l7', 'ud-l8', 'ud-l9', 'ud-l10'] },
  { id: 'ud-unit-4', unitNumber: 4, title: 'Interpretation and Mastery', badge: 'Unit 4', description: 'Choose the right chart, spot misleading conclusions, and practise.', lessonIds: ['ud-l11', 'ud-l12', 'ud-l13'] },
  { id: 'ud-unit-5', unitNumber: 5, title: 'Optional Extensions', badge: 'Optional', description: 'Short extra investigations from the chapter: pie charts, what an average hides, and gold purity in varṇa. They do not count toward the chapter percentage.', lessonIds: ['ud-l14', 'ud-l15', 'ud-l16'] },
];

const unitTitle = (id: string) => UD_GUIDED_UNITS.find((u) => u.id === id)?.title ?? '';

type Seed = Omit<UDLessonDefinition, 'stages' | 'unitTitle' | 'allowedTools' | 'practiceQuestionIds' | 'hidesResultsUntilPrediction'> & {
  stages?: GuidedStageId[];
  practice: string[];
  hidesResults?: boolean;
};

const seeds: Seed[] = [
  {
    id: 'ud-l1', unitId: 'ud-unit-1', lessonNumber: 1, title: 'Why Averages Can Mislead', subtitle: 'Two classes, one combined average',
    learningObjective: 'See that the average of two averages is not always the average of everything.', experimentId: 'ud-misleading', targetMetric: 'group_edit',
    hidesResults: true,
    concept: {
      summary: 'Class A has 10 students whose average mark is 80. Class B has 30 students whose average mark is 50. All 40 students are put together as one group.',
      detailedPoints: ['An average summarises a whole group with one number.', 'Here you have two such numbers, one for each class, and want one number for everybody.', 'Before the lab shows any result, decide what you expect.'],
      keyTerms: [{ term: 'average (mean)', definition: 'The total of the values divided by how many values there are.' }],
    },
    numericPrediction: { prompt: 'Predict the combined average mark of all 40 students.', unit: 'marks', correct: q(115, 2), closeWithin: q(1), naive: q(65), explanation: 'The 30 students in Class B pull the combined average much closer to 50 than to 80.' },
    experimentGuide: { instruction: 'Change the class sizes and averages. After each change compare the plain average of the two averages with the true combined average.', actionHint: 'Use the + and − buttons next to the sizes and averages.', targetActionDescription: 'Make 3 different changes', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Look at your recorded results. When do the plain average and the true combined average differ?', expectedPattern: 'They differ whenever the classes have different sizes, and the true average sits closer to the bigger class.', invariantsDescription: 'The true combined average always equals (total of all marks) ÷ (number of students).' },
    whyGuide: { explanationType: 'property', explanation: 'The plain average of 80 and 50 gives each class the same say, but Class B has three times as many students. Each class’s total is size × average, and the combined average is the sum of those totals divided by the total number of students.', deductiveTakeaway: 'Combined average = (sum of group totals) ÷ (total number of values), not the average of the averages.' },
    practice: ['Combine two classes', 'Spot the flaw in averaging averages'],
  },
  {
    id: 'ud-l2', unitId: 'ud-unit-1', lessonNumber: 2, title: 'Combining Groups of Different Sizes', subtitle: 'When does a plain average work?',
    learningObjective: 'Find when averaging the group averages is valid, and when it is not.', experimentId: 'ud-sizes', targetMetric: 'group_edit',
    hidesResults: true,
    concept: {
      summary: 'A cyclist logs her time on each weekday for three weeks. Every week has 5 days, and each week has its own average time. You want the average over all 15 days.',
      detailedPoints: ['Each weekly average comes from a group of days.', 'You will compare two ways of getting the overall average.'],
    },
    predictionQuestion: { question: 'All three weeks have the same number of days. Will the plain average of the three weekly averages equal the true average over all 15 days?', options: ['Yes, because every week has the same number of days', 'No, a plain average of averages is always wrong', 'It cannot be known without the daily times'], correctIndex: 0, explanation: 'With equal group sizes every group counts equally, so the plain average is correct. Test it by making the sizes unequal.' },
    experimentGuide: { instruction: 'Try equal sizes first, then change one week to have a different number of days. Make at least 4 changes.', actionHint: 'Change the “Days” column to make the weeks unequal.', targetActionDescription: 'Make 4 different changes', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'In which of your trials did the plain average match the true average?', expectedPattern: 'Only the trials where all groups had the same size.', invariantsDescription: 'The true average is always the weighted mean using the group sizes.' },
    whyGuide: { explanationType: 'property', explanation: 'With sizes p, p, p the sizes cancel: (a·p + b·p + c·p) ÷ 3p = (a + b + c) ÷ 3. If the sizes differ, they no longer cancel, so the plain average is wrong.', deductiveTakeaway: 'Averaging the averages is valid only when every group has the same size.' },
    practice: ['Equal sizes', 'Choose the expression', 'Combine, rounded answer'],
  },
  {
    id: 'ud-l3', unitId: 'ud-unit-1', lessonNumber: 3, title: 'Discovering Weighted Averages', subtitle: 'Weights pull the mean',
    learningObjective: 'Use sizes as weights and see how a weight pulls the mean towards its value.', experimentId: 'ud-weighted', targetMetric: 'group_edit',
    hidesResults: true,
    concept: {
      summary: 'Three groups have averages 40, 55 and 70, with sizes 8, 12 and 20. We call each size a weight: how much that group counts.',
      detailedPoints: ['A weight says how much a value counts.', 'The lab draws a balance line: bigger circles are bigger weights.'],
      keyTerms: [{ term: 'weight', definition: 'A number saying how much a value counts towards the combined result.' }],
    },
    predictionQuestion: { question: 'Which group’s average will the combined mean be closest to?', options: ['Group 1 (average 40, size 8)', 'Group 2 (average 55, size 12)', 'Group 3 (average 70, size 20)'], correctIndex: 2, explanation: 'Group 3 has the largest weight, so it pulls the combined mean the hardest.' },
    experimentGuide: { instruction: 'Change weights and averages and watch the combined mean move. Try a weight of 0. Make at least 4 changes.', actionHint: 'You can add or remove groups with the buttons below the table.', targetActionDescription: 'Make 4 different changes', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'When you made one weight larger, which way did the weighted mean move?', expectedPattern: 'It moved towards the value with the larger weight. A weight of 0 had no effect.', invariantsDescription: 'The weighted mean always lies between the smallest and the largest value.' },
    whyGuide: { explanationType: 'property', explanation: 'Weighted mean = (w₁x₁ + w₂x₂ + …) ÷ (w₁ + w₂ + …). A larger weight makes its term count for more in both the top and the bottom, so the mean moves towards that value.', deductiveTakeaway: 'The weighted mean is the average where each value counts according to its weight.' },
    practice: ['Three groups', 'A zero weight changes nothing', 'Find the missing group average'],
  },
  {
    id: 'ud-l4', unitId: 'ud-unit-2', lessonNumber: 4, title: 'Mixtures and Concentrations', subtitle: 'A mixture is a weighted mean',
    learningObjective: 'Find the concentration of a mixture from quantities and concentrations.', experimentId: 'ud-mixture', targetMetric: 'mixture_edit',
    hidesResults: true,
    concept: {
      summary: 'You pour 200 mL of a drink that is 10% jaggery into 300 mL of a drink that is 20% jaggery. In this model, quantities simply add and no jaggery is lost.',
      detailedPoints: ['Concentration is the part of a mixture that is the solute: solute ÷ total.', 'The lab uses a mathematical model, not a chemistry simulation.'],
    },
    predictionQuestion: { question: 'Will the final jaggery concentration be below 15%, exactly 15%, or above 15%?', options: ['Below 15%', 'Exactly 15%', 'Above 15%'], correctIndex: 2, explanation: 'There is more of the 20% drink, so the mixture ends up closer to 20% than to 10%.' },
    experimentGuide: { instruction: 'Change quantities and concentrations. Try equal quantities, then very unequal ones. Make at least 4 different mixtures.', actionHint: 'Watch the beaker layers and the solute bar change together.', targetActionDescription: 'Try 4 different mixtures', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'Compare the final concentration with the two starting concentrations in each of your mixtures.', expectedPattern: 'It is always between them, closer to the one with more quantity. Equal quantities give the midpoint.', invariantsDescription: 'Final concentration = total solute ÷ total mixture.' },
    whyGuide: { explanationType: 'property', explanation: 'Each part brings (quantity × concentration) of solute. Adding those and dividing by the total quantity is exactly a weighted mean where the quantities are the weights.', deductiveTakeaway: 'Mixture concentration = Σ(quantity × concentration) ÷ Σ(quantity).' },
    practice: ['Equal quantities, midpoint', 'Unequal quantities', 'Amount of solute', 'Mixed units'],
  },
  {
    id: 'ud-l5', unitId: 'ud-unit-2', lessonNumber: 5, title: 'Importance Weights and Ratings', subtitle: 'Some parts count for more',
    learningObjective: 'Use importance weights to combine scores such as marks and ratings.', experimentId: 'ud-ratings', targetMetric: 'group_edit',
    hidesResults: true,
    concept: {
      summary: 'A subject’s final score combines class tests, a project and a final exam, counted in the ratio 3 : 2 : 5. The scores are 60, 70 and 85 (all out of 100).',
      detailedPoints: ['A ratio like 3 : 2 : 5 tells how important each part is.', 'Weights do not need to add to 100 or to 1; only their relative sizes matter.'],
    },
    predictionQuestion: { question: 'Will the weighted final score be below, equal to, or above the plain average of the three scores?', options: ['Below the plain average', 'Equal to the plain average', 'Above the plain average'], correctIndex: 2, explanation: 'The final exam has the largest weight and the highest score, so it lifts the weighted score above the plain average.' },
    experimentGuide: { instruction: 'Change the scores and the weights. Try making the lowest score the most important. Make at least 4 changes.', actionHint: 'Use the + and − buttons next to a weight.', targetActionDescription: 'Make 4 different changes', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'What happened to the weighted score when you made a high score more important? A low score?', expectedPattern: 'Weighted score moves towards whichever score has more weight.', invariantsDescription: 'The weighted score stays between the lowest and highest score.' },
    whyGuide: { explanationType: 'definition', explanation: 'A ratio such as 3 : 2 : 5 is equivalent to repeating the scores 3, 2 and 5 times. The mean of that longer list is the weighted mean.', deductiveTakeaway: 'Importance weights give a weighted mean just like group sizes do.' },
    practice: ['Marks with weights 2 : 3 : 5', 'Restaurant rating, weights 5 : 3 : 2'],
  },
  {
    id: 'ud-l6', unitId: 'ud-unit-2', lessonNumber: 6, title: 'Solving Weighted Average Problems', subtitle: 'Scaling weights and adding values',
    learningObjective: 'Predict what happens to a weighted mean when weights change.', experimentId: 'ud-solving', targetMetric: 'group_edit',
    hidesResults: true,
    concept: {
      summary: 'Three values 4, 8 and 12 have weights 1, 2 and 3. You will try two operations on all the weights: multiplying every weight by the same number, and adding the same number to every weight.',
      detailedPoints: ['Use the “Scale weights” and “Shift weights” buttons.', 'A new value joining a group is also a weighted mean: the old mean has the old size as its weight.'],
    },
    predictionQuestion: { question: 'If every weight is multiplied by 3, what will happen to the weighted mean?', options: ['It will stay the same', 'It will be multiplied by 3', 'It will increase by 3'], correctIndex: 0, explanation: 'Only the relative sizes of the weights matter, and multiplying all of them by 3 does not change those.' },
    experimentGuide: { instruction: 'Scale all weights by different numbers, then shift all weights by adding a constant. Do at least 3 operations.', actionHint: 'Compare the mean before and after each button press.', targetActionDescription: 'Apply 3 operations', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Which operation left the mean unchanged and which changed it?', expectedPattern: 'Multiplying all weights leaves it unchanged; adding a constant to all weights changes it.', invariantsDescription: 'Weighted mean depends only on the ratios of the weights.' },
    whyGuide: { explanationType: 'property', explanation: 'If every weight is multiplied by k, then (kw₁x₁ + kw₂x₂ + …) ÷ (kw₁ + kw₂ + …) = k(w₁x₁ + …) ÷ k(w₁ + …), and k cancels. Adding c to every weight changes the ratios between weights, so the mean changes.', deductiveTakeaway: 'Scaling weights keeps the mean; shifting weights changes it.' },
    practice: ['Doubling all weights', 'Add 1 to every weight', 'Average after one more test', 'Find the missing weight'],
  },
  {
    id: 'ud-l7', unitId: 'ud-unit-3', lessonNumber: 7, title: 'Reading Stacked Bar Charts', subtitle: 'Totals and parts together',
    learningObjective: 'Read both the totals and the parts from a stacked bar chart, and compare it with clustered columns.', experimentId: 'ud-stacked-read', targetMetric: 'segment_select',
    allowedViews: ['absolute', 'clustered'], mustVisitViews: ['clustered'],
    concept: {
      summary: 'A stacked bar chart joins the parts of a group one after another into a single bar. This chart shows what three households spend each week.',
      detailedPoints: ['Each bar is one household.', 'Each coloured segment is one kind of spending.', 'Tap a segment to read its exact value.', 'The same table can also be drawn as clustered columns, with every column starting from zero. You will switch between the two.'],
    },
    predictionQuestion: { question: 'What does the full length of one stacked bar tell you?', options: ['The household’s total spending', 'Only its largest expense', 'The average of its expenses'], correctIndex: 0, explanation: 'The segments are joined end to end, so the whole bar is their sum.' },
    experimentGuide: { instruction: 'Tap at least 3 different segments and read each value. Then switch to the clustered-column view and find the same values there.', actionHint: 'Use the Stacked / Clustered switch above the chart. The reading appears under the chart.', targetActionDescription: 'Read 3 different values', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Which bar is longest? In which chart was it easier to compare one category across the households, and in which was it easier to see each household’s total?', expectedPattern: 'Clustered columns make single values easy to compare because every column starts from zero; stacked bars make the totals easy to see.', invariantsDescription: 'A bar’s total equals the sum of its segments, and both charts show the same table.' },
    whyGuide: { explanationType: 'definition', explanation: 'In clustered columns every value has its own base at zero. In a stacked bar only the first segment starts at zero, so segments are a little harder to compare across bars, but the whole bar shows the total. Choose clustered columns when single values matter, and stacked bars when the totals matter too.', deductiveTakeaway: 'Stacked bars may replace clustered columns when the total of each cluster is also of interest.' },
    practice: ['Largest segment', 'Total of a bar', 'Tap the largest total', 'Tap the tallest column'],
  },
  {
    id: 'ud-l8', unitId: 'ud-unit-3', lessonNumber: 8, title: 'Constructing Stacked Bar Charts', subtitle: 'Enter data, watch the bars',
    learningObjective: 'Build a stacked bar chart from a table of values.', experimentId: 'ud-stacked-build', targetMetric: 'chart_edit',
    concept: {
      summary: 'Two school houses record how many boys and girls they have. Use the data table to change the numbers and watch the chart.',
      detailedPoints: ['Every cell in the table becomes a segment.', 'The axis always starts at 0, so lengths are honest.'],
    },
    predictionQuestion: { question: 'If you double every value in one house, what will happen to that house’s bar?', options: ['It becomes twice as long', 'It stays the same length', 'It becomes the same length as the other bar'], correctIndex: 0, explanation: 'Each segment doubles, so their sum, the bar length, doubles.' },
    experimentGuide: { instruction: 'Edit at least 5 different cells, or add a category or house, and watch the totals update.', actionHint: 'Tap a number in the table, type a new value, and press Enter.', targetActionDescription: 'Make 5 different edits', minInteractionsNeeded: 5 },
    observeGuide: { prompt: 'What happens to the bar’s total when you change one segment?', expectedPattern: 'The total changes by exactly the amount you changed the segment by.', invariantsDescription: 'Total = sum of segments, always.' },
    whyGuide: { explanationType: 'definition', explanation: 'A stacked bar is a picture of a row of the table: each value is a length, and the row total is the whole bar.', deductiveTakeaway: 'Each row of data becomes one bar; each column becomes one coloured segment.' },
    practice: ['Largest segment in another bar', 'Category total across groups', 'Grand total from two bars'],
  },
  {
    id: 'ud-l9', unitId: 'ud-unit-3', lessonNumber: 9, title: 'Understanding 100% Stacked Charts', subtitle: 'Shares inside each group',
    learningObjective: 'Read a 100% stacked chart and see what it keeps and what it hides.', experimentId: 'ud-percent', targetMetric: 'chart_toggle',
    hidesResults: true,
    concept: {
      summary: 'The same spending data can also be drawn so that every bar has the same fixed length. Use the chart-type switch to move between the two views of one unchanged table.',
      detailedPoints: ['The raw data never changes when you switch.', 'The totals are shown separately beside each bar.'],
    },
    predictionQuestion: { question: 'In the 100% chart, how long will each household’s bar be?', options: ['All bars the same length', 'Longer for the household that spends more', 'Shorter for the household that spends more'], correctIndex: 0, explanation: 'Every bar stands for 100% of its own total, so they are all equally long.' },
    experimentGuide: { instruction: 'Switch between the absolute and the 100% view, at least once in each direction. Notice what changes and what does not.', actionHint: 'Use the Absolute / 100% switch above the chart.', targetActionDescription: 'View both chart types', minInteractionsNeeded: 2 },
    observeGuide: { prompt: 'What stayed the same in both views, and what disappeared in the 100% view?', expectedPattern: 'The raw numbers stayed the same. The totals disappeared from the bar lengths in the 100% view.', invariantsDescription: 'Shares inside every bar add to 100%.' },
    whyGuide: { explanationType: 'property', explanation: 'Each segment is divided by its own bar’s total and shown as a percentage. This keeps proportions and discards totals. That is why a 100% chart can be made from a stacked chart but not the other way round.', deductiveTakeaway: 'A 100% stacked chart compares proportions within each group, not actual amounts.' },
    practice: ['Do 100% segments add up?', 'Percentage share of a part', 'Biggest percentage share', 'Empty group'],
  },
  {
    id: 'ud-l10', unitId: 'ud-unit-3', lessonNumber: 10, title: 'Comparing Absolute Counts and Percentages', subtitle: 'A bigger share is not a bigger amount',
    learningObjective: 'Tell apart “larger percentage” and “larger quantity”.', experimentId: 'ud-compare', targetMetric: 'segment_select',
    hidesResults: true,
    concept: {
      summary: 'Two gardens record how many flowers bloom in each season. The chart can show actual blooms or the percentage of each garden’s blooms in each season.',
      detailedPoints: ['Tap a summer segment to see both its actual count and its percentage.', 'Garden P and Garden Q have different totals.'],
    },
    predictionQuestion: { question: 'Garden P has a larger PERCENTAGE of its blooms in summer than Garden Q. Must Garden P have MORE summer blooms?', options: ['Yes, a larger percentage means more blooms', 'Not necessarily; it depends on each garden’s total', 'No, it must have fewer'], correctIndex: 1, explanation: 'A percentage is a share of the garden’s own total. A smaller garden can have a larger share but fewer actual blooms.' },
    experimentGuide: { instruction: 'Tap at least 4 different segments. Compare the percentage and the actual count for each.', actionHint: 'Switch between absolute and 100% to see the same data both ways.', targetActionDescription: 'Inspect 4 different segments', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'In summer, which garden has the larger percentage? Which has the larger count?', expectedPattern: 'They are different gardens: the larger share and the larger count are not in the same place.', invariantsDescription: 'Within one garden, a larger percentage does always mean a larger count.' },
    whyGuide: { explanationType: 'property', explanation: 'percentage = count ÷ garden total × 100. Two gardens have different totals, so equal or larger percentages do not compare counts across gardens.', deductiveTakeaway: 'Compare counts across groups with absolute charts; compare shares with 100% charts.' },
    practice: ['Larger percentage, smaller amount', 'Equal percentages', 'Can you recover counts?'],
  },
  {
    id: 'ud-l11', unitId: 'ud-unit-4', lessonNumber: 11, title: 'Choosing the Right Representation', subtitle: 'Which chart answers which question?',
    learningObjective: 'Choose between clustered, stacked and 100% stacked charts (and know what a pie chart shows) for a given question.', experimentId: 'ud-choose', targetMetric: 'challenge_answer',
    allowedViews: ['absolute', 'clustered', 'percent', 'pie'],
    concept: {
      summary: 'This dataset records how age groups spend a 24-hour day. Answer the challenge questions and notice which chart makes each one easy or impossible.',
      detailedPoints: ['Some questions are about totals, some about shares.', 'Feedback is based on the actual numbers.'],
    },
    predictionQuestion: { question: 'You want to know which age group spends the largest SHARE of its day on sleep. Which chart is better?', options: ['100% stacked bar chart', 'Stacked bar chart of hours'], correctIndex: 0, explanation: 'Each group’s day is a different mix of hours, and a 100% chart puts every bar on the same scale of shares.' },
    experimentGuide: { instruction: 'Answer at least 3 different challenges. Tap bars and segments, or choose answers.', actionHint: 'Switch the chart type if a question seems hard to answer with the current one.', targetActionDescription: 'Answer 3 challenges', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Which questions were easier on the stacked chart and which on the 100% chart?', expectedPattern: 'Totals and counts: stacked. Shares within groups: 100% stacked.', invariantsDescription: 'The underlying table is the same in both charts.' },
    whyGuide: { explanationType: 'property', explanation: 'Use a stacked chart when the total of each group matters as well as its parts. Use a 100% stacked chart when you want to compare proportions between groups of different sizes.', deductiveTakeaway: 'The chart you choose decides which questions you can answer.' },
    practice: ['Which chart type?', 'Why not stacked → percent?', 'Biggest share, spending data', 'Clustered or stacked?'],
  },
  {
    id: 'ud-l12', unitId: 'ud-unit-4', lessonNumber: 12, title: 'Investigating Misleading Conclusions', subtitle: 'Same percentages, different truths',
    learningObjective: 'Spot conclusions that a 100% chart cannot support.', experimentId: 'ud-claims', targetMetric: 'calc_view',
    concept: {
      summary: 'A newspaper shows a 100% stacked chart of two gardens and says “both gardens had the same number of blooms in summer”. The chart shows only percentages.',
      detailedPoints: ['You will build possible raw datasets that fit the percentages.', 'Use “Show another dataset” to see two different datasets that give the same 100% chart.'],
    },
    predictionQuestion: { question: 'Can one 100% stacked chart come from two very different sets of actual counts?', options: ['No, the chart fixes the counts', 'Yes, many different totals give the same chart', 'Only if the percentages are all 50%'], correctIndex: 1, explanation: 'Because every bar is rescaled to 100%, different totals can give identical bars.' },
    experimentGuide: { instruction: 'View at least 2 different raw datasets that match the same 100% chart.', actionHint: 'Press “Show another dataset” in the comparison panel.', targetActionDescription: 'View 2 datasets', minInteractionsNeeded: 2 },
    observeGuide: { prompt: 'Compare the two datasets: what is identical and what is different?', expectedPattern: 'The percentages are identical, the actual counts and even which garden has more are different.', invariantsDescription: 'Both datasets give exactly the same 100% chart.' },
    whyGuide: { explanationType: 'property', explanation: 'A 100% chart discards the totals, so you cannot recover counts from it. Any claim about actual numbers across groups needs the totals as well.', deductiveTakeaway: 'Question claims that compare counts using only percentages.' },
    practice: ['Spot the invalid inference', 'Pick the matching raw data', 'Which group has more?'],
  },
  {
    id: 'ud-l14', unitId: 'ud-unit-5', lessonNumber: 14, title: 'Pie Charts: Parts of One Whole', subtitle: 'Shares, percentages and angles',
    learningObjective: 'Read a pie chart as the parts of one whole, and see why slices of different pies cannot be compared by size.', experimentId: 'ud-pie', targetMetric: 'segment_select', isOptionalExtension: true,
    hidesResults: true, allowedViews: ['absolute', 'percent', 'pie'],
    concept: {
      summary: 'The textbook recalls pie charts from last year as another way to show proportions. A pie chart splits one full circle of 360° among the parts of ONE group. Here it will show how one household spends its weekly money.',
      detailedPoints: ['Pick one group to draw as a pie.', 'The whole circle is that group’s total.', 'Tap a slice to read its quantity, percentage and angle.'],
      keyTerms: [{ term: 'sector angle', definition: 'The angle of a slice, equal to 360° times its share of the total.' }],
    },
    predictionQuestion: { question: 'Home 1 spends ₹ 900 of its ₹ 2000 weekly total on Housing. What angle will the Housing sector have?', options: ['90°', '162°', '180°', '45°'], correctIndex: 1, explanation: 'Housing is 900 ÷ 2000 = 45% of the total, and 45% of 360° is 162°.' },
    experimentGuide: { instruction: 'Open the pie view, tap at least 3 different slices (and try another group’s pie). Read the quantity, percentage and angle of each.', actionHint: 'Choose the group with the “Pie of” selector.', targetActionDescription: 'Inspect 3 different slices', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Add up the angles of all the slices of one pie. What do you get? How do the percentages compare with the 100% stacked bar of the same group?', expectedPattern: 'The angles add up to 360° and the percentages to 100%, and the percentages are the same as in the 100% stacked bar.', invariantsDescription: 'angle = 360° × share, and share = quantity ÷ total.' },
    whyGuide: { explanationType: 'property', explanation: 'A pie chart and a 100% stacked bar both show shares of a whole. Each pie is a share of its own total, so a bigger slice in one pie does not mean a bigger quantity than a smaller slice in another pie.', deductiveTakeaway: 'Pie charts show the composition of one whole; compare quantities across groups with the actual values.' },
    practice: ['Angle of a pie sector', 'From angle to percentage', 'Pie slices across different pies'],
  },
  {
    id: 'ud-l15', unitId: 'ud-unit-5', lessonNumber: 15, title: 'What an Average Hides', subtitle: 'The average day versus real days', isOptionalExtension: true,
    learningObjective: 'See that an average can describe nobody in a diverse population, and that equal averages need not mean equal data.', experimentId: 'ud-average-day', targetMetric: 'chart_edit', hidesResults: true,
    concept: {
      summary: 'A town has children, adults and elderly people. Each group spends its 24-hour day differently. The “average day” of the town is found by averaging each activity over all its people, so bigger groups count for more.',
      detailedPoints: ['Each bar is one group’s day, adding up to 24 hours.', 'The population numbers are the weights.', 'You can change the hours and the population numbers and watch the average day respond.'],
    },
    predictionQuestion: { question: 'The town’s average day is computed from the three groups’ days. Will the average day be exactly the day of one of the groups?', options: ['Yes, it will match the largest group', 'No, it will usually match none of them', 'Yes, it matches the group in the middle'], correctIndex: 1, explanation: 'The average mixes the three different days, so it is usually a day that no group actually lives.' },
    experimentGuide: { instruction: 'Change at least 3 things: a group’s hours or the population weights. After each change, compare the average day with the real groups’ days.', actionHint: 'Edit the table, or change the population numbers.', targetActionDescription: 'Make 3 different changes', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Which real group is closest to the average day, and how many hours of its day would have to change to match it? What stays equal for every group?', expectedPattern: 'No group lives the average day, and every group has the same mean of hours per activity even though their days are very different.', invariantsDescription: 'Each group’s day adds up to 24 hours, so every group has the same average hours per activity.' },
    whyGuide: { explanationType: 'property', explanation: 'An average describes the centre of a collection but not the individual values. Looking only at the average of a diverse collection hides the differences; breaking the data into groups reveals them.', deductiveTakeaway: 'Equal averages do not imply identical data, and an overall average can describe none of its parts.' },
    practice: ['Equal averages, different days', 'Average hours of the town', 'Does anyone live the average day?'],
  },
  {
    id: 'ud-l16', unitId: 'ud-unit-5', lessonNumber: 16, title: 'Gold Purity in Varṇa', subtitle: 'Melting pieces of different purity', isOptionalExtension: true,
    learningObjective: 'Find the purity of melted gold on the varṇa scale as a weighted mean by mass.', experimentId: 'ud-varna', targetMetric: 'mixture_edit', hidesResults: true,
    concept: {
      summary: 'In ancient India gold purity was measured in varṇa. The textbook says: 16 varṇa is pure gold, and k varṇa means the alloy is k/16 gold and the rest impurities. A goldsmith melts a 6 g piece of 14 varṇa together with a 4 g piece of 10 varṇa.',
      detailedPoints: ['Gold in a piece = mass × varṇa ÷ 16.', 'Varṇa, percent and karat are different scales; this lab works in varṇa and shows the others only as labelled equivalents.', 'This is an idealised model of mixing, not an assay.'],
    },
    predictionQuestion: { question: 'The two pieces are 14 varṇa (6 g) and 10 varṇa (4 g). Midway between 14 and 10 is 12. Will the melted gold be below 12, exactly 12, or above 12 varṇa?', options: ['Below 12 varṇa', 'Exactly 12 varṇa', 'Above 12 varṇa'], correctIndex: 2, explanation: 'There is more of the purer 14-varṇa gold, so the result is closer to 14 than to 10.' },
    experimentGuide: { instruction: 'Change the masses and purities of the pieces. Try equal masses, then very different masses. Make at least 3 different melts.', actionHint: 'Watch the gold contributions and the calculation steps change together.', targetActionDescription: 'Make 3 different melts', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Compare the final purity with the purities of the pieces in each melt.', expectedPattern: 'It is always between the lowest and highest purity, closer to the piece with more mass, and equal masses give the midpoint.', invariantsDescription: 'Final varṇa = Σ(mass × varṇa) ÷ Σ mass.' },
    whyGuide: { explanationType: 'property', explanation: 'Each piece brings (mass × varṇa ÷ 16) of gold. Adding these and dividing by the total mass gives the gold fraction, and multiplying by 16 returns to varṇa. That is exactly the weighted mean of the varṇa values with the masses as weights.', deductiveTakeaway: 'Purity of a melt is a weighted mean of the pieces’ purities, weighted by mass.' },
    practice: ['From varṇa to percent gold', 'Melting gold pieces', 'Gold needed for a target purity'],
  },
  {
    id: 'ud-l13', unitId: 'ud-unit-4', lessonNumber: 13, title: 'Chapter Practice and Revision', subtitle: 'Mixed questions across the chapter',
    learningObjective: 'Show mastery across weighted means, mixtures and charts.', experimentId: 'ud-practice', targetMetric: 'group_edit', stages: ['understand', 'practice'],
    concept: { summary: 'Answer a mixed set of questions from every part of the chapter. Mastery needs at least 70% correct on first attempts.', detailedPoints: ['Hints are available but are recorded.', 'You can retry; the first attempt counts toward mastery.'] },
    experimentGuide: { instruction: 'Go to the practice stage.', actionHint: '', targetActionDescription: 'Answer questions', minInteractionsNeeded: 0 },
    observeGuide: { prompt: '', expectedPattern: '', invariantsDescription: '' },
    whyGuide: { explanationType: 'definition', explanation: '', deductiveTakeaway: '' },
    practice: ['Combine two classes', 'Marks with weights 2 : 3 : 5', 'Unequal quantities', 'Doubling all weights', 'Total of a bar', 'Biggest percentage share', 'Larger percentage, smaller amount', 'Which chart type?', 'Spot the invalid inference', 'Find the missing weight'],
  },
];

const entries = seeds.map(({ stages, practice, hidesResults, ...rest }): [string, UDLessonDefinition] => {
  const lesson: UDLessonDefinition = {
    ...rest,
    unitTitle: unitTitle(rest.unitId),
    stages: stages ?? FULL,
    allowedTools: ['weighted', 'mixture', 'charts'],
    practiceQuestionIds: practice.map(idByTitle),
    hidesResultsUntilPrediction: Boolean(hidesResults) && (stages ?? FULL).includes('predict'),
  };
  return [lesson.id, lesson];
});

export const UD_GUIDED_LESSONS: Record<string, UDLessonDefinition> = Object.fromEntries(entries);
/** The 13 required lessons, in order. Only these count toward chapter completion. */
export const UD_LESSON_ORDER: string[] = UD_GUIDED_UNITS.filter((u) => u.badge !== 'Optional').flatMap((u) => u.lessonIds);
export const UD_OPTIONAL_LESSON_IDS: string[] = UD_GUIDED_UNITS.filter((u) => u.badge === 'Optional').flatMap((u) => u.lessonIds);

export const UD_CURRICULUM: GuidedChapterCurriculum = {
  chapterId: 'how-quantities-combine',
  title: 'How Quantities Combine: Understanding Data',
  subjectId: 'mathematics',
  classGrade: 9,
  textbookReference: 'NCERT Class 9 Ganita Manjari Part II, Chapter 10: How Quantities Combine: Understanding Data',
  units: UD_GUIDED_UNITS,
  lessons: UD_GUIDED_LESSONS,
};
