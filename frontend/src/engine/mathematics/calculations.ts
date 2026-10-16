/**
 * Pure Mathematical Calculations Engine for LabVerse Mathematics Laboratory
 *
 * Implements deterministic, independently testable coordinate geometry calculations.
 * Avoids premature rounding; presentation rounding is handled via explicit formatters.
 */

import type { MathPoint, DistanceAnalysis, LineAnalysis } from './types';

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
 * Calculates auxiliary right-triangle helper vertices for endpoints A(x1, y1) and B(x2, y2).
 * Helper C = (x2, y1) for horizontal-then-vertical path.
 * Helper D = (x1, y2) for vertical-then-horizontal path.
 */
export function calculateHelperVertices(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): {
  helperC: { x: number; y: number };
  helperD: { x: number; y: number };
} {
  return {
    helperC: { x: p2.x, y: p1.y },
    helperD: { x: p1.x, y: p2.y },
  };
}

/**
 * Formats a number to clean presentation string (removes trailing zeros, handles decimals).
 */
export function formatMathNumber(num: number, maxDecimals = 3): string {
  if (!Number.isFinite(num)) return '0';
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
  const p1Label = 'label' in p1 && p1.label ? p1.label : 'A';
  const p2Label = 'label' in p2 && p2.label ? p2.label : 'B';

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
    final: isExactSquare ? `d = ${sqrtInt}` : `d \\approx ${formattedDistance}`,
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

/**
 * Calculates mathematically infinite line visible endpoints clipped to the visible bounds.
 * Extends slightly past bounds to guarantee the stroke reaches canvas borders cleanly.
 */
export function calculateInfiniteLineEndpoints(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): [{ x: number; y: number }, { x: number; y: number }] | null {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return null;

  // Add 15% margin around visible bounds so the line extends cleanly outside the SVG viewport
  const marginX = Math.max(1, (bounds.maxX - bounds.minX) * 0.15);
  const marginY = Math.max(1, (bounds.maxY - bounds.minY) * 0.15);
  const minX = bounds.minX - marginX;
  const maxX = bounds.maxX + marginX;
  const minY = bounds.minY - marginY;
  const maxY = bounds.maxY + marginY;

  // Vertical line: x = p1.x
  if (Math.abs(dx) < 1e-9) {
    return [
      { x: p1.x, y: minY },
      { x: p1.x, y: maxY },
    ];
  }

  // Horizontal line: y = p1.y
  if (Math.abs(dy) < 1e-9) {
    return [
      { x: minX, y: p1.y },
      { x: maxX, y: p1.y },
    ];
  }

  const m = dy / dx;
  const c = p1.y - m * p1.x;

  const candidatePoints: Array<{ x: number; y: number }> = [];

  // 1. Intersection with left bound x = minX
  const yAtMinX = m * minX + c;
  if (yAtMinX >= minY - 1e-4 && yAtMinX <= maxY + 1e-4) {
    candidatePoints.push({ x: minX, y: yAtMinX });
  }

  // 2. Intersection with right bound x = maxX
  const yAtMaxX = m * maxX + c;
  if (yAtMaxX >= minY - 1e-4 && yAtMaxX <= maxY + 1e-4) {
    candidatePoints.push({ x: maxX, y: yAtMaxX });
  }

  // 3. Intersection with bottom bound y = minY
  const xAtMinY = (minY - c) / m;
  if (xAtMinY >= minX - 1e-4 && xAtMinY <= maxX + 1e-4) {
    candidatePoints.push({ x: xAtMinY, y: minY });
  }

  // 4. Intersection with top bound y = maxY
  const xAtMaxY = (maxY - c) / m;
  if (xAtMaxY >= minX - 1e-4 && xAtMaxY <= maxX + 1e-4) {
    candidatePoints.push({ x: xAtMaxY, y: maxY });
  }

  // Deduplicate
  const unique: Array<{ x: number; y: number }> = [];
  for (const pt of candidatePoints) {
    if (!unique.some((u) => Math.hypot(u.x - pt.x, u.y - pt.y) < 1e-4)) {
      unique.push(pt);
    }
  }

  if (unique.length >= 2) {
    return [unique[0], unique[1]];
  }

  // Geometric fallback projection along line direction
  const span = Math.max(maxX - minX, maxY - minY) * 2;
  const len = Math.hypot(dx, dy);
  const uX = (dx / len) * span;
  const uY = (dy / len) * span;

  return [
    { x: p1.x - uX, y: p1.y - uY },
    { x: p1.x + uX, y: p1.y + uY },
  ];
}

/**
 * Calculates mathematical properties of a line: slope, intercept, equation, angle.
 */
export function calculateLineAnalysis(
  p1: MathPoint | { x: number; y: number; label?: string },
  p2: MathPoint | { x: number; y: number; label?: string }
): LineAnalysis {
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const isVertical = Math.abs(dx) < 1e-9;
  const isHorizontal = Math.abs(dy) < 1e-9;

  let slope = 0;
  let yIntercept = 0;
  let equation = '';

  if (isVertical) {
    slope = Infinity;
    yIntercept = NaN;
    equation = `x = ${formatMathNumber(x1)}`;
  } else if (isHorizontal) {
    slope = 0;
    yIntercept = y1;
    equation = `y = ${formatMathNumber(y1)}`;
  } else {
    slope = dy / dx;
    yIntercept = y1 - slope * x1;
    const slopeStr = slope === 1 ? '' : slope === -1 ? '-' : formatMathNumber(slope);
    const interceptSign = yIntercept >= 0 ? '+' : '-';
    const absInterceptStr = formatMathNumber(Math.abs(yIntercept));

    if (Math.abs(yIntercept) < 1e-5) {
      equation = `y = ${slopeStr}x`;
    } else {
      equation = `y = ${slopeStr}x ${interceptSign} ${absInterceptStr}`;
    }
  }

  const angleRad = Math.atan2(dy, dx);
  let angleDeg = (angleRad * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 180; // Standard line inclination in [0, 180)

  return {
    p1: { x: x1, y: y1, label: 'label' in p1 && p1.label ? p1.label : 'A' },
    p2: { x: x2, y: y2, label: 'label' in p2 && p2.label ? p2.label : 'B' },
    isVertical,
    isHorizontal,
    slope,
    yIntercept,
    equation,
    angleDeg: Number(angleDeg.toFixed(1)),
  };
}

/**
 * Automatically generates the next unique point label: A-Z, then P1, P2...
 */
export function generateNextPointLabel(existingPoints: MathPoint[]): string {
  const existingLabels = new Set(existingPoints.map((p) => p.label));
  // A through Z
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!existingLabels.has(letter)) return letter;
  }
  // P1, P2, P3...
  for (let i = 1; i < 1000; i++) {
    const label = `P${i}`;
    if (!existingLabels.has(label)) return label;
  }
  return `P${Date.now() % 1000}`;
}
