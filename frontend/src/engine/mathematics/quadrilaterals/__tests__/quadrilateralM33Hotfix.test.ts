/**
 * LabVerse Milestone M3.3 Hotfix Tests
 * Functional Tools, Parallel Constraints & Measurement Reset
 * NCERT Class 9 Quadrilaterals - Chapter 12
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuadrilateralStore } from '../../../../store/useQuadrilateralStore';
import {
  checkParallelism,
  distanceBetween,
  computeStandaloneAngleGeometry,
  distanceToScreenSegment,
  pointHitsScreenPoint,
} from '../geometry';

describe('Milestone M3.3 Hotfix: Functional Tools & Constraints', () => {
  beforeEach(() => {
    useQuadrilateralStore.getState().setExperiment('what-is-a-quadrilateral');
    useQuadrilateralStore.getState().setMode('explore');
    useQuadrilateralStore.getState().clearAllMeasurements();
  });

  // ==========================================================================
  // 1. Parallel Constraint (∥) Tests
  // ==========================================================================
  describe('Parallel Constraint Tool (∥)', () => {
    it('applies parallel constraint between arbitrary horizontal and diagonal segments', () => {
      const store = useQuadrilateralStore.getState();

      // Create two independent segments
      const p1 = store.addPoint({ x: 0, y: 0 }, 'P1');
      const p2 = store.addPoint({ x: 4, y: 0 }, 'P2');
      const seg1 = store.addSegment(p1, p2); // Horizontal reference segment

      const p3 = store.addPoint({ x: 1, y: 2 }, 'P3');
      const p4 = store.addPoint({ x: 3, y: 5 }, 'P4');
      const seg2 = store.addSegment(p3, p4); // Diagonal segment

      // Initial state is not parallel
      let s = useQuadrilateralStore.getState();
      const initCheck = checkParallelism(s.points[p1], s.points[p2], s.points[p3], s.points[p4]);
      expect(initCheck.isParallel).toBe(false);

      // Apply parallel constraint
      const constraintId = store.addParallelSegmentsConstraint(seg1, seg2);
      expect(constraintId).toBeDefined();

      s = useQuadrilateralStore.getState();
      expect(s.constraints[constraintId]).toBeDefined();
      expect(s.constraints[constraintId].type).toBe('parallel_segments');

      // Seg2 should now be parallel to Seg1
      const afterCheck = checkParallelism(s.points[p1], s.points[p2], s.points[p3], s.points[p4]);
      expect(afterCheck.isParallel).toBe(true);
      expect(afterCheck.angleDiffDegrees).toBeLessThan(0.01);
      // P3 stays at y=2, P4 y should now be equal to P3 y (since Seg1 is horizontal)
      expect(s.points[p4].y).toBeCloseTo(s.points[p3].y, 3);
    });

    it('handles vertical segments without division-by-zero or slope errors', () => {
      const store = useQuadrilateralStore.getState();

      // Vertical reference segment
      const v1 = store.addPoint({ x: 2, y: 0 }, 'V1');
      const v2 = store.addPoint({ x: 2, y: 5 }, 'V2');
      const segV1 = store.addSegment(v1, v2);

      // Slanted second segment
      const v3 = store.addPoint({ x: -1, y: 1 }, 'V3');
      const v4 = store.addPoint({ x: 2, y: 4 }, 'V4');
      const segV2 = store.addSegment(v3, v4);

      store.addParallelSegmentsConstraint(segV1, segV2);

      const s = useQuadrilateralStore.getState();
      const check = checkParallelism(s.points[v1], s.points[v2], s.points[v3], s.points[v4]);
      expect(check.isParallel).toBe(true);
      expect(check.angleDiffDegrees).toBeLessThan(0.01);
      // V4 x should equal V3 x (vertical segment)
      expect(s.points[v4].x).toBeCloseTo(s.points[v3].x, 3);
    });

    it('maintains parallelism dynamically when permitted points are dragged', () => {
      const store = useQuadrilateralStore.getState();

      const a1 = store.addPoint({ x: 0, y: 0 }, 'A1');
      const a2 = store.addPoint({ x: 3, y: 3 }, 'A2'); // 45° segment
      const segA = store.addSegment(a1, a2);

      const b1 = store.addPoint({ x: 0, y: 2 }, 'B1');
      const b2 = store.addPoint({ x: 2, y: 5 }, 'B2');
      const segB = store.addSegment(b1, b2);

      store.addParallelSegmentsConstraint(segA, segB);

      // Drag reference endpoint A2 to (0, 4) - making it vertical
      store.movePoint(a2, { x: 0, y: 4 });

      let s = useQuadrilateralStore.getState();
      let chk = checkParallelism(s.points[a1], s.points[a2], s.points[b1], s.points[b2]);
      expect(chk.isParallel).toBe(true);

      // Drag target endpoint B1 to (2, 2)
      store.movePoint(b1, { x: 2, y: 2 });
      s = useQuadrilateralStore.getState();
      chk = checkParallelism(s.points[a1], s.points[a2], s.points[b1], s.points[b2]);
      expect(chk.isParallel).toBe(true);
    });

    it('allows constraint removal, freeing geometry to move arbitrarily', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 0, y: 0 }, 'PA');
      const pB = store.addPoint({ x: 4, y: 0 }, 'PB');
      const seg1 = store.addSegment(pA, pB);

      const pC = store.addPoint({ x: 0, y: 2 }, 'PC');
      const pD = store.addPoint({ x: 4, y: 1 }, 'PD');
      const seg2 = store.addSegment(pC, pD);

      const cId = store.addParallelSegmentsConstraint(seg1, seg2);
      expect(useQuadrilateralStore.getState().constraints[cId]).toBeDefined();

      // Remove constraint
      store.deleteConstraint(cId);
      expect(useQuadrilateralStore.getState().constraints[cId]).toBeUndefined();

      // Now move pD to an arbitrary non-parallel location
      store.movePoint(pD, { x: 1, y: 5 });
      const s = useQuadrilateralStore.getState();
      expect(s.points[pD].x).toBe(1);
      expect(s.points[pD].y).toBe(5);

      const chk = checkParallelism(s.points[pA], s.points[pB], s.points[pC], s.points[pD]);
      expect(chk.isParallel).toBe(false);
    });

    it('supports undo and redo for parallel constraints', () => {
      const store = useQuadrilateralStore.getState();

      const p1 = store.addPoint({ x: 0, y: 0 }, 'U1');
      const p2 = store.addPoint({ x: 5, y: 0 }, 'U2');
      const seg1 = store.addSegment(p1, p2);

      const p3 = store.addPoint({ x: 0, y: 3 }, 'U3');
      const p4 = store.addPoint({ x: 4, y: 7 }, 'U4');
      const seg2 = store.addSegment(p3, p4);

      const cId = store.addParallelSegmentsConstraint(seg1, seg2);
      expect(useQuadrilateralStore.getState().constraints[cId]).toBeDefined();

      // Undo constraint creation
      store.undo();
      expect(useQuadrilateralStore.getState().constraints[cId]).toBeUndefined();

      // Redo constraint creation
      store.redo();
      expect(useQuadrilateralStore.getState().constraints[cId]).toBeDefined();
    });
  });

  // ==========================================================================
  // 2. Angle Measure Tool (A) Tests
  // ==========================================================================
  describe('Angle Measure Tool (A)', () => {
    it('creates persistent standalone angle measurement from three points', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 3, y: 0 }, 'A');
      const pV = store.addPoint({ x: 0, y: 0 }, 'V'); // Vertex
      const pB = store.addPoint({ x: 0, y: 4 }, 'B');

      const angId = store.addAngleMeasurement(pA, pV, pB);
      const s = useQuadrilateralStore.getState();

      expect(s.angles[angId]).toBeDefined();
      expect(s.angles[angId].point1Id).toBe(pA);
      expect(s.angles[angId].vertexId).toBe(pV);
      expect(s.angles[angId].point2Id).toBe(pB);

      // Verify geometry calculation (90° right angle)
      const geo = computeStandaloneAngleGeometry(
        s.points[pA],
        s.points[pV],
        s.points[pB],
        s.viewport,
        800,
        600,
        false
      );
      expect(geo.degrees).toBeCloseTo(90, 1);
    });

    it('supports switching between minor (0-180°) and reflex (180-360°) angles', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 3, y: 0 }, 'A');
      const pV = store.addPoint({ x: 0, y: 0 }, 'V');
      const pB = store.addPoint({ x: 0, y: 4 }, 'B');

      const angId = store.addAngleMeasurement(pA, pV, pB);
      expect(useQuadrilateralStore.getState().angles[angId].isReflex).toBeFalsy();

      // Toggle to reflex
      store.toggleAngleReflex(angId);
      let s = useQuadrilateralStore.getState();
      expect(s.angles[angId].isReflex).toBe(true);

      const reflexGeo = computeStandaloneAngleGeometry(
        s.points[pA],
        s.points[pV],
        s.points[pB],
        s.viewport,
        800,
        600,
        true
      );
      // Reflex angle of 90° should be 270°
      expect(reflexGeo.degrees).toBeCloseTo(270, 1);

      // Toggle back to minor
      store.toggleAngleReflex(angId);
      s = useQuadrilateralStore.getState();
      expect(s.angles[angId].isReflex).toBe(false);
    });

    it('updates angle degree dynamically when vertex or arms move', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 3, y: 0 }, 'A');
      const pV = store.addPoint({ x: 0, y: 0 }, 'V');
      const pB = store.addPoint({ x: 0, y: 4 }, 'B');

      store.addAngleMeasurement(pA, pV, pB);

      // Move B to (3, 3) -> angle ∠AVB between (3,0) and (3,3) is 45°
      store.movePoint(pB, { x: 3, y: 3 });

      const s = useQuadrilateralStore.getState();
      const geo = computeStandaloneAngleGeometry(
        s.points[pA],
        s.points[pV],
        s.points[pB],
        s.viewport,
        800,
        600
      );
      expect(geo.degrees).toBeCloseTo(45, 1);
    });
  });

  // ==========================================================================
  // 3. Distance Measure Tool (K) Tests
  // ==========================================================================
  describe('Distance Measure Tool (K)', () => {
    it('creates persistent distance measurement between two points', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 0, y: 0 }, 'D1');
      const pB = store.addPoint({ x: 3, y: 4 }, 'D2');

      const distId = store.addDistanceMeasurement(pA, pB);
      const s = useQuadrilateralStore.getState();

      expect(s.distances[distId]).toBeDefined();
      expect(s.distances[distId].pointAId).toBe(pA);
      expect(s.distances[distId].pointBId).toBe(pB);

      const dVal = distanceBetween(s.points[pA], s.points[pB]);
      expect(dVal).toBeCloseTo(5, 2); // 3-4-5 right triangle
    });

    it('updates distance dynamically when points are dragged', () => {
      const store = useQuadrilateralStore.getState();

      const pA = store.addPoint({ x: 0, y: 0 }, 'P_A');
      const pB = store.addPoint({ x: 3, y: 4 }, 'P_B');
      store.addDistanceMeasurement(pA, pB);

      // Move P_B to (6, 8)
      store.movePoint(pB, { x: 6, y: 8 });

      const s = useQuadrilateralStore.getState();
      const dVal = distanceBetween(s.points[pA], s.points[pB]);
      expect(dVal).toBeCloseTo(10, 2);
    });
  });

  // ==========================================================================
  // 4. Measurement Management & Reset Tests
  // ==========================================================================
  describe('Measurement Management & Reset Actions', () => {
    it('clears only angle measurements, leaving distances and geometry intact', () => {
      const store = useQuadrilateralStore.getState();
      const pts = Object.values(store.points);

      store.addAngleMeasurement(pts[0].id, pts[1].id, pts[2].id);
      store.addDistanceMeasurement(pts[0].id, pts[2].id);

      expect(Object.keys(useQuadrilateralStore.getState().angles).length).toBeGreaterThan(0);
      expect(Object.keys(useQuadrilateralStore.getState().distances).length).toBeGreaterThan(0);
      const quadCount = Object.keys(useQuadrilateralStore.getState().quadrilaterals).length;

      // Clear angles
      store.clearAngleMeasurements();

      const s = useQuadrilateralStore.getState();
      expect(Object.keys(s.angles).length).toBe(0);
      expect(Object.keys(s.distances).length).toBeGreaterThan(0);
      expect(Object.keys(s.quadrilaterals).length).toBe(quadCount);
      expect(Object.keys(s.points).length).toBe(pts.length);
    });

    it('clears only distance measurements, leaving angles and geometry intact', () => {
      const store = useQuadrilateralStore.getState();
      const pts = Object.values(store.points);

      store.addAngleMeasurement(pts[0].id, pts[1].id, pts[2].id);
      store.addDistanceMeasurement(pts[0].id, pts[2].id);

      // Clear distances
      store.clearDistanceMeasurements();

      const s = useQuadrilateralStore.getState();
      expect(Object.keys(s.distances).length).toBe(0);
      expect(Object.keys(s.angles).length).toBeGreaterThan(0);
      expect(Object.keys(s.points).length).toBe(pts.length);
    });

    it('clears all manual measurements without deleting underlying geometry or polygon invariants', () => {
      const store = useQuadrilateralStore.getState();
      const pts = Object.values(store.points);

      store.addAngleMeasurement(pts[0].id, pts[1].id, pts[2].id);
      store.addDistanceMeasurement(pts[0].id, pts[2].id);

      store.clearAllMeasurements();

      const s = useQuadrilateralStore.getState();
      expect(Object.keys(s.angles).length).toBe(0);
      expect(Object.keys(s.distances).length).toBe(0);
      expect(Object.keys(s.quadrilaterals).length).toBeGreaterThan(0);
      expect(Object.keys(s.points).length).toBe(pts.length);
    });

    it('preserves automatic polygon interior angles when manual measurements are cleared', () => {
      const store = useQuadrilateralStore.getState();
      const q = Object.values(store.quadrilaterals)[0];
      expect(q.showAngles).toBe(true);

      store.clearAllMeasurements();

      const s = useQuadrilateralStore.getState();
      const updatedQ = s.quadrilaterals[q.id];
      expect(updatedQ.showAngles).toBe(true);
    });

    it('toggles polygon interior angle badge visibility independently', () => {
      const store = useQuadrilateralStore.getState();
      const q = Object.values(store.quadrilaterals)[0];

      // Toggle off
      store.toggleQuadAnglesVisibility(q.id);
      expect(useQuadrilateralStore.getState().quadrilaterals[q.id].showAngles).toBe(false);

      // Toggle on
      store.toggleQuadAnglesVisibility(q.id);
      expect(useQuadrilateralStore.getState().quadrilaterals[q.id].showAngles).toBe(true);
    });
  });

  // ==========================================================================
  // 5. Tool Switching, Hit Testing & Cancellation Safety
  // ==========================================================================
  describe('Tool Switching & Interaction Safety', () => {
    it('switching tools resets pending construction steps to idle', () => {
      const store = useQuadrilateralStore.getState();

      store.setActiveTool('angle_measure');
      store.setConstructionStep({ type: 'measuring_angle', points: ['pA'] });
      expect(useQuadrilateralStore.getState().constructionStep.type).toBe('measuring_angle');

      // Switch to distance measure
      store.setActiveTool('distance_measure');
      expect(useQuadrilateralStore.getState().constructionStep.type).toBe('idle');
    });

    it('correctly calculates screen hit-test tolerances for points and segments', () => {
      // Point hit test
      const screenPt = { x: 100, y: 100 };
      expect(pointHitsScreenPoint(105, 102, screenPt, 10)).toBe(true);
      expect(pointHitsScreenPoint(120, 100, screenPt, 10)).toBe(false);

      // Segment hit test
      const distOnSeg = distanceToScreenSegment(50, 52, 0, 50, 100, 50);
      expect(distOnSeg).toBeCloseTo(2, 1);

      const distFar = distanceToScreenSegment(50, 80, 0, 50, 100, 50);
      expect(distFar).toBeCloseTo(30, 1);
    });
  });
});
