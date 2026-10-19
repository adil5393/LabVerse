/**
 * How Quantities Combine: Understanding Data, Class 9: original Learn lessons (EDU-1M6).
 *
 * Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 10 (checked against the
 * chapter PDF): 10.1 Combining Things (10.1.1 average of averages, 10.1.2 mixtures,
 * 10.1.3 custom weights) and 10.2 Visualising and Interpreting Data (10.2.1 stacking
 * columns, 10.2.2 an alternative to the pie chart). The chapter does not teach median,
 * mode or histograms, so these lessons do not either. Wording, figures and numbers are
 * original. The mixture assumption that volumes add is marked as a simplification.
 */

import type { EduChapter } from '../../../education/types';
import { L1, L2, L3 } from './lessonsA';
import { L4, L5, L6 } from './lessonsB';
import { UD_PREREQUISITES, UD_UNITS } from './prerequisites';

const LESSON_LIST = [L1, L2, L3, L4, L5, L6];

export const UNDERSTANDING_DATA_CHAPTER: EduChapter = {
  id: 'understanding-data',
  title: 'Understanding Data: How Quantities Combine',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 10: Sections 10.1.1 to 10.1.3 and 10.2.1 to 10.2.2. Median, mode and histograms are not in this chapter and are not taught here. Explanations, figures and numbers are original; none are copied from the textbook.',
  purpose: 'Data rarely arrives as one tidy group. This chapter shows how to combine groups fairly with a weighted average, how a mixture is a weighted average, and how to choose and read charts that show amounts or shares without being misled.',
  learn: ['Why the average of averages misleads', 'Weighted means and mixtures', 'Clustered, stacked and 100% stacked charts and pie charts', 'What an average and a share chart can and cannot show'],
  realWorld: ['Combining class or team averages', 'Final marks with different weights', 'Strength of mixtures and solutions', 'Reading budgets and sales charts'],
  outcomes: ['Combine group averages using sizes', 'Compute weighted means and mixture strengths', 'Choose between clustered, stacked and share charts', 'Say what a chart does and does not prove'],
  prerequisiteIds: ['up-average', 'up-percent', 'up-reading'],
  units: UD_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(UD_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/understanding-data',
    learn: (id) => `/mathematics/understanding-data/learn/${id}`,
    prerequisites: (id) => `/mathematics/understanding-data#${id}`,
    lab: '/mathematics/understanding-data/workbench',
    practice: '/mathematics/understanding-data/workbench?mode=practice',
  },
};
