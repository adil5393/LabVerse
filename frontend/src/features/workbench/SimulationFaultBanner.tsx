import React from 'react';
import type { SimulationFault } from '../../types/simulation';

interface SimulationFaultBannerProps {
  faults: SimulationFault[];
}

export const SimulationFaultBanner: React.FC<SimulationFaultBannerProps> = ({ faults }) => {
  if (!faults || faults.length === 0) return null;

  // Filter to active serious faults (exclude generic open-circuit info unless critical)
  const activeFaults = faults.filter((f) => f.type !== 'OPEN_CIRCUIT');
  if (activeFaults.length === 0) return null;

  const fault = activeFaults[0];
  const isError = fault.severity === 'error' || fault.type === 'DIRECT_SUPPLY_SHORT';

  return (
    <div
      className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[90%] p-3.5 rounded-xl backdrop-blur-md border shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-3 duration-300 ${
        isError
          ? 'bg-rose-950/85 border-rose-500/50 text-rose-100 shadow-rose-950/50'
          : 'bg-amber-950/85 border-amber-500/50 text-amber-100 shadow-amber-950/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-1.5 rounded-lg shrink-0 ${
            isError ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isError ? 'report' : 'warning'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm tracking-tight text-white">
              {fault.type === 'DIRECT_SUPPLY_SHORT'
                ? '⚡ Direct Short Circuit Detected'
                : fault.type === 'REVERSED_LED'
                ? '🔄 Reversed LED Bias'
                : fault.type === 'OVERCURRENT'
                ? '⚠️ Excessive LED Current'
                : 'Circuit Fault'}
            </h4>
            <span
              className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                isError ? 'bg-rose-500/30 text-rose-200' : 'bg-amber-500/30 text-amber-200'
              }`}
            >
              {fault.severity}
            </span>
          </div>

          <p className="mt-1 text-xs opacity-90 leading-relaxed">{fault.message}</p>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 rounded-md px-2.5 py-1.5">
            <span className="material-symbols-outlined text-[15px] shrink-0 text-emerald-400">
              lightbulb
            </span>
            <span>
              <strong className="text-emerald-200">Remedy: </strong>
              {fault.remedy}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
