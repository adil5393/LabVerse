/** Chapter 12 (Diversity and Classification) practice bank and chapter assessment. Original questions; checked by `__tests__/diversity.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question, VisualRef } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1, ref?: string): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: ref ? { kind: 'textbook-aligned', ref } : { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const DIVERSITY_PRACTICE: PracticeSet = {
  id: 'diversity-practice', title: 'Diversity chapter practice',
  groups: [
    {
      id: 'g-kingdoms', title: 'Kingdoms', blurb: 'Criteria and the five kingdoms (Lessons 1 to 3).',
      items: [
        item('bdx-1', 'Cilia', 'Unlabelled slide.', choose('bdx-1q', 'An unlabelled slide shows a single cell with a well-defined nucleus and many cilia. Which kingdom does it most likely belong to?', [['Protista', null], ['Monera', 'Monera have no well-defined nucleus.'], ['Fungi', 'Fungi do not move with cilia and have chitin walls.']], 'Single eukaryotic cell.'), ['Nucleus and number of cells.'], ['A single eukaryotic cell with cilia: a protist such as Paramecium.'], 'basic', 1, 'Revise, Reflect, Refine Q5'),
        item('bdx-2', 'Unicellular fungus', 'Identification key.', choose('bdx-2q', 'Which feature would justify placing a unicellular eukaryote in the kingdom Fungi?', [['A cell wall made of chitin and absorptive nutrition', null], ['Movement with flagella', 'Moving with flagella points to a protist.'], ['Photosynthesis', 'Fungi cannot photosynthesise.']], 'Chitin wall.'), ['Think of yeast.'], ['A chitin wall and absorbing food: fungi.'], 'standard', 2, 'Revise, Reflect, Refine Q14'),
        item('bdx-3', 'Viruses', 'No kingdom.', choose('bdx-3q', 'Viruses contain genetic material but are left out of the five kingdoms. Which feature do they lack?', [['Cellular organisation', null], ['Genetic material', 'They do have genetic material, as the question says.'], ['A protein coat', 'Viruses do have a protein coat.']], 'No cells.'), ['What do all kingdoms share?'], ['Every kingdom is made of cells; viruses are not.'], 'standard', 2, 'Revise, Reflect, Refine Q10'),
        item('bdx-4', 'Euglena-like', 'New organism.', choose('bdx-4q', 'A new organism moves about and can photosynthesise. Which feature would show it belongs to Protista rather than Plantae?', [['It is a single eukaryotic cell', null], ['It has chlorophyll', 'Plants also have chlorophyll, so this does not separate them.'], ['It has a cell wall', 'Plants have cell walls too.']], 'Single cell.'), ['What separates protists from plants?'], ['Protists are unicellular; plants are multicellular.'], 'challenge', 2, 'Revise, Reflect, Refine Q13'),
        item('bdx-5', 'Cellular organisation', 'Fundamental criterion.', choose('bdx-5q', 'Why is cellular organisation a more fundamental basis for classification than having xylem and phloem?', [['Every organism has some cellular organisation, but only some plants have xylem and phloem', null], ['Xylem and phloem are found in all organisms', 'They are found only in vascular plants.']], 'Applies to all life.'), ['Which feature applies to every organism?'], ['A criterion that applies to all organisms can sort all of them.'], 'challenge', 2, 'Revise, Reflect, Refine Q4'),
      ],
    },
    {
      id: 'g-plants-animals', title: 'Plants and animals', blurb: 'Plant groups and animal phyla (Lessons 4 and 5).',
      items: [
        item('bdx-6', 'Insect', 'Meena and Hari.', choose('bdx-6q', 'Which observation confirms that a garden animal is an insect, not an earthworm?', [['Jointed legs', null], ['A bilaterally symmetrical body', 'Earthworms are bilaterally symmetrical too.'], ['A cylindrical body', 'Earthworms have cylindrical bodies.']], 'Jointed legs.'), ['What do earthworms lack?'], ['Jointed legs are found in arthropods only.'], 'basic', 1, 'Revise, Reflect, Refine Q1'),
        item('bdx-7', 'Sponge', 'Animal feature.', choose('bdx-7q', 'Sponge bodies lack true tissues. Which feature of sponge cells supports placing them in the animal kingdom?', [['They have a cell membrane but no cell wall', null], ['They can photosynthesise', 'Sponges do not photosynthesise.'], ['They have a cell wall', 'Animal cells have no cell walls.']], 'No wall.'), ['What do animal cells lack?'], ['No cell wall, and heterotrophic: animal features.'], 'standard', 1, 'Revise, Reflect, Refine Q2'),
        item('bdx-8', 'Moss and fern', 'Different groups.', choose('bdx-8q', 'Both bryophytes and pteridophytes lack flowers and seeds. Why are they in different groups?', [['Pteridophytes have true roots, stems and leaves with vascular tissue; bryophytes do not', null], ['Bryophytes have seeds', 'Neither group has seeds.']], 'Vascular tissue.'), ['Xylem and phloem.'], ['Vascular tissue and true organs separate them.'], 'standard', 2, 'Revise, Reflect, Refine Q11'),
        item('bdx-9', 'Sponge filtering', 'Threads of Curiosity.', num('bdx-9q', 'One kilogram of sponge filters about 24 000 litres of sea water a day. How many litres would 0.5 kg filter in a day?', 12000, '24 000 × 0.5 = 12 000 litres.', { unit: 'litres', rules: [[[48000], 'Half a kilogram filters half as much, so multiply by 0.5.']] }), ['Proportional.'], ['12 000 litres.'], 'standard'),
      ],
    },
    {
      id: 'g-naming', title: 'Ranks and names', blurb: 'Hierarchy, binomial names and threats (Lesson 6).',
      items: [
        item('bdx-10', 'Class or genus', 'Hierarchy.', choose('bdx-10q', 'In the classification hierarchy, which has fewer members but more features in common?', [['Genus', null], ['Class', 'A class is higher and broader than a genus.']], 'Lower is narrower.'), ['Lower ranks are narrower.'], ['Genus.'], 'basic', 1, 'Revise, Reflect, Refine Q12'),
        item('bdx-11', 'Binomial', 'Correct form.', choose('bdx-11q', 'Which is the correct way to write the scientific name of the tiger?', [['Panthera tigris', null], ['panthera tigris', 'The genus must begin with a capital letter.'], ['Panthera Tigris', 'The species name must be in lower case.']], 'Genus capital.'), ['Which word is capitalised?'], ['Panthera tigris, in italics when printed.'], 'basic'),
        item('bdx-12', 'Habitat only', 'Consequences.', choose('bdx-12q', 'If organisms were classified only by habitat, which would wrongly be grouped together?', [['A whale and a fish, both living in water', null], ['A tiger and a lion', 'They are genuinely closely related (genus Panthera).']], 'Habitat hides differences.'), ['Mammal in water.'], ['Whales are mammals, though they live with fish.'], 'challenge', 2, 'Revise, Reflect, Refine Q15(vi)'),
      ],
    },
  ],
};

export const DIVERSITY_ASSESSMENT: ChapterAssessment = {
  id: 'diversity-assessment-1',
  title: 'Patterns in Life: Diversity and Classification: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'bda-1', topic: 'Five kingdoms', lessonId: 'bd-l2', competency: 'knowledge', marks: 1, prompt: 'Scientist.', question: choose('bda-1q', 'The five kingdom classification was proposed by…', [['Whittaker', null], ['Linnaeus', 'Linnaeus proposed two kingdoms and binomial names.'], ['Haeckel', 'Haeckel added Protista, making three kingdoms.']], 'Whittaker, 1969.'), solution: ['Robert H. Whittaker, 1969.'] },
        { id: 'bda-2', topic: 'Fungi', lessonId: 'bd-l3', competency: 'knowledge', marks: 1, prompt: 'Wall.', question: choose('bda-2q', 'The cell walls of fungi are made of…', [['chitin', null], ['cellulose', 'Cellulose is in plant cell walls.'], ['protein only', 'Fungal walls are made of chitin.']], 'Chitin.'), solution: ['Chitin.'] },
        { id: 'bda-3', topic: 'Ranks', lessonId: 'bd-l6', competency: 'knowledge', marks: 1, prompt: 'Order.', question: choose('bda-3q', 'Which rank comes directly above genus?', [['Family', null], ['Order', 'Order is above family.'], ['Species', 'Species is below genus.']], 'Family.'), solution: ['Kingdom, phylum, class, order, family, genus, species.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'bda-4', topic: 'Kingdom key', lessonId: 'bd-l3', competency: 'application', marks: 2, prompt: 'Organism P.', question: choose('bda-4q', 'Organism P is microscopic, has no true nucleus and has a rigid cell covering. Its kingdom is…', [['Monera', null], ['Protista', 'Protists have a true nucleus.'], ['Fungi', 'Fungi have a true nucleus.']], 'Prokaryote.'), solution: ['No true nucleus: prokaryote.', 'Prokaryotes are in Monera.'] },
        { id: 'bda-5', topic: 'Plant key', lessonId: 'bd-l4', competency: 'application', marks: 2, prompt: 'Pine.', question: choose('bda-5q', 'A pine has vascular tissue and seeds on cones, not in fruits. It is a…', [['gymnosperm', null], ['angiosperm', 'Angiosperms enclose their seeds in fruits.'], ['pteridophyte', 'Pteridophytes make no seeds.']], 'Naked seeds.'), solution: ['Seeds without fruits: gymnosperm.'] },
        { id: 'bda-6', topic: 'Shared ranks', lessonId: 'bd-l6', competency: 'application', marks: 2, prompt: 'Counting ranks.', question: num('bda-6q', 'A tiger and a lion share every rank from kingdom down to genus. How many of the seven ranks (kingdom, phylum, class, order, family, genus, species) do they share?', 6, 'Kingdom to genus is 6 ranks; only the species differs.', {}), solution: ['They differ only at species.', '7 − 1 = 6 shared ranks.'] },
        { id: 'bda-7', topic: 'Binomial', lessonId: 'bd-l6', competency: 'application', marks: 2, prompt: 'Correct name.', question: choose('bda-7q', 'Which scientific name follows all the rules for writing (when typed in plain text)?', [['Homo sapiens', null], ['Homo Sapiens', 'The species name must be in lower case.'], ['sapiens Homo', 'The genus comes first.']], 'Genus first, capital; species lower case.'), solution: ['Genus first with a capital letter; species in lower case.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'bda-8', topic: 'Q and R', lessonId: 'bd-l3', competency: 'analysis', marks: 2, prompt: 'Two eukaryotes.', question: choose('bda-8q', 'Organism Q is multicellular, walled, has no chlorophyll and grows on dead matter; R is a single cell with a nucleus that photosynthesises in light. Why are they in different kingdoms?', [['They differ in number of cells, wall and mode of nutrition: Q is a fungus, R a protist', null], ['Q has no nucleus', 'Both are eukaryotes with nuclei.'], ['They live in different places', 'Habitat is not a criterion of the five kingdom system.']], 'Organisation and nutrition.'), solution: ['Both are eukaryotes.', 'Q: multicellular, absorptive (Fungi); R: unicellular (Protista).'] },
        { id: 'bda-9', topic: 'Echinoderms', lessonId: 'bd-l5', competency: 'analysis', marks: 2, prompt: 'Internal skeleton.', question: choose('bda-9q', 'Starfish have a hard internal skeleton like vertebrates. Why are they classified as invertebrates?', [['They have no notochord at any stage', null], ['Their skeleton is outside the body', 'It is internal, made of calcium carbonate.'], ['They have no tissues', 'They have organ system level organisation.']], 'No notochord.'), solution: ['Chordates have a notochord at some stage.', 'Starfish never have one, so they are non-chordates.'] },
        { id: 'bda-10', topic: 'Changing science', lessonId: 'bd-l6', competency: 'analysis', marks: 2, prompt: 'Systems change.', question: choose('bda-10q', 'Classification has changed from two kingdoms to five and now three domains. What does this show about science?', [['Science revises its ideas as new tools and evidence appear', null], ['Earlier scientists were careless', 'They worked well with the evidence and tools of their time.'], ['Classification is just opinion', 'Each change was based on new evidence, such as microscopes and DNA.']], 'Evidence-led change.'), solution: ['Microscopes revealed the nucleus difference; DNA revealed the domains.', 'Science updates its models with new evidence.'] },
      ],
    },
  ],
};

/** Diagrams shown with the worked solutions of these practice items. */
export const DIVERSITY_SOLUTION_DIAGRAMS: Record<string, VisualRef> = {
  'bdx-1': { kind: 'protists', props: {}, alt: 'Paramecium is a single eukaryotic cell covered in cilia.' },
  'bdx-4': { kind: 'protists', props: {}, alt: 'Euglena swims with a flagellum and has chloroplasts.' },
  'bdx-2': { kind: 'fungusBody', props: {}, alt: 'A mould: threads with walls of chitin that absorb food.' },
  'bdx-8': { kind: 'simplePlants', props: {}, alt: 'An alga and a moss: neither has vascular tissue.' },
};
