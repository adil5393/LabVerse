/**
 * Motion helpers for laboratory simulations that the student starts with a Run button (cooling a solution, a solvent front
 * rising, a week of root growth). Nothing here starts by itself: `useTicker` only runs while the student's Run is on, and
 * every Run first checks `prefersReducedMotion()` and, when set, jumps straight to the result instead of animating.
 */

import { useEffect, useRef } from 'react';

/** True when the student has asked the system for reduced motion. */
export const prefersReducedMotion = (): boolean => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/** Calls `tick` every `ms` milliseconds while `running` is true (Run / Pause). */
export function useTicker(running: boolean, tick: () => void, ms = 300): void {
  const latest = useRef(tick);
  useEffect(() => { latest.current = tick; });
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => latest.current(), ms);
    return () => window.clearInterval(id);
  }, [running, ms]);
}
