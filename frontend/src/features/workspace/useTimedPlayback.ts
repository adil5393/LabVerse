import { useCallback, useEffect, useRef, useState } from 'react';
import { tickClock } from '../../engine/physics/motion/kinematics';
import { useReducedMotion } from '../physics/motion/useReducedMotion';

/**
 * Simulated-time playback for a lab: `t` runs from 0 to `tEnd` seconds at `rate` times real time. Time is the clock, never
 * the frame count; with reduced motion the run jumps to the end. Starting from the end replays from 0.
 */
export function useTimedPlayback(tEnd: number, rate = 1) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const simTimeRef = useRef(0);
  const ref = useRef({ t, tEnd, rate });
  useEffect(() => { ref.current = { t, tEnd, rate }; });

  if (!playing) {
    simTimeRef.current = t;
  }

  useEffect(() => {
    if (!playing) return;
    if (simTimeRef.current >= ref.current.tEnd) { simTimeRef.current = 0; setT(0); }
    else { simTimeRef.current = t; }
    if (reduced) {
      const id = window.setTimeout(() => { simTimeRef.current = ref.current.tEnd; setT(ref.current.tEnd); setPlaying(false); }, 0);
      return () => window.clearTimeout(id);
    }
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(Math.max(0, now - last), 100);
      last = now;
      const { tEnd: end, rate: rr } = ref.current;
      const next = tickClock(simTimeRef.current * 1000, dt, rr, end * 1000) / 1000;
      simTimeRef.current = next;
      setT(next);
      if (next >= end) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced]);

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && simTimeRef.current >= ref.current.tEnd) {
        simTimeRef.current = 0;
        setT(0);
      }
      return !p;
    });
  }, []);
  /** Stop and go back to the start (used when the setup changes or Reset is pressed). */
  const reset = useCallback(() => { setPlaying(false); simTimeRef.current = 0; setT(0); }, []);
  const scrub = useCallback((to: number) => { setPlaying(false); simTimeRef.current = to; setT(to); }, []);

  return { t: Math.min(t, tEnd), playing, setPlaying, toggle, reset, scrub, atEnd: tEnd > 0 && t >= tEnd };
}
