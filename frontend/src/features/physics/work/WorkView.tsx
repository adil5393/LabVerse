/**
 * The Work Laboratory scene (PHY-3A): an object on a horizontal track or a vertical rail, the force arrows, the displacement
 * arrow with the start and end markers, the signed work of each force, the net work and a force-displacement graph.
 * Every number and every arrow comes from `computeWork` (a kinematic work model: the displacement is chosen, not solved).
 * Controls sit directly under the canvas; the less common settings are collapsed. Reduced motion jumps instead of animating.
 */

import React, { useEffect, useRef, useState } from 'react';
import { computeWork, fmt, fmtSigned, RELATION_TEXT, describeWork, SURFACES, TRACK_LENGTH, WORK_LIMITS, workAtProgress, type ForceKind, type WorkResult, type WorkSetup } from '../../../engine/physics/work/workModel';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { VisualProps } from '../../education/visuals';

const W = 440, H = 284;
const COLOR: Record<ForceKind, string> = { applied: PHYS.force, friction: PHYS.friction, weight: PHYS.vertical, normal: PHYS.vertical };
const TAG: Record<ForceKind, string> = { applied: 'F', friction: 'f', weight: 'W', normal: 'N' };
const DISPLACEMENT_COLOR = PHYS.displacement;
const DURATION_MS = 3000;

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; color: string; width?: number; dash?: string }> = ({ x1, y1, x2, y2, color, width = 3, dash }) => {
  const a = Math.atan2(y2 - y1, x2 - x1), s = 10;
  const p1 = `${x2 - s * Math.cos(a - 0.45)},${y2 - s * Math.sin(a - 0.45)}`, p2 = `${x2 - s * Math.cos(a + 0.45)},${y2 - s * Math.sin(a + 0.45)}`;
  return <g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeDasharray={dash} /><polygon points={`${x2},${y2} ${p1} ${p2}`} fill={color} /></g>;
};

const Scene: React.FC<{ r: WorkResult; progress: number; showVertical: boolean; alt: string }> = ({ r, progress, showVertical, alt }) => {
  const horizontal = r.setup.axis === 'horizontal';
  const pos = workAtProgress(r, progress).position;
  const biggest = Math.max(1, ...r.forces.map((f) => f.magnitude));
  const k = 80 / biggest; // pixels per newton: the largest force is 80 px long
  const len = (m: number) => Math.max(20, m * k);
  const x0 = 24, trackW = W - 48, ground = 178;
  const px = (m: number) => x0 + (m / TRACK_LENGTH) * trackW;
  const vBase = 224, vTop = 18, py = (m: number) => vBase - (m / TRACK_LENGTH) * (vBase - vTop);
  const BW = 60, BH = 48;
  const cx = horizontal ? px(pos) : 190, cy = horizontal ? ground - BH / 2 : py(pos) - BH / 2;
  const s = r.setup.displacement;
  const startX = horizontal ? px(r.setup.startPos) : 190, endX = horizontal ? px(r.endPos) : 190;
  const startY = horizontal ? ground : py(r.setup.startPos), endY = horizontal ? ground : py(r.endPos);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} className="w-full max-w-[600px] mx-auto block rounded-xl bg-surface-lowest border border-surface-border" data-testid="work-svg">
      {horizontal ? (
        <g>
          <line x1={x0} y1={ground} x2={x0 + trackW} y2={ground} stroke={PHYS.axis} strokeWidth={4} />
          {[0, 4, 8, 12].map((m) => <g key={m}><line x1={px(m)} y1={ground} x2={px(m)} y2={ground + 7} stroke={PHYS.axis} strokeWidth={2} /><text x={px(m)} y={ground + 21} textAnchor="middle" fontSize={12} fill="#94A3B8">{m} m</text></g>)}
        </g>
      ) : (
        <g>
          <line x1={110} y1={vBase} x2={110} y2={vTop} stroke={PHYS.axis} strokeWidth={4} />
          {[0, 4, 8, 12].map((m) => <g key={m}><line x1={104} y1={py(m)} x2={110} y2={py(m)} stroke={PHYS.axis} strokeWidth={2} /><text x={98} y={py(m) + 4} textAnchor="end" fontSize={12} fill="#94A3B8">{m} m</text></g>)}
        </g>
      )}
      {s !== 0 && (horizontal
        ? <g data-testid="start-end-markers"><line x1={startX} y1={ground - 112} x2={startX} y2={ground} stroke={PHYS.time} strokeDasharray="4 3" /><text x={startX} y={ground - 118} textAnchor={startX < endX ? 'end' : 'start'} fontSize={12} fill={PHYS.time}>start {fmt(r.setup.startPos)} m</text>
          <line x1={endX} y1={ground - 112} x2={endX} y2={ground} stroke={DISPLACEMENT_COLOR} strokeDasharray="4 3" /><text x={endX} y={ground - 118} textAnchor={startX < endX ? 'start' : 'end'} fontSize={12} fill={DISPLACEMENT_COLOR}>end {fmt(r.endPos)} m</text></g>
        : <g data-testid="start-end-markers"><line x1={110} y1={startY} x2={250} y2={startY} stroke={PHYS.time} strokeDasharray="4 3" /><text x={256} y={startY + 4} fontSize={12} fill={PHYS.time}>start {fmt(r.setup.startPos)} m</text>
          <line x1={110} y1={endY} x2={250} y2={endY} stroke={DISPLACEMENT_COLOR} strokeDasharray="4 3" /><text x={256} y={endY + 4} fontSize={12} fill={DISPLACEMENT_COLOR}>end {fmt(r.endPos)} m</text></g>)}
      {s !== 0 && (horizontal
        ? <g data-testid="displacement-arrow"><Arrow x1={startX} y1={ground + 44} x2={endX} y2={ground + 44} color={DISPLACEMENT_COLOR} /><text x={Math.min(W - 6, Math.max(6, (startX + endX) / 2))} y={ground + 66} textAnchor={(startX + endX) / 2 < 100 ? 'start' : (startX + endX) / 2 > W - 100 ? 'end' : 'middle'} fontSize={13} fontWeight={700} fill={DISPLACEMENT_COLOR}>displacement s = {fmtSigned(s)} m</text></g>
        : <g data-testid="displacement-arrow"><Arrow x1={400} y1={startY} x2={400} y2={endY} color={DISPLACEMENT_COLOR} /><text x={390} y={(startY + endY) / 2 + 4} textAnchor="end" fontSize={13} fontWeight={700} fill={DISPLACEMENT_COLOR}>s = {fmtSigned(s)} m</text></g>)}
      <rect x={cx - BW / 2} y={cy - BH / 2} width={BW} height={BH} rx={6} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
      <text x={cx - BW / 2 + 6} y={cy - BH / 2 + 15} textAnchor="start" fontSize={12} fontWeight={700} fill="#e2e8f0">{fmt(r.setup.massKg)} kg</text>
      {r.forces.filter((f) => f.magnitude > 0).map((f) => {
        if (!showVertical && (f.id === 'weight' || f.id === 'normal')) return null;
        const cap = f.id === 'weight' || f.id === 'normal' ? 44 : 1000;
        const L = Math.min(cap, len(f.magnitude));
        const ux = f.fx / f.magnitude, uy = -f.fy / f.magnitude; // screen y is down
        let ox = cx, oy = cy + 8;
        if (f.id === 'weight') { ox = cx - 14; oy = cy + BH / 2; }
        else if (f.id === 'normal') { ox = cx + 14; oy = cy - BH / 2; }
        else if (f.id === 'friction') { oy = cy + BH / 2 - 4; }
        const x2 = ox + ux * L, y2 = oy + uy * L;
        const tx = x2 + (ux > 0.3 ? 8 : ux < -0.3 ? -8 : uy === 0 ? 0 : 10);
        const ty = y2 + (uy > 0.3 ? 14 : uy < -0.3 ? -6 : 4);
        return (
          <g key={f.id} data-arrow={f.id} data-magnitude={f.magnitude} data-work={f.work}>
            <Arrow x1={ox} y1={oy} x2={x2} y2={y2} color={COLOR[f.id]} width={f.id === 'applied' ? 4 : 3} />
            <text x={Math.min(W - 8, Math.max(8, tx))} y={Math.max(14, Math.min(H - 6, ty))} textAnchor={ux > 0.3 ? 'start' : ux < -0.3 ? 'end' : 'start'} fontSize={14} fontWeight={800} fill={COLOR[f.id]}>{TAG[f.id]}</text>
          </g>
        );
      })}
    </svg>
  );
};

const FsGraph: React.FC<{ r: WorkResult }> = ({ r }) => {
  const s = r.setup.displacement, dist = Math.abs(s);
  const fs = dist === 0 ? 0 : r.applied.alongAxis * Math.sign(s); // force component along the displacement direction
  const gw = 260, gh = 130, l = 44, b = 100, top = 14, right = 244;
  const yMax = Math.max(10, Math.abs(fs) * 1.2), xMax = Math.max(1, dist * 1.1);
  const X = (m: number) => l + (m / xMax) * (right - l), Y = (n: number) => b - ((n + yMax) / (2 * yMax)) * (b - top);
  const work = fs * dist;
  return (
    <figure className="min-w-0 space-y-1" data-testid="fs-graph">
      <svg viewBox={`0 0 ${gw} ${gh + 28}`} role="img" aria-label={`Force-displacement graph of the applied force along the displacement: ${fmtSigned(fs)} N from 0 to ${fmt(dist)} m; the area under the line is the work, ${fmtSigned(work)} J.`} className="w-full rounded-lg bg-surface-lowest border border-surface-border">
        <line x1={l} y1={Y(0)} x2={right} y2={Y(0)} stroke={PHYS.axis} strokeWidth={2} />
        <line x1={l} y1={top} x2={l} y2={b} stroke={PHYS.axis} strokeWidth={2} />
        {dist > 0 && <rect x={X(0)} y={Math.min(Y(0), Y(fs))} width={X(dist) - X(0)} height={Math.abs(Y(fs) - Y(0))} fill={work >= 0 ? `${PHYS.correct}55` : `${PHYS.error}55`} stroke={work >= 0 ? PHYS.correct : PHYS.error} />}
        <line x1={X(0)} y1={Y(fs)} x2={X(dist)} y2={Y(fs)} stroke={PHYS.force} strokeWidth={3} />
        <text x={l - 4} y={Y(0) + 4} textAnchor="end" fontSize={10} fill="#94A3B8">0</text>
        <text x={l - 4} y={Y(fs) + 4} textAnchor="end" fontSize={10} fill={PHYS.force}>{fmt(fs)}</text>
        <text x={X(dist)} y={Y(0) + (fs >= 0 ? 12 : -4)} textAnchor="middle" fontSize={10} fill="#94A3B8">{fmt(dist)} m</text>
        <text x={(l + right) / 2} y={gh + 14} textAnchor="middle" fontSize={10} fill="#94A3B8">distance moved along the displacement (m)</text>
        <text x={6} y={top + 6} fontSize={10} fill="#94A3B8">F along s (N)</text>
      </svg>
      <figcaption className="text-[11px] text-slate-300" data-testid="fs-caption">Area under the line = the applied force&apos;s work = {fmtSigned(work)} J.</figcaption>
    </figure>
  );
};

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

const DIRS: { label: string; angle: number; aria: string }[] = [
  { label: '→ Right', angle: 0, aria: 'Force to the right' }, { label: '← Left', angle: 180, aria: 'Force to the left' },
  { label: '↑ Up', angle: 90, aria: 'Force upwards' }, { label: '↓ Down', angle: 270, aria: 'Force downwards' },
];

export interface WorkViewProps { initial: WorkSetup; editable?: boolean; graph?: boolean; startProgress?: number; alt?: string }

export const WorkView: React.FC<WorkViewProps> = ({ initial, editable = false, graph = false, startProgress = 0, alt }) => {
  const [setup, setSetup] = useState<WorkSetup>(initial);
  const [progress, setProgress] = useState(startProgress);
  const [playing, setPlaying] = useState(false);
  const [err, setErr] = useState('');
  const [showVertical, setShowVertical] = useState(true);
  const reduced = useReducedMotion();
  const r = computeWork(setup);

  const change = (patch: Partial<WorkSetup>) => {
    const next = { ...setup, ...patch };
    const result = computeWork(next);
    if (!result.valid) { setErr(result.reason ?? 'That setup is not valid.'); return; }
    setErr(''); setSetup(next); setPlaying(false);
  };

  const ref = useRef(progress);
  useEffect(() => { ref.current = progress; });
  useEffect(() => {
    if (!playing) return;
    if (reduced) { const id = window.setTimeout(() => { setProgress(1); setPlaying(false); }, 0); return () => window.clearTimeout(id); }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const next = tickClock(ref.current * DURATION_MS, now - last, 1, DURATION_MS) / DURATION_MS;
      last = now; setProgress(next);
      if (next >= 1) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const horizontal = setup.axis === 'horizontal';
  const here = workAtProgress(r, progress);
  const minDisp = -setup.startPos, maxDisp = TRACK_LENGTH - setup.startPos;
  const description = describeWork(r);
  const pressed = DIRS.find((d) => d.angle === ((setup.angleDeg % 360) + 360) % 360);
  const btn = 'min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100';
  const s = setup.displacement;

  return (
    <div className="space-y-3 min-w-0" data-visual="workLab" data-testid="work-view">
      <Scene r={r} progress={progress} showVertical={showVertical} alt={description} />
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Key to the arrows" data-testid="work-legend">
        {r.forces.filter((f) => f.magnitude > 0 && (showVertical || (f.id !== 'weight' && f.id !== 'normal'))).map((f) => <li key={f.id} style={{ color: COLOR[f.id] }} className="font-bold">{TAG[f.id]} = {f.label.toLowerCase()} {fmt(f.magnitude)} N {f.fy === 0 ? (f.fx > 0 ? '→' : '←') : f.fx === 0 ? (f.fy > 0 ? '↑' : '↓') : '↗'}</li>)}
        <li style={{ color: DISPLACEMENT_COLOR }} className="font-bold">dashed lines = start and end positions</li>
      </ul>
      <p className="text-xs text-slate-300" data-testid="work-position">Position now: {fmt(here.position)} m &middot; work done by the applied force so far: {fmtSigned(here.byForce.applied)} J</p>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Move the object">
        <button type="button" onClick={() => { if (progress >= 1) setProgress(0); setPlaying((p) => !p); }} className={`${btn} bg-surface-elevated`} data-testid="work-play" disabled={!r.valid || s === 0}>{playing ? 'Pause' : progress >= 1 ? 'Replay' : 'Play'}</button>
        <button type="button" onClick={() => { setPlaying(false); setProgress(0); }} className={`${btn} bg-surface-card`} data-testid="work-reset">Back to start</button>
        <label className="flex items-center gap-2 text-xs text-slate-300 flex-1 min-w-[160px]">Position along the displacement
          <input type="range" min={0} max={1} step={0.01} value={progress} onChange={(e) => { setPlaying(false); setProgress(Number(e.target.value)); }} aria-label="How far through the displacement" aria-valuetext={`${Math.round(progress * 100)} percent of the displacement`} className="flex-1 min-h-[44px]" data-testid="work-progress" />
        </label>
      </div>

      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="work-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set up the experiment</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="force" label="Force" unit="N" value={setup.forceN} step={5} onChange={(v) => change({ forceN: v })} />
            <div role="group" aria-label="Direction of the force" className="flex flex-wrap gap-1">
              {DIRS.map((d) => <button key={d.angle} type="button" aria-pressed={pressed?.angle === d.angle} aria-label={d.aria} data-dir={d.angle} onClick={() => change({ angleDeg: d.angle })} className={btn} style={{ borderColor: pressed?.angle === d.angle ? PHYS.force : '#334155' }}>{pressed?.angle === d.angle ? '✓ ' : ''}{d.label}</button>)}
            </div>
            {!pressed && <span className="text-xs text-slate-400" data-testid="custom-angle">custom angle {fmt(setup.angleDeg)}&deg;</span>}
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Field id="displacement" label="Displacement" unit="m" value={setup.displacement} step={0.5} onChange={(v) => change({ displacement: v })} />
            <span className="text-xs text-slate-400">({horizontal ? 'right' : 'up'} is positive; from {fmt(minDisp)} to {fmt(maxDisp)} m)</span>
          </div>
          <details className="rounded-lg border border-surface-border px-3 py-1" data-testid="work-more">
            <summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings (start position, mass, surface, rail, angle)</summary>
            <div className="space-y-2 py-2">
              <div className="flex flex-wrap gap-3 items-center">
                <Field id="start" label="Start position" unit="m" value={setup.startPos} step={1} onChange={(v) => change({ startPos: v })} />
                <Field id="mass" label="Mass" unit="kg" value={setup.massKg} step={1} onChange={(v) => change({ massKg: v })} />
                <label className="flex items-center gap-2 text-xs text-slate-300">Direction of motion
                  <select value={setup.axis} onChange={(e) => change({ axis: e.target.value as WorkSetup['axis'], displacement: Math.min(setup.displacement, TRACK_LENGTH - setup.startPos) })} aria-label="Direction of motion" data-testid="axis-select" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
                    <option value="horizontal">Horizontal track</option><option value="vertical">Vertical rail (lifting)</option>
                  </select>
                </label>
                {horizontal && (
                  <label className="flex items-center gap-2 text-xs text-slate-300">Surface
                    <select value={setup.surfaceId} onChange={(e) => change({ surfaceId: e.target.value as WorkSetup['surfaceId'] })} aria-label="Surface under the object" data-testid="surface-select" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
                      {SURFACES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                    </select>
                  </label>
                )}
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Field id="angle" label="Force angle (enrichment)" unit="degrees" value={setup.angleDeg} step={15} onChange={(v) => change({ angleDeg: ((v % 360) + 360) % 360 })} />
                <span className="text-xs text-slate-400">0&deg; right, 90&deg; up, 180&deg; left, 270&deg; down. At other angles only the component along the displacement does work (W = F s cos &theta;, beyond the textbook).</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-300 min-h-[44px]"><input type="checkbox" checked={showVertical} onChange={(e) => setShowVertical(e.target.checked)} className="w-5 h-5" data-testid="show-vertical" /> Show weight and the normal force</label>
              <p className="text-[11px] text-slate-400">Force 0 to {WORK_LIMITS.forceMax} N, mass {WORK_LIMITS.massMin} to {WORK_LIMITS.massMax} kg, track {TRACK_LENGTH} m. g = 10 m/s&sup2;.</p>
            </div>
          </details>
          {err && <p role="alert" className="text-xs rounded-lg px-3 py-2 border" style={{ color: '#fecdd3', borderColor: `${PHYS.error}80`, background: `${PHYS.error}14` }} data-testid="work-error">{err}</p>}
        </div>
      )}

      <section aria-label="Work done by each force" className="space-y-2" data-testid="work-readout">
        <p className="text-sm rounded-xl border px-3 py-2 text-slate-100 font-mono" style={{ borderColor: `${PHYS.force}66`, background: `${PHYS.force}0D` }} data-testid="work-formula">
          <strong style={{ color: PHYS.force }}>Applied force: </strong>W = F &times; s = ({fmtSigned(r.applied.alongAxis)} N) &times; ({fmtSigned(s)} m) = <strong>{fmtSigned(r.appliedWork)} J</strong>
        </p>
        <div className="overflow-x-auto rounded-xl border border-surface-border" role="region" aria-label="Work table" tabIndex={0}>
          <table className="w-full text-xs">
            <caption className="sr-only">Each force on the object, how it is related to the displacement and the work it does, with the net work.</caption>
            <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Force (exerted by)</th><th scope="col" className="p-2 text-left">Size and direction</th><th scope="col" className="p-2 text-left">Compared with the displacement</th><th scope="col" className="p-2 text-left">Work</th></tr></thead>
            <tbody>
              {r.forces.map((f) => (
                <tr key={f.id} className="border-t border-surface-border align-top" data-force-row={f.id}>
                  <td className="p-2 font-bold" style={{ color: COLOR[f.id] }}>{f.label} <span className="font-normal text-slate-400">({f.by})</span></td>
                  <td className="p-2 text-slate-200">{fmt(f.magnitude)} N {f.magnitude === 0 ? '' : f.fy === 0 ? (f.fx > 0 ? 'right' : 'left') : f.fx === 0 ? (f.fy > 0 ? 'up' : 'down') : 'at an angle'}</td>
                  <td className="p-2 text-slate-300">{RELATION_TEXT[f.relation]}</td>
                  <td className="p-2 font-mono font-bold" data-work={f.work} style={{ color: f.work > 0 ? PHYS.correct : f.work < 0 ? PHYS.error : '#CBD5E1' }}>{fmtSigned(f.work)} J <span className="font-sans font-normal">{f.work > 0 ? '(positive)' : f.work < 0 ? '(negative)' : '(zero)'}</span></td>
                </tr>
              ))}
              <tr className="border-t-2 border-surface-border" data-force-row="net">
                <th scope="row" className="p-2 text-left text-white">Net work (all forces added)</th><td className="p-2 text-slate-400" colSpan={2}>{r.forces.map((f) => fmt(f.work)).join(' + ')}</td>
                <td className="p-2 font-mono font-bold text-white" data-testid="net-work" data-work={r.netWork}>{fmtSigned(r.netWork)} J</td>
              </tr>
            </tbody>
          </table>
        </div>
        {!alt && <p className="text-xs text-slate-300" data-testid="work-description">{description}</p>}
        <p className="text-[11px] text-slate-400">This is a <strong>kinematic work model</strong>: you choose the displacement, the model does not solve Newton&apos;s second law. It reports the work each constant force does over that displacement.</p>
        {graph && <FsGraph r={r} />}
      </section>
    </div>
  );
};

export const WorkVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { setup: WorkSetup; editable?: boolean; progress?: number; graph?: boolean };
  return <WorkView initial={p.setup} editable={p.editable ?? false} graph={p.graph ?? false} startProgress={p.progress ?? 0} alt={alt} />;
};
