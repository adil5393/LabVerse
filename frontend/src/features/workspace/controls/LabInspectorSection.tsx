import React, { useState } from 'react';

export interface LabInspectorSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  locked?: boolean;
  testId?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * LabInspectorSection: Styled section card for workstation Properties Inspector.
 * Reusable primitive matching WorkLab CollapsibleProperties and PropertiesInspector group headers.
 */
export const LabInspectorSection: React.FC<LabInspectorSectionProps> = ({
  title,
  subtitle,
  icon,
  collapsible = false,
  defaultOpen = true,
  badge,
  locked = false,
  testId,
  children,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className={`rounded-xl border border-surface-border bg-surface-lowest/50 overflow-hidden transition-colors ${className}`} data-testid={testId}>
        <div className="px-3 py-2 bg-surface-container border-b border-surface-border flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider uppercase text-on-surface font-semibold flex items-center gap-1.5">
            {icon && <span className="text-primary flex items-center">{icon}</span>}
            <span>{title}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {locked && (
              <span className="material-symbols-outlined text-[13px] text-amber-400" title="Parameters locked">
                lock
              </span>
            )}
            {badge}
          </div>
        </div>
        <div className="p-3 space-y-2.5">
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
          {children}
        </div>
      </div>
    );
  }

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className={`group rounded-xl border border-surface-border bg-surface-lowest/50 overflow-hidden transition-all ${className}`}
      data-testid={testId}
    >
      <summary className="cursor-pointer min-h-[44px] flex items-center justify-between px-3.5 py-2.5 select-none list-none [&::-webkit-details-marker]:hidden hover:bg-surface-elevated/40 active:bg-surface-high/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-primary shrink-0">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              <span>{title}</span>
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-400 font-sans">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
          {badge}
          <span className="text-[10px] font-mono uppercase tracking-wider hidden sm:inline">
            <span className="group-open:hidden">Expand</span>
            <span className="hidden group-open:inline">Collapse</span>
          </span>
          <svg
            className="w-4 h-4 transform group-open:rotate-180 transition-transform duration-200 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </summary>

      <div className="p-3.5 pt-2 border-t border-surface-border/60 bg-surface-card/40 space-y-3">
        {children}
      </div>
    </details>
  );
};
