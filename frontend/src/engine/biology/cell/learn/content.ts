/**
 * Class 9 Biology, Chapter 2 "Cell: The Building Block of Life": original Learn content. Aligned to NCERT Class 9 Science,
 * Exploration (2026-27), Chapter 2, Sections 2.1 to 2.5.1, checked against the chapter PDF (`iesc102.pdf`). Explanations and
 * questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { C1, C2, C3 } from './lessonsA';
import { C4, C5, C6 } from './lessonsB';
import { CELL_ASSESSMENT, CELL_PRACTICE } from './practice';
import { BC_PREREQUISITES, BC_UNITS } from './prerequisites';

const LESSON_LIST = [C1, C2, C3, C4, C5, C6];

export const CELL_CHAPTER: EduChapter = {
  id: 'cell',
  title: 'Cell: The Building Block of Life',
  classGrade: 9,
  subject: 'biology',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 2, Sections 2.1 to 2.5.1 (studying cells with a microscope and estimating their size, the cell membrane and osmosis, the cell wall, prokaryotic and eukaryotic cells, the nucleus and organelles, cell division by mitosis and meiosis, the cell theory and controlled growth), checked against the chapter PDF.',
  purpose: 'How can something too small to see run every life process? This chapter looks at cells through a microscope, tests how their boundary controls water, opens up the organelles inside, and follows how one cell becomes two.',
  learn: ['How a microscope magnifies and how to estimate a cell’s size', 'The selectively permeable membrane and osmosis', 'Why plant cells have walls', 'Prokaryotic and eukaryotic cells', 'What each organelle does', 'Mitosis, meiosis and the cell theory'],
  realWorld: ['Why salted vegetables go limp', 'How roots take in water', 'Why fertilised eggs become trillions of cells', 'Why uncontrolled cell division causes tumours'],
  outcomes: ['Estimate cell sizes from a microscope field', 'Predict the effect of solutions on plant and animal cells', 'Match organelles to their functions', 'Compare mitosis and meiosis'],
  prerequisiteIds: ['bcp-living', 'bcp-lens', 'bcp-units', 'bcp-diffusion'],
  units: BC_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(BC_PREREQUISITES.map((p) => [p.id, p])),
  practice: CELL_PRACTICE,
  assessment: CELL_ASSESSMENT,
  routes: {
    landing: '/biology/cell',
    learn: (id) => `/biology/cell/learn/${id}`,
    prerequisites: (id) => `/biology/cell#${id}`,
    lab: '/biology/cell/lab',
    practice: '/biology/cell/practice',
    assessment: '/biology/cell/assessment',
  },
};
