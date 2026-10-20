import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { clientToViewBox, viewBoxToApparatus, DEFAULT_CAMERA } from '../../../../features/physics/work/components/useViewportCamera';
import { NumberInput } from '../../../../features/physics/work/components/NumberInput';
import { SimulationViewport } from '../../../../features/physics/work/components';
import { computeWork, DEFAULT_WORK } from '../workModel';

const svgWith = (ctm: { a: number; d: number; e: number; f: number } | null) => ({ getScreenCTM: () => ctm }) as unknown as SVGSVGElement;

describe('work lab interaction fixes', () => {
  it('maps pointers through the real SVG transform, including letterboxing', () => {
    // An 800 x 600 box showing a 1000 x 450 viewBox with "meet": scale 0.8, centred vertically (offset 120 px).
    const svg = svgWith({ a: 0.8, d: 0.8, e: 0, f: 120 });
    const top = clientToViewBox(svg, 0, 120)!;
    expect(top.x).toBeCloseTo(0);
    expect(top.y).toBeCloseTo(0);
    const mid = clientToViewBox(svg, 400, 300)!;
    expect(mid.x).toBeCloseTo(500);
    expect(mid.y).toBeCloseTo(225);
    expect(mid.unitsPerPx).toBeCloseTo(1.25);
  });

  it('inverts the camera so a zoomed and panned point lands back in apparatus space', () => {
    const cam = { zoom: 2, panX: 100, panY: 50 };
    expect(viewBoxToApparatus(600, 275, cam)).toEqual({ x: 500, y: 225 });
    expect(viewBoxToApparatus(500, 225, DEFAULT_CAMERA)).toEqual({ x: 500, y: 225 });
  });

  it('returns null when the SVG has no usable screen transform', () => {
    expect(clientToViewBox(svgWith(null), 1, 1)).toBeNull();
    expect(clientToViewBox(svgWith({ a: 0, d: 0, e: 0, f: 0 }), 1, 1)).toBeNull();
  });

  it('number inputs render as editable text so they can be cleared and retyped', () => {
    const html = renderToStaticMarkup(<NumberInput id="field-mass" dataField="mass" value={2} onCommit={() => {}} ariaLabel="Mass in kg" />);
    expect(html).toContain('type="text"');
    expect(html).toContain('inputMode="decimal"');
    expect(html).toContain('data-field="mass"');
    expect(html).toContain('value="2"');
  });

  it('the viewport blocks browser touch gestures and honours hidden objects', () => {
    const r = computeWork(DEFAULT_WORK);
    const base = { result: r, progress: 0, showVertical: true, onShowVerticalChange: () => {}, alt: 'x', playing: false, onTogglePlay: () => {}, onReset: () => {}, onProgressChange: () => {} };
    const shown = renderToStaticMarkup(<SimulationViewport {...base} />);
    expect(shown).toContain('touch-action:none');
    expect(shown).toContain('id="cart-assembly"');
    const hidden = renderToStaticMarkup(<SimulationViewport {...base} showCart={false} />);
    expect(hidden).not.toContain('id="cart-assembly"');
  });
});
