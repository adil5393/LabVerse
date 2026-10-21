import React from 'react';

export interface ExperimentSetupGroupProps {
  title: string;
  icon?: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  columns?: 1 | 2;
  className?: string;
  testId?: string;
}

/**
 * ExperimentSetupGroup: Pedagogical container that groups experiment parameters
 * by their scientific role (e.g. "Cart Setup", "Applied Forces", "Motion Setup").
 * Automatically adapts between single-column mobile stacking and responsive multi-column desktop layouts.
 */
export const ExperimentSetupGroup: React.FC<ExperimentSetupGroupProps> = ({
  title,
  icon,
  description,
  badge,
  badgeColor,
  children,
  columns = 1,
  className = '',
  testId,
}) => {
  return (
    <section
      className={`rounded-xl border border-surface-border bg-surface-card/60 p-3.5 space-y-3 transition-colors ${className}`}
      data-testid={testId}
    >
      <header className="flex items-center justify-between gap-2 border-b border-surface-border/50 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className="material-symbols-outlined text-base text-sky-400 shrink-0 select-none"
              aria-hidden
            >
              {icon}
            </span>
          )}
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-slate-200 truncate">
            {title}
          </h4>
        </div>
        {badge && (
          <span
            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border border-surface-border/80 shrink-0"
            style={{
              color: badgeColor ?? '#94a3b8',
              backgroundColor: badgeColor ? `${badgeColor}15` : 'transparent',
            }}
          >
            {badge}
          </span>
        )}
      </header>

      {description && (
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      )}

      <div
        className={
          columns === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 items-start'
            : 'space-y-3'
        }
      >
        {children}
      </div>
    </section>
  );
};
