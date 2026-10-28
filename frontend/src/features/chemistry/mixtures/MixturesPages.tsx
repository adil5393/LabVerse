/**
 * Chapter 5 (Exploring Mixtures and their Separation) pages: hub, Learn, chapter practice and chapter assessment from the shared
 * chapter pages, plus the Mixtures Laboratory with five investigations. Lessons link to an investigation with `?view=`.
 */

import React from 'react';
import { MIXTURES_CHAPTER } from '../../../engine/chemistry/mixtures/learn/content';
import { makeChapterPages } from '../../education/chapterPages';
import { ScienceArt } from '../../../components/ScienceArt';
import { SubjectLabShell, type LabView } from '../../education/SubjectLabShell';
import { MIX_VISUALS, MixBeamVisual, MixChromatographyVisual, MixConcentrationVisual, MixSeparationVisual, MixSolubilityVisual } from './MixturesVisuals';

const LABS = [
  { label: 'Mixtures Laboratory', href: '/chemistry/mixtures/lab', blurb: 'Light beams, settling and filtering; concentration; solubility curves and crystallization; a separation bench with apparatus; and chromatography.' },
];

const PAGES = makeChapterPages(MIXTURES_CHAPTER, MIX_VISUALS, { crumb: 'Chemistry', subtitle: 'Chapter 5 · Matter: its nature and behaviour', labs: LABS, illustration: <ScienceArt name="chem-mixtures" /> });
export const MixturesHub = PAGES.Hub;
export const MixturesLearnPage = PAGES.Learn;
export const MixturesPracticePage = PAGES.Practice;
export const MixturesAssessmentPage = PAGES.Assessment;

export const MIXTURES_LAB_ASSUMPTIONS = [
  'Particle sizes are typical values chosen to fall in the chapter’s bands (solution under 1 nm, colloid 1 to 1000 nm, suspension over 1000 nm).',
  'Solubilities and boiling points are the chapter’s data tables; between two table temperatures the solubility is a straight-line estimate.',
  'The separation bench chooses a method from the properties of the parts (boiling-point gap, miscibility, sublimation, magnetism, solubility, particle size). Real separations may need several steps. Apparatus drawings are schematic.',
  'Of the table’s liquids, benzene and chloroform do not mix with water: benzene floats on water and chloroform sinks below it. The other pairs mix completely.',
  'The chromatography ink is illustrative: three dyes that each travel a fixed fraction of the solvent’s distance.',
  'Safety: never look into a laser beam; copper sulfate and sulfuric acid are handled only with a teacher.',
];

export const MIXTURES_LAB_VIEWS: LabView[] = [
  { id: 'beam', label: 'Beam and beakers', render: () => <MixBeamVisual props={{ editable: true, sampleId: 'salt-water' }} alt="Beakers of solutions, colloids and suspensions with a light beam, settling and filtering." /> },
  { id: 'concentration', label: 'Concentration', render: () => <MixConcentrationVisual props={{ editable: true }} alt="A concentration mixer for % m/m, % m/v and % v/v." /> },
  { id: 'solubility', label: 'Solubility', render: () => <MixSolubilityVisual props={{ editable: true, saltIds: ['kno3', 'nacl', 'kcl', 'nh4cl'], temp: 60 }} alt="Solubility curves linked to a beaker: cool a saturated solution and see what stays dissolved and what crystallizes." /> },
  { id: 'separation', label: 'Separation bench', render: () => <MixSeparationVisual props={{ editable: true, quiz: true }} alt="Choose a mixture and a separation method, then see the apparatus, what goes where, and why." /> },
  { id: 'chromatography', label: 'Chromatography', render: () => <MixChromatographyVisual props={{ editable: true, front: 0 }} alt="A paper chromatogram of black ink as the solvent front rises." /> },
];

export const MixturesLabPage: React.FC = () => (
  <SubjectLabShell
    title="Mixtures Laboratory" testId="mixtures-lab" back={{ href: '/chemistry/mixtures', label: 'Mixtures chapter' }}
    intro="Five investigations. Shine a beam through each beaker, leave it to stand and filter it; mix solutions and read their concentration; cool a saturated solution on the solubility curves and watch crystals form; choose a separation method for a mixture and see the apparatus; and run a paper chromatogram."
    assumptions={MIXTURES_LAB_ASSUMPTIONS}
    views={MIXTURES_LAB_VIEWS}
  />
);
