import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  fmt,
  fmtSigned,
  TRACK_LENGTH,
  workAtProgress,
  type ForceKind,
  type WorkResult,
  type WorkSetup,
} from '../../../../engine/physics/work/workModel';
import { useViewportCamera, clientToViewBox, viewBoxToApparatus } from './useViewportCamera';

const W = 1000, H = 450;
/** Matches the 3 s playback in WorkView. */
const SIM_SECONDS = 3;
const COLOR: Record<ForceKind, string> = {
  applied: '#adc6ff',
  friction: '#ffb4ab',
  weight: '#ffb95a',
  normal: '#4edea3',
};
const TAG: Record<ForceKind, string> = { applied: 'F', friction: 'f', weight: 'W', normal: 'N' };

export interface SimulationViewportProps {
  result: WorkResult;
  progress: number;
  showVertical: boolean;
  onShowVerticalChange: (val: boolean) => void;
  alt: string;
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onProgressChange: (p: number) => void;
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  onSetupChange?: (patch: Partial<WorkSetup>) => void;
  lockMap?: Record<string, boolean>;
  showVectors?: boolean;
  onToggleVectors?: (val: boolean) => void;
  showCaliper?: boolean;
  showCart?: boolean;
  showTrack?: boolean;
}

/**
 * SimulationViewport: Blender-inspired central simulation canvas matching Stitch design.
 * Features CAD precision grid, real pan/zoom/fit viewport camera, direct object manipulation,
 * selection highlights, displacement calipers, and docked playback transport.
 */
export const SimulationViewport: React.FC<SimulationViewportProps> = ({
  result: r,
  progress,
  showVertical,
  onShowVerticalChange,
  alt,
  playing,
  onTogglePlay,
  onReset,
  onProgressChange,
  selectedObjectId = null,
  onSelectObject,
  onSetupChange,
  lockMap = {},
  showVectors: controlledVectors,
  onToggleVectors,
  showCaliper = true,
  showCart = true,
  showTrack = true,
}) => {
  const [showGrid, setShowGrid] = useState(true);
  const [internalVectors, setInternalVectors] = useState(true);
  const vectorsOn = controlledVectors !== undefined ? controlledVectors : internalVectors;

  const handleToggleVectors = (val: boolean) => {
    if (onToggleVectors) onToggleVectors(val);
    else setInternalVectors(val);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const touchDistanceRef = useRef<number | null>(null);

  // Direct-manipulation state. `select` targets are click-only (no drag) and select `selectId`.
  type DragTarget = 'none' | 'cart' | 'caliper' | 'force' | 'select';
  const IDLE_DRAG = { target: 'none' as DragTarget, selectId: null as string | null, startX: 0, startY: 0, moved: false, startMag: 0, startDist: -1, k: 1 };
  const dragInteractionRef = useRef({ ...IDLE_DRAG });
  const backgroundDownRef = useRef(false);

  const {
    camera,
    toolMode,
    setToolMode,
    zoomIn,
    zoomOut,
    resetCamera,
    fitToView,
    zoomAroundViewPoint,
    startDrag,
    updateDrag,
    endDrag,
    isPanning,
  } = useViewportCamera();

  const horizontal = r.setup.axis === 'horizontal';
  const pos = workAtProgress(r, progress).position;
  const s = r.setup.displacement;
  const startPos = r.setup.startPos;
  const endPos = r.endPos;

  // Viewport track mapping: track from 0 to TRACK_LENGTH (12m).
  // x=100 (0m) to x=900 (12m). Total track width = 800px.
  const x0 = 100, trackW = 800, ground = 300;
  const px = (m: number) => x0 + (m / TRACK_LENGTH) * trackW;

  // Vertical mapping: y=340 (0m) to y=70 (12m).
  const vBase = 340, vTop = 70;
  const py = (m: number) => vBase - (m / TRACK_LENGTH) * (vBase - vTop);

  const startX = horizontal ? px(startPos) : 380;
  const endX = horizontal ? px(endPos) : 380;
  const startY = horizontal ? ground : py(startPos);
  const endY = horizontal ? ground : py(endPos);

  const cartX = horizontal ? px(pos) : 380;
  const cartY = horizontal ? ground - 40 : py(pos) - 20;

  // Applied force angle
  const angle = ((r.setup.angleDeg % 360) + 360) % 360;
  const cosA = Math.cos((angle * Math.PI) / 180);

  // Live scientific telemetry
  const simTime = (progress * SIM_SECONDS).toFixed(2);
  const velNow = s !== 0 ? Math.sqrt(Math.max(0, (2 * Math.max(0, r.netWork) * progress) / r.setup.massKg)).toFixed(2) : '0.00';
  const accelNow = s !== 0 ? (r.netWork / (r.setup.massKg * Math.max(0.1, Math.abs(s)))).toFixed(2) : '0.00';

  const here = workAtProgress(r, progress);

  // Handle Fit to View calculation based on physical geometry
  const handleFit = useCallback(() => {
    if (horizontal) {
      const minX = Math.min(startX, endX, px(0));
      const maxX = Math.max(startX, endX, px(TRACK_LENGTH));
      fitToView(minX - 30, maxX + 30, ground - 140, ground + 50);
    } else {
      const minY = Math.min(startY, endY, vTop);
      const maxY = Math.max(startY, endY, vBase);
      fitToView(300, 500, minY - 30, maxY + 30);
    }
  }, [horizontal, startX, endX, startY, endY, fitToView]);

  // Non-passive wheel listener for smooth pointer-centred zoom (uses the SVG's real screen transform).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const svg = svgRef.current;
      const v = svg ? clientToViewBox(svg, e.clientX, e.clientY) : null;
      if (v) zoomAroundViewPoint(e.deltaY < 0 ? 1.15 : 0.85, v.x, v.y);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAroundViewPoint]);

  // Escape key to deselect
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSelectObject?.(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onSelectObject]);

  const toApparatus = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    const v = svg ? clientToViewBox(svg, clientX, clientY) : null;
    return v ? viewBoxToApparatus(v.x, v.y, camera) : null;
  };

  /** Begin a click or drag on a scene object. In pan mode the object is ignored so the canvas can still pan. */
  const beginObjectDrag = (e: React.PointerEvent, target: DragTarget, selectId: string, extra: Partial<typeof IDLE_DRAG> = {}) => {
    if (toolMode === 'pan' || e.button === 1) return;
    e.stopPropagation();
    dragInteractionRef.current = { ...IDLE_DRAG, target, selectId, startX: e.clientX, startY: e.clientY, ...extra };
    try { containerRef.current?.setPointerCapture(e.pointerId); } catch { /* capture is a nicety */ }
  };

  const finishInteraction = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* already released */ }
    if (isPanning()) endDrag();
    const drag = dragInteractionRef.current;
    if (drag.target !== 'none') {
      // A press that never became a drag is a plain click: select the object.
      if (!cancelled && !drag.moved) onSelectObject?.(drag.selectId);
      dragInteractionRef.current = { ...IDLE_DRAG };
    } else if (!cancelled && backgroundDownRef.current && (e.target as Element).closest('svg')) {
      onSelectObject?.(null);
    }
    backgroundDownRef.current = false;
  };

  // Canvas pointer handling: pan tool or middle button pans; a press on empty canvas clears the selection.
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // The floating toolbar lives inside the canvas: never pan from, or capture the pointer away from, its controls.
    if ((e.target as Element).closest('button, input, select, a')) return;
    if (e.button === 1 || toolMode === 'pan' || e.buttons === 4) {
      e.preventDefault();
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* capture is a nicety */ }
      startDrag(e.clientX, e.clientY);
      return;
    }
    backgroundDownRef.current = e.button === 0;
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning()) {
      const svg = svgRef.current;
      const v = svg ? clientToViewBox(svg, e.clientX, e.clientY) : null;
      updateDrag(e.clientX, e.clientY, v?.unitsPerPx ?? 1);
      return;
    }

    const drag = dragInteractionRef.current;
    if (drag.target === 'none' || drag.target === 'select' || !onSetupChange) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) < 4) return;
    drag.moved = true;
    const app = toApparatus(e.clientX, e.clientY);
    if (!app) return;

    if (drag.target === 'cart' && !lockMap.cart) {
      const rawM = horizontal ? ((app.x - 100) / 800) * TRACK_LENGTH : ((vBase - app.y) / (vBase - vTop)) * TRACK_LENGTH;
      // Keep the whole displacement on the track, whichever way it points.
      const lo = Math.max(0, -s), hi = Math.min(TRACK_LENGTH, TRACK_LENGTH - s);
      onSetupChange({ startPos: Math.max(lo, Math.min(hi, Math.round(rawM * 10) / 10)) });
    } else if (drag.target === 'caliper' && !lockMap.caliper) {
      const rawM = horizontal ? ((app.x - 100) / 800) * TRACK_LENGTH : ((vBase - app.y) / (vBase - vTop)) * TRACK_LENGTH;
      const snappedS = Math.round((Math.max(0, Math.min(TRACK_LENGTH, rawM)) - r.setup.startPos) * 2) / 2;
      onSetupChange({ displacement: Math.max(-r.setup.startPos, Math.min(TRACK_LENGTH - r.setup.startPos, snappedS)) });
    } else if (drag.target === 'force' && !lockMap.force) {
      // Relative drag: the arrow tip moves with the cursor at the scale frozen when the drag began.
      const dist = Math.hypot(app.x - cartX, app.y - (cartY + 6));
      if (drag.startDist < 0) drag.startDist = dist;
      const mag = drag.startMag + (dist - drag.startDist) / drag.k;
      onSetupChange({ forceN: Math.max(0, Math.min(200, Math.round(mag / 5) * 5)) });
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<HTMLDivElement>) => finishInteraction(e, false);
  const handleCanvasPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => finishInteraction(e, true);

  // Touch pinch-to-zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchDistanceRef.current !== null) {
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        const svg = svgRef.current;
        const v = svg ? clientToViewBox(svg, midX, midY) : null;
        if (v) zoomAroundViewPoint(dist / touchDistanceRef.current, v.x, v.y);
      }
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  const isCartSelected = selectedObjectId === 'cart' || selectedObjectId === 'CART_01';
  const isForceSelected = selectedObjectId === 'force' || selectedObjectId === 'F_APP';
  const isTrackSelected = selectedObjectId === 'track' || selectedObjectId === 'Linear_Track';
  const isCaliperSelected = selectedObjectId === 'caliper' || selectedObjectId === 'DISP_01';

  return (
    <section className="flex-1 flex flex-col bg-surface-container-lowest relative overflow-hidden border-r border-outline-variant h-full select-none">
      {/* Viewport Canvas Arena */}
      <div
        ref={containerRef}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerCancel={handleCanvasPointerCancel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
        className={`flex-1 relative ${showGrid ? 'cad-grid' : ''} overflow-hidden flex flex-col justify-between ${
          toolMode === 'pan' ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
        }`}
      >
        {/* Floating Mini Viewport Toolbar (Top Left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center space-x-1 max-w-[calc(100%-1.5rem)] overflow-x-auto no-scrollbar bg-surface-container/90 backdrop-blur border border-outline-variant p-1 rounded shadow-md">
          {/* Select Tool */}
          <button
            type="button"
            onClick={() => setToolMode('select')}
            className={`p-1 rounded transition-colors ${
              toolMode === 'select'
                ? 'bg-primary text-on-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
            title="Select Tool (Click to select, drag to position)"
            aria-pressed={toolMode === 'select'}
          >
            <span className="material-symbols-outlined text-[16px]">arrow_selector_tool</span>
          </button>

          {/* Pan Tool */}
          <button
            type="button"
            onClick={() => setToolMode(toolMode === 'pan' ? 'select' : 'pan')}
            className={`p-1 rounded transition-colors ${
              toolMode === 'pan'
                ? 'bg-primary text-on-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
            }`}
            title="Pan Tool (Click and drag to pan viewport)"
            aria-pressed={toolMode === 'pan'}
          >
            <span className="material-symbols-outlined text-[16px]">pan_tool</span>
          </button>

          {/* Fit to Scene */}
          <button
            type="button"
            onClick={handleFit}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            title="Fit to Scene (Frame active experiment apparatus)"
            aria-label="Fit to Scene"
          >
            <span className="material-symbols-outlined text-[16px]">aspect_ratio</span>
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={resetCamera}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors"
            title="Reset Camera (100% Zoom, Centered)"
            aria-label="Reset Camera"
          >
            <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
          </button>

          {/* Zoom In (+) */}
          <button
            type="button"
            onClick={zoomIn}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_in</span>
          </button>

          {/* Zoom Out (-) */}
          <button
            type="button"
            onClick={zoomOut}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <span className="material-symbols-outlined text-[16px]">zoom_out</span>
          </button>

          <span className="font-mono text-[10px] text-outline px-1">
            {Math.round(camera.zoom * 100)}%
          </span>

          <div className="h-4 w-px bg-outline-variant mx-1" />

          {/* Vectors Toggle Pill */}
          <button
            type="button"
            onClick={() => handleToggleVectors(!vectorsOn)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center space-x-1 transition-colors shrink-0 ${
              vectorsOn ? 'bg-surface-variant text-primary border border-primary/40' : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">navigation</span>
            <span className="hidden sm:inline">Vectors: {vectorsOn ? 'ON' : 'OFF'}</span>
            <span className="sm:hidden">Vec</span>
          </button>

          {/* Grid Toggle */}
          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ${
              showGrid ? 'bg-surface-variant text-primary' : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            Grid
          </button>

          {/* Show Weight & Normal Forces Toggle */}
          <button
            type="button"
            onClick={() => onShowVerticalChange(!showVertical)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors shrink-0 ${
              showVertical ? 'bg-surface-variant text-secondary' : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
          >
            <span className="hidden sm:inline">{showVertical ? 'W & N: ON' : 'W & N: OFF'}</span>
            <span className="sm:hidden">W&N</span>
          </button>
        </div>

        {/* Floating Viewport Telemetry HUD (Desktop only - hidden on mobile to avoid viewport clutter) */}
        <div className="hidden sm:block absolute top-3 right-3 z-20 bg-surface-container/85 border border-outline-variant px-2.5 py-1 rounded text-right font-mono text-[11px] text-on-surface-variant shadow-sm backdrop-blur">
          <div className="text-[10px] uppercase text-outline">
            Cam: {horizontal ? 'Orthographic 1D-X' : 'Vertical Rail 1D-Y'} • {Math.round(camera.zoom * 100)}%
          </div>
          <div className="text-on-surface font-semibold">Track: 0 – {TRACK_LENGTH} m</div>
          <div className="text-tertiary text-[10px]">
            Model: Kinematic Work • v: {velNow} m/s
          </div>
        </div>

        {/* 2D Physics Vector Field & Track SVG Rendering with Camera Transform */}
        <div className="w-full h-full relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={alt}
            className="w-full h-full max-h-[500px]"
            data-testid="work-svg"
          >
            <defs>
              <marker id="arrow-violet" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="3.5">
                <polygon fill="#adc6ff" points="0 0, 8 3.5, 0 7" />
              </marker>
              <marker id="arrow-coral" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="3.5">
                <polygon fill="#ffb4ab" points="0 0, 8 3.5, 0 7" />
              </marker>
              <marker id="arrow-green" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="3.5">
                <polygon fill="#4edea3" points="0 0, 8 3.5, 0 7" />
              </marker>
              <marker id="arrow-amber" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="3.5">
                <polygon fill="#ffb95a" points="0 0, 8 3.5, 0 7" />
              </marker>
              <pattern height="8" id="hatch" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse" width="8">
                <line stroke="#31353e" strokeWidth="1.5" x1="0" x2="0" y1="0" y2="8" />
              </pattern>
            </defs>

            {/* MASTER CAMERA TRANSFORM GROUP (Centered Zoom & Pan in Vector Space) */}
            <g transform={`translate(${500 + camera.panX}, ${225 + camera.panY}) scale(${camera.zoom}) translate(-500, -225)`}>
              {/* WORKBENCH REFERENCE TRACK */}
              {showTrack && (horizontal ? (
                <g
                  onClick={() => onSelectObject && onSelectObject('track')}
                  className="cursor-pointer"
                >
                  {/* Track selection outline */}
                  {isTrackSelected && (
                    <rect
                      fill="none"
                      height="40"
                      stroke="#00d4ff"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      width="870"
                      x="65"
                      y={ground - 5}
                      rx="4"
                    />
                  )}
                  {/* Support Bench / Ground Plane */}
                  <rect fill="#181c24" height="20" stroke="#424754" strokeWidth="1.5" width="860" x="70" y={ground} />
                  <rect fill="url(#hatch)" height="15" stroke="#31353e" strokeWidth="1" width="860" x="70" y={ground + 20} />
                  <line stroke="#8c909f" strokeLinecap="round" strokeWidth="3" x1="70" x2="930" y1={ground} y2={ground} />

                  {/* Major Meter Ticks [0, 2, 4, 6, 8, 10, 12] */}
                  {[0, 2, 4, 6, 8, 10, 12].map((m) => (
                    <g key={m}>
                      <line stroke="#dfe2ee" strokeWidth={m === 0 || m === 12 ? 2.5 : 1.5} x1={px(m)} x2={px(m)} y1={ground - 5} y2={ground + 10} />
                      <text fill="#8c909f" fontFamily="JetBrains Mono" fontSize={11} textAnchor="middle" x={px(m)} y={ground + 24}>
                        {m}.0 m
                      </text>
                    </g>
                  ))}
                </g>
              ) : (
                <g
                  onClick={() => onSelectObject && onSelectObject('track')}
                  className="cursor-pointer"
                >
                  {/* Vertical Rail */}
                  <line stroke="#8c909f" strokeLinecap="round" strokeWidth="6" x1="380" x2="380" y1={vBase + 20} y2={vTop - 20} />
                  {[0, 2, 4, 6, 8, 10, 12].map((m) => (
                    <g key={m}>
                      <line stroke="#dfe2ee" strokeWidth={2} x1="372" x2="388" y1={py(m)} y2={py(m)} />
                      <text fill="#8c909f" fontFamily="JetBrains Mono" fontSize={11} textAnchor="end" x="364" y={py(m) + 4}>
                        {m}.0 m
                      </text>
                    </g>
                  ))}
                </g>
              ))}

              {/* START & END GUIDELINES */}
              {s !== 0 && (
                <g data-testid="start-end-markers">
                  {horizontal ? (
                    <>
                      <line opacity="0.6" stroke="#4d8eff" strokeDasharray="4,4" strokeWidth="1.5" x1={startX} x2={startX} y1={ground - 130} y2={ground} />
                      <text fill="#adc6ff" fontFamily="JetBrains Mono" fontSize={11} fontWeight={600} textAnchor={startX < endX ? 'end' : 'start'} x={startX < endX ? startX - 8 : startX + 8} y={ground - 120}>
                        start {fmt(startPos)} m
                      </text>
                      <line opacity="0.7" stroke="#4edea3" strokeDasharray="4,4" strokeWidth="1.5" x1={endX} x2={endX} y1={ground - 130} y2={ground} />
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize={11} fontWeight={600} textAnchor={startX < endX ? 'start' : 'end'} x={startX < endX ? endX + 8 : endX - 8} y={ground - 120}>
                        end {fmt(endPos)} m
                      </text>
                    </>
                  ) : (
                    <>
                      <line opacity="0.6" stroke="#4d8eff" strokeDasharray="4,4" strokeWidth="1.5" x1="320" x2="480" y1={startY} y2={startY} />
                      <text fill="#adc6ff" fontFamily="JetBrains Mono" fontSize={11} fontWeight={600} x="490" y={startY + 4}>
                        start {fmt(startPos)} m
                      </text>
                      <line opacity="0.7" stroke="#4edea3" strokeDasharray="4,4" strokeWidth="1.5" x1="320" x2="480" y1={endY} y2={endY} />
                      <text fill="#4edea3" fontFamily="JetBrains Mono" fontSize={11} fontWeight={600} x="490" y={endY + 4}>
                        end {fmt(endPos)} m
                      </text>
                    </>
                  )}
                </g>
              )}

              {/* DISPLACEMENT CALIPER BRACKET (Manipulable) */}
              {s !== 0 && showCaliper && (
                <g
                  data-testid="displacement-arrow"
                  onPointerDown={(e) => beginObjectDrag(e, 'caliper', 'caliper')}
                  className={`${horizontal ? 'cursor-ew-resize' : 'cursor-ns-resize'} group`}
                >
                  {horizontal ? (
                    <>
                      <path
                        d={`M ${startX} ${ground - 90} L ${startX} ${ground - 100} L ${(startX + endX) / 2} ${ground - 100} L ${(startX + endX) / 2} ${ground - 106} L ${(startX + endX) / 2} ${ground - 100} L ${endX} ${ground - 100} L ${endX} ${ground - 90}`}
                        fill="none"
                        stroke={isCaliperSelected ? '#00d4ff' : '#6ffbbe'}
                        strokeWidth={isCaliperSelected ? '2.5' : '2'}
                      />
                      <g transform={`translate(${(startX + endX) / 2}, ${ground - 116})`}>
                        <rect fill="#0a0e16" height="22" rx="4" stroke={isCaliperSelected ? '#00d4ff' : '#4edea3'} strokeWidth="1.2" width="220" x="-110" y="-13" />
                        <text fill="#6ffbbe" fontFamily="JetBrains Mono" fontSize={11} fontWeight={700} textAnchor="middle" x="0" y="2">
                          displacement s = {fmtSigned(s)} m
                        </text>
                      </g>
                    </>
                  ) : (
                    <>
                      <path
                        d={`M 460 ${startY} L 470 ${startY} L 470 ${(startY + endY) / 2} L 476 ${(startY + endY) / 2} L 470 ${(startY + endY) / 2} L 470 ${endY} L 460 ${endY}`}
                        fill="none"
                        stroke={isCaliperSelected ? '#00d4ff' : '#6ffbbe'}
                        strokeWidth={isCaliperSelected ? '2.5' : '2'}
                      />
                      <g transform={`translate(550, ${(startY + endY) / 2})`}>
                        <rect fill="#0a0e16" height="22" rx="4" stroke={isCaliperSelected ? '#00d4ff' : '#4edea3'} strokeWidth="1.2" width="140" x="-70" y="-11" />
                        <text fill="#6ffbbe" fontFamily="JetBrains Mono" fontSize={11} fontWeight={700} textAnchor="middle" x="0" y="4">
                          s = {fmtSigned(s)} m
                        </text>
                      </g>
                    </>
                  )}
                </g>
              )}

              {/* DYNAMIC CART ASSEMBLY (CART_01 - Manipulable x_0) */}
              {showCart && <g
                id="cart-assembly"
                transform={`translate(${cartX - 55}, ${cartY - 15})`}
                onPointerDown={(e) => beginObjectDrag(e, 'cart', 'cart')}
                className={`${horizontal ? 'cursor-ew-resize' : 'cursor-ns-resize'} group`}
              >
                {/* Selection Halo */}
                {isCartSelected && (
                  <rect
                    fill="none"
                    height="54"
                    rx="6"
                    stroke="#00d4ff"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    width="122"
                    x="-6"
                    y="-6"
                    className="animate-pulse"
                  />
                )}
                {/* Chassis Body */}
                <rect fill="#262a33" height="42" rx="4" stroke={isCartSelected ? '#00d4ff' : '#424754'} strokeWidth="2" width="110" x="0" y="0" />
                <rect fill="#1c2028" height="12" rx="2" stroke="#31353e" strokeWidth="1" width="100" x="5" y="4" />
                <text fill="#adc6ff" fontFamily="JetBrains Mono" fontSize={9} fontWeight={600} textAnchor="middle" x="55" y="13">
                  CART_01 ({fmt(r.setup.massKg)} kg)
                </text>
                <rect fill="#181c24" height="14" rx="1.5" stroke="#424754" width="22" x="10" y="20" />
                <circle cx="21" cy="27" fill="#ffb95a" r="3" />
                <text fill="#c2c6d6" fontFamily="JetBrains Mono" fontSize={8} x="36" y="30">
                  ACCEL_SENS_X
                </text>
                {/* Wheel Bearings */}
                <circle cx="20" cy="46" fill="#31353e" r="7" stroke="#dfe2ee" strokeWidth="2" />
                <circle cx="20" cy="46" fill="#adc6ff" r="2.5" />
                <circle cx="90" cy="46" fill="#31353e" r="7" stroke="#dfe2ee" strokeWidth="2" />
                <circle cx="90" cy="46" fill="#adc6ff" r="2.5" />
                {/* Center of Mass Indicator */}
                <circle cx="55" cy="21" fill="#dfe2ee" r="4.5" stroke="#0a0e16" strokeWidth="1.5" />
                <path d="M 50.5 21 A 4.5 4.5 0 0 0 55 25.5 L 55 21 Z" fill="#4d8eff" />
                <path d="M 55 16.5 A 4.5 4.5 0 0 0 50.5 21 L 55 21 Z" fill="#0a0e16" />
              </g>}

              {/* FORCE VECTORS ANCHORED AT CENTER OF MASS (Manipulable F_APP) */}
              {vectorsOn &&
                r.forces
                  .filter((f) => f.magnitude > 0)
                  .map((f) => {
                    if (!showVertical && (f.id === 'weight' || f.id === 'normal')) return null;

                    const biggest = Math.max(1, ...r.forces.map((x) => x.magnitude));
                    const k = 90 / biggest;
                    const L = Math.max(25, Math.min(130, f.magnitude * k));
                    const ux = f.fx / f.magnitude;
                    const uy = -f.fy / f.magnitude; // screen Y down

                    const comX = cartX;
                    const comY = cartY + 6;
                    const x2 = comX + ux * L;
                    const y2 = comY + uy * L;

                    const markerMap: Record<ForceKind, string> = {
                      applied: 'url(#arrow-violet)',
                      friction: 'url(#arrow-coral)',
                      weight: 'url(#arrow-amber)',
                      normal: 'url(#arrow-green)',
                    };

                    const labelX = x2 + (ux > 0.3 ? 12 : ux < -0.3 ? -12 : 0);
                    const labelY = y2 + (uy > 0.3 ? 16 : uy < -0.3 ? -10 : 4);

                    const isThisForceSelected = isForceSelected && f.id === 'applied';

                    return (
                      <g
                        key={f.id}
                        data-arrow={f.id}
                        data-magnitude={f.magnitude}
                        data-work={f.work}
                        onPointerDown={(e) =>
                          f.id === 'applied'
                            ? beginObjectDrag(e, 'force', 'force', { startMag: f.magnitude, k })
                            : beginObjectDrag(e, 'select', 'cart')
                        }
                        className="cursor-pointer"
                      >
                        {/* Wide invisible hit area so thin arrows are easy to grab */}
                        <line x1={comX} y1={comY} x2={x2} y2={y2} stroke="transparent" strokeWidth={18} />
                        <line
                          x1={comX}
                          y1={comY}
                          x2={x2}
                          y2={y2}
                          stroke={isThisForceSelected ? '#00d4ff' : COLOR[f.id]}
                          strokeWidth={isThisForceSelected ? 4.5 : f.id === 'applied' ? 3.5 : 2.5}
                          markerEnd={markerMap[f.id]}
                        />
                        <g transform={`translate(${labelX}, ${labelY})`}>
                          <rect
                            fill="#0f131b"
                            height="20"
                            rx="3"
                            stroke={isThisForceSelected ? '#00d4ff' : COLOR[f.id]}
                            strokeWidth={isThisForceSelected ? 1.5 : 1}
                            width={f.label.length * 7 + 60}
                            x={ux < -0.3 ? -(f.label.length * 7 + 60) : 0}
                            y="-10"
                          />
                          <text
                            fill={isThisForceSelected ? '#00d4ff' : COLOR[f.id]}
                            fontFamily="JetBrains Mono"
                            fontSize="11"
                            fontWeight="700"
                            x={ux < -0.3 ? -((f.label.length * 7 + 60) / 2) : (f.label.length * 7 + 60) / 2}
                            y="4"
                            textAnchor="middle"
                          >
                            {TAG[f.id]} = {fmt(f.magnitude)} N
                          </text>
                        </g>
                      </g>
                    );
                  })}

              {/* Net Force Indicator Vector (dashed) */}
              {vectorsOn && r.appliedWork !== 0 && (
                <g transform={`translate(${cartX}, ${cartY + 36})`}>
                  <line
                    markerEnd="url(#arrow-green)"
                    stroke="#6ffbbe"
                    strokeDasharray="3,3"
                    strokeWidth="1.5"
                    x1="0"
                    x2={Math.min(70, Math.max(-70, r.applied.alongAxis * 2))}
                    y1="0"
                    y2="0"
                  />
                  <text fill="#6ffbbe" fontFamily="JetBrains Mono" fontSize={10} textAnchor="middle" x={r.applied.alongAxis > 0 ? 35 : -35} y="-5">
                    ΣF = {fmtSigned(r.applied.alongAxis)} N
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* In-Canvas Quick State Annotation (Desktop only to maximize mobile viewport) */}
        <div className="hidden sm:flex absolute bottom-2 left-3 font-mono text-[10px] sm:text-xs text-outline items-center space-x-2 sm:space-x-3 bg-surface-container/80 px-2.5 py-1 rounded border border-outline-variant/40 backdrop-blur">
          <span>RIG: Linear 1-DOF Dynamics</span>
          <span>•</span>
          <span className="text-tertiary font-bold">Work = F · Δx · cos(θ)</span>
          <span>•</span>
          <span className="text-on-surface">θ = {angle}° (cos θ = {cosA.toFixed(2)})</span>
        </div>
      </div>

      {/* Docked Bottom Transport / Playback Strip */}
      <div className="h-11 sm:h-12 bg-surface-container border-t border-outline-variant px-2 sm:px-4 flex items-center justify-between z-30 select-none overflow-x-auto no-scrollbar">
        {/* Playback action buttons */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0" role="group" aria-label="Playback Controls">
          <button
            type="button"
            onClick={onTogglePlay}
            disabled={!r.valid || s === 0}
            data-testid="work-play"
            className={`h-7 sm:h-8 px-2.5 sm:px-3.5 rounded font-mono text-xs font-semibold flex items-center space-x-1 sm:space-x-1.5 transition-all shadow-sm active:translate-y-px disabled:opacity-40 disabled:pointer-events-none shrink-0 ${
              playing
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-primary text-on-primary hover:bg-primary-light'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">
              {playing ? 'pause' : progress >= 1 ? 'replay' : 'play_arrow'}
            </span>
            <span>{playing ? 'Pause' : progress >= 1 ? 'Replay' : 'Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const next = Math.min(1, progress + 0.05);
              onProgressChange(next);
            }}
            className="h-7 sm:h-8 px-1.5 sm:px-2 bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface rounded font-mono text-[10px] sm:text-[11px] flex items-center space-x-0.5 sm:space-x-1 transition-colors shrink-0"
            title="Step Forward +0.05s"
          >
            <span className="material-symbols-outlined text-[14px] sm:text-[15px]">step</span>
            <span>+0.05</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            data-testid="work-reset"
            className="h-7 w-7 sm:h-8 sm:w-8 bg-surface-container-high border border-outline-variant text-on-surface-variant hover:text-on-surface rounded flex items-center justify-center transition-colors shrink-0"
            title="Reset to Start"
          >
            <span className="material-symbols-outlined text-[15px] sm:text-[16px]">restart_alt</span>
          </button>
        </div>

        {/* Central Timeline Scrub Track */}
        <div className="flex-1 max-w-xs sm:max-w-md mx-2 sm:mx-6 flex items-center space-x-1.5 sm:space-x-3 min-w-[100px]">
          <span className="font-mono text-[10px] sm:text-[11px] text-primary whitespace-nowrap">
            t = {simTime}s
          </span>
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onChange={(e) => onProgressChange(Number(e.target.value))}
              aria-label="How far through the displacement"
              aria-valuetext={`${Math.round(progress * 100)} percent of displacement`}
              data-testid="work-progress"
              className="w-full h-1.5 bg-surface-container-lowest rounded-lg appearance-none cursor-pointer accent-primary border border-outline-variant"
            />
          </div>
          <span className="font-mono text-[10px] sm:text-[11px] text-outline whitespace-nowrap hidden sm:inline">
            T_max = {SIM_SECONDS.toFixed(2)}s
          </span>
        </div>

        {/* Live Model Telemetry Readouts */}
        <div className="hidden lg:flex items-center space-x-4 border-l border-outline-variant pl-4">
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase text-outline">Velocity (v)</span>
            <span className="font-mono text-xs text-primary font-semibold">{velNow} m/s</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase text-outline">Acceleration (a)</span>
            <span className="font-mono text-xs text-secondary font-semibold">{accelNow} m/s²</span>
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[9px] uppercase text-outline">Cart Mass (m)</span>
            <span className="font-mono text-xs text-on-surface">{fmt(r.setup.massKg)} kg</span>
          </div>
        </div>
      </div>

      {/* Hidden DOM element for position test expectation */}
      <span className="sr-only" data-testid="work-position">
        Position now: {fmt(here.position)} m &middot; work done by the applied force so far: {fmtSigned(here.byForce.applied)} J
      </span>
    </section>
  );
};
