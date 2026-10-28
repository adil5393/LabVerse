/**
 * Class 9 Physics, Chapter 10 "Sound Waves": Unit 3, Lessons 7 to 10 (SND-2), Sections 10.6.1 to 10.6.4 (Eq. 10.1 T ν = 1 and
 * Eq. 10.2 v = ν λ). Wording, situations and numbers are original (the book's examples are not copied). Every number is checked
 * against `engine/physics/sound/characteristics.ts` by `__tests__/soundComplete.test.ts`. The frequency symbol is ν (nu), as in
 * the book; speed is v.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { graphVisual, ind, numQ, pick, waveVisual } from './questions';

const WAVE_LAB = '/physics/sound/wave';
const CHAR_LAB = '/physics/sound/characteristics';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

// ---------------------------------------------------------------------------
// Lesson 7: Wavelength, frequency and time period (10.6.1)
// ---------------------------------------------------------------------------

export const S7: EduLesson = {
  id: 'ps-l7', unitId: 'ps-unit-3', number: 7, title: 'Wavelength, frequency and time period',
  objective: 'say what the wavelength λ, the frequency ν and the time period T of a sound wave mean, use T ν = 1, and read a wavelength from a graph.',
  prerequisiteIds: ['psp-graph'],
  objectives: [
    { id: 'define', label: 'Say what wavelength, frequency and time period mean, with their units' },
    { id: 'tnu', label: 'Use T ν = 1 to find a time period or a frequency' },
    { id: 'read', label: 'Read a wavelength (or half of one) from a density graph' },
  ],
  steps: [
    {
      id: 'ps7-lambda', title: 'Wavelength: from one compression to the next', phase: 'observe',
      paragraphs: [
        'Look along a sound wave at one instant. Compressions and rarefactions repeat. The distance from one compression to the next compression (or from one rarefaction to the next) is the wavelength, written λ (the Greek letter lambda). Its SI unit is the metre.',
        'On a graph of density against distance, compressions are crests and rarefactions are troughs, so the wavelength is also the distance from one crest to the next.',
      ],
      visual: graphVisual({ marks: [{ id: 'A', x: 0.85, label: 'A' }, { id: 'B', x: 4.25, label: 'B' }] }, 'Two neighbouring crests marked A and B.'),
      notice: 'A and B are neighbouring crests (compressions). The distance between them is one wavelength.',
      check: pick('chk-ps7-lambda', 'Which distance is one wavelength?', [
        ['From one compression to the next compression', null],
        ['From a compression to the next rarefaction', 'That is only half a wavelength: a compression and the next rarefaction are halfway along one repeat.', 'half-wavelength'],
        ['The height of a crest above the average line', 'That height is the amplitude, not a distance along the wave.', 'amplitude-vs-wavelength'],
      ], 'Compression to compression is one full repeat.', undefined, 'ps7-lambda'),
    },
    {
      id: 'ps7-freq', title: 'Frequency and time period', phase: 'reasoning',
      paragraphs: [
        'Now watch one place as the wave goes by. The density there rises and falls again and again. The number of these complete oscillations each second is the frequency, written ν (the Greek letter nu). Its unit is the hertz: 1 Hz is one oscillation per second.',
        'The time taken for ONE complete oscillation is the time period, written T, measured in seconds. If 100 compressions pass a point each second, then ν = 100 Hz, and each oscillation takes one hundredth of a second.',
      ],
      vocabulary: [{ term: 'frequency ν', meaning: 'number of complete oscillations per second (hertz, Hz)' }, { term: 'time period T', meaning: 'time for one complete oscillation (seconds)' }],
      visual: waveVisual({ mark: true }, 'A sound wave with one particle marked; it oscillates once for each compression that passes.'),
      check: pick('chk-ps7-freq', '200 compressions pass a point every second. What is the frequency?', [
        ['200 Hz', null],
        ['1/200 Hz', '1/200 s is the time period (the time for one oscillation), not the frequency.', 'period-vs-frequency'],
        ['200 s', 'Frequency is a number per second, measured in hertz, not a time.', 'unit-confusion'],
      ], '200 oscillations per second is 200 Hz.', undefined, 'ps7-freq'),
    },
    {
      id: 'ps7-tnu', title: 'T ν = 1', phase: 'reasoning',
      paragraphs: [
        'If ν oscillations happen in one second, each one takes 1 ÷ ν seconds. So T = 1 ÷ ν, or T ν = 1 (Equation 10.1 in the book). A higher frequency always means a shorter time period.',
        'Example: a piston pushes the air 30 times in 3 s. Its frequency is 30 ÷ 3 = 10 Hz, so each push and pull takes T = 1 ÷ 10 = 0.1 s.',
      ],
      why: 'Frequency counts oscillations per second, period measures seconds per oscillation: one is the reciprocal of the other.',
      misconception: { wrong: 'A higher frequency means a longer time period.', right: 'More oscillations each second means each one takes LESS time: T = 1 ÷ ν.' },
      check: pick('chk-ps7-tnu', 'A sound has ν = 500 Hz. What is its time period?', [
        ['0.002 s', null],
        ['500 s', 'T = 1 ÷ ν, so it is 1 ÷ 500 s, which is very short.', 'period-vs-frequency'],
        ['0.02 s', 'Check the division: 1 ÷ 500 = 0.002, not 0.02.', 'decimal-slip'],
      ], 'T = 1 ÷ 500 = 0.002 s.', undefined, 'ps7-tnu'),
    },
    {
      id: 'ps7-read', title: 'Reading λ from a graph', phase: 'apply',
      paragraphs: [
        'On a density graph, measure crest to crest along the distance axis for λ. Crest to the next trough is half a wavelength, and so is the distance between two neighbouring crossings of the dashed average-density line.',
        'Reading half a wavelength and doubling it is often more accurate when the crests are hard to pin down.',
      ],
      visual: graphVisual({ marks: [{ id: 'C', x: 0.85, label: 'C' }, { id: 'R', x: 2.55, label: 'R' }] }, 'A crest C and the next trough R.'),
      notice: 'From the crest C to the trough R is half a wavelength.',
      check: pick('chk-ps7-read', 'A crest and the next trough are 0.6 m apart. What is the wavelength?', [
        ['1.2 m', null],
        ['0.6 m', 'Crest to trough is half a wavelength, so double it.', 'half-wavelength'],
        ['0.3 m', 'Halving goes the wrong way: the full wavelength is longer than half of it.', 'wrong-operation'],
      ], 'λ = 2 × 0.6 = 1.2 m.', undefined, 'ps7-read'),
    },
  ],
  investigation: { title: 'Try it in the Wave Laboratory', description: 'Change the frequency and watch the compressions crowd together: the wavelength gets shorter as ν goes up.', href: WAVE_LAB, buttonLabel: 'Open the Wave Laboratory' },
  worked: {
    id: 'w-ps-l7', title: 'A vibrating piston',
    given: ['A piston in a tube completes 25 oscillations in 5 s.'],
    ask: 'Find its frequency, its time period, and how many oscillations it makes in one minute.',
    steps: [
      { text: 'ν = 25 ÷ 5 s = 5 Hz.', why: 'Frequency is the number of oscillations each second.' },
      { text: 'T = 1 ÷ ν = 1 ÷ 5 = 0.2 s.', why: 'T ν = 1 (Equation 10.1).' },
      { text: 'In one minute (60 s) it makes 5 × 60 = 300 oscillations.', why: 'Oscillations per second times the number of seconds.' },
      { text: 'Check: 300 oscillations × 0.2 s each = 60 s.', why: 'The time period times the number of oscillations must give the total time.' },
    ],
    verify: '5 Hz, 0.2 s and 300 per minute are consistent: 25 oscillations take 25 × 0.2 = 5 s, as given.',
  },
  guided: {
    id: 'g-ps-l7', prompt: '12 compressions pass a microphone in 3 s. On a density graph of the same wave, neighbouring crests are 0.8 m apart.',
    steps: [
      { id: 'g1', prompt: 'The frequency.', question: numQ('ps-g7-1', 'What is the frequency, in Hz?', 4, '12 ÷ 3 = 4 Hz.', { unit: 'Hz', rules: [[[36], 'Multiplying gives 36. Frequency is per second, so divide by the time.', 'wrong-operation']] }), hints: ['Compressions ÷ seconds.'] },
      { id: 'g2', prompt: 'The time period.', question: numQ('ps-g7-2', 'What is the time period, in seconds?', 0.25, 'T = 1 ÷ 4 = 0.25 s.', { unit: 's', tolerance: 0.001, rules: [[[4], '4 is the frequency. T = 1 ÷ ν.', 'period-vs-frequency']] }), hints: ['T ν = 1.'] },
      { id: 'g3', prompt: 'The wavelength.', question: numQ('ps-g7-3', 'What is the wavelength, in metres?', 0.8, 'Neighbouring crests are one wavelength apart: 0.8 m.', { unit: 'm', tolerance: 0.001, rules: [[[0.4], 'Half of 0.8 would be crest to trough. Crest to crest is the full wavelength.', 'half-wavelength'], [[1.6], 'Do not double: crest to crest is already one wavelength.', 'wrong-operation']] }), hints: ['Crest to crest is one wavelength.'] },
    ],
    conclusion: 'ν = 4 Hz, T = 0.25 s and λ = 0.8 m.',
  },
  independent: [
    ind('i1', 'Meaning of wavelength', 'define', 'Wavelength.', pick('ps-l7-i1', 'Which is the wavelength of a sound wave?', [
      ['The distance between two neighbouring rarefactions', null],
      ['The time for one oscillation', 'That is the time period.', 'period-vs-wavelength'],
      ['How far a particle of air moves', 'Particles only oscillate a tiny distance about their places; the wavelength is the spacing of the pattern.', 'particle-travel'],
    ], 'Rarefaction to rarefaction is one wavelength.'), ['Think of the repeating pattern.'], ['λ is compression to compression, or rarefaction to rarefaction.']),
    ind('i2', 'Units', 'define', 'Units.', pick('ps-l7-i2', 'Which pair of quantity and unit is correct?', [
      ['frequency ν: hertz (Hz)', null],
      ['time period T: hertz (Hz)', 'T is a time, measured in seconds.', 'unit-confusion'],
      ['wavelength λ: seconds (s)', 'λ is a length, measured in metres.', 'unit-confusion'],
    ], 'ν in Hz, T in s, λ in m.'), ['Which one counts per second?'], ['ν: Hz; T: s; λ: m.']),
    ind('i3', 'T ν = 1', 'tnu', 'Time period.', numQ('ps-l7-i3', 'A tuning fork vibrates at 250 Hz. What is its time period, in seconds?', 0.004, 'T = 1 ÷ 250 = 0.004 s.', { unit: 's', tolerance: 0.00001, rules: [[[250], 'That is ν. T = 1 ÷ ν.', 'period-vs-frequency'], [[0.04], 'Check the division: 1 ÷ 250 = 0.004.', 'decimal-slip']] }), ['T = 1 ÷ ν.'], ['T = 1 ÷ 250 = 0.004 s.']),
    ind('i4', 'T ν = 1', 'tnu', 'Frequency.', numQ('ps-l7-i4', 'One oscillation of a loudspeaker cone takes 0.002 s. What is the frequency, in Hz?', 500, 'ν = 1 ÷ 0.002 = 500 Hz.', { unit: 'Hz', rules: [[[0.002], 'That is the time period. ν = 1 ÷ T.', 'period-vs-frequency']] }), ['ν = 1 ÷ T.'], ['ν = 1 ÷ 0.002 = 500 Hz.']),
    ind('i5', 'Reading λ', 'read', 'From a graph.', numQ('ps-l7-i5', 'Crests of a density graph are at 0.6 m, 1.8 m and 3.0 m. What is the wavelength, in metres?', 1.2, 'Crest to crest: 1.8 − 0.6 = 1.2 m.', { unit: 'm', tolerance: 0.001, rules: [[[3], '3.0 m is a position, not a spacing. Subtract neighbouring crests.', 'position-vs-spacing'], [[2.4], '3.0 − 0.6 spans two wavelengths; divide by 2.', 'two-wavelengths']] }), ['Subtract neighbouring crest positions.'], ['1.8 − 0.6 = 1.2 m.']),
    ind('i6', 'Reading λ', 'read', 'Half a wavelength.', pick('ps-l7-i6', 'Two neighbouring crossings of the average-density line are 0.25 m apart. What is the wavelength?', [
      ['0.5 m', null],
      ['0.25 m', 'Neighbouring crossings are half a wavelength apart; double it.', 'half-wavelength'],
      ['1.0 m', 'Doubling once is enough: 2 × 0.25 = 0.5 m.', 'wrong-operation'],
    ], 'λ = 2 × 0.25 = 0.5 m.'), ['How far along one repeat is one crossing from the next?'], ['Half a wavelength each: λ = 0.5 m.']),
  ],
  reflection: {
    discover: 'A sound wave is described by its wavelength (a distance), its frequency (oscillations per second) and its time period (seconds per oscillation), with T ν = 1.',
    evidence: 'You counted oscillations to find ν, turned it into T with T ν = 1, and read λ from crest-to-crest distances.',
    stillConfusing: [
      { text: 'Which distance is the wavelength?', refresherId: 'ps7-lambda' },
      { text: 'How are frequency and time period linked?', refresherId: 'ps7-tnu' },
      { text: 'How do I read λ from a graph?', refresherId: 'ps7-read' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Lesson 8: Amplitude and intensity (10.6.2)
// ---------------------------------------------------------------------------

export const S8: EduLesson = {
  id: 'ps-l8', unitId: 'ps-unit-3', number: 8, title: 'Amplitude and intensity',
  objective: 'say what the amplitude of a sound wave is, link a bigger amplitude to more energy and a louder sound, and explain why the intensity of a sound falls as you move away from the source.',
  prerequisiteIds: ['psp-graph'],
  objectives: [
    { id: 'amp', label: 'Read and compare amplitudes on a density graph' },
    { id: 'energy', label: 'Link amplitude to energy and loudness, independent of frequency' },
    { id: 'intensity', label: 'Explain what intensity is and why it falls with distance' },
  ],
  steps: [
    {
      id: 'ps8-amp', title: 'Amplitude: how big the change is', phase: 'observe',
      paragraphs: [
        'The amplitude of a sound wave is the largest change of the density (or pressure) from its average value. On a density graph it is the height of a crest above the dashed average line (or the depth of a trough below it).',
        'A gentle tap on a drum makes small compressions; a hard hit makes the air crowd together much more. The hard hit has the larger amplitude.',
      ],
      visual: waveVisual({ setup: { densityAmp: 0.5 }, graph: true }, 'A sound wave with a large amplitude, and its density graph.'),
      notice: 'Compare the height of the crests above the dashed line with the earlier lessons’ waves.',
      check: pick('chk-ps8-amp', 'On a density graph, where do you read the amplitude?', [
        ['The height of a crest above the average line', null],
        ['The distance from crest to crest', 'That distance along the axis is the wavelength.', 'amplitude-vs-wavelength'],
        ['The height from a trough to a crest', 'Trough to crest is twice the amplitude; measure from the average line.', 'double-amplitude'],
      ], 'Measure from the average line to a crest.', undefined, 'ps8-amp'),
    },
    {
      id: 'ps8-independent', title: 'Amplitude and frequency are separate', phase: 'reasoning',
      paragraphs: [
        'You can strike a tuning fork softly or hard: its frequency stays the same (it is set by the fork), but the amplitude changes. A loudspeaker can play the same note quietly or loudly.',
        'So two waves can have the same wavelength and frequency but different amplitudes, or the same amplitude and different frequencies.',
      ],
      check: pick('chk-ps8-independent', 'A tuning fork is struck harder. What changes?', [
        ['The amplitude', null],
        ['The frequency', 'The fork’s frequency is fixed by the fork itself; striking harder only makes bigger vibrations.', 'amplitude-changes-frequency'],
        ['The wavelength', 'At the same frequency and speed, the wavelength stays the same.', 'amplitude-changes-wavelength'],
      ], 'Only the amplitude grows.', undefined, 'ps8-independent'),
    },
    {
      id: 'ps8-energy', title: 'Bigger amplitude, more energy, louder', phase: 'reasoning',
      paragraphs: [
        'Pushing the air harder takes more energy, so a sound with a larger amplitude carries more energy. Our ears hear it as louder.',
        'This is why a gentle tap is soft and a hard hit is loud, even though both drums ring at the same pitch.',
      ],
      why: 'Making bigger compressions needs bigger forces on the air, so more energy is passed on to it.',
      check: pick('chk-ps8-energy', 'Two sounds have the same frequency. Sound P has twice the amplitude of sound Q. Which is louder?', [
        ['P, because it carries more energy', null],
        ['Q, because its waves are calmer', 'A smaller amplitude carries less energy and sounds softer.', 'amplitude-loudness'],
        ['Neither: loudness depends only on frequency', 'Frequency decides pitch; amplitude decides loudness.', 'pitch-vs-loudness'],
      ], 'Larger amplitude, louder sound.', undefined, 'ps8-energy'),
    },
    {
      id: 'ps8-intensity', title: 'Intensity falls with distance', phase: 'apply',
      paragraphs: [
        'The intensity of a sound is the amount of sound energy passing each second through a unit area facing the sound. Close to a source the energy is concentrated; farther away the same energy is spread over a much larger area.',
        'So the intensity, and the loudness you hear, fall as you move away from a source, even though the source itself has not changed. Intensity is a measured quantity; loudness is how our ears respond to it.',
      ],
      vocabulary: [{ term: 'intensity', meaning: 'sound energy passing per second through a unit area' }],
      check: pick('chk-ps8-intensity', 'You walk away from a loudspeaker playing at a steady volume. Why does it sound quieter?', [
        ['Its energy spreads over a larger area, so less reaches each square metre', null],
        ['The loudspeaker lowers its frequency', 'The frequency does not change as you walk away.', 'distance-changes-frequency'],
        ['The sound waves get shorter', 'The wavelength does not depend on where you stand.', 'distance-changes-wavelength'],
      ], 'Spreading lowers the intensity.', undefined, 'ps8-intensity'),
    },
  ],
  investigation: { title: 'Try it in the Wave Laboratory', description: 'Change only the amplitude and watch the crests grow while the wavelength stays the same.', href: WAVE_LAB, buttonLabel: 'Open the Wave Laboratory' },
  worked: {
    id: 'w-ps-l8', title: 'Comparing two graphs',
    given: ['Two density graphs are drawn to the same scales.', 'Graph X: crests 0.3 units above the average line, crests 1 m apart.', 'Graph Y: crests 0.15 units above the average line, crests 1 m apart.'],
    ask: 'Compare their amplitudes, wavelengths, energy and loudness.',
    steps: [
      { text: 'Amplitudes: X is 0.3 units, Y is 0.15 units, so X has twice the amplitude.', why: 'Amplitude is the height of a crest above the average line.' },
      { text: 'Wavelengths: both are 1 m.', why: 'Crest-to-crest distances are equal.' },
      { text: 'X carries more energy.', why: 'A larger amplitude needs more energy.' },
      { text: 'X sounds louder; both have the same pitch.', why: 'Loudness follows amplitude; pitch follows frequency, which is the same here (same λ in the same air).' },
    ],
    verify: 'Only the amplitude differs, so only the loudness differs.',
  },
  guided: {
    id: 'g-ps-l8', prompt: 'A guitar string is plucked softly, then hard. You then walk to the far end of the hall.',
    steps: [
      { id: 'g1', prompt: 'Soft and hard.', question: pick('ps-g8-1', 'Which pluck gives the larger amplitude?', [['The hard pluck', null], ['The soft pluck', 'A harder pluck makes bigger vibrations.', 'amplitude-loudness']], 'Hard pluck: larger amplitude.', undefined, 'ps8-amp'), hints: ['Which pluck moves the string more?'] },
      { id: 'g2', prompt: 'The note.', question: pick('ps-g8-2', 'Does the note (pitch) change between the soft and hard pluck?', [['No', null], ['Yes, the hard pluck is higher', 'The pitch depends on the frequency, which the string sets; plucking harder changes the amplitude only.', 'amplitude-changes-frequency']], 'Same note.', undefined, 'ps8-independent'), hints: ['What decides pitch?'] },
      { id: 'g3', prompt: 'Far end of the hall.', question: pick('ps-g8-3', 'At the far end of the hall, what has fallen?', [['The intensity of the sound reaching you', null], ['The frequency of the sound', 'Moving away does not change the frequency.', 'distance-changes-frequency']], 'Intensity falls with distance.', undefined, 'ps8-intensity'), hints: ['The energy is spread over more area.'] },
    ],
    conclusion: 'The hard pluck has the larger amplitude and is louder at the same pitch; far away, the intensity is lower.',
  },
  independent: [
    ind('i1', 'Amplitude', 'amp', 'Read the graph.', numQ('ps-l8-i1', 'A density graph has its average line at 1.0 unit, crests at 1.4 units and troughs at 0.6 units. What is the amplitude, in units?', 0.4, '1.4 − 1.0 = 0.4 units.', { tolerance: 0.001, rules: [[[0.8], '0.8 is crest to trough, twice the amplitude.', 'double-amplitude'], [[1.4], '1.4 is the crest value; subtract the average.', 'value-vs-change']] }), ['Measure from the average line.'], ['Amplitude = 1.4 − 1.0 = 0.4 units.']),
    ind('i2', 'Amplitude', 'amp', 'Compare.', pick('ps-l8-i2', 'Graph M’s crests rise 2 squares above the average line, graph N’s rise 5 squares (same scales). Which has the smaller amplitude?', [['M', null], ['N', 'N rises higher, so it has the larger amplitude.', 'amplitude-reading']], 'M has the smaller amplitude.'), ['Compare crest heights.'], ['M (2 squares) < N (5 squares).']),
    ind('i3', 'Energy and loudness', 'energy', 'Louder.', pick('ps-l8-i3', 'Which change makes a sound louder?', [['A larger amplitude', null], ['A higher frequency', 'A higher frequency raises the pitch, not the loudness.', 'pitch-vs-loudness'], ['A longer wavelength', 'Wavelength is linked to frequency, not loudness.', 'wavelength-loudness']], 'Larger amplitude.'), ['What does a hard hit change?'], ['Loudness follows amplitude.']),
    ind('i4', 'Energy and loudness', 'energy', 'Same note.', pick('ps-l8-i4', 'A singer holds the same note but sings louder. What has changed?', [['The amplitude (and energy) of the sound', null], ['The frequency', 'The same note means the same frequency.', 'amplitude-changes-frequency']], 'Amplitude.'), ['Same note: same frequency.'], ['Only the amplitude grows.']),
    ind('i5', 'Intensity', 'intensity', 'Meaning.', pick('ps-l8-i5', 'What is the intensity of a sound?', [['The sound energy passing per second through a unit area', null], ['The number of oscillations per second', 'That is the frequency.', 'intensity-vs-frequency'], ['How high or low the note sounds', 'How high or low a note sounds is its pitch, which follows frequency.', 'intensity-vs-pitch']], 'Energy per second per unit area.'), ['It is about energy.'], ['Energy per second through each square metre.']),
    ind('i6', 'Intensity', 'intensity', 'Distance.', pick('ps-l8-i6', 'A siren is heard by two people, one 10 m away and one 100 m away. For whom is the intensity greater?', [['The person 10 m away', null], ['The person 100 m away', 'Farther away, the energy has spread over a much larger area.', 'distance-intensity'], ['It is the same for both', 'The energy spreads out as it travels, so it is not the same.', 'distance-intensity']], 'Closer means more intense.'), ['Where is the energy less spread out?'], ['Closer: the energy is concentrated on a smaller area.']),
  ],
  reflection: {
    discover: 'The amplitude is how big the density change is; a larger amplitude carries more energy and sounds louder, at the same pitch; intensity falls with distance as the energy spreads.',
    evidence: 'You read amplitudes from graphs, separated loudness from pitch, and explained why a sound fades with distance.',
    stillConfusing: [
      { text: 'Where do I read the amplitude?', refresherId: 'ps8-amp' },
      { text: 'Does a louder sound have a higher pitch?', refresherId: 'ps8-independent' },
      { text: 'Why does intensity fall with distance?', refresherId: 'ps8-intensity' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Lesson 9: Speed of sound (10.6.3)
// ---------------------------------------------------------------------------

export const S9: EduLesson = {
  id: 'ps-l9', unitId: 'ps-unit-3', number: 9, title: 'Speed of sound',
  objective: 'use v = ν λ, compare the speed of sound in solids, liquids and gases, and explain that in air it depends on the temperature but not on the frequency.',
  prerequisiteIds: ['psp-particles'],
  objectives: [
    { id: 'formula', label: 'Use v = ν λ to find a speed, frequency or wavelength' },
    { id: 'media', label: 'Compare the speed of sound in solids, liquids and gases' },
    { id: 'depends', label: 'Say what the speed depends on (medium, temperature) and what it does not (frequency)' },
  ],
  steps: [
    {
      id: 'ps9-derive', title: 'Where v = ν λ comes from', phase: 'reasoning',
      paragraphs: [
        'In one time period T, a compression moves forward exactly one wavelength λ (the next compression takes its place). So the speed is distance ÷ time = λ ÷ T.',
        'Since T = 1 ÷ ν, λ ÷ T = λ × ν. So v = ν λ (Equation 10.2 in the book): speed = frequency × wavelength.',
      ],
      proof: [
        { claim: 'In one time period a compression moves forward one wavelength', reason: 'After one full oscillation the pattern looks the same, shifted by one wavelength' },
        { claim: 'v = λ ÷ T', reason: 'Speed is distance travelled ÷ time taken' },
        { claim: 'v = ν λ', reason: 'T = 1 ÷ ν, so dividing by T is multiplying by ν' },
      ],
      check: pick('chk-ps9-derive', 'In one time period, how far does a compression move?', [
        ['One wavelength', null],
        ['Half a wavelength', 'In one full oscillation the pattern repeats once, so it moves a whole wavelength.', 'half-wavelength'],
        ['It does not move', 'The air particles stay near their places, but the compression (the pattern) travels.', 'pattern-vs-particles'],
      ], 'One period, one wavelength.', undefined, 'ps9-derive'),
    },
    {
      id: 'ps9-use', title: 'Using v = ν λ', phase: 'apply',
      paragraphs: [
        'With any two of v, ν and λ you can find the third: v = ν λ, λ = v ÷ ν, ν = v ÷ λ. Always use the speed the problem gives (the book itself uses 331, 340, 343, 344 and 345 m/s for air in different places).',
        'Example: a 680 Hz note in air at 340 m/s has λ = 340 ÷ 680 = 0.5 m.',
      ],
      visual: v('soundSpeed', { nu: 680, distance: 340 }, 'The same 680 Hz sound in air, water and steel: the wavelength is longest where the speed is greatest.'),
      check: pick('chk-ps9-use', 'A sound of λ = 2 m travels at 340 m/s. What is ν?', [
        ['170 Hz', null],
        ['680 Hz', 'That would be 340 × 2. Here ν = v ÷ λ.', 'wrong-operation'],
        ['342 Hz', 'Adding has no meaning here; divide the speed by the wavelength.', 'wrong-operation'],
      ], 'ν = 340 ÷ 2 = 170 Hz.', undefined, 'ps9-use'),
    },
    {
      id: 'ps9-media', title: 'Solids, liquids and gases', phase: 'observe',
      paragraphs: [
        'Sound is fastest in solids, slower in liquids and slowest in gases. Approximate values: about 340 m/s in air (at 15 °C), about 1500 m/s in water, about 5000 m/s in steel. Sound in water is roughly 4 to 5 times faster than in air.',
        'This is why you hear a train sooner by putting your ear to the rail than through the air (do not try this on a real track).',
      ],
      visual: v('soundSpeed', { editable: true, nu: 500, distance: 340 }, 'Time for a sound to travel the same distance in air, water and steel; you can change the distance and the frequency.'),
      notice: 'Steel is fastest and air slowest, whatever the frequency.',
      check: pick('chk-ps9-media', 'In which does sound travel fastest?', [
        ['A steel rail', null],
        ['Water', 'Water is faster than air but slower than steel.', 'media-order'],
        ['Air', 'Air is the slowest of the three.', 'media-order'],
      ], 'Solids are fastest.', undefined, 'ps9-media'),
    },
    {
      id: 'ps9-depends', title: 'What the speed depends on', phase: 'reasoning',
      paragraphs: [
        'In air, the speed of sound rises with temperature: about 331 m/s at 0 °C and nearly 344 m/s at 22 °C. Humidity also makes it a little faster.',
        'In most media the speed does NOT depend on the frequency: high and low notes from a band far away reach you together. Light, by comparison, is so fast that it arrives almost instantly, which is why you see lightning before you hear the thunder.',
      ],
      misconception: { wrong: 'High-pitched sounds travel faster than low-pitched ones.', right: 'In air all audible frequencies travel at the same speed; a higher frequency just has a shorter wavelength.' },
      check: pick('chk-ps9-depends', 'On a hot day compared with a cold day, sound in air travels…', [
        ['faster', null],
        ['slower', 'Warmer air carries sound faster (331 m/s at 0 °C, nearly 344 m/s at 22 °C).', 'temperature-direction'],
        ['at the same speed', 'The speed in air depends on the temperature.', 'temperature-ignored'],
      ], 'Warmer air, faster sound.', undefined, 'ps9-depends'),
    },
  ],
  investigation: { title: 'Try it in the Sound Characteristics Laboratory', description: 'Compare the travel time and the wavelength of the same sound in air, water and steel.', href: CHAR_LAB, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ps-l9', title: 'A note in air and in water',
    given: ['A 500 Hz note.', 'Speed in air 340 m/s; in water 1500 m/s.'],
    ask: 'Find the wavelength in each, and the time to travel 1020 m in air.',
    steps: [
      { text: 'In air: λ = v ÷ ν = 340 ÷ 500 = 0.68 m.', why: 'v = ν λ rearranged.' },
      { text: 'In water: λ = 1500 ÷ 500 = 3 m.', why: 'Same frequency, faster medium, longer wavelength.' },
      { text: 'Time in air: t = distance ÷ speed = 1020 ÷ 340 = 3 s.', why: 'Speed = distance ÷ time.' },
      { text: 'The frequency stayed 500 Hz in both media.', why: 'The source sets the frequency; the medium sets the speed and so the wavelength.' },
    ],
    verify: '500 × 0.68 = 340 and 500 × 3 = 1500, the two speeds.',
  },
  guided: {
    id: 'g-ps-l9', prompt: 'A 680 Hz whistle in air (340 m/s). A listener is 1700 m away.',
    steps: [
      { id: 'g1', prompt: 'Wavelength.', question: numQ('ps-g9-1', 'What is the wavelength, in metres?', 0.5, 'λ = 340 ÷ 680 = 0.5 m.', { unit: 'm', tolerance: 0.001, rules: [[[2], 'That is 680 ÷ 340: divide the speed by the frequency.', 'inverted-ratio']] }), hints: ['λ = v ÷ ν.'] },
      { id: 'g2', prompt: 'Travel time.', question: numQ('ps-g9-2', 'How long does the sound take to reach the listener, in seconds?', 5, '1700 ÷ 340 = 5 s.', { unit: 's', rules: [[[0.2], 'Distance ÷ speed, not speed ÷ distance.', 'inverted-ratio']] }), hints: ['t = d ÷ v.'] },
      { id: 'g3', prompt: 'A different note.', question: pick('ps-g9-3', 'A 340 Hz whistle is blown at the same time. When does it arrive?', [['At the same time, after 5 s', null], ['Later, because its frequency is lower', 'In air the speed does not depend on the frequency.', 'frequency-speed']], 'Same speed, same time.', undefined, 'ps9-depends'), hints: ['Does frequency change the speed in air?'] },
    ],
    conclusion: 'λ = 0.5 m and both notes arrive after 5 s: in air, every frequency travels at the same speed.',
  },
  independent: [
    ind('i1', 'v = ν λ', 'formula', 'Speed.', numQ('ps-l9-i1', 'A wave has ν = 400 Hz and λ = 0.85 m. What is its speed, in m/s?', 340, 'v = 400 × 0.85 = 340 m/s.', { unit: 'm/s', rules: [[[470.6, 470.59], 'That is 400 ÷ 0.85. Speed is ν × λ.', 'wrong-operation']] }), ['v = ν × λ.'], ['400 × 0.85 = 340 m/s.']),
    ind('i2', 'v = ν λ', 'formula', 'Wavelength.', numQ('ps-l9-i2', 'A 1000 Hz sound travels at 343 m/s. What is its wavelength, in metres?', 0.343, 'λ = 343 ÷ 1000 = 0.343 m.', { unit: 'm', tolerance: 0.0005, rules: [[[343000], 'Multiplying gives a huge length; λ = v ÷ ν.', 'wrong-operation']] }), ['λ = v ÷ ν.'], ['343 ÷ 1000 = 0.343 m.']),
    ind('i3', 'Media', 'media', 'Order.', pick('ps-l9-i3', 'Arrange the speed of sound from slowest to fastest.', [['air, water, steel', null], ['steel, water, air', 'That is fastest to slowest.', 'media-order'], ['water, air, steel', 'Air is slower than water.', 'media-order']], 'Gases < liquids < solids.'), ['Particles closer and more tightly linked carry sound faster.'], ['air < water < steel.']),
    ind('i4', 'Media', 'media', 'Ratio.', numQ('ps-l9-i4', 'Using 1500 m/s in water and 340 m/s in air, how many times faster is sound in water? Give two decimal places.', 4.41, '1500 ÷ 340 ≈ 4.41.', { tolerance: 0.006, rules: [[[0.23], 'That is air ÷ water. Divide the faster by the slower.', 'inverted-ratio'], [[1160], 'Subtracting gives a difference, not "how many times".', 'difference-vs-ratio']] }), ['Divide the two speeds.'], ['1500 ÷ 340 ≈ 4.41.']),
    ind('i5', 'Dependence', 'depends', 'Temperature.', pick('ps-l9-i5', 'The speed of sound in air is about 331 m/s at 0 °C. At 30 °C it is…', [['more than 331 m/s', null], ['less than 331 m/s', 'Warmer air carries sound faster.', 'temperature-direction'], ['exactly 331 m/s', 'The speed in air changes with temperature.', 'temperature-ignored']], 'Warmer: faster.'), ['Compare with 22 °C.'], ['Higher temperature, higher speed.']),
    ind('i6', 'Dependence', 'depends', 'Frequency.', pick('ps-l9-i6', 'A drum (low note) and a flute (high note) far away start together. What do you hear?', [['Both arrive together', null], ['The flute first', 'In air the speed does not depend on the frequency.', 'frequency-speed'], ['The drum first', 'Low notes are not faster either.', 'frequency-speed']], 'Same speed for all frequencies.'), ['Does pitch change speed in air?'], ['They arrive together.']),
  ],
  reflection: {
    discover: 'Speed = frequency × wavelength; sound is fastest in solids and slowest in gases; in air the speed rises with temperature but does not depend on the frequency.',
    evidence: 'You derived v = ν λ, used it both ways, and compared media.',
    stillConfusing: [
      { text: 'Why is v = ν λ?', refresherId: 'ps9-derive' },
      { text: 'Which medium is fastest?', refresherId: 'ps9-media' },
      { text: 'Does a high note travel faster?', refresherId: 'ps9-depends' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Lesson 10: Pitch, loudness and hearing (10.6.4)
// ---------------------------------------------------------------------------

export const S10: EduLesson = {
  id: 'ps-l10', unitId: 'ps-unit-3', number: 10, title: 'Pitch, loudness and hearing',
  objective: 'link pitch to frequency and loudness to amplitude, state the human audible range, and tell infrasonic, audible and ultrasonic sounds apart.',
  prerequisiteIds: [],
  objectives: [
    { id: 'pitch', label: 'Link pitch to frequency' },
    { id: 'loud', label: 'Link loudness to amplitude and know why loud noise is harmful' },
    { id: 'range', label: 'Use the audible range 20 Hz to 20 kHz to classify sounds' },
  ],
  steps: [
    {
      id: 'ps10-pitch', title: 'Pitch follows frequency', phase: 'observe',
      paragraphs: [
        'Pitch is how high or low a sound seems. A higher frequency sounds higher in pitch: a whistle or a bird’s chirp has a high frequency, a drum or a man’s deep voice a lower one.',
        'Going up an octave doubles the frequency: if one Sa is 240 Hz, the Sa an octave above is 480 Hz.',
      ],
      visual: v('soundPitch', { nu: 440, ladder: true }, 'A 440 Hz sound on the frequency scale, with one octave of notes from Sa = 240 Hz.'),
      check: pick('chk-ps10-pitch', 'Which has the higher pitch?', [['A 1200 Hz whistle', null], ['A 120 Hz hum', 'The lower frequency gives the lower pitch.', 'pitch-direction']], 'Higher frequency, higher pitch.', undefined, 'ps10-pitch'),
    },
    {
      id: 'ps10-loud', title: 'Loudness follows amplitude', phase: 'reasoning',
      paragraphs: [
        'Loudness is how strong a sound seems to our ears. It grows with the amplitude (and so with the energy) of the sound. Loudness is commonly measured in decibels (dB).',
        'Very loud sounds, or long exposure to noise, can damage hearing permanently. Unwanted, unpleasant sound is called noise. Keeping earphone volume moderate protects your ears.',
      ],
      check: pick('chk-ps10-loud', 'Turning up the volume of a music player changes mainly…', [['the amplitude, so the loudness', null], ['the frequency, so the pitch', 'The song keeps the same notes; only the amplitude rises.', 'pitch-vs-loudness']], 'Volume is amplitude.', undefined, 'ps10-loud'),
    },
    {
      id: 'ps10-range', title: 'The audible range', phase: 'apply',
      paragraphs: [
        'A typical young person can hear frequencies from about 20 Hz to about 20 000 Hz (20 kHz). Sounds below 20 Hz are infrasonic; sounds above 20 kHz are ultrasonic. Neither can be heard by people.',
        'Elephants and whales use infrasound; bats, dolphins and some insects use ultrasound. The upper limit of hearing usually falls with age.',
      ],
      visual: v('soundPitch', { editable: true, nu: 15000 }, 'A frequency slider on a scale divided into infrasonic, audible and ultrasonic ranges.'),
      notice: 'Move the frequency below 20 Hz and above 20 kHz and watch the label change.',
      check: pick('chk-ps10-range', 'A sound of 35 000 Hz is…', [['ultrasonic', null], ['infrasonic', 'Infrasonic means below 20 Hz.', 'band-direction'], ['audible', 'It is above 20 000 Hz, beyond human hearing.', 'band-limit']], 'Above 20 kHz: ultrasonic.', undefined, 'ps10-range'),
    },
    {
      id: 'ps10-quality', title: 'Tone, note and quality', phase: 'reasoning',
      paragraphs: [
        'A sound of a single frequency is a tone. Most instruments produce a note: a mixture of several frequencies, the lowest of which sets the pitch. The mixture gives each instrument its quality (timbre), which is why a flute and a sitar playing the same note sound different.',
        'Sir C. V. Raman studied why Indian drums such as the tabla give clear musical notes: the black patch (syaahi) on the drum head shapes its vibrations.',
      ],
      check: pick('chk-ps10-quality', 'A flute and a violin play the same note at the same loudness. Why do they still sound different?', [['Their notes are different mixtures of frequencies (quality)', null], ['Their pitch is different', 'The same note means the same pitch.', 'quality-vs-pitch'], ['One is louder', 'They are equally loud here.', 'quality-vs-loudness']], 'Quality (timbre) differs.', undefined, 'ps10-quality'),
    },
  ],
  investigation: { title: 'Try it in the Sound Characteristics Laboratory', description: 'Move the frequency across the audible range and change the amplitude.', href: CHAR_LAB, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ps-l10', title: 'Classifying sounds',
    given: ['Three sounds: 12 Hz from a distant storm, 2500 Hz from a whistle, 45 kHz from a bat.'],
    ask: 'Classify each and say which a person can hear.',
    steps: [
      { text: '12 Hz is below 20 Hz: infrasonic, not heard.', why: 'The lower limit of human hearing is about 20 Hz.' },
      { text: '2500 Hz lies between 20 Hz and 20 000 Hz: audible, a fairly high pitch.', why: 'Inside the audible range.' },
      { text: '45 kHz = 45 000 Hz is above 20 kHz: ultrasonic, not heard.', why: 'The upper limit is about 20 kHz.' },
      { text: 'Only the whistle is heard.', why: 'Only it lies in 20 Hz to 20 kHz.' },
    ],
    verify: 'Each frequency was compared with both limits.',
  },
  guided: {
    id: 'g-ps-l10', prompt: 'A note is played at 300 Hz, then at 600 Hz, then the 600 Hz note is made louder.',
    steps: [
      { id: 'g1', prompt: 'Pitch.', question: pick('ps-g10-1', 'Which note has the higher pitch?', [['600 Hz', null], ['300 Hz', 'Higher frequency means higher pitch.', 'pitch-direction']], '600 Hz.', undefined, 'ps10-pitch'), hints: ['Compare frequencies.'] },
      { id: 'g2', prompt: 'Octave.', question: pick('ps-g10-2', 'How are 300 Hz and 600 Hz related?', [['600 Hz is one octave above 300 Hz', null], ['They are the same note', 'They differ in pitch; doubling the frequency is one octave up.', 'octave']], 'Doubling: one octave.', undefined, 'ps10-pitch'), hints: ['600 = 2 × 300.'] },
      { id: 'g3', prompt: 'Louder.', question: pick('ps-g10-3', 'Making the 600 Hz note louder changes…', [['its amplitude', null], ['its frequency', 'Louder means larger amplitude; the pitch stays.', 'pitch-vs-loudness']], 'Amplitude.', undefined, 'ps10-loud'), hints: ['What does volume change?'] },
    ],
    conclusion: '600 Hz is higher (one octave above 300 Hz); louder means a larger amplitude, not a higher pitch.',
  },
  independent: [
    ind('i1', 'Pitch', 'pitch', 'Higher pitch.', pick('ps-l10-i1', 'A mosquito’s buzz has a higher pitch than a lion’s roar. This means the buzz has…', [['a higher frequency', null], ['a larger amplitude', 'Amplitude decides loudness; the roar is louder but lower.', 'pitch-vs-loudness']], 'Higher frequency.'), ['Pitch follows frequency.'], ['Higher pitch means higher frequency.']),
    ind('i2', 'Pitch', 'pitch', 'Octave.', numQ('ps-l10-i2', 'A note is 330 Hz. What is the frequency of the same note one octave higher, in Hz?', 660, 'One octave up doubles the frequency: 660 Hz.', { unit: 'Hz', rules: [[[165], 'Halving goes one octave DOWN.', 'octave-direction'], [[331], 'An octave is a doubling, not a step of 1 Hz.', 'octave']] }), ['Double it.'], ['2 × 330 = 660 Hz.']),
    ind('i3', 'Loudness', 'loud', 'Amplitude.', pick('ps-l10-i3', 'Which sound has the larger amplitude?', [['A shout', null], ['A whisper', 'A whisper is soft: small amplitude.', 'amplitude-loudness']], 'The shout.'), ['Louder means…'], ['A shout: larger amplitude.']),
    ind('i4', 'Loudness', 'loud', 'Noise.', pick('ps-l10-i4', 'Why should earphones not be played very loud for long?', [['Loud sounds over a long time can damage hearing permanently', null], ['Loud sounds have a lower frequency', 'Loudness is about amplitude, not frequency.', 'pitch-vs-loudness']], 'Hearing damage.'), ['What does the chapter say about noise?'], ['Prolonged loud sound can cause hearing loss.']),
    ind('i5', 'Audible range', 'range', 'Classify.', pick('ps-l10-i5', 'An earthquake produces waves of 5 Hz. These are…', [['infrasonic', null], ['ultrasonic', 'Ultrasonic means above 20 kHz.', 'band-direction'], ['audible', '5 Hz is below the 20 Hz limit.', 'band-limit']], 'Below 20 Hz.'), ['Compare with 20 Hz.'], ['5 Hz < 20 Hz: infrasonic.']),
    ind('i6', 'Audible range', 'range', 'Limits.', numQ('ps-l10-i6', 'What is the upper limit of the human audible range, in Hz?', 20000, 'About 20 000 Hz (20 kHz).', { unit: 'Hz', rules: [[[20], '20 Hz is the LOWER limit.', 'band-direction'], [[2000], 'It is 20 000 Hz (20 kHz), ten times more.', 'band-limit']] }), ['20 kHz in hertz.'], ['20 kHz = 20 000 Hz.']),
  ],
  reflection: {
    discover: 'Pitch follows frequency, loudness follows amplitude, and people hear only from about 20 Hz to 20 kHz; below is infrasonic, above is ultrasonic.',
    evidence: 'You compared pitches, used an octave, and classified sounds into the three ranges.',
    stillConfusing: [
      { text: 'Is a louder sound higher in pitch?', refresherId: 'ps10-loud' },
      { text: 'What are the limits of hearing?', refresherId: 'ps10-range' },
      { text: 'Why do instruments sound different?', refresherId: 'ps10-quality' },
    ],
  },
};
