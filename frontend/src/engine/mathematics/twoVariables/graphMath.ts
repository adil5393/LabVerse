/**
 * Pure graph geometry for the Two Variables laboratory: viewport transforms,
 * infinite-line clipping, grid ticks, constrained point dragging and the
 * explicit coefficient effect of dragging a line. Renders nothing itself.
 */

import {
  type Rational,
  neg,
  div,
  mul,
  add,
  isZero,
  toNumber,
  fromNumberFixed,
  sub,
  formatRational,
} from './rational';
import { type LinearEq, isLine, lineKind, solveForY, solveForX, xIntercept, yIntercept } from './linearEquation';

export interface Viewport {
  /** World coordinate at the centre of the canvas. */
  cx: number;
  cy: number;
  /** Pixels per world unit. */
  scale: number;
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
}

export const MIN_SCALE = 6;
export const MAX_SCALE = 240;

export const defaultViewport = (width = 800, height = 600): Viewport => ({
  cx: 0,
  cy: 0,
  scale: 40,
  width,
  height,
});

export interface Bounds {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function viewportBounds(v: Viewport): Bounds {
  const hw = v.width / (2 * v.scale);
  const hh = v.height / (2 * v.scale);
  return { xMin: v.cx - hw, xMax: v.cx + hw, yMin: v.cy - hh, yMax: v.cy + hh };
}

export const toScreen = (v: Viewport, x: number, y: number): { sx: number; sy: number } => ({
  sx: v.width / 2 + (x - v.cx) * v.scale,
  sy: v.height / 2 - (y - v.cy) * v.scale,
});

export const toWorld = (v: Viewport, sx: number, sy: number): { x: number; y: number } => ({
  x: v.cx + (sx - v.width / 2) / v.scale,
  y: v.cy - (sy - v.height / 2) / v.scale,
});

export const clampScale = (s: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

/** Zoom keeping the world point under (sx, sy) fixed on screen. */
export function zoomAt(v: Viewport, factor: number, sx: number, sy: number): Viewport {
  const before = toWorld(v, sx, sy);
  const scale = clampScale(v.scale * factor);
  const next = { ...v, scale };
  const after = toWorld(next, sx, sy);
  return { ...next, cx: v.cx + (before.x - after.x), cy: v.cy + (before.y - after.y) };
}

export function panBy(v: Viewport, dxPx: number, dyPx: number): Viewport {
  return { ...v, cx: v.cx - dxPx / v.scale, cy: v.cy + dyPx / v.scale };
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Clip the infinite line a·x + b·y + c = 0 to a rectangle. Works for vertical
 * and horizontal lines (never divides by a zero coefficient). Returns null when
 * the line misses the rectangle or the equation is degenerate.
 */
export function clipLineToBounds(e: LinearEq, bd: Bounds): Segment | null {
  if (!isLine(e)) return null;
  const a = toNumber(e.a);
  const b = toNumber(e.b);
  const c = toNumber(e.c);
  const pts: { x: number; y: number }[] = [];
  const eps = 1e-9 * Math.max(1, bd.xMax - bd.xMin, bd.yMax - bd.yMin);
  const push = (x: number, y: number) => {
    if (x < bd.xMin - eps || x > bd.xMax + eps || y < bd.yMin - eps || y > bd.yMax + eps) return;
    if (!pts.some((p) => Math.abs(p.x - x) < eps && Math.abs(p.y - y) < eps)) pts.push({ x, y });
  };
  if (b !== 0) {
    push(bd.xMin, -(a * bd.xMin + c) / b);
    push(bd.xMax, -(a * bd.xMax + c) / b);
  }
  if (a !== 0) {
    push(-(b * bd.yMin + c) / a, bd.yMin);
    push(-(b * bd.yMax + c) / a, bd.yMax);
  }
  if (pts.length < 2) return null;
  // Choose the two most distant points (handles corner hits listed twice).
  let best: [number, number] = [0, 1];
  let bestD = -1;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      if (d > bestD) {
        bestD = d;
        best = [i, j];
      }
    }
  }
  const p = pts[best[0]];
  const q = pts[best[1]];
  return { x1: p.x, y1: p.y, x2: q.x, y2: q.y };
}

/** "Nice" grid step (1, 2, 5 × 10^k) giving at least `minPx` between lines. */
export function niceStep(scale: number, minPx = 38): number {
  const raw = minPx / scale;
  const pow = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 5, 10]) {
    if (m * pow >= raw) return m * pow;
  }
  return 10 * pow;
}

/** Visible tick values for one axis range. Only visible lines are returned. */
export function gridTicks(min: number, max: number, step: number): number[] {
  const out: number[] = [];
  const first = Math.ceil(min / step - 1e-9);
  const last = Math.floor(max / step + 1e-9);
  for (let i = first; i <= last && out.length < 400; i++) {
    out.push(Number((i * step).toPrecision(12)));
  }
  return out;
}

/** Fit a viewport around a set of world points (plus the origin) with margin. */
export function fitViewport(points: { x: number; y: number }[], width: number, height: number): Viewport {
  const xs = [0, ...points.map((p) => p.x)].filter(Number.isFinite);
  const ys = [0, ...points.map((p) => p.y)].filter(Number.isFinite);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const spanX = Math.max(xMax - xMin, 4) * 1.4;
  const spanY = Math.max(yMax - yMin, 4) * 1.4;
  const scale = clampScale(Math.min(width / spanX, height / spanY));
  return { cx: (xMin + xMax) / 2, cy: (yMin + yMax) / 2, scale, width, height };
}

/** Points of interest of a line (intercepts) for fit-to-graph. */
export function interestingPoints(e: LinearEq): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const xi = xIntercept(e);
  const yi = yIntercept(e);
  if (xi.kind === 'point') pts.push({ x: toNumber(xi.value), y: 0 });
  if (yi.kind === 'point') pts.push({ x: 0, y: toNumber(yi.value) });
  return pts;
}

// ===========================================================================
// Direct manipulation
// ===========================================================================

export interface ExactPoint {
  x: Rational;
  y: Rational;
}

/**
 * Constrain a pointer position to the line and return an EXACT point on it.
 * The free coordinate is snapped to `step` (e.g. 0.5); the dependent one is
 * computed exactly from the equation, so the result is a true solution.
 * For oblique lines the more rapidly changing axis is not used as the
 * driver, which keeps steep lines draggable.
 */
export function constrainToLine(e: LinearEq, wx: number, wy: number, step = 0.5): ExactPoint | null {
  if (!isLine(e)) return null;
  const kind = lineKind(e);
  const snap = (v: number) => fromNumberFixed(Math.round(v / step) * step, 3);
  if (kind === 'vertical') {
    const xr = neg(div(e.c, e.a));
    return { x: xr, y: snap(wy) };
  }
  if (kind === 'horizontal') {
    const yr = neg(div(e.c, e.b));
    return { x: snap(wx), y: yr };
  }
  const steep = Math.abs(toNumber(e.a)) > Math.abs(toNumber(e.b));
  if (steep) {
    const y = snap(wy);
    const sx = solveForX(e, y);
    return sx.kind === 'unique' ? { x: sx.value, y } : null;
  }
  const x = snap(wx);
  const sy = solveForY(e, x);
  return sy.kind === 'unique' ? { x, y: sy.value } : null;
}

/** Foot of the perpendicular from (px, py) to the line (float, for display only). */
export function projectOntoLine(e: LinearEq, px: number, py: number): { x: number; y: number } | null {
  if (!isLine(e)) return null;
  const a = toNumber(e.a);
  const b = toNumber(e.b);
  const c = toNumber(e.c);
  const t = (a * px + b * py + c) / (a * a + b * b);
  return { x: px - a * t, y: py - b * t };
}

export interface LineDragEffect {
  before: LinearEq;
  after: LinearEq;
  /** Plain-language explanation of exactly which coefficient changed. */
  explanation: string;
}

/**
 * Plain-language description of a pure translation from `before` to `after`.
 * Callers pass the equation at the START of a drag gesture so the message
 * describes the whole move, not just the last animation frame.
 */
export function describeTranslation(before: LinearEq, after: LinearEq): string {
  const sameAB = isZero(sub(before.a, after.a)) && isZero(sub(before.b, after.b));
  if (!sameAB) return 'a and b changed, so the slope changed.';
  if (isZero(sub(before.c, after.c))) return 'The line is back where it started; a, b and c are unchanged.';
  return `Moved the line without turning it. Only c changed (from ${formatRational(before.c)} to ${formatRational(after.c)}); a and b, and therefore the slope, stayed the same.`;
}

/**
 * Drag a whole line so that it passes through the grabbed position. This is a
 * pure translation: a and b (hence slope) keep their values and ONLY c changes,
 * c = −(a·x₀ + b·y₀), with the target point snapped to `step`.
 */
export function translateLineThrough(e: LinearEq, wx: number, wy: number, step = 0.5): LineDragEffect | null {
  if (!isLine(e)) return null;
  const x0 = fromNumberFixed(Math.round(wx / step) * step, 3);
  const y0 = fromNumberFixed(Math.round(wy / step) * step, 3);
  const c = neg(add(mul(e.a, x0), mul(e.b, y0)));
  const after: LinearEq = { a: e.a, b: e.b, c };
  return {
    before: e,
    after,
    explanation: isZero(sub(c, e.c))
      ? 'The line already passes through that point; a, b and c are unchanged.'
      : describeTranslation(e, after),
  };
}
