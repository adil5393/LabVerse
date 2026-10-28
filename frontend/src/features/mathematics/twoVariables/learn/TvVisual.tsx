/**
 * Graph, table and substitution check for the Two Variables Learn lessons
 * (EDU-1M5). One equation is held in one place; the line, the table, the test
 * point, the substitution steps and the text all come from
 * engine/.../learn/model.ts, so they cannot disagree.
 *
 * Every control has a keyboard and an on-screen button alternative; nothing needs
 * dragging. Satisfying and non-satisfying points differ by shape and symbol as
 * well as colour. No animation.
 */

import { TvPair } from './TvPair';
import React, { useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../../education/visuals';
import { clipLineToBounds } from '../../../../engine/mathematics/twoVariables/graphMath';
import { add, neg } from '../../../../engine/mathematics/twoVariables/rational';
import {
  checkPair, chosenVariable, fmt, inWindow, lineFacts, makeEq, meaningful, num, parseNum as parseRational, pointOnLine, rat, reversedCheck, riseRun, tableRows, toNumber,
  type LinearEq, type Rational,
} from '../../../../engine/mathematics/twoVariables/learn/model';
import type { TvVisualProps } from '../../../../engine/mathematics/twoVariables/learn/questions';

const SIZE = 400;
const C = { grid: '#1e293b', axis: '#94a3b8', line: '#a78bfa', ok: '#34d399', bad: '#fb7185', amber: '#fbbf24', text: '#e2e8f0' };
const sym = (r: Rational) => fmt(r);

/** A number control: minus button, text box that accepts 2, -1.5 or 3/4, plus button. */
const Field: React.FC<{ label: string; value: string; onChange: (v: string) => void; step: number; testId: string }> = ({ label, value, onChange, step, testId }) => {
  const parsed = parseRational(value);
  const bump = (d: number) => {
    const base = parsed ?? rat(0);
    const next = add(base, num(d * step));
    onChange(fmt(next));
  };
  return (
    <div className="flex items-center gap-1" data-field={testId}>
      <span className="text-xs font-mono text-slate-300 w-8 shrink-0">{label}</span>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => bump(-1)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">−</button>
      <input
        type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label}, a number such as 2, -1.5 or 3/4`} aria-invalid={parsed === null}
        className={`w-16 min-h-[44px] rounded-lg border px-2 text-center font-mono text-sm bg-surface-lowest text-white ${parsed === null ? 'border-rose-500' : 'border-surface-border'}`}
      />
      <button type="button" aria-label={`Increase ${label}`} onClick={() => bump(1)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">+</button>
    </div>
  );
};

const TvFig: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as TvVisualProps;
  const extent = p.extent ?? 10;
  const step = p.step ?? 1;
  const hl = new Set((props.highlight as string[] | undefined) ?? []);
  const U = SIZE / (2 * extent);
  const X = (x: number) => SIZE / 2 + x * U;
  const Y = (y: number) => SIZE / 2 - y * U;

  const init = useMemo(() => ({
    a: fmt(num(p.eq?.[0] ?? 0)), b: fmt(num(p.eq?.[1] ?? 0)), c: fmt(num(p.eq?.[2] ?? 0)),
    m: fmt(num(p.eq ? -p.eq[0] / (p.eq[1] || 1) : 0)), d: fmt(num(p.eq ? -p.eq[2] / (p.eq[1] || 1) : 0)),
    px: p.point ? fmt(num(p.point[0])) : '0', py: p.point ? fmt(num(p.point[1])) : '0',
    table: (p.table ?? []).map((v) => fmt(num(v))),
    sx1: fmt(num(p.slopeX?.[0] ?? 0)), sx2: fmt(num(p.slopeX?.[1] ?? 1)),
  }), [p.eq, p.point, p.table, p.slopeX]);
  const [t, setT] = useState(init);
  const [prevInit, setPrevInit] = useState(init);
  if (prevInit !== init) { setPrevInit(init); setT(init); }
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const edit = p.edit ?? 'none';
  const eq: LinearEq = useMemo(() => {
    if (edit === 'md') {
      const m = parseRational(t.m) ?? rat(0), d = parseRational(t.d) ?? rat(0);
      return makeEq(neg(m), rat(1), neg(d));
    }
    const src = edit === 'abc' ? t : init;
    return makeEq(parseRational(src.a) ?? rat(0), parseRational(src.b) ?? rat(0), parseRational(src.c) ?? rat(0));
  }, [edit, t, init]);
  const facts = lineFacts(eq);
  const hasEq = Boolean(p.eq);
  const bounds = { xMin: -extent, xMax: extent, yMin: -extent, yMax: extent };
  const seg = hasEq && facts.valid ? clipLineToBounds(eq, bounds) : null;

  // test point
  const hasPoint = Boolean(p.point) && p.movePoint !== false;
  const pxr = parseRational(t.px) ?? rat(0), pyr = parseRational(t.py) ?? rat(0);
  const clampR = (r: Rational) => num(Math.max(-extent, Math.min(extent, toNumber(r))));
  const setPoint = (x: Rational, y: Rational) => setT((s) => ({ ...s, px: fmt(clampR(x)), py: fmt(clampR(y)) }));
  const nudge = (dx: number, dy: number) => setPoint(add(pxr, num(dx * step)), add(pyr, num(dy * step)));
  const check = hasEq && facts.valid && p.point ? checkPair(eq, pxr, pyr) : null;
  const reversed = check && p.swap ? reversedCheck(eq, pxr, pyr) : null;

  const fromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: (((e.clientX - r.left) / r.width) * SIZE - SIZE / 2) / U, y: -(((e.clientY - r.top) / r.height) * SIZE - SIZE / 2) / U };
  };
  const snapStep = Math.min(step, 0.5);
  const snapR = (v: number) => num(Math.round(v / snapStep) * snapStep);

  // table
  const chosen = chosenVariable(eq);
  const rows = hasEq && facts.valid ? t.table.map((s) => ({ text: s, parsed: parseRational(s) })).map((r) => ({ ...r, row: r.parsed ? tableRows(eq, [r.parsed])[0] : null })) : [];

  // slope mode
  const sx1 = parseRational(t.sx1), sx2 = parseRational(t.sx2);
  const sp1 = hasEq && facts.valid && sx1 ? pointOnLine(eq, sx1) : null;
  const sp2 = hasEq && facts.valid && sx2 ? pointOnLine(eq, sx2) : null;
  const rr = sp1 && sp2 ? riseRun(sp1, sp2) : null;

  const ticks = extent <= 6 ? 1 : extent <= 12 ? 2 : 5;
  const tickVals: number[] = [];
  for (let v = -Math.floor(extent / ticks) * ticks; v <= extent; v += ticks) if (v !== 0) tickVals.push(v);

  const sensible: { x: number; y: number }[] = [];
  if (p.restrict && p.restrict !== 'none' && hasEq && facts.valid && !(eq.b.n === 0)) {
    for (let x = 0; x <= extent; x++) { const q = pointOnLine(eq, rat(x)); if (q && meaningful(q.x, q.y, p.restrict) && inWindow(q.x, q.y, extent)) sensible.push({ x, y: toNumber(q.y) }); }
  }

  const quadrant = (x: Rational, y: Rational) => {
    if (x.n === 0 && y.n === 0) return 'at the origin';
    if (x.n === 0) return 'on the y-axis';
    if (y.n === 0) return 'on the x-axis';
    return `in the ${x.n > 0 ? (y.n > 0 ? 'first' : 'fourth') : y.n > 0 ? 'second' : 'third'} quadrant`;
  };

  const summary = (() => {
    if (!hasEq && p.mode === 'plane') return `The point (${sym(pxr)}, ${sym(pyr)}) is ${quadrant(pxr, pyr)}.`;
    if (!facts.valid && hasEq) return facts.message;
    if (p.mode === 'slope') return rr ? (rr.slope ? `Slope = rise ÷ run = ${sym(rr.rise)} ÷ ${sym(rr.run)} = ${sym(rr.slope)}.` : 'The run is 0, so the slope is undefined.') : facts.kind === 'vertical' ? 'This line is vertical, so its slope is undefined.' : 'Choose two x-values to mark two points.';
    if (check) return check.satisfies ? `(${sym(pxr)}, ${sym(pyr)}) is a solution of ${facts.standard}.` : `(${sym(pxr)}, ${sym(pyr)}) is not a solution of ${facts.standard}: the left side is ${sym(check.lhs)}, not ${sym(check.rhs)}.`;
    return `The graph of ${facts.standard}.`;
  })();

  const testOk = check?.satisfies ?? false;
  const keys = (e: React.KeyboardEvent) => {
    const d: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] };
    if (d[e.key]) { e.preventDefault(); nudge(d[e.key][0], d[e.key][1]); }
  };

  return (
    <div className="space-y-3" data-visual="tvFig" data-mode={p.mode}>
      <svg ref={svgRef} viewBox={`0 0 ${SIZE} ${SIZE}`} role="group" aria-label={alt} className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none"
        style={{ touchAction: hasPoint ? 'none' : 'auto' }}
        onPointerMove={(e) => { if (dragging.current) { const w = fromEvent(e); setPoint(snapR(w.x), snapR(w.y)); } }}
        onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
        <title>{alt}</title>
        {p.restrict && p.restrict !== 'none' && <rect x={X(0)} y={Y(extent)} width={X(extent) - X(0)} height={Y(0) - Y(extent)} fill={C.amber} fillOpacity={0.06} pointerEvents="none" />}
        {Array.from({ length: 2 * extent + 1 }, (_, i) => i - extent).map((v) => <g key={v} stroke={C.grid} strokeWidth={1} pointerEvents="none"><line x1={X(v)} y1={0} x2={X(v)} y2={SIZE} /><line x1={0} y1={Y(v)} x2={SIZE} y2={Y(v)} /></g>)}
        <g stroke={C.axis} strokeWidth={2} pointerEvents="none"><line x1={0} y1={Y(0)} x2={SIZE} y2={Y(0)} /><line x1={X(0)} y1={0} x2={X(0)} y2={SIZE} /></g>
        <g fill={C.axis} fontSize={11} pointerEvents="none">
          {tickVals.filter((v) => Math.abs(v) < extent).map((v) => <g key={v}><text x={X(v)} y={Y(0) + 14} textAnchor="middle">{v}</text><text x={X(0) - 6} y={Y(v) + 4} textAnchor="end">{v}</text></g>)}
          <text x={X(0) - 6} y={Y(0) + 14} textAnchor="end">0</text>
        </g>
        <text x={SIZE - 10} y={Y(0) - 8} fill={C.text} fontSize={15} fontWeight={800} textAnchor="end" pointerEvents="none">x</text>
        <text x={X(0) + 8} y={14} fill={C.text} fontSize={15} fontWeight={800} pointerEvents="none">y</text>

        {seg && <line x1={X(seg.x1)} y1={Y(seg.y1)} x2={X(seg.x2)} y2={Y(seg.y2)} stroke={C.line} strokeWidth={3.5} strokeLinecap="round" pointerEvents="none" />}
        {sensible.map((s) => <rect key={`s${s.x}`} x={X(s.x) - 6} y={Y(s.y) - 6} width={12} height={12} fill="none" stroke={C.amber} strokeWidth={2.5} transform={`rotate(45 ${X(s.x)} ${Y(s.y)})`} pointerEvents="none" />)}
        {rows.map((r, i) => r.row?.pair && inWindow(r.row.pair.x, r.row.pair.y, extent) ? <circle key={`t${i}`} cx={X(toNumber(r.row.pair.x))} cy={Y(toNumber(r.row.pair.y))} r={5} fill={C.ok} stroke="#0f172a" strokeWidth={1.5} pointerEvents="none" /> : null)}

        {p.mode === 'plane' && (p.points ?? []).map((q) => (
          <g key={q.id} pointerEvents="none"><circle cx={X(q.x)} cy={Y(q.y)} r={6} fill={C.line} stroke="#0f172a" strokeWidth={1.5} /><text x={X(q.x) + 9} y={Y(q.y) - 8} fill={C.text} fontSize={13} fontWeight={700}>{q.id}</text></g>
        ))}

        {p.mode === 'slope' && sp1 && sp2 && (
          <g pointerEvents="none">
            <line x1={X(toNumber(sp1.x))} y1={Y(toNumber(sp1.y))} x2={X(toNumber(sp2.x))} y2={Y(toNumber(sp1.y))} stroke={hl.has('run') ? C.amber : C.ok} strokeWidth={hl.has('run') ? 5 : 3} strokeDasharray="6 4" />
            <line x1={X(toNumber(sp2.x))} y1={Y(toNumber(sp1.y))} x2={X(toNumber(sp2.x))} y2={Y(toNumber(sp2.y))} stroke={hl.has('rise') ? C.amber : C.bad} strokeWidth={hl.has('rise') ? 5 : 3} strokeDasharray="6 4" />
            {[[sp1, 'P1'], [sp2, 'P2']].map(([q, k]) => <g key={k as string}><circle cx={X(toNumber((q as typeof sp1).x))} cy={Y(toNumber((q as typeof sp1).y))} r={hl.has(k as string) ? 8 : 6} fill={hl.has(k as string) ? C.amber : C.line} stroke="#0f172a" strokeWidth={1.5} /><text x={X(toNumber((q as typeof sp1).x)) + 9} y={Y(toNumber((q as typeof sp1).y)) - 8} fill={C.text} fontSize={13} fontWeight={700}>{k as string}</text></g>)}
          </g>
        )}

        {p.point && (
          <g className="group outline-none" {...(hasPoint ? { role: 'button', tabIndex: 0, 'aria-label': `Test point (${sym(pxr)}, ${sym(pyr)}). Arrow keys move it by ${step}.`, style: { cursor: 'grab' }, onKeyDown: keys,
            onPointerDown: (e: React.PointerEvent) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); } } : {})}>
            {hasPoint && <circle cx={X(toNumber(pxr))} cy={Y(toNumber(pyr))} r={30} fill="transparent" />}
            {hasPoint && <circle cx={X(toNumber(pxr))} cy={Y(toNumber(pyr))} r={16} fill="none" strokeWidth={3} className="stroke-transparent group-focus:stroke-white" pointerEvents="none" />}
            {hasEq && facts.valid ? (
              testOk
                ? <g pointerEvents="none"><circle cx={X(toNumber(pxr))} cy={Y(toNumber(pyr))} r={9} fill={C.ok} stroke="#0f172a" strokeWidth={2} /><path d={`M ${X(toNumber(pxr)) - 4} ${Y(toNumber(pyr))} l 3 3 l 5 -6`} stroke="#0f172a" strokeWidth={2.5} fill="none" /></g>
                : <g pointerEvents="none"><circle cx={X(toNumber(pxr))} cy={Y(toNumber(pyr))} r={9} fill="#0f172a" stroke={C.bad} strokeWidth={3} /><path d={`M ${X(toNumber(pxr)) - 4} ${Y(toNumber(pyr)) - 4} l 8 8 M ${X(toNumber(pxr)) + 4} ${Y(toNumber(pyr)) - 4} l -8 8`} stroke={C.bad} strokeWidth={2.5} /></g>
            ) : <circle cx={X(toNumber(pxr))} cy={Y(toNumber(pyr))} r={8} fill={C.line} stroke="#0f172a" strokeWidth={2} pointerEvents="none" />}
            <text x={X(toNumber(pxr)) + 12} y={Y(toNumber(pyr)) - 12} fill={C.text} fontSize={13} fontWeight={800} pointerEvents="none">({sym(pxr)}, {sym(pyr)})</text>
            {p.swap && !hasEq && (
              <g pointerEvents="none"><circle cx={X(toNumber(pyr))} cy={Y(toNumber(pxr))} r={8} fill="none" stroke={C.amber} strokeWidth={2.5} strokeDasharray="4 3" /><text x={X(toNumber(pyr)) + 12} y={Y(toNumber(pxr)) - 12} fill={C.amber} fontSize={13} fontWeight={800}>({sym(pyr)}, {sym(pxr)})</text></g>
            )}
          </g>
        )}
        {hasEq && facts.valid && !seg && <text x={SIZE / 2} y={SIZE - 12} textAnchor="middle" fill={C.amber} fontSize={13}>The line does not pass through this window.</text>}
      </svg>

      <div role="status" aria-live="polite" className="text-sm font-medium text-slate-100 text-center" data-testid="tv-summary">{summary}</div>

      {hasEq && edit === 'abc' && (
        <div className="flex flex-wrap gap-2" data-testid="tv-params" role="group" aria-label="Coefficients of ax + by + c = 0">
          <Field label="a" value={t.a} onChange={(v) => setT((s) => ({ ...s, a: v }))} step={1} testId="a" />
          <Field label="b" value={t.b} onChange={(v) => setT((s) => ({ ...s, b: v }))} step={1} testId="b" />
          <Field label="c" value={t.c} onChange={(v) => setT((s) => ({ ...s, c: v }))} step={1} testId="c" />
        </div>
      )}
      {hasEq && edit === 'md' && (
        <div className="flex flex-wrap gap-2" data-testid="tv-params" role="group" aria-label="Slope m and y-intercept d of y = mx + d">
          <Field label="m" value={t.m} onChange={(v) => setT((s) => ({ ...s, m: v }))} step={1} testId="m" />
          <Field label="d" value={t.d} onChange={(v) => setT((s) => ({ ...s, d: v }))} step={1} testId="d" />
        </div>
      )}
      {p.mode === 'slope' && (
        <div className="flex flex-wrap gap-2" data-testid="tv-slope-params" role="group" aria-label="x-values of the two marked points">
          <Field label="x₁" value={t.sx1} onChange={(v) => setT((s) => ({ ...s, sx1: v }))} step={1} testId="sx1" />
          <Field label="x₂" value={t.sx2} onChange={(v) => setT((s) => ({ ...s, sx2: v }))} step={1} testId="sx2" />
        </div>
      )}

      <ul data-testid="tv-readout" className="space-y-1 text-xs font-mono text-slate-300 rounded-xl border border-surface-border bg-surface-card p-3">
        {hasEq && facts.valid && <li data-line="equation">Equation: {facts.standard} (that is {facts.general}); a = {sym(eq.a)}, b = {sym(eq.b)}, c = {sym(eq.c)}</li>}
        {hasEq && edit === 'md' && facts.valid && <li data-line="mdform">Slope-intercept form: {facts.slopeIntercept}</li>}
        {hasEq && edit === 'abc' && facts.valid && facts.kind === 'oblique' && <li data-line="mdform">Solved for y: {facts.slopeIntercept}</li>}
        {hasEq && !facts.valid && <li data-line="invalid" className="text-amber-300">{facts.message}</li>}
        {p.showIntercepts && facts.valid && <li data-line="intercepts">{facts.xInt ? `x-intercept (${sym(facts.xInt)}, 0)` : 'no x-intercept'}; {facts.yInt ? `y-intercept (0, ${sym(facts.yInt)})` : 'no y-intercept'}{facts.slope ? `; slope ${sym(facts.slope)}` : facts.kind === 'vertical' ? '; slope undefined' : ''}</li>}
        {!hasEq && p.mode === 'plane' && <li data-line="point">Point: ({sym(pxr)}, {sym(pyr)}), {quadrant(pxr, pyr)}.{p.swap ? ` Reversed pair (y, x): (${sym(pyr)}, ${sym(pxr)}).` : ''}</li>}
        {p.mode === 'slope' && sp1 && sp2 && rr && <li data-line="slope">P1 = ({sym(sp1.x)}, {sym(sp1.y)}), P2 = ({sym(sp2.x)}, {sym(sp2.y)}): rise = {sym(rr.rise)}, run = {sym(rr.run)}{rr.slope ? `, slope = ${sym(rr.slope)}` : ', slope undefined (run is 0)'}</li>}
        {check && (
          <li data-line="substitution">
            <span className="font-bold text-slate-100">Substitution check</span>
            <ol className="list-decimal pl-5 space-y-0.5">{check.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            <span data-testid="tv-verdict" data-satisfies={String(check.satisfies)} className={check.satisfies ? 'text-emerald-300' : 'text-rose-300'}>{check.satisfies ? '✓ Solution: the pair satisfies the equation.' : '✗ Not a solution: the pair does not satisfy the equation.'}</span>
          </li>
        )}
        {reversed && <li data-line="reversed">Reversed pair ({sym(reversed.x)}, {sym(reversed.y)}): left side {sym(reversed.lhs)}, right side {sym(reversed.rhs)}, so it {reversed.satisfies ? 'is' : 'is not'} a solution.</li>}
        {check && p.restrict && p.restrict !== 'none' && <li data-line="meaning">As a real answer: {meaningful(pxr, pyr, p.restrict) ? 'possible' : 'not possible'} ({p.restrict === 'whole' ? 'counts must be whole numbers, not negative' : 'amounts cannot be negative'}).</li>}
      </ul>

      {rows.length > 0 && (
        <table data-testid="tv-table" className="w-full text-xs font-mono border border-surface-border rounded-xl overflow-hidden">
          <caption className="sr-only">Table of solutions. Choose a value of {chosen}; the other value is worked out from the equation.</caption>
          <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">{chosen} (you choose)</th><th scope="col" className="p-2 text-left">{chosen === 'x' ? 'y' : 'x'}</th><th scope="col" className="p-2 text-left">solution</th></tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-surface-border">
                <td className="p-1">
                  <input type="text" inputMode="decimal" value={r.text} aria-label={`${chosen} value for row ${i + 1}`} aria-invalid={r.parsed === null}
                    onChange={(e) => setT((s) => ({ ...s, table: s.table.map((v, j) => (j === i ? e.target.value : v)) }))}
                    className={`w-20 min-h-[44px] rounded-lg border px-2 bg-surface-lowest text-white ${r.parsed === null ? 'border-rose-500' : 'border-surface-border'}`} />
                </td>
                <td className="p-2" data-cell="other">{r.row ? (r.row.other ? sym(r.row.other) : r.row.kind === 'any' ? 'any value' : 'none') : 'enter a number'}</td>
                <td className="p-2" data-cell="pair">{r.row?.pair ? `(${sym(r.row.pair.x)}, ${sym(r.row.pair.y)})${inWindow(r.row.pair.x, r.row.pair.y, extent) ? '' : ' (off the graph)'}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {hasPoint && (
        <div role="group" aria-label="Move the test point with buttons" className="flex flex-wrap items-center gap-2" data-testid="tv-nudge">
          <span className="text-xs text-slate-400">Move the point</span>
          {([['←', 'left', -1, 0], ['↑', 'up', 0, 1], ['↓', 'down', 0, -1], ['→', 'right', 1, 0]] as const).map(([s, name, dx, dy]) => (
            <button key={name} type="button" aria-label={`Move test point ${name}`} onClick={() => nudge(dx, dy)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">{s}</button>
          ))}
          <Field label="x" value={t.px} onChange={(v) => setT((s) => ({ ...s, px: v }))} step={step} testId="px" />
          <Field label="y" value={t.py} onChange={(v) => setT((s) => ({ ...s, py: v }))} step={step} testId="py" />
          <button type="button" onClick={() => setT(init)} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-xs text-slate-200">Reset</button>
        </div>
      )}
    </div>
  );
};

export const TV_VISUALS: VisualRegistry = { tvFig: TvFig, tvPair: TvPair };
