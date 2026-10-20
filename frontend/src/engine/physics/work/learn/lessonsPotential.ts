/**
 * Class 9 Physics, Chapter 7: Unit 3 lessons (PHY-3C). Lesson 6: potential energy (Section 7.4.2, Activity 7.1, Eqs. 7.7 and 7.8).
 * Lesson 7: conservation of mechanical energy (Section 7.4.3, Eqs. 7.9 and 7.10, Activity 7.2, Example 7.8).
 * Wording, figures and numbers are original. Every figure is drawn from the Energy Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_ENERGY, type EnergySetup } from '../energyLab';
import { derivationVisual, energyVisual, ind, numQ, pick } from './questions';

export const elab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Energy Laboratory', description, href: `/physics/work/energy?experiment=${exp}`, buttonLabel: 'Open the Energy Laboratory' });
export const en = (o: Partial<EnergySetup>): EnergySetup => ({ ...DEFAULT_ENERGY, ...o });

// ---------------------------------------------------------------------------
// Lesson 6: Potential energy  (Section 7.4.2)
// ---------------------------------------------------------------------------

export const W6: EduLesson = {
  id: 'pw-l6', unitId: 'pw-unit-3', number: 6, title: 'Potential energy: stored energy and U = mgh',
  objective: 'explain how energy is stored by shape or position, calculate the gravitational potential energy mgh, say why only changes of potential energy matter, and link the work done in lifting to the energy stored.',
  prerequisiteIds: ['pwp-weight', 'pwp-units', 'pwp-algebra'],
  objectives: [
    { id: 'meaning', label: 'Say what potential energy is and give examples' },
    { id: 'gpe', label: 'Calculate gravitational potential energy mgh' },
    { id: 'reference', label: 'Explain the reference level and why only changes matter' },
    { id: 'work', label: 'Link the work done to the energy stored' },
  ],
  steps: [
    {
      id: 'pw22-stored', title: 'Energy stored by shape or position', phase: 'observe',
      paragraphs: [
        'Stretch a rubber band or the elastic of a slingshot and let go: the stone shoots forward and gains kinetic energy. The energy came from the stretched band. Bend a bow and the arrow flies off. A compressed or stretched spring does the same. The work done in deforming the band, the bow or the spring was stored in it, because the shape of the object changed.',
        'Energy can also be stored by the arrangement of objects. Pull two magnets with unlike poles apart and release them: they rush together and gain kinetic energy. Separated electric charges store energy in the same way. A ball lifted away from the Earth does too: the ball and the Earth attract each other, and when the ball is released they rush towards each other.',
        'The energy stored by an object because of its deformation, or in a system of objects because of their relative positions, is called potential energy. The internal forces of the stretched spring (or the gravitational force between the Earth and the ball) can do work when the object is released. Work done against friction, however, is not stored this way: it becomes thermal energy.',
      ],
      vocabulary: [{ term: 'potential energy', meaning: 'energy stored by the shape of an object or the relative positions of objects, measured in joules' }],
      check: pick('chk-pw22-stored', 'Which object has potential energy?', [
        ['A stretched rubber band that is held still', null],
        ['A ball rolling across level ground', 'A rolling ball has kinetic energy (energy of motion). The stretched band has potential energy because of its shape.', 'kinetic_for_potential'],
        ['A relaxed spring lying on a table', 'A relaxed spring has not been deformed, so there is no stored elastic energy in it.', 'relaxed_has_U'],
      ], 'Potential energy is energy stored by shape or position.', undefined, 'pw22-stored'),
    },
    {
      id: 'pw23-sand', title: 'Higher means more stored energy', phase: 'observe',
      paragraphs: [
        'In Activity 7.1 a heavy ball is dropped onto loose sand from different heights. The ball dropped from the greatest height makes the deepest dent. Raising a ball to a greater height needs more work, so the ball and the Earth store more energy, and that energy makes the deeper dent.',
        'The Earth is much more massive than the ball, so it hardly moves; the stored energy of the Earth-ball system is simply called the gravitational potential energy of the ball. From here on, "potential energy" means this gravitational potential energy.',
      ],
      check: pick('chk-pw23-sand', 'A ball is dropped into sand first from 1 m and then from 2 m. Which dent is deeper, and why?', [
        ['The one from 2 m: the ball had more stored energy at the greater height', null],
        ['The one from 1 m: the ball was nearer the sand', 'Being nearer means less stored energy. The ball from 2 m has more potential energy to turn into the dent.', 'height_inverted'],
        ['They are the same, because the ball is the same', 'The ball is the same but the height is not: a greater height stores more energy.', 'height_ignored'],
      ], 'Greater height, more potential energy, deeper dent.', undefined, 'pw23-sand'),
    },
    {
      id: 'pw24-mgh', title: 'U = mgh: from the work of lifting', phase: 'proof',
      paragraphs: [
        'We can find the stored energy. Lift an object of mass m slowly from the ground to a height h. The lifting force must equal the weight mg, so the work done is W = force × displacement = mg × h. This work becomes the stored energy, so we take the potential energy at the ground to be zero and the potential energy at height h to be U = mgh. Its unit is the joule.',
        'Below you can go through the derivation, change the numbers and supply the reasoning for the key steps. It also shows why only changes in potential energy matter (the reference level) and that gravity does the opposite work, −mgΔh.',
      ],
      visual: derivationVisual('U', 'The derivation of the potential energy U = mgh and ΔU = mgΔh.'),
      notice: 'Answer the questions in the steps to see the mathematics. Change the reference height and watch what stays the same.',
      check: pick('chk-pw24-mgh', 'A 2 kg object is lifted slowly 3 m. Which expression gives the potential energy it gains?', [
        ['m g h = 2 × 10 × 3 = 60 J', null],
        ['m h = 6 J', 'The weight mg (a force) multiplies the height. Leaving out g gives a mass times a distance, not an energy.', 'g_missing'],
        ['½ m h² = 9 J', 'Potential energy is not like kinetic energy: the height is not squared. U = mgh.', 'squared_height'],
      ], 'U = mgh.', undefined, 'pw24-mgh'),
    },
    {
      id: 'pw25-reference', title: 'The zero level, the path and horizontal motion', phase: 'reasoning',
      paragraphs: [
        'ENRICHMENT, the idea of a reference level: U = mgh measures the height from a level where we CHOOSE the potential energy to be zero (the ground in the textbook). If you choose a table top instead, every U changes by the same amount but the CHANGE in potential energy between two heights does not. So potential energy has no absolute zero: only changes in it are physical.',
        'The gain in potential energy depends only on the vertical height gained, not the path: a student lifted straight up by an elevator and one who climbs the stairs to the same height gain the same potential energy. And an object moving horizontally at a constant height does not change its potential energy, while one raised gradually does. The formula mgh is valid only near the Earth\'s surface, where g is constant.',
      ],
      visual: energyVisual({ setup: en({ massKg: 2, startHeight: 5, refHeight: 3 }), editable: true }, 'A 2 kg ball falling 5 m with the zero level of potential energy at 3 m.'),
      notice: 'Change the reference height in More settings. U changes, but the change in U during the fall does not.',
      misconception: { wrong: 'A potential energy of −40 J is impossible, because energy cannot be negative.', right: 'Potential energy is measured from a chosen zero level, so below that level it is negative. Kinetic energy, ½mv², can never be negative.' },
      check: pick('chk-pw25-reference', 'A student of mass 50 kg is taken to the top floor by a lift, and another student of the same mass climbs the stairs to the same height. Compare the potential energy gained.', [
        ['The same: it depends only on the vertical height', null],
        ['The one who climbed gains more, because the path is longer', 'The length of the path does not matter. The potential energy gained is mgh with h the vertical height.', 'path_matters'],
        ['The one in the lift gains more, because the lift is faster', 'The speed does not matter. Only the mass and the height gained decide the stored energy.', 'speed_matters'],
      ], 'Same height, same potential energy.', undefined, 'pw25-reference'),
    },
  ],
  investigation: elab('F', 'Move the reference height and see which numbers change and which do not.'),
  worked: {
    id: 'w-pw-l6', title: 'Lifting a small ball',
    given: ['A 300 g ball is lifted slowly to a height of 8 m above the ground.', 'Take g = 10 m/s² and the ground as the zero level.'], ask: 'How much potential energy does the ball gain, and how much work was done in lifting it?',
    visual: energyVisual({ setup: en({ massKg: 0.3, startHeight: 8 }) }, 'A 0.3 kg ball at a height of 8 m.'),
    steps: [
      { text: 'Change the mass to kilograms: 300 g = 0.3 kg.', why: 'Energy in joules needs the mass in kg.' },
      { text: 'The lifting force equals the weight: F = m g = 0.3 × 10 = 3 N.', why: 'Slow lifting means balanced forces.' },
      { text: 'Work done: W = F × h = 3 N × 8 m = 24 J.', why: 'Force times displacement along the force.' },
      { text: 'The work is stored as potential energy: U = m g h = 0.3 × 10 × 8 = 24 J.', why: 'The kinetic energy does not change, so the work becomes potential energy.' },
    ],
    verify: 'The two routes agree: 3 N × 8 m = 24 J = 0.3 × 10 × 8. The ground is the zero level, so this is the value of U at 8 m.',
  },
  guided: {
    id: 'g-pw-l6', prompt: 'A 2 kg box is lifted slowly onto a shelf 5 m above the ground (g = 10 m/s²).',
    steps: [
      { id: 'g1', prompt: 'The weight.', question: numQ('pw-g6-1', 'What lifting force is needed, in newtons?', 20, 'F = m g = 2 × 10 = 20 N.', { unit: 'N', refresherId: 'pw24-mgh', rules: [[[2], 'You gave the mass. The force is the weight: multiply by 10.', 'mass_for_weight']] }), hints: ['Weight = m g.'] },
      { id: 'g2', prompt: 'The stored energy.', question: numQ('pw-g6-2', 'What potential energy does the box gain, in joules (ground as zero)?', 100, 'U = m g h = 20 N × 5 m = 100 J.', { unit: 'J', refresherId: 'pw24-mgh', rules: [[[25], 'You added or divided. Multiply the weight (20 N) by the height (5 m).', 'added'], [[10], 'You used m h. Include g: U = m g h.', 'g_missing']] }), hints: ['Multiply the weight by the height.'] },
      { id: 'g3', prompt: 'A different zero level.', question: numQ('pw-g6-3', 'The zero level is moved to a table at 2 m. What is the potential energy of the box on the shelf now, in joules?', 60, 'U = m g (h − h_ref) = 2 × 10 × (5 − 2) = 60 J.', { unit: 'J', refresherId: 'pw25-reference', rules: [[[100], 'That is the value with the ground as zero. Measure the height from the table: 5 − 2 = 3 m.', 'reference_ignored'], [[40], 'You used the 2 m instead of the 3 m between the table and the shelf.', 'wrong_height']] }), hints: ['The height above the new zero level is 5 − 2 m.'] },
    ],
    conclusion: 'U = mgh = 100 J from the ground, 60 J from the table: the zero level changes U but not the 40 J difference between the table and the ground.',
  },
  independent: [
    ind('i1', 'Meaning', 'meaning', 'Stored energy.', pick('pw-l6-i1', 'Which statement is correct?', [
      ['A compressed spring stores energy because its shape has changed', null],
      ['A compressed spring has no energy until it is released', 'The energy is stored in the compressed spring: that stored energy is what pushes the object out when it is released.', 'no_stored_energy'],
      ['A compressed spring has kinetic energy', 'Kinetic energy is the energy of motion. A held spring is at rest and has potential energy.', 'kinetic_for_potential'],
    ], 'Deformation stores potential energy.', undefined, 'pw22-stored'), ['What changed when the spring was compressed?'], ['Its shape: so it stores potential energy.']),
    ind('i2', 'Meaning', 'meaning', 'Released band.', pick('pw-l6-i2', 'A stretched rubber band is released and shoots a stone forward. What happened to the energy?', [
      ['The potential energy stored in the band became the kinetic energy of the stone', null],
      ['The stone created new energy', 'Energy is not created. The energy was stored in the stretched band.', 'energy_created'],
      ['The band\'s kinetic energy became potential energy', 'The band was at rest before release: its energy was potential, and it became the stone\'s kinetic energy.', 'direction_reversed'],
    ], 'Stored potential energy becomes kinetic energy.', undefined, 'pw22-stored'), ['Where did the stone\'s energy come from?'], ['From the stretched band.']),
    ind('i3', 'U = mgh', 'gpe', 'A raised block.', numQ('pw-l6-i3', 'A 4 kg block is lifted slowly through 3 m. How much gravitational potential energy does it gain, in joules? (g = 10 m/s²)', 120, 'U = m g h = 4 × 10 × 3 = 120 J.', { unit: 'J', refresherId: 'pw24-mgh', rules: [[[12], 'You left out g. U = m g h.', 'g_missing'], [[7], 'You added the numbers. Potential energy is mgh, a product.', 'added']] }), ['U = m g h.'], ['4 × 10 × 3 = 120 J.']),
    ind('i4', 'U = mgh', 'gpe', 'A small ball.', numQ('pw-l6-i4', 'A 250 g ball is at a height of 6 m. What is its potential energy, in joules? (g = 10 m/s², ground as zero)', 15, '250 g = 0.25 kg; U = 0.25 × 10 × 6 = 15 J.', { unit: 'J', refresherId: 'pw24-mgh', rules: [[[15000], 'You used 250 instead of 0.25 kg. Change grams to kilograms first.', 'g_not_converted']] }), ['Change grams to kilograms first.'], ['0.25 × 10 × 6 = 15 J.']),
    ind('i5', 'Reference level', 'reference', 'Moving the zero.', pick('pw-l6-i5', 'The zero level of potential energy is moved from the ground to a table top. Which of these does NOT change?', [
      ['The change in potential energy when an object moves between two heights', null],
      ['The potential energy of an object on the floor', 'It changes: relative to the table the floor is below the zero level, so the value is negative.', 'values_unchanged'],
      ['The potential energy of an object on the table', 'It changes: it becomes 0 J if the table is the new zero level.', 'values_unchanged'],
    ], 'Only differences are independent of the zero level.', undefined, 'pw25-reference'), ['Think about what cancels when you subtract two values.'], ['The change in potential energy.']),
    ind('i6', 'Reference level', 'reference', 'Lift or stairs.', numQ('pw-l6-i6', 'A 2 kg object moves from a height of 1 m to a height of 4 m above the ground. By how much does its potential energy change, in joules? (g = 10 m/s²)', 60, 'ΔU = m g Δh = 2 × 10 × (4 − 1) = 60 J.', { unit: 'J', refresherId: 'pw25-reference', rules: [[[80], 'You used the final height only. The change uses the height difference: 4 − 1 = 3 m.', 'height_not_difference'], [[-60], 'The object goes UP, so the potential energy increases: the change is positive.', 'sign_confused']] }), ['Use the difference of the heights.'], ['2 × 10 × 3 = 60 J.']),
    ind('i7', 'Work and stored energy', 'work', 'Lifting a bag.', numQ('pw-l6-i7', 'You lift a 5 kg bag slowly through 2 m. How much potential energy has the bag gained, in joules? (g = 10 m/s²)', 100, 'The work you do, 50 N × 2 m = 100 J, is stored: U = mgh = 100 J.', { unit: 'J', refresherId: 'pw24-mgh', rules: [[[10], 'You multiplied the mass by the height only. The lifting force is 5 × 10 = 50 N.', 'g_missing'], [[50], 'That is the lifting force in newtons. Multiply it by the 2 m.', 'force_for_work']] }), ['The work of lifting is stored.'], ['50 × 2 = 100 J.']),
    ind('i8', 'Work and stored energy', 'work', 'Rubbing.', pick('pw-l6-i8', 'You push a box along a rough floor at a steady speed. Is the work you do stored as potential energy in the box?', [
      ['No: work done against friction becomes thermal energy, not stored potential energy', null],
      ['Yes: all work becomes stored energy', 'Work done lifting against gravity is stored, but work done against friction is not: it becomes thermal energy.', 'all_work_stored'],
      ['Yes, as kinetic energy', 'The speed is steady, so the kinetic energy has not changed. The work goes into heating the surfaces.', 'goes_to_K'],
    ], 'Friction does not store energy.', undefined, 'pw22-stored'), ['What warms up when surfaces rub?'], ['It becomes thermal energy.']),
  ],
  reflection: {
    discover: 'Potential energy is energy stored by the shape of an object or the relative positions of objects. Lifting an object slowly through a height h takes the work mg × h, which is stored as potential energy U = mgh (measured from a chosen zero level; only changes matter, and the gain depends only on the vertical height). Work against friction is not stored; it becomes thermal energy.',
    evidence: 'You calculated stored energy, changed the reference level and linked the work of lifting to the energy stored.',
    stillConfusing: [{ text: 'What is potential energy?', refresherId: 'pw22-stored' }, { text: 'Why does height matter?', refresherId: 'pw23-sand' }, { text: 'Where does U = mgh come from?', refresherId: 'pw24-mgh' }, { text: 'What is the reference level?', refresherId: 'pw25-reference' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 7: Conservation of mechanical energy  (Section 7.4.3)
// ---------------------------------------------------------------------------

export const W7: EduLesson = {
  id: 'pw-l7', unitId: 'pw-unit-3', number: 7, title: 'Conservation of mechanical energy',
  objective: 'explain that the sum of kinetic and potential energy stays constant while only gravity does work, use it to find speeds, and explain where the mechanical energy goes when there is friction.',
  prerequisiteIds: ['pwp-eqmotion', 'pwp-algebra', 'pwp-weight'],
  objectives: [
    { id: 'conserve', label: 'State when K + U is conserved' },
    { id: 'convert', label: 'Follow the change between potential and kinetic energy' },
    { id: 'friction', label: 'Explain what friction does to the mechanical energy' },
    { id: 'apply', label: 'Use conservation of energy to find a speed or a height' },
  ],
  steps: [
    {
      id: 'pw26-free', title: 'Free fall: K + U stays the same', phase: 'proof',
      paragraphs: [
        'The sum of the kinetic energy and the potential energy of an object is its mechanical energy. Drop an object from a height h. At the top its potential energy is mgh and its kinetic energy is 0, so its mechanical energy is mgh. After falling for a time t it has a velocity gt and has fallen ½gt², so its potential energy is mgh − ½mg²t² and its kinetic energy is ½mg²t². Adding: the terms in t² cancel and the mechanical energy is still mgh.',
        'This is the conservation of mechanical energy: if no other external force does work, the mechanical energy of an object stays the same while it moves under gravity. Work through the derivation below, change the numbers and supply the reasoning for the key steps.',
      ],
      visual: derivationVisual('C', 'The derivation that K + U is constant in free fall.'),
      notice: 'The potential energy line and the kinetic energy line mirror each other: their sum is flat.',
      check: pick('chk-pw26-free', 'A ball is falling freely. Which statement is correct?', [
        ['Its potential energy decreases and its kinetic energy increases by the same amount', null],
        ['Its potential energy and its kinetic energy both increase', 'The ball loses height, so its potential energy decreases. Only the kinetic energy increases.', 'both_increase'],
        ['Its kinetic energy stays the same while its potential energy falls', 'The speed grows as the ball falls, so the kinetic energy grows. The decrease in U is what supplies it.', 'K_constant'],
      ], 'K gains what U loses.', undefined, 'pw26-free'),
    },
    {
      id: 'pw27-lab', title: 'The Energy Laboratory: speed from height', phase: 'observe',
      paragraphs: [
        'A child slides down a smooth slide. The potential energy at the top, mgh, becomes kinetic energy at the bottom, ½mv², with nothing lost to friction. Equating them: ½mv² = mgh, so v = √(2gh). The mass cancels and the shape of the slide does not appear, so the speed at the bottom depends only on the height.',
        'Try it below: change the mass, the height and the angle of the ramp and compare the speeds. With friction switched on, the speed is smaller.',
      ],
      visual: energyVisual({ setup: en({ massKg: 3, startHeight: 4, angleDeg: 30 }), editable: true }, 'A 3 kg block sliding down a smooth 30 degree ramp from a height of 4 m.'),
      notice: 'Change the mass and the angle. Does the speed at the bottom change?',
      check: pick('chk-pw27-lab', 'Two children of different masses slide down the same smooth slide. Compare their speeds at the bottom.', [
        ['The same: v = √(2gh) does not depend on the mass', null],
        ['The heavier child is faster', 'The heavier child has more energy to release but also more mass to speed up; the two cancel in ½mv² = mgh.', 'heavier_faster'],
        ['The lighter child is faster', 'The mass cancels in ½mv² = mgh, so it makes no difference to the speed (without friction).', 'lighter_faster'],
      ], 'Without friction the speed depends only on the height.', undefined, 'pw27-lab'),
    },
    {
      id: 'pw28-pendulum', title: 'The pendulum and the roller coaster', phase: 'apply',
      paragraphs: [
        'Activity 7.2: pull a pendulum bob aside to the level of a horizontal line and release it. At the extreme points the bob has only potential energy (K = 0). At the lowest point it has only kinetic energy (U = 0 if the lowest point is the zero level). It swings up to almost the same height on the other side, so the mechanical energy is almost constant.',
        'But a real pendulum slowly stops, and the later peaks of a ball roller coaster in a science park are lower than the first, because of friction at the support and air resistance. The mechanical energy is transferred to thermal energy.',
      ],
      check: pick('chk-pw28-pendulum', 'A pendulum bob swings back and forth, and each swing is a little lower than the last. What best explains this?', [
        ['Friction at the support and air resistance turn mechanical energy into thermal energy', null],
        ['The bob loses its mass', 'The mass stays the same. The bob\'s mechanical energy is transferred to thermal energy by friction and air resistance.', 'mass_lost'],
        ['Gravity gets weaker', 'Gravity does not change during the swings. Friction and air resistance take away mechanical energy.', 'gravity_weaker'],
      ], 'Dissipation by friction and air resistance.', undefined, 'pw28-pendulum'),
    },
    {
      id: 'pw29-friction', title: 'With friction: the total energy is still conserved', phase: 'reasoning',
      paragraphs: [
        'Friction does negative work, so the mechanical energy K + U decreases. The energy has not disappeared: it appears as thermal (internal) energy Q of the object and the surface, and K + U + Q stays the same. In general the total energy of an isolated system, counting all its forms, remains constant.',
        'In the laboratory below the same block slides down the same ramp, now with friction. Compare K + U with the starting 120 J, and look at the thermal energy.',
      ],
      visual: energyVisual({ setup: en({ massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2 }), editable: true, fraction: 1 }, 'A 3 kg block sliding down a 30 degree ramp with friction, shown at the bottom.'),
      notice: 'Compare K + U at the bottom with 120 J. Where is the difference?',
      misconception: { wrong: 'With friction, energy is destroyed.', right: 'The mechanical energy becomes thermal energy; the total energy, including the thermal energy, is conserved.' },
      check: pick('chk-pw29-friction', 'A box slides down a rough ramp and arrives with less kinetic energy than it would on a smooth ramp. Where did the difference go?', [
        ['Into thermal energy of the box and the ramp', null],
        ['It was destroyed', 'Energy is not destroyed. Friction turns the mechanical energy into thermal energy.', 'energy_destroyed'],
        ['Into more potential energy', 'The box is lower, not higher, so it has less potential energy than at the top. The difference is thermal energy.', 'goes_to_U'],
      ], 'Thermal energy: K + U + Q is constant.', undefined, 'pw29-friction'),
    },
    {
      id: 'pw30-solve', title: 'Using conservation to solve problems', phase: 'apply',
      paragraphs: [
        'Conservation of energy can give the final speed or position without following all the details of the motion. Write down the total energy at the start, the total energy at the end, and equate them (adding the energy lost to friction if there is any).',
        'Example: a 0.5 kg ball is thrown straight up at 10 m/s. At the top its speed is 0, so ½ × 0.5 × 10² = 25 J of kinetic energy has become potential energy: 0.5 × 10 × h = 25, so h = 5 m (without air resistance).',
        'A resisting force can be included in the same way. An escape ramp, a ramp filled with sand or gravel that stops a truck whose brakes have failed, is an example: the truck\'s kinetic energy is used up in two ways, in gaining potential energy (it rises as it climbs) and in work against the force of the sand. For a vehicle of mass m moving at speed v up a ramp that rises 1 m for every 2 m travelled, with a resisting force F: ½ m v² = m g (d ÷ 2) + F d, which gives the distance d the vehicle travels before it stops.',
      ],
      check: pick('chk-pw30-solve', 'A ball is thrown up at 10 m/s with no air resistance. Which equation gives the maximum height h?', [
        ['½ m v² = m g h', null],
        ['m v = m g h', 'The kinetic energy is ½ m v², not m v. Equate the energies: ½ m v² = m g h.', 'momentum_for_energy'],
        ['½ m v² = ½ m g h²', 'The potential energy is m g h, with the height not squared.', 'squared_height'],
      ], 'Initial K = final U at the top.', undefined, 'pw30-solve'),
    },
  ],
  investigation: elab('D', 'Check that K + U is constant on a smooth ramp and that only the height decides the speed.'),
  worked: {
    id: 'w-pw-l7', title: 'A block on a smooth ramp, then with friction',
    given: ['A 3 kg block is released from rest at the top of a ramp 4 m high.', 'First the ramp is smooth. Then friction removes 30 J as thermal energy.', 'Take g = 10 m/s².'], ask: 'What is the speed at the bottom in each case?',
    visual: energyVisual({ setup: en({ massKg: 3, startHeight: 4, angleDeg: 30 }), fraction: 1 }, 'A 3 kg block on a smooth 30 degree ramp, 4 m high, shown at the bottom.'),
    steps: [
      { text: 'At the top: U = m g h = 3 × 10 × 4 = 120 J and K = 0, so the mechanical energy is 120 J.', why: 'The block starts from rest at the zero level of height h = 4 m above the bottom.' },
      { text: 'Smooth ramp: no energy is lost, so at the bottom K = 120 J and U = 0.', why: 'Conservation of mechanical energy.' },
      { text: '½ × 3 × v² = 120, so v² = 80 and v = √80 ≈ 8.9 m/s.', why: 'Solve K = ½mv² for v.' },
      { text: 'With friction: K + 30 J (thermal energy) = 120 J, so K = 90 J, v² = 2 × 90 ÷ 3 = 60 and v = √60 ≈ 7.7 m/s.', why: 'The energy that becomes thermal energy is not available as kinetic energy; the total is still 120 J.' },
    ],
    verify: 'Check the total: 90 J kinetic + 30 J thermal = 120 J. The smooth ramp gives the larger speed, as it should.',
  },
  guided: {
    id: 'g-pw-l7', prompt: 'A 0.5 kg ball is dropped from a height of 20 m (g = 10 m/s², no air resistance, ground as zero).',
    steps: [
      { id: 'g1', prompt: 'Energy at the top.', question: numQ('pw-g7-1', 'What is the mechanical energy of the ball at the top, in joules?', 100, 'U = m g h = 0.5 × 10 × 20 = 100 J, and K = 0.', { unit: 'J', refresherId: 'pw26-free', rules: [[[10], 'You left out the height or g. U = m g h = 0.5 × 10 × 20.', 'g_missing']] }), hints: ['K = 0 at the top.'] },
      { id: 'g2', prompt: 'The speed at the ground.', question: numQ('pw-g7-2', 'What is its speed just before it hits the ground, in m/s?', 20, 'All 100 J becomes kinetic: ½ × 0.5 × v² = 100, so v² = 400 and v = 20 m/s.', { unit: 'm/s', refresherId: 'pw27-lab', rules: [[[400], 'That is v². The speed is the square root: 20 m/s.', 'forgot_root'], [[200], 'You divided by 0.5 only. K = ½ m v² = 100 gives v² = 400.', 'algebra']] }), hints: ['½ m v² = 100.'] },
      { id: 'g3', prompt: 'Half way.', question: numQ('pw-g7-3', 'When it has fallen 15 m (it is 5 m above the ground), what is its kinetic energy, in joules?', 75, 'U = 0.5 × 10 × 5 = 25 J, so K = 100 − 25 = 75 J.', { unit: 'J', refresherId: 'pw26-free', rules: [[[25], 'That is the potential energy at 5 m. The kinetic energy is the rest of the 100 J.', 'U_for_K'], [[100], 'That is the total. Subtract the 25 J of potential energy that remains.', 'total_for_K']] }), hints: ['K = total − U.'] },
    ],
    conclusion: 'The 100 J of potential energy turns into kinetic energy: 75 J after 15 m and 100 J at the ground, where v = 20 m/s.',
  },
  independent: [
    ind('i1', 'When is it conserved?', 'conserve', 'The condition.', pick('pw-l7-i1', 'When is the mechanical energy K + U of an object conserved?', [
      ['When no other external force, such as friction, does work on it', null],
      ['Always, whatever the forces', 'Friction and air resistance reduce the mechanical energy, so it is not always conserved.', 'always_conserved'],
      ['Only when the object is at rest', 'The statement concerns a moving object under gravity: K + U is constant while only gravity does work.', 'rest_only'],
    ], 'Only gravity (no friction) does work.', undefined, 'pw26-free'), ['What force removes mechanical energy?'], ['When there is no friction or other external force.']),
    ind('i2', 'When is it conserved?', 'conserve', 'The top of the throw.', pick('pw-l7-i2', 'A ball thrown straight up reaches its highest point (no air resistance). At that point, compared with the throw:', [
      ['K is zero and U is greatest; K + U is unchanged', null],
      ['K is greatest and U is zero', 'That is the situation at the start (at the zero level). At the top the ball has momentarily stopped.', 'swapped'],
      ['K and U are both zero', 'The ball is at its highest point, so U is greatest, not zero.', 'both_zero'],
    ], 'At the top all the energy is potential.', undefined, 'pw26-free'), ['What is the speed at the highest point?'], ['K = 0 and U is greatest.']),
    ind('i3', 'Converting energy', 'convert', 'A fall of 45 m.', numQ('pw-l7-i3', 'A stone is dropped from a height of 45 m. What is its speed just before it hits the ground, in m/s? (g = 10 m/s², no air resistance)', 30, 'v = √(2gh) = √(2 × 10 × 45) = √900 = 30 m/s.', { unit: 'm/s', refresherId: 'pw27-lab', rules: [[[900], 'That is v². Take the square root.', 'forgot_root'], [[450], 'You did not take the square root and left out the 2: v² = 2gh = 900.', 'algebra']] }), ['½ m v² = m g h, so v² = 2 g h.'], ['v = 30 m/s.']),
    ind('i4', 'Converting energy', 'convert', 'Two masses.', pick('pw-l7-i4', 'Balls of 1 kg and 3 kg are dropped from the same height (no air resistance). At the ground:', [
      ['They have the same speed, but the 3 kg ball has more kinetic energy', null],
      ['The 3 kg ball has the greater speed', 'The mass cancels in v = √(2gh), so the speeds are equal.', 'heavier_faster'],
      ['They have the same kinetic energy', 'K = mgh is proportional to the mass, so the heavier ball has more.', 'K_equal'],
    ], 'v is the same; K is proportional to m.', undefined, 'pw27-lab'), ['Compare ½ m v² = m g h for each mass.'], ['Same speed; the heavier ball has more K.']),
    ind('i5', 'Friction', 'friction', 'The pendulum.', pick('pw-l7-i5', 'A pendulum finally stops. What has happened to its mechanical energy?', [
      ['It has become thermal energy (friction at the support and air resistance)', null],
      ['It has disappeared', 'Energy is not destroyed; the mechanical energy is transferred to thermal energy.', 'energy_destroyed'],
      ['It has become potential energy', 'At rest at the lowest point the bob has the least potential energy. The mechanical energy has become thermal energy.', 'goes_to_U'],
    ], 'Mechanical energy becomes thermal energy.', undefined, 'pw29-friction'), ['What do friction and air resistance do?'], ['It became thermal energy.']),
    ind('i6', 'Friction', 'friction', 'A rough slide.', numQ('pw-l7-i6', 'A ball has 100 J of potential energy at the top of a rough ramp. By the bottom, 30 J has become thermal energy. What is its kinetic energy at the bottom, in joules?', 70, 'K + Q = 100 J, so K = 100 − 30 = 70 J.', { unit: 'J', refresherId: 'pw29-friction', rules: [[[100], 'You ignored the thermal energy. K + U + Q = 100 J with U = 0 at the bottom.', 'friction_ignored'], [[130], 'The thermal energy is part of the 100 J, not an addition to it.', 'added']] }), ['K + Q = the starting energy.'], ['70 J.']),
    ind('i7', 'Solving', 'apply', 'A slide.', numQ('pw-l7-i7', 'A child slides from rest down a smooth slide 1.8 m high. What is the speed at the bottom, in m/s? (g = 10 m/s²)', 6, 'v = √(2gh) = √(2 × 10 × 1.8) = √36 = 6 m/s.', { unit: 'm/s', refresherId: 'pw30-solve', rules: [[[36], 'That is v². Take the square root.', 'forgot_root'], [[18], 'You used v = gh. The speed is v = √(2gh).', 'formula_misused']] }), ['½ v² = g h.'], ['6 m/s.']),
    ind('i8', 'Solving', 'apply', 'A thrown ball.', numQ('pw-l7-i8', 'A ball is thrown straight up at 10 m/s. How high does it rise, in metres? (g = 10 m/s², no air resistance)', 5, '½ m v² = m g h gives h = v² ÷ (2g) = 100 ÷ 20 = 5 m.', { unit: 'm', refresherId: 'pw30-solve', rules: [[[10], 'That is the speed. The height is h = v² ÷ (2g).', 'speed_for_height'], [[50], 'You divided v² by g only; h = v² ÷ (2g) = 100 ÷ 20.', 'algebra']] }), ['Initial K equals the potential energy at the top.'], ['h = 5 m.']),
    ind('i9', 'Solving', 'apply', 'A resisting ramp.', numQ('pw-l7-i9', 'A 100 kg trolley moves up a ramp at 10 m/s. The ramp rises 1 m for every 2 m along it, and a resisting force of 150 N opposes the motion. How far along the ramp does it travel before it stops, in metres? (g = 10 m/s²)', 7.69, '½ × 100 × 10² = 5000 J = m g (d ÷ 2) + 150 d = (500 + 150) d, so d = 5000 ÷ 650 ≈ 7.69 m.', { unit: 'm', refresherId: 'pw30-solve', rules: [[[10], 'You ignored the resisting force: 5000 = 500 d gives 10 m. Include the work against the 150 N force too: (500 + 150) d = 5000.', 'friction_ignored'], [[33.33], 'You used the resisting force only: 5000 ÷ 150. The potential energy gained also takes energy: (500 + 150) d = 5000.', 'gravity_ignored']] }), ['Initial K = potential energy gained + work against the resisting force.'], ['d = 5000 ÷ 650 ≈ 7.69 m.']),
  ],
  reflection: {
    discover: 'The mechanical energy K + U of an object stays constant while only gravity does work: the potential energy lost becomes kinetic energy. This gives the speed after a drop, v = √(2gh), independent of the mass and the shape of the path. With friction or air resistance the mechanical energy decreases and thermal energy appears; the total energy, counting every form, is conserved.',
    evidence: 'You followed the derivation, used conservation of energy to find speeds and a height, and accounted for energy lost to friction.',
    stillConfusing: [{ text: 'Why is K + U constant?', refresherId: 'pw26-free' }, { text: 'Why does the mass not matter?', refresherId: 'pw27-lab' }, { text: 'Why do pendulums stop?', refresherId: 'pw28-pendulum' }, { text: 'Where does the energy go with friction?', refresherId: 'pw29-friction' }, { text: 'How do I solve a problem with energy?', refresherId: 'pw30-solve' }],
  },
};
