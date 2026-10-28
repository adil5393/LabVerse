/**
 * Class 9 Chemistry, Chapter 5 "Exploring Mixtures and their Separation": original Learn content. Aligned to NCERT Class 9
 * Science, Exploration (2026-27), Chapter 5, Sections 5.1 to 5.5, checked against the chapter PDF (`iesc105.pdf`).
 * Explanations, figures and questions are original; the solubility and boiling-point values are the book's data tables.
 */

import type { EduChapter } from '../../../education/types';
import { M1, M2, M3, M4 } from './lessonsA';
import { M5, M6, M7, M8, M9 } from './lessonsB';
import { MIX_ASSESSMENT, MIX_PRACTICE } from './practice';
import { CM_PREREQUISITES, CM_UNITS } from './prerequisites';

const LESSON_LIST = [M1, M2, M3, M4, M5, M6, M7, M8, M9];

export const MIXTURES_CHAPTER: EduChapter = {
  id: 'mixtures',
  title: 'Exploring Mixtures and their Separation',
  classGrade: 9,
  subject: 'chemistry',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 5, Sections 5.1 to 5.5 (homogeneous and heterogeneous mixtures, concentration, solubility, crystallization, distillation, paper chromatography, immiscible liquids, sublimation, alloys, suspensions, centrifugation, coagulation, colloids and the Tyndall effect), checked against the chapter PDF. Explanations, figures and questions are original.',
  purpose: 'Sugar from sugarcane, clean drinking water, plasma for a blood bank and perfume from flowers all depend on separating mixtures. This chapter sorts mixtures by how uniform they are and by the size of their particles, measures how concentrated a solution is, and chooses a separation method from the properties of the parts.',
  learn: ['Homogeneous and heterogeneous mixtures', 'Concentration as % m/m, % m/v and % v/v', 'Solubility curves and crystallization', 'Distillation and paper chromatography', 'Separating funnels, sublimation, centrifugation and coagulation', 'Solutions, colloids, suspensions and the Tyndall effect'],
  realWorld: ['ORS and hospital saline', 'Salt pans by the sea', 'A petroleum refinery', 'Blood banks', 'Water treatment with alum', 'Sunbeams through leaves'],
  outcomes: ['Classify mixtures and justify the choice', 'Calculate and use concentrations', 'Use solubility data to predict crystallization', 'Choose and explain a separation method from properties', 'Explain the Tyndall effect from particle size'],
  prerequisiteIds: ['cmp-mixture', 'cmp-percent', 'cmp-graph', 'cmp-states'],
  units: CM_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(CM_PREREQUISITES.map((p) => [p.id, p])),
  practice: MIX_PRACTICE,
  assessment: MIX_ASSESSMENT,
  routes: {
    landing: '/chemistry/mixtures',
    learn: (id) => `/chemistry/mixtures/learn/${id}`,
    prerequisites: (id) => `/chemistry/mixtures#${id}`,
    lab: '/chemistry/mixtures/lab',
    practice: '/chemistry/mixtures/practice',
    assessment: '/chemistry/mixtures/assessment',
  },
};
