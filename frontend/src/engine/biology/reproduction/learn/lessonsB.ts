/**
 * Chapter 11, Units 2 and 3 (Lessons 4 to 6): pollinators, fertilisation and seeds; reproduction in animals and the human
 * reproductive systems; the menstrual cycle, pregnancy and reproductive health. Aligned to NCERT Exploration (2026-27)
 * Sections 11.2.4 to 11.5.10, Tables 11.3 to 11.5 and Fig. 11.21. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';
import { REPRO_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const R4: EduLesson = {
  id: 'br-l4', unitId: 'br-unit-2', number: 4, title: 'Pollinators, fertilisation and seeds',
  objective: 'match flower features to wind, water, insect and bird pollination, compare pollen-to-seed ratios from Table 11.3, and describe fertilisation and how the ovary and ovules become fruit and seeds.',
  prerequisiteIds: ['brp-plant'],
  objectives: [
    { id: 'agents', label: 'Match flower features to pollinating agents' },
    { id: 'ratios', label: 'Compare pollination strategies with data' },
    { id: 'fertilisation', label: 'Describe fertilisation and seed formation' },
  ],
  steps: [
    {
      id: 'br4-agents', title: 'Wind, water, insects and birds', phase: 'reasoning',
      paragraphs: [
        'Wind-pollinated plants such as wheat, maize and rice have small, light pollen made in huge amounts and long, feathery stigmas that catch it. In water plants such as Vallisneria and Hydrilla, currents carry the pollen.',
        'Insect-pollinated flowers such as sunflower, hibiscus and marigold are brightly coloured, scented and offer nectar; their pollen is large and sticky or spiny, and the stigma is sticky. Coral tree and hibiscus flowers are also visited by birds such as sunbirds.',
      ],
      check: pick('chk-br4-agents', 'A flower is small and dull, with light, dry pollen and a long feathery stigma. It is probably pollinated by…', [['wind', null], ['insects', 'Insect flowers are usually showy and scented with sticky pollen.', 'agent-swap'], ['birds', 'Bird flowers are usually brightly coloured.', 'agent-swap']], 'Feathery stigma.', undefined, 'br4-agents'),
    },
    {
      id: 'br4-data', title: 'Lots of pollen or efficient pollen', phase: 'apply',
      paragraphs: [
        'Table 11.3 gives approximate values. A wind-pollinated grass flower releases 5 lakh to 10 lakh pollen grains and forms about 50 to 200 seeds. An insect-pollinated flower like sunflower releases 20 000 to 40 000 grains and forms about 800 to 1000 seeds.',
        'Using the middle of each range, wind needs about 750 000 ÷ 125 = 6000 pollen grains per seed, while insects need only about 30 000 ÷ 900 ≈ 33. Wind is wasteful but needs no animal helper; making enormous amounts of pollen makes up for the waste.',
      ],
      visual: v('pollinationStrategy', { editable: true }, 'A comparison of wind and insect pollination from Table 11.3: pollen released, seeds formed and pollen needed per seed.'),
      check: pick('chk-br4-data', 'Why can making a huge amount of pollen still be a good strategy for wind-pollinated plants?', [['Most pollen is lost, so making a lot ensures some reaches a stigma', null], ['Wind pollination needs no stigma', 'Wind-pollinated flowers have long, feathery stigmas.', 'agent-swap'], ['More pollen always means more seeds than insect flowers', 'Wind flowers form fewer seeds despite more pollen.', 'more-is-better']], 'Quantity beats waste.', undefined, 'br4-data'),
    },
    {
      id: 'br4-fert', title: 'From pollen to seed', phase: 'reasoning',
      paragraphs: [
        'When pollen lands on a suitable stigma, it grows a pollen tube down through the style into the ovary. A male gamete travels down the tube to the ovule and fuses with the egg cell: fertilisation. The fertilised egg, the zygote, grows into an embryo.',
        'Meanwhile the ovule becomes a seed and the ovary becomes the fruit. Seeds are spread by wind, water or animals, and germinate when water, air and temperature are right.',
      ],
      visual: v('pollenToSeed', {}, 'Four stages in a section through a pistil: pollen lands on the stigma, a pollen tube grows down the style, the male gamete fuses with the egg in the ovule, and the ovary becomes a fruit with a seed.'),
      check: pick('chk-br4-fert', 'After fertilisation, the ovary develops into…', [['the fruit', null], ['the seed', 'The ovule becomes the seed; the ovary around it becomes the fruit.', 'ovary-ovule'], ['the pollen tube', 'The pollen tube grows from the pollen grain.', 'part-swap']], 'Fruit.', undefined, 'br4-fert'),
    },
  ],
  investigation: { title: 'Compare pollination strategies', description: 'See how much pollen each strategy needs per seed.', href: `${REPRO_LAB}?view=strategies`, buttonLabel: 'Open the strategy comparison' },
  worked: {
    id: 'w-br-l4', title: 'Pollen per seed for sunflower',
    given: ['A sunflower releases about 30 000 pollen grains.', 'It forms about 900 seeds.'],
    ask: 'About how many pollen grains are needed per seed?',
    steps: [
      { text: 'Pollen per seed = 30 000 ÷ 900 ≈ 33.', why: 'Divide the pollen released by the seeds formed.' },
      { text: 'For a maize flower, 750 000 ÷ 125 = 6000 grains per seed.', why: 'Same rule with the middle of its ranges.' },
      { text: 'So insect pollination is about 180 times more efficient per grain.', why: '6000 ÷ 33 ≈ 180.' },
    ],
    verify: '33 × 900 ≈ 30 000.',
  },
  guided: {
    id: 'g-br-l4', prompt: 'Order the events and use the data.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('br-g4-1', 'Order the stages of sexual reproduction in a flowering plant.', [{ id: 'a', text: 'Pollination', needs: [] }, { id: 'b', text: 'Pollen grows a tube on the stigma', needs: ['a'] }, { id: 'c', text: 'Fertilisation', needs: ['b'] }, { id: 'd', text: 'Zygote forms and grows into an embryo', needs: ['c'] }], ['c', 'a', 'd', 'b'], 'Pollination, pollen tube, fertilisation, zygote.'), hints: ['Pollen must land first.'] },
      { id: 'g2', prompt: 'Ratio.', question: num('br-g4-2', 'A grass flower releases 600 000 pollen grains and forms 100 seeds. How many grains per seed?', 6000, '600 000 ÷ 100 = 6000.', { rules: [[[60000000], 'Divide pollen by seeds; do not multiply.', 'multiply-not-divide']] }), hints: ['Pollen ÷ seeds.'] },
    ],
    conclusion: 'Pollination → pollen tube → fertilisation → zygote; wind pollination needs thousands of grains per seed.',
  },
  independent: [
    ind('i1', 'Insects', 'agents', 'Features.', pick('br-l4-i1', 'Which feature suggests insect pollination?', [['Bright petals, scent and nectar', null], ['Long feathery stigmas', 'Feathery stigmas trap wind-blown pollen.', 'agent-swap'], ['Pollen released into water currents', 'That is water pollination.', 'agent-swap']], 'Attracting insects.'), ['What would draw a bee?'], ['Colour, scent and nectar.']),
    ind('i2', 'Ovule', 'fertilisation', 'Seed.', pick('br-l4-i2', 'After fertilisation, an ovule becomes…', [['a seed', null], ['a fruit', 'The ovary becomes the fruit.', 'ovary-ovule']], 'The ovule becomes the seed.'), ['Inside the fruit.'], ['A seed.']),
    ind('i3', 'Hibiscus', 'fertilisation', 'Next step.', pick('br-l4-i3', 'In a hibiscus flower, a pollen tube is growing down the style. What happens next?', [['Fertilisation, when the male gamete reaches the egg in the ovule', null], ['Pollination', 'Pollination already happened when pollen reached the stigma.', 'order-slip'], ['Seed dispersal', 'Seeds must form first, after fertilisation.', 'order-slip']], 'Fertilisation next.'), ['Where is the tube going?'], ['To the ovule, for fertilisation.']),
    ind('i4', 'Night flowers', 'agents', 'Colour.', pick('br-l4-i4', 'Why are many night-blooming flowers white or pale?', [['Pale flowers are easier for night-flying pollinators such as moths to see in dim light', null], ['They have no cells in their petals', 'Petals are made of cells.', 'cells-unreal'], ['White flowers need no pollination', 'They still need pollinators.', 'agent-swap']], 'Visible at night.'), ['Who visits at night?'], ['Pale colours show up in moonlight for moths.']),
  ],
  reflection: {
    discover: 'Flower features match their pollinators; wind pollination makes vast amounts of pollen per seed; fertilisation by the pollen tube turns the ovule into a seed and the ovary into a fruit.',
    evidence: 'You matched flowers to agents, calculated pollen per seed and ordered the stages to the zygote.',
    stillConfusing: [
      { text: 'What becomes the fruit and what the seed?', refresherId: 'br4-fert' },
      { text: 'Why so much pollen?', refresherId: 'br4-data' },
    ],
  },
};

export const R5: EduLesson = {
  id: 'br-l5', unitId: 'br-unit-3', number: 5, title: 'Reproduction in animals and humans',
  objective: 'compare external and internal fertilisation using Table 11.4, describe the main organs of the human male and female reproductive systems, and compare sperm and eggs.',
  prerequisiteIds: ['brp-growing'],
  objectives: [
    { id: 'strategies', label: 'Compare external and internal fertilisation' },
    { id: 'organs', label: 'Name the main human reproductive organs and their jobs' },
    { id: 'gametes', label: 'Compare sperm and eggs' },
  ],
  steps: [
    {
      id: 'br5-strategies', title: 'Many eggs or protected eggs', phase: 'reasoning',
      paragraphs: [
        'In frogs and most fish the female releases eggs into water and the male releases sperm over them: external fertilisation. Many eggs are washed away or eaten, so they lay hundreds to tens of thousands at a time. Their eggs have only enough yolk to make a larva, which feeds and later transforms into the adult, as in frogs and butterflies.',
        'In reptiles, birds and mammals, fertilisation happens inside the female’s body: internal fertilisation. The embryo is better protected, so fewer eggs are produced: a lizard lays 2 to 20, a bird 1 to 15. Reptile and bird eggs carry enough yolk for the embryo; in mammals the embryo grows inside the mother and the young are fed milk.',
      ],
      check: pick('chk-br5-strategies', 'Why do animals with external fertilisation usually produce more eggs?', [['Many eggs and young are lost to currents and predators', null], ['Their eggs are larger', 'Their eggs are usually small with little yolk.', 'egg-size'], ['They live longer', 'The number of eggs is linked to survival of the young, not to lifespan.', 'irrelevant-cause']], 'High losses.', undefined, 'br5-strategies'),
    },
    {
      id: 'br5-organs', title: 'The human reproductive systems', phase: 'reasoning',
      paragraphs: [
        'In males, sperm are made in two testes held in a pouch of skin, the scrotum, which keeps them slightly cooler than the body. The testes also make a hormone that controls sperm production and the changes of puberty. Sperm travel along the vas deferens to the urethra; the seminal vesicles and prostate gland add fluids that nourish them. Each sperm has a head with genetic material and a tail for swimming.',
        'In females, two ovaries make eggs and hormones. Oviducts (fallopian tubes) connect the ovaries to the uterus, a bag-like organ where a baby develops, which opens through the narrow cervix into the vagina.',
      ],
      check: pick('chk-br5-organs', 'Where does a baby develop?', [['In the uterus', null], ['In the ovary', 'The ovary makes eggs; the baby develops in the uterus.', 'organ-mixup'], ['In the oviduct', 'Fertilisation usually happens in the oviduct, but the baby develops in the uterus.', 'organ-mixup']], 'The uterus.', undefined, 'br5-organs'),
    },
    {
      id: 'br5-gametes', title: 'Sperm and eggs', phase: 'observe',
      paragraphs: [
        'Gametes form by meiosis in the testes and ovaries (gametogenesis), so each has 23 chromosomes instead of 46. Males make millions of tiny, actively swimming sperm with no stored food. Females release a few large eggs with stored nutrients that cannot move on their own. This difference in size, number and movement is seen in most animals.',
        'A girl’s ovaries hold millions of immature eggs from birth; from puberty, usually one mature egg is released each month.',
      ],
      visual: v('gametes', {}, 'A human egg and sperm drawn to the same scale: the egg is about 0.1 mm across and the sperm is tiny, with an enlarged view of the sperm’s head and tail.'),
      check: pick('chk-br5-gametes', 'Which statement about human gametes is correct?', [['Sperm are small, many and motile; eggs are large, few and non-motile', null], ['Eggs are small and swim to the sperm', 'Eggs are large and cannot move on their own.', 'gamete-swap'], ['Sperm contain stored nutrients for the embryo', 'Stored nutrients are in the egg.', 'gamete-swap']], 'Table 11.5.', undefined, 'br5-gametes'),
    },
  ],
  worked: {
    id: 'w-br-l5', title: 'Comparing survival',
    given: ['A frog lays 20 000 eggs and about 1 in 1000 survive to adulthood.', 'A bird lays 5 eggs and about 3 in 5 survive.'],
    ask: 'How many young survive in each case, and what does this show?',
    steps: [
      { text: 'Frog: 20 000 ÷ 1000 = 20 survivors.', why: 'Number × survival fraction.' },
      { text: 'Bird: 5 × 3 ÷ 5 = 3 survivors.', why: 'Same rule.' },
      { text: 'The frog lays 4000 times as many eggs but leaves only about seven times as many survivors.', why: 'Internal fertilisation and care protect each young bird far better.' },
    ],
    verify: 'Many unprotected eggs or few protected ones: both strategies keep the species going.',
  },
  guided: {
    id: 'g-br-l5', prompt: 'Trace the sperm and classify fertilisation.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('br-g5-1', 'Order the path of sperm in the male system.', [{ id: 'a', text: 'Testis (sperm made)', needs: [] }, { id: 'b', text: 'Vas deferens', needs: ['a'] }, { id: 'c', text: 'Urethra', needs: ['b'] }], ['c', 'a', 'b'], 'Testis, vas deferens, urethra.'), hints: ['Start where sperm are made.'] },
      { id: 'g2', prompt: 'Lizard.', question: pick('br-g5-2', 'A lizard lays 10 eggs with tough shells after mating. Its fertilisation is…', [['internal', null], ['external', 'External fertilisation happens in water with thousands of eggs.', 'internal-external']], 'Inside the female.'), hints: ['Few eggs, laid on land.'] },
    ],
    conclusion: 'Sperm go from the testes through the vas deferens to the urethra; few eggs on land suggest internal fertilisation.',
  },
  independent: [
    ind('i1', 'Scrotum', 'organs', 'Temperature.', pick('br-l5-i1', 'Why are the testes held in the scrotum outside the body?', [['Sperm form best slightly below normal body temperature', null], ['To make eggs', 'Testes make sperm, not eggs.', 'organ-mixup']], 'Cooler.'), ['Temperature.'], ['Slightly cooler conditions are needed for sperm formation.']),
    ind('i2', 'Gamete chromosomes', 'gametes', 'Count.', num('br-l5-i2', 'How many chromosomes does a human egg have?', 23, 'Half of 46.', { rules: [[[46], 'Eggs are gametes made by meiosis, so they have half: 23.', 'mitosis-meiosis']] }), ['Meiosis.'], ['23.']),
    ind('i3', 'Protection', 'strategies', 'Which is safer.', pick('br-l5-i3', 'In which kind of fertilisation are the gametes and embryo better protected?', [['Internal', null], ['External', 'In external fertilisation eggs lie exposed in water.', 'internal-external']], 'Inside the body.'), ['Exposed or inside?'], ['Internal fertilisation.']),
  ],
  reflection: {
    discover: 'External fertilisers lay many unprotected eggs; internal fertilisers protect fewer. In humans, testes make sperm, ovaries make eggs and the uterus holds the developing baby.',
    evidence: 'You compared survival numbers, traced sperm and compared gametes.',
    stillConfusing: [
      { text: 'Why so many eggs?', refresherId: 'br5-strategies' },
      { text: 'Which organ does what?', refresherId: 'br5-organs' },
    ],
  },
};

export const R6: EduLesson = {
  id: 'br-l6', unitId: 'br-unit-3', number: 6, title: 'The menstrual cycle, pregnancy and health',
  objective: 'link ovulation, the uterus lining and menstruation in a typical cycle, predict the next period from a cycle length, describe the stages of pregnancy, and explain responsible choices that protect reproductive health.',
  prerequisiteIds: ['brp-growing'],
  objectives: [
    { id: 'cycle', label: 'Explain the stages of the menstrual cycle' },
    { id: 'predict', label: 'Predict the next period and the likely time of ovulation' },
    { id: 'health', label: 'Describe pregnancy, care and the prevention of infections' },
  ],
  steps: [
    {
      id: 'br6-fert', title: 'Fertilisation and implantation', phase: 'reasoning',
      paragraphs: [
        'Before ovulation the lining of the uterus thickens. The released egg travels into the oviduct. If a sperm meets and fuses with it there, a zygote forms. The zygote divides by mitosis as it moves to the uterus and implants in the thick, blood-rich lining, which nourishes it. Implantation marks the start of pregnancy.',
        'The mother always gives an X chromosome; the father gives either an X (a girl, XX) or a Y (a boy, XY), so the father’s sperm decides the baby’s sex. In India, testing to find a baby’s sex before birth is prohibited by law, to protect the balance of the sex ratio.',
      ],
      visual: v('implantation', {}, 'Four stages from ovulation to implantation: the egg enters the oviduct, is fertilised, divides while travelling, and implants in the thick uterus lining.'),
      check: pick('chk-br6-fert', 'Claim: "The zygote attaches to the uterus wall immediately, because the wall is always ready." This is…', [['false: the zygote divides while travelling, and the lining is only thick at one stage of the cycle', null], ['true', 'The zygote implants only after travelling to the uterus, and the lining thickens only in part of the cycle.', 'always-ready']], 'Both parts are false.', undefined, 'br6-fert'),
    },
    {
      id: 'br6-cycle', title: 'If the egg is not fertilised', phase: 'observe',
      paragraphs: [
        'An unfertilised egg lives about a day and then breaks down. The thick lining is no longer needed and is shed with some blood through the vagina: menstruation, or a period, which usually lasts 3 to 7 days.',
        'In a typical 28-day cycle: days 1 to 5 menstruation; days 6 to 14 the lining rebuilds while an egg matures; around day 14 ovulation; days 15 to 28 the lining thickens again. Cycles of 21 to 35 days are normal and start between about 10 and 14 years of age, continuing until menopause around 50. Menstruation is a sign of a healthy body: clean products, changing them every 4 to 6 hours, washing hands and careful disposal keep you healthy.',
      ],
      visual: v('cycleCalendar', { cycleLength: 28, editable: true }, 'A cycle calendar: choose the first day of the last period and the cycle length to see the expected next period and the likely time of ovulation.'),
      check: pick('chk-br6-cycle', 'Why does menstruation stop during pregnancy?', [['The thick lining is needed to nourish the embryo, so it is not shed', null], ['The ovaries stop existing', 'The ovaries remain; the lining is kept for the embryo.', 'irrelevant-cause'], ['Periods only happen in winter', 'Periods follow the monthly cycle, not the season.', 'irrelevant-cause']], 'The lining is kept.', undefined, 'br6-cycle'),
    },
    {
      id: 'br6-preg', title: 'Pregnancy and responsible choices', phase: 'reasoning',
      paragraphs: [
        'Pregnancy lasts about nine months in three trimesters. The embryo forms major organs in the first two months; from about the ninth week it is called a foetus. In the second trimester the mother feels movements; in the third the baby grows rapidly. At birth, the muscles of the uterus contract to push the baby out. Balanced food, check-ups, rest and avoiding smoking, alcohol and unprescribed medicines protect mother and baby; breastfeeding gives the baby complete nutrition.',
        'Becoming able to reproduce happens before emotional maturity. Sexually transmitted infections (STIs) such as gonorrhoea, syphilis, herpes and HIV pass through close contact; some cannot be cured. Condoms reduce their spread and help prevent pregnancy; pills and copper-T change or block conception but do not protect against STIs. Talk to a parent, teacher, doctor or ASHA worker if you have questions.',
      ],
      check: pick('chk-br6-preg', 'A couple uses oral contraceptive pills but no condoms. Which risk remains?', [['Sexually transmitted infections, because pills do not block contact', null], ['Pregnancy, always', 'Pills used correctly greatly reduce the chance of pregnancy; the main remaining risk is infection.', 'contraception-mixup'], ['No risk at all', 'Pills do not protect against infections.', 'contraception-mixup']], 'STIs remain.', undefined, 'br6-preg'),
    },
  ],
  investigation: { title: 'Use the cycle calendar', description: 'Predict the next period for different cycle lengths.', href: `${REPRO_LAB}?view=cycle`, buttonLabel: 'Open the cycle calendar' },
  worked: {
    id: 'w-br-l6', title: 'Predicting the next period',
    given: ['A girl’s period started on 5 March.', 'Her cycle is 28 days long.'],
    ask: 'When is her next period likely, and around when is ovulation?',
    steps: [
      { text: 'March has 31 days, so 5 March + 28 days = 2 April.', why: 'From 5 March, 26 more days reach 31 March; 2 more reach 2 April.' },
      { text: 'Ovulation is usually about 14 days before the next period: around 19 March.', why: 'In a 28-day cycle ovulation is around day 14.' },
      { text: 'These are estimates: cycles vary, so ovulation is not always exactly on day 14.', why: 'Cycle length, stress and illness change the timing.' },
    ],
    verify: '5 March is day 1; day 29 is 2 April, the first day of the next cycle.',
  },
  guided: {
    id: 'g-br-l6', prompt: 'Work with cycle days.',
    steps: [
      { id: 'g1', prompt: 'Phase.', question: pick('br-g6-1', 'In a typical 28-day cycle, day 3 is during…', [['menstruation', null], ['ovulation', 'Ovulation is around day 14.', 'phase-swap'], ['the lining thickening for an embryo', 'That happens after ovulation, days 15 to 28.', 'phase-swap']], 'Days 1 to 5.'), hints: ['Days 1 to 5.'] },
      { id: 'g2', prompt: 'Next period.', question: num('br-g6-2', 'A 30-day cycle starts on day 1. On which cycle day would ovulation be expected (about 14 days before the next period)?', 16, '30 − 14 = 16.', { rules: [[[14], 'Ovulation is 14 days before the next period, so in a 30-day cycle it is day 16, not day 14.', 'always-day-14']] }), hints: ['Count back 14 from day 30.'] },
    ],
    conclusion: 'Ovulation is tied to the next period, not always to day 14.',
  },
  independent: [
    ind('i1', 'Chromosomes', 'cycle', 'Sex of a baby.', pick('br-l6-i1', 'Who determines whether a baby is a boy or a girl?', [['The father, whose sperm carries either X or Y', null], ['The mother, whose egg carries X or Y', 'Eggs always carry an X.', 'sex-determination'], ['Neither; it is decided by food in pregnancy', 'It is decided by the sex chromosomes at fertilisation.', 'sex-determination']], 'X or Y sperm.'), ['What does each parent give?'], ['The father’s X or Y decides.']),
    ind('i2', 'Claim', 'predict', 'Day 14.', pick('br-l6-i2', 'A student claims ovulation always happens on day 14. This is…', [['not always true: cycles range from about 21 to 35 days, and ovulation is about 14 days before the next period', null], ['always true for everyone', 'Cycle lengths differ, so the day of ovulation differs too.', 'always-day-14']], 'Cycles vary.'), ['Do all cycles last 28 days?'], ['Cycles vary, so ovulation varies.']),
    ind('i3', 'Foetus', 'health', 'Name.', pick('br-l6-i3', 'From about the ninth week of pregnancy the developing baby is called…', [['a foetus', null], ['a zygote', 'The zygote is the single fertilised cell at the very start.', 'stage-swap'], ['a gamete', 'Gametes are sperm and eggs.', 'stage-swap']], 'Foetus.'), ['After the embryo stage.'], ['A foetus.']),
    ind('i4', 'Protection', 'health', 'STIs.', pick('br-l6-i4', 'Which method reduces the spread of sexually transmitted infections?', [['Condoms', null], ['Copper-T', 'A copper-T prevents pregnancy but does not block infections.', 'contraception-mixup'], ['Oral pills', 'Pills change hormones; they do not block infections.', 'contraception-mixup']], 'A barrier.'), ['A barrier method.'], ['Condoms.']),
  ],
  reflection: {
    discover: 'Each month the uterus lining thickens for a possible embryo; without fertilisation it is shed as a period; with fertilisation it nourishes a pregnancy of about nine months.',
    evidence: 'You predicted a period and ovulation, explained why periods stop in pregnancy and chose protection against infections.',
    stillConfusing: [
      { text: 'How are ovulation and periods linked?', refresherId: 'br6-cycle' },
      { text: 'What protects against STIs?', refresherId: 'br6-preg' },
    ],
  },
};
