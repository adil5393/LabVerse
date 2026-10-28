/**
 * Quadrilaterals chapter pages on the unified framework: hub, practice bank and assessment. The Learn page is
 * `QuadrilateralsLearnPage` (same registry). While the compatibility switch is on (`?legacy=1`), the hub shows the older
 * Quadrilaterals landing page. On first visit, progress from the older guided path is imported read-only.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { QUADRILATERALS_CHAPTER } from '../../../../engine/mathematics/quadrilaterals/learn/content';
import { QUAD_LEGACY_KEY, QUAD_LESSON_MAP, QUAD_PRACTICE_ITEM_IDS } from '../../../../engine/mathematics/quadrilaterals/learn/unified';
import { makeChapterPages } from '../../../education/chapterPages';
import { useLegacyImport } from '../../../education/useLegacyImport';
import { legacyPathEnabled } from '../../../education/compat';
import { QuadrilateralsLab } from '../QuadrilateralsLab';
import { QUAD_VISUALS } from './QuadVisual';

const PAGES = makeChapterPages(QUADRILATERALS_CHAPTER, QUAD_VISUALS, {
  crumb: 'Quadrilaterals',
  subtitle: 'What makes a four-sided figure, how to recognise a parallelogram, and how the Midpoint Theorem turns a triangle into a tool, each explained with a reason.',
  labs: [
    { label: 'Quadrilaterals workbench', href: '/mathematics/quadrilaterals/workbench', blurb: 'Construct quadrilaterals, diagonals, midpoints and medians freely.' },
    { label: 'Workbench practice mode', href: '/mathematics/quadrilaterals/workbench?mode=practice', blurb: 'Practice questions loaded as live constructions you can measure.' },
  ],
});

export const QuadrilateralsHub: React.FC = () => {
  const { search } = useLocation();
  useLegacyImport('quadrilaterals', QUAD_LEGACY_KEY, QUAD_LESSON_MAP, QUAD_PRACTICE_ITEM_IDS);
  return legacyPathEnabled('quadrilaterals', search) ? <QuadrilateralsLab /> : <PAGES.Hub />;
};

export const QuadrilateralsPracticePage = PAGES.Practice;
export const QuadrilateralsAssessmentPage = PAGES.Assessment;
