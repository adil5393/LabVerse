/**
 * Chapter 10 (Sound) chapter practice bank and chapter assessment. Original questions across Lessons 1 to 12, grouped by unit,
 * with difficulty and marks; each numeric answer is checked against `../characteristics.ts` by `__tests__/soundComplete.test.ts`.
 * Practice is saved as chapter practice and never changes lesson mastery.
 */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: { kind: 'original' } });

export const SOUND_PRACTICE: PracticeSet = {
  id: 'sound-practice', title: 'Sound chapter practice',
  groups: [
    {
      id: 'g-making', title: 'Making and carrying sound', blurb: 'Vibration, sources, and the need for a medium (Lessons 1 to 3).',
      items: [
        item('sp-1', 'Vibration', 'Stopping a sound.', pick('sp-1q', 'You press your hand on a ringing bell. Why does the sound stop?', [['The bell stops vibrating', null], ['The sound is absorbed by your hand only', 'Your hand stops the bell vibrating; with no vibration no sound is made.', 'sound-persists']], 'No vibration, no sound.'), ['What makes sound?'], ['Sound is produced only while the bell vibrates.'], 'basic'),
        item('sp-2', 'Medium', 'On the Moon.', pick('sp-2q', 'Two astronauts on the Moon stand close together without radios. Can they hear each other speak?', [['No: there is no air to carry the sound', null], ['Yes, if they shout', 'Shouting makes bigger vibrations but there is still no medium to carry them.', 'shout-in-vacuum']], 'No medium, no sound.'), ['What does sound need?'], ['The Moon has almost no atmosphere, so sound cannot travel between them.'], 'basic'),
        item('sp-3', 'Medium', 'Through a wall.', pick('sp-3q', 'You can hear a conversation in the next room through the wall. What does this show?', [['Sound can travel through solids', null], ['Sound only travels through air', 'The wall is a solid and it carried the sound.', 'gas-only']], 'Solids carry sound.'), ['What is the wall made of?'], ['The sound travelled through the solid wall.'], 'basic'),
      ],
    },
    {
      id: 'g-wave', title: 'Sound as a wave', blurb: 'Compressions, rarefactions, energy and the density graph (Lessons 4 to 6).',
      items: [
        item('sp-4', 'Longitudinal wave', 'What moves.', pick('sp-4q', 'As a sound wave passes, what happens to the air particles?', [['They vibrate back and forth about their places', null], ['They travel with the wave to your ear', 'The pattern travels; each particle only oscillates about its place.', 'particle-travel']], 'They oscillate in place.'), ['Think of the marked particle in the Wave Laboratory.'], ['Particles oscillate; the compressions and rarefactions travel.'], 'standard'),
        item('sp-5', 'Energy', 'What reaches the ear.', pick('sp-5q', 'What does a sound wave carry from a drum to your ear?', [['Energy', null], ['Air from near the drum', 'Air near the drum does not travel to you; only energy is passed on.', 'matter-travel']], 'Energy, not matter.'), ['Do the particles travel?'], ['The wave carries energy, passed from particle to particle.'], 'standard'),
        item('sp-6', 'Graph', 'Crest.', pick('sp-6q', 'On a density graph of a sound wave, a crest shows…', [['a compression', null], ['a rarefaction', 'A rarefaction is a trough (density below average).', 'crest-trough']], 'Crest = compression.'), ['Crests are highest density.'], ['Highest density is a compression.'], 'basic'),
      ],
    },
    {
      id: 'g-describe', title: 'What describes a sound', blurb: 'λ, ν, T, amplitude, speed, pitch and loudness (Lessons 7 to 10).',
      items: [
        item('sp-7', 'T ν = 1', 'Period.', num('sp-7q', 'A sound has a frequency of 400 Hz. What is its time period, in seconds?', 0.0025, 'T = 1 ÷ 400 = 0.0025 s.', { unit: 's', tolerance: 0.00001, rules: [[[400], 'That is ν. T = 1 ÷ ν.', 'period-vs-frequency']] }), ['T = 1 ÷ ν.'], ['1 ÷ 400 = 0.0025 s.'], 'basic'),
        item('sp-8', 'Frequency', 'Counting.', num('sp-8q', '90 compressions pass a point in 3 s. What is the frequency, in Hz?', 30, '90 ÷ 3 = 30 Hz.', { unit: 'Hz', rules: [[[270], 'Divide by the time.', 'wrong-operation']] }), ['Compressions ÷ seconds.'], ['90 ÷ 3 = 30 Hz.'], 'basic'),
        item('sp-9', 'v = ν λ', 'Wavelength.', num('sp-9q', 'A 256 Hz tuning fork sounds in air at 344 m/s. What is the wavelength, in metres? (two decimal places)', 1.34, '344 ÷ 256 ≈ 1.34 m.', { unit: 'm', tolerance: 0.006, rules: [[[0.74], 'That is 256 ÷ 344; λ = v ÷ ν.', 'inverted-ratio']] }), ['λ = v ÷ ν.'], ['344 ÷ 256 = 1.34375 ≈ 1.34 m.'], 'standard', 2),
        item('sp-10', 'v = ν λ', 'Frequency from a graph.', num('sp-10q', 'Neighbouring compressions are 0.68 m apart in air at 340 m/s. What is the frequency, in Hz?', 500, 'ν = 340 ÷ 0.68 = 500 Hz.', { unit: 'Hz', rules: [[[231.2], 'That is 340 × 0.68; ν = v ÷ λ.', 'wrong-operation']] }), ['ν = v ÷ λ.'], ['340 ÷ 0.68 = 500 Hz.'], 'standard', 2),
        item('sp-11', 'Media', 'Steel rail.', num('sp-11q', 'A hammer strikes a steel rail 1000 m away. How long does the sound take to arrive through the steel at 5000 m/s, in seconds?', 0.2, '1000 ÷ 5000 = 0.2 s.', { unit: 's', tolerance: 0.0001, rules: [[[5], '5 is 5000 ÷ 1000: time = distance ÷ speed.', 'inverted-ratio']] }), ['t = d ÷ v.'], ['1000 ÷ 5000 = 0.2 s (through air it would take about 2.9 s).'], 'standard'),
        item('sp-12', 'Pitch and loudness', 'Which changes.', pick('sp-12q', 'Two notes have the same loudness but one sounds higher. They differ in…', [['frequency', null], ['amplitude', 'The same loudness means similar amplitude; pitch comes from frequency.', 'pitch-vs-loudness']], 'Frequency.'), ['What decides pitch?'], ['A higher pitch means a higher frequency.'], 'basic'),
        item('sp-13', 'Audible range', 'Dog whistle.', pick('sp-13q', 'A dog whistle at 25 kHz cannot be heard by people because it is…', [['ultrasonic', null], ['infrasonic', 'Infrasonic means below 20 Hz.', 'band-direction']], 'Above 20 kHz.'), ['Compare with 20 kHz.'], ['25 kHz > 20 kHz: ultrasonic.'], 'basic'),
        item('sp-14', 'Temperature', 'Colder air.', num('sp-14q', 'Thunder from 1324 m away travels in air at 331 m/s. How long does it take, in seconds?', 4, '1324 ÷ 331 = 4 s.', { unit: 's', rules: [[[0.25], 'Distance ÷ speed, not speed ÷ distance.', 'inverted-ratio']] }), ['t = d ÷ v.'], ['1324 ÷ 331 = 4 s.'], 'standard'),
      ],
    },
    {
      id: 'g-reflect', title: 'Echoes, ultrasound and SONAR', blurb: 'Reflection, echo, reverberation and SONAR (Lessons 11 and 12).',
      items: [
        item('sp-15', 'Echo distance', 'A well.', num('sp-15q', 'A boy shouts into a deep well and hears the echo from the water 0.2 s later (sound at 340 m/s). How deep is the water surface, in metres?', 34, 'd = 340 × 0.2 ÷ 2 = 34 m.', { unit: 'm', rules: [[[68], '68 m is down and back; halve it.', 'forgot-halving']] }), ['d = v t ÷ 2.'], ['340 × 0.2 = 68 m there and back; 34 m down.'], 'standard', 2),
        item('sp-16', 'Echo rule', 'A small room.', pick('sp-16q', 'Why is no separate echo heard in a small room 5 m across?', [['Reflections return in far less than 0.1 s and merge with the sound', null], ['Sound does not reflect indoors', 'Walls reflect sound well; it simply returns too soon.', 'no-reflection']], 'Too soon.'), ['t = 2 × 5 ÷ 340.'], ['Gap ≈ 0.03 s < 0.1 s: no separate echo.'], 'standard'),
        item('sp-17', 'SONAR', 'Sea bed.', num('sp-17q', 'A SONAR pulse returns after 1.2 s in sea water at 1500 m/s. How deep is the sea bed, in metres?', 900, '1500 × 1.2 ÷ 2 = 900 m.', { unit: 'm', rules: [[[1800], '1800 m is down and back; halve it.', 'forgot-halving']] }), ['d = v t ÷ 2.'], ['1500 × 1.2 ÷ 2 = 900 m.'], 'standard', 2),
        item('sp-18', 'Uses of ultrasound', 'Flaws.', pick('sp-18q', 'How does ultrasound find a crack inside a metal block?', [['The crack reflects the ultrasound, showing up in the echoes', null], ['The crack makes the metal glow', 'Ultrasound is detected by its echoes, not by light.', 'wrong-wave']], 'Reflection from the flaw.'), ['Echoes again.'], ['A flaw reflects part of the pulse, giving an extra echo.'], 'challenge'),
        item('sp-19', 'Echo ratio', 'Air and water.', pick('sp-19q', 'The same cliff is used for echoes in air (340 m/s) and in water (1500 m/s). Where does the echo return sooner?', [['In water', null], ['In air', 'Sound is faster in water, so it returns sooner over the same distance.', 'media-order']], 'Faster medium, shorter time.'), ['Same distance, which is faster?'], ['Water is faster, so its echo returns sooner.'], 'challenge'),
      ],
    },
  ],
};

const assessPick = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const SOUND_ASSESSMENT: ChapterAssessment = {
  id: 'sound-assessment-1',
  title: 'Sound Waves: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Use the speed of sound each question gives. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'sa-1', topic: 'Medium', lessonId: 'ps-l3', competency: 'knowledge', marks: 1, prompt: 'The bell jar.', question: assessPick('sa-1q', 'As air is pumped out of a jar with a ringing bell, the sound…', [['gets fainter', null], ['gets louder', 'Less air means less medium to carry the sound.'], ['stays the same', 'The sound depends on the air inside the jar.']], 'Less medium, fainter sound.'), solution: ['Sound needs a medium; removing air removes the medium.'] },
        { id: 'sa-2', topic: 'Longitudinal wave', lessonId: 'ps-l4', competency: 'knowledge', marks: 1, prompt: 'Kind of wave.', question: assessPick('sa-2q', 'Sound in air is a longitudinal wave because…', [['the particles vibrate along the direction the wave travels', null], ['the particles move up and down across the direction of travel', 'That describes a transverse wave.']], 'Along the direction of travel.'), solution: ['In a longitudinal wave, particles oscillate parallel to the direction of propagation.'] },
        { id: 'sa-3', topic: 'Audible range', lessonId: 'ps-l10', competency: 'knowledge', marks: 1, prompt: 'Range.', question: assessPick('sa-3q', 'Which frequency can a typical young person hear?', [['2 kHz', null], ['10 Hz', 'Below 20 Hz: infrasonic.'], ['50 kHz', 'Above 20 kHz: ultrasonic.']], '20 Hz to 20 kHz.'), solution: ['2 kHz = 2000 Hz lies between 20 Hz and 20 000 Hz.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'sa-4', topic: 'T ν = 1', lessonId: 'ps-l7', competency: 'application', marks: 2, prompt: 'Time period.', question: num('sa-4q', 'A string vibrates 150 times in 0.5 s. What is the time period, in seconds? (give four decimal places)', 0.0033, 'ν = 300 Hz, so T = 1 ÷ 300 ≈ 0.0033 s.', { unit: 's', tolerance: 0.00005 }), solution: ['ν = 150 ÷ 0.5 = 300 Hz.', 'T = 1 ÷ 300 ≈ 0.0033 s.'] },
        { id: 'sa-5', topic: 'v = ν λ', lessonId: 'ps-l9', competency: 'application', marks: 2, prompt: 'Wavelength in water.', question: num('sa-5q', 'A 750 Hz sound travels in water at 1500 m/s. What is its wavelength, in metres?', 2, 'λ = 1500 ÷ 750 = 2 m.', { unit: 'm', tolerance: 0.001 }), solution: ['λ = v ÷ ν = 1500 ÷ 750 = 2 m.'] },
        { id: 'sa-6', topic: 'Echo distance', lessonId: 'ps-l11', competency: 'application', marks: 2, prompt: 'Echo.', question: num('sa-6q', 'An echo is heard 1.5 s after a whistle, with sound at 340 m/s. How far is the reflecting wall, in metres?', 255, 'd = 340 × 1.5 ÷ 2 = 255 m.', { unit: 'm' }), solution: ['Total path = 340 × 1.5 = 510 m.', 'Distance = 510 ÷ 2 = 255 m.'] },
        { id: 'sa-7', topic: 'SONAR', lessonId: 'ps-l12', competency: 'application', marks: 2, prompt: 'Depth.', question: num('sa-7q', 'A SONAR echo returns after 2.4 s in sea water at 1530 m/s. How deep is the sea bed, in metres?', 1836, 'd = 1530 × 2.4 ÷ 2 = 1836 m.', { unit: 'm' }), solution: ['1530 × 2.4 = 3672 m down and back.', 'Depth = 3672 ÷ 2 = 1836 m.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'sa-8', topic: 'Amplitude and pitch', lessonId: 'ps-l8', competency: 'analysis', marks: 2, prompt: 'Two graphs.', question: assessPick('sa-8q', 'Graph P has crests twice as high as graph Q (same scales), and the same crest spacing. Which statement is correct?', [['P is louder; both have the same pitch', null], ['P has a higher pitch', 'Same crest spacing means same wavelength and, in the same air, the same frequency and pitch.'], ['Q is louder', 'Smaller amplitude means softer.']], 'Amplitude decides loudness; spacing decides pitch here.'), solution: ['Higher crests: larger amplitude, louder.', 'Same spacing: same λ, so same ν and pitch.'] },
        { id: 'sa-9', topic: 'Echo or reverberation', lessonId: 'ps-l11', competency: 'analysis', marks: 2, prompt: 'Is it an echo?', question: assessPick('sa-9q', 'A wall is 12 m away and sound travels at 340 m/s. Will a clap produce a separate echo?', [['No: the reflection returns after about 0.07 s, less than 0.1 s', null], ['Yes: any reflected sound is an echo', 'A separate echo needs at least about 0.1 s.']], 't = 24 ÷ 340 ≈ 0.071 s.'), solution: ['t = 2 × 12 ÷ 340 ≈ 0.071 s.', '0.071 s < 0.1 s: not a separate echo.'] },
        { id: 'sa-10', topic: 'Speed and temperature', lessonId: 'ps-l9', competency: 'analysis', marks: 2, prompt: 'Thunder.', question: num('sa-10q', 'Thunder is heard 3 s after the flash in air at 344 m/s. On a cold day at 331 m/s, how much longer would sound from the same distance take, in seconds? (two decimal places)', 0.12, 'd = 1032 m; 1032 ÷ 331 ≈ 3.118 s, so about 0.12 s longer.', { unit: 's', tolerance: 0.006 }), solution: ['d = 344 × 3 = 1032 m.', 'At 331 m/s: 1032 ÷ 331 ≈ 3.118 s.', 'Extra ≈ 0.12 s.'] },
      ],
    },
  ],
};
