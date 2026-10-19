/** Visual references for the Motion lessons; the text alternative is generated from the same path that is drawn. */

import type { VisualRef } from '../../../education/types';
import { addMove, describePath, newPath, type MotionPath } from '../kinematics';

export { ind, num as numQ, ord, pick } from '../../../education/builders';

export type Readout = 'position' | 'distance' | 'displacement' | 'speed' | 'velocity';

export interface MotionVisualProps {
  /** Track range in metres. */
  range: [number, number];
  /** Starting position in metres. */
  start: number;
  /** Targets already travelled, in metres, one per leg (each leg takes 1 s of simulated time). */
  moves: number[];
  /** Optional duration of each leg in seconds (default 1 s each), parallel to `moves`. */
  durations?: number[];
  /** The student can add moves with buttons, a typed position or the keyboard. */
  editable?: boolean;
  show?: Readout[];
  /** Step size of the move buttons in metres. */
  stepM?: number;
  /** Offer play, pause and replay of the recorded path. */
  playback?: boolean;
}

export function pathOf(p: Pick<MotionVisualProps, 'range' | 'start' | 'moves' | 'durations'>): MotionPath {
  let path = newPath(p.start, p.range[0], p.range[1]);
  for (const [i, t] of p.moves.entries()) { const r = addMove(path, t, Math.round((p.durations?.[i] ?? 1) * 1000)); if (!r.ok) throw new Error(r.reason); path = r.path; }
  return path;
}

export const motionVisual = (p: MotionVisualProps, intro: string): VisualRef => ({
  kind: 'motionTrack', props: p as unknown as Record<string, unknown>, alt: describePath(intro, pathOf(p)),
});

import { describeProfile, scenarioById, type GraphKind, type Profile } from '../profile';

export interface GraphVisualProps {
  /** A named scenario of the Graph Studio (see profile.ts). */
  scenario?: string;
  profile?: Profile;
  editable?: boolean;
  graphs?: GraphKind[];
  predict?: boolean;
}

/** A Graph Studio figure; its text alternative is generated from the same profile that draws the graphs. */
export const graphVisual = (p: GraphVisualProps, intro: string): VisualRef => {
  const profile = p.profile ?? scenarioById(p.scenario)?.profile;
  if (!profile) throw new Error(`Unknown graph scenario ${p.scenario}`);
  return { kind: 'motionGraphs', props: p as unknown as Record<string, unknown>, alt: describeProfile(profile, intro) };
};
