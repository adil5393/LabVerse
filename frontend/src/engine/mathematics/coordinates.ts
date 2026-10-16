/**
 * Coordinate Engine for LabVerse Mathematics Laboratory
 *
 * Implements mathematically consistent 2D Cartesian World Coordinates:
 * - Origin (0,0) is placed at (panX, panY) in screen space.
 * - Positive X-axis points RIGHT.
 * - Positive Y-axis points UPWARD (inverting browser SVG/DOM screen Y).
 * - Centralizes all screen <-> world coordinate mappings.
 */

import type { MathViewportTransform } from './types';

export const DEFAULT_UNIT_PIXELS = 44; // 1 math unit = 44px at 1x zoom

/**
 * Converts screen pixel coordinates to mathematical world coordinates.
 * Screen Y increases downward; Math Y increases upward.
 */
export function screenToMath(
  screenX: number,
  screenY: number,
  transform: MathViewportTransform
): { x: number; y: number } {
  const { panX, panY, zoom, unitPixels } = transform;
  const effectiveScale = unitPixels * zoom;
  if (effectiveScale <= 0) return { x: 0, y: 0 };

  return {
    x: (screenX - panX) / effectiveScale,
    y: (panY - screenY) / effectiveScale,
  };
}

/**
 * Converts mathematical world coordinates to screen pixel coordinates.
 */
export function mathToScreen(
  mathX: number,
  mathY: number,
  transform: MathViewportTransform
): { x: number; y: number } {
  const { panX, panY, zoom, unitPixels } = transform;
  const effectiveScale = unitPixels * zoom;

  return {
    x: panX + mathX * effectiveScale,
    y: panY - mathY * effectiveScale,
  };
}

/**
 * Converts browser client pointer coordinates (e.g. from PointerEvent)
 * to mathematical world coordinates using an SVG element's bounding rect.
 */
export function pointerToMath(
  clientX: number,
  clientY: number,
  svgRect: DOMRect | { left: number; top: number },
  transform: MathViewportTransform
): { x: number; y: number } {
  const screenX = clientX - svgRect.left;
  const screenY = clientY - svgRect.top;
  return screenToMath(screenX, screenY, transform);
}

/**
 * Snaps a mathematical coordinate to the nearest grid increment.
 * Handles float precision nicely (e.g. 0.1, 0.5, 1.0).
 */
export function snapToMathGrid(
  coord: number,
  step = 1.0
): number {
  if (step <= 0) return coord;
  const snapped = Math.round(coord / step) * step;
  // Eliminate -0 floating point artifact
  return Object.is(snapped, -0) ? 0 : Number(snapped.toFixed(6));
}

/**
 * Computes visible range of mathematical coordinates given canvas dimensions and transform.
 */
export function getVisibleMathBounds(
  width: number,
  height: number,
  transform: MathViewportTransform
): { minX: number; maxX: number; minY: number; maxY: number } {
  const topLeft = screenToMath(0, 0, transform);
  const bottomRight = screenToMath(width, height, transform);

  return {
    minX: Math.min(topLeft.x, bottomRight.x),
    maxX: Math.max(topLeft.x, bottomRight.x),
    minY: Math.min(topLeft.y, bottomRight.y),
    maxY: Math.max(topLeft.y, bottomRight.y),
  };
}

/**
 * Calculates human-friendly tick interval based on current zoom level.
 * Ensures grid lines and numbers don't bunch up or become too sparse.
 */
export function calculateAdaptiveTickInterval(zoom: number, unitPixels = DEFAULT_UNIT_PIXELS): {
  majorStep: number;
  minorStep: number;
} {
  const pixelsPerUnit = unitPixels * zoom;

  if (pixelsPerUnit >= 100) {
    return { majorStep: 1, minorStep: 0.5 };
  } else if (pixelsPerUnit >= 35) {
    return { majorStep: 1, minorStep: 1 };
  } else if (pixelsPerUnit >= 18) {
    return { majorStep: 2, minorStep: 1 };
  } else if (pixelsPerUnit >= 8) {
    return { majorStep: 5, minorStep: 1 };
  } else {
    return { majorStep: 10, minorStep: 5 };
  }
}
