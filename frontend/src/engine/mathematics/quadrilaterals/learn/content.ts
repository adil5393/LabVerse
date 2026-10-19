/**
 * Quadrilaterals, Class 9: original Learn lessons (EDU-1Q).
 *
 * Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 12 (checked against
 * the chapter PDF). The chapter has four sections: 12.1 What exactly is a
 * quadrilateral, 12.2 Parallelograms (Theorems 1 to 5), 12.3 Applications of
 * parallelograms (12.3.1 Theorems 6 and 7; 12.3.2 Theorems 8 and 9) and
 * 12.4 Tiling the plane. Wording, figures and questions here are original.
 * What goes beyond the chapter is marked "extension" in the lesson: the
 * shape of the Varignon parallelogram for special diagonals, and the
 * half-turn pairing used to draw the tiling.
 */

import type { EduChapter } from '../../../education/types';
import { L1, L2, L3 } from './lessonsA';
import { L4, L5, L6, L7, L8 } from './lessonsB';
import { QUAD_PREREQUISITES, QUAD_UNITS } from './prerequisites';

const LESSON_LIST = [L1, L2, L3, L4, L5, L6, L7, L8];

export const QUADRILATERALS_CHAPTER: EduChapter = {
  id: 'quadrilaterals',
  title: 'Quadrilaterals',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 12: Sections 12.1 to 12.4 and Theorems 1 to 9. Explanations, figures and questions are original; none are copied from the textbook. Material beyond the chapter is marked "extension" in its lesson.',
  purpose: 'A quadrilateral is the simplest shape that is not rigid, and its special case, the parallelogram, shows up everywhere. This chapter teaches you what a quadrilateral is, how to tell a parallelogram from look-alikes, and how the Midpoint Theorem turns a triangle into a tool.',
  learn: ['What counts as a quadrilateral, and convex versus non-convex', 'The properties of a parallelogram and the tests for one', 'The Midpoint Theorem and its converse', 'Medians, the centroid and the midpoint parallelogram', 'Why any quadrilateral tiles the plane'],
  realWorld: ['Linkages and pantographs that copy drawings', 'Floor and wall tiling', 'Frames and trusses', 'Finding the balance point of a triangular plate'],
  outcomes: ['Classify four-sided figures and find missing angles', 'Use the parallelogram properties and tests, and know which look-alike conditions fail', 'Apply the Midpoint and Centroid Theorems', 'Follow a proof built from parallelograms'],
  prerequisiteIds: ['qp-angles', 'qp-parallel-lines', 'qp-congruence', 'qp-if-then'],
  units: QUAD_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(QUAD_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/quadrilaterals',
    learn: (id) => `/mathematics/quadrilaterals/learn/${id}`,
    prerequisites: (id) => `/mathematics/quadrilaterals#${id}`,
    lab: '/mathematics/quadrilaterals/workbench',
    practice: '/mathematics/quadrilaterals/workbench?mode=practice',
  },
};
