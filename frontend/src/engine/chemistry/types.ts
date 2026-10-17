/**
 * Core Type Definitions for LabVerse Chemistry Laboratory (Milestone C1)
 * States of Matter & Particle Simulation
 */

export type SubstanceId = 'generic' | 'water';

export type PhaseId =
  | 'solid'
  | 'solid-liquid'
  | 'liquid'
  | 'liquid-gas'
  | 'gas';

export type HeatingMode = 'heating' | 'cooling' | 'off' | 'heat' | 'cool';

export interface SubstanceDefinition {
  id: SubstanceId;
  name: string;
  chemicalFormula: string;
  isEducationalGeneric: boolean;
  description: string;
  assumptions: string;
  
  // Thermodynamic parameters at 1 atm
  meltingPointK: number;
  boilingPointK: number;
  meltingPointC: number;
  boilingPointC: number;
  specificHeatSolid: number;    // J / (kg * K)
  specificHeatLiquid: number;   // J / (kg * K)
  specificHeatGas: number;      // J / (kg * K)
  latentHeatFusion: number;     // J / kg
  latentHeatVaporization: number; // J / kg
  
  // Molecular visualization parameters
  particleRadius: number;       // simulation space units
  particleMass: number;         // atomic mass units
  particleColor: string;
  color: string;
  glowColor: string;
  liquidViscosityFactor: number;
}

export interface PhaseFractions {
  solid: number;  // 0.0 to 1.0
  liquid: number; // 0.0 to 1.0
  gas: number;    // 0.0 to 1.0
}

export interface ThermodynamicState {
  temperatureK: number;
  temperatureC: number;
  phase: PhaseId;
  phaseFractions: PhaseFractions;
  accumulatedEnergyJ: number; // Energy added relative to starting baseline (-20°C for water)
  heatingState: HeatingMode;
  heatPowerWatts: number;     // Energy input/output rate in J/s
}

export type ParticleCountOption = 50 | 100 | 200 | 400;
export type SimulationSpeedOption = 0.25 | 0.5 | 1.0 | 2.0;

export interface SimulationConfig {
  particleCount: ParticleCountOption;
  simulationSpeed: SimulationSpeedOption;
  isPaused: boolean;
  
  // Chamber geometry in simulation coordinates
  containerWidth: number;
  containerHeight: number; // Full height
  pistonHeight: number;    // Current effective height (volume control)
  
  // Visual overlays
  showTrails: boolean;
  showVectors: boolean;
  showInteractions: boolean;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
  radius: number;
  mass: number;
  // Equilibrium lattice site for solids
  latticeX?: number;
  latticeY?: number;
  // Local state marker (e.g. for coexistence)
  localPhase: 'solid' | 'liquid' | 'gas';
}

export type ExperimentMode = 'explore' | 'guided';

export interface GuidedStep {
  id: string;
  title: string;
  targetTemperatureC: number;
  targetPhase: PhaseId;
  instruction: string;
  scientificObservation: string;
  explanation: string;
}
