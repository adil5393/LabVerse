/**
 * Visual references for the Two Variables lessons. Alternatives are generated
 * from the same equation that is drawn.
 */

import type { VisualRef } from '../../../education/types';
import { describeLine, makeEq, num, type LinearEq } from './model';

export { ind, num as numQ, ord, pick } from '../../../education/builders';

export type TvMode = 'line' | 'plane' | 'slope';

export interface TvVisualProps {
  mode: TvMode;
  /** a, b, c of ax + by + c = 0 (c is on the LEFT, as in the textbook). */
  eq?: [number, number, number];
  /** Which parameters the student can change. 'md' edits y = mx + d (b is fixed at 1). */
  edit?: 'abc' | 'md' | 'none';
  /** Starting test point. */
  point?: [number, number];
  /** The test point can be moved. Default true. */
  movePoint?: boolean;
  /** Distance the test point moves per key press or button press (default 1). */
  step?: number;
  /** Starting values of the table inputs (x, or y for a vertical line). */
  table?: number[];
  restrict?: 'none' | 'nonneg' | 'whole';
  /** Plane mode: also show the reversed pair (y, x). */
  swap?: boolean;
  /** Plane mode: fixed labelled points. */
  points?: { id: string; x: number; y: number }[];
  /** Slope mode: the two x-values of the marked points. */
  slopeX?: [number, number];
  /** Half-width of the visible window. */
  extent?: number;
  showIntercepts?: boolean;
  /** Highlighted parts from a selected proof step. */
  highlight?: string[];
}

export const toEq = (p: [number, number, number]): LinearEq => makeEq(num(p[0]), num(p[1]), num(p[2]));

export const tvVisual = (props: TvVisualProps, intro: string): VisualRef => {
  const alt = props.eq ? describeLine(intro, toEq(props.eq), props.extent ?? 10) : `${intro} A coordinate plane with x- and y-axes from ${-(props.extent ?? 10)} to ${props.extent ?? 10}.`;
  return { kind: 'tvFig', props: props as unknown as Record<string, unknown>, alt };
};
