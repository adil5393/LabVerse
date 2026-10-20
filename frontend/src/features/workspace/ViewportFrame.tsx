import React, { useCallback, useRef, useState } from 'react';
import { LabToolbarDivider } from './controls/LabToolbar';

export interface ViewportFrameProps {
  /** Direct-manipulation and playback tools that belong to the experiment (rendered in a compact strip above the scene). */
  toolbar?: React.ReactNode;
  /** One short line under the scene (units, assumptions). */
  footnote?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showVectors?: boolean;
  onToggleVectors?: () => void;
}

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3;

/**
 * ViewportFrame: the dominant experiment region of the workstation. It gives the scene ALL the available space (the scene
 * scales to fit, never scrolls), keeps a compact unified toolbar attached to it (camera navigation on top-left, experiment
 * transport adjacent), and offers zoom, fit, pan and select modes matching the Work Laboratory design reference.
 */
export const ViewportFrame: React.FC<ViewportFrameProps> = ({
  toolbar,
  footnote,
  children,
  testId = 'simulation-viewport',
  showGrid,
  onToggleGrid,
  showVectors,
  onToggleVectors,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [toolMode, setToolMode] = useState<'select' | 'pan'>('select');
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  const clamp = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
  const fit = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);
  const zoomIn = useCallback(() => setZoom((z) => clamp(z * 1.25)), []);
  const zoomOut = useCallback(() => setZoom((z) => clamp(z / 1.25)), []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (toolMode !== 'pan') {
      if (zoom === 1 || (e.target as Element).closest('[data-no-pan]')) return;
    }
    drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setIsDragging(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (d) setPan({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
  };

  const end = () => {
    drag.current = null;
    setIsDragging(false);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" data-testid={testId}>
      {/* Unified Viewport Workstation Toolbar */}
      <div
        className="shrink-0 flex flex-wrap items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 border-b border-outline-variant bg-surface-container-low"
        data-testid="viewport-toolbar"
      >
        {/* 1. Viewport Camera & Interaction Tools (Grouped Top-Left) */}
        <div
          className="flex items-center gap-1 shrink-0 bg-surface-container/80 border border-outline-variant/60 rounded-lg p-0.5"
          role="group"
          aria-label="Viewport camera"
        >
          {/* Select Tool */}
          <button
            type="button"
            onClick={() => setToolMode('select')}
            className={`min-h-[28px] min-w-[28px] h-7 w-7 p-1 rounded-md flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95 ${
              toolMode === 'select'
                ? 'bg-primary text-slate-950 font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-white hover:bg-surface-variant'
            }`}
            title="Select Tool (Click to select & position objects)"
            aria-label="Select tool"
            aria-pressed={toolMode === 'select'}
            data-testid="viewport-select"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_selector_tool</span>
          </button>

          {/* Pan Tool */}
          <button
            type="button"
            onClick={() => setToolMode((m) => (m === 'pan' ? 'select' : 'pan'))}
            className={`min-h-[28px] min-w-[28px] h-7 w-7 p-1 rounded-md flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95 ${
              toolMode === 'pan'
                ? 'bg-primary text-slate-950 font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-white hover:bg-surface-variant'
            }`}
            title="Pan Tool (Click and drag to pan viewport)"
            aria-label="Pan tool"
            aria-pressed={toolMode === 'pan'}
            data-testid="viewport-pan"
          >
            <span className="material-symbols-outlined text-[16px]">pan_tool</span>
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            className="min-h-[28px] min-w-[28px] h-7 w-7 p-1 rounded-md flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
            title="Zoom In"
            aria-label="Zoom in"
            data-testid="viewport-zoom-in"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            className="min-h-[28px] min-w-[28px] h-7 w-7 p-1 rounded-md flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-surface-variant transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
            title="Zoom Out"
            aria-label="Zoom out"
            data-testid="viewport-zoom-out"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_out</span>
          </button>

          {/* Zoom Level Indicator */}
          <span
            className="font-mono text-[10px] text-outline px-1 min-w-[34px] text-center select-none"
            data-testid="viewport-zoom"
          >
            {Math.round(zoom * 100)}%
          </span>

          {/* Fit to Scene */}
          <button
            type="button"
            onClick={fit}
            className="min-h-[28px] px-2 py-0.5 rounded-md flex items-center gap-1 text-on-surface-variant hover:text-white hover:bg-surface-variant text-xs font-mono transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95"
            title="Fit scene to viewport"
            aria-label="Fit scene to viewport"
            data-testid="viewport-fit"
          >
            <span className="material-symbols-outlined text-[15px]">aspect_ratio</span>
            <span className="text-[11px] font-semibold">Fit</span>
          </button>

          {/* Optional Grid Toggle */}
          {onToggleGrid && (
            <button
              type="button"
              onClick={onToggleGrid}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[10px] font-mono transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                showGrid
                  ? 'bg-surface-variant text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              title="Toggle Background Grid"
              aria-label="Toggle Grid"
              data-testid="viewport-grid-toggle"
            >
              Grid
            </button>
          )}

          {/* Optional Vectors Toggle */}
          {onToggleVectors && (
            <button
              type="button"
              onClick={onToggleVectors}
              className={`min-h-[28px] px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                showVectors
                  ? 'bg-surface-variant text-primary border border-primary/40'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`}
              title="Toggle Motion Vectors"
              aria-label="Toggle Vectors"
              data-testid="viewport-vectors-toggle"
            >
              <span className="material-symbols-outlined text-[13px]">navigation</span>
              <span>Vectors: {showVectors ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>

        {/* Vertical Divider between Camera Tools and Experiment Actions */}
        {toolbar && (
          <LabToolbarDivider vertical className="hidden xs:block" />
        )}

        {/* 2. Experiment Actions / Motion Controls (Adjacent, starting from left) */}
        {toolbar && (
          <div className="flex flex-wrap items-center gap-1.5 min-w-0" data-testid="viewport-experiment-tools">
            {toolbar}
          </div>
        )}
      </div>

      <div
        className="flex-1 min-h-0 relative overflow-hidden bg-surface-lowest touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        style={{
          cursor: toolMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : zoom !== 1 ? (isDragging ? 'grabbing' : 'grab') : undefined,
        }}
      >
        <div
          className="absolute inset-0 p-2 flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center',
            transition: drag.current ? 'none' : 'transform 120ms',
          }}
        >
          {children}
        </div>
      </div>

      {footnote && (
        <div className="shrink-0 px-3 py-1 border-t border-outline-variant text-[10px] text-outline bg-surface-container-low">
          {footnote}
        </div>
      )}
    </div>
  );
};
