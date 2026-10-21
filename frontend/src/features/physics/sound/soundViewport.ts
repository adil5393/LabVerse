/**
 * Presentation profiles for the Sound laboratories (SND-1). The PHYSICAL STATE (the wave, the vibration, the clock) is one thing
 * and is shared by every screen; what differs is how it is PRESENTED: camera framing (how much of the tube is in view), the
 * geometry of the drawing, how many particles and rows are drawn, how large the labels are, how the graph is laid out, and where
 * the controls and measurements sit. The mobile profile is designed for 320 to 430 px wide screens; the desktop profile keeps the
 * whole tube in view. Nothing in the physics modules knows which profile is in use.
 *
 * Text sizes below are in SVG units, drawn at about 1 px per unit (the viewBox width is the intended width, and the drawing never
 * grows beyond it), so a label of 13 units is about 13 px; at the narrowest phone (320 px, with 16 px gutters) the mobile drawing
 * is shown at 96 % so its smallest text is still about 12.5 px. Minimum label size is 13 on mobile and 12 on desktop.
 */

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { PARTICLE_SPACING_M, TUBE_LENGTH_M } from '../../../engine/physics/sound/wave';

export type SoundProfile = 'mobile' | 'desktop';

/**
 * Below this width the mobile presentation is used. The width that counts is the width of the laboratory or figure ITSELF (its
 * container), not the window: a lesson figure sits in a half-width column on a wide screen and needs the mobile drawing there.
 */
export const SOUND_MOBILE_MAX_PX = 560;
/** At or above this container width the controls sit beside the picture; below it they sit under it. */
export const SOUND_TWO_COLUMN_MIN_PX = 900;

export interface WavePresentation {
  sceneW: number;
  sceneH: number;
  graphH: number;
  marginL: number;
  marginR: number;
  /** The stretch of the tube (in metres) that is in view. */
  camera: readonly [number, number];
  /** Rows of particles drawn (the particles of a row are every `rows`-th one). */
  rows: number;
  radius: number;
  font: number;
  small: number;
  /** C and R letters are drawn only when neighbours are at least this many px apart. */
  labelMinGapPx: number;
  markLabel: string;
  restLabel: string;
}

export interface VibrationPresentation { w: number; h: number; font: number; small: number; envelopeH: number }

export interface SoundPresentation {
  profile: SoundProfile;
  wave: WavePresentation;
  vib: VibrationPresentation;
  /** Where controls and measurements go. */
  layout: { controlsBelow: boolean; measurementsCollapsed: boolean; stickyCanvas: boolean; minTouchPx: number };
}

export const DESKTOP: SoundPresentation = {
  profile: 'desktop',
  wave: { sceneW: 720, sceneH: 215, graphH: 230, marginL: 56, marginR: 16, camera: [0, TUBE_LENGTH_M], rows: 3, radius: 3.2, font: 13, small: 12, labelMinGapPx: 26, markLabel: 'marked particle', restLabel: 'rest position' },
  vib: { w: 720, h: 200, font: 13, small: 12, envelopeH: 150 },
  layout: { controlsBelow: false, measurementsCollapsed: false, stickyCanvas: false, minTouchPx: 36 },
};

export const MOBILE: SoundPresentation = {
  profile: 'mobile',
  wave: { sceneW: 300, sceneH: 205, graphH: 200, marginL: 44, marginR: 10, camera: [0, TUBE_LENGTH_M / 2], rows: 2, radius: 4, font: 14, small: 13, labelMinGapPx: 30, markLabel: 'marked', restLabel: 'rest' },
  vib: { w: 300, h: 200, font: 14, small: 13, envelopeH: 130 },
  layout: { controlsBelow: true, measurementsCollapsed: true, stickyCanvas: true, minTouchPx: 44 },
};

export const profileForWidth = (widthPx: number): SoundProfile => (widthPx < SOUND_MOBILE_MAX_PX ? 'mobile' : 'desktop');
export const presentationFor = (profile: SoundProfile): SoundPresentation => (profile === 'mobile' ? MOBILE : DESKTOP);

/** x position (in the SVG) of a distance along the tube, for a presentation. */
export const xToPx = (p: WavePresentation, x: number): number => {
  const [from, to] = p.camera;
  return p.marginL + ((x - from) / (to - from)) * (p.sceneW - p.marginL - p.marginR);
};

/** Pixels per metre for a presentation (the density of the picture). */
export const pxPerMetre = (p: WavePresentation): number => (p.sceneW - p.marginL - p.marginR) / (p.camera[1] - p.camera[0]);

/** How many particles are in view (all rows together). */
export const particlesInView = (p: WavePresentation): number => Math.round((p.camera[1] - p.camera[0]) / PARTICLE_SPACING_M) + 1;

/** Before the container can be measured (first render, server, tests) the window width less the page gutters is the best guess. */
const guessWidth = (): number => (typeof window === 'undefined' ? 1248 : window.innerWidth - 32);

/**
 * The presentation for the width of the element it is attached to: put `ref` on the root element of a laboratory or figure.
 * Follows resizes and rotation (ResizeObserver, with a window-resize fallback).
 */
export function useContainerPresentation<T extends HTMLElement = HTMLDivElement>(): { ref: RefObject<T | null>; pres: SoundPresentation; width: number; twoColumn: boolean } {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number>(guessWidth);
  useLayoutEffect(() => {
    const el = ref.current;
    const measure = () => { const w = el?.getBoundingClientRect().width ?? 0; setWidth(w > 0 ? w : guessWidth()); };
    measure();
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(measure); ro.observe(el); }
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', measure);
    return () => { ro?.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('orientationchange', measure); };
  }, []);
  return { ref, pres: presentationFor(profileForWidth(width)), width, twoColumn: width >= SOUND_TWO_COLUMN_MIN_PX };
}
