/**
 * Class 9 Physics, Chapter 6: Unit 3 "Newton's first law and inertia" (PHY-2B), Section 6.4 (Examples 6.2 and 6.3,
 * Pause and Ponder 3 to 5). Lesson 4: the first law. Lesson 5: inertia, mass, everyday examples and the difference between
 * balanced forces and action-reaction pairs. The textbook names inertia (Meet a Scientist) and states the first law; mass as a
 * measure of inertia, the braking and seat-belt discussion and the comparison of force pulses are LabVerse enrichment.
 * Wording, figures and numbers are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_SETUP, type Setup } from '../forceModel';
import { DEFAULT_BRAKING, type BrakingSetup } from '../vehicle';
import { arrowsVisual, brakingVisual, cartVisual, graphVisual, ind, numQ, pick, type ForceArrowSpec } from './questions';

const LAB = '/physics/forces/lab';
const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Force Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Force Laboratory' });
const setup = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const arrows = (object: string, forces: ForceArrowSpec[], intro: string, showNet = false) => arrowsVisual({ object, forces, showNet }, intro);
const braking = (o: Partial<BrakingSetup>, intro: string) => brakingVisual({ setup: { ...DEFAULT_BRAKING, ...o }, editable: true }, intro);

// ---------------------------------------------------------------------------
// Lesson 4: Newton's first law  (Section 6.4)
// ---------------------------------------------------------------------------

export const F4: EduLesson = {
  id: 'pf-l4', unitId: 'pf-unit-3', number: 4, title: 'Newton\'s first law: rest and constant velocity',
  objective: 'state Newton\'s first law, explain that zero net force means zero acceleration (not necessarily zero velocity), say why everyday objects stop, and read the graphs of an object with no net force.',
  prerequisiteIds: ['pfp-motion', 'pfp-xt'],
  objectives: [
    { id: 'law', label: 'State the first law for an object at rest and a moving object' },
    { id: 'zero', label: 'Explain that zero net force means zero acceleration, not zero velocity' },
    { id: 'stop', label: 'Explain why moving objects stop in everyday life' },
    { id: 'graphs', label: 'Read the graphs of motion with and without a net force' },
  ],
  steps: [
    {
      id: 'f12-law', title: 'The first law', phase: 'observe',
      paragraphs: [
        'Newton\'s first law of motion says: an object at rest remains at rest, and an object in motion continues to move with a constant velocity, unless a net force acts on it.',
        'In other words, if the net force on an object is zero, its velocity cannot change: its acceleration is zero. "At rest" means zero velocity. "Constant velocity" means that neither the speed nor the direction changes, so a moving object keeps going in a straight line at the same speed.',
      ],
      vocabulary: [{ term: 'Newton\'s first law', meaning: 'with zero net force an object at rest stays at rest and a moving object keeps a constant velocity' }],
      visual: cartVisual({ setup: setup({ massKg: 2, startVelocity: 4 }), t: 3, editable: true, showNet: true }, 'A 2 kg cart moving at 4 m/s on an ideal frictionless track with no pushes.'),
      notice: 'Play the cart. The net force is zero. What happens to the velocity and to the acceleration?',
      check: pick('chk-f12-law', 'A cart is at rest and the net force on it is zero. What will happen?', [
        ['It stays at rest', null],
        ['It slowly starts to move in the direction of the last push', 'With zero net force nothing can start it moving. An object at rest stays at rest.', 'rest_starts'],
        ['It moves with a constant velocity', 'The cart is at rest (zero velocity). Zero net force keeps its velocity constant, and that velocity is zero.', 'rest_moves'],
      ], 'Zero net force: the velocity stays the same.', undefined, 'f12-law'),
    },
    {
      id: 'f13-zero', title: 'Zero net force does not mean zero velocity', phase: 'conjecture',
      paragraphs: [
        'Think of a person pushing a moving box forwards with a force exactly equal to the friction on it. The two forces are equal and opposite, so the net force is zero (the textbook\'s Example 6.2). By the first law the box does not stop and does not speed up: it continues with the same constant velocity.',
        'Zero net force means zero acceleration. It does not mean zero velocity. A moving object with zero net force just keeps its velocity. Only a net force changes the velocity, by speeding the object up, slowing it down or turning it.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, surfaceId: 'wood', forceA: 6, startVelocity: 4 }), t: 4, editable: true, showNet: true }, 'A 2 kg cart moving at 4 m/s on a wooden table with a 6 N push that equals the friction.'),
      notice: 'Friction is 6 N backwards and the push is 6 N forwards. What is the net force, and what does the velocity do?',
      misconception: { wrong: 'If the net force is zero, the object must be at rest.', right: 'The object is either at rest or moving with a constant velocity. Only a non-zero net force changes the velocity.' },
      check: pick('chk-f13-zero', 'A box moves along the floor at a constant velocity because the push equals the friction. What happens if the push and friction stay equal?', [
        ['The box keeps moving at the same constant velocity', null],
        ['The box gradually stops, because moving objects need a force that grows', 'The forces are balanced, so the velocity does not change at all.', 'needs_growing_force'],
        ['The box speeds up, because a force is acting', 'The push is balanced by the friction, so the net force is zero and the velocity does not change.', 'balanced_accelerates'],
      ], 'Balanced: no change of velocity.', undefined, 'f13-zero'),
    },
    {
      id: 'f14-stop', title: 'Why everyday objects stop', phase: 'reasoning',
      paragraphs: [
        'A ball you roll along the ground, or a bicycle you stop pedalling, comes to rest. It can seem that motion needs a force to keep going. In fact it is the other way round: friction, a force against the motion, is an unbalanced force that slows the object. A force is needed to change the velocity, not to keep it.',
        'For ages it was believed that a force was needed to keep an object moving at a constant velocity. In the 17th century Galileo argued with thought experiments that if every impediment is removed, an object moving on a horizontal plane would continue to move indefinitely. A perfectly frictionless surface is an idealisation, but the more we reduce friction (the cart on ice slides farther than on a wooden table), the closer real objects come to it.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }), t: 1, editable: true, showNet: true }, 'A 2 kg cart sliding at 6 m/s on a wooden table with no push.'),
      notice: 'Change the surface to ice and then to frictionless. What changes, and what stays the same?',
      misconception: { wrong: 'A moving object needs a continuous forward force to keep moving.', right: 'It needs a force only to change its velocity. Everyday objects stop because friction (and other resistance) acts against them.' },
      check: pick('chk-f14-stop', 'A bicycle slows down after the rider stops pedalling. What is the best explanation?', [
        ['Friction and air resistance act against its motion', null],
        ['Motion dies out by itself, because there is no forward force', 'Motion does not need a forward force. The bicycle slows because forces such as friction act against it.', 'needs_forward_force'],
        ['The first law says moving objects always slow down', 'The first law says the velocity stays constant unless a net force acts. Friction is a net force here.', 'law_misread'],
      ], 'The bicycle slows because of an unbalanced force.', undefined, 'f14-stop'),
    },
    {
      id: 'f15-graphs', title: 'Graphs with no net force', phase: 'apply',
      paragraphs: [
        'If no net force acts, there are two possibilities. At rest, the position stays the same, so the position–time graph is a horizontal line and the velocity–time graph lies on the time axis. Moving at a constant velocity, the position–time graph is a straight sloping line and the velocity–time graph is a horizontal line (Example 6.3 of the textbook).',
        'The reverse is also useful. If a position–time graph is a curve, the slope (the velocity) changes, so the object accelerates and a net force acts on it. A straight line, sloping or horizontal, means no net force.',
      ],
      visual: graphVisual({ scenario: 'const-pos', graphs: ['xt', 'vt'] }, 'An object moving at a constant +4 m/s: a straight position–time graph and a horizontal velocity–time graph.'),
      notice: 'Compare the two graphs. Which one shows that the velocity is constant?',
      check: pick('chk-f15-graphs', 'The position–time graph of an object is a straight sloping line. Is a net force acting on it?', [
        ['No: the constant slope means a constant velocity', null],
        ['Yes: a sloping line means the object is accelerating', 'A straight line has a constant slope, which means a constant velocity and no acceleration.', 'line_means_accelerating'],
      ], 'Straight line: constant velocity, zero net force.', undefined, 'f15-graphs'),
    },
  ],
  investigation: lab('F', 'Predict, then watch a moving cart with no force, and compare rest, rightward and leftward motion.'),
  worked: {
    id: 'w-pf-l4', title: 'A trolley with balanced forces',
    given: ['A trolley moves along a level track at 2 m/s. It is pulled forwards with 15 N and the friction on it is 15 N backwards.'], ask: 'Will the trolley keep moving? What is its velocity after 10 s and how far does it go in that time?',
    visual: arrows('trolley', [{ label: 'Pull', by: 'a rope', magnitude: 15, direction: 'right' }, { label: 'Friction', by: 'the track', magnitude: 15, direction: 'left' }], 'A trolley with a 15 N pull forwards and 15 N friction backwards.', true),
    steps: [
      { text: 'Take forwards as positive: the forces are +15 N and −15 N.', why: 'Signs give directions.' },
      { text: 'Net force = (+15) + (−15) = 0 N: the forces are balanced.', why: 'The net force is the sum of the forces.' },
      { text: 'Zero net force means zero acceleration, so the velocity does not change: it stays 2 m/s.', why: 'Newton\'s first law: a moving object keeps a constant velocity.' },
      { text: 'Distance in 10 s = velocity × time = 2 m/s × 10 s = 20 m.', why: 'At a constant velocity the object covers equal distances every second.' },
    ],
    verify: 'The trolley does not stop or speed up, because the net force is zero. The velocity stays 2 m/s forwards and it travels 20 m.',
  },
  guided: {
    id: 'g-pf-l4', prompt: 'A cart moves at 3 m/s on a track. A forward push of 18 N acts on it and the friction on it is 18 N backwards.',
    steps: [
      { id: 'g1', prompt: 'The net force.', question: numQ('g-pf-l4-1', 'What is the net force on the cart, in newtons?', 0, '(+18) + (−18) = 0 N.', { unit: 'N', refresherId: 'f13-zero', rules: [[[36], 'You added the sizes. The forces are in opposite directions, so they subtract.', 'added_opposites'], [[18], '18 N is the size of each force, not the net force.', 'one_force_only']] }), hints: ['(+18) + (−18).'] },
      { id: 'g2', prompt: 'The acceleration.', question: pick('g-pf-l4-2', 'What is the acceleration of the cart?', [
        ['Zero', null],
        ['3 m/s², the same as its velocity', 'The acceleration is the change of velocity per second. The velocity is not changing.', 'velocity_is_acceleration'],
      ], 'Zero net force: zero acceleration.', undefined, 'f13-zero'), hints: ['What does zero net force say about the velocity?'] },
      { id: 'g3', prompt: 'Later on.', question: numQ('g-pf-l4-3', 'What is the velocity of the cart 5 s later, in m/s?', 3, 'The velocity does not change: 3 m/s.', { unit: 'm/s', refresherId: 'f12-law', rules: [[[0], 'Balanced forces do not stop a moving cart.', 'balanced_means_rest'], [[15], '15 is 3 × 5, the distance travelled. The velocity is unchanged at 3 m/s.', 'distance_for_velocity']] }), hints: ['The velocity stays the same when the net force is zero.'] },
    ],
    conclusion: 'The net force is 0 N, so the cart keeps moving at 3 m/s.',
  },
  independent: [
    ind('i1', 'The law', 'law', 'At rest.', pick('pf-l4-i1', 'A book lies on a table. The net force on it is zero. Which statement does the first law support?', [
      ['The book stays at rest', null],
      ['The book moves slowly in one direction', 'With zero net force an object at rest stays at rest.', 'rest_starts'],
    ], 'Zero net force: no change of velocity.', undefined, 'f12-law'), ['What was the velocity at the start?'], ['At rest.']),
    ind('i2', 'The law', 'law', 'Constant velocity.', pick('pf-l4-i2', 'An object moves in a straight line at a constant velocity. What can you say about the net force on it?', [
      ['It is zero', null],
      ['It is in the direction of motion', 'A net force in the direction of motion would make the object speed up.', 'force_with_velocity'],
    ], 'Constant velocity: zero acceleration: zero net force.', undefined, 'f12-law'), ['Is the object accelerating?'], ['Zero.']),
    ind('i3', 'Zero net force', 'zero', 'A moving ball.', pick('pf-l4-i3', 'A ball moves on a frictionless table with zero net force. After a while its velocity is:', [
      ['the same as before', null],
      ['zero, because the net force is zero', 'Zero net force does not mean zero velocity. The ball keeps its velocity.', 'balanced_means_rest'],
    ], 'Zero net force: unchanged velocity.', undefined, 'f13-zero'), ['Does zero net force change the velocity?'], ['The same.']),
    ind('i4', 'Zero net force', 'zero', 'Equal forces.', numQ('pf-l4-i4', 'A cart moving at 5 m/s has 12 N pushing it right and 12 N pushing it left. What is its velocity after 20 s, in m/s?', 5, 'The net force is zero, so the velocity stays 5 m/s.', { unit: 'm/s', refresherId: 'f13-zero', rules: [[[0], 'Balanced forces do not stop a moving cart.', 'balanced_means_rest'], [[100], '100 is the distance travelled (5 × 20). The velocity is still 5 m/s.', 'distance_for_velocity']] }), ['What is the net force?'], ['5 m/s.']),
    ind('i5', 'Stopping', 'stop', 'A rolling ball.', pick('pf-l4-i5', 'A ball rolling along the ground slows down and stops. According to the first law, why?', [
      ['An unbalanced force, friction, acts against its motion', null],
      ['A moving object always loses its motion', 'The first law says a moving object keeps its velocity unless a net force acts. Friction is that force.', 'needs_forward_force'],
      ['The ball has run out of forward force', 'No forward force is needed to keep it moving.', 'needs_forward_force'],
    ], 'Friction is the unbalanced force.', undefined, 'f14-stop'), ['What acts between the ball and the ground?'], ['Friction.']),
    ind('i6', 'Stopping', 'stop', 'Smooth ice.', pick('pf-l4-i6', 'A hockey puck slides much farther on smooth ice than on a rough floor. What does this suggest?', [
      ['There is less friction on ice, so the puck slows more slowly', null],
      ['Ice gives the puck a forward force', 'Ice does not push the puck forward; it just has less friction.', 'surface_pushes'],
    ], 'Less friction: a smaller unbalanced force.', undefined, 'f14-stop'), ['Compare the friction on ice and on a rough floor.'], ['Less friction.']),
    ind('i7', 'Graphs', 'graphs', 'Velocity–time graph.', pick('pf-l4-i7', 'The velocity–time graph of an object is a horizontal line at +4 m/s. What can you say about the net force?', [
      ['It is zero: the velocity is constant', null],
      ['It is 4 N', 'The graph shows the velocity (4 m/s), not a force. A constant velocity means zero net force.', 'velocity_is_force'],
    ], 'Constant velocity: zero net force.', graphVisual({ scenario: 'const-pos', graphs: ['vt'] }, 'A horizontal velocity–time graph at +4 m/s.'), 'f15-graphs'), ['Is the velocity changing?'], ['Zero.']),
    ind('i8', 'Graphs', 'graphs', 'A curved graph.', pick('pf-l4-i8', 'The position–time graph in the figure curves upward and gets steeper. Is a net force acting on the object?', [
      ['Yes: the velocity is changing, so the object accelerates', null],
      ['No: the object is moving, which needs no force', 'A moving object needs no force only if its velocity is constant. A steepening curve means the velocity is increasing.', 'moving_means_no_force'],
    ], 'A curve: changing velocity: a net force acts.', graphVisual({ scenario: 'speed-up', graphs: ['xt'] }, 'A position–time graph that curves upward.'), 'f15-graphs'), ['Is the slope constant?'], ['Yes, a net force acts.']),
  ],
  reflection: {
    discover: 'Newton\'s first law: with zero net force an object at rest stays at rest and a moving object keeps a constant velocity (the same speed in the same direction). Zero net force means zero acceleration, not zero velocity. Everyday objects stop because friction is an unbalanced force; no forward force is needed to keep moving. Straight-line position–time graphs mean no net force.',
    evidence: 'You watched a cart keep its velocity under zero net force, balanced a push against friction, and used graphs to tell whether a net force acts.',
    stillConfusing: [{ text: 'What does the first law say?', refresherId: 'f12-law' }, { text: 'Zero net force and velocity?', refresherId: 'f13-zero' }, { text: 'Why do things stop?', refresherId: 'f14-stop' }, { text: 'What do the graphs show?', refresherId: 'f15-graphs' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Inertia  (Section 6.4 and enrichment)
// ---------------------------------------------------------------------------

export const F5: EduLesson = {
  id: 'pf-l5', unitId: 'pf-unit-3', number: 5, title: 'Inertia and mass',
  objective: 'explain inertia as the resistance to a change of velocity (not a force), compare carts of different mass, explain everyday examples such as sudden braking and seat belts, and tell balanced forces from action–reaction pairs.',
  prerequisiteIds: ['pfp-motion', 'pfp-mass', 'pfp-arrows'],
  objectives: [
    { id: 'inertia', label: 'Explain inertia and say that it is not a force' },
    { id: 'mass', label: 'Compare the response of carts of different mass to the same force' },
    { id: 'everyday', label: 'Explain sudden braking and seat belts using inertia' },
    { id: 'pairs', label: 'Tell balanced forces on one object from action–reaction pairs' },
  ],
  steps: [
    {
      id: 'f16-inertia', title: 'Inertia', phase: 'observe',
      paragraphs: [
        'Isaac Newton used the word inertia for the tendency of objects to resist a change in their state of rest or of uniform motion, and used this idea in his first law. A resting object stays at rest and a moving object keeps its velocity because of their inertia, until an unbalanced force changes them.',
        'Inertia is not a force. It does not push or pull anything and it has no arrow in a force diagram. It is a property of every object, the resistance to a change of velocity, and it is why a net force is needed to change the velocity.',
      ],
      vocabulary: [{ term: 'inertia', meaning: 'the tendency of an object to resist a change of its rest or its velocity' }],
      misconception: { wrong: 'Inertia is a force that keeps an object moving.', right: 'Inertia is not a force. It is the property of resisting a change of velocity. Only forces appear in a force diagram.' },
      check: pick('chk-f16-inertia', 'Which statement about inertia is correct?', [
        ['It is the resistance of an object to a change in its velocity; it is not a force', null],
        ['It is a forward force that keeps moving objects going', 'Inertia is not a force and no forward force is needed to keep an object moving.', 'inertia_is_force'],
        ['It is the friction between the object and the ground', 'Friction is a force. Inertia is a property of the object itself.', 'inertia_is_friction'],
      ], 'Inertia is a property, not a force.', undefined, 'f16-inertia'),
    },
    {
      id: 'f17-mass', title: 'Mass measures inertia', phase: 'conjecture',
      paragraphs: [
        'Give a light cart and a heavy cart the same push for the same time, and the light cart ends up moving faster. The heavy cart changes its velocity less: it resists the change more. So the mass of an object is a measure of its inertia: more mass, more inertia.',
        'Look at the laboratory: the same 8 N pulse for 1 s changes the velocity of a 1 kg cart by 8 m/s, a 2 kg cart by 4 m/s and a 4 kg cart by 2 m/s. Doubling the mass halves the change. This is an observed pattern; the reason is the second law, which comes later. Notice also that mass is not speed: a heavier cart does not move faster, it is harder to speed up or slow down.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 4, forceA: 8, pulseS: 1 }), t: 3, editable: true, showNet: true }, 'A 4 kg cart at rest gets an 8 N push for 1 s on a frictionless track.'),
      notice: 'Change the mass to 1 kg and to 2 kg and compare the velocity after the pulse. What happens to the net force after 1 s?',
      misconception: { wrong: 'Heavier objects always move faster.', right: 'A heavier object has more inertia: it is harder to speed up or slow down. The same pulse gives it a smaller change of velocity.' },
      check: pick('chk-f17-mass', 'The same force pulse is applied to a 1 kg cart and a 3 kg cart, both starting at rest. Which statement is correct?', [
        ['The 1 kg cart ends up with the greater velocity; the 3 kg cart has more inertia', null],
        ['The 3 kg cart ends up with the greater velocity, because it is heavier', 'A heavier cart resists a change of velocity more, so the same pulse changes its velocity less.', 'heavier_faster'],
        ['They end up with the same velocity', 'The same force on different masses gives different changes of velocity.', 'mass_ignored'],
      ], 'More mass: more inertia: a smaller change of velocity.', undefined, 'f17-mass'),
    },
    {
      id: 'f18-braking', title: 'Sudden braking and seat belts', phase: 'apply',
      paragraphs: [
        'When a vehicle brakes suddenly, a passenger seems to be thrown forwards. No new forward force appears. The passenger was moving at the vehicle\'s velocity, and with nothing to slow them (a slippery seat, no belt) they keep that velocity, by inertia, while the vehicle slows under them. Relative to the vehicle they move forwards.',
        'A seat belt is a force: it pulls the passenger backwards, which changes the passenger\'s velocity so that they slow down together with the vehicle. In the demonstration below a belt exerts exactly the backward force needed. This is a simplified teaching model: it stops before any contact and it is not crash-safety data. Real seats have friction, real belts stretch and real crash forces are very large.',
      ],
      visual: braking({ restrained: false }, 'A vehicle braking suddenly with an unbelted passenger.'),
      notice: 'Switch the belt on and off. Which one has a horizontal force on the passenger, and what is the passenger\'s velocity relative to the road?',
      misconception: { wrong: 'When a vehicle brakes, a forward force acts on the passengers and throws them forward.', right: 'No forward force appears. The passengers keep moving at the velocity they had (inertia) while the vehicle slows. A belt provides a backward force that slows them.' },
      check: pick('chk-f18-braking', 'A bus brakes suddenly and an unbelted passenger lurches forward. Why?', [
        ['The passenger tends to keep moving at the bus\'s old velocity (inertia) while the bus slows down', null],
        ['A forward force acts on the passenger when the bus brakes', 'No forward force appears. The passenger simply keeps the velocity they had.', 'new_forward_force'],
        ['Inertia is a force that throws the passenger forward', 'Inertia is not a force. It is the tendency to keep the same velocity.', 'inertia_is_force'],
      ], 'Inertia: the velocity stays the same unless a net force acts.', undefined, 'f18-braking'),
    },
    {
      id: 'f19-pairs', title: 'Balanced forces are not action–reaction pairs', phase: 'reasoning',
      paragraphs: [
        'Balanced forces act on the SAME object and add up to zero, so the object\'s velocity does not change. A book on a table: its weight (down) and the normal force from the table (up) are balanced forces on the book.',
        'There are also pairs of forces between TWO objects. When you push a wall, you push the wall and the wall pushes you back with a force of the same size. These two forces act on different objects, so they never cancel each other on either object. (The law behind these pairs is Newton\'s third law, a later lesson.) To decide if an object accelerates, add only the forces that act on that one object.',
      ],
      visual: arrows('book', [{ label: 'Normal force', by: 'the table', magnitude: 10, direction: 'up' }, { label: 'Weight', by: 'the Earth', magnitude: 10, direction: 'down' }], 'A book on a table: its weight and the normal force are balanced forces on the book.', true),
      notice: 'Both arrows act on the book. Is the book accelerating?',
      check: pick('chk-f19-pairs', 'You push a wall with 40 N and the wall pushes you with 40 N. Why does the wall not accelerate you backwards and you not accelerate the wall?', [
        ['The wall\'s 40 N acts on you and your 40 N acts on the wall: different objects, so they do not cancel on one object', null],
        ['The two forces cancel each other, so there is no net force on you', 'They act on different objects. To find the net force on you, you add only the forces on you (such as the wall\'s push and friction with the floor).', 'pairs_cancel'],
      ], 'Equal and opposite forces on different objects are not balanced forces.', undefined, 'f19-pairs'),
    },
  ],
  investigation: lab('I', 'Give carts of different mass the same force pulse and compare how much their velocity changes.'),
  worked: {
    id: 'w-pf-l5', title: 'Comparing three carts with the same pulse',
    given: ['The same force pulse acts on a 2 kg cart and changes its velocity by 6 m/s. Observation from the laboratory: for the same pulse, doubling the mass halves the change in velocity.'], ask: 'What change of velocity would the same pulse give a 4 kg cart and a 6 kg cart?',
    steps: [
      { text: '4 kg is twice 2 kg, so the change of velocity is half of 6 m/s: 3 m/s.', why: 'Doubling the mass halves the change in velocity (the pattern seen in the laboratory).' },
      { text: '6 kg is three times 2 kg, so the change of velocity is a third of 6 m/s: 2 m/s.', why: 'Three times the mass gives one third of the change in velocity.' },
      { text: 'The 6 kg cart changes its velocity least, so it has the most inertia of the three.', why: 'Inertia is the resistance to a change in velocity; mass measures it.' },
      { text: 'After the pulse ends, the net force is zero, so each cart keeps its new velocity.', why: 'Zero net force means a constant velocity (the first law).' },
    ],
    verify: 'Each answer follows the pattern: changing the mass by a factor changes the velocity change by the inverse factor. The formal rule comes with the second law.',
  },
  guided: {
    id: 'g-pf-l5', prompt: 'A vehicle and an unbelted passenger move at 12 m/s on a straight road. The vehicle brakes. Assume a slippery seat so that no horizontal force acts on the passenger.',
    steps: [
      { id: 'g1', prompt: 'The passenger\'s velocity.', question: numQ('g-pf-l5-1', 'What is the passenger\'s velocity relative to the road while the vehicle brakes, in m/s?', 12, 'No horizontal force acts, so the velocity does not change: 12 m/s.', { unit: 'm/s', refresherId: 'f18-braking', rules: [[[0], 'The passenger is not slowed down: there is no force on them.', 'slows_with_vehicle']] }), hints: ['What is the net force on the passenger?'] },
      { id: 'g2', prompt: 'The belt.', question: pick('g-pf-l5-2', 'The passenger now wears a belt. In which direction does the belt force act on the passenger?', [
        ['Backwards, against the direction of travel', null],
        ['Forwards, in the direction of travel', 'To slow the passenger down, the force must act against the velocity, backwards.', 'belt_forwards'],
      ], 'A force against the velocity reduces it.', undefined, 'f18-braking'), hints: ['The passenger must slow down.'] },
      { id: 'g3', prompt: 'Inertia.', question: pick('g-pf-l5-3', 'Which passenger has more inertia, one of mass 80 kg or one of mass 40 kg?', [
        ['The 80 kg passenger', null],
        ['The 40 kg passenger', 'More mass means more inertia.', 'mass_inverted'],
      ], 'Mass measures inertia.', undefined, 'f17-mass'), hints: ['Mass is a measure of inertia.'] },
    ],
    conclusion: 'The unbelted passenger keeps 12 m/s (inertia); a belt exerts a backward force; the 80 kg passenger has more inertia.',
  },
  independent: [
    ind('i1', 'Inertia', 'inertia', 'Inertia is not a force.', pick('pf-l5-i1', 'Which of these would NOT appear as an arrow in a force diagram?', [
      ['Inertia', null],
      ['Friction', 'Friction is a force, so it appears as an arrow.', 'wrong_item'],
      ['Weight', 'Weight is a force, so it appears as an arrow.', 'wrong_item'],
    ], 'Inertia is a property, not a force.', undefined, 'f16-inertia'), ['Is inertia a push or a pull?'], ['Inertia.']),
    ind('i2', 'Inertia', 'inertia', 'A starting bus.', pick('pf-l5-i2', 'A bus at rest starts suddenly and standing passengers jerk backwards. Which explanation uses inertia correctly?', [
      ['Their bodies tend to stay at rest while the bus moves forward under them', null],
      ['A backward force suddenly acts on them', 'No backward force appears. They tend to stay where they were while the floor moves forwards.', 'new_forward_force'],
    ], 'Resistance to a change from rest.', undefined, 'f16-inertia'), ['What would happen if nothing changed their velocity?'], ['They tend to stay at rest.']),
    ind('i3', 'Mass', 'mass', 'The 1 kg cart.', numQ('pf-l5-i3', 'The same force pulse changes the velocity of a 1 kg cart by 8 m/s. Using the pattern that doubling the mass halves the change, what change of velocity does a 2 kg cart get, in m/s?', 4, 'Double the mass: half of 8 m/s, 4 m/s.', { unit: 'm/s', refresherId: 'f17-mass', rules: [[[16], 'The heavier cart changes its velocity less, not more.', 'heavier_faster'], [[8], 'The change depends on the mass: with twice the mass it is half as big.', 'mass_ignored']] }), ['Twice the mass: the change is…'], ['4 m/s.']),
    ind('i4', 'Mass', 'mass', 'Which has more inertia?', pick('pf-l5-i4', 'The same pulse changes a trolley\'s velocity by 10 m/s and a lorry\'s by 1 m/s. Which has more inertia?', [
      ['The lorry: its velocity changed less', null],
      ['The trolley: its velocity changed more', 'A larger change means less resistance to the change, so less inertia.', 'mass_inverted'],
    ], 'Less change of velocity: more inertia.', undefined, 'f17-mass'), ['Which one resisted the change more?'], ['The lorry.']),
    ind('i5', 'Everyday', 'everyday', 'A seat belt.', pick('pf-l5-i5', 'How does a seat belt help a passenger when a car brakes suddenly?', [
      ['It exerts a backward force that slows the passenger down along with the car', null],
      ['It removes the passenger\'s inertia', 'Inertia cannot be removed. The belt supplies a force that changes the passenger\'s velocity.', 'inertia_removed'],
    ], 'A force changes the velocity.', undefined, 'f18-braking'), ['What is needed to change a velocity?'], ['A backward force.']),
    ind('i6', 'Everyday', 'everyday', 'Braking.', pick('pf-l5-i6', 'In the braking demonstration the unbelted passenger moves forward relative to the vehicle. What is the horizontal force on that passenger?', [
      ['Zero: they keep their velocity while the vehicle slows', null],
      ['A forward force that appears when the vehicle brakes', 'No forward force appears. The movement forwards relative to the vehicle is explained by inertia.', 'new_forward_force'],
    ], 'No horizontal force: the velocity is unchanged.', braking({ restrained: false }, 'The braking demonstration with no belt.'), 'f18-braking'), ['Add the horizontal forces on the passenger.'], ['Zero.']),
    ind('i7', 'Pairs', 'pairs', 'Weight and normal force.', pick('pf-l5-i7', 'A book rests on a table. Its weight and the normal force from the table are:', [
      ['balanced forces acting on the same object (the book)', null],
      ['an action–reaction pair acting on two objects', 'Both forces act on the book, so they are balanced forces on one object. Pairs of forces between two objects act on different objects.', 'pairs_balanced_confusion'],
    ], 'Both act on the book.', undefined, 'f19-pairs'), ['On which object does each force act?'], ['The same object.']),
    ind('i8', 'Pairs', 'pairs', 'Pushing a wall.', pick('pf-l5-i8', 'You push a wall. Which statement is correct?', [
      ['The force you exert on the wall and the force the wall exerts on you act on different objects, so they are not balanced forces on one object', null],
      ['The two forces are balanced, so you cannot accelerate', 'They act on different objects. Whether you accelerate depends on the forces on you alone.', 'pairs_cancel'],
    ], 'Different objects: not balanced.', undefined, 'f19-pairs'), ['Which forces are on you?'], ['Different objects.']),
  ],
  reflection: {
    discover: 'Inertia is the resistance of an object to a change of its velocity; it is a property, not a force. Mass measures inertia: for the same force pulse a larger mass changes its velocity less (heavier does not mean faster). A braking passenger keeps their velocity (no new forward force) and a belt supplies the backward force that slows them. Balanced forces act on one object; action–reaction pairs act on two.',
    evidence: 'You compared carts of different mass under the same pulse, explained braking with and without a belt, and told balanced forces from forces on two different objects.',
    stillConfusing: [{ text: 'What is inertia?', refresherId: 'f16-inertia' }, { text: 'How does mass matter?', refresherId: 'f17-mass' }, { text: 'Why do passengers lurch forward?', refresherId: 'f18-braking' }, { text: 'Balanced forces and pairs?', refresherId: 'f19-pairs' }],
  },
};
