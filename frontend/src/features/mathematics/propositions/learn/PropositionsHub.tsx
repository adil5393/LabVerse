/**
 * Propositions chapter pages on the unified framework: hub, practice bank and assessment. While the compatibility switch is on
 * (`?legacy=1`), the hub shows the older Propositions landing page. Older progress is imported read-only on first visit.
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { PROPOSITIONS_CHAPTER, PROP_JUDGES } from '../../../../engine/mathematics/propositions/learn/content';
import { PROP_LEGACY_KEY, PROP_LESSON_MAP, PROP_PRACTICE_ITEM_IDS } from '../../../../engine/mathematics/propositions/learn/unified';
import { PROP_GUIDED_LESSONS } from '../../../../engine/mathematics/propositions/curriculumPath';
import { makeChapterPages } from '../../../education/chapterPages';
import { useLegacyImport } from '../../../education/useLegacyImport';
import { legacyPathEnabled } from '../../../education/compat';
import { PropositionsLab } from '../PropositionsLab';
import { PROP_VISUALS } from './visuals';

const PAGES = makeChapterPages(PROPOSITIONS_CHAPTER, PROP_VISUALS, {
  crumb: 'Propositions',
  subtitle: 'Statements that are true or false, their converses, counterexamples, and why a proof is more than many examples.',
  judges: PROP_JUDGES,
  labs: [
    { label: 'Reasoning workbench', href: '/mathematics/propositions/workbench', blurb: 'Statement explorer, counterexample lab, number experiments, geometry reasoning and the proof builder.' },
    { label: 'Workbench practice mode', href: '/mathematics/propositions/workbench?mode=practice', blurb: 'The practice questions inside the reasoning workbench.' },
  ],
});

// Older evidence is filed at the top level; each question belongs to the older lessons that list it.
const SHAPE = { rootEvidenceField: 'practiceEvidence', questionsOf: (id: string) => PROP_GUIDED_LESSONS[id]?.practiceQuestionIds ?? [] };

export const PropositionsHub: React.FC = () => {
  const { search } = useLocation();
  useLegacyImport('propositions', PROP_LEGACY_KEY, PROP_LESSON_MAP, PROP_PRACTICE_ITEM_IDS, SHAPE);
  return legacyPathEnabled('propositions', search) ? <PropositionsLab /> : <PAGES.Hub />;
};

export const PropositionsPracticePage = PAGES.Practice;
export const PropositionsAssessmentPage = PAGES.Assessment;
