import { useDiagramLayout } from '../shared/viewportProfiles';
import { ActivityDetails } from '../../../components/InteractiveActivity';
/**
 * Uniform circular motion experiment (PHY-1D). Real two-dimensional geometry: the position on the circle,
 * the tangent velocity, the arc distance and the straight-line chord displacement all come from
 * engine/physics/motion/circular.ts. Everything works with buttons, fields and sliders; nothing needs dragging.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { circleStateAt, CIRCLE_LIMITS, describeCircle, validateCircle, type CircleSetup, type Spin } from '../../../engine/physics/motion/circular';
import { PHYS } from './physicsColors';
import { useReducedMotion } from './useReducedMotion';
import {
  ParameterControl,
  ExperimentSetupGroup,
  ModelAssumptions,
} from '../shared/controls';

const r2 = (n: number, p = 2): string => { const r = Math.round(n * 10 ** p) / 10 ** p; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };


const Stat: React.FC<{ id: string; label: string; value: string; color: string; symbol: string; note?: string }> = ({ id, label, value, color, symbol, note }) => (
  <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
    <dt className="text-[11px] flex items-center gap-1.5 text-slate-300"><span aria-hidden style={{ color }}>{symbol}</span>{label}</dt>
    <dd data-readout={id} className="font-mono text-lg font-bold leading-tight" style={{ color }}>{value}</dd>
    {note && <div className="text-[10px] text-slate-400">{note}</div>}
  </div>
);

const Field: React.FC<{
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  showSlider?: boolean;
  symbol?: string;
  onChange: (v: number) => void;
}> = ({ id, label, unit, value, step, min, max, showSlider, symbol, onChange }) => (
  <ParameterControl
    id={id}
    label={label}
    unit={unit}
    value={value}
    step={step}
    min={min}
    max={max}
    showSlider={showSlider}
    symbol={symbol}
    onChange={onChange}
  />
);

export interface CircularMotionProps { radiusM?: number; periodS?: number; spin?: Spin; editable?: boolean; startTime?: number; alt?: string }

/** All state and actions of one circular-motion run; the lab slots and the lesson composite read the same instance. */
export const useCircularMotion = ({ radiusM = 10, periodS = 12, spin = 'counterclockwise', startTime = 0 }: Pick<CircularMotionProps, 'radiusM' | 'periodS' | 'spin' | 'startTime'> = {}) => {
  const [setup, setSetup] = useState<CircleSetup>({ radiusM, periodS, spin });
  const [t, setT] = useState(startTime);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const reduced = useReducedMotion();
  const simTimeRef = useRef(startTime);
  const tMax = Math.min(CIRCLE_LIMITS.maxTime, setup.periodS * 3);
  const tt = Math.min(t, tMax);
  const s = circleStateAt(setup, tt);

  const change = (patch: Partial<CircleSetup>) => {
    const next = { ...setup, ...patch };
    const why = validateCircle(next);
    if (why) { setErr(why); return; }
    setErr(''); setSetup(next); setPlaying(false); simTimeRef.current = 0; setT(0);
  };

  if (!playing) {
    simTimeRef.current = t;
  }

  const ref = useRef({ t, tMax, rate });
  useEffect(() => { ref.current = { t, tMax, rate }; });
  useEffect(() => {
    if (!playing) return;
    simTimeRef.current = t;
    if (reduced) {
      const id = window.setInterval(() => { const { tMax: m } = ref.current; const next = Math.min(m, Math.floor(simTimeRef.current) + 1); simTimeRef.current = next; setT(next); if (next >= m) setPlaying(false); }, 800);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(Math.max(0, now - last), 100);
      last = now;
      const { tMax: m, rate: r } = ref.current;
      const next = tickClock(simTimeRef.current * 1000, dt, r, m * 1000) / 1000;
      simTimeRef.current = next;
      setT(next);
      if (next >= m) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const togglePlay = () => { if (tt >= tMax) { simTimeRef.current = 0; setT(0); } setPlaying((p) => !p); };
  const stepBack = () => { setPlaying(false); const next = Math.max(0, Math.ceil(tt) - 1); simTimeRef.current = next; setT(next); };
  const stepForward = () => { setPlaying(false); const next = Math.min(tMax, Math.floor(tt) + 1); simTimeRef.current = next; setT(next); };
  const rewind = () => { setPlaying(false); simTimeRef.current = 0; setT(0); };
  const scrub = (v: number) => { setPlaying(false); simTimeRef.current = v; setT(v); };
  const jumpTo = (v: number) => { setPlaying(false); const to = Math.min(tMax, v); simTimeRef.current = to; setT(to); };
  return { setup, setSetup, t, setT, tt, tMax, s, playing, setPlaying, rate, setRate, err, setErr, reduced, change, togglePlay, stepBack, stepForward, rewind, scrub, jumpTo };
};
export type CircularMotionModel = ReturnType<typeof useCircularMotion>;

/** The picture: the circle with the arc, the chord, the velocity and the towards-the-centre arrow, and its legend. */
export const CircleScene: React.FC<{ c: CircularMotionModel; alt?: string; hidden?: Record<string, boolean> }> = ({ c, alt, hidden = {} }) => {
  const { setup, s } = c;
  const ref = useRef<SVGSVGElement>(null);
  const { width: S } = useDiagramLayout(ref, 300, 300);
  const C0 = S / 2, R_PX = Math.max(40, S / 2 - 48);
  const show = (id: string) => !hidden[id];
  const k = R_PX / setup.radiusM;
  const P = (x: number, y: number) => ({ px: C0 + x * k, py: C0 - y * k });
  const start = P(setup.radiusM, 0), now = P(s.x, s.y);
  const dir = setup.spin === 'counterclockwise' ? 1 : -1;
  // arc travelled (up to one revolution is drawn; the readout counts all of it)
  const frac = Math.min(Math.abs(s.theta), 2 * Math.PI - 1e-6);
  const end = P(setup.radiusM * Math.cos(dir * frac), setup.radiusM * Math.sin(dir * frac));
  const arcPath = frac > 1e-6 ? `M${start.px},${start.py} A${R_PX},${R_PX} 0 ${frac > Math.PI ? 1 : 0} ${dir === 1 ? 0 : 1} ${end.px},${end.py}` : '';
  const vlen = 46;
  const ux = s.speed ? s.vx / s.speed : 0, uy = s.speed ? s.vy / s.speed : 0;
  const tip = { px: now.px + ux * vlen, py: now.py - uy * vlen };
  const toC = { x: -s.x / setup.radiusM, y: -s.y / setup.radiusM };
  const aTip = { px: now.px + toC.x * 34, py: now.py - toC.y * 34 };
  const head = (fx: number, fy: number, tx: number, ty: number) => { const a = Math.atan2(ty - fy, tx - fx); return `M${tx},${ty} L${tx - 9 * Math.cos(a - 0.4)},${ty - 9 * Math.sin(a - 0.4)} L${tx - 9 * Math.cos(a + 0.4)},${ty - 9 * Math.sin(a + 0.4)} Z`; };
  const text = alt ?? describeCircle(setup, s);
  return (
    <>
      <p className="sr-only">{text}</p>
      <svg ref={ref} viewBox={`0 0 ${S} ${S}`} role="img" aria-label={text} className="w-full max-w-[420px] mx-auto rounded-xl bg-surface-lowest border border-surface-border block">
        <circle cx={C0} cy={C0} r={R_PX} fill="none" stroke={PHYS.axis} strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={C0} cy={C0} r={3} fill={PHYS.origin} /><text x={C0 + 6} y={C0 + 14} fontSize={12} fill={PHYS.origin}>centre</text>
        {show('arc') && arcPath && <path d={arcPath} fill="none" stroke={PHYS.distance} strokeWidth={4} />}
        {show('displacement') && <path d={`M${start.px},${start.py} L${now.px},${now.py}`} stroke={PHYS.displacement} strokeWidth={2.5} />}
        {show('displacement') && s.displacement > 0.01 * setup.radiusM && <path d={head(start.px, start.py, now.px, now.py)} fill={PHYS.displacement} />}
        <circle cx={start.px} cy={start.py} r={5} fill="none" stroke={PHYS.position} strokeWidth={2} /><text x={start.px + 8} y={start.py - 8} fontSize={12} fill={PHYS.position}>start</text>
        {show('acceleration') && <g><g stroke={PHYS.acceleration} strokeDasharray="4 3" strokeWidth={2}><line x1={now.px} y1={now.py} x2={aTip.px} y2={aTip.py} /></g>
        <path d={head(now.px, now.py, aTip.px, aTip.py)} fill={PHYS.acceleration} /></g>}
        {show('velocity') && <g><line x1={now.px} y1={now.py} x2={tip.px} y2={tip.py} stroke={PHYS.velocity} strokeWidth={3} />
        <path d={head(now.px, now.py, tip.px, tip.py)} fill={PHYS.velocity} /></g>}
        <circle cx={now.px} cy={now.py} r={8} fill={PHYS.position} stroke="#0f172a" strokeWidth={2} />
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] justify-center" aria-label="Legend">
        <li style={{ color: PHYS.velocity }}>{'━▶'} velocity (tangent to the circle)</li>
        <li style={{ color: PHYS.distance }}>{'━'} arc travelled (distance)</li>
        <li style={{ color: PHYS.displacement }}>{'━▶'} displacement (straight chord from the start)</li>
        <li style={{ color: PHYS.acceleration }}>{'┈▶'} towards the centre (conceptual)</li>
      </ul>

    </>
  );
};

/** The numbers: the readout cards and the live sentence. */
export const CircleReadout: React.FC<{ c: CircularMotionModel }> = ({ c }) => {
  const { setup, s } = c;
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2" data-testid="circle-readout">
        <Stat id="t" label="Simulated time" value={`${r2(s.t)} s`} color={PHYS.time} symbol={'⏱'} />
        <Stat id="turns" label="Turns completed" value={r2(s.revolutions)} color="#e2e8f0" symbol={'↻'} />
        <Stat id="position" label="Position (x, y)" value={`(${r2(s.x)}, ${r2(s.y)}) m`} color={PHYS.position} symbol={'●'} note="from the centre" />
        <Stat id="speed" label="Speed" value={`${r2(s.speed)} m/s`} color={PHYS.speed} symbol={'⚡'} note="2πr ÷ T: never changes" />
        <Stat id="direction" label="Direction of velocity" value={`${r2(s.velocityAngleDeg, 0)}° from +x`} color={PHYS.velocity} symbol={'➤'} note="keeps changing" />
        <Stat id="distance" label="Distance (arc length)" value={`${r2(s.distance)} m`} color={PHYS.distance} symbol={'↔'} note="along the circle, always grows" />
        <Stat id="displacement" label="Displacement (chord)" value={`${r2(s.displacement)} m`} color={PHYS.displacement} symbol={'→'} note="straight line from the start" />
        <Stat id="avg" label="Average speed · average velocity" value={s.averageSpeed === null ? '—' : `${r2(s.averageSpeed)} · ${r2(s.averageVelocity ?? 0)} m/s`} color={PHYS.velocity} symbol={'➤'} note="distance ÷ t · displacement ÷ t" />
      </dl>

      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" data-testid="circle-live">
        <p>At t = {r2(s.t)} s the object is at ({r2(s.x)}, {r2(s.y)}) m. Its speed is {r2(s.speed)} m/s, the same as at every other time, but its velocity points {r2(s.velocityAngleDeg, 0)}° from the +x axis and keeps turning. It has travelled {r2(s.distance)} m along the circle; its displacement from the start is {r2(s.displacement)} m in a straight line.</p>
        <p className="text-xs text-slate-300">{s.t > 0 && s.displacement < 1e-6 * setup.radiusM + 1e-9 ? 'The object is back at its starting point: the displacement and the average velocity are zero, while the distance is a whole number of circumferences.' : 'The velocity changes direction all the time even though its size is constant. A changing velocity means an acceleration, which for motion in a circle points towards the centre (shown as a dashed arrow; its size is not needed in Class 9).'}</p>
      </div>
    </div>
  );
};

export const CircularMotionView: React.FC<CircularMotionProps> = ({ radiusM = 10, periodS = 12, spin = 'counterclockwise', editable = true, startTime = 0, alt }) => {
  const c = useCircularMotion({ radiusM, periodS, spin, startTime });
  const { setup, setT, tt, tMax, playing, setPlaying, rate, setRate, err, reduced, change } = c;
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="space-y-4" data-visual="circularMotion" data-testid="circular-motion">
      {/* 1. Primary Simulation Viewport Surface */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card/60 to-surface-card/30 p-2 sm:p-3 overflow-hidden shadow-xs space-y-2.5">
          <CircleScene c={c} alt={alt} />
        </div>

        <div role="group" aria-label="Time controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="circle-time">
          <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>{'⏱'} Simulated time (up to three turns)</span>
          <button type="button" onClick={() => { if (tt >= tMax) setT(0); setPlaying((p) => !p); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.time }}>{playing ? 'Pause' : tt >= tMax ? 'Replay' : 'Play'}</button>
          <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt) - 1)); }} aria-label="Step back 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">{'Step −1 s'}</button>
          <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt) + 1)); }} aria-label="Step forward 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +1 s</button>
          <button type="button" onClick={() => { setPlaying(false); setT(setup.periodS / 2 > tMax ? tMax : setup.periodS / 2); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="jump-half">Half a turn</button>
          <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, setup.periodS)); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="jump-full">One full turn</button>
          <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Back to 0 s</button>
          {editable && (
            <button
              type="button"
              onClick={() => setSetupOpen((o) => !o)}
              aria-expanded={setupOpen}
              aria-controls="circular-setup-panel"
              data-testid="circle-setup-toggle"
              className="min-h-[44px] px-3.5 rounded-lg border border-surface-border bg-surface-lowest hover:bg-surface-card text-slate-200 text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors select-none"
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
          )}
          <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
            <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This does not change the motion." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
            <input type="range" min={0} max={tMax} step="any" value={tt} onChange={(e) => c.scrub(Number(e.target.value))} aria-label="Simulated time" aria-valuetext={`${r2(tt)} seconds`} className="w-full min-h-[44px]" />
          </label>
          <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the picture plays; it does not change the speed of the object.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
        </div>
      </div>

      {/* 2. Interactive Collapsible Setup Controls (when editable) */}
      {editable && (
        <div
          id="circular-setup-panel"
          hidden={!setupOpen}
          className={!setupOpen ? 'hidden' : 'space-y-3 pt-1 transition-all duration-200'}
          data-testid="circle-controls"
        >
          <ExperimentSetupGroup
            title="Uniform Circular Motion Setup"
            icon="change_circle"
            columns={2}
          >
            <Field
              id="radius"
              label="Circle radius"
              unit="m"
              symbol="r"
              value={setup.radiusM}
              step={1}
              min={CIRCLE_LIMITS.minR}
              max={CIRCLE_LIMITS.maxR}
              onChange={(v) => change({ radiusM: v })}
            />
            <Field
              id="period"
              label="Period (time for 1 revolution)"
              unit="s"
              symbol="T"
              value={setup.periodS}
              step={1}
              min={CIRCLE_LIMITS.minT}
              max={CIRCLE_LIMITS.maxT}
              onChange={(v) => change({ periodS: v })}
            />
            <div className="col-span-full space-y-1.5 pt-1">
              <label className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-cyan-400 select-none" aria-hidden>
                  rotate_right
                </span>
                <span>Rotation Direction</span>
              </label>
              <div role="group" aria-label="Direction of motion" className="grid grid-cols-2 gap-2">
                {(['counterclockwise', 'clockwise'] as Spin[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={setup.spin === d}
                    data-spin={d}
                    onClick={() => change({ spin: d })}
                    className={`min-h-[44px] px-3.5 rounded-xl border-2 text-xs font-bold transition-all select-none flex items-center justify-center gap-2 ${
                      setup.spin === d
                        ? 'bg-surface-elevated text-white border-cyan-400 shadow-sm'
                        : 'border-surface-border bg-surface-lowest text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {setup.spin === d && <span className="text-[10px] text-emerald-400 select-none">✓</span>}
                    <span>{d === 'counterclockwise' ? '↺ Counter-clockwise' : '↻ Clockwise'}</span>
                  </button>
                ))}
              </div>
            </div>
          </ExperimentSetupGroup>

          <ModelAssumptions
            summary="Idealized uniform circular motion model with constant speed."
            assumptions={[
              'Constant tangential speed: v = 2πr / T throughout the entire orbit.',
              'Direction of velocity changes continuously tangent to the circular trajectory.',
              'Centripetal acceleration points towards the centre of the circle.',
            ]}
            limits={{
              massRange: undefined,
              timeRange: [CIRCLE_LIMITS.minT, CIRCLE_LIMITS.maxT],
            }}
          />

          {err && (
            <p role="alert" className="text-xs font-bold p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 text-red-400" data-testid="circle-error">
              <span aria-hidden>{'✗ '}</span>{err}
            </p>
          )}
        </div>
      )}

      {/* 3. Measurements and Live Observations */}
      <ActivityDetails title="Measurements and observations"><CircleReadout c={c} /></ActivityDetails>
    </div>
  );
};

export interface CircleVisualProps { radiusM?: number; periodS?: number; spin?: Spin; editable?: boolean; startTime?: number }

export const CircularMotionVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as CircleVisualProps;
  return <CircularMotionView radiusM={p.radiusM} periodS={p.periodS} spin={p.spin} editable={Boolean(p.editable)} startTime={p.startTime} alt={alt} />;
};
