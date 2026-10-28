/**
 * Class 9 Biology, Chapter 11 "Reproduction: How Life Continues": original Learn content. Aligned to NCERT Class 9 Science,
 * Exploration (2026-27), Chapter 11, Sections 11.1 to 11.5.10, checked against the chapter PDF (`iesc111.pdf`). Explanations and
 * questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { R1, R2, R3 } from './lessonsA';
import { R4, R5, R6 } from './lessonsB';
import { REPRO_ASSESSMENT, REPRO_PRACTICE, REPRO_SOLUTION_DIAGRAMS } from './practice';
import { withSolutionDiagrams } from '../../../education/builders';
import { BR_PREREQUISITES, BR_UNITS } from './prerequisites';

const LESSON_LIST = [R1, R2, R3, R4, R5, R6];

export const REPRODUCTION_CHAPTER: EduChapter = {
  id: 'reproduction',
  title: 'Reproduction: How Life Continues',
  classGrade: 9,
  subject: 'biology',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 11, Sections 11.1 to 11.5.10 (asexual reproduction and vegetative propagation, budding and spores, meiosis and variation, the flower, pollination and its strategies, fertilisation and seeds, reproduction in animals, the human reproductive systems, gametes, the menstrual cycle, pregnancy and reproductive health), checked against the chapter PDF.',
  purpose: 'How does life carry on when every organism dies? This chapter compares copying one parent with mixing two, tests what a flower needs to make fruit, and follows how humans and other animals give their young a start.',
  learn: ['Vegetative propagation, budding and spores', 'Why meiosis creates variation', 'Flower parts and pollination', 'Fertilisation, fruits and seeds', 'Reproductive strategies of animals', 'The menstrual cycle, pregnancy and health'],
  realWorld: ['Grafted mangoes and tissue-cultured bananas', 'Bees in apple orchards', 'Why bread goes mouldy', 'ASHA workers and maternal health'],
  outcomes: ['Explain clones and variation', 'Interpret a pollination experiment', 'Compare animal reproductive strategies with data', 'Predict a cycle and explain responsible health choices'],
  prerequisiteIds: ['brp-division', 'brp-plant', 'brp-growing'],
  units: BR_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(BR_PREREQUISITES.map((p) => [p.id, p])),
  practice: withSolutionDiagrams(REPRO_PRACTICE, REPRO_SOLUTION_DIAGRAMS),
  assessment: REPRO_ASSESSMENT,
  routes: {
    landing: '/biology/reproduction',
    learn: (id) => `/biology/reproduction/learn/${id}`,
    prerequisites: (id) => `/biology/reproduction#${id}`,
    lab: '/biology/reproduction/lab',
    practice: '/biology/reproduction/practice',
    assessment: '/biology/reproduction/assessment',
  },
};
