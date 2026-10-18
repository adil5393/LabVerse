/**
 * Interactive Cartesian graph for Two Variables, One Line (Milestone M5).
 *
 * SVG renderer. Performance rules:
 * - Lines are clipped to the viewport (never drawn to infinity).
 * - Only visible grid lines are generated.
 * - Pointer movement is coalesced with requestAnimationFrame, and pan/zoom
 *   state lives in this component, not in the global store.
 * Supports mouse, touch (one-finger pan, two-finger pinch zoom), wheel zoom
 * and keyboard control of the draggable point.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type Viewport,
  defaultViewport,
  viewportBounds,
  toScreen,
  toWorld,
  zoomAt,
  panBy,
  clipLineToBounds,
  niceStep,
  gridTicks,
  fitViewport,
  constrainToLine,
  translateLineThrough,
  type ExactPoint,
  type LineDragEffect,
  clampScale,
} from '../../../engine/mathematics/twoVariables/graphMath';
import {
  type LinearEq,
  xIntercept,
  yIntercept,
  slope,
  isLine,
} from '../../../engine/mathematics/twoVariables/linearEquation';
import { toNumber, formatRational } from '../../../engine/mathematics/twoVariables/rational';

export interface GraphLine {
  eq: LinearEq;
  color: string;
  dashed?: boolean;
  label?: string;
}

export type DragMode = 'point' | 'probe' | 'line' | 'none';

export interface GraphCanvasProps {
  lines: GraphLine[];
  tablePoints?: { x: number; y: number }[];
  interceptsOf?: LinearEq | null;
  slopeOf?: LinearEq | null;
  intersection?: { x: number; y: number; label?: string } | null;
  dragMode?: DragMode;
  /** Which line index a 'point' or 'line' drag acts on. */
  dragLineIndex?: number;
  point?: ExactPoint | null;
  probe?: { x: number; y: number; status?: 'exact' | 'approximate' | 'not_solution' } | null;
  onPointDrag?: (p: ExactPoint) => void;
  onProbeDrag?: (p: { x: number; y: number }) => void;
  onLineDrag?: (effect: LineDragEffect, final: boolean) => void;
  onWorldClick?: (x: number, y: number) => void;
  /** Points used for Fit; the viewport refits whenever fitSignal changes. */
  fitPoints?: { x: number; y: number }[];
  fitSignal?: number;
  /** Fixed half-width window (static diagrams). Disables nothing; just sets the initial view. */
  extent?: number;
  clickMarker?: { x: number; y: number; correct?: boolean } | null;
  className?: string;
  ariaLabel?: string;
}

type Pointer = { x: number; y: number };

const C = {
  bg: '#0b1220',
  grid: 'rgba(148,163,184,0.14)',
  axis: 'rgba(226,232,240,0.75)',
  label: '#94a3b8',
  point: '#34d399',
  amber: '#fbbf24',
  bad: '#f87171',
};

const fmt = (v: number): string => String(Number(v.toFixed(2)));

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  lines,
  tablePoints,
  interceptsOf,
  slopeOf,
  intersection,
  dragMode = 'none',
  dragLineIndex = 0,
  point,
  probe,
  onPointDrag,
  onProbeDrag,
  onLineDrag,
  onWorldClick,
  fitPoints,
  fitSignal,
  extent,
  clickMarker,
  className = '',
  ariaLabel = 'Coordinate graph',
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [vp, setVp] = useState<Viewport>(() => defaultViewport(600, 480));
  const vpRef = useRef(vp);
  vpRef.current = vp;

  // ----- Size tracking -----
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = (w: number, h: number) => {
      if (w < 10 || h < 10) return;
      setVp((v) => {
        if (Math.abs(v.width - w) < 1 && Math.abs(v.height - h) < 1) return v;
        // Keep the world scale when resizing unless an extent fixes it.
        const base = { ...v, width: w, height: h };
        return extent ? { ...base, scale: clampScale(Math.min(w, h) / (extent * 2.1)), cx: 0, cy: 0 } : base;
      });
    };
    const rect = el.getBoundingClientRect();
    apply(rect.width, rect.height);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      apply(r.width, r.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [extent]);

  // ----- Fit -----
  const doFit = useCallback(() => {
    setVp((v) => fitViewport(fitPoints && fitPoints.length > 0 ? fitPoints : [{ x: 5, y: 5 }, { x: -5, y: -5 }], v.width, v.height));
  }, [fitPoints]);

  const lastFitSignal = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (fitSignal === undefined || fitSignal === lastFitSignal.current) return;
    lastFitSignal.current = fitSignal;
    if (!extent) doFit();
  }, [fitSignal, doFit, extent]);

  // ----- Pointer handling -----
  const pointers = useRef(new Map<number, Pointer>());
  const gesture = useRef<
    | { kind: 'pan'; moved: boolean; startX: number; startY: number }
    | { kind: 'point' | 'probe' | 'line' }
    | { kind: 'pinch'; dist: number }
    | null
  >(null);
  const raf = useRef<number | null>(null);
  const pending = useRef<{ sx: number; sy: number } | null>(null);

  const localPos = (e: React.PointerEvent): Pointer => {
    const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const dragLine = lines[Math.min(dragLineIndex, Math.max(0, lines.length - 1))]?.eq;

  const applyDrag = useCallback(
    (sx: number, sy: number, final: boolean) => {
      const g = gesture.current;
      if (!g) return;
      const w = toWorld(vpRef.current, sx, sy);
      if (g.kind === 'point' && dragLine) {
        const p = constrainToLine(dragLine, w.x, w.y, niceStep(vpRef.current.scale, 38) >= 1 ? 1 : 0.5);
        if (p && onPointDrag) onPointDrag(p);
      } else if (g.kind === 'probe' && onProbeDrag) {
        onProbeDrag({ x: Math.round(w.x * 10) / 10, y: Math.round(w.y * 10) / 10 });
      } else if (g.kind === 'line' && dragLine && onLineDrag) {
        const eff = translateLineThrough(dragLine, w.x, w.y, 0.5);
        if (eff) onLineDrag(eff, final);
      }
    },
    [dragLine, onPointDrag, onProbeDrag, onLineDrag]
  );

  const flush = useCallback(() => {
    raf.current = null;
    const p = pending.current;
    pending.current = null;
    if (p) applyDrag(p.sx, p.sy, false);
  }, [applyDrag]);

  const hitHandle = (pos: Pointer): 'point' | 'probe' | 'line' | null => {
    const v = vpRef.current;
    const radius = 22; // generous touch target
    if (dragMode === 'point' && point) {
      const s = toScreen(v, toNumber(point.x), toNumber(point.y));
      if (Math.hypot(s.sx - pos.x, s.sy - pos.y) <= radius) return 'point';
    }
    if (dragMode === 'probe' && probe) {
      const s = toScreen(v, probe.x, probe.y);
      if (Math.hypot(s.sx - pos.x, s.sy - pos.y) <= radius) return 'probe';
    }
    if (dragMode === 'line' && dragLine && isLine(dragLine)) {
      const a = toNumber(dragLine.a);
      const b = toNumber(dragLine.b);
      const c = toNumber(dragLine.c);
      const w = toWorld(v, pos.x, pos.y);
      const distPx = (Math.abs(a * w.x + b * w.y + c) / Math.hypot(a, b)) * v.scale;
      if (distPx <= 16) return 'line';
    }
    return null;
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const pos = localPos(e);
    pointers.current.set(e.pointerId, pos);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    if (pointers.current.size === 2) {
      const [p1, p2] = [...pointers.current.values()];
      gesture.current = { kind: 'pinch', dist: Math.hypot(p1.x - p2.x, p1.y - p2.y) };
      return;
    }
    const hit = hitHandle(pos);
    if (hit) {
      gesture.current = { kind: hit };
      applyDrag(pos.x, pos.y, false);
    } else {
      gesture.current = { kind: 'pan', moved: false, startX: pos.x, startY: pos.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const pos = localPos(e);
    pointers.current.set(e.pointerId, pos);
    const g = gesture.current;
    if (!g) return;
    if (g.kind === 'pinch' && pointers.current.size >= 2) {
      const [p1, p2] = [...pointers.current.values()];
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (g.dist > 0 && dist > 0) {
        const factor = dist / g.dist;
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        setVp((v) => zoomAt(v, factor, mx, my));
        gesture.current = { kind: 'pinch', dist };
      }
      return;
    }
    if (g.kind === 'pan') {
      const dx = pos.x - prev.x;
      const dy = pos.y - prev.y;
      if (!g.moved && Math.hypot(pos.x - g.startX, pos.y - g.startY) > 4) g.moved = true;
      if (g.moved) setVp((v) => panBy(v, dx, dy));
      return;
    }
    pending.current = { sx: pos.x, sy: pos.y };
    if (raf.current === null) raf.current = requestAnimationFrame(flush);
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>, cancelled = false) => {
    const pos = localPos(e);
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (g && g.kind === 'pan' && !g.moved && !cancelled && onWorldClick) {
      const w = toWorld(vpRef.current, pos.x, pos.y);
      onWorldClick(w.x, w.y);
    }
    if (g && (g.kind === 'point' || g.kind === 'probe' || g.kind === 'line') && !cancelled) {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current);
        raf.current = null;
      }
      pending.current = null;
      if (g.kind === 'line') applyDrag(pos.x, pos.y, true);
    }
    if (pointers.current.size === 0) gesture.current = null;
    else if (pointers.current.size === 1) {
      const rest = [...pointers.current.values()][0];
      gesture.current = { kind: 'pan', moved: true, startX: rest.x, startY: rest.y };
    }
  };

  const wheelRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const factor = Math.exp(-e.deltaY * 0.0015);
      setVp((v) => zoomAt(v, factor, e.clientX - r.left, e.clientY - r.top));
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    []
  );

  // ----- Keyboard control of the constrained point -----
  const onHandleKey = (e: React.KeyboardEvent) => {
    if (dragMode !== 'point' || !point || !dragLine || !onPointDrag) return;
    let dir = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') dir = 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') dir = -1;
    else return;
    e.preventDefault();
    // constrainToLine moves along whichever axis drives this line; both are nudged by half a unit.
    const next = constrainToLine(dragLine, toNumber(point.x) + dir * 0.5, toNumber(point.y) + dir * 0.5, 0.5);
    if (next) onPointDrag(next);
  };

  // ----- Render data -----
  const bd = useMemo(() => viewportBounds(vp), [vp]);
  // Fixed-window diagrams (practice questions) need every whole unit visible so lattice points can be read and clicked.
  const step = useMemo(() => niceStep(vp.scale, extent ? 20 : 38), [vp.scale, extent]);
  const xs = useMemo(() => gridTicks(bd.xMin, bd.xMax, step), [bd, step]);
  const ys = useMemo(() => gridTicks(bd.yMin, bd.yMax, step), [bd, step]);
  const origin = toScreen(vp, 0, 0);
  const axisX = Math.min(vp.width - 6, Math.max(6, origin.sx));
  const axisY = Math.min(vp.height - 6, Math.max(6, origin.sy));

  const segments = useMemo(
    () => lines.map((l) => ({ line: l, seg: clipLineToBounds(l.eq, bd) })),
    [lines, bd]
  );

  const showLabels = vp.scale >= 26;

  const interceptMarks = useMemo(() => {
    if (!interceptsOf) return [];
    const out: { x: number; y: number; text: string }[] = [];
    const xi = xIntercept(interceptsOf);
    const yi = yIntercept(interceptsOf);
    if (xi.kind === 'point') out.push({ x: toNumber(xi.value), y: 0, text: `(${formatRational(xi.value)}, 0)` });
    if (yi.kind === 'point') out.push({ x: 0, y: toNumber(yi.value), text: `(0, ${formatRational(yi.value)})` });
    return out;
  }, [interceptsOf]);

  const slopeTriangle = useMemo(() => {
    if (!slopeOf || !isLine(slopeOf)) return null;
    const m = slope(slopeOf);
    const yi = yIntercept(slopeOf);
    if (m === null || yi.kind !== 'point') return null;
    const mm = toNumber(m);
    const k = toNumber(yi.value);
    // Start at an integer x near the middle of the view, run = 1 (or larger when zoomed out).
    const run = Math.max(1, Math.round(step));
    const x0 = Math.round(Math.min(Math.max(vp.cx, bd.xMin + run), bd.xMax - 2 * run));
    return { x0, y0: mm * x0 + k, x1: x0 + run, y1: mm * (x0 + run) + k, run, rise: mm * run };
  }, [slopeOf, vp.cx, bd, step]);

  const s = (x: number, y: number) => toScreen(vp, x, y);

  const cursor =
    dragMode === 'none' ? 'grab' : dragMode === 'line' ? 'move' : 'grab';

  return (
    <div ref={wrapRef} className={`relative w-full h-full min-h-[220px] overflow-hidden select-none ${className}`} style={{ background: C.bg }}>
      <svg
        ref={wheelRef}
        width={vp.width}
        height={vp.height}
        viewBox={`0 0 ${vp.width} ${vp.height}`}
        role="img"
        aria-label={ariaLabel}
        className="block"
        style={{ touchAction: 'none', cursor }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => endPointer(e)}
        onPointerCancel={(e) => endPointer(e, true)}
      >
        {/* Grid: visible lines only */}
        <g stroke={C.grid} strokeWidth={1}>
          {xs.map((x) => {
            const sx = s(x, 0).sx;
            return <line key={`gx${x}`} x1={sx} y1={0} x2={sx} y2={vp.height} />;
          })}
          {ys.map((y) => {
            const sy = s(0, y).sy;
            return <line key={`gy${y}`} x1={0} y1={sy} x2={vp.width} y2={sy} />;
          })}
        </g>

        {/* Axes */}
        <g stroke={C.axis} strokeWidth={1.6}>
          {origin.sx >= 0 && origin.sx <= vp.width && <line x1={origin.sx} y1={0} x2={origin.sx} y2={vp.height} />}
          {origin.sy >= 0 && origin.sy <= vp.height && <line x1={0} y1={origin.sy} x2={vp.width} y2={origin.sy} />}
        </g>
        <g fill={C.label} fontSize={11} fontFamily="ui-monospace, monospace">
          {xs.map((x) => (x === 0 ? null : <text key={`tx${x}`} x={s(x, 0).sx} y={Math.min(vp.height - 4, Math.max(12, axisY + 14))} textAnchor="middle">{fmt(x)}</text>))}
          {ys.map((y) => (y === 0 ? null : <text key={`ty${y}`} x={Math.min(vp.width - 20, Math.max(6, axisX + 6))} y={s(0, y).sy + 4}>{fmt(y)}</text>))}
          <text x={vp.width - 14} y={Math.min(vp.height - 22, Math.max(14, axisY - 8))} fill="#e2e8f0" fontSize={14} fontWeight={700} textAnchor="end">x</text>
          <text x={Math.min(vp.width - 22, Math.max(12, axisX + 10))} y={14} fill="#e2e8f0" fontSize={14} fontWeight={700}>y</text>
          {origin.sx > 0 && origin.sx < vp.width && origin.sy > 0 && origin.sy < vp.height && (
            <text x={origin.sx - 6} y={origin.sy + 14} textAnchor="end">O</text>
          )}
        </g>

        {/* Lines */}
        {segments.map(({ line, seg }, i) =>
          seg ? (
            <g key={`l${i}`}>
              <line
                x1={s(seg.x1, seg.y1).sx}
                y1={s(seg.x1, seg.y1).sy}
                x2={s(seg.x2, seg.y2).sx}
                y2={s(seg.x2, seg.y2).sy}
                stroke={line.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeDasharray={line.dashed ? '10 7' : undefined}
              />
              {line.label && (
                <text
                  x={Math.min(vp.width - 8, Math.max(8, (s(seg.x1, seg.y1).sx + s(seg.x2, seg.y2).sx) / 2 + 8))}
                  y={Math.min(vp.height - 8, Math.max(16, (s(seg.x1, seg.y1).sy + s(seg.x2, seg.y2).sy) / 2 - 8))}
                  fill={line.color}
                  fontSize={12}
                  fontWeight={700}
                  fontFamily="ui-monospace, monospace"
                  stroke={C.bg}
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {line.label}
                </text>
              )}
            </g>
          ) : null
        )}

        {/* Slope triangle */}
        {slopeTriangle && (
          <g stroke={C.amber} strokeWidth={2} fill="none" strokeDasharray="4 3">
            <polyline points={`${s(slopeTriangle.x0, slopeTriangle.y0).sx},${s(slopeTriangle.x0, slopeTriangle.y0).sy} ${s(slopeTriangle.x1, slopeTriangle.y0).sx},${s(slopeTriangle.x1, slopeTriangle.y0).sy} ${s(slopeTriangle.x1, slopeTriangle.y1).sx},${s(slopeTriangle.x1, slopeTriangle.y1).sy}`} />
            <text x={(s(slopeTriangle.x0, 0).sx + s(slopeTriangle.x1, 0).sx) / 2} y={s(0, slopeTriangle.y0).sy + 16} fill={C.amber} stroke="none" fontSize={11} textAnchor="middle" fontFamily="ui-monospace, monospace">run {slopeTriangle.run}</text>
            <text x={s(slopeTriangle.x1, 0).sx + 6} y={(s(0, slopeTriangle.y0).sy + s(0, slopeTriangle.y1).sy) / 2} fill={C.amber} stroke="none" fontSize={11} fontFamily="ui-monospace, monospace">rise {fmt(slopeTriangle.rise)}</text>
          </g>
        )}

        {/* Intercepts */}
        {interceptMarks.map((m, i) => {
          const p = s(m.x, m.y);
          return (
            <g key={`ic${i}`}>
              <circle cx={p.sx} cy={p.sy} r={6} fill="#a78bfa" stroke={C.bg} strokeWidth={2} />
              <text x={p.sx + 9} y={p.sy - 9} fill="#c4b5fd" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" stroke={C.bg} strokeWidth={3} paintOrder="stroke">{m.text}</text>
            </g>
          );
        })}

        {/* Table points */}
        {tablePoints?.map((p, i) => {
          const q = s(p.x, p.y);
          return (
            <g key={`tp${i}`}>
              <circle cx={q.sx} cy={q.sy} r={5} fill={C.amber} stroke={C.bg} strokeWidth={2} />
              {showLabels && (
                <text x={q.sx + 8} y={q.sy + 16} fill={C.amber} fontSize={11} fontFamily="ui-monospace, monospace" stroke={C.bg} strokeWidth={3} paintOrder="stroke">({fmt(p.x)}, {fmt(p.y)})</text>
              )}
            </g>
          );
        })}

        {/* Intersection (only when supplied: never for parallel/coincident lines) */}
        {intersection && (
          <g>
            <circle cx={s(intersection.x, intersection.y).sx} cy={s(intersection.x, intersection.y).sy} r={13} fill="rgba(52,211,153,0.18)" />
            <circle cx={s(intersection.x, intersection.y).sx} cy={s(intersection.x, intersection.y).sy} r={6} fill={C.point} stroke="#fff" strokeWidth={2} />
            <text x={s(intersection.x, intersection.y).sx + 12} y={s(intersection.x, intersection.y).sy - 12} fill="#6ee7b7" fontSize={13} fontWeight={800} fontFamily="ui-monospace, monospace" stroke={C.bg} strokeWidth={3} paintOrder="stroke">
              {intersection.label ?? `(${fmt(intersection.x)}, ${fmt(intersection.y)})`}
            </text>
          </g>
        )}

        {/* Constrained draggable point */}
        {dragMode === 'point' && point && (
          <g
            tabIndex={0}
            role="slider"
            aria-label="Point on the line. Use arrow keys to move it."
            aria-valuetext={`(${formatRational(point.x)}, ${formatRational(point.y)})`}
            onKeyDown={onHandleKey}
            style={{ outline: 'none' }}
          >
            <circle cx={s(toNumber(point.x), toNumber(point.y)).sx} cy={s(toNumber(point.x), toNumber(point.y)).sy} r={20} fill="rgba(52,211,153,0.12)" />
            <circle cx={s(toNumber(point.x), toNumber(point.y)).sx} cy={s(toNumber(point.x), toNumber(point.y)).sy} r={8} fill={C.point} stroke="#fff" strokeWidth={2.5} />
            <text x={s(toNumber(point.x), toNumber(point.y)).sx + 12} y={s(toNumber(point.x), toNumber(point.y)).sy - 12} fill="#a7f3d0" fontSize={13} fontWeight={800} fontFamily="ui-monospace, monospace" stroke={C.bg} strokeWidth={3} paintOrder="stroke">
              ({formatRational(point.x)}, {formatRational(point.y)})
            </text>
          </g>
        )}

        {/* Free probe point */}
        {dragMode === 'probe' && probe && (
          <g>
            <circle cx={s(probe.x, probe.y).sx} cy={s(probe.x, probe.y).sy} r={20} fill="rgba(148,163,184,0.12)" />
            <circle
              cx={s(probe.x, probe.y).sx}
              cy={s(probe.x, probe.y).sy}
              r={8}
              fill={C.bg}
              stroke={probe.status === 'exact' ? C.point : probe.status === 'approximate' ? C.amber : C.bad}
              strokeWidth={3.5}
            />
            <text x={s(probe.x, probe.y).sx + 12} y={s(probe.x, probe.y).sy - 12} fill="#e2e8f0" fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace" stroke={C.bg} strokeWidth={3} paintOrder="stroke">
              ({fmt(probe.x)}, {fmt(probe.y)})
            </text>
          </g>
        )}

        {/* Click marker for practice questions */}
        {clickMarker && (
          <circle
            cx={s(clickMarker.x, clickMarker.y).sx}
            cy={s(clickMarker.x, clickMarker.y).sy}
            r={8}
            fill={clickMarker.correct === undefined ? C.amber : clickMarker.correct ? C.point : C.bad}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </svg>

      {/* View controls */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5">
        <button type="button" aria-label="Zoom in" onClick={() => setVp((v) => zoomAt(v, 1.4, v.width / 2, v.height / 2))} className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xl font-bold hover:bg-slate-700">+</button>
        <button type="button" aria-label="Zoom out" onClick={() => setVp((v) => zoomAt(v, 1 / 1.4, v.width / 2, v.height / 2))} className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-600 text-white text-xl font-bold hover:bg-slate-700">−</button>
        <button
          type="button"
          aria-label="Fit graph to view"
          title="Fit to graph"
          onClick={() => (extent ? setVp((v) => ({ ...v, cx: 0, cy: 0, scale: clampScale(Math.min(v.width, v.height) / (extent * 2.1)) })) : doFit())}
          className="w-11 h-11 rounded-xl bg-slate-800/90 border border-slate-600 text-white hover:bg-slate-700 flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>
      </div>
    </div>
  );
};
