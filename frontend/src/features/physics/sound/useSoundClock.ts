/**
 * Playback clock for the Sound laboratories: `t` is simulated (picture) time in seconds, 0 to `duration`. Time comes from the
 * clock, never from the frame count. With reduced motion the clock does not animate (unless `runWhenReduced`, used where only a
 * progress readout advances and nothing oscillates): the visitor moves time with the slider or the step buttons, and Play is not offered. Play from the end starts again from 0; the clock stops by itself at the end.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../motion/useReducedMotion';

export function useSoundClock(duration: number, options: { runWhenReduced?: boolean } = {}) {
  const reducedPref = useReducedMotion();
  /** `reduced` is what the visitor asked for; `blocked` is whether the clock itself may not run. */
  const reduced = reducedPref;
  const blocked = reducedPref && !options.runWhenReduced;
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const tRef = useRef(0);
  const durRef = useRef(duration);
  useEffect(() => { durRef.current = duration; }, [duration]);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(Math.max(0, now - last), 100) / 1000;
      last = now;
      const next = Math.min(durRef.current, tRef.current + dt);
      tRef.current = next;
      setT(next);
      if (next >= durRef.current) { setPlaying(false); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const seek = useCallback((to: number) => { const v = Math.min(Math.max(0, to), durRef.current); tRef.current = v; setT(v); }, []);
  const play = useCallback(() => { if (blocked) return; if (tRef.current >= durRef.current) seek(0); setPlaying(true); }, [blocked, seek]);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => { if (playing) setPlaying(false); else play(); }, [playing, play]);
  /** Go back to 0 and stop. */
  const reset = useCallback(() => { setPlaying(false); seek(0); }, [seek]);
  /** Go back to 0 and run again. */
  const replay = useCallback(() => { seek(0); if (!blocked) setPlaying(true); }, [seek, blocked]);
  /** Move time by the slider: stops the clock. */
  const scrub = useCallback((to: number) => { setPlaying(false); seek(to); }, [seek]);

  return { t, playing, reduced, blocked, play, pause, toggle, reset, replay, scrub, seek, atEnd: duration > 0 && t >= duration };
}
