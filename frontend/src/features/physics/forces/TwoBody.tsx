import { ForcesPlayback as SimulationPlaybackControls, ForceSceneChoice, type ForceSceneView } from './ForcesSession';
/**
 * Two-body interaction laboratory and force-pair identification (PHY-2D). The two-body view is drawn entirely from
 * engine/physics/forces/twoBody.ts: the carts, both free-body diagrams, the readouts and the timeline use the same sample, so
 * the equal-and-opposite pair, the separate net forces and the momentum always agree. The pair view shows who exerts each
 * force on what, and checks a student's chosen pair against the same rule the tests use (pairs.ts).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { VisualProps } from '../../education/visuals';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { DEFAULT_TWO_BODY, TB_LIMITS, explainTwoBody, tbFmt, twoBodyAt, twoBodyHistory, validateTwoBody, type TwoBodySetup } from '../../../engine/physics/forces/twoBody';
import { PAIR_SCENARIOS, isBalancedOnOneObject, isThirdLawPair, pairScenarioById, whyNotPair, type PairForce } from '../../../engine/physics/forces/pairs';
import { netArrow, type Arrow } from '../../../engine/physics/forces/forceDiagram';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import { useDiagramLayout, useViewportProfile } from '../shared/viewportProfiles';
import { ActivityDetails } from '../../../components/InteractiveActivity';
import {
  ParameterControl,
  ExperimentSetupGroup,
  ModelAssumptions,
} from '../shared/controls';

const sg = (n: number): string => (Math.abs(n) < 1e-9 ? '0' : `${n > 0 ? '+' : '−'}${tbFmt(Math.abs(n))}`);

const Num: React.FC<{
  id: string;
  label: string;
  unit: string;
  value: number;
  step: number;
  min?: number;
  max?: number;
  symbol?: string;
  onChange: (v: number) => void;
}> = ({ id, label, unit, value, step, min, max, symbol, onChange }) => (
  <ParameterControl
    id={id}
    label={label}
    unit={unit}
    value={value}
    step={step}
    min={min}
    max={max}
    symbol={symbol}
    onChange={onChange}
  />
);

const arrow = (id: string, label: string, by: string, on: string, value: number, kind: Arrow['kind'] = 'applied'): Arrow | null =>
  Math.abs(value) < 1e-12 ? null : { id, kind, label, by, on, magnitude: Math.abs(value), direction: value > 0 ? 'right' : 'left', horizontal: value };

const TH = 120;

export interface TwoBodyProps { initial?: TwoBodySetup; editable?: boolean; alt?: string; resetToken?: number }

/** All state and actions of one two-body run; the lab slots and the lesson composite read the same instance. */
export const useTwoBody = ({ initial = DEFAULT_TWO_BODY, resetToken }: Pick<TwoBodyProps, 'initial' | 'resetToken'> = {}) => {
  const [setup, setSetup] = useState<TwoBodySetup>(initial);
  const [prev, setPrev] = useState(initial);
  const [tok, setTok] = useState(resetToken);
  const [t, setT] = useState(0);
  const simTimeRef = useRef(0);
  if (prev !== initial || tok !== resetToken) { setPrev(initial); setTok(resetToken); setSetup(initial); simTimeRef.current = 0; setT(0); }
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [err, setErr] = useState('');
  const [showNet, setShowNet] = useState(true);
  const reduced = useReducedMotion();
  const tMax = Math.max(4, Math.min(10, setup.durationS + 3));
  const tt = Math.min(t, tMax);
  const p = twoBodyAt(setup, tt);
  const hist = useMemo(() => twoBodyHistory(setup, tMax).filter((_, i) => i % 5 === 0), [setup, tMax]);

  const change = (patch: Partial<TwoBodySetup>) => {
    const next = { ...setup, ...patch };
    const why = validateTwoBody(next);
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

  const togglePlay = () => { if (tt >= tMax) { simTimeRef.current = 0; setT(0); } setPlaying((x) => !x); };
  const stepBack = () => { setPlaying(false); const next = Math.max(0, Math.ceil(tt) - 1); simTimeRef.current = next; setT(next); };
  const stepForward = () => { setPlaying(false); const next = Math.min(tMax, Math.floor(tt) + 1); simTimeRef.current = next; setT(next); };
  const rewind = () => { setPlaying(false); simTimeRef.current = 0; setT(0); };
  const scrub = (v: number) => { setPlaying(false); simTimeRef.current = v; setT(v); };
  return { setup, setSetup, t, setT, tt, tMax, p, hist, playing, setPlaying, rate, setRate, err, setErr, showNet, setShowNet, reduced, change, togglePlay, stepBack, stepForward, rewind, scrub };
};
export type TwoBodyModel = ReturnType<typeof useTwoBody>;

/** The picture: the track with both carts, the two separate free-body diagrams and the net-force switch. `hidden` hides parts. */
export const TwoBodyScene: React.FC<{ m: TwoBodyModel; alt?: string; hidden?: Record<string, boolean>; view?: 'all' | ForceSceneView }> = ({ m, alt, hidden = {}, view = 'all' }) => {
  const { setup, p, showNet, setShowNet } = m;
  const show = (id: string) => !hidden[id];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const profile = useViewportProfile(containerRef);
  const [body, setBody] = useState<'A' | 'B'>('A');
  const isMobile = profile.isMobile;
  const TW = isMobile ? Math.max(180, profile.width) : 620;

  // track scale
  // Follow the current pair, rather than fitting their entire future journey and hiding one cart behind the other.
  const xs = [p.xA, p.xB];
  let lo = Math.min(...xs), hi = Math.max(...xs);
  if (hi - lo < 4) { lo -= 2; hi += 2; }
  const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
  const X = (x: number) => 30 + ((x - lo) / (hi - lo)) * (TW - 60);
  const step = [0.5, 1, 2, 5, 10, 20, 50, 100].find((s) => (hi - lo) / s <= (isMobile ? 3 : 8)) ?? 200;
  const ticks: number[] = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(Math.round(v * 100) / 100);
  const scale = 60 / Math.max(1e-9, Math.abs(p.fOnAByB), Math.abs(p.fOnBByA), Math.abs(p.external));
  const A_ARROW = (v: number) => Math.max(14, Math.abs(v) * scale);

  // free-body diagrams: forces on A and forces on B, separately
  const aArrows = [arrow('fab', 'Force on A by B', 'cart B', 'cart A', p.fOnAByB, 'applied'), arrow('ext', 'Pull on A', 'the external hand', 'cart A', p.external, 'applied')].filter((x): x is Arrow => x !== null);
  const bArrows = [arrow('fba', 'Force on B by A', 'cart A', 'cart B', p.fOnBByA, 'applied')].filter((x): x is Arrow => x !== null);
  const live = explainTwoBody(setup, p);
  const text = alt ?? `Two carts. ${live}`;

  const cW = isMobile ? 42 : 32;
  const cH = isMobile ? 28 : 24;
  const cY = isMobile ? 54 : 58;

  return (
    <div ref={containerRef} className="space-y-3 w-full min-w-0">
      {view !== 'forces' && <svg viewBox={`0 0 ${TW} ${TH}`} role="img" aria-label={text} className="science-surface w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="two-body-track">
        <line x1={20} y1={86} x2={TW - 20} y2={86} stroke={PHYS.axis} strokeWidth={3} />
        {ticks.map((v) => <g key={v}><line x1={X(v)} y1={82} x2={X(v)} y2={92} stroke="#94a3b8" /><text x={X(v)} y={106} textAnchor="middle" fontSize={12} fill="#94a3b8">{v}</text></g>)}
        {show('link') && setup.mode === 'tow' && <line x1={X(p.xA) + cW / 2} y1={72} x2={X(p.xB) - cW / 2} y2={72} stroke={PHYS.force} strokeWidth={2} strokeDasharray="3 3" />}
        {([['A', p.xA, PHYS.position, p.fOnAByB, p.external], ['B', p.xB, PHYS.displacement, p.fOnBByA, 0]] as [string, number, string, number, number][]).filter(([n]) => show(n)).map(([n, x, col, f]) => (
          <g key={n}>
            <rect x={X(x) - cW / 2} y={cY} width={cW} height={cH} rx={4} fill={col} stroke="#0f172a" strokeWidth={2} />
            <text x={X(x)} y={cY + cH / 2 + 5} textAnchor="middle" fontSize={isMobile ? 13 : 12} fontWeight={800} fill="#0f172a">{n}</text>
            {Math.abs(f) > 1e-12 && (<g><line x1={X(x)} y1={cY - 8} x2={X(x) + Math.sign(f) * A_ARROW(f)} y2={cY - 8} stroke={PHYS.force} strokeWidth={3} /><polygon points={`${X(x) + Math.sign(f) * A_ARROW(f)},${cY - 8} ${X(x) + Math.sign(f) * (A_ARROW(f) - 9)},${cY - 13} ${X(x) + Math.sign(f) * (A_ARROW(f) - 9)},${cY - 3}`} fill={PHYS.force} /><text x={X(x) + Math.sign(f) * A_ARROW(f) / 2} y={cY - 16} textAnchor="middle" fontSize={12} fontWeight={700} fill={PHYS.force}>{isMobile ? n : n === 'A' ? 'by B on A' : 'by A on B'} {tbFmt(Math.abs(f))} N</text></g>)}
          </g>
        ))}
        <text x={TW - 24} y={118} textAnchor="end" fontSize={12} fill="#94a3b8">position (m)</text>
      </svg>}

      {view !== 'motion' && <>
      {isMobile && view === 'forces' && <div className="force-view-choice" role="group" aria-label="Choose a cart">
        {(['A','B'] as const).map(id => <button key={id} type="button" aria-pressed={body === id} onClick={() => setBody(id)}>Cart {id}</button>)}
      </div>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" aria-pressed={showNet} data-toggle="net" onClick={() => setShowNet((x) => !x)} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: showNet ? PHYS.netForce : '#334155' }}>{showNet ? '✓ ' : ''}Show the net force on each cart</button>
        <span className="text-[11px] text-slate-400">Each cart has its own free-body diagram: only the forces ON that cart are added.</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2" data-testid="two-body-fbds">
        {show('A') && (!isMobile || view !== 'forces' || body === 'A') && (<ForceFigure object="cart A" arrows={aArrows} net={netArrow(aArrows)} showIndividual showNet={showNet} listing={view === 'all'} alt={`Forces on cart A only: ${aArrows.length ? aArrows.map((a) => `${a.label} ${tbFmt(a.magnitude)} N ${a.direction}`).join('; ') : 'none'}.`} />)}
        {show('B') && (!isMobile || view !== 'forces' || body === 'B') && (<ForceFigure object="cart B" arrows={bArrows} net={netArrow(bArrows)} showIndividual showNet={showNet} listing={view === 'all'} alt={`Forces on cart B only: ${bArrows.length ? bArrows.map((a) => `${a.label} ${tbFmt(a.magnitude)} N ${a.direction}`).join('; ') : 'none'}.`} />)}
      </div>

      </>}
    </div>
  );
};

/** The numbers: both carts' readouts, the total momentum, the velocity timeline and the live sentence. */
export const TwoBodyReadout: React.FC<{ m: TwoBodyModel }> = ({ m }) => {
  const { setup, p, hist, tt, tMax } = m;
  const live = explainTwoBody(setup, p);
  // velocity timeline
  const vs = hist.flatMap((h) => [h.vA, h.vB]);
  let vlo = Math.min(0, ...vs), vhi = Math.max(0, ...vs); if (vhi - vlo < 1) vhi = vlo + 1;
  const timeline = useRef<SVGSVGElement>(null);
  const { width: VW, height: VH } = useDiagramLayout(timeline, 620, 160);
  const VX = (tm: number) => 44 + (tm / tMax) * (VW - 60), VY = (v: number) => 12 + (1 - (v - vlo) / (vhi - vlo)) * (VH - 40);

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2" data-testid="two-body-readout">
        {([['A', setup.massA, p.fOnAByB, p.external, p.netA, p.aA, p.vA, p.xA, p.pA, PHYS.position], ['B', setup.massB, p.fOnBByA, 0, p.netB, p.aB, p.vB, p.xB, p.pB, PHYS.displacement]] as [string, number, number, number, number, number, number, number, number, string][]).map(([n, m, f, ex, net, a, v, x, mom, col]) => (
          <dl key={n} className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 grid grid-cols-2 gap-x-3 text-xs" style={{ borderLeft: `4px solid ${col}` }} data-body={n}>
            <dt className="col-span-2 font-bold text-white">Cart {n} ({tbFmt(m)} kg)</dt>
            <dt className="text-slate-300">Force by {n === 'A' ? 'B' : 'A'}</dt><dd data-readout={`f${n}`} className="font-mono" style={{ color: PHYS.force }}>{sg(f)} N</dd>
            {ex !== 0 && <><dt className="text-slate-300">External pull</dt><dd className="font-mono" style={{ color: PHYS.force }}>{sg(ex)} N</dd></>}
            <dt className="text-slate-300">Net force on {n}</dt><dd data-readout={`net${n}`} className="font-mono" style={{ color: PHYS.netForce }}>{sg(net)} N</dd>
            <dt className="text-slate-300">Acceleration</dt><dd data-readout={`a${n}`} className="font-mono" style={{ color: PHYS.acceleration }}>{sg(a)} m/s²</dd>
            <dt className="text-slate-300">Velocity</dt><dd data-readout={`v${n}`} className="font-mono" style={{ color: PHYS.velocity }}>{sg(v)} m/s</dd>
            <dt className="text-slate-300">Position</dt><dd className="font-mono" style={{ color: PHYS.position }}>{sg(x)} m</dd>
            <dt className="text-slate-300">Momentum</dt><dd data-readout={`p${n}`} className="font-mono">{sg(mom)} kg m/s</dd>
          </dl>
        ))}
        <dl className="sm:col-span-2 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs flex flex-wrap gap-x-6 gap-y-1">
          <div><dt className="inline text-slate-300">Simulated time </dt><dd data-readout="t" className="inline font-mono" style={{ color: PHYS.time }}>{tbFmt(p.t)} s</dd></div>
          <div><dt className="inline text-slate-300">Total momentum (A + B) </dt><dd data-readout="ptotal" className="inline font-mono text-white">{sg(p.pTotal)} kg m/s</dd></div>
          <div><dt className="inline text-slate-300">Forces on A and B added </dt><dd data-readout="pairsum" className="inline font-mono text-white">{sg(p.fOnAByB + p.fOnBByA)} N</dd><span className="text-slate-400"> (the pair is equal and opposite, but it acts on two carts, so it is never added to find one cart&apos;s net force)</span></div>
        </dl>
      </div>

      <svg ref={timeline} viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Velocity–time timeline: cart A goes from ${sg(hist[0].vA)} to ${sg(hist[hist.length - 1].vA)} m/s and cart B from ${sg(hist[0].vB)} to ${sg(hist[hist.length - 1].vB)} m/s; at ${tbFmt(tt)} s they are ${sg(p.vA)} and ${sg(p.vB)} m/s.`} className="science-surface w-full rounded-xl bg-surface-lowest border border-surface-border" data-testid="two-body-timeline">
        <line x1={44} y1={VY(0)} x2={VW - 16} y2={VY(0)} stroke="#94a3b8" />
        <path d={hist.map((h, i) => `${i ? 'L' : 'M'}${VX(h.t)},${VY(h.vA)}`).join(' ')} fill="none" stroke={PHYS.position} strokeWidth={2.5} />
        <path d={hist.map((h, i) => `${i ? 'L' : 'M'}${VX(h.t)},${VY(h.vB)}`).join(' ')} fill="none" stroke={PHYS.displacement} strokeWidth={2.5} strokeDasharray="6 3" />
        <line x1={VX(tt)} y1={10} x2={VX(tt)} y2={VH - 28} stroke={PHYS.time} strokeDasharray="5 3" />
        <circle cx={VX(tt)} cy={VY(p.vA)} r={5} fill={PHYS.position} /><circle cx={VX(tt)} cy={VY(p.vB)} r={5} fill={PHYS.displacement} />
        <text x={8} y={16} fontSize={12} fill="#94a3b8">v (m/s)</text>
        <text x={VW - 16} y={VH - 8} textAnchor="end" fontSize={12} fill={PHYS.time}>time (s)</text>
        <text x={50} y={VH - 8} fontSize={12} fill={PHYS.position}>━ cart A</text><text x={120} y={VH - 8} fontSize={12} fill={PHYS.displacement}>┅ cart B</text>
      </svg>
      <div role="status" aria-live="polite" className="text-sm text-slate-100 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="two-body-live">{live}</div>
    </div>
  );
};

export const TwoBodyView: React.FC<TwoBodyProps> = ({ initial = DEFAULT_TWO_BODY, editable = true, alt, resetToken }) => {
  const m = useTwoBody({ initial, resetToken });
  const { setup, setT, tt, tMax, playing, setPlaying, rate, setRate, err, reduced, change } = m;
  const [setupOpen, setSetupOpen] = useState(false);
  const [view, setView] = useState<ForceSceneView>('motion');

  return (
    <div className="space-y-4" data-visual="twoBody" data-testid="two-body">
      {/* 1. Simulation Viewport Scene & Playback */}
      <div className="space-y-3">
        <div className="rounded-2xl border border-surface-border bg-gradient-to-b from-surface-card/60 to-surface-card/30 p-2 sm:p-3 overflow-hidden shadow-xs space-y-2.5">
          <ForceSceneChoice value={view} onChange={setView} />
          <p className="force-session-hint">Watch both carts, then compare the forces on each one.</p>
          <TwoBodyScene m={m} alt={alt} view={view} />
        </div>
        <SimulationPlaybackControls
          time={tt}
          maxTime={tMax}
          playing={playing}
          rate={rate}
          reducedMotion={reduced}
          onTogglePlay={() => { if (tt >= tMax) setT(0); setPlaying((x) => !x); }}
          onStepBack={() => { setPlaying(false); setT(Math.max(0, Math.ceil(tt) - 1)); }}
          onStepForward={() => { setPlaying(false); setT(Math.min(tMax, Math.floor(tt) + 1)); }}
          onReset={() => { setPlaying(false); setT(0); }}
          onScrub={(v) => m.scrub(Number(v))}
          onRateChange={(r) => setRate(r)}
          testId="two-body-time"
          playTestId="two-body-play"
          resetTestId="two-body-reset"
          setupToggle={editable ? {
            open: setupOpen,
            onToggle: () => setSetupOpen((o) => !o),
            panelId: 'two-body-setup-panel',
            testId: 'two-body-setup-toggle',
          } : undefined}
        />
      </div>

      {/* 2. Interactive Collapsible Setup Controls (when editable) */}
      {editable && (
        <div
          id="two-body-setup-panel"
          hidden={!setupOpen}
          className={!setupOpen ? 'hidden' : 'space-y-3 pt-1 transition-all duration-200'}
          data-testid="two-body-controls"
        >
          <ExperimentSetupGroup
            title={setup.mode === 'push' ? 'Two Carts Pushing Apart' : 'Two Boxes Joined by String'}
            icon="compare_arrows"
            columns={2}
          >
            <Num id="massA" label="Mass of A" unit="kg" symbol="m_A" value={setup.massA} step={1} min={TB_LIMITS.minMass} max={TB_LIMITS.maxMass} onChange={(v) => change({ massA: v })} />
            <Num id="massB" label="Mass of B" unit="kg" symbol="m_B" value={setup.massB} step={1} min={TB_LIMITS.minMass} max={TB_LIMITS.maxMass} onChange={(v) => change({ massB: v })} />
            <Num id="force" label={setup.mode === 'push' ? 'Interaction force' : 'Pull on A'} unit="N" symbol="F" value={setup.force} step={1} min={0} max={TB_LIMITS.maxForce} onChange={(v) => change({ force: v })} />
            <Num id="duration" label="Pushes last for" unit="s" symbol="Δt" value={setup.durationS} step={0.5} min={0.1} max={5} onChange={(v) => change({ durationS: v })} />
          </ExperimentSetupGroup>

          <details className="rounded-xl border border-surface-border bg-surface-card/50 px-3 py-1" data-testid="two-body-advanced">
            <summary className="cursor-pointer min-h-[44px] flex items-center text-xs text-slate-200 font-medium">More settings: starting velocities and arrangement</summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
              <Num id="uA" label="Start velocity of A" unit="m/s" symbol="u_A" value={setup.uA} step={1} onChange={(v) => change(setup.mode === 'tow' ? { uA: v, uB: v } : { uA: v })} />
              <Num id="uB" label="Start velocity of B" unit="m/s" symbol="u_B" value={setup.uB} step={1} onChange={(v) => change(setup.mode === 'tow' ? { uA: v, uB: v } : { uB: v })} />
              <div role="group" aria-label="Arrangement" className="col-span-full flex gap-2">
                {(['push', 'tow'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={setup.mode === m}
                    data-mode={m}
                    onClick={() => change({ mode: m, uA: 0, uB: 0 })}
                    className="min-h-[44px] px-3.5 rounded-lg border-2 text-xs font-bold text-slate-100 transition-colors"
                    style={{ borderColor: setup.mode === m ? PHYS.force : '#334155' }}
                  >
                    {setup.mode === m ? '✓ ' : ''}{m === 'push' ? 'Push apart' : 'Joined by a string'}
                  </button>
                ))}
              </div>
            </div>
          </details>

          <ModelAssumptions
            summary="Idealized two-body interaction model on a frictionless track."
            assumptions={[
              'Frictionless horizontal track with right as the positive direction (+x).',
              'Action-reaction pair: Forces on A and B are equal in magnitude and opposite in direction.',
              'Does not simulate collisions, rebounds, or inelastic deformation.',
            ]}
            limits={{
              massRange: [TB_LIMITS.minMass, TB_LIMITS.maxMass],
              forceRange: [0, TB_LIMITS.maxForce],
            }}
          />

          {err && <p role="alert" className="text-xs font-bold text-red-400 p-2 rounded-lg bg-red-950/30 border border-red-500/40" data-testid="two-body-error"><span aria-hidden>{'✗ '}</span>{err}</p>}
        </div>
      )}

      {/* 3. Measurements, Graphs, and Observations */}
      <ActivityDetails title="Both carts: measurements and timeline"><TwoBodyReadout m={m} /></ActivityDetails>
    </div>
  );
};

export const TwoBodyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as { setup?: TwoBodySetup; editable?: boolean };
  return <TwoBodyView initial={p.setup ?? DEFAULT_TWO_BODY} editable={Boolean(p.editable)} alt={alt} />;
};

// ---------------------------------------------------------------------------
// Force-pair identification
// ---------------------------------------------------------------------------

const toArrow = (f: PairForce): Arrow => ({
  id: f.id, kind: f.kind === 'gravity' && f.direction === 'down' ? 'weight' : f.direction === 'up' && f.kind === 'contact' ? 'normal' : f.kind === 'friction' ? 'friction' : 'applied',
  label: f.label, by: f.by, on: f.on, magnitude: f.magnitude, direction: f.direction,
  horizontal: f.direction === 'right' ? f.magnitude : f.direction === 'left' ? -f.magnitude : 0,
});

export const PairIdentifyView: React.FC<{ scenarioId?: string; mode?: 'identify' | 'compare'; alt?: string }> = ({ scenarioId = 'book', mode = 'identify' }) => {
  const [sid, setSid] = useState(scenarioId);
  const sc = pairScenarioById(sid) ?? PAIR_SCENARIOS[0];
  const [picked, setPicked] = useState<string[]>([]);
  const [fb, setFb] = useState<{ ok: boolean; text: string } | null>(null);
  const forcesOn = (obj: string) => sc.forces.filter((f) => f.on === obj);
  const toggle = (id: string) => { setFb(null); setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? [p[1], id] : [...p, id])); };
  const check = () => {
    const [a, b] = picked.map((id) => sc.forces.find((f) => f.id === id)!);
    if (!a || !b) { setFb({ ok: false, text: 'Choose exactly two forces first.' }); return; }
    if (isThirdLawPair(a, b)) setFb({ ok: true, text: `Yes: "${a.label}" (exerted by the ${a.by} on the ${a.on}) and "${b.label}" (exerted by the ${b.by} on the ${b.on}) are an action–reaction pair: equal in size, opposite in direction, the same kind, and acting on two different objects.` });
    else setFb({ ok: false, text: `Not a pair. ${whyNotPair(a, b)}${isBalancedOnOneObject(a, b) ? ' These two are balanced forces on one object.' : ''}` });
  };
  const book = pairScenarioById('book')!;
  return (
    <div className="space-y-3" data-visual="pairIdentify" data-testid="pair-identify">
      {mode === 'identify' && (
        <div className="space-y-2">
          <label className="force-situation-label sm:hidden">Choose a situation
            <select aria-label="Choose a situation" value={sc.id} onChange={e => { setSid(e.target.value); setPicked([]); setFb(null); }}>
              {PAIR_SCENARIOS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Choose a situation" className="hidden sm:flex flex-wrap gap-2">
          {PAIR_SCENARIOS.map((s) => <button key={s.id} type="button" aria-pressed={s.id === sc.id} data-scenario={s.id} onClick={() => { setSid(s.id); setPicked([]); setFb(null); }} className="min-h-[44px] px-3 rounded-lg border-2 text-xs font-bold text-slate-100" style={{ borderColor: s.id === sc.id ? PHYS.prediction : '#334155' }}>{s.id === sc.id ? '✓ ' : ''}{s.title}</button>)}
          </div>
        </div>
      )}
      {mode === 'compare' ? (
        <div className="space-y-3" data-testid="balanced-vs-pair">
          <p className="text-sm text-slate-200">{book.setup}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1 rounded-xl border p-2" style={{ borderColor: `${PHYS.correct}66` }} data-panel="balanced">
              <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.correct }}>1 · Balanced forces: two forces on ONE object</h4>
              <ForceFigure object="book" arrows={[toArrow(book.forces[0]), toArrow(book.forces[1])]} net={null} showIndividual showNet alt="Free-body diagram of the book: its weight (Earth on book, 10 N down) and the normal force (table on book, 10 N up) cancel: net force zero." />
              <p className="text-xs text-slate-300">Both arrows act on the book. They add up to zero, so the book&apos;s velocity does not change. They are NOT an action–reaction pair (same object, different kinds).</p>
            </div>
            <div className="space-y-1 rounded-xl border p-2" style={{ borderColor: `${PHYS.force}66` }} data-panel="pair">
              <h4 className="text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.force }}>2 · An action–reaction pair: forces on TWO objects</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <ForceFigure object="book" arrows={[toArrow(book.forces[1])]} net={null} showIndividual showNet={false} listing={false} alt="Free-body diagram of the book: the normal force from the table, 10 N up." />
                <ForceFigure object="table" arrows={[toArrow(book.forces[3])]} net={null} showIndividual showNet={false} listing={false} alt="Free-body diagram of the table: the force of the book pressing on it, 10 N down." />
              </div>
              <p className="text-xs text-slate-300">The table pushes the book up (on the book); the book presses the table down (on the table). Equal and opposite, but on different objects, so they never cancel on either one.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-200" data-testid="pair-setup">{sc.setup}</p>
          <fieldset className="rounded-xl p-3 space-y-2" style={{ border: `1px solid ${PHYS.prediction}66`, background: `${PHYS.prediction}0D` }}>
            <legend className="px-1 text-xs font-mono uppercase tracking-wider" style={{ color: PHYS.prediction }}>Choose two forces that belong together ({picked.length}/2)</legend>
            <ul className="space-y-1">
              {sc.forces.map((f) => (
                <li key={f.id}><button type="button" role="checkbox" aria-checked={picked.includes(f.id)} data-force={f.id} onClick={() => toggle(f.id)} className="min-h-[44px] w-full text-left px-3 rounded-lg border-2 text-sm text-slate-100" style={{ borderColor: picked.includes(f.id) ? PHYS.prediction : '#334155' }}>{picked.includes(f.id) ? '☑ ' : '☐ '}<strong>{f.label}</strong>: {f.magnitude} N {f.direction}; exerted by the <em>{f.by}</em> on the <em>{f.on}</em></button></li>
              ))}
            </ul>
            <button type="button" onClick={check} disabled={picked.length !== 2} className="min-h-[44px] px-4 rounded-lg font-bold text-sm text-slate-950 disabled:opacity-40" style={{ background: PHYS.prediction }} data-testid="pair-check">Check my pair</button>
          </fieldset>
          {fb && <div role="status" aria-live="polite" data-testid="pair-feedback" className="rounded-lg p-3 text-xs text-slate-100" style={{ border: `1px solid ${fb.ok ? PHYS.correct : PHYS.error}`, background: `${fb.ok ? PHYS.correct : PHYS.error}14` }}><strong style={{ color: fb.ok ? PHYS.correct : PHYS.error }}>{fb.ok ? '✓ ' : '✗ '}</strong>{fb.text}</div>}
          <ActivityDetails title="Look at the force diagrams">
          <div className="grid gap-3 md:grid-cols-2">
            {sc.objects.filter((o) => forcesOn(o).length > 0).map((o) => (
              <div key={o} className="space-y-1" data-object={o}>
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">Forces on the {o}</h4>
                <ForceFigure object={o} arrows={forcesOn(o).map(toArrow)} net={null} showIndividual showNet={false} listing={false} alt={`Forces on the ${o}: ${forcesOn(o).map((f) => `${f.label}, ${f.magnitude} N ${f.direction}`).join('; ')}.`} />
              </div>
            ))}
          </div>
          </ActivityDetails>
          <p className="text-xs text-slate-300 rounded-lg border border-surface-border p-2" data-testid="pair-explain"><strong>What to notice: </strong>{sc.explain}</p>
        </>
      )}
    </div>
  );
};

export const PairIdentifyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as { scenario?: string; mode?: 'identify' | 'compare' };
  return <PairIdentifyView scenarioId={p.scenario} mode={p.mode} alt={alt} />;
};
