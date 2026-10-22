/** Shared pieces for the machine scenes (PHY-3D): an arrow, a work-bars chart and the "how far through" control. */

import React, { useRef } from 'react';
import { useDiagramLayout } from '../shared/viewportProfiles';
import { f2 } from './MachineUtil';

export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dash?: string }> = ({ x1, y1, x2, y2, color, width = 3, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} /><polygon points={`${x2},${y2} ${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)} ${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)}`} fill={color} /></g>;
};

export interface WorkBar { id: string; label: string; value: number; color: string }

/** Horizontal bars for the work put in, the useful work and the rest, all on the same scale. */
export const WorkBars: React.FC<{ bars: WorkBar[]; title: string; alt: string }> = ({ bars, title, alt }) => {
  const max = Math.max(1e-9, ...bars.map((b) => b.value));
  const ref = useRef<SVGSVGElement>(null);
  const { width } = useDiagramLayout(ref, 440, 200);
  const left = 12, usable = width - 24;
  return (
    <svg ref={ref} viewBox={`0 0 ${width} ${bars.length * 58 + 32}`} role="img" aria-label={alt} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="work-bars">
      <text x={8} y={16} fontSize={11} fill="#94A3B8">{title}</text>
      {bars.map((b, i) => (
        <g key={b.id} data-bar={b.id} data-value={b.value}>
          <text x={left} y={36 + i * 58} fontSize={12} fontWeight={700} fill={b.color}>{b.label}</text>
          <rect x={left} y={44 + i * 58} width={Math.max(0, (b.value / max) * usable)} height={14} rx={3} fill={b.color} opacity={0.9} />
          <text x={width - 12} y={73 + i * 58} textAnchor="end" fontSize={12} fill="#e2e8f0">{f2(b.value)} J</text>
        </g>
      ))}
    </svg>
  );
};

export const ProgressControl: React.FC<{ value: number; onChange: (p: number) => void; label: string; testid: string; unit: string }> = ({ value, onChange, label, testid, unit }) => (
  <label className="flex flex-wrap items-center gap-2 text-xs text-slate-300 flex-1 min-w-0"><span className="basis-full">{label}</span>
    <input type="range" min={0} max={1} step={0.01} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} aria-valuetext={`${Math.round(value * 100)} percent: ${unit}`} className="flex-1 min-h-[44px]" data-testid={testid} />
    <span className="font-mono w-14 text-right">{Math.round(value * 100)}%</span>
  </label>
);
