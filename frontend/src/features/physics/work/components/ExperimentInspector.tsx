import React from 'react';
import { fmt, SURFACES, TRACK_LENGTH, WORK_LIMITS, type WorkSetup } from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';
import { ParameterControl } from './ParameterControl';
import { DirectionControl } from './DirectionControl';
import { CollapsibleProperties } from './CollapsibleProperties';

export interface ExperimentInspectorProps {
  setup: WorkSetup;
  onChange: (patch: Partial<WorkSetup>) => void;
  error?: string;
  showVertical: boolean;
  onShowVerticalChange: (show: boolean) => void;
}

/**
 * ExperimentInspector: Engineering workstation properties panel.
 * Groups experimental inputs into Applied Force, Force Direction, Displacement,
 * and Advanced Physical Properties.
 */
export const ExperimentInspector: React.FC<ExperimentInspectorProps> = ({
  setup,
  onChange,
  error,
  showVertical,
  onShowVerticalChange,
}) => {
  const horizontal = setup.axis === 'horizontal';
  const minDisp = -setup.startPos;
  const maxDisp = TRACK_LENGTH - setup.startPos;

  return (
    <div
      className="bg-surface-card border border-surface-border rounded-xl p-4 sm:p-5 space-y-5 shadow-sm"
      data-testid="work-controls"
    >
      {/* Inspector Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-primary">
            <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
              Experiment Inspector
            </h3>
            <p className="text-[11px] text-slate-400">
              Configure parameters & forces
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-slate-300 border border-surface-border uppercase font-semibold">
          {horizontal ? 'Horizontal Track' : 'Vertical Rail'}
        </span>
      </div>

      {/* Group 1: Applied Force */}
      <div className="space-y-1">
        <ParameterControl
          id="force"
          label="Applied Force"
          symbol="F"
          unit="N"
          value={setup.forceN}
          step={5}
          onChange={(v) => onChange({ forceN: v })}
          helperText={`0 to ${WORK_LIMITS.forceMax} N`}
        />
      </div>

      {/* Group 2: Force Direction */}
      <div className="space-y-1">
        <DirectionControl
          angleDeg={setup.angleDeg}
          onChange={(angleDeg) => onChange({ angleDeg })}
        />
      </div>

      {/* Group 3: Prescribed Displacement */}
      <div className="space-y-1">
        <ParameterControl
          id="displacement"
          label="Displacement"
          symbol="s"
          unit="m"
          value={setup.displacement}
          step={0.5}
          onChange={(v) => onChange({ displacement: v })}
          helperText={`${horizontal ? 'right' : 'up'} (+) · ${fmt(minDisp)} to ${fmt(maxDisp)} m`}
        />
      </div>

      {/* Group 4: Advanced Physical Properties */}
      <CollapsibleProperties>
        {/* Starting Conditions */}
        <div className="space-y-2">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            <span>Starting Conditions</span>
          </h5>
          <div className="grid grid-cols-1 gap-2">
            <ParameterControl
              id="start"
              label="Start Position"
              symbol="x₀"
              unit="m"
              value={setup.startPos}
              step={1}
              onChange={(v) => onChange({ startPos: v })}
              helperText={`Track length 0 to ${TRACK_LENGTH} m`}
            />
          </div>
        </div>

        {/* Object Properties */}
        <div className="space-y-2 pt-2 border-t border-surface-border/50">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Object Properties</span>
          </h5>
          <div className="grid grid-cols-1 gap-2">
            <ParameterControl
              id="mass"
              label="Object Mass"
              symbol="m"
              unit="kg"
              value={setup.massKg}
              step={1}
              onChange={(v) => onChange({ massKg: v })}
              helperText={`${WORK_LIMITS.massMin} to ${WORK_LIMITS.massMax} kg (g = 10 m/s²)`}
            />
          </div>
        </div>

        {/* Environment */}
        <div className="space-y-2 pt-2 border-t border-surface-border/50">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Environment & Friction</span>
          </h5>
          {horizontal ? (
            <label className="flex flex-col gap-1.5 text-xs text-slate-300">
              <span className="font-semibold text-slate-200">Surface Type (Friction coefficient μ)</span>
              <select
                value={setup.surfaceId}
                onChange={(e) => onChange({ surfaceId: e.target.value as WorkSetup['surfaceId'] })}
                aria-label="Surface under the object"
                data-testid="surface-select"
                className="min-h-[44px] rounded-xl border border-surface-border bg-surface-lowest px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none transition-colors"
              >
                {SURFACES.map((x) => (
                  <option key={x.id} value={x.id} className="bg-surface-card text-white">
                    {x.label} (μ = {x.mu})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              Vertical motion along low-friction rail (no lateral friction).
            </p>
          )}
        </div>

        {/* Geometry & Enrichments */}
        <div className="space-y-3 pt-2 border-t border-surface-border/50">
          <h5 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Geometry & Enrichments</span>
          </h5>

          <label className="flex flex-col gap-1.5 text-xs text-slate-300">
            <span className="font-semibold text-slate-200">Direction of Motion (Track Axis)</span>
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
              className="min-h-[44px] rounded-xl border border-surface-border bg-surface-lowest px-3 py-2 text-white font-medium focus:border-indigo-500 focus:outline-none transition-colors"
            >
              <option value="horizontal" className="bg-surface-card text-white">Horizontal track</option>
              <option value="vertical" className="bg-surface-card text-white">Vertical rail (lifting)</option>
            </select>
          </label>

          <ParameterControl
            id="angle"
            label="Force Angle (enrichment)"
            symbol="θ"
            unit="degrees"
            value={setup.angleDeg}
            step={15}
            onChange={(v) => onChange({ angleDeg: ((v % 360) + 360) % 360 })}
            helperText="0° right, 90° up, 180° left, 270° down"
          />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            At oblique angles, only the component along displacement does work: <span className="font-mono text-slate-300">W = F &middot; s &middot; cos(θ)</span> (enrichment beyond the textbook).
          </p>

          <label className="flex items-center gap-3 text-xs text-slate-300 min-h-[44px] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showVertical}
              onChange={(e) => onShowVerticalChange(e.target.checked)}
              className="w-5 h-5 rounded border-surface-border text-indigo-500 bg-surface-lowest focus:ring-indigo-500 focus:ring-offset-0"
              data-testid="show-vertical"
            />
            <span className="font-medium text-slate-200">Show weight (W) and normal force (N)</span>
          </label>
        </div>
      </CollapsibleProperties>

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          className="text-xs rounded-xl p-3.5 border flex items-start gap-2.5 shadow-sm"
          style={{
            color: '#fecdd3',
            borderColor: `${PHYS.error}80`,
            background: `${PHYS.error}14`,
          }}
          data-testid="work-error"
        >
          <svg className="w-4 h-4 shrink-0 mt-0.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <div className="flex-1 font-medium leading-relaxed">{error}</div>
        </div>
      )}
    </div>
  );
};
