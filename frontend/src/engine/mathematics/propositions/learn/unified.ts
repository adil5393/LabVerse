/**
 * Propositions migration to the unified framework. Pure data from the older guided path (`curriculumPath.ts`, `practiceBank.ts`),
 * which stays untouched behind the compatibility switch. Older lessons 1 to 11 teach the same ideas as current lessons 1 to 11
 * (checked title by title); older lesson 12 (revision) becomes the chapter practice bank and the assessment.
 */

import type { ChapterAssessment, EduLesson, IndependentItem, LabTask, PracticeGroup, PracticeSet, Question } from '../../../education/types';
import type { LessonMapping } from '../../../education/legacy';
import { enrichFromGuided, guidedLabTask } from '../../guidedLearning/unify';
import type { GuidedLessonDefinition } from '../../guidedLearning/types';
import { PROP_GUIDED_LESSONS } from '../curriculumPath';
import { PROPOSITIONS_PRACTICE_BANK as PRACTICE_BANK } from '../practiceBank';
import type { PracticeQuestion } from '../types';

export const PROP_LEGACY_KEY = 'labverse_propositions_progress_v1';
export const PROP_WORKBENCH = '/mathematics/propositions/workbench';

export const PROP_LESSON_MAP: LessonMapping = {
  'prop-l1': 'prop-l1', // Statements and propositions
  'prop-l2': 'prop-l2', // Hypothesis and conclusion → If P, then Q
  'prop-l3': 'prop-l3', // Forming a converse
  'prop-l4': 'prop-l4', // Truth of a proposition and its converse → Four possibilities
  'prop-l5': 'prop-l5', // Counterexamples
  'prop-l6': 'prop-l6', // Number property laboratory → Numbers: factors and squares
  'prop-l7': 'prop-l7', // Geometric propositions and converses
  'prop-l8': 'prop-l8', // Baudhāyana–Pythagoras theorem and converse
  'prop-l9': 'prop-l9', // What makes a proof? → Why testing is not proof
  'prop-l10': 'prop-l10', // Constructing arguments → Building an argument
  'prop-l11': 'prop-l11', // Integrated reasoning → Putting it together
  'prop-l12': null, // Chapter practice and revision → practice bank + assessment
};

export const labTaskFor = (l: GuidedLessonDefinition): LabTask => guidedLabTask(l, PROP_WORKBENCH);

export function enrichLesson(lesson: EduLesson): EduLesson {
  const olders = Object.entries(PROP_LESSON_MAP).filter(([, to]) => to === lesson.id).map(([from]) => PROP_GUIDED_LESSONS[from]).filter(Boolean);
  return enrichFromGuided(lesson, olders, PROP_WORKBENCH);
}

export function convertQuestion(q: PracticeQuestion): Question {
  const defaultFeedback = { message: q.hints[0] ?? 'Re-read the hypothesis and the conclusion.', misconception: `prop-${q.topicId}` };
  if (q.options?.length) {
    const correct = typeof q.correctAnswer === 'number' ? q.correctAnswer : q.options.indexOf(String(q.correctAnswer));
    if (correct < 0 || correct >= q.options.length) throw new Error(`Propositions question ${q.id}: no correct option`);
    return {
      kind: 'choice', id: q.id, prompt: q.statement, options: q.options.map((text, i) => ({ id: `o${i}`, text })), correctId: `o${correct}`,
      feedback: Object.fromEntries(q.options.map((_, i) => [`o${i}`, defaultFeedback]).filter(([id]) => id !== `o${correct}`)), explanation: q.explanation,
    };
  }
  const answer = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(q.correctAnswer);
  if (!Number.isFinite(answer)) throw new Error(`Propositions question ${q.id}: no numeric answer`);
  return { kind: 'numeric', id: q.id, prompt: q.statement, answer, tolerance: q.acceptableTolerance ?? 0, defaultFeedback, explanation: q.explanation };
}

export const practiceItem = (q: PracticeQuestion): IndependentItem => ({
  id: q.id, topic: q.title, prompt: q.title, question: convertQuestion(q),
  hints: q.hints.length ? q.hints : ['Re-read the hypothesis and the conclusion.'], solution: q.workedSolution, difficulty: q.difficulty,
  source: q.ncertReference ? { kind: 'textbook-aligned', ref: q.ncertReference } : { kind: 'original' },
});

export const PROP_PRACTICE_ITEM_IDS: Record<string, string> = Object.fromEntries(PRACTICE_BANK.map((q) => [q.id, q.id]));

export function buildPropPracticeSet(): PracticeSet {
  const groups: PracticeGroup[] = [
    { id: 'g-statements', title: 'Propositions and converses', blurb: 'What a proposition is, if-then statements, and converses.', items: [] },
    { id: 'g-counterexamples', title: 'Counterexamples and numbers', blurb: 'Finding counterexamples and testing number properties.', items: [] },
    { id: 'g-geometry', title: 'Geometry and converses', blurb: 'Geometric propositions and the Baudhāyana–Pythagoras theorem.', items: [] },
    { id: 'g-proof', title: 'Proof and reasoning', blurb: 'Why testing is not proof, building arguments, and mixed reasoning.', items: [] },
  ];
  const groupOf: Record<string, string> = {
    'prop-l1': 'g-statements', 'prop-l2': 'g-statements', 'prop-l3': 'g-statements', 'prop-l4': 'g-statements',
    'prop-l5': 'g-counterexamples', 'prop-l6': 'g-counterexamples', 'prop-l7': 'g-geometry', 'prop-l8': 'g-geometry',
    'prop-l9': 'g-proof', 'prop-l10': 'g-proof', 'prop-l11': 'g-proof', 'prop-l12': 'g-proof',
  };
  const placed = new Set<string>();
  for (const [lid, l] of Object.entries(PROP_GUIDED_LESSONS)) for (const qid of l.practiceQuestionIds) {
    if (placed.has(qid)) continue;
    const q = PRACTICE_BANK.find((x) => x.id === qid);
    if (!q) continue;
    placed.add(qid);
    groups.find((g) => g.id === groupOf[lid])!.items.push(practiceItem(q));
  }
  for (const q of PRACTICE_BANK) if (!placed.has(q.id)) groups[3].items.push(practiceItem(q));
  return { id: 'propositions-practice', title: 'Propositions chapter practice', groups: groups.filter((g) => g.items.length) };
}

const choice = (id: string, prompt: string, options: [string, string][], correct: string, explanation: string, misconception: string): Question => ({
  kind: 'choice', id, prompt, options: options.map(([oid, text]) => ({ id: oid, text })), correctId: correct,
  feedback: Object.fromEntries(options.filter(([oid]) => oid !== correct).map(([oid]) => [oid, { message: explanation, misconception }])), explanation,
});

export const PROP_ASSESSMENT: ChapterAssessment = {
  id: 'propositions-assessment-1',
  title: 'Propositions and their Converses: chapter assessment',
  instructions: 'Nine original questions across the chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'pa-1', topic: 'Propositions', lessonId: 'prop-l1', competency: 'knowledge', marks: 1, prompt: 'Which is a proposition?', question: choice('pa-1q', 'Which sentence is a proposition?', [['a', '15 is a multiple of 4.'], ['b', 'Is 15 a multiple of 4?'], ['c', 'Write down a multiple of 4.'], ['d', 'Multiples of 4 are fun.']], 'a', 'A proposition is a statement that is either true or false. "15 is a multiple of 4" is false, but it is a proposition; a question, an instruction and an opinion are not.', 'not-a-claim'), solution: ['Only (a) makes a claim that is true or false (it is false).'] },
        { id: 'pa-2', topic: 'Hypothesis and conclusion', lessonId: 'prop-l2', competency: 'knowledge', marks: 1, prompt: 'Splitting an if-then statement.', question: choice('pa-2q', 'In "If a number ends in 0, then it is divisible by 5", what is the hypothesis?', [['h', 'A number ends in 0'], ['c', 'It is divisible by 5'], ['b', 'Both parts together']], 'h', 'The hypothesis is the part after "if": what is assumed. The conclusion is the part after "then".', 'swap-hyp-con'), solution: ['Hypothesis (P): the number ends in 0. Conclusion (Q): it is divisible by 5.'] },
        { id: 'pa-3', topic: 'The converse', lessonId: 'prop-l3', competency: 'knowledge', marks: 1, prompt: 'Forming the converse.', question: choice('pa-3q', 'What is the converse of "If a quadrilateral is a square, then its diagonals are equal"?', [['a', 'If the diagonals of a quadrilateral are equal, then it is a square.'], ['b', 'If a quadrilateral is not a square, then its diagonals are not equal.'], ['c', 'A square has equal diagonals.']], 'a', 'The converse swaps the hypothesis and the conclusion: "if Q then P".', 'converse-is-negation'), solution: ['P: it is a square. Q: its diagonals are equal. Converse: if Q then P.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'pa-4', topic: 'Truth of the converse', lessonId: 'prop-l4', competency: 'application', marks: 2, prompt: 'True statement, false converse.', question: choice('pa-4q', 'The statement in the previous question is true. Is its converse true?', [['f', 'No: a rectangle that is not a square also has equal diagonals'], ['t', 'Yes: the converse of a true statement is always true']], 'f', 'A converse can be false even when the statement is true. A non-square rectangle has equal diagonals, so the converse fails.', 'converse-always-true'), solution: ['A rectangle with sides 3 and 4 has equal diagonals (both 5) but is not a square, so the converse is false.'] },
        { id: 'pa-5', topic: 'Counterexamples', lessonId: 'prop-l5', competency: 'application', marks: 2, prompt: 'The smallest counterexample.', question: { kind: 'numeric', id: 'pa-5q', prompt: 'Find the smallest positive whole number that is a counterexample to "If n is odd, then n is prime".', answer: 1, tolerance: 0, defaultFeedback: { message: 'A counterexample must make the hypothesis true (n odd) and the conclusion false (n not prime). Start from the smallest odd number.', misconception: 'counterexample-wrong-part' }, explanation: '1 is odd and 1 is not prime (a prime has exactly two factors).' }, solution: ['Odd numbers in order: 1, 3, 5, 7, 9, …', '1 is odd and not prime (it has only one factor), so 1 is the smallest counterexample.'] },
        { id: 'pa-6', topic: 'Numbers', lessonId: 'prop-l6', competency: 'application', marks: 2, prompt: 'Testing a number property.', question: choice('pa-6q', 'Which value of n shows that "n² + n + 1 is always prime" is false?', [['4', 'n = 4'], ['1', 'n = 1'], ['2', 'n = 2'], ['3', 'n = 3']], '4', 'n = 4 gives 16 + 4 + 1 = 21 = 3 × 7, which is not prime. n = 1, 2, 3 give 3, 7, 13, all prime.', 'checked-too-few'), solution: ['n = 1: 3; n = 2: 7; n = 3: 13 (all prime).', 'n = 4: 21 = 3 × 7, not prime: a counterexample.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'pa-7', topic: 'Pythagoras converse', lessonId: 'prop-l8', competency: 'analysis', marks: 2, prompt: 'Is the triangle right-angled?', question: choice('pa-7q', 'A triangle has sides 8 cm, 15 cm and 17 cm. What can you conclude?', [['r', 'It is right-angled, because 8² + 15² = 17²'], ['n', 'It is not right-angled, because 8 + 15 ≠ 17'], ['u', 'Nothing can be concluded without measuring an angle']], 'r', 'By the converse of the Baudhāyana–Pythagoras theorem, if the square of the longest side equals the sum of the squares of the other two, the triangle is right-angled: 64 + 225 = 289 = 17².', 'needs-measurement'), solution: ['8² + 15² = 64 + 225 = 289 = 17².', 'By the converse, the angle opposite the 17 cm side is 90°.'] },
        { id: 'pa-8', topic: 'Testing is not proof', lessonId: 'prop-l9', competency: 'analysis', marks: 2, prompt: 'Many examples.', question: choice('pa-8q', 'A student checks a statement about whole numbers for every n from 1 to 1000 and it is true each time. What has the student shown?', [['e', 'Evidence that it may be true, but not a proof for all whole numbers'], ['p', 'A proof that it is true for every whole number'], ['f', 'That it is false']], 'e', 'Checking cases can find a counterexample, but no number of true cases proves a statement about infinitely many numbers.', 'many-cases-proof'), solution: ['n² + n + 41 is prime for n = 0 to 39 but not for n = 40: many true cases are not a proof.'] },
        { id: 'pa-9', topic: 'Building an argument', lessonId: 'prop-l10', competency: 'analysis', marks: 2, prompt: 'Order the argument.', question: { kind: 'order', id: 'pa-9q', prompt: 'Arrange these steps to prove: "The sum of two even numbers is even."', items: [
          { id: 's1', text: 'Let the two even numbers be 2a and 2b, where a and b are whole numbers.', needs: [] },
          { id: 's2', text: 'Their sum is 2a + 2b = 2(a + b).', needs: ['s1'] },
          { id: 's3', text: 'a + b is a whole number, so 2(a + b) is a multiple of 2.', needs: ['s2'] },
          { id: 's4', text: 'So the sum is even.', needs: ['s3'] },
        ].reverse(), explanation: 'Name the numbers, add them, factor out 2, conclude.' }, solution: ['Let them be 2a and 2b.', 'Sum = 2(a + b).', 'a + b is whole, so the sum is a multiple of 2.', 'So it is even.'] },
      ],
    },
  ],
};
