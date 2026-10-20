import React from 'react';

export interface MeasurementCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  badgeText?: string;
  badgeVariant?: 'positive' | 'negative' | 'zero' | 'neutral';
  accentColor?: string;
  symbol?: string;
  testId?: string;
}

/**
 * MeasurementCard: Differentiated metric card for live scientific outputs.
 * Provides instant visual hierarchy for calculated quantities with semantic colors,
 * high contrast values, and secondary mathematical context.
 */
export const MeasurementCard: React.FC<MeasurementCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeVariant = 'neutral',
  accentColor,
  symbol,
  testId,
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
      className="bg-surface-card border border-surface-border rounded-xl p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all hover:border-slate-600/80"
      style={{
        borderTopColor: accentColor ?? undefined,
        borderTopWidth: accentColor ? '3px' : undefined,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
          {symbol && (
            <span
              className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: accentColor ?? '#6366f1' }}
            >
              {symbol}
            </span>
          )}
          <span>{title}</span>
        </span>
        {badgeText && (
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeClasses}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      <div className="my-2 flex items-baseline gap-1.5">
        <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono font-semibold text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-slate-400 font-sans truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
};
