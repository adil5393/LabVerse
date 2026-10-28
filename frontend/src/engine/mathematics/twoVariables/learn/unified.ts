/**
 * Two Variables migration to the unified framework. Pure data from the older guided path (`curriculumPath.ts`,
 * `practiceBank.ts`), which stays untouched behind the compatibility switch.
 *
 * The older path taught pairs of equations (Sections 13.4 to 13.6) that the first seven Learn lessons did not; Lessons 8 to 11
 * (`lessonsC.ts`) now teach them, so every older lesson has a current home. Older ids look like current ids but are matched only
 * through the table (older `tv-l7` "Two Lines on One Graph" is NOT current `tv-l7` "The line y = mx + d").
 */

import type { ChapterAssessment, EduLesson, IndependentItem, JudgeRegistry, LabTask, PracticeGroup, PracticeSet, Question } from '../../../education/types';
import type { LessonMapping } from '../../../education/legacy';
import { enrichFromGuided, guidedLabTask } from '../../guidedLearning/unify';
import type { GuidedLessonDefinition } from '../../guidedLearning/types';
import { TV_GUIDED_LESSONS } from '../curriculumPath';
import { TWO_VARIABLES_PRACTICE_BANK as BANK } from '../practiceBank';
import { toNumber } from '../rational';
import type { LinearEq } from '../linearEquation';
import type { TVPracticeQuestion } from '../types';
import { pairRelation, type Eq3 } from './pairs';

export const TV_LEGACY_KEY = 'labverse_two_variables_progress_v1';
export const TV_WORKBENCH = '/mathematics/two-variables/workbench';

export const TV_LESSON_MAP: LessonMapping = {
  'tv-l1': 'tv-l1', // What are two variables? → Two quantities, one equation
  'tv-l2': 'tv-l2', // Understanding linear equations → Standard form
  'tv-l3': 'tv-l3', // Finding solutions → Solutions are ordered pairs
  'tv-l13': 'tv-l3', // Why many solutions?
  'tv-l4': 'tv-l4', // From solutions to points → From a table to a graph
  'tv-l5': 'tv-l4', // Why the graph is a straight line
  'tv-l12': 'tv-l5', // Real-world linear models → Solutions that make sense
  'tv-l6': 'tv-l6', // Slope and intercepts → The steepness of a line
  'tv-l8': 'tv-l8', // The intersection is a solution → A pair of equations
  'tv-l10': 'tv-l9', // Solving by substitution → Substitution and elimination
  'tv-l11': 'tv-l9', // Solving by elimination
  'tv-l9': 'tv-l10', // Parallel and coincident lines → One, none or infinitely many
  'tv-l7': 'tv-l11', // Two lines on one graph → Solving a pair by drawing lines
  'tv-l14': null, // Chapter practice and mastery → practice bank + assessment
};

export const labTaskFor = (l: GuidedLessonDefinition): LabTask => guidedLabTask(l, TV_WORKBENCH);

export function enrichLesson(lesson: EduLesson): EduLesson {
  const olders = Object.entries(TV_LESSON_MAP).filter(([, to]) => to === lesson.id).map(([from]) => TV_GUIDED_LESSONS[from]).filter(Boolean);
  return enrichFromGuided(lesson, olders, TV_WORKBENCH);
}

const eq3 = (e: LinearEq): Eq3 => [toNumber(e.a), toNumber(e.b), toNumber(e.c)];
const onLine = (e: Eq3, x: number, y: number) => Math.abs(e[0] * x + e[1] * y + e[2]) < 1e-9;

/** Judges for "give any point on this line" questions (many right answers), one per question. */
export const TV_JUDGES: JudgeRegistry = Object.fromEntries(
  BANK.filter((q) => q.answer.kind === 'graph_point' && q.answer.equations.length === 1).map((q) => {
    const e = eq3((q.answer as { equations: LinearEq[] }).equations[0]);
    return [`tv-online-${q.id}`, (x: number, y?: number) => (y !== undefined && onLine(e, x, y)
      ? { correct: true, message: 'That point satisfies the equation, so it is on the line.' }
      : { correct: false, message: 'Substitute your x and y: the left side does not equal the right side, so the point is not on the line. Choose x, then calculate y from the equation.', misconception: 'point-not-on-line' })];
  }),
);

export function convertQuestion(q: TVPracticeQuestion): Question {
  const defaultFeedback = { message: q.hints[0] ?? 'Substitute and check the equation.', misconception: `tv-${q.topicId}` };
  const a = q.answer;
  switch (a.kind) {
    case 'choice': {
      const opts = q.options ?? [];
      return { kind: 'choice', id: q.id, prompt: q.statement, options: opts.map((text, i) => ({ id: `o${i}`, text })), correctId: `o${a.index}`, feedback: Object.fromEntries(opts.map((_, i) => [`o${i}`, defaultFeedback]).filter(([id]) => id !== `o${a.index}`)), explanation: q.explanation };
    }
    case 'number':
      return { kind: 'numeric', id: q.id, prompt: q.statement, answer: toNumber(a.value), tolerance: 1e-9, defaultFeedback, explanation: q.explanation };
    case 'pair':
      return { kind: 'multi', id: q.id, prompt: q.statement, parts: [{ id: 'x', label: 'x', answer: toNumber(a.x), tolerance: 1e-9 }, { id: 'y', label: 'y', answer: toNumber(a.y), tolerance: 1e-9 }], defaultFeedback, explanation: q.explanation };
    case 'graph_point': {
      if (a.equations.length === 1) return { kind: 'judged', id: q.id, prompt: q.statement.replace('Click a point on the grid', 'Give a point').replace(' The line is hidden until you answer.', ''), judgeId: `tv-online-${q.id}`, input: 'pair', explanation: q.explanation };
      const rel = pairRelation(eq3(a.equations[0]), eq3(a.equations[1]));
      if (rel.kind !== 'unique') throw new Error(`Two Variables question ${q.id}: the lines do not meet in one point`);
      return { kind: 'multi', id: q.id, prompt: q.statement.replace('Click the point', 'Give the point').replace(' The lines are hidden until you answer.', ''), parts: [{ id: 'x', label: 'x', answer: rel.x, tolerance: 1e-9 }, { id: 'y', label: 'y', answer: rel.y, tolerance: 1e-9 }], defaultFeedback, explanation: q.explanation };
    }
  }
}

export const practiceItem = (q: TVPracticeQuestion): IndependentItem => ({
  id: q.id, topic: q.title, prompt: q.title, question: convertQuestion(q),
  hints: q.hints.length ? q.hints : ['Substitute and check the equation.'], solution: q.workedSolution, difficulty: q.difficulty, source: { kind: 'original' },
});

export const TV_PRACTICE_ITEM_IDS: Record<string, string> = Object.fromEntries(BANK.map((q) => [q.id, q.id]));

export function buildTvPracticeSet(): PracticeSet {
  const groupFor = (to: string | null): { id: string; title: string } =>
    !to ? { id: 'g-mixed', title: 'Mixed practice' }
      : ['tv-l1', 'tv-l2', 'tv-l3'].includes(to) ? { id: 'g-equations', title: 'Equations and solutions' }
      : ['tv-l4', 'tv-l5', 'tv-l6', 'tv-l7'].includes(to) ? { id: 'g-graphs', title: 'Graphs and slope' }
      : { id: 'g-pairs', title: 'Pairs of equations' };
  const order = ['tv-l1', 'tv-l2', 'tv-l3', 'tv-l13', 'tv-l4', 'tv-l5', 'tv-l12', 'tv-l6', 'tv-l7', 'tv-l8', 'tv-l9', 'tv-l10', 'tv-l11', 'tv-l14'];
  const groups: PracticeGroup[] = [];
  const placed = new Set<string>();
  for (const lid of order) {
    const g0 = groupFor(TV_LESSON_MAP[lid] ?? null);
    let g = groups.find((x) => x.id === g0.id);
    if (!g) { g = { ...g0, blurb: `Questions on ${g0.title.toLowerCase()}.`, items: [] }; groups.push(g); }
    for (const qid of TV_GUIDED_LESSONS[lid].practiceQuestionIds) {
      if (placed.has(qid)) continue;
      const q = BANK.find((x) => x.id === qid);
      if (!q) continue;
      placed.add(qid);
      g.items.push(practiceItem(q));
    }
  }
  const rest = BANK.filter((q) => !placed.has(q.id));
  if (rest.length) groups.push({ id: 'g-more', title: 'More practice', blurb: 'Further questions from the chapter.', items: rest.map(practiceItem) });
  return { id: 'two-variables-practice', title: 'Two Variables chapter practice', groups };
}

const pick = (id: string, prompt: string, options: [string, string][], correct: string, explanation: string, mis: string): Question => ({
  kind: 'choice', id, prompt, options: options.map(([oid, text]) => ({ id: oid, text })), correctId: correct,
  feedback: Object.fromEntries(options.filter(([oid]) => oid !== correct).map(([oid]) => [oid, { message: explanation, misconception: mis }])), explanation,
});
const num = (id: string, prompt: string, answer: number, wrong: string, mis: string, explanation: string): Question =>
  ({ kind: 'numeric', id, prompt, answer, tolerance: 1e-6, defaultFeedback: { message: wrong, misconception: mis }, explanation });

export const TV_ASSESSMENT: ChapterAssessment = {
  id: 'two-variables-assessment-1',
  title: 'Two Variables, One Line: chapter assessment',
  instructions: 'Nine original questions across the chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'ta-1', topic: 'Standard form', lessonId: 'tv-l2', competency: 'knowledge', marks: 1, prompt: 'Coefficients.', question: pick('ta-1q', 'Write 3x = 2y + 7 as ax + by + c = 0. Which is correct?', [['a', '3x − 2y − 7 = 0'], ['b', '3x + 2y + 7 = 0'], ['c', '3x − 2y + 7 = 0']], 'a', 'Move every term to the left: 3x − 2y − 7 = 0.', 'sign-when-moving'), solution: ['Subtract 2y and 7 from both sides: 3x − 2y − 7 = 0.'] },
        { id: 'ta-2', topic: 'Solutions', lessonId: 'tv-l3', competency: 'knowledge', marks: 1, prompt: 'A solution.', question: num('ta-2q', 'In 2x + y = 9, x = 3. What is y?', 3, 'Substitute x = 3: 6 + y = 9.', 'substitution', '6 + y = 9, so y = 3.'), solution: ['2 × 3 + y = 9, so y = 3.'] },
        { id: 'ta-3', topic: 'Slope', lessonId: 'tv-l6', competency: 'knowledge', marks: 1, prompt: 'Steepness.', question: num('ta-3q', 'A line passes through (1, 2) and (3, 8). What is its slope?', 3, 'Slope = change in y ÷ change in x.', 'slope-upside-down', '(8 − 2) ÷ (3 − 1) = 3.'), solution: ['Slope = (8 − 2) ÷ (3 − 1) = 6 ÷ 2 = 3.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'ta-4', topic: 'Slope-intercept form', lessonId: 'tv-l7', competency: 'application', marks: 2, prompt: 'Read the line.', question: num('ta-4q', 'For the line 2x + y = 6, what is the y-intercept (the value of y where it crosses the y-axis)?', 6, 'Put x = 0 (or write y = −2x + 6).', 'intercept-confusion', 'y = −2x + 6, so it crosses at y = 6.'), solution: ['y = −2x + 6.', 'At x = 0, y = 6.'] },
        { id: 'ta-5', topic: 'Substitution and elimination', lessonId: 'tv-l9', competency: 'application', marks: 2, prompt: 'Solve the pair.', question: { kind: 'multi', id: 'ta-5q', prompt: 'Solve x + y = 11 and x − y = 5.', parts: [{ id: 'x', label: 'x', answer: 8, tolerance: 1e-6 }, { id: 'y', label: 'y', answer: 3, tolerance: 1e-6 }], defaultFeedback: { message: 'Add the equations to remove y, then substitute back.', misconception: 'pair-solution' }, explanation: '2x = 16, x = 8, y = 3.' }, solution: ['Adding: 2x = 16, x = 8.', 'y = 11 − 8 = 3.'] },
        { id: 'ta-6', topic: 'A pair of equations', lessonId: 'tv-l8', competency: 'application', marks: 2, prompt: 'A word problem.', question: { kind: 'multi', id: 'ta-6q', prompt: '4 pens and 1 notebook cost ₹70; 2 pens and 3 notebooks cost ₹110. Find the cost of a pen (x) and a notebook (y), in rupees.', parts: [{ id: 'x', label: 'pen (x)', answer: 10, tolerance: 1e-6 }, { id: 'y', label: 'notebook (y)', answer: 30, tolerance: 1e-6 }], defaultFeedback: { message: 'Write 4x + y = 70 and 2x + 3y = 110, then eliminate x (double the second equation) or substitute y = 70 − 4x.', misconception: 'pair-solution' }, explanation: 'y = 70 − 4x; 2x + 210 − 12x = 110, so x = 10 and y = 30.' }, solution: ['4x + y = 70 and 2x + 3y = 110.', 'y = 70 − 4x, so 2x + 3(70 − 4x) = 110 and x = 10.', 'y = 70 − 40 = 30.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'ta-7', topic: 'Number of solutions', lessonId: 'tv-l10', competency: 'analysis', marks: 2, prompt: 'How many solutions?', question: pick('ta-7q', 'How many solutions do 2x − 3y = 4 and 4x − 6y = 9 have?', [['n', 'None'], ['o', 'Exactly one'], ['m', 'Infinitely many']], 'n', 'Doubling the first gives 4x − 6y = 8, not 9: the lines are parallel.', 'none-vs-many'), solution: ['2 × (2x − 3y = 4) is 4x − 6y = 8.', 'Subtracting from 4x − 6y = 9 gives 0 = 1: no solution.'] },
        { id: 'ta-8', topic: 'Graphical method', lessonId: 'tv-l11', competency: 'analysis', marks: 2, prompt: 'Where do they meet?', question: { kind: 'multi', id: 'ta-8q', prompt: 'Where do the lines y = 2x − 1 and y = −x + 5 meet?', parts: [{ id: 'x', label: 'x', answer: 2, tolerance: 1e-6 }, { id: 'y', label: 'y', answer: 3, tolerance: 1e-6 }], defaultFeedback: { message: 'At the meeting point both give the same y: 2x − 1 = −x + 5.', misconception: 'pair-solution' }, explanation: '3x = 6, x = 2, y = 3.' }, solution: ['2x − 1 = −x + 5, so 3x = 6 and x = 2.', 'y = 2 × 2 − 1 = 3.'] },
        { id: 'ta-9', topic: 'Solutions that make sense', lessonId: 'tv-l5', competency: 'analysis', marks: 2, prompt: 'A real situation.', question: pick('ta-9q', 'Chairs cost ₹500 and tables ₹1500. A school spends exactly ₹6000: 500x + 1500y = 6000. Which pair is NOT a sensible answer?', [['b', '(13.5, −0.5)'], ['a', '(12, 0)'], ['c', '(3, 3)']], 'b', 'Numbers of chairs and tables must be whole and not negative, even though (13.5, −0.5) satisfies the equation.', 'nonsense-solution'), solution: ['500 × 13.5 + 1500 × (−0.5) = 6750 − 750 = 6000, so it satisfies the equation…', '…but half chairs and negative tables are impossible, so it is not a sensible answer.'] },
      ],
    },
  ],
};
