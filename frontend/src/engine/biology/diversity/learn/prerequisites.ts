/** Chapter 12 (Patterns in Life): prerequisites and units. Short optional refreshers; they never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { pick } from '../../../education/builders';

export const BDP_CELLTYPES: Prerequisite = {
  id: 'bdp-celltypes',
  title: 'Prokaryotic and eukaryotic cells',
  why: 'Classification starts from the kind of cell. You need to recall that prokaryotes have no true nucleus and eukaryotes do.',
  connection: 'Chapter 2: Cell, Section 2.3',
  refresher: [{
    id: 'bdp-ct-step', title: 'Two kinds of cell',
    paragraphs: [
      'Prokaryotic cells, such as bacteria, have no membrane-bound nucleus; their DNA lies in a nucleoid. Eukaryotic cells have a true nucleus and membrane-bound organelles.',
      'Plant cells have cellulose walls; fungal cells have walls of chitin; animal cells have no wall.',
    ],
  }],
  checks: [pick('bdp-ct-c1', 'A bacterium is…', [['prokaryotic', null], ['eukaryotic', 'Bacteria have no true nucleus, so they are not eukaryotic.', 'pro-eu-swap']], 'No true nucleus.', undefined, 'bdp-ct-step')],
};

export const BDP_NUTRITION: Prerequisite = {
  id: 'bdp-nutrition',
  title: 'Autotrophs, heterotrophs and decomposers',
  why: 'Mode of nutrition is a key criterion for kingdoms. You need to tell autotrophs from heterotrophs.',
  connection: 'Grade 7 Curiosity: nutrition in plants and animals',
  refresher: [{
    id: 'bdp-nu-step', title: 'Who makes food',
    paragraphs: [
      'Autotrophs make their own food, usually by photosynthesis; they are producers. Heterotrophs depend on other organisms for food; they are consumers.',
      'Decomposers, such as many fungi and bacteria, feed on dead matter and return nutrients to the soil.',
    ],
  }],
  checks: [pick('bdp-nu-c1', 'A mushroom growing on a fallen log is…', [['a heterotroph (a decomposer)', null], ['an autotroph', 'A mushroom has no chlorophyll and cannot make its own food.', 'auto-hetero']], 'It absorbs food.', undefined, 'bdp-nu-step')],
};

export const BDP_TISSUES: Prerequisite = {
  id: 'bdp-tissues',
  title: 'Vascular tissue and levels of organisation',
  why: 'Plant and animal groups are separated by their tissues and body organisation. You need to recall xylem and phloem and the order cell, tissue, organ, organ system.',
  connection: 'Chapter 3: Tissues in Action',
  refresher: [{
    id: 'bdp-ti-step', title: 'Tissues and levels',
    paragraphs: [
      'Xylem carries water and phloem carries food; together they are vascular tissue, which lets plants grow tall on land.',
      'Bodies can be organised at the level of cells, tissues, organs or organ systems, from simple to complex.',
    ],
  }],
  checks: [pick('bdp-ti-c1', 'Which tissue carries water in a plant?', [['Xylem', null], ['Phloem', 'Phloem carries food; xylem carries water.', 'xylem-phloem']], 'Xylem.', undefined, 'bdp-ti-step')],
};

export const BD_PREREQUISITES: Prerequisite[] = [BDP_CELLTYPES, BDP_NUTRITION, BDP_TISSUES];

export const BD_UNITS: EduUnit[] = [
  {
    id: 'bd-unit-1', number: 1, title: 'Why and how we classify',
    centralIdea: 'Biodiversity is vast, so scientists group organisms by shared features; systems have changed from two kingdoms to five as tools improved.',
    connection: 'Uses cell types and modes of nutrition.',
    vocabulary: [{ term: 'biodiversity', meaning: 'the variety of living organisms' }, { term: 'endemic species', meaning: 'a species found naturally in only one region' }],
    discover: ['Why India is a biodiversity hotspot', 'Why the two kingdom system had to be replaced'],
    prerequisiteIds: ['bdp-celltypes', 'bdp-nutrition'], lessonIds: ['bd-l1', 'bd-l2'],
  },
  {
    id: 'bd-unit-2', number: 2, title: 'The five kingdoms',
    centralIdea: 'Monera, Protista and Fungi are separated by nucleus, number of cells and wall; plants and animals are divided further by body plan, transport and reproduction.',
    connection: 'Uses tissues and organisation from Chapter 3.',
    vocabulary: [{ term: 'notochord', meaning: 'a flexible rod along the back, present at some stage in all chordates' }, { term: 'vascular tissue', meaning: 'xylem and phloem' }],
    discover: ['Why yeast is a fungus though it is one cell', 'How ferns differ from mosses', 'Why an earthworm and a beetle are in different phyla'],
    prerequisiteIds: ['bdp-celltypes', 'bdp-tissues'], lessonIds: ['bd-l3', 'bd-l4', 'bd-l5'],
  },
  {
    id: 'bd-unit-3', number: 3, title: 'Naming, ranking and protecting life',
    centralIdea: 'A hierarchy from kingdom to species and a two-word scientific name let everyone identify organisms the same way; fossils show change, and biodiversity needs protecting.',
    connection: 'Builds on the kingdoms of Unit 2.',
    vocabulary: [{ term: 'binomial nomenclature', meaning: 'the two-part scientific naming system: genus and species' }, { term: 'species', meaning: 'similar individuals that can interbreed and produce offspring' }],
    discover: ['Why tigers and lions share a genus', 'How to write a scientific name correctly'],
    prerequisiteIds: ['bdp-nutrition'], lessonIds: ['bd-l6'],
  },
];
