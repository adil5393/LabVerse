/**
 * Small authoring helpers shared by chapters (EDU-1Q). They only build the
 * plain-data question types in `types.ts`; nothing here knows any chapter.
 */

import type {
  ChoiceQuestion, FeedbackEntry, IndependentItem, NumericQuestion, NumericRule, OrderItem, OrderQuestion, PracticeSet, Question, VisualRef,
} from './types';

/** `options` are [text, why-it-is-wrong | null for the right option, optional mistake tag]. */
export function pick(id: string, prompt: string, options: [string, string | null, string?][], explanation: string, visual?: VisualRef, refresherId?: string): ChoiceQuestion {
  const opts = options.map(([text], i) => ({ id: `o${i}`, text }));
  const correct = options.findIndex(([, why]) => why === null);
  if (correct < 0) throw new Error(`question ${id} has no correct option`);
  const feedback: Record<string, FeedbackEntry> = {};
  options.forEach(([, why, tag], i) => { if (why !== null) feedback[`o${i}`] = { message: why, refresherId, misconception: tag }; });
  return { kind: 'choice', id, prompt, visual, options: opts, correctId: `o${correct}`, feedback, explanation };
}

export interface NumOpts {
  unit?: string;
  tolerance?: number;
  visual?: VisualRef;
  refresherId?: string;
  /** [wrong values, explanation, optional mistake tag] */
  rules?: [number[], string, string?][];
  wrong?: string;
}

export function num(id: string, prompt: string, answer: number, explanation: string, o: NumOpts = {}): NumericQuestion {
  const rules: NumericRule[] = (o.rules ?? []).map(([values, message, misconception]) => ({ values, entry: { message, refresherId: o.refresherId, misconception } }));
  return {
    kind: 'numeric', id, prompt, visual: o.visual, answer, tolerance: o.tolerance ?? 0.01, unit: o.unit, rules,
    defaultFeedback: { message: o.wrong ?? 'That is not the value. Re-read what is given and what is asked, then work it out step by step.', refresherId: o.refresherId },
    explanation,
  };
}

export function ord(id: string, prompt: string, items: OrderItem[], scramble: string[], explanation: string, visual?: VisualRef): OrderQuestion {
  const byId = new Map(items.map((i) => [i.id, i]));
  return { kind: 'order', id, prompt, visual, items: scramble.map((k) => byId.get(k)!), explanation };
}

export const ind = (id: string, topic: string, objective: string | undefined, prompt: string, question: Question, hints: string[], solution: string[]): IndependentItem => ({ id, topic, objective, prompt, question, hints, solution });

/** Attaches a diagram to the worked solution of the practice items named in `diagrams` (by item id). */
export function withSolutionDiagrams(set: PracticeSet, diagrams: Record<string, VisualRef>): PracticeSet {
  return { ...set, groups: set.groups.map((g) => ({ ...g, items: g.items.map((it) => (diagrams[it.id] ? { ...it, solutionVisual: diagrams[it.id] } : it)) })) };
}
