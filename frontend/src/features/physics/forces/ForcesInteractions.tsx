/**
 * Interactions page (/physics/forces/interactions): the two-body laboratory and the force-pair activities (PHY-2D).
 * Investigations P and Q use the two-body model (Predict → Experiment → Observe → Explain); R, S and T work with force pairs.
 * The Free Laboratory (two carts, all settings) is always available above the investigations. No gates.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { PAIR_EXPERIMENTS, TB_EXPERIMENTS, tbExperimentById, tbOutcome, type TbExperiment, type TbRoute } from '../../../engine/physics/forces/twoBodyExperiments';
import { DEFAULT_TWO_BODY, type TwoBodySetup } from '../../../engine/physics/forces/twoBody';
import { PairIdentifyView, TwoBodyView } from './TwoBody';
import { PHYS } from '../motion/physicsColors';

const RoutePanel: React.FC<{ route: TbRoute; onRun: (s: TwoBodySetup) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const out = tbOutcome(route);
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
        <button type="button" onClick={() => onRun(route.setup)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.position }} data-testid={`run-${route.id}`}>Set up this experiment</button>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40 ml-2" style={{ background: PHYS.prediction }} data-testid={`check-${route.id}`}>Check my prediction</button>
      </div>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="tb-feedback" className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${right ? PHYS.correct : PHYS.error}`, background: `${right ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>{right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}</h4>
          <p><strong>Model result: </strong>{route.explain(out.start, out.end, route.setup)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>4 · Explain</h4>
          <p>{right ? route.options[choice].why : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}</p>
        </div>
      )}
    </section>
  );
};

const ComparePredict: React.FC = () => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const opts = [
    { label: 'Yes: they are equal and opposite, so they are an action–reaction pair', right: false, why: 'They are equal and opposite, but both act on the SAME object (the book). A third-law pair always acts on two different objects and is the same kind of force. These two balance each other on the book.' },
    { label: 'No: they are balanced forces on the book; each has a different partner on another object', right: true, why: 'The weight is exerted by the Earth and the normal force by the table. The partner of the weight is the book pulling the Earth; the partner of the normal force is the book pressing the table.' },
  ];
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3" data-route="s1">
      <fieldset className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>{'★'} 1 · Predict</legend>
        <p className="text-sm text-slate-100">A book rests on a table. Its weight (down) and the normal force from the table (up) are equal and opposite. Are they an action–reaction pair?</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
          {opts.map((o, i) => <button key={o.label} type="button" role="radio" aria-checked={choice === i} data-option={`s1-${i}`} onClick={() => { setChoice(i); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-sm text-left" style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}>{choice === i ? '● ' : '○ '}{o.label}</button>)}
        </div>
        <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40" style={{ background: PHYS.prediction }} data-testid="check-s1">Check my prediction</button>
      </fieldset>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="tb-feedback" className="rounded-lg p-3 text-xs text-slate-100" style={{ border: `1px solid ${opts[choice].right ? PHYS.correct : PHYS.error}`, background: `${opts[choice].right ? PHYS.correct : PHYS.error}14` }}>
          <strong style={{ color: opts[choice].right ? PHYS.correct : PHYS.error }}>{opts[choice].right ? '✓ ' : '✗ '}</strong>{opts[choice].why}
        </div>
      )}
      <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>{'▶'} 2 · Experiment: compare the free-body diagrams side by side</h4>
      <PairIdentifyView mode="compare" />
    </section>
  );
};

export const ForcesInteractions: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const id = params.get('experiment');
  const tb: TbExperiment | undefined = tbExperimentById(id);
  const pairExp = PAIR_EXPERIMENTS.find((e) => e.id === id);
  const tow: TwoBodySetup = { mode: 'tow', massA: 2, massB: 3, force: 10, uA: 0, uB: 0, durationS: 3 };
  const [load, setLoad] = useState<{ setup: TwoBodySetup; key: number }>({ setup: tb ? tb.routes[0].setup : params.get('arrangement') === 'tow' ? tow : DEFAULT_TWO_BODY, key: 0 });
  const select = (x: string | null) => { const e = tbExperimentById(x); setParams(x ? { experiment: x } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_TWO_BODY, key: l.key + 1 })); };
  const all = [...TB_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title })), ...PAIR_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title }))];
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="forces-interactions">
      <GlobalHeader />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
          <Link to="/physics/forces" className="inline-flex items-center min-h-[44px] hover:text-sky-400">How Forces Affect Motion</Link><span>/</span>
          <span className="text-sky-300 font-bold">Interactions Laboratory</span>
        </nav>
        <header className="space-y-2">
          <h1 className="text-3xl font-black text-white">Interactions Laboratory</h1>
          <p className="text-sm text-slate-300 max-w-3xl">Two objects interact: each exerts a force on the other. Push two carts apart, change the masses and see that the two forces are equal and opposite while the accelerations differ. Free exploration: nothing to unlock.</p>
        </header>

        {!pairExp && <section aria-label="Two carts"><TwoBodyView key={`${tb?.id ?? 'free'}-${load.key}`} initial={load.setup} editable /></section>}

        <section aria-label="Guided investigations" className="space-y-3">
          <h2 className="text-xl font-black text-white">Guided investigations (optional)</h2>
          <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={!id} onClick={() => select(null)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${!id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={!id ? { borderColor: PHYS.position } : undefined}>{!id ? '✓ ' : ''}Free exploration</button>
            {all.map((x) => <button key={x.id} type="button" aria-pressed={id === x.id} data-experiment={x.id} onClick={() => select(x.id)} className={`min-h-[44px] px-4 rounded-xl border-2 text-sm font-bold ${id === x.id ? 'bg-surface-elevated text-white' : 'bg-surface-card border-surface-border text-slate-300'}`} style={id === x.id ? { borderColor: PHYS.prediction } : undefined}>{id === x.id ? '✓ ' : ''}{x.id}. {x.title}</button>)}
          </div>
          {tb && (
            <div className="space-y-3" data-testid="tb-experiment-panel">
              <div className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" style={{ borderLeft: `4px solid ${PHYS.time}` }}>
                <h3 className="text-lg font-bold text-white">Experiment {tb.id}: {tb.title}</h3>
                <p className="text-sm text-slate-300">{tb.goal} Predict first, set up the experiment, press Play or move the time slider, then compare.</p>
              </div>
              {tb.routes.map((r) => <RoutePanel key={`${tb.id}-${r.id}`} route={r} onRun={(s) => setLoad((l) => ({ setup: s, key: l.key + 1 }))} />)}
              <p className="text-sm text-slate-200 rounded-xl border p-3" style={{ borderColor: `${PHYS.correct}80`, background: `${PHYS.correct}0D` }}><strong style={{ color: PHYS.correct }}>{'✓ '}What to notice: </strong>{tb.lesson}</p>
            </div>
          )}
          {pairExp && id === 'S' && <div className="space-y-3" data-testid="pair-experiment-panel"><div className="rounded-xl border border-surface-border bg-surface-card p-3" style={{ borderLeft: `4px solid ${PHYS.time}` }}><h3 className="text-lg font-bold text-white">Experiment S: {pairExp.title}</h3><p className="text-sm text-slate-300">{pairExp.goal}</p></div><ComparePredict /></div>}
          {pairExp && id !== 'S' && (
            <div className="space-y-3" data-testid="pair-experiment-panel">
              <div className="rounded-xl border border-surface-border bg-surface-card p-3" style={{ borderLeft: `4px solid ${PHYS.time}` }}><h3 className="text-lg font-bold text-white">Experiment {pairExp.id}: {pairExp.title}</h3><p className="text-sm text-slate-300">{pairExp.goal} Look at the forces on each object, choose two forces, then check.</p></div>
              <PairIdentifyView key={pairExp.id} scenarioId={pairExp.scenarios[0]} />
            </div>
          )}
          {!id && <p className="text-sm text-slate-400">Pick an investigation to predict first and compare with the model, or keep exploring freely.</p>}
          <p className="text-xs text-slate-400">These are <em>model</em> results for idealised carts on a frictionless track. The model does not simulate collisions, rebounds or deformation.</p>
        </section>
      </main>
    </div>
  );
};
