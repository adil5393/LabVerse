/**
 * Two more free laboratories of the Motion chapter (PHY-1D): the Equation Laboratory (/physics/motion/equations)
 * and the Uniform Circular Motion experiment (/physics/motion/circular). Both open at once, no gates.
 */

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { GlobalHeader } from '../../../components/GlobalHeader';
import { EQUATION_PRESETS } from '../../../engine/physics/motion/equations';
import { validateProfile, type Profile } from '../../../engine/physics/motion/profile';
import { DerivationView } from './DerivationView';
import { CircularMobileLab } from './CircularMobileLab';

const Shell: React.FC<{ last: string; title: string; intro: string; testid: string; children: React.ReactNode }> = ({ last, title, intro, testid, children }) => (
  <div className="min-h-screen flex flex-col bg-background text-on-surface antialiased lab-grid font-sans" data-chapter={testid}>
    <GlobalHeader />
    <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400" aria-label="Breadcrumb">
        <Link to="/" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Subject Explorer</Link><span>/</span>
        <Link to="/physics" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Physics</Link><span>/</span>
        <Link to="/physics/motion" className="inline-flex items-center min-h-[44px] hover:text-sky-400">Describing Motion</Link><span>/</span>
        <span className="text-sky-300 font-bold">{last}</span>
      </nav>
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-white">{title}</h1>
        <p className="text-sm text-slate-300 max-w-3xl">{intro}</p>
      </header>
      {children}
    </main>
  </div>
);

import { LabButton, LabInspectorSection, LabParameterField, LabSegmentedControl, LabSelect } from '../../workspace/controls';
import { DockTabs, LabOutliner, ViewportFrame, WorkspaceShell, useModelHistory, useSceneState, type DockTab, type SceneObject } from '../../workspace';
import { CIRCLE_LIMITS, type CircleSetup, type Spin } from '../../../engine/physics/motion/circular';
import { CircleReadout, CircleScene, useCircularMotion } from './CircularMotion';
import { GraphLab } from './GraphLab';

const ICON = (name: string) => <span className="material-symbols-outlined text-[15px]">{name}</span>;

export const EquationLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const currentPresetId = params.get('preset') ?? EQUATION_PRESETS[0].id;
  const named = EQUATION_PRESETS.find((p) => p.id === currentPresetId) ?? EQUATION_PRESETS[0];
  const num = (k: string) => (params.get(k) === null || params.get(k) === '' ? NaN : Number(params.get(k)));
  const typed: Profile | null = [num('u'), num('a'), num('d')].every(Number.isFinite) ? { x0: Number.isFinite(num('x0')) ? num('x0') : 0, v0: num('u'), segments: [{ durationS: num('d'), a: num('a') }] } : null;
  const preset = typed && validateProfile(typed) === null ? { ...named, id: `typed-${params.toString()}`, profile: typed } : named;

  return (
    <GraphLab
      key={preset.id}
      labTitle="Equation Laboratory"
      outlinerTitle="Presets"
      inspectorTitle="Equations Inspector"
      listTitle="Kinematics Presets"
      items={EQUATION_PRESETS.map((p) => ({ id: p.id, title: p.title, goal: `u = ${p.profile.v0} m/s, a = ${p.profile.segments[0]?.a ?? 0} m/s²` }))}
      activeId={preset.id}
      onPick={(id) => setParams({ preset: id })}
      profile={preset.profile}
      presets={EQUATION_PRESETS}
      kinds={['xt', 'vt']}
      equations
      reference={(
        <LabInspectorSection title="Equations of motion" icon={ICON('functions')}>
          <div className="space-y-2 font-mono text-slate-300">
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Velocity–time relation</p><p>v = u + at</p></div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Position–time relation</p><p>s = ut + &frac12;at&sup2;</p></div>
            <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Velocity–displacement relation</p><p>v&sup2; = u&sup2; + 2as</p></div>
          </div>
          <div className="space-y-1 text-xs text-slate-300" data-testid="derivation-links">
            <p><Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=A">Derive v = u + at &rarr;</Link></p>
            <p><Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=B">Derive s = ut + &frac12;at&sup2; &rarr;</Link></p>
            <p><Link className="underline text-sky-400 hover:text-sky-300" to="/physics/motion/derivations?d=C">Derive v&sup2; = u&sup2; + 2as &rarr;</Link></p>
          </div>
        </LabInspectorSection>
      )}
      notes={(
        <>
          <p className="font-mono text-primary font-bold">Kinematic model applicability · constant acceleration only</p>
          <p>These equations are valid strictly when the acceleration is uniform along a straight line. If the acceleration varies over time, the relations need calculus rather than algebraic formulas.</p>
        </>
      )}
    />
  );
};

const CIRCLE_OBJECTS: SceneObject[] = [
  { id: 'body', name: 'BODY_01', category: 'Object / Kinematics', icon: 'toys' },
  { id: 'orbit', name: 'CIRCLE_01', category: 'Environment / Path', icon: 'radio_button_unchecked' },
  { id: 'velocity', name: 'VELOCITY', category: 'Vector / Tangent', icon: 'trending_flat' },
  { id: 'displacement', name: 'DISPLACEMENT', category: 'Vector / Chord', icon: 'straighten' },
  { id: 'arc', name: 'ARC_DISTANCE', category: 'Measurement / Distance', icon: 'architecture' },
  { id: 'acceleration', name: 'TOWARDS_CENTRE', category: 'Vector / Conceptual', icon: 'adjust' },
];
const VECTOR_NOTES: Record<string, string> = {
  velocity: 'The velocity is tangent to the circle and keeps turning, so the motion is accelerated even though the speed is constant.',
  displacement: 'The displacement is the straight chord from the start to the object: it is zero after each full turn.',
  arc: 'The distance is the arc length travelled: it only ever grows.',
  acceleration: 'The change of velocity points towards the centre (conceptual, not a force).',
};

export const CircularLab: React.FC = () => {
  const c = useCircularMotion();
  const scene = useSceneState(CIRCLE_OBJECTS.map((o) => o.id));
  const [beginnerMode, setBeginnerMode] = React.useState(false);
  const hist = useModelHistory<CircleSetup>(c.setup, (full) => c.change(full));
  const edit = (patch: Partial<CircleSetup>) => { hist.record(); c.change(patch); };
  const sel = (id: string) => scene.selectedId === id;
  const L = CIRCLE_LIMITS;
  const r1 = (n: number) => String(Math.round(n * 100) / 100);

  const outlinerContent = (
    <LabOutliner
      objects={CIRCLE_OBJECTS}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="circle-controls">
      <LabInspectorSection title="Environment · CIRCLE_01" icon={ICON('radio_button_unchecked')} selected={sel('orbit')} locked={scene.isLocked('orbit')}>
        <LabParameterField id="radius" label="Radius" symbol="r" unit="m" compact step={1} min={L.minR} max={L.maxR} value={c.setup.radiusM} disabled={scene.isLocked('orbit')} onChange={(v) => edit({ radiusM: v })} />
        <LabParameterField id="period" label="Period (one turn)" symbol="T" unit="s" compact step={1} min={L.minT} max={L.maxT} value={c.setup.periodS} disabled={scene.isLocked('orbit')} onChange={(v) => edit({ periodS: v })} />
        <LabSegmentedControl<Spin> size="sm" columns={2} ariaLabel="Direction of motion" disabled={scene.isLocked('orbit')} value={c.setup.spin} onChange={(d) => edit({ spin: d })}
          options={[{ value: 'counterclockwise', label: '↺ Anticlockwise' }, { value: 'clockwise', label: '↻ Clockwise' }]} />
        {!beginnerMode && <p className="text-[11px] text-slate-400">Radius {L.minR} to {L.maxR} m; period {L.minT} to {L.maxT} s. The speed is 2πr ÷ T and does not change.</p>}
        {c.err && <p role="alert" className="text-xs font-bold text-error" data-testid="circle-error"><span aria-hidden>{'✗ '}</span>{c.err}</p>}
      </LabInspectorSection>
      <LabInspectorSection title="Object · BODY_01" icon={ICON('toys')} selected={sel('body')}>
        <div className="font-mono text-[11px] text-slate-300 space-y-1">
          <p>speed v = 2πr ÷ T = <strong>{r1(c.s.speed)} m/s</strong></p>
          <p>turns completed = <strong>{r1(c.s.revolutions)}</strong></p>
        </div>
      </LabInspectorSection>
      {['velocity', 'displacement', 'arc', 'acceleration'].filter((id) => sel(id)).map((id) => (
        <LabInspectorSection key={id} title={`Vector · ${CIRCLE_OBJECTS.find((o) => o.id === id)!.name}`} icon={ICON('trending_flat')} selected>
          <p className="text-[11px] text-slate-300">{VECTOR_NOTES[id]}</p>
        </LabInspectorSection>
      ))}
      <LabInspectorSection title="Circular kinematics" icon={ICON('functions')}>
        <div className="space-y-2 font-mono text-slate-300">
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Constant tangential speed</p><p>v = 2&pi;r &divide; T</p></div>
          <div className="p-2 rounded bg-surface-card border border-surface-border text-[11px]"><p className="font-bold text-white mb-1">Centripetal acceleration</p><p>a<sub>c</sub> directed towards the centre</p></div>
        </div>
      </LabInspectorSection>
    </div>
  );

  const transport = (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Time controls" data-testid="circle-time">
      <LabButton type="button" size="sm" variant="primary" onClick={c.togglePlay} aria-pressed={c.playing} className="font-semibold" icon={ICON(c.playing ? 'pause' : c.tt >= c.tMax ? 'replay' : 'play_arrow')}>{c.playing ? 'Pause' : c.tt >= c.tMax ? 'Replay' : 'Play'}</LabButton>
      <LabButton type="button" size="sm" onClick={c.stepBack} aria-label="Step back 1 second of simulated time" icon={ICON('skip_previous')}>−1 s</LabButton>
      <LabButton type="button" size="sm" onClick={c.stepForward} aria-label="Step forward 1 second of simulated time" icon={ICON('skip_next')}>+1 s</LabButton>
      {!beginnerMode && <LabButton type="button" size="sm" onClick={() => c.jumpTo(c.setup.periodS / 2)} data-testid="jump-half">Half a turn</LabButton>}
      <LabButton type="button" size="sm" onClick={() => c.jumpTo(c.setup.periodS)} data-testid="jump-full">One full turn</LabButton>
      <LabButton type="button" size="sm" onClick={c.rewind} icon={ICON('restart_alt')}>Back to 0 s</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[160px] grow max-w-md">Time
        <input type="range" min={0} max={c.tMax} step={0.1} value={c.tt} onChange={(e) => c.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${r1(c.tt)} seconds`} className="flex-1 min-w-[90px] accent-primary" />
        <span className="font-mono text-[11px] w-20 text-right">{r1(c.tt)} / {r1(c.tMax)} s</span>
      </label>
      {!beginnerMode && <LabSelect compact aria-label="Replay speed on screen. This does not change the motion." value={c.rate} onChange={(e) => c.setRate(Number(e.target.value))} options={[{ value: 0.25, label: '0.25×' }, { value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} />}
    </div>
  );

  const viewportContent = (
    <ViewportFrame toolbar={transport} footnote="Simulated time for up to three turns. The replay speed only changes how fast the picture plays; it does not change the speed of the object.">
      <div className="w-full max-h-full flex flex-col items-center gap-2" data-no-pan data-chapter="motion-circular" data-visual="circularMotion" data-testid="circular-motion">
        {scene.isVisible('body') || scene.isVisible('orbit') ? <CircleScene c={c} hidden={{ velocity: !scene.isVisible('velocity'), displacement: !scene.isVisible('displacement'), arc: !scene.isVisible('arc'), acceleration: !scene.isVisible('acceleration') }} /> : <p className="text-xs text-slate-400 py-8">Every object is hidden. Use the eye icons in the Explorer to show them.</p>}
      </div>
    </ViewportFrame>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: <CircleReadout c={c} /> },
    {
      id: 'notes',
      label: 'Notes',
      content: (
        <div className="text-xs text-slate-300 space-y-2 max-w-3xl">
          <p className="font-mono text-primary font-bold">Circular motion observations · non-zero acceleration</p>
          <p>Although the speed is constant, the velocity vector continuously changes direction. Therefore uniform circular motion is always an accelerated motion.</p>
          <p>The arc distance only grows; the chord displacement returns to zero after every full turn, and so does the average velocity.</p>
        </div>
      ),
    },
  ];

  const mobileLayoutContent = (
    <CircularMobileLab
      c={c}
      scene={scene}
      tabs={tabs}
      inspector={inspectorContent}
    />
  );

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle="Uniform Circular Motion"
      outlinerTitle="Scene Objects"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Circular Parameters"
      inspector={inspectorContent}
      analysisDock={<DockTabs tabs={tabs} initial="measurements" />}
      mobileLayout={mobileLayoutContent}
      playing={c.playing}
      onTogglePlay={c.togglePlay}
      onReset={c.rewind}
      onUndo={hist.undo}
      onRedo={hist.redo}
      canUndo={hist.canUndo}
      canRedo={hist.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};

export const DerivationPage: React.FC = () => {
  const [params] = useSearchParams();
  return (
    <Shell testid="motion-derivations" last="Understand the Derivation" title="Understand the Derivation" intro="Follow how the three equations of motion (Eqs. 4.4a, 4.4b and 4.4c of the chapter) are built from the definition of acceleration and the velocity–time graph. Some steps ask you to supply the missing reasoning first. Free exploration: nothing to unlock, and reading a derivation never counts as mastery.">
      <DerivationView key={params.get('d') ?? 'A'} id={params.get('d') ?? 'A'} />
      <p className="text-sm text-slate-300">Try the numbers yourself in the <Link className="underline hover:text-sky-300" to="/physics/motion/equations">Equation Laboratory</Link>, or see the derivations in <Link className="underline hover:text-sky-300" to="/physics/motion/learn/pm-l9">Lesson 9</Link>.</p>
    </Shell>
  );
};
