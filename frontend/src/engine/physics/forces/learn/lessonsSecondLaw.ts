/**
 * Class 9 Physics, Chapter 6: Unit 4 "Newton's second law and momentum" (PHY-2C), Section 6.5 (Activities 6.3 and 6.4,
 * Eqs. 6.1 to 6.3, Examples 6.4 to 6.6, Pause and Ponder 6 to 8; "Ready to Go Beyond" for momentum, "Bridging Science and
 * Society" for the cricket catch, the airbag and the coconut). The momentum derivation, the force–time and impulse graphs,
 * and the sign discussion are LabVerse enrichment. Wording, figures and numbers are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_SETUP, type Setup } from '../forceModel';
import { cartVisual, derivationVisual, ind, numQ, pick } from './questions';

const LAB = '/physics/forces/lab';
const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Force Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Force Laboratory' });
const setup = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const cart = (o: Partial<Setup>, intro: string, t = 3) => cartVisual({ setup: setup(o), t, editable: true, showNet: true, graphs: true }, intro);

// ---------------------------------------------------------------------------
// Lesson 6: Newton's second law  (Section 6.5)
// ---------------------------------------------------------------------------

export const F6: EduLesson = {
  id: 'pf-l6', unitId: 'pf-unit-4', number: 6, title: 'Newton\'s second law: force, mass and acceleration',
  objective: 'explain how the acceleration of an object depends on the net force and on the mass, use F = ma with units and signs, tell mass from weight, and read the direction of a force correctly.',
  prerequisiteIds: ['pfp-motion', 'pfp-mass', 'pfp-prop'],
  objectives: [
    { id: 'relation', label: 'Describe a ∝ F (linear) and a ∝ 1/m (inverse)' },
    { id: 'calc', label: 'Use F = ma with the net force' },
    { id: 'weight', label: 'Use the newton and tell mass from weight' },
    { id: 'sign', label: 'Read the direction and sign of a force and an acceleration' },
  ],
  steps: [
    {
      id: 'f20-force-acc', title: 'More net force, more acceleration', phase: 'observe',
      paragraphs: [
        'You know that a gentle push on a ball gives a small acceleration and a strong push a large one. To test this we apply different forces to the SAME object. The textbook uses a cart pulled by a thread with a cup of weights; doubling the weight in the cup doubles the force.',
        'In the laboratory, the same 2 kg cart gets 4 N, then 8 N. The acceleration doubles from 2 to 4 m/s². In general, for an object of fixed mass the acceleration is proportional to the net force. On a graph of a against F this is a straight line through the origin: a linear relationship.',
      ],
      vocabulary: [{ term: 'proportional', meaning: 'doubling one quantity doubles the other (a straight line through the origin)' }],
      visual: cart({ massKg: 2, forceA: 4 }, 'A 2 kg cart with a 4 N net force to the right on a frictionless track.'),
      notice: 'Change Force A from 4 N to 8 N and watch the point move along the straight line on the force–acceleration graph.',
      check: pick('chk-f20', 'The same cart is pulled first by 5 N, then by 10 N. How do the accelerations compare?', [
        ['The second is twice the first', null],
        ['They are equal, because the cart is the same', 'The mass is the same but the force is not. A larger net force gives a larger acceleration.', 'force_ignored'],
        ['The second is half the first', 'A larger force gives a larger acceleration, not a smaller one.', 'force_inverted'],
      ], 'a is proportional to F for a fixed mass.', undefined, 'f20-force-acc'),
    },
    {
      id: 'f21-mass-acc', title: 'More mass, less acceleration', phase: 'conjecture',
      paragraphs: [
        'Now apply the SAME force to carts of different mass. It is easier to set a light cart moving than a heavy one: the heavier cart accelerates less. In the textbook\'s second activity the cart\'s mass is doubled and the acceleration is found to be about half.',
        'The acceleration is inversely proportional to the mass: doubling the mass halves the acceleration. This is not a straight-line relationship. On a graph of a against m it is a curve that falls and flattens; it is a straight line only when you plot a against 1/m.',
      ],
      visual: cart({ massKg: 4, forceA: 12 }, 'A 4 kg cart with a 12 N net force. Compare with 1 kg and 2 kg.'),
      notice: 'Change the mass to 1 kg, 2 kg and 4 kg. Which graph is a straight line and which is a curve?',
      misconception: { wrong: 'Inverse proportion just means "gets smaller": a graph of acceleration against mass would be a straight line going down.', right: 'Inverse proportion means doubling one halves the other. The graph is a curve (a hyperbola), not a straight line.' },
      check: pick('chk-f21', 'A force gives a 1 kg cart an acceleration of 8 m/s². What acceleration does the same force give a 4 kg cart?', [
        ['2 m/s²', null],
        ['32 m/s²', 'A heavier cart accelerates less, not more.', 'mass_direct'],
        ['4 m/s²', 'Four times the mass gives a quarter of the acceleration: 8 ÷ 4 = 2 m/s². Halving would be for double the mass.', 'inverse_linear'],
      ], '8 ÷ 4 = 2 m/s².', undefined, 'f21-mass-acc'),
    },
    {
      id: 'f22-law', title: 'The law, F = ma, and the newton', phase: 'reasoning',
      paragraphs: [
        'Newton\'s second law: when a net force acts on an object, the object accelerates in the direction of the net force. The magnitude of the acceleration is proportional to the net force and inversely proportional to the mass: a = F ÷ m, or F = ma. F is the NET force on the object.',
        'The unit of force follows from the law: 1 N = 1 kg × 1 m/s² = 1 kg m/s². One newton is the force that gives an object of mass 1 kg an acceleration of 1 m/s². Follow the steps of the derivation below, which is the textbook\'s own argument from the cart experiments; it is an experimental argument that ends by choosing the unit.',
      ],
      vocabulary: [{ term: 'newton (N)', meaning: 'the force that gives a mass of 1 kg an acceleration of 1 m/s²: 1 N = 1 kg m/s²' }],
      visual: derivationVisual('A', 'Derive F = ma from the cart experiments (the textbook\'s route).'),
      notice: 'Which step uses the experiments, and which step is a choice of unit?',
      check: pick('chk-f22', 'A net force of 6 N acts on a 2 kg cart. What is its acceleration?', [
        ['3 m/s²', null],
        ['12 m/s²', 'You multiplied. F = ma means a = F ÷ m = 6 ÷ 2.', 'multiplied'],
        ['0.33 m/s²', 'You divided the other way round: a = F ÷ m, not m ÷ F.', 'inverted'],
      ], 'a = 6 ÷ 2 = 3 m/s².', undefined, 'f22-law'),
    },
    {
      id: 'f23-weight', title: 'Mass and weight', phase: 'apply',
      paragraphs: [
        'Weight is a force: the gravitational pull of the Earth on an object. By F = ma, with the acceleration due to gravity g, the weight of a mass m is F = mg. Near the Earth g = 9.8 m/s² (about 10 m/s² for quick estimates; the laboratory uses 10). A 30 kg barbell has a weight of 30 × 9.8 = 294 N (Example 6.4).',
        'Mass is the amount of matter, in kilograms; it is the same everywhere. Weight is a force in newtons and depends on g. The acceleration due to gravity does not depend on the mass of the falling object.',
      ],
      misconception: { wrong: 'Mass and weight are the same thing, both measured in kilograms.', right: 'Mass (kg) is how much matter there is. Weight (N) is the pull of gravity on it: weight = mass × g.' },
      check: pick('chk-f23', 'A 5 kg object is taken to a place where g is smaller. What changes?', [
        ['Its weight decreases; its mass stays 5 kg', null],
        ['Its mass decreases', 'Mass does not depend on where the object is. Only the weight changes with g.', 'mass_changes'],
        ['Both its mass and its weight stay the same', 'The weight is mg, and g is smaller, so the weight is smaller.', 'weight_constant'],
      ], 'Mass is constant; weight = mg depends on g.', undefined, 'f23-weight'),
    },
    {
      id: 'f24-sign', title: 'Direction: the acceleration follows the net force', phase: 'apply',
      paragraphs: [
        'The acceleration has the same direction as the net force. Take right as positive. A net force of −3000 N on a 1500 kg car gives a = −2 m/s²: the acceleration points left. Whether the car slows down depends on the way it is moving. If the car is moving right (v positive), a negative acceleration slows it (Example 6.6, part iii). If the car is moving left (v negative), the same negative force makes it speed up.',
        'So a negative force does not always slow an object down. The force changes the velocity: it slows the object when the force and the velocity point opposite ways and speeds it up when they point the same way.',
      ],
      visual: cart({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: 6 }, 'A 2 kg cart moving right at 6 m/s with a 4 N force to the left: it slows, stops and then moves left.', 5),
      notice: 'Follow the velocity through zero. When does the speed fall, and when does it rise?',
      misconception: { wrong: 'A negative force always slows an object down.', right: 'The sign of the force only gives its direction. Compare it with the direction of the velocity: opposite ways slow the object, the same way speed it up.' },
      check: pick('chk-f24', 'A cart moves left at 2 m/s and a net force of 4 N acts to the left. What happens to its speed?', [
        ['It increases', null],
        ['It decreases, because the force is negative', 'The force and the velocity both point left, so the speed increases.', 'negative_slows'],
        ['It stays the same', 'There is a net force, so the velocity changes.', 'ignores_force'],
      ], 'Force along the velocity: the speed rises.', undefined, 'f24-sign'),
    },
  ],
  investigation: lab('K', 'Apply 4 N, 8 N and 12 N to the same cart, then the same force to different masses.'),
  worked: {
    id: 'w-pf-l6', title: 'Pushing a block (like Example 6.5)',
    given: ['A student pushes a stationary 20 kg block on a level floor. The largest friction that can act on it is 40 N.'], ask: 'What happens if she pushes with (i) 40 N and (ii) 46 N? In case (ii), how far does the block go in 4 s?',
    steps: [
      { text: '(i) A 40 N push equals the largest friction, so the forces are balanced: the net force is zero and the block stays at rest.', why: 'Zero net force on a block at rest: no acceleration.' },
      { text: '(ii) Net force = 46 N − 40 N = 6 N, in the direction of the push.', why: 'Friction opposes the push; the net force is the difference.' },
      { text: 'a = F ÷ m = 6 N ÷ 20 kg = 0.3 m/s².', why: 'Newton\'s second law with the net force.' },
      { text: 's = ut + ½at² = 0 × 4 + ½ × 0.3 × 4² = 2.4 m in the direction of the push.', why: 'The block starts from rest (u = 0) with a constant acceleration.' },
    ],
    verify: 'Units: N ÷ kg = (kg m/s²) ÷ kg = m/s², so the acceleration is in the right unit.',
  },
  guided: {
    id: 'g-pf-l6', prompt: 'A car of mass 1200 kg starts from rest. The net force on it is 3000 N forward.',
    steps: [
      { id: 'g1', prompt: 'The acceleration.', question: numQ('g-pf-l6-1', 'What is the acceleration of the car, in m/s²?', 2.5, 'a = 3000 ÷ 1200 = 2.5 m/s².', { unit: 'm/s²', refresherId: 'f22-law', rules: [[[3600000], 'You multiplied. a = F ÷ m.', 'multiplied'], [[0.4], 'You divided the mass by the force. a = F ÷ m.', 'inverted']] }), hints: ['a = F ÷ m.'] },
      { id: 'g2', prompt: 'The velocity.', question: numQ('g-pf-l6-2', 'What is its velocity after 4 s, in m/s?', 10, 'v = u + at = 0 + 2.5 × 4 = 10 m/s.', { unit: 'm/s', refresherId: 'f22-law', rules: [[[2.5], '2.5 m/s² is the acceleration. The velocity after 4 s is 2.5 × 4.', 'acceleration_for_velocity']] }), hints: ['v = u + at.'] },
      { id: 'g3', prompt: 'A bigger force.', question: numQ('g-pf-l6-3', 'The net force is doubled to 6000 N. What is the new acceleration, in m/s²?', 5, 'Double the force on the same mass doubles the acceleration: 5 m/s².', { unit: 'm/s²', refresherId: 'f20-force-acc', rules: [[[1.25], 'Doubling the force doubles the acceleration; it does not halve it.', 'force_inverted']] }), hints: ['6000 ÷ 1200.'] },
    ],
    conclusion: 'a = 2.5 m/s², v = 10 m/s after 4 s, and double the force gives double the acceleration, 5 m/s².',
  },
  independent: [
    ind('i1', 'Proportions', 'relation', 'Doubling the force.', pick('pf-l6-i1', 'The net force on a cart is tripled and its mass does not change. Its acceleration:', [
      ['becomes three times as large', null],
      ['becomes one third as large', 'More force gives more acceleration for the same mass.', 'force_inverted'],
    ], 'a is proportional to F.', undefined, 'f20-force-acc'), ['Same mass: how does a depend on F?'], ['Triples.']),
    ind('i2', 'Proportions', 'relation', 'Doubling the mass.', numQ('pf-l6-i2', 'A force gives a 3 kg cart an acceleration of 4 m/s². What acceleration does the same force give a 6 kg cart, in m/s²?', 2, 'Double the mass halves the acceleration: 2 m/s².', { unit: 'm/s²', refresherId: 'f21-mass-acc', rules: [[[8], 'The heavier cart accelerates less, not more.', 'mass_direct'], [[4], 'The mass changed, so the acceleration changes.', 'mass_ignored']] }), ['Twice the mass: half the acceleration.'], ['2 m/s².']),
    ind('i3', 'F = ma', 'calc', 'The force on a car.', numQ('pf-l6-i3', 'A 1500 kg car has an acceleration of 2 m/s². What net force acts on it, in newtons?', 3000, 'F = ma = 1500 × 2 = 3000 N.', { unit: 'N', refresherId: 'f22-law', rules: [[[750], 'You divided. F = m × a.', 'divided']] }), ['F = ma.'], ['3000 N.']),
    ind('i4', 'F = ma', 'calc', 'Pushing against friction.', numQ('pf-l6-i4', 'A 25 kg block is pushed with 55 N while friction is 50 N. What is its acceleration, in m/s²?', 0.2, 'Net force 55 − 50 = 5 N; a = 5 ÷ 25 = 0.2 m/s².', { unit: 'm/s²', tolerance: 0.005, refresherId: 'f22-law', rules: [[[2.2], 'You used the push alone (55 ÷ 25). The net force is the push minus the friction.', 'push_not_net']] }), ['Find the net force first.'], ['0.2 m/s².']),
    ind('i5', 'Weight', 'weight', 'A weight.', numQ('pf-l6-i5', 'Using g = 10 m/s², what is the weight of an 8 kg object, in newtons?', 80, 'W = mg = 8 × 10 = 80 N.', { unit: 'N', refresherId: 'f23-weight', rules: [[[8], 'That is the mass in kg. The weight is a force: mg.', 'mass_for_weight']] }), ['W = mg.'], ['80 N.']),
    ind('i6', 'Weight', 'weight', 'Mass and weight.', pick('pf-l6-i6', 'Which statement is correct?', [
      ['Mass is measured in kilograms and weight, a force, in newtons', null],
      ['Weight is measured in kilograms', 'Weight is a force and its SI unit is the newton. The kilogram is the unit of mass.', 'weight_in_kg'],
    ], 'Mass: kg; weight: N.', undefined, 'f23-weight'), ['Which is a force?'], ['Weight is in newtons.']),
    ind('i7', 'Direction', 'sign', 'Against the velocity.', pick('pf-l6-i7', 'A cart moves right at 5 m/s and the net force on it is 2 N to the left. Its speed:', [
      ['decreases', null],
      ['increases', 'The force is opposite to the velocity, so the speed falls.', 'direction_ignored'],
    ], 'Opposite directions slow the object.', undefined, 'f24-sign'), ['Compare the two directions.'], ['Decreases.']),
    ind('i8', 'Direction', 'sign', 'Negative force.', pick('pf-l6-i8', 'A negative net force acts on an object whose velocity is also negative. Its speed:', [
      ['increases', null],
      ['decreases, because the force is negative', 'A negative force slows an object only when its velocity is positive. Here both are negative.', 'negative_slows'],
    ], 'Force along the velocity speeds the object up.', undefined, 'f24-sign'), ['Do the force and the velocity point the same way?'], ['Increases.']),
  ],
  reflection: {
    discover: 'For a fixed mass, a ∝ F (a straight line); for a fixed force, a ∝ 1/m (a curve). Newton\'s second law: F = ma with F the net force, and a points the way the net force points. 1 N = 1 kg m/s². Weight = mg is a force; mass is in kg. A negative force slows an object only if it points against the velocity.',
    evidence: 'You compared accelerations for different forces and masses on the cart and its graphs, used F = ma with signs, and followed the derivation of the law.',
    stillConfusing: [{ text: 'How does force change the acceleration?', refresherId: 'f20-force-acc' }, { text: 'How does mass change it?', refresherId: 'f21-mass-acc' }, { text: 'How is F = ma used?', refresherId: 'f22-law' }, { text: 'Mass or weight?', refresherId: 'f23-weight' }, { text: 'What do the signs mean?', refresherId: 'f24-sign' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 7: Momentum and the second law  (Section 6.5, "Ready to Go Beyond" and enrichment)
// ---------------------------------------------------------------------------

export const F7: EduLesson = {
  id: 'pf-l7', unitId: 'pf-unit-4', number: 7, title: 'Momentum and the second law',
  objective: 'define momentum, find its change, show that for a constant mass F = Δp/Δt = ma, and explain why a longer time of contact means a smaller force.',
  prerequisiteIds: ['pfp-motion', 'pfp-mass', 'pfp-direction'],
  objectives: [
    { id: 'momentum', label: 'Calculate momentum, with its unit and sign' },
    { id: 'change', label: 'Find a change of momentum and tell it from momentum itself' },
    { id: 'rate', label: 'Use F = Δp ÷ Δt' },
    { id: 'time', label: 'Explain why a longer stopping time needs a smaller force' },
  ],
  steps: [
    {
      id: 'f25-momentum', title: 'Momentum', phase: 'observe',
      paragraphs: [
        'The momentum of an object is the product of its mass and its velocity: p = mv. Its unit is kg × m/s = kg m/s, and its direction is the direction of the velocity. A 3 kg cart at +4 m/s has p = +12 kg m/s; the same cart moving left at 4 m/s has p = −12 kg m/s.',
        'Momentum is not a force: force is in newtons, momentum in kg m/s. A moving cart with zero net force still has momentum, and keeps it. Zero net force means the momentum does not change, not that it is zero.',
      ],
      vocabulary: [{ term: 'momentum', meaning: 'p = m v (kg m/s), in the direction of the velocity' }],
      visual: cart({ massKg: 3, startVelocity: 4 }, 'A 3 kg cart moving at 4 m/s with no net force: its momentum is 12 kg m/s and stays constant.', 4),
      notice: 'Look at the momentum–time graph. What is its slope when the net force is zero?',
      misconception: { wrong: 'If there is no force, the momentum is zero.', right: 'With zero net force the momentum is constant. It is zero only if the velocity is zero.' },
      check: pick('chk-f25', 'A 2 kg cart moves left at 3 m/s. What is its momentum?', [
        ['−6 kg m/s', null],
        ['+6 kg m/s', 'Momentum has the direction of the velocity. The cart moves left, so the momentum is negative.', 'sign_dropped'],
        ['−1.5 kg m/s', 'Momentum is mass × velocity, not velocity ÷ mass: 2 × (−3).', 'divided'],
      ], 'p = 2 × (−3) = −6 kg m/s.', undefined, 'f25-momentum'),
    },
    {
      id: 'f26-change', title: 'Change of momentum', phase: 'conjecture',
      paragraphs: [
        'The change of momentum is the final momentum minus the initial momentum: Δp = mv − mu. For a constant mass, Δp = m(v − u). A 2 kg cart that speeds up from 3 m/s to 8 m/s changes its momentum from 6 to 16 kg m/s, so Δp = +10 kg m/s.',
        'Do not confuse the change in momentum with the momentum. A cart can have a large momentum and no change at all (constant velocity), or start from rest (p = 0) and gain a large Δp. It is the change of momentum that a net force produces.',
      ],
      visual: cart({ massKg: 2, forceA: 5, startVelocity: 3 }, 'A 2 kg cart at 3 m/s with a 5 N force along its motion for 4 s.', 4),
      notice: 'Compare the momentum at 0 s and at 4 s on the graph. What is the change?',
      check: pick('chk-f26', 'A 4 kg cart slows from 6 m/s to 2 m/s. What is its change of momentum?', [
        ['−16 kg m/s', null],
        ['+16 kg m/s', 'The velocity falls, so the final momentum is smaller than the initial: the change is negative.', 'sign_dropped'],
        ['8 kg m/s', 'That is the final momentum (4 × 2). The change is final minus initial: 8 − 24.', 'final_for_change'],
      ], 'Δp = 4 × (2 − 6) = −16 kg m/s.', undefined, 'f26-change'),
    },
    {
      id: 'f27-rate', title: 'Force is the rate of change of momentum', phase: 'reasoning',
      paragraphs: [
        'The more complete form of Newton\'s second law says that the rate of change of momentum is proportional to the net force and takes place in the direction of the net force. With the newton defined as before the constant is 1: F = Δp ÷ Δt. For a constant mass, Δp ÷ Δt = m(v − u) ÷ t = ma, which is F = ma again.',
        'Follow the derivation step by step below. It is enrichment: the textbook states the momentum form without deriving it. The momentum form is more general, because it also applies when the mass changes.',
      ],
      visual: derivationVisual('B', 'Derive F = ma from momentum, for a constant mass.'),
      notice: 'Which step depends on the mass being constant?',
      check: pick('chk-f27', 'A net force changes the momentum of a cart by 24 kg m/s in 6 s. What is the net force?', [
        ['4 N', null],
        ['144 N', 'You multiplied. F = Δp ÷ Δt = 24 ÷ 6.', 'multiplied'],
        ['0.25 N', 'You divided the time by the momentum change. F = Δp ÷ Δt.', 'inverted'],
      ], 'F = 24 ÷ 6 = 4 N.', undefined, 'f27-rate'),
    },
    {
      id: 'f28-time', title: 'A longer time, a smaller force', phase: 'apply',
      paragraphs: [
        'When a moving object is brought to rest, its momentum changes by the same amount however it is stopped. Since F = Δp ÷ Δt, a longer time Δt means a smaller force. A fielder pulls their hands back while catching a fast cricket ball: this increases the time during which the ball\'s velocity falls to zero, so the force on the hands is smaller. A landing mat or sand bed does the same for a high jumper, and packing glass in bubble wrap or hay lengthens the time of a knock.',
        'Airbags work for a similar reason: they increase the time over which the passenger\'s momentum changes, so the average force is smaller (together with the seat belt). A coconut cracks when it stops in a very short time, which needs a very large force. These are simplified explanations of the idea; real crash forces vary during the impact.',
      ],
      check: pick('chk-f28', 'A fielder catches a fast ball by pulling their hands backward. Why does this reduce the force on the hands?', [
        ['It increases the time over which the ball\'s momentum changes, so the force F = Δp ÷ Δt is smaller', null],
        ['It reduces the momentum of the ball', 'The ball\'s momentum before the catch is the same. The hands change how long the stopping takes.', 'momentum_reduced'],
        ['It reduces the mass of the ball', 'The ball\'s mass does not change. The time of stopping does.', 'mass_reduced'],
      ], 'Same Δp, longer Δt: smaller force.', undefined, 'f28-time'),
    },
  ],
  investigation: lab('N', 'Apply the same pulse to a light and a heavy cart and compare the changes in momentum.'),
  worked: {
    id: 'w-pf-l7', title: 'Catching a ball',
    given: ['A fielder catches a 0.15 kg ball moving at 20 m/s and brings it to rest.'], ask: 'Find the average force on the ball if the catch takes 0.05 s, and if she draws her hands back so it takes 0.2 s.',
    steps: [
      { text: 'Take the ball\'s direction as positive: u = +20 m/s, v = 0.', why: 'Signs show direction.' },
      { text: 'Δp = m(v − u) = 0.15 × (0 − 20) = −3 kg m/s.', why: 'Change of momentum = mass × change of velocity.' },
      { text: 'Short catch: F = Δp ÷ Δt = −3 ÷ 0.05 = −60 N (60 N against the ball\'s motion).', why: 'Force is the rate of change of momentum.' },
      { text: 'Long catch: F = −3 ÷ 0.2 = −15 N (15 N against the ball\'s motion).', why: 'The same Δp over a time four times longer gives a force four times smaller.' },
    ],
    verify: 'Check with F = ma: the deceleration is 20 ÷ 0.05 = 400 m/s²; 0.15 × 400 = 60 N. The two methods agree.',
  },
  guided: {
    id: 'g-pf-l7', prompt: 'A 4 kg cart speeds up from 2 m/s to 5 m/s in 3 s along a straight line.',
    steps: [
      { id: 'g1', prompt: 'The change of momentum.', question: numQ('g-pf-l7-1', 'What is the change of momentum, in kg m/s?', 12, 'Δp = 4 × (5 − 2) = 12 kg m/s.', { unit: 'kg m/s', refresherId: 'f26-change', rules: [[[20], '20 is the final momentum (4 × 5). The change is final minus initial.', 'final_for_change']] }), hints: ['m(v − u).'] },
      { id: 'g2', prompt: 'The force.', question: numQ('g-pf-l7-2', 'What is the average net force, in newtons?', 4, 'F = Δp ÷ Δt = 12 ÷ 3 = 4 N.', { unit: 'N', refresherId: 'f27-rate', rules: [[[36], 'You multiplied by the time. F = Δp ÷ Δt.', 'multiplied']] }), hints: ['Divide by the time.'] },
      { id: 'g3', prompt: 'Check with F = ma.', question: numQ('g-pf-l7-3', 'What is the acceleration, in m/s², and does m × a give the same force?', 1, 'a = (5 − 2) ÷ 3 = 1 m/s², and 4 × 1 = 4 N: the same force.', { unit: 'm/s²', refresherId: 'f27-rate', rules: [[[3], '3 m/s is the change in velocity. Divide by the time: 3 ÷ 3.', 'change_for_acceleration']] }), hints: ['(v − u) ÷ t.'] },
    ],
    conclusion: 'Δp = 12 kg m/s, F = 12 ÷ 3 = 4 N, and ma = 4 × 1 = 4 N: the two forms of the second law agree.',
  },
  independent: [
    ind('i1', 'Momentum', 'momentum', 'A moving cart.', numQ('pf-l7-i1', 'What is the momentum of a 3 kg cart moving at +4 m/s, in kg m/s?', 12, 'p = mv = 3 × 4 = 12 kg m/s.', { unit: 'kg m/s', refresherId: 'f25-momentum', rules: [[[7], 'You added. Momentum is mass × velocity.', 'added']] }), ['p = mv.'], ['12 kg m/s.']),
    ind('i2', 'Momentum', 'momentum', 'Leftward.', numQ('pf-l7-i2', 'A 5 kg cart moves to the left at 2 m/s. What is its momentum, in kg m/s (a minus sign for left)?', -10, 'p = 5 × (−2) = −10 kg m/s.', { unit: 'kg m/s', refresherId: 'f25-momentum', rules: [[[10], 'The cart moves left, so the momentum is negative.', 'sign_dropped']] }), ['Left is negative.'], ['−10 kg m/s.']),
    ind('i3', 'Change', 'change', 'A change.', numQ('pf-l7-i3', 'A 2 kg cart speeds up from 3 m/s to 8 m/s. What is its change of momentum, in kg m/s?', 10, 'Δp = 2 × (8 − 3) = 10 kg m/s.', { unit: 'kg m/s', refresherId: 'f26-change', rules: [[[16], '16 is the final momentum (2 × 8). The change is final minus initial.', 'final_for_change']] }), ['m(v − u).'], ['10 kg m/s.']),
    ind('i4', 'Change', 'change', 'No net force.', pick('pf-l7-i4', 'The net force on a moving cart is zero. Its momentum:', [
      ['stays constant (it is not zero)', null],
      ['is zero, because there is no force', 'Momentum is mass × velocity: the cart is moving, so its momentum is not zero, and with no net force it does not change.', 'zero_force_zero_momentum'],
      ['decreases steadily', 'A change of momentum needs a net force.', 'decreases'],
    ], 'Zero net force: Δp = 0.', undefined, 'f26-change'), ['Does anything change the momentum?'], ['Constant.']),
    ind('i5', 'F = Δp/Δt', 'rate', 'A force from a change.', numQ('pf-l7-i5', 'A net force changes the momentum of a cart by 20 kg m/s in 4 s. What is the force, in newtons?', 5, 'F = Δp ÷ Δt = 20 ÷ 4 = 5 N.', { unit: 'N', refresherId: 'f27-rate', rules: [[[80], 'You multiplied. F = Δp ÷ Δt.', 'multiplied']] }), ['Divide by the time.'], ['5 N.']),
    ind('i6', 'F = Δp/Δt', 'rate', 'From the velocities.', numQ('pf-l7-i6', 'A 3 kg cart\'s velocity rises from 2 m/s to 10 m/s in 4 s. What is the net force on it, in newtons?', 6, 'Δp = 3 × 8 = 24; F = 24 ÷ 4 = 6 N (also ma = 3 × 2).', { unit: 'N', refresherId: 'f27-rate', rules: [[[24], '24 kg m/s is the change of momentum. Divide it by the time.', 'change_for_force']] }), ['Find Δp first.'], ['6 N.']),
    ind('i7', 'Contact time', 'time', 'Airbags.', pick('pf-l7-i7', 'An airbag helps because:', [
      ['it increases the time over which the passenger\'s momentum changes, reducing the average force', null],
      ['it makes the passenger\'s momentum smaller before the crash', 'The momentum is the same; the airbag changes the time over which it changes.', 'momentum_reduced'],
    ], 'F = Δp ÷ Δt: a longer Δt gives a smaller force.', undefined, 'f28-time'), ['What does a longer time do to the force?'], ['It increases the time.']),
    ind('i8', 'Contact time', 'time', 'Ten times shorter.', numQ('pf-l7-i8', 'A change of momentum of 12 kg m/s takes 0.3 s on a cushion (force 40 N). On a hard floor it takes 0.03 s. What is the average force, in newtons?', 400, 'F = 12 ÷ 0.03 = 400 N: ten times shorter gives ten times the force.', { unit: 'N', refresherId: 'f28-time', rules: [[[4], '4 N would be for a time ten times longer. A shorter time needs a larger force.', 'time_inverted']] }), ['Divide Δp by the new time.'], ['400 N.']),
  ],
  reflection: {
    discover: 'Momentum p = mv (kg m/s) has the direction of the velocity and is not a force. The change in momentum is m(v − u). The net force is the rate of change of momentum: F = Δp ÷ Δt = ma for a constant mass. The same Δp over a longer time needs a smaller force, which is why catching, mats and airbags help.',
    evidence: 'You calculated momentum and its changes, derived F = ma from momentum step by step, and compared short and long stopping times.',
    stillConfusing: [{ text: 'What is momentum?', refresherId: 'f25-momentum' }, { text: 'What is a change of momentum?', refresherId: 'f26-change' }, { text: 'How is F related to Δp?', refresherId: 'f27-rate' }, { text: 'Why does time matter?', refresherId: 'f28-time' }],
  },
};
