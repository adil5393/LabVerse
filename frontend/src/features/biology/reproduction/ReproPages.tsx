/**
 * Chapter 11 (Reproduction) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the Reproduction
 * Laboratory (microscope, bead model, flower, pea experiment, pollination strategies and cycle calendar).
 */

import React from 'react';
import { REPRODUCTION_CHAPTER } from '../../../engine/biology/reproduction/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { MicroscopeVisual } from '../shared/Microscope';
import { BeadCombosVisual, CycleCalendarVisual, FlowerPartsVisual, PollinationStrategyVisual, PollinationTestVisual, REPRO_VISUALS } from './ReproVisuals';

const LABS = [{ label: 'Reproduction Laboratory', href: '/biology/reproduction/lab', blurb: 'See buds and spores, model meiosis with beads, dissect a flower and run the pea pollination experiment.' }];
const PAGES = makeChapterPages(REPRODUCTION_CHAPTER, REPRO_VISUALS, { crumb: 'Biology', subtitle: 'Chapter 11 · World of Living', labs: LABS });
export const ReproductionHub = PAGES.Hub;
export const ReproductionLearnPage = PAGES.Learn;
export const ReproductionPracticePage = PAGES.Practice;
export const ReproductionAssessmentPage = PAGES.Assessment;

export const REPRODUCTION_LAB_VIEWS: LabView[] = [
  { id: 'microscope', label: 'Buds and spores', render: () => <MicroscopeVisual props={{ editable: true, specimen: 'yeast', objective: 40, specimens: ['yeast', 'mould'] }} alt="Budding yeast and bread mould under the virtual microscope." /> },
  { id: 'beads', label: 'Bead model', render: () => <BeadCombosVisual props={{ editable: true, pairs: 3 }} alt="Bead pairs modelling how meiosis sorts chromosomes into gametes." /> },
  { id: 'flower', label: 'Flower parts', render: () => <FlowerPartsVisual props={{ editable: true, part: 'anther' }} alt="The parts of a flower and their jobs." /> },
  { id: 'pollination', label: 'Pea experiment', render: () => <PollinationTestVisual props={{ editable: true }} alt="Five pea flower treatments testing whether pollination is needed for fruit." /> },
  { id: 'strategies', label: 'Pollination strategies', render: () => <PollinationStrategyVisual props={{ editable: true }} alt="Wind and insect pollination compared by pollen per seed." /> },
  { id: 'cycle', label: 'Cycle calendar', render: () => <CycleCalendarVisual props={{ editable: true, cycleLength: 28 }} alt="A calendar estimating the next period and ovulation from a cycle length." /> },
];

export const ReproductionLabPage: React.FC = () => (
  <SubjectLabShell
    title="Reproduction Laboratory" testId="reproduction-lab" back={{ href: '/biology/reproduction', label: 'Reproduction chapter' }}
    intro="Six investigations. Look for buds on yeast and spore sacs on bread mould; draw random gametes from bead pairs; take a flower apart; run the pea bagging experiment; compare wind and insect pollination with Table 11.3; and estimate the timing of a menstrual cycle."
    assumptions={[
      'The pea experiment follows Activity 11.6: pea flowers pollinate themselves as they open.',
      'Pollen and seed numbers are the approximate ranges of Table 11.3.',
      'The cycle calendar uses the textbook’s typical pattern (ovulation about 14 days before the next period); real cycles vary, so it is for learning, not for contraception or medical advice.',
    ]}
    views={REPRODUCTION_LAB_VIEWS}
  />
);
