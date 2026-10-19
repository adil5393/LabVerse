/**
 * Guided investigations A to F for the Energy Laboratory (PHY-3C). Predict, Experiment, Observe, Explain. Each route may ask
 * about the state at a fraction of the way down the slope (`at`, default the end); exactly one prediction option holds in the model.
 */

import { computeEnergy, DEFAULT_ENERGY, energyAtDistance, type EnergyResult, type EnergySetup, type EnergyState } from './energyLab';

export interface EnergyOption { label: string; holds: (st: EnergyState, r: EnergyResult) => boolean; why: string }
export interface EnergyRoute { id: string; label: string; setup: EnergySetup; /** Fraction of the slope at which the question is asked (0 to 1). */ at: number; prompt: string; options: EnergyOption[]; explain: (st: EnergyState, r: EnergyResult) => string }
export interface EnergyExperiment { id: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'; title: string; goal: string; routes: EnergyRoute[]; lesson: string }

const e = (o: Partial<EnergySetup>): EnergySetup => ({ ...DEFAULT_ENERGY, ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => String(Math.round(n * 100) / 100).replace('-', '−');

export const ENERGY_EXPERIMENTS: EnergyExperiment[] = [
  {
    id: 'A', title: 'Same mass, different heights', goal: 'Find how the kinetic energy at the bottom depends on the height from which an object is released.',
    routes: [
      { id: 'a1', label: 'A 2 kg ball is dropped from 5 m (no air resistance, g = 10 m/s²)', setup: e({ massKg: 2, startHeight: 5 }), at: 1, prompt: 'Its speed just before it reaches the ground is:',
        options: [{ label: '10 m/s', holds: (s) => near(s.v, 10), why: 'm g h = ½ m v², so v = √(2 g h) = √(2 × 10 × 5) = 10 m/s.' }, { label: '5 m/s', holds: (s) => near(s.v, 5), why: 'The speed is not equal to the height. v² = 2gh = 100, so v = 10 m/s.' }, { label: '50 m/s', holds: (s) => near(s.v, 50), why: 'You used v = g h. The energy equation gives v² = 2 g h = 100, so v = 10 m/s.' }],
        explain: (s) => `The potential energy lost, 2 × 10 × 5 = 100 J, becomes kinetic energy: K = ${r2(s.K)} J, so v = ${r2(s.v)} m/s.` },
      { id: 'a2', label: 'The same ball is dropped from four times the height, 20 m', setup: e({ massKg: 2, startHeight: 20 }), at: 1, prompt: 'Compared with the 5 m drop (100 J), the kinetic energy at the bottom is:',
        options: [{ label: '4 times as large (400 J), and the speed doubles (20 m/s)', holds: (s) => near(s.K, 400) && near(s.v, 20), why: 'K = m g h is proportional to the height: four times the height, four times K. Since K depends on v², the speed is only doubled.' }, { label: '2 times as large (200 J)', holds: (s) => near(s.K, 200), why: 'The energy released is m g h, which is four times larger for four times the height.' }, { label: 'the same (100 J)', holds: (s) => near(s.K, 100), why: 'A greater height stores more potential energy, so more kinetic energy is released at the bottom.' }],
        explain: (s) => `K = ${r2(s.K)} J = m g h and v = ${r2(s.v)} m/s: four times the height gives four times the energy and twice the speed.` },
    ],
    lesson: 'The kinetic energy at the bottom equals the potential energy lost, m g h, so it is proportional to the starting height; the speed is proportional to the square root of the height.',
  },
  {
    id: 'B', title: 'Same height, different masses', goal: 'Show that the speed at the bottom does not depend on the mass (Example 7.8 of the textbook, with a vertical drop).',
    routes: [
      { id: 'b1', label: 'A 1 kg ball is dropped from 5 m', setup: e({ massKg: 1, startHeight: 5 }), at: 1, prompt: 'Its kinetic energy and speed at the bottom:',
        options: [{ label: '50 J and 10 m/s', holds: (s) => near(s.K, 50) && near(s.v, 10), why: 'K = m g h = 1 × 10 × 5 = 50 J and v = √(2gh) = 10 m/s.' }, { label: '25 J and 5 m/s', holds: (s) => near(s.K, 25), why: 'That halves both: m g h = 50 J, so v = √(2 × 50 ÷ 1) = 10 m/s.' }],
        explain: (s) => `K = ${r2(s.K)} J, v = ${r2(s.v)} m/s.` },
      { id: 'b2', label: 'A 4 kg ball is dropped from the same 5 m', setup: e({ massKg: 4, startHeight: 5 }), at: 1, prompt: 'Compared with the 1 kg ball, the 4 kg ball reaches the ground:',
        options: [{ label: 'with 4 times the kinetic energy (200 J) but the same speed (10 m/s)', holds: (s) => near(s.K, 200) && near(s.v, 10), why: 'The mass appears on both sides of m g h = ½ m v² and cancels, so v = √(2gh) does not depend on the mass; K is 4 times larger because the mass is.' }, { label: 'twice as fast (20 m/s)', holds: (s) => near(s.v, 20), why: 'A heavier ball gains more energy but it also has more inertia. The two effects cancel and the speed is unchanged.' }, { label: 'more slowly, because it is heavier', holds: (s) => s.v < 9.99, why: 'Without air resistance heavy and light objects fall equally fast: the speed at the bottom is the same.' }],
        explain: (s) => `K = ${r2(s.K)} J but v = ${r2(s.v)} m/s, exactly as for the 1 kg ball: the mass cancels.` },
    ],
    lesson: 'The speed after falling a height h is v = √(2gh), whatever the mass. A heavier object has more kinetic energy because it has more mass, not because it is faster.',
  },
  {
    id: 'C', title: 'A falling object: potential to kinetic', goal: 'Watch potential energy turn into kinetic energy during a fall.',
    routes: [
      { id: 'c1', label: 'A 2 kg ball is dropped from 10 m. Look at the instant when it has fallen half the way (5 m above the ground)', setup: e({ massKg: 2, startHeight: 10 }), at: 0.5, prompt: 'At that instant, K and U (measured from the ground) are:',
        options: [{ label: 'K = 100 J and U = 100 J', holds: (s) => near(s.K, 100) && near(s.U, 100), why: 'Half of the 200 J of potential energy has become kinetic energy: K = 100 J, U = 2 × 10 × 5 = 100 J.' }, { label: 'K = 200 J and U = 0 J', holds: (s) => near(s.K, 200), why: 'That is the situation at the ground. Half way down, the ball is still 5 m up and still has potential energy.' }, { label: 'K = 0 J and U = 200 J', holds: (s) => near(s.K, 0), why: 'That is the situation at the top. The ball is now moving, so it has kinetic energy.' }],
        explain: (s) => `Half way: K = ${r2(s.K)} J, U = ${r2(s.U)} J, K + U = ${r2(s.mechanical)} J, the 200 J it had at the top.` },
    ],
    lesson: 'While the ball falls, the potential energy decreases and the kinetic energy increases by the same amount. The sum stays equal to the energy it had at the top.',
  },
  {
    id: 'D', title: 'Conservation without friction', goal: 'Check that K + U stays constant on a smooth ramp, and that the shape of the slope does not matter (Example 7.8).',
    routes: [
      { id: 'd1', label: 'A 3 kg block slides from rest down a smooth 30° ramp from a height of 4 m. Look at the bottom', setup: e({ massKg: 3, startHeight: 4, angleDeg: 30 }), at: 1, prompt: 'The mechanical energy K + U at the bottom, compared with the top (120 J):',
        options: [{ label: 'the same, 120 J (all of it kinetic)', holds: (s, r) => near(s.mechanical, r.E0) && near(s.K, 120), why: 'With no friction no energy leaves the system: the 120 J of potential energy at the top is 120 J of kinetic energy at the bottom.' }, { label: 'smaller, because the block slid along the ramp', holds: (s, r) => s.mechanical < r.E0 - 1e-6, why: 'Without friction, only gravity does work and the mechanical energy is conserved however long the path is.' }],
        explain: (s) => `At the bottom K = ${r2(s.K)} J, U = ${r2(s.U)} J, mechanical energy ${r2(s.mechanical)} J = 120 J.` },
      { id: 'd2', label: 'The same block on a steeper smooth 60° ramp, from the same height', setup: e({ massKg: 3, startHeight: 4, angleDeg: 60 }), at: 1, prompt: 'Compared with the 30° ramp, the speed at the bottom is:',
        options: [{ label: 'the same, 8.9 m/s: only the height matters', holds: (s) => near(s.v, Math.sqrt(80), 1e-6), why: '½ m v² = m g h gives v = √(2gh) = √80 ≈ 8.94 m/s for any smooth ramp of height 4 m. The steeper ramp only makes it quicker.' }, { label: 'larger, because the ramp is steeper', holds: (s) => s.v > 9, why: 'The steeper ramp gets there sooner, but the energy released depends on the height, so the speed is the same.' }, { label: 'smaller, because the ramp is shorter', holds: (s) => s.v < 8.5, why: 'The shorter ramp has the same height, so the same energy is released; the speed is the same.' }],
        explain: (s, r) => `v = ${r2(s.v)} m/s on both ramps; the 60° ramp takes ${r2(r.tEnd)} s.` },
    ],
    lesson: 'Without friction K + U is constant. The speed at the bottom depends only on the height dropped, not on the mass or the shape of the ramp.',
  },
  {
    id: 'E', title: 'Energy transfers with friction', goal: 'See where the mechanical energy goes when there is friction: it becomes thermal energy and the total is conserved.',
    routes: [
      { id: 'e1', label: 'The same 3 kg block slides down the 4 m high 30° ramp, now with friction (coefficient 0.2)', setup: e({ massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2 }), at: 1, prompt: 'At the bottom, compared with the 120 J at the top:',
        options: [{ label: 'K + U is less than 120 J, and the difference is thermal energy; K + U + Q is still 120 J', holds: (s, r) => s.mechanical < r.E0 - 1 && near(s.total, r.E0), why: 'Friction does negative work: it removes mechanical energy and turns it into thermal energy Q ≈ 41.6 J. Nothing is destroyed: K + U + Q = 120 J.' }, { label: 'K + U is still 120 J', holds: (s, r) => near(s.mechanical, r.E0), why: 'With friction the mechanical energy is not conserved: some of it becomes thermal energy.' }, { label: 'K + U is less than 120 J, and the rest of the energy has disappeared', holds: (s, r) => s.mechanical < r.E0 - 1 && !near(s.total, r.E0), why: 'The missing energy has not disappeared: it appears as thermal energy of the block and ramp.' }],
        explain: (s, r) => `K = ${r2(s.K)} J, U = ${r2(s.U)} J, mechanical energy ${r2(s.mechanical)} J, thermal energy Q = ${r2(s.Q)} J, total ${r2(s.total)} J (started with ${r2(r.E0)} J).` },
    ],
    lesson: 'With friction the mechanical energy decreases by exactly the thermal energy produced; the total energy is conserved. Real pendulums and roller coasters slow down for this reason.',
  },
  {
    id: 'F', title: 'Moving the reference height', goal: 'Show that the potential energy depends on the chosen zero level, but the change of potential energy does not.',
    routes: [
      { id: 'f1', label: 'A 2 kg ball falls 5 m. The zero level for potential energy is moved from the ground up to the release point (reference height 5 m)', setup: e({ massKg: 2, startHeight: 5, refHeight: 5 }), at: 1, prompt: 'The potential energy at the bottom, and the CHANGE in potential energy during the fall, are:',
        options: [{ label: 'U = −100 J at the bottom, and a change of −100 J (the same as with the ground as zero)', holds: (s, r) => near(s.U, -100) && near(s.U - r.U0, -100), why: 'Every U shifts by the same amount (U at the top is now 0 J), but the change, m g Δh = −100 J, does not depend on the zero level.' }, { label: 'U = 0 J at the bottom, so the change is 0 J', holds: (s) => near(s.U, 0), why: 'U = 0 now at the release height (5 m), not at the ground. At the ground it is below the reference, so it is negative.' }, { label: 'U = +100 J at the bottom, a change of +100 J', holds: (s) => near(s.U, 100), why: 'The ball moves DOWN, so its potential energy decreases: the change is −100 J.' }],
        explain: (s, r) => `U(start) = ${r2(r.U0)} J, U(bottom) = ${r2(s.U)} J, change ${r2(s.U - r.U0)} J; K = ${r2(s.K)} J and K + U = ${r2(s.mechanical)} J, a constant: negative potential energy is allowed, negative kinetic energy is not.` },
    ],
    lesson: 'Only changes of potential energy are physical. Moving the zero level shifts every value of U (it can even make U negative) but changes none of the changes, and the kinetic energy and speeds are untouched.',
  },
];

export const energyExperimentById = (id: string | null | undefined): EnergyExperiment | undefined => ENERGY_EXPERIMENTS.find((x) => x.id === id);

export function energyRouteOutcome(r: EnergyRoute) {
  const result = computeEnergy(r.setup);
  const state = energyAtDistance(result, result.sEnd * r.at);
  return { result, state, holdsIndex: r.options.map((o) => o.holds(state, result)).indexOf(true) };
}
