/**
 * Interactive derivations of Newton's second law (PHY-2C). Derivation A follows the textbook's cart experiments, B derives
 * F = ma from momentum (enrichment). Steps with a check stay closed until the student supplies the missing reasoning.
 * The figure and every number come from the Force Laboratory model; navigating records nothing and never counts as mastery.
 */

import React, { useMemo, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { SECOND_LAW_DERIVATIONS, SL_CASES, contextOf, secondLawDerivationById, type SLHighlight } from '../../../engine/physics/forces/secondLawDerivations';
import { momentumHistory } from '../../../engine/physics/forces/secondLaw';
import { QuestionView } from '../../education/QuestionView';
import { PlotView } from './ForceGraphs';
import { PHYS } from '../motion/physicsColors';
import { Nar } from '../../narration/NarrationRegion';
import { NarrationPlayer } from '../../narration/NarrationPlayer';
import { DerivationNarration } from '../../narration/DerivationNarration';
import { dnid } from '../../../engine/narration/derivationSegments';

const r2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${r2(Math.abs(n))}`);

export const SecondLawDerivationView: React.FC<{ id?: string; alt?: string }> = ({ id = 'A' }) => {
  const [which, setWhich] = useState(secondLawDerivationById(id)?.id ?? 'A');
  const d = secondLawDerivationById(which)!;
  const [caseId, setCaseId] = useState(SL_CASES[0].id);
  const cs = SL_CASES.find((c) => c.id === caseId)!;
  const ctx = useMemo(() => contextOf(cs.setup, cs.t), [cs]);
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const step = d.steps[i];
  const gated = Boolean(step.check) && !solved[`${d.id}-${step.id}`];
  const last = i === d.steps.length - 1;
  const rel = step.relation ? step.relation(ctx) : null;
  const on = (h: SLHighlight) => step.uses.includes(h);
  const hist = useMemo(() => momentumHistory(cs.setup, Math.max(cs.t, 1)), [cs]);
  const tMax = Math.max(cs.t, 1);
  const go = (n: number) => setI(Math.min(d.steps.length - 1, Math.max(0, n)));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'ArrowRight' && !gated) { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };
  const m = ctx.massKg;
  const fMax = Math.max(10, Math.ceil((Math.abs(ctx.net) * 2.4) / 5) * 5);
  const aMax = Math.max(1, Math.abs(ctx.a) * 2.4);

  return (
    <DerivationNarration d={d} index={i} gated={gated}>
    <div className="space-y-3" data-visual="secondLawDerivation" data-testid="sl-derivation" data-derivation={d.id}>
      <div role="group" aria-label="Choose a derivation" className="flex flex-wrap gap-2">
        {SECOND_LAW_DERIVATIONS.map((x) => <button key={x.id} type="button" data-derivation-tab={x.id} aria-pressed={x.id === d.id} onClick={() => { setWhich(x.id); setI(0); }} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: x.id === d.id ? PHYS.prediction : '#334155' }}>{x.id === d.id ? '✓ ' : ''}{x.id}. {x.id === 'A' ? 'From the cart experiments' : 'From momentum (enrichment)'}</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2"><Nar as="h3" id={dnid.title} className="text-lg font-bold text-white">{d.title}</Nar><NarrationPlayer label="this derivation" /></div>
      <p className="text-[11px] text-slate-400" data-testid="sl-source">Source: {d.source}</p>
      <div className="rounded-xl border p-3 text-xs text-slate-200 space-y-1" style={{ borderColor: `${PHYS.displacement}66` }} data-testid="derivation-assumptions">
        <strong style={{ color: PHYS.displacement }}>Assumptions</strong>
        <ul className="list-disc pl-5">{d.assumptions.map((a, ai) => <Nar as="li" key={a} id={dnid.assume(ai)}>{a}</Nar>)}</ul>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <label className="flex flex-wrap items-center gap-2 max-w-full min-w-0">Case for the figure
          <select value={caseId} onChange={(e) => setCaseId(e.target.value)} aria-label="Case shown in the figure" data-testid="derivation-case" className="min-h-[44px] max-w-full w-full sm:w-auto rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">{SL_CASES.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select>
        </label>
        <span>m = {r2(m)} kg, u = {sg(ctx.u)} m/s, v = {sg(ctx.v)} m/s, t = {r2(ctx.t)} s, net force {sg(ctx.net)} N, a = {sg(ctx.a)} m/s² (from the cart model)</span>
      </div>

      <div className="grid gap-3 md:grid-cols-2" data-testid="derivation-figure">
        {d.id === 'A' ? (
          <>
            <PlotView id="fa" title="a against F (same mass)" xName="net force F" xUnit="N" yName="acceleration a" yUnit="m/s²" color={PHYS.acceleration} pts={[[-fMax, -fMax / m], [fMax, fMax / m]]} xr={[-fMax, fMax]} yr={[-Math.max(aMax, fMax / m), Math.max(aMax, fMax / m)]}
              marks={[{ x: ctx.net, y: ctx.a, label: `(${sg(ctx.net)}, ${sg(ctx.a)})` }, ...(on('force') && Math.abs(2 * ctx.net) <= fMax ? [{ x: 2 * ctx.net, y: ctx.aDoubleForce, label: `2F → ${sg(ctx.aDoubleForce)}` }] : [])]}
              caption={on('force') ? 'Doubling F doubles a: a straight line through the origin (linear).' : 'a = F ÷ m for this cart.'} alt={`a against F for ${r2(m)} kg: a straight line. Now (${sg(ctx.net)} N, ${sg(ctx.a)} m/s²); with double the force a is ${sg(ctx.aDoubleForce)}.`} />
            <PlotView id="am" title="a against m (same force)" xName="mass m" xUnit="kg" yName="acceleration a" yUnit="m/s²" color={PHYS.acceleration}
              pts={Array.from({ length: 41 }, (_, k) => { const mm = 0.5 + (k * (4 * m - 0.5)) / 40; return [mm, ctx.net / mm] as [number, number]; })} xr={[0, 4 * m]} yr={ctx.net >= 0 ? [0, Math.max(1, Math.abs(ctx.a) * 2.5)] : [-Math.max(1, Math.abs(ctx.a) * 2.5), 0]}
              marks={[{ x: m, y: ctx.a, label: `(${r2(m)} kg, ${sg(ctx.a)})` }, ...(on('mass') ? [{ x: 2 * m, y: ctx.aDoubleMass, label: `2m → ${sg(ctx.aDoubleMass)}` }] : [])]}
              caption={on('mass') ? 'Doubling m halves a: a curve (inverse), not a straight line.' : 'a = F ÷ m for this force.'} alt={`a against m for a constant force: a curve falling as mass grows. Now (${r2(m)} kg, ${sg(ctx.a)}); with double the mass a is ${sg(ctx.aDoubleMass)}.`} />
          </>
        ) : (
          <>
            <PlotView id="pt" title="momentum against time" xName="time t" xUnit="s" yName="momentum p" yUnit="kg m/s" color={PHYS.velocity} pts={hist.filter((_, k) => k % 5 === 0).map((h) => [h.t, h.p] as [number, number])} xr={[0, tMax]}
              yr={[Math.min(0, ctx.p0, ctx.p1) - Math.abs(ctx.dp) * 0.2 - 1, Math.max(0, ctx.p0, ctx.p1) + Math.abs(ctx.dp) * 0.2 + 1]}
              marks={[{ x: ctx.t, y: ctx.p1, label: on('dp') || on('momentum') ? `m v = ${sg(ctx.p1)}` : `${sg(ctx.p1)}` }, ...(on('dp') || on('momentum') ? [{ x: 0, y: ctx.p0, label: `m u = ${sg(ctx.p0)}` }] : [])]}
              caption={on('dp') ? `Δp = m v − m u = ${sg(ctx.p1)} − (${sg(ctx.p0)}) = ${sg(ctx.dp)} kg m/s.` : on('force') ? `The slope is Δp ÷ Δt = ${sg(ctx.dp / ctx.t)} kg m/s² = the net force ${sg(ctx.net)} N.` : 'Momentum p = m v.'} alt={`Momentum against time: from ${sg(ctx.p0)} to ${sg(ctx.p1)} kg m/s over ${r2(ctx.t)} s.`} />
            <PlotView id="vt" title="velocity against time" xName="time t" xUnit="s" yName="velocity v" yUnit="m/s" color={PHYS.velocity} pts={hist.filter((_, k) => k % 5 === 0).map((h) => [h.t, h.v] as [number, number])} xr={[0, tMax]}
              yr={[Math.min(0, ctx.u, ctx.v) - 1, Math.max(0, ctx.u, ctx.v) + 1]} marks={[{ x: ctx.t, y: ctx.v, label: `v = ${sg(ctx.v)}` }, ...(on('velocity') || on('acc') ? [{ x: 0, y: ctx.u, label: `u = ${sg(ctx.u)}` }] : [])]}
              caption={on('acc') ? `The slope (v − u) ÷ t = ${sg(ctx.a)} m/s² is the acceleration.` : 'The same motion, as velocity.'} alt={`Velocity against time from ${sg(ctx.u)} to ${sg(ctx.v)} m/s.`} />
          </>
        )}
      </div>

      <div tabIndex={0} onKeyDown={onKey} role="group" aria-label={`Derivation step ${i + 1} of ${d.steps.length}`} className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" data-testid="derivation-step" data-step={step.id}>
        <div className="text-[11px] font-mono text-slate-400">Step {i + 1} of {d.steps.length}</div>
        <Nar as="h4" id={dnid.stepTitle} className="text-sm font-bold text-white">{step.title}</Nar>
        {gated && step.check ? (
          <div className="space-y-2" data-testid="derivation-gate">
            <Nar id={dnid.gate} className="text-xs" style={{ color: PHYS.prediction }}>{'★'} Supply the missing reasoning first. The mathematics of this step appears after your answer.</Nar>
            <QuestionView question={step.check} onSubmit={(ev) => { if (ev.correct) setSolved((s) => ({ ...s, [`${d.id}-${step.id}`]: true })); }} />
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-surface-lowest p-2 font-mono text-xs sm:text-sm text-white space-y-1 overflow-x-auto break-words" data-testid="derivation-math">{step.math.map((l, mi) => <Nar as="div" key={l} id={dnid.math(mi)}>{l}</Nar>)}</div>
            <Nar id={dnid.why} className="text-xs text-slate-200"><strong>Why this is valid: </strong>{step.why}</Nar>
            {rel && (
              <p className="text-xs rounded-lg p-2 border" style={{ borderColor: `${PHYS.correct}66`, color: '#e2e8f0' }} data-testid="derivation-numbers">
                <strong style={{ color: PHYS.correct }}>{Math.abs(rel.lhs - rel.rhs) < 1e-9 ? '✓ ' : '✗ '}Numerical check for this case: </strong>{rel.label}: {r2(rel.lhs)} and {r2(rel.rhs)}. Numbers for one case illustrate a step; the argument is what supports it for every case.
              </p>
            )}
          </>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-elevated text-slate-100 text-sm font-bold disabled:opacity-40" data-testid="derivation-prev">{'←'} Previous step</button>
          <button type="button" onClick={() => go(i + 1)} disabled={last || gated} className="min-h-[44px] px-4 rounded-lg text-slate-950 text-sm font-bold disabled:opacity-40" style={{ background: PHYS.position }} data-testid="derivation-next">Next step {'→'}</button>
        </div>
        <p className="text-[11px] text-slate-400">Tip: with this box focused, the left and right arrow keys move between steps.</p>
      </div>

      {last && !gated && (
        <div className="rounded-xl border p-3 space-y-1" style={{ borderColor: `${PHYS.correct}80` }} data-testid="derivation-summary">
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.correct }}>{'✓'} Derivation in brief (for revision)</h4>
          {d.summary.map((l, si) => <Nar as="div" key={l} id={dnid.summary(si)} className="font-mono text-sm text-white">{l}</Nar>)}
        </div>
      )}
    </div>
    </DerivationNarration>
  );
};

export const SecondLawDerivationVisual: React.FC<VisualProps> = ({ props, alt }) => <SecondLawDerivationView id={String((props as { id?: string }).id ?? 'A')} alt={alt} />;
