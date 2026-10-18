/**
 * Free Laboratory Top Toolbar for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import { QUADRILATERAL_EXPERIMENTS } from '../../../engine/mathematics/quadrilaterals/quadrilateralExperiments';
import type { LabelSizePreference } from '../../../engine/mathematics/quadrilaterals/types';

export const QuadrilateralToolbar: React.FC = () => {
  const {
    currentExperimentId,
    setExperiment,
    mode,
    setMode,
    labelSize,
    setLabelSize,
    showGrid,
    toggleGrid,
    showAxes,
    toggleAxes,
    showCoordinates,
    toggleCoordinates,
    resetExperiment,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useQuadrilateralStore();

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
      // Graceful fallback
    }
  };

  return (
    <header className="h-14 bg-surface-low border-b border-surface-border px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Left: Back Link & Experiment Switcher */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics/quadrilaterals"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors flex items-center justify-center"
          title="Return to Quadrilaterals Chapter Roadmap"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </Link>

        <div className="h-4 w-[1px] bg-surface-border" />

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">crop_square</span>
          <select
            value={currentExperimentId}
            onChange={(e) => setExperiment(e.target.value)}
            className="bg-surface-card border border-surface-border rounded-lg px-2.5 py-1 text-xs text-white font-medium focus:outline-none focus:border-amber-500 max-w-xs truncate cursor-pointer"
          >
            {QUADRILATERAL_EXPERIMENTS.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center: Mode Toggles (Explore / Practice) & Undo/Redo */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface-card p-0.5 rounded-xl border border-surface-border">
          <button
            onClick={() => setMode('explore')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'explore'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">science</span>
            <span>Free Workbench</span>
          </button>

          <button
            onClick={() => setMode('practice')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              mode === 'practice'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">quiz</span>
            <span>Practice</span>
          </button>
        </div>

        <div className="h-4 w-[1px] bg-surface-border mx-1" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
          </button>
        </div>
      </div>

      {/* Right: View Toggles & Display Settings */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleGrid}
          className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
            showGrid
              ? 'bg-surface-elevated border-amber-500/40 text-amber-300'
              : 'border-surface-border text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Cartesian Grid"
        >
          <span className="material-symbols-outlined text-[16px]">grid_4x4</span>
          <span className="hidden md:inline">Grid</span>
        </button>

        <button
          onClick={toggleAxes}
          className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
            showAxes
              ? 'bg-surface-elevated border-amber-500/40 text-amber-300'
              : 'border-surface-border text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Axes"
        >
          <span className="material-symbols-outlined text-[16px]">stacked_line_chart</span>
          <span className="hidden md:inline">Axes</span>
        </button>

        <button
          onClick={toggleCoordinates}
          className={`p-1.5 rounded-lg text-xs font-mono transition-colors flex items-center gap-1 border ${
            showCoordinates
              ? 'bg-surface-elevated border-amber-500/40 text-amber-300'
              : 'border-surface-border text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Coordinate Labels"
        >
          <span className="material-symbols-outlined text-[16px]">pin_drop</span>
          <span className="hidden md:inline">(x,y)</span>
        </button>

        {/* Label Size Toggle */}
        <select
          value={labelSize}
          onChange={(e) => setLabelSize(e.target.value as LabelSizePreference)}
          className="bg-surface-card border border-surface-border rounded-lg px-2 py-1 text-xs text-slate-300 font-mono cursor-pointer"
          title="Text Label Size"
        >
          <option value="small">Small Text</option>
          <option value="normal">Normal Text</option>
          <option value="large">Large (TV)</option>
        </select>

        <button
          onClick={resetExperiment}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-surface-elevated transition-colors"
          title="Reset Experiment"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
        </button>

        <button
          onClick={handleToggleFullscreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-elevated transition-colors"
          title="Toggle Fullscreen"
        >
          <span className="material-symbols-outlined text-[18px]">fullscreen</span>
        </button>
      </div>
    </header>
  );
};
