/**
 * Computed geometry for the Propositions Learn visuals (EDU-1P).
 *
 * Every number shown next to a diagram (side lengths, angles, areas, whether
 * two triangles are congruent, what a quadrilateral built from two diagonals
 * is) is computed here from coordinates. The diagrams draw the same
 * coordinates, so figure and statement cannot disagree.
 */

export interface Pt { x: number; y: number }

export const dist = (a: Pt, b: Pt): number => Math.hypot(b.x - a.x, b.y - a.y);

/** Angle at vertex v between rays to a and b, in degrees (0 to 180). */
export function angleAt(a: Pt, v: Pt, b: Pt): number {
  const ux = a.x - v.x, uy = a.y - v.y, wx = b.x - v.x, wy = b.y - v.y;
  const m = Math.hypot(ux, uy) * Math.hypot(wx, wy);
  if (m < 1e-12) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, (ux * wx + uy * wy) / m))) * 180) / Math.PI;
}

export const triangleArea = (a: Pt, b: Pt, c: Pt): number => Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;

const EPS = 1e-6;
export const near = (a: number, b: number, eps = EPS): boolean => Math.abs(a - b) <= eps;

// ---------------------------------------------------------------------------
// Triangles
// ---------------------------------------------------------------------------

export interface TriangleFacts {
  sides: { a: number; b: number; c: number }; // a = BC, b = CA, c = AB
  angles: { A: number; B: number; C: number };
  area: number;
  equalSides: boolean; // AB = AC (the sides meeting at A)
  equalBaseAngles: boolean; // angle B = angle C
}

export function triangleFacts(A: Pt, B: Pt, C: Pt): TriangleFacts {
  const a = dist(B, C), b = dist(C, A), c = dist(A, B);
  return {
    sides: { a, b, c },
    angles: { A: angleAt(B, A, C), B: angleAt(A, B, C), C: angleAt(A, C, B) },
    area: triangleArea(A, B, C),
    equalSides: near(b, c, 1e-6),
    equalBaseAngles: near(angleAt(A, B, C), angleAt(A, C, B), 1e-4),
  };
}

/** SSS: are two triangles congruent? Compares sorted side lengths. */
export function congruentBySSS(t1: [Pt, Pt, Pt], t2: [Pt, Pt, Pt]): boolean {
  const s = (t: [Pt, Pt, Pt]) => [dist(t[0], t[1]), dist(t[1], t[2]), dist(t[2], t[0])].sort((x, y) => x - y);
  const a = s(t1), b = s(t2);
  return a.every((v, i) => near(v, b[i], 1e-6));
}

/** Third side of a triangle with two sides a, b and the angle between them (degrees). */
export const thirdSide = (a: number, b: number, angleDeg: number): number => Math.sqrt(a * a + b * b - 2 * a * b * Math.cos((angleDeg * Math.PI) / 180));

/** Triangle with legs from C of lengths a (along +x) and b at the given angle. */
export function triangleFromAngle(a: number, b: number, angleDeg: number): { A: Pt; B: Pt; C: Pt } {
  const r = (angleDeg * Math.PI) / 180;
  return { C: { x: 0, y: 0 }, B: { x: a, y: 0 }, A: { x: b * Math.cos(r), y: b * Math.sin(r) } };
}

export type RightnessVerdict = 'right' | 'acute' | 'obtuse';
/** For sides a, b, c (c the longest): compare a² + b² with c². */
export function classifyBySides(a: number, b: number, c: number): RightnessVerdict {
  const [x, y, z] = [a, b, c].sort((p, q) => p - q);
  const d = x * x + y * y - z * z;
  return Math.abs(d) < 1e-9 ? 'right' : d > 0 ? 'acute' : 'obtuse';
}

// ---------------------------------------------------------------------------
// Quadrilaterals built from two diagonals ("two sticks", textbook Exercise 17)
// ---------------------------------------------------------------------------

export interface SticksSpec {
  len1: number; // diagonal AC
  len2: number; // diagonal BD
  /** Fraction of AC from A to the crossing point O. */
  t1: number;
  /** Fraction of BD from B to the crossing point O. */
  t2: number;
  /** Angle between the sticks at O, in degrees. */
  angle: number;
}

export function quadFromSticks(s: SticksSpec): { A: Pt; B: Pt; C: Pt; D: Pt; O: Pt } {
  const O = { x: 0, y: 0 };
  // stick 1 lies along the x-axis through O
  const A = { x: -s.t1 * s.len1, y: 0 }, C = { x: (1 - s.t1) * s.len1, y: 0 };
  const r = (s.angle * Math.PI) / 180;
  const ux = Math.cos(r), uy = Math.sin(r);
  const B = { x: -s.t2 * s.len2 * ux, y: -s.t2 * s.len2 * uy }, D = { x: (1 - s.t2) * s.len2 * ux, y: (1 - s.t2) * s.len2 * uy };
  return { A, B, C, D, O };
}

export type QuadName = 'square' | 'rectangle' | 'rhombus' | 'parallelogram' | 'isosceles trapezium' | 'trapezium' | 'other quadrilateral';

export interface QuadFacts {
  name: QuadName;
  sides: number[]; // AB, BC, CD, DA
  angles: number[]; // at A, B, C, D (interior)
  diagonalAC: number;
  diagonalBD: number;
  diagonalsEqual: boolean;
  isRectangle: boolean; // all four angles are right angles
  /** Equal diagonals but not a rectangle: a counterexample to "equal diagonals imply rectangle". */
  counterexampleToConverse: boolean;
  convex: boolean;
}

const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

/** Classify the quadrilateral A-B-C-D (vertices in order). */
export function classifyQuad(A: Pt, B: Pt, C: Pt, D: Pt): QuadFacts {
  const P = [A, B, C, D];
  const crosses = P.map((p, i) => cross(p, P[(i + 1) % 4], P[(i + 2) % 4]));
  const convex = crosses.every((c) => c > 1e-9) || crosses.every((c) => c < -1e-9);
  const sides = P.map((p, i) => dist(p, P[(i + 1) % 4]));
  const angles = P.map((p, i) => angleAt(P[(i + 3) % 4], p, P[(i + 1) % 4]));
  const acLen = dist(A, C), bdLen = dist(B, D);
  const parallel = (p1: Pt, p2: Pt, q1: Pt, q2: Pt) => Math.abs((p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x)) < 1e-6 * Math.max(1, dist(p1, p2) * dist(q1, q2));
  const abCd = parallel(A, B, D, C), bcDa = parallel(B, C, A, D);
  const allRight = angles.every((a) => near(a, 90, 1e-4));
  const allSidesEqual = sides.every((s) => near(s, sides[0], 1e-6));
  let name: QuadName = 'other quadrilateral';
  if (convex) {
    if (abCd && bcDa) name = allRight ? (allSidesEqual ? 'square' : 'rectangle') : allSidesEqual ? 'rhombus' : 'parallelogram';
    else if (abCd || bcDa) {
      const legsEqual = abCd ? near(sides[1], sides[3], 1e-6) : near(sides[0], sides[2], 1e-6);
      name = legsEqual ? 'isosceles trapezium' : 'trapezium';
    }
  }
  const diagonalsEqual = near(acLen, bdLen, 1e-6);
  const isRectangle = convex && allRight;
  return { name, sides, angles, diagonalAC: acLen, diagonalBD: bdLen, diagonalsEqual, isRectangle, counterexampleToConverse: convex && diagonalsEqual && !isRectangle, convex };
}

export const factsFromSticks = (s: SticksSpec): QuadFacts => {
  const q = quadFromSticks(s);
  return classifyQuad(q.A, q.B, q.C, q.D);
};

// ---------------------------------------------------------------------------
// Factor-partner pairs (textbook Example 3)
// ---------------------------------------------------------------------------

export function factorPairs(n: number): { pairs: [number, number][]; factorCount: number; selfPaired: number | null } {
  const pairs: [number, number][] = [];
  for (let f = 1; f * f <= n; f++) if (n % f === 0) pairs.push([f, n / f]);
  const self = pairs.find(([a, b]) => a === b);
  const factorCount = pairs.reduce((c, [a, b]) => c + (a === b ? 1 : 2), 0);
  return { pairs, factorCount, selfPaired: self ? self[0] : null };
}

/** The two pairs of triangles used by the equal-area lesson (the visual draws these coordinates). */
export const AREA_PAIRS: { name: string; t1: [Pt, Pt, Pt]; t2: [Pt, Pt, Pt] }[] = [
  { name: 'Same area, different shapes', t1: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 4 }], t2: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 0, y: 3 }] },
  { name: 'Congruent triangles (one is a reflection)', t1: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 4 }], t2: [{ x: 0, y: 0 }, { x: 6, y: 0 }, { x: 6, y: 4 }] },
];

/** "a rectangle", "an isosceles trapezium", "a quadrilateral that is none of the special types". */
export const withArticle = (name: QuadName): string => (name === 'other quadrilateral' ? 'a quadrilateral that is none of the special types' : `${/^[aeiou]/.test(name) ? 'an' : 'a'} ${name}`);
