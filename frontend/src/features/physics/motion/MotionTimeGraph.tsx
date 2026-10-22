import { useDiagramLayout } from '../shared/viewportProfiles';
/**
 * Time graphs of the recorded track path, sampled from the same model the track draws (sampleAt). Position, distance and the size of
 * the displacement against simulated time, with a cursor at the current time. Presentation only; nothing here computes physics.
 */

import React, { useRef } from 'react';
import { metres, sampleAt, totalDurationMs, type MotionPath } from '../../../engine/physics/motion/kinematics';
import { PHYS } from './physicsColors';

const L = 38, R = 10, T = 12, B = 28;

interface Line { label: string; color: string; pts: [number, number][]; dashed?: boolean }

const Plot: React.FC<{ title: string; yLabel: string; lines: Line[]; totalS: number; nowS: number; testId: string }> = ({ title, yLabel, lines, totalS, nowS, testId }) => {
  const diagramRef = useRef<SVGSVGElement>(null);
  const { width: W, height: H } = useDiagramLayout(diagramRef, 320, 190);
  const ys = lines.flatMap((l) => l.pts.map((p) => p[1]));
  let lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
  if (hi - lo < 1) { hi += 0.5; lo -= 0.5; }
  const X = (t: number) => L + (t / Math.max(totalS, 1e-9)) * (W - L - R);
  const Y = (v: number) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  return (
    <figure className="rounded-lg border border-surface-border bg-surface-lowest p-2 min-w-0 w-full sm:min-w-[220px] flex-1 flex flex-col justify-between shrink-0" data-testid={testId}>
      <figcaption className="text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">{title}</figcaption>
      <svg ref={diagramRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto flex-1 min-h-[85px] max-h-[220px] shrink" role="img" aria-label={`${title}. ${lines.map((l) => l.label).join(', ')} against simulated time.`}>
        <line x1={L} y1={Y(0)} x2={W - R} y2={Y(0)} stroke="#475569" strokeWidth={1} />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke="#475569" strokeWidth={1} />
        <text x={L - 4} y={T + 4} textAnchor="end" fill="#94a3b8" fontSize={12}>{Math.round(hi * 10) / 10}</text>
        <text x={L - 4} y={H - B} textAnchor="end" fill="#94a3b8" fontSize={12}>{Math.round(lo * 10) / 10}</text>
        <text x={W - R} y={H - B + 14} textAnchor="end" fill="#94a3b8" fontSize={12}>t (s) → {totalS}</text>
        <text x={L + 2} y={H - 4} fill="#94a3b8" fontSize={12}>{yLabel}</text>
        {lines.map((l) => (
          <polyline key={l.label} fill="none" stroke={l.color} strokeWidth={2.5} strokeDasharray={l.dashed ? '5 3' : undefined} points={l.pts.map(([t, v]) => `${X(t)},${Y(v)}`).join(' ')} />
        ))}
        <line x1={X(nowS)} y1={T} x2={X(nowS)} y2={H - B} stroke={PHYS.time} strokeWidth={1.5} strokeDasharray="3 3" />
      </svg>
      <div className="flex flex-wrap gap-x-3 text-[10px] mt-1">{lines.map((l) => <span key={l.label} style={{ color: l.color }}>{l.dashed ? '╌' : '━'} {l.label}</span>)}</div>
    </figure>
  );
};

export const MotionTimeGraphs: React.FC<{ path: MotionPath; tMs: number }> = ({ path, tMs }) => {
  const total = totalDurationMs(path);
  if (total === 0) return <p className="text-xs text-slate-400" data-testid="motion-graphs-empty">Make a move on the track and the position, distance and displacement graphs appear here.</p>;
  const n = Math.min(120, Math.max(24, Math.round(total / 100)));
  const samples = Array.from({ length: n + 1 }, (_, i) => sampleAt(path, (i / n) * total));
  const pts = (f: (s: (typeof samples)[number]) => number): [number, number][] => samples.map((s) => [s.tMs / 1000, f(s)]);
  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch w-full min-h-0" data-testid="motion-graphs">
      <Plot testId="graph-position" title="Position – time" yLabel="x (m)" totalS={total / 1000} nowS={Math.min(tMs, total) / 1000}
        lines={[{ label: 'position x', color: PHYS.position, pts: pts((s) => metres(s.positionCm)) }]} />
      <Plot testId="graph-distance" title="Distance and displacement – time" yLabel="metres" totalS={total / 1000} nowS={Math.min(tMs, total) / 1000}
        lines={[{ label: 'distance', color: PHYS.distance, pts: pts((s) => metres(s.distanceCm)) }, { label: 'displacement', color: PHYS.displacement, dashed: true, pts: pts((s) => metres(s.displacementCm)) }]} />
    </div>
  );
};
