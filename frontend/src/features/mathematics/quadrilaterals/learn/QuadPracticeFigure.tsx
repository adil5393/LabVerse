/**
 * Static figure for a Quadrilaterals practice question (`quadPracticeScene` visual): the question's own points, segments and
 * highlighted angles, with the known values written beside the figure. No measured values are shown.
 */

import React from 'react';
import type { VisualProps } from '../../../education/visuals';
import type { PracticeQuestion } from '../../../../engine/mathematics/quadrilaterals/types';

const SIZE = 320;
const PAD = 40;

export const QuadPracticeFigure: React.FC<VisualProps> = ({ props, alt }) => {
  const g = props.givens as PracticeQuestion['diagramGivens'];
  const pts = g ? Object.entries(g.points) : [];
  if (!g || pts.length < 2) return <p className="text-xs text-slate-400 p-3">{alt}</p>;
  const xs = pts.map(([, p]) => p.x); const ys = pts.map(([, p]) => p.y);
  const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
  const s = (SIZE - 2 * PAD) / Math.max(maxX - minX, maxY - minY, 1);
  const P = (id: string) => { const p = g.points[id]; return p ? { x: PAD + (p.x - minX) * s, y: SIZE - PAD - (p.y - minY) * s } : null; };
  const cx = pts.reduce((n, [, p]) => n + p.x, 0) / pts.length; const cy = pts.reduce((n, [, p]) => n + p.y, 0) / pts.length;
  const C = { x: PAD + (cx - minX) * s, y: SIZE - PAD - (cy - minY) * s };
  // With no explicit segments, the points (in order) form the figure's sides.
  const segs = g.segments?.length ? g.segments : pts.map(([id], i) => ({ pointA: id, pointB: pts[(i + 1) % pts.length][0], style: 'solid' as const, label: undefined }));
  return (
    <figure className="m-0 space-y-2" data-testid="quad-practice-figure">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={alt} className="w-full max-w-[360px] mx-auto block">
        {segs.map((sg, i) => { const a = P(sg.pointA); const b = P(sg.pointB); return a && b ? <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#22d3ee" strokeWidth="2.5" strokeDasharray={sg.style === 'dashed' ? '6 4' : undefined} /> : null; })}
        {(g.highlightAngles ?? []).map((h, i) => { const v = P(h.vertex); return v ? <circle key={i} cx={v.x} cy={v.y} r="14" fill="none" stroke="#34d399" strokeWidth="2" /> : null; })}
        {pts.map(([id]) => { const p = P(id)!; const dx = p.x - C.x; const dy = p.y - C.y; const d = Math.hypot(dx, dy) || 1; return <g key={id}><circle cx={p.x} cy={p.y} r="4" fill="#38bdf8" /><text x={p.x + (dx / d) * 16} y={p.y + (dy / d) * 16 + 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#e2e8f0">{id}</text></g>; })}
      </svg>
      {g.knownValues && <figcaption className="text-xs text-slate-300 text-center">Given: {Object.entries(g.knownValues).map(([k, v]) => `${k} = ${v}`).join(', ')}</figcaption>}
    </figure>
  );
};
