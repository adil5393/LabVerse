import { describe, it, expect } from 'vitest';
import {
  getCircumferenceCoords,
  calculateAngleDegrees,
  calculateChordMetrics,
  verifyInscribedAngleTheorem,
  verifyAngleInSemicircle,
  verifyCyclicQuadOppositeAngles,
  verifyEqualChordsEquidistant,
  calculateTangentSegment,
} from '../geometry';
import type { CircleObject } from '../types';

describe('Class 9 Circle Theorems - Rigorous Mathematical Verifications', () => {
  const circle: CircleObject = {
    id: 'test_circle',
    name: 'Circle O',
    center: { x: 0, y: 0 },
    radius: 4.0,
  };

  // Theorem 1: Perpendicular from center to chord bisects the chord
  describe('Theorem 1: Perpendicular from center to chord bisects the chord', () => {
    it('verifies AM = MB and OM is strictly perpendicular to AB', () => {
      // Let A be at angle 30° (π/6) and B at angle 150° (5π/6)
      const ptA = getCircumferenceCoords(circle, Math.PI / 6);
      const ptB = getCircumferenceCoords(circle, (5 * Math.PI) / 6);

      const metrics = calculateChordMetrics(circle, ptA, ptB);
      const distAM = Math.hypot(ptA.x - metrics.midpoint.x, ptA.y - metrics.midpoint.y);
      const distMB = Math.hypot(ptB.x - metrics.midpoint.x, ptB.y - metrics.midpoint.y);

      // 1. Bisected halves are equal
      expect(distAM).toBeCloseTo(distMB, 3);
      expect(distAM + distMB).toBeCloseTo(metrics.length, 3);

      // 2. Vector OM is perpendicular to AB: dot product of OM and AB is 0
      const vecOM = { x: metrics.midpoint.x - circle.center.x, y: metrics.midpoint.y - circle.center.y };
      const vecAB = { x: ptB.x - ptA.x, y: ptB.y - ptA.y };
      const dot = vecOM.x * vecAB.x + vecOM.y * vecAB.y;
      expect(Math.abs(dot)).toBeLessThan(1e-4);
    });
  });

  // Theorem 2: Equal chords of a circle are equidistant from the center
  describe('Theorem 2: Equal chords are equidistant from center', () => {
    it('confirms chords of equal length have identical distances from center', () => {
      // Chord 1 with arc subtending 60°
      const ptA = getCircumferenceCoords(circle, 0);
      const ptB = getCircumferenceCoords(circle, Math.PI / 3);
      const metrics1 = calculateChordMetrics(circle, ptA, ptB);

      // Chord 2 with arc subtending 60° at another position (120° to 180°)
      const ptC = getCircumferenceCoords(circle, (2 * Math.PI) / 3);
      const ptD = getCircumferenceCoords(circle, Math.PI);
      const metrics2 = calculateChordMetrics(circle, ptC, ptD);

      const verif = verifyEqualChordsEquidistant(
        metrics1.length,
        metrics1.distFromCenter,
        metrics2.length,
        metrics2.distFromCenter
      );

      expect(verif.areChordsEqual).toBe(true);
      expect(verif.areDistancesEqual).toBe(true);
      expect(verif.distanceDiff).toBeLessThan(0.001);
    });
  });

  // Theorem 3: Angle subtended by an arc at the center is double the angle at the circumference
  describe('Theorem 3: Central Angle = 2 × Inscribed Angle', () => {
    it('verifies ∠AOB = 2 × ∠APB across different arc positions', () => {
      // Arc AB in lower half: A at 210° (7π/6), B at 330° (11π/6)
      const ptA = getCircumferenceCoords(circle, (7 * Math.PI) / 6);
      const ptB = getCircumferenceCoords(circle, (11 * Math.PI) / 6);

      // Inscribed point P on upper semicircle: P at 90° (π/2)
      const ptP = getCircumferenceCoords(circle, Math.PI / 2);

      const centralAngle = calculateAngleDegrees(ptA, circle.center, ptB);
      const inscribedAngle = calculateAngleDegrees(ptA, ptP, ptB);

      const verif = verifyInscribedAngleTheorem(centralAngle, inscribedAngle);
      expect(verif.isValid).toBe(true);
      expect(verif.ratio).toBeCloseTo(2.0, 1);
    });
  });

  // Theorem 4: Angles in the same segment are equal
  describe('Theorem 4: Angles in the same segment of a circle are equal', () => {
    it('verifies ∠APB = ∠AQB for two points P and Q on the major arc', () => {
      const ptA = getCircumferenceCoords(circle, (7 * Math.PI) / 6);
      const ptB = getCircumferenceCoords(circle, (11 * Math.PI) / 6);

      const ptP = getCircumferenceCoords(circle, Math.PI / 3);  // 60°
      const ptQ = getCircumferenceCoords(circle, (2 * Math.PI) / 3); // 120°

      const angleP = calculateAngleDegrees(ptA, ptP, ptB);
      const angleQ = calculateAngleDegrees(ptA, ptQ, ptB);

      expect(Math.abs(angleP - angleQ)).toBeLessThan(0.15);
    });
  });

  // Theorem 5: Angle in a semicircle is a right angle (90°)
  describe('Theorem 5: Angle in a semicircle is 90°', () => {
    it('confirms ∠APB = 90° when AB is a diameter', () => {
      // Diameter along X-axis: A at 180° (-4, 0), B at 0° (4, 0)
      const ptA = getCircumferenceCoords(circle, Math.PI);
      const ptB = getCircumferenceCoords(circle, 0);

      // Point P anywhere on the semicircle (e.g. 60°)
      const ptP = getCircumferenceCoords(circle, Math.PI / 3);

      const angleP = calculateAngleDegrees(ptA, ptP, ptB);
      const verif = verifyAngleInSemicircle(angleP);

      expect(verif.isRightAngle).toBe(true);
      expect(angleP).toBeCloseTo(90.0, 1);
    });
  });

  // Theorem 6: Cyclic Quadrilateral opposite angles are supplementary (180°)
  describe('Theorem 6: Opposite angles of a cyclic quadrilateral sum to 180°', () => {
    it('verifies ∠A + ∠C = 180° and ∠B + ∠D = 180° for 4 cyclic points', () => {
      // Points in cyclic order around circumference
      const ptA = getCircumferenceCoords(circle, 0.5);
      const ptB = getCircumferenceCoords(circle, 1.8);
      const ptC = getCircumferenceCoords(circle, 3.4);
      const ptD = getCircumferenceCoords(circle, 5.0);

      // Interior angles of quadrilateral ABCD:
      const angA = calculateAngleDegrees(ptD, ptA, ptB);
      const angB = calculateAngleDegrees(ptA, ptB, ptC);
      const angC = calculateAngleDegrees(ptB, ptC, ptD);
      const angD = calculateAngleDegrees(ptC, ptD, ptA);

      const verifAC = verifyCyclicQuadOppositeAngles(angA, angC);
      const verifBD = verifyCyclicQuadOppositeAngles(angB, angD);

      expect(verifAC.isSupplementary).toBe(true);
      expect(verifBD.isSupplementary).toBe(true);
      expect(verifAC.sum).toBeCloseTo(180.0, 1);
      expect(verifBD.sum).toBeCloseTo(180.0, 1);
    });
  });

  // Tangent-Radius Perpendicularity
  describe('Tangent Theorem: Tangent is perpendicular to radius at contact point', () => {
    it('verifies ∠OPT = 90.0°', () => {
      const contactPt = getCircumferenceCoords(circle, Math.PI / 4); // 45°
      const tan = calculateTangentSegment(circle, contactPt, 6.0);

      expect(tan.isPerpendicularToRadius).toBe(true);

      const angleAtContact = calculateAngleDegrees(circle.center, contactPt, tan.pStart);
      expect(angleAtContact).toBeCloseTo(90.0, 1);
    });
  });
});
