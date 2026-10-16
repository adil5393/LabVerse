/**
 * Interactive Cartesian Mathematical Canvas for LabVerse Mathematics Laboratory
 *
 * Implements SVG Cartesian coordinate plane with:
 * - Mathematical world coordinates (positive Y pointing upward)
 * - Fine/major grid ticks and adaptive axis numbers
 * - 5px pointer drag threshold with pointer capture
 * - Independent point dragging with instant dependent geometry updates
 * - Dashed right-triangle Pythagorean constructions for distance experiment
 * - Smart-TV touch and desktop mouse support
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useMathStore } from '../../store/useMathStore';
import {
  mathToScreen,
  screenToMath,
  snapToMathGrid,
  calculateAdaptiveTickInterval,
  getVisibleMathBounds,
} from '../../engine/mathematics/coordinates';
import { calculateDistanceAnalysis } from '../../engine/mathematics/calculations';
import type { MathPoint, MathSegment } from '../../engine/mathematics/types';

const DRAG_THRESHOLD_PX = 5;

export const MathCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const {
    objects,
    selectedId,
    activeTool,
    viewport,
    snapToGrid,
    gridSnapStep,
    showGrid,
    showAxes,
    showCoordinates,
    showConstructions,
    selectObject,
    setPointCoordinates,
    updatePointDrag,
    commitPointDrag,
    addObject,
    panBy,
    setViewport,
  } = useMathStore();

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 600 });
  const [cursorMathCoords, setCursorMathCoords] = useState<{ x: number; y: number } | null>(null);

  // Drag interaction state
  const dragRef = useRef<{
    isDragging: boolean;
    dragStarted: boolean;
    pointId: string;
    startClientX: number;
    startClientY: number;
    initialMathX: number;
    initialMathY: number;
    pointerId: number;
  } | null>(null);

  // Pan interaction state
  const panRef = useRef<{
    isPanning: boolean;
    startClientX: number;
    startClientY: number;
    pointerId: number;
  } | null>(null);

  // Resize observer to keep SVG responsive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasDimensions({ width, height });
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Compute points and segments
  const points = useMemo(() => {
    return Object.values(objects).filter((obj): obj is MathPoint => obj.kind === 'point');
  }, [objects]);

  const segments = useMemo(() => {
    return Object.values(objects).filter((obj): obj is MathSegment => obj.kind === 'segment');
  }, [objects]);

  // Points map for fast lookup
  const pointsMap = useMemo(() => {
    const map = new Map<string, MathPoint>();
    for (const p of points) map.set(p.id, p);
    return map;
  }, [points]);

  // Distance construction for the first experiment (points A and B)
  const distanceAnalysis = useMemo(() => {
    const ptA = pointsMap.get('pt_A') || points[0];
    const ptB = pointsMap.get('pt_B') || points[1];
    if (ptA && ptB && ptA.id !== ptB.id) {
      return calculateDistanceAnalysis(ptA, ptB);
    }
    return null;
  }, [pointsMap, points]);

  // Compute visible math bounds and grid lines
  const { minX, maxX, minY, maxY } = useMemo(() => {
    return getVisibleMathBounds(canvasDimensions.width, canvasDimensions.height, viewport);
  }, [canvasDimensions, viewport]);

  const { majorStep, minorStep } = useMemo(() => {
    return calculateAdaptiveTickInterval(viewport.zoom, viewport.unitPixels);
  }, [viewport.zoom, viewport.unitPixels]);

  // Generate grid tick values
  const { majorXTicks, minorXTicks, majorYTicks, minorYTicks } = useMemo(() => {
    const startX = Math.floor(minX / majorStep) * majorStep;
    const endX = Math.ceil(maxX / majorStep) * majorStep;
    const startY = Math.floor(minY / majorStep) * majorStep;
    const endY = Math.ceil(maxY / majorStep) * majorStep;

    const majorX: number[] = [];
    const minorX: number[] = [];
    const majorY: number[] = [];
    const minorY: number[] = [];

    // X ticks
    for (let x = startX; x <= endX; x += majorStep) {
      majorX.push(Number(x.toFixed(4)));
    }
    if (minorStep < majorStep) {
      const startMinorX = Math.floor(minX / minorStep) * minorStep;
      const endMinorX = Math.ceil(maxX / minorStep) * minorStep;
      for (let x = startMinorX; x <= endMinorX; x += minorStep) {
        if (Math.abs(x % majorStep) > 1e-5) {
          minorX.push(Number(x.toFixed(4)));
        }
      }
    }

    // Y ticks
    for (let y = startY; y <= endY; y += majorStep) {
      majorY.push(Number(y.toFixed(4)));
    }
    if (minorStep < majorStep) {
      const startMinorY = Math.floor(minY / minorStep) * minorStep;
      const endMinorY = Math.ceil(maxY / minorStep) * minorStep;
      for (let y = startMinorY; y <= endMinorY; y += minorStep) {
        if (Math.abs(y % majorStep) > 1e-5) {
          minorY.push(Number(y.toFixed(4)));
        }
      }
    }

    return { majorXTicks: majorX, minorXTicks: minorX, majorYTicks: majorY, minorYTicks: minorY };
  }, [minX, maxX, minY, maxY, majorStep, minorStep]);

  // Screen position of Origin (0,0)
  const originScreen = useMemo(() => {
    return mathToScreen(0, 0, viewport);
  }, [viewport]);

  // Handle pointer down on point (starts drag candidate with threshold)
  const handlePointPointerDown = (
    e: React.PointerEvent<SVGGElement>,
    point: MathPoint
  ) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only primary button

    selectObject(point.id);

    dragRef.current = {
      isDragging: true,
      dragStarted: false,
      pointId: point.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialMathX: point.x,
      initialMathY: point.y,
      pointerId: e.pointerId,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // Pointer move on point
  const handlePointPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag || !drag.isDragging || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startClientX;
    const deltaY = e.clientY - drag.startClientY;
    const distanceMoved = Math.hypot(deltaX, deltaY);

    if (!drag.dragStarted) {
      if (distanceMoved < DRAG_THRESHOLD_PX) {
        return; // Threshold not yet exceeded
      }
      drag.dragStarted = true;
    }

    // Convert current pointer to screen offset and math coordinates
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const rawMath = screenToMath(screenX, screenY, viewport);
    let targetX = rawMath.x;
    let targetY = rawMath.y;

    if (snapToGrid) {
      targetX = snapToMathGrid(targetX, gridSnapStep);
      targetY = snapToMathGrid(targetY, gridSnapStep);
    }

    updatePointDrag(drag.pointId, targetX, targetY);
  };

  // Pointer up on point
  const handlePointPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (drag.dragStarted) {
      commitPointDrag(drag.pointId);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture already lost
    }

    dragRef.current = null;
  };

  // Cancel drag on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dragRef.current && dragRef.current.isDragging) {
        const { pointId, initialMathX, initialMathY } = dragRef.current;
        setPointCoordinates(pointId, initialMathX, initialMathY, false);
        dragRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setPointCoordinates]);

  // Canvas background pointer down (pan or placement)
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current && (e.target as HTMLElement).tagName !== 'rect') return;

    // Check if middle click or space key or pan mode
    if (e.button === 1 || e.button === 0) {
      // If clicking on empty canvas with select tool, deselect
      if (activeTool === 'select' && e.button === 0) {
        selectObject(null);
      }

      if (activeTool === 'point' && e.button === 0) {
        // Place a new point
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const math = screenToMath(screenX, screenY, viewport);
        const finalX = snapToGrid ? snapToMathGrid(math.x, gridSnapStep) : Number(math.x.toFixed(2));
        const finalY = snapToGrid ? snapToMathGrid(math.y, gridSnapStep) : Number(math.y.toFixed(2));

        const nextLetter = String.fromCharCode(65 + (points.length % 26));
        const newPointId = `pt_${Date.now()}`;
        const newPoint: MathPoint = {
          id: newPointId,
          kind: 'point',
          label: nextLetter,
          x: finalX,
          y: finalY,
          isDraggable: true,
          color: '#38bdf8',
          radius: 7,
        };
        addObject(newPoint);
        return;
      }

      // Start canvas panning
      panRef.current = {
        isPanning: true,
        startClientX: e.clientX,
        startClientY: e.clientY,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    // Update cursor coordinate readout
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const math = screenToMath(screenX, screenY, viewport);
      setCursorMathCoords({
        x: Number(math.x.toFixed(2)),
        y: Number(math.y.toFixed(2)),
      });
    }

    // Handle canvas panning
    const pan = panRef.current;
    if (pan && pan.isPanning && pan.pointerId === e.pointerId) {
      const deltaX = e.clientX - pan.startClientX;
      const deltaY = e.clientY - pan.startClientY;
      pan.startClientX = e.clientX;
      pan.startClientY = e.clientY;
      panBy(deltaX, deltaY);
    }
  };

  const handleCanvasPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const pan = panRef.current;
    if (pan && pan.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      panRef.current = null;
    }
  };

  // Wheel zoom towards pointer position
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const pointerScreenX = e.clientX - rect.left;
      const pointerScreenY = e.clientY - rect.top;

      // Mathematical coordinate under the pointer before zoom
      const mathBefore = screenToMath(pointerScreenX, pointerScreenY, viewport);

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.2, Math.min(4.0, viewport.zoom * zoomFactor));

      // Calculate new pan so the math point stays exactly under pointer
      const effectiveScale = viewport.unitPixels * newZoom;
      const newPanX = pointerScreenX - mathBefore.x * effectiveScale;
      const newPanY = pointerScreenY + mathBefore.y * effectiveScale;

      setViewport({
        zoom: Number(newZoom.toFixed(3)),
        panX: Number(newPanX.toFixed(2)),
        panY: Number(newPanY.toFixed(2)),
      });
    },
    [viewport, setViewport]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#090d14] overflow-hidden select-none touch-none workbench-mat"
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="w-full h-full cursor-crosshair"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        <defs>
          {/* Arrow markers for axes */}
          <marker
            id="axis-arrow-x"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
          </marker>
          <marker
            id="axis-arrow-y"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* 1. Grid Lines Layer */}
        {showGrid && (
          <g id="math-grid-lines" pointerEvents="none">
            {/* Minor Grid Lines */}
            {minorXTicks.map((x) => {
              const sx = mathToScreen(x, 0, viewport).x;
              return (
                <line
                  key={`minor-x-${x}`}
                  x1={sx}
                  y1={0}
                  x2={sx}
                  y2={canvasDimensions.height}
                  stroke="rgba(148, 163, 184, 0.08)"
                  strokeWidth="1"
                />
              );
            })}
            {minorYTicks.map((y) => {
              const sy = mathToScreen(0, y, viewport).y;
              return (
                <line
                  key={`minor-y-${y}`}
                  x1={0}
                  y1={sy}
                  x2={canvasDimensions.width}
                  y2={sy}
                  stroke="rgba(148, 163, 184, 0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Major Grid Lines */}
            {majorXTicks.map((x) => {
              if (Math.abs(x) < 1e-5) return null; // Skip axis itself
              const sx = mathToScreen(x, 0, viewport).x;
              return (
                <line
                  key={`major-x-${x}`}
                  x1={sx}
                  y1={0}
                  x2={sx}
                  y2={canvasDimensions.height}
                  stroke="rgba(148, 163, 184, 0.22)"
                  strokeWidth="1"
                />
              );
            })}
            {majorYTicks.map((y) => {
              if (Math.abs(y) < 1e-5) return null; // Skip axis itself
              const sy = mathToScreen(0, y, viewport).y;
              return (
                <line
                  key={`major-y-${y}`}
                  x1={0}
                  y1={sy}
                  x2={canvasDimensions.width}
                  y2={sy}
                  stroke="rgba(148, 163, 184, 0.22)"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}

        {/* 2. Cartesian Axes Layer */}
        {showAxes && (
          <g id="math-axes" pointerEvents="none">
            {/* X-Axis */}
            <line
              x1={0}
              y1={originScreen.y}
              x2={canvasDimensions.width - 12}
              y2={originScreen.y}
              stroke="#94a3b8"
              strokeWidth="2"
              markerEnd="url(#axis-arrow-x)"
            />
            {/* X-Axis label */}
            <text
              x={canvasDimensions.width - 24}
              y={originScreen.y - 10}
              fill="#cbd5e1"
              fontSize="14"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              x
            </text>

            {/* Y-Axis */}
            <line
              x1={originScreen.x}
              y1={canvasDimensions.height}
              x2={originScreen.x}
              y2={12}
              stroke="#94a3b8"
              strokeWidth="2"
              markerEnd="url(#axis-arrow-y)"
            />
            {/* Y-Axis label */}
            <text
              x={originScreen.x + 12}
              y={24}
              fill="#cbd5e1"
              fontSize="14"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              y
            </text>

            {/* Origin indicator (0,0) */}
            <circle cx={originScreen.x} cy={originScreen.y} r={3.5} fill="#94a3b8" />
            <text
              x={originScreen.x - 14}
              y={originScreen.y + 16}
              fill="#64748b"
              fontSize="11"
              fontFamily="JetBrains Mono"
            >
              O
            </text>

            {/* Ticks and numeric coordinate labels */}
            {majorXTicks.map((x) => {
              if (Math.abs(x) < 1e-5) return null;
              const sx = mathToScreen(x, 0, viewport).x;
              const sy = originScreen.y;
              return (
                <g key={`tick-x-${x}`}>
                  <line x1={sx} y1={sy - 4} x2={sx} y2={sy + 4} stroke="#94a3b8" strokeWidth="1.5" />
                  <text
                    x={sx}
                    y={sy + 16}
                    fill="#94a3b8"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono"
                    textAnchor="middle"
                  >
                    {x}
                  </text>
                </g>
              );
            })}

            {majorYTicks.map((y) => {
              if (Math.abs(y) < 1e-5) return null;
              const sx = originScreen.x;
              const sy = mathToScreen(0, y, viewport).y;
              return (
                <g key={`tick-y-${y}`}>
                  <line x1={sx - 4} y1={sy} x2={sx + 4} y2={sy} stroke="#94a3b8" strokeWidth="1.5" />
                  <text
                    x={sx - 8}
                    y={sy + 3.5}
                    fill="#94a3b8"
                    fontSize="10.5"
                    fontFamily="JetBrains Mono"
                    textAnchor="end"
                  >
                    {y}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 3. Distance Experiment Constructions Layer (Dashed Right Triangle) */}
        {showConstructions && distanceAnalysis && (
          <g id="distance-constructions">
            {(() => {
              const { p1, p2, dx, dy, absDx, absDy } = distanceAnalysis;
              const sA = mathToScreen(p1.x, p1.y, viewport);
              const sB = mathToScreen(p2.x, p2.y, viewport);
              // Third vertex C is at (x2, y1)
              const sC = mathToScreen(p2.x, p1.y, viewport);

              // Don't render triangle if points are collinear horizontally or vertically
              const isDegenerate = Math.abs(dx) < 1e-4 || Math.abs(dy) < 1e-4;

              return (
                <>
                  {/* Shaded Right Triangle Body */}
                  {!isDegenerate && (
                    <polygon
                      points={`${sA.x},${sA.y} ${sC.x},${sC.y} ${sB.x},${sB.y}`}
                      fill="rgba(168, 85, 247, 0.08)"
                      stroke="none"
                      pointerEvents="none"
                    />
                  )}

                  {/* Horizontal Leg: from A(x1, y1) to C(x2, y1) */}
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sC.x}
                    y2={sC.y}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeDasharray="5,4"
                    pointerEvents="none"
                  />

                  {/* Vertical Leg: from C(x2, y1) to B(x2, y2) */}
                  <line
                    x1={sC.x}
                    y1={sC.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke="#fb923c"
                    strokeWidth="2"
                    strokeDasharray="5,4"
                    pointerEvents="none"
                  />

                  {/* Right Angle Symbol at Corner C(x2, y1) */}
                  {!isDegenerate && (() => {
                    const size = 12;
                    const dirX = sA.x < sC.x ? -1 : 1;
                    const dirY = sB.y < sC.y ? -1 : 1;
                    return (
                      <path
                        d={`M ${sC.x + dirX * size} ${sC.y} L ${sC.x + dirX * size} ${sC.y + dirY * size} L ${sC.x} ${sC.y + dirY * size}`}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        pointerEvents="none"
                      />
                    );
                  })()}

                  {/* Horizontal Difference Badge: Δx = |x2 - x1| */}
                  <g transform={`translate(${(sA.x + sC.x) / 2}, ${sA.y + (p2.y > p1.y ? 16 : -16)})`}>
                    <rect
                      x="-28"
                      y="-10"
                      width="56"
                      height="20"
                      rx="5"
                      fill="#0f172a"
                      stroke="#38bdf8"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#7dd3fc"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Δx = {absDx}
                    </text>
                  </g>

                  {/* Vertical Difference Badge: Δy = |y2 - y1| */}
                  <g transform={`translate(${sC.x + (p2.x > p1.x ? 18 : -18)}, ${(sC.y + sB.y) / 2})`}>
                    <rect
                      x="-28"
                      y="-10"
                      width="56"
                      height="20"
                      rx="5"
                      fill="#0f172a"
                      stroke="#fb923c"
                      strokeWidth="1.2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.6))"
                    />
                    <text
                      x="0"
                      y="4"
                      fill="#fdba74"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      Δy = {absDy}
                    </text>
                  </g>
                </>
              );
            })()}
          </g>
        )}

        {/* 4. Segments Layer */}
        <g id="math-segments">
          {segments.map((seg) => {
            const pA = pointsMap.get(seg.pointAId);
            const pB = pointsMap.get(seg.pointBId);
            if (!pA || !pB) return null;

            const sA = mathToScreen(pA.x, pA.y, viewport);
            const sB = mathToScreen(pB.x, pB.y, viewport);
            const isSelected = selectedId === seg.id;
            const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);

            // Midpoint screen position for length badge
            const midScreenX = (sA.x + sB.x) / 2;
            const midScreenY = (sA.y + sB.y) / 2;

            return (
              <g
                key={seg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectObject(seg.id);
                }}
                className="cursor-pointer group"
              >
                {/* Generous invisible stroke for hit testing */}
                <line
                  x1={sA.x}
                  y1={sA.y}
                  x2={sB.x}
                  y2={sB.y}
                  stroke="transparent"
                  strokeWidth="20"
                />

                {/* Selection halo */}
                {isSelected && (
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke="#c084fc"
                    strokeWidth="7"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                )}

                {/* Visible segment core */}
                <line
                  x1={sA.x}
                  y1={sA.y}
                  x2={sB.x}
                  y2={sB.y}
                  stroke={isSelected ? '#d8b4fe' : seg.color || '#a855f7'}
                  strokeWidth={seg.strokeWidth || 3}
                  strokeLinecap="round"
                  className="transition-colors group-hover:stroke-[#c084fc]"
                />

                {/* Length badge pill */}
                <g transform={`translate(${midScreenX}, ${midScreenY - 14})`}>
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="6"
                    fill="#1e1b4b"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.7))"
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#f3e8ff"
                    fontSize="11"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    d ≈ {dist.toFixed(2)}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 5. Points Layer */}
        <g id="math-points">
          {points.map((pt) => {
            const screen = mathToScreen(pt.x, pt.y, viewport);
            const isSelected = selectedId === pt.id;
            const ptColor = pt.color || '#4d8eff';

            return (
              <g
                key={pt.id}
                transform={`translate(${screen.x}, ${screen.y})`}
                onPointerDown={(e) => handlePointPointerDown(e, pt)}
                onPointerMove={handlePointPointerMove}
                onPointerUp={handlePointPointerUp}
                className="cursor-grab active:cursor-grabbing group/pt"
              >
                {/* 36px generous hit area for touch displays and mouse */}
                <circle cx={0} cy={0} r={20} fill="transparent" />

                {/* Glowing Outer Selection Ring */}
                {isSelected && (
                  <circle
                    cx={0}
                    cy={0}
                    r={14}
                    fill="none"
                    stroke={ptColor}
                    strokeWidth="2.5"
                    strokeOpacity="0.8"
                    filter={`drop-shadow(0 0 6px ${ptColor})`}
                  />
                )}

                {/* Point Body */}
                <circle
                  cx={0}
                  cy={0}
                  r={pt.radius || 7.5}
                  fill={ptColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="drop-shadow(0 1px 3px rgba(0,0,0,0.8))"
                  className="transition-transform group-hover/pt:scale-110"
                />

                {/* Point Center Highlight */}
                <circle cx={0} cy={0} r={2} fill="#ffffff" pointerEvents="none" />

                {/* Label and Coordinate Tag */}
                {showCoordinates && (
                  <g transform="translate(12, -12)" pointerEvents="none">
                    <rect
                      x="-2"
                      y="-12"
                      width={Math.max(54, (pt.label.length + 8) * 7)}
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity="0.85"
                      stroke={ptColor}
                      strokeWidth="1"
                    />
                    <text
                      x="4"
                      y="1"
                      fill="#f8fafc"
                      fontSize="10.5"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {pt.label}({pt.x}, {pt.y})
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Bottom Coordinate Readout HUD */}
      <div className="absolute bottom-3 left-4 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-lowest/90 backdrop-blur border border-surface-border text-xs font-mono text-slate-300 pointer-events-none shadow-lg">
        <span className="flex items-center gap-1.5 text-primary">
          <span className="material-symbols-outlined text-[15px]">location_searching</span>
          <span>CURSOR:</span>
        </span>
        <span>
          X: <strong className="text-white">{cursorMathCoords ? cursorMathCoords.x : '0.00'}</strong>
        </span>
        <span>
          Y: <strong className="text-white">{cursorMathCoords ? cursorMathCoords.y : '0.00'}</strong>
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-slate-400">
          Zoom: <strong className="text-slate-200">{Math.round(viewport.zoom * 100)}%</strong>
        </span>
        {snapToGrid && (
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">grid_on</span>
            <span>SNAP (1.0)</span>
          </span>
        )}
      </div>

      {/* Bottom Right TV/Touch Hint */}
      <div className="absolute bottom-3 right-4 hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-surface-lowest/80 text-[11px] font-mono text-slate-400 border border-surface-border/60 pointer-events-none">
        <span>Drag points A & B to explore distance formula</span>
      </div>
    </div>
  );
};
