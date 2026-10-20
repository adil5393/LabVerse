/**
 * The graph laboratories of the Motion chapter (Motion Graph Studio and Equation Laboratory) share one workstation page:
 * a list of scenarios or presets in the Explorer, the track and the graphs in the viewport with the transport docked under
 * them, the four numbers that define the motion in the Inspector, and the readouts, equations and prediction in the Analysis Dock.
 */

import React from 'react';
import { fmt, type GraphKind, type Profile } from '../../../engine/physics/motion/profile';
import { LIMITS } from '../../../engine/physics/motion/profile';
import { EquationPanel } from './EquationPanel';
import { GraphPrediction, GraphReadout, GraphScene, useGraphStudio, type PresetLike } from './MotionGraphs';
import {
  DockTabs,
  LabOutliner,
  ViewportFrame,
  WorkspaceShell,
  useModelHistory,
  useSceneState,
  type DockTab,
  type SceneObject,
} from '../../workspace';
import { LabButton, LabInspectorSection, LabParameterField, LabSelect } from '../../workspace/controls';
import { PHYS } from './physicsColors';

const GRAPH_OBJECTS: Record<GraphKind, SceneObject & { means: string }> = {
  xt: { id: 'xt', name: 'X_T_GRAPH', category: 'Graph / Position', icon: 'show_chart', means: 'Height is the position; the slope is the velocity.' },
  vt: { id: 'vt', name: 'V_T_GRAPH', category: 'Graph / Velocity', icon: 'show_chart', means: 'Height is the velocity; the slope is the acceleration; the area is the displacement.' },
  at: { id: 'at', name: 'A_T_GRAPH', category: 'Graph / Acceleration', icon: 'show_chart', means: 'Height is the acceleration. A flat line means a constant acceleration.' },
};
const ICON = (name: string) => <span className="material-symbols-outlined text-[15px]">{name}</span>;
const f1 = (n: number) => String(Math.round(n * 10) / 10);

export interface GraphLabProps {
  labTitle: string;
  outlinerTitle: string;
  inspectorTitle: string;
  /** Heading above the list of scenarios or presets. */
  listTitle: string;
  items: { id: string; title: string; goal?: string }[];
  activeId: string;
  onPick: (id: string) => void;
  scenarioId?: string;
  profile?: Profile;
  presets?: PresetLike[];
  kinds: GraphKind[];
  equations?: boolean;
  withPrediction?: boolean;
  /** Reference material shown at the bottom of the Inspector (relations, derivation links). */
  reference: React.ReactNode;
  /** The sentence about this scenario or preset shown in the Inspector. */
  insight?: React.ReactNode;
  /** Notes shown in the Analysis Dock. */
  notes: React.ReactNode;
}

export const GraphLab: React.FC<GraphLabProps> = ({ labTitle, outlinerTitle, inspectorTitle, listTitle, items, activeId, onPick, scenarioId, profile, presets, kinds, equations = false, withPrediction = false, reference, insight, notes }) => {
  const g = useGraphStudio({ scenarioId, profile, graphs: kinds, withPrediction, presets });
  const objects: SceneObject[] = [
    { id: 'body', name: 'BODY_01', category: 'Object / Kinematics', icon: 'toys', badge: `${fmt(g.s.x)} m` },
    ...kinds.map((k) => GRAPH_OBJECTS[k]),
  ];
  const scene = useSceneState(['body', ...kinds]);
  const [beginnerMode, setBeginnerMode] = React.useState(false);

  const hist = useModelHistory<Profile>(g.profile, (full) => g.loadProfile(full));
  const edit = (patch: Parameters<typeof g.edit>[0]) => { hist.record(); g.edit(patch); };

  const shownKinds = kinds.filter((k) => scene.isVisible(k));
  const sel = (id: string) => scene.selectedId === id;
  const editable = g.single;
  const bodyLocked = scene.isLocked('body');

  const outlinerContent = (
    <LabOutliner
      investigations={items}
      investigationsTitle={listTitle}
      showFree={false}
      activeInvestigationId={activeId}
      onSelectInvestigation={(id) => id && onPick(id)}
      objects={objects}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="graph-controls">
      <LabInspectorSection title="Object · BODY_01" icon={ICON('toys')} selected={sel('body')} locked={bodyLocked}>
        <LabParameterField id="x0" label="Start position" symbol="x₀" unit="m" compact step={5} min={-LIMITS.maxX} max={LIMITS.maxX} value={g.profile.x0} disabled={!editable || bodyLocked} onChange={(v) => edit({ x0: v })} />
        <LabParameterField id="v0" label="Start velocity" symbol="u" unit="m/s" compact step={1} min={-LIMITS.maxV} max={LIMITS.maxV} value={g.profile.v0} disabled={!editable || bodyLocked} onChange={(v) => edit({ v0: v })} />
      </LabInspectorSection>
      <LabInspectorSection title="Motion · ACCELERATION" icon={ICON('speed')} selected={sel('body')} locked={bodyLocked}>
        <LabParameterField id="a" label="Acceleration" symbol="a" unit="m/s²" compact step={0.5} min={-LIMITS.maxA} max={LIMITS.maxA} value={g.seg.a} disabled={!editable || bodyLocked} onChange={(v) => edit({ a: v })} />
        <LabParameterField id="d" label="Duration" symbol="t" unit="s" compact step={1} min={0.5} max={LIMITS.maxT} value={g.seg.durationS} disabled={!editable || bodyLocked} onChange={(v) => edit({ d: v })} />
        {!editable && <p className="text-[11px] text-slate-400">This motion has two stages with different accelerations, so it is set by choosing the scenario in the Explorer.</p>}
        {!beginnerMode && <p className="text-[11px] text-slate-400">Start velocity within ±{LIMITS.maxV} m/s, acceleration within ±{LIMITS.maxA} m/s², duration up to {LIMITS.maxT} s. Only a constant acceleration is offered, because then the graphs follow exactly.</p>}
        {g.err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="graph-error"><span aria-hidden>{'✗ '}</span>{g.err}</p>}
      </LabInspectorSection>
      {kinds.filter((k) => sel(k)).map((k) => (
        <LabInspectorSection key={k} title={`Graph · ${GRAPH_OBJECTS[k].name}`} icon={ICON('show_chart')} selected>
          <p className="text-[11px] text-slate-300">{GRAPH_OBJECTS[k].means}</p>
        </LabInspectorSection>
      ))}
      {insight}
      {reference}
    </div>
  );

  const transport = (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2" role="group" aria-label="Time controls" data-testid="graph-time">
      <LabButton type="button" size="sm" variant="primary" onClick={g.togglePlay} aria-pressed={g.playing} data-testid="graph-play" className="font-semibold"
        icon={ICON(g.playing ? 'pause' : g.tClamped >= g.T ? 'replay' : 'play_arrow')}>{g.playing ? 'Pause' : g.tClamped >= g.T ? 'Replay' : 'Play'}</LabButton>
      <LabButton type="button" size="sm" onClick={g.stepBack} aria-label="Step back 1 second of simulated time" icon={ICON('skip_previous')}>−1 s</LabButton>
      <LabButton type="button" size="sm" onClick={g.stepForward} aria-label="Step forward 1 second of simulated time" icon={ICON('skip_next')}>+1 s</LabButton>
      <LabButton type="button" size="sm" onClick={g.rewind} icon={ICON('restart_alt')}>Back to 0 s</LabButton>
      <label className="flex items-center gap-2 text-xs text-slate-300 min-w-[160px] grow max-w-md">Time
        <input type="range" min={0} max={g.T} step={0.1} value={g.tClamped} onChange={(e) => g.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${fmt(g.tClamped)} seconds`} className="flex-1 min-w-[90px] accent-primary" />
        <span className="font-mono text-[11px] w-20 text-right">{f1(g.tClamped)} / {f1(g.T)} s</span>
      </label>
      {!beginnerMode && (
        <LabSelect compact aria-label="Replay speed on screen. This does not change the motion." value={g.rate} onChange={(e) => g.setRate(Number(e.target.value))} options={[{ value: 0.25, label: '0.25×' }, { value: 0.5, label: '0.5×' }, { value: 1, label: '1×' }, { value: 2, label: '2×' }]} />
      )}
    </div>
  );

  const viewportContent = (
    <ViewportFrame toolbar={transport} footnote="Model graphs of an idealised constant-acceleration motion. Click a graph or use the slider to move the time cursor; the replay speed only changes how fast the picture plays.">
      <div className="w-full max-h-full overflow-y-auto space-y-3 px-1" data-no-pan data-chapter="motion-graphs" data-visual="motionGraphs">
        {scene.isVisible('body') || shownKinds.length > 0 ? <GraphScene g={g} kinds={shownKinds} showTrack={scene.isVisible('body')} /> : <p className="text-xs text-slate-400 text-center py-8">Every object is hidden. Use the eye icons in the Explorer to show them.</p>}
      </div>
    </ViewportFrame>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: <GraphReadout g={g} /> },
    ...(equations ? [{ id: 'equations', label: 'Equations', content: <EquationPanel profile={g.profile} t={g.tClamped} /> }] : []),
    ...(g.pred ? [{ id: 'investigation', label: 'Prediction', content: <GraphPrediction g={g} /> }] : []),
    { id: 'notes', label: 'Notes', content: <div className="text-xs text-slate-300 space-y-2 max-w-3xl">{notes}</div> },
  ];

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle={labTitle}
      outlinerTitle={outlinerTitle}
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle={inspectorTitle}
      inspector={inspectorContent}
      analysisDock={<DockTabs key={activeId} tabs={tabs} initial={g.pred ? 'investigation' : 'measurements'} />}
      playing={g.playing}
      onTogglePlay={g.togglePlay}
      onReset={g.rewind}
      onUndo={hist.undo}
      onRedo={hist.redo}
      canUndo={hist.canUndo}
      canRedo={hist.canRedo}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};
