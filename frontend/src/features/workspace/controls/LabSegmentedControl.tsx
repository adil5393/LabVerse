import React from 'react';

export interface LabSegmentOption<T extends string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
  badge?: string;
}

export interface LabSegmentedControlProps<T extends string | number> {
  options: LabSegmentOption<T>[];
  value: T;
  onChange: (val: T) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  columns?: 2 | 3 | 4 | 'auto';
  className?: string;
  ariaLabel?: string;
}

/**
 * LabSegmentedControl: Tactile multi-option segmented toggle matching WorkLab DirectionControl.
 */
export function LabSegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  size = 'md',
  columns = 'auto',
  className = '',
  ariaLabel,
}: LabSegmentedControlProps<T>): React.ReactElement {
  const hClass = size === 'sm' ? 'min-h-[32px] px-2 py-1 text-xs' : 'min-h-[44px] px-3 py-2 text-xs font-bold';

  const gridClass = {
    2: 'grid grid-cols-2 gap-1.5',
    3: 'grid grid-cols-3 gap-1.5',
    4: 'grid grid-cols-2 sm:grid-cols-4 gap-2',
    auto: 'flex flex-wrap gap-1.5',
  }[columns];

  return (
    <div role="group" aria-label={ariaLabel} className={`${gridClass} ${className}`}>
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            aria-pressed={isSelected}
            aria-label={opt.ariaLabel ?? opt.label}
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={`${hClass} rounded-xl flex items-center justify-center gap-1.5 transition-all select-none border-2 disabled:opacity-40 disabled:pointer-events-none ${
              isSelected
                ? 'bg-primary/15 text-white border-primary shadow-sm ring-1 ring-primary/40 font-bold'
                : 'bg-surface-card hover:bg-surface-elevated text-slate-300 hover:text-white border-surface-border'
            }`}
          >
            {isSelected && <span className="material-symbols-outlined text-[14px] text-primary">check</span>}
            {opt.icon && <span className="text-current">{opt.icon}</span>}
            <span>{opt.label}</span>
            {opt.badge && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-lowest text-slate-400">
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
