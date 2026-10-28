/**
 * Chapter 12, Units 1 and 2 (Lessons 1 to 3): biodiversity and why we classify, classification systems over time and the five
 * kingdoms, and the kingdoms Monera, Protista and Fungi. Aligned to NCERT Exploration (2026-27) Sections 12.1 to 12.6.3,
 * Activities 12.1 to 12.5, Figs 12.4 and 12.5. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, ord, pick } from '../../../education/builders';

export const DIVERSITY_LAB = '/biology/diversity/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const D1: EduLesson = {
  id: 'bd-l1', unitId: 'bd-unit-1', number: 1, title: 'Biodiversity and why we classify',
  objective: 'explain what biodiversity and endemic species are, why India has biodiversity hotspots, and how grouping organisms by chosen criteria helps us study them.',
  prerequisiteIds: ['bdp-nutrition'],
  objectives: [
    { id: 'biodiversity', label: 'Explain biodiversity, endemic species and hotspots' },
    { id: 'criteria', label: 'Group organisms using different criteria' },
    { id: 'need', label: 'Explain why classification is needed' },
  ],
  steps: [
    {
      id: 'bd1-variety', title: 'The variety of life', phase: 'observe',
      paragraphs: [
        'From microscopic algae to giant trees, from coral reefs in the Andaman Sea to the snows of the Himalayas, the variety of living things is called biodiversity. Algae release much of the oxygen we breathe, fungi and bacteria turn dead leaves into fertile soil, and bees, birds and bats pollinate flowers. Farmers who keep many crop varieties reduce the risk of crop failure.',
        'India’s mountains, deserts, rainforests, plateaus and coasts support species found nowhere else, called endemic species, such as the Nilgiri tahr, the lion-tailed macaque, the pitcher plant Nepenthes khasiana and Neelakurinji. Regions rich in endemic species that have lost much of their habitat are biodiversity hotspots: the Western Ghats, the Himalayas, Indo-Burma (including North East India) and Sundaland (including the Nicobar Islands).',
      ],
      check: pick('chk-bd1-variety', 'An endemic species is one that…', [['is found naturally in only one region', null], ['is found everywhere on Earth', 'That is the opposite: endemic species are restricted to one area.', 'endemic-meaning'], ['has become extinct', 'Endemic species are living; they are just restricted to one region.', 'endemic-meaning']], 'Restricted range.', undefined, 'bd1-variety'),
    },
    {
      id: 'bd1-criteria', title: 'Many ways to group', phase: 'conjecture',
      paragraphs: [
        'Look at a picture of a forest by day and by night and group the animals. You could group them by where they live, by when they are active, or by what they eat (an eagle, a tiger and a leopard are all carnivores). The same organism fits different groups depending on the criterion you choose.',
        'Scientists start with broad features and move to finer ones: external features; mode of nutrition (autotrophic or heterotrophic); internal structure; cell structure (unicellular or multicellular, prokaryotic or eukaryotic, cell wall or not); ecological role (producer, consumer or decomposer); reproduction; and genetic similarity studied through DNA. Shared features suggest a shared ancestor.',
      ],
      check: pick('chk-bd1-criteria', 'An owl and a bat are both active at night. Grouping them together uses which criterion?', [['Time of activity', null], ['Cell structure', 'Both are multicellular animals; activity time is the criterion here.', 'criterion-mixup'], ['Mode of nutrition only', 'Night activity is about behaviour, not how they get food.', 'criterion-mixup']], 'When active.', undefined, 'bd1-criteria'),
    },
    {
      id: 'bd1-need', title: 'Why classification helps', phase: 'reasoning',
      paragraphs: [
        'Imagine a library with thousands of books on the floor: finding one would be hopeless until they are sorted. In the same way, classification organises millions of organisms. The Pakke Tiger Reserve in Arunachal Pradesh has about 300 of India’s roughly 1300 bird species, including four kinds of hornbill that nest in old trees and eat particular fruits; classifying them helps scientists ask where each lives and what it needs.',
        'Biological classification makes study systematic, shows similarities, differences and relationships, helps identify and name new organisms, helps protect threatened species, and gives scientists everywhere a common language.',
      ],
      check: pick('chk-bd1-need', 'How does classifying the four Pakke hornbills help conservation?', [['It shows which trees and fruits each species depends on, so those can be protected', null], ['It makes the hornbills breed faster', 'Classifying organisms does not change how they breed.', 'irrelevant-cause'], ['It turns them into one species', 'They stay four species; classification just organises information about them.', 'irrelevant-cause']], 'Knowing needs.', undefined, 'bd1-need'),
    },
  ],
  worked: {
    id: 'w-bd-l1', title: 'Sorting six organisms two ways',
    given: ['Eagle, frog, tiger, rose, mushroom, fish.'],
    ask: 'Group them by habitat, then by mode of nutrition.',
    steps: [
      { text: 'Habitat: water, fish; water and land, frog; land, tiger, rose and mushroom; air and land, eagle.', why: 'Habitat is an easy external criterion.' },
      { text: 'Nutrition: autotroph, rose; heterotrophs, eagle, frog, tiger, mushroom and fish.', why: 'Only the green plant makes its own food.' },
      { text: 'The two groupings disagree: a frog sits with fish by habitat but with the tiger by nutrition.', why: 'Different criteria give different groups, so scientists must choose criteria carefully.' },
    ],
    verify: 'Every organism was placed in exactly one group under each criterion.',
  },
  guided: {
    id: 'g-bd-l1', prompt: 'Apply criteria.',
    steps: [
      { id: 'g1', prompt: 'Decomposer.', question: pick('bd-g1-1', 'Which organism is a decomposer?', [['A fungus breaking down fallen leaves', null], ['A grass plant', 'Grass is a producer.', 'role-mixup'], ['A deer eating grass', 'A deer is a consumer.', 'role-mixup']], 'Breaks down dead matter.'), hints: ['Who recycles dead matter?'] },
      { id: 'g2', prompt: 'Hotspot.', question: pick('bd-g1-2', 'Which is a biodiversity hotspot in India?', [['The Western Ghats', null], ['The Thar desert', 'The Western Ghats, the Himalayas and Indo-Burma are the hotspots named.', 'hotspot-mixup']], 'Western Ghats.'), hints: ['Rich in endemic species.'] },
    ],
    conclusion: 'Ecological role and region are useful criteria; hotspots are rich in endemic species.',
  },
  independent: [
    ind('i1', 'Biodiversity', 'biodiversity', 'Meaning.', pick('bd-l1-i1', 'Biodiversity means…', [['the variety of living organisms', null], ['the number of humans on Earth', 'It means the variety of all living things, not just people.', 'biodiversity-meaning']], 'Variety of life.'), ['Bio = life.'], ['The variety of living organisms.']),
    ind('i2', 'Genetic similarity', 'criteria', 'DNA.', pick('bd-l1-i2', 'Why do genetic studies give deep information about how organisms are related?', [['DNA carries inherited instructions, so similar DNA suggests a common ancestor', null], ['DNA shows what an organism ate today', 'DNA carries inherited information, not a record of meals.', 'irrelevant-cause']], 'Shared inheritance.'), ['What does DNA carry?'], ['Similar DNA means shared ancestry.']),
    ind('i3', 'Need', 'need', 'Common language.', pick('bd-l1-i3', 'Which is a benefit of biological classification?', [['Scientists everywhere can discuss organisms using one common system', null], ['It stops new species evolving', 'Classification describes life; it does not control evolution.', 'irrelevant-cause']], 'Shared system.'), ['Think of the library.'], ['A common system for everyone.']),
  ],
  reflection: {
    discover: 'Biodiversity is the variety of life, India has hotspots rich in endemic species, and classification by chosen criteria turns that variety into an organised system.',
    evidence: 'You grouped organisms by different criteria and explained how classification aids conservation.',
    stillConfusing: [
      { text: 'Why do criteria give different groups?', refresherId: 'bd1-criteria' },
      { text: 'What is a hotspot?', refresherId: 'bd1-variety' },
    ],
  },
};

export const D2: EduLesson = {
  id: 'bd-l2', unitId: 'bd-unit-1', number: 2, title: 'From two kingdoms to five',
  objective: 'trace how classification grew from Aristotle to Whittaker’s five kingdoms, explain why each change was made, and use cell type, organisation, wall and nutrition to place an organism in a kingdom.',
  prerequisiteIds: ['bdp-celltypes', 'bdp-nutrition'],
  objectives: [
    { id: 'history', label: 'Explain why each classification system replaced the last' },
    { id: 'criteria', label: 'Name the four criteria of the five kingdom system' },
    { id: 'place', label: 'Place an organism in a kingdom' },
  ],
  steps: [
    {
      id: 'bd2-history', title: 'Systems change with evidence', phase: 'reasoning',
      paragraphs: [
        'Aristotle (4th century BCE) grouped animals by habitat, land, water or air; the Rigveda and Brihat Samhita also grouped animals by habitat and behaviour. This relied on easily seen features. Linnaeus (1758) used two kingdoms: plants, which stay put and make food, and animals, which move and eat others.',
        'But where do Amoeba and Paramecium belong? They move like animals but are single cells. Haeckel (1866) added Protista for microscopic life. Better microscopes showed that bacteria lack a true nucleus, so Copeland (1938) separated Monera. Fungi do not move and do not make food but absorb it, so Whittaker (1969) gave them their own kingdom: five kingdoms.',
      ],
      check: pick('chk-bd2-history', 'Why were bacteria moved out of Protista into Monera?', [['Microscopes showed bacteria have no true nucleus, unlike Amoeba', null], ['Bacteria are multicellular', 'Bacteria are single cells.', 'uni-multi'], ['Bacteria make their own food', 'Some do and some do not; the key difference was the nucleus.', 'criterion-mixup']], 'No nucleus.', undefined, 'bd2-history'),
    },
    {
      id: 'bd2-key', title: 'The four criteria', phase: 'apply',
      paragraphs: [
        'The five kingdom system uses: cell type (prokaryotic or eukaryotic); level of organisation (unicellular or multicellular); cell structure (cell wall or not, and what it is made of); and mode of nutrition (autotrophic or heterotrophic).',
        'Prokaryotes go to Monera. Single-celled eukaryotes go to Protista. Eukaryotes with chitin walls that absorb food are Fungi. Multicellular autotrophs with cellulose walls are Plantae. Multicellular heterotrophs without walls are Animalia. Viruses, which are not cells, fit none.',
      ],
      visual: v('kingdomKey', { editable: true }, 'A five kingdom key: answer questions about the cell type, number of cells, cell wall and nutrition and see which kingdom an organism belongs to.'),
      check: pick('chk-bd2-key', 'A many-celled organism has no cell wall and eats other organisms. Its kingdom is…', [['Animalia', null], ['Plantae', 'Plants have cellulose walls and make their own food.', 'kingdom-swap'], ['Fungi', 'Fungi have chitin walls and absorb food.', 'kingdom-swap']], 'Animals.', undefined, 'bd2-key'),
    },
  ],
  investigation: { title: 'Use the five kingdom key', description: 'Key out organisms, including tricky ones like yeast and viruses.', href: `${DIVERSITY_LAB}?view=kingdoms`, buttonLabel: 'Open the kingdom key' },
  worked: {
    id: 'w-bd-l2', title: 'Placing yeast',
    given: ['Yeast is a single cell with a true nucleus.', 'Its cell wall is made of chitin.', 'It absorbs food and cannot photosynthesise.'],
    ask: 'Which kingdom is yeast in, and why not Protista?',
    steps: [
      { text: 'A true nucleus makes it a eukaryote, so it is not Monera.', why: 'Monera are prokaryotes.' },
      { text: 'Its chitin wall and absorptive nutrition are the features of fungi.', why: 'The wall material outweighs being single-celled.' },
      { text: 'So yeast is in Fungi, though it is unicellular.', why: 'Protista is for single-celled eukaryotes without chitin walls.' },
    ],
    verify: 'The textbook also places yeast in Fungi because of its chitin wall.',
  },
  guided: {
    id: 'g-bd-l2', prompt: 'Order the systems and use the key.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bd-g2-1', 'Order the classification systems from earliest to latest.', [{ id: 'a', text: 'Aristotle: by habitat', needs: [] }, { id: 'b', text: 'Linnaeus: two kingdoms', needs: ['a'] }, { id: 'c', text: 'Haeckel: three kingdoms', needs: ['b'] }, { id: 'd', text: 'Whittaker: five kingdoms', needs: ['c'] }], ['d', 'b', 'a', 'c'], 'Aristotle, Linnaeus, Haeckel, Whittaker.'), hints: ['Fewer kingdoms came first.'] },
      { id: 'g2', prompt: 'Euglena.', question: pick('bd-g2-2', 'Euglena is a single eukaryotic cell that photosynthesises in light and feeds on others in the dark. Its kingdom is…', [['Protista', null], ['Plantae', 'Plants are multicellular; Euglena is a single cell.', 'uni-multi'], ['Monera', 'Euglena has a true nucleus.', 'pro-eu-swap']], 'Single eukaryotic cell.'), hints: ['How many cells? Nucleus?'] },
    ],
    conclusion: 'New evidence added kingdoms; single-celled eukaryotes like Euglena are protists whatever their nutrition.',
  },
  independent: [
    ind('i1', 'Whittaker', 'history', 'Year.', pick('bd-l2-i1', 'Who proposed the five kingdom classification?', [['Robert H. Whittaker', null], ['Carolus Linnaeus', 'Linnaeus used two kingdoms.', 'scientist-swap'], ['Aristotle', 'Aristotle grouped animals by habitat.', 'scientist-swap']], 'Whittaker, 1969.'), ['1969.'], ['Whittaker.']),
    ind('i2', 'One kingdom', 'criteria', 'All single cells.', pick('bd-l2-i2', 'What problem would arise if all unicellular organisms were put in one kingdom?', [['Prokaryotes like bacteria and eukaryotes like Amoeba, which are very different, would be mixed', null], ['There would be too few organisms in it', 'There would be a huge number; the problem is mixing very different cells.', 'irrelevant-cause']], 'Mixes cell types.'), ['Nucleus or not?'], ['It would ignore the nucleus difference.']),
    ind('i3', 'Viruses', 'place', 'No kingdom.', pick('bd-l2-i3', 'Why are viruses not placed in any of the five kingdoms?', [['They are not made of cells', null], ['They are too large', 'Viruses are far too small to see with a light microscope.', 'virus-cell'], ['They contain no genetic material', 'Viruses do contain genetic material; they lack cells.', 'virus-cell']], 'Acellular.'), ['What do all five kingdoms share?'], ['All kingdoms are made of cells; viruses are not.']),
  ],
  reflection: {
    discover: 'Classification grew from habitat groups to five kingdoms as microscopes revealed new differences; cell type, organisation, wall and nutrition place each organism.',
    evidence: 'You ordered the systems, explained each change and keyed out yeast and Euglena.',
    stillConfusing: [
      { text: 'Why did kingdoms get added?', refresherId: 'bd2-history' },
      { text: 'How does the key work?', refresherId: 'bd2-key' },
    ],
  },
};

export const D3: EduLesson = {
  id: 'bd-l3', unitId: 'bd-unit-2', number: 3, title: 'Monera, Protista and Fungi',
  objective: 'describe the features and roles of bacteria and cyanobacteria, protists and fungi, and explain why fungi are important decomposers.',
  prerequisiteIds: ['bdp-celltypes', 'bdp-nutrition'],
  objectives: [
    { id: 'monera', label: 'Describe Monera and their uses' },
    { id: 'protista', label: 'Describe protists from a hay infusion' },
    { id: 'fungi', label: 'Explain the features and roles of fungi' },
  ],
  steps: [
    {
      id: 'bd3-monera', title: 'Monera: single-celled prokaryotes', phase: 'observe',
      paragraphs: [
        'Bacteria and cyanobacteria are single-celled prokaryotes. Bacteria live everywhere, in soil, water, air, hot springs and inside our bodies; in the gut of cattle they help make biogas from dung. Some cause disease, but many are useful, like Lactobacillus (curd) and Rhizobium (fixes nitrogen in roots). Some break down oil, pesticides and sewage.',
        'Cyanobacteria are autotrophs. About 2.5 billion years ago they began filling the air with oxygen; their fossils, stromatolites, are found in Rajasthan and Madhya Pradesh.',
      ],
      visual: v('microscope', { specimen: 'bacteria', objective: 40, editable: true, specimens: ['bacteria', 'paramecium', 'amoeba', 'spirogyra'] }, 'The virtual microscope with slides of bacteria, Paramecium, Amoeba and Spirogyra. Increase the magnification to make the bacteria visible.'),
      check: pick('chk-bd3-monera', 'Why do bacteria look like tiny rods with no nucleus under the microscope?', [['They are prokaryotes with no membrane-bound nucleus', null], ['The stain hides the nucleus', 'Even well stained, bacteria show no true nucleus because they have none.', 'stain-hides'], ['They are dead', 'Living bacteria also lack a nucleus.', 'irrelevant-cause']], 'Prokaryotes.', undefined, 'bd3-monera'),
    },
    {
      id: 'bd3-protista', title: 'Protista: single-celled eukaryotes', phase: 'observe',
      paragraphs: [
        'Leave grass or straw in pond water under a muslin cloth for a week to make a hay infusion. A drop under the microscope shows moving single cells: slipper-shaped Paramecium covered in cilia, shape-changing Amoeba, and green Euglena. Wear gloves and a mask; the infusion smells and must be sterilised before disposal.',
        'Protists are single-celled eukaryotes with no wall or a cellulose wall, living in water or damp places. Some photosynthesise, some feed on others, some decompose; they are an important link in water food chains.',
      ],
      check: pick('chk-bd3-protista', 'A single cell with a true nucleus and many cilia is found in pond water. It most likely belongs to…', [['Protista', null], ['Monera', 'Monera have no true nucleus.', 'pro-eu-swap'], ['Animalia', 'Animals are multicellular.', 'uni-multi']], 'Single eukaryotic cell.', undefined, 'bd3-protista'),
    },
    {
      id: 'bd3-fungi', title: 'Fungi: the recyclers', phase: 'reasoning',
      paragraphs: [
        'Fungi are mostly multicellular eukaryotes with cell walls of chitin. They cannot make food; fine threads forming a network called mycelium absorb nutrients. Most are saprophytes that feed on dead leaves, twigs and bodies, breaking them into simple minerals that return to the soil. Without fungi, decay would slow and soil would lose its fertility.',
        'Some fungi live in partnership with other organisms: a lichen is a fungus and an alga together, and its colour shows air quality. Others are parasites. Yeast, Aspergillus and Penicillium are used to make enzymes and antibiotics; mushrooms are farmed, but some wild ones are poisonous.',
      ],
      check: pick('chk-bd3-fungi', 'What would happen to a forest if all fungi disappeared?', [['Dead matter would pile up and the soil would become less fertile', null], ['Trees would grow faster because no fungi compete with them', 'Trees rely on nutrients that fungi recycle; growth would suffer.', 'fungi-role'], ['Nothing, because fungi make food for trees', 'Fungi do not make food; they decompose dead matter.', 'auto-hetero']], 'Lost recycling.', undefined, 'bd3-fungi'),
    },
  ],
  investigation: { title: 'Look at microbes and protists', description: 'Compare bacteria, Paramecium, Amoeba and Spirogyra under the microscope.', href: `${DIVERSITY_LAB}?view=microscope`, buttonLabel: 'Open the microscope' },
  worked: {
    id: 'w-bd-l3', title: 'Keying three organisms from a study',
    given: ['P: microscopic, no true nucleus, rigid cell covering, survives high salt and heat.', 'Q: many cells in threads, cell wall, no chlorophyll, grows on dead matter.', 'R: one cell, true nucleus, moves with a flagellum, photosynthesises in light.'],
    ask: 'Place each in a kingdom.',
    steps: [
      { text: 'P has no true nucleus: Monera.', why: 'Prokaryotes are Monera, including those of extreme places.' },
      { text: 'Q is multicellular with a wall, no chlorophyll and feeds on dead matter: Fungi.', why: 'Absorptive, walled heterotrophs are fungi.' },
      { text: 'R is a single eukaryotic cell: Protista.', why: 'Single-celled eukaryotes are protists, even if they photosynthesise.' },
    ],
    verify: 'Q and R are both eukaryotes but differ in number of cells, wall and nutrition, so they are in different kingdoms.',
  },
  guided: {
    id: 'g-bd-l3', prompt: 'Roles of microbes.',
    steps: [
      { id: 'g1', prompt: 'Oxygen.', question: pick('bd-g3-1', 'Which organisms first filled Earth’s air with oxygen?', [['Cyanobacteria', null], ['Fungi', 'Fungi do not photosynthesise.', 'auto-hetero'], ['Amoeba', 'Amoeba feeds on others; it does not make oxygen.', 'auto-hetero']], 'Blue-green photosynthesisers.'), hints: ['Ancient photosynthesisers.'] },
      { id: 'g2', prompt: 'Antibiotic.', question: pick('bd-g3-2', 'Penicillin, an antibiotic, comes from…', [['a fungus', null], ['a protist', 'Penicillin is made by the fungus Penicillium.', 'kingdom-swap']], 'Penicillium.'), hints: ['Its name is a clue.'] },
    ],
    conclusion: 'Cyanobacteria made the oxygen; fungi give us antibiotics and recycle nutrients.',
  },
  independent: [
    ind('i1', 'Chitin', 'fungi', 'Wall.', pick('bd-l3-i1', 'Fungal cell walls are made of…', [['chitin', null], ['cellulose', 'Plant walls are cellulose; fungal walls are chitin.', 'wall-material']], 'Chitin.'), ['Not cellulose.'], ['Chitin.']),
    ind('i2', 'Useful bacteria', 'monera', 'Curd.', pick('bd-l3-i2', 'Which bacterium is used to make curd?', [['Lactobacillus', null], ['Rhizobium', 'Rhizobium lives in root nodules and fixes nitrogen.', 'bacteria-use']], 'Lactobacillus.'), ['Milk to curd.'], ['Lactobacillus.']),
    ind('i3', 'Lichens', 'fungi', 'Partnership.', pick('bd-l3-i3', 'A lichen is a partnership between…', [['a fungus and an alga', null], ['a bacterium and a virus', 'A lichen is fungus plus alga.', 'partnership-mixup']], 'Fungus plus alga.'), ['One makes food, one protects.'], ['A fungus and an alga.']),
  ],
  reflection: {
    discover: 'Monera are prokaryotes found everywhere, protists are single eukaryotic cells of damp places, and fungi with chitin walls absorb food and recycle nutrients.',
    evidence: 'You keyed out organisms from a study and explained the roles of bacteria, cyanobacteria and fungi.',
    stillConfusing: [
      { text: 'Monera or Protista?', refresherId: 'bd3-protista' },
      { text: 'Why do fungi matter?', refresherId: 'bd3-fungi' },
    ],
  },
};
