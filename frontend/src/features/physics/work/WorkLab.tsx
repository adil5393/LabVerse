/**
 * Work Laboratory Page (/physics/work/lab):
 * Faithful implementation of the Stitch Blender-inspired Scientific Workstation (Workspace V2).
 * 5 Main Regions:
 * 1. Top Application Bar (Brand, Breadcrumbs, Mode Tabs: Learn / Experiment / Analyze / Exercises / Blackboard)
 * 2. Left Scene Outliner / Curriculum Tree (collapsible 260px desktop bay, mobile drawer)
 * 3. Central Simulation Viewport (CAD grid, coordinate axis, vector overlays, dynamic cart, transport dock)
 * 4. Right Properties Inspector (Forces, Object, Environment, Experiment, Advanced Properties)
 * 5. Bottom Analysis Editor (Bento metrics, force calculations table, F-s graph, data, telemetry status bar)
 * Plus: Functional Blackboard Workspace with chalk drawing tools, color swatches & PNG export.
 */

import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  WORK_EXPERIMENTS,
  workExperimentById,
  workRouteOutcome,
  type WorkRoute,
} from '../../../engine/physics/work/experiments';
import { DEFAULT_WORK, type WorkSetup } from '../../../engine/physics/work/workModel';
import { PHYS } from '../motion/physicsColors';
import { WorkView } from './WorkView';
import {
  WorkstationHeader,
  SceneOutliner,
  BlackboardWorkspace,
  MobileInspectorSheet,
  type WorkspaceTab,
  type AnalysisTab,
} from './components';

const RoutePanel: React.FC<{ route: WorkRoute; onRun: (r: WorkRoute) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const out = workRouteOutcome(route);
  const right = choice !== null && choice === out.holdsIndex;

  return (
    <section className="rounded-xl border border-outline-variant bg-surface-container p-4 space-y-4 shadow-sm" data-route={route.id}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <p className="text-sm text-slate-100 font-semibold font-mono">{route.label}</p>
      </div>

      <fieldset className="rounded-xl p-3.5 space-y-2.5 transition-colors border border-amber-400/40 bg-amber-400/5">
        <legend className="px-2 text-xs font-mono uppercase tracking-wider font-bold text-amber-300">
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
              onClick={() => {
                setChoice(i);
                setChecked(false);
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border-2 text-xs font-medium text-left transition-all select-none ${
                choice === i
                  ? 'border-amber-400 bg-amber-400/15 text-white font-bold'
                  : 'border-outline-variant bg-surface-container-high text-slate-300 hover:text-white'
              }`}
            >
              {choice === i ? '● ' : '○ '}
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="rounded-xl p-3.5 space-y-3 border border-sky-400/40 bg-sky-400/5">
        <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-sky-400">
          {'▶'} 2 · Experiment
        </h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onRun(route);
              setRan(true);
            }}
            className="min-h-[44px] px-4 rounded-xl font-bold text-xs bg-sky-400 text-slate-950 transition-all select-none shadow-sm hover:opacity-90 active:scale-[0.98]"
            data-testid={`run-${route.id}`}
          >
            Set up this experiment in workstation
          </button>
          <button
            type="button"
            disabled={choice === null}
            onClick={() => setChecked(true)}
            className="min-h-[44px] px-4 rounded-xl font-bold text-xs bg-amber-400 text-slate-950 disabled:opacity-40 transition-all select-none shadow-sm hover:opacity-90 active:scale-[0.98]"
            data-testid={`check-${route.id}`}
          >
            Check my prediction
          </button>
        </div>
        {ran && (
          <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            The scene is set up in the viewport. Press Play or drag the scrub track to test.
          </p>
        )}
      </div>

      {checked && choice !== null && (
        <div
          role="status"
          aria-live="polite"
          data-testid="work-feedback"
          className={`rounded-xl p-4 text-xs text-slate-100 space-y-2 border ${
            right ? 'border-emerald-500/60 bg-emerald-500/10' : 'border-rose-500/60 bg-rose-500/10'
          }`}
        >
          <h4 className={`text-xs font-mono uppercase tracking-wider font-bold ${right ? 'text-emerald-400' : 'text-rose-400'}`}>
            {right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}
          </h4>
          <p className="leading-relaxed">
            <strong>Model result: </strong>
            {route.explain(out.result)}
          </p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1 font-bold text-slate-400">
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
  const navigate = useNavigate();

  const exp = workExperimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ setup: WorkSetup; key: number }>({
    setup: exp ? exp.routes[0].setup : DEFAULT_WORK,
    key: 0,
  });

  // Workspace Modes: 'experiment' | 'blackboard' | 'analyze' | 'learn' | 'exercises'
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('experiment');
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<AnalysisTab>('measurements');
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const [beginnerMode, setBeginnerMode] = useState(false);

  // Panel collapse states
  const [outlinerCollapsed, setOutlinerCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);

  // Global transport playback state
  const [playing, setPlaying] = useState(false);

  const selectExperiment = (id: string | null) => {
    const e = workExperimentById(id);
    setParams(id ? { experiment: id } : {});
    setLoad((l) => ({ setup: e ? e.routes[0].setup : DEFAULT_WORK, key: l.key + 1 }));
  };

  const handleTabChange = (tab: WorkspaceTab) => {
    if (tab === 'exercises') {
      navigate('/physics/work/exercises');
      return;
    }
    setActiveTab(tab);
    if (tab === 'analyze') {
      setAnalysisExpanded(true);
    } else {
      setAnalysisExpanded(false);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col bg-background text-on-surface antialiased select-none font-sans"
      data-chapter="work-lab"
    >
      {/* 1. TOP WORKSPACE APPLICATION BAR (Stitch Blender-inspired header) */}
      <WorkstationHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        beginnerMode={beginnerMode}
        onToggleBeginnerMode={setBeginnerMode}
        onReset={() => {
          setPlaying(false);
          setLoad((l) => ({ ...l, key: l.key + 1 }));
        }}
        onTogglePlay={() => setPlaying((p) => !p)}
        playing={playing}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
      />

      {/* 2. MAIN WORKSPACE VIEWPORT BODY */}
      <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100vh-40px)]">
        {/* WORKSPACE MODE: BLACKBOARD */}
        {activeTab === 'blackboard' ? (
          <BlackboardWorkspace
            onReturnToExperiment={() => setActiveTab('experiment')}
          />
        ) : activeTab === 'learn' ? (
          /* WORKSPACE MODE: LEARN / POE GUIDED INVESTIGATIONS */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-container-lowest max-w-5xl mx-auto space-y-6">
            <header className="space-y-1 pb-3 border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold bg-primary/20 text-primary border border-primary/40">
                  POE INVESTIGATION LAB
                </span>
                <span className="text-xs font-mono text-outline">Class 9 Physics Chapter 7</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Guided Empirical Investigations
              </h2>
              <p className="text-xs text-slate-300">
                Predict the outcome first, load the parameters into the simulation workstation, observe the results, and understand the work principles.
              </p>
            </header>

            {/* Experiment Selector Tabs */}
            <div role="group" aria-label="Choose an investigation" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={!exp}
                onClick={() => selectExperiment(null)}
                className={`min-h-[44px] px-4 rounded-xl border-2 text-xs font-bold font-mono transition-all select-none ${
                  !exp
                    ? 'bg-surface-elevated text-white border-sky-400 shadow-sm'
                    : 'bg-surface-card border-outline-variant text-slate-300 hover:text-white'
                }`}
              >
                {!exp ? '✓ ' : ''}Free exploration
              </button>
              {WORK_EXPERIMENTS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={exp?.id === x.id}
                  data-experiment={x.id}
                  onClick={() => selectExperiment(x.id)}
                  className={`min-h-[44px] px-4 rounded-xl border-2 text-xs font-bold font-mono transition-all select-none ${
                    exp?.id === x.id
                      ? 'bg-surface-elevated text-white border-amber-400 shadow-sm'
                      : 'bg-surface-card border-outline-variant text-slate-300 hover:text-white'
                  }`}
                >
                  {exp?.id === x.id ? '✓ ' : ''}
                  {x.id}. {x.title}
                </button>
              ))}
            </div>

            {exp ? (
              <div className="space-y-4" data-testid="work-experiment-panel">
                <div
                  className="rounded-xl border border-outline-variant bg-surface-card p-4 space-y-1 shadow-sm"
                  style={{ borderLeft: `4px solid ${PHYS.time}` }}
                >
                  <h3 className="text-base font-bold text-white">
                    Experiment {exp.id}: {exp.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {exp.goal} Predict first, set up the experiment, press Play, then compare.
                  </p>
                </div>

                <div className="space-y-3">
                  {exp.routes.map((r) => (
                    <RoutePanel
                      key={`${exp.id}-${r.id}`}
                      route={r}
                      onRun={(rr) => {
                        setLoad((l) => ({ setup: rr.setup, key: l.key + 1 }));
                        setActiveTab('experiment');
                      }}
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
              </div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-outline-variant text-center space-y-2">
                <p className="text-sm text-slate-300 font-mono">
                  Pick an investigation above to follow structured Predict-Experiment-Observe-Explain steps.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('experiment')}
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-mono text-xs font-bold"
                >
                  Switch to Free Experiment Workstation
                </button>
              </div>
            )}
          </div>
        ) : (
          /* WORKSPACE MODE: EXPERIMENT & ANALYZE (Primary 5-Region Workstation) */
          <>
            {/* Left Outliner / Curriculum Explorer (Desktop) */}
            <div className="hidden md:flex h-full relative">
              {!outlinerCollapsed ? (
                <SceneOutliner
                  cartMassKg={load.setup.massKg}
                  trackLengthM={12}
                  onToggleCollapse={() => setOutlinerCollapsed(true)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setOutlinerCollapsed(false)}
                  className="w-7 h-full bg-surface-container border-r border-outline-variant flex flex-col items-center py-2 text-outline hover:text-white transition-colors"
                  title="Expand Scene Outliner"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  <span className="font-mono text-[9px] uppercase [writing-mode:vertical-lr] tracking-wider mt-2">
                    Outliner
                  </span>
                </button>
              )}
            </div>

            {/* Primary Simulation Workstation Area (Viewport + Properties + Analysis) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
              {/* Optional Active Experiment POE Banner (when an investigation is selected) */}
              {exp && (
                <div className="bg-surface-container px-3 py-1.5 border-b border-outline-variant flex items-center justify-between text-xs font-mono z-20 shrink-0">
                  <div className="flex items-center space-x-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-primary font-bold">Investigation {exp.id}:</span>
                    <span className="text-white truncate">{exp.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('learn')}
                    className="px-2 py-0.5 rounded bg-surface-container-high border border-outline-variant text-primary text-[11px] hover:text-white"
                  >
                    View POE Steps
                  </button>
                </div>
              )}

              {/* WorkView Visual Workstation Component */}
              <WorkView
                key={`${exp?.id ?? 'free'}-${load.key}`}
                initial={load.setup}
                editable
                graph
                activeAnalysisTab={activeAnalysisTab}
                onAnalysisTabChange={setActiveAnalysisTab}
                analysisExpanded={analysisExpanded}
                onToggleAnalysisExpand={() => setAnalysisExpanded(!analysisExpanded)}
              />

              {/* Mobile Floating Inspector CTA (390px reference) */}
              <div className="md:hidden fixed bottom-14 right-3 z-40">
                <button
                  type="button"
                  onClick={() => setMobileInspectorOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-full bg-primary text-on-primary font-mono text-xs font-bold shadow-2xl border border-primary-light active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>Inspect Properties</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Slide-Out Drawer for Scene Outliner */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/60 backdrop-blur-xs select-none">
          <div className="w-[280px] h-full bg-surface-container-low shadow-2xl">
            <SceneOutliner
              onCloseMobile={() => setMobileDrawerOpen(false)}
              cartMassKg={load.setup.massKg}
              trackLengthM={12}
            />
          </div>
          <div
            className="flex-1 h-full"
            onClick={() => setMobileDrawerOpen(false)}
          />
        </div>
      )}

      {/* Mobile Inspector Bottom Sheet Modal */}
      <MobileInspectorSheet
        isOpen={mobileInspectorOpen}
        onClose={() => setMobileInspectorOpen(false)}
        setup={load.setup}
        result={workRouteOutcome(exp ? exp.routes[0] : { id: 'free', label: '', prompt: '', options: [], setup: load.setup, explain: () => '' }).result}
        onChange={(patch) => {
          setLoad((l) => ({ setup: { ...l.setup, ...patch }, key: l.key + 1 }));
        }}
        showVertical={true}
        onShowVerticalChange={() => {}}
      />
    </div>
  );
};
