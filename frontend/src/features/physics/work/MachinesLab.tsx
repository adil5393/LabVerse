/**
 * Simple Machines Laboratory (/physics/work/machines) and Power Laboratory (/physics/work/power) pages (PHY-3D). Free exploration
 * (no gates) with optional guided investigations: Predict, Experiment, Observe, Explain. Outcomes come from the models that draw the scenes.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP } from '../../../engine/physics/work/machines';
import { LEVER_EXPERIMENTS, leverOutcome, PULLEY_EXPERIMENTS, pulleyOutcome, RAMP_EXPERIMENTS, rampOutcome } from '../../../engine/physics/work/machineExperiments';
import { DEFAULT_POWER } from '../../../engine/physics/work/power';
import { POWER_EXPERIMENTS, powerExperimentById, powerOutcome } from '../../../engine/physics/work/powerExperiments';
import { PHYS } from '../motion/physicsColors';
import { LeverView, PulleyView, RampView } from './MachineViews';
import { PowerView } from './PowerView';

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    <Link to="/physics/work" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Work, Energy, and Simple Machines</Link><span>/</span>
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

interface GRoute<S, R> { id: string; label: string; setup: S; prompt: string; options: { label: string; why: string }[]; explain: (r: R) => string }

/** One Predict, Experiment, Observe, Explain panel for any model. */
function GuidedPanel<S, R>({ route, outcome, onRun, tag }: { route: GRoute<S, R>; outcome: { result: R; holdsIndex: number }; onRun: (s: S) => void; tag: string }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const right = choice !== null && choice === outcome.holdsIndex;
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route={route.id}>
      <p className="text-sm text-slate-100 font-medium">{route.label}</p>
      <fieldset className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>{'★'} 1 · Predict</legend>
        <p className="text-sm text-slate-100">{route.prompt}</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {route.options.map((o, i) => <button key={o.label} type="button" role="radio" aria-checked={choice === i} data-option={`${route.id}-${i}`} onClick={() => { setChoice(i); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-sm text-left" style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}>{choice === i ? '● ' : '○ '}{o.label}</button>)}
        </div>
      </fieldset>
      <div className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>{'▶'} 2 · Experiment</h4>
        <button type="button" onClick={() => { onRun(route.setup); setRan(true); }} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.position }} data-testid={`run-${route.id}`}>Set up this experiment above</button>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40 ml-2" style={{ background: PHYS.prediction }} data-testid={`check-${route.id}`}>Check my prediction</button>
        {ran && <p className="text-[11px] text-slate-300">The scene above is set up. Drag the slider, then compare.</p>}
      </div>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid={`${tag}-feedback`} className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${right ? PHYS.correct : PHYS.error}`, background: `${right ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>{right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}</h4>
          <p><strong>Model result: </strong>{route.explain(outcome.result)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>4 · Explain</h4>
          <p>{right ? route.options[choice].why : `${route.options[choice].why} The model supports: "${route.options[outcome.holdsIndex].label}". ${route.options[outcome.holdsIndex].why}`}</p>
        </div>
      )}
    </section>
  );
}

const Pick: React.FC<{ exps: { id: string; title: string }[]; current: string | undefined; onPick: (id: string | null) => void }> = ({ exps, current, onPick }) => (
  <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
    <button type="button" aria-pressed={!current} onClick={() => onPick(null)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${!current ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={!current ? { borderColor: PHYS.position } : undefined}>{!current ? '✓ ' : ''}Free exploration</button>
    {exps.map((x) => <button key={x.id} type="button" aria-pressed={current === x.id} data-experiment={x.id} onClick={() => onPick(x.id)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${current === x.id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={current === x.id ? { borderColor: PHYS.prediction } : undefined}>{current === x.id ? '✓ ' : ''}{x.id}. {x.title}</button>)}
  </div>
);

const Header: React.FC<{ goal: string; id: string; title: string; lesson: string }> = ({ goal, id, title, lesson }) => (
  <>
    <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" style={{ borderLeft: `4px solid ${PHYS.time}` }}>
      <h3 className="text-lg font-bold text-white">Experiment {id}: {title}</h3>
      <p className="text-sm text-slate-300">{goal} Predict first, set up the experiment, drag the slider, then compare. Afterwards change any setting and repeat.</p>
    </div>
    <p className="text-sm text-slate-200 rounded-xl border p-3" style={{ borderColor: `${PHYS.correct}80`, background: `${PHYS.correct}0D` }}><strong style={{ color: PHYS.correct }}>{'✓ '}What to notice: </strong>{lesson}</p>
  </>
);

type Apparatus = 'ramp' | 'pulley' | 'lever';
interface AnyExp { id: string; title: string; goal: string; lesson: string; routes: { setup: unknown }[] }
const TABS: { id: Apparatus; label: string }[] = [{ id: 'ramp', label: 'Inclined plane' }, { id: 'pulley', label: 'Pulley' }, { id: 'lever', label: 'Lever' }];

export const MachinesLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const app = (TABS.find((t) => t.id === params.get('apparatus'))?.id ?? 'ramp') as Apparatus;
  const expId = params.get('experiment');
  const set = (a: Apparatus, e: string | null) => setParams(e ? { apparatus: a, experiment: e } : { apparatus: a });
  const [key, setKey] = useState(0);
  const [ramp, setRamp] = useState(DEFAULT_RAMP);
  const [pulley, setPulley] = useState(DEFAULT_PULLEY);
  const [lever, setLever] = useState(DEFAULT_LEVER);
  const exps = (app === 'ramp' ? RAMP_EXPERIMENTS : app === 'pulley' ? PULLEY_EXPERIMENTS : LEVER_EXPERIMENTS) as unknown as AnyExp[];
  const exp = exps.find((e) => e.id === expId);
  const reload = () => setKey((k) => k + 1);
  const choose = (id: string | null) => {
    const e = exps.find((x) => x.id === id);
    set(app, id);
    if (app === 'ramp') setRamp(e ? (e.routes[0].setup as typeof ramp) : DEFAULT_RAMP);
    else if (app === 'pulley') setPulley(e ? (e.routes[0].setup as typeof pulley) : DEFAULT_PULLEY);
    else setLever(e ? (e.routes[0].setup as typeof lever) : DEFAULT_LEVER);
    reload();
  };
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="machines-lab">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="Simple Machines Laboratory" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Simple Machines Laboratory</h1>
          <p className="text-sm text-slate-300 max-w-3xl">An inclined plane, a pulley system and a lever, each drawn from one model: the geometry, the forces, the distances and the work put in and taken out always agree. Machines make a task easier by changing the force, never by reducing the work. This is free exploration: nothing to unlock.</p>
          <p className="text-sm text-slate-300" data-testid="machines-derive-links">Why does it work? <Link className="underline hover:text-sky-300" to="/physics/work/derivations?d=R">Derive the ramp relation</Link> · <Link className="underline hover:text-sky-300" to="/physics/work/derivations?d=L">Derive the lever relation</Link>.</p>
        </header>
        <div role="tablist" aria-label="Choose a machine" className="flex flex-wrap gap-2">
          {TABS.map((t) => <button key={t.id} type="button" role="tab" aria-selected={app === t.id} data-apparatus={t.id} onClick={() => { set(t.id, null); reload(); }} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${app === t.id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={app === t.id ? { borderColor: PHYS.force } : undefined}>{t.label}</button>)}
        </div>
        <section aria-label="The machine">
          {app === 'ramp' && <RampView key={`r-${key}`} initial={ramp} editable />}
          {app === 'pulley' && <PulleyView key={`p-${key}`} initial={pulley} editable />}
          {app === 'lever' && <LeverView key={`l-${key}`} initial={lever} editable />}
        </section>
        <section aria-label="Guided investigations" className="space-y-3">
          <h2 className="text-xl font-black text-white">Guided investigations (optional)</h2>
          <Pick exps={exps} current={exp?.id} onPick={choose} />
          {exp ? (
            <div className="space-y-3" data-testid="machine-experiment-panel">
              <Header goal={exp.goal} id={exp.id} title={exp.title} lesson={exp.lesson} />
              {app === 'ramp' && RAMP_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={rampOutcome(r)} onRun={(s) => { setRamp(s); reload(); }} tag="machine" />)}
              {app === 'pulley' && PULLEY_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={pulleyOutcome(r)} onRun={(s) => { setPulley(s); reload(); }} tag="machine" />)}
              {app === 'lever' && LEVER_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={leverOutcome(r)} onRun={(s) => { setLever(s); reload(); }} tag="machine" />)}
              <p className="text-xs text-slate-400">These are <em>model</em> results for ideal or explicitly modelled machines; a simulation shows what the model does, it is not a proof (the derivations are).</p>
            </div>
          ) : <p className="text-sm text-slate-400">Pick an investigation to predict first and compare with the model, or keep exploring freely.</p>}
        </section>
      </main>
    </div>
  );
};

export const PowerLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = powerExperimentById(params.get('experiment'));
  const [load, setLoad] = useState({ setup: exp ? exp.routes[0].setup : DEFAULT_POWER, key: 0 });
  const choose = (id: string | null) => { const e = powerExperimentById(id); setParams(id ? { experiment: id } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_POWER, key: l.key + 1 })); };
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="power-lab">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="Power Laboratory" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Power Laboratory</h1>
          <p className="text-sm text-slate-300 max-w-3xl">Change the work and the time and watch the power. Power is the rate of doing work: P = W ÷ t, in watts. This is free exploration: nothing to unlock.</p>
          <p className="text-sm text-slate-300" data-testid="power-derive-link">Why is power W ÷ t? <Link className="underline hover:text-sky-300" to="/physics/work/derivations?d=P">Work through the explanation</Link>.</p>
        </header>
        <section aria-label="The experiment"><PowerView key={`${exp?.id ?? 'free'}-${load.key}`} initial={load.setup} editable /></section>
        <section aria-label="Guided investigations" className="space-y-3">
          <h2 className="text-xl font-black text-white">Guided investigations (optional)</h2>
          <Pick exps={POWER_EXPERIMENTS} current={exp?.id} onPick={choose} />
          {exp ? (
            <div className="space-y-3" data-testid="power-experiment-panel">
              <Header goal={exp.goal} id={exp.id} title={exp.title} lesson={exp.lesson} />
              {exp.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={powerOutcome(r)} onRun={(s) => setLoad((l) => ({ setup: s, key: l.key + 1 }))} tag="power" />)}
              <p className="text-xs text-slate-400">These are <em>model</em> results for the average power; they are not proofs.</p>
            </div>
          ) : <p className="text-sm text-slate-400">Pick an investigation to predict first and compare with the model, or keep exploring freely.</p>}
        </section>
      </main>
    </div>
  );
};
