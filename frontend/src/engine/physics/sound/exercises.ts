/**
 * NCERT Class 9 Chapter 10 end-of-chapter exercises and Pause and Ponder items: inventory and the solutions built so far (SND-1).
 *
 * All 15 exercises (24 answer parts) and all 13 Pause and Ponder items are listed with the book's numbering (verified in SND-0).
 * Only the ones that Lessons 1 to 6 support are solved: Exercises 1, 2, 3 and 8, and Pause and Ponder 1 to 6. Every other part is
 * honestly 'upcoming': it shows what it needs and carries NO solution. Original wording; the book's text is summarised, not copied.
 * Viewing a solution here never touches lesson mastery (this module imports no progress store).
 */

export interface SoundStep { text: string; why: string }

export interface SoundSolution {
  principle: string;
  steps: SoundStep[];
  answer: string;
  meaning: string;
  commonMistake: string;
  /** Draw two density curves half a wavelength apart (Pause and Ponder 6). */
  illustration?: 'phase';
}

export interface SoundExercisePart {
  id: string;
  label: string;
  status: 'solved' | 'upcoming';
  /** What must be taught before this part can be solved. */
  needs?: string;
  solution?: SoundSolution;
}

export interface SoundExercise {
  kind: 'exercise' | 'ponder';
  number: number;
  summary: string;
  topic: string;
  sections: string[];
  lessonIds: string[];
  parts: SoundExercisePart[];
}

const SOLUTIONS: Record<string, SoundSolution> = {
  'ex1-all': {
    principle: 'A mechanical wave is a wave that needs a material medium. The observation that separates sound from waves that do not need one is what supports it.',
    steps: [
      { text: 'Each choice is something that is true of sound: it shows reflection, it needs a medium, it has a frequency, it carries energy.', why: 'The question asks which observation BEST supports the idea that sound is a mechanical wave, so we look for the property that defines a mechanical wave.' },
      { text: 'A mechanical wave is one that needs a medium. The bell-jar demonstration showed that sound fades as the air is removed and cannot cross a vacuum.', why: 'Needing a medium is the defining property of a mechanical wave.' },
      { text: 'Reflection, frequency and carrying energy are also true of light, which is not a mechanical wave and travels through a vacuum.', why: 'A property shared with waves that do not need a medium cannot be what shows sound to be mechanical.' },
    ],
    answer: '(ii) Sound needs a medium to propagate.',
    meaning: 'Because sound cannot pass through a vacuum, it must be carried by the particles of a material, which is exactly what makes it a mechanical wave.',
    commonMistake: 'Choosing "carries energy": every wave carries energy, including light, so it does not tell you the wave is mechanical.',
  },
  'ex2-all': {
    principle: 'The frequency of a sound wave is the number of oscillations (cycles) per second at a fixed place. A compression passes a point once in every cycle.',
    steps: [
      { text: 'Frequency is the number of cycles at a fixed point each second. One compression and one rarefaction pass in each cycle.', why: 'This is the meaning of frequency (introduced in Lessons 1 and 2; defined in full in Lesson 7).' },
      { text: 'Raising the frequency means more cycles each second, so more compressions pass a point each second.', why: 'More cycles per second is, by definition, a higher frequency.' },
      { text: 'The other quantities do not rise: the time period of one cycle gets shorter (T = 1 ÷ ν), the wavelength gets shorter at a fixed speed, and the speed of sound in a medium is set by the medium, not by the frequency.', why: 'These relations are stated in Sections 10.6.1 and 10.6.3 of the book and are taught in Lessons 7 and 9; here they only rule out the other choices.' },
    ],
    answer: '(iii) the number of compressions per second.',
    meaning: 'A higher-frequency sound is one in which compressions arrive more often at your ear.',
    commonMistake: 'Choosing "time period": a higher frequency has a shorter period, not a longer one.',
  },
  'ex3-all': {
    principle: 'Frequency = the number of compressions (cycles) passing a point ÷ the time taken.',
    steps: [
      { text: 'Number of compressions = 20 and time = 4 s.', why: 'These are the two numbers the question gives.' },
      { text: 'Frequency = 20 ÷ 4 s = 5 per second.', why: 'Cycles divided by seconds gives cycles per second.' },
      { text: '5 per second is 5 Hz.', why: 'One cycle per second is one hertz.' },
    ],
    answer: '(ii) 5 Hz.',
    meaning: 'Five compressions pass the point every second.',
    commonMistake: 'Multiplying (20 × 4 = 80 Hz) instead of dividing: frequency is a number per second, so divide by the time.',
  },
  'ex8-all': {
    principle: 'Sound needs a medium and so cannot travel through the vacuum of space. Light does not need a medium.',
    steps: [
      { text: 'A spacecraft in space is surrounded by a near vacuum.', why: 'Outer space has almost no matter.' },
      { text: 'Without a medium between the explosion and the viewer, no sound could be carried, so the explosion would be silent.', why: 'Sound cannot propagate in a vacuum (the bell-jar demonstration).' },
      { text: 'The flash of light could cross space, but the film should show the flash with no sound at all.', why: 'Light is not a mechanical wave and needs no medium.' },
      { text: 'Even in air, where sound does travel, light reaches you almost at once while sound is much slower, so a flash and a bang would not arrive at the same moment.', why: 'Light is far faster than sound (Section 10.6.3, taught in Lesson 9).' },
    ],
    answer: 'Two errors: (1) the explosion is shown with sound, but sound cannot travel through the vacuum of space; (2) the light and the sound are shown arriving together, but even where sound can travel it arrives later than the light.',
    meaning: 'In space an explosion would be seen and not heard.',
    commonMistake: 'Saying the sound would just be quiet: with no medium there is no sound to be quiet.',
  },
  'pp1-all': {
    principle: 'This is an open question for you to explore: there is no single right answer. Any answer that names a vibrating object is a good one.',
    steps: [
      { text: 'Pluck or strum a stretched string, strike a metal object, tap a drum skin, blow across a pipe or a bottle, or hum.', why: 'Each makes something vibrate: a string, a metal bar, a skin, a column of air, vocal cords.' },
      { text: 'Rub the edge of a wet finger round the rim of a glass, or run a finger along the teeth of a comb.', why: 'Rubbing can also set an object vibrating.' },
    ],
    answer: 'Sample answers: plucking a string, striking a bell, blowing a flute, tapping a drum, humming, rubbing a finger on a glass rim. In all of them something vibrates.',
    meaning: 'Every way of making sound is a way of making something vibrate.',
    commonMistake: 'Listing sources (a radio, a phone) without saying what vibrates; always ask "what is moving to and fro?"',
  },
  'pp2-all': {
    principle: 'This is an open question for you to explore. For each instrument, name the part that vibrates.',
    steps: [
      { text: 'Sitar, tanpura, violin, guitar: the stretched strings vibrate.', why: 'Plucking or bowing makes a string vibrate.' },
      { text: 'Tabla, mridangam, dholak, drum: the stretched skin (membrane) vibrates.', why: 'Striking the skin makes it vibrate.' },
      { text: 'Bansuri, shehnai, flute: the column of air inside the pipe vibrates.', why: 'Blowing makes the air in the pipe vibrate.' },
      { text: 'Bell, taal, cymbal: the metal itself vibrates.', why: 'Striking the metal makes it vibrate.' },
    ],
    answer: 'Sample list: strings (sitar, tanpura), skins (tabla, mridangam), air columns (bansuri, shehnai), metal (bell, taal).',
    meaning: 'Different instruments use different vibrating parts, and often more than one.',
    commonMistake: 'Naming the whole instrument instead of the moving part.',
  },
  'pp3-all': {
    principle: 'Assertion: a bell in a closed jar cannot be heard after most of the air is pumped out. Reason: sound requires a medium. Decide whether each is true and whether the reason explains the assertion.',
    steps: [
      { text: 'The assertion is true: in the bell-jar demonstration the sound disappears as the air is removed.', why: 'This is what is observed.' },
      { text: 'The reason is true: sound needs a medium to travel.', why: 'Established by the same experiment.' },
      { text: 'The reason explains the assertion: with the air gone there is almost no medium to carry the bell\'s vibration out of the jar.', why: 'The loss of the medium is the cause of the lost sound.' },
    ],
    answer: '(ii) Both A and R are true, and R is the correct explanation of A.',
    meaning: 'The fading bell is the evidence, and the need for a medium is the reason.',
    commonMistake: 'Choosing (i): R is not just also true; it is the cause.',
  },
  'pp4-all': {
    principle: 'Assertion: compressions and rarefactions move through the medium. Reason: individual particles of the medium continuously move forward with the wave.',
    steps: [
      { text: 'The assertion is true: the pattern of compressions and rarefactions travels along the medium.', why: 'That is what a sound wave is.' },
      { text: 'The reason is false: the particles do not travel with the wave; each only vibrates about its mean position.', why: 'The marked particle in the Wave Laboratory stays near its rest position.' },
    ],
    answer: '(iii) A is true, but R is false.',
    meaning: 'The pattern travels; the particles stay.',
    commonMistake: 'Thinking the air moves from the source to the listener.',
  },
  'pp5-all': {
    principle: 'A sound wave transfers energy, not matter.',
    steps: [
      { text: 'Air particles near the fork only vibrate about their places; they do not travel to your ear.', why: 'The particles stay; the pattern moves.' },
      { text: 'The tuning fork material stays in the fork.', why: 'Nothing of the fork travels through the air.' },
      { text: 'What arrives at the ear is the energy of the vibration, carried by the wave.', why: 'A wave transfers energy.' },
    ],
    answer: '(ii) Energy carried by sound waves.',
    meaning: 'You hear a sound because energy reaches your ear, not because air or fork material does.',
    commonMistake: 'Choosing a stream of compressed air: no stream travels.',
  },
  'pp6-all': {
    principle: 'In the density strips of Fig. 10.17 the dense (dotted) bands are compressions (C) and the sparse bands are rarefactions (R). A density graph has a crest at a compression and a trough at a rarefaction.',
    steps: [
      { text: 'Measured from the figure: strips (a) and (b) have the same wavelength and the same amount of crowding (the same amplitude).', why: 'The dotted bands are equally spaced and equally dense in both.' },
      { text: 'But the dense bands of (b) fall half a wavelength along from those of (a): where (a) has a compression, (b) has a rarefaction.', why: 'Measured by comparing the position of the dense bands in the two strips.' },
      { text: 'Label each dense band C and each sparse band R, in both strips.', why: 'Crowded is compression; spread out is rarefaction.' },
      { text: 'Graph (c) for (a): label the horizontal axis "Distance" and the vertical axis "Density", draw a dashed average line, and put a crest at each C and a trough at each R.', why: 'Crests are compressions and troughs are rarefactions.' },
      { text: 'Graph (d) for (b) is the same curve as (c) shifted by half a wavelength: a crest where (c) has a trough.', why: 'The compressions of (b) are where the rarefactions of (a) are.' },
    ],
    answer: 'Both graphs are sine-like curves with the same wavelength and amplitude, labelled Distance (x) and Density (y) with a dashed average line; (d) is (c) shifted by half a wavelength, so its crests are under the troughs of (c).',
    meaning: 'Two waves can have the same wavelength and amplitude and still differ by where their compressions fall.',
    commonMistake: 'Drawing (d) as a smaller or longer wave: the two strips differ only in position, not in size or wavelength.',
    illustration: 'phase',
  },
};

const part = (key: string, id: string, label: string, needs: string): SoundExercisePart => {
  const solution = SOLUTIONS[key];
  return { id, label, status: solution ? 'solved' : 'upcoming', needs: solution ? undefined : needs, solution };
};
const one = (key: string, needs: string): SoundExercisePart[] => [part(key, 'all', 'The whole question', needs)];

const MS2 = 'frequency, wavelength and speed (Section 10.6, SND-2)', MS3 = 'echoes and SONAR (Sections 10.7 and 10.8, SND-3)';

export const SOUND_EXERCISES: SoundExercise[] = [
  { kind: 'exercise', number: 1, topic: 'Evidence that sound is a mechanical wave', sections: ['10.2.1', '10.3'], lessonIds: ['ps-l3', 'ps-l4'], summary: 'Choose which observation best supports the idea that sound is a mechanical wave.', parts: one('ex1-all', 'Lessons 3 and 4') },
  { kind: 'exercise', number: 2, topic: 'What a higher frequency changes', sections: ['10.6.1'], lessonIds: ['ps-l2', 'ps-l7'], summary: 'Choose what increases when the frequency of a sound wave increases.', parts: one('ex2-all', MS2) },
  { kind: 'exercise', number: 3, topic: 'Frequency from a count of compressions', sections: ['10.6.1'], lessonIds: ['ps-l2', 'ps-l7'], summary: 'Find the frequency when 20 compressions pass a point in 4 seconds.', parts: one('ex3-all', MS2) },
  { kind: 'exercise', number: 4, topic: 'Echo or reverberation', sections: ['10.7.1', '10.7.2'], lessonIds: ['ps-l11'], summary: 'Decide whether a reflection that arrives a given short time after the sound is an echo or reverberation, and justify it.', parts: one('ex4-all', MS3) },
  { kind: 'exercise', number: 5, topic: 'Comparing two density graphs', sections: ['10.5', '10.6.1', '10.6.2'], lessonIds: ['ps-l7', 'ps-l8'], summary: 'Using two graphs drawn to the same scales, say which has the greater wavelength and which the smaller amplitude.',
    parts: [part('ex5-i', 'i', '(i) greater wavelength', MS2), part('ex5-ii', 'ii', '(ii) smaller amplitude', MS2)] },
  { kind: 'exercise', number: 6, topic: 'Matching three curves to three sources', sections: ['10.6.1'], lessonIds: ['ps-l7', 'ps-l10'], summary: 'Three sources A, B and C are drawn as curves; given which has the greatest and which the least frequency, identify the curves.',
    parts: [part('ex6-a', 'A', 'curve of A (greatest frequency)', MS2), part('ex6-b', 'B', 'curve of B', MS2), part('ex6-c', 'C', 'curve of C (least frequency)', MS2)] },
  { kind: 'exercise', number: 7, topic: 'Draw a sound wave from numbers', sections: ['10.5', '10.6.1', '10.6.2'], lessonIds: ['ps-l6', 'ps-l7'], summary: 'Draw a graph for a sound wave of given density amplitude and wavelength.', parts: one('ex7-all', 'the wavelength and amplitude vocabulary of Lessons 7 and 8 and a drawing tool (SND-2)') },
  { kind: 'exercise', number: 8, topic: 'An explosion in space in a film', sections: ['10.2.1'], lessonIds: ['ps-l3'], summary: 'A film shows a spacecraft exploding in space with a flash and a sound at the same time; say what is wrong.', parts: one('ex8-all', 'Lesson 3') },
  { kind: 'exercise', number: 9, topic: 'Time period from wavelength and speed', sections: ['10.6.1', '10.6.3'], lessonIds: ['ps-l7', 'ps-l9'], summary: 'Find the time period of a wave of given wavelength and speed.', parts: one('ex9-all', MS2) },
  { kind: 'exercise', number: 10, topic: 'Sonar depth from an echo time', sections: ['10.8.1'], lessonIds: ['ps-l12'], summary: 'A ship detects a sonar echo after a given time; find how far down the wreckage is.', parts: one('ex10-all', MS3) },
  { kind: 'exercise', number: 11, topic: 'A parking sensor', sections: ['10.8.1'], lessonIds: ['ps-l12'], summary: 'Find the time an ultrasonic pulse takes to reach an obstacle at a given distance and return.', parts: one('ex11-all', MS3) },
  { kind: 'exercise', number: 12, topic: 'Thunder and air temperature', sections: ['10.6.3'], lessonIds: ['ps-l9'], summary: 'Find how much longer thunder takes to travel a given distance in colder air with a lower speed of sound.', parts: one('ex12-all', MS2) },
  { kind: 'exercise', number: 13, topic: 'Wavelength and frequency from a dot picture', sections: ['10.5', '10.6.1', '10.6.3'], lessonIds: ['ps-l7', 'ps-l9'], summary: 'Use a picture of the density of a medium and the speed of sound to find a wavelength and a frequency.',
    parts: [part('ex13-l', 'lambda', 'the wavelength', MS2), part('ex13-n', 'nu', 'the frequency', MS2)] },
  { kind: 'exercise', number: 14, topic: 'Wavelength and frequency of two waves on graph paper', sections: ['10.5', '10.6.1', '10.6.3'], lessonIds: ['ps-l7', 'ps-l9'], summary: 'Read the wavelengths of two waves on a graph and find both frequencies at a given speed.',
    parts: [part('ex14-la', 'lambdaA', 'wavelength of A', MS2), part('ex14-lb', 'lambdaB', 'wavelength of B', MS2), part('ex14-na', 'nuA', 'frequency of A', MS2), part('ex14-nb', 'nuB', 'frequency of B', MS2)] },
  { kind: 'exercise', number: 15, topic: 'Echo times in air and in water', sections: ['10.6.3', '10.7.1'], lessonIds: ['ps-l9', 'ps-l11'], summary: 'Two identical sources, one in air and one in water, send sound to a cliff; from the ratio of the echo times find the ratio of the speeds.', parts: one('ex15-all', 'speed of sound and echoes (SND-2 and SND-3)') },
  // Pause and Ponder
  { kind: 'ponder', number: 1, topic: 'Explore ways of producing sound', sections: ['10.1.1'], lessonIds: ['ps-l2'], summary: 'Explore different ways of producing sound.', parts: one('pp1-all', 'Lesson 2') },
  { kind: 'ponder', number: 2, topic: 'Instruments and their vibrating parts', sections: ['10.1.1'], lessonIds: ['ps-l2'], summary: 'List musical instruments and the part of each that vibrates.', parts: one('pp2-all', 'Lesson 2') },
  { kind: 'ponder', number: 3, topic: 'Assertion and reason: the bell in a jar', sections: ['10.2.1'], lessonIds: ['ps-l3'], summary: 'Assertion-reason question on the bell that cannot be heard once the air is pumped out.', parts: one('pp3-all', 'Lesson 3') },
  { kind: 'ponder', number: 4, topic: 'Assertion and reason: what moves in a sound wave', sections: ['10.3'], lessonIds: ['ps-l4'], summary: 'Assertion-reason question on compressions and rarefactions moving while the particles stay.', parts: one('pp4-all', 'Lesson 4') },
  { kind: 'ponder', number: 5, topic: 'What reaches the ear', sections: ['10.4'], lessonIds: ['ps-l5'], summary: 'Choose what actually reaches your ear when sound travels from a tuning fork.', parts: one('pp5-all', 'Lesson 5') },
  { kind: 'ponder', number: 6, topic: 'Labelling and drawing from density pictures', sections: ['10.5'], lessonIds: ['ps-l6'], summary: 'Label compressions and rarefactions on two density pictures and draw the matching graphs.', parts: one('pp6-all', 'Lesson 6') },
  { kind: 'ponder', number: 7, topic: 'Thick and thin rubber band', sections: ['10.6.1'], lessonIds: ['ps-l7'], summary: 'Compare the frequency and time period of a thin and a thick rubber band.', parts: one('pp7-all', MS2) },
  { kind: 'ponder', number: 8, topic: 'Oscillations per minute of a piston', sections: ['10.6.1'], lessonIds: ['ps-l7'], summary: 'Find how many oscillations a piston of given frequency completes in a minute.', parts: one('pp8-all', MS2) },
  { kind: 'ponder', number: 9, topic: 'Half the wavelength from a graph', sections: ['10.6.1'], lessonIds: ['ps-l7'], summary: 'Read half the wavelength from a graph with a marked distance axis.', parts: one('pp9-all', MS2) },
  { kind: 'ponder', number: 10, topic: 'Ratios of speeds from a table', sections: ['10.6.3'], lessonIds: ['ps-l9'], summary: 'Compare the speeds of sound in air, water and steel as ratios.', parts: one('pp10-all', MS2) },
  { kind: 'ponder', number: 11, topic: 'Two sounds along a steel fence', sections: ['10.6.3'], lessonIds: ['ps-l9'], summary: 'Find the time difference between sound arriving through steel and through air, and say whether it can be told apart.', parts: one('pp11-all', MS2) },
  { kind: 'ponder', number: 12, topic: 'Minimum distance for a given echo gap', sections: ['10.7.1'], lessonIds: ['ps-l11'], summary: 'Find the least distance of a reflecting surface for a given echo delay.', parts: one('pp12-all', MS3) },
  { kind: 'ponder', number: 13, topic: 'Depth of the ocean from a sonar signal', sections: ['10.8.1'], lessonIds: ['ps-l12'], summary: 'Find the depth of the ocean from the return time of a sonar signal.', parts: one('pp13-all', MS3) },
];


export const exercisesOnly = () => SOUND_EXERCISES.filter((e) => e.kind === 'exercise');
export const pondersOnly = () => SOUND_EXERCISES.filter((e) => e.kind === 'ponder');
export const exerciseSolved = (e: SoundExercise): boolean => e.parts.every((p) => p.status === 'solved');
export const solvedExerciseNumbers = (): number[] => exercisesOnly().filter(exerciseSolved).map((e) => e.number);
export const solvedPonderNumbers = (): number[] => pondersOnly().filter(exerciseSolved).map((e) => e.number);
export const soundExerciseCounts = () => {
  const ex = exercisesOnly();
  return {
    exercises: ex.length,
    exerciseParts: ex.reduce((n, e) => n + e.parts.length, 0),
    exercisesSolved: ex.filter(exerciseSolved).length,
    ponders: pondersOnly().length,
    pondersSolved: pondersOnly().filter(exerciseSolved).length,
  };
};
