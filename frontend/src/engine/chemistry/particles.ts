/**
 * Particle Generation & Initialization for LabVerse Chemistry Laboratory
 *
 * Generates initial spatial arrangements and thermal velocity distributions
 * corresponding to solid (lattice), liquid (dense fluid), and gas (dispersed).
 */

import type { Particle, PhaseId, SubstanceDefinition } from './types';
import { EDUCATIONAL_KB, CHAMBER_HEIGHT_MAX } from './constants';

/**
 * Creates particles initialized for the given phase, substance, and chamber volume.
 */
export function createParticles(
  count: number,
  substance: SubstanceDefinition,
  phase: PhaseId,
  chamberWidth: number,
  pistonHeight: number,
  temperatureK: number
): Particle[] {
  const particles: Particle[] = [];
  const radius = substance.particleRadius;
  const mass = substance.particleMass;

  // Target thermal speed: v_th = sqrt(2 * kB * T / mass)
  const thermalSpeed = Math.sqrt(Math.max(0.1, (2 * EDUCATIONAL_KB * temperatureK) / mass)) * 12;

  // Container floor is fixed at bottom (CHAMBER_HEIGHT_MAX), piston is at top
  const floorY = CHAMBER_HEIGHT_MAX;
  const topPistonY = Math.max(20, floorY - pistonHeight);
  const bottomY = floorY - radius - 4;

  if (phase === 'solid') {
    // Solid: Regular close-packed crystalline lattice at the bottom
    const spacing = radius * 2.3;
    const cols = Math.min(count, Math.floor((chamberWidth - 40) / spacing));
    const rows = Math.ceil(count / cols);
    const startX = (chamberWidth - cols * spacing) / 2 + radius;

    let index = 0;
    for (let r = 0; r < rows && index < count; r++) {
      const rowOffset = (r % 2) * (spacing * 0.5);
      const y = bottomY - r * (spacing * 0.866);

      for (let c = 0; c < cols && index < count; c++) {
        const x = startX + c * spacing + rowOffset;
        const angle = Math.random() * 2 * Math.PI;
        const speed = thermalSpeed * (0.8 + 0.4 * Math.random()) * 0.4; // Small vibration in solid

        particles.push({
          id: index,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ax: 0,
          ay: 0,
          radius,
          mass,
          latticeX: x,
          latticeY: y,
          localPhase: 'solid',
        });
        index++;
      }
    }
  } else if (phase === 'solid-liquid') {
    // Coexistence: Part lattice, part fluid
    const spacing = radius * 2.4;
    const cols = Math.min(count, Math.floor((chamberWidth - 40) / spacing));
    const rows = Math.ceil(count / cols);
    const startX = (chamberWidth - cols * spacing) / 2 + radius;

    let index = 0;
    for (let r = 0; r < rows && index < count; r++) {
      const isMelted = r > rows / 2; // Upper layers melt first
      const rowOffset = (r % 2) * (spacing * 0.5);
      const y = bottomY - r * (spacing * 0.9);

      for (let c = 0; c < cols && index < count; c++) {
        const x = startX + c * spacing + rowOffset;
        const angle = Math.random() * 2 * Math.PI;
        const speed = thermalSpeed * (0.8 + 0.4 * Math.random()) * (isMelted ? 0.8 : 0.4);

        particles.push({
          id: index,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ax: 0,
          ay: 0,
          radius,
          mass,
          latticeX: isMelted ? undefined : x,
          latticeY: isMelted ? undefined : y,
          localPhase: isMelted ? 'liquid' : 'solid',
        });
        index++;
      }
    }
  } else if (phase === 'liquid') {
    // Liquid: Dense amorphous arrangement occupying bottom of container
    const liquidHeight = Math.min(pistonHeight * 0.45, Math.max(60, count * 1.8));
    const minLiquidY = floorY - liquidHeight;

    for (let i = 0; i < count; i++) {
      const x = radius + 10 + Math.random() * (chamberWidth - 2 * radius - 20);
      const y = minLiquidY + Math.random() * (floorY - minLiquidY - radius - 5);
      const angle = Math.random() * 2 * Math.PI;
      const speed = thermalSpeed * (0.7 + 0.6 * Math.random()) * 0.85;

      particles.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ax: 0,
        ay: 0,
        radius,
        mass,
        localPhase: 'liquid',
      });
    }
  } else if (phase === 'liquid-gas') {
    // Liquid-Gas coexistence: Boiling liquid at bottom with escaping vapor particles
    for (let i = 0; i < count; i++) {
      const isGas = i % 2 === 0;
      let x: number;
      let y: number;
      let speedFactor: number;

      if (isGas) {
        x = radius + 10 + Math.random() * (chamberWidth - 2 * radius - 20);
        y = topPistonY + radius + 5 + Math.random() * (floorY - topPistonY - 2 * radius - 20);
        speedFactor = 1.2;
      } else {
        const liquidHeight = Math.min(120, pistonHeight * 0.35);
        x = radius + 10 + Math.random() * (chamberWidth - 2 * radius - 20);
        y = floorY - liquidHeight + Math.random() * (liquidHeight - radius - 5);
        speedFactor = 0.9;
      }

      const angle = Math.random() * 2 * Math.PI;
      const speed = thermalSpeed * (0.8 + 0.4 * Math.random()) * speedFactor;

      particles.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ax: 0,
        ay: 0,
        radius,
        mass,
        localPhase: isGas ? 'gas' : 'liquid',
      });
    }
  } else {
    // Gas: Uniformly dispersed throughout the entire chamber cavity [topPistonY, floorY]
    for (let i = 0; i < count; i++) {
      const x = radius + 15 + Math.random() * (chamberWidth - 2 * radius - 30);
      const y = topPistonY + radius + 10 + Math.random() * Math.max(20, floorY - topPistonY - 2 * radius - 20);
      const angle = Math.random() * 2 * Math.PI;
      const speed = thermalSpeed * (0.8 + 0.4 * Math.random()) * 1.3;

      particles.push({
        id: i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        ax: 0,
        ay: 0,
        radius,
        mass,
        localPhase: 'gas',
      });
    }
  }

  return particles;
}

