import React, { useState, useEffect } from 'react';
import {
  fmt,
  fmtSigned,
  SURFACES,
  TRACK_LENGTH,
  type WorkSetup,
  type WorkResult,
} from '../../../../engine/physics/work/workModel';
import { NumberInput } from './NumberInput';

export interface PropertiesInspectorProps {
  setup: WorkSetup;
  result: WorkResult;
  onChange: (patch: Partial<WorkSetup>) => void;
  error?: string;
  showVertical: boolean;
  onShowVerticalChange: (show: boolean) => void;
  beginnerMode?: boolean;
  selectedObjectId?: string | null;
  lockMap?: Record<string, boolean>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  compact?: boolean;
}

const DIRS = [
  { label: 'Right (0°)', angle: 0, aria: 'Force to the right' },
  { label: 'Left (180°)', angle: 180, aria: 'Force to the left' },
  { label: 'Up (90°)', angle: 90, aria: 'Force upwards' },
  { label: 'Down (270°)', angle: 270, aria: 'Force downwards' },
];

/**
 * PropertiesInspector: Blender Properties Editor style panel matching Stitch design.
 * Features collapsible sidebar (releases width to simulation viewport), grouped property cards,
 * full friction editing (presets + custom dimensionless coefficient), synchronized entity headers,
 * and functional data export.
 */
export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  setup,
  result: r,
  onChange,
  error,
  showVertical,
  onShowVerticalChange,
  beginnerMode = false,
  selectedObjectId = null,
  lockMap = {},
  collapsed = false,
  onToggleCollapse,
  compact = false,
}) => {
  const [activeInspectorTab, setActiveInspectorTab] = useState<'all' | 'physics' | 'object' | 'env' | 'scene'>('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync active tab with outliner/viewport selection
  useEffect(() => {
    if (selectedObjectId === 'force' || selectedObjectId === 'F_APP') setActiveInspectorTab('physics');
    else if (selectedObjectId === 'cart' || selectedObjectId === 'CART_01') setActiveInspectorTab('object');
    else if (selectedObjectId === 'track' || selectedObjectId === 'Linear_Track') setActiveInspectorTab('env');
    else if (selectedObjectId === 'caliper' || selectedObjectId === 'DISP_01') setActiveInspectorTab('scene');
  }, [selectedObjectId]);

  const horizontal = setup.axis === 'horizontal';
  const angle = ((setup.angleDeg % 360) + 360) % 360;
  const pressedDir = DIRS.find((d) => d.angle === angle);

  const frictionForce = r.forces.find((f) => f.id === 'friction');
  const frictionMag = frictionForce ? frictionForce.magnitude : 0;
  const surfaceObj = SURFACES.find((s) => s.id === setup.surfaceId);
  const currentMu = setup.surfaceId === 'custom' && typeof setup.customMu === 'number'
    ? setup.customMu
    : surfaceObj?.mu ?? 0;

  const normalForce = r.forces.find((f) => f.id === 'normal');
  const normalMag = normalForce ? normalForce.magnitude : Math.max(0, setup.massKg * 10 - setup.forceN * Math.sin((setup.angleDeg * Math.PI) / 180));

  const isForceLocked = lockMap.force ?? false;
  const isCartLocked = lockMap.cart ?? false;
  const isTrackLocked = lockMap.track ?? false;
  const isCaliperLocked = lockMap.caliper ?? false;

  const handleExportData = () => {
    const summary = [
      `LabVerse Chapter 7: Work Laboratory`,
      `====================================`,
      `Applied Force (F_app): ${setup.forceN} N @ ${setup.angleDeg}°`,
      `Cart Mass (m): ${setup.massKg} kg`,
      `Surface: ${surfaceObj?.label ?? 'Default'} (μ_k = ${currentMu})`,
      `Normal Force (N): ${fmt(normalMag)} N`,
      `Kinetic Friction (f_k): ${fmt(frictionMag)} N`,
      `Displacement (s): ${setup.displacement} m`,
      `------------------------------------`,
      `Applied Work (W_app): ${fmtSigned(r.appliedWork)} J`,
      `Friction Work (W_f): ${fmtSigned(frictionForce?.work ?? 0)} J`,
      `Net Work (W_net): ${fmtSigned(r.netWork)} J`,
    ].join('\n');

    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const showForces = activeInspectorTab === 'all' || activeInspectorTab === 'physics';
  const showObject = activeInspectorTab === 'all' || activeInspectorTab === 'object';
  const showEnv = activeInspectorTab === 'all' || activeInspectorTab === 'env';
  const showExperiment = activeInspectorTab === 'all' || activeInspectorTab === 'scene';

  // Mobile / Compact presentation inside drawer or small screens
  if (compact) {
    return (
      <div className="w-full max-w-full space-y-3 pb-4 select-none font-sans" data-testid="work-controls">
        {/* Header / Active entity info */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
            <span className="font-mono text-[11px] tracking-wider uppercase text-on-surface font-bold truncate">
              {selectedObjectId ? `ENTITY: ${selectedObjectId.toUpperCase()}` : 'WORK PARAMETERS'}
            </span>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface-variant text-tertiary font-bold">
              {beginnerMode ? 'BEGINNER' : 'ADVANCED'}
            </span>
            <button
              type="button"
              onClick={handleExportData}
              className="p-1 rounded text-outline hover:text-on-surface active:bg-surface-variant transition-colors"
              title="Copy Work Data"
              aria-label="Copy data summary"
            >
              <span className="material-symbols-outlined text-[16px]">{copied ? 'done' : 'content_copy'}</span>
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" role="tablist" aria-label="Work parameter tabs">
          {[
            { id: 'all', label: 'All', icon: 'tune' },
            { id: 'physics', label: 'Force (F)', icon: 'trending_up' },
            { id: 'object', label: 'Cart (m)', icon: 'deployed_code' },
            { id: 'env', label: 'Surface (μ)', icon: 'texture' },
            { id: 'scene', label: 'Displacement', icon: 'straighten' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeInspectorTab === tab.id}
              onClick={() => setActiveInspectorTab(tab.id as any)}
              className={`min-h-[38px] px-3 py-1 rounded-xl border text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors touch-manipulation ${
                activeInspectorTab === tab.id
                  ? 'bg-primary/20 border-primary text-primary font-bold shadow-xs'
                  : 'bg-surface-card border-surface-border text-slate-300 active:bg-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 1. FORCES CARD */}
        {showForces && (
          <div className={`rounded-xl border bg-surface-card overflow-hidden transition-colors ${
            selectedObjectId === 'force' || selectedObjectId === 'F_APP'
              ? 'border-primary ring-1 ring-primary/40'
              : 'border-surface-border'
          }`}>
            <div className="px-3 py-2 bg-surface-container border-b border-surface-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">trending_up</span>
                <span>Applied Force (F<sub>app</sub>)</span>
              </span>
              {isForceLocked && <span className="material-symbols-outlined text-[14px] text-amber-400">lock</span>}
            </div>

            <div className="p-3 space-y-3 font-mono text-xs">
              {/* Force Stepper & Direct Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans">
                  <span>Magnitude</span>
                  <span className="text-primary font-bold">{setup.forceN} N</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isForceLocked || setup.forceN <= 0}
                    onClick={() => onChange({ forceN: Math.max(0, Math.round((setup.forceN - 5) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Decrease force by 5 N"
                  >
                    −5
                  </button>
                  <div className="flex-1 min-h-[44px] flex items-center justify-center px-3 rounded-xl border border-surface-border bg-surface-lowest focus-within:border-primary">
                    <NumberInput
                      id="field-force"
                      dataField="force"
                      value={setup.forceN}
                      disabled={isForceLocked}
                      onCommit={(v) => onChange({ forceN: v })}
                      ariaLabel="Force in N"
                      className="bg-transparent border-0 p-0 text-center font-mono text-base font-bold text-white w-full focus:ring-0 focus:outline-none disabled:opacity-50"
                    />
                    <span className="text-slate-400 text-xs ml-1">N</span>
                  </div>
                  <button
                    type="button"
                    disabled={isForceLocked || setup.forceN >= 100}
                    onClick={() => onChange({ forceN: Math.min(100, Math.round((setup.forceN + 5) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Increase force by 5 N"
                  >
                    +5
                  </button>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={setup.forceN}
                  disabled={isForceLocked}
                  onChange={(e) => onChange({ forceN: Number(e.target.value) })}
                  className="w-full h-2 bg-surface-lowest rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                  aria-label="Force slider"
                />
              </div>

              {/* Direction Grid */}
              <div className="space-y-1.5 pt-1 border-t border-surface-border/60">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans">
                  <span>Direction of Force</span>
                  {!pressedDir && (
                    <span className="text-amber-300 font-mono text-[10px]" data-testid="custom-angle">
                      custom angle {fmt(setup.angleDeg)}°
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5" role="group" aria-label="Direction of the force">
                  {DIRS.map((d) => (
                    <button
                      key={d.angle}
                      type="button"
                      disabled={isForceLocked}
                      aria-pressed={pressedDir?.angle === d.angle}
                      aria-label={d.aria}
                      data-dir={d.angle}
                      onClick={() => onChange({ angleDeg: d.angle })}
                      className={`min-h-[44px] px-2 rounded-xl border text-center font-mono text-xs font-semibold flex items-center justify-center gap-1 transition-all disabled:opacity-50 touch-manipulation ${
                        pressedDir?.angle === d.angle
                          ? 'border-primary bg-primary/20 text-primary shadow-xs font-bold'
                          : 'border-surface-border bg-surface-lowest text-slate-300 active:bg-surface-variant'
                      }`}
                    >
                      {pressedDir?.angle === d.angle ? '✓ ' : ''}
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kinetic friction info */}
              {!beginnerMode && (
                <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans">Kinetic Friction (f<sub>k</sub>):</span>
                  <span className="font-bold text-amber-400">{fmt(frictionMag)} N</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. OBJECT / CART CARD */}
        {showObject && (
          <div className={`rounded-xl border bg-surface-card overflow-hidden transition-colors ${
            selectedObjectId === 'cart' || selectedObjectId === 'CART_01'
              ? 'border-primary ring-1 ring-primary/40'
              : 'border-surface-border'
          }`}>
            <div className="px-3 py-2 bg-surface-container border-b border-surface-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-secondary">deployed_code</span>
                <span>Cart Mass & Position</span>
              </span>
              {isCartLocked && <span className="material-symbols-outlined text-[14px] text-amber-400">lock</span>}
            </div>

            <div className="p-3 space-y-3 font-mono text-xs">
              {/* Mass Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans">
                  <span>Cart Mass (m)</span>
                  <span className="text-secondary font-bold">{setup.massKg} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isCartLocked || setup.massKg <= 0.5}
                    onClick={() => onChange({ massKg: Math.max(0.5, Math.round((setup.massKg - 0.5) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Decrease mass by 0.5 kg"
                  >
                    −0.5
                  </button>
                  <div className="flex-1 min-h-[44px] flex items-center justify-center px-3 rounded-xl border border-surface-border bg-surface-lowest focus-within:border-primary">
                    <NumberInput
                      id="field-mass"
                      dataField="mass"
                      value={setup.massKg}
                      disabled={isCartLocked}
                      onCommit={(v) => onChange({ massKg: Math.max(0.5, v) })}
                      ariaLabel="Mass in kg"
                      className="bg-transparent border-0 p-0 text-center font-mono text-base font-bold text-white w-full focus:ring-0 focus:outline-none disabled:opacity-50"
                    />
                    <span className="text-slate-400 text-xs ml-1">kg</span>
                  </div>
                  <button
                    type="button"
                    disabled={isCartLocked || setup.massKg >= 50}
                    onClick={() => onChange({ massKg: Math.min(50, Math.round((setup.massKg + 0.5) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Increase mass by 0.5 kg"
                  >
                    +0.5
                  </button>
                </div>
                {/* Preset mass chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 5, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      disabled={isCartLocked}
                      onClick={() => onChange({ massKg: m })}
                      className={`flex-1 min-h-[34px] rounded-lg border text-xs font-mono font-semibold transition-all touch-manipulation ${
                        setup.massKg === m
                          ? 'border-secondary bg-secondary/20 text-secondary'
                          : 'border-surface-border bg-surface-lowest text-slate-300'
                      }`}
                    >
                      {m}kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Position */}
              <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between">
                <label htmlFor="field-start" className="text-slate-300 text-[11px] font-sans">
                  Start Position (x<sub>0</sub>)
                </label>
                <div className="flex items-center bg-surface-lowest border border-surface-border rounded-lg px-2.5 min-h-[38px] w-28 justify-between">
                  <NumberInput
                    id="field-start"
                    dataField="start"
                    value={setup.startPos}
                    disabled={isCartLocked}
                    onCommit={(v) => onChange({ startPos: Math.max(0, Math.min(TRACK_LENGTH, v)) })}
                    ariaLabel="Start position in m"
                    className="bg-transparent border-0 p-0 text-right font-mono text-xs text-white w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
                  />
                  <span className="text-slate-400 font-mono text-[11px]">m</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. ENVIRONMENT & FRICTION CARD */}
        {showEnv && (
          <div className={`rounded-xl border bg-surface-card overflow-hidden transition-colors ${
            selectedObjectId === 'track' || selectedObjectId === 'Linear_Track'
              ? 'border-primary ring-1 ring-primary/40'
              : 'border-surface-border'
          }`}>
            <div className="px-3 py-2 bg-surface-container border-b border-surface-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-tertiary">texture</span>
                <span>Track Surface & Friction</span>
              </span>
              {isTrackLocked && <span className="material-symbols-outlined text-[14px] text-amber-400">lock</span>}
            </div>

            <div className="p-3 space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans">
                  <span>Surface Material</span>
                  <span className="text-tertiary font-bold">
                    {surfaceObj?.label ?? 'Custom'} (μ<sub>k</sub> = {currentMu.toFixed(2)})
                  </span>
                </div>

                {/* Surface select dropdown */}
                <select
                  value={setup.surfaceId}
                  disabled={isTrackLocked}
                  onChange={(e) => {
                    const newSurface = e.target.value as WorkSetup['surfaceId'];
                    if (newSurface === 'custom') {
                      onChange({ surfaceId: 'custom', customMu: setup.customMu ?? 0.4 });
                    } else {
                      onChange({ surfaceId: newSurface });
                    }
                  }}
                  aria-label="Surface friction selection"
                  data-testid="surface-select"
                  className="w-full min-h-[44px] rounded-xl border border-surface-border bg-surface-lowest px-3 py-2 text-xs text-white font-mono focus:border-primary focus:outline-none disabled:opacity-50"
                >
                  {SURFACES.map((x) => (
                    <option key={x.id} value={x.id} className="bg-surface-card text-white">
                      {x.label} {x.id !== 'custom' ? `(μ = ${x.mu})` : ''}
                    </option>
                  ))}
                </select>

                {/* Tactile Surface Quick Chips */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {SURFACES.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      disabled={isTrackLocked}
                      onClick={() => {
                        if (x.id === 'custom') onChange({ surfaceId: 'custom', customMu: setup.customMu ?? 0.4 });
                        else onChange({ surfaceId: x.id });
                      }}
                      className={`min-h-[38px] px-2 rounded-lg border text-[11px] font-sans truncate transition-all touch-manipulation ${
                        setup.surfaceId === x.id
                          ? 'border-tertiary bg-tertiary/20 text-tertiary font-bold'
                          : 'border-surface-border bg-surface-lowest text-slate-300 active:bg-surface-variant'
                      }`}
                    >
                      {x.label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Custom Friction Slider */}
                {setup.surfaceId === 'custom' && (
                  <div className="pt-2 border-t border-surface-border/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="field-custom-mu" className="text-slate-300 text-[11px] font-sans">
                        Kinetic Coeff. (μ<sub>k</sub>)
                      </label>
                      <div className="flex items-center bg-surface-lowest border border-surface-border rounded-lg px-2 min-h-[34px] w-24 justify-between">
                        <NumberInput
                          id="field-custom-mu"
                          testId="field-custom-mu"
                          value={currentMu}
                          disabled={isTrackLocked}
                          onCommit={(v) => onChange({ customMu: Math.max(0, Math.min(1.5, v)) })}
                          ariaLabel="Custom coefficient of kinetic friction"
                          className="bg-transparent border-0 p-0 text-right font-mono text-xs text-white w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
                        />
                        <span className="text-slate-400 font-mono text-[10px] ml-1">μ</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={currentMu}
                      disabled={isTrackLocked}
                      onChange={(e) => onChange({ customMu: Number(e.target.value) })}
                      className="w-full h-2 bg-surface-lowest rounded-lg appearance-none cursor-pointer accent-tertiary"
                    />
                  </div>
                )}

                {/* Accounting breakdown */}
                <div className="pt-2 border-t border-surface-border/60 grid grid-cols-2 gap-2 text-[10px] text-slate-300 font-mono">
                  <div className="p-2 rounded-lg bg-surface-lowest border border-surface-border/40">
                    <span className="text-slate-400 block text-[9px] uppercase">Normal Force (N)</span>
                    <span className="text-white font-bold">{fmt(normalMag)} N</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-lowest border border-surface-border/40">
                    <span className="text-slate-400 block text-[9px] uppercase">Friction Work (W_f)</span>
                    <span className="text-amber-400 font-bold">{fmtSigned(frictionForce?.work ?? 0)} J</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. EXPERIMENT / DISPLACEMENT CARD */}
        {showExperiment && (
          <div className={`rounded-xl border bg-surface-card overflow-hidden transition-colors ${
            selectedObjectId === 'caliper' || selectedObjectId === 'DISP_01'
              ? 'border-primary ring-1 ring-primary/40'
              : 'border-surface-border'
          }`}>
            <div className="px-3 py-2 bg-surface-container border-b border-surface-border flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-white font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-amber-400">straighten</span>
                <span>Displacement (Δx / s)</span>
              </span>
              {isCaliperLocked && <span className="material-symbols-outlined text-[14px] text-amber-400">lock</span>}
            </div>

            <div className="p-3 space-y-3 font-mono text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans">
                  <span>Target Distance</span>
                  <span className="text-amber-400 font-bold">{setup.displacement} m</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isCaliperLocked || setup.displacement <= 0}
                    onClick={() => onChange({ displacement: Math.max(0, Math.round((setup.displacement - 1) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Decrease displacement by 1 m"
                  >
                    −1
                  </button>
                  <div className="flex-1 min-h-[44px] flex items-center justify-center px-3 rounded-xl border border-surface-border bg-surface-lowest focus-within:border-primary">
                    <NumberInput
                      id="field-displacement"
                      dataField="displacement"
                      value={setup.displacement}
                      disabled={isCaliperLocked}
                      onCommit={(v) => onChange({ displacement: Math.max(0, v) })}
                      ariaLabel="Displacement in m"
                      className="bg-transparent border-0 p-0 text-center font-mono text-base font-bold text-amber-400 w-full focus:ring-0 focus:outline-none disabled:opacity-50"
                    />
                    <span className="text-slate-400 text-xs ml-1">m</span>
                  </div>
                  <button
                    type="button"
                    disabled={isCaliperLocked || setup.displacement >= TRACK_LENGTH}
                    onClick={() => onChange({ displacement: Math.min(TRACK_LENGTH, Math.round((setup.displacement + 1) * 10) / 10) })}
                    className="min-h-[44px] min-w-[44px] rounded-xl border border-surface-border bg-surface-lowest hover:bg-surface-variant text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all disabled:opacity-40"
                    aria-label="Increase displacement by 1 m"
                  >
                    +1
                  </button>
                </div>
                {/* Preset distance chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  {[2, 4, 6, 8, 10].map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      disabled={isCaliperLocked}
                      onClick={() => onChange({ displacement: dist })}
                      className={`flex-1 min-h-[34px] rounded-lg border text-xs font-mono font-semibold transition-all touch-manipulation ${
                        setup.displacement === dist
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                          : 'border-surface-border bg-surface-lowest text-slate-300'
                      }`}
                    >
                      {dist}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. ADVANCED PROPERTIES ACCORDION */}
        {!beginnerMode && (
          <details
            className="rounded-xl border border-surface-border bg-surface-card overflow-hidden"
            data-testid="work-more"
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="min-h-[44px] px-3.5 flex items-center justify-between text-slate-200 hover:text-white cursor-pointer select-none font-mono text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">tune</span>
                <span>Advanced Parameters (Axis & Angle)</span>
              </span>
              <span className="material-symbols-outlined text-[18px]">
                {advancedOpen ? 'expand_less' : 'expand_more'}
              </span>
            </summary>

            <div className="p-3 pt-2 space-y-3 border-t border-surface-border text-xs font-mono">
              {/* Direction of motion */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-sans">Track Orientation</span>
                <select
                  value={setup.axis}
                  onChange={(e) => {
                    const axis = e.target.value as WorkSetup['axis'];
                    const along = axis === 'horizontal' ? angle === 90 || angle === 270 : angle === 0 || angle === 180;
                    onChange({
                      axis,
                      displacement: Math.min(setup.displacement, TRACK_LENGTH - setup.startPos),
                      ...(along ? { angleDeg: axis === 'horizontal' ? 0 : 90 } : {}),
                    });
                  }}
                  aria-label="Direction of motion"
                  data-testid="axis-select"
                  className="w-full min-h-[44px] rounded-xl border border-surface-border bg-surface-lowest px-3 py-2 text-xs text-white"
                >
                  <option value="horizontal">Horizontal track</option>
                  <option value="vertical">Vertical rail (lifting)</option>
                </select>
              </div>

              {/* Force Angle Input */}
              <div className="flex items-center justify-between pt-1">
                <label htmlFor="field-angle" className="text-slate-300 text-[11px] font-sans">
                  Force Angle (θ)
                </label>
                <div className="flex items-center bg-surface-lowest border border-surface-border rounded-lg px-2.5 min-h-[38px] w-28 justify-between">
                  <NumberInput
                    id="field-angle"
                    dataField="angle"
                    value={setup.angleDeg}
                    onCommit={(v) => onChange({ angleDeg: ((v % 360) + 360) % 360 })}
                    ariaLabel="Force angle (enrichment) in degrees"
                    className="bg-transparent border-0 p-0 text-right font-mono text-xs text-white w-14 focus:ring-0 focus:outline-none"
                  />
                  <span className="text-slate-400 font-mono text-[11px]">°</span>
                </div>
              </div>

              {/* Show Vertical Forces Toggle */}
              <label className="min-h-[44px] flex items-center gap-3 pt-1 text-xs text-slate-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showVertical}
                  onChange={(e) => onShowVerticalChange(e.target.checked)}
                  data-testid="show-vertical"
                  className="w-5 h-5 rounded border-surface-border bg-surface-lowest text-primary focus:ring-0"
                />
                <span>Show weight & normal force</span>
              </label>
            </div>
          </details>
        )}

        {/* Live Work Calculation Formula Banner */}
        <div className="p-3 rounded-xl border border-primary/40 bg-primary/10 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span className="text-primary uppercase tracking-wider text-[11px]">Net Work Result</span>
            <span className="text-emerald-400 text-sm">{fmtSigned(r.netWork)} J</span>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            W<sub>net</sub> = (F<sub>app</sub> · cosθ − f<sub>k</sub>) × s = {fmt(r.netWork)} J
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl border border-error/50 bg-error/10 text-error text-xs font-mono flex items-start space-x-2"
            data-testid="work-error"
          >
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }

  // If collapsed: render only the narrow 40px icon rail with expand button
  if (collapsed) {
    return (
      <aside
        className="w-10 flex-shrink-0 bg-surface-container border-l border-outline-variant flex flex-col items-center py-2 space-y-2 z-30 select-none h-full"
        data-testid="work-controls"
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-primary hover:bg-surface-variant transition-colors"
          title="Expand Properties Inspector (N)"
          aria-label="Expand Properties Inspector"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        <div className="h-px w-6 bg-outline-variant/60 my-1" />

        <button
          type="button"
          onClick={() => {
            setActiveInspectorTab('physics');
            onToggleCollapse?.();
          }}
          className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          title="Forces (Click to expand)"
        >
          <span className="material-symbols-outlined text-[18px]">trending_up</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveInspectorTab('object');
            onToggleCollapse?.();
          }}
          className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          title="Cart Object (Click to expand)"
        >
          <span className="material-symbols-outlined text-[18px]">deployed_code</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveInspectorTab('env');
            onToggleCollapse?.();
          }}
          className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          title="Environment & Friction (Click to expand)"
        >
          <span className="material-symbols-outlined text-[18px]">texture</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveInspectorTab('scene');
            onToggleCollapse?.();
          }}
          className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          title="Experiment Parameters (Click to expand)"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>
      </aside>
    );
  }

  // Expanded Inspector (268px properties panel + 40px icon rail = 308px)
  return (
    <aside
      className="w-[308px] flex-shrink-0 bg-surface-container-low flex z-30 select-none h-full border-l border-outline-variant"
      data-testid="work-controls"
    >
      {/* Grouped Properties Scroll Area (268px wide) */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto border-r border-outline-variant">
        <div>
          {/* Inspector Header with Collapse Button and Active Entity */}
          <div className="h-8 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container">
            <div className="flex items-center space-x-1.5 truncate max-w-[190px]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface-variant font-bold truncate">
                {selectedObjectId ? `ENTITY: ${selectedObjectId.toUpperCase()}` : 'RIG_WORK_ENERGY_01'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-variant text-tertiary">
                {beginnerMode ? 'BEGINNER' : 'ADVANCED'}
              </span>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-0.5 rounded text-outline hover:text-white hover:bg-surface-container-high transition-colors"
                title="Collapse Inspector (N)"
                aria-label="Collapse Properties Inspector"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Grouped Property Cards */}
          <div className="p-2.5 space-y-2.5">
            {/* GROUP: FORCES */}
            {showForces && (
              <div className={`border rounded bg-surface-container-lowest overflow-hidden transition-colors ${
                selectedObjectId === 'force' || selectedObjectId === 'F_APP'
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline-variant'
              }`}>
                <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[13px] text-primary">trending_up</span>
                    <span>FORCES (F_APP)</span>
                  </span>
                  {isForceLocked && (
                    <span className="material-symbols-outlined text-[13px] text-amber-400" title="Force parameters locked">lock</span>
                  )}
                </div>

                <div className="p-2.5 space-y-2 text-xs font-mono">
                  {/* Applied Force Input */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="field-force" className="text-on-surface-variant text-[11px]">
                      Applied Force (F_app)
                    </label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 focus-within:border-primary w-28 justify-between">
                      <NumberInput
 id="field-force"
 dataField="force"
 value={setup.forceN}
 disabled={isForceLocked}
 onCommit={(v) => onChange({ forceN: v })}
 ariaLabel="Force in N"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-16 focus:ring-0 focus:outline-none disabled:opacity-50"
 />
                      <span className="text-outline font-mono text-[11px] ml-1">N</span>
                    </div>
                  </div>

                  {/* Direction Segmented Control */}
                  <div className="space-y-1 pt-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-outline">Direction</span>
                      {!pressedDir && (
                        <span className="text-amber-300 font-mono" data-testid="custom-angle">
                          custom angle {fmt(setup.angleDeg)}&deg;
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-surface-container-high border border-outline-variant rounded p-1 text-[10px]" role="group" aria-label="Direction of the force">
                      {DIRS.map((d) => (
                        <button
                          key={d.angle}
                          type="button"
                          disabled={isForceLocked}
                          aria-pressed={pressedDir?.angle === d.angle}
                          aria-label={d.aria}
                          data-dir={d.angle}
                          onClick={() => onChange({ angleDeg: d.angle })}
                          className={`px-1.5 py-1 rounded text-center font-mono font-semibold transition-all disabled:opacity-50 ${
                            pressedDir?.angle === d.angle
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                          }`}
                        >
                          {pressedDir?.angle === d.angle ? '✓ ' : ''}
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {!beginnerMode && (
                    <>
                      <div className="h-px bg-outline-variant/50 my-1" />
                      {/* Kinetic Friction Readout */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-on-surface-variant text-[11px]">Kinetic Friction (f_k)</div>
                          <div className="text-[9px] text-outline font-mono">
                            μ_k = {currentMu.toFixed(2)} • N = {fmt(normalMag)} N
                          </div>
                        </div>
                        <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                          <span className="font-mono text-xs text-error font-semibold">{fmt(frictionMag)}</span>
                          <span className="text-outline font-mono text-[11px] ml-1">N</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* GROUP: OBJECT */}
            {showObject && (
              <div className={`border rounded bg-surface-container-lowest overflow-hidden transition-colors ${
                selectedObjectId === 'cart' || selectedObjectId === 'CART_01'
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline-variant'
              }`}>
                <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[13px] text-secondary">deployed_code</span>
                    <span>OBJECT: CART_01</span>
                  </span>
                  {isCartLocked && (
                    <span className="material-symbols-outlined text-[13px] text-amber-400" title="Cart parameters locked">lock</span>
                  )}
                </div>

                <div className="p-2.5 space-y-2 text-xs font-mono">
                  {/* Cart Mass */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="field-mass" className="text-on-surface-variant text-[11px]">
                      Cart Mass (m)
                    </label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                      <NumberInput
 id="field-mass"
 dataField="mass"
 value={setup.massKg}
 disabled={isCartLocked}
 onCommit={(v) => onChange({ massKg: v })}
 ariaLabel="Mass in kg"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
 />
                      <span className="text-outline font-mono text-[11px]">kg</span>
                    </div>
                  </div>

                  {/* Initial Position (Editable x_0) */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="field-start" className="text-on-surface-variant text-[11px]">
                      Initial Position (x_0)
                    </label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                      <NumberInput
 id="field-start"
 dataField="start"
 value={setup.startPos}
 disabled={isCartLocked}
 onCommit={(v) => onChange({ startPos: Math.max(0, Math.min(TRACK_LENGTH, v)) })}
 ariaLabel="Start position in m"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
 />
                      <span className="text-outline font-mono text-[11px]">m</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GROUP: ENVIRONMENT & FULL FRICTION CONFIGURATION */}
            {showEnv && (
              <div className={`border rounded bg-surface-container-lowest overflow-hidden transition-colors ${
                selectedObjectId === 'track' || selectedObjectId === 'Linear_Track'
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline-variant'
              }`}>
                <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[13px] text-tertiary">texture</span>
                    <span>ENVIRONMENT & FRICTION</span>
                  </span>
                  {isTrackLocked && (
                    <span className="material-symbols-outlined text-[13px] text-amber-400" title="Environment locked">lock</span>
                  )}
                </div>

                <div className="p-2.5 space-y-2 text-xs font-mono">
                  <div className="flex flex-col space-y-0.5">
                    <span className="text-[10px] text-outline">Track Model</span>
                    <span className="text-[11px] text-on-surface">1D Linear Track (L = {TRACK_LENGTH}m)</span>
                  </div>

                  {horizontal && (
                    <div className="flex flex-col space-y-1.5 pt-1">
                      <span className="text-[10px] text-outline">Surface Friction Mode</span>
                      <select
                        value={setup.surfaceId}
                        disabled={isTrackLocked}
                        onChange={(e) => {
                          const newSurface = e.target.value as WorkSetup['surfaceId'];
                          if (newSurface === 'custom') {
                            onChange({ surfaceId: 'custom', customMu: setup.customMu ?? 0.4 });
                          } else {
                            onChange({ surfaceId: newSurface });
                          }
                        }}
                        aria-label="Surface friction selection"
                        data-testid="surface-select"
                        className="min-h-[32px] rounded border border-outline-variant bg-surface-container-high px-2 py-1 text-xs text-white font-mono focus:border-primary focus:outline-none disabled:opacity-50"
                      >
                        {SURFACES.map((x) => (
                          <option key={x.id} value={x.id} className="bg-surface-card text-white">
                            {x.label} {x.id !== 'custom' ? `(μ = ${x.mu})` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Custom Friction Slider and Input */}
                      {setup.surfaceId === 'custom' && (
                        <div className="pt-1.5 pb-1 space-y-2 border-t border-outline-variant/60">
                          <div className="flex items-center justify-between">
                            <label htmlFor="field-custom-mu" className="text-on-surface-variant text-[11px]">
                              Kinetic Coeff. (μ_k)
                            </label>
                            <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                              <NumberInput
 id="field-custom-mu"
 testId="field-custom-mu"
 value={currentMu}
 disabled={isTrackLocked}
 onCommit={(v) => onChange({ customMu: Math.max(0, Math.min(1.5, v)) })}
 ariaLabel="Custom coefficient of kinetic friction"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
 />
                              <span className="text-outline font-mono text-[10px] ml-1">μ</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="range"
                              min={0}
                              max={1.5}
                              step={0.05}
                              value={currentMu}
                              disabled={isTrackLocked}
                              onChange={(e) => onChange({ customMu: Number(e.target.value) })}
                              className="w-full h-1.5 bg-surface-container rounded appearance-none cursor-pointer accent-primary"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-outline font-mono">
                            <span>0.00 (Smooth)</span>
                            <span className="text-primary font-bold">μ_k = {currentMu.toFixed(2)}</span>
                            <span>1.50 (High)</span>
                          </div>
                        </div>
                      )}

                      {/* Physics Accounting for Friction */}
                      <div className="pt-1 border-t border-outline-variant/40 space-y-1 text-[10px] font-mono">
                        <div className="flex justify-between text-outline">
                          <span>Normal Force (N):</span>
                          <span className="text-on-surface font-semibold">{fmt(normalMag)} N</span>
                        </div>
                        <div className="flex justify-between text-outline">
                          <span>Friction Force (f_k):</span>
                          <span className="text-error font-semibold">{fmt(frictionMag)} N</span>
                        </div>
                        <div className="flex justify-between text-outline">
                          <span>Friction Work (W_f):</span>
                          <span className="text-error font-semibold">{fmtSigned(frictionForce?.work ?? 0)} J</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* GROUP: EXPERIMENT PARAMETERS */}
            {showExperiment && (
              <div className={`border rounded bg-surface-container-lowest overflow-hidden transition-colors ${
                selectedObjectId === 'caliper' || selectedObjectId === 'DISP_01'
                  ? 'border-primary ring-1 ring-primary/40'
                  : 'border-outline-variant'
              }`}>
                <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[13px] text-primary">science</span>
                    <span>EXPERIMENT (DISP_01)</span>
                  </span>
                  {isCaliperLocked && (
                    <span className="material-symbols-outlined text-[13px] text-amber-400" title="Displacement locked">lock</span>
                  )}
                </div>

                <div className="p-2.5 space-y-2 text-xs font-mono">
                  {/* Target Displacement Input */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="field-displacement" className="text-on-surface-variant text-[11px]">
                      Displacement (Δx / s)
                    </label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                      <NumberInput
 id="field-displacement"
 dataField="displacement"
 value={setup.displacement}
 disabled={isCaliperLocked}
 onCommit={(v) => onChange({ displacement: v })}
 ariaLabel="Displacement in m"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-tertiary font-semibold w-14 focus:ring-0 focus:outline-none disabled:opacity-50"
 />
                      <span className="text-outline font-mono text-[11px]">m</span>
                    </div>
                  </div>

                  {!beginnerMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant text-[11px]">Net Force (F_net)</span>
                      <span className="font-mono text-xs text-primary font-semibold">
                        {fmtSigned(r.applied.alongAxis - (horizontal ? (frictionForce ? frictionForce.fx : 0) : 0))} N
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Accordion: Advanced Properties (shown in Advanced Mode) */}
            {!beginnerMode && (
              <details
                className="border border-outline-variant/60 rounded bg-surface-container-high/40 overflow-hidden"
                data-testid="work-more"
                open={advancedOpen}
                onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
              >
                <summary className="px-3 py-1.5 flex items-center justify-between text-outline hover:text-on-surface cursor-pointer select-none font-mono text-[10px] tracking-wider uppercase">
                  <span className="flex items-center space-x-1.5">
                    <span className="material-symbols-outlined text-[14px]">tune</span>
                    <span>Advanced Properties</span>
                  </span>
                  <span className="material-symbols-outlined text-[14px]">
                    {advancedOpen ? 'expand_less' : 'chevron_right'}
                  </span>
                </summary>

                <div className="p-2.5 pt-1 space-y-2 border-t border-outline-variant/40 text-xs font-mono">
                  {/* Direction of motion */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-outline">Direction of motion</span>
                    <select
                      value={setup.axis}
                      onChange={(e) =>
                        {
                          const axis = e.target.value as WorkSetup['axis'];
                          // A force perpendicular to the new axis does no work, so turn a cardinal force to follow it.
                          const along = axis === 'horizontal' ? angle === 90 || angle === 270 : angle === 0 || angle === 180;
                          onChange({
                            axis,
                            displacement: Math.min(setup.displacement, TRACK_LENGTH - setup.startPos),
                            ...(along ? { angleDeg: axis === 'horizontal' ? 0 : 90 } : {}),
                          });
                        }
                      }
                      aria-label="Direction of motion"
                      data-testid="axis-select"
                      className="w-full min-h-[30px] rounded border border-outline-variant bg-surface-container px-2 py-1 text-xs text-white"
                    >
                      <option value="horizontal">Horizontal track</option>
                      <option value="vertical">Vertical rail (lifting)</option>
                    </select>
                  </div>

                  {/* Force Angle Input */}
                  <div className="flex items-center justify-between pt-1">
                    <label htmlFor="field-angle" className="text-on-surface-variant text-[11px]">
                      Force Angle (θ)
                    </label>
                    <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                      <NumberInput
 id="field-angle"
 dataField="angle"
 value={setup.angleDeg}
 onCommit={(v) => onChange({ angleDeg: ((v % 360) + 360) % 360 })}
 ariaLabel="Force angle (enrichment) in degrees"
 className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none"
 />
                      <span className="text-outline font-mono text-[11px]">°</span>
                    </div>
                  </div>

                  {/* Show Vertical Forces Toggle */}
                  <label className="flex items-center space-x-2 pt-1 text-[11px] text-on-surface cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showVertical}
                      onChange={(e) => onShowVerticalChange(e.target.checked)}
                      data-testid="show-vertical"
                      className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary focus:ring-0"
                    />
                    <span>Show weight & normal force</span>
                  </label>
                </div>
              </details>
            )}

            {/* Error Alert Banner */}
            {error && (
              <div
                role="alert"
                className="p-2.5 rounded border border-error/50 bg-error/10 text-error text-xs font-mono flex items-start space-x-1.5"
                data-testid="work-error"
              >
                <span className="material-symbols-outlined text-[15px] shrink-0 mt-0.5">error</span>
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Inspector Footer info */}
        <div className="p-1.5 border-t border-outline-variant bg-surface-container-lowest text-center">
          <span className="font-mono text-[9px] text-outline">
            INTEGRATOR: Work-Kinematics Model (NCERT Ch. 7)
          </span>
        </div>
      </div>

      {/* Vertical Blender-style Icon Strip (Right Edge, 40px wide) */}
      <div className="w-10 bg-surface-container border-l border-outline-variant flex flex-col items-center py-2 space-y-2">
        <button
          type="button"
          onClick={() => setActiveInspectorTab('all')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'all'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Show All Properties"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab('physics')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'physics'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Physics / Force Properties"
        >
          <span className="material-symbols-outlined text-[18px]">trending_up</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab('object')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'object'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Object / Cart Properties"
        >
          <span className="material-symbols-outlined text-[18px]">deployed_code</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab('env')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'env'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Environment & Friction Properties"
        >
          <span className="material-symbols-outlined text-[18px]">texture</span>
        </button>

        <div className="h-px w-6 bg-outline-variant/60 my-1" />

        {/* Functional Export Data Action */}
        <button
          type="button"
          onClick={handleExportData}
          className={`p-1.5 rounded transition-colors ${
            copied ? 'bg-emerald-500 text-white' : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title={copied ? 'Data Copied to Clipboard!' : 'Copy Experiment Data Summary'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? 'check' : 'output'}
          </span>
        </button>
      </div>
    </aside>
  );
};
