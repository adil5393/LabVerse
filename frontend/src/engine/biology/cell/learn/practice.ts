/** Chapter 2 (Cell) practice bank and chapter assessment. Original questions; numbers checked by `__tests__/cell.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1, ref?: string): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: ref ? { kind: 'textbook-aligned', ref } : { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const CELL_PRACTICE: PracticeSet = {
  id: 'cell-practice', title: 'Cell chapter practice',
  groups: [
    {
      id: 'g-seeing', title: 'Seeing and measuring cells', blurb: 'Magnification and size estimates (Lesson 1).',
      items: [
        item('bcx-1', 'Magnification', '40X objective.', num('bcx-1q', 'A 10X eyepiece and a 40X objective are used. What is the total magnification?', 400, '10 × 40 = 400X.', { rules: [[[50], 'Lens powers multiply, they do not add.']] }), ['Multiply.'], ['400X.'], 'basic'),
        item('bcx-2', 'Estimating size', 'Root tip.', num('bcx-2q', 'The field is 0.5 mm across and 25 cells fit along it. Estimate the size of one cell in µm.', 20, '500 ÷ 25 = 20 µm.', { unit: 'µm', rules: [[[0.02], 'Convert 0.5 mm to 500 µm first, then divide.']] }), ['Convert to µm first.'], ['0.5 mm = 500 µm; 500 ÷ 25 = 20 µm.'], 'standard', 2),
        item('bcx-3', 'Apparent size', 'How big it looks.', num('bcx-3q', 'A 200 µm onion cell is viewed at 100X. How large does it appear, in mm?', 20, '200 × 100 = 20 000 µm = 20 mm.', { unit: 'mm', rules: [[[20000], 'That is in micrometres; divide by 1000 for millimetres.'], [[2], 'Multiply 200 µm by 100, then convert: 20 000 µm is 20 mm.']] }), ['Size × magnification.'], ['20 000 µm = 20 mm.'], 'challenge', 2),
      ],
    },
    {
      id: 'g-boundary', title: 'Membrane, osmosis and wall', blurb: 'Osmosis and the cell wall (Lessons 2 and 3).',
      items: [
        item('bcx-4', 'Osmosis', 'Two animal cells.', choose('bcx-4q', 'Animal cell X in pure water swells; animal cell Y in strong salt solution shrinks. The best explanation is…', [['Water moved into X and out of Y through the cell membrane', null], ['Salt moved into Y and made it shrink', 'The membrane holds back salt; water moved out of Y.'], ['Solute movement caused osmosis in both cells', 'Osmosis is the movement of water, not of the solute.']], 'Water moves.'), ['What crosses the membrane?'], ['Water entered X (hypotonic) and left Y (hypertonic).'], 'standard', 2, 'Revise, Reflect, Refine Q2'),
        item('bcx-5', 'Percentage change', 'Potato.', num('bcx-5q', 'A potato piece goes from 25 g to 20 g. What is the percentage change? (Use a minus sign for a loss.)', -20, '(20 − 25) ÷ 25 × 100 = −20 %.', { unit: '%', rules: [[[20], 'The piece lost mass, so the change is negative.'], [[-5], 'That is the change in grams, not the percentage.']] }), ['(final − initial) ÷ initial × 100.'], ['−20 %.'], 'standard'),
        item('bcx-6', 'Boiled potato', 'Potato cups.', choose('bcx-6q', 'Sugar is put in a hollow cup made from a boiled potato standing in water. Why does no water collect in the cup?', [['Boiling killed the cells, so their membranes no longer act as selectively permeable', null], ['Boiled potatoes contain no water', 'Boiled potatoes still contain plenty of water.'], ['Sugar cannot dissolve in a boiled potato', 'The sugar dissolves either way; the membranes are what changed.']], 'Dead membranes.'), ['What does heat do to living cells?'], ['Only living membranes are selectively permeable; osmosis needs them.'], 'challenge', 2, 'Revise, Reflect, Refine Q10'),
        item('bcx-7', 'Cell wall', 'Permeability.', choose('bcx-7q', 'Which pair is correct?', [['Cell wall: freely permeable; cell membrane: selectively permeable', null], ['Cell wall: selectively permeable; cell membrane: freely permeable', 'It is the other way round: the membrane is the selective layer.']], 'The membrane selects.'), ['Which one blocks salt?'], ['The wall lets water and minerals through; the membrane chooses.'], 'basic', 1, 'Revise, Reflect, Refine Q1(i)'),
      ],
    },
    {
      id: 'g-inside', title: 'Inside the cell', blurb: 'Cell types and organelles (Lessons 4 and 5).',
      items: [
        item('bcx-8', 'Plant and animal', 'Placed correctly.', choose('bcx-8q', 'Which pair is correct for "present in plant cells" and "absent in animal cells"?', [['Leucoplast and cell wall', null], ['Mitochondria and ribosome', 'Both are found in animal cells too.'], ['Lysosome and endoplasmic reticulum', 'Animal cells have both of these.']], 'Plastids and walls.'), ['Which parts do animal cells lack?'], ['Animal cells lack plastids and a cell wall.'], 'standard', 2, 'Revise, Reflect, Refine Q4'),
        item('bcx-9', 'DNA', 'Which contain DNA.', choose('bcx-9q', 'Which pair of organelles contains DNA?', [['Mitochondria and nucleus', null], ['Chloroplasts and ribosomes', 'Chloroplasts have DNA but ribosomes do not.'], ['Nucleus and lysosomes', 'Lysosomes hold enzymes, not DNA.']], 'Nucleus, mitochondria, plastids.'), ['Organelles that make some of their own proteins.'], ['Nucleus and mitochondria.'], 'basic', 1, 'Revise, Reflect, Refine Q7'),
        item('bcx-10', 'Mismatch', 'Function.', choose('bcx-10q', 'Which pairing of organelle and function is wrong?', [['Smooth ER: making cellulose', null], ['Ribosome: protein synthesis', 'This pairing is correct.'], ['Lysosome: breaking down unwanted material', 'This pairing is correct.']], 'Smooth ER makes lipids, not cellulose.'), ['What does smooth ER make?'], ['Smooth ER makes fats and some hormones; cellulose is part of the wall.'], 'challenge', 2, 'Revise, Reflect, Refine Q11'),
        item('bcx-11', 'Roots and plastids', 'Who is right.', choose('bcx-11q', 'One student says roots have no plastids because they are underground. Is that right?', [['No: roots have colourless leucoplasts that store food', null], ['Yes: plastids are only for photosynthesis', 'Only chloroplasts photosynthesise; leucoplasts store food and are found in roots.']], 'Leucoplasts.'), ['Not all plastids are green.'], ['Roots contain leucoplasts that store starch.'], 'standard', 2, 'Revise, Reflect, Refine Q5'),
      ],
    },
    {
      id: 'g-division', title: 'Cell division', blurb: 'Mitosis, meiosis and the cell theory (Lesson 6).',
      items: [
        item('bcx-12', 'Rounds of mitosis', 'Doubling.', num('bcx-12q', 'One cell divides by mitosis 6 times in a row. How many cells are there?', 64, '2 × 2 × 2 × 2 × 2 × 2 = 64.', { rules: [[[12], 'Each round doubles the cells; it does not add two.']] }), ['Doubling each time.'], ['64 cells.'], 'standard'),
        item('bcx-13', 'Meiosis', 'Gametes.', num('bcx-13q', 'A cell with 24 chromosomes divides by meiosis. How many chromosomes are in each gamete?', 12, '24 ÷ 2 = 12.', { rules: [[[24], 'Meiosis halves the chromosome number.'], [[6], 'Meiosis halves once; it does not quarter the number.']] }), ['Halved.'], ['12.'], 'basic'),
        item('bcx-14', 'Plant tumours', 'Crown gall.', choose('bcx-14q', 'Can plants develop tumours?', [['Yes: uncontrolled division, for example caused by bacteria in crown gall, can form tumour-like swellings', null], ['No: plant cells cannot divide', 'Plant cells divide, for example in root and shoot tips.']], 'Uncontrolled division.'), ['Think of crown gall disease.'], ['Plants lack contact inhibition; some infections cause swellings.'], 'challenge', 2, 'Revise, Reflect, Refine Q13'),
      ],
    },
  ],
};

export const CELL_ASSESSMENT: ChapterAssessment = {
  id: 'cell-assessment-1',
  title: 'Cell: The Building Block of Life: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'bca-1', topic: 'Cell membrane', lessonId: 'bc-l2', competency: 'knowledge', marks: 1, prompt: 'Property.', question: choose('bca-1q', 'The cell membrane is described as selectively permeable because it…', [['lets some substances through and blocks others', null], ['lets every substance through', 'That would be freely permeable, like the cell wall.'], ['blocks every substance', 'Water and oxygen do pass through it.']], 'Selective.'), solution: ['It allows water through but holds back salt and sugar.'] },
        { id: 'bca-2', topic: 'Prokaryotes', lessonId: 'bc-l4', competency: 'knowledge', marks: 1, prompt: 'Example.', question: choose('bca-2q', 'Which of these is a prokaryote?', [['A bacterium', null], ['An onion peel cell', 'Onion cells have a nucleus: eukaryotic.'], ['A cheek cell', 'Cheek cells have a nucleus: eukaryotic.']], 'No nucleus.'), solution: ['Bacteria have a nucleoid, not a nucleus.'] },
        { id: 'bca-3', topic: 'Organelles', lessonId: 'bc-l5', competency: 'knowledge', marks: 1, prompt: 'Function.', question: choose('bca-3q', 'Cellular respiration takes place mainly in…', [['mitochondria', null], ['chloroplasts', 'Chloroplasts carry out photosynthesis.'], ['the Golgi apparatus', 'The Golgi packages materials.']], 'Powerhouses.'), solution: ['Mitochondria release energy and store it as ATP.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'bca-4', topic: 'Estimating size', lessonId: 'bc-l1', competency: 'application', marks: 2, prompt: 'Field of view.', question: num('bca-4q', 'A field is 4 mm across and 16 cells fit along it. Estimate one cell’s size in µm.', 250, '4000 ÷ 16 = 250 µm.', { unit: 'µm' }), solution: ['4 mm = 4000 µm.', '4000 ÷ 16 = 250 µm.'] },
        { id: 'bca-5', topic: 'Osmosis', lessonId: 'bc-l3', competency: 'application', marks: 2, prompt: 'Rhoeo peel.', question: choose('bca-5q', 'A Rhoeo leaf peel is placed in 20 % sugar solution. What do you see?', [['The walls keep their shape and the contents shrink away from them', null], ['The cells swell and burst', 'Swelling happens in a dilute solution; this one is concentrated.'], ['Nothing changes', 'The solution is hypertonic, so water leaves the cells.']], 'Plasmolysis.'), solution: ['Hypertonic solution: water leaves.', 'The rigid wall keeps its shape; the membrane pulls away.'] },
        { id: 'bca-6', topic: 'Meiosis', lessonId: 'bc-l6', competency: 'application', marks: 2, prompt: 'Chromosomes.', question: num('bca-6q', 'A cell with 40 chromosomes divides by meiosis. How many chromosomes does each daughter cell have?', 20, '40 ÷ 2 = 20.', {}), solution: ['Meiosis halves the number: 20, in each of four cells.'] },
        { id: 'bca-7', topic: 'Percentage change', lessonId: 'bc-l2', competency: 'application', marks: 2, prompt: 'Potato.', question: num('bca-7q', 'A potato piece goes from 40 g to 44 g in a solution. What is the percentage change in mass?', 10, '(44 − 40) ÷ 40 × 100 = 10 %.', { unit: '%' }), solution: ['Gain 4 g.', '4 ÷ 40 × 100 = 10 %: the solution was hypotonic.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'bca-8', topic: 'Cell wall', lessonId: 'bc-l3', competency: 'analysis', marks: 2, prompt: 'Plants and animals.', question: choose('bca-8q', 'Why do plant cells need a cell wall but animal cells do not?', [['Plants stay in one place and need rigid support against wind and rain; animals need flexible cells to move', null], ['Animal cells have no cytoplasm to protect', 'Animal cells have cytoplasm; they lack a wall because flexibility helps movement.'], ['Plant cells are prokaryotic', 'Plant cells are eukaryotic.']], 'Support versus flexibility.'), solution: ['Fixed plants need rigid support.', 'Moving animals benefit from flexible cells.'] },
        { id: 'bca-9', topic: 'Mitochondria and chloroplasts', lessonId: 'bc-l5', competency: 'analysis', marks: 2, prompt: 'Similarity.', question: choose('bca-9q', 'Which feature do mitochondria and chloroplasts share that suggests a history with bacteria?', [['They have their own DNA and ribosomes', null], ['They both make starch', 'Only chloroplasts make and store sugars and starch.'], ['They both contain chlorophyll', 'Only chloroplasts contain chlorophyll.']], 'Own DNA.'), solution: ['Both have two membranes, their own DNA and ribosomes.', 'This suggests a shared history with bacteria.'] },
        { id: 'bca-10', topic: 'Surface area', lessonId: 'bc-l5', competency: 'analysis', marks: 2, prompt: 'Many small mitochondria.', question: choose('bca-10q', 'Why does a cell have many small mitochondria rather than one giant one?', [['Many small ones have more surface for each unit of volume, so reactions and exchange are faster', null], ['A giant mitochondrion would make too much ATP', 'The point is surface area, not too much energy.'], ['Mitochondria cannot grow', 'The reason is surface area for each unit of volume.']], 'Surface to volume.'), solution: ['Smaller objects have a larger surface-to-volume ratio (6 ÷ side for a cube).', 'More membrane is available for energy-releasing reactions.'] },
      ],
    },
  ],
};
