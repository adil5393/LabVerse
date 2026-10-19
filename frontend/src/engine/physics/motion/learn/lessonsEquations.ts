/**
 * Class 9 Physics, Chapter 4: Unit 4 "Equations of motion" (Section 4.3) and Unit 5 "Uniform circular motion"
 * (Section 4.4.1), PHY-1D. Lesson 9 derives the three equations from the velocity–time graph and teaches
 * when they may be used. Lesson 10 uses the circular-motion model with true 2-D geometry. Original wording.
 * The turning-back example and the chord/arc quantities of circular motion are LabVerse enrichment.
 */

import type { EduLesson } from '../../../education/types';
import { circleVisual, graphVisual, ind, numQ, pick } from './questions';

const EQ = '/physics/motion/equations';
const CIRC = '/physics/motion/circular';
const lab = (href: string, title: string, description: string, buttonLabel: string) => ({ title, description, href, buttonLabel });
const eqv = (profile: { x0: number; v0: number; segments: { durationS: number; a: number }[] }, intro: string, o: { presets?: boolean } = {}) =>
  graphVisual({ profile, graphs: ['xt', 'vt'], equations: true, editable: Boolean(o.presets), equationPresets: o.presets }, intro);
const one = (x0: number, v0: number, a: number, d: number) => ({ x0, v0, segments: [{ durationS: d, a }] });

// ---------------------------------------------------------------------------
// Lesson 9: Equations of motion  (Section 4.3)
// ---------------------------------------------------------------------------

export const L9: EduLesson = {
  id: 'pm-l9', unitId: 'pm-unit-4', number: 9, title: 'Equations of motion for constant acceleration',
  objective: 'derive and use v = u + at, s = ut + ½at² and v² = u² + 2as, choose the right one for a problem, and say when they may not be used.',
  prerequisiteIds: ['pmp-signed', 'pmp-formula'],
  objectives: [
    { id: 'vuat', label: 'Use v = u + at' },
    { id: 'suat', label: 'Use s = ut + ½at², with signs' },
    { id: 'v2', label: 'Use v² = u² + 2as' },
    { id: 'choose', label: 'Choose an equation and check its assumptions' },
  ],
  steps: [
    {
      id: 'm29-vuat', title: 'From the slope of the velocity–time graph', phase: 'reasoning',
      paragraphs: [
        'Suppose an object moves in a straight line with a constant acceleration a, starting with velocity u. After a time t its velocity is v. On the velocity–time graph the slope is the acceleration: a = (v − u) ÷ t.',
        'Rearranging gives the first equation of motion: v = u + at. It says that the velocity changes by a every second, so after t seconds it has changed by at.',
      ],
      vocabulary: [{ term: 'u, v', meaning: 'initial and final velocity (m/s), with signs' }, { term: 's', meaning: 'displacement (m): final position minus initial position' }],
      visual: eqv(one(0, 4, 2, 8), 'u = 4 m/s and a = 2 m/s²: read the first line of the equation panel.'),
      notice: 'Move the time cursor and check that v from the equation always matches the velocity on the graph.',
      check: pick('chk-m29-vuat', 'An object has u = 5 m/s and a = 3 m/s². What is its velocity after 4 s?', [
        ['17 m/s', null],
        ['12 m/s', '12 m/s is only the change in velocity, at = 12. Add the initial velocity: 5 + 12.', 'change_for_velocity'],
        ['60 m/s', '60 comes from multiplying 5 × 3 × 4. The equation is v = u + at: add the change to the start.', 'multiplied_all'],
      ], 'v = 5 + 3 × 4 = 17 m/s.', undefined, 'm29-vuat'),
    },
    {
      id: 'm30-suat', title: 'From the area under the graph', phase: 'reasoning',
      paragraphs: [
        'The displacement is the area under the velocity–time graph. For a constant acceleration the graph is a straight line from u to v, so the area is a trapezoid: s = ½ (u + v) t.',
        'Replace v by u + at: s = ½ (u + u + at) t = ut + ½ at². This is the second equation. The first term, ut, is what the object would cover at the initial velocity alone; the second, ½at², is the extra (or the loss) caused by the acceleration.',
      ],
      visual: eqv(one(0, 4, 2, 8), 'The displacement is the area under the v–t graph: u = 4 m/s, a = 2 m/s².'),
      notice: 'Compare the displacement from s = ut + ½at² with the displacement readout at several times.',
      check: pick('chk-m30-suat', 'An object has u = 4 m/s and a = 2 m/s². What is its displacement after 5 s?', [
        ['45 m', null],
        ['20 m', '20 m is only ut. The second term ½at² = 25 m must be added.', 'forgot_half_at2'],
        ['70 m', '70 comes from using at² = 50 instead of ½at² = 25.', 'forgot_half'],
      ], 's = 4 × 5 + ½ × 2 × 25 = 20 + 25 = 45 m.', undefined, 'm30-suat'),
    },
    {
      id: 'm31-v2', title: 'Without the time', phase: 'reasoning',
      paragraphs: [
        'Sometimes the time is not given or not wanted. From v = u + at we get t = (v − u) ÷ a. Substitute into s = ½ (u + v) t: s = ½ (u + v)(v − u) ÷ a = (v² − u²) ÷ 2a.',
        'Rearranged, this is the third equation: v² = u² + 2as. It connects the velocities, the acceleration and the displacement directly. It is ideal for a braking car: with v = 0 the stopping distance is s = u² ÷ (2 × the size of the deceleration).',
      ],
      visual: eqv(one(0, 20, -4, 5), 'A car brakes from 20 m/s with a = −4 m/s²: it stops after 5 s.'),
      notice: 'At 5 s the velocity is zero. Read s from the panel and check it against v² = u² + 2as.',
      check: pick('chk-m31-v2', 'A car moving at 20 m/s brakes with a = −4 m/s² until it stops. Which calculation gives the stopping distance?', [
        ['0 = 20² + 2 × (−4) × s, so s = 50 m', null],
        ['0 = 20 + (−4) × s, so s = 5 m', 'That mixes up the equations: v = u + at has the time t, not the distance s. Use v² = u² + 2as for the distance.', 'wrong_equation'],
        ['s = 20 × (−4) = −80 m', 'Distance is not velocity × acceleration. Use v² = u² + 2as.', 'multiplied_u_a'],
      ], '0 = 400 − 8s gives s = 50 m.', undefined, 'm31-v2'),
    },
    {
      id: 'm32-assume', title: 'Signs, and when the equations may be used', phase: 'reasoning',
      paragraphs: [
        'The equations hold only for motion along a straight line with ONE constant acceleration. Right is positive and left is negative for u, v, a and s. s is the displacement, not the distance.',
        'If the acceleration changes, for example 3 m/s² for 4 s and then −1 m/s² for 4 s, one equation cannot cover the whole motion. Use the equations on each stage separately, and take the final velocity of the first stage as the initial velocity of the second. Try the "Acceleration changes" scenario in the laboratory: the panel refuses to apply the equations to the whole interval.',
      ],
      visual: eqv(one(0, 0, 3, 4), 'Open the presets and choose "Acceleration changes (not allowed)".', { presets: true }),
      notice: 'Choose the last scenario. What does the panel say, and how far off would a single equation be?',
      misconception: { wrong: 'The three equations work for any motion in a straight line.', right: 'They are only valid for a constant acceleration. If the acceleration changes, use them stage by stage.' },
      check: pick('chk-m32-assume', 'A car accelerates at 2 m/s² for 5 s and then at 1 m/s² for 5 s. Can v = u + at with a = 2 m/s² and t = 10 s give the final velocity?', [
        ['No: the acceleration is not constant over the 10 s, so each stage must be handled separately', null],
        ['Yes: the equation works for any acceleration', 'The equation assumes a single constant acceleration for the whole time.', 'equations_always'],
      ], 'Constant acceleration only.', undefined, 'm32-assume'),
    },
    {
      id: 'm33-turn', title: 'When the velocity reverses (enrichment)', phase: 'apply',
      paragraphs: [
        'The textbook examples move in one direction. LabVerse adds this case: an object with u = +10 m/s and a = −2 m/s² has velocity zero at 5 s and then moves back. At 10 s, s = 10 × 10 + ½ × (−2) × 100 = 0 m: it is back at its start, so the displacement is zero.',
        'The equation gave the displacement s. The distance travelled is 25 m out plus 25 m back, 50 m. The equations of motion give displacement, not distance.',
      ],
      visual: eqv(one(0, 10, -2, 10), 'LabVerse enrichment: u = +10 m/s, a = −2 m/s². Move to 10 s and compare s with the distance readout.'),
      notice: 'At 10 s compare the displacement with the distance readout.',
      check: pick('chk-m33-turn', 'For this motion at t = 10 s, which statement is correct?', [
        ['s = 0 (displacement) but the distance travelled is 50 m', null],
        ['s = 50 m, because the object travelled 50 m', 's is the displacement, which is zero here. The distance, 50 m, needs the path.', 'distance_for_displacement'],
        ['s = 0, so the object never moved', 'It moved 25 m out and 25 m back; only the net change in position is zero.', 'both_zero'],
      ], 's is the net change in position.', undefined, 'm33-turn'),
    },
  ],
  investigation: lab(EQ, 'Try it in the Equation Laboratory', 'Edit u, a and the time and watch each equation, both graphs and the model check.', 'Open the Equation Laboratory'),
  worked: {
    id: 'w-pm-l9', title: 'A car that brakes',
    given: ['A car travelling at 18 m/s brakes with a constant deceleration of 3 m/s² until it stops (take the direction of motion as positive).'], ask: 'Find the time to stop and the stopping distance.',
    steps: [
      { text: 'u = +18 m/s, v = 0, a = −3 m/s².', why: 'The acceleration is opposite to the velocity, so it is negative.' },
      { text: 'Time: v = u + at gives 0 = 18 + (−3)t, so t = 18 ÷ 3 = 6 s.', why: 'The time is wanted and u, v, a are known.' },
      { text: 'Distance: v² = u² + 2as gives 0 = 18² + 2(−3)s = 324 − 6s, so s = 54 m.', why: 'The displacement is wanted and the time is not needed.' },
      { text: 'Check with s = ut + ½at² = 18 × 6 + ½(−3)(36) = 108 − 54 = 54 m.', why: 'A second equation must give the same displacement.' },
    ],
    verify: 'The average velocity is (18 + 0) ÷ 2 = 9 m/s and 9 m/s × 6 s = 54 m.',
  },
  guided: {
    id: 'g-pm-l9', prompt: 'A cyclist riding at 6 m/s speeds up uniformly to 10 m/s over a stretch of 16 m.',
    steps: [
      { id: 'g1', prompt: 'Choose the equation.', question: pick('g-pm-l9-1', 'Known: u, v and s. Wanted: a. Which equation connects them without the time?', [
        ['v² = u² + 2as', null],
        ['v = u + at', 'This needs the time t, which is not given.', 'wrong_equation'],
        ['s = ut + ½at²', 'This needs the time t, which is not given.', 'wrong_equation'],
      ], 'Only v² = u² + 2as has no t.', undefined, 'm31-v2'), hints: ['Which equation has no t?'] },
      { id: 'g2', prompt: 'Substitute.', question: numQ('g-pm-l9-2', 'What is v² − u², in m²/s²? (v = 10, u = 6)', 64, 'Square each velocity first: 100 − 36 = 64 m²/s².', { unit: 'm²/s²', refresherId: 'm31-v2', rules: [[[16], '(v − u)² = 16 is not v² − u². Square each velocity first.', 'square_of_difference'], [[4], '4 is the difference v − u. The quantity wanted is the difference of the squares.', 'difference_not_squares']] }), hints: ['Square each velocity, then subtract.'] },
      { id: 'g3', prompt: 'Solve for a.', question: numQ('g-pm-l9-3', 'What is the acceleration, in m/s², from 64 = 2 × a × 16?', 2, 'a = 64 ÷ 32 = 2 m/s².', { unit: 'm/s²', refresherId: 'm31-v2', rules: [[[4], '4 comes from 64 ÷ 16; the factor 2 in 2as must also be divided.', 'forgot_two']] }), hints: ['Divide 64 by 2 × 16.'] },
    ],
    conclusion: 'a = (v² − u²) ÷ 2s = 64 ÷ 32 = 2 m/s².',
  },
  independent: [
    ind('i1', 'v = u + at', 'vuat', 'Speeding up.', numQ('pm-l9-i1', 'An object has u = 3 m/s and a = 2 m/s². What is v after 6 s, in m/s?', 15, 'v = 3 + 2 × 6 = 15 m/s.', { unit: 'm/s', refresherId: 'm29-vuat', rules: [[[12], '12 is only at. Add u = 3.', 'change_for_velocity']] }), ['v = u + at.'], ['15 m/s.']),
    ind('i2', 'v = u + at', 'vuat', 'Slowing down.', numQ('pm-l9-i2', 'An object has u = 20 m/s and a = −4 m/s². What is v after 3 s, in m/s?', 8, 'v = 20 + (−4)(3) = 8 m/s.', { unit: 'm/s', refresherId: 'm29-vuat', rules: [[[32], '32 adds the 12 instead of subtracting it: the acceleration is negative.', 'sign_error']] }), ['The acceleration is negative.'], ['8 m/s.']),
    ind('i3', 'v = u + at', 'vuat', 'Find the time.', numQ('pm-l9-i3', 'An object starts from rest and accelerates at 3 m/s² to 24 m/s. How long does it take, in seconds?', 8, 't = (v − u) ÷ a = 24 ÷ 3 = 8 s.', { unit: 's', refresherId: 'm29-vuat', rules: [[[72], '72 multiplies 24 × 3. Divide the change in velocity by the acceleration.', 'multiplied_not_divided']] }), ['Rearrange v = u + at.'], ['8 s.']),
    ind('i4', 's = ut + ½at²', 'suat', 'From rest.', numQ('pm-l9-i4', 'A car starts from rest and accelerates at 2 m/s² for 6 s. What is its displacement, in metres?', 36, 's = 0 + ½ × 2 × 36 = 36 m.', { unit: 'm', refresherId: 'm30-suat', rules: [[[72], '72 forgets the ½ in ½at².', 'forgot_half'], [[12], '12 is the velocity gain at, not a displacement.', 'velocity_for_displacement']] }), ['u = 0, so only ½at² remains.'], ['36 m.']),
    ind('i5', 's = ut + ½at²', 'suat', 'Slowing down.', numQ('pm-l9-i5', 'An object has u = 10 m/s and a = −2 m/s². What is its displacement after 4 s, in metres?', 24, 's = 10 × 4 + ½(−2)(16) = 40 − 16 = 24 m.', { unit: 'm', refresherId: 'm30-suat', rules: [[[56], '56 adds the second term. With a negative acceleration it is subtracted.', 'sign_error'], [[40], '40 is only ut. Subtract the 16 m lost to the deceleration.', 'forgot_half_at2']] }), ['Keep the sign of a.'], ['24 m.']),
    ind('i6', 's = ut + ½at²', 'suat', 'Leftward motion.', numQ('pm-l9-i6', 'An object has u = −4 m/s and a = −2 m/s² (both to the left). What is its displacement after 3 s, in metres (a minus sign for left)?', -21, 's = (−4)(3) + ½(−2)(9) = −12 − 9 = −21 m: 21 m to the left.', { unit: 'm', refresherId: 'm30-suat', rules: [[[21], 'The motion is to the left, so the displacement is negative.', 'sign_dropped'], [[-3], '−3 comes from −12 + 9: the acceleration term is also negative.', 'sign_error']] }), ['Substitute with the minus signs.'], ['−21 m.']),
    ind('i7', 'v² = u² + 2as', 'v2', 'From rest.', numQ('pm-l9-i7', 'An object starts from rest and accelerates at 5 m/s² over a displacement of 40 m. What is its final speed, in m/s?', 20, 'v² = 0 + 2 × 5 × 40 = 400, so v = 20 m/s.', { unit: 'm/s', refresherId: 'm31-v2', rules: [[[400], '400 is v². Take the square root.', 'v_squared_for_v']] }), ['Find v², then the square root.'], ['20 m/s.']),
    ind('i8', 'v² = u² + 2as', 'v2', 'Stopping distance.', numQ('pm-l9-i8', 'A car at 15 m/s brakes at 3 m/s² to rest. What is the stopping distance, in metres?', 37.5, '0 = 225 − 6s, so s = 37.5 m.', { unit: 'm', refresherId: 'm31-v2', rules: [[[5], '5 s is the time (15 ÷ 3), not the distance.', 'time_for_distance'], [[75], '75 forgets the factor 2 in 2as.', 'forgot_two']] }), ['v = 0, a = −3.'], ['37.5 m.']),
    ind('i9', 'v² = u² + 2as', 'v2', 'Find a.', numQ('pm-l9-i9', 'A cyclist speeds up from 6 m/s to 10 m/s over 16 m. What is the acceleration, in m/s²?', 2, 'a = (100 − 36) ÷ (2 × 16) = 2 m/s².', { unit: 'm/s²', refresherId: 'm31-v2', rules: [[[4], 'Divide by 2s = 32, not by s = 16.', 'forgot_two']] }), ['Rearrange v² = u² + 2as.'], ['2 m/s².']),
    ind('i10', 'Choosing', 'choose', 'Which equation?', pick('pm-l9-i10', 'Known: u, a and t. Wanted: the displacement s. Which equation is the direct choice?', [
      ['s = ut + ½at²', null],
      ['v² = u² + 2as', 'This needs v, which is not given (and not wanted).', 'wrong_equation'],
      ['v = u + at', 'This gives v, not s.', 'wrong_equation'],
    ], 'It contains exactly u, a, t and s.', undefined, 'm32-assume'), ['Which equation contains s, u, a, t and not v?'], ['s = ut + ½at².']),
    ind('i11', 'Choosing', 'choose', 'Changing acceleration.', pick('pm-l9-i11', 'A train accelerates at 1 m/s² for 10 s, then at 0.5 m/s² for 20 s. To find its final velocity from rest you should:', [
      ['use v = u + at on each stage separately', null],
      ['use v = u + at once with a = 1 m/s² and t = 30 s', 'The acceleration is not constant over the 30 s, so a single use is wrong.', 'equations_always'],
      ['use v = u + at once with a = 0.75 m/s² and t = 30 s', 'The mean of the two accelerations is not correct here because the stages last different times; and each stage should be handled separately.', 'mean_of_accelerations'],
    ], 'Constant acceleration only: stage by stage (10 + 10 = 20 m/s).', undefined, 'm32-assume'), ['Does the acceleration stay constant?'], ['Stage by stage.']),
    ind('i12', 'Choosing', 'choose', 'Turning back.', pick('pm-l9-i12', 'An object with u = +10 m/s and a = −2 m/s² is back at its start after 10 s. Which statement is correct?', [
      ['s = 0 from the equation, but the distance travelled is 50 m', null],
      ['s = 50 m, the distance', 'The equation gives the displacement, which is zero here.', 'distance_for_displacement'],
    ], 's is the net change in position.', undefined, 'm33-turn'), ['What does s mean?'], ['s = 0, distance 50 m.']),
  ],
  reflection: {
    discover: 'For a constant acceleration in a straight line: v = u + at, s = ut + ½at² and v² = u² + 2as. They follow from the slope and the area of the velocity–time graph. s is the displacement; keep the signs; never use them across a change of acceleration.',
    evidence: 'You used each equation, chose between them from what was given and wanted, and met the limits: changing acceleration and turning back.',
    stillConfusing: [{ text: 'Where does v = u + at come from?', refresherId: 'm29-vuat' }, { text: 'Where does s = ut + ½at² come from?', refresherId: 'm30-suat' }, { text: 'When do I use v² = u² + 2as?', refresherId: 'm31-v2' }, { text: 'When can I not use them?', refresherId: 'm32-assume' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 10: Uniform circular motion  (Section 4.4.1)
// ---------------------------------------------------------------------------

const circ = (t: number, intro: string, o: { editable?: boolean } = {}) => circleVisual({ radiusM: 10, periodS: 20, spin: 'counterclockwise', startTime: t, editable: o.editable }, intro);

export const L10: EduLesson = {
  id: 'pm-l10', unitId: 'pm-unit-5', number: 10, title: 'Uniform circular motion',
  objective: 'describe motion at constant speed on a circle: its speed, the changing direction of its velocity, and its distance and displacement.',
  prerequisiteIds: ['pmp-units', 'pmp-circle'],
  objectives: [
    { id: 'path', label: 'Find distance (arc) and displacement (chord) on a circle' },
    { id: 'velocity', label: 'Explain why the velocity changes while the speed does not' },
    { id: 'speedvel', label: 'Compare average speed and average velocity on a circle' },
  ],
  steps: [
    {
      id: 'm34-circle', title: 'Constant speed on a circle', phase: 'observe',
      paragraphs: [
        'Motion does not have to be along a straight line. When an object moves in a circle at a constant speed, its motion is uniform circular motion. The time for one complete turn is the period T.',
        'In one turn the object travels once round the circumference, 2πr. So its speed is v = 2πr ÷ T. For r = 10 m and T = 20 s: circumference = 2 × 3.14 × 10 = 62.8 m, so v = 62.8 ÷ 20 = 3.14 m/s. We use π = 3.14.',
      ],
      vocabulary: [{ term: 'period T', meaning: 'the time for one complete turn' }, { term: 'circumference', meaning: 'the length of the circle, 2πr' }],
      visual: circ(5, 'Radius 10 m, period 20 s, counter-clockwise: the object after a quarter turn.', { editable: true }),
      notice: 'Play the motion and read the speed readout at several times. Does it ever change?',
      check: pick('chk-m34-circle', 'An object goes once round a circle of radius 10 m in 20 s. What is its speed?', [
        ['3.14 m/s', null],
        ['0 m/s, because it comes back to the start', 'It never stops moving: it travels 62.8 m in 20 s. Zero is its average velocity, not its speed.', 'zero_speed_return'],
        ['0.32 m/s', '0.32 comes from 20 ÷ 62.8, which is inverted. Speed is distance ÷ time.', 'inverted_ratio'],
      ], '2 × 3.14 × 10 ÷ 20 = 3.14 m/s.', undefined, 'm34-circle'),
    },
    {
      id: 'm35-vel', title: 'The velocity keeps changing direction', phase: 'conjecture',
      paragraphs: [
        'At every point of the circle the velocity points along the tangent, the direction in which the object is heading at that instant. As the object goes round, the tangent turns, so the direction of the velocity changes continuously.',
        'The speed (the size of the velocity) stays the same, but the velocity is a quantity with direction, so the velocity is changing all the time. A changing velocity means the object is accelerating, even though its speed is constant. For circular motion this acceleration points towards the centre. In Class 9 you only need the idea, not a formula for its size.',
      ],
      visual: circ(0, 'At the start the object is at the right-hand end of the circle moving counter-clockwise: its velocity points straight up.', { editable: true }),
      notice: 'Move the time and watch the velocity arrow. Which way does it point at the start, after a quarter turn and after half a turn?',
      misconception: { wrong: 'If the speed is constant, the velocity is constant and there is no acceleration.', right: 'Velocity includes direction. On a circle the direction keeps changing, so the velocity changes even though the speed does not.' },
      check: pick('chk-m35-vel', 'An object moves round a circle at a constant 3 m/s. Which statement is true?', [
        ['Its speed is constant but its velocity is changing', null],
        ['Its velocity is constant, because its speed is constant', 'Velocity has a direction, which changes at every point of the circle.', 'constant_speed_constant_velocity'],
        ['Its speed is changing, because its direction changes', 'The speed is the size of the velocity, which stays at 3 m/s.', 'direction_changes_speed'],
      ], 'Speed is the size; velocity includes direction.', undefined, 'm35-vel'),
    },
    {
      id: 'm36-dist', title: 'Distance along the arc, displacement along the chord', phase: 'reasoning',
      paragraphs: [
        'LabVerse enrichment (the textbook discusses motion in a circle qualitatively). The distance travelled is the length of the arc the object has covered. The displacement is the straight line from the starting point to where the object is now. It is a two-dimensional quantity with a direction, not a number on a line.',
        'After half a turn on a circle of radius 10 m the distance is half the circumference, 31.4 m, but the displacement is the diameter, 20 m. After a full turn the distance is 62.8 m and the displacement is zero. The size of the displacement is never more than the distance.',
      ],
      visual: circ(10, 'Half a turn on the circle of radius 10 m: the arc is 31.4 m and the straight displacement is the 20 m diameter.', { editable: true }),
      notice: 'Use the buttons for half a turn and one full turn and compare the distance and displacement readouts.',
      check: pick('chk-m36-dist', 'An object goes half way round a circle of radius 10 m. What is its displacement?', [
        ['20 m, the diameter, in a straight line from the start to the opposite point', null],
        ['31.4 m, half the circumference', '31.4 m is the distance along the arc. The displacement is the straight line between the two points.', 'arc_for_displacement'],
        ['10 m, the radius', 'The start and the end are opposite ends of a diameter, 2 × 10 m apart.', 'radius_for_displacement'],
      ], 'The chord of a half turn is the diameter.', undefined, 'm36-dist'),
    },
    {
      id: 'm37-speedvel', title: 'Average speed and average velocity on a circle', phase: 'apply',
      paragraphs: ['Average speed = distance ÷ time and average velocity = displacement ÷ time (in the direction of the displacement). After one full turn of the circle of radius 10 m, period 20 s: average speed = 62.8 ÷ 20 = 3.14 m/s, but the displacement is zero, so the average velocity is zero. The object has been moving at 3.14 m/s the whole time; its velocity just points back where it began.'],
      visual: circ(20, 'One full turn: the object is back at the start.', { editable: true }),
      notice: 'After one full turn compare the average speed with the average velocity.',
      check: pick('chk-m37-speedvel', 'After one full turn, which is true?', [
        ['The average speed is 3.14 m/s and the average velocity is zero', null],
        ['Both are zero', 'The average speed uses the distance, 62.8 m, which is not zero.', 'both_zero'],
        ['Both are 3.14 m/s', 'The displacement is zero, so the average velocity is zero.', 'velocity_equals_speed'],
      ], 'Distance is not zero; displacement is.', undefined, 'm37-speedvel'),
    },
  ],
  investigation: lab(CIRC, 'Try it in the Uniform Circular Motion lab', 'Change the radius, the period and the direction and compare distance with displacement.', 'Open the circular motion lab'),
  worked: {
    id: 'w-pm-l10', title: 'A runner on a circular track',
    given: ['A runner goes round a circular track of radius 50 m once in 157 s at a constant speed (use π = 3.14).'], ask: 'Find the speed, and the distance and displacement after half a lap and after one lap.',
    steps: [
      { text: 'Circumference = 2πr = 2 × 3.14 × 50 = 314 m.', why: 'One lap is once round the circumference.' },
      { text: 'Speed = 314 m ÷ 157 s = 2 m/s.', why: 'Speed = distance ÷ time, constant on a circle in uniform motion.' },
      { text: 'Half a lap: distance = 157 m; displacement = the diameter = 100 m.', why: 'The arc is half the circumference; the straight line between opposite points is the diameter.' },
      { text: 'One lap: distance = 314 m; displacement = 0.', why: 'The runner is back at the start.' },
      { text: 'Average speed over one lap = 314 ÷ 157 = 2 m/s; average velocity = 0 ÷ 157 = 0.', why: 'Average velocity uses the displacement.' },
    ],
    verify: 'The speed is 2 m/s throughout, yet the velocity changes direction at every point, so the average velocity over a full lap is zero.',
  },
  guided: {
    id: 'g-pm-l10', prompt: 'An object moves on a circle of radius 10 m with a period of 20 s (use π = 3.14).',
    visual: circ(0, 'Radius 10 m, period 20 s.', { editable: true }),
    steps: [
      { id: 'g1', prompt: 'The speed.', question: numQ('g-pm-l10-1', 'What is the speed, in m/s?', 3.14, '2 × 3.14 × 10 ÷ 20 = 3.14 m/s.', { unit: 'm/s', tolerance: 0.02, refresherId: 'm34-circle', rules: [[[62.8], '62.8 m is the circumference. Divide by the 20 s.', 'distance_for_speed']] }), hints: ['2πr ÷ T.'] },
      { id: 'g2', prompt: 'A quarter turn.', question: numQ('g-pm-l10-2', 'What distance does it travel in 5 s (a quarter turn), in metres?', 15.7, 'Quarter of 62.8 m = 15.7 m.', { unit: 'm', tolerance: 0.1, refresherId: 'm34-circle', rules: [[[62.8], '62.8 m is the whole circumference.', 'whole_for_part']] }), hints: ['5 s is a quarter of the period.'] },
      { id: 'g3', prompt: 'Half a turn.', question: numQ('g-pm-l10-3', 'What is the size of the displacement after 10 s (half a turn), in metres?', 20, 'The diameter: 2 × 10 = 20 m.', { unit: 'm', refresherId: 'm36-dist', rules: [[[31.4], '31.4 m is the arc length. The displacement is the straight line.', 'arc_for_displacement'], [[10], '10 m is only the radius.', 'radius_for_displacement']] }), hints: ['The straight line between opposite points.'] },
    ],
    conclusion: 'The speed is 3.14 m/s; after 5 s the distance is 15.7 m; after 10 s the displacement is 20 m.',
  },
  independent: [
    ind('i1', 'Distance and displacement', 'path', 'Quarter turn.', numQ('pm-l10-i1', 'An object goes a quarter of the way round a circle of radius 10 m (circumference 62.8 m). What distance does it travel, in metres?', 15.7, '62.8 ÷ 4 = 15.7 m.', { unit: 'm', tolerance: 0.1, refresherId: 'm36-dist', rules: [[[62.8], '62.8 m is the whole circle.', 'whole_for_part']] }), ['A quarter of the circumference.'], ['15.7 m.']),
    ind('i2', 'Distance and displacement', 'path', 'Half turn.', numQ('pm-l10-i2', 'The same object goes half way round. What is the size of its displacement, in metres?', 20, 'The diameter, 20 m.', { unit: 'm', refresherId: 'm36-dist', rules: [[[31.4], '31.4 m is the distance along the arc.', 'arc_for_displacement']] }), ['Start and end are opposite points.'], ['20 m.']),
    ind('i3', 'Distance and displacement', 'path', 'Full turn.', numQ('pm-l10-i3', 'After one complete turn, what is the displacement, in metres?', 0, 'The object is back at the start: displacement 0.', { unit: 'm', refresherId: 'm36-dist', rules: [[[62.8], '62.8 m is the distance. The displacement is the net change in position.', 'distance_for_displacement']] }), ['Where is the object after one full turn?'], ['0 m.']),
    ind('i4', 'Velocity', 'velocity', 'What changes?', pick('pm-l10-i4', 'In uniform circular motion, which quantity stays constant?', [
      ['The speed', null],
      ['The velocity', 'The direction of the velocity changes continuously, so the velocity is not constant.', 'constant_speed_constant_velocity'],
      ['The direction of motion', 'The direction turns all the time.', 'constant_direction'],
    ], 'The size of the velocity is constant.', undefined, 'm35-vel'), ['Which of the three has a direction?'], ['The speed.']),
    ind('i5', 'Velocity', 'velocity', 'At the start.', pick('pm-l10-i5', 'An object moves counter-clockwise on a circle and passes the right-hand end of the circle. In which direction does its velocity point?', [
      ['Straight up, along the tangent', null],
      ['Towards the centre (left)', 'The centre is to the left, but the velocity is along the tangent. The direction towards the centre is the direction of the acceleration.', 'velocity_toward_centre'],
      ['Straight along the radius, away from the centre', 'The velocity is along the tangent, at right angles to the radius.', 'velocity_along_radius'],
    ], 'The velocity is tangent to the circle.', circ(0, 'The object at the right-hand end of the circle moving counter-clockwise.'), 'm35-vel'), ['At right angles to the radius.'], ['Up.']),
    ind('i6', 'Velocity', 'velocity', 'Accelerating?', pick('pm-l10-i6', 'An object moves at a constant speed on a circle. Is it accelerating?', [
      ['Yes: its velocity changes direction, so it is accelerating (towards the centre)', null],
      ['No: its speed is constant', 'Acceleration is a change of velocity, and velocity includes direction.', 'constant_speed_no_acceleration'],
    ], 'A changing direction is a changing velocity.', undefined, 'm35-vel'), ['Is the velocity constant?'], ['Yes.']),
    ind('i7', 'Speed and velocity', 'speedvel', 'Average speed.', numQ('pm-l10-i7', 'For one full turn of the circle of radius 10 m in 20 s, what is the average speed, in m/s (π = 3.14)?', 3.14, '62.8 ÷ 20 = 3.14 m/s.', { unit: 'm/s', tolerance: 0.02, refresherId: 'm37-speedvel', rules: [[[0], '0 m/s is the average velocity. The average speed uses the distance, 62.8 m.', 'both_zero']] }), ['Distance ÷ time.'], ['3.14 m/s.']),
    ind('i8', 'Speed and velocity', 'speedvel', 'Average velocity.', numQ('pm-l10-i8', 'For the same full turn, what is the size of the average velocity, in m/s?', 0, 'The displacement is zero, so the average velocity is 0.', { unit: 'm/s', refresherId: 'm37-speedvel', rules: [[[3.14], '3.14 m/s is the average speed. The displacement is zero.', 'velocity_equals_speed']] }), ['Displacement ÷ time.'], ['0 m/s.']),
    ind('i9', 'Speed and velocity', 'speedvel', 'Compare.', pick('pm-l10-i9', 'After half a turn the distance is 31.4 m and the displacement is 20 m. How do the average speed and the size of the average velocity compare?', [
      ['The average speed is greater, because the path is curved', null],
      ['They are equal', 'They are equal only when the object moves in a straight line without turning back. Here the path curves.', 'velocity_equals_speed'],
      ['The average velocity is greater', 'The size of the displacement can never exceed the distance.', 'velocity_larger'],
    ], 'Displacement ≤ distance.', undefined, 'm37-speedvel'), ['Compare 20 m with 31.4 m.'], ['The average speed is greater.']),
  ],
  reflection: {
    discover: 'In uniform circular motion the speed is constant (2πr ÷ T), but the velocity points along the tangent and keeps changing direction, so the object is accelerating (towards the centre). The distance is the arc, the displacement the straight chord, and after a full turn the displacement and the average velocity are zero.',
    evidence: 'You changed the radius and period, read speed and distance from the model, and compared the arc and the chord at a quarter, a half and a full turn.',
    stillConfusing: [{ text: 'What is the speed on a circle?', refresherId: 'm34-circle' }, { text: 'Why does the velocity change?', refresherId: 'm35-vel' }, { text: 'Distance or displacement?', refresherId: 'm36-dist' }, { text: 'Average speed and velocity?', refresherId: 'm37-speedvel' }],
  },
};
