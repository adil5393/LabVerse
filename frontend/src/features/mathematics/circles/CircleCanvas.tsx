/**
 * Circle Canvas Component for Class 9 Circles Laboratory (Milestone M2)
 *
 * Implements interactive 2D canvas rendering of:
 * - Cartesian coordinate plane (grid, axes, ticks)
 * - Circles (center, circumference, radius)
 * - Constrained circumference points (free dragging along circle)
 * - Chords (midpoint, perpendicular distance from center, length badges)
 * - Central and inscribed angles (arcs, degree readouts)
 * - Tangent lines (perpendicular indicator at contact point)
 * - Cyclic quadrilaterals (polygon fill, opposite angle metrics)
 * - Live tool preview and pointer interaction lifecycle
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
} from '../../../engine/mathematics/circles/geometry';
import type { WorldPoint, CircleObject } from '../../../engine/mathematics/circles/types';

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
    addTangent,
    deleteObject,
    setConstructionStep,
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

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { zoom, panX, panY } = viewport;

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

      // Axis labels & origin
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('x', width - 15, originY - 6);
      ctx.fillText('y', originX + 6, 15);
      ctx.fillText('O(0,0)', originX + 5, originY + 14);
      ctx.restore();
    }

    // Helper to map world to current screen
    const toScreen = (pt: WorldPoint) =>
      worldToScreen(pt.x, pt.y, zoom, width / 2 + panX, panY, height);

    // 3. Draw Cyclic Quadrilaterals (Fill background)
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

      // Circle border
      ctx.strokeStyle = isSelected ? '#ffffff' : circle.color || '#38bdf8';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();

      // Circle Center Marker
      ctx.fillStyle = isSelected ? '#ffffff' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(centerScreen.x, centerScreen.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(circle.name, centerScreen.x + 8, centerScreen.y - 8);
      ctx.restore();
    });

    // 5. Draw Radius / Diameters
    Object.values(radiusDiameters).forEach((rad) => {
      const circle = circles[rad.circleId];
      const pt1 = circumferencePoints[rad.pointId];
      if (!circle || !pt1) return;

      const p1Pos = toScreen(getCircumferenceCoords(circle, pt1.angleRad));
      const centerPos = toScreen(circle.center);

      ctx.save();
      ctx.strokeStyle = rad.color || '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();

      if (rad.type === 'radius') {
        ctx.moveTo(centerPos.x, centerPos.y);
        ctx.lineTo(p1Pos.x, p1Pos.y);
        ctx.stroke();

        // Label
        const midX = (centerPos.x + p1Pos.x) / 2;
        const midY = (centerPos.y + p1Pos.y) / 2;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`r = ${circle.radius.toFixed(1)}`, midX + 5, midY - 5);
      } else {
        // Diameter: opposite point
        const oppPos = toScreen(getCircumferenceCoords(circle, pt1.angleRad + Math.PI));
        ctx.moveTo(p1Pos.x, p1Pos.y);
        ctx.lineTo(oppPos.x, oppPos.y);
        ctx.stroke();

        const midX = centerPos.x;
        const midY = centerPos.y;
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`d = ${(circle.radius * 2).toFixed(1)}`, midX + 8, midY - 8);
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
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(posA.x, posA.y);
      ctx.lineTo(posB.x, posB.y);
      ctx.stroke();

      // Draw Perpendicular from Center OM (if enabled)
      if (chord.showPerpendicular) {
        ctx.setLineDash([3, 3]);
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
        const sqSize = 7;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(midPos.x - dx * sqSize, midPos.y - dy * sqSize);
        ctx.lineTo(midPos.x - dx * sqSize + perpX * sqSize, midPos.y - dy * sqSize + perpY * sqSize);
        ctx.lineTo(midPos.x + perpX * sqSize, midPos.y + perpY * sqSize);
        ctx.stroke();

        // Distance label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '9px monospace';
        const distMidX = (centerPos.x + midPos.x) / 2;
        const distMidY = (centerPos.y + midPos.y) / 2;
        ctx.fillText(`d = ${metrics.distFromCenter.toFixed(2)}`, distMidX + 4, distMidY);
      }

      // Midpoint marker
      if (chord.showMidpoint) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(midPos.x, midPos.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('M', midPos.x + 5, midPos.y - 5);
      }

      // Length Badge
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`L = ${metrics.length.toFixed(2)}`, midPos.x - 20, midPos.y + 16);
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
      ctx.lineWidth = 1.5;
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
      ctx.arc(vPos.x, vPos.y, 22, a1, a2);
      ctx.stroke();

      // Degree Badge
      ctx.fillStyle = ang.color || '#38bdf8';
      ctx.font = 'bold 11px monospace';
      const labelX = vPos.x + 14 * Math.cos((a1 + a2) / 2) + 6;
      const labelY = vPos.y + 14 * Math.sin((a1 + a2) / 2) - 4;
      ctx.fillText(`${angleDeg.toFixed(1)}°`, labelX, labelY);
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
      ctx.lineWidth = 2;
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
      const rx = (contactPos.x - centerPos.x) / (circle.radius * zoom);
      const ry = (contactPos.y - centerPos.y) / (circle.radius * zoom);
      const tx = -ry;
      const ty = rx;
      const bSize = 8;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(contactPos.x - rx * bSize, contactPos.y - ry * bSize);
      ctx.lineTo(contactPos.x - rx * bSize + tx * bSize, contactPos.y - ry * bSize + ty * bSize);
      ctx.lineTo(contactPos.x + tx * bSize, contactPos.y + ty * bSize);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('90°', contactPos.x + tx * 14 - 8, contactPos.y + ty * 14);
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
        ctx.arc(screenPos.x, screenPos.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = isSelected ? '#ffffff' : pt.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(pt.name, screenPos.x + 8, screenPos.y - 6);

      // Coordinates tooltip if enabled
      if (showCoordinates) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.fillText(`(${worldCoords.x}, ${worldCoords.y})`, screenPos.x + 8, screenPos.y + 12);
      }
      ctx.restore();
    });

    // 10. Draw Construction Preview
    if (previewPoint && constructionStep.type === 'creating_circle' && constructionStep.center) {
      const cPos = toScreen(constructionStep.center);
      const r = distanceBetween(constructionStep.center, previewPoint);
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cPos.x, cPos.y, r * zoom, 0, Math.PI * 2);
      ctx.stroke();
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
    showGrid,
    showAxes,
    showCoordinates,
    previewPoint,
  ]);

  // Pointer Interaction Lifecycle
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

    // Mid-click or Space or Select empty area => Pan
    if (e.button === 1 || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: screenX - panX, y: screenY - panY });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      return;
    }

    // 1. SELECT TOOL
    if (activeTool === 'select') {
      // Check if clicked near a circumference point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptWorld = getCircumferenceCoords(circle, pt.angleRad);
        if (distanceBetween(clickWorld, ptWorld) < 0.4) {
          selectObject(pt.id, 'point');
          setDraggedPointId(pt.id);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check if clicked near a circle center
      for (const circle of Object.values(circles)) {
        if (distanceBetween(clickWorld, circle.center) < 0.4) {
          selectObject(circle.id, 'circle');
          setDraggedCircleCenterId(circle.id);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
      }

      // Check if clicked on a circle circumference
      for (const circle of Object.values(circles)) {
        const dist = distanceBetween(clickWorld, circle.center);
        if (Math.abs(dist - circle.radius) < 0.4) {
          selectObject(circle.id, 'circle');
          return;
        }
      }

      // Check if clicked on a chord
      for (const chord of Object.values(chords)) {
        const circle = circles[chord.circleId];
        const ptA = circumferencePoints[chord.pointAId];
        const ptB = circumferencePoints[chord.pointBId];
        if (!circle || !ptA || !ptB) continue;
        const worldA = getCircumferenceCoords(circle, ptA.angleRad);
        const worldB = getCircumferenceCoords(circle, ptB.angleRad);
        const metrics = calculateChordMetrics(circle, worldA, worldB);
        if (distanceBetween(clickWorld, metrics.midpoint) < 0.5) {
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
        if (radius > 0.5) {
          addCircle(constructionStep.center, radius);
        }
        setConstructionStep({ type: 'idle' });
        setPreviewPoint(null);
      }
      return;
    }

    // 3. POINT ON CIRCLE TOOL (P)
    if (activeTool === 'point_on_circle') {
      // Find closest circle to click
      let closestCircle: CircleObject | null = null;
      let minDiff = 1.0;

      for (const circle of Object.values(circles)) {
        const dist = distanceBetween(clickWorld, circle.center);
        const diff = Math.abs(dist - circle.radius);
        if (diff < minDiff) {
          minDiff = diff;
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
      // Find clicked circumference point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptWorld = getCircumferenceCoords(circle, pt.angleRad);
        if (distanceBetween(clickWorld, ptWorld) < 0.5) {
          if (constructionStep.type === 'idle' || constructionStep.type !== 'creating_chord') {
            setConstructionStep({ type: 'creating_chord', circleId: circle.id, firstPointId: pt.id });
          } else if (constructionStep.type === 'creating_chord' && constructionStep.firstPointId) {
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

    // 5. RADIUS / DIAMETER TOOL (R)
    if (activeTool === 'radius_diameter') {
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptWorld = getCircumferenceCoords(circle, pt.angleRad);
        if (distanceBetween(clickWorld, ptWorld) < 0.5) {
          addRadiusDiameter(circle.id, 'radius', pt.id);
          return;
        }
      }
      return;
    }

    // 6. TANGENT TOOL (T)
    if (activeTool === 'tangent') {
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptWorld = getCircumferenceCoords(circle, pt.angleRad);
        if (distanceBetween(clickWorld, ptWorld) < 0.5) {
          addTangent(circle.id, pt.id);
          return;
        }
      }
      return;
    }

    // 7. ERASER TOOL (E)
    if (activeTool === 'eraser') {
      // Click point => delete point
      for (const pt of Object.values(circumferencePoints)) {
        const circle = circles[pt.circleId];
        if (!circle) continue;
        const ptWorld = getCircumferenceCoords(circle, pt.angleRad);
        if (distanceBetween(clickWorld, ptWorld) < 0.5) {
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
        const worldA = getCircumferenceCoords(circle, ptA.angleRad);
        const worldB = getCircumferenceCoords(circle, ptB.angleRad);
        const metrics = calculateChordMetrics(circle, worldA, worldB);
        if (distanceBetween(clickWorld, metrics.midpoint) < 0.5) {
          deleteObject(chord.id, 'chord');
          return;
        }
      }
      // Click circle => delete circle
      for (const circle of Object.values(circles)) {
        if (Math.abs(distanceBetween(clickWorld, circle.center) - circle.radius) < 0.5) {
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

    // Dragging Viewport Pan
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
    const newZoom = Math.max(15, Math.min(120, viewport.zoom * zoomFactor));
    setViewport({ zoom: newZoom });
  };

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

      {/* Floating Canvas Action Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-surface-elevated/90 backdrop-blur-md p-1 rounded-xl border border-surface-border shadow-xl">
        <button
          onClick={() => setViewport({ zoom: Math.min(120, viewport.zoom * 1.2) })}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>
        <button
          onClick={() => setViewport({ zoom: Math.max(15, viewport.zoom * 0.8) })}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
        <button
          onClick={() => setViewport({ zoom: 45, panX: 0, panY: 0 })}
          className="w-8 h-8 rounded-lg bg-surface-card hover:bg-surface-elevated flex items-center justify-center text-slate-300 hover:text-white transition-all text-xs font-mono font-bold"
          title="Reset View"
        >
          1:1
        </button>
      </div>

      {/* Construction Hint Overlay */}
      {constructionStep.type !== 'idle' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/20 backdrop-blur-md border border-amber-500/40 text-amber-300 px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-2 animate-pulse">
          <span className="material-symbols-outlined text-[16px]">info</span>
          <span>
            {constructionStep.type === 'creating_circle' && 'Click to set circle radius'}
            {constructionStep.type === 'creating_chord' && 'Click second point to finish chord'}
          </span>
          <button
            onClick={() => setConstructionStep({ type: 'idle' })}
            className="text-amber-200 hover:text-white ml-2 underline text-[10px]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
