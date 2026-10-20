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

import { WorkspaceShell } from '../../workspace';

export const KineticLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = kineticExperimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ setup: KineticSetup; key: number }>({ setup: exp ? exp.routes[0].setup : DEFAULT_KINETIC, key: 0 });
  const select = (id: string | null) => { const e = kineticExperimentById(id); setParams(id ? { experiment: id } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_KINETIC, key: l.key + 1 })); };

  // Outliner: Investigation presets
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
        <span className="text-[11px] font-mono text-primary font-bold">{KINETIC_EXPERIMENTS.length} Total</span>
      </div>
      <div role="group" aria-label="Choose an investigation" className="flex flex-col gap-1.5">
        <button
          type="button"
          aria-pressed={!exp}
          onClick={() => select(null)}
          className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
            !exp
              ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
              : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{!exp ? 'check_circle' : 'science'}</span>
            <span>Free Exploration</span>
          </div>
        </button>
        {KINETIC_EXPERIMENTS.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={exp?.id === x.id}
            data-experiment={x.id}
            onClick={() => select(x.id)}
            className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              exp?.id === x.id
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{x.id}. {x.title}</span>
              {exp?.id === x.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">{x.goal}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Inspector: Model details and derivations
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Model Principles</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Work-Energy Theorem</p>
            <p>W<sub>net</sub> = &Delta;K = &frac12;mv&sup2; &minus; &frac12;mu&sup2;</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Constant Net Force</p>
            <p>W<sub>net</sub> = F<sub>net</sub> &times; s</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Reference Derivations</span>
        <p className="text-xs text-slate-300" data-testid="kinetic-derive-link">
          Why is K = &frac12;mv&sup2;?{' '}
          <Link className="underline text-sky-400 hover:text-sky-300 font-medium" to="/physics/work/derivations?d=K">
            Work through the derivation &rarr;
          </Link>
        </p>
      </div>

      {exp && (
        <div className="pt-2 border-t border-outline-variant space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Active Experiment {exp.id}</span>
          <div className="p-2.5 rounded bg-surface-card border border-surface-border space-y-1.5">
            <h4 className="font-bold text-white text-xs">{exp.title}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{exp.goal}</p>
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
              <strong>Notice:</strong> {exp.lesson}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Viewport: Simulation canvas
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="kinetic-lab">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        <KineticView key={`${exp?.id ?? 'free'}-${load.key}`} initial={load.setup} editable />
      </div>
    </div>
  );

  // Analysis Dock: POE investigations
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-3 font-sans">
      {exp ? (
        <div className="space-y-3" data-testid="kinetic-experiment-panel">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
            <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
            <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
          </div>
          {exp.routes.map((r) => (
            <RoutePanel key={`${exp.id}-${r.id}`} route={r} onRun={(rr) => setLoad((l) => ({ setup: rr.setup, key: l.key + 1 }))} />
          ))}
          <p className="text-xs text-slate-400">
            Model results for a constant net force on a straight line; exact kinematics without numerical drift.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant space-y-1">
          <span className="material-symbols-outlined text-3xl text-outline">tune</span>
          <p className="font-mono text-xs text-slate-300">
            Free Exploration Mode: Adjust mass, net force, initial velocity, and displacement in the viewport.
          </p>
          <p className="text-[11px] text-outline">
            Select an investigation in the left Explorer to compare your predictions with the model.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Work-Energy Laboratory"
      outlinerTitle="Investigations"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Model Properties"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & POE"
      analysisDock={analysisDockContent}
    />
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
