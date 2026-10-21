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
  DEFAULT_SETUP, DT, explain, LIMITS, sampleAtTime, simulate, SURFACES, surfaceById, validateSetup, type Dir, type Setup,
} from '../../../engine/physics/forces/forceModel';
import { ForceFigure } from './ForceFigure';
import { ForceGraphs } from './ForceGraphs';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import { useViewportProfile } from '../shared/viewportProfiles';
import type { ArrowsVisualProps, CartVisualProps } from '../../../engine/physics/forces/learn/questions';
import { toArrows } from '../../../engine/physics/forces/learn/questions';
import { describeDiagram, netArrow } from '../../../engine/physics/forces/forceDiagram';
import {
  ParameterControl,
  DirectionSelector,
  ExperimentSetupGroup,
  NetForceSummary,
  ModelAssumptions,
  SimulationPlaybackControls,
} from '../shared/controls';

export const r2 = (n: number, p = 2): string => { const r = Math.round(n * 10 ** p) / 10 ** p; return `${r < 0 ? '−' : ''}${Math.abs(r)}`; };
export const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${r2(Math.abs(n))}`);

export const Stat: React.FC<{ id: string; label: string; value: string; color: string; symbol: string; note?: string }> = ({ id, label, value, color, symbol, note }) => (
  <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 min-w-0" style={{ borderLeft: `4px solid ${color}` }}>
    <dt className="text-[11px] flex items-center gap-1.5 text-slate-300"><span aria-hidden style={{ color }}>{symbol}</span>{label}</dt>
    <dd data-readout={id} className="font-mono text-lg font-bold leading-tight" style={{ color }}>{value}</dd>
    {note && <div className="text-[10px] text-slate-400">{note}</div>}
  </div>
);

export const Field: React.FC<{
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  showSlider?: boolean;
  symbol?: string;
  symbolColor?: string;
  onChange: (v: number) => void;
}> = ({ id, label, unit, value, step, min, max, showSlider, symbol, symbolColor, onChange }) => (
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
    symbolColor={symbolColor}
    onChange={onChange}
  />
);

export const DirToggle: React.FC<{ label: string; value: Dir; onChange: (d: Dir) => void }> = ({ label, value, onChange }) => (
  <DirectionSelector label={label} value={value} onChange={onChange} accentColor={PHYS.force} />
);

const TRACK_W = 620, TRACK_H = 110;

/**
 * Continuous camera-following track visualization:
 * - Cart initially moves naturally across the track towards the 50% viewport anchor.
 * - Once reaching the anchor, the camera follows continuously: screenX = (worldX - cameraX) * scale + viewportAnchor.
 * - The ruler ticks and world move smoothly beneath the cart with zero threshold jumping or teleportation.
 */
export const Track: React.FC<{ setup: Setup; tMax: number; t: number; fixedSpan?: number; compact?: boolean }> = ({ setup, tMax, t, fixedSpan, compact = false }) => {
  const all = useMemo(() => simulate(setup, tMax), [setup, tMax]);

  const cameraXs = useMemo(() => {
    if (!fixedSpan) return null;
    const n = all.length;
    if (n === 0) return null;
    const out = new Float64Array(n);
    const x0 = all[0].x;

    // Detect initial motion direction
    let initDir = Math.sign(all[0].v);
    if (initDir === 0) {
      for (let k = 1; k < Math.min(n, 30); k++) {
        const dx = all[k].x - x0;
        if (Math.abs(dx) > 1e-4) {
          initDir = Math.sign(dx);
          break;
        }
      }
    }
    if (initDir === 0) initDir = 1;

    // Initial camera position gives cart ~15% margin on start side so it moves towards the 50% anchor
    let cam = initDir > 0 ? x0 + fixedSpan * 0.35 : x0 - fixedSpan * 0.35;
    out[0] = cam;

    for (let i = 1; i < n; i++) {
      const x = all[i].x;
      if (initDir > 0) {
        if (x > cam) {
          cam = x;
        } else if (x < cam - fixedSpan * 0.35) {
          cam = x + fixedSpan * 0.35;
        }
      } else {
        if (x < cam) {
          cam = x;
        } else if (x > cam + fixedSpan * 0.35) {
          cam = x - fixedSpan * 0.35;
        }
      }
      out[i] = cam;
    }
    return out;
  }, [all, fixedSpan]);

  const currentIdx = Math.min(all.length - 1, Math.max(0, Math.round(t / DT)));
  const cameraX = cameraXs ? cameraXs[currentIdx] : null;

  let lo = Math.min(...all.map((p) => p.x), 0), hi = Math.max(...all.map((p) => p.x), 0);
  if (fixedSpan && cameraX !== null) {
    lo = cameraX - fixedSpan / 2;
    hi = cameraX + fixedSpan / 2;
  } else {
    if (hi - lo < 4) { lo -= 2; hi += 2; }
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  }
  const svgRef = useRef<SVGSVGElement | null>(null);
  const profile = useViewportProfile(svgRef);
  const isMobile = profile.isMobile || compact;

  const X = (x: number) => 30 + ((x - lo) / (hi - lo)) * (TRACK_W - 60);
  const step = [1, 2, 5, 10, 20, 50, 100, 200].find((s) => (hi - lo) / s <= 8) ?? 500;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  const p = sampleAtTime(setup, t, tMax);
  const surface = surfaceById(setup.surfaceId);

  const cW = isMobile ? 44 : 34;
  const cH = isMobile ? 28 : 26;
  const cTop = isMobile ? 38 : 40;
  const wR = isMobile ? 5 : 4;

  return (
    <svg ref={svgRef} viewBox={isMobile ? '20 12 580 95' : `0 0 ${TRACK_W} ${TRACK_H}`} role="img" aria-label={`Track from ${r2(lo)} m to ${r2(hi)} m. At ${r2(t)} s the cart is at ${sg(p.x)} m moving at ${sg(p.v)} m/s.`} className="w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="force-track">
      <line x1={20} y1={70} x2={TRACK_W - 20} y2={70} stroke={surface.muK === 0 ? '#38bdf8' : PHYS.axis} strokeWidth={4} strokeDasharray={surface.muK === 0 ? '2 6' : '0'} />
      {ticks.filter((v) => X(v) >= 20 && X(v) <= TRACK_W - 20).map((v) => <g key={v}><line x1={X(v)} y1={66} x2={X(v)} y2={76} stroke="#94a3b8" /><text x={X(v)} y={92} textAnchor="middle" fontSize={isMobile ? 11 : 10} fill={v === 0 ? PHYS.origin : '#94a3b8'}>{v}</text></g>)}
      <text x={TRACK_W - 24} y={106} textAnchor="end" fontSize={isMobile ? 11 : 10} fill="#94a3b8">position (m) · surface: {surface.label}</text>
      <rect x={X(p.x) - cW / 2} y={cTop} width={cW} height={cH} rx={4} fill={PHYS.position} stroke="#0f172a" strokeWidth={2} />
      <circle cx={X(p.x) - cW / 3.5} cy={70} r={wR} fill="#0f172a" /><circle cx={X(p.x) + cW / 3.5} cy={70} r={wR} fill="#0f172a" />
      <text x={X(p.x)} y={isMobile ? 28 : 32} textAnchor="middle" fontSize={isMobile ? 12 : 11} fontWeight={700} fill={PHYS.position}>{sg(p.x)} m</text>
    </svg>
  );
};

export const VStrip: React.FC<{ setup: Setup; tMax: number; t: number }> = ({ setup, tMax, t }) => {
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

export interface ForceCartProps { initial?: Setup; editable?: boolean; showNet?: boolean; startTime?: number; alt?: string; resetToken?: number; graphs?: boolean }

/** All state and actions of one force cart. The lab slots and the lesson composite read the same instance. */
export const useForceCart = ({ initial = DEFAULT_SETUP, showNet = true, startTime = 0, resetToken, alt }: Pick<ForceCartProps, 'initial' | 'showNet' | 'startTime' | 'resetToken' | 'alt'>) => {
  const [setup, setSetup] = useState<Setup>(initial);
  const [prevInit, setPrevInit] = useState(initial);
  const [prevTok, setPrevTok] = useState(resetToken);
  const [tMax, setTMax] = useState(20);
  const [t, setT] = useState(startTime);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const [showIndividual, setShowIndividual] = useState(true);
  const [showNetForce, setShowNetForce] = useState(showNet);
  const reduced = useReducedMotion();
  const simTimeRef = useRef(startTime);
  if (prevInit !== initial || prevTok !== resetToken) { setPrevInit(initial); setPrevTok(resetToken); setSetup(initial); setErr(''); simTimeRef.current = startTime; setT(startTime); setPlaying(false); }
  const tt = Math.min(t, tMax);
  const p = sampleAtTime(setup, tt, tMax);
  const d = diagramOf(p);

  const change = (patch: Partial<Setup>) => {
    const next = { ...setup, ...patch };
    const why = validateSetup(next);
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

  return {
    setup, tMax, tt, p, d, playing, rate, err, showIndividual, showNetForce, reduced, live: explain(setup, p), figureAlt: alt ?? `${d.text}`,
    change, setRate, setShowIndividual, setShowNetForce,
    setRunLength: (v: number) => { setTMax(v); simTimeRef.current = 0; setT(0); setPlaying(false); },
    togglePlay: () => { if (tt >= tMax) { simTimeRef.current = 0; setT(0); } setPlaying((x) => !x); },
    stepBack: () => { setPlaying(false); const next = Math.max(0, Math.ceil(simTimeRef.current) - 1); simTimeRef.current = next; setT(next); },
    stepForward: () => { setPlaying(false); const next = Math.min(tMax, Math.floor(simTimeRef.current) + 1); simTimeRef.current = next; setT(next); },
    resetTime: () => { setPlaying(false); simTimeRef.current = 0; setT(0); },
    scrub: (v: number) => { setPlaying(false); simTimeRef.current = v; setT(v); },
  };
};
export type ForceCartModel = ReturnType<typeof useForceCart>;


/** Editable setup: mass, starting velocity, surface, both pushes, how long they last. `stacked` is the Inspector layout. */
export const ForceSetupFields: React.FC<{ m: ForceCartModel; stacked?: boolean }> = ({ m, stacked }) => {
  const { setup, change } = m;
  return (
    <div className="space-y-3" data-testid="force-controls">
      <div className={`grid gap-3.5 ${stacked ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
        {/* 1. Cart Physical Properties & Surface */}
        <ExperimentSetupGroup
          title="Cart Setup"
          icon="directions_car"
          columns={1}
        >
          <div className="space-y-2.5">
            <Field
              id="mass"
              label="Cart mass"
              unit="kg"
              symbol="m"
              value={setup.massKg}
              step={0.5}
              min={LIMITS.minMass}
              max={LIMITS.maxMass}
              onChange={(v) => change({ massKg: v })}
            />
            <Field
              id="velocity"
              label="Starting velocity"
              unit="m/s"
              symbol="v₀"
              value={setup.startVelocity}
              step={1}
              min={-LIMITS.maxVelocity}
              max={LIMITS.maxVelocity}
              onChange={(v) => change({ startVelocity: v })}
            />
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="surface-select" className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-amber-400 select-none" aria-hidden>
                    texture
                  </span>
                  <span>Surface condition</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {surfaceById(setup.surfaceId).note}
                </span>
              </div>
              <select
                id="surface-select"
                value={setup.surfaceId}
                onChange={(e) => change({ surfaceId: e.target.value })}
                aria-label="Surface under the cart"
                data-testid="surface-select"
                className="w-full min-h-[44px] rounded-xl border border-surface-border bg-surface-lowest px-3 text-white text-xs font-medium focus:border-sky-500 focus:outline-none cursor-pointer"
              >
                {SURFACES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ExperimentSetupGroup>

        {/* 2. Applied Forces */}
        <ExperimentSetupGroup
          title="Applied Forces"
          icon="pan_tool"
          columns={1}
        >
          <div className="space-y-3">
            {/* Push A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5" style={{ color: PHYS.force }}>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded font-bold bg-surface-container border border-surface-border">A</span>
                  <span>Push A</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {setup.forceA} N {setup.dirA === 'left' ? '← Left' : 'Right →'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <Field
                  id="forceA"
                  label="Magnitude A"
                  unit="N"
                  value={setup.forceA}
                  step={1}
                  min={0}
                  max={LIMITS.maxForce}
                  onChange={(v) => change({ forceA: v })}
                />
                <DirToggle label="A" value={setup.dirA} onChange={(dir) => change({ dirA: dir })} />
              </div>
            </div>

            {/* Push B */}
            <div className="space-y-1.5 pt-2 border-t border-surface-border/50">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5" style={{ color: PHYS.force }}>
                  <span className="font-mono text-[11px] px-1.5 py-0.5 rounded font-bold bg-surface-container border border-surface-border">B</span>
                  <span>Push B</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {setup.forceB} N {setup.dirB === 'left' ? '← Left' : 'Right →'}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <Field
                  id="forceB"
                  label="Magnitude B"
                  unit="N"
                  value={setup.forceB}
                  step={1}
                  min={0}
                  max={LIMITS.maxForce}
                  onChange={(v) => change({ forceB: v })}
                />
                <DirToggle label="B" value={setup.dirB} onChange={(dir) => change({ dirB: dir })} />
              </div>
            </div>

            {/* Push duration */}
            <div className="pt-2 border-t border-surface-border/50">
              <Field
                id="pulse"
                label="Pushes duration (0 = continuous)"
                unit="s"
                symbol="t_push"
                value={setup.pulseS ?? 0}
                step={1}
                min={0}
                max={30}
                onChange={(v) => change({ pulseS: v <= 0 ? undefined : Math.round(v / DT) * DT })}
              />
            </div>
          </div>
        </ExperimentSetupGroup>
      </div>

      {/* 3. Live Force Summary & Laws of Motion */}
      <NetForceSummary setup={setup} sample={m.p} compact />

      {/* 4. Model Assumptions */}
      <ModelAssumptions
        summary="This experiment uses an idealized cart on a frictionless/dry track model."
        assumptions={[
          'Horizontal track: Weight is exactly balanced by the normal force (W = N = mg, with g = 10 m/s²).',
          'Direction convention: Right is the positive displacement and velocity direction (+x).',
          'No air resistance or aerodynamic drag is modelled.',
          `Friction model: ${surfaceById(setup.surfaceId).note}`,
        ]}
        limits={{
          massRange: [LIMITS.minMass, LIMITS.maxMass],
          forceRange: [0, LIMITS.maxForce],
          velocityRange: [-LIMITS.maxVelocity, LIMITS.maxVelocity],
          timeRange: [0, 30],
        }}
      />

      {m.err && (
        <p role="alert" className="text-xs font-bold p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 text-red-400" data-testid="force-error">
          <span aria-hidden>{'✗ '}</span>{m.err}
        </p>
      )}
    </div>
  );
};

export const ForceToggles: React.FC<{ m: ForceCartModel; compact?: boolean }> = ({ m, compact }) => {
  const h = compact ? 'min-h-[32px]' : 'min-h-[44px]';
  return (
    <div role="group" aria-label="Show forces" className="flex flex-wrap gap-2">
      <button type="button" aria-pressed={m.showIndividual} data-toggle="individual" onClick={() => m.setShowIndividual((x) => !x)} className={`${h} px-3 rounded-lg border-2 text-xs font-bold text-slate-100 transition-colors`} style={{ borderColor: m.showIndividual ? PHYS.force : '#334155' }}>{m.showIndividual ? '✓ ' : ''}Show the individual forces</button>
      <button type="button" aria-pressed={m.showNetForce} data-toggle="net" onClick={() => m.setShowNetForce((x) => !x)} className={`${h} px-3 rounded-lg border-2 text-xs font-bold text-slate-100 transition-colors`} style={{ borderColor: m.showNetForce ? PHYS.netForce : '#334155' }}>{m.showNetForce ? '✓ ' : ''}Show the net force</button>
    </div>
  );
};

/** Play, step, reset, replay speed, run length and the time slider. `compact` is the single-row viewport toolbar. */
export const ForceTimeControls: React.FC<{
  m: ForceCartModel;
  compact?: boolean;
  setupToggle?: {
    open: boolean;
    onToggle: () => void;
    panelId: string;
    label?: string;
    testId?: string;
  };
}> = ({ m, compact, setupToggle }) => {
  const { tt, tMax, playing, rate, reduced } = m;
  return (
    <SimulationPlaybackControls
      time={tt}
      maxTime={tMax}
      playing={playing}
      rate={rate}
      reducedMotion={reduced}
      onTogglePlay={m.togglePlay}
      onStepBack={m.stepBack}
      onStepForward={m.stepForward}
      onReset={m.resetTime}
      onScrub={m.scrub}
      onRateChange={m.setRate}
      onMaxTimeChange={m.setRunLength}
      compact={compact}
      testId="force-time"
      playTestId="force-play"
      resetTestId="force-reset"
      setupToggle={setupToggle}
    />
  );
};

export const ForceReadout: React.FC<{ m: ForceCartModel; className?: string }> = ({ m, className }) => {
  const { p, setup } = m;
  return (
    <dl className={className ?? 'grid grid-cols-2 lg:grid-cols-4 gap-2'} data-testid="force-readout">
      <Stat id="t" label="Simulated time" value={`${r2(p.t)} s`} color={PHYS.time} symbol={'⏱'} />
      <Stat id="mass" label="Mass" value={`${r2(setup.massKg)} kg`} color="#e2e8f0" symbol={'■'} />
      <Stat id="net" label="Net force" value={`${sg(p.net)} N`} color={PHYS.netForce} symbol={'→'} note="all horizontal forces added" />
      <Stat id="a" label="Acceleration" value={`${sg(p.a)} m/s²`} color={PHYS.acceleration} symbol={'⇢'} note="net force ÷ mass" />
      <Stat id="v" label="Velocity" value={`${sg(p.v)} m/s`} color={PHYS.velocity} symbol={'➤'} />
      <Stat id="x" label="Position" value={`${sg(p.x)} m`} color={PHYS.position} symbol={'●'} />
      <Stat id="friction" label="Friction" value={`${sg(p.friction)} N`} color={PHYS.friction} symbol={'↔'} note={p.frictionKind === 'static' ? 'static: matches the push' : p.frictionKind === 'kinetic' ? 'kinetic: sliding' : 'none'} />
      <Stat id="push" label="Pushes A + B" value={`${sg(p.forceA + p.forceB)} N`} color={PHYS.force} symbol={'⇒'} />
    </dl>
  );
};

/** Momentum p = m v at the current time (a plain product of values the model already gives). */
export const ForceMomentum: React.FC<{ m: ForceCartModel }> = ({ m }) => (
  <dl className="grid grid-cols-2 gap-2 max-w-sm" data-testid="force-momentum">
    <Stat id="momentum" label="Momentum" value={`${sg(m.setup.massKg * m.p.v)} kg·m/s`} color={PHYS.velocity} symbol={'p'} note="mass × velocity" />
    <Stat id="impulse-rate" label="Net force" value={`${sg(m.p.net)} N`} color={PHYS.netForce} symbol={'F'} note="rate of change of momentum" />
  </dl>
);

export const ForceLive: React.FC<{ m: ForceCartModel }> = ({ m }) => (
  <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="force-live">{m.live}</div>
);

export const ForceDataTable: React.FC<{ m: ForceCartModel }> = ({ m }) => (
  <div className="overflow-x-auto"><table className="w-full text-xs">
    <caption className="sr-only">Position, velocity and net force of the cart at whole seconds</caption>
    <thead><tr className="text-slate-300"><th scope="col" className="p-1 text-left">t (s)</th><th scope="col" className="p-1 text-left">x (m)</th><th scope="col" className="p-1 text-left">v (m/s)</th><th scope="col" className="p-1 text-left">net force (N)</th></tr></thead>
    <tbody>{Array.from({ length: Math.min(m.tMax, 30) + 1 }, (_, i) => sampleAtTime(m.setup, i, m.tMax)).map((r) => <tr key={r.t} className="border-t border-surface-border font-mono"><td className="p-1">{r.t}</td><td className="p-1" style={{ color: PHYS.position }}>{sg(r.x)}</td><td className="p-1" style={{ color: PHYS.velocity }}>{sg(r.v)}</td><td className="p-1" style={{ color: PHYS.netForce }}>{sg(r.net)}</td></tr>)}</tbody>
  </table></div>
);

/** The lesson/composite version: Viewport first, then playback and immediate results, compact settings below. */
export const ForceCartView: React.FC<ForceCartProps> = ({ initial = DEFAULT_SETUP, editable = true, showNet = true, startTime = 0, alt, resetToken, graphs = false }) => {
  const m = useForceCart({ initial, showNet, startTime, resetToken, alt });
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div className="space-y-4" data-visual="forceCart" data-testid="force-cart">
      {/* 1. Primary Simulation Viewport Surface */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card/60 to-surface-card/30 p-2 sm:p-3 overflow-hidden shadow-xs space-y-2.5">
          <Track setup={m.setup} tMax={m.tMax} t={m.tt} />
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1 border-t border-surface-border/50">
            <ForceToggles m={m} compact />
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5" data-testid="viewport-net-badge">
              <span className="text-[11px] text-slate-400">Net Force:</span>
              <span className="px-2 py-0.5 rounded-md bg-surface-lowest border border-surface-border" style={{ color: PHYS.netForce }}>
                {sg(m.p.net)} N
              </span>
            </div>
          </div>
          <ForceFigure object="cart" arrows={m.d.arrows} net={m.d.net} showIndividual={m.showIndividual} showNet={m.showNetForce} alt={m.figureAlt} />
        </div>
        <ForceTimeControls
          m={m}
          setupToggle={editable ? {
            open: setupOpen,
            onToggle: () => setSetupOpen((o) => !o),
            panelId: 'force-cart-setup-panel',
            testId: 'force-setup-toggle',
          } : undefined}
        />
      </div>

      {/* 2. Compact Collapsible Experiment Setup (when editable) */}
      {editable && (
        <div
          id="force-cart-setup-panel"
          hidden={!setupOpen}
          className={!setupOpen ? 'hidden' : 'space-y-2 pt-1 transition-all duration-200'}
        >
          <ForceSetupFields m={m} />
        </div>
      )}

      {/* 3. Measurements, Graphs, and Historical Data */}
      <ForceReadout m={m} />
      {graphs ? <ForceGraphs setup={m.setup} tMax={m.tMax} t={m.tt} /> : <VStrip setup={m.setup} tMax={m.tMax} t={m.tt} />}
      <ForceLive m={m} />
      <details className="rounded-xl border border-surface-border bg-surface-card/50 p-3">
        <summary className="cursor-pointer min-h-[44px] flex items-center text-sm text-slate-200 font-medium">Motion history (text alternative to the strip)</summary>
        <div className="mt-2"><ForceDataTable m={m} /></div>
      </details>
    </div>
  );
};

export const ForceCartVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as CartVisualProps;
  return <ForceCartView initial={p.setup} editable={Boolean(p.editable)} showNet={p.showNet ?? true} startTime={p.t ?? 0} alt={alt} graphs={Boolean((p as { graphs?: boolean }).graphs)} />;
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
