/** Chapter 2 (Cell: The Building Block of Life): prerequisites and units. Short optional refreshers; they never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { num, pick } from '../../../education/builders';

export const BCP_LIVING: Prerequisite = {
  id: 'bcp-living',
  title: 'Living things and their life processes',
  why: 'The chapter asks how the tiny cell carries out life processes such as nutrition, respiration and growth. You need to recall what those processes are.',
  connection: 'Grade 7 and 8 Curiosity: life processes in plants and animals',
  refresher: [{
    id: 'bcp-li-step', title: 'What living things do',
    paragraphs: [
      'Living things take in food (nutrition), release energy from it (respiration), get rid of wastes, grow, respond to their surroundings and reproduce.',
      'Plants make their own food by photosynthesis in sunlight; animals take in food from other organisms.',
    ],
  }],
  checks: [pick('bcp-li-c1', 'Which process releases energy from food?', [['Respiration', null], ['Photosynthesis', 'Photosynthesis makes food using sunlight; it does not release energy from food.', 'photo-resp'], ['Excretion', 'Excretion removes wastes; it does not release energy.', 'process-mixup']], 'Respiration releases energy.', undefined, 'bcp-li-step')],
};

export const BCP_LENS: Prerequisite = {
  id: 'bcp-lens',
  title: 'Convex lenses magnify',
  why: 'A microscope uses convex lenses to make small things look larger. You need to know what magnification means.',
  connection: 'Grade 8 Curiosity: light and lenses',
  refresher: [{
    id: 'bcp-le-step', title: 'Magnification',
    paragraphs: [
      'A convex lens held close to a small object makes it look larger. Magnification says how many times larger: a 10X lens makes an object look ten times larger.',
      'Two lenses one after the other multiply: a 10X lens followed by another 10X lens gives 100X.',
    ],
  }],
  checks: [num('bcp-le-c1', 'A 5X lens is followed by a 4X lens. What is the total magnification?', 20, '5 × 4 = 20.', { rules: [[[9], 'Lenses in a row multiply their magnifications; they do not add.', 'add-not-multiply']], refresherId: 'bcp-le-step' })],
};

export const BCP_UNITS: Prerequisite = {
  id: 'bcp-units',
  title: 'Millimetres and micrometres',
  why: 'Cells are measured in micrometres. You need to convert between millimetres and micrometres.',
  connection: 'Mathematics: units of length',
  refresher: [{
    id: 'bcp-un-step', title: 'Small units of length',
    paragraphs: [
      'One millimetre (mm) is divided into 1000 micrometres, so 1 mm = 1000 micrometres. To change millimetres to micrometres, multiply by 1000.',
      'One micrometre is itself 1000 nanometres. A typical plant cell is tens of micrometres across.',
    ],
  }],
  checks: [num('bcp-un-c1', 'How many micrometres are there in 2.5 mm?', 2500, '2.5 × 1000 = 2500.', { rules: [[[250], 'Multiply by 1000, not 100: 1 mm is 1000 micrometres.', 'factor-100'], [[0.0025], 'Going from a larger unit to a smaller one, the number gets bigger, so multiply.', 'divide-not-multiply']], refresherId: 'bcp-un-step' })],
};

export const BCP_DIFFUSION: Prerequisite = {
  id: 'bcp-diffusion',
  title: 'Particles spread from more to less',
  why: 'Osmosis is a kind of diffusion. You need the idea that particles spread from where they are crowded to where they are fewer.',
  connection: 'Grade 8 Curiosity: dye spreading in water, fragrance spreading in air',
  refresher: [{
    id: 'bcp-di-step', title: 'Diffusion',
    paragraphs: [
      'A drop of dye spreads through still water, and a fragrance spreads through a room. Particles move on their own from a region where they are more concentrated to one where they are less concentrated.',
      'The difference in concentration is called a concentration gradient. Diffusion goes on until the concentration is the same everywhere.',
    ],
  }],
  checks: [pick('bcp-di-c1', 'In diffusion, particles move overall…', [['from higher to lower concentration', null], ['from lower to higher concentration', 'That is the wrong way: particles spread out from where they are crowded.', 'gradient-reverse']], 'Down the gradient.', undefined, 'bcp-di-step')],
};

export const BC_PREREQUISITES: Prerequisite[] = [BCP_LIVING, BCP_LENS, BCP_UNITS, BCP_DIFFUSION];

export const BC_UNITS: EduUnit[] = [
  {
    id: 'bc-unit-1', number: 1, title: 'Seeing cells',
    centralIdea: 'Cells are too small for the eye, so we magnify them with microscopes and estimate their size from the field of view.',
    connection: 'Builds on convex lenses and units of length.',
    vocabulary: [{ term: 'limit of resolution', meaning: 'the smallest separation at which two points can still be seen as two' }, { term: 'magnification', meaning: 'how many times larger an image looks than the object' }],
    discover: ['Why we cannot see cells with the eye alone', 'How to estimate the size of a cell under a microscope'],
    prerequisiteIds: ['bcp-lens', 'bcp-units'], lessonIds: ['bc-l1'],
  },
  {
    id: 'bc-unit-2', number: 2, title: 'The boundary of the cell',
    centralIdea: 'The selectively permeable membrane controls what enters and leaves; in plants a rigid wall around it keeps the cell’s shape.',
    connection: 'Uses diffusion from earlier grades.',
    vocabulary: [{ term: 'osmosis', meaning: 'the movement of water through a selectively permeable membrane from a dilute to a concentrated solution' }, { term: 'cell wall', meaning: 'a rigid but permeable layer outside the membrane in plants, fungi and bacteria' }],
    discover: ['Why a potato piece swells in water and shrinks in salt solution', 'Why plant cells keep their shape in sugar solution but cheek cells shrink'],
    prerequisiteIds: ['bcp-diffusion'], lessonIds: ['bc-l2', 'bc-l3'],
  },
  {
    id: 'bc-unit-3', number: 3, title: 'Inside the cell',
    centralIdea: 'Prokaryotic cells have no nucleus; eukaryotic cells divide their work among membrane-bound organelles like a factory.',
    connection: 'Uses life processes such as photosynthesis and respiration.',
    vocabulary: [{ term: 'organelle', meaning: 'a structure inside a cell with a particular job' }, { term: 'prokaryotic', meaning: 'having no well-defined nucleus and no membrane-bound organelles' }],
    discover: ['How bacterial, plant and animal cells differ', 'What each organelle does and which ones contain DNA'],
    prerequisiteIds: ['bcp-living'], lessonIds: ['bc-l4', 'bc-l5'],
  },
  {
    id: 'bc-unit-4', number: 4, title: 'New cells from old',
    centralIdea: 'Cells arise only from other cells: mitosis makes identical cells for growth and repair, meiosis makes gametes with half the chromosomes.',
    connection: 'Leads to Chapter 3 (tissues) and Chapter 11 (reproduction).',
    vocabulary: [{ term: 'mitosis', meaning: 'division giving two daughter cells identical to the parent' }, { term: 'meiosis', meaning: 'two divisions giving four cells with half the chromosome number' }],
    discover: ['How mitosis and meiosis differ', 'What the cell theory states and why cancer cells break the rules'],
    prerequisiteIds: ['bcp-living'], lessonIds: ['bc-l6'],
  },
];
