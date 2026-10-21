/**
 * Class 9 Physics, Chapter 10 "Sound Waves": Unit 1, Lessons 1 to 3 (SND-1), Sections 10.1, 10.1.1, 10.2 and 10.2.1.
 * Lesson 1: sound comes from vibration (Activity 10.1). Lesson 2: the tuning fork and other sources (Activity 10.2, Pause and
 * Ponder 1 and 2). Lesson 3: sound needs a medium (Activities 10.3 and 10.4, Pause and Ponder 3).
 * Wording, figures and numbers are original. Every figure is drawn from the Vibration or bell-jar model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { bellVisual, ind, numQ, pick, vibVisual } from './questions';

const LAB = '/physics/sound/vibration';
const vibLab = (description: string): Investigation => ({ title: 'Try it in the Vibration Laboratory', description, href: LAB, buttonLabel: 'Open the Vibration Laboratory' });

// ---------------------------------------------------------------------------
// Lesson 1: Sound comes from vibration  (Section 10.1, Activity 10.1)
// ---------------------------------------------------------------------------

export const S1: EduLesson = {
  id: 'ps-l1', unitId: 'ps-unit-1', number: 1, title: 'Sound comes from vibration',
  objective: 'say what a vibration is, explain that sound is made only while something vibrates, and name the vibrating part of everyday sound sources.',
  prerequisiteIds: ['psp-tofro'],
  objectives: [
    { id: 'vibrate', label: 'Describe a vibration as to-and-fro motion about a rest position' },
    { id: 'cause', label: 'Explain that sound is produced while an object vibrates and stops when it stops' },
    { id: 'sources', label: 'Name the vibrating part of everyday sound sources' },
  ],
  steps: [
    {
      id: 'ps1-notice', title: 'Something moves whenever there is sound', phase: 'observe',
      paragraphs: [
        'Stretch a rubber band across an open box and pluck it. You hear a sound. Look closely and you can see the band blurring: it is moving quickly to and fro. Hold it still with a finger and the sound stops at once.',
        'Try it with a stretched band between two fingers, held near your ear, and the sound is quieter but still there. In every case, as long as the band is moving to and fro, there is sound; when the band is still, there is none.',
      ],
      visual: vibVisual({ kind: 'string', strike: 0.8, t: 0.2 }, 'A plucked rubber band, drawn from the Vibration Laboratory model.'),
      notice: 'Look at the sound indicator: it is on while the band moves and off when the band is at rest.',
      check: pick('chk-ps1-notice', 'You pluck a rubber band and then touch it gently so that it stops moving. What happens to the sound?', [
        ['It stops, because the band is no longer vibrating', null],
        ['It carries on, because the sound is already made', 'The sound exists only while the band is moving. Once the band is still there is nothing to make more.', 'sound_persists'],
        ['It gets louder, because you are pressing on the band', 'Pressing on a vibrating band stops it from moving, so it makes less sound, not more.', 'press_louder'],
      ], 'No vibration, no sound.', undefined, 'ps1-notice'),
    },
    {
      id: 'ps1-vibration', title: 'What a vibration is', phase: 'reasoning',
      paragraphs: [
        'A vibration is a to-and-fro motion of an object about its rest position (the place where it sits when it is not disturbed). The band moves out on one side, back through the rest position, out on the other side, and back again. That whole trip is one cycle, also called an oscillation.',
        'The number of cycles each second tells you how fast it vibrates. A rubber band on a box might vibrate about 220 times every second. You cannot count that by eye, which is why it looks like a blur. The physics word for cycles per second is frequency, and its unit is the hertz (Hz); you will meet it properly in a later lesson.',
      ],
      vocabulary: [{ term: 'vibration (oscillation)', meaning: 'to-and-fro motion about a rest position' }, { term: 'cycle', meaning: 'one complete out-and-back trip of a vibration' }],
      misconception: { wrong: 'A vibrating object moves away from its rest position and keeps going.', right: 'It moves out and comes back, again and again, always about the same rest position.' },
      check: pick('chk-ps1-vibration', 'Which of these is a vibration?', [
        ['A guitar string moving quickly out and back about its straight position', null],
        ['A ball rolling steadily across a floor', 'The ball keeps moving away in one direction. A vibration returns again and again to the same rest position.', 'motion_not_vibration'],
        ['A stone dropped into a pond sinking to the bottom', 'The stone moves in one direction and stays at the bottom. A vibration goes to and fro.', 'motion_not_vibration'],
      ], 'To and fro about a rest position.', undefined, 'ps1-vibration'),
    },
    {
      id: 'ps1-stops', title: 'When the vibration fades, the sound fades', phase: 'reasoning',
      paragraphs: [
        'After you pluck a band, the vibration does not last for ever: it gets smaller and smaller, because the band gives energy to the air and to the box. The sound gets quieter at the same rate. When the vibration has died away, the sound has stopped.',
        'So sound and vibration go together: while the object vibrates, it makes sound, and when it comes to rest, the sound is gone. This is true of strings, drums, bells, flutes and voices.',
      ],
      visual: vibVisual({ kind: 'string', strike: 0.8, t: 3 }, 'The same band three seconds after the pluck.'),
      notice: 'Compare the size of the vibration now with its size at the start. It is smaller, and the loudness bar is lower.',
      check: pick('chk-ps1-stops', 'A struck bell is ringing quietly and slowly stops. Which statement fits?', [
        ['The bell is vibrating less and less, and the sound fades with it', null],
        ['The bell has stopped vibrating but the sound continues', 'If the bell has stopped vibrating, nothing is making sound. The sound can only last while the vibration does.', 'sound_persists'],
      ], 'Fading vibration, fading sound.', undefined, 'ps1-stops'),
    },
    {
      id: 'ps1-sources', title: 'Find the vibrating part', phase: 'apply',
      paragraphs: [
        'An object that produces sound is called a source of the sound. Sound is made by vibrating strings (a sitar or a guitar), by vibrating skins or membranes (a tabla or a drum), by a vibrating column of air (blow across a bansuri, or any flute), and by many other vibrating objects. In most instruments more than one part vibrates.',
        'People make sound with their vocal cords: two tightly stretched flaps in the throat. Touch your throat gently while you hum and you can feel them vibrate. Some animals make sound by rubbing body parts together: a cricket rubs its wings.',
      ],
      vocabulary: [{ term: 'source', meaning: 'the object that produces a sound' }],
      check: pick('chk-ps1-sources', 'When you blow across a bansuri (a bamboo flute), which part vibrates to make the sound?', [
        ['The column of air inside the pipe', null],
        ['The bamboo wall of the pipe, only', 'The pipe is the container. The air inside it is what vibrates to produce the note.', 'wrong_part'],
        ['Nothing: the breath alone is the sound', 'Moving air by itself is not sound. A vibrating air column inside the pipe makes the sound.', 'breath_is_sound'],
      ], 'A vibrating air column.', undefined, 'ps1-sources'),
    },
  ],
  investigation: vibLab('Pluck the rubber band, change how hard, and watch the vibration and the sound start and stop together.'),
  worked: {
    id: 'w-ps-l1', title: 'How long does the sound of a plucked band last?',
    given: ['A rubber band on a box is plucked at time 0 and vibrates 220 times every second.', 'Its vibration fades so that it is too small to notice after about 5.5 seconds.'],
    ask: 'How many cycles does it complete in the first second, and when does the sound stop?',
    visual: vibVisual({ kind: 'string', strike: 0.8, t: 0 }, 'The plucked band at the moment of the pluck.'),
    steps: [
      { text: 'It vibrates 220 times each second, so in the first second it completes 220 cycles.', why: 'Cycles per second times seconds: 220 × 1 = 220.' },
      { text: 'During those 220 cycles the band is moving to and fro about its rest position, so it is making sound.', why: 'Sound is produced while the object vibrates.' },
      { text: 'After about 5.5 s the vibration is too small to notice. The band is then at rest, so the sound has stopped.', why: 'No vibration means no sound.' },
      { text: 'If you touch the band at 2 s to stop it, the sound stops at 2 s instead.', why: 'Stopping the vibration stops the sound at once; the sound never outlasts the vibration.' },
    ],
    verify: 'The sound lasts exactly as long as the vibration does: about 5.5 s if left alone, or until you stop the band.',
  },
  guided: {
    id: 'g-ps-l1', prompt: 'A drum is struck. Rice grains sprinkled on the drum skin jump about, and you hear a loud sound. Later you press your palm flat on the skin.',
    steps: [
      { id: 'g1', prompt: 'What the grains show.', question: pick('ps-g1-1', 'The grains jump while the drum sounds. What does this tell you about the drum skin?', [
        ['The skin is vibrating', null],
        ['The skin is at rest', 'Grains that jump are being moved by the skin, so the skin is moving to and fro.', 'rest_confused'],
      ], 'Jumping grains show a vibrating skin.', undefined, 'ps1-notice'), hints: ['What would make the grains move?'] },
      { id: 'g2', prompt: 'Pressing the skin.', question: pick('ps-g1-2', 'You press your palm on the skin so that it cannot move. What happens to the sound?', [
        ['It stops', null],
        ['It gets louder', 'Pressing stops the skin vibrating, so less sound is made.', 'press_louder'],
      ], 'A still skin makes no sound.', undefined, 'ps1-stops'), hints: ['Think of touching the rubber band.'] },
      { id: 'g3', prompt: 'Counting vibrations.', question: numQ('ps-g1-3', 'The skin vibrates 150 times every second. How many cycles does it complete in 2 seconds?', 300, '150 cycles each second for 2 seconds: 150 × 2 = 300.', { refresherId: 'psp-tf-step' }), hints: ['Cycles per second times the number of seconds.'] },
    ],
    conclusion: 'A drum sounds while its skin vibrates (the grains show it), and stops when the skin is held still; 150 cycles a second for 2 seconds is 300 cycles.',
  },
  independent: [
    ind('i1', 'What a vibration is', 'vibrate', 'Which is a vibration?', pick('ps-l1-i1', 'Which description fits a vibration?', [
      ['Moving out and back, again and again, about a rest position', null],
      ['Moving steadily in one direction', 'A vibration returns again and again to the same rest position.', 'motion_not_vibration'],
      ['Staying perfectly still', 'A vibrating object is moving, to and fro.', 'rest_confused'],
    ], 'To and fro about a rest position.', undefined, 'ps1-vibration'), ['A swing is a good picture.'], ['To and fro about a rest position.']),
    ind('i2', 'Counting cycles', 'vibrate', 'A fork vibrating.', numQ('ps-l1-i2', 'A tuning fork vibrates 256 times every second. How many cycles does it complete in half a second?', 128, '256 × 0.5 = 128 cycles.', { refresherId: 'psp-tf-step', rules: [[[512], 'You doubled instead of halving. Half a second is half of the cycles in one second.', 'wrong_operation']] }), ['Half a second is half of one second.'], ['256 × 0.5 = 128.']),
    ind('i3', 'Sound and vibration go together', 'cause', 'A bell.', pick('ps-l1-i3', 'A bell is ringing. You grip it firmly and the sound stops. Why?', [
      ['Gripping stopped the vibration, and no vibration means no sound', null],
      ['The sound was used up', 'Sound is not a stock that gets used up. It lasts only as long as something vibrates.', 'sound_persists'],
      ['The bell cooled down', 'Temperature is not the reason. Holding the bell stops it vibrating.', 'wrong_reason'],
    ], 'No vibration, no sound.', undefined, 'ps1-stops'), ['What did your hand stop?'], ['It stopped the vibration.']),
    ind('i4', 'Sound and vibration go together', 'cause', 'Fading.', pick('ps-l1-i4', 'A guitar string is plucked once and left alone. What happens to the vibration and to the sound?', [
      ['Both fade together and stop together', null],
      ['The vibration stops first and the sound carries on', 'The sound lasts only while the string vibrates, so the sound cannot outlast it.', 'sound_persists'],
      ['The sound stays the same until the string is touched', 'The vibration dies away by itself, so the sound fades by itself.', 'no_fade'],
    ], 'They fade together.', undefined, 'ps1-stops'), ['Look at the loudness bar in the picture.'], ['Both fade together.']),
    ind('i5', 'Vibrating parts', 'sources', 'A tabla.', pick('ps-l1-i5', 'Which part of a tabla vibrates to make the sound when it is struck?', [
      ['The stretched skin on the drum head', null],
      ['The wooden stand it sits on', 'The stand is not what makes the sound. The stretched skin vibrates.', 'wrong_part'],
      ['The player\'s hands', 'The hands start the vibration but the sound comes from the vibrating skin.', 'wrong_part'],
    ], 'A vibrating skin.', undefined, 'ps1-sources'), ['It is a drum.'], ['The skin vibrates.']),
    ind('i6', 'Vibrating parts', 'sources', 'The human voice.', pick('ps-l1-i6', 'In a person speaking, which parts vibrate to produce the sound?', [
      ['The vocal cords in the throat', null],
      ['The teeth', 'The teeth do not vibrate to make the voice. The vocal cords do.', 'wrong_part'],
      ['The ears', 'The ears are for hearing, not for making the sound.', 'wrong_part'],
    ], 'The vocal cords.', undefined, 'ps1-sources'), ['Touch your throat while humming.'], ['The vocal cords.']),
  ],
  reflection: {
    discover: 'Sound is produced by vibrating objects. A vibration is to-and-fro motion about a rest position; the number of cycles each second is its frequency. The sound lasts exactly as long as the vibration, and the object that makes the sound is called its source.',
    evidence: 'You described a vibration, linked sound to vibration with a rubber band and a drum, counted cycles, and named the vibrating part of several sources.',
    stillConfusing: [{ text: 'What is a vibration?', refresherId: 'ps1-vibration' }, { text: 'Why does the sound stop?', refresherId: 'ps1-stops' }, { text: 'What is vibrating in an instrument?', refresherId: 'ps1-sources' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 2: The tuning fork and other sources  (Section 10.1.1, Activity 10.2, P&P 1 and 2)
// ---------------------------------------------------------------------------

export const S2: EduLesson = {
  id: 'ps-l2', unitId: 'ps-unit-1', number: 2, title: 'The tuning fork and other sources',
  objective: 'use a tuning fork as evidence that sound comes from vibration, predict how tension, length and thickness change the sound of a string, and match instruments to their vibrating parts.',
  prerequisiteIds: ['psp-tofro'],
  objectives: [
    { id: 'fork', label: 'Explain what a tuning fork shows about sound and vibration' },
    { id: 'string', label: 'Predict how tension, length and thickness change the sound of a string' },
    { id: 'instruments', label: 'Match instruments to the parts that vibrate' },
  ],
  steps: [
    {
      id: 'ps2-fork', title: 'A tuning fork is a steady source', phase: 'observe',
      paragraphs: [
        'A tuning fork is a U-shaped bar of steel or aluminium on a stem. The two sides of the U are the prongs. You strike one prong gently on a soft rubber pad (never on a hard surface) and hold the fork near your ear: you hear a clear, steady note that slowly fades.',
        'Touch a vibrating prong to the surface of water and ripples spread out. The water is being pushed to and fro, which shows that the prong is vibrating. The sound and the vibration go together, just as with the rubber band.',
      ],
      visual: vibVisual({ kind: 'fork', hz: 256, strike: 1, t: 0.5 }, 'A struck 256 hertz tuning fork, drawn from the Vibration Laboratory model.'),
      notice: 'The two prongs move in opposite directions: when one swings out, the other swings out the other way.',
      check: pick('chk-ps2-fork', 'A vibrating tuning fork touches the surface of water and ripples form. What does this show?', [
        ['The prong is vibrating and pushing the water to and fro', null],
        ['The fork is hot and heats the water', 'The ripples are caused by motion, not heat. The prong moves the water to and fro.', 'wrong_reason'],
        ['The fork has stopped vibrating', 'Ripples can only be made by something moving, so the prong is vibrating.', 'rest_confused'],
      ], 'Ripples show the prong vibrating.', undefined, 'ps2-fork'),
    },
    {
      id: 'ps2-hz', title: 'Each fork has its own number of cycles every second', phase: 'reasoning',
      paragraphs: [
        'A tuning fork always vibrates at the same rate when struck: a 256 hertz fork completes 256 cycles every second, whether it is struck hard or softly. How hard it is struck changes how big the vibration is, and so how loud the note is at first, but not how many cycles happen each second.',
        'That is why forks are used to compare other sounds: they give a steady note of a known rate. A fork that vibrates more times every second has a higher frequency and gives a higher note.',
      ],
      vocabulary: [{ term: 'frequency', meaning: 'the number of cycles each second, measured in hertz (Hz)' }],
      check: pick('chk-ps2-hz', 'You strike a 256 hertz fork harder. What changes?', [
        ['The vibration is bigger and the note louder, but it is still 256 cycles every second', null],
        ['It now vibrates faster than 256 times each second', 'Striking harder changes the size of the vibration, not the rate. The fork always vibrates at its own frequency.', 'harder_faster'],
      ], 'Harder means bigger, not faster.', undefined, 'ps2-hz'),
    },
    {
      id: 'ps2-string', title: 'Changing a string changes its sound', phase: 'apply',
      paragraphs: [
        'On a rubber band or a guitar string, you can change the sound three ways. Stretch it tighter (more tension) and it vibrates faster, so the note is higher. Make the vibrating part shorter (press it down) and it vibrates faster, so the note is higher. Use a thicker band or string and it vibrates more slowly, so the note is lower.',
        'In the Vibration Laboratory the band starts at 220 hertz at the starting tension, 40 cm long and the starting thickness. The laboratory uses a rule for an ideal string to show the direction and the size of each change; the exact rule is beyond Class 9, but you can test every change yourself.',
      ],
      vocabulary: [{ term: 'tension', meaning: 'how tightly a string or band is stretched' }],
      visual: vibVisual({ kind: 'string', string: { tension: 1.44 }, strike: 0.8, t: 0.2 }, 'The band stretched to 1.44 times the starting tension, drawn from the model.'),
      notice: 'The frequency reading is higher than 220 hertz. More tension: more cycles every second.',
      misconception: { wrong: 'A thicker band must vibrate faster because it is stronger.', right: 'A thicker (heavier) band is harder to move, so with the same tension and length it vibrates more slowly and the note is lower.' },
      check: pick('chk-ps2-string', 'You tighten a guitar string. What happens to the frequency of its note?', [
        ['It increases: more cycles every second', null],
        ['It decreases', 'A tighter string snaps back faster, so it vibrates more often each second.', 'direction_reversed'],
        ['It stays the same', 'The tension changes how fast the string vibrates, so the frequency changes.', 'no_change'],
      ], 'More tension, higher frequency.', undefined, 'ps2-string'),
    },
    {
      id: 'ps2-instr', title: 'Instruments and their vibrating parts', phase: 'apply',
      paragraphs: [
        'Make a list of musical instruments and, for each one, say which part vibrates. A sitar, a tanpura and a violin: stretched strings. A tabla, a mridangam and a dholak: stretched skins (membranes). A bansuri and a shehnai: columns of air. A bell or a taal (a metal instrument): the metal itself vibrates.',
        'Many instruments use more than one vibrating part. A sitar string makes the vibration, but the wooden body also vibrates and helps to carry the sound to the air. The wider point is always the same: find what is moving to and fro.',
      ],
      check: pick('chk-ps2-instr', 'Which part vibrates to make the main sound of a sitar?', [
        ['The stretched strings', null],
        ['The tuning pegs', 'The pegs hold the strings in tune but they do not make the sound.', 'wrong_part'],
        ['The player\'s fingers', 'The fingers start the vibration; the strings are what vibrate.', 'wrong_part'],
      ], 'A vibrating string.', undefined, 'ps2-instr'),
    },
  ],
  investigation: vibLab('Switch between the string and the tuning fork, change the tension, length and thickness, and read the frequency.'),
  worked: {
    id: 'w-ps-l2', title: 'Tightening a rubber band',
    given: ['A band on a box vibrates at 220 Hz when the tension is 1 (the starting tension), the length is 40 cm and the thickness is 1.', 'The tension is raised to 1.44 times the starting tension. Nothing else changes.', 'In the laboratory model the frequency is 220 Hz × √(tension).'],
    ask: 'What is the new frequency, and is the note higher or lower?',
    visual: vibVisual({ kind: 'string', string: { tension: 1.44 }, strike: 0.8, t: 0 }, 'The band at 1.44 times the starting tension.'),
    steps: [
      { text: 'The new tension is 1.44, so the factor is √1.44 = 1.2.', why: 'The model multiplies the frequency by the square root of the tension ratio (1.2 × 1.2 = 1.44).' },
      { text: 'New frequency = 220 Hz × 1.2 = 264 Hz.', why: 'Multiply the starting frequency by the factor.' },
      { text: '264 Hz is more than 220 Hz, so the band vibrates more times each second.', why: 'More cycles every second is a higher frequency.' },
      { text: 'The note is higher.', why: 'A higher frequency gives a higher-pitched note: the direction the book teaches (tighter band, higher sound).' },
    ],
    verify: 'Tighter band: 264 Hz instead of 220 Hz, so a higher note, matching what you hear and see in the laboratory.',
  },
  guided: {
    id: 'g-ps-l2', prompt: 'A rubber band on a box starts at 220 Hz (tension 1, length 40 cm, thickness 1). You change one thing at a time.',
    steps: [
      { id: 'g1', prompt: 'Tighter.', question: pick('ps-g2-1', 'You stretch the band tighter. Does the frequency go up or down?', [
        ['Up', null], ['Down', 'A tighter band vibrates faster, so the frequency goes up.', 'direction_reversed'],
      ], 'More tension, more cycles each second.', undefined, 'ps2-string'), hints: ['Think of how a tight band snaps back.'] },
      { id: 'g2', prompt: 'The number.', question: numQ('ps-g2-2', 'The tension becomes 1.44 times the starting tension. What is the frequency in hertz (220 Hz × √1.44)?', 264, '√1.44 = 1.2, and 220 × 1.2 = 264.', { unit: 'Hz', tolerance: 0.5, refresherId: 'ps2-string', rules: [[[316.8, 316], 'You multiplied by 1.44 instead of by its square root, 1.2.', 'no_square_root']] }), hints: ['√1.44 = 1.2.'] },
      { id: 'g3', prompt: 'Longer.', question: pick('ps-g2-3', 'You now make the vibrating part longer, with everything else unchanged. What happens to the frequency?', [
        ['It goes down', null], ['It goes up', 'A longer string vibrates more slowly, so the frequency goes down.', 'direction_reversed'],
      ], 'Longer, slower, lower.', undefined, 'ps2-string'), hints: ['A short string (pressed down on a guitar) gives a higher note.'] },
    ],
    conclusion: 'Tighter gives a higher frequency (264 Hz at 1.44 times the tension); longer gives a lower one.',
  },
  independent: [
    ind('i1', 'What the fork shows', 'fork', 'Ripples.', pick('ps-l2-i1', 'A tuning fork is struck and its prong is touched to water. Why do ripples form?', [
      ['The vibrating prong pushes the water to and fro', null],
      ['The sound waves heat the water', 'Ripples are made by motion, not heat. The moving prong disturbs the water.', 'wrong_reason'],
      ['The fork is at rest', 'A fork at rest would leave the water still.', 'rest_confused'],
    ], 'A vibrating prong makes ripples.', undefined, 'ps2-fork'), ['What can make water move?'], ['The prong vibrates.']),
    ind('i2', 'What the fork shows', 'fork', 'Harder strike.', pick('ps-l2-i2', 'A 512 hertz fork is struck softly and then hard. Which statement is correct?', [
      ['Both times it vibrates 512 times every second; the hard strike makes bigger vibrations', null],
      ['The hard strike makes it vibrate more than 512 times every second', 'A fork vibrates at its own frequency however hard it is struck.', 'harder_faster'],
      ['The soft strike makes it vibrate fewer than 512 times every second', 'The frequency stays the same; only the size of the vibration changes.', 'harder_faster'],
    ], 'Same frequency, bigger vibration.', undefined, 'ps2-hz'), ['Which quantity does the fork fix?'], ['512 cycles each second either way.']),
    ind('i3', 'Changing a string', 'string', 'Tension number.', numQ('ps-l2-i3', 'A band at 220 Hz is loosened to 0.81 times the starting tension (frequency = 220 Hz × √tension). What is its frequency in hertz?', 198, '√0.81 = 0.9, and 220 × 0.9 = 198.', { unit: 'Hz', tolerance: 0.5, refresherId: 'ps2-string', rules: [[[178.2, 178], 'You multiplied by 0.81 instead of its square root, 0.9.', 'no_square_root']] }), ['√0.81 = 0.9.'], ['220 × 0.9 = 198 Hz.']),
    ind('i4', 'Changing a string', 'string', 'Shorter.', numQ('ps-l2-i4', 'In the laboratory model the frequency is 220 Hz × (40 ÷ length in cm). What is the frequency when the length is 50 cm, in hertz?', 176, '220 × (40 ÷ 50) = 220 × 0.8 = 176.', { unit: 'Hz', tolerance: 0.5, refresherId: 'ps2-string' }), ['40 ÷ 50 = 0.8.'], ['220 × 0.8 = 176 Hz. A longer band gives a lower frequency.']),
    ind('i5', 'Instruments', 'instruments', 'A shehnai.', pick('ps-l2-i5', 'In a shehnai or a bansuri, what vibrates to make the sound?', [
      ['A column of air in the pipe', null],
      ['A stretched string', 'These instruments have no strings. The air inside the pipe vibrates.', 'wrong_part'],
      ['A stretched skin', 'There is no skin in these instruments. The air column vibrates.', 'wrong_part'],
    ], 'A vibrating air column.', undefined, 'ps2-instr'), ['Both are pipes.'], ['A column of air.']),
    ind('i6', 'Instruments', 'instruments', 'Skin or string?', pick('ps-l2-i6', 'Which pair is correct?', [
      ['A mridangam: a stretched skin. A tanpura: stretched strings.', null],
      ['A mridangam: stretched strings. A tanpura: a stretched skin.', 'It is the other way round: the mridangam is a drum with skins; the tanpura has strings.', 'swapped'],
      ['Both make sound with a column of air.', 'Neither is a pipe: one uses skins and the other strings.', 'wrong_part'],
    ], 'A drum has skins; a tanpura has strings.', undefined, 'ps2-instr'), ['Drum or string instrument?'], ['Skin and strings.']),
  ],
  reflection: {
    discover: 'A struck tuning fork gives a steady note and makes ripples on water, showing that the sound comes from vibrating prongs. A fork has a fixed frequency; hitting it harder only makes the vibration bigger. A tighter, shorter or thinner string vibrates faster and gives a higher note. Every instrument has a vibrating part.',
    evidence: 'You explained the fork and the ripples, predicted and calculated how tension and length change a band\'s frequency, and matched instruments to their vibrating parts.',
    stillConfusing: [{ text: 'What does a tuning fork show?', refresherId: 'ps2-fork' }, { text: 'Does striking harder change the pitch?', refresherId: 'ps2-hz' }, { text: 'How does a string change?', refresherId: 'ps2-string' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 3: Sound needs a medium  (Sections 10.2 and 10.2.1, Activities 10.3 and 10.4, P&P 3)
// ---------------------------------------------------------------------------

export const S3: EduLesson = {
  id: 'ps-l3', unitId: 'ps-unit-1', number: 3, title: 'Sound needs a medium',
  objective: 'say that sound can travel through solids, liquids and gases but not through a vacuum, explain the bell-jar demonstration, and say why astronauts cannot talk to each other directly in space.',
  prerequisiteIds: ['psp-particles'],
  objectives: [
    { id: 'travel', label: 'Say that sound travels through solids, liquids and gases' },
    { id: 'vacuum', label: 'Explain the bell-jar demonstration: sound cannot travel through a vacuum' },
    { id: 'space', label: 'Apply the idea to space and to spacewalking astronauts' },
  ],
  steps: [
    {
      id: 'ps3-solids', title: 'Does sound travel through a desk, and through water?', phase: 'observe',
      paragraphs: [
        'Ask a friend to scratch gently on one side of a desk. First listen with your ear in the air. Then put your ear flat against the desk and close your other ear. The scratching sounds clearer through the desk. So sound can travel through a solid.',
        'Fill a tub with water and tap two metal spoons together, first in the air and then with both spoons under the water. You can still hear the tap. The sound reached you through the water (and the air above it). So sound can travel through a liquid as well as through the air, which is a gas.',
      ],
      check: pick('chk-ps3-solids', 'You hear a friend scratching a desk much better when your ear is pressed on the desk. What does this show?', [
        ['Sound can travel through a solid', null],
        ['Sound can only travel through air', 'The desk carried the sound to your ear, so a solid can carry sound.', 'only_air'],
        ['The desk is making its own sound', 'Your friend scratching is the source. The desk carries the sound to your ear.', 'wrong_reason'],
      ], 'A solid can carry sound.', undefined, 'ps3-solids'),
    },
    {
      id: 'ps3-medium', title: 'A medium is the material the sound passes through', phase: 'reasoning',
      paragraphs: [
        'The material that carries sound from the source to the listener is called a medium. A medium can be a solid, a liquid or a gas. Sound travels from a vibrating source because the vibration is passed on from particle to particle of the medium: the source pushes the particles next to it, they push the ones beyond, and so on.',
        'A space with no matter in it at all is called a vacuum. If there were no particles between you and the source, there would be nothing to pass the vibration on. So the question is whether sound can cross a vacuum. The answer comes from an experiment.',
      ],
      vocabulary: [{ term: 'medium', meaning: 'the material through which sound travels (solid, liquid or gas)' }, { term: 'vacuum', meaning: 'a space with no matter in it' }],
      check: pick('chk-ps3-medium', 'Which of these is a medium that can carry sound?', [
        ['Steel, water or air', null],
        ['A vacuum', 'A vacuum has no particles to pass the vibration on, so it is not a medium for sound.', 'vacuum_carries'],
      ], 'Solids, liquids and gases.', undefined, 'ps3-medium'),
    },
    {
      id: 'ps3-belljar', title: 'The bell in a jar', phase: 'reasoning',
      paragraphs: [
        'Put an electric bell inside a glass jar and switch it on: you can hear it. Now pump the air out of the jar. As the air goes, the sound becomes fainter. When almost all the air has gone, you can still see the bell ringing (the clapper is moving) but you can hardly hear anything. Let the air back in and the sound returns, gradually becoming as loud as before.',
        'Move the slider in the picture below to take air out and put it back. The bell keeps ringing the whole time; only the amount of air changes. This shows that sound cannot travel through a vacuum: sound needs a medium.',
      ],
      visual: bellVisual({ pressure: 1, editable: true }, 'A bell in a jar with a slider for the amount of air.'),
      notice: 'Watch the clapper and the loudness bar separately: the clapper always moves, but the loudness bar falls as the air is removed.',
      check: pick('chk-ps3-belljar', 'Almost all the air has been pumped out of the jar, but you can see the bell clapper moving. What do you hear?', [
        ['Almost nothing, because there is almost no medium to carry the sound out of the jar', null],
        ['The same loud sound, because the bell is still ringing', 'The bell rings, but the vibration needs air to carry it to the glass and out. With almost no air the sound hardly gets out.', 'sound_persists'],
      ], 'No medium, no sound reaches you.', undefined, 'ps3-belljar'),
    },
    {
      id: 'ps3-space', title: 'Sound in space', phase: 'apply',
      paragraphs: [
        'Outer space is almost a vacuum. Two astronauts on a spacewalk cannot talk to each other directly or hear metal tools clanging together, because there is no air between them to carry the sound. They talk using radios built into their spacesuits.',
        'The same idea explains a film scene in which a spacecraft explodes in space with a bang. A flash of light could cross space, because light does not need a medium, but the sound of the bang could not. In the real vacuum of space it would be silent.',
      ],
      misconception: { wrong: 'In space, sound would still be there but too faint to hear.', right: 'With no medium between source and listener, no sound is carried at all.' },
      check: pick('chk-ps3-space', 'Why can two astronauts on a spacewalk not hear each other speak directly?', [
        ['There is almost no air (no medium) between them to carry the sound', null],
        ['Their helmets are too thick', 'The helmets are not the main reason. In the vacuum of space there is no medium to carry sound between them.', 'wrong_reason'],
        ['Sound is too quiet in the cold', 'Temperature is not the reason. There is simply no medium.', 'wrong_reason'],
      ], 'No medium in space.', undefined, 'ps3-space'),
    },
  ],
  worked: {
    id: 'w-ps-l3', title: 'Reading the bell jar',
    given: ['A bell rings in a jar. The air in the jar is reduced from 100 % of normal to 60 %, then to 20 %, then to 3 % (almost a vacuum).', 'In the model the loudness heard outside is proportional to the air above a cut-off of 3 % of normal.'],
    ask: 'How loud is the bell heard outside at 60 % and at 20 % of the normal air, and what happens at 3 %?',
    visual: bellVisual({ pressure: 0.6, editable: true }, 'The bell jar with 60 % of the normal air.'),
    steps: [
      { text: 'At 100 % air, the loudness heard is the full 100 %.', why: 'The jar is full of air, so the normal sound reaches you.' },
      { text: 'At 60 % air, the loudness is (0.60 − 0.03) ÷ 0.97 = 0.59, about 59 % of full.', why: 'Less air, so less of the vibration is carried out.' },
      { text: 'At 20 % air, the loudness is (0.20 − 0.03) ÷ 0.97 = 0.175, about 17.5 % of full.', why: 'Still less air, so fainter again.' },
      { text: 'At 3 % air (a near vacuum), the loudness heard is 0, although the bell is still ringing.', why: 'There is too little medium to carry the vibration out of the jar.' },
    ],
    verify: 'The sound grows fainter as air is removed (59 %, then 17.5 %, then 0) while the bell keeps ringing: sound needs a medium.',
  },
  guided: {
    id: 'g-ps-l3', prompt: 'You tap two spoons together under water in a tub, and you hear the tap.',
    steps: [
      { id: 'g1', prompt: 'What carried the sound?', question: pick('ps-g3-1', 'Which materials carried the sound from the spoons to your ear?', [
        ['The water, and also the air', null], ['Only the vacuum', 'A vacuum cannot carry sound. The water and the air did.', 'vacuum_carries'],
      ], 'Liquids and gases can carry sound.', undefined, 'ps3-solids'), hints: ['The spoons are in water and your ear is in air.'] },
      { id: 'g2', prompt: 'A conclusion.', question: pick('ps-g3-2', 'What does this activity show about liquids?', [
        ['Sound can travel through a liquid', null], ['Sound cannot travel through a liquid', 'You heard the tap, so the liquid carried the sound.', 'only_air'],
      ], 'Sound travels through liquids.', undefined, 'ps3-solids'), hints: ['You heard the tap.'] },
      { id: 'g3', prompt: 'The bell jar.', question: numQ('ps-g3-3', 'In the bell-jar model, what percentage of the full loudness is heard at 20 % of the normal air? (Use (air − 0.03) ÷ 0.97.)', 17.5, '(0.20 − 0.03) ÷ 0.97 = 0.175, so 17.5 %.', { unit: '%', tolerance: 0.6, refresherId: 'ps3-belljar' }), hints: ['0.20 − 0.03 = 0.17.'] },
    ],
    conclusion: 'Water and air carried the tap, so sound travels through liquids and gases; in the jar, 20 % of the air gives about 17.5 % of the loudness.',
  },
  independent: [
    ind('i1', 'What can carry sound', 'travel', 'Steel.', pick('ps-l3-i1', 'Which of these can carry sound?', [
      ['A solid, a liquid or a gas', null],
      ['Only a gas', 'Solids and liquids carry sound as well, as the desk and the water showed.', 'only_air'],
      ['Only a vacuum', 'A vacuum cannot carry sound at all.', 'vacuum_carries'],
    ], 'Solids, liquids and gases.', undefined, 'ps3-medium'), ['Think of the desk and the water.'], ['A solid, a liquid or a gas.']),
    ind('i2', 'What can carry sound', 'travel', 'The desk.', pick('ps-l3-i2', 'You press your ear on a long metal railing and hear a distant tap from the other end. Which medium carried the sound to you?', [
      ['The solid metal railing', null],
      ['A vacuum inside the railing', 'There is no vacuum in a solid railing. The metal itself carried the vibration.', 'vacuum_carries'],
      ['Nothing: the sound jumped through', 'A medium is always needed. Here the metal was the medium.', 'no_medium'],
    ], 'The solid carried it.', undefined, 'ps3-solids'), ['What is your ear touching?'], ['The metal railing.']),
    ind('i3', 'The bell jar', 'vacuum', 'Which observation?', pick('ps-l3-i3', 'Which observation best supports the idea that sound needs a medium to travel?', [
      ['The sound of a ringing bell fades as air is pumped out of the jar', null],
      ['A tuning fork can make ripples on water', 'That shows vibration, not that a medium is needed.', 'wrong_observation'],
      ['A rubber band blurs when plucked', 'That shows vibration, not that a medium is needed.', 'wrong_observation'],
    ], 'The fading bell shows that a medium is needed.', undefined, 'ps3-belljar'), ['Which observation changes when the medium is removed?'], ['The fading bell.']),
    ind('i4', 'The bell jar', 'vacuum', 'The number.', numQ('ps-l3-i4', 'In the bell-jar model, what percentage of the full loudness is heard at 60 % of the normal air? Round to the nearest whole number. (Use (air − 0.03) ÷ 0.97.)', 59, '(0.60 − 0.03) ÷ 0.97 = 0.5876, about 59 %.', { unit: '%', tolerance: 0.6, refresherId: 'ps3-belljar' }), ['0.60 − 0.03 = 0.57.'], ['0.57 ÷ 0.97 ≈ 0.588, about 59 %.']),
    ind('i5', 'Space', 'space', 'Astronauts.', pick('ps-l3-i5', 'Why do astronauts on a spacewalk use radios to talk?', [
      ['Sound cannot travel through the near-vacuum of space', null],
      ['Their voices are too deep', 'The voice is not the problem. There is no medium between them to carry it.', 'wrong_reason'],
      ['Space is too bright', 'Brightness is not the reason. There is no medium to carry sound.', 'wrong_reason'],
    ], 'No medium in space.', undefined, 'ps3-space'), ['What does sound need?'], ['A medium, which space lacks.']),
    ind('i6', 'Space', 'space', 'The film.', pick('ps-l3-i6', 'A film shows a spacecraft exploding in space with a loud bang. What is wrong with the sound?', [
      ['There is no medium in space to carry a bang, so it would be silent', null],
      ['The bang would be even louder in space', 'With no medium there would be no sound to hear.', 'wrong_reason'],
      ['Nothing is wrong, because space is full of air', 'Space is almost a vacuum, not full of air.', 'wrong_reason'],
    ], 'Silent in space.', undefined, 'ps3-space'), ['What carries a bang from the explosion to the listener?'], ['Nothing does in a vacuum.']),
  ],
  reflection: {
    discover: 'Sound travels through a medium: a solid, a liquid or a gas. It cannot travel through a vacuum, which is why the bell in a jar fades as the air is pumped out, and why astronauts in space cannot hear each other directly.',
    evidence: 'You used the desk and the spoons in water, read the bell-jar demonstration with numbers, and applied the idea to space.',
    stillConfusing: [{ text: 'Which materials carry sound?', refresherId: 'ps3-solids' }, { text: 'What is a medium and a vacuum?', refresherId: 'ps3-medium' }, { text: 'What does the bell jar show?', refresherId: 'ps3-belljar' }],
  },
};
