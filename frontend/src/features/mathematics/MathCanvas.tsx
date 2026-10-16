/**
 * Interactive Cartesian Mathematical Canvas for LabVerse Mathematics Laboratory
 *
 * Implements complete tool interactions and lifecycle:
 * - Select / Move (V)
 * - Point placement with auto-labels (P)
 * - Line Segment construction with live rubberband preview (S)
 * - Infinite Line with viewport clipping (L)
 * - Distance Measurement between any two points (M)
 * - Pan & Navigate (H)
 * - Drag threshold (5px), Escape cancellation, and Smart-TV touch support.
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
import {
  calculateDistanceAnalysis,
  calculateInfiniteLineEndpoints,
  calculateLineAnalysis,
} from '../../engine/mathematics/calculations';
import { hexToRgba } from '../../engine/mathematics/appearance';
import type { MathPoint, MathSegment, MathLine } from '../../engine/mathematics/types';

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
    constructionState,
    defaultColors,
    selectObject,
    setPointCoordinates,
    updatePointDrag,
    commitPointDrag,
    startConstruction,
    updateConstructionPreview,
    cancelConstruction,
    createPoint,
    createSegment,
    createLine,
    deleteObject,
    setTool,
    measurements,
    measurementOrder,
    selectedMeasurementId,
    selectMeasurement,
    createMeasurement,
    deleteMeasurement,
    panBy,
    setViewport,
  } = useMathStore();

  const [canvasDimensions, setCanvasDimensions] = useState({ width: 900, height: 600 });
  const [cursorMathCoords, setCursorMathCoords] = useState<{ x: number; y: number } | null>(null);
  const [hoveredDeleteId, setHoveredDeleteId] = useState<string | null>(null);

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

  // Compute points, segments, lines
  const points = useMemo(() => {
    return Object.values(objects).filter((obj): obj is MathPoint => obj.kind === 'point');
  }, [objects]);

  const segments = useMemo(() => {
    return Object.values(objects).filter((obj): obj is MathSegment => obj.kind === 'segment');
  }, [objects]);

  const lines = useMemo(() => {
    return Object.values(objects).filter((obj): obj is MathLine => obj.kind === 'line');
  }, [objects]);

  // Points map for fast lookup
  const pointsMap = useMemo(() => {
    const map = new Map<string, MathPoint>();
    for (const p of points) map.set(p.id, p);
    return map;
  }, [points]);

  // Compute visible math bounds and grid lines
  const visibleBounds = useMemo(() => {
    return getVisibleMathBounds(canvasDimensions.width, canvasDimensions.height, viewport);
  }, [canvasDimensions, viewport]);

  const { minX, maxX, minY, maxY } = visibleBounds;

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



  // First point for active construction
  const constructionFirstPoint = useMemo(() => {
    if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
      return pointsMap.get(constructionState.firstPointId) || null;
    }
    return null;
  }, [constructionState, pointsMap]);

  // Handle pointer down on a point
  const handlePointPointerDown = (
    e: React.PointerEvent<SVGGElement>,
    point: MathPoint
  ) => {
    e.stopPropagation();
    if (e.button !== 0) return;

    // 0. Eraser tool: delete point immediately (cascades to dependent segments/lines in store)
    if (activeTool === 'eraser') {
      deleteObject(point.id);
      if (hoveredDeleteId === point.id) setHoveredDeleteId(null);
      return;
    }

    // 1. Line Segment tool construction
    if (activeTool === 'segment') {
      if (constructionState.stage === 'idle') {
        startConstruction(point.id);
        return;
      } else if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
        if (constructionState.firstPointId !== point.id) {
          createSegment(constructionState.firstPointId, point.id);
        }
        return;
      }
    }

    // 2. Line tool construction
    if (activeTool === 'line') {
      if (constructionState.stage === 'idle') {
        startConstruction(point.id);
        return;
      } else if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
        if (constructionState.firstPointId !== point.id) {
          createLine(constructionState.firstPointId, point.id);
        }
        return;
      }
    }

    // 3. Distance Measure tool
    if (activeTool === 'distance') {
      if (constructionState.stage === 'idle') {
        startConstruction(point.id);
        return;
      } else if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
        if (constructionState.firstPointId !== point.id) {
          createMeasurement(constructionState.firstPointId, point.id);
        }
        cancelConstruction();
        return;
      }
    }

    // 4. Pan tool: ignore point selection, start pan
    if (activeTool === 'pan') {
      panRef.current = {
        isPanning: true,
        startClientX: e.clientX,
        startClientY: e.clientY,
        pointerId: e.pointerId,
      };
      e.currentTarget.setPointerCapture(e.pointerId);
      return;
    }

    // 5. Select / Move tool: select and start drag candidate
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

  // Pointer move on a point (for dragging)
  const handlePointPointerMove = (e: React.PointerEvent<SVGGElement>) => {
    // If in Pan tool, delegate to canvas pan
    const pan = panRef.current;
    if (pan && pan.isPanning && pan.pointerId === e.pointerId) {
      const deltaX = e.clientX - pan.startClientX;
      const deltaY = e.clientY - pan.startClientY;
      pan.startClientX = e.clientX;
      pan.startClientY = e.clientY;
      panBy(deltaX, deltaY);
      return;
    }

    const drag = dragRef.current;
    if (!drag || !drag.isDragging || drag.pointerId !== e.pointerId) return;

    const deltaX = e.clientX - drag.startClientX;
    const deltaY = e.clientY - drag.startClientY;
    const distanceMoved = Math.hypot(deltaX, deltaY);

    if (!drag.dragStarted) {
      if (distanceMoved < DRAG_THRESHOLD_PX) {
        return;
      }
      drag.dragStarted = true;
    }

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

  // Pointer up on a point
  const handlePointPointerUp = (e: React.PointerEvent<SVGGElement>) => {
    const pan = panRef.current;
    if (pan && pan.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      panRef.current = null;
      return;
    }

    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    if (drag.dragStarted) {
      commitPointDrag(drag.pointId);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }

    dragRef.current = null;
  };

  // Keyboard shortcut for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 1. Cancel active point drag
        if (dragRef.current && dragRef.current.isDragging) {
          const { pointId, initialMathX, initialMathY } = dragRef.current;
          setPointCoordinates(pointId, initialMathX, initialMathY, false);
          dragRef.current = null;
          return;
        }
        // 2. Cancel active construction before clearing selection
        if (constructionState.stage !== 'idle') {
          cancelConstruction();
          return;
        }
        // 3. Clear selected measurement if any
        if (selectedMeasurementId) {
          selectMeasurement(null);
          return;
        }
        // 4. Clear selection if an object is selected
        if (selectedId) {
          selectObject(null);
          return;
        }
        // 5. If in eraser tool, return to select tool
        if (activeTool === 'eraser') {
          setTool('select');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    setPointCoordinates,
    cancelConstruction,
    selectObject,
    selectMeasurement,
    constructionState.stage,
    selectedId,
    selectedMeasurementId,
    activeTool,
    setTool,
  ]);

  // Canvas background pointer down (click / creation / pan)
  const handleCanvasPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0 && e.button !== 1) return;

    // 0. Eraser tool on empty canvas: do nothing (do not create points, pan, or drag)
    if (activeTool === 'eraser') {
      return;
    }

    // 0b. Distance tool on empty canvas: cancel construction or deselect measurement
    if (activeTool === 'distance' && e.button === 0) {
      if (constructionState.stage !== 'idle') {
        cancelConstruction();
      } else {
        selectMeasurement(null);
      }
      return;
    }

    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const mathRaw = screenToMath(screenX, screenY, viewport);
    const mathCoord = {
      x: snapToGrid ? snapToMathGrid(mathRaw.x, gridSnapStep) : Number(mathRaw.x.toFixed(4)),
      y: snapToGrid ? snapToMathGrid(mathRaw.y, gridSnapStep) : Number(mathRaw.y.toFixed(4)),
    };

    // 1. Point tool: create new point
    if (activeTool === 'point' && e.button === 0) {
      createPoint(mathCoord.x, mathCoord.y);
      return;
    }

    // 2. Segment tool on empty canvas: create point 1 or point 2
    if (activeTool === 'segment' && e.button === 0) {
      if (constructionState.stage === 'idle') {
        const newP1 = createPoint(mathCoord.x, mathCoord.y);
        startConstruction(newP1.id);
        return;
      } else if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
        const newP2 = createPoint(mathCoord.x, mathCoord.y);
        createSegment(constructionState.firstPointId, newP2.id);
        return;
      }
    }

    // 3. Line tool on empty canvas: create point 1 or point 2
    if (activeTool === 'line' && e.button === 0) {
      if (constructionState.stage === 'idle') {
        const newP1 = createPoint(mathCoord.x, mathCoord.y);
        startConstruction(newP1.id);
        return;
      } else if (constructionState.stage === 'selecting_second' && constructionState.firstPointId) {
        const newP2 = createPoint(mathCoord.x, mathCoord.y);
        createLine(constructionState.firstPointId, newP2.id);
        return;
      }
    }

    // 4. Select tool: clicking empty space deselects
    if (activeTool === 'select' && e.button === 0) {
      selectObject(null);
      selectMeasurement(null);
    }

    // 5. Pan tool or middle-drag or background-drag in select tool: start canvas pan
    if (activeTool === 'pan' || activeTool === 'select' || e.button === 1) {
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
      const mathSnap = {
        x: snapToGrid ? snapToMathGrid(math.x, gridSnapStep) : Number(math.x.toFixed(2)),
        y: snapToGrid ? snapToMathGrid(math.y, gridSnapStep) : Number(math.y.toFixed(2)),
      };
      setCursorMathCoords(mathSnap);

      // Update construction rubberband preview
      if (constructionState.stage === 'selecting_second') {
        updateConstructionPreview(mathSnap);
      }
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

      const mathBefore = screenToMath(pointerScreenX, pointerScreenY, viewport);
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.max(0.2, Math.min(4.0, viewport.zoom * zoomFactor));

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

  // Determine cursor based on tool and pan state
  const canvasCursorClass = useMemo(() => {
    if (activeTool === 'pan') {
      return panRef.current?.isPanning ? 'cursor-grabbing' : 'cursor-grab';
    }
    if (activeTool === 'point' || activeTool === 'segment' || activeTool === 'line') {
      return 'cursor-crosshair';
    }
    if (activeTool === 'distance' || activeTool === 'eraser') {
      return 'cursor-pointer';
    }
    return 'cursor-default';
  }, [activeTool]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-[#090d14] overflow-hidden select-none touch-none workbench-mat ${canvasCursorClass}`}
      onWheel={handleWheel}
    >
      <svg
        ref={svgRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="w-full h-full"
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
      >
        <defs>
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
            {majorXTicks.map((x) => {
              if (Math.abs(x) < 1e-5) return null;
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
              if (Math.abs(y) < 1e-5) return null;
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
            <line
              x1={0}
              y1={originScreen.y}
              x2={canvasDimensions.width - 12}
              y2={originScreen.y}
              stroke="#94a3b8"
              strokeWidth="2"
              markerEnd="url(#axis-arrow-x)"
            />
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

            <line
              x1={originScreen.x}
              y1={canvasDimensions.height}
              x2={originScreen.x}
              y2={12}
              stroke="#94a3b8"
              strokeWidth="2"
              markerEnd="url(#axis-arrow-y)"
            />
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

        {/* 3. Infinite Lines Layer */}
        <g id="math-infinite-lines">
          {lines.map((line) => {
            const pA = pointsMap.get(line.pointAId);
            const pB = pointsMap.get(line.pointBId);
            if (!pA || !pB) return null;

            const clip = calculateInfiniteLineEndpoints(pA, pB, visibleBounds);
            if (!clip) return null;

            const s1 = mathToScreen(clip[0].x, clip[0].y, viewport);
            const s2 = mathToScreen(clip[1].x, clip[1].y, viewport);
            const isSelected = selectedId === line.id;
            const analysis = calculateLineAnalysis(pA, pB);
            const lineColor = line.color || defaultColors.line;

            // Midpoint on screen for line badge
            const midScreenX = (s1.x + s2.x) / 2;
            const midScreenY = (s1.y + s2.y) / 2;

            return (
              <g
                key={line.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTool === 'eraser') {
                    deleteObject(line.id);
                    if (hoveredDeleteId === line.id) setHoveredDeleteId(null);
                    return;
                  }
                  selectObject(line.id);
                }}
                onPointerEnter={() => {
                  if (activeTool === 'eraser') setHoveredDeleteId(line.id);
                }}
                onPointerLeave={() => {
                  if (hoveredDeleteId === line.id) setHoveredDeleteId(null);
                }}
                className="cursor-pointer group"
              >
                {/* Hit testing area */}
                <line
                  x1={s1.x}
                  y1={s1.y}
                  x2={s2.x}
                  y2={s2.y}
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Eraser hover highlight */}
                {activeTool === 'eraser' && hoveredDeleteId === line.id && (
                  <line
                    x1={s1.x}
                    y1={s1.y}
                    x2={s2.x}
                    y2={s2.y}
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeOpacity="0.85"
                  />
                )}

                {/* Selection halo */}
                {isSelected && activeTool !== 'eraser' && (
                  <line
                    x1={s1.x}
                    y1={s1.y}
                    x2={s2.x}
                    y2={s2.y}
                    stroke={lineColor}
                    strokeWidth="7"
                    strokeOpacity="0.4"
                  />
                )}

                {/* Main line body */}
                <line
                  x1={s1.x}
                  y1={s1.y}
                  x2={s2.x}
                  y2={s2.y}
                  stroke={lineColor}
                  strokeWidth={line.strokeWidth || 2.5}
                  strokeDasharray={line.style === 'dashed' ? '6,4' : undefined}
                  className="transition-colors group-hover:opacity-90"
                />

                {/* Equation badge pill */}
                <g transform={`translate(${midScreenX}, ${midScreenY - 14})`}>
                  <rect
                    x="-45"
                    y="-11"
                    width="90"
                    height="22"
                    rx="6"
                    fill="#0f172a"
                    stroke={lineColor}
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.7))"
                  />
                  <text
                    x="0"
                    y="4"
                    fill={lineColor}
                    fontSize="10"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {analysis.equation}
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        {/* 4. Persistent Measurements Layer */}
        <g id="math-measurements">
          {measurementOrder.map((measId) => {
            const meas = measurements[measId];
            if (!meas) return null;
            const p1 = pointsMap.get(meas.pointAId);
            const p2 = pointsMap.get(meas.pointBId);
            if (!p1 || !p2) return null;

            const analysis = calculateDistanceAnalysis(p1, p2);
            const { dx, dy, absDx, absDy, formattedDistance } = analysis;

            const sA = mathToScreen(p1.x, p1.y, viewport);
            const sB = mathToScreen(p2.x, p2.y, viewport);
            // Helper C = (p2.x, p1.y) -> (x2, y1)
            const sC = mathToScreen(p2.x, p1.y, viewport);
            // Helper D = (p1.x, p2.y) -> (x1, y2)
            const sD = mathToScreen(p1.x, p2.y, viewport);

            const isDegenerate = Math.abs(dx) < 1e-4 || Math.abs(dy) < 1e-4;
            const isSelected = selectedMeasurementId === meas.id;
            const isHoveredEraser = activeTool === 'eraser' && hoveredDeleteId === meas.id;
            const anySelected = Boolean(selectedMeasurementId);

            const midScreenX = (sA.x + sB.x) / 2;
            const midScreenY = (sA.y + sB.y) / 2;

            const triangleMode = meas.triangleMode || 'horizontal-then-vertical';
            const measColor = meas.color || defaultColors.measurement;
            const renderHV = triangleMode === 'horizontal-then-vertical' || triangleMode === 'both';
            const renderVH = triangleMode === 'vertical-then-horizontal' || triangleMode === 'both';

            const size = 12;
            const dirX_C = sA.x < sC.x ? -1 : 1;
            const dirY_C = sB.y < sC.y ? -1 : 1;
            const dirX_D = sB.x < sD.x ? -1 : 1;
            const dirY_D = sA.y < sD.y ? -1 : 1;

            return (
              <g
                key={meas.id}
                className={`transition-opacity ${
                  anySelected && !isSelected ? 'opacity-65' : 'opacity-100'
                }`}
              >
                {/* 4a. Auxiliary Helper Right-Triangles (rendered when showConstructions is true) */}
                {showConstructions && (
                  <g pointerEvents="none">
                    {/* Shaded Area */}
                    {!isDegenerate && (
                      <polygon
                        points={
                          triangleMode === 'both'
                            ? `${sA.x},${sA.y} ${sC.x},${sC.y} ${sB.x},${sB.y} ${sD.x},${sD.y}`
                            : triangleMode === 'vertical-then-horizontal'
                            ? `${sA.x},${sA.y} ${sD.x},${sD.y} ${sB.x},${sB.y}`
                            : `${sA.x},${sA.y} ${sC.x},${sC.y} ${sB.x},${sB.y}`
                        }
                        fill={hexToRgba(measColor, 0.08)}
                        stroke="none"
                      />
                    )}

                    {/* Horizontal-then-Vertical (Helper C) Guides */}
                    {renderHV && (
                      <>
                        {/* Horizontal Leg (A -> C) */}
                        <line
                          x1={sA.x}
                          y1={sA.y}
                          x2={sC.x}
                          y2={sC.y}
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="5,4"
                        />
                        {/* Vertical Leg (C -> B) */}
                        <line
                          x1={sC.x}
                          y1={sC.y}
                          x2={sB.x}
                          y2={sB.y}
                          stroke="#fb923c"
                          strokeWidth="2"
                          strokeDasharray="5,4"
                        />
                        {/* Right Angle Corner Marker at C */}
                        {!isDegenerate && (
                          <path
                            d={`M ${sC.x + dirX_C * size} ${sC.y} L ${sC.x + dirX_C * size} ${
                              sC.y + dirY_C * size
                            } L ${sC.x} ${sC.y + dirY_C * size}`}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                          />
                        )}
                        {/* Δx Badge */}
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
                        {/* Δy Badge */}
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
                    )}

                    {/* Vertical-then-Horizontal (Helper D) Guides */}
                    {renderVH && (
                      <>
                        {/* Vertical Leg (A -> D) */}
                        <line
                          x1={sA.x}
                          y1={sA.y}
                          x2={sD.x}
                          y2={sD.y}
                          stroke="#fb923c"
                          strokeWidth="2"
                          strokeDasharray="5,4"
                        />
                        {/* Horizontal Leg (D -> B) */}
                        <line
                          x1={sD.x}
                          y1={sD.y}
                          x2={sB.x}
                          y2={sB.y}
                          stroke="#38bdf8"
                          strokeWidth="2"
                          strokeDasharray="5,4"
                        />
                        {/* Right Angle Corner Marker at D */}
                        {!isDegenerate && (
                          <path
                            d={`M ${sD.x} ${sD.y + dirY_D * size} L ${sD.x + dirX_D * size} ${
                              sD.y + dirY_D * size
                            } L ${sD.x + dirX_D * size} ${sD.y}`}
                            fill="none"
                            stroke="#94a3b8"
                            strokeWidth="1.5"
                          />
                        )}
                        {/* If not in 'both' mode, render Δ badges along D legs */}
                        {triangleMode === 'vertical-then-horizontal' && (
                          <>
                            <g transform={`translate(${sD.x + (p2.x > p1.x ? -20 : 20)}, ${(sA.y + sD.y) / 2})`}>
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
                            <g transform={`translate(${(sD.x + sB.x) / 2}, ${sD.y + (p2.y > p1.y ? -16 : 16)})`}>
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
                          </>
                        )}
                      </>
                    )}
                  </g>
                )}

                {/* 4b. Hypotenuse and Interactive Measurement Badge */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      deleteMeasurement(meas.id);
                      if (hoveredDeleteId === meas.id) setHoveredDeleteId(null);
                      return;
                    }
                    selectMeasurement(meas.id);
                  }}
                  onPointerEnter={() => {
                    if (activeTool === 'eraser') setHoveredDeleteId(meas.id);
                  }}
                  onPointerLeave={() => {
                    if (hoveredDeleteId === meas.id) setHoveredDeleteId(null);
                  }}
                  className="cursor-pointer group"
                >
                  {/* Invisible broad hit testing line */}
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* Eraser hover highlight */}
                  {isHoveredEraser && (
                    <line
                      x1={sA.x}
                      y1={sA.y}
                      x2={sB.x}
                      y2={sB.y}
                      stroke="#ef4444"
                      strokeWidth="8"
                      strokeOpacity="0.85"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Selection glow */}
                  {isSelected && !isHoveredEraser && (
                    <line
                      x1={sA.x}
                      y1={sA.y}
                      x2={sB.x}
                      y2={sB.y}
                      stroke={measColor}
                      strokeWidth="7"
                      strokeOpacity="0.4"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main Hypotenuse Line */}
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke={measColor}
                    strokeWidth={isSelected ? 3.5 : 2.5}
                    strokeDasharray="6,4"
                    className="transition-colors group-hover:opacity-90"
                  />

                  {/* Interactive Distance Pill Badge */}
                  <g transform={`translate(${midScreenX}, ${midScreenY - 14})`}>
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="7"
                      fill="#0f172a"
                      stroke={isHoveredEraser ? '#ef4444' : isSelected ? '#ffffff' : measColor}
                      strokeWidth={isSelected ? '2' : '1.3'}
                      filter="drop-shadow(0 2px 6px rgba(0,0,0,0.75))"
                      className="transition-all"
                    />
                    <text
                      x="0"
                      y="4"
                      fill={measColor}
                      fontSize="11"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      d ≈ {formattedDistance}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* 5. Segments Layer */}
        <g id="math-segments">
          {segments.map((seg) => {
            const pA = pointsMap.get(seg.pointAId);
            const pB = pointsMap.get(seg.pointBId);
            if (!pA || !pB) return null;

            const sA = mathToScreen(pA.x, pA.y, viewport);
            const sB = mathToScreen(pB.x, pB.y, viewport);
            const isSelected = selectedId === seg.id;
            const dist = Math.hypot(pB.x - pA.x, pB.y - pA.y);
            const segColor = seg.color || defaultColors.segment;

            const midScreenX = (sA.x + sB.x) / 2;
            const midScreenY = (sA.y + sB.y) / 2;

            return (
              <g
                key={seg.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTool === 'eraser') {
                    deleteObject(seg.id);
                    if (hoveredDeleteId === seg.id) setHoveredDeleteId(null);
                    return;
                  }
                  selectObject(seg.id);
                }}
                onPointerEnter={() => {
                  if (activeTool === 'eraser') setHoveredDeleteId(seg.id);
                }}
                onPointerLeave={() => {
                  if (hoveredDeleteId === seg.id) setHoveredDeleteId(null);
                }}
                className="cursor-pointer group"
              >
                <line
                  x1={sA.x}
                  y1={sA.y}
                  x2={sB.x}
                  y2={sB.y}
                  stroke="transparent"
                  strokeWidth="24"
                />

                {/* Eraser hover highlight */}
                {activeTool === 'eraser' && hoveredDeleteId === seg.id && (
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeOpacity="0.85"
                    strokeLinecap="round"
                  />
                )}

                {isSelected && activeTool !== 'eraser' && (
                  <line
                    x1={sA.x}
                    y1={sA.y}
                    x2={sB.x}
                    y2={sB.y}
                    stroke={segColor}
                    strokeWidth="7"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                  />
                )}

                <line
                  x1={sA.x}
                  y1={sA.y}
                  x2={sB.x}
                  y2={sB.y}
                  stroke={segColor}
                  strokeWidth={seg.strokeWidth || 3}
                  strokeLinecap="round"
                  className="transition-colors group-hover:opacity-90"
                />

                <g transform={`translate(${midScreenX}, ${midScreenY - 14})`}>
                  <rect
                    x="-34"
                    y="-11"
                    width="68"
                    height="22"
                    rx="6"
                    fill="#0f172a"
                    stroke={segColor}
                    strokeWidth="1.5"
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.7))"
                  />
                  <text
                    x="0"
                    y="4"
                    fill={segColor}
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

        {/* 6. Active Construction Rubberband Preview Layer */}
        {constructionFirstPoint && constructionState.previewCoord && (
          <g id="math-construction-preview" pointerEvents="none">
            {(() => {
              const s1 = mathToScreen(constructionFirstPoint.x, constructionFirstPoint.y, viewport);
              const p2 = constructionState.previewCoord;
              const s2 = mathToScreen(p2.x, p2.y, viewport);
              const previewDist = Math.hypot(p2.x - constructionFirstPoint.x, p2.y - constructionFirstPoint.y);

              // Segment Rubberband
              if (activeTool === 'segment') {
                return (
                  <>
                    <line
                      x1={s1.x}
                      y1={s1.y}
                      x2={s2.x}
                      y2={s2.y}
                      stroke={defaultColors.segment}
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                    />
                    <circle cx={s2.x} cy={s2.y} r="5" fill={defaultColors.segment} stroke="#ffffff" strokeWidth="1.5" />
                    <g transform={`translate(${(s1.x + s2.x) / 2}, ${(s1.y + s2.y) / 2 - 12})`}>
                      <rect x="-30" y="-10" width="60" height="20" rx="5" fill="#0f172a" stroke={defaultColors.segment} strokeWidth="1" />
                      <text x="0" y="4" fill={defaultColors.segment} fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">
                        {previewDist.toFixed(2)}
                      </text>
                    </g>
                  </>
                );
              }

              // Infinite Line Rubberband
              if (activeTool === 'line') {
                const clip = calculateInfiniteLineEndpoints(constructionFirstPoint, p2, visibleBounds);
                if (!clip) return null;
                const cs1 = mathToScreen(clip[0].x, clip[0].y, viewport);
                const cs2 = mathToScreen(clip[1].x, clip[1].y, viewport);
                return (
                  <>
                    <line
                      x1={cs1.x}
                      y1={cs1.y}
                      x2={cs2.x}
                      y2={cs2.y}
                      stroke={defaultColors.line}
                      strokeWidth="2.5"
                      strokeDasharray="6,4"
                    />
                    <circle cx={s2.x} cy={s2.y} r="5" fill={defaultColors.line} stroke="#ffffff" strokeWidth="1.5" />
                  </>
                );
              }

              // Distance Tool Preview
              if (activeTool === 'distance') {
                const sC = mathToScreen(p2.x, constructionFirstPoint.y, viewport);
                const absDx = Math.abs(p2.x - constructionFirstPoint.x);
                const absDy = Math.abs(p2.y - constructionFirstPoint.y);
                const isDegenerate = absDx < 1e-4 || absDy < 1e-4;
                const dirX = s1.x < sC.x ? -1 : 1;
                const dirY = s2.y < sC.y ? -1 : 1;

                return (
                  <>
                    {/* Shaded right triangle preview */}
                    {!isDegenerate && (
                      <polygon
                        points={`${s1.x},${s1.y} ${sC.x},${sC.y} ${s2.x},${s2.y}`}
                        fill={hexToRgba(defaultColors.measurement, 0.08)}
                        stroke="none"
                      />
                    )}
                    {/* Horizontal preview leg */}
                    <line
                      x1={s1.x}
                      y1={s1.y}
                      x2={sC.x}
                      y2={sC.y}
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    {/* Vertical preview leg */}
                    <line
                      x1={sC.x}
                      y1={sC.y}
                      x2={s2.x}
                      y2={s2.y}
                      stroke="#fb923c"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                    />
                    {/* Right-angle marker preview */}
                    {!isDegenerate && (
                      <path
                        d={`M ${sC.x + dirX * 10} ${sC.y} L ${sC.x + dirX * 10} ${sC.y + dirY * 10} L ${sC.x} ${sC.y + dirY * 10}`}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      />
                    )}
                    {/* Δx Badge */}
                    <g transform={`translate(${(s1.x + sC.x) / 2}, ${s1.y + (p2.y > constructionFirstPoint.y ? 16 : -16)})`}>
                      <rect x="-26" y="-9" width="52" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                      <text x="0" y="3.5" fill="#7dd3fc" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        Δx = {absDx.toFixed(1)}
                      </text>
                    </g>
                    {/* Δy Badge */}
                    <g transform={`translate(${sC.x + (p2.x > constructionFirstPoint.x ? 18 : -18)}, ${(sC.y + s2.y) / 2})`}>
                      <rect x="-26" y="-9" width="52" height="18" rx="4" fill="#0f172a" stroke="#fb923c" strokeWidth="1" />
                      <text x="0" y="3.5" fill="#fdba74" fontSize="9.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        Δy = {absDy.toFixed(1)}
                      </text>
                    </g>
                    {/* Hypotenuse line */}
                    <line
                      x1={s1.x}
                      y1={s1.y}
                      x2={s2.x}
                      y2={s2.y}
                      stroke={defaultColors.measurement}
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                    />
                    {/* Pointer circle at preview endpoint */}
                    <circle cx={s2.x} cy={s2.y} r="5" fill={defaultColors.measurement} stroke="#ffffff" strokeWidth="1.5" />
                    {/* Hypotenuse distance pill */}
                    <g transform={`translate(${(s1.x + s2.x) / 2}, ${(s1.y + s2.y) / 2 - 12})`}>
                      <rect x="-34" y="-11" width="68" height="22" rx="6" fill="#0f172a" stroke={defaultColors.measurement} strokeWidth="1.2" />
                      <text x="0" y="4" fill={defaultColors.measurement} fontSize="10.5" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        d ≈ {previewDist.toFixed(2)}
                      </text>
                    </g>
                  </>
                );
              }

              return null;
            })()}
          </g>
        )}

        {/* 7. Points Layer */}
        <g id="math-points">
          {points.map((pt) => {
            const screen = mathToScreen(pt.x, pt.y, viewport);
            const isSelected = selectedId === pt.id;
            const isFirstConstructPoint =
              constructionState.stage === 'selecting_second' && constructionState.firstPointId === pt.id;
            const ptColor = isFirstConstructPoint ? '#22c55e' : pt.color || defaultColors.point;

            return (
              <g
                key={pt.id}
                transform={`translate(${screen.x}, ${screen.y})`}
                onPointerDown={(e) => handlePointPointerDown(e, pt)}
                onPointerMove={handlePointPointerMove}
                onPointerUp={handlePointPointerUp}
                onPointerEnter={() => {
                  if (activeTool === 'eraser') setHoveredDeleteId(pt.id);
                }}
                onPointerLeave={() => {
                  if (hoveredDeleteId === pt.id) setHoveredDeleteId(null);
                }}
                className={
                  activeTool === 'pan'
                    ? 'cursor-grab'
                    : activeTool === 'eraser'
                    ? 'cursor-pointer group/pt'
                    : 'cursor-grab active:cursor-grabbing group/pt'
                }
              >
                <circle cx={0} cy={0} r={22} fill="transparent" />

                {/* Eraser hover target highlight */}
                {activeTool === 'eraser' && hoveredDeleteId === pt.id && (
                  <>
                    <circle
                      cx={0}
                      cy={0}
                      r={18}
                      fill="rgba(239, 68, 68, 0.25)"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="4,2"
                      className="animate-pulse"
                    />
                    <g transform="translate(0, -22)" pointerEvents="none">
                      <rect x="-20" y="-8" width="40" height="16" rx="3" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                      <text x="0" y="4" fill="#fecaca" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                        ERASE
                      </text>
                    </g>
                  </>
                )}

                {/* Construction target pulsing halo */}
                {isFirstConstructPoint && (
                  <circle
                    cx={0}
                    cy={0}
                    r={16}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeDasharray="4,3"
                    className="animate-spin origin-center"
                  />
                )}

                {/* Selected object halo */}
                {isSelected && !isFirstConstructPoint && activeTool !== 'eraser' && (
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

                {/* Point body */}
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

                <circle cx={0} cy={0} r={2} fill="#ffffff" pointerEvents="none" />

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
                      fill={ptColor}
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

      {/* Top Contextual Instructions Banner */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-surface-lowest/90 backdrop-blur border border-surface-border text-xs font-mono text-slate-300 shadow-xl flex items-center gap-2">
          {activeTool === 'select' && (
            <>
              <span className="material-symbols-outlined text-primary text-[16px]">touch_app</span>
              <span>Select objects to inspect or drag points. Drag canvas to pan.</span>
            </>
          )}
          {activeTool === 'pan' && (
            <>
              <span className="material-symbols-outlined text-amber-400 text-[16px]">drag_pan</span>
              <span>Pan mode: Click & drag anywhere to navigate plane. Wheel to zoom.</span>
            </>
          )}
          {activeTool === 'point' && (
            <>
              <span className="material-symbols-outlined text-sky-400 text-[16px]">adjust</span>
              <span>Point: Click anywhere on Cartesian plane to create a point.</span>
            </>
          )}
          {activeTool === 'segment' && (
            <>
              <span className="material-symbols-outlined text-purple-400 text-[16px]">linear_scale</span>
              <span>
                {constructionState.stage === 'idle'
                  ? 'Segment: Click the first point (or click empty space to place it).'
                  : 'Click the second point to connect segment (Esc to cancel).'}
              </span>
            </>
          )}
          {activeTool === 'line' && (
            <>
              <span className="material-symbols-outlined text-cyan-400 text-[16px]">trending_flat</span>
              <span>
                {constructionState.stage === 'idle'
                  ? 'Infinite Line: Click first point (or click empty space to place it).'
                  : 'Click second point to create infinite line (Esc to cancel).'}
              </span>
            </>
          )}
          {activeTool === 'distance' && (
            <>
              <span className="material-symbols-outlined text-amber-400 text-[16px]">straighten</span>
              <span>
                {constructionState.stage === 'idle'
                  ? 'Measure Distance: Click first point to measure from.'
                  : 'Click second point to view distance analysis.'}
              </span>
            </>
          )}
          {activeTool === 'eraser' && (
            <>
              <span className="material-symbols-outlined text-rose-400 text-[16px]">ink_eraser</span>
              <span>Eraser: Click any point (removes dependents), segment, or line to delete it. Esc to exit.</span>
            </>
          )}
        </div>
      </div>

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
        <span>Press Esc to cancel any in-progress tool or deselect</span>
      </div>
    </div>
  );
};
