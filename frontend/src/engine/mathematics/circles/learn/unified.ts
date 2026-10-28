/**
 * Circles migration to the unified framework (pilot chapter). Pure data built from the older guided-workbench path
 * (`curriculumPath.ts`, `practiceBank.ts`, `circleExperiments.ts`), which stay untouched so the compatibility switch can still
 * show the older path. Nothing is copied by hand: every older interaction is carried over from its source object, and
 * `__tests__/unifiedMigration.test.ts` fails if any older prediction, investigation, observation, proof or practice question is
 * left without a home.
 *
 * Where each older stage goes:
 * - Understand (concept)        → already taught by the Learn lessons (same lesson ids, same titles).
 * - Predict                     → a `prediction` on the lesson's first step (ungraded commitment before the explanation).
 * - Experiment + Observe        → a `LabTask` in the Circles workbench: same experiment, same allowed tools, same highlighted
 *                                 objects; goals met by real canvas changes and recorded measurements, not a button.
 * - Understand why (proof)      → the Learn lesson's own numbered proof where it has one; otherwise the older proof lines are
 *                                 attached to the lesson's reasoning step.
 * - Practise                    → the chapter practice bank (exact-diagram questions, difficulty, marks, hints, solutions).
 * - Lesson 12 (revision)        → the chapter practice bank and the chapter assessment.
 * - Tangents (extension)        → an optional "Beyond Class 9" lesson that never counts toward chapter mastery.
 */

import type { ChapterAssessment, EduLesson, IndependentItem, LabTask, PracticeGroup, PracticeSet, Question } from '../../../education/types';
import type { LessonMapping } from '../../../education/legacy';
import { CIRCLES_GUIDED_LESSONS } from '../curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../practiceBank';
import { CIRCLE_EXPERIMENTS } from '../circleExperiments';
import type { PracticeQuestion } from '../types';
import type { GuidedLessonDefinition } from '../../guidedLearning/types';
import { enrichFromGuided, guidedLabTask, guidedPrediction, guidedProof } from '../../guidedLearning/unify';

export const CIRCLES_LEGACY_KEY = 'labverse_circles_progress_v1';
export const CIRCLES_WORKBENCH = '/mathematics/circles/workbench';

/** Older lesson id → current lesson id. Explicit: never inferred from ids that look alike. */
export const CIRCLES_LESSON_MAP: LessonMapping = {
  'circles-l1': 'circles-l1', 'circles-l2': 'circles-l2', 'circles-l3': 'circles-l3', 'circles-l4': 'circles-l4',
  'circles-l5': 'circles-l5', 'circles-l6': 'circles-l6', 'circles-l7': 'circles-l7', 'circles-l8': 'circles-l8',
  'circles-l9': 'circles-l9', 'circles-l10': 'circles-l10', 'circles-l11': 'circles-l11',
  // The revision lesson has no current lesson: its questions moved to the chapter practice bank and assessment.
  'circles-l12': null,
  'circles-ext-tangents': 'circles-ext-tangents',
};

/** Experiment questions that duplicate a practice-bank question: evidence goes to the bank question. */
const DUPLICATE_OF: Record<string, string> = {
  q_chord_distance_calc: 'q_distance_chords_comparison',
  q4_cyclic_find_angle: 'q_cyclic_opposite_angles',
  q3_inscribed_calc: 'q_inscribed_angle_calculation',
};

/**
 * Multi-part answers, labelled. The older checker compared only the FIRST number in a typed answer (so "9" passed for
 * "9 cm, 28.26 cm"); every part is now checked.
 */
const MULTI_PARTS: Record<string, { id: string; label: string; answer: number; unit?: string }[]> = {
  q_def_radius_diameter: [{ id: 'd', label: 'Diameter', answer: 9, unit: 'cm' }, { id: 'c', label: 'Circumference', answer: 28.26, unit: 'cm' }],
  q_distance_chords_comparison: [{ id: 'ab', label: 'Distance of AB from O', answer: 6, unit: 'cm' }, { id: 'cd', label: 'Distance of CD from O', answer: 8, unit: 'cm' }],
  q_same_segment_algebra: [{ id: 'x', label: 'x', answer: 15 }, { id: 'angle', label: 'Each angle', answer: 55, unit: 'degrees' }],
  q_cyclic_opposite_angles: [{ id: 'd', label: '∠D', answer: 75, unit: 'degrees' }, { id: 'c', label: '∠C', answer: 100, unit: 'degrees' }],
  q_rev_cyclic_combo: [{ id: 'bcd', label: '∠BCD', answer: 105, unit: 'degrees' }, { id: 'cda', label: '∠CDA', answer: 95, unit: 'degrees' }],
};

/** Yes/no questions whose older answer was a sentence. */
const YES_NO: Record<string, { yes: string; no: string; correct: 'yes' | 'no'; wrongFeedback: string }> = {
  q_concyclicity_test: {
    yes: 'Yes, ABCD is cyclic', no: 'No, ABCD is not cyclic', correct: 'yes',
    wrongFeedback: 'Check the opposite pairs: ∠A + ∠C = 88° + 92° = 180° and ∠B + ∠D = 76° + 104° = 180°. Opposite angles that add up to 180° make the quadrilateral cyclic.',
  },
};

function allOlderQuestions(): PracticeQuestion[] {
  const seen = new Set<string>();
  const out: PracticeQuestion[] = [];
  for (const q of [...CHAPTER_PRACTICE_BANK, ...CIRCLE_EXPERIMENTS.flatMap((e) => e.practiceQuestions)]) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

export const olderQuestion = (id: string): PracticeQuestion | undefined => allOlderQuestions().find((q) => q.id === id);

const firstNumber = (v: number | string): number | null => {
  if (typeof v === 'number') return v;
  const m = /[-+]?\d*\.?\d+/.exec(v);
  return m ? Number(m[0]) : null;
};

/** Convert one older practice question into a shared question (same wording, same diagram, every part checked). */
export function convertQuestion(q: PracticeQuestion): Question {
  const tol = q.tolerance ?? 0.05;
  const defaultFeedback = { message: q.hintSteps?.[0] ?? q.hint ?? `Use: ${q.theoremApplied}.`, misconception: `circles-${q.topicId ?? 'practice'}` };
  const explanation = `${q.theoremApplied}. ${q.stepByStepSolution[q.stepByStepSolution.length - 1] ?? ''}`.trim();
  if (q.options?.length) {
    const correctIndex = q.correctOptionIndex ?? (typeof q.correctAnswer === 'number' ? q.correctAnswer : q.options.indexOf(String(q.correctAnswer)));
    return {
      kind: 'choice', id: q.id, prompt: q.question,
      options: q.options.map((text, i) => ({ id: `o${i}`, text })),
      correctId: `o${correctIndex}`,
      feedback: Object.fromEntries(q.options.map((_, i) => [`o${i}`, defaultFeedback]).filter(([id]) => id !== `o${correctIndex}`)),
      explanation,
    };
  }
  const yn = YES_NO[q.id];
  if (yn) {
    return {
      kind: 'choice', id: q.id, prompt: q.question, options: [{ id: 'yes', text: yn.yes }, { id: 'no', text: yn.no }], correctId: yn.correct,
      feedback: { [yn.correct === 'yes' ? 'no' : 'yes']: { message: yn.wrongFeedback, misconception: 'circles-concyclic-test' } }, explanation,
    };
  }
  const parts = MULTI_PARTS[q.id];
  if (parts) return { kind: 'multi', id: q.id, prompt: q.question, parts: parts.map((p) => ({ ...p, tolerance: tol })), defaultFeedback, explanation };
  const answer = firstNumber(q.correctAnswer);
  if (answer === null) throw new Error(`Circles question ${q.id} has no numeric answer and no conversion rule`);
  const unit = q.unit === 'degrees' || /°/.test(String(q.correctAnswer)) ? 'degrees' : q.unit ?? (/cm/.test(String(q.correctAnswer)) ? 'cm' : undefined);
  return { kind: 'numeric', id: q.id, prompt: q.question, answer, tolerance: tol, unit, defaultFeedback, explanation };
}

export function practiceItem(q: PracticeQuestion, topic: string): IndependentItem {
  return {
    id: q.id,
    topic: q.topicTitle?.replace(/^\d+\.\s*/, '') ?? topic,
    prompt: q.title,
    visual: q.diagram ? { kind: 'circlePracticeScene', props: { scene: q.diagram }, alt: q.diagramDescription ?? `Diagram for: ${q.title}. The question gives every measurement you need.` } : undefined,
    question: convertQuestion(q),
    hints: q.hintSteps?.length ? q.hintSteps : q.hint ? [q.hint] : [],
    solution: q.stepByStepSolution,
    difficulty: q.difficulty,
    marks: q.marks,
    source: q.isNCERTSourced ? { kind: 'textbook-aligned', ref: 'Ganita Manjari Part I, Chapter 5' } : { kind: 'original' },
  };
}

/** Older question id → chapter practice item id (duplicates map to their bank question). */
export const CIRCLES_PRACTICE_ITEM_IDS: Record<string, string> = Object.fromEntries(
  allOlderQuestions().map((q) => [q.id, DUPLICATE_OF[q.id] ?? q.id]),
);

const ORDER = ['circles-l1', 'circles-l2', 'circles-l3', 'circles-l4', 'circles-l5', 'circles-l6', 'circles-l7', 'circles-l8', 'circles-l9', 'circles-l10', 'circles-l11', 'circles-l12'];

/** Chapter practice bank: every question the older lessons used, grouped by unit, each once. */
export function buildCirclesPracticeSet(): PracticeSet {
  const placed = new Set<string>();
  const groups: PracticeGroup[] = [];
  const unitOf: Record<string, { id: string; title: string }> = {
    'unit-1-foundations': { id: 'g-foundations', title: 'Foundations and symmetry' },
    'unit-2-chords': { id: 'g-chords', title: 'Chords and distances' },
    'unit-3-angles': { id: 'g-angles', title: 'Angles and cyclic quadrilaterals' },
    'unit-4-mastery': { id: 'g-mixed', title: 'Mixed revision' },
  };
  for (const id of ORDER) {
    const l = CIRCLES_GUIDED_LESSONS[id];
    const u = unitOf[l.unitId] ?? unitOf['unit-4-mastery'];
    let g = groups.find((x) => x.id === u.id);
    if (!g) { g = { id: u.id, title: u.title, blurb: `Questions from ${u.title.toLowerCase()}, each with its own exact diagram where one is needed.`, items: [] }; groups.push(g); }
    for (const qid of l.practiceQuestionIds) {
      const target = CIRCLES_PRACTICE_ITEM_IDS[qid] ?? qid;
      if (placed.has(target)) continue;
      const q = olderQuestion(target);
      if (!q) continue;
      placed.add(target);
      g.items.push(practiceItem(q, l.title));
    }
  }
  // Bank questions no older lesson referenced still belong in the bank.
  const rest = CHAPTER_PRACTICE_BANK.filter((q) => !placed.has(q.id));
  if (rest.length) groups.push({ id: 'g-more', title: 'More practice', blurb: 'Further questions from the chapter.', items: rest.map((q) => practiceItem(q, 'Circles')) });
  return { id: 'circles-practice', title: 'Circles chapter practice', groups };
}

/** The older Experiment and Observe stages of one lesson, as a laboratory task in the Circles workbench. */
export const labTaskFor = (l: GuidedLessonDefinition): LabTask => guidedLabTask(l, CIRCLES_WORKBENCH);
const proofFrom = guidedProof;

/** Bring one lesson's older interactions into the current lesson (Circles maps one older lesson to one current lesson). */
export function enrichLesson(lesson: EduLesson): EduLesson {
  const legacy = CIRCLES_GUIDED_LESSONS[lesson.id];
  return legacy ? enrichFromGuided(lesson, [legacy], CIRCLES_WORKBENCH) : lesson;
}

// ---------------------------------------------------------------------------
// Beyond Class 9: tangents (optional extension, never counted toward mastery)
// ---------------------------------------------------------------------------

export function buildTangentExtension(): EduLesson {
  const l = CIRCLES_GUIDED_LESSONS['circles-ext-tangents'];
  const task = labTaskFor(l);
  const q5 = olderQuestion('q5_tangent_length')!;
  const tangentQ = (id: string, prompt: string, answer: number): Question => ({
    kind: 'numeric', id, prompt, answer, tolerance: 0.05, unit: 'cm',
    defaultFeedback: { message: 'The radius meets the tangent at a right angle, so the triangle formed by the centre, the point of contact and the outside point is right-angled. Use Pythagoras on that triangle.', misconception: 'tangent-not-perpendicular' },
    explanation: 'Radius ⊥ tangent, so (distance from the centre)² = r² + (tangent length)².',
  });
  return {
    id: 'circles-ext-tangents', unitId: 'unit-ext', number: 12, title: 'Tangents and the radius (Beyond Class 9)', extension: true,
    objective: 'see why the tangent at a point is perpendicular to the radius there, and use it to find a tangent length. This is optional: it is Class 10 work, not part of the 2026-27 Chapter 5.',
    prerequisiteIds: [],
    steps: [
      {
        id: 'ext-tan-meet', title: 'A line that touches the circle once', phase: 'observe',
        paragraphs: [l.concept.summary, ...l.concept.detailedPoints],
        visual: { kind: 'circlePracticeScene', alt: 'A circle with centre O, a radius OT and the tangent at T, which touches the circle only at T and is perpendicular to OT.', props: { scene: {
          circles: [{ id: 'c', name: 'Circle O', center: { x: 0, y: 0 }, radius: 4 }],
          circumferencePoints: [{ id: 'T', name: 'T', circleId: 'c', angleRad: Math.PI / 3 }],
          chords: [], angles: [], cyclicQuads: [],
          radiusDiameters: [{ id: 'OT', name: 'OT', circleId: 'c', type: 'radius', pointId: 'T' }],
          tangents: [{ id: 'tan', name: 'tangent at T', circleId: 'c', contactPointId: 'T', length: 7 }],
        } } },
        notice: 'The tangent meets the circle at T only, and the angle between OT and the tangent is a right angle.',
        vocabulary: (l.concept.keyTerms ?? []).map((k) => ({ term: k.term, meaning: k.definition })),
        labTaskId: task.id,
        prediction: guidedPrediction(l),
      },
      { id: 'ext-tan-why', title: 'Why the radius is perpendicular to the tangent', phase: 'proof', paragraphs: [l.whyGuide.explanation], proof: proofFrom(l), why: l.whyGuide.deductiveTakeaway },
    ],
    worked: {
      id: 'w-ext-tan', title: 'Length of a tangent',
      given: ['A circle has centre O and radius 6 cm.', 'A point Q is 10 cm from O. A tangent from Q touches the circle at T.'],
      ask: 'How long is QT?',
      steps: [
        { text: 'OT is a radius and QT is a tangent at T, so ∠OTQ = 90°.', why: 'The tangent at a point is perpendicular to the radius drawn to that point.' },
        { text: 'In right triangle OTQ, OQ² = OT² + QT², so 10² = 6² + QT².', why: 'Pythagoras, with OQ as the hypotenuse.' },
        { text: 'QT² = 100 − 36 = 64, so QT = 8 cm.', why: 'A length is positive, so take the positive square root.' },
      ],
      verify: '6² + 8² = 36 + 64 = 100 = 10², so the triangle is right-angled as it should be.',
    },
    guided: {
      id: 'g-ext-tan', prompt: 'A circle has radius 9 cm. A point P is 15 cm from the centre O, and PA is a tangent touching the circle at A.',
      steps: [
        { id: 'g1', prompt: 'The right angle.', question: { kind: 'choice', id: 'ext-g1', prompt: 'Where is the right angle in triangle OAP?', options: [{ id: 'a', text: 'At A, between the radius OA and the tangent PA' }, { id: 'o', text: 'At O' }, { id: 'p', text: 'At P' }], correctId: 'a', feedback: { o: { message: 'The right angle is where the radius meets the tangent: at the point of contact A.', misconception: 'tangent-not-perpendicular' }, p: { message: 'The right angle is where the radius meets the tangent: at the point of contact A.', misconception: 'tangent-not-perpendicular' } }, explanation: 'Radius ⊥ tangent at the point of contact.' }, hints: ['Which two segments meet at the point of contact?'] },
        { id: 'g2', prompt: 'The tangent length.', question: tangentQ('ext-g2', 'How long is PA?', 12), hints: ['15² − 9² = 225 − 81.'] },
      ],
      conclusion: 'The right angle is at A, so PA² = 15² − 9² = 144 and PA = 12 cm.',
    },
    independent: [
      { id: 'ext-i1', topic: 'Tangent length', prompt: q5.title, question: { ...tangentQ('ext-i1', q5.question, 12) }, hints: q5.hint ? [q5.hint] : ['Radius ⊥ tangent: use Pythagoras with OQ as the hypotenuse.'], solution: q5.stepByStepSolution, source: { kind: 'original' } },
      { id: 'ext-i2', topic: 'Tangent length', prompt: 'Find the tangent length.', question: tangentQ('ext-i2', 'A circle has radius 8 cm and a point is 17 cm from its centre. How long is the tangent from that point?', 15), hints: ['17² − 8² = 289 − 64.'], solution: ['Radius ⊥ tangent, so 17² = 8² + t².', 't² = 289 − 64 = 225, so t = 15 cm.'], source: { kind: 'original' } },
      { id: 'ext-i3', topic: 'Distance from the centre', prompt: 'Work backwards.', question: tangentQ('ext-i3', 'A tangent from a point P to a circle of radius 7 cm is 24 cm long. How far is P from the centre?', 25), hints: ['Now the unknown is the hypotenuse: d² = 7² + 24².'], solution: ['Radius ⊥ tangent, so d² = 7² + 24² = 49 + 576 = 625.', 'd = 25 cm.'], source: { kind: 'original' } },
    ],
    reflection: {
      discover: 'The tangent at a point of a circle is perpendicular to the radius at that point, which turns tangent lengths into right-triangle problems.',
      evidence: 'In the workbench the angle between the radius and the tangent stayed at 90° wherever the point of contact was.',
      stillConfusing: [],
    },
    labTasks: [task],
  };
}

// ---------------------------------------------------------------------------
// Chapter assessment (original questions; CBSE question-paper competencies)
// ---------------------------------------------------------------------------

const num = (id: string, prompt: string, answer: number, unit: string, wrong: string, misconception: string, explanation: string, tolerance = 0.05): Question =>
  ({ kind: 'numeric', id, prompt, answer, unit, tolerance, defaultFeedback: { message: wrong, misconception }, explanation });

export const CIRCLES_ASSESSMENT: ChapterAssessment = {
  id: 'circles-assessment-1',
  title: 'Circles: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Diagrams are not to scale unless stated; use the given values. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'ca-1', topic: 'Parts of a circle', lessonId: 'circles-l1', competency: 'knowledge', marks: 1, prompt: 'Definitions.', question: { kind: 'choice', id: 'ca-1q', prompt: 'Which statement is always true for any circle?', options: [{ id: 'a', text: 'A diameter is the longest chord' }, { id: 'b', text: 'Every chord passes through the centre' }, { id: 'c', text: 'A radius is a chord' }], correctId: 'a', feedback: { b: { message: 'Only diameters pass through the centre; most chords do not.', misconception: 'chord-through-centre' }, c: { message: 'A radius joins the centre to the circle; a chord joins two points of the circle.', misconception: 'radius-is-chord' } }, explanation: 'A diameter is a chord through the centre and no chord is longer.' }, solution: ['A chord joins two points of the circle.', 'The diameter is the chord through the centre; every other chord is shorter.'] },
        { id: 'ca-2', topic: 'How many circles', lessonId: 'circles-l3', competency: 'knowledge', marks: 1, prompt: 'Circles through points.', question: { kind: 'choice', id: 'ca-2q', prompt: 'How many circles pass through three points that do not lie on one straight line?', options: [{ id: 'one', text: 'Exactly one' }, { id: 'two', text: 'Exactly two' }, { id: 'many', text: 'Infinitely many' }], correctId: 'one', feedback: { two: { message: 'The centre must be equally far from all three points, and the perpendicular bisectors meet at exactly one point.', misconception: 'many-circumcentres' }, many: { message: 'Infinitely many circles pass through TWO points; a third point (not in line) fixes the centre.', misconception: 'many-circumcentres' } }, explanation: 'The perpendicular bisectors of two of the segments meet in exactly one point, the only possible centre.' }, solution: ['The centre is on the perpendicular bisector of AB and of BC.', 'Two non-parallel lines meet once, so there is one centre and one circle.'] },
        { id: 'ca-3', topic: 'Equal chords', lessonId: 'circles-l5', competency: 'knowledge', marks: 1, prompt: 'Equal chords.', question: num('ca-3q', 'In a circle, chord PQ subtends 64° at the centre. Chord RS is equal to PQ. What angle does RS subtend at the centre?', 64, 'degrees', 'Equal chords of a circle subtend equal angles at the centre.', 'equal-chords-angles', 'Equal chords subtend equal angles at the centre: 64°.'), solution: ['PQ = RS, so the triangles OPQ and ORS are congruent (SSS: radii and equal chords).', 'Corresponding angles are equal: ∠ROS = ∠POQ = 64°.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'ca-4', topic: 'Perpendicular from the centre', lessonId: 'circles-l4', competency: 'application', marks: 2, prompt: 'A chord and its distance.', question: num('ca-4q', 'A circle has radius 13 cm. A chord is 5 cm from the centre. How long is the chord?', 24, 'cm', 'The perpendicular from the centre bisects the chord: half the chord is √(13² − 5²).', 'forgot-to-double', 'Half chord = √(169 − 25) = 12 cm, so the chord is 24 cm.'), solution: ['The perpendicular from O to the chord bisects it.', 'Half the chord = √(13² − 5²) = √144 = 12 cm.', 'The chord is 2 × 12 = 24 cm.'] },
        { id: 'ca-5', topic: 'Distance of chords', lessonId: 'circles-l6', competency: 'application', marks: 2, prompt: 'Which chord is closer?', question: { kind: 'choice', id: 'ca-5q', prompt: 'In one circle, chord AB is 10 cm long and chord CD is 14 cm long. Which statement is true?', options: [{ id: 'cd', text: 'CD is closer to the centre than AB' }, { id: 'ab', text: 'AB is closer to the centre than CD' }, { id: 'eq', text: 'They are equally far from the centre' }], correctId: 'cd', feedback: { ab: { message: 'The longer the chord, the closer it is to the centre (the diameter, the longest chord, passes through it).', misconception: 'longer-is-farther' }, eq: { message: 'Only equal chords are equidistant from the centre.', misconception: 'unequal-equidistant' } }, explanation: 'Longer chords are nearer the centre.' }, solution: ['distance² = r² − (half chord)².', 'A larger half chord gives a smaller distance, so the longer chord CD is closer.'] },
        { id: 'ca-6', topic: 'Angle at the centre', lessonId: 'circles-l7', competency: 'application', marks: 2, prompt: 'Central and inscribed angles.', question: num('ca-6q', 'An arc subtends 136° at the centre of a circle. What angle does it subtend at a point on the remaining part of the circle?', 68, 'degrees', 'The angle at the centre is twice the angle at the circle, so halve it.', 'doubled-instead', 'Inscribed angle = 136° ÷ 2 = 68°.'), solution: ['The angle subtended at the centre is double the angle at any point on the remaining part of the circle.', 'So the angle is 136° ÷ 2 = 68°.'] },
        { id: 'ca-7', topic: 'Cyclic quadrilaterals', lessonId: 'circles-l9', competency: 'application', marks: 2, prompt: 'Opposite angles.', question: { kind: 'multi', id: 'ca-7q', prompt: 'ABCD is a cyclic quadrilateral with ∠A = 72° and ∠B = 110°. Find ∠C and ∠D.', parts: [{ id: 'c', label: '∠C', answer: 108, unit: 'degrees', tolerance: 0.05 }, { id: 'd', label: '∠D', answer: 70, unit: 'degrees', tolerance: 0.05 }], defaultFeedback: { message: 'Opposite angles of a cyclic quadrilateral add up to 180°: ∠A pairs with ∠C, and ∠B with ∠D.', misconception: 'wrong-opposite-pair' }, explanation: '∠C = 180° − 72° = 108°, ∠D = 180° − 110° = 70°.' }, solution: ['∠A + ∠C = 180°, so ∠C = 108°.', '∠B + ∠D = 180°, so ∠D = 70°.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'ca-8', topic: 'Angle in a semicircle', lessonId: 'circles-l8', competency: 'analysis', marks: 2, prompt: 'A triangle on a diameter.', question: num('ca-8q', 'AB is a diameter of a circle and C is a point on the circle with ∠CAB = 35°. Find ∠CBA.', 55, 'degrees', 'The angle in a semicircle is 90°, so ∠ACB = 90°; the angles of triangle ABC add to 180°.', 'semicircle-not-right', '∠ACB = 90°, so ∠CBA = 180° − 90° − 35° = 55°.'), solution: ['∠ACB is an angle in a semicircle, so it is 90°.', 'In triangle ABC, ∠CBA = 180° − 90° − 35° = 55°.'] },
        { id: 'ca-9', topic: 'Concyclic points', lessonId: 'circles-l10', competency: 'analysis', marks: 2, prompt: 'Is it cyclic?', question: { kind: 'choice', id: 'ca-9q', prompt: 'A quadrilateral has angles 95°, 70°, 85° and 110°, in that order around it. Can its four vertices lie on one circle?', options: [{ id: 'yes', text: 'Yes: both pairs of opposite angles add up to 180°' }, { id: 'no', text: 'No: the angles are not all equal' }], correctId: 'yes', feedback: { no: { message: 'A quadrilateral is cyclic when its opposite angles are supplementary; the angles need not be equal. 95° + 85° = 180° and 70° + 110° = 180°.', misconception: 'cyclic-needs-equal' } }, explanation: 'Opposite angles 95° + 85° = 180° and 70° + 110° = 180°, so by the converse the vertices are concyclic.' }, solution: ['Opposite pairs: 95° + 85° = 180°, 70° + 110° = 180°.', 'By the converse of the cyclic-quadrilateral theorem, the vertices lie on a circle.'] },
        { id: 'ca-10', topic: 'Choosing a theorem', lessonId: 'circles-l11', competency: 'analysis', marks: 3, prompt: 'Two theorems together.', question: num('ca-10q', 'Points A, B, C, D lie on a circle with centre O. ∠AOB = 100°, and C and D are on the major arc. Find ∠ACB + ∠ADB.', 100, 'degrees', 'Each of ∠ACB and ∠ADB is half of ∠AOB (angles in the same segment are equal).', 'same-segment', '∠ACB = ∠ADB = 50°, so the sum is 100°.'), solution: ['∠ACB = ½∠AOB = 50° (angle at the centre is twice the angle at the circle).', '∠ADB is in the same segment as ∠ACB, so ∠ADB = 50°.', 'Sum = 100°.'] },
      ],
    },
  ],
};
