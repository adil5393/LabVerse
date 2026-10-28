/**
 * Class 9 Physics, Chapter 10 "Sound Waves: Characteristics and Applications": curriculum map (SND-1).
 *
 * Source: NCERT Class 9 Science, Exploration (2026-27), Chapter 10, official PDF
 * https://ncert.nic.in/textbook/pdf/iesc110.pdf (24 pages, read in full for SND-0). Section, activity, example, equation, table,
 * figure, Pause-and-Ponder and exercise numbers are the chapter's own. LabVerse text, figures and questions are original; rows
 * marked 'enrichment' are not in the book.
 *
 * Status: 'learn' (a Learn lesson teaches it), 'laboratory' (an interactive laboratory only), or 'planned' (NOT built: shown as
 * Upcoming, never as complete). A topic is `learn` only when the lesson text, the interactive element it needs and its tests all
 * exist.
 */

export type SoundMapKind = 'textbook' | 'enrichment';
export type SoundMapStatus = 'learn' | 'laboratory' | 'planned';

export interface SoundMapRow {
  id: string;
  section: string;
  topic: string;
  kind: SoundMapKind;
  status: SoundMapStatus;
  lessonIds: string[];
  /** The planned milestone that will cover it. */
  milestone?: string;
  note?: string;
}

export const SOUND_CHAPTER_ID = 'sound';
export const SOUND_TEXTBOOK = {
  title: 'Sound Waves: Characteristics and Applications',
  chapterNumber: 10,
  book: 'NCERT Class 9 Science: Exploration',
  edition: '2026-27',
  pdf: 'https://ncert.nic.in/textbook/pdf/iesc110.pdf',
} as const;

export const SOUND_MAP: SoundMapRow[] = [
  { id: 's-produce', section: '10.1', topic: 'Production of sound: Activity 10.1 (rubber band on a box), vibration, the source, vocal cords (Fig. 10.3), crickets and grasshoppers', kind: 'textbook', status: 'learn', lessonIds: ['ps-l1'], note: 'The Vibration Laboratory models the plucked band.' },
  { id: 's-fork', section: '10.1.1', topic: 'Tuning fork: Activity 10.2 (Fig. 10.4 a to c), prongs, waves on water; Pause and Ponder 1 and 2 (open-ended)', kind: 'textbook', status: 'learn', lessonIds: ['ps-l2'], note: 'Pause and Ponder 1 and 2 are reflection prompts with suggested answers, never scored.' },
  { id: 's-medium', section: '10.2', topic: 'Propagation of sound: Activities 10.3 (desk) and 10.4 (spoons in water), medium, vacuum (Figs. 10.5, 10.6)', kind: 'textbook', status: 'learn', lessonIds: ['ps-l3'] },
  { id: 's-belljar', section: '10.2.1', topic: 'Sound needs a medium: the bell jar (Fig. 10.7), astronauts in space; Pause and Ponder 3', kind: 'textbook', status: 'learn', lessonIds: ['ps-l3'], note: 'The bell jar is an idealised model (sound heard outside falls as air is removed and is zero in a near vacuum).' },
  { id: 's-wave', section: '10.3', topic: 'Sound waves: Activity 10.5 (slinky, Fig. 10.8), piston and tube (Fig. 10.9), compression, rarefaction, longitudinal waves (Figs. 10.12, 10.13), mechanical waves; Pause and Ponder 4', kind: 'textbook', status: 'learn', lessonIds: ['ps-l4'], note: 'The Wave Laboratory marks one particle and follows one compression.' },
  { id: 's-wave-extra', section: '10.3 (side notes)', topic: 'Spherical waves (Fig. 10.10), sonic boom (Fig. 10.11), seismic waves (Next Level Up), light needs no medium', kind: 'textbook', status: 'learn', lessonIds: ['ps-l4'], note: 'Light and transverse waves are mentioned in one paragraph of Lesson 4; spherical waves and the sonic boom are not taught.' },
  { id: 's-energy', section: '10.4', topic: 'Energy of sound waves: Activity 10.6 (grains on a sheet, Fig. 10.14); microphone and speaker (Fig. 10.15, Bridging Science and Society); Pause and Ponder 5', kind: 'textbook', status: 'learn', lessonIds: ['ps-l5'] },
  { id: 's-graph', section: '10.5', topic: 'Graphical representation of a sound wave (Fig. 10.16), crest and trough, average density; Pause and Ponder 6 (Fig. 10.17)', kind: 'textbook', status: 'learn', lessonIds: ['ps-l6'], note: 'Density against time at a point (Ready to Go Beyond) is shown in the Wave Laboratory only.' },
  { id: 's-lab-vib', section: 'enrichment', topic: 'Vibration Laboratory: a plucked band and a struck fork, frequency, period, cycles, a decaying vibration, and a sound that exists exactly while the object vibrates', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 's-lab-wave', section: 'enrichment', topic: 'Wave Laboratory: a longitudinal wave with a marked particle, a followed compression, a density graph against distance and against time, frequency and amplitude controls, slow motion', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 's-ex', section: 'Revise, Reflect, Refine', topic: 'Exercises 1, 2, 3 and 8, and Pause and Ponder 1 to 6, solved step by step', kind: 'textbook', status: 'learn', lessonIds: [], note: 'See the NCERT Exercises page: it lists all 15 questions and 13 Pause and Ponder items with their parts.' },
  { id: 's-ex-rest', section: 'Revise, Reflect, Refine', topic: 'Exercises 4 to 7 and 9 to 15, and Pause and Ponder 7 to 13, solved step by step', kind: 'textbook', status: 'learn', lessonIds: [], note: 'See the NCERT Exercises page. Exercise 7 (drawing) is solved as a described drawing.' },
  { id: 's-freq', section: '10.6.1', topic: 'Wavelength, frequency and time period; Eq. 10.1 (T ν = 1); Activity 10.7; Example 10.1; Pause and Ponder 7 to 9', kind: 'textbook', status: 'learn', lessonIds: ['ps-l7'] },
  { id: 's-amp', section: '10.6.2', topic: 'Amplitude and intensity (Figs. 10.20, 10.21)', kind: 'textbook', status: 'learn', lessonIds: ['ps-l8'] },
  { id: 's-speed', section: '10.6.3', topic: 'Speed of sound; Eq. 10.2 (v = ν λ); Examples 10.2 to 10.4; Table 10.1; Pause and Ponder 10 and 11', kind: 'textbook', status: 'learn', lessonIds: ['ps-l9'] },
  { id: 's-pitch', section: '10.6.4', topic: 'Human perception: pitch, loudness, audible range, Activity 10.8, musical notes and timbre', kind: 'textbook', status: 'learn', lessonIds: ['ps-l10'] },
  { id: 's-echo', section: '10.7, 10.7.1, 10.7.2', topic: 'Reflection of sound, echo, reverberation; Example 10.5; Pause and Ponder 12', kind: 'textbook', status: 'learn', lessonIds: ['ps-l11'] },
  { id: 's-sonar', section: '10.8, 10.8.1', topic: 'Ultrasonic and infrasonic waves, echolocation and SONAR; Example 10.6; Pause and Ponder 13', kind: 'textbook', status: 'learn', lessonIds: ['ps-l12'] },
  { id: 's-quest', section: 'The Quest Continues; The Journey Beyond', topic: 'Closing activities and the sound-exploration paragraph', kind: 'textbook', status: 'planned', lessonIds: [], milestone: 'later' },
  { id: 's-pre', section: 'enrichment', topic: 'Prerequisite refreshers: to-and-fro motion, matter as particles, reading a graph with an average line', kind: 'enrichment', status: 'learn', lessonIds: ['ps-l1', 'ps-l2', 'ps-l3', 'ps-l4', 'ps-l5', 'ps-l6'] },
];

export const soundCoverageCounts = () => ({
  total: SOUND_MAP.length,
  available: SOUND_MAP.filter((r) => r.status !== 'planned').length,
  planned: SOUND_MAP.filter((r) => r.status === 'planned').length,
});

/** The complete five-unit, twelve-lesson syllabus (approved), with what exists today (all twelve lessons, SND-1 to SND-3). */
export interface SyllabusLesson { id: string; number: number; unit: number; title: string; status: 'available' | 'planned'; milestone?: string; sections: string }
export const SOUND_SYLLABUS: SyllabusLesson[] = [
  { id: 'ps-l1', number: 1, unit: 1, title: 'Sound comes from vibration', status: 'available', sections: '10.1' },
  { id: 'ps-l2', number: 2, unit: 1, title: 'The tuning fork and other sources', status: 'available', sections: '10.1.1' },
  { id: 'ps-l3', number: 3, unit: 1, title: 'Sound needs a medium', status: 'available', sections: '10.2, 10.2.1' },
  { id: 'ps-l4', number: 4, unit: 2, title: 'Compressions and rarefactions', status: 'available', sections: '10.3' },
  { id: 'ps-l5', number: 5, unit: 2, title: 'Sound carries energy', status: 'available', sections: '10.4' },
  { id: 'ps-l6', number: 6, unit: 2, title: 'Drawing a sound wave', status: 'available', sections: '10.5' },
  { id: 'ps-l7', number: 7, unit: 3, title: 'Wavelength, frequency and time period', status: 'available', sections: '10.6.1' },
  { id: 'ps-l8', number: 8, unit: 3, title: 'Amplitude and intensity', status: 'available', sections: '10.6.2' },
  { id: 'ps-l9', number: 9, unit: 3, title: 'Speed of sound', status: 'available', sections: '10.6.3' },
  { id: 'ps-l10', number: 10, unit: 3, title: 'Pitch, loudness and hearing', status: 'available', sections: '10.6.4' },
  { id: 'ps-l11', number: 11, unit: 4, title: 'Echo and reverberation', status: 'available', sections: '10.7' },
  { id: 'ps-l12', number: 12, unit: 5, title: 'Ultrasound, infrasound and SONAR', status: 'available', sections: '10.8' },
];

export const SOUND_UNIT_TITLES: Record<number, string> = { 1: 'Making and carrying sound', 2: 'Sound as a wave', 3: 'What describes a sound', 4: 'Reflection', 5: 'Beyond hearing' };

/** Textbook inventory kept for the coverage audit (verified in SND-0). */
export const SOUND_TEXTBOOK_INVENTORY = {
  sections: ['10.1', '10.1.1', '10.2', '10.2.1', '10.3', '10.4', '10.5', '10.6', '10.6.1', '10.6.2', '10.6.3', '10.6.4', '10.7', '10.7.1', '10.7.2', '10.8', '10.8.1'],
  activities: ['10.1', '10.2', '10.3', '10.4', '10.5', '10.6', '10.7', '10.8'],
  examples: ['10.1', '10.2', '10.3', '10.4', '10.5', '10.6'],
  pausePonder: 13,
  exercises: 15,
  figures: 34,
} as const;

/** What SND-1 covers of the inventory. */
export const SND3_COVERS = {
  sections: ['10.1', '10.1.1', '10.2', '10.2.1', '10.3', '10.4', '10.5', '10.6', '10.6.1', '10.6.2', '10.6.3', '10.6.4', '10.7', '10.7.1', '10.7.2', '10.8', '10.8.1'],
  pausePonder: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
  exercises: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
} as const;

export const SND1_COVERS = {
  sections: ['10.1', '10.1.1', '10.2', '10.2.1', '10.3', '10.4', '10.5'],
  activities: ['10.1', '10.2', '10.3', '10.4', '10.5', '10.6'],
  pausePonder: [1, 2, 3, 4, 5, 6],
  exercises: [1, 2, 3, 8],
} as const;
