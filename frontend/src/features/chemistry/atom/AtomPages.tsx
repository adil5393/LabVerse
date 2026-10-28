/**
 * Chapter 8 (Journey Inside the Atom) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the Atom
 * Laboratory (models, atom builder, gold foil experiment, isotope mixer).
 */

import React from 'react';
import { ATOM_CHAPTER } from '../../../engine/chemistry/atom/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { ScienceArt } from '../../../components/ScienceArt';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { ATOM_VISUALS, AtomBuilderVisual, AtomModelVisual, GoldFoilVisual, IsotopeMixVisual } from './AtomVisuals';

const LABS = [{ label: 'Atom Laboratory', href: '/chemistry/atom/lab', blurb: 'Compare atomic models, build atoms, run the gold foil experiment and mix isotopes.' }];
const PAGES = makeChapterPages(ATOM_CHAPTER, ATOM_VISUALS, { crumb: 'Chemistry', subtitle: 'Chapter 8 · Matter: its nature and behaviour', labs: LABS, illustration: <ScienceArt name="chem-atom" /> });
export const AtomHub = PAGES.Hub;
export const AtomLearnPage = PAGES.Learn;
export const AtomPracticePage = PAGES.Practice;
export const AtomAssessmentPage = PAGES.Assessment;

export const ATOM_LAB_VIEWS: LabView[] = [
  { id: 'models', label: 'Atomic models', render: () => <AtomModelVisual props={{ editable: true, model: 'dalton' }} alt="Dalton’s, Thomson’s, Rutherford’s and Bohr’s models of the atom." /> },
  { id: 'builder', label: 'Atom builder', render: () => <AtomBuilderVisual props={{ editable: true, p: 1, n: 0, e: 1 }} alt="Build an atom from protons, neutrons and electrons." /> },
  { id: 'foil', label: 'Gold foil', render: () => <GoldFoilVisual props={{ editable: true, model: 'thomson' }} alt="α particles fired at a thin gold foil, under Thomson’s or Rutherford’s model." /> },
  { id: 'isotopes', label: 'Isotopes', render: () => <IsotopeMixVisual props={{ editable: true }} alt="Mix two isotopes and find the average atomic mass." /> },
];

export const AtomLabPage: React.FC = () => (
  <SubjectLabShell
    title="Atom Laboratory" testId="atom-lab" back={{ href: '/chemistry/atom', label: 'Atom chapter' }}
    intro="Four investigations. Switch between the atomic models; build an atom from protons, neutrons and electrons and read its element, mass number, charge, configuration and valency; fire α particles at a gold foil under Thomson’s and Rutherford’s models; and mix isotopes to find an average atomic mass."
    assumptions={[
      'Pictures are not to scale: a real nucleus is about 10⁵ times smaller than its atom, and atoms have no colour.',
      'The atom builder uses the chapter’s shell-filling rules, valid for the first twenty elements (hydrogen to calcium).',
      'The gold foil investigation is an illustrative model of 100 000 α particles: it shows the pattern (most straight, a few strongly deflected, very few back), not the exact counts.',
      'Isotope abundances are approximate natural values (chlorine 75 : 25, bromine 49.7 : 50.3, boron about 20 : 80).',
    ]}
    views={ATOM_LAB_VIEWS}
  />
);
