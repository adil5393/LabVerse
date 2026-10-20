/**
 * Motion Laboratory: Free Laboratory for one-dimensional motion (PHY-1A).
 * Full integration with the Blender-inspired scientific workstation (Workspace V3).
 */

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  compareRatePrediction,
  comparePrediction,
  experimentById,
  MOTION_EXPERIMENTS,
  routeRates,
  routeValues,
  type MotionExperiment,
  type PredictionFeedback,
} from '../../../engine/physics/motion/experiments';
import { MotionHistory, MotionMessage, MotionMoveButtons, MotionParameterFields, MotionPlaybackControls, MotionReadout, MotionScene, useMotionTrack } from './MotionTrack';
import { MotionTimeGraphs } from './MotionTimeGraph';
import { PHYS } from './physicsColors';
import { speedVelocityLines, wholeTrip, pathFromRoute } from '../../../engine/physics/motion/speed';
import { DockTabs, LabOutliner, ViewportFrame, WorkspaceShell, useSceneState, type DockTab, type SceneObject } from '../../workspace';
import { LabButton, LabInspectorSection, LabParameterField, LabToolbarDivider } from '../../workspace/controls';

const RatePrediction: React.FC<{
  e: MotionExperiment;
  routeIndex: number;
  onRun: (moves: number[], durations?: number[]) => void;
}> = ({ e, routeIndex, onRun }) => {
  const r = e.routes[routeIndex];
  const [sp, setSp] = useState('');
  const [ve, setVe] = useState('');
  const [fb, setFb] = useState<ReturnType<typeof compareRatePrediction> | null>(null);
  const [bad, setBad] = useState('');
  const check = (ev: React.FormEvent) => {
    ev.preventDefault();
    const a = Number(sp.replace('−', '-')),
      b = Number(ve.replace('−', '-'));
    if (sp.trim() === '' || ve.trim() === '' || !Number.isFinite(a) || !Number.isFinite(b)) {
      setBad('Type a number for both predictions (use a minus sign for a velocity to the left).');
      setFb(null);
      return;
    }
    setBad('');
    setFb(compareRatePrediction(routeRates(e, r), { speed: a, velocity: b }));
  };
  const lines = speedVelocityLines(
    wholeTrip(
      pathFromRoute(
        { startM: e.start, legs: r.moves.map((m, i) => ({ toM: m, durationS: r.durations?.[i] ?? 1 })) },
        e.range
      )
    )
  );
  const ok = fb && fb.speedRight && fb.velocityRight;
  return (
    <form
      onSubmit={check}
      className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3"
      data-prediction={r.id}
    >
      <p className="text-sm text-slate-100 font-medium">{r.label}</p>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}
      >
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>
          ★ 1 · Prediction (whole trip, before you run it)
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-200 flex items-center gap-2">
            <span style={{ color: PHYS.speed }}>Average speed (m/s)</span>
            <input
              value={sp}
              onChange={(x) => setSp(x.target.value)}
              inputMode="decimal"
              aria-label={`Predicted average speed in metres per second for ${r.label}`}
              className="w-24 min-h-[36px] rounded-lg border bg-surface-lowest px-2 text-white font-mono"
              style={{ borderColor: PHYS.prediction }}
            />
          </label>
          <label className="text-xs text-slate-200 flex items-center gap-2">
            <span style={{ color: PHYS.velocity }}>Average velocity (m/s)</span>
            <input
              value={ve}
              onChange={(x) => setVe(x.target.value)}
              inputMode="decimal"
              aria-label={`Predicted average velocity in metres per second for ${r.label}`}
              className="w-24 min-h-[36px] rounded-lg border bg-surface-lowest px-2 text-white font-mono"
              style={{ borderColor: PHYS.prediction }}
            />
          </label>
          <LabButton
            type="submit"
            size="sm"
            icon={<span className="material-symbols-outlined text-[15px]">verified</span>}
            style={{ background: PHYS.prediction, borderColor: PHYS.prediction, color: '#0f172a' }}
            className="font-bold border-2"
          >
            Check my prediction
          </LabButton>
        </div>
      </div>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}
      >
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>
          ▶ 2 · Action
        </h4>
        <LabButton
          type="button"
          size="sm"
          onClick={() => onRun(r.moves, r.durations)}
          icon={<span className="material-symbols-outlined text-[15px]">play_arrow</span>}
          style={{ background: PHYS.position, borderColor: PHYS.position, color: '#0f172a' }}
          className="font-bold border-2"
          data-testid={`run-${r.id}`}
        >
          Run this route in the track
        </LabButton>
      </div>
      {bad && (
        <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }}>
          {bad}
        </p>
      )}
      {fb && (
        <div
          role="status"
          aria-live="polite"
          data-testid="prediction-feedback"
          className="rounded-lg p-3 text-xs text-slate-100 space-y-1"
          style={{
            border: `1px solid ${ok ? PHYS.correct : PHYS.error}`,
            background: `${ok ? PHYS.correct : PHYS.error}14`,
          }}
        >
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: ok ? PHYS.correct : PHYS.error }}>
            {ok ? '✓ 3 · Observation: matches the model' : '✗ 3 · Observation: differs from the model'}
          </h4>
          <p style={{ color: PHYS.speed }} data-testid="calc-speed">
            {lines.speed}
          </p>
          <p style={{ color: PHYS.velocity }} data-testid="calc-velocity">
            {lines.velocity}
          </p>
          <p>{lines.direction}</p>
          {fb.messages.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
    </form>
  );
};

const Prediction: React.FC<{
  e: MotionExperiment;
  routeIndex: number;
  onRun: (moves: number[], durations?: number[]) => void;
}> = ({ e, routeIndex, onRun }) => {
  const r = e.routes[routeIndex];
  const [dist, setDist] = useState('');
  const [disp, setDisp] = useState('');
  const [fb, setFb] = useState<
    (PredictionFeedback & { distanceM: number; displacementM: number }) | null
  >(null);
  const check = (ev: React.FormEvent) => {
    ev.preventDefault();
    const d = Number(dist.replace('−', '-')),
      s = Number(disp.replace('−', '-'));
    if (dist.trim() === '' || disp.trim() === '' || !Number.isFinite(d) || !Number.isFinite(s)) {
      setFb({
        distanceRight: false,
        displacementRight: false,
        messages: ['Type a number for both predictions (use a minus sign for displacement to the left).'],
        distanceM: NaN,
        displacementM: NaN,
      });
      return;
    }
    const actual = routeValues(e, r);
    setFb({ ...comparePrediction(actual, { distanceM: d, displacementM: s }), ...actual });
  };
  const ok = fb && fb.distanceRight && fb.displacementRight;
  return (
    <form
      onSubmit={check}
      className="rounded-xl border border-surface-border bg-surface-card p-3 space-y-3"
      data-prediction={r.id}
    >
      <p className="text-sm text-slate-100 font-medium">{r.label}</p>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>
          ★ 1 · Prediction (before you run it)
        </h4>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-200 flex items-center gap-2">
            <span style={{ color: PHYS.distance }}>Distance (m)</span>
            <input
              value={dist}
              onChange={(x) => setDist(x.target.value)}
              inputMode="decimal"
              aria-label={`Predicted distance in metres for ${r.label}`}
              className="w-24 min-h-[36px] rounded-lg border bg-surface-lowest px-2 text-white font-mono"
              style={{ borderColor: PHYS.prediction }}
            />
          </label>
          <label className="text-xs text-slate-200 flex items-center gap-2">
            <span style={{ color: PHYS.displacement }}>Displacement (m)</span>
            <input
              value={disp}
              onChange={(x) => setDisp(x.target.value)}
              inputMode="decimal"
              aria-label={`Predicted displacement in metres for ${r.label}`}
              className="w-24 min-h-[36px] rounded-lg border bg-surface-lowest px-2 text-white font-mono"
              style={{ borderColor: PHYS.prediction }}
            />
          </label>
          <LabButton
            type="submit"
            size="sm"
            icon={<span className="material-symbols-outlined text-[15px]">verified</span>}
            style={{ background: PHYS.prediction, borderColor: PHYS.prediction, color: '#0f172a' }}
            className="font-bold border-2"
          >
            Check my prediction
          </LabButton>
        </div>
      </div>
      <div
        className="rounded-lg p-3 space-y-2"
        style={{ border: `1px solid ${PHYS.position}66`, background: `${PHYS.position}0D` }}
      >
        <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.position }}>
          ▶ 2 · Action
        </h4>
        <LabButton
          type="button"
          size="sm"
          onClick={() => onRun(r.moves)}
          icon={<span className="material-symbols-outlined text-[15px]">play_arrow</span>}
          style={{ background: PHYS.position, borderColor: PHYS.position, color: '#0f172a' }}
          className="font-bold border-2"
          data-testid={`run-${r.id}`}
        >
          Run this route in the track
        </LabButton>
      </div>
      {fb && (
        <div
          role="status"
          aria-live="polite"
          data-testid="prediction-feedback"
          className="rounded-lg p-3 text-xs text-slate-100 space-y-1"
          style={{
            border: `1px solid ${ok ? PHYS.correct : PHYS.error}`,
            background: `${ok ? PHYS.correct : PHYS.error}14`,
          }}
        >
          <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: ok ? PHYS.correct : PHYS.error }}>
            {ok ? '✓ 3 · Observation: matches the model' : '✗ 3 · Observation: differs from the model'}
          </h4>
          {Number.isFinite(fb.distanceM) && (
            <p>
              Model values: <span style={{ color: PHYS.distance }}>distance {fb.distanceM} m</span>,{' '}
              <span style={{ color: PHYS.displacement }}>displacement {fb.displacementM} m</span>.
            </p>
          )}
          {fb.messages.map((m) => (
            <p key={m}>{m}</p>
          ))}
        </div>
      )}
    </form>
  );
};


export const MotionLab: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const exp = experimentById(params.get('experiment'));
  const [load, setLoad] = useState<{ moves: number[]; durations?: number[]; key: number }>({ moves: [], key: 0 });
  // Free exploration lets the student configure the track; an investigation fixes it (its numbers are part of the question).
  const [freeRange, setFreeRange] = useState<[number, number]>([-50, 100]);
  const [freeStart, setFreeStart] = useState(0);
  const expId = exp?.id;
  const range = useMemo<[number, number]>(() => exp?.range ?? freeRange, [exp, freeRange]);
  const start = exp?.start ?? freeStart;
  const locked = Boolean(exp);

  const m = useMotionTrack({ range, start, moves: load.moves, durations: load.durations, editable: true, show: ['position', 'distance', 'displacement', 'speed', 'velocity'], stepM: 5 });
  const scene = useSceneState(['object', 'track', 'origin']);
  const [beginnerMode, setBeginnerMode] = useState(false);
  const alt = `A straight track from ${range[0]} m to ${range[1]} m with reference origin O at 0 m. Move the object with buttons or keyboard.`;
  const resetLoad = () => setLoad((l) => ({ moves: [], key: l.key + 1 }));

  const pick = (id?: string) => { setParams(id ? { experiment: id } : {}); resetLoad(); };

  const SCENE_OBJECTS: SceneObject[] = [
    { id: 'object', name: 'Moving_Object', category: 'Object / Kinematics', icon: 'toys', badge: `${m.s.positionCm / 100} m` },
    { id: 'track', name: `Track_[${range[0]}, ${range[1]}]m`, category: 'Environment / Track', icon: 'straighten' },
    { id: 'origin', name: 'Reference_Origin (0m)', category: 'Measurement / Reference', icon: 'navigation' },
  ];
  const outlinerContent = (
    <LabOutliner
      investigations={MOTION_EXPERIMENTS.map((x) => ({ id: x.id, title: x.title, goal: x.goal }))}
      activeInvestigationId={expId ?? null}
      onSelectInvestigation={(id) => pick(id ?? undefined)}
      objects={SCENE_OBJECTS}
      selectedId={scene.selectedId}
      onSelect={scene.select}
      visibility={scene.visibility}
      onToggleVisibility={scene.toggleVisibility}
      lockMap={scene.lockMap}
      onToggleLock={scene.toggleLock}
    />
  );

  const inspectorContent = (
    <div className="p-3 space-y-3 text-xs font-sans" data-testid="motion-inspector">
      <LabInspectorSection
        title="Track Configuration"
        icon={<span className="material-symbols-outlined text-[15px]">straighten</span>}
        selected={scene.selectedId === 'track' || scene.selectedId === 'origin'}
        locked={locked || scene.isLocked('track')}
        badge={locked ? <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">FIXED</span> : undefined}
      >
        <div className="space-y-1.5 font-mono">
          <LabParameterField
            id="track-start"
            label="Track start"
            value={range[0]}
            unit="m"
            step={5}
            compact
            symbol="x_min"
            symbolColor="#f59e0b"
            disabled={locked || scene.isLocked('track')}
            ariaLabel="Track start in metres"
            onChange={(v) => { if (v < freeStart && v < freeRange[1]) { setFreeRange([v, freeRange[1]]); resetLoad(); } }}
          />
          <LabParameterField
            id="track-end"
            label="Track end"
            value={range[1]}
            unit="m"
            step={5}
            compact
            symbol="x_max"
            symbolColor="#f59e0b"
            disabled={locked || scene.isLocked('track')}
            ariaLabel="Track end in metres"
            onChange={(v) => { if (v > freeStart && v > freeRange[0]) { setFreeRange([freeRange[0], v]); resetLoad(); } }}
          />
          <LabParameterField
            id="track-start-pos"
            label="Start position"
            value={start}
            unit="m"
            step={5}
            compact
            symbol="x₀"
            symbolColor="#38bdf8"
            disabled={locked || scene.isLocked('track')}
            ariaLabel="Start position in metres"
            onChange={(v) => { if (v >= freeRange[0] && v <= freeRange[1]) { setFreeStart(v); resetLoad(); } }}
          />
        </div>
        {locked && (
          <p className="mt-1 text-[10px] text-amber-400/90 font-mono bg-amber-400/10 p-2 rounded-lg border border-amber-400/20">
            Fixed by this investigation. Pick Free Exploration to change the track.
          </p>
        )}
      </LabInspectorSection>

      <LabInspectorSection
        title="Motion Parameters"
        icon={<span className="material-symbols-outlined text-[15px]">tune</span>}
        selected={scene.selectedId === 'object'}
        locked={scene.isLocked('object')}
      >
        <MotionParameterFields m={m} stacked />
        <MotionMessage m={m} />
      </LabInspectorSection>

      <div className="pt-1">
        <LabButton
          type="button"
          variant="secondary"
          size="sm"
          onClick={resetLoad}
          icon={<span className="material-symbols-outlined text-[15px]">restart_alt</span>}
          className="w-full justify-center font-semibold"
        >
          Reset experiment to start
        </LabButton>
      </div>

      {exp && (
        <LabInspectorSection
          title={`Investigation ${exp.id}: Concept`}
          icon={<span className="material-symbols-outlined text-[15px] text-primary">school</span>}
        >
          <p className="text-xs text-slate-300 leading-relaxed">{exp.goal}</p>
          <div className="p-2.5 rounded-lg bg-surface-lowest text-[11px] text-emerald-300 border border-emerald-500/25 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-[14px] shrink-0 text-emerald-400 mt-0.5">check_circle</span>
            <div><strong>Notice:</strong> {exp.lesson}</div>
          </div>
        </LabInspectorSection>
      )}
    </div>
  );

  const viewportContent = (
    <ViewportFrame
      toolbar={
        <div className="flex items-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 max-w-full">
          <MotionMoveButtons m={m} compact />
          {m.path.legs.length > 0 && (
            <>
              <LabToolbarDivider vertical className="hidden sm:block" />
              <MotionPlaybackControls m={m} compact />
            </>
          )}
        </div>
      }
      footnote={<>Simulated time t = {(m.s.tMs / 1000).toFixed(1)} s · positions are exact in this model · right is positive</>}
    >
      <div data-visual="motionTrack" data-testid="motion-track" className="w-full h-full min-h-0 flex items-center justify-center">
        <MotionScene m={m} alt={alt} fill scene={{ visibility: scene.visibility, lockMap: scene.lockMap, selectedId: scene.selectedId, onSelect: scene.select }} />
      </div>
    </ViewportFrame>
  );

  const explanation = (
    <div className="space-y-2 text-xs text-slate-200 max-w-3xl" data-testid="motion-explanation">
      <p data-testid="motion-live" role="status" aria-live="polite">{m.live}</p>
      <p><strong>Distance</strong> is the total length of the route and never decreases. <strong>Displacement</strong> is the signed change of position from the start, so it can shrink or change sign when the object turns back.</p>
      <p><strong>Speed</strong> = distance ÷ time has no direction. <strong>Velocity</strong> = displacement ÷ time keeps the sign: negative means leftward.</p>
      {exp && <p className="text-emerald-300"><strong>Notice:</strong> {exp.lesson}</p>}
    </div>
  );

  const investigation = exp ? (
    <div className="space-y-3" data-testid="experiment-panel">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-primary font-bold">Investigation {exp.id}: {exp.title}</span>
        <span className="text-outline">Predict → Run → Compare</span>
      </div>
      {exp.routes.map((_r, i) =>
        exp.predict === 'speed' ? (
          <RatePrediction key={`${exp.id}-${i}`} e={exp} routeIndex={i} onRun={(moves, durations) => setLoad((l) => ({ moves, durations, key: l.key + 1 }))} />
        ) : (
          <Prediction key={`${exp.id}-${i}`} e={exp} routeIndex={i} onRun={(moves) => setLoad((l) => ({ moves, key: l.key + 1 }))} />
        )
      )}
    </div>
  ) : (
    <div className="text-xs space-y-1 text-slate-300" data-testid="experiment-panel">
      <p className="font-mono">Free Exploration: move the object along the track and read the live measurements, data and graphs.</p>
      <p className="text-outline">Select an investigation in the Explorer to compare your predictions against the model.</p>
    </div>
  );

  const tabs: DockTab[] = [
    { id: 'measurements', label: 'Measurements', content: <MotionReadout m={m} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2" /> },
    { id: 'data', label: 'Data', content: <MotionHistory m={m} /> },
    { id: 'graphs', label: 'Graphs', content: <MotionTimeGraphs path={m.path} tMs={m.tMs} /> },
    { id: 'explanation', label: 'Explanation', content: explanation },
    { id: 'investigation', label: exp ? `Investigation ${exp.id}` : 'Investigation', content: investigation },
  ];

  return (
    <WorkspaceShell
      chapterId="motion"
      labTitle="Motion Laboratory"
      outliner={outlinerContent}
      outlinerTitle="Investigations"
      viewport={viewportContent}
      inspector={inspectorContent}
      inspectorTitle="Motion Inspector"
      analysisDock={<DockTabs key={expId ?? 'free'} tabs={tabs} initial={exp ? 'investigation' : 'measurements'} />}
      experimentSetupSnapshot={load}
      playing={m.playing}
      onTogglePlay={m.path.legs.length > 0 ? m.togglePlay : undefined}
      onReset={m.reset}
      onUndo={m.undo}
      canUndo={m.path.legs.length > 0}
      beginnerMode={beginnerMode}
      onToggleBeginnerMode={setBeginnerMode}
    />
  );
};
