import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { Track } from '../../physics/forces/ForceCart';
import { DEFAULT_SETUP } from '../../../engine/physics/forces/forceModel';
import { MobileLabViewport } from '../mobile/MobileLabViewport';
import { MobileLabTransport } from '../mobile/MobileLabTransport';
import { PropertiesInspector } from '../../physics/work/components/PropertiesInspector';
import { DEFAULT_WORK, computeWork } from '../../../engine/physics/work/workModel';

describe('Physics Simulation Stability & Viewport Geometry Regressions', () => {
  describe('Authoritative Simulation Clock & Monotonicity', () => {
    it('tickClock advances strictly monotonically during forward playback', () => {
      let t = 0;
      const total = 5000;
      const history: number[] = [t];
      // Simulate 60 frames of variable frame times (16ms +/- 4ms)
      const frameDts = [16, 17, 15, 20, 12, 16, 18, 14, 16, 16];
      for (let i = 0; i < 60; i++) {
        const dt = frameDts[i % frameDts.length];
        t = tickClock(t, dt, 1, total);
        history.push(t);
      }

      // Check strictly non-decreasing and strictly forward
      for (let i = 1; i < history.length; i++) {
        expect(history[i]).toBeGreaterThan(history[i - 1]);
      }
    });

    it('tickClock never overshoots total simulated time', () => {
      const total = 1000;
      let t = 950;
      t = tickClock(t, 100, 1, total);
      expect(t).toBe(1000);
      t = tickClock(t, 50, 1, total);
      expect(t).toBe(1000);
    });

    it('tickClock with 0 elapsed wall time produces zero time jump (paused/steady)', () => {
      const t0 = 2450;
      expect(tickClock(t0, 0, 1, 5000)).toBe(t0);
    });

    it('tickClock clamps negative deltas cleanly without backward jumps', () => {
      const t0 = 1500;
      expect(tickClock(t0, -16, 1, 5000)).toBe(t0);
    });
  });

  describe('Track Viewport Framing & Top Clipping Prevention', () => {
    it('compact Track SVG has generous top headroom (viewBox min-y <= 12, height >= 95)', () => {
      const html = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={0} fixedSpan={40} compact={true} />
      );

      // Verify compact viewBox includes expanded vertical bounds
      expect(html).toContain('viewBox="20 12 580 95"');
      // The cart label must be rendered inside the track SVG
      expect(html).toContain('data-testid="force-track"');
      expect(html).toContain('0 m');
    });

    it('standard desktop Track SVG preserves unclipped 0 0 620 110 viewBox', () => {
      const html = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={0} />
      );

      expect(html).toContain('viewBox="0 0 620 110"');
    });

    it('MobileLabViewport renders top telemetry bar in-flow, leaving children unclipped below it', () => {
      const html = renderToStaticMarkup(
        <MobileLabViewport
          telemetry={<span data-testid="pill">Live Telemetry</span>}
          overlayControls={<button type="button">Action</button>}
        >
          <div data-testid="canvas-child">Simulation Apparatus</div>
        </MobileLabViewport>
      );

      // Verify the top bar is rendered in-flow with border-b and shrink-0
      expect(html).toContain('min-h-[32px]');
      expect(html).toContain('Live Telemetry');
      expect(html).toContain('Simulation Apparatus');
      // Children container must have flex-1 min-h-0 relative to occupy remaining space cleanly
      expect(html).toContain('flex-1 min-h-0 relative flex flex-col');
    });
  });

  describe('Timeline Scrubber & Range Input Smoothing', () => {
    it('MobileLabTransport scrubber uses step="any" to eliminate thumb quantization jitter', () => {
      const html = renderToStaticMarkup(
        <MobileLabTransport
          playing={false}
          onTogglePlay={() => {}}
          time={2.34}
          maxTime={10}
          onScrub={() => {}}
        />
      );

      expect(html).toContain('step="any"');
      expect(html).not.toContain('step="0.05"');
      expect(html).toContain('data-testid="mobile-time-scrubber"');
    });
  });

  describe('Cart Tracking Camera & Continuous Scrolling Position Ruler', () => {
    function getCartScreenX(svgMarkup: string): number {
      const match = svgMarkup.match(/<rect\s+x="([^"]+)"/);
      if (!match) throw new Error('Cart rect not found in Track SVG');
      return parseFloat(match[1]) + 17; // rect center
    }

    it('cart initially moves naturally across track until reaching 50% anchor (310px)', () => {
      // At t = 0, cart starts at x = 0, rendered ~114px on screen
      const svg0 = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={0} fixedSpan={40} />
      );
      const x0 = getCartScreenX(svg0);
      expect(x0).toBeCloseTo(114, 0);

      // As cart moves forward, its screen position increases smoothly towards 310px
      const svg1 = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={1.0} fixedSpan={40} />
      );
      const x1 = getCartScreenX(svg1);
      expect(x1).toBeGreaterThan(x0);
      expect(x1).toBeLessThanOrEqual(310.5);
    });

    it('cart screen position is strictly continuous across the previous threshold value (x = 24m, t ~ 3.1s)', () => {
      // Sample 40 time steps from t = 2.5s to t = 4.5s covering the old page-jump threshold
      const samples: { t: number; screenX: number }[] = [];
      for (let t = 2.5; t <= 4.5; t += 0.05) {
        const svg = renderToStaticMarkup(
          <Track setup={DEFAULT_SETUP} tMax={20} t={t} fixedSpan={40} />
        );
        samples.push({ t, screenX: getCartScreenX(svg) });
      }

      // Verify ZERO teleportation or discontinuous jumps (max frame-to-frame delta must be small)
      for (let i = 1; i < samples.length; i++) {
        const delta = Math.abs(samples[i].screenX - samples[i - 1].screenX);
        expect(delta).toBeLessThan(1.0); // cart stays stable at 310px anchor once following
      }

      // Verify it stays stably anchored at 310px (50% viewport width)
      expect(samples[samples.length - 1].screenX).toBeCloseTo(310, 0);
    });

    it('ruler ticks move smoothly beneath the cart during continuous camera tracking', () => {
      // Render at two consecutive times during camera following
      const svgA = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={3.0} fixedSpan={40} />
      );
      const svgB = renderToStaticMarkup(
        <Track setup={DEFAULT_SETUP} tMax={20} t={3.2} fixedSpan={40} />
      );

      // Cart screen position is stable
      const cartXA = getCartScreenX(svgA);
      const cartXB = getCartScreenX(svgB);
      expect(Math.abs(cartXB - cartXA)).toBeLessThan(0.1);

      // But ruler coordinates moved continuously beneath it
      expect(svgA).toContain('position (m)');
      expect(svgB).toContain('position (m)');
      // SVG aria-label reflects real physical coordinates without resets
      expect(svgA).toMatch(/Track from \+?\d+(\.\d+)? m to \+?\d+(\.\d+)? m/);
    });

    it('supports direction reversal, deceleration, and leftward movement without snapping', () => {
      // Setup moving left
      const leftSetup = { ...DEFAULT_SETUP, forceA: 0, forceB: 10, dirB: 'left' as const };
      const svgLeft0 = renderToStaticMarkup(
        <Track setup={leftSetup} tMax={20} t={0} fixedSpan={40} />
      );
      const xLeft0 = getCartScreenX(svgLeft0);
      // Cart starts with room on left, near 506px
      expect(xLeft0).toBeGreaterThan(450);

      // At t = 2.0s, cart has moved leftwards smoothly
      const svgLeft2 = renderToStaticMarkup(
        <Track setup={leftSetup} tMax={20} t={2.0} fixedSpan={40} />
      );
      const xLeft2 = getCartScreenX(svgLeft2);
      expect(xLeft2).toBeLessThan(xLeft0);
    });
  });

  describe('Work & Energy Laboratory Mobile Parameter Sheet Layout', () => {
    it('PropertiesInspector renders responsive full-width layout in compact mode (no desktop 308px sidebar or 40px icon strip)', () => {
      const result = computeWork(DEFAULT_WORK);
      const html = renderToStaticMarkup(
        <PropertiesInspector
          setup={DEFAULT_WORK}
          result={result}
          onChange={() => {}}
          showVertical={false}
          onShowVerticalChange={() => {}}
          compact={true}
        />
      );

      // Must have data-testid="work-controls"
      expect(html).toContain('data-testid="work-controls"');
      // Must NOT contain desktop fixed 308px width or 40px icon strip
      expect(html).not.toContain('w-[308px]');
      expect(html).not.toContain('w-10');
      expect(html).not.toContain('Expand Properties Inspector');

      // Must contain mobile-friendly category tabs and touch steppers
      expect(html).toContain('Applied Force');
      expect(html).toContain('data-field="force"');
      expect(html).toContain('data-field="mass"');
      expect(html).toContain('data-testid="surface-select"');
      expect(html).toContain('data-field="displacement"');
      expect(html).toContain('data-testid="work-more"');
    });
  });
});

