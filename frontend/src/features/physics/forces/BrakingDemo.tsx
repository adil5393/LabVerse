/**
 * Sudden-braking demonstration (PHY-2B): a simplified vehicle-and-passenger model of inertia (see engine/physics/forces/vehicle.ts).
 * It shows the passenger relative to the road and to the vehicle, and the passenger's force diagram. It is a teaching model
 * and is labelled as one: it ends before any contact and does not simulate collisions or injury.
 */

import React, { useEffect, useRef, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { BRAKE_AT, BRAKING_LIMITS, brakingAt, DEFAULT_BRAKING, endTime, GAP_M, validateBraking, type BrakingSetup } from '../../../engine/physics/forces/vehicle';
import { G } from '../../../engine/physics/forces/forceModel';
import type { Arrow } from '../../../engine/physics/forces/forceDiagram';
import { netArrow } from '../../../engine/physics/forces/forceDiagram';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';

const r2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };

const Num: React.FC<{ id: string; label: string; unit: string; value: number; step: number; onChange: (v: number) => void }> = ({ id, label, unit, value, step, onChange }) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) { setLast(value); setText(String(value)); }
  return (
    <div className="flex items-center gap-1 text-xs text-slate-300">
      <label className="flex items-center gap-1">{label}
        <input value={text} data-field={id} inputMode="decimal" aria-label={`${label} in ${unit}`} onChange={(e) => { setText(e.target.value); const n = Number(e.target.value); if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n); }} className="w-16 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" /></label><span>{unit}</span>
      <button type="button" aria-label={`Decrease ${label} by ${step}`} onClick={() => onChange(Math.round((value - step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">{'−'}</button>
      <button type="button" aria-label={`Increase ${label} by ${step}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">+</button>
    </div>
  );
};

const W = 620, H = 150;

export interface BrakingProps { initial?: BrakingSetup; editable?: boolean; alt?: string; resetToken?: number }

export const BrakingDemoView: React.FC<BrakingProps> = ({ initial = DEFAULT_BRAKING, editable = true, alt, resetToken }) => {
  const [setup, setSetup] = useState<BrakingSetup>(initial);
  const [prev, setPrev] = useState(initial);
  const [tok, setTok] = useState(resetToken);
  if (prev !== initial || tok !== resetToken) { setPrev(initial); setTok(resetToken); setSetup(initial); }
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const reduced = useReducedMotion();
  const tMax = Math.min(10, endTime(setup) === Infinity ? BRAKE_AT + setup.speed / setup.decel + 1 : endTime(setup));
  const tt = Math.min(t, tMax);
  const s = brakingAt(setup, tt);

  const change = (patch: Partial<BrakingSetup>) => {
    const next = { ...setup, ...patch }; const why = validateBraking(next);
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

  // scene: the camera follows the road; positions in metres, scaled to fit
  const span = Math.max(10, setup.speed * (BRAKE_AT + 1.5) + 4);
  const X = (m: number) => 30 + (m / span) * (W - 60);
  const carW = 120;
  const carX = X(s.vehicleX);
  const seat = carX - carW * 0.5;
  const pX = seat + (s.relative / GAP_M) * (carW * 0.35);
  const tick = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60].filter((m) => m <= span);

  const arrows: Arrow[] = [];
  if (s.passengerForce !== 0) arrows.push({ id: 'belt', kind: 'applied', label: 'Seat belt', by: 'the belt', on: 'passenger', magnitude: Math.abs(s.passengerForce), direction: 'left', horizontal: s.passengerForce });
  arrows.push({ id: 'normal', kind: 'normal', label: 'Normal force', by: 'the seat', on: 'passenger', magnitude: setup.passengerMassKg * G, direction: 'up', horizontal: 0 });
  arrows.push({ id: 'weight', kind: 'weight', label: 'Weight', by: 'the Earth', on: 'passenger', magnitude: setup.passengerMassKg * G, direction: 'down', horizontal: 0 });
  const net = netArrow(arrows);

  const live = s.state === 'cruising'
    ? `The vehicle and the passenger both move at ${r2(setup.speed)} m/s. No horizontal force acts on the passenger, so the net force is zero and the velocity is constant.`
    : setup.restrained
      ? `The vehicle slows. The belt exerts a backward force of ${r2(setup.passengerMassKg * setup.decel)} N on the passenger, so the passenger slows with the vehicle (${r2(s.passengerV)} m/s) and does not move forward relative to the seat.`
      : `The vehicle slows to ${r2(s.vehicleV)} m/s. No horizontal force acts on the passenger, so their velocity relative to the road stays ${r2(s.passengerV)} m/s. They move ${r2(s.relative)} m forward relative to the vehicle: inertia, not a new forward force.${s.state === 'gap used up' ? ` The model ends here, after a gap of ${GAP_M} m, before any contact.` : ''}`;
  const text = alt ?? `Sudden braking: vehicle at ${r2(setup.speed)} m/s brakes at ${r2(setup.decel)} m/s² from 1 s. Passenger ${setup.restrained ? 'wears a belt' : 'has no belt'}. ${live}`;

  return (
    <div className="space-y-3" data-visual="brakingDemo" data-testid="braking-demo">
      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="braking-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the demonstration</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Num id="speed" label="Speed" unit="m/s" value={setup.speed} step={5} onChange={(v) => change({ speed: v })} />
            <Num id="decel" label="Braking deceleration" unit="m/s²" value={setup.decel} step={1} onChange={(v) => change({ decel: v })} />
            <Num id="pmass" label="Passenger mass" unit="kg" value={setup.passengerMassKg} step={10} onChange={(v) => change({ passengerMassKg: v })} />
            <div role="group" aria-label="Seat belt" className="flex gap-1">
              {[false, true].map((b) => <button key={String(b)} type="button" aria-pressed={setup.restrained === b} data-belt={b ? 'on' : 'off'} onClick={() => change({ restrained: b })} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: setup.restrained === b ? PHYS.force : '#334155' }}>{setup.restrained === b ? '✓ ' : ''}{b ? 'Belt on' : 'No belt'}</button>)}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">Simplified teaching model: a straight road, a vehicle braking at a constant rate from 1 s, a passenger on a slippery seat (no seat friction), and a belt that exerts exactly the backward force needed. It ends before any contact. It is not crash-safety data: real seats have friction, real belts stretch and real crash forces are far larger and vary. Speed up to {BRAKING_LIMITS.maxSpeed} m/s.</p>
          {err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="braking-error"><span aria-hidden>{'✗ '}</span>{err}</p>}
        </div>
      )}
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="braking-scene">
        <line x1={20} y1={110} x2={W - 20} y2={110} stroke={PHYS.axis} strokeWidth={3} />
        {tick.map((m) => <g key={m}><line x1={X(m)} y1={106} x2={X(m)} y2={116} stroke="#94a3b8" /><text x={X(m)} y={130} textAnchor="middle" fontSize={10} fill="#94a3b8">{m}</text></g>)}
        <text x={W - 24} y={146} textAnchor="end" fontSize={10} fill="#94a3b8">position on the road (m)</text>
        <rect x={carX - carW} y={62} width={carW} height={44} rx={8} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
        <rect x={seat - 10} y={76} width={6} height={26} fill="#475569" />
        <text x={carX - carW / 2} y={100} textAnchor="middle" fontSize={10} fill={PHYS.position}>vehicle {r2(s.vehicleV)} m/s</text>
        <circle cx={pX} cy={72} r={9} fill={PHYS.velocity} stroke="#0f172a" strokeWidth={2} />
        <text x={pX} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill={PHYS.velocity}>passenger {r2(s.passengerV)} m/s</text>
        {setup.restrained && <line x1={seat - 4} y1={80} x2={pX} y2={74} stroke={PHYS.force} strokeWidth={3} strokeDasharray="4 3" />}
        <line x1={seat} y1={30} x2={seat} y2={36} stroke={PHYS.time} />
        <text x={X(0) + 2} y={20} fontSize={10} fill={PHYS.time}>{s.state === 'cruising' ? 'cruising' : s.state}</text>
      </svg>
      <ForceFigure object="passenger" arrows={arrows} net={net} showIndividual showNet alt={`Forces on the passenger: ${setup.restrained && s.passengerForce !== 0 ? `belt ${r2(Math.abs(s.passengerForce))} N backward; ` : 'no horizontal force; '}weight and normal force ${r2(setup.passengerMassKg * G)} N each, vertical.`} />

      <div role="group" aria-label="Time controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="braking-time">
        <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>{'⏱'} Simulated time (braking starts at 1 s)</span>
        <button type="button" onClick={() => { if (tt >= tMax) setT(0); setPlaying((x) => !x); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.time }} data-testid="braking-play">{playing ? 'Pause' : tt >= tMax ? 'Replay' : 'Play'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt * 10) / 10 - 0.1)); }} aria-label="Step back 0.1 s" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">{'Step −0.1 s'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt * 10) / 10 + 0.1)); }} aria-label="Step forward 0.1 s" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +0.1 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="min-h-[44px] px-3 rounded-lg border text-sm" style={{ borderColor: PHYS.error, color: PHYS.error }} data-testid="braking-reset">Reset to 0 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(tMax); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm" data-testid="braking-end">Jump to the end</button>
        <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This does not change the motion." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
          <input type="range" min={0} max={tMax} step={0.05} value={tt} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${r2(tt)} seconds`} className="w-full min-h-[44px]" />
        </label>
        <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the picture plays.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2" data-testid="braking-readout">
        {([
          ['t', 'Simulated time', `${r2(s.t)} s`, PHYS.time], ['vv', 'Vehicle velocity', `${r2(s.vehicleV)} m/s`, PHYS.position], ['pv', 'Passenger velocity (road)', `${r2(s.passengerV)} m/s`, PHYS.velocity],
          ['rel', 'Passenger forward of seat', `${r2(s.relative)} m`, PHYS.displacement], ['force', 'Horizontal force on passenger', `${r2(s.passengerForce)} N`, PHYS.force], ['state', 'State', s.state, '#e2e8f0'],
        ] as [string, string, string, string][]).map(([id, label, value, color]) => (
          <div key={id} className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
            <dt className="text-[11px] text-slate-300">{label}</dt><dd data-readout={id} className="font-mono text-lg font-bold leading-tight" style={{ color }}>{value}</dd>
          </div>
        ))}
      </dl>
      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="braking-live">{live}</div>
    </div>
  );
};

export const BrakingDemoVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as { setup?: BrakingSetup; editable?: boolean };
  return <BrakingDemoView initial={p.setup ?? DEFAULT_BRAKING} editable={Boolean(p.editable)} alt={alt} />;
};
