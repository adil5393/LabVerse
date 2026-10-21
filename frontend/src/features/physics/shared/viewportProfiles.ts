/**
 * Viewport presentation profiles for Physics simulations.
 * Distinguishes between desktop profile (preserving full apparatus and widescreen view)
 * and mobile profile (tailored framing, legible minimum fonts, prominent touch targets).
 */

import { useState, useEffect, type RefObject } from 'react';

export type ViewportProfileType = 'desktop' | 'mobile';

export interface ViewportProfile {
  type: ViewportProfileType;
  isMobile: boolean;
  width: number;
  height: number;
  minTouchTarget: number;
  minFontSize: number;
  arrowStrokeWidth: number;
}

export const DESKTOP_PROFILE: ViewportProfile = {
  type: 'desktop',
  isMobile: false,
  width: 1000,
  height: 450,
  minTouchTarget: 32,
  minFontSize: 11,
  arrowStrokeWidth: 3,
};

export const MOBILE_PROFILE: ViewportProfile = {
  type: 'mobile',
  isMobile: true,
  width: 420,
  height: 320,
  minTouchTarget: 44,
  minFontSize: 13,
  arrowStrokeWidth: 4,
};

export const MOBILE_BREAKPOINT_PX = 640;

/**
 * Hook to observe container dimensions and determine whether to use the
 * mobile or desktop viewport profile.
 */
export function useViewportProfile(
  containerRef: RefObject<Element | null>,
  breakpoint = MOBILE_BREAKPOINT_PX
): ViewportProfile {
  const [profile, setProfile] = useState<ViewportProfile>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < breakpoint) {
      return {
        ...MOBILE_PROFILE,
        width: window.innerWidth,
        height: Math.round(window.innerWidth * 0.75),
      };
    }
    return DESKTOP_PROFILE;
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateFromRect = (rect: DOMRectReadOnly | DOMRect) => {
      const w = rect.width;
      const h = rect.height;
      if (w <= 0) return;

      if (w < breakpoint) {
        setProfile({
          type: 'mobile',
          isMobile: true,
          width: Math.round(w),
          height: Math.round(h > 0 ? h : w * 0.75),
          minTouchTarget: 44,
          minFontSize: 13,
          arrowStrokeWidth: 4,
        });
      } else {
        setProfile({
          type: 'desktop',
          isMobile: false,
          width: Math.round(w),
          height: Math.round(h > 0 ? h : 450),
          minTouchTarget: 32,
          minFontSize: 11,
          arrowStrokeWidth: 3,
        });
      }
    };

    // Initial check
    updateFromRect(el.getBoundingClientRect());

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => {
        if (!entries[0]) return;
        updateFromRect(entries[0].contentRect);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [containerRef, breakpoint]);

  return profile;
}
