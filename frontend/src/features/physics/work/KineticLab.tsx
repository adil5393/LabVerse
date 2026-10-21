/**
 * Work-Energy Laboratory page (/physics/work/kinetic) and the Derivations page (/physics/work/derivations) (PHY-3B).
 * The laboratory is the Blender-style workstation: free exploration (no gates) with six optional investigations A to F
 * (Predict, Experiment, Observe, Explain). The cart, the net force and the displacement are scene objects you can select, hide,
 * lock and drag; the outcome shown is computed from the same model that draws the cart and the graphs.
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { KINETIC_EXPERIMENTS, kineticExperimentById, kineticRouteOutcome, type KineticRoute } from '../../../engine/physics/work/kineticExperiments';
import { DEFAULT_KINETIC, KIN_LIMITS, computeKinetic, describeKinetic, kineticAt, type KineticSetup } from '../../../engine/physics/work/kineticModel';
import { PHYS } from '../motion/physicsColors';
import { DerivationView } from './DerivationView';
import { KineticFigure, KineticReadout, KineticScene } from './KineticView';
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
import { KineticMobileLab } from './KineticMobileLab';

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

const Crumb: React.FC<{ last: string }> = ({ last }) => (
  <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
    <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
    <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
    <Link to="/physics/work" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Work, Energy, and Simple Machines</Link><span>/</span>
    <span className="text-sky-300 font-bold">{last}</span>
  </nav>
);

const SCENE_OBJECTS: SceneObject[] = [
  { id: 'cart', name: 'CART_01', category: 'Object / Dynamics', icon: 'deployed_code' },
  { id: 'force', name: 'F_NET', category: 'Vector / Force', icon: 'trending_flat' },
  { id: 'displacement', name: 'DISP_01', category: 'Measurement / Vector', icon: 'straighten' },
];
const OBJECT_IDS = SCENE_OBJECTS.map((o) => o.id);

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
  const lab = useLabSetup<KineticSetup>(exp ? exp.routes[0].setup : DEFAULT_KINETIC);
  const scene = useSceneState(OBJECT_IDS);
  const [rate, setRate] = useState(1);
  const [beginnerMode, setBeginnerMode] = useState(false);

  const r = computeKinetic(lab.setup);
  const playback = useTimedPlayback(r.valid ? r.tEnd : 0, rate);

  const select = (id: string | null) => {
    const e = kineticExperimentById(id);
    setParams(id ? { experiment: id } : {});
    lab.replace(e ? e.routes[0].setup : DEFAULT_KINETIC);
    playback.reset();
  };
  const runRoute = (route: KineticRoute) => { lab.replace(route.setup); playback.reset(); };

  /** Every edit stops the run and returns to the start, so the scene always matches the numbers. */
  const edit = (patch: Partial<KineticSetup>) => { lab.change(patch); playback.reset(); };
  const undo = () => { lab.undo(); playback.reset(); };
  const redo = () => { lab.redo(); playback.reset(); };
  const resetRun = () => { lab.restart(); playback.reset(); };

  const outlinerContent = (
    <LabOutliner
      investigations={KINETIC_EXPERIMENTS.map((x) => ({ id: x.id, title: x.title, goal: x.goal }))}
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

  const L = KIN_LIMITS;
  const s = lab.setup;
  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="kinetic-controls">
      <LabInspectorSection title="Object · CART_01" icon={<span className="material-symbols-outlined text-[15px]">deployed_code</span>} selected={scene.selectedId === 'cart'} locked={scene.isLocked('cart')}>
        <LabParameterField id="mass" label="Mass" symbol="m" unit="kg" compact step={1} min={L.massMin} max={L.massMax} value={s.massKg} disabled={scene.isLocked('cart')} onChange={(v) => edit({ massKg: v })} />
        <LabParameterField id="u" label="Initial velocity" symbol="u" unit="m/s" compact step={1} min={-L.speedMax} max={L.speedMax} value={s.u} disabled={scene.isLocked('cart')} onChange={(v) => edit({ u: v })} />
      </LabInspectorSection>
      <LabInspectorSection title="Vector · F_NET" icon={<span className="material-symbols-outlined text-[15px]">trending_flat</span>} selected={scene.selectedId === 'force'} locked={scene.isLocked('force')}>
        <LabParameterField id="force" label="Net force" symbol="F" unit="N" compact step={2} min={-L.forceMax} max={L.forceMax} value={s.netForce} disabled={scene.isLocked('force')} onChange={(v) => edit({ netForce: v })} />
        <p className="text-[11px] text-slate-400">Drag the round handle at the arrow tip in the scene. Right is positive.</p>
      </LabInspectorSection>
      <LabInspectorSection title="Measurement · DISP_01" icon={<span className="material-symbols-outlined text-[15px]">straighten</span>} selected={scene.selectedId === 'displacement'} locked={scene.isLocked('displacement')}>
        <LabParameterField id="s" label="Displacement" symbol="s" unit="m" compact step={1} min={-L.dispMax} max={L.dispMax} value={s.displacement} disabled={scene.isLocked('displacement')} onChange={(v) => edit({ displacement: v })} />
        <p className="text-[11px] text-slate-400">Drag the round handle on the dashed end line in the scene.</p>
      </LabInspectorSection>
      {!r.valid && <p role="alert" data-testid="kinetic-error" className="text-xs rounded-lg border px-3 py-2" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }}>This setup cannot run: {r.reason}</p>}

      <LabInspectorSection title="Work-energy theorem" icon={<span className="material-symbols-outlined text-[15px]">balance</span>}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Net work</p><p>W<sub>net</sub> = F × s = ΔK</p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Kinetic energy</p><p>K = ½ m v²</p></div>
        </div>
        <p className="text-xs text-slate-300" data-testid="kinetic-derive-link">
          Why is K = ½mv²? <Link className="underline text-sky-400 hover:text-sky-300 font-medium" to="/physics/work/derivations?d=K">Work through the derivation &rarr;</Link>
        </p>
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
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Run the cart">
      <LabButton type="button" size="sm" variant="primary" onClick={playback.toggle} disabled={r.tEnd === 0} data-testid="kinetic-play" className="font-semibold"
        icon={<span className="material-symbols-outlined text-[15px]">{playback.playing ? 'pause' : playback.atEnd ? 'replay' : 'play_arrow'}</span>}>
        {playback.playing ? 'Pause' : playback.atEnd ? 'Replay' : 'Play'}
      </LabButton>
      <LabButton type="button" size="sm" onClick={playback.reset} data-testid="kinetic-reset" icon={<span className="material-symbols-outlined text-[15px]">restart_alt</span>}>Back to start</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[150px]">Time
        <input type="range" min={0} max={r.tEnd} step="any" value={playback.t} onChange={(e) => playback.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${f2(playback.t)} seconds of ${f2(r.tEnd)}`} className="flex-1 min-w-[90px] accent-primary" data-testid="kinetic-time" />
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
      footnote="A constant net force along a straight line; friction would be part of the net force. Drag the round handles to change the net force and the displacement."
    >
      <div className="w-full h-full min-h-0 flex flex-col justify-center gap-3" data-visual="kineticLab" data-testid="kinetic-view">
        {r.valid ? (
          <KineticScene
            r={r}
            t={playback.t}
            alt={describeKinetic(r)}
            interaction={{
              selectedId: scene.selectedId,
              onSelect: scene.select,
              locks: scene.lockMap,
              visibility: scene.visibility,
              onForce: (n) => edit({ netForce: n }),
              onDisplacement: (m) => edit({ displacement: m }),
            }}
          />
        ) : <p role="alert" className="text-sm rounded-xl border px-3 py-3 mx-auto" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }}>This setup cannot run: {r.reason}</p>}
      </div>
    </ViewportFrame>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="kinetic-experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-outline-variant">
        <span className="text-primary font-bold">Experiment {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict &rarr; Experiment &rarr; Observe &rarr; Explain</span>
      </div>
      {exp.routes.map((route) => <RoutePanel key={`${exp.id}-${route.id}`} route={route} onRun={runRoute} />)}
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300">
      <p className="font-mono">Free Exploration: a cart under a net force. The area under the force graph is the change in kinetic energy.</p>
      <p className="text-outline">Pick an investigation in the Explorer to test a prediction.</p>
    </div>
  );

  const now = r.valid ? kineticAt(r, playback.t) : null;
  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: r.valid ? <KineticReadout r={r} t={playback.t} /> : <p className="text-xs text-slate-400">Fix the setup to see the measurements.</p> },
    { id: 'graphs', label: 'Graphs', content: r.valid ? <KineticFigure r={r} t={playback.t} showScene={false} /> : <p className="text-xs text-slate-400">Fix the setup to see the graphs.</p> },
    {
      id: 'explanation',
      label: 'Explanation',
      content: (
        <div className="space-y-2 text-xs text-slate-200 max-w-3xl" data-testid="kinetic-description">
          <p>{r.valid ? describeKinetic(r) : r.reason}</p>
          {now && <p className="text-slate-400">Now (t = {f2(playback.t)} s): x = {f2(now.x)} m, v = {f2(now.v)} m/s, K = {f2(now.K)} J.</p>}
          <p className="text-slate-400">Assumptions: a constant net force along a straight line; no other energy forms are tracked. Exact kinematics, so there is no numerical drift. A model result, not a proof.</p>
        </div>
      ),
    },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="work"
      labTitle="Work-Energy Laboratory"
      outlinerTitle="Investigations"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Model Properties"
      inspector={inspectorContent}
      analysisDock={<DockTabs key={exp?.id ?? 'free'} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      mobileLayout={
        <KineticMobileLab
          r={r}
          playback={playback}
          rate={rate}
          setRate={setRate}
          scene={scene}
          exp={exp}
          tabs={tabs}
          inspector={inspectorContent}
          alt={describeKinetic(r)}
          onForce={(n) => edit({ netForce: n })}
          onDisplacement={(m) => edit({ displacement: m })}
        />
      }
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
