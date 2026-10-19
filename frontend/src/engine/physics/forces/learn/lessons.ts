/**
 * Class 9 Physics, Chapter 6 "How Forces Affect Motion": the first Learn lessons (PHY-2A), Sections 6.1 to 6.3.
 * Lesson 1: the concept of force. Lesson 2: balanced and unbalanced forces. Lesson 3: friction.
 * Wording, figures and numbers are original. Every cart figure is drawn from the Force Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_SETUP, type Setup } from '../forceModel';
import { arrowsVisual, cartVisual, ind, numQ, pick, type ForceArrowSpec } from './questions';

const LAB = '/physics/forces/lab';
const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Force Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Force Laboratory' });
const setup = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const arrows = (object: string, forces: ForceArrowSpec[], intro: string, showNet = false) => arrowsVisual({ object, forces, showNet }, intro);
const R = (label: string, magnitude: number, by: string): ForceArrowSpec => ({ label, by, magnitude, direction: 'right' });
const L = (label: string, magnitude: number, by: string): ForceArrowSpec => ({ label, by, magnitude, direction: 'left' });

// ---------------------------------------------------------------------------
// Lesson 1: What is a force?  (Sections 6.1 and 6.1.1)
// ---------------------------------------------------------------------------

export const F1: EduLesson = {
  id: 'pf-l1', unitId: 'pf-unit-1', number: 1, title: 'What is a force?',
  objective: 'say what a force is, describe it completely by its magnitude, unit and direction, and name its effects and how it is measured.',
  prerequisiteIds: ['pfp-direction', 'pfp-arrows', 'pfp-mass'],
  objectives: [
    { id: 'effects', label: 'Name the effects a force can have' },
    { id: 'vector', label: 'Describe a force by its size, unit and direction' },
    { id: 'measure', label: 'Say how a force is measured and what weight is' },
  ],
  steps: [
    {
      id: 'f1-effects', title: 'Pushes and pulls', phase: 'observe',
      paragraphs: [
        'A force is a push or a pull. When you kick a ball at rest it starts to move. When a bat hits a moving ball it changes the ball\'s direction. When you squeeze a lemon its shape changes. In each case a force acts on an object.',
        'So a force can make an object start moving, stop it, change its speed, change its direction of motion, or change its shape.',
      ],
      vocabulary: [{ term: 'force', meaning: 'a push or a pull acting on an object' }],
      check: pick('chk-f1-effects', 'A cricketer hits a moving ball and it flies off in a new direction. What effect has the force had?', [
        ['It changed the direction of the ball\'s motion', null],
        ['It only changed the shape of the ball', 'The ball may be slightly squashed for a moment, but the clear effect here is the new direction of its motion.', 'only_shape'],
        ['It had no effect, because the ball was already moving', 'A force can change the motion of a moving object, for example its direction.', 'force_only_starts_motion'],
      ], 'Forces can change the direction of motion.', undefined, 'f1-effects'),
    },
    {
      id: 'f2-vector', title: 'A force has a size and a direction', phase: 'observe',
      paragraphs: [
        'To describe a force completely you must say how strong it is and in which direction it acts. The strength is its magnitude. The SI unit of force is the newton, with the symbol N (the unit name is written with a small n).',
        'In a force diagram a force is an arrow. The arrow points the way the force acts, a longer arrow means a larger force, and the label gives the size. If either the size or the direction changes, the effect of the force changes.',
      ],
      vocabulary: [{ term: 'newton (N)', meaning: 'the SI unit of force' }, { term: 'magnitude', meaning: 'the size (strength) of a force' }],
      visual: arrows('box', [R('Push', 5, 'your hand')], 'A box with a 5 N push towards the right.'),
      notice: 'Say what the arrow tells you about the force: its direction and its size.',
      misconception: { wrong: 'A force only needs a number: how strong it is.', right: 'A force needs a magnitude with a unit and a direction. 5 N to the right and 5 N to the left are different forces.' },
      check: pick('chk-f2-vector', 'One student pushes a box with 5 N to the right and another pushes it with 5 N to the left. Are these the same force?', [
        ['No: they have the same magnitude but different directions', null],
        ['Yes: both are 5 N', 'The size is the same, but a force also has a direction, and the directions are opposite. Their effects are opposite.', 'direction_ignored'],
      ], 'Magnitude and direction both matter.', undefined, 'f2-vector'),
    },
    {
      id: 'f3-measure', title: 'Measuring a force', phase: 'observe',
      paragraphs: [
        'A spring balance measures the magnitude of a force: the harder you pull its hook, the more the spring stretches and the larger the reading in newtons. It can measure weight, because the weight of an object is the gravitational force with which the Earth pulls it.',
        'Some forces act by touching (a push by hand, friction) and some act without touching (gravity, the force between magnets). The smallest forces we can feel directly are about a thousandth of a newton, like a light touch.',
      ],
      vocabulary: [{ term: 'weight', meaning: 'the gravitational force of the Earth on an object, measured in newtons' }],
      check: pick('chk-f3-measure', 'The weight of an object is:', [
        ['the gravitational force with which the Earth pulls it, measured in newtons', null],
        ['the amount of matter in it, measured in kilograms', 'That is its mass. Weight is a force, and forces are measured in newtons.', 'weight_is_mass'],
        ['the force it exerts on the ground only when it moves', 'Weight is the Earth\'s pull on the object, whether it moves or not.', 'weight_needs_motion'],
      ], 'Weight is the gravitational force: a force in N.', undefined, 'f3-measure'),
    },
  ],
  investigation: lab('B', 'See a force arrow change when you change the size and direction of a push on the cart.'),
  worked: {
    id: 'w-pf-l1', title: 'Describing two forces completely',
    given: ['A student pushes a crate with a force of 20 N towards the right.', 'A friend pulls the same crate with a force of 15 N towards the left.'], ask: 'Describe each force completely.',
    visual: arrows('crate', [R('Push', 20, 'the student'), L('Pull', 15, 'the friend')], 'A crate with a 20 N push to the right and a 15 N pull to the left.'),
    steps: [
      { text: 'The student\'s force: magnitude 20 N, direction to the right, acting on the crate.', why: 'A force is described by its magnitude (with a unit), its direction and the object it acts on.' },
      { text: 'The friend\'s force: magnitude 15 N, direction to the left, acting on the crate.', why: 'It has a smaller magnitude and the opposite direction.' },
      { text: 'In the diagram the first arrow is longer than the second and the arrows point in opposite directions.', why: 'Arrow length stands for magnitude and the arrow points the way the force acts.' },
      { text: 'If the friend pulled to the right instead, the magnitude would be the same but the direction would change, so the effect on the crate would change.', why: 'Changing the direction of a force changes its effect even if the magnitude is the same.' },
    ],
    verify: 'Both forces needed a number with the unit N and a direction; neither description was complete without both.',
  },
  guided: {
    id: 'g-pf-l1', prompt: 'A force arrow on a box points to the left and is labelled 12 N.',
    visual: arrows('box', [L('Pull', 12, 'a rope')], 'A box with a 12 N pull towards the left.'),
    steps: [
      { id: 'g1', prompt: 'The magnitude.', question: numQ('g-pf-l1-1', 'What is the magnitude of the force, in newtons?', 12, 'The label gives the size: 12 N.', { unit: 'N', refresherId: 'f2-vector', rules: [[[-12], 'The magnitude is the size, which is never negative. The direction is shown by the arrow.', 'magnitude_negative']] }), hints: ['Read the label on the arrow.'] },
      { id: 'g2', prompt: 'The direction.', question: pick('g-pf-l1-2', 'In which direction does the force act?', [
        ['To the left', null],
        ['To the right', 'The arrow points to the left, so the force acts to the left.', 'direction_ignored'],
      ], 'The arrow points the way the force acts.', undefined, 'f2-vector'), hints: ['Look at where the arrowhead is.'] },
      { id: 'g3', prompt: 'A change.', question: pick('g-pf-l1-3', 'The rope now pulls with 12 N to the right instead. What has changed?', [
        ['The direction of the force (its magnitude is the same)', null],
        ['The magnitude of the force', 'The size is still 12 N; only the direction has reversed.', 'direction_ignored'],
      ], 'A reversed direction with the same magnitude is a different force.', undefined, 'f2-vector'), hints: ['Compare the number and the arrow.'] },
    ],
    conclusion: 'The force is 12 N to the left: a magnitude with a unit and a direction.',
  },
  independent: [
    ind('i1', 'Effects', 'effects', 'Kicking a ball.', pick('pf-l1-i1', 'A footballer kicks a ball that is lying still and it rolls away. What effect has the force had?', [
      ['It made the ball start to move', null],
      ['It made the ball stop', 'The ball was at rest and began to move, so the force started its motion.', 'wrong_effect'],
    ], 'A force can start motion.', undefined, 'f1-effects'), ['Was the ball moving before the kick?'], ['It started the motion.']),
    ind('i2', 'Effects', 'effects', 'A squeezed sponge.', pick('pf-l1-i2', 'You squeeze a sponge and its shape changes. Which statement is correct?', [
      ['The force you applied changed the shape of the sponge', null],
      ['Forces cannot change the shape of an object', 'A force can change the shape of an object, as in squeezing a lemon.', 'force_only_moves'],
    ], 'Forces can change shape.', undefined, 'f1-effects'), ['What did your hand do to the sponge?'], ['Changed its shape.']),
    ind('i3', 'Size and direction', 'vector', 'Reading a force.', numQ('pf-l1-i3', 'A force arrow on a trolley points to the right and is labelled 30 N. What is the magnitude of the force, in newtons?', 30, 'The magnitude is the size, 30 N, with the direction to the right.', { unit: 'N', refresherId: 'f2-vector', rules: [[[-30], 'A magnitude cannot be negative.', 'magnitude_negative']], visual: arrows('trolley', [R('Push', 30, 'a person')], 'A trolley with a 30 N push to the right.') }), ['Read the label.'], ['30 N.']),
    ind('i4', 'Size and direction', 'vector', 'Same magnitude.', pick('pf-l1-i4', 'Two forces each have a magnitude of 8 N. One acts to the right and one to the left. What can you say?', [
      ['They are different forces with opposite directions', null],
      ['They are the same force', 'The magnitudes are equal but the directions are opposite, so they are different forces.', 'direction_ignored'],
      ['They cancel on a single object only if they act on different objects', 'Whether two forces cancel depends on whether they act on the same object. Here we are asked only to compare the two forces.', 'off_topic'],
    ], 'Same magnitude and opposite directions.', undefined, 'f2-vector'), ['What do you need to say about a force besides its size?'], ['Opposite directions.']),
    ind('i5', 'Measuring', 'measure', 'The unit.', pick('pf-l1-i5', 'Which is the SI unit of force?', [
      ['newton (N)', null],
      ['kilogram (kg)', 'The kilogram is the unit of mass.', 'mass_in_newtons'],
      ['metre per second (m/s)', 'That is the unit of velocity.', 'velocity_unit'],
    ], 'The SI unit of force is the newton.', undefined, 'f3-measure'), ['Which unit is named after Newton?'], ['newton.']),
    ind('i6', 'Measuring', 'measure', 'Spring balance.', pick('pf-l1-i6', 'You hang an object from a spring balance and the reading is 4 N. What does the reading tell you?', [
      ['The weight of the object: the Earth\'s pull on it is 4 N', null],
      ['The mass of the object is 4 kg', 'The balance measures a force in newtons. The reading is the weight, not the mass in kilograms.', 'weight_is_mass'],
    ], 'A spring balance reads a force.', undefined, 'f3-measure'), ['Is a newton a unit of mass or of force?'], ['The weight.']),
  ],
  reflection: {
    discover: 'A force is a push or a pull. It can start or stop motion, change speed or direction, or change shape. A force is described by its magnitude (in newtons) and its direction, shown by an arrow, and it can be measured with a spring balance. Weight is the gravitational force on an object.',
    evidence: 'You named effects of forces, read a force arrow and compared forces with the same size but different directions.',
    stillConfusing: [{ text: 'What can a force do?', refresherId: 'f1-effects' }, { text: 'What do I need to describe a force?', refresherId: 'f2-vector' }, { text: 'How is a force measured?', refresherId: 'f3-measure' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: Balanced and unbalanced forces  (Section 6.2)
// ---------------------------------------------------------------------------

export const F2: EduLesson = {
  id: 'pf-l2', unitId: 'pf-unit-1', number: 2, title: 'Balanced and unbalanced forces',
  objective: 'find the net force of forces on a line, explain why balanced forces do not change velocity (even for a moving object) and why an unbalanced force gives an acceleration in its own direction.',
  prerequisiteIds: ['pfp-direction', 'pfp-arrows', 'pfp-motion'],
  objectives: [
    { id: 'net', label: 'Find the net force of forces on a line' },
    { id: 'balanced', label: 'Explain what balanced forces do (and do not do)' },
    { id: 'accel', label: 'Link an unbalanced force to the direction of acceleration' },
    { id: 'diagram', label: 'Read a force diagram correctly' },
  ],
  steps: [
    {
      id: 'f4-net', title: 'Adding forces on a line', phase: 'reasoning',
      paragraphs: [
        'Usually more than one force acts on an object. Their combined effect is the net force. To find it, give right a plus sign and left a minus sign, then add: 10 N to the right and 6 N to the left make (+10) + (−6) = +4 N, which is 4 N to the right.',
        'So forces in the same direction add (5 N + 3 N to the right = 8 N to the right), and forces in opposite directions subtract: the net force has the size of the difference and the direction of the larger force. Equal opposite forces give (+10) + (−10) = 0.',
      ],
      vocabulary: [{ term: 'net force', meaning: 'the sum of all the forces on an object, with directions' }],
      visual: arrows('block', [R('Force 1', 10, 'person 1'), L('Force 2', 6, 'person 2')], 'A block with 10 N to the right and 6 N to the left; the net force is 4 N to the right.', true),
      notice: 'Switch the net force arrow on and compare its length and direction with the two forces.',
      check: pick('chk-f4-net', 'Forces of 12 N to the right and 5 N to the left act on a block. What is the net force?', [
        ['7 N to the right', null],
        ['17 N to the right', 'You added the sizes. The forces are in opposite directions, so they subtract.', 'added_opposites'],
        ['7 N to the left', 'The net force is in the direction of the larger force, which is to the right.', 'wrong_direction'],
      ], '(+12) + (−5) = +7 N.', undefined, 'f4-net'),
    },
    {
      id: 'f5-balanced', title: 'Balanced forces do not change velocity', phase: 'conjecture',
      paragraphs: [
        'When the net force is zero the forces are balanced. In a tug of war with equal pulls the rope does not move. Balanced forces cannot start a resting object moving. Just as important, balanced forces cannot slow a moving object either: its velocity stays the same.',
        'Zero net force does not mean zero velocity. A cart gliding at 3 m/s with balanced forces keeps moving at 3 m/s. It is only the change of velocity that needs an unbalanced force.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, forceA: 10, forceB: 10, dirB: 'left', startVelocity: 3 }), editable: true, showNet: true }, 'A 2 kg cart moving at 3 m/s with 10 N pushes on both sides.'),
      notice: 'Play the cart. What happens to its velocity and where is the net force arrow?',
      misconception: { wrong: 'If the net force is zero, the object must be at rest.', right: 'Zero net force means zero acceleration: the velocity does not change. The object can be at rest or moving at a constant velocity.' },
      check: pick('chk-f5-balanced', 'A cart is moving at 3 m/s and the forces on it are balanced. What will its velocity be a few seconds later?', [
        ['Still 3 m/s', null],
        ['Zero, because the forces are balanced', 'Balanced forces mean no change of velocity. The cart keeps moving at 3 m/s; they do not bring it to rest.', 'balanced_means_rest'],
        ['Greater than 3 m/s', 'Nothing speeds it up: the net force is zero.', 'balanced_accelerates'],
      ], 'Zero net force: no change in velocity.', undefined, 'f5-balanced'),
    },
    {
      id: 'f6-unbalanced', title: 'Unbalanced forces and acceleration', phase: 'reasoning',
      paragraphs: [
        'If one force is bigger than the other the net force is not zero and the forces are unbalanced. A change of velocity is an acceleration, and an unbalanced net force makes the velocity change: the object accelerates, and the acceleration points the same way as the net force.',
        'For the cart in the figure the net force is 4 N to the right, so the cart accelerates to the right: speeding up if it was moving right, slowing down if it was moving left. A net force in the direction of motion increases the speed; against the motion it decreases the speed.',
        'The size of the acceleration also depends on the mass of the cart. You can see the pattern in the laboratory (the same force gives a smaller acceleration to a heavier cart); the exact rule is for a later lesson. What you observe here is a pattern of this model, not a proof.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, forceA: 10, forceB: 6, dirB: 'left' }), editable: true, showNet: true }, 'A 2 kg cart with 10 N to the right and 6 N to the left.'),
      notice: 'Which way does the net force arrow point, and which way does the velocity change?',
      check: pick('chk-f6-unbalanced', 'A cart at rest has 5 N to the right and 9 N to the left acting on it. In which direction does it accelerate?', [
        ['To the left, the direction of the net force (4 N)', null],
        ['To the right, because the 5 N force is to the right', 'The net force points the way of the larger force, which is to the left, and the acceleration points the same way.', 'wrong_direction'],
        ['It does not accelerate', 'The forces are not equal, so the net force is not zero.', 'balanced_assumed'],
      ], 'The acceleration is in the direction of the net force.', undefined, 'f6-unbalanced'),
    },
    {
      id: 'f7-diagram', title: 'Reading a force diagram', phase: 'apply',
      paragraphs: [
        'In a force diagram all arrows act on ONE object. Weight (down) and the normal force from the surface (up) act on a cart on a horizontal track, and they balance each other. Only the horizontal forces decide whether the cart accelerates along the track.',
        'Be careful not to combine forces that act on different objects. If you push a wall, the wall pushes back on you, but those two forces act on two different objects. They cannot cancel each other on the same object.',
      ],
      visual: arrows('cart', [R('Push', 8, 'a hand'), L('Friction', 8, 'the surface'), { label: 'Normal force', by: 'the surface', magnitude: 20, direction: 'up' }, { label: 'Weight', by: 'the Earth', magnitude: 20, direction: 'down' }], 'A cart with a push, friction, weight and the normal force.', true),
      notice: 'Which forces are vertical and which are horizontal? What is the net force along the track?',
      check: pick('chk-f7-diagram', 'In the figure the weight and the normal force on the cart are each 20 N. What can you say about them?', [
        ['They act on the cart in opposite vertical directions and balance each other', null],
        ['They change the cart\'s horizontal velocity', 'They are vertical forces, so they do not affect the motion along the horizontal track; they balance each other.', 'vertical_affects_horizontal'],
        ['They are the same force', 'Weight is the pull of the Earth on the cart; the normal force is the push of the surface. They are different forces that happen to balance.', 'same_force'],
      ], 'Vertical forces balance; the horizontal forces decide the motion along the track.', undefined, 'f7-diagram'),
    },
  ],
  investigation: lab('A', 'Predict, then test balanced and unbalanced forces on the cart.'),
  worked: {
    id: 'w-pf-l2', title: 'Three forces on a block',
    given: ['Three forces act along a straight line on a block on a smooth table: 15 N to the right, 4 N to the right and 9 N to the left.'], ask: 'Find the net force. Will the block\'s velocity change?',
    visual: arrows('block', [R('Force 1', 15, 'person 1'), R('Force 2', 4, 'person 2'), L('Force 3', 9, 'person 3')], 'A block with 15 N and 4 N to the right and 9 N to the left.', true),
    steps: [
      { text: 'Take right as positive: the forces are +15 N, +4 N and −9 N.', why: 'Signs show direction, so the forces can be added as signed numbers.' },
      { text: 'Net force = (+15) + (+4) + (−9) = +10 N.', why: 'The net force is the sum of the forces, each with its sign.' },
      { text: 'The net force is 10 N to the right.', why: 'A positive sign means towards the right.' },
      { text: 'The forces are unbalanced, so the velocity of the block changes: it accelerates to the right.', why: 'A non-zero net force produces an acceleration in its own direction.' },
    ],
    verify: 'Check by grouping: forces to the right total 15 + 4 = 19 N, forces to the left total 9 N, and 19 − 9 = 10 N to the right.',
  },
  guided: {
    id: 'g-pf-l2', prompt: 'In a tug of war team A pulls the rope with 300 N to the right and team B pulls with 340 N to the left.',
    visual: arrows('rope', [R('Team A', 300, 'team A'), L('Team B', 340, 'team B')], 'A rope with 300 N to the right and 340 N to the left.', true),
    steps: [
      { id: 'g1', prompt: 'The net force.', question: numQ('g-pf-l2-1', 'Take right as positive. What is the net force on the rope, in newtons (a minus sign for left)?', -40, '(+300) + (−340) = −40 N, which is 40 N to the left.', { unit: 'N', refresherId: 'f4-net', rules: [[[40], 'The larger pull is to the left, so the net force is to the left: it is negative.', 'sign_dropped'], [[640], 'You added the sizes. The pulls are in opposite directions, so they subtract.', 'added_opposites']] }), hints: ['(+300) + (−340).'] },
      { id: 'g2', prompt: 'The direction.', question: pick('g-pf-l2-2', 'Which way does the rope accelerate?', [
        ['To the left, towards team B', null],
        ['To the right, towards team A', 'The net force (40 N) is to the left, so the rope accelerates to the left.', 'wrong_direction'],
        ['It does not accelerate', 'The net force is not zero, so the rope accelerates.', 'balanced_assumed'],
      ], 'Acceleration is in the direction of the net force.', undefined, 'f6-unbalanced'), hints: ['Look at the sign of the net force.'] },
      { id: 'g3', prompt: 'Balance the forces.', question: numQ('g-pf-l2-3', 'Team A now pulls harder. What magnitude of pull, in newtons, would make the forces balanced?', 340, 'For zero net force A must pull with 340 N, equal to B\'s pull.', { unit: 'N', refresherId: 'f5-balanced', rules: [[[40], '40 N is the extra pull needed, not the total. A must pull 300 + 40 = 340 N.', 'difference_for_total']] }), hints: ['The forces balance when they are equal and opposite.'] },
    ],
    conclusion: 'The net force is 40 N to the left, so the rope accelerates to the left; balanced forces would need equal pulls.',
  },
  independent: [
    ind('i1', 'Net force', 'net', 'Same direction.', numQ('pf-l2-i1', 'Two people push a car in the same direction, one with 250 N and one with 180 N. What is the size of the net force, in newtons?', 430, '250 + 180 = 430 N in the direction of the pushes.', { unit: 'N', refresherId: 'f4-net', rules: [[[70], 'Forces in the same direction add; they do not subtract.', 'subtracted_same']] }), ['Same direction: add.'], ['430 N.']),
    ind('i2', 'Net force', 'net', 'Opposite directions.', numQ('pf-l2-i2', 'Right is positive. A block has 14 N to the right and 9 N to the left on it. What is the net force, in newtons?', 5, '(+14) + (−9) = +5 N.', { unit: 'N', refresherId: 'f4-net', rules: [[[23], 'You added the sizes. The forces are in opposite directions.', 'added_opposites'], [[-5], 'The larger force is to the right, so the net force is positive.', 'wrong_direction']] }), ['(+14) + (−9).'], ['+5 N.']),
    ind('i3', 'Balanced forces', 'balanced', 'Moving cart.', pick('pf-l2-i3', 'A trolley is moving steadily at 2 m/s and the net force on it is zero. What will its velocity be later?', [
      ['2 m/s, unchanged', null],
      ['Zero', 'Zero net force does not stop a moving object: its velocity stays the same.', 'balanced_means_rest'],
    ], 'Balanced forces: no change of velocity.', undefined, 'f5-balanced'), ['Does zero net force change the velocity?'], ['2 m/s.']),
    ind('i4', 'Balanced forces', 'balanced', 'At rest.', pick('pf-l2-i4', 'A book lies still on a table. What can you say about the forces on it?', [
      ['They are balanced: the net force is zero', null],
      ['There are no forces on it', 'The Earth pulls it down (weight) and the table pushes it up (the normal force); these balance.', 'no_force_at_rest'],
    ], 'At rest: weight and the normal force balance.', undefined, 'f5-balanced'), ['What is acting on the book?'], ['Balanced.']),
    ind('i5', 'Acceleration', 'accel', 'Direction.', pick('pf-l2-i5', 'A cart has 20 N to the right and 12 N to the left acting on it. Its acceleration points:', [
      ['to the right', null],
      ['to the left', 'The net force (8 N) points the way of the larger force, to the right, and the acceleration points the same way.', 'wrong_direction'],
    ], 'Acceleration is in the direction of the net force.', undefined, 'f6-unbalanced'), ['Find the net force first.'], ['To the right.']),
    ind('i6', 'Acceleration', 'accel', 'Slowing down.', pick('pf-l2-i6', 'A cart is moving to the right and the net force on it points to the left. What happens to its speed?', [
      ['It decreases', null],
      ['It increases', 'A net force against the motion reduces the speed.', 'wrong_effect'],
      ['It stays the same', 'The net force is not zero, so the velocity changes.', 'balanced_assumed'],
    ], 'Net force against the motion: the speed falls.', undefined, 'f6-unbalanced'), ['Which way does the acceleration point compared with the motion?'], ['Decreases.']),
    ind('i7', 'Force diagrams', 'diagram', 'Weight and normal force.', pick('pf-l2-i7', 'A cart on a horizontal track has a weight of 30 N and a normal force of 30 N. What is the net vertical force?', [
      ['Zero', null],
      ['60 N', 'They act in opposite directions (down and up), so they subtract, not add.', 'added_opposites'],
    ], 'Down 30 N and up 30 N cancel.', undefined, 'f7-diagram'), ['Do both forces point the same way?'], ['Zero.']),
    ind('i8', 'Force diagrams', 'diagram', 'Different objects.', pick('pf-l2-i8', 'You push a wall with 50 N and the wall pushes you back with 50 N. Why can these two forces not cancel each other?', [
      ['They act on different objects (one on the wall, one on you)', null],
      ['Because they are not equal', 'They are equal; the point is that they act on different objects, so they cannot cancel on either one.', 'equal_assumed_unequal'],
    ], 'Only forces on the same object are added to find its net force.', undefined, 'f7-diagram'), ['On which object does each force act?'], ['Different objects.']),
  ],
  reflection: {
    discover: 'The net force is the sum of the forces on an object, using signs for direction. Balanced forces (net force zero) do not change the velocity, whether the object is at rest or moving. An unbalanced force gives an acceleration in the direction of the net force. A force diagram has all its arrows on one object.',
    evidence: 'You added forces on a line, tested balanced and unbalanced forces on the cart, and read a force diagram.',
    stillConfusing: [{ text: 'How do I add forces?', refresherId: 'f4-net' }, { text: 'What do balanced forces do?', refresherId: 'f5-balanced' }, { text: 'Which way does it accelerate?', refresherId: 'f6-unbalanced' }, { text: 'Which forces go in the diagram?', refresherId: 'f7-diagram' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: Friction  (Section 6.3)
// ---------------------------------------------------------------------------

export const F3: EduLesson = {
  id: 'pf-l3', unitId: 'pf-unit-2', number: 3, title: 'Friction',
  objective: 'explain friction as a contact force whose direction depends on the sliding (or tendency to slide) at the contact, say why moving objects slow down, and explain why a gentle push may not move an object.',
  prerequisiteIds: ['pfp-motion', 'pfp-direction'],
  objectives: [
    { id: 'nature', label: 'Say what friction is and what decides its direction' },
    { id: 'slowing', label: 'Explain slowing down and the effect of the surface' },
    { id: 'static', label: 'Explain why a gentle push may not move an object' },
    { id: 'useful', label: 'Give examples where friction is useful or unwanted' },
  ],
  steps: [
    {
      id: 'f8-contact', title: 'Friction is a contact force at the surface', phase: 'observe',
      paragraphs: [
        'Friction is a force that acts where two surfaces touch. It resists the sliding of one surface over the other. If you push a box along the floor, the force of friction acts on the box, along the floor, opposite to the way the box slides over it.',
        'More exactly, the direction of friction is set by the sliding at the contact, or by the tendency to slide. The textbook\'s usual picture is a sliding box, where friction points against its motion. But think of a box on a truck bed that does not slip while the truck speeds up: the box tends to slide backwards over the bed, so the friction on the box points forwards, the same way the box is moving.',
      ],
      vocabulary: [{ term: 'friction', meaning: 'a contact force between surfaces that resists sliding, or the tendency to slide' }],
      visual: cartVisual({ setup: setup({ massKg: 2, forceA: 12, surfaceId: 'wood', startVelocity: 2 }), t: 1, showNet: true }, 'A 2 kg cart sliding on a wooden table, pushed with 12 N.'),
      notice: 'Which way does the friction arrow point compared with the way the cart slides? What forces are vertical?',
      misconception: { wrong: 'Friction always acts against the overall motion of an object.', right: 'Friction resists sliding (or the tendency to slide) between the two surfaces. For a box carried along on an accelerating truck, friction on the box points the way it is moving.' },
      check: pick('chk-f8-contact', 'A cart slides to the right over a rough floor. In which direction is the friction force on the cart?', [
        ['To the left, against the sliding', null],
        ['To the right, along the sliding', 'Friction on a sliding cart resists the sliding, so it points to the left.', 'friction_with_motion'],
        ['Upwards', 'Friction acts along the surface. Upward forces such as the normal force act at right angles to it.', 'friction_vertical'],
      ], 'Friction on a sliding object points against the sliding.', undefined, 'f8-contact'),
    },
    {
      id: 'f9-surfaces', title: 'Friction slows moving objects; surfaces matter', phase: 'conjecture',
      paragraphs: [
        'After you stop pushing a box it slows down and stops: friction, the only horizontal force on it, acts against its sliding and brings it to rest. Once it has stopped, friction does not push it back; friction can bring a sliding object to rest but cannot start it moving.',
        'The amount of friction depends on the surfaces. On ice the cart slides much farther than on a wooden table; with less friction the velocity falls more slowly. If the friction were zero (an idealised frictionless surface) a moving object would never slow down. No real surface is perfectly frictionless. This is the pattern of the stack-of-coins activity in the textbook (Activity 6.1).',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }), editable: true }, 'A 2 kg cart slides at 6 m/s on a wooden table with no push.'),
      notice: 'Play the cart. Then change the surface to ice and to frictionless, and compare how far it goes.',
      check: pick('chk-f9-surfaces', 'A coin slides farther on a polished floor than on a wooden table. What does this suggest about the friction?', [
        ['The polished floor has less friction', null],
        ['The polished floor has more friction', 'More friction would slow the coin faster and stop it sooner. It went farther, so the friction is smaller.', 'more_friction_farther'],
        ['There is no friction on either surface', 'The coin stops on both surfaces, so friction acts on both.', 'no_friction'],
      ], 'Less friction: slower slowing, a longer slide.', undefined, 'f9-surfaces'),
    },
    {
      id: 'f10-static', title: 'Why a gentle push may not move a box', phase: 'reasoning',
      paragraphs: [
        'Push gently on a heavy box and nothing happens. The box is at rest, so the net force on it is zero: the friction (static friction) must be exactly as big as your push and opposite to it. Push harder and the static friction grows to match, up to a largest value. Once your push is more than that largest friction there is a net force and the box starts to move; this is why you must apply a larger force to start a box moving.',
        'Once the box slides the friction (now kinetic friction) is usually a little less than the largest static friction. To keep the box moving at a constant velocity you only need a push equal to the sliding friction, so that the forces are balanced.',
      ],
      visual: cartVisual({ setup: setup({ massKg: 2, forceA: 3, surfaceId: 'wood' }), t: 2, editable: true, showNet: true }, 'A 2 kg cart at rest on a wooden table, pushed gently with 3 N.'),
      notice: 'Raise the push from 3 N to more than 8 N. What happens to the friction arrow and the net force?',
      check: pick('chk-f10-static', 'A box at rest on the floor is pushed with 20 N and does not move. How big is the friction on it?', [
        ['20 N, opposite to the push', null],
        ['More than 20 N', 'If the friction were larger than the push, the box would be pushed backwards. For a box at rest the friction matches the push exactly.', 'friction_larger'],
        ['Zero, because the box is not moving', 'Friction is present: it is what balances your push and keeps the net force zero.', 'no_friction_at_rest'],
      ], 'At rest the net force is zero, so friction equals the push.', undefined, 'f10-static'),
    },
    {
      id: 'f11-useful', title: 'Friction can be a nuisance and a necessity', phase: 'apply',
      paragraphs: [
        'Friction wastes energy and wears things out in machines, which is why we use oil and grease, smooth surfaces and streamlined shapes to reduce it. But without friction you could not walk (your shoe grips the ground), cars could not start or brake, a nail would not stay in wood and a knot would not hold.',
        'We increase friction where we need grip (treads on tyres, rough soles) and reduce it where we need smooth sliding (lubricants). Air also exerts a small friction on moving objects, which is often too small to matter and is ignored in the laboratory.',
      ],
      check: pick('chk-f11-useful', 'In which example is friction useful?', [
        ['A tyre gripping the road so the car can brake', null],
        ['Two machine parts rubbing and wearing out', 'Friction here is unwanted: it wears the parts away, so oil is used.', 'friction_always_useful'],
        ['A sledge sliding easily over ice', 'Here low friction is useful, not friction itself.', 'friction_always_useful'],
      ], 'Grip depends on friction.', undefined, 'f11-useful'),
    },
  ],
  investigation: lab('D', 'Compare a sliding cart on different surfaces, and push a resting cart gently and hard.'),
  worked: {
    id: 'w-pf-l3', title: 'A box pushed at a constant velocity',
    given: ['A person pushes a box along a level floor with a steady 30 N force, and the box moves at a constant velocity.'], ask: 'How large is the force of friction, and in which direction does it act?',
    visual: arrows('box', [R('Push', 30, 'the person'), L('Friction', 30, 'the floor'), { label: 'Normal force', by: 'the floor', magnitude: 50, direction: 'up' }, { label: 'Weight', by: 'the Earth', magnitude: 50, direction: 'down' }], 'A box pushed at constant velocity: 30 N push, 30 N friction, with weight and normal force.', true),
    steps: [
      { text: 'The box moves at a constant velocity, so its velocity does not change and its acceleration is zero.', why: 'Constant velocity means zero acceleration.' },
      { text: 'Zero acceleration means the net force on the box is zero: the forces are balanced.', why: 'Only an unbalanced force changes the velocity.' },
      { text: 'Along the floor the only forces are the 30 N push and friction, so friction must be equal in size to the push: 30 N.', why: 'For zero net force, the horizontal forces must be equal and opposite.' },
      { text: 'Friction acts opposite to the push, against the sliding of the box over the floor.', why: 'Friction resists the sliding at the contact.' },
    ],
    verify: 'Net force = (+30) + (−30) = 0, which agrees with the constant velocity.',
  },
  guided: {
    id: 'g-pf-l3', prompt: 'You push a heavy crate. With 40 N it does not move. At 70 N it just starts to move, and once it is sliding a steady push of 55 N keeps it moving at a constant velocity.',
    steps: [
      { id: 'g1', prompt: 'The crate at rest.', question: numQ('g-pf-l3-1', 'What is the friction on the crate when you push with 40 N and it does not move, in newtons?', 40, 'The crate is at rest, so the net force is zero: the friction equals the push, 40 N.', { unit: 'N', refresherId: 'f10-static', rules: [[[70], '70 N is the push needed to start it moving. When you push with 40 N the friction only needs to be 40 N.', 'max_for_current'], [[0], 'Friction acts to balance your push, so it is not zero.', 'no_friction_at_rest']] }), hints: ['The crate is at rest: what is the net force?'] },
      { id: 'g2', prompt: 'The crate sliding.', question: numQ('g-pf-l3-2', 'What is the friction on the sliding crate, in newtons?', 55, 'At constant velocity the net force is zero, so friction equals the 55 N push.', { unit: 'N', refresherId: 'f10-static', rules: [[[70], '70 N was the push needed to get it moving. At constant velocity the push (55 N) equals the friction.', 'max_for_current'], [[15], '15 N is the difference between 70 N and 55 N. The friction on the sliding crate equals the push.', 'difference_for_force']] }), hints: ['Constant velocity means balanced forces.'] },
      { id: 'g3', prompt: 'Why it moved.', question: pick('g-pf-l3-3', 'The crate started moving at 70 N. What does this tell you about the largest friction that can act on the resting crate?', [
        ['It is about 70 N: a push bigger than it makes the crate move', null],
        ['It is 40 N, because that is the push we first tried', 'The crate stayed at rest at 40 N only because friction matched it; friction could have been larger. It moved at 70 N, so the largest friction is about 70 N.', 'first_push_is_max'],
      ], 'A push larger than the maximum friction starts the motion.', undefined, 'f10-static'), hints: ['A push just bigger than the largest friction makes the crate move.'] },
    ],
    conclusion: 'At rest the friction equals the push (40 N); sliding at constant velocity the friction equals the push (55 N); the crate moves when the push exceeds the largest friction (about 70 N).',
  },
  independent: [
    ind('i1', 'Nature of friction', 'nature', 'Friction is a contact force.', pick('pf-l3-i1', 'Which statement about friction is correct?', [
      ['It acts between two surfaces in contact and resists their sliding', null],
      ['It acts between objects that are far apart', 'Friction is a contact force: the surfaces must touch.', 'friction_distance'],
      ['It acts only on objects that are moving', 'It also acts on a resting object that is being pushed (static friction).', 'friction_only_moving'],
    ], 'Friction is a contact force that resists sliding.', undefined, 'f8-contact'), ['Do the surfaces touch?'], ['A contact force.']),
    ind('i2', 'Nature of friction', 'nature', 'The truck.', pick('pf-l3-i2', 'A box rests on a truck bed. The truck speeds up forwards and the box does not slip. In which direction is the friction on the box?', [
      ['Forwards: it makes the box accelerate with the truck', null],
      ['Backwards: friction always opposes the motion', 'The box tends to slide backwards over the bed, so friction acts forwards on the box. Friction opposes the tendency to slide, not the overall motion.', 'friction_always_opposes'],
    ], 'Friction resists the tendency to slide at the contact.', undefined, 'f8-contact'), ['Which way would the box slide over the bed if there were no friction?'], ['Forwards.']),
    ind('i3', 'Slowing down', 'slowing', 'Stopping a cart.', pick('pf-l3-i3', 'A cart slides on a rough table with no one pushing it and slows to a stop. Which force makes it slow down?', [
      ['Friction between the cart and the table', null],
      ['The push that was used at the start', 'That push stopped when the cart was released. After that only friction acts along the table.', 'old_push'],
      ['Nothing: moving objects slow down by themselves', 'A moving object keeps its velocity unless an unbalanced force acts. Friction is that force.', 'slows_by_itself'],
    ], 'Friction is the unbalanced force that slows it.', undefined, 'f9-surfaces'), ['What force is left once the push is gone?'], ['Friction.']),
    ind('i4', 'Slowing down', 'slowing', 'No friction.', pick('pf-l3-i4', 'On an idealised frictionless surface a cart is given a push and then released. What happens to it?', [
      ['It keeps moving at a constant velocity', null],
      ['It slows down gradually', 'With no friction and no other force the net force is zero, so the velocity does not change.', 'slows_by_itself'],
      ['It stops after a little while', 'Nothing acts to stop it.', 'slows_by_itself'],
    ], 'Zero net force: constant velocity.', undefined, 'f9-surfaces'), ['What is the net force?'], ['Constant velocity.']),
    ind('i5', 'Static friction', 'static', 'Gentle push.', numQ('pf-l3-i5', 'A heavy box at rest is pushed with 25 N and does not move. What is the friction on it, in newtons?', 25, 'At rest the net force is zero, so the friction equals the push: 25 N.', { unit: 'N', refresherId: 'f10-static', rules: [[[0], 'Friction is exactly what stops your push from moving the box.', 'no_friction_at_rest']] }), ['Net force at rest?'], ['25 N.']),
    ind('i6', 'Static friction', 'static', 'Starting a box.', pick('pf-l3-i6', 'Why must you push harder to start a heavy box than to keep it sliding steadily?', [
      ['The friction on the resting box can reach a larger value than the friction on the sliding box', null],
      ['A moving box has no friction', 'Friction acts on a sliding box too; it is balanced by your push.', 'no_friction_moving'],
    ], 'Starting needs a push bigger than the largest static friction.', undefined, 'f10-static'), ['Compare static and sliding friction.'], ['The largest static friction is larger.']),
    ind('i7', 'Useful or unwanted', 'useful', 'Walking.', pick('pf-l3-i7', 'Why can you walk along a road without slipping?', [
      ['Friction between your shoe and the road grips the ground', null],
      ['Because friction is absent', 'Without friction (as on very smooth ice) you slip. Walking needs friction.', 'friction_always_bad'],
    ], 'Friction gives grip.', undefined, 'f11-useful'), ['What happens on ice?'], ['Friction grips the ground.']),
    ind('i8', 'Useful or unwanted', 'useful', 'Reducing friction.', pick('pf-l3-i8', 'A hinge squeaks and wears. Which change reduces the friction?', [
      ['Putting a little oil on it', null],
      ['Roughening the surfaces', 'Rougher surfaces increase friction.', 'rough_reduces'],
    ], 'Lubricants reduce friction.', undefined, 'f11-useful'), ['What do mechanics use to reduce friction?'], ['Oil.']),
  ],
  reflection: {
    discover: 'Friction is a contact force that resists sliding (or the tendency to slide); its direction is set at the contact, usually against a sliding object\'s motion. It slows moving objects and can never start one moving. Its size depends on the surfaces, it balances a gentle push on a resting object up to a limit, and it is both useful (grip) and unwanted (wear).',
    evidence: 'You compared a sliding cart on different surfaces, pushed a resting cart gently and hard, and balanced forces at constant velocity.',
    stillConfusing: [{ text: 'What decides the direction of friction?', refresherId: 'f8-contact' }, { text: 'Why does a moving object slow down?', refresherId: 'f9-surfaces' }, { text: 'Why does a gentle push not move it?', refresherId: 'f10-static' }, { text: 'Where is friction useful?', refresherId: 'f11-useful' }],
  },
};
