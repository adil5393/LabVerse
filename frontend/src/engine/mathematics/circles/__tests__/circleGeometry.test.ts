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
  calculateOppositeDiameterPoint,
  computeConstructionBoundingBox,
  calculateFitViewport,
  pointHitsScreenPoint,
  pointHitsCircleCircumference,
  distanceToScreenSegment,
  validatePracticeAnswer,
  LABEL_TYPOGRAPHY_CONFIGS,
  resolveCirclePointCoords,
  calculateMinorArcSweep,
  rotatePoint,
  reflectPointAcrossLine,
  calculatePerpendicularBisector,
  calculateCircumcircleFromThreePoints,
  calculateChordDistancePythagorean,
  testConcyclicityFourPoints,
  testSameSegmentAngles,
} from '../geometry';
import type { CircleObject, WorldPoint, CircumferencePoint } from '../types';

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

  describe('Milestone M2.1: Diameter Construction & Opposing Endpoint Geometry', () => {
    it('calculates diametrically opposite endpoint B = (2C - A) correctly', () => {
      const circle: CircleObject = {
        id: 'c_test',
        name: 'Circle C',
        center: { x: 3, y: 4 },
        radius: 5,
      };

      // Point A at (6, 8) — distance to center is 5
      const ptA: WorldPoint = { x: 6, y: 8 };
      expect(distanceBetween(circle.center, ptA)).toBeCloseTo(5.0, 3);

      const result = calculateOppositeDiameterPoint(circle, ptA);
      // B = (2*3 - 6, 2*4 - 8) = (0, 0)
      expect(result.oppositePoint.x).toBeCloseTo(0.0, 3);
      expect(result.oppositePoint.y).toBeCloseTo(0.0, 3);

      // Verify B lies on circle
      expect(distanceBetween(circle.center, result.oppositePoint)).toBeCloseTo(5.0, 3);

      // Verify C is exact midpoint of AB
      const midX = (ptA.x + result.oppositePoint.x) / 2;
      const midY = (ptA.y + result.oppositePoint.y) / 2;
      expect(midX).toBeCloseTo(circle.center.x, 3);
      expect(midY).toBeCloseTo(circle.center.y, 3);

      // Verify length AB = 2r = 10
      expect(distanceBetween(ptA, result.oppositePoint)).toBeCloseTo(10.0, 3);
    });

    it('calculates opposite angle as exactly (thetaA + π) mod 2π', () => {
      const circle: CircleObject = {
        id: 'c_test2',
        name: 'Circle C2',
        center: { x: 0, y: 0 },
        radius: 4,
      };

      const angleA = Math.PI / 6; // 30°
      const ptA = getCircumferenceCoords(circle, angleA);
      const res = calculateOppositeDiameterPoint(circle, ptA);

      const expectedOppAngle = angleA + Math.PI; // 210°
      expect(res.oppositeAngleRad).toBeCloseTo(expectedOppAngle, 2);
    });
  });

  describe('Milestone M2.1: Bounding Box and Viewport Fit Calculations', () => {
    it('computes bounding box containing all circles and points', () => {
      const circles: CircleObject[] = [
        { id: 'c1', name: 'C1', center: { x: 0, y: 0 }, radius: 4 },
        { id: 'c2', name: 'C2', center: { x: 6, y: 2 }, radius: 3 },
      ];
      const points: WorldPoint[] = [{ x: -5, y: -6 }];

      const bounds = computeConstructionBoundingBox(circles, points);
      // minX should be min(-4, 3, -5) = -5
      // maxX should be max(4, 9) = 9
      // minY should be min(-4, -1, -6) = -6
      // maxY should be max(4, 5) = 5
      expect(bounds.minX).toBe(-5);
      expect(bounds.maxX).toBe(9);
      expect(bounds.minY).toBe(-6);
      expect(bounds.maxY).toBe(5);
    });

    it('calculates optimal viewport zoom and pan centering geometry in canvas', () => {
      const bounds = { minX: -4, maxX: 4, minY: -4, maxY: 4 };
      const fit = calculateFitViewport(bounds, 1000, 800, 80);

      expect(fit.zoom).toBeGreaterThanOrEqual(40);
      expect(fit.zoom).toBeLessThanOrEqual(100);
      // Center of bounds is (0, 0), so panX and panY should be 0
      expect(fit.panX).toBe(0);
      expect(fit.panY).toBe(0);
    });
  });

  describe('Milestone M2.1: Screen-Space Hit Testing Tolerance', () => {
    it('detects point clicks within screen-space tolerance regardless of exact pixel', () => {
      const ptScreen = { x: 200, y: 150 };
      expect(pointHitsScreenPoint(205, 155, ptScreen.x, ptScreen.y, 18)).toBe(true);
      expect(pointHitsScreenPoint(215, 165, ptScreen.x, ptScreen.y, 18)).toBe(false);
    });

    it('detects circumference clicks with generous tolerance for touch / classroom screens', () => {
      const centerScreen = { x: 300, y: 300 };
      const radiusPx = 100;

      // Click at radius 108 px (distance diff = 8px <= 18px tolerance)
      expect(pointHitsCircleCircumference(408, 300, centerScreen.x, centerScreen.y, radiusPx, 18)).toBe(true);
      // Click at radius 125 px (distance diff = 25px > 18px tolerance)
      expect(pointHitsCircleCircumference(425, 300, centerScreen.x, centerScreen.y, radiusPx, 18)).toBe(false);
    });

    it('calculates screen distance to line segments for chord selection', () => {
      const d = distanceToScreenSegment(100, 105, 50, 100, 200, 100);
      expect(d).toBeCloseTo(5.0, 2);
    });
  });

  describe('Milestone M2.1: Practice Answer Validation', () => {
    it('validates exact matches and normalized answers with units', () => {
      expect(validatePracticeAnswer('8 cm', '8 cm')).toBe(true);
      expect(validatePracticeAnswer('8cm', '8 cm')).toBe(true);
      expect(validatePracticeAnswer('8', '8 cm')).toBe(true);
      expect(validatePracticeAnswer('8.0', '8 cm')).toBe(true);
      expect(validatePracticeAnswer('9 cm', '8 cm')).toBe(false);
    });

    it('supports numerical tolerance for calculations', () => {
      expect(validatePracticeAnswer('7.07', 7.071, 0.05)).toBe(true);
      expect(validatePracticeAnswer('7.5', 7.071, 0.05)).toBe(false);
    });
  });

  describe('Milestone M2.1: Shared Typography System Tokens', () => {
    it('provides Small, Normal, and Large typography presets conforming to guidelines', () => {
      expect(LABEL_TYPOGRAPHY_CONFIGS.small.pointLabelSize).toBe(14);
      expect(LABEL_TYPOGRAPHY_CONFIGS.normal.pointLabelSize).toBe(17);
      expect(LABEL_TYPOGRAPHY_CONFIGS.large.pointLabelSize).toBe(20);

      expect(LABEL_TYPOGRAPHY_CONFIGS.normal.measurementSize).toBe(15);
      expect(LABEL_TYPOGRAPHY_CONFIGS.normal.secondaryCoordSize).toBe(13);
      expect(LABEL_TYPOGRAPHY_CONFIGS.normal.haloWidth).toBe(4);
    });
  });

  describe('Milestone M2.2 Hotfix: Angle Sweep & Point Resolution', () => {
    it('resolves both circumference points and circle centers transparently', () => {
      const circles: Record<string, CircleObject> = {
        c1: { id: 'c1', name: 'Circle O', center: { x: 2, y: 3 }, radius: 4 },
      };
      const circumferencePoints: Record<string, CircumferencePoint> = {
        pA: { id: 'pA', name: 'A', circleId: 'c1', angleRad: 0 },
      };

      // Resolve circumference point
      const resA = resolveCirclePointCoords('pA', circles, circumferencePoints);
      expect(resA).toBeDefined();
      expect(resA?.name).toBe('A');
      expect(resA?.coords.x).toBeCloseTo(6, 3);
      expect(resA?.coords.y).toBeCloseTo(3, 3);
      expect(resA?.isCenter).toBe(false);

      // Resolve center point
      const resCenter = resolveCirclePointCoords('center_c1', circles, circumferencePoints);
      expect(resCenter).toBeDefined();
      expect(resCenter?.name).toBe('Circle O');
      expect(resCenter?.coords.x).toBe(2);
      expect(resCenter?.coords.y).toBe(3);
      expect(resCenter?.isCenter).toBe(true);
    });

    it('calculates minor arc sweep ensuring sweep is always <= 180°', () => {
      const vertex = { x: 100, y: 100 };
      const p1 = { x: 200, y: 100 }; // 0 rad
      const p2 = { x: 100, y: 200 }; // π/2 rad

      const sweep = calculateMinorArcSweep(vertex, p1, p2);
      expect(sweep.anticlockwise).toBe(false);
      expect(sweep.startAngle).toBeCloseTo(0, 3);
      expect(sweep.endAngle).toBeCloseTo(Math.PI / 2, 3);
      expect(sweep.bisectorAngle).toBeCloseTo(Math.PI / 4, 3);

      // When points are in reverse order
      const sweepRev = calculateMinorArcSweep(vertex, p2, p1);
      expect(sweepRev.anticlockwise).toBe(true);
      expect(sweepRev.bisectorAngle).toBeCloseTo(Math.PI / 4, 3);
    });
  });

  describe('Milestone M2.3: Symmetry Transformations & Invariants', () => {
    const center: WorldPoint = { x: 0, y: 0 };

    it('rotates a point around center preserving distance from origin', () => {
      const p: WorldPoint = { x: 4, y: 0 };
      // 90° rotation counterclockwise
      const pRot90 = rotatePoint(p, center, Math.PI / 2);
      expect(pRot90.x).toBeCloseTo(0, 3);
      expect(pRot90.y).toBeCloseTo(4, 3);
      expect(distanceBetween(center, pRot90)).toBeCloseTo(4, 3);

      // 180° rotation
      const pRot180 = rotatePoint(p, center, Math.PI);
      expect(pRot180.x).toBeCloseTo(-4, 3);
      expect(pRot180.y).toBeCloseTo(0, 3);
      expect(distanceBetween(center, pRot180)).toBeCloseTo(4, 3);
    });

    it('preserves chord lengths under rotation (isometry)', () => {
      const pA: WorldPoint = { x: 4, y: 0 };
      const pB: WorldPoint = { x: 0, y: 4 };
      const origChordLen = distanceBetween(pA, pB);

      const rotA = rotatePoint(pA, center, 0.732);
      const rotB = rotatePoint(pB, center, 0.732);
      const rotChordLen = distanceBetween(rotA, rotB);

      expect(rotChordLen).toBeCloseTo(origChordLen, 4);
    });

    it('reflects a point across a diameter axis preserving distance', () => {
      const p: WorldPoint = { x: 3, y: 4 }; // Distance = 5
      // Reflect across horizontal axis (angle 0)
      const pReflX = reflectPointAcrossLine(p, center, 0);
      expect(pReflX.x).toBeCloseTo(3, 3);
      expect(pReflX.y).toBeCloseTo(-4, 3);
      expect(distanceBetween(center, pReflX)).toBeCloseTo(5, 3);

      // Reflect across diagonal y = x (angle π/4)
      const pReflDiag = reflectPointAcrossLine(p, center, Math.PI / 4);
      expect(pReflDiag.x).toBeCloseTo(4, 3);
      expect(pReflDiag.y).toBeCloseTo(3, 3);
      expect(distanceBetween(center, pReflDiag)).toBeCloseTo(5, 3);
    });
  });

  describe('Milestone M2.3: Perpendicular Bisector & Circumcircle Construction', () => {
    it('calculates the perpendicular bisector of a segment', () => {
      const p1: WorldPoint = { x: 0, y: 0 };
      const p2: WorldPoint = { x: 6, y: 0 };
      const bisector = calculatePerpendicularBisector(p1, p2);

      expect(bisector.midpoint.x).toBeCloseTo(3, 3);
      expect(bisector.midpoint.y).toBeCloseTo(0, 3);
      expect(bisector.normalDirection.x).toBeCloseTo(0, 3);
      expect(Math.abs(bisector.normalDirection.y)).toBeCloseTo(1, 3);
    });

    it('constructs circumcircle for right-angled triangle with circumcenter on hypotenuse', () => {
      // Right triangle at (0,0) with vertices (0,0), (6,0), (0,8)
      // Hypotenuse is from (6,0) to (0,8), midpoint is (3,4)
      const pA: WorldPoint = { x: 0, y: 0 };
      const pB: WorldPoint = { x: 6, y: 0 };
      const pC: WorldPoint = { x: 0, y: 8 };

      const circum = calculateCircumcircleFromThreePoints(pA, pB, pC);
      expect(circum.isCollinear).toBe(false);
      expect(circum.circumcenter?.x).toBeCloseTo(3, 3);
      expect(circum.circumcenter?.y).toBeCloseTo(4, 3);
      expect(circum.radius).toBeCloseTo(5, 3);
      expect(circum.triangleType).toBe('right');
      expect(circum.oa).toBeCloseTo(5, 3);
      expect(circum.ob).toBeCloseTo(5, 3);
      expect(circum.oc).toBeCloseTo(5, 3);
    });

    it('constructs circumcircle for acute triangle with circumcenter inside', () => {
      // Equilateral-like acute triangle
      const pA: WorldPoint = { x: -3, y: 0 };
      const pB: WorldPoint = { x: 3, y: 0 };
      const pC: WorldPoint = { x: 0, y: 5 };

      const circum = calculateCircumcircleFromThreePoints(pA, pB, pC);
      expect(circum.isCollinear).toBe(false);
      expect(circum.circumcenter?.x).toBeCloseTo(0, 3);
      expect(circum.oa).toBeCloseTo(circum.ob, 3);
      expect(circum.ob).toBeCloseTo(circum.oc, 3);
      expect(circum.triangleType).toBe('acute');
    });

    it('constructs circumcircle for obtuse triangle with circumcenter outside', () => {
      // Very flat triangle: (0,0), (6,0), (3, 0.5)
      const pA: WorldPoint = { x: 0, y: 0 };
      const pB: WorldPoint = { x: 6, y: 0 };
      const pC: WorldPoint = { x: 3, y: 0.5 };

      const circum = calculateCircumcircleFromThreePoints(pA, pB, pC);
      expect(circum.isCollinear).toBe(false);
      expect(circum.triangleType).toBe('obtuse');
    });

    it('strictly rejects collinear points and does not fabricate a circumcenter', () => {
      const p1: WorldPoint = { x: 1, y: 1 };
      const p2: WorldPoint = { x: 2, y: 2 };
      const p3: WorldPoint = { x: 5, y: 5 };

      const circum = calculateCircumcircleFromThreePoints(p1, p2, p3);
      expect(circum.isCollinear).toBe(true);
      expect(circum.circumcenter).toBeNull();
      expect(circum.radius).toBeNull();
      expect(circum.triangleType).toBe('collinear');
    });
  });

  describe('Milestone M2.3: Chord Distance & Pythagorean Invariants', () => {
    it('calculates chord distance verifying longer chord is nearer to center', () => {
      const radius = 5.0;
      const chordLong = 8.0;
      const chordShort = 6.0;

      const resLong = calculateChordDistancePythagorean(radius, chordLong);
      const resShort = calculateChordDistancePythagorean(radius, chordShort);

      expect(resLong.isValid).toBe(true);
      expect(resShort.isValid).toBe(true);
      expect(resLong.distance).toBeCloseTo(3.0, 3); // sqrt(25 - 16) = 3
      expect(resShort.distance).toBeCloseTo(4.0, 3); // sqrt(25 - 9) = 4
      expect(resLong.distance).toBeLessThan(resShort.distance);
    });

    it('evaluates diameter as chord with zero distance from center', () => {
      const resDiameter = calculateChordDistancePythagorean(5.0, 10.0);
      expect(resDiameter.isValid).toBe(true);
      expect(resDiameter.distance).toBeCloseTo(0.0, 3);
    });

    it('rejects chords longer than diameter (2r)', () => {
      const resInvalid = calculateChordDistancePythagorean(5.0, 11.0);
      expect(resInvalid.isValid).toBe(false);
    });
  });

  describe('Milestone M2.3: Concyclicity & Same-Segment Converses', () => {
    it('identifies four cyclic points and verifies supplementary opposite angles', () => {
      // 4 points on circle of radius 5
      const pA: WorldPoint = { x: 5, y: 0 };
      const pB: WorldPoint = { x: 0, y: 5 };
      const pC: WorldPoint = { x: -5, y: 0 };
      const pD: WorldPoint = { x: 0, y: -5 };

      const test = testConcyclicityFourPoints(pA, pB, pC, pD);
      expect(test.isCyclic).toBe(true);
      expect(test.sumOpposite1).toBeCloseTo(180, 1);
      expect(test.sumOpposite2).toBeCloseTo(180, 1);
      expect(test.deviationDeg).toBeCloseTo(0, 1);
    });

    it('identifies non-cyclic configuration when fourth point is off circle', () => {
      const pA: WorldPoint = { x: 5, y: 0 };
      const pB: WorldPoint = { x: 0, y: 5 };
      const pC: WorldPoint = { x: -5, y: 0 };
      const pD: WorldPoint = { x: 0, y: -9 }; // Distort point D

      const test = testConcyclicityFourPoints(pA, pB, pC, pD);
      expect(test.isCyclic).toBe(false);
    });

    it('validates converse of same-segment theorem: same side + equal angles => concyclic', () => {
      const a: WorldPoint = { x: -4, y: 0 };
      const b: WorldPoint = { x: 4, y: 0 };
      // P and Q on circle x² + y² = 16 (or radius 5 circle passing through A and B)
      // On same upper side (y > 0)
      const p: WorldPoint = { x: 0, y: 4 };
      const q: WorldPoint = { x: 2, y: Math.sqrt(12) };

      const res = testSameSegmentAngles(a, b, p, q);
      expect(res.areSameSide).toBe(true);
      expect(res.areEqual).toBe(true);
      expect(res.isConcyclic).toBe(true);

      // Point R on opposite side (y < 0)
      const r: WorldPoint = { x: 0, y: -4 };
      const resOpp = testSameSegmentAngles(a, b, p, r);
      expect(resOpp.areSameSide).toBe(false);
      expect(resOpp.isConcyclic).toBe(false);
    });
  });
});


