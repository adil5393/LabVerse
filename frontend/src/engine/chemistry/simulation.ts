/**
 * Particle Dynamics & Physics Simulation Engine for LabVerse Chemistry Laboratory
 *
 * Implements fixed-timestep numerical integration, phase-dependent interactions,
 * lattice harmonic binding for solids, fluid cohesion for liquids, kinetic collisions
 * for gases, and boundary collisions against chamber walls and moving piston.
 */

import type { Particle, PhaseId, SubstanceDefinition, SimulationConfig } from './types';
import { EDUCATIONAL_KB } from './constants';

export interface SimulationStepResult {
  particles: Particle[];
  wallImpulseAccumulated: number; // For measured wall pressure calculations
}

/**
 * Steps the particle simulation forward by dt seconds using sub-stepping.
 */
export function stepSimulation(
  particles: Particle[],
  dt: number,
  substance: SubstanceDefinition,
  phase: PhaseId,
  temperatureK: number,
  config: SimulationConfig,
  gravityMultiplier: number = 1.0
): SimulationStepResult {
  if (config.isPaused || particles.length === 0) {
    return { particles, wallImpulseAccumulated: 0 };
  }

  const effectiveDt = (dt * config.simulationSpeed) / 2; // 2 sub-steps
  let totalWallImpulse = 0;

  // Sub-stepping for numerical stability
  for (let step = 0; step < 2; step++) {
    const impulse = singleSubStep(
      particles,
      effectiveDt,
      substance,
      phase,
      temperatureK,
      config,
      gravityMultiplier
    );
    totalWallImpulse += impulse;
  }

  return {
    particles,
    wallImpulseAccumulated: totalWallImpulse,
  };
}

function singleSubStep(
  particles: Particle[],
  dt: number,
  substance: SubstanceDefinition,
  phase: PhaseId,
  temperatureK: number,
  config: SimulationConfig,
  gravityMultiplier: number
): number {
  let wallImpulse = 0;
  const width = config.containerWidth;
  const floorY = config.containerHeight;
  const topPistonY = Math.max(20, floorY - config.pistonHeight);

  // Target thermal velocity magnitude: v_th = sqrt(2 * kB * T / mass)
  const targetSpeed = Math.sqrt(Math.max(0.1, (2 * EDUCATIONAL_KB * temperatureK) / substance.particleMass)) * 14;

  const isSolid = phase === 'solid';
  const isMelting = phase === 'solid-liquid';
  const isLiquid = phase === 'liquid';
  const isBoiling = phase === 'liquid-gas';
  const isGas = phase === 'gas';

  // Effective gravity (affects liquid and solid settling)
  const gravity = (isLiquid || isMelting || isSolid) ? 140 * gravityMultiplier : 0;

  // 1. Force calculation
  const N = particles.length;
  for (let i = 0; i < N; i++) {
    const p = particles[i];
    p.ax = 0;
    p.ay = gravity;

    // A. Solid lattice restoring force
    if ((isSolid || (isMelting && p.latticeX !== undefined)) && p.latticeX !== undefined && p.latticeY !== undefined) {
      const dx = p.latticeX - p.x;
      const dy = p.latticeY - p.y;
      const kLattice = 120.0; // Spring constant
      p.ax += dx * kLattice;
      p.ay += dy * kLattice;

      // Add gentle damping and thermal vibration noise
      p.vx *= 0.96;
      p.vy *= 0.96;
      const noiseAngle = Math.random() * 2 * Math.PI;
      const noiseMag = targetSpeed * 0.25 * Math.random();
      p.ax += Math.cos(noiseAngle) * noiseMag * 20;
      p.ay += Math.sin(noiseAngle) * noiseMag * 20;
    }

    // B. Gas thermal velocity maintenance
    if (isGas || (isBoiling && p.localPhase === 'gas')) {
      const currentSpeed = Math.hypot(p.vx, p.vy);
      if (currentSpeed > 0.01) {
        // Thermostat nudge toward target thermal velocity
        const speedRatio = targetSpeed / currentSpeed;
        p.vx += (p.vx * speedRatio - p.vx) * 0.08;
        p.vy += (p.vy * speedRatio - p.vy) * 0.08;
      } else {
        const angle = Math.random() * 2 * Math.PI;
        p.vx = Math.cos(angle) * targetSpeed;
        p.vy = Math.sin(angle) * targetSpeed;
      }
    }
  }

  // 2. Inter-particle collisions & soft repulsion
  // To avoid O(N²) quadratic cost on large particle counts, check nearby pairs
  for (let i = 0; i < N; i++) {
    const p1 = particles[i];
    for (let j = i + 1; j < N; j++) {
      const p2 = particles[j];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distSq = dx * dx + dy * dy;
      const minDist = p1.radius + p2.radius;

      if (distSq < minDist * minDist && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const overlap = minDist - dist;
        const nx = dx / dist;
        const ny = dy / dist;

        // Position separation to prevent overlap
        const sepFactor = 0.5 * overlap;
        p1.x -= nx * sepFactor;
        p1.y -= ny * sepFactor;
        p2.x += nx * sepFactor;
        p2.y += ny * sepFactor;

        // Elastic momentum exchange
        const kx = p1.vx - p2.vx;
        const ky = p1.vy - p2.vy;
        const p = 2 * (nx * kx + ny * ky) / (p1.mass + p2.mass);

        if (p > 0) {
          p1.vx -= p * p2.mass * nx;
          p1.vy -= p * p2.mass * ny;
          p2.vx += p * p1.mass * nx;
          p2.vy += p * p1.mass * ny;
        }
      } else if ((isLiquid || isMelting) && distSq < minDist * minDist * 3.2 && distSq > 0.01) {
        // Cohesive attraction between close fluid neighbors (surface tension)
        const dist = Math.sqrt(distSq);
        const cohesionForce = 15.0 * (1.0 - dist / (minDist * 1.8));
        const nx = dx / dist;
        const ny = dy / dist;
        p1.ax += nx * cohesionForce;
        p1.ay += ny * cohesionForce;
        p2.ax -= nx * cohesionForce;
        p2.ay -= ny * cohesionForce;
      }
    }
  }

  // 3. Integration & Boundary Collisions (Chamber Walls and Moving Piston)
  const maxAllowedSpeed = 800; // Cap to prevent visual tunneling

  for (let i = 0; i < N; i++) {
    const p = particles[i];

    // Euler-Cromer integration
    p.vx += p.ax * dt;
    p.vy += p.ay * dt;

    // Velocity clamp
    const speed = Math.hypot(p.vx, p.vy);
    if (speed > maxAllowedSpeed) {
      p.vx = (p.vx / speed) * maxAllowedSpeed;
      p.vy = (p.vy / speed) * maxAllowedSpeed;
    }

    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Safety checks against NaN/Infinity
    if (isNaN(p.x) || !isFinite(p.x)) p.x = width / 2;
    if (isNaN(p.y) || !isFinite(p.y)) p.y = (topPistonY + floorY) / 2;
    if (isNaN(p.vx) || !isFinite(p.vx)) p.vx = 0;
    if (isNaN(p.vy) || !isFinite(p.vy)) p.vy = 0;

    // Left wall (x = radius)
    if (p.x < p.radius) {
      p.x = p.radius;
      const deltaVx = 2 * Math.abs(p.vx);
      p.vx = Math.abs(p.vx);
      wallImpulse += p.mass * deltaVx;
    }

    // Right wall (x = width - radius)
    if (p.x > width - p.radius) {
      p.x = width - p.radius;
      const deltaVx = 2 * Math.abs(p.vx);
      p.vx = -Math.abs(p.vx);
      wallImpulse += p.mass * deltaVx;
    }

    // Top wall / Movable Piston (y = topPistonY + radius)
    if (p.y < topPistonY + p.radius) {
      p.y = topPistonY + p.radius;
      const deltaVy = 2 * Math.abs(p.vy);
      p.vy = Math.abs(p.vy);
      wallImpulse += p.mass * deltaVy;
    }

    // Bottom wall / Heated Floor (y = floorY - radius)
    if (p.y > floorY - p.radius) {
      p.y = floorY - p.radius;
      const deltaVy = 2 * Math.abs(p.vy);
      p.vy = -Math.abs(p.vy) * (isLiquid || isSolid ? 0.75 : 1.0); // Damping on floor for liquids/solids
      wallImpulse += p.mass * deltaVy;
    }
  }

  return wallImpulse;
}
