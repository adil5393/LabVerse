/**
 * The Energy Laboratory scene (PHY-3C): an object on a ramp (or in free fall), a horizontal energy-bar view of K, U, the thermal
 * energy Q and the mechanical energy, an energy graph and a bookkeeping table that checks K + U + Q = constant. Everything is read
 * from `computeEnergy` (exact closed-form motion, no drift). Simulated time is the clock, never the frame count; reduced motion jumps.
 */

import React, { useEffect, useRef, useState } from 'react';
import { computeEnergy, cosT, describeEnergy, ENERGY_LIMITS, energyAtDistance, energyAtTime, energySeries, sinT, type EnergyResult, type EnergySetup, type EnergyState } from '../../../engine/physics/work/energyLab';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { ENERGY, PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { VisualProps } from '../../education/visuals';
import { EnergyPlot } from './EnergyPlot';
import { Field } from './Field';

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : n > 0 ? `+${f2(n)}` : f2(n));
const W = 440, H = 250;

const Scene: React.FC<{ r: EnergyResult; st: EnergyState; alt: string }> = ({ r, st, alt }) => {
  const { startHeight: h0, angleDeg: th, refHeight: ref, massKg: m } = r.setup;
  const sin = sinT(th), cos = cosT(th), d = r.slopeLength;
  const Lh = d * cos;
  const vertical = th === 90;
  const k = Math.min(vertical ? 1e9 : 320 / Math.max(Lh, 1e-9), 170 / h0);
  const x0 = 64, ground = 218, top = ground - k * h0;
  const px = (s: number) => x0 + k * s * cos + (vertical ? 40 : 0), py = (s: number) => ground - k * (h0 - s * sin);
  const bx = px(st.s), by = py(st.s);
  const refY = ground - k * ref;
  const refVisible = refY >= 8 && refY <= H - 4;
  const arrow = Math.min(40, st.v * 4);
  const ux = vertical ? 0 : cos, uy = vertical ? 1 : sin;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="energy-svg">
      <line x1={x0 - 10} y1={ground} x2={W - 14} y2={ground} stroke={PHYS.axis} strokeWidth={3} />
      <text x={x0 - 14} y={ground + 4} textAnchor="end" fontSize={11} fill="#94A3B8">0 m</text>
      <line x1={x0 - 6} y1={top} x2={x0 - 14} y2={top} stroke={PHYS.axis} strokeWidth={2} /><text x={x0 - 18} y={top + 4} textAnchor="end" fontSize={11} fill="#94A3B8">{f2(h0)} m</text>
      {vertical
        ? <line data-testid="ramp" x1={px(0)} y1={top} x2={px(0)} y2={ground} stroke={PHYS.axis} strokeWidth={3} strokeDasharray="2 5" />
        : <g data-testid="ramp"><polygon points={`${px(0)},${top} ${px(d)},${ground} ${px(0)},${ground}`} fill="#1e293b" opacity={0.7} /><line x1={px(0)} y1={top} x2={px(d)} y2={ground} stroke={PHYS.axis} strokeWidth={4} /></g>}
      {refVisible && <g data-testid="reference-line"><line x1={x0 - 6} y1={refY} x2={W - 14} y2={refY} stroke={ENERGY.potential} strokeDasharray="6 4" /><text x={x0 + 4} y={refY + 14} textAnchor="start" fontSize={11} fill={ENERGY.potential}>reference height {f2(ref)} m: U = 0</text></g>}
      {!refVisible && <text x={W - 16} y={16} textAnchor="end" fontSize={11} fill={ENERGY.potential} data-testid="reference-line">reference height {f2(ref)} m (off the picture)</text>}
      <circle cx={bx} cy={by - 12} r={12} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
      <text x={bx} y={by - 8} textAnchor="middle" fontSize={10} fontWeight={700} fill="#e2e8f0">{f2(m)}</text>
      {st.v > 1e-9 && <g data-arrow="velocity"><line x1={bx} y1={by - 12} x2={bx + ux * arrow} y2={by - 12 + uy * arrow} stroke={PHYS.velocity} strokeWidth={3} /><text x={bx + ux * arrow + (bx + ux * arrow > W - 110 ? -4 : 4)} y={by - 12 + uy * arrow + (uy * arrow > 4 ? 12 : -6)} textAnchor={bx + ux * arrow > W - 110 ? 'end' : 'start'} fontSize={11} fontWeight={700} fill={PHYS.velocity}>v {f2(st.v)} m/s</text></g>}
      <text x={W - 16} y={H - 6} textAnchor="end" fontSize={11} fill="#94A3B8">height {f2(st.h)} m</text>
    </svg>
  );
};

const Bars: React.FC<{ r: EnergyResult; st: EnergyState }> = ({ r, st }) => {
  const series = energySeries(r, 40);
  const scale = Math.max(1, ...series.flatMap((p) => [Math.abs(p.K), Math.abs(p.U), p.Q, Math.abs(p.mechanical)]), Math.abs(r.E0));
  const neg = Math.min(0, ...series.map((p) => p.U), ...series.map((p) => p.mechanical));
  const width = 440, left = 118, right = 78, usable = width - left - right;
  const lo = Math.min(0, neg), unit = usable / (scale - lo), zero = left + -lo * unit;
  const rows: { id: string; label: string; v: number; color: string }[] = [
    { id: 'kinetic', label: 'kinetic K', v: st.K, color: ENERGY.kinetic },
    { id: 'potential', label: 'potential U', v: st.U, color: ENERGY.potential },
    { id: 'thermal', label: 'thermal Q (friction)', v: st.Q, color: ENERGY.thermal },
    { id: 'mechanical', label: 'mechanical K + U', v: st.mechanical, color: ENERGY.total },
  ];
  return (
    <svg viewBox={`0 0 ${width} 150`} role="img" aria-label={`Energy bars. Kinetic ${f2(st.K)} J, potential ${f2(st.U)} J, thermal from friction ${f2(st.Q)} J, mechanical ${f2(st.mechanical)} J, total ${f2(st.total)} J.`} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="energy-bars">
      {rows.map((row, i) => {
        const y = 14 + i * 32, len = row.v * unit;
        return (
          <g key={row.id} data-bar={row.id} data-value={row.v}>
            <text x={left - 8} y={y + 14} textAnchor="end" fontSize={11} fontWeight={700} fill={row.color}>{row.label}</text>
            <rect x={Math.min(zero, zero + len)} y={y} width={Math.abs(len)} height={20} rx={3} fill={row.color} opacity={row.id === 'mechanical' ? 0.55 : 0.9} />
            <text x={Math.max(zero, zero + len) + 6} y={y + 14} fontSize={11} fill="#e2e8f0">{f2(row.v)} J</text>
          </g>
        );
      })}
      <line x1={zero} y1={6} x2={zero} y2={144} stroke="#94A3B8" strokeWidth={1.5} />
      <line x1={zero + r.E0 * unit} y1={6} x2={zero + r.E0 * unit} y2={144} stroke={ENERGY.total} strokeDasharray="4 4" data-testid="initial-total-line" />
      <text x={Math.min(width - 4, zero + r.E0 * unit + 4)} y={148} fontSize={9} fill={ENERGY.total} textAnchor={zero + r.E0 * unit > width - 90 ? 'end' : 'start'}>starting total {f2(r.E0)} J</text>
    </svg>
  );
};

const Figure: React.FC<{ r: EnergyResult; st: EnergyState; axis: 'time' | 'distance' }> = ({ r, st, axis }) => {
  const series = energySeries(r, 80);
  const X = (p: EnergyState) => (axis === 'time' ? p.t : p.s);
  const xmax = Math.max(axis === 'time' ? r.tEnd : r.sEnd, 0.1);
  const all = series.flatMap((p) => [p.K, p.U, p.mechanical, p.total, p.Q]);
  const lo = Math.min(0, ...all), hi = Math.max(1, ...all) * 1.12;
  const pts = (f: (p: EnergyState) => number) => series.map((p) => [X(p), f(p)] as [number, number]);
  return (
    <EnergyPlot id="energy-graph" title={`Energy against ${axis === 'time' ? 'time' : 'distance along the slope'}`} xName={axis === 'time' ? 'time t' : 'distance s'} xUnit={axis === 'time' ? 's' : 'm'} yName="energy" yUnit="J" xr={[0, xmax]} yr={[lo * 1.1, hi]}
      lines={[
        { id: 'k', name: 'kinetic K', color: ENERGY.kinetic, pts: pts((p) => p.K) },
        { id: 'u', name: 'potential U', color: ENERGY.potential, pts: pts((p) => p.U) },
        { id: 'q', name: 'thermal Q', color: ENERGY.thermal, pts: pts((p) => p.Q) },
        { id: 'm', name: 'mechanical K + U', color: ENERGY.total, pts: pts((p) => p.mechanical), dash: '6 4' },
      ]}
      cursor={axis === 'time' ? st.t : st.s}
      caption={`Now: K = ${f2(st.K)} J, U = ${f2(st.U)} J, Q = ${f2(st.Q)} J. K + U + Q = ${f2(st.total)} J always. ${r.setup.mu > 0 && r.setup.angleDeg < 90 ? 'With friction the dashed mechanical energy falls while the thermal energy rises by the same amount.' : 'With no friction the dashed mechanical energy is flat.'}`}
      alt={`Energy against ${axis}: kinetic energy rises from ${f2(r.K0)} J, potential energy falls from ${f2(r.U0)} J, thermal energy ${f2(st.Q)} J so far. Mechanical energy K + U goes from ${f2(r.E0)} J to ${f2(energyAtTime(r, r.tEnd).mechanical)} J.`} />
  );
};

/** `startFraction` is the fraction of the DISTANCE along the slope at which the scene is first drawn (0 = top, 1 = bottom). */
export interface EnergyViewProps { initial: EnergySetup; editable?: boolean; alt?: string; startFraction?: number }

export const EnergyView: React.FC<EnergyViewProps> = ({ initial, editable = false, alt, startFraction = 0 }) => {
  const [setup, setSetup] = useState<EnergySetup>(initial);
  const r0 = computeEnergy(initial);
  const [t, setT] = useState(r0.valid ? energyAtDistance(r0, r0.sEnd * startFraction).t : 0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [axis, setAxis] = useState<'time' | 'distance'>('time');
  const reduced = useReducedMotion();
  const r = computeEnergy(setup);
  const change = (patch: Partial<EnergySetup>) => { setSetup((s) => ({ ...s, ...patch })); setPlaying(false); setT(0); };

  const ref = useRef({ t, tEnd: r.tEnd, rate });
  useEffect(() => { ref.current = { t, tEnd: r.tEnd, rate }; });
  useEffect(() => {
    if (!playing) return;
    if (reduced) { const id = window.setTimeout(() => { setT(ref.current.tEnd); setPlaying(false); }, 0); return () => window.clearTimeout(id); }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const { t: t0, tEnd, rate: rr } = ref.current;
      const next = tickClock(t0 * 1000, now - last, rr, tEnd * 1000) / 1000;
      last = now; setT(next);
      if (next >= tEnd) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const tt = Math.min(t, r.tEnd);
  const st = r.valid ? energyAtTime(r, tt) : null;
  const btn = 'min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100';
  const cell = (k: string, label: string, v: string, color?: string) => <div key={k} data-readout={k} className="rounded-lg bg-surface-card px-2 py-1"><div className="text-[10px] text-slate-400">{label}</div><div className="font-mono text-sm font-bold" style={{ color: color ?? '#e2e8f0' }}>{v}</div></div>;
  const closes = st ? Math.abs(st.total - r.E0) < 1e-6 : false;
  const friction = setup.mu > 0 && setup.angleDeg < 90;

  return (
    <div className="space-y-3 min-w-0" data-visual="energyLab" data-testid="energy-view">
      {r.valid && st ? (
        <>
          <Scene r={r} st={st} alt={describeEnergy(r)} />
          <Bars r={r} st={st} />
        </>
      ) : <p role="alert" className="text-sm rounded-xl border px-3 py-3" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid="energy-error">This setup cannot run: {r.reason}</p>}
      {r.valid && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Run the experiment">
          <button type="button" onClick={() => { if (t >= r.tEnd) setT(0); setPlaying((p) => !p); }} disabled={r.tEnd === 0} className={`${btn} bg-surface-elevated`} data-testid="energy-play">{playing ? 'Pause' : t >= r.tEnd && r.tEnd > 0 ? 'Replay' : 'Play'}</button>
          <button type="button" onClick={() => { setPlaying(false); setT(0); }} className={`${btn} bg-surface-card`} data-testid="energy-reset">Back to start</button>
          <label className="flex items-center gap-2 text-xs text-slate-300 flex-1 min-w-[160px]">Time
            <input type="range" min={0} max={r.tEnd} step={Math.max(r.tEnd / 200, 0.001)} value={tt} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${f2(tt)} seconds of ${f2(r.tEnd)}`} className="flex-1 min-h-[44px]" data-testid="energy-time" />
            <span className="font-mono w-24">{f2(tt)} / {f2(r.tEnd)} s</span>
          </label>
        </div>
      )}
      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="energy-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the experiment</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="mass" label="Mass" unit="kg" value={setup.massKg} step={1} onChange={(v) => change({ massKg: v })} />
            <Field id="height" label="Start height" unit="m" value={setup.startHeight} step={1} onChange={(v) => change({ startHeight: v })} />
            <Field id="angle" label="Ramp angle" unit="° (90 = drop)" value={setup.angleDeg} step={10} onChange={(v) => change({ angleDeg: v })} />
            <Field id="mu" label="Friction coefficient" unit="(0 = none)" value={setup.mu} step={0.1} onChange={(v) => change({ mu: Math.round(v * 100) / 100 })} />
          </div>
          <details className="rounded-lg border border-surface-border px-3 py-1" data-testid="energy-more">
            <summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (g, initial speed, reference height, graph axis, playback speed)</summary>
            <div className="py-2 space-y-2">
              <div className="flex flex-wrap gap-3 items-center">
                <Field id="g" label="g" unit="m/s²" value={setup.g} step={1} onChange={(v) => change({ g: v })} />
                <Field id="u0" label="Initial speed (down the slope)" unit="m/s" value={setup.u0} step={1} onChange={(v) => change({ u0: v })} />
                <Field id="ref" label="Reference height (U = 0)" unit="m" value={setup.refHeight} step={1} onChange={(v) => change({ refHeight: v })} />
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <label className="flex items-center gap-2 text-xs text-slate-300">Graph against
                  <select value={axis} onChange={(e) => setAxis(e.target.value as 'time' | 'distance')} aria-label="Graph axis" data-testid="energy-axis" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value="time">time</option><option value="distance">distance along the slope</option></select>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300">Playback speed
                  <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Playback speed" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
                </label>
              </div>
              <p className="text-[11px] text-slate-400">Mass {ENERGY_LIMITS.massMin} to {ENERGY_LIMITS.massMax} kg; height {ENERGY_LIMITS.heightMin} to {ENERGY_LIMITS.heightMax} m; angle {ENERGY_LIMITS.angleMin} to {ENERGY_LIMITS.angleMax}°; friction coefficient 0 to {ENERGY_LIMITS.muMax}; g {ENERGY_LIMITS.gMin} to {ENERGY_LIMITS.gMax}; initial speed 0 to {ENERGY_LIMITS.uMax} m/s. The object is released at the top and moves down; the run ends at the bottom (no bounce). The reference height changes U only. Simulated time follows the clock.</p>
            </div>
          </details>
        </div>
      )}
      {r.valid && st && (
        <section aria-label="Energy bookkeeping" className="space-y-2" data-testid="energy-readout">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cell('t', 'time', `${f2(st.t)} s`, PHYS.time)}
            {cell('v', 'speed', `${f2(st.v)} m/s`, PHYS.velocity)}
            {cell('h', 'height above the ground', `${f2(st.h)} m`, PHYS.position)}
            {cell('a', 'acceleration along the slope', `${sg(r.a)} m/s²`, PHYS.acceleration)}
            {cell('K', 'kinetic K = ½mv²', `${f2(st.K)} J`, ENERGY.kinetic)}
            {cell('U', `potential U = mg(h − ${f2(setup.refHeight)})`, `${f2(st.U)} J`, ENERGY.potential)}
            {cell('Q', 'thermal Q (friction)', `${f2(st.Q)} J`, ENERGY.thermal)}
            {cell('M', 'mechanical K + U', `${f2(st.mechanical)} J`, ENERGY.total)}
          </div>
          <p className="text-sm rounded-xl border px-3 py-2 font-mono text-slate-100" style={{ borderColor: closes ? PHYS.correct : PHYS.error, background: `${PHYS.correct}0D` }} data-testid="energy-total">
            {closes ? '✓ ' : '✗ '}K + U + Q = {f2(st.K)} + {f2(st.U)} + {f2(st.Q)} = {f2(st.total)} J &nbsp; (the starting total is {f2(r.E0)} J){friction ? ' · the mechanical energy K + U has dropped by exactly Q' : ''}
          </p>
          <Figure r={r} st={st} axis={axis} />
          {!alt && <p className="text-xs text-slate-300" data-testid="energy-description">{describeEnergy(r)}</p>}
          <p className="text-[11px] text-slate-400">Assumptions: a point-like object, constant g, a straight ramp, constant kinetic friction (coefficient {f2(setup.mu)}), no air resistance, no bounce at the bottom. U is measured from the reference height you choose: only changes of U matter. A model result, not a proof.</p>
        </section>
      )}
    </div>
  );
};

export const EnergyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { setup: EnergySetup; editable?: boolean; fraction?: number };
  return <EnergyView initial={p.setup} editable={p.editable ?? false} alt={alt} startFraction={p.fraction ?? 0} />;
};
