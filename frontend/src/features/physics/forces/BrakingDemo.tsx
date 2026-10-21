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

export const r2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };

export const NumField: React.FC<{ id: string; label: string; unit: string; value: number; step: number; onChange: (v: number) => void }> = ({ id, label, unit, value, step, onChange }) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) { setLast(value); setText(String(value)); }
  return (
    <div className="flex items-center justify-between gap-1 text-xs text-slate-300 bg-surface-lowest/70 border border-surface-border rounded-lg p-1.5">
      <label className="flex items-center gap-1.5 font-medium text-slate-300">
        <span>{label}</span>
        <input
          value={text}
          data-field={id}
          inputMode="decimal"
          aria-label={`${label} in ${unit}`}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value);
            if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n);
          }}
          className="w-16 min-h-[32px] rounded border border-surface-border bg-surface-lowest px-1.5 text-white font-mono text-xs focus:border-primary outline-none text-right"
        />
        <span className="text-[11px] text-slate-400 font-mono">{unit}</span>
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label} by ${step}`}
          onClick={() => onChange(Math.round((value - step) * 100) / 100)}
          className="min-h-[32px] min-w-[32px] rounded border border-surface-border bg-surface-card hover:bg-surface-variant text-white text-xs flex items-center justify-center transition-colors"
        >
          {'−'}
        </button>
        <button
          type="button"
          aria-label={`Increase ${label} by ${step}`}
          onClick={() => onChange(Math.round((value + step) * 100) / 100)}
          className="min-h-[32px] min-w-[32px] rounded border border-surface-border bg-surface-card hover:bg-surface-variant text-white text-xs flex items-center justify-center transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
};

export const W = 680, H = 150;

export interface BrakingProps { initial?: BrakingSetup; editable?: boolean; alt?: string; resetToken?: number }

export type BrakingStateResult = ReturnType<typeof brakingAt>;

export interface UseBrakingDemoReturn {
  setup: BrakingSetup;
  t: number;
  tt: number;
  tMax: number;
  playing: boolean;
  rate: number;
  err: string;
  reduced: boolean;
  s: BrakingStateResult;
  arrows: Arrow[];
  net: Arrow | null;
  live: string;
  change: (patch: Partial<BrakingSetup>) => void;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setT: React.Dispatch<React.SetStateAction<number>>;
  setRate: React.Dispatch<React.SetStateAction<number>>;
  reset: () => void;
  jumpToEnd: () => void;
}

export function useBrakingDemo({ initial = DEFAULT_BRAKING, resetToken }: BrakingProps = {}): UseBrakingDemoReturn {
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

  const simTimeRef = useRef(0);
  const change = (patch: Partial<BrakingSetup>) => {
    const next = { ...setup, ...patch }; const why = validateBraking(next);
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

  const reset = () => { setPlaying(false); simTimeRef.current = 0; setT(0); };
  const jumpToEnd = () => { setPlaying(false); simTimeRef.current = tMax; setT(tMax); };

  return { setup, t, tt, tMax, playing, rate, err, reduced, s, arrows, net, live, change, setPlaying, setT, setRate, reset, jumpToEnd };
}

export const BrakingScene: React.FC<{ b: UseBrakingDemoReturn; alt?: string }> = ({ b, alt }) => {
  const { setup, s } = b;
  const span = Math.max(10, setup.speed * (BRAKE_AT + 1.5) + 4);
  const leftPad = 135;
  const rightPad = 35;
  const roadW = W - leftPad - rightPad;
  const X = (m: number) => leftPad + (m / span) * roadW;
  const carW = 110;
  const carX = X(s.vehicleX);
  const seat = carX - carW * 0.5;
  const pX = seat + (s.relative / GAP_M) * (carW * 0.35);
  const tick = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60].filter((m) => m <= span);
  const text = alt ?? `Sudden braking: vehicle at ${r2(setup.speed)} m/s brakes at ${r2(setup.decel)} m/s² from 1 s. Passenger ${setup.restrained ? 'wears a belt' : 'has no belt'}. ${b.live}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={text} className="w-full h-auto rounded-xl bg-surface-lowest border border-surface-border" data-testid="braking-scene">
      <line x1={15} y1={110} x2={W - 15} y2={110} stroke={PHYS.axis} strokeWidth={3} />
      {tick.map((m) => (
        <g key={m}>
          <line x1={X(m)} y1={106} x2={X(m)} y2={116} stroke="#94a3b8" />
          <text x={X(m)} y={130} textAnchor="middle" fontSize={10} fill="#94a3b8">{m}</text>
        </g>
      ))}
      <text x={W - 20} y={144} textAnchor="end" fontSize={10} fill="#94a3b8">position on the road (m)</text>
      {/* Car chassis - cleanly bounded so rear does not clip */}
      <rect x={carX - carW} y={62} width={carW} height={44} rx={8} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
      {/* Seat backrest */}
      <rect x={seat - 10} y={70} width={6} height={20} fill="#475569" />
      <text x={carX - carW / 2} y={100} textAnchor="middle" fontSize={10} fill={PHYS.position}>vehicle {r2(s.vehicleV)} m/s</text>
      {/* Passenger */}
      <circle cx={pX} cy={72} r={9} fill={PHYS.velocity} stroke="#0f172a" strokeWidth={2} />
      <text x={pX} y={50} textAnchor="middle" fontSize={11} fontWeight={700} fill={PHYS.velocity}>passenger {r2(s.passengerV)} m/s</text>
      {setup.restrained && <line x1={seat - 4} y1={80} x2={pX} y2={74} stroke={PHYS.force} strokeWidth={3} strokeDasharray="4 3" />}
      <line x1={seat} y1={30} x2={seat} y2={36} stroke={PHYS.time} />
      <text x={leftPad + 2} y={20} fontSize={10} fill={PHYS.time}>{s.state === 'cruising' ? 'cruising' : s.state}</text>
    </svg>
  );
};

export const BrakingSetupFields: React.FC<{ b: UseBrakingDemoReturn }> = ({ b }) => {
  const { setup, change, err } = b;
  return (
    <div className="space-y-3" data-testid="braking-controls">
      <div className="space-y-2">
        <NumField id="speed" label="Speed" unit="m/s" value={setup.speed} step={5} onChange={(v) => change({ speed: v })} />
        <NumField id="decel" label="Braking deceleration" unit="m/s²" value={setup.decel} step={1} onChange={(v) => change({ decel: v })} />
        <NumField id="pmass" label="Passenger mass" unit="kg" value={setup.passengerMassKg} step={10} onChange={(v) => change({ passengerMassKg: v })} />
        
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Seat Belt Restraint</span>
          <div role="group" aria-label="Seat belt" className="grid grid-cols-2 gap-1.5">
            {[false, true].map((on) => (
              <button
                key={String(on)}
                type="button"
                aria-pressed={setup.restrained === on}
                data-belt={on ? 'on' : 'off'}
                onClick={() => change({ restrained: on })}
                className={`min-h-[36px] px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  setup.restrained === on
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-surface-border bg-surface-lowest text-slate-400 hover:text-slate-200'
                }`}
              >
                {setup.restrained === on && <span className="material-symbols-outlined text-[14px]">check</span>}
                <span>{on ? 'Belt on' : 'No belt'}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed bg-surface-lowest/50 p-2 rounded-lg border border-surface-border">
        Simplified teaching model: vehicle braking from 1 s on slippery seat without seat friction. Ends before contact. Max speed {BRAKING_LIMITS.maxSpeed} m/s.
      </p>

      {err && (
        <p role="alert" className="text-xs font-bold p-2 rounded bg-rose-500/10 border border-rose-500/20" style={{ color: PHYS.error }} data-testid="braking-error">
          <span aria-hidden>{'✗ '}</span>{err}
        </p>
      )}
    </div>
  );
};

export const BrakingTimeControls: React.FC<{ b: UseBrakingDemoReturn; compact?: boolean }> = ({ b, compact = false }) => {
  const { tt, tMax, playing, setPlaying, setT, reset, jumpToEnd, rate, setRate, reduced } = b;
  return (
    <div role="group" aria-label="Time controls" className={`flex flex-wrap items-center gap-2 ${compact ? '' : 'rounded-xl border border-surface-border bg-surface-card/60 p-3'}`} data-testid="braking-time">
      {!compact && <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>{'⏱'} Simulated time (braking starts at 1 s)</span>}
      <button
        type="button"
        onClick={() => { if (tt >= tMax) setT(0); setPlaying((x) => !x); }}
        aria-pressed={playing}
        className="min-h-[34px] px-3 rounded-lg font-bold text-xs text-slate-950 flex items-center gap-1 shadow-sm transition-transform active:scale-95"
        style={{ background: PHYS.time }}
        data-testid="braking-play"
      >
        <span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : tt >= tMax ? 'replay' : 'play_arrow'}</span>
        <span>{playing ? 'Pause' : tt >= tMax ? 'Replay' : 'Play'}</span>
      </button>
      <button
        type="button"
        onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt * 10) / 10 - 0.1)); }}
        aria-label="Step back 0.1 s"
        className="min-h-[34px] px-2.5 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-variant text-slate-200 text-xs transition-colors"
      >
        {'−0.1s'}
      </button>
      <button
        type="button"
        onClick={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt * 10) / 10 + 0.1)); }}
        aria-label="Step forward 0.1 s"
        className="min-h-[34px] px-2.5 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-variant text-slate-200 text-xs transition-colors"
      >
        {'+0.1s'}
      </button>
      <button
        type="button"
        onClick={reset}
        className="min-h-[34px] px-2.5 rounded-lg border text-xs transition-colors"
        style={{ borderColor: `${PHYS.error}66`, color: PHYS.error }}
        data-testid="braking-reset"
      >
        Reset
      </button>
      <button
        type="button"
        onClick={jumpToEnd}
        className="min-h-[34px] px-2.5 rounded-lg border border-surface-border bg-surface-card hover:bg-surface-variant text-slate-200 text-xs transition-colors"
        data-testid="braking-end"
      >
        End
      </button>
      <label className="flex items-center gap-1.5 text-xs text-slate-300 ml-auto">
        <span className="text-[11px] text-slate-400">Speed:</span>
        <select
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          aria-label="Replay speed on screen. This does not change the motion."
          className="min-h-[32px] rounded-md border border-surface-border bg-surface-lowest px-1.5 text-white text-xs"
        >
          <option value={0.5}>0.5×</option>
          <option value={1}>1×</option>
          <option value={2}>2×</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-300 w-full sm:w-auto grow min-w-[140px]">
        <input
          type="range"
          min={0}
          max={tMax}
          step="any"
          value={tt}
          onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }}
          aria-label="Simulated time"
          aria-valuetext={`${r2(tt)} seconds`}
          className="w-full accent-amber-400 cursor-pointer"
        />
      </label>
      {!compact && (
        <p className="basis-full text-[11px] text-slate-400">
          Replay speed only changes how fast the picture plays.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}
        </p>
      )}
    </div>
  );
};

export const BrakingReadout: React.FC<{ b: UseBrakingDemoReturn; className?: string }> = ({ b, className = "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2" }) => {
  const { s } = b;
  const metrics: [string, string, string, string][] = [
    ['t', 'Simulated time', `${r2(s.t)} s`, PHYS.time],
    ['vv', 'Vehicle velocity', `${r2(s.vehicleV)} m/s`, PHYS.position],
    ['pv', 'Passenger velocity', `${r2(s.passengerV)} m/s`, PHYS.velocity],
    ['rel', 'Forward of seat', `${r2(s.relative)} m`, PHYS.displacement],
    ['force', 'Belt force on passenger', `${r2(s.passengerForce)} N`, PHYS.force],
    ['state', 'Motion state', s.state, '#e2e8f0'],
  ];

  return (
    <dl className={className} data-testid="braking-readout">
      {metrics.map(([id, label, value, color]) => (
        <div key={id} className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
          <dt className="text-[11px] text-slate-400 font-medium truncate">{label}</dt>
          <dd data-readout={id} className="font-mono text-base font-bold leading-tight mt-0.5" style={{ color }}>{value}</dd>
        </div>
      ))}
    </dl>
  );
};

export const BrakingLiveStatus: React.FC<{ b: UseBrakingDemoReturn }> = ({ b }) => {
  return (
    <div role="status" aria-live="polite" className="text-sm text-slate-200 rounded-xl border border-surface-border bg-surface-card p-3 leading-relaxed space-y-2" data-testid="braking-live">
      <div className="flex items-center gap-2 text-xs font-mono uppercase text-amber-400 font-semibold">
        <span className="material-symbols-outlined text-[16px]">info</span>
        <span>Newton's First Law (Inertia)</span>
      </div>
      <p>{b.live}</p>
    </div>
  );
};

export const BrakingDemoView: React.FC<BrakingProps> = ({ initial = DEFAULT_BRAKING, editable = true, alt, resetToken }) => {
  const b = useBrakingDemo({ initial, resetToken });

  return (
    <div className="space-y-3" data-visual="brakingDemo" data-testid="braking-demo">
      {editable && (
        <div className="rounded-xl border border-surface-border bg-surface-card/60 p-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-2">Set up the demonstration</h3>
          <BrakingSetupFields b={b} />
        </div>
      )}
      <BrakingScene b={b} alt={alt} />
      <ForceFigure
        object="passenger"
        arrows={b.arrows}
        net={b.net}
        showIndividual
        showNet
        alt={`Forces on the passenger: ${b.setup.restrained && b.s.passengerForce !== 0 ? `belt ${r2(Math.abs(b.s.passengerForce))} N backward; ` : 'no horizontal force; '}weight and normal force ${r2(b.setup.passengerMassKg * G)} N each, vertical.`}
      />
      <BrakingTimeControls b={b} />
      <BrakingReadout b={b} className="grid grid-cols-2 lg:grid-cols-4 gap-2" />
      <BrakingLiveStatus b={b} />
    </div>
  );
};

export const BrakingDemoVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as { setup?: BrakingSetup; editable?: boolean };
  return <BrakingDemoView initial={p.setup ?? DEFAULT_BRAKING} editable={Boolean(p.editable)} alt={alt} />;
};
