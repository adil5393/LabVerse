import React from 'react';

export interface MobileToggleItem {
  id: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  activeColor?: string;
  badge?: string;
}

export interface MobileLabToolbarProps {
  toggles?: MobileToggleItem[];
  /** Optional summary status text (e.g., "m: 2kg · F: 10N") */
  statusText?: string;
  /** Optional callback to open parameter drawer */
  onOpenParameters?: () => void;
  /** Label for parameter drawer button (defaults to "Parameters") */
  parameterButtonLabel?: string;
  /** Optional secondary quick actions/chips (e.g. Surface: Wood, Params button) */
  secondaryRow?: React.ReactNode;
}

/**
 * MobileLabToolbar: Mobile display toggles and parameter launcher strip.
 * Features:
 * - High-contrast pill toggle buttons with glowing active LED indicators (>= 44px height).
 * - Optional status text and parameter inspector trigger button.
 * - Optional second row for quick environment/parameter chips and inspector trigger.
 */
export const MobileLabToolbar: React.FC<MobileLabToolbarProps> = ({
  toggles = [],
  statusText,
  onOpenParameters,
  parameterButtonLabel = 'Parameters',
  secondaryRow,
}) => {
  return (
    <div
      className="w-full bg-surface-container-low border-b border-outline-variant p-2.5 space-y-2 select-none shrink-0"
      data-testid="mobile-lab-toolbar"
    >
      {/* Primary Toggles Grid */}
      {toggles.length > 0 && (
        <div className={`grid gap-2 ${toggles.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {toggles.map((t) => {
          const color = t.activeColor || '#38bdf8';
          return (
            <button
              key={t.id}
              type="button"
              role="switch"
              aria-checked={t.active}
              data-toggle={t.id}
              onClick={t.onToggle}
              className={`min-h-[44px] px-3.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all touch-manipulation active:scale-[0.98] ${
                t.active
                  ? 'border-opacity-80 bg-opacity-15 shadow-sm'
                  : 'border-outline-variant bg-surface-container text-slate-400'
              }`}
              style={{
                borderColor: t.active ? color : undefined,
                backgroundColor: t.active ? `${color}18` : undefined,
                color: t.active ? 'rgb(var(--lv-ink))' : undefined,
              }}
            >
              <span className="truncate">{t.label}</span>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {t.badge && (
                  <span className="text-[10px] font-mono px-1 rounded bg-black/30 text-slate-300">
                    {t.badge}
                  </span>
                )}
                <span
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    backgroundColor: t.active ? color : '#475569',
                    boxShadow: t.active ? `0 0 8px ${color}` : 'none',
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* Status & Parameter Button Strip */}
      {(statusText || onOpenParameters) && (
        <div className="flex items-center justify-between gap-2 pt-0.5 text-xs">
          {statusText && (
            <span className="font-mono text-[11px] text-slate-300 truncate">
              {statusText}
            </span>
          )}
          {onOpenParameters && (
            <button
              type="button"
              onClick={onOpenParameters}
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-variant active:scale-95 text-xs font-semibold text-primary shrink-0 flex items-center gap-1.5 transition-transform touch-manipulation ml-auto shadow-sm"
              data-testid="mobile-open-parameters"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>{parameterButtonLabel}</span>
            </button>
          )}
        </div>
      )}

      {/* Secondary Environment / Parameter Strip */}
      {secondaryRow && (
        <div className="w-full pt-0.5 text-xs">
          {secondaryRow}
        </div>
      )}
    </div>
  );
};
