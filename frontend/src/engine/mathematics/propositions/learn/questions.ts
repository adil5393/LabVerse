/**
 * Question factories for the Propositions lessons (EDU-1P).
 * Truth values, counterexamples and counts are computed from the same Claim and
 * geometry data the diagrams use; wrong-answer explanations quote them.
 */

import type { ChoiceQuestion, FeedbackEntry, JudgeRegistry, JudgedQuestion, NumericQuestion, OrderItem, OrderQuestion, VisualRef } from '../../../education/types';
import { getFactors, isPrime } from '../numberPredicates';
import {
  CLAIMS, claimSentence, combinationOf, converseOf, judgeCounterexample, predPhrase, smallestCounterexample, type Claim, type Combination, type Pred,
} from './logic';
import { factsFromSticks, withArticle, type SticksSpec } from './geometry';

// ---------------------------------------------------------------------------
// Visual references with generated text alternatives
// ---------------------------------------------------------------------------

const list = (xs: number[], cap = 10) => (xs.length === 0 ? 'none' : xs.slice(0, cap).join(', ') + (xs.length > cap ? ', and more' : ''));

export function gridAlt(P: Pred, Q: Pred, max: number, converse = false): string {
  const A = converse ? Q : P, B = converse ? P : Q;
  const all = Array.from({ length: max }, (_, i) => i + 1);
  const inA = all.filter((n) => evalSafe(A, n)), inB = all.filter((n) => evalSafe(B, n));
  const bad = inA.filter((n) => !evalSafe(B, n));
  return `A grid of the numbers 1 to ${max}. First part (n ${predPhrase(A)}) is true for: ${list(inA)}. Second part (n ${predPhrase(B)}) is true for: ${list(inB)}. Numbers where the first part is true and the second is false: ${list(bad)}.`;
}

import { evalPred } from './logic';
const evalSafe = (p: Pred, n: number) => evalPred(p, n);

export interface GridOpts { max?: number; toggle?: boolean; converse?: boolean; start?: number; single?: boolean }

export const gridVisual = (P: Pred, Q: Pred, o: GridOpts = {}): VisualRef => {
  const max = o.max ?? 60;
  return { kind: 'numberGrid', props: { P, Q, max, toggle: o.toggle ?? false, converse: o.converse ?? false, ...(o.start ? { start: o.start } : {}), ...(o.single ? { single: true } : {}) }, alt: o.single ? `A grid of the numbers 1 to ${max}. The condition "n ${predPhrase(P)}" is true for: ${list(Array.from({ length: max }, (_, i) => i + 1).filter((n) => evalPred(P, n)))}.` : gridAlt(P, Q, max, o.converse) };
};

export const claimGrid = (c: Pick<Claim, 'P' | 'Q'>, o: GridOpts = {}): VisualRef => gridVisual(c.P, c.Q, o);

// ---------------------------------------------------------------------------
// Generic choice builder
// ---------------------------------------------------------------------------

export function pick(id: string, prompt: string, options: [string, string | null, string?][], explanation: string, visual?: VisualRef, refresherId?: string): ChoiceQuestion {
  const opts = options.map(([text], i) => ({ id: `o${i}`, text }));
  const correct = options.findIndex(([, why]) => why === null);
  if (correct < 0) throw new Error(`question ${id} has no correct option`);
  const feedback: Record<string, FeedbackEntry> = {};
  options.forEach(([, why, tag], i) => { if (why !== null) feedback[`o${i}`] = { message: why, refresherId, misconception: tag }; });
  return { kind: 'choice', id, prompt, visual, options: opts, correctId: `o${correct}`, feedback, explanation };
}

// ---------------------------------------------------------------------------
// Claims: truth, converse truth, combination, counterexample
// ---------------------------------------------------------------------------

export function counterexampleJudgeId(c: Claim): string { return `counter:${c.id}`; }

/** Judges for every claim and its converse: "is this number a counterexample?" */
export function buildJudges(refresherId?: string): JudgeRegistry {
  const out: JudgeRegistry = {};
  for (const c of Object.values(CLAIMS)) {
    out[`counter:${c.id}`] = (n) => judgeCounterexample(c, n, refresherId);
    const cv = converseOf(c);
    out[`counter:${cv.id}`] = (n) => judgeCounterexample(cv, n, refresherId);
  }
  return out;
}

export function counterQ(id: string, c: Claim, visual?: VisualRef): JudgedQuestion {
  if (c.holds) throw new Error(`${c.id} is true: it has no counterexample`);
  return {
    kind: 'judged', id,
    prompt: `${claimSentence(c)} This claim is false. Type a positive whole number that is a counterexample.`,
    visual,
    judgeId: counterexampleJudgeId(c),
    explanation: `Yes. A counterexample makes the first part true and the second part false. ${c.whyForward}`,
  };
}

/** Is the statement (or its converse) true or false? Wrong answers quote the counterexample or the reason. */
export function truthQ(id: string, c0: Claim, which: 'statement' | 'converse', refresherId?: string, visual?: VisualRef): ChoiceQuestion {
  const c = which === 'converse' ? converseOf(c0) : c0;
  const ce = smallestCounterexample(c);
  const sentence = claimSentence(c);
  return pick(id, `Is this statement true or false?\n${sentence}`, c.holds
    ? [
      ['True: it holds for every positive integer', null],
      ['False: some number is a counterexample', `There is no counterexample. ${c.whyForward} Checking small numbers shows only that nothing failed yet; the reason above is what makes it true for all of them.`, 'false_without_counterexample'],
    ]
    : [
      ['True: it holds for every positive integer', `It does not. ${ce} is a counterexample: n ${predPhrase(c.P)}, but n does not satisfy "${predPhrase(c.Q)}". One counterexample is enough to make the statement false. ${c.whyForward}`, 'checked_few_examples'],
      ['False: some number is a counterexample', null],
    ],
  c.holds ? `True. ${c.whyForward}` : `False. ${ce} is a counterexample. ${c.whyForward}`, visual, refresherId);
}

const COMBO_TEXT: Record<Combination, string> = {
  'both-true': 'Both the statement and its converse are true',
  'true-false': 'The statement is true but its converse is false',
  'false-true': 'The statement is false but its converse is true',
  'both-false': 'Both the statement and its converse are false',
};

export function combinationQ(id: string, c: Claim, refresherId?: string, visual?: VisualRef): ChoiceQuestion {
  const right = combinationOf(c);
  const cv = converseOf(c);
  const options = (Object.keys(COMBO_TEXT) as Combination[]).map((k): [string, string | null, string?] => {
    if (k === right) return [COMBO_TEXT[k], null];
    const claimedStatement = k === 'both-true' || k === 'true-false';
    const claimedConverse = k === 'both-true' || k === 'false-true';
    const bits: string[] = [];
    if (claimedStatement !== c.holds) bits.push(c.holds ? `the statement is true (${c.whyForward})` : `the statement is false (${smallestCounterexample(c)} is a counterexample)`);
    if (claimedConverse !== c.converseHolds) bits.push(c.converseHolds ? `the converse is true (${c.whyConverse})` : `the converse is false (${smallestCounterexample(cv)} is a counterexample to it)`);
    return [COMBO_TEXT[k], `Check each part separately: ${bits.join('; and ')}.`, 'converse_assumed_same_truth'];
  });
  return pick(id, `For positive integers, look at the statement and its converse:\n• ${claimSentence(c)}\n• ${claimSentence(cv)}\nWhich is right?`, options, `${COMBO_TEXT[right]}. Statement: ${c.holds ? c.whyForward : `${smallestCounterexample(c)} is a counterexample`}. Converse: ${c.converseHolds ? c.whyConverse : `${smallestCounterexample(cv)} is a counterexample`}.`, visual, refresherId);
}

// ---------------------------------------------------------------------------
// Hypothesis / conclusion / converse in words
// ---------------------------------------------------------------------------

export function partQ(id: string, sentence: string, hyp: string, concl: string, ask: 'hypothesis' | 'conclusion', extra: string[] = [], refresherId?: string): ChoiceQuestion {
  const rightText = ask === 'hypothesis' ? hyp : concl;
  const other = ask === 'hypothesis' ? concl : hyp;
  const opts: [string, string | null, string?][] = [
    [rightText, null],
    [other, `That is the ${ask === 'hypothesis' ? 'conclusion' : 'hypothesis'}. The hypothesis is the part after "if" (what is assumed); the conclusion is the part after "then" (what must follow).`, 'swapped_hypothesis_conclusion'],
    ...extra.map((e): [string, string, string] => [e, `That is not one of the two parts of the sentence. Read the sentence again and split it at "then".`, 'not_a_part']),
  ];
  return pick(id, `In the proposition "${sentence}", what is the ${ask}?`, opts, `The ${ask} is "${rightText}".`, undefined, refresherId);
}

export function converseQ(id: string, sentence: string, converse: string, wrongs: [string, string, string?][], refresherId?: string): ChoiceQuestion {
  return pick(id, `What is the converse of: "${sentence}"?`, [[converse, null], ...wrongs.map(([t, w, tag]): [string, string, string] => [t, w, tag ?? 'wrong_converse'])], `The converse swaps the two parts: "${converse}"`, undefined, refresherId);
}

// ---------------------------------------------------------------------------
// Ordering (proof steps)
// ---------------------------------------------------------------------------

/** `scrambled` lists item ids in the order they are first shown. */
export function orderQ(id: string, prompt: string, items: OrderItem[], scrambled: string[], explanation: string, visual?: VisualRef): OrderQuestion {
  const byId = new Map(items.map((i) => [i.id, i]));
  return { kind: 'order', id, prompt, visual, items: scrambled.map((s) => byId.get(s)!), explanation };
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

export function factorCountQ(id: string, n: number, refresherId?: string): NumericQuestion {
  const fs = getFactors(n);
  const rules = [] as NumericQuestion['rules'];
  const half = fs.length / 2;
  if (fs.length > 2) rules!.push({ values: [fs.length - 2], entry: { message: `${fs.length - 2} leaves out 1 and ${n} themselves. Factors include 1 and the number itself.`, refresherId, misconception: 'left_out_one_and_self' } });
  if (Number.isInteger(half) && half !== fs.length) rules!.push({ values: [half], entry: { message: `${half} counts the pairs, not the factors. Each pair gives two factors (unless the pair repeats).`, refresherId, misconception: 'counted_pairs' } });
  return {
    kind: 'numeric', id, prompt: `How many factors does ${n} have? (Count 1 and ${n} too.)`, answer: fs.length, rules: rules!.filter((r) => !r.values.includes(fs.length)),
    defaultFeedback: { message: `List the factor pairs of ${n}: for each f from 1 upward, check whether f divides ${n}, and write f together with ${n} ÷ f.`, refresherId },
    explanation: `The factors of ${n} are ${fs.join(', ')}: ${fs.length} of them.`,
  };
}

/** The first n >= 0 at which n^2 + n + c is not prime. */
export function firstFailure(c: number): number {
  for (let n = 0; n < 1000; n++) if (!isPrime(n * n + n + c)) return n;
  return -1;
}

export function firstFailureQ(id: string, c: number, refresherId?: string): NumericQuestion {
  const n = firstFailure(c);
  const v = n * n + n + c;
  const f = getFactors(v).filter((x) => x > 1 && x < v)[0];
  return {
    kind: 'numeric', id, prompt: `The expression n² + n + ${c} gives a prime for every n from 0 up to some point. For which n does it first give a number that is NOT prime? (Test with the strip above, or by hand.)`,
    answer: n,
    rules: [{ values: [n - 1], entry: { message: `n = ${n - 1} still gives a prime (${(n - 1) * (n - 1) + (n - 1) + c}). Look one step further.`, refresherId, misconception: 'off_by_one' } }, { values: [v], entry: { message: `${v} is the value of the expression. The question asks for the value of n that produces it.`, refresherId, misconception: 'value_for_n' } }],
    defaultFeedback: { message: 'Work out n² + n + ' + c + ' for n = 0, 1, 2, ... and check each result for a factor other than 1 and itself.', refresherId },
    explanation: `At n = ${n}: ${n}² + ${n} + ${c} = ${v} = ${f} × ${v / f}, which is not prime.`,
  };
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export function sticksVisual(s: SticksSpec, alt: string, extra: Partial<SticksSpec> = {}): VisualRef {
  return { kind: 'sticks', props: { ...s, ...extra }, alt };
}

export function sticksShapeQ(id: string, s: SticksSpec, refresherId?: string): ChoiceQuestion {
  const f = factsFromSticks(s);
  const names = ['rectangle', 'isosceles trapezium', 'parallelogram', 'rhombus'] as const;
  const right = f.name === 'square' ? 'rectangle' : f.name;
  const opts: [string, string | null, string?][] = names.map((n) => (n === right
    ? [`A ${n}`, null]
    : [`A ${n}`, `Check the angles and sides the diagram reports: this figure is ${f.name === 'other quadrilateral' ? 'not any of these' : withArticle(f.name)} (angles ${f.angles.map((a) => Math.round(a)).join('°, ')}°).`, 'shape_from_diagonals']));
  return pick(id, `Two sticks of lengths ${s.len1} and ${s.len2} cross with the crossing point ${Math.round(s.t1 * 100)}% along the first stick and ${Math.round(s.t2 * 100)}% along the second, at ${s.angle}°. Joining the ends gives a four-sided figure. What is it?`, opts,
    `It is ${withArticle(f.name)}. Diagonals ${f.diagonalsEqual ? 'are equal' : 'are not equal'} (${f.diagonalAC.toFixed(2)} and ${f.diagonalBD.toFixed(2)}); angles ${f.angles.map((a) => a.toFixed(0)).join('°, ')}°.`, sticksVisual(s, `Two sticks crossing: AC = ${s.len1}, BD = ${s.len2}, crossing ${Math.round(s.t1 * 100)}% along AC and ${Math.round(s.t2 * 100)}% along BD at ${s.angle} degrees. Their ends form quadrilateral ABCD.`), refresherId);
}
