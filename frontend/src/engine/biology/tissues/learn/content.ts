/**
 * Class 9 Biology, Chapter 3 "Tissues in Action": original Learn content. Aligned to NCERT Class 9 Science, Exploration
 * (2026-27), Chapter 3, Sections 3.1 to 3.6, checked against the chapter PDF (`iesc103.pdf`). Explanations and questions are
 * original.
 */

import type { EduChapter } from '../../../education/types';
import { T1, T2, T3 } from './lessonsA';
import { T4, T5, T6 } from './lessonsB';
import { TISSUES_ASSESSMENT, TISSUES_PRACTICE, TISSUES_SOLUTION_DIAGRAMS } from './practice';
import { withSolutionDiagrams } from '../../../education/builders';
import { BT_PREREQUISITES, BT_UNITS } from './prerequisites';

const LESSON_LIST = [T1, T2, T3, T4, T5, T6];

export const TISSUES_CHAPTER: EduChapter = {
  id: 'tissues',
  title: 'Tissues in Action',
  classGrade: 9,
  subject: 'biology',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 3, Sections 3.1 to 3.6 (why plant and animal tissues differ, apical, lateral and intercalary meristems, permanent tissues and tissue systems, epithelial, connective, muscular and nervous tissue, the musculoskeletal system, types of joints and the skeleton), checked against the chapter PDF.',
  purpose: 'How do cells team up to make a plant grow taller or a body move? This chapter follows plant growth from its meristems, opens a stem to see its tissues, and builds the body from four animal tissues up to working joints.',
  learn: ['Where plants grow and why cutting tips stops roots', 'Protective, supporting and conducting plant tissues', 'Five kinds of epithelium', 'Blood, bone, cartilage, tendons and ligaments', 'Three kinds of muscle and the neuron', 'Joints, the skeleton and movement'],
  realWorld: ['Why grass regrows after mowing', 'Reading tree rings for age and climate', 'Coconut fibre mats', 'Ligament and cartilage injuries in sport'],
  outcomes: ['Match meristems to kinds of growth', 'Relate tissue structure to function', 'Distinguish tendons, ligaments and cartilage', 'Classify joints by movement'],
  prerequisiteIds: ['btp-cells', 'btp-organisation', 'btp-transport'],
  units: BT_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(BT_PREREQUISITES.map((p) => [p.id, p])),
  practice: withSolutionDiagrams(TISSUES_PRACTICE, TISSUES_SOLUTION_DIAGRAMS),
  assessment: TISSUES_ASSESSMENT,
  routes: {
    landing: '/biology/tissues',
    learn: (id) => `/biology/tissues/learn/${id}`,
    prerequisites: (id) => `/biology/tissues#${id}`,
    lab: '/biology/tissues/lab',
    practice: '/biology/tissues/practice',
    assessment: '/biology/tissues/assessment',
  },
};
