/**
 * Linear equations a·x + b·y + c = 0 with exact rational coefficients.
 * Degenerate combinations (a = b = 0) are reported explicitly and never
 * drawn as a line. Nothing here divides by b without checking b ≠ 0.
 */

import {
  type Rational,
  ZERO,
  ONE,
  add,
  sub,
  mul,
  div,
  neg,
  abs,
  isZero,
  eq as rEq,
  toNumber,
  formatRational,
  rat,
  parseRational,
  fromNumberFixed,
} from './rational';

export interface LinearEq {
  readonly a: Rational;
  readonly b: Rational;
  readonly c: Rational;
}

export const makeEq = (a: number | Rational, b: number | Rational, c: number | Rational): LinearEq => ({
  a: typeof a === 'number' ? rat(a) : a,
  b: typeof b === 'number' ? rat(b) : b,
  c: typeof c === 'number' ? rat(c) : c,
});

export type LineKind =
  | 'vertical'
  | 'horizontal'
  | 'oblique'
  | 'degenerate_identity'
  | 'degenerate_contradiction';

export function lineKind(e: LinearEq): LineKind {
  const aZero = isZero(e.a);
  const bZero = isZero(e.b);
  if (aZero && bZero) return isZero(e.c) ? 'degenerate_identity' : 'degenerate_contradiction';
  if (bZero) return 'vertical';
  if (aZero) return 'horizontal';
  return 'oblique';
}

export interface Validation {
  valid: boolean;
  message: string;
}

export function validateEquation(e: LinearEq): Validation {
  switch (lineKind(e)) {
    case 'degenerate_identity':
      return {
        valid: false,
        message: 'a and b are both 0 and c = 0: the statement 0 = 0 is true for every point, so it is not a line.',
      };
    case 'degenerate_contradiction':
      return {
        valid: false,
        message: 'a and b are both 0 but c ≠ 0: the statement is never true, so it has no graph.',
      };
    default:
      return { valid: true, message: 'Valid linear equation in two variables.' };
  }
}

export const isLine = (e: LinearEq): boolean => validateEquation(e).valid;

/** a·x + b·y + c as an exact value; zero ⇔ (x, y) is an exact solution. */
export function evaluate(e: LinearEq, x: Rational, y: Rational): Rational {
  return add(add(mul(e.a, x), mul(e.b, y)), e.c);
}

export const isExactSolution = (e: LinearEq, x: Rational, y: Rational): boolean =>
  isLine(e) && isZero(evaluate(e, x, y));

export type PointStatus = 'exact' | 'approximate' | 'not_solution';

/**
 * Classify a point given as floats. A residual of (numerically) zero is
 * exact; a small non-zero residual is only an approximation; the rest fail.
 * Tolerance is a perpendicular distance in graph units.
 */
export function classifyFloatPoint(
  e: LinearEq,
  x: number,
  y: number,
  tol = 0.05
): { status: PointStatus; residual: number } {
  const residual = toNumber(e.a) * x + toNumber(e.b) * y + toNumber(e.c);
  const len = Math.hypot(toNumber(e.a), toNumber(e.b)) || 1;
  const dist = Math.abs(residual) / len;
  if (dist <= 1e-12) return { status: 'exact', residual };
  return { status: dist <= tol ? 'approximate' : 'not_solution', residual };
}

export interface DecimalPointCheck {
  status: PointStatus;
  /** Exact value of a·x + b·y + c for the decimals shown to the student. */
  residual: Rational;
  x: Rational;
  y: Rational;
  /** Perpendicular distance from the line, in graph units (display only). */
  distance: number;
}

/**
 * Check a point whose coordinates are shown to `places` decimals. The decimals
 * are converted to exact rationals first, so "exact" means exactly zero
 * residual — never a floating-point coincidence — while a small non-zero
 * residual is reported as an approximation only.
 */
export function classifyDecimalPoint(e: LinearEq, px: number, py: number, places = 1, tol = 0.15): DecimalPointCheck {
  const x = fromNumberFixed(px, places);
  const y = fromNumberFixed(py, places);
  const residual = evaluate(e, x, y);
  const len = Math.hypot(toNumber(e.a), toNumber(e.b)) || 1;
  const distance = Math.abs(toNumber(residual)) / len;
  const status: PointStatus = isLine(e) && residual.n === 0 ? 'exact' : isLine(e) && distance <= tol ? 'approximate' : 'not_solution';
  return { status, residual, x, y, distance };
}

export type Intercept = { kind: 'point'; value: Rational } | { kind: 'none' } | { kind: 'whole_axis' };

/** Where the line meets the x-axis (y = 0): x = −c/a. */
export function xIntercept(e: LinearEq): Intercept {
  if (!isLine(e)) return { kind: 'none' };
  if (isZero(e.a)) return isZero(e.c) ? { kind: 'whole_axis' } : { kind: 'none' };
  return { kind: 'point', value: neg(div(e.c, e.a)) };
}

/** Where the line meets the y-axis (x = 0): y = −c/b. */
export function yIntercept(e: LinearEq): Intercept {
  if (!isLine(e)) return { kind: 'none' };
  if (isZero(e.b)) return isZero(e.c) ? { kind: 'whole_axis' } : { kind: 'none' };
  return { kind: 'point', value: neg(div(e.c, e.b)) };
}

/** Slope −a/b, or null when the line is vertical (undefined) or degenerate. */
export function slope(e: LinearEq): Rational | null {
  if (!isLine(e) || isZero(e.b)) return null;
  return neg(div(e.a, e.b));
}

export type SolveResult = { kind: 'unique'; value: Rational } | { kind: 'any' } | { kind: 'none' };

/** Given x, find y. On a vertical line y is free (or no y works if x is off the line). */
export function solveForY(e: LinearEq, x: Rational): SolveResult {
  if (!isLine(e)) return { kind: 'none' };
  if (!isZero(e.b)) return { kind: 'unique', value: neg(div(add(mul(e.a, x), e.c), e.b)) };
  return isZero(evaluate(e, x, ZERO)) ? { kind: 'any' } : { kind: 'none' };
}

/** Given y, find x. On a horizontal line x is free (or none). */
export function solveForX(e: LinearEq, y: Rational): SolveResult {
  if (!isLine(e)) return { kind: 'none' };
  if (!isZero(e.a)) return { kind: 'unique', value: neg(div(add(mul(e.b, y), e.c), e.a)) };
  return isZero(evaluate(e, ZERO, y)) ? { kind: 'any' } : { kind: 'none' };
}

/** Multiply every coefficient by k ≠ 0; the solution set is unchanged. */
export function scaleEq(e: LinearEq, k: Rational): LinearEq {
  if (isZero(k)) throw new RangeError('Cannot multiply an equation by 0: that would destroy information.');
  return { a: mul(e.a, k), b: mul(e.b, k), c: mul(e.c, k) };
}

export const addEq = (p: LinearEq, q: LinearEq): LinearEq => ({
  a: add(p.a, q.a),
  b: add(p.b, q.b),
  c: add(p.c, q.c),
});
export const subEq = (p: LinearEq, q: LinearEq): LinearEq => ({
  a: sub(p.a, q.a),
  b: sub(p.b, q.b),
  c: sub(p.c, q.c),
});

/** True when both equations describe exactly the same set of points. */
export function sameLine(p: LinearEq, q: LinearEq): boolean {
  if (!isLine(p) || !isLine(q)) return false;
  return (
    isZero(sub(mul(p.a, q.b), mul(q.a, p.b))) &&
    isZero(sub(mul(p.a, q.c), mul(q.a, p.c))) &&
    isZero(sub(mul(p.b, q.c), mul(q.b, p.c)))
  );
}

/** Pretty-print a term like "2x", "−y", "(1/2)x" (never prints a coefficient of 1). */
function term(coef: Rational, v: string, first: boolean): string {
  if (isZero(coef)) return '';
  const negative = coef.n < 0;
  const mag = abs(coef);
  let body: string;
  if (rEq(mag, ONE)) body = v;
  else if (mag.d === 1) body = `${mag.n}${v}`;
  else body = `(${mag.n}/${mag.d})${v}`;
  if (first) return negative ? `−${body}` : body;
  return negative ? ` − ${body}` : ` + ${body}`;
}

/** Standard-form text with the constant on the right: "2x + 3y = 12". */
export function formatStandard(e: LinearEq): string {
  const kind = lineKind(e);
  if (kind === 'degenerate_identity') return '0 = 0';
  if (kind === 'degenerate_contradiction') return `0 = ${formatRational(neg(e.c))}`;
  const lhs = term(e.a, 'x', true) + term(e.b, 'y', isZero(e.a));
  return `${lhs} = ${formatRational(neg(e.c))}`;
}

/** The ax + by + c = 0 presentation. */
export function formatGeneral(e: LinearEq): string {
  const lhs = term(e.a, 'x', true) + term(e.b, 'y', isZero(e.a)) || '0';
  const c = isZero(e.c) ? '' : e.c.n < 0 ? ` − ${formatRational(abs(e.c))}` : ` + ${formatRational(e.c)}`;
  return `${lhs}${c} = 0`;
}

/** y = mx + k, x = h, or y = k depending on the line. */
export function formatSlopeIntercept(e: LinearEq): string {
  const kind = lineKind(e);
  if (kind === 'vertical') return `x = ${formatRational(neg(div(e.c, e.a)))}`;
  if (kind === 'horizontal') return `y = ${formatRational(neg(div(e.c, e.b)))}`;
  if (kind !== 'oblique') return formatStandard(e);
  const m = neg(div(e.a, e.b));
  const k = neg(div(e.c, e.b));
  const mText = rEq(m, ONE) ? 'x' : rEq(m, rat(-1)) ? '−x' : m.d === 1 ? `${m.n}x` : `(${m.n}/${m.d})x`;
  if (isZero(k)) return `y = ${mText}`;
  return `y = ${mText}${k.n < 0 ? ' − ' : ' + '}${formatRational(abs(k))}`;
}

export interface ParseResult {
  ok: boolean;
  equation?: LinearEq;
  error?: string;
}

interface Side {
  x: Rational;
  y: Rational;
  k: Rational;
}

function parseSide(text: string): Side | string {
  const s = text
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .toLowerCase();
  if (s === '') return 'One side of the equation is empty.';
  if (!/^[0-9.+\-/()xy]+$/.test(s)) return 'Use only numbers, x, y, + and −.';
  const side: Side = { x: ZERO, y: ZERO, k: ZERO };
  // sign, optional coefficient (n | n.m | n/m | (n/m)), optional variable, optional "/n" divisor
  const re =
    /([+-]?)(?:\((\d+(?:\.\d+)?\/\d+(?:\.\d+)?)\)|(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?))?([xy])?(?:\/(\d+(?:\.\d+)?))?/y;
  let pos = 0;
  while (pos < s.length) {
    re.lastIndex = pos;
    const m = re.exec(s);
    if (!m || m[0] === '') return `Could not read "${s.slice(pos)}".`;
    const start = pos;
    pos = re.lastIndex;
    const coefText = m[2] ?? m[3];
    const varName = m[4];
    if (coefText === undefined && varName === undefined) return `Could not read "${s.slice(start)}".`;
    let coef = coefText === undefined ? ONE : parseRational(coefText);
    if (!coef) return `"${coefText}" is not a valid number.`;
    if (m[5] !== undefined) {
      const dv = parseRational(m[5]);
      if (!dv || isZero(dv)) return 'Cannot divide by zero.';
      coef = div(coef, dv);
    }
    if (m[1] === '-') coef = neg(coef);
    if (varName === 'x') side.x = add(side.x, coef);
    else if (varName === 'y') side.y = add(side.y, coef);
    else side.k = add(side.k, coef);
    // Terms must be separated by + or −; "xy" or "2x3" is not a linear expression.
    if (pos < s.length && s[pos] !== '+' && s[pos] !== '-') {
      return `Terms must be separated by + or −; found "${s.slice(start, pos + 1)}".`;
    }
  }
  return side;
}

/** Parse text like "2x + 3y = 12", "x = 4", "y = -x/2 + 1" into a·x + b·y + c = 0. */
export function parseEquation(text: string): ParseResult {
  const parts = text.split('=');
  if (parts.length !== 2) return { ok: false, error: 'An equation needs exactly one "=" sign.' };
  try {
    const l = parseSide(parts[0]);
    const r = parseSide(parts[1]);
    if (typeof l === 'string') return { ok: false, error: l };
    if (typeof r === 'string') return { ok: false, error: r };
    return { ok: true, equation: { a: sub(l.x, r.x), b: sub(l.y, r.y), c: sub(l.k, r.k) } };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not read the equation.' };
  }
}

/** Is this text a linear equation in two variables (at least one variable present)? */
export function isLinearEquationInTwoVariablesText(text: string): boolean {
  const p = parseEquation(text);
  return Boolean(p.ok && p.equation && isLine(p.equation));
}
