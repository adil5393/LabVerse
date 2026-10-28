/**
 * Chapter 9 (Atomic Foundations of Matter) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the
 * Formula Laboratory (balance, bonds, formula builder, mass calculator, property tests).
 */

import React from 'react';
import { FOUNDATIONS_CHAPTER } from '../../../engine/chemistry/foundations/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { SubjectLabShell } from '../../education/SubjectLabShell';
import { BondBuilderVisual, FOUND_VISUALS, FormulaBuilderVisual, FormulaMassVisual, MassBalanceVisual, PropertiesTestVisual } from './FoundationsVisuals';

const LABS = [{ label: 'Formula Laboratory', href: '/chemistry/atomic-foundations/lab', blurb: 'Weigh reactions, build bonds, write formulae, calculate masses and test properties.' }];
const PAGES = makeChapterPages(FOUNDATIONS_CHAPTER, FOUND_VISUALS, { crumb: 'Chemistry', subtitle: 'Chapter 9 · Matter: its nature and behaviour', labs: LABS });
export const FoundationsHub = PAGES.Hub;
export const FoundationsLearnPage = PAGES.Learn;
export const FoundationsPracticePage = PAGES.Practice;
export const FoundationsAssessmentPage = PAGES.Assessment;

export const FoundationsLabPage: React.FC = () => (
  <SubjectLabShell
    title="Formula Laboratory" testId="formula-lab" back={{ href: '/chemistry/atomic-foundations', label: 'Atomic foundations chapter' }}
    intro="Five investigations. Weigh a reaction in an open and a closed set-up; choose two atoms and see whether they share or transfer electrons; criss-cross any cation and anion into a formula; type a formula to calculate its mass; and test five compounds for solubility and conductivity."
    assumptions={[
      'Balance readings are illustrative values; the gas lost is what the reaction in the chapter would give off.',
      'Bonds and formulae use the valencies of Chapter 8 for the first twenty elements. A few real compounds differ from the simple valency method.',
      'Ion charges and atomic masses are the chapter’s values (Table 9.1; Cl = 35.5 u).',
      'Property results are those described in the chapter for sodium chloride, copper sulfate, sugar, camphor and naphthalene.',
    ]}
    views={[
      { id: 'balance', label: 'Mass balance', render: () => <MassBalanceVisual props={{ editable: true }} alt="A reaction on a balance in an open or closed set-up." /> },
      { id: 'bonds', label: 'Bond builder', render: () => <BondBuilderVisual props={{ editable: true, a: 'Na', b: 'Cl' }} alt="Choose two atoms and see the bond and formula." /> },
      { id: 'formula', label: 'Formula builder', render: () => <FormulaBuilderVisual props={{ editable: true, mode: 'ionic' }} alt="Criss-cross a cation and an anion into a formula." /> },
      { id: 'mass', label: 'Formula mass', render: () => <FormulaMassVisual props={{ editable: true }} alt="Type a formula and see its molecular or formula unit mass." /> },
      { id: 'properties', label: 'Property tests', render: () => <PropertiesTestVisual props={{ editable: true }} alt="Test five compounds for solubility and conductivity." /> },
    ]}
  />
);
