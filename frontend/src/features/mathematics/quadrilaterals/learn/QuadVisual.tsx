/**
 * Quadrilateral visuals for the shared Learn framework (EDU-1Q).
 *
 * `quadFig` draws one figure whose vertices the student can move by dragging, by
 * the arrow keys on a focused vertex, or with the on-screen buttons. Every
 * number in the readout comes from engine/.../learn/figure.ts, the same model
 * that decides the lesson's answers; nothing is read off the drawing.
 * `quadGallery` shows several fixed figures, each one a tappable answer.
 * Observing a pattern here is evidence, never proof: the lesson text says so.
 */

import { QuadPracticeFigure } from './QuadPracticeFigure';
import React, { useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../../education/visuals';
import { generateQuadrilateralTiling } from '../../../../engine/mathematics/quadrilaterals/geometry';
import {
  analyzeQuad, centroidFacts, completeParallelogram, converseFacts, describeQuad, dist, KIND_LABEL, mid, midpointFacts, NAMES, varignonFacts,
  type Pt, type Quad,
} from '../../../../engine/mathematics/quadrilaterals/learn/figure';
import type { GalleryFigure, QuadVisualProps } from '../../../../engine/mathematics/quadrilaterals/learn/questions';

const SIZE = 400;
const U = SIZE / 10; // pixels per world unit
const STEP = 0.5;
const LO = 0.5, HI = 9.5;
const X = (x: number) => x * U;
const Y = (y: number) => SIZE - y * U;
const f1 = (n: number) => n.toFixed(1);
const f2 = (n: number) => (Math.round(n * 100) / 100).toString();
const C = { line: '#94a3b8', main: '#a78bfa', aux: '#fb7185', hi: '#fbbf24', text: '#e2e8f0', ok: '#34d399', tile: ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b'] };

const snap = (v: number) => Math.min(HI, Math.max(LO, Math.round(v / STEP) * STEP));
const pathOf = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'} ${X(p.x)} ${Y(p.y)}`).join(' ') + ' Z';
const yn = (b: boolean) => (b ? 'yes' : 'no');

type Names = Record<string, Pt>;

interface View {
  names: Names;
  main: Pt[];
  aux?: Pt[];
  segs: [string, string, boolean][]; // [from, to, dashed]
  lines: string[];
  summary: string;
}

function buildView(p: QuadVisualProps, pts: Pt[], tParam: number): View {
  const [A, B, C3] = pts;
  const tri = p.mode === 'midpoint' || p.mode === 'converse' || p.mode === 'centroid' || p.mode === 'triangleAngles';
  if (tri) {
    const t: [Pt, Pt, Pt] = [A, B, C3];
    const names: Names = { A, B, C: C3 };
    const segs: View['segs'] = [];
    const lines: string[] = [];
    let summary = '';
    if (p.mode === 'triangleAngles') {
      const ang = (a: Pt, v: Pt, b: Pt) => {
        const u = { x: a.x - v.x, y: a.y - v.y }, w = { x: b.x - v.x, y: b.y - v.y };
        return (Math.acos((u.x * w.x + u.y * w.y) / (Math.hypot(u.x, u.y) * Math.hypot(w.x, w.y))) * 180) / Math.PI;
      };
      const a = ang(B, A, C3), b = ang(A, B, C3), c = ang(A, C3, B);
      lines.push(`∠A = ${f1(a)}°`, `∠B = ${f1(b)}°`, `∠C = ${f1(c)}°`, `∠A + ∠B + ∠C = ${f1(a + b + c)}°`);
      summary = `The angles add up to ${f1(a + b + c)} degrees.`;
      return { names, main: t, segs, lines, summary };
    }
    if (p.mode === 'midpoint') {
      const m = midpointFacts(t);
      Object.assign(names, { P: m.P, Q: m.Q });
      segs.push(['P', 'Q', false]);
      lines.push(`PQ = ${f2(m.pq)}`, `BC = ${f2(m.bc)}`, `PQ ÷ BC = ${f2(m.ratio)}`, `PQ parallel to BC: ${yn(m.parallel)}`);
      summary = `PQ is ${f2(m.ratio)} of BC and ${m.parallel ? 'parallel to it' : 'not parallel to it'}.`;
      let aux: Pt[] | undefined;
      if (p.proof) { Object.assign(names, { R: m.R }); segs.push(['Q', 'R', true], ['C', 'R', true]); aux = [B, C3, m.R, m.P]; lines.push(`QR = PQ = ${f2(m.pq)}, and BCRP is a parallelogram`); }
      return { names, main: t, aux, segs, lines, summary };
    }
    if (p.mode === 'converse') {
      const c = converseFacts(t, tParam);
      Object.assign(names, { P: c.P, Q: c.Q });
      segs.push(['P', 'Q', false]);
      lines.push(`AP ÷ AB = ${f2(c.ap / c.ab)}`, `AQ = ${f2(c.aq)}, QC = ${f2(c.qc)}`, `Q is the midpoint of AC: ${yn(c.bisects)}`, `PQ = ${f2(c.pq)}, BC = ${f2(c.bc)}`);
      summary = c.bisects ? 'P is the midpoint of AB, and Q is the midpoint of AC.' : 'P is not the midpoint of AB, and Q is not the midpoint of AC.';
      return { names, main: t, segs, lines, summary };
    }
    const g = centroidFacts(t);
    Object.assign(names, { D: g.D, E: g.E, F: g.F, G: g.G });
    segs.push(['A', 'D', false], ['B', 'E', false], ['C', 'F', false]);
    let aux: Pt[] | undefined;
    if (p.proof) {
      const M = mid(B, g.G), N = mid(C3, g.G);
      Object.assign(names, { M, N });
      segs.push(['F', 'E', true], ['M', 'N', true]);
      aux = [g.F, g.E, N, M];
    }
    lines.push(`AG ÷ GD = ${f2(g.ratios[0])}`, `BG ÷ GE = ${f2(g.ratios[1])}`, `CG ÷ GF = ${f2(g.ratios[2])}`, `Third median misses G by ${f2(g.thirdMedianMiss)}`);
    summary = `The medians meet at G and cut each other ${f2(g.ratios[0])} to 1.`;
    return { names, main: t, aux, segs, lines, summary };
  }

  // four-sided figures
  const q: Quad = p.mode === 'parallelogram' ? [A, B, C3, completeParallelogram(A, B, C3)] : [pts[0], pts[1], pts[2], pts[3]];
  const an = analyzeQuad(q);
  const names: Names = { A: q[0], B: q[1], C: q[2], D: q[3] };
  const segs: View['segs'] = [];
  const lines: string[] = [];
  const showDiag = p.diagonals ?? p.mode === 'parallelogram';
  if (showDiag) segs.push(['A', 'C', true], ['B', 'D', true]);
  const O = mid(q[0], q[2]);
  const ang = an.angles;
  let summary = `This is a ${KIND_LABEL[an.kind]}.`;
  let aux: Pt[] | undefined;

  if (p.mode === 'wheel' || p.mode === 'tiling') {
    if (p.mode === 'tiling') lines.push(an.isQuadrilateral ? `Angles ${an.angles!.map(f1).join('°, ')}° add up to ${f1(an.angleSum!)}°` : 'A tiling needs a quadrilateral (no crossing sides, no three points on a line).');
    else lines.push(...(ang ? [`∠A = ${f1(ang[0])}°`, `∠B = ${f1(ang[1])}°`, `∠C = ${f1(ang[2])}°`, `∠D = ${f1(ang[3])}°`, `Total = ${f1(an.angleSum!)}°`] : ['Not a quadrilateral, so there are no four interior angles.']));
    return { names, main: q, segs: [], lines, summary };
  }

  if (p.mode === 'parallelogram') {
    if (showDiag) names.O = O;
    lines.push(`AB = ${f2(an.sides[0])}, DC = ${f2(an.sides[2])}`, `BC = ${f2(an.sides[1])}, AD = ${f2(an.sides[3])}`);
    if (ang) lines.push(`∠A = ${f1(ang[0])}°, ∠C = ${f1(ang[2])}°`, `∠B = ${f1(ang[1])}°, ∠D = ${f1(ang[3])}°`, `∠A + ∠B = ${f1(ang[0] + ang[1])}°`);
    if (showDiag) lines.push(`OA = ${f2(dist(O, q[0]))}, OC = ${f2(dist(O, q[2]))}`, `OB = ${f2(dist(O, q[1]))}, OD = ${f2(dist(O, q[3]))}`);
    summary = `Opposite sides are ${an.oppSidesEqual[0] && an.oppSidesEqual[1] ? 'equal' : 'not equal'}, opposite angles are ${an.oppAnglesEqual[0] && an.oppAnglesEqual[1] ? 'equal' : 'not equal'}, and the diagonals ${an.diagonalsBisect ? 'bisect' : 'do not bisect'} each other.`;
    return { names, main: q, segs, lines, summary };
  }

  if (p.focus === 'tests') {
    lines.push(
      `AB = ${f2(an.sides[0])}, DC = ${f2(an.sides[2])}; BC = ${f2(an.sides[1])}, AD = ${f2(an.sides[3])}`,
      `Both pairs of opposite sides equal: ${yn(an.oppSidesEqual[0] && an.oppSidesEqual[1])}`,
      `Both pairs of opposite angles equal: ${yn(an.oppAnglesEqual[0] && an.oppAnglesEqual[1])}`,
      `Diagonals bisect each other: ${yn(an.diagonalsBisect)}`,
      `One pair of sides both equal and parallel: ${yn(an.onePairEqualAndParallel)}`,
      `Diagonals equal: ${yn(an.diagonalsEqual)}; perpendicular: ${yn(an.diagonalsPerpendicular)}`,
    );
    summary = `Right now it is a ${KIND_LABEL[an.kind]}.`;
  } else if (p.focus === 'varignon') {
    const v = varignonFacts(q);
    Object.assign(names, { P: v.P, Q: v.Q, R: v.R, S: v.S });
    aux = [v.P, v.Q, v.R, v.S];
    lines.push(`PQ = ${f2(v.sides[0])}, SR = ${f2(v.sides[2])} (half of AC = ${f2(v.acHalf)})`, `QR = ${f2(v.sides[1])}, PS = ${f2(v.sides[3])} (half of BD = ${f2(v.bdHalf)})`, `PQRS is a parallelogram: ${yn(v.parallelogram)}`);
    if (v.areaRatio !== null) lines.push(`Area of PQRS ÷ area of ABCD = ${f2(v.areaRatio)}`);
    lines.push(`Diagonals of ABCD equal: ${yn(an.diagonalsEqual)}; perpendicular: ${yn(an.diagonalsPerpendicular)}`);
    summary = `PQRS ${v.parallelogram ? 'is' : 'is not'} a parallelogram${v.rhombus && v.parallelogram ? ' (here a rhombus)' : v.rectangle && v.parallelogram ? ' (here a rectangle)' : ''}.`;
  } else {
    if (ang) lines.push(`∠A = ${f1(ang[0])}°, ∠B = ${f1(ang[1])}°`, `∠C = ${f1(ang[2])}°, ∠D = ${f1(ang[3])}°`, `Sum of the angles = ${f1(an.angleSum!)}°`);
    lines.push(`Convex: ${yn(an.convex)}`, `Diagonals AC and BD cross each other: ${yn(an.diagonalsCross)}`);
    if (!ang) lines.unshift(an.crossed ? 'Two sides cross, so the interior angles are not defined.' : 'Three points are on one line, so this is not a quadrilateral.');
  }
  return { names, main: q, aux, segs, lines, summary };
}

const QuadFig: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as QuadVisualProps;
  const init = useMemo(() => p.pts.map((q) => ({ ...q })), [p.pts]);
  const [pts, setPts] = useState<Pt[]>(init);
  const [t, setT] = useState(p.t ?? 0.5);
  const [sel, setSel] = useState(0);
  const dragging = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // A different figure (new props) starts from its own vertices: reset while rendering, not in an effect.
  const [prevInit, setPrevInit] = useState(init);
  if (prevInit !== init) { setPrevInit(init); setPts(init); setT(p.t ?? 0.5); }

  const movable = p.drag === false ? [] : p.mode === 'parallelogram' || p.mode === 'midpoint' || p.mode === 'converse' || p.mode === 'centroid' || p.mode === 'triangleAngles' ? [0, 1, 2] : [0, 1, 2, 3];
  const view = buildView(p, pts, t);
  const hl = new Set(((props.highlight as string[] | undefined) ?? []));
  const three = p.pts.length === 3;
  const visible = three ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
  const extra = Object.keys(view.names).filter((k) => !visible.includes(k));

  const place = (i: number, x: number, y: number) => {
    setPts((prev) => {
      const next = prev.map((q) => ({ ...q }));
      next[i] = { x: snap(x), y: snap(y) };
      if (p.mode === 'parallelogram') {
        const d = completeParallelogram(next[0], next[1], next[2]);
        if (d.x < 0.2 || d.x > 9.8 || d.y < 0.2 || d.y > 9.8) return prev;
      }
      return next;
    });
  };
  const fromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 10, y: 10 - ((e.clientY - r.top) / r.height) * 10 };
  };
  const nudge = (i: number, dx: number, dy: number) => place(i, pts[i].x + dx, pts[i].y + dy);
  const keys = (i: number) => (e: React.KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, STEP], ArrowDown: [0, -STEP] };
    if (d[e.key]) { e.preventDefault(); nudge(i, d[e.key][0], d[e.key][1]); }
  };

  const labelAt = (pt: Pt) => {
    const cx = view.main.reduce((s, q) => s + q.x, 0) / view.main.length, cy = view.main.reduce((s, q) => s + q.y, 0) / view.main.length;
    const dx = pt.x - cx, dy = pt.y - cy, d = Math.hypot(dx, dy) || 1;
    return { x: X(pt.x) + (dx / d) * 18, y: Y(pt.y) - (dy / d) * 18 + 5 };
  };

  // wheel
  const wheel = (() => {
    if (p.mode !== 'wheel') return null;
    const an = analyzeQuad(view.main as Quad);
    if (!an.angles) return null;
    let a0 = -90;
    return an.angles.map((deg, i) => {
      const a1 = a0 + deg;
      const rad = (v: number) => (v * Math.PI) / 180;
      const R = 140, cx = 200, cy = 190;
      const x0 = cx + R * Math.cos(rad(a0)), y0 = cy + R * Math.sin(rad(a0)), x1 = cx + R * Math.cos(rad(a1)), y1 = cy + R * Math.sin(rad(a1));
      const mAng = rad((a0 + a1) / 2);
      const out = { i, deg, d: `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x1} ${y1} Z`, lx: cx + (R * 0.62) * Math.cos(mAng), ly: cy + (R * 0.62) * Math.sin(mAng) + 4 };
      a0 = a1;
      return out;
    });
  })();

  const tiles = p.mode === 'tiling' && analyzeQuad(view.main as Quad).isQuadrilateral ? generateQuadrilateralTiling(view.main as Quad, 7, 7).tiles : [];

  const hiSegs = [...hl].filter((k) => k.length === 2 && view.names[k[0]] && view.names[k[1]]);
  const hiPolys = [...hl].filter((k) => k.length >= 3 && [...k].every((c) => view.names[c]));

  return (
    <div className="space-y-3" data-visual="quadFig" data-mode={p.mode}>
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none" role="group" aria-label={alt}
        style={{ touchAction: movable.length ? 'none' : 'auto' }}
        onPointerMove={(e) => { if (dragging.current !== null) { const w = fromEvent(e); place(dragging.current, w.x, w.y); } }}
        onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}>
        <title>{alt}</title>
        {p.mode !== 'wheel' && Array.from({ length: 11 }, (_, i) => (
          <g key={i} stroke="#1e293b" strokeWidth={1}><line x1={X(i)} y1={0} x2={X(i)} y2={SIZE} /><line x1={0} y1={Y(i)} x2={SIZE} y2={Y(i)} /></g>
        ))}
        {p.mode === 'wheel' && wheel && wheel.map((w) => (
          <g key={w.i}><path d={w.d} fill={C.tile[w.i]} fillOpacity={0.45} stroke="#0f172a" strokeWidth={2} /><text x={w.lx} y={w.ly} textAnchor="middle" fill={C.text} fontSize={15} fontWeight={700}>∠{NAMES[w.i]} {f1(w.deg)}°</text></g>
        ))}
        {p.mode === 'wheel' && wheel && <text x={200} y={372} textAnchor="middle" fill={C.text} fontSize={15}>Four angles fill one full turn</text>}
        {tiles.map((tl) => <path key={tl.id} d={pathOf(tl.vertices)} fill={C.tile[tl.colorIndex % 4]} fillOpacity={tl.isRotated180 ? 0.3 : 0.5} stroke="#0f172a" strokeWidth={1} pointerEvents="none" />)}
        {p.mode !== 'wheel' && <path d={pathOf(view.main)} fill={C.main} fillOpacity={p.mode === 'tiling' ? 0 : 0.14} stroke={!three && analyzeQuad(view.main as Quad).kind === 'self-intersecting' ? C.aux : C.main} strokeWidth={3} strokeLinejoin="round" pointerEvents="none" />}
        {p.triangles && !three && <g pointerEvents="none"><path d={pathOf([view.names.A, view.names.B, view.names.C])} fill={C.tile[1]} fillOpacity={0.22} /><path d={pathOf([view.names.C, view.names.D, view.names.A])} fill={C.tile[3]} fillOpacity={0.22} /></g>}
        {view.aux && <path d={pathOf(view.aux)} fill={C.aux} fillOpacity={0.14} stroke={C.aux} strokeWidth={2.5} strokeLinejoin="round" pointerEvents="none" />}
        {hiPolys.map((k) => <path key={k} d={pathOf([...k].map((c) => view.names[c]))} fill={C.hi} fillOpacity={0.28} stroke={C.hi} strokeWidth={2} pointerEvents="none" />)}
        {view.segs.map(([a, b, dashed]) => <line key={a + b} pointerEvents="none" x1={X(view.names[a].x)} y1={Y(view.names[a].y)} x2={X(view.names[b].x)} y2={Y(view.names[b].y)} stroke={C.line} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} />)}
        {hiSegs.map((k) => <line key={`h${k}`} pointerEvents="none" x1={X(view.names[k[0]].x)} y1={Y(view.names[k[0]].y)} x2={X(view.names[k[1]].x)} y2={Y(view.names[k[1]].y)} stroke={C.hi} strokeWidth={5} strokeLinecap="round" />)}
        {p.mode !== 'wheel' && extra.map((k) => <g key={k} pointerEvents="none"><circle cx={X(view.names[k].x)} cy={Y(view.names[k].y)} r={hl.has(k) ? 7 : 5} fill={hl.has(k) ? C.hi : C.aux} /><text x={labelAt(view.names[k]).x} y={labelAt(view.names[k]).y} textAnchor="middle" fill={C.text} fontSize={15} fontWeight={700}>{k}</text></g>)}
        {p.mode !== 'wheel' && visible.map((k, i) => {
          const pt = view.names[k];
          const can = movable.includes(i);
          const derived = p.mode === 'parallelogram' && i === 3;
          return (
            <g key={k} className="group outline-none" {...(can ? {
              role: 'button', tabIndex: 0, 'aria-label': `Vertex ${k} at (${f2(pt.x)}, ${f2(pt.y)}). Arrow keys move it by half a unit.`, style: { cursor: 'grab' },
              onPointerDown: (e: React.PointerEvent) => { dragging.current = i; setSel(i); (e.target as Element).setPointerCapture?.(e.pointerId); },
              onKeyDown: keys(i), onFocus: () => setSel(i),
            } : {})}>
              {can && <circle cx={X(pt.x)} cy={Y(pt.y)} r={30} fill="transparent" />}
              {can && <circle cx={X(pt.x)} cy={Y(pt.y)} r={14} fill="none" strokeWidth={3} className="stroke-transparent group-focus:stroke-white" pointerEvents="none" />}
              <circle cx={X(pt.x)} cy={Y(pt.y)} r={can ? 8 : 6} fill={hl.has(k) ? C.hi : derived ? '#64748b' : C.main} stroke="#0f172a" strokeWidth={2} pointerEvents="none" />
              <text x={labelAt(pt).x} y={labelAt(pt).y} textAnchor="middle" fill={C.text} fontSize={16} fontWeight={800} pointerEvents="none">{k}</text>
            </g>
          );
        })}
      </svg>

      <div role="status" aria-live="polite" className="text-sm font-medium text-slate-100 text-center">{view.summary}</div>
      <ul data-testid="quad-readout" className="grid gap-1 text-xs font-mono text-slate-300 sm:grid-cols-2 rounded-xl border border-surface-border bg-surface-card p-3">
        {view.lines.map((l) => <li key={l}>{l}</li>)}
      </ul>

      {p.mode === 'converse' && p.slider && (
        <label className="flex items-center gap-3 text-xs text-slate-300">
          <span className="shrink-0">Position of P along AB</span>
          <input type="range" min={1} max={9} step={1} value={Math.round(t * 10)} onChange={(e) => setT(Number(e.target.value) / 10)} className="w-full min-h-[44px]" aria-label="Position of P along AB, in tenths of the way from A to B" aria-valuetext={`${f2(t)} of the way from A to B`} />
          <span className="font-mono w-10 text-right">{f2(t)}</span>
        </label>
      )}

      {movable.length > 0 && (
        <div role="group" aria-label="Move a vertex with buttons" className="flex flex-wrap items-center gap-2" data-testid="quad-nudge">
          <span className="text-xs text-slate-400">Move vertex</span>
          {movable.map((i) => (
            <button key={i} type="button" aria-pressed={sel === i} onClick={() => setSel(i)} className={`min-w-[44px] min-h-[44px] rounded-lg border text-sm font-bold ${sel === i ? 'bg-violet-600 border-violet-400 text-white' : 'bg-surface-card border-surface-border text-slate-200'}`}>{NAMES[i]}</button>
          ))}
          <span className="inline-flex gap-1">
            {([['←', 'left', -STEP, 0], ['↑', 'up', 0, STEP], ['↓', 'down', 0, -STEP], ['→', 'right', STEP, 0]] as const).map(([sym, name, dx, dy]) => (
              <button key={name} type="button" aria-label={`Move ${NAMES[sel] ?? 'A'} ${name}`} onClick={() => nudge(sel, dx, dy)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">{sym}</button>
            ))}
          </span>
          <button type="button" onClick={() => { setPts(init); setT(p.t ?? 0.5); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-xs text-slate-200">Reset figure</button>
        </div>
      )}
    </div>
  );
};

const QuadGallery: React.FC<VisualProps> = ({ props, alt, onAnswer, locked }) => {
  const figures = props.figures as GalleryFigure[];
  const [chosen, setChosen] = useState<string | null>(null);
  const answerable = Boolean(onAnswer);
  return (
    <div className="space-y-2" data-visual="quadGallery" role="group" aria-label={alt}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {figures.map((f) => {
          const an = analyzeQuad(f.pts);
          const body = (
            <>
              <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full rounded-lg bg-surface-lowest" aria-hidden="true">
                <path d={pathOf(f.pts)} fill={C.main} fillOpacity={0.16} stroke={an.kind === 'self-intersecting' ? C.aux : C.main} strokeWidth={5} strokeLinejoin="round" />
                {f.pts.map((q, i) => <g key={i}><circle cx={X(q.x)} cy={Y(q.y)} r={11} fill={C.main} /><text x={X(q.x) + (q.x < 5 ? -28 : 16)} y={Y(q.y) + (q.y < 5 ? 30 : -14)} fill={C.text} fontSize={34} fontWeight={800}>{NAMES[i]}</text></g>)}
              </svg>
              <span className="block text-center text-sm font-bold text-white mt-1">Figure {f.label}</span>
            </>
          );
          return answerable ? (
            <button key={f.id} type="button" disabled={locked} aria-pressed={chosen === f.id} aria-label={describeQuad(`Choose figure ${f.label}.`, f.pts)} data-figure={f.id}
              onClick={() => { setChosen(f.id); onAnswer!(f.id); }} className={`min-h-[44px] rounded-xl border p-2 text-left transition-colors ${chosen === f.id ? 'border-violet-400 bg-violet-500/10' : 'border-surface-border bg-surface-card hover:border-violet-400/60'}`}>{body}</button>
          ) : (
            <div key={f.id} role="img" aria-label={describeQuad(`Figure ${f.label}.`, f.pts)} className="rounded-xl border border-surface-border bg-surface-card p-2">{body}</div>
          );
        })}
      </div>
    </div>
  );
};

export const QUAD_VISUALS: VisualRegistry = { quadFig: QuadFig, quadGallery: QuadGallery, quadPracticeScene: QuadPracticeFigure };
