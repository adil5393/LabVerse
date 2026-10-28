/**
 * Class 9 Physics, Chapter 10 "Sound Waves: Characteristics and Applications": original Learn content (SND-1, Lessons 1 to 6).
 * Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 10, Sections 10.1 to 10.5, checked against the chapter PDF
 * (`iesc110.pdf`). Explanations, figures and questions are original. Lessons 7 to 12 are planned and are NOT part of this
 * object: a lesson appears here only when its text, laboratory and tests all exist.
 */

import type { EduChapter } from '../../../education/types';
import { S1, S2, S3 } from './lessonsSource';
import { S4, S5, S6 } from './lessonsWave';
import { S7, S8, S9, S10 } from './lessonsCharacter';
import { S11, S12 } from './lessonsReflection';
import { SOUND_ASSESSMENT, SOUND_PRACTICE } from './practice';
import { PS_PREREQUISITES, PS_UNITS } from './prerequisites';

const LESSON_LIST = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12];

export const SOUND_CHAPTER: EduChapter = {
  id: 'sound',
  title: 'Sound Waves: Characteristics and Applications',
  classGrade: 9,
  subject: 'physics',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 10, Sections 10.1 to 10.8 (production and propagation of sound, sound waves and their energy and graph, wavelength, frequency, time period, amplitude, speed, pitch and loudness, echo and reverberation, ultrasound, infrasound and SONAR), checked against the chapter PDF.',
  purpose: 'Sound is part of everyday life, yet it is easy to hear and hard to picture. This chapter asks what a sound is, how it is made, how it travels to your ear, and how a sound wave can be drawn. The first lessons show that every sound starts with a vibration, that it needs a material to travel through, and that it travels as a pattern of crowding and spreading out (compressions and rarefactions) that carries energy without carrying the air along.',
  learn: ['Why every sound starts with a vibration, and what a tuning fork shows', 'Why sound needs a medium and cannot cross a vacuum', 'How a sound wave is made of compressions and rarefactions', 'Why the particles stay while the wave moves on, and why sound carries energy', 'How a sound wave is drawn as a graph of density against distance'],
  realWorld: ['A tuning fork and a plucked string', 'Drums, flutes and the voice', 'Astronauts who cannot talk in space', 'A microphone and a loudspeaker'],
  outcomes: ['Explain that sound is produced by vibrations', 'Say what a sound needs to travel and why not in a vacuum', 'Describe compressions and rarefactions and a longitudinal wave', 'Explain that a sound wave carries energy, not matter', 'Read and draw the graph of a sound wave'],
  prerequisiteIds: ['psp-tofro', 'psp-particles', 'psp-graph'],
  units: PS_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PS_PREREQUISITES.map((p) => [p.id, p])),
  practice: SOUND_PRACTICE,
  assessment: SOUND_ASSESSMENT,
  routes: {
    landing: '/physics/sound',
    learn: (id) => `/physics/sound/learn/${id}`,
    prerequisites: (id) => `/physics/sound#${id}`,
    lab: '/physics/sound/vibration',
    practice: '/physics/sound/practice',
    assessment: '/physics/sound/assessment',
  },
};
