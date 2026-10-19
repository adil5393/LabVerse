/**
 * Minimal reusable energy relations for the later Chapter 7 milestones (PHY-3A foundation). Pure functions only: no state,
 * no drawing, no lessons use them yet except the tests. SI units; g = 10 N per kg as in the textbook.
 * Eq. 7.3 work = change in energy, Eq. 7.6 K = 1/2 m v^2, Eq. 7.8 U = m g h, Eq. 7.11 P = W / t.
 */

import { G } from './workModel';

export const kineticEnergy = (massKg: number, speed: number): number => 0.5 * massKg * speed * speed;
export const potentialEnergy = (massKg: number, height: number, g: number = G): number => massKg * g * height;
export const mechanicalEnergy = (massKg: number, speed: number, height: number, g: number = G): number => kineticEnergy(massKg, speed) + potentialEnergy(massKg, height, g);
/** Eq. 7.3 with only kinetic energy changing: the final kinetic energy after net work W. Negative results mean the object would have stopped earlier. */
export const kineticEnergyAfterWork = (initialKE: number, netWork: number): number => initialKE + netWork;
export const speedFromKineticEnergy = (massKg: number, ke: number): number => (ke <= 0 ? 0 : Math.sqrt((2 * ke) / massKg));
/** Average power, W = J/s. */
export const averagePower = (work: number, timeS: number): number => work / timeS;
