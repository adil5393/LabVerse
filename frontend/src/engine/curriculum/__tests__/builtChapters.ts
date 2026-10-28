/**
 * Every EduChapter that exists, for tests that cross-check the registry against real content. Add a chapter here when it is
 * built; the registry test then verifies its counts, ids and route.
 */

import type { EduChapter } from '../../education/types';
import { COORDINATE_GEOMETRY } from '../../mathematics/coordinateGeometry/content';
import { CIRCLES_CHAPTER } from '../../mathematics/circles/learn/content';
import { PROPOSITIONS_CHAPTER } from '../../mathematics/propositions/learn/content';
import { QUADRILATERALS_CHAPTER } from '../../mathematics/quadrilaterals/learn/content';
import { TWO_VARIABLES_CHAPTER } from '../../mathematics/twoVariables/learn/content';
import { UNDERSTANDING_DATA_CHAPTER } from '../../mathematics/understandingData/learn/content';
import { MOTION_CHAPTER } from '../../physics/motion/learn/content';
import { FORCES_CHAPTER } from '../../physics/forces/learn/content';
import { WORK_CHAPTER } from '../../physics/work/learn/content';
import { MIXTURES_CHAPTER } from '../../chemistry/mixtures/learn/content';
import { ATOM_CHAPTER } from '../../chemistry/atom/learn/content';
import { FOUNDATIONS_CHAPTER } from '../../chemistry/foundations/learn/content';
import { SOUND_CHAPTER } from '../../physics/sound/learn/content';
import { CELL_CHAPTER } from '../../biology/cell/learn/content';
import { TISSUES_CHAPTER } from '../../biology/tissues/learn/content';
import { REPRODUCTION_CHAPTER } from '../../biology/reproduction/learn/content';
import { DIVERSITY_CHAPTER } from '../../biology/diversity/learn/content';

export const BUILT_CHAPTERS: EduChapter[] = [
  COORDINATE_GEOMETRY, CIRCLES_CHAPTER, PROPOSITIONS_CHAPTER, QUADRILATERALS_CHAPTER, TWO_VARIABLES_CHAPTER, UNDERSTANDING_DATA_CHAPTER,
  MOTION_CHAPTER, FORCES_CHAPTER, WORK_CHAPTER, SOUND_CHAPTER, MIXTURES_CHAPTER, ATOM_CHAPTER, FOUNDATIONS_CHAPTER,
  CELL_CHAPTER, TISSUES_CHAPTER, REPRODUCTION_CHAPTER, DIVERSITY_CHAPTER,
];
