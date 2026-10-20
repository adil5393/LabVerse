import type { VisualRegistry } from '../../education/visuals';
import { DerivationVisual } from './DerivationView';
import { EnergyVisual } from './EnergyView';
import { KineticVisual } from './KineticView';
import { LeverVisual, PulleyVisual, RampVisual } from './MachineViews';
import { PowerVisual } from './PowerView';
import { WorkVisual } from './WorkView';

/** Visuals the Chapter 7 lessons can use (registered by VisualRef.kind). */
export const WORK_VISUALS: VisualRegistry = { workLab: WorkVisual, kineticLab: KineticVisual, workDerivation: DerivationVisual, energyLab: EnergyVisual, rampLab: RampVisual, pulleyLab: PulleyVisual, leverLab: LeverVisual, powerLab: PowerVisual };
