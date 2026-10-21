/**
 * Narration context and hook (no components, so React Fast Refresh keeps working in the component files). `useNarration` owns
 * one controller for a list of segments; `NarrationRegion` (the component) provides it, `NarrationPlayer` and `Nar` read it.
 *
 * Lifecycle: the controller stops on unmount (navigation, lesson change, step change), whenever `resetKey` changes, and when
 * the page is hidden or left; it never starts speaking by itself.
 */

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { NarrationController, type NarrationSegment, type NarrationSnapshot } from '../../engine/narration/controller';
import { getSpeechProvider } from '../../engine/narration/provider';
import { useNarrationSettings } from '../../engine/narration/settings';

export const EnabledContext = createContext(false);
export const useNarrationEnabled = (): boolean => useContext(EnabledContext);

export interface RegionValue { controller: NarrationController; snapshot: NarrationSnapshot }
export const RegionContext = createContext<RegionValue | null>(null);
export const useNarrationRegion = (): RegionValue | null => useContext(RegionContext);

const docLang = (): string => (typeof document !== 'undefined' && document.documentElement.lang) || 'en';

/** The controller for a list of segments. Exposed for components that need the controller without the region markup. */
export function useNarration(segments: NarrationSegment[], resetKey = ''): RegionValue {
  const [controller] = useState(() => {
    const s = useNarrationSettings.getState();
    return new NarrationController({ provider: getSpeechProvider(), lang: docLang(), rate: s.rate, voiceURI: s.voiceURI });
  });
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);

  useEffect(() => { controller.setSegments(segments); }, [controller, segments]);
  useEffect(() => { controller.stop(); }, [controller, resetKey]);

  // The user's rate and voice choices apply to every region.
  const rate = useNarrationSettings((s) => s.rate);
  const voiceURI = useNarrationSettings((s) => s.voiceURI);
  useEffect(() => { controller.setRate(rate); }, [controller, rate]);
  useEffect(() => { controller.setVoice(voiceURI); }, [controller, voiceURI]);

  useEffect(() => {
    const leave = () => controller.stop();
    const hide = () => { if (document.visibilityState === 'hidden') controller.stop(); };
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('pagehide', leave);
      document.removeEventListener('visibilitychange', hide);
      controller.dispose();
    };
  }, [controller]);

  return useMemo(() => ({ controller, snapshot }), [controller, snapshot]);
}

