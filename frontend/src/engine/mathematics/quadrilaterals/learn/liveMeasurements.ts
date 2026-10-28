/**
 * Values a student can record from the live Quadrilaterals workbench during a lesson investigation (pure): every segment's length
 * and every measured angle, from the current construction.
 */

import type { QuadAngleMeasurement, QuadPoint, QuadSegment } from '../types';

export interface QuadConstruction {
  points: Record<string, QuadPoint>;
  segments: Record<string, QuadSegment>;
  angles: Record<string, QuadAngleMeasurement>;
}

const f2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

export function angleDegrees(a: { x: number; y: number }, v: { x: number; y: number }, b: { x: number; y: number }): number {
  const a1 = Math.atan2(a.y - v.y, a.x - v.x);
  const a2 = Math.atan2(b.y - v.y, b.x - v.x);
  let d = Math.abs(a1 - a2) * (180 / Math.PI);
  if (d > 180) d = 360 - d;
  return d;
}

export function liveQuadMeasurements(c: QuadConstruction, limit = 6): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  for (const s of Object.values(c.segments)) {
    const a = c.points[s.pointAId]; const b = c.points[s.pointBId];
    if (!a || !b) continue;
    out.push({ label: `${a.name}${b.name}`, value: `${f2(Math.hypot(a.x - b.x, a.y - b.y))} units` });
  }
  for (const g of Object.values(c.angles)) {
    const a = c.points[g.point1Id]; const v = c.points[g.vertexId]; const b = c.points[g.point2Id];
    if (!a || !v || !b) continue;
    const d = angleDegrees(a, v, b);
    out.push({ label: g.name, value: `${(Math.round((g.isReflex ? 360 - d : d) * 10) / 10).toFixed(1)}°` });
  }
  return out.slice(0, limit);
}
