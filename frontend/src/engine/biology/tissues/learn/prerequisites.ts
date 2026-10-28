/** Chapter 3 (Tissues in Action): prerequisites and units. Short optional refreshers; they never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { pick } from '../../../education/builders';

export const BTP_CELLS: Prerequisite = {
  id: 'btp-cells',
  title: 'Plant and animal cells differ',
  why: 'Tissues are built from cells. You need to recall that plant cells have walls and large vacuoles and animal cells do not.',
  connection: 'Chapter 2: Cell, the Building Block of Life',
  refresher: [{
    id: 'btp-ce-step', title: 'Walls and vacuoles',
    paragraphs: [
      'Plant cells have a rigid cellulose cell wall outside the membrane and usually one large central vacuole. Animal cells have only a membrane, so they can change shape.',
      'Cells grow in number by mitosis, which gives identical daughter cells.',
    ],
  }],
  checks: [pick('btp-ce-c1', 'Which do plant cells have that animal cells lack?', [['A cell wall', null], ['A nucleus', 'Both plant and animal cells have a nucleus.', 'part-mixup'], ['Mitochondria', 'Both have mitochondria.', 'part-mixup']], 'The wall.', undefined, 'btp-ce-step')],
};

export const BTP_ORGANISATION: Prerequisite = {
  id: 'btp-organisation',
  title: 'Levels of organisation',
  why: 'The chapter places tissues between cells and organs. You need the order cell, tissue, organ, organ system, organism.',
  connection: 'Grade 7 and 8 Curiosity: organs and organ systems',
  refresher: [{
    id: 'btp-or-step', title: 'From cell to organism',
    paragraphs: [
      'Similar cells doing the same job form a tissue. Several tissues form an organ, such as the stomach or a leaf. Organs work together as an organ system, such as the respiratory system, and organ systems make up the organism.',
      'In a single-celled organism such as Amoeba, one cell does everything.',
    ],
  }],
  checks: [pick('btp-or-c1', 'Which level comes directly after "tissue"?', [['Organ', null], ['Cell', 'Cells come before tissues; tissues are made of cells.', 'order-slip'], ['Organism', 'Organs and organ systems come before the whole organism.', 'order-slip']], 'Organ.', undefined, 'btp-or-step')],
};

export const BTP_TRANSPORT: Prerequisite = {
  id: 'btp-transport',
  title: 'Plants move water and food; animals move by muscles',
  why: 'Tissues are explained by the jobs they do. You need to recall that plants transport water and food, and animals move using muscles and bones.',
  connection: 'Grade 7 Curiosity: transport in plants; movement in animals',
  refresher: [{
    id: 'btp-tr-step', title: 'Jobs to be done',
    paragraphs: [
      'Roots absorb water and minerals, which travel up to the leaves; leaves make food, which travels to the rest of the plant. Water also evaporates from leaves through tiny pores (transpiration).',
      'Animals move when muscles pull on bones at joints, under the control of the brain and nerves.',
    ],
  }],
  checks: [pick('btp-tr-c1', 'Where is food made in most plants?', [['In the leaves', null], ['In the roots', 'Roots absorb water and minerals; leaves make food.', 'organ-mixup']], 'Leaves.', undefined, 'btp-tr-step')],
};

export const BT_PREREQUISITES: Prerequisite[] = [BTP_CELLS, BTP_ORGANISATION, BTP_TRANSPORT];

export const BT_UNITS: EduUnit[] = [
  {
    id: 'bt-unit-1', number: 1, title: 'Plant tissues',
    centralIdea: 'Meristems keep dividing to make plants longer, thicker and able to regrow; their cells then specialise into permanent tissues for protection, support and transport.',
    connection: 'Builds on plant cells and mitosis from Chapter 2.',
    vocabulary: [{ term: 'meristem', meaning: 'a tissue of actively dividing cells' }, { term: 'differentiation', meaning: 'the process by which new cells specialise for a particular job' }],
    discover: ['Why cutting root tips stops roots growing', 'How xylem and phloem differ', 'Why a fresh twig bends but a coconut husk is hard'],
    prerequisiteIds: ['btp-cells', 'btp-organisation', 'btp-transport'], lessonIds: ['bt-l1', 'bt-l2'],
  },
  {
    id: 'bt-unit-2', number: 2, title: 'Animal tissues',
    centralIdea: 'Animals have four kinds of tissue, epithelial, connective, muscular and nervous, each built to suit its job.',
    connection: 'Uses levels of organisation and animal cells.',
    vocabulary: [{ term: 'epithelium', meaning: 'tissue that covers the body and lines organs' }, { term: 'matrix', meaning: 'the material between the cells of a connective tissue' }],
    discover: ['Why lung linings are one cell thick', 'How blood and bone can both be connective tissues', 'Which muscles work without our control'],
    prerequisiteIds: ['btp-cells', 'btp-organisation'], lessonIds: ['bt-l3', 'bt-l4', 'bt-l5'],
  },
  {
    id: 'bt-unit-3', number: 3, title: 'Moving and supporting the body',
    centralIdea: 'Bones, muscles, joints, cartilage, tendons and ligaments work together, under nervous control, to move and protect the body.',
    connection: 'Combines muscle, connective and nervous tissue.',
    vocabulary: [{ term: 'joint', meaning: 'a place where two or more bones meet' }, { term: 'vertebral column', meaning: 'the backbone, a chain of small bones called vertebrae' }],
    discover: ['Why the shoulder moves in a circle but the elbow only bends', 'How the rib cage both protects and moves'],
    prerequisiteIds: ['btp-transport'], lessonIds: ['bt-l6'],
  },
];
