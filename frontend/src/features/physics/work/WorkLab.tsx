/**
 * Work Laboratory page (/physics/work/lab): Scientific Workstation environment for Free Exploration
 * and five guided investigations A to E. Follows Predict, Experiment, Observe, Explain (POE).
 * Powered by a kinematic work model where the user prescribes displacement and investigates force work.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { WORK_EXPERIMENTS, workExperimentById, workRouteOutcome, type WorkRoute } from '../../../engine/physics/work/experiments';
import { DEFAULT_WORK, type WorkSetup } from '../../../engine/physics/work/workModel';
import { PHYS } from '../motion/physicsColors';
import { WorkView } from './WorkView';

const RoutePanel: React.FC<{ route: WorkRoute; onRun: (r: WorkRoute) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const out = workRouteOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;

  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-4 shadow-sm" data-route={route.id}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <p className="text-sm text-slate-100 font-semibold">{route.label}</p>
      </div>

      <fieldset className="rounded-xl p-3.5 space-y-2.5 transition-colors" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <legend className="px-2 text-xs font-mono uppercase tracking-wider font-bold" style={{ color: PHYS.prediction }}>
          {'★'} 1 · Predict
        </legend>
        <p className="text-sm text-slate-200">{route.prompt}</p>
        <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2 pt-1">
          {route.options.map((o, i) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={choice === i}
              data-option={`${route.id}-${i}`}
              onClick={() => { setChoice(i); setChecked(false); }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-xs font-medium text-left transition-all select-none hover:bg-surface-elevated/60"
              style={{
                borderColor: choice === i ? PHYS.prediction : '#334155',
                color: '#e2e8f0',
                backgroundColor: choice === i ? `${PHYS.prediction}1F` : undefined,
              }}
            >
              {choice === i ? '● ' : '○ '}{o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-xl p-3.5 space-y-3 transition-colors" style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: PHYS.position }}>
          {'▶'} 2 · Experiment
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => { onRun(route); setRan(true); }}
            className="min-h-[44px] px-4 rounded-xl font-bold text-xs text-slate-950 transition-all select-none shadow-sm hover:opacity-90 active:scale-[0.98]"
            style={{ background: PHYS.position }}
            data-testid={`run-${route.id}`}
          >
            Set up this experiment above
          </button>
          <button
            type="button"
            disabled={choice === null}
            onClick={() => setChecked(true)}
            className="min-h-[44px] px-4 rounded-xl font-bold text-xs text-slate-950 disabled:opacity-40 transition-all select-none shadow-sm hover:opacity-90 active:scale-[0.98]"
            style={{ background: PHYS.prediction }}
            data-testid={`check-${route.id}`}
          >
            Check my prediction
          </button>
        </div>
        {ran && (
          <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            The scene above is set up. Press Play, or drag the position slider, then compare.
          </p>
        )}
      </div>

      {checked && choice !== null && (
        <div
          role="status"
          aria-live="polite"
          data-testid="work-feedback"
          className="rounded-xl p-4 text-xs text-slate-100 space-y-2 shadow-inner"
          style={{
            border: `1px solid ${right ? PHYS.correct : PHYS.error}`,
            background: `${right ? PHYS.correct : PHYS.error}14`,
          }}
        >
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold" style={{ color: right ? PHYS.correct : PHYS.error }}>
            {right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}
          </h4>
          <p className="leading-relaxed"><strong>Model result: </strong>{route.explain(out.result)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1 font-bold" style={{ color: PHYS.time }}>
            4 · Explain
          </h4>
          <p className="leading-relaxed">
            {right
              ? route.options[choice].why
              : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}
          </p>
        </div>
      )}
    </section>
  );
};

export const WorkLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = workExperimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ setup: WorkSetup; key: number }>({
    setup: exp ? exp.routes[0].setup : DEFAULT_WORK,
    key: 0,
  });

  const select = (id: string | null) => {
    const e = workExperimentById(id);
    setParams(id ? { experiment: id } : {});
    setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_WORK, key: l.key + 1 }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter="work-lab">
      <GlobalHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
          <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400 transition-colors">
            Subject Explorer
          </Link>
          <span>/</span>
          <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400 transition-colors">
            Physics
          </Link>
          <span>/</span>
          <Link to="/physics/work" className="inline-flex items-center min-h-[44px] hover:text-sky-400 transition-colors">
            Work, Energy, and Simple Machines
          </Link>
          <span>/</span>
          <span className="text-sky-300 font-bold bg-sky-950/40 px-2 py-0.5 rounded border border-sky-800/50">
            Work Laboratory
          </span>
        </nav>

        {/* Workstation Header */}
        <header className="space-y-2 pb-2 border-b border-surface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  SCIENTIFIC WORKSTATION // V2
                </span>
                <span className="text-xs font-mono text-slate-400">Class 9 Physics Chapter 7</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
                Work Laboratory
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Kinematic Model Ready
              </span>
            </div>
          </div>
          <p className="text-sm text-slate-300 max-w-4xl leading-relaxed">
            Configure forces and prescribed displacements to compute the signed work of each force, evaluate net energy changes,
            and inspect force-displacement relationships. Freely explore or engage with guided POE investigations below.
          </p>
        </header>

        {/* Primary Scientific Workstation */}
        <section aria-label="The experiment">
          <WorkView
            key={`${exp?.id ?? 'free'}-${load.key}`}
            initial={load.setup}
            editable
            graph
          />
        </section>

        {/* Guided Investigations Section */}
        <section aria-label="Guided investigations" className="space-y-4 pt-4 border-t border-surface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Guided Investigations</span>
                <span className="text-xs font-mono font-normal text-slate-400 bg-surface-elevated px-2 py-0.5 rounded border border-surface-border">
                  Optional POE Workflows
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Predict first, test on the workstation, observe empirical model outputs, and understand the physical principles.
              </p>
            </div>
          </div>

          <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={!exp}
              onClick={() => select(null)}
              className={`min-h-[44px] px-4 rounded-xl border-2 text-xs font-bold transition-all select-none ${
                !exp
                  ? 'bg-surface-elevated text-white shadow-sm ring-1 ring-sky-500/30'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:text-white hover:bg-surface-elevated'
              }`}
              style={!exp ? { borderColor: PHYS.position } : undefined}
            >
              {!exp ? '✓ ' : ''}Free exploration
            </button>
            {WORK_EXPERIMENTS.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={exp?.id === x.id}
                data-experiment={x.id}
                onClick={() => select(x.id)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-xs font-bold transition-all select-none ${
                  exp?.id === x.id
                    ? 'bg-surface-elevated text-white shadow-sm ring-1 ring-amber-500/30'
                    : 'bg-surface-card border-surface-border text-slate-300 hover:text-white hover:bg-surface-elevated'
                }`}
                style={exp?.id === x.id ? { borderColor: PHYS.prediction } : undefined}
              >
                {exp?.id === x.id ? '✓ ' : ''}
                {x.id}. {x.title}
              </button>
            ))}
          </div>

          {exp ? (
            <div className="space-y-4 pt-2" data-testid="work-experiment-panel">
              <div
                className="rounded-xl border border-surface-border bg-surface-card p-4 space-y-1 shadow-sm"
                style={{ borderLeft: `4px solid ${PHYS.time}` }}
              >
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Experiment {exp.id}: {exp.title}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {exp.goal} Predict first, set up the experiment, press Play, then compare. Afterwards change any setting and repeat.
                </p>
              </div>

              <div className="space-y-3">
                {exp.routes.map((r) => (
                  <RoutePanel
                    key={`${exp.id}-${r.id}`}
                    route={r}
                    onRun={(rr) => setLoad((l) => ({ setup: rr.setup, key: l.key + 1 }))}
                  />
                ))}
              </div>

              <div
                className="text-xs text-slate-200 rounded-xl border p-4 space-y-1 shadow-sm"
                style={{ borderColor: `${PHYS.correct}80`, background: `${PHYS.correct}0D` }}
              >
                <p>
                  <strong style={{ color: PHYS.correct }}>{'✓ '}What to notice: </strong>
                  {exp.lesson}
                </p>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                These are <em>model</em> results for constant forces and a prescribed displacement (a kinematic work model); a simulation shows what the model does, it is not a proof.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed border-surface-border text-center text-xs text-slate-400">
              Pick an investigation above to predict first and compare with the model, or freely configure parameters in the workstation.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
