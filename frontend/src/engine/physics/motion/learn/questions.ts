/** Visual references for the Motion lessons; the text alternative is generated from the same path that is drawn. */

import type { VisualRef } from '../../../education/types';
import { addMove, describePath, newPath, type MotionPath } from '../kinematics';

export { ind, num as numQ, ord, pick } from '../../../education/builders';

export type Readout = 'position' | 'distance' | 'displacement';

export interface MotionVisualProps {
  /** Track range in metres. */
  range: [number, number];
  /** Starting position in metres. */
  start: number;
  /** Targets already travelled, in metres, one per leg (each leg takes 1 s of simulated time). */
  moves: number[];
  /** The student can add moves with buttons, a typed position or the keyboard. */
  editable?: boolean;
  show?: Readout[];
  /** Step size of the move buttons in metres. */
  stepM?: number;
  /** Offer play, pause and replay of the recorded path. */
  playback?: boolean;
}

export function pathOf(p: Pick<MotionVisualProps, 'range' | 'start' | 'moves'>): MotionPath {
  let path = newPath(p.start, p.range[0], p.range[1]);
  for (const t of p.moves) { const r = addMove(path, t); if (!r.ok) throw new Error(r.reason); path = r.path; }
  return path;
}

export const motionVisual = (p: MotionVisualProps, intro: string): VisualRef => ({
  kind: 'motionTrack', props: p as unknown as Record<string, unknown>, alt: describePath(intro, pathOf(p)),
});
