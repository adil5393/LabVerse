/**
 * Motion Graph Studio (PHY-1C): a track, the position–time graph, the velocity–time graph and the
 * acceleration–time graph, all drawn from ONE constant-acceleration profile and ONE time cursor.
 * Everything can be done with clicks, keys and buttons: nothing needs dragging.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { EQUATION_PRESETS } from '../../../engine/physics/motion/equations';
import {
  areaVT, averageAcceleration, classify, describeProfile, fmt, fmtSign, LIMITS, scenarioById, SCENARIOS, series, stateAt, totalTime, turningTimes, validateProfile,
  type GraphKind, type MotionState, type Profile,
} from '../../../engine/physics/motion/profile';
import { EquationPanel } from './EquationPanel';
import { PHYS } from './physicsColors';
import { useReducedMotion } from './useReducedMotion';



const GW = 560, GH = 210, ML = 54, MR = 14, MT = 14, MB = 36;
const niceStep = (span: number): number => { for (const s of [0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200]) if (span / s <= 6) return s; return 500; };
const ticksFor = (lo: number, hi: number): number[] => {
  const st = niceStep(hi - lo), out: number[] = [];
  for (let v = Math.ceil(lo / st - 1e-9) * st; v <= hi + 1e-9; v += st) out.push(Math.round(v * 1000) / 1000);
  return out;
};

interface GraphSpec {
  kind: GraphKind; title: string; yName: string; yUnit: string; color: string;
  y: (s: MotionState) => number; slopeName: string; slopeUnit: string; heightMeans: string;
}

const SPECS: Record<GraphKind, GraphSpec> = {
  xt: { kind: 'xt', title: 'Position–time graph', yName: 'position x', yUnit: 'm', color: PHYS.position, y: (s) => s.x, slopeName: 'velocity', slopeUnit: 'm/s', heightMeans: 'position' },
  vt: { kind: 'vt', title: 'Velocity–time graph', yName: 'velocity v', yUnit: 'm/s', color: PHYS.velocity, y: (s) => s.v, slopeName: 'acceleration', slopeUnit: 'm/s²', heightMeans: 'velocity' },
  at: { kind: 'at', title: 'Acceleration–time graph', yName: 'acceleration a', yUnit: 'm/s²', color: PHYS.acceleration, y: (s) => s.a, slopeName: '', slopeUnit: '', heightMeans: 'acceleration' },
};

const Graph: React.FC<{ spec: GraphSpec; profile: Profile; t: number; onSeek: (t: number) => void }> = ({ spec, profile, t, onSeek }) => {
  const T = totalTime(profile);
  const pts = useMemo(() => series(profile, 160), [profile]);
  const ys = pts.map(spec.y);
  let lo = Math.min(0, ...ys), hi = Math.max(0, ...ys);
  if (hi - lo < 1e-9) { hi = lo + 1; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const X = (tt: number) => ML + (tt / T) * (GW - ML - MR);
  const Y = (yy: number) => MT + (1 - (yy - lo) / (hi - lo)) * (GH - MT - MB);
  const cur = stateAt(profile, t);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)},${Y(spec.y(p)).toFixed(1)}`).join(' ');
  const tT = ticksFor(0, T), yT = ticksFor(lo, hi);
  const ref = useRef<SVGSVGElement>(null);
  const seek = (e: React.PointerEvent | React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * GW;
    onSeek(Math.min(T, Math.max(0, ((x - ML) / (GW - ML - MR)) * T)));
  };
  const onKey = (e: React.KeyboardEvent) => {
    const big = e.shiftKey ? 1 : 0.1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onSeek(Math.min(T, t + big)); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onSeek(Math.max(0, t - big)); }
    else if (e.key === 'Home') { e.preventDefault(); onSeek(0); }
    else if (e.key === 'End') { e.preventDefault(); onSeek(T); }
  };
  // area under v–t from 0 to t: positive above the axis (solid), negative below (hatched)
  const area: React.ReactNode[] = [];
  if (spec.kind === 'vt') {
    const upto = pts.filter((p) => p.t < t).concat(cur);
    const mk = (sign: 1 | -1) => {
      let d = '';
      for (let i = 0; i < upto.length; i++) {
        const v = upto[i].v, vc = sign === 1 ? Math.max(0, v) : Math.min(0, v);
        d += `${i ? 'L' : `M${X(upto[0].t).toFixed(1)},${Y(0).toFixed(1)} L`}${X(upto[i].t).toFixed(1)},${Y(vc).toFixed(1)} `;
      }
      return d + `L${X(upto[upto.length - 1].t).toFixed(1)},${Y(0).toFixed(1)} Z`;
    };
    area.push(<path key="pos" d={mk(1)} fill={PHYS.displacement} opacity={0.4} />);
    area.push(<path key="neg" d={mk(-1)} fill={`url(#hatch-${spec.kind})`} stroke={PHYS.displacement} strokeWidth={0.5} />);
  }
  const slope = spec.kind === 'xt' ? cur.v : spec.kind === 'vt' ? cur.a : 0;
  const dx = Math.min(1.2, T / 6);
  const tangent = spec.kind !== 'at' ? (
    <line x1={X(t - dx)} y1={Y(spec.y(cur) - slope * dx)} x2={X(t + dx)} y2={Y(spec.y(cur) + slope * dx)} stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="4 3" />
  ) : null;
  const turns = turningTimes(profile);
  const label = `${spec.title}. Horizontal axis: time in seconds, from 0 to ${fmt(T)}. Vertical axis: ${spec.yName} in ${spec.yUnit}. At ${fmt(t)} s the ${spec.heightMeans} is ${fmtSign(spec.y(cur))} ${spec.yUnit}. Use the arrow keys to move the time cursor.`;
  return (
    <figure className="space-y-1 min-w-0" data-graph={spec.kind}>
      <figcaption className="text-xs font-mono uppercase tracking-wider flex flex-wrap items-center gap-2" style={{ color: spec.color }}>
        <span aria-hidden>{spec.kind === 'xt' ? '●' : spec.kind === 'vt' ? '➤' : '⇢'}</span>{spec.title}
        <span className="normal-case text-slate-400 basis-full">height = {spec.heightMeans}{spec.slopeName ? `, slope = ${spec.slopeName}` : ''}{spec.kind === 'vt' ? ', area = displacement' : ''}</span>
      </figcaption>
      <svg ref={ref} viewBox={`0 0 ${GW} ${GH}`} tabIndex={0} role="slider" aria-label={label} aria-valuemin={0} aria-valuemax={T} aria-valuenow={Number(t.toFixed(2))} aria-valuetext={`${fmt(t)} seconds: ${spec.yName} ${fmtSign(spec.y(cur))} ${spec.yUnit}`}
        className="w-full rounded-xl bg-surface-lowest border border-surface-border select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-crosshair"
        onPointerDown={seek} onKeyDown={onKey}>
        <defs><pattern id={`hatch-${spec.kind}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill={PHYS.displacement} opacity={0.12} /><line x1="0" y1="0" x2="0" y2="6" stroke={PHYS.displacement} strokeWidth="2" opacity={0.6} /></pattern></defs>
        {tT.map((v) => <g key={`t${v}`}><line x1={X(v)} y1={MT} x2={X(v)} y2={GH - MB} stroke="#334155" strokeWidth={0.6} /><text x={X(v)} y={GH - MB + 14} textAnchor="middle" fontSize={10} fill="#94a3b8">{v}</text></g>)}
        {yT.map((v) => <g key={`y${v}`}><line x1={ML} y1={Y(v)} x2={GW - MR} y2={Y(v)} stroke={v === 0 ? '#94a3b8' : '#334155'} strokeWidth={v === 0 ? 1.2 : 0.6} /><text x={ML - 6} y={Y(v) + 3} textAnchor="end" fontSize={10} fill="#94a3b8">{v}</text></g>)}
        <text x={(ML + GW - MR) / 2} y={GH - 4} textAnchor="middle" fontSize={11} fill={PHYS.time}>time t (s)</text>
        <text transform={`translate(12 ${(MT + GH - MB) / 2}) rotate(-90)`} textAnchor="middle" fontSize={11} fill={spec.color}>{spec.yName} ({spec.yUnit})</text>
        {area}
        <path d={line} fill="none" stroke={spec.color} strokeWidth={2.5} />
        {tangent}
        {turns.map((tt) => <g key={`turn${tt}`}><circle cx={X(tt)} cy={Y(spec.y(stateAt(profile, tt)))} r={4} fill="none" stroke="#e2e8f0" strokeWidth={1.5} /></g>)}
        <line x1={X(t)} y1={MT} x2={X(t)} y2={GH - MB} stroke={PHYS.time} strokeWidth={1.5} strokeDasharray="5 3" />
        <circle cx={X(t)} cy={Y(spec.y(cur))} r={5.5} fill={spec.color} stroke="#0f172a" strokeWidth={2} />
        <text x={Math.min(GW - 70, X(t) + 8)} y={Math.max(MT + 10, Y(spec.y(cur)) - 8)} fontSize={11} fontWeight={700} fill={spec.color}>({fmt(t)} s, {fmtSign(spec.y(cur))})</text>
      </svg>
    </figure>
  );
};

const TrackStrip: React.FC<{ profile: Profile; t: number }> = ({ profile, t }) => {
  const pts = useMemo(() => series(profile, 100).map((p) => p.x), [profile]);
  let lo = Math.min(0, ...pts), hi = Math.max(0, ...pts);
  const pad = Math.max(2, (hi - lo) * 0.08); lo -= pad; hi += pad;
  const W = 560, H = 96, P = 28;
  const X = (v: number) => P + ((v - lo) / (hi - lo)) * (W - 2 * P);
  const s = stateAt(profile, t);
  const tk = ticksFor(lo, hi);
  const arrowLen = Math.min(70, Math.abs(s.v) * 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Track from ${fmt(lo)} m to ${fmt(hi)} m with the reference point O at 0 m. At ${fmt(t)} s the object is at ${fmtSign(s.x)} m moving with velocity ${fmtSign(s.v)} m/s.`} className="w-full rounded-xl bg-surface-lowest border border-surface-border">
      <line x1={P} y1={56} x2={W - P} y2={56} stroke={PHYS.axis} strokeWidth={3} />
      {tk.map((v) => <g key={v}><line x1={X(v)} y1={50} x2={X(v)} y2={62} stroke={v === 0 ? PHYS.origin : PHYS.axis} strokeWidth={v === 0 ? 2.5 : 1} /><text x={X(v)} y={78} textAnchor="middle" fontSize={10} fill={v === 0 ? PHYS.origin : '#94a3b8'}>{v === 0 ? 'O' : v}</text></g>)}
      <text x={W - P} y={92} textAnchor="end" fontSize={10} fill="#94a3b8">position (m)</text>
      <path d={`M${X(profile.x0)},40 L${X(profile.x0) - 5},32 L${X(profile.x0) + 5},32 Z`} fill={PHYS.position} /><text x={X(profile.x0)} y={28} textAnchor="middle" fontSize={10} fill={PHYS.position}>start</text>
      {arrowLen > 3 && <g stroke={PHYS.velocity} fill={PHYS.velocity}><line x1={X(s.x)} y1={34} x2={X(s.x) + Math.sign(s.v) * arrowLen} y2={34} strokeWidth={3} /><path d={`M${X(s.x) + Math.sign(s.v) * (arrowLen + 6)},34 l${-Math.sign(s.v) * 8},-5 l0,10 Z`} /></g>}
      <circle cx={X(s.x)} cy={56} r={10} fill={PHYS.position} stroke="#0f172a" strokeWidth={2} />
    </svg>
  );
};

const Stat: React.FC<{ label: string; value: string; color: string; symbol: string; id: string; note?: string }> = ({ label, value, color, symbol, id, note }) => (
  <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
    <dt className="text-[11px] flex items-center gap-1.5 text-slate-300"><span aria-hidden style={{ color }}>{symbol}</span>{label}</dt>
    <dd data-readout={id} className="font-mono text-lg font-bold leading-tight" style={{ color }}>{value}</dd>
    {note && <div className="text-[10px] text-slate-400">{note}</div>}
  </div>
);

const NumField: React.FC<{ label: string; unit: string; value: number; step: number; onChange: (v: number) => void; id: string }> = ({ label, unit, value, step, onChange, id }) => {
  const [text, setText] = useState(String(value));
  const [last, setLast] = useState(value);
  if (last !== value) { setLast(value); setText(String(value)); }
  return (
    <div className="flex items-center gap-1 text-xs text-slate-300">
      <label className="flex items-center gap-1">{label}
        <input value={text} data-field={id} inputMode="decimal" aria-label={`${label} in ${unit}`} onChange={(e) => { setText(e.target.value); const n = Number(e.target.value.replace('−', '-')); if (e.target.value.trim() !== '' && Number.isFinite(n)) onChange(n); }}
          className="w-20 min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white font-mono" />
      </label><span>{unit}</span>
      <button type="button" aria-label={`Decrease ${label} by ${step}`} onClick={() => onChange(Math.round((value - step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">−</button>
      <button type="button" aria-label={`Increase ${label} by ${step}`} onClick={() => onChange(Math.round((value + step) * 100) / 100)} className="min-h-[44px] min-w-[44px] rounded-lg border border-surface-border bg-surface-card text-white">+</button>
    </div>
  );
};

export interface PresetLike { id: string; title: string; profile: Profile }
export interface GraphStudioProps { scenarioId?: string; profile?: Profile; editable?: boolean; graphs?: GraphKind[]; withPrediction?: boolean; alt?: string; presets?: PresetLike[]; equations?: boolean }

export const GraphStudioView: React.FC<GraphStudioProps> = ({ scenarioId, profile: given, editable = false, graphs = ['xt', 'vt', 'at'], withPrediction = false, alt, presets, equations = false }) => {
  const sc = scenarioById(scenarioId);
  const base = given ?? sc?.profile ?? SCENARIOS[1].profile;
  const [profile, setProfile] = useState<Profile>(base);
  const [prevBase, setPrevBase] = useState(base);
  if (prevBase !== base) { setPrevBase(base); setProfile(base); }
  const T = totalTime(profile);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const reduced = useReducedMotion();
  const tClamped = Math.min(t, T);
  const s = stateAt(profile, tClamped);
  const area = areaVT(profile, 0, tClamped);
  const aAvg = averageAcceleration(profile, 0, tClamped);
  const seg = profile.segments[0];
  const single = profile.segments.length === 1;
  const list: PresetLike[] | null = presets ?? (sc ? SCENARIOS : null);

  const stateRef = useRef({ t, T, rate });
  useEffect(() => { stateRef.current = { t, T, rate }; });
  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      const id = window.setInterval(() => { const { t: t0, T: tot } = stateRef.current; const next = Math.min(tot, Math.floor(t0) + 1); setT(next); if (next >= tot) setPlaying(false); }, 800);
      return () => window.clearInterval(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const { t: t0, T: tot, rate: r } = stateRef.current;
      const next = tickClock(t0 * 1000, now - last, r, tot * 1000) / 1000;
      last = now; setT(next);
      if (next >= tot) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const edit = (patch: Partial<{ x0: number; v0: number; a: number; d: number }>) => {
    const next: Profile = { x0: patch.x0 ?? profile.x0, v0: patch.v0 ?? profile.v0, segments: [{ durationS: patch.d ?? seg.durationS, a: patch.a ?? seg.a }] };
    const why = validateProfile(next);
    if (why) { setErr(why); return; }
    setErr(''); setProfile(next); setPlaying(false);
  };
  const where = `x–t graph point (${fmt(s.t)} s, ${fmtSign(s.x)} m): its height is the position and its slope is the velocity, ${fmtSign(s.v)} m/s. v–t graph point (${fmt(s.t)} s, ${fmtSign(s.v)} m/s): its height is the velocity and its slope is the acceleration, ${fmtSign(s.a)} m/s².`;
  const kind = classify(profile);

  const [choice, setChoice] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const pred = withPrediction && sc && !given ? sc.predict : null;

  return (
    <div className="space-y-3" data-visual="motionGraphs" data-testid="graph-studio">
      <p className="sr-only">{alt ?? describeProfile(profile, 'Motion Graph Studio.')}</p>
      {pred && (
        <fieldset className="rounded-xl p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }} data-testid="graph-prediction">
          <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>★ Prediction (before you play it)</legend>
          <p className="text-sm text-slate-100">{pred.prompt}</p>
          <div role="radiogroup" aria-label="Your prediction" className="flex flex-wrap gap-2">
            {pred.options.map((o, i) => <button key={o} type="button" role="radio" aria-checked={choice === i} onClick={() => { setChoice(i); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-sm text-left" style={{ borderColor: choice === i ? PHYS.prediction : '#334155', color: '#e2e8f0' }}>{choice === i ? '● ' : '○ '}{o}</button>)}
          </div>
          <button type="button" disabled={choice === null} onClick={() => setChecked(true)} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40" style={{ background: PHYS.prediction }}>Check my prediction</button>
          {checked && choice !== null && (
            <p role="status" aria-live="polite" data-testid="graph-prediction-feedback" className="text-xs rounded-lg p-2" style={{ border: `1px solid ${choice === pred.correct ? PHYS.correct : PHYS.error}`, color: '#e2e8f0' }}>
              <strong style={{ color: choice === pred.correct ? PHYS.correct : PHYS.error }}>{choice === pred.correct ? '✓ Observation: matches the model. ' : '✗ Observation: differs from the model. '}</strong>{pred.explain} Now play it and compare with the graphs.
            </p>
          )}
        </fieldset>
      )}

      {editable && (
        <div className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="graph-controls">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">Set the motion (each graph is drawn from these four numbers)</h3>
          {list && <div role="group" aria-label="Choose a scenario" className="flex flex-wrap gap-2">
            {list.map((x) => <button key={x.id} type="button" data-scenario={x.id} aria-pressed={x.profile === profile} onClick={() => { setProfile(x.profile); setT(0); setPlaying(false); setErr(''); setChoice(null); setChecked(false); }} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold" style={{ borderColor: profile === x.profile ? PHYS.velocity : '#334155', color: '#e2e8f0' }}>{profile === x.profile ? '✓ ' : ''}{x.title}</button>)}
          </div>}
          {single ? <div className="flex flex-wrap gap-3">
            <NumField id="x0" label="Start position" unit="m" value={profile.x0} step={5} onChange={(v) => edit({ x0: v })} />
            <NumField id="v0" label="Start velocity" unit="m/s" value={profile.v0} step={1} onChange={(v) => edit({ v0: v })} />
            <NumField id="a" label="Acceleration" unit="m/s²" value={seg.a} step={0.5} onChange={(v) => edit({ a: v })} />
            <NumField id="d" label="Duration" unit="s" value={seg.durationS} step={1} onChange={(v) => edit({ d: v })} />
          </div> : <p className="text-xs text-slate-300">This motion has two stages with different accelerations, so it is set by choosing the scenario. Pick another scenario to edit the four numbers.</p>}
          <p className="text-[11px] text-slate-400">Allowed: start velocity within ±{LIMITS.maxV} m/s, acceleration within ±{LIMITS.maxA} m/s², duration up to {LIMITS.maxT} s. Only a constant acceleration is offered, because then the graphs follow exactly from v = u + at and x = x₀ + ut + ½at².</p>
          {err && <p role="alert" className="text-xs font-bold" style={{ color: PHYS.error }} data-testid="graph-error"><span aria-hidden>✗ </span>{err}</p>}
        </div>
      )}

      <TrackStrip profile={profile} t={tClamped} />

      <div className="grid gap-3 md:grid-cols-2">
        {graphs.map((k) => <Graph key={k} spec={SPECS[k]} profile={profile} t={tClamped} onSeek={(v) => { setPlaying(false); setT(v); }} />)}
      </div>

      <div role="group" aria-label="Time controls" className="flex flex-wrap items-center gap-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-testid="graph-time">
        <span className="text-[11px] font-mono w-full" style={{ color: PHYS.time }}>⏱ Simulated time: click a graph, press its arrow keys, use the slider or the buttons</span>
        <button type="button" onClick={() => { if (tClamped >= T) setT(0); setPlaying((p) => !p); }} aria-pressed={playing} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950" style={{ background: PHYS.time }}>{playing ? 'Pause' : tClamped >= T ? 'Replay' : 'Play'}</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tClamped) - 1)); }} aria-label="Step back 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step −1 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(Math.min(T, Math.floor(tClamped) + 1)); }} aria-label="Step forward 1 second of simulated time" className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Step +1 s</button>
        <button type="button" onClick={() => { setPlaying(false); setT(0); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-slate-200 text-sm">Back to 0 s</button>
        <label className="flex items-center gap-2 text-xs text-slate-300">Replay speed
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Replay speed on screen. This does not change the motion." className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white"><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option></select>
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-300 grow min-w-[160px]">Time
          <input type="range" min={0} max={T} step={0.1} value={tClamped} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)); }} aria-label="Simulated time" aria-valuetext={`${fmt(tClamped)} seconds`} className="w-full min-h-[44px]" />
        </label>
        <p className="basis-full text-[11px] text-slate-400">Replay speed only changes how fast the picture plays. The values at a given simulated time never change.{reduced ? ' Reduced motion is on: Play steps one second at a time.' : ''}</p>
      </div>

      {equations && <EquationPanel profile={profile} t={tClamped} />}

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2" data-testid="graph-readout">
        <Stat id="t" label="Simulated time" value={`${fmt(s.t)} s`} color={PHYS.time} symbol="⏱" />
        <Stat id="x" label="Position" value={`${fmtSign(s.x)} m`} color={PHYS.position} symbol="●" note="height of the x–t graph" />
        <Stat id="v" label="Velocity" value={`${fmtSign(s.v)} m/s`} color={PHYS.velocity} symbol="➤" note="slope of x–t · height of v–t" />
        <Stat id="a" label="Acceleration" value={`${fmtSign(s.a)} m/s²`} color={PHYS.acceleration} symbol="⇢" note="slope of v–t" />
        <Stat id="avg-a" label="Average acceleration (0 to now)" value={aAvg === null ? '—' : `${fmtSign(aAvg)} m/s²`} color={PHYS.acceleration} symbol="⇢" note="(v − u) ÷ t" />
        <Stat id="displacement" label="Displacement (signed area)" value={`${fmtSign(area.signed)} m`} color={PHYS.displacement} symbol="→" note="area under v–t, above minus below" />
        <Stat id="distance" label="Distance (area of |v|)" value={`${fmt(area.absolute)} m`} color={PHYS.distance} symbol="↔" note="all area counted positive" />
        <Stat id="kind" label="This motion" value={kind} color="#e2e8f0" symbol="◆" />
      </dl>

      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3 space-y-1" data-testid="graph-live">
        <p>At t = {fmt(s.t)} s the object is at {fmtSign(s.x)} m, moving with velocity {fmtSign(s.v)} m/s ({s.v === 0 ? 'momentarily at rest' : s.v > 0 ? 'to the right' : 'to the left'}); its acceleration is {fmtSign(s.a)} m/s².{s.v !== 0 && s.a !== 0 ? ` The velocity and the acceleration point ${s.v * s.a > 0 ? 'the same way, so the speed is increasing' : 'opposite ways, so the speed is decreasing'}.` : ''}</p>
        <p className="text-xs text-slate-300" data-testid="graph-point-text">{where}</p>
        {turningTimes(profile).length > 0 && <p className="text-xs text-slate-300">The velocity is zero at {fmt(turningTimes(profile)[0])} s: the object turns back there. The signed area gives the displacement, but the distance travelled needs the area of |v|.</p>}
      </div>

      <details className="rounded-xl border border-surface-border bg-surface-card/50 p-3">
        <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-200 font-medium">Table of values (text alternative to the graphs)</summary>
        <div className="overflow-x-auto"><table className="w-full text-xs mt-2">
          <caption className="sr-only">Position, velocity and acceleration at whole seconds of simulated time</caption>
          <thead><tr className="text-slate-300"><th scope="col" className="p-1 text-left">t (s)</th><th scope="col" className="p-1 text-left">x (m)</th><th scope="col" className="p-1 text-left">v (m/s)</th><th scope="col" className="p-1 text-left">a (m/s²)</th></tr></thead>
          <tbody>{Array.from({ length: Math.floor(T) + 1 }, (_, i) => stateAt(profile, i)).concat(T % 1 ? [stateAt(profile, T)] : []).map((r) => <tr key={r.t} className="border-t border-surface-border font-mono"><td className="p-1">{fmt(r.t)}</td><td className="p-1" style={{ color: PHYS.position }}>{fmtSign(r.x)}</td><td className="p-1" style={{ color: PHYS.velocity }}>{fmtSign(r.v)}</td><td className="p-1" style={{ color: PHYS.acceleration }}>{fmtSign(r.a)}</td></tr>)}</tbody>
        </table></div>
      </details>
    </div>
  );
};

export interface GraphVisualProps { scenario?: string; profile?: Profile; editable?: boolean; graphs?: GraphKind[]; predict?: boolean; equations?: boolean; equationPresets?: boolean }

export const MotionGraphsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as GraphVisualProps;
  return <GraphStudioView scenarioId={p.scenario} profile={p.profile} editable={Boolean(p.editable)} graphs={p.graphs} withPrediction={Boolean(p.predict)} alt={alt} equations={Boolean(p.equations)} presets={p.equationPresets ? EQUATION_PRESETS : undefined} />;
};
