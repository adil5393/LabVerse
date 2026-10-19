/**
 * Chapter Practice for "Describing Motion Around Us" (PHY-1E): 28 original questions across the whole chapter.
 * None repeats a lesson question or an NCERT exercise; none needs a prerequisite or a login; each is shown once,
 * so nothing here can be repeated to manufacture mastery. Practice results are shown to the student only: they
 * are not written to the learning-progress store and never change a lesson's mastery.
 * Numerical answers are checked against hand calculations in the tests.
 */

import type { Question } from '../../education/types';
import { graphVisual, numQ, pick } from './learn/questions';

export type PracticeCategory = 'concept' | 'numerical' | 'graph' | 'prediction' | 'errors' | 'comparison' | 'circular';

export const PRACTICE_CATEGORIES: { id: PracticeCategory; title: string; blurb: string }[] = [
  { id: 'concept', title: 'Concept checks', blurb: 'Ideas about position, distance, displacement, speed, velocity and acceleration.' },
  { id: 'numerical', title: 'Numerical questions', blurb: 'Calculate with units and signs.' },
  { id: 'graph', title: 'Graph interpretation', blurb: 'Read positions, velocities and areas from graphs.' },
  { id: 'prediction', title: 'Predict, then check', blurb: 'Decide what will happen before you try it in a laboratory.' },
  { id: 'errors', title: 'Spot the sign or unit error', blurb: 'Find what went wrong in a worked answer.' },
  { id: 'comparison', title: 'Compare two motions', blurb: 'Decide which motion covers more, or whether two are equal.' },
  { id: 'circular', title: 'Circular-motion reasoning', blurb: 'Constant speed, changing velocity, arcs and chords.' },
];

export interface PracticeItem { id: string; category: PracticeCategory; question: Question; lessonId: string }

const item = (category: PracticeCategory, lessonId: string, question: Question): PracticeItem => ({ id: question.id, category, question, lessonId });
const g = (scenario: string, intro: string, graphs: ('xt' | 'vt' | 'at')[]) => graphVisual({ scenario, graphs }, intro);

export const PRACTICE_ITEMS: PracticeItem[] = [
  // ---- concept checks ----
  item('concept', 'pm-l3', pick('pr-c1', 'A ball is thrown straight up and caught at the same height from which it was thrown. For the whole trip which quantity is zero?', [
    ['The displacement', null],
    ['The distance travelled', 'The ball travelled up and down, so the path length is not zero.', 'both_zero'],
    ['The speed', 'The ball was moving during the trip, so its average speed is not zero.', 'zero_speed_return'],
  ], 'Same start and end heights: zero displacement.')),
  item('concept', 'pm-l5', pick('pr-c2', 'Which of these quantities can be negative?', [
    ['Velocity', null],
    ['Distance travelled', 'A length of path is never negative.', 'negative_distance'],
    ['Speed', 'Speed is distance divided by time, so it is never negative.', 'negative_speed'],
  ], 'Only quantities with a direction carry a sign.')),
  item('concept', 'pm-l5', pick('pr-c3', 'One car drives north at 60 km/h and another drives east at 60 km/h. Which statement is correct?', [
    ['Same speed, different velocities', null],
    ['Same velocity', 'Velocity includes direction, and the directions are different.', 'speed_means_velocity'],
    ['Different speeds', 'Both speedometers read 60 km/h.', 'speed_has_direction'],
  ], 'Speed has no direction; velocity has.')),
  item('concept', 'pm-l6', pick('pr-c4', 'An object moves at a constant velocity for 10 s. What is its change in velocity in that time?', [
    ['Zero', null],
    ['Equal to its velocity', 'Constant velocity means the velocity does not change at all.', 'velocity_is_acceleration'],
    ['It cannot be found without the distance', 'The velocity does not change, so the change is zero.', 'needs_more_data'],
  ], 'Constant velocity means zero acceleration.')),

  // ---- numerical ----
  item('numerical', 'pm-l4', numQ('pr-n1', 'A train covers 540 km in 6 hours at a steady speed. What is its speed in m/s?', 25, '540 ÷ 6 = 90 km/h, and 90 ÷ 3.6 = 25 m/s.', { unit: 'm/s', rules: [[[90], '90 is the speed in km/h. Change it to m/s by dividing by 3.6.', 'unit_ignored'], [[324], '324 comes from multiplying by 3.6; divide to go from km/h to m/s.', 'wrong_conversion_direction']] })),
  item('numerical', 'pm-l6', numQ('pr-n2', 'A cyclist speeds up from 2 m/s to 12 m/s in 5 s. What is the average acceleration, in m/s²?', 2, '(12 − 2) ÷ 5 = 2 m/s².', { unit: 'm/s²', rules: [[[10], '10 m/s is the change in velocity. Divide by the time.', 'change_for_acceleration'], [[2.8], '2.8 comes from 14 ÷ 5; use the change 12 − 2.', 'sign_error']] })),
  item('numerical', 'pm-l9', numQ('pr-n3', 'A stone slides on ice with an initial speed of 12 m/s and a constant deceleration of 1.5 m/s². How far does it slide before stopping, in metres?', 48, '0 = 144 − 3s, so s = 48 m.', { unit: 'm', rules: [[[8], '8 s is the time to stop, not the distance.', 'time_for_distance'], [[96], '96 comes from dividing 144 by 1.5. The equation is 0 = 144 − 2 × 1.5 × s, so divide by 3.', 'forgot_two']] })),
  item('numerical', 'pm-l5', numQ('pr-n4', 'A jogger runs 300 m east in 100 s and then 60 m west in 50 s. What is her average velocity for the whole trip, in m/s (east is positive)?', 1.6, 'Displacement = 300 − 60 = +240 m over 150 s: 1.6 m/s east.', { unit: 'm/s', rules: [[[2.4], '2.4 m/s is the average speed (360 m ÷ 150 s). The velocity uses the displacement.', 'velocity_equals_speed'], [[2], '2 comes from dividing by the time of only one stage; use the whole 150 s.', 'partial_time']] })),

  // ---- graph interpretation ----
  item('graph', 'pm-l8', numQ('pr-g1', 'The figure shows an object with velocity +16 m/s and acceleration −2 m/s². What displacement does it have in the first 4 s, in metres?', 48, 'Area under the v–t graph from 0 to 4 s: ½ × (16 + 8) × 4 = 48 m.', { unit: 'm', rules: [[[64], '64 m is the distance it would cover at a steady 16 m/s. The velocity falls, so the area is smaller.', 'rectangle_for_trapezoid']], visual: g('slow-down', 'Velocity +16 m/s, acceleration −2 m/s².', ['vt', 'xt']) })),
  item('graph', 'pm-l7', numQ('pr-g2', 'In the figure the object starts with 2 m/s and accelerates at 2 m/s². Read its position at t = 8 s, in metres.', 80, 'The position–time graph passes through (8 s, 80 m): x = 2 × 8 + ½ × 2 × 64 = 80 m.', { unit: 'm', rules: [[[18], '18 m/s is the velocity at 8 s, not the position.', 'velocity_for_position']], visual: g('speed-up', 'Start velocity 2 m/s, acceleration 2 m/s².', ['xt', 'vt']) })),
  item('graph', 'pm-l8', numQ('pr-g3', 'In the figure the velocity passes through zero at one instant. At what time, in seconds, does the object turn back?', 5, 'The velocity–time graph crosses the axis at t = 5 s, where v = 10 − 2t = 0.', { unit: 's', rules: [[[10], '10 s is the end of the motion. The object turns back where the graph crosses the time axis.', 'end_for_turn']], visual: g('reversal', 'LabVerse enrichment: velocity +10 m/s, acceleration −2 m/s².', ['vt', 'xt']) })),
  item('graph', 'pm-l7', pick('pr-g4', 'The position–time graph of an object is a horizontal line. What does its velocity–time graph look like?', [
    ['A line lying on the time axis (velocity zero)', null],
    ['A horizontal line above the time axis', 'A horizontal position–time graph means the object is at rest, so its velocity is zero, not a positive constant.', 'horizontal_means_constant'],
    ['A line sloping upwards', 'A sloping velocity–time graph means acceleration; an object at rest has none.', 'sloping_means_constant'],
  ], 'Zero slope of x–t means zero velocity.', g('rest', 'An object at rest at +20 m.', ['xt', 'vt']))),

  // ---- prediction ----
  item('prediction', 'pm-l6', numQ('pr-p1', 'Predict: an object has velocity +6 m/s and a constant acceleration of −2 m/s². What is its velocity after 3 s, in m/s?', 0, 'v = 6 + (−2)(3) = 0 m/s. It is momentarily at rest.', { unit: 'm/s', rules: [[[12], '12 comes from adding 2 × 3 instead of subtracting it.', 'sign_error']] })),
  item('prediction', 'pm-l7', pick('pr-p2', 'Predict the position–time graph of an object that starts from rest and has a constant positive acceleration.', [
    ['A curve that starts flat and gets steeper', null],
    ['A straight line sloping upwards', 'A straight line means a constant velocity. Here the velocity keeps increasing.', 'curve_means_constant'],
    ['A horizontal line', 'The object is moving, so the position changes.', 'curve_means_rest'],
  ], 'The slope (velocity) increases from zero.')),
  item('prediction', 'pm-l8', pick('pr-p3', 'A ball rolls up a slope and back down along a straight line (up the slope is positive). Predict the sign of its velocity just after it turns back.', [
    ['Negative', null],
    ['Positive', 'It is now moving down the slope, which is the negative direction.', 'sign_dropped'],
    ['Zero', 'The velocity is zero only at the instant of turning, not after it.', 'zero_velocity_zero_acceleration'],
  ], 'Moving in the negative direction means negative velocity.')),
  item('prediction', 'pm-l9', numQ('pr-p4', 'Predict: a car brakes with the same constant deceleration. By what factor does the braking distance change if the initial speed is doubled?', 4, 's = u² ÷ 2|a|, so doubling u multiplies s by 2² = 4.', { rules: [[[2], '2 would be right if s were proportional to u. It depends on u², so the factor is 4.', 'linear_for_square']] })),

  // ---- sign or unit errors ----
  item('errors', 'pm-l6', pick('pr-e1', 'A student finds the acceleration of a car slowing from 20 m/s to 8 m/s in 4 s and writes +3 m/s². What is the error?', [
    ['The sign: the velocity falls, so the acceleration is −3 m/s²', null],
    ['The size: it should be 12 m/s²', '12 m/s is the change in velocity; 12 ÷ 4 = 3 is the size.', 'change_for_acceleration'],
    ['Nothing: slowing down gives a positive acceleration', 'Slowing down in the positive direction means the acceleration is negative.', 'sign_dropped'],
  ], '(8 − 20) ÷ 4 = −3 m/s².')),
  item('errors', 'pm-l4', numQ('pr-e2', 'Convert 108 km/h to m/s.', 30, '108 ÷ 3.6 = 30 m/s.', { unit: 'm/s', rules: [[[388.8], '388.8 comes from multiplying by 3.6. Divide to change km/h to m/s.', 'wrong_conversion_direction']] })),
  item('errors', 'pm-l9', pick('pr-e3', 'A student finds the displacement for u = 5 m/s, a = 2 m/s², t = 4 s as 5 × 4 + 2 × 16 = 52 m. What is wrong?', [
    ['The factor ½ is missing from ½at²: the correct value is 36 m', null],
    ['The initial velocity should not be used', 'The ut term is needed: it is the displacement at the initial velocity alone.', 'forgot_u'],
    ['The time should not be squared', 'The time is squared in ½at²; the missing factor is ½.', 'forgot_square'],
  ], '20 + ½ × 2 × 16 = 36 m.')),
  item('errors', 'pm-l6', pick('pr-e4', 'A student writes that the acceleration of a car is 6 m/s. What is wrong?', [
    ['The unit: acceleration is measured in m/s², not m/s', null],
    ['The size: it must be less than 1', 'There is no such limit; the issue is the unit.', 'size_error'],
    ['The direction: acceleration has no direction', 'Acceleration has a direction, shown by its sign. The error is the unit.', 'acceleration_has_no_direction'],
  ], 'Acceleration is a change of velocity per second: m/s per s = m/s².')),

  // ---- comparisons ----
  item('comparison', 'pm-l4', pick('pr-m1', 'Car A moves at 30 m/s for 10 s. Car B moves at 20 m/s for 20 s. Both go in the same direction. Which covers the greater distance?', [
    ['Car B: 400 m against 300 m', null],
    ['Car A, because it is faster', 'The distance depends on speed and time. B travels 20 × 20 = 400 m, A travels 30 × 10 = 300 m.', 'speed_only'],
    ['They cover equal distances', 'The distances are 300 m and 400 m.', 'equal_assumed'],
  ], 'Distance = speed × time.')),
  item('comparison', 'pm-l8', numQ('pr-m2', 'Car A accelerates from rest at 2 m/s² for 10 s. Car B moves at a constant 10 m/s for 10 s. How much farther does B travel than A, in metres?', 0, 'A: ½ × 2 × 100 = 100 m. B: 10 × 10 = 100 m. They cover the same distance (A\'s average speed is also 10 m/s).', { unit: 'm', rules: [[[100], '100 m is how far each travels; the question asks for the difference.', 'distance_for_difference']] })),
  item('comparison', 'pm-l5', pick('pr-m3', 'Two objects have the same average speed over the same 20 s. Must they have the same displacement?', [
    ['No: they may have turned back by different amounts', null],
    ['Yes: the same average speed means the same displacement', 'Average speed uses the distance; displacement depends on the start and end positions and the turns.', 'velocity_equals_speed'],
  ], 'Equal distances can come with different displacements.')),
  item('comparison', 'pm-l4', numQ('pr-m4', 'Runner P covers 100 m in 12.5 s and runner Q covers 200 m in 25 s. What is the ratio of their average speeds, P : Q (give P ÷ Q)?', 1, 'Both are 8 m/s, so the ratio is 1.', { rules: [[[0.5], '0.5 compares the distances, not the speeds.', 'distance_for_speed'], [[2], '2 compares the times or distances the wrong way round.', 'inverted_ratio']] })),

  // ---- circular-motion reasoning ----
  item('circular', 'pm-l10', pick('pr-r1', 'A cyclist rides at a constant speed round a circular roundabout. Which statement is true?', [
    ['Her speed is constant but her velocity changes', null],
    ['Her velocity is constant because her speed is constant', 'The direction of the velocity keeps changing on a circle.', 'constant_speed_constant_velocity'],
    ['Her speed changes because she turns', 'Turning changes the direction of the velocity, not the speed.', 'direction_changes_speed'],
  ], 'Speed is the size of the velocity; the direction changes.')),
  item('circular', 'pm-l10', numQ('pr-r2', 'An object moves on a circle of radius 20 m with a period of 50 s. What is its speed, in m/s (π = 3.14)?', 2.51, '2 × 3.14 × 20 ÷ 50 = 2.512 m/s.', { unit: 'm/s', tolerance: 0.02, rules: [[[125.6], '125.6 m is the circumference. Divide by the 50 s.', 'distance_for_speed']] })),
  item('circular', 'pm-l10', numQ('pr-r3', 'For the same circle, what is the size of the displacement after half a turn, in metres?', 40, 'The diameter: 2 × 20 = 40 m.', { unit: 'm', rules: [[[62.8], '62.8 m is the arc length. The displacement is the straight line.', 'arc_for_displacement'], [[20], '20 m is only the radius.', 'radius_for_displacement']] })),
  item('circular', 'pm-l10', pick('pr-r4', 'After three complete turns of a circle of radius r, which statement is correct?', [
    ['The displacement is zero and the distance is 3 × 2πr', null],
    ['The displacement is 3 × 2πr', 'The object is back at its start, so the displacement is zero.', 'distance_for_displacement'],
    ['Both are zero', 'The distance is the whole path length, 3 × 2πr.', 'both_zero'],
  ], 'Back at the start: zero displacement; the path is three circumferences.')),
];

export const practiceByCategory = (c: PracticeCategory): PracticeItem[] => PRACTICE_ITEMS.filter((i) => i.category === c);
