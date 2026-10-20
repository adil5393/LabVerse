/**
 * Chapter Practice for "Work, Energy, and Simple Machines" (PHY-3E): 33 original questions across the whole chapter.
 * None repeats a lesson question or an NCERT exercise; none needs a prerequisite or a login; each is shown once, so nothing here
 * can be repeated to manufacture mastery. Practice results are shown to the student only: they are not written to the
 * learning-progress store and never change a lesson's mastery. Every numerical answer is checked against a hand calculation in
 * the tests. Each item names the lesson objective it practises (`objective`: "lesson/objective") and a lesson to review.
 */

import type { Question } from '../../education/types';
import { DEFAULT_ENERGY } from './energyLab';
import { DEFAULT_KINETIC } from './kineticModel';
import { DEFAULT_POWER } from './power';
import { DEFAULT_WORK } from './workModel';
import { energyVisual, kineticVisual, numQ, pick, powerVisual, workVisual } from './learn/questions';

export type WorkPracticeCategory = 'work' | 'energy' | 'potential' | 'conservation' | 'friction' | 'power' | 'machines' | 'lever' | 'graph' | 'derive';

export const WORK_PRACTICE_CATEGORIES: { id: WorkPracticeCategory; title: string; blurb: string; enrichment?: boolean }[] = [
  { id: 'work', title: 'Work and its sign', blurb: 'Force, displacement, joules, and positive, negative and zero work.' },
  { id: 'energy', title: 'The work-energy theorem and kinetic energy', blurb: 'Energy changes from work, K = ½mv², and speeds and stopping distances.' },
  { id: 'potential', title: 'Potential energy', blurb: 'Stored energy, U = mgh and the reference level.' },
  { id: 'conservation', title: 'Conservation of mechanical energy', blurb: 'Kinetic and potential energy exchanging while the total stays the same.' },
  { id: 'friction', title: 'Friction and thermal energy', blurb: 'Where the mechanical energy goes when there is friction.' },
  { id: 'power', title: 'Power', blurb: 'The rate of doing work, in watts.' },
  { id: 'machines', title: 'Pulleys and inclined planes', blurb: 'Effort, load, mechanical advantage and the trade of force for distance.' },
  { id: 'lever', title: 'Levers', blurb: 'Arms, balance and the classes of lever.' },
  { id: 'graph', title: 'Diagrams and graphs', blurb: 'Read the work, energy and power from the figures.' },
  { id: 'derive', title: 'Derivation reasoning', blurb: 'Why the steps of the derivations are valid.', enrichment: false },
];

export interface WorkPracticeItem { id: string; category: WorkPracticeCategory; question: Question; lessonId: string; /** "lesson/objective" this item practises. */ objective: string }

const item = (category: WorkPracticeCategory, lessonId: string, objectiveId: string, question: Question): WorkPracticeItem => ({ id: question.id, category, question, lessonId, objective: `${lessonId}/${objectiveId}` });

export const WORK_PRACTICE_ITEMS: WorkPracticeItem[] = [
  // ---- work and its sign ----
  item('work', 'pw-l1', 'formula', numQ('pr7-w1', 'A porter pushes a trolley with a steady 45 N force through 6 m, along the line of the push. How much work does the porter do on the trolley, in joules?', 270, 'W = F × s = 45 × 6 = 270 J.', { unit: 'J', refresherId: 'pw3-formula', rules: [[[51], 'You added the force and the displacement. Work is their product.', 'added'], [[7.5], 'You divided. Work is force multiplied by displacement.', 'divided']] })),
  item('work', 'pw-l2', 'perp', pick('pr7-w2', 'A skater glides across a level rink at a steady speed. The ice pushes up on her with a force equal to her weight. What work does this upward force do on her while she glides 10 m?', [
    ['Zero: the force is perpendicular to her displacement', null],
    ['Positive, because the force holds her up', 'Holding her up is a force, but she moves sideways. With no displacement along the force the work is zero.', 'perp_is_work'],
    ['Negative, because it opposes her weight', 'The sign of the work depends on the force and the displacement. Here they are at right angles, so the work is zero.', 'perp_is_work'],
  ], 'Perpendicular: zero work.', workVisual({ setup: { ...DEFAULT_WORK, forceN: 600, angleDeg: 90, displacement: 10, startPos: 1, massKg: 60 } }, 'A 60 kg skater gliding 10 m with a 600 N upward force from the ice.'), 'pw7-perp')),
  item('work', 'pw-l3', 'calc', numQ('pr7-w3', 'A friction force of 6 N acts on a box that slides 80 cm. Taking the direction of sliding as positive, what is the work done by friction, in joules?', -4.8, 'Convert 80 cm to 0.8 m. Friction is opposite to the displacement: W = (−6) × 0.8 = −4.8 J.', { unit: 'J', refresherId: 'pw11-calc', rules: [[[-480], 'You used 80 instead of 0.8 m. Change centimetres to metres first.', 'cm_not_converted'], [[4.8], 'The size is right, but friction is opposite to the displacement, so the work is negative.', 'sign_confused']] })),

  // ---- work-energy theorem and kinetic energy ----
  item('energy', 'pw-l5', 'formula', numQ('pr7-k1', 'A cyclist and bicycle together have a mass of 70 kg and move at 6 m/s. What is their kinetic energy, in joules?', 1260, 'K = ½ × 70 × 6² = ½ × 70 × 36 = 1260 J.', { unit: 'J', refresherId: 'pw20-meaning', rules: [[[420], 'You did not square the speed: 6² = 36.', 'not_squared'], [[2520], 'You left out the ½.', 'forgot_half']] })),
  item('energy', 'pw-l5', 'compare', pick('pr7-k2', 'A car\'s speed increases from 10 m/s to 30 m/s. By what factor does its kinetic energy increase?', [
    ['9', null],
    ['3', 'The speed is tripled, but the kinetic energy depends on the square of the speed: 3² = 9.', 'linear_in_speed'],
    ['6', 'You may have added a 3 and a 2. The factor is the square of the speed ratio, 3² = 9.', 'wrong_factor'],
  ], 'Tripling the speed multiplies K by 9.', undefined, 'pw20-meaning')),
  item('energy', 'pw-l5', 'apply', numQ('pr7-k3', 'A 4 kg box moving along a table has 50 J of kinetic energy. What is its speed, in m/s?', 5, 'K = ½ m v², so v² = 2 × 50 ÷ 4 = 25 and v = 5 m/s.', { unit: 'm/s', refresherId: 'pw21-use', rules: [[[25], 'That is v². The speed is its square root.', 'forgot_root'], [[12.5], 'You divided 50 by 4 without the factor 2 and the square root. v² = 2K ÷ m = 25.', 'algebra']] })),
  item('energy', 'pw-l4', 'theorem', pick('pr7-k4', 'A 3 kg ball moving with 24 J of kinetic energy has −24 J of net work done on it. What happens to it?', [
    ['It comes to rest: its kinetic energy is now 0 J', null],
    ['Its kinetic energy becomes −24 J', 'Kinetic energy cannot be negative. With 24 J removed from 24 J, nothing is left and the ball stops.', 'negative_K'],
    ['It speeds up, because the net work is large', 'The sign of the net work is negative, so it removes energy: the ball slows down and here stops.', 'sign_confused'],
  ], 'K final = 24 + (−24) = 0.', undefined, 'pw15-theorem')),
  item('energy', 'pw-l5', 'apply', numQ('pr7-k5', 'A 600 kg vehicle moving at 10 m/s is brought to rest by a constant braking force of 3000 N. How far does it travel while braking, in metres?', 10, 'K = ½ × 600 × 10² = 30 000 J = 3000 × d, so d = 10 m.', { unit: 'm', refresherId: 'pw21-use', rules: [[[30000], 'That is the kinetic energy in joules. Divide it by the force to get the distance.', 'energy_for_distance'], [[0.1], 'You divided the force by the energy. d = K ÷ F.', 'inverted']] })),

  // ---- potential energy ----
  item('potential', 'pw-l6', 'gpe', numQ('pr7-u1', 'A 0.8 kg book is raised from a table 0.75 m above the floor to a shelf 2.25 m above the floor. By how much does its potential energy change, in joules? (g = 10 m/s²)', 12, 'ΔU = m g Δh = 0.8 × 10 × (2.25 − 0.75) = 0.8 × 10 × 1.5 = 12 J.', { unit: 'J', refresherId: 'pw25-reference', rules: [[[18], 'You used the final height only. The change uses the difference: 2.25 − 0.75 = 1.5 m.', 'height_not_difference'], [[1.2], 'You left out g. ΔU = m g Δh.', 'g_missing']] })),
  item('potential', 'pw-l6', 'reference', numQ('pr7-u2', 'A 2 kg parcel sits on an upper shelf 3 m above the floor. The zero level of potential energy is moved from the floor to a lower shelf 1 m above the floor. What is the parcel\'s potential energy now, in joules? (g = 10 m/s²)', 40, 'U = m g (h − h_ref) = 2 × 10 × (3 − 1) = 40 J.', { unit: 'J', refresherId: 'pw25-reference', rules: [[[60], 'That is the value with the floor as zero. Measure the height from the lower shelf: 3 − 1 = 2 m.', 'reference_ignored'], [[20], 'You used the 1 m height. The parcel is 2 m above the new zero level.', 'wrong_height']] })),
  item('potential', 'pw-l6', 'work', pick('pr7-u3', 'A ball is rolled at a steady speed across a level floor from one wall to the other. Compared with the start, its gravitational potential energy at the end is:', [
    ['unchanged: its height did not change', null],
    ['larger, because it moved a long way', 'Potential energy near the Earth depends on the height, not on the horizontal distance.', 'distance_for_height'],
    ['smaller, because friction acted on it', 'Friction affects its kinetic energy and thermal energy, not its height, so U is unchanged.', 'friction_for_U'],
  ], 'U = mgh depends only on the height.', undefined, 'pw25-reference')),

  // ---- conservation ----
  item('conservation', 'pw-l7', 'convert', numQ('pr7-c1', 'A 2 kg stone is dropped from rest and falls 20 m (no air resistance, g = 10 m/s²). What is its speed just before it lands, in m/s?', 20, 'v = √(2gh) = √(2 × 10 × 20) = √400 = 20 m/s.', { unit: 'm/s', refresherId: 'pw27-lab', rules: [[[400], 'That is v². Take the square root.', 'forgot_root'], [[200], 'You used v = gh. The speed is v = √(2gh).', 'formula_misused']] })),
  item('conservation', 'pw-l7', 'convert', numQ('pr7-c2', 'A pendulum bob is released at rest 0.2 m above its lowest point. Ignoring friction, what is its speed at the lowest point, in m/s? (g = 10 m/s²)', 2, 'm g h = ½ m v² gives v = √(2 × 10 × 0.2) = √4 = 2 m/s.', { unit: 'm/s', refresherId: 'pw27-lab', rules: [[[4], 'That is v². Take the square root.', 'forgot_root'], [[0.2], 'That is the height. The speed is √(2gh).', 'height_for_speed']] })),
  item('conservation', 'pw-l7', 'conserve', pick('pr7-c3', 'An ideal pendulum (no friction) swings to the right-hand end of its swing. At that instant its mechanical energy is:', [
    ['all potential, and equal to its mechanical energy at every other point', null],
    ['all kinetic, because it is about to swing back', 'At the end of the swing the bob stops for an instant, so its kinetic energy is zero.', 'swapped'],
    ['half kinetic and half potential at every point', 'The split changes with position: all potential at the ends, all kinetic at the lowest point.', 'fixed_split'],
  ], 'At the ends K = 0 and all the energy is potential.', undefined, 'pw28-pendulum')),
  item('conservation', 'pw-l7', 'apply', numQ('pr7-c4', 'A ball is thrown straight up at 15 m/s. Ignoring air resistance, how high does it rise, in metres? (g = 10 m/s²)', 11.25, 'm g h = ½ m v² gives h = v² ÷ (2g) = 225 ÷ 20 = 11.25 m.', { unit: 'm', tolerance: 0.01, refresherId: 'pw30-solve', rules: [[[22.5], 'You divided v² by g only. h = v² ÷ (2g).', 'algebra'], [[15], 'That is the speed. The height is v² ÷ (2g).', 'speed_for_height']] })),

  // ---- friction and thermal energy ----
  item('friction', 'pw-l7', 'friction', numQ('pr7-f1', 'A 5 kg block slides from rest down a rough ramp from a height of 3 m and reaches the bottom with 110 J of kinetic energy. How much thermal energy did friction produce, in joules? (g = 10 m/s²)', 40, 'The starting energy is m g h = 5 × 10 × 3 = 150 J. K + Q = 150, so Q = 150 − 110 = 40 J.', { unit: 'J', refresherId: 'pw29-friction', rules: [[[150], 'That is the starting potential energy. The thermal energy is what is missing from it.', 'total_for_Q'], [[110], 'That is the kinetic energy at the bottom. Subtract it from the 150 J you started with.', 'K_for_Q']] })),
  item('friction', 'pw-l7', 'friction', pick('pr7-f2', 'The first hill of a ball roller coaster is the highest, and each later hill is lower. Which statement explains this and keeps the energy bookkeeping correct?', [
    ['Friction and air resistance turn some mechanical energy into thermal energy; the total energy is still conserved', null],
    ['The ball loses its mass as it rolls', 'The mass does not change. Mechanical energy is transferred to thermal energy by friction and air resistance.', 'mass_lost'],
    ['Energy is destroyed by friction, so the total decreases', 'Energy is not destroyed: it becomes thermal energy, so the total (including thermal) is conserved.', 'energy_destroyed'],
  ], 'Dissipation, with the total conserved.', undefined, 'pw28-pendulum')),

  // ---- power ----
  item('power', 'pw-l8', 'apply', numQ('pr7-r1', 'A motor lifts a 150 kg load through 8 m in 12 s. What is the average power of the motor, in watts? (g = 10 m/s²)', 1000, 'W = m g h = 150 × 10 × 8 = 12 000 J; P = 12 000 ÷ 12 = 1000 W.', { unit: 'W', refresherId: 'pw34-solve', rules: [[[12000], 'That is the work in joules. Divide by the 12 s.', 'work_for_power'], [[100], 'You divided by 120. Divide the work 12 000 J by the time 12 s.', 'arithmetic']] })),
  item('power', 'pw-l8', 'compare', pick('pr7-r2', 'Machine A does 500 J of work in 10 s. Machine B does 300 J of work in 5 s. Which has the greater power?', [
    ['Machine B (60 W against 50 W)', null],
    ['Machine A, because it does more work', 'Power also depends on the time: A has 500 ÷ 10 = 50 W and B has 300 ÷ 5 = 60 W.', 'work_for_power'],
    ['They have the same power', 'The ratios are different: 50 W and 60 W.', 'time_ignored'],
  ], 'P = W ÷ t: 60 W > 50 W.', undefined, 'pw32-formula')),
  item('power', 'pw-l8', 'calc', numQ('pr7-r3', 'A 40 W lamp is switched on for 2 minutes. How much energy does it transfer, in joules?', 4800, 'W = P × t = 40 × 120 = 4800 J.', { unit: 'J', refresherId: 'pw33-unit', rules: [[[80], 'You used 2 for the time. Change 2 minutes to 120 s.', 'unit_ignored'], [[0.33], 'You divided the power by the time. W = P × t.', 'inverted']] })),

  // ---- pulleys and inclined planes ----
  item('machines', 'pw-l9', 'pulley', numQ('pr7-m1', 'An ideal pulley system with 3 supporting strands raises a 90 N load. What effort is needed, in newtons?', 30, 'Each strand carries one third of the load: 90 ÷ 3 = 30 N.', { unit: 'N', refresherId: 'pw36-pulley', rules: [[[270], 'You multiplied by 3. The strands share the load, so the effort is smaller.', 'multiplied'], [[90], 'That is the load. With 3 strands the effort is a third of it.', 'load_for_effort']] })),
  item('machines', 'pw-l9', 'pulley', numQ('pr7-m2', 'A system with 4 supporting strands raises a load by 1.5 m. How much rope must be pulled, in metres?', 6, 'Rope pulled = strands × rise = 4 × 1.5 = 6 m.', { unit: 'm', refresherId: 'pw36-pulley', rules: [[[1.5], 'That is the rise of the load. The rope pulled is 4 times the rise.', 'rope_equals_rise'], [[0.375], 'You divided. The rope pulled is longer than the rise.', 'inverted']] })),
  item('machines', 'pw-l9', 'ramp', numQ('pr7-m3', 'A smooth ramp 6 m long raises a load to a height of 1.5 m. What is its mechanical advantage?', 4, 'MA = L ÷ h = 6 ÷ 1.5 = 4.', { refresherId: 'pw37-ramp', rules: [[[0.25], 'That is h ÷ L. The mechanical advantage is L ÷ h.', 'inverted'], [[4.5], 'You added the numbers. MA is a ratio.', 'added']] })),
  item('machines', 'pw-l9', 'tradeoff', pick('pr7-m4', 'A longer ramp is used to load a heavy crate onto a lorry, and the crate is pushed up it at a steady speed. Compared with a shorter smooth ramp, the longer smooth ramp needs:', [
    ['a smaller effort but the same work', null],
    ['a smaller effort and less work', 'The smaller force acts over a longer distance, so the work is the same: F′ × L = m g h.', 'work_reduced'],
    ['the same effort but more work', 'The effort is smaller on a longer ramp (F′ = mgh ÷ L).', 'effort_constant'],
  ], 'Smaller force, longer distance, the same work.', undefined, 'pw39-notwork')),

  // ---- levers ----
  item('lever', 'pw-l10', 'balance', numQ('pr7-l1', 'A 90 N load is 0.2 m from the fulcrum of a lever. What effort applied 0.9 m from the fulcrum (on the other side) balances it, in newtons?', 20, 'F₁ × 0.9 = 90 × 0.2 = 18, so F₁ = 20 N.', { unit: 'N', refresherId: 'pw41-balance', rules: [[[405], 'You multiplied by the arm ratio instead of dividing. F₁ = load × L₂ ÷ L₁.', 'inverted'], [[90], 'That would need equal arms.', 'equal_arms']] })),
  item('lever', 'pw-l10', 'work', pick('pr7-l2', 'A lever has a mechanical advantage of 0.5. Compared with the effort, the force it exerts on the load is:', [
    ['smaller (half), but the load moves twice as far as the effort', null],
    ['larger (double), and the load moves half as far', 'A mechanical advantage above 1 would do that. With MA = 0.5 the load force is half the effort and the load moves farther.', 'ma_inverted'],
    ['the same, because levers never change forces', 'A lever does change the force: MA = load ÷ effort = 0.5 means the load force is half the effort.', 'ma_ignored'],
  ], 'MA = 0.5: half the force, twice the distance.', undefined, 'pw44-work')),
  item('lever', 'pw-l10', 'balance', pick('pr7-l3', 'A 40 kg child sits 1.5 m from the fulcrum of a seesaw and a 25 kg child sits 2 m from it on the other side. What happens?', [
    ['The 40 kg child\'s side goes down (600 N m against 500 N m)', null],
    ['The 25 kg child\'s side goes down, because it is farther away', 'Compare weight × distance: 400 × 1.5 = 600 and 250 × 2 = 500. The first is larger, so the 40 kg side goes down.', 'distance_only'],
    ['The seesaw balances', 'The two products are 600 and 500, not equal, so it does not balance.', 'always_balanced'],
  ], 'Weight × distance decides.', undefined, 'pw42-lab')),

  // ---- diagrams and graphs ----
  item('graph', 'pw-l5', 'signs', numQ('pr7-g1', 'The figure shows a 2 kg cart pushed from rest by a net force of +5 N through 6 m. Read the area under the force graph to find the kinetic energy at the end, in joules.', 30, 'The area is 5 N × 6 m = 30 J. Starting from rest, the kinetic energy is 30 J.', { unit: 'J', refresherId: 'pw19-derive', rules: [[[11], 'You added the numbers. The area of the rectangle is height × width.', 'added'], [[15], 'You halved it. The shape is a rectangle, not a triangle: 5 × 6.', 'triangle_for_rectangle']], visual: kineticVisual({ setup: { ...DEFAULT_KINETIC, massKg: 2, netForce: 5, u: 0, displacement: 6 } }, 'A 2 kg cart pushed from rest by a net force of 5 N through 6 m.') })),
  item('graph', 'pw-l7', 'convert', numQ('pr7-g2', 'The figure shows a 4 kg object released from 3 m (vertical drop, g = 10 m/s²). The mechanical energy K + U stays constant. What is its kinetic energy at the bottom, in joules?', 120, 'The mechanical energy is m g h = 4 × 10 × 3 = 120 J, all kinetic at the bottom.', { unit: 'J', refresherId: 'pw26-free', rules: [[[12], 'You left out g. m g h = 4 × 10 × 3.', 'g_missing'], [[0], 'At the bottom the potential energy is zero, but the kinetic energy is not: it holds all the energy.', 'U_for_K']], visual: energyVisual({ setup: { ...DEFAULT_ENERGY, massKg: 4, startHeight: 3 }, fraction: 0.5 }, 'A 4 kg object falling from 3 m, shown half way down.') })),
  item('graph', 'pw-l8', 'compare', numQ('pr7-g3', 'The figure shows a 60 kg person raised 3 m in 4 s (450 W). If the same climb took 9 s, what would the average power be, in watts?', 200, 'The work is still 1800 J, so P = 1800 ÷ 9 = 200 W.', { unit: 'W', refresherId: 'pw32-formula', rules: [[[450], 'That is the power for 4 s. The work is the same but the time is longer, so the power is smaller.', 'time_ignored'], [[1800], 'That is the work in joules. Divide it by 9 s.', 'work_for_power']], visual: powerVisual({ setup: { ...DEFAULT_POWER, scenario: 'lift', massKg: 60, height: 3, timeS: 4 } }, 'A 60 kg person raised 3 m in 4 s.') })),

  // ---- derivation reasoning ----
  item('derive', 'pw-l5', 'derive', pick('pr7-d1', 'The derivation of W_net = ½mv² − ½mu² uses v² = u² + 2as. Why must the net force be constant for this?', [
    ['The equation holds only for a constant acceleration, and a constant net force gives one', null],
    ['Because work is only defined for constant forces', 'Work can be defined for changing forces too (as an area). The restriction comes from the equation of motion used.', 'work_needs_constant'],
    ['Because the mass would change otherwise', 'The mass is assumed constant separately. The equation of motion needs a constant acceleration.', 'mass_for_force'],
  ], 'v² = u² + 2as needs a constant acceleration.', undefined, 'pw19-derive')),
  item('derive', 'pw-l7', 'conserve', pick('pr7-d2', 'In the derivation for a falling object, the terms ½mg²t² cancel when K and U are added. What does this cancellation express?', [
    ['The potential energy lost equals the kinetic energy gained, so the sum does not depend on time', null],
    ['The kinetic energy is always zero', 'The kinetic energy ½mg²t² grows with time. It is cancelled by the loss of potential energy, not zero.', 'K_zero'],
    ['The object stops falling', 'The cancellation is about the sum of the energies, not the motion: the object keeps speeding up.', 'motion_stops'],
  ], 'Energy lost by U is gained by K.', undefined, 'pw26-free')),
  item('derive', 'pw-l10', 'balance', pick('pr7-d3', 'In the lever derivation, F₁ × L₁φ = F₂ × L₂φ is simplified by cancelling φ. Why is the same φ on both sides?', [
    ['A rigid bar turns through the same angle at every point, so both ends turn by φ', null],
    ['Because the two forces are equal', 'The forces are different in general. The common φ comes from the bar being rigid.', 'forces_equal'],
    ['Because the two arms are equal', 'The arms are different in general. The common φ comes from the bar being rigid.', 'arms_equal'],
  ], 'Both ends of a rigid bar turn through the same angle.', undefined, 'pw41-balance')),
];

export const workPracticeByCategory = (c: WorkPracticeCategory): WorkPracticeItem[] => WORK_PRACTICE_ITEMS.filter((i) => i.category === c);
