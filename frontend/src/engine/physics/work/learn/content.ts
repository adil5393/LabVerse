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
import { W8, W9, W10 } from './lessonsMachines';
import { PW_PREREQUISITES, PW_UNITS } from './prerequisites';
import { WORK_ASSESSMENT } from './assessment';

const LESSON_LIST = [W1, W2, W3, W4, W5, W6, W7, W8, W9, W10];

export const WORK_CHAPTER: EduChapter = {
  id: 'work',
  title: 'Work, Energy, and Simple Machines',
  classGrade: 9,
  subject: 'physics',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 7, Sections 7.1 to 7.6 (work, energy, kinetic and potential energy, conservation of mechanical energy, power, and the simple machines: pulley, inclined plane and lever). The end-of-chapter questions are on the NCERT Exercises page. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'In earlier chapters you used forces and kinematics to analyse motion. This chapter introduces a more powerful idea: work and energy. It asks when a force really does work, how work changes energy, why kinetic energy is one half the mass times the speed squared, how energy is stored by height, why mechanical energy is conserved, how fast work is done (power) and how simple machines make tasks easier without reducing the work.',
  learn: ['How work in physics differs from the everyday word; zero, positive and negative work', 'Energy, the work-energy theorem and the forms of energy', 'Kinetic energy K = ½mv² and potential energy U = mgh, with their derivations', 'Conservation of mechanical energy, and where the energy goes with friction', 'Power P = W ÷ t', 'The pulley, the inclined plane and the lever: effort, load and mechanical advantage'],
  realWorld: ['Lifting a bag to a shelf', 'A braking car or trolley', 'A child on a slide', 'A pendulum or a ball roller coaster', 'Running up stairs', 'A wheelbarrow, scissors and a seesaw'],
  outcomes: ['Say when a force does work and calculate it', 'Use work = change in energy', 'Calculate and compare kinetic and potential energies', 'Use conservation of energy, with and without friction', 'Calculate power', 'Find the mechanical advantage of a pulley, a ramp and a lever, and explain why machines do not reduce the work'],
  prerequisiteIds: ['pwp-force', 'pwp-displacement', 'pwp-velocity', 'pwp-weight', 'pwp-units', 'pwp-graph', 'pwp-eqmotion', 'pwp-algebra'],
  units: PW_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PW_PREREQUISITES.map((p) => [p.id, p])),
  assessment: WORK_ASSESSMENT,
  routes: {
    landing: '/physics/work',
    learn: (id) => `/physics/work/learn/${id}`,
    prerequisites: (id) => `/physics/work#${id}`,
    assessment: '/physics/work/assessment',
    lab: '/physics/work/lab',
    practice: '/physics/work/practice',
  },
};
