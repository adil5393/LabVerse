/**
 * A multi-line graph for energy quantities (PHY-3B/3C): several named lines against one axis, an optional shaded band,
 * a cursor at the present time or position and labelled points. Colour is always paired with a name in the key and in the
 * text alternative. All data come from the model that is drawn elsewhere on the page.
 */

import React from 'react';
import { PHYS } from '../motion/physicsColors';

const GW = 320, GH = 200, ML = 48, MR = 12, MT = 14, MB = 36;
const niceStep = (span: number): number => { for (const s of [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]) if (span / s <= 5) return s; return 100000; };
const ticks = (lo: number, hi: number): number[] => { const st = niceStep(hi - lo), out: number[] = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000); return out; };

export interface PlotLine { id: string; name: string; color: string; pts: [number, number][]; dash?: string }
export interface PlotPoint { x: number; y: number; label: string; color?: string }
export interface Shade { x0: number; x1: number; y: number; color: string }

export interface EnergyPlotProps {
  id: string; title: string; xName: string; xUnit: string; yName: string; yUnit: string;
  lines: PlotLine[]; xr: [number, number]; yr: [number, number];
  cursor?: number; points?: PlotPoint[]; shade?: Shade; caption: string; alt: string;
}

export const EnergyPlot: React.FC<EnergyPlotProps> = ({ id, title, xName, xUnit, yName, yUnit, lines, xr, yr, cursor, points = [], shade, caption, alt }) => {
  const X = (x: number) => ML + ((x - xr[0]) / (xr[1] - xr[0] || 1)) * (GW - ML - MR);
  const Y = (y: number) => MT + (1 - (y - yr[0]) / (yr[1] - yr[0] || 1)) * (GH - MT - MB);
  const d = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  return (
    <figure className="space-y-1 min-w-0" data-graph={id}>
      <figcaption className="text-xs font-mono uppercase tracking-wider text-slate-300">{title}</figcaption>
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={alt} className="w-full rounded-xl bg-surface-lowest border border-surface-border">
        {ticks(xr[0], xr[1]).map((v) => <g key={`x${v}`}><line x1={X(v)} y1={MT} x2={X(v)} y2={GH - MB} stroke="#334155" strokeWidth={0.6} /><text x={X(v)} y={GH - MB + 12} textAnchor="middle" fontSize={9} fill="#94a3b8">{v}</text></g>)}
        {ticks(yr[0], yr[1]).map((v) => <g key={`y${v}`}><line x1={ML} y1={Y(v)} x2={GW - MR} y2={Y(v)} stroke={v === 0 ? '#94a3b8' : '#334155'} strokeWidth={v === 0 ? 1.2 : 0.6} /><text x={ML - 4} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">{v}</text></g>)}
        <text x={(ML + GW - MR) / 2} y={GH - 4} textAnchor="middle" fontSize={10} fill={PHYS.time}>{xName} ({xUnit})</text>
        <text transform={`translate(10 ${(MT + GH - MB) / 2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill="#cbd5e1">{yName} ({yUnit})</text>
        {shade && <rect data-shade="area" x={Math.min(X(shade.x0), X(shade.x1))} y={Math.min(Y(shade.y), Y(0))} width={Math.abs(X(shade.x1) - X(shade.x0))} height={Math.abs(Y(shade.y) - Y(0))} fill={shade.color} opacity={0.3} stroke={shade.color} />}
        {lines.map((l) => <path key={l.id} data-line={l.id} d={d(l.pts)} fill="none" stroke={l.color} strokeWidth={2.5} strokeDasharray={l.dash} />)}
        {cursor !== undefined && <line x1={X(cursor)} y1={MT} x2={X(cursor)} y2={GH - MB} stroke={PHYS.time} strokeDasharray="4 3" data-cursor="now" />}
        {points.map((p, i) => <g key={i}><circle cx={X(p.x)} cy={Y(p.y)} r={4.5} fill={p.color ?? '#e2e8f0'} stroke="#0f172a" strokeWidth={1.5} /><text x={Math.min(GW - 70, X(p.x) + 7)} y={Y(p.y) - 7} fontSize={9} fontWeight={700} fill={p.color ?? '#e2e8f0'}>{p.label}</text></g>)}
      </svg>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]" aria-label="Key to the lines">{lines.map((l) => <li key={l.id} style={{ color: l.color }} className="font-bold">{l.dash ? '- - ' : '— '}{l.name}</li>)}</ul>
      <p className="text-[11px] text-slate-300">{caption}</p>
    </figure>
  );
};
