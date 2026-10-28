/**
 * Class 9 Chemistry, Chapter 8 "Journey Inside the Atom": original Learn content. Aligned to NCERT Class 9 Science, Exploration
 * (2026-27), Chapter 8, Sections 8.1 to 8.9.2, checked against the chapter PDF (`iesc108.pdf`). Explanations and questions are
 * original; element data are standard facts.
 */

import type { EduChapter } from '../../../education/types';
import { A1, A2, A3 } from './lessonsA';
import { A4, A5, A6, A7, A8 } from './lessonsB';
import { ATOM_ASSESSMENT, ATOM_PRACTICE } from './practice';
import { CA_PREREQUISITES, CA_UNITS } from './prerequisites';

const LESSON_LIST = [A1, A2, A3, A4, A5, A6, A7, A8];

export const ATOM_CHAPTER: EduChapter = {
  id: 'atom',
  title: 'Journey Inside the Atom',
  classGrade: 9,
  subject: 'chemistry',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 8, Sections 8.1 to 8.9.2 (early ideas and Dalton, the electron and Thomson’s model, the gold foil experiment and Rutherford’s model, Bohr’s model, the neutron, symbols, atomic and mass number, electronic configuration, valency, isotopes, average atomic mass and isobars), checked against the chapter PDF.',
  purpose: 'Is the atom really the smallest thing? This chapter follows the experiments that opened it up, finds the particles inside, arranges the electrons in shells, and uses that arrangement to explain how atoms combine.',
  learn: ['How each atomic model answered the evidence of its time', 'Protons, neutrons and electrons, Z and A', 'Element symbols and atomic notation', 'Electronic configuration of the first twenty elements', 'Valency', 'Isotopes, average atomic mass and isobars'],
  realWorld: ['Electron microscopes that image atoms', 'Nuclear power from uranium-235', 'Cobalt-60 cancer treatment', 'Carbon-14 dating'],
  outcomes: ['Explain how evidence changed atomic models', 'Find particle numbers from Z and A', 'Write configurations and valencies', 'Identify isotopes and isobars and calculate average atomic mass'],
  prerequisiteIds: ['cap-particles', 'cap-charge', 'cap-powers'],
  units: CA_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(CA_PREREQUISITES.map((p) => [p.id, p])),
  practice: ATOM_PRACTICE,
  assessment: ATOM_ASSESSMENT,
  routes: {
    landing: '/chemistry/atom',
    learn: (id) => `/chemistry/atom/learn/${id}`,
    prerequisites: (id) => `/chemistry/atom#${id}`,
    lab: '/chemistry/atom/lab',
    practice: '/chemistry/atom/practice',
    assessment: '/chemistry/atom/assessment',
  },
};
