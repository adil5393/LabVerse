/**
 * Acceptance tests for the Quadrilaterals migration to the unified framework: nothing of the older guided path is lost, ids
 * that look alike are never matched, answers are checked as strictly as before, and stored progress migrates safely.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QUADRILATERALS_CHAPTER as CH } from '../content';
import { QUAD_GUIDED_LESSONS } from '../../curriculumPath';
import { CHAPTER_PRACTICE_BANK } from '../../practiceBank';
import { QUAD_LEGACY_KEY, QUAD_LESSON_MAP, QUAD_PRACTICE_ITEM_IDS, convertQuestion, olderLessonsFor } from '../unified';
import { QUAD_ASSESSMENT } from '../assessment';
import { evaluateAnswer } from '../../../../education/evaluate';
import { assessmentMaxScore, lessonStatus } from '../../../../education/progress';
import { liveQuadMeasurements } from '../liveMeasurements';
import type { Question } from '../../../../education/types';

const items = CH.practice!.groups.flatMap((g) => g.items);
const ids = new Set(items.map((i) => i.id));
const rightInput = (q: Question) => (q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : q.kind === 'multi' ? { kind: 'multi' as const, values: Object.fromEntries(q.parts.map((p) => [p.id, String(p.answer)])) } : null);

describe('content parity', () => {
  const older = Object.values(QUAD_GUIDED_LESSONS);
  it('every older lesson is in the table; ids that look alike but teach different things are NOT matched by id', () => {
    for (const l of older) expect(Object.prototype.hasOwnProperty.call(QUAD_LESSON_MAP, l.id), l.id).toBe(true);
    expect(QUAD_LESSON_MAP['quad-l4']).toBe('quad-l3'); // older "converse properties" → current "When is a quadrilateral a parallelogram?"
    expect(QUAD_GUIDED_LESSONS['quad-l4'].title).toMatch(/Converse/);
    expect(CH.lessons['quad-l4'].title).toMatch(/Midpoint Theorem/);
    for (const to of Object.values(QUAD_LESSON_MAP)) if (to) expect(CH.lessons[to]).toBeDefined();
  });
  it('every current lesson carries the prediction and the workbench task of each older lesson mapped to it', () => {
    for (const lesson of Object.values(CH.lessons)) {
      for (const l of olderLessonsFor(lesson.id)) {
        const task = lesson.labTasks?.find((t) => t.id === `lt-${l.id}`);
        expect(task, `${lesson.id} <- ${l.id}`).toBeDefined();
        expect(task!.setup).toMatchObject({ experimentId: l.experimentId, allowedTools: l.allowedTools });
        expect(task!.goals.find((g) => g.id === 'explore')?.count).toBe(l.experimentGuide.minInteractionsNeeded ?? 2);
        if (l.predictionQuestion) expect(lesson.steps.some((s) => s.prediction?.prompt === l.predictionQuestion!.question), `${lesson.id} prediction of ${l.id}`).toBe(true);
      }
    }
  });
  it('every older practice question is in the bank, and every "choose the missing reason" proof survives', () => {
    for (const l of older) for (const q of l.practiceQuestionIds) expect(ids.has(QUAD_PRACTICE_ITEM_IDS[q] ?? q), `${l.id}: ${q}`).toBe(true);
    for (const q of CHAPTER_PRACTICE_BANK) expect(ids.has(q.id), q.id).toBe(true);
    for (const l of older) if (l.whyGuide.proofSteps?.some((p) => p.missingReasonOptions?.length)) expect(ids.has(`proof-${l.id}`), l.id).toBe(true);
    const q7 = items.find((i) => i.id === 'quad-q7')!.question;
    expect(q7.kind).toBe('choice');
    expect(evaluateAnswer(q7, rightInput(q7)!).correct).toBe(true);
  });
  it('every converted practice question and every assessment question accepts its own right answer', () => {
    for (const it of items) expect(evaluateAnswer(it.question, rightInput(it.question)!).correct, it.id).toBe(true);
    for (const s of QUAD_ASSESSMENT.sections) for (const it of s.items) expect(evaluateAnswer(it.question, rightInput(it.question)!).correct, it.id).toBe(true);
  });
  it('numeric answers keep their tolerance and unit', () => {
    const q = convertQuestion(CHAPTER_PRACTICE_BANK.find((x) => x.id === 'quad-q1')!);
    expect(q).toMatchObject({ kind: 'numeric', answer: 85, unit: 'degrees' });
    expect(evaluateAnswer(q, { kind: 'numeric', text: '85.05' }).correct).toBe(true);
    expect(evaluateAnswer(q, { kind: 'numeric', text: '86' }).correct).toBe(false);
  });
  it('the assessment covers the chapter across all three competencies, and its arithmetic is right', () => {
    expect(assessmentMaxScore(QUAD_ASSESSMENT)).toBe(15);
    expect(new Set(QUAD_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.lessonId)))).toEqual(new Set(['quad-l1', 'quad-l2', 'quad-l3', 'quad-l4', 'quad-l5', 'quad-l6', 'quad-l7', 'quad-l8']));
    const a = (id: string) => QUAD_ASSESSMENT.sections.flatMap((s) => s.items).find((i) => i.id === id)!.question as { answer: number };
    expect(a('qa-1').answer).toBe(360 - (70 + 95 + 120));
    expect(a('qa-6').answer).toBeCloseTo((2 / 3) * 18);
    expect(a('qa-7').answer).toBe(2 * (10 / 2 + 16 / 2));
  });
});

describe('progress migration from the older Quadrilaterals store', () => {
  class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }
  beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); });
  const OLD = JSON.stringify({ chapterId: 'quadrilaterals', lastVisitedLessonId: 'quad-l4', completedLessonIds: ['quad-l4'], lessons: { 'quad-l4': { completed: true, practiceMastered: true, practiceAnswered: { 'quad-q7': { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false } } } } });

  it('the older quad-l4 lands on the current quad-l3 (by topic), read-only and never as mastery', async () => {
    localStorage.setItem(QUAD_LEGACY_KEY, OLD);
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    expect(runLegacyImport('quadrilaterals', QUAD_LEGACY_KEY, QUAD_LESSON_MAP, QUAD_PRACTICE_ITEM_IDS)).toBe(true);
    expect(runLegacyImport('quadrilaterals', QUAD_LEGACY_KEY, QUAD_LESSON_MAP, QUAD_PRACTICE_ITEM_IDS)).toBe(false);
    const st = useEducationStore.getState();
    expect(st.legacy.quadrilaterals.lessons['quad-l4']).toMatchObject({ mappedLessonId: 'quad-l3', completedClaim: true, masteryClaim: 'old-rule' });
    expect(st.practice.quadrilaterals['quad-q7'].firstAttemptUnassisted).toBe(true);
    expect(lessonStatus(CH.lessons['quad-l4'], st.lessons['quad-l4'])).toBe('not_started');
    expect(lessonStatus(CH.lessons['quad-l3'], st.lessons['quad-l3'])).toBe('not_started');
    expect(localStorage.getItem(QUAD_LEGACY_KEY)).toBe(OLD);
  });
});

describe('live measurements', () => {
  it('segment lengths and angles from the construction', () => {
    const m = liveQuadMeasurements({
      points: { a: { id: 'a', name: 'A', x: 0, y: 0 }, b: { id: 'b', name: 'B', x: 3, y: 0 }, c: { id: 'c', name: 'C', x: 3, y: 4 } },
      segments: { ab: { id: 'ab', name: 'AB', pointAId: 'a', pointBId: 'b' }, ac: { id: 'ac', name: 'AC', pointAId: 'a', pointBId: 'c' } },
      angles: { g: { id: 'g', name: '∠ABC', point1Id: 'a', vertexId: 'b', point2Id: 'c' } },
    });
    expect(m).toEqual([{ label: 'AB', value: '3.00 units' }, { label: 'AC', value: '5.00 units' }, { label: '∠ABC', value: '90.0°' }]);
  });
});
