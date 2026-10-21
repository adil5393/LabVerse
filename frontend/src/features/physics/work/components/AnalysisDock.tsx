import React, { useState, useRef, useCallback } from 'react';
import {
  fmt,
  fmtSigned,
  RELATION_TEXT,
  type ForceKind,
  type WorkResult,
} from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';

import { useViewportProfile } from '../../shared/viewportProfiles';

export type AnalysisTab = 'measurements' | 'calculations' | 'graphs' | 'data' | 'explanation';
export type DockSizeMode = 'compact' | 'balanced' | 'focus';

const COLOR: Record<ForceKind, string> = {
  applied: '#adc6ff',
  friction: '#ffb4ab',
  weight: '#ffb95a',
  normal: '#4edea3',
};

const MODE_HEIGHTS: Record<DockSizeMode, number> = {
  compact: 40,
  balanced: 240,
  focus: 420,
};

export interface AnalysisDockProps {
  result: WorkResult;
  displacement: number;
  description: string;
  graph?: boolean;
  alt?: string;
  FsGraphComponent?: React.FC<{ r: WorkResult }>;
  activeTab?: AnalysisTab;
  onTabChange?: (tab: AnalysisTab) => void;
  dockMode?: DockSizeMode;
  onDockModeChange?: (mode: DockSizeMode) => void;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

/**
 * AnalysisDock: Blender Timeline-inspired docked analysis editor matching Stitch design.
 * Features 3 intelligent sizing modes (Compact, Balanced, Analysis Focus),
 * manual drag resizing, tabs for Measurements, Calculations, Graphs, Data, and Explanation,
 * metric bento cards, force accounting table, and bottom telemetry status bar.
 */
export const AnalysisDock: React.FC<AnalysisDockProps> = ({
  result: r,
  displacement: s,
  description,
  graph = true,
  alt,
  FsGraphComponent,
  activeTab: controlledTab,
  onTabChange,
  dockMode: controlledMode,
  onDockModeChange,
  expanded = false,
  onToggleExpand,
}) => {
  const [internalTab, setInternalTab] = useState<AnalysisTab>('measurements');
  const activeTab = controlledTab ?? internalTab;

  const sectionRef = useRef<HTMLElement | null>(null);
  const profile = useViewportProfile(sectionRef);
  const isMobile = profile.isMobile;
  const [internalMode, setInternalMode] = useState<DockSizeMode>(expanded ? 'focus' : (isMobile ? 'compact' : 'balanced'));
  const currentMode = controlledMode ?? (expanded ? 'focus' : internalMode);

  // Custom dragged height (if user manually dragged the handle)
  const [draggedHeight, setDraggedHeight] = useState<number | null>(null);
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(0);

  const setMode = useCallback((m: DockSizeMode) => {
    setDraggedHeight(null);
    if (onDockModeChange) onDockModeChange(m);
    else setInternalMode(m);
    if (onToggleExpand && ((m === 'focus' && !expanded) || (m !== 'focus' && expanded))) {
      onToggleExpand();
    }
  }, [onDockModeChange, onToggleExpand, expanded]);

  const handleTabChange = (t: AnalysisTab) => {
    if (onTabChange) onTabChange(t);
    else setInternalTab(t);

    // If currently in compact mode, intelligently expand when clicking deep analysis tabs
    if (currentMode === 'compact') {
      setMode('balanced');
    }
  };

  const horizontal = r.setup.axis === 'horizontal';
  const opposingForce = horizontal
    ? r.forces.find((f) => f.id === 'friction')
    : r.forces.find((f) => f.id === 'weight');
  const opposingWork = opposingForce?.work ?? 0;

  const angle = ((r.setup.angleDeg % 360) + 360) % 360;
  const cosA = Math.cos((angle * Math.PI) / 180);

  // Drag resizing logic
  const handleSeparatorPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    startYRef.current = e.clientY;
    startHRef.current = draggedHeight ?? MODE_HEIGHTS[currentMode];
  };

  const handleSeparatorPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizingRef.current) return;
    const delta = startYRef.current - e.clientY;
    const maxH = Math.round(window.innerHeight * 0.7);
    const newH = Math.max(56, Math.min(maxH, startHRef.current + delta));
    setDraggedHeight(newH);

    // Update semantic mode if threshold reached
    if (newH < 80) {
      if (currentMode !== 'compact') onDockModeChange?.('compact');
    } else if (newH > 340) {
      if (currentMode !== 'focus') onDockModeChange?.('focus');
    } else {
      if (currentMode !== 'balanced') onDockModeChange?.('balanced');
    }
  };

  const handleSeparatorPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const effectiveHeight = draggedHeight ?? MODE_HEIGHTS[currentMode];
  const isCompact = currentMode === 'compact' && (draggedHeight === null || draggedHeight <= 70);

  return (
    <section
      ref={sectionRef}
      style={{ height: `${effectiveHeight}px` }}
      className="flex-shrink-0 bg-surface-container-low border-t border-outline-variant flex flex-col z-40 select-none relative transition-[height] duration-75"
      data-testid="work-readout"
    >
      {/* Draggable Top Separator Bar */}
      <div
        onPointerDown={handleSeparatorPointerDown}
        onPointerMove={handleSeparatorPointerMove}
        onPointerUp={handleSeparatorPointerUp}
        className="absolute -top-1.5 left-0 right-0 h-3 cursor-row-resize z-50 flex items-center justify-center group"
        title="Drag to resize Analysis Dock"
      >
        <div className="w-16 h-1 rounded-full bg-outline-variant group-hover:bg-primary transition-colors" />
      </div>

      {/* Analysis Editor Header & Mode Controls */}
      <div
        onClick={() => {
          if (window.innerWidth < 640 && isCompact) {
            setMode('balanced');
          }
        }}
        className="h-8 px-2 sm:px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container shrink-0 cursor-pointer sm:cursor-default"
      >
        <div className="flex items-center space-x-1 h-full overflow-x-auto no-scrollbar">
          <div className="flex items-center space-x-1 text-primary pr-2 border-r border-outline-variant mr-1 shrink-0">
            <span className="material-symbols-outlined text-[15px]">analytics</span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider hidden sm:inline">ANALYSIS</span>
          </div>

          {/* Horizontal Editor Tabs */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTabChange('measurements'); }}
            className={`px-2 sm:px-2.5 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'measurements'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Measurements
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTabChange('calculations'); }}
            className={`px-2 sm:px-2.5 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'calculations'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Calculations
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTabChange('graphs'); }}
            className={`px-2 sm:px-2.5 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'graphs'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Graphs (F-s)
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTabChange('data'); }}
            className={`px-2 sm:px-2.5 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'data'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Data
          </button>

          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleTabChange('explanation'); }}
            className={`px-2 sm:px-2.5 h-full flex items-center font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'explanation'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Explanation
          </button>
        </div>

        {/* Dock Sizing Mode Buttons (Compact, Balanced, Focus) */}
        <div className="flex items-center space-x-1 font-mono text-[10px]">
          <div className="hidden sm:flex items-center bg-surface-container-lowest border border-outline-variant rounded p-0.5 mr-2">
            <button
              type="button"
              onClick={() => setMode('compact')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentMode === 'compact' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-white'
              }`}
              title="Compact Mode: Small bottom bar, maximum viewport"
            >
              Compact
            </button>
            <button
              type="button"
              onClick={() => setMode('balanced')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentMode === 'balanced' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-white'
              }`}
              title="Balanced Mode: ~30% analysis, 70% viewport"
            >
              Balanced
            </button>
            <button
              type="button"
              onClick={() => setMode('focus')}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                currentMode === 'focus' ? 'bg-primary text-on-primary font-bold' : 'text-outline hover:text-white'
              }`}
              title="Analysis Focus: ~50% analysis, full inspection"
            >
              Focus
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMode(currentMode === 'focus' ? 'compact' : currentMode === 'compact' ? 'balanced' : 'focus')}
            className="p-1 text-outline hover:text-white flex items-center"
            title="Cycle Dock Height"
          >
            <span className="material-symbols-outlined text-[16px]">
              {currentMode === 'focus' ? 'unfold_less' : currentMode === 'compact' ? 'unfold_more' : 'expand'}
            </span>
          </button>
        </div>
      </div>

      {/* COMPACT MODE SUMMARY STRIP */}
      {isCompact ? (
        <div className="flex-1 px-3 flex items-center justify-between text-xs font-mono bg-surface-container-lowest overflow-x-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-outline text-[11px]">W_app:</span>
              <span className="text-primary font-bold">{fmtSigned(r.appliedWork)} J</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-error" />
              <span className="text-outline text-[11px]">{horizontal ? 'W_f:' : 'W_g:'}</span>
              <span className="text-error font-bold">{fmtSigned(opposingWork)} J</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="text-outline text-[11px]">W_net:</span>
              <span className="text-tertiary font-bold">{fmtSigned(r.netWork)} J</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-outline text-[11px]">s:</span>
              <span className="text-secondary font-bold">{fmtSigned(s)} m</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMode('balanced')}
            className="text-[11px] text-primary hover:underline font-mono"
          >
            Expand Details &rarr;
          </button>
        </div>
      ) : (
        /* BALANCED & FOCUS TAB PANELS */
        <div className="flex-1 p-2 sm:p-2.5 overflow-y-auto">
          {/* TAB 1: MEASUREMENTS (Stitch Bento Cards) */}
          <div className={activeTab === 'measurements' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 h-full items-stretch' : 'hidden'}>
            {/* Metric Card 1: Applied Work */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-1">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">
                    Applied Work (W_app)
                  </span>
                </div>
                <span className="font-mono text-[9px] text-tertiary">
                  {r.appliedWork > 0 ? 'POSITIVE WORK' : r.appliedWork < 0 ? 'NEGATIVE WORK' : 'ZERO WORK'}
                </span>
              </div>
              <div className="py-0.5">
                <div className="font-mono text-xl sm:text-2xl font-bold text-primary">
                  {fmtSigned(r.appliedWork)} J
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant mt-0.5 truncate">
                  W = F &times; d = {fmtSigned(r.applied.alongAxis)} N &times; {fmtSigned(s)} m
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-outline border-t border-outline-variant/40 pt-1">
                <span>θ = {angle}° (cos θ = {cosA.toFixed(2)})</span>
                <span className="text-primary font-semibold">{r.appliedWork >= 0 ? 'Transfers Energy IN' : 'Resists Motion'}</span>
              </div>
            </div>

            {/* Metric Card 2: Friction / Opposing Work */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-1">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-error" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">
                    {horizontal ? 'Friction Work (W_f)' : 'Gravity Work (W_g)'}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-error">
                  {opposingWork < 0 ? 'NEGATIVE WORK' : opposingWork > 0 ? 'POSITIVE WORK' : 'ZERO WORK'}
                </span>
              </div>
              <div className="py-0.5">
                <div className="font-mono text-xl sm:text-2xl font-bold text-error">
                  {fmtSigned(opposingWork)} J
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant mt-0.5 truncate">
                  {horizontal ? `W_f = -f_k × d = ${fmtSigned(opposingWork)} J` : 'W_g = -m·g·h'}
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-outline border-t border-outline-variant/40 pt-1">
                <span>θ = 180° (opposes displacement)</span>
                <span className="text-error font-semibold">Dissipates as Heat</span>
              </div>
            </div>

            {/* Metric Card 3: Net Work */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-1">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">
                    Net Work (W_net)
                  </span>
                </div>
                <span className="font-mono text-[9px] text-tertiary">ΔK KINETIC</span>
              </div>
              <div className="py-0.5">
                <div className="font-mono text-xl sm:text-2xl font-bold text-tertiary">
                  {fmtSigned(r.netWork)} J
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant mt-0.5 truncate">
                  W_net = ∑ W_i = ΔK
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-outline border-t border-outline-variant/40 pt-1">
                <span>v_final = √(2W/m)</span>
                <span className="text-tertiary font-semibold">{r.netWork > 0 ? 'Net Acceleration' : 'Steady / Decel'}</span>
              </div>
            </div>

            {/* Metric Card 4: Displacement */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest p-2.5 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-1">
                <div className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface font-semibold">
                    Displacement (Δx)
                  </span>
                </div>
                <span className="font-mono text-[9px] text-secondary">VECTOR X</span>
              </div>
              <div className="py-0.5">
                <div className="font-mono text-xl sm:text-2xl font-bold text-secondary">
                  {fmtSigned(s)} m
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant mt-0.5 truncate">
                  x_f - x_i = {fmt(r.endPos)} m - {fmt(r.setup.startPos)} m
                </div>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-outline border-t border-outline-variant/40 pt-1">
                <span>Direction: Along {s >= 0 ? '+X' : '-X'} axis</span>
                <span className="text-secondary font-semibold">Track Clamped</span>
              </div>
            </div>
          </div>

          {/* TAB 2: CALCULATIONS (Force Accounting Table) */}
          <div className={activeTab === 'calculations' ? 'space-y-2 h-full overflow-y-auto' : 'hidden'}>
            {/* Formula Banner */}
            <div
              className="rounded border border-primary/40 p-2 text-slate-100 font-mono text-xs bg-surface-container-lowest flex items-center flex-wrap gap-2"
              data-testid="work-formula"
            >
              <strong style={{ color: PHYS.force }}>Applied force: </strong>
              W = F &times; s = ({fmtSigned(r.applied.alongAxis)} N) &times; ({fmtSigned(s)} m) ={' '}
              <strong className="text-primary font-bold">{fmtSigned(r.appliedWork)} J</strong>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto rounded border border-outline-variant bg-surface-container-lowest" role="region" aria-label="Work table" tabIndex={0}>
              <table className="w-full text-xs font-mono">
                <caption className="sr-only">
                  Each force on the object, how it is related to the displacement and the work it does, with the net work.
                </caption>
                <thead>
                  <tr className="bg-surface-container text-slate-300 border-b border-outline-variant text-left">
                    <th scope="col" className="p-2">Force (exerted by)</th>
                    <th scope="col" className="p-2">Size and direction</th>
                    <th scope="col" className="p-2">Compared with displacement</th>
                    <th scope="col" className="p-2 text-right">Work Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {r.forces.map((f) => (
                    <tr key={f.id} className="hover:bg-surface-container/30 transition-colors" data-force-row={f.id}>
                      <td className="p-2 font-bold" style={{ color: COLOR[f.id] }}>
                        {f.label} <span className="font-normal text-slate-400">({f.by})</span>
                      </td>
                      <td className="p-2 text-slate-200">
                        {fmt(f.magnitude)} N{' '}
                        {f.magnitude === 0
                          ? ''
                          : f.fy === 0
                          ? f.fx > 0
                            ? 'right'
                            : 'left'
                          : f.fx === 0
                          ? f.fy > 0
                            ? 'up'
                            : 'down'
                          : 'at an angle'}
                      </td>
                      <td className="p-2 text-slate-300">{RELATION_TEXT[f.relation]}</td>
                      <td
                        className="p-2 font-bold text-right"
                        data-work={f.work}
                        style={{
                          color: f.work > 0 ? PHYS.correct : f.work < 0 ? PHYS.error : '#CBD5E1',
                        }}
                      >
                        {fmtSigned(f.work)} J{' '}
                        <span className="font-sans font-normal text-[11px]">
                          {f.work > 0 ? '(positive)' : f.work < 0 ? '(negative)' : '(zero)'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-outline-variant bg-surface-container/60" data-force-row="net">
                    <th scope="row" className="p-2 text-left font-bold text-white">
                      Net work (all forces added)
                    </th>
                    <td className="p-2 text-slate-400" colSpan={2}>
                      {r.forces.map((f) => fmt(f.work)).join(' + ')}
                    </td>
                    <td className="p-2 font-bold text-right text-white" data-testid="net-work" data-work={r.netWork}>
                      {fmtSigned(r.netWork)} J
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TAB 3: GRAPHS */}
          <div className={activeTab === 'graphs' || graph ? (activeTab === 'graphs' ? 'h-full flex flex-col justify-center items-center py-1' : 'hidden') : 'hidden'}>
            {graph && FsGraphComponent && <FsGraphComponent r={r} />}
          </div>

          {/* TAB 4: DATA TABLE */}
          <div className={activeTab === 'data' ? 'h-full overflow-y-auto font-mono text-xs text-slate-300' : 'hidden'}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 bg-surface-container rounded border border-outline-variant">
              <div>Progress: 0.00 &rarr; x = {fmt(r.setup.startPos)} m</div>
              <div>Progress: 0.50 &rarr; x = {fmt((r.setup.startPos + r.endPos) / 2)} m</div>
              <div>Progress: 1.00 &rarr; x = {fmt(r.endPos)} m</div>
              <div>Net Work: {fmtSigned(r.netWork)} J</div>
            </div>
          </div>

          {/* TAB 5: EXPLANATION */}
          <div className={activeTab === 'explanation' ? 'space-y-2 text-xs font-mono text-slate-300 p-1' : 'hidden'}>
            {!alt && (
              <p className="bg-surface-container-lowest p-2.5 rounded border border-outline-variant leading-relaxed" data-testid="work-description">
                {description}
              </p>
            )}
            <p className="text-[11px] text-slate-400">
              This is a <strong>kinematic work model</strong>: you choose the displacement, the model does not solve Newton&apos;s second law. It reports the work each constant force does over that displacement.
            </p>
          </div>
        </div>
      )}

      {/* Very Bottom Workbench Global Status Bar (Hidden on mobile to save vertical space) */}
      <footer className="h-6 bg-surface-container-high border-t border-outline-variant px-3 sm:px-4 hidden sm:flex items-center justify-between text-[10px] font-mono text-outline shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="text-on-surface">Engine: Kinematics Work Integrator</span>
          </span>
          <span>•</span>
          <span>Precision: Double 64-bit IEEE-754</span>
          <span>•</span>
          <span className="text-tertiary font-semibold">Status: Synchronized</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Units: SI (Joules)</span>
          <span className="hidden sm:inline">Mode: {currentMode.toUpperCase()}</span>
          <span>NCERT PHY-3A</span>
        </div>
      </footer>
    </section>
  );
};
