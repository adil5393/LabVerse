import { describe, it, expect } from 'vitest';
import {
  distanceBetween,
  getCircumferenceCoords,
  projectPointToCircleAngle,
  calculateChordMetrics,
  calculateAngleDegrees,
  calculateTangentSegment,
  screenToWorld,
  worldToScreen,
} from '../geometry';
import type { CircleObject, WorldPoint } from '../types';

describe('Circle Geometry Engine - Pure Calculations', () => {
  const testCircle: CircleObject = {
    id: 'c1',
    name: 'Circle 1',
    center: { x: 0, y: 0 },
    radius: 5.0,
  };

  describe('Circumference Points and Projections', () => {
    it('calculates exact coordinates for cardinal angles', () => {
      // 0 rad => (5, 0)
      const p0 = getCircumferenceCoords(testCircle, 0);
      expect(p0.x).toBeCloseTo(5.0, 3);
      expect(p0.y).toBeCloseTo(0.0, 3);

      // π/2 rad (90°) => (0, 5)
      const p90 = getCircumferenceCoords(testCircle, Math.PI / 2);
      expect(p90.x).toBeCloseTo(0.0, 3);
      expect(p90.y).toBeCloseTo(5.0, 3);

      // π rad (180°) => (-5, 0)
      const p180 = getCircumferenceCoords(testCircle, Math.PI);
      expect(p180.x).toBeCloseTo(-5.0, 3);
      expect(p180.y).toBeCloseTo(0.0, 3);
    });

    it('projects an arbitrary external or internal point onto circle angle', () => {
      const extPoint: WorldPoint = { x: 10, y: 10 };
      const angle = projectPointToCircleAngle(testCircle.center, extPoint);
      expect(angle).toBeCloseTo(Math.PI / 4, 3); // 45°

      const boundaryPoint = getCircumferenceCoords(testCircle, angle);
      expect(distanceBetween(testCircle.center, boundaryPoint)).toBeCloseTo(5.0, 3);
    });
  });

  describe('Chord Metrics (Length, Midpoint, Perpendicular Distance)', () => {
    it('calculates chord metrics for a 90° arc chord', () => {
      // Chord from (5,0) to (0,5): length should be 5*sqrt(2) ≈ 7.071
      const ptA: WorldPoint = { x: 5, y: 0 };
      const ptB: WorldPoint = { x: 0, y: 5 };

      const metrics = calculateChordMetrics(testCircle, ptA, ptB);
      expect(metrics.length).toBeCloseTo(5 * Math.SQRT2, 2);
      expect(metrics.midpoint.x).toBeCloseTo(2.5, 3);
      expect(metrics.midpoint.y).toBeCloseTo(2.5, 3);
      // Distance from center to midpoint: sqrt(2.5² + 2.5²) ≈ 3.5355 = 5/sqrt(2)
      expect(metrics.distFromCenter).toBeCloseTo(5 / Math.SQRT2, 2);
      expect(metrics.subtendedAngleDeg).toBeCloseTo(90.0, 1);
    });

    it('calculates diameter as chord of maximum length 2r passing through center (d = 0)', () => {
      const ptA: WorldPoint = { x: -5, y: 0 };
      const ptB: WorldPoint = { x: 5, y: 0 };

      const metrics = calculateChordMetrics(testCircle, ptA, ptB);
      expect(metrics.length).toBeCloseTo(10.0, 2);
      expect(metrics.midpoint.x).toBeCloseTo(0.0, 3);
      expect(metrics.midpoint.y).toBeCloseTo(0.0, 3);
      expect(metrics.distFromCenter).toBeCloseTo(0.0, 3);
      expect(metrics.subtendedAngleDeg).toBeCloseTo(180.0, 1);
    });
  });

  describe('Angle Measurement', () => {
    it('measures 90° angle between perpendicular axes', () => {
      const p1: WorldPoint = { x: 5, y: 0 };
      const vertex: WorldPoint = { x: 0, y: 0 };
      const p2: WorldPoint = { x: 0, y: 5 };

      const deg = calculateAngleDegrees(p1, vertex, p2);
      expect(deg).toBeCloseTo(90.0, 1);
    });

    it('measures 60° angle in an equilateral triangle', () => {
      const p1: WorldPoint = { x: 0, y: 0 };
      const vertex: WorldPoint = { x: 2, y: 0 };
      const p2: WorldPoint = { x: 1, y: Math.sqrt(3) };

      const deg = calculateAngleDegrees(p1, vertex, p2);
      expect(deg).toBeCloseTo(60.0, 1);
    });
  });

  describe('Tangent Calculation and Perpendicularity', () => {
    it('produces tangent segment perpendicular to radius vector', () => {
      const contactPt: WorldPoint = { x: 0, y: 5 }; // Top point
      const tangent = calculateTangentSegment(testCircle, contactPt, 6.0);

      expect(tangent.isPerpendicularToRadius).toBe(true);
      // At (0, 5), tangent should be horizontal along y = 5
      expect(tangent.pStart.y).toBeCloseTo(5.0, 3);
      expect(tangent.pEnd.y).toBeCloseTo(5.0, 3);
      expect(distanceBetween(tangent.pStart, tangent.pEnd)).toBeCloseTo(6.0, 2);
    });
  });

  describe('Coordinate Transformations', () => {
    it('converts world coordinates to screen and back losslessly', () => {
      const zoom = 40;
      const panX = 100;
      const panY = 50;
      const canvasHeight = 600;

      const worldPt: WorldPoint = { x: 3.5, y: -2.0 };
      const screen = worldToScreen(worldPt.x, worldPt.y, zoom, panX, panY, canvasHeight);
      const roundtrip = screenToWorld(screen.x, screen.y, zoom, panX, panY, canvasHeight);

      expect(roundtrip.x).toBeCloseTo(worldPt.x, 3);
      expect(roundtrip.y).toBeCloseTo(worldPt.y, 3);
    });
  });
});
