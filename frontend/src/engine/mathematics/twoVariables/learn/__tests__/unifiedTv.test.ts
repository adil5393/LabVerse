import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TWO_VARIABLES_CHAPTER as CH } from '../content';
import { TV_GUIDED_LESSONS } from '../../curriculumPath';
import { TWO_VARIABLES_PRACTICE_BANK as BANK } from '../../practiceBank';
import { TV_ASSESSMENT, TV_JUDGES, TV_LEGACY_KEY, TV_LESSON_MAP, TV_PRACTICE_ITEM_IDS } from '../unified';
import { pairRelation, satisfies } from '../pairs';
import { evaluateAnswer } from '../../../../education/evaluate';
import { assessmentMaxScore, lessonStatus } from '../../../../education/progress';
import type { Question } from '../../../../education/types';

const items = CH.practice!.groups.flatMap((g) => g.items);
const right = (q: Question) => (q.kind === 'choice' ? { kind: 'choice' as const, id: q.correctId } : q.kind === 'numeric' ? { kind: 'numeric' as const, text: String(q.answer) } : q.kind === 'multi' ? { kind: 'multi' as const, values: Object.fromEntries(q.parts.map((p) => [p.id, String(p.answer)])) } : null);

describe('pairs of equations: the exact model', () => {
  it('classifies one, none and infinitely many, and finds the meeting point', () => {
    expect(pairRelation([1, 2, -50], [2, 1, -70])).toEqual({ kind: 'unique', x: 30, y: 10 });
    expect(pairRelation([1, 1, -5], [1, 1, -8])).toEqual({ kind: 'parallel' });
    expect(pairRelation([1, 2, -4], [2, 4, -8])).toEqual({ kind: 'coincident' });
    expect(pairRelation([1, 1, -5], [1, -1, -2])).toEqual({ kind: 'unique', x: 3.5, y: 1.5 });
    expect(pairRelation([1, 0, -2], [0, 1, -3])).toEqual({ kind: 'unique', x: 2, y: 3 }); // vertical and horizontal lines
  });
  it('every two-line figure in the new lessons is labelled with the true relation and point', () => {
    for (const l of ['tv-l8', 'tv-l9', 'tv-l10', 'tv-l11'].map((id) => CH.lessons[id])) {
      for (const s of l.steps) if (s.visual?.kind === 'tvPair') {
        const [e1, e2] = (s.visual.props as { eqs: [[number, number, number], [number, number, number]] }).eqs;
        const r = pairRelation(e1, e2);
        if (r.kind === 'unique') { expect(satisfies(e1, r.x, r.y)).toBe(true); expect(satisfies(e2, r.x, r.y)).toBe(true); expect(s.visual.alt).toContain(`(${r.x}, ${r.y})`); }
        else expect(s.visual.alt.toLowerCase()).toMatch(r.kind === 'parallel' ? /parallel/ : /same line/);
      }
    }
  });
});

describe('Two Variables: content parity', () => {
  it('every older lesson has a current home (pairs of equations included); ids that look alike are matched only by the table', () => {
    for (const l of Object.values(TV_GUIDED_LESSONS)) {
      expect(Object.prototype.hasOwnProperty.call(TV_LESSON_MAP, l.id), l.id).toBe(true);
      const to = TV_LESSON_MAP[l.id];
      if (!to) continue;
      expect(CH.lessons[to].labTasks?.some((t) => t.id === `lt-${l.id}`), l.id).toBe(true);
    }
    expect(TV_LESSON_MAP['tv-l7']).toBe('tv-l11'); // older "Two Lines on One Graph" is not current "The line y = mx + d"
    for (const id of ['tv-l7', 'tv-l9', 'tv-l10', 'tv-l11']) expect(TV_GUIDED_LESSONS[id].title).not.toBe(CH.lessons[id].title);
  });
  it('every bank question is converted and accepts its right answer; "any point on the line" accepts many points and rejects others', () => {
    const ids = new Set(items.map((i) => i.id));
    for (const q of BANK) expect(ids.has(q.id), q.id).toBe(true);
    for (const it of items) {
      const q = it.question;
      if (q.kind === 'judged') {
        const judge = TV_JUDGES[q.judgeId];
        expect(judge, it.id).toBeDefined();
        const eq = BANK.find((b) => b.id === it.id)!.answer as { kind: 'graph_point'; equations: { a: { n: number; d: number }; b: { n: number; d: number }; c: { n: number; d: number } }[] };
        const [a, b, c] = [eq.equations[0].a, eq.equations[0].b, eq.equations[0].c].map((r) => r.n / r.d);
        for (const x of [-3, 0, 2, 7]) {
          const y = b !== 0 ? (-c - a * x) / b : 0;
          const xx = b !== 0 ? x : -c / a;
          expect(evaluateAnswer(q, { kind: 'multi', values: { x: String(xx), y: String(y) } }, TV_JUDGES).correct, `${it.id} (${xx}, ${y})`).toBe(true);
        }
        expect(evaluateAnswer(q, { kind: 'multi', values: { x: '1000', y: '1000' } }, TV_JUDGES).correct).toBe(false);
      } else {
        expect(evaluateAnswer(q, right(q)!).correct, it.id).toBe(true);
      }
    }
  });
  it('the assessment is consistent and covers the new pairs-of-equations lessons', () => {
    expect(assessmentMaxScore(TV_ASSESSMENT)).toBe(15);
    for (const s of TV_ASSESSMENT.sections) for (const it of s.items) expect(evaluateAnswer(it.question, right(it.question)!).correct, it.id).toBe(true);
    const lessons = new Set(TV_ASSESSMENT.sections.flatMap((s) => s.items.map((i) => i.lessonId)));
    for (const id of ['tv-l8', 'tv-l9', 'tv-l10', 'tv-l11']) expect(lessons.has(id), id).toBe(true);
  });
});

describe('Two Variables: progress migration', () => {
  class MemoryStorage { m = new Map<string, string>(); getItem(k: string) { return this.m.get(k) ?? null; } setItem(k: string, v: string) { this.m.set(k, v); } removeItem(k: string) { this.m.delete(k); } clear() { this.m.clear(); } }
  beforeEach(() => { vi.stubGlobal('localStorage', new MemoryStorage()); vi.resetModules(); });
  it('older tv-l7 progress lands on current tv-l11, read-only, never as mastery', async () => {
    const OLD = JSON.stringify({ version: 1, lessons: { 'tv-l7': { lessonId: 'tv-l7', completed: true, mastered: true, predictionSelectedOption: 1, predictionIsCorrect: true, interactionsRecorded: 6 } }, practiceAnswers: { 'q-tv-21': { userAnswerText: '(2, 3)', isCorrect: true, firstAttemptCorrect: true, attempts: 1, hintsRevealed: 0, showSolution: false } } });
    localStorage.setItem(TV_LEGACY_KEY, OLD);
    const { runLegacyImport } = await import('../../../../../features/education/useLegacyImport');
    const { useEducationStore } = await import('../../../../../store/useEducationStore');
    const shape = { rootEvidenceField: 'practiceAnswers', masteredField: 'mastered', questionsOf: (id: string) => TV_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };
    expect(runLegacyImport('two-variables', TV_LEGACY_KEY, TV_LESSON_MAP, TV_PRACTICE_ITEM_IDS, shape)).toBe(true);
    const st = useEducationStore.getState();
    expect(st.legacy['two-variables'].lessons['tv-l7']).toMatchObject({ mappedLessonId: 'tv-l11', completedClaim: true, masteryClaim: 'old-rule', prediction: { answer: '1', correct: true } });
    expect(st.practice['two-variables']['q-tv-21'].firstAttemptUnassisted).toBe(true);
    expect(lessonStatus(CH.lessons['tv-l7'], st.lessons['tv-l7'])).toBe('not_started');
    expect(lessonStatus(CH.lessons['tv-l11'], st.lessons['tv-l11'])).toBe('not_started');
    expect(localStorage.getItem(TV_LEGACY_KEY)).toBe(OLD);
  });
});
