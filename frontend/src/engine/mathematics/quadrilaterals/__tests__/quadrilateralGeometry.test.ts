/**
 * Automated Geometry Tests for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 */

import { describe, it, expect } from 'vitest';
import {
  distanceBetween,
  calculateAngleDegrees,
  calculateMidpoint,
  calculateCentroid,
  lineIntersection,
  segmentsIntersect,
  classifyQuadrilateral,
  computeVarignonParallelogram,
  computeTriangleMedians,
  generateQuadrilateralTiling,
  areVectorsParallel,
  areVectorsPerpendicular,
  solveQuadConstraints,
} from '../geometry';
import type { WorldPoint, QuadPoint, QuadConstraint } from '../types';

describe('Quadrilateral Geometry Engine', () => {
  // ==========================================================================
  // 1. Basic Vector & Distance Metrics
  // ==========================================================================
  describe('Vector & Distance Metrics', () => {
    it('calculates Euclidean distance correctly', () => {
      const p1: WorldPoint = { x: 0, y: 0 };
      const p2: WorldPoint = { x: 3, y: 4 };
      expect(distanceBetween(p1, p2)).toBeCloseTo(5.0, 5);
    });

    it('identifies parallel vectors with opposite directions', () => {
      const v1 = { x: 4, y: 0 };
      const v2 = { x: -6, y: 0 };
      expect(areVectorsParallel(v1, v2)).toBe(true);
    });

    it('identifies perpendicular vectors', () => {
      const v1 = { x: 3, y: 0 };
      const v2 = { x: 0, y: 5 };
      expect(areVectorsPerpendicular(v1, v2)).toBe(true);
    });

    it('computes segment midpoints accurately', () => {
      const p1: WorldPoint = { x: -2, y: 4 };
      const p2: WorldPoint = { x: 6, y: -2 };
      const mid = calculateMidpoint(p1, p2);
      expect(mid.x).toBe(2);
      expect(mid.y).toBe(1);
    });

    it('calculates angles, centroids, and intersections accurately', () => {
      const p1: WorldPoint = { x: 3, y: 0 };
      const v: WorldPoint = { x: 0, y: 0 };
      const p2: WorldPoint = { x: 0, y: 4 };
      expect(calculateAngleDegrees(p1, v, p2)).toBeCloseTo(90.0, 4);

      const p3: WorldPoint = { x: 3, y: 6 };
      const centroid = calculateCentroid(p1, v, p3);
      expect(centroid.x).toBe(2);
      expect(centroid.y).toBe(2);

      const a: WorldPoint = { x: -2, y: 0 };
      const b: WorldPoint = { x: 2, y: 0 };
      const c: WorldPoint = { x: 0, y: -2 };
      const d: WorldPoint = { x: 0, y: 2 };
      expect(segmentsIntersect(a, b, c, d)).toBe(true);

      const inter = lineIntersection(a, b, c, d);
      expect(inter?.x).toBeCloseTo(0, 4);
      expect(inter?.y).toBeCloseTo(0, 4);
    });
  });

  // ==========================================================================
  // 2. Quadrilateral Classification & Angle Sum
  // ==========================================================================
  describe('Quadrilateral Classification & Angle Sum', () => {
    it('classifies a general convex quadrilateral and verifies 360° angle sum', () => {
      const a: WorldPoint = { x: -3, y: -2 };
      const b: WorldPoint = { x: 3, y: -2 };
      const c: WorldPoint = { x: 2, y: 3 };
      const d: WorldPoint = { x: -2, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isConvex).toBe(true);
      expect(analysis.isSimple).toBe(true);
      expect(analysis.isDegenerate).toBe(false);
      expect(analysis.angleSum).toBeCloseTo(360.0, 1);
    });

    it('detects a concave quadrilateral and verifies the 360° angle sum holds', () => {
      // Dart/Arrowhead shape where vertex D is indented
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 0, y: 4 };
      const c: WorldPoint = { x: 4, y: -2 };
      const d: WorldPoint = { x: 0, y: 0 }; // Indented vertex (reflex angle at D)

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isConvex).toBe(false);
      expect(analysis.kind).toBe('concave');
      expect(analysis.angleSum).toBeCloseTo(360.0, 1);
    });

    it('detects a crossed (self-intersecting) quadrilateral', () => {
      // Bowtie shape: AB and CD cross
      const a: WorldPoint = { x: -2, y: 2 };
      const b: WorldPoint = { x: 2, y: -2 };
      const c: WorldPoint = { x: 2, y: 2 };
      const d: WorldPoint = { x: -2, y: -2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isSimple).toBe(false);
      expect(analysis.kind).toBe('crossed');
    });

    it('detects degenerate quadrilaterals with 3 collinear vertices', () => {
      const a: WorldPoint = { x: -2, y: 0 };
      const b: WorldPoint = { x: 0, y: 0 };
      const c: WorldPoint = { x: 2, y: 0 }; // A, B, C collinear
      const d: WorldPoint = { x: 0, y: 3 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.isDegenerate).toBe(true);
      expect(analysis.kind).toBe('degenerate');
    });
  });

  // ==========================================================================
  // 3. Parallelogram & Special Quadrilateral Invariants
  // ==========================================================================
  describe('Parallelogram & Special Quadrilateral Invariants', () => {
    it('classifies a parallelogram and verifies opposite sides, angles & bisection', () => {
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 2, y: -2 };
      const c: WorldPoint = { x: 4, y: 2 };
      const d: WorldPoint = { x: -2, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.kind).toBe('parallelogram');
      expect(analysis.oppSidesParallel[0]).toBe(true); // AB || CD
      expect(analysis.oppSidesParallel[1]).toBe(true); // BC || DA
      expect(analysis.oppSidesEqual[0]).toBe(true); // AB = CD
      expect(analysis.oppSidesEqual[1]).toBe(true); // BC = DA
      expect(analysis.diagonalsBisect).toBe(true); // Diagonals bisect each other
    });

    it('classifies a rectangle (parallelogram with right angles & equal diagonals)', () => {
      const a: WorldPoint = { x: -3, y: -2 };
      const b: WorldPoint = { x: 3, y: -2 };
      const c: WorldPoint = { x: 3, y: 2 };
      const d: WorldPoint = { x: -3, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.kind).toBe('rectangle');
      expect(analysis.diagonalsEqual).toBe(true); // AC = BD
    });

    it('classifies a rhombus (all sides equal & perpendicular diagonals)', () => {
      const a: WorldPoint = { x: 0, y: -3 };
      const b: WorldPoint = { x: 4, y: 0 };
      const c: WorldPoint = { x: 0, y: 3 };
      const d: WorldPoint = { x: -4, y: 0 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.kind).toBe('rhombus');
      expect(analysis.diagonalsPerpendicular).toBe(true); // AC ⊥ BD
    });

    it('classifies a square (equal sides, 90° angles, equal & perpendicular diagonals)', () => {
      const a: WorldPoint = { x: -2, y: -2 };
      const b: WorldPoint = { x: 2, y: -2 };
      const c: WorldPoint = { x: 2, y: 2 };
      const d: WorldPoint = { x: -2, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.kind).toBe('square');
      expect(analysis.diagonalsEqual).toBe(true);
      expect(analysis.diagonalsPerpendicular).toBe(true);
    });

    it('classifies a trapezium (exactly one pair of opposite sides parallel)', () => {
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 4, y: -2 };
      const c: WorldPoint = { x: 2, y: 2 };
      const d: WorldPoint = { x: -2, y: 2 };

      const analysis = classifyQuadrilateral(a, b, c, d);
      expect(analysis.kind).toBe('trapezium');
      expect(analysis.oppSidesParallel[0]).toBe(true); // AB || CD
      expect(analysis.oppSidesParallel[1]).toBe(false); // BC not || DA
    });
  });

  // ==========================================================================
  // 4. Midpoint Theorem & Medial Triangle
  // ==========================================================================
  describe('The Midpoint Theorem', () => {
    it('verifies that DE is parallel to base BC and exactly half its length', () => {
      const a: WorldPoint = { x: 1, y: 5 };
      const b: WorldPoint = { x: -5, y: -3 };
      const c: WorldPoint = { x: 7, y: -3 };

      const d = calculateMidpoint(a, b);
      const e = calculateMidpoint(a, c);

      const lenBC = distanceBetween(b, c);
      const lenDE = distanceBetween(d, e);

      expect(lenDE).toBeCloseTo(lenBC / 2, 4);

      const vBC = { x: c.x - b.x, y: c.y - b.y };
      const vDE = { x: e.x - d.x, y: e.y - d.y };
      expect(areVectorsParallel(vDE, vBC)).toBe(true);
    });

    it('verifies the Converse of the Midpoint Theorem', () => {
      const a: WorldPoint = { x: 0, y: 6 };
      const b: WorldPoint = { x: -4, y: -2 };
      const c: WorldPoint = { x: 6, y: -2 };

      const d = calculateMidpoint(a, b);
      // Line through D parallel to BC has direction (c.x - b.x, c.y - b.y) = (10, 0)
      // Ray from D: y = d.y = 2.
      // Side AC goes from (0, 6) to (6, -2). Midpoint of AC is (3, 2).
      const midAC = calculateMidpoint(a, c);
      expect(midAC.y).toBe(d.y); // Parallel horizontal line meets AC at exact midpoint
    });
  });

  // ==========================================================================
  // 5. Triangle Medians & Centroid 2:1 Ratio
  // ==========================================================================
  describe('Triangle Medians & Centroid Theorem', () => {
    it('verifies concurrency and exact 2:1 division ratio across all three medians', () => {
      const a: WorldPoint = { x: 0, y: 6 };
      const b: WorldPoint = { x: -6, y: -3 };
      const c: WorldPoint = { x: 6, y: -3 };

      const mediansAnalysis = computeTriangleMedians(a, b, c);
      expect(mediansAnalysis.centroid.x).toBeCloseTo(0, 4);
      expect(mediansAnalysis.centroid.y).toBeCloseTo(0, 4);

      expect(mediansAnalysis.ratioA).toBeCloseTo(2.0, 4);
      expect(mediansAnalysis.ratioB).toBeCloseTo(2.0, 4);
      expect(mediansAnalysis.ratioC).toBeCloseTo(2.0, 4);
    });
  });

  // ==========================================================================
  // 6. Varignon Parallelogram Theorem
  // ==========================================================================
  describe('Varignon Parallelogram Theorem', () => {
    it('proves midpoints of any quadrilateral form a parallelogram with Area = 0.5 × Original', () => {
      const a: WorldPoint = { x: -4, y: -3 };
      const b: WorldPoint = { x: 5, y: -4 };
      const c: WorldPoint = { x: 6, y: 4 };
      const d: WorldPoint = { x: -3, y: 5 };

      const vGeo = computeVarignonParallelogram(a, b, c, d);
      expect(vGeo.isParallelogram).toBe(true);
      expect(vGeo.pqLength).toBeCloseTo(vGeo.rsLength, 4);
      expect(vGeo.qrLength).toBeCloseTo(vGeo.spLength, 4);
      expect(vGeo.ratio).toBeCloseTo(0.5, 3);
    });

    it('verifies Varignon parallelogram of a rectangle is a rhombus', () => {
      const a: WorldPoint = { x: -4, y: -2 };
      const b: WorldPoint = { x: 4, y: -2 };
      const c: WorldPoint = { x: 4, y: 2 };
      const d: WorldPoint = { x: -4, y: 2 };

      const vGeo = computeVarignonParallelogram(a, b, c, d);
      // All four sides equal in rhombus
      expect(vGeo.pqLength).toBeCloseTo(vGeo.qrLength, 4);
      expect(vGeo.qrLength).toBeCloseTo(vGeo.rsLength, 4);
      expect(vGeo.rsLength).toBeCloseTo(vGeo.spLength, 4);
    });
  });

  // ==========================================================================
  // 7. Planar Quadrilateral Tiling
  // ==========================================================================
  describe('Planar Quadrilateral Tiling', () => {
    it('generates periodic tiles with 180° rotations and lattice vectors', () => {
      const a: WorldPoint = { x: -3, y: -2 };
      const b: WorldPoint = { x: 2, y: -2 };
      const c: WorldPoint = { x: 3, y: 2 };
      const d: WorldPoint = { x: -2, y: 2 };

      const tiling = generateQuadrilateralTiling([a, b, c, d], 3, 3);
      expect(tiling.tiles.length).toBeGreaterThan(0);
      expect(tiling.latticeVector1).toBeDefined();
      expect(tiling.latticeVector2).toBeDefined();
      expect(tiling.midpointRotationCenters.length).toBe(4);
    });
  });

  // ==========================================================================
  // 8. Dynamic Constraints Solver
  // ==========================================================================
  describe('Dynamic Constraints Solver', () => {
    it('automatically updates midpoints when parent vertices are moved', () => {
      const pts: Record<string, QuadPoint> = {
        pA: { id: 'pA', name: 'A', x: 0, y: 0, role: 'free' },
        pB: { id: 'pB', name: 'B', x: 6, y: 8, role: 'free' },
        pM: { id: 'pM', name: 'M', x: 0, y: 0, role: 'midpoint', parentEntityIds: ['pA', 'pB'] },
      };

      const solved = solveQuadConstraints(pts, []);
      expect(solved.pM.x).toBe(3);
      expect(solved.pM.y).toBe(4);
    });

    it('enforces parallelogram constraint D = A + (C - B) when C moves', () => {
      const pts: Record<string, QuadPoint> = {
        pA: { id: 'pA', name: 'A', x: 0, y: 0, role: 'free' },
        pB: { id: 'pB', name: 'B', x: 4, y: 0, role: 'free' },
        pC: { id: 'pC', name: 'C', x: 5, y: 3, role: 'free' },
        pD: { id: 'pD', name: 'D', x: 1, y: 3, role: 'derived' },
      };

      const constraint: QuadConstraint = {
        id: 'c1',
        type: 'parallel_opposite',
        targetEntityIds: ['pA', 'pB', 'pC', 'pD'],
        active: true,
        description: 'Parallelogram constraint',
      };

      // Move C to (6, 4)
      pts.pC.x = 6;
      pts.pC.y = 4;
      const solved = solveQuadConstraints(pts, [constraint], 'pC');
      // D should be A + (C - B) = (0,0) + (6-4, 4-0) = (2, 4)
      expect(solved.pD.x).toBe(2);
      expect(solved.pD.y).toBe(4);
    });
  });
});
