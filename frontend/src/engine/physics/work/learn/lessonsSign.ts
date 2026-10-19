/**
 * Class 9 Physics, Chapter 7: Lesson 3, positive and negative work (PHY-3A), Section 7.1.2.
 * Wording, figures and numbers are original. Net work as the sum of the work of every force is a labelled preview of the
 * work-energy theorem (Section 7.2), which is not taught yet.
 */

import type { EduLesson } from '../../../education/types';
import { ind, numQ, pick, workVisual } from './questions';
import { lab, w } from './lessons';

export const W3: EduLesson = {
  id: 'pw-l3', unitId: 'pw-unit-1', number: 3, title: 'Positive and negative work',
  objective: 'decide the sign of the work done by a force from its direction relative to the displacement, calculate signed work, and explain why friction on a sliding object does negative work.',
  prerequisiteIds: ['pwp-displacement', 'pwp-units', 'pwp-weight'],
  objectives: [
    { id: 'sign', label: 'Decide whether work is positive or negative from the directions' },
    { id: 'calc', label: 'Calculate signed work, converting units to metres' },
    { id: 'friction', label: 'Explain why friction on a sliding object does negative work' },
    { id: 'net', label: 'Add the work of each force to get the net work (preview)' },
  ],
  steps: [
    {
      id: 'pw9-positive', title: 'Positive work: force along the displacement', phase: 'observe',
      paragraphs: [
        'When the displacement is in the same direction as the force, the work done by that force is positive. A boy pushing a wheelchair forwards does positive work on it: his push and the wheelchair\'s displacement point the same way.',
        'Work has no direction of its own. It is a number with a sign, and the sign comes from comparing the direction of the force with the direction of the displacement.',
      ],
      vocabulary: [{ term: 'positive work', meaning: 'the force acts along the displacement (W = F × s with F and s the same way)' }],
      visual: workVisual({ setup: w({ forceN: 10, displacement: 3 }), progress: 1 }, 'A 10 N push to the right with a displacement 3 m to the right.'),
      notice: 'Force and displacement point the same way, so the work is positive.',
      check: pick('chk-pw9-positive', 'A boy pushes a wheelchair forwards and it moves forwards. The work done by his push on the wheelchair is:', [
        ['positive', null],
        ['negative', 'The push and the displacement are in the same direction, so the work is positive.', 'sign_confused'],
        ['zero', 'There is a force and a displacement along it, so the work is not zero.', 'zero_confused'],
      ], 'Along the displacement: positive.', undefined, 'pw9-positive'),
    },
    {
      id: 'pw10-negative', title: 'Negative work: force opposite to the displacement', phase: 'observe',
      paragraphs: [
        'When the displacement is opposite to the force, the work done by that force is negative. A goalkeeper stopping a ball pushes against the ball\'s motion, so she does negative work on the ball. Her hand also moves back with the ball, so the displacement is opposite to her force.',
        'The same force can do positive or negative work. Lifting a dumbbell, your upward force and the displacement are both up: positive. Lowering it slowly, your force is still upward but the displacement is downward: negative. And the ball does positive work on the goalkeeper\'s hand, because the ball\'s push on her hand acts the way her hand moves.',
      ],
      vocabulary: [{ term: 'negative work', meaning: 'the force acts opposite to the displacement' }],
      visual: workVisual({ setup: w({ axis: 'vertical', forceN: 30, angleDeg: 90, displacement: -0.5, startPos: 0.5, massKg: 3 }), progress: 1 }, 'A 3 kg dumbbell lowered 0.5 m by an upward force of 30 N.'),
      notice: 'The force arrow points up, and the object moves down.',
      misconception: { wrong: 'Negative work means the force is weak, or that the work is not done.', right: 'Negative work means the force acts opposite to the displacement. Work is done, and it takes energy away from the object.' },
      check: pick('chk-pw10-negative', 'You lower a heavy box slowly to the floor, holding it with an upward force. The work done by your upward force on the box is:', [
        ['negative: your force is up and the displacement is down', null],
        ['positive: you are using force', 'The sign comes from the directions, not from effort. Your force is up and the box moves down, so the work is negative.', 'sign_confused'],
      ], 'Opposite directions: negative.', undefined, 'pw10-negative'),
    },
    {
      id: 'pw11-calc', title: 'Calculating signed work', phase: 'reasoning',
      paragraphs: [
        'To calculate, take the direction of the force as positive. If the object is displaced in that direction, s is positive; if it is displaced the opposite way, s is negative. Then W = F × s carries the sign automatically.',
        'Use metres. A force of 120 N opposes a hand that moves back 25 cm. Change 25 cm to 0.25 m. The displacement is opposite to the force, so s = −0.25 m and W = 120 N × (−0.25 m) = −30 J.',
      ],
      check: pick('chk-pw11-calc', 'A 120 N force acts opposite to a displacement of 25 cm. What is the work done by the force?', [
        ['−30 J', null],
        ['−3000 J', 'You used 25 instead of 0.25 m. Change centimetres to metres first: 25 cm = 0.25 m.', 'cm_not_converted'],
        ['+30 J', 'The force is opposite to the displacement, so the work is negative.', 'sign_confused'],
      ], 'W = 120 × (−0.25) = −30 J.', undefined, 'pw11-calc'),
    },
    {
      id: 'pw12-friction', title: 'Friction usually does negative work', phase: 'apply',
      paragraphs: [
        'Friction on a sliding object acts opposite to the way the object slides. So the force and the displacement are opposite, and friction does negative work on a sliding object. A stack of coins sliding over a rough surface has negative work done on it by friction.',
        'A 15 N push moves a 5 kg box 4 m along wood at a steady speed. The push does +15 × 4 = +60 J. The sliding friction (15 N, backwards) does 15 × (−4) = −60 J.',
      ],
      visual: workVisual({ setup: w({ forceN: 15, displacement: 4, massKg: 5, surfaceId: 'wood' }), progress: 1 }, 'A 15 N push moving a 5 kg box 4 m along wood; friction opposes the motion.'),
      notice: 'Compare the friction arrow with the displacement arrow.',
      check: pick('chk-pw12-friction', 'A block slides to the right on a rough table. The work done on the block by friction is:', [
        ['negative: friction acts to the left while the block moves to the right', null],
        ['positive: friction is a force on the block', 'Being a force does not make the work positive. Friction acts opposite to the displacement, so its work is negative.', 'sign_confused'],
        ['zero: the table does not move', 'The table does not move, but the block does. Friction acts on the block along its path, and its work on the block is negative.', 'zero_confused'],
      ], 'Friction opposes sliding: negative.', undefined, 'pw12-friction'),
    },
    {
      id: 'pw13-net', title: 'Preview: each force has its own work (enrichment)', phase: 'apply',
      paragraphs: [
        'PREVIEW and ENRICHMENT: the next section of the book connects work to energy. Each force on an object does its own work, with its own sign, and the net work is the sum. When you lift a bag slowly, your hand does +50 J on it and gravity does −50 J, so the net work is 0 J. In the box pushed along wood the push gives +60 J, friction −60 J and the net work is 0 J.',
        'Always say whose work you mean: the work of the push, the work of friction and the net work are three different numbers.',
      ],
      visual: workVisual({ setup: w({ axis: 'vertical', forceN: 20, angleDeg: 90, displacement: 2, startPos: 0, massKg: 2 }), progress: 1 }, 'A 2 kg box lifted slowly 2 m: the hand and gravity do work of opposite signs.'),
      notice: 'Add the work of the hand and the work of gravity.',
      check: pick('chk-pw13-net', 'Lifting a bag slowly, your hand does +50 J and gravity does −50 J. What is the net work on the bag?', [
        ['0 J', null],
        ['+100 J', 'The work of gravity is negative, so it subtracts: +50 + (−50) = 0.', 'sign_ignored'],
        ['+50 J', 'That is the work of the hand alone. The net work includes the work of gravity too.', 'one_force_only'],
      ], 'Net work is the sum: 0 J.', undefined, 'pw13-net'),
    },
  ],
  investigation: lab('C', 'Compare a force along the displacement with a force against it, and see the sign of each force\'s work.'),
  worked: {
    id: 'w-pw-l3', title: 'Lowering a dumbbell',
    given: ['A girl lowers a 3 kg dumbbell slowly down through 0.5 m, holding it with an upward force equal to its weight.', 'Take g = 10 m/s².'], ask: 'How much work does her upward force do on the dumbbell, and how much does gravity do?',
    visual: workVisual({ setup: w({ axis: 'vertical', forceN: 30, angleDeg: 90, displacement: -0.5, startPos: 0.5, massKg: 3 }), progress: 1 }, 'A 3 kg dumbbell lowered 0.5 m by an upward force of 30 N.'),
    steps: [
      { text: 'Take up as positive. Her force is F = mg = 3 × 10 = 30 N, upwards (+30 N).', why: 'At a steady speed her upward force equals the weight.' },
      { text: 'The dumbbell moves down, so its displacement is s = −0.5 m.', why: 'Down is the negative direction.' },
      { text: 'Her force: W = F × s = (+30 N) × (−0.5 m) = −15 J.', why: 'Her force is opposite to the displacement, so the work is negative.' },
      { text: 'Gravity: its force is −30 N (down) and s = −0.5 m, so W = (−30 N) × (−0.5 m) = +15 J.', why: 'Gravity acts along the downward displacement, so its work is positive.' },
      { text: 'The two add to −15 + 15 = 0 J.', why: 'At a steady speed the net work is zero.' },
    ],
    verify: 'The signs follow the directions: negative for her force (opposite) and positive for gravity (along), with equal sizes.',
  },
  guided: {
    id: 'g-pw-l3', prompt: 'A box slides 2 m to the right along a floor. The sliding friction on it is 10 N, acting to the left.',
    steps: [
      { id: 'g1', prompt: 'The directions.', question: pick('pw-g3-1', 'How is the friction force related to the displacement of the box?', [
        ['It acts opposite to the displacement', null],
        ['It acts along the displacement', 'Friction acts to the left while the box moves to the right, so it is opposite to the displacement.', 'sign_confused'],
      ], 'Friction opposes the sliding.', undefined, 'pw12-friction'), hints: ['Which way does friction act, and which way does the box go?'] },
      { id: 'g2', prompt: 'Work of friction.', question: numQ('pw-g3-2', 'What is the work done by friction on the box, in joules (with its sign)? Take right as positive.', -20, 'W = (−10 N) × (+2 m) = −20 J.', { unit: 'J', refresherId: 'pw11-calc', rules: [[[20], 'The size is right but the sign is not: friction is opposite to the displacement, so the work is negative.', 'sign_confused'], [[-5], 'You divided. Multiply the force by the displacement.', 'divided']] }), hints: ['The force is −10 N and the displacement is +2 m.'] },
      { id: 'g3', prompt: 'A matching push.', question: pick('pw-g3-3', 'A 10 N push to the right moves the same box the same 2 m. Its work is +20 J. What is the net work of the push and friction?', [
        ['0 J', null],
        ['+40 J', 'Friction\'s work is negative: +20 + (−20) = 0.', 'sign_ignored'],
        ['+20 J', 'That is the push alone. Friction also does work, −20 J, so the net work is 0.', 'one_force_only'],
      ], 'The two add to zero.', undefined, 'pw13-net'), hints: ['Add the signed work of the push and of friction.'] },
    ],
    conclusion: 'Friction does −20 J on the sliding box, the push +20 J, and the net work is 0 J.',
  },
  independent: [
    ind('i1', 'The sign', 'sign', 'A braking cyclist.', pick('pw-l3-i1', 'A cyclist brakes. The braking force on the bicycle acts opposite to the bicycle\'s displacement. The work done by this force is:', [
      ['negative', null],
      ['positive', 'The force is opposite to the displacement, so its work is negative.', 'sign_confused'],
      ['zero', 'The force acts along the line of motion, so it does work; its sign is negative.', 'zero_confused'],
    ], 'Opposite: negative.', undefined, 'pw10-negative'), ['Compare the directions.'], ['Negative.']),
    ind('i2', 'The sign', 'sign', 'Lowering a box.', pick('pw-l3-i2', 'You lower a box slowly, holding it up with an upward force. The work done by your upward force is:', [
      ['negative, because the box moves down while the force is up', null],
      ['positive, because you are holding the box', 'Holding the box does not make the work positive. The sign depends on the directions, and here they are opposite.', 'sign_confused'],
    ], 'Opposite: negative.', undefined, 'pw10-negative'), ['Which way does the box move?'], ['Negative.']),
    ind('i3', 'Signed work', 'calc', 'A block pushed back.', numQ('pw-l3-i3', 'A 50 N force acts to the right on a block that is displaced 2 m to the LEFT. Taking right as positive, what is the work done by the force, in joules?', -100, 'W = (+50 N) × (−2 m) = −100 J.', { unit: 'J', refresherId: 'pw11-calc', rules: [[[100], 'The size is right, but the force is opposite to the displacement, so the work is negative.', 'sign_confused'], [[-25], 'You divided. Work is the product of force and displacement.', 'divided']] }), ['The displacement is −2 m.'], ['50 × (−2) = −100 J.']),
    ind('i4', 'Signed work', 'calc', 'A sled in centimetres.', numQ('pw-l3-i4', 'A 40 N force opposes a sled that slides 30 cm. What is the work done by this force, in joules?', -12, 'Convert 30 cm = 0.3 m. The force is opposite to the displacement: W = 40 N × (−0.3 m) = −12 J.', { unit: 'J', refresherId: 'pw11-calc', rules: [[[-1200], 'You used 30 instead of 0.3 m. Change centimetres to metres first.', 'cm_not_converted'], [[12], 'The size is right, but the force is opposite to the displacement, so the work is negative.', 'sign_confused']] }), ['Change 30 cm to metres first.'], ['40 × (−0.3) = −12 J.']),
    ind('i5', 'Friction', 'friction', 'A sliding block.', pick('pw-l3-i5', 'A block slides to the right on a rough table. The work done on the block by friction is:', [
      ['negative', null],
      ['positive', 'Friction acts to the left while the block moves right, so it is opposite to the displacement.', 'sign_confused'],
      ['zero, because friction only stops things', 'Friction acts along the whole displacement, opposite to it, so it does negative work.', 'zero_confused'],
    ], 'Friction opposes sliding: negative.', undefined, 'pw12-friction'), ['Which way does friction act?'], ['Negative.']),
    ind('i6', 'Friction', 'friction', 'The work of friction.', numQ('pw-l3-i6', 'A friction force of 6 N acts on a box that slides 3 m. Taking the direction of sliding as positive, what is the work done by friction, in joules?', -18, 'Friction is opposite to the displacement: W = (−6 N) × (+3 m) = −18 J.', { unit: 'J', refresherId: 'pw12-friction', rules: [[[18], 'The size is right, but friction is opposite to the displacement, so the work is negative.', 'sign_confused'], [[-2], 'You divided. Multiply the force by the displacement.', 'divided']] }), ['The friction force is −6 N.'], ['(−6) × 3 = −18 J.']),
    ind('i7', 'Net work', 'net', 'Push and friction.', numQ('pw-l3-i7', 'You push a crate with 15 N through 4 m along a floor whose sliding friction is also 15 N. Your push does +60 J. What is the net work of the push and friction, in joules?', 0, 'Friction does 15 × (−4) = −60 J, so the net work is +60 + (−60) = 0 J.', { unit: 'J', refresherId: 'pw13-net', rules: [[[60], 'That is the work of the push alone. Friction does −60 J as well.', 'one_force_only'], [[120], 'The work of friction is negative, so it subtracts.', 'sign_ignored']] }), ['Find the work of friction first.'], ['+60 − 60 = 0 J.']),
    ind('i8', 'Net work', 'net', 'A lifted bag.', pick('pw-l3-i8', 'Lifting a bag slowly, your hand does +50 J and gravity does −50 J. What is the net work?', [
      ['0 J', null],
      ['+100 J', 'Gravity\'s work is negative, so it subtracts from the +50 J.', 'sign_ignored'],
      ['+50 J', 'That is the hand alone; the net work includes the work of gravity.', 'one_force_only'],
    ], 'Net work is the sum: 0 J.', undefined, 'pw13-net'), ['Add the two with their signs.'], ['0 J.']),
  ],
  reflection: {
    discover: 'The sign of the work comes from the directions: along the displacement is positive, opposite to it is negative. Work is calculated with W = F × s, with s negative when the displacement is opposite to the force, using metres. Friction on a sliding object does negative work. Each force has its own work, and the net work is their sum.',
    evidence: 'You decided signs, calculated signed work with unit conversion, and added the work of several forces.',
    stillConfusing: [{ text: 'When is work positive?', refresherId: 'pw9-positive' }, { text: 'When is it negative?', refresherId: 'pw10-negative' }, { text: 'How do I calculate a signed value?', refresherId: 'pw11-calc' }, { text: 'Why is friction\'s work negative?', refresherId: 'pw12-friction' }],
  },
};
