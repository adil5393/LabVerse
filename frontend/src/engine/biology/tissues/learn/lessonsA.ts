/**
 * Chapter 3, Units 1 and 2 (Lessons 1 to 3): meristems and plant growth, permanent plant tissues and tissue systems, and
 * epithelial tissues. Aligned to NCERT Exploration (2026-27) Sections 3.1 to 3.3.1, Activity 3.1 and Table 3.2. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';

export const TISSUE_LAB = '/biology/tissues/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const T1: EduLesson = {
  id: 'bt-l1', unitId: 'bt-unit-1', number: 1, title: 'Meristems: how plants grow',
  objective: 'explain what a tissue is, use the onion root experiment to locate the apical meristem, and match apical, lateral and intercalary meristems to growth in length, girth and regrowth.',
  prerequisiteIds: ['btp-cells', 'btp-organisation'],
  objectives: [
    { id: 'tissue', label: 'Define a tissue and explain division of labour' },
    { id: 'apical', label: 'Interpret the root tip experiment' },
    { id: 'types', label: 'Match the three meristems to the growth they cause' },
  ],
  steps: [
    {
      id: 'bt1-tissue', title: 'Cells that work together', phase: 'reasoning',
      paragraphs: [
        'A tissue is a group of cells, similar in structure, that work together to perform a particular job. Different tissues share out the work of the body: this division of labour makes complex organisms efficient. Tissues form organs, organs form organ systems, and organ systems form the organism.',
        'Plants and animals have different tissues because they live differently. Most plants stay in one place, need rigid support and make their own food; animals move and digest food they take in.',
      ],
      visual: v('organisation', {}, 'Five steps zooming out through a flowering plant: a xylem cell, xylem tissue, a stem (an organ), the shoot system, and the whole plant.'),
      check: pick('chk-bt1-tissue', 'A tissue is…', [['a group of similar cells working together on one job', null], ['a single cell that does every job', 'That describes a unicellular organism such as Amoeba.', 'tissue-cell'], ['several organs working together', 'That is an organ system.', 'order-slip']], 'Similar cells, shared job.', undefined, 'bt1-tissue'),
    },
    {
      id: 'bt1-roots', title: 'Cutting the root tips', phase: 'observe',
      paragraphs: [
        'Stand two onions on jars of water and measure their roots each day. On day 3, cut about 1 cm off the root tips of the onion in jar B and keep measuring.',
        'The roots in jar A keep getting longer; the roots in jar B stop growing. Roots grow only from their tips, where cells divide continuously. Shoot tips also contain dividing cells.',
      ],
      prediction: { id: 'pr-bt1-roots', prompt: 'Predict: after the tips are cut, the roots in jar B will…', options: [{ id: 'p1', text: 'grow faster to make up' }, { id: 'p2', text: 'stop growing longer' }, { id: 'p3', text: 'grow at the same rate as jar A' }], expectedId: 'p2', reveal: 'They stop growing. The dividing cells were at the tips, so removing the tips removed the growth zone.' },
      visual: v('rootGrowth', { cutDay: 3, editable: true }, 'A graph of onion root length over seven days for jar A (tips intact) and jar B (tips cut on day 3).'),
      check: pick('chk-bt1-roots', 'What does the experiment show?', [['Roots grow in length from dividing cells at their tips', null], ['Roots grow from the base of the bulb only', 'Cutting the tips stopped growth, so the growth zone is at the tips.', 'growth-zone'], ['Water makes roots grow without cell division', 'Both jars had water; only the jar with intact tips grew.', 'irrelevant-cause']], 'Growth at the tips.', undefined, 'bt1-roots'),
    },
    {
      id: 'bt1-three', title: 'Three meristems', phase: 'reasoning',
      paragraphs: [
        'Actively dividing tissue is called meristematic tissue. The apical meristem at root and shoot tips makes the plant longer. The lateral meristem, a ring of dividing cells in the stem, adds cells inwards and outwards and makes the stem thicker; its yearly growth shows as annual rings in wood. The intercalary meristem at the base of internodes lets grass and hedges grow again after cutting or grazing.',
        'Meristem cells are small, with thin walls, a large nucleus, dense cytoplasm, no vacuoles and no spaces between them: built for rapid division. Some new cells stop dividing and specialise; this is differentiation, and it makes permanent tissues.',
      ],
      visual: v('treeRings', { age: 20, editable: true }, 'A cut tree trunk whose annual rings can be counted, with the teak tree data of age, diameter and number of rings.'),
      check: pick('chk-bt1-three', 'Grass grows again after it is mowed because of the…', [['intercalary meristem', null], ['apical meristem', 'The mower removes the tips; regrowth comes from meristems lower down.', 'meristem-swap'], ['lateral meristem', 'The lateral meristem makes stems thicker.', 'meristem-swap']], 'At the nodes.', undefined, 'bt1-three'),
    },
  ],
  investigation: { title: 'Run the root tip experiment', description: 'Choose when to cut the tips and compare the two jars.', href: `${TISSUE_LAB}?view=roots`, buttonLabel: 'Open the root experiment' },
  worked: {
    id: 'w-bt-l1', title: 'Reading tree rings',
    given: ['A teak tree has 30 annual rings and a trunk 32 cm across.', 'At 20 years the same kind of tree was 24 cm across.'],
    ask: 'How old is the tree, and how fast did its diameter grow between 20 and 30 years?',
    steps: [
      { text: 'One ring forms each year, so 30 rings means about 30 years.', why: 'The lateral meristem lays down one ring of wood per growing season.' },
      { text: 'Growth = (32 − 24) ÷ (30 − 20) = 8 ÷ 10 = 0.8 cm per year.', why: 'Change in diameter divided by the years it took.' },
      { text: 'The lateral meristem in a ring around the stem caused this growth in girth.', why: 'Growth in thickness comes from the lateral meristem.' },
    ],
    verify: '24 + 0.8 × 10 = 32 cm.',
  },
  guided: {
    id: 'g-bt-l1', prompt: 'Use the root experiment numbers.',
    steps: [
      { id: 'g1', prompt: 'Growth.', question: num('bt-g1-1', 'Jar A roots were 0.5 cm on day 1 and 5.9 cm on day 7. How much did they grow each day on average, in cm?', 0.9, '(5.9 − 0.5) ÷ 6 = 0.9 cm per day.', { unit: 'cm', rules: [[[0.77], 'From day 1 to day 7 is 6 days of growth, not 7.', 'fencepost']] }), hints: ['How many days of growth?'] },
      { id: 'g2', prompt: 'Meristem.', question: pick('bt-g1-2', 'Which tissue was removed from the roots in jar B?', [['Apical meristem', null], ['Lateral meristem', 'The lateral meristem is a ring in the stem, not at the root tip.', 'meristem-swap']], 'At the tips.'), hints: ['Where were they cut?'] },
    ],
    conclusion: 'Growth in length comes from the apical meristem; removing it stops the root getting longer.',
  },
  independent: [
    ind('i1', 'Meristem cells', 'types', 'Features.', pick('bt-l1-i1', 'Which feature lets meristem cells divide rapidly?', [['Thin walls, dense cytoplasm and a large nucleus', null], ['Thick walls for protection', 'Thick walls belong to sclerenchyma, which does not divide.', 'tissue-swap'], ['Large vacuoles that store food', 'Meristem cells have no vacuoles.', 'vacuole-meristem']], 'Built for division.'), ['Think small and busy.'], ['Thin walls, dense cytoplasm, large nucleus, no vacuoles.']),
    ind('i2', 'Girth', 'types', 'Thicker stems.', pick('bt-l1-i2', 'Which meristem makes a tree trunk thicker?', [['Lateral meristem', null], ['Apical meristem', 'The apical meristem adds length.', 'meristem-swap'], ['Intercalary meristem', 'The intercalary meristem helps regrowth after cutting.', 'meristem-swap']], 'A ring in the stem.'), ['Rings in the wood.'], ['Lateral meristem.']),
    ind('i3', 'Tree age', 'types', 'Rings.', num('bt-l1-i3', 'A cut log shows 45 annual rings. About how old was the tree, in years?', 45, 'One ring per year.', { rules: [[[90], 'One ring forms each year, not two.', 'ring-count']] }), ['One ring a year.'], ['45 years.']),
    ind('i4', 'Claim', 'types', 'Only at tips.', pick('bt-l1-i4', 'A student says meristems are found only at root and shoot tips. This is…', [['wrong: there are also lateral and intercalary meristems', null], ['right: all growth is at the tips', 'Growth in girth and regrowth after mowing happen away from the tips.', 'growth-zone']], 'Three kinds.'), ['How do stems get thicker?'], ['Lateral and intercalary meristems exist too.']),
  ],
  reflection: {
    discover: 'Plants grow from meristems: apical for length, lateral for girth and intercalary for regrowth; new cells then differentiate into permanent tissues.',
    evidence: 'You interpreted the root tip experiment, read tree rings and matched meristems to kinds of growth.',
    stillConfusing: [
      { text: 'Which meristem does what?', refresherId: 'bt1-three' },
      { text: 'What did cutting the tips prove?', refresherId: 'bt1-roots' },
    ],
  },
};

export const T2: EduLesson = {
  id: 'bt-l2', unitId: 'bt-unit-1', number: 2, title: 'Permanent tissues: protect, support, transport',
  objective: 'describe the epidermis, parenchyma, collenchyma and sclerenchyma, compare xylem and phloem as complex tissues, and name the three tissue systems.',
  prerequisiteIds: ['btp-cells', 'btp-transport'],
  objectives: [
    { id: 'protect', label: 'Explain how the epidermis protects the plant' },
    { id: 'support', label: 'Compare parenchyma, collenchyma and sclerenchyma' },
    { id: 'transport', label: 'Compare xylem and phloem' },
  ],
  steps: [
    {
      id: 'bt2-epidermis', title: 'The protective layer', phase: 'observe',
      paragraphs: [
        'A cross-section of a sunflower stem shows several different tissues, each specialised. The outermost is the epidermis: one layer of flat, tightly packed cells, usually covered with a waxy cuticle. Desert plants have a thick cuticle that cuts water loss.',
        'Root epidermis grows root hairs that increase the surface for absorbing water. Leaf epidermis has stomata, pores for gas exchange and transpiration; transpiration pulls water up through the xylem.',
      ],
      visual: v('plantTissues', { tissue: 'epidermis', editable: true }, 'A cross-section of a sunflower stem. Tap each tissue to see its cells, whether they are living and what they do.'),
      check: pick('chk-bt2-epidermis', 'Why is a thick cuticle useful to a desert plant?', [['It reduces water loss', null], ['It helps the plant absorb water from the air', 'The waxy cuticle keeps water in; it does not absorb water.', 'cuticle-absorb'], ['It makes food', 'Food is made in green parenchyma and chloroplasts, not in the cuticle.', 'tissue-swap']], 'Waxy, waterproof.', undefined, 'bt2-epidermis'),
    },
    {
      id: 'bt2-support', title: 'Three supporting tissues', phase: 'reasoning',
      paragraphs: [
        'Parenchyma has living, thin-walled, loosely packed cells. It stores food, makes food in green parts, and forms air spaces that help water plants float.',
        'Collenchyma has living cells with corners thickened by pectin, which gives rubbery flexibility, so young stems and tendrils bend without breaking. Sclerenchyma has thick walls hardened with lignin; most of its cells are dead. It makes coconut husk, walnut shells, seed coats and leaf veins hard and strong. All three have one kind of cell each: they are simple permanent tissues.',
      ],
      visual: v('supportTissues', {}, 'Parenchyma, collenchyma and sclerenchyma side by side: thin walls with air spaces, walls thickened at the corners, and thick lignified walls.'),
      check: pick('chk-bt2-support', 'A fresh twig bends but a dry twig snaps. Which tissue gives the fresh twig its flexibility?', [['Collenchyma', null], ['Sclerenchyma', 'Sclerenchyma is hard and rigid; it does not give flexibility.', 'tissue-swap'], ['Xylem', 'Xylem carries water; flexibility comes from collenchyma.', 'tissue-swap']], 'Pectin-thickened corners.', undefined, 'bt2-support'),
    },
    {
      id: 'bt2-transport', title: 'Xylem and phloem', phase: 'reasoning',
      paragraphs: [
        'Xylem and phloem are complex permanent tissues: each has several kinds of cell working together. Xylem carries water and minerals up from the roots and gives strength. It has tracheids, vessels and fibres, which are thick-walled and mostly dead, and xylem parenchyma, its only living part.',
        'Phloem carries food from the leaves to the rest of the plant and is mostly living. Sieve tubes, joined end to end through perforated walls, carry the food; companion cells control their loading and unloading; phloem parenchyma stores food; phloem fibres support. Tissues are organised into three systems: dermal (outer covering), ground (parenchyma, collenchyma, sclerenchyma) and vascular (xylem and phloem).',
      ],
      visual: v('plantTissues', { tissue: 'xylem', editable: true }, 'The sunflower stem section with the vascular bundles highlighted: xylem and phloem side by side.'),
      check: pick('chk-bt2-transport', 'A plant cannot move food from its leaves to its roots. Which tissue is failing?', [['Phloem', null], ['Xylem', 'Xylem carries water and minerals upwards, not food.', 'xylem-phloem'], ['Epidermis', 'The epidermis protects; it does not transport food.', 'tissue-swap']], 'Food goes in phloem.', undefined, 'bt2-transport'),
    },
  ],
  investigation: { title: 'Explore the stem section', description: 'Tap each tissue of a sunflower stem.', href: `${TISSUE_LAB}?view=stem`, buttonLabel: 'Open the stem section' },
  worked: {
    id: 'w-bt-l2', title: 'Why a coconut husk is tough but a coriander stalk is soft',
    given: ['Coconut husk fibres are hard and brittle.', 'Coriander leaf stalks are soft and bend easily.'],
    ask: 'Explain the difference using tissues.',
    steps: [
      { text: 'Coconut husk is made mostly of sclerenchyma, whose thick walls are hardened with lignin.', why: 'Lignin makes walls hard and strong; the cells are dead.' },
      { text: 'Coriander stalks are supported by living collenchyma, with only the corners thickened by pectin.', why: 'Pectin gives flexibility like rubber.' },
      { text: 'Living parenchyma could not make a tough mat: its thin walls give no strength.', why: 'Strength needs thick, lignified walls.' },
    ],
    verify: 'Hard and dead (lignin) versus flexible and living (pectin).',
  },
  guided: {
    id: 'g-bt-l2', prompt: 'Sort tissues and trace water.',
    steps: [
      { id: 'g1', prompt: 'Simple or complex.', question: pick('bt-g2-1', 'Why is xylem called a complex tissue?', [['It is made of several kinds of cell', null], ['It is very hard to understand', '"Complex" here means it has more than one kind of cell.', 'complex-word'], ['All its cells are dead', 'Xylem parenchyma is living; "complex" is about the number of cell types.', 'complex-word']], 'Several cell types.'), hints: ['Count the kinds of cell.'] },
      { id: 'g2', prompt: 'Order.', question: ord('bt-g2-2', 'Order the path of water through a plant.', [{ id: 'a', text: 'Root hairs absorb water from the soil', needs: [] }, { id: 'b', text: 'Xylem carries it up the stem', needs: ['a'] }, { id: 'c', text: 'Water evaporates through stomata in the leaf', needs: ['b'] }], ['c', 'a', 'b'], 'Root hair, xylem, stomata.'), hints: ['Start in the soil.'] },
    ],
    conclusion: 'Water enters through root hairs, rises in the xylem and leaves through stomata, which helps pull more water up.',
  },
  independent: [
    ind('i1', 'Parenchyma', 'support', 'Floating.', pick('bt-l2-i1', 'Aquatic plants float partly because of…', [['parenchyma with large air spaces', null], ['sclerenchyma', 'Sclerenchyma is heavy and hard; air spaces in parenchyma give buoyancy.', 'tissue-swap'], ['a thick cuticle', 'A thick cuticle is for dry places, not floating.', 'cuticle-absorb']], 'Air spaces.'), ['Loosely packed cells.'], ['Specialised parenchyma with air spaces.']),
    ind('i2', 'Xylem', 'transport', 'Living part.', pick('bt-l2-i2', 'Which is the only living component of xylem?', [['Xylem parenchyma', null], ['Vessels', 'Vessels are thick-walled and dead.', 'living-dead'], ['Tracheids', 'Tracheids are thick-walled and dead.', 'living-dead']], 'Parenchyma.'), ['One living kind.'], ['Xylem parenchyma.']),
    ind('i3', 'Stomata', 'protect', 'No stomata.', pick('bt-l2-i3', 'What would happen if leaves had no stomata?', [['Gas exchange and transpiration would almost stop, so less water would be pulled up', null], ['The plant would absorb more water', 'Without transpiration, the pull that draws water up is lost.', 'irrelevant-cause'], ['Nothing would change', 'Stomata are needed for gas exchange and transpiration.', 'irrelevant-cause']], 'Pores matter.'), ['What do stomata do?'], ['No gas exchange and little transpiration pull.']),
    ind('i4', 'Sapling', 'support', 'Monsoon winds.', pick('bt-l2-i4', 'A mango sapling bends in the wind without breaking. If its collenchyma were replaced by sclerenchyma, it would…', [['become rigid and more likely to snap in strong wind', null], ['bend even more easily', 'Sclerenchyma is hard and rigid, not flexible.', 'tissue-swap'], ['transport more water', 'Supporting tissue does not carry water.', 'xylem-phloem']], 'Rigid, not flexible.'), ['Pectin versus lignin.'], ['Lignified walls are rigid, so the sapling would snap rather than bend.']),
  ],
  reflection: {
    discover: 'Permanent tissues are specialised: the epidermis protects, parenchyma stores, collenchyma bends, sclerenchyma strengthens, xylem carries water and phloem carries food.',
    evidence: 'You explained cuticles, flexible stems and hard husks, and traced water through the plant.',
    stillConfusing: [
      { text: 'Collenchyma or sclerenchyma?', refresherId: 'bt2-support' },
      { text: 'Xylem or phloem?', refresherId: 'bt2-transport' },
    ],
  },
};

export const T3: EduLesson = {
  id: 'bt-l3', unitId: 'bt-unit-2', number: 3, title: 'Epithelial tissue: covering and lining',
  objective: 'name the four kinds of animal tissue and relate the structure of five kinds of epithelium to their jobs in exchange, protection, secretion, sensing and absorption.',
  prerequisiteIds: ['btp-organisation'],
  objectives: [
    { id: 'four', label: 'Name the four kinds of animal tissue' },
    { id: 'structure', label: 'Relate the structure of epithelium to its job' },
  ],
  steps: [
    {
      id: 'bt3-four', title: 'Four kinds of animal tissue', phase: 'observe',
      paragraphs: [
        'Blink, clench your fist, take a deep breath, touch something cold. Different tissues make each action possible. Animal tissues are of four kinds: epithelial (covering and lining), connective (connecting and supporting), muscular (movement) and nervous (sensing and control).',
        'Epithelium covers the body as skin and lines the mouth, lungs, blood vessels and intestine. Its cells are packed closely with very little space between them, which keeps germs out, reduces water loss and controls what is absorbed or released.',
      ],
      visual: v('animalTissues', { group: 'epithelial', editable: true }, 'The five kinds of epithelium: choose one to see its cells, where it is found and what it does.'),
      check: pick('chk-bt3-four', 'Which is NOT one of the four kinds of animal tissue?', [['Meristematic', null], ['Epithelial', 'Epithelial tissue is one of the four.', 'tissue-list'], ['Nervous', 'Nervous tissue is one of the four.', 'tissue-list']], 'Meristems are in plants.', undefined, 'bt3-four'),
    },
    {
      id: 'bt3-match', title: 'Structure fits the job', phase: 'reasoning',
      paragraphs: [
        'Exchange: a single layer of thin, flat cells lines blood vessels and lungs, so gases and liquids diffuse across quickly. Protection: many layers with flat, tightly packed outer cells form skin and line the mouth and oesophagus, resisting friction and microbes.',
        'Secretion: cuboidal or columnar cells in salivary and sweat glands and the stomach lining make and release mucus, enzymes, hormones, sweat and saliva. Sensing: receptor cells with hair-like cilia in the nose, taste buds and inner ear. Absorption: a single layer of tall, pillar-like cells, often with hair-like projections, lines the small intestine.',
      ],
      check: pick('chk-bt3-match', 'Why is the epithelium lining the lungs only one thin cell thick?', [['So that gases can diffuse across it quickly', null], ['To give the lungs maximum strength', 'Strength would need many layers; this lining is built for exchange.', 'structure-job'], ['To store food', 'Lung lining is for exchange, not storage.', 'structure-job']], 'A short path for diffusion.', undefined, 'bt3-match'),
    },
  ],
  investigation: { title: 'Compare the five epithelia', description: 'Switch between kinds of epithelium and their locations.', href: `${TISSUE_LAB}?view=animal`, buttonLabel: 'Open animal tissues' },
  worked: {
    id: 'w-bt-l3', title: 'Matching linings to places',
    given: ['Lining 1: many layers, flat outer cells.', 'Lining 2: one layer of tall cells with hair-like projections.', 'Lining 3: one layer of thin, flat cells.'],
    ask: 'Suggest where each lining is found.',
    steps: [
      { text: 'Lining 1 resists rubbing and germs: skin, mouth or oesophagus.', why: 'Many layers protect against friction and microbes.' },
      { text: 'Lining 2 absorbs: the small intestine.', why: 'Tall cells with projections give a large surface for taking in nutrients.' },
      { text: 'Lining 3 allows fast exchange: lungs or blood vessels.', why: 'One thin layer is the shortest path for diffusion.' },
    ],
    verify: 'Each structure matches one job: protect, absorb, exchange.',
  },
  guided: {
    id: 'g-bt-l3', prompt: 'Reason about two epithelia.',
    steps: [
      { id: 'g1', prompt: 'Glands.', question: pick('bt-g3-1', 'Sweat glands are lined by epithelium specialised for…', [['secretion', null], ['absorption', 'Glands release substances; absorption happens in the intestine.', 'structure-job']], 'Making and releasing.'), hints: ['What does a gland do?'] },
      { id: 'g2', prompt: 'Assertion.', question: pick('bt-g3-2', 'Claim: lung epithelium is well suited to gas exchange because it has many layers of tall cells. This is…', [['wrong: it is one layer of thin, flat cells, which speeds diffusion', null], ['right: more layers make exchange faster', 'More layers make the path longer, which slows diffusion.', 'structure-job']], 'Thin is fast.'), hints: ['Thicker means slower diffusion.'] },
    ],
    conclusion: 'Thin single layers exchange; thick multilayers protect; tall cells absorb; gland cells secrete.',
  },
  independent: [
    ind('i1', 'Skin', 'structure', 'Protection.', pick('bt-l3-i1', 'Skin epithelium has many layers because it must…', [['protect underlying tissues from injury and microbes', null], ['let gases diffuse quickly', 'Fast diffusion needs a single thin layer.', 'structure-job']], 'Protection.'), ['Rubbing and germs.'], ['Many layers protect.']),
    ind('i2', 'Senses', 'structure', 'Cilia.', pick('bt-l3-i2', 'Receptor cells with hair-like cilia are found in…', [['the nostrils, taste buds and inner ear', null], ['the lining of blood vessels', 'Blood vessels are lined by thin, flat exchange cells.', 'structure-job']], 'Sensory epithelium.'), ['Smell, taste, hearing.'], ['Nostrils, taste buds, inner ear.']),
    ind('i3', 'Packing', 'four', 'Close-packed.', pick('bt-l3-i3', 'Why are epithelial cells packed so closely?', [['To keep out germs and reduce water loss', null], ['To leave room for a matrix', 'A matrix between cells is a feature of connective tissue.', 'tissue-swap'], ['So that they can divide into meristems', 'Meristems are plant tissues.', 'tissue-list']], 'A barrier.'), ['A covering must seal.'], ['Close packing makes a barrier.']),
  ],
  reflection: {
    discover: 'Animals have four tissue types; epithelium covers and lines, and its thickness and cell shape match its job.',
    evidence: 'You matched linings to places and judged a claim about lung epithelium.',
    stillConfusing: [{ text: 'Which epithelium does which job?', refresherId: 'bt3-match' }],
  },
};
