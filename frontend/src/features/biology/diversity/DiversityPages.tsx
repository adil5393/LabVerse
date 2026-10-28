/**
 * Chapter 12 (Diversity and Classification) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the
 * Classification Laboratory (microscope, kingdom key, plant key, animal phyla, hierarchy and name checker).
 */

import React from 'react';
import { DIVERSITY_CHAPTER } from '../../../engine/biology/diversity/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { ScienceArt } from '../../../components/ScienceArt';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { MicroscopeVisual } from '../shared/Microscope';
import { AnimalPhylaVisual, BinomialVisual, DIVERSITY_VISUALS, HierarchyVisual, KingdomKeyVisual, PlantKeyVisual } from './DiversityVisuals';

const LABS = [{ label: 'Classification Laboratory', href: '/biology/diversity/lab', blurb: 'Key organisms into kingdoms and groups, explore animal phyla, compare ranks and check scientific names.' }];
const PAGES = makeChapterPages(DIVERSITY_CHAPTER, DIVERSITY_VISUALS, { crumb: 'Biology', subtitle: 'Chapter 12 · World of Living', labs: LABS, illustration: <ScienceArt name="bio-diversity" /> });
export const DiversityHub = PAGES.Hub;
export const DiversityLearnPage = PAGES.Learn;
export const DiversityPracticePage = PAGES.Practice;
export const DiversityAssessmentPage = PAGES.Assessment;

export const DIVERSITY_LAB_VIEWS: LabView[] = [
  { id: 'microscope', label: 'Microbes', render: () => <MicroscopeVisual props={{ editable: true, specimen: 'paramecium', objective: 10, specimens: ['bacteria', 'paramecium', 'amoeba', 'spirogyra', 'yeast'] }} alt="Bacteria, protists, algae and yeast under the virtual microscope." /> },
  { id: 'kingdoms', label: 'Kingdom key', render: () => <KingdomKeyVisual props={{ editable: true }} alt="A key to the five kingdoms." /> },
  { id: 'plants', label: 'Plant key', render: () => <PlantKeyVisual props={{ editable: true }} alt="A key to the five plant groups." /> },
  { id: 'animals', label: 'Animal phyla', render: () => <AnimalPhylaVisual props={{ editable: true }} alt="The eight invertebrate phyla." /> },
  { id: 'hierarchy', label: 'Hierarchy', render: () => <HierarchyVisual props={{ editable: true, a: 'Tiger', b: 'Lion' }} alt="Two organisms compared from kingdom to species." /> },
  { id: 'names', label: 'Scientific names', render: () => <BinomialVisual props={{ editable: true }} alt="Check a scientific name against the binomial rules." /> },
];

export const DiversityLabPage: React.FC = () => (
  <SubjectLabShell
    title="Classification Laboratory" testId="diversity-lab" back={{ href: '/biology/diversity', label: 'Diversity chapter' }}
    intro="Six investigations. Look at bacteria, protists and algae under the microscope; key organisms into the five kingdoms; key plants into their five groups; explore the eight invertebrate phyla; compare two organisms rank by rank; and check scientific names against the binomial rules."
    assumptions={[
      'The keys follow the criteria of the five kingdom system and Table 12.3; real classification also uses DNA, and some organisms are hard to place.',
      'Ranks follow Fig. 12.17 using seven main ranks; sub-ranks such as sub-phylum Vertebrata are left out of the ladder.',
      'The name checker can test capital and small letters but not italics, which are a matter of printing.',
    ]}
    views={DIVERSITY_LAB_VIEWS}
  />
);
