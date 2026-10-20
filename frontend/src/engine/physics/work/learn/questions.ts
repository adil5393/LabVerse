/** Visual references for the Work lessons; every text alternative is generated from the same model that is drawn. */

import type { VisualRef } from '../../../education/types';
import { computeWork, describeWork, type WorkSetup } from '../workModel';
import { computeKinetic, describeKinetic, type KineticSetup } from '../kineticModel';
import { computeEnergy, describeEnergy, type EnergySetup } from '../energyLab';
import { computeLever, computePulley, computeRamp, type LeverSetup, type PulleySetup, type RampSetup } from '../machines';
import { computePower, describePower, type PowerSetup } from '../power';

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

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '\u2212');

export interface RampVisualProps { setup: RampSetup; editable?: boolean; progress?: number }
/** The inclined plane scene, drawn from the model. */
export const rampVisual = (p: RampVisualProps, intro: string): VisualRef => {
  const r = computeRamp(p.setup);
  return { kind: 'rampLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${r.valid ? `A ${f2(p.setup.massKg)} kg load is pushed up a ${f2(p.setup.length)} m ramp to a height of ${f2(p.setup.height)} m (width ${f2(r.width)} m). Effort along the ramp ${f2(r.effort)} N for a load of ${f2(r.load)} N: mechanical advantage ${f2(r.actualMA)}. Work done ${f2(r.inputWork)} J, useful work ${f2(r.outputWork)} J, thermal energy ${f2(r.lost)} J.` : `Not valid: ${r.reason}`}` };
};

export interface PulleyVisualProps { setup: PulleySetup; editable?: boolean; progress?: number }
/** The pulley system scene, drawn from the model. */
export const pulleyVisual = (p: PulleyVisualProps, intro: string): VisualRef => {
  const r = computePulley(p.setup);
  return { kind: 'pulleyLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${r.valid ? `A ${f2(p.setup.massKg)} kg load (${f2(r.load)} N) is raised ${f2(p.setup.lift)} m by ${p.setup.strands} supporting strand${p.setup.strands > 1 ? 's' : ''}: effort ${f2(r.effort)} N, rope pulled ${f2(r.ropePulled)} m, work done ${f2(r.inputWork)} J, useful work ${f2(r.outputWork)} J.` : `Not valid: ${r.reason}`}` };
};

export interface LeverVisualProps { setup: LeverSetup; editable?: boolean; progress?: number }
/** The lever scene, drawn from the model. */
export const leverVisual = (p: LeverVisualProps, intro: string): VisualRef => {
  const r = computeLever(p.setup);
  return { kind: 'leverLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${r.valid ? `Class ${p.setup.kind} lever: load ${f2(r.load)} N at ${f2(p.setup.loadArm)} m, effort ${f2(p.setup.effort)} N at ${f2(p.setup.effortArm)} m. The balancing effort is ${f2(r.balanceEffort)} N (mechanical advantage ${f2(r.mechanicalAdvantage)}); the lever ${r.state}.` : `Not valid: ${r.reason}`}` };
};

export interface PowerVisualProps { setup: PowerSetup; editable?: boolean }
/** The Power Laboratory scene, drawn from the model. */
export const powerVisual = (p: PowerVisualProps, intro: string): VisualRef => ({ kind: 'powerLab', props: p as unknown as Record<string, unknown>, alt: `${intro} ${describePower(computePower(p.setup))}` });
