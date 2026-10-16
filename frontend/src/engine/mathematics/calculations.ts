/**
 * Pure Mathematical Calculations Engine for LabVerse Mathematics Laboratory
 *
 * Implements deterministic, independently testable coordinate geometry calculations.
 * Avoids premature rounding; presentation rounding is handled via explicit formatters.
 */

import type { MathPoint, DistanceAnalysis } from './types';

/**
 * Calculates Euclidean distance between two points.
 */
export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.hypot(dx, dy);
}

/**
 * Calculates midpoint between two points.
 */
export function calculateMidpoint(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

/**
 * Calculates coordinate differences: dx = x2 - x1, dy = y2 - y1.
 */
export function calculateDifferences(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): { dx: number; dy: number; absDx: number; absDy: number } {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return {
    dx,
    dy,
    absDx: Math.abs(dx),
    absDy: Math.abs(dy),
  };
}

/**
 * Formats a number to clean presentation string (removes trailing zeros, handles decimals).
 */
export function formatMathNumber(num: number, maxDecimals = 3): string {
  if (!Number.isFinite(num)) return '0';
  // Round to maxDecimals cleanly
  const factor = Math.pow(10, maxDecimals);
  const rounded = Math.round(num * factor) / factor;
  return Object.is(rounded, -0) ? '0' : rounded.toString();
}

/**
 * Helper to wrap negative numbers in parentheses for formula substitution: e.g. (-3) vs 3.
 */
function wrapNegative(val: number): string {
  const str = formatMathNumber(val);
  return val < 0 ? `(${str})` : str;
}

/**
 * Full Step-by-Step Distance Analysis for Educational Explanations.
 */
export function calculateDistanceAnalysis(
  p1: MathPoint | { x: number; y: number; label?: string },
  p2: MathPoint | { x: number; y: number; label?: string }
): DistanceAnalysis {
  const x1 = Number.isFinite(p1.x) ? p1.x : 0;
  const y1 = Number.isFinite(p1.y) ? p1.y : 0;
  const x2 = Number.isFinite(p2.x) ? p2.x : 0;
  const y2 = Number.isFinite(p2.y) ? p2.y : 0;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  const dxSquared = dx * dx;
  const dySquared = dy * dy;
  const sumOfSquares = dxSquared + dySquared;
  const rawDistance = Math.sqrt(sumOfSquares);

  // Check if sum of squares is an exact integer square
  const roundedSum = Math.round(sumOfSquares);
  const isIntegerSum = Math.abs(sumOfSquares - roundedSum) < 1e-9;
  const sqrtInt = isIntegerSum ? Math.round(Math.sqrt(roundedSum)) : null;
  const isExactSquare = isIntegerSum && sqrtInt !== null && sqrtInt * sqrtInt === roundedSum;

  const formattedDistance = formatMathNumber(rawDistance, 3);
  const midpoint = calculateMidpoint({ x: x1, y: y1 }, { x: x2, y: y2 });

  // Generate clear mathematical substitution strings
  // Formula: d = √[(x₂ - x₁)² + (y₂ - y₁)²]
  const p1Label = ('label' in p1 && p1.label) ? p1.label : 'A';
  const p2Label = ('label' in p2 && p2.label) ? p2.label : 'B';

  const subX = `${wrapNegative(x2)} - ${wrapNegative(x1)}`;
  const subY = `${wrapNegative(y2)} - ${wrapNegative(y1)}`;

  const diffXStr = wrapNegative(dx);
  const diffYStr = wrapNegative(dy);

  const sqXStr = formatMathNumber(dxSquared);
  const sqYStr = formatMathNumber(dySquared);
  const sumStr = formatMathNumber(sumOfSquares);

  const steps = {
    formula: `d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}`,
    substitution: `d = \\sqrt{(${subX})^2 + (${subY})^2}`,
    differences: `d = \\sqrt{(${diffXStr})^2 + (${diffYStr})^2}`,
    squared: `d = \\sqrt{${sqXStr} + ${sqYStr}}`,
    sum: `d = \\sqrt{${sumStr}}`,
    final: isExactSquare
      ? `d = ${sqrtInt}`
      : `d \\approx ${formattedDistance}`,
  };

  return {
    p1: { x: x1, y: y1, label: p1Label },
    p2: { x: x2, y: y2, label: p2Label },
    dx,
    dy,
    absDx,
    absDy,
    dxSquared,
    dySquared,
    sumOfSquares,
    distance: rawDistance,
    formattedDistance,
    isExactSquare,
    exactSqrt: isExactSquare ? sqrtInt : null,
    midpoint,
    steps,
  };
}
