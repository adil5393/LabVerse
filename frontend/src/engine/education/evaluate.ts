/**
 * Answer evaluation for every question kind (EDU-1). Pure and chapter-neutral.
 * Wrong answers never produce a bare "Incorrect": they return the specific
 * explanation attached to that kind of mistake.
 */

import type { AnswerInput, Evaluation, FeedbackEntry, Question } from './types';

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

export function evaluateAnswer(q: Question, input: AnswerInput): Evaluation {
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
  }
}
