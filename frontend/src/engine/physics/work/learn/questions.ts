/** Visual references for the Work lessons; every text alternative is generated from the same model that is drawn. */

import type { VisualRef } from '../../../education/types';
import { computeWork, describeWork, type WorkSetup } from '../workModel';
import { computeKinetic, describeKinetic, type KineticSetup } from '../kineticModel';
import { computeEnergy, describeEnergy, type EnergySetup } from '../energyLab';

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

export interface KineticVisualProps { setup: KineticSetup; editable?: boolean }

/** The Work-Energy Laboratory cart, drawn from the model (not a picture). */
export const kineticVisual = (p: KineticVisualProps, intro: string): VisualRef => ({
  kind: 'kineticLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeKinetic(computeKinetic(p.setup))}`,
});

/** An interactive derivation (see engine/physics/work/derivations.ts). */
export const derivationVisual = (id: string, intro: string): VisualRef => ({
  kind: 'workDerivation', props: { id },
  alt: `${intro} An interactive, step-by-step derivation with a graph drawn from the same numbers: change the values, use Previous step and Next step (or the left and right arrow keys), and supply the missing reasoning where a step asks for it.`,
});

export interface EnergyVisualProps { setup: EnergySetup; editable?: boolean; /** Fraction of the run at which the scene is first drawn (0 to 1). */ fraction?: number }

/** The Energy Laboratory scene, drawn from the model (not a picture). */
export const energyVisual = (p: EnergyVisualProps, intro: string): VisualRef => ({
  kind: 'energyLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describeEnergy(computeEnergy(p.setup))}`,
});
