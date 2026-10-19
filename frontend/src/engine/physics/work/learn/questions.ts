/** Visual references for the Work lessons; every text alternative is generated from the same model that is drawn. */

import type { VisualRef } from '../../../education/types';
import { computeWork, describeWork, type WorkSetup } from '../workModel';

export { ind, num as numQ, pick } from '../../../education/builders';

export interface WorkVisualProps {
  setup: WorkSetup;
  /** Show the controls (force, direction, displacement, mass, surface). */
  editable?: boolean;
  /** How far through the displacement the object is first drawn (0 to 1). */
  progress?: number;
  /** Show the force-displacement graph with the area that is the work. */
  graph?: boolean;
}

/** The Work Laboratory scene, drawn from the model (not a picture). */
export const workVisual = (p: WorkVisualProps, intro: string): VisualRef => ({
  kind: 'workLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeWork(computeWork(p.setup))}`,
});
