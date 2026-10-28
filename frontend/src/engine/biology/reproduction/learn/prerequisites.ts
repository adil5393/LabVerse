/** Chapter 11 (Reproduction: How Life Continues): prerequisites and units. Short optional refreshers; they never block a lesson. */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { num, pick } from '../../../education/builders';

export const BRP_DIVISION: Prerequisite = {
  id: 'brp-division',
  title: 'Mitosis and meiosis',
  why: 'Asexual reproduction uses mitosis and sexual reproduction depends on meiosis. You need to recall what each does to the chromosome number.',
  connection: 'Chapter 2: Cell, Section 2.4',
  refresher: [{
    id: 'brp-di-step', title: 'Two kinds of division',
    paragraphs: [
      'Mitosis gives two daughter cells identical to the parent, with the same number of chromosomes.',
      'Meiosis happens in reproductive organs and gives four cells, each with half the chromosomes. These are gametes.',
    ],
  }],
  checks: [num('brp-di-c1', 'A cell with 20 chromosomes divides by mitosis. How many chromosomes does each daughter cell have?', 20, 'Mitosis keeps the number.', { rules: [[[10], 'Halving happens in meiosis; mitosis keeps the number.', 'mitosis-meiosis']], refresherId: 'brp-di-step' })],
};

export const BRP_PLANT: Prerequisite = {
  id: 'brp-plant',
  title: 'Seeds, fruits and plant parts',
  why: 'The chapter follows how flowers become fruits and seeds. You need to recall the main parts of a plant and that seeds grow into new plants.',
  connection: 'Grade 6 to 8 Curiosity: parts of a plant, seeds and germination',
  refresher: [{
    id: 'brp-pl-step', title: 'From seed to plant',
    paragraphs: [
      'A flowering plant has roots, a stem, leaves and flowers. Fruits form from flowers and carry seeds.',
      'When water, air and warmth are right, a seed germinates and grows into a new plant.',
    ],
  }],
  checks: [pick('brp-pl-c1', 'Fruits develop from…', [['flowers', null], ['roots', 'Roots absorb water; fruits come from flowers.', 'organ-mixup']], 'Flowers.', undefined, 'brp-pl-step')],
};

export const BRP_GROWING: Prerequisite = {
  id: 'brp-growing',
  title: 'Changes during adolescence',
  why: 'The human section links puberty to the reproductive system. You need to recall that bodies change during adolescence because of hormones.',
  connection: 'Grade 7 Curiosity: adolescence and changes in the body',
  refresher: [{
    id: 'brp-gr-step', title: 'Puberty',
    paragraphs: [
      'During adolescence, chemical messengers called hormones bring about physical and emotional changes. Boys may grow taller with broader shoulders and a deeper voice; girls begin menstruation.',
      'These changes happen at different ages in different people, and all of them are normal.',
    ],
  }],
  checks: [pick('brp-gr-c1', 'The changes of puberty are brought about by…', [['hormones', null], ['exercise alone', 'Exercise keeps the body healthy, but puberty is triggered by hormones.', 'cause-mixup']], 'Hormones.', undefined, 'brp-gr-step')],
};

export const BR_PREREQUISITES: Prerequisite[] = [BRP_DIVISION, BRP_PLANT, BRP_GROWING];

export const BR_UNITS: EduUnit[] = [
  {
    id: 'br-unit-1', number: 1, title: 'One parent or two',
    centralIdea: 'Asexual reproduction copies one parent by mitosis; sexual reproduction mixes two parents’ chromosomes through meiosis and fertilisation, creating variation.',
    connection: 'Builds on mitosis and meiosis from Chapter 2.',
    vocabulary: [{ term: 'clone', meaning: 'an offspring genetically identical to its parent' }, { term: 'gamete', meaning: 'a reproductive cell with half the chromosome number (sperm or egg)' }],
    discover: ['How farmers grow identical plants by cutting, grafting and layering', 'Why siblings are never exactly alike'],
    prerequisiteIds: ['brp-division'], lessonIds: ['br-l1', 'br-l2'],
  },
  {
    id: 'br-unit-2', number: 2, title: 'Reproduction in flowering plants',
    centralIdea: 'Pollen reaches the stigma by self- or cross-pollination; a pollen tube carries the male gamete to the egg, and the ovary and ovules become fruit and seeds.',
    connection: 'Uses plant parts and gametes from Unit 1.',
    vocabulary: [{ term: 'pollination', meaning: 'the transfer of pollen from an anther to a stigma' }, { term: 'fertilisation', meaning: 'the fusion of a male and a female gamete to form a zygote' }],
    discover: ['What the bagging experiment with pea flowers shows', 'Why wind-pollinated plants make so much pollen'],
    prerequisiteIds: ['brp-plant'], lessonIds: ['br-l3', 'br-l4'],
  },
  {
    id: 'br-unit-3', number: 3, title: 'Reproduction in animals and humans',
    centralIdea: 'Animals balance the number of eggs against the protection given to the young; in humans, a monthly cycle prepares the uterus to receive a zygote.',
    connection: 'Uses gametes and fertilisation from Units 1 and 2.',
    vocabulary: [{ term: 'internal fertilisation', meaning: 'fertilisation inside the female’s body' }, { term: 'ovulation', meaning: 'the release of a mature egg from an ovary' }],
    discover: ['Why frogs lay thousands of eggs but birds only a few', 'How ovulation, the uterus lining and menstruation are linked'],
    prerequisiteIds: ['brp-growing'], lessonIds: ['br-l5', 'br-l6'],
  },
];
