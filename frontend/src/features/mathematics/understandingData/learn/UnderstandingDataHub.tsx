/**
 * Understanding Data chapter pages on the unified framework: hub, practice bank and assessment. While the compatibility switch
 * is on (`?legacy=1`), the hub shows the older landing page. Older progress is imported read-only on first visit.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { UNDERSTANDING_DATA_CHAPTER } from '../../../../engine/mathematics/understandingData/learn/content';
import { UD_LEGACY_KEY, UD_LESSON_MAP, UD_PRACTICE_ITEM_IDS } from '../../../../engine/mathematics/understandingData/learn/unified';
import { UD_GUIDED_LESSONS } from '../../../../engine/mathematics/understandingData/curriculumPath';
import { makeChapterPages } from '../../../education/chapterPages';
import { useLegacyImport } from '../../../education/useLegacyImport';
import { legacyPathEnabled } from '../../../education/compat';
import { UnderstandingDataLab } from '../UnderstandingDataLab';
import { UD_VISUALS } from './UdVisual';

const PAGES = makeChapterPages(UNDERSTANDING_DATA_CHAPTER, UD_VISUALS, {
  crumb: 'Understanding Data',
  subtitle: 'How quantities combine: weighted averages, mixtures, stacked and 100% stacked charts, and what an average can hide.',
  labs: [
    { label: 'Data workbench', href: '/mathematics/understanding-data/workbench', blurb: 'Weighted averages, mixtures, charts and the average-day investigation.' },
    { label: 'Workbench practice mode', href: '/mathematics/understanding-data/workbench?mode=practice', blurb: 'Practice questions answered on live charts.' },
  ],
});

const SHAPE = { rootEvidenceField: 'practiceAnswers', masteredField: 'mastered', questionsOf: (id: string) => UD_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };

export const UnderstandingDataHub: React.FC = () => {
  const { search } = useLocation();
  useLegacyImport('understanding-data', UD_LEGACY_KEY, UD_LESSON_MAP, UD_PRACTICE_ITEM_IDS, SHAPE);
  return legacyPathEnabled('understanding-data', search) ? <UnderstandingDataLab /> : <PAGES.Hub />;
};

export const UnderstandingDataPracticePage = PAGES.Practice;
export const UnderstandingDataAssessmentPage = PAGES.Assessment;
