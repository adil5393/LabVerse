import React from 'react';
import { fmt } from '../../../../engine/physics/work/workModel';
import { PHYS } from '../../motion/physicsColors';

export interface DirectionControlProps {
  angleDeg: number;
  onChange: (angleDeg: number) => void;
  disabled?: boolean;
}

const DIRS: { label: string; angle: number; aria: string; arrow: string }[] = [
  { label: '→ Right', angle: 0, aria: 'Force to the right', arrow: '→' },
  { label: '← Left', angle: 180, aria: 'Force to the left', arrow: '←' },
  { label: '↑ Up', angle: 90, aria: 'Force upwards', arrow: '↑' },
  { label: '↓ Down', angle: 270, aria: 'Force downwards', arrow: '↓' },
];

/**
 * DirectionControl: Compact 4-way direction selector with clear visual hierarchy,
 * accessible keyboard support, touch targets, and support for enrichment angles.
 */
export const DirectionControl: React.FC<DirectionControlProps> = ({
  angleDeg,
  onChange,
  disabled = false,
}) => {
  const normalized = ((angleDeg % 360) + 360) % 360;
  const pressed = DIRS.find((d) => d.angle === normalized);

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <label className="font-semibold text-slate-200 flex items-center gap-1.5">
          <span className="font-mono px-1.5 py-0.5 rounded text-[11px] font-bold bg-surface-elevated text-indigo-400 border border-surface-border">
            θ
          </span>
          <span>Force Direction</span>
        </label>
        {!pressed ? (
          <span className="text-xs text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30" data-testid="custom-angle">
            custom angle {fmt(angleDeg)}&deg;
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-mono">
            {normalized}&deg; relative to axis
          </span>
        )}
      </div>

      <div
        role="group"
        aria-label="Direction of the force"
        className="grid grid-cols-2 sm:grid-cols-4 gap-2"
      >
        {DIRS.map((d) => {
          const isSelected = pressed?.angle === d.angle;
          return (
            <button
              key={d.angle}
              type="button"
              aria-pressed={isSelected}
              aria-label={d.aria}
              data-dir={d.angle}
              disabled={disabled}
              onClick={() => onChange(d.angle)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all select-none border-2 ${
                isSelected
                  ? 'bg-indigo-500/15 text-white shadow-sm ring-1 ring-indigo-500/40'
                  : 'bg-surface-card hover:bg-surface-elevated text-slate-300 hover:text-white border-surface-border'
              }`}
              style={{
                borderColor: isSelected ? PHYS.force : undefined,
              }}
            >
              {isSelected ? '✓ ' : ''}
              {d.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
