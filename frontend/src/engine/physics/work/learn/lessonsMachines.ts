/**
 * Class 9 Physics, Chapter 7: Units 4 and 5 lessons (PHY-3D). Lesson 8: power (Section 7.5, Eq. 7.11). Lesson 9: simple machines,
 * mechanical advantage, the pulley and the inclined plane (Sections 7.6, 7.6.1, 7.6.2, Eqs. 7.12 and 7.13, Activity 7.3).
 * Lesson 10: the lever (Section 7.6.3, Activities 7.4 and 7.5, Eqs. 7.14 to 7.16, Tables 7.1 and 7.2).
 * Wording, figures and numbers are original. Every figure is drawn from the Simple Machines or Power Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP, type LeverSetup, type PulleySetup, type RampSetup } from '../machines';
import { DEFAULT_POWER, type PowerSetup } from '../power';
import { derivationVisual, ind, leverVisual, numQ, pick, powerVisual, pulleyVisual, rampVisual } from './questions';

const plab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Power Laboratory', description, href: `/physics/work/power?experiment=${exp}`, buttonLabel: 'Open the Power Laboratory' });
const mlab = (app: string, exp: string, description: string): Investigation => ({ title: 'Try it in the Simple Machines Laboratory', description, href: `/physics/work/machines?apparatus=${app}&experiment=${exp}`, buttonLabel: 'Open the Simple Machines Laboratory' });
const pw = (o: Partial<PowerSetup>): PowerSetup => ({ ...DEFAULT_POWER, ...o });
const rp = (o: Partial<RampSetup>): RampSetup => ({ ...DEFAULT_RAMP, ...o });
const pu = (o: Partial<PulleySetup>): PulleySetup => ({ ...DEFAULT_PULLEY, ...o });
const lv = (o: Partial<LeverSetup>): LeverSetup => ({ ...DEFAULT_LEVER, ...o });

// ---------------------------------------------------------------------------
// Lesson 8: Power  (Section 7.5)
// ---------------------------------------------------------------------------

export const W8: EduLesson = {
  id: 'pw-l8', unitId: 'pw-unit-4', number: 8, title: 'Power: how fast work is done',
  objective: 'tell power from work, calculate the average power P = W ÷ t in watts, compare the power of different situations, and find the power needed to lift a load or to speed something up.',
  prerequisiteIds: ['pwp-units', 'pwp-algebra', 'pwp-weight'],
  objectives: [
    { id: 'meaning', label: 'Say what power measures and tell it from work' },
    { id: 'calc', label: 'Calculate power, work or time from P = W ÷ t' },
    { id: 'compare', label: 'Compare the power when the work or the time changes' },
    { id: 'apply', label: 'Find the power of lifting or of speeding up' },
  ],
  steps: [
    {
      id: 'pw31-rate', title: 'Same work, different times', phase: 'observe',
      paragraphs: [
        'Carry your bag up a flight of stairs to your classroom. Running up in one minute feels very different from walking up slowly in five minutes, even though the same work is done against gravity in both cases (the same mass raised through the same height). What differs is how quickly the work is done.',
        'The quantity that tells how quickly work is done is called power. Doing more work in the same time, or the same work in a shorter time, needs more power.',
      ],
      vocabulary: [{ term: 'power', meaning: 'the rate at which work is done' }],
      check: pick('chk-pw31-rate', 'Student A walks up a flight of stairs in 60 s and student B (the same mass) runs up in 15 s. Compare the work and the power.', [
        ['The same work, but B has the greater power', null],
        ['B does more work, so B has greater power', 'Both raise the same mass through the same height, so the work is the same. The difference is the time.', 'work_differs'],
        ['The same work and the same power', 'The work is the same but B does it in a quarter of the time, so B\'s power is 4 times larger.', 'time_ignored'],
      ], 'Power is the rate of doing work.', undefined, 'pw31-rate'),
    },
    {
      id: 'pw32-formula', title: 'Power = work ÷ time', phase: 'proof',
      paragraphs: [
        'Power is the rate at which work is done. The average power is the work done W divided by the time taken t: P = W ÷ t (Eq. 7.11). Doing more work in the same time needs more power, and so does doing the same work in a shorter time.',
        'Below is a short guided explanation of the relation. Change the work and the time and watch the numbers, answer the question in the key steps, and see the work-time graph: its slope is the power.',
      ],
      visual: derivationVisual('P', 'The explanation of P = W ÷ t.'),
      notice: 'The steeper line does the same work in less time: it has more power.',
      misconception: { wrong: 'A machine that does more work always has more power.', right: 'Power depends on the time too. A small machine working for a long time can do more work than a powerful one working for a short time.' },
      check: pick('chk-pw32-formula', 'The same work is done in half the time. What happens to the power?', [
        ['It doubles', null],
        ['It halves', 'Power = W ÷ t, so halving t doubles the power.', 'inverse_mistake'],
        ['It stays the same', 'The work is the same but the time is shorter, so the ratio W ÷ t is larger.', 'time_ignored'],
      ], 'Half the time: double the power.', undefined, 'pw32-formula'),
    },
    {
      id: 'pw33-unit', title: 'The watt', phase: 'reasoning',
      paragraphs: [
        'The SI unit of power is the watt (W), named after James Watt who built an efficient steam engine. 1 watt is 1 joule of work done each second: 1 W = 1 J s⁻¹. A larger unit is the kilowatt (1 kW = 1000 W).',
        'An older unit, the horsepower (hp), is still used for car engines and pumps: 1 hp = 746 W. Rearranging P = W ÷ t gives the work W = P × t: a 100 W lamp, for example, transfers 100 J every second.',
      ],
      check: pick('chk-pw33-unit', 'Which is the larger power: 1 kilowatt or 1 horsepower?', [
        ['1 kilowatt (1000 W is more than 746 W)', null],
        ['1 horsepower, because it sounds bigger', 'Compare in watts: 1 hp = 746 W and 1 kW = 1000 W, so 1 kW is larger.', 'unit_name'],
        ['They are equal', '1 hp = 746 W, not 1000 W.', 'unit_equal'],
      ], '1 kW = 1000 W > 746 W = 1 hp.', undefined, 'pw33-unit'),
    },
    {
      id: 'pw34-solve', title: 'Finding the power in problems', phase: 'apply',
      paragraphs: [
        'First find the work, then divide by the time. To raise a mass m through a height h slowly the work is W = m g h. To speed an object up from rest to a speed v the work is the kinetic energy it gains, W = ½ m v². For example a 60 kg person climbing 3 m in 4 s does 60 × 10 × 3 = 1800 J, so the power is 1800 ÷ 4 = 450 W.',
        'Try your own situation in the laboratory: choose "Lift a load" or "Speed up from rest", change the numbers and compare the power for different times.',
      ],
      visual: powerVisual({ setup: pw({ scenario: 'lift', massKg: 60, height: 3, timeS: 4 }), editable: true }, 'A 60 kg person raised 3 m in 4 s.'),
      notice: 'Change the time and see the work stay the same while the power changes.',
      check: pick('chk-pw34-solve', 'A pump raises 500 kg of water through 6 m in 100 s. Which is the correct way to find its average power?', [
        ['W = m g h = 500 × 10 × 6 = 30 000 J, then P = 30 000 ÷ 100 = 300 W', null],
        ['P = m g h = 500 × 10 × 6 = 30 000 W', 'm g h is the WORK in joules. Divide it by the time to get the power in watts.', 'work_for_power'],
        ['P = 100 ÷ 30 000', 'Power is the work divided by the time, not the time divided by the work.', 'inverted'],
      ], 'Find the work first, then divide by the time.', undefined, 'pw34-solve'),
    },
  ],
  investigation: plab('A', 'Compare walking and running up the same stairs: the same work and different power.'),
  worked: {
    id: 'w-pw-l8', title: 'A person climbing stairs',
    given: ['A 60 kg person climbs stairs 3 m high in 4 s.', 'Take g = 10 m/s².'], ask: 'What is the work done against gravity and the average power?',
    visual: powerVisual({ setup: pw({ scenario: 'lift', massKg: 60, height: 3, timeS: 4 }) }, 'A 60 kg person raised 3 m in 4 s.'),
    steps: [
      { text: 'Work against gravity: W = m g h = 60 × 10 × 3 = 1800 J.', why: 'The person is raised slowly, so the work is the gain in potential energy.' },
      { text: 'Power = work ÷ time = 1800 J ÷ 4 s = 450 W.', why: 'P = W ÷ t (Eq. 7.11).' },
      { text: 'In horsepower: 450 ÷ 746 ≈ 0.6 hp.', why: '1 hp = 746 W.' },
      { text: 'If the same climb took 8 s, the work would still be 1800 J but the power would be 225 W.', why: 'The same work in twice the time needs half the power.' },
    ],
    verify: 'Check the units: joules ÷ seconds = watts. In 1 s the person does 450 J of work, and in 4 s 4 × 450 = 1800 J.',
  },
  guided: {
    id: 'g-pw-l8', prompt: 'A 1200 kg car starts from rest and reaches 25 m/s in 10 s. The work done by the engine is the kinetic energy the car gains.',
    steps: [
      { id: 'g1', prompt: 'The work.', question: numQ('pw-g8-1', 'What kinetic energy does the car gain, in joules?', 375000, 'K = ½ × 1200 × 25² = ½ × 1200 × 625 = 375 000 J.', { unit: 'J', refresherId: 'pw34-solve', rules: [[[30000], 'You did not square the speed or left out the ½: use ½ m v² with v² = 625.', 'formula_misused'], [[750000], 'You left out the ½. K = ½ m v².', 'forgot_half']] }), hints: ['K = ½ m v².'] },
      { id: 'g2', prompt: 'The power.', question: numQ('pw-g8-2', 'What is the average power of the engine, in watts?', 37500, 'P = W ÷ t = 375 000 ÷ 10 = 37 500 W.', { unit: 'W', refresherId: 'pw32-formula', rules: [[[3750000], 'You multiplied by the time. Power is the work divided by the time.', 'multiplied'], [[375000], 'That is the work in joules. Divide by the 10 s.', 'work_for_power']] }), hints: ['Divide the work by the time.'] },
      { id: 'g3', prompt: 'Kilowatts.', question: numQ('pw-g8-3', 'Express the power in kilowatts.', 37.5, '37 500 W ÷ 1000 = 37.5 kW.', { unit: 'kW', refresherId: 'pw33-unit', rules: [[[37500000], 'You multiplied by 1000. 1 kW is 1000 W, so divide.', 'wrong_direction_conversion']] }), hints: ['1 kW = 1000 W.'] },
    ],
    conclusion: 'P = W ÷ t = 375 000 J ÷ 10 s = 37 500 W = 37.5 kW (about 50 hp).',
  },
  independent: [
    ind('i1', 'What power is', 'meaning', 'Power or work?', pick('pw-l8-i1', 'What does power measure?', [
      ['How fast work is done (the rate of doing work)', null],
      ['How much work is done', 'That is the work itself, measured in joules. Power also involves the time.', 'work_for_power'],
      ['How large the force is', 'The force is measured in newtons. Power is work divided by time, in watts.', 'force_for_power'],
    ], 'Power is the rate of doing work.', undefined, 'pw31-rate'), ['Think of walking and running up stairs.'], ['The rate of doing work.']),
    ind('i2', 'What power is', 'meaning', 'Two students.', pick('pw-l8-i2', 'Two students do the same work: A in 2 minutes and B in 5 minutes. Who has the greater power?', [
      ['A, who took the shorter time', null],
      ['B, who took longer and so did more', 'Taking longer does not mean more work here: the work is the same, and the shorter time means the greater power.', 'time_longer_more'],
      ['Both have the same power, because the work is the same', 'Power also depends on the time. A is quicker, so A has the greater power.', 'time_ignored'],
    ], 'Same work: less time, more power.', undefined, 'pw32-formula'), ['Compare W ÷ t for each.'], ['A.']),
    ind('i3', 'Using P = W ÷ t', 'calc', 'Finding power.', numQ('pw-l8-i3', 'A machine does 600 J of work in 8 s. What is its average power, in watts?', 75, 'P = 600 ÷ 8 = 75 W.', { unit: 'W', refresherId: 'pw32-formula', rules: [[[4800], 'You multiplied. Power is the work divided by the time.', 'multiplied'], [[0.013], 'You divided the time by the work. P = W ÷ t.', 'inverted']] }), ['Divide the work by the time.'], ['600 ÷ 8 = 75 W.']),
    ind('i4', 'Using P = W ÷ t', 'calc', 'Finding work.', numQ('pw-l8-i4', 'A machine of power 250 W runs for 20 s. How much work does it do, in joules?', 5000, 'W = P × t = 250 × 20 = 5000 J.', { unit: 'J', refresherId: 'pw33-unit', rules: [[[12.5], 'You divided the power by the time. W = P × t.', 'inverted'], [[270], 'You added. Work is power times time.', 'added']] }), ['W = P × t.'], ['250 × 20 = 5000 J.']),
    ind('i5', 'Comparing', 'compare', 'Slower.', pick('pw-l8-i5', 'The same work is done in three times as long. The average power becomes:', [
      ['one third as large', null],
      ['three times as large', 'A longer time means a smaller power: P = W ÷ t.', 'inverse_mistake'],
      ['the same', 'The work is the same but the time is three times as long, so the ratio is one third.', 'time_ignored'],
    ], 'Triple the time: one third of the power.', undefined, 'pw32-formula'), ['W ÷ (3t)'], ['One third.']),
    ind('i6', 'Comparing', 'compare', 'Twice the work.', pick('pw-l8-i6', 'A machine does twice the work in half the time. Compare its power with before.', [
      ['4 times as large', null],
      ['2 times as large', 'Both changes increase the power, so the factors multiply: 2 × 2 = 4.', 'one_change_only'],
      ['the same', 'More work and less time both increase the power.', 'cancel_mistake'],
    ], '2 × 2 = 4.', undefined, 'pw32-formula'), ['(2W) ÷ (t/2)'], ['Four times.']),
    ind('i7', 'Lifting and speeding up', 'apply', 'A climber.', numQ('pw-l8-i7', 'A 50 kg boy climbs a hill 4 m high in 10 s. What is his average power against gravity, in watts? (g = 10 m/s²)', 200, 'W = m g h = 50 × 10 × 4 = 2000 J; P = 2000 ÷ 10 = 200 W.', { unit: 'W', refresherId: 'pw34-solve', rules: [[[2000], 'That is the work in joules. Divide by the 10 s.', 'work_for_power'], [[20], 'You left out g: the work is m g h = 2000 J.', 'g_missing']] }), ['Find the work first.'], ['200 W.']),
    ind('i8', 'Lifting and speeding up', 'apply', 'A speeding scooter.', numQ('pw-l8-i8', 'An 800 kg car reaches 15 m/s from rest in 9 s. What is the average power needed, in watts?', 10000, 'W = ½ × 800 × 15² = 90 000 J; P = 90 000 ÷ 9 = 10 000 W.', { unit: 'W', refresherId: 'pw34-solve', rules: [[[90000], 'That is the work in joules. Divide by the 9 s.', 'work_for_power'], [[1333], 'You used m v ÷ t without squaring the speed or halving; use W = ½ m v².', 'formula_misused']] }), ['The work is the kinetic energy gained.'], ['10 000 W.']),
  ],
  reflection: {
    discover: 'Power is the rate at which work is done: P = W ÷ t, measured in watts (1 W = 1 J/s; 1 kW = 1000 W; 1 hp = 746 W). The same work in a shorter time needs more power. The work of lifting is mgh and the work of speeding up from rest is ½mv²; divide it by the time for the power.',
    evidence: 'You told power from work, calculated it, compared it for different times and found the power of lifting and of speeding up.',
    stillConfusing: [{ text: 'What is the difference between work and power?', refresherId: 'pw31-rate' }, { text: 'Why is P = W ÷ t?', refresherId: 'pw32-formula' }, { text: 'What are watts and horsepower?', refresherId: 'pw33-unit' }, { text: 'How do I find the work first?', refresherId: 'pw34-solve' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 9: Simple machines, the pulley and the inclined plane  (Sections 7.6, 7.6.1, 7.6.2)
// ---------------------------------------------------------------------------

export const W9: EduLesson = {
  id: 'pw-l9', unitId: 'pw-unit-5', number: 9, title: 'Simple machines: pulley and inclined plane',
  objective: 'explain how a simple machine changes the effort needed but not the work, find the mechanical advantage of a pulley system and of an inclined plane, and follow the rope and ramp relations.',
  prerequisiteIds: ['pwp-force', 'pwp-weight', 'pwp-ratio'],
  objectives: [
    { id: 'ma', label: 'Say what effort, load and mechanical advantage are' },
    { id: 'pulley', label: 'Find the effort and the rope pulled for a pulley system' },
    { id: 'ramp', label: 'Find the effort and mechanical advantage of an inclined plane' },
    { id: 'tradeoff', label: 'Explain that a machine reduces the force but not the work' },
  ],
  steps: [
    {
      id: 'pw35-machine', title: 'Making a task easier: effort, load and mechanical advantage', phase: 'observe',
      paragraphs: [
        'In daily life we often lift or move heavy things. The total work needed cannot be reduced, but it can be made easier by changing the size or the direction of the force we apply. Devices that do this are called simple machines. Here we study three: a pulley, an inclined plane and a lever.',
        'The force we apply to a machine is the effort, and the force that has to be overcome is the load. The mechanical advantage tells how much the machine changes the force: mechanical advantage = load ÷ effort (Eq. 7.12). A mechanical advantage greater than 1 means a smaller effort than the load.',
      ],
      vocabulary: [{ term: 'effort', meaning: 'the force we apply to a machine' }, { term: 'load', meaning: 'the force the machine has to overcome' }, { term: 'mechanical advantage', meaning: 'load ÷ effort' }],
      check: pick('chk-pw35-machine', 'A machine lifts a 300 N load with an effort of 100 N. What is its mechanical advantage?', [
        ['3 (load ÷ effort)', null],
        ['0.33', 'That is effort ÷ load. The mechanical advantage is load ÷ effort.', 'inverted'],
        ['400', 'You added. The mechanical advantage is a ratio: 300 ÷ 100.', 'added'],
      ], 'MA = load ÷ effort.', undefined, 'pw35-machine'),
    },
    {
      id: 'pw36-pulley', title: 'The pulley', phase: 'observe',
      paragraphs: [
        'A pulley is a wheel with a groove that guides a rope. A flag or a load is raised by pulling the rope down over a fixed pulley at the top. A fixed pulley does not reduce the force: the effort equals the load, so the mechanical advantage is 1. It only changes the direction of the effort, which is more convenient because it is easier to pull down than to lift up.',
        'A movable pulley, or a system of pulleys, can have a mechanical advantage greater than 1: the load hangs from the movable pulley, one end of the rope is fixed and the other end is pulled. If n strands of rope support the load, each carries 1/n of it, so the effort is the load ÷ n. But to raise the load by 1 m, every strand must shorten by 1 m, so the rope you pull is n times the rise of the load: the rope and the load are linked.',
      ],
      visual: pulleyVisual({ setup: pu({ massKg: 20, strands: 2, lift: 1 }), editable: true }, 'A 20 kg load raised 1 m by a pulley system with two supporting strands.'),
      notice: 'Pull the rope with the slider: compare the rope pulled with the rise of the load, and the work in with the work out. Change the number of strands.',
      check: pick('chk-pw36-pulley', 'A pulley system has 4 supporting strands and is used to raise a load by 1 m. Ignoring the weight of the pulleys, how much rope must be pulled?', [
        ['4 m of rope', null],
        ['1 m of rope', 'Each of the 4 supporting strands must shorten by 1 m, so 4 m of rope pass through your hands.', 'rope_equals_rise'],
        ['0.25 m of rope', 'The rope pulled is more, not less, than the rise: you pull a smaller force over a longer distance.', 'inverted'],
      ], 'Rope pulled = strands × rise.', undefined, 'pw36-pulley'),
    },
    {
      id: 'pw37-ramp', title: 'The inclined plane: F′ × L = mgh', phase: 'proof',
      paragraphs: [
        'To raise a box of mass m to a platform at height h, lifting it straight up needs a force mg. Pushing it up a smooth ramp of length L at a steady speed needs a smaller force F′. The work done by you is F′ × L, and the potential energy gained is mgh, so with no friction F′ × L = mgh, which gives F′ ÷ mg = h ÷ L. The mechanical advantage is mg ÷ F′ = L ÷ h.',
        'A longer ramp (a gentler slope) reduces the effort further, but the effort acts over a longer distance. Work through the derivation below, change the numbers and supply the reasoning for the key steps.',
      ],
      visual: derivationVisual('R', 'The derivation of F′ × L = m g h and MA = L ÷ h for an inclined plane.'),
      notice: 'Make the ramp longer and watch the effort fall while F′ × L stays at m g h.',
      check: pick('chk-pw37-ramp', 'A ramp 5 m long raises a load to a height of 1 m. On a smooth ramp, the effort is what fraction of the load?', [
        ['one fifth (h ÷ L = 1 ÷ 5)', null],
        ['five times', 'The effort is smaller than the load, not larger: F′ = load × h ÷ L.', 'inverted'],
        ['the same as the load', 'The ramp reduces the effort. F′ = load × (1 ÷ 5).', 'effort_constant'],
      ], 'F′ = load × h ÷ L.', undefined, 'pw37-ramp'),
    },
    {
      id: 'pw38-ramplab', title: 'Ramps in practice: gentle slopes and friction', phase: 'apply',
      paragraphs: [
        'Roads on hills wind around in gentle slopes instead of going straight up because a longer, gentler road needs a smaller force from the engine for the same gain in height, just as a longer ramp needs a smaller effort. In the same way climbing an inclined ladder is easier than a vertical one.',
        'In practice a ramp has friction. Then the effort must also overcome friction, so it is larger than for a smooth ramp, and the work you do is greater than the useful work mgh: the extra becomes thermal energy. Try it below, with a friction coefficient of 0.3.',
      ],
      visual: rampVisual({ setup: rp({ massKg: 20, height: 1, length: 4, mu: 0.3 }), editable: true }, 'A 20 kg load pushed up a 4 m ramp to a height of 1 m, with friction.'),
      notice: 'Compare the work you do with the useful work. Where does the difference go?',
      check: pick('chk-pw38-ramplab', 'A ramp has friction. Compared with a smooth ramp of the same length and height, the work you do is:', [
        ['greater, and the extra becomes thermal energy', null],
        ['the same', 'Friction opposes the motion up the ramp, so you must do extra work against it.', 'friction_ignored'],
        ['smaller, because friction helps to hold the load', 'Friction acts down the slope while you push up, so it increases the work you have to do.', 'friction_helps'],
      ], 'Friction adds extra work, which becomes thermal energy.', undefined, 'pw38-ramplab'),
    },
    {
      id: 'pw39-notwork', title: 'Machines reduce the force, not the work', phase: 'reasoning',
      paragraphs: [
        'In each machine the effort is smaller (or more convenient) but it acts over a longer distance: a ramp\'s length, the rope pulled through a pulley system. The work done by the effort, force × distance, is the same as the useful work done on the load. The conservation of mechanical energy holds: the work put in equals the useful work done on the load, ignoring friction. Machines do not create energy; they only help us use it more effectively.',
        'Real machines have friction and the weight of their moving parts, so the useful work out is always less than the work put in, and the difference becomes thermal energy (or is stored in the parts that are lifted). That is also why every real "perpetual motion" machine has failed: friction takes mechanical energy away and nothing puts it back.',
      ],
      misconception: { wrong: 'A machine can give out more work than is put in.', right: 'An ideal machine gives out exactly the work put in; a real machine gives out less. No machine creates energy.' },
      check: pick('chk-pw39-notwork', 'A real pulley system raises a load. Compare the work the effort does with the useful work done on the load.', [
        ['The work done by the effort is greater than or equal to the useful work; the rest is thermal energy (or stored in moving parts)', null],
        ['The useful work is greater, because the machine multiplies the work', 'Machines multiply the force, not the work. No machine can give out more work than is put in.', 'machine_creates_work'],
        ['They are always exactly equal', 'They are equal only for an ideal machine. Friction and the weight of the movable parts make the useful work smaller.', 'always_ideal'],
      ], 'Work out ≤ work in; equal only for an ideal machine.', undefined, 'pw39-notwork'),
    },
  ],
  investigation: mlab('ramp', 'A', 'Make the ramp longer and watch the effort fall while the work stays the same.'),
  worked: {
    id: 'w-pw-l9', title: 'A ramp over a step',
    given: ['A ramp lifts an object over a step 0.5 m high.', 'The ramp is 1.2 m wide (measured along the floor).'], ask: 'What is the length of the ramp and its mechanical advantage (smooth ramp)?',
    visual: rampVisual({ setup: rp({ massKg: 10, height: 0.5, length: 1.3 }) }, 'A ramp 0.5 m high and 1.2 m wide (1.3 m long).'),
    steps: [
      { text: 'The height, the width and the ramp form a right-angled triangle, with the ramp as the longest side.', why: 'The step is vertical and the floor is horizontal.' },
      { text: 'L = √(0.5² + 1.2²) = √(0.25 + 1.44) = √1.69 = 1.3 m.', why: 'The Pythagoras relation a² + b² = c².' },
      { text: 'Mechanical advantage = L ÷ h = 1.3 ÷ 0.5 = 2.6.', why: 'MA = load ÷ effort = L ÷ h on a smooth ramp (Eq. 7.13).' },
      { text: 'So the effort is the load ÷ 2.6, about 38% of the load, but it acts over 1.3 m instead of 0.5 m.', why: 'The smaller force acts over a longer distance: the work is the same.' },
    ],
    verify: 'Check: effort × length = (load ÷ 2.6) × 1.3 = load × 0.5 = load × h. The work is unchanged.',
  },
  guided: {
    id: 'g-pw-l9', prompt: 'A 24 kg load is raised 1.5 m by an ideal pulley system with two supporting strands (g = 10 m/s²).',
    visual: pulleyVisual({ setup: pu({ massKg: 24, strands: 2, lift: 1.5 }) }, 'A 24 kg load raised 1.5 m by two strands.'),
    steps: [
      { id: 'g1', prompt: 'The effort.', question: numQ('pw-g9-1', 'What effort is needed, in newtons?', 120, 'The load is 24 × 10 = 240 N and each of the 2 strands carries half: 120 N.', { unit: 'N', refresherId: 'pw36-pulley', rules: [[[240], 'That is the load. Two strands share it, so the effort is half of it.', 'load_for_effort'], [[12], 'You divided the mass by 2. The load is the weight 240 N.', 'mass_for_weight']] }), hints: ['The load is the weight, 240 N.'] },
      { id: 'g2', prompt: 'The rope.', question: numQ('pw-g9-2', 'How much rope must be pulled, in metres?', 3, 'Rope pulled = strands × rise = 2 × 1.5 = 3 m.', { unit: 'm', refresherId: 'pw36-pulley', rules: [[[1.5], 'That is the rise of the load. The rope pulled is 2 times the rise.', 'rope_equals_rise']] }), hints: ['Each strand shortens by the rise.'] },
      { id: 'g3', prompt: 'The work.', question: numQ('pw-g9-3', 'How much work does the effort do, in joules?', 360, 'W = 120 N × 3 m = 360 J, the same as m g h = 240 × 1.5.', { unit: 'J', refresherId: 'pw39-notwork', rules: [[[180], 'You used the rise 1.5 m instead of the 3 m of rope pulled.', 'rise_for_rope']] }), hints: ['The effort acts over the rope pulled.'] },
    ],
    conclusion: 'Effort 120 N × rope 3 m = 360 J = load 240 N × rise 1.5 m: a smaller force over a longer distance, the same work.',
  },
  independent: [
    ind('i1', 'Mechanical advantage', 'ma', 'A ratio.', numQ('pw-l9-i1', 'A load of 300 N is lifted by an effort of 100 N. What is the mechanical advantage?', 3, '300 ÷ 100 = 3.', { refresherId: 'pw35-machine', rules: [[[0.33], 'That is effort ÷ load. The mechanical advantage is load ÷ effort.', 'inverted'], [[200], 'You subtracted. The mechanical advantage is a ratio.', 'subtracted']] }), ['Load ÷ effort.'], ['3.']),
    ind('i2', 'Mechanical advantage', 'ma', 'A fixed pulley.', pick('pw-l9-i2', 'What is the mechanical advantage of a single fixed pulley, and what does it do?', [
      ['1: it only changes the direction of the effort', null],
      ['2: it halves the effort', 'Halving the effort needs a movable pulley with two strands. A fixed pulley has the same effort as the load.', 'fixed_halves'],
      ['0: it does no work', 'A fixed pulley still allows work to be done: it makes it convenient (pulling down), with an effort equal to the load.', 'ma_zero'],
    ], 'Fixed pulley: MA = 1, direction only.', undefined, 'pw36-pulley'), ['Compare the effort with the load.'], ['1.']),
    ind('i3', 'Pulley system', 'pulley', 'Four strands.', numQ('pw-l9-i3', 'An ideal pulley system with 4 supporting strands raises a 200 N load. What effort is needed, in newtons?', 50, 'Each strand carries 1/4 of the load: 200 ÷ 4 = 50 N.', { unit: 'N', refresherId: 'pw36-pulley', rules: [[[800], 'You multiplied by 4. The strands share the load, so the effort is smaller.', 'multiplied'], [[200], 'That is the load. With 4 strands the effort is a quarter of it.', 'load_for_effort']] }), ['Effort = load ÷ strands.'], ['50 N.']),
    ind('i4', 'Pulley system', 'pulley', 'The rope.', numQ('pw-l9-i4', 'A load is raised 2 m with a system with 3 supporting strands. How much rope must be pulled, in metres?', 6, 'Rope pulled = 3 × 2 = 6 m.', { unit: 'm', refresherId: 'pw36-pulley', rules: [[[2], 'That is the rise. The rope pulled is 3 times the rise.', 'rope_equals_rise'], [[0.67], 'You divided. The rope pulled is longer than the rise.', 'inverted']] }), ['Strands × rise.'], ['6 m.']),
    ind('i5', 'Inclined plane', 'ramp', 'The ideal MA.', numQ('pw-l9-i5', 'A smooth ramp 5 m long raises a load to a platform 1 m high. What is the mechanical advantage?', 5, 'MA = L ÷ h = 5 ÷ 1 = 5.', { refresherId: 'pw37-ramp', rules: [[[0.2], 'That is h ÷ L. The mechanical advantage is L ÷ h.', 'inverted']] }), ['MA = L ÷ h.'], ['5.']),
    ind('i6', 'Inclined plane', 'ramp', 'The effort.', numQ('pw-l9-i6', 'A smooth ramp 4 m long raises a 200 N load through 1 m. What effort along the ramp is needed, in newtons?', 50, 'F′ = load × h ÷ L = 200 × 1 ÷ 4 = 50 N.', { unit: 'N', refresherId: 'pw37-ramp', rules: [[[800], 'You multiplied by L ÷ h. The ramp reduces the effort: F′ = load × h ÷ L.', 'inverted'], [[200], 'That is the load. The ramp reduces the effort to a quarter.', 'load_for_effort']] }), ['F′ × L = load × h.'], ['50 N.']),
    ind('i7', 'Force and work', 'tradeoff', 'The work in.', numQ('pw-l9-i7', 'An effort of 50 N pushes a load up a ramp 4 m long. How much work does the effort do, in joules?', 200, 'W = F′ × L = 50 × 4 = 200 J (= m g h = 200 × 1 for the 200 N load raised 1 m).', { unit: 'J', refresherId: 'pw39-notwork', rules: [[[12.5], 'You divided. Work is force times distance.', 'divided'], [[54], 'You added. Work is a product.', 'added']] }), ['Work = force × distance moved.'], ['50 × 4 = 200 J.']),
    ind('i8', 'Force and work', 'tradeoff', 'Machines and energy.', pick('pw-l9-i8', 'Which statement about machines is correct?', [
      ['A machine can reduce the force needed but not the work; a real machine needs more work than it gives out', null],
      ['A machine can multiply the work you put in', 'No machine can give out more work than it takes in; that would create energy.', 'machine_creates_work'],
      ['A machine reduces both the force and the work', 'The work stays the same for an ideal machine because the smaller force acts over a longer distance.', 'work_reduced'],
    ], 'Force reduced, work not.', undefined, 'pw39-notwork'), ['What does the smaller force trade for?'], ['It trades force for distance.']),
  ],
  reflection: {
    discover: 'A simple machine changes the effort needed, not the work. Mechanical advantage = load ÷ effort. A fixed pulley has MA 1 and only changes the direction; with n supporting strands the effort is load ÷ n and the rope pulled is n times the rise. A smooth ramp has F′ × L = mgh, so MA = L ÷ h. The work in equals the useful work out for an ideal machine and is greater for a real one because of friction.',
    evidence: 'You found efforts, rope lengths and mechanical advantages and explained why the work does not change.',
    stillConfusing: [{ text: 'What is mechanical advantage?', refresherId: 'pw35-machine' }, { text: 'How does a pulley system work?', refresherId: 'pw36-pulley' }, { text: 'Why is MA = L ÷ h?', refresherId: 'pw37-ramp' }, { text: 'What does friction change?', refresherId: 'pw38-ramplab' }, { text: 'Why can\'t machines reduce the work?', refresherId: 'pw39-notwork' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 10: The lever  (Section 7.6.3)
// ---------------------------------------------------------------------------

export const W10: EduLesson = {
  id: 'pw-l10', unitId: 'pw-unit-5', number: 10, title: 'The lever',
  objective: 'name the parts of a lever, use effort × effort arm = load × load arm to find an effort, a load or a position, tell the three classes apart, and explain that a lever trades force for distance without creating energy.',
  prerequisiteIds: ['pwp-force', 'pwp-ratio', 'pwp-units'],
  objectives: [
    { id: 'parts', label: 'Name the fulcrum, effort, load and the two arms' },
    { id: 'balance', label: 'Use effort × effort arm = load × load arm' },
    { id: 'classes', label: 'Tell the three classes of lever apart and their mechanical advantage' },
    { id: 'work', label: 'Explain that a lever trades force for distance, not work' },
  ],
  steps: [
    {
      id: 'pw40-parts', title: 'The fulcrum, the effort and the load', phase: 'observe',
      paragraphs: [
        'Rest a long scale across a pencil, with a stapler near the pencil on one end: a single eraser at the far end can lift it. The scale is a lever: a rigid bar that can turn about a fixed point, the fulcrum (here, where the scale touches the pencil). A lever has three parts: the fulcrum, the load (the force to be overcome) and the effort (the force applied).',
        'The distance of the load from the fulcrum is the load arm, and the distance of the effort from the fulcrum is the effort arm. By applying a small effort at the far end, a larger force can be applied to the load at the other end.',
      ],
      vocabulary: [{ term: 'fulcrum', meaning: 'the fixed point about which a lever turns' }, { term: 'effort arm', meaning: 'the distance from the fulcrum to the effort' }, { term: 'load arm', meaning: 'the distance from the fulcrum to the load' }],
      check: pick('chk-pw40-parts', 'In a lever made of a ruler resting on a pencil, which part is the fulcrum?', [
        ['The point where the ruler rests on the pencil', null],
        ['The eraser placed on the end of the ruler', 'The eraser provides the effort (a force). The fulcrum is the fixed point the bar turns about.', 'effort_for_fulcrum'],
        ['The stapler to be lifted', 'The stapler is the load. The fulcrum is the fixed point.', 'load_for_fulcrum'],
      ], 'The fulcrum is the fixed turning point.', undefined, 'pw40-parts'),
    },
    {
      id: 'pw41-balance', title: 'Effort × effort arm = load × load arm', phase: 'proof',
      paragraphs: [
        'Activity 7.5: hang pans from the ends of a beam and add coins. With 1 coin on each side the beam balances at equal distances; with 2 coins on one side it balances when that side is moved to half the distance. The result is n₁ × L₁ = n₂ × L₂, that is effort × effort arm = load × load arm (Eq. 7.15). The mechanical advantage is the ratio of the arms: MA = load ÷ effort = effort arm ÷ load arm (Eq. 7.16).',
        'Why? Turn the lever slowly by a small angle. The effort end moves a distance d₁ and the load end d₂, in proportion to their distances from the fulcrum. An ideal lever only transfers work: F₁ × d₁ = F₂ × d₂ (Eq. 7.14), which leads to the balance relation. Follow the reasoning below, change the numbers and supply the missing steps.',
      ],
      visual: derivationVisual('L', 'The derivation of F₁d₁ = F₂d₂, F₁L₁ = F₂L₂ and MA = L₁ ÷ L₂ for a lever.'),
      notice: 'Change the arms and see how far each end moves for the same turn.',
      check: pick('chk-pw41-balance', 'A load of 60 N hangs 0.2 m from the fulcrum. What effort, applied 0.6 m from the fulcrum on the other side, balances it?', [
        ['20 N: 20 × 0.6 = 60 × 0.2', null],
        ['180 N', 'The longer effort arm needs a smaller effort. F₁ = load × L₂ ÷ L₁ = 60 × 0.2 ÷ 0.6.', 'inverted'],
        ['60 N: effort equals load', 'The effort equals the load only for equal arms. A longer effort arm needs a smaller effort.', 'equal_arms'],
      ], 'F₁ = load × load arm ÷ effort arm.', undefined, 'pw41-balance'),
    },
    {
      id: 'pw42-lab', title: 'The seesaw and the Lever Laboratory', phase: 'apply',
      paragraphs: [
        'A seesaw is a lever with the fulcrum in the middle. Two children balance it when weight₁ × distance₁ = weight₂ × distance₂: if one child is twice as heavy, the lighter child must sit twice as far from the fulcrum. Try it: the load is the heavier child (300 N, 1 m from the fulcrum) and the effort is the lighter child (150 N).',
        'Move the lighter child\'s seat (the effort arm), change the weights, and see when the lever balances and which side goes down. Check the products "effort × effort arm" and "load × load arm".',
      ],
      visual: leverVisual({ setup: lv({ loadKg: 30, loadArm: 1, effortArm: 2, kind: 'I', effort: 150 }), editable: true }, 'A seesaw: a 30 kg child (300 N) 1 m from the fulcrum balanced by a 15 kg child (150 N) 2 m away.'),
      notice: 'The lever balances when the two products are equal. Change the effort arm to 1 m and see which side falls.',
      check: pick('chk-pw42-lab', 'On a balanced seesaw an adult weighs twice as much as a child. Where must the child sit compared with the adult?', [
        ['Twice as far from the fulcrum as the adult', null],
        ['Half as far from the fulcrum as the adult', 'The lighter child needs the longer arm: w × L_child = 2w × L_adult gives L_child = 2 × L_adult.', 'inverted'],
        ['At the same distance', 'At equal distances the heavier adult has the bigger turning effect and goes down.', 'equal_arms'],
      ], 'Lighter person: longer arm.', undefined, 'pw42-lab'),
    },
    {
      id: 'pw43-classes', title: 'The three classes of lever', phase: 'reasoning',
      paragraphs: [
        'Levers are of three classes, depending on the positions of the effort, the fulcrum and the load. Class I: the fulcrum is between the effort and the load (a seesaw, scissors, pliers, a crowbar, a balance). Class II: the load is between the fulcrum and the effort (a wheelbarrow, a bottle opener, a lemon squeezer). Class III: the effort is between the fulcrum and the load (tweezers, a broom, an oar, a hammer).',
        'In a Class II lever the effort arm is longer than the load arm, so the mechanical advantage is always greater than 1. In a Class III lever the effort arm is shorter, so the mechanical advantage is less than 1: you need a larger force but you gain distance and speed at the load end. A Class I lever can have any mechanical advantage.',
      ],
      visual: leverVisual({ setup: lv({ loadKg: 40, loadArm: 0.4, effortArm: 1.2, kind: 'II', effort: 0 }), editable: true }, 'A Class II lever (like a wheelbarrow): a 40 kg load 0.4 m from the wheel, the handles 1.2 m away.'),
      notice: 'Switch between the classes. Which one gives a mechanical advantage below 1?',
      check: pick('chk-pw43-classes', 'Which class of lever always has a mechanical advantage greater than 1?', [
        ['Class II (the load is between the fulcrum and the effort)', null],
        ['Class III (the effort is between the fulcrum and the load)', 'In Class III the effort arm is shorter than the load arm, so the mechanical advantage is less than 1.', 'class_swapped'],
        ['Class I (the fulcrum is in the middle)', 'A Class I lever can have a mechanical advantage above, below or equal to 1, depending on the arms.', 'class_one_always'],
      ], 'Class II: MA > 1.', undefined, 'pw43-classes'),
    },
    {
      id: 'pw44-work', title: 'A lever creates no energy', phase: 'apply',
      paragraphs: [
        'The end of the lever where the small effort acts moves a longer distance, and the end that exerts the large force on the load moves a shorter distance. The work done at one end is transferred to the other: F₁ × d₁ = F₂ × d₂. A lever reduces the force required to do a task but not the total work done.',
        'This explains everyday things. It is easier to open the lid of a can with a spoon because the spoon makes a long effort arm. To cut something hard with scissors you push the object closer to the fulcrum: the load arm becomes shorter, so the effort needed is smaller. And no lever, or any machine, can create energy: perpetual motion machines fail because friction removes mechanical energy.',
      ],
      check: pick('chk-pw44-work', 'You use scissors to cut a hard object. Why do you push it closer to the fulcrum?', [
        ['A shorter load arm means a smaller effort is needed (a larger mechanical advantage)', null],
        ['Because the object moves less there, so it does less work', 'The work is not reduced; the load arm is shorter so the effort for the same cutting force is smaller.', 'work_reduced'],
        ['Because the scissors are stronger near the tip', 'It is the lever arms that matter: effort × effort arm = load × load arm.', 'strength_myth'],
      ], 'Shorter load arm: smaller effort.', undefined, 'pw44-work'),
    },
  ],
  investigation: mlab('lever', 'A', 'Balance a load with different effort arms and see the products.'),
  worked: {
    id: 'w-pw-l10', title: 'Lifting a rock with a crowbar',
    given: ['A crowbar (a Class I lever) is used to lift a 20 kg rock.', 'The rock presses 0.3 m from the fulcrum; you push down 1.5 m from the fulcrum on the other side.', 'Take g = 10 m/s².'], ask: 'What effort is needed to lift the rock slowly, and what is the mechanical advantage?',
    visual: leverVisual({ setup: lv({ loadKg: 20, loadArm: 0.3, effortArm: 1.5, kind: 'I', effort: 40 }) }, 'A crowbar: a 20 kg rock 0.3 m from the fulcrum and the effort 1.5 m away.'),
    steps: [
      { text: 'The load is the weight of the rock: 20 × 10 = 200 N.', why: 'The load is the force to be overcome.' },
      { text: 'Effort × effort arm = load × load arm: F₁ × 1.5 = 200 × 0.3 = 60 N m.', why: 'Eq. 7.15 for a lever that is balanced or turned slowly.' },
      { text: 'F₁ = 60 ÷ 1.5 = 40 N.', why: 'Divide both sides by the effort arm.' },
      { text: 'Mechanical advantage = load ÷ effort = 200 ÷ 40 = 5, which equals the arm ratio 1.5 ÷ 0.3 = 5.', why: 'Eq. 7.16: MA = effort arm ÷ load arm.' },
    ],
    verify: 'Check the work: turning the bar so the effort end moves 0.5 m, the rock rises 0.1 m (5 times less): 40 × 0.5 = 20 J = 200 × 0.1.',
  },
  guided: {
    id: 'g-pw-l10', prompt: 'A 20 kg child and a 30 kg child balance a seesaw. The 30 kg child sits 1 m from the fulcrum (g = 10 m/s²).',
    steps: [
      { id: 'g1', prompt: 'The weights.', question: numQ('pw-g10-1', 'What is the weight of the 20 kg child, in newtons?', 200, '20 × 10 = 200 N.', { unit: 'N', refresherId: 'pw42-lab', rules: [[[20], 'You gave the mass. The weight is the force: multiply by 10.', 'mass_for_weight']] }), hints: ['Weight = m g.'] },
      { id: 'g2', prompt: 'The distance.', question: numQ('pw-g10-2', 'How far from the fulcrum must the 20 kg child sit, in metres?', 1.5, '200 × L = 300 × 1, so L = 1.5 m.', { unit: 'm', refresherId: 'pw41-balance', rules: [[[0.67], 'You swapped the weights. 200 × L = 300 × 1 gives L = 1.5.', 'inverted'], [[1], 'Equal distances balance only equal weights.', 'equal_arms']] }), hints: ['Weight₁ × distance₁ = weight₂ × distance₂.'] },
      { id: 'g3', prompt: 'Which sits farther?', question: pick('pw-g10-3', 'Which child sits farther from the fulcrum?', [
        ['The lighter child', null],
        ['The heavier child', 'The lighter child needs the longer arm to balance the heavier child\'s turning effect.', 'inverted'],
      ], 'Lighter: longer arm.', undefined, 'pw42-lab'), hints: ['Compare 1.5 m and 1 m.'] },
    ],
    conclusion: '200 N × 1.5 m = 300 N × 1 m: the lighter child sits 1.5 m from the fulcrum, farther than the heavier child.',
  },
  independent: [
    ind('i1', 'Parts', 'parts', 'The fixed point.', pick('pw-l10-i1', 'Which part of a lever is the fixed point about which it turns?', [
      ['The fulcrum', null],
      ['The load', 'The load is the force to be overcome.', 'load_for_fulcrum'],
      ['The effort', 'The effort is the force applied.', 'effort_for_fulcrum'],
    ], 'The fulcrum.', undefined, 'pw40-parts'), ['Think of the pencil under the ruler.'], ['The fulcrum.']),
    ind('i2', 'Parts', 'parts', 'The arms.', pick('pw-l10-i2', 'The effort arm of a lever is the distance from:', [
      ['the fulcrum to the point where the effort is applied', null],
      ['the load to the point where the effort is applied', 'The arms are measured from the fulcrum.', 'wrong_reference'],
      ['the fulcrum to the load', 'That is the load arm.', 'load_arm_for_effort_arm'],
    ], 'Arms are measured from the fulcrum.', undefined, 'pw40-parts'), ['Both arms start at the fulcrum.'], ['From the fulcrum to the effort.']),
    ind('i3', 'Balance', 'balance', 'An effort.', numQ('pw-l10-i3', 'A 60 N load is 0.2 m from the fulcrum. What effort applied 0.6 m from the fulcrum balances it, in newtons?', 20, 'F₁ × 0.6 = 60 × 0.2, so F₁ = 12 ÷ 0.6 = 20 N.', { unit: 'N', refresherId: 'pw41-balance', rules: [[[180], 'You multiplied by the arm ratio instead of dividing. F₁ = load × L₂ ÷ L₁.', 'inverted'], [[60], 'That would need equal arms.', 'equal_arms']] }), ['Effort × effort arm = load × load arm.'], ['20 N.']),
    ind('i4', 'Balance', 'balance', 'A seesaw.', numQ('pw-l10-i4', 'A 25 kg child sits 1.2 m from the fulcrum of a seesaw. How far from the fulcrum must a 50 kg child sit on the other side to balance it, in metres?', 0.6, '250 × 1.2 = 500 × L, so L = 300 ÷ 500 = 0.6 m.', { unit: 'm', refresherId: 'pw42-lab', rules: [[[2.4], 'You gave the distance for the lighter child. The heavier child sits closer.', 'inverted'], [[1.2], 'Equal distances balance equal weights only.', 'equal_arms']] }), ['The heavier child sits closer.'], ['0.6 m.']),
    ind('i5', 'Classes', 'classes', 'The wheelbarrow.', pick('pw-l10-i5', 'A wheelbarrow has the wheel at one end, the load in the middle and your hands at the other end. Which class of lever is it?', [
      ['Class II (the load is between the fulcrum and the effort)', null],
      ['Class I', 'In a Class I lever the fulcrum is between the load and the effort. In a wheelbarrow the wheel (the fulcrum) is at the end.', 'class_swapped'],
      ['Class III', 'In a Class III lever the effort is between the fulcrum and the load. Here the load is between.', 'class_swapped'],
    ], 'Load in the middle: Class II.', undefined, 'pw43-classes'), ['Where is the load relative to the other two?'], ['Class II.']),
    ind('i6', 'Classes', 'classes', 'Less than 1.', pick('pw-l10-i6', 'A pair of tweezers is a Class III lever (the effort is between the fulcrum and the load). Its mechanical advantage is:', [
      ['less than 1: you apply more force than the load, but gain distance', null],
      ['greater than 1', 'The effort arm is shorter than the load arm in Class III, so the mechanical advantage is below 1.', 'class_swapped'],
      ['exactly 1', 'The arms differ, so the mechanical advantage is not 1.', 'equal_arms'],
    ], 'Class III: MA < 1.', undefined, 'pw43-classes'), ['Compare the effort arm with the load arm.'], ['Less than 1.']),
    ind('i7', 'Force and distance', 'work', 'The load force.', numQ('pw-l10-i7', 'In an ideal lever the effort of 20 N moves 0.9 m while the load moves 0.3 m. What force does the lever exert on the load, in newtons?', 60, 'F₁ d₁ = F₂ d₂: 20 × 0.9 = F₂ × 0.3, so F₂ = 18 ÷ 0.3 = 60 N.', { unit: 'N', refresherId: 'pw44-work', rules: [[[6.7], 'You inverted the ratio. The load moves less, so its force is larger: F₂ = F₁ d₁ ÷ d₂.', 'inverted'], [[20], 'The load force is not equal to the effort, because the distances differ.', 'equal_forces']] }), ['Work in = work out.'], ['60 N.']),
    ind('i8', 'Force and distance', 'work', 'The scissors.', pick('pw-l10-i8', 'To cut a hard object with scissors, you place it closer to the fulcrum. This is because:', [
      ['the load arm is shorter, so a smaller effort is needed for the same cutting force', null],
      ['the scissors do less work there', 'The work is not smaller; the shorter load arm lets the same work be done with a smaller force acting over a longer distance.', 'work_reduced'],
      ['the effort arm gets longer', 'Moving the object changes the load arm, not the effort arm (where your fingers are).', 'wrong_arm'],
    ], 'Shorter load arm: smaller effort.', undefined, 'pw44-work'), ['Which arm changes when you move the object?'], ['The load arm becomes shorter.']),
  ],
  reflection: {
    discover: 'A lever turns about a fulcrum. It balances when effort × effort arm = load × load arm, so the mechanical advantage is the effort arm ÷ the load arm. Class I has the fulcrum between, Class II the load between (MA > 1), Class III the effort between (MA < 1). The effort moves farther than the load by the ratio of the arms, so the work in equals the work out: a lever reduces the force but creates no energy.',
    evidence: 'You named the parts, balanced levers and seesaws, classified levers and explained the trade of force for distance.',
    stillConfusing: [{ text: 'What are the parts of a lever?', refresherId: 'pw40-parts' }, { text: 'How do I find the effort?', refresherId: 'pw41-balance' }, { text: 'How does a seesaw balance?', refresherId: 'pw42-lab' }, { text: 'What are the classes?', refresherId: 'pw43-classes' }, { text: 'Why no free energy?', refresherId: 'pw44-work' }],
  },
};
