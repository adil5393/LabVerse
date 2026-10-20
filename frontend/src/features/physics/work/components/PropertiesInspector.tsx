import React, { useState, useEffect } from 'react';
import {
  fmt,
  fmtSigned,
  SURFACES,
  TRACK_LENGTH,
  type WorkSetup,
  type WorkResult,
} from '../../../../engine/physics/work/workModel';

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
                      <input
                        id="field-force"
                        type="number"
                        data-field="force"
                        value={setup.forceN}
                        disabled={isForceLocked}
                        onChange={(e) => onChange({ forceN: Number(e.target.value) })}
                        aria-label="Force in N"
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
                      <input
                        id="field-mass"
                        type="number"
                        data-field="mass"
                        disabled={isCartLocked}
                        value={setup.massKg}
                        onChange={(e) => onChange({ massKg: Number(e.target.value) })}
                        aria-label="Mass in kg"
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
                      <input
                        id="field-start"
                        type="number"
                        step={0.5}
                        data-field="start"
                        disabled={isCartLocked}
                        value={setup.startPos}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(TRACK_LENGTH, Number(e.target.value)));
                          onChange({ startPos: val });
                        }}
                        aria-label="Start position in m"
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
                              <input
                                id="field-custom-mu"
                                type="number"
                                step={0.05}
                                min={0}
                                max={1.5}
                                value={currentMu}
                                disabled={isTrackLocked}
                                onChange={(e) => {
                                  const val = Math.max(0, Math.min(1.5, Number(e.target.value)));
                                  onChange({ customMu: val });
                                }}
                                aria-label="Custom coefficient of kinetic friction"
                                data-testid="field-custom-mu"
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
                      <input
                        id="field-displacement"
                        type="number"
                        step={0.5}
                        data-field="displacement"
                        disabled={isCaliperLocked}
                        value={setup.displacement}
                        onChange={(e) => onChange({ displacement: Number(e.target.value) })}
                        aria-label="Displacement in m"
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
                        onChange({
                          axis: e.target.value as WorkSetup['axis'],
                          displacement: Math.min(setup.displacement, TRACK_LENGTH - setup.startPos),
                        })
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
                      <input
                        id="field-angle"
                        type="number"
                        step={15}
                        data-field="angle"
                        value={setup.angleDeg}
                        onChange={(e) => onChange({ angleDeg: ((Number(e.target.value) % 360) + 360) % 360 })}
                        aria-label="Force angle (enrichment) in degrees"
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
