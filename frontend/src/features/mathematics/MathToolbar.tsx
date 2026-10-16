/**
 * Compact Top Toolbar for LabVerse Mathematics Laboratory
 *
 * Provides experiment navigation, view controls, undo/redo,
 * grid/snap toggles, and zoom management for desktop and 1080p smart TVs.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMathStore } from '../../store/useMathStore';

export const MathToolbar: React.FC = () => {
  const {
    currentExperimentId,
    objectOrder,
    viewport,
    snapToGrid,
    showGrid,
    showAxes,
    showConstructions,
    history,
    future,
    zoomIn,
    zoomOut,
    resetView,
    toggleSnapToGrid,
    toggleGrid,
    toggleAxes,
    toggleConstructions,
    undo,
    redo,
    clearCanvas,
    resetExperiment,
  } = useMathStore();

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const canUndo = history.length > 0;
  const canRedo = future.length > 0;
  const objectCount = objectOrder.length;

  return (
    <header className="h-14 bg-surface-card border-b border-surface-border px-4 lg:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-20">
      {/* Left: Navigation and Experiment Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/mathematics"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold transition-all group"
          title="Return to Mathematics Modules"
        >
          <span className="material-symbols-outlined text-[17px] group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span className="hidden sm:inline">Math Hub</span>
        </Link>

        <div className="h-5 w-px bg-surface-border hidden sm:block" />

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[17px]">square_foot</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>Distance Between Two Points</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-lowest text-primary border border-primary/30 font-semibold hidden md:inline">
                Class 9–10
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Center: Quick Geometry & Grid Controls */}
      <div className="flex items-center gap-1.5 bg-surface-lowest/70 p-1 rounded-xl border border-surface-border/70">
        {/* Snap to Grid Toggle */}
        <button
          onClick={toggleSnapToGrid}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all ${
            snapToGrid
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Snap to Grid (1.0 Unit)"
        >
          <span className="material-symbols-outlined text-[15px]">grid_goldenratio</span>
          <span className="hidden md:inline">Snap</span>
        </button>

        {/* Grid Visibility Toggle */}
        <button
          onClick={toggleGrid}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all ${
            showGrid
              ? 'bg-primary/20 text-primary-light border border-primary/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Cartesian Grid Lines"
        >
          <span className="material-symbols-outlined text-[15px]">grid_4x4</span>
          <span className="hidden md:inline">Grid</span>
        </button>

        {/* Axes Visibility Toggle */}
        <button
          onClick={toggleAxes}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all ${
            showAxes
              ? 'bg-primary/20 text-primary-light border border-primary/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle X and Y Coordinate Axes"
        >
          <span className="material-symbols-outlined text-[15px]">tune</span>
          <span className="hidden md:inline">Axes</span>
        </button>

        {/* Constructions Visibility Toggle */}
        <button
          onClick={toggleConstructions}
          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-all ${
            showConstructions
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Δx and Δy Right Triangle Construction Lines"
        >
          <span className="material-symbols-outlined text-[15px]">change_history</span>
          <span className="hidden lg:inline">Triangle Δ</span>
        </button>
      </div>

      {/* Right: Zoom, Undo, Redo, Reset */}
      <div className="flex items-center gap-2">
        {/* Undo & Redo */}
        <div className="flex items-center gap-1 bg-surface-lowest/70 p-1 rounded-xl border border-surface-border/70">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[18px]">undo</span>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[18px]">redo</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="hidden sm:flex items-center gap-1 bg-surface-lowest/70 p-1 rounded-xl border border-surface-border/70">
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <span className="text-xs font-mono font-bold text-slate-300 px-1 min-w-[42px] text-center">
            {Math.round(viewport.zoom * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Reset Pan and Zoom to Origin"
          >
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
          </button>
        </div>

        {/* Clear Canvas Action */}
        <div className="relative">
          {showClearConfirm ? (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-lowest border border-amber-500/50 shadow-xl">
              <span className="text-[11px] font-mono text-amber-300 pl-1.5 pr-0.5">Clear all?</span>
              <button
                onClick={() => {
                  clearCanvas();
                  setShowClearConfirm(false);
                }}
                className="px-2 py-0.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold font-mono transition-colors"
                title="Confirm clear all geometry"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 rounded-lg bg-surface-card hover:bg-surface-elevated text-slate-300 text-[11px] font-mono transition-colors"
                title="Cancel"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (objectCount > 0) setShowClearConfirm(true);
              }}
              disabled={objectCount === 0}
              className="px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-elevated disabled:opacity-40 disabled:cursor-not-allowed border border-surface-border text-slate-300 hover:text-white text-xs font-semibold font-mono transition-all flex items-center gap-1.5"
              title={objectCount === 0 ? 'Canvas is empty' : 'Clear all geometry from canvas (undoable)'}
            >
              <span className="material-symbols-outlined text-[16px] text-slate-400">layers_clear</span>
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {/* Reset Experiment */}
        <button
          onClick={() => {
            setShowClearConfirm(false);
            resetExperiment(currentExperimentId);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-surface-card hover:bg-surface-elevated border border-surface-border text-slate-300 hover:text-white text-xs font-semibold font-mono transition-all flex items-center gap-1.5"
          title="Reset Experiment to Default Points A(2,3) and B(7,6)"
        >
          <span className="material-symbols-outlined text-[16px] text-amber-400">restart_alt</span>
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
};
