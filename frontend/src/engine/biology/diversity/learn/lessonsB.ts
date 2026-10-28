/**
 * Chapter 12, Units 2 and 3 (Lessons 4 to 6): the plant kingdom, the animal kingdom, and the hierarchy, binomial names, fossils
 * and threats to biodiversity. Aligned to NCERT Exploration (2026-27) Sections 12.6.4 to 12.10, Table 12.3, Figs 12.16 and
 * 12.17. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';
import { DIVERSITY_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const D4: EduLesson = {
  id: 'bd-l4', unitId: 'bd-unit-2', number: 4, title: 'The plant kingdom: from water to land',
  objective: 'distinguish thallophytes, bryophytes, pteridophytes, gymnosperms and angiosperms by body, vascular tissue, seeds and fruits, and explain how each step reduced plants’ dependence on water.',
  prerequisiteIds: ['bdp-tissues'],
  objectives: [
    { id: 'groups', label: 'Name the five plant groups and their key features' },
    { id: 'key', label: 'Key out a plant from its features' },
    { id: 'land', label: 'Explain how plants adapted to life on land' },
  ],
  steps: [
    {
      id: 'bd4-simple', title: 'Algae and mosses', phase: 'observe',
      paragraphs: [
        'Plants are multicellular autotrophs with cellulose walls; they are the base of most food chains. The simplest, Thallophyta (algae such as Spirogyra), have a thallus, a simple body with no roots, stems or leaves, that exchanges gases, water and nutrients directly with the water around it.',
        'Bryophyta (mosses and Marchantia) form green mats on damp walls and soil. They have rhizoids and simple stem-like and leaf-like parts but no vascular tissue, and their male cells must swim to the female cells. Needing water to reproduce, they are called the amphibians of the plant kingdom.',
      ],
      visual: v('simplePlants', {}, 'The alga Spirogyra, a thread of cells with spiral chloroplasts, beside a moss with rhizoids, leaf-like parts and a spore capsule.'),
      check: pick('chk-bd4-simple', 'Why are bryophytes called the amphibians of the plant kingdom?', [['They live on land but need water to reproduce', null], ['They live only in the sea', 'Bryophytes grow on damp land.', 'habitat-mixup'], ['They can walk', 'Plants do not walk; the name refers to needing water and land.', 'irrelevant-cause']], 'Land but water for reproduction.', undefined, 'bd4-simple'),
    },
    {
      id: 'bd4-vascular', title: 'Ferns, pines and flowering plants', phase: 'reasoning',
      paragraphs: [
        'Pteridophyta (ferns) have true roots, stems and leaves, and a cross-section of the stem shows xylem and phloem. Vascular tissue lets them grow larger on land, but they still need water to reproduce and make no seeds.',
        'Gymnosperms (pines and cycads) make seeds that protect the embryo and carry food, and need no water for fertilisation. Their seeds are naked, often on cones, and their needle-like leaves cut water loss in cold, dry places. Angiosperms make flowers and enclose their seeds in fruits; flowers attract pollinators and fruits spread seeds, so angiosperms are the most diverse plants on Earth.',
      ],
      visual: v('plantKey', { editable: true }, 'A key to the five plant groups: choose the body type and whether the plant has vascular tissue, seeds and fruits.'),
      check: pick('chk-bd4-vascular', 'Both ferns and mosses lack seeds. What puts ferns in a different group?', [['Ferns have true roots, stems and leaves with xylem and phloem', null], ['Ferns have flowers', 'Ferns have no flowers or seeds.', 'group-swap'], ['Mosses have seeds', 'Mosses have no seeds either.', 'group-swap']], 'Vascular tissue.', undefined, 'bd4-vascular'),
    },
  ],
  investigation: { title: 'Key out plants', description: 'Use the plant key on algae, moss, fern, pine and mango.', href: `${DIVERSITY_LAB}?view=plants`, buttonLabel: 'Open the plant key' },
  worked: {
    id: 'w-bd-l4', title: 'Keying a cycad',
    given: ['A cycad has roots, stem and leaves, vascular tissue, and seeds on cones without fruits.'],
    ask: 'Which group is it in?',
    steps: [
      { text: 'It has roots, stems and leaves, so it is not a thallophyte.', why: 'Thallophytes have an undifferentiated thallus.' },
      { text: 'It has vascular tissue and seeds, so it is not a bryophyte or pteridophyte.', why: 'Bryophytes lack vascular tissue; pteridophytes lack seeds.' },
      { text: 'Its seeds are not in fruits: a gymnosperm.', why: 'Naked seeds mark gymnosperms; angiosperms enclose seeds in fruits.' },
    ],
    verify: 'Cycads and pines are both gymnosperms.',
  },
  guided: {
    id: 'g-bd-l4', prompt: 'Order the groups and use the key.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bd-g4-1', 'Order the plant groups from the simplest to the most complex.', [{ id: 'a', text: 'Thallophyta', needs: [] }, { id: 'b', text: 'Bryophyta', needs: ['a'] }, { id: 'c', text: 'Pteridophyta', needs: ['b'] }, { id: 'd', text: 'Gymnosperm', needs: ['c'] }, { id: 'e', text: 'Angiosperm', needs: ['d'] }], ['c', 'e', 'a', 'd', 'b'], 'Algae, mosses, ferns, gymnosperms, angiosperms.'), hints: ['Thallus first, flowers last.'] },
      { id: 'g2', prompt: 'Tall plants.', question: pick('bd-g4-2', 'Why do taller plants need specialised transport tissues?', [['Water and food must travel long distances, too far for diffusion alone', null], ['Tall plants do not need water', 'Every plant needs water; tall ones must lift it far.', 'irrelevant-cause']], 'Long distances.'), hints: ['How far is it from root to leaf?'] },
    ],
    conclusion: 'From algae to angiosperms, plants gained vascular tissue, seeds, flowers and fruits, each reducing their dependence on water.',
  },
  independent: [
    ind('i1', 'Gymnosperms', 'groups', 'Seeds.', pick('bd-l4-i1', 'Gymnosperm means "naked seed" because…', [['their seeds are not enclosed in fruits', null], ['they have no seeds', 'Gymnosperms do have seeds.', 'group-swap']], 'Seeds on cones.'), ['Gymnos = naked.'], ['Seeds exposed, not inside fruits.']),
    ind('i2', 'Angiosperms', 'land', 'Diverse.', pick('bd-l4-i2', 'Why are angiosperms the most diverse plant group?', [['Flowers attract pollinators and fruits spread seeds widely', null], ['They need the most water', 'Angiosperms are less dependent on water than ferns or mosses.', 'group-swap']], 'Efficient reproduction and dispersal.'), ['Flowers and fruits.'], ['Efficient reproduction and seed dispersal.']),
    ind('i3', 'Spirogyra', 'key', 'Thallus.', pick('bd-l4-i3', 'Spirogyra, a green thread in ponds with no roots, stems or leaves, is a…', [['thallophyte', null], ['bryophyte', 'Bryophytes have rhizoids and simple leaf-like parts on land.', 'group-swap'], ['pteridophyte', 'Pteridophytes have true roots, stems and leaves.', 'group-swap']], 'Thallus.'), ['No differentiated parts.'], ['Thallophyta.']),
  ],
  reflection: {
    discover: 'Plants range from thallophytes to angiosperms; vascular tissue, seeds, and then flowers and fruits each helped plants spread further from water.',
    evidence: 'You keyed out a cycad, ordered the groups and explained why tall plants need vascular tissue.',
    stillConfusing: [
      { text: 'Moss or fern?', refresherId: 'bd4-vascular' },
      { text: 'Why are mosses amphibians?', refresherId: 'bd4-simple' },
    ],
  },
};

export const D5: EduLesson = {
  id: 'bd-l5', unitId: 'bd-unit-2', number: 5, title: 'The animal kingdom',
  objective: 'divide animals into non-chordates and chordates by the notochord, distinguish the eight invertebrate phyla by organisation, symmetry, openings, segments and skeleton, and name the five vertebrate groups.',
  prerequisiteIds: ['bdp-tissues'],
  objectives: [
    { id: 'notochord', label: 'Use the notochord to divide animals' },
    { id: 'phyla', label: 'Distinguish the eight invertebrate phyla' },
    { id: 'vertebrates', label: 'Name the vertebrate groups and their adaptations' },
  ],
  steps: [
    {
      id: 'bd5-simple', title: 'Simple body plans', phase: 'observe',
      paragraphs: [
        'Animals are multicellular heterotrophs; most move, respond quickly and behave in coordinated ways. A key division is the notochord, a flexible rod along the back: animals without one are non-chordates (invertebrates); those with one at some stage are chordates.',
        'Sponges (Porifera) are many-celled but have no true tissues; water flows through their pores. Cnidarians such as Hydra and jellyfish have tissues and catch prey with tentacles but have one opening for food and waste. Flatworms (Platyhelminthes) show bilateral symmetry, with head and tail ends, but still one opening; many are parasites with hooks and suckers. Roundworms (Nematoda) have cylindrical bodies with two openings, a mouth and an anus.',
      ],
      visual: v('animalPhyla', { phylum: 'Porifera', editable: true }, 'The eight invertebrate phyla from sponges to starfish, with each one’s habitat, level of organisation and skeleton.'),
      check: pick('chk-bd5-simple', 'Which feature first appears in roundworms, compared with flatworms?', [['Two body openings, a mouth and an anus', null], ['Tentacles', 'Tentacles are a feature of cnidarians.', 'phylum-swap'], ['A hard external skeleton', 'That appears in arthropods.', 'phylum-swap']], 'Mouth and anus.', undefined, 'bd5-simple'),
    },
    {
      id: 'bd5-complex', title: 'Segments, joints and shells', phase: 'reasoning',
      paragraphs: [
        'Annelids such as earthworms have segmented bodies, a body cavity, muscles for movement and a nerve cord. Arthropods (insects, crabs, spiders) have segmented bodies with jointed legs and a hard exoskeleton that protects, cuts water loss and supports strong muscles, so they thrive even in dry places.',
        'Molluscs (snails, squids, octopuses) have soft bodies with a muscular foot, often in a shell. Echinoderms (starfish, sea urchins) live in the sea and have spiny skin and an internal skeleton of calcium carbonate, but no notochord. Protochordates such as Amphioxus have a notochord at some stage: the first chordates.',
      ],
      check: pick('chk-bd5-complex', 'An earthworm and a beetle both have segmented bodies. Why are they in different phyla?', [['The beetle has jointed legs and a hard exoskeleton', null], ['The earthworm has a backbone', 'Neither has a backbone; both are invertebrates.', 'chordate-mixup'], ['The beetle is a plant', 'Beetles are animals (arthropods).', 'kingdom-swap']], 'Jointed legs, exoskeleton.', undefined, 'bd5-complex'),
    },
    {
      id: 'bd5-vertebrates', title: 'Vertebrates', phase: 'reasoning',
      paragraphs: [
        'Vertebrates have a backbone that supports a larger body and protects the brain and spinal cord. They are grouped into fish, amphibians, reptiles, birds and mammals by habitat, body covering and reproduction.',
        'Structures suit their way of life: fins and gills for fish in water; feathers and hollow bones for flight in birds; fat stores in camels and thick fur in polar bears; mammary glands in mammals feed the young and help them survive.',
      ],
      check: pick('chk-bd5-vertebrates', 'Which feature belongs to mammals?', [['Mammary glands that feed the young', null], ['Feathers', 'Feathers belong to birds.', 'vertebrate-swap'], ['Gills throughout life', 'Gills are used by fish.', 'vertebrate-swap']], 'Milk for the young.', undefined, 'bd5-vertebrates'),
    },
  ],
  investigation: { title: 'Explore the animal phyla', description: 'Compare body plans from sponges to starfish.', href: `${DIVERSITY_LAB}?view=animals`, buttonLabel: 'Open the phylum explorer' },
  worked: {
    id: 'w-bd-l5', title: 'Insect or earthworm?',
    given: ['A garden animal has a segmented body and jointed legs.'],
    ask: 'Is it an insect (arthropod) or an earthworm (annelid)?',
    steps: [
      { text: 'Both annelids and arthropods are segmented, so segments alone do not decide.', why: 'A feature shared by two groups cannot separate them.' },
      { text: 'Jointed legs are found only in arthropods.', why: 'Earthworms have no legs at all.' },
      { text: 'So it is an arthropod such as an insect.', why: 'Jointed appendages are the defining feature of Arthropoda.' },
    ],
    verify: 'Bilateral symmetry or a cylindrical body would not settle it either; jointed legs do.',
  },
  guided: {
    id: 'g-bd-l5', prompt: 'Use the animal key.',
    steps: [
      { id: 'g1', prompt: 'Sponge.', question: pick('bd-g5-1', 'Sponges have no true tissues. Which feature still places them among animals?', [['Their cells have only a cell membrane, with no cell wall, and they feed on others', null], ['They photosynthesise', 'Sponges do not photosynthesise; they filter food from water.', 'auto-hetero'], ['Their cells have cell walls', 'Animal cells have no cell walls.', 'wall-material']], 'Heterotroph without walls.'), hints: ['What do all animal cells lack?'] },
      { id: 'g2', prompt: 'Filter.', question: num('bd-g5-2', 'One kilogram of sponge can filter about 24 000 litres of sea water a day. How many litres would 5 kg filter?', 120000, '24 000 × 5 = 120 000 litres.', { unit: 'litres', rules: [[[4800], 'More sponge filters more water, so multiply by 5.', 'multiply-not-divide']] }), hints: ['Multiply by 5.'] },
    ],
    conclusion: 'Animal cells have no walls and animals feed on others; sponges filter huge volumes of water.',
  },
  independent: [
    ind('i1', 'Notochord', 'notochord', 'Division.', pick('bd-l5-i1', 'Animals are divided into chordates and non-chordates by the presence of…', [['a notochord', null], ['legs', 'Many non-chordates such as insects have legs.', 'criterion-mixup'], ['a body cavity', 'Annelids have a body cavity but are non-chordates.', 'criterion-mixup']], 'Notochord.'), ['A flexible rod.'], ['The notochord.']),
    ind('i2', 'Starfish', 'phyla', 'Skeleton.', pick('bd-l5-i2', 'Starfish have a hard internal skeleton. Why are they not vertebrates?', [['They have no notochord or backbone', null], ['They live on land', 'Starfish live in the sea.', 'habitat-mixup']], 'No notochord.'), ['Is an endoskeleton the same as a backbone?'], ['Their skeleton is of calcium carbonate plates, without a notochord.']),
    ind('i3', 'Exoskeleton', 'phyla', 'Advantage.', pick('bd-l5-i3', 'How does a beetle’s hard exoskeleton help it survive?', [['It protects the body, reduces water loss and supports strong muscles', null], ['It lets the beetle photosynthesise', 'Beetles are heterotrophs; the exoskeleton is protective.', 'auto-hetero']], 'Protection.'), ['What does armour do?'], ['Protection, less water loss, muscle support.']),
    ind('i4', 'Flatworms', 'phyla', 'Parasites.', pick('bd-l5-i4', 'Why does washing hands and drinking boiled water help prevent infection by parasitic worms?', [['Their eggs or larvae enter the body through dirty hands, water and food', null], ['Worms are killed by soap on the skin from inside the gut', 'Washing removes eggs before they are swallowed; it does not reach the gut.', 'irrelevant-cause']], 'Stop entry.'), ['How do they get in?'], ['Hygiene stops them entering through food and water.']),
  ],
  reflection: {
    discover: 'Animals split by the notochord; invertebrates range from sponges to echinoderms with increasing organisation, and vertebrates’ structures suit their environments.',
    evidence: 'You told an insect from an earthworm, placed sponges and starfish and explained the exoskeleton.',
    stillConfusing: [
      { text: 'How do the invertebrate phyla differ?', refresherId: 'bd5-simple' },
      { text: 'Annelid or arthropod?', refresherId: 'bd5-complex' },
    ],
  },
};

export const D6: EduLesson = {
  id: 'bd-l6', unitId: 'bd-unit-3', number: 6, title: 'Ranks, names, fossils and threats',
  objective: 'arrange the ranks from kingdom to species, find the lowest rank two organisms share, write scientific names by the binomial rules, and explain what fossils show and why biodiversity is under threat.',
  prerequisiteIds: ['bdp-nutrition'],
  objectives: [
    { id: 'hierarchy', label: 'Arrange the classification ranks and compare organisms' },
    { id: 'binomial', label: 'Write scientific names correctly' },
    { id: 'threats', label: 'Explain fossils as evidence and threats to biodiversity' },
  ],
  steps: [
    {
      id: 'bd6-ranks', title: 'An address for every organism', phase: 'reasoning',
      paragraphs: [
        'Classification goes step by step from broad to narrow: kingdom, phylum, class, order, family, genus, species. Each group sits inside the one above, and at each lower level the members share more features. It works like an address that locates a house exactly.',
        'A tiger is Animalia, Chordata (sub-phylum Vertebrata), Mammalia, Carnivora, Felidae, Panthera, Panthera tigris. A pea is Plantae, Magnoliophyta, Magnoliopsida, Fabales, Fabaceae, Pisum, Pisum sativum. A tiger and a lion share everything down to the genus Panthera, the roaring cats.',
      ],
      visual: v('hierarchy', { a: 'Tiger', b: 'Lion', editable: true }, 'The classification ladder from kingdom to species for two chosen organisms, showing the lowest rank they share.'),
      check: pick('chk-bd6-ranks', 'Which has fewer members but more features in common: a class or a genus?', [['A genus', null], ['A class', 'A class is a higher rank with more members and fewer shared features.', 'rank-order'], ['They are the same', 'Lower ranks are always narrower than higher ones.', 'rank-order']], 'Lower rank, narrower group.', undefined, 'bd6-ranks'),
    },
    {
      id: 'bd6-names', title: 'Two-word names', phase: 'apply',
      paragraphs: [
        'A tiger is bagh in Hindi, puli in Tamil and tigre in French. To avoid confusion, Carolus Linnaeus introduced binomial nomenclature: a two-part Latin or Latinised name, genus then species, such as Panthera tigris or Mangifera indica. A species is a group of similar individuals that can interbreed and produce offspring.',
        'Rules: the genus comes first and begins with a capital letter; the species name is all in lower case; the name is printed in italics or underlined when handwritten. New species are often named after places or people: the purple frog Nasikabatrachus sahyadrensis, found in 2003, is named after the Sahyadri hills.',
      ],
      visual: v('binomial', { name: 'panthera Tigris', editable: true }, 'A scientific name checker: type a name and see which binomial rules it follows or breaks.'),
      check: pick('chk-bd6-names', 'Which is written correctly?', [['Mangifera indica', null], ['mangifera Indica', 'The genus takes the capital letter and the species is in lower case.', 'binomial-case'], ['Mangifera Indica', 'The species name must be in lower case.', 'binomial-case']], 'Genus capital, species lower case.', undefined, 'bd6-names'),
    },
    {
      id: 'bd6-fossils', title: 'Evidence and threats', phase: 'reasoning',
      paragraphs: [
        'Fossils are preserved remains of plants and animals in layers of rock, sand and mud. Older layers usually hold simpler organisms and newer layers more complex ones, so fossils record how life has changed. Birbal Sahni, who studied fossil plants, founded the Birbal Sahni Institute of Palaeosciences in Lucknow. Classification itself keeps changing: genetic studies led Carl Woese (1977) to propose three domains, Bacteria, Archaea and Eukarya.',
        'Pollution, deforestation, overuse of resources and climate change are reducing biodiversity. When one species disappears, others that depend on it may follow. The Sangai deer of Manipur, living on the floating phumdis of Loktak lake, is endangered as its habitat degrades.',
      ],
      check: pick('chk-bd6-fossils', 'In undisturbed rock layers, simpler fossils are usually found…', [['in older, deeper layers', null], ['only at the surface', 'The surface holds the newest layers, usually with more complex forms.', 'fossil-order'], ['nowhere; fossils are random', 'Fossils follow a broad pattern from simple to complex over time.', 'fossil-order']], 'Older layers.', undefined, 'bd6-fossils'),
    },
  ],
  investigation: { title: 'Climb the classification ladder', description: 'Compare any two organisms and check scientific names.', href: `${DIVERSITY_LAB}?view=hierarchy`, buttonLabel: 'Open the hierarchy' },
  worked: {
    id: 'w-bd-l6', title: 'How closely related?',
    given: ['Tiger: Felidae, Panthera tigris.', 'House cat: Felidae, Felis catus.', 'Dog: Canidae, Canis familiaris; all three are Carnivora.'],
    ask: 'Which two are most closely related?',
    steps: [
      { text: 'Tiger and cat share the family Felidae but not the genus.', why: 'Panthera and Felis are different genera in one family.' },
      { text: 'Tiger and dog share only the order Carnivora.', why: 'Felidae and Canidae are different families.' },
      { text: 'So the tiger and cat are more closely related than the tiger and dog.', why: 'The lower the rank they share, the closer the relationship.' },
    ],
    verify: 'Tiger and lion, sharing the genus Panthera, are closer still.',
  },
  guided: {
    id: 'g-bd-l6', prompt: 'Order the ranks and fix a name.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bd-g6-1', 'Order the ranks from the broadest to the narrowest.', [{ id: 'a', text: 'Kingdom', needs: [] }, { id: 'b', text: 'Class', needs: ['a'] }, { id: 'c', text: 'Family', needs: ['b'] }, { id: 'd', text: 'Genus', needs: ['c'] }, { id: 'e', text: 'Species', needs: ['d'] }], ['d', 'a', 'e', 'c', 'b'], 'Kingdom, class, family, genus, species.'), hints: ['Kingdom is the broadest.'] },
      { id: 'g2', prompt: 'Name.', question: pick('bd-g6-2', 'A student writes "homo Sapiens". What is wrong?', [['The genus needs a capital and the species should be lower case: Homo sapiens', null], ['Nothing is wrong', 'The capital letters are on the wrong words.', 'binomial-case']], 'Swap the capitals.'), hints: ['Which word takes the capital?'] },
    ],
    conclusion: 'Ranks narrow from kingdom to species; in a name the genus is capitalised and the species is not.',
  },
  independent: [
    ind('i1', 'Genus', 'binomial', 'First word.', pick('bd-l6-i1', 'In Panthera leo, the word Panthera is the…', [['genus', null], ['species', 'The second word, leo, is the species name.', 'genus-species']], 'First word.'), ['First word.'], ['Genus.']),
    ind('i2', 'Shared rank', 'hierarchy', 'Pea and mango.', pick('bd-l6-i2', 'A pea (order Fabales) and a mango (order Sapindales) are both in the class Magnoliopsida. The lowest rank they share is…', [['class', null], ['order', 'Their orders differ: Fabales and Sapindales.', 'rank-order'], ['genus', 'Pisum and Mangifera are different genera.', 'rank-order']], 'Class.'), ['Where do they first differ?'], ['They share the class but not the order.']),
    ind('i3', 'Threats', 'threats', 'Habitat loss.', pick('bd-l6-i3', 'Why does losing one species often harm others?', [['Other species depend on it for food, pollination or habitat', null], ['Species never interact', 'Food webs link species closely.', 'irrelevant-cause']], 'Food webs.'), ['Think of hornbills and old trees.'], ['Dependent species decline too.']),
  ],
  reflection: {
    discover: 'Seven ranks from kingdom to species give each organism an address, two-word names are understood worldwide, fossils show life’s history, and human activity threatens biodiversity.',
    evidence: 'You compared relatedness by shared ranks, corrected scientific names and explained fossils and threats.',
    stillConfusing: [
      { text: 'How do the ranks narrow?', refresherId: 'bd6-ranks' },
      { text: 'Binomial rules', refresherId: 'bd6-names' },
    ],
  },
};
