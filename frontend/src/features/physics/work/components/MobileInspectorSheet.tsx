import React from 'react';
import {
  fmtSigned,
  SURFACES,
  type WorkSetup,
  type WorkResult,
} from '../../../../engine/physics/work/workModel';

export interface MobileInspectorSheetProps {
  isOpen: boolean;
  onClose: () => void;
  setup: WorkSetup;
  result: WorkResult;
  onChange: (patch: Partial<WorkSetup>) => void;
  error?: string;
  showVertical: boolean;
  onShowVerticalChange: (val: boolean) => void;
}

const DIRS = [
  { label: 'Right (0°)', angle: 0 },
  { label: 'Left (180°)', angle: 180 },
  { label: 'Up (90°)', angle: 90 },
  { label: 'Down (270°)', angle: 270 },
];

/**
 * MobileInspectorSheet: Mobile bottom sheet drawer matching Stitch mobile references
 * (labverse_mobile_workstation_390px_closed_sheet & inspector_open).
 * Provides comfortable touch targets for configuring forces, mass, displacement, and environment.
 */
export const MobileInspectorSheet: React.FC<MobileInspectorSheetProps> = ({
  isOpen,
  onClose,
  setup,
  result: _r,
  onChange,
  error,
  showVertical,
  onShowVerticalChange,
}) => {
  if (!isOpen) return null;

  const horizontal = setup.axis === 'horizontal';
  const angle = ((setup.angleDeg % 360) + 360) % 360;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[420px] max-h-[85vh] bg-surface-container-low border-t border-outline-variant rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Grab Handle */}
        <div className="w-full flex justify-center pt-2.5 pb-1">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2 border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Properties Inspector
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-white hover:bg-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Sheet Content Scroll Area */}
        <div className="p-4 space-y-4 overflow-y-auto font-mono text-xs">
          {/* FORCES GROUP */}
          <div className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
              1. Applied Force
            </span>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Force (F)</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onChange({ forceN: Math.max(0, setup.forceN - 5) })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  -
                </button>
                <div className="px-2 py-1 min-w-[50px] text-center font-bold text-white bg-surface-container rounded border border-outline-variant">
                  {setup.forceN} N
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ forceN: setup.forceN + 5 })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-outline">Direction</span>
              <div className="grid grid-cols-2 gap-1.5">
                {DIRS.map((d) => (
                  <button
                    key={d.angle}
                    type="button"
                    onClick={() => onChange({ angleDeg: d.angle })}
                    className={`py-2 px-2 rounded text-xs font-semibold border transition-all ${
                      angle === d.angle
                        ? 'bg-primary text-on-primary border-primary shadow-xs'
                        : 'bg-surface-container border-outline-variant text-on-surface-variant'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DISPLACEMENT & OBJECT */}
          <div className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-3">
            <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider">
              2. Displacement & Mass
            </span>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Displacement (s)</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onChange({ displacement: Math.round((setup.displacement - 0.5) * 10) / 10 })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  -
                </button>
                <div className="px-2 py-1 min-w-[60px] text-center font-bold text-tertiary bg-surface-container rounded border border-outline-variant">
                  {fmtSigned(setup.displacement)} m
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ displacement: Math.round((setup.displacement + 0.5) * 10) / 10 })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-on-surface-variant">Cart Mass (m)</span>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => onChange({ massKg: Math.max(1, setup.massKg - 1) })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  -
                </button>
                <div className="px-2 py-1 min-w-[50px] text-center font-bold text-white bg-surface-container rounded border border-outline-variant">
                  {setup.massKg} kg
                </div>
                <button
                  type="button"
                  onClick={() => onChange({ massKg: setup.massKg + 1 })}
                  className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* ENVIRONMENT & ADVANCED */}
          <div className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest space-y-2">
            <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
              3. Environment & Axis
            </span>

            {horizontal && (
              <label className="flex flex-col space-y-1">
                <span className="text-outline text-[10px]">Track Surface</span>
                <select
                  value={setup.surfaceId}
                  onChange={(e) => onChange({ surfaceId: e.target.value as WorkSetup['surfaceId'] })}
                  className="min-h-[36px] rounded border border-outline-variant bg-surface-container px-2 py-1 text-white font-mono"
                >
                  {SURFACES.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.label} (μ = {x.mu})
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="flex items-center space-x-2 pt-2 text-on-surface cursor-pointer">
              <input
                type="checkbox"
                checked={showVertical}
                onChange={(e) => onShowVerticalChange(e.target.checked)}
                className="w-4 h-4 rounded border-outline-variant bg-surface-container text-primary"
              />
              <span className="text-[11px]">Show weight and normal force</span>
            </label>
          </div>

          {error && (
            <div className="p-2.5 rounded bg-error/15 border border-error text-error text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Sheet Footer CTA */}
        <div className="p-3 border-t border-outline-variant bg-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-mono text-xs font-bold shadow-md"
          >
            Apply & Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
