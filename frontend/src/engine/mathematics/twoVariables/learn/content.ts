/**
 * Two Variables, One Line, Class 9: original Learn lessons (EDU-1M5).
 *
 * Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 13 (checked against
 * the chapter PDF): 13.1 Linear equations in two variables (13.1.1 standard
 * form), 13.2 Solution of a linear equation (13.2.1 algebraic meaning, 13.2.2
 * geometric visualisation), 13.3 Slope-intercept form (13.3.1, 13.3.2), and,
 * not covered by these lessons, 13.4 to 13.6 on pairs of equations. Wording,
 * figures and questions here are original.
 */

import type { EduChapter } from '../../../education/types';
import { L1, L2, L3 } from './lessonsA';
import { L4, L5, L6, L7 } from './lessonsB';
import { TV_PREREQUISITES, TV_UNITS } from './prerequisites';

const LESSON_LIST = [L1, L2, L3, L4, L5, L6, L7];

export const TWO_VARIABLES_CHAPTER: EduChapter = {
  id: 'two-variables',
  title: 'Linear Equations in Two Variables',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 13, Sections 13.1 to 13.3 (13.1.1, 13.2.1, 13.2.2, 13.3.1, 13.3.2). Pairs of equations (13.4 to 13.6) are covered by the existing guided laboratory lessons, not by these Learn lessons. Explanations, figures and questions are original; none are copied from the textbook.',
  purpose: 'Many situations involve two unknown amounts that together make a known total. One equation can describe them, it has many solutions, and those solutions lie on a straight line. This chapter connects an equation, its solutions, a table, and a graph.',
  learn: ['What an equation in two variables means', 'Solutions as ordered pairs', 'Tables, points and the graph', 'Which solutions make sense in a real problem', 'Slope and the form y = mx + d'],
  realWorld: ['Budgets split between two items', 'Distance covered at two speeds', 'Ticket and mixture problems', 'Reading how steep a road or a graph is'],
  outcomes: ['Write an equation for a situation', 'Test an ordered pair and find new solutions', 'Draw and read the graph of a linear equation', 'Compute and interpret a slope'],
  prerequisiteIds: ['tp-variables', 'tp-signed', 'tp-equations', 'tp-plane'],
  units: TV_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(TV_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/two-variables',
    learn: (id) => `/mathematics/two-variables/learn/${id}`,
    prerequisites: (id) => `/mathematics/two-variables#${id}`,
    lab: '/mathematics/two-variables/workbench',
    practice: '/mathematics/two-variables/workbench?mode=practice',
  },
};

