/**
 * Class 9 Physics, Chapter 4: Unit 2 "Speed and velocity" (PHY-1B), Section 4.1.3.
 * Lesson 4: average speed, uniform and non-uniform motion. Lesson 5: average velocity and the role of direction.
 * Wording, figures and numbers are original. Every number on screen comes from the same path model as Unit 1.
 */

import type { EduLesson } from '../../../education/types';
import { LAB } from './lessons';
import { ind, motionVisual, numQ, pick } from './questions';

const lab = (exp: string, description: string) => ({ title: 'Try it in the Motion Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Motion Laboratory' });

const RANGE: [number, number] = [-70, 100];
const track = (start: number, moves: number[], durations: number[], intro: string, o: { editable?: boolean; show?: ('position' | 'distance' | 'displacement' | 'speed' | 'velocity')[]; stepM?: number } = {}) =>
  motionVisual({ range: RANGE, start, moves, durations, editable: o.editable, show: o.show ?? ['position', 'distance', 'speed'], stepM: o.stepM ?? 10, playback: true }, intro);

// ---------------------------------------------------------------------------
// Lesson 4: Speed  (Section 4.1.3)
// ---------------------------------------------------------------------------

export const L4: EduLesson = {
  id: 'pm-l4', unitId: 'pm-unit-2', number: 4, title: 'Speed: how fast is the distance covered?',
  objective: 'find average speed as total distance divided by the time taken, and tell uniform motion from non-uniform motion.',
  prerequisiteIds: ['pmp-units', 'pmp-rate'],
  objectives: [
    { id: 'avgspeed', label: 'Calculate average speed from distance and time' },
    { id: 'uniform', label: 'Tell uniform from non-uniform motion' },
    { id: 'replay', label: 'Keep the speed of the object apart from the replay speed on screen' },
  ],
  steps: [
    {
      id: 'm11-speed', title: 'Distance in a given time', phase: 'observe',
      paragraphs: [
        'Two cyclists ride 60 m, but one takes 12 s and the other takes 6 s. The one who takes less time is faster. To compare, we find how much distance is covered in each second.',
        'Average speed = total distance travelled ÷ total time taken. Its SI unit is metres per second (m/s). The slow rider: 60 m ÷ 12 s = 5 m/s. The quick rider: 60 m ÷ 6 s = 10 m/s.',
      ],
      vocabulary: [{ term: 'average speed', meaning: 'total distance travelled ÷ total time taken (m/s)' }, { term: 'simulated time', meaning: 'the clock inside the model; it decides the physics' }],
      visual: track(0, [60], [6], 'An object goes from O to +60 m in 6 s.', { show: ['position', 'distance', 'speed'] }),
      notice: 'Step the time forward. How do distance and average speed change as time passes?',
      check: pick('chk-m11-speed', 'A cart travels 60 m in 12 s. What is its average speed?', [
        ['5 m/s', null],
        ['720 m/s', '720 comes from multiplying 60 × 12. Speed divides the distance by the time.', 'multiplied_not_divided'],
        ['0.2 m/s', '0.2 comes from 12 ÷ 60, which divides the time by the distance. Speed is distance ÷ time.', 'inverted_ratio'],
      ], '60 m ÷ 12 s = 5 m/s.', undefined, 'm11-speed'),
    },
    {
      id: 'm12-uniform', title: 'Uniform and non-uniform motion', phase: 'conjecture',
      paragraphs: [
        'If an object covers equal distances in equal intervals of time, however small the intervals, its motion is uniform. If it covers unequal distances in equal intervals of time, the motion is non-uniform.',
        'The object in the figure covers 20 m in each 2 s at first, then 40 m in the next 2 s. In equal intervals of time it covers unequal distances, so its motion is non-uniform. Its average speed over the whole trip is 60 m ÷ 4 s = 15 m/s, a single number that hides the change. Average speed describes a whole trip, not each moment.',
      ],
      visual: track(0, [20, 60], [2, 2], 'An object goes from O to +20 m in 2 s, then to +60 m in the next 2 s.', { show: ['position', 'distance', 'speed'] }),
      notice: 'Compare the distance covered in the first 2 s with the distance covered in the next 2 s.',
      misconception: { wrong: 'If the average speed over a trip is 10 m/s, the object moved at 10 m/s all the time.', right: 'An average is a single number for the whole trip. The object may have moved faster at some times and slower at others.' },
      check: pick('chk-m12-uniform', 'An object covers 5 m in every second. Is its motion uniform?', [
        ['Yes: equal distances in equal intervals of time', null],
        ['No, because it keeps moving', 'Uniform does not mean "at rest". It means equal distances in equal intervals, which holds here.', 'uniform_means_rest'],
        ['It cannot be told without a graph', 'The definition is enough: equal distances in equal times means uniform.', 'needs_graph'],
      ], 'Equal distances in equal intervals: uniform.', undefined, 'm12-uniform'),
    },
    {
      id: 'm13-replay', title: 'The speed of the object is not the replay speed', phase: 'reasoning',
      paragraphs: [
        'When you replay a path on screen you can choose 0.5×, 1× or 2×. That setting only changes how fast the replay runs on your screen. The physical speed of the object is distance ÷ simulated time, and it does not change when you change the replay.',
        'Try it: replay the path at different settings and watch the average speed readout. It depends only on the simulated time on the clock.',
      ],
      visual: track(0, [60], [6], 'An object goes from O to +60 m in 6 s. Use the replay speed setting.', { show: ['position', 'speed'] }),
      notice: 'Switch the replay speed and compare the speed readout at the same simulated time.',
      check: pick('chk-m13-replay', 'You replay a path at 2×. What happens to the object\'s average speed in the model?', [
        ['Nothing: it is still distance ÷ simulated time', null],
        ['It doubles, because it moves twice as fast on screen', 'Replay speed changes only how quickly the picture plays. The simulated distance and time, and so the speed, stay the same.', 'replay_is_speed'],
      ], 'Replay speed is a screen setting, not physics.', undefined, 'm13-replay'),
    },
    {
      id: 'm14-units', title: 'Units: m/s and km/h', phase: 'apply',
      paragraphs: ['The SI unit of speed is m/s, but vehicles often use km/h. 1 km/h = 1000 m ÷ 3600 s = 5/18 m/s, so divide km/h by 3.6 to get m/s and multiply m/s by 3.6 to get km/h. Example: 72 km/h = 72 ÷ 3.6 = 20 m/s.'],
      check: pick('chk-m14-units', 'A train moves at 90 km/h. What is its speed in m/s?', [
        ['25 m/s', null],
        ['324 m/s', '324 comes from multiplying by 3.6. To change km/h to m/s, divide by 3.6.', 'wrong_conversion_direction'],
        ['90 m/s', 'The unit changes the number: 1 km/h is smaller than 1 m/s.', 'unit_ignored'],
      ], '90 ÷ 3.6 = 25 m/s.', undefined, 'm14-units'),
    },
  ],
  investigation: lab('E', 'Predict the average speed of two trips that cover the same distance in different times.'),
  worked: {
    id: 'w-pm-l4', title: 'A cyclist and a scooter',
    given: ['A cyclist covers 300 m in 60 s.', 'A scooter covers 300 m in 20 s.'], ask: 'Find the average speed of each and say which is faster.',
    steps: [
      { text: 'Cyclist: average speed = 300 m ÷ 60 s = 5 m/s.', why: 'Average speed = total distance ÷ total time.' },
      { text: 'Scooter: average speed = 300 m ÷ 20 s = 15 m/s.', why: 'The same formula applies to each.' },
      { text: 'The scooter covers the same distance in less time, so it has the greater average speed (15 m/s against 5 m/s).', why: 'Comparing average speeds compares how much distance is covered each second.' },
    ],
    verify: 'In 1 s the scooter covers 15 m and the cyclist 5 m, and 15 m/s × 20 s = 300 m, as given.',
  },
  guided: {
    id: 'g-pm-l4', prompt: 'A car travels 150 m in 10 s and then 150 m in 5 s on a straight road.',
    steps: [
      { id: 'g1', prompt: 'Total distance.', question: numQ('g-pm-l4-1', 'What is the total distance, in metres?', 300, '150 m + 150 m = 300 m.', { unit: 'm', refresherId: 'm11-speed', rules: [[[150], '150 m is one part. Add both parts.', 'one_leg_only']] }), hints: ['Add the two distances.'] },
      { id: 'g2', prompt: 'Total time.', question: numQ('g-pm-l4-2', 'What is the total time, in seconds?', 15, '10 s + 5 s = 15 s.', { unit: 's', refresherId: 'm11-speed', rules: [[[5], '5 s is only the second part. Add the first part too.', 'one_leg_only'], [[7.5], '7.5 s is the average of the two times. Total time is their sum.', 'average_of_times']] }), hints: ['Add the times.'] },
      { id: 'g3', prompt: 'Average speed.', question: numQ('g-pm-l4-3', 'What is the average speed, in m/s?', 20, '300 m ÷ 15 s = 20 m/s.', { unit: 'm/s', refresherId: 'm11-speed', rules: [[[22.5], '22.5 m/s is the mean of 15 m/s and 30 m/s. Average speed is total distance ÷ total time, which is not the mean of the two speeds when the times differ.', 'mean_of_speeds'], [[0.05], '0.05 divides the time by the distance. Divide the distance by the time.', 'inverted_ratio']] }), hints: ['Use the totals, not the separate speeds.'] },
    ],
    conclusion: 'The total distance is 300 m, the total time is 15 s, so the average speed is 20 m/s.',
  },
  independent: [
    ind('i1', 'Average speed', 'avgspeed', 'One leg.', numQ('pm-l4-i1', 'A runner covers 100 m in 20 s. What is her average speed, in m/s?', 5, '100 ÷ 20 = 5 m/s.', { unit: 'm/s', refresherId: 'm11-speed', rules: [[[0.2], 'You divided the time by the distance. Divide the distance by the time.', 'inverted_ratio'], [[2000], 'Multiplying 100 × 20 gives 2000. Speed is a division.', 'multiplied_not_divided']] }), ['Distance ÷ time.'], ['5 m/s.']),
    ind('i2', 'Average speed', 'avgspeed', 'Two legs.', numQ('pm-l4-i2', 'An object goes 40 m in 5 s and then 60 m in 15 s in the same direction. What is its average speed over the whole trip, in m/s?', 5, 'Total distance 100 m ÷ total time 20 s = 5 m/s.', { unit: 'm/s', refresherId: 'm11-speed', rules: [[[6], '6 m/s is the mean of 8 m/s and 4 m/s, which ignores that more time was spent at the slower speed. Use total distance ÷ total time.', 'mean_of_speeds']] }), ['Add the distances and the times first.'], ['5 m/s.']),
    ind('i3', 'Average speed', 'avgspeed', 'Find the time.', numQ('pm-l4-i3', 'A bus travels at a steady 12 m/s. How long does it take to cover 180 m, in seconds?', 15, 'time = distance ÷ speed = 180 ÷ 12 = 15 s.', { unit: 's', refresherId: 'm11-speed', rules: [[[2160], 'Multiplying 12 × 180 gives 2160. To find the time, divide the distance by the speed.', 'multiplied_not_divided']] }), ['Rearrange speed = distance ÷ time.'], ['15 s.']),
    ind('i4', 'Units', 'avgspeed', 'km/h to m/s.', numQ('pm-l4-i4', 'A car moves at 36 km/h. What is its speed in m/s?', 10, '36 ÷ 3.6 = 10 m/s.', { unit: 'm/s', refresherId: 'm14-units', rules: [[[129.6], '129.6 comes from multiplying by 3.6. Divide to change km/h to m/s.', 'wrong_conversion_direction'], [[36], 'The number changes when the unit changes.', 'unit_ignored']] }), ['Divide by 3.6.'], ['10 m/s.']),
    ind('i5', 'Uniform motion', 'uniform', 'Equal intervals.', pick('pm-l4-i5', 'A ball covers 3 m in the first second, 3 m in the second second and 5 m in the third second. Its motion is:', [
      ['non-uniform: the distances in equal intervals are not all equal', null],
      ['uniform, because it covered some equal distances', 'Uniform needs equal distances in every equal interval. The third second is different.', 'partly_equal'],
    ], 'One unequal interval makes the motion non-uniform.', undefined, 'm12-uniform'), ['Compare the distances in each second.'], ['Non-uniform.']),
    ind('i6', 'Uniform motion', 'uniform', 'What an average hides.', pick('pm-l4-i6', 'A trip has an average speed of 10 m/s. Which statement is certainly true?', [
      ['The total distance divided by the total time is 10 m/s.', null],
      ['The object moved at exactly 10 m/s at every instant.', 'An average does not say what happened at each moment. The object could have been faster at some times and slower at others.', 'average_is_always'],
    ], 'An average describes the whole trip.', undefined, 'm12-uniform'), ['What does an average describe?'], ['The whole trip.']),
    ind('i7', 'Replay', 'replay', 'Screen setting.', pick('pm-l4-i7', 'A student sets the replay to 0.5×. The object seems to move slowly. Did its average speed in the model change?', [
      ['No: the replay setting only changes how fast the picture plays', null],
      ['Yes, it halved', 'Replay speed is a screen setting. The physical speed is distance ÷ simulated time, which did not change.', 'replay_is_speed'],
    ], 'Physical speed uses simulated time.', undefined, 'm13-replay'), ['What does the speed formula use?'], ['No change.']),
    ind('i8', 'Replay', 'replay', 'Same time, same values.', pick('pm-l4-i8', 'You pause a replay at simulated time 4 s once at 0.5× and once at 2×. How do the distance and average speed readouts compare?', [
      ['They are identical: they depend only on the simulated time', null],
      ['They are larger at 2×', 'The replay setting changes how fast the picture plays, not the model. At the same simulated time the values are the same.', 'replay_is_speed'],
    ], 'The model does not depend on the replay setting.', undefined, 'm13-replay'), ['What decides the readouts?'], ['Identical.']),
  ],
  reflection: {
    discover: 'Average speed is the total distance travelled divided by the total time taken, in m/s. Motion is uniform only if equal distances are covered in equal intervals of time. The replay speed on screen is not the speed of the object.',
    evidence: 'You calculated average speed for one-leg and two-leg trips, converted km/h, and told uniform from non-uniform motion.',
    stillConfusing: [{ text: 'How do I find average speed?', refresherId: 'm11-speed' }, { text: 'Uniform or not?', refresherId: 'm12-uniform' }, { text: 'Replay speed?', refresherId: 'm13-replay' }, { text: 'km/h and m/s?', refresherId: 'm14-units' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Velocity  (Section 4.1.3)
// ---------------------------------------------------------------------------

export const L5: EduLesson = {
  id: 'pm-l5', unitId: 'pm-unit-2', number: 5, title: 'Velocity: speed with a direction',
  objective: 'find average velocity as displacement divided by time, give it a sign for direction, and explain how it differs from average speed.',
  prerequisiteIds: ['pmp-signed', 'pmp-rate'],
  objectives: [
    { id: 'avgvel', label: 'Calculate average velocity with its sign' },
    { id: 'compare', label: 'Compare average speed and average velocity' },
    { id: 'direction', label: 'Explain what a change of direction does to velocity' },
  ],
  steps: [
    {
      id: 'm15-vel', title: 'Displacement in a given time', phase: 'observe',
      paragraphs: [
        'Speed uses the distance travelled. Velocity uses the displacement. Average velocity = displacement ÷ time taken. Its unit is also m/s, but it has a direction: positive to the right, negative to the left.',
        'The object in the figure goes from O to −60 m in 10 s. Its displacement is −60 m, so its average velocity is −60 m ÷ 10 s = −6 m/s, which means 6 m/s to the left. Its average speed is 6 m/s.',
      ],
      vocabulary: [{ term: 'average velocity', meaning: 'displacement ÷ time taken, with a direction (m/s)' }],
      visual: track(0, [-60], [10], 'An object goes from O to −60 m in 10 s.', { show: ['position', 'speed', 'velocity'] }),
      notice: 'Compare the sign of the average speed with the sign of the average velocity.',
      check: pick('chk-m15-vel', 'An object goes from O to −40 m in 8 s. What is its average velocity?', [
        ['−5 m/s (5 m/s to the left)', null],
        ['+5 m/s', 'The displacement is to the left, so the velocity is negative.', 'sign_dropped'],
        ['−320 m/s', 'Multiplying −40 × 8 gives −320. Velocity divides the displacement by the time.', 'multiplied_not_divided'],
      ], '−40 ÷ 8 = −5 m/s.', undefined, 'm15-vel'),
    },
    {
      id: 'm16-turn', title: 'Turning back changes the two averages differently', phase: 'conjecture',
      paragraphs: [
        'An object goes from O to +40 m in 4 s and then back to +10 m in 6 s. The distance is 40 + 30 = 70 m, so the average speed is 70 ÷ 10 = 7 m/s. The displacement is +10 m, so the average velocity is +10 ÷ 10 = +1 m/s.',
        'The speed counts every metre of the path, going out and coming back. The velocity counts only the net change in position. When an object turns back the magnitude of the average velocity is smaller than the average speed. They are equal only when the object does not change direction.',
      ],
      visual: track(0, [40, 10], [4, 6], 'An object goes from O to +40 m in 4 s, then back to +10 m in 6 s.', { show: ['position', 'distance', 'displacement', 'speed', 'velocity'] }),
      notice: 'Step through the time. When does the velocity readout change sign? What happens to the average velocity afterwards?',
      misconception: { wrong: 'Velocity is just another word for speed.', right: 'Speed has a size only. Velocity has a size and a direction, so it can be negative or zero while the object is still moving.' },
      check: pick('chk-m16-turn', 'An object goes 40 m right in 4 s, then 30 m left in 6 s. Which statement is correct for the whole trip?', [
        ['The average speed (7 m/s) is greater than the size of the average velocity (1 m/s).', null],
        ['Both are 7 m/s.', 'The velocity uses the displacement (10 m), not the distance (70 m).', 'velocity_equals_speed'],
        ['The average velocity is greater than the average speed.', 'The size of the average velocity can never exceed the average speed, because the displacement is never more than the distance.', 'velocity_larger'],
      ], 'Speed counts the path; velocity counts the net change.', undefined, 'm16-turn'),
    },
    {
      id: 'm17-return', title: 'Back at the start: zero average velocity', phase: 'reasoning',
      paragraphs: [
        'A runner goes 30 m out in 5 s and 30 m back in 5 s. She is back where she started, so her displacement is 0 and her average velocity is 0 m/s. Her average speed is 60 m ÷ 10 s = 6 m/s.',
        'Zero average velocity does not mean the runner was at rest. It means the net change in position was zero.',
      ],
      visual: track(0, [30, 0], [5, 5], 'An object goes from O to +30 m in 5 s and back to O in 5 s.', { show: ['position', 'distance', 'displacement', 'speed', 'velocity'] }),
      notice: 'At the end of the trip, which of the average speed and the average velocity is zero?',
      check: pick('chk-m17-return', 'A cyclist rides round a block and ends where she began. Which is true about the whole trip?', [
        ['Her average velocity is zero, but her average speed is not.', null],
        ['Her average speed is zero, because she is back at the start.', 'Average speed uses distance travelled, which is not zero.', 'both_zero'],
        ['Both are zero.', 'The displacement is zero, but the distance is not, so only the average velocity is zero.', 'both_zero'],
      ], 'Net change zero: average velocity zero.', undefined, 'm17-return'),
    },
    {
      id: 'm18-same', title: 'Same speed, different velocity', phase: 'apply',
      paragraphs: ['Three objects each travel 60 m in 10 s: one straight to the right, one straight to the left, one out and back. All three have an average speed of 6 m/s. Their average velocities are +6 m/s, −6 m/s and 0.', 'So two motions can have the same speed and different velocities. The direction is the difference.'],
      visual: track(0, [-60], [10], 'An object goes from O to −60 m in 10 s: compare with the other two trips in the laboratory.', { show: ['position', 'speed', 'velocity'] }),
      check: pick('chk-m18-same', 'Two cars each have a speed of 20 m/s, one going north and one going south. Which statement is correct?', [
        ['They have the same speed but different velocities.', null],
        ['They have the same velocity.', 'Velocity includes direction, and the directions are opposite.', 'speed_means_velocity'],
        ['Their speeds are different.', 'Both have a speed of 20 m/s: speed has no direction.', 'speed_has_direction'],
      ], 'Same speed, opposite directions: different velocities.', undefined, 'm18-same'),
    },
  ],
  investigation: lab('I', 'Three trips with the same average speed: compare their average velocities.'),
  worked: {
    id: 'w-pm-l5', title: 'Out to the market and part of the way home',
    given: ['A person walks from home (O) to a market 90 m to the right in 60 s, then walks back 30 m towards home in 30 s.'], ask: 'Find the average speed and the average velocity for the whole walk.',
    steps: [
      { text: 'Distance = 90 m + 30 m = 120 m. Time = 60 s + 30 s = 90 s.', why: 'Distance adds every leg; time adds every interval.' },
      { text: 'Average speed = 120 m ÷ 90 s = 1.33 m/s (to two decimal places).', why: 'Average speed = total distance ÷ total time.' },
      { text: 'Displacement = final − initial = 60 m − 0 m = +60 m.', why: 'She ends 60 m to the right of home.' },
      { text: 'Average velocity = +60 m ÷ 90 s = +0.67 m/s, that is 0.67 m/s to the right.', why: 'Average velocity = displacement ÷ time, with the direction of the displacement.' },
    ],
    verify: 'The size of the average velocity (0.67 m/s) is less than the average speed (1.33 m/s), as it must be when the walker turns back.',
  },
  guided: {
    id: 'g-pm-l5', prompt: 'An object goes from +20 m to +80 m in 12 s, then to +50 m in 8 s.',
    steps: [
      { id: 'g1', prompt: 'Displacement.', question: numQ('g-pm-l5-1', 'What is the displacement for the whole trip, in metres?', 30, '50 − 20 = +30 m.', { unit: 'm', refresherId: 'm15-vel', rules: [[[50], '50 m is the final position. Subtract the starting position, 20 m.', 'final_for_displacement']] }), hints: ['Final position minus initial position.'] },
      { id: 'g2', prompt: 'Average velocity.', question: numQ('g-pm-l5-2', 'What is the average velocity for the whole trip (time 20 s), in m/s?', 1.5, '+30 m ÷ 20 s = +1.5 m/s.', { unit: 'm/s', refresherId: 'm15-vel', rules: [[[4.5], '4.5 m/s is the average speed (90 m ÷ 20 s). Velocity uses the displacement.', 'velocity_equals_speed']] }), hints: ['Displacement ÷ time.'] },
      { id: 'g3', prompt: 'Compare.', question: pick('g-pm-l5-3', 'Compare the average speed (90 m ÷ 20 s) with the size of the average velocity.', [
        ['The average speed (4.5 m/s) is greater, because the object turned back', null],
        ['They are equal', 'They are equal only without a turn. Here the object turned back at +80 m.', 'velocity_equals_speed'],
      ], 'A turn makes the speed larger than the size of the velocity.', undefined, 'm16-turn'), hints: ['Did the object turn back?'] },
    ],
    conclusion: 'Average velocity is +1.5 m/s and average speed is 4.5 m/s; the object turned back, so they differ.',
  },
  independent: [
    ind('i1', 'Average velocity', 'avgvel', 'To the right.', numQ('pm-l5-i1', 'An object goes from O to +90 m in 15 s. What is its average velocity, in m/s?', 6, '+90 ÷ 15 = +6 m/s.', { unit: 'm/s', refresherId: 'm15-vel', rules: [[[0.1667], 'You divided the time by the displacement.', 'inverted_ratio']] }), ['Displacement ÷ time.'], ['+6 m/s.']),
    ind('i2', 'Average velocity', 'avgvel', 'To the left.', numQ('pm-l5-i2', 'An object goes from +50 m to +10 m in 8 s. What is its average velocity, in m/s (a minus sign for left)?', -5, '(10 − 50) ÷ 8 = −5 m/s.', { unit: 'm/s', refresherId: 'm15-vel', rules: [[[5], 'The displacement is to the left, so the velocity is negative.', 'sign_dropped']] }), ['Final minus initial first.'], ['−5 m/s.']),
    ind('i3', 'Average velocity', 'avgvel', 'Round trip.', numQ('pm-l5-i3', 'An object goes from O to +25 m and back to O in 10 s. What is its average velocity, in m/s?', 0, 'The displacement is 0, so the average velocity is 0 m/s.', { unit: 'm/s', refresherId: 'm17-return', rules: [[[5], '5 m/s is the average speed (50 m ÷ 10 s). The average velocity uses the displacement, which is zero.', 'velocity_equals_speed']] }), ['What is the displacement?'], ['0 m/s.']),
    ind('i4', 'Speed and velocity', 'compare', 'Average speed of a round trip.', numQ('pm-l5-i4', 'For the same trip as the previous question (O to +25 m and back to O in 10 s), what is the average speed, in m/s?', 5, 'Distance 50 m ÷ 10 s = 5 m/s.', { unit: 'm/s', refresherId: 'm17-return', rules: [[[0], '0 m/s is the average velocity. Average speed uses the distance, 50 m.', 'both_zero']] }), ['Use the distance.'], ['5 m/s.']),
    ind('i5', 'Speed and velocity', 'compare', 'Which is bigger?', pick('pm-l5-i5', 'Which statement about one trip is always true?', [
      ['The size of the average velocity is never greater than the average speed.', null],
      ['The average velocity is always greater than the average speed.', 'The displacement is never more than the distance, so the size of the average velocity cannot exceed the average speed.', 'velocity_larger'],
      ['The two are always equal.', 'They are equal only if the object does not change direction.', 'velocity_equals_speed'],
    ], 'Displacement ≤ distance.', undefined, 'm16-turn'), ['Compare displacement and distance.'], ['Never greater.']),
    ind('i6', 'Direction', 'direction', 'Sign of velocity.', pick('pm-l5-i6', 'A negative velocity means:', [
      ['The object\'s displacement is in the negative (left) direction.', null],
      ['The object is slowing down.', 'The sign gives the direction, not whether the object speeds up or slows down.', 'negative_means_slowing'],
      ['The object is at rest.', 'At rest the velocity is zero. A negative velocity means motion to the left.', 'negative_means_rest'],
    ], 'The sign is the direction.', undefined, 'm15-vel'), ['What does the sign stand for?'], ['Direction.']),
    ind('i7', 'Direction', 'direction', 'Same speed.', pick('pm-l5-i7', 'Two runners both run at 5 m/s, one to the right and one to the left. Which statement is true?', [
      ['They have the same speed but different velocities (+5 m/s and −5 m/s).', null],
      ['They have the same velocity.', 'Velocity includes direction, and the directions are opposite.', 'speed_means_velocity'],
    ], 'Direction makes the velocities different.', undefined, 'm18-same'), ['Does velocity have a direction?'], ['Different velocities.']),
  ],
  reflection: {
    discover: 'Average velocity is displacement divided by time, with a sign for the direction. It is zero for a round trip, and its size is never more than the average speed. Two motions can have the same speed and different velocities.',
    evidence: 'You compared average speed with average velocity for one-way trips, a trip that turns back and a round trip, using values calculated from the same path.',
    stillConfusing: [{ text: 'How do I find average velocity?', refresherId: 'm15-vel' }, { text: 'Why are they different?', refresherId: 'm16-turn' }, { text: 'Round trips?', refresherId: 'm17-return' }, { text: 'Same speed, different velocity?', refresherId: 'm18-same' }],
  },
};
