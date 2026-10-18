import React from 'react';
import { Link } from 'react-router-dom';
import { useCircleStore } from '../../../store/useCircleStore';
import { CIRCLE_EXPERIMENTS } from '../../../engine/mathematics/circles/circleExperiments';
import type { CircleMode, LabelSizePreference } from '../../../engine/mathematics/circles/types';

export const CircleToolbar: React.FC = () => {
  const {
    currentExperimentId,
    setExperiment,
    mode,
    setMode,
    undo,
    redo,
    canUndo,
    canRedo,
    resetExperiment,
    labelSize,
    setLabelSize,
  } = useCircleStore();

  const handleToggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch {
      // Graceful unsupported browser handling
    }
  };

  return (
    <header className="h-14 bg-surface-low border-b border-surface-border px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Back & Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics/circles"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Circles Chapter Roadmap"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          <span className="hidden sm:inline">Circles Hub</span>
        </Link>

        <Link
          to="/mathematics/circles/workbench?lesson=circles-l1"
          className="px-2.5 py-1 rounded-xl bg-surface-card hover:bg-amber-500 hover:text-slate-950 text-amber-400 border border-surface-border hover:border-amber-500 text-xs font-bold transition-all flex items-center gap-1.5"
          title="Switch to Guided Chapter Learning Path"
        >
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span className="hidden md:inline">Guided Path</span>
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">radio_button_unchecked</span>
              <span>Class 9 Circles Laboratory</span>
            </span>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
              NCERT Ganita Manjari
            </span>
          </div>
          <div className="text-[11px] text-slate-400 hidden sm:block">
            I'm Up and Down, and Round and Round — Interactive Theorems & Proofs
          </div>
        </div>
      </div>

      {/* Center: Experiment Selector & Learning Modes */}
      <div className="flex items-center gap-3">
        {/* Experiment Selector */}
        <select
          value={currentExperimentId}
          onChange={(e) => setExperiment(e.target.value)}
          className="bg-surface-card border border-surface-border text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 transition-colors font-medium max-w-xs"
        >
          <optgroup label="1. Foundations" className="bg-surface-lowest text-slate-400 font-bold">
            {CIRCLE_EXPERIMENTS.filter((e) => e.category === 'foundations').map((exp) => (
              <option key={exp.id} value={exp.id} className="bg-surface-elevated text-slate-100">
                {exp.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="2. Chords & Distance" className="bg-surface-lowest text-slate-400 font-bold">
            {CIRCLE_EXPERIMENTS.filter((e) => e.category === 'chords').map((exp) => (
              <option key={exp.id} value={exp.id} className="bg-surface-elevated text-slate-100">
                {exp.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="3. Angles & Theorems" className="bg-surface-lowest text-slate-400 font-bold">
            {CIRCLE_EXPERIMENTS.filter((e) => e.category === 'angles_theorems').map((exp) => (
              <option key={exp.id} value={exp.id} className="bg-surface-elevated text-slate-100">
                {exp.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="4. Practice & Extensions" className="bg-surface-lowest text-slate-400 font-bold">
            {CIRCLE_EXPERIMENTS.filter((e) => e.category === 'practice_revision' || e.category === 'extension').map((exp) => (
              <option key={exp.id} value={exp.id} className="bg-surface-elevated text-slate-100">
                {exp.title}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Mode Tabs */}
        <div className="bg-surface-card p-1 rounded-xl border border-surface-border flex items-center gap-1">
          {(['explore', 'investigate', 'practice'] as CircleMode[]).map((m) => {
            const isActive = mode === m;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold capitalize transition-all flex items-center gap-1 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">
                  {m === 'explore' ? 'draw' : m === 'investigate' ? 'lightbulb' : 'quiz'}
                </span>
                <span>{m}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Label Size, History, Reset & Fullscreen */}
      <div className="flex items-center gap-2">
        {/* User-facing Label Size Toggle: Small | Normal | Large */}
        <div className="flex items-center gap-1 bg-surface-card px-2 py-1 rounded-xl border border-surface-border text-xs">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden lg:inline mr-0.5">
            Labels:
          </span>
          {(['small', 'normal', 'large'] as LabelSizePreference[]).map((size) => (
            <button
              key={size}
              onClick={() => setLabelSize(size)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-all ${
                labelSize === size
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={`Set mathematical label typography to ${size}`}
            >
              {size}
            </button>
          ))}
        </div>

        <div className="h-5 w-px bg-surface-border mx-0.5 hidden sm:block" />

        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Undo (Ctrl+Z)"
        >
          <span className="material-symbols-outlined text-[18px]">undo</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          title="Redo (Ctrl+Y)"
        >
          <span className="material-symbols-outlined text-[18px]">redo</span>
        </button>

        <button
          onClick={resetExperiment}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-surface-elevated transition-all flex items-center gap-1 text-xs"
          title="Reset Experiment to Initial Scene"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          <span className="hidden md:inline font-mono">Reset</span>
        </button>

        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors ml-0.5"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>
      </div>
    </header>
  );
};
