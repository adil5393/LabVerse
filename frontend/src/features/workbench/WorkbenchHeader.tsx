import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface WorkbenchHeaderProps {
  onExportLab?: () => void;
  onResetWorkbench?: () => void;
}

const WIRE_COLORS = [
  { id: 'red', name: 'Red', hex: '#ef4444' },
  { id: 'black', name: 'Black', hex: '#1f2937' },
  { id: 'blue', name: 'Blue', hex: '#3b82f6' },
  { id: 'yellow', name: 'Yellow', hex: '#eab308' },
  { id: 'green', name: 'Green', hex: '#22c55e' },
  { id: 'white', name: 'White', hex: '#f8fafc' },
];

export const WorkbenchHeader: React.FC<WorkbenchHeaderProps> = ({
  onExportLab,
  onResetWorkbench,
}) => {
  const [searchParams] = useSearchParams();
  const isGuided = searchParams.get('mode') !== 'free';

  const {
    viewport,
    setZoom,
    resetViewport,
    snapToGrid,
    toggleSnapToGrid,
    userMode,
    setUserMode,
    isInspectorOpen,
    toggleInspector,
    isWiringMode,
    setWiringMode,
    selectedWireColor,
    setSelectedWireColor,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useWorkbenchStore();

  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <header className="h-14 bg-surface-lowest border-b border-surface-border flex items-center justify-between px-4 z-40 shrink-0 select-none">
      {/* Left: Breadcrumbs & Experiment Title */}
      <div className="flex items-center gap-3">
        <Link
          to="/physics/electricity"
          className="h-9 px-2.5 flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-surface-elevated rounded-lg transition-colors text-xs font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span className="hidden sm:inline font-semibold">Electricity Lab</span>
        </Link>

        <div className="h-4 w-px bg-surface-border"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white tracking-tight">
            {isGuided ? 'Exp 01: Build Your First LED Circuit' : 'Free DC Circuit Workbench'}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-surface-high border border-surface-border text-primary font-medium tracking-wide">
            {isGuided ? 'Guided' : 'Sandbox'}
          </span>
        </div>
      </div>

      {/* Center: Canvas Viewport & Tooling Controls */}
      <div className="flex items-center bg-surface-lowest border border-surface-border rounded-lg p-0.5 gap-0.5 shadow-inner">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            undoStack.length > 0
              ? 'text-slate-300 hover:text-white hover:bg-surface-card'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <span className="material-symbols-outlined text-[18px]">undo</span>
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            redoStack.length > 0
              ? 'text-slate-300 hover:text-white hover:bg-surface-card'
              : 'text-slate-600 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <span className="material-symbols-outlined text-[18px]">redo</span>
        </button>

        <div className="h-4 w-px bg-surface-border mx-0.5"></div>

        {/* Zoom Controls */}
        <button
          onClick={() => setZoom((z) => z + 0.1)}
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-card rounded transition-colors"
          title="Zoom In (+)"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <span className="px-2 text-xs font-mono text-slate-300 select-none min-w-[50px] text-center">
          {zoomPercentage}%
        </span>
        <button
          onClick={() => setZoom((z) => z - 0.1)}
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-card rounded transition-colors"
          title="Zoom Out (-)"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <button
          onClick={resetViewport}
          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white hover:bg-surface-card rounded transition-colors"
          title="Reset View / Fit Screen"
        >
          <span className="material-symbols-outlined text-[18px]">fit_screen</span>
        </button>

        <div className="h-4 w-px bg-surface-border mx-0.5"></div>

        {/* Snap-to-Hole / Grid Toggle */}
        <button
          onClick={toggleSnapToGrid}
          className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
            snapToGrid
              ? 'text-tertiary bg-surface-card border border-tertiary/30 shadow-sm'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          title={snapToGrid ? 'Snap to Breadboard Holes: ON' : 'Snap to Breadboard Holes: OFF'}
        >
          <span className="material-symbols-outlined text-[18px]">grid_4x4</span>
        </button>

        {/* Interactive Wiring Mode Toggle */}
        <button
          onClick={() => setWiringMode(!isWiringMode)}
          className={`h-8 px-2.5 flex items-center gap-1.5 rounded transition-all text-xs font-medium ${
            isWiringMode
              ? 'bg-primary text-white font-semibold shadow-md shadow-primary/30'
              : 'text-slate-300 hover:text-white hover:bg-surface-card'
          }`}
          title="Toggle Jumper Wire Connection Mode"
        >
          <span className="material-symbols-outlined text-[18px]">cable</span>
          <span className="hidden md:inline">Wire Tool</span>
        </button>

        {/* Wire Color Picker (visible when wiring) */}
        {isWiringMode && (
          <div className="flex items-center gap-1 pl-1 pr-1 border-l border-surface-border">
            {WIRE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedWireColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  selectedWireColor === c.hex
                    ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-surface-lowest'
                    : 'hover:scale-110 opacity-75 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.hex }}
                title={`Wire Color: ${c.name}`}
              />
            ))}
          </div>
        )}

        <button
          onClick={onResetWorkbench}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-error hover:bg-surface-card rounded transition-colors"
          title="Reset Workbench"
        >
          <span className="material-symbols-outlined text-[18px]">restart_alt</span>
        </button>
      </div>

      {/* Right: Beginner / Advanced Mode + Inspector Toggle + Save */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center bg-surface-card border border-surface-border rounded-lg p-0.5">
          <button
            onClick={() => setUserMode('beginner')}
            className={`h-7 px-2.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
              userMode === 'beginner'
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">school</span>
            <span>Beginner</span>
          </button>
          <button
            onClick={() => setUserMode('advanced')}
            className={`h-7 px-2.5 text-xs font-medium rounded flex items-center gap-1.5 transition-all ${
              userMode === 'advanced'
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">calculate</span>
            <span>Advanced</span>
          </button>
        </div>

        <button
          onClick={toggleInspector}
          className={`h-8 px-2.5 border rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
            isInspectorOpen
              ? 'border-primary/50 bg-primary/10 text-primary font-semibold'
              : 'border-surface-border bg-surface-card text-slate-300 hover:border-slate-500'
          }`}
          title="Toggle Inspector Sidebar"
        >
          <span className="material-symbols-outlined text-[17px]">tune</span>
          <span className="hidden md:inline">Inspector</span>
        </button>

        <button
          onClick={onExportLab}
          className="h-8 px-3 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm shadow-primary/10"
          title="Export workbench experiment (.lab)"
        >
          <span className="material-symbols-outlined text-[16px]">save</span>
          <span className="hidden sm:inline">Export .lab</span>
        </button>
      </div>
    </header>
  );
};
