/**
 * Values a student can record from the live Circles workbench during a lesson investigation. Pure: computed from the current
 * construction with the same geometry functions the older guided inspector used for its observation table, but for every point,
 * chord and angle rather than only the first one.
 */

import { calculateAngleDegrees, calculateChordMetrics, getCircumferenceCoords } from '../geometry';
import type { CircleAngleMeasurement, CircleChord, CircleObject, CircumferencePoint } from '../types';

export interface CircleConstruction {
  circles: Record<string, CircleObject>;
  circumferencePoints: Record<string, CircumferencePoint>;
  chords: Record<string, CircleChord>;
  angles: Record<string, CircleAngleMeasurement>;
}

const f2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);

export function liveCircleMeasurements(c: CircleConstruction, limit = 6): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const circleOf = (id: string) => c.circles[id] ?? Object.values(c.circles)[0];
  for (const p of Object.values(c.circumferencePoints)) {
    const circle = circleOf(p.circleId);
    if (!circle) continue;
    const xy = getCircumferenceCoords(circle, p.angleRad);
    out.push({ label: `O${p.name}`, value: `${f2(Math.hypot(xy.x - circle.center.x, xy.y - circle.center.y))} units` });
  }
  for (const ch of Object.values(c.chords)) {
    const a = c.circumferencePoints[ch.pointAId];
    const b = c.circumferencePoints[ch.pointBId];
    const circle = a ? circleOf(a.circleId) : undefined;
    if (!a || !b || !circle) continue;
    const m = calculateChordMetrics(circle, getCircumferenceCoords(circle, a.angleRad), getCircumferenceCoords(circle, b.angleRad));
    out.push({ label: `${a.name}${b.name}`, value: `${f2(m.length)} units` });
    out.push({ label: `distance of ${a.name}${b.name} from O`, value: `${f2(m.distFromCenter)} units` });
  }
  for (const g of Object.values(c.angles)) {
    const p1 = c.circumferencePoints[g.point1Id];
    const p2 = c.circumferencePoints[g.point2Id];
    const circle = p1 ? circleOf(p1.circleId) : undefined;
    if (!p1 || !p2 || !circle) continue;
    const vertex = g.vertexId === 'center' ? circle.center : c.circumferencePoints[g.vertexId] ? getCircumferenceCoords(circle, c.circumferencePoints[g.vertexId].angleRad) : circle.center;
    const val = calculateAngleDegrees(getCircumferenceCoords(circle, p1.angleRad), vertex, getCircumferenceCoords(circle, p2.angleRad));
    out.push({ label: g.name, value: `${f1(val)}°` });
  }
  return out.slice(0, limit);
}
