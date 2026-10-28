/** Chapter 8 (Journey Inside the Atom): prerequisites and units. Short optional refreshers; they never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { num, pick } from '../../../education/builders';

export const CAP_PARTICLES: Prerequisite = {
  id: 'cap-particles',
  title: 'Matter is made of atoms and molecules',
  why: 'The chapter looks inside the atom. You need the idea that every material is made of tiny particles called atoms, which can join into molecules.',
  connection: 'Grade 8 Curiosity: particles of matter; Chapter 5 (mixtures)',
  refresher: [{
    id: 'cap-pa-step', title: 'Atoms build everything',
    paragraphs: [
      'Everything around you, living or not, is made of atoms: far too small to see, even with an ordinary microscope. Atoms of the same or different kinds join to form molecules, such as water (H₂O).',
      'An element is a substance made of only one kind of atom.',
    ],
  }],
  checks: [pick('cap-pa-c1', 'An element is made of…', [['only one kind of atom', null], ['two or more kinds of atom joined together', 'That describes a compound.', 'element-compound']], 'One kind of atom.', undefined, 'cap-pa-step')],
};

export const CAP_CHARGE: Prerequisite = {
  id: 'cap-charge',
  title: 'Electric charge: like charges repel, unlike attract',
  why: 'Atoms are built from charged particles. You need to know that positive and negative charges attract and that equal amounts cancel.',
  connection: 'Grade 8 Curiosity: electric charge and static electricity',
  refresher: [{
    id: 'cap-ch-step', title: 'Plus and minus',
    paragraphs: [
      'There are two kinds of electric charge, positive (+) and negative (−). Unlike charges attract each other; like charges repel.',
      'Equal amounts of positive and negative charge cancel, so an object with the same amount of each is electrically neutral.',
    ],
  }],
  checks: [pick('cap-ch-c1', 'A negative charge near a positive charge will be…', [['attracted', null], ['repelled', 'Only like charges repel.', 'unlike-repel']], 'Unlike charges attract.', undefined, 'cap-ch-step')],
};

export const CAP_POWERS: Prerequisite = {
  id: 'cap-powers',
  title: 'Powers of ten for very small sizes',
  why: 'Atomic sizes are written with powers of ten, such as 10⁻¹⁰ m. You need to compare such numbers.',
  connection: 'Mathematics: exponents and powers',
  refresher: [{
    id: 'cap-pw-step', title: 'Negative powers of ten',
    paragraphs: [
      '10⁻³ means 1 ÷ 1000 = 0.001. Each step down in the power makes a number ten times smaller: 10⁻¹⁵ is 10⁵ (one lakh) times smaller than 10⁻¹⁰.',
      'To compare, divide: 10⁻⁴ ÷ 10⁻¹⁰ = 10⁶.',
    ],
  }],
  checks: [num('cap-pw-c1', 'How many times bigger is 10⁻⁴ m than 10⁻⁷ m?', 1000, '10⁻⁴ ÷ 10⁻⁷ = 10³ = 1000.', { refresherId: 'cap-pw-step' })],
};

export const CA_PREREQUISITES: Prerequisite[] = [CAP_PARTICLES, CAP_CHARGE, CAP_POWERS];

export const CA_UNITS: EduUnit[] = [
  {
    id: 'ca-unit-1', number: 1, title: 'Models of the atom',
    centralIdea: 'Atomic models changed as experiments revealed electrons, a tiny nucleus and fixed energy levels.',
    connection: 'Builds on the particle picture of matter and on electric charge.',
    vocabulary: [{ term: 'model', meaning: 'a simplified picture that explains observations and can be tested' }, { term: 'nucleus', meaning: 'the tiny, dense, positive centre of an atom' }],
    discover: ['Why Thomson proposed the "plum pudding" atom', 'What the gold foil experiment showed', 'How Bohr explained why atoms are stable'],
    prerequisiteIds: ['cap-particles', 'cap-charge', 'cap-powers'], lessonIds: ['ca-l1', 'ca-l2', 'ca-l3'],
  },
  {
    id: 'ca-unit-2', number: 2, title: 'Particles, numbers and symbols',
    centralIdea: 'Protons decide the element; protons and neutrons give the mass; symbols and notation say it briefly.',
    connection: 'Uses the nuclear model from Unit 1.',
    vocabulary: [{ term: 'atomic number (Z)', meaning: 'the number of protons in the nucleus' }, { term: 'mass number (A)', meaning: 'the number of protons plus neutrons' }],
    discover: ['How to find protons, neutrons and electrons from Z and A', 'How element symbols are written'],
    prerequisiteIds: ['cap-charge'], lessonIds: ['ca-l4', 'ca-l5'],
  },
  {
    id: 'ca-unit-3', number: 3, title: 'Electrons in shells and valency',
    centralIdea: 'Electrons fill shells in order, and the outermost shell decides how an atom combines.',
    connection: 'Uses Bohr’s shells from Unit 1 and Z from Unit 2.',
    vocabulary: [{ term: 'electronic configuration', meaning: 'how the electrons are distributed among the shells' }, { term: 'valency', meaning: 'the combining capacity of an atom' }],
    discover: ['How to write the configuration of the first twenty elements', 'How valency follows from valence electrons'],
    prerequisiteIds: ['cap-particles'], lessonIds: ['ca-l6', 'ca-l7'],
  },
  {
    id: 'ca-unit-4', number: 4, title: 'Isotopes and isobars',
    centralIdea: 'Atoms of one element can differ in neutrons, so an element’s atomic mass is an average.',
    connection: 'Uses Z and A from Unit 2.',
    vocabulary: [{ term: 'isotopes', meaning: 'atoms with the same Z but different A' }, { term: 'isobars', meaning: 'atoms of different elements with the same A' }],
    discover: ['Why isotopes behave alike chemically', 'How to calculate an average atomic mass'],
    prerequisiteIds: ['cap-charge'], lessonIds: ['ca-l8'],
  },
];
