/**
 * React side of the tone engine: the engine snapshot, plus the lifecycle every laboratory needs. The tone is stopped when the
 * page is hidden or left (pagehide) and when the component that owns it unmounts (navigation, closing a lab); a lab also calls
 * `stop` on reset. It never starts a tone by itself.
 */

import { useEffect, useSyncExternalStore } from 'react';
import { getToneEngine } from '../../engine/audio/toneEngine';

export function useTone() {
  const engine = getToneEngine();
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot, engine.getSnapshot);

  useEffect(() => {
    const leave = () => engine.stop('The sound stopped because you left the page.');
    const hide = () => { if (document.visibilityState === 'hidden') engine.stop('The sound stopped because the page was hidden.'); };
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', hide);
      engine.stop(null);
    };
  }, [engine]);

  return { engine, snapshot };
}
