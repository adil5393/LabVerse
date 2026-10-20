import React, { useCallback, useRef, useState } from 'react';

export interface ViewportFrameProps {
  /** The experiment's own controls (transport, move buttons, toggles). They sit in the docked strip along the bottom of the viewport. */
  toolbar?: React.ReactNode;
  /** One short line under the transport strip (units, assumptions). */
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

const toolBtn = 'p-1 rounded transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-95';
const idle = 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant';
const on = 'bg-primary text-on-primary font-bold';

/**
 * ViewportFrame: the dominant experiment region of the workstation, laid out like the Work Laboratory so every lab feels the
 * same: a floating camera toolbar over the top-left of the scene (select, pan, zoom, fit, grid and vector toggles), the scene
 * using all the remaining space (it scales to fit, never scrolls), and a docked transport strip along the bottom that holds the
 * experiment's own controls (play, step, reset, timeline, move buttons).
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
      <div className="flex-1 min-h-0 relative overflow-hidden bg-surface-lowest">
        {/* The scene. Panning is handled here only, so the floating toolbar below never starts a pan. */}
        <div
          className="absolute inset-0 touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={end}
          onPointerCancel={end}
          style={{
            cursor: toolMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : zoom !== 1 ? (isDragging ? 'grabbing' : 'grab') : undefined,
          }}
        >
          <div
            className="absolute inset-0 p-2 pt-12 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center',
              transition: drag.current ? 'none' : 'transform 120ms',
            }}
          >
            {children}
          </div>
        </div>

        {/* Floating viewport toolbar (top-left), the same as the Work Laboratory's */}
        <div
          className="absolute top-3 left-3 z-20 flex items-center gap-1 max-w-[calc(100%-1.5rem)] overflow-x-auto no-scrollbar bg-surface-container/90 backdrop-blur border border-outline-variant p-1 rounded shadow-md"
          role="group"
          aria-label="Viewport camera"
          data-testid="viewport-toolbar"
        >
          <button type="button" onClick={() => setToolMode('select')} className={`${toolBtn} ${toolMode === 'select' ? on : idle}`} title="Select Tool (Click to select, drag to position)" aria-label="Select tool" aria-pressed={toolMode === 'select'} data-testid="viewport-select">
            <span className="material-symbols-outlined text-[16px]">arrow_selector_tool</span>
          </button>
          <button type="button" onClick={() => setToolMode((m) => (m === 'pan' ? 'select' : 'pan'))} className={`${toolBtn} ${toolMode === 'pan' ? on : idle}`} title="Pan Tool (Click and drag to pan viewport)" aria-label="Pan tool" aria-pressed={toolMode === 'pan'} data-testid="viewport-pan">
            <span className="material-symbols-outlined text-[16px]">pan_tool</span>
          </button>
          <button type="button" onClick={fit} className={`${toolBtn} ${idle}`} title="Fit scene to viewport" aria-label="Fit scene to viewport" data-testid="viewport-fit">
            <span className="material-symbols-outlined text-[16px]">aspect_ratio</span>
          </button>
          <button type="button" onClick={zoomIn} className={`${toolBtn} ${idle}`} title="Zoom In" aria-label="Zoom in" data-testid="viewport-zoom-in">
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
          </button>
          <button type="button" onClick={zoomOut} className={`${toolBtn} ${idle}`} title="Zoom Out" aria-label="Zoom out" data-testid="viewport-zoom-out">
            <span className="material-symbols-outlined text-[16px]">zoom_out</span>
          </button>
          <span className="font-mono text-[10px] text-outline px-1 min-w-[34px] text-center select-none" data-testid="viewport-zoom">
            {Math.round(zoom * 100)}%
          </span>
          {(onToggleVectors || onToggleGrid) && <div className="h-4 w-px bg-outline-variant mx-1" />}
          {onToggleVectors && (
            <button type="button" onClick={onToggleVectors} className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors shrink-0 ${showVectors ? 'bg-surface-variant text-primary border border-primary/40' : idle}`} title="Toggle Motion Vectors" aria-label="Toggle Vectors" data-testid="viewport-vectors-toggle">
              <span className="material-symbols-outlined text-[12px]">navigation</span>
              <span className="hidden sm:inline">Vectors: {showVectors ? 'ON' : 'OFF'}</span>
              <span className="sm:hidden">Vec</span>
            </button>
          )}
          {onToggleGrid && (
            <button type="button" onClick={onToggleGrid} className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ${showGrid ? 'bg-surface-variant text-primary' : idle}`} title="Toggle Background Grid" aria-label="Toggle Grid" data-testid="viewport-grid-toggle">
              Grid
            </button>
          )}
        </div>
      </div>

      {/* Docked transport strip (bottom), the same place as the Work Laboratory's playback bar */}
      {toolbar && (
        <div
          className="shrink-0 min-h-11 sm:min-h-12 bg-surface-container border-t border-outline-variant px-2 sm:px-3 py-1 sm:py-1.5 flex items-center overflow-x-auto no-scrollbar gap-2 z-30 select-none"
          data-testid="viewport-experiment-tools"
        >
          {toolbar}
        </div>
      )}

      {footnote && (
        <div className="shrink-0 px-3 py-0.5 sm:py-1 border-t border-outline-variant text-[9px] sm:text-[10px] text-outline bg-surface-container-low truncate">
          {footnote}
        </div>
      )}
    </div>
  );
};
