/**
 * Two Variables chapter pages on the unified framework: hub, practice bank and assessment. While the compatibility switch is on
 * (`?legacy=1`), the hub shows the older landing page. Older progress is imported read-only on first visit.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { TWO_VARIABLES_CHAPTER } from '../../../../engine/mathematics/twoVariables/learn/content';
import { TV_JUDGES, TV_LEGACY_KEY, TV_LESSON_MAP, TV_PRACTICE_ITEM_IDS } from '../../../../engine/mathematics/twoVariables/learn/unified';
import { TV_GUIDED_LESSONS } from '../../../../engine/mathematics/twoVariables/curriculumPath';
import { makeChapterPages } from '../../../education/chapterPages';
import { useLegacyImport } from '../../../education/useLegacyImport';
import { legacyPathEnabled } from '../../../education/compat';
import { TwoVariablesLab } from '../TwoVariablesLab';
import { TV_VISUALS } from './TvVisual';

const PAGES = makeChapterPages(TWO_VARIABLES_CHAPTER, TV_VISUALS, {
  crumb: 'Two Variables',
  subtitle: 'One equation, many solutions on a straight line; slope and y = mx + d; and pairs of equations solved by substitution, elimination and graphs.',
  judges: TV_JUDGES,
  labs: [
    { label: 'Graph workbench', href: '/mathematics/two-variables/workbench', blurb: 'Edit an equation and watch its table and line.' },
    { label: 'System Explorer', href: '/mathematics/two-variables/workbench?tab=system', blurb: 'Two equations, two lines, and where they meet.' },
    { label: 'Algebra lab', href: '/mathematics/two-variables/workbench?tab=algebra', blurb: 'Substitution and elimination step by step.' },
  ],
});

const SHAPE = { rootEvidenceField: 'practiceAnswers', masteredField: 'mastered', questionsOf: (id: string) => TV_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };

export const TwoVariablesHub: React.FC = () => {
  const { search } = useLocation();
  useLegacyImport('two-variables', TV_LEGACY_KEY, TV_LESSON_MAP, TV_PRACTICE_ITEM_IDS, SHAPE);
  return legacyPathEnabled('two-variables', search) ? <TwoVariablesLab /> : <PAGES.Hub />;
};

export const TwoVariablesPracticePage = PAGES.Practice;
export const TwoVariablesAssessmentPage = PAGES.Assessment;
