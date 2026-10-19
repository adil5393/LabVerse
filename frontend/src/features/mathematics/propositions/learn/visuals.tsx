/**
 * Propositions visuals for the shared Learn framework (EDU-1P).
 *
 * Each visual is driven by the pure engine in engine/mathematics/propositions/learn
 * (the same Pred, geometry and factor functions the questions use), has a text
 * equivalent (a caption and a live readout), keyboard-operable controls with
 * 48 px targets, and a non-drag way to do everything. Meaning is carried by
 * outlines, symbols and words as well as colour. Nothing animates.
 */

import React, { useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../../education/visuals';
import { claimSentence, evalPred, predPhrase, standing, type Pred } from '../../../../engine/mathematics/propositions/learn/logic';
import {
  AREA_PAIRS, withArticle, congruentBySSS, dist, factorPairs, factsFromSticks, quadFromSticks, thirdSide, triangleArea, triangleFacts, triangleFromAngle, classifyBySides,
  type Pt, type SticksSpec,
} from '../../../../engine/mathematics/propositions/learn/geometry';
import { getFactors, isPrime } from '../../../../engine/mathematics/propositions/numberPredicates';

const C = { cyan: '#22d3ee', rose: '#fb7185', amber: '#fbbf24', green: '#34d399', violet: '#a78bfa', text: '#e2e8f0', grid: '#1e293b', axis: '#64748b' };
const f2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);
const f1 = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const stepBtn = 'min-w-[48px] min-h-[48px] rounded-xl border border-surface-border bg-surface-card text-white text-lg hover:border-cyan-400 disabled:opacity-40';

const Stepper: React.FC<{ label: string; value: string; onDec: () => void; onInc: () => void; decDisabled?: boolean; incDisabled?: boolean }> = ({ label, value, onDec, onInc, decDisabled, incDisabled }) => (
  <div className="flex items-center gap-2" role="group" aria-label={label}>
    <button type="button" className={stepBtn} aria-label={`Decrease ${label}`} disabled={decDisabled} onClick={onDec}>{'−'}</button>
    <div className="min-w-[8.5rem] text-center"><div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">{label}</div><div className="text-sm text-white font-bold" aria-live="polite">{value}</div></div>
    <button type="button" className={stepBtn} aria-label={`Increase ${label}`} disabled={incDisabled} onClick={onInc}>+</button>
  </div>
);

// ---------------------------------------------------------------------------
// Number grid: "if P then Q" as a claim about every number
// ---------------------------------------------------------------------------

interface GridProps { P: Pred; Q: Pred; max?: number; converse?: boolean; toggle?: boolean; start?: number; /** Show only the first condition (no claim). */ single?: boolean }

const NumberGridVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const g = props as unknown as GridProps;
  const max = g.max ?? 60;
  const [converse, setConverse] = useState(Boolean(g.converse));
  const [sel, setSel] = useState<number | null>(g.start ?? null);
  const claim = converse ? { P: g.Q, Q: g.P } : { P: g.P, Q: g.Q };
  const nums = useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max]);
  const counter = nums.filter((n) => standing(claim, n) === 'disproves');
  const selStanding = sel === null ? null : standing(claim, sel);
  if (g.single) {
    const inP = (n: number) => evalPred(g.P, n);
    return (
      <div className="space-y-3" data-visual="numberGrid" data-single="true">
        <p className="text-sm md:text-base text-white font-medium">Numbers n for which "n {predPhrase(g.P)}" is true are outlined.</p>
        <div role="group" aria-label={alt} className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
          {nums.map((n) => (
            <button key={n} type="button" data-n={n} aria-pressed={sel === n} aria-label={`${n}. ${inP(n) ? 'Satisfies' : 'Does not satisfy'} the condition.`} onClick={() => setSel(n)}
              className={`min-h-[44px] min-w-[44px] rounded-lg text-sm font-bold ${inP(n) ? 'border-2 border-cyan-400 bg-cyan-950/40 text-cyan-100' : 'border border-surface-border bg-surface-lowest text-slate-300'} ${sel === n ? 'outline outline-2 outline-white' : ''}`}>{n}{inP(n) ? ' ✓' : ''}</button>
          ))}
        </div>
        <p className="text-sm text-slate-200" aria-live="polite" data-testid="grid-readout">{sel === null ? 'Tap a number to test the condition on it.' : `${sel} ${inP(sel) ? 'satisfies' : 'does not satisfy'} the condition (n ${predPhrase(g.P)}).`}</p>
      </div>
    );
  }
  const readout = sel === null
    ? 'Tap a number to test the claim on it.'
    : selStanding === 'disproves'
      ? `${sel}: the first part is true and the second part is false. ${sel} is a counterexample, so the claim is false.`
      : selStanding === 'supports'
        ? `${sel}: the first part is true and so is the second part. ${sel} fits the claim. One fitting example does not prove it for every number.`
        : `${sel}: the first part is false, so the claim says nothing about ${sel}. It is neither a fit nor a counterexample.`;
  return (
    <div className="space-y-3" data-visual="numberGrid" data-converse={converse}>
      <p className="text-sm md:text-base text-white font-medium" data-testid="grid-claim">{claimSentence(claim)}</p>
      <div role="group" aria-label={alt} className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {nums.map((n) => {
          const inP = evalPred(claim.P, n), inQ = evalPred(claim.Q, n), bad = inP && !inQ;
          return (
            <button
              key={n}
              type="button"
              data-n={n}
              aria-pressed={sel === n}
              aria-label={`${n}. First part ${inP ? 'true' : 'false'}. Second part ${inQ ? 'true' : 'false'}.${bad ? ' Counterexample.' : ''}`}
              onClick={() => setSel(n)}
              className={`min-h-[44px] min-w-[44px] rounded-lg text-sm font-bold flex flex-col items-center justify-center leading-tight ${inP ? 'border-2 border-cyan-400' : 'border border-surface-border'} ${inQ ? 'bg-emerald-900/50 text-emerald-100' : 'bg-surface-lowest text-slate-300'} ${bad ? 'ring-2 ring-rose-400' : ''} ${sel === n ? 'outline outline-2 outline-white' : ''}`}
            >
              <span>{n}</span>
              <span className="text-[10px] font-normal" aria-hidden>{bad ? '✗' : inP && inQ ? '✓' : inQ ? '·' : ' '}</span>
            </button>
          );
        })}
      </div>
      <ul className="text-xs text-slate-300 grid gap-1 sm:grid-cols-3" aria-label="Key">
        <li><span className="inline-block w-4 h-4 align-middle mr-1.5 border-2 border-cyan-400 rounded" aria-hidden />Blue outline: first part is true (n {predPhrase(claim.P)})</li>
        <li><span className="inline-block w-4 h-4 align-middle mr-1.5 bg-emerald-900/70 border border-surface-border rounded" aria-hidden />Green fill: second part is true (n {predPhrase(claim.Q)})</li>
        <li><span className="inline-block w-4 h-4 align-middle mr-1.5 ring-2 ring-rose-400 rounded" aria-hidden />{'✗'} Red ring: first true, second false (counterexample)</li>
      </ul>
      <p className="text-sm text-slate-200" aria-live="polite" data-testid="grid-readout">{readout}</p>
      <p className="text-sm text-slate-200" data-testid="grid-summary">
        {counter.length === 0 ? `Among 1 to ${max}, no number makes the first part true and the second false. That is evidence, not a proof.` : `Among 1 to ${max}, counterexamples: ${counter.slice(0, 8).join(', ')}${counter.length > 8 ? ', ...' : ''}.`}
      </p>
      {g.toggle && (
        <button type="button" aria-pressed={converse} onClick={() => { setConverse((c) => !c); }} className="min-h-[48px] px-5 rounded-xl border border-violet-400 text-violet-200 font-bold text-sm hover:bg-violet-500/10" data-testid="grid-toggle">
          {converse ? 'Show the original statement' : 'Show the converse (swap the two parts)'}
        </button>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Factor-partner pairs (textbook Example 3)
// ---------------------------------------------------------------------------

const FactorPairsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const [n, setN] = useState<number>(Number((props as { n?: number }).n ?? 36));
  const fp = factorPairs(n);
  return (
    <div className="space-y-3" data-visual="factorPairs">
      <div className="flex flex-wrap items-center gap-3">
        <Stepper label="number n" value={String(n)} onDec={() => setN((v) => Math.max(1, v - 1))} onInc={() => setN((v) => Math.min(144, v + 1))} decDisabled={n <= 1} incDisabled={n >= 144} />
      </div>
      <ul role="group" aria-label={alt} className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {fp.pairs.map(([a, b]) => (
          <li key={a} data-pair={`${a},${b}`} className={`rounded-xl px-3 py-2 text-sm font-bold text-center ${a === b ? 'border-2 border-amber-400 bg-amber-900/30 text-amber-100' : 'border border-surface-border bg-surface-card text-slate-100'}`}>
            ({a}, {b}){a === b ? ' ← repeats' : ''}
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-200" aria-live="polite" data-testid="factor-readout">
        {n} has {fp.factorCount} factor{fp.factorCount === 1 ? '' : 's'} in {fp.pairs.length} pair{fp.pairs.length === 1 ? '' : 's'}.{' '}
        {fp.selfPaired !== null ? `One pair repeats (${fp.selfPaired}, ${fp.selfPaired}) because ${n} = ${fp.selfPaired} × ${fp.selfPaired}, so the count is odd.` : 'No pair repeats, so every factor has a different partner and the count is even.'}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Evidence strip (n^2 + n + c)
// ---------------------------------------------------------------------------

interface StripProps { c: number; to?: number }

const EulerStripVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const { c, to = 9 } = props as unknown as StripProps;
  const [end, setEnd] = useState(to);
  const rows = useMemo(() => Array.from({ length: end + 1 }, (_, n) => { const v = n * n + n + c; return { n, v, prime: isPrime(v) }; }), [end, c]);
  const firstBad = rows.find((r) => !r.prime);
  const lastGood = rows.filter((r) => r.prime).length;
  const fail = firstBad ? getFactors(firstBad.v).filter((f) => f > 1 && f < firstBad.v)[0] : null;
  return (
    <div className="space-y-3" data-visual="eulerStrip" data-end={end}>
      <div role="group" aria-label={alt} className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 max-h-72 overflow-y-auto" tabIndex={0}>
        {rows.map((r) => (
          <div key={r.n} data-row={r.n} className={`rounded-lg px-2 py-1.5 text-xs text-center ${r.prime ? 'border border-surface-border bg-surface-card text-slate-200' : 'border-2 border-rose-400 bg-rose-950/40 text-rose-100 font-bold'}`}>
            n = {r.n}: {r.v} {r.prime ? '✓ prime' : `✗ ${(() => { const f = getFactors(r.v).filter((x) => x > 1 && x < r.v)[0]; return `${f} × ${r.v / f}`; })()}`}
          </div>
        ))}
      </div>
      <p className="text-sm text-slate-200" aria-live="polite" data-testid="strip-readout">
        {firstBad ? `Checked n = 0 to ${end}. The formula first fails at n = ${firstBad.n}: ${firstBad.v} = ${fail} × ${firstBad.v / (fail ?? 1)}. A pattern that held ${lastGood} times in a row broke.` : `Checked n = 0 to ${end}. Every value so far is prime (${lastGood} in a row). Does that prove it for all n? Test more and see.`}
      </p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-[48px] px-5 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm disabled:opacity-40" disabled={end >= 60} onClick={() => setEnd((e) => Math.min(60, e + 5))}>Test 5 more numbers</button>
        <button type="button" className="min-h-[48px] px-4 rounded-xl border border-surface-border text-slate-200 text-sm" onClick={() => setEnd(to)}>Start again</button>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Triangles
// ---------------------------------------------------------------------------

const S = 34;
const VBW = 440, VBH = 300;
const sx = (x: number) => VBW / 2 + x * S;
const sy = (y: number) => VBH - 40 - y * S;

interface TriProps { mode: 'isosceles' | 'altitude' | 'pythagoras'; highlight?: string[]; a?: number; b?: number; angle?: number; start?: Pt }

const TriangleVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as TriProps;
  const hl = new Set(p.highlight ?? []);
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [apex, setApex] = useState<Pt>(p.start ?? { x: 0, y: 4 });
  const [ang, setAng] = useState<number>(p.angle ?? 60);
  const legA = p.a ?? 3, legB = p.b ?? 4;

  if (p.mode === 'pythagoras') {
    const T = triangleFromAngle(legA, legB, ang);
    const c = dist(T.A, T.B);
    const c2 = thirdSide(legA, legB, ang) ** 2;
    const sumSq = legA * legA + legB * legB;
    const verdict = classifyBySides(legA, legB, c);
    const text = verdict === 'right'
      ? `a² + b² = ${f2(sumSq)} and c² = ${f2(c2)}: equal, and the angle at C is 90°.`
      : verdict === 'acute' ? `a² + b² = ${f2(sumSq)} is bigger than c² = ${f2(c2)}, and the angle at C is less than 90°.`
        : `a² + b² = ${f2(sumSq)} is smaller than c² = ${f2(c2)}, and the angle at C is more than 90°.`;
    const px = (q: Pt) => ({ x: sx(q.x - 1.2), y: sy(q.y + 0.2) });
    const A = px(T.A), B = px(T.B), Cc = px(T.C);
    return (
      <div className="space-y-3" data-visual="triangle" data-mode="pythagoras">
        <svg viewBox={`0 0 ${VBW} ${VBH}`} className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border" role="group" aria-label={alt}>
          <title>{alt}</title>
          <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${Cc.x},${Cc.y}`} fill="#22d3ee" fillOpacity={0.08} stroke={C.cyan} strokeWidth={3} pointerEvents="none" />
          <text x={(B.x + Cc.x) / 2} y={Cc.y + 22} fill={C.text} fontSize={16} textAnchor="middle" pointerEvents="none">a = {legA}</text>
          <text x={(A.x + Cc.x) / 2 - 22} y={(A.y + Cc.y) / 2} fill={C.text} fontSize={16} textAnchor="middle" pointerEvents="none">b = {legB}</text>
          <text x={(A.x + B.x) / 2 + 14} y={(A.y + B.y) / 2 - 6} fill={C.amber} fontSize={16} fontWeight={700} pointerEvents="none">c = {f2(c)}</text>
          {[['A', A], ['B', B], ['C', Cc]].map(([l, q]) => <g key={l as string} pointerEvents="none"><circle cx={(q as Pt).x} cy={(q as Pt).y} r={6} fill={C.text} /><text x={(q as Pt).x + (l === 'B' ? 10 : -16)} y={(q as Pt).y + (l === 'A' ? -8 : 16)} fill={C.text} fontSize={17} fontWeight={700}>{l as string}</text></g>)}
        </svg>
        <p className="text-sm text-slate-200 text-center" aria-live="polite" data-testid="tri-readout">Angle C = {f1(ang)}°. c = {f2(c)}. {text}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Stepper label="angle C" value={`${ang}°`} onDec={() => setAng((v) => Math.max(20, v - 5))} onInc={() => setAng((v) => Math.min(160, v + 5))} decDisabled={ang <= 20} incDisabled={ang >= 160} />
          <Stepper label="fine adjust" value={`±1°`} onDec={() => setAng((v) => Math.max(20, v - 1))} onInc={() => setAng((v) => Math.min(160, v + 1))} />
        </div>
      </div>
    );
  }

  const fixed = p.mode === 'altitude';
  const Bp = { x: -3, y: 0 }, Cp = { x: 3, y: 0 };
  const A = fixed ? { x: 0, y: 4 } : apex;
  const facts = triangleFacts(A, Bp, Cp);
  const canDrag = !fixed;
  const move = (dx: number, dy: number) => setApex((q) => ({ x: Math.max(-5, Math.min(5, q.x + dx)), y: Math.max(1, Math.min(6, q.y + dy)) }));
  const fromEvent = (e: React.PointerEvent): Pt => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * VBW, y = ((e.clientY - r.top) / r.height) * VBH;
    return { x: Math.max(-5, Math.min(5, Math.round((x - VBW / 2) / S))), y: Math.max(1, Math.min(6, Math.round((VBH - 40 - y) / S))) };
  };
  const P2 = (q: Pt) => ({ x: sx(q.x), y: sy(q.y) });
  const a2 = P2(A), b2 = P2(Bp), c2 = P2(Cp), d2 = P2({ x: A.x, y: 0 });
  const equalSides = facts.equalSides, equalAngles = facts.equalBaseAngles;
  const readout = fixed
    ? `The altitude AD meets BC at D at a right angle (${f1(triangleFacts(A, Bp, { x: 0, y: 0 }).angles.C)}° at D in each half). AB = ${f2(facts.sides.c)}, AC = ${f2(facts.sides.b)}.`
    : `AB = ${f2(facts.sides.c)}, AC = ${f2(facts.sides.b)}; angle B = ${f1(facts.angles.B)}°, angle C = ${f1(facts.angles.C)}°. Equal sides: ${equalSides ? 'yes' : 'no'}. Equal angles at B and C: ${equalAngles ? 'yes' : 'no'}.${equalSides === equalAngles ? ' The two always agree.' : ''}`;
  const arc = (v: Pt, to1: Pt, to2: Pt, r = 24) => {
    const a1 = Math.atan2(to1.y - v.y, to1.x - v.x), a3 = Math.atan2(to2.y - v.y, to2.x - v.x);
    let d = a3 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    return `M ${v.x + r * Math.cos(a1)} ${v.y + r * Math.sin(a1)} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${v.x + r * Math.cos(a1 + d)} ${v.y + r * Math.sin(a1 + d)}`;
  };
  return (
    <div className="space-y-3" data-visual="triangle" data-mode={p.mode}>
      <svg ref={svgRef} viewBox={`0 0 ${VBW} ${VBH}`} className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border select-none" role="group" aria-label={alt} style={{ touchAction: canDrag ? 'none' : 'auto' }}
        onPointerMove={(e) => { if (dragging.current) setApex(fromEvent(e)); }} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
        <title>{alt}</title>
        {Array.from({ length: 11 }, (_, i) => i - 5).map((x) => <line key={x} x1={sx(x)} y1={sy(0)} x2={sx(x)} y2={sy(6)} stroke={C.grid} pointerEvents="none" />)}
        <line x1={sx(-5)} y1={sy(0)} x2={sx(5)} y2={sy(0)} stroke={C.axis} strokeWidth={2} pointerEvents="none" />
        <polygon points={`${a2.x},${a2.y} ${b2.x},${b2.y} ${c2.x},${c2.y}`} fill="#22d3ee" fillOpacity={0.08} stroke={C.cyan} strokeWidth={3} pointerEvents="none" />
        {fixed && <line x1={a2.x} y1={a2.y} x2={d2.x} y2={d2.y} stroke={C.amber} strokeWidth={hl.has('AD') ? 6 : 3} strokeDasharray={hl.has('AD') ? undefined : '6 5'} pointerEvents="none" />}
        {fixed && <polyline points={`${d2.x - 12},${d2.y} ${d2.x - 12},${d2.y - 12} ${d2.x},${d2.y - 12}`} fill="none" stroke={C.text} strokeWidth={2} pointerEvents="none" />}
        {fixed && <polyline points={`${d2.x + 12},${d2.y} ${d2.x + 12},${d2.y - 12} ${d2.x},${d2.y - 12}`} fill="none" stroke={C.text} strokeWidth={2} pointerEvents="none" />}
        {(hl.has('B') || hl.has('C') || fixed) && <><path d={arc(b2, c2, a2)} fill="none" stroke={C.green} strokeWidth={hl.has('B') ? 5 : 3} pointerEvents="none" /><path d={arc(c2, b2, a2)} fill="none" stroke={C.green} strokeWidth={hl.has('C') ? 5 : 3} pointerEvents="none" /></>}
        {(hl.has('AB') || hl.has('AC')) && <><line x1={a2.x} y1={a2.y} x2={b2.x} y2={b2.y} stroke={C.rose} strokeWidth={5} opacity={0.8} pointerEvents="none" /><line x1={a2.x} y1={a2.y} x2={c2.x} y2={c2.y} stroke={C.rose} strokeWidth={5} opacity={0.8} pointerEvents="none" /></>}
        {([['B', b2, -16, 18], ['C', c2, 8, 18], ['D', d2, 6, 18]] as [string, Pt, number, number][]).filter(([l]) => l !== 'D' || fixed).map(([l, q, dx, dy]) => <g key={l} pointerEvents="none"><circle cx={q.x} cy={q.y} r={5} fill={C.text} /><text x={q.x + dx} y={q.y + dy} fill={C.text} fontSize={17} fontWeight={700}>{l}</text></g>)}
        <g tabIndex={canDrag ? 0 : undefined} role={canDrag ? 'slider' : undefined} aria-label={canDrag ? `Vertex A at (${A.x}, ${A.y})` : undefined} aria-valuetext={`(${A.x}, ${A.y})`}
          className="group" style={{ touchAction: 'none', outline: 'none', cursor: canDrag ? 'grab' : 'default' }}
          onKeyDown={canDrag ? (e) => { const m: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }; if (m[e.key]) { e.preventDefault(); move(...m[e.key]); } } : undefined}
          onPointerDown={canDrag ? (e) => { (e.currentTarget as Element).setPointerCapture?.(e.pointerId); dragging.current = true; } : undefined}>
          {canDrag && <circle cx={a2.x} cy={a2.y} r={38} fill="transparent" />}
          <circle cx={a2.x} cy={a2.y} r={canDrag ? 9 : 5} fill={canDrag ? C.green : C.text} stroke="#0f172a" strokeWidth={2} />
          {canDrag && <circle cx={a2.x} cy={a2.y} r={16} fill="none" strokeWidth={3} pointerEvents="none" className="stroke-transparent group-focus:stroke-white" />}
          <text x={a2.x + 12} y={a2.y - 10} fill={C.text} fontSize={17} fontWeight={700}>A</text>
        </g>
      </svg>
      <p className="text-sm text-slate-200 text-center" aria-live="polite" data-testid="tri-readout">{readout}</p>
      {canDrag && (
        <div className="flex flex-wrap justify-center gap-3" role="group" aria-label="Move vertex A">
          <button type="button" className={stepBtn} aria-label="Move A left" onClick={() => move(-1, 0)}>{'←'}</button>
          <button type="button" className={stepBtn} aria-label="Move A down" onClick={() => move(0, -1)}>{'↓'}</button>
          <button type="button" className={stepBtn} aria-label="Move A up" onClick={() => move(0, 1)}>{'↑'}</button>
          <button type="button" className={stepBtn} aria-label="Move A right" onClick={() => move(1, 0)}>{'→'}</button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Two triangles: equal area (textbook Example 4) and the Pythagoras-converse proof
// ---------------------------------------------------------------------------

interface TwoProps { kind: 'area' | 'pythProof'; highlight?: string[] }


const TwoTrianglesVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as TwoProps;
  const [pair, setPair] = useState(0);
  const hl = new Set(p.highlight ?? []);
  if (p.kind === 'pythProof') {
    const a = 5, b = 12, c = 13;
    const T1 = triangleFromAngle(a, b, (Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180) / Math.PI);
    const k = 11;
    const s1 = (q: Pt) => ({ x: 70 + q.x * k, y: 250 - q.y * k });
    const o = 270;
    const s2 = (q: Pt) => ({ x: o + q.x * k, y: 250 - q.y * k });
    const X = { x: 0, y: b }, Y = { x: a, y: 0 }, Z = { x: 0, y: 0 };
    const A1 = s1(T1.A), B1 = s1(T1.B), C1 = s1(T1.C);
    const X2 = s2(X), Y2 = s2(Y), Z2 = s2(Z);
    return (
      <div className="space-y-3" data-visual="twoTriangles" data-kind="pythProof">
        <svg viewBox="0 0 440 270" className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border" role="group" aria-label={alt}>
          <title>{alt}</title>
          <polygon points={`${A1.x},${A1.y} ${B1.x},${B1.y} ${C1.x},${C1.y}`} fill="#22d3ee" fillOpacity={hl.has('ABC') ? 0.25 : 0.06} stroke={C.cyan} strokeWidth={hl.has('ABC') ? 5 : 2.5} />
          <polygon points={`${X2.x},${X2.y} ${Y2.x},${Y2.y} ${Z2.x},${Z2.y}`} fill="#a78bfa" fillOpacity={hl.has('XYZ') ? 0.25 : 0.06} stroke={C.violet} strokeWidth={hl.has('XYZ') ? 5 : 2.5} />
          <line x1={X2.x} y1={X2.y} x2={Y2.x} y2={Y2.y} stroke={C.amber} strokeWidth={hl.has('XY') ? 7 : 3} />
          <line x1={A1.x} y1={A1.y} x2={B1.x} y2={B1.y} stroke={C.amber} strokeWidth={hl.has('AB') ? 7 : 3} />
          <polyline points={`${Z2.x},${Z2.y - 12} ${Z2.x + 12},${Z2.y - 12} ${Z2.x + 12},${Z2.y}`} fill="none" stroke={C.text} strokeWidth={2} />
          <text x={(B1.x + C1.x) / 2} y={C1.y + 18} fill={C.text} fontSize={14} textAnchor="middle">a = {a}</text>
          <text x={(A1.x + C1.x) / 2 - 16} y={(A1.y + C1.y) / 2} fill={C.text} fontSize={14} textAnchor="middle">b = {b}</text>
          <text x={(A1.x + B1.x) / 2 + 14} y={(A1.y + B1.y) / 2} fill={C.amber} fontSize={14} fontWeight={700}>c = {c}</text>
          <text x={(Y2.x + Z2.x) / 2} y={Z2.y + 18} fill={C.text} fontSize={14} textAnchor="middle">a = {a}</text>
          <text x={Z2.x - 12} y={(X2.y + Z2.y) / 2} fill={C.text} fontSize={14} textAnchor="end">b = {b}</text>
          <text x={(X2.x + Y2.x) / 2 + 12} y={(X2.y + Y2.y) / 2} fill={C.amber} fontSize={14} fontWeight={700}>XY = ?</text>
          {([['A', A1, -14, -6], ['B', B1, 8, 14], ['C', C1, -14, 16], ['X', X2, -14, -6], ['Y', Y2, 8, 14], ['Z', Z2, -14, 16]] as [string, Pt, number, number][]).map(([l, q, dx, dy]) => <g key={l}><circle cx={q.x} cy={q.y} r={4} fill={C.text} /><text x={q.x + dx} y={q.y + dy} fill={C.text} fontSize={15} fontWeight={700}>{l}</text></g>)}
        </svg>
        <p className="text-sm text-slate-200 text-center" data-testid="proof-fig-readout">
          △ABC has sides a = {a}, b = {b}, c = {c} with a² + b² = {a * a + b * b} = c² = {c * c}. △XYZ is built with a right angle at Z and legs a and b.
        </p>
      </div>
    );
  }
  const { t1, t2 } = AREA_PAIRS[pair];
  const f1x = triangleFacts(t1[0], t1[1], t1[2]), f2x = triangleFacts(t2[0], t2[1], t2[2]);
  const cong = congruentBySSS(t1, t2);
  const k = 28, ox = [30, 250];
  const draw = (t: [Pt, Pt, Pt], off: number) => t.map((q) => `${off + q.x * k},${215 - q.y * k}`).join(' ');
  return (
    <div className="space-y-3" data-visual="twoTriangles" data-kind="area" data-pair={pair}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a pair of triangles">
        {AREA_PAIRS.map((pp, i) => <button key={pp.name} type="button" aria-pressed={pair === i} onClick={() => setPair(i)} className={`min-h-[48px] px-4 rounded-xl border text-sm font-bold ${pair === i ? 'border-amber-400 bg-amber-500/15 text-white' : 'border-surface-border text-slate-300'}`}>{pp.name}</button>)}
      </div>
      <svg viewBox="0 0 440 240" className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border" role="group" aria-label={alt}>
        <title>{alt}</title>
        <polygon points={draw(t1, ox[0])} fill="#22d3ee" fillOpacity={0.1} stroke={C.cyan} strokeWidth={3} />
        <polygon points={draw(t2, ox[1])} fill="#a78bfa" fillOpacity={0.1} stroke={C.violet} strokeWidth={3} strokeDasharray={pair === 1 ? undefined : '8 5'} />
        <text x={ox[0]} y={20} fill={C.cyan} fontSize={15} fontWeight={700}>Triangle 1</text>
        <text x={ox[1]} y={20} fill={C.violet} fontSize={15} fontWeight={700}>Triangle 2</text>
      </svg>
      <ul className="text-sm text-slate-200 grid gap-1 sm:grid-cols-2" data-testid="area-readout" aria-live="polite">
        <li>Triangle 1: area {f2(f1x.area)}; sides {f2(f1x.sides.a)}, {f2(f1x.sides.b)}, {f2(f1x.sides.c)}</li>
        <li>Triangle 2: area {f2(f2x.area)}; sides {f2(f2x.sides.a)}, {f2(f2x.sides.b)}, {f2(f2x.sides.c)}</li>
        <li className="sm:col-span-2 font-bold text-white">Same area: {Math.abs(f1x.area - f2x.area) < 1e-9 ? 'yes' : 'no'}. Congruent (same three side lengths): {cong ? 'yes' : 'no'}.{triangleArea(t1[0], t1[1], t1[2]) === triangleArea(t2[0], t2[1], t2[2]) && !cong ? ' Equal area did not force congruence.' : ''}</li>
      </ul>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Two sticks as diagonals (textbook Exercise 17)
// ---------------------------------------------------------------------------

const SticksVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as Partial<SticksSpec>;
  const [s, setS] = useState<SticksSpec>({ len1: p.len1 ?? 8, len2: p.len2 ?? 8, t1: p.t1 ?? 0.5, t2: p.t2 ?? 0.5, angle: p.angle ?? 90 });
  const q = quadFromSticks(s);
  const facts = factsFromSticks(s);
  const k = 22;
  const P = (pt: Pt) => ({ x: 220 + pt.x * k, y: 130 - pt.y * k });
  const [A, B, Cc, D, O] = [P(q.A), P(q.B), P(q.C), P(q.D), P(q.O)];
  const set = (patch: Partial<SticksSpec>) => setS((v) => ({ ...v, ...patch }));
  const clampT = (v: number) => Math.round(Math.max(0.1, Math.min(0.9, v)) * 10) / 10;
  const verdict = facts.diagonalsEqual
    ? (facts.isRectangle ? 'Equal diagonals, and the figure is a rectangle.' : `Equal diagonals, but the figure is ${withArticle(facts.name)}, not a rectangle. This is a counterexample to "equal diagonals imply a rectangle".`)
    : `The diagonals are not equal (${f2(facts.diagonalAC)} and ${f2(facts.diagonalBD)}), so this figure says nothing about the claim.`;
  return (
    <div className="space-y-3" data-visual="sticks" data-name={facts.name} data-equal={facts.diagonalsEqual} data-rect={facts.isRectangle}>
      <svg viewBox="0 0 440 260" className="w-full max-w-[460px] max-h-[80vh] mx-auto rounded-xl bg-surface-lowest border border-surface-border" role="group" aria-label={alt}>
        <title>{alt}</title>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${Cc.x},${Cc.y} ${D.x},${D.y}`} fill="#22d3ee" fillOpacity={0.08} stroke={C.cyan} strokeWidth={3} />
        <line x1={A.x} y1={A.y} x2={Cc.x} y2={Cc.y} stroke={C.amber} strokeWidth={4} />
        <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke={C.rose} strokeWidth={4} strokeDasharray="10 5" />
        {([['A', A, -16, -6], ['B', B, 8, 16], ['C', Cc, 8, -6], ['D', D, -16, -8], ['O', O, 8, -8]] as [string, Pt, number, number][]).map(([l, pt, dx, dy]) => <g key={l}><circle cx={pt.x} cy={pt.y} r={l === 'O' ? 3 : 5} fill={C.text} /><text x={pt.x + dx} y={pt.y + dy} fill={C.text} fontSize={16} fontWeight={700}>{l}</text></g>)}
      </svg>
      <p className="text-sm text-slate-200" aria-live="polite" data-testid="sticks-readout">
        Stick AC = {f2(facts.diagonalAC)} (solid), stick BD = {f2(facts.diagonalBD)} (dashed). Angles of ABCD: {facts.angles.map((a) => `${f1(a)}°`).join(', ')}. It is {withArticle(facts.name)}. {verdict}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stepper label="stick AC length" value={String(s.len1)} onDec={() => set({ len1: Math.max(2, s.len1 - 1) })} onInc={() => set({ len1: Math.min(10, s.len1 + 1) })} decDisabled={s.len1 <= 2} incDisabled={s.len1 >= 10} />
        <Stepper label="stick BD length" value={String(s.len2)} onDec={() => set({ len2: Math.max(2, s.len2 - 1) })} onInc={() => set({ len2: Math.min(10, s.len2 + 1) })} decDisabled={s.len2 <= 2} incDisabled={s.len2 >= 10} />
        <Stepper label="crossing on AC" value={`${Math.round(s.t1 * 100)}% from A`} onDec={() => set({ t1: clampT(s.t1 - 0.1) })} onInc={() => set({ t1: clampT(s.t1 + 0.1) })} decDisabled={s.t1 <= 0.1} incDisabled={s.t1 >= 0.9} />
        <Stepper label="crossing on BD" value={`${Math.round(s.t2 * 100)}% from B`} onDec={() => set({ t2: clampT(s.t2 - 0.1) })} onInc={() => set({ t2: clampT(s.t2 + 0.1) })} decDisabled={s.t2 <= 0.1} incDisabled={s.t2 >= 0.9} />
        <Stepper label="angle between sticks" value={`${s.angle}°`} onDec={() => set({ angle: Math.max(30, s.angle - 10) })} onInc={() => set({ angle: Math.min(150, s.angle + 10) })} decDisabled={s.angle <= 30} incDisabled={s.angle >= 150} />
      </div>
    </div>
  );
};

export const PROP_VISUALS: VisualRegistry = {
  numberGrid: NumberGridVisual,
  factorPairs: FactorPairsVisual,
  eulerStrip: EulerStripVisual,
  triangle: TriangleVisual,
  twoTriangles: TwoTrianglesVisual,
  sticks: SticksVisual,
};
