/**
 * Class 9 Physics, Chapter 10 "Sound Waves": Unit 2, Lessons 4 to 6 (SND-1), Sections 10.3, 10.4 and 10.5.
 * Lesson 4: compressions and rarefactions (Activity 10.5, Fig. 10.9, Pause and Ponder 4). Lesson 5: sound carries energy
 * (Activity 10.6, Pause and Ponder 5). Lesson 6: drawing a sound wave (Fig. 10.16, Pause and Ponder 6).
 * Wording, figures and numbers are original. Every figure is drawn from the Wave Laboratory model.
 */

import type { EduLesson, Investigation } from '../../../education/types';
import { compressionCentres, DEFAULT_WAVE, rarefactionCentres, computeWave } from '../wave';
import { graphVisual, ind, numQ, ord, pick, waveVisual } from './questions';

const WAVE_LAB = '/physics/sound/wave';
const waveLab = (description: string): Investigation => ({ title: 'Try it in the Wave Laboratory', description, href: WAVE_LAB, buttonLabel: 'Open the Wave Laboratory' });

const w0 = computeWave(DEFAULT_WAVE);
const C = compressionCentres(w0, 0, 0, 6.8);   // 0.85 m, 4.25 m
const R = rarefactionCentres(w0, 0, 0, 6.8);   // 2.55 m, 5.95 m
const marksPQRS = [
  { id: 'P', x: C[0], label: 'P' }, { id: 'Q', x: w0.lambda / 2, label: 'Q' }, { id: 'R', x: R[0], label: 'R' }, { id: 'S', x: C[1], label: 'S' },
];

// ---------------------------------------------------------------------------
// Lesson 4: Compressions and rarefactions  (Section 10.3, Activity 10.5, P&P 4)
// ---------------------------------------------------------------------------

export const S4: EduLesson = {
  id: 'ps-l4', unitId: 'ps-unit-2', number: 4, title: 'Compressions and rarefactions',
  objective: 'describe a sound wave as alternating compressions and rarefactions that travel while each particle only vibrates about its own place, and say what a longitudinal wave is.',
  prerequisiteIds: ['psp-particles', 'psp-tofro'],
  objectives: [
    { id: 'cr', label: 'Describe compressions and rarefactions and say where they come from' },
    { id: 'particle', label: 'Explain that the particles vibrate in place while the pattern travels' },
    { id: 'long', label: 'Say what a longitudinal wave is' },
  ],
  steps: [
    {
      id: 'ps4-slinky', title: 'A slinky shows how a disturbance travels', phase: 'observe',
      paragraphs: [
        'Lay a slinky (a long coiled spring) on a table with a friend holding one end still. Push the other end towards your friend and quickly pull it back. A bunched-up region runs along the slinky, followed by a stretched-out region. Make a mark on one coil with a marker and watch it.',
        'The bunched and stretched regions travel from one end to the other, but the marked coil does not travel with them. It only moves a little forwards and backwards about its own place, along the same line the disturbance travels. The disturbance moves; the coils do not.',
      ],
      notice: 'Sound moves through air in a similar way: air plays the part of the slinky.',
      check: pick('chk-ps4-slinky', 'The marked coil of the slinky, as a bunched-up region passes, does what?', [
        ['It moves a little forwards and backwards about its own place', null],
        ['It travels all the way along the slinky with the bunched-up region', 'The pattern travels, but each coil only vibrates about its own place.', 'particle_travels'],
        ['It stays perfectly still', 'Each coil is pushed a little and comes back, so it vibrates about its place.', 'rest_confused'],
      ], 'Each coil vibrates in place.', undefined, 'ps4-slinky'),
    },
    {
      id: 'ps4-piston', title: 'A piston in a tube', phase: 'reasoning',
      paragraphs: [
        'Picture a long tube of air with a piston at one end. When the piston is not moving, the air particles are spread evenly: the average density. When the piston moves forwards, it pushes the nearest particles together, so the air there is denser than average. This crowded region is a compression (C).',
        'When the piston moves backwards, the particles next to it spread out, so the air there is less dense than average. This region is a rarefaction (R). Each region passes its crowding or spreading to its neighbours by collisions, so it moves on along the tube.',
        'If the piston moves back and forth again and again, it makes compressions and rarefactions one after another. A series of alternating compressions and rarefactions travelling through a medium is a sound wave.',
      ],
      vocabulary: [{ term: 'compression (C)', meaning: 'a region where the particles are crowded (density above average)' }, { term: 'rarefaction (R)', meaning: 'a region where the particles are spread out (density below average)' }, { term: 'sound wave', meaning: 'alternating compressions and rarefactions travelling through a medium' }],
      check: pick('chk-ps4-piston', 'What does the forward motion of the piston produce in the air next to it?', [
        ['A compression: the particles are pushed together', null],
        ['A rarefaction: the particles are spread out', 'The backward motion makes a rarefaction. Moving forward pushes the particles together.', 'cr_swapped'],
      ], 'Forward, together, compression.', undefined, 'ps4-piston'),
    },
    {
      id: 'ps4-pattern', title: 'The pattern travels; the particles stay', phase: 'reasoning',
      paragraphs: [
        'Look at the Wave Laboratory picture. The row of dots is the air particles at rest and in motion. The ringed dot is one particle with a small tick marking its rest position. The flag marks the middle of one compression. Press play and compare them.',
        'The flag travels steadily along the tube: the compression moves on. The ringed particle only moves a little to and fro about its tick and never leaves it. The wave carries a pattern of crowding along; it does not carry the particles along.',
      ],
      visual: waveVisual({ mark: true, graph: true, editable: true }, 'The Wave Laboratory with one particle marked and one compression followed.'),
      notice: 'Follow the flag and the ringed particle separately: one travels, the other stays near its tick. The picture is slowed down and the particle motion is exaggerated so that you can see it.',
      misconception: { wrong: 'The air particles travel from the source to your ear.', right: 'Each particle only vibrates about its own place. The compressions and rarefactions travel from the source to you.' },
      check: pick('chk-ps4-pattern', 'In a sound wave, what travels from the source to the listener?', [
        ['The pattern of compressions and rarefactions', null],
        ['The air particles themselves', 'The particles only vibrate about their places. The pattern moves on.', 'particle_travels'],
        ['Nothing at all', 'The disturbance (the pattern) travels, and it carries energy.', 'nothing_travels'],
      ], 'The pattern travels.', undefined, 'ps4-pattern'),
    },
    {
      id: 'ps4-long', title: 'Longitudinal waves', phase: 'apply',
      paragraphs: [
        'In a sound wave the particles vibrate to and fro along the same line that the wave travels. A wave in which the particles vibrate parallel to the direction the wave travels is called a longitudinal wave. Sound is a longitudinal wave, and, because it needs a medium to travel, it is also called a mechanical wave.',
        'There are other waves in which the particles vibrate across (at right angles to) the direction of travel, called transverse waves, such as a wave along a rope shaken up and down. Light is a transverse wave that does not need a medium, which is why sunlight reaches us across space but sound cannot.',
      ],
      vocabulary: [{ term: 'longitudinal wave', meaning: 'a wave in which the particles vibrate parallel to the direction the wave travels' }, { term: 'mechanical wave', meaning: 'a wave that needs a material medium to travel' }],
      check: pick('chk-ps4-long', 'In a sound wave moving to the right, in which direction do the air particles vibrate?', [
        ['To and fro along the same line (left and right)', null],
        ['Up and down, at right angles to the wave', 'That is a transverse wave. In sound the particles vibrate along the direction the wave travels.', 'long_transverse_swapped'],
      ], 'Parallel to the wave.', undefined, 'ps4-long'),
    },
  ],
  investigation: waveLab('Press play, follow one compression and one marked particle, and change the frequency and the amplitude.'),
  worked: {
    id: 'w-ps-l4', title: 'A 100 hertz wave in air',
    given: ['A source vibrates 100 times every second and the speed of sound in air is 340 m/s. The wavelength (the distance between two compressions) is 3.4 m and one cycle takes 0.01 s.'],
    ask: 'In one cycle (0.01 s), how far has a compression moved, and how far from its rest position is a particle at the end of the cycle?',
    visual: waveVisual({ mark: true, graph: true, setup: { frequencyHz: 100 } }, 'A 100 hertz wave.'),
    steps: [
      { text: 'A compression travels at the speed of the wave. In 0.01 s it moves 340 m/s × 0.01 s = 3.4 m.', why: 'Distance = speed × time. This equals one wavelength: the pattern moves on by one wavelength every cycle.' },
      { text: 'After that move, the next compression is where the first one used to be.', why: 'Compressions are 3.4 m apart, so after one cycle each compression has taken the place of the one ahead of it.' },
      { text: 'A particle is pushed forwards, back through its rest position, backwards, and forwards again in one cycle, ending where it started.', why: 'It vibrates about its rest position and returns to it after each complete cycle.' },
      { text: 'So the particle is 0 m from its rest position at the end of the cycle, although the compression has moved 3.4 m.', why: 'The pattern travels; the particle does not.' },
    ],
    verify: 'In 0.01 s a compression moves 3.4 m, while a particle ends up exactly where it started: the wave moves, the medium stays.',
  },
  guided: {
    id: 'g-ps-l4', prompt: 'Air in a tube is disturbed by a piston that moves forwards and backwards.',
    steps: [
      { id: 'g1', prompt: 'Backward motion.', question: pick('ps-g4-1', 'The piston moves backwards. What forms next to it?', [
        ['A rarefaction', null], ['A compression', 'Moving back leaves more room, so the particles spread out: a rarefaction.', 'cr_swapped'],
      ], 'Back, spread out, rarefaction.', undefined, 'ps4-piston'), hints: ['Backwards leaves more room for the particles.'] },
      { id: 'g2', prompt: 'What stays.', question: pick('ps-g4-2', 'A single air particle in the tube, as the wave passes, does what?', [
        ['It vibrates about its own place', null], ['It travels along the whole tube', 'Particles stay near their place; the pattern travels.', 'particle_travels'],
      ], 'Particles vibrate in place.', undefined, 'ps4-pattern'), hints: ['Think of the marked coil of the slinky.'] },
      { id: 'g3', prompt: 'The direction.', question: pick('ps-g4-3', 'The particles vibrate along the same line that the wave travels. What kind of wave is this?', [
        ['A longitudinal wave', null], ['A transverse wave', 'Transverse means the particles vibrate across the direction of travel.', 'long_transverse_swapped'],
      ], 'Along the direction: longitudinal.', undefined, 'ps4-long'), hints: ['Along or across?'] },
    ],
    conclusion: 'The piston\'s forward motion makes a compression and its backward motion a rarefaction; the particles vibrate in place and the pattern travels: a longitudinal wave.',
  },
  independent: [
    ind('i1', 'Compression and rarefaction', 'cr', 'Which is which?', pick('ps-l4-i1', 'A region of air where the particles are crowded together, with the density above average, is called what?', [
      ['A compression', null], ['A rarefaction', 'A rarefaction is where the particles are spread out, with density below average.', 'cr_swapped'], ['A vacuum', 'A vacuum has no particles. A compression has more than average.', 'vacuum_carries'],
    ], 'Crowded: compression.', undefined, 'ps4-piston'), ['Crowded or spread out?'], ['A compression.']),
    ind('i2', 'Compression and rarefaction', 'cr', 'At point P.', pick('ps-l4-i2', 'On the graph, the density at point P is the highest (above the dashed average line). What is happening to the air at P?', [
      ['It is the middle of a compression', null], ['It is the middle of a rarefaction', 'The highest density is a compression; a rarefaction is where the density is lowest.', 'cr_swapped'],
    ], 'Highest density: compression.', graphVisual({ marks: marksPQRS }, 'The density graph with points P, Q, R and S.'), 'ps4-piston'), ['Highest density means the particles are crowded.'], ['P is a compression.']),
    ind('i3', 'Particles stay, patterns travel', 'particle', 'What moves?', pick('ps-l4-i3', 'Which statement about a sound wave in air is true?', [
      ['The compressions and rarefactions move along; each air particle only vibrates about its own place', null],
      ['The air particles move from the source to the listener', 'The particles do not travel with the wave.', 'particle_travels'],
      ['Both the particles and the pattern travel at the same speed', 'Only the pattern travels along; the particles vibrate in place.', 'particle_travels'],
    ], 'The pattern travels, the particles stay.', undefined, 'ps4-pattern'), ['Recall the marked coil of the slinky.'], ['The pattern travels, particles do not.']),
    ind('i4', 'Particles stay, patterns travel', 'particle', 'Net movement.', numQ('ps-l4-i4', 'An air particle vibrates 100 times every second about its rest position. After exactly 0.05 s (5 whole cycles), how far is it from its rest position, in metres?', 0, 'It completes whole cycles, so it is back at its rest position: 0 m.', { unit: 'm', tolerance: 0.001, refresherId: 'ps4-pattern' }), ['After a whole number of cycles the particle is back where it started.'], ['0 m.']),
    ind('i5', 'Longitudinal waves', 'long', 'Definition.', pick('ps-l4-i5', 'What is a longitudinal wave?', [
      ['A wave in which the particles vibrate parallel to the direction the wave travels', null],
      ['A wave in which the particles vibrate at right angles to the direction the wave travels', 'That describes a transverse wave.', 'long_transverse_swapped'],
      ['A wave that needs no medium', 'Sound is longitudinal and needs a medium. A longitudinal wave is defined by the direction of the vibration.', 'wrong_reason'],
    ], 'Parallel to the direction of travel.', undefined, 'ps4-long'), ['Along or across the direction of travel?'], ['Parallel to it.']),
    ind('i6', 'Longitudinal waves', 'long', 'Sound.', pick('ps-l4-i6', 'Why is a sound wave called a mechanical wave?', [
      ['Because it needs a material medium to travel', null],
      ['Because it is made by machines', 'Mechanical here means it needs a medium, not that it comes from machines.', 'wrong_reason'],
      ['Because it can travel through a vacuum', 'It cannot. A mechanical wave needs a medium.', 'vacuum_carries'],
    ], 'It needs a medium.', undefined, 'ps4-long'), ['Think of the bell jar.'], ['It needs a medium.']),
  ],
  reflection: {
    discover: 'A vibrating source makes compressions (crowded regions) and rarefactions (spread-out regions) one after another. This pattern travels through the medium as a sound wave, while each particle only vibrates about its own place along the line of travel: a longitudinal wave.',
    evidence: 'You used the slinky and the piston, followed a compression and a marked particle in the Wave Laboratory, and used the numbers of a 100 hertz wave.',
    stillConfusing: [{ text: 'What is a compression or a rarefaction?', refresherId: 'ps4-piston' }, { text: 'What actually travels?', refresherId: 'ps4-pattern' }, { text: 'What is a longitudinal wave?', refresherId: 'ps4-long' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 5: Sound carries energy  (Section 10.4, Activity 10.6, P&P 5)
// ---------------------------------------------------------------------------

export const S5: EduLesson = {
  id: 'ps-l5', unitId: 'ps-unit-2', number: 5, title: 'Sound carries energy',
  objective: 'explain that a sound wave carries energy and not matter from source to listener, that a bigger vibration carries more energy, and that a microphone and a speaker convert between sound and electrical energy.',
  prerequisiteIds: ['psp-tofro', 'psp-particles'],
  objectives: [
    { id: 'energy', label: 'Explain that a sound wave carries energy and not matter' },
    { id: 'bigger', label: 'Say that a bigger vibration (larger amplitude) carries more energy' },
    { id: 'convert', label: 'Describe how a microphone and a speaker convert energy' },
  ],
  steps: [
    {
      id: 'ps5-grains', title: 'Sound can move things it does not touch', phase: 'observe',
      paragraphs: [
        'Stretch a sheet of thin rubber or cellophane tightly over a wide bowl and sprinkle a few grains of rice on it. Make a loud sound near the bowl without touching it, for example by striking a metal plate. The grains jump.',
        'Nothing touched the sheet, yet it moved. The sound travelled through the air, reached the sheet and made it vibrate; the vibrating sheet made the grains jump. Making a source vibrate hands energy to the air, and the sound wave carries that energy to the sheet.',
      ],
      check: pick('chk-ps5-grains', 'Grains on a stretched sheet jump when a loud sound is made near it. What does this show about sound?', [
        ['Sound is a form of energy that can make things move', null],
        ['Sound is made of tiny grains', 'The grains were on the sheet to show movement. Sound is a wave that carries energy.', 'wrong_reason'],
        ['Sound is light', 'Sound and light are different. The jumping shows that sound carries energy.', 'wrong_reason'],
      ], 'Sound carries energy.', undefined, 'ps5-grains'),
    },
    {
      id: 'ps5-energy', title: 'Energy travels; the particles do not', phase: 'reasoning',
      paragraphs: [
        'When a tuning fork rings, the air particles beside it vibrate and pass the vibration on. Something reaches your ear from the fork, but it is not a stream of air from the fork. The air particles stay near their places. What arrives is the energy of the vibration, carried by the compressions and rarefactions.',
        'So a sound wave transfers energy from one place to another without moving the medium along. This is why you can hear a sound without a wind blowing from the source to you.',
      ],
      visual: waveVisual({ mark: true, setup: { frequencyHz: 100 } }, 'A wave with one particle marked.'),
      notice: 'The ringed particle stays near its tick while the compressions pass: the energy travels on without the particle.',
      check: pick('chk-ps5-energy', 'When sound travels from a tuning fork to your ear, which of these actually reaches your ear?', [
        ['The energy carried by the sound wave', null],
        ['Air particles from near the fork', 'The particles only vibrate about their places. They do not travel from the fork to you.', 'particle_travels'],
        ['A steady stream of compressed air', 'There is no stream. A pattern of compressions and rarefactions passes through still-in-place air.', 'particle_travels'],
      ], 'Energy, not matter.', undefined, 'ps5-energy'),
    },
    {
      id: 'ps5-bigger', title: 'Bigger vibration, more energy', phase: 'reasoning',
      paragraphs: [
        'In the grain experiment, strike the plate harder and the grains jump higher. A harder strike makes the plate vibrate with a bigger vibration, which makes a bigger change in the density of the air (larger amplitude). A bigger vibration carries more energy, so the sheet is moved more.',
        'Try it in the Wave Laboratory: raise the amplitude and the compressions get crowded more and the rarefactions more spread out. The wave is the same length and has the same frequency, but it carries more energy. The size of the changes is exaggerated in the picture so that you can see it; real sound changes the density of air by a tiny fraction.',
      ],
      visual: waveVisual({ graph: true, editable: true, setup: { densityAmp: 0.5 } }, 'A wave with a large amplitude. Use the amplitude control.'),
      notice: 'Raise and lower the amplitude: the wavelength does not change, only how crowded and spread out the regions are.',
      check: pick('chk-ps5-bigger', 'A bell is struck harder. What changes in the sound wave it makes?', [
        ['The wave carries more energy, because the vibration is bigger', null],
        ['The wave travels faster through the air', 'A bigger vibration makes a bigger wave, not a faster one. More energy is carried.', 'amplitude_speed'],
        ['The wave carries less energy', 'A harder strike gives more energy to the air, not less.', 'energy_reversed'],
      ], 'Bigger vibration, more energy.', undefined, 'ps5-bigger'),
    },
    {
      id: 'ps5-convert', title: 'Microphones and speakers change one form of energy into another', phase: 'apply',
      paragraphs: [
        'A microphone turns sound energy into electrical energy. When you speak into it, the sound waves make a thin membrane (the diaphragm) vibrate, and these vibrations are changed into an electrical signal.',
        'A speaker does the opposite: an electrical signal makes a cone vibrate, and the vibrating cone makes sound. If everything works properly, the sound from the speaker closely matches the sound the microphone picked up.',
      ],
      vocabulary: [{ term: 'microphone', meaning: 'a device that changes sound energy into electrical energy' }, { term: 'speaker', meaning: 'a device that changes electrical energy into sound' }],
      check: pick('chk-ps5-convert', 'A loudspeaker changes which form of energy into which?', [
        ['Electrical energy into sound energy', null],
        ['Sound energy into electrical energy', 'That is a microphone. A speaker does the opposite.', 'mic_speaker_swapped'],
      ], 'Speaker: electrical to sound.', undefined, 'ps5-convert'),
    },
  ],
  investigation: waveLab('Raise and lower the amplitude and watch the wavelength stay the same while the compressions get stronger.'),
  worked: {
    id: 'w-ps-l5', title: 'Louder and softer waves',
    given: ['The Wave Laboratory shows a 100 hertz wave in air with a density change of 0.2 (a quiet sound) and then 0.4 (a louder sound).', 'In this picture the largest particle movement is the density change divided by k, where k = 2π ÷ wavelength = 2π ÷ 3.4 m = 1.85 per metre.'],
    ask: 'How does the wavelength compare in the two cases, how far do the particles move, and which wave carries more energy?',
    visual: waveVisual({ graph: true, editable: true, setup: { densityAmp: 0.4 } }, 'The louder wave, with the amplitude control.'),
    steps: [
      { text: 'The frequency is 100 Hz and the speed is 340 m/s in both, so the wavelength is 340 ÷ 100 = 3.4 m in both.', why: 'Wavelength depends on the speed and the frequency, not on how loud the sound is.' },
      { text: 'Quiet wave: the largest particle movement is 0.2 ÷ 1.85 = 0.108 m (about 11 cm) in this exaggerated picture.', why: 'The model divides the density change by k.' },
      { text: 'Louder wave: 0.4 ÷ 1.85 = 0.216 m (about 22 cm), twice as large.', why: 'Doubling the density change doubles the largest particle movement.' },
      { text: 'The louder wave has the larger vibration and so carries more energy.', why: 'A bigger vibration carries more energy; this is why the grains jump higher for a louder sound.' },
    ],
    verify: 'The wavelength stays 3.4 m in both; the particle movement doubles from about 11 cm to 22 cm; the louder wave carries more energy.',
  },
  guided: {
    id: 'g-ps-l5', prompt: 'You strike a metal plate near a bowl covered with a thin sheet and grains of rice.',
    steps: [
      { id: 'g1', prompt: 'A harder strike.', question: pick('ps-g5-1', 'You strike the plate harder. What happens to the grains?', [
        ['They jump higher', null], ['They jump less high', 'A harder strike gives a bigger vibration and more energy, so the grains jump higher.', 'energy_reversed'],
      ], 'More energy, higher jump.', undefined, 'ps5-bigger'), hints: ['A bigger vibration carries more energy.'] },
      { id: 'g2', prompt: 'Why the sheet moves.', question: pick('ps-g5-2', 'The plate does not touch the sheet. How does the sound make the sheet vibrate?', [
        ['The sound wave carries energy through the air to the sheet', null], ['A wind blows from the plate to the sheet', 'The air particles stay near their places. The wave carries energy to the sheet without a wind.', 'particle_travels'],
      ], 'The wave carries energy.', undefined, 'ps5-energy'), hints: ['What does a sound wave carry?'] },
      { id: 'g3', prompt: 'The number.', question: numQ('ps-g5-3', 'In the model the largest particle movement is the density change divided by k (1.85 per metre). What is it, in metres, for a density change of 0.4?', 0.216, '0.4 ÷ 1.85 = 0.216 m.', { unit: 'm', tolerance: 0.003, refresherId: 'ps5-bigger' }), hints: ['0.4 ÷ 1.85.'] },
    ],
    conclusion: 'A harder strike makes a bigger vibration and a wave that carries more energy through the air to the sheet, with no wind: the grains jump higher.',
  },
  independent: [
    ind('i1', 'Energy, not matter', 'energy', 'What arrives?', pick('ps-l5-i1', 'A sound wave travels from a source to a listener. What does it transfer?', [
      ['Energy', null], ['Matter (air from the source)', 'No air travels from the source to the listener; the particles stay near their places.', 'particle_travels'],
    ], 'Energy.', undefined, 'ps5-energy'), ['What moved the grains?'], ['Energy.']),
    ind('i2', 'Energy, not matter', 'energy', 'The sheet.', pick('ps-l5-i2', 'Grains on a stretched sheet jump when a loud sound is made near it without touching it. Which is the best explanation?', [
      ['The sound wave carried energy to the sheet and made it vibrate', null],
      ['The sound pushed a stream of air particles from the source onto the sheet', 'The particles do not travel along; the wave carries energy.', 'particle_travels'],
      ['The sheet vibrates by itself all the time', 'It was still until the sound arrived, then it vibrated.', 'wrong_reason'],
    ], 'The wave carries energy.', undefined, 'ps5-grains'), ['What links a loud sound and a moving sheet?'], ['Energy carried by the wave.']),
    ind('i3', 'Bigger vibration', 'bigger', 'Which carries more?', pick('ps-l5-i3', 'Two bells are struck, one softly and one hard. Which sound wave carries more energy?', [
      ['The one from the hard strike, which has the bigger vibration', null], ['The one from the soft strike', 'A softer strike gives a smaller vibration and less energy.', 'energy_reversed'], ['They carry exactly the same energy', 'The bigger vibration carries more energy.', 'no_difference'],
    ], 'Bigger vibration, more energy.', undefined, 'ps5-bigger'), ['Think of the grains.'], ['The hard strike.']),
    ind('i4', 'Bigger vibration', 'bigger', 'Does it change the length?', pick('ps-l5-i4', 'In the Wave Laboratory you raise the amplitude of a 100 hertz wave. What stays the same?', [
      ['The wavelength and the frequency', null], ['The crowding of the compressions', 'The compressions get more crowded as the amplitude rises.', 'wrong_reason'], ['The energy carried', 'The energy carried increases with the amplitude.', 'energy_reversed'],
    ], 'Wavelength and frequency are unchanged.', undefined, 'ps5-bigger'), ['Which quantities depend on the source frequency and the medium?'], ['The wavelength and the frequency stay the same.']),
    ind('i5', 'Microphone and speaker', 'convert', 'The microphone.', pick('ps-l5-i5', 'A microphone changes which form of energy into which?', [
      ['Sound energy into electrical energy', null], ['Electrical energy into sound energy', 'That is a speaker. A microphone does the opposite.', 'mic_speaker_swapped'],
    ], 'Microphone: sound to electrical.', undefined, 'ps5-convert'), ['Which way does the signal go?'], ['Sound to electrical.']),
    ind('i6', 'Microphone and speaker', 'convert', 'The diaphragm.', pick('ps-l5-i6', 'In a microphone, what is made to vibrate by the sound waves?', [
      ['A thin membrane called a diaphragm', null], ['The wire that carries the signal', 'The wire carries the electrical signal. The thin diaphragm is what vibrates.', 'wrong_part'], ['The speaker cone', 'The cone is in a speaker. A microphone has a diaphragm.', 'mic_speaker_swapped'],
    ], 'A diaphragm.', undefined, 'ps5-convert'), ['It is a thin sheet.'], ['The diaphragm.']),
  ],
  reflection: {
    discover: 'A sound wave transfers energy from the source to the listener without moving the medium along. A bigger vibration (a larger amplitude) carries more energy, as the higher-jumping grains show. A microphone changes sound energy into electrical energy and a speaker does the reverse.',
    evidence: 'You used the grain experiment, followed energy rather than particles, compared a quiet and a loud wave with numbers, and described a microphone and a speaker.',
    stillConfusing: [{ text: 'Why do the grains jump?', refresherId: 'ps5-grains' }, { text: 'What actually reaches my ear?', refresherId: 'ps5-energy' }, { text: 'What does a bigger vibration do?', refresherId: 'ps5-bigger' }],
  },
};

// ---------------------------------------------------------------------------
// Lesson 6: Drawing a sound wave  (Section 10.5, P&P 6)
// ---------------------------------------------------------------------------

export const S6: EduLesson = {
  id: 'ps-l6', unitId: 'ps-unit-2', number: 6, title: 'Drawing a sound wave',
  objective: 'read a graph of density against distance for a sound wave, link its crests and troughs to compressions and rarefactions, and draw such a graph from a given amplitude and repeat length.',
  prerequisiteIds: ['psp-graph'],
  objectives: [
    { id: 'read', label: 'Read a density-against-distance graph: above and below the average line' },
    { id: 'crestTrough', label: 'Link crests to compressions and troughs to rarefactions, and read the repeat length' },
    { id: 'draw', label: 'Draw a graph from a given amplitude and repeat length' },
  ],
  steps: [
    {
      id: 'ps6-graph', title: 'A graph of the density along the tube', phase: 'observe',
      paragraphs: [
        'At one moment, look along the tube. In a compression the density is above the average, and in a rarefaction it is below the average. We can show how the density changes along the tube with a graph. The distance from the source goes on the horizontal axis (x-axis) and the density of the medium goes on the vertical axis (y-axis).',
        'The average density is marked by a horizontal dashed line. The curve goes above the dashed line in compressions and below it in rarefactions. A smooth wavy line that repeats is how a sound wave is usually drawn.',
      ],
      visual: graphVisual({ marks: marksPQRS }, 'A density-against-distance graph with points P, Q, R and S.'),
      notice: 'Where the curve is above the dashed line, the air is denser than average.',
      check: pick('chk-ps6-graph', 'On a density graph, the curve is below the dashed line at some distance. What is the air like there?', [
        ['It is less dense than average: a rarefaction region', null], ['It is more dense than average', 'Below the average line means below average density.', 'above_below_reversed'],
      ], 'Below the line: less dense.', undefined, 'ps6-graph'),
    },
    {
      id: 'ps6-crest', title: 'Crests are compressions; troughs are rarefactions', phase: 'reasoning',
      paragraphs: [
        'In a compression the density rises above the average and reaches a highest value at the middle of the compression. The highest point of the curve is called a crest. In a rarefaction the density falls below the average and reaches a lowest value at the middle; the lowest point is a trough.',
        'So crest means compression and trough means rarefaction. Compressions and rarefactions alternate, so crests and troughs alternate along the graph. The distance between two consecutive crests (or two consecutive troughs) is the length after which the pattern repeats; you will call it the wavelength in the next lesson.',
      ],
      vocabulary: [{ term: 'crest', meaning: 'the highest point of the density graph: the middle of a compression' }, { term: 'trough', meaning: 'the lowest point of the density graph: the middle of a rarefaction' }],
      visual: waveVisual({ graph: true, setup: { frequencyHz: 100 } }, 'The wave and its graph, with crests and troughs labelled.'),
      notice: 'The compressions in the row of dots line up with the crests directly below them.',
      misconception: { wrong: 'A crest is where the particles are furthest from their rest position.', right: 'A crest is where the density is highest: the middle of a compression. The particle there is actually at its rest position for that instant.' },
      check: pick('chk-ps6-crest', 'What part of a sound wave does a trough of the density graph stand for?', [
        ['The middle of a rarefaction', null], ['The middle of a compression', 'Compressions are the high points (crests).', 'cr_swapped'],
      ], 'Trough: rarefaction.', undefined, 'ps6-crest'),
    },
    {
      id: 'ps6-measure', title: 'Reading the repeat length and the amplitude', phase: 'apply',
      paragraphs: [
        'Two things describe the shape of the graph. The distance from one crest to the next is the repeat length (the wavelength). The height of a crest above the dashed average line is the amplitude: the biggest change of density above average (and a trough is the same distance below).',
        'If a graph has crests at 1 cm and 5 cm, the repeat length is 5 − 1 = 4 cm and the next crest is at 9 cm. If the average density is 10 and a crest reaches 13, the amplitude is 3, so a trough dips to 10 − 3 = 7.',
      ],
      vocabulary: [{ term: 'amplitude', meaning: 'the biggest change of density from the average, measured as the height of a crest above the average line' }],
      check: pick('chk-ps6-measure', 'A density graph has crests at 2 cm and 8 cm. What is the repeat length?', [
        ['6 cm', null], ['10 cm', 'You added the positions. The repeat length is the difference: 8 − 2.', 'added'], ['2 cm', 'You used the position of the first crest. The repeat length is the distance between crests.', 'wrong_value'],
      ], '8 − 2 = 6 cm.', undefined, 'ps6-measure'),
    },
    {
      id: 'ps6-draw', title: 'How to draw a sound wave graph', phase: 'apply',
      paragraphs: [
        'To draw a graph of a sound wave: (1) draw the axes and label them: distance (with its unit, for example centimetres) along the bottom and density up the side; (2) draw a dashed horizontal line for the average density; (3) mark each crest the amplitude above that line and each trough the amplitude below it, spaced by the repeat length; (4) join the points with a smooth wavy curve.',
        'Two sound waves can have the same amplitude and the same repeat length but sit in different places: where one has a compression, the other can have a rarefaction. Their graphs are the same shape shifted along the axis by half a repeat length.',
      ],
      check: pick('chk-ps6-draw', 'A sound wave has amplitude 3 units and repeat length 4 cm. Which statement about its graph is right?', [
        ['Its crests are 3 units above the average line and 4 cm apart', null], ['Its crests are 4 units above the average line and 3 cm apart', 'You swapped the two numbers. Amplitude is the height; the repeat length is the spacing.', 'swapped'],
      ], 'Amplitude is the height, repeat length is the spacing.', undefined, 'ps6-draw'),
    },
  ],
  investigation: waveLab('Watch the graph of density against distance and against time while the wave moves, and read the crests and troughs.'),
  worked: {
    id: 'w-ps-l6', title: 'Draw a sound wave graph',
    given: ['A sound wave has an amplitude of 3 units and a repeat length of 4 cm.', 'The average density is 10 units. The graph starts on the average line and rises.'],
    ask: 'Draw the graph of density against distance for 8 cm, and give the positions and values of the crests and troughs.',
    steps: [
      { text: 'Draw the axes: distance in centimetres along the bottom (0 to 8) and density up the side. Draw a dashed line at the average density, 10.', why: 'Axes first, then the reference line everything is measured from.' },
      { text: 'The crests are 3 units above the average: density 13. The troughs are 3 units below: density 7.', why: 'Amplitude is the height of a crest above the average line.' },
      { text: 'A graph that starts on the average line and rises reaches its first crest a quarter of the repeat length along: at 1 cm. The trough follows at 3 cm, then the next crest at 5 cm and the next trough at 7 cm.', why: 'The crests are 4 cm apart, so each is 4 cm after the last.' },
      { text: 'Join the points 0 cm (10), 1 cm (13), 2 cm (10), 3 cm (7), 4 cm (10), 5 cm (13), 6 cm (10), 7 cm (7), 8 cm (10) with a smooth wave.', why: 'The curve crosses the average line halfway between a crest and a trough.' },
    ],
    verify: 'Crests (density 13) at 1 cm and 5 cm are 4 cm apart; troughs (density 7) at 3 cm and 7 cm; the wave oscillates 3 units either side of the average of 10.',
  },
  guided: {
    id: 'g-ps-l6', prompt: 'A sound wave has an amplitude of 3 units and a repeat length of 4 cm. The average density is 10 units. The graph starts on the average line and rises.',
    steps: [
      { id: 'g1', prompt: 'The height of a crest.', question: numQ('ps-g6-1', 'What is the density at a crest?', 13, 'Average 10 plus amplitude 3 is 13.', { refresherId: 'ps6-measure' }), hints: ['Average plus amplitude.'] },
      { id: 'g2', prompt: 'The first trough.', question: numQ('ps-g6-2', 'The first crest is at 1 cm. At what distance (in centimetres) is the first trough?', 3, 'A trough is half a repeat length after a crest: 1 + 2 = 3 cm.', { unit: 'cm', refresherId: 'ps6-draw' }), hints: ['Half of 4 cm is 2 cm.'] },
      { id: 'g3', prompt: 'The second crest.', question: numQ('ps-g6-3', 'At what distance (in centimetres) is the second crest?', 5, 'Crests are one repeat length apart: 1 + 4 = 5 cm.', { unit: 'cm', refresherId: 'ps6-measure' }), hints: ['One repeat length after the first crest.'] },
    ],
    conclusion: 'Crests at 1 cm and 5 cm have density 13, with a trough of density 7 at 3 cm between them.',
  },
  independent: [
    ind('i1', 'Reading the graph', 'read', 'Highest points.', pick('ps-l6-i1', 'Two of the points P, Q, R and S on the graph are the middles of compressions. Which two?', [
      ['P and S', null], ['Q and R', 'Q is on the average line and R is the lowest point (a rarefaction).', 'cr_swapped'], ['P and R', 'R is a rarefaction, the lowest point.', 'cr_swapped'],
    ], 'The highest points are compressions.', graphVisual({ marks: marksPQRS }, 'The density graph with points P, Q, R and S.'), 'ps6-crest'), ['Compressions are the crests.'], ['P and S.']),
    ind('i2', 'Reading the graph', 'read', 'Lowest point.', pick('ps-l6-i2', 'At which of the points P, Q, R and S is the air least dense?', [
      ['R', null], ['P', 'P is a crest: the air is densest there.', 'above_below_reversed'], ['Q', 'Q is on the average line.', 'wrong_value'],
    ], 'The trough is the lowest density.', graphVisual({ marks: marksPQRS }, 'The density graph with points P, Q, R and S.'), 'ps6-graph'), ['Look for the lowest point.'], ['R.']),
    ind('i3', 'Crests and repeat length', 'crestTrough', 'Distance.', numQ('ps-l6-i3', 'A density graph has crests at 1.5 cm and 4.5 cm. What is the distance between consecutive crests, in centimetres?', 3, '4.5 − 1.5 = 3 cm.', { unit: 'cm', refresherId: 'ps6-measure', rules: [[[6], 'You added the positions. The distance is the difference.', 'added']] }), ['Subtract the positions.'], ['3 cm.']),
    ind('i4', 'Crests and repeat length', 'crestTrough', 'A trough.', pick('ps-l6-i4', 'A trough of the density graph corresponds to which part of a sound wave?', [
      ['A rarefaction', null], ['A compression', 'Compressions are the crests.', 'cr_swapped'],
    ], 'Trough: rarefaction.', undefined, 'ps6-crest'), ['Low density.'], ['A rarefaction.']),
    ind('i5', 'Drawing a wave', 'draw', 'The lowest value.', numQ('ps-l6-i5', 'A sound wave has an average density of 10 units and an amplitude of 3 units. What is the lowest density value on the graph?', 7, 'A trough is 3 below the average: 10 − 3 = 7.', { refresherId: 'ps6-draw', rules: [[[13], 'That is the crest. The lowest value is a trough, below the average.', 'above_below_reversed']] }), ['Average minus amplitude.'], ['7.']),
    ind('i6', 'Drawing a wave', 'draw', 'Steps in order.', ord('ps-l6-i6', 'Put the steps for drawing a sound wave graph in a sensible order.', [
      { id: 'axes', text: 'Draw and label the axes: distance along the bottom and density up the side', needs: [], because: 'Everything else is placed on the axes.' },
      { id: 'avg', text: 'Draw a dashed horizontal line for the average density', needs: ['axes'], because: 'Crests and troughs are measured from this line.' },
      { id: 'crest', text: 'Mark each crest the amplitude above the dashed line, spaced by the repeat length', needs: ['avg'], because: 'The amplitude is the height above the average.' },
      { id: 'trough', text: 'Mark each trough the amplitude below the dashed line, halfway between crests', needs: ['avg'], because: 'Troughs are the same distance below the average.' },
      { id: 'curve', text: 'Join the points with a smooth wavy curve', needs: ['crest', 'trough'], because: 'The curve is drawn once the points are placed.' },
    ], ['curve', 'crest', 'axes', 'trough', 'avg'], 'Axes, the average line, then the crests and troughs, and finally the smooth curve.'), ['Which step does every other step depend on?'], ['Axes, average line, crests and troughs, then the curve.']),
  ],
  reflection: {
    discover: 'A sound wave can be drawn as a graph of density against distance. The curve rises above the dashed average line in compressions (crests) and falls below it in rarefactions (troughs). The distance between consecutive crests is the repeat length (wavelength), and the height of a crest above the average line is the amplitude.',
    evidence: 'You read a graph, linked crests and troughs to compressions and rarefactions, and drew a graph from an amplitude and a repeat length.',
    stillConfusing: [{ text: 'How do I read the graph?', refresherId: 'ps6-graph' }, { text: 'What are crests and troughs?', refresherId: 'ps6-crest' }, { text: 'How do I draw it?', refresherId: 'ps6-draw' }],
  },
};
