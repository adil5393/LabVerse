/**
 * Class 9 Physics, Chapter 4: the opening Learn unit "Describing motion" (PHY-1A).
 * Lessons: position and reference point (Section 4.1.1), distance travelled, displacement
 * (Section 4.1.2). Wording, figures and numbers are original.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { ind, motionVisual, numQ, pick } from './questions';

export const LAB = '/physics/motion/lab';
const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Motion Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Motion Laboratory' });

const track = (start: number, moves: number[], intro: string, o: { range?: [number, number]; editable?: boolean; show?: ('position' | 'distance' | 'displacement')[]; stepM?: number } = {}) =>
  motionVisual({ range: o.range ?? [-50, 100], start, moves, editable: o.editable, show: o.show, stepM: o.stepM ?? 5 }, intro);

// ---------------------------------------------------------------------------
// Lesson 1: Position and the reference point  (Section 4.1.1)
// ---------------------------------------------------------------------------

export const L1: EduLesson = {
  id: 'pm-l1', unitId: 'pm-unit-1', number: 1, title: 'Where is it? Position and the reference point',
  objective: 'describe the position of an object using a reference point, distance and direction, and decide whether an object is at rest or in motion.',
  prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-line'],
  objectives: [
    { id: 'reference', label: 'Say why a reference point is needed' },
    { id: 'position', label: 'Give and read a position with its sign' },
    { id: 'rest', label: 'Decide rest or motion with respect to a reference point' },
  ],
  steps: [
    {
      id: 'm1-ref', title: 'A fixed point to measure from', phase: 'observe',
      paragraphs: [
        'Suppose someone says "the athlete is 40 m away". Away from what? And in which direction? To say where an object is we need a fixed reference point, and then the distance and the direction from it.',
        'For an object on a straight track, we draw a line with distances marked, call the reference point O (zero), and use plus and minus for the two directions. Positions to the right of O are generally taken as positive and positions to the left as negative.',
      ],
      vocabulary: [{ term: 'reference point', meaning: 'the fixed point (O) from which positions are measured' }, { term: 'position', meaning: 'the distance and direction of the object from the reference point' }],
      visual: track(40, [], 'An athlete on a track, 40 m to the right of the reference point O.', { show: ['position'] }),
      notice: 'Find the mark O. Read the athlete\'s position: both the distance and the side of O it is on.',
      check: pick('chk-m1-ref', 'Which statement fully describes the athlete\'s position in the figure?', [
        ['40 m to the right of the reference point O (+40 m)', null],
        ['40 m', 'A distance alone does not say from where, or in which direction. Position needs a reference point and a direction.', 'distance_without_reference'],
        ['Near the middle of the track', 'That is vague and gives no reference point. Position uses a number with a unit, measured from O.', 'vague_position'],
      ], 'Position = distance and direction from the reference point.', undefined, 'm1-ref'),
    },
    {
      id: 'm2-sign', title: 'Plus and minus say which side', phase: 'observe',
      paragraphs: ['Use the buttons to move the object. Each button press moves it 5 m. Watch the position: it is positive on the right of O, zero at O, and negative on the left. The sign is the direction.'],
      visual: track(0, [], 'A track from −50 m to 100 m with an object you can move.', { editable: true, show: ['position'] }),
      notice: 'Move the object to the left of O. What happens to the sign of its position?',
      check: pick('chk-m2-sign', 'An object is 30 m to the left of O. What is its position?', [
        ['−30 m', null],
        ['30 m', 'Left of O is negative. Without the minus sign you would not know which side it is on.', 'sign_dropped'],
        ['0 m', 'Zero is the position of O itself. This object is 30 m away from O.', 'zero_confusion'],
      ], 'Left of O: minus.', undefined, 'm2-sign'),
    },
    {
      id: 'm3-rest', title: 'Rest and motion depend on the reference point', phase: 'reasoning',
      paragraphs: [
        'If the position of an object with respect to the reference point changes with time, the object is in motion. If it does not change, the object is at rest.',
        'This always refers to a reference point. A passenger sitting in a moving train is at rest with respect to the seat (the distance and direction do not change) but in motion with respect to the platform. Neither statement is wrong: they use different reference points.',
      ],
      misconception: { wrong: 'An object is either at rest or in motion, whoever is looking.', right: 'Rest and motion are stated with respect to a reference point, and the answer can differ for different reference points.' },
      check: pick('chk-m3-rest', 'A box sits on a shelf. Its distance and direction from the door never change. With respect to the door, the box is:', [
        ['at rest', null],
        ['in motion, because everything moves', 'Its position with respect to the door does not change with time, so with respect to the door it is at rest.', 'absolute_motion'],
      ], 'Unchanged position with respect to the reference point means rest.', undefined, 'm3-rest'),
    },
  ],
  investigation: lab('A', 'Move an object and read its position at each stop.'),
  worked: {
    id: 'w-pm-l1', title: 'A runner and a spectator',
    given: ['The starting line is the reference point O. The runner is at O at 0 s, 20 m to the right at 2 s and 50 m to the right at 5 s.', 'A spectator stands 30 m to the right of O the whole time.'], ask: 'Which one is in motion with respect to O?',
    steps: [
      { text: 'Write the runner\'s positions: 0 m, +20 m, +50 m.', why: 'A position is a distance and a direction from O, and to the right is positive.' },
      { text: 'The runner\'s position changes with time, so the runner is in motion with respect to O.', why: 'Changing position with respect to the reference point is the definition of motion.' },
      { text: 'The spectator\'s position stays +30 m, so the spectator is at rest with respect to O.', why: 'An unchanged position means rest.' },
      { text: 'If the runner is chosen as the reference point, the spectator\'s position (measured from the runner) changes, so the spectator is in motion with respect to the runner.', why: 'Rest and motion depend on the reference point.' },
    ],
    verify: 'Motion was decided each time by asking: does the position with respect to the chosen reference point change?',
  },
  guided: {
    id: 'g-pm-l1', prompt: 'A student stands 50 m to the right of the school gate (the reference point O). Later she is 70 m to the right of the gate.',
    steps: [
      { id: 'g1', prompt: 'Her first position.', question: numQ('g-pm-l1-1', 'What is her first position, in metres (right is positive)?', 50, 'She is 50 m to the right of O: +50 m.', { unit: 'm', refresherId: 'm1-ref', rules: [[[-50], 'Right of O is positive, so the position is +50 m.', 'sign_error']] }), hints: ['Right is positive.'] },
      { id: 'g2', prompt: 'Her second position.', question: numQ('g-pm-l1-2', 'What is her second position, in metres?', 70, 'She is 70 m to the right of O: +70 m.', { unit: 'm', refresherId: 'm1-ref', rules: [[[20], '20 m is how far she moved. The position is measured from O, not from where she was.', 'change_for_position']] }), hints: ['Measure from the gate, not from her first spot.'] },
      { id: 'g3', prompt: 'Rest or motion?', question: pick('g-pm-l1-3', 'With respect to the gate, the student is:', [
        ['in motion, because her position changed from +50 m to +70 m', null],
        ['at rest, because she is on the same road', 'Being on the same road does not matter. Her position with respect to the gate changed.', 'rest_confusion'],
      ], 'Position changed, so motion.', undefined, 'm3-rest'), hints: ['Did her position change?'] },
    ],
    conclusion: 'Her position changed from +50 m to +70 m with respect to the gate, so she is in motion.',
  },
  independent: [
    ind('i1', 'Reference', 'reference', 'Complete description.', pick('pm-l1-i1', 'Which is a complete description of the position of a bus on a straight road?', [
      ['"It is 300 m to the east of the bus stop."', null],
      ['"It is 300 m away."', 'Away from what, and in which direction? A reference point and a direction are both needed.', 'distance_without_reference'],
      ['"It is moving fast."', 'That describes motion, not position.', 'speed_for_position'],
    ], 'Reference point, distance and direction.', undefined, 'm1-ref'), ['What must a position include?'], ['Reference point, distance, direction.']),
    ind('i2', 'Reference', 'reference', 'Why a reference point?', pick('pm-l1-i2', 'Two students describe where a kite is: "it is 20 m from me" and "it is 35 m from me". Why might both be right?', [
      ['They are measuring from different reference points (themselves).', null],
      ['One of them must have measured wrongly.', 'Both can be correct: position depends on the reference point, and each student used a different one.', 'absolute_position'],
    ], 'A position is always with respect to a reference point.', undefined, 'm1-ref'), ['Where is each student standing?'], ['Different reference points.']),
    ind('i3', 'Position', 'position', 'Read the scale.', numQ('pm-l1-i3', 'Read the position of the object in the figure, in metres.', -25, 'The object is 25 m to the left of O, so its position is −25 m.', { unit: 'm', refresherId: 'm2-sign', rules: [[[25], 'The object is on the left of O, so the position is negative.', 'sign_dropped']], visual: track(-25, [], 'An object 25 m to the left of the reference point O.', { show: ['position'] }) }), ['Which side of O is it on?'], ['−25 m.']),
    ind('i4', 'Position', 'position', 'Moving across O.', numQ('pm-l1-i4', 'An object is 30 m to the left of O. It then moves 50 m to the right. What is its new position, in metres?', 20, '−30 + 50 = +20 m, which is 20 m to the right of O.', { unit: 'm', refresherId: 'm2-sign', rules: [[[-20], '−20 comes from −30 − 50. Moving right adds to the position: −30 + 50.', 'sign_error'], [[80], '80 adds the sizes, ignoring that the start was to the left of O.', 'sign_ignored']] }), ['Right adds, left subtracts.'], ['+20 m.']),
    ind('i5', 'Rest and motion', 'rest', 'On a bus.', pick('pm-l1-i5', 'A passenger sits still in a moving bus. With respect to the road she is:', [
      ['in motion', null],
      ['at rest', 'With respect to the seat she is at rest, but with respect to the road her position changes as the bus moves.', 'absolute_rest'],
    ], 'Her position with respect to the road changes.', undefined, 'm3-rest'), ['What is the reference point?'], ['In motion.']),
    ind('i6', 'Rest and motion', 'rest', 'Same object, two answers.', pick('pm-l1-i6', 'Can the same object be at rest with respect to one reference point and in motion with respect to another?', [
      ['Yes: rest and motion depend on the chosen reference point.', null],
      ['No: an object is either moving or not.', 'The passenger in the train is at rest with respect to the seat and in motion with respect to the platform.', 'absolute_rest'],
    ], 'Rest and motion are relative to a reference point.', undefined, 'm3-rest'), ['Think of the passenger on the train.'], ['Yes.']),
  ],
  reflection: {
    discover: 'A position needs a reference point, a distance and a direction (plus or minus). An object is in motion if its position with respect to the reference point changes with time, and at rest if it does not.',
    evidence: 'You moved an object along a scale, read positions with their signs, and decided rest or motion for different reference points.',
    stillConfusing: [{ text: 'What is a reference point?', refresherId: 'm1-ref' }, { text: 'What do plus and minus mean?', refresherId: 'm2-sign' }, { text: 'Rest or motion?', refresherId: 'm3-rest' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: Distance travelled  (Section 4.1.2)
// ---------------------------------------------------------------------------

export const L2: EduLesson = {
  id: 'pm-l2', unitId: 'pm-unit-1', number: 2, title: 'Distance travelled',
  objective: 'find the total distance travelled as the sum of the lengths of every leg of a path, and explain why distance is never negative and never decreases.',
  prerequisiteIds: ['pmp-units', 'pmp-signed'],
  objectives: [
    { id: 'path', label: 'Find the distance for a path' },
    { id: 'nature', label: 'Explain what distance is and is not' },
  ],
  steps: [
    {
      id: 'm4-dist', title: 'Add up every leg', phase: 'observe',
      paragraphs: ['An athlete runs from O to +60 m and then turns back to +40 m. The distance she travelled is the total length of the path she followed: 60 m for the first leg and 20 m for the second leg, so 80 m.', 'Try your own path. After each move the lab adds the length of that leg to the total distance.'],
      visual: track(0, [60, 40], 'An athlete runs from O to +60 m and back to +40 m.', { editable: true, show: ['position', 'distance'] }),
      notice: 'Move the object backwards. Does the distance go up or down?',
      check: pick('chk-m4-dist', 'An athlete runs from O to +60 m, then back to +40 m. What is the total distance travelled?', [
        ['80 m', null],
        ['40 m', '40 m is where she ends up. Distance counts the whole path: 60 m out and 20 m back.', 'final_position_for_distance'],
        ['60 m', '60 m is only the first leg. The second leg, 20 m, is added too.', 'first_leg_only'],
        ['20 m', '20 m is only the return leg. Distance counts every leg.', 'last_leg_only'],
      ], '60 + 20 = 80 m.', undefined, 'm4-dist'),
    },
    {
      id: 'm5-prop', title: 'Distance counts length, not direction', phase: 'conjecture',
      paragraphs: [
        'Every leg adds its length. A leg to the left adds length just like a leg to the right, because length has no direction. So distance is never negative, and it cannot decrease: it only grows or stays the same. It is described by a number with a unit alone (m).',
        'You can check this in the lab: no sequence of moves makes the distance fall.',
      ],
      visual: track(0, [30, -20], 'An object moves from O to +30 m and then to −20 m.', { editable: true, show: ['position', 'distance'] }),
      notice: 'Make several moves to the left and to the right. Does the distance ever go down?',
      check: pick('chk-m5-prop', 'An object turns back and moves to the left. What happens to the total distance travelled?', [
        ['It keeps increasing: the leg to the left adds its length.', null],
        ['It decreases, because the object is moving backwards.', 'Distance measures path length, which has no direction. Moving backwards still adds length.', 'distance_decreases'],
        ['It becomes negative.', 'A length cannot be negative, so distance is never negative.', 'negative_distance'],
      ], 'Distance only grows or stays the same.', undefined, 'm5-prop'),
    },
    {
      id: 'm6-use', title: 'When distance is the quantity that matters', phase: 'apply',
      paragraphs: ['Fuel used by a vehicle depends on the total distance travelled, not on the displacement: a taxi that makes a round trip uses fuel for the whole path even though it ends where it started. Distance answers "how much path was covered?"'],
      check: pick('chk-m6-use', 'A taxi drives 12 km out and 12 km back to where it began. Which quantity tells you roughly how much fuel was used?', [
        ['The total distance travelled, 24 km', null],
        ['The net change in position, 0 km', 'The net change is zero, but the engine ran the whole time. Fuel depends on the whole path.', 'displacement_for_fuel'],
      ], 'Fuel depends on the path length.', undefined, 'm6-use'),
    },
  ],
  investigation: lab('B', 'Predict the distance for a path, then check it in the lab.'),
  worked: {
    id: 'w-pm-l2', title: 'Out and part of the way back',
    given: ['A cart starts at O, rolls to +80 m, then rolls back to +30 m.'], ask: 'Find the total distance travelled.',
    steps: [
      { text: 'Leg 1: from 0 m to +80 m. Length = 80 m.', why: 'Length of a leg = size of the difference between its end positions.' },
      { text: 'Leg 2: from +80 m to +30 m. Length = |30 − 80| = 50 m.', why: 'A leg to the left still has a positive length.' },
      { text: 'Total distance = 80 m + 50 m = 130 m.', why: 'Distance is the sum of the lengths of all legs.' },
    ],
    verify: 'The cart ends only 30 m from O, yet it covered 130 m of path: distance is not the same as the final position.',
  },
  guided: {
    id: 'g-pm-l2', prompt: 'An object starts at O, goes to +40 m, then to −10 m, then to +20 m.',
    visual: track(0, [40, -10, 20], 'An object goes from O to +40 m, then to −10 m, then to +20 m.', { show: ['position', 'distance'] }),
    steps: [
      { id: 'g1', prompt: 'Leg 1.', question: numQ('g-pm-l2-1', 'How long is leg 1 (0 m to +40 m), in metres?', 40, '|40 − 0| = 40 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[-40], 'A length is never negative.', 'negative_distance']] }), hints: ['The size of the difference between the ends.'] },
      { id: 'g2', prompt: 'Leg 2.', question: numQ('g-pm-l2-2', 'How long is leg 2 (+40 m to −10 m), in metres?', 50, '|−10 − 40| = 50 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[30], '30 comes from 40 − 10. The end is at −10 m, on the other side of O, so the leg is 40 + 10 long.', 'sign_ignored'], [[-50], 'A length is never negative, even for a leg to the left.', 'negative_distance']] }), hints: ['From +40 to −10 crosses O.'] },
      { id: 'g3', prompt: 'The total.', question: numQ('g-pm-l2-3', 'What is the total distance, in metres? (leg 3 is from −10 m to +20 m)', 120, '40 + 50 + 30 = 120 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[20], '20 m is the final position. Distance adds all three legs.', 'final_position_for_distance'], [[100], '100 leaves out leg 3 (30 m): from −10 to +20 is 30 m.', 'last_leg_missed']] }), hints: ['Leg 3 is |20 − (−10)| = 30 m.'] },
    ],
    conclusion: 'The total distance is 40 + 50 + 30 = 120 m.',
  },
  independent: [
    ind('i1', 'Distance of a path', 'path', 'Out and back.', numQ('pm-l2-i1', 'An object goes from O to +70 m and then to +20 m. What is the total distance, in metres?', 120, '70 + 50 = 120 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[20], '20 m is the final position, not the distance travelled.', 'final_position_for_distance'], [[50], '50 m is only the return leg. Add the first leg, 70 m.', 'last_leg_only']], visual: track(0, [70, 20], 'An object goes from O to +70 m and then to +20 m.', { show: ['position'] }) }), ['Two legs.'], ['120 m.']),
    ind('i2', 'Distance of a path', 'path', 'Crossing O.', numQ('pm-l2-i2', 'An object starts at −20 m, moves to +30 m and then to −10 m. What is the total distance, in metres?', 90, '|30 − (−20)| = 50 and |−10 − 30| = 40, so 90 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[10], '10 m is only the size of the final position. Add the lengths of both legs.', 'final_position_for_distance'], [[60], '60 is not the sum of the two legs: they are 50 m (from −20 to +30) and 40 m (from +30 to −10).', 'leg_error']] }), ['First leg crosses O.'], ['90 m.']),
    ind('i3', 'Distance of a path', 'path', 'A pause.', numQ('pm-l2-i3', 'An object goes from O to +25 m, stays there, then returns to O. What is the total distance, in metres?', 50, '25 + 0 + 25 = 50 m. Staying still adds no distance.', { unit: 'm', refresherId: 'm4-dist', rules: [[[0], '0 m is the displacement. The object travelled 25 m out and 25 m back.', 'displacement_for_distance'], [[25], '25 m is only the way out. Distance adds the return leg too.', 'first_leg_only']] }), ['A pause adds nothing.'], ['50 m.']),
    ind('i4', 'What distance is', 'nature', 'Can it be negative?', pick('pm-l2-i4', 'Can the distance travelled by an object be negative?', [
      ['No: distance is a length, which cannot be negative.', null],
      ['Yes, if the object moves to the left.', 'Moving left changes the sign of a position, not the length of the path. Distance stays positive.', 'negative_distance'],
    ], 'Length has no direction.', undefined, 'm5-prop'), ['Is a length ever less than zero?'], ['No.']),
    ind('i5', 'What distance is', 'nature', 'Out and back.', pick('pm-l2-i5', 'A runner goes 50 m along a track and returns to the start. Which is true?', [
      ['She has travelled 100 m even though she is back where she began.', null],
      ['She has travelled 0 m, because she ends at the start.', '0 m is her displacement. The distance counts the path she ran: 50 m out and 50 m back.', 'displacement_for_distance'],
      ['She has travelled 50 m, the length of the track.', 'She ran the track twice (out and back), so the path is 100 m.', 'one_way_only'],
    ], 'Distance counts the whole path.', undefined, 'm4-dist'), ['What did she run altogether?'], ['100 m.']),
    ind('i6', 'What distance is', 'nature', 'Fuel.', pick('pm-l2-i6', 'A delivery van makes a round trip. Which quantity is more closely related to the fuel it uses?', [
      ['The total distance travelled', null],
      ['The displacement over the whole trip', 'For a round trip the displacement is zero, but fuel is used all the way. It depends on the path length.', 'displacement_for_fuel'],
    ], 'Fuel follows path length.', undefined, 'm6-use'), ['What does the engine do on the way back?'], ['Total distance.']),
  ],
  reflection: {
    discover: 'Distance is the total length of the path: add the length of every leg. It has no direction, so it is never negative, and it cannot decrease.',
    evidence: 'You added legs in the lab, turned back and watched the distance keep growing, and met a case where distance is the quantity that matters.',
    stillConfusing: [{ text: 'How do I add up the legs?', refresherId: 'm4-dist' }, { text: 'Why is it never negative?', refresherId: 'm5-prop' }, { text: 'Where does distance matter?', refresherId: 'm6-use' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: Displacement  (Section 4.1.2)
// ---------------------------------------------------------------------------

export const L3: EduLesson = {
  id: 'pm-l3', unitId: 'pm-unit-1', number: 3, title: 'Displacement: the net change in position',
  objective: 'find displacement from the starting and final positions, explain why it can be zero or negative, and compare it with distance.',
  prerequisiteIds: ['pmp-signed', 'pmp-line'],
  objectives: [
    { id: 'calc', label: 'Find displacement from two positions' },
    { id: 'compare', label: 'Compare displacement and distance' },
  ],
  steps: [
    {
      id: 'm7-disp', title: 'Final position minus initial position', phase: 'observe',
      paragraphs: [
        'Displacement is the net change in position between two instants. It depends only on where the object starts and where it ends, not on the path in between. Displacement = final position − initial position.',
        'It has a size (magnitude, in metres) and a direction. Here the object goes from O to +60 m and then back to +20 m: its displacement is +20 m, which is 20 m to the right. The distance travelled is 100 m.',
      ],
      vocabulary: [{ term: 'displacement', meaning: 'final position − initial position, with a direction' }, { term: 'magnitude', meaning: 'the numerical value with units' }],
      visual: track(0, [60, 20], 'An object goes from O to +60 m, then back to +20 m.', { editable: true, show: ['position', 'distance', 'displacement'] }),
      notice: 'Make more moves. Which readout depends on the whole path and which only on where the object is?',
      check: pick('chk-m7-disp', 'An object starts at +10 m and ends at +70 m. What is its displacement?', [
        ['+60 m, which is 60 m to the right', null],
        ['+70 m', '70 m is the final position. Displacement is the change: 70 − 10.', 'final_for_displacement'],
        ['−60 m', 'The object ends to the right of where it started, so the displacement is positive.', 'sign_error'],
      ], '70 − 10 = +60 m.', undefined, 'm7-disp'),
    },
    {
      id: 'm8-zero', title: 'Back where you started', phase: 'observe',
      paragraphs: ['If an object ends at the position where it started, its position did not change overall, so its displacement is zero, however far it travelled. A runner who goes 50 m out and 50 m back has a displacement of 0 m and has travelled 100 m.'],
      visual: track(0, [40, 0], 'An object goes from O to +40 m and back to O.', { editable: true, show: ['position', 'distance', 'displacement'] }),
      notice: 'The object ends at O. What are the distance and the displacement?',
      check: pick('chk-m8-zero', 'A runner goes 50 m out and then 50 m back to her starting point. Which is true?', [
        ['Her displacement is 0 m and the distance she travelled is 100 m.', null],
        ['Her displacement is 100 m.', 'Displacement is the net change in position. She ends where she started, so it is 0.', 'distance_for_displacement'],
        ['Both are 0 m, because she is back at the start.', 'The distance counts the whole path (100 m). Only the displacement is zero.', 'both_zero'],
      ], 'Same start and end: displacement 0.', undefined, 'm8-zero'),
    },
    {
      id: 'm9-compare', title: 'Which is bigger?', phase: 'conjecture',
      paragraphs: [
        'Compare the two numbers for many paths in the lab. The size of the displacement is never more than the distance. They are equal when the object moves in one direction without turning back; when it turns back, the distance becomes larger.',
        'Why? Each leg adds its full length to the distance. But a leg to the left undoes some of the progress to the right, so the net change in position is smaller than the length travelled.',
      ],
      visual: track(0, [30, 10, 50], 'An object goes from O to +30 m, back to +10 m, then to +50 m.', { editable: true, show: ['position', 'distance', 'displacement'] }),
      notice: 'Try a path that never turns back. Then try one that turns back once. When are distance and displacement equal in size?',
      check: pick('chk-m9-compare', 'When is the size of the displacement equal to the distance travelled?', [
        ['When the object moves in one direction without turning back', null],
        ['Never: they are always different.', 'For a one-way move, such as O to +40 m, both are 40 m.', 'never_equal'],
        ['Whenever the object returns to the start.', 'Returning to the start gives displacement 0 but a positive distance, so they differ.', 'return_equal'],
      ], 'No turning back means equal; turning back makes distance bigger.', undefined, 'm9-compare'),
    },
    {
      id: 'm10-words', title: 'Quantities with and without direction', phase: 'apply',
      paragraphs: ['Distance is fully described by a number with a unit. Displacement needs a number with a unit and a direction. Quantities like distance are called scalars; quantities like displacement are called vectors. You will study them in higher grades; for now, remember that the two are different.'],
      check: pick('chk-m10-words', 'Which statement about the two quantities is correct?', [
        ['Distance has only a size; displacement has a size and a direction.', null],
        ['Both have a size and a direction.', 'Distance is a path length and has no direction. Displacement carries a direction.', 'distance_has_direction'],
      ], 'Displacement needs a direction.', undefined, 'm10-words'),
    },
  ],
  investigation: lab('D', 'Find two routes with the same displacement but different distances.'),
  worked: {
    id: 'w-pm-l3', title: 'A ball thrown up and caught lower down',
    given: ['A ball is thrown straight up from a hand at height 0 m, reaches a ceiling at 8 m, then comes down and is caught at 3 m (up is positive).'], ask: 'Find the distance travelled and the displacement.',
    steps: [
      { text: 'Going up: 0 → 8 m, length 8 m. Coming down: 8 → 3 m, length 5 m.', why: 'Each leg is a straight movement in one direction.' },
      { text: 'Distance = 8 m + 5 m = 13 m.', why: 'Distance is the total path length.' },
      { text: 'Displacement = final − initial = 3 m − 0 m = +3 m, that is 3 m upward.', why: 'Displacement depends only on the start and end positions.' },
      { text: 'The size of the displacement (3 m) is less than the distance (13 m).', why: 'The ball turned back, so some of the path was undone.' },
    ],
    verify: 'If the ball were caught at the hand again, the displacement would be 0 m while the distance would be 16 m.',
  },
  guided: {
    id: 'g-pm-l3', prompt: 'An object starts at +20 m, moves to +70 m, then to +30 m.',
    visual: track(20, [70, 30], 'An object starts at +20 m, moves to +70 m and then to +30 m.', { show: ['position'] }),
    steps: [
      { id: 'g1', prompt: 'Displacement.', question: numQ('g-pm-l3-1', 'What is the displacement, in metres (final − initial)?', 10, '30 − 20 = +10 m.', { unit: 'm', refresherId: 'm7-disp', rules: [[[30], '30 m is the final position. Subtract the initial position, 20 m.', 'final_for_displacement'], [[-10], 'It ends to the right of where it started, so the displacement is positive.', 'sign_error']] }), hints: ['Final position minus initial position.'] },
      { id: 'g2', prompt: 'Distance.', question: numQ('g-pm-l3-2', 'What is the total distance, in metres?', 90, '|70 − 20| + |30 − 70| = 50 + 40 = 90 m.', { unit: 'm', refresherId: 'm4-dist', rules: [[[10], '10 m is the displacement. Distance adds both legs: 50 m and 40 m.', 'displacement_for_distance']] }), hints: ['Two legs: 50 m and 40 m.'] },
      { id: 'g3', prompt: 'Compare.', question: pick('g-pm-l3-3', 'Which is larger here, the size of the displacement or the distance?', [
        ['The distance (90 m is more than 10 m), because the object turned back', null],
        ['The displacement', 'The size of the displacement can never exceed the distance. Here 10 m < 90 m.', 'displacement_larger'],
      ], 'The distance is larger because the path turned back.', undefined, 'm9-compare'), hints: ['Compare 10 m and 90 m.'] },
    ],
    conclusion: 'Displacement +10 m; distance 90 m; the object turned back, so the distance is larger.',
  },
  independent: [
    ind('i1', 'Displacement', 'calc', 'Positive.', numQ('pm-l3-i1', 'An object starts at +15 m and ends at +65 m. What is its displacement, in metres?', 50, '65 − 15 = +50 m.', { unit: 'm', refresherId: 'm7-disp', rules: [[[65], '65 m is the final position. Displacement is the change: 65 − 15.', 'final_for_displacement'], [[80], '80 adds the positions. Subtract the initial from the final.', 'added_positions']] }), ['Final minus initial.'], ['+50 m.']),
    ind('i2', 'Displacement', 'calc', 'Negative.', numQ('pm-l3-i2', 'An object starts at +40 m and ends at +10 m. What is its displacement, in metres (use a minus sign if it is to the left)?', -30, '10 − 40 = −30 m: 30 m to the left.', { unit: 'm', refresherId: 'm7-disp', rules: [[[30], 'The object ends to the left of where it started, so the displacement is negative.', 'sign_dropped'], [[10], '10 m is the final position, not the change.', 'final_for_displacement']] }), ['The object moved left.'], ['−30 m.']),
    ind('i3', 'Displacement', 'calc', 'A longer path.', numQ('pm-l3-i3', 'An object starts at O, goes to +50 m, then to −20 m and stops. What is its displacement, in metres?', -20, 'Final − initial = −20 − 0 = −20 m. Only the start and end matter.', { unit: 'm', refresherId: 'm7-disp', rules: [[[20], 'The final position is −20 m, left of O, so the displacement is negative.', 'sign_dropped'], [[70], '70 m is the length of the second leg. Displacement uses only the end positions.', 'leg_for_displacement'], [[120], '120 m is the distance (50 + 70). The displacement is final − initial.', 'distance_for_displacement']], visual: track(0, [50, -20], 'An object goes from O to +50 m, then to −20 m.', { show: ['position'] }) }), ['Ignore the stop in between.'], ['−20 m.']),
    ind('i4', 'Comparing', 'compare', 'Zero displacement.', pick('pm-l3-i4', 'Which statement about an object that ends where it started is correct?', [
      ['Its displacement is zero but its distance travelled is not zero (if it moved).', null],
      ['Its distance is zero.', 'If it moved at all, it travelled some path, so the distance is not zero.', 'both_zero'],
      ['Its displacement cannot be zero.', 'Same start and end means the net change in position is zero.', 'never_zero'],
    ], 'Net change zero, path length not.', undefined, 'm8-zero'), ['What is final minus initial?'], ['Displacement 0.']),
    ind('i5', 'Comparing', 'compare', 'Round trip.', numQ('pm-l3-i5', 'A cyclist goes 35 m along a straight lane and returns to the start. What is her total distance, in metres?', 70, '35 m out and 35 m back: 70 m (displacement 0 m).', { unit: 'm', refresherId: 'm8-zero', rules: [[[0], '0 m is her displacement. The distance is the whole path.', 'displacement_for_distance'], [[35], '35 m is only the way out.', 'first_leg_only']] }), ['Out and back.'], ['70 m.']),
    ind('i6', 'Comparing', 'compare', 'Bigger than distance?', pick('pm-l3-i6', 'Can the size of an object\'s displacement be greater than the distance it travelled?', [
      ['No: the net change in position is never more than the path length.', null],
      ['Yes, if it moves backwards.', 'Backward moves add distance and reduce displacement, so the displacement is never larger.', 'displacement_larger'],
    ], 'Magnitude of displacement ≤ distance.', undefined, 'm9-compare'), ['What does a turn do to each quantity?'], ['No.']),
    ind('i7', 'Comparing', 'compare', 'When equal.', pick('pm-l3-i7', 'An object moves from +10 m to +90 m without ever turning back. How do the distance and the size of the displacement compare?', [
      ['They are equal, both 80 m.', null],
      ['The distance is larger.', 'With no turning back, nothing is undone: both are 80 m.', 'always_larger'],
      ['The displacement is larger.', 'The size of the displacement can never exceed the distance; here they are equal.', 'displacement_larger'],
    ], 'One direction only: equal.', undefined, 'm9-compare'), ['Did it turn back?'], ['Equal, 80 m.']),
  ],
  reflection: {
    discover: 'Displacement = final position − initial position, with a sign for the direction. It can be zero or negative, and its size is never more than the distance; they are equal only when the object does not turn back.',
    evidence: 'You compared distance and displacement for many paths in the lab, including paths that return to the start.',
    stillConfusing: [{ text: 'How do I find displacement?', refresherId: 'm7-disp' }, { text: 'Why can it be zero?', refresherId: 'm8-zero' }, { text: 'Which is bigger?', refresherId: 'm9-compare' }, { text: 'Scalar and vector?', refresherId: 'm10-words' }],
  },
};
