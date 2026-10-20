/**
 * Simple Machines Laboratory (/physics/work/machines) and Power Laboratory (/physics/work/power) pages (PHY-3D): the Blender-style
 * workstation. Free exploration (no gates) with optional guided investigations: Predict, Experiment, Observe, Explain. The
 * apparatus parts are scene objects you can select, hide, lock and (where it makes sense) drag; outcomes come from the models
 * that draw the scenes.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP, LEVER_LIMITS, PULLEY_LIMITS, RAMP_LIMITS, type LeverSetup, type PulleySetup, type RampSetup } from '../../../engine/physics/work/machines';
import { LEVER_EXPERIMENTS, leverOutcome, PULLEY_EXPERIMENTS, pulleyOutcome, RAMP_EXPERIMENTS, rampOutcome } from '../../../engine/physics/work/machineExperiments';
import { computePower, DEFAULT_POWER, POWER_LIMITS, type PowerScenario, type PowerSetup } from '../../../engine/physics/work/power';
import { POWER_EXPERIMENTS, powerExperimentById, powerOutcome } from '../../../engine/physics/work/powerExperiments';
import { PHYS } from '../motion/physicsColors';
import { LeverView, PulleyView, RampView } from './MachineViews';
import { PowerView } from './PowerView';
import {
  DockTabs,
  LabOutliner,
  ViewportFrame,
  WorkspaceShell,
  useLabSetup,
  useSceneState,
  useTimedPlayback,
  useUndoShortcuts,
  type DockTab,
  type SceneObject,
} from '../../workspace';
import { LabButton, LabInspectorSection, LabParameterField, LabSegmentedControl } from '../../workspace/controls';

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

interface AnyExp { id: string; title: string; goal: string; lesson: string; routes: { setup: unknown }[] }

type Apparatus = 'ramp' | 'pulley' | 'lever';
const APPARATUS: { id: Apparatus; label: string; icon: string }[] = [
  { id: 'ramp', label: 'Inclined plane', icon: 'trending_up' },
  { id: 'pulley', label: 'Pulley', icon: 'settings' },
  { id: 'lever', label: 'Lever', icon: 'balance' },
];

const SCENE: Record<Apparatus, SceneObject[]> = {
  ramp: [
    { id: 'load', name: 'LOAD_01', category: 'Object / Dynamics', icon: 'inventory_2' },
    { id: 'incline', name: 'RAMP_01', category: 'Machine / Inclined plane', icon: 'trending_up' },
  ],
  pulley: [
    { id: 'load', name: 'LOAD_01', category: 'Object / Dynamics', icon: 'inventory_2' },
    { id: 'pulley', name: 'PULLEY_01', category: 'Machine / Pulley system', icon: 'settings' },
  ],
  lever: [
    { id: 'fulcrum', name: 'FULCRUM', category: 'Machine / Pivot', icon: 'change_history' },
    { id: 'load', name: 'LOAD_01', category: 'Object / Dynamics', icon: 'inventory_2' },
    { id: 'effort', name: 'EFFORT_01', category: 'Vector / Force', icon: 'arrow_downward' },
  ],
};
const MACHINE_IDS = ['load', 'incline', 'pulley', 'fulcrum', 'effort'];
const ICON = (name: string) => <span className="material-symbols-outlined text-[15px]">{name}</span>;
const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');
/** The apparatus animations take this many seconds of simulated time. */
const RUN_SECONDS = 3;

export const MachinesLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const app = (APPARATUS.find((t) => t.id === params.get('apparatus'))?.id ?? 'ramp') as Apparatus;
  const expId = params.get('experiment');
  const ramp = useLabSetup<RampSetup>(DEFAULT_RAMP, { shortcuts: false });
  const pulley = useLabSetup<PulleySetup>(DEFAULT_PULLEY, { shortcuts: false });
  const lever = useLabSetup<LeverSetup>(DEFAULT_LEVER, { shortcuts: false });
  const scene = useSceneState(MACHINE_IDS);
  const playback = useTimedPlayback(RUN_SECONDS);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const p = playback.t / RUN_SECONDS;
  const active = app === 'ramp' ? ramp : app === 'pulley' ? pulley : lever;

  const exps = (app === 'ramp' ? RAMP_EXPERIMENTS : app === 'pulley' ? PULLEY_EXPERIMENTS : LEVER_EXPERIMENTS) as unknown as AnyExp[];
  const exp = exps.find((e) => e.id === expId);

  const setRoute = (a: Apparatus, e: string | null) => setParams(e ? { apparatus: a, experiment: e } : { apparatus: a });
  const pickApparatus = (a: Apparatus) => { setRoute(a, null); playback.reset(); scene.select(null); };
  const choose = (id: string | null) => {
    const e = exps.find((x) => x.id === id);
    setRoute(app, id);
    if (app === 'ramp') ramp.replace(e ? (e.routes[0].setup as RampSetup) : DEFAULT_RAMP);
    else if (app === 'pulley') pulley.replace(e ? (e.routes[0].setup as PulleySetup) : DEFAULT_PULLEY);
    else lever.replace(e ? (e.routes[0].setup as LeverSetup) : DEFAULT_LEVER);
    playback.reset();
  };

  /** Every edit returns the machine to the start, so the drawing always matches the numbers. */
  const editRamp = (o: Partial<RampSetup>) => { ramp.change(o); playback.reset(); };
  const editPulley = (o: Partial<PulleySetup>) => { pulley.change(o); playback.reset(); };
  const editLever = (o: Partial<LeverSetup>) => { lever.change(o); playback.reset(); };
  const undo = () => { active.undo(); playback.reset(); };
  const redo = () => { active.redo(); playback.reset(); };
  useUndoShortcuts(undo, redo);

  const interaction = { selectedId: scene.selectedId, onSelect: scene.select, locks: scene.lockMap, visibility: scene.visibility };
  const locked = (id: string) => scene.isLocked(id);
  const sel = (id: string) => scene.selectedId === id;

  const outlinerContent = (
    <div>
      <div className="p-3 pb-0 text-xs font-sans">
        <span className="text-[10px] font-mono uppercase tracking-wider text-outline">Select Apparatus</span>
        <div role="tablist" aria-label="Choose a machine" className="grid grid-cols-1 gap-1.5 mt-2">
          {APPARATUS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={app === t.id} data-apparatus={t.id} onClick={() => pickApparatus(t.id)}
              className={`min-h-[38px] text-left px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${app === t.id ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm' : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'}`}>
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="material-symbols-outlined text-sm">{t.icon}</span>{t.label}</span>
                {app === t.id && <span className="material-symbols-outlined text-sm text-primary">check</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
      <LabOutliner
        investigations={exps.map((x) => ({ id: x.id, title: x.title, goal: x.goal }))}
        activeInvestigationId={exp?.id ?? null}
        onSelectInvestigation={choose}
        objects={SCENE[app]}
        selectedId={scene.selectedId}
        onSelect={scene.select}
        visibility={scene.visibility}
        onToggleVisibility={scene.toggleVisibility}
        lockMap={scene.lockMap}
        onToggleLock={scene.toggleLock}
      />
    </div>
  );

  const field = (id: string, label: string, symbol: string, unit: string, step: number, min: number, max: number, value: number, on: (v: number) => void, off: boolean) => (
    <LabParameterField id={id} label={label} symbol={symbol} unit={unit} compact step={step} min={min} max={max} value={value} disabled={off} onChange={on} />
  );

  const rp = ramp.setup, pp = pulley.setup, lp = lever.setup;
  const apparatusSections = app === 'ramp' ? (
    <>
      <LabInspectorSection title="Object · LOAD_01" icon={ICON('inventory_2')} selected={sel('load')} locked={locked('load')}>
        {field('mass', 'Load mass', 'm', 'kg', 5, RAMP_LIMITS.massMin, RAMP_LIMITS.massMax, rp.massKg, (v) => editRamp({ massKg: v }), locked('load'))}
      </LabInspectorSection>
      <LabInspectorSection title="Machine · RAMP_01" icon={ICON('trending_up')} selected={sel('incline')} locked={locked('incline')}>
        {field('height', 'Height', 'h', 'm', 0.5, RAMP_LIMITS.heightMin, RAMP_LIMITS.heightMax, rp.height, (v) => editRamp({ height: v }), locked('incline'))}
        {field('length', 'Ramp length', 'L', 'm', 1, rp.height, RAMP_LIMITS.lengthMax, rp.length, (v) => editRamp({ length: v }), locked('incline'))}
        {field('mu', 'Friction coefficient', 'μ', '', 0.1, 0, RAMP_LIMITS.muMax, rp.mu, (v) => editRamp({ mu: Math.round(v * 100) / 100 }), locked('incline'))}
        {!beginnerMode && field('g', 'g', 'g', 'm/s²', 1, 1, 30, rp.g, (v) => editRamp({ g: v }), locked('incline'))}
        <p className="text-[11px] text-slate-400">Drag the round handle at the top of the ramp in the scene to change the height.</p>
      </LabInspectorSection>
    </>
  ) : app === 'pulley' ? (
    <>
      <LabInspectorSection title="Object · LOAD_01" icon={ICON('inventory_2')} selected={sel('load')} locked={locked('load')}>
        {field('mass', 'Load mass', 'm', 'kg', 5, PULLEY_LIMITS.massMin, PULLEY_LIMITS.massMax, pp.massKg, (v) => editPulley({ massKg: v }), locked('load'))}
        {field('lift', 'Lift', 'h', 'm', 0.5, PULLEY_LIMITS.liftMin, PULLEY_LIMITS.liftMax, pp.lift, (v) => editPulley({ lift: v }), locked('load'))}
      </LabInspectorSection>
      <LabInspectorSection title="Machine · PULLEY_01" icon={ICON('settings')} selected={sel('pulley')} locked={locked('pulley')}>
        {field('strands', 'Supporting strands', 'n', '(1 = fixed)', 1, 1, PULLEY_LIMITS.strandsMax, pp.strands, (v) => editPulley({ strands: Math.round(v) }), locked('pulley'))}
        {!beginnerMode && field('block', 'Movable block mass', 'M', 'kg', 1, 0, PULLEY_LIMITS.blockMax, pp.blockKg, (v) => editPulley({ blockKg: v }), locked('pulley'))}
        {!beginnerMode && field('g', 'g', 'g', 'm/s²', 1, 1, 30, pp.g, (v) => editPulley({ g: v }), locked('pulley'))}
      </LabInspectorSection>
    </>
  ) : (
    <>
      <LabInspectorSection title="Machine · FULCRUM" icon={ICON('change_history')} selected={sel('fulcrum')} locked={locked('fulcrum')}>
        <LabSegmentedControl<LeverSetup['kind']> size="sm" columns={3} ariaLabel="Class of lever" disabled={locked('fulcrum')} value={lp.kind} onChange={(k) => editLever({ kind: k })}
          options={[{ value: 'I', label: 'Class I', ariaLabel: 'Class I: fulcrum between' }, { value: 'II', label: 'Class II', ariaLabel: 'Class II: load between' }, { value: 'III', label: 'Class III', ariaLabel: 'Class III: effort between' }]} />
        {!beginnerMode && field('turn', 'Turn', 'φ', '°', 1, 0.5, LEVER_LIMITS.turnMax, lp.turnDeg, (v) => editLever({ turnDeg: v }), locked('fulcrum'))}
        {!beginnerMode && field('g', 'g', 'g', 'm/s²', 1, 1, 30, lp.g, (v) => editLever({ g: v }), locked('fulcrum'))}
      </LabInspectorSection>
      <LabInspectorSection title="Object · LOAD_01" icon={ICON('inventory_2')} selected={sel('load')} locked={locked('load')}>
        {field('load', 'Load', 'm', 'kg', 5, LEVER_LIMITS.loadMin, LEVER_LIMITS.loadMax, lp.loadKg, (v) => editLever({ loadKg: v }), locked('load'))}
        {field('loadArm', 'Load arm L₂', 'L₂', 'm', 0.1, LEVER_LIMITS.armMin, LEVER_LIMITS.armMax, lp.loadArm, (v) => editLever({ loadArm: Math.round(v * 100) / 100 }), locked('load'))}
      </LabInspectorSection>
      <LabInspectorSection title="Vector · EFFORT_01" icon={ICON('arrow_downward')} selected={sel('effort')} locked={locked('effort')}>
        {field('effort', 'Effort', 'F₁', 'N', 5, 0, LEVER_LIMITS.effortMax, lp.effort, (v) => editLever({ effort: v }), locked('effort'))}
        {field('effortArm', 'Effort arm L₁', 'L₁', 'm', 0.1, LEVER_LIMITS.armMin, LEVER_LIMITS.armMax, lp.effortArm, (v) => editLever({ effortArm: Math.round(v * 100) / 100 }), locked('effort'))}
        <p className="text-[11px] text-slate-400">Drag the round handles on the load and the effort in the scene to change the arms.</p>
      </LabInspectorSection>
    </>
  );

  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="machines-controls">
      {apparatusSections}
      <LabInspectorSection title="Machine laws" icon={ICON('balance')}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Golden rule of mechanics</p><p className="text-[10px] leading-relaxed">Work input = work output + losses. A machine never reduces the total work needed.</p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Mechanical advantage</p><p className="text-[10px]">MA = load force &divide; effort force</p></div>
        </div>
        <div className="space-y-1 text-xs text-slate-300" data-testid="machines-derive-links">
          <p>Why does it work? <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=R">Derive the ramp relation &rarr;</Link></p>
          <p><Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=L">Derive the lever relation &rarr;</Link></p>
        </div>
      </LabInspectorSection>
      {exp && (
        <LabInspectorSection title={`Investigation ${exp.id}: ${exp.title}`} icon={ICON('school')}>
          <p className="text-[11px] text-slate-300 leading-relaxed">{exp.goal}</p>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300"><strong>Notice:</strong> {exp.lesson}</div>
        </LabInspectorSection>
      )}
    </div>
  );

  const runLabel = app === 'ramp' ? 'How far up the ramp' : app === 'pulley' ? 'Pull the rope' : 'Turn the lever (balanced)';
  const transport = (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Run the machine">
      <LabButton type="button" size="sm" variant="primary" onClick={playback.toggle} data-testid="machines-play" className="font-semibold" icon={ICON(playback.playing ? 'pause' : playback.atEnd ? 'replay' : 'play_arrow')}>
        {playback.playing ? 'Pause' : playback.atEnd ? 'Replay' : 'Play'}
      </LabButton>
      <LabButton type="button" size="sm" onClick={playback.reset} data-testid="machines-reset" icon={ICON('restart_alt')}>Back to start</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[200px]">{runLabel}
        <input type="range" min={0} max={1} step={0.01} value={p} onChange={(e) => playback.scrub(Number(e.target.value) * RUN_SECONDS)} aria-label={runLabel} aria-valuetext={`${Math.round(p * 100)} percent`} className="flex-1 min-w-[90px] accent-primary" data-testid="machines-progress" />
        <span className="font-mono text-[11px] w-10 text-right">{Math.round(p * 100)}%</span>
      </label>
    </div>
  );

  const sceneView =
    app === 'ramp' ? <RampView initial={rp} setup={rp} onSetupChange={editRamp} progress={p} part="scene" interaction={interaction} />
    : app === 'pulley' ? <PulleyView initial={pp} setup={pp} onSetupChange={editPulley} progress={p} part="scene" interaction={interaction} />
    : <LeverView initial={lp} setup={lp} onSetupChange={editLever} progress={p} part="scene" interaction={interaction} />;
  const readoutView =
    app === 'ramp' ? <RampView initial={rp} setup={rp} progress={p} part="readout" />
    : app === 'pulley' ? <PulleyView initial={pp} setup={pp} progress={p} part="readout" />
    : <LeverView initial={lp} setup={lp} progress={p} part="readout" />;

  const viewportContent = (
    <ViewportFrame toolbar={transport} footnote="Ideal or explicitly modelled machines: schematic drawings of exact models. Drag the round handles to change the machine.">
      <div className="w-full h-full min-h-0 flex flex-col justify-center gap-3" data-chapter="machines-lab" data-testid="machines-view">{sceneView}</div>
    </ViewportFrame>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="machine-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
      </div>
      {app === 'ramp' && RAMP_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={rampOutcome(r)} onRun={(s) => { ramp.replace(s); playback.reset(); }} tag="machine" />)}
      {app === 'pulley' && PULLEY_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={pulleyOutcome(r)} onRun={(s) => { pulley.replace(s); playback.reset(); }} tag="machine" />)}
      {app === 'lever' && LEVER_EXPERIMENTS.find((x) => x.id === exp.id)!.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={leverOutcome(r)} onRun={(s) => { lever.replace(s); playback.reset(); }} tag="machine" />)}
      <p className="text-xs text-slate-400">Model results for ideal or explicitly modelled machines; the simulation demonstrates exact equilibrium and energy conservation.</p>
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300">
      <p className="font-mono">Free Exploration: choose an inclined plane, a pulley or a lever in the Explorer.</p>
      <p className="text-outline">Machines trade force against distance, but the work you put in is never less than the useful work you get out.</p>
    </div>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: readoutView },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Simple Machines Laboratory"
      outlinerTitle="Apparatus & Routes"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Machine Properties"
      inspector={inspectorContent}
      analysisDock={<DockTabs key={`${app}-${exp?.id ?? 'free'}`} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      playing={playback.playing}
      onTogglePlay={playback.toggle}
      onReset={() => { active.restart(); playback.reset(); }}
      onUndo={undo}
      onRedo={redo}
      canUndo={active.canUndo}
      canRedo={active.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};

const POWER_OBJECTS: SceneObject[] = [
  { id: 'source', name: 'WORK_SOURCE', category: 'Object / Energy transfer', icon: 'bolt' },
  { id: 'clock', name: 'CLOCK', category: 'Measurement / Time', icon: 'timer' },
];

export const PowerLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = powerExperimentById(params.get('experiment'));
  const lab = useLabSetup<PowerSetup>(exp ? exp.routes[0].setup : DEFAULT_POWER);
  const scene = useSceneState(POWER_OBJECTS.map((o) => o.id));
  const [beginnerMode, setBeginnerMode] = useState(false);
  const choose = (id: string | null) => { const e = powerExperimentById(id); setParams(id ? { experiment: id } : {}); lab.replace(e ? e.routes[0].setup : DEFAULT_POWER); };

  const outlinerContent = (
    <LabOutliner
      investigations={POWER_EXPERIMENTS.map((x) => ({ id: x.id, title: x.title, goal: x.goal }))}
      activeInvestigationId={exp?.id ?? null}
      onSelectInvestigation={choose}
      objects={POWER_OBJECTS}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const s = lab.setup;
  const L = POWER_LIMITS;
  const power = computePower(s);
  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="power-controls">
      <LabInspectorSection title="Source · WORK_SOURCE" icon={ICON('bolt')} selected={scene.selectedId === 'source'} locked={scene.isLocked('source')}>
        <LabSegmentedControl<PowerScenario> size="sm" columns={3} ariaLabel="What does the work" disabled={scene.isLocked('source')} value={s.scenario} onChange={(k) => lab.change({ scenario: k })}
          options={[{ value: 'lift', label: 'Lift a load' }, { value: 'accelerate', label: 'Speed up' }, { value: 'work', label: 'Enter work' }]} />
        {s.scenario === 'work' && <LabParameterField id="work" label="Work" symbol="W" unit="J" compact step={100} min={0} max={L.workMax} value={s.workJ} disabled={scene.isLocked('source')} onChange={(v) => lab.change({ workJ: v })} />}
        {s.scenario !== 'work' && <LabParameterField id="mass" label="Mass" symbol="m" unit="kg" compact step={10} min={L.massMin} max={L.massMax} value={s.massKg} disabled={scene.isLocked('source')} onChange={(v) => lab.change({ massKg: v })} />}
        {s.scenario === 'lift' && <LabParameterField id="height" label="Height" symbol="h" unit="m" compact step={1} min={0} max={L.heightMax} value={s.height} disabled={scene.isLocked('source')} onChange={(v) => lab.change({ height: v })} />}
        {s.scenario === 'accelerate' && <LabParameterField id="speed" label="Final speed" symbol="v" unit="m/s" compact step={5} min={0} max={L.speedMax} value={s.speed} disabled={scene.isLocked('source')} onChange={(v) => lab.change({ speed: v })} />}
      </LabInspectorSection>
      <LabInspectorSection title="Measurement · CLOCK" icon={ICON('timer')} selected={scene.selectedId === 'clock'} locked={scene.isLocked('clock')}>
        <LabParameterField id="time" label="Time" symbol="t" unit="s" compact step={1} min={L.timeMin} max={L.timeMax} value={s.timeS} disabled={scene.isLocked('clock')} onChange={(v) => lab.change({ timeS: v })} />
        {power.valid && <p className="font-mono text-[11px] text-slate-300" data-testid="power-live">P = W ÷ t = {f2(power.work)} ÷ {f2(s.timeS)} = <strong>{f2(power.power)} W</strong></p>}
      </LabInspectorSection>
      {!power.valid && <p role="alert" className="text-xs rounded-lg border px-3 py-2" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }}>This setup cannot run: {power.reason}</p>}
      <p className="text-[11px] text-slate-400">Work 0 to {L.workMax} J; mass {L.massMin} to {L.massMax} kg; time {L.timeMin} to {L.timeMax} s. g = 10 m/s². Average power only.</p>

      <LabInspectorSection title="Power principles" icon={ICON('bolt')}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Rate of doing work</p><p>P = W &divide; t = &Delta;E &divide; &Delta;t</p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Standard SI unit</p><p>1 watt (W) = 1 joule per second (J/s)</p></div>
        </div>
        <p className="text-xs text-slate-300" data-testid="power-derive-link">
          Why is power W &divide; t? <Link className="underline text-sky-400 hover:text-sky-300 font-medium" to="/physics/work/derivations?d=P">Work through the explanation &rarr;</Link>
        </p>
      </LabInspectorSection>
      {exp && (
        <LabInspectorSection title={`Investigation ${exp.id}: ${exp.title}`} icon={ICON('school')}>
          <p className="text-[11px] text-slate-300 leading-relaxed">{exp.goal}</p>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300"><strong>Notice:</strong> {exp.lesson}</div>
        </LabInspectorSection>
      )}
    </div>
  );

  const viewportContent = (
    <ViewportFrame footnote="Work is the energy transferred, in joules; power is how fast, in watts. Change the work source or the time in the Inspector and watch the slope of the line.">
      <div className="w-full h-full min-h-0 flex flex-col justify-center gap-3" data-chapter="power-lab" data-testid="power-scene">
        <PowerView initial={s} setup={s} part="scene" />
      </div>
    </ViewportFrame>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="power-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
      </div>
      {exp.routes.map((r) => <GuidedPanel key={r.id} route={r} outcome={powerOutcome(r)} onRun={(setup) => lab.replace(setup)} tag="power" />)}
      <p className="text-xs text-slate-400">Model results for the average power; power measures how quickly energy is transferred or transformed.</p>
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300">
      <p className="font-mono">Free Exploration: adjust the work and the time to see the average power.</p>
      <p className="text-outline">Select an investigation in the Explorer to compare your predictions with the model.</p>
    </div>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: <PowerView initial={s} setup={s} part="readout" /> },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Power Laboratory"
      outlinerTitle="Investigations"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Power Properties"
      inspector={inspectorContent}
      analysisDock={<DockTabs key={exp?.id ?? 'free'} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      onUndo={lab.undo}
      onRedo={lab.redo}
      canUndo={lab.canUndo}
      canRedo={lab.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};
