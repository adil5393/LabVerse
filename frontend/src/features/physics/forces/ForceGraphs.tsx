/**
 * Synchronised graphs for the Force Laboratory (PHY-2C): force–acceleration (linear), acceleration–mass (inverse),
 * momentum–time and force–time with the impulse shaded. All four read the SAME simulated history and the same current
 * sample as the cart, the force diagram and the readouts (engine/physics/forces/forceModel.ts and secondLaw.ts): the
 * highlighted point on every graph is the cart's present state, so the graphs cannot disagree with it.
 */

import React, { useMemo } from 'react';
import { accelerationMassCurve, forceAccelerationLine, impulseBetween, momentumChangeBetween, momentumHistory } from '../../../engine/physics/forces/secondLaw';
import { DT, sampleAtTime, type Setup } from '../../../engine/physics/forces/forceModel';
import { PHYS } from '../motion/physicsColors';

const GW = 300, GH = 190, ML = 46, MR = 12, MT = 14, MB = 34;
const r2 = (n: number): string => { const r = Math.round(n * 100) / 100; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${r2(Math.abs(n))}`);
const niceStep = (span: number): number => { for (const s of [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500]) if (span / s <= 5) return s; return 1000; };
const ticks = (lo: number, hi: number): number[] => { const st = niceStep(hi - lo), out: number[] = []; for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000); return out; };

export interface Mark { x: number; y: number; label: string }
export interface PlotProps {
  id: string; title: string; xName: string; xUnit: string; yName: string; yUnit: string; color: string;
  pts: [number, number][]; xr: [number, number]; yr: [number, number];
  marks?: Mark[]; shadeTo?: number; cursor?: number; caption: string; alt: string;
}

export const PlotView: React.FC<PlotProps> = ({ id, title, xName, xUnit, yName, yUnit, color, pts, xr, yr, marks = [], shadeTo, cursor, caption, alt }) => {
  const X = (x: number) => ML + ((x - xr[0]) / (xr[1] - xr[0])) * (GW - ML - MR);
  const Y = (y: number) => MT + (1 - (y - yr[0]) / (yr[1] - yr[0])) * (GH - MT - MB);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ');
  let shade = '';
  if (shadeTo !== undefined) {
    const s = pts.filter(([x]) => x <= shadeTo);
    if (s.length > 1) shade = `M${X(s[0][0])},${Y(0)} ` + s.map(([x, y]) => `L${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(' ') + ` L${X(s[s.length - 1][0])},${Y(0)} Z`;
  }
  return (
    <figure className="space-y-1 min-w-0" data-graph={id}>
      <figcaption className="text-xs font-mono uppercase tracking-wider" style={{ color }}>{title}</figcaption>
      <svg viewBox={`0 0 ${GW} ${GH}`} role="img" aria-label={alt} className="w-full rounded-xl bg-surface-lowest border border-surface-border">
        {ticks(xr[0], xr[1]).map((v) => <g key={`x${v}`}><line x1={X(v)} y1={MT} x2={X(v)} y2={GH - MB} stroke="#334155" strokeWidth={0.6} /><text x={X(v)} y={GH - MB + 12} textAnchor="middle" fontSize={9} fill="#94a3b8">{v}</text></g>)}
        {ticks(yr[0], yr[1]).map((v) => <g key={`y${v}`}><line x1={ML} y1={Y(v)} x2={GW - MR} y2={Y(v)} stroke={v === 0 ? '#94a3b8' : '#334155'} strokeWidth={v === 0 ? 1.2 : 0.6} /><text x={ML - 4} y={Y(v) + 3} textAnchor="end" fontSize={9} fill="#94a3b8">{v}</text></g>)}
        {xr[0] < 0 && <line x1={X(0)} y1={MT} x2={X(0)} y2={GH - MB} stroke="#94a3b8" strokeWidth={1.2} />}
        <text x={(ML + GW - MR) / 2} y={GH - 4} textAnchor="middle" fontSize={10} fill={PHYS.time}>{xName} ({xUnit})</text>
        <text transform={`translate(10 ${(MT + GH - MB) / 2}) rotate(-90)`} textAnchor="middle" fontSize={10} fill={color}>{yName} ({yUnit})</text>
        {shade && <path d={shade} fill={PHYS.netForce} opacity={0.25} stroke={PHYS.netForce} strokeWidth={0.5} />}
        <path d={line} fill="none" stroke={color} strokeWidth={2.5} />
        {cursor !== undefined && <line x1={X(cursor)} y1={MT} x2={X(cursor)} y2={GH - MB} stroke={PHYS.time} strokeDasharray="4 3" />}
        {marks.map((m, i) => <g key={i}><circle cx={X(m.x)} cy={Y(m.y)} r={i === 0 ? 5.5 : 4} fill={i === 0 ? color : 'none'} stroke={i === 0 ? '#0f172a' : color} strokeWidth={2} /><text x={Math.min(GW - 60, X(m.x) + 7)} y={Y(m.y) - 7} fontSize={9} fontWeight={700} fill={color}>{m.label}</text></g>)}
      </svg>
      <p className="text-[11px] text-slate-300">{caption}</p>
    </figure>
  );
};

export const ForceGraphs: React.FC<{ setup: Setup; tMax: number; t: number }> = ({ setup, tMax, t }) => {
  const hist = useMemo(() => momentumHistory(setup, tMax), [setup, tMax]);
  const cur = sampleAtTime(setup, t, tMax);
  const m = setup.massKg;
  const net = cur.net;
  const fMax = Math.max(10, Math.ceil(Math.abs(net) * 1.5 / 5) * 5);
  const aAbs = Math.max(1, Math.abs(net) * 1.2 / m, Math.abs(2 * net) / m);
  const line = forceAccelerationLine(m, -fMax, fMax).map((q) => [q.f, q.a] as [number, number]);
  const mMax = Math.max(10, Math.ceil(2 * m / 5) * 5 + 5);
  const curve = accelerationMassCurve(net, 0.5, mMax).map((q) => [q.m, q.a] as [number, number]);
  const aTop = Math.max(1, Math.abs(cur.a) * 2.5);
  const pPts = hist.filter((_, i) => i % 5 === 0).map((h) => [h.t, h.p] as [number, number]);
  const fPts = hist.map((h) => [h.t, h.net] as [number, number]);
  const pLo = Math.min(0, ...pPts.map((q) => q[1])), pHi = Math.max(0, ...pPts.map((q) => q[1]));
  const fLo = Math.min(0, ...fPts.map((q) => q[1])), fHi = Math.max(0, ...fPts.map((q) => q[1]));
  const pad = (lo: number, hi: number): [number, number] => { const s = Math.max(1, hi - lo) * 0.12; return [lo - (lo < 0 ? s : 0), hi + s]; };
  const dp = momentumChangeBetween(setup, 0, t, tMax), imp = impulseBetween(setup, 0, t, tMax);
  const same = Math.abs(dp - imp) < Math.max(0.02, Math.abs(dp) * 0.002) + Math.abs(net) * DT;
  return (
    <section aria-label="Graphs of the cart" className="space-y-3 rounded-xl border border-surface-border bg-surface-card/50 p-3" data-testid="force-graphs">
      <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Graphs drawn from the same model (the highlighted point is the cart now, t = {r2(t)} s)</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <PlotView id="fa" title="Force–acceleration (mass fixed: a line)" xName="net force F" xUnit="N" yName="acceleration a" yUnit="m/s²" color={PHYS.acceleration}
          pts={line} xr={[-fMax, fMax]} yr={[-aAbs, aAbs]} marks={[{ x: net, y: cur.a, label: `(${sg(net)} N, ${sg(cur.a)})` }, ...(Math.abs(2 * net) <= fMax ? [{ x: 2 * net, y: 2 * cur.a, label: 'double F' }] : [])]}
          caption={`Linear: a = F ÷ m with m = ${r2(m)} kg, a straight line through the origin of slope 1 ÷ m = ${r2(1 / m)} (m/s²)/N. Doubling F doubles a.`}
          alt={`Graph of acceleration against net force for a ${r2(m)} kg cart: a straight line through the origin. The cart now has net force ${sg(net)} N and acceleration ${sg(cur.a)} m/s².`} />
        <PlotView id="am" title="Acceleration–mass (force fixed: a curve)" xName="mass m" xUnit="kg" yName="acceleration a" yUnit="m/s²" color={PHYS.acceleration}
          pts={curve} xr={[0, mMax]} yr={Math.abs(net) < 1e-9 ? [-1, 1] : net > 0 ? [0, aTop] : [-aTop, 0]}
          marks={[{ x: m, y: cur.a, label: `(${r2(m)} kg, ${sg(cur.a)})` }, ...(2 * m <= mMax ? [{ x: 2 * m, y: cur.a / 2, label: 'double m' }] : [])]}
          caption={Math.abs(net) < 1e-9 ? 'The net force is zero, so a = 0 for every mass: the curve lies on the axis.' : `Inverse: a = F ÷ m with F = ${sg(net)} N, a curve, not a straight line. Doubling m halves a.`}
          alt={`Graph of acceleration against mass for a constant net force of ${sg(net)} newtons: a curve that falls as the mass increases. The cart has mass ${r2(m)} kilograms and acceleration ${sg(cur.a)} metres per second squared.`} />
        <PlotView id="pt" title="Momentum–time" xName="time t" xUnit="s" yName="momentum p = mv" yUnit="kg m/s" color={PHYS.velocity}
          pts={pPts} xr={[0, tMax]} yr={pad(pLo, pHi)} cursor={t} marks={[{ x: t, y: m * cur.v, label: `${sg(m * cur.v)}` }]}
          caption={`The slope of this graph is the net force: ${sg(net)} kg m/s per s = ${sg(net)} N now.`}
          alt={`Graph of momentum against time. At ${r2(t)} s the momentum is ${sg(m * cur.v)} kg m/s and the slope, the net force, is ${sg(net)} N.`} />
        <PlotView id="ft" title="Force–time (area = impulse)" xName="time t" xUnit="s" yName="net force F" yUnit="N" color={PHYS.netForce}
          pts={fPts} xr={[0, tMax]} yr={pad(fLo, fHi)} cursor={t} shadeTo={t} marks={[{ x: t, y: net, label: `${sg(net)} N` }]}
          caption={`The shaded area up to now is the impulse: ${sg(imp)} N s. It equals the change in momentum: ${sg(dp)} kg m/s.`}
          alt={`Graph of net force against time. The area under it up to ${r2(t)} s is the impulse ${sg(imp)} newton seconds, equal to the change of momentum ${sg(dp)} kilogram metres per second.`} />
      </div>
      <p className="text-xs rounded-lg border p-2" style={{ borderColor: `${PHYS.correct}66`, color: '#e2e8f0' }} data-testid="impulse-check">
        <strong style={{ color: PHYS.correct }}>{same ? '✓ ' : '✗ '}Impulse = change of momentum: </strong>area under F–t = {sg(imp)} N s; Δp = m (v − u) = {sg(dp)} kg m/s (1 N s = 1 kg m/s). The momentum changes only while a net force acts; zero net force means the momentum stays constant, not that it is zero.
      </p>
    </section>
  );
};

/** Acceleration against mass and force against mass for a constant force (NCERT Q10): the model's a = F ÷ m at chosen masses. */
export const MassSweepGraphs: React.FC<{ force: number; masses: number[] }> = ({ force, masses }) => {
  const mMax = Math.max(...masses) + 1;
  const curve = accelerationMassCurve(force, 0.5, mMax).map((q) => [q.m, q.a] as [number, number]);
  const pts = masses.map((m) => ({ m, a: force / m }));
  return (
    <div className="grid gap-3 md:grid-cols-2" data-testid="mass-sweep">
      <PlotView id="sweep-am" title="Acceleration–mass (a curve)" xName="mass m" xUnit="kg" yName="acceleration a" yUnit="m/s²" color={PHYS.acceleration} pts={curve} xr={[0, mMax]} yr={[0, force / 0.5 * 0.6]}
        marks={pts.map((q) => ({ x: q.m, y: q.a, label: `${r2(q.m)} kg, ${r2(q.a)}` }))} caption={`a = F ÷ m with F = ${r2(force)} N: doubling m halves a (inverse).`} alt={`Acceleration against mass for a constant ${r2(force)} newton force: ${pts.map((q) => `${r2(q.m)} kg gives ${r2(q.a)} m/s²`).join('; ')}.`} />
      <PlotView id="sweep-fm" title="Force–mass (a horizontal line)" xName="mass m" xUnit="kg" yName="force F = m a" yUnit="N" color={PHYS.netForce} pts={[[0, force], [mMax, force]]} xr={[0, mMax]} yr={[0, force * 1.5]}
        marks={pts.map((q) => ({ x: q.m, y: q.m * q.a, label: `${r2(q.m * q.a)} N` }))} caption="F = m a is the same at every point: the same force acts on every mass." alt={`Force against mass: a horizontal line at ${r2(force)} newtons.`} />
    </div>
  );
};
