/**
 * Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines": original Learn content (PHY-3A).
 * Aligned to NCERT Class 9 Science, Exploration (2026-27), Section 7.1, checked against the chapter PDF.
 * Explanations, figures and questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { W1, W2 } from './lessons';
import { W3 } from './lessonsSign';
import { PW_PREREQUISITES, PW_UNITS } from './prerequisites';

const LESSON_LIST = [W1, W2, W3];

export const WORK_CHAPTER: EduChapter = {
  id: 'work',
  title: 'Work, Energy, and Simple Machines',
  classGrade: 9,
  subject: 'physics',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 7, Section 7.1 (work done by a constant force, zero work, positive and negative work). Sections 7.2 to 7.6 (the work-energy theorem, energy, power and simple machines) are upcoming. The end-of-chapter questions are on the NCERT Exercises page. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'In earlier chapters you used forces and kinematics to analyse motion. This chapter introduces a more powerful idea: work. This first part asks when a force really does work in physics, how to calculate it, and why it can be positive, negative or zero.',
  learn: ['How work in physics differs from the everyday word', 'Work done by a constant force: W = F × s, in joules', 'When the work is zero: no displacement, no force, or a force at right angles to the motion', 'Positive and negative work, and why friction usually does negative work'],
  realWorld: ['Lifting a bag to a shelf', 'Carrying a box along a corridor', 'A goalkeeper stopping a ball', 'A box sliding to a stop on a rough floor', 'A weightlifter holding a barbell'],
  outcomes: ['Say when a force does work on an object', 'Calculate work in joules', 'Explain why a force can do zero work', 'Decide the sign of the work and calculate signed work'],
  prerequisiteIds: ['pwp-force', 'pwp-displacement', 'pwp-velocity', 'pwp-weight', 'pwp-units', 'pwp-graph'],
  units: PW_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PW_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/physics/work',
    learn: (id) => `/physics/work/learn/${id}`,
    prerequisites: (id) => `/physics/work#${id}`,
    lab: '/physics/work/lab',
  },
};
