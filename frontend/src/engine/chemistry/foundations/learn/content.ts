/**
 * Class 9 Chemistry, Chapter 9 "Atomic Foundations of Matter": original Learn content. Aligned to NCERT Class 9 Science,
 * Exploration (2026-27), Chapter 9, Sections 9.1 to 9.8, checked against the chapter PDF (`iesc109.pdf`). Explanations and
 * questions are original; atomic masses and the ion table are standard data.
 */

import type { EduChapter } from '../../../education/types';
import { F1, F2, F3, F4, F5 } from './lessonsA';
import { F6, F7, F8 } from './lessonsB';
import { FOUND_ASSESSMENT, FOUND_PRACTICE } from './practice';
import { CF_PREREQUISITES, CF_UNITS } from './prerequisites';

const LESSON_LIST = [F1, F2, F3, F4, F5, F6, F7, F8];

export const FOUNDATIONS_CHAPTER: EduChapter = {
  id: 'atomic-foundations',
  title: 'Atomic Foundations of Matter',
  classGrade: 9,
  subject: 'chemistry',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 9, Sections 9.1 to 9.8 (conservation of mass, constant proportions, Dalton’s atomic theory, molecules, covalent and ionic bonds, naming, chemical formulae, properties of ionic and covalent compounds, molecular mass and formula unit mass), checked against the chapter PDF.',
  purpose: 'Why does a closed reaction keep its mass, and why is water always one part hydrogen to eight parts oxygen? This chapter answers with atoms: they rearrange but are never lost, they bond by sharing or transferring electrons, and their formulae and masses can be worked out.',
  learn: ['The laws of conservation of mass and constant proportions', 'Dalton’s atomic theory and molecules', 'Covalent and ionic bonds', 'Naming compounds and writing formulae', 'Properties of ionic and covalent compounds', 'Molecular and formula unit mass'],
  realWorld: ['A fizzing antacid in a sealed bottle', 'Table salt crystals', 'Carbon dioxide in soda', 'Fertiliser labels with formulae'],
  outcomes: ['Use the two laws to calculate masses', 'Explain bonding with electrons', 'Write and name formulae', 'Predict properties from bond type', 'Calculate formula masses'],
  prerequisiteIds: ['cfp-valency', 'cfp-change', 'cfp-ratio'],
  units: CF_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(CF_PREREQUISITES.map((p) => [p.id, p])),
  practice: FOUND_PRACTICE,
  assessment: FOUND_ASSESSMENT,
  routes: {
    landing: '/chemistry/atomic-foundations',
    learn: (id) => `/chemistry/atomic-foundations/learn/${id}`,
    prerequisites: (id) => `/chemistry/atomic-foundations#${id}`,
    lab: '/chemistry/atomic-foundations/lab',
    practice: '/chemistry/atomic-foundations/practice',
    assessment: '/chemistry/atomic-foundations/assessment',
  },
};
