import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { tickClock } from '../../../engine/physics/motion/kinematics';
import { Track } from '../../physics/forces/ForceCart';
import { DEFAULT_SETUP } from '../../../engine/physics/forces/forceModel';
import { MobileLabViewport } from '../mobile/MobileLabViewport';
import { MobileLabTransport } from '../mobile/MobileLabTransport';

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
});
