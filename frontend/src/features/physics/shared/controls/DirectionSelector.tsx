import React from 'react';
import type { Dir } from '../../../../engine/physics/forces/forceModel';

export interface DirectionSelectorProps {
  label: string;
  value: Dir;
  onChange: (d: Dir) => void;
  accentColor?: string;
  disabled?: boolean;
  compact?: boolean;
}

/**
 * DirectionSelector: High-contrast, tactile segmented control for physical force / motion directions.
 * Displays Left/Right with directional arrows (← / →), distinct active state without relying on color alone,
 * and maintains compatibility with tests via data-dir={`${label}-${dir}`}.
 */
export const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  label,
  value,
  onChange,
  accentColor = '#38bdf8',
  disabled = false,
  compact = false,
}) => {
  const options: { dir: Dir; text: string; arrow: string }[] = [
    { dir: 'left', text: 'Left', arrow: '←' },
    { dir: 'right', text: 'Right', arrow: '→' },
  ];

  const h = compact ? 'min-h-[36px]' : 'min-h-[44px]';

  return (
    <div
      role="group"
      aria-label={`Direction of ${label}`}
      className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-surface-lowest border border-surface-border w-full"
    >
      {options.map(({ dir, text, arrow }) => {
        const active = value === dir;
        return (
          <button
            key={dir}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            data-dir={`${label}-${dir}`}
            onClick={() => onChange(dir)}
            className={`${h} flex items-center justify-center gap-2 px-3 rounded-lg text-xs font-bold transition-all select-none ${
              active
                ? 'bg-surface-elevated text-white shadow-sm border'
                : 'text-slate-400 hover:text-slate-200 hover:bg-surface-card border border-transparent'
            } disabled:opacity-40 disabled:pointer-events-none`}
            style={
              active
                ? {
                    borderColor: accentColor,
                    boxShadow: `0 0 12px ${accentColor}25`,
                  }
                : undefined
            }
          >
            {active && (
              <span className="text-[10px] font-mono text-emerald-400 select-none">
                ✓
              </span>
            )}
            <span className="text-sm select-none" aria-hidden>
              {arrow}
            </span>
            <span>{text}</span>
          </button>
        );
      })}
    </div>
  );
};
