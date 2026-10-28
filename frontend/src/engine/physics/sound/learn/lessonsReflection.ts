/**
 * Class 9 Physics, Chapter 10 "Sound Waves": Unit 4 (Lesson 11, Sections 10.7 to 10.7.2) and Unit 5 (Lesson 12, Sections 10.8
 * and 10.8.1) (SND-3). Original wording and numbers; distances use d = v t ÷ 2; the 0.1 s and 0.05 s figures are the book's
 * approximate rules about hearing. Checked by `__tests__/soundComplete.test.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, numQ, pick } from './questions';

const CHAR_LAB = '/physics/sound/characteristics';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const S11: EduLesson = {
  id: 'ps-l11', unitId: 'ps-unit-4', number: 11, title: 'Echo and reverberation',
  objective: 'explain what an echo is and when one is heard, find a distance from an echo time (and the least distance for an echo), and tell an echo from reverberation.',
  prerequisiteIds: [],
  objectives: [
    { id: 'echo', label: 'Explain an echo and the 0.1 s rule' },
    { id: 'distance', label: 'Find a distance from an echo time with d = v t ÷ 2' },
    { id: 'reverb', label: 'Tell an echo from reverberation and how halls reduce it' },
  ],
  steps: [
    {
      id: 'ps11-reflect', title: 'Sound reflects', phase: 'observe',
      paragraphs: [
        'Sound bounces off hard surfaces such as walls, cliffs and buildings, following the same laws of reflection as light: the angle of incidence equals the angle of reflection. Hard, smooth surfaces reflect sound well; soft, rough ones (curtains, cushions) absorb much of it.',
        'A reflected sound that we hear separately, a little after the original, is an echo.',
      ],
      vocabulary: [{ term: 'echo', meaning: 'a reflected sound heard separately after the original' }],
      check: pick('chk-ps11-reflect', 'Which surface gives the clearest echo?', [['A large, hard rock face', null], ['A heavy curtain', 'Soft materials absorb sound instead of reflecting it well.', 'soft-reflects'], ['An open field', 'There is nothing nearby to reflect the sound.', 'no-reflector']], 'Hard, large surfaces reflect sound well.', undefined, 'ps11-reflect'),
    },
    {
      id: 'ps11-rule', title: 'When is an echo heard?', phase: 'reasoning',
      paragraphs: [
        'Our hearing keeps a sound for about a tenth of a second. So a reflection is heard as a separate echo only if it arrives at least about 0.1 s after the original sound. Sooner than that, it merges with the original.',
        'This 0.1 s is an approximate rule about hearing, not an exact law: it differs a little between people and kinds of sound.',
      ],
      visual: v('soundEcho', { distance: 17, medium: 'air-15' }, 'You and a wall 17 m away in air at 340 m/s: the reflection returns after 0.1 s, just enough for a separate echo.'),
      check: pick('chk-ps11-rule', 'A reflection reaches you 0.03 s after a clap. What do you hear?', [['No separate echo: it merges with the clap', null], ['A clear echo', 'A separate echo needs a gap of at least about 0.1 s.', 'any-reflection-echo']], 'Too soon for an echo.', undefined, 'ps11-rule'),
    },
    {
      id: 'ps11-distance', title: 'Distance from an echo', phase: 'apply',
      paragraphs: [
        'The sound goes to the wall AND back, so in a time t it covers 2d: 2d = v t, or d = v t ÷ 2. For the least distance that gives an echo, put t = 0.1 s: at 340 m/s, d = 340 × 0.1 ÷ 2 = 17 m.',
        'So a wall must be at least about 17 m away (in air at 340 m/s) for you to hear a separate echo.',
      ],
      visual: v('soundEcho', { editable: true, distance: 25, medium: 'air-15' }, 'Move the wall and change the medium to see the echo time and whether a separate echo is heard.'),
      notice: 'Move the wall closer than 17 m and watch the verdict change.',
      check: pick('chk-ps11-distance', 'An echo returns 0.4 s after a shout, with sound at 340 m/s. How far is the wall?', [['68 m', null], ['136 m', '340 × 0.4 = 136 m is the distance there AND back; halve it.', 'forgot-halving'], ['850 m', '340 ÷ 0.4 has no meaning here; distance = speed × time ÷ 2.', 'wrong-operation']], 'd = 340 × 0.4 ÷ 2 = 68 m.', undefined, 'ps11-distance'),
    },
    {
      id: 'ps11-reverb', title: 'Reverberation', phase: 'reasoning',
      paragraphs: [
        'In a large hall, sound reflects many times from the walls, ceiling and floor. When these reflections arrive very close together (the book says less than about 0.05 s apart), they merge and the sound seems to linger after the source stops. This persistence is reverberation.',
        'Too much reverberation makes speech unclear, so concert halls and auditoriums use sound-absorbing materials (curtains, panels, carpets, seats). Some old buildings use reflection deliberately: the whispering gallery of the Gol Gumbaz in Vijayapura carries a whisper around its dome.',
      ],
      check: pick('chk-ps11-reverb', 'How can reverberation in a hall be reduced?', [['Covering walls and ceiling with sound-absorbing materials', null], ['Painting the walls a lighter colour', 'Colour does not change how sound is reflected.', 'irrelevant-change'], ['Making the walls smoother and harder', 'That reflects even more sound.', 'soft-reflects']], 'Absorbing materials.', undefined, 'ps11-reverb'),
    },
  ],
  investigation: { title: 'Try the echo in the Sound Characteristics Laboratory', description: 'Move the wall and compare the echo time with the 0.1 s and 0.05 s rules.', href: CHAR_LAB, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ps-l11', title: 'Echo from a cliff',
    given: ['A hiker shouts and hears the echo 0.6 s later.', 'Speed of sound in air: 340 m/s.'],
    ask: 'How far away is the cliff, and could a separate echo be heard from a wall 10 m away?',
    steps: [
      { text: 'Distance travelled = 340 × 0.6 = 204 m.', why: 'Distance = speed × time.' },
      { text: 'The cliff is half of that: 204 ÷ 2 = 102 m.', why: 'The sound went to the cliff and back.' },
      { text: 'For a wall 10 m away: gap = 2 × 10 ÷ 340 ≈ 0.059 s.', why: 't = 2d ÷ v.' },
      { text: '0.059 s is less than 0.1 s, so no separate echo is heard from that wall.', why: 'A separate echo needs at least about 0.1 s.' },
    ],
    verify: 'At 102 m, 2 × 102 ÷ 340 = 0.6 s, as given.',
  },
  guided: {
    id: 'g-ps-l11', prompt: 'A girl claps in front of a building and hears the echo after 1 s (sound at 340 m/s).',
    steps: [
      { id: 'g1', prompt: 'Total path.', question: numQ('ps-g11-1', 'How far does the sound travel in total, in metres?', 340, '340 × 1 = 340 m.', { unit: 'm', rules: [[[170], '170 m is the one-way distance. The total path is there and back.', 'halved-early']] }), hints: ['Speed × time.'] },
      { id: 'g2', prompt: 'Distance to the building.', question: numQ('ps-g11-2', 'How far away is the building, in metres?', 170, '340 ÷ 2 = 170 m.', { unit: 'm', rules: [[[340], 'That is the total path; halve it.', 'forgot-halving']] }), hints: ['Halve the total path.'] },
      { id: 'g3', prompt: 'A closer wall.', question: pick('ps-g11-3', 'Would she hear a separate echo from a wall 8 m away?', [['No: the gap would be about 0.047 s, less than 0.1 s', null], ['Yes: every wall gives an echo', 'The reflection returns too soon to be heard separately.', 'any-reflection-echo']], 'Too close for a separate echo.', undefined, 'ps11-rule'), hints: ['t = 2 × 8 ÷ 340.'] },
    ],
    conclusion: 'The building is 170 m away; an 8 m wall returns the sound after about 0.047 s, too soon for a separate echo.',
  },
  independent: [
    ind('i1', 'Echo rule', 'echo', 'Echo or not.', pick('ps-l11-i1', 'Which reflection would be heard as a separate echo?', [['One arriving 0.3 s after the sound', null], ['One arriving 0.05 s after the sound', 'Below 0.1 s it merges with the original (reverberation range).', 'any-reflection-echo']], 'At least 0.1 s.'), ['Compare with 0.1 s.'], ['0.3 s ≥ 0.1 s: an echo.']),
    ind('i2', 'Echo rule', 'echo', 'Why 0.1 s.', pick('ps-l11-i2', 'Why must the reflected sound arrive at least about 0.1 s later to be heard as an echo?', [['The sensation of a sound lasts about 0.1 s in our hearing', null], ['Sound takes 0.1 s to reflect from any wall', 'The reflection itself is instant; the time is spent travelling.', 'reflection-delay']], 'Persistence of hearing.'), ['Think about the ear, not the wall.'], ['Our hearing holds each sound about 0.1 s.']),
    ind('i3', 'Distance', 'distance', 'Cliff.', numQ('ps-l11-i3', 'An echo is heard 2 s after a shout, with sound at 330 m/s. How far is the cliff, in metres?', 330, 'd = 330 × 2 ÷ 2 = 330 m.', { unit: 'm', rules: [[[660], '660 m is there and back; halve it.', 'forgot-halving']] }), ['d = v t ÷ 2.'], ['330 × 2 ÷ 2 = 330 m.']),
    ind('i4', 'Distance', 'distance', 'Least distance.', numQ('ps-l11-i4', 'Using the 0.1 s rule and sound at 344 m/s, what is the least distance of a wall for a separate echo, in metres?', 17.2, 'd = 344 × 0.1 ÷ 2 = 17.2 m.', { unit: 'm', tolerance: 0.01, rules: [[[34.4], '34.4 m is the round trip; halve it.', 'forgot-halving']] }), ['d = v × 0.1 ÷ 2.'], ['344 × 0.1 ÷ 2 = 17.2 m.']),
    ind('i5', 'Reverberation', 'reverb', 'What it is.', pick('ps-l11-i5', 'What is reverberation?', [['The lingering of sound in a hall because of many closely spaced reflections', null], ['A single clear echo from a distant cliff', 'That is an echo; reverberation is many merged reflections.', 'echo-vs-reverb']], 'Persistence from many reflections.'), ['Many reflections, close together.'], ['Repeated reflections merge and prolong the sound.']),
    ind('i6', 'Reverberation', 'reverb', 'Auditorium.', pick('ps-l11-i6', 'Why do cinema halls have curtains and soft seats?', [['To absorb sound and reduce reverberation', null], ['To make echoes louder', 'Soft materials absorb sound; they reduce reflections.', 'soft-reflects']], 'Absorption.'), ['Soft materials absorb.'], ['To cut down repeated reflections.']),
  ],
  reflection: {
    discover: 'An echo is a reflected sound heard at least about 0.1 s after the original; distance = v t ÷ 2; closely spaced reflections merge into reverberation, which halls control with absorbing materials.',
    evidence: 'You found distances from echo times, the least echo distance, and told echoes from reverberation.',
    stillConfusing: [
      { text: 'Why is it v t ÷ 2?', refresherId: 'ps11-distance' },
      { text: 'When is an echo heard?', refresherId: 'ps11-rule' },
      { text: 'What is reverberation?', refresherId: 'ps11-reverb' },
    ],
  },
};

export const S12: EduLesson = {
  id: 'ps-l12', unitId: 'ps-unit-5', number: 12, title: 'Ultrasound, infrasound and SONAR',
  objective: 'state the infrasonic and ultrasonic ranges and some of their uses, explain echolocation, and find a depth or distance from a SONAR echo time.',
  prerequisiteIds: [],
  objectives: [
    { id: 'ranges', label: 'State what infrasound and ultrasound are' },
    { id: 'uses', label: 'Name uses of ultrasound and infrasound and explain echolocation' },
    { id: 'sonar', label: 'Find a depth or distance from a SONAR echo time' },
  ],
  steps: [
    {
      id: 'ps12-ranges', title: 'Beyond human hearing', phase: 'observe',
      paragraphs: [
        'Infrasound has frequencies below 20 Hz; ultrasound has frequencies above 20 kHz. People cannot hear either, but many animals can: elephants and whales communicate with infrasound; bats, dolphins and some moths use ultrasound.',
        'Earthquakes and storms produce infrasound before the shaking or the wind reaches us, which some animals seem to sense.',
      ],
      visual: v('soundPitch', { nu: 40000 }, 'A 40 kHz sound on the frequency scale, in the ultrasonic range.'),
      check: pick('chk-ps12-ranges', 'Ultrasound is sound with frequencies…', [['above 20 kHz', null], ['below 20 Hz', 'That is infrasound.', 'band-direction'], ['between 20 Hz and 20 kHz', 'That is the audible range.', 'band-limit']], 'Above 20 kHz.', undefined, 'ps12-ranges'),
    },
    {
      id: 'ps12-uses', title: 'Uses of ultrasound', phase: 'reasoning',
      paragraphs: [
        'Ultrasound travels in narrow beams and reflects from boundaries, so it is used to look inside things without cutting them: ultrasonography shows organs and babies before birth; it can break kidney stones into small pieces; it cleans hard-to-reach parts; it finds cracks and flaws inside metal parts.',
        'Doctors use ultrasound instead of X-rays for an unborn baby because it is not harmful at the levels used.',
      ],
      check: pick('chk-ps12-uses', 'Which is a use of ultrasound?', [['Imaging an unborn baby', null], ['Cooking food', 'Microwave ovens use microwaves, not ultrasound.', 'wrong-wave'], ['Seeing in the dark with light', 'Light is not sound.', 'wrong-wave']], 'Ultrasonography.', undefined, 'ps12-uses'),
    },
    {
      id: 'ps12-echolocation', title: 'Echolocation', phase: 'reasoning',
      paragraphs: [
        'A bat sends out short pulses of ultrasound and listens for their echoes from insects and obstacles. From how long the echo takes and from which direction it comes, the bat locates its prey in the dark. This is echolocation; dolphins use it too.',
        'SONAR (Sound Navigation And Ranging) is the same idea built by people: a ship sends ultrasound pulses into the water and times the echoes from the sea bed, shoals of fish or submarines.',
      ],
      check: pick('chk-ps12-echolocation', 'How does a bat find an insect in the dark?', [['By timing echoes of its own ultrasound pulses', null], ['By seeing it with very sharp eyes', 'Bats rely on echoes, not sight, in the dark.', 'echolocation-sight'], ['By hearing the insect’s wings only', 'Bats send their own pulses and listen for echoes.', 'echolocation-passive']], 'Echolocation.', undefined, 'ps12-echolocation'),
    },
    {
      id: 'ps12-sonar', title: 'Finding a depth with SONAR', phase: 'apply',
      paragraphs: [
        'The pulse travels down to the sea bed and back up, so as with an echo, depth = v t ÷ 2. In sea water sound travels at about 1500 m/s (the book also uses 1525 and 1530 m/s in particular problems: always use the value given).',
        'Example: an echo returns after 2 s with v = 1500 m/s, so the depth is 1500 × 2 ÷ 2 = 1500 m.',
      ],
      visual: v('soundSonar', { editable: true, time: 2, medium: 'water' }, 'A ship timing a SONAR echo from the sea bed; change the echo time and the speed.'),
      notice: 'Double the echo time and the depth doubles.',
      check: pick('chk-ps12-sonar', 'A SONAR echo returns after 3 s in water at 1500 m/s. How deep is the sea there?', [['2250 m', null], ['4500 m', '4500 m is the distance down AND back; halve it.', 'forgot-halving'], ['500 m', 'Divide by 2 only, not by 3: depth = 1500 × 3 ÷ 2.', 'wrong-operation']], 'd = 1500 × 3 ÷ 2 = 2250 m.', undefined, 'ps12-sonar'),
    },
  ],
  investigation: { title: 'Try SONAR in the Sound Characteristics Laboratory', description: 'Change the echo time and the speed and watch the depth.', href: CHAR_LAB, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ps-l12', title: 'A fishing boat',
    given: ['A fishing boat’s SONAR gets an echo from a shoal of fish after 0.4 s.', 'Speed of sound in sea water: 1530 m/s.'],
    ask: 'How deep are the fish?',
    steps: [
      { text: 'Distance travelled = 1530 × 0.4 = 612 m.', why: 'Distance = speed × time.' },
      { text: 'Depth = 612 ÷ 2 = 306 m.', why: 'The pulse went down to the fish and back.' },
      { text: 'Ultrasound is used, so people on board do not hear the pulses.', why: 'Its frequency is above 20 kHz.' },
      { text: 'Check: 2 × 306 ÷ 1530 = 0.4 s.', why: 't = 2d ÷ v must give the measured time.' },
    ],
    verify: 'The fish are about 306 m below the boat.',
  },
  guided: {
    id: 'g-ps-l12', prompt: 'A ship’s SONAR echo returns after 5 s; sound in sea water travels at 1500 m/s.',
    steps: [
      { id: 'g1', prompt: 'Total path.', question: numQ('ps-g12-1', 'How far does the pulse travel in total, in metres?', 7500, '1500 × 5 = 7500 m.', { unit: 'm', rules: [[[3750], '3750 m is one way; the total path is there and back.', 'halved-early']] }), hints: ['Speed × time.'] },
      { id: 'g2', prompt: 'Depth.', question: numQ('ps-g12-2', 'How deep is the sea bed, in metres?', 3750, '7500 ÷ 2 = 3750 m.', { unit: 'm', rules: [[[7500], 'That is the total path; halve it.', 'forgot-halving']] }), hints: ['Halve the total path.'] },
      { id: 'g3', prompt: 'Why ultrasound?', question: pick('ps-g12-3', 'Why does SONAR use ultrasound rather than audible sound?', [['It travels in narrow beams and is not heard by people', null], ['It is faster than audible sound', 'In a given medium all frequencies travel at the same speed.', 'frequency-speed']], 'Narrow beams; inaudible.', undefined, 'ps12-uses'), hints: ['Speed does not depend on frequency.'] },
    ],
    conclusion: 'The sea bed is 3750 m down; ultrasound is used because it forms narrow beams and does not disturb people.',
  },
  independent: [
    ind('i1', 'Ranges', 'ranges', 'Infrasound.', pick('ps-l12-i1', 'Infrasound is sound with frequencies…', [['below 20 Hz', null], ['above 20 kHz', 'That is ultrasound.', 'band-direction']], 'Below 20 Hz.'), ['Infra means below.'], ['Below 20 Hz.']),
    ind('i2', 'Ranges', 'ranges', 'Which animal.', pick('ps-l12-i2', 'Which animal uses ultrasound to find its food?', [['A bat', null], ['An elephant', 'Elephants use infrasound (very low frequencies).', 'band-direction']], 'Bats use ultrasound.'), ['Think of echolocation.'], ['A bat.']),
    ind('i3', 'Uses', 'uses', 'Kidney stones.', pick('ps-l12-i3', 'How is ultrasound used for kidney stones?', [['It breaks them into tiny pieces that can pass out of the body', null], ['It dissolves them with heat', 'It uses vibrations to shatter them, not heat.', 'wrong-mechanism']], 'It breaks them up.'), ['Strong vibrations.'], ['Ultrasound shatters the stones into small pieces.']),
    ind('i4', 'Uses', 'uses', 'Echolocation.', pick('ps-l12-i4', 'Echolocation means…', [['locating objects from the echoes of sounds you make', null], ['locating objects by their colour', 'It uses sound and echoes, not light.', 'wrong-wave']], 'Locating by echoes.'), ['Echo + location.'], ['Sending sounds and timing their echoes.']),
    ind('i5', 'SONAR', 'sonar', 'Depth.', numQ('ps-l12-i5', 'A SONAR echo returns after 4 s in sea water at 1500 m/s. How deep is the sea, in metres?', 3000, '1500 × 4 ÷ 2 = 3000 m.', { unit: 'm', rules: [[[6000], '6000 m is down and back; halve it.', 'forgot-halving']] }), ['d = v t ÷ 2.'], ['1500 × 4 ÷ 2 = 3000 m.']),
    ind('i6', 'SONAR', 'sonar', 'Time.', numQ('ps-l12-i6', 'A submarine is 750 m from a ship. If sound travels at 1500 m/s in water, after how many seconds does the SONAR echo return?', 1, 't = 2 × 750 ÷ 1500 = 1 s.', { unit: 's', rules: [[[0.5], '0.5 s is one way; the echo must come back too.', 'one-way']] }), ['t = 2d ÷ v.'], ['2 × 750 ÷ 1500 = 1 s.']),
  ],
  reflection: {
    discover: 'Infrasound is below 20 Hz and ultrasound above 20 kHz; ultrasound images and cleans things and finds flaws; bats and SONAR locate objects by timing echoes, with depth = v t ÷ 2.',
    evidence: 'You classified frequencies, matched uses, and found depths from echo times.',
    stillConfusing: [
      { text: 'What is ultrasound?', refresherId: 'ps12-ranges' },
      { text: 'How does echolocation work?', refresherId: 'ps12-echolocation' },
      { text: 'Why divide by 2 in SONAR?', refresherId: 'ps12-sonar' },
    ],
  },
};
