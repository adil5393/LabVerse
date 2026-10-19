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

const W = 600, H = 230, PAD = 28, TRACK_Y = 110;
const C = { track: '#64748b', origin: '#fbbf24', right: '#34d399', left: '#f59e0b', obj: '#a78bfa', text: '#e2e8f0', disp: '#38bdf8' };

const niceStep = (spanM: number): number => { for (const s of [1, 2, 5, 10, 20, 25, 50, 100]) if (spanM / s <= 8) return s; return 200; };

export interface MotionTrackHandle { path: MotionPath; tMs: number }

interface ViewProps {
  range: [number, number];
  start: number;
  moves: number[];
  editable: boolean;
  show: Readout[];
  stepM: number;
  playback: boolean;
  alt: string;
  /** Called with the current path whenever it changes (the lab uses this to compare predictions with the model). */
  onPath?: (p: MotionPath) => void;
}

const useReducedMotion = (): boolean => {
  const [r, setR] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const f = () => setR(m.matches);
    m.addEventListener?.('change', f);
    return () => m.removeEventListener?.('change', f);
  }, []);
  return r;
};

export const MotionTrackView: React.FC<ViewProps> = ({ range, start, moves, editable, show, stepM, playback, alt, onPath }) => {
  const initial = useMemo(() => pathOf({ range, start, moves }), [range, start, moves]);
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
  if (prevInitial !== initial) { setPrevInitial(initial); setPath(initial); setT(totalDurationMs(initial)); setPlaying(false); setMsg(''); }

  const total = totalDurationMs(path);
  const s = sampleAt(path, tMs);
  const end = summary(path);
  const atEnd = tMs >= total;

  useEffect(() => { onPath?.(path); }, [path, onPath]);

  // ---- playback: the clock only chooses WHICH simulated time to draw ----
  const stateRef = useRef({ tMs, total, rate });
  useEffect(() => { stateRef.current = { tMs, total, rate }; });
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      const id = window.setInterval(() => {
        const { tMs: t0, total: tot } = stateRef.current;
        const next = Math.min(tot, (Math.floor(t0 / 1000) + 1) * 1000);
        setT(next);
        if (next >= tot) setPlaying(false);
      }, 800);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const { tMs: t0, total: tot, rate: r } = stateRef.current;
      const next = tickClock(t0, now - last, r, tot);
      last = now;
      setT(next);
      if (next >= tot) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  // ---- scale ----
  const span = metres(path.maxCm - path.minCm);
  const X = (cmv: number) => PAD + ((cmv - path.minCm) / (path.maxCm - path.minCm)) * (W - 2 * PAD);
  const tickStep = niceStep(span);
  const ticks: number[] = [];
  for (let v = Math.ceil(metres(path.minCm) / tickStep) * tickStep; v <= metres(path.maxCm) + 1e-9; v += tickStep) ticks.push(Math.round(v * 100) / 100);

  // ---- actions (each one appends to the model; none touches the clock logic) ----
  const apply = (r: ReturnType<typeof addMove>) => {
    if (!r.ok) { setMsg(r.reason); return; }
    setMsg(''); setPath(r.path); setT(totalDurationMs(r.path)); setPlaying(false);
  };
  const moveBy = (d: number) => apply(addMoveBy(path, d));
  const goTo = (target: number) => apply(addMove(path, target));
  const wait = () => apply(addMove(path, metres(end.positionCm)));
  const onType = (e: React.FormEvent) => { e.preventDefault(); const v = Number(typed.replace('−', '-')); if (typed.trim() === '' || !Number.isFinite(v)) { setMsg('Type a position in metres, such as 40 or -15.'); return; } goTo(v); setTyped(''); };

  const fromEvent = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    const frac = Math.min(1, Math.max(0, (x - PAD) / (W - 2 * PAD)));
    const m = metres(path.minCm + frac * (path.maxCm - path.minCm));
    return Math.round(m / Math.min(step, 1)) * Math.min(step, 1);
  };
  const keys = (e: React.KeyboardEvent) => {
    if (!editable) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); moveBy(step); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveBy(-step); }
  };

  const shownLegs = path.legs.map((l, i) => {
    const before = path.legs.slice(0, i).reduce((a, b) => a + b.durationMs, 0);
    const frac = Math.min(1, Math.max(0, (tMs - before) / l.durationMs));
    return { l, i, frac };
  }).filter((x) => x.frac > 0);

  const turned = turnCount(path) > 0 && s.distanceCm > Math.abs(s.displacementCm) + 0.5;
  const live = `At t = ${(s.tMs / 1000).toFixed(s.tMs % 1000 ? 1 : 0)} s (simulated time) the object is at ${describePosition(s.positionCm)}. Distance travelled so far: ${fmtLength(s.distanceCm)}. Displacement from the start: ${describeDisplacement(s.displacementCm)}.${turned ? ' The object has turned back, so the distance is greater than the size of the displacement.' : ''}`;

  return (
    <div className="space-y-3" data-visual="motionTrack" data-testid="motion-track">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={alt} className="w-full rounded-xl bg-surface-lowest border border-surface-border select-none"
        style={{ touchAction: editable ? 'none' : 'auto' }}
        onPointerMove={(e) => { if (dragging.current) setTyped(String(fromEvent(e))); }}
        onPointerUp={(e) => { if (dragging.current) { dragging.current = false; goTo(fromEvent(e)); setTyped(''); } }} onPointerCancel={() => { dragging.current = false; }}>
        <title>{alt}</title>
        <line x1={PAD} y1={TRACK_Y} x2={W - PAD} y2={TRACK_Y} stroke={C.track} strokeWidth={3} />
        {ticks.map((v) => (
          <g key={v} pointerEvents="none">
            <line x1={X(cm(v))} y1={TRACK_Y - (v === 0 ? 14 : 7)} x2={X(cm(v))} y2={TRACK_Y + (v === 0 ? 14 : 7)} stroke={v === 0 ? C.origin : C.track} strokeWidth={v === 0 ? 3 : 1.5} />
            <text x={X(cm(v))} y={TRACK_Y + 28} textAnchor="middle" fill={v === 0 ? C.origin : '#94a3b8'} fontSize={12} fontWeight={v === 0 ? 700 : 400}>{v < 0 ? `−${Math.abs(v)}` : v}</text>
          </g>
        ))}
        <text x={X(0)} y={TRACK_Y + 43} textAnchor="middle" fill={C.origin} fontSize={12} fontWeight={800} pointerEvents="none">O (reference point)</text>
        <text x={W - PAD} y={TRACK_Y + 62} textAnchor="end" fill="#94a3b8" fontSize={11} pointerEvents="none">position (m); right is positive</text>

        {/* start marker */}
        <g pointerEvents="none"><path d={`M ${X(path.startCm)} ${TRACK_Y + 5} l -5 -9 h 10 z`} fill={C.disp} /><text x={X(path.startCm)} y={TRACK_Y + 76} textAnchor="middle" fill={C.disp} fontSize={11}>start {fmtM(path.startCm)}</text></g>

        {/* history: one row per leg, arrow head shows the direction (not colour alone) */}
        {shownLegs.map(({ l, i, frac }) => {
          const y = TRACK_Y - 38 - (i % 5) * 14;
          const x1 = X(l.fromCm), x2 = X(l.fromCm + (l.toCm - l.fromCm) * frac);
          const dir = l.toCm > l.fromCm ? 1 : l.toCm < l.fromCm ? -1 : 0;
          const col = dir > 0 ? C.right : dir < 0 ? C.left : C.track;
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

        {/* the object */}
        <g className="group outline-none" {...(editable ? { role: 'button', tabIndex: 0, 'aria-label': `The object at ${fmtM(s.positionCm)}. Left and right arrow keys move it ${step} m, one second of simulated time per move.`, style: { cursor: 'grab' }, onKeyDown: keys, onPointerDown: (e: React.PointerEvent) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); } } : {})}>
          {editable && <circle cx={X(s.positionCm)} cy={TRACK_Y} r={48} fill="transparent" />}
          {editable && <circle cx={X(s.positionCm)} cy={TRACK_Y} r={17} fill="none" strokeWidth={3} className="stroke-transparent group-focus:stroke-white" pointerEvents="none" />}
          <circle cx={X(s.positionCm)} cy={TRACK_Y} r={11} fill={C.obj} stroke="#0f172a" strokeWidth={2} pointerEvents="none" />
          <text x={X(s.positionCm)} y={TRACK_Y - 18} textAnchor="middle" fill={C.text} fontSize={12} fontWeight={800} pointerEvents="none">{fmtSigned(s.positionCm)}</text>
        </g>
      </svg>

      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="motion-live">{live}</div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono" data-testid="motion-readout">
        <div className="rounded-lg border border-surface-border bg-surface-card p-2"><dt className="text-slate-400">Simulated time</dt><dd data-readout="time" className="text-white">{(s.tMs / 1000).toFixed(1)} s</dd></div>
        {show.includes('position') && <div className="rounded-lg border border-surface-border bg-surface-card p-2"><dt className="text-slate-400">Position</dt><dd data-readout="position" className="text-white">{fmtSigned(s.positionCm)}</dd></div>}
        {show.includes('distance') && <div className="rounded-lg border border-surface-border bg-surface-card p-2"><dt className="text-slate-400">Distance travelled</dt><dd data-readout="distance" className="text-white">{fmtLength(s.distanceCm)}</dd></div>}
        {show.includes('displacement') && <div className="rounded-lg border border-surface-border bg-surface-card p-2"><dt className="text-slate-400">Displacement</dt><dd data-readout="displacement" className="text-white">{fmtSigned(s.displacementCm)}</dd></div>}
      </dl>

      {path.legs.length > 0 && (
        <ol className="text-xs text-slate-300 space-y-0.5 pl-5 list-decimal" aria-label="History of moves" data-testid="motion-history">
          {path.legs.map((l, i) => <li key={i}>{l.toCm === l.fromCm ? `Stayed at ${fmtM(l.toCm)} for 1 s` : `${fmtM(l.fromCm)} → ${fmtM(l.toCm)}: ${fmtLength(l.toCm - l.fromCm)} to the ${l.toCm > l.fromCm ? 'right' : 'left'}`}</li>)}
        </ol>
      )}

      {editable && (
        <div className="space-y-2" data-testid="motion-controls">
          <div role="group" aria-label="Move the object" className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => moveBy(-step)} aria-label={`Move ${step} m to the left (1 s of simulated time)`} className="min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-card text-slate-100 font-bold text-sm">{'◀'} Left {step} m</button>
            <button type="button" onClick={wait} aria-label="Stay where you are for 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-100 text-sm">Wait 1 s</button>
            <button type="button" onClick={() => moveBy(step)} aria-label={`Move ${step} m to the right (1 s of simulated time)`} className="min-h-[44px] px-4 rounded-lg border border-surface-border bg-surface-card text-slate-100 font-bold text-sm">Right {step} m {'▶'}</button>
            <label className="flex items-center gap-2 text-xs text-slate-300">Step size
              <select value={step} onChange={(e) => setStep(Number(e.target.value))} aria-label="Step size of the move buttons, in metres" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
                {[1, 2, 5, 10, 20].map((v) => <option key={v} value={v}>{v} m</option>)}
              </select>
            </label>
          </div>
          <form onSubmit={onType} className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-slate-300">Go to position
              <input value={typed} onChange={(e) => setTyped(e.target.value)} inputMode="decimal" aria-label="Position to move to, in metres" placeholder="e.g. 40 or -15" className="w-28 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" />
            </label>
            <button type="submit" className="min-h-[44px] px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm">Move there</button>
            <button type="button" onClick={() => { const p2 = undoMove(path); setPath(p2); setT(totalDurationMs(p2)); setPlaying(false); setMsg(''); }} disabled={path.legs.length === 0} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm disabled:opacity-40">Undo last move</button>
            <button type="button" onClick={() => { const p2 = resetPath(path); setPath(p2); setT(0); setPlaying(false); setMsg(''); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="motion-reset">Reset</button>
          </form>
          <p className="text-[11px] text-slate-400">Each move takes 1 s of <strong>simulated</strong> time. Positions are exact in this model; a real experiment would use a measuring tape and a stopwatch and would have measurement error.</p>
        </div>
      )}
      {msg && <p role="alert" className="text-xs text-amber-300" data-testid="motion-message">{msg}</p>}

      {playback && path.legs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Replay of the recorded path" data-testid="motion-playback">
          <button type="button" onClick={() => { if (atEnd) setT(0); setPlaying((p) => !p); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg bg-surface-elevated border border-surface-border text-white font-bold text-sm">{playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}</button>
          <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tMs / 1000) * 1000 - 1000)); }} aria-label="Step back 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step {'−'}1 s</button>
          <button type="button" onClick={() => { setPlaying(false); setT(Math.min(total, Math.floor(tMs / 1000) * 1000 + 1000)); }} aria-label="Step forward 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +1 s</button>
          <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
            <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This is not the speed of the object." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
              <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
            <input type="range" min={0} max={total} step={100} value={Math.round(tMs)} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${(s.tMs / 1000).toFixed(1)} seconds`} className="w-full min-h-[44px]" />
          </label>
          <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the replay runs on screen. The physics depends on simulated time, so the values at a given time never change.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
        </div>
      )}
    </div>
  );
};

const MotionTrack: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as MotionVisualProps;
  return <MotionTrackView range={p.range} start={p.start} moves={p.moves} editable={Boolean(p.editable)} show={p.show ?? ['position', 'distance', 'displacement']} stepM={p.stepM ?? 5} playback={p.playback ?? (p.moves.length > 1 || Boolean(p.editable))} alt={alt} />;
};

export const MOTION_VISUALS: VisualRegistry = { motionTrack: MotionTrack };
