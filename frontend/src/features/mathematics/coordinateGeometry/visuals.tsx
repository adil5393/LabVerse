/**
 * Coordinate Geometry visuals for the shared Learn framework.
 *
 * Every visual is derived from the pure helpers in engine/.../learn.ts, is
 * keyboard operable, has a live text equivalent, large touch targets and no
 * decorative animation.
 */

import React, { useId, useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import {
  clampToRange, describeLocus, distance, fmtNum, fmtPoint, legs, locate, makePlaneView, midpointOf,
  pointId, snapToGrid, toMath, toScreen, type PlaneRange, type Pt,
} from '../../../engine/mathematics/coordinateGeometry/learn';

const C = { axis: '#94a3b8', grid: '#1e293b', gridStrong: '#334155', text: '#cbd5e1', amber: '#fbbf24', cyan: '#22d3ee', rose: '#fb7185', green: '#34d399', violet: '#a78bfa' };
const MINUS = '−';
const label = (n: number) => (n < 0 ? `${MINUS}${Math.abs(n)}` : String(n));

type PlanePoint = { x: number; y: number; label?: string; color?: string };

interface PlaneProps {
  range?: [number, number, number, number];
  mode?: 'view' | 'explore' | 'pick' | 'choose' | 'distance';
  points?: PlanePoint[];
  start?: Pt;
  a?: Pt;
  b?: Pt;
  quadrants?: boolean;
  projections?: boolean;
  legs?: boolean;
  midpoint?: boolean;
  segment?: boolean;
}

const asRange = (r?: [number, number, number, number]): PlaneRange => {
  const [xMin, xMax, yMin, yMax] = r ?? [-6, 6, -6, 6];
  return { xMin, xMax, yMin, yMax };
};

const NudgePad: React.FC<{ onMove: (dx: number, dy: number) => void; what: string }> = ({ onMove, what }) => {
  const btn = 'min-w-[48px] min-h-[48px] rounded-xl border border-surface-border bg-surface-card text-white text-lg hover:border-cyan-400';
  return (
    <div role="group" aria-label={`Move ${what}`} className="inline-grid grid-cols-3 gap-1.5">
      <span /><button type="button" className={btn} aria-label={`${what} up`} onClick={() => onMove(0, 1)}>↑</button><span />
      <button type="button" className={btn} aria-label={`${what} left`} onClick={() => onMove(-1, 0)}>←</button>
      <button type="button" className={btn} aria-label={`${what} down`} onClick={() => onMove(0, -1)}>↓</button>
      <button type="button" className={btn} aria-label={`${what} right`} onClick={() => onMove(1, 0)}>→</button>
    </div>
  );
};

const PlaneVisual: React.FC<VisualProps> = ({ props, alt, onAnswer, locked }) => {
  const p = props as PlaneProps;
  const mode = p.mode ?? 'view';
  const range = useMemo(() => asRange(p.range), [p.range]);
  const view = useMemo(() => makePlaneView(range), [range]);
  const svgRef = useRef<SVGSVGElement>(null);
  const uid = useId();

  const [pt, setPt] = useState<Pt>(p.start ?? { x: 0, y: 0 });
  const [cursor, setCursor] = useState<Pt | null>(null);
  const [pair, setPair] = useState<{ a: Pt; b: Pt }>({ a: p.a ?? { x: 1, y: 1 }, b: p.b ?? { x: 4, y: 5 } });
  const [active, setActive] = useState<'a' | 'b'>('a');
  const [chosen, setChosen] = useState<string | null>(null);
  const dragging = useRef<string | null>(null);

  const S = (q: Pt) => toScreen(view, q);
  const fromEvent = (e: React.PointerEvent): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    return snapToGrid(range, toMath(view, { x: ((e.clientX - r.left) / r.width) * view.width, y: ((e.clientY - r.top) / r.height) * view.height }));
  };

  const interactive = (mode === 'explore' || mode === 'distance' || mode === 'pick') && !locked;
  const xs = Array.from({ length: range.xMax - range.xMin + 1 }, (_, i) => range.xMin + i);
  const ys = Array.from({ length: range.yMax - range.yMin + 1 }, (_, i) => range.yMin + i);
  const step = range.xMax - range.xMin > 12 ? 2 : 1;
  const O = S({ x: 0, y: 0 });

  const move = (target: string, d: Pt) => {
    if (target === 'p') setPt((q) => clampToRange(range, { x: q.x + d.x, y: q.y + d.y }));
    else if (target === 'a' || target === 'b') setPair((s) => ({ ...s, [target]: clampToRange(range, { x: s[target].x + d.x, y: s[target].y + d.y }) }));
    else if (target === 'c') setCursor((q) => clampToRange(range, { x: (q?.x ?? 0) + d.x, y: (q?.y ?? 0) + d.y }));
  };
  const setTarget = (target: string, q: Pt) => {
    if (target === 'p') setPt(q);
    else if (target === 'a' || target === 'b') setPair((s) => ({ ...s, [target]: q }));
    else if (target === 'c') setCursor(q);
  };
  const keyHandler = (target: string) => (e: React.KeyboardEvent) => {
    const m: Record<string, Pt> = { ArrowRight: { x: 1, y: 0 }, ArrowLeft: { x: -1, y: 0 }, ArrowUp: { x: 0, y: 1 }, ArrowDown: { x: 0, y: -1 } };
    if (m[e.key]) { e.preventDefault(); move(target, m[e.key]); }
  };
  const startDrag = (target: string) => (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    dragging.current = target;
    if (target === 'a' || target === 'b') setActive(target);
  };
  const onMove = (e: React.PointerEvent) => { if (dragging.current && interactive) setTarget(dragging.current, fromEvent(e)); };
  const endDrag = () => { dragging.current = null; };

  const handle = (q: Pt, color: string, name: string, target: string, tag?: string) => {
    const s = S(q);
    return (
      <g key={target} tabIndex={interactive ? 0 : undefined} role={interactive ? 'slider' : 'img'} aria-label={`${name} at ${fmtPoint(q)}`} aria-valuetext={fmtPoint(q)}
        onKeyDown={interactive ? keyHandler(target) : undefined} onPointerDown={startDrag(target)} onFocus={() => (target === 'a' || target === 'b') && setActive(target)}
        style={{ cursor: interactive ? 'grab' : 'default', touchAction: 'none', outline: 'none' }} className="group">
        {interactive && <circle cx={s.x} cy={s.y} r={38} fill="transparent" />}
        <circle cx={s.x} cy={s.y} r={9} fill={color} stroke="#0f172a" strokeWidth={2} />
        {interactive && <circle cx={s.x} cy={s.y} r={16} fill="none" strokeWidth={3} pointerEvents="none" className="stroke-transparent group-focus:stroke-white" />}
        {tag && <text x={s.x + 12} y={s.y - 12} fill={color} fontSize={17} fontWeight={700}>{tag}</text>}
      </g>
    );
  };

  const projected: Pt[] = mode === 'explore' ? (p.projections === false ? [] : [pt]) : mode === 'view' && p.projections ? (p.points ?? []) : [];
  const live =
    mode === 'explore' ? `P is at ${fmtPoint(pt)}: ${Math.abs(pt.x)} unit${Math.abs(pt.x) === 1 ? '' : 's'} ${pt.x < 0 ? 'left' : 'right'} of the y-axis, ${Math.abs(pt.y)} unit${Math.abs(pt.y) === 1 ? '' : 's'} ${pt.y < 0 ? 'below' : 'above'} the x-axis; ${describeLocus(locate(pt))}.`
    : mode === 'distance' ? (() => { const L = legs(pair.a, pair.b); const d = distance(pair.a, pair.b); return `A ${fmtPoint(pair.a)}, B ${fmtPoint(pair.b)}: across ${L.dx}, up/down ${L.dy}, distance AB = ${fmtNum(d)} (${L.dx}² + ${L.dy}² = ${L.dx ** 2 + L.dy ** 2}).`; })()
    : mode === 'pick' ? (cursor ? `Selected ${fmtPoint(cursor)}.` : 'Tap the plane, or use the arrow keys, to choose a point.')
    : '';

  // Quadrant names sit near the outer corners so they do not collide with points near the axes.
  const quadLabels = p.quadrants ? [
    { t: 'I (+, +)', x: range.xMax * 0.72, y: range.yMax * 0.9 }, { t: 'II (−, +)', x: range.xMin * 0.72, y: range.yMax * 0.9 },
    { t: 'III (−, −)', x: range.xMin * 0.72, y: range.yMin * 0.9 }, { t: 'IV (+, −)', x: range.xMax * 0.72, y: range.yMin * 0.9 },
  ] : [];

  return (
    <div className="space-y-2" data-visual="plane" data-mode={mode}>
      <svg ref={svgRef} viewBox={`0 0 ${view.width} ${view.height}`} className="w-full max-w-[520px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none"
        style={{ touchAction: mode === 'view' || mode === 'choose' ? 'auto' : 'none' }} role="group" aria-label={alt}
        onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag}
        onPointerDownCapture={(e) => { if (mode === 'pick' && interactive && !(e.target as Element).closest('[role=slider]')) setCursor(fromEvent(e)); }}>
        <title id={`${uid}-t`}>{alt}</title>
        {p.quadrants && <>
          <rect x={O.x} y={view.pad} width={view.width - view.pad - O.x} height={O.y - view.pad} fill="#22d3ee" opacity={0.06} />
          <rect x={view.pad} y={view.pad} width={O.x - view.pad} height={O.y - view.pad} fill="#a78bfa" opacity={0.06} />
          <rect x={view.pad} y={O.y} width={O.x - view.pad} height={view.height - view.pad - O.y} fill="#fb7185" opacity={0.06} />
          <rect x={O.x} y={O.y} width={view.width - view.pad - O.x} height={view.height - view.pad - O.y} fill="#34d399" opacity={0.06} />
        </>}
        {xs.map((x) => <line key={`gx${x}`} x1={S({ x, y: 0 }).x} y1={view.pad} x2={S({ x, y: 0 }).x} y2={view.height - view.pad} stroke={x === 0 ? C.axis : C.grid} strokeWidth={x === 0 ? 2 : 1} />)}
        {ys.map((y) => <line key={`gy${y}`} x1={view.pad} y1={S({ x: 0, y }).y} x2={view.width - view.pad} y2={S({ x: 0, y }).y} stroke={y === 0 ? C.axis : C.grid} strokeWidth={y === 0 ? 2 : 1} />)}
        {xs.filter((x) => x !== 0 && x % step === 0).map((x) => <text key={`tx${x}`} x={S({ x, y: 0 }).x} y={O.y + 18} fill={C.text} fontSize={15} textAnchor="middle">{label(x)}</text>)}
        {ys.filter((y) => y !== 0 && y % step === 0).map((y) => <text key={`ty${y}`} x={O.x - 8} y={S({ x: 0, y }).y + 5} fill={C.text} fontSize={15} textAnchor="end">{label(y)}</text>)}
        <text x={view.width - view.pad - 2} y={O.y - 8} fill={C.axis} fontSize={16} textAnchor="end" fontWeight={700}>x</text>
        <text x={O.x + 8} y={view.pad + 14} fill={C.axis} fontSize={16} fontWeight={700}>y</text>
        <text x={O.x - 8} y={O.y - 8} fill={C.text} fontSize={15} textAnchor="end">O</text>
        {quadLabels.map((q) => <text key={q.t} x={S({ x: q.x, y: q.y }).x} y={S({ x: q.x, y: q.y }).y} fill={C.text} fontSize={16} textAnchor="middle" opacity={0.75}>{q.t}</text>)}

        {(p.points ?? []).map((q, i) => {
          const s = S(q);
          const id = q.label ?? String(i);
          const isChoose = mode === 'choose';
          return (
            <g key={`pt${i}`} {...(isChoose ? {
              role: 'button', tabIndex: 0, 'aria-label': `Choose point ${q.label ?? ''}`, 'aria-pressed': chosen === id, style: { cursor: 'pointer' },
              onClick: () => { if (!locked) { setChosen(id); onAnswer?.(id); } },
              onKeyDown: (e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && !locked) { e.preventDefault(); setChosen(id); onAnswer?.(id); } },
            } : {})}>
              {isChoose && <circle cx={s.x} cy={s.y} r={30} fill="transparent" />}
              <circle cx={s.x} cy={s.y} r={8} fill={q.color ?? C.amber} stroke={chosen === id ? '#fff' : '#0f172a'} strokeWidth={chosen === id ? 3 : 2} />
              {q.label && <text x={s.x + 11} y={s.y - 10} fill={q.color ?? C.amber} fontSize={17} fontWeight={700}>{q.label}</text>}
            </g>
          );
        })}

        {projected.map((q, i) => (
          <g key={`pj${i}`}>
            <line x1={S(q).x} y1={S(q).y} x2={S(q).x} y2={O.y} stroke={C.cyan} strokeWidth={2} strokeDasharray="5 4" />
            <line x1={S(q).x} y1={S(q).y} x2={O.x} y2={S(q).y} stroke={C.rose} strokeWidth={2} strokeDasharray="5 4" />
          </g>
        ))}

        {mode === 'distance' && <>
          {p.legs !== false && <>
            <line x1={S(pair.a).x} y1={S(pair.a).y} x2={S({ x: pair.b.x, y: pair.a.y }).x} y2={S({ x: pair.b.x, y: pair.a.y }).y} stroke={C.cyan} strokeWidth={3} strokeDasharray="6 4" />
            <line x1={S({ x: pair.b.x, y: pair.a.y }).x} y1={S({ x: pair.b.x, y: pair.a.y }).y} x2={S(pair.b).x} y2={S(pair.b).y} stroke={C.rose} strokeWidth={3} strokeDasharray="6 4" />
            <text x={(S(pair.a).x + S({ x: pair.b.x, y: pair.a.y }).x) / 2} y={S(pair.a).y + (pair.b.y >= pair.a.y ? 20 : -10)} fill={C.cyan} fontSize={16} textAnchor="middle">{legs(pair.a, pair.b).dx}</text>
            <text x={S(pair.b).x + (pair.b.x >= pair.a.x ? 10 : -10)} y={(S(pair.b).y + S({ x: pair.b.x, y: pair.a.y }).y) / 2} fill={C.rose} fontSize={16} textAnchor={pair.b.x >= pair.a.x ? 'start' : 'end'}>{legs(pair.a, pair.b).dy}</text>
          </>}
          <line x1={S(pair.a).x} y1={S(pair.a).y} x2={S(pair.b).x} y2={S(pair.b).y} stroke={C.amber} strokeWidth={3} />
          {p.midpoint && <circle cx={S(midpointOf(pair.a, pair.b)).x} cy={S(midpointOf(pair.a, pair.b)).y} r={6} fill={C.green} stroke="#0f172a" strokeWidth={2} />}
        </>}
        {mode === 'view' && p.segment && (p.points ?? []).length >= 2 && (() => { const [m, n] = p.points!; return <line x1={S(m).x} y1={S(m).y} x2={S(n).x} y2={S(n).y} stroke={C.amber} strokeWidth={3} />; })()}
        {mode === 'view' && p.midpoint && (p.points ?? []).length >= 2 && (() => { const m = midpointOf(p.points![0], p.points![1]); return <circle cx={S(m).x} cy={S(m).y} r={6} fill={C.green} stroke="#0f172a" strokeWidth={2} />; })()}

        {mode === 'pick' && cursor && handle(cursor, C.green, 'Chosen point', 'c', undefined)}
        {mode === 'explore' && handle(pt, C.amber, 'Point P', 'p', 'P')}
        {mode === 'distance' && <>{handle(pair.a, C.cyan, 'Point A', 'a', 'A')}{handle(pair.b, C.rose, 'Point B', 'b', 'B')}</>}
      </svg>

      {live && <p className="text-sm text-slate-200 text-center" aria-live="polite" data-testid="plane-live">{live}</p>}

      {mode === 'explore' && !locked && <div className="flex justify-center"><NudgePad what="point P" onMove={(dx, dy) => move('p', { x: dx, y: dy })} /></div>}
      {mode === 'distance' && !locked && (
        <div className="flex flex-wrap justify-center items-center gap-4">
          <div role="radiogroup" aria-label="Which point to move" className="flex gap-2">
            {(['a', 'b'] as const).map((k) => <button key={k} type="button" role="radio" aria-checked={active === k} onClick={() => setActive(k)} className={`min-h-[48px] min-w-[48px] rounded-xl border text-sm font-bold ${active === k ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border text-slate-300'}`}>Move {k.toUpperCase()}</button>)}
          </div>
          <NudgePad what={`point ${active.toUpperCase()}`} onMove={(dx, dy) => move(active, { x: dx, y: dy })} />
        </div>
      )}
      {mode === 'pick' && !locked && (
        <div className="flex flex-wrap justify-center items-center gap-4">
          <NudgePad what="the chosen point" onMove={(dx, dy) => move('c', { x: dx, y: dy })} />
          <button type="button" disabled={!cursor} onClick={() => cursor && onAnswer?.(pointId(cursor.x, cursor.y))} className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-40" data-testid="place-point">
            {cursor ? `Place the point at ${fmtPoint(cursor)}` : 'Choose a point first'}
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Number line (prerequisite visuals)
// ---------------------------------------------------------------------------

interface NumberLineProps { min?: number; max?: number; marks?: { v: number; label: string }[]; pick?: boolean; /** An optional demo: tap numbers and read where they are, with no question attached. */ explore?: boolean; start?: number }

const NumberLineVisual: React.FC<VisualProps> = ({ props, alt, onAnswer, locked }) => {
  const p = props as NumberLineProps;
  const min = p.min ?? -6;
  const max = p.max ?? 6;
  const W = 480, pad = 28, unit = (W - 2 * pad) / (max - min), y = 56;
  const X = (v: number) => pad + (v - min) * unit;
  const [sel, setSel] = useState<number | null>(p.start ?? null);
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const pickable = Boolean(p.pick || p.explore) && !locked;
  const readout = sel === null ? 'Tap a number to see where it is.' : sel === 0 ? '0 is the starting point.' : `${label(sel)} is ${Math.abs(sel)} step${Math.abs(sel) === 1 ? '' : 's'} to the ${sel < 0 ? 'left' : 'right'} of 0, so it is ${sel < 0 ? 'negative' : 'positive'}.`;
  const choose = (v: number) => { setSel(v); };

  return (
    <div className="space-y-2" data-visual="numberLine">
      <svg viewBox={`0 0 ${W} 100`} className="w-full max-w-[520px] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none" role="group" aria-label={alt} style={{ touchAction: 'manipulation' }}>
        <line x1={pad - 10} y1={y} x2={W - pad + 10} y2={y} stroke={C.axis} strokeWidth={2} />
        <polygon points={`${W - pad + 14},${y} ${W - pad + 4},${y - 5} ${W - pad + 4},${y + 5}`} fill={C.axis} />
        <polygon points={`${pad - 14},${y} ${pad - 4},${y - 5} ${pad - 4},${y + 5}`} fill={C.axis} />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={X(v)} y1={y - 7} x2={X(v)} y2={y + 7} stroke={v === 0 ? C.amber : C.axis} strokeWidth={v === 0 ? 3 : 1.5} />
            <text x={X(v)} y={y + 28} fill={v === 0 ? C.amber : C.text} fontSize={15} textAnchor="middle">{label(v)}</text>
            {pickable && (
              <g role="button" tabIndex={0} aria-label={`Choose ${label(v)}`} aria-pressed={sel === v} style={{ cursor: 'pointer' }}
                onClick={() => choose(v)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(v); } }}>
                <rect x={X(v) - Math.max(unit / 2, 14)} y={y - 40} width={Math.max(unit, 28)} height={56} fill="transparent" />
              </g>
            )}
          </g>
        ))}
        {(p.marks ?? []).map((m) => (
          <g key={m.label}><circle cx={X(m.v)} cy={y} r={8} fill={C.cyan} stroke="#0f172a" strokeWidth={2} /><text x={X(m.v)} y={y - 16} fill={C.cyan} fontSize={17} fontWeight={700} textAnchor="middle">{m.label}</text></g>
        ))}
        {sel !== null && <circle cx={X(sel)} cy={y} r={9} fill={C.green} stroke="#fff" strokeWidth={2} />}
        <text x={pad} y={92} fill={C.text} fontSize={14}>← smaller</text>
        <text x={W - pad} y={92} fill={C.text} fontSize={14} textAnchor="end">larger →</text>
      </svg>
      {p.explore && <p className="text-sm text-slate-200 text-center" aria-live="polite" data-testid="numberline-live">{readout}</p>}
      {pickable && (
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button type="button" className="min-h-[48px] min-w-[48px] rounded-xl border border-surface-border text-white text-lg" aria-label="Move left" disabled={sel === null || sel <= min} onClick={() => setSel((s) => (s === null ? 0 : Math.max(min, s - 1)))}>←</button>
          <button type="button" className="min-h-[48px] min-w-[48px] rounded-xl border border-surface-border text-white text-lg" aria-label="Move right" disabled={sel !== null && sel >= max} onClick={() => setSel((s) => (s === null ? 0 : Math.min(max, s + 1)))}>→</button>
          {p.pick && <button type="button" disabled={sel === null} className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-40" onClick={() => sel !== null && onAnswer?.(String(sel))}>{sel === null ? 'Tap a number first' : `Choose ${label(sel)}`}</button>}
        </div>
      )}
    </div>
  );
};

export const CG_VISUALS: VisualRegistry = { plane: PlaneVisual, numberLine: NumberLineVisual };
