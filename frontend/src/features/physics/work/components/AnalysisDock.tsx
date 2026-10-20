import React, { useState } from 'react';
import {
  fmt,
  fmtSigned,
  RELATION_TEXT,
  type ForceKind,
  type WorkResult,
} from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';

export type AnalysisTab = 'measurements' | 'calculations' | 'graphs' | 'data' | 'explanation';

const COLOR: Record<ForceKind, string> = {
  applied: '#adc6ff',
  friction: '#ffb4ab',
  weight: '#ffb95a',
  normal: '#4edea3',
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
  expanded?: boolean;
  onToggleExpand?: () => void;
}

/**
 * AnalysisDock: Blender Timeline-inspired docked analysis editor matching Stitch design.
 * Features tabs for Measurements, Calculations, Graphs, Data, and Explanation,
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
  expanded = false,
  onToggleExpand,
}) => {
  const [internalTab, setInternalTab] = useState<AnalysisTab>('measurements');
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = (t: AnalysisTab) => {
    if (onTabChange) onTabChange(t);
    else setInternalTab(t);
  };

  const horizontal = r.setup.axis === 'horizontal';
  const opposingForce = horizontal
    ? r.forces.find((f) => f.id === 'friction')
    : r.forces.find((f) => f.id === 'weight');
  const opposingWork = opposingForce?.work ?? 0;

  const angle = ((r.setup.angleDeg % 360) + 360) % 360;
  const cosA = Math.cos((angle * Math.PI) / 180);

  return (
    <section
      className={`flex-shrink-0 bg-surface-container-low border-t border-outline-variant flex flex-col z-40 select-none transition-all duration-200 ${
        expanded ? 'h-96' : 'h-52'
      }`}
      data-testid="work-readout"
    >
      {/* Analysis Editor Header Tabs */}
      <div className="h-7 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container shrink-0">
        <div className="flex items-center space-x-1 h-full">
          <div className="flex items-center space-x-1 text-primary pr-2 border-r border-outline-variant mr-1">
            <span className="material-symbols-outlined text-[14px]">analytics</span>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider">ANALYSIS</span>
          </div>

          {/* Horizontal Editor Tabs */}
          <button
            type="button"
            onClick={() => handleTabChange('measurements')}
            className={`px-2.5 h-full flex items-center font-mono text-xs transition-colors ${
              activeTab === 'measurements'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Measurements
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('calculations')}
            className={`px-2.5 h-full flex items-center font-mono text-xs transition-colors ${
              activeTab === 'calculations'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Calculations
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('graphs')}
            className={`px-2.5 h-full flex items-center font-mono text-xs transition-colors ${
              activeTab === 'graphs'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Graphs (F-s)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('data')}
            className={`px-2.5 h-full flex items-center font-mono text-xs transition-colors ${
              activeTab === 'data'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Data
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('explanation')}
            className={`px-2.5 h-full flex items-center font-mono text-xs transition-colors ${
              activeTab === 'explanation'
                ? 'border-b-2 border-primary text-primary font-semibold bg-surface-container-high/60'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Explanation
          </button>
        </div>

        {/* Action Controls & Expand Button */}
        <div className="flex items-center space-x-2 text-outline font-mono text-[10px]">
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-1 hover:text-white flex items-center space-x-0.5"
            title={expanded ? 'Minimize Panel' : 'Maximize Panel'}
          >
            <span className="material-symbols-outlined text-[13px]">
              {expanded ? 'unfold_less' : 'unfold_more'}
            </span>
          </button>
          <span>•</span>
          <span className="hidden sm:inline text-on-surface font-semibold">SI (Joules)</span>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-2 sm:p-2.5 overflow-y-auto">
        {/* TAB 1: MEASUREMENTS (Stitch Bento Cards) */}
        <div className={activeTab === 'measurements' ? 'grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 h-full items-stretch' : 'hidden'}>
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
          <div className="grid grid-cols-4 gap-2 p-2 bg-surface-container rounded border border-outline-variant">
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

      {/* Very Bottom Workbench Global Status Bar (Stitch reference) */}
      <footer className="h-6 bg-surface-container-high border-t border-outline-variant px-3 sm:px-4 flex items-center justify-between text-[10px] font-mono text-outline shrink-0">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span className="text-on-surface">Engine: SPICE Mechanics Core</span>
          </span>
          <span>•</span>
          <span>Precision: 64-bit Double IEEE-754</span>
          <span>•</span>
          <span className="text-tertiary font-semibold">Status: Ready</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Units: SI (MKS)</span>
          <span className="hidden sm:inline">Memory: 42.4 MB</span>
          <span>V2.4.19-RELEASE</span>
        </div>
      </footer>
    </section>
  );
};
