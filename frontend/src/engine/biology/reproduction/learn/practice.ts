/** Chapter 11 (Reproduction) practice bank and chapter assessment. Original questions; numbers checked by `__tests__/reproduction.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question, VisualRef } from '../../../education/types';
import { num, ord, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1, ref?: string): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: ref ? { kind: 'textbook-aligned', ref } : { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const REPRO_PRACTICE: PracticeSet = {
  id: 'reproduction-practice', title: 'Reproduction chapter practice',
  groups: [
    {
      id: 'g-asexual', title: 'Asexual and sexual reproduction', blurb: 'Clones, meiosis and variation (Lessons 1 and 2).',
      items: [
        item('brx-1', 'Clones', 'Identical offspring.', choose('brx-1q', 'Why does asexual reproduction produce offspring genetically identical to the parent?', [['Only one parent is involved and new cells form by mitosis', null], ['Two parents give identical chromosomes', 'Asexual reproduction has a single parent.'], ['Meiosis copies the chromosomes exactly', 'Meiosis halves the chromosomes; mitosis copies them.']], 'Mitosis, one parent.'), ['How many parents?'], ['Single parent, mitosis: clones.'], 'basic', 1, 'Revise, Reflect, Refine Q4'),
        item('brx-2', 'Farming', 'Many identical plants.', choose('brx-2q', 'A farmer wants many identical plants quickly. Which methods suit this?', [['Cuttings, grafting, layering or tissue culture', null], ['Cross-pollination and growing the seeds', 'Seeds from cross-pollination vary; they are not identical.']], 'Vegetative propagation.'), ['Asexual methods.'], ['Vegetative propagation copies the parent exactly.'], 'standard', 2, 'Revise, Reflect, Refine Q9'),
        item('brx-3', 'Combinations', 'Ten pairs.', num('brx-3q', 'How many different gametes can 10 chromosome pairs give?', 1024, '2 multiplied by itself 10 times = 1024.', { rules: [[[20], 'Multiply by 2 for every pair; do not add.'], [[100], 'That is 10 × 10; the rule is 2 multiplied by itself 10 times.']] }), ['Double for each pair.'], ['1024.'], 'challenge', 2),
        item('brx-4', 'Gametes', 'Haploid.', num('brx-4q', 'A rice plant’s body cells have 24 chromosomes. How many does its egg cell have?', 12, '24 ÷ 2 = 12.', { rules: [[[24], 'Egg cells come from meiosis and have half the number.']] }), ['Halve.'], ['12.'], 'basic'),
      ],
    },
    {
      id: 'g-plants', title: 'Flowering plants', blurb: 'Flowers, pollination and seeds (Lessons 3 and 4).',
      items: [
        item('brx-5', 'Pollination', 'Anthers removed.', choose('brx-5q', 'A flower’s anthers are removed before it matures, and pollen from another plant of the same kind is dusted on its stigma. Seeds form. Which process was ensured?', [['Cross-pollination', null], ['Self-pollination', 'Its own anthers were removed, so its own pollen could not reach it.'], ['Tissue culture', 'Tissue culture grows plants from cells in a lab, not by pollination.']], 'Pollen from another plant.'), ['Whose pollen?'], ['Cross-pollination.'], 'basic', 1, 'Revise, Reflect, Refine Q1'),
        item('brx-6', 'Order', 'Stages.', ord('brx-6q', 'Arrange the stages in order.', [{ id: 'a', text: 'Pollination', needs: [] }, { id: 'b', text: 'Pollen germinates on the stigma', needs: ['a'] }, { id: 'c', text: 'Fertilisation', needs: ['b'] }, { id: 'd', text: 'Zygote formation', needs: ['c'] }], ['b', 'd', 'a', 'c'], 'Pollination, germination, fertilisation, zygote.'), ['Pollen lands first.'], ['Pollination → germination → fertilisation → zygote.'], 'standard', 2, 'Revise, Reflect, Refine Q2'),
        item('brx-7', 'Pollen per seed', 'Table 11.3.', num('brx-7q', 'An insect-pollinated flower releases 24 000 pollen grains and forms 800 seeds. How many grains per seed?', 30, '24 000 ÷ 800 = 30.', { rules: [[[19200000], 'Divide pollen by seeds; do not multiply.']] }), ['Pollen ÷ seeds.'], ['30.'], 'standard'),
        item('brx-8', 'Tomato, wheat, papaya', 'Kinds of pollination.', choose('brx-8q', 'Papaya trees usually carry either male or female flowers, not both. Their pollination must be…', [['cross-pollination', null], ['self-pollination', 'A female tree has no anthers of its own, so pollen must come from another tree.']], 'Separate trees.'), ['Can a female tree pollinate itself?'], ['Pollen must come from a male tree: cross-pollination.'], 'challenge', 2, 'Revise, Reflect, Refine Q11'),
        item('brx-9', 'Apples and bees', 'Pollinators.', choose('brx-9q', 'Apple yields fall as natural pollinators decline. Farmers who keep beehives in their orchards are most likely testing whether…', [['adding bees as pollinators increases fruit setting', null], ['bees make apples sweeter by adding honey', 'Bees pollinate the flowers; the honey is a separate product.'], ['bees stop fruit from forming', 'Pollinators help fruits form; the test is whether more bees mean more fruit.']], 'Pollination limits yield.'), ['What do bees do in flowers?'], ['More pollinators → more pollination → more fruit set.'], 'challenge', 2, 'Revise, Reflect, Refine Q12'),
      ],
    },
    {
      id: 'g-humans', title: 'Animals and humans', blurb: 'Strategies, gametes and the cycle (Lessons 5 and 6).',
      items: [
        item('brx-10', 'External fertilisation', 'Eggs.', choose('brx-10q', 'Which animal from Table 11.4 has external fertilisation and lays the most eggs at a time?', [['Frog', null], ['Lizard', 'Lizards fertilise internally and lay 2 to 20 eggs.'], ['Bird', 'Birds fertilise internally and lay 1 to 15 eggs.']], 'The frog lays the most.'), ['Water, many eggs.'], ['Frog: 5000 to 50 000 eggs.'], 'basic'),
        item('brx-11', 'Next period', 'Calendar.', num('brx-11q', 'A period starts on 10 June and the cycle is 30 days long. On what date in July is the next period expected? (Give the day of the month.)', 10, '10 June + 30 days = 10 July.', { rules: [[[8], 'June has 30 days, so adding 30 days to 10 June gives 10 July.']] }), ['June has 30 days.'], ['10 July.'], 'standard', 2, 'Pause and Ponder 7'),
        item('brx-12', 'Periods stop', 'Pregnancy.', choose('brx-12q', 'Why does the menstrual cycle stop during pregnancy?', [['The uterus lining must stay to nourish the developing baby, so it is not shed', null], ['The ovaries are removed', 'Nothing is removed; the lining is simply kept.'], ['Pregnancy uses up all the blood', 'Blood supply to the uterus actually increases.']], 'Lining kept.'), ['What does the lining do?'], ['The lining nourishes the embryo, so it is not shed.'], 'standard', 2, 'Revise, Reflect, Refine Q5'),
      ],
    },
  ],
};

export const REPRO_ASSESSMENT: ChapterAssessment = {
  id: 'reproduction-assessment-1',
  title: 'Reproduction: How Life Continues: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'bra-1', topic: 'Budding', lessonId: 'br-l1', competency: 'knowledge', marks: 1, prompt: 'Yeast.', question: choose('bra-1q', 'Yeast reproduces asexually by…', [['budding', null], ['spore formation in sacs', 'Spore sacs are typical of bread mould.'], ['layering', 'Layering is a gardening method for plants.']], 'Hydra and yeast form buds.'), solution: ['Yeast forms small outgrowths (buds).'] },
        { id: 'bra-2', topic: 'Flower', lessonId: 'br-l3', competency: 'knowledge', marks: 1, prompt: 'Female part.', question: choose('bra-2q', 'The female part of a flower is the…', [['pistil', null], ['stamen', 'The stamen is the male part.'], ['sepal', 'Sepals protect the bud.']], 'Pistil.'), solution: ['Pistil: stigma, style and ovary.'] },
        { id: 'bra-3', topic: 'Ovulation', lessonId: 'br-l6', competency: 'knowledge', marks: 1, prompt: 'Definition.', question: choose('bra-3q', 'Ovulation is…', [['the release of a mature egg from an ovary', null], ['the shedding of the uterus lining', 'That is menstruation.'], ['the fusion of sperm and egg', 'That is fertilisation.']], 'Egg released.'), solution: ['Ovulation: an ovary releases a mature egg.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'bra-4', topic: 'Combinations', lessonId: 'br-l2', competency: 'application', marks: 2, prompt: 'Bead model.', question: num('bra-4q', 'How many different gametes can 5 chromosome pairs give?', 32, '2 × 2 × 2 × 2 × 2 = 32.', {}), solution: ['Each pair gives 2 choices.', '2 multiplied by itself 5 times = 32.'] },
        { id: 'bra-5', topic: 'Zygote', lessonId: 'br-l2', competency: 'application', marks: 2, prompt: 'Chromosomes.', question: num('bra-5q', 'A cat’s egg and sperm each have 19 chromosomes. How many does the zygote have?', 38, '19 + 19 = 38.', {}), solution: ['The zygote gets chromosomes from both gametes: 19 + 19 = 38.'] },
        { id: 'bra-6', topic: 'Bagging', lessonId: 'br-l3', competency: 'application', marks: 2, prompt: 'Pea.', question: choose('bra-6q', 'Which pea treatment forms no pod?', [['A bud with its stamens removed, then bagged', null], ['An open flower, bagged', 'It pollinated itself, so it forms a pod.'], ['An open flower with stamens removed, bagged', 'It had already pollinated itself before the stamens were removed.']], 'No pollen reached it.'), solution: ['Only the bud with stamens removed and bagged received no pollen.'] },
        { id: 'bra-7', topic: 'Cycle', lessonId: 'br-l6', competency: 'application', marks: 2, prompt: 'Next period.', question: num('bra-7q', 'A period starts on 3 January and the cycle is 28 days long. On which date in January is the next period expected? (Give the day of the month.)', 31, '3 + 28 = 31 January.', {}), solution: ['January has 31 days.', '3 January + 28 days = 31 January.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'bra-8', topic: 'Disease risk', lessonId: 'br-l1', competency: 'analysis', marks: 2, prompt: 'Clones.', question: choose('bra-8q', 'Why are vegetatively propagated plants more vulnerable to disease than plants grown from seed?', [['They are genetically identical, so none has variation that might resist a new disease', null], ['They have weaker roots', 'Propagated plants can have strong roots; the issue is lack of variation.'], ['They cannot photosynthesise', 'They photosynthesise normally.']], 'No variation.'), solution: ['Clones share the same genes.', 'A disease that attacks one can attack all.'] },
        { id: 'bra-9', topic: 'Wind pollination', lessonId: 'br-l4', competency: 'analysis', marks: 2, prompt: 'Data.', question: choose('bra-9q', 'Table 11.3 shows wind-pollinated grasses release far more pollen but form fewer seeds than sunflowers. What does this show?', [['Wind pollination wastes most pollen, so plants make huge amounts to succeed', null], ['Wind pollination is more efficient per pollen grain', 'It needs about 6000 grains per seed, against about 33 for insects.'], ['Grasses do not need pollination', 'They do; wind carries their pollen.']], 'Wasteful but effective.'), solution: ['About 6000 grains per seed for wind, about 33 for insects.', 'Large amounts make up for the losses.'] },
        { id: 'bra-10', topic: 'Eggs and survival', lessonId: 'br-l5', competency: 'analysis', marks: 2, prompt: 'Strategies.', question: choose('bra-10q', 'Birds lay 1 to 15 eggs but fish lay thousands. The best explanation is…', [['Internal fertilisation and parental care protect bird young, so fewer eggs are needed', null], ['Birds cannot make more eggs because they fly', 'Flight is not the reason; protection of the young is.'], ['Fish eggs are all eaten, so fish give up on survival', 'Some fish young survive; large numbers make up for losses.']], 'Protection versus numbers.'), solution: ['Unprotected eggs in water suffer heavy losses.', 'Protected eggs survive better, so fewer are needed.'] },
      ],
    },
  ],
};

/** Diagrams shown with the worked solutions of these practice items. */
export const REPRO_SOLUTION_DIAGRAMS: Record<string, VisualRef> = {
  'brx-4': { kind: 'halving', props: {}, alt: 'Gametes carry half the chromosomes, so fertilisation restores the full number.' },
  'brx-5': { kind: 'pollinationKinds', props: {}, alt: 'Self-pollination and cross-pollination compared.' },
  'brx-6': { kind: 'pollenToSeed', props: {}, alt: 'Pollen lands, the pollen tube grows, fertilisation forms a zygote, and the ovule becomes a seed.' },
  'brx-12': { kind: 'implantation', props: {}, alt: 'The embryo implants in the thick uterus lining, which must stay in place during pregnancy.' },
};
