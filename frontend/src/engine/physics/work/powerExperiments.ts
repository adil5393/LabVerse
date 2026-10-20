/** Guided investigations A to C for the Power Laboratory (PHY-3D). Predict, Experiment, Observe, Explain; exactly one option holds. */

import { computePower, DEFAULT_POWER, type PowerResult, type PowerSetup } from './power';

export interface PowerRoute { id: string; label: string; setup: PowerSetup; prompt: string; options: { label: string; holds: (r: PowerResult) => boolean; why: string }[]; explain: (r: PowerResult) => string }
export interface PowerExperiment { id: 'A' | 'B' | 'C'; title: string; goal: string; routes: PowerRoute[]; lesson: string }

const pw = (o: Partial<PowerSetup>): PowerSetup => ({ ...DEFAULT_POWER, ...o });
const near = (a: number, b: number) => Math.abs(a - b) < 1e-6;
const r2 = (n: number) => String(Math.round(n * 100) / 100).replace('-', '−');

export const POWER_EXPERIMENTS: PowerExperiment[] = [
  {
    id: 'A', title: 'Same work, different times', goal: 'Compare walking and running up the same flight of stairs.',
    routes: [
      { id: 'pa1', label: 'A 50 kg student climbs stairs 3 m high in 30 s (walking)', setup: pw({ scenario: 'lift', massKg: 50, height: 3, timeS: 30 }), prompt: 'The work done against gravity and the average power are:',
        options: [{ label: '1500 J and 50 W', holds: (r) => near(r.work, 1500) && near(r.power, 50), why: 'W = m g h = 50 × 10 × 3 = 1500 J and P = W ÷ t = 1500 ÷ 30 = 50 W.' }, { label: '1500 J and 45 000 W', holds: (r) => near(r.power, 45000), why: 'You multiplied the work by the time. Power is the work divided by the time.' }, { label: '50 J and 50 W', holds: (r) => near(r.work, 50), why: 'The work is m g h = 1500 J, not the mass. Then divide by 30 s.' }],
        explain: (r) => `Work ${r2(r.work)} J in ${r2(r.setup.timeS)} s: ${r2(r.power)} W.` },
      { id: 'pa2', label: 'The same student runs up the same stairs in 10 s', setup: pw({ scenario: 'lift', massKg: 50, height: 3, timeS: 10 }), prompt: 'The work done, and the power, compared with walking (1500 J, 50 W):',
        options: [{ label: 'the same work (1500 J) but three times the power (150 W)', holds: (r) => near(r.work, 1500) && near(r.power, 150), why: 'The work against gravity depends on the height only. The time is 3 times shorter, so the power is 3 times larger.' }, { label: 'three times the work and three times the power', holds: (r) => near(r.work, 4500), why: 'Running does not change the height climbed, so the work is the same 1500 J.' }, { label: 'the same power (50 W), because the work is the same', holds: (r) => near(r.power, 50), why: 'Power is work ÷ time. With the same work in a third of the time the power is 3 times larger.' }],
        explain: (r) => `Work ${r2(r.work)} J in ${r2(r.setup.timeS)} s: ${r2(r.power)} W.` },
    ],
    lesson: 'Power is the rate of doing work. The same work done faster needs more power.',
  },
  {
    id: 'B', title: 'More work in the same time', goal: 'See that power is proportional to the work for a fixed time.',
    routes: [
      { id: 'pb1', label: 'A crane lifts a 200 kg load through 5 m in 10 s', setup: pw({ scenario: 'lift', massKg: 200, height: 5, timeS: 10 }), prompt: 'The average power is:',
        options: [{ label: '1000 W (1 kW)', holds: (r) => near(r.power, 1000), why: 'W = 200 × 10 × 5 = 10 000 J, and P = 10 000 ÷ 10 = 1000 W.' }, { label: '100 W', holds: (r) => near(r.power, 100), why: 'The work is 10 000 J (m g h), not 1000 J.' }],
        explain: (r) => `Work ${r2(r.work)} J in ${r2(r.setup.timeS)} s: ${r2(r.power)} W = ${r2(r.kilowatts)} kW.` },
      { id: 'pb2', label: 'The crane lifts a load twice as heavy (400 kg) through the same 5 m in the same 10 s', setup: pw({ scenario: 'lift', massKg: 400, height: 5, timeS: 10 }), prompt: 'Compared with 1000 W, the power needed is:',
        options: [{ label: 'twice as much (2000 W)', holds: (r) => near(r.power, 2000), why: 'Twice the load means twice the work (20 000 J) in the same time, so twice the power.' }, { label: 'the same, because the time is the same', holds: (r) => near(r.power, 1000), why: 'The time is the same but the work doubled, so the power doubles.' }],
        explain: (r) => `Work ${r2(r.work)} J in ${r2(r.setup.timeS)} s: ${r2(r.power)} W.` },
    ],
    lesson: 'More work in the same time, or the same work in less time, needs more power.',
  },
  {
    id: 'C', title: 'Power to speed up a car', goal: 'Find the power needed to speed a car up (the work is the kinetic energy gained) and compare it with horsepower.',
    routes: [
      { id: 'pc1', label: 'A 1200 kg car starts from rest and reaches 25 m/s in 10 s (the engine\'s work is the kinetic energy gained)', setup: pw({ scenario: 'accelerate', massKg: 1200, speed: 25, timeS: 10 }), prompt: 'The average power of the engine for this start is:',
        options: [{ label: '37 500 W (about 50 horsepower)', holds: (r) => near(r.power, 37500), why: 'W = ½ m v² = ½ × 1200 × 25² = 375 000 J, and P = 375 000 ÷ 10 = 37 500 W; 1 horsepower = 746 W, so about 50 hp.' }, { label: '3000 W', holds: (r) => near(r.power, 3000), why: 'You used m × v without squaring and halving: the kinetic energy is ½mv² = 375 000 J.' }, { label: '375 000 W', holds: (r) => near(r.power, 375000), why: 'That is the work in joules. Divide it by the time (10 s) to get the power.' }],
        explain: (r) => `Work ${r2(r.work)} J in ${r2(r.setup.timeS)} s: ${r2(r.power)} W = ${r2(r.kilowatts)} kW = ${r2(r.horsepower)} horsepower.` },
    ],
    lesson: 'The work needed to speed up an object from rest is its kinetic energy; the power is that work divided by the time.',
  },
];

export const powerExperimentById = (id: string | null | undefined): PowerExperiment | undefined => POWER_EXPERIMENTS.find((e) => e.id === id);
export const powerOutcome = (r: PowerRoute) => { const result = computePower(r.setup); return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) }; };
