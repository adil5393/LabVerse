/**
 * Circle Canvas Component for Class 9 Circles Laboratory (Milestones M2 & M2.1)
 *
 * Implements interactive 2D canvas rendering of:
 * - High-contrast Cartesian coordinate plane (grid, axes, ticks)
 * - Shared annotation styling system with user-configurable label size (Small, Normal, Large)
 * - Safe typography halos and pill badges ensuring readability at all zoom levels
 * - Circles (center, circumference, radius, diameter)
 * - Constrained circumference points (free dragging along circle)
 * - Reliable diameter construction with opposite endpoint calculation B = (2C - A)
 * - Chords (midpoint, perpendicular distance from center, length badges)
 * - Central and inscribed angles (arcs, degree readouts)
 * - Tangent lines (perpendicular indicator at contact point)
 * - Cyclic quadrilaterals (polygon fill, opposite angle metrics)
 * - Screen-space hit testing tolerance (touch and classroom display friendly)
 * - Persistent tool guidance bar with Escape-to-cancel support
 * - Fit-to-construction framing
 */

import React, { useRef, useState, useEffect } from 'react';
import { useCircleStore } from '../../../store/useCircleStore';
import {
  worldToScreen,
  screenToWorld,
  getCircumferenceCoords,
  projectPointToCircleAngle,
  calculateChordMetrics,
  calculateAngleDegrees,
  calculateTangentSegment,
  distanceBetween,
  LABEL_TYPOGRAPHY_CONFIGS,
  drawHaloText,
  drawPillBadge,
  pointHitsScreenPoint,
  pointHitsCircleCircumference,
  distanceToScreenSegment,
} from '../../../engine/mathematics/circles/geometry';
import type { WorldPoint, CircleObject, CircleToolId } from '../../../engine/mathematics/circles/types';

const HIT_TOLERANCE_PX = 18;

const TOOL_INSTRUCTIONS: Record<CircleToolId, { name: string; instruction: string; shortcut: string }> = {
  select: {
    name: 'Select / Move',
    shortcut: 'V',
    instruction: 'Click an object to inspect it. Drag available circumference points or circle centers to transform.',
  },
  circle: {
    name: 'Circle',
    shortcut: 'C',
    instruction: 'Click to place the center, then click or drag to set the radius.',
  },
  point_on_circle: {
    name: 'Point on Circle',
    shortcut: 'P',
    instruction: 'Click anywhere on a circle circumference to create a constrained point.',
  },
  chord: {
    name: 'Chord',
    shortcut: 'H',
    instruction: 'Select two points on the same circle to construct a chord.',
  },
  radius: {
    name: 'Radius',
    shortcut: 'R',
    instruction: 'Select a circle, then click a point on its circumference to construct a radius.',
  },
  diameter: {
    name: 'Diameter',
    shortcut: 'D',
    instruction: 'Select a circle, then choose an existing point or click anywhere on its circumference.',
  },
  radius_diameter: {
    name: 'Radius / Diameter',
    shortcut: 'R',
    instruction: 'Select a circle or circumference point to construct a radial line.',
  },
  angle_measure: {
    name: 'Angle Measure',
    shortcut: 'A',
    instruction: 'Select three points in order. The second point is the vertex.',
  },
  tangent: {
    name: 'Tangent',
    shortcut: 'T',
    instruction: 'Select a point on the circumference to construct a tangent line.',
  },
  eraser: {
    name: 'Eraser',
    shortcut: 'E',
    instruction: 'Click any point, chord, diameter, or circle to remove it.',
  },
};

export const CircleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    circles,
    circumferencePoints,
    chords,
    radiusDiameters,
    angles,
    tangents,
    cyclicQuads,
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
    updateCircle,
    updateCircumferencePoint,
    addCircle,
    addCircumferencePoint,
    addChord,
    addRadiusDiameter,
    addDiameter,
    addTangent,
    deleteObject,
    setConstructionStep,
    fitToConstruction,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useCircleStore();

  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const [draggedCircleCenterId, setDraggedCircleCenterId] = useState<string | null>(null);
  const [previewPoint, setPreviewPoint] = useState<WorldPoint | null>(null);

  // Resize canvas to parent container
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

  // Keyboard Escape listener to cancel any active construction
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConstructionStep({ type: 'idle' });
        setPreviewPoint(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setConstructionStep]);

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { zoom, panX, panY } = viewport;
    const typography = LABEL_TYPOGRAPHY_CONFIGS[labelSize || 'normal'];

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid
    if (showGrid) {
      ctx.save();
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.7)';
      ctx.lineWidth = 1;

      const originX = width / 2 + panX;
      const originY = height / 2 + panY;

      const startCol = Math.floor(-originX / zoom);
      const endCol = Math.ceil((width - originX) / zoom);
      const startRow = Math.floor(-originY / zoom);
      const endRow = Math.ceil((height - originY) / zoom);

      for (let c = startCol; c <= endCol; c++) {
        const x = originX + c * zoom;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let r = startRow; r <= endRow; r++) {
        const y = originY + r * zoom;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Draw Axes
    if (showAxes) {
      ctx.save();
      const originX = width / 2 + panX;
      const originY = height / 2 + panY;

      ctx.strokeStyle = 'rgba(100, 116, 139, 0.8)';
      ctx.lineWidth = 1.5;

      // X-Axis
      ctx.beginPath();
      ctx.moveTo(0, originY);
      ctx.lineTo(width, originY);
      ctx.stroke();

      // Y-Axis
      ctx.beginPath();
      ctx.moveTo(originX, 0);
      ctx.lineTo(originX, height);
      ctx.stroke();

      // Axis labels with halo
      drawHaloText(ctx, 'x', width - 20, originY - 10, {
        font: `bold ${typography.secondaryCoordSize}px monospace`,
        fillColor: '#94a3b8',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });
      drawHaloText(ctx, 'y', originX + 8, 20, {
        font: `bold ${typography.secondaryCoordSize}px monospace`,
        fillColor: '#94a3b8',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });
      drawHaloText(ctx, 'O(0,0)', originX + 8, originY + 16, {
        font: `bold ${typography.secondaryCoordSize}px monospace`,
        fillColor: '#94a3b8',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });
      ctx.restore();
    }

    // Helper to map world to current screen
    const toScreen = (pt: WorldPoint) =>
      worldToScreen(pt.x, pt.y, zoom, width / 2 + panX, panY, height);

    // 3. Draw Cyclic Quadrilaterals
    Object.values(cyclicQuads).forEach((quad) => {
      const ptA = circumferencePoints[quad.pointAId];
      const ptB = circumferencePoints[quad.pointBId];
      const ptC = circumferencePoints[quad.pointCId];
      const ptD = circumferencePoints[quad.pointDId];
      const circle = circles[quad.circleId];
      if (!ptA || !ptB || !ptC || !ptD || !circle) return;

      const posA = toScreen(getCircumferenceCoords(circle, ptA.angleRad));
      const posB = toScreen(getCircumferenceCoords(circle, ptB.angleRad));
      const posC = toScreen(getCircumferenceCoords(circle, ptC.angleRad));
      const posD = toScreen(getCircumferenceCoords(circle, ptD.angleRad));

      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(posA.x, posA.y);
      ctx.lineTo(posB.x, posB.y);
      ctx.lineTo(posC.x, posC.y);
      ctx.lineTo(posD.x, posD.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Diagonals AC and BD dashed
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.beginPath();
      ctx.moveTo(posA.x, posA.y);
      ctx.lineTo(posC.x, posC.y);
      ctx.moveTo(posB.x, posB.y);
      ctx.lineTo(posD.x, posD.y);
      ctx.stroke();
      ctx.restore();
    });

    // 4. Draw Circles
    Object.values(circles).forEach((circle) => {
      const centerScreen = toScreen(circle.center);
      const radiusScreen = circle.radius * zoom;
      const isSelected = selectedId === circle.id;

      ctx.save();
      // Circle interior wash
      ctx.fillStyle = circle.color ? `${circle.color}0f` : 'rgba(56, 189, 248, 0.05)';
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y, radiusScreen, 0, Math.PI * 2);
      ctx.fill();

      // Circle boundary
      ctx.strokeStyle = isSelected ? '#ffffff' : circle.color || '#38bdf8';
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.stroke();

      // Circle Center Marker
      ctx.fillStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Center Point Label with halo
      drawHaloText(ctx, circle.name || 'O', centerScreen.x + 8, centerScreen.y - 8, {
        font: `bold ${typography.pointLabelSize}px ${typography.fontFamily}`,
        fillColor: '#f8fafc',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });

      if (showCoordinates) {
        drawHaloText(
          ctx,
          `(${circle.center.x.toFixed(1)}, ${circle.center.y.toFixed(1)})`,
          centerScreen.x + 8,
          centerScreen.y + 14,
          {
            font: `${typography.secondaryCoordSize}px monospace`,
            fillColor: '#94a3b8',
            haloColor: '#090d16',
            haloWidth: typography.haloWidth,
          }
        );
      }
      ctx.restore();
    });

    // 5. Draw Radius and Diameters
    Object.values(radiusDiameters).forEach((item) => {
      const circle = circles[item.circleId];
      const pt1 = circumferencePoints[item.pointId];
      if (!circle || !pt1) return;

      const p1Pos = toScreen(getCircumferenceCoords(circle, pt1.angleRad));
      const centerPos = toScreen(circle.center);
      const isSelected = selectedId === item.id;

      ctx.save();
      ctx.strokeStyle = isSelected ? '#ffffff' : item.color || '#38bdf8';
      ctx.lineWidth = isSelected ? 3 : 2;

      if (item.type === 'radius') {
        ctx.beginPath();
        ctx.moveTo(centerPos.x, centerPos.y);
        ctx.lineTo(p1Pos.x, p1Pos.y);
        ctx.stroke();

        const midX = (centerPos.x + p1Pos.x) / 2;
        const midY = (centerPos.y + p1Pos.y) / 2;
        drawPillBadge(ctx, `r = ${circle.radius.toFixed(2)}`, midX, midY - 14, {
          fontSize: typography.measurementSize,
          fontFamily: typography.fontFamily,
          textColor: '#38bdf8',
          borderColor: 'rgba(56, 189, 248, 0.45)',
          paddingX: typography.badgePaddingX,
          paddingY: typography.badgePaddingY,
          borderRadius: typography.badgeRadius,
        });
      } else {
        // Dedicated Diameter: Line from point A through center C to opposite point B
        let p2Pos = toScreen(getCircumferenceCoords(circle, pt1.angleRad + Math.PI));
        if (item.point2Id && circumferencePoints[item.point2Id]) {
          p2Pos = toScreen(getCircumferenceCoords(circle, circumferencePoints[item.point2Id].angleRad));
        }

        ctx.beginPath();
        ctx.moveTo(p1Pos.x, p1Pos.y);
        ctx.lineTo(p2Pos.x, p2Pos.y);
        ctx.stroke();

        // Mark center point along diameter
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(centerPos.x, centerPos.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // High-contrast badge for Diameter measurement
        drawPillBadge(ctx, `d = ${(circle.radius * 2).toFixed(2)}`, centerPos.x, centerPos.y - 20, {
          fontSize: typography.measurementSize,
          fontFamily: typography.fontFamily,
          textColor: '#38bdf8',
          borderColor: 'rgba(56, 189, 248, 0.5)',
          paddingX: typography.badgePaddingX,
          paddingY: typography.badgePaddingY,
          borderRadius: typography.badgeRadius,
        });
      }
      ctx.restore();
    });

    // 6. Draw Chords
    Object.values(chords).forEach((chord) => {
      const circle = circles[chord.circleId];
      const ptA = circumferencePoints[chord.pointAId];
      const ptB = circumferencePoints[chord.pointBId];
      if (!circle || !ptA || !ptB) return;

      const worldA = getCircumferenceCoords(circle, ptA.angleRad);
      const worldB = getCircumferenceCoords(circle, ptB.angleRad);
      const posA = toScreen(worldA);
      const posB = toScreen(worldB);
      const centerPos = toScreen(circle.center);
      const isSelected = selectedId === chord.id;

      const metrics = calculateChordMetrics(circle, worldA, worldB);
      const midPos = toScreen(metrics.midpoint);

      ctx.save();
      // Draw chord line
      ctx.strokeStyle = isSelected ? '#ffffff' : chord.color || '#f59e0b';
      ctx.lineWidth = isSelected ? 3.5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(posA.x, posA.y);
      ctx.lineTo(posB.x, posB.y);
      ctx.stroke();

      // Draw Perpendicular from Center OM
      if (chord.showPerpendicular) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerPos.x, centerPos.y);
        ctx.lineTo(midPos.x, midPos.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Right-angle symbol at midpoint M
        const dx = (midPos.x - centerPos.x) / (metrics.distFromCenter * zoom || 1);
        const dy = (midPos.y - centerPos.y) / (metrics.distFromCenter * zoom || 1);
        const perpX = -dy;
        const perpY = dx;
        const sqSize = 8;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(midPos.x - dx * sqSize, midPos.y - dy * sqSize);
        ctx.lineTo(midPos.x - dx * sqSize + perpX * sqSize, midPos.y - dy * sqSize + perpY * sqSize);
        ctx.lineTo(midPos.x + perpX * sqSize, midPos.y + perpY * sqSize);
        ctx.stroke();

        // Distance label with pill badge
        const distMidX = (centerPos.x + midPos.x) / 2;
        const distMidY = (centerPos.y + midPos.y) / 2;
        drawPillBadge(ctx, `d = ${metrics.distFromCenter.toFixed(2)}`, distMidX + 16, distMidY, {
          fontSize: typography.secondaryCoordSize,
          fontFamily: typography.fontFamily,
          textColor: '#cbd5e1',
          borderColor: 'rgba(148, 163, 184, 0.4)',
          paddingX: 5,
          paddingY: 2,
        });
      }

      // Midpoint marker M
      if (chord.showMidpoint) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(midPos.x, midPos.y, 4, 0, Math.PI * 2);
        ctx.fill();

        drawHaloText(ctx, 'M', midPos.x + 8, midPos.y - 6, {
          font: `bold ${typography.pointLabelSize}px ${typography.fontFamily}`,
          fillColor: '#f59e0b',
          haloColor: '#090d16',
          haloWidth: typography.haloWidth,
        });
      }

      // Length Badge
      drawPillBadge(ctx, `L = ${metrics.length.toFixed(2)}`, midPos.x, midPos.y + 20, {
        fontSize: typography.measurementSize,
        fontFamily: typography.fontFamily,
        textColor: '#f59e0b',
        borderColor: 'rgba(245, 158, 11, 0.45)',
        paddingX: typography.badgePaddingX,
        paddingY: typography.badgePaddingY,
        borderRadius: typography.badgeRadius,
      });
      ctx.restore();
    });

    // 7. Draw Angles (Central & Inscribed)
    Object.values(angles).forEach((ang) => {
      const circle = circles[ang.circleId];
      const pt1 = circumferencePoints[ang.point1Id];
      const pt2 = circumferencePoints[ang.point2Id];
      if (!circle || !pt1 || !pt2) return;

      const world1 = getCircumferenceCoords(circle, pt1.angleRad);
      const world2 = getCircumferenceCoords(circle, pt2.angleRad);
      const worldVertex =
        ang.vertexId === 'center'
          ? circle.center
          : circumferencePoints[ang.vertexId]
          ? getCircumferenceCoords(circle, circumferencePoints[ang.vertexId].angleRad)
          : circle.center;

      const p1Pos = toScreen(world1);
      const p2Pos = toScreen(world2);
      const vPos = toScreen(worldVertex);

      const angleDeg = calculateAngleDegrees(world1, worldVertex, world2);

      ctx.save();
      // Draw rays from vertex to points
      ctx.strokeStyle = ang.color || '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(vPos.x, vPos.y);
      ctx.lineTo(p1Pos.x, p1Pos.y);
      ctx.moveTo(vPos.x, vPos.y);
      ctx.lineTo(p2Pos.x, p2Pos.y);
      ctx.stroke();

      // Angle Arc
      const a1 = Math.atan2(p1Pos.y - vPos.y, p1Pos.x - vPos.x);
      const a2 = Math.atan2(p2Pos.y - vPos.y, p2Pos.x - vPos.x);
      ctx.beginPath();
      ctx.arc(vPos.x, vPos.y, 24, a1, a2);
      ctx.stroke();

      // Degree Badge
      const labelX = vPos.x + 22 * Math.cos((a1 + a2) / 2) + 12;
      const labelY = vPos.y + 22 * Math.sin((a1 + a2) / 2) - 8;
      drawPillBadge(ctx, `${angleDeg.toFixed(1)}°`, labelX, labelY, {
        fontSize: typography.measurementSize,
        fontFamily: typography.fontFamily,
        textColor: ang.color || '#38bdf8',
        borderColor: 'rgba(56, 189, 248, 0.45)',
        paddingX: typography.badgePaddingX,
        paddingY: typography.badgePaddingY,
        borderRadius: typography.badgeRadius,
      });
      ctx.restore();
    });

    // 8. Draw Tangents
    Object.values(tangents).forEach((tan) => {
      const circle = circles[tan.circleId];
      const contactPt = circumferencePoints[tan.contactPointId];
      if (!circle || !contactPt) return;

      const worldContact = getCircumferenceCoords(circle, contactPt.angleRad);
      const tangentSeg = calculateTangentSegment(circle, worldContact, tan.length);
      const startPos = toScreen(tangentSeg.pStart);
      const endPos = toScreen(tangentSeg.pEnd);
      const contactPos = toScreen(worldContact);
      const centerPos = toScreen(circle.center);

      ctx.save();
      // Tangent line
      ctx.strokeStyle = tan.color || '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(endPos.x, endPos.y);
      ctx.stroke();

      // Radius line to contact point
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(centerPos.x, centerPos.y);
      ctx.lineTo(contactPos.x, contactPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Right-angle 90° box indicator
      const rx = (contactPos.x - centerPos.x) / (circle.radius * zoom || 1);
      const ry = (contactPos.y - centerPos.y) / (circle.radius * zoom || 1);
      const tx = -ry;
      const ty = rx;
      const bSize = 9;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(contactPos.x - rx * bSize, contactPos.y - ry * bSize);
      ctx.lineTo(contactPos.x - rx * bSize + tx * bSize, contactPos.y - ry * bSize + ty * bSize);
      ctx.lineTo(contactPos.x + tx * bSize, contactPos.y + ty * bSize);
      ctx.stroke();

      drawHaloText(ctx, '90°', contactPos.x + tx * 18, contactPos.y + ty * 18, {
        font: `bold ${typography.secondaryCoordSize}px monospace`,
        fillColor: '#f59e0b',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });
      ctx.restore();
    });

    // 9. Draw Circumference Points
    Object.values(circumferencePoints).forEach((pt) => {
      const circle = circles[pt.circleId];
      if (!circle) return;

      const worldCoords = getCircumferenceCoords(circle, pt.angleRad);
      const screenPos = toScreen(worldCoords);
      const isSelected = selectedId === pt.id;

      ctx.save();
      // Outer glow if selected
      if (isSelected) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.beginPath();
        ctx.arc(screenPos.x, screenPos.y, 11, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isSelected ? '#ffffff' : pt.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 5.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Radial outward label offset prevents label overlapping circle line or chord
      const cosA = Math.cos(pt.angleRad);
      const sinA = Math.sin(pt.angleRad);
      const labelOffset = 16;
      const labelX = screenPos.x + cosA * labelOffset;
      const labelY = screenPos.y - sinA * labelOffset;

      drawHaloText(ctx, pt.name, labelX, labelY, {
        font: `bold ${typography.pointLabelSize}px ${typography.fontFamily}`,
        fillColor: '#ffffff',
        haloColor: '#090d16',
        haloWidth: typography.haloWidth,
      });

      // Coordinates if enabled
      if (showCoordinates) {
        drawHaloText(ctx, `(${worldCoords.x}, ${worldCoords.y})`, labelX, labelY + 14, {
          font: `${typography.secondaryCoordSize}px monospace`,
          fillColor: '#94a3b8',
          haloColor: '#090d16',
          haloWidth: typography.haloWidth,
        });
      }
      ctx.restore();
    });

    // 10. Draw Construction Preview
    if (previewPoint && constructionStep.type === 'creating_circle' && constructionStep.center) {
      const cPos = toScreen(constructionStep.center);
      const r = distanceBetween(constructionStep.center, previewPoint);
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cPos.x, cPos.y, r * zoom, 0, Math.PI * 2);
      ctx.stroke();

      drawPillBadge(ctx, `r = ${r.toFixed(2)}`, cPos.x, cPos.y - r * zoom - 16, {
        fontSize: typography.measurementSize,
        fontFamily: typography.fontFamily,
        textColor: '#38bdf8',
        borderColor: 'rgba(56, 189, 248, 0.6)',
      });
      ctx.restore();
    }
  }, [
    circles,
    circumferencePoints,
    chords,
    radiusDiameters,
    angles,
    tangents,
    cyclicQuads,
    selectedId,
    activeTool,
    constructionStep,
    viewport,
    labelSize,
    showGrid,
    showAxes,
    showCoordinates,
    previewPoint,
  ]);

  // Pointer Interaction Lifecycle with Screen-Space Hit Tolerance
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const width = canvas.width;
    const height = canvas.height;
    const { zoom, panX, panY } = viewport;

    const clickWorld = screenToWorld(screenX, screenY, zoom, width / 2 + panX, panY, height);
    const toScreen = (pt: WorldPoint) =>
      worldToScreen(pt.x, pt.y, zoom, width / 2 + panX, panY, height);

    // Mid-click or Space or Alt => Pan
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: screenX - panX, y: screenY - panY });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // 1. SELECT TOOL
    if (activeTool === 'select') {
      // Check circumference points first
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          selectObject(pt.id, 'point');
          setDraggedPointId(pt.id);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check circle centers
      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        if (pointHitsScreenPoint(screenX, screenY, centerScreen.x, centerScreen.y, HIT_TOLERANCE_PX)) {
          selectObject(circle.id, 'circle');
          setDraggedCircleCenterId(circle.id);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check circle circumference
      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        if (
          pointHitsCircleCircumference(
            screenX,
            screenY,
            centerScreen.x,
            centerScreen.y,
            circle.radius * zoom,
            HIT_TOLERANCE_PX
          )
        ) {
          selectObject(circle.id, 'circle');
          return;
        }
      }

      // Check chords
      for (const chord of Object.values(chords)) {
        const circle = circles[chord.circleId];
        const ptA = circumferencePoints[chord.pointAId];
        const ptB = circumferencePoints[chord.pointBId];
        if (!circle || !ptA || !ptB) continue;
        const posA = toScreen(getCircumferenceCoords(circle, ptA.angleRad));
        const posB = toScreen(getCircumferenceCoords(circle, ptB.angleRad));
        if (distanceToScreenSegment(screenX, screenY, posA.x, posA.y, posB.x, posB.y) <= HIT_TOLERANCE_PX) {
          selectObject(chord.id, 'chord');
          return;
        }
      }

      // Empty click => Deselect & start pan
      selectObject(null);
      setIsPanning(true);
      setPanStart({ x: screenX - panX, y: screenY - panY });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // 2. CIRCLE TOOL (C)
    if (activeTool === 'circle') {
      if (constructionStep.type === 'idle') {
        setConstructionStep({ type: 'creating_circle', center: clickWorld });
      } else if (constructionStep.type === 'creating_circle' && constructionStep.center) {
        const radius = distanceBetween(constructionStep.center, clickWorld);
        if (radius > 0.4) {
          addCircle(constructionStep.center, radius);
        }
        setConstructionStep({ type: 'idle' });
        setPreviewPoint(null);
      }
      return;
    }

    // 3. POINT ON CIRCLE TOOL (P)
    if (activeTool === 'point_on_circle') {
      let closestCircle: CircleObject | null = null;
      let minDiffPx = 30; // 30px screen tolerance

      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        const distPx = Math.hypot(screenX - centerScreen.x, screenY - centerScreen.y);
        const diffPx = Math.abs(distPx - circle.radius * zoom);
        if (diffPx < minDiffPx) {
          minDiffPx = diffPx;
          closestCircle = circle;
        }
      }

      if (closestCircle) {
        const angleRad = projectPointToCircleAngle(closestCircle.center, clickWorld);
        addCircumferencePoint(closestCircle.id, angleRad);
      }
      return;
    }

    // 4. CHORD TOOL (H)
    if (activeTool === 'chord') {
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          if (constructionStep.type !== 'creating_chord') {
            setConstructionStep({ type: 'creating_chord', circleId: circle.id, firstPointId: pt.id });
          } else if (constructionStep.firstPointId) {
            if (constructionStep.firstPointId !== pt.id && constructionStep.circleId === circle.id) {
              addChord(circle.id, constructionStep.firstPointId, pt.id);
            }
            setConstructionStep({ type: 'idle' });
          }
          return;
        }
      }
      return;
    }

    // 5. RADIUS TOOL (R)
    if (activeTool === 'radius') {
      // If clicked near an existing circumference point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          addRadiusDiameter(circle.id, 'radius', pt.id);
          return;
        }
      }

      // If clicked on circle circumference without a point, create point and radius
      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        if (
          pointHitsCircleCircumference(
            screenX,
            screenY,
            centerScreen.x,
            centerScreen.y,
            circle.radius * zoom,
            HIT_TOLERANCE_PX
          )
        ) {
          const angleRad = projectPointToCircleAngle(circle.center, clickWorld);
          const newPtId = addCircumferencePoint(circle.id, angleRad);
          addRadiusDiameter(circle.id, 'radius', newPtId);
          return;
        }
      }
      return;
    }

    // 6. DIAMETER TOOL (D) - Dedicated & Guaranteed
    if (activeTool === 'diameter') {
      // Step A: Check if clicked on an existing circumference point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          addDiameter(circle.id, pt.id);
          setConstructionStep({ type: 'idle' });
          return;
        }
      }

      // Step B: Check if clicked on a circle circumference: create point and diameter
      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        if (
          pointHitsCircleCircumference(
            screenX,
            screenY,
            centerScreen.x,
            centerScreen.y,
            circle.radius * zoom,
            HIT_TOLERANCE_PX + 4
          )
        ) {
          const angleRad = projectPointToCircleAngle(circle.center, clickWorld);
          const newPtId = addCircumferencePoint(circle.id, angleRad);
          addDiameter(circle.id, newPtId);
          setConstructionStep({ type: 'idle' });
          return;
        }
      }

      // Step C: If clicked inside a circle body, target this circle for diameter construction
      for (const circle of Object.values(circles)) {
        if (distanceBetween(clickWorld, circle.center) <= circle.radius) {
          selectObject(circle.id, 'circle');
          setConstructionStep({ type: 'creating_diameter', circleId: circle.id });
          return;
        }
      }
      return;
    }

    // Backward-compatibility: radius_diameter
    if (activeTool === 'radius_diameter') {
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          addRadiusDiameter(circle.id, 'radius', pt.id);
          return;
        }
      }
      return;
    }

    // 7. TANGENT TOOL (T)
    if (activeTool === 'tangent') {
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          addTangent(circle.id, pt.id);
          return;
        }
      }
      return;
    }

    // 8. ERASER TOOL (E)
    if (activeTool === 'eraser') {
      // Click point => delete point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptScreen = toScreen(getCircumferenceCoords(circle, pt.angleRad));
        if (pointHitsScreenPoint(screenX, screenY, ptScreen.x, ptScreen.y, HIT_TOLERANCE_PX)) {
          deleteObject(pt.id, 'point');
          return;
        }
      }
      // Click chord => delete chord
      for (const chord of Object.values(chords)) {
        const circle = circles[chord.circleId];
        const ptA = circumferencePoints[chord.pointAId];
        const ptB = circumferencePoints[chord.pointBId];
        if (!circle || !ptA || !ptB) continue;
        const posA = toScreen(getCircumferenceCoords(circle, ptA.angleRad));
        const posB = toScreen(getCircumferenceCoords(circle, ptB.angleRad));
        if (distanceToScreenSegment(screenX, screenY, posA.x, posA.y, posB.x, posB.y) <= HIT_TOLERANCE_PX) {
          deleteObject(chord.id, 'chord');
          return;
        }
      }
      // Click diameter or radius
      for (const item of Object.values(radiusDiameters)) {
        const circle = circles[item.circleId];
        const pt1 = circumferencePoints[item.pointId];
        if (!circle || !pt1) continue;
        const pos1 = toScreen(getCircumferenceCoords(circle, pt1.angleRad));
        const centerPos = toScreen(circle.center);
        if (distanceToScreenSegment(screenX, screenY, pos1.x, pos1.y, centerPos.x, centerPos.y) <= HIT_TOLERANCE_PX) {
          deleteObject(item.id, 'radius_diameter');
          return;
        }
      }
      // Click circle circumference => delete circle
      for (const circle of Object.values(circles)) {
        const centerScreen = toScreen(circle.center);
        if (
          pointHitsCircleCircumference(
            screenX,
            screenY,
            centerScreen.x,
            centerScreen.y,
            circle.radius * zoom,
            HIT_TOLERANCE_PX
          )
        ) {
          deleteObject(circle.id, 'circle');
          return;
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
    const width = canvas.width;
    const height = canvas.height;
    const { zoom, panX, panY } = viewport;

    const currentWorld = screenToWorld(screenX, screenY, zoom, width / 2 + panX, panY, height);

    // Viewport Pan
    if (isPanning) {
      setViewport({
        panX: screenX - panStart.x,
        panY: screenY - panStart.y,
      });
      return;
    }

    // Dragging Circumference Point
    if (draggedPointId) {
      const pt = circumferencePoints[draggedPointId];
      if (!pt) return;
      const circle = circles[pt.circleId];
      if (!circle) return;

      const angleRad = projectPointToCircleAngle(circle.center, currentWorld);
      updateCircumferencePoint(draggedPointId, angleRad);
      return;
    }

    // Dragging Circle Center
    if (draggedCircleCenterId) {
      updateCircle(draggedCircleCenterId, { center: currentWorld });
      return;
    }

    // Circle Creation Preview
    if (constructionStep.type === 'creating_circle') {
      setPreviewPoint(currentWorld);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    if (draggedPointId) {
      setDraggedPointId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
    if (draggedCircleCenterId) {
      setDraggedCircleCenterId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
    }
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(15, Math.min(130, viewport.zoom * zoomFactor));
    setViewport({ zoom: newZoom });
  };

  // Active Tool Instructional Guidance Text
  const instructionInfo = TOOL_INSTRUCTIONS[activeTool] || TOOL_INSTRUCTIONS.select;
  let activeInstruction = instructionInfo.instruction;
  if (constructionStep.type === 'creating_circle') {
    activeInstruction = 'Center placed. Move cursor and click to set the radius. Press Esc to cancel.';
  } else if (constructionStep.type === 'creating_chord') {
    activeInstruction = 'First point selected. Click a second point on the circle to create the chord. Press Esc to cancel.';
  } else if (constructionStep.type === 'creating_diameter') {
    activeInstruction = 'Circle targeted. Click an existing point or anywhere on its circumference to construct the diameter. Press Esc to cancel.';
  }

  return (
    <div className="relative flex-1 h-full w-full bg-surface-lowest overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full block cursor-crosshair"
        style={{ touchAction: 'none' }}
      />

      {/* Floating Canvas Viewport Controls */}
      <div className="absolute bottom-16 right-4 flex items-center gap-1.5 bg-surface-elevated/90 backdrop-blur-md p-1.5 rounded-xl border border-surface-border shadow-xl z-20">
        <button
          onClick={zoomIn}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={zoomOut}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <button
          onClick={resetZoom}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs font-mono font-bold"
          title="1:1 (Default Scale)"
        >
          1:1
        </button>
        <button
          onClick={() => {
            if (canvasRef.current) {
              fitToConstruction(canvasRef.current.width, canvasRef.current.height);
            }
          }}
          className="px-2.5 h-8 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:text-amber-300 transition-all text-xs font-semibold gap-1"
          title="Fit Construction in Usable Viewport"
        >
          <span className="material-symbols-outlined text-[16px]">fit_screen</span>
          <span className="hidden sm:inline">Fit</span>
        </button>
      </div>

      {/* Persistent Bottom Guidance Bar (Visible for touch screens and classrooms) */}
      <div className="absolute bottom-3 left-3 right-3 sm:right-64 bg-surface-elevated/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-surface-border shadow-2xl flex items-center justify-between gap-3 text-xs z-20 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">
              {activeTool === 'select'
                ? 'near_me'
                : activeTool === 'circle'
                ? 'radio_button_unchecked'
                : activeTool === 'point_on_circle'
                ? 'adjust'
                : activeTool === 'chord'
                ? 'linear_scale'
                : activeTool === 'radius'
                ? 'straighten'
                : activeTool === 'diameter'
                ? 'line_start_circle'
                : activeTool === 'angle_measure'
                ? 'square_foot'
                : activeTool === 'tangent'
                ? 'border_color'
                : 'ink_eraser'}
            </span>
          </span>
          <div className="min-w-0">
            <div className="font-bold text-slate-200 flex items-center gap-1.5">
              <span>{instructionInfo.name}</span>
              <span className="text-[10px] font-mono px-1 rounded bg-surface-card text-amber-400 border border-surface-border">
                [{instructionInfo.shortcut}]
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {activeInstruction}
            </div>
          </div>
        </div>

        {constructionStep.type !== 'idle' && (
          <button
            onClick={() => {
              setConstructionStep({ type: 'idle' });
              setPreviewPoint(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-[11px] font-semibold transition-all shrink-0 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
            <span>Cancel (Esc)</span>
          </button>
        )}
      </div>
    </div>
  );
};
