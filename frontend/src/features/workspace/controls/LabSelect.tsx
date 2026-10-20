import React from 'react';

export interface LabSelectOption {
  value: string | number;
  label: string;
}

export interface LabSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: LabSelectOption[];
  compact?: boolean;
  size?: 'sm' | 'md';
}

/**
 * LabSelect: Unified dropdown component matching WorkLab workstation aesthetics.
 */
export const LabSelect: React.FC<LabSelectProps> = ({
  label,
  options,
  compact = false,
  size,
  className = '',
  disabled,
  ...props
}) => {
  const isCompact = compact || size === 'sm';
  const hClass = isCompact ? 'min-h-[32px] text-xs py-1' : 'min-h-[44px] text-xs sm:text-sm py-2';

  const selectElement = (
    <div className="relative inline-flex items-center w-full">
      <select
        disabled={disabled}
        className={`w-full appearance-none rounded-lg border border-surface-border bg-surface-lowest px-2.5 pr-8 text-white font-mono font-medium transition-all focus:border-primary focus:ring-1 focus:ring-primary/40 focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${hClass} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value} className="bg-surface-card text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
        <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );

  if (!label) return selectElement;

  return (
    <label className="flex items-center justify-between gap-2 text-xs text-slate-300 font-medium w-full">
      <span className="truncate">{label}</span>
      <div className="max-w-[160px]">{selectElement}</div>
    </label>
  );
};
