import React from 'react';

export interface LabSliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  valueBadge?: string;
  compact?: boolean;
}

/**
 * LabSlider: Unified timeline and scrubbing range slider matching WorkLab ExperimentToolbar.
 */
export const LabSlider: React.FC<LabSliderProps> = ({
  label,
  valueBadge,
  compact = false,
  className = '',
  ...props
}) => {
  const hClass = compact ? 'min-h-[32px]' : 'min-h-[44px]';

  return (
    <label className={`flex ${compact ? 'items-center gap-2' : 'flex-col gap-1.5'} text-xs text-slate-300 w-full`}>
      {(label || valueBadge) && (
        <div className="flex items-center justify-between gap-2">
          {label && <span className="font-medium text-slate-300">{label}</span>}
          {valueBadge && (
            <span className="font-mono text-[11px] text-slate-400 bg-surface-container px-1.5 py-0.5 rounded border border-surface-border/60">
              {valueBadge}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className={`w-full ${hClass} cursor-pointer accent-primary bg-surface-lowest rounded-lg transition-all ${className}`}
        {...props}
      />
    </label>
  );
};
