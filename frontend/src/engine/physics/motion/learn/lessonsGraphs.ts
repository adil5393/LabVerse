/**
 * Class 9 Physics, Chapter 4: Unit 3 "Acceleration and graphs" (PHY-1C), Sections 4.1.4 and 4.2.
 * Lesson 6: acceleration. Lesson 7: position–time graphs. Lesson 8: velocity–time graphs, slope and area.
 * Every figure is the Graph Studio drawn from one constant-acceleration profile. Original wording.
 * The textbook's graphs show motion in one direction only; the turning-back examples are LabVerse enrichment
 * and are labelled as such where they appear.
 */

import type { EduLesson } from '../../../education/types';
import { graphVisual, ind, numQ, pick } from './questions';

const GRAPHS = '/physics/motion/graphs';
const lab = (scenario: string, description: string) => ({ title: 'Try it in the Motion Graph Studio', description, href: `${GRAPHS}?scenario=${scenario}`, buttonLabel: 'Open the Motion Graph Studio' });
const g = (scenario: string, intro: string, graphs: ('xt' | 'vt' | 'at')[] = ['xt', 'vt'], o: { editable?: boolean; predict?: boolean } = {}) => graphVisual({ scenario, graphs, ...o }, intro);

// ---------------------------------------------------------------------------
// Lesson 6: Acceleration  (Section 4.1.4)
// ---------------------------------------------------------------------------

export const L6: EduLesson = {
  id: 'pm-l6', unitId: 'pm-unit-3', number: 6, title: 'Acceleration: how quickly velocity changes',
  objective: 'find average acceleration as change in velocity divided by time, read its sign correctly, and keep acceleration apart from velocity.',
  prerequisiteIds: ['pmp-signed', 'pmp-rate'],
  objectives: [
    { id: 'avgacc', label: 'Calculate average acceleration, with its unit and sign' },
    { id: 'sign', label: 'Say whether the speed rises or falls from the signs of v and a' },
    { id: 'rate', label: 'Keep velocity, change in velocity and acceleration apart' },
  ],
  steps: [
    {
      id: 'm19-acc', title: 'Change in velocity per second', phase: 'observe',
      paragraphs: [
        'Velocity can change: an object can speed up, slow down or change direction. Acceleration tells how quickly. Average acceleration = change in velocity ÷ time taken = (final velocity − initial velocity) ÷ time, or a = (v − u) ÷ t.',
        'Its SI unit is metres per second per second, written m/s². A car whose velocity rises from 4 m/s to 20 m/s in 8 s has an average acceleration of (20 − 4) ÷ 8 = 2 m/s²: its velocity increases by 2 m/s every second.',
      ],
      vocabulary: [{ term: 'acceleration', meaning: 'the rate of change of velocity, in m/s²' }, { term: 'initial velocity u', meaning: 'the velocity at the start of the time interval' }, { term: 'final velocity v', meaning: 'the velocity at the end of the time interval' }],
      visual: g('uniform-acc', 'The velocity rises from 4 m/s to 20 m/s in 8 s.', ['vt', 'at']),
      notice: 'Step the time forward. Check that the velocity grows by the same amount every second, and compare it with the acceleration readout.',
      check: pick('chk-m19-acc', 'A cyclist\'s velocity changes from 2 m/s to 14 m/s in 4 s. What is the average acceleration?', [
        ['3 m/s²', null],
        ['12 m/s²', '12 m/s is the change in velocity. Acceleration divides it by the time, 4 s.', 'change_for_acceleration'],
        ['3.5 m/s²', '3.5 comes from 14 ÷ 4. Use the change in velocity, 14 − 2 = 12 m/s, before dividing.', 'final_velocity_only'],
      ], '(14 − 2) ÷ 4 = 3 m/s².', undefined, 'm19-acc'),
    },
    {
      id: 'm20-sign', title: 'The sign of acceleration', phase: 'conjecture',
      paragraphs: [
        'Acceleration has a direction, so it has a sign. If the acceleration points the same way as the velocity, the speed increases. If it points the opposite way, the speed decreases (the object is decelerating).',
        'Be careful: a negative acceleration does not always mean slowing down. An object moving left (negative velocity) with a negative acceleration is speeding up to the left. What matters is whether v and a have the same sign.',
      ],
      visual: g('slow-down', 'Velocity +16 m/s, acceleration −2 m/s²: the speed falls to zero in 8 s.', ['vt', 'at']),
      notice: 'The velocity is positive and the acceleration is negative. What happens to the speed?',
      misconception: { wrong: 'A negative acceleration always means the object is slowing down.', right: 'Slowing down happens when the acceleration is opposite to the velocity. With a negative velocity, a negative acceleration makes the object faster.' },
      check: pick('chk-m20-sign', 'An object has velocity −6 m/s and acceleration −2 m/s². What happens to its speed?', [
        ['It increases: the velocity and the acceleration are both negative, so they point the same way', null],
        ['It decreases, because the acceleration is negative', 'A negative acceleration slows an object only if the velocity is positive. Here both point left, so the object speeds up.', 'negative_means_slowing'],
        ['It stays the same', 'A non-zero acceleration changes the velocity every second.', 'ignores_acceleration'],
      ], 'Same signs: speeding up.', undefined, 'm20-sign'),
    },
    {
      id: 'm21-rate', title: 'Velocity is not acceleration', phase: 'reasoning',
      paragraphs: [
        'Acceleration is about the change in velocity, not the velocity itself. An object moving at a steady 15 m/s has zero acceleration, because its velocity does not change. And an object can have zero velocity for an instant and still have a non-zero acceleration: a ball thrown upward is momentarily at rest at the top, yet its velocity is changing.',
        'The motion is uniformly accelerated when the velocity changes by equal amounts in equal intervals of time; the acceleration is then constant.',
      ],
      visual: g('reversal', 'LabVerse enrichment: velocity +10 m/s with acceleration −2 m/s²; the velocity is zero at 5 s, but the acceleration is still −2 m/s².', ['vt', 'at']),
      notice: 'At 5 s the velocity is zero. Read the acceleration at that time.',
      check: pick('chk-m21-rate', 'At the top of its flight a thrown ball has velocity zero for an instant. What is its acceleration at that instant?', [
        ['Not zero: the velocity is still changing', null],
        ['Zero, because the velocity is zero', 'Zero velocity does not mean zero acceleration. The velocity was positive before and negative after, so it is changing at that moment.', 'zero_velocity_zero_acceleration'],
      ], 'Acceleration is the rate of change of velocity.', undefined, 'm21-rate'),
    },
  ],
  investigation: lab('uniform-acc', 'Change the start velocity and the acceleration and watch the velocity change every second.'),
  worked: {
    id: 'w-pm-l6', title: 'A train that slows down',
    given: ['A train moving right at 30 m/s slows to 10 m/s in 10 s (right is positive).'], ask: 'Find its average acceleration and say what the sign means.',
    steps: [
      { text: 'u = +30 m/s, v = +10 m/s, t = 10 s.', why: 'List the values with their signs.' },
      { text: 'Change in velocity = v − u = 10 − 30 = −20 m/s.', why: 'The velocity fell, so the change is negative.' },
      { text: 'a = (v − u) ÷ t = −20 ÷ 10 = −2 m/s².', why: 'Average acceleration = change in velocity ÷ time.' },
      { text: 'The acceleration is opposite to the velocity (negative against positive), so the speed decreases by 2 m/s every second.', why: 'Opposite signs of v and a mean slowing down.' },
    ],
    verify: 'After 10 s: 30 + (−2)(10) = 10 m/s, which matches the given final velocity.',
  },
  guided: {
    id: 'g-pm-l6', prompt: 'A car\'s velocity changes from 12 m/s to 36 m/s in 6 s in a straight line.',
    steps: [
      { id: 'g1', prompt: 'Change in velocity.', question: numQ('g-pm-l6-1', 'What is the change in velocity, in m/s?', 24, '36 − 12 = 24 m/s.', { unit: 'm/s', refresherId: 'm19-acc', rules: [[[36], '36 m/s is the final velocity. Subtract the initial velocity.', 'final_velocity_only']] }), hints: ['v − u.'] },
      { id: 'g2', prompt: 'Average acceleration.', question: numQ('g-pm-l6-2', 'What is the average acceleration, in m/s²?', 4, '24 ÷ 6 = 4 m/s².', { unit: 'm/s²', refresherId: 'm19-acc', rules: [[[24], '24 is the change in velocity. Divide by the time.', 'change_for_acceleration'], [[6], '6 s is the time. Divide the change in velocity by it.', 'time_for_acceleration']] }), hints: ['Divide by 6 s.'] },
      { id: 'g3', prompt: 'A later velocity.', question: numQ('g-pm-l6-3', 'If the acceleration stays at 4 m/s², what is the velocity 2 s after reaching 36 m/s, in m/s?', 44, '36 + 4 × 2 = 44 m/s.', { unit: 'm/s', refresherId: 'm19-acc', rules: [[[8], '8 m/s is only the extra velocity gained (4 × 2). Add it to 36 m/s.', 'change_for_velocity']] }), hints: ['The velocity rises 4 m/s each second.'] },
    ],
    conclusion: 'The velocity changed by 24 m/s in 6 s, so a = 4 m/s²; two seconds later it is 44 m/s.',
  },
  independent: [
    ind('i1', 'Average acceleration', 'avgacc', 'Speeding up.', numQ('pm-l6-i1', 'A scooter\'s velocity rises from 0 to 20 m/s in 4 s. What is its average acceleration, in m/s²?', 5, '(20 − 0) ÷ 4 = 5 m/s².', { unit: 'm/s²', refresherId: 'm19-acc', rules: [[[80], '80 comes from multiplying. Acceleration divides the change in velocity by the time.', 'multiplied_not_divided'], [[0.2], '0.2 divides the time by the change. Divide the change in velocity by the time.', 'inverted_ratio']] }), ['(v − u) ÷ t.'], ['5 m/s².']),
    ind('i2', 'Average acceleration', 'avgacc', 'Braking.', numQ('pm-l6-i2', 'A bus slows from 25 m/s to 5 m/s in 10 s. What is its average acceleration, in m/s² (use a minus sign if negative)?', -2, '(5 − 25) ÷ 10 = −2 m/s².', { unit: 'm/s²', refresherId: 'm19-acc', rules: [[[2], 'The velocity falls, so the change in velocity and the acceleration are negative.', 'sign_dropped'], [[3], '3 comes from 30 ÷ 10; the change is 5 − 25 = −20.', 'sign_error']] }), ['The change is final minus initial.'], ['−2 m/s².']),
    ind('i3', 'Average acceleration', 'avgacc', 'Find the time.', numQ('pm-l6-i3', 'An object with an acceleration of 3 m/s² goes from 6 m/s to 21 m/s. How long does this take, in seconds?', 5, 't = (v − u) ÷ a = 15 ÷ 3 = 5 s.', { unit: 's', refresherId: 'm19-acc', rules: [[[45], '45 comes from multiplying 15 × 3. Divide the change in velocity by the acceleration.', 'multiplied_not_divided']] }), ['Rearrange a = (v − u) ÷ t.'], ['5 s.']),
    ind('i4', 'Sign of acceleration', 'sign', 'Opposite signs.', pick('pm-l6-i4', 'An object has velocity +8 m/s and acceleration −2 m/s². Its speed is:', [
      ['decreasing', null],
      ['increasing', 'The acceleration points opposite to the velocity, which reduces the speed.', 'opposite_signs_speed_up'],
      ['constant', 'A non-zero acceleration changes the velocity.', 'ignores_acceleration'],
    ], 'Opposite signs: slowing down.', undefined, 'm20-sign'), ['Compare the signs.'], ['Decreasing.']),
    ind('i5', 'Sign of acceleration', 'sign', 'Negative with negative.', pick('pm-l6-i5', 'A trolley moves left with velocity −3 m/s and acceleration −1 m/s². After 2 s its velocity is:', [
      ['−5 m/s: faster to the left', null],
      ['−1 m/s: slower', 'The velocity changes by −1 m/s each second: −3 + (−1)(2) = −5 m/s. It is moving faster to the left.', 'negative_means_slowing'],
      ['+5 m/s', 'The direction does not reverse; the velocity stays negative.', 'sign_error'],
    ], '−3 + (−1)(2) = −5 m/s.', undefined, 'm20-sign'), ['Add a × t to the velocity.'], ['−5 m/s.']),
    ind('i6', 'Velocity and acceleration', 'rate', 'Steady speed.', pick('pm-l6-i6', 'A car moves in a straight line at a constant 20 m/s. Its acceleration is:', [
      ['zero', null],
      ['20 m/s²', 'The velocity is 20 m/s, but acceleration is the change in velocity, which is zero.', 'velocity_is_acceleration'],
    ], 'No change in velocity: no acceleration.', undefined, 'm21-rate'), ['Does the velocity change?'], ['Zero.']),
    ind('i7', 'Velocity and acceleration', 'rate', 'Uniform change.', pick('pm-l6-i7', 'The velocity of an object at 0, 1, 2, 3 s is 4, 7, 10, 13 m/s. Its acceleration is:', [
      ['constant (uniform) at 3 m/s²', null],
      ['zero, because the velocity is not zero', 'Acceleration is the change per second, and the velocity changes by 3 m/s each second.', 'velocity_is_acceleration'],
      ['non-uniform', 'The velocity rises by the same 3 m/s every second, so the acceleration is uniform.', 'uniform_means_rest'],
    ], 'Equal changes in equal times: uniform acceleration.', undefined, 'm21-rate'), ['Compare the change in each second.'], ['3 m/s², uniform.']),
    ind('i8', 'Velocity and acceleration', 'rate', 'Zero velocity.', pick('pm-l6-i8', 'An object has zero velocity at one instant. Which statement is true?', [
      ['Its acceleration at that instant can still be non-zero.', null],
      ['Its acceleration must be zero.', 'A ball at the top of its flight has zero velocity but a changing velocity.', 'zero_velocity_zero_acceleration'],
    ], 'Zero velocity does not imply zero acceleration.', undefined, 'm21-rate'), ['Think of the top of a throw.'], ['Can be non-zero.']),
  ],
  reflection: {
    discover: 'Average acceleration = (v − u) ÷ t, in m/s². Its sign tells the direction; the speed rises when v and a have the same sign and falls when they differ. Acceleration is the rate of change of velocity, not the velocity.',
    evidence: 'You calculated accelerations from velocity changes, read the effect of signs, and separated velocity from acceleration using the Graph Studio.',
    stillConfusing: [{ text: 'How do I find acceleration?', refresherId: 'm19-acc' }, { text: 'What does the sign mean?', refresherId: 'm20-sign' }, { text: 'Velocity or acceleration?', refresherId: 'm21-rate' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 7: Position–time graphs  (Sections 4.2.1 and 4.2.2)
// ---------------------------------------------------------------------------

export const L7: EduLesson = {
  id: 'pm-l7', unitId: 'pm-unit-3', number: 7, title: 'Position–time graphs',
  objective: 'read positions from a position–time graph and use its slope as the velocity, without confusing slope with height.',
  prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-rate'],
  objectives: [
    { id: 'read', label: 'Read the position at a given time' },
    { id: 'slope', label: 'Use the slope as the velocity, including its sign' },
    { id: 'shape', label: 'Match the shape of a graph to the motion' },
  ],
  steps: [
    {
      id: 'm22-plot', title: 'Each point is one time and one position', phase: 'observe',
      paragraphs: [
        'A graph shows how one quantity changes with another. In a position–time graph, time is on the horizontal axis and position on the vertical axis. Each point (t, x) says: at that time, the object is at that position.',
        'Click the graph or use its arrow keys to move the time cursor. The track above always shows the same position as the point on the graph.',
      ],
      vocabulary: [{ term: 'position–time graph', meaning: 'a graph of position x (vertical) against time t (horizontal)' }],
      visual: g('const-pos', 'An object moving at a constant +4 m/s from O.', ['xt']),
      notice: 'Move the cursor to different times. Read the position at 0 s, 5 s and 10 s, and see the object move on the track.',
      check: pick('chk-m22-plot', 'The object in the figure moves at a constant +4 m/s from O. What is its position at t = 5 s?', [
        ['+20 m', null],
        ['4 m', '4 m/s is the velocity. The position is read from the graph at t = 5 s: 4 × 5 = 20 m.', 'velocity_for_position'],
        ['5 m', '5 s is the time. The position is the height of the graph at that time.', 'time_for_position'],
      ], 'The point (5 s, +20 m).', undefined, 'm22-plot'),
    },
    {
      id: 'm23-slope', title: 'The slope is the velocity', phase: 'conjecture',
      paragraphs: [
        'The slope of a position–time graph is the change in position divided by the change in time, which is the velocity. A straight line has the same slope everywhere: the velocity is constant, which means uniform motion. A horizontal line has zero slope: the object is at rest. A line sloping downward has a negative slope: the object moves to the left.',
        'In the figure the position falls from +40 m to 0 m in 10 s. Slope = (0 − 40) ÷ 10 = −4 m/s: the object moves left at 4 m/s.',
      ],
      visual: g('const-neg', 'An object moving left at 4 m/s from +40 m.', ['xt']),
      notice: 'Read the velocity readout while you move the cursor. Does it change along a straight line?',
      misconception: { wrong: 'A higher point on the graph means a faster object.', right: 'Height is the position. Speed is shown by how steep the graph is (the slope), not by how high it is.' },
      check: pick('chk-m23-slope', 'A position–time graph is a straight line from (0 s, 40 m) to (10 s, 0 m). The velocity is:', [
        ['−4 m/s', null],
        ['+4 m/s', 'The position decreases, so the slope is negative.', 'sign_dropped'],
        ['−40 m/s', '−40 m is the change in position; divide by the 10 s taken.', 'change_for_velocity'],
      ], '(0 − 40) ÷ 10 = −4 m/s.', undefined, 'm23-slope'),
    },
    {
      id: 'm24-curve', title: 'A curve means the velocity is changing', phase: 'reasoning',
      paragraphs: [
        'When the position–time graph is a curve, the slope changes from point to point, so the velocity changes: the motion is non-uniform. The slope at a point (the slope of the dashed line touching the curve there) is the velocity at that instant.',
        'A curve that gets steeper means increasing velocity. A curve that flattens to a horizontal slope means the velocity falls to zero.',
      ],
      visual: g('speed-up', 'An object with start velocity 2 m/s and acceleration 2 m/s²: the position–time graph curves upward.', ['xt', 'vt']),
      notice: 'Compare the dashed line on the curve with the velocity readout at different times.',
      check: pick('chk-m24-curve', 'The position–time graph of an object curves upward and gets steeper. What is happening to its velocity?', [
        ['It is increasing', null],
        ['It is constant', 'A constant velocity gives a straight line. A steepening curve means the slope, and so the velocity, is rising.', 'curve_means_constant'],
        ['It is zero', 'Zero velocity gives a horizontal line.', 'curve_means_rest'],
      ], 'Steeper slope: greater velocity.', undefined, 'm24-curve'),
    },
  ],
  investigation: lab('const-pos', 'Compare the position–time graphs of rest, constant positive velocity and constant negative velocity.'),
  worked: {
    id: 'w-pm-l7', title: 'Reading a straight-line graph',
    given: ['A position–time graph is a straight line through (0 s, 10 m) and (6 s, 34 m).'], ask: 'Find the velocity and the position at 10 s.',
    steps: [
      { text: 'Slope = (34 − 10) m ÷ (6 − 0) s = 24 ÷ 6 = +4 m/s.', why: 'The slope of a position–time graph is the velocity.' },
      { text: 'The graph is a straight line, so the velocity is constant and the equation is x = 10 + 4t.', why: 'A straight line has the same slope everywhere.' },
      { text: 'At t = 10 s, x = 10 + 4 × 10 = 50 m.', why: 'Substitute the time into the equation of the line.' },
    ],
    verify: 'Check with the given point: at t = 6 s, 10 + 4 × 6 = 34 m, which matches the graph.',
  },
  guided: {
    id: 'g-pm-l7', prompt: 'Use the graph of an object that starts at 40 m and moves at a constant velocity to O in 10 s.',
    visual: g('const-neg', 'An object moving left at 4 m/s from +40 m.', ['xt']),
    steps: [
      { id: 'g1', prompt: 'Position at 6 s.', question: numQ('g-pm-l7-1', 'What is the position at t = 6 s, in metres?', 16, '40 − 4 × 6 = 16 m.', { unit: 'm', refresherId: 'm22-plot', rules: [[[24], '24 m is how far it has moved. The position is 40 − 24 = 16 m.', 'change_for_position']] }), hints: ['Read the height of the graph at 6 s.'] },
      { id: 'g2', prompt: 'The slope.', question: numQ('g-pm-l7-2', 'What is the slope of the graph (the velocity), in m/s?', -4, '(0 − 40) ÷ 10 = −4 m/s.', { unit: 'm/s', refresherId: 'm23-slope', rules: [[[4], 'The position decreases, so the slope is negative.', 'sign_dropped']] }), hints: ['Change in position ÷ change in time.'] },
      { id: 'g3', prompt: 'Speed and direction.', question: pick('g-pm-l7-3', 'What do you conclude about the motion?', [
        ['It moves left at a constant 4 m/s', null],
        ['It moves right at 4 m/s', 'A negative slope means the object moves to the left.', 'sign_dropped'],
      ], 'The slope is −4 m/s.', undefined, 'm23-slope'), hints: ['Read the sign of the slope.'] },
    ],
    conclusion: 'The slope is −4 m/s: the object moves left at 4 m/s, and its position at 6 s is 16 m.',
  },
  independent: [
    ind('i1', 'Reading positions', 'read', 'Position at 7 s.', numQ('pm-l7-i1', 'The object in the figure moves at a constant +4 m/s from O. What is its position at t = 7 s, in metres?', 28, 'The graph passes through (7 s, 28 m).', { unit: 'm', refresherId: 'm22-plot', rules: [[[4], '4 m/s is the velocity. Read the position at 7 s.', 'velocity_for_position'], [[7], '7 s is the time.', 'time_for_position']], visual: g('const-pos', 'An object moving at a constant +4 m/s from O.', ['xt']) }), ['Read the height at 7 s.'], ['28 m.']),
    ind('i2', 'Reading positions', 'read', 'Moving left.', numQ('pm-l7-i2', 'The object in the figure starts at +40 m and moves left at a constant 4 m/s. What is its position at t = 6 s, in metres?', 16, 'The graph passes through (6 s, 16 m).', { unit: 'm', refresherId: 'm22-plot', rules: [[[-16], 'The object has not crossed O yet: its position is still positive.', 'sign_error'], [[24], '24 m is the distance it has covered.', 'change_for_position']], visual: g('const-neg', 'An object starting at +40 m and moving left at 4 m/s.', ['xt']) }), ['Read the height at 6 s.'], ['16 m.']),
    ind('i3', 'Slope as velocity', 'slope', 'Rising line.', numQ('pm-l7-i3', 'A straight position–time graph goes from (0 s, 10 m) to (5 s, 35 m). What is the velocity, in m/s?', 5, '(35 − 10) ÷ 5 = 5 m/s.', { unit: 'm/s', refresherId: 'm23-slope', rules: [[[7], '7 comes from 35 ÷ 5. Use the change in position, 25 m.', 'height_for_slope'], [[25], '25 m is the change in position. Divide by the 5 s.', 'change_for_velocity']] }), ['Slope = rise ÷ run.'], ['5 m/s.']),
    ind('i4', 'Slope as velocity', 'slope', 'Falling line.', numQ('pm-l7-i4', 'A straight position–time graph goes from (0 s, 50 m) to (10 s, 20 m). What is the velocity, in m/s?', -3, '(20 − 50) ÷ 10 = −3 m/s.', { unit: 'm/s', refresherId: 'm23-slope', rules: [[[3], 'The graph falls, so the slope is negative.', 'sign_dropped'], [[2], '2 comes from 20 ÷ 10. Use the change in position, −30 m.', 'height_for_slope']] }), ['Rise is negative here.'], ['−3 m/s.']),
    ind('i5', 'Slope as velocity', 'slope', 'Slope or height.', pick('pm-l7-i5', 'On the same position–time axes, line A is above line B at every time, and both are parallel. Which statement is correct?', [
      ['They have the same velocity; A is simply at a greater position.', null],
      ['A is faster, because it is higher.', 'Height is the position. Parallel lines have the same slope, so the same velocity.', 'height_is_speed'],
      ['B is faster, because it is lower.', 'Parallel lines have equal slopes, so equal velocities.', 'height_is_speed'],
    ], 'Slope, not height, gives the velocity.', undefined, 'm23-slope'), ['Compare the slopes.'], ['Same velocity.']),
    ind('i6', 'Shape and motion', 'shape', 'Horizontal line.', pick('pm-l7-i6', 'What does a horizontal line on a position–time graph show?', [
      ['The object is at rest', null],
      ['The object moves at a constant velocity', 'A constant non-zero velocity gives a straight sloping line. A horizontal line has zero slope.', 'rest_confusion'],
    ], 'Zero slope: rest.', undefined, 'm23-slope'), ['What is the slope?'], ['At rest.']),
    ind('i7', 'Shape and motion', 'shape', 'Flattening curve.', pick('pm-l7-i7', 'The position–time graph of a slowing object (velocity +16 m/s, acceleration −2 m/s²) flattens and becomes horizontal at 8 s. What does this show at 8 s?', [
      ['The velocity is zero', null],
      ['The object has moved back to O', 'A horizontal slope means zero velocity. The position there is the highest one reached, not O.', 'curve_means_return'],
      ['The acceleration is zero', 'The acceleration is still −2 m/s²; only the velocity is zero at that instant.', 'zero_velocity_zero_acceleration'],
    ], 'Zero slope at an instant: zero velocity.', g('slow-down', 'Velocity +16 m/s, acceleration −2 m/s².', ['xt', 'vt']), 'm24-curve'), ['Read the slope at 8 s.'], ['Zero velocity.']),
  ],
  reflection: {
    discover: 'In a position–time graph each point is a time and a position. The slope is the velocity: a straight line means constant velocity, a horizontal line means rest, a downward slope means motion to the left, and a curve means the velocity changes. Height is the position, not the speed.',
    evidence: 'You read positions at chosen times, found slopes with their signs, and matched curve shapes to the motion.',
    stillConfusing: [{ text: 'What does a point mean?', refresherId: 'm22-plot' }, { text: 'Slope or height?', refresherId: 'm23-slope' }, { text: 'What does a curve mean?', refresherId: 'm24-curve' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 8: Velocity–time graphs  (Section 4.2.3)
// ---------------------------------------------------------------------------

export const L8: EduLesson = {
  id: 'pm-l8', unitId: 'pm-unit-3', number: 8, title: 'Velocity–time graphs: slope and area',
  objective: 'read a velocity–time graph, use its slope as the acceleration and the area under it as the displacement, and know when distance needs the area of |v|.',
  prerequisiteIds: ['pmp-signed', 'pmp-rate'],
  objectives: [
    { id: 'vtshape', label: 'Read the shape of a velocity–time graph' },
    { id: 'vtslope', label: 'Use the slope as the acceleration' },
    { id: 'area', label: 'Use the area as displacement, and |v| for distance' },
  ],
  steps: [
    {
      id: 'm25-vt', title: 'Height is the velocity', phase: 'observe',
      paragraphs: [
        'In a velocity–time graph the height is the velocity at that time. A horizontal line at +4 m/s means the velocity is constant: the object moves right at a steady 4 m/s. It does not mean the object is at rest. A line on the time axis (velocity zero) means rest.',
        'A straight sloping line means the velocity changes by equal amounts in equal times: uniform acceleration.',
      ],
      vocabulary: [{ term: 'velocity–time graph', meaning: 'a graph of velocity v (vertical) against time t (horizontal)' }],
      visual: g('const-pos', 'An object moving at a constant +4 m/s: compare the two graphs.', ['xt', 'vt']),
      notice: 'The velocity–time graph is horizontal while the position–time graph rises. Why?',
      check: pick('chk-m25-vt', 'A velocity–time graph is a horizontal line at +4 m/s. The object is:', [
        ['moving right at a constant velocity of 4 m/s', null],
        ['at rest', 'At rest the velocity is zero, so the line would lie on the time axis.', 'horizontal_means_rest'],
        ['speeding up', 'A speeding-up object has a sloping line. A horizontal line means the velocity is not changing.', 'horizontal_means_speeding'],
      ], 'Height = velocity.', undefined, 'm25-vt'),
    },
    {
      id: 'm26-vtslope', title: 'The slope is the acceleration', phase: 'conjecture',
      paragraphs: [
        'The slope of a velocity–time graph is the change in velocity divided by the change in time, which is the acceleration. A line sloping up has a positive acceleration; a line sloping down has a negative acceleration; a horizontal line has zero acceleration.',
        'In the figure the velocity falls from 16 m/s to 0 in 8 s: slope = (0 − 16) ÷ 8 = −2 m/s². The velocity is positive but the slope is negative, so the speed decreases.',
      ],
      visual: g('slow-down', 'Velocity falls from +16 m/s to 0 in 8 s.', ['vt', 'at']),
      notice: 'The velocity-time graph is above the axis but sloping down. Which quantity is positive and which is negative?',
      misconception: { wrong: 'The graph is high, so the acceleration is large.', right: 'Height is the velocity; the acceleration is the slope. A high, flat line has zero acceleration.' },
      check: pick('chk-m26-vtslope', 'A velocity–time graph is a straight line from (0 s, 16 m/s) to (8 s, 0 m/s). The acceleration is:', [
        ['−2 m/s²', null],
        ['+2 m/s²', 'The velocity decreases, so the slope is negative.', 'sign_dropped'],
        ['16 m/s²', '16 m/s is the start velocity. Divide the change in velocity by the time.', 'height_for_slope'],
      ], '(0 − 16) ÷ 8 = −2 m/s².', undefined, 'm26-vtslope'),
    },
    {
      id: 'm27-area', title: 'The area is the displacement', phase: 'reasoning',
      paragraphs: [
        'The area between the velocity–time graph and the time axis equals the displacement, because velocity × time gives displacement. For an object whose velocity rises uniformly from 4 to 20 m/s in 8 s, the area is a trapezoid: ½ × (4 + 20) × 8 = 96 m.',
        'You can check it with the position–time graph: the position at 8 s is 96 m. The Graph Studio shows the shaded area growing as you move the time cursor.',
      ],
      visual: g('uniform-acc', 'Velocity rises from 4 m/s to 20 m/s in 8 s; the shaded area is the displacement.', ['vt', 'xt']),
      notice: 'Move the cursor and compare the displacement readout with the shaded area.',
      check: pick('chk-m27-area', 'An object moves at a steady 5 m/s for 12 s. What is the area under its velocity–time graph, and what does it equal?', [
        ['60 m, the displacement', null],
        ['17 m, the displacement', '17 comes from adding 5 + 12. The area of the rectangle is height × width = 5 × 12.', 'added_not_multiplied'],
        ['60 m/s, the velocity', 'Velocity × time gives a length, so the unit of the area is metres.', 'area_is_velocity'],
      ], '5 × 12 = 60 m.', undefined, 'm27-area'),
    },
    {
      id: 'm28-signed', title: 'Area below the axis, and distance', phase: 'apply',
      paragraphs: [
        'LabVerse enrichment (the textbook graphs show one direction only): when the velocity becomes negative the graph dips below the axis. Area above the axis counts as positive displacement and area below as negative, so the signed area is the displacement.',
        'For the object with velocity +10 m/s and acceleration −2 m/s², the velocity is zero at 5 s. The area above the axis (0 to 5 s) is ½ × 10 × 5 = 25 m, and the area below (5 to 10 s) is −25 m. The displacement is 25 − 25 = 0, but the distance travelled counts both areas as positive: 25 + 25 = 50 m.',
      ],
      visual: g('reversal', 'LabVerse enrichment: velocity +10 m/s, acceleration −2 m/s²; the object turns back at 5 s.', ['vt', 'xt']),
      notice: 'Compare the displacement and distance readouts after 10 s. Which one adds the area below the axis as a positive amount?',
      check: pick('chk-m28-signed', 'The area above the time axis is 25 m and the area below it is 25 m. What are the displacement and the distance?', [
        ['Displacement 0, distance 50 m', null],
        ['Displacement 50 m, distance 50 m', 'Area below the axis is negative displacement, so it cancels the area above. The displacement is 0.', 'area_all_positive'],
        ['Displacement 0, distance 0', 'The object moved 25 m out and 25 m back, so the distance is 50 m.', 'both_zero'],
      ], 'Signed area for displacement; sum of |areas| for distance.', undefined, 'm28-signed'),
    },
  ],
  investigation: lab('reversal', 'Compare the signed area (displacement) with the area of |v| (distance) for an object that turns back.'),
  worked: {
    id: 'w-pm-l8', title: 'A speeding-up, steady and slowing-down journey',
    given: ['A trolley\'s velocity rises uniformly from 0 to 12 m/s in 4 s, stays at 12 m/s for 6 s, then falls uniformly to 0 in 2 s.'], ask: 'Find the acceleration in each stage and the total displacement.',
    steps: [
      { text: 'Stage 1: a = (12 − 0) ÷ 4 = +3 m/s². Stage 2: a = 0. Stage 3: a = (0 − 12) ÷ 2 = −6 m/s².', why: 'The slope of each straight part is the acceleration.' },
      { text: 'Stage 1 area (a triangle) = ½ × 4 × 12 = 24 m.', why: 'Area of a triangle = ½ × base × height.' },
      { text: 'Stage 2 area (a rectangle) = 6 × 12 = 72 m.', why: 'Area of a rectangle = base × height.' },
      { text: 'Stage 3 area (a triangle) = ½ × 2 × 12 = 12 m.', why: 'Another triangle.' },
      { text: 'Displacement = 24 + 72 + 12 = 108 m.', why: 'The total area is the displacement.' },
    ],
    verify: 'The trolley never moves backwards, so the distance is also 108 m.',
  },
  guided: {
    id: 'g-pm-l8', prompt: 'Use the velocity–time graph of an object whose velocity rises uniformly from 4 m/s to 20 m/s in 8 s.',
    visual: g('uniform-acc', 'Velocity rises from 4 m/s to 20 m/s in 8 s.', ['vt']),
    steps: [
      { id: 'g1', prompt: 'The slope.', question: numQ('g-pm-l8-1', 'What is the slope of the graph (the acceleration), in m/s²?', 2, '(20 − 4) ÷ 8 = 2 m/s².', { unit: 'm/s²', refresherId: 'm26-vtslope', rules: [[[20], '20 m/s is the final velocity (the height of the graph at 8 s), not the slope.', 'height_for_slope'], [[2.5], '2.5 comes from 20 ÷ 8. Use the change in velocity, 16 m/s.', 'height_for_slope']] }), hints: ['Change in velocity ÷ change in time.'] },
      { id: 'g2', prompt: 'The area.', question: numQ('g-pm-l8-2', 'What is the area under the graph, which is the displacement, in metres?', 96, '½ × (4 + 20) × 8 = 96 m.', { unit: 'm', refresherId: 'm27-area', rules: [[[160], '160 is 20 × 8, a rectangle at the final height. The area is a trapezoid.', 'rectangle_for_trapezoid'], [[32], '32 is only the rectangle under the 4 m/s start. Add the triangle above it.', 'partial_area']] }), hints: ['A trapezoid: ½ × (sum of parallel sides) × width.'] },
      { id: 'g3', prompt: 'Average velocity.', question: numQ('g-pm-l8-3', 'What is the average velocity over the 8 s, in m/s?', 12, '96 ÷ 8 = 12 m/s, which is (4 + 20) ÷ 2.', { unit: 'm/s', refresherId: 'm27-area', rules: [[[96], '96 m is the displacement. Divide by 8 s.', 'displacement_for_velocity']] }), hints: ['Displacement ÷ time.'] },
    ],
    conclusion: 'The slope is 2 m/s², the area (displacement) is 96 m, and the average velocity is 12 m/s.',
  },
  independent: [
    ind('i1', 'Reading the graph', 'vtshape', 'Straight sloping line.', pick('pm-l8-i1', 'A velocity–time graph is a straight line sloping upward from the origin. This shows:', [
      ['uniform acceleration', null],
      ['constant velocity', 'Constant velocity gives a horizontal line.', 'sloping_means_constant'],
      ['rest', 'Rest is a line on the time axis.', 'horizontal_means_rest'],
    ], 'A straight slope: uniform acceleration.', undefined, 'm25-vt'), ['Is the velocity changing?'], ['Uniform acceleration.']),
    ind('i2', 'Reading the graph', 'vtshape', 'On the axis.', pick('pm-l8-i2', 'A velocity–time graph lies along the time axis for 10 s. The object is:', [
      ['at rest', null],
      ['moving at constant speed', 'On the axis the velocity is zero.', 'horizontal_means_constant'],
    ], 'Zero velocity: at rest.', undefined, 'm25-vt'), ['What is the height?'], ['At rest.']),
    ind('i3', 'Slope', 'vtslope', 'Slowing graph.', numQ('pm-l8-i3', 'The velocity–time graph of the slowing object in the figure goes from (0 s, 16 m/s) to (8 s, 0). What is its acceleration, in m/s²?', -2, '(0 − 16) ÷ 8 = −2 m/s².', { unit: 'm/s²', refresherId: 'm26-vtslope', rules: [[[2], 'The velocity falls, so the slope is negative.', 'sign_dropped']], visual: g('slow-down', 'Velocity falls from +16 m/s to 0.', ['vt']) }), ['Slope = change in velocity ÷ time.'], ['−2 m/s².']),
    ind('i4', 'Slope', 'vtslope', 'Flat graph.', pick('pm-l8-i4', 'A velocity–time graph is a horizontal line at +9 m/s. The acceleration is:', [
      ['zero', null],
      ['9 m/s²', 'The height is the velocity. The slope is zero, so the acceleration is zero.', 'height_for_slope'],
    ], 'Zero slope: zero acceleration.', undefined, 'm26-vtslope'), ['What is the slope?'], ['Zero.']),
    ind('i5', 'Area', 'area', 'Rectangle.', numQ('pm-l8-i5', 'An object moves at a constant 5 m/s for 12 s. What is the displacement, in metres?', 60, '5 × 12 = 60 m.', { unit: 'm', refresherId: 'm27-area', rules: [[[17], '17 comes from adding the numbers. The area is height × width.', 'added_not_multiplied']] }), ['Area of the rectangle.'], ['60 m.']),
    ind('i6', 'Area', 'area', 'Triangle.', numQ('pm-l8-i6', 'An object\'s velocity rises uniformly from 0 to 10 m/s in 5 s. What is the displacement, in metres?', 25, '½ × 5 × 10 = 25 m.', { unit: 'm', refresherId: 'm27-area', rules: [[[50], '50 is 5 × 10, a rectangle. The area is a triangle, half of that.', 'rectangle_for_triangle']] }), ['A triangle: ½ × base × height.'], ['25 m.']),
    ind('i7', 'Area', 'area', 'Distance with a turn.', numQ('pm-l8-i7', 'The object in the figure (velocity +10 m/s, acceleration −2 m/s²) is followed for 10 s. What distance does it travel, in metres?', 50, '25 m out (0 to 5 s) plus 25 m back (5 to 10 s) = 50 m.', { unit: 'm', refresherId: 'm28-signed', rules: [[[0], '0 m is the displacement. The distance counts both areas as positive.', 'displacement_for_distance']], visual: g('reversal', 'LabVerse enrichment: velocity +10 m/s, acceleration −2 m/s².', ['vt', 'xt']) }), ['Add the sizes of both areas.'], ['50 m.']),
    ind('i8', 'Area', 'area', 'Displacement with a turn.', numQ('pm-l8-i8', 'For the same 10 s motion, what is the displacement, in metres?', 0, '+25 m − 25 m = 0.', { unit: 'm', refresherId: 'm28-signed', rules: [[[50], '50 m is the distance. Area below the axis is negative displacement.', 'area_all_positive']], visual: g('reversal', 'LabVerse enrichment: velocity +10 m/s, acceleration −2 m/s².', ['vt', 'xt']) }), ['Area below the axis is negative.'], ['0 m.']),
  ],
  reflection: {
    discover: 'On a velocity–time graph the height is the velocity, the slope is the acceleration and the area is the displacement. A horizontal line means constant velocity, not rest. When the graph dips below the axis the signed area gives the displacement and the area of |v| gives the distance.',
    evidence: 'You read heights and slopes, calculated areas of rectangles, triangles and trapezoids, and compared displacement with distance for an object that turns back.',
    stillConfusing: [{ text: 'What does the shape mean?', refresherId: 'm25-vt' }, { text: 'Slope or height?', refresherId: 'm26-vtslope' }, { text: 'Why is the area the displacement?', refresherId: 'm27-area' }, { text: 'Displacement and distance with a turn?', refresherId: 'm28-signed' }],
  },
};
