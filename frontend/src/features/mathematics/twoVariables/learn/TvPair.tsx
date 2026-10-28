/**
 * Two lines on one plane (`tvPair` visual) for the pairs-of-equations lessons. Each line is a1x + b1y + c1 = 0 (c on the left, as
 * in the textbook). The intersection, when there is exactly one, is computed exactly by Cramer's rule and marked; parallel and
 * coincident lines are labelled. Nothing is measured off the drawing.
 */

import React from 'react';
import type { VisualProps } from '../../../education/visuals';
import { pairRelation } from '../../../../engine/mathematics/twoVariables/learn/pairs';

type Eq = [number, number, number];
const SIZE = 320;
const COLORS = ['#38bdf8', '#f59e0b'];

export const TvPair: React.FC<VisualProps> = ({ props, alt }) => {
  const { eqs, extent = 10, labels = ['Line 1', 'Line 2'] } = props as unknown as { eqs: [Eq, Eq]; extent?: number; labels?: [string, string] };
  const s = SIZE / (2 * extent);
  const X = (x: number) => SIZE / 2 + x * s;
  const Y = (y: number) => SIZE / 2 - y * s;
  const segment = ([a, b, c]: Eq) => {
    if (b !== 0) { const y = (x: number) => (-c - a * x) / b; return [X(-extent), Y(y(-extent)), X(extent), Y(y(extent))]; }
    const x = -c / a; return [X(x), Y(-extent), X(x), Y(extent)];
  };
  const rel = pairRelation(eqs[0], eqs[1]);
  return (
    <figure className="m-0 space-y-2" data-testid="tv-pair" data-relation={rel.kind}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={alt} className="w-full max-w-[360px] mx-auto block">
        <rect x="0" y="0" width={SIZE} height={SIZE} fill="#0f172a" />
        {Array.from({ length: 2 * extent + 1 }, (_, i) => i - extent).filter((k) => k % (extent > 12 ? 5 : 1) === 0).map((k) => (
          <g key={k}><line x1={X(k)} y1={0} x2={X(k)} y2={SIZE} stroke="#1e293b" /><line x1={0} y1={Y(k)} x2={SIZE} y2={Y(k)} stroke="#1e293b" /></g>
        ))}
        <line x1={0} y1={Y(0)} x2={SIZE} y2={Y(0)} stroke="#64748b" strokeWidth="1.5" />
        <line x1={X(0)} y1={0} x2={X(0)} y2={SIZE} stroke="#64748b" strokeWidth="1.5" />
        {eqs.map((e, i) => { const [x1, y1, x2, y2] = segment(e); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLORS[i]} strokeWidth={rel.kind === 'coincident' && i === 1 ? 6 : 3} strokeOpacity={rel.kind === 'coincident' && i === 1 ? 0.45 : 1} />; })}
        {rel.kind === 'unique' && Math.abs(rel.x) <= extent && Math.abs(rel.y) <= extent && (
          <g><circle cx={X(rel.x)} cy={Y(rel.y)} r="5" fill="#34d399" /><text x={X(rel.x) + 8} y={Y(rel.y) - 8} fontSize="13" fontWeight="700" fill="#e2e8f0">({rel.x}, {rel.y})</text></g>
        )}
      </svg>
      <figcaption className="text-xs text-slate-300 text-center">
        <span style={{ color: COLORS[0] }}>{labels[0]}</span> · <span style={{ color: COLORS[1] }}>{labels[1]}</span> · {rel.kind === 'unique' ? `they meet at (${rel.x}, ${rel.y})` : rel.kind === 'parallel' ? 'parallel: they never meet' : 'the same line: every point is shared'}
      </figcaption>
    </figure>
  );
};
