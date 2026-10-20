/**
 * The Work Laboratory scene (PHY-3A): Modern scientific workstation redesign.
 * Left/centre: Primary experiment canvas with coordinate axis, force vectors, and playback toolbar.
 * Right: Engineering properties inspector for applied force, direction, displacement, and advanced properties.
 * Below: Live differentiated measurement cards, comprehensive force-by-force calculation table, and F-s graph.
 * Every number and arrow derives strictly from `computeWork` (a kinematic work model).
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  computeWork,
  describeWork,
  fmt,
  fmtSigned,
  type WorkResult,
  type WorkSetup,
} from '../../../engine/physics/work/workModel';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { VisualProps } from '../../education/visuals';
import {
  LaboratoryCanvas,
  ExperimentInspector,
  MeasurementCard,
  CalculationPanel,
} from './components';

const DURATION_MS = 3000;

export const FsGraph: React.FC<{ r: WorkResult }> = ({ r }) => {
  const s = r.setup.displacement;
  const dist = Math.abs(s);
  const fs = dist === 0 ? 0 : r.applied.alongAxis * Math.sign(s); // force component along the displacement direction
  const gw = 260, gh = 130, l = 44, b = 100, top = 14, right = 244;
  const yMax = Math.max(10, Math.abs(fs) * 1.2), xMax = Math.max(1, dist * 1.1);
  const X = (m: number) => l + (m / xMax) * (right - l), Y = (n: number) => b - ((n + yMax) / (2 * yMax)) * (b - top);
  const work = fs * dist;

  return (
    <figure className="min-w-0 space-y-1.5" data-testid="fs-graph">
      <svg
        viewBox={`0 0 ${gw} ${gh + 28}`}
        role="img"
        aria-label={`Force-displacement graph of the applied force along the displacement: ${fmtSigned(fs)} N from 0 to ${fmt(dist)} m; the area under the line is the work, ${fmtSigned(work)} J.`}
        className="w-full max-w-sm rounded-xl bg-surface-lowest border border-surface-border shadow-inner"
      >
        <line x1={l} y1={Y(0)} x2={right} y2={Y(0)} stroke={PHYS.axis} strokeWidth={2} />
        <line x1={l} y1={top} x2={l} y2={b} stroke={PHYS.axis} strokeWidth={2} />
        {dist > 0 && (
          <rect
            x={X(0)}
            y={Math.min(Y(0), Y(fs))}
            width={X(dist) - X(0)}
            height={Math.abs(Y(fs) - Y(0))}
            fill={work >= 0 ? `${PHYS.correct}55` : `${PHYS.error}55`}
            stroke={work >= 0 ? PHYS.correct : PHYS.error}
          />
        )}
        <line x1={X(0)} y1={Y(fs)} x2={X(dist)} y2={Y(fs)} stroke={PHYS.force} strokeWidth={3} />
        <text x={l - 4} y={Y(0) + 4} textAnchor="end" fontSize={10} fill="#94A3B8" fontFamily="sans-serif">
          0
        </text>
        <text x={l - 4} y={Y(fs) + 4} textAnchor="end" fontSize={10} fill={PHYS.force} fontFamily="sans-serif">
          {fmt(fs)}
        </text>
        <text x={X(dist)} y={Y(0) + (fs >= 0 ? 12 : -4)} textAnchor="middle" fontSize={10} fill="#94A3B8" fontFamily="sans-serif">
          {fmt(dist)} m
        </text>
        <text x={(l + right) / 2} y={gh + 14} textAnchor="middle" fontSize={10} fill="#94A3B8" fontFamily="sans-serif">
          distance moved along the displacement (m)
        </text>
        <text x={6} y={top + 6} fontSize={10} fill="#94A3B8" fontFamily="sans-serif">
          F along s (N)
        </text>
      </svg>
      <figcaption className="text-[11px] text-slate-300 font-mono" data-testid="fs-caption">
        Area under the line = the applied force&apos;s work = {fmtSigned(work)} J.
      </figcaption>
    </figure>
  );
};

export interface WorkViewProps {
  initial: WorkSetup;
  editable?: boolean;
  graph?: boolean;
  startProgress?: number;
  alt?: string;
}

export const WorkView: React.FC<WorkViewProps> = ({
  initial,
  editable = false,
  graph = false,
  startProgress = 0,
  alt,
}) => {
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
    if (!result.valid) {
      setErr(result.reason ?? 'That setup is not valid.');
      return;
    }
    setErr('');
    setSetup(next);
    setPlaying(false);
  };

  const ref = useRef(progress);
  useEffect(() => {
    ref.current = progress;
  });

  useEffect(() => {
    if (!playing) return;
    if (reduced) {
      const id = window.setTimeout(() => {
        setProgress(1);
        setPlaying(false);
      }, 0);
      return () => window.clearTimeout(id);
    }
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const next = tickClock(ref.current * DURATION_MS, now - last, 1, DURATION_MS) / DURATION_MS;
      last = now;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const horizontal = setup.axis === 'horizontal';
  const description = describeWork(r);
  const s = setup.displacement;

  // Scientific quantities for differentiated KPI measurement cards
  const opposingForce = horizontal
    ? r.forces.find((f) => f.id === 'friction')
    : r.forces.find((f) => f.id === 'weight');
  const opposingWork = opposingForce?.work ?? 0;

  return (
    <div className="space-y-6 min-w-0" data-visual="workLab" data-testid="work-view">
      {/* Primary Workstation Section: Canvas + Inspector */}
      {editable ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left/Center: Canvas & Controls */}
          <div className="lg:col-span-7 xl:col-span-8">
            <LaboratoryCanvas
              result={r}
              progress={progress}
              showVertical={showVertical}
              alt={description}
              playing={playing}
              onTogglePlay={() => {
                if (progress >= 1) setProgress(0);
                setPlaying((p) => !p);
              }}
              onReset={() => {
                setPlaying(false);
                setProgress(0);
              }}
              onProgressChange={(p) => {
                setPlaying(false);
                setProgress(p);
              }}
            />
          </div>

          {/* Right: Engineering Inspector */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ExperimentInspector
              setup={setup}
              onChange={change}
              error={err}
              showVertical={showVertical}
              onShowVerticalChange={setShowVertical}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <LaboratoryCanvas
            result={r}
            progress={progress}
            showVertical={showVertical}
            alt={alt ?? description}
            playing={playing}
            onTogglePlay={() => {
              if (progress >= 1) setProgress(0);
              setPlaying((p) => !p);
            }}
            onReset={() => {
              setPlaying(false);
              setProgress(0);
            }}
            onProgressChange={(p) => {
              setPlaying(false);
              setProgress(p);
            }}
          />
        </div>
      )}

      {/* Live Measurement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MeasurementCard
          title="Applied Force Work"
          symbol="W_F"
          value={`${fmtSigned(r.appliedWork)}`}
          unit="J"
          subtitle={`W = F · s = (${fmtSigned(r.applied.alongAxis)} N) × (${fmtSigned(s)} m)`}
          badgeText={r.appliedWork > 0 ? 'Positive Work' : r.appliedWork < 0 ? 'Negative Work' : 'Zero Work'}
          badgeVariant={r.appliedWork > 0 ? 'positive' : r.appliedWork < 0 ? 'negative' : 'zero'}
          accentColor={PHYS.force}
        />

        <MeasurementCard
          title="Net Work"
          symbol="∑W"
          value={`${fmtSigned(r.netWork)}`}
          unit="J"
          subtitle="All active forces combined"
          badgeText={r.netWork > 0 ? 'Energy Gained' : r.netWork < 0 ? 'Energy Absorbed' : 'Zero Net Work'}
          badgeVariant={r.netWork > 0 ? 'positive' : r.netWork < 0 ? 'negative' : 'zero'}
          accentColor={r.netWork > 0 ? PHYS.correct : r.netWork < 0 ? PHYS.error : '#94A3B8'}
        />

        <MeasurementCard
          title="Displacement"
          symbol="s"
          value={`${fmtSigned(s)}`}
          unit="m"
          subtitle={`From ${fmt(setup.startPos)} m to ${fmt(r.endPos)} m`}
          badgeText={s > 0 ? (horizontal ? 'Right (+)' : 'Up (+)') : s < 0 ? (horizontal ? 'Left (-)' : 'Down (-)') : 'At Rest'}
          badgeVariant={s !== 0 ? 'positive' : 'zero'}
          accentColor={PHYS.displacement}
        />

        <MeasurementCard
          title={horizontal ? 'Friction Work' : 'Gravity Work'}
          symbol={horizontal ? 'W_f' : 'W_g'}
          value={`${fmtSigned(opposingWork)}`}
          unit="J"
          subtitle={horizontal ? `${setup.surfaceId} surface friction` : 'Opposes upward lift'}
          badgeText={opposingWork < 0 ? 'Opposes Motion' : opposingWork > 0 ? 'Aids Motion' : 'No Opposing Work'}
          badgeVariant={opposingWork < 0 ? 'negative' : opposingWork > 0 ? 'positive' : 'zero'}
          accentColor={horizontal ? PHYS.friction : PHYS.vertical}
        />
      </div>

      {/* Detailed Calculations Section */}
      <CalculationPanel
        result={r}
        displacement={s}
        description={description}
        graph={graph}
        alt={alt}
        FsGraphComponent={FsGraph}
      />
    </div>
  );
};

export const WorkVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { setup: WorkSetup; editable?: boolean; progress?: number; graph?: boolean };
  return (
    <WorkView
      initial={p.setup}
      editable={p.editable ?? false}
      graph={p.graph ?? false}
      startProgress={p.progress ?? 0}
      alt={alt}
    />
  );
};
