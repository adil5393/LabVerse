/**
 * Static figure for a Circles practice question (`circlePracticeScene` visual). Draws the question's own exact scene (the same
 * `PracticeSceneDefinition` the older guided workbench loaded into the canvas), so the numbers in the question and the drawing
 * agree. Labels only; no measured values are shown, because the student is asked to find them.
 */

import React from 'react';
import type { VisualProps } from '../../../education/visuals';
import type { PracticeSceneDefinition } from '../../../../engine/mathematics/circles/types';
import { getCircumferenceCoords } from '../../../../engine/mathematics/circles/geometry';

const SIZE = 320;
const PAD = 36;

export const CirclePracticeFigure: React.FC<VisualProps> = ({ props, alt }) => {
  const scene = props.scene as PracticeSceneDefinition | undefined;
  const circle = scene?.circles[0];
  if (!scene || !circle) return <p className="text-xs text-slate-400 p-3">{alt}</p>;
  const s = (SIZE / 2 - PAD) / circle.radius;
  const toPx = (p: { x: number; y: number }) => ({ x: SIZE / 2 + (p.x - circle.center.x) * s, y: SIZE / 2 - (p.y - circle.center.y) * s });
  const O = toPx(circle.center);
  const pts = Object.fromEntries(scene.circumferencePoints.map((p) => [p.id, { ...p, px: toPx(getCircumferenceCoords(circle, p.angleRad)) }]));
  const at = (id: string) => (id === 'center' ? O : pts[id]?.px);
  const label = (p: { x: number; y: number }, text: string, key: string) => {
    const dx = p.x - O.x; const dy = p.y - O.y; const d = Math.hypot(dx, dy) || 1;
    return <text key={key} x={p.x + (dx / d) * 14} y={p.y + (dy / d) * 14 + 4} textAnchor="middle" fontSize="13" fill="#e2e8f0" fontWeight="700">{text}</text>;
  };
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={alt} className="w-full max-w-[360px] mx-auto block" data-testid="circle-practice-figure">
      <circle cx={O.x} cy={O.y} r={circle.radius * s} fill="none" stroke="#475569" strokeWidth="2" />
      {scene.cyclicQuads.map((q) => {
        const ps = [q.pointAId, q.pointBId, q.pointCId, q.pointDId].map(at).filter(Boolean) as { x: number; y: number }[];
        return <polygon key={q.id} points={ps.map((p) => `${p.x},${p.y}`).join(' ')} fill="rgba(56,189,248,0.08)" stroke="#38bdf8" strokeWidth="2" />;
      })}
      {scene.radiusDiameters.map((r) => {
        const a = at(r.pointId); const b = r.type === 'diameter' && r.point2Id ? at(r.point2Id) : O;
        return a && b ? <line key={r.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={r.type === 'diameter' ? '#a78bfa' : '#fbbf24'} strokeWidth="2" /> : null;
      })}
      {scene.tangents.map((t) => {
        const c = pts[t.contactPointId];
        if (!c) return null;
        // The tangent at the contact point is perpendicular to the radius there.
        const dx = c.px.x - O.x; const dy = c.px.y - O.y; const d = Math.hypot(dx, dy) || 1;
        const ux = -dy / d; const uy = dx / d; const half = (t.length * s) / 2;
        return <line key={t.id} x1={c.px.x - ux * half} y1={c.px.y - uy * half} x2={c.px.x + ux * half} y2={c.px.y + uy * half} stroke="#fb7185" strokeWidth="2.5" />;
      })}
      {scene.chords.map((c) => {
        const a = at(c.pointAId); const b = at(c.pointBId);
        return a && b ? <line key={c.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#22d3ee" strokeWidth="2.5" /> : null;
      })}
      {scene.angles.map((g) => {
        const v = at(g.vertexId); const a = at(g.point1Id); const b = at(g.point2Id);
        if (!v || !a || !b) return null;
        return <g key={g.id}><line x1={v.x} y1={v.y} x2={a.x} y2={a.y} stroke="#34d399" strokeWidth="1.5" strokeDasharray={g.isCentral ? '0' : '4 3'} /><line x1={v.x} y1={v.y} x2={b.x} y2={b.y} stroke="#34d399" strokeWidth="1.5" strokeDasharray={g.isCentral ? '0' : '4 3'} /></g>;
      })}
      <circle cx={O.x} cy={O.y} r="3.5" fill="#e2e8f0" />
      <text x={O.x + 8} y={O.y + 16} fontSize="13" fill="#e2e8f0" fontWeight="700">O</text>
      {Object.values(pts).map((p) => <g key={p.id}><circle cx={p.px.x} cy={p.px.y} r="4" fill="#38bdf8" />{label(p.px, p.name, `${p.id}-l`)}</g>)}
    </svg>
  );
};
