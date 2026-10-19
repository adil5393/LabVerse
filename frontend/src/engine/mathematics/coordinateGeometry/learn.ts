/**
 * Pure coordinate-geometry helpers for the Learn lessons (EDU-1).
 *
 * Diagrams, givens and expected answers are all derived from these functions,
 * so what a student sees and what is marked correct cannot drift apart.
 * Distance reuses the workbench's calculateDistance.
 */

import { calculateDistance } from '../calculations';

export interface Pt {
  x: number;
  y: number;
}

export type Locus =
  | { kind: 'quadrant'; n: 1 | 2 | 3 | 4 }
  | { kind: 'x-axis' }
  | { kind: 'y-axis' }
  | { kind: 'origin' };

/** Where a point lies. Points on an axis belong to no quadrant. */
export function locate({ x, y }: Pt): Locus {
  if (x === 0 && y === 0) return { kind: 'origin' };
  if (y === 0) return { kind: 'x-axis' };
  if (x === 0) return { kind: 'y-axis' };
  if (x > 0 && y > 0) return { kind: 'quadrant', n: 1 };
  if (x < 0 && y > 0) return { kind: 'quadrant', n: 2 };
  if (x < 0 && y < 0) return { kind: 'quadrant', n: 3 };
  return { kind: 'quadrant', n: 4 };
}

export const ROMAN: Record<1 | 2 | 3 | 4, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

export function describeLocus(l: Locus): string {
  switch (l.kind) {
    case 'quadrant': return `Quadrant ${ROMAN[l.n]}`;
    case 'x-axis': return 'on the x-axis';
    case 'y-axis': return 'on the y-axis';
    case 'origin': return 'at the origin';
  }
}

/** Answer id used by visuals and questions for a grid point. */
export const pointId = (x: number, y: number): string => `${x},${y}`;
export const parsePointId = (id: string): Pt | null => {
  const m = /^(-?\d+),(-?\d+)$/.exec(id);
  return m ? { x: Number(m[1]), y: Number(m[2]) } : null;
};

export const swapCoordinates = (p: Pt): Pt => ({ x: p.y, y: p.x });
export const fmtPoint = (p: Pt): string => `(${p.x}, ${p.y})`;
export const fmtNum = (n: number): string => String(Math.round(n * 1e6) / 1e6).replace('-', '−');

/** Distance from each axis: |y| from the x-axis, |x| from the y-axis. */
export const distanceFromAxes = (p: Pt) => ({ fromXAxis: Math.abs(p.y), fromYAxis: Math.abs(p.x) });

/** Horizontal and vertical legs of the right triangle between two points. */
export function legs(a: Pt, b: Pt) {
  return { dx: Math.abs(b.x - a.x), dy: Math.abs(b.y - a.y) };
}

export const distance = (a: Pt, b: Pt): number => calculateDistance(a, b);
export const midpointOf = (a: Pt, b: Pt): Pt => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Squared distance, exact for integer inputs. */
export const distanceSquared = (a: Pt, b: Pt): number => (b.x - a.x) ** 2 + (b.y - a.y) ** 2;

// ---------------------------------------------------------------------------
// Plane geometry for the SVG visuals
// ---------------------------------------------------------------------------

export interface PlaneRange {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface PlaneView {
  range: PlaneRange;
  width: number;
  height: number;
  pad: number;
  unit: number;
}

export function makePlaneView(range: PlaneRange, width = 480, pad = 28): PlaneView {
  const unit = (width - 2 * pad) / (range.xMax - range.xMin);
  const height = unit * (range.yMax - range.yMin) + 2 * pad;
  return { range, width, height, pad, unit };
}

export const toScreen = (v: PlaneView, p: Pt): Pt => ({
  x: v.pad + (p.x - v.range.xMin) * v.unit,
  y: v.pad + (v.range.yMax - p.y) * v.unit,
});

export const toMath = (v: PlaneView, s: Pt): Pt => ({
  x: v.range.xMin + (s.x - v.pad) / v.unit,
  y: v.range.yMax - (s.y - v.pad) / v.unit,
});

export const clampToRange = (r: PlaneRange, p: Pt): Pt => ({
  x: Math.min(r.xMax, Math.max(r.xMin, p.x)),
  y: Math.min(r.yMax, Math.max(r.yMin, p.y)),
});

/** Snap a continuous point to the nearest grid intersection inside the range. */
export const snapToGrid = (r: PlaneRange, p: Pt): Pt =>
  clampToRange(r, { x: Math.round(p.x) + 0, y: Math.round(p.y) + 0 });
