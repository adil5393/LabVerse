import { describe, it, expect } from 'vitest';
import { createParticles } from '../particles';
import { stepSimulation } from '../simulation';
import { calculatePressure, calculateMeanKineticEnergy } from '../measurements';
import { WATER_SUBSTANCE } from '../substances';
import {
  CHAMBER_WIDTH,
  CHAMBER_HEIGHT_MAX,
  DEFAULT_PISTON_HEIGHT,
} from '../constants';
import type { SimulationConfig } from '../types';

describe('Particle Dynamics Simulation - Milestone C1', () => {
  const baseConfig: SimulationConfig = {
    particleCount: 50,
    simulationSpeed: 1.0,
    isPaused: false,
    containerWidth: CHAMBER_WIDTH,
    containerHeight: CHAMBER_HEIGHT_MAX,
    pistonHeight: DEFAULT_PISTON_HEIGHT,
    showTrails: false,
    showVectors: false,
    showInteractions: false,
  };

  describe('Particle Initialization', () => {
    it('creates exact requested particle count', () => {
      const particles = createParticles(
        50,
        WATER_SUBSTANCE,
        'solid',
        baseConfig.containerWidth,
        baseConfig.pistonHeight,
        253.15 // -20°C
      );
      expect(particles.length).toBe(50);
    });

    it('assigns lattice coordinates for solid phase', () => {
      const particles = createParticles(
        50,
        WATER_SUBSTANCE,
        'solid',
        baseConfig.containerWidth,
        baseConfig.pistonHeight,
        253.15
      );

      for (const p of particles) {
        expect(p.latticeX).toBeDefined();
        expect(p.latticeY).toBeDefined();
        expect(p.localPhase).toBe('solid');
      }
    });

    it('places particles within container bounds', () => {
      const floorY = CHAMBER_HEIGHT_MAX;
      const topPistonY = floorY - baseConfig.pistonHeight;

      const particles = createParticles(
        100,
        WATER_SUBSTANCE,
        'gas',
        baseConfig.containerWidth,
        baseConfig.pistonHeight,
        393.15 // 120°C
      );

      for (const p of particles) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(CHAMBER_WIDTH);
        expect(p.y).toBeGreaterThanOrEqual(topPistonY - 10);
        expect(p.y).toBeLessThanOrEqual(floorY + 10);
        expect(isNaN(p.vx)).toBe(false);
        expect(isNaN(p.vy)).toBe(false);
      }
    });
  });

  describe('Numerical Integration & Stability', () => {
    it('advances simulation steps stably without NaN or runaway velocities', () => {
      let particles = createParticles(
        60,
        WATER_SUBSTANCE,
        'gas',
        baseConfig.containerWidth,
        baseConfig.pistonHeight,
        373.15
      );

      let totalImpulse = 0;
      for (let step = 0; step < 10; step++) {
        const result = stepSimulation(
          particles,
          1 / 60,
          WATER_SUBSTANCE,
          'gas',
          373.15,
          baseConfig
        );
        particles = result.particles;
        totalImpulse += result.wallImpulseAccumulated;
      }

      expect(totalImpulse).toBeGreaterThanOrEqual(0);

      // Verify no particle escaped or became NaN
      for (const p of particles) {
        expect(isFinite(p.x)).toBe(true);
        expect(isFinite(p.y)).toBe(true);
        expect(isFinite(p.vx)).toBe(true);
        expect(isFinite(p.vy)).toBe(true);
        expect(Math.hypot(p.vx, p.vy)).toBeLessThan(1000); // capped velocity
      }
    });
  });

  describe('Pressure & Kinematics Measurements', () => {
    it('marks Ideal Gas Law as non-applicable for solid and liquid phases', () => {
      const solidPressure = calculatePressure(
        100,
        253.15,
        CHAMBER_WIDTH,
        DEFAULT_PISTON_HEIGHT,
        'solid',
        500,
        1.0
      );
      expect(solidPressure.calculatedIdealGasKPa).toBeNull();
      expect(solidPressure.isGasApplicable).toBe(false);

      const liquidPressure = calculatePressure(
        100,
        323.15,
        CHAMBER_WIDTH,
        DEFAULT_PISTON_HEIGHT,
        'liquid',
        500,
        1.0
      );
      expect(liquidPressure.calculatedIdealGasKPa).toBeNull();
      expect(liquidPressure.isGasApplicable).toBe(false);
    });

    it('calculates Ideal Gas Law pressure for gas phase with Boyle-Charles dependence', () => {
      const gasPressureLargeVol = calculatePressure(
        100,
        373.15,
        CHAMBER_WIDTH,
        DEFAULT_PISTON_HEIGHT, // large volume
        'gas',
        1000,
        1.0
      );
      expect(gasPressureLargeVol.calculatedIdealGasKPa).not.toBeNull();
      expect(gasPressureLargeVol.isGasApplicable).toBe(true);

      // Decreasing volume (compressing piston) increases pressure
      const gasPressureSmallVol = calculatePressure(
        100,
        373.15,
        CHAMBER_WIDTH,
        DEFAULT_PISTON_HEIGHT / 2, // half volume
        'gas',
        1000,
        1.0
      );
      expect(gasPressureSmallVol.calculatedIdealGasKPa!).toBeGreaterThan(
        gasPressureLargeVol.calculatedIdealGasKPa!
      );
    });

    it('calculates mean kinetic energy and average speed correctly', () => {
      const particles = createParticles(
        20,
        WATER_SUBSTANCE,
        'liquid',
        CHAMBER_WIDTH,
        DEFAULT_PISTON_HEIGHT,
        323.15
      );

      const ke = calculateMeanKineticEnergy(particles);
      expect(ke.meanSpeed).toBeGreaterThan(0);
      expect(ke.meanKineticEnergy).toBeGreaterThan(0);
      expect(ke.formattedKE).toContain('u·px²/s²');
    });
  });
});
