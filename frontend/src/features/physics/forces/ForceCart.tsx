/**
 * The Force Laboratory cart (PHY-2A): a cart on a track, its force diagram, the numbers and a v–t strip, all drawn from ONE
 * model (engine/physics/forces/forceModel.ts). Playback only moves a clock in simulated time (never the frame rate);
 * changing a setting resets to t = 0; nothing needs dragging.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { diagramOf } from '../../../engine/physics/forces/forceDiagram';
import {
  DEFAULT_SETUP, explain, LIMITS, sampleAtTime, simulate, SURFACES, surfaceById, validateSetup, type Dir, type Setup,
} from '../../../engine/physics/forces/forceModel';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { ArrowsVisualProps, CartVisualProps } from '../../../engine/physics/forces/learn/questions';
import { toArrows } from '../../../engine/physics/forces/learn/questions';
import { describeDiagram, netArrow } from '../../../engine/physics/forces/forceDiagram';

const r2 = (n: number, p = 2): string => { const r = Math.round(n * 10 ** p) / 10 ** p; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${r2(Math.abs(n))}`);

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
        <input value={text} data-field={id} inputMode="decimal" aria-label={`${label} in ${unit}`} onChange={(e) => { setText(e.target.value); const n = Number(e.target.value.replace('−', '-')); if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n); }}
          className="w-16 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" /></label><span>{unit}</span>
      <button type="button" aria-label={`Decrease ${label} by ${step}`} onClick={() => onChange(Math.round((value - step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">{'−'}</button>
      <button type="button" aria-label={`Increase ${label} by ${step}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">+</button>
    </div>
  );
};

const DirToggle: React.FC<{ label: string; value: Dir; onChange: (d: Dir) => void }> = ({ label, value, onChange }) => (
  <div role="group" aria-label={`Direction of ${label}`} className="flex gap-1">
    {(['left', 'right'] as Dir[]).map((d) => (
      <button key={d} type="button" aria-pressed={value === d} data-dir={`${label}-${d}`} onClick={() => onChange(d)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: value === d ? PHYS.force : '#334155' }}>{value === d ? '✓ ' : ''}{d === 'left' ? '← Left' : 'Right →'}</button>
    ))}
  </div>
);

const TRACK_W = 620, TRACK_H = 110;

const Track: React.FC<{ setup: Setup; tMax: number; t: number }> = ({ setup, tMax, t }) => {
  const all = useMemo(() => simulate(setup, tMax), [setup, tMax]);
  let lo = Math.min(...all.map((p) => p.x), 0), hi = Math.max(...all.map((p) => p.x), 0);
  if (hi - lo < 4) { lo -= 2; hi += 2; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const X = (x: number) => 30 + ((x - lo) / (hi - lo)) * (TRACK_W - 60);
  const step = [1, 2, 5, 10, 20, 50, 100, 200].find((s) => (hi - lo) / s <= 8) ?? 500;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  const p = sampleAtTime(setup, t, tMax);
  const surface = surfaceById(setup.surfaceId);
  return (
    <svg viewBox={`0 0 ${TRACK_W} ${TRACK_H}`} role="img" aria-label={`Track from ${r2(lo)} m to ${r2(hi)} m. At ${r2(t)} s the cart is at ${sg(p.x)} m moving at ${sg(p.v)} m/s.`} className="w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="force-track">
      <line x1={20} y1={70} x2={TRACK_W - 20} y2={70} stroke={surface.muK === 0 ? '#38bdf8' : PHYS.axis} strokeWidth={4} strokeDasharray={surface.muK === 0 ? '2 6' : '0'} />
      {ticks.map((v) => <g key={v}><line x1={X(v)} y1={66} x2={X(v)} y2={76} stroke="#94a3b8" /><text x={X(v)} y={92} textAnchor="middle" fontSize={10} fill={v === 0 ? PHYS.origin : '#94a3b8'}>{v}</text></g>)}
      <text x={TRACK_W - 24} y={106} textAnchor="end" fontSize={10} fill="#94a3b8">position (m) · surface: {surface.label}</text>
      <rect x={X(p.x) - 17} y={40} width={34} height={26} rx={4} fill={PHYS.position} stroke="#0f172a" strokeWidth={2} />
      <circle cx={X(p.x) - 9} cy={70} r={4} fill="#0f172a" /><circle cx={X(p.x) + 9} cy={70} r={4} fill="#0f172a" />
      <text x={X(p.x)} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill={PHYS.position}>{sg(p.x)} m</text>
    </svg>
  );
};

const VStrip: React.FC<{ setup: Setup; tMax: number; t: number }> = ({ setup, tMax, t }) => {
  const all = useMemo(() => simulate(setup, tMax), [setup, tMax]);
  const pts = all.filter((_, i) => i % 5 === 0);
  let lo = Math.min(0, ...pts.map((p) => p.v)), hi = Math.max(0, ...pts.map((p) => p.v));
  if (hi - lo < 1) hi = lo + 1;
  const W = 620, H = 130, X = (tt: number) => 44 + (tt / tMax) * (W - 60), Y = (v: number) => 12 + (1 - (v - lo) / (hi - lo)) * (H - 40);
  const cur = sampleAtTime(setup, t, tMax);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Velocity–time strip: the velocity goes from ${sg(all[0].v)} m/s to ${sg(all[all.length - 1].v)} m/s over ${tMax} s; at ${r2(t)} s it is ${sg(cur.v)} m/s.`} className="w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="force-vstrip">
      <line x1={44} y1={Y(0)} x2={W - 16} y2={Y(0)} stroke="#94a3b8" strokeWidth={1} />
      <path d={pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t)},${Y(p.v)}`).join(' ')} fill="none" stroke={PHYS.velocity} strokeWidth={2.5} />
      <line x1={X(t)} y1={10} x2={X(t)} y2={H - 28} stroke={PHYS.time} strokeDasharray="5 3" />
      <circle cx={X(t)} cy={Y(cur.v)} r={5} fill={PHYS.velocity} />
      <text x={8} y={16} fontSize={10} fill={PHYS.velocity}>v (m/s)</text>
      <text x={W - 16} y={H - 8} textAnchor="end" fontSize={10} fill={PHYS.time}>time (s), 0 to {tMax}</text>
      <text x={44} y={H - 8} fontSize={10} fill="#94a3b8">{lo < 0 ? r2(lo) : '0'}…{r2(hi)} m/s</text>
    </svg>
  );
};

export interface ForceCartProps { initial?: Setup; editable?: boolean; showNet?: boolean; startTime?: number; alt?: string; resetToken?: number }

export const ForceCartView: React.FC<ForceCartProps> = ({ initial = DEFAULT_SETUP, editable = true, showNet = true, startTime = 0, alt, resetToken }) => {
  const [setup, setSetup] = useState<Setup>(initial);
  const [prevInit, setPrevInit] = useState(initial);
  const [prevTok, setPrevTok] = useState(resetToken);
  if (prevInit !== initial || prevTok !== resetToken) { setPrevInit(initial); setPrevTok(resetToken); setSetup(initial); }
  const [tMax, setTMax] = useState(20);
  const [t, setT] = useState(startTime);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const [showIndividual, setShowIndividual] = useState(true);
  const [showNetForce, setShowNetForce] = useState(showNet);
  const reduced = useReducedMotion();
  const tt = Math.min(t, tMax);
  const p = sampleAtTime(setup, tt, tMax);
  const d = diagramOf(p);

  const change = (patch: Partial<Setup>) => {
    const next = { ...setup, ...patch };
    const why = validateSetup(next);
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

  const live = explain(setup, p);
  const figureAlt = alt ?? `${d.text}`;

  return (
    <div className="space-y-3" data-visual="forceCart" data-testid="force-cart">
      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="force-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the cart</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="mass" label="Cart mass" unit="kg" value={setup.massKg} step={1} onChange={(v) => change({ massKg: v })} />
            <Field id="velocity" label="Starting velocity" unit="m/s" value={setup.startVelocity} step={1} onChange={(v) => change({ startVelocity: v })} />
            <label className="flex items-center gap-2 text-xs text-slate-300">Surface
              <select value={setup.surfaceId} onChange={(e) => change({ surfaceId: e.target.value })} aria-label="Surface under the cart" data-testid="surface-select" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
                {SURFACES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold" style={{ color: PHYS.force }}>Push A</span>
            <Field id="forceA" label="Force A" unit="N" value={setup.forceA} step={1} onChange={(v) => change({ forceA: v })} />
            <DirToggle label="A" value={setup.dirA} onChange={(dir) => change({ dirA: dir })} />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold" style={{ color: PHYS.force }}>Push B</span>
            <Field id="forceB" label="Force B" unit="N" value={setup.forceB} step={1} onChange={(v) => change({ forceB: v })} />
            <DirToggle label="B" value={setup.dirB} onChange={(dir) => change({ dirB: dir })} />
          </div>
          <p className="text-[11px] text-slate-400">Assumptions: a cart on a horizontal track (weight = normal force, g = 10 m/s²), right is positive, no air resistance. Friction uses the simple dry-friction model: {surfaceById(setup.surfaceId).note} Mass {LIMITS.minMass} to {LIMITS.maxMass} kg, forces up to {LIMITS.maxForce} N.</p>
          {err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="force-error"><span aria-hidden>{'✗ '}</span>{err}</p>}
        </div>
      )}

      <Track setup={setup} tMax={tMax} t={tt} />

      <div role="group" aria-label="Show forces" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={showIndividual} data-toggle="individual" onClick={() => setShowIndividual((x) => !x)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: showIndividual ? PHYS.force : '#334155' }}>{showIndividual ? '✓ ' : ''}Show the individual forces</button>
        <button type="button" aria-pressed={showNetForce} data-toggle="net" onClick={() => setShowNetForce((x) => !x)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: showNetForce ? PHYS.netForce : '#334155' }}>{showNetForce ? '✓ ' : ''}Show the net force</button>
      </div>
      <ForceFigure object="cart" arrows={d.arrows} net={d.net} showIndividual={showIndividual} showNet={showNetForce} alt={figureAlt} />

      <div role="group" aria-label="Time controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="force-time">
        <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>{'⏱'} Simulated time (fixed 0.01 s steps)</span>
        <button type="button" onClick={() => { if (tt >= tMax) setT(0); setPlaying((x) => !x); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.time }} data-testid="force-play">{playing ? 'Pause' : tt >= tMax ? 'Replay' : 'Play'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt) - 1)); }} aria-label="Step back 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">{'Step −1 s'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt) + 1)); }} aria-label="Step forward 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +1 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="min-h-[44px] px-3 rounded-lg border text-sm" style={{ borderColor: PHYS.error, color: PHYS.error }} data-testid="force-reset">Reset to 0 s</button>
        <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This does not change the motion." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300">Run length
          <select value={tMax} onChange={(e) => { setTMax(Number(e.target.value)); setT(0); setPlaying(false); }} aria-label="Length of the run in seconds" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={10}>10 s</option><option value={20}>20 s</option><option value={30}>30 s</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
          <input type="range" min={0} max={tMax} step={0.1} value={tt} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${r2(tt)} seconds`} className="w-full min-h-[44px]" />
        </label>
        <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the picture plays; the physics uses simulated time.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
      </div>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2" data-testid="force-readout">
        <Stat id="t" label="Simulated time" value={`${r2(p.t)} s`} color={PHYS.time} symbol={'⏱'} />
        <Stat id="mass" label="Mass" value={`${r2(setup.massKg)} kg`} color="#e2e8f0" symbol={'■'} />
        <Stat id="net" label="Net force" value={`${sg(p.net)} N`} color={PHYS.netForce} symbol={'→'} note="all horizontal forces added" />
        <Stat id="a" label="Acceleration" value={`${sg(p.a)} m/s²`} color={PHYS.acceleration} symbol={'⇢'} note="net force ÷ mass" />
        <Stat id="v" label="Velocity" value={`${sg(p.v)} m/s`} color={PHYS.velocity} symbol={'➤'} />
        <Stat id="x" label="Position" value={`${sg(p.x)} m`} color={PHYS.position} symbol={'●'} />
        <Stat id="friction" label="Friction" value={`${sg(p.friction)} N`} color={PHYS.friction} symbol={'↔'} note={p.frictionKind === 'static' ? 'static: matches the push' : p.frictionKind === 'kinetic' ? 'kinetic: sliding' : 'none'} />
        <Stat id="push" label="Pushes A + B" value={`${sg(p.forceA + p.forceB)} N`} color={PHYS.force} symbol={'⇒'} />
      </dl>

      <VStrip setup={setup} tMax={tMax} t={tt} />

      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="force-live">{live}</div>

      <details className="rounded-xl border border-surface-border bg-surface-card/50 p-3">
        <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-200 font-medium">Motion history (text alternative to the strip)</summary>
        <div className="overflow-x-auto"><table className="w-full text-xs mt-2">
          <caption className="sr-only">Position, velocity and net force of the cart at whole seconds</caption>
          <thead><tr className="text-slate-300"><th scope="col" className="p-1 text-left">t (s)</th><th scope="col" className="p-1 text-left">x (m)</th><th scope="col" className="p-1 text-left">v (m/s)</th><th scope="col" className="p-1 text-left">net force (N)</th></tr></thead>
          <tbody>{Array.from({ length: Math.min(tMax, 30) + 1 }, (_, i) => sampleAtTime(setup, i, tMax)).map((r) => <tr key={r.t} className="border-t border-surface-border font-mono"><td className="p-1">{r.t}</td><td className="p-1" style={{ color: PHYS.position }}>{sg(r.x)}</td><td className="p-1" style={{ color: PHYS.velocity }}>{sg(r.v)}</td><td className="p-1" style={{ color: PHYS.netForce }}>{sg(r.net)}</td></tr>)}</tbody>
        </table></div>
      </details>
    </div>
  );
};

export const ForceCartVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as CartVisualProps;
  return <ForceCartView initial={p.setup} editable={Boolean(p.editable)} showNet={p.showNet ?? true} startTime={p.t ?? 0} alt={alt} />;
};

/** Generic force arrows on one named object (not tied to the cart model); the student can switch the net force on and off. */
export const ForceArrowsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as ArrowsVisualProps;
  const arrows = toArrows(p.object, p.forces);
  const net = netArrow(arrows);
  const [individual, setIndividual] = useState(true);
  const [showNet, setShowNet] = useState(Boolean(p.showNet));
  return (
    <div className="space-y-2" data-visual="forceArrows">
      <div role="group" aria-label="Show forces" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={individual} data-toggle="individual" onClick={() => setIndividual((x) => !x)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: individual ? PHYS.force : '#334155' }}>{individual ? '✓ ' : ''}Show the individual forces</button>
        <button type="button" aria-pressed={showNet} data-toggle="net" onClick={() => setShowNet((x) => !x)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: showNet ? PHYS.netForce : '#334155' }}>{showNet ? '✓ ' : ''}Show the net force</button>
      </div>
      <ForceFigure object={p.object} arrows={arrows} net={net} showIndividual={individual} showNet={showNet} alt={alt ?? describeDiagram(arrows, net, { a: 0 })} />
    </div>
  );
};
