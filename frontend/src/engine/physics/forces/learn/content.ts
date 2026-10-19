/**
 * Class 9 Physics, Chapter 6 "How Forces Affect Motion": original Learn content (PHY-2A).
 * Aligned to NCERT Class 9 Science, Exploration (2026-27), Sections 6.1 to 6.3, checked against the chapter PDF.
 * Explanations, figures and questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { F1, F2, F3 } from './lessons';
import { F4, F5 } from './lessonsFirstLaw';
import { F6, F7 } from './lessonsSecondLaw';
import { PF_PREREQUISITES, PF_UNITS } from './prerequisites';

const LESSON_LIST = [F1, F2, F3, F4, F5, F6, F7];

export const FORCES_CHAPTER: EduChapter = {
  id: 'forces',
  title: 'How Forces Affect Motion',
  classGrade: 9,
  subject: 'physics',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 6, Sections 6.1 to 6.5 (force, balanced and unbalanced forces, friction, Newton\'s first law and inertia, Newton\'s second law and momentum). Newton\'s third law and forces on a system (6.6 and 6.7) are upcoming and not yet covered. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'In Chapter 4 you described motion. Now you ask what causes a change of motion. This opening part shows what a force is, how forces combine into a net force, why balanced forces do not change velocity while unbalanced forces do, and how friction fits in.',
  learn: ['What a force is, and how it is measured', 'Adding forces on a line to find the net force', 'Balanced and unbalanced forces and the direction of acceleration', 'Friction: what decides its direction, why objects slow down, and why a gentle push may not move a box', "Newton's first law: rest, constant velocity and inertia"],
  realWorld: ['A tug of war', 'Pushing a heavy box across the floor', 'A cart rolling on ice and on rough ground', 'The grip of a tyre on the road', 'A bus braking suddenly'],
  outcomes: ['Describe a force by its size, unit and direction', 'Find the net force of forces on a line', 'Explain why balanced forces do not change velocity', 'Explain friction and its effects', 'State the first law and explain inertia'],
  prerequisiteIds: ['pfp-motion', 'pfp-direction', 'pfp-mass', 'pfp-arrows', 'pfp-xt', 'pfp-prop'],
  units: PF_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PF_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/physics/forces',
    learn: (id) => `/physics/forces/learn/${id}`,
    prerequisites: (id) => `/physics/forces#${id}`,
    lab: '/physics/forces/lab',
  },
};
