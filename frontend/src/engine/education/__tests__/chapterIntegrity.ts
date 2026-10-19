/**
 * Reusable content-integrity checks for any EduChapter (EDU-1).
 * Used by each pilot chapter's test file so the same rules apply everywhere.
 */

import { describe, it, expect } from 'vitest';
import { evaluateAnswer } from '../evaluate';
import type { EduChapter, ExplainerStep, JudgeRegistry, Question, VisualRef } from '../types';

export function allQuestions(chapter: EduChapter): { where: string; q: Question; lessonId?: string }[] {
  const out: { where: string; q: Question; lessonId?: string }[] = [];
  const fromStep = (s: ExplainerStep, where: string, lessonId?: string) => { if (s.check) out.push({ where: `${where}/${s.id}`, q: s.check, lessonId }); };
  for (const p of Object.values(chapter.prerequisites)) {
    p.refresher.forEach((s) => fromStep(s, p.id));
    p.checks.forEach((q) => out.push({ where: `${p.id}/check`, q }));
  }
  for (const l of Object.values(chapter.lessons)) {
    l.steps.forEach((s) => fromStep(s, l.id, l.id));
    l.guided.steps.forEach((g) => out.push({ where: `${l.id}/guided/${g.id}`, q: g.question, lessonId: l.id }));
    l.independent.forEach((i) => out.push({ where: `${l.id}/independent/${i.id}`, q: i.question, lessonId: l.id }));
  }
  return out;
}

export function allVisuals(chapter: EduChapter): { where: string; v: VisualRef }[] {
  const out: { where: string; v: VisualRef }[] = [];
  const fromStep = (s: ExplainerStep, where: string) => { if (s.visual) out.push({ where: `${where}/${s.id}`, v: s.visual }); };
  for (const p of Object.values(chapter.prerequisites)) p.refresher.forEach((s) => fromStep(s, p.id));
  for (const l of Object.values(chapter.lessons)) {
    l.steps.forEach((s) => fromStep(s, l.id));
    if (l.worked.visual) out.push({ where: `${l.id}/worked`, v: l.worked.visual });
    l.worked.steps.forEach((s, i) => s.visual && out.push({ where: `${l.id}/worked/${i}`, v: s.visual }));
    if (l.guided.visual) out.push({ where: `${l.id}/guided`, v: l.guided.visual });
    l.independent.forEach((i) => i.visual && out.push({ where: `${l.id}/${i.id}`, v: i.visual }));
  }
  for (const { where, q } of allQuestions(chapter)) if (q.visual) out.push({ where: `${where}/question`, v: q.visual });
  return out;
}

export function refresherTargets(chapter: EduChapter): Set<string> {
  const ids = new Set<string>();
  for (const p of Object.values(chapter.prerequisites)) { ids.add(p.id); p.refresher.forEach((s) => ids.add(s.id)); }
  for (const l of Object.values(chapter.lessons)) l.steps.forEach((s) => ids.add(s.id));
  return ids;
}

export function describeChapterIntegrity(name: string, chapter: EduChapter, knownVisualKinds: string[], judges: JudgeRegistry = {}) {
  describe(`${name}: content integrity`, () => {
    const targets = refresherTargets(chapter);
    const questions = allQuestions(chapter);

    it('chapter has prerequisites, and every referenced prerequisite exists', () => {
      expect(chapter.prerequisiteIds.length).toBeGreaterThan(0);
      for (const id of chapter.prerequisiteIds) expect(chapter.prerequisites[id], id).toBeDefined();
    });

    it('every unit has prerequisites that exist, plus an introduction', () => {
      for (const u of chapter.units) {
        expect(u.prerequisiteIds.length, `${u.id} prerequisites`).toBeGreaterThan(0);
        for (const id of u.prerequisiteIds) expect(chapter.prerequisites[id], `${u.id}->${id}`).toBeDefined();
        expect(u.centralIdea.length).toBeGreaterThan(20);
        expect(u.connection.length).toBeGreaterThan(10);
        expect(u.vocabulary.length).toBeGreaterThan(0);
        expect(u.discover.length).toBeGreaterThan(0);
      }
    });

    it('every lesson belongs to exactly one unit and refers to real prerequisites', () => {
      const seen = new Map<string, string>();
      for (const u of chapter.units) for (const id of u.lessonIds) {
        expect(chapter.lessons[id], id).toBeDefined();
        expect(seen.has(id), `${id} in two units`).toBe(false);
        seen.set(id, u.id);
        expect(chapter.lessons[id].unitId).toBe(u.id);
      }
      expect([...seen.keys()].sort()).toEqual(Object.keys(chapter.lessons).sort());
      for (const l of Object.values(chapter.lessons)) for (const id of l.prerequisiteIds) expect(chapter.prerequisites[id], `${l.id}->${id}`).toBeDefined();
    });

    it('prerequisites are complete: why, refresher and a readiness check', () => {
      for (const p of Object.values(chapter.prerequisites)) {
        expect(p.why.length, p.id).toBeGreaterThan(20);
        expect(p.refresher.length, p.id).toBeGreaterThan(0);
        expect(p.checks.length, p.id).toBeGreaterThan(0);
      }
    });

    it('every lesson teaches before it tests: explainer, worked example with reasons, guided and independent practice', () => {
      for (const l of Object.values(chapter.lessons)) {
        expect(l.objective.length, l.id).toBeGreaterThan(15);
        expect(l.steps.length, `${l.id} steps`).toBeGreaterThan(0);
        for (const s of l.steps) { expect(s.paragraphs.length, s.id).toBeGreaterThan(0); }
        expect(l.worked.steps.length, `${l.id} worked`).toBeGreaterThanOrEqual(2);
        for (const w of l.worked.steps) expect(w.why.length, `${l.id} worked why`).toBeGreaterThan(5);
        expect(l.guided.steps.length, `${l.id} guided`).toBeGreaterThanOrEqual(2);
        for (const g of l.guided.steps) expect(g.hints.length, `${l.id}/${g.id} hints`).toBeGreaterThan(0);
        expect(l.independent.length, `${l.id} independent`).toBeGreaterThanOrEqual(3);
        for (const i of l.independent) { expect(i.hints.length, `${l.id}/${i.id}`).toBeGreaterThan(0); expect(i.solution.length).toBeGreaterThan(0); expect(i.topic.length).toBeGreaterThan(3); }
        expect(l.reflection.discover.length).toBeGreaterThan(20);
      }
    });

    it('ids are unique so evidence maps to exactly one item', () => {
      const ids = questions.map((x) => x.q.id);
      expect(new Set(ids).size, 'duplicate question ids: ' + ids.filter((x, i) => ids.indexOf(x) !== i).join(',')).toBe(ids.length);
      for (const l of Object.values(chapter.lessons)) {
        const items = [...l.steps.map((s) => s.id), ...l.guided.steps.map((g) => g.id), ...l.independent.map((i) => i.id)];
        expect(new Set(items).size, `${l.id} item ids`).toBe(items.length);
      }
    });

    it('every visual has an accessible text alternative and a known renderer', () => {
      for (const { where, v } of allVisuals(chapter)) {
        expect(v.alt.length, where).toBeGreaterThan(15);
        expect(knownVisualKinds, where).toContain(v.kind);
      }
    });

    it('question feedback is specific: every wrong option explains itself and every rule is unreachable by the right answer', () => {
      for (const { where, q } of questions) {
        expect(q.explanation.length, where).toBeGreaterThan(5);
        if (q.kind === 'choice') {
          expect(q.options.map((o) => o.id)).toContain(q.correctId);
          expect(new Set(q.options.map((o) => o.text)).size, `${where} duplicate options`).toBe(q.options.length);
          for (const o of q.options) {
            if (o.id === q.correctId) continue;
            expect(q.feedback[o.id]?.message?.length ?? 0, `${where} option ${o.id} needs its own explanation`).toBeGreaterThan(15);
          }
          for (const k of Object.keys(q.feedback)) { expect(k).not.toBe(q.correctId); expect(q.options.map((o) => o.id)).toContain(k); }
        }
        if (q.kind === 'numeric') {
          expect(q.defaultFeedback.message.length, where).toBeGreaterThan(10);
          for (const r of q.rules ?? []) {
            expect(r.entry.message.length, where).toBeGreaterThan(15);
            for (const v of r.values) expect(Math.abs(v - q.answer), `${where} rule equals the answer`).toBeGreaterThan(q.tolerance ?? 1e-9);
          }
        }
        if (q.kind === 'visual') expect(q.defaultFeedback.message.length, where).toBeGreaterThan(10);
        if (q.kind === 'order') {
          const ids = q.items.map((i) => i.id);
          expect(q.items.length, `${where} needs at least 3 steps`).toBeGreaterThanOrEqual(3);
          expect(new Set(ids).size, `${where} duplicate step ids`).toBe(ids.length);
          for (const it of q.items) for (const n of it.needs) expect(ids, `${where} ${it.id} needs unknown ${n}`).toContain(n);
          // the authored (scrambled) order must NOT already be a valid answer
          expect(evaluateAnswer(q, { kind: 'order', ids }).correct, `${where} is already in a valid order`).toBe(false);
        }
        if (q.kind === 'judged') expect(Object.keys(judges), `${where} judge ${q.judgeId}`).toContain(q.judgeId);
      }
    });

    it('every remedial link points at real teaching content', () => {
      const missing: string[] = [];
      const check = (id: string | undefined, where: string) => { if (id && !targets.has(id)) missing.push(`${where}->${id}`); };
      for (const { where, q } of questions) {
        if (q.kind === 'numeric') { check(q.defaultFeedback.refresherId, where); q.rules?.forEach((r) => check(r.entry.refresherId, where)); }
        else if (q.kind === 'choice' || q.kind === 'visual') { Object.values(q.feedback).forEach((f) => check(f.refresherId, where)); if (q.kind === 'visual') check(q.defaultFeedback.refresherId, where); }
      }
      for (const l of Object.values(chapter.lessons)) l.reflection.stillConfusing.forEach((c) => check(c.refresherId, `${l.id}/reflection`));
      expect(missing).toEqual([]);
    });

    it('each question accepts its own correct answer and rejects every authored wrong answer with that answer’s own message', () => {
      for (const { where, q } of questions) {
        if (q.kind === 'choice') {
          expect(evaluateAnswer(q, { kind: 'choice', id: q.correctId }).correct, where).toBe(true);
          for (const [id, f] of Object.entries(q.feedback)) { const ev = evaluateAnswer(q, { kind: 'choice', id }); expect(ev.correct).toBe(false); expect(ev.message).toBe(f.message); }
        } else if (q.kind === 'numeric') {
          expect(evaluateAnswer(q, { kind: 'numeric', text: String(q.answer) }).correct, where).toBe(true);
          for (const r of q.rules ?? []) for (const v of r.values) { const ev = evaluateAnswer(q, { kind: 'numeric', text: String(v) }); expect(ev.correct, `${where} ${v}`).toBe(false); expect(ev.message).toBe(r.entry.message); }
        } else if (q.kind === 'visual') {
          expect(evaluateAnswer(q, { kind: 'visual', id: q.correctId }).correct, where).toBe(true);
          for (const [id, f] of Object.entries(q.feedback)) expect(evaluateAnswer(q, { kind: 'visual', id }).message).toBe(f.message);
        }
      }
    });

    it('mastery rules are consistent across lessons', () => {
      for (const l of Object.values(chapter.lessons)) expect(l.independent.length * 0.7, l.id).toBeGreaterThan(1);
    });
  });
}
