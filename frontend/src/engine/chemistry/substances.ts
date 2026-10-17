/**
 * Substance Definitions for LabVerse Chemistry Laboratory
 *
 * Provides Mode A (Generic Educational Substance) and Mode B (Water).
 */

import type { SubstanceDefinition, SubstanceId } from './types';
import { ZERO_CELSIUS_IN_KELVIN } from './constants';

export const GENERIC_SUBSTANCE: SubstanceDefinition = {
  id: 'generic',
  name: 'Generic Substance',
  chemicalFormula: 'X',
  isEducationalGeneric: true,
  description:
    'A conceptual material model designed for exploring classical states of matter, interparticle spacing, and phase transitions without complex molecular bonding anomalies.',
  assumptions:
    'Constant pressure (1 atm). Particles interact via idealized short-range repulsion and cohesive attraction. Thermal transitions follow idealized first-order latent heat plateaus.',

  meltingPointK: ZERO_CELSIUS_IN_KELVIN + 20, // 20 °C
  boilingPointK: ZERO_CELSIUS_IN_KELVIN + 80, // 80 °C
  meltingPointC: 20,
  boilingPointC: 80,

  specificHeatSolid: 2000,    // J / (kg * K)
  specificHeatLiquid: 4000,   // J / (kg * K)
  specificHeatGas: 2000,      // J / (kg * K)

  latentHeatFusion: 300000,   // 300 kJ/kg
  latentHeatVaporization: 2000000, // 2000 kJ/kg

  particleRadius: 7.5,
  particleMass: 1.0,
  particleColor: '#38bdf8', // Vibrant sky blue
  color: '#38bdf8',
  glowColor: 'rgba(56, 189, 248, 0.4)',
  liquidViscosityFactor: 0.95,
};

export const WATER_SUBSTANCE: SubstanceDefinition = {
  id: 'water',
  name: 'Water',
  chemicalFormula: 'H₂O',
  isEducationalGeneric: false,
  description:
    'Educational reference substance at 1 atm with accurate specific heat capacities for ice, liquid water, and steam, and realistic latent heats of fusion and vaporization.',
  assumptions:
    'Constant pressure reference model (1 atm). Note: Water molecules have hydrogen-bonding networks and density anomalies that are treated conceptually in Class 9 Chemistry. Visual particle motion demonstrates state organization, spacing, and velocities.',

  meltingPointK: ZERO_CELSIUS_IN_KELVIN, // 0 °C
  boilingPointK: ZERO_CELSIUS_IN_KELVIN + 100, // 100 °C
  meltingPointC: 0,
  boilingPointC: 100,

  // Standard thermodynamic reference constants
  specificHeatSolid: 2090,    // Ice: ~2.09 kJ/(kg*K)
  specificHeatLiquid: 4184,   // Liquid: ~4.184 kJ/(kg*K)
  specificHeatGas: 2010,      // Steam: ~2.01 kJ/(kg*K)

  latentHeatFusion: 334000,   // Ice -> Water: 334 kJ/kg
  latentHeatVaporization: 2260000, // Water -> Steam: 2260 kJ/kg

  particleRadius: 7.0,
  particleMass: 18.0, // 18 g/mol relative atomic mass
  particleColor: '#0ea5e9', // Aquatic cyan-blue
  color: '#0ea5e9',
  glowColor: 'rgba(14, 165, 233, 0.4)',
  liquidViscosityFactor: 0.97,
};

export const SUBSTANCES: Record<SubstanceId, SubstanceDefinition> = {
  generic: GENERIC_SUBSTANCE,
  water: WATER_SUBSTANCE,
};
