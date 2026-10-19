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

const r2 = (n: number, p = 2): string => { const r = Math.round(n * 10 ** p) / 10 ** p; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const S = 300, C0 = S / 2, R_PX = 110;

const Stat: React.FC<{ id: string; label: string; value: string; color: string; symbol: string; note?: string }> = ({ id, label, value, color, symbol, note }) => (
  <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
    <dt className="text-[11px] flex items-center gap-1.5 text-slate-300"><span aria-hidden style={{ color }}>{symbol}</span>{label}</dt>
    <dd data-readout={id} className="font-mono text-lg font-bold leading-tight" style={{ color }}>{value}</dd>
    {note && <div className="text-[10px] text-slate-400">{note}</div>}
  </div>
);

const Field: React.FC<{ id: string; label: string; unit: string; value: number; step: number; onChange: (v: number) => void }> = ({ id, label, unit, value, step, onChange }) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) { setLast(value); setText(String(value)); }
  return (
    <div className="flex items-center gap-1 text-xs text-slate-300">
      <label className="flex items-center gap-1">{label}
        <input value={text} data-field={id} inputMode="decimal" aria-label={`${label} in ${unit}`} onChange={(e) => { setText(e.target.value); const n = Number(e.target.value); if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n); }}
          className="w-20 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" /></label><span>{unit}</span>
      <button type="button" aria-label={`Decrease ${label} by ${step}`} onClick={() => onChange(Math.round((value - step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">{'−'}</button>
      <button type="button" aria-label={`Increase ${label} by ${step}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">+</button>
    </div>
  );
};

export interface CircularMotionProps { radiusM?: number; periodS?: number; spin?: Spin; editable?: boolean; startTime?: number; alt?: string }

export const CircularMotionView: React.FC<CircularMotionProps> = ({ radiusM = 10, periodS = 12, spin = 'counterclockwise', editable = true, startTime = 0, alt }) => {
  const [setup, setSetup] = useState<CircleSetup>({ radiusM, periodS, spin });
  const [t, setT] = useState(startTime);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const reduced = useReducedMotion();
  const tMax = Math.min(CIRCLE_LIMITS.maxTime, setup.periodS * 3);
  const tt = Math.min(t, tMax);
  const s = circleStateAt(setup, tt);

  const change = (patch: Partial<CircleSetup>) => {
    const next = { ...setup, ...patch };
    const why = validateCircle(next);
    if (why) { setErr(why); return; }
    setErr(''); setSetup(next); setPlaying(false); setT(0);
  };

  const ref = useRef({ t, tMax, rate });
  useEffect(() => { ref.current = { t, tMax, rate }; });
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      const id = window.setInterval(() => { const { t: t0, tMax: m } = ref.current; const next = Math.min(m, Math.floor(t0) + 1); setT(next); if (next >= m) setPlaying(false); }, 800);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const { t: t0, tMax: m, rate: r } = ref.current;
      const next = tickClock(t0 * 1000, now - last, r, m * 1000) / 1000;
      last = now; setT(next);
      if (next >= m) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

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
    <div className="space-y-3" data-visual="circularMotion" data-testid="circular-motion">
      <p className="sr-only">{text}</p>
      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="circle-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set the motion</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="radius" label="Radius" unit="m" value={setup.radiusM} step={1} onChange={(v) => change({ radiusM: v })} />
            <Field id="period" label="Period (time for one turn)" unit="s" value={setup.periodS} step={1} onChange={(v) => change({ periodS: v })} />
            <div role="group" aria-label="Direction of motion" className="flex gap-2">
              {(['counterclockwise', 'clockwise'] as Spin[]).map((d) => <button key={d} type="button" aria-pressed={setup.spin === d} data-spin={d} onClick={() => change({ spin: d })} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: setup.spin === d ? PHYS.velocity : '#334155' }}>{setup.spin === d ? '✓ ' : ''}{d === 'counterclockwise' ? '↺ Counter-clockwise' : '↻ Clockwise'}</button>)}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Radius {CIRCLE_LIMITS.minR} to {CIRCLE_LIMITS.maxR} m; period {CIRCLE_LIMITS.minT} to {CIRCLE_LIMITS.maxT} s. The speed is 2πr ÷ T (the circumference divided by the period) and does not change; the model has a constant speed by definition of uniform circular motion.</p>
          {err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="circle-error"><span aria-hidden>{'✗ '}</span>{err}</p>}
        </div>
      )}

      <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label={text} className="w-full max-w-[420px] mx-auto rounded-xl bg-surface-lowest border border-surface-border block">
        <circle cx={C0} cy={C0} r={R_PX} fill="none" stroke={PHYS.axis} strokeWidth={1.5} strokeDasharray="4 4" />
        <circle cx={C0} cy={C0} r={3} fill={PHYS.origin} /><text x={C0 + 6} y={C0 + 14} fontSize={10} fill={PHYS.origin}>centre</text>
        {arcPath && <path d={arcPath} fill="none" stroke={PHYS.distance} strokeWidth={4} />}
        <path d={`M${start.px},${start.py} L${now.px},${now.py}`} stroke={PHYS.displacement} strokeWidth={2.5} />
        {s.displacement > 0.01 * setup.radiusM && <path d={head(start.px, start.py, now.px, now.py)} fill={PHYS.displacement} />}
        <circle cx={start.px} cy={start.py} r={5} fill="none" stroke={PHYS.position} strokeWidth={2} /><text x={start.px + 8} y={start.py - 8} fontSize={10} fill={PHYS.position}>start</text>
        <g stroke={PHYS.acceleration} strokeDasharray="4 3" strokeWidth={2}><line x1={now.px} y1={now.py} x2={aTip.px} y2={aTip.py} /></g>
        <path d={head(now.px, now.py, aTip.px, aTip.py)} fill={PHYS.acceleration} />
        <line x1={now.px} y1={now.py} x2={tip.px} y2={tip.py} stroke={PHYS.velocity} strokeWidth={3} />
        <path d={head(now.px, now.py, tip.px, tip.py)} fill={PHYS.velocity} />
        <circle cx={now.px} cy={now.py} r={8} fill={PHYS.position} stroke="#0f172a" strokeWidth={2} />
      </svg>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] justify-center" aria-label="Legend">
        <li style={{ color: PHYS.velocity }}>{'━▶'} velocity (tangent to the circle)</li>
        <li style={{ color: PHYS.distance }}>{'━'} arc travelled (distance)</li>
        <li style={{ color: PHYS.displacement }}>{'━▶'} displacement (straight chord from the start)</li>
        <li style={{ color: PHYS.acceleration }}>{'┈▶'} towards the centre (conceptual)</li>
      </ul>

      <div role="group" aria-label="Time controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="circle-time">
        <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>{'⏱'} Simulated time (up to three turns)</span>
        <button type="button" onClick={() => { if (tt >= tMax) setT(0); setPlaying((p) => !p); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.time }}>{playing ? 'Pause' : tt >= tMax ? 'Replay' : 'Play'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt) - 1)); }} aria-label="Step back 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">{'Step −1 s'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt) + 1)); }} aria-label="Step forward 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +1 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(setup.periodS / 2 > tMax ? tMax : setup.periodS / 2); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="jump-half">Half a turn</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, setup.periodS)); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="jump-full">One full turn</button>
        <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Back to 0 s</button>
        <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This does not change the motion." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
          <input type="range" min={0} max={tMax} step={0.1} value={tt} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${r2(tt)} seconds`} className="w-full min-h-[44px]" />
        </label>
        <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the picture plays; it does not change the speed of the object.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
      </div>

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

export interface CircleVisualProps { radiusM?: number; periodS?: number; spin?: Spin; editable?: boolean; startTime?: number }

export const CircularMotionVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as CircleVisualProps;
  return <CircularMotionView radiusM={p.radiusM} periodS={p.periodS} spin={p.spin} editable={Boolean(p.editable)} startTime={p.startTime} alt={alt} />;
};
