/**
 * Authoritative Subject Registry for LabVerse
 * NCERT Classes 9–10 Digital STEM Laboratory Platform
 *
 * Single Source of Truth for:
 * - Subject availability (Active vs In Development)
 * - Navigation links and active route matching
 * - Homepage SubjectExplorer cards and topic previews
 * - Global header navigation tabs
 */

import { chaptersFor } from '../engine/curriculum';
import type { SubjectArea } from '../engine/curriculum/types';

export type SubjectId = 'physics' | 'chemistry' | 'mathematics' | 'biology' | 'robotics';

export type SubjectStatus = 'ready' | 'in_development';

export interface SubjectFeature {
  title: string;
  description: string;
  icon: string;
}

export interface SubjectDefinition {
  id: SubjectId;
  name: string;
  category: string;
  description: string;
  icon: string;
  status: SubjectStatus;
  route?: string;
  accentColor: string;
  badgeText: string;
  buttonText: string;
  topicsCount: number;
  experimentsCount: number;
  features?: SubjectFeature[];
}

/**
 * Chapter and investigation counts read from the curriculum registry, so a subject card cannot fall out of date when a chapter
 * or an investigation is added. Only built chapters count (complete or partly built), not optional refreshers.
 */
export function curriculumCounts(subject: SubjectArea): { topicsCount: number; experimentsCount: number } {
  const built = chaptersFor(subject).filter((c) => c.implementation.status === 'complete' || c.implementation.status === 'partial');
  return {
    topicsCount: built.length,
    experimentsCount: built.reduce((n, c) => n + (c.implementation.investigations ?? c.implementation.labs.length), 0),
  };
}

export const LABVERSE_SUBJECTS: SubjectDefinition[] = [
  {
    id: 'physics',
    name: 'Physics',
    category: 'Class 9: Motion, Forces, Work and Energy, Sound',
    description:
      'The four Class 9 Physics chapters of NCERT Exploration (2026-27): describing motion, how forces affect motion, work, energy and simple machines, and sound waves, each with lessons and interactive laboratories.',
    icon: 'speed',
    status: 'ready',
    route: '/physics',
    accentColor: '#38bdf8',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Physics',
    topicsCount: 4,
    experimentsCount: 16,
    features: [
      {
        title: 'Motion and Forces',
        description: 'Tracks, graphs, equations of motion, force diagrams and Newton’s laws with live simulations.',
        icon: 'directions_run',
      },
      {
        title: 'Energy and Sound',
        description: 'Work, energy, power and simple machines; vibrations and sound waves.',
        icon: 'graphic_eq',
      },
    ],
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'Class 9: Mixtures, the Atom and Atomic Foundations of Matter',
    description:
      'The three Class 9 Chemistry chapters of NCERT Exploration (2026-27): mixtures and their separation, the structure of the atom, and how atoms combine into molecules and ionic compounds, with lessons, laboratories, practice and assessments.',
    icon: 'science',
    status: 'ready',
    route: '/chemistry',
    accentColor: '#10b981',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Chemistry',
    ...curriculumCounts('chemistry'),
    features: [
      {
        title: 'Mixtures Laboratory',
        description: 'Light beams and settling, concentration, solubility and crystallization, a separation bench with apparatus, and chromatography.',
        icon: 'filter_alt',
      },
      {
        title: 'Atom Laboratory',
        description: 'Atomic models, an atom builder, the gold foil experiment and isotopes.',
        icon: 'blur_on',
      },
      {
        title: 'Formula Laboratory',
        description: 'Conservation of mass on a balance, ionic and covalent bonds, formulae, formula mass and property tests.',
        icon: 'hub',
      },
    ],
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'Coordinate Geometry, Circles, Quadrilaterals, Propositions, Linear Equations & Data',
    description:
      'Six independent Class 9 mathematics laboratories: dynamic Cartesian coordinate plane, Euclidean circle theorems, quadrilateral classifications, formal mathematical reasoning, linear equations in two variables, and weighted averages, mixtures and stacked data charts.',
    icon: 'calculate',
    status: 'ready',
    route: '/mathematics',
    accentColor: '#a855f7',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Mathematics',
    topicsCount: 6,
    experimentsCount: 64,
    features: [
      {
        title: 'Coordinate Geometry',
        description: 'Dynamic Cartesian coordinate system, Euclidean distance formula, and Pythagorean proofs.',
        icon: 'grid_4x4',
      },
      {
        title: 'Circles Laboratory',
        description: 'Chord properties, subtended angles, cyclic quadrilaterals, tangents, and progressive guided learning.',
        icon: 'radio_button_unchecked',
      },
      {
        title: 'Quadrilaterals Laboratory',
        description: 'Convex & concave interior angles, parallelogram invariants, Midpoint theorem, and Varignon tiling.',
        icon: 'crop_square',
      },
      {
        title: 'Propositions & Converses',
        description: 'Logic of hypotheses & conclusions, converse truth independence, counterexample discovery, and deductive proofs.',
        icon: 'psychology',
      },
      {
        title: 'Two Variables, One Line',
        description: 'Interactive equation graphs, two-line systems, parallel and coincident lines, substitution and elimination.',
        icon: 'show_chart',
      },
      {
        title: 'Understanding Data',
        description: 'Weighted averages, mixtures and concentrations, stacked and 100% stacked bar charts, and spotting misleading conclusions.',
        icon: 'stacked_bar_chart',
      },
    ],
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'World of Living: Cells, Tissues, Reproduction and Diversity',
    description:
      'Class 9 World of Living: a virtual light microscope, osmosis bench, cell explorer, root and joint experiments, a pea pollination experiment and five kingdom keys, with lessons, practice and assessments for all four chapters.',
    icon: 'biotech',
    status: 'ready',
    route: '/biology',
    accentColor: '#06b6d4',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Biology',
    ...curriculumCounts('biology'),
    features: [
      { title: 'Virtual Microscope', description: 'Objective lenses, focus, stains, a stage ruler and Activity 2.1 cell-size estimates.', icon: 'biotech' },
      { title: 'Cell Laboratory', description: 'Osmosis in potatoes and cells, bacterial, plant and animal cells part by part, mitosis and meiosis.', icon: 'bubble_chart' },
      { title: 'Tissue Laboratory', description: 'Root tip experiment, stem section, animal tissues, joints and tree rings.', icon: 'eco' },
      { title: 'Reproduction Laboratory', description: 'Bead model of meiosis, flower parts, the pea bagging experiment and pollination strategies.', icon: 'local_florist' },
      { title: 'Classification Laboratory', description: 'Five kingdom and plant keys, animal phyla, the classification ladder and scientific names.', icon: 'account_tree' },
    ],
  },
  {
    id: 'robotics',
    name: 'Robotics',
    category: 'Electricity, Circuits and Electronics',
    description:
      'Build DC circuits on a virtual breadboard with a real circuit solver: closed loops, LEDs, resistors and short-circuit safety. Sensors, microcontrollers and motors are planned.',
    icon: 'precision_manufacturing',
    status: 'ready',
    route: '/robotics',
    accentColor: '#f59e0b',
    badgeText: 'Active Laboratory',
    buttonText: 'Explore Robotics',
    topicsCount: 1,
    experimentsCount: 2,
    features: [
      {
        title: 'Solderless Breadboarding',
        description: 'Standard 400-tie-point terminal pitch (2.54mm), dual power rails & central trough.',
        icon: 'schema',
      },
      {
        title: 'DC Loop Simulation',
        description: 'Real scientific DC solver with live current, voltage drops, and interactive component telemetry.',
        icon: 'bolt',
      },
    ],
  },
];

export function getAllSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS;
}

export function getAvailableSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS.filter((s) => s.status === 'ready');
}

export function getInDevelopmentSubjects(): SubjectDefinition[] {
  return LABVERSE_SUBJECTS.filter((s) => s.status === 'in_development');
}

export function getSubjectById(id: SubjectId): SubjectDefinition | undefined {
  return LABVERSE_SUBJECTS.find((s) => s.id === id);
}

export function isSubjectActive(id: SubjectId): boolean {
  const subj = getSubjectById(id);
  return subj ? subj.status === 'ready' : false;
}
