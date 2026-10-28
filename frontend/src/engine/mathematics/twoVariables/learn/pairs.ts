/**
 * A pair of linear equations a1x + b1y + c1 = 0, a2x + b2y + c2 = 0 (c on the left, as in the textbook). Pure, exact for integer
 * and decimal coefficients: the determinant decides one / none / infinitely many solutions, and Cramer's rule gives the point.
 */

export type Eq3 = [number, number, number];

export type PairRelation = { kind: 'unique'; x: number; y: number } | { kind: 'parallel' } | { kind: 'coincident' };

const EPS = 1e-12;
const clean = (v: number) => (Math.abs(v) < EPS ? 0 : Math.round(v * 1e9) / 1e9);

export function pairRelation([a1, b1, c1]: Eq3, [a2, b2, c2]: Eq3): PairRelation {
  const det = a1 * b2 - a2 * b1;
  if (Math.abs(det) > EPS) return { kind: 'unique', x: clean((b1 * c2 - b2 * c1) / det), y: clean((c1 * a2 - c2 * a1) / det) };
  // Same direction: the lines coincide exactly when the constant terms are in the same ratio as well.
  const sameLine = Math.abs(a1 * c2 - a2 * c1) < EPS && Math.abs(b1 * c2 - b2 * c1) < EPS;
  return sameLine ? { kind: 'coincident' } : { kind: 'parallel' };
}

export const satisfies = ([a, b, c]: Eq3, x: number, y: number): boolean => Math.abs(a * x + b * y + c) < 1e-9;
