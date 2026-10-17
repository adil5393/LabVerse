/**
 * Scientific Measurement Calculations for LabVerse Chemistry Laboratory
 *
 * Implements:
 * - Calculated: Ideal Gas Law Pressure P = N*kB*T / V
 * - Measured: Particle-Wall Collision Impulse Pressure
 * - Mean Kinetic Energy <KE>
 * - Kinetic Temperature derived from velocity distribution
 */

import type { Particle, PhaseId } from './types';
import { EDUCATIONAL_KB } from './constants';

export interface PressureAnalysis {
  calculatedIdealGasKPa: number | null; // null for solids and liquids
  measuredWallPressureKPa: number;
  label: string;
  isGasApplicable: boolean;
  explanation: string;
}

/**
 * Calculates pressure for the container based on model and wall collisions.
 *
 * @param particleCount Number of particles N
 * @param temperatureK Thermodynamic temperature in Kelvin
 * @param chamberWidth Width of container in simulation units
 * @param pistonHeight Height of container (volume proxy) in simulation units
 * @param phase Current thermodynamic phase
 * @param accumulatedWallImpulse Total momentum exchanged with walls in current window
 * @param windowSeconds Time interval for the measured impulse
 */
export function calculatePressure(
  particleCount: number,
  temperatureK: number,
  chamberWidth: number,
  pistonHeight: number,
  phase: PhaseId,
  accumulatedWallImpulse: number,
  windowSeconds: number
): PressureAnalysis {
  const isGas = phase === 'gas' || phase === 'liquid-gas';
  // Volume proxy in 2D simulation space: A = Width * Height
  const volume2D = Math.max(1, chamberWidth * pistonHeight);

  // Calculated Ideal Gas Law: P = N * k_B * T / V (scaled to classroom kPa)
  let calculatedIdealGasKPa: number | null = null;
  if (isGas) {
    const rawP = (particleCount * EDUCATIONAL_KB * temperatureK) / (volume2D * 1e-4);
    // Normalize to standard atmospheric pressure scale (~101.3 kPa at 373 K and standard volume)
    const normalizedKPa = rawP * 3.74;
    calculatedIdealGasKPa = Number(Math.max(10.0, Math.min(800.0, normalizedKPa)).toFixed(1));
  }

  // Measured wall pressure from collision impulses: P_walls = (Sum of 2*m*v_perp) / (Perimeter * dt)
  const perimeter = 2 * (chamberWidth + pistonHeight);
  let measuredWallPressureKPa = 0;
  if (windowSeconds > 0 && perimeter > 0) {
    const rawWallP = accumulatedWallImpulse / (perimeter * windowSeconds);
    const scaledWallKPa = rawWallP * 0.45;
    measuredWallPressureKPa = Number(Math.max(0.0, Math.min(800.0, scaledWallKPa)).toFixed(1));
  } else {
    measuredWallPressureKPa = calculatedIdealGasKPa ?? 101.3;
  }

  let explanation = '';
  if (phase === 'solid') {
    explanation = 'Solid state: Particles are locked in crystalline lattice sites with fixed volume. Ideal gas law does NOT apply to solids.';
  } else if (phase === 'solid-liquid') {
    explanation = 'Melting state: Incompressible mixture of solid crystal and liquid fluid. Ideal gas law is not applicable.';
  } else if (phase === 'liquid') {
    explanation = 'Liquid state: Particles are in dense cohesive contact with definite volume. Liquids are nearly incompressible; ideal gas law is not applicable.';
  } else if (phase === 'liquid-gas') {
    explanation = 'Boiling state: Vapor bubbles expand and exert pressure on container walls as liquid converts to gas.';
  } else {
    explanation = 'Gas state: Particles collide elastically with container walls. Conforms to Ideal Gas Law: P increases with temperature (T) and decreases with volume (V).';
  }

  return {
    calculatedIdealGasKPa,
    measuredWallPressureKPa,
    label: isGas ? 'Gas Pressure (Boyle-Charles Model)' : 'Condensed Phase (Incompressible)',
    isGasApplicable: isGas,
    explanation,
  };
}

/**
 * Calculates mean kinetic energy per particle in simulation units and relative electron-volts/joules.
 */
export function calculateMeanKineticEnergy(particles: Particle[]): {
  meanSpeed: number;
  meanKineticEnergy: number;
  formattedKE: string;
} {
  if (particles.length === 0) {
    return { meanSpeed: 0, meanKineticEnergy: 0, formattedKE: '0.00 J (scaled)' };
  }

  let totalSpeed = 0;
  let totalKE = 0;

  for (const p of particles) {
    const v2 = p.vx * p.vx + p.vy * p.vy;
    totalSpeed += Math.sqrt(v2);
    totalKE += 0.5 * p.mass * v2;
  }

  const meanSpeed = totalSpeed / particles.length;
  const meanKineticEnergy = totalKE / particles.length;

  return {
    meanSpeed: Number(meanSpeed.toFixed(2)),
    meanKineticEnergy: Number(meanKineticEnergy.toFixed(2)),
    formattedKE: `${meanKineticEnergy.toFixed(1)} u·px²/s²`,
  };
}

/**
 * Estimates kinetic temperature from the mean squared particle velocity.
 * In 2D: <KE> = (1/2) * m * <v²> = k_B * T  =>  T = (m * <v²>) / (2 * k_B)
 */
export function calculateKineticTemperatureK(
  particles: Particle[],
  kB: number = EDUCATIONAL_KB
): number {
  if (particles.length === 0) return 0;

  let totalV2 = 0;
  let mass = 1;

  for (const p of particles) {
    totalV2 += p.vx * p.vx + p.vy * p.vy;
    mass = p.mass;
  }

  const meanV2 = totalV2 / particles.length;
  const tempK = (mass * meanV2) / (2 * kB);

  return Number(Math.max(0, tempK).toFixed(2));
}
