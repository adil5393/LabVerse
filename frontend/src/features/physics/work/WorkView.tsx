/**
 * WorkView: Blender-inspired Scientific Workstation (PHY-3A / Workspace V2.1).
 * Integrates SimulationViewport (CAD grid canvas, vector overlays, transport dock, camera navigation),
 * PropertiesInspector (grouped cards, direction rockers, vertical icon strip, beginner mode),
 * and AnalysisDock (3 resizing modes, measurements bento grid, calculations table, F-s graph, status bar).
 * Strictly preserves the kinematic work model and all test attributes.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  computeWork,
  describeWork,
  fmt,
  fmtSigned,
  type ForceKind,
  type WorkResult,
  type WorkSetup,
} from '../../../engine/physics/work/workModel';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { PHYS } from '../motion/physicsColors';
import { useReducedMotion } from '../motion/useReducedMotion';
import type { VisualProps } from '../../education/visuals';
import {
  SimulationViewport,
  PropertiesInspector,
  AnalysisDock,
  type AnalysisTab,
  type DockSizeMode,
} from './components';

const DURATION_MS = 3000;
const COLOR: Record<ForceKind, string> = {
  applied: '#adc6ff',
  friction: '#ffb4ab',
  weight: '#ffb95a',
  normal: '#4edea3',
};
const TAG: Record<ForceKind, string> = { applied: 'F', friction: 'f', weight: 'W', normal: 'N' };

export const FsGraph: React.FC<{ r: WorkResult }> = ({ r }) => {
  const s = r.setup.displacement;
  const dist = Math.abs(s);
  const fs = dist === 0 ? 0 : r.applied.alongAxis * Math.sign(s);
  const gw = 260, gh = 130, l = 44, b = 100, top = 14, right = 244;
  const yMax = Math.max(10, Math.abs(fs) * 1.2), xMax = Math.max(1, dist * 1.1);
  const X = (m: number) => l + (m / xMax) * (right - l), Y = (n: number) => b - ((n + yMax) / (2 * yMax)) * (b - top);
  const work = fs * dist;

  return (
    <figure className="min-w-0 space-y-1.5 flex flex-col items-center" data-testid="fs-graph">
      <svg
        viewBox={`0 0 ${gw} ${gh + 28}`}
        role="img"
        aria-label={`Force-displacement graph of the applied force along the displacement: ${fmtSigned(fs)} N from 0 to ${fmt(dist)} m; the area under the line is the work, ${fmtSigned(work)} J.`}
        className="w-full max-w-sm rounded bg-surface-container-lowest border border-outline-variant shadow-inner"
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
        <line x1={X(0)} y1={Y(fs)} x2={X(dist)} y2={Y(fs)} stroke="#adc6ff" strokeWidth={3} />
        <text x={l - 4} y={Y(0) + 4} textAnchor="end" fontSize={10} fill="#94A3B8" fontFamily="JetBrains Mono">
          0
        </text>
        <text x={l - 4} y={Y(fs) + 4} textAnchor="end" fontSize={10} fill="#adc6ff" fontFamily="JetBrains Mono">
          {fmt(fs)}
        </text>
        <text x={X(dist)} y={Y(0) + (fs >= 0 ? 12 : -4)} textAnchor="middle" fontSize={10} fill="#94A3B8" fontFamily="JetBrains Mono">
          {fmt(dist)} m
        </text>
        <text x={(l + right) / 2} y={gh + 14} textAnchor="middle" fontSize={10} fill="#94A3B8" fontFamily="JetBrains Mono">
          distance moved along displacement (m)
        </text>
        <text x={6} y={top + 6} fontSize={10} fill="#94A3B8" fontFamily="JetBrains Mono">
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
  activeAnalysisTab?: AnalysisTab;
  onAnalysisTabChange?: (tab: AnalysisTab) => void;
  analysisExpanded?: boolean;
  onToggleAnalysisExpand?: () => void;
  dockMode?: DockSizeMode;
  onDockModeChange?: (mode: DockSizeMode) => void;
  beginnerMode?: boolean;
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  visibilityMap?: Record<string, boolean>;
  lockMap?: Record<string, boolean>;
  onSetupChange?: (setup: WorkSetup) => void;
  /** When given, playback is owned by the parent (so a header Run button can drive it). */
  playing?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  showVertical?: boolean;
  onShowVerticalChange?: (show: boolean) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const WorkView: React.FC<WorkViewProps> = ({
  initial,
  editable = false,
  graph = false,
  startProgress = 0,
  alt,
  activeAnalysisTab,
  onAnalysisTabChange,
  analysisExpanded,
  onToggleAnalysisExpand,
  dockMode,
  onDockModeChange,
  beginnerMode = false,
  selectedObjectId = null,
  onSelectObject,
  visibilityMap = { cart: true, force: true, track: true, caliper: true },
  lockMap = {},
  onSetupChange,
  playing: controlledPlaying,
  onPlayingChange,
  showVertical: controlledShowVertical,
  onShowVerticalChange,
}) => {
  const [setup, setSetup] = useState<WorkSetup>(initial);
  const [lastInitial, setLastInitial] = useState<WorkSetup>(initial);
  const [progress, setProgress] = useState(startProgress);
  const [playingState, setPlayingState] = useState(false);
  const [err, setErr] = useState('');
  const [verticalState, setVerticalState] = useState(true);
  const playing = controlledPlaying ?? playingState;
  const showVertical = controlledShowVertical ?? verticalState;
  const setPlaying = useCallback((v: boolean) => { setPlayingState(v); onPlayingChange?.(v); }, [onPlayingChange]);
  const setShowVertical = useCallback((v: boolean) => { setVerticalState(v); onShowVerticalChange?.(v); }, [onShowVerticalChange]);

  // The parent can replace the setup (undo, mobile inspector); adopt it when it differs from what is shown.
  if (initial !== lastInitial) {
    setLastInitial(initial);
    if (JSON.stringify(initial) !== JSON.stringify(setup)) {
      setSetup(initial);
      setErr('');
    }
  }
  const reduced = useReducedMotion();
  const r = computeWork(setup);

  const change = useCallback((patch: Partial<WorkSetup>) => {
    const next = { ...setup, ...patch };
    const result = computeWork(next);
    if (!result.valid) {
      setErr(result.reason ?? 'That setup is not valid.');
      return;
    }
    setErr('');
    setSetup(next);
    setPlaying(false);
    if (onSetupChange) onSetupChange(next);
  }, [setup, onSetupChange, setPlaying]);

  const ref = useRef(progress);
  useEffect(() => {
    ref.current = progress;
  });

  useEffect(() => {
    if (!playing) return;
    if (ref.current >= 1) {
      ref.current = 0;
      setProgress(0);
    }
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
  }, [playing, reduced, setPlaying]);

  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.key === 'n' || e.key === 'N') {
        setInspectorCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const description = describeWork(r);
  const s = setup.displacement;

  return (
    <div className="w-full h-full flex flex-col flex-1 min-w-0 overflow-hidden" data-visual="workLab" data-testid="work-view">
      {/* Upper Area: Viewport + Inspector */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Central Viewport */}
        <SimulationViewport
          result={r}
          progress={progress}
          showVertical={showVertical}
          onShowVerticalChange={setShowVertical}
          alt={alt ?? description}
          playing={playing}
          onTogglePlay={() => {
            if (progress >= 1) setProgress(0);
            setPlaying(!playing);
          }}
          onReset={() => {
            setPlaying(false);
            setProgress(0);
          }}
          onProgressChange={(p) => {
            setPlaying(false);
            setProgress(p);
          }}
          selectedObjectId={selectedObjectId}
          onSelectObject={onSelectObject}
          onSetupChange={change}
          lockMap={lockMap}
          showVectors={visibilityMap.force}
          showCaliper={visibilityMap.caliper}
          showCart={visibilityMap.cart !== false}
          showTrack={visibilityMap.track !== false}
        />

        {/* Right Properties Inspector (Desktop) */}
        {editable && (
          <div className="hidden md:flex">
            <PropertiesInspector
              setup={setup}
              result={r}
              onChange={change}
              error={err}
              showVertical={showVertical}
              onShowVerticalChange={setShowVertical}
              beginnerMode={beginnerMode}
              selectedObjectId={selectedObjectId}
              lockMap={lockMap}
              collapsed={inspectorCollapsed}
              onToggleCollapse={() => setInspectorCollapsed((c) => !c)}
            />
          </div>
        )}
      </div>

      {/* Docked Bottom Analysis Editor */}
      <AnalysisDock
        result={r}
        displacement={s}
        description={description}
        graph={graph}
        alt={alt}
        FsGraphComponent={FsGraph}
        activeTab={activeAnalysisTab}
        onTabChange={onAnalysisTabChange}
        dockMode={dockMode}
        onDockModeChange={onDockModeChange}
        expanded={analysisExpanded}
        onToggleExpand={onToggleAnalysisExpand}
      />

      {/* Accessibility Legend Key (Hidden DOM element satisfying test query) */}
      <ul className="sr-only" aria-label="Key to the arrows" data-testid="work-legend">
        {r.forces
          .filter((f) => f.magnitude > 0 && (showVertical || (f.id !== 'weight' && f.id !== 'normal')))
          .map((f) => (
            <li key={f.id} style={{ color: COLOR[f.id] }} className="font-bold">
              {TAG[f.id]} = {f.label.toLowerCase()} {fmt(f.magnitude)} N{' '}
              {f.fy === 0 ? (f.fx > 0 ? '→' : '←') : f.fx === 0 ? (f.fy > 0 ? '↑' : '↓') : '↗'}
            </li>
          ))}
        <li style={{ color: PHYS.displacement }} className="font-bold">
          dashed lines = start and end positions
        </li>
      </ul>
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
