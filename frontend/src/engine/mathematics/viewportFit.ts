import type { MathViewportTransform } from './types';

/** Fit a construction and the origin into the measured canvas, with room for labels and touch handles. */
export function fitMathViewport(points: { x: number; y: number }[], width: number, height: number, unitPixels: number): MathViewportTransform {
  const xs = [0, ...points.map((p) => p.x)], ys = [0, ...points.map((p) => p.y)];
  const left = Math.min(...xs), right = Math.max(...xs), bottom = Math.min(...ys), top = Math.max(...ys);
  const scale = Math.min(Math.max(1, width - 144) / Math.max(6, right - left), Math.max(1, height - 144) / Math.max(6, top - bottom));
  const zoom = Math.min(2, Math.max(0.05, scale / unitPixels));
  return { zoom, unitPixels, panX: width / 2 - (left + right) / 2 * unitPixels * zoom, panY: height / 2 + (bottom + top) / 2 * unitPixels * zoom };
}
