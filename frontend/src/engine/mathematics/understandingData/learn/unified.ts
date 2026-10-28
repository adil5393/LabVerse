/**
 * Understanding Data migration to the unified framework. Pure data from the older guided path (`curriculumPath.ts`,
 * `practiceBank.ts`), which stays untouched behind the compatibility switch. 16 older lessons map BY TOPIC onto the 6 current
 * lessons (explicit table). Older numeric predictions become numeric predictions; older "must visit these chart views"
 * become laboratory goals met only when the workbench reports the view; chart-click practice stays chart-click (visual
 * questions on the same chart components).
 */

import type { ChapterAssessment, EduLesson, IndependentItem, LabTask, PracticeGroup, PracticeSet, Question } from '../../../education/types';
import type { LessonMapping } from '../../../education/legacy';
import { enrichFromGuided, guidedLabTask } from '../../guidedLearning/unify';
import { UD_GUIDED_LESSONS, type UDLessonDefinition } from '../curriculumPath';
import { UNDERSTANDING_DATA_PRACTICE_BANK as BANK } from '../practiceBank';
import { toNumber } from '../rational';
import type { UDPracticeQuestion } from '../types';

export const UD_LEGACY_KEY = 'labverse_understanding_data_progress_v1';
export const UD_WORKBENCH = '/mathematics/understanding-data/workbench';

export const UD_LESSON_MAP: LessonMapping = {
  'ud-l1': 'ud-l1', // Why averages can mislead → The average of averages
  'ud-l2': 'ud-l1', // Combining groups of different sizes
  'ud-l3': 'ud-l2', // Discovering weighted averages → Weights pull the mean
  'ud-l5': 'ud-l2', // Importance weights and ratings
  'ud-l6': 'ud-l2', // Solving weighted average problems
  'ud-l4': 'ud-l3', // Mixtures and concentrations → Mixtures
  'ud-l16': 'ud-l3', // Gold purity in varṇa (optional) → Mixtures
  'ud-l7': 'ud-l4', // Reading stacked bar charts → Clustered and stacked columns
  'ud-l8': 'ud-l4', // Constructing stacked bar charts
  'ud-l9': 'ud-l5', // Understanding 100% stacked charts → 100% stacked bars and pie charts
  'ud-l10': 'ud-l5', // Comparing absolute counts and percentages
  'ud-l11': 'ud-l5', // Choosing the right representation
  'ud-l14': 'ud-l5', // Pie charts (optional)
  'ud-l12': 'ud-l6', // Investigating misleading conclusions → What an average hides
  'ud-l15': 'ud-l6', // What an average hides (optional)
  'ud-l13': null, // Chapter practice and revision → practice bank + assessment
};

/** The older lab task, with "must visit these views" as view goals the workbench reports. */
export function labTaskFor(l: UDLessonDefinition): LabTask {
  const t = guidedLabTask(l, UD_WORKBENCH);
  const views = l.mustVisitViews ?? [];
  return { ...t, goals: [...t.goals, ...views.map((v) => ({ id: `view-${v}`, label: `Open the ${v === 'percent' ? '100% stacked' : v} chart view`, view: v }))] };
}

export function enrichLesson(lesson: EduLesson): EduLesson {
  const olders = Object.entries(UD_LESSON_MAP).filter(([, to]) => to === lesson.id).map(([from]) => UD_GUIDED_LESSONS[from]).filter(Boolean);
  const base = enrichFromGuided(lesson, olders, UD_WORKBENCH);
  // Use the view-aware task, and give numeric predictions to older lessons that had no option-based prediction.
  // View-aware tasks, keeping a prediction that enrichFromGuided attached to a task with no free step.
  const tasks = new Map(olders.map((l) => [`lt-${l.id}`, { ...labTaskFor(l), prediction: base.labTasks?.find((t) => t.id === `lt-${l.id}`)?.prediction }]));
  const steps = base.steps.map((s) => ({ ...s }));
  for (const l of olders) {
    if (l.predictionQuestion || !l.numericPrediction) continue;
    const np = l.numericPrediction;
    const pred = { id: `pred-${l.id}`, prompt: np.prompt, options: [], numeric: { unit: np.unit, answer: toNumber(np.correct), closeWithin: toNumber(np.closeWithin) }, reveal: np.explanation };
    const free = steps.findIndex((s) => !s.prediction);
    if (free >= 0) steps[free] = { ...steps[free], prediction: pred };
    else tasks.set(`lt-${l.id}`, { ...tasks.get(`lt-${l.id}`)!, prediction: pred });
  }
  return { ...base, steps, labTasks: (base.labTasks ?? []).map((t) => tasks.get(t.id) ?? t) };
}

/** The chart is looked up by question id when drawn, so lesson content stays plain, serialisable data (the datasets hold exact rationals). */
function chartVisual(q: UDPracticeQuestion, answer: 'none' | 'segment' | 'bar') {
  return q.chart ? { kind: 'udQuestionChart', props: { questionId: q.id, answer }, alt: `Chart for: ${q.title}.` } : undefined;
}

export function convertQuestion(q: UDPracticeQuestion): Question {
  const defaultFeedback = { message: q.hints[0] ?? 'Look again at what each number counts.', misconception: `ud-${q.topicId}` };
  const a = q.answer;
  if (a.kind === 'choice') {
    const opts = q.options ?? [];
    return { kind: 'choice', id: q.id, prompt: q.statement, options: opts.map((text, i) => ({ id: `o${i}`, text })), correctId: `o${a.index}`, feedback: Object.fromEntries(opts.map((_, i) => [`o${i}`, defaultFeedback]).filter(([id]) => id !== `o${a.index}`)), explanation: q.explanation };
  }
  if (a.kind === 'number') {
    return { kind: 'numeric', id: q.id, prompt: q.statement, answer: toNumber(a.value), tolerance: a.decimals !== undefined ? 0.5 * 10 ** -a.decimals : 1e-9, unit: q.unit, defaultFeedback, explanation: q.explanation };
  }
  const correctId = a.kind === 'segment' ? `${a.groupId}|${a.categoryId}` : a.groupId;
  return { kind: 'visual', id: q.id, prompt: q.statement, visual: chartVisual(q, a.kind)!, correctId, feedback: {}, defaultFeedback, explanation: q.explanation };
}

export const practiceItem = (q: UDPracticeQuestion): IndependentItem => ({
  id: q.id, topic: q.title, prompt: q.title,
  visual: q.answer.kind === 'segment' || q.answer.kind === 'bar' ? undefined : chartVisual(q, 'none'),
  question: convertQuestion(q), hints: q.hints.length ? q.hints : ['Look again at what each number counts.'], solution: q.workedSolution, difficulty: q.difficulty, source: { kind: 'original' },
});

export const UD_PRACTICE_ITEM_IDS: Record<string, string> = Object.fromEntries(BANK.map((q) => [q.id, q.id]));

export function buildUdPracticeSet(): PracticeSet {
  const groupFor: Record<string, { id: string; title: string }> = {
    'ud-l1': { id: 'g-averages', title: 'Averages and weighted averages' }, 'ud-l2': { id: 'g-averages', title: 'Averages and weighted averages' },
    'ud-l3': { id: 'g-mixtures', title: 'Mixtures' }, 'ud-l4': { id: 'g-charts', title: 'Stacked and clustered charts' },
    'ud-l5': { id: 'g-percent', title: '100% stacked bars and pie charts' }, 'ud-l6': { id: 'g-hides', title: 'What an average hides' },
  };
  const groups: PracticeGroup[] = [];
  const placed = new Set<string>();
  const order = ['ud-l1', 'ud-l2', 'ud-l3', 'ud-l5', 'ud-l6', 'ud-l4', 'ud-l16', 'ud-l7', 'ud-l8', 'ud-l9', 'ud-l10', 'ud-l11', 'ud-l14', 'ud-l12', 'ud-l15', 'ud-l13'];
  for (const lid of order) {
    const to = UD_LESSON_MAP[lid] ?? 'ud-l6';
    const gdef = groupFor[to];
    let g = groups.find((x) => x.id === gdef.id);
    if (!g) { g = { id: gdef.id, title: gdef.title, blurb: `Questions on ${gdef.title.toLowerCase()}.`, items: [] }; groups.push(g); }
    for (const qid of UD_GUIDED_LESSONS[lid].practiceQuestionIds) {
      if (placed.has(qid)) continue;
      const q = BANK.find((x) => x.id === qid);
      if (!q) continue;
      placed.add(qid);
      g.items.push(practiceItem(q));
    }
  }
  const rest = BANK.filter((q) => !placed.has(q.id));
  if (rest.length) groups.push({ id: 'g-more', title: 'More practice', blurb: 'Further questions from the chapter.', items: rest.map(practiceItem) });
  return { id: 'understanding-data-practice', title: 'Understanding Data chapter practice', groups };
}

const num = (id: string, prompt: string, answer: number, unit: string | undefined, wrong: string, mis: string, explanation: string, tolerance = 0.005): Question =>
  ({ kind: 'numeric', id, prompt, answer, unit, tolerance, defaultFeedback: { message: wrong, misconception: mis }, explanation });
const pick = (id: string, prompt: string, options: [string, string][], correct: string, explanation: string, mis: string): Question => ({
  kind: 'choice', id, prompt, options: options.map(([oid, text]) => ({ id: oid, text })), correctId: correct,
  feedback: Object.fromEntries(options.filter(([oid]) => oid !== correct).map(([oid]) => [oid, { message: explanation, misconception: mis }])), explanation,
});

export const UD_ASSESSMENT: ChapterAssessment = {
  id: 'understanding-data-assessment-1',
  title: 'Understanding Data: chapter assessment',
  instructions: 'Eight original questions across the chapter. Give decimals to two places where needed. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'ua-1', topic: 'Average of averages', lessonId: 'ud-l1', competency: 'knowledge', marks: 1, prompt: 'Combining two classes.', question: pick('ua-1q', 'Class A (10 students) averaged 60 marks and class B (30 students) averaged 80. Is the combined average 70?', [['no', 'No: the larger class pulls the average towards 80'], ['yes', 'Yes: the average of 60 and 80 is 70']], 'no', 'The plain average of two averages ignores how many students each one describes.', 'average-of-averages'), solution: ['Total marks = 10 × 60 + 30 × 80 = 3000; 40 students.', 'Combined average = 3000 ÷ 40 = 75, not 70.'] },
        { id: 'ua-2', topic: 'Weighted average', lessonId: 'ud-l2', competency: 'knowledge', marks: 1, prompt: 'The combined average.', question: num('ua-2q', 'Find the combined average of the two classes in the previous question.', 75, 'marks', 'Multiply each average by its class size, add, then divide by the total number of students.', 'average-of-averages', '(10 × 60 + 30 × 80) ÷ 40 = 75.'), solution: ['(600 + 2400) ÷ 40 = 75 marks.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'ua-3', topic: 'Weighted average', lessonId: 'ud-l2', competency: 'application', marks: 2, prompt: 'Course grade.', question: num('ua-3q', 'A course grade is 40% project and 60% exam. A student scores 85 on the project and 70 on the exam. Find the course grade.', 76, undefined, 'Weight each score by its share: 0.4 × 85 + 0.6 × 70.', 'ignore-weights', '0.4 × 85 + 0.6 × 70 = 34 + 42 = 76.'), solution: ['0.4 × 85 = 34; 0.6 × 70 = 42.', 'Course grade = 76.'] },
        { id: 'ua-4', topic: 'Mixtures', lessonId: 'ud-l3', competency: 'application', marks: 2, prompt: 'Mixing solutions.', question: num('ua-4q', '200 mL of a 10% sugar solution is mixed with 300 mL of a 20% sugar solution. What is the sugar concentration of the mixture, in percent?', 16, '%', 'Find the total sugar (in mL) and divide by the total volume.', 'average-concentrations', 'Sugar = 20 + 60 = 80 mL in 500 mL: 16%.'), solution: ['Sugar: 10% of 200 = 20 mL; 20% of 300 = 60 mL.', '80 ÷ 500 = 0.16 = 16%.'] },
        { id: 'ua-5', topic: 'Stacked bars', lessonId: 'ud-l4', competency: 'application', marks: 2, prompt: 'Reading a stacked bar.', question: num('ua-5q', 'A stacked bar for a school shows 120 students who walk, 80 who cycle and 50 who come by bus. What is the full height of the bar?', 250, 'students', 'The height of a stacked bar is the sum of its segments.', 'segment-is-total', '120 + 80 + 50 = 250.'), solution: ['A stacked bar stacks the parts, so its height is the total: 250 students.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'ua-6', topic: '100% stacked bars', lessonId: 'ud-l5', competency: 'analysis', marks: 2, prompt: 'Share as a percentage.', question: num('ua-6q', 'In the previous school, what percentage of students walk? (On a 100% stacked bar, this is the height of the "walk" segment.)', 48, '%', 'A 100% stacked bar shows each part as a share of the total: part ÷ total × 100.', 'count-not-share', '120 ÷ 250 × 100 = 48%.'), solution: ['120 ÷ 250 = 0.48 = 48%.'] },
        { id: 'ua-7', topic: '100% stacked bars', lessonId: 'ud-l5', competency: 'analysis', marks: 2, prompt: 'Which chart?', question: pick('ua-7q', 'School P has 1000 students and school Q has 200. You want to compare the SHARE of students who cycle in each school. Which chart shows that directly?', [['p', 'A 100% stacked bar chart'], ['s', 'A stacked bar chart of counts'], ['c', 'A clustered column chart of counts']], 'p', 'Counts make the large school look bigger in every category; a 100% stacked bar puts both schools on the same 0–100% scale.', 'counts-for-shares'), solution: ['Shares compare fairly only on a common scale: the 100% stacked bar.'] },
        { id: 'ua-8', topic: 'What an average hides', lessonId: 'ud-l6', competency: 'analysis', marks: 2, prompt: 'A misleading conclusion.', question: pick('ua-8q', 'Town X has a higher average family income than town Y. Which conclusion is justified?', [['n', 'None of these follows from the averages alone'], ['m', 'Most families in X earn more than most families in Y'], ['e', 'Every family in X earns more than every family in Y']], 'n', 'An average can be raised by a few very large values; it says nothing certain about most or every family.', 'average-is-typical'), solution: ['A few very high incomes can raise an average while most families earn less.', 'So neither "most" nor "every" follows.'] },
      ],
    },
  ],
};
