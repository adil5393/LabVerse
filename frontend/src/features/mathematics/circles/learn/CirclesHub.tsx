/**
 * Circles chapter pages on the unified framework (pilot migration): hub, practice bank and assessment. The Learn page is
 * `CirclesLearnPage` (same registry). While the compatibility switch is on, the hub shows the older Circles landing page instead.
 * On first visit, progress saved by the older guided path is imported (read only) and shown as earlier-version history.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { CIRCLES_CHAPTER } from '../../../../engine/mathematics/circles/learn/content';
import { CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS } from '../../../../engine/mathematics/circles/learn/unified';
import { makeChapterPages } from '../../../education/chapterPages';
import { useLegacyImport } from '../../../education/useLegacyImport';
import { CirclesLab } from '../CirclesLab';
import { legacyCirclesPathEnabled } from '../compat';
import { CIRCLE_VISUALS } from './CircleVisual';

const PAGES = makeChapterPages(CIRCLES_CHAPTER, CIRCLE_VISUALS, {
  crumb: 'Circles',
  subtitle: 'Every point is the same distance from the centre. From that one idea: chords, symmetry, angles at the centre and on the circle, and cyclic quadrilaterals, each explained with a reason.',
  labs: [
    { label: 'Circles workbench', href: '/mathematics/circles/workbench', blurb: 'Construct circles, chords and angles freely; all thirteen experiments.' },
    { label: 'Workbench practice mode', href: '/mathematics/circles/workbench?mode=practice', blurb: 'Practice questions loaded as live constructions you can measure.' },
  ],
});

export const CirclesHub: React.FC = () => {
  const { search } = useLocation();
  useLegacyImport('circles', CIRCLES_LEGACY_KEY, CIRCLES_LESSON_MAP, CIRCLES_PRACTICE_ITEM_IDS);
  return legacyCirclesPathEnabled(search) ? <CirclesLab /> : <PAGES.Hub />;
};

export const CirclesPracticePage = PAGES.Practice;
export const CirclesAssessmentPage = PAGES.Assessment;
