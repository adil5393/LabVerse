/**
 * Chemistry Laboratory Landing Page
 *
 * Implements the subject-level module selector for Chemistry (Class 9).
 * Features "States of Matter & Particle Motion" as the first active laboratory,
 * and displays upcoming curriculum modules in clearly disabled states.
 */

import React from 'react';
import { SubjectChaptersPage } from '../education/SubjectChaptersPage';

export interface ChemistryModule {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  icon: string;
  status: 'active' | 'upcoming';
  experimentsCount: number;
  route?: string;
  badge: string;
}

/** Earlier hard-coded module list, kept for reference; the page now reads the curriculum registry. */
export const LEGACY_CHEMISTRY_MODULES: ChemistryModule[] = [
  {
    id: 'states-of-matter',
    title: 'States of Matter & Particle Motion',
    subtitle: 'Kinetic Theory, Latent Heat & Phase Transitions',
    category: 'Class 9 Chemistry',
    description:
      'Investigate microscopic particle arrangement in solids, liquids, and gases. Explore melting, boiling, latent heat plateaus, and gas compressibility with real physical thermodynamic modeling.',
    icon: 'bubble_chart',
    status: 'active',
    experimentsCount: 1,
    route: '/chemistry/states-of-matter',
    badge: 'Active Laboratory',
  },
  {
    id: 'diffusion-mixing',
    title: 'Diffusion & Mixing',
    subtitle: 'Intermolecular Transport & Graham’s Law',
    category: 'Class 9 Chemistry',
    description:
      'Simulate the spontaneous intermingling of gas and liquid particles driven by thermal kinetic motion and concentration gradients.',
    icon: 'grain',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
  {
    id: 'mixtures-separation',
    title: 'Mixtures & Separation',
    subtitle: 'Homogeneous & Heterogeneous Systems',
    category: 'Class 9 Chemistry',
    description:
      'Explore solutions, suspensions, colloids, fractional distillation, chromatography, and centrifugation separation techniques.',
    icon: 'filter_alt',
    status: 'upcoming',
    experimentsCount: 4,
    badge: 'Upcoming Module',
  },
  {
    id: 'atomic-structure',
    title: 'Atomic Structure',
    subtitle: 'Subatomic Particles & Bohr Model',
    category: 'Class 9 Chemistry',
    description:
      'Interactive Rutherford gold foil scattering, protons, neutrons, electrons, electron shell configurations, and valency.',
    icon: 'blur_on',
    status: 'upcoming',
    experimentsCount: 3,
    badge: 'Upcoming Module',
  },
  {
    id: 'atoms-molecules',
    title: 'Atoms & Molecules',
    subtitle: 'Laws of Chemical Combination & Mole Concept',
    category: 'Class 9 Chemistry',
    description:
      'Stoichiometric ratios, molecular mass calculations, chemical formula builder, and Avogadro’s constant interactive sandbox.',
    icon: 'hub',
    status: 'upcoming',
    experimentsCount: 4,
    badge: 'Upcoming Module',
  },
  {
    id: 'conservation-mass',
    title: 'Conservation of Mass',
    subtitle: 'Lavoisier Reaction Chamber & Mass Balance',
    category: 'Class 9 Chemistry',
    description:
      'Verify that mass is neither created nor destroyed in a closed chemical reaction system using precision analytical balances.',
    icon: 'balance',
    status: 'upcoming',
    experimentsCount: 2,
    badge: 'Upcoming Module',
  },
];

export const ChemistryLab: React.FC = () => (
  <SubjectChaptersPage subject="chemistry" testId="chemistry-hub" title="Chemistry"
    intro="Class 9 Chemistry follows NCERT Exploration (2026-27): mixtures and their separation, the structure of the atom, and the atomic foundations of matter. Each built chapter has lessons, a laboratory, practice and an assessment." />
);
