/** Chapter 9 (Atomic Foundations of Matter): prerequisites and units. Optional refreshers that never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { num, pick } from '../../../education/builders';

export const CFP_VALENCY: Prerequisite = {
  id: 'cfp-valency',
  title: 'Valence electrons and valency',
  why: 'Atoms bond to complete their outer shells. You need to find an atom’s valence electrons and valency from its configuration.',
  connection: 'Chapter 8, Lessons 6 and 7 (/chemistry/atom/learn/ca-l7)',
  refresher: [{
    id: 'cfp-va-step', title: 'Lose, gain or share to reach an octet',
    paragraphs: [
      'Sodium (2, 8, 1) loses one electron: valency 1. Oxygen (2, 6) gains two: valency 2. Carbon (2, 4) shares four: valency 4. Neon (2, 8) already has an octet: valency 0.',
    ],
  }],
  checks: [num('cfp-va-c1', 'Chlorine is 2, 8, 7. What is its valency?', 1, 'It gains one electron to complete the octet.', { refresherId: 'cfp-va-step' })],
};

export const CFP_CHANGE: Prerequisite = {
  id: 'cfp-change',
  title: 'Physical and chemical changes',
  why: 'The laws in this chapter are about chemical reactions. You need to tell a chemical change (new substances) from a physical one.',
  connection: 'Grade 7 Curiosity: physical and chemical changes',
  refresher: [{
    id: 'cfp-ch-step', title: 'New substances or not',
    paragraphs: [
      'In a physical change, such as dissolving salt or tearing paper, no new substance forms. In a chemical change, such as baking soda fizzing with vinegar or magnesium burning, new substances form, often with gas, heat, light or a colour change.',
    ],
  }],
  checks: [pick('cfp-ch-c1', 'Which is a chemical change?', [['Baking soda fizzing in vinegar', null], ['Salt dissolving in water', 'No new substance forms when salt dissolves.', 'dissolving-chemical']], 'A gas, a new substance, forms.', undefined, 'cfp-ch-step')],
};

export const CFP_RATIO: Prerequisite = {
  id: 'cfp-ratio',
  title: 'Ratios and proportion',
  why: 'Elements combine in fixed ratios by mass. You need to scale a ratio up or down.',
  connection: 'Mathematics: ratio and proportion',
  refresher: [{
    id: 'cfp-ra-step', title: 'Scaling a ratio',
    paragraphs: ['If A and B are in the ratio 1 : 8, then 3 g of A goes with 3 × 8 = 24 g of B. Multiply both parts by the same number.'],
  }],
  checks: [num('cfp-ra-c1', 'A and B combine in the ratio 3 : 4. How much B goes with 9 g of A, in grams?', 12, '9 ÷ 3 = 3; 3 × 4 = 12 g.', { refresherId: 'cfp-ra-step' })],
};

export const CF_PREREQUISITES: Prerequisite[] = [CFP_VALENCY, CFP_CHANGE, CFP_RATIO];

export const CF_UNITS: EduUnit[] = [
  {
    id: 'cf-unit-1', number: 1, title: 'Laws of chemical combination',
    centralIdea: 'Mass is conserved in reactions, compounds have fixed compositions, and Dalton’s atoms explain both.',
    connection: 'Builds on chemical changes and on ratios.',
    vocabulary: [{ term: 'reactants', meaning: 'the substances that react' }, { term: 'products', meaning: 'the substances formed' }],
    discover: ['Why a fizzing reaction seems to lose mass in an open flask', 'Why water always has hydrogen and oxygen in the ratio 1 : 8'],
    prerequisiteIds: ['cfp-change', 'cfp-ratio'], lessonIds: ['cf-l1', 'cf-l2', 'cf-l3'],
  },
  {
    id: 'cf-unit-2', number: 2, title: 'How atoms bond',
    centralIdea: 'Atoms share electrons (covalent bonds) or transfer them (ionic bonds) to complete their outer shells.',
    connection: 'Uses valency from Chapter 8.',
    vocabulary: [{ term: 'covalent bond', meaning: 'a shared pair of electrons holding two atoms together' }, { term: 'ionic bond', meaning: 'the attraction between oppositely charged ions' }],
    discover: ['How H₂, O₂, HCl and H₂O form by sharing', 'How sodium chloride forms by transfer'],
    prerequisiteIds: ['cfp-valency'], lessonIds: ['cf-l4', 'cf-l5'],
  },
  {
    id: 'cf-unit-3', number: 3, title: 'Formulae and properties',
    centralIdea: 'Criss-crossing valencies or charges gives a formula, and the kind of bond explains a compound’s properties.',
    connection: 'Uses ions and valencies from Unit 2.',
    vocabulary: [{ term: 'polyatomic ion', meaning: 'an ion made of more than one atom, such as SO₄²⁻' }],
    discover: ['How to write formulae such as Al₂(SO₄)₃', 'Why salt water conducts electricity but sugar water does not'],
    prerequisiteIds: ['cfp-valency'], lessonIds: ['cf-l6', 'cf-l7'],
  },
  {
    id: 'cf-unit-4', number: 4, title: 'Molecular and formula unit mass',
    centralIdea: 'Adding atomic masses gives the mass of a molecule or a formula unit.',
    connection: 'Uses formulae from Unit 3 and atomic masses from Chapter 8.',
    vocabulary: [{ term: 'formula unit', meaning: 'the simplest whole-number ratio of ions in an ionic compound' }],
    discover: ['How to find the molecular mass of CO₂ or the formula unit mass of Ca(NO₃)₂'],
    prerequisiteIds: ['cfp-ratio'], lessonIds: ['cf-l8'],
  },
];
