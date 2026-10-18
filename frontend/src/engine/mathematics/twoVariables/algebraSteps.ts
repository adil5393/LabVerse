/**
 * Structured, mathematically checked algebra for solving a pair of linear
 * equations. Students pick operations from a closed set (no free-text algebra);
 * every operation is validated and every accepted step keeps the system
 * equivalent to the original, so the original solution satisfies every line.
 */

import { type Rational, ONE, add, mul, div, neg, isZero, formatRational, abs, eq as rEq } from './rational';
import { type LinearEq, formatStandard, scaleEq, addEq, subEq, isLine } from './linearEquation';
import { analyzeSystem, verifyPair, type SystemType } from './system';

export type Variable = 'x' | 'y';
const other = (v: Variable): Variable => (v === 'x' ? 'y' : 'x');
const coefOf = (e: LinearEq, v: Variable): Rational => (v === 'x' ? e.a : e.b);

export interface StepError {
  ok: false;
  error: string;
}

// ===========================================================================
// Substitution
// ===========================================================================

/** v = p·(other) + q */
export interface IsolatedExpression {
  variable: Variable;
  coefOther: Rational;
  constant: Rational;
}

export function formatExpression(e: IsolatedExpression): string {
  const o = other(e.variable);
  const parts: string[] = [];
  if (!isZero(e.coefOther)) {
    if (rEq(e.coefOther, ONE)) parts.push(o);
    else if (rEq(e.coefOther, neg(ONE))) parts.push(`−${o}`);
    else parts.push(`(${formatRational(e.coefOther)})${o}`);
  }
  if (!isZero(e.constant) || parts.length === 0) {
    const k = e.constant;
    if (parts.length === 0) parts.push(formatRational(k));
    else parts.push(`${k.n < 0 ? '− ' : '+ '}${formatRational(abs(k))}`);
  }
  return `${e.variable} = ${parts.join(' ')}`;
}

/** Make `variable` the subject of an equation. Rejects a zero coefficient. */
export function isolate(e: LinearEq, variable: Variable): IsolatedExpression | StepError {
  const k = coefOf(e, variable);
  if (isZero(k)) {
    return {
      ok: false,
      error: `Cannot isolate ${variable}: its coefficient in ${formatStandard(e)} is 0, so ${variable} does not appear. Choose the other variable.`,
    };
  }
  const o = other(variable);
  return { variable, coefOther: neg(div(coefOf(e, o), k)), constant: neg(div(e.c, k)) };
}

/** Single-variable equation  m·v + n = 0  after substitution. */
export interface ReducedEquation {
  variable: Variable;
  m: Rational;
  n: Rational;
}

export function formatReduced(r: ReducedEquation): string {
  const lhs = rEq(r.m, ONE) ? r.variable : isZero(r.m) ? '0' : `${formatRational(r.m)}${r.variable}`;
  const rhs = formatRational(neg(r.n));
  return `${lhs} = ${rhs}`;
}

/**
 * Replace `expr.variable` in `target` by its expression. The result is an
 * equation in the other variable only.
 */
export function substituteInto(expr: IsolatedExpression, target: LinearEq): ReducedEquation {
  const v = expr.variable;
  const o = other(v);
  const kv = coefOf(target, v);
  const ko = coefOf(target, o);
  return {
    variable: o,
    m: add(ko, mul(kv, expr.coefOther)),
    n: add(target.c, mul(kv, expr.constant)),
  };
}

export type SubstitutionPhase = 'choose' | 'isolated' | 'substituted' | 'solved' | 'back_substituted' | 'verified' | 'finished_no_unique';

export interface SubstitutionState {
  eq1: LinearEq;
  eq2: LinearEq;
  phase: SubstitutionPhase;
  source?: 1 | 2;
  variable?: Variable;
  expression?: IsolatedExpression;
  reduced?: ReducedEquation;
  /** Value of the variable that remains after substitution. */
  firstValue?: Rational;
  secondValue?: Rational;
  outcome?: SystemType;
  log: string[];
}

export function startSubstitution(eq1: LinearEq, eq2: LinearEq): SubstitutionState {
  return { eq1, eq2, phase: 'choose', log: [] };
}

export type SubstitutionAction =
  | { type: 'isolate'; source: 1 | 2; variable: Variable }
  | { type: 'substitute'; into?: 1 | 2 }
  | { type: 'simplify_solve'; claimed?: Rational }
  | { type: 'back_substitute' }
  | { type: 'verify' };

export function stepSubstitution(s: SubstitutionState, action: SubstitutionAction): SubstitutionState | StepError {
  if (!isLine(s.eq1) || !isLine(s.eq2)) {
    return { ok: false, error: 'Both equations must be valid lines before solving.' };
  }
  switch (action.type) {
    case 'isolate': {
      if (s.phase !== 'choose') return { ok: false, error: 'Isolation is the first step. Reset to choose again.' };
      const eqSrc = action.source === 1 ? s.eq1 : s.eq2;
      const res = isolate(eqSrc, action.variable);
      if ('ok' in res) return res;
      return {
        ...s,
        phase: 'isolated',
        source: action.source,
        variable: action.variable,
        expression: res,
        log: [...s.log, `From equation ${action.source}: ${formatExpression(res)}`],
      };
    }
    case 'substitute': {
      if (s.phase !== 'isolated' || !s.expression || !s.source) {
        return { ok: false, error: 'Isolate a variable first, then substitute it.' };
      }
      if (action.into === s.source) {
        return {
          ok: false,
          error: `The expression came from equation ${s.source}. Substituting it back into the same equation only gives a true statement like 0 = 0 and teaches nothing new. Substitute into equation ${s.source === 1 ? 2 : 1} instead.`,
        };
      }
      // The expression came from one equation, so it goes into the OTHER one.
      const target = s.source === 1 ? s.eq2 : s.eq1;
      const reduced = substituteInto(s.expression, target);
      const sys = analyzeSystem(s.eq1, s.eq2);
      const note = isZero(reduced.m)
        ? isZero(reduced.n)
          ? 'The variable vanished and 0 = 0 is always true: the equations describe the same line.'
          : 'The variable vanished and the statement is false: the lines are parallel.'
        : `One equation in ${reduced.variable} only: ${formatReduced(reduced)}`;
      return {
        ...s,
        phase: isZero(reduced.m) ? 'finished_no_unique' : 'substituted',
        reduced,
        outcome: isZero(reduced.m) ? sys.type : undefined,
        log: [...s.log, `Substitute into equation ${s.source === 1 ? 2 : 1}. ${note}`],
      };
    }
    case 'simplify_solve': {
      if (s.phase !== 'substituted' || !s.reduced) return { ok: false, error: 'Substitute first.' };
      const value = neg(div(s.reduced.n, s.reduced.m));
      if (action.claimed && !rEq(action.claimed, value)) {
        return {
          ok: false,
          error: `${s.reduced.variable} = ${formatRational(action.claimed)} does not solve ${formatReduced(s.reduced)}. Re-check the arithmetic.`,
        };
      }
      return {
        ...s,
        phase: 'solved',
        firstValue: value,
        log: [...s.log, `${s.reduced.variable} = ${formatRational(value)}`],
      };
    }
    case 'back_substitute': {
      if (s.phase !== 'solved' || !s.expression || s.firstValue === undefined || !s.reduced) {
        return { ok: false, error: 'Solve for the first variable before back-substituting.' };
      }
      const second = add(mul(s.expression.coefOther, s.firstValue), s.expression.constant);
      return {
        ...s,
        phase: 'back_substituted',
        secondValue: second,
        log: [...s.log, `${s.expression.variable} = ${formatRational(second)}`],
      };
    }
    case 'verify': {
      if (s.phase !== 'back_substituted' || !s.expression || !s.reduced || !s.firstValue || !s.secondValue) {
        return { ok: false, error: 'Finish back-substitution before verifying.' };
      }
      const pair = pairFromState(s);
      if (!pair) return { ok: false, error: 'Missing values.' };
      const check = verifyPair(s.eq1, s.eq2, pair.x, pair.y);
      if (!check.both) return { ok: false, error: 'Verification failed: the pair does not satisfy both equations.' };
      return { ...s, phase: 'verified', outcome: 'unique', log: [...s.log, 'Both equations hold: verified.'] };
    }
  }
}

export function pairFromState(s: SubstitutionState): { x: Rational; y: Rational } | null {
  if (!s.expression || !s.reduced || s.firstValue === undefined || s.secondValue === undefined) return null;
  return s.expression.variable === 'x'
    ? { x: s.secondValue, y: s.firstValue }
    : { x: s.firstValue, y: s.secondValue };
}

// ===========================================================================
// Elimination
// ===========================================================================

export type EliminationPhase = 'scale' | 'combined' | 'solved' | 'back_substituted' | 'verified' | 'finished_no_unique';

export interface EliminationState {
  original1: LinearEq;
  original2: LinearEq;
  /** Working copies after scaling. */
  work1: LinearEq;
  work2: LinearEq;
  phase: EliminationPhase;
  combined?: LinearEq;
  /** Variable remaining in the combined equation. */
  remaining?: Variable;
  eliminated?: Variable;
  remainingValue?: Rational;
  otherValue?: Rational;
  outcome?: SystemType;
  log: string[];
}

export function startElimination(eq1: LinearEq, eq2: LinearEq): EliminationState {
  return { original1: eq1, original2: eq2, work1: eq1, work2: eq2, phase: 'scale', log: [] };
}

export type EliminationAction =
  | { type: 'multiply'; target: 1 | 2; factor: Rational }
  | { type: 'combine'; op: 'add' | 'subtract'; eliminate: Variable }
  | { type: 'solve' }
  | { type: 'back_substitute' }
  | { type: 'verify' };

export function stepElimination(s: EliminationState, action: EliminationAction): EliminationState | StepError {
  if (!isLine(s.original1) || !isLine(s.original2)) {
    return { ok: false, error: 'Both equations must be valid lines before solving.' };
  }
  switch (action.type) {
    case 'multiply': {
      if (s.phase !== 'scale') return { ok: false, error: 'Multiplying is only allowed before combining. Reset to start again.' };
      if (isZero(action.factor)) {
        return { ok: false, error: 'You cannot multiply an equation by 0. It would turn it into 0 = 0 and lose all information.' };
      }
      const key = action.target === 1 ? 'work1' : 'work2';
      const scaled = scaleEq(s[key], action.factor);
      return {
        ...s,
        [key]: scaled,
        log: [...s.log, `Multiply equation ${action.target} (both sides, every term) by ${formatRational(action.factor)}: ${formatStandard(scaled)}`],
      };
    }
    case 'combine': {
      if (s.phase !== 'scale') return { ok: false, error: 'Equations are already combined.' };
      const combined = action.op === 'add' ? addEq(s.work1, s.work2) : subEq(s.work1, s.work2);
      const target = action.eliminate;
      if (!isZero(coefOf(combined, target))) {
        return {
          ok: false,
          error: `${action.op === 'add' ? 'Adding' : 'Subtracting'} does not eliminate ${target}: the ${target}-coefficients are ${formatRational(coefOf(s.work1, target))} and ${formatRational(coefOf(s.work2, target))}. Multiply one or both equations first so they become equal (to subtract) or opposite (to add).`,
        };
      }
      const remaining = other(target);
      const rest = coefOf(combined, remaining);
      if (isZero(rest)) {
        const sys = analyzeSystem(s.original1, s.original2);
        return {
          ...s,
          combined,
          phase: 'finished_no_unique',
          eliminated: target,
          outcome: sys.type,
          log: [
            ...s.log,
            isZero(combined.c)
              ? 'Both variables disappeared and 0 = 0: the equations describe the same line (infinitely many solutions).'
              : 'Both variables disappeared and the statement is false: the lines are parallel (no solution).',
          ],
        };
      }
      return {
        ...s,
        combined,
        phase: 'combined',
        eliminated: target,
        remaining,
        log: [...s.log, `${action.op === 'add' ? 'Add' : 'Subtract'} the equations to eliminate ${target}: ${formatStandard(combined)}`],
      };
    }
    case 'solve': {
      if (s.phase !== 'combined' || !s.combined || !s.remaining) return { ok: false, error: 'Combine the equations first.' };
      const k = coefOf(s.combined, s.remaining);
      const value = neg(div(s.combined.c, k));
      return { ...s, phase: 'solved', remainingValue: value, log: [...s.log, `${s.remaining} = ${formatRational(value)}`] };
    }
    case 'back_substitute': {
      if (s.phase !== 'solved' || !s.remaining || s.remainingValue === undefined) return { ok: false, error: 'Solve the combined equation first.' };
      // Use whichever ORIGINAL equation has a non-zero coefficient on the other variable.
      const v = other(s.remaining);
      const src = !isZero(coefOf(s.original1, v)) ? s.original1 : s.original2;
      const known = coefOf(src, s.remaining);
      const kv = coefOf(src, v);
      const value = neg(div(add(mul(known, s.remainingValue), src.c), kv));
      return { ...s, phase: 'back_substituted', otherValue: value, log: [...s.log, `${v} = ${formatRational(value)}`] };
    }
    case 'verify': {
      const pair = elimPair(s);
      if (s.phase !== 'back_substituted' || !pair) return { ok: false, error: 'Finish back-substitution before verifying.' };
      const check = verifyPair(s.original1, s.original2, pair.x, pair.y);
      if (!check.both) return { ok: false, error: 'Verification failed: the pair does not satisfy both original equations.' };
      return { ...s, phase: 'verified', outcome: 'unique', log: [...s.log, 'Both original equations hold: verified.'] };
    }
  }
}

export function elimPair(s: EliminationState): { x: Rational; y: Rational } | null {
  if (!s.remaining || s.remainingValue === undefined || s.otherValue === undefined) return null;
  return s.remaining === 'x' ? { x: s.remainingValue, y: s.otherValue } : { x: s.otherValue, y: s.remainingValue };
}

/**
 * Suggest multipliers (m1, m2) so that |coefficient of v| becomes equal in both
 * equations — used for the "Show a hint" action, never applied automatically.
 */
export function suggestMultipliers(p: LinearEq, q: LinearEq, v: Variable): { m1: Rational; m2: Rational } | null {
  const c1 = coefOf(p, v);
  const c2 = coefOf(q, v);
  if (isZero(c1) || isZero(c2)) return null;
  return { m1: abs(c2), m2: abs(c1) };
}
