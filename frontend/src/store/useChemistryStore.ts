/**
 * Zustand State Store for LabVerse Chemistry Laboratory (Milestone C1)
 *
 * Manages simulation parameters, thermodynamic states, heating/cooling energy,
 * container volume/piston controls, guided experiment workflow, and measurement telemetry.
 */

import { create } from 'zustand';
import type {
  SubstanceId,
  HeatingMode,
  ThermodynamicState,
  SimulationConfig,
  ParticleCountOption,
  SimulationSpeedOption,
  ExperimentMode,
} from '../engine/chemistry/types';
import {
  SUBSTANCES,
  WATER_SUBSTANCE,
} from '../engine/chemistry/substances';
import {
  celsiusToKelvin,
  calculateThermalStateFromEnergy,
  calculateEnergyFromTemperature,
  BASELINE_TEMPERATURE_K,
} from '../engine/chemistry/thermodynamics';
import {
  CHAMBER_WIDTH,
  CHAMBER_HEIGHT_MAX,
  DEFAULT_PISTON_HEIGHT,
  DEFAULT_SAMPLE_MASS_KG,
  DEFAULT_HEAT_POWER_WATTS,
} from '../engine/chemistry/constants';

interface ChemistryState {
  // Selected Substance
  substanceId: SubstanceId;
  sampleMassKg: number;

  // Thermodynamic State
  thermoState: ThermodynamicState;

  // Simulation Configuration
  config: SimulationConfig;

  // Pressure telemetry accumulator
  accumulatedWallImpulse: number;
  impulseWindowSeconds: number;

  // Experiment & Guidance Mode
  experimentMode: ExperimentMode;
  guidedStepIndex: number;

  // Actions
  setSubstance: (id: SubstanceId) => void;
  setTemperature: (tempC: number) => void;
  setHeating: (mode: HeatingMode) => void;
  setHeatPower: (watts: number) => void;
  advanceThermalTime: (dtSeconds: number) => void;
  setPistonHeight: (height: number) => void;
  setParticleCount: (count: ParticleCountOption) => void;
  setSimulationSpeed: (speed: SimulationSpeedOption) => void;
  togglePlayPause: () => void;
  resetExperiment: () => void;
  setExperimentMode: (mode: ExperimentMode) => void;
  setGuidedStep: (index: number) => void;
  toggleVisual: (key: 'showTrails' | 'showVectors' | 'showInteractions') => void;
  recordWallImpulse: (impulse: number, dt: number) => void;
}

function initializeState(substanceId: SubstanceId = 'water'): Omit<
  ChemistryState,
  | 'setSubstance'
  | 'setTemperature'
  | 'setHeating'
  | 'setHeatPower'
  | 'advanceThermalTime'
  | 'setPistonHeight'
  | 'setParticleCount'
  | 'setSimulationSpeed'
  | 'togglePlayPause'
  | 'resetExperiment'
  | 'setExperimentMode'
  | 'setGuidedStep'
  | 'toggleVisual'
  | 'recordWallImpulse'
> {
  const substance = SUBSTANCES[substanceId] || WATER_SUBSTANCE;
  const initialEnergy = 0; // Starts at baseline -20 °C
  const thermalCalc = calculateThermalStateFromEnergy(
    initialEnergy,
    substance,
    DEFAULT_SAMPLE_MASS_KG,
    BASELINE_TEMPERATURE_K
  );

  return {
    substanceId,
    sampleMassKg: DEFAULT_SAMPLE_MASS_KG,
    thermoState: {
      temperatureK: thermalCalc.temperatureK,
      temperatureC: thermalCalc.temperatureC,
      phase: thermalCalc.phase,
      phaseFractions: thermalCalc.phaseFractions,
      accumulatedEnergyJ: initialEnergy,
      heatingState: 'off',
      heatPowerWatts: DEFAULT_HEAT_POWER_WATTS,
    },
    config: {
      particleCount: 100,
      simulationSpeed: 1.0,
      isPaused: false,
      containerWidth: CHAMBER_WIDTH,
      containerHeight: CHAMBER_HEIGHT_MAX,
      pistonHeight: DEFAULT_PISTON_HEIGHT,
      showTrails: false,
      showVectors: false,
      showInteractions: false,
    },
    accumulatedWallImpulse: 0,
    impulseWindowSeconds: 0,
    experimentMode: 'guided',
    guidedStepIndex: 0,
  };
}

export const useChemistryStore = create<ChemistryState>((set, get) => ({
  ...initializeState('water'),

  setSubstance: (id) => {
    const substance = SUBSTANCES[id];
    if (!substance) return;

    // Recalculate thermal state with new substance parameters at current temperature
    const state = get();
    const currentTempK = state.thermoState.temperatureK;
    const newEnergy = calculateEnergyFromTemperature(
      currentTempK,
      substance,
      state.sampleMassKg,
      BASELINE_TEMPERATURE_K
    );
    const thermalCalc = calculateThermalStateFromEnergy(
      newEnergy,
      substance,
      state.sampleMassKg,
      BASELINE_TEMPERATURE_K
    );

    set({
      substanceId: id,
      thermoState: {
        ...state.thermoState,
        temperatureK: thermalCalc.temperatureK,
        temperatureC: thermalCalc.temperatureC,
        phase: thermalCalc.phase,
        phaseFractions: thermalCalc.phaseFractions,
        accumulatedEnergyJ: newEnergy,
      },
    });
  },

  setTemperature: (tempC) => {
    const state = get();
    const substance = SUBSTANCES[state.substanceId];
    const targetTempK = celsiusToKelvin(tempC);

    const targetEnergy = calculateEnergyFromTemperature(
      targetTempK,
      substance,
      state.sampleMassKg,
      BASELINE_TEMPERATURE_K
    );
    const thermalCalc = calculateThermalStateFromEnergy(
      targetEnergy,
      substance,
      state.sampleMassKg,
      BASELINE_TEMPERATURE_K
    );

    set({
      thermoState: {
        ...state.thermoState,
        temperatureK: thermalCalc.temperatureK,
        temperatureC: thermalCalc.temperatureC,
        phase: thermalCalc.phase,
        phaseFractions: thermalCalc.phaseFractions,
        accumulatedEnergyJ: targetEnergy,
      },
    });
  },

  setHeating: (mode) => {
    const normalized = (mode === 'heat' ? 'heating' : mode === 'cool' ? 'cooling' : mode) as HeatingMode;
    set((state) => ({
      thermoState: {
        ...state.thermoState,
        heatingState: normalized,
      },
    }));
  },

  setHeatPower: (watts) =>
    set((state) => ({
      thermoState: {
        ...state.thermoState,
        heatPowerWatts: Math.max(50, Math.min(2000, watts)),
      },
    })),

  advanceThermalTime: (dtSeconds) => {
    const state = get();
    const isHeating = state.thermoState.heatingState === 'heating' || (state.thermoState.heatingState as string) === 'heat';
    const isCooling = state.thermoState.heatingState === 'cooling' || (state.thermoState.heatingState as string) === 'cool';
    if (!isHeating && !isCooling) return;

    const substance = SUBSTANCES[state.substanceId];
    const powerSign = isHeating ? 1 : -1;
    const energyDelta = powerSign * state.thermoState.heatPowerWatts * dtSeconds * state.config.simulationSpeed;

    const newAccumulatedEnergy = Math.max(0, state.thermoState.accumulatedEnergyJ + energyDelta);

    const thermalCalc = calculateThermalStateFromEnergy(
      newAccumulatedEnergy,
      substance,
      state.sampleMassKg,
      BASELINE_TEMPERATURE_K
    );

    set({
      thermoState: {
        ...state.thermoState,
        temperatureK: thermalCalc.temperatureK,
        temperatureC: thermalCalc.temperatureC,
        phase: thermalCalc.phase,
        phaseFractions: thermalCalc.phaseFractions,
        accumulatedEnergyJ: newAccumulatedEnergy,
      },
    });
  },

  setPistonHeight: (height) =>
    set((state) => ({
      config: {
        ...state.config,
        pistonHeight: Math.max(160, Math.min(CHAMBER_HEIGHT_MAX, height)),
      },
    })),

  setParticleCount: (count) =>
    set((state) => ({
      config: {
        ...state.config,
        particleCount: count,
      },
    })),

  setSimulationSpeed: (speed) =>
    set((state) => ({
      config: {
        ...state.config,
        simulationSpeed: speed,
      },
    })),

  togglePlayPause: () =>
    set((state) => ({
      config: {
        ...state.config,
        isPaused: !state.config.isPaused,
      },
    })),

  resetExperiment: () => {
    const state = get();
    set(initializeState(state.substanceId));
  },

  setExperimentMode: (mode) => set({ experimentMode: mode }),

  setGuidedStep: (index) => set({ guidedStepIndex: Math.max(0, index) }),

  toggleVisual: (key) =>
    set((state) => ({
      config: {
        ...state.config,
        [key]: !state.config[key],
      },
    })),

  recordWallImpulse: (impulse, dt) =>
    set((state) => {
      // Rolling average window of ~0.5s for smooth pressure reading
      const decay = Math.exp(-dt / 0.5);
      return {
        accumulatedWallImpulse: state.accumulatedWallImpulse * decay + impulse,
        impulseWindowSeconds: state.impulseWindowSeconds * decay + dt,
      };
    }),
}));
