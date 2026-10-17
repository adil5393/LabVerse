/**
 * Pure Geometry Functions for Class 9 Circles Laboratory (Milestone M2)
 *
 * Implements authoritative mathematical calculations in world coordinates:
 * - Circle point projections and circumference constraints
 * - Chord length, midpoint, and perpendicular distance from center
 * - Angle subtended at center vs inscribed angles
 * - Angle in a semicircle (90° right angle)
 * - Cyclic quadrilateral opposite angle sums (180° supplementary)
 * - Tangent vector and perpendicularity verification
 */

import type { WorldPoint, CircleObject } from './types';

export const EPSILON = 1e-4;

/**
 * Converts screen coordinates to world coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasHeight: number
): WorldPoint {
  const x = (screenX - panX) / zoom;
  // Canvas Y is inverted relative to standard Cartesian Y
  const y = (canvasHeight / 2 - (screenY - panY)) / zoom;
  return {
    x: Number(x.toFixed(4)),
    y: Number(y.toFixed(4)),
  };
}

/**
 * Converts world coordinates to screen pixel coordinates.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasHeight: number
): { x: number; y: number } {
  const x = worldX * zoom + panX;
  const y = canvasHeight / 2 - worldY * zoom + panY;
  return { x, y };
}

/**
 * Calculates Euclidean distance between two points.
 */
export function distanceBetween(p1: WorldPoint, p2: WorldPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the exact Cartesian world coordinates for a point on a circle circumference.
 */
export function getCircumferenceCoords(
  circle: CircleObject,
  angleRad: number
): WorldPoint {
  return {
    x: Number((circle.center.x + circle.radius * Math.cos(angleRad)).toFixed(4)),
    y: Number((circle.center.y + circle.radius * Math.sin(angleRad)).toFixed(4)),
  };
}

/**
 * Finds the angle in radians [0, 2π) for any world point projected onto the circle circumference.
 */
export function projectPointToCircleAngle(
  center: WorldPoint,
  point: WorldPoint
): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

/**
 * Calculates chord length and midpoint between two circumference points.
 */
export function calculateChordMetrics(
  circle: CircleObject,
  ptA: WorldPoint,
  ptB: WorldPoint
): {
  length: number;
  midpoint: WorldPoint;
  distFromCenter: number;
  subtendedAngleDeg: number;
} {
  const length = distanceBetween(ptA, ptB);
  const midpoint: WorldPoint = {
    x: Number(((ptA.x + ptB.x) / 2).toFixed(4)),
    y: Number(((ptA.y + ptB.y) / 2).toFixed(4)),
  };
  const distFromCenter = distanceBetween(circle.center, midpoint);

  // Subtended central angle using Law of Cosines: L² = r² + r² - 2r²cos(θ) = 2r²(1 - cos(θ))
  // sin(θ/2) = (L / 2) / r
  const halfChord = Math.min(1.0, length / (2 * Math.max(0.001, circle.radius)));
  const angleRad = 2 * Math.asin(halfChord);
  const subtendedAngleDeg = Number(((angleRad * 180) / Math.PI).toFixed(2));

  return {
    length: Number(length.toFixed(3)),
    midpoint,
    distFromCenter: Number(distFromCenter.toFixed(3)),
    subtendedAngleDeg,
  };
}

/**
 * Measures the planar angle ∠(P1 - Vertex - P2) in degrees [0°, 180°].
 */
export function calculateAngleDegrees(
  p1: WorldPoint,
  vertex: WorldPoint,
  p2: WorldPoint
): number {
  const v1x = p1.x - vertex.x;
  const v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x;
  const v2y = p2.y - vertex.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 < 1e-6 || mag2 < 1e-6) return 0;

  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  const angleRad = Math.acos(cosTheta);
  return Number(((angleRad * 180) / Math.PI).toFixed(2));
}

/**
 * Verifies Theorem 3: The angle subtended by an arc at the center is double
 * the angle subtended by it at any point on the remaining part of the circle.
 * ∠AOB = 2 * ∠APB
 */
export function verifyInscribedAngleTheorem(
  centerAngleDeg: number,
  inscribedAngleDeg: number
): {
  isValid: boolean;
  ratio: number;
  differenceFromDouble: number;
} {
  const expectedDouble = inscribedAngleDeg * 2;
  const diff = Math.abs(centerAngleDeg - expectedDouble);
  const ratio = inscribedAngleDeg > 0 ? centerAngleDeg / inscribedAngleDeg : 0;

  return {
    isValid: diff < 0.25, // Small numerical tolerance for floating-point calculations
    ratio: Number(ratio.toFixed(2)),
    differenceFromDouble: Number(diff.toFixed(2)),
  };
}

/**
 * Verifies Theorem 5: The angle in a semicircle is a right angle (90°).
 */
export function verifyAngleInSemicircle(angleDeg: number): {
  isRightAngle: boolean;
  deviation: number;
} {
  const deviation = Math.abs(angleDeg - 90.0);
  return {
    isRightAngle: deviation < 0.2,
    deviation: Number(deviation.toFixed(2)),
  };
}

/**
 * Verifies Theorem 6: Opposite angles of a cyclic quadrilateral are supplementary (sum = 180°).
 */
export function verifyCyclicQuadOppositeAngles(
  angle1Deg: number,
  angle2Deg: number
): {
  isSupplementary: boolean;
  sum: number;
  deviation: number;
} {
  const sum = angle1Deg + angle2Deg;
  const deviation = Math.abs(sum - 180.0);
  return {
    isSupplementary: deviation < 0.35,
    sum: Number(sum.toFixed(2)),
    deviation: Number(deviation.toFixed(2)),
  };
}

/**
 * Computes the tangent segment endpoints at a given contact point on the circle.
 * Tangent line is perpendicular to radius vector (P - Center).
 */
export function calculateTangentSegment(
  circle: CircleObject,
  contactPoint: WorldPoint,
  segmentLengthWorld: number = 6.0
): {
  pStart: WorldPoint;
  pEnd: WorldPoint;
  isPerpendicularToRadius: boolean;
} {
  const rx = contactPoint.x - circle.center.x;
  const ry = contactPoint.y - circle.center.y;
  const rMag = Math.sqrt(rx * rx + ry * ry);

  if (rMag < 1e-6) {
    return {
      pStart: contactPoint,
      pEnd: contactPoint,
      isPerpendicularToRadius: false,
    };
  }

  // Unit perpendicular vector: (-ry / rMag, rx / rMag)
  const tx = -ry / rMag;
  const ty = rx / rMag;
  const halfLen = segmentLengthWorld / 2;

  const pStart: WorldPoint = {
    x: Number((contactPoint.x - tx * halfLen).toFixed(4)),
    y: Number((contactPoint.y - ty * halfLen).toFixed(4)),
  };
  const pEnd: WorldPoint = {
    x: Number((contactPoint.x + tx * halfLen).toFixed(4)),
    y: Number((contactPoint.y + ty * halfLen).toFixed(4)),
  };

  // Dot product of radius vector (rx, ry) and tangent vector (tx, ty) must be 0
  const dotProduct = rx * tx + ry * ty;
  const isPerpendicular = Math.abs(dotProduct) < EPSILON;

  return {
    pStart,
    pEnd,
    isPerpendicularToRadius: isPerpendicular,
  };
}

/**
 * Determines whether two chords of the same circle are equal in length and equidistant from the center.
 * Theorem 2: Equal chords are equidistant from the center.
 */
export function verifyEqualChordsEquidistant(
  chord1Length: number,
  chord1Dist: number,
  chord2Length: number,
  chord2Dist: number
): {
  areChordsEqual: boolean;
  areDistancesEqual: boolean;
  lengthDiff: number;
  distanceDiff: number;
} {
  const lengthDiff = Math.abs(chord1Length - chord2Length);
  const distanceDiff = Math.abs(chord1Dist - chord2Dist);

  return {
    areChordsEqual: lengthDiff < 0.05,
    areDistancesEqual: distanceDiff < 0.05,
    lengthDiff: Number(lengthDiff.toFixed(3)),
    distanceDiff: Number(distanceDiff.toFixed(3)),
  };
}
