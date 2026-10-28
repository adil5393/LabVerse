/**
 * Quadrilaterals migration to the unified framework (second chapter after the Circles pilot). Pure data built from the older
 * guided-workbench path (`curriculumPath.ts`, `practiceBank.ts`), which stays untouched behind the compatibility switch.
 *
 * The older path had 13 lessons; the Learn path has 8. They share ids that mean DIFFERENT lessons (older `quad-l4` is
 * "Converse Properties & Sufficient Conditions", current `quad-l4` is "The Midpoint Theorem"), so lessons are matched only by
 * the explicit table below, by topic.
 */

import type { EduLesson, IndependentItem, LabTask, PracticeGroup, PracticeSet, Question } from '../../../education/types';
import type { LessonMapping } from '../../../education/legacy';
import { enrichFromGuided, guidedLabTask } from '../../guidedLearning/unify';
import type { GuidedLessonDefinition } from '../../guidedLearning/types';
import { QUAD_GUIDED_LESSONS } from '../curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../practiceBank';
import type { PracticeQuestion } from '../types';

export const QUAD_LEGACY_KEY = 'labverse_quadrilaterals_progress_v1';
export const QUAD_WORKBENCH = '/mathematics/quadrilaterals/workbench';

/** Older lesson id → current lesson id, by topic. Several older lessons can map to one current lesson. */
export const QUAD_LESSON_MAP: LessonMapping = {
  'quad-l1': 'quad-l1', // What is a quadrilateral?
  'quad-l2': 'quad-l2', // Properties of parallelograms
  'quad-l3': 'quad-l2', // Diagonals of a parallelogram (current lesson 2 proves the diagonals bisect each other)
  'quad-l4': 'quad-l3', // Converse properties / sufficient conditions → "When is a quadrilateral a parallelogram?"
  'quad-l5': 'quad-l4', // Triangle midpoints and the medial triangle → "The Midpoint Theorem"
  'quad-l6': 'quad-l4', // The Midpoint Theorem
  'quad-l7': 'quad-l5', // Converse of the Midpoint Theorem
  'quad-l8': 'quad-l6', // Medians of a triangle → "Medians and the centroid"
  'quad-l9': 'quad-l6', // The centroid theorem
  'quad-l10': 'quad-l7', // Varignon parallelogram → "The midpoints of a quadrilateral"
  'quad-l11': 'quad-l8', // Tiling
  'quad-l12': null, // Theorem investigation and proof → chapter practice (proof completion)
  'quad-l13': null, // Chapter practice and revision → chapter practice bank
};

/** Current lesson → the older lessons whose interactions it now carries (inverse of the map, in older order). */
export const olderLessonsFor = (lessonId: string): GuidedLessonDefinition[] =>
  Object.entries(QUAD_LESSON_MAP).filter(([, to]) => to === lessonId).map(([from]) => QUAD_GUIDED_LESSONS[from]).filter(Boolean);

export const labTaskFor = (l: GuidedLessonDefinition): LabTask => guidedLabTask(l, QUAD_WORKBENCH);

export function enrichLesson(lesson: EduLesson): EduLesson {
  return enrichFromGuided(lesson, olderLessonsFor(lesson.id), QUAD_WORKBENCH);
}

const unitOf = (u?: string): 'degrees' | 'cm' | 'cm²' | undefined => (u === 'degrees' || u === 'cm' || u === 'cm²' ? u : undefined);

/** A proof with one missing reason, as a choice question (the student supplies the reason). */
function proofCompletion(id: string, intro: string, steps: { statement: string; reason: string; missingReasonOptions?: string[]; correctReasonIndex?: number }[], explanation: string): Question | null {
  const k = steps.findIndex((p) => p.missingReasonOptions?.length && p.correctReasonIndex !== undefined);
  if (k < 0) return null;
  const gap = steps[k];
  const lines = steps.map((p, i) => `${i + 1}. ${p.statement} (${i === k ? '____' : p.reason})`).join(' ');
  return {
    kind: 'choice', id, prompt: `${intro} ${lines} Which reason belongs in the blank of step ${k + 1}?`,
    options: gap.missingReasonOptions!.map((text, i) => ({ id: `o${i}`, text })),
    correctId: `o${gap.correctReasonIndex}`,
    feedback: Object.fromEntries(gap.missingReasonOptions!.map((_, i) => [`o${i}`, { message: `Look at what step ${k + 1} claims and which facts are already established in the steps before it.`, misconception: 'proof-reason' }]).filter(([oid]) => oid !== `o${gap.correctReasonIndex}`)),
    explanation,
  };
}

export function convertQuestion(q: PracticeQuestion): Question {
  const tol = q.acceptableTolerance ?? 0.05;
  const defaultFeedback = { message: q.hints[0] ?? 'Re-read what is given and which property applies.', misconception: `quad-${q.topicId}` };
  const explanation = q.workedSolution[q.workedSolution.length - 1] ?? '';
  if (q.questionType === 'proof_step' && q.proofSteps) {
    const pq = proofCompletion(q.id, q.statement, q.proofSteps, explanation);
    if (pq) return pq;
  }
  if (q.options?.length) {
    const correctIndex = typeof q.correctAnswer === 'number' && !q.options.includes(String(q.correctAnswer)) ? q.correctAnswer : q.options.indexOf(String(q.correctAnswer));
    if (correctIndex < 0) throw new Error(`Quadrilaterals question ${q.id}: correct answer is not an option`);
    return {
      kind: 'choice', id: q.id, prompt: q.statement, options: q.options.map((text, i) => ({ id: `o${i}`, text })), correctId: `o${correctIndex}`,
      feedback: Object.fromEntries(q.options.map((_, i) => [`o${i}`, defaultFeedback]).filter(([id]) => id !== `o${correctIndex}`)), explanation,
    };
  }
  const answer = typeof q.correctAnswer === 'number' ? q.correctAnswer : Number(/[-+]?\d*\.?\d+/.exec(String(q.correctAnswer))?.[0]);
  if (!Number.isFinite(answer)) throw new Error(`Quadrilaterals question ${q.id} has no numeric answer`);
  return { kind: 'numeric', id: q.id, prompt: q.statement, answer, tolerance: tol, unit: unitOf(q.unit), defaultFeedback, explanation };
}

export function practiceItem(q: PracticeQuestion): IndependentItem {
  return {
    id: q.id,
    topic: q.title,
    prompt: q.title,
    visual: q.diagramGivens ? { kind: 'quadPracticeScene', props: { givens: q.diagramGivens }, alt: `Diagram for: ${q.title}. Every value you need is given in the question.` } : undefined,
    question: convertQuestion(q),
    hints: q.hints.length ? q.hints : ['Re-read what is given and which property applies.'],
    solution: q.workedSolution,
    difficulty: q.difficulty,
    source: q.ncertReference ? { kind: 'textbook-aligned', ref: q.ncertReference } : { kind: 'original' },
  };
}

/** The older lessons' "choose the missing reason" proofs, kept as proof-completion practice. */
export function olderProofItems(): IndependentItem[] {
  return Object.values(QUAD_GUIDED_LESSONS).flatMap((l) => {
    const q = l.whyGuide.proofSteps ? proofCompletion(`proof-${l.id}`, `Complete the proof: ${l.title}.`, l.whyGuide.proofSteps, l.whyGuide.deductiveTakeaway) : null;
    return q ? [{ id: `proof-${l.id}`, topic: l.title, prompt: `Supply the missing reason (${l.title})`, question: q, hints: ['Check which facts the earlier steps already established.'], solution: l.whyGuide.proofSteps!.map((p, i) => `${i + 1}. ${p.statement}: ${p.reason}`), difficulty: 'challenge' as const, source: { kind: 'original' as const } }] : [];
  });
}

/** Older question id → chapter practice item id (all older questions keep their ids). */
export const QUAD_PRACTICE_ITEM_IDS: Record<string, string> = Object.fromEntries(CHAPTER_PRACTICE_BANK.map((q) => [q.id, q.id]));

export function buildQuadPracticeSet(): PracticeSet {
  const order = ['quad-l1', 'quad-l2', 'quad-l3', 'quad-l4', 'quad-l5', 'quad-l6', 'quad-l7', 'quad-l8', 'quad-l9', 'quad-l10', 'quad-l11', 'quad-l12', 'quad-l13'];
  const groupFor: Record<string, { id: string; title: string }> = {
    'quad-l1': { id: 'g-basics', title: 'Quadrilaterals and their angles' },
    'quad-l2': { id: 'g-parallelograms', title: 'Parallelograms' }, 'quad-l3': { id: 'g-parallelograms', title: 'Parallelograms' }, 'quad-l4': { id: 'g-parallelograms', title: 'Parallelograms' },
    'quad-l5': { id: 'g-midpoints', title: 'Midpoints, medians and the centroid' }, 'quad-l6': { id: 'g-midpoints', title: 'Midpoints, medians and the centroid' }, 'quad-l7': { id: 'g-midpoints', title: 'Midpoints, medians and the centroid' },
    'quad-l8': { id: 'g-midpoints', title: 'Midpoints, medians and the centroid' }, 'quad-l9': { id: 'g-midpoints', title: 'Midpoints, medians and the centroid' },
    'quad-l10': { id: 'g-varignon', title: 'Varignon and tiling' }, 'quad-l11': { id: 'g-varignon', title: 'Varignon and tiling' },
    'quad-l12': { id: 'g-mixed', title: 'Mixed revision and proofs' }, 'quad-l13': { id: 'g-mixed', title: 'Mixed revision and proofs' },
  };
  const placed = new Set<string>();
  const groups: PracticeGroup[] = [];
  const add = (gid: { id: string; title: string }, item: IndependentItem) => {
    let g = groups.find((x) => x.id === gid.id);
    if (!g) { g = { id: gid.id, title: gid.title, blurb: `Questions on ${gid.title.toLowerCase()}.`, items: [] }; groups.push(g); }
    g.items.push(item);
  };
  for (const id of order) for (const qid of QUAD_GUIDED_LESSONS[id].practiceQuestionIds) {
    if (placed.has(qid)) continue;
    const q = CHAPTER_PRACTICE_BANK.find((x) => x.id === qid);
    if (!q) continue;
    placed.add(qid);
    add(groupFor[id], practiceItem(q));
  }
  for (const q of CHAPTER_PRACTICE_BANK) if (!placed.has(q.id)) { placed.add(q.id); add(groupFor['quad-l13'], practiceItem(q)); }
  for (const it of olderProofItems()) add(groupFor['quad-l12'], it);
  return { id: 'quadrilaterals-practice', title: 'Quadrilaterals chapter practice', groups };
}
