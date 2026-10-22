/**
 * Interactive derivations for Chapter 7 (PHY-3B to PHY-3D). The student changes the parameters, the figure and every number
 * update together; steps with a question stay closed until the student supplies the missing reasoning. Navigating or finishing
 * a derivation records nothing and never counts as mastery. The graphs are drawn from the same context as the numbers.
 */

import React, { useMemo, useState } from 'react';
import { DERIVATIONS, derivationById, type Ctx, type Derivation } from '../../../engine/physics/work/derivations';
import { computeKinetic, kineticSeries } from '../../../engine/physics/work/kineticModel';
import { G } from '../../../engine/physics/work/workModel';
import { QuestionView } from '../../education/QuestionView';
import type { VisualProps } from '../../education/visuals';
import { ENERGY, PHYS } from '../motion/physicsColors';
import { EnergyPlot } from './EnergyPlot';
import { Field } from './Field';
import { KineticFigure } from './KineticView';
import { DERIVATION_FIGURES } from './derivationFigures';
import { Nar } from '../../narration/NarrationRegion';
import { NarrationPlayer } from '../../narration/NarrationPlayer';
import { DerivationNarration } from '../../narration/DerivationNarration';
import { dnid } from '../../../engine/narration/derivationSegments';

const f2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${f2(Math.abs(n))}`);

export interface FigureProps { d: Derivation; ctx: Ctx; uses: string[] }

const KFigure: React.FC<FigureProps> = ({ ctx }) => {
  const r = computeKinetic({ massKg: ctx.m, netForce: ctx.F, u: ctx.u, displacement: ctx.s });
  return r.valid ? <KineticFigure r={r} t={r.tEnd} showScene={false} /> : null;
};

const UFigure: React.FC<FigureProps> = ({ ctx, uses }) => {
  const hmax = Math.max(10, ctx.h0 + Math.abs(ctx.dh) + 2);
  const line = (ref: number) => [[0, ctx.m * ctx.g * (0 - ref)], [hmax, ctx.m * ctx.g * (hmax - ref)]] as [number, number][];
  const ymax = ctx.m * ctx.g * hmax, ymin = -ctx.m * ctx.g * ctx.ref;
  return (
    <EnergyPlot id="u-height" title="Potential energy against height" xName="height h" xUnit="m" yName="potential energy U" yUnit="J" xr={[0, hmax]} yr={[Math.min(0, ymin) * 1.1 - 1, ymax - Math.min(0, ymin) + 1]}
      lines={[{ id: 'u', name: `U = m g (h − ${f2(ctx.ref)}) from your reference`, color: ENERGY.potential, pts: line(ctx.ref) }, ...(ctx.ref !== 0 ? [{ id: 'u0', name: 'U from the ground (reference 0)', color: PHYS.time, pts: line(0), dash: '5 4' }] : [])]}
      points={[{ x: ctx.h0, y: ctx.U0, label: `start ${f2(ctx.U0)} J`, color: ENERGY.potential }, { x: ctx.h1, y: ctx.U1, label: `end ${f2(ctx.U1)} J`, color: '#e2e8f0' }]}
      caption={uses.includes('height') ? `Slope = m g = ${f2(ctx.m * ctx.g)} J per metre. Going from ${f2(ctx.h0)} m to ${f2(ctx.h1)} m changes U by ${sg(ctx.dU)} J, whatever the reference.` : `U = m g h with g = ${f2(ctx.g)} m/s².`}
      alt={`Potential energy against height: a straight line of slope ${f2(ctx.m * ctx.g)} J per metre. From ${f2(ctx.h0)} m to ${f2(ctx.h1)} m the change is ${sg(ctx.dU)} J.`} />
  );
};

const CFigure: React.FC<FigureProps> = ({ ctx }) => {
  const m = ctx.m, h = ctx.h, tFall = Math.sqrt((2 * h) / G);
  const pts = (fn: (t: number) => number) => Array.from({ length: 41 }, (_, i) => { const t = (tFall * i) / 40; return [t, fn(t)] as [number, number]; });
  const U = (t: number) => m * G * (h - 0.5 * G * t * t), K = (t: number) => 0.5 * m * G * G * t * t;
  return (
    <EnergyPlot id="c-energy" title="Energy against time in free fall" xName="time t" xUnit="s" yName="energy" yUnit="J" xr={[0, tFall]} yr={[0, m * G * h * 1.15]}
      lines={[{ id: 'u', name: 'potential energy U', color: ENERGY.potential, pts: pts(U) }, { id: 'k', name: 'kinetic energy K', color: ENERGY.kinetic, pts: pts(K) }, { id: 'e', name: 'mechanical energy K + U', color: ENERGY.total, pts: pts((t) => U(t) + K(t)), dash: '6 4' }]}
      cursor={ctx.t} points={[{ x: ctx.t, y: ctx.U1, label: `U ${f2(ctx.U1)}`, color: ENERGY.potential }, { x: ctx.t, y: ctx.K1, label: `K ${f2(ctx.K1)}`, color: ENERGY.kinetic }]}
      caption={`At t = ${f2(ctx.t)} s: U = ${f2(ctx.U1)} J, K = ${f2(ctx.K1)} J, total ${f2(ctx.E1)} J = m g h = ${f2(ctx.E0)} J. The two lines mirror each other, so their sum is flat.`}
      alt={`Energy against time for a ${f2(m)} kg object dropped from ${f2(h)} m: potential energy falls and kinetic energy rises by the same amount, so the total stays ${f2(ctx.E0)} J. At ${f2(ctx.t)} s U = ${f2(ctx.U1)} J and K = ${f2(ctx.K1)} J.`} />
  );
};

const BASE_FIGURES: Record<string, React.FC<FigureProps>> = { K: KFigure, U: UFigure, C: CFigure };

export const DerivationView: React.FC<{ id?: string; alt?: string }> = ({ id = 'K' }) => {
  const [which, setWhich] = useState<string>(derivationById(id)?.id ?? 'K');
  const d = derivationById(which)!;
  const [params, setParams] = useState<Record<string, Ctx>>(() => Object.fromEntries(DERIVATIONS.map((x) => [x.id, { ...x.defaults }])));
  const p = params[d.id];
  const { ctx, problem } = useMemo(() => d.context(p), [d, p]);
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const step = d.steps[i];
  const gated = Boolean(step.check) && !solved[`${d.id}-${step.id}`];
  const last = i === d.steps.length - 1;
  const rel = !problem && step.relation ? step.relation(ctx) : null;
  const go = (n: number) => setI(Math.min(d.steps.length - 1, Math.max(0, n)));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === 'ArrowRight' && !gated) { e.preventDefault(); go(i + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
  };
  const Figure = BASE_FIGURES[d.id] ?? DERIVATION_FIGURES[d.id];

  return (
    <DerivationNarration d={d} index={i} gated={gated}>
    <div className="space-y-3" data-visual="workDerivation" data-testid="work-derivation" data-derivation={d.id}>
      <label className="block sm:hidden text-xs text-slate-300">Choose a derivation
        <select aria-label="Choose a derivation" value={d.id} onChange={e => { setWhich(e.target.value); setI(0); }} className="w-full min-h-[44px] block mt-1 rounded-lg bg-surface-card text-white border border-surface-border px-2">
          {DERIVATIONS.map(x => <option key={x.id} value={x.id}>{x.title}</option>)}
        </select>
      </label>
      <div role="group" aria-label="Choose a derivation" className="hidden sm:flex flex-wrap gap-2">
        {DERIVATIONS.map((x) => <button key={x.id} type="button" data-derivation-tab={x.id} aria-pressed={x.id === d.id} onClick={() => { setWhich(x.id); setI(0); }} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: x.id === d.id ? PHYS.prediction : '#334155' }}>{x.id === d.id ? '✓ ' : ''}{x.title.split(':')[0]}</button>)}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2"><Nar as="h3" id={dnid.title} className="text-lg font-bold text-white">{d.title}</Nar><NarrationPlayer label="this derivation" /></div>
      <p className="text-[11px] text-slate-400" data-testid="derivation-source">{d.kind === 'enrichment' ? 'LabVerse enrichment. ' : ''}Source: {d.source}</p>
      <ActivityDetails title="Assumptions"><div className="text-xs text-slate-200 space-y-1" data-testid="derivation-assumptions">
        <strong style={{ color: PHYS.displacement }}>Assumptions</strong>
        <ul className="list-disc pl-5">{d.assumptions.map((a, ai) => <Nar as="li" key={a} id={dnid.assume(ai)}>{a}</Nar>)}</ul>
      </div></ActivityDetails>
      <ActivityDetails title="Change the numbers"><div className="space-y-2" data-testid="derivation-params">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Change the numbers (the figure and every value update)</h4>
        <div className="flex flex-wrap gap-3 items-center">
          {d.params.map((sp) => <Field key={`${d.id}-${sp.id}`} id={`p-${sp.id}`} label={sp.label} unit={sp.unit} value={p[sp.id]} step={sp.step} onChange={(v) => setParams((all) => ({ ...all, [d.id]: { ...all[d.id], [sp.id]: Math.min(sp.max, Math.max(sp.min, v)) } }))} />)}
        </div>
        <p className="text-[11px] text-slate-400">Limits: {d.params.map((sp) => `${sp.label} ${sp.min} to ${sp.max} ${sp.unit}`).join('; ')}.</p>
        {problem && <p role="alert" className="text-xs rounded-lg px-3 py-2 border" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid="derivation-problem">{problem}</p>}
      </div></ActivityDetails>
      {!problem && (
        <div data-testid="derivation-figure">
          {Figure ? <Figure d={d} ctx={ctx} uses={step.uses} /> : <p className="text-xs text-slate-300">{Object.entries(ctx).map(([k, v]) => `${k} = ${f2(v)}`).join(', ')}</p>}
        </div>
      )}
      {d.id === 'K' && !problem && <p className="text-xs text-slate-300" data-testid="derivation-kinetic-line">m = {f2(ctx.m)} kg, F = {sg(ctx.F)} N, u = {sg(ctx.u)} m/s, s = {sg(ctx.s)} m, so a = {sg(ctx.a)} m/s², v = {sg(ctx.v)} m/s, W_net = {sg(ctx.W)} J, ΔK = {sg(ctx.dK)} J.</p>}
      {d.id === 'K' && !problem && <span className="sr-only" data-testid="k-series">{kineticSeries(computeKinetic({ massKg: ctx.m, netForce: ctx.F, u: ctx.u, displacement: ctx.s }), 4).map((q) => f2(q.K)).join(',')}</span>}

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
            <div className="rounded-lg bg-surface-lowest p-2 font-mono text-sm text-white space-y-1" data-testid="derivation-math">{step.math.map((l, mi) => <Nar as="div" key={l} id={dnid.math(mi)}>{l}</Nar>)}</div>
            <Nar id={dnid.why} className="text-xs text-slate-200"><strong>Why this is valid: </strong>{step.why}</Nar>
            {rel && (
              <p className="text-xs rounded-lg p-2 border" style={{ borderColor: `${PHYS.correct}66`, color: '#e2e8f0' }} data-testid="derivation-numbers">
                <strong style={{ color: PHYS.correct }}>{Math.abs(rel.lhs - rel.rhs) < 1e-6 ? '✓ ' : '✗ '}Numerical check for this case: </strong>{rel.label}: {f2(rel.lhs)} and {f2(rel.rhs)}. Numbers for one case illustrate a step; the argument is what supports it for every case.
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

export const DerivationVisual: React.FC<VisualProps> = ({ props, alt }) => <DerivationView id={String((props as { id?: string }).id ?? 'K')} alt={alt} />;
import { ActivityDetails } from '../../../components/InteractiveActivity';
