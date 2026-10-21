import React, { useState } from 'react';

export interface ModelAssumptionsProps {
  summary?: string;
  assumptions: string[];
  limits?: {
    massRange?: [number, number];
    forceRange?: [number, number];
    velocityRange?: [number, number];
    timeRange?: [number, number];
  };
  className?: string;
}

/**
 * ModelAssumptions: Clean disclosure component that displays a single concise visible
 * sentence for scientific transparency while organizing full physical constraints (gravity,
 * friction model, horizontal axis, air resistance) inside an expandable "About this model" panel.
 */
export const ModelAssumptions: React.FC<ModelAssumptionsProps> = ({
  summary = 'This experiment uses an idealized physical model.',
  assumptions,
  limits,
  className = '',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border border-surface-border bg-surface-lowest/60 text-xs text-slate-300 overflow-hidden transition-all ${className}`}
      data-testid="model-assumptions"
    >
      <div className="p-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <span
            className="material-symbols-outlined text-sm text-sky-400 mt-0.5 shrink-0 select-none"
            aria-hidden
          >
            info
          </span>
          <p className="text-[11px] text-slate-300 leading-normal">{summary}</p>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className="text-[11px] font-mono text-sky-400 hover:text-sky-300 flex items-center gap-1 shrink-0 font-semibold transition-colors focus:outline-none"
        >
          <span>{open ? 'Hide details' : 'About this model'}</span>
          <span
            className="material-symbols-outlined text-[13px] transition-transform duration-200 select-none"
            style={{ transform: open ? 'rotate(180deg)' : 'none' }}
            aria-hidden
          >
            expand_more
          </span>
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-surface-border/50 bg-surface-card/40 space-y-2">
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300 leading-relaxed">
            {assumptions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          {limits && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 border-t border-surface-border/40 text-[10px] font-mono text-slate-400">
              {limits.massRange && (
                <span>
                  Mass: {limits.massRange[0]} to {limits.massRange[1]} kg
                </span>
              )}
              {limits.forceRange && (
                <span>
                  Force: up to {limits.forceRange[1]} N
                </span>
              )}
              {limits.velocityRange && (
                <span>
                  Velocity: {limits.velocityRange[0]} to {limits.velocityRange[1]} m/s
                </span>
              )}
              {limits.timeRange && (
                <span>
                  Time: 0 to {limits.timeRange[1]} s
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
