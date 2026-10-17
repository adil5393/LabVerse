/**
 * Top Toolbar for States of Matter Workbench
 *
 * Provides navigation, experiment mode switching, play/pause, simulation speed,
 * reset actions, and fullscreen support.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useChemistryStore } from '../../store/useChemistryStore';
import type { SimulationSpeedOption } from '../../engine/chemistry/types';

export const ChemistryToolbar: React.FC = () => {
  const {
    config,
    togglePlayPause,
    setSimulationSpeed,
    resetExperiment,
    experimentMode,
    setExperimentMode,
  } = useChemistryStore();

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const speedOptions: SimulationSpeedOption[] = [0.25, 0.5, 1.0, 2.0];

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border px-4 lg:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left: Navigation & Experiment Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/chemistry"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Chemistry Curriculum"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="hidden sm:inline">Chemistry Hub</span>
        </Link>

        <div className="h-5 w-px bg-surface-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <span className="material-symbols-outlined text-[18px]">bubble_chart</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>States of Matter Simulator</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-lowest text-emerald-400 border border-emerald-500/30 font-semibold hidden md:inline">
                Class 9
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Mode Selector (Guided vs Free Explore) */}
      <div className="flex items-center p-0.5 rounded-xl bg-surface-lowest border border-surface-border">
        <button
          onClick={() => setExperimentMode('guided')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
            experimentMode === 'guided'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Guided Experiment: Heating Water from -20°C ice to steam"
        >
          <span className="material-symbols-outlined text-[15px]">school</span>
          <span>Guided: Heating Water</span>
        </button>

        <button
          onClick={() => setExperimentMode('explore')}
          className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
            experimentMode === 'explore'
              ? 'bg-primary text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Free Exploration Mode: Customize parameters freely"
        >
          <span className="material-symbols-outlined text-[15px]">explore</span>
          <span>Free Explore</span>
        </button>
      </div>

      {/* Right: Simulation Controls (Play/Pause, Speed, Reset, Fullscreen) */}
      <div className="flex items-center gap-2">
        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
            config.isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white animate-pulse'
              : 'bg-surface-lowest hover:bg-surface-elevated border-surface-border text-slate-200'
          }`}
          title={config.isPaused ? 'Resume Simulation' : 'Pause Simulation'}
        >
          <span className="material-symbols-outlined text-[18px]">
            {config.isPaused ? 'play_arrow' : 'pause'}
          </span>
          <span className="hidden sm:inline">{config.isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-surface-lowest p-0.5 rounded-xl border border-surface-border">
          {speedOptions.map((spd) => (
            <button
              key={spd}
              onClick={() => setSimulationSpeed(spd)}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                config.simulationSpeed === spd
                  ? 'bg-surface-card text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Set simulation speed to ${spd}x`}
            >
              {spd}×
            </button>
          ))}
        </div>

        {/* Reset Experiment */}
        <button
          onClick={resetExperiment}
          className="px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold font-mono transition-all flex items-center gap-1.5"
          title="Reset experiment to initial condition (-20°C solid)"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">restart_alt</span>
          <span className="hidden lg:inline">Reset</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-xl bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>
      </div>
    </header>
  );
};
