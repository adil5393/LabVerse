/**
 * Interactive HTML5 Canvas Renderer for Class 9 Quadrilaterals Laboratory (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements:
 * - High-contrast dark Cartesian plane (grid, axes, ticks)
 * - Safe typography halos and pill badges with user-configurable label size
 * - Large 18px hit targets for vertices and 14px for segments
 * - Dynamic vertex dragging with immediate constraint solving
 * - Quadrilateral classification, angle sum, and side metric overlays
 * - Varignon Parallelogram real-time geometry & area ratio
 * - Triangle medians and centroid (G) 2:1 division ratio badges
 * - Universal Planar Tiling (monohedral tessellation via 180° rotations & lattice vectors)
 * - Persistent contextual guidance bar and Escape cancellation
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useQuadrilateralStore } from '../../../store/useQuadrilateralStore';
import {
  worldToScreen,
  screenToWorld,
  distanceBetween,
  classifyQuadrilateral,
  computePolygonVertexAngles,
  computeStandaloneAngleGeometry,
  generateQuadrilateralTiling,
  pointHitsScreenPoint,
  distanceToScreenSegment,
  LABEL_TYPOGRAPHY_CONFIGS,
  drawHaloText,
  drawPillBadge,
} from '../../../engine/mathematics/quadrilaterals/geometry';
import type {
  WorldPoint,
  QuadToolId,
} from '../../../engine/mathematics/quadrilaterals/types';

const HIT_TOLERANCE_PX = 18;

const TOOL_INSTRUCTIONS: Record<QuadToolId, { name: string; instruction: string; shortcut: string }> = {
  select: {
    name: 'Select / Move',
    shortcut: 'V',
    instruction: 'Click any element to inspect. Drag vertices to dynamically transform shapes under live constraints.',
  },
  point: {
    name: 'Point',
    shortcut: 'P',
    instruction: 'Click anywhere on the canvas to place a free coordinate vertex.',
  },
  segment: {
    name: 'Segment',
    shortcut: 'S',
    instruction: 'Click two vertices in sequence to construct a connecting line segment.',
  },
  quadrilateral: {
    name: 'Quadrilateral',
    shortcut: 'Q',
    instruction: 'Click four vertices in order (A -> B -> C -> D) to construct a quadrilateral.',
  },
  midpoint: {
    name: 'Midpoint',
    shortcut: 'M',
    instruction: 'Click a segment or two vertices to construct the exact geometric midpoint.',
  },
  diagonal: {
    name: 'Diagonal',
    shortcut: 'D',
    instruction: 'Select two opposite vertices of a quadrilateral to construct a diagonal.',
  },
  parallel_constraint: {
    name: 'Parallel Constraint',
    shortcut: 'L',
    instruction: 'Click first segment as reference, then click second segment to constrain parallel.',
  },
  perpendicular_constraint: {
    name: 'Perpendicular',
    shortcut: 'T',
    instruction: 'Select two segments to enforce or inspect a 90° right-angle relationship.',
  },
  angle_measure: {
    name: 'Angle Measure',
    shortcut: 'A',
    instruction: 'Click three points in order (Point 1 -> Vertex -> Point 2) to measure angle.',
  },
  distance_measure: {
    name: 'Distance Measure',
    shortcut: 'K',
    instruction: 'Click two points to measure Euclidean distance between them.',
  },
  eraser: {
    name: 'Eraser',
    shortcut: 'E',
    instruction: 'Click any vertex, segment, angle, or quadrilateral to delete it.',
  },
  freehand: {
    name: 'Freehand',
    shortcut: 'F',
    instruction: 'Click and drag to sketch freehand annotations on the canvas.',
  },
};

export const QuadrilateralCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    points,
    segments,
    quadrilaterals,
    triangles,
    angles,
    distances,
    constraints,
    tiling,
    selectedId,
    activeTool,
    constructionStep,
    viewport,
    labelSize,
    showGrid,
    showAxes,
    showCoordinates,
    selectObject,
    setViewport,
    movePoint,
    addPoint,
    addSegment,
    addQuadrilateral,
    addAngleMeasurement,
    addDistanceMeasurement,
    addParallelSegmentsConstraint,
    deleteObject,
    setConstructionStep,
    fitToConstruction,
    zoomIn,
    zoomOut,
    resetZoom,
    currentExperimentId,
    activePracticeQuestionId,
    mode,
  } = useQuadrilateralStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [previewMouseWorld, setPreviewMouseWorld] = useState<WorldPoint | null>(null);

  // Auto-fit construction on experiment or mode change
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        fitToConstruction(canvas.width, canvas.height);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [currentExperimentId, activePracticeQuestionId, mode, fitToConstruction]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConstructionStep({ type: 'idle' });
        selectObject(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setConstructionStep, selectObject]);

  // ==========================================================================
  // Main Render Loop
  // ==========================================================================
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    if (width <= 0 || height <= 0) return;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // 1. Grid lines & Axes
    if (showGrid) {
      ctx.save();
      ctx.lineWidth = 1;
      const step = viewport.zoom;
      const originX = width / 2 + viewport.panX;
      const originY = height / 2 + viewport.panY;

      // Minor grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)';
      ctx.beginPath();
      for (let x = originX % step; x < width; x += step) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = originY % step; y < height; y += step) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Major axes
      if (showAxes) {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        // X-axis
        ctx.moveTo(0, originY);
        ctx.lineTo(width, originY);
        // Y-axis
        ctx.moveTo(originX, 0);
        ctx.lineTo(originX, height);
        ctx.stroke();

        // Origin indicator
        drawHaloText(ctx, 'O(0,0)', originX - 18, originY + 14, 10, '#94a3b8');
      }
      ctx.restore();
    }

    // 2. Planar Tiling Layer (if active)
    if (tiling && tiling.enabled) {
      const baseQuad = quadrilaterals[tiling.baseQuadId] || Object.values(quadrilaterals)[0];
      if (baseQuad) {
        const p1 = points[baseQuad.p1Id];
        const p2 = points[baseQuad.p2Id];
        const p3 = points[baseQuad.p3Id];
        const p4 = points[baseQuad.p4Id];
        if (p1 && p2 && p3 && p4) {
          const tilingResult = generateQuadrilateralTiling(
            [p1, p2, p3, p4],
            tiling.rows,
            tiling.cols
          );

          ctx.save();
          const tileColors = [
            'rgba(56, 189, 248, 0.18)',
            'rgba(16, 185, 129, 0.18)',
            'rgba(245, 158, 11, 0.18)',
            'rgba(139, 92, 246, 0.18)',
          ];

          tilingResult.tiles.forEach((tile) => {
            const screenVerts = tile.vertices.map((v) =>
              worldToScreen(v, viewport, width, height)
            );
            ctx.beginPath();
            ctx.moveTo(screenVerts[0].x, screenVerts[0].y);
            for (let i = 1; i < screenVerts.length; i++) {
              ctx.lineTo(screenVerts[i].x, screenVerts[i].y);
            }
            ctx.closePath();
            ctx.fillStyle = tileColors[tile.colorIndex % tileColors.length];
            ctx.fill();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();
          });

          // Draw rotation centers if enabled
          if (tiling.showRotationCenters) {
            tilingResult.midpointRotationCenters.forEach((m) => {
              const sm = worldToScreen(m, viewport, width, height);
              ctx.beginPath();
              ctx.arc(sm.x, sm.y, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#f59e0b';
              ctx.fill();
            });
          }

          ctx.restore();
        }
      }
    }

    // Map to hold exterior label positions for quadrilateral vertices to prevent badge collision
    const pointLabelPositions: Record<string, { x: number; y: number }> = {};

    // 3. Render Quadrilaterals & Triangles Polygons
    Object.values(quadrilaterals).forEach((quad) => {
      const p1 = points[quad.p1Id];
      const p2 = points[quad.p2Id];
      const p3 = points[quad.p3Id];
      const p4 = points[quad.p4Id];
      if (!p1 || !p2 || !p3 || !p4) return;

      const sp1 = worldToScreen(p1, viewport, width, height);
      const sp2 = worldToScreen(p2, viewport, width, height);
      const sp3 = worldToScreen(p3, viewport, width, height);
      const sp4 = worldToScreen(p4, viewport, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.lineTo(sp3.x, sp3.y);
      ctx.lineTo(sp4.x, sp4.y);
      ctx.closePath();

      const isSelected = selectedId === quad.id;
      ctx.fillStyle = quad.isVarignon
        ? 'rgba(245, 158, 11, 0.22)'
        : isSelected
        ? 'rgba(56, 189, 248, 0.25)'
        : quad.color
        ? `${quad.color}22`
        : 'rgba(56, 189, 248, 0.12)';
      ctx.fill();

      ctx.strokeStyle = quad.isVarignon
        ? '#f59e0b'
        : isSelected
        ? '#38bdf8'
        : quad.color || '#38bdf8';
      ctx.lineWidth = isSelected ? 3 : quad.isVarignon ? 2.5 : 2;
      ctx.stroke();
      ctx.restore();

      // Show classification badge in center & interior angles at vertices
      const analysis = classifyQuadrilateral(p1, p2, p3, p4);
      const centerScreen = {
        x: (sp1.x + sp2.x + sp3.x + sp4.x) / 4,
        y: (sp1.y + sp2.y + sp3.y + sp4.y) / 4,
      };

      if (!quad.isVarignon) {
        if (analysis.isCrossed) {
          // Explicit warning for crossed / self-intersecting state
          drawPillBadge(
            ctx,
            '⚠️ CROSSED (Self-Intersecting) • Interior angles undefined',
            centerScreen.x,
            centerScreen.y - 12,
            11,
            'rgba(30, 10, 10, 0.92)',
            'rgba(239, 68, 68, 0.8)',
            '#f87171'
          );
        } else if (analysis.isDegenerate) {
          // Explicit warning for degenerate state
          drawPillBadge(
            ctx,
            '⚠️ DEGENERATE • Collinear or collapsed vertices',
            centerScreen.x,
            centerScreen.y - 12,
            11,
            'rgba(30, 20, 10, 0.92)',
            'rgba(245, 158, 11, 0.8)',
            '#fbbf24'
          );
        } else {
          // Simple polygon: show classification badge
          const badgeLabel = analysis.isConvex
            ? `${analysis.kind.toUpperCase()} • ${analysis.angleSum.toFixed(0)}°`
            : `CONCAVE (Reflex at ${['A', 'B', 'C', 'D'][analysis.reflexVertexIndex!]}) • 360°`;
          drawPillBadge(
            ctx,
            badgeLabel,
            centerScreen.x,
            centerScreen.y - 12,
            11,
            'rgba(15, 23, 42, 0.88)',
            analysis.isConvex ? 'rgba(56, 189, 248, 0.5)' : 'rgba(245, 158, 11, 0.7)',
            analysis.isConvex ? '#38bdf8' : '#fbbf24'
          );

          // Render true interior angles at each polygon vertex
          if (quad.showAngles !== false) {
            const quadAngles = computePolygonVertexAngles([p1, p2, p3, p4], viewport, width, height);

            // Record safe exterior label positions for the 4 vertices
            quadAngles.forEach((qAng, idx) => {
              const ptId = [quad.p1Id, quad.p2Id, quad.p3Id, quad.p4Id][idx];
              pointLabelPositions[ptId] = qAng.pointLabelPosition;
            });

            // Render each interior angle arc, fill wedge, and degree badge
            quadAngles.forEach((qAng) => {
              ctx.save();
              // 1. Shaded interior angle wedge
              ctx.beginPath();
              ctx.moveTo(qAng.screenVertex.x, qAng.screenVertex.y);
              ctx.arc(
                qAng.screenVertex.x,
                qAng.screenVertex.y,
                qAng.arcRadius,
                qAng.arcStartAngle,
                qAng.arcStartAngle + qAng.arcSweep,
                false
              );
              ctx.closePath();
              ctx.fillStyle = qAng.isReflex
                ? 'rgba(245, 158, 11, 0.16)'
                : 'rgba(56, 189, 248, 0.1)';
              ctx.fill();

              // 2. Interior angle arc
              ctx.beginPath();
              ctx.arc(
                qAng.screenVertex.x,
                qAng.screenVertex.y,
                qAng.arcRadius,
                qAng.arcStartAngle,
                qAng.arcStartAngle + qAng.arcSweep,
                false
              );
              ctx.strokeStyle = qAng.isReflex ? '#f59e0b' : '#38bdf8';
              ctx.lineWidth = qAng.isReflex ? 2.5 : 1.8;
              ctx.stroke();

              // 3. Stable degree badge along interior bisector
              const labelText = qAng.isReflex
                ? `${qAng.interiorDegrees.toFixed(1)}° (Reflex)`
                : `${qAng.interiorDegrees.toFixed(1)}°`;
              drawPillBadge(
                ctx,
                labelText,
                qAng.badgePosition.x,
                qAng.badgePosition.y,
                10,
                'rgba(15, 23, 42, 0.92)',
                qAng.isReflex ? '#f59e0b' : 'rgba(56, 189, 248, 0.6)',
                qAng.isReflex ? '#fbbf24' : '#38bdf8'
              );
              ctx.restore();
            });
          }
        }
      }
    });

    // 4. Render Triangles
    Object.values(triangles).forEach((tri) => {
      const p1 = points[tri.p1Id];
      const p2 = points[tri.p2Id];
      const p3 = points[tri.p3Id];
      if (!p1 || !p2 || !p3) return;

      const sp1 = worldToScreen(p1, viewport, width, height);
      const sp2 = worldToScreen(p2, viewport, width, height);
      const sp3 = worldToScreen(p3, viewport, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sp1.x, sp1.y);
      ctx.lineTo(sp2.x, sp2.y);
      ctx.lineTo(sp3.x, sp3.y);
      ctx.closePath();

      ctx.fillStyle = tri.color ? `${tri.color}20` : 'rgba(236, 72, 153, 0.15)';
      ctx.fill();
      ctx.strokeStyle = tri.color || '#ec4899';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // 5. Render Segments
    Object.values(segments).forEach((seg) => {
      const pA = points[seg.pointAId];
      const pB = points[seg.pointBId];
      if (!pA || !pB) return;

      const spA = worldToScreen(pA, viewport, width, height);
      const spB = worldToScreen(pB, viewport, width, height);
      const isSelected = selectedId === seg.id;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(spA.x, spA.y);
      ctx.lineTo(spB.x, spB.y);

      if (seg.lineStyle === 'dashed') {
        ctx.setLineDash([6, 4]);
      } else if (seg.lineStyle === 'dotted') {
        ctx.setLineDash([2, 3]);
      }

      ctx.strokeStyle = isSelected
        ? '#38bdf8'
        : seg.color || '#94a3b8';
      ctx.lineWidth = isSelected ? 3 : seg.isDiagonal ? 1.8 : 2;
      ctx.stroke();
      ctx.restore();

      // Show length badge if requested or in measurement mode
      if (seg.showLength || isSelected) {
        const dist = distanceBetween(pA, pB);
        const midScreen = { x: (spA.x + spB.x) / 2, y: (spA.y + spB.y) / 2 };
        drawPillBadge(
          ctx,
          `${dist.toFixed(1)}`,
          midScreen.x,
          midScreen.y - 10,
          10,
          'rgba(15, 23, 42, 0.85)',
          'rgba(148, 163, 184, 0.4)',
          '#f8fafc'
        );
      }
    });

    // 6. Render Angles (Manual Angle Tool)
    Object.values(angles).forEach((ang) => {
      const p1 = points[ang.point1Id];
      const v = points[ang.vertexId];
      const p2 = points[ang.point2Id];
      if (!p1 || !v || !p2) return;

      const angGeo = computeStandaloneAngleGeometry(p1, v, p2, viewport, width, height, ang.isReflex);
      const sv = worldToScreen(v, viewport, width, height);
      const isSelected = selectedId === ang.id;

      ctx.save();
      // Wedge
      ctx.beginPath();
      ctx.moveTo(sv.x, sv.y);
      ctx.arc(sv.x, sv.y, angGeo.arcRadius, angGeo.arcStartAngle, angGeo.arcStartAngle + angGeo.arcSweep, false);
      ctx.closePath();
      ctx.fillStyle = ang.isReflex ? 'rgba(245, 158, 11, 0.14)' : 'rgba(56, 189, 248, 0.1)';
      ctx.fill();

      // Arc
      ctx.beginPath();
      ctx.arc(sv.x, sv.y, angGeo.arcRadius, angGeo.arcStartAngle, angGeo.arcStartAngle + angGeo.arcSweep, false);
      ctx.strokeStyle = isSelected ? '#38bdf8' : ang.isReflex ? '#f59e0b' : '#38bdf8';
      ctx.lineWidth = isSelected ? 2.8 : 2;
      ctx.stroke();

      // Badge along bisector
      const badgeLabel = ang.isReflex
        ? `${angGeo.degrees.toFixed(1)}° (Reflex)`
        : `${angGeo.degrees.toFixed(1)}°`;

      drawPillBadge(
        ctx,
        badgeLabel,
        angGeo.badgePosition.x,
        angGeo.badgePosition.y,
        11,
        'rgba(15, 23, 42, 0.92)',
        isSelected ? '#38bdf8' : ang.isReflex ? '#f59e0b' : '#38bdf8',
        isSelected ? '#38bdf8' : ang.isReflex ? '#fbbf24' : '#38bdf8'
      );
      ctx.restore();
    });

    // 6b. Render Distance Measurements (Manual Distance Tool)
    Object.values(distances).forEach((dist) => {
      const pA = points[dist.pointAId];
      const pB = points[dist.pointBId];
      if (!pA || !pB) return;

      const spA = worldToScreen(pA, viewport, width, height);
      const spB = worldToScreen(pB, viewport, width, height);
      const isSelected = selectedId === dist.id;

      ctx.save();
      // Dimension dashed line
      ctx.beginPath();
      ctx.moveTo(spA.x, spA.y);
      ctx.lineTo(spB.x, spB.y);
      ctx.strokeStyle = isSelected ? '#38bdf8' : dist.color || '#a855f7';
      ctx.lineWidth = isSelected ? 2.5 : 1.8;
      ctx.setLineDash([4, 3]);
      ctx.stroke();

      // Perpendicular end-ticks
      const dx = spB.x - spA.x;
      const dy = spB.y - spA.y;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const nx = (-dy / len) * 6;
        const ny = (dx / len) * 6;
        ctx.beginPath();
        ctx.moveTo(spA.x - nx, spA.y - ny);
        ctx.lineTo(spA.x + nx, spA.y + ny);
        ctx.moveTo(spB.x - nx, spB.y - ny);
        ctx.lineTo(spB.x + nx, spB.y + ny);
        ctx.setLineDash([]);
        ctx.stroke();
      }

      // Midpoint pill badge
      const dVal = distanceBetween(pA, pB);
      const midScreen = { x: (spA.x + spB.x) / 2, y: (spA.y + spB.y) / 2 };
      const label = `${pA.name}${pB.name} = ${dVal.toFixed(2)}`;

      drawPillBadge(
        ctx,
        label,
        midScreen.x,
        midScreen.y - 12,
        11,
        'rgba(15, 23, 42, 0.92)',
        isSelected ? '#38bdf8' : dist.color || '#a855f7',
        isSelected ? '#38bdf8' : '#e9d5ff'
      );
      ctx.restore();
    });

    // 6c. Render Parallel Chevron Markers on constrained segments
    Object.values(constraints).forEach((c) => {
      if (!c.active) return;
      if (c.type === 'parallel_segments' && c.targetEntityIds.length >= 2) {
        const seg1 = segments[c.targetEntityIds[0]];
        const seg2 = segments[c.targetEntityIds[1]];
        if (!seg1 || !seg2) return;

        [seg1, seg2].forEach((seg) => {
          const pA = points[seg.pointAId];
          const pB = points[seg.pointBId];
          if (!pA || !pB) return;
          const spA = worldToScreen(pA, viewport, width, height);
          const spB = worldToScreen(pB, viewport, width, height);
          const mx = (spA.x + spB.x) / 2;
          const my = (spA.y + spB.y) / 2;
          const angle = Math.atan2(spB.y - spA.y, spB.x - spA.x);

          ctx.save();
          ctx.translate(mx, my);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.moveTo(-6, -4);
          ctx.lineTo(2, 0);
          ctx.lineTo(-6, 4);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
          ctx.restore();
        });
      }
    });

    // 7. Render Vertices & Points
    const typography = LABEL_TYPOGRAPHY_CONFIGS[labelSize];
    Object.values(points).forEach((pt) => {
      const sp = worldToScreen(pt, viewport, width, height);
      const isSelected = selectedId === pt.id;
      const isMidpoint = pt.role === 'midpoint';
      const isCentroid = pt.role === 'triangle_centroid';

      ctx.save();
      // Outer selection / highlight ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // Point circle
      ctx.beginPath();
      const radius = isCentroid ? 7 : isMidpoint ? 5 : 6;
      ctx.arc(sp.x, sp.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = isCentroid
        ? '#f59e0b'
        : isMidpoint
        ? '#10b981'
        : pt.color || '#38bdf8';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label with halo: use exterior position if part of a quadrilateral angle, else standard offset
      const labelText = showCoordinates
        ? `${pt.name}(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`
        : pt.name;
      const exteriorPos = pointLabelPositions[pt.id];
      const labelX = exteriorPos ? exteriorPos.x : sp.x + (isCentroid ? 16 : 14);
      const labelY = exteriorPos ? exteriorPos.y : sp.y - 12;

      drawHaloText(
        ctx,
        labelText,
        labelX,
        labelY,
        typography.fontSize,
        isCentroid ? '#f59e0b' : '#ffffff'
      );

      ctx.restore();
    });

    // 8. Construction Step Live Previews
    if (constructionStep.type === 'creating_quadrilateral') {
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);

      const selPts = constructionStep.points.map((id) => points[id]).filter(Boolean);
      if (selPts.length > 0) {
        ctx.beginPath();
        const startSp = worldToScreen(selPts[0], viewport, width, height);
        ctx.moveTo(startSp.x, startSp.y);
        for (let i = 1; i < selPts.length; i++) {
          const sp = worldToScreen(selPts[i], viewport, width, height);
          ctx.lineTo(sp.x, sp.y);
        }
        if (previewMouseWorld) {
          const mSp = worldToScreen(previewMouseWorld, viewport, width, height);
          ctx.lineTo(mSp.x, mSp.y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // Distance Measure Live Preview
    if (constructionStep.type === 'measuring_distance' && constructionStep.startPointId && previewMouseWorld) {
      const p1 = points[constructionStep.startPointId];
      if (p1) {
        const sp1 = worldToScreen(p1, viewport, width, height);
        const sm = worldToScreen(previewMouseWorld, viewport, width, height);
        const previewDist = distanceBetween(p1, previewMouseWorld);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sp1.x, sp1.y);
        ctx.lineTo(sm.x, sm.y);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        drawPillBadge(
          ctx,
          `${previewDist.toFixed(2)}`,
          (sp1.x + sm.x) / 2,
          (sp1.y + sm.y) / 2 - 12,
          10,
          'rgba(15, 23, 42, 0.92)',
          '#a855f7',
          '#e9d5ff'
        );
        ctx.restore();
      }
    }

    // Angle Measure Live Preview
    if (constructionStep.type === 'measuring_angle' && previewMouseWorld) {
      const { points: selPts } = constructionStep;
      if (selPts.length === 1) {
        const p1 = points[selPts[0]];
        if (p1) {
          const sp1 = worldToScreen(p1, viewport, width, height);
          const sm = worldToScreen(previewMouseWorld, viewport, width, height);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(sp1.x, sp1.y);
          ctx.lineTo(sm.x, sm.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.restore();
        }
      } else if (selPts.length === 2) {
        const p1 = points[selPts[0]];
        const vertex = points[selPts[1]];
        if (p1 && vertex) {
          const sv = worldToScreen(vertex, viewport, width, height);
          const sp1 = worldToScreen(p1, viewport, width, height);
          const sm = worldToScreen(previewMouseWorld, viewport, width, height);

          ctx.save();
          // Ray from vertex to p1
          ctx.beginPath();
          ctx.moveTo(sv.x, sv.y);
          ctx.lineTo(sp1.x, sp1.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Preview ray from vertex to cursor
          ctx.beginPath();
          ctx.moveTo(sv.x, sv.y);
          ctx.lineTo(sm.x, sm.y);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();

          // Live angle arc & badge
          const previewGeo = computeStandaloneAngleGeometry(p1, vertex, previewMouseWorld, viewport, width, height);
          ctx.beginPath();
          ctx.arc(sv.x, sv.y, previewGeo.arcRadius, previewGeo.arcStartAngle, previewGeo.arcStartAngle + previewGeo.arcSweep, false);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          drawPillBadge(
            ctx,
            `${previewGeo.degrees.toFixed(1)}°`,
            previewGeo.badgePosition.x,
            previewGeo.badgePosition.y,
            10,
            'rgba(15, 23, 42, 0.92)',
            '#38bdf8',
            '#38bdf8'
          );
          ctx.restore();
        }
      }
    }

    // Parallel Segments Reference Highlight
    if (constructionStep.type === 'creating_parallel_segments' && constructionStep.firstSegmentId) {
      const firstSeg = segments[constructionStep.firstSegmentId];
      if (firstSeg) {
        const pA = points[firstSeg.pointAId];
        const pB = points[firstSeg.pointBId];
        if (pA && pB) {
          const spA = worldToScreen(pA, viewport, width, height);
          const spB = worldToScreen(pB, viewport, width, height);
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(spA.x, spA.y);
          ctx.lineTo(spB.x, spB.y);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 4.5;
          ctx.lineCap = 'round';
          ctx.stroke();

          drawPillBadge(
            ctx,
            'Reference (∥)',
            (spA.x + spB.x) / 2,
            (spA.y + spB.y) / 2 - 14,
            10,
            'rgba(15, 23, 42, 0.95)',
            '#f59e0b',
            '#fbbf24'
          );
          ctx.restore();
        }
      }
    }
  }, [
    points,
    segments,
    quadrilaterals,
    triangles,
    angles,
    distances,
    constraints,
    tiling,
    selectedId,
    activeTool,
    constructionStep,
    viewport,
    labelSize,
    showGrid,
    showAxes,
    showCoordinates,
    previewMouseWorld,
  ]);

  // Request Animation Frame Loop
  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvas();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  // ==========================================================================
  // Mouse & Touch Pointer Interactions
  // ==========================================================================
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY, viewport, canvas.width, canvas.height);

    // 1. Check if clicking an existing point
    let clickedPt: (typeof points)[string] | null = null;
    for (const pt of Object.values(points)) {
      const sp = worldToScreen(pt, viewport, canvas.width, canvas.height);
      if (pointHitsScreenPoint(screenX, screenY, sp, HIT_TOLERANCE_PX)) {
        clickedPt = pt;
        break;
      }
    }

    // Handle tool clicks
    if (activeTool === 'select') {
      if (clickedPt) {
        selectObject(clickedPt.id, 'point');
        if (!clickedPt.locked) {
          setDraggedPointId(clickedPt.id);
        }
      } else {
        // Check clicking segment
        let clickedSegId: string | null = null;
        for (const seg of Object.values(segments)) {
          const pA = points[seg.pointAId];
          const pB = points[seg.pointBId];
          if (pA && pB) {
            const spA = worldToScreen(pA, viewport, canvas.width, canvas.height);
            const spB = worldToScreen(pB, viewport, canvas.width, canvas.height);
            if (distanceToScreenSegment(screenX, screenY, spA.x, spA.y, spB.x, spB.y) <= 14) {
              clickedSegId = seg.id;
              break;
            }
          }
        }

        if (clickedSegId) {
          selectObject(clickedSegId, 'segment');
        } else {
          // Pan canvas
          setIsPanning(true);
          setPanStart({ x: screenX - viewport.panX, y: screenY - viewport.panY });
          selectObject(null);
        }
      }
      return;
    }

    if (activeTool === 'point') {
      addPoint(worldPos);
      return;
    }

    if (activeTool === 'segment') {
      if (clickedPt) {
        if (constructionStep.type === 'creating_segment' && constructionStep.startPointId) {
          if (constructionStep.startPointId !== clickedPt.id) {
            addSegment(constructionStep.startPointId, clickedPt.id);
            setConstructionStep({ type: 'idle' });
          }
        } else {
          setConstructionStep({ type: 'creating_segment', startPointId: clickedPt.id });
        }
      } else {
        const newPtId = addPoint(worldPos);
        if (constructionStep.type === 'creating_segment' && constructionStep.startPointId) {
          addSegment(constructionStep.startPointId, newPtId);
          setConstructionStep({ type: 'idle' });
        } else {
          setConstructionStep({ type: 'creating_segment', startPointId: newPtId });
        }
      }
      return;
    }

    if (activeTool === 'quadrilateral') {
      const ptId = clickedPt ? clickedPt.id : addPoint(worldPos);
      const currentPoints =
        constructionStep.type === 'creating_quadrilateral' ? constructionStep.points : [];

      if (!currentPoints.includes(ptId)) {
        const nextPts = [...currentPoints, ptId];
        if (nextPts.length === 4) {
          addQuadrilateral(nextPts[0], nextPts[1], nextPts[2], nextPts[3]);
          setConstructionStep({ type: 'idle' });
        } else {
          setConstructionStep({ type: 'creating_quadrilateral', points: nextPts });
        }
      }
      return;
    }

    if (activeTool === 'midpoint') {
      if (clickedPt) {
        if (constructionStep.type === 'creating_midpoint' && constructionStep.firstPointId) {
          if (constructionStep.firstPointId !== clickedPt.id) {
            const p1 = points[constructionStep.firstPointId];
            const p2 = clickedPt;
            const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
            addPoint(mid, `M_${p1.name}${p2.name}`, 'midpoint', [p1.id, p2.id], '#10b981');
            setConstructionStep({ type: 'idle' });
          }
        } else {
          setConstructionStep({ type: 'creating_midpoint', firstPointId: clickedPt.id });
        }
      }
      return;
    }

    if (activeTool === 'diagonal') {
      if (clickedPt) {
        if (constructionStep.type === 'creating_diagonal' && constructionStep.startPointId) {
          if (constructionStep.startPointId !== clickedPt.id) {
            addSegment(constructionStep.startPointId, clickedPt.id, true);
            setConstructionStep({ type: 'idle' });
          }
        } else {
          setConstructionStep({ type: 'creating_diagonal', startPointId: clickedPt.id });
        }
      }
      return;
    }

    if (activeTool === 'angle_measure') {
      if (clickedPt) {
        const currentPoints =
          constructionStep.type === 'measuring_angle' ? constructionStep.points : [];
        if (!currentPoints.includes(clickedPt.id)) {
          const nextPts = [...currentPoints, clickedPt.id];
          if (nextPts.length === 3) {
            addAngleMeasurement(nextPts[0], nextPts[1], nextPts[2]);
            setConstructionStep({ type: 'idle' });
          } else {
            setConstructionStep({ type: 'measuring_angle', points: nextPts });
          }
        }
      }
      return;
    }

    if (activeTool === 'distance_measure') {
      if (clickedPt) {
        if (constructionStep.type === 'measuring_distance' && constructionStep.startPointId) {
          if (constructionStep.startPointId !== clickedPt.id) {
            addDistanceMeasurement(constructionStep.startPointId, clickedPt.id);
            setConstructionStep({ type: 'idle' });
          }
        } else {
          setConstructionStep({ type: 'measuring_distance', startPointId: clickedPt.id });
        }
      }
      return;
    }

    if (activeTool === 'parallel_constraint') {
      let clickedSegId: string | null = null;
      let minSegDist = 18; // screen tolerance in px
      for (const seg of Object.values(segments)) {
        const pA = points[seg.pointAId];
        const pB = points[seg.pointBId];
        if (pA && pB) {
          const spA = worldToScreen(pA, viewport, canvas.width, canvas.height);
          const spB = worldToScreen(pB, viewport, canvas.width, canvas.height);
          const d = distanceToScreenSegment(screenX, screenY, spA.x, spA.y, spB.x, spB.y);
          if (d <= minSegDist) {
            minSegDist = d;
            clickedSegId = seg.id;
          }
        }
      }

      if (clickedSegId) {
        if (
          constructionStep.type === 'creating_parallel_segments' &&
          constructionStep.firstSegmentId
        ) {
          const firstSeg = segments[constructionStep.firstSegmentId];
          const secondSeg = segments[clickedSegId];
          if (!firstSeg || !secondSeg) {
            setConstructionStep({ type: 'idle' });
            return;
          }

          // Cannot make segment parallel to itself
          if (
            firstSeg.id === secondSeg.id ||
            (firstSeg.pointAId === secondSeg.pointAId && firstSeg.pointBId === secondSeg.pointBId) ||
            (firstSeg.pointAId === secondSeg.pointBId && firstSeg.pointBId === secondSeg.pointAId)
          ) {
            return;
          }

          addParallelSegmentsConstraint(firstSeg.id, secondSeg.id);
          setConstructionStep({ type: 'idle' });
        } else {
          // Select first reference segment
          setConstructionStep({
            type: 'creating_parallel_segments',
            firstSegmentId: clickedSegId,
          });
        }
      }
      return;
    }

    if (activeTool === 'eraser') {
      if (clickedPt) {
        deleteObject(clickedPt.id, 'point');
        return;
      }
      // Check segment
      for (const seg of Object.values(segments)) {
        const pA = points[seg.pointAId];
        const pB = points[seg.pointBId];
        if (pA && pB) {
          const spA = worldToScreen(pA, viewport, canvas.width, canvas.height);
          const spB = worldToScreen(pB, viewport, canvas.width, canvas.height);
          if (distanceToScreenSegment(screenX, screenY, spA.x, spA.y, spB.x, spB.y) <= 14) {
            deleteObject(seg.id, 'segment');
            return;
          }
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY, viewport, canvas.width, canvas.height);

    setPreviewMouseWorld(worldPos);

    if (isPanning) {
      setViewport({
        panX: screenX - panStart.x,
        panY: screenY - panStart.y,
      });
      return;
    }

    if (draggedPointId) {
      movePoint(draggedPointId, worldPos);
    }
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    setDraggedPointId(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setViewport({
      zoom: Math.max(15, Math.min(120, viewport.zoom * zoomFactor)),
    });
  };

  const currentToolInfo = TOOL_INSTRUCTIONS[activeTool] || TOOL_INSTRUCTIONS.select;
  let dynamicInstruction = currentToolInfo.instruction;

  if (activeTool === 'angle_measure') {
    if (constructionStep.type === 'measuring_angle') {
      const cnt = constructionStep.points.length;
      if (cnt === 1) {
        dynamicInstruction = 'Select angle vertex (2/3)';
      } else if (cnt === 2) {
        dynamicInstruction = 'Select final point (3/3)';
      }
    } else {
      dynamicInstruction = 'Select first point (1/3)';
    }
  } else if (activeTool === 'distance_measure') {
    if (constructionStep.type === 'measuring_distance' && constructionStep.startPointId) {
      dynamicInstruction = 'Select second point (2/2)';
    } else {
      dynamicInstruction = 'Select first point (1/2)';
    }
  } else if (activeTool === 'parallel_constraint') {
    if (
      constructionStep.type === 'creating_parallel_segments' &&
      constructionStep.firstSegmentId
    ) {
      const seg1 = segments[constructionStep.firstSegmentId];
      const name = seg1?.name || 'reference';
      dynamicInstruction = `Select second segment to make parallel to ${name}`;
    } else {
      dynamicInstruction = 'Select the first segment as parallel reference';
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-surface-lowest">
      {/* HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-crosshair touch-none"
      />

      {/* Floating Canvas Controls (Bottom Right) */}
      <div className="absolute bottom-14 right-4 flex items-center gap-2 z-20">
        <div className="flex items-center gap-1 bg-surface-card/90 backdrop-blur-md p-1 rounded-xl border border-surface-border shadow-xl">
          <button
            onClick={zoomIn}
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-slate-300 flex items-center justify-center transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </button>
          <button
            onClick={zoomOut}
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-slate-300 flex items-center justify-center transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">zoom_out</span>
          </button>
          <button
            onClick={resetZoom}
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-slate-300 flex items-center justify-center transition-colors"
            title="Reset Zoom"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
          <div className="h-4 w-[1px] bg-surface-border mx-1" />
          <button
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) fitToConstruction(canvas.width, canvas.height);
            }}
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated text-amber-400 flex items-center justify-center transition-colors"
            title="Fit Construction to Viewport"
          >
            <span className="material-symbols-outlined text-[18px]">fit_screen</span>
          </button>
        </div>
      </div>

      {/* Persistent Bottom Contextual Instruction Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-surface-low/95 backdrop-blur-md border-t border-surface-border px-4 flex items-center justify-between text-xs font-mono text-slate-300 z-20 select-none">
        <div className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider text-[10px]">
            {currentToolInfo.name} [{currentToolInfo.shortcut}]
          </span>
          <span className="text-slate-300 truncate">{dynamicInstruction}</span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-slate-500 text-[11px] shrink-0">
          <span>Press ESC to cancel</span>
          <span>•</span>
          <span>Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
};
