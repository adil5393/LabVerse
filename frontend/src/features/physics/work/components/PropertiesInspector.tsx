import React, { useState } from 'react';
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
}

const DIRS = [
  { label: 'Right (0°)', angle: 0, aria: 'Force to the right' },
  { label: 'Left (180°)', angle: 180, aria: 'Force to the left' },
  { label: 'Up (90°)', angle: 90, aria: 'Force upwards' },
  { label: 'Down (270°)', angle: 270, aria: 'Force downwards' },
];

/**
 * PropertiesInspector: Blender Properties Editor style panel matching Stitch design.
 * Features 268px grouped cards for FORCES, OBJECT, ENVIRONMENT, EXPERIMENT,
 * ADVANCED PROPERTIES accordion, and vertical 40px icon tab strip.
 */
export const PropertiesInspector: React.FC<PropertiesInspectorProps> = ({
  setup,
  result: r,
  onChange,
  error,
  showVertical,
  onShowVerticalChange,
}) => {
  const [activeInspectorTab, setActiveInspectorTab] = useState<'physics' | 'object' | 'env' | 'scene'>('physics');
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const horizontal = setup.axis === 'horizontal';
  const angle = ((setup.angleDeg % 360) + 360) % 360;
  const pressedDir = DIRS.find((d) => d.angle === angle);

  const frictionForce = r.forces.find((f) => f.id === 'friction');
  const frictionMag = frictionForce ? frictionForce.magnitude : 0;
  const surfaceObj = SURFACES.find((s) => s.id === setup.surfaceId);

  return (
    <aside
      className="w-[308px] flex-shrink-0 bg-surface-container-low flex z-30 select-none h-full border-l border-outline-variant"
      data-testid="work-controls"
    >
      {/* Grouped Properties Scroll Area (268px wide) */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto border-r border-outline-variant">
        <div>
          {/* Inspector Header */}
          <div className="h-8 px-3 border-b border-outline-variant flex items-center justify-between bg-surface-container">
            <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface-variant font-semibold truncate max-w-[170px]">
              RIG_WORK_ENERGY_01
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-surface-variant text-tertiary">
              PHYS_1D_KIN
            </span>
          </div>

          {/* Grouped Property Cards */}
          <div className="p-2.5 space-y-2.5">
            {/* GROUP: FORCES */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
              <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">trending_up</span>
                  <span>FORCES</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">expand_less</span>
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
                      onChange={(e) => onChange({ forceN: Number(e.target.value) })}
                      aria-label="Force in N"
                      className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-16 focus:ring-0 focus:outline-none"
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
                        aria-pressed={pressedDir?.angle === d.angle}
                        aria-label={d.aria}
                        data-dir={d.angle}
                        onClick={() => onChange({ angleDeg: d.angle })}
                        className={`px-1.5 py-1 rounded text-center font-mono font-semibold transition-all ${
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

                <div className="h-px bg-outline-variant/50 my-1" />

                {/* Kinetic Friction Readout */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-on-surface-variant text-[11px]">Kinetic Friction (f_k)</div>
                    <div className="text-[9px] text-outline font-mono">
                      μ = {surfaceObj ? surfaceObj.mu : '0.00'} • N = {fmt(r.setup.massKg * 10)} N
                    </div>
                  </div>
                  <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                    <span className="font-mono text-xs text-error font-semibold">{fmt(frictionMag)}</span>
                    <span className="text-outline font-mono text-[11px] ml-1">N</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP: OBJECT */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
              <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[13px] text-secondary">deployed_code</span>
                  <span>OBJECT: CART_01</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">expand_less</span>
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
                      value={setup.massKg}
                      onChange={(e) => onChange({ massKg: Number(e.target.value) })}
                      aria-label="Mass in kg"
                      className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-outline font-mono text-[11px]">kg</span>
                  </div>
                </div>

                {/* Initial Position */}
                <div className="flex items-center justify-between">
                  <label htmlFor="field-start" className="text-on-surface-variant text-[11px]">
                    Initial Position (x_0)
                  </label>
                  <div className="flex items-center bg-surface-container-high border border-outline-variant rounded px-2 py-0.5 w-24 justify-between">
                    <input
                      id="field-start"
                      type="number"
                      data-field="start"
                      value={setup.startPos}
                      onChange={(e) => onChange({ startPos: Number(e.target.value) })}
                      aria-label="Start position in m"
                      className="bg-transparent border-0 p-0 text-right font-mono text-xs text-on-surface w-14 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-outline font-mono text-[11px]">m</span>
                  </div>
                </div>
              </div>
            </div>

            {/* GROUP: ENVIRONMENT */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
              <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">public</span>
                  <span>ENVIRONMENT</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">expand_less</span>
              </div>

              <div className="p-2.5 space-y-2 text-xs font-mono">
                <div className="flex flex-col space-y-0.5">
                  <span className="text-[10px] text-outline">Track Model</span>
                  <span className="text-[11px] text-on-surface">1D Linear Track (L = {TRACK_LENGTH}m)</span>
                </div>

                {horizontal && (
                  <div className="flex flex-col space-y-1 pt-1">
                    <span className="text-[10px] text-outline">Surface Pair</span>
                    <select
                      value={setup.surfaceId}
                      onChange={(e) => onChange({ surfaceId: e.target.value as WorkSetup['surfaceId'] })}
                      aria-label="Surface under the object"
                      data-testid="surface-select"
                      className="min-h-[32px] rounded border border-outline-variant bg-surface-container-high px-2 py-1 text-xs text-white font-mono focus:border-primary focus:outline-none"
                    >
                      {SURFACES.map((x) => (
                        <option key={x.id} value={x.id} className="bg-surface-card text-white">
                          {x.label} (μ = {x.mu})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* GROUP: EXPERIMENT PARAMETERS */}
            <div className="border border-outline-variant rounded bg-surface-container-lowest overflow-hidden">
              <div className="px-3 py-1.5 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center space-x-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">science</span>
                  <span>EXPERIMENT</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-outline">expand_less</span>
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
                      value={setup.displacement}
                      onChange={(e) => onChange({ displacement: Number(e.target.value) })}
                      aria-label="Displacement in m"
                      className="bg-transparent border-0 p-0 text-right font-mono text-xs text-tertiary font-semibold w-14 focus:ring-0 focus:outline-none"
                    />
                    <span className="text-outline font-mono text-[11px]">m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant text-[11px]">Net Force (F_net)</span>
                  <span className="font-mono text-xs text-primary font-semibold">
                    {fmtSigned(r.applied.alongAxis - (horizontal ? (frictionForce ? frictionForce.fx : 0) : 0))} N
                  </span>
                </div>
              </div>
            </div>

            {/* Accordion: Advanced Properties */}
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
            INTEGRATOR: RK4 Adaptive (eps: 1e-6)
          </span>
        </div>
      </div>

      {/* Vertical Blender-style Icon Strip (Right Edge, 40px wide) */}
      <div className="w-10 bg-surface-container border-l border-outline-variant flex flex-col items-center py-2 space-y-2">
        <button
          type="button"
          onClick={() => setActiveInspectorTab('scene')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'scene'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Scene Properties"
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
          title="Physics Properties"
        >
          <span className="material-symbols-outlined text-[18px]">science</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveInspectorTab('object')}
          className={`p-1.5 rounded transition-colors ${
            activeInspectorTab === 'object'
              ? 'bg-primary text-on-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-variant'
          }`}
          title="Object Properties"
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
          title="Material & Track Properties"
        >
          <span className="material-symbols-outlined text-[18px]">texture</span>
        </button>

        <div className="h-px w-6 bg-outline-variant/60 my-1" />

        <button
          type="button"
          className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-variant transition-colors"
          title="Output / Export Data"
        >
          <span className="material-symbols-outlined text-[18px]">output</span>
        </button>
      </div>
    </aside>
  );
};
