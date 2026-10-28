/**
 * Chapter 2 (Cell) pages: hub, Learn, practice and assessment from the shared chapter pages, plus the Cell Laboratory (virtual
 * microscope, osmosis bench, cell explorer, cell division and size ladder).
 */

import React from 'react';
import { CELL_CHAPTER } from '../../../engine/biology/cell/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { ScienceArt } from '../../../components/ScienceArt';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { MicroscopeVisual, SizeLadderVisual } from '../shared/Microscope';
import { CELL_VISUALS, CellCompareVisual, DivisionVisual, OsmosisVisual } from './CellVisuals';

const LABS = [{ label: 'Cell Laboratory', href: '/biology/cell/lab', blurb: 'Use a virtual microscope, run osmosis experiments, explore cell parts and watch cells divide.' }];
const PAGES = makeChapterPages(CELL_CHAPTER, CELL_VISUALS, { crumb: 'Biology', subtitle: 'Chapter 2 · World of Living', labs: LABS, illustration: <ScienceArt name="bio-cell" /> });
export const CellHub = PAGES.Hub;
export const CellLearnPage = PAGES.Learn;
export const CellPracticePage = PAGES.Practice;
export const CellAssessmentPage = PAGES.Assessment;

export const CELL_LAB_VIEWS: LabView[] = [
  { id: 'microscope', label: 'Microscope', render: () => <MicroscopeVisual props={{ editable: true, specimen: 'onion', objective: 4 }} alt="A virtual light microscope with slides, objective lenses, focus, stain and a ruler for measuring the field." /> },
  { id: 'osmosis', label: 'Osmosis bench', render: () => <OsmosisVisual props={{ editable: true, mode: 'potato', outside: 0 }} alt="Potato pieces and single cells in solutions of different concentration." /> },
  { id: 'cells', label: 'Cell explorer', render: () => <CellCompareVisual props={{ editable: true, type: 'plant' }} alt="Bacterial, plant and animal cells with each part explained." /> },
  { id: 'division', label: 'Cell division', render: () => <DivisionVisual props={{ editable: true, kind: 'mitosis', chromosomes: 4 }} alt="Mitosis and meiosis compared by daughter cells and chromosomes." /> },
  { id: 'sizes', label: 'Size ladder', render: () => <SizeLadderVisual props={{}} alt="Objects from a chicken egg to proteins and the instrument needed to see each." /> },
];

export const CellLabPage: React.FC = () => (
  <SubjectLabShell
    title="Cell Laboratory" testId="cell-lab" back={{ href: '/biology/cell', label: 'Cell chapter' }}
    intro="Five investigations. Use a virtual light microscope to view slides, measure the field and estimate a cell’s size; put potato pieces and single cells in solutions of different strength; compare bacterial, plant and animal cells part by part; compare mitosis with meiosis; and see which instrument each object needs."
    assumptions={[
      'The microscope uses a 20 mm field number: the field is 5 mm across with the 4X objective, as in Activity 2.1. Cell sizes are typical values; real cells vary.',
      'A light microscope cannot separate details smaller than about 0.2 µm, however much it magnifies.',
      'Osmosis results are illustrative: cell contents are taken as about 3 % dissolved substances.',
      'Cell diagrams are not to scale and colours only tell the parts apart.',
    ]}
    views={CELL_LAB_VIEWS}
  />
);
