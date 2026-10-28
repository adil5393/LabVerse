import { describe, expect, it } from 'vitest';
import { BUILT_CHAPTERS } from './builtChapters';
import { chapterById } from '..';
import { evaluateAnswer } from '../../education/evaluate';
import { assessmentMaxScore } from '../../education/progress';
import type { Question } from '../../education/types';

const right = (q: Question) => {
  switch (q.kind) {
    case 'choice': case 'visual': return { kind: q.kind, id: q.correctId };
    case 'numeric': return { kind: 'numeric' as const, text: String(q.answer) };
    case 'multi': return { kind: 'multi' as const, values: Object.fromEntries(q.parts.map((p) => [p.id, String(p.answer)])) };
    case 'order': {
      const placed: string[] = []; const left = [...q.items];
      while (left.length) { const i = left.findIndex((it) => it.needs.every((n) => placed.includes(n))); placed.push(left.splice(i, 1)[0].id); }
      return { kind: 'order' as const, ids: placed };
    }
    default: return null;
  }
};

describe('every chapter assessment, across subjects', () => {
  const withAssessment = BUILT_CHAPTERS.filter((c) => c.assessment);
  it('the registry and the content agree about which chapters have an assessment', () => {
    for (const c of BUILT_CHAPTERS) expect(Boolean(c.assessment), c.id).toBe(chapterById(c.id)!.implementation.assessment);
    for (const c of withAssessment) expect(c.routes.assessment, c.id).toBeDefined();
  });
  it('every item accepts its own right answer, has a solution, positive marks and a lesson that exists', () => {
    for (const c of withAssessment) for (const s of c.assessment!.sections) for (const it of s.items) {
      const input = right(it.question);
      expect(input, `${c.id}/${it.id}`).not.toBeNull();
      expect(evaluateAnswer(it.question, input!).correct, `${c.id}/${it.id}`).toBe(true);
      expect(it.solution.length, `${c.id}/${it.id}`).toBeGreaterThan(0);
      expect(it.marks, `${c.id}/${it.id}`).toBeGreaterThan(0);
      if (it.lessonId) expect(c.lessons[it.lessonId], `${c.id}/${it.id} -> ${it.lessonId}`).toBeDefined();
    }
  });
  it('each assessment spans all three CBSE competency levels and has unique ids', () => {
    for (const c of withAssessment) {
      const items = c.assessment!.sections.flatMap((s) => s.items);
      expect(new Set(items.map((i) => i.competency)), c.id).toEqual(new Set(['knowledge', 'application', 'analysis']));
      expect(new Set(items.map((i) => i.id)).size, c.id).toBe(items.length);
      expect(assessmentMaxScore(c.assessment!), c.id).toBeGreaterThanOrEqual(10);
    }
  });
});
