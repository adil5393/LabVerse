/**
 * Answer evaluation for every question kind (EDU-1). Pure and chapter-neutral.
 * Wrong answers never produce a bare "Incorrect": they return the specific
 * explanation attached to that kind of mistake.
 */

import type { AnswerInput, Evaluation, FeedbackEntry, JudgeRegistry, OrderItem, Question } from './types';

/** Parse "12", "-3.5", "1/2", " 7 ". Returns null for anything else (no NaN, no Infinity). */
export function parseNumberInput(text: string): number | null {
  const t = text.trim().replace(/,/g, '');
  if (t === '') return null;
  const frac = /^([+-]?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(t);
  if (frac) {
    const d = Number(frac[2]);
    return d === 0 ? null : Number(frac[1]) / d;
  }
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(t)) return null;
  const v = Number(t);
  return Number.isFinite(v) ? v : null;
}

const fromEntry = (e: FeedbackEntry): Pick<Evaluation, 'message' | 'refresherId' | 'misconception'> => ({
  message: e.message,
  refresherId: e.refresherId,
  misconception: e.misconception,
});

/** Is `ids` a valid order: every step once, each after everything it needs? */
export function evaluateOrder(items: OrderItem[], ids: string[], explanation: string): Evaluation {
  const known = new Map(items.map((i) => [i.id, i]));
  if (ids.length !== items.length || new Set(ids).size !== ids.length || ids.some((id) => !known.has(id))) {
    return { correct: false, invalid: true, message: 'Place every step exactly once.' };
  }
  const placed = new Set<string>();
  for (let i = 0; i < ids.length; i++) {
    const item = known.get(ids[i])!;
    const missing = item.needs.find((n) => !placed.has(n));
    if (missing) {
      return {
        correct: false,
        message: `Step ${i + 1}, \u201C${item.text}\u201D, relies on \u201C${known.get(missing)?.text ?? missing}\u201D, which has not been placed before it. A step can only use what is already established.`,
        misconception: 'step_before_support',
      };
    }
    placed.add(item.id);
  }
  return { correct: true, message: explanation };
}

export function evaluateAnswer(q: Question, input: AnswerInput, judges?: JudgeRegistry): Evaluation {
  switch (q.kind) {
    case 'choice': {
      if (input.kind !== 'choice') return { correct: false, invalid: true, message: 'Choose one of the options.' };
      if (input.id === q.correctId) return { correct: true, message: q.explanation };
      const f = q.feedback[input.id];
      return { correct: false, ...(f ? fromEntry(f) : { message: 'Not quite. Re-read the question and look at the options again.' }) };
    }
    case 'visual': {
      if (input.kind !== 'visual') return { correct: false, invalid: true, message: 'Answer by choosing on the diagram.' };
      if (input.id === q.correctId) return { correct: true, message: q.explanation };
      return { correct: false, ...fromEntry(q.feedback[input.id] ?? q.defaultFeedback) };
    }
    case 'order': {
      if (input.kind !== 'order') return { correct: false, invalid: true, message: 'Arrange the steps.' };
      return evaluateOrder(q.items, input.ids, q.explanation);
    }
    case 'judged': {
      if (input.kind !== 'numeric') return { correct: false, invalid: true, message: 'Type a whole number.' };
      const v = parseNumberInput(input.text);
      if (v === null || !Number.isInteger(v)) return { correct: false, invalid: true, message: 'Type a whole number, such as 12.' };
      const judge = judges?.[q.judgeId];
      if (!judge) return { correct: false, invalid: true, message: 'This question cannot be checked right now.' };
      const verdict = judge(v);
      return { ...verdict, message: verdict.correct ? q.explanation : verdict.message };
    }
    case 'numeric': {
      if (input.kind !== 'numeric') return { correct: false, invalid: true, message: 'Type a number.' };
      const v = parseNumberInput(input.text);
      if (v === null) return { correct: false, invalid: true, message: 'That is not a number. Use digits, a decimal point or a fraction like 3/2.' };
      const tol = q.tolerance ?? 1e-9;
      if (Math.abs(v - q.answer) <= tol) return { correct: true, message: q.explanation };
      const rule = q.rules?.find((r) => r.values.some((x) => Math.abs(x - v) <= tol));
      return { correct: false, ...fromEntry(rule ? rule.entry : q.defaultFeedback) };
    }
  }
}

/** The correct answer as readable text (for solution review). */
export function describeCorrectAnswer(q: Question): string {
  switch (q.kind) {
    case 'choice': return q.options.find((o) => o.id === q.correctId)?.text ?? q.correctId;
    case 'visual': return q.correctId;
    case 'numeric': return `${q.answer}${q.unit ? ` ${q.unit}` : ''}`;
    case 'order': return q.items.map((i) => i.text).join(' \u2192 ');
    case 'judged': return 'a number that satisfies the condition';
  }
}
