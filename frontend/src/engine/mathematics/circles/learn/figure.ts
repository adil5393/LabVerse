/**
 * Circle figures for the Learn lessons (EDU-1).
 *
 * A Figure is plain data: a radius and some points described by their angle on
 * the circle. EVERYTHING else (coordinates, lengths, angles, distances, the
 * drawing itself and every expected answer) is derived from it, so diagrams,
 * givens and answers cannot disagree. Measurements reuse the existing Circles
 * geometry engine; this file never re-implements it.
 */

import { calculateAngleDegrees, distanceBetween, getCircumferenceCoords } from '../geometry';
import type { CircleObject, WorldPoint } from '../types';

export interface FigPoint { id: string; angle: number }
export interface FigSegment { id: string; from: string; to: string; kind?: 'radius' | 'chord' | 'diameter' | 'plain' }
/** An arc drawn counter-clockwise from point `from` to point `to`. */
export interface FigArc { id: string; from: string; to: string }
export interface FigAngle { id: string; a: string; v: string; b: string }

export interface Figure {
  r: number;
  /** Points ON the circle, by angle in degrees counter-clockwise from the positive x-axis. */
  points: FigPoint[];
  /** The centre is always the point 'O'. The midpoint of a chord is named `mid:A:B`. */
  segments?: FigSegment[];
  angles?: FigAngle[];
  arcs?: FigArc[];
  /** Mark right angles at these [a, vertex, b] triples. */
  rightAngles?: [string, string, string][];
  /** Chords to show equal-length tick marks on. */
  equalMarks?: string[][];
}

const CENTRE: WorldPoint = { x: 0, y: 0 };
const circleOf = (r: number): CircleObject => ({ id: 'c', name: 'c', center: CENTRE, radius: r });
export const rad = (deg: number): number => (deg * Math.PI) / 180;
export const norm360 = (deg: number): number => ((deg % 360) + 360) % 360;

export function pointPos(fig: Figure, id: string): WorldPoint {
  if (id === 'O') return CENTRE;
  if (id.startsWith('mid:')) {
    // The midpoint of a chord is also the foot of the perpendicular from the centre.
    const [, a, b] = id.split(':');
    const A = pointPos(fig, a), B = pointPos(fig, b);
    return { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
  }
  const p = fig.points.find((q) => q.id === id);
  if (!p) throw new Error(`Unknown figure point ${id}`);
  return getCircumferenceCoords(circleOf(fig.r), rad(p.angle));
}

export const chordLength = (fig: Figure, a: string, b: string): number => distanceBetween(pointPos(fig, a), pointPos(fig, b));

/** Measured angle at vertex v, in degrees (the existing engine, 0 to 180). */
export const angleAt = (fig: Figure, a: string, v: string, b: string): number => calculateAngleDegrees(pointPos(fig, a), pointPos(fig, v), pointPos(fig, b));

/** Perpendicular distance from the centre to chord AB (the midpoint of a chord is the foot). */
export const distanceToChord = (fig: Figure, a: string, b: string): number => distanceBetween(CENTRE, pointPos(fig, `mid:${a}:${b}`));

export const withAngle = (fig: Figure, id: string, angle: number): Figure => ({ ...fig, points: fig.points.map((p) => (p.id === id ? { ...p, angle: norm360(angle) } : p)) });
export const angleOfPoint = (fig: Figure, id: string): number => fig.points.find((p) => p.id === id)!.angle;

/** Angle in degrees at which a chord of length L subtends the centre: the exact inverse used to build figures. */
export const centralAngleForChord = (r: number, L: number): number => (2 * Math.asin(Math.min(1, L / (2 * r))) * 180) / Math.PI;

/** Is `p` on the major-arc side of chord AB (the arc "outside" the minor arc AB)? */
export function onMajorArcSide(fig: Figure, a: string, b: string, p: string): boolean {
  const A = pointPos(fig, a), B = pointPos(fig, b), P = pointPos(fig, p);
  const centreSide = Math.sign((B.x - A.x) * (CENTRE.y - A.y) - (B.y - A.y) * (CENTRE.x - A.x));
  const pSide = Math.sign((B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x));
  return centreSide === 0 || centreSide === pSide;
}

/** Are the four points on one circle through the first three? Uses the converse of the cyclic-quadrilateral test numerically. */
export function allOnCircle(fig: Figure, ids: string[], tol = 1e-3): boolean {
  return ids.every((id) => Math.abs(distanceBetween(CENTRE, pointPos(fig, id)) - fig.r) < tol);
}

/**
 * Keep `angle` inside the counter-clockwise interval [from, to] (degrees),
 * snapping to the nearer end when outside it.
 */
export function clampToArc(angle: number, [from, to]: [number, number]): number {
  const span = norm360(to - from) || 360;
  const t = norm360(angle - from);
  if (t <= span) return norm360(angle);
  return t - span < 360 - t ? norm360(to) : norm360(from);
}

// ---------------------------------------------------------------------------
// Symmetry helpers (angles on the circle)
// ---------------------------------------------------------------------------

export const rotateAngle = (deg: number, by: number): number => norm360(deg + by);
/** Reflect an angle across the diameter that lies along direction `axisDeg`. */
export const reflectAngle = (deg: number, axisDeg: number): number => norm360(2 * axisDeg - deg);

// ---------------------------------------------------------------------------
// Figure builders (so every lesson uses consistent, named, checked figures)
// ---------------------------------------------------------------------------

/** A chord AB of length L placed symmetrically about the +y direction, so it is horizontal. */
export function chordFigure(r: number, L: number, extra: Partial<Figure> = {}): Figure {
  const half = centralAngleForChord(r, L) / 2;
  return {
    r,
    points: [{ id: 'A', angle: 90 + half }, { id: 'B', angle: 90 - half }],
    segments: [
      { id: 'AB', from: 'A', to: 'B', kind: 'chord' },
      { id: 'OA', from: 'O', to: 'A', kind: 'radius' },
      { id: 'OB', from: 'O', to: 'B', kind: 'radius' },
      { id: 'OM', from: 'O', to: 'mid:A:B', kind: 'plain' },
    ],
    rightAngles: [['O', 'mid:A:B', 'A']],
    ...extra,
  };
}

/** Arc AB with a central angle `central` (degrees) and point P on the major arc. */
export function arcFigure(r: number, central: number, pAngle?: number, extra: Partial<Figure> = {}): Figure {
  const A = 90 + central / 2, B = 90 - central / 2;
  const P = pAngle ?? 270; // the middle of the major arc
  return {
    r,
    points: [{ id: 'A', angle: A }, { id: 'B', angle: B }, { id: 'P', angle: P }],
    segments: [
      { id: 'OA', from: 'O', to: 'A', kind: 'radius' },
      { id: 'OB', from: 'O', to: 'B', kind: 'radius' },
      { id: 'PA', from: 'P', to: 'A', kind: 'chord' },
      { id: 'PB', from: 'P', to: 'B', kind: 'chord' },
    ],
    angles: [{ id: 'AOB', a: 'A', v: 'O', b: 'B' }, { id: 'APB', a: 'A', v: 'P', b: 'B' }],
    arcs: [{ id: 'arcAB', from: 'B', to: 'A' }],
    ...extra,
  };
}
