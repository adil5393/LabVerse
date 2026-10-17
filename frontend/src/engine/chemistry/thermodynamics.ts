/**
 * Thermodynamics and Phase Transition Engine for LabVerse Chemistry Laboratory
 *
 * Implements calibrated sensible heat (Q = mcΔT) and latent heat plateaus
 * (Q = mL_f and Q = mL_v) for solid, liquid, gas, and coexistence states.
 */

import type { PhaseFractions, PhaseId, SubstanceDefinition } from './types';
import { ZERO_CELSIUS_IN_KELVIN } from './constants';

export const BASELINE_TEMPERATURE_K = ZERO_CELSIUS_IN_KELVIN - 20; // -20 °C (253.15 K)

export function celsiusToKelvin(c: number): number {
  return Number((c + ZERO_CELSIUS_IN_KELVIN).toFixed(2));
}

export function kelvinToCelsius(k: number): number {
  return Number((k - ZERO_CELSIUS_IN_KELVIN).toFixed(2));
}

export interface ThermalStateCalculation {
  temperatureK: number;
  temperatureC: number;
  phase: PhaseId;
  phaseFractions: PhaseFractions;
  energyJ: number;
  zone: 'solid' | 'melting' | 'liquid' | 'boiling' | 'gas';
  description: string;
}

/**
 * Calculates the exact temperature and phase state from total accumulated energy added
 * relative to the baseline state (Solid at BASELINE_TEMPERATURE_K).
 */
export function calculateThermalStateFromEnergy(
  energyAddedJ: number,
  substance: SubstanceDefinition,
  massKg: number,
  baselineTempK: number = BASELINE_TEMPERATURE_K
): ThermalStateCalculation {
  const Q = Math.max(0, energyAddedJ);

  const Tm = substance.meltingPointK;
  const Tb = substance.boilingPointK;
  const cs = substance.specificHeatSolid;
  const cl = substance.specificHeatLiquid;
  const cg = substance.specificHeatGas;
  const Lf = substance.latentHeatFusion;
  const Lv = substance.latentHeatVaporization;

  // Energy thresholds
  // 1. Sensible heat to raise solid from baseline to melting point Tm
  const Q_toMelting = massKg * cs * Math.max(0, Tm - baselineTempK);

  // 2. Latent heat to completely melt the solid into liquid
  const Q_meltComplete = Q_toMelting + massKg * Lf;

  // 3. Sensible heat to raise liquid from Tm to boiling point Tb
  const Q_toBoiling = Q_meltComplete + massKg * cl * (Tb - Tm);

  // 4. Latent heat to completely vaporize the liquid into gas
  const Q_boilComplete = Q_toBoiling + massKg * Lv;

  // Zone 1: Solid sensible heating
  if (Q <= Q_toMelting) {
    const deltaT = Q / (massKg * cs);
    const tempK = baselineTempK + deltaT;
    return {
      temperatureK: Number(tempK.toFixed(2)),
      temperatureC: kelvinToCelsius(tempK),
      phase: 'solid',
      phaseFractions: { solid: 1.0, liquid: 0.0, gas: 0.0 },
      energyJ: Q,
      zone: 'solid',
      description: 'Solid phase. Added heat increases particle kinetic energy and thermal vibration amplitude.',
    };
  }

  // Zone 2: Solid-Liquid Coexistence (Melting Plateau)
  if (Q < Q_meltComplete) {
    const latentAbsorbed = Q - Q_toMelting;
    const liquidFraction = latentAbsorbed / (massKg * Lf);
    const solidFraction = 1.0 - liquidFraction;

    return {
      temperatureK: Number(Tm.toFixed(2)),
      temperatureC: kelvinToCelsius(Tm),
      phase: 'solid-liquid',
      phaseFractions: {
        solid: Number(solidFraction.toFixed(3)),
        liquid: Number(liquidFraction.toFixed(3)),
        gas: 0.0,
      },
      energyJ: Q,
      zone: 'melting',
      description: `Melting plateau at ${kelvinToCelsius(Tm)}°C. Energy is absorbed as latent heat of fusion to weaken crystalline bonds without raising temperature.`,
    };
  }

  // Zone 3: Liquid sensible heating
  if (Q <= Q_toBoiling) {
    const liquidEnergy = Q - Q_meltComplete;
    const deltaT = liquidEnergy / (massKg * cl);
    const tempK = Tm + deltaT;

    return {
      temperatureK: Number(tempK.toFixed(2)),
      temperatureC: kelvinToCelsius(tempK),
      phase: 'liquid',
      phaseFractions: { solid: 0.0, liquid: 1.0, gas: 0.0 },
      energyJ: Q,
      zone: 'liquid',
      description: 'Liquid phase. Particles flow and slide past each other while in close cohesive contact.',
    };
  }

  // Zone 4: Liquid-Gas Coexistence (Boiling Plateau)
  if (Q < Q_boilComplete) {
    const latentAbsorbed = Q - Q_toBoiling;
    const gasFraction = latentAbsorbed / (massKg * Lv);
    const liquidFraction = 1.0 - gasFraction;

    return {
      temperatureK: Number(Tb.toFixed(2)),
      temperatureC: kelvinToCelsius(Tb),
      phase: 'liquid-gas',
      phaseFractions: {
        solid: 0.0,
        liquid: Number(liquidFraction.toFixed(3)),
        gas: Number(gasFraction.toFixed(3)),
      },
      energyJ: Q,
      zone: 'boiling',
      description: `Boiling plateau at ${kelvinToCelsius(Tb)}°C. Energy is absorbed as latent heat of vaporization to break intermolecular cohesion and produce vapor.`,
    };
  }

  // Zone 5: Gas sensible heating
  const gasEnergy = Q - Q_boilComplete;
  const deltaT = gasEnergy / (massKg * cg);
  const tempK = Tb + deltaT;

  return {
    temperatureK: Number(tempK.toFixed(2)),
    temperatureC: kelvinToCelsius(tempK),
    phase: 'gas',
    phaseFractions: { solid: 0.0, liquid: 0.0, gas: 1.0 },
    energyJ: Q,
    zone: 'gas',
    description: 'Gas phase. Energetic particles move rapidly and independently in all directions, filling the available container volume.',
  };
}

/**
 * Calculates the required accumulated energy for a given temperature.
 * Useful when setting temperature via UI slider or presets.
 */
export function calculateEnergyFromTemperature(
  targetTempK: number,
  substance: SubstanceDefinition,
  massKg: number,
  baselineTempK: number = BASELINE_TEMPERATURE_K
): number {
  const Tm = substance.meltingPointK;
  const Tb = substance.boilingPointK;
  const cs = substance.specificHeatSolid;
  const cl = substance.specificHeatLiquid;
  const cg = substance.specificHeatGas;
  const Lf = substance.latentHeatFusion;
  const Lv = substance.latentHeatVaporization;

  const Q_toMelting = massKg * cs * Math.max(0, Tm - baselineTempK);
  const Q_meltComplete = Q_toMelting + massKg * Lf;
  const Q_toBoiling = Q_meltComplete + massKg * cl * (Tb - Tm);
  const Q_boilComplete = Q_toBoiling + massKg * Lv;

  if (targetTempK < Tm) {
    const deltaT = Math.max(0, targetTempK - baselineTempK);
    return massKg * cs * deltaT;
  }
  if (Math.abs(targetTempK - Tm) < 0.01) {
    // Return midpoint of melting plateau
    return Q_toMelting + 0.5 * massKg * Lf;
  }
  if (targetTempK < Tb) {
    const deltaT = targetTempK - Tm;
    return Q_meltComplete + massKg * cl * deltaT;
  }
  if (Math.abs(targetTempK - Tb) < 0.01) {
    // Return midpoint of boiling plateau
    return Q_toBoiling + 0.5 * massKg * Lv;
  }
  const deltaT = targetTempK - Tb;
  return Q_boilComplete + massKg * cg * deltaT;
}

export interface HeatingCurveKeypoints {
  qToMelting: number;
  qMeltComplete: number;
  qToBoiling: number;
  qBoilComplete: number;
  qMax: number;
  tempBaselineC: number;
  tempMeltingC: number;
  tempBoilingC: number;
  tempMaxC: number;
}

/**
 * Returns key thermodynamic threshold points for rendering the idealized heating curve graph.
 */
export function getHeatingCurveKeypoints(
  substance: SubstanceDefinition,
  massKg: number,
  baselineTempK: number = BASELINE_TEMPERATURE_K,
  maxTempC: number = 140
): HeatingCurveKeypoints {
  const Tm = substance.meltingPointK;
  const Tb = substance.boilingPointK;
  const cs = substance.specificHeatSolid;
  const cl = substance.specificHeatLiquid;
  const cg = substance.specificHeatGas;
  const Lf = substance.latentHeatFusion;
  const Lv = substance.latentHeatVaporization;

  const qToMelting = massKg * cs * Math.max(0, Tm - baselineTempK);
  const qMeltComplete = qToMelting + massKg * Lf;
  const qToBoiling = qMeltComplete + massKg * cl * (Tb - Tm);
  const qBoilComplete = qToBoiling + massKg * Lv;

  const maxTempK = celsiusToKelvin(maxTempC);
  const qMax = qBoilComplete + massKg * cg * Math.max(0, maxTempK - Tb);

  return {
    qToMelting,
    qMeltComplete,
    qToBoiling,
    qBoilComplete,
    qMax,
    tempBaselineC: kelvinToCelsius(baselineTempK),
    tempMeltingC: kelvinToCelsius(Tm),
    tempBoilingC: kelvinToCelsius(Tb),
    tempMaxC: maxTempC,
  };
}
