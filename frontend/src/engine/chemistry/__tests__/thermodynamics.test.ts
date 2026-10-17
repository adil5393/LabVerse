import { describe, it, expect } from 'vitest';
import {
  celsiusToKelvin,
  kelvinToCelsius,
  calculateThermalStateFromEnergy,
  calculateEnergyFromTemperature,
  getHeatingCurveKeypoints,
  BASELINE_TEMPERATURE_K,
} from '../thermodynamics';
import { WATER_SUBSTANCE, GENERIC_SUBSTANCE } from '../substances';

describe('Thermodynamics Engine - Milestone C1', () => {
  const sampleMass = 0.1; // 100 grams

  describe('Temperature Conversions', () => {
    it('converts between Celsius and Kelvin with high precision', () => {
      expect(celsiusToKelvin(0)).toBeCloseTo(273.15, 2);
      expect(celsiusToKelvin(100)).toBeCloseTo(373.15, 2);
      expect(celsiusToKelvin(-20)).toBeCloseTo(253.15, 2);

      expect(kelvinToCelsius(273.15)).toBeCloseTo(0, 2);
      expect(kelvinToCelsius(373.15)).toBeCloseTo(100, 2);
    });
  });

  describe('Sensible and Latent Heat Calculations for Water', () => {
    it('correctly calculates baseline solid state at 0 J (starts at -20°C)', () => {
      const state = calculateThermalStateFromEnergy(0, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);
      expect(state.phase).toBe('solid');
      expect(state.temperatureC).toBeCloseTo(-20, 1);
      expect(state.phaseFractions.solid).toBe(1.0);
      expect(state.phaseFractions.liquid).toBe(0.0);
      expect(state.phaseFractions.gas).toBe(0.0);
    });

    it('heats solid ice sensibly up to melting point 0°C (Q = m * c_solid * ΔT)', () => {
      // For 0.1 kg of ice from -20°C to 0°C: Q = 0.1 * 2090 * 20 = 4180 J
      const qToMelt = 0.1 * WATER_SUBSTANCE.specificHeatSolid * 20;
      expect(qToMelt).toBeCloseTo(4180, 0);

      const stateAtMelt = calculateThermalStateFromEnergy(qToMelt, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);
      expect(stateAtMelt.temperatureC).toBeCloseTo(0, 1);
      expect(stateAtMelt.phase).toBe('solid');
    });

    it('holds temperature constant at 0°C during the melting plateau (Latent Heat of Fusion)', () => {
      const qToMelt = 0.1 * WATER_SUBSTANCE.specificHeatSolid * 20; // 4180 J
      const qLatentFusion = sampleMass * WATER_SUBSTANCE.latentHeatFusion; // 0.1 * 334000 = 33400 J

      // Halfway through melting:
      const qMidMelt = qToMelt + qLatentFusion * 0.5;
      const stateMidMelt = calculateThermalStateFromEnergy(qMidMelt, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);

      expect(stateMidMelt.phase).toBe('solid-liquid');
      expect(stateMidMelt.temperatureC).toBeCloseTo(0, 1); // Temperature MUST remain 0°C!
      expect(stateMidMelt.phaseFractions.liquid).toBeCloseTo(0.5, 2);
      expect(stateMidMelt.phaseFractions.solid).toBeCloseTo(0.5, 2);

      // Just before melting completes:
      const qAlmostMelted = qToMelt + qLatentFusion * 0.9;
      const stateAlmostMelted = calculateThermalStateFromEnergy(qAlmostMelted, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);
      expect(stateAlmostMelted.phase).toBe('solid-liquid');
      expect(stateAlmostMelted.temperatureC).toBeCloseTo(0, 1);
      expect(stateAlmostMelted.phaseFractions.liquid).toBeCloseTo(0.9, 2);
    });

    it('heats liquid water sensibly from 0°C to 100°C', () => {
      const qMeltComplete = 0.1 * WATER_SUBSTANCE.specificHeatSolid * 20 + sampleMass * WATER_SUBSTANCE.latentHeatFusion;
      // Liquid sensible heat for 50°C rise: Q = 0.1 * 4184 * 50 = 20920 J
      const q50C = qMeltComplete + 0.1 * WATER_SUBSTANCE.specificHeatLiquid * 50;

      const state50C = calculateThermalStateFromEnergy(q50C, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);
      expect(state50C.phase).toBe('liquid');
      expect(state50C.temperatureC).toBeCloseTo(50, 1);
      expect(state50C.phaseFractions.liquid).toBe(1.0);
    });

    it('holds temperature constant at 100°C during the boiling plateau (Latent Heat of Vaporization)', () => {
      const keypoints = getHeatingCurveKeypoints(WATER_SUBSTANCE, sampleMass);

      // 50% through boiling plateau:
      const qMidBoil = keypoints.qToBoiling + (keypoints.qBoilComplete - keypoints.qToBoiling) * 0.5;
      const stateMidBoil = calculateThermalStateFromEnergy(qMidBoil, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);

      expect(stateMidBoil.phase).toBe('liquid-gas');
      expect(stateMidBoil.temperatureC).toBeCloseTo(100, 1); // Temperature MUST remain 100°C!
      expect(stateMidBoil.phaseFractions.gas).toBeCloseTo(0.5, 2);
      expect(stateMidBoil.phaseFractions.liquid).toBeCloseTo(0.5, 2);
    });

    it('heats steam (gas) above 100°C', () => {
      const keypoints = getHeatingCurveKeypoints(WATER_SUBSTANCE, sampleMass);
      // Sensible gas heating for +20°C (120°C):
      const q120C = keypoints.qBoilComplete + sampleMass * WATER_SUBSTANCE.specificHeatGas * 20;

      const state120C = calculateThermalStateFromEnergy(q120C, WATER_SUBSTANCE, sampleMass, BASELINE_TEMPERATURE_K);
      expect(state120C.phase).toBe('gas');
      expect(state120C.temperatureC).toBeCloseTo(120, 1);
      expect(state120C.phaseFractions.gas).toBe(1.0);
    });
  });

  describe('Bidirectional Consistency (Reversibility)', () => {
    it('accurately reproduces temperatures across roundtrip energy conversions', () => {
      const testTempsC = [-15, -5, 25, 60, 80, 120];

      for (const tC of testTempsC) {
        const energy = calculateEnergyFromTemperature(celsiusToKelvin(tC), WATER_SUBSTANCE, sampleMass);
        const state = calculateThermalStateFromEnergy(energy, WATER_SUBSTANCE, sampleMass);
        expect(state.temperatureC).toBeCloseTo(tC, 1);
      }
    });
  });

  describe('Generic Educational Substance', () => {
    it('behaves with distinct melting and boiling points (20°C and 80°C)', () => {
      expect(GENERIC_SUBSTANCE.meltingPointC).toBe(20);
      expect(GENERIC_SUBSTANCE.boilingPointC).toBe(80);

      const keypoints = getHeatingCurveKeypoints(GENERIC_SUBSTANCE, sampleMass);
      expect(keypoints.tempMeltingC).toBe(20);
      expect(keypoints.tempBoilingC).toBe(80);

      // Liquid state at 50°C
      const energy50C = calculateEnergyFromTemperature(celsiusToKelvin(50), GENERIC_SUBSTANCE, sampleMass);
      const state50C = calculateThermalStateFromEnergy(energy50C, GENERIC_SUBSTANCE, sampleMass);
      expect(state50C.phase).toBe('liquid');
      expect(state50C.temperatureC).toBeCloseTo(50, 1);
    });
  });
});
