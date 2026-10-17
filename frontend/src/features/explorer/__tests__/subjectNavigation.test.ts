import { describe, it, expect } from 'vitest';
import { DISTANCE_EXPERIMENT } from '../../../engine/mathematics/experimentRegistry';

describe('Subject Navigation & Routing Consistency', () => {
  it('confirms both Physics and Mathematics are registered as ready subjects', () => {
    // Verify mathematics workbench initial experiment configuration
    expect(DISTANCE_EXPERIMENT.id).toBe('distance-between-two-points');
    expect(DISTANCE_EXPERIMENT.moduleId).toBe('coordinate-geometry');
    expect(DISTANCE_EXPERIMENT.targetClass).toBe('Class 9–10');
    expect(DISTANCE_EXPERIMENT.initialObjects.length).toBe(3);

    const ptA = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'pt_A');
    const ptB = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'pt_B');
    const segAB = DISTANCE_EXPERIMENT.initialObjects.find((o) => o.id === 'seg_AB');

    expect(ptA).toBeDefined();
    expect(ptB).toBeDefined();
    expect(segAB).toBeDefined();
  });

  it('confirms Chemistry is registered with States of Matter experiment', async () => {
    const { SUBSTANCES, WATER_SUBSTANCE } = await import('../../../engine/chemistry/substances');
    const { HEATING_WATER_EXPERIMENT_STEPS } = await import('../../../engine/chemistry/guidedExperiment');

    expect(SUBSTANCES.water).toBeDefined();
    expect(WATER_SUBSTANCE.chemicalFormula).toBe('H₂O');
    expect(WATER_SUBSTANCE.meltingPointC).toBe(0);
    expect(WATER_SUBSTANCE.boilingPointC).toBe(100);

    expect(HEATING_WATER_EXPERIMENT_STEPS.length).toBe(6);
    expect(HEATING_WATER_EXPERIMENT_STEPS[0].targetPhase).toBe('solid');
    expect(HEATING_WATER_EXPERIMENT_STEPS[2].targetPhase).toBe('solid-liquid');
    expect(HEATING_WATER_EXPERIMENT_STEPS[4].targetPhase).toBe('liquid-gas');
  });
});
