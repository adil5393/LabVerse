/**
 * Guided Interactive Experiment: "Heating Water — From Ice to Steam"
 * Class 9 Chemistry Laboratory (Milestone C1)
 */

import type { GuidedStep } from './types';

export const HEATING_WATER_EXPERIMENT_STEPS: GuidedStep[] = [
  {
    id: 'step_1_solid_ice',
    title: '1. Crystalline Ice Structure',
    targetTemperatureC: -20,
    targetPhase: 'solid',
    instruction:
      'Observe the particle arrangement at -20°C. Notice that particles are held in a regular crystalline lattice and can only vibrate around fixed positions.',
    scientificObservation:
      'The solid has a definite shape and volume. Interparticle forces are strong, and particles do not switch places.',
    explanation:
      'In solids, kinetic energy is relatively low compared to intermolecular binding forces. Particles vibrate about fixed equilibrium points.',
  },
  {
    id: 'step_2_sensible_heating_solid',
    title: '2. Heating Solid Ice toward 0°C',
    targetTemperatureC: 0,
    targetPhase: 'solid',
    instruction:
      'Turn on Heat (or click "Heat System"). Observe the temperature rising towards 0°C and watch the vibration amplitude increase.',
    scientificObservation:
      'As thermal energy enters, the average speed and vibration amplitude of the ice particles increase continuously.',
    explanation:
      'Sensible heat: Q = m · c_ice · ΔT. Added energy directly increases average kinetic energy and temperature.',
  },
  {
    id: 'step_3_melting_plateau',
    title: '3. Melting Plateau & Latent Heat of Fusion',
    targetTemperatureC: 0,
    targetPhase: 'solid-liquid',
    instruction:
      'Keep heat on at 0°C. Watch the heating curve: notice that temperature remains constant at 0°C even though heat is continually added!',
    scientificObservation:
      'Ice and liquid water coexist at 0°C. The lattice gradually breaks down into fluid droplets while the thermometer stays at 0°C.',
    explanation:
      'Latent heat of fusion: Q = m · L_f. Heat added during a phase change overcomes lattice bonds instead of increasing particle kinetic energy.',
  },
  {
    id: 'step_4_liquid_heating',
    title: '4. Heating Liquid Water (0°C → 100°C)',
    targetTemperatureC: 100,
    targetPhase: 'liquid',
    instruction:
      'Once completely melted, keep heating. Watch the temperature rise through the liquid phase towards 100°C.',
    scientificObservation:
      'Particles are in close contact but flow and slide around each other, taking the shape of the container bottom.',
    explanation:
      'Sensible heat of liquid: Q = m · c_water · ΔT. Added thermal energy increases the speed of liquid particle diffusion.',
  },
  {
    id: 'step_5_boiling_plateau',
    title: '5. Boiling Plateau & Latent Heat of Vaporization',
    targetTemperatureC: 100,
    targetPhase: 'liquid-gas',
    instruction:
      'At 100°C, observe the boiling plateau. Energetic particles break free from the liquid surface into vapor.',
    scientificObservation:
      'Temperature remains steady at 100°C while water converts into steam. Steam particles bounce vigorously throughout the container.',
    explanation:
      'Latent heat of vaporization: Q = m · L_v. A large amount of energy (2260 kJ/kg for water) is required to overcome liquid cohesion completely.',
  },
  {
    id: 'step_6_steam_gas',
    title: '6. Superheated Steam & Gas Expansion',
    targetTemperatureC: 125,
    targetPhase: 'gas',
    instruction:
      'Observe steam at >100°C filling the entire chamber. Now click "Cool System" or move the temperature slider back to observe reversibility!',
    scientificObservation:
      'Particles are widely separated, moving rapidly in straight lines until colliding with walls. Highly compressible.',
    explanation:
      'In the gas phase, intermolecular attraction is negligible compared to thermal kinetic energy. Particles fill any available volume.',
  },
];
