/**
 * Work-Energy Laboratory page (/physics/work/kinetic) and the Derivations page (/physics/work/derivations) (PHY-3B).
 * The laboratory is free exploration (no gates) with six optional investigations A to F: Predict, Experiment, Observe, Explain.
 * The outcome shown is computed from the same model that draws the cart and the graphs.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { KINETIC_EXPERIMENTS, kineticExperimentById, kineticRouteOutcome, type KineticRoute } from '../../../engine/physics/work/kineticExperiments';
import { DEFAULT_KINETIC, type KineticSetup } from '../../../engine/physics/work/kineticModel';
import { PHYS } from '../motion/physicsColors';
import { DerivationView } from './DerivationView';
import { KineticView } from './KineticView';

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    <Link to="/physics/work" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Work, Energy, and Simple Machines</Link><span>/</span>
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

const RoutePanel: React.FC<{ route: KineticRoute; onRun: (r: KineticRoute) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const out = kineticRouteOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;
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
        <button type="button" onClick={() => { onRun(route); setRan(true); }} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.position }} data-testid={`run-${route.id}`}>Set up this experiment above</button>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40 ml-2" style={{ background: PHYS.prediction }} data-testid={`check-${route.id}`}>Check my prediction</button>
        {ran && <p className="text-[11px] text-slate-300">The cart above is set up. Press Play, or drag the time slider, then compare.</p>}
      </div>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="kinetic-feedback" className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${right ? PHYS.correct : PHYS.error}`, background: `${right ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>{right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}</h4>
          <p><strong>Model result: </strong>{route.explain(out.result)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>4 · Explain</h4>
          <p>{right ? route.options[choice].why : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}</p>
        </div>
      )}
    </section>
  );
};

export const KineticLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = kineticExperimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ setup: KineticSetup; key: number }>({ setup: exp ? exp.routes[0].setup : DEFAULT_KINETIC, key: 0 });
  const select = (id: string | null) => { const e = kineticExperimentById(id); setParams(id ? { experiment: id } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_KINETIC, key: l.key + 1 })); };
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="kinetic-lab">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="Work-Energy Laboratory" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Work-Energy Laboratory</h1>
          <p className="text-sm text-slate-300 max-w-3xl">A cart under a constant net force. Change the mass, the net force, the starting velocity and the displacement: the force graph (its area is the work), the kinetic energy and the check W<sub>net</sub> = ΔK all come from one model. This is free exploration: nothing to unlock.</p>
          <p className="text-sm text-slate-300" data-testid="kinetic-derive-link">Why is K = ½mv²? <Link className="underline hover:text-sky-300" to="/physics/work/derivations?d=K">Work through the derivation</Link>.</p>
        </header>

        <section aria-label="The experiment"><KineticView key={`${exp?.id ?? 'free'}-${load.key}`} initial={load.setup} editable /></section>

        <section aria-label="Guided investigations" className="space-y-3">
          <h2 className="text-xl font-black text-white">Guided investigations (optional)</h2>
          <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!exp} onClick={() => select(null)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${!exp ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={!exp ? { borderColor: PHYS.position } : undefined}>{!exp ? '✓ ' : ''}Free exploration</button>
            {KINETIC_EXPERIMENTS.map((x) => (
              <button key={x.id} type="button" aria-pressed={exp?.id === x.id} data-experiment={x.id} onClick={() => select(x.id)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${exp?.id === x.id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={exp?.id === x.id ? { borderColor: PHYS.prediction } : undefined}>{exp?.id === x.id ? '✓ ' : ''}{x.id}. {x.title}</button>
            ))}
          </div>
          {exp ? (
            <div className="space-y-3" data-testid="kinetic-experiment-panel">
              <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" style={{ borderLeft: `4px solid ${PHYS.time}` }}>
                <h3 className="text-lg font-bold text-white">Experiment {exp.id}: {exp.title}</h3>
                <p className="text-sm text-slate-300">{exp.goal} Predict first, set up the experiment, press Play, then compare. Afterwards change any setting and repeat.</p>
              </div>
              {exp.routes.map((r) => <RoutePanel key={`${exp.id}-${r.id}`} route={r} onRun={(rr) => setLoad((l) => ({ setup: rr.setup, key: l.key + 1 }))} />)}
              <p className="text-sm text-slate-200 rounded-xl border p-3" style={{ borderColor: `${PHYS.correct}80`, background: `${PHYS.correct}0D` }}><strong style={{ color: PHYS.correct }}>{'✓ '}What to notice: </strong>{exp.lesson}</p>
              <p className="text-xs text-slate-400">These are <em>model</em> results for a constant net force on a straight line; a simulation shows what the model does, it is not a proof (the derivation is).</p>
            </div>
          ) : <p className="text-sm text-slate-400">Pick an investigation to predict first and compare with the model, or keep exploring freely.</p>}
        </section>
      </main>
    </div>
  );
};

export const WorkDerivations: React.FC = () => {
  const [params] = useSearchParams();
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="work-derivations">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <Crumb last="Derivations" />
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Derivations for Chapter 7</h1>
          <p className="text-sm text-slate-300 max-w-3xl">Follow the reasoning behind the formulas, change the numbers and supply the missing reasoning in the key steps. Reading a derivation never counts as mastery. Relations marked enrichment are LabVerse additions.</p>
        </header>
        <DerivationView key={params.get('d') ?? 'K'} id={params.get('d') ?? 'K'} />
      </main>
    </div>
  );
};
