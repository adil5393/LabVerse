/**
 * Simple Machines Laboratory (/physics/work/machines) and Power Laboratory (/physics/work/power) pages (PHY-3D). Free exploration
 * (no gates) with optional guided investigations: Predict, Experiment, Observe, Explain. Outcomes come from the models that draw the scenes.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP } from '../../../engine/physics/work/machines';
import { LEVER_EXPERIMENTS, leverOutcome, PULLEY_EXPERIMENTS, pulleyOutcome, RAMP_EXPERIMENTS, rampOutcome } from '../../../engine/physics/work/machineExperiments';
import { DEFAULT_POWER } from '../../../engine/physics/work/power';
import { POWER_EXPERIMENTS, powerExperimentById, powerOutcome } from '../../../engine/physics/work/powerExperiments';
import { PHYS } from '../motion/physicsColors';
import { LeverView, PulleyView, RampView } from './MachineViews';
import { PowerView } from './PowerView';

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

type Apparatus = 'ramp' | 'pulley' | 'lever';
import { WorkspaceShell } from '../../workspace';

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

  // Outliner: Apparatus switch & Investigation presets
  const outlinerContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Select Apparatus</span>
        <div role="tablist" aria-label="Choose a machine" className="grid grid-cols-1 gap-1.5 mt-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={app === t.id}
              data-apparatus={t.id}
              onClick={() => { set(t.id, null); reload(); }}
              className={`min-h-[38px] text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
                app === t.id
                  ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t.label}</span>
                {app === t.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
          <span className="text-[11px] font-mono text-primary font-bold">{exps.length} Total</span>
        </div>
        <div className="space-y-1.5">
          <Pick exps={exps} current={exp?.id} onPick={choose} />
        </div>
      </div>
    </div>
  );

  // Inspector: Machine principles and derivations
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Machine Laws</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Golden Rule of Mechanics</p>
            <p className="text-[10px] leading-relaxed">
              Work Input = Work Output + Losses. A machine never reduces total work needed.
            </p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Mechanical Advantage (MA)</p>
            <p className="text-[10px]">MA = Load Force &divide; Effort Force</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Reference Derivations</span>
        <div className="space-y-1 text-xs text-slate-300" data-testid="machines-derive-links">
          <p>
            Why does it work?{' '}
            <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=R">
              Derive the ramp relation &rarr;
            </Link>
          </p>
          <p>
            <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=L">
              Derive the lever relation &rarr;
            </Link>
          </p>
        </div>
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

  // Viewport: Machine canvas
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="machines-lab">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        {app === 'ramp' && <RampView key={`r-${key}`} initial={ramp} editable />}
        {app === 'pulley' && <PulleyView key={`p-${key}`} initial={pulley} editable />}
        {app === 'lever' && <LeverView key={`l-${key}`} initial={lever} editable />}
      </div>
    </div>
  );

  // Analysis Dock: POE investigations
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-3 font-sans">
      {exp ? (
        <div className="space-y-3" data-testid="machine-experiment-panel">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
            <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
            <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
          </div>
          {app === 'ramp' && RAMP_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={rampOutcome(r)} onRun={(s) => { setRamp(s); reload(); }} tag="machine" />)}
          {app === 'pulley' && PULLEY_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={pulleyOutcome(r)} onRun={(s) => { setPulley(s); reload(); }} tag="machine" />)}
          {app === 'lever' && LEVER_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={leverOutcome(r)} onRun={(s) => { setLever(s); reload(); }} tag="machine" />)}
          <p className="text-xs text-slate-400">
            Model results for ideal or explicitly modelled machines; simulation demonstrates exact equilibrium and energy conservation.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant space-y-1">
          <span className="material-symbols-outlined text-3xl text-outline">precision_manufacturing</span>
          <p className="font-mono text-xs text-slate-300">
            Free Exploration Mode: Choose an inclined plane, pulley, or lever above.
          </p>
          <p className="text-[11px] text-outline">
            Machines alter force and displacement tradeoffs, but work input always matches or exceeds work output.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Simple Machines Laboratory"
      outlinerTitle="Apparatus & Routes"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Machine Properties"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & POE"
      analysisDock={analysisDockContent}
    />
  );
};

export const PowerLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = powerExperimentById(params.get('experiment'));
  const [load, setLoad] = useState({ setup: exp ? exp.routes[0].setup : DEFAULT_POWER, key: 0 });
  const choose = (id: string | null) => { const e = powerExperimentById(id); setParams(id ? { experiment: id } : {}); setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_POWER, key: l.key + 1 })); };

  // Outliner: Guided investigations
  const outlinerContent = (
    <div className="p-3 space-y-3 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-outline-variant">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Investigations</span>
        <span className="text-[11px] font-mono text-primary font-bold">{POWER_EXPERIMENTS.length} Total</span>
      </div>
      <div className="space-y-1.5">
        <Pick exps={POWER_EXPERIMENTS} current={exp?.id} onPick={choose} />
      </div>
    </div>
  );

  // Inspector: Power definitions and derivations
  const inspectorContent = (
    <div className="p-3 space-y-4 text-xs font-sans">
      <div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Power Principles</span>
        <div className="mt-2 space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Rate of Doing Work</p>
            <p>P = W &divide; t = &Delta;E &divide; &Delta;t</p>
          </div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]">
            <p className="font-bold text-white mb-1">Standard SI Unit</p>
            <p>1 Watt (W) = 1 Joule per second (J/s)</p>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-outline-variant space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Reference Derivations</span>
        <p className="text-xs text-slate-300" data-testid="power-derive-link">
          Why is power W &divide; t?{' '}
          <Link className="underline text-sky-400 hover:text-sky-300 font-medium" to="/physics/work/derivations?d=P">
            Work through the explanation &rarr;
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

  // Viewport: PowerView
  const viewportContent = (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 space-y-4" data-chapter="power-lab">
      <div className="bg-surface-card rounded-2xl border border-surface-border p-4 shadow-inner">
        <PowerView key={`${exp?.id ?? 'free'}-${load.key}`} initial={load.setup} editable />
      </div>
    </div>
  );

  // Analysis Dock: POE investigations
  const analysisDockContent = (
    <div className="p-3 text-xs space-y-3 font-sans">
      {exp ? (
        <div className="space-y-3" data-testid="power-experiment-panel">
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
            <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
            <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
          </div>
          {exp.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={powerOutcome(r)} onRun={(s) => setLoad((l) => ({ setup: s, key: l.key + 1 }))} tag="power" />)}
          <p className="text-xs text-slate-400">
            Model results for the average power; power measures how quickly energy is transferred or transformed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-on-surface-variant space-y-1">
          <span className="material-symbols-outlined text-3xl text-outline">bolt</span>
          <p className="font-mono text-xs text-slate-300">
            Free Exploration Mode: Adjust work and time to observe the resulting mechanical power.
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
      labTitle="Power Laboratory"
      outlinerTitle="Investigations"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Power Properties"
      inspector={inspectorContent}
      analysisDockTitle="Analysis & POE"
      analysisDock={analysisDockContent}
    />
  );
};
