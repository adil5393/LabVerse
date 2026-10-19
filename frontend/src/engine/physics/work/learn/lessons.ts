/**
 * Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines": the first Learn lessons (PHY-3A), Section 7.1.
 * Lesson 1: work in physics, W = F x s and the joule. Lesson 2: when the work is zero (Section 7.1.1).
 * Wording, figures and numbers are original. Every figure is drawn from the Work Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { DEFAULT_WORK, type WorkSetup } from '../workModel';
import { ind, numQ, pick, workVisual } from './questions';

const LAB = '/physics/work/lab';
export const lab = (exp: string, description: string): Investigation => ({ title: 'Try it in the Work Laboratory', description, href: `${LAB}?experiment=${exp}`, buttonLabel: 'Open the Work Laboratory' });
export const w = (o: Partial<WorkSetup>): WorkSetup => ({ ...DEFAULT_WORK, ...o });

// ---------------------------------------------------------------------------
// Lesson 1: Work in physics  (Section 7.1)
// ---------------------------------------------------------------------------

export const W1: EduLesson = {
  id: 'pw-l1', unitId: 'pw-unit-1', number: 1, title: 'Work in physics: force times displacement',
  objective: 'tell work in physics from the everyday word, calculate the work done by a force along the displacement in joules, and read it from a force-displacement graph.',
  prerequisiteIds: ['pwp-force', 'pwp-units', 'pwp-graph'],
  objectives: [
    { id: 'concept', label: 'Tell work in physics from everyday work' },
    { id: 'formula', label: 'Calculate work as force × displacement' },
    { id: 'unit', label: 'Use the joule and the force-displacement graph' },
  ],
  steps: [
    {
      id: 'pw1-meaning', title: 'Work in everyday life and in physics', phase: 'observe',
      paragraphs: [
        'In daily life we call many things "work": studying, cooking, carrying a heavy bag while you stand and wait. In physics the word has one precise meaning. A force does work on an object when the object is displaced along the force.',
        'So two things are needed together: a force acting on the object, and a displacement of that object in the direction of the force (or against it). Feeling that something is hard is not the test.',
      ],
      vocabulary: [{ term: 'work (in physics)', meaning: 'done by a force on an object that is displaced along the force' }],
      check: pick('chk-pw1-meaning', 'Which of these is work in the physics sense?', [
        ['A crane lifts a steel beam 5 m upwards', null],
        ['A student thinks hard about a puzzle', 'Thinking is tiring, but no force displaces an object here, so no work is done in the physics sense.', 'everyday_work'],
        ['A person pushes with all their strength on a parked truck that does not move', 'A force acts, but the truck is not displaced, so the person does no work on the truck.', 'force_alone_is_work'],
      ], 'A force that displaces an object along it.', undefined, 'pw1-meaning'),
    },
    {
      id: 'pw2-lifting', title: 'More force or more distance means more work', phase: 'observe',
      paragraphs: [
        'To lift a 5 kg bag of wheat slowly, you pull up with a force equal to its weight, 5 × 10 = 50 N. The bag is displaced upwards, along your force. Lifting it 1 m is a certain amount of work.',
        'Lifting it 3 m, with the same force over three times the displacement, is three times the work. Lifting three such bags together to 1 m needs three times the force over the same displacement: also three times the work. A larger force, or a larger displacement, means proportionally more work.',
      ],
      visual: workVisual({ setup: w({ axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 1, startPos: 0, massKg: 5 }), progress: 1 }, 'A 5 kg bag lifted slowly 1 m by a 50 N upward force.'),
      notice: 'Compare the force arrow and the displacement arrow: they point the same way.',
      check: pick('chk-pw2-lifting', 'You lift the same bag 3 m instead of 1 m, with the same upward force. How does the work compare?', [
        ['Three times as much', null],
        ['The same, because the force is the same', 'The force is the same but it acts over a larger displacement, so the work is larger.', 'displacement_ignored'],
        ['Nine times as much', 'The displacement became three times larger and the force did not change, so the work becomes three times larger, not nine.', 'squared'],
      ], 'Same force, three times the displacement: three times the work.', undefined, 'pw2-lifting'),
    },
    {
      id: 'pw3-formula', title: 'W = F × s', phase: 'reasoning',
      paragraphs: [
        'The work done by a constant force on an object is the force multiplied by the displacement of the object in the direction of the force: W = F × s. It works for lifting upwards, for pushing along a floor, or in any other direction, as long as the force and the displacement are along the same line.',
        'Always say which force does the work and on which object: "the work done by the girl on the box". Different forces on the same object can do different work, and the same force does different work on different objects.',
      ],
      vocabulary: [{ term: 'displacement s', meaning: 'the change of position of the object, measured along the force' }],
      visual: workVisual({ setup: w({ forceN: 10, displacement: 3 }), progress: 1 }, 'A box pushed 3 m along a smooth track by a 10 N force.'),
      notice: 'Read the push, the displacement and the work together: 10 N × 3 m.',
      misconception: { wrong: 'Work is the force times how long the push lasts, or times any distance the object travels.', right: 'Work is the force times the displacement of the object in the direction of the force. Time is not part of it.' },
      check: pick('chk-pw3-formula', 'A 20 N push moves a trolley 4 m in the direction of the push. How much work does the push do on the trolley?', [
        ['80 J', null],
        ['24 J', 'You added the numbers. Work is force multiplied by displacement: 20 × 4.', 'added'],
        ['5 J', 'You divided. Work is force multiplied by displacement, not divided.', 'divided'],
      ], 'W = 20 × 4 = 80 J.', undefined, 'pw3-formula'),
    },
    {
      id: 'pw4-joule', title: 'The joule, and the area under a graph', phase: 'apply',
      paragraphs: [
        'The SI unit of work is the joule, J. One joule is the work done when a force of 1 newton moves an object 1 metre in the direction of the force: 1 J = 1 N × 1 m. Because 1 N = 1 kg m s⁻², also 1 J = 1 kg m² s⁻².',
        'Draw a graph with the force on the vertical axis and the displacement along the force on the horizontal axis. For a steady force the graph is a horizontal line, and the work equals the area of the rectangle under it: 10 N × 1 m = 10 J. (The book notes that for a changing force the area under the graph still gives the work; here only steady forces are used.)',
      ],
      vocabulary: [{ term: 'joule (J)', meaning: 'the unit of work: 1 J = 1 N × 1 m' }],
      visual: workVisual({ setup: w({ forceN: 10, displacement: 1, startPos: 0 }), progress: 1, graph: true }, 'A 10 N force through 1 m with its force-displacement graph.'),
      notice: 'The shaded rectangle is 10 N tall and 1 m wide.',
      check: pick('chk-pw4-joule', 'On a force-displacement graph a horizontal line at 10 N runs from 0 to 1 m. What is the shaded area under the line?', [
        ['10 J: that is the work done', null],
        ['10 N: the force', 'The area is the height times the width, so it carries units of N × m, which are joules.', 'area_is_force'],
        ['1 J', 'The height is 10 N and the width is 1 m, so the area is 10 × 1, not 1.', 'height_ignored'],
      ], 'Area under the line = work = 10 J.', undefined, 'pw4-joule'),
    },
  ],
  investigation: lab('A', 'Change the force and the displacement and watch the work, with its unit, change.'),
  worked: {
    id: 'w-pw-l1', title: 'Lifting a bag',
    given: ['A 5 kg bag is lifted slowly, straight up, through 3 m.', 'Take g = 10 m/s².'], ask: 'How much work does the lifting force do on the bag?',
    visual: workVisual({ setup: w({ axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 3, startPos: 0, massKg: 5 }), progress: 1 }, 'A 5 kg bag lifted 3 m by a 50 N upward force.'),
    steps: [
      { text: 'The bag is lifted slowly, so the lifting force equals its weight: F = mg = 5 kg × 10 m/s² = 50 N, upwards.', why: 'At a steady speed the forces balance, so the pull up equals the pull of the Earth down.' },
      { text: 'The displacement is s = 3 m upwards, in the direction of the force.', why: 'The bag moves along the force, so the displacement along the force is +3 m.' },
      { text: 'W = F × s = 50 N × 3 m = 150 J.', why: 'Work is the force times the displacement along the force; N × m gives joules.' },
      { text: 'Check: lifting the bag 1 m takes 50 N × 1 m = 50 J, and 3 m takes three times that: 150 J.', why: 'The same force over three times the displacement gives three times the work.' },
    ],
    verify: 'The 150 J result agrees with 3 × 50 J, and the unit N × m is the joule.',
  },
  guided: {
    id: 'g-pw-l1', prompt: 'A person pushes a trolley with a steady 20 N along a level floor. The trolley moves 4 m in the direction of the push.',
    visual: workVisual({ setup: w({ forceN: 20, displacement: 4, startPos: 1 }), progress: 1 }, 'A trolley pushed 4 m by a 20 N force.'),
    steps: [
      { id: 'g1', prompt: 'The displacement along the force.', question: numQ('pw-g1-1', 'What is the displacement of the trolley along the push, in metres?', 4, 'The trolley moves 4 m in the direction of the push.', { unit: 'm', refresherId: 'pw3-formula' }), hints: ['The problem says how far the trolley moves.'] },
      { id: 'g2', prompt: 'The work.', question: numQ('pw-g1-2', 'How much work does the push do on the trolley, in joules?', 80, 'W = F × s = 20 N × 4 m = 80 J.', { unit: 'J', refresherId: 'pw3-formula', rules: [[[24], 'You added 20 and 4. Multiply the force by the displacement.', 'added'], [[5], 'You divided. Work is the product of force and displacement.', 'divided']] }), hints: ['Multiply the force by the displacement.'] },
      { id: 'g3', prompt: 'A longer push.', question: pick('pw-g1-3', 'The same 20 N push moves the trolley 8 m instead. What happens to the work?', [
        ['It doubles to 160 J', null],
        ['It stays at 80 J', 'The force is the same but the displacement doubled, so the work doubles.', 'displacement_ignored'],
      ], 'Same force, twice the displacement, twice the work.', undefined, 'pw2-lifting'), hints: ['Compare 20 × 8 with 20 × 4.'] },
    ],
    conclusion: 'W = F × s = 20 N × 4 m = 80 J; doubling the displacement doubles the work.',
  },
  independent: [
    ind('i1', 'Work in physics', 'concept', 'Which is work?', pick('pw-l1-i1', 'Which situation has a force doing work on an object in the physics sense?', [
      ['A porter lifts a suitcase onto a shelf', null],
      ['A student studies for two hours', 'Studying involves effort, but no force displaces an object along itself, so it is not work in the physics sense.', 'everyday_work'],
      ['A person leans on a wall with all their strength', 'The wall does not move, so there is no displacement and no work is done on the wall.', 'force_alone_is_work'],
    ], 'A force displacing an object.', undefined, 'pw1-meaning'), ['Look for a force AND a displacement along it.'], ['The porter lifts the suitcase: force and displacement.']),
    ind('i2', 'Work in physics', 'concept', 'What is needed?', pick('pw-l1-i2', 'Which pair of things must both be present for a force to do work on an object?', [
      ['A force on the object and a displacement of the object along that force', null],
      ['A force and a feeling of tiredness', 'Tiredness is not part of the definition of work.', 'everyday_work'],
      ['A force and some time passing', 'Time is not part of W = F × s; a displacement along the force is needed.', 'time_for_work'],
    ], 'Force and displacement along it.', undefined, 'pw1-meaning'), ['Recall W = F × s.'], ['Force and displacement.']),
    ind('i3', 'Calculating work', 'formula', 'A pushed box.', numQ('pw-l1-i3', 'A 12 N force moves a box 5 m in the direction of the force. How much work does it do, in joules?', 60, 'W = 12 N × 5 m = 60 J.', { unit: 'J', refresherId: 'pw3-formula', rules: [[[17], 'You added. Work is force times displacement.', 'added'], [[2.4], 'You divided. Multiply the force and the displacement.', 'divided']] }), ['W = F × s.'], ['12 × 5 = 60 J.']),
    ind('i4', 'Calculating work', 'formula', 'A short pull.', numQ('pw-l1-i4', 'A 30 N pull moves a sled 0.5 m along the pull. How much work does it do, in joules?', 15, 'W = 30 N × 0.5 m = 15 J.', { unit: 'J', refresherId: 'pw3-formula', rules: [[[60], 'You divided by 0.5. Multiply the force by the displacement.', 'divided'], [[30.5], 'You added. Work is a product.', 'added']] }), ['Multiply 30 by 0.5.'], ['30 × 0.5 = 15 J.']),
    ind('i5', 'The joule', 'unit', 'The unit of work.', pick('pw-l1-i5', 'Which is the SI unit of work?', [
      ['joule (J)', null],
      ['newton (N)', 'The newton is the unit of force. Work is force times displacement, which is N × m = J.', 'unit_confused'],
      ['watt (W)', 'The watt measures how fast work is done (power). Work itself is measured in joules.', 'unit_confused'],
    ], 'The unit of work is the joule.', undefined, 'pw4-joule'), ['1 J = 1 N × 1 m.'], ['joule.']),
    ind('i6', 'The graph', 'unit', 'Area under a graph.', numQ('pw-l1-i6', 'A steady force of 8 N acts while an object is displaced from 0 to 2.5 m along the force. On a force-displacement graph, what is the area under the line, which is the work, in joules?', 20, 'The rectangle is 8 N tall and 2.5 m wide: 8 × 2.5 = 20 J.', { unit: 'J', refresherId: 'pw4-joule', rules: [[[10.5], 'You added the height and the width. The area of a rectangle is height times width.', 'added'], [[3.2], 'You divided. The area is height times width.', 'divided']] }), ['Area = height × width.'], ['8 × 2.5 = 20 J.']),
  ],
  reflection: {
    discover: 'In physics a force does work on an object only when the object is displaced along the force. For a constant force along the displacement, W = F × s, measured in joules (1 J = 1 N × 1 m). Doubling the force or the displacement doubles the work, and for a steady force the work is the area under the force-displacement graph.',
    evidence: 'You told work from the everyday word, calculated the work of several forces, and used the joule and the graph.',
    stillConfusing: [{ text: 'What counts as work?', refresherId: 'pw1-meaning' }, { text: 'How do I calculate it?', refresherId: 'pw3-formula' }, { text: 'What is a joule, and what does the graph show?', refresherId: 'pw4-joule' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: When is the work zero?  (Section 7.1.1)
// ---------------------------------------------------------------------------

export const W2: EduLesson = {
  id: 'pw-l2', unitId: 'pw-unit-1', number: 2, title: 'When is the work zero?',
  objective: 'explain why a force on an object that does not move, or at right angles to its displacement, does no work on it, and why tiredness is not work on the object.',
  prerequisiteIds: ['pwp-force', 'pwp-displacement', 'pwp-weight'],
  objectives: [
    { id: 'nodisp', label: 'Explain why no displacement or no force means zero work, and why tiredness is not work' },
    { id: 'perp', label: 'Explain why a force perpendicular to the displacement does no work' },
    { id: 'decide', label: 'Decide whether the work is zero from the force, displacement and directions' },
  ],
  steps: [
    {
      id: 'pw5-zero', title: 'Zero force or zero displacement', phase: 'observe',
      paragraphs: [
        'From W = F × s, the work is zero in two simple cases. If the force is zero (F = 0), no work is done. If the displacement is zero (s = 0), no work is done, however large the force is.',
        'Push on a rigid wall as hard as you can. The wall does not move, so you do no work on the wall.',
      ],
      visual: workVisual({ setup: w({ forceN: 10, displacement: 0, massKg: 5, surfaceId: 'wood' }), progress: 0 }, 'A 10 N push on a 5 kg block that stays where it is.'),
      notice: 'The object stays at its start position, so the displacement is 0 m.',
      misconception: { wrong: 'A bigger force always means more work.', right: 'Work needs a displacement. A huge force on an object that does not move does zero work on it.' },
      check: pick('chk-pw5-zero', 'You push a heavy cupboard with 300 N and it does not move. How much work do you do on the cupboard?', [
        ['0 J', null],
        ['300 J', 'That would need a displacement of 1 m. The cupboard does not move, so W = 300 N × 0 m = 0 J.', 'force_alone_is_work'],
      ], 'No displacement, no work.', undefined, 'pw5-zero'),
    },
    {
      id: 'pw6-tired', title: 'Why you feel tired', phase: 'reasoning',
      paragraphs: [
        'Holding a heavy object still, or pushing a wall, makes you tired. To keep applying a force, your muscles keep contracting and relaxing, and that uses up energy stored in your body. You feel tired even though, in the scientific sense, you do no work on the object.',
        'A weightlifter holding a barbell steady above her head does no work on the barbell: the barbell is not displaced. Her body still uses energy.',
      ],
      misconception: { wrong: 'If I feel tired, I must have done work on the object.', right: 'Tiredness is the body using energy. Work on the object needs the object to be displaced along the force.' },
      check: pick('chk-pw6-tired', 'A weightlifter holds a barbell steady above her head and gets tired. Which statement is correct?', [
        ['She does no work on the barbell, but her muscles use up energy', null],
        ['She does work on the barbell, because she gets tired', 'Tiredness comes from her muscles using energy. The barbell is not displaced, so no work is done on it.', 'tired_is_work'],
      ], 'Tiredness is not work on the object.', undefined, 'pw6-tired'),
    },
    {
      id: 'pw7-perp', title: 'A force at right angles to the motion', phase: 'reasoning',
      paragraphs: [
        'A girl carries a box and walks along a level path. To carry it she holds it up with an upward force that balances its weight, while the box moves horizontally. The force is upwards and the displacement is horizontal: they are perpendicular. There is no displacement in the direction of her force, so her force does no work on the box.',
        'In the same way, the weight of an object that moves horizontally acts downwards while the displacement is horizontal: the weight does no work either. (If she also speeds the box up along the path, that extra horizontal force does work.)',
      ],
      visual: workVisual({ setup: w({ forceN: 20, angleDeg: 90, displacement: 4, massKg: 2 }), progress: 1 }, 'A girl carrying a 2 kg box 4 m along a level path with a 20 N upward force.'),
      notice: 'The force arrow points up; the displacement arrow points sideways.',
      check: pick('chk-pw7-perp', 'The girl carries the box 4 m along a level path, holding it up with 20 N. How much work does her upward force do on the box?', [
        ['0 J: the force is perpendicular to the displacement', null],
        ['80 J', '20 N × 4 m would be the work if the box moved 4 m upwards. It moves horizontally, so there is no displacement along her force.', 'perp_is_work'],
      ], 'Perpendicular: zero work.', undefined, 'pw7-perp'),
    },
    {
      id: 'pw8-angle', title: 'Enrichment: a force at any angle (beyond this chapter)', phase: 'apply',
      paragraphs: [
        'ENRICHMENT, not required by the textbook (it says you will learn this in higher grades). When a force is neither along nor perpendicular to the displacement, only its component along the displacement counts. For a force F at an angle θ to the displacement, W = F × s × cos θ. At 0° this is F × s, at 90° it is zero, and at 180° it is −F × s.',
        'For example, a 10 N pull at 60° to a displacement of 4 m has a component of 10 × cos 60° = 5 N along the displacement, so W = 5 N × 4 m = 20 J. You can try any angle in the Work Laboratory under "More settings".',
      ],
      visual: workVisual({ setup: w({ forceN: 10, angleDeg: 60, displacement: 4, massKg: 2 }), progress: 1 }, 'A 10 N force at 60 degrees to a displacement of 4 m.'),
      notice: 'Only the part of the force along the displacement does work.',
    },
  ],
  investigation: lab('B', 'Apply a force to an object that stays still, then to one that moves sideways, and compare the work.'),
  worked: {
    id: 'w-pw-l2', title: 'Carrying a bag along a corridor',
    given: ['A student carries a 4 kg bag 10 m along a level corridor at a steady pace.', 'Take g = 10 m/s².'], ask: 'How much work does the upward force of her hand do on the bag?',
    visual: workVisual({ setup: w({ forceN: 40, angleDeg: 90, displacement: 10, startPos: 1, massKg: 4 }), progress: 1 }, 'A 4 kg bag carried 10 m along a level corridor with a 40 N upward force.'),
    steps: [
      { text: 'At a steady pace the upward force of the hand equals the weight: F = mg = 4 × 10 = 40 N, upwards.', why: 'The bag does not accelerate vertically, so the upward force balances the weight.' },
      { text: 'The displacement is 10 m along the corridor, horizontal.', why: 'The bag moves along the floor, not up or down.' },
      { text: 'The force is upwards and the displacement is horizontal, so they are perpendicular: there is no displacement along the force.', why: 'Work needs a displacement in the direction of the force (or against it).' },
      { text: 'Therefore W = 0 J (for example 40 N × 0 m along the force).', why: 'A force perpendicular to the displacement does zero work.' },
    ],
    verify: 'The weight also acts downwards, perpendicular to the displacement, so gravity also does 0 J: the bag\'s kinetic energy does not change at a steady pace.',
  },
  guided: {
    id: 'g-pw-l2', prompt: 'A man pushes with 200 N on a rigid wall for five minutes. The wall does not move and he becomes tired.',
    steps: [
      { id: 'g1', prompt: 'Displacement.', question: pick('pw-g2-1', 'What is the displacement of the wall?', [
        ['Zero: the wall does not move', null],
        ['Large, because he pushes for five minutes', 'The displacement is how far the wall moves. It does not move, so it is zero. Time spent pushing does not matter.', 'time_for_work'],
      ], 'The wall is not displaced.', undefined, 'pw5-zero'), hints: ['Did the wall move?'] },
      { id: 'g2', prompt: 'Work on the wall.', question: numQ('pw-g2-2', 'How much work does he do on the wall, in joules?', 0, 'W = 200 N × 0 m = 0 J.', { unit: 'J', refresherId: 'pw5-zero', rules: [[[200], 'The force is 200 N but it is multiplied by the displacement, which is zero.', 'force_alone_is_work'], [[60000], 'You multiplied the force by the time. Time is not part of W = F × s.', 'time_for_work']] }), hints: ['W = F × s with s = 0.'] },
      { id: 'g3', prompt: 'Why tired?', question: pick('pw-g2-3', 'Why does he still feel tired?', [
        ['His muscles use up the body\'s energy to keep pushing', null],
        ['Because he did work on the wall', 'No work was done on the wall, because it did not move. Tiredness comes from the body using energy.', 'tired_is_work'],
      ], 'Tiredness is internal energy use.', undefined, 'pw6-tired'), hints: ['Think about what muscles do when you push.'] },
    ],
    conclusion: 'No displacement means zero work on the wall; he is tired because his muscles use energy, not because he did work on the wall.',
  },
  independent: [
    ind('i1', 'No displacement', 'nodisp', 'The weightlifter.', pick('pw-l2-i1', 'A weightlifter holds a barbell steady above her head. How much work does she do on the barbell while holding it?', [
      ['Zero: the barbell does not move', null],
      ['A lot, because the barbell is heavy', 'Heavy or not, the barbell is not displaced, so the work on it is zero.', 'force_alone_is_work'],
    ], 'Holding still: zero work on the barbell.', undefined, 'pw6-tired'), ['Is the barbell displaced?'], ['No displacement, zero work.']),
    ind('i2', 'No displacement', 'nodisp', 'A cupboard.', pick('pw-l2-i2', 'You push a cupboard with 300 N but it does not move. Which statement is correct?', [
      ['Your push does 0 J of work on the cupboard', null],
      ['Your push does 300 J of work on the cupboard', 'Work is force times displacement, and the displacement is zero.', 'force_alone_is_work'],
      ['Your push does 300 J of work because the force is 300 N', 'The newton is a unit of force, not of work, and a force alone does not do work without a displacement.', 'unit_confused'],
    ], 'Zero displacement: zero work.', undefined, 'pw5-zero'), ['What is the displacement of the cupboard?'], ['Zero, so W = 0.']),
    ind('i3', 'Perpendicular force', 'perp', 'A carried suitcase.', pick('pw-l2-i3', 'A porter carries a suitcase along a level platform at a steady pace. The work done by the upward force of her hand on the suitcase is:', [
      ['zero, because the force is perpendicular to the displacement', null],
      ['positive, because the force holds the suitcase up', 'Holding it up is a force, but the displacement is horizontal. With no displacement along the force the work is zero, not positive.', 'perp_is_work'],
      ['negative, because the force opposes gravity', 'The sign of work depends on the force and the displacement, not on gravity. Here they are perpendicular, so the work is zero.', 'perp_is_work'],
    ], 'Perpendicular: zero.', undefined, 'pw7-perp'), ['Compare the direction of her force with the direction of the walk.'], ['Perpendicular, so zero.']),
    ind('i4', 'Perpendicular force', 'perp', 'A sliding puck.', pick('pw-l2-i4', 'A hockey puck slides across level ice. Its weight acts downwards. What work does its weight do while it slides horizontally?', [
      ['Zero: the weight is perpendicular to the displacement', null],
      ['Negative: the weight pulls against the motion', 'The weight acts downwards, at right angles to the horizontal motion, so it does not pull against the motion.', 'perp_is_work'],
    ], 'Weight is perpendicular to a horizontal displacement.', undefined, 'pw7-perp'), ['Which way does the weight act, and which way does the puck move?'], ['Perpendicular, zero work.']),
    ind('i5', 'Deciding', 'decide', 'A box that stays.', numQ('pw-l2-i5', 'A box is pushed with 50 N but does not move. How much work does the push do on the box, in joules?', 0, 'The displacement is zero, so W = 50 × 0 = 0 J.', { unit: 'J', refresherId: 'pw5-zero', rules: [[[50], 'The 50 N is the force. Work also needs a displacement, and it is zero here.', 'force_alone_is_work']] }), ['Is there a displacement?'], ['Zero.']),
    ind('i6', 'Deciding', 'decide', 'Which direction?', pick('pw-l2-i6', 'A 15 N force acts on an object while it is displaced 4 m. For which direction of the force is the work done by this force exactly zero?', [
      ['The force is perpendicular to the displacement', null],
      ['The force is along the displacement', 'A force along the displacement does positive work (15 × 4 = 60 J), not zero.', 'sign_confused'],
      ['The force is opposite to the displacement', 'A force opposite to the displacement does negative work (−60 J), which is not zero.', 'sign_confused'],
    ], 'Only a perpendicular force (or no force or no displacement) gives zero.', undefined, 'pw7-perp'), ['Which case has no displacement along the force?'], ['Perpendicular.']),
  ],
  reflection: {
    discover: 'The work is zero when the force is zero, when the object is not displaced, or when the force is perpendicular to the displacement. Being tired is the body using energy; it is not work done on the object. A force at another angle does work only through its component along the displacement (enrichment).',
    evidence: 'You decided when a force does no work in several situations, including carrying a box and holding a weight.',
    stillConfusing: [{ text: 'Why is no work done when nothing moves?', refresherId: 'pw5-zero' }, { text: 'Why do I feel tired then?', refresherId: 'pw6-tired' }, { text: 'Why does a sideways motion mean zero work?', refresherId: 'pw7-perp' }],
  },
};
