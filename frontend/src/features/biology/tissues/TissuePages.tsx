/**
 * Chapter 3 (Tissues in Action) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the Tissue
 * Laboratory (root experiment, stem section, animal tissues, joints, tree rings and root-tip microscope).
 */

import React from 'react';
import { TISSUES_CHAPTER } from '../../../engine/biology/tissues/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { ScienceArt } from '../../../components/ScienceArt';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { MicroscopeVisual } from '../shared/Microscope';
import { AnimalTissuesVisual, JointsVisual, PlantTissuesVisual, RootGrowthVisual, TISSUE_VISUALS, TreeRingsVisual } from './TissueVisuals';

const LABS = [{ label: 'Tissue Laboratory', href: '/biology/tissues/lab', blurb: 'Cut root tips, explore a stem section and animal tissues, test joints and count tree rings.' }];
const PAGES = makeChapterPages(TISSUES_CHAPTER, TISSUE_VISUALS, { crumb: 'Biology', subtitle: 'Chapter 3 · World of Living', labs: LABS, illustration: <ScienceArt name="bio-tissues" /> });
export const TissuesHub = PAGES.Hub;
export const TissuesLearnPage = PAGES.Learn;
export const TissuesPracticePage = PAGES.Practice;
export const TissuesAssessmentPage = PAGES.Assessment;

export const TISSUE_LAB_VIEWS: LabView[] = [
  { id: 'roots', label: 'Root experiment', render: () => <RootGrowthVisual props={{ editable: true, cutDay: 3 }} alt="Onion root growth in two jars, with the tips of jar B cut on a chosen day." /> },
  { id: 'stem', label: 'Stem section', render: () => <PlantTissuesVisual props={{ editable: true, tissue: 'epidermis' }} alt="A stem cross-section with each tissue explained." /> },
  { id: 'animal', label: 'Animal tissues', render: () => <AnimalTissuesVisual props={{ editable: true, group: 'epithelial' }} alt="Epithelial, connective, muscle and nervous tissue." /> },
  { id: 'joints', label: 'Joints', render: () => <JointsVisual props={{ editable: true, joint: 'ball-socket' }} alt="Four kinds of joint and the movements they allow." /> },
  { id: 'rings', label: 'Tree rings', render: () => <TreeRingsVisual props={{ editable: true, age: 20 }} alt="Annual rings and trunk diameter of a teak tree." /> },
  { id: 'microscope', label: 'Root tip slide', render: () => <MicroscopeVisual props={{ editable: true, specimen: 'root-tip', objective: 40, specimens: ['root-tip', 'onion'] }} alt="Onion root tip cells under the virtual microscope." /> },
];

export const TissuesLabPage: React.FC = () => (
  <SubjectLabShell
    title="Tissue Laboratory" testId="tissue-lab" back={{ href: '/biology/tissues', label: 'Tissues chapter' }}
    intro="Six investigations. Cut onion root tips and compare growth; tap the tissues of a stem cross-section; compare epithelial, connective, muscle and nervous tissue; try movements at four kinds of joint; count the rings of a teak tree; and look at dividing root tip cells under the microscope."
    assumptions={[
      'Root growth of about 0.9 cm a day and the 1 cm cut are illustrative values for the onion experiment.',
      'Tree data are the teak values of Table 3.7; other trees grow at other rates.',
      'Stem, tissue and joint drawings are simplified and not to scale.',
    ]}
    views={TISSUE_LAB_VIEWS}
  />
);
