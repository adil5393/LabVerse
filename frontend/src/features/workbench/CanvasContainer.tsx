import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';

interface CanvasContainerProps {
  children?: React.ReactNode;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  worldGroupRef?: React.RefObject<SVGGElement | null>;
  activeInteractionState?: string;
  cursorWorldMM?: { xMM: number; yMM: number } | null;
  onCanvasPointerMove?: (e: React.PointerEvent) => void;
  onCanvasPointerDown?: (e: React.PointerEvent) => void;
  onCanvasPointerUp?: (e: React.PointerEvent) => void;
  diagnosticsOverlay?: React.ReactNode;
  showDiagnostics?: boolean;
  onToggleDiagnostics?: () => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  svgRef: externalSvgRef,
  worldGroupRef: externalWorldGroupRef,
  activeInteractionState = 'idle',
  cursorWorldMM,
  onCanvasPointerMove,
  onCanvasPointerDown,
  onCanvasPointerUp,
  diagnosticsOverlay,
  showDiagnostics,
  onToggleDiagnostics,
}) => {
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const internalSvgRef = useRef<SVGSVGElement>(null);
  const internalWorldGroupRef = useRef<SVGGElement>(null);

  const svgRef = externalSvgRef || internalSvgRef;
  const worldGroupRef = externalWorldGroupRef || internalWorldGroupRef;

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panInitialOffset, setPanInitialOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasPanMoved, setHasPanMoved] = useState(false);

  const {
    viewport,
    setZoom,
    setPan,
    resetViewport,
    selectInstance,
  } = useWorkbenchStore();

  // Mouse wheel zoom centered at cursor or viewport center
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.min(3.0, Math.max(0.3, prev * zoomFactor)));
    },
    [setZoom]
  );

  // Background pointer down initiates potential pan or click-deselect
  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Forward to parent handler first (e.g. for wiring click on canvas)
      onCanvasPointerDown?.(e);

      // Only initiate panning if primary/middle button and in 'idle' state
      if ((e.button !== 0 && e.button !== 1) || activeInteractionState !== 'idle') return;

      setIsPanning(true);
      setHasPanMoved(false);
      setPanStart({ x: e.clientX, y: e.clientY });
      setPanInitialOffset({ x: viewport.panX, y: viewport.panY });
    },
    [viewport.panX, viewport.panY, activeInteractionState, onCanvasPointerDown]
  );

  // Global pointer move and up handlers when panning
  useEffect(() => {
    if (!isPanning) return;

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      if (Math.hypot(deltaX, deltaY) > 3) {
        setHasPanMoved(true);
        setPan(panInitialOffset.x + deltaX, panInitialOffset.y + deltaY);
      }
    };

    const handlePointerUp = () => {
      setIsPanning(false);
      // If pointer did not move more than threshold, user clicked on empty canvas: deselect!
      if (!hasPanMoved) {
        selectInstance(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isPanning, panStart, panInitialOffset, hasPanMoved, setPan, selectInstance]);

  return (
    <div
      ref={internalContainerRef}
      onWheel={handleWheel}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      className={`relative flex-1 h-full w-full overflow-hidden workbench-mat select-none ${
        isPanning ? 'cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* SVG Canvas with affine transform matrix */}
      <svg
        ref={svgRef}
        id="workbench-svg"
        className="w-full h-full pointer-events-auto"
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Subtle grid pattern inside SVG */}
          <pattern id="minorGrid" width="9.6" height="9.6" patternUnits="userSpaceOnUse">
            <path d="M 9.6 0 L 0 0 0 9.6" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="0.5" />
          </pattern>
          <pattern id="majorGrid" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="url(#minorGrid)" />
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(77, 142, 255, 0.12)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Global zoom & pan transform group with authoritative reference */}
        <g
          ref={worldGroupRef}
          id="workbench-world-group"
          transform={`translate(${viewport.panX}, ${viewport.panY}) scale(${viewport.zoom})`}
        >
          {/* Origin axes indicator */}
          <g opacity="0.6" pointerEvents="none">
            <line x1="-15" y1="0" x2="35" y2="0" stroke="#4d8eff" strokeWidth="1.5" />
            <line x1="0" y1="-15" x2="0" y2="35" stroke="#4edea3" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3" fill="#adc6ff" />
            <text x="6" y="-6" fill="#8c909f" fontSize="10" fontFamily="JetBrains Mono">
              (0,0) mm
            </text>
          </g>

          {/* Children: Components rendered by ComponentRenderer */}
          {children}
        </g>
      </svg>

      {/* Optional Developer Diagnostics Overlay */}
      {showDiagnostics && diagnosticsOverlay}

      {/* Bottom-left telemetry & coordinates readout badge */}
      <div className="absolute bottom-4 left-4 bg-surface-lowest/90 backdrop-blur-md border border-surface-border px-3 py-1.5 rounded-lg text-[11px] font-mono text-slate-400 flex items-center gap-3 shadow-lg select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          <span>
            Cursor: X: {cursorWorldMM ? cursorWorldMM.xMM : 0} mm, Y: {cursorWorldMM ? cursorWorldMM.yMM : 0} mm
          </span>
        </div>
        <span className="text-surface-border">|</span>
        <div>Zoom: {Math.round(viewport.zoom * 100)}%</div>
        <span className="text-surface-border">|</span>
        <div className="capitalize text-slate-300">State: {activeInteractionState}</div>
        <span className="text-surface-border">|</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleDiagnostics?.();
          }}
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${
            showDiagnostics
              ? 'bg-primary text-black'
              : 'bg-surface-card text-slate-400 hover:text-white hover:bg-slate-700'
          }`}
          title="Toggle developer coordinate diagnostics overlay"
        >
          DEBUG
        </button>
      </div>

      {/* Bottom-right viewport mini-controls */}
      <div className="absolute bottom-4 right-4 bg-surface-lowest/90 backdrop-blur-md border border-surface-border rounded-lg p-1 flex items-center gap-1 shadow-lg z-10">
        <button
          onClick={() => setZoom((z) => Math.min(3.0, z + 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-surface-card transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.1))}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-surface-card transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
        <button
          onClick={resetViewport}
          className="w-7 h-7 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-surface-card transition-colors"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[16px]">crop_free</span>
        </button>
      </div>
    </div>
  );
};
