import { describe, it, expect } from 'vitest';
import {
  screenToMath,
  mathToScreen,
  snapToMathGrid,
  getVisibleMathBounds,
  calculateAdaptiveTickInterval,
  DEFAULT_UNIT_PIXELS,
} from '../coordinates';
import type { MathViewportTransform } from '../types';

describe('Mathematics Coordinates Engine', () => {
  const baseTransform: MathViewportTransform = {
    panX: 400,
    panY: 300,
    zoom: 1.0,
    unitPixels: DEFAULT_UNIT_PIXELS, // 44px
  };

  it('correctly maps screen origin (panX, panY) to mathematical origin (0, 0)', () => {
    const mathOrigin = screenToMath(baseTransform.panX, baseTransform.panY, baseTransform);
    expect(mathOrigin.x).toBeCloseTo(0, 5);
    expect(mathOrigin.y).toBeCloseTo(0, 5);

    const screenOrigin = mathToScreen(0, 0, baseTransform);
    expect(screenOrigin.x).toBeCloseTo(baseTransform.panX, 5);
    expect(screenOrigin.y).toBeCloseTo(baseTransform.panY, 5);
  });

  it('guarantees positive Y points UPWARD (lower screen Y)', () => {
    // Math point (0, 5) should be above the origin on screen (screen Y < panY)
    const screenPt = mathToScreen(0, 5, baseTransform);
    expect(screenPt.y).toBeLessThan(baseTransform.panY);
    expect(screenPt.y).toBeCloseTo(baseTransform.panY - 5 * DEFAULT_UNIT_PIXELS, 5);

    // Negative Y should be below the origin on screen (screen Y > panY)
    const screenNegative = mathToScreen(0, -5, baseTransform);
    expect(screenNegative.y).toBeGreaterThan(baseTransform.panY);
  });

  it('guarantees exact screenToMath <-> mathToScreen roundtrip consistency', () => {
    const testCases = [
      { x: 0, y: 0 },
      { x: 2, y: 3 },
      { x: 7, y: 6 },
      { x: -5, y: -8 },
      { x: -3.5, y: 4.25 },
      { x: 100.123, y: -45.678 },
    ];

    for (const pt of testCases) {
      const screen = mathToScreen(pt.x, pt.y, baseTransform);
      const roundtrip = screenToMath(screen.x, screen.y, baseTransform);
      expect(roundtrip.x).toBeCloseTo(pt.x, 5);
      expect(roundtrip.y).toBeCloseTo(pt.y, 5);
    }
  });

  it('preserves mathematical coordinates accurately across zoom and pan changes', () => {
    const zoomedTransform: MathViewportTransform = {
      panX: 250,
      panY: 180,
      zoom: 2.5,
      unitPixels: DEFAULT_UNIT_PIXELS,
    };

    const targetMath = { x: 7, y: 6 };
    const screen = mathToScreen(targetMath.x, targetMath.y, zoomedTransform);
    const resultMath = screenToMath(screen.x, screen.y, zoomedTransform);

    expect(resultMath.x).toBeCloseTo(targetMath.x, 5);
    expect(resultMath.y).toBeCloseTo(targetMath.y, 5);
  });

  it('snaps coordinates to grid accurately for integer and decimal steps', () => {
    expect(snapToMathGrid(2.04, 1.0)).toBe(2.0);
    expect(snapToMathGrid(2.68, 1.0)).toBe(3.0);
    expect(snapToMathGrid(-3.85, 1.0)).toBe(-4.0);
    expect(snapToMathGrid(-3.12, 1.0)).toBe(-3.0);

    // 0.5 step snapping
    expect(snapToMathGrid(2.21, 0.5)).toBe(2.0);
    expect(snapToMathGrid(2.35, 0.5)).toBe(2.5);
    expect(snapToMathGrid(-1.74, 0.5)).toBe(-1.5);
  });

  it('calculates visible math bounds correctly given canvas viewport', () => {
    const bounds = getVisibleMathBounds(800, 600, baseTransform);
    expect(bounds.minX).toBeLessThan(0);
    expect(bounds.maxX).toBeGreaterThan(0);
    expect(bounds.minY).toBeLessThan(0);
    expect(bounds.maxY).toBeGreaterThan(0);
  });

  it('computes adaptive tick intervals across various zoom scales', () => {
    // High zoom: detailed minor ticks
    const highZoom = calculateAdaptiveTickInterval(2.5, DEFAULT_UNIT_PIXELS);
    expect(highZoom.majorStep).toBe(1);
    expect(highZoom.minorStep).toBe(0.5);

    // Normal zoom: 1 unit major step
    const normalZoom = calculateAdaptiveTickInterval(1.0, DEFAULT_UNIT_PIXELS);
    expect(normalZoom.majorStep).toBe(1);

    // Low zoom out: wider steps so labels do not bunch up
    const lowZoom = calculateAdaptiveTickInterval(0.3, DEFAULT_UNIT_PIXELS);
    expect(lowZoom.majorStep).toBeGreaterThanOrEqual(2);
  });
});
