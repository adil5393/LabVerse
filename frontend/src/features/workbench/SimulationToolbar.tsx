import React from 'react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

export const SimulationToolbar: React.FC = () => {
  const { simulationSettings, setSimulationSettings, simulationResult, resetSimulation } =
    useWorkbenchStore();

  const isRunning = simulationSettings.isRunning;
  const showCurrentFlow = simulationSettings.showCurrentFlow;
  const showVoltage = simulationSettings.showVoltage;
  const speed = simulationSettings.animationSpeed;

  const subcircuits = simulationResult?.subcircuits || [];
  const conductingSubs = subcircuits.filter((s) => s.status === 'conducting');
  const [showDropdown, setShowDropdown] = React.useState(false);

  const status = simulationResult?.status;

  return (
    <div className="circuit-toolbar absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-[#161b26]/90 backdrop-blur-md border border-[#2d3748] shadow-2xl text-xs select-none max-w-[calc(100%-1rem)] overflow-x-auto no-scrollbar">
      {/* 1. Run / Pause Visualization */}
      <button
        onClick={() => setSimulationSettings({ isRunning: !isRunning })}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all shrink-0 ${
          isRunning
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
        }`}
        title={isRunning ? 'Pause electrical animation' : 'Resume electrical animation'}
      >
        <span className="material-symbols-outlined text-[15px]">
          {isRunning ? 'pause' : 'play_arrow'}
        </span>
        <span>{isRunning ? 'Running' : 'Paused'}</span>
      </button>

      {/* 2. Reset Button */}
      <button
        onClick={resetSimulation}
        className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors shrink-0"
        title="Reset simulation visual settings"
      >
        <span className="material-symbols-outlined text-[15px]">restart_alt</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-700 mx-0.5 shrink-0" />

      {/* 3. Show Current Flow Toggle */}
      <button
        onClick={() => setSimulationSettings({ showCurrentFlow: !showCurrentFlow })}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all shrink-0 ${
          showCurrentFlow
            ? 'bg-[#4d8eff]/25 text-[#79a9ff] border border-[#4d8eff]/40 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
        title="Toggle conventional current particle flow animation"
      >
        <span className="material-symbols-outlined text-[15px]">electric_bolt</span>
        <span className="hidden sm:inline">Current Flow</span>
        <span className="sm:hidden">Current</span>
      </button>

      {/* 4. Show Voltage Toggle */}
      <button
        onClick={() => setSimulationSettings({ showVoltage: !showVoltage })}
        className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all shrink-0 ${
          showVoltage
            ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`}
        title="Toggle node voltage gradient visualization"
      >
        <span className="material-symbols-outlined text-[15px]">speed</span>
        <span className="hidden sm:inline">Voltage</span>
        <span className="sm:hidden">Volt</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-700 mx-0.5 shrink-0" />

      {/* 5. Animation Speed Selector */}
      <div className="flex items-center bg-slate-900/60 rounded-full p-0.5 border border-slate-700/60">
        {([0.5, 1.0, 2.0] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSimulationSettings({ animationSpeed: s })}
            className={`px-2 py-0.5 rounded-full text-[11px] font-mono transition-all ${
              speed === s
                ? 'bg-[#4d8eff] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* 6. Authoritative Status Telemetry Pill with Per-Circuit Summary */}
      {status && (
        <div className="relative">
          <div className="w-[1px] h-4 bg-slate-700 mx-0.5 inline-block align-middle" />
          <button
            onClick={() => conductingSubs.length > 1 && setShowDropdown(!showDropdown)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] cursor-pointer transition-all ${
              status === 'solved'
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                : status === 'fault'
                ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 animate-pulse'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status === 'solved'
                  ? 'bg-emerald-400'
                  : status === 'fault'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {status === 'solved'
                ? conductingSubs.length > 1
                  ? `${conductingSubs.length} Circuits Running`
                  : `I = ${(conductingSubs[0]?.currentA ? conductingSubs[0].currentA * 1000 : (simulationResult?.branchCurrents?.[0]?.currentA ?? 0) * 1000).toFixed(2)} mA`
                : status === 'fault'
                ? 'FAULT DETECTED'
                : 'OPEN LOOP'}
            </span>
            {conductingSubs.length > 1 && (
              <span className="material-symbols-outlined text-[13px] ml-0.5 opacity-80">
                {showDropdown ? 'expand_less' : 'expand_more'}
              </span>
            )}
          </button>

          {/* Multi-Circuit Telemetry Popover Dropdown */}
          {showDropdown && conductingSubs.length > 1 && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-[#111622]/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-2.5 space-y-2 z-50 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5 px-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Active Circuits Telemetry
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                  {conductingSubs.length} Online
                </span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {conductingSubs.map((sub, idx) => (
                  <div
                    key={sub.subcircuitId}
                    className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 font-mono text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-white">
                      <span>Circuit {idx + 1} ({sub.sourceInstanceId || 'DC Source'})</span>
                      <span className="text-emerald-400">{(sub.currentA * 1000).toFixed(2)} mA</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Source: {sub.sourceVoltageV.toFixed(2)} V</span>
                      <span>LED: {sub.ledStates[0]?.illuminated ? 'ON' : 'OFF'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
