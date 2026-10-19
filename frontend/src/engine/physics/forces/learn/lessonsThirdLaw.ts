/**
 * Class 9 Physics, Chapter 6: Unit 5 "Newton's third law" and Unit 6 "Forces on a system" (PHY-2D), Sections 6.6 and 6.7
 * (Activities 6.5 to 6.7, Examples 6.7 and 6.8, Pause and Ponder 9 and 10, Figs. 6.22 to 6.35). Lesson 8: pairs of forces.
 * Lesson 9: everyday interactions. Lesson 10: forces on a system of objects. Momentum conservation of an isolated pair and the
 * force-pair identification rule are LabVerse enrichment. Wording, figures and numbers are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { ind, numQ, pairVisual, pick, twoBodyVisual } from './questions';
import { DEFAULT_TWO_BODY, type TwoBodySetup } from '../twoBody';

const INT = '/physics/forces/interactions';
const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Interactions Laboratory', description, href: `${INT}?experiment=${exp}`, buttonLabel: 'Open the Interactions Laboratory' });
const tb = (o: Partial<TwoBodySetup>, intro: string) => twoBodyVisual({ setup: { ...DEFAULT_TWO_BODY, ...o }, editable: true }, intro);

// ---------------------------------------------------------------------------
// Lesson 8: Newton's third law  (Section 6.6, Activities 6.5 and 6.6, Examples 6.7 and 6.8)
// ---------------------------------------------------------------------------

export const F8: EduLesson = {
  id: 'pf-l8', unitId: 'pf-unit-5', number: 8, title: 'Newton\'s third law: forces come in pairs',
  objective: 'state Newton\'s third law, identify the two forces of a pair and the object each acts on, explain why they do not cancel, and explain why equal forces can give unequal accelerations.',
  prerequisiteIds: ['pfp-fma', 'pfp-arrows'],
  objectives: [
    { id: 'statement', label: 'State the third law: equal, opposite and simultaneous' },
    { id: 'objects', label: 'Identify the two forces of a pair and the object each acts on' },
    { id: 'cancel', label: 'Explain why a pair does not cancel on one object' },
    { id: 'accel', label: 'Explain why equal forces give different accelerations' },
  ],
  steps: [
    {
      id: 'f29-pairs', title: 'Forces always come in pairs', phase: 'observe',
      paragraphs: [
        'Sit on a chair with wheels, lift your feet and push a heavy table away: you and the chair roll backwards. Pull the table towards you and you roll the other way. Each time you apply a force on the table, the table applies a force on you in the opposite direction. Two spring balances hooked together and pulled give the same reading on both: the two forces are equal in size.',
        'Newton\'s third law: whenever one object exerts a force on a second object, the second object simultaneously exerts an equal and opposite force on the first. The two forces form a pair. There is no "first" force and "second" force: they exist at the same moment, and neither is weaker.',
      ],
      vocabulary: [{ term: 'action–reaction pair', meaning: 'the two forces that two objects exert on each other: equal in size, opposite in direction, at the same time, on different objects' }],
      visual: tb({ massA: 2, massB: 4, force: 6, durationS: 2 }, 'Two carts push each other apart: 6 N on each, in opposite directions.'),
      notice: 'Compare the force on A with the force on B. Which is larger, and which acts first?',
      misconception: { wrong: 'The action happens first and the reaction follows; the reaction is the weaker one.', right: 'The two forces occur at exactly the same time and are always equal in size.' },
      check: pick('chk-f29', 'You push a heavy table with 50 N. What does the table do to you?', [
        ['It pushes you with 50 N in the opposite direction, at the same moment', null],
        ['It pushes you with less than 50 N, because it is a reaction', 'The reaction is never weaker: the two forces are always equal in size.', 'reaction_weaker'],
        ['It pushes you back only after your push has finished', 'The two forces occur at the same time; neither comes first.', 'action_first'],
      ], 'Equal, opposite and simultaneous.', undefined, 'f29-pairs'),
    },
    {
      id: 'f30-objects', title: 'Which object does each force act on?', phase: 'conjecture',
      paragraphs: [
        'The two forces of a pair act on two DIFFERENT objects. When your hand pushes a wall, the force on the wall is exerted by your hand; the force on your hand is exerted by the wall. To find the partner of a force, swap the two objects: if the first force is exerted by X on Y, its partner is exerted by Y on X, is the same kind of force, equal in size and opposite in direction.',
        'Two opposite arrows are not automatically a pair. The weight of a book (exerted by the Earth on the book) and the normal force on the book (exerted by the table on the book) are equal and opposite, but they act on the same object and are different kinds of force: they are balanced forces, not a pair.',
      ],
      visual: pairVisual({ scenario: 'wall', mode: 'identify' }, 'Pushing a wall: the hand pushes the wall to the right; the wall pushes the hand to the left.'),
      notice: 'Say, for each arrow, which object exerts it and which object it acts on.',
      misconception: { wrong: 'Any two equal and opposite forces are an action–reaction pair.', right: 'A pair needs the objects to swap roles, the same kind of force, equal size and opposite directions, on two different objects.' },
      check: pick('chk-f30', 'A hand pushes a wall to the right. What is the reaction force?', [
        ['The force of the wall on the hand, to the left', null],
        ['The friction of the floor on the wall', 'That is a different force, exerted by a different object. The reaction swaps the two objects: the wall pushes the hand.', 'wrong_partner'],
        ['A second push by the hand, to the left', 'The reaction is exerted by the wall, not by the hand.', 'same_object'],
      ], 'Swap the objects: wall on hand.', undefined, 'f30-objects'),
    },
    {
      id: 'f31-cancel', title: 'Why a pair does not cancel', phase: 'reasoning',
      paragraphs: [
        'To find whether an object accelerates, add only the forces that act ON that object. The two forces of a pair act on different objects, so one of them belongs in the sum for the first object and the other in the sum for the second. They never appear together in the same sum, so they cannot cancel.',
        'Two equal and opposite forces on the SAME object do balance each other (Section 6.2). The side-by-side diagrams below show the difference: a book on a table has balanced forces on the book (weight up/down with the normal force), and its pairs are between the book and the table, and between the book and the Earth.',
      ],
      visual: pairVisual({ scenario: 'book', mode: 'compare' }, 'A book on a table: balanced forces on one object next to an action–reaction pair on two objects.'),
      notice: 'In which panel do the arrows add to zero on one object?',
      misconception: { wrong: 'Action and reaction are equal and opposite, so they cancel and nothing can ever move.', right: 'They act on different objects. Each object has its own net force; a cart pushed by you still accelerates because the reaction acts on you, not on the cart.' },
      check: pick('chk-f31', 'A horse pulls a cart forward and the cart pulls the horse backward with an equal force. Why can the cart still accelerate?', [
        ['The cart\'s backward pull acts on the horse, not on the cart, so it is not in the cart\'s net force', null],
        ['The horse\'s pull is slightly larger than the cart\'s pull', 'The two forces are always exactly equal. The cart accelerates because the forces on the CART (the horse\'s pull and friction) do not balance.', 'forces_unequal'],
        ['The forces cancel, but the cart moves anyway', 'They do not cancel: they act on different objects. They are never added together for one object.', 'pairs_cancel'],
      ], 'Add only the forces on one object.', undefined, 'f31-cancel'),
    },
    {
      id: 'f32-accel', title: 'Equal forces, different accelerations', phase: 'apply',
      paragraphs: [
        'The forces of a pair are equal, but the accelerations are equal only if the masses are. By the second law a = F ÷ m for each object. A 0.1 kg bullet and a 5 kg gun push each other with 2 N: the bullet has a = 2 ÷ 0.1 = 20 m/s², the gun has a = 2 ÷ 5 = 0.4 m/s² (Example 6.8). The lighter object accelerates more.',
        'The same idea explains Example 6.7: the Earth and a falling fruit pull each other with equal forces. The fruit\'s acceleration is large because its mass is small; the Earth\'s mass is so large that its acceleration is far too small to notice.',
      ],
      visual: tb({ massA: 5, massB: 0.1, force: 2, durationS: 0.5 }, 'A gun (A, 5 kg) and a bullet (B, 0.1 kg) push each other with 2 N for a short time.'),
      notice: 'Which has the larger force on it? Which has the larger acceleration?',
      misconception: { wrong: 'The heavier object exerts a larger force, or equal forces give equal accelerations.', right: 'The forces are equal. The accelerations differ because the masses differ.' },
      check: pick('chk-f32', 'The Earth pulls an apple with 2 N and the apple pulls the Earth with 2 N. Why does only the apple seem to move?', [
        ['The Earth\'s mass is huge, so its acceleration (2 N ÷ its mass) is far too small to notice', null],
        ['The Earth pulls the apple with a larger force', 'The two forces are equal.', 'heavier_larger_force'],
        ['The apple\'s pull on the Earth does not exist', 'Both forces exist, equal in size, at the same time.', 'reaction_absent'],
      ], 'a = F ÷ m: the same force on a huge mass gives a tiny acceleration.', undefined, 'f32-accel'),
    },
  ],
  investigation: lab('P', 'Push two carts apart, change the masses and compare the forces and the accelerations.'),
  worked: {
    id: 'w-pf-l8', title: 'Two skaters push apart',
    given: ['Two skaters at rest on smooth ice push each other apart. Skater A has mass 60 kg and skater B has mass 40 kg. The push is 120 N and lasts 0.5 s. Ignore friction.'], ask: 'Find the force on each skater, each acceleration and each velocity at the end of the push.',
    steps: [
      { text: 'Force on B (by A): 120 N, away from A. Force on A (by B): 120 N in the opposite direction.', why: 'Newton\'s third law: the pair is equal and opposite.' },
      { text: 'a(A) = 120 ÷ 60 = 2 m/s² and a(B) = 120 ÷ 40 = 3 m/s², in opposite directions.', why: 'The second law for each skater separately, using only the force on that skater.' },
      { text: 'After 0.5 s: v(A) = 2 × 0.5 = 1 m/s and v(B) = 3 × 0.5 = 1.5 m/s, in opposite directions (starting from rest).', why: 'v = u + at with u = 0.' },
      { text: 'Check: the lighter skater is faster. Momentum: 60 × 1 = 60 and 40 × 1.5 = 60 kg m/s in opposite directions, so the total is zero, as at the start.', why: 'Equal and opposite forces for the same time give equal and opposite momenta.' },
    ],
    verify: 'The forces are equal but the accelerations and velocities are not, and their ratio 3 : 2 is the inverse ratio of the masses 40 : 60.',
  },
  guided: {
    id: 'g-pf-l8', prompt: 'A 3 kg cart and a 6 kg cart push each other apart with a force of 12 N.',
    steps: [
      { id: 'g1', prompt: 'The force on the 6 kg cart.', question: numQ('g-pf-l8-1', 'The 6 kg cart pushes the 3 kg cart with 12 N. With what force, in newtons, does the 3 kg cart push the 6 kg cart?', 12, 'By the third law the force is equal in size: 12 N, in the opposite direction.', { unit: 'N', refresherId: 'f29-pairs', rules: [[[6], '6 N would be half: the reaction is not smaller because the cart is lighter.', 'reaction_scaled']] }), hints: ['Equal and opposite.'] },
      { id: 'g2', prompt: 'The light cart.', question: numQ('g-pf-l8-2', 'What is the acceleration of the 3 kg cart, in m/s²?', 4, 'a = F ÷ m = 12 ÷ 3 = 4 m/s².', { unit: 'm/s²', refresherId: 'f32-accel', rules: [[[2], '2 m/s² is the acceleration of the 6 kg cart. Use the 3 kg cart\'s mass.', 'wrong_mass']] }), hints: ['Divide by its own mass.'] },
      { id: 'g3', prompt: 'The heavy cart.', question: numQ('g-pf-l8-3', 'What is the acceleration of the 6 kg cart, in m/s²?', 2, 'a = 12 ÷ 6 = 2 m/s²: half of the other cart\'s acceleration.', { unit: 'm/s²', refresherId: 'f32-accel', rules: [[[4], 'The forces are equal but the masses are not, so the accelerations are not equal.', 'equal_accelerations']] }), hints: ['The same force on a bigger mass.'] },
    ],
    conclusion: 'The force on each cart is 12 N, but the accelerations are 4 and 2 m/s²: the lighter cart accelerates twice as much.',
  },
  independent: [
    ind('i1', 'The law', 'statement', 'Is the reaction weaker?', pick('pf-l8-i1', 'A small boy pushes a large wall with 30 N. The wall pushes the boy with:', [
      ['30 N, in the opposite direction', null],
      ['less than 30 N, because the boy is small', 'The two forces of a pair are always equal, whoever is bigger.', 'reaction_weaker'],
      ['more than 30 N, because the wall is large', 'The forces are equal; the size of the objects does not change that.', 'heavier_larger_force'],
    ], 'Equal and opposite.', undefined, 'f29-pairs'), ['Is a pair ever unequal?'], ['30 N.']),
    ind('i2', 'The law', 'statement', 'Which comes first?', pick('pf-l8-i2', 'Which statement about the two forces of a pair is correct?', [
      ['They occur at the same time', null],
      ['The action occurs first and the reaction a moment later', 'There is no delay: the forces appear and disappear together.', 'action_first'],
    ], 'Simultaneous.', undefined, 'f29-pairs'), ['Is there a "first" force?'], ['At the same time.']),
    ind('i3', 'Pairs', 'objects', 'The reaction to the push.', pick('pf-l8-i3', 'A foot kicks a football. The reaction to the force of the foot on the ball is:', [
      ['the force of the ball on the foot', null],
      ['the force of the ground on the ball', 'The reaction swaps the objects: the foot acts on the ball, so the ball acts on the foot.', 'wrong_partner'],
      ['the weight of the ball', 'The weight is exerted by the Earth. The partner of the foot\'s kick is exerted by the ball.', 'wrong_partner'],
    ], 'Swap the objects.', undefined, 'f30-objects'), ['Who exerts the reaction?'], ['The ball on the foot.']),
    ind('i4', 'Pairs', 'objects', 'The Earth pulls an apple.', pick('pf-l8-i4', 'The Earth pulls an apple downwards (its weight). The reaction force is:', [
      ['the apple pulling the Earth upwards', null],
      ['the table pushing the apple up', 'That is the normal force, exerted by another object on the apple. The partner of the Earth\'s pull is the apple\'s pull on the Earth.', 'wrong_partner'],
    ], 'Earth on apple ↔ apple on Earth.', undefined, 'f30-objects'), ['Swap the Earth and the apple.'], ['Apple on the Earth.']),
    ind('i5', 'No cancelling', 'cancel', 'Equal and opposite.', pick('pf-l8-i5', 'Why do the two forces of an action–reaction pair not cancel each other?', [
      ['They act on different objects', null],
      ['They are not exactly equal', 'They are exactly equal; that is not the reason.', 'forces_unequal'],
      ['They happen at different times', 'They happen at the same time.', 'action_first'],
    ], 'Different objects: never in the same sum.', undefined, 'f31-cancel'), ['On which objects do they act?'], ['Different objects.']),
    ind('i6', 'No cancelling', 'cancel', 'A book on a table.', pick('pf-l8-i6', 'The weight of a book and the normal force on it are equal and opposite. They are:', [
      ['balanced forces on one object, not an action–reaction pair', null],
      ['an action–reaction pair', 'Both act on the book, and they are different kinds of force: they are balanced forces.', 'pairs_balanced_confusion'],
    ], 'Same object: balanced.', undefined, 'f31-cancel'), ['Which object does each act on?'], ['Balanced, same object.']),
    ind('i7', 'Accelerations', 'accel', 'Gun and bullet.', numQ('pf-l8-i7', 'A 0.2 kg bullet and a 4 kg gun push each other with 8 N. What is the gun\'s acceleration, in m/s²?', 2, 'a = F ÷ m = 8 ÷ 4 = 2 m/s² (the bullet\'s is 8 ÷ 0.2 = 40 m/s²).', { unit: 'm/s²', refresherId: 'f32-accel', rules: [[[40], '40 m/s² is the bullet\'s acceleration. Use the gun\'s mass, 4 kg.', 'wrong_mass']] }), ['a = F ÷ m, with its own mass.'], ['2 m/s².']),
    ind('i8', 'Accelerations', 'accel', 'A heavy object.', pick('pf-l8-i8', 'Two carts, one light and one heavy, push each other apart. Which statement is correct?', [
      ['The forces are equal; the lighter cart has the larger acceleration', null],
      ['The heavier cart exerts the larger force, so it accelerates more', 'The forces are equal, and a heavier cart accelerates less.', 'heavier_larger_force'],
      ['Both have the same acceleration, because the forces are equal', 'Equal accelerations need equal masses as well. a = F ÷ m.', 'equal_accelerations'],
    ], 'Equal forces, unequal accelerations.', undefined, 'f32-accel'), ['Use a = F ÷ m for each.'], ['The lighter cart accelerates more.']),
  ],
  reflection: {
    discover: 'Whenever one object exerts a force on another, the second exerts an equal and opposite force on the first, at the same time. The two forces of a pair act on different objects, so they never cancel on one object (equal and opposite forces on ONE object are balanced forces). The accelerations of the two objects differ if their masses differ: a = F ÷ m.',
    evidence: 'You pushed two carts apart, picked force pairs by who exerts what on what, compared a pair with balanced forces, and explained why equal forces gave unequal accelerations.',
    stillConfusing: [{ text: 'What is a pair of forces?', refresherId: 'f29-pairs' }, { text: 'Which object does each act on?', refresherId: 'f30-objects' }, { text: 'Why do they not cancel?', refresherId: 'f31-cancel' }, { text: 'Why are the accelerations different?', refresherId: 'f32-accel' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 9: Interactions in everyday life  (Section 6.6, Bridging Science and Society, Activity 6.7, Pause and Ponder 9 and 10)
// ---------------------------------------------------------------------------

export const F9: EduLesson = {
  id: 'pf-l9', unitId: 'pf-unit-5', number: 9, title: 'The third law in everyday life',
  objective: 'explain walking, climbing, rowing and rocket propulsion with force pairs, apply the third law to non-contact forces, and use momentum conservation for two objects pushing each other.',
  prerequisiteIds: ['pfp-fma', 'pfp-arrows'],
  objectives: [
    { id: 'walking', label: 'Explain walking and climbing with friction as a forward force' },
    { id: 'propulsion', label: 'Explain a canoe, a balloon and a rocket' },
    { id: 'noncontact', label: 'Apply the third law to non-contact forces' },
    { id: 'momentum', label: 'Use the total momentum of two interacting objects' },
  ],
  steps: [
    {
      id: 'f33-walk', title: 'Walking and climbing', phase: 'observe',
      paragraphs: [
        'When you walk or run you push the ground backwards with your foot. The ground exerts an equal and opposite force on your foot, a forward force of friction, and this force makes you move forward. Here friction helps you move instead of opposing you: your foot tries to slide backwards, so friction on the foot acts forwards.',
        'The same idea explains climbing a coconut tree: your legs push down on the trunk and the friction between the trunk and your legs pushes you up by an equal force, so it is harder to climb a smooth trunk with little friction. Grooves on shoe soles and treads on tyres increase friction; walking on wet polished floors or ice is hard because the friction is small.',
      ],
      visual: pairVisual({ scenario: 'walk', mode: 'identify' }, 'Walking: the foot pushes the ground backwards, the ground\'s friction pushes the foot forwards.'),
      notice: 'Which of the two forces acts on you, and which acts on the ground?',
      check: pick('chk-f33', 'While you walk forward, what force on you moves you forward?', [
        ['Friction exerted by the ground on your foot, the reaction to your foot pushing the ground backwards', null],
        ['The force of your foot on the ground', 'That force acts on the GROUND. The force that moves you acts on you: the ground\'s push on your foot.', 'wrong_object'],
        ['Nothing: friction only opposes motion', 'Here the friction on the foot points forwards, in the direction of walking.', 'friction_always_opposes'],
      ], 'The ground\'s reaction on your foot is the forward force.', undefined, 'f33-walk'),
    },
    {
      id: 'f34-propulsion', title: 'Rowing, balloons and rockets', phase: 'conjecture',
      paragraphs: [
        'A canoeist pushes the water backwards with the paddle; the water pushes the paddle (and the canoe) forwards with an equal force. The two forces act on different objects, so they do not cancel; the forward force on the paddle moves the canoe. A harder push on the water gives a larger forward force.',
        'In Activity 6.7 a balloon with its neck open expels air one way and moves the other way. A rocket expels gas downwards and the gas pushes the rocket upwards. This upward force must be larger than the rocket\'s weight, so the NET force is upwards and it lifts off. A spacecraft in empty space can change its velocity the same way: firing its engine along its motion slows it; firing the other way speeds it up. A fire-fighter struggles with a hose because the water pushed out forwards pushes the hose backwards.',
      ],
      visual: pairVisual({ scenario: 'rocket', mode: 'identify' }, 'A rocket: the engine pushes gas down; the gas pushes the rocket up. The weight is a different force.'),
      notice: 'Is the weight the reaction to the thrust? Where does the net upward force come from?',
      check: pick('chk-f34', 'A rocket\'s upward thrust is 5000 N and its weight is 3000 N. What is the net force and what is the reaction to the thrust?', [
        ['The net force is 2000 N upwards; the reaction to the thrust is the rocket pushing the exhaust gas down', null],
        ['The net force is zero, because the thrust and its reaction cancel', 'The reaction to the thrust acts on the gas, not on the rocket. On the rocket there are the thrust (5000 N up) and the weight (3000 N down): net 2000 N up.', 'pairs_cancel'],
        ['The reaction to the thrust is the weight of the rocket', 'The weight is exerted by the Earth and is a different kind of force. The reaction to the thrust is the rocket pushing the gas.', 'wrong_partner'],
      ], 'Net force on the rocket = 5000 − 3000 = 2000 N up.', undefined, 'f34-propulsion'),
    },
    {
      id: 'f35-noncontact', title: 'Contact and non-contact forces', phase: 'reasoning',
      paragraphs: [
        'Newton\'s third law applies to every kind of force you meet in everyday mechanics: contact forces and also non-contact forces. Two bar magnets repel each other with equal and opposite magnetic forces; two similarly charged balloons exert equal and opposite electrostatic forces on each other; the Earth and a fruit pull each other with equal and opposite gravitational forces.',
        'In each case the two forces act on different objects. Two magnets of different masses feel the same size of force but accelerate differently, exactly as the cart experiments show.',
      ],
      visual: pairVisual({ scenario: 'magnets', mode: 'identify' }, 'Two bar magnets repel each other without touching: equal and opposite forces on different magnets.'),
      notice: 'Does the pair need the magnets to touch?',
      check: pick('chk-f35', 'A bar magnet repels a small compass magnet. Which statement is correct?', [
        ['The two magnetic forces are equal in size and opposite in direction, even though the magnets do not touch', null],
        ['The bar magnet exerts the larger force because it is bigger', 'The two forces of the pair are equal; only the accelerations differ because of the masses.', 'heavier_larger_force'],
        ['The third law applies only when the objects touch', 'It also applies to non-contact forces: magnetic, electrostatic and gravitational.', 'contact_only'],
      ], 'Third law: all kinds of force.', undefined, 'f35-noncontact'),
    },
    {
      id: 'f36-momentum', title: 'Two objects pushing each other: total momentum', phase: 'apply',
      paragraphs: [
        'LabVerse enrichment. When two objects interact only with each other, their forces are equal and opposite and act for the same time. Each object\'s momentum changes by the same amount in opposite directions (Δp = F × t), so the total momentum of the pair does not change. Two carts at rest pushing each other apart end with equal and opposite momenta: the total stays zero, but the lighter cart moves faster.',
        'Momentum is a vector, so these changes have signs. The model in the laboratory assumes no friction and no outside forces on the pair; with an outside force the total momentum would change.',
      ],
      visual: tb({ massA: 2, massB: 4, force: 6, durationS: 2 }, 'Two carts push apart: A gets −12 kg m/s and B gets +12 kg m/s.'),
      notice: 'Add the momenta of A and B at different times. What do you notice about the total?',
      check: pick('chk-f36', 'Two carts at rest push each other apart. Cart A ends with momentum −12 kg m/s. What is the momentum of cart B?', [
        ['+12 kg m/s, so the total is still zero', null],
        ['−12 kg m/s', 'The total momentum cannot change from zero, so B must have the opposite momentum.', 'momentum_same_sign'],
        ['Zero, because B is heavier', 'B gets momentum +12 kg m/s: the pair gives equal and opposite changes of momentum.', 'heavier_zero'],
      ], 'Total momentum stays zero.', undefined, 'f36-momentum'),
    },
  ],
  investigation: lab('T', 'Pick the force pair in walking, a wall push, a canoe, a rocket and two magnets.'),
  worked: {
    id: 'w-pf-l9', title: 'A rocket lifting off',
    given: ['A rocket has a weight of 3000 N (mass 300 kg with g = 10 m/s²). Its engine gives an upward thrust of 5000 N.'], ask: 'Find the net force on the rocket and its acceleration. Name the reaction to the thrust.',
    visual: pairVisual({ scenario: 'rocket', mode: 'identify' }, 'The forces in a rocket launch.'),
    steps: [
      { text: 'The thrust on the rocket is exerted by the exhaust gas. Its reaction is the force of the rocket on the gas, 5000 N downwards, which acts on the gas.', why: 'Swap the two objects: gas on rocket ↔ rocket on gas.' },
      { text: 'The forces on the rocket: +5000 N (thrust, up) and −3000 N (weight, down).', why: 'Only forces acting ON the rocket are added.' },
      { text: 'Net force = 5000 − 3000 = 2000 N, upwards.', why: 'Opposite forces on one object subtract.' },
      { text: 'a = F ÷ m = 2000 ÷ 300 ≈ 6.7 m/s² upwards.', why: 'Second law for the rocket.' },
    ],
    verify: 'If the thrust were only 3000 N, the net force would be zero and the rocket would not lift off; it must be larger than the weight.',
  },
  guided: {
    id: 'g-pf-l9', prompt: 'A swimmer of mass 50 kg pushes off the pool wall with a force of 200 N for a short time (ignore the water).',
    steps: [
      { id: 'g1', prompt: 'The force on the swimmer.', question: numQ('g-pf-l9-1', 'What is the force of the wall on the swimmer, in newtons?', 200, 'It is the reaction to the push on the wall: 200 N, away from the wall.', { unit: 'N', refresherId: 'f29-pairs', rules: [[[0], 'The wall does exert a force on the swimmer: the reaction to the push.', 'reaction_absent']] }), hints: ['The reaction is equal.'] },
      { id: 'g2', prompt: 'The acceleration.', question: numQ('g-pf-l9-2', 'What is the swimmer\'s acceleration, in m/s²?', 4, 'a = F ÷ m = 200 ÷ 50 = 4 m/s², away from the wall.', { unit: 'm/s²', refresherId: 'f34-propulsion', rules: [[[0.25], 'You divided the mass by the force. a = F ÷ m.', 'inverted']] }), hints: ['a = F ÷ m for the swimmer.'] },
      { id: 'g3', prompt: 'The direction.', question: pick('g-pf-l9-3', 'In which direction does the swimmer move?', [
        ['Away from the wall: the reaction pushes the swimmer away', null],
        ['Towards the wall, the way the swimmer pushed', 'The force that accelerates the swimmer is the wall\'s push on the swimmer, which points away from the wall.', 'force_with_push'],
      ], 'The reaction acts on the swimmer, away from the wall.', undefined, 'f34-propulsion'), hints: ['Which force acts on the swimmer?'] },
    ],
    conclusion: 'The wall pushes the swimmer with 200 N away from the wall; a = 200 ÷ 50 = 4 m/s².',
  },
  independent: [
    ind('i1', 'Walking', 'walking', 'Friction on a walker.', pick('pf-l9-i1', 'When you walk forward, the friction on your foot points:', [
      ['forward, in the direction you walk', null],
      ['backward, against your motion', 'Your foot pushes the ground backwards, so the ground\'s friction on the foot acts forwards.', 'friction_always_opposes'],
    ], 'Friction helps you walk.', undefined, 'f33-walk'), ['Which way does your foot push the ground?'], ['Forward.']),
    ind('i2', 'Walking', 'walking', 'Slippery floors.', pick('pf-l9-i2', 'Why is it hard to walk on wet polished tiles?', [
      ['The friction is small, so the ground cannot push your foot forward strongly', null],
      ['There is no ground force, so gravity pulls you down', 'There is still a ground force; it is the friction that is small.', 'wrong_cause'],
    ], 'Less friction: a smaller forward force.', undefined, 'f33-walk'), ['What gives the forward force?'], ['Small friction.']),
    ind('i3', 'Propulsion', 'propulsion', 'A canoe.', pick('pf-l9-i3', 'In rowing a canoe, the force that pushes the paddle forward is exerted by:', [
      ['the water, as the reaction to the paddle pushing the water backwards', null],
      ['the canoeist\'s arms only', 'The arms push the paddle, but the forward force that moves the canoe is the water\'s reaction.', 'wrong_object'],
    ], 'Water on paddle.', undefined, 'f34-propulsion'), ['Which object pushes the paddle forward?'], ['The water.']),
    ind('i4', 'Propulsion', 'propulsion', 'Net force on a rocket.', numQ('pf-l9-i4', 'A rocket\'s thrust is 8000 N and its weight is 5000 N. What is the net upward force on it, in newtons?', 3000, '8000 − 5000 = 3000 N upwards.', { unit: 'N', refresherId: 'f34-propulsion', rules: [[[13000], 'You added the thrust and the weight. They act in opposite directions.', 'added_opposites'], [[0], 'The thrust\'s reaction acts on the gas, not on the rocket, so it does not cancel the thrust.', 'pairs_cancel']] }), ['Thrust up, weight down.'], ['3000 N.']),
    ind('i5', 'Non-contact', 'noncontact', 'Two magnets.', pick('pf-l9-i5', 'Magnet P repels magnet Q with 3 N. Magnet Q repels magnet P with:', [
      ['3 N, in the opposite direction', null],
      ['less than 3 N, because Q is the reaction', 'The reaction is never weaker.', 'reaction_weaker'],
    ], 'Equal and opposite.', undefined, 'f35-noncontact'), ['Is the third law only for touching objects?'], ['3 N.']),
    ind('i6', 'Non-contact', 'noncontact', 'The Earth and a stone.', pick('pf-l9-i6', 'A stone falls because the Earth pulls it. Which statement is correct?', [
      ['The stone also pulls the Earth with an equal force, but the Earth\'s acceleration is far too small to notice', null],
      ['Only the Earth pulls: the stone exerts no force on the Earth', 'Both exert forces on each other, equal in size.', 'reaction_absent'],
    ], 'Gravity acts on both, equally.', undefined, 'f35-noncontact'), ['Is there a pair?'], ['Equal forces.']),
    ind('i7', 'Momentum', 'momentum', 'Skaters.', numQ('pf-l9-i7', 'Two skaters at rest push each other apart. Skater A ends with momentum −90 kg m/s. What is skater B\'s momentum, in kg m/s?', 90, 'The total momentum stays zero, so B has +90 kg m/s.', { unit: 'kg m/s', refresherId: 'f36-momentum', rules: [[[-90], 'B moves the other way, so B\'s momentum has the opposite sign.', 'momentum_same_sign'], [[0], 'Each skater gains momentum; only the TOTAL stays zero.', 'both_zero']] }), ['Total momentum stays zero.'], ['+90 kg m/s.']),
    ind('i8', 'Momentum', 'momentum', 'Who is faster?', pick('pf-l9-i8', 'A 40 kg skater and a 60 kg skater push each other apart from rest. Which statement is correct?', [
      ['The 40 kg skater ends faster; their momenta are equal and opposite', null],
      ['The 60 kg skater ends faster, because heavier objects move faster', 'Equal momenta mean the lighter skater has the larger velocity.', 'heavier_faster'],
      ['They end at the same speed', 'Equal and opposite momenta with different masses give different speeds.', 'equal_accelerations'],
    ], 'Equal momenta: the lighter one is faster.', undefined, 'f36-momentum'), ['Equal momenta, different masses.'], ['The 40 kg skater.']),
  ],
  reflection: {
    discover: 'Walking and climbing use the forward friction of the ground on you (the reaction to your push). A canoe, a balloon and a rocket move because they push something backwards and it pushes them forwards; on a rocket the net force is thrust minus weight. The third law holds for non-contact forces too. Two objects that only interact with each other keep a total momentum that does not change.',
    evidence: 'You named the pair in walking, rowing, rocket launch and magnet examples, and compared the momenta of two carts pushing apart.',
    stillConfusing: [{ text: 'How does walking work?', refresherId: 'f33-walk' }, { text: 'How do canoes and rockets work?', refresherId: 'f34-propulsion' }, { text: 'Non-contact forces?', refresherId: 'f35-noncontact' }, { text: 'Momentum of two objects?', refresherId: 'f36-momentum' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 10: Forces on a system of objects  (Section 6.7, Fig. 6.34, Eq. 6.4, Fig. 6.35)
// ---------------------------------------------------------------------------

export const F10: EduLesson = {
  id: 'pf-l10', unitId: 'pf-unit-6', number: 10, title: 'Forces on a system of objects',
  objective: 'treat connected objects as one system, separate internal from external forces, find the acceleration a = F ÷ (m₁ + m₂), and find the tension in the string.',
  prerequisiteIds: ['pfp-fma', 'pfp-mass'],
  objectives: [
    { id: 'system', label: 'Tell internal forces from external forces on a system' },
    { id: 'accel', label: 'Find the acceleration of a system' },
    { id: 'tension', label: 'Find the tension and check it on each object' },
  ],
  steps: [
    {
      id: 'f37-system', title: 'A system, internal and external forces', phase: 'observe',
      paragraphs: [
        'Two boxes of masses m₁ and m₂ lie on a frictionless surface, joined by a string. A force F pulls box 1 to the right. Box 1 pulls box 2 through the string, and by the third law box 2 pulls box 1 back with an equal force, the tension T.',
        'We can treat the two boxes and the string as one system. Forces inside the system (the tension, a pair of equal and opposite forces) are internal forces; they cancel out for the system as a whole. Only forces from outside, external forces such as F (and the weights and normal forces), decide the motion of the system.',
      ],
      vocabulary: [{ term: 'system', meaning: 'the objects we choose to treat together as one' }, { term: 'internal force', meaning: 'a force between objects inside the system (it comes in third-law pairs)' }, { term: 'external force', meaning: 'a force on the system from outside it' }],
      visual: tb({ mode: 'tow', massA: 2, massB: 3, force: 10, durationS: 3 }, 'Two boxes joined by a string (A: 2 kg, B: 3 kg), A pulled with 10 N for 3 s.'),
      notice: 'Which force is external? Which two forces are the internal pair?',
      check: pick('chk-f37', 'Two boxes joined by a string are pulled along a smooth floor. For the two-box system, the tension in the string is:', [
        ['an internal force, one of an equal and opposite pair inside the system', null],
        ['an external force that speeds the system up', 'The tension is exerted by the boxes on each other, so it is internal; for the whole system its two ends cancel.', 'tension_external'],
        ['zero, because the boxes are at rest', 'The boxes are accelerating, and the tension is not zero (it pulls box 2 along).', 'tension_zero'],
      ], 'Internal forces cancel for the system.', undefined, 'f37-system'),
    },
    {
      id: 'f38-accel', title: 'The acceleration of the system', phase: 'reasoning',
      paragraphs: [
        'For the system, the only horizontal external force is F, and the total mass is m₁ + m₂, so a = F ÷ (m₁ + m₂) (Eq. 6.4). Both boxes have this same acceleration because the string keeps them together. The system accelerates like a single object of mass m₁ + m₂. For F = 10 N, m₁ = 2 kg and m₂ = 3 kg: a = 10 ÷ 5 = 2 m/s².',
        'Treating the boxes separately would give the same result: box 2 has only the tension, so T = m₂a = 3 × 2 = 6 N, and box 1 has F − T = 10 − 6 = 4 N = m₁a = 2 × 2. The system view is simpler because the internal tension need not be found.',
      ],
      visual: tb({ mode: 'tow', massA: 2, massB: 3, force: 10, durationS: 3 }, 'Both boxes accelerate at 2 m/s²: a = 10 ÷ (2 + 3).'),
      notice: 'Compare the acceleration of A and B. What are the net forces on each separately?',
      check: pick('chk-f38', 'A force of 12 N pulls box 1 (1 kg), which is joined by a string to box 2 (3 kg) on a smooth surface. What is the acceleration of each box?', [
        ['3 m/s²: 12 ÷ (1 + 3)', null],
        ['12 m/s²: 12 ÷ 1, using only the pulled box', 'The string makes box 2 accelerate too: the whole system has mass 1 + 3 = 4 kg.', 'one_mass_only'],
        ['4 m/s²: 12 ÷ 3', 'Use the total mass of the system, 1 + 3 = 4 kg.', 'one_mass_only'],
      ], 'a = F ÷ (m₁ + m₂).', undefined, 'f38-accel'),
    },
    {
      id: 'f39-tension', title: 'The tension and the external forces', phase: 'apply',
      paragraphs: [
        'To find the tension, look at one box alone. Box 2 has the tension as its only horizontal force, so T = m₂ a. Check with box 1: F − T = m₁ a. The two boxes have different net forces (6 N on box 2 and 4 N on box 1 in our example) but the same acceleration.',
        'In the vertical direction the external forces on the system are its weight (m₁g + m₂g, down) and the normal force of the ground (N₁ + N₂, up), which balance each other (Fig. 6.35). The string tension is vertical-free here: it pulls horizontally.',
      ],
      check: pick('chk-f39', 'In the two-box system, which equation gives the tension T in the string?', [
        ['T = m₂ a: the tension is the only horizontal force on box 2', null],
        ['T = F, because the boxes are joined', 'The tension is smaller than F: F also has to accelerate box 1.', 'tension_equals_force'],
        ['T = (m₁ + m₂) a', 'That is the external force F on the whole system. The tension acts on box 2 only.', 'system_mass_for_tension'],
      ], 'Box 2: T = m₂ a.', undefined, 'f39-tension'),
    },
  ],
  investigation: { title: 'Try it in the Interactions Laboratory', description: 'Two boxes joined by a string, pulled by a force: compare the accelerations and the tension.', href: `${INT}?arrangement=tow`, buttonLabel: 'Open the Interactions Laboratory' },
  worked: {
    id: 'w-pf-l10', title: 'Two boxes on a smooth floor',
    given: ['Box 1 has mass 4 kg and box 2 has mass 6 kg, joined by a string on a frictionless floor. A force of 20 N pulls box 1.'], ask: 'Find the acceleration and the tension.',
    steps: [
      { text: 'System: both boxes. External horizontal force F = 20 N; total mass 4 + 6 = 10 kg.', why: 'Internal forces (the tension pair) cancel for the system.' },
      { text: 'a = F ÷ (m₁ + m₂) = 20 ÷ 10 = 2 m/s².', why: 'Eq. 6.4.' },
      { text: 'Box 2: the tension is its only horizontal force, so T = m₂ a = 6 × 2 = 12 N.', why: 'Second law for box 2 alone.' },
      { text: 'Check with box 1: F − T = 20 − 12 = 8 N, and m₁ a = 4 × 2 = 8 N.', why: 'Both boxes have the same acceleration, so the second law holds for box 1 too.' },
    ],
    verify: 'The tension (12 N) is smaller than the pull (20 N): the rest is needed to accelerate box 1.',
  },
  guided: {
    id: 'g-pf-l10', prompt: 'Two boxes of 3 kg and 2 kg are joined by a string on a smooth table. A force of 15 N pulls the 3 kg box.',
    steps: [
      { id: 'g1', prompt: 'The acceleration.', question: numQ('g-pf-l10-1', 'What is the acceleration of the system, in m/s²?', 3, 'a = 15 ÷ (3 + 2) = 3 m/s².', { unit: 'm/s²', refresherId: 'f38-accel', rules: [[[5], '15 ÷ 3 uses only the pulled box. Use the total mass, 5 kg.', 'one_mass_only']] }), hints: ['Total mass 5 kg.'] },
      { id: 'g2', prompt: 'The tension.', question: numQ('g-pf-l10-2', 'What is the tension in the string, in newtons?', 6, 'T = m₂ a = 2 × 3 = 6 N (the 2 kg box).', { unit: 'N', refresherId: 'f39-tension', rules: [[[15], 'The tension is not the whole 15 N: part of F accelerates the 3 kg box.', 'tension_equals_force']] }), hints: ['The tension acts on the box behind.'] },
      { id: 'g3', prompt: 'A check.', question: numQ('g-pf-l10-3', 'What is the net force on the 3 kg box, in newtons?', 9, 'F − T = 15 − 6 = 9 N, and 3 × 3 = 9 N.', { unit: 'N', refresherId: 'f39-tension', rules: [[[15], 'The tension pulls back on this box: the net force is F − T.', 'tension_ignored']] }), hints: ['F − T.'] },
    ],
    conclusion: 'a = 3 m/s², T = 6 N, and the 3 kg box has a net force of 9 N = 3 kg × 3 m/s².',
  },
  independent: [
    ind('i1', 'Internal and external', 'system', 'The tension.', pick('pf-l10-i1', 'Two boxes joined by a string are pulled by a hand. Which force is external to the two-box system?', [
      ['The pull of the hand', null],
      ['The tension in the string', 'The tension is exerted by the boxes on each other, so it is internal.', 'tension_external'],
    ], 'Only the hand acts from outside.', undefined, 'f37-system'), ['Which force comes from outside?'], ['The hand.']),
    ind('i2', 'Internal and external', 'system', 'Cancelling.', pick('pf-l10-i2', 'Why can we ignore the tension when finding the acceleration of the whole system?', [
      ['The two ends of the string pull equally and oppositely on the two boxes, so internal forces cancel for the system', null],
      ['The tension is zero', 'The tension is not zero; it simply does not change the motion of the system as a whole.', 'tension_zero'],
    ], 'Internal pairs cancel for the system.', undefined, 'f37-system'), ['Internal forces come in pairs.'], ['They cancel.']),
    ind('i3', 'Acceleration', 'accel', 'Two boxes.', numQ('pf-l10-i3', 'A force of 18 N pulls a 5 kg box joined by a string to a 4 kg box on a smooth floor. What is the acceleration, in m/s²?', 2, 'a = 18 ÷ (5 + 4) = 2 m/s².', { unit: 'm/s²', refresherId: 'f38-accel', rules: [[[3.6], '18 ÷ 5 uses only one box. Use the total mass 9 kg.', 'one_mass_only']] }), ['Total mass 9 kg.'], ['2 m/s².']),
    ind('i4', 'Acceleration', 'accel', 'Same for both.', pick('pf-l10-i4', 'The string between two boxes stays taut. How do the accelerations of the two boxes compare?', [
      ['They are equal', null],
      ['The box that is pulled accelerates more', 'The taut string makes the boxes move together, with the same acceleration.', 'accelerations_differ'],
    ], 'Taut string: the same acceleration.', undefined, 'f38-accel'), ['Can the boxes move apart?'], ['Equal.']),
    ind('i5', 'Tension', 'tension', 'Find T.', numQ('pf-l10-i5', 'In the previous situation (18 N, boxes of 5 kg pulled and 4 kg behind) what is the tension in the string, in newtons?', 8, 'T = m₂ a = 4 × 2 = 8 N.', { unit: 'N', refresherId: 'f39-tension', rules: [[[10], '10 N is the net force on the pulled box (5 × 2): 18 − 8. The tension acts on the 4 kg box.', 'wrong_box'], [[18], 'The tension is less than the pull.', 'tension_equals_force']] }), ['Use the box behind.'], ['8 N.']),
    ind('i6', 'Tension', 'tension', 'A check.', pick('pf-l10-i6', 'F pulls box 1 and the string tension is T. Which equation holds for box 1?', [
      ['F − T = m₁ a', null],
      ['F = m₁ a', 'The tension also acts on box 1, backwards. The net force is F − T.', 'tension_ignored'],
    ], 'Net force on box 1: F − T.', undefined, 'f39-tension'), ['What acts on box 1?'], ['F − T.']),
  ],
  reflection: {
    discover: 'Connected objects can be treated as one system. Forces between the objects (tension) are internal and come in equal and opposite pairs that cancel for the system; only external forces matter. The acceleration is a = F ÷ (m₁ + m₂), the same for every object. To find the tension, apply the second law to one object alone.',
    evidence: 'You pulled joined boxes in the laboratory, found the acceleration of the system and the tension, and checked it on each box.',
    stillConfusing: [{ text: 'Internal and external forces?', refresherId: 'f37-system' }, { text: 'How do I find the acceleration?', refresherId: 'f38-accel' }, { text: 'How do I find the tension?', refresherId: 'f39-tension' }],
  },
};
