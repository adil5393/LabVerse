import { describe, expect, it } from 'vitest';
import { fitMathViewport } from '../viewportFit';
import { mathToScreen } from '../coordinates';

describe('Construction fitting on narrow canvases', () => {
  it.each([320, 390, 768, 1200])('keeps the construction and origin inside a %i pixel canvas', (width) => {
    const points = [{ x: -3, y: -2 }, { x: 9, y: 7 }];
    const viewport = fitMathViewport(points, width, 380, 44);
    for (const point of [...points, { x: 0, y: 0 }]) {
      const screen = mathToScreen(point.x, point.y, viewport);
      expect(screen.x).toBeGreaterThanOrEqual(48);
      expect(screen.x).toBeLessThanOrEqual(width - 48);
      expect(screen.y).toBeGreaterThanOrEqual(48);
      expect(screen.y).toBeLessThanOrEqual(380 - 48);
    }
  });
  it('centres an empty construction without invalid zoom or coordinates', () => {
    const viewport = fitMathViewport([], 320, 240, 44);
    expect(viewport.panX).toBe(160); expect(viewport.panY).toBe(120); expect(viewport.zoom).toBeGreaterThan(0);
  });
});
