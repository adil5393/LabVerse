/**
 * Class 9 Physics, Chapter 7: Unit 2 lessons (PHY-3B). Lesson 4: energy, the work-energy theorem and the forms of energy
 * (Sections 7.2 and 7.3). Lesson 5: kinetic energy and its derivation (Section 7.4.1).
 * Wording, figures and numbers are original. Every figure is drawn from the Work-Energy Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_KINETIC, type KineticSetup } from '../kineticModel';
import { derivationVisual, ind, kineticVisual, numQ, pick } from './questions';

export const klab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Work-Energy Laboratory', description, href: `/physics/work/kinetic?experiment=${exp}`, buttonLabel: 'Open the Work-Energy Laboratory' });
export const kin = (o: Partial<KineticSetup>): KineticSetup => ({ ...DEFAULT_KINETIC, ...o });

// ---------------------------------------------------------------------------
// Lesson 4: Energy and the work-energy theorem  (Sections 7.2 and 7.3)
// ---------------------------------------------------------------------------

export const W4: EduLesson = {
  id: 'pw-l4', unitId: 'pw-unit-2', number: 4, title: 'Energy and the work-energy theorem',
  objective: 'say what energy is, use the work-energy theorem (work done = change in energy) to find the energy after work, explain how energy is transferred between objects, and name the forms of energy and their changes.',
  prerequisiteIds: ['pwp-force', 'pwp-units'],
  objectives: [
    { id: 'energy', label: 'Say what energy is and how it is gained' },
    { id: 'theorem', label: 'Use the work-energy theorem for positive and negative work' },
    { id: 'transfer', label: 'Explain how energy is transferred between objects' },
    { id: 'forms', label: 'Name the forms of energy and the changes between them' },
  ],
  steps: [
    {
      id: 'pw14-energy', title: 'Energy is the capacity to do work', phase: 'observe',
      paragraphs: [
        'A fielder throws a cricket ball and it hits the wickets and knocks them over. A flowerpot raised to a height falls and damages what is below. In both cases the ball or the pot could do work on something else. An object that can do work is said to have energy.',
        'Where did the energy come from? The ball got it from the work the fielder did in throwing it. The pot got it from the work done in raising it. Work done on an object can give it energy, and the object can later use that energy to do work on another object.',
      ],
      vocabulary: [{ term: 'energy', meaning: 'the capacity to do work; measured in joules' }],
      check: pick('chk-pw14-energy', 'A flowerpot raised to a roof falls and damages a toy below. What does this show?', [
        ['The pot had gained energy (the capacity to do work) from the work done in raising it', null],
        ['The pot had no energy until it started to fall', 'The pot already had energy because of its height. Raising it required work, and that work was stored.', 'energy_only_in_motion'],
        ['Work was done on the toy, so no energy was involved', 'Work and energy go together: the pot did work on the toy using the energy it had.', 'work_without_energy'],
      ], 'Work done on an object can give it energy.', undefined, 'pw14-energy'),
    },
    {
      id: 'pw15-theorem', title: 'The work-energy theorem', phase: 'reasoning',
      paragraphs: [
        'The relation between work and energy is the work-energy theorem: the work done on an object equals the change in its energy. In symbols, work done = change in energy (Eq. 7.3). Because work is measured in joules, so is energy.',
        'Positive work increases the energy; negative work decreases it. Zero net work leaves the energy as it was. The textbook says the theorem also holds for a system of objects and for forces that are not constant. In the laboratory you can watch it for a cart: the work (the shaded area) equals the change in the kinetic energy. The unit joule is named after James Prescott Joule, who studied how mechanical energy and thermal energy are related.',
      ],
      vocabulary: [{ term: 'work-energy theorem', meaning: 'work done on an object = change in its energy' }],
      visual: kineticVisual({ setup: kin({ massKg: 2, netForce: 6, u: 0, displacement: 4 }) }, 'A 2 kg cart pushed from rest by a net force of 6 N through 4 m.'),
      notice: 'Compare the net work with the change in kinetic energy.',
      misconception: { wrong: 'The work done on an object is the energy it has.', right: 'The work done equals the CHANGE in energy. The cart already had energy before the work, and the work adds to it (or takes from it).' },
      check: pick('chk-pw15-theorem', 'An object has 30 J of energy. Positive work of 20 J is done on it. What is its energy afterwards?', [
        ['50 J', null],
        ['20 J', 'The work is the change, not the new energy. The object keeps its 30 J and gains 20 J.', 'work_is_energy'],
        ['10 J', 'Positive work adds to the energy. Negative work would subtract.', 'sign_confused'],
      ], 'New energy = old energy + work done.', undefined, 'pw15-theorem'),
    },
    {
      id: 'pw16-carrom', title: 'Energy passes from object to object', phase: 'apply',
      paragraphs: [
        'In a carrom shot, a moving striker hits a white coin, which hits the black coin. The striker pushes the white coin forwards along the way it moves: it does positive work on the coin and the coin gains energy. By Newton\'s third law the coin pushes back on the striker with an opposite force, so the coin does negative work on the striker and the striker loses energy.',
        'So work is one way to transfer energy from one object to another. Energy can also be transferred as heat (from a hot object to a cooler one in contact), by radiation (the Sun\'s energy reaches the Earth through empty space), through electric circuits and by sound waves.',
      ],
      check: pick('chk-pw16-carrom', 'A moving striker hits a stationary coin and sets it moving. Which statement is correct?', [
        ['The striker does positive work on the coin, and the coin does negative work on the striker', null],
        ['The striker does work on the coin, but the coin does no work on the striker', 'The two forces are equal and opposite and act on different objects; the coin\'s force on the striker is opposite to the striker\'s motion, so it does negative work.', 'third_law_ignored'],
        ['Both do positive work', 'The coin\'s force on the striker is opposite to the striker\'s displacement, so its work is negative: the striker loses energy.', 'sign_confused'],
      ], 'Positive work on one, negative work on the other.', undefined, 'pw16-carrom'),
    },
    {
      id: 'pw17-forms', title: 'Forms of energy and how they change', phase: 'apply',
      paragraphs: [
        'Energy exists in many forms: mechanical energy (due to motion or position), thermal energy (what makes things hot), light energy, sound energy, electrical energy, chemical energy (stored in food and fuels) and nuclear energy (stored in the nuclei of atoms). Energy can change from one form to another.',
        'Examples: an electric bulb changes electrical energy into light and thermal energy; a water heater changes it into the thermal energy of the water; food gives chemical energy to your muscles, which change it into the mechanical energy of your motion; a ringing bell changes mechanical energy into sound; a burning matchstick changes chemical energy into thermal and light energy; a green leaf changes the Sun\'s light energy into chemical energy (photosynthesis); a solar panel changes light energy into electrical energy; a microphone changes the energy of sound into electrical energy; a firecracker changes chemical energy into thermal, light, sound and kinetic energy. When you pedal a bicycle on a flat road, the chemical energy of your muscles becomes the kinetic energy of you and the bicycle and, through friction and air resistance, thermal energy.',
        'Water flowing downhill turns its potential energy into kinetic energy. In the Himalayan region a watermill (a gharat or panchakki) uses this to turn a wheel that drives a grinding stone, and in a dam the same change is used to generate electricity.',
      ],
      vocabulary: [{ term: 'energy transformation', meaning: 'the change of energy from one form to another' }],
      check: pick('chk-pw17-forms', 'Which describes a solar panel?', [
        ['Light energy is changed into electrical energy', null],
        ['Electrical energy is changed into light energy', 'That describes a bulb. A solar panel takes in sunlight and produces electricity.', 'direction_reversed'],
        ['Chemical energy is changed into light energy', 'A solar panel has no fuel. It uses the energy of the light that falls on it.', 'wrong_form'],
      ], 'Solar panel: light to electrical.', undefined, 'pw17-forms'),
    },
  ],
  investigation: klab('F', 'Check that the net work equals the change in kinetic energy for a pushed cart.'),
  worked: {
    id: 'w-pw-l4', title: 'Work changes the energy of a trolley',
    given: ['A trolley has 10 J of kinetic energy.', 'A net force does +40 J of work on it. Later a brake does −30 J of net work on it.'], ask: 'What is its kinetic energy after the push, and after the braking?',
    steps: [
      { text: 'Work-energy theorem: work done = change in energy, so final energy = initial energy + work done.', why: 'The work done on the trolley appears as a change in its energy (Eq. 7.3).' },
      { text: 'After the push: 10 J + 40 J = 50 J.', why: 'The work is positive, so the trolley gains energy.' },
      { text: 'After the braking: 50 J + (−30 J) = 20 J.', why: 'The work is negative, so the energy decreases by 30 J.' },
      { text: 'Check: the total change is +40 − 30 = +10 J, and 10 J + 10 J = 20 J.', why: 'The two works add to the overall change of energy.' },
    ],
    verify: 'Positive work raised the energy from 10 to 50 J and negative work lowered it to 20 J; the energy is never negative.',
  },
  guided: {
    id: 'g-pw-l4', prompt: 'A 4 kg box slides with 30 J of kinetic energy. Friction alone does −12 J of net work on it.',
    steps: [
      { id: 'g1', prompt: 'The sign.', question: pick('pw-g4-1', 'Does the friction increase or decrease the box\'s energy?', [
        ['It decreases it: the work is negative', null],
        ['It increases it: friction is a force on the box', 'A negative amount of work removes energy. The sign of the work tells you which way the energy changes.', 'sign_confused'],
      ], 'Negative work removes energy.', undefined, 'pw15-theorem'), hints: ['Look at the sign of the work.'] },
      { id: 'g2', prompt: 'The new energy.', question: numQ('pw-g4-2', 'What is the box\'s kinetic energy afterwards, in joules?', 18, '30 J + (−12 J) = 18 J.', { unit: 'J', refresherId: 'pw15-theorem', rules: [[[42], 'You added 12 J. The work is negative, so it subtracts.', 'sign_ignored'], [[12], 'That is the work done. The new energy is the old 30 J plus the (negative) work.', 'work_is_energy']] }), hints: ['New energy = old energy + work.'] },
      { id: 'g3', prompt: 'Where did it go?', question: pick('pw-g4-3', 'What happens to the 12 J that friction took from the box?', [
        ['It becomes thermal energy of the box and the floor', null],
        ['It disappears', 'Energy is not destroyed. The mechanical energy that friction removes becomes thermal energy.', 'energy_destroyed'],
      ], 'Friction turns mechanical energy into thermal energy.', undefined, 'pw17-forms'), hints: ['Think about what warms up when things rub.'] },
    ],
    conclusion: 'Work done = change in energy: 30 J + (−12 J) = 18 J; the 12 J is transferred to thermal energy.',
  },
  independent: [
    ind('i1', 'Energy', 'energy', 'What is energy?', pick('pw-l4-i1', 'Which statement best describes energy?', [
      ['The capacity to do work', null],
      ['A push or a pull', 'A push or a pull is a force. Energy is the capacity to do work and is measured in joules.', 'energy_is_force'],
      ['How fast an object moves', 'The speed is a different quantity. A moving object has energy, but energy is not the speed.', 'energy_is_speed'],
    ], 'Energy is the capacity to do work.', undefined, 'pw14-energy'), ['What can an object with energy do?'], ['The capacity to do work.']),
    ind('i2', 'Energy', 'energy', 'The pot and the ball.', pick('pw-l4-i2', 'A cricket ball hits the wickets and knocks them over. Where did the ball\'s energy come from?', [
      ['From the work the fielder did in throwing it', null],
      ['It always had it, and work was not involved', 'The ball gained energy from the work done on it when it was thrown.', 'work_without_energy'],
      ['From the wickets', 'The wickets gain energy from the ball; the ball got its energy from the thrower.', 'direction_reversed'],
    ], 'Work done on an object gives it energy.', undefined, 'pw14-energy'), ['What did the fielder do to the ball?'], ['The fielder did work on it.']),
    ind('i3', 'Work-energy theorem', 'theorem', 'Positive work.', numQ('pw-l4-i3', 'A trolley has 30 J of kinetic energy. The net work done on it is +45 J. What is its kinetic energy afterwards, in joules?', 75, '30 J + 45 J = 75 J.', { unit: 'J', refresherId: 'pw15-theorem', rules: [[[45], 'That is the work done. The trolley keeps its original 30 J and gains 45 J.', 'work_is_energy'], [[15], 'You subtracted. Positive work adds energy.', 'sign_confused']] }), ['Final energy = initial energy + work.'], ['30 + 45 = 75 J.']),
    ind('i4', 'Work-energy theorem', 'theorem', 'Negative work.', numQ('pw-l4-i4', 'A sliding box has 50 J of kinetic energy. Friction does −18 J of net work on it. What is its kinetic energy afterwards, in joules?', 32, '50 J + (−18 J) = 32 J.', { unit: 'J', refresherId: 'pw15-theorem', rules: [[[68], 'The work is negative, so it takes energy away instead of adding it.', 'sign_ignored'], [[18], 'That is the size of the work. Subtract it from the 50 J the box had.', 'work_is_energy']] }), ['The work is negative.'], ['50 − 18 = 32 J.']),
    ind('i5', 'Transfer', 'transfer', 'The striker.', pick('pw-l4-i5', 'A moving carrom striker hits a stationary coin. The work done by the striker on the coin, and by the coin on the striker, are:', [
      ['positive on the coin, negative on the striker', null],
      ['positive on both', 'The coin pushes back on the striker, against the striker\'s motion, so its work on the striker is negative.', 'sign_confused'],
      ['zero on the striker, positive on the coin', 'The coin\'s force on the striker acts along the striker\'s path, so it does work: negative work.', 'third_law_ignored'],
    ], 'The striker loses energy and the coin gains it.', undefined, 'pw16-carrom'), ['Which object speeds up and which slows down?'], ['Positive on the coin, negative on the striker.']),
    ind('i6', 'Transfer', 'transfer', 'Without contact.', pick('pw-l4-i6', 'Which way of transferring energy does not need the objects to touch?', [
      ['Radiation: the Sun\'s energy reaches the Earth through empty space', null],
      ['Doing work by pushing with a hand', 'Pushing needs contact between the hand and the object.', 'contact_needed'],
      ['Heat flowing between two objects in contact', 'The text describes heat flowing when objects at different temperatures touch. Radiation is the way that works without contact.', 'contact_needed'],
    ], 'Radiation does not need contact.', undefined, 'pw16-carrom'), ['Think about how sunlight reaches us.'], ['Radiation.']),
    ind('i7', 'Forms of energy', 'forms', 'A bulb.', pick('pw-l4-i7', 'In a glowing electric bulb, energy changes mainly from:', [
      ['electrical energy to light and thermal energy', null],
      ['light energy to electrical energy', 'That is a solar panel. A bulb takes in electricity and gives out light and heat.', 'direction_reversed'],
      ['chemical energy to sound energy', 'A bulb has no chemical fuel and makes no sound. It changes electrical energy to light and heat.', 'wrong_form'],
    ], 'Electrical to light and thermal.', undefined, 'pw17-forms'), ['What goes into the bulb, and what comes out?'], ['Electrical to light and thermal.']),
    ind('i8', 'Forms of energy', 'forms', 'Running.', pick('pw-l4-i8', 'You eat a meal and then run. The energy changes from:', [
      ['chemical energy in the food to the mechanical (and thermal) energy of your muscles and motion', null],
      ['thermal energy to chemical energy', 'It is the other way: food stores chemical energy, which your body uses.', 'direction_reversed'],
      ['light energy to sound energy', 'Neither light nor sound is the main change when you run on food.', 'wrong_form'],
    ], 'Chemical to mechanical.', undefined, 'pw17-forms'), ['What does food store?'], ['Chemical to mechanical.']),
  ],
  reflection: {
    discover: 'Energy is the capacity to do work. The work done on an object equals the change in its energy (positive work adds energy, negative work removes it), and the unit is the joule. Work is one way to transfer energy between objects; heat, radiation, electric circuits and sound are others. Energy changes between forms such as chemical, electrical, thermal, light, sound and mechanical.',
    evidence: 'You used the work-energy theorem with positive and negative work, followed a carrom shot and named energy changes.',
    stillConfusing: [{ text: 'What is energy?', refresherId: 'pw14-energy' }, { text: 'How do I use work = change in energy?', refresherId: 'pw15-theorem' }, { text: 'How is energy passed on?', refresherId: 'pw16-carrom' }, { text: 'What are the forms of energy?', refresherId: 'pw17-forms' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Kinetic energy  (Section 7.4.1)
// ---------------------------------------------------------------------------

export const W5: EduLesson = {
  id: 'pw-l5', unitId: 'pw-unit-2', number: 5, title: 'Kinetic energy: K = ½mv²',
  objective: 'calculate the kinetic energy of a moving object, explain how it depends on the mass and the square of the speed, follow the derivation of K = ½mv² from W = Fs, and use the work-energy theorem to find a speed or a stopping distance.',
  prerequisiteIds: ['pwp-algebra', 'pwp-eqmotion', 'pwp-force'],
  objectives: [
    { id: 'formula', label: 'Calculate K = ½mv²' },
    { id: 'compare', label: 'Compare kinetic energies: mass and the square of the speed' },
    { id: 'derive', label: 'Follow the derivation of K = ½mv² and its assumptions' },
    { id: 'signs', label: 'Link net work, change of kinetic energy and the sign' },
    { id: 'apply', label: 'Use work and kinetic energy to find a speed or a distance' },
  ],
  steps: [
    {
      id: 'pw18-ke', title: 'The energy of motion', phase: 'observe',
      paragraphs: [
        'All moving objects have energy because of their motion: a moving bicycle, a rolling ball, a flying cricket ball. This energy is called kinetic energy. We take the kinetic energy of an object that does not move to be zero.',
        'How much is it? It depends on the mass of the object and on how fast it moves. In the laboratory below, a 2 kg cart moves at 3 m/s with no net force. Change the mass or the velocity and watch the kinetic energy.',
      ],
      vocabulary: [{ term: 'kinetic energy (K)', meaning: 'the energy of an object because of its motion; measured in joules; it has no direction' }],
      visual: kineticVisual({ setup: kin({ massKg: 2, u: 3, netForce: 0, displacement: 3 }), editable: true }, 'A 2 kg cart coasts at 3 m/s with zero net force.'),
      notice: 'Change the mass, then the velocity, and compare how much the kinetic energy changes.',
      check: pick('chk-pw18-ke', 'Which object has the most kinetic energy?', [
        ['A heavy truck moving fast', null],
        ['A heavy truck parked at the side of the road', 'A parked truck has zero kinetic energy because it is not moving.', 'rest_has_K'],
        ['A light ball at rest', 'An object at rest has zero kinetic energy.', 'rest_has_K'],
      ], 'Kinetic energy needs motion; more mass and speed means more.', undefined, 'pw18-ke'),
    },
    {
      id: 'pw19-derive', title: 'From work to ½mv²: the derivation', phase: 'proof',
      paragraphs: [
        'We can find the formula using what we know. A constant net force F acts on an object of mass m along a line; the object moves a displacement s while its velocity changes from u to v. The work done is W = F × s. Newton\'s second law gives F = ma, and the equation of motion v² = u² + 2as connects the velocities to a and s.',
        'Putting these together gives W = ½mv² − ½mu². The work done equals the change of the quantity ½mv². That quantity is the kinetic energy: K = ½mv². Below you can change the numbers and supply the reasoning for the key steps yourself. This is a derivation: a chain of reasons, not just numbers that happen to agree.',
      ],
      visual: derivationVisual('K', 'The derivation of K = ½mv² and W_net = ΔK.'),
      notice: 'Answer the question in a step to see its mathematics, and watch the shaded area (the work) match the change in kinetic energy.',
      check: pick('chk-pw19-derive', 'In the derivation, which fact lets us replace the net force F by something we can find from the motion?', [
        ['Newton\'s second law, F = ma', null],
        ['The definition of the joule', 'The joule is only the unit. Replacing F needs a law that links force to motion: Newton\'s second law.', 'unit_for_law'],
        ['The equation v = u + at', 'That equation has no force in it. It is F = ma that brings the force in.', 'wrong_equation'],
      ], 'F = ma turns the force into m times a.', undefined, 'pw19-derive'),
    },
    {
      id: 'pw20-meaning', title: 'What K = ½mv² tells us', phase: 'reasoning',
      paragraphs: [
        'The mass is multiplied by the SQUARE of the speed. Doubling the mass doubles K. Doubling the speed multiplies K by 4 (since (2v)² = 4v²), and tripling the speed multiplies it by 9. Example: a vehicle that doubles its speed has four times the kinetic energy.',
        'K has no direction and is never negative, because v² is never negative: a cart moving left at 3 m/s and one moving right at 3 m/s have the same kinetic energy. The CHANGE in K can be negative. The work-energy theorem for the whole motion is: net work = K final − K initial. Positive net work speeds the object up; negative net work slows it down; zero net work leaves K unchanged. An object moving with a constant velocity keeps the same kinetic energy at every position.',
        'To use K = ½mv² the speed must be in metres per second. A cricket ball bowled at 108 km/h moves at 108 ÷ 3.6 = 30 m/s, so a 0.16 kg ball has K = ½ × 0.16 × 30² = 72 J.',
      ],
      misconception: { wrong: 'Doubling the speed doubles the kinetic energy.', right: 'The kinetic energy depends on the square of the speed, so doubling the speed makes it four times as large.' },
      check: pick('chk-pw20-meaning', 'A car doubles its speed. What happens to its kinetic energy?', [
        ['It becomes 4 times as large', null],
        ['It doubles', 'The speed is squared in ½mv², so doubling the speed makes the kinetic energy four times as large.', 'linear_in_speed'],
        ['It becomes 8 times as large', 'Only the speed is squared; (2v)² = 4v².', 'cubed'],
      ], 'Double the speed: K × 4.', undefined, 'pw20-meaning'),
    },
    {
      id: 'pw21-use', title: 'Using the theorem to find a speed or a distance', phase: 'apply',
      paragraphs: [
        'The work-energy theorem solves problems without following the motion step by step. A force that opposes the motion does negative work, so net work = F × (−d). If it stops the object completely, K final = 0, so −F d = 0 − K initial, and the stopping distance is d = K initial ÷ F.',
        'To find a speed from a kinetic energy, rearrange K = ½mv² to v = √(2K ÷ m). For example 25 J on a 2 kg ball starting from rest gives v = √(2 × 25 ÷ 2) = 5 m/s.',
      ],
      visual: kineticVisual({ setup: kin({ massKg: 40, u: 6, netForce: -60, displacement: 12 }) }, 'A 40 kg trolley moving at 6 m/s is stopped by a steady 60 N force over 12 m.'),
      notice: 'The braking work is −60 × 12 = −720 J: exactly the kinetic energy the trolley started with.',
      check: pick('chk-pw21-use', 'A steady braking force F brings a moving object to rest over a distance d. Which relation is correct?', [
        ['F × d = the kinetic energy the object had', null],
        ['F × d = twice the kinetic energy', 'The work done by the brake equals the kinetic energy removed, not twice it.', 'factor_two'],
        ['F × d = the final kinetic energy', 'The final kinetic energy is zero. The work equals the kinetic energy at the start, in size.', 'final_not_initial'],
      ], 'The work done by the brake equals the initial kinetic energy (in size).', undefined, 'pw21-use'),
    },
  ],
  investigation: klab('A', 'Compare kinetic energies for different masses and speeds, and see why doubling the speed gives four times the energy.'),
  worked: {
    id: 'w-pw-l5', title: 'Stopping a trolley',
    given: ['A 40 kg trolley moves at 6 m/s.', 'A constant braking force of 60 N acts opposite to the motion until it stops.'], ask: 'How far does the trolley travel while stopping?',
    visual: kineticVisual({ setup: kin({ massKg: 40, u: 6, netForce: -60, displacement: 12 }) }, 'A 40 kg trolley at 6 m/s stopped by a 60 N force.'),
    steps: [
      { text: 'Initial kinetic energy: K = ½ m v² = ½ × 40 × 6² = ½ × 40 × 36 = 720 J.', why: 'Square the speed first, then multiply by ½ and the mass.' },
      { text: 'Final kinetic energy: 0 J, because the trolley stops.', why: 'An object at rest has no kinetic energy.' },
      { text: 'Work done by the brake: W = F × (−d) = −60 × d, negative because the force is opposite to the displacement.', why: 'A force opposite to the displacement does negative work.' },
      { text: 'Work-energy theorem: W = K final − K initial, so −60 d = 0 − 720.', why: 'The work done equals the change in kinetic energy.' },
      { text: 'd = 720 ÷ 60 = 12 m.', why: 'Divide both sides by −60.' },
    ],
    verify: 'Check with the equations of motion: a = −60 ÷ 40 = −1.5 m/s², and d = u² ÷ (2 × 1.5) = 36 ÷ 3 = 12 m. The two methods agree.',
  },
  guided: {
    id: 'g-pw-l5', prompt: 'A 0.2 kg cricket ball is bowled at 20 m/s.',
    steps: [
      { id: 'g1', prompt: 'Kinetic energy.', question: numQ('pw-g5-1', 'What is its kinetic energy, in joules?', 40, 'K = ½ × 0.2 × 20² = ½ × 0.2 × 400 = 40 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[4], 'You did not square the speed. Square 20 first: 400.', 'not_squared'], [[80], 'You left out the ½. K = ½ m v².', 'forgot_half']] }), hints: ['Square the speed first.'] },
      { id: 'g2', prompt: 'A slower ball.', question: numQ('pw-g5-2', 'The same ball is bowled at 10 m/s. What is its kinetic energy, in joules?', 10, 'K = ½ × 0.2 × 10² = 10 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[20], 'That is half of 40 J. Halving the speed quarters the kinetic energy.', 'linear_in_speed']] }), hints: ['½ × 0.2 × 100.'] },
      { id: 'g3', prompt: 'Compare.', question: pick('pw-g5-3', 'The speed was halved (20 to 10 m/s). By what factor did the kinetic energy change?', [
        ['It became one quarter', null],
        ['It became half', 'Half the speed gives (½)² = ¼ of the kinetic energy.', 'linear_in_speed'],
      ], 'K depends on v².', undefined, 'pw20-meaning'), hints: ['Compare 40 J with 10 J.'] },
    ],
    conclusion: 'K = ½mv²: 40 J at 20 m/s and 10 J at 10 m/s: halving the speed quarters the kinetic energy.',
  },
  independent: [
    ind('i1', 'Calculating K', 'formula', 'A moving body.', numQ('pw-l5-i1', 'What is the kinetic energy of a 3 kg object moving at 4 m/s, in joules?', 24, 'K = ½ × 3 × 4² = ½ × 3 × 16 = 24 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[6], 'You did not square the speed: 4² = 16.', 'not_squared'], [[48], 'You left out the ½.', 'forgot_half']] }), ['Square the speed first.'], ['½ × 3 × 16 = 24 J.']),
    ind('i2', 'Calculating K', 'formula', 'A ball.', numQ('pw-l5-i2', 'What is the kinetic energy of a 0.5 kg ball moving at 12 m/s, in joules?', 36, 'K = ½ × 0.5 × 12² = ½ × 0.5 × 144 = 36 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[3], 'You did not square the speed: 12² = 144.', 'not_squared'], [[72], 'You left out the ½.', 'forgot_half']] }), ['12² = 144.'], ['½ × 0.5 × 144 = 36 J.']),
    ind('i3', 'Comparing', 'compare', 'Mass.', pick('pw-l5-i3', 'Two objects move at the same speed. Their masses are 1 kg and 4 kg. Compare their kinetic energies.', [
      ['The 4 kg object has 4 times as much kinetic energy', null],
      ['The 4 kg object has 16 times as much', 'The mass is not squared. For the same speed K is proportional to the mass.', 'mass_squared'],
      ['They are equal, because the speed is equal', 'K depends on the mass as well as the speed, so a heavier object at the same speed has more.', 'mass_ignored'],
    ], 'Same speed: K proportional to mass.', undefined, 'pw20-meaning'), ['Which quantity is squared?'], ['4 times.']),
    ind('i4', 'Comparing', 'compare', 'Speed.', pick('pw-l5-i4', 'The speed of a cyclist becomes three times as large. The kinetic energy becomes:', [
      ['9 times as large', null],
      ['3 times as large', 'The speed is squared: 3² = 9.', 'linear_in_speed'],
      ['6 times as large', 'You multiplied by 3 and by 2. K depends on v², so tripling v gives 9 times.', 'wrong_factor'],
    ], 'v tripled: v² × 9.', undefined, 'pw20-meaning'), ['Square the factor 3.'], ['9 times.']),
    ind('i5', 'The derivation', 'derive', 'Which equation?', pick('pw-l5-i5', 'In the derivation, which equation of motion replaces the product a × s so that W = m a s turns into something with velocities?', [
      ['v² = u² + 2as', null],
      ['v = u + at', 'This equation has time in it and no displacement. We need a relation between a, s, u and v.', 'time_eq'],
      ['s = ½at²', 'This has time and no velocities. The product a s comes from v² = u² + 2as.', 'time_eq'],
    ], 'v² = u² + 2as gives a s = (v² − u²) ÷ 2.', undefined, 'pw19-derive'), ['Which equation links v, u, a and s with no time?'], ['v² = u² + 2as.']),
    ind('i6', 'The derivation', 'derive', 'The assumption.', pick('pw-l5-i6', 'Which condition did the derivation of W = ½mv² − ½mu² assume?', [
      ['A constant net force along a straight line, so that the acceleration is constant', null],
      ['The object is at rest at the start', 'It is not needed: the result keeps the term ½mu². It was used only to define K = ½mv² when u = 0.', 'rest_needed'],
      ['There is no force on the object', 'The derivation is about an object under a net force; with zero force the work would be zero.', 'no_force'],
    ], 'Constant net force (constant a).', undefined, 'pw19-derive'), ['Think about which equations of motion were used.'], ['Constant net force.']),
    ind('i7', 'Signs of work', 'signs', 'Slowing down.', numQ('pw-l5-i7', 'An object has 60 J of kinetic energy. The net work done on it is −45 J. What is its kinetic energy afterwards, in joules?', 15, '60 J + (−45 J) = 15 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[105], 'The net work is negative, so it takes energy away.', 'sign_ignored'], [[45], 'That is the work done. The object keeps 60 J and loses 45 J.', 'work_is_energy']] }), ['K final = K initial + net work.'], ['60 − 45 = 15 J.']),
    ind('i8', 'Signs of work', 'signs', 'A negative K?', pick('pw-l5-i8', 'Can the kinetic energy of an object be negative?', [
      ['No: K = ½mv² and v² is never negative', null],
      ['Yes, when the object moves to the left', 'The direction of motion does not matter because the speed is squared. A cart moving left has the same K as the same cart moving right.', 'direction_matters'],
      ['Yes, when negative work is done on it', 'Negative work makes K smaller, but K stops at zero when the object stops; it cannot become negative.', 'negative_work_negative_K'],
    ], 'K is never negative.', undefined, 'pw20-meaning'), ['What is the sign of v²?'], ['No.']),
    ind('i9', 'Applying', 'apply', 'Finding a speed.', numQ('pw-l5-i9', 'A 2 kg ball at rest has 25 J of net work done on it. What is its speed afterwards, in m/s?', 5, 'K = 25 J = ½ × 2 × v², so v² = 25 and v = 5 m/s.', { unit: 'm/s', refresherId: 'pw21-use', rules: [[[25], 'That is v². The speed is the square root: 5 m/s.', 'forgot_root'], [[12.5], 'You divided by 2 only; ½ m v² = 25 gives v² = 25.', 'algebra']] }), ['Net work = final K when starting from rest.'], ['v = 5 m/s.']),
    ind('i10', 'Applying', 'apply', 'A stopping distance.', numQ('pw-l5-i10', 'A 10 kg sled moves at 4 m/s. A constant 20 N force opposes its motion until it stops. How far does it slide, in metres?', 4, 'K initial = ½ × 10 × 16 = 80 J. The brake does −20 d = 0 − 80, so d = 4 m.', { unit: 'm', refresherId: 'pw21-use', rules: [[[80], 'That is the kinetic energy in joules, not the distance. Divide it by the force.', 'stopped_early'], [[0.5], 'You divided the force by the energy. d = K ÷ F.', 'inverted']] }), ['Find K first, then K ÷ F.'], ['80 ÷ 20 = 4 m.']),
    ind('i11', 'Calculating K', 'formula', 'A fast delivery.', numQ('pw-l5-i11', 'A 0.16 kg cricket ball is bowled at 108 km/h. What is its kinetic energy, in joules?', 72, '108 km/h = 108 ÷ 3.6 = 30 m/s, so K = ½ × 0.16 × 30² = 72 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[933.12], 'You used 108 directly. Change km/h to m/s first: divide by 3.6.', 'unit_not_converted'], [[2.4], 'You did not square the speed: 30² = 900.', 'not_squared']] }), ['Convert the speed to m/s first.'], ['½ × 0.16 × 900 = 72 J.']),
    ind('i12', 'Comparing', 'compare', 'Same energy, different mass.', pick('pw-l5-i12', 'Two objects A and B have masses m and 4m and the same kinetic energy. What is the ratio of the speed of A to the speed of B?', [
      ['2 : 1', null],
      ['4 : 1', 'The speed enters as v², so the ratio of the speeds is the square root of the ratio of the masses: √4 = 2.', 'linear_in_speed'],
      ['1 : 2', 'The lighter object A must move faster to have the same energy, so its speed is the larger one.', 'inverted'],
    ], '½ m v_A² = ½ 4m v_B², so v_A = 2 v_B.', undefined, 'pw20-meaning'), ['Equate ½ m v_A² and ½ (4m) v_B².'], ['v_A : v_B = 2 : 1.']),
  ],
  reflection: {
    discover: 'Kinetic energy is the energy of motion, K = ½mv². Starting from W = F × s, Newton\'s second law and v² = u² + 2as, for a constant net force the net work equals the change in ½mv². Doubling the speed multiplies K by 4, K is never negative, and net work is positive, negative or zero according to whether the object speeds up, slows down or keeps its speed. The theorem gives speeds and stopping distances without following the motion.',
    evidence: 'You calculated and compared kinetic energies, worked through the derivation and used the work-energy theorem.',
    stillConfusing: [{ text: 'What is kinetic energy?', refresherId: 'pw18-ke' }, { text: 'How is K = ½mv² derived?', refresherId: 'pw19-derive' }, { text: 'Why does doubling the speed quadruple K?', refresherId: 'pw20-meaning' }, { text: 'How do I use it to find a speed or a distance?', refresherId: 'pw21-use' }],
  },
};
