/**
 * Chapter 11, Units 1 and 2 (Lessons 1 to 3): asexual reproduction and vegetative propagation, sexual reproduction with
 * meiosis and variation, and the flower and pollination. Aligned to NCERT Exploration (2026-27) Sections 11.1 to 11.2.3 and
 * Activities 11.1 to 11.6. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';

export const REPRO_LAB = '/biology/reproduction/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const R1: EduLesson = {
  id: 'br-l1', unitId: 'br-unit-1', number: 1, title: 'Asexual reproduction: one parent, identical offspring',
  objective: 'describe vegetative propagation, budding and spore formation, explain why asexual offspring are identical clones, and say why farmers use cutting, grafting, layering and tissue culture.',
  prerequisiteIds: ['brp-division'],
  objectives: [
    { id: 'methods', label: 'Describe vegetative propagation, budding and spore formation' },
    { id: 'clones', label: 'Explain why asexual offspring are clones' },
    { id: 'farming', label: 'Explain how farmers use vegetative propagation' },
  ],
  steps: [
    {
      id: 'br1-plants', title: 'New plants without seeds', phase: 'observe',
      paragraphs: [
        'Every organism is born, grows, reproduces and dies; reproduction is how life continues. A potato or ginger sprouts new plants from its underground stem, a money plant or sugarcane cutting takes root, and a Bryophyllum leaf grows tiny plantlets along its edge. These are examples of vegetative propagation: new plants from the growing parts of one parent.',
        'Gardeners copy this. In cutting, a piece of stem with nodes is planted. In grafting, a stem from one variety is fitted into a slit on a rooted plant of another. In layering, a bendy twig is buried until it roots, then cut free. Tissue culture grows many healthy banana plantlets from shoot tips.',
      ],
      check: pick('chk-br1-plants', 'Why do farmers propagate a good mango or rose variety by grafting rather than by seed?', [['Grafted plants are identical to the chosen variety', null], ['Grafting produces more variation', 'Grafting is asexual, so it produces copies, not variation.', 'asexual-variation'], ['Seeds of mango cannot grow', 'Mango seeds do grow, but the plants may differ from the parent.', 'irrelevant-cause']], 'Identical copies.', undefined, 'br1-plants'),
    },
    {
      id: 'br1-budding', title: 'Buds and spores', phase: 'observe',
      paragraphs: [
        'Put a pinch of yeast in warm sugar solution and look after an hour or two: some cells have small round outgrowths. These buds grow and separate from the parent. Hydra, a small water animal, also forms buds by repeated cell division at one spot.',
        'Moist bread kept warm and dark grows a fuzzy mould. Under the microscope it shows threads (hyphae) ending in round sacs full of spores. Spores are light, made in millions and carried by air; on moist food they germinate quickly. Louis Pasteur showed that such life always comes from existing life, not from non-living matter.',
      ],
      visual: v('microscope', { specimen: 'yeast', objective: 40, editable: true, specimens: ['yeast', 'mould'] }, 'The virtual microscope showing budding yeast cells and bread mould with its spore sacs.'),
      check: pick('chk-br1-budding', 'Where did the mould on the bread come from?', [['Spores from the air that settled on the moist bread', null], ['The bread itself turned into mould', 'Living things come only from living things; the bread does not turn into mould.', 'spontaneous'], ['The water added to the bread', 'Boiled water was used; the spores came from the air.', 'irrelevant-cause']], 'Spores in the air.', undefined, 'br1-budding'),
    },
    {
      id: 'br1-clones', title: 'Why the offspring are identical', phase: 'reasoning',
      paragraphs: [
        'In every one of these methods, new cells form by mitosis, which copies the chromosomes exactly. The offspring are therefore genetically identical to the single parent: they are clones.',
        'This is fast and lets a population grow quickly when conditions are good. The cost is that all the clones share the same weaknesses: a disease that attacks one can attack them all.',
      ],
      check: pick('chk-br1-clones', 'Why are vegetatively propagated crops often more vulnerable to disease?', [['They are all genetically identical, so a disease that harms one can harm all', null], ['They have no roots', 'Vegetatively propagated plants grow normal roots.', 'irrelevant-cause'], ['They reproduce too slowly', 'Asexual reproduction is usually fast.', 'irrelevant-cause']], 'No variation.', undefined, 'br1-clones'),
    },
  ],
  investigation: { title: 'Look for buds and spores', description: 'Use the virtual microscope on yeast and bread mould.', href: `${REPRO_LAB}?view=microscope`, buttonLabel: 'Open the microscope' },
  worked: {
    id: 'w-br-l1', title: 'Choosing a method for a farmer',
    given: ['A farmer wants thousands of identical, disease-free banana plants quickly.'],
    ask: 'Suggest a method and explain why it works.',
    steps: [
      { text: 'Use tissue culture from the shoot tip (apical meristem).', why: 'Meristem cells divide rapidly and can grow into whole plants in a nutrient medium.' },
      { text: 'All the plantlets come from one healthy parent by mitosis, so they are identical and share its good qualities.', why: 'Asexual reproduction produces clones.' },
      { text: 'Starting from clean shoot tips helps keep out virus-infected material.', why: 'The new plants start disease-free.' },
    ],
    verify: 'Fast, identical and healthy: the three things the farmer asked for.',
  },
  guided: {
    id: 'g-br-l1', prompt: 'Match organisms to methods and order a layering.',
    steps: [
      { id: 'g1', prompt: 'Method.', question: pick('br-g1-1', 'Hydra reproduces asexually by…', [['budding', null], ['spore formation', 'Spores are typical of moulds; Hydra forms buds.', 'method-swap'], ['grafting', 'Grafting is a technique people use on plants.', 'method-swap']], 'Hydra and yeast form buds.'), hints: ['Outgrowth on the body.'] },
      { id: 'g2', prompt: 'Order.', question: ord('br-g1-2', 'Order the steps of layering a lemon twig.', [{ id: 'a', text: 'Bend a flexible twig and bury its middle in soil', needs: [] }, { id: 'b', text: 'Water it until roots grow from the buried part', needs: ['a'] }, { id: 'c', text: 'Cut the rooted twig from the parent plant', needs: ['b'] }], ['c', 'b', 'a'], 'Bury, root, cut.'), hints: ['Roots must form before cutting.'] },
    ],
    conclusion: 'Hydra and yeast bud, moulds make spores, and gardeners use cutting, grafting and layering.',
  },
  independent: [
    ind('i1', 'Bryophyllum', 'methods', 'Leaves.', pick('br-l1-i1', 'Bryophyllum makes new plants from…', [['plantlets on the edges of its leaves', null], ['spores', 'Bryophyllum is a flowering plant; spores are made by moulds.', 'method-swap'], ['seeds only', 'Its leaves can produce new plants without seeds.', 'method-swap']], 'Leaf plantlets.'), ['Look at the leaf edge.'], ['Leaf plantlets: vegetative propagation.']),
    ind('i2', 'Clones', 'clones', 'Mitosis.', pick('br-l1-i2', 'Asexual offspring are identical to the parent because…', [['their cells are made by mitosis from one parent', null], ['two parents mix their chromosomes', 'Mixing two parents happens in sexual reproduction.', 'asexual-variation'], ['meiosis halves the chromosomes', 'Meiosis is for gametes; asexual reproduction does not use gametes.', 'mitosis-meiosis']], 'One parent, mitosis.'), ['Which division copies exactly?'], ['Mitosis from a single parent.']),
    ind('i3', 'Refrigeration', 'methods', 'Spoilage.', pick('br-l1-i3', 'Why does food last longer in a refrigerator?', [['Low temperature slows the growth and reproduction of moulds and bacteria', null], ['Cold kills every spore instantly', 'Cold slows spores and microbes; it does not kill them all.', 'cold-kills'], ['There is no air in a refrigerator', 'There is air; the low temperature is what matters.', 'irrelevant-cause']], 'Cold slows growth.'), ['What do mould spores need?'], ['Warmth and moisture; cold slows them.']),
  ],
  reflection: {
    discover: 'Asexual reproduction, by vegetative propagation, budding or spores, makes clones by mitosis: fast and reliable but without variation.',
    evidence: 'You explained buds, spores and clones and chose a propagation method for a farmer.',
    stillConfusing: [
      { text: 'Why are clones identical?', refresherId: 'br1-clones' },
      { text: 'Cutting, grafting or layering?', refresherId: 'br1-plants' },
    ],
  },
};

export const R2: EduLesson = {
  id: 'br-l2', unitId: 'br-unit-1', number: 2, title: 'Sexual reproduction and variation',
  objective: 'explain why gametes must have half the chromosome number, calculate the number of gamete combinations from chromosome pairs, and explain why variation helps species survive.',
  prerequisiteIds: ['brp-division'],
  objectives: [
    { id: 'halving', label: 'Explain why meiosis halves the chromosome number' },
    { id: 'combinations', label: 'Calculate gamete combinations' },
    { id: 'variation', label: 'Explain why variation matters' },
  ],
  steps: [
    {
      id: 'br2-halving', title: 'The doubling problem', phase: 'conjecture',
      paragraphs: [
        'In sexual reproduction two parents both give genetic material. If each passed on all its chromosomes, the number would double every generation. Meiosis solves this: each gamete gets one chromosome from every pair, half the number.',
        'Human body cells have 23 pairs, 46 chromosomes. Sperm and eggs each have 23. When they fuse, the zygote has 46 again. In animals the male gametes are sperm and the female gametes are eggs; in plants, pollen grains deliver male gametes to ovules containing eggs.',
      ],
      check: pick('chk-br2-halving', 'Why must gametes have half the chromosome number?', [['So that fertilisation restores the normal number instead of doubling it', null], ['So that gametes can swim faster', 'Speed has nothing to do with the chromosome number.', 'irrelevant-cause'], ['Because half the chromosomes are not needed', 'All the chromosomes are needed; the zygote gets a full set from two gametes.', 'half-unneeded']], 'Keep the number constant.', undefined, 'br2-halving'),
    },
    {
      id: 'br2-beads', title: 'Counting combinations', phase: 'observe',
      paragraphs: [
        'Model three chromosome pairs with three pairs of beads, light and dark green, light and dark blue, light and dark red. Make a gamete by picking one bead from each pair at random. With three pairs there are 2 × 2 × 2 = 8 possible combinations.',
        'Each extra pair doubles the number. With 23 pairs there are 2 multiplied by itself 23 times, 8 388 608 different gametes from one person, before counting the partner. This is why children resemble their parents but are not identical to them or to their brothers and sisters.',
      ],
      visual: v('beadCombos', { pairs: 3, editable: true }, 'Bead pairs standing for chromosome pairs. Draw random gametes and see how the number of possible combinations grows with each pair.'),
      check: pick('chk-br2-beads', 'With 4 chromosome pairs, how many different gametes are possible?', [['16', null], ['8', 'That is for 3 pairs; each extra pair doubles it.', 'combo-count'], ['4 × 2 = 8', 'Combinations multiply by 2 for every pair: 2 × 2 × 2 × 2.', 'combo-count']], '2 × 2 × 2 × 2 = 16.', undefined, 'br2-beads'),
    },
    {
      id: 'br2-variation', title: 'Why variation matters', phase: 'reasoning',
      paragraphs: [
        'Random mixing gives every individual a unique combination. In a changing environment, some variants survive and reproduce better: some people tolerate the low oxygen of high altitudes, and some digest milk as adults.',
        'Over many generations such differences add up and contribute to evolution. A species with variation is less likely to be wiped out by one disease or one change in climate.',
      ],
      check: pick('chk-br2-variation', 'If a plant could only ever self-pollinate for many generations, its genetic diversity would…', [['fall, because no new combinations come in from other plants', null], ['rise, because it reproduces sexually', 'Sexual reproduction with only one parent mixes very little; diversity falls.', 'self-diversity'], ['stay exactly the same as in a cross-pollinating plant', 'Cross-pollination brings in chromosomes from another plant; self-pollination does not.', 'self-diversity']], 'Less mixing.', undefined, 'br2-variation'),
    },
  ],
  investigation: { title: 'Draw bead gametes', description: 'Pick random gametes and count the combinations.', href: `${REPRO_LAB}?view=beads`, buttonLabel: 'Open the bead model' },
  worked: {
    id: 'w-br-l2', title: 'Combinations from five pairs',
    given: ['An organism has 5 pairs of chromosomes.'],
    ask: 'How many different gametes can it make by independent sorting, and how many chromosomes does each gamete have?',
    steps: [
      { text: 'Each pair gives 2 choices, so the number is 2 × 2 × 2 × 2 × 2 = 32.', why: 'Independent choices multiply.' },
      { text: 'Each gamete has one chromosome from each pair: 5 chromosomes.', why: 'Meiosis gives one of each pair, half of 10.' },
    ],
    verify: '32 combinations, each with 5 chromosomes; a zygote has 5 + 5 = 10.',
  },
  guided: {
    id: 'g-br-l2', prompt: 'Work with chromosome numbers.',
    steps: [
      { id: 'g1', prompt: 'Gamete.', question: num('br-g2-1', 'A dog’s body cells have 78 chromosomes. How many are in its sperm?', 39, '78 ÷ 2 = 39.', { rules: [[[78], 'Gametes have half the number.', 'mitosis-meiosis']] }), hints: ['Half.'] },
      { id: 'g2', prompt: 'Combinations.', question: num('br-g2-2', 'How many gamete combinations do 6 chromosome pairs give?', 64, '2 × 2 × 2 × 2 × 2 × 2 = 64.', { rules: [[[12], 'Multiply by 2 for each pair; do not add.', 'combo-count'], [[36], 'That is 6 × 6; the rule is 2 multiplied by itself 6 times.', 'combo-count']] }), hints: ['Double for each pair.'] },
    ],
    conclusion: 'Halving keeps the number constant; doubling for each pair creates huge variety.',
  },
  independent: [
    ind('i1', 'Zygote', 'halving', 'Humans.', num('br-l2-i1', 'A human zygote has just formed. How many chromosomes does it have?', 46, '23 + 23 = 46.', { rules: [[[23], 'The zygote has chromosomes from both gametes: 23 + 23.', 'one-gamete']] }), ['Egg plus sperm.'], ['46.']),
    ind('i2', 'Combinations', 'combinations', 'Two pairs.', num('br-l2-i2', 'How many different gametes can 2 chromosome pairs give?', 4, '2 × 2 = 4.', { rules: [[[2], 'Each of the 2 pairs has 2 choices: 2 × 2.', 'combo-count']] }), ['2 × 2.'], ['4.']),
    ind('i3', 'Siblings', 'variation', 'Why different.', pick('br-l2-i3', 'Why are brothers and sisters (other than identical twins) different from each other?', [['Each came from a different random combination of chromosomes in the gametes', null], ['They have different numbers of chromosomes', 'All have 46 chromosomes; the combinations differ.', 'number-not-combo'], ['Only one parent passed on genes', 'Both parents contribute to every child.', 'one-parent']], 'Random mixing.'), ['Think of the beads.'], ['Different gametes, different combinations.']),
  ],
  reflection: {
    discover: 'Meiosis halves the chromosome number so fertilisation restores it, and random sorting of pairs makes 2 to the power of the number of pairs different gametes, the source of variation.',
    evidence: 'You counted combinations, halved chromosome numbers and explained why siblings differ.',
    stillConfusing: [
      { text: 'Why halve the chromosomes?', refresherId: 'br2-halving' },
      { text: 'How do combinations grow?', refresherId: 'br2-beads' },
    ],
  },
};

export const R3: EduLesson = {
  id: 'br-l3', unitId: 'br-unit-2', number: 3, title: 'The flower and pollination',
  objective: 'name the parts of a flower and their jobs, interpret the pea bagging experiment to show that pollination is needed for fruit, and distinguish self- from cross-pollination.',
  prerequisiteIds: ['brp-plant'],
  objectives: [
    { id: 'parts', label: 'Name the parts of a flower and their jobs' },
    { id: 'experiment', label: 'Interpret the pollination experiment' },
    { id: 'kinds', label: 'Distinguish self- and cross-pollination' },
  ],
  steps: [
    {
      id: 'br3-parts', title: 'Four whorls', phase: 'observe',
      paragraphs: [
        'Flowering plants (angiosperms) reproduce with flowers. A complete flower has four parts: green sepals protect the bud; coloured petals attract pollinators; stamens are the male parts; the pistil is the female part.',
        'Each stamen has a filament holding up an anther, which makes pollen grains containing male gametes. The pistil has a stigma at the tip, often sticky, a thin style, and a swollen ovary at the base containing ovules, each with an egg cell.',
      ],
      visual: v('flowerParts', { part: 'anther', editable: true }, 'A cut-open flower. Tap each part, sepal, petal, anther, filament, stigma, style, ovary and ovule, to see its job.'),
      check: pick('chk-br3-parts', 'Which part makes pollen grains?', [['Anther', null], ['Stigma', 'The stigma receives pollen; it does not make it.', 'part-swap'], ['Ovary', 'The ovary contains ovules with eggs.', 'part-swap']], 'Anther.', undefined, 'br3-parts'),
    },
    {
      id: 'br3-bags', title: 'The pea bagging experiment', phase: 'conjecture',
      paragraphs: [
        'On a pea plant, choose buds and freshly opened flowers. Remove the stamens from one bud and one flower. Loosely wrap muslin bags around the treated bud and flower, and around one untouched bud and one untouched flower, leaving one flower open. Watch which become pods.',
        'Fruit forms in every treatment except the bud whose stamens were removed and which was bagged. Pea flowers pollinate themselves as they open, so the opened flower was already pollinated; the bud with no stamens and a bag around it never received pollen. Transfer of pollen from anther to stigma, pollination, is needed for fruit.',
      ],
      prediction: { id: 'pr-br3-bags', prompt: 'Predict: which treatment will NOT form a pod?', options: [{ id: 'p1', text: 'The open flower, not bagged' }, { id: 'p2', text: 'The bud with stamens removed, bagged' }, { id: 'p3', text: 'The bud, bagged, with stamens left in' }], expectedId: 'p2', reveal: 'Only the bud with stamens removed and bagged fails: it had no pollen of its own and the bag kept out pollen from elsewhere.' },
      visual: v('pollinationTest', { editable: true }, 'The five pea flower treatments. Run the experiment to see which ones form pods and why.'),
      check: pick('chk-br3-bags', 'What does the experiment show?', [['Pollen must reach the stigma for fruit to form', null], ['Bags stop flowers from making fruit', 'Several bagged flowers still made pods.', 'bag-blocks'], ['Removing stamens always stops fruit', 'The opened flower with stamens removed still made a pod.', 'stamens-always']], 'Pollination is needed.', undefined, 'br3-bags'),
    },
    {
      id: 'br3-kinds', title: 'Self and cross', phase: 'reasoning',
      paragraphs: [
        'Self-pollination: pollen reaches the stigma of the same flower or another flower on the same plant. Cross-pollination: pollen from a flower of one plant reaches a flower of another plant of the same kind.',
        'Cross-pollination mixes the chromosomes of two different plants, so it creates more variation. Plant breeders remove the stamens from a flower, bag it to stop self-pollination, and dust on pollen from a chosen plant: artificial cross-pollination.',
      ],
      check: pick('chk-br3-kinds', 'Anthers are removed from a flower before it matures, and pollen from another plant is dusted on its stigma. This ensures…', [['cross-pollination', null], ['self-pollination', 'The flower’s own anthers were removed, so its own pollen cannot reach it.', 'self-cross'], ['tissue culture', 'Tissue culture grows plants from cells; this is pollination.', 'method-swap']], 'Pollen from another plant.', undefined, 'br3-kinds'),
    },
  ],
  investigation: { title: 'Run the pea bagging experiment', description: 'Try all five treatments and see which form pods.', href: `${REPRO_LAB}?view=pollination`, buttonLabel: 'Open the experiment' },
  worked: {
    id: 'w-br-l3', title: 'Explaining one result',
    given: ['An opened pea flower had its stamens removed and was then bagged.', 'It still formed a pod.'],
    ask: 'Explain why.',
    steps: [
      { text: 'Pea flowers pollinate themselves as the flower opens.', why: 'Their anthers shed pollen on to their own stigma early.' },
      { text: 'By the time the stamens were removed, pollen was already on the stigma.', why: 'Removing stamens afterwards cannot undo pollination.' },
      { text: 'Fertilisation went ahead, and the ovary became a pod.', why: 'Pollination leads to fertilisation and fruit.' },
    ],
    verify: 'Compare the bud with stamens removed: removed before any pollen was shed, it made no pod.',
  },
  guided: {
    id: 'g-br-l3', prompt: 'Identify parts and kinds of pollination.',
    steps: [
      { id: 'g1', prompt: 'Female part.', question: pick('br-g3-1', 'Which three parts make up the pistil?', [['Stigma, style and ovary', null], ['Anther and filament', 'Those make up the stamen, the male part.', 'part-swap'], ['Sepals and petals', 'Those are the outer whorls.', 'part-swap']], 'Stigma, style, ovary.'), hints: ['From tip to base.'] },
      { id: 'g2', prompt: 'Maize.', question: pick('br-g3-2', 'Two maize varieties grow side by side; seeds form only when pollen from one reaches the other. This is…', [['cross-pollination', null], ['self-pollination', 'The pollen comes from a different plant.', 'self-cross']], 'Another plant.'), hints: ['Same plant or different?'] },
    ],
    conclusion: 'The pistil receives pollen; pollen from a different plant means cross-pollination.',
  },
  independent: [
    ind('i1', 'Sepals', 'parts', 'Job.', pick('br-l3-i1', 'Sepals mainly…', [['protect the flower in the bud', null], ['make pollen', 'Pollen is made by anthers.', 'part-swap'], ['become the fruit', 'The ovary becomes the fruit.', 'part-swap']], 'Protection.'), ['Green outer whorl.'], ['They protect the bud.']),
    ind('i2', 'Ovule', 'parts', 'Contents.', pick('br-l3-i2', 'Each ovule contains…', [['an egg cell', null], ['pollen grains', 'Pollen comes from the anther.', 'part-swap']], 'The female gamete.'), ['Female gamete.'], ['An egg cell.']),
    ind('i3', 'Experiment', 'experiment', 'Control.', pick('br-l3-i3', 'Why is one flower left open and untouched in the experiment?', [['As a control showing normal fruit formation to compare with', null], ['Because the experimenters ran out of bags', 'It is a deliberate control, not an accident.', 'control-purpose']], 'A control.'), ['Compare with what?'], ['It shows what happens without any treatment.']),
    ind('i4', 'Kinds', 'kinds', 'Variation.', pick('br-l3-i4', 'Which kind of pollination produces more variation?', [['Cross-pollination', null], ['Self-pollination', 'Self-pollination uses only one plant’s chromosomes.', 'self-diversity']], 'Two plants.'), ['Two parents or one?'], ['Cross-pollination mixes two plants.']),
  ],
  reflection: {
    discover: 'A flower’s anthers make pollen and its pistil receives it; the bagging experiment shows that pollination is needed for fruit, and cross-pollination brings variation.',
    evidence: 'You named flower parts, explained the pea results and distinguished self- from cross-pollination.',
    stillConfusing: [
      { text: 'Which flower part does what?', refresherId: 'br3-parts' },
      { text: 'Why did only one treatment fail?', refresherId: 'br3-bags' },
    ],
  },
};
