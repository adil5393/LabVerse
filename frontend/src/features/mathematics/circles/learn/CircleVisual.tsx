/**
 * Circle visual for the shared Learn framework. Draws a Figure (pure data) and,
 * where asked, lets the student drag points along the circle or choose a
 * segment. All numbers shown come from the figure functions, never from the
 * drawing. Keyboard: arrow keys move a focused point (Shift = 1 degree).
 */

import React, { useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../../education/visuals';
import {
  angleAt, angleOfPoint, chordLength, clampToArc, distanceToChord, norm360, pointPos, withAngle, type Figure,
} from '../../../../engine/mathematics/circles/learn/figure';
import type { CircleVisualOpts } from '../../../../engine/mathematics/circles/learn/questions';
import { CirclePracticeFigure } from './CirclePracticeFigure';

const C = { circle: '#475569', radius: '#fbbf24', chord: '#22d3ee', diameter: '#a78bfa', plain: '#64748b', text: '#e2e8f0', angle: '#34d399', rose: '#fb7185' };
const SIZE = 480;
const CX = SIZE / 2;
const R_PX = 168;
const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const f2 = (n: number) => (Math.round(n * 100) / 100).toString();

const CircleVisual: React.FC<VisualProps> = ({ props, alt, onAnswer, locked }) => {
  const { figure: base, pick, drag = [], limits = {}, measureAngles, measureChords = [], measureDistances = [], highlight = [], showValues = true, relations = [], hideLabels = [] } = props as unknown as { figure: Figure } & CircleVisualOpts;
  const [over, setOver] = useState<Record<string, number>>({});
  const [chosen, setChosen] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const fig = useMemo(() => Object.entries(over).reduce((f, [id, a]) => withAngle(f, id, a), base), [base, over]);
  const s = R_PX / fig.r;
  const P = (id: string) => { const w = pointPos(fig, id); return { x: CX + w.x * s, y: CX - w.y * s }; };
  const hl = new Set(highlight);
  const interactive = drag.length > 0 && !locked;

  const setAngle = (id: string, deg: number) => {
    const lim = limits[id];
    setOver((o) => ({ ...o, [id]: Math.round(lim ? clampToArc(deg, lim) : norm360(deg)) }));
  };
  const fromEvent = (e: React.PointerEvent): number => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * SIZE - CX;
    const y = CX - ((e.clientY - r.top) / r.height) * SIZE;
    return (Math.atan2(y, x) * 180) / Math.PI;
  };
  const key = (id: string) => (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 5;
    const cur = angleOfPoint(fig, id);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setAngle(id, cur - step); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setAngle(id, cur + step); }
  };

  const labelPos = (id: string) => {
    const p = P(id);
    const dx = p.x - CX, dy = p.y - CX;
    const d = Math.hypot(dx, dy) || 1;
    return d < 8 ? { x: p.x - 14, y: p.y + 20 } : { x: p.x + (dx / d) * 20, y: p.y + (dy / d) * 20 + 5 };
  };

  const angleArc = (a: string, v: string, b: string, r = 30) => {
    const V = P(v), A = P(a), B = P(b);
    const a1 = Math.atan2(A.y - V.y, A.x - V.x), a2 = Math.atan2(B.y - V.y, B.x - V.x);
    let diff = a2 - a1;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const x1 = V.x + r * Math.cos(a1), y1 = V.y + r * Math.sin(a1), x2 = V.x + r * Math.cos(a1 + diff), y2 = V.y + r * Math.sin(a1 + diff);
    const mid = a1 + diff / 2;
    return { d: `M ${x1} ${y1} A ${r} ${r} 0 0 ${diff > 0 ? 1 : 0} ${x2} ${y2}`, lx: V.x + (r + 16) * Math.cos(mid), ly: V.y + (r + 16) * Math.sin(mid) + 4 };
  };

  const segColor = (kind?: string) => (kind === 'radius' ? C.radius : kind === 'chord' ? C.chord : kind === 'diameter' ? C.diameter : C.plain);

  // Midpoints are named by their chord (`mid:A:B`); show them as M, N, K in order of appearance.
  const midIds: string[] = [];
  const noteMid = (id: string) => { if (id.startsWith('mid:') && !midIds.includes(id)) midIds.push(id); };
  (fig.segments ?? []).forEach((sg) => { noteMid(sg.from); noteMid(sg.to); });
  (fig.rightAngles ?? []).forEach((t) => t.forEach(noteMid));
  measureChords.forEach((c) => c.forEach(noteMid));
  const name = (id: string) => (id.startsWith('mid:') ? ['M', 'N', 'K'][midIds.indexOf(id)] ?? 'M' : id);

  const lines: string[] = [];
  if (measureAngles) for (const an of fig.angles ?? []) lines.push(`∠${an.id} = ${f1(angleAt(fig, an.a, an.v, an.b))}°`);
  for (const [a, b] of measureChords) lines.push(`${name(a)}${name(b)} = ${f2(chordLength(fig, a, b))}`);
  for (const [a, b] of measureDistances) lines.push(`distance from O to ${a}${b} = ${f2(distanceToChord(fig, a, b))}`);
  const angleVal = (id: string) => { const an = (fig.angles ?? []).find((x) => x.id === id); return an ? angleAt(fig, an.a, an.v, an.b) : NaN; };
  for (const r of relations) {
    const A = angleVal(r.a), B = angleVal(r.b);
    lines.push(r.kind === 'ratio' ? `∠${r.a} ÷ ∠${r.b} = ${(A / B).toFixed(2)}` : `∠${r.a} + ∠${r.b} = ${f1(A + B)}°`);
  }

  return (
    <div className="space-y-2" data-visual="circle">
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none" role="group" aria-label={alt}
        style={{ touchAction: interactive ? 'none' : 'auto' }}
        onPointerMove={(e) => { if (dragging.current) setAngle(dragging.current, fromEvent(e)); }}
        onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}>
        <title>{alt}</title>
        <circle pointerEvents="none" cx={CX} cy={CX} r={R_PX} fill="#22d3ee" fillOpacity={0.04} stroke={C.circle} strokeWidth={2.5} />
        {(fig.segments ?? []).map((sg) => {
          const A = P(sg.from), B = P(sg.to);
          const on = hl.has(sg.id) || chosen === sg.id;
          return (
            <g key={sg.id} {...(pick ? {
              role: 'button', tabIndex: 0, 'aria-label': `Choose segment ${sg.id}`, 'aria-pressed': chosen === sg.id, style: { cursor: 'pointer' },
              onClick: () => { if (!locked) { setChosen(sg.id); onAnswer?.(sg.id); } },
              onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && !locked) { e.preventDefault(); setChosen(sg.id); onAnswer?.(sg.id); } },
            } : {})}>
              {pick && (() => {
                // Where several segments meet at the centre, a tap there must go to the segment passing THROUGH it
                // (a diameter), not to a radius that merely starts there: shorten radius touch areas at the centre.
                const ends = sg.from === 'O' || sg.to === 'O';
                const len = Math.hypot(B.x - A.x, B.y - A.y) || 1;
                const cut = ends ? Math.min(26, len / 3) : 0;
                const ux = (B.x - A.x) / len, uy = (B.y - A.y) / len;
                const x1 = sg.from === 'O' ? A.x + ux * cut : A.x, y1 = sg.from === 'O' ? A.y + uy * cut : A.y;
                const x2 = sg.to === 'O' ? B.x - ux * cut : B.x, y2 = sg.to === 'O' ? B.y - uy * cut : B.y;
                return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={56} strokeLinecap="butt" />;
              })()}
              <line pointerEvents={pick ? 'none' : undefined} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={segColor(pick ? undefined : sg.kind)} strokeWidth={on ? 5 : 3} strokeDasharray={sg.kind === 'plain' ? '6 5' : undefined} strokeLinecap="round" opacity={pick && chosen !== sg.id ? 0.9 : 1} />
              {pick && <text pointerEvents="none" x={A.x + (B.x - A.x) * 0.3 + 12} y={A.y + (B.y - A.y) * 0.3 - 8} fill={C.text} fontSize={16} fontWeight={700}>{sg.id}</text>}
            </g>
          );
        })}
        {(fig.arcs ?? []).map((ar, ai) => {
          const a0 = angleOfPoint(fig, ar.from), a1 = angleOfPoint(fig, ar.to);
          const span = norm360(a1 - a0) || 360;
          const A = P(ar.from), B = P(ar.to);
          return <path pointerEvents="none" key={ar.id} d={`M ${A.x} ${A.y} A ${R_PX} ${R_PX} 0 ${span > 180 ? 1 : 0} 0 ${B.x} ${B.y}`} fill="none" stroke={ai % 2 === 0 ? C.rose : '#a78bfa'} strokeWidth={hl.has(ar.id) ? 7 : 4} opacity={hl.size === 0 || hl.has(ar.id) ? 0.9 : 0.3} strokeLinecap="round" />;
        })}
        {(fig.angles ?? []).map((an) => {
          const arc = angleArc(an.a, an.v, an.b, hl.has(an.id) ? 34 : 28);
          return (
            <g key={an.id} pointerEvents="none" opacity={hl.size === 0 || hl.has(an.id) ? 1 : 0.3}>
              <path d={arc.d} fill="none" stroke={C.angle} strokeWidth={hl.has(an.id) ? 4 : 2.5} />
              {showValues && (hl.size === 0 || hl.has(an.id)) && <text x={arc.lx} y={arc.ly} fill={C.angle} fontSize={15} fontWeight={700} textAnchor="middle">{f1(angleAt(fig, an.a, an.v, an.b))}°</text>}
            </g>
          );
        })}
        {(fig.rightAngles ?? []).map(([a, v, b], i) => {
          const V = P(v), A = P(a), B = P(b), k = 13;
          const u = (Q: { x: number; y: number }) => { const d = Math.hypot(Q.x - V.x, Q.y - V.y) || 1; return { x: (Q.x - V.x) / d, y: (Q.y - V.y) / d }; };
          const ua = u(A), ub = u(B);
          return <polyline pointerEvents="none" key={i} points={`${V.x + ua.x * k},${V.y + ua.y * k} ${V.x + (ua.x + ub.x) * k},${V.y + (ua.y + ub.y) * k} ${V.x + ub.x * k},${V.y + ub.y * k}`} fill="none" stroke={C.text} strokeWidth={2} />;
        })}
        {(fig.equalMarks ?? []).map(([a, b]) => {
          const A = P(a), B = P(b), mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2, ang = Math.atan2(B.y - A.y, B.x - A.x) + Math.PI / 2;
          return <line pointerEvents="none" key={a + b} x1={mx - 8 * Math.cos(ang)} y1={my - 8 * Math.sin(ang)} x2={mx + 8 * Math.cos(ang)} y2={my + 8 * Math.sin(ang)} stroke={C.rose} strokeWidth={3} />;
        })}

        {midIds.map((id) => { const m = P(id); return <g key={id} pointerEvents="none"><circle cx={m.x} cy={m.y} r={5} fill={C.text} /><text x={m.x + 10} y={m.y + 20} fill={C.text} fontSize={16} fontWeight={700}>{name(id)}</text></g>; })}
        <circle pointerEvents="none" cx={CX} cy={CX} r={5} fill={C.text} />
        <text pointerEvents="none" x={CX - 16} y={CX + 22} fill={C.text} fontSize={17} fontWeight={700}>O</text>
        {fig.points.filter((p) => !hideLabels.includes(p.id)).map((p) => {
          const pt = P(p.id), lp = labelPos(p.id), canDrag = drag.includes(p.id) && !locked;
          return (
            <g key={p.id} tabIndex={canDrag ? 0 : undefined} role={canDrag ? 'slider' : undefined} aria-label={canDrag ? `Point ${p.id}, ${Math.round(p.angle)} degrees around the circle` : undefined}
              aria-valuemin={0} aria-valuemax={360} aria-valuenow={canDrag ? Math.round(p.angle) : undefined} aria-valuetext={canDrag ? `${Math.round(p.angle)} degrees` : undefined}
              onKeyDown={canDrag ? key(p.id) : undefined}
              onPointerDown={canDrag ? (e) => { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); dragging.current = p.id; } : undefined}
              style={{ cursor: canDrag ? 'grab' : 'default', touchAction: 'none', outline: 'none' }} className="group">
              {canDrag && <circle cx={pt.x} cy={pt.y} r={38} fill="transparent" />}
              <circle cx={pt.x} cy={pt.y} r={canDrag ? 10 : 7} fill={canDrag ? C.angle : C.text} stroke="#0f172a" strokeWidth={2} />
              {canDrag && <circle cx={pt.x} cy={pt.y} r={17} fill="none" strokeWidth={3} pointerEvents="none" className="stroke-transparent group-focus:stroke-white" />}
              <text x={lp.x} y={lp.y} fill={canDrag ? C.angle : C.text} fontSize={18} fontWeight={700} textAnchor="middle">{p.id}</text>
            </g>
          );
        })}
      </svg>

      {lines.length > 0 && (
        <p className="text-sm text-slate-200 text-center leading-relaxed" aria-live="polite" data-testid="circle-live">{lines.join('   ·   ')}</p>
      )}
      {interactive && (
        <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Move the points around the circle">
          {drag.map((id) => (
            <div key={id} className="inline-flex items-center gap-1.5">
              <button type="button" className="min-w-[48px] min-h-[48px] rounded-xl border border-surface-border text-white text-lg hover:border-cyan-400" aria-label={`Move ${id} anticlockwise`} onClick={() => setAngle(id, angleOfPoint(fig, id) + 5)}>↺</button>
              <span className="text-sm text-slate-300 font-bold px-1">{id}</span>
              <button type="button" className="min-w-[48px] min-h-[48px] rounded-xl border border-surface-border text-white text-lg hover:border-cyan-400" aria-label={`Move ${id} clockwise`} onClick={() => setAngle(id, angleOfPoint(fig, id) - 5)}>↻</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CIRCLE_VISUALS: VisualRegistry = { circle: CircleVisual, circlePracticeScene: CirclePracticeFigure };
