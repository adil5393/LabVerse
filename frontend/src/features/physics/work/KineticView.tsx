/**
 * The Work-Energy Laboratory scene (PHY-3B): a cart on a track under a constant net force, with the net-force graph (the
 * shaded area is the work), the kinetic-energy graph and a bookkeeping table that checks W_net = ΔK. Everything is read from
 * `computeKinetic` (exact kinematics): time is simulated time, never the frame count, and reduced motion jumps instead of animating.
 */

import React, { useEffect, useRef, useState } from 'react';
import { computeKinetic, describeKinetic, kineticAt, kineticSeries, KIN_LIMITS, type KineticResult, type KineticSetup } from '../../../engine/physics/work/kineticModel';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { ENERGY, PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { VisualProps } from '../../education/visuals';
import { EnergyPlot } from './EnergyPlot';
import { Field } from './Field';

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : n > 0 ? `+${f2(n)}` : f2(n));
const W = 440, H = 190;

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; width?: number }> = ({ x1, y1, x2, y2, color, width = 3 }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 9;
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} /><polygon points={`${x2},${y2} ${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)} ${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)}`} fill={color} /></g>;
};

/** Extent of the path along the track, including the turning point. */
function extent(r: KineticResult): [number, number] {
  const xs = kineticSeries(r, 60).map((p) => p.x);
  const lo = Math.min(0, ...xs), hi = Math.max(0, ...xs), pad = Math.max(1, (hi - lo) * 0.12);
  return [lo - pad, hi + pad];
}

const Scene: React.FC<{ r: KineticResult; t: number; alt: string }> = ({ r, t, alt }) => {
  const now = kineticAt(r, t);
  const [lo, hi] = extent(r);
  const x0 = 24, w = W - 48, ground = 120;
  const px = (m: number) => x0 + ((m - lo) / (hi - lo)) * w;
  const BW = 54, BH = 36, cx = px(now.x), top = ground - BH;
  const k = 70 / Math.max(1, Math.abs(r.setup.netForce));
  const kmax = Math.max(1, r.K0, r.K1, now.K);
  const vlen = Math.min(80, Math.abs(now.v) * 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="kinetic-svg">
      <line x1={x0} y1={ground} x2={x0 + w} y2={ground} stroke={PHYS.axis} strokeWidth={4} />
      <line x1={px(0)} y1={ground - 70} x2={px(0)} y2={ground + 6} stroke={PHYS.time} strokeDasharray="4 3" /><text x={px(0)} y={ground + 20} textAnchor="middle" fontSize={11} fill={PHYS.time}>start</text>
      {r.setup.displacement !== 0 && <g><line x1={px(r.setup.displacement)} y1={ground - 70} x2={px(r.setup.displacement)} y2={ground + 6} stroke={PHYS.displacement} strokeDasharray="4 3" /><text x={px(r.setup.displacement)} y={ground + 20} textAnchor="middle" fontSize={11} fill={PHYS.displacement}>end ({sg(r.setup.displacement)} m)</text></g>}
      <rect x={cx - BW / 2} y={top} width={BW} height={BH} rx={5} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
      <text x={cx} y={top + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0">{f2(r.setup.massKg)} kg</text>
      {Math.abs(r.setup.netForce) > 0 && (() => { const L = Math.max(16, Math.abs(r.setup.netForce) * k), d = Math.sign(r.setup.netForce); return <g data-arrow="net-force"><Arrow x1={cx} y1={top - 10} x2={cx + d * L} y2={top - 10} color={ENERGY.work} width={4} /><text x={cx + d * L} y={top - 16} textAnchor={d > 0 ? 'end' : 'start'} fontSize={11} fontWeight={800} fill={ENERGY.work}>F net {sg(r.setup.netForce)} N</text></g>; })()}
      {Math.abs(now.v) > 1e-9 && (() => { const d = Math.sign(now.v); return <g data-arrow="velocity"><Arrow x1={cx} y1={ground - BH / 2} x2={cx + d * Math.max(14, vlen)} y2={ground - BH / 2} color={PHYS.velocity} /><text x={cx + d * Math.max(14, vlen)} y={ground - BH / 2 + 15} textAnchor={d > 0 ? 'end' : 'start'} fontSize={10} fill={PHYS.velocity}>v {sg(now.v)} m/s</text></g>; })()}
      <text x={x0} y={150} fontSize={11} fontWeight={700} fill={ENERGY.kinetic}>kinetic energy K = {f2(now.K)} J</text>
      <rect x={x0} y={156} width={w} height={14} rx={3} fill="#0f172a" stroke="#334155" />
      <rect data-bar="kinetic" x={x0} y={156} width={Math.max(0, (now.K / kmax) * w)} height={14} rx={3} fill={ENERGY.kinetic} />
      <text x={x0 + w} y={184} textAnchor="end" fontSize={10} fill="#94A3B8">full bar = {f2(kmax)} J</text>
    </svg>
  );
};

export const KineticFigure: React.FC<{ r: KineticResult; t: number; showScene?: boolean }> = ({ r, t, showScene = true }) => {
  const now = kineticAt(r, t);
  const [lo, hi] = extent(r);
  const { massKg: m, netForce: F, displacement: s } = r.setup;
  const series = kineticSeries(r, 80);
  const fpad = Math.max(1, Math.abs(F) * 0.4);
  const fr: [number, number] = [Math.min(0, F) - (F < 0 ? fpad : 0) - (F === 0 ? 1 : 0), Math.max(0, F) + (F > 0 ? fpad : 0) + (F === 0 ? 1 : 0)];
  const kmax = Math.max(1, ...series.map((p) => p.K)) * 1.15;
  const sign = F * now.x > 1e-9 ? 'positive' : F * now.x < -1e-9 ? 'negative' : 'zero';
  return (
    <div className="space-y-3 min-w-0" data-testid="kinetic-figure">
      {showScene && <Scene r={r} t={t} alt={describeKinetic(r)} />}
      <div className="grid gap-3 md:grid-cols-2">
        <EnergyPlot id="force-position" title="Net force against position" xName="position x" xUnit="m" yName="net force F" yUnit="N" xr={[lo, hi]} yr={fr}
          lines={[{ id: 'f', name: 'net force F (constant)', color: ENERGY.work, pts: [[lo, F], [hi, F]] }]}
          shade={{ x0: 0, x1: now.x, y: F, color: F * now.x >= 0 ? PHYS.correct : PHYS.error }} cursor={now.x}
          points={[{ x: now.x, y: F, label: `work so far ${sg(now.workSoFar)} J`, color: ENERGY.work }]}
          caption={`The shaded area (height F = ${sg(F)} N, width x = ${sg(now.x)} m) is the net work so far: ${sg(now.workSoFar)} J (${sign}). At the end it is ${sg(r.wNet)} J${r.reversal ? ': the area uses the NET displacement, even though the cart turned round' : ''}.`}
          alt={`Net force against position: a horizontal line at ${sg(F)} N. The shaded area up to the present position ${sg(now.x)} m is the net work so far, ${sg(now.workSoFar)} J.`} />
        <EnergyPlot id="kinetic-time" title="Kinetic energy against time" xName="time t" xUnit="s" yName="kinetic energy K" yUnit="J" xr={[0, Math.max(r.tEnd, 0.1)]} yr={[0, kmax]}
          lines={[{ id: 'k', name: 'kinetic energy K = ½ m v²', color: ENERGY.kinetic, pts: series.map((p) => [p.t, p.K] as [number, number]) }]} cursor={now.t}
          points={[{ x: 0, y: r.K0, label: `start ${f2(r.K0)} J`, color: ENERGY.kinetic }, { x: now.t, y: now.K, label: `now ${f2(now.K)} J`, color: '#e2e8f0' }]}
          caption={`K never goes below 0 J. It changes from ${f2(r.K0)} J to ${f2(r.K1)} J, a change of ${sg(r.dK)} J, which equals the net work ${sg(r.wNet)} J. The mass ${f2(m)} kg and the speeds decide K = ½mv².`}
          alt={`Kinetic energy against time: from ${f2(r.K0)} J at the start to ${f2(r.K1)} J at ${f2(r.tEnd)} s; the present value is ${f2(now.K)} J. It is never negative.`} />
      </div>
      <p className="sr-only">Displacement s = {sg(s)} m</p>
    </div>
  );
};

export interface KineticViewProps { initial: KineticSetup; editable?: boolean; alt?: string }

export const KineticView: React.FC<KineticViewProps> = ({ initial, editable = false, alt }) => {
  const [setup, setSetup] = useState<KineticSetup>(initial);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const reduced = useReducedMotion();
  const r = computeKinetic(setup);
  const change = (patch: Partial<KineticSetup>) => { setSetup((s) => ({ ...s, ...patch })); setPlaying(false); setT(0); };

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

  const btn = 'min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100';
  const tt = Math.min(t, r.tEnd);
  const now = r.valid ? kineticAt(r, tt) : null;
  const cell = (k: string, label: string, v: string, color?: string) => <div key={k} data-readout={k} className="rounded-lg bg-surface-card px-2 py-1"><div className="text-[10px] text-slate-400">{label}</div><div className="font-mono text-sm font-bold" style={{ color: color ?? '#e2e8f0' }}>{v}</div></div>;

  return (
    <div className="space-y-3 min-w-0" data-visual="kineticLab" data-testid="kinetic-view">
      {r.valid && now ? <KineticFigure r={r} t={tt} /> : (
        <p role="alert" className="text-sm rounded-xl border px-3 py-3" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid="kinetic-error">This setup cannot run: {r.reason}</p>
      )}
      {r.valid && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Run the cart">
          <button type="button" onClick={() => { if (t >= r.tEnd) setT(0); setPlaying((p) => !p); }} disabled={r.tEnd === 0} className={`${btn} bg-surface-elevated`} data-testid="kinetic-play">{playing ? 'Pause' : t >= r.tEnd && r.tEnd > 0 ? 'Replay' : 'Play'}</button>
          <button type="button" onClick={() => { setPlaying(false); setT(0); }} className={`${btn} bg-surface-card`} data-testid="kinetic-reset">Back to start</button>
          <label className="flex items-center gap-2 text-xs text-slate-300 flex-1 min-w-[160px]">Time
            <input type="range" min={0} max={r.tEnd} step={Math.max(r.tEnd / 200, 0.001)} value={tt} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${f2(tt)} seconds of ${f2(r.tEnd)}`} className="flex-1 min-h-[44px]" data-testid="kinetic-time" />
            <span className="font-mono w-24">{f2(tt)} / {f2(r.tEnd)} s</span>
          </label>
        </div>
      )}
      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="kinetic-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the cart</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="mass" label="Mass" unit="kg" value={setup.massKg} step={1} onChange={(v) => change({ massKg: v })} />
            <Field id="force" label="Net force" unit="N" value={setup.netForce} step={2} onChange={(v) => change({ netForce: v })} />
            <Field id="u" label="Initial velocity" unit="m/s" value={setup.u} step={1} onChange={(v) => change({ u: v })} />
            <Field id="s" label="Displacement" unit="m" value={setup.displacement} step={1} onChange={(v) => change({ displacement: v })} />
          </div>
          <details className="rounded-lg border border-surface-border px-3 py-1" data-testid="kinetic-more">
            <summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (playback speed, limits)</summary>
            <div className="py-2 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300">Playback speed
                <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Playback speed" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.25}>0.25×</option><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
              </label>
              <p className="text-[11px] text-slate-400">Mass {KIN_LIMITS.massMin} to {KIN_LIMITS.massMax} kg; net force up to ±{KIN_LIMITS.forceMax} N; velocity up to ±{KIN_LIMITS.speedMax} m/s; displacement up to ±{KIN_LIMITS.dispMax} m. Right is positive. The simulated time follows the clock, not the frame rate.</p>
            </div>
          </details>
        </div>
      )}
      {r.valid && now && (
        <section aria-label="Energy bookkeeping" className="space-y-2" data-testid="kinetic-readout">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {cell('F', 'net force F', `${sg(setup.netForce)} N`, ENERGY.work)}
            {cell('s', 'displacement s', `${sg(setup.displacement)} m`, PHYS.displacement)}
            {cell('W', 'net work W = F × s', `${sg(r.wNet)} J`, ENERGY.work)}
            {cell('a', 'acceleration a = F ÷ m', `${sg(r.a)} m/s²`, PHYS.acceleration)}
            {cell('K0', 'initial K = ½mu²', `${f2(r.K0)} J`, ENERGY.kinetic)}
            {cell('K1', 'final K = ½mv²', `${f2(r.K1)} J`, ENERGY.kinetic)}
            {cell('dK', 'change in K', `${sg(r.dK)} J`, ENERGY.kinetic)}
            {cell('v', 'final velocity v', `${sg(r.v)} m/s`, PHYS.velocity)}
          </div>
          <p className="text-sm rounded-xl border px-3 py-2 font-mono text-slate-100" style={{ borderColor: `${Math.abs(r.wNet - r.dK) < 1e-6 ? PHYS.correct : PHYS.error}`, background: `${PHYS.correct}0D` }} data-testid="kinetic-theorem">
            {Math.abs(r.wNet - r.dK) < 1e-6 ? '✓ ' : '✗ '}W_net = {sg(r.wNet)} J &nbsp; and &nbsp; K<sub>final</sub> &minus; K<sub>initial</sub> = {f2(r.K1)} &minus; {f2(r.K0)} = {sg(r.dK)} J
          </p>
          <p className="text-xs text-slate-300" data-testid="kinetic-now">Now (t = {f2(tt)} s): x = {sg(now.x)} m, v = {sg(now.v)} m/s, K = {f2(now.K)} J, work so far {sg(now.workSoFar)} J.</p>
          {!alt && <p className="text-xs text-slate-300" data-testid="kinetic-description">{describeKinetic(r)}</p>}
          <p className="text-[11px] text-slate-400">Assumptions: a constant net force along a straight line; no other energy forms are tracked (friction would be part of the net force). Exact kinematics, so there is no numerical drift. A model result, not a proof.</p>
        </section>
      )}
    </div>
  );
};

export const KineticVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { setup: KineticSetup; editable?: boolean };
  return <KineticView initial={p.setup} editable={p.editable ?? false} alt={alt} />;
};
