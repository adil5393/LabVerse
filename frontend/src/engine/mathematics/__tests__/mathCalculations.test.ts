import { describe, it, expect } from 'vitest';
import {
  calculateDistance,
  calculateMidpoint,
  calculateDifferences,
  calculateDistanceAnalysis,
  formatMathNumber,
} from '../calculations';

describe('Mathematics Calculations Engine', () => {
  describe('calculateDistance', () => {
    it('calculates exact distance for Milestone M1 reference points A(2, 3) and B(7, 6)', () => {
      const pA = { x: 2, y: 3 };
      const pB = { x: 7, y: 6 };
      const dist = calculateDistance(pA, pB);

      // dx = 5, dy = 3, d = sqrt(5^2 + 3^2) = sqrt(34) ≈ 5.83095189
      expect(dist).toBeCloseTo(Math.sqrt(34), 8);
      expect(dist).toBeCloseTo(5.831, 3);
    });

    it('calculates integer distance for classic 3-4-5 Pythagorean right triangle', () => {
      const p1 = { x: 1, y: 1 };
      const p2 = { x: 4, y: 5 }; // dx = 3, dy = 4, d = 5
      expect(calculateDistance(p1, p2)).toBe(5);
    });

    it('accurately computes distance with negative coordinates across multiple quadrants', () => {
      const p1 = { x: -3, y: -4 };
      const p2 = { x: 3, y: 4 }; // dx = 6, dy = 8, d = 10
      expect(calculateDistance(p1, p2)).toBe(10);

      const p3 = { x: -5, y: 2 };
      const p4 = { x: 7, y: -3 }; // dx = 12, dy = -5, d = 13
      expect(calculateDistance(p3, p4)).toBe(13);
    });

    it('accurately computes distance with decimal coordinates', () => {
      const p1 = { x: 1.5, y: 2.25 };
      const p2 = { x: 4.5, y: 6.25 }; // dx = 3.0, dy = 4.0, d = 5.0
      expect(calculateDistance(p1, p2)).toBeCloseTo(5.0, 6);
    });

    it('returns 0 for coincident points (zero-length segments)', () => {
      const p1 = { x: 4.2, y: -9.8 };
      const p2 = { x: 4.2, y: -9.8 };
      expect(calculateDistance(p1, p2)).toBe(0);
    });
  });

  describe('calculateMidpoint', () => {
    it('calculates midpoint accurately for reference points A(2, 3) and B(7, 6)', () => {
      const pA = { x: 2, y: 3 };
      const pB = { x: 7, y: 6 };
      const mid = calculateMidpoint(pA, pB);

      expect(mid.x).toBe(4.5);
      expect(mid.y).toBe(4.5);
    });

    it('handles negative and origin midpoints correctly', () => {
      const p1 = { x: -6, y: -8 };
      const p2 = { x: 6, y: 8 };
      const mid = calculateMidpoint(p1, p2);

      expect(mid.x).toBe(0);
      expect(mid.y).toBe(0);
    });
  });

  describe('calculateDifferences', () => {
    it('returns signed and absolute dx, dy correctly', () => {
      const p1 = { x: 7, y: 6 };
      const p2 = { x: 2, y: 1 };
      const diffs = calculateDifferences(p1, p2);

      expect(diffs.dx).toBe(-5);
      expect(diffs.dy).toBe(-5);
      expect(diffs.absDx).toBe(5);
      expect(diffs.absDy).toBe(5);
    });
  });

  describe('calculateDistanceAnalysis', () => {
    it('generates complete step-by-step mathematical substitution for A(2, 3) and B(7, 6)', () => {
      const pA = { x: 2, y: 3, label: 'A' };
      const pB = { x: 7, y: 6, label: 'B' };
      const analysis = calculateDistanceAnalysis(pA, pB);

      expect(analysis.dx).toBe(5);
      expect(analysis.dy).toBe(3);
      expect(analysis.sumOfSquares).toBe(34);
      expect(analysis.isExactSquare).toBe(false);
      expect(analysis.formattedDistance).toBe('5.831');
      expect(analysis.steps.formula).toContain('\\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}');
      expect(analysis.steps.squared).toContain('25 + 9');
      expect(analysis.steps.sum).toContain('\\sqrt{34}');
    });

    it('flags exact integer squares correctly (e.g. 3-4-5 triangle)', () => {
      const p1 = { x: 0, y: 0, label: 'A' };
      const p2 = { x: 3, y: 4, label: 'B' };
      const analysis = calculateDistanceAnalysis(p1, p2);

      expect(analysis.sumOfSquares).toBe(25);
      expect(analysis.isExactSquare).toBe(true);
      expect(analysis.exactSqrt).toBe(5);
      expect(analysis.steps.final).toBe('d = 5');
    });

    it('handles negative coordinate substitution with parentheses wrapping', () => {
      const p1 = { x: -2, y: -3, label: 'A' };
      const p2 = { x: 4, y: 5, label: 'B' };
      const analysis = calculateDistanceAnalysis(p1, p2);

      expect(analysis.steps.substitution).toContain('4 - (-2)');
      expect(analysis.steps.substitution).toContain('5 - (-3)');
    });

    it('handles invalid numeric inputs (NaN, Infinity) safely without crashing', () => {
      const p1 = { x: NaN, y: 0, label: 'A' };
      const p2 = { x: 10, y: Infinity, label: 'B' };
      const analysis = calculateDistanceAnalysis(p1, p2);

      expect(Number.isFinite(analysis.distance)).toBe(true);
      expect(analysis.formattedDistance).toBeDefined();
    });
  });

  describe('formatMathNumber', () => {
    it('formats decimals cleanly without trailing zeros', () => {
      expect(formatMathNumber(5.0)).toBe('5');
      expect(formatMathNumber(5.83095, 3)).toBe('5.831');
      expect(formatMathNumber(-0)).toBe('0');
      expect(formatMathNumber(3.14000, 2)).toBe('3.14');
    });
  });
});
