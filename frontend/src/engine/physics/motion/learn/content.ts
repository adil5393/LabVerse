/**
 * Class 9 Physics, Chapter 4 "Describing Motion Around Us": original Learn content (PHY-1A).
 * Aligned to NCERT Class 9 Science, Exploration (2026-27), Sections 4.1.1 and 4.1.2, checked against
 * the chapter PDF. Explanations, figures and questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { L1, L2, L3 } from './lessons';
import { PM_PREREQUISITES, PM_UNITS } from './prerequisites';

const LESSON_LIST = [L1, L2, L3];

export const MOTION_CHAPTER: EduChapter = {
  id: 'motion',
  title: 'Describing Motion Around Us',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 4, Sections 4.1.1 and 4.1.2. Speed, velocity, acceleration, graphs, the kinematic equations and uniform circular motion (4.1.3 to 4.4.1) are not yet covered here. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'Everything around us moves. To study motion scientists first describe it in its simplest form, motion along a straight line. This opening unit shows how to say where an object is, how far it travelled, and how its position changed.',
  learn: ['Position and the reference point', 'Distance travelled as path length', 'Displacement as the net change in position', 'Why distance and displacement are different'],
  realWorld: ['Athletes on a straight track', 'A car on a highway', 'A lift moving between floors', 'A delivery trip that ends where it started'],
  outcomes: ['Describe a position with a reference point and direction', 'Find distance and displacement for a path', 'Explain when displacement is zero', 'Say when distance and displacement are equal'],
  prerequisiteIds: ['pmp-units', 'pmp-signed', 'pmp-line'],
  units: PM_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PM_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/physics/motion',
    learn: (id) => `/physics/motion/learn/${id}`,
    prerequisites: (id) => `/physics/motion#${id}`,
    lab: '/physics/motion/lab',
  },
};
