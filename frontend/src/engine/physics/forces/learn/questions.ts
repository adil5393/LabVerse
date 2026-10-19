/** Visual references for the Forces lessons; every text alternative is generated from the model or arrows that are drawn. */

import type { VisualRef } from '../../../education/types';
import { describeDiagram, netArrow, type Arrow } from '../forceDiagram';
import { explain, sampleAtTime, type Setup } from '../forceModel';
import { diagramOf } from '../forceDiagram';

export { ind, num as numQ, pick } from '../../../education/builders';

export interface ForceArrowSpec { label: string; by: string; magnitude: number; direction: 'left' | 'right' | 'up' | 'down' }

export interface ArrowsVisualProps {
  /** The object the forces act on (drawn as a labelled box). */
  object: string;
  forces: ForceArrowSpec[];
  /** Start with the net-force arrow shown. */
  showNet?: boolean;
}

export const toArrows = (object: string, forces: ForceArrowSpec[]): Arrow[] =>
  forces.map((f, i) => ({
    id: `f${i}`, kind: f.direction === 'up' ? 'normal' : f.direction === 'down' ? 'weight' : 'applied', label: f.label, by: f.by, on: object, magnitude: f.magnitude, direction: f.direction,
    horizontal: f.direction === 'right' ? f.magnitude : f.direction === 'left' ? -f.magnitude : 0,
  }));

/** Generic force arrows on one object (not tied to the cart model). */
export const arrowsVisual = (p: ArrowsVisualProps, intro: string): VisualRef => {
  const arrows = toArrows(p.object, p.forces);
  return { kind: 'forceArrows', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeDiagram(arrows, netArrow(arrows), { a: 0 })}` };
};

export interface CartVisualProps {
  setup: Setup;
  /** The simulated time shown first (s). */
  t?: number;
  /** Controls to change the forces, mass, surface and starting velocity. */
  editable?: boolean;
  showNet?: boolean;
}

/** The Force Laboratory cart, drawn from the model (not a picture). */
export const cartVisual = (p: CartVisualProps, intro: string): VisualRef => {
  const s = sampleAtTime(p.setup, p.t ?? 0, 20);
  return { kind: 'forceCart', props: p as unknown as Record<string, unknown>, alt: `${intro} ${diagramOf(s).text} ${explain(p.setup, s)}` };
};
