/**
 * Energy Laboratory page (/physics/work/energy) (PHY-3C): the Blender-style workstation. Free exploration (no gates) with six
 * optional investigations A to F: Predict, Experiment, Observe, Explain. The outcome shown is computed from the same model that
 * draws the scene, bars and graph. The scene has objects you can select, hide, lock and drag (the release height and the
 * reference level), with their properties in the Inspector and the live bookkeeping and graph in the Analysis Dock.
 */

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ENERGY_EXPERIMENTS, energyExperimentById, energyRouteOutcome, type EnergyRoute } from '../../../engine/physics/work/energyExperiments';
import { DEFAULT_ENERGY, ENERGY_LIMITS, computeEnergy, describeEnergy, energyAtDistance, energyAtTime, type EnergySetup } from '../../../engine/physics/work/energyLab';
import { PHYS } from '../motion/physicsColors';
import { EnergyBars, EnergyFigure, EnergyReadout, EnergyScene } from './EnergyView';
import {
  DockTabs,
  LabOutliner,
  ViewportFrame,
  WorkspaceShell,
  useLabSetup,
  useSceneState,
  useTimedPlayback,
  type DockTab,
  type SceneObject,
} from '../../workspace';
import { LabButton, LabInspectorSection, LabParameterField, LabSelect } from '../../workspace/controls';

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

const SCENE_OBJECTS: SceneObject[] = [
  { id: 'ball', name: 'BALL_01', category: 'Object / Dynamics', icon: 'circle' },
  { id: 'ramp', name: 'RAMP_01', category: 'Environment / Surface', icon: 'trending_down' },
  { id: 'reference', name: 'REF_LEVEL', category: 'Measurement / Reference', icon: 'horizontal_rule' },
  { id: 'gravity', name: 'GRAVITY', category: 'Environment / Field', icon: 'public' },
];
const OBJECT_IDS = SCENE_OBJECTS.map((o) => o.id);

const RoutePanel: React.FC<{ route: EnergyRoute; onRun: (r: EnergyRoute) => void }> = ({ route, onRun }) => {
  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [ran, setRan] = useState(false);
  const out = energyRouteOutcome(route);
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
        {ran && <p className="text-[11px] text-slate-300">The scene above is set up. Press Play, or drag the time slider, then compare.</p>}
      </div>
      {checked && choice !== null && (
        <div role="status" aria-live="polite" data-testid="energy-feedback" className="rounded-lg p-3 text-xs text-slate-100 space-y-1" style={{ border: `1px solid ${right ? PHYS.correct : PHYS.error}`, background: `${right ? PHYS.correct : PHYS.error}14` }}>
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: right ? PHYS.correct : PHYS.error }}>{right ? '✓ 3 · Observe: matches the model' : '✗ 3 · Observe: differs from the model'}</h4>
          <p><strong>Model result: </strong>{route.explain(out.state, out.result)}</p>
          <h4 className="text-xs font-mono uppercase tracking-wider pt-1" style={{ color: PHYS.time }}>4 · Explain</h4>
          <p>{right ? route.options[choice].why : `${route.options[choice].why} The model supports: "${route.options[out.holdsIndex].label}". ${route.options[out.holdsIndex].why}`}</p>
        </div>
      )}
    </section>
  );
};

export const EnergyLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = energyExperimentById(params.get('experiment'));
  const lab = useLabSetup<EnergySetup>(exp ? exp.routes[0].setup : DEFAULT_ENERGY);
  const scene = useSceneState(OBJECT_IDS);
  const [rate, setRate] = useState(1);
  const [axis, setAxis] = useState<'time' | 'distance'>('time');
  const [beginnerMode, setBeginnerMode] = useState(false);

  const r = computeEnergy(lab.setup);
  const playback = useTimedPlayback(r.valid ? r.tEnd : 0, rate);
  const st = r.valid ? energyAtTime(r, playback.t) : null;

  /** Put the scene at a fraction (0 = top, 1 = bottom) of the distance along the slope. */
  const seek = (setup: EnergySetup, at: number) => {
    const rr = computeEnergy(setup);
    playback.scrub(rr.valid ? energyAtDistance(rr, rr.sEnd * at).t : 0);
  };
  useEffect(() => { if (exp) seek(exp.routes[0].setup, exp.routes[0].at); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id: string | null) => {
    const e = energyExperimentById(id);
    setParams(id ? { experiment: id } : {});
    const setup = e ? e.routes[0].setup : DEFAULT_ENERGY;
    lab.replace(setup);
    seek(setup, e ? e.routes[0].at : 0);
  };
  const runRoute = (route: EnergyRoute) => { lab.replace(route.setup); seek(route.setup, route.at); };

  /** Every edit stops the run and returns to the start, so the scene always matches the numbers. */
  const edit = (patch: Partial<EnergySetup>) => { lab.change(patch); playback.reset(); };
  const undo = () => { lab.undo(); playback.reset(); };
  const redo = () => { lab.redo(); playback.reset(); };
  const resetRun = () => { lab.restart(); playback.reset(); };

  const outlinerContent = (
    <LabOutliner
      investigations={ENERGY_EXPERIMENTS.map((x) => ({ id: x.id, title: x.title, goal: x.goal }))}
      activeInvestigationId={exp?.id ?? null}
      onSelectInvestigation={select}
      objects={SCENE_OBJECTS}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const L = ENERGY_LIMITS;
  const s = lab.setup;
  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="energy-controls">
      <LabInspectorSection title="Object · BALL_01" icon={<span className="material-symbols-outlined text-[15px]">circle</span>} selected={scene.selectedId === 'ball'} locked={scene.isLocked('ball')}>
        <LabParameterField id="mass" label="Mass" symbol="m" unit="kg" compact step={1} min={L.massMin} max={L.massMax} value={s.massKg} disabled={scene.isLocked('ball')} onChange={(v) => edit({ massKg: v })} />
        {!beginnerMode && <LabParameterField id="u0" label="Initial speed" symbol="u" unit="m/s" compact step={1} min={0} max={L.uMax} value={s.u0} disabled={scene.isLocked('ball')} onChange={(v) => edit({ u0: v })} />}
      </LabInspectorSection>
      <LabInspectorSection title="Environment · RAMP_01" icon={<span className="material-symbols-outlined text-[15px]">trending_down</span>} selected={scene.selectedId === 'ramp'} locked={scene.isLocked('ramp')}>
        <LabParameterField id="height" label="Start height" symbol="h" unit="m" compact step={1} min={L.heightMin} max={L.heightMax} value={s.startHeight} disabled={scene.isLocked('ramp')} onChange={(v) => edit({ startHeight: v })} />
        <LabParameterField id="angle" label="Ramp angle (90 = drop)" symbol="θ" unit="°" compact step={10} min={L.angleMin} max={L.angleMax} value={s.angleDeg} disabled={scene.isLocked('ramp')} onChange={(v) => edit({ angleDeg: v })} />
        <LabParameterField id="mu" label="Friction coefficient" symbol="μ" unit="" compact step={0.1} min={0} max={L.muMax} value={s.mu} disabled={scene.isLocked('ramp')} onChange={(v) => edit({ mu: Math.round(v * 100) / 100 })} />
      </LabInspectorSection>
      <LabInspectorSection title="Reference level · REF_LEVEL" icon={<span className="material-symbols-outlined text-[15px]">horizontal_rule</span>} selected={scene.selectedId === 'reference'} locked={scene.isLocked('reference')}>
        <LabParameterField id="ref" label="Height where U = 0" symbol="y₀" unit="m" compact step={1} min={L.refMin} max={L.refMax} value={s.refHeight} disabled={scene.isLocked('reference')} onChange={(v) => edit({ refHeight: v })} />
        <p className="text-[11px] text-slate-400">Drag the small handle on the dashed line in the scene. The reference changes U only.</p>
      </LabInspectorSection>
      {!beginnerMode && (
        <LabInspectorSection title="Field · GRAVITY" icon={<span className="material-symbols-outlined text-[15px]">public</span>} selected={scene.selectedId === 'gravity'} locked={scene.isLocked('gravity')}>
          <LabParameterField id="g" label="Gravitational field" symbol="g" unit="m/s²" compact step={1} min={L.gMin} max={L.gMax} value={s.g} disabled={scene.isLocked('gravity')} onChange={(v) => edit({ g: v })} />
        </LabInspectorSection>
      )}
      {!r.valid && <p role="alert" data-testid="energy-error" className="text-xs rounded-lg border px-3 py-2" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }}>This setup cannot run: {r.reason}</p>}

      <LabInspectorSection title="Conservation laws" icon={<span className="material-symbols-outlined text-[15px]">balance</span>}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Total energy</p><p>E<sub>total</sub> = K + U + Q = constant</p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Gravitational potential</p><p>U = mg(h − y₀)</p></div>
        </div>
        <div className="space-y-1 text-xs text-slate-300" data-testid="energy-derive-links">
          <p>Why does it work? <Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=U">Derive U = mgh &rarr;</Link></p>
          <p><Link className="underline text-sky-400 hover:text-sky-300" to="/physics/work/derivations?d=C">Derive conservation of mechanical energy &rarr;</Link></p>
        </div>
      </LabInspectorSection>

      {exp && (
        <LabInspectorSection title={`Investigation ${exp.id}: ${exp.title}`} icon={<span className="material-symbols-outlined text-[15px] text-primary">school</span>}>
          <p className="text-[11px] text-slate-300 leading-relaxed">{exp.goal}</p>
          <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300"><strong>Notice:</strong> {exp.lesson}</div>
        </LabInspectorSection>
      )}
    </div>
  );

  const transport = r.valid ? (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Run the experiment">
      <LabButton type="button" size="sm" variant="primary" onClick={playback.toggle} disabled={r.tEnd === 0} data-testid="energy-play" className="font-semibold"
        icon={<span className="material-symbols-outlined text-[15px]">{playback.playing ? 'pause' : playback.atEnd ? 'replay' : 'play_arrow'}</span>}>
        {playback.playing ? 'Pause' : playback.atEnd ? 'Replay' : 'Play'}
      </LabButton>
      <LabButton type="button" size="sm" onClick={playback.reset} data-testid="energy-reset" icon={<span className="material-symbols-outlined text-[15px]">restart_alt</span>}>Back to start</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[150px]">Time
        <input type="range" min={0} max={r.tEnd} step={Math.max(r.tEnd / 200, 0.001)} value={playback.t} onChange={(e) => playback.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${f2(playback.t)} seconds of ${f2(r.tEnd)}`} className="flex-1 min-w-[90px] accent-primary" data-testid="energy-time" />
        <span className="font-mono text-[11px] w-20 text-right">{f2(playback.t)} / {f2(r.tEnd)} s</span>
      </label>
      {!beginnerMode && (
        <LabSelect compact aria-label="Playback speed" value={rate} onChange={(e) => setRate(Number(e.target.value))} options={[{ value: 0.25, label: '0.25×' }, { value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} />
      )}
    </div>
  ) : undefined;

  const viewportContent = (
    <ViewportFrame
      toolbar={transport}
      footnote="Point-like object, straight ramp, constant kinetic friction, no air resistance, no bounce. Drag the round handles to change the release height and the reference level."
    >
      <div className="w-full h-full min-h-0 flex flex-col justify-center gap-3" data-chapter="energy-lab" data-visual="energyLab" data-testid="energy-view">
        {r.valid && st ? (
          <>
            <EnergyScene
              r={r}
              st={st}
              alt={describeEnergy(r)}
              interaction={{
                selectedId: scene.selectedId,
                onSelect: scene.select,
                locks: scene.lockMap,
                visibility: scene.visibility,
                onHeight: (h) => edit({ startHeight: h }),
                onReference: (h) => edit({ refHeight: h }),
              }}
            />
            <EnergyBars r={r} st={st} />
          </>
        ) : <p role="alert" className="text-sm rounded-xl border px-3 py-3 mx-auto" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }}>This setup cannot run: {r.reason}</p>}
      </div>
    </ViewportFrame>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="energy-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
      </div>
      {exp.routes.map((route) => <RoutePanel key={`${exp.id}-${route.id}`} route={route} onRun={runRoute} />)}
      <p className="text-xs text-slate-400">Model results for a point-like object on a straight ramp with constant friction and no air resistance.</p>
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300">
      <p className="font-mono">Free Exploration: release an object on a ramp or let it fall.</p>
      <p className="text-outline">Watch kinetic, potential and thermal energy change together. Pick an investigation in the Explorer to test a prediction.</p>
    </div>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: r.valid && st ? <EnergyReadout r={r} st={st} /> : <p className="text-xs text-slate-400">Fix the setup to see the measurements.</p> },
    {
      id: 'graph',
      label: 'Graph',
      content: r.valid && st ? (
        <div className="space-y-2">
          <LabSelect compact label="Graph against" aria-label="Graph axis" data-testid="energy-axis" value={axis} onChange={(e) => setAxis(e.target.value as 'time' | 'distance')} options={[{ value: 'time', label: 'time' }, { value: 'distance', label: 'distance along the slope' }]} />
          <EnergyFigure r={r} st={st} axis={axis} />
        </div>
      ) : <p className="text-xs text-slate-400">Fix the setup to see the graph.</p>,
    },
    { id: 'explanation', label: 'Explanation', content: <p className="text-xs text-slate-200 max-w-3xl" data-testid="energy-description">{r.valid ? describeEnergy(r) : r.reason}</p> },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Energy Laboratory"
      outlinerTitle="Investigations"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Model Properties"
      inspector={inspectorContent}
      analysisDock={<DockTabs key={exp?.id ?? 'free'} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      playing={playback.playing}
      onTogglePlay={playback.toggle}
      onReset={resetRun}
      onUndo={undo}
      onRedo={redo}
      canUndo={lab.canUndo}
      canRedo={lab.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};
