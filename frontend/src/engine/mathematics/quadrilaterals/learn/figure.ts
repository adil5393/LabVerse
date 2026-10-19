/**
 * Quadrilaterals: the one geometric model behind every Learn diagram, readout,
 * text alternative and answer (EDU-1Q). Pure functions of coordinates; the
 * drawing only displays what is computed here, so a diagram can never disagree
 * with the statement beside it.
 *
 * It reuses the primitives of the existing geometry engine (midpoints, angles,
 * intersections, area, tiling). The engine's own `classifyQuadrilateral` accepts
 * lengths within 0.15 and directions within about 3 degrees, which is right for
 * a free drawing board but wrong for lessons about what a condition does or does
 * not guarantee, so the exact predicates below (tolerance 1e-6) are used here.
 */

import {
  calculateInteriorAngle, calculateMidpoint, calculatePolygonArea, calculateTriangleArea, distanceBetween, generateQuadrilateralTiling,
  isPolygonCCW, lineIntersection, segmentsIntersect,
} from '../geometry';
import type { WorldPoint } from '../types';

export type Pt = WorldPoint;
export type Quad = [Pt, Pt, Pt, Pt];
export type Tri = [Pt, Pt, Pt];
export const NAMES = ['A', 'B', 'C', 'D'] as const;

const TOL = 1e-6;
const near = (a: number, b: number) => Math.abs(a - b) <= TOL * Math.max(1, Math.abs(a), Math.abs(b));
const cross = (u: Pt, v: Pt) => u.x * v.y - u.y * v.x;
const dot = (u: Pt, v: Pt) => u.x * v.x + u.y * v.y;
const vec = (a: Pt, b: Pt): Pt => ({ x: b.x - a.x, y: b.y - a.y });
const len = (v: Pt) => Math.hypot(v.x, v.y);
/** Exactly parallel (or collinear) directions, to rounding error only. */
export const parallel = (u: Pt, v: Pt) => Math.abs(cross(u, v)) <= TOL * Math.max(1, len(u) * len(v));
export const dist = distanceBetween;
export const mid = calculateMidpoint;
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const round2 = (n: number) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------------------
// Any four points: is it a quadrilateral, what kind, which properties hold
// ---------------------------------------------------------------------------

export type QuadKind =
  | 'not-quadrilateral' | 'self-intersecting' | 'non-convex' | 'general'
  | 'parallelogram' | 'rectangle' | 'rhombus' | 'square' | 'trapezium' | 'isosceles-trapezium' | 'kite';

export const KIND_LABEL: Record<QuadKind, string> = {
  'not-quadrilateral': 'not a quadrilateral (three points on one line)',
  'self-intersecting': 'self-intersecting four-sided figure',
  'non-convex': 'non-convex quadrilateral',
  general: 'convex quadrilateral with no special pairs',
  parallelogram: 'parallelogram', rectangle: 'rectangle', rhombus: 'rhombus', square: 'square',
  trapezium: 'quadrilateral with exactly one pair of parallel sides', 'isosceles-trapezium': 'trapezium with equal non-parallel sides',
  kite: 'kite',
};

export interface QuadAnalysis {
  /** Textbook definition: four distinct points, no three collinear, no crossing sides. */
  isQuadrilateral: boolean;
  crossed: boolean;
  convex: boolean;
  /** [AB, BC, CD, DA] */
  sides: [number, number, number, number];
  /** [AC, BD] */
  diagonals: [number, number];
  /** Interior angles at A, B, C, D in degrees; null unless a quadrilateral. */
  angles: [number, number, number, number] | null;
  angleSum: number | null;
  oppSidesEqual: [boolean, boolean];
  oppSidesParallel: [boolean, boolean];
  oppAnglesEqual: [boolean, boolean];
  diagonalsBisect: boolean;
  diagonalsEqual: boolean;
  diagonalsPerpendicular: boolean;
  /** The segments AC and BD cross each other (the textbook's second test for convexity). */
  diagonalsCross: boolean;
  /** One pair of opposite sides both equal AND parallel (Theorem 5's hypothesis). */
  onePairEqualAndParallel: boolean;
  parallelogram: boolean;
  kind: QuadKind;
}

export function analyzeQuad(q: Quad): QuadAnalysis {
  const [a, b, c, d] = q;
  const sides: [number, number, number, number] = [dist(a, b), dist(b, c), dist(c, d), dist(d, a)];
  const diagonals: [number, number] = [dist(a, c), dist(b, d)];
  const triples: [Pt, Pt, Pt][] = [[a, b, c], [b, c, d], [c, d, a], [d, a, b]];
  const distinct = sides.every((s) => s > TOL);
  const collinear = triples.some(([p, r, s]) => calculateTriangleArea(p, r, s) <= TOL);
  const crossed = distinct && !collinear && (segmentsIntersect(a, b, c, d) || segmentsIntersect(b, c, d, a));
  const isQuadrilateral = distinct && !collinear && !crossed;

  let angles: QuadAnalysis['angles'] = null;
  if (isQuadrilateral) {
    const ccw = isPolygonCCW(q);
    angles = [
      calculateInteriorAngle(d, a, b, ccw), calculateInteriorAngle(a, b, c, ccw),
      calculateInteriorAngle(b, c, d, ccw), calculateInteriorAngle(c, d, a, ccw),
    ];
  }
  const convex = angles !== null && angles.every((x) => x < 180 - 1e-9);

  const e = [vec(a, b), vec(b, c), vec(c, d), vec(d, a)];
  const oppSidesParallel: [boolean, boolean] = [parallel(e[0], e[2]), parallel(e[1], e[3])];
  const oppSidesEqual: [boolean, boolean] = [near(sides[0], sides[2]), near(sides[1], sides[3])];
  const oppAnglesEqual: [boolean, boolean] = angles ? [near(angles[0], angles[2]), near(angles[1], angles[3])] : [false, false];
  const m1 = mid(a, c), m2 = mid(b, d);
  const diagonalsBisect = near(m1.x, m2.x) && near(m1.y, m2.y) && !parallel(vec(a, c), vec(b, d));
  const diagonalsEqual = near(diagonals[0], diagonals[1]);
  const diagonalsPerpendicular = Math.abs(dot(vec(a, c), vec(b, d))) <= TOL * Math.max(1, diagonals[0] * diagonals[1]);
  const diagonalsCross = segmentsIntersect(a, c, b, d);
  // "equal and parallel" for the same pair: AB and DC point in opposite directions around the figure, so AB = DC as vectors.
  const eqPar = (u: Pt, v: Pt) => parallel(u, v) && near(len(u), len(v));
  const onePairEqualAndParallel = eqPar(e[0], e[2]) || eqPar(e[1], e[3]);
  const parallelogram = isQuadrilateral && oppSidesParallel[0] && oppSidesParallel[1];

  let kind: QuadKind = 'general';
  if (!distinct || collinear) kind = 'not-quadrilateral';
  else if (crossed) kind = 'self-intersecting';
  else if (!convex) kind = 'non-convex';
  else if (parallelogram) {
    const rightAngles = angles!.every((x) => near(x, 90));
    const equalSides = sides.every((s) => near(s, sides[0]));
    kind = rightAngles && equalSides ? 'square' : rightAngles ? 'rectangle' : equalSides ? 'rhombus' : 'parallelogram';
  } else if (oppSidesParallel[0] || oppSidesParallel[1]) {
    const legs = oppSidesParallel[0] ? [sides[1], sides[3]] : [sides[0], sides[2]];
    kind = near(legs[0], legs[1]) ? 'isosceles-trapezium' : 'trapezium';
  } else if ((near(sides[0], sides[1]) && near(sides[2], sides[3])) || (near(sides[1], sides[2]) && near(sides[3], sides[0]))) kind = 'kite';

  return {
    isQuadrilateral, crossed, convex, sides, diagonals, angles,
    angleSum: angles ? angles[0] + angles[1] + angles[2] + angles[3] : null,
    oppSidesEqual, oppSidesParallel, oppAnglesEqual, diagonalsBisect, diagonalsEqual, diagonalsPerpendicular, diagonalsCross,
    onePairEqualAndParallel, parallelogram, kind,
  };
}

/** Fourth vertex that makes ABCD a parallelogram: the diagonals AC and BD then share a midpoint. */
export const completeParallelogram = (a: Pt, b: Pt, c: Pt): Pt => ({ x: a.x + c.x - b.x, y: a.y + c.y - b.y });

// ---------------------------------------------------------------------------
// Triangles: midpoint theorem, its converse, medians
// ---------------------------------------------------------------------------

export interface MidpointFacts {
  P: Pt; Q: Pt; R: Pt;
  pq: number; bc: number; ratio: number;
  parallel: boolean;
}

/** P and Q are the midpoints of AB and AC. R extends PQ by its own length (the construction used to prove the theorem). */
export function midpointFacts(t: Tri): MidpointFacts {
  const [a, b, c] = t;
  const P = mid(a, b), Q = mid(a, c);
  const R = { x: 2 * Q.x - P.x, y: 2 * Q.y - P.y };
  const pq = dist(P, Q), bc = dist(b, c);
  return { P, Q, R, pq, bc, ratio: bc > 0 ? pq / bc : 0, parallel: parallel(vec(P, Q), vec(b, c)) };
}

export interface ConverseFacts {
  P: Pt; Q: Pt;
  ap: number; ab: number; aq: number; qc: number;
  /** Q is the midpoint of AC exactly when AQ = QC. */
  bisects: boolean;
  pq: number; bc: number;
}

/** P = A + t(B - A). The line through P parallel to BC meets AC at Q (found by intersecting the two lines). */
export function converseFacts(tri: Tri, t: number): ConverseFacts {
  const [a, b, c] = tri;
  const P = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
  const Q = lineIntersection(P, { x: P.x + (c.x - b.x), y: P.y + (c.y - b.y) }, a, c) ?? a;
  const aq = dist(a, Q), qc = dist(Q, c);
  return { P, Q, ap: dist(a, P), ab: dist(a, b), aq, qc, bisects: near(aq, qc), pq: dist(P, Q), bc: dist(b, c) };
}

export interface CentroidFacts {
  D: Pt; E: Pt; F: Pt; G: Pt;
  /** AG : GD, BG : GE, CG : GF */
  ratios: [number, number, number];
  /** Distance from G to the third median CF (0 when the three medians meet at G). */
  thirdMedianMiss: number;
  medians: [number, number, number];
}

/** G is found as the intersection of medians AD and BE, NOT by averaging, so "the third median passes through it" is a real check. */
export function centroidFacts(t: Tri): CentroidFacts {
  const [a, b, c] = t;
  const D = mid(b, c), E = mid(c, a), F = mid(a, b);
  const G = lineIntersection(a, D, b, E) ?? a;
  const ratio = (v: Pt, g: Pt, m: Pt) => dist(v, g) / dist(g, m);
  const cf = vec(c, F);
  const miss = Math.abs(cross(cf, vec(c, G))) / (len(cf) || 1);
  return { D, E, F, G, ratios: [ratio(a, G, D), ratio(b, G, E), ratio(c, G, F)], thirdMedianMiss: miss, medians: [dist(a, D), dist(b, E), dist(c, F)] };
}

// ---------------------------------------------------------------------------
// Varignon parallelogram
// ---------------------------------------------------------------------------

export interface VarignonFacts {
  P: Pt; Q: Pt; R: Pt; S: Pt;
  sides: [number, number, number, number];
  /** Both pairs of opposite sides parallel, measured from the four midpoints. */
  parallelogram: boolean;
  acHalf: number; bdHalf: number;
  /** Area of PQRS over area of ABCD; only meaningful for a quadrilateral (otherwise null). */
  areaRatio: number | null;
  /** Varignon is a rhombus / rectangle exactly when the diagonals are equal / perpendicular (extension). */
  rhombus: boolean; rectangle: boolean;
}

export function varignonFacts(q: Quad): VarignonFacts {
  const [a, b, c, d] = q;
  const P = mid(a, b), Q = mid(b, c), R = mid(c, d), S = mid(d, a);
  const sides: [number, number, number, number] = [dist(P, Q), dist(Q, R), dist(R, S), dist(S, P)];
  const an = analyzeQuad(q);
  const parallelogram = parallel(vec(P, Q), vec(S, R)) && parallel(vec(Q, R), vec(P, S));
  const inner = analyzeQuad([P, Q, R, S]);
  return {
    P, Q, R, S, sides, parallelogram, acHalf: dist(a, c) / 2, bdHalf: dist(b, d) / 2,
    areaRatio: an.isQuadrilateral ? calculatePolygonArea([P, Q, R, S]) / calculatePolygonArea(q) : null,
    rhombus: inner.kind === 'rhombus' || inner.kind === 'square', rectangle: inner.kind === 'rectangle' || inner.kind === 'square',
  };
}

// ---------------------------------------------------------------------------
// Tiling
// ---------------------------------------------------------------------------

/** How much of a window is covered by 0 / exactly 1 / 2 or more tiles, sampled on a grid. */
export function tilingCoverage(q: Quad, box: { x0: number; x1: number; y0: number; y1: number }, steps = 40) {
  const { tiles } = generateQuadrilateralTiling(q, 9, 9);
  const inside = (p: Pt, v: Pt[]) => {
    let c = false;
    for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
      if ((v[i].y > p.y) !== (v[j].y > p.y) && p.x < ((v[j].x - v[i].x) * (p.y - v[i].y)) / (v[j].y - v[i].y) + v[i].x) c = !c;
    }
    return c;
  };
  let gaps = 0, overlaps = 0, total = 0;
  for (let i = 0; i < steps; i++) for (let j = 0; j < steps; j++) {
    // Offsets keep sample points off exact tile edges.
    const p = { x: box.x0 + ((i + 0.37) / steps) * (box.x1 - box.x0), y: box.y0 + ((j + 0.61) / steps) * (box.y1 - box.y0) };
    const n = tiles.filter((t) => inside(p, t.vertices)).length;
    total++;
    if (n === 0) gaps++;
    if (n > 1) overlaps++;
  }
  return { gaps, overlaps, total };
}

// ---------------------------------------------------------------------------
// Presets (every figure used by the lessons) and generated text alternatives
// ---------------------------------------------------------------------------

const P = (x: number, y: number): Pt => ({ x, y });
export const FIG = {
  parallelogram: [P(1.5, 1.5), P(6.5, 1.5), P(8.5, 5.5), P(3.5, 5.5)] as Quad,
  rectangle: [P(1.5, 2), P(8, 2), P(8, 7), P(1.5, 7)] as Quad,
  rhombus: [P(5, 1), P(8, 5), P(5, 9), P(2, 5)] as Quad,
  square: [P(2.5, 2.5), P(7.5, 2.5), P(7.5, 7.5), P(2.5, 7.5)] as Quad,
  trapezium: [P(1.5, 1.5), P(8.5, 1.5), P(6.5, 5.5), P(3, 5.5)] as Quad,
  isoscelesTrapezium: [P(1.5, 1.5), P(8.5, 1.5), P(7, 5.5), P(3, 5.5)] as Quad,
  kite: [P(1, 5), P(4, 8), P(9, 5), P(4, 2)] as Quad,
  general: [P(1.5, 1.5), P(7.5, 2.5), P(8.5, 7.5), P(3.5, 5)] as Quad,
  dart: [P(1, 2), P(5, 9), P(9, 2), P(5, 6)] as Quad,
  bowtie: [P(1.5, 1.5), P(8, 6), P(8, 1.5), P(1.5, 6)] as Quad,
  collinear: [P(1, 1.5), P(4.5, 1.5), P(8, 1.5), P(4.5, 7)] as Quad,
  /** Angle-sum worked example: 80, 100, 90 and an unknown fourth angle. */
  tri: [P(2, 2), P(8, 2.5), P(4.5, 8)] as Tri,
  triWide: [P(1.5, 2), P(8.5, 2), P(4, 8)] as Tri,
};

const fmt = (n: number) => String(round2(n));
const list = (xs: number[]) => xs.map(fmt).join(', ');

/** Text alternative generated from the coordinates themselves, never typed by hand. */
export function describeQuad(intro: string, q: Quad): string {
  const an = analyzeQuad(q);
  const verts = q.map((p, i) => `${NAMES[i]} (${fmt(p.x)}, ${fmt(p.y)})`).join(', ');
  const base = `${intro} Vertices ${verts}. It is a ${KIND_LABEL[an.kind]}.`;
  if (!an.isQuadrilateral) return base;
  return `${base} Sides AB, BC, CD, DA are ${list(an.sides)}. Angles A, B, C, D are ${list(an.angles!)} degrees. Diagonals AC and BD are ${list(an.diagonals)}; they ${an.diagonalsCross ? 'cross' : 'do not cross'}.`;
}

export function describeTri(intro: string, t: Tri): string {
  const [a, b, c] = t;
  return `${intro} Triangle ABC with A (${fmt(a.x)}, ${fmt(a.y)}), B (${fmt(b.x)}, ${fmt(b.y)}), C (${fmt(c.x)}, ${fmt(c.y)}). Sides AB, BC, CA are ${list([dist(a, b), dist(b, c), dist(c, a)])}.`;
}
