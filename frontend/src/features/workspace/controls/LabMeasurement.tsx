import React from 'react';

export interface LabMeasurementProps {
  title: string;
  value: string | number;
  unit?: string;
  symbol?: string;
  accentColor?: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'positive' | 'negative' | 'zero' | 'neutral';
  readoutId?: string;
  testId?: string;
  compact?: boolean;
}

/**
 * LabMeasurement: Unified scientific metric card for Analysis Dock and readouts.
 * Directly extracted from the approved WorkLab MeasurementCard design authority.
 */
export const LabMeasurement: React.FC<LabMeasurementProps> = ({
  title,
  value,
  unit,
  symbol,
  accentColor,
  subtitle,
  badgeText,
  badgeVariant = 'neutral',
  readoutId,
  testId,
  compact = false,
}) => {
  const badgeClasses = {
    positive: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    negative: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    zero: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    neutral: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  }[badgeVariant];

  return (
    <div
      data-testid={testId}
      className={`bg-surface-card border border-surface-border rounded-xl ${compact ? 'p-2.5' : 'p-3.5'} flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:border-slate-500/70`}
      style={{
        borderTopColor: accentColor ?? '#4d8eff',
        borderTopWidth: '3px',
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold flex items-center gap-1.5 truncate">
          {symbol && (
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor ?? '#4d8eff' }}
            >
              {symbol}
            </span>
          )}
          <span className="truncate">{title}</span>
        </dt>
        {badgeText && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeClasses}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className={`my-1.5 flex items-baseline gap-1.5 truncate`}>
        <dd
          data-readout={readoutId}
          className={`${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'} font-mono font-bold text-white tracking-tight leading-none truncate`}
          style={{ color: accentColor ? '#ffffff' : undefined }}
        >
          {value}
        </dd>
        {unit && (
          <span className="text-xs font-mono font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
          {subtitle}
        </div>
      )}
    </div>
  );
};
