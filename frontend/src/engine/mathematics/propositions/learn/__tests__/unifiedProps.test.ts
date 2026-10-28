import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROPOSITIONS_CHAPTER as CH } from '../content';
import { PROP_GUIDED_LESSONS } from '../../curriculumPath';
import { PROPOSITIONS_PRACTICE_BANK } from '../../practiceBank';
import { PROP_ASSESSMENT, PROP_LEGACY_KEY, PROP_LESSON_MAP, PROP_PRACTICE_ITEM_IDS } from '../unified';
import { evaluateAnswer } from '../../../../education/evaluate';
import { assessmentMaxScore, lessonStatus } from '../../../../education/progress';
import type { Question } from '../../../../education/types';

const items = CH.practice!.groups.flatMap((g) => g.items);
const right = (q: Question) => (q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : q.kind === 'order' ? { kind: 'order' as const, ids: ['s1', 's2', 's3', 's4'] } : null);

describe('Propositions: content parity', () => {
  it('every older lesson is in the table and every mapped lesson carries its prediction and workbench task', () => {
    for (const l of Object.values(PROP_GUIDED_LESSONS)) {
      expect(Object.prototype.hasOwnProperty.call(PROP_LESSON_MAP, l.id), l.id).toBe(true);
      const to = PROP_LESSON_MAP[l.id];
      if (!to) continue;
      const lesson = CH.lessons[to];
      expect(lesson.labTasks?.some((t) => t.id === `lt-${l.id}` && (t.setup as { experimentId: string }).experimentId === l.experimentId), l.id).toBe(true);
      if (l.predictionQuestion) expect(lesson.steps.some((s) => s.prediction?.prompt === l.predictionQuestion!.question), l.id).toBe(true);
    }
  });
  it('every older practice question is in the bank and accepts its own right answer', () => {
    const ids = new Set(items.map((i) => i.id));
    for (const q of PROPOSITIONS_PRACTICE_BANK) expect(ids.has(q.id), q.id).toBe(true);
    for (const it of items) expect(evaluateAnswer(it.question, right(it.question)!).correct, it.id).toBe(true);
  });
  it('the assessment covers the chapter in all three competencies and accepts its right answers', () => {
    expect(assessmentMaxScore(PROP_ASSESSMENT)).toBe(15);
    for (const s of PROP_ASSESSMENT.sections) for (const it of s.items) expect(evaluateAnswer(it.question, right(it.question)!).correct, it.id).toBe(true);
    expect(new Set(PROP_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.competency)))).toEqual(new Set(['knowledge', 'application', 'analysis']));
  });
});

describe('Propositions: progress migration (evidence stored at the top level)', () => {
  class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }
  beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); });
  it('files each question under its older lesson, keeps assisted answers assisted, and never grants mastery', async () => {
    const OLD = JSON.stringify({ version: 2, lessons: { 'prop-l5': { lessonId: 'prop-l5', completed: true, mastered: true } }, practiceEvidence: { 'q-prop-13': { attempts: 1, correct: true, firstAttemptCorrect: true, assisted: false, hintsUsed: 0, solutionShown: false }, 'q-prop-14': { attempts: 2, correct: true, firstAttemptCorrect: false, assisted: true } } });
    localStorage.setItem(PROP_LEGACY_KEY, OLD);
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    const shape = { rootEvidenceField: 'practiceEvidence', questionsOf: (id: string) => PROP_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };
    expect(runLegacyImport('propositions', PROP_LEGACY_KEY, PROP_LESSON_MAP, PROP_PRACTICE_ITEM_IDS, shape)).toBe(true);
    const st = useEducationStore.getState();
    expect(st.legacy.propositions.lessons['prop-l5']).toMatchObject({ mappedLessonId: 'prop-l5', completedClaim: true, masteryClaim: 'old-rule' });
    expect(Object.keys(st.legacy.propositions.lessons['prop-l5'].practice).sort()).toEqual(['q-prop-13', 'q-prop-14']);
    expect(st.practice.propositions['q-prop-13'].firstAttemptUnassisted).toBe(true);
    expect(st.practice.propositions['q-prop-14']).toMatchObject({ assisted: true, firstAttemptUnassisted: false });
    expect(lessonStatus(CH.lessons['prop-l5'], st.lessons['prop-l5'])).toBe('not_started');
    expect(localStorage.getItem(PROP_LEGACY_KEY)).toBe(OLD);
  });
});
