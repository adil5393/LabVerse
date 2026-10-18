/**
 * Authoritative Geometry Calculations & Predicates for Class 9 Quadrilaterals
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements exact, mathematically rigorous computations for:
 * - High-contrast Cartesian projection
 * - Vector algebra, segment intersections, midpoints, centroids
 * - Quadrilateral classification (convex, concave, crossed, degenerate, special types)
 * - Angle sums, side/diagonal equality, and parallelism invariants
 * - Midpoint Theorem (half-length and parallelism)
 * - Triangle Centroid concurrency and 2:1 ratio
 * - Varignon Parallelogram invariants (area = 1/2 original, opposite sides parallel to diagonals)
 * - Quadrilateral Plane Tiling (monohedral tessellation via 180° edge-rotations and vector translations)
 * - Practice answer validation
 */

import type {
  WorldPoint,
  QuadViewportTransform,
  QuadrilateralKind,
  LabelSizePreference,
  QuadPoint,
  QuadSegment,
  QuadConstraint,
} from './types';

export const EPSILON = 1e-4;

// ============================================================================
// 1. Coordinate Transformations (World <-> Screen)
// ============================================================================

export function worldToScreen(
  pt: WorldPoint,
  viewport: QuadViewportTransform,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: canvasWidth / 2 + viewport.panX + pt.x * viewport.zoom,
    y: canvasHeight / 2 + viewport.panY - pt.y * viewport.zoom, // Invert Y for Cartesian plane
  };
}

export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: QuadViewportTransform,
  canvasWidth: number,
  canvasHeight: number
): WorldPoint {
  return {
    x: (screenX - canvasWidth / 2 - viewport.panX) / viewport.zoom,
    y: -(screenY - canvasHeight / 2 - viewport.panY) / viewport.zoom,
  };
}

// ============================================================================
// 2. Vector Arithmetic & Distances
// ============================================================================

export function distanceBetween(p1: WorldPoint, p2: WorldPoint): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function vectorBetween(from: WorldPoint, to: WorldPoint): { x: number; y: number } {
  return { x: to.x - from.x, y: to.y - from.y };
}

export function dotProduct(v1: { x: number; y: number }, v2: { x: number; y: number }): number {
  return v1.x * v2.x + v1.y * v2.y;
}

export function crossProduct(v1: { x: number; y: number }, v2: { x: number; y: number }): number {
  return v1.x * v2.y - v1.y * v2.x;
}

export function areVectorsParallel(
  v1: { x: number; y: number },
  v2: { x: number; y: number },
  tolerance = 0.05
): boolean {
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  if (len1 < EPSILON || len2 < EPSILON) return false;
  const sinAngle = Math.abs(crossProduct(v1, v2)) / (len1 * len2);
  return sinAngle <= tolerance;
}

export function areVectorsPerpendicular(
  v1: { x: number; y: number },
  v2: { x: number; y: number },
  tolerance = 0.05
): boolean {
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  if (len1 < EPSILON || len2 < EPSILON) return false;
  const cosAngle = Math.abs(dotProduct(v1, v2)) / (len1 * len2);
  return cosAngle <= tolerance;
}

// ============================================================================
// 3. Points, Midpoints, Centroids & Intersections
// ============================================================================

export function calculateMidpoint(p1: WorldPoint, p2: WorldPoint): WorldPoint {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}

export function calculateCentroid(p1: WorldPoint, p2: WorldPoint, p3: WorldPoint): WorldPoint {
  return {
    x: (p1.x + p2.x + p3.x) / 3,
    y: (p1.y + p2.y + p3.y) / 3,
  };
}

/**
 * Calculates intersection point of infinite lines AB and CD, or null if parallel
 */
export function lineIntersection(
  a: WorldPoint,
  b: WorldPoint,
  c: WorldPoint,
  d: WorldPoint
): WorldPoint | null {
  const dX_ab = b.x - a.x;
  const dY_ab = b.y - a.y;
  const dX_cd = d.x - c.x;
  const dY_cd = d.y - c.y;

  const denom = dX_ab * dY_cd - dY_ab * dX_cd;
  if (Math.abs(denom) < EPSILON) return null; // Parallel or collinear

  const t = ((c.x - a.x) * dY_cd - (c.y - a.y) * dX_cd) / denom;
  return {
    x: a.x + t * dX_ab,
    y: a.y + t * dY_ab,
  };
}

/**
 * Determines whether segment AB intersects segment CD strictly within segment bounds
 */
export function segmentsIntersect(
  a: WorldPoint,
  b: WorldPoint,
  c: WorldPoint,
  d: WorldPoint
): boolean {
  const ccw = (p1: WorldPoint, p2: WorldPoint, p3: WorldPoint) => {
    return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
  };
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

export function distanceToSegment(p: WorldPoint, a: WorldPoint, b: WorldPoint): number {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 < EPSILON) return distanceBetween(p, a);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const proj = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  return distanceBetween(p, proj);
}

export function pointHitsScreenPoint(
  screenX: number,
  screenY: number,
  ptScreen: { x: number; y: number },
  tolPx = 18
): boolean {
  return Math.hypot(screenX - ptScreen.x, screenY - ptScreen.y) <= tolPx;
}

export function distanceToScreenSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number
): number {
  const l2 = (bx - ax) ** 2 + (by - ay) ** 2;
  if (l2 < 1) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = ax + t * (bx - ax);
  const projY = ay + t * (by - ay);
  return Math.hypot(px - projX, py - projY);
}

// ============================================================================
// 4. Angle Calculations
// ============================================================================

/**
 * Calculates unsigned angle at vertex between ray (vertex->p1) and (vertex->p2) in [0, 180] deg
 */
export function calculateAngleDegrees(
  p1: WorldPoint,
  vertex: WorldPoint,
  p2: WorldPoint
): number {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  const len1 = Math.hypot(v1.x, v1.y);
  const len2 = Math.hypot(v2.x, v2.y);
  if (len1 < EPSILON || len2 < EPSILON) return 0;

  const cosVal = Math.max(-1, Math.min(1, dotProduct(v1, v2) / (len1 * len2)));
  return (Math.acos(cosVal) * 180) / Math.PI;
}

/**
 * Calculates interior angle of a polygon vertex in [0, 360] degrees based on winding order
 */
export function calculateInteriorAngle(
  pPrev: WorldPoint,
  pVertex: WorldPoint,
  pNext: WorldPoint,
  isCCW: boolean
): number {
  const vNext = { x: pNext.x - pVertex.x, y: pNext.y - pVertex.y };
  const vPrev = { x: pPrev.x - pVertex.x, y: pPrev.y - pVertex.y };

  const angleNext = Math.atan2(vNext.y, vNext.x);
  const anglePrev = Math.atan2(vPrev.y, vPrev.x);

  let sweep: number;
  if (isCCW) {
    sweep = anglePrev - angleNext;
  } else {
    sweep = angleNext - anglePrev;
  }
  while (sweep < 0) sweep += 2 * Math.PI;
  while (sweep >= 2 * Math.PI) sweep -= 2 * Math.PI;

  return (sweep * 180) / Math.PI;
}

// ============================================================================
// 5. Area Calculations
// ============================================================================

export function calculateTriangleArea(p1: WorldPoint, p2: WorldPoint, p3: WorldPoint): number {
  return 0.5 * Math.abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y));
}

export function calculatePolygonArea(pts: WorldPoint[]): number {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    sum += curr.x * next.y - next.x * curr.y;
  }
  return 0.5 * Math.abs(sum);
}

export function isPolygonCCW(pts: WorldPoint[]): boolean {
  if (pts.length < 3) return true;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    sum += curr.x * next.y - next.x * curr.y;
  }
  return sum > 0;
}

// ============================================================================
// 6. Comprehensive Quadrilateral Classification
// ============================================================================

export interface QuadrilateralAnalysis {
  kind: QuadrilateralKind;
  isConvex: boolean;
  isSimple: boolean;
  isDegenerate: boolean;
  isCrossed: boolean;
  sideLengths: [number, number, number, number]; // [AB, BC, CD, DA]
  diagonalLengths: [number, number]; // [AC, BD]
  interiorAngles: [number, number, number, number]; // [A, B, C, D]
  angleSum: number;
  reflexVertexIndex: number | null; // 0 for A, 1 for B, 2 for C, 3 for D, or null if convex
  isReflex: [boolean, boolean, boolean, boolean];
  oppSidesParallel: [boolean, boolean]; // [AB || CD, BC || DA]
  oppSidesEqual: [boolean, boolean]; // [AB = CD, BC = DA]
  adjSidesEqual: [boolean, boolean, boolean, boolean]; // [AB=BC, BC=CD, CD=DA, DA=AB]
  diagonalsBisect: boolean;
  diagonalsPerpendicular: boolean;
  diagonalsEqual: boolean;
  area: number;
  varignonArea: number;
  explanation: string;
}

export function classifyQuadrilateral(
  a: WorldPoint,
  b: WorldPoint,
  c: WorldPoint,
  d: WorldPoint
): QuadrilateralAnalysis {
  const pts = [a, b, c, d];
  const sideAB = distanceBetween(a, b);
  const sideBC = distanceBetween(b, c);
  const sideCD = distanceBetween(c, d);
  const sideDA = distanceBetween(d, a);
  const sideLengths: [number, number, number, number] = [sideAB, sideBC, sideCD, sideDA];

  const diagAC = distanceBetween(a, c);
  const diagBD = distanceBetween(b, d);
  const diagonalLengths: [number, number] = [diagAC, diagBD];

  // Degeneracy check (any zero-length side or 3 collinear vertices)
  const isZeroSide = sideLengths.some((l) => l < 0.2);
  const tri1 = calculateTriangleArea(a, b, c);
  const tri2 = calculateTriangleArea(b, c, d);
  const tri3 = calculateTriangleArea(c, d, a);
  const tri4 = calculateTriangleArea(d, a, b);
  const isCollinear3 = tri1 < 0.05 || tri2 < 0.05 || tri3 < 0.05 || tri4 < 0.05;
  const isDegenerate = isZeroSide || isCollinear3;

  // Simple vs Crossed (self-intersecting)
  // Segments AB and CD must not intersect, nor BC and DA
  const crossed1 = segmentsIntersect(a, b, c, d);
  const crossed2 = segmentsIntersect(b, c, d, a);
  const isCrossed = crossed1 || crossed2;
  const isSimple = !isCrossed && !isDegenerate;

  // Interior angles calculation based on polygon traversal order and winding
  const ccw = isPolygonCCW(pts);
  const angleA = calculateInteriorAngle(d, a, b, ccw);
  const angleB = calculateInteriorAngle(a, b, c, ccw);
  const angleC = calculateInteriorAngle(b, c, d, ccw);
  const angleD = calculateInteriorAngle(c, d, a, ccw);
  const interiorAngles: [number, number, number, number] = [angleA, angleB, angleC, angleD];
  const angleSum = isSimple ? angleA + angleB + angleC + angleD : 0;

  // Convexity & Reflex classification
  // In any simple quadrilateral, it is convex iff all 4 angles are < 180°
  // If one angle is > 180°, it is concave, and that vertex is reflex
  const isReflex: [boolean, boolean, boolean, boolean] = [
    angleA > 180 + EPSILON,
    angleB > 180 + EPSILON,
    angleC > 180 + EPSILON,
    angleD > 180 + EPSILON,
  ];
  const reflexIdx = isReflex.findIndex((r) => r);
  const reflexVertexIndex = reflexIdx !== -1 ? reflexIdx : null;
  const isConvex = isSimple && reflexVertexIndex === null;

  // Parallelism & Equalities
  const e1 = vectorBetween(a, b);
  const e2 = vectorBetween(b, c);
  const e3 = vectorBetween(c, d);
  const e4 = vectorBetween(d, a);

  const abParallelCD = areVectorsParallel(e1, { x: -e3.x, y: -e3.y });
  const bcParallelDA = areVectorsParallel(e2, { x: -e4.x, y: -e4.y });
  const oppSidesParallel: [boolean, boolean] = [abParallelCD, bcParallelDA];

  const tolLength = 0.15;
  const oppEqual1 = Math.abs(sideAB - sideCD) < tolLength;
  const oppEqual2 = Math.abs(sideBC - sideDA) < tolLength;
  const oppSidesEqual: [boolean, boolean] = [oppEqual1, oppEqual2];

  const adjEqual1 = Math.abs(sideAB - sideBC) < tolLength;
  const adjEqual2 = Math.abs(sideBC - sideCD) < tolLength;
  const adjEqual3 = Math.abs(sideCD - sideDA) < tolLength;
  const adjEqual4 = Math.abs(sideDA - sideAB) < tolLength;
  const adjSidesEqual: [boolean, boolean, boolean, boolean] = [
    adjEqual1,
    adjEqual2,
    adjEqual3,
    adjEqual4,
  ];

  // Diagonals analysis
  const diagInter = lineIntersection(a, c, b, d);
  let diagonalsBisect = false;
  let diagonalsPerpendicular = false;
  if (diagInter) {
    const distA = distanceBetween(a, diagInter);
    const distC = distanceBetween(c, diagInter);
    const distB = distanceBetween(b, diagInter);
    const distD = distanceBetween(d, diagInter);
    diagonalsBisect =
      Math.abs(distA - distC) < tolLength && Math.abs(distB - distD) < tolLength;
  }
  const vAC = vectorBetween(a, c);
  const vBD = vectorBetween(b, d);
  diagonalsPerpendicular = areVectorsPerpendicular(vAC, vBD);
  const diagonalsEqual = Math.abs(diagAC - diagBD) < tolLength;

  // Area
  const area = isSimple ? calculatePolygonArea(pts) : 0;
  // Varignon area is always exactly half the area of simple quad
  const varignonArea = area / 2;

  // Classification logic
  let kind: QuadrilateralKind = 'general_convex';
  let explanation = 'General convex quadrilateral with 4 interior angles summing to 360°.';

  if (isDegenerate) {
    kind = 'degenerate';
    explanation = 'Degenerate quadrilateral: 3 or more vertices are collinear or sides have zero length.';
  } else if (isCrossed) {
    kind = 'crossed';
    explanation = 'Crossed (self-intersecting) quadrilateral. Non-consecutive edges cross each other. Interior angles are undefined.';
  } else if (!isConvex && reflexVertexIndex !== null) {
    kind = 'concave';
    const vName = ['A', 'B', 'C', 'D'][reflexVertexIndex];
    const rDeg = interiorAngles[reflexVertexIndex].toFixed(1);
    explanation = `Concave quadrilateral: Vertex ${vName} has a reflex interior angle (${rDeg}° > 180°). All 4 interior angles still sum to 360°.`;
  } else {
    // Convex family
    const allSidesEqual = oppEqual1 && oppEqual2 && adjEqual1;
    const allAnglesRight =
      Math.abs(angleA - 90) < 2 &&
      Math.abs(angleB - 90) < 2 &&
      Math.abs(angleC - 90) < 2 &&
      Math.abs(angleD - 90) < 2;

    const isParallelogram =
      (abParallelCD && bcParallelDA) ||
      (oppEqual1 && oppEqual2) ||
      diagonalsBisect;

    if (allSidesEqual && allAnglesRight) {
      kind = 'square';
      explanation = 'Square: All 4 sides equal, all angles 90°, diagonals equal and perpendicular bisectors.';
    } else if (allSidesEqual) {
      kind = 'rhombus';
      explanation = 'Rhombus: All 4 sides equal, opposite sides parallel, diagonals perpendicular bisectors.';
    } else if (isParallelogram && allAnglesRight) {
      kind = 'rectangle';
      explanation = 'Rectangle: Opposite sides parallel and equal, all 4 angles 90°, diagonals equal.';
    } else if (isParallelogram) {
      kind = 'parallelogram';
      explanation = 'Parallelogram: Opposite sides parallel and equal, opposite angles equal, diagonals bisect each other.';
    } else if (abParallelCD || bcParallelDA) {
      kind = 'trapezium';
      explanation = 'Trapezium: Exactly one pair of opposite sides is parallel.';
    } else if ((adjEqual1 && adjEqual3) || (adjEqual2 && adjEqual4) || (adjSidesEqual[0] && adjSidesEqual[2])) {
      kind = 'kite';
      explanation = 'Kite: Two disjoint pairs of adjacent sides are equal; diagonals are perpendicular.';
    }
  }

  return {
    kind,
    isConvex,
    isSimple,
    isDegenerate,
    isCrossed,
    sideLengths,
    diagonalLengths,
    interiorAngles,
    angleSum,
    reflexVertexIndex,
    isReflex,
    oppSidesParallel,
    oppSidesEqual,
    adjSidesEqual,
    diagonalsBisect,
    diagonalsPerpendicular,
    diagonalsEqual,
    area,
    varignonArea,
    explanation,
  };
}

// ============================================================================
// 6b. True Polygon Vertex Angle Geometry & Label Placement Helpers
// ============================================================================

export interface PolygonVertexAngle {
  vertexIndex: number;
  vertexPoint: WorldPoint;
  screenVertex: { x: number; y: number };
  interiorDegrees: number;
  isReflex: boolean; // true if interior angle > 180°
  arcStartAngle: number; // Screen radians
  arcSweep: number; // Positive sweep in screen radians (CW)
  arcRadius: number; // Adaptive screen px
  bisectorScreenAngle: number; // Screen angle pointing directly into polygon interior
  exteriorScreenAngle: number; // Screen angle pointing outward (for vertex name)
  badgePosition: { x: number; y: number }; // Screen position for angle value badge
  pointLabelPosition: { x: number; y: number }; // Screen position for point name label
}

/**
 * Computes exact interior angle geometry for each vertex of a polygon,
 * determining whether each vertex is convex (< 180°) or reflex/concave (> 180°),
 * drawing arcs that consistently stay inside the polygon interior without collapsing,
 * and positioning value badges on the interior bisector and vertex names on the exterior bisector.
 */
export function computePolygonVertexAngles(
  pts: WorldPoint[],
  viewport: QuadViewportTransform,
  width: number,
  height: number
): PolygonVertexAngle[] {
  const n = pts.length;
  if (n < 3) return [];

  // Determine polygon winding in Cartesian world coordinates
  const isCCW = isPolygonCCW(pts);
  const screenPts = pts.map((p) => worldToScreen(p, viewport, width, height));

  const result: PolygonVertexAngle[] = [];

  for (let i = 0; i < n; i++) {
    const prevIdx = (i + n - 1) % n;
    const nextIdx = (i + 1) % n;

    const pVertex = pts[i];
    const sVertex = screenPts[i];
    const sPrev = screenPts[prevIdx];
    const sNext = screenPts[nextIdx];

    const vPrevScreen = { x: sPrev.x - sVertex.x, y: sPrev.y - sVertex.y };
    const vNextScreen = { x: sNext.x - sVertex.x, y: sNext.y - sVertex.y };

    const anglePrev = Math.atan2(vPrevScreen.y, vPrevScreen.x);
    const angleNext = Math.atan2(vNextScreen.y, vNextScreen.x);

    let arcStart: number;
    let arcEnd: number;

    // In HTML5 screen coords (where Y is down):
    // If Cartesian is CCW, screen traversal is CCW, so interior sweeps from prev to next CW
    // If Cartesian is CW, screen traversal is CW, so interior sweeps from next to prev CW
    if (isCCW) {
      arcStart = anglePrev;
      arcEnd = angleNext;
    } else {
      arcStart = angleNext;
      arcEnd = anglePrev;
    }

    let sweep = arcEnd - arcStart;
    while (sweep < 0) sweep += 2 * Math.PI;
    while (sweep >= 2 * Math.PI) sweep -= 2 * Math.PI;

    const interiorDegrees = (sweep * 180) / Math.PI;
    const isReflex = interiorDegrees > 180;

    // Interior bisector is the continuous midpoint of the interior sweep
    const bisectorScreenAngle = arcStart + sweep / 2;
    // Exterior direction is opposite the interior bisector
    const exteriorScreenAngle = bisectorScreenAngle + Math.PI;

    // Adaptive arc radius: scales with edge length so arcs never clip past corners
    const dPrev = Math.hypot(vPrevScreen.x, vPrevScreen.y);
    const dNext = Math.hypot(vNextScreen.x, vNextScreen.y);
    const minEdge = Math.max(16, Math.min(dPrev, dNext));

    const arcRadius = isReflex
      ? Math.min(30, Math.max(20, minEdge * 0.28))
      : Math.min(24, Math.max(16, minEdge * 0.22));

    // Place angle value badge on interior bisector
    const badgeDistance = isReflex ? arcRadius + 24 : arcRadius + 18;
    const badgePosition = {
      x: sVertex.x + Math.cos(bisectorScreenAngle) * badgeDistance,
      y: sVertex.y + Math.sin(bisectorScreenAngle) * badgeDistance,
    };

    // Place point name label on exterior direction to prevent collision
    const pointLabelDistance = 16;
    const pointLabelPosition = {
      x: sVertex.x + Math.cos(exteriorScreenAngle) * pointLabelDistance,
      y: sVertex.y + Math.sin(exteriorScreenAngle) * pointLabelDistance,
    };

    result.push({
      vertexIndex: i,
      vertexPoint: pVertex,
      screenVertex: sVertex,
      interiorDegrees,
      isReflex,
      arcStartAngle: arcStart,
      arcSweep: sweep,
      arcRadius,
      bisectorScreenAngle,
      exteriorScreenAngle,
      badgePosition,
      pointLabelPosition,
    });
  }

  return result;
}

export interface StandaloneAngleGeometry {
  degrees: number;
  arcStartAngle: number;
  arcSweep: number;
  arcRadius: number;
  bisectorScreenAngle: number;
  badgePosition: { x: number; y: number };
}

/**
 * Computes robust minor-angle arc and badge placement for 3 standalone points (P1 -> Vertex -> P2)
 * without branch-cut discontinuity or label inversion across the negative X-axis.
 */
export function computeStandaloneAngleGeometry(
  p1: WorldPoint,
  vertex: WorldPoint,
  p2: WorldPoint,
  viewport: QuadViewportTransform,
  width: number,
  height: number,
  isReflex?: boolean
): StandaloneAngleGeometry {
  const sV = worldToScreen(vertex, viewport, width, height);
  const s1 = worldToScreen(p1, viewport, width, height);
  const s2 = worldToScreen(p2, viewport, width, height);

  const v1 = { x: s1.x - sV.x, y: s1.y - sV.y };
  const v2 = { x: s2.x - sV.x, y: s2.y - sV.y };

  const a1 = Math.atan2(v1.y, v1.x);
  const a2 = Math.atan2(v2.y, v2.x);

  let delta = a2 - a1;
  while (delta < 0) delta += 2 * Math.PI;
  while (delta >= 2 * Math.PI) delta -= 2 * Math.PI;

  let arcStart: number;
  let arcSweep: number;

  if (delta <= Math.PI) {
    arcStart = a1;
    arcSweep = delta;
  } else {
    arcStart = a2;
    arcSweep = 2 * Math.PI - delta;
  }

  let finalDegrees = (arcSweep * 180) / Math.PI;
  let bisectorScreenAngle = arcStart + arcSweep / 2;

  if (isReflex) {
    arcStart = arcStart + arcSweep;
    arcSweep = 2 * Math.PI - arcSweep;
    finalDegrees = 360 - finalDegrees;
    bisectorScreenAngle = (bisectorScreenAngle + Math.PI) % (2 * Math.PI);
  }

  const arcRadius = 24;
  const badgeDistance = arcRadius + 18;

  return {
    degrees: finalDegrees,
    arcStartAngle: arcStart,
    arcSweep,
    arcRadius,
    bisectorScreenAngle,
    badgePosition: {
      x: sV.x + Math.cos(bisectorScreenAngle) * badgeDistance,
      y: sV.y + Math.sin(bisectorScreenAngle) * badgeDistance,
    },
  };
}

// ============================================================================
// 7. Varignon Parallelogram Construct
// ============================================================================

export interface VarignonGeometry {
  pMid: WorldPoint; // Midpoint AB
  qMid: WorldPoint; // Midpoint BC
  rMid: WorldPoint; // Midpoint CD
  sMid: WorldPoint; // Midpoint DA
  pqLength: number;
  qrLength: number;
  rsLength: number;
  spLength: number;
  acDiagonal: number;
  bdDiagonal: number;
  isParallelogram: boolean;
  originalArea: number;
  varignonArea: number;
  ratio: number;
}

export function computeVarignonParallelogram(
  a: WorldPoint,
  b: WorldPoint,
  c: WorldPoint,
  d: WorldPoint
): VarignonGeometry {
  const pMid = calculateMidpoint(a, b);
  const qMid = calculateMidpoint(b, c);
  const rMid = calculateMidpoint(c, d);
  const sMid = calculateMidpoint(d, a);

  const pqLength = distanceBetween(pMid, qMid);
  const qrLength = distanceBetween(qMid, rMid);
  const rsLength = distanceBetween(rMid, sMid);
  const spLength = distanceBetween(sMid, pMid);

  const acDiagonal = distanceBetween(a, c);
  const bdDiagonal = distanceBetween(b, d);

  // By Midpoint Theorem on ΔABC and ΔADC:
  // PQ || AC and PQ = 1/2 AC
  // RS || AC and RS = 1/2 AC
  // Hence PQ || RS and PQ = RS => PQRS is always a parallelogram!
  const isParallelogram =
    Math.abs(pqLength - rsLength) < 0.1 && Math.abs(qrLength - spLength) < 0.1;

  const originalArea = calculatePolygonArea([a, b, c, d]);
  const varignonArea = calculatePolygonArea([pMid, qMid, rMid, sMid]);
  const ratio = originalArea > 0 ? varignonArea / originalArea : 0.5;

  return {
    pMid,
    qMid,
    rMid,
    sMid,
    pqLength,
    qrLength,
    rsLength,
    spLength,
    acDiagonal,
    bdDiagonal,
    isParallelogram,
    originalArea,
    varignonArea,
    ratio,
  };
}

// ============================================================================
// 8. Triangle Medians & Centroid 2:1 Ratio
// ============================================================================

export interface TriangleMediansAnalysis {
  centroid: WorldPoint;
  midBC: WorldPoint; // D
  midCA: WorldPoint; // E
  midAB: WorldPoint; // F
  medianADLength: number;
  medianBELength: number;
  medianCFLength: number;
  agLength: number;
  gdLength: number;
  bgLength: number;
  geLength: number;
  cgLength: number;
  gfLength: number;
  ratioA: number; // AG : GD (should be 2.0)
  ratioB: number; // BG : GE (should be 2.0)
  ratioC: number; // CG : GF (should be 2.0)
}

export function computeTriangleMedians(
  a: WorldPoint,
  b: WorldPoint,
  c: WorldPoint
): TriangleMediansAnalysis {
  const midBC = calculateMidpoint(b, c);
  const midCA = calculateMidpoint(c, a);
  const midAB = calculateMidpoint(a, b);
  const centroid = calculateCentroid(a, b, c);

  const medianADLength = distanceBetween(a, midBC);
  const medianBELength = distanceBetween(b, midCA);
  const medianCFLength = distanceBetween(c, midAB);

  const agLength = distanceBetween(a, centroid);
  const gdLength = distanceBetween(centroid, midBC);

  const bgLength = distanceBetween(b, centroid);
  const geLength = distanceBetween(centroid, midCA);

  const cgLength = distanceBetween(c, centroid);
  const gfLength = distanceBetween(centroid, midAB);

  const ratioA = gdLength > EPSILON ? agLength / gdLength : 2;
  const ratioB = geLength > EPSILON ? bgLength / geLength : 2;
  const ratioC = gfLength > EPSILON ? cgLength / gfLength : 2;

  return {
    centroid,
    midBC,
    midCA,
    midAB,
    medianADLength,
    medianBELength,
    medianCFLength,
    agLength,
    gdLength,
    bgLength,
    geLength,
    cgLength,
    gfLength,
    ratioA,
    ratioB,
    ratioC,
  };
}

// ============================================================================
// 9. Planar Quadrilateral Tiling (Monohedral Tessellation)
// ============================================================================

export interface TilingTile {
  id: string;
  row: number;
  col: number;
  vertices: [WorldPoint, WorldPoint, WorldPoint, WorldPoint];
  center: WorldPoint;
  isRotated180: boolean;
  colorIndex: number;
}

/**
 * Generates periodic tessellation of the plane from any simple quadrilateral.
 * Any planar quadrilateral can tile the plane because its interior angles sum to 360°.
 * A 2-quadrilateral fundamental parallelogram cell is formed by taking quad ABCD and
 * its 180° rotation about the midpoint of edge BC (or CD).
 * Repeating this fundamental cell along the two lattice vectors tiles the entire plane without gaps!
 */
export function generateQuadrilateralTiling(
  pts: [WorldPoint, WorldPoint, WorldPoint, WorldPoint],
  rows = 4,
  cols = 5
): {
  tiles: TilingTile[];
  latticeVector1: WorldPoint;
  latticeVector2: WorldPoint;
  midpointRotationCenters: WorldPoint[];
} {
  const [a, b, c, d] = pts;

  // Midpoint of BC around which we rotate 180°
  const mBC = calculateMidpoint(b, c);
  const mCD = calculateMidpoint(c, d);

  // 180° rotation of a point P around center M is P' = 2M - P
  const rotate180 = (p: WorldPoint, m: WorldPoint): WorldPoint => ({
    x: 2 * m.x - p.x,
    y: 2 * m.y - p.y,
  });

  // Rotated quad around midpoint of BC:
  // B -> C, C -> B, A -> aRot, D -> dRot
  const aRot = rotate180(a, mBC);
  const bRot = c;
  const cRot = b;
  const dRot = rotate180(d, mBC);

  // The two lattice vectors that tile the plane:
  // V1 = vector from A to aRot + offset, or vector connecting identical vertices in adjacent cells
  // Notice: In the fundamental 2-tile block, translation vectors are:
  // U = (C - B) + (D - A) = B_rot - A + ...
  const latticeVector1: WorldPoint = {
    x: (b.x - a.x) + (c.x - d.x),
    y: (b.y - a.y) + (c.y - d.y),
  };
  const latticeVector2: WorldPoint = {
    x: (d.x - a.x) + (c.x - b.x),
    y: (d.y - a.y) + (c.y - b.y),
  };

  const tiles: TilingTile[] = [];
  const startR = -Math.floor(rows / 2);
  const endR = startR + rows;
  const startC = -Math.floor(cols / 2);
  const endC = startC + cols;

  for (let r = startR; r < endR; r++) {
    for (let cIdx = startC; cIdx < endC; cIdx++) {
      const shiftX = r * latticeVector1.x + cIdx * latticeVector2.x;
      const shiftY = r * latticeVector1.y + cIdx * latticeVector2.y;

      // Base unrotated tile
      const v0: WorldPoint = { x: a.x + shiftX, y: a.y + shiftY };
      const v1: WorldPoint = { x: b.x + shiftX, y: b.y + shiftY };
      const v2: WorldPoint = { x: c.x + shiftX, y: c.y + shiftY };
      const v3: WorldPoint = { x: d.x + shiftX, y: d.y + shiftY };

      tiles.push({
        id: `tile_${r}_${cIdx}_base`,
        row: r,
        col: cIdx,
        vertices: [v0, v1, v2, v3],
        center: {
          x: (v0.x + v1.x + v2.x + v3.x) / 4,
          y: (v0.y + v1.y + v2.y + v3.y) / 4,
        },
        isRotated180: false,
        colorIndex: ((r % 2 + 2) % 2) * 2 + ((cIdx % 2 + 2) % 2),
      });

      // Complementary 180° rotated tile
      const rv0: WorldPoint = { x: aRot.x + shiftX, y: aRot.y + shiftY };
      const rv1: WorldPoint = { x: bRot.x + shiftX, y: bRot.y + shiftY };
      const rv2: WorldPoint = { x: cRot.x + shiftX, y: cRot.y + shiftY };
      const rv3: WorldPoint = { x: dRot.x + shiftX, y: dRot.y + shiftY };

      tiles.push({
        id: `tile_${r}_${cIdx}_rot`,
        row: r,
        col: cIdx,
        vertices: [rv0, rv1, rv2, rv3],
        center: {
          x: (rv0.x + rv1.x + rv2.x + rv3.x) / 4,
          y: (rv0.y + rv1.y + rv2.y + rv3.y) / 4,
        },
        isRotated180: true,
        colorIndex: (((r % 2 + 2) % 2) * 2 + ((cIdx % 2 + 2) % 2) + 1) % 4,
      });
    }
  }

  return {
    tiles,
    latticeVector1,
    latticeVector2,
    midpointRotationCenters: [mBC, mCD, calculateMidpoint(a, b), calculateMidpoint(d, a)],
  };
}

// ============================================================================
// 10. Dynamic Constraints Solver
// ============================================================================

export function solveQuadConstraints(
  points: Record<string, QuadPoint>,
  constraints: QuadConstraint[],
  draggedPointId?: string,
  segments?: Record<string, QuadSegment>
): Record<string, QuadPoint> {
  const updated = { ...points };

  // 1. First solve Midpoints & Centroids & Intersections
  for (const pt of Object.values(updated)) {
    if (pt.role === 'midpoint' && pt.parentEntityIds && pt.parentEntityIds.length >= 2) {
      const p1 = updated[pt.parentEntityIds[0]];
      const p2 = updated[pt.parentEntityIds[1]];
      if (p1 && p2) {
        updated[pt.id] = {
          ...pt,
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };
      }
    } else if (pt.role === 'triangle_centroid' && pt.parentEntityIds && pt.parentEntityIds.length >= 3) {
      const p1 = updated[pt.parentEntityIds[0]];
      const p2 = updated[pt.parentEntityIds[1]];
      const p3 = updated[pt.parentEntityIds[2]];
      if (p1 && p2 && p3) {
        updated[pt.id] = {
          ...pt,
          x: (p1.x + p2.x + p3.x) / 3,
          y: (p1.y + p2.y + p3.y) / 3,
        };
      }
    } else if (pt.role === 'diagonal_intersection' && pt.parentEntityIds && pt.parentEntityIds.length >= 4) {
      const p1 = updated[pt.parentEntityIds[0]];
      const p2 = updated[pt.parentEntityIds[1]];
      const p3 = updated[pt.parentEntityIds[2]];
      const p4 = updated[pt.parentEntityIds[3]];
      if (p1 && p2 && p3 && p4) {
        const inter = lineIntersection(p1, p3, p2, p4);
        if (inter) {
          updated[pt.id] = {
            ...pt,
            x: inter.x,
            y: inter.y,
          };
        }
      }
    }
  }

  // 2. Active Geometric Constraints
  for (const c of constraints) {
    if (!c.active) continue;

    // Parallelogram: D = A + (C - B)
    if (c.type === 'parallel_opposite' && c.targetEntityIds.length >= 4) {
      const [idA, idB, idC, idD] = c.targetEntityIds;
      const ptA = updated[idA];
      const ptB = updated[idB];
      const ptC = updated[idC];
      const ptD = updated[idD];

      if (ptA && ptB && ptC && ptD) {
        if (draggedPointId === idD) {
          updated[idC] = {
            ...ptC,
            x: ptB.x + (ptD.x - ptA.x),
            y: ptB.y + (ptD.y - ptA.y),
          };
        } else if (draggedPointId === idC) {
          updated[idD] = {
            ...ptD,
            x: ptA.x + (ptC.x - ptB.x),
            y: ptA.y + (ptC.y - ptB.y),
          };
        } else if (draggedPointId === idA) {
          updated[idD] = {
            ...ptD,
            x: ptA.x + (ptC.x - ptB.x),
            y: ptA.y + (ptC.y - ptB.y),
          };
        } else if (draggedPointId === idB) {
          updated[idC] = {
            ...ptC,
            x: ptB.x + (ptD.x - ptA.x),
            y: ptB.y + (ptD.y - ptA.y),
          };
        } else {
          updated[idD] = {
            ...ptD,
            x: ptA.x + (ptC.x - ptB.x),
            y: ptA.y + (ptC.y - ptB.y),
          };
        }
      }
    }

    // Generic Arbitrary Segments Parallel Constraint: Seg2 is constrained parallel to Seg1
    if (c.type === 'parallel_segments' && c.targetEntityIds.length >= 2 && segments) {
      const seg1 = segments[c.targetEntityIds[0]];
      const seg2 = segments[c.targetEntityIds[1]];
      if (!seg1 || !seg2) continue;

      const p1A = updated[seg1.pointAId];
      const p1B = updated[seg1.pointBId];
      const p2A = updated[seg2.pointAId];
      const p2B = updated[seg2.pointBId];
      if (!p1A || !p1B || !p2A || !p2B) continue;

      const u = { x: p1B.x - p1A.x, y: p1B.y - p1A.y };
      const lenU = Math.hypot(u.x, u.y);
      if (lenU < 1e-6) continue;
      const uHat = { x: u.x / lenU, y: u.y / lenU };

      const v = { x: p2B.x - p2A.x, y: p2B.y - p2A.y };
      const lenV = Math.hypot(v.x, v.y);
      if (lenV < 1e-6) continue;

      const dot = v.x * uHat.x + v.y * uHat.y;
      const dirSign = dot >= 0 ? 1 : -1;

      if (draggedPointId === p2B.id && !p2B.locked) {
        const t = (p2B.x - p2A.x) * uHat.x + (p2B.y - p2A.y) * uHat.y;
        updated[p2B.id] = {
          ...p2B,
          x: p2A.x + t * uHat.x,
          y: p2A.y + t * uHat.y,
        };
      } else if (draggedPointId === p2A.id && !p2A.locked) {
        const t = (p2A.x - p2B.x) * uHat.x + (p2A.y - p2B.y) * uHat.y;
        updated[p2A.id] = {
          ...p2A,
          x: p2B.x + t * uHat.x,
          y: p2A.y + t * uHat.y,
        };
      } else {
        if (!p2B.locked && p2B.role !== 'midpoint') {
          updated[p2B.id] = {
            ...p2B,
            x: p2A.x + dirSign * lenV * uHat.x,
            y: p2A.y + dirSign * lenV * uHat.y,
          };
        } else if (!p2A.locked && p2A.role !== 'midpoint') {
          updated[p2A.id] = {
            ...p2A,
            x: p2B.x - dirSign * lenV * uHat.x,
            y: p2B.y - dirSign * lenV * uHat.y,
          };
        }
      }
    }
  }

  return updated;
}

export function checkParallelism(
  p1A: WorldPoint,
  p1B: WorldPoint,
  p2A: WorldPoint,
  p2B: WorldPoint
): { isParallel: boolean; angleDiffDegrees: number } {
  const u = { x: p1B.x - p1A.x, y: p1B.y - p1A.y };
  const v = { x: p2B.x - p2A.x, y: p2B.y - p2A.y };
  const lenU = Math.hypot(u.x, u.y);
  const lenV = Math.hypot(v.x, v.y);
  if (lenU < 1e-6 || lenV < 1e-6) {
    return { isParallel: false, angleDiffDegrees: 0 };
  }
  const cross = Math.abs(u.x * v.y - u.y * v.x);
  const sinVal = Math.min(1, cross / (lenU * lenV));
  const angleDiffDegrees = (Math.asin(sinVal) * 180) / Math.PI;
  return {
    isParallel: angleDiffDegrees < 0.5,
    angleDiffDegrees,
  };
}

// ============================================================================
// 11. Viewport & Canvas Helper Utilities
// ============================================================================

export function computeQuadBoundingBox(points: WorldPoint[]): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (points.length === 0) {
    return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const pad = 1.5;
  return {
    minX: minX - pad,
    maxX: maxX + pad,
    minY: minY - pad,
    maxY: maxY + pad,
  };
}

export function calculateFitViewport(
  points: WorldPoint[],
  canvasWidth: number,
  canvasHeight: number,
  padding = 0.8
): QuadViewportTransform {
  if (points.length === 0 || canvasWidth <= 0 || canvasHeight <= 0) {
    return { zoom: 45, panX: 0, panY: 0 };
  }

  const bbox = computeQuadBoundingBox(points);
  const worldW = Math.max(bbox.maxX - bbox.minX, 4);
  const worldH = Math.max(bbox.maxY - bbox.minY, 4);

  const zoomX = (canvasWidth * padding) / worldW;
  const zoomY = (canvasHeight * padding) / worldH;
  const zoom = Math.max(20, Math.min(85, Math.min(zoomX, zoomY)));

  const centerWorldX = (bbox.minX + bbox.maxX) / 2;
  const centerWorldY = (bbox.minY + bbox.maxY) / 2;

  return {
    zoom,
    panX: -centerWorldX * zoom,
    panY: centerWorldY * zoom,
  };
}

export const LABEL_TYPOGRAPHY_CONFIGS: Record<
  LabelSizePreference,
  { fontSize: number; haloRadius: number; pillPaddingX: number; pillPaddingY: number }
> = {
  small: { fontSize: 11, haloRadius: 3, pillPaddingX: 5, pillPaddingY: 2 },
  normal: { fontSize: 13, haloRadius: 4, pillPaddingX: 7, pillPaddingY: 3 },
  large: { fontSize: 16, haloRadius: 5, pillPaddingX: 9, pillPaddingY: 4 },
};

export function drawHaloText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize: number,
  color = '#ffffff',
  haloColor = 'rgba(15, 23, 42, 0.9)'
): void {
  ctx.save();
  ctx.font = `600 ${fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Halo stroke
  ctx.strokeStyle = haloColor;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeText(text, x, y);

  // Fill text
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontSize = 12,
  bgColor = 'rgba(15, 23, 42, 0.85)',
  borderColor = 'rgba(148, 163, 184, 0.3)',
  textColor = '#f8fafc'
): void {
  ctx.save();
  ctx.font = `bold ${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`;
  const metrics = ctx.measureText(text);
  const paddingX = 7;
  const paddingY = 3.5;
  const w = metrics.width + paddingX * 2;
  const h = fontSize + paddingY * 2;
  const rx = x - w / 2;
  const ry = y - h / 2;
  const radius = h / 2;

  // Background rounded rectangle
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, radius);
  ctx.fillStyle = bgColor;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // Text
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 0.5);
  ctx.restore();
}

// ============================================================================
// 12. Practice Answer Validation
// ============================================================================

export function validatePracticeAnswer(
  userAnswer: string | number,
  correctAnswer: string | number,
  tolerance = 0.5
): boolean {
  if (typeof correctAnswer === 'number') {
    const parsed = parseFloat(String(userAnswer).trim());
    if (isNaN(parsed)) return false;
    return Math.abs(parsed - correctAnswer) <= tolerance;
  }

  // String comparison (normalized)
  const normUser = String(userAnswer).trim().toLowerCase().replace(/\s+/g, ' ');
  const normCorrect = String(correctAnswer).trim().toLowerCase().replace(/\s+/g, ' ');

  if (normUser === normCorrect) return true;

  // Also check if numeric comparison works
  const numUser = parseFloat(normUser);
  const numCorrect = parseFloat(normCorrect);
  if (!isNaN(numUser) && !isNaN(numCorrect)) {
    return Math.abs(numUser - numCorrect) <= tolerance;
  }

  return false;
}
