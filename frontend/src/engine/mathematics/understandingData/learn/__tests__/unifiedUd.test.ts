import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UNDERSTANDING_DATA_CHAPTER as CH } from '../content';
import { UD_GUIDED_LESSONS } from '../../curriculumPath';
import { UNDERSTANDING_DATA_PRACTICE_BANK as BANK, checkPracticeAnswer } from '../../practiceBank';
import { UD_ASSESSMENT, UD_LEGACY_KEY, UD_LESSON_MAP, UD_PRACTICE_ITEM_IDS } from '../unified';
import { evaluateAnswer } from '../../../../education/evaluate';
import { applyLabEvent, assessmentMaxScore, labTaskComplete, lessonStatus } from '../../../../education/progress';
import type { Question } from '../../../../education/types';

const items = CH.practice!.groups.flatMap((g) => g.items);
const right = (q: Question) => (q.kind === 'choice' || q.kind === 'visual' ? { kind: q.kind, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : null);

describe('Understanding Data: content parity', () => {
  it('every older lesson is in the table; each mapped lesson carries its task, and must-visit views become view goals', () => {
    for (const l of Object.values(UD_GUIDED_LESSONS)) {
      expect(Object.prototype.hasOwnProperty.call(UD_LESSON_MAP, l.id), l.id).toBe(true);
      const to = UD_LESSON_MAP[l.id];
      if (!to) continue;
      const task = CH.lessons[to].labTasks?.find((t) => t.id === `lt-${l.id}`);
      expect(task, l.id).toBeDefined();
      for (const v of l.mustVisitViews ?? []) expect(task!.goals.some((g) => g.view === v), `${l.id} view ${v}`).toBe(true);
    }
  });
  it('a view goal is met only when the workbench reports that view', () => {
    const l = Object.values(UD_GUIDED_LESSONS).find((x) => x.mustVisitViews?.length)!;
    const task = CH.lessons[UD_LESSON_MAP[l.id]!].labTasks!.find((t) => t.id === `lt-${l.id}`)!;
    let r = applyLabEvent(task, undefined, { name: 'figure-changed' });
    for (let i = 0; i < 6; i++) r = applyLabEvent(task, r, { name: 'figure-changed' });
    r = applyLabEvent(task, r, { name: 'observation' });
    expect(labTaskComplete(task, r)).toBe(false);
    for (const v of l.mustVisitViews!) r = applyLabEvent(task, r, { name: 'view', view: v });
    expect(labTaskComplete(task, r)).toBe(true);
  });
  it('every older prediction (option or numeric) is asked: on a step, or with its task when no step is free', () => {
    for (const l of Object.values(UD_GUIDED_LESSONS)) {
      const to = UD_LESSON_MAP[l.id];
      if (!to || !(l.predictionQuestion || l.numericPrediction)) continue;
      const lesson = CH.lessons[to];
      const onStep = lesson.steps.find((s) => s.prediction?.id === `pred-${l.id}`)?.prediction;
      const onTask = lesson.labTasks?.find((t) => t.id === `lt-${l.id}`)?.prediction;
      const p = onStep ?? onTask;
      expect(p, l.id).toBeDefined();
      if (!l.predictionQuestion) expect(p!.numeric, l.id).toBeDefined();
    }
  });
  it('every bank question is in the practice set; chart-click questions stay chart-click; every right answer is accepted', () => {
    const ids = new Set(items.map((i) => i.id));
    for (const q of BANK) expect(ids.has(q.id), q.id).toBe(true);
    for (const q of BANK.filter((x) => x.answer.kind === 'segment' || x.answer.kind === 'bar')) expect(items.find((i) => i.id === q.id)!.question.kind, q.id).toBe('visual');
    for (const it of items) expect(evaluateAnswer(it.question, right(it.question)!).correct, it.id).toBe(true);
  });
  it('numeric answers keep the older rounding rule', () => {
    for (const q of BANK) {
      if (q.answer.kind !== 'number' || q.answer.decimals === undefined) continue;
      const item = items.find((i) => i.id === q.id)!.question as { answer: number; tolerance: number };
      const rounded = item.answer.toFixed(q.answer.decimals);
      expect(checkPracticeAnswer(q, { kind: 'number', text: rounded }).correct, q.id).toBe(true);
      expect(evaluateAnswer(item as never, { kind: 'numeric', text: rounded }).correct, q.id).toBe(true);
    }
  });
  it('the assessment is consistent', () => {
    expect(assessmentMaxScore(UD_ASSESSMENT)).toBe(14);
    for (const s of UD_ASSESSMENT.sections) for (const it of s.items) expect(evaluateAnswer(it.question, right(it.question)!).correct, it.id).toBe(true);
    expect(JSON.stringify(CH).length).toBeGreaterThan(1000); // content is plain, serialisable data
  });
});

describe('Understanding Data: progress migration', () => {
  class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }
  beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); });
  it('older evidence with no "assisted" flag but with help shown is treated as assisted', async () => {
    const OLD = JSON.stringify({ version: 1, lessons: { 'ud-l3': { lessonId: 'ud-l3', completed: true, mastered: true, predictionMade: true, predictionText: '72', interactionsRecorded: 5 } }, practiceAnswers: {
      'q-ud-15': { userAnswerText: '72', isCorrect: true, firstAttemptCorrect: true, attempts: 1, hintsRevealed: 0, showSolution: false },
      'q-ud-12': { userAnswerText: '10', isCorrect: true, firstAttemptCorrect: true, attempts: 1, hintsRevealed: 1, showSolution: false },
    } });
    localStorage.setItem(UD_LEGACY_KEY, OLD);
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    const shape = { rootEvidenceField: 'practiceAnswers', masteredField: 'mastered', questionsOf: (id: string) => UD_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };
    expect(runLegacyImport('understanding-data', UD_LEGACY_KEY, UD_LESSON_MAP, UD_PRACTICE_ITEM_IDS, shape)).toBe(true);
    const st = useEducationStore.getState();
    expect(st.legacy['understanding-data'].lessons['ud-l3']).toMatchObject({ mappedLessonId: 'ud-l2', completedClaim: true, prediction: { answer: '72' }, interactions: 5 });
    expect(st.practice['understanding-data']['q-ud-15'].firstAttemptUnassisted).toBe(true);
    expect(st.practice['understanding-data']['q-ud-12']).toMatchObject({ assisted: true, firstAttemptUnassisted: false });
    expect(lessonStatus(CH.lessons['ud-l2'], st.lessons['ud-l2'])).toBe('not_started');
    expect(localStorage.getItem(UD_LEGACY_KEY)).toBe(OLD);
  });
});
