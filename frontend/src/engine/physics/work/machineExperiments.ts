/**
 * Guided investigations for the Simple Machines Laboratory (PHY-3D): the inclined plane (A to C), the pulley (A to C) and the
 * lever (A to D). Predict, Experiment, Observe, Explain; exactly one prediction option holds in the model for every route.
 */

import { computeLever, computePulley, computeRamp, DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP, type LeverResult, type LeverSetup, type PulleyResult, type PulleySetup, type RampResult, type RampSetup } from './machines';

export interface MRoute<S, R> { id: string; label: string; setup: S; prompt: string; options: { label: string; holds: (r: R) => boolean; why: string }[]; explain: (r: R) => string }
export interface MExperiment<S, R> { id: string; title: string; goal: string; routes: MRoute<S, R>[]; lesson: string }

export type RampRoute = MRoute<RampSetup, RampResult>;
export type PulleyRoute = MRoute<PulleySetup, PulleyResult>;
export type LeverRoute = MRoute<LeverSetup, LeverResult>;

const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => String(Math.round(n * 100) / 100).replace('-', '−');
const rp = (o: Partial<RampSetup>): RampSetup => ({ ...DEFAULT_RAMP, ...o });
const pu = (o: Partial<PulleySetup>): PulleySetup => ({ ...DEFAULT_PULLEY, ...o });
const lv = (o: Partial<LeverSetup>): LeverSetup => ({ ...DEFAULT_LEVER, ...o });

export const RAMP_EXPERIMENTS: MExperiment<RampSetup, RampResult>[] = [
  {
    id: 'A', title: 'A longer ramp needs a smaller effort', goal: 'Find how the effort and the work change when the same load is raised through the same height by ramps of different lengths (smooth ramps).',
    routes: [
      { id: 'ra1', label: 'A 20 kg load is pushed up a smooth ramp 2 m long to a height of 1 m (the load is 200 N)', setup: rp({ massKg: 20, height: 1, length: 2 }), prompt: 'The effort needed along the ramp is:',
        options: [{ label: '100 N (the load × h ÷ L)', holds: (r) => near(r.effort, 100), why: 'On a smooth ramp F′ × L = m g × h, so F′ = 200 × 1 ÷ 2 = 100 N.' }, { label: '200 N (the full weight)', holds: (r) => near(r.effort, 200), why: 'That is the effort to lift the load straight up. The ramp reduces it: F′ = mg × (h ÷ L).' }, { label: '400 N', holds: (r) => near(r.effort, 400), why: 'You multiplied by L ÷ h instead of dividing. A ramp reduces the effort.' }],
        explain: (r) => `Effort ${r2(r.effort)} N, mechanical advantage ${r2(r.actualMA)} (= L ÷ h), work in ${r2(r.inputWork)} J = work out ${r2(r.outputWork)} J.` },
      { id: 'ra2', label: 'The same load and height, with the ramp lengthened to 8 m', setup: rp({ massKg: 20, height: 1, length: 8 }), prompt: 'Compared with the 2 m ramp (100 N, 200 J), the effort and the work done by the effort are:',
        options: [{ label: 'effort 25 N; work still 200 J', holds: (r) => near(r.effort, 25) && near(r.inputWork, 200), why: 'The effort falls to one quarter (L is four times longer) but it acts over four times the distance: 25 N × 8 m = 200 J. A ramp reduces the force, not the work.' }, { label: 'effort 25 N; work 50 J', holds: (r) => near(r.inputWork, 50), why: 'The effort acts over the whole 8 m, so the work is 25 × 8 = 200 J, not 25 × 2.' }, { label: 'effort 100 N; work 800 J', holds: (r) => near(r.effort, 100), why: 'The longer ramp is gentler, so less effort is needed. The work is still m g h = 200 J.' }],
        explain: (r) => `Effort ${r2(r.effort)} N over ${r2(r.setup.length)} m: ${r2(r.inputWork)} J, the same ${r2(r.outputWork)} J of useful work.` },
    ],
    lesson: 'On a smooth ramp F′ × L = m g h: a longer ramp needs a smaller effort but the effort acts over a longer distance, so the work is the same. MA = load ÷ effort = L ÷ h.',
  },
  {
    id: 'B', title: 'Friction on the ramp', goal: 'See that with friction the input work is larger than the useful work, and where the difference goes.',
    routes: [
      { id: 'rb1', label: 'The 20 kg load is pushed up a 4 m ramp to 1 m, now with friction (coefficient 0.3)', setup: rp({ massKg: 20, height: 1, length: 4, mu: 0.3 }), prompt: 'Compared with the smooth ramp (50 N, 200 J), the effort and the work you do are:',
        options: [{ label: 'a larger effort (about 108 N) and more work (about 432 J); the extra becomes thermal energy', holds: (r) => r.effort > 100 && r.inputWork > r.outputWork + 1 && near(r.lost, r.inputWork - r.outputWork), why: 'You must also overcome friction, μ m g cos θ ≈ 58 N. The useful work is still m g h = 200 J; the other ≈ 232 J becomes thermal energy.' }, { label: 'the same effort and work as the smooth ramp', holds: (r) => near(r.effort, r.idealEffort), why: 'Friction opposes the motion up the ramp, so extra effort is needed.' }, { label: 'a smaller effort, because friction helps hold the load', holds: (r) => r.effort < r.idealEffort, why: 'Pushing up the ramp, friction acts down the ramp, against you. It makes the effort larger, not smaller.' }],
        explain: (r) => `Effort ${r2(r.effort)} N, work in ${r2(r.inputWork)} J, useful work ${r2(r.outputWork)} J, thermal energy ${r2(r.lost)} J; the useful work is ${r2(r.efficiency * 100)}% of the work you put in (a result of the friction model).` },
    ],
    lesson: 'With friction, input work = useful work + thermal energy, so the useful output work is less than the input work. The efficiency here is not a chosen number: it follows from the friction coefficient.',
  },
  {
    id: 'C', title: 'A small ramp over a step', goal: 'Use the ramp geometry (a right-angled triangle) to find the mechanical advantage, as in the textbook example of a ramp over a step.',
    routes: [
      { id: 'rc1', label: 'A ramp lifts a 10 kg load over a step 0.3 m high. The ramp is 0.4 m wide (so its length is 0.5 m)', setup: rp({ massKg: 10, height: 0.3, length: 0.5 }), prompt: 'The mechanical advantage of the ramp is:',
        options: [{ label: '1.67 (L ÷ h = 0.5 ÷ 0.3)', holds: (r) => near(r.actualMA, 5 / 3, 1e-6), why: 'MA = load ÷ effort = L ÷ h, and the length L is the hypotenuse √(0.3² + 0.4²) = 0.5 m, not the width.' }, { label: '1.33 (using the width 0.4 ÷ 0.3)', holds: (r) => near(r.actualMA, 4 / 3, 1e-6), why: 'The ramp length is the slope, not the horizontal width. Use L = 0.5 m.' }, { label: '0.6', holds: (r) => near(r.actualMA, 0.6, 1e-6), why: 'That is h ÷ L, the effort as a fraction of the load. The mechanical advantage is the inverse, L ÷ h.' }],
        explain: (r) => `Width ${r2(r.width)} m, length ${r2(r.setup.length)} m, height ${r2(r.setup.height)} m; effort ${r2(r.effort)} N for a load of ${r2(r.load)} N: MA = ${r2(r.actualMA)}.` },
    ],
    lesson: 'The ramp length is the hypotenuse of the right-angled triangle (height, width, length). MA = L ÷ h = load ÷ effort.',
  },
];

export const PULLEY_EXPERIMENTS: MExperiment<PulleySetup, PulleyResult>[] = [
  {
    id: 'A', title: 'The fixed pulley changes direction only', goal: 'Find what a single fixed pulley does to the effort.',
    routes: [
      { id: 'pa1', label: 'A 20 kg load is raised 1 m with a single fixed pulley (1 strand)', setup: pu({ massKg: 20, strands: 1, lift: 1 }), prompt: 'The effort needed, compared with lifting the load directly (200 N), is:',
        options: [{ label: 'the same, 200 N: only the direction changes (you pull down)', holds: (r) => near(r.effort, 200) && near(r.actualMA, 1), why: 'A fixed pulley does not reduce the force, it only changes its direction. The mechanical advantage is 1 (Eq. 7.12): load ÷ effort = 200 ÷ 200.' }, { label: 'half, 100 N', holds: (r) => near(r.effort, 100), why: 'Halving the effort needs a movable pulley (two strands). A fixed pulley only redirects the rope.' }],
        explain: (r) => `Effort ${r2(r.effort)} N, rope pulled ${r2(r.ropePulled)} m for a rise of ${r2(r.setup.lift)} m, MA = ${r2(r.actualMA)}.` },
    ],
    lesson: 'A fixed pulley gives MA = 1: it makes the task more convenient (you pull down), not easier in force.',
  },
  {
    id: 'B', title: 'A movable pulley halves the effort', goal: 'See the constraint between the rope pulled and the load raised, and the trade of force for distance.',
    routes: [
      { id: 'pb1', label: 'The same 20 kg load, raised 1 m by a system with a movable pulley (2 supporting strands, massless pulleys)', setup: pu({ massKg: 20, strands: 2, lift: 1 }), prompt: 'The effort, the rope you must pull, and the work you do are:',
        options: [{ label: '100 N; 2 m of rope; 200 J (the same work as lifting the load directly)', holds: (r) => near(r.effort, 100) && near(r.ropePulled, 2) && near(r.inputWork, 200), why: 'Each of the 2 strands carries half the load, so the effort is 100 N. To raise the load 1 m each strand must shorten by 1 m, so 2 m of rope pass through your hands: 100 N × 2 m = 200 J = m g h.' }, { label: '100 N; 1 m of rope; 100 J', holds: (r) => near(r.inputWork, 100), why: 'The rope and the load are linked: the load rises 1 m only if 2 m of rope are pulled (one metre from each strand). Then the work is 100 × 2 = 200 J.' }, { label: '200 N; 2 m of rope', holds: (r) => near(r.effort, 200), why: 'The movable pulley shares the load between two strands, so the effort is half the load: 100 N.' }],
        explain: (r) => `Effort ${r2(r.effort)} N, rope pulled ${r2(r.ropePulled)} m = ${r2(r.setup.strands)} × ${r2(r.setup.lift)} m, work in ${r2(r.inputWork)} J = work out ${r2(r.outputWork)} J, MA = ${r2(r.actualMA)}.` },
    ],
    lesson: 'With n supporting strands: effort = load ÷ n, rope pulled = n × the rise of the load, so the work is unchanged. A pulley system trades force for distance.',
  },
  {
    id: 'C', title: 'More strands, and the weight of the movable block', goal: 'Find the mechanical advantage of four strands and see why a heavy movable block makes the output work smaller than the input work.',
    routes: [
      { id: 'pc1', label: 'A 20 kg load raised 1 m with 4 supporting strands and a 2 kg movable block (frictionless rope and axles)', setup: pu({ massKg: 20, strands: 4, blockKg: 2, lift: 1 }), prompt: 'Compared with the ideal effort of 50 N (massless block), the effort and the input work are:',
        options: [{ label: '55 N and 220 J: the work you do exceeds the 200 J of useful work', holds: (r) => near(r.effort, 55) && near(r.inputWork, 220), why: 'The movable block (20 N) is lifted too: effort = (200 + 20) ÷ 4 = 55 N, work in = 55 × 4 = 220 J. 200 J is useful; the other 20 J is stored as potential energy of the block.' }, { label: '50 N and 200 J, the block does not matter', holds: (r) => near(r.effort, 50), why: 'The block is lifted with the load, so its weight adds to what the strands carry.' }, { label: '55 N and 200 J', holds: (r) => near(r.effort, 55) && near(r.inputWork, 200), why: 'The effort acts over 4 m of rope: 55 × 4 = 220 J, which is more than the 200 J of useful work.' }],
        explain: (r) => `Effort ${r2(r.effort)} N, work in ${r2(r.inputWork)} J, useful work ${r2(r.outputWork)} J, energy stored in the block ${r2(r.storedInBlock)} J; MA = ${r2(r.actualMA)} (the ideal value is ${r2(r.idealMA)}).` },
    ],
    lesson: 'Useful work out ≤ work in. Here the difference is not lost: it is the potential energy given to the movable block, which follows from its mass, not from an assumed efficiency.',
  },
];

export const LEVER_EXPERIMENTS: MExperiment<LeverSetup, LeverResult>[] = [
  {
    id: 'A', title: 'The lever balances', goal: 'Find the effort that balances a load: effort × effort arm = load × load arm.',
    routes: [
      { id: 'la1', label: 'A 10 kg load (100 N) hangs 0.5 m from the fulcrum. The effort acts 2 m from the fulcrum on the other side (Class I). Apply 25 N', setup: lv({ loadKg: 10, loadArm: 0.5, effortArm: 2, kind: 'I', effort: 25 }), prompt: 'What happens to the load?',
        options: [{ label: 'It is balanced: 25 N × 2 m = 100 N × 0.5 m', holds: (r) => r.state === 'balanced', why: 'Torques about the fulcrum: effort × effort arm = 25 × 2 = 50 N m and load × load arm = 100 × 0.5 = 50 N m. They are equal, so the lever balances.' }, { label: 'The load goes down, because it is heavier', holds: (r) => r.state === 'load falls', why: 'A heavier load can be balanced by a smaller effort if the effort arm is longer. Compare the products, not the forces: 25 × 2 = 100 × 0.5.' }, { label: 'The load rises', holds: (r) => r.state === 'load rises', why: 'The effort times its arm equals the load times its arm, so there is no net turning effect.' }],
        explain: (r) => `Effort turning effect ${r2(r.effortTorque)} N m, load turning effect ${r2(r.loadTorque)} N m: ${r.state}. The balancing effort is ${r2(r.balanceEffort)} N, MA = ${r2(r.mechanicalAdvantage)} = L₁ ÷ L₂.` },
    ],
    lesson: 'The lever balances when effort × effort arm = load × load arm (Eq. 7.15). The mechanical advantage is the ratio of the arms, L₁ ÷ L₂.',
  },
  {
    id: 'B', title: 'The seesaw', goal: 'Balance a seesaw with children of different masses (the textbook\'s seesaw example).',
    routes: [
      { id: 'lb1', label: 'A 30 kg child sits 1 m from the fulcrum (load 300 N). A 15 kg child (150 N) sits 2 m away on the other side', setup: lv({ loadKg: 30, loadArm: 1, effortArm: 2, kind: 'I', effort: 150 }), prompt: 'The seesaw is:',
        options: [{ label: 'balanced: 150 N × 2 m = 300 N × 1 m', holds: (r) => r.state === 'balanced', why: 'The lighter child sits twice as far from the fulcrum, so the two turning effects (300 N m) are equal.' }, { label: 'tilted towards the heavier child', holds: (r) => r.state === 'load falls', why: 'Distance matters as much as weight: 150 × 2 = 300 = 300 × 1.' }],
        explain: (r) => `Both turning effects are ${r2(r.effortTorque)} N m: ${r.state}.` },
      { id: 'lb2', label: 'Now the 15 kg child moves to 1 m from the fulcrum (the same distance as the heavy child)', setup: lv({ loadKg: 30, loadArm: 1, effortArm: 1, kind: 'I', effort: 150 }), prompt: 'The seesaw now:',
        options: [{ label: 'tilts towards the heavier child: 150 × 1 < 300 × 1', holds: (r) => r.state === 'load falls', why: 'At equal distances the heavier child has the bigger turning effect (300 N m against 150 N m), so that side goes down.' }, { label: 'stays balanced', holds: (r) => r.state === 'balanced', why: 'Balance needs equal turning effects. At equal distances the larger weight wins.' }],
        explain: (r) => `Effort turning effect ${r2(r.effortTorque)} N m, load turning effect ${r2(r.loadTorque)} N m: net ${r2(r.netTorque)} N m, the load side ${r.state === 'load falls' ? 'goes down' : 'rises'}.` },
    ],
    lesson: 'Seesaw balance: weight₁ × distance₁ = weight₂ × distance₂. A lighter child must sit farther from the fulcrum.',
  },
  {
    id: 'C', title: 'The three classes of lever', goal: 'Compare the mechanical advantage of Class I, II and III levers.',
    routes: [
      { id: 'lc1', label: 'Class II (a wheelbarrow): a 40 kg load (400 N) is 0.4 m from the wheel (fulcrum); the handles, where you lift, are 1.2 m from the wheel', setup: lv({ loadKg: 40, loadArm: 0.4, effortArm: 1.2, kind: 'II', effort: 0 }), prompt: 'The effort needed to lift the load slowly is:',
        options: [{ label: 'about 133 N: a mechanical advantage of 3', holds: (r) => near(r.balanceEffort, 400 / 3, 1e-6) && near(r.mechanicalAdvantage, 3), why: 'F₁ = load × L₂ ÷ L₁ = 400 × 0.4 ÷ 1.2 ≈ 133 N. In a Class II lever the effort arm is always longer than the load arm, so the mechanical advantage is always greater than 1.' }, { label: '400 N, the full load', holds: (r) => near(r.balanceEffort, 400), why: 'That is the effort with equal arms. The longer effort arm reduces the effort.' }],
        explain: (r) => `Balancing effort ${r2(r.balanceEffort)} N, MA = ${r2(r.mechanicalAdvantage)}.` },
      { id: 'lc2', label: 'Class III (tweezers or a broom): a 1 kg load (10 N) is 0.3 m from the fulcrum; the effort acts 0.1 m from the fulcrum', setup: lv({ loadKg: 1, loadArm: 0.3, effortArm: 0.1, kind: 'III', effort: 0 }), prompt: 'The effort needed, and the mechanical advantage, are:',
        options: [{ label: '30 N, a mechanical advantage of 1/3 (less than 1)', holds: (r) => near(r.balanceEffort, 30) && near(r.mechanicalAdvantage, 1 / 3, 1e-6), why: 'F₁ = 10 × 0.3 ÷ 0.1 = 30 N: three times the load. A Class III lever has a mechanical advantage below 1; what you gain is distance and speed at the load end.' }, { label: '3.3 N, a mechanical advantage of 3', holds: (r) => near(r.balanceEffort, 10 / 3, 1e-6), why: 'The effort arm is shorter than the load arm here, so the effort must be larger than the load, not smaller.' }],
        explain: (r) => `Balancing effort ${r2(r.balanceEffort)} N for a load of ${r2(r.load)} N: MA = ${r2(r.mechanicalAdvantage)}.` },
    ],
    lesson: 'Class I: any mechanical advantage. Class II: always greater than 1. Class III: always less than 1 (a smaller force would be needed only by a longer effort arm).',
  },
  {
    id: 'D', title: 'Force and distance trade off', goal: 'Show that a lever creates no energy: the small effort moves farther and the work in equals the work out.',
    routes: [
      { id: 'ld1', label: 'The Class I lever with a 100 N load 0.5 m from the fulcrum and the balancing effort 2 m away is turned slowly through 5°', setup: lv({ loadKg: 10, loadArm: 0.5, effortArm: 2, kind: 'I', effort: 25, turnDeg: 5 }), prompt: 'The work done by the effort, compared with the work done on the load, is:',
        options: [{ label: 'equal (about 4.4 J each): the effort end moves 4 times farther', holds: (r) => near(r.effortWork, r.loadWork, 1e-6) && r.effortDistance > r.loadDistance * 3.99, why: 'The effort end is 4 times farther from the fulcrum, so it moves 4 times as far (0.17 m against 0.044 m). 25 N × 0.17 m = 100 N × 0.044 m ≈ 4.4 J.' }, { label: 'the effort does less work, because the force is smaller', holds: (r) => r.effortWork < r.loadWork - 1e-6, why: 'The smaller force acts over the longer distance, so the work is the same. A lever does not reduce the work.' }, { label: 'the load receives more work than the effort supplies', holds: (r) => r.loadWork > r.effortWork + 1e-6, why: 'That would create energy. An ideal lever only transfers the work from one end to the other.' }],
        explain: (r) => `Effort ${r2(r.balanceEffort)} N moves ${r2(r.effortDistance)} m: ${r2(r.effortWork)} J. Load ${r2(r.load)} N moves ${r2(r.loadDistance)} m: ${r2(r.loadWork)} J.` },
    ],
    lesson: 'A lever (like any ideal machine) transfers work: F₁d₁ = F₂d₂. It makes the force smaller by making the distance larger; it does not create energy.',
  },
];

export const rampOutcome = (r: RampRoute) => { const result = computeRamp(r.setup); return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) }; };
export const pulleyOutcome = (r: PulleyRoute) => { const result = computePulley(r.setup); return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) }; };
export const leverOutcome = (r: LeverRoute) => { const result = computeLever(r.setup); return { result, holdsIndex: r.options.map((o) => o.holds(result)).indexOf(true) }; };

