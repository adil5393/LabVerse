import { describe, it, expect, beforeEach } from 'vitest';
import { useChemistryStore } from '../../../store/useChemistryStore';

describe('useChemistryStore - Milestone C1', () => {
  beforeEach(() => {
    useChemistryStore.getState().resetExperiment();
  });

  it('initializes with default water substance at -20°C in solid phase', () => {
    const state = useChemistryStore.getState();
    expect(state.substanceId).toBe('water');
    expect(state.thermoState.temperatureC).toBeCloseTo(-20, 1);
    expect(state.thermoState.phase).toBe('solid');
    expect(state.config.particleCount).toBe(100);
    expect(state.thermoState.heatingState).toBe('off');
  });

  it('switches substance and re-computes initial thermodynamic state', () => {
    const store = useChemistryStore.getState();
    store.setSubstance('generic');

    const updated = useChemistryStore.getState();
    expect(updated.substanceId).toBe('generic');
    expect(updated.thermoState.temperatureC).toBeCloseTo(-20, 1);
    expect(updated.thermoState.phase).toBe('solid');
  });

  it('sets temperature directly and synchronizes thermal energy and phase', () => {
    const store = useChemistryStore.getState();

    // Set to 50°C (Liquid water)
    store.setTemperature(50);
    let updated = useChemistryStore.getState();
    expect(updated.thermoState.temperatureC).toBeCloseTo(50, 1);
    expect(updated.thermoState.phase).toBe('liquid');
    expect(updated.thermoState.phaseFractions.liquid).toBe(1.0);

    // Set to 120°C (Gas steam)
    store.setTemperature(120);
    updated = useChemistryStore.getState();
    expect(updated.thermoState.temperatureC).toBeCloseTo(120, 1);
    expect(updated.thermoState.phase).toBe('gas');
    expect(updated.thermoState.phaseFractions.gas).toBe(1.0);
  });

  it('advances thermal time when heating is active', () => {
    const store = useChemistryStore.getState();
    store.setHeating('heat');

    const initialEnergy = useChemistryStore.getState().thermoState.accumulatedEnergyJ;
    // Advance by 10 seconds of 250 W heating => +2500 J
    store.advanceThermalTime(10);

    const updated = useChemistryStore.getState();
    expect(updated.thermoState.accumulatedEnergyJ).toBeCloseTo(initialEnergy + 2500, 0);
    expect(updated.thermoState.temperatureC).toBeGreaterThan(-20);
  });

  it('updates container volume (piston height) and visual diagnostic toggles', () => {
    const store = useChemistryStore.getState();
    store.setPistonHeight(250);
    expect(useChemistryStore.getState().config.pistonHeight).toBe(250);

    store.toggleVisual('showVectors');
    expect(useChemistryStore.getState().config.showVectors).toBe(true);

    store.toggleVisual('showTrails');
    expect(useChemistryStore.getState().config.showTrails).toBe(true);
  });

  it('progresses guided experiment steps cleanly', () => {
    const store = useChemistryStore.getState();
    expect(store.guidedStepIndex).toBe(0);

    store.setGuidedStep(2); // Melting plateau step
    expect(useChemistryStore.getState().guidedStepIndex).toBe(2);
  });
});
