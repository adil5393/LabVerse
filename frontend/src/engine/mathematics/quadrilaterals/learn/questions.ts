/**
 * Visual references and question factories for the Quadrilaterals lessons.
 * Every text alternative is generated from the same coordinates that are drawn.
 */

import type { FeedbackEntry, VisualQuestion, VisualRef } from '../../../education/types';
import { describeQuad, describeTri, type Pt, type Quad, type Tri } from './figure';

export { ind, num, ord, pick } from '../../../education/builders';

/** What the interactive figure shows. All numbers come from figure.ts. */
export type QuadMode = 'free' | 'parallelogram' | 'midpoint' | 'converse' | 'centroid' | 'triangleAngles' | 'wheel' | 'tiling';

export interface QuadVisualProps {
  mode: QuadMode;
  /** Starting vertices: A, B, C (and D for the four-sided modes). */
  pts: Pt[];
  /** Vertices can be moved (drag, arrow keys or the buttons). Default true. */
  drag?: boolean;
  /** Which readouts a free quadrilateral shows. */
  focus?: 'shape' | 'tests' | 'varignon';
  /** Draw the diagonals (parallelogram and free modes). */
  diagonals?: boolean;
  /** Shade the two triangles made by diagonal AC (the proof of Theorem 1). */
  triangles?: boolean;
  /** Midpoint mode: also draw R and the parallelogram BCRP used in the proof. */
  proof?: boolean;
  /** Converse mode: starting position of P along AB (0 to 1). */
  t?: number;
  /** Converse mode: let the student slide P. */
  slider?: boolean;
}

export const quadVisual = (props: QuadVisualProps, alt: string): VisualRef => ({ kind: 'quadFig', props: props as unknown as Record<string, unknown>, alt });

export const freeVisual = (q: Quad, intro: string, extra: Partial<QuadVisualProps> = {}): VisualRef => quadVisual({ mode: 'free', pts: q, ...extra }, describeQuad(intro, q));
export const triVisual = (mode: QuadMode, t: Tri, intro: string, extra: Partial<QuadVisualProps> = {}): VisualRef => quadVisual({ mode, pts: t, ...extra } as QuadVisualProps, describeTri(intro, t));

export interface GalleryFigure { id: string; label: string; pts: Quad }

export const galleryVisual = (figures: GalleryFigure[], intro: string): VisualRef => ({
  kind: 'quadGallery',
  props: { figures } as unknown as Record<string, unknown>,
  alt: `${intro} ${figures.map((f) => describeQuad(`Figure ${f.label}.`, f.pts)).join(' ')}`,
});

/**
 * "Tap the figure that ...". `why` explains each WRONG figure, so a wrong tap is
 * answered with the property that figure actually has.
 */
export function galleryQ(id: string, prompt: string, figures: GalleryFigure[], intro: string, correctId: string, why: Record<string, [string, string?]>, explanation: string, refresherId?: string): VisualQuestion {
  const feedback: Record<string, FeedbackEntry> = {};
  for (const f of figures) {
    if (f.id === correctId) continue;
    const w = why[f.id];
    if (!w) throw new Error(`question ${id}: no explanation for figure ${f.id}`);
    feedback[f.id] = { message: w[0], misconception: w[1], refresherId };
  }
  return {
    kind: 'visual', id, prompt, visual: galleryVisual(figures, intro), correctId, feedback,
    defaultFeedback: { message: 'Choose one of the figures.' }, explanation,
  };
}
