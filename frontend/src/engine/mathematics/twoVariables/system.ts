/**
 * Systems of two linear equations in two variables.
 * Classification uses the determinant D = a1·b2 − a2·b1 in exact arithmetic,
 * so near-parallel lines are never confused with parallel ones.
 */

import { type Rational, sub, mul, div, isZero, formatRational } from './rational';
import { type LinearEq, evaluate, isLine, validateEquation } from './linearEquation';

export type SystemType = 'unique' | 'parallel' | 'coincident' | 'invalid';

export interface SystemAnalysis {
  type: SystemType;
  determinant: Rational | null;
  /** Present only for a unique solution. */
  solution?: { x: Rational; y: Rational };
  /** Plain-language reason, safe to show to students. */
  reason: string;
  /** Number of solutions as text for display. */
  solutionCount: 'exactly one' | 'none' | 'infinitely many' | 'undefined';
}

export function determinant(p: LinearEq, q: LinearEq): Rational {
  return sub(mul(p.a, q.b), mul(q.a, p.b));
}

export function analyzeSystem(p: LinearEq, q: LinearEq): SystemAnalysis {
  const vp = validateEquation(p);
  const vq = validateEquation(q);
  if (!vp.valid || !vq.valid) {
    return {
      type: 'invalid',
      determinant: null,
      reason: !vp.valid ? `Equation 1: ${vp.message}` : `Equation 2: ${vq.message}`,
      solutionCount: 'undefined',
    };
  }
  const d = determinant(p, q);
  if (!isZero(d)) {
    const x = div(sub(mul(p.b, q.c), mul(q.b, p.c)), d);
    const y = div(sub(mul(p.c, q.a), mul(q.c, p.a)), d);
    return {
      type: 'unique',
      determinant: d,
      solution: { x, y },
      reason: `a₁b₂ − a₂b₁ = ${formatRational(d)} ≠ 0, so the lines have different directions and meet at exactly one point.`,
      solutionCount: 'exactly one',
    };
  }
  // Parallel directions: same line iff the constants are in the same ratio.
  const cross1 = sub(mul(p.a, q.c), mul(q.a, p.c));
  const cross2 = sub(mul(p.b, q.c), mul(q.b, p.c));
  if (isZero(cross1) && isZero(cross2)) {
    return {
      type: 'coincident',
      determinant: d,
      reason: 'a₁/a₂ = b₁/b₂ = c₁/c₂: one equation is a multiple of the other, so they describe the same line.',
      solutionCount: 'infinitely many',
    };
  }
  return {
    type: 'parallel',
    determinant: d,
    reason: 'a₁/a₂ = b₁/b₂ ≠ c₁/c₂: the lines have the same direction but are in different positions, so they never meet.',
    solutionCount: 'none',
  };
}

export interface SubstitutionCheck {
  eq1Value: Rational;
  eq2Value: Rational;
  eq1Holds: boolean;
  eq2Holds: boolean;
  both: boolean;
}

/** Exact check of an ordered pair against both equations. */
export function verifyPair(p: LinearEq, q: LinearEq, x: Rational, y: Rational): SubstitutionCheck {
  const v1 = evaluate(p, x, y);
  const v2 = evaluate(q, x, y);
  const h1 = isLine(p) && isZero(v1);
  const h2 = isLine(q) && isZero(v2);
  return { eq1Value: v1, eq2Value: v2, eq1Holds: h1, eq2Holds: h2, both: h1 && h2 };
}
