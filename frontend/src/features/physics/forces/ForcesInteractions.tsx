/**
 * Interactions page (/physics/forces/interactions): the two-body laboratory and the force-pair activities (PHY-2D).
 * Investigations P and Q use the two-body model (Predict → Experiment → Observe → Explain); R, S and T work with force pairs.
 * The Free Laboratory (two carts, all settings) is always available above the investigations. No gates.
 */

import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

import { WorkspaceShell } from '../../workspace';

export const ForcesInteractions: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const id = params.get('experiment');
  const tb: TbExperiment | undefined = tbExperimentById(id);
  const pairExp = PAIR_EXPERIMENTS.find((e) => e.id === id);
  const tow: TwoBodySetup = { mode: 'tow', massA: 2, massB: 3, force: 10, uA: 0, uB: 0, durationS: 3 };
  const [load, setLoad] = useState<{ setup: TwoBodySetup; key: number }>({ setup: tb ? tb.routes[0].setup : params.get('arrangement') === 'tow' ? tow : DEFAULT_TWO_BODY, key: 0 });
  const select = (x: string | null) => { const e = tbExperimentById(x); setParams(x ? { experiment: x } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_TWO_BODY, key: l.key + 1 })); };
  const all = [...TB_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title })), ...PAIR_EXPERIMENTS.map((e) => ({ id: e.id, title: e.title }))];

  // Outliner: Investigation Selector
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
        <span className="text-[11px] font-mono text-primary font-bold">{all.length} Total</span>
      </div>
      <div role="group" aria-label="Choose an investigation" className="flex flex-col gap-1.5">
        <button
          type="button"
          aria-pressed={!id}
          onClick={() => select(null)}
          className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
            !id
              ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
              : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">{!id ? 'check_circle' : 'science'}</span>
            <span>Free Exploration</span>
          </div>
        </button>
        {all.map((x) => (
          <button
            key={x.id}
            type="button"
            aria-pressed={id === x.id}
            data-experiment={x.id}
            onClick={() => select(x.id)}
            className={`min-h-[38px] w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              id === x.id
                ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{x.id}. {x.title}</span>
              {id === x.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Inspector: Third law principles
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Newton&apos;s Third Law</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Action &amp; Reaction</p>
            <p>F<sub>A on B</sub> = &minus;F<sub>B on A</sub></p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Two Different Bodies</p>
            <p className="text-[10px] leading-relaxed">
              Action and reaction forces never act on the same object, so they never cancel each other out.
            </p>
          </div>
        </div>
      </div>

      {tb && (
        <div className="pt-2 border-t border-outline-variant space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigation {tb.id}</span>
          <div className="p-2.5 rounded bg-surface-card border border-surface-border space-y-1.5">
            <h4 className="font-bold text-white text-xs">{tb.title}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{tb.goal}</p>
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
              <strong>Notice:</strong> {tb.lesson}
            </div>
          </div>
        </div>
      )}

      {pairExp && (
        <div className="pt-2 border-t border-outline-variant space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Pair Study {pairExp.id}</span>
          <div className="p-2.5 rounded bg-surface-card border border-surface-border space-y-1.5">
            <h4 className="font-bold text-white text-xs">{pairExp.title}</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{pairExp.goal}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Viewport: Simulation / Interaction Canvas
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="forces-interactions">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        {!pairExp && <TwoBodyView key={`${tb?.id ?? 'free'}-${load.key}`} initial={load.setup} editable />}
        {pairExp && id === 'S' && <ComparePredict />}
        {pairExp && id !== 'S' && <PairIdentifyView key={pairExp.id} scenarioId={pairExp.scenarios[0]} />}
      </div>
    </div>
  );

  // Analysis Dock: POE investigations
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-3 font-sans">
      {tb && (
        <div className="space-y-3" data-testid="tb-experiment-panel">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
            <span className="text-primary font-bold">Experiment {tb.id}: {tb.title}</span>
            <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
          </div>
          {tb.routes.map((r) => <RoutePanel key={`${tb.id}-${r.id}`} route={r} onRun={(s) => setLoad((l) => ({ setup: s, key: l.key + 1 }))} />)}
          <p className="text-xs text-slate-400">
            Model results for idealised carts on a frictionless track; equal mutual forces with accelerations inversely proportional to masses.
          </p>
        </div>
      )}

      {pairExp && (
        <div className="space-y-2" data-testid="pair-experiment-panel">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
            <span className="text-primary font-bold">Experiment {pairExp.id}: {pairExp.title}</span>
            <span className="text-outline">Free-Body Diagram Analysis</span>
          </div>
          <p className="text-slate-300 text-xs">
            Look at the forces on each object, verify that third-law pairs are equal in magnitude, opposite in direction, and act on separate entities.
          </p>
        </div>
      )}

      {!id && (
        <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant space-y-1">
          <span className="material-symbols-outlined text-3xl text-outline">compare_arrows</span>
          <p className="font-mono text-xs text-slate-300">
            Free Exploration Mode: Two interacting carts on a frictionless horizontal track.
          </p>
          <p className="text-[11px] text-outline">
            Choose an investigation in the left Explorer to test predictions against Newton&apos;s Third Law.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="forces"
      labTitle="Two-Body Interactions"
      outlinerTitle="Interactions & Pairs"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Interaction Inspector"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & POE"
      analysisDock={analysisDockContent}
    />
  );
};
