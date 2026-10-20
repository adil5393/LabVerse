import React from 'react';

export interface CollapsiblePropertiesProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * CollapsibleProperties: A styled, collapsible accordion for secondary physical properties.
 * Features an engineered instrument appearance, settings slider icon, status chevron,
 * and high-contrast grouping for Starting Conditions, Object Properties, Environment,
 * and Geometry.
 */
export const CollapsibleProperties: React.FC<CollapsiblePropertiesProps> = ({
  title = 'Advanced Physical Properties',
  subtitle = 'Mass, track limits, friction surface, motion axis & enrichment angle',
  children,
  defaultOpen = false,
}) => {
  return (
    <details
      className="group rounded-xl border border-surface-border bg-surface-lowest/50 transition-all overflow-hidden"
      data-testid="work-more"
      open={defaultOpen ? true : undefined}
    >
      <summary className="cursor-pointer min-h-[48px] flex items-center justify-between p-3.5 select-none list-none [&::-webkit-details-marker]:hidden hover:bg-surface-elevated/40 active:bg-surface-high/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-surface-border flex items-center justify-center text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
              <line x1="1" y1="14" x2="7" y2="14" />
              <line x1="9" y1="8" x2="15" y2="8" />
              <line x1="17" y1="16" x2="23" y2="16" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-2">
              <span>{title}</span>
            </h4>
            {subtitle && (
              <p className="text-[11px] text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-200 transition-colors">
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
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </summary>

      <div className="p-4 pt-3 border-t border-surface-border/60 bg-surface-card/40 space-y-4">
        {children}
      </div>
    </details>
  );
};
