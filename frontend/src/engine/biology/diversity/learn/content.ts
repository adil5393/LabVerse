/**
 * Class 9 Biology, Chapter 12 "Patterns in Life: Diversity and Classification": original Learn content. Aligned to NCERT Class 9
 * Science, Exploration (2026-27), Chapter 12, Sections 12.1 to 12.10, checked against the chapter PDF (`iesc112.pdf`).
 * Explanations and questions are original.
 */

import type { EduChapter } from '../../../education/types';
import { D1, D2, D3 } from './lessonsA';
import { D4, D5, D6 } from './lessonsB';
import { DIVERSITY_ASSESSMENT, DIVERSITY_PRACTICE } from './practice';
import { BD_PREREQUISITES, BD_UNITS } from './prerequisites';

const LESSON_LIST = [D1, D2, D3, D4, D5, D6];

export const DIVERSITY_CHAPTER: EduChapter = {
  id: 'diversity',
  title: 'Patterns in Life: Diversity and Classification',
  classGrade: 9,
  subject: 'biology',
  ncertNote: 'Aligned to NCERT Class 9 Science, Exploration (2026-27), Chapter 12, Sections 12.1 to 12.10 (India as a biodiversity hotspot, criteria and need for classification, systems over time, the five kingdoms, plant groups, invertebrate phyla and vertebrates, adaptations, the hierarchy, binomial names, fossils and threats to biodiversity), checked against the chapter PDF.',
  purpose: 'How do scientists bring order to millions of kinds of living things? This chapter builds the five kingdoms from a few questions about cells and food, follows plants and animals from simple to complex, and gives every organism an address and a name.',
  learn: ['Biodiversity, endemic species and hotspots', 'From two kingdoms to five', 'Monera, Protista and Fungi', 'The five plant groups', 'Invertebrate phyla and vertebrates', 'Ranks, binomial names, fossils and threats'],
  realWorld: ['Hornbills of the Pakke Tiger Reserve', 'Lichens as air-quality indicators', 'Mushroom farming', 'Saving the Sangai deer of Manipur'],
  outcomes: ['Key organisms into kingdoms', 'Distinguish plant groups and animal phyla', 'Find the lowest shared rank', 'Write scientific names correctly'],
  prerequisiteIds: ['bdp-celltypes', 'bdp-nutrition', 'bdp-tissues'],
  units: BD_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(BD_PREREQUISITES.map((p) => [p.id, p])),
  practice: DIVERSITY_PRACTICE,
  assessment: DIVERSITY_ASSESSMENT,
  routes: {
    landing: '/biology/diversity',
    learn: (id) => `/biology/diversity/learn/${id}`,
    prerequisites: (id) => `/biology/diversity#${id}`,
    lab: '/biology/diversity/lab',
    practice: '/biology/diversity/practice',
    assessment: '/biology/diversity/assessment',
  },
};
