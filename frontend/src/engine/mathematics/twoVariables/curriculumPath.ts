/**
 * Guided curriculum for Two Variables, One Line (Milestone M5).
 * Uses the chapter-neutral Guided Learning definitions (M2.5) unchanged.
 *
 * Authoring rule: the Understand stage introduces the situation but never
 * states the conclusion that the Predict stage asks about.
 */

import type {
  GuidedChapterCurriculum,
  GuidedLessonDefinition,
  GuidedUnitDefinition,
  GuidedStageId,
} from '../guidedLearning/types';
import type { InteractionKind } from './types';

const FULL: GuidedStageId[] = ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];

type LessonSeed = Omit<GuidedLessonDefinition, 'stages' | 'unitTitle' | 'allowedTools' | 'subtitle'> & {
  subtitle: string;
  stages?: GuidedStageId[];
  targetMetric: InteractionKind;
};

export const TV_GUIDED_UNITS: GuidedUnitDefinition[] = [
  { id: 'tv-unit-1', unitNumber: 1, title: 'Discover Two Variables', badge: 'Unit 1', description: 'Meet situations with two changing quantities and learn to read ax + by + c = 0.', lessonIds: ['tv-l1', 'tv-l2', 'tv-l3'] },
  { id: 'tv-unit-2', unitNumber: 2, title: 'One Equation, One Line', badge: 'Unit 2', description: 'Turn solutions into points and discover why they form a straight line.', lessonIds: ['tv-l4', 'tv-l5', 'tv-l6'] },
  { id: 'tv-unit-3', unitNumber: 3, title: 'Two Equations Together', badge: 'Unit 3', description: 'Put two lines on one graph and classify their solutions.', lessonIds: ['tv-l7', 'tv-l8', 'tv-l9'] },
  { id: 'tv-unit-4', unitNumber: 4, title: 'Algebraic Solutions', badge: 'Unit 4', description: 'Solve pairs by substitution and elimination, and match the graph.', lessonIds: ['tv-l10', 'tv-l11'] },
  { id: 'tv-unit-5', unitNumber: 5, title: 'Applications and Mastery', badge: 'Unit 5', description: 'Model real situations, investigate, revise and practise.', lessonIds: ['tv-l12', 'tv-l13', 'tv-l14'] },
];

const unitTitleOf = (unitId: string): string => TV_GUIDED_UNITS.find((u) => u.id === unitId)?.title ?? '';

const seeds: LessonSeed[] = [
  {
    id: 'tv-l1', unitId: 'tv-unit-1', lessonNumber: 1, title: 'What Are Two Variables?', subtitle: 'Two quantities that depend on each other',
    learningObjective: 'Describe a situation with two changing quantities using two letters.', experimentId: 'tv-situations', targetMetric: 'table_row',
    concept: {
      summary: 'Pens cost ₹2 each and pencils cost ₹1 each. You decide to spend exactly ₹10. The number of pens (x) and the number of pencils (y) are two quantities that can change.',
      detailedPoints: ['A variable is a letter standing for a quantity that can change.', 'Here the cost of x pens is 2x rupees and the cost of y pencils is y rupees.', 'Spending exactly ₹10 connects the two variables: 2x + y = 10.'],
      keyTerms: [{ term: 'variable', definition: 'A letter used for a quantity that can take different values.' }, { term: 'ordered pair', definition: 'Two numbers (x, y) written in order, x first.' }],
    },
    predictionQuestion: {
      question: 'Can more than one pair (pens, pencils) cost exactly ₹10?',
      options: ['No, only one pair works.', 'Yes, several different pairs work.', 'No pair can cost exactly ₹10.'],
      correctIndex: 1,
      explanation: 'For example 1 pen and 8 pencils cost 2 + 8 = 10, and 3 pens and 4 pencils cost 6 + 4 = 10. Different choices of x give different y.',
    },
    experimentGuide: { instruction: 'In the table, type a number of pens x. The lab calculates the number of pencils y for ₹10. Add at least 3 rows.', actionHint: 'Type 0, 1, 2 or 3 in the x column and press Add row.', targetActionDescription: 'Add 3 different rows to the table', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Look at your rows. What happens to y each time x goes up by 1?', expectedPattern: 'y goes down by 2 when x goes up by 1, and 2x + y stays 10.', invariantsDescription: 'In every row, 2x + y = 10.' },
    whyGuide: { explanationType: 'definition', explanation: 'The equation 2x + y = 10 links the two variables. Any pair (x, y) that makes it true is called a solution.', deductiveTakeaway: 'An equation in two variables is satisfied by ordered pairs, not by a single number.' },
    practiceQuestionIds: ['q-tv-1', 'q-tv-5'],
  },
  {
    id: 'tv-l2', unitId: 'tv-unit-1', lessonNumber: 2, title: 'Understanding Linear Equations', subtitle: 'Coefficients, constants and standard form',
    learningObjective: 'Read the numbers a, b and c in ax + by + c = 0.', experimentId: 'tv-standard-form', targetMetric: 'coefficient_change',
    concept: {
      summary: 'A linear equation in two variables can be written ax + by + c = 0, where a, b and c are fixed numbers and a and b are not both zero.',
      detailedPoints: ['a multiplies x and b multiplies y; they are called coefficients.', 'c is the constant term.', 'Moving 12 to the left side turns 2x + 3y = 12 into 2x + 3y − 12 = 0, so c = −12.', 'Linear means x and y only appear to the first power and are never multiplied together.'],
      keyTerms: [{ term: 'coefficient', definition: 'The number that multiplies a variable.' }, { term: 'standard form', definition: 'ax + by + c = 0.', symbol: 'ax + by + c = 0' }],
    },
    predictionQuestion: {
      question: 'For 2x + 3y = 12, written as ax + by + c = 0, which values are a, b and c?',
      options: ['a = 2, b = 3, c = 12', 'a = 2, b = 3, c = −12', 'a = 3, b = 2, c = −12'],
      correctIndex: 1,
      explanation: 'Moving 12 to the left side gives 2x + 3y − 12 = 0, so c = −12.',
    },
    experimentGuide: { instruction: 'Use the a, b and c controls and watch the equation update. Change the coefficients at least 4 times.', actionHint: 'Use the + and − buttons beside a, b and c.', targetActionDescription: 'Change a, b or c four times', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'Which coefficient changed the tilt of the line, and which one moved it without tilting?', expectedPattern: 'a and b change the direction; c slides the line.', invariantsDescription: 'The graph is always a straight line while a and b are not both 0.' },
    whyGuide: { explanationType: 'property', explanation: 'Coefficients set the direction of the line, while c sets its position. When a = b = 0 there is no line: the equation is either always true or never true.', deductiveTakeaway: 'Every linear equation in two variables has the form ax + by + c = 0 with (a, b) ≠ (0, 0).' },
    practiceQuestionIds: ['q-tv-2', 'q-tv-3', 'q-tv-4'],
  },
  {
    id: 'tv-l3', unitId: 'tv-unit-1', lessonNumber: 3, title: 'Finding Solutions', subtitle: 'Choose one value, calculate the other',
    learningObjective: 'Find ordered-pair solutions by choosing x and calculating y, or the reverse.', experimentId: 'tv-solutions', targetMetric: 'solution_found',
    concept: {
      summary: 'A solution of 2x + 3y = 12 is an ordered pair (x, y) that makes the equation true. Pick any x, then solve for y.',
      detailedPoints: ['Substitute your chosen x into the equation.', 'Solve the one-variable equation that remains for y.', 'Check by substituting both numbers back.'],
    },
    predictionQuestion: {
      question: 'For 2x + 3y = 12, when x = 3, what is y?',
      options: ['y = 1', 'y = 2', 'y = 3'],
      correctIndex: 1,
      explanation: '2(3) + 3y = 12 gives 3y = 6, so y = 2. The pair (3, 2) is a solution.',
    },
    experimentGuide: { instruction: 'Choose x values yourself and let the lab check your answer for y. Find at least 3 different solutions.', actionHint: 'Enter x, work out y on paper, type it, then press Check.', targetActionDescription: 'Find 3 different solutions', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'Compare the solutions you found. Is there a limit to how many you could find?', expectedPattern: 'Every x you try gives a valid y, so there is no limit.', invariantsDescription: '2x + 3y equals 12 for every solution.' },
    whyGuide: { explanationType: 'property', explanation: 'For each x there is exactly one y that balances the equation (as long as b ≠ 0), and x can be any number.', deductiveTakeaway: 'A linear equation in two variables has infinitely many solutions.' },
    practiceQuestionIds: ['q-tv-7', 'q-tv-8', 'q-tv-6'],
  },
  {
    id: 'tv-l4', unitId: 'tv-unit-2', lessonNumber: 4, title: 'From Solutions to Points', subtitle: 'Build a table, plot the pairs',
    learningObjective: 'Plot ordered-pair solutions on the coordinate plane.', experimentId: 'tv-points', targetMetric: 'table_row',
    concept: {
      summary: 'An ordered pair (x, y) is plotted by moving x units along the x-axis and then y units parallel to the y-axis.',
      detailedPoints: ['Positive x is to the right, negative to the left.', 'Positive y is up, negative is down.', 'The origin is (0, 0).'],
    },
    predictionQuestion: {
      question: 'How do you plot the ordered pair (3, 2)?',
      options: ['Go 2 along the x-axis, then 3 up.', 'Go 3 along the x-axis, then 2 up.', 'Go 3 up only.'],
      correctIndex: 1,
      explanation: 'The first number is the x-coordinate, so move 3 right and then 2 up.',
    },
    experimentGuide: { instruction: 'Add rows to the solution table. Each row appears as a point on the graph. Plot at least 4 solutions.', actionHint: 'Type x = 0, 3, 6 and −3, and press Fill y for me.', targetActionDescription: 'Plot 4 solutions from the table', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'Look at the points you plotted. Do they scatter randomly?', expectedPattern: 'The points appear to line up.', invariantsDescription: 'Every plotted point satisfies 2x + 3y = 12.' },
    whyGuide: { explanationType: 'property', explanation: 'Each solution is one point of the graph. The more solutions you plot, the clearer the pattern becomes.', deductiveTakeaway: 'The graph of an equation is the picture of all its solutions.' },
    practiceQuestionIds: ['q-tv-14', 'q-tv-19'],
  },
  {
    id: 'tv-l5', unitId: 'tv-unit-2', lessonNumber: 5, title: 'Why the Graph Is a Straight Line', subtitle: 'Compare plotted points with the line',
    learningObjective: 'Explain why all solutions of a linear equation lie on one line.', experimentId: 'tv-line', targetMetric: 'point_drag',
    concept: {
      summary: 'The points (0, 4), (3, 2) and (6, 0) are solutions of 2x + 3y = 12. Now a movable point is attached to the line.',
      detailedPoints: ['Drag the green point; the lab keeps it exactly on the line and updates its coordinates.', 'Dragging snaps x to half-units so the coordinates stay exact.'],
    },
    predictionQuestion: {
      question: 'If you test more solutions, such as x = 1.5 and x = 4.5, will they lie on the same straight line?',
      options: ['Yes, all of them will.', 'No, they will bend away from it.', 'Only the whole-number ones will.'],
      correctIndex: 0,
      explanation: 'Every solution has the same pattern: when x changes by 3, y changes by −2.',
    },
    experimentGuide: { instruction: 'Drag the point along the line to at least 4 different positions and read its coordinates.', actionHint: 'Press and drag the green point, or use arrow keys when it is focused.', targetActionDescription: 'Move the point to 4 positions', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'For each position, calculate 2x + 3y. What do you notice about the changes in x and y between positions?', expectedPattern: 'Equal steps in x always produce equal steps in y (here −2/3 of the x-step).', invariantsDescription: 'The slope between any two solutions is the same: −2/3.' },
    whyGuide: { explanationType: 'property', explanation: 'From 2x + 3y = 12, if x increases by h then y changes by −2h/3. A constant rate of change is exactly what a straight line has.', deductiveTakeaway: 'The graph of ax + by + c = 0 is a straight line because y changes at a constant rate with x.' },
    practiceQuestionIds: ['q-tv-20', 'q-tv-35'],
  },
  {
    id: 'tv-l6', unitId: 'tv-unit-2', lessonNumber: 6, title: 'Slope and Intercepts', subtitle: 'Read steepness and axis crossings',
    learningObjective: 'Compute slope and intercepts, including vertical and horizontal lines.', experimentId: 'tv-slope-intercept', targetMetric: 'coefficient_change',
    concept: {
      summary: 'The x-intercept is where the line meets the x-axis (y = 0). The y-intercept is where it meets the y-axis (x = 0). The slope −a/b measures steepness.',
      detailedPoints: ['Set y = 0 to find x = −c/a.', 'Set x = 0 to find y = −c/b.', 'If b = 0 the line is vertical (x = constant) and the slope is undefined.', 'If a = 0 the line is horizontal (y = constant) and the slope is 0.'],
      keyTerms: [{ term: 'slope', definition: 'The change in y for each increase of 1 in x.' }],
    },
    predictionQuestion: {
      question: 'In x + y = k, what happens to the line when k is increased from 2 to 5?',
      options: ['It moves parallel to itself.', 'It becomes steeper.', 'It turns into a vertical line.'],
      correctIndex: 0,
      explanation: 'The slope −a/b = −1 does not depend on k. Only the position changes.',
    },
    experimentGuide: { instruction: 'Change a, b and c at least 5 times. Watch slope and intercepts. Try b = 0 and a = 0.', actionHint: 'Use the controls; the slope label shows "undefined" for vertical lines.', targetActionDescription: 'Change coefficients 5 times', minInteractionsNeeded: 5 },
    observeGuide: { prompt: 'Record how the slope and intercepts change when only c changes.', expectedPattern: 'The slope stays the same while both intercepts scale with c.', invariantsDescription: 'Slope = −a/b depends only on a and b.' },
    whyGuide: { explanationType: 'property', explanation: 'Solving ax + by + c = 0 for y gives y = (−a/b)x − c/b when b ≠ 0, so the slope is −a/b and the y-intercept is −c/b.', deductiveTakeaway: 'Slope depends on a and b; position depends on c as well.' },
    practiceQuestionIds: ['q-tv-9', 'q-tv-10', 'q-tv-11', 'q-tv-12', 'q-tv-13', 'q-tv-15'],
  },
  {
    id: 'tv-l7', unitId: 'tv-unit-3', lessonNumber: 7, title: 'Two Lines on One Graph', subtitle: 'Edit two equations at once',
    learningObjective: 'Plot and compare two linear equations on the same plane.', experimentId: 'tv-two-lines', targetMetric: 'system_edit',
    concept: {
      summary: 'Now two equations share a graph: Line 1 is 2x + 3y = 12 and Line 2 is x + y = 5. Each has its own colour and style.',
      detailedPoints: ['Edit either equation independently.', 'Compare their slopes and where they cross.'],
    },
    predictionQuestion: {
      question: 'Can two different straight lines share more than one point?',
      options: ['No, two different lines share at most one point.', 'Yes, they can share exactly two points.', 'Yes, any two lines share many points.'],
      correctIndex: 0,
      explanation: 'Two different points determine exactly one line. If two lines shared two points they would be the same line.',
    },
    experimentGuide: { instruction: 'Change the coefficients of both equations at least 4 times and watch where the lines meet.', actionHint: 'Use the controls under each equation.', targetActionDescription: 'Edit the equations 4 times', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'In how many different ways could the two lines sit relative to each other?', expectedPattern: 'They can cross, be separate, or lie on top of each other.', invariantsDescription: 'Two distinct lines never share more than one point.' },
    whyGuide: { explanation: 'Two different points fix a unique line, so distinct lines can meet in at most one point.', explanationType: 'property', deductiveTakeaway: 'Possible positions: crossing at one point, parallel with no common point, or the same line.' },
    practiceQuestionIds: ['q-tv-21', 'q-tv-22'],
  },
  {
    id: 'tv-l8', unitId: 'tv-unit-3', lessonNumber: 8, title: 'The Intersection Is a Solution', subtitle: 'Both equations hold at the crossing',
    learningObjective: 'Show that the intersection satisfies both equations.', experimentId: 'tv-intersection', targetMetric: 'system_edit',
    concept: {
      summary: '2x + 3y = 12 and x + y = 5 cross at one point. The lab marks it and substitutes its coordinates into both equations.',
      detailedPoints: ['A solution of a pair must satisfy both equations at once.', 'Each line contains the solutions of one equation.'],
    },
    predictionQuestion: {
      question: 'The lines 2x + 3y = 12 and x + y = 5 cross at (3, 2). Will (3, 2) satisfy both equations?',
      options: ['Yes, both.', 'Only the first.', 'Only the second.'],
      correctIndex: 0,
      explanation: '2(3) + 3(2) = 12 and 3 + 2 = 5. The crossing point lies on both lines, so both equations hold.',
    },
    experimentGuide: { instruction: 'Edit the equations so that the lines still cross, and read the verification panel each time. Do this 3 times.', actionHint: 'Change a coefficient and read the substitution lines.', targetActionDescription: 'Check 3 different intersections', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'In every case, what are the two substituted values?', expectedPattern: 'Both substitutions give true statements at the intersection.', invariantsDescription: 'The intersection is on both lines, so it satisfies both equations.' },
    whyGuide: { explanationType: 'property', explanation: 'A point on Line 1 satisfies equation 1; a point on Line 2 satisfies equation 2. A point on both lines satisfies both.', deductiveTakeaway: 'The solution of a pair of linear equations is the point where their graphs meet.' },
    practiceQuestionIds: ['q-tv-21', 'q-tv-22', 'q-tv-31'],
  },
  {
    id: 'tv-l9', unitId: 'tv-unit-3', lessonNumber: 9, title: 'Parallel and Coincident Lines', subtitle: 'One, none or infinitely many solutions',
    learningObjective: 'Classify a pair of lines and relate it to the number of solutions.', experimentId: 'tv-classification', targetMetric: 'system_edit',
    concept: {
      summary: 'Compare the coefficient ratios a₁/a₂, b₁/b₂ and c₁/c₂ of the two equations. The lab classifies the pair using an exact calculation.',
      detailedPoints: ['Different a₁/a₂ and b₁/b₂: the lines cross once.', 'The lab will never draw an intersection mark unless there is exactly one.'],
    },
    predictionQuestion: {
      question: 'Two lines have the same slope but different y-intercepts. How many solutions does the pair have?',
      options: ['Exactly one.', 'None.', 'Infinitely many.'],
      correctIndex: 1,
      explanation: 'Same slope means parallel; different intercepts mean they never meet, so no point satisfies both.',
    },
    experimentGuide: { instruction: 'Edit the equations to create each of the three situations: one crossing, parallel lines, and coincident lines.', actionHint: 'Try multiplying every term of one equation by 2 to get coincident lines.', targetActionDescription: 'Edit 5 times', minInteractionsNeeded: 5 },
    observeGuide: { prompt: 'Which coefficient ratios were equal in the parallel case? In the coincident case?', expectedPattern: 'Parallel: a₁/a₂ = b₁/b₂ ≠ c₁/c₂. Coincident: all three equal.', invariantsDescription: 'The determinant a₁b₂ − a₂b₁ is zero for parallel and coincident lines.' },
    whyGuide: { explanationType: 'property', explanation: 'If a₁b₂ − a₂b₁ ≠ 0 there is exactly one common point. If it is 0, the directions agree; the constants then decide between no common point and all points.', deductiveTakeaway: 'Unique: one solution. Parallel: no solution. Coincident: infinitely many.' },
    practiceQuestionIds: ['q-tv-23', 'q-tv-24', 'q-tv-25', 'q-tv-32', 'q-tv-33'],
  },
  {
    id: 'tv-l10', unitId: 'tv-unit-4', lessonNumber: 10, title: 'Solving by Substitution', subtitle: 'Isolate, substitute, solve, back-substitute',
    learningObjective: 'Solve a pair by substitution and match the result to the graph.', experimentId: 'tv-substitution', targetMetric: 'algebra_step',
    concept: {
      summary: 'Write one variable in terms of the other from one equation, then replace it in the other equation.',
      detailedPoints: ['Each step is chosen from a menu and checked by the lab.', 'The lab will not let you isolate a variable that does not appear in the equation.', 'The final pair is compared with the intersection on the graph.'],
    },
    predictionQuestion: {
      question: 'After replacing x by (5 − y) in 2x + 3y = 12, how many variables remain?',
      options: ['Two.', 'One.', 'None.'],
      correctIndex: 1,
      explanation: '2(5 − y) + 3y = 12 contains only y, so it can be solved directly.',
    },
    experimentGuide: { instruction: 'Complete the five steps: isolate, substitute, solve, back-substitute, verify. Apply at least 5 steps.', actionHint: 'Use the step buttons in order.', targetActionDescription: 'Apply 5 algebra steps', minInteractionsNeeded: 5 },
    observeGuide: { prompt: 'Compare your algebraic answer with the intersection marker.', expectedPattern: 'They are the same point.', invariantsDescription: 'Every intermediate equation is satisfied by the final pair.' },
    whyGuide: { explanationType: 'property', explanation: 'Substitution replaces a quantity by an equal one, so no solution is lost or added.', deductiveTakeaway: 'Substitution and graphing give the same solution because both find the point on both lines.' },
    practiceQuestionIds: ['q-tv-26', 'q-tv-27', 'q-tv-40'],
  },
  {
    id: 'tv-l11', unitId: 'tv-unit-4', lessonNumber: 11, title: 'Solving by Elimination', subtitle: 'Multiply, add or subtract equations',
    learningObjective: 'Solve a pair by elimination with checked multipliers.', experimentId: 'tv-elimination', targetMetric: 'algebra_step',
    concept: {
      summary: 'Multiply equations by non-zero numbers so that one variable has matching coefficients, then add or subtract to remove it.',
      detailedPoints: ['Multiplying by 0 is not allowed.', 'Only subtract if the coefficients are equal; add if they are opposite.'],
    },
    predictionQuestion: {
      question: 'Adding x + y = 5 and x − y = 1 eliminates which variable?',
      options: ['x', 'y', 'Neither'],
      correctIndex: 1,
      explanation: 'The y-terms are +y and −y, which cancel when added, leaving 2x = 6.',
    },
    experimentGuide: { instruction: 'Multiply, combine, solve, back-substitute and verify. Apply at least 4 steps.', actionHint: 'Choose a multiplier first, then press Add or Subtract.', targetActionDescription: 'Apply 4 algebra steps', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'Check the intermediate equations at the solution point. What do you see?', expectedPattern: 'Every equation produced is true at the final solution.', invariantsDescription: 'Valid steps keep the solution.' },
    whyGuide: { explanationType: 'property', explanation: 'Doing the same thing to both sides keeps an equation true, and adding true equations gives a true equation.', deductiveTakeaway: 'Elimination turns two unknowns into one without changing the solution.' },
    practiceQuestionIds: ['q-tv-28', 'q-tv-29', 'q-tv-39'],
  },
  {
    id: 'tv-l12', unitId: 'tv-unit-5', lessonNumber: 12, title: 'Real-World Linear Models', subtitle: 'Fixed fee plus a rate',
    learningObjective: 'Interpret slope and intercept in a real situation.', experimentId: 'tv-models', targetMetric: 'table_row',
    concept: {
      summary: 'A library charges a fixed ₹10 plus ₹3 for each book borrowed. With x books and a total cost of y rupees, y = 3x + 10.',
      detailedPoints: ['The y-intercept is the cost when x = 0.', 'The slope is the cost of each additional book.'],
    },
    predictionQuestion: {
      question: 'In y = 3x + 10, what does the number 10 represent?',
      options: ['The cost per book.', 'The fixed charge paid even for zero books.', 'The number of books.'],
      correctIndex: 1,
      explanation: 'When x = 0, y = 10: that is the fixed charge.',
    },
    experimentGuide: { instruction: 'Add at least 3 rows to see the cost of borrowing different numbers of books.', actionHint: 'Use whole numbers for x.', targetActionDescription: 'Add 3 rows', minInteractionsNeeded: 3 },
    observeGuide: { prompt: 'By how much does the cost rise for each extra book?', expectedPattern: 'It rises by ₹3 each time, which is the slope.', invariantsDescription: 'Constant rate of change.' },
    whyGuide: { explanationType: 'definition', explanation: 'A fixed amount plus a constant rate produces a straight-line graph.', deductiveTakeaway: 'Slope is the rate; the y-intercept is the starting amount.' },
    practiceQuestionIds: ['q-tv-30', 'q-tv-36', 'q-tv-37', 'q-tv-38'],
  },
  {
    id: 'tv-l13', unitId: 'tv-unit-5', lessonNumber: 13, title: 'Guided Investigation: Why Many Solutions?', subtitle: 'One equation, infinitely many pairs',
    learningObjective: 'Investigate and explain why one linear equation has many solutions.', experimentId: 'tv-investigation', targetMetric: 'solution_found',
    concept: {
      summary: 'Here is the equation 2x + 3y = 12. We want to find out how many ordered pairs satisfy it.',
      detailedPoints: ['Think about what you know: a solution is an ordered pair that makes the equation true.', 'You will test your own idea before the lab says anything about it.'],
    },
    predictionQuestion: {
      question: 'Can there be more than one solution of 2x + 3y = 12?',
      options: ['No, exactly one.', 'Yes, but only a few.', 'Yes, infinitely many.'],
      correctIndex: 2,
      explanation: 'Any value of x gives a matching value of y, so there is no limit.',
    },
    experimentGuide: { instruction: 'Change x, calculate y yourself, and check. Find at least 4 different solutions.', actionHint: 'Try x = 0, 3, −3 and 1.5.', targetActionDescription: 'Find 4 different solutions', minInteractionsNeeded: 4 },
    observeGuide: { prompt: 'Your recorded solutions are listed. What do their points have in common on the graph?', expectedPattern: 'They all lie on the same straight line.', invariantsDescription: '2x + 3y = 12 for every recorded pair.' },
    whyGuide: { explanationType: 'property', explanation: 'Each solution is a point of the line 2x + 3y = 12, and a line has infinitely many points. Every point of the line is a solution, and every solution is on the line.', deductiveTakeaway: 'Solutions of a linear equation ↔ points of its line.' },
    practiceQuestionIds: ['q-tv-41', 'q-tv-19'],
  },
  {
    id: 'tv-l14', unitId: 'tv-unit-5', lessonNumber: 14, title: 'Chapter Practice and Mastery', subtitle: 'Mixed questions across the chapter',
    learningObjective: 'Show mastery with a mixed set of questions.', experimentId: 'tv-practice', targetMetric: 'solution_found', stages: ['understand', 'practice'],
    concept: {
      summary: 'Answer a mixed set of questions from every part of the chapter. Mastery needs at least 70% correct on the first attempts.',
      detailedPoints: ['Hints are available but are recorded.', 'You can retry questions; the first attempt counts toward mastery.'],
    },
    experimentGuide: { instruction: 'Go to the practice stage.', actionHint: 'Answer each question.', targetActionDescription: 'Answer questions', minInteractionsNeeded: 0 },
    observeGuide: { prompt: '', expectedPattern: '', invariantsDescription: '' },
    whyGuide: { explanationType: 'definition', explanation: '', deductiveTakeaway: '' },
    practiceQuestionIds: ['q-tv-1', 'q-tv-5', 'q-tv-9', 'q-tv-15', 'q-tv-21', 'q-tv-23', 'q-tv-24', 'q-tv-26', 'q-tv-29', 'q-tv-32'],
  },
];

export const TV_LESSON_TARGETS: Record<string, InteractionKind> = Object.fromEntries(seeds.map((s) => [s.id, s.targetMetric]));

const lessonEntries = seeds.map(({ targetMetric: _t, stages, ...rest }): [string, GuidedLessonDefinition] => {
  void _t;
  const lesson: GuidedLessonDefinition = {
    ...rest,
    unitTitle: unitTitleOf(rest.unitId),
    stages: stages ?? FULL,
    allowedTools: ['graph', 'table'],
  };
  return [lesson.id, lesson];
});

export const TV_GUIDED_LESSONS: Record<string, GuidedLessonDefinition> = Object.fromEntries(lessonEntries);

export const TV_LESSON_ORDER: string[] = TV_GUIDED_UNITS.flatMap((u) => u.lessonIds);

export const TV_CURRICULUM: GuidedChapterCurriculum = {
  chapterId: 'two-variables-one-line',
  title: 'Two Variables, One Line',
  subjectId: 'mathematics',
  classGrade: 9,
  textbookReference: 'NCERT Class 9 Ganita Manjari Part II, Chapter 13: Two Variables, One Line',
  units: TV_GUIDED_UNITS,
  lessons: TV_GUIDED_LESSONS,
};
