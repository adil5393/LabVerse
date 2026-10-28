/**
 * Acceptance tests for the Circles pilot migration to the unified framework. They prove that no educational functionality of
 * the older guided-workbench path was lost, that answers are checked at least as strictly, and that stored progress migrates
 * safely (idempotent, read-only on the older key, never promoted to mastery).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CIRCLES_CHAPTER as CH } from '../content';
import { CIRCLES_GUIDED_LESSONS } from '../../curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../../practiceBank';
import { CIRCLES_ASSESSMENT, CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS, convertQuestion, olderQuestion } from '../unified';
import { validatePracticeAnswer } from '../../geometry';
import { evaluateAnswer } from '../../../../education/evaluate';
import { assessmentMaxScore, lessonStatus } from '../../../../education/progress';
import { importLegacyProgress, legacyPracticeRecords } from '../../../../education/legacy';
import { liveCircleMeasurements } from '../liveMeasurements';

const practiceItems = CH.practice!.groups.flatMap((g) => g.items);
const practiceIds = new Set(practiceItems.map((i) => i.id));

describe('content parity: every older interaction has a home', () => {
  const older = Object.values(CIRCLES_GUIDED_LESSONS);

  it('every older lesson is in the mapping table; mapped lessons exist; nothing is mapped by look-alike ids', () => {
    for (const l of older) expect(Object.prototype.hasOwnProperty.call(CIRCLES_LESSON_MAP, l.id), l.id).toBe(true);
    for (const [from, to] of Object.entries(CIRCLES_LESSON_MAP)) if (to) expect(CH.lessons[to], `${from} -> ${to}`).toBeDefined();
    expect(CIRCLES_LESSON_MAP['circles-l12']).toBeNull();
  });

  it('every older prediction is asked, word for word, before the explanation of the mapped lesson', () => {
    for (const l of older) {
      const to = CIRCLES_LESSON_MAP[l.id];
      if (!to || !l.predictionQuestion) continue;
      const step = CH.lessons[to].steps.find((s) => s.prediction);
      expect(step, l.id).toBeDefined();
      expect(step!.prediction!.prompt).toBe(l.predictionQuestion.question);
      expect(step!.prediction!.options.map((o) => o.text)).toEqual(l.predictionQuestion.options);
      expect(step!.prediction!.expectedId).toBe(`p${l.predictionQuestion.correctIndex}`);
      expect(step!.prediction!.reveal).toBe(l.predictionQuestion.explanation);
    }
  });

  it('every older experiment and observation becomes a laboratory task with the same experiment, tools, highlights and goals', () => {
    for (const l of older) {
      const to = CIRCLES_LESSON_MAP[l.id];
      if (!to) continue;
      const lesson = CH.lessons[to];
      const task = lesson.labTasks?.find((t) => t.id === `lt-${l.id}`);
      expect(task, l.id).toBeDefined();
      expect(lesson.steps.some((s) => s.labTaskId === task!.id), `${l.id} task shown in a step`).toBe(true);
      expect(task!.setup).toMatchObject({ experimentId: l.experimentId, allowedTools: l.allowedTools, highlightedObjectIds: l.highlightedObjectIds ?? [] });
      expect(task!.goals.find((g) => g.id === 'explore')).toMatchObject({ events: ['figure-changed'], count: l.experimentGuide.minInteractionsNeeded ?? 2 });
      expect(task!.goals.find((g) => g.id === 'observe')?.events).toEqual(['observation']);
      expect(task!.observePrompt).toBe(l.observeGuide.prompt);
      expect(task!.expectedPattern).toContain(l.observeGuide.expectedPattern);
      expect(task!.href).toContain(`exp=${l.experimentId}`);
      // The older path never required the investigation for mastery; nor does this one, so no student's status changes.
      expect(task!.requiredForMastery).toBe(false);
    }
  });

  it('every older "understand why" proof is taught: the lesson has a numbered proof (its own or the older one)', () => {
    for (const l of older) {
      const to = CIRCLES_LESSON_MAP[l.id];
      if (!to || !l.whyGuide.proofSteps?.length) continue;
      expect(CH.lessons[to].steps.some((s) => (s.proof?.length ?? 0) > 0), l.id).toBe(true);
    }
  });

  it('every older practice question is in the chapter practice bank (duplicates once), and so is every bank question', () => {
    for (const l of older) for (const q of l.practiceQuestionIds) {
      const target = CIRCLES_PRACTICE_ITEM_IDS[q] ?? q;
      expect(practiceIds.has(target) || CH.lessons['circles-ext-tangents'].independent.some((i) => olderQuestion(q)?.question === (i.question as { prompt: string }).prompt), `${l.id}: ${q}`).toBe(true);
    }
    for (const q of CHAPTER_PRACTICE_BANK) expect(practiceIds.has(q.id), q.id).toBe(true);
    expect(practiceItems.length).toBe(new Set(practiceItems.map((i) => i.id)).size);
  });

  it('diagram, difficulty, marks, hints and worked solutions carry over for every bank question', () => {
    for (const q of CHAPTER_PRACTICE_BANK) {
      const item = practiceItems.find((i) => i.id === q.id)!;
      if (q.diagram) expect(item.visual).toMatchObject({ kind: 'circlePracticeScene', props: { scene: q.diagram } });
      expect(item.difficulty).toBe(q.difficulty);
      expect(item.marks).toBe(q.marks);
      expect(item.solution).toEqual(q.stepByStepSolution);
      expect(item.hints.length, q.id).toBeGreaterThan(0);
    }
  });

  it('the older revision lesson lives on as the practice bank and the chapter assessment', () => {
    expect(CH.practice!.groups.find((g) => g.id === 'g-mixed')?.items.length).toBeGreaterThan(0);
    expect(assessmentMaxScore(CIRCLES_ASSESSMENT)).toBeGreaterThanOrEqual(15);
    const lessons = new Set(CIRCLES_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.lessonId)));
    for (const id of ['circles-l1', 'circles-l4', 'circles-l7', 'circles-l9']) expect(lessons.has(id)).toBe(true);
    expect(new Set(CIRCLES_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.competency)))).toEqual(new Set(['knowledge', 'application', 'analysis']));
  });

  it('tangents are an optional Beyond Class 9 lesson that never counts toward chapter completion', () => {
    const ext = CH.lessons['circles-ext-tangents'];
    expect(ext.extension).toBe(true);
    expect(ext.title).toMatch(/Beyond Class 9/);
    expect(CH.units.find((u) => u.lessonIds.includes(ext.id))!.title).toMatch(/optional/i);
    for (const l of Object.values(CH.lessons)) if (l.id !== ext.id) expect(l.extension ?? false).toBe(false);
  });
});

describe('answers are checked at least as strictly as before', () => {
  it('multi-part answers need every part (the older checker accepted the first number only)', () => {
    const q = convertQuestion(olderQuestion('q_def_radius_diameter')!);
    expect(validatePracticeAnswer('9', '9 cm, 28.26 cm', 0.1)).toBe(true); // the older defect, kept for the record
    expect(evaluateAnswer(q, { kind: 'multi', values: { d: '9', c: '30' } }).correct).toBe(false);
    expect(evaluateAnswer(q, { kind: 'multi', values: { d: '9', c: '28.26' } }).correct).toBe(true);
    const part = evaluateAnswer(q, { kind: 'multi', values: { d: '9', c: '30' } });
    expect(part.message).toMatch(/Circumference is not right yet/);
  });
  it('numeric answers keep their tolerance and units; choices keep their correct option', () => {
    const q = convertQuestion(olderQuestion('q_chord_perp_pythagoras')!);
    expect(q).toMatchObject({ kind: 'numeric', answer: 8, unit: 'cm' });
    expect(evaluateAnswer(q, { kind: 'numeric', text: '8.05' }).correct).toBe(true);
    expect(evaluateAnswer(q, { kind: 'numeric', text: '8.2' }).correct).toBe(false);
    const c = convertQuestion(olderQuestion('q_semicircle_right_angle')!);
    expect(c).toMatchObject({ kind: 'choice', correctId: 'o2' });
    expect(convertQuestion(olderQuestion('q_concyclicity_test')!)).toMatchObject({ kind: 'choice', correctId: 'yes' });
  });
  it('every converted question has a right answer that the shared evaluator accepts', () => {
    for (const it of practiceItems) {
      const q = it.question;
      const input = q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId }
        : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) }
        : q.kind === 'multi' ? { kind: 'multi' as const, values: Object.fromEntries(q.parts.map((p) => [p.id, String(p.answer)])) } : null;
      expect(input, it.id).not.toBeNull();
      expect(evaluateAnswer(q, input!).correct, it.id).toBe(true);
    }
  });
  it('every practice scene is drawable: one circle, points with finite angles, references that resolve', () => {
    for (const it of practiceItems) {
      if (!it.visual) continue;
      const scene = it.visual.props!.scene as { circles: unknown[]; circumferencePoints: { id: string; angleRad: number }[]; chords: { pointAId: string; pointBId: string }[] };
      expect(scene.circles.length, it.id).toBe(1);
      const ids = new Set(scene.circumferencePoints.map((p) => p.id));
      for (const p of scene.circumferencePoints) expect(Number.isFinite(p.angleRad)).toBe(true);
      for (const c of scene.chords) { expect(ids.has(c.pointAId), it.id).toBe(true); expect(ids.has(c.pointBId), it.id).toBe(true); }
    }
  });
});

describe('progress migration from the older Circles store', () => {
  const OLD = JSON.stringify({
    chapterId: 'circles-class-9', lastVisitedLessonId: 'circles-l3', completedLessonIds: ['circles-l1', 'circles-l2'],
    lessons: {
      'circles-l1': { lessonId: 'circles-l1', completed: true, practiceMastered: true, practiceAnswered: { q_def_radius_diameter: { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false }, q_def_mcq_longest_chord: { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false } }, predictionAnswer: 'It remains constant and exactly equal to radius r', predictionCorrect: true, interactionsRecorded: 4, observationsCaptured: 1 },
      'circles-l2': { lessonId: 'circles-l2', completed: true, practiceMastered: true },
      'circles-l3': { lessonId: 'circles-l3', completed: false, teacherBypassed: true, practiceAnswered: { q_circumcenter_hypotenuse: { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false } } },
      'circles-l6': { lessonId: 'circles-l6', practiceAnswered: { q_chord_distance_calc: { attempts: 2, correct: true, firstAttemptCorrect: false, assisted: true } } },
    },
  });

  class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }
  beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); });

  it('imports once, keeps the older key byte-for-byte, separates claims from mastery and preserves evidence', async () => {
    localStorage.setItem(CIRCLES_LEGACY_KEY, OLD);
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    expect(runLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS)).toBe(true);
    expect(runLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS)).toBe(false); // idempotent
    expect(localStorage.getItem(CIRCLES_LEGACY_KEY)).toBe(OLD);
    const st = useEducationStore.getState();
    expect(st.legacy.circles.lessons['circles-l1']).toMatchObject({ completedClaim: true, masteryClaim: 'old-rule', mappedLessonId: 'circles-l1', interactions: 4 });
    expect(st.legacy.circles.lessons['circles-l2'].masteryClaim).toBe('unverified');
    // Older first-attempt evidence fills the chapter practice bank; duplicates go to the bank question; assisted stays assisted.
    expect(st.practice.circles.q_def_radius_diameter.firstAttemptUnassisted).toBe(true);
    expect(st.practice.circles.q_circumcenter_hypotenuse).toMatchObject({ assisted: true, firstAttemptUnassisted: false }); // teacher-bypassed lesson
    expect(st.practice.circles.q_distance_chords_comparison).toMatchObject({ assisted: true, firstAttemptUnassisted: false });
    // Nothing becomes lesson mastery: the current lessons have no lesson records at all from the import.
    for (const id of Object.keys(CH.lessons)) expect(lessonStatus(CH.lessons[id], st.lessons[id])).toBe('not_started');
    // The import survives a reload (stored in the unified document), and the older key is still untouched.
    vi.resetModules();
    const again = (await import('../../../../../store/useEducationStore')).useEducationStore.getState();
    expect(again.legacy.circles.sourceKey).toBe(CIRCLES_LEGACY_KEY);
    expect(localStorage.getItem(CIRCLES_LEGACY_KEY)).toBe(OLD);
  });

  it('newer practice evidence is never overwritten by the import', async () => {
    localStorage.setItem(CIRCLES_LEGACY_KEY, OLD);
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    useEducationStore.getState().submitPractice('circles', 'q_def_radius_diameter', { correct: false });
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    runLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS);
    expect(useEducationStore.getState().practice.circles.q_def_radius_diameter.firstAttemptUnassisted).toBe(false);
  });

  it('missing or corrupt older data imports nothing and breaks nothing', async () => {
    localStorage.setItem(CIRCLES_LEGACY_KEY, '{corrupt');
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    expect(runLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS)).toBe(false);
    localStorage.removeItem(CIRCLES_LEGACY_KEY);
    expect(runLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS)).toBe(false);
  });

  it('pure import: every older lesson id is mapped through the table only', () => {
    const imp = importLegacyProgress(OLD, CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP)!;
    expect(Object.values(imp.lessons).every((l) => l.mappedLessonId === (CIRCLES_LESSON_MAP[l.legacyLessonId] ?? undefined))).toBe(true);
    expect(Object.keys(legacyPracticeRecords(imp, CIRCLES_PRACTICE_ITEM_IDS)).sort()).toEqual(['q_circumcenter_hypotenuse', 'q_def_mcq_longest_chord', 'q_def_radius_diameter', 'q_distance_chords_comparison']);
  });
});

describe('live measurements for lesson investigations', () => {
  it('reports every point distance, chord length and distance, and angle, with the older geometry functions', () => {
    const m = liveCircleMeasurements({
      circles: { c: { id: 'c', name: 'Circle O', center: { x: 0, y: 0 }, radius: 5 } },
      circumferencePoints: { a: { id: 'a', name: 'A', circleId: 'c', angleRad: 0 }, b: { id: 'b', name: 'B', circleId: 'c', angleRad: Math.PI / 2 } },
      chords: { ab: { id: 'ab', name: 'AB', circleId: 'c', pointAId: 'a', pointBId: 'b' } },
      angles: { g: { id: 'g', name: '∠AOB', circleId: 'c', point1Id: 'a', vertexId: 'center', point2Id: 'b', isCentral: true } },
    } as never, 10);
    expect(m).toEqual([
      { label: 'OA', value: '5.00 units' }, { label: 'OB', value: '5.00 units' },
      { label: 'AB', value: '7.07 units' }, { label: 'distance of AB from O', value: '3.54 units' },
      { label: '∠AOB', value: '90.0°' },
    ]);
  });
});
