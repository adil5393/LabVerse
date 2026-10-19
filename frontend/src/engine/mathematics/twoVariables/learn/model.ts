/**
 * Two Variables, One Line: the single mathematical model behind every Learn
 * graph, table, substitution check, text alternative and answer (EDU-1M5).
 *
 * It only composes the existing exact-rational engine (linearEquation.ts,
 * rational.ts, graphMath.ts); the drawing displays what is computed here, so the
 * graph, the table and the answer checker cannot disagree.
 */

import {
  evaluate, formatGeneral, formatSlopeIntercept, formatStandard, lineKind, makeEq, slope, solveForX, solveForY, validateEquation, xIntercept, yIntercept,
  type LinearEq,
} from '../linearEquation';
import { abs, add, div, eq as rEq, formatRational, fromNumberFixed, isInteger, isZero, mul, neg, parseRational, rat, sub, toNumber, ZERO, type Rational } from '../rational';

export type { LinearEq, Rational };
export { makeEq, formatStandard, formatGeneral, formatSlopeIntercept, formatRational, fromNumberFixed, rat, toNumber };

/** A student-facing number (a true minus sign for negatives): whole or a fraction such as 9/2. Parse input with parseNum. */
export const fmt = (r: Rational): string => (r.d === 1 ? String(r.n) : `${r.n}/${r.d}`).replace('-', '−');
const bracket = (r: Rational): string => (r.n < 0 ? `(${fmt(r)})` : fmt(r));
export const parseNum = (text: string): Rational | null => parseRational(text.replace(/−/g, '-'));
export const num = (v: number, places = 2): Rational => fromNumberFixed(v, places);

// ---------------------------------------------------------------------------
// Is an ordered pair a solution?
// ---------------------------------------------------------------------------

export interface PairCheck {
  x: Rational;
  y: Rational;
  /** a·x + b·y, the left-hand side of ax + by = k */
  lhs: Rational;
  /** k = −c, the right-hand side of ax + by = k */
  rhs: Rational;
  satisfies: boolean;
  /** Step-by-step substitution, ready to show. */
  steps: string[];
}

export function checkPair(e: LinearEq, x: Rational, y: Rational): PairCheck {
  const lhs = add(mul(e.a, x), mul(e.b, y));
  const rhs = neg(e.c);
  const satisfies = isZero(evaluate(e, x, y));
  const steps = [
    `Put x = ${fmt(x)} and y = ${fmt(y)} into ${formatStandard(e)}.`,
    `Left side: ${fmt(e.a)} × ${bracket(x)} + ${bracket(e.b)} × ${bracket(y)} = ${fmt(lhs)}.`,
    `Right side: ${fmt(rhs)}.`,
    satisfies ? `${fmt(lhs)} = ${fmt(rhs)}, so (${fmt(x)}, ${fmt(y)}) is a solution.` : `${fmt(lhs)} ≠ ${fmt(rhs)}, so (${fmt(x)}, ${fmt(y)}) is not a solution.`,
  ];
  return { x, y, lhs, rhs, satisfies, steps };
}

/** The same numbers in the other order: (y, x). Used to show that order matters. */
export const reversedCheck = (e: LinearEq, x: Rational, y: Rational): PairCheck => checkPair(e, y, x);

// ---------------------------------------------------------------------------
// Tables of values
// ---------------------------------------------------------------------------

export interface TableRow {
  /** The value the student chose. */
  input: Rational;
  /** Which variable was chosen. */
  chosen: 'x' | 'y';
  /** The computed partner, or null when there is none or it is not unique. */
  other: Rational | null;
  kind: 'unique' | 'any' | 'none';
  /** The solution as an ordered pair when unique. */
  pair: { x: Rational; y: Rational } | null;
}

/** Which variable can be chosen freely: x unless the line is vertical (b = 0), then y. */
export function chosenVariable(e: LinearEq): 'x' | 'y' {
  return isZero(e.b) ? 'y' : 'x';
}

export function tableRows(e: LinearEq, inputs: Rational[]): TableRow[] {
  const chosen = chosenVariable(e);
  return inputs.map((input) => {
    const r = chosen === 'x' ? solveForY(e, input) : solveForX(e, input);
    const other = r.kind === 'unique' ? r.value : null;
    const pair = other === null ? null : chosen === 'x' ? { x: input, y: other } : { x: other, y: input };
    return { input, chosen, other, kind: r.kind, pair };
  });
}

// ---------------------------------------------------------------------------
// The line and what can be said about it
// ---------------------------------------------------------------------------

export interface LineFacts {
  valid: boolean;
  kind: ReturnType<typeof lineKind>;
  message: string;
  xInt: Rational | null;
  yInt: Rational | null;
  slope: Rational | null;
  throughOrigin: boolean;
  standard: string;
  general: string;
  slopeIntercept: string;
}

export function lineFacts(e: LinearEq): LineFacts {
  const v = validateEquation(e);
  const xi = xIntercept(e), yi = yIntercept(e);
  return {
    valid: v.valid, kind: lineKind(e), message: v.message,
    xInt: xi.kind === 'point' ? xi.value : null, yInt: yi.kind === 'point' ? yi.value : null,
    slope: slope(e), throughOrigin: v.valid && isZero(e.c),
    standard: formatStandard(e), general: formatGeneral(e), slopeIntercept: formatSlopeIntercept(e),
  };
}

export type Restrict = 'none' | 'nonneg' | 'whole';

/** Is a solution also a sensible answer to the real-world question? */
export function meaningful(x: Rational, y: Rational, restrict: Restrict): boolean {
  if (restrict === 'none') return true;
  const nonneg = x.n >= 0 && y.n >= 0;
  return restrict === 'nonneg' ? nonneg : nonneg && isInteger(x) && isInteger(y);
}

/** Every solution (x, y) with whole x in [lo, hi] and y a whole number too, found by testing each x. */
export function wholeSolutions(e: LinearEq, lo: number, hi: number, nonneg = true): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  if (!validateEquation(e).valid || isZero(e.b)) return out;
  for (let x = lo; x <= hi; x++) {
    const r = solveForY(e, rat(x));
    if (r.kind === 'unique' && isInteger(r.value) && (!nonneg || r.value.n >= 0)) out.push({ x, y: r.value.n });
  }
  return out;
}

/** Slope through two points of the line, from their coordinates (rise over run), exact. */
export function riseRun(p: { x: Rational; y: Rational }, q: { x: Rational; y: Rational }): { rise: Rational; run: Rational; slope: Rational | null } {
  const rise = sub(q.y, p.y), run = sub(q.x, p.x);
  return { rise, run, slope: isZero(run) ? null : div(rise, run) };
}

/** Points of the line with the given x, as a pair, or null. */
export function pointOnLine(e: LinearEq, x: Rational): { x: Rational; y: Rational } | null {
  const r = solveForY(e, x);
  return r.kind === 'unique' ? { x, y: r.value } : null;
}

export const inWindow = (x: Rational, y: Rational, extent: number): boolean => Math.abs(toNumber(x)) <= extent && Math.abs(toNumber(y)) <= extent;

/** Text alternative generated from the equation itself. */
export function describeLine(intro: string, e: LinearEq, extent = 10): string {
  const f = lineFacts(e);
  if (!f.valid) return `${intro} The equation ${f.standard} has a = 0 and b = 0, so it is not a linear equation in two variables and has no line.`;
  const parts: string[] = [`${intro} The graph of ${f.standard} (${f.general}) is a straight line.`];
  if (f.kind === 'vertical') parts.push(`It is vertical: every point has x = ${fmt(neg(div(e.c, e.a)))}.`);
  else if (f.kind === 'horizontal') parts.push(`It is horizontal: every point has y = ${fmt(neg(div(e.c, e.b)))}.`);
  else {
    const s = f.slope!;
    parts.push(`It slopes ${s.n > 0 ? 'upward' : 'downward'} from left to right (slope ${fmt(s)}).`);
  }
  if (f.xInt) parts.push(`It crosses the x-axis at (${fmt(f.xInt)}, 0).`);
  if (f.yInt) parts.push(`It crosses the y-axis at (0, ${fmt(f.yInt)}).`);
  parts.push(`The graph window shows x and y from ${-extent} to ${extent}.`);
  return parts.join(' ');
}

export const absR = abs;
export const zero = ZERO;
export const same = rEq;
