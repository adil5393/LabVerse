/**
 * The Motion track: a one-dimensional laboratory figure (PHY-1A).
 *
 * One authoritative model (engine/physics/motion/kinematics.ts) holds the path. This component only
 * asks the model "what is true at simulated time t?" and draws the answer; positions, distance,
 * displacement, the history strip and the live sentence all come from the same sample.
 * Playback moves the clock `t`; a rendering frame never decides the physics. The playback speed
 * control changes how fast the clock runs on screen and is not a physical speed.
 *
 * Every action works from the keyboard and with buttons (no dragging needed); dragging the object
 * only chooses a position to move to. With reduced motion, Play steps the clock one simulated second
 * at a time instead of animating continuously.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import {
  addMove, addMoveBy, cm, describeDisplacement, describePosition, fmtLength, fmtM, fmtSigned, metres, resetPath, sampleAt, summary, tickClock,
  totalDurationMs, turnCount, undoMove, type MotionPath,
} from '../../../engine/physics/motion/kinematics';
import { pathOf, type MotionVisualProps, type Readout } from '../../../engine/physics/motion/learn/questions';
import { fmtRate, fmtSignedRate, intervalStats, velocityAt } from '../../../engine/physics/motion/speed';
import { useReducedMotion } from './useReducedMotion';
import { CircularMotionVisual } from './CircularMotion';
import { DerivationVisual } from './DerivationView';
import { MotionGraphsVisual } from './MotionGraphs';
import { PHYS, QUANTITY, type PhysQuantity } from './physicsColors';
import { LabButton, LabMeasurement, LabSelect, LabSlider } from '../../workspace/controls';
import { ExperimentSetupGroup, ModelAssumptions } from '../shared/controls';

const W = 600, H = 230, PAD = 28, TRACK_Y = 110;
const C = { track: PHYS.axis, origin: PHYS.origin, route: PHYS.distance, obj: PHYS.position, text: '#e2e8f0', disp: PHYS.displacement, time: PHYS.time };

const niceStep = (spanM: number): number => { for (const s of [1, 2, 5, 10, 20, 25, 50, 100]) if (spanM / s <= 8) return s; return 200; };

export interface MotionTrackHandle { path: MotionPath; tMs: number }

interface ViewProps {
  range: [number, number];
  start: number;
  moves: number[];
  durations?: number[];
  editable: boolean;
  show: Readout[];
  stepM: number;
  playback: boolean;
  alt: string;
  /** Called with the current path whenever it changes (the lab uses this to compare predictions with the model). */
  onPath?: (p: MotionPath) => void;
}

export const Card: React.FC<{ q: PhysQuantity; value: string; id: string }> = ({ q, value, id }) => {
  const m = QUANTITY[q];
  return (
    <LabMeasurement
      title={m.label}
      symbol={m.symbol}
      accentColor={m.color}
      value={value}
      readoutId={id}
      subtitle={m.hint}
      testId={`card-${id}`}
      compact
    />
  );
};

/** All state and actions of one motion track. The lab slots (scene, toolbar, inspector, dock) and the lesson composite all read the same instance. */
export const useMotionTrack = ({ range, start, moves, durations, editable, show, stepM, onPath }: Pick<ViewProps, 'range' | 'start' | 'moves' | 'durations' | 'editable' | 'show' | 'stepM' | 'onPath'>) => {
  const initial = useMemo(() => pathOf({ range, start, moves, durations }), [range, start, moves, durations]);
  const [moveS, setMoveS] = useState(1);
  const [path, setPath] = useState<MotionPath>(initial);
  const [prevInitial, setPrevInitial] = useState(initial);
  const [tMs, setT] = useState(totalDurationMs(initial));
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [step, setStep] = useState(stepM);
  const [typed, setTyped] = useState('');
  const [msg, setMsg] = useState('');
  const reduced = useReducedMotion();
  const dragging = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const simTimeRef = useRef(tMs);
  if (prevInitial !== initial) { const initT = totalDurationMs(initial); setPrevInitial(initial); setPath(initial); simTimeRef.current = initT; setT(initT); setPlaying(false); setMsg(''); }

  const total = totalDurationMs(path);
  const s = sampleAt(path, tMs);
  const end = summary(path);
  const atEnd = tMs >= total;
  const st = intervalStats(path, 0, tMs);

  useEffect(() => { onPath?.(path); }, [path, onPath]);

  if (!playing) {
    simTimeRef.current = tMs;
  }

  // ---- playback: the clock only chooses WHICH simulated time to draw ----
  const stateRef = useRef({ tMs, total, rate });
  useEffect(() => { stateRef.current = { tMs, total, rate }; });
  useEffect(() => {
    if (!playing) return;
    simTimeRef.current = tMs;
    if (reduced) {
      const id = window.setInterval(() => {
        const { total: tot } = stateRef.current;
        const next = Math.min(tot, (Math.floor(simTimeRef.current / 1000) + 1) * 1000);
        simTimeRef.current = next;
        setT(next);
        if (next >= tot) setPlaying(false);
      }, 800);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(Math.max(0, now - last), 100);
      last = now;
      const { total: tot, rate: r } = stateRef.current;
      const next = tickClock(simTimeRef.current, dt, r, tot);
      simTimeRef.current = next;
      setT(next);
      if (next >= tot) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  // ---- actions (each one appends to the model; none touches the clock logic) ----
  const apply = (r: ReturnType<typeof addMove>) => {
    if (!r.ok) { setMsg(r.reason); return; }
    const nextT = totalDurationMs(r.path);
    simTimeRef.current = nextT;
    setMsg(''); setPath(r.path); setT(nextT); setPlaying(false);
  };
  const moveBy = (d: number) => apply(addMoveBy(path, d, moveS * 1000));
  const goTo = (target: number) => apply(addMove(path, target, moveS * 1000));
  const wait = () => apply(addMove(path, metres(end.positionCm), moveS * 1000));
  const onType = (e: React.FormEvent) => { e.preventDefault(); const v = Number(typed.replace('−', '-')); if (typed.trim() === '' || !Number.isFinite(v)) { setMsg('Type a position in metres, such as 40 or -15.'); return; } goTo(v); setTyped(''); };
  const undo = () => { const p2 = undoMove(path); const nextT = totalDurationMs(p2); simTimeRef.current = nextT; setPath(p2); setT(nextT); setPlaying(false); setMsg(''); };
  const reset = () => { const p2 = resetPath(path); simTimeRef.current = 0; setPath(p2); setT(0); setPlaying(false); setMsg(''); };
  const togglePlay = () => { if (atEnd) { simTimeRef.current = 0; setT(0); } setPlaying((p) => !p); };
  const stepBack = () => { setPlaying(false); const next = Math.max(0, Math.ceil(simTimeRef.current / 1000) * 1000 - 1000); simTimeRef.current = next; setT(next); };
  const stepForward = () => { setPlaying(false); const next = Math.min(total, Math.floor(simTimeRef.current / 1000) * 1000 + 1000); simTimeRef.current = next; setT(next); };
  const scrub = (v: number) => { setPlaying(false); simTimeRef.current = v; setT(v); };

  const turned = turnCount(path) > 0 && s.distanceCm > Math.abs(s.displacementCm) + 0.5;
  const live = `At t = ${(s.tMs / 1000).toFixed(s.tMs % 1000 ? 1 : 0)} s (simulated time) the object is at ${describePosition(s.positionCm)}. Distance travelled so far: ${fmtLength(s.distanceCm)}. Displacement from the start: ${describeDisplacement(s.displacementCm)}.${turned ? ' The object has turned back, so the distance is greater than the size of the displacement.' : ''}${show.includes('speed') && st.averageSpeed !== null ? ` Average speed so far: ${fmtRate(st.averageSpeed)}.` : ''}${show.includes('velocity') && st.averageVelocity !== null ? ` Average velocity so far: ${fmtSignedRate(st.averageVelocity)}; velocity at this instant: ${fmtSignedRate(velocityAt(path, s.tMs))}.` : ''}`;

  return {
    range, start, editable, show, path, s, st, tMs, total, atEnd, playing, rate, setRate, reduced, step, setStep, moveS, setMoveS, typed, setTyped, msg, live,
    dragging, svgRef, moveBy, goTo, wait, onType, undo, reset, togglePlay, stepBack, stepForward, scrub,
  };
};
export type MotionTrackModel = ReturnType<typeof useMotionTrack>;

/** The apparatus: track, ticks, origin, start marker, history rows, displacement arrow and the object. `fill` sizes it to its container. */
/** Workstation hooks for the scene: which objects are shown, which are locked, and the selection (the Inspector follows it). */
export interface MotionSceneObjects {
  visibility: Record<string, boolean>;
  lockMap: Record<string, boolean>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const MotionScene: React.FC<{ m: MotionTrackModel; alt: string; fill?: boolean; scene?: MotionSceneObjects }> = ({ m, alt, fill, scene }) => {
  const { path, s, tMs, step, dragging, svgRef } = m;
  const shown = (id: string) => scene?.visibility[id] !== false;
  const picked = (id: string) => scene?.selectedId === id;
  // A locked object cannot be dragged or nudged with the keys.
  const editable = m.editable && !scene?.lockMap.object;
  const span = metres(path.maxCm - path.minCm);
  const X = (cmv: number) => PAD + ((cmv - path.minCm) / (path.maxCm - path.minCm)) * (W - 2 * PAD);
  const tickStep = niceStep(span);
  const ticks: number[] = [];
  for (let v = Math.ceil(metres(path.minCm) / tickStep) * tickStep; v <= metres(path.maxCm) + 1e-9; v += tickStep) ticks.push(Math.round(v * 100) / 100);

  const fromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const frac = Math.min(1, Math.max(0, (x - PAD) / (W - 2 * PAD)));
    const mm = metres(path.minCm + frac * (path.maxCm - path.minCm));
    return Math.round(mm / Math.min(step, 1)) * Math.min(step, 1);
  };
  const keys = (e: React.KeyboardEvent) => {
    if (!editable) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); m.moveBy(step); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); m.moveBy(-step); }
  };
  const shownLegs = path.legs.map((l, i) => {
    const before = path.legs.slice(0, i).reduce((a, b) => a + b.durationMs, 0);
    const frac = Math.min(1, Math.max(0, (tMs - before) / l.durationMs));
    return { l, i, frac };
  }).filter((x) => x.frac > 0);

  return (
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="group" aria-label={alt}
      className={`${fill ? 'w-full h-full max-h-full' : 'w-full'} rounded-xl bg-surface-lowest border border-surface-border select-none`}
      data-no-pan
      style={{ touchAction: editable ? 'none' : 'auto' }}
      onPointerDown={(e) => { if (e.target === e.currentTarget) scene?.onSelect(null); }}
      onPointerMove={(e) => { if (dragging.current) m.setTyped(String(fromEvent(e))); }}
      onPointerUp={(e) => { if (dragging.current) { dragging.current = false; m.goTo(fromEvent(e)); m.setTyped(''); } }} onPointerCancel={() => { dragging.current = false; }}>
      <title>{alt}</title>
      {shown('track') && <line x1={PAD} y1={TRACK_Y} x2={W - PAD} y2={TRACK_Y} stroke={picked('track') ? '#00d4ff' : C.track} strokeWidth={picked('track') ? 5 : 3} />}
      {shown('track') && <line x1={PAD} y1={TRACK_Y} x2={W - PAD} y2={TRACK_Y} stroke="transparent" strokeWidth={20} onPointerDown={(e) => { if (scene) { e.stopPropagation(); scene.onSelect('track'); } }} style={scene ? { cursor: 'pointer' } : undefined} />}
      {shown('track') && ticks.map((v) => (
        <g key={v} pointerEvents="none">
          <line x1={X(cm(v))} y1={TRACK_Y - (v === 0 ? 14 : 7)} x2={X(cm(v))} y2={TRACK_Y + (v === 0 ? 14 : 7)} stroke={v === 0 ? C.origin : C.track} strokeWidth={v === 0 ? 3 : 1.5} />
          <text x={X(cm(v))} y={TRACK_Y + 28} textAnchor="middle" fill={v === 0 ? C.origin : '#94a3b8'} fontSize={12} fontWeight={v === 0 ? 700 : 400}>{v < 0 ? `−${Math.abs(v)}` : v}</text>
        </g>
      ))}
      {shown('origin') && <text x={X(0)} y={TRACK_Y + 43} textAnchor="middle" fill={picked('origin') ? '#00d4ff' : C.origin} fontSize={12} fontWeight={800} onPointerDown={(e) => { if (scene) { e.stopPropagation(); scene.onSelect('origin'); } }} style={scene ? { cursor: 'pointer' } : undefined}>O (reference point)</text>}
      <text x={W - PAD} y={TRACK_Y + 62} textAnchor="end" fill="#94a3b8" fontSize={11} pointerEvents="none">position (m); right is positive</text>

      {/* start marker */}
      <g pointerEvents="none"><path d={`M ${X(path.startCm)} ${TRACK_Y + 5} l -5 -9 h 10 z`} fill={C.obj} /><text x={X(path.startCm)} y={TRACK_Y + 76} textAnchor="middle" fill={C.obj} fontSize={11}>▲ start {fmtM(path.startCm)}</text></g>

      {/* history: one row per leg, arrow head shows the direction (not colour alone) */}
      {shownLegs.map(({ l, i, frac }) => {
        const y = TRACK_Y - 38 - (i % 5) * 14;
        const x1 = X(l.fromCm), x2 = X(l.fromCm + (l.toCm - l.fromCm) * frac);
        const dir = l.toCm > l.fromCm ? 1 : l.toCm < l.fromCm ? -1 : 0;
        const col = dir === 0 ? C.track : C.route;
        return (
          <g key={i} pointerEvents="none">
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={col} strokeWidth={3} strokeDasharray={dir < 0 ? '6 3' : undefined} />
            {dir !== 0 && <path d={`M ${x2} ${y} l ${-dir * 8} -5 v 10 z`} fill={col} />}
            <text x={Math.min(x1, x2) - 4} y={y + 4} textAnchor="end" fill={C.text} fontSize={10}>{i + 1}</text>
          </g>
        );
      })}

      {/* displacement arrow from the start to the object */}
      {Math.abs(s.displacementCm) > 0.5 && (
        <g pointerEvents="none">
          <line x1={X(path.startCm)} y1={TRACK_Y + 92} x2={X(s.positionCm)} y2={TRACK_Y + 92} stroke={C.disp} strokeWidth={4} />
          <path d={`M ${X(s.positionCm)} ${TRACK_Y + 92} l ${s.displacementCm > 0 ? -9 : 9} -6 v 12 z`} fill={C.disp} />
          <text x={(X(path.startCm) + X(s.positionCm)) / 2} y={TRACK_Y + 110} textAnchor="middle" fill={C.disp} fontSize={11}>displacement {fmtSigned(s.displacementCm)}</text>
        </g>
      )}

      <g pointerEvents="none" fontSize={10}>
        <text x={W - PAD} y={14} textAnchor="end" fill={C.route}>{'─▶'} route travelled (distance), dashed = leftward</text>
        <text x={W - PAD} y={28} textAnchor="end" fill={C.disp}>{'━▶'} displacement (start to now)</text>
      </g>
      {/* the object */}
      {shown('object') && <g className="group outline-none" {...(editable ? { role: 'button', tabIndex: 0, 'aria-label': `The object at ${fmtM(s.positionCm)}. Left and right arrow keys move it ${step} m, one second of simulated time per move.`, style: { cursor: 'grab' }, onKeyDown: keys, onPointerDown: (e: React.PointerEvent) => { scene?.onSelect('object'); dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); } } : { onPointerDown: (e: React.PointerEvent) => { if (scene) { e.stopPropagation(); scene.onSelect('object'); } } })}>
        {editable && <circle cx={X(s.positionCm)} cy={TRACK_Y} r={48} fill="transparent" />}
        {editable && <circle cx={X(s.positionCm)} cy={TRACK_Y} r={17} fill="none" strokeWidth={3} className="stroke-transparent group-focus:stroke-white" pointerEvents="none" />}
        <circle cx={X(s.positionCm)} cy={TRACK_Y} r={11} fill={C.obj} stroke="#0f172a" strokeWidth={2} pointerEvents="none" />
        {picked('object') && <circle cx={X(s.positionCm)} cy={TRACK_Y} r={18} fill="none" stroke="#00d4ff" strokeWidth={2} strokeDasharray="4 3" pointerEvents="none" />}
        <text x={X(s.positionCm)} y={TRACK_Y - 18} textAnchor="middle" fill={C.obj} fontSize={12} fontWeight={800} pointerEvents="none">{fmtSigned(s.positionCm)}</text>
      </g>}
    </svg>
  );
};

export const MotionLive: React.FC<{ m: MotionTrackModel }> = ({ m }) => (
  <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="motion-live">{m.live}</div>
);

export const MotionReadout: React.FC<{ m: MotionTrackModel; className?: string }> = ({ m, className }) => {
  const { s, st, show, path } = m;
  return (
    <dl className={className ?? 'grid grid-cols-2 lg:grid-cols-4 gap-2'} data-testid="motion-readout">
      <Card q="time" value={`${(s.tMs / 1000).toFixed(1)} s`} id="time" />
      {show.includes('position') && <Card q="position" value={fmtSigned(s.positionCm)} id="position" />}
      {show.includes('distance') && <Card q="distance" value={fmtLength(s.distanceCm)} id="distance" />}
      {show.includes('displacement') && <Card q="displacement" value={fmtSigned(s.displacementCm)} id="displacement" />}
      {show.includes('speed') && <Card q="speed" value={st.averageSpeed === null ? '—' : fmtRate(st.averageSpeed)} id="speed" />}
      {show.includes('velocity') && <Card q="velocity" value={st.averageVelocity === null ? '—' : fmtSignedRate(st.averageVelocity)} id="velocity" />}
      {show.includes('velocity') && <Card q="instant" value={fmtSignedRate(velocityAt(path, s.tMs))} id="instant" />}
    </dl>
  );
};

export const MotionHistory: React.FC<{ m: MotionTrackModel }> = ({ m }) => (
  m.path.legs.length > 0 ? (
    <ol className="text-xs text-slate-300 space-y-0.5 pl-5 list-decimal" aria-label="History of moves" data-testid="motion-history">
      {m.path.legs.map((l, i) => <li key={i}>{l.toCm === l.fromCm ? `Stayed at ${fmtM(l.toCm)} for ${l.durationMs / 1000} s` : `${fmtM(l.fromCm)} → ${fmtM(l.toCm)}: ${fmtLength(l.toCm - l.fromCm)} to the ${l.toCm > l.fromCm ? 'right' : 'left'} in ${l.durationMs / 1000} s`}</li>)}
    </ol>
  ) : <p className="text-xs text-slate-400" data-testid="motion-history-empty">No moves yet. Use the Left / Right buttons under the track, drag the object, or type a position in the Inspector.</p>
);

export const MotionMessage: React.FC<{ m: MotionTrackModel }> = ({ m }) => (
  m.msg ? <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="motion-message"><span aria-hidden>{'✗ '}</span>{m.msg}</p> : null
);

/** The three direct actions: Left / Wait / Right. In the lab these sit in the viewport toolbar, tied to the track. */
export const MotionMoveButtons: React.FC<{ m: MotionTrackModel; compact?: boolean }> = ({ m, compact }) => {
  const { step, moveS } = m;
  const sz = compact ? 'sm' : 'md';
  return (
    <div role="group" aria-label="Move the object" className="flex items-center overflow-x-auto no-scrollbar gap-1.5 sm:gap-2">
      <LabButton
        type="button"
        size={sz}
        onClick={() => m.moveBy(-step)}
        aria-label={`Move ${step} m to the left (${moveS} s of simulated time)`}
        icon={<span className="material-symbols-outlined text-[15px]">arrow_back</span>}
        className="font-bold border-2"
        style={{
          background: 'rgba(56, 189, 248, 0.15)',
          borderColor: 'rgba(56, 189, 248, 0.6)',
          color: '#bae6fd',
        }}
      >
        Left {step} m
      </LabButton>
      <LabButton
        type="button"
        variant="secondary"
        size={sz}
        onClick={m.wait}
        aria-label={`Stay where you are for ${moveS} seconds of simulated time`}
        icon={<span className="material-symbols-outlined text-[15px]">hourglass_empty</span>}
      >
        Wait {moveS} s
      </LabButton>
      <LabButton
        type="button"
        size={sz}
        onClick={() => m.moveBy(step)}
        aria-label={`Move ${step} m to the right (${moveS} s of simulated time)`}
        icon={<span className="material-symbols-outlined text-[15px]">arrow_forward</span>}
        className="font-bold border-2"
        style={{
          background: 'rgba(56, 189, 248, 0.15)',
          borderColor: 'rgba(56, 189, 248, 0.6)',
          color: '#bae6fd',
        }}
      >
        Right {step} m
      </LabButton>
    </div>
  );
};

/** Step size, time per move, go-to position, undo and reset. In the lab these are the editable Inspector fields. */
export const MotionParameterFields: React.FC<{ m: MotionTrackModel; stacked?: boolean }> = ({ m, stacked }) => {
  const { show } = m;
  return (
    <div className="space-y-3">
      <div className={stacked ? 'space-y-2' : 'flex flex-wrap items-center gap-2'}>
        {(show.includes('speed') || show.includes('velocity')) && (
          <div className="flex items-center justify-between gap-2 text-xs text-slate-300 w-full">
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1" style={{ color: PHYS.time }}>
              <span className="material-symbols-outlined text-[14px]">timer</span>
              <span>Time for each move</span>
            </span>
            <div className="w-28">
              <LabSelect
                compact
                size="sm"
                value={m.moveS}
                onChange={(e) => m.setMoveS(Number(e.target.value))}
                aria-label="Simulated time taken by each move, in seconds"
                data-testid="move-seconds"
                options={[1, 2, 4, 5, 10].map((v) => ({ value: v, label: `${v} s` }))}
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 text-xs text-slate-300 w-full">
          <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">straighten</span>
            <span>Step size</span>
          </span>
          <div className="w-28">
            <LabSelect
              compact
              size="sm"
              value={m.step}
              onChange={(e) => m.setStep(Number(e.target.value))}
              aria-label="Step size of the move buttons, in metres"
              data-testid="step-size"
              options={[1, 2, 5, 10, 20].map((v) => ({ value: v, label: `${v} m` }))}
            />
          </div>
        </div>
      </div>

      <form onSubmit={m.onType} className={stacked ? 'space-y-2 pt-2 border-t border-surface-border/50' : 'flex flex-wrap items-center gap-2'}>
        <div className="flex items-center justify-between gap-2 w-full">
          <label htmlFor="field-goto-pos" className="font-mono text-[11px] text-slate-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-sky-400">pin_drop</span>
            <span>Go to position</span>
          </label>
          <div className="flex items-center rounded-lg border border-surface-border bg-surface-lowest shadow-inner focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40 transition-all overflow-hidden min-h-[32px] w-32 px-2 gap-1">
            <input
              id="field-goto-pos"
              value={m.typed}
              onChange={(e) => m.setTyped(e.target.value)}
              inputMode="decimal"
              aria-label="Position to move to, in metres"
              placeholder="e.g. 40 or -15"
              className="w-full bg-transparent text-white font-mono text-xs font-semibold focus:outline-none text-right"
            />
            <span className="text-[10px] font-mono text-slate-400 select-none">m</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <LabButton
            type="submit"
            variant="primary"
            size="sm"
            icon={<span className="material-symbols-outlined text-[14px]">near_me</span>}
          >
            Move there
          </LabButton>
          <LabButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={m.undo}
            disabled={m.path.legs.length === 0}
            icon={<span className="material-symbols-outlined text-[14px]">undo</span>}
          >
            Undo last move
          </LabButton>
          <LabButton
            type="button"
            variant="destructive"
            size="sm"
            onClick={m.reset}
            data-testid="motion-reset"
            icon={<span className="material-symbols-outlined text-[14px]">refresh</span>}
          >
            Reset
          </LabButton>
        </div>
      </form>
    </div>
  );
};

/** Replay controls (play, step, speed, scrub). `compact` is the single-row version for the viewport toolbar. */
export const MotionPlaybackControls: React.FC<{ m: MotionTrackModel; compact?: boolean }> = ({ m, compact }) => {
  const { tMs, total, s, playing, atEnd, rate, reduced } = m;
  if (m.path.legs.length === 0) return null;
  const sz = compact ? 'sm' : 'md';
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'rounded-xl border border-surface-border bg-surface-card/70 p-3 shadow-sm'}`}
      role="group"
      aria-label="Replay of the recorded path"
      data-testid="motion-playback"
    >
      {!compact && (
        <span className="text-[11px] font-mono w-full text-slate-400 flex items-center gap-1.5" style={{ color: PHYS.time }}>
          <span className="material-symbols-outlined text-[15px]">schedule</span>
          <span>Simulated time: replay the recorded path</span>
        </span>
      )}
      <LabButton
        type="button"
        variant="primary"
        size={sz}
        onClick={m.togglePlay}
        aria-pressed={playing}
        active={playing}
        icon={<span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : atEnd ? 'replay' : 'play_arrow'}</span>}
      >
        {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
      </LabButton>
      <LabButton
        type="button"
        variant="secondary"
        size={sz}
        onClick={m.stepBack}
        aria-label="Step back 1 second of simulated time"
        icon={<span className="material-symbols-outlined text-[14px]">chevron_left</span>}
      >
        {compact ? '−1 s' : 'Step −1 s'}
      </LabButton>
      <LabButton
        type="button"
        variant="secondary"
        size={sz}
        onClick={m.stepForward}
        aria-label="Step forward 1 second of simulated time"
        icon={<span className="material-symbols-outlined text-[14px]">chevron_right</span>}
      >
        {compact ? '+1 s' : 'Step +1 s'}
      </LabButton>
      <div className="flex items-center gap-1 text-xs text-slate-300">
        {!compact && <span className="text-slate-400 font-mono text-[11px]">Replay:</span>}
        <LabSelect
          compact={compact}
          size={sz}
          value={rate}
          onChange={(e) => m.setRate(Number(e.target.value))}
          aria-label="Replay speed on screen. This is not the speed of the object."
          options={[
            { value: 0.5, label: '0.5×' },
            { value: 1, label: '1×' },
            { value: 2, label: '2×' },
          ]}
          className="w-18"
        />
      </div>
      <div className={`grow ${compact ? 'min-w-[120px]' : 'min-w-[160px]'}`}>
        <LabSlider
          compact={compact}
          min={0}
          max={total}
          step={100}
          value={Math.round(tMs)}
          onChange={(e) => m.scrub(Number(e.target.value))}
          aria-label="Simulated time"
          aria-valuetext={`${(s.tMs / 1000).toFixed(1)} seconds`}
        />
      </div>
      {!compact && (
        <p className="basis-full text-[11px] text-slate-400">
          Replay speed only changes how fast the replay runs on screen. The physics depends on simulated time, so the values at a given time never change.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}
        </p>
      )}
    </div>
  );
};

/** The lesson/composite version: Viewport and move buttons first, then live telemetry, and compact settings below. */
export const MotionTrackView: React.FC<ViewProps> = ({ range, start, moves, durations, editable, show, stepM, playback, alt, onPath }) => {
  const m = useMotionTrack({ range, start, moves, durations, editable, show, stepM, onPath });
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="space-y-4" data-visual="motionTrack" data-testid="motion-track">
      {/* 1. Track Scene & Direct Move Actions */}
      <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card/60 to-surface-card/30 p-2 sm:p-3 overflow-hidden shadow-xs space-y-2.5">
        <MotionScene m={m} alt={alt} />
        {editable && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-2 border-t border-surface-border/50">
            <div className="flex flex-wrap items-center gap-2">
              <MotionMoveButtons m={m} />
              <button
                type="button"
                onClick={() => setSetupOpen((o) => !o)}
                aria-expanded={setupOpen}
                aria-controls="motion-setup-panel"
                data-testid="motion-setup-toggle"
                className="min-h-[44px] px-3.5 rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-card text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-colors select-none text-sm"
              >
                <span className="material-symbols-outlined text-base text-sky-400 select-none" aria-hidden>
                  tune
                </span>
                <span>Setup</span>
                <span
                  className="material-symbols-outlined text-sm text-slate-400 transition-transform duration-200 select-none"
                  style={{ transform: setupOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden
                >
                  expand_more
                </span>
              </button>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Step: <strong className="text-white">{m.step} m</strong> ({m.moveS} s)
            </div>
          </div>
        )}
      </div>

      {/* 2. Collapsible Setup Panel (when editable) */}
      {editable && (
        <div
          id="motion-setup-panel"
          hidden={!setupOpen}
          className={!setupOpen ? 'hidden' : 'space-y-3 pt-1 transition-all duration-200'}
          data-testid="motion-controls"
        >
          <ExperimentSetupGroup
            title="Track Settings & Precision Moves"
            icon="tune"
            columns={1}
          >
            <MotionParameterFields m={m} />
          </ExperimentSetupGroup>

          <ModelAssumptions
            summary="Idealized one-dimensional motion model on a calibrated linear scale."
            assumptions={[
              'One-dimensional straight-line motion: Right is positive (+x) and left is negative (−x).',
              'Exact position model: Each move takes simulated time without measurement error or friction loss.',
              'Displacement is the straight-line vector from start to current position, independent of the path taken.',
            ]}
          />
        </div>
      )}

      {/* 3. Measurements and Live Observations */}
      <MotionLive m={m} />
      <MotionReadout m={m} />
      {m.path.legs.length > 0 && <MotionHistory m={m} />}
      <MotionMessage m={m} />
      {playback && <MotionPlaybackControls m={m} />}
    </div>
  );
};

const MotionTrack: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as MotionVisualProps;
  return <MotionTrackView range={p.range} start={p.start} moves={p.moves} durations={p.durations} editable={Boolean(p.editable)} show={p.show ?? ['position', 'distance', 'displacement']} stepM={p.stepM ?? 5} playback={p.playback ?? (p.moves.length > 1 || Boolean(p.editable))} alt={alt} />;
};

export const MOTION_VISUALS: VisualRegistry = { motionTrack: MotionTrack, motionGraphs: MotionGraphsVisual, circularMotion: CircularMotionVisual, derivation: DerivationVisual };
