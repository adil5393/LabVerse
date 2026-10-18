/**
 * Automated Test Suite for Class 9 Quadrilaterals - M3.1 Hotfix
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Verifies:
 * - True interior angles for convex and concave quadrilaterals
 * - 360° angle sum invariance across simple convex and concave configurations
 * - Exactly one reflex angle (> 180°) in concave quadrilaterals
 * - Signed-turn and winding consistency (both CW and CCW vertex orderings)
 * - Near-collinear numerical stability
 * - Arc sweep calculation for convex and reflex vertices
 * - Interior bisector angles and stable label placement (no branch-cut flipping)
 * - Dynamic vertex transitions from convex to concave under dragging
 * - Crossed and degenerate non-simple state classification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyQuadrilateral,
  computePolygonVertexAngles,
  computeStandaloneAngleGeometry,
  isPolygonCCW,
} from '../geometry';
import { useQuadrilateralStore } from '../../../../store/useQuadrilateralStore';
import type { WorldPoint, QuadViewportTransform } from '../types';

const defaultViewport: QuadViewportTransform = {
  zoom: 40,
  panX: 0,
  panY: 0,
};

describe('M3.1 Hotfix: Quadrilateral Interior Angles & Concave Geometry', () => {
  describe('1. Geometry & Angle Sum Invariants', () => {
    it('verifies convex quadrilateral interior angles sum to 360°', () => {
      // General convex quadrilateral
      const a: WorldPoint = { x: -3, y: -2 };
      const b: WorldPoint = { x: 3, y: -2 };
      const c: WorldPoint = { x: 2, y: 3 };
      const d: WorldPoint = { x: -2, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isConvex).toBe(true);
      expect(analysis.isSimple).toBe(true);
      expect(analysis.reflexVertexIndex).toBeNull();
      expect(analysis.isReflex).toEqual([false, false, false, false]);
      expect(analysis.angleSum).toBeCloseTo(360.0, 2);

      // Every angle in a convex quadrilateral must be < 180°
      analysis.interiorAngles.forEach((ang) => {
        expect(ang).toBeGreaterThan(0);
        expect(ang).toBeLessThan(180);
      });
    });

    it('verifies concave quadrilateral interior angles sum to 360° with exactly one reflex angle', () => {
      // Dart/Arrowhead shape where vertex D is indented
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 0, y: 4 };
      const c: WorldPoint = { x: 4, y: -2 };
      const d: WorldPoint = { x: 0, y: 0 }; // Indented vertex (D)

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isConvex).toBe(false);
      expect(analysis.isSimple).toBe(true);
      expect(analysis.kind).toBe('concave');
      expect(analysis.angleSum).toBeCloseTo(360.0, 2);

      // Exactly one reflex vertex (D, index 3)
      expect(analysis.reflexVertexIndex).toBe(3);
      expect(analysis.isReflex[3]).toBe(true);
      expect(analysis.interiorAngles[3]).toBeGreaterThan(180);
      expect(analysis.interiorAngles[3]).toBeLessThan(360);

      // Non-reflex vertices must be strictly < 180°
      expect(analysis.interiorAngles[0]).toBeLessThan(180);
      expect(analysis.interiorAngles[1]).toBeLessThan(180);
      expect(analysis.interiorAngles[2]).toBeLessThan(180);
    });

    it('verifies another concave configuration with vertex C indented', () => {
      // Concave quad with C indented
      const a: WorldPoint = { x: 0, y: 0 };
      const b: WorldPoint = { x: 4, y: 0 };
      const c: WorldPoint = { x: 1.5, y: 1.5 }; // Indented vertex C
      const d: WorldPoint = { x: 0, y: 4 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isConvex).toBe(false);
      expect(analysis.kind).toBe('concave');
      expect(analysis.reflexVertexIndex).toBe(2); // C is reflex
      expect(analysis.isReflex).toEqual([false, false, true, false]);
      expect(analysis.interiorAngles[2]).toBeGreaterThan(180);
      expect(analysis.angleSum).toBeCloseTo(360.0, 2);
    });

    it('preserves signed-turn consistency under clockwise vs counter-clockwise vertex order', () => {
      // Counter-Clockwise order
      const ccwA: WorldPoint = { x: 0, y: 0 };
      const ccwB: WorldPoint = { x: 4, y: 0 };
      const ccwC: WorldPoint = { x: 4, y: 3 };
      const ccwD: WorldPoint = { x: 0, y: 3 };
      expect(isPolygonCCW([ccwA, ccwB, ccwC, ccwD])).toBe(true);

      const ccwAnalysis = classifyQuadrilateral(ccwA, ccwB, ccwC, ccwD);
      expect(ccwAnalysis.interiorAngles[0]).toBeCloseTo(90, 1);
      expect(ccwAnalysis.interiorAngles[1]).toBeCloseTo(90, 1);
      expect(ccwAnalysis.interiorAngles[2]).toBeCloseTo(90, 1);
      expect(ccwAnalysis.interiorAngles[3]).toBeCloseTo(90, 1);
      expect(ccwAnalysis.angleSum).toBeCloseTo(360, 1);

      // Clockwise order (reversed)
      const cwA = ccwA;
      const cwB = ccwD;
      const cwC = ccwC;
      const cwD = ccwB;
      expect(isPolygonCCW([cwA, cwB, cwC, cwD])).toBe(false);

      const cwAnalysis = classifyQuadrilateral(cwA, cwB, cwC, cwD);
      expect(cwAnalysis.interiorAngles[0]).toBeCloseTo(90, 1);
      expect(cwAnalysis.interiorAngles[1]).toBeCloseTo(90, 1);
      expect(cwAnalysis.interiorAngles[2]).toBeCloseTo(90, 1);
      expect(cwAnalysis.interiorAngles[3]).toBeCloseTo(90, 1);
      expect(cwAnalysis.angleSum).toBeCloseTo(360, 1);
    });

    it('remains numerically robust near collinear transitions', () => {
      // Vertex D is nearly collinear with A and C (angle ~ 179.9°)
      const a: WorldPoint = { x: -4, y: 0 };
      const b: WorldPoint = { x: 0, y: -3 };
      const c: WorldPoint = { x: 4, y: 0 };
      const dNearlyCollinearConvex: WorldPoint = { x: 0, y: 0.08 }; // Very slightly convex

      const analysisConvex = classifyQuadrilateral(a, b, c, dNearlyCollinearConvex);
      expect(analysisConvex.isSimple).toBe(true);
      expect(analysisConvex.angleSum).toBeCloseTo(360, 1);

      // Nudged slightly past straight line into concave (reflex)
      const dNearlyCollinearConcave: WorldPoint = { x: 0, y: -0.08 }; // Very slightly concave
      const analysisConcave = classifyQuadrilateral(a, b, c, dNearlyCollinearConcave);
      expect(analysisConcave.isSimple).toBe(true);
      expect(analysisConcave.isConvex).toBe(false);
      expect(analysisConcave.reflexVertexIndex).toBe(3);
      expect(analysisConcave.interiorAngles[3]).toBeGreaterThan(180);
      expect(analysisConcave.angleSum).toBeCloseTo(360, 1);
    });

    it('correctly classifies crossed and degenerate states without misleading angle sums', () => {
      // Crossed quad (bowtie)
      const a: WorldPoint = { x: -2, y: 2 };
      const b: WorldPoint = { x: 2, y: -2 };
      const c: WorldPoint = { x: 2, y: 2 };
      const d: WorldPoint = { x: -2, y: -2 };

      const crossedAnalysis = classifyQuadrilateral(a, b, c, d);
      expect(crossedAnalysis.isCrossed).toBe(true);
      expect(crossedAnalysis.isSimple).toBe(false);
      expect(crossedAnalysis.kind).toBe('crossed');
      expect(crossedAnalysis.angleSum).toBe(0); // Undefined for non-simple

      // Degenerate quad (3 collinear vertices)
      const degA: WorldPoint = { x: -2, y: 0 };
      const degB: WorldPoint = { x: 0, y: 0 };
      const degC: WorldPoint = { x: 2, y: 0 };
      const degD: WorldPoint = { x: 0, y: 3 };

      const degAnalysis = classifyQuadrilateral(degA, degB, degC, degD);
      expect(degAnalysis.isDegenerate).toBe(true);
      expect(degAnalysis.isSimple).toBe(false);
      expect(degAnalysis.kind).toBe('degenerate');
      expect(degAnalysis.angleSum).toBe(0);
    });
  });

  describe('2. Rendering Helpers & Stable Label Placement', () => {
    it('computes arc sweeps and interior bisectors for convex vertices', () => {
      const a: WorldPoint = { x: 0, y: 0 };
      const b: WorldPoint = { x: 4, y: 0 };
      const c: WorldPoint = { x: 4, y: 4 };
      const d: WorldPoint = { x: 0, y: 4 };

      const vertexAngles = computePolygonVertexAngles([a, b, c, d], defaultViewport, 800, 600);
      expect(vertexAngles).toHaveLength(4);

      vertexAngles.forEach((vAng) => {
        expect(vAng.interiorDegrees).toBeCloseTo(90, 1);
        expect(vAng.isReflex).toBe(false);
        expect(vAng.arcSweep).toBeCloseTo(Math.PI / 2, 2);

        // Bisector angle must be the midpoint of arcStart and arcStart + arcSweep
        const expectedBisector = vAng.arcStartAngle + vAng.arcSweep / 2;
        expect(vAng.bisectorScreenAngle).toBeCloseTo(expectedBisector, 4);

        // Badge must be offset along interior bisector (normalized modulo 2pi)
        const dx = vAng.badgePosition.x - vAng.screenVertex.x;
        const dy = vAng.badgePosition.y - vAng.screenVertex.y;
        const badgeAngle = Math.atan2(dy, dx);
        let badgeDiff = Math.abs(badgeAngle - vAng.bisectorScreenAngle);
        while (badgeDiff > Math.PI) badgeDiff = Math.abs(badgeDiff - 2 * Math.PI);
        expect(badgeDiff).toBeCloseTo(0, 2);

        // Point label must be on exterior direction (opposite by PI)
        const ptx = vAng.pointLabelPosition.x - vAng.screenVertex.x;
        const pty = vAng.pointLabelPosition.y - vAng.screenVertex.y;
        const ptAngle = Math.atan2(pty, ptx);
        let diff = Math.abs(ptAngle - vAng.bisectorScreenAngle);
        while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
        expect(diff).toBeCloseTo(Math.PI, 2); // 180° apart
      });
    });

    it('computes reflex arc sweep and interior bisector for concave vertex without collapsing', () => {
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 0, y: 4 };
      const c: WorldPoint = { x: 4, y: -2 };
      const d: WorldPoint = { x: 0, y: 0 }; // Indented vertex D (index 3)

      const vertexAngles = computePolygonVertexAngles([a, b, c, d], defaultViewport, 800, 600);
      const reflexAng = vertexAngles[3];

      expect(reflexAng.isReflex).toBe(true);
      expect(reflexAng.interiorDegrees).toBeGreaterThan(180);
      expect(reflexAng.arcSweep).toBeGreaterThan(Math.PI); // Sweeps through reflex angle

      // Total sweep in degrees must equal interiorDegrees
      expect((reflexAng.arcSweep * 180) / Math.PI).toBeCloseTo(reflexAng.interiorDegrees, 2);

      // Reflex bisector must point into the concave interior (towards B(0,4), which is -Y in screen space)
      const dy = reflexAng.badgePosition.y - reflexAng.screenVertex.y;
      expect(dy).toBeLessThan(0); // Points into interior (-Y screen direction, towards top vertex B)

      // Point label must be in exterior notch (+Y screen direction, towards bottom)
      const ptDy = reflexAng.pointLabelPosition.y - reflexAng.screenVertex.y;
      expect(ptDy).toBeGreaterThan(0);
    });

    it('maintains stable label placement under small vertex perturbations without flipping', () => {
      const baseA: WorldPoint = { x: -4, y: -2 };
      const baseB: WorldPoint = { x: 0, y: 4 };
      const baseC: WorldPoint = { x: 4, y: -2 };

      // Sample D along a small trajectory near (0, 0)
      const dPositions: WorldPoint[] = [
        { x: 0.0, y: 0.0 },
        { x: 0.05, y: 0.02 },
        { x: -0.05, y: -0.02 },
        { x: 0.02, y: -0.05 },
      ];

      let prevBisectorAngle: number | null = null;

      for (const d of dPositions) {
        const angles = computePolygonVertexAngles([baseA, baseB, baseC, d], defaultViewport, 800, 600);
        const reflexAng = angles[3];

        if (prevBisectorAngle !== null) {
          // Angle change must be tiny, not a 180° jump/flip
          let diff = Math.abs(reflexAng.bisectorScreenAngle - prevBisectorAngle);
          while (diff > Math.PI) diff = Math.abs(diff - 2 * Math.PI);
          expect(diff).toBeLessThan(0.15); // Less than ~8.5°
        }
        prevBisectorAngle = reflexAng.bisectorScreenAngle;
      }
    });

    it('computes standalone ray angle measurements without branch-cut discontinuity', () => {
      const vertex: WorldPoint = { x: 0, y: 0 };
      // Two rays that cross the negative X-axis: ray1 at 170°, ray2 at -170° (20° apart)
      const p1: WorldPoint = { x: Math.cos((170 * Math.PI) / 180), y: Math.sin((170 * Math.PI) / 180) };
      const p2: WorldPoint = { x: Math.cos((-170 * Math.PI) / 180), y: Math.sin((-170 * Math.PI) / 180) };

      const standGeo = computeStandaloneAngleGeometry(p1, vertex, p2, defaultViewport, 800, 600);
      expect(standGeo.degrees).toBeCloseTo(20, 1); // Minor angle is 20°, NOT 340°
      expect(standGeo.arcSweep).toBeCloseTo((20 * Math.PI) / 180, 2);

      // Badge must be near the negative X-axis (around 180°), NOT at 0°!
      const dx = standGeo.badgePosition.x - 400; // screen origin
      expect(dx).toBeLessThan(0); // Must be on the left (negative X) side
    });
  });

  describe('3. Dynamic Interaction & Store State', () => {
    beforeEach(() => {
      useQuadrilateralStore.getState().clearCanvas();
    });

    it('updates angle classification and reflex badge when dragging vertex from convex to concave', () => {
      const store = useQuadrilateralStore.getState();

      // Create a convex quadrilateral ABCD (kite)
      const pAId = store.addPoint({ x: -4, y: -2 }, 'A');
      const pBId = store.addPoint({ x: 0, y: 4 }, 'B');
      const pCId = store.addPoint({ x: 4, y: -2 }, 'C');
      const pDId = store.addPoint({ x: 0, y: -4 }, 'D'); // Convex (below baseline AC at y = -2)
      store.addQuadrilateral(pAId, pBId, pCId, pDId);

      let currentPts = useQuadrilateralStore.getState().points;
      let analysis = classifyQuadrilateral(
        currentPts[pAId],
        currentPts[pBId],
        currentPts[pCId],
        currentPts[pDId]
      );
      expect(analysis.isConvex).toBe(true);

      // Drag vertex D upward to (0, 1), pushing it into the interior of triangle ABC
      store.movePoint(pDId, { x: 0, y: 1 });

      currentPts = useQuadrilateralStore.getState().points;
      analysis = classifyQuadrilateral(
        currentPts[pAId],
        currentPts[pBId],
        currentPts[pCId],
        currentPts[pDId]
      );

      // Now D is reflex, and quadrilateral is concave
      expect(analysis.isConvex).toBe(false);
      expect(analysis.kind).toBe('concave');
      expect(analysis.reflexVertexIndex).toBe(3);
      expect(analysis.interiorAngles[3]).toBeGreaterThan(180);
      expect(analysis.angleSum).toBeCloseTo(360, 1);

      // Verify captured observation records reflex angle accurately
      store.captureCurrentObservation();
      const lastObs = useQuadrilateralStore.getState().capturedObservations.slice(-1)[0];
      expect(lastObs.currentValue).toContain('Reflex at D');
      expect(lastObs.isConsistent).toBe(true);
    });
  });
});
