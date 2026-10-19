/**
 * Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines": original Learn content (PHY-3A).
 * Aligned to NCERT Class 9 Science, Exploration (2026-27), Section 7.1, checked against the chapter PDF.
 * Explanations, figures and questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { W1, W2 } from './lessons';
import { W3 } from './lessonsSign';
import { W4, W5 } from './lessonsEnergy';
import { W6, W7 } from './lessonsPotential';
import { PW_PREREQUISITES, PW_UNITS } from './prerequisites';

const LESSON_LIST = [W1, W2, W3, W4, W5, W6, W7];

export const WORK_CHAPTER: EduChapter = {
  id: 'work',
  title: 'Work, Energy, and Simple Machines',
  classGrade: 9,
  subject: 'physics',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 7, Sections 7.1 to 7.4.3 (work, the work-energy theorem, forms of energy, kinetic and potential energy and conservation of mechanical energy). Power and simple machines are upcoming. The end-of-chapter questions are on the NCERT Exercises page. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'In earlier chapters you used forces and kinematics to analyse motion. This chapter introduces a more powerful idea: work and energy. So far it asks when a force really does work, how work changes the energy of an object, why the energy of motion is one half the mass times the speed squared, how energy is stored by height, and why the mechanical energy stays constant when only gravity does work.',
  learn: ['How work in physics differs from the everyday word; zero, positive and negative work', 'Energy, the work-energy theorem and the forms of energy', 'Kinetic energy K = ½mv² and potential energy U = mgh, with their derivations', 'Conservation of mechanical energy, and where the energy goes with friction'],
  realWorld: ['Lifting a bag to a shelf', 'A braking car or trolley', 'A child on a slide', 'A pendulum or a ball roller coaster', 'A coconut falling onto sand'],
  outcomes: ['Say when a force does work and calculate it', 'Use work = change in energy', 'Calculate and compare kinetic and potential energies', 'Use conservation of energy to find a speed or a height, with and without friction'],
  prerequisiteIds: ['pwp-force', 'pwp-displacement', 'pwp-velocity', 'pwp-weight', 'pwp-units', 'pwp-graph', 'pwp-eqmotion', 'pwp-algebra'],
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
