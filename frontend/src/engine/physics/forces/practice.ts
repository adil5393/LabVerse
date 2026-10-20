/**
 * Chapter Practice for "How Forces Affect Motion" (PHY-2E): 29 original questions across the whole chapter, in the same form
 * as the Chapter 4 practice (practice.ts of the motion engine): each question is shown once, only the first answer counts in the
 * on-page summary, nothing is written to the learning-progress store, and nothing here repeats a lesson question or an NCERT
 * exercise. Momentum questions are LabVerse enrichment (the textbook states the momentum form only in "Ready to Go Beyond").
 * Numerical answers are checked against independent hand calculations in the tests.
 */

import type { Question } from '../../education/types';
import { DEFAULT_SETUP, type Setup } from './forceModel';
import { DEFAULT_TWO_BODY } from './twoBody';
import { arrowsVisual, cartVisual, numQ, pairVisual, pick, twoBodyVisual } from './learn/questions';

export type ForcePracticeCategory = 'forces' | 'friction' | 'inertia' | 'second' | 'momentum' | 'third' | 'system';

export const FORCE_PRACTICE_CATEGORIES: { id: ForcePracticeCategory; title: string; blurb: string; enrichment?: boolean }[] = [
  { id: 'forces', title: 'Balanced and unbalanced forces', blurb: 'Net force, equilibrium and what balanced forces do.' },
  { id: 'friction', title: 'Friction', blurb: 'Static and kinetic friction, surfaces and direction.' },
  { id: 'inertia', title: 'Newton\'s first law and inertia', blurb: 'Zero net force, constant velocity and inertia.' },
  { id: 'second', title: 'Newton\'s second law', blurb: 'F = ma, mass, weight and the direction of the acceleration.' },
  { id: 'momentum', title: 'Momentum (enrichment)', blurb: 'LabVerse enrichment: the textbook states the momentum form of the second law only in "Ready to Go Beyond".', enrichment: true },
  { id: 'third', title: 'Newton\'s third law and force pairs', blurb: 'Which object each force acts on, and why pairs never cancel.' },
  { id: 'system', title: 'Connected objects, internal and external forces', blurb: 'Systems of objects joined by a string, and tension.' },
];

export interface ForcePracticeItem { id: string; category: ForcePracticeCategory; question: Question; lessonId: string }
const item = (category: ForcePracticeCategory, lessonId: string, question: Question): ForcePracticeItem => ({ category, lessonId, id: question.id, question });
const c = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });

export const FORCE_PRACTICE_ITEMS: ForcePracticeItem[] = [
  // ---- balanced and unbalanced forces ----
  item('forces', 'pf-l2', numQ('fp-b1', 'The forces on the block in the figure are 14 N to the right and 9 N to the left. What is the net force, in newtons (right is positive)?', 5, '(+14) + (−9) = +5 N: 5 N to the right.', { unit: 'N', rules: [[[23], 'You added the sizes. The forces are in opposite directions, so they subtract.', 'added_opposites'], [[-5], 'The larger force is to the right, so the net force is positive.', 'wrong_direction']], visual: arrowsVisual({ object: 'block', forces: [{ label: 'Pull', by: 'a rope', magnitude: 14, direction: 'right' }, { label: 'Pull', by: 'a rope', magnitude: 9, direction: 'left' }] }, 'A block with 14 N to the right and 9 N to the left.') })),
  item('forces', 'pf-l2', pick('fp-b2', 'A box moving at 2 m/s has these horizontal forces on it: 10 N right, 4 N right and 14 N left. What happens to its velocity?', [
    ['It stays 2 m/s: the net force is zero', null],
    ['It drops to zero, because the forces balance', 'Balanced forces mean no change of velocity, not zero velocity. A moving box keeps moving.', 'balanced_means_rest'],
    ['It increases, because three forces act', 'The net force is 10 + 4 − 14 = 0, so the velocity does not change.', 'balanced_accelerates'],
  ], '10 + 4 − 14 = 0: no change of velocity.')),
  item('forces', 'pf-l2', numQ('fp-b3', 'In a tug of war team A pulls with 450 N and team B with 520 N. What is the size of the net force on the rope, in newtons?', 70, '520 − 450 = 70 N, towards team B.', { unit: 'N', rules: [[[970], 'You added the pulls. They are in opposite directions.', 'added_opposites']] })),
  item('forces', 'pf-l2', pick('fp-b4', 'A parachutist falls at a constant velocity. What is the net force on the parachutist?', [
    ['Zero: weight and air resistance are equal and opposite', null],
    ['Downwards, because the parachutist is moving downwards', 'A net force would change the velocity. The velocity is constant, so the net force is zero.', 'force_with_velocity'],
    ['Upwards, because the parachute holds the person up', 'The upward air resistance only equals the weight: it does not exceed it.', 'upward_net'],
  ], 'Constant velocity: zero net force.')),

  // ---- friction ----
  item('friction', 'pf-l3', numQ('fp-f1', 'A heavy crate at rest is pushed with 35 N and does not move. What is the friction on it, in newtons?', 35, 'The crate is at rest, so the net force is zero: the friction equals the push, 35 N.', { unit: 'N', rules: [[[0], 'Friction is what balances your push: it is not zero.', 'no_friction_at_rest']] })),
  item('friction', 'pf-l3', numQ('fp-f2', 'A box slides at a constant velocity when pushed with 22 N. What is the friction on the box, in newtons?', 22, 'Constant velocity means zero net force: the friction equals the push, 22 N.', { unit: 'N', rules: [[[0], 'The box is sliding, so kinetic friction acts; it balances the push.', 'no_friction_moving']] })),
  item('friction', 'pf-l3', pick('fp-f3', 'A coin slides farther on glass than on a rough table after the same push. What does that tell you?', [
    ['The friction on the glass is smaller', null],
    ['The glass gives the coin a forward force', 'Glass does not push the coin forward; it just has less friction.', 'surface_pushes'],
    ['Friction does not act on the glass', 'The coin does stop on the glass, so friction acts there too, only smaller.', 'no_friction'],
  ], 'Less friction: slower slowing.')),
  item('friction', 'pf-l9', pick('fp-f4', 'A person walks to the right. The friction force of the ground on the person\'s foot points:', [
    ['to the right, in the direction of walking', null],
    ['to the left, against the walking', 'The foot pushes the ground to the left, so the ground\'s friction on the foot points to the right: friction helps the walker.', 'friction_always_opposes'],
  ], 'Friction on the foot is the forward reaction.')),

  // ---- first law and inertia ----
  item('inertia', 'pf-l4', pick('fp-i1', 'The cart in the figure moves at 4 m/s on a frictionless track with no pushes. After 10 s its velocity will be:', [
    ['4 m/s: the net force is zero', null],
    ['Zero: moving things stop by themselves', 'Without friction or another force nothing stops the cart: the first law says its velocity stays constant.', 'slows_by_itself'],
    ['More than 4 m/s', 'There is no net force to speed it up.', 'balanced_accelerates'],
  ], 'Zero net force: constant velocity.', cartVisual({ setup: c({ massKg: 2, startVelocity: 4 }), t: 2, showNet: true }, 'A 2 kg cart moving at 4 m/s on a frictionless track with no pushes.'))),
  item('inertia', 'pf-l5', pick('fp-i2', 'A bus brakes suddenly and standing passengers lean forward. Which explanation is correct?', [
    ['They tend to keep their old velocity (inertia) while the bus slows', null],
    ['A forward force acts on them when the bus brakes', 'No forward force appears. They simply keep moving as they were.', 'new_forward_force'],
    ['Inertia pushes them forward', 'Inertia is a property, not a force: it does not push anything.', 'inertia_is_force'],
  ], 'Inertia: the velocity does not change by itself.')),
  item('inertia', 'pf-l5', numQ('fp-i3', 'The same force pulse changes the velocity of a 2 kg cart by 6 m/s. By how much does it change the velocity of a 6 kg cart, in m/s? (Three times the mass gives one third of the change.)', 2, 'One third of 6 m/s: 2 m/s.', { unit: 'm/s', rules: [[[18], 'The heavier cart changes its velocity less, not more.', 'heavier_faster'], [[6], 'The mass changed, so the change of velocity changes too.', 'mass_ignored']] })),
  item('inertia', 'pf-l5', pick('fp-i4', 'Which object has the most inertia?', [
    ['A 50 kg trolley', null],
    ['A 5 kg trolley moving fast', 'Inertia depends on mass, not on how fast the object moves.', 'inertia_speed'],
    ['A 0.5 kg ball', 'It has the smallest mass of the three, so the least inertia.', 'mass_inverted'],
  ], 'Mass measures inertia.')),

  // ---- second law ----
  item('second', 'pf-l6', numQ('fp-s1', 'A car of mass 1200 kg accelerates at 1.5 m/s². What net force acts on it, in newtons?', 1800, 'F = ma = 1200 × 1.5 = 1800 N.', { unit: 'N', rules: [[[800], 'You divided the mass by the acceleration. F = m × a.', 'divided']] })),
  item('second', 'pf-l6', numQ('fp-s2', 'A net force of 30 N gives an object an acceleration of 6 m/s². What is its mass, in kilograms?', 5, 'm = F ÷ a = 30 ÷ 6 = 5 kg.', { unit: 'kg', rules: [[[180], 'You multiplied. m = F ÷ a.', 'multiplied'], [[0.2], 'You divided the other way round. m = F ÷ a.', 'inverted']] })),
  item('second', 'pf-l6', numQ('fp-s3', 'A 10 kg crate is pushed with 50 N and the friction on it is 30 N. What is its acceleration, in m/s²?', 2, 'Net force 50 − 30 = 20 N; a = 20 ÷ 10 = 2 m/s².', { unit: 'm/s²', rules: [[[5], 'You used the push alone (50 ÷ 10). Use the net force: push minus friction.', 'push_not_net']] })),
  item('second', 'pf-l6', pick('fp-s4', 'The same net force acts on a cart, then the cart\'s mass is doubled. The acceleration:', [
    ['is halved', null],
    ['is doubled', 'A bigger mass accelerates less for the same force.', 'mass_direct'],
    ['stays the same', 'a = F ÷ m depends on the mass.', 'mass_ignored'],
  ], 'a is inversely proportional to m.', cartVisual({ setup: c({ massKg: 2, forceA: 8 }), t: 2, graphs: true }, 'A 2 kg cart with an 8 N net force; the graphs show a against F and against m.'))),
  item('second', 'pf-l6', numQ('fp-s5', 'Using g = 10 m/s², what is the weight of a 70 kg person, in newtons?', 700, 'W = mg = 70 × 10 = 700 N.', { unit: 'N', rules: [[[70], 'That is the mass. Weight is a force: mg.', 'mass_for_weight']] })),

  // ---- momentum (enrichment) ----
  item('momentum', 'pf-l7', numQ('fp-m1', 'What is the momentum of a 4 kg cart moving at 3 m/s, in kg m/s?', 12, 'p = mv = 4 × 3 = 12 kg m/s.', { unit: 'kg m/s', rules: [[[7], 'You added. Momentum is mass × velocity.', 'added']] })),
  item('momentum', 'pf-l7', numQ('fp-m2', 'A 5 kg cart moving right at 2 m/s is turned round and leaves at 3 m/s to the left. What is its change of momentum, in kg m/s (right positive)?', -25, 'Δp = 5 × (−3) − 5 × 2 = −15 − 10 = −25 kg m/s.', { unit: 'kg m/s', rules: [[[-5], '−5 comes from 5 × (−3 + 2). Final minus initial velocity is −3 − 2 = −5, so Δp = 5 × (−5).', 'velocity_change_sign'], [[25], 'The momentum changes towards the left, so the change is negative.', 'sign_dropped']] })),
  item('momentum', 'pf-l7', numQ('fp-m3', 'A ball\'s momentum changes by 30 kg m/s in 0.1 s while it is being stopped. What is the average force on it, in newtons?', 300, 'F = Δp ÷ Δt = 30 ÷ 0.1 = 300 N.', { unit: 'N', rules: [[[3], 'You multiplied by the time. F = Δp ÷ Δt.', 'multiplied']] })),

  // ---- third law and pairs ----
  item('third', 'pf-l8', pick('fp-t1', 'In the figure a hand pushes a wall to the right. What is the reaction to the force of the hand on the wall?', [
    ['The force of the wall on the hand, to the left', null],
    ['The weight of the wall', 'The weight is exerted by the Earth. The reaction is exerted by the wall, on the hand.', 'wrong_partner'],
    ['A second push of the hand on the wall', 'The reaction acts on the hand, not on the wall.', 'same_object'],
  ], 'Swap the objects.', pairVisual({ scenario: 'wall', mode: 'identify' }, 'A hand pushes a wall.'))),
  item('third', 'pf-l8', pick('fp-t2', 'A small car and a large lorry collide. During the collision, compared with the force of the lorry on the car, the force of the car on the lorry is:', [
    ['equal in size and opposite in direction', null],
    ['smaller, because the car is lighter', 'The forces of a pair are always equal. The lighter car just accelerates more.', 'heavier_larger_force'],
    ['larger, because the car is hit', 'The two forces are exactly equal.', 'reaction_weaker'],
  ], 'Equal and opposite, whatever the masses.')),
  item('third', 'pf-l8', numQ('fp-t3', 'A rifle of mass 4 kg and a bullet of mass 0.04 kg push each other with 10 N. What is the rifle\'s acceleration, in m/s²?', 2.5, 'a = F ÷ m = 10 ÷ 4 = 2.5 m/s² (the bullet\'s is 250 m/s²).', { unit: 'm/s²', rules: [[[250], '250 m/s² is the bullet\'s acceleration. Use the rifle\'s mass, 4 kg.', 'wrong_mass']] })),
  item('third', 'pf-l8', pick('fp-t4', 'A horse pulls a cart forward and the cart pulls the horse back equally. Why can the cart accelerate?', [
    ['The cart\'s pull on the horse acts on the horse; the forces on the cart (the horse\'s pull and friction) do not balance', null],
    ['The horse pulls harder than the cart pulls back', 'The two forces are exactly equal. The cart accelerates because of the forces acting on the cart itself.', 'forces_unequal'],
    ['The pair cancels, but the cart moves anyway', 'The pair does not cancel because it acts on two different objects.', 'pairs_cancel'],
  ], 'Add only the forces on one object.')),
  item('third', 'pf-l9', numQ('fp-t5', 'A rocket has a thrust of 12000 N and a weight of 8000 N. What is the net force on it, in newtons (up is positive)?', 4000, '12000 − 8000 = 4000 N, upwards.', { unit: 'N', rules: [[[20000], 'You added the thrust and the weight. They act in opposite directions.', 'added_opposites'], [[0], 'The reaction to the thrust acts on the exhaust gas, not on the rocket, so it does not cancel the thrust.', 'pairs_cancel']], visual: pairVisual({ scenario: 'rocket', mode: 'identify' }, 'A rocket: thrust, the push of the rocket on the gas, and the weight.') })),

  // ---- systems ----
  item('system', 'pf-l10', numQ('fp-y1', 'A force of 24 N pulls a 2 kg box joined by a string to a 4 kg box on a smooth floor. What is the acceleration of the boxes, in m/s²?', 4, 'a = F ÷ (m₁ + m₂) = 24 ÷ 6 = 4 m/s².', { unit: 'm/s²', rules: [[[12], '24 ÷ 2 uses only the pulled box. The string makes the 4 kg box move too: use 6 kg.', 'one_mass_only']], visual: twoBodyVisual({ setup: { ...DEFAULT_TWO_BODY, mode: 'tow', massA: 2, massB: 4, force: 24, durationS: 2 } }, 'Two boxes joined by a string; the 2 kg box is pulled with 24 N.') })),
  item('system', 'pf-l10', numQ('fp-y2', 'In the same situation, what is the tension in the string, in newtons?', 16, 'T = m₂ a = 4 × 4 = 16 N (the string pulls only the 4 kg box).', { unit: 'N', rules: [[[24], 'The tension is less than the pull: part of the 24 N accelerates the pulled box.', 'tension_equals_force'], [[8], '8 N is the net force on the pulled box (24 − 16). The tension acts on the box behind.', 'wrong_box']] })),
  item('system', 'pf-l10', numQ('fp-y3', 'What is the net force on the pulled 2 kg box, in newtons?', 8, 'F − T = 24 − 16 = 8 N, and m a = 2 × 4 = 8 N.', { unit: 'N', rules: [[[24], 'The tension pulls back on this box: the net force is F − T.', 'tension_ignored']] })),
  item('system', 'pf-l10', pick('fp-y4', 'For a system of two boxes joined by a string, which of these is an internal force?', [
    ['The tension in the string', null],
    ['The pull of the hand on the first box', 'The hand is outside the system, so its pull is an external force.', 'external_confused'],
    ['The weight of a box', 'The Earth is outside the system, so the weight is an external force.', 'external_confused'],
  ], 'Forces between the objects of the system are internal.')),
];

export const forcePracticeByCategory = (cat: ForcePracticeCategory): ForcePracticeItem[] => FORCE_PRACTICE_ITEMS.filter((i) => i.category === cat);
