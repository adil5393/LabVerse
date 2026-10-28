/**
 * Chapter 2, Units 1 and 2 (Lessons 1 to 3): seeing cells with a microscope and estimating their size, the selectively
 * permeable membrane and osmosis, and the cell wall. Aligned to NCERT Exploration (2026-27) Sections 2.1 to 2.2.2 and
 * Activities 2.1 to 2.3. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';

export const CELL_LAB = '/biology/cell/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const C1: EduLesson = {
  id: 'bc-l1', unitId: 'bc-unit-1', number: 1, title: 'Seeing the invisible: the microscope',
  objective: 'explain why cells need a microscope, calculate total magnification, and estimate the size of a cell from the field of view.',
  prerequisiteIds: ['bcp-lens', 'bcp-units'],
  objectives: [
    { id: 'resolution', label: 'Explain the limit of resolution of the eye' },
    { id: 'magnify', label: 'Calculate the total magnification of a microscope' },
    { id: 'estimate', label: 'Estimate the size of a cell using the field of view' },
  ],
  steps: [
    {
      id: 'bc1-limit', title: 'Too small to see', phase: 'observe',
      paragraphs: [
        'Every living thing is made of cells. A bacterium or a yeast is a single cell; a neem tree or a person is made of millions of cells working together.',
        'Draw two dots on paper and bring them closer. From about 25 cm away, dots closer than about 0.1 mm merge into one. This is the limit of resolution of the human eye. Most cells are much smaller than 0.1 mm, so the eye alone cannot show them.',
      ],
      visual: v('sizeLadder', {}, 'A size ladder from a chicken egg down to proteins, showing which objects the unaided eye, a light microscope or an electron microscope can reveal.'),
      check: pick('chk-bc1-limit', 'Why can you not see an onion cell without a microscope?', [['It is smaller than the eye’s limit of resolution', null], ['It is transparent only at night', 'Light and time of day are not the reason; size is.', 'irrelevant-cause'], ['Cells are not real structures', 'Cells are real; Hooke first saw them in 1665 with a microscope.', 'cells-unreal']], 'Smaller than about 0.1 mm.', undefined, 'bc1-limit'),
    },
    {
      id: 'bc1-magnify', title: 'Two lenses multiply', phase: 'reasoning',
      paragraphs: [
        'In 1665 Robert Hooke looked at a thin slice of cork through a microscope he built himself and saw tiny box-like compartments. He called them cells.',
        'A school light microscope has an eyepiece and objective lenses. The total magnification is the eyepiece power times the objective power: a 10X eyepiece with a 40X objective gives 400X. Good microscopes also improve resolution (clarity) and contrast (difference in brightness between parts).',
      ],
      visual: v('microscope', { specimen: 'onion', objective: 10, editable: true }, 'A virtual light microscope showing onion peel cells, with controls for the objective lens, focus and stain.'),
      check: pick('chk-bc1-magnify', 'A 15X eyepiece is used with a 10X objective. The total magnification is…', [['150X', null], ['25X', 'The powers multiply, they do not add: 15 × 10.', 'add-not-multiply'], ['10X', 'Both lenses magnify; the eyepiece power counts too.', 'objective-only']], '15 × 10 = 150.', undefined, 'bc1-magnify'),
    },
    {
      id: 'bc1-estimate', title: 'Estimating the size of a cell', phase: 'apply',
      paragraphs: [
        'Place a transparent ruler on the stage and read the diameter of the circular field, say 5 mm, which is 5000 micrometres (µm). Then put in an onion peel slide and count the cells along that diameter.',
        'Size of one cell = field diameter ÷ number of cells across. If 25 cells fit across 5000 µm, each cell is about 5000 ÷ 25 = 200 µm. At 100X such a cell looks 100 times larger, about 20 mm, easily visible.',
      ],
      prediction: { id: 'pr-bc1-zoom', prompt: 'Predict: you switch from the 4X to the 10X objective. What happens to the number of onion cells across the field?', options: [{ id: 'p1', text: 'More cells fit across' }, { id: 'p2', text: 'Fewer cells fit across, but each looks bigger' }, { id: 'p3', text: 'The number stays the same' }], expectedId: 'p2', reveal: 'Higher magnification shows a smaller part of the slide. The field shrinks from 5 mm to 2 mm, so only about 10 cells fit across instead of 25.' },
      check: pick('chk-bc1-estimate', 'The field is 2000 µm across and 10 cells fit along it. Each cell is about…', [['200 µm', null], ['20 000 µm', 'Divide the field by the number of cells; do not multiply.', 'multiply-not-divide'], ['10 µm', 'Divide the field diameter by the count: 2000 ÷ 10.', 'count-as-size']], '2000 ÷ 10 = 200 µm.', undefined, 'bc1-estimate'),
    },
  ],
  investigation: { title: 'Estimate a cell’s size with the virtual microscope', description: 'Measure the field with the ruler, count cells and estimate.', href: `${CELL_LAB}?view=microscope`, buttonLabel: 'Open the microscope' },
  worked: {
    id: 'w-bc-l1', title: 'Cheek cells under the 10X objective',
    given: ['Eyepiece 10X, objective 10X.', 'The ruler shows a field 2 mm across.', '33 cheek cells line up along the diameter.'],
    ask: 'Find the total magnification and estimate the size of one cheek cell.',
    steps: [
      { text: 'Total magnification = 10 × 10 = 100X.', why: 'The eyepiece and objective powers multiply.' },
      { text: 'Field diameter = 2 mm = 2 × 1000 = 2000 µm.', why: '1 mm is 1000 micrometres.' },
      { text: 'Cell size ≈ 2000 ÷ 33 ≈ 61 µm.', why: 'The field is shared equally by the cells counted across it.' },
    ],
    verify: '61 µm × 33 ≈ 2000 µm, the field diameter.',
  },
  guided: {
    id: 'g-bc-l1', prompt: 'Estimate the size of a root tip cell.',
    steps: [
      { id: 'g1', prompt: 'Field.', question: num('bc-g1-1', 'With the 40X objective the field is 0.5 mm across. How many micrometres is that?', 500, '0.5 × 1000 = 500 µm.', { unit: 'µm', rules: [[[50], 'Multiply by 1000: 1 mm is 1000 micrometres, not 100.', 'factor-100']] }), hints: ['1 mm = 1000 µm.'] },
      { id: 'g2', prompt: 'Size.', question: num('bc-g1-2', '20 root tip cells fit across the 500 µm field. What is the size of one cell, in µm?', 25, '500 ÷ 20 = 25 µm.', { unit: 'µm', rules: [[[10000], 'Divide the field by the number of cells; do not multiply.', 'multiply-not-divide']] }), hints: ['Size = field ÷ count.'] },
    ],
    conclusion: 'Root tip cells (about 25 µm) are much smaller than onion peel cells (about 200 µm).',
  },
  independent: [
    ind('i1', 'Magnification', 'magnify', 'Total power.', num('bc-l1-i1', 'A 10X eyepiece is used with a 4X objective. What is the total magnification?', 40, '10 × 4 = 40X.', { rules: [[[14], 'Lens powers multiply, they do not add.', 'add-not-multiply']] }), ['Multiply.'], ['10 × 4 = 40X.']),
    ind('i2', 'Estimating size', 'estimate', 'Field count.', num('bc-l1-i2', 'A 5000 µm field holds 50 cells across. Estimate one cell’s size in µm.', 100, '5000 ÷ 50 = 100 µm.', { unit: 'µm', rules: [[[250000], 'Divide; the cells share the field between them.', 'multiply-not-divide']] }), ['Field ÷ number of cells.'], ['5000 ÷ 50 = 100 µm.']),
    ind('i3', 'Resolution', 'resolution', 'Meaning.', pick('bc-l1-i3', 'The limit of resolution of the eye (about 0.1 mm) means…', [['two points closer than this look like one', null], ['objects smaller than this are invisible in any microscope', 'Microscopes reveal much smaller objects; the 0.1 mm limit is for the unaided eye.', 'limit-everywhere'], ['the eye magnifies 0.1 times', 'Resolution is about separating two points, not magnifying.', 'resolution-magnify']], 'Separate points.'), ['Think of two dots.'], ['Closer than 0.1 mm, two dots merge.']),
    ind('i4', 'Electron microscope', 'resolution', 'Ribosomes.', pick('bc-l1-i4', 'Ribosomes can be seen with an electron microscope but never with a light microscope, even at the highest power. Why?', [['They are smaller than the light microscope’s limit of resolution', null], ['Light microscopes cannot magnify above 10X', 'School light microscopes reach 400X or more; the problem is resolution, not magnification.', 'resolution-magnify'], ['Ribosomes are only found in dead cells', 'Ribosomes are in every living cell.', 'irrelevant-cause']], 'Below about 0.2 µm.'), ['Is it magnification or clarity?'], ['Below about 0.2 µm, light cannot separate details; magnifying more only enlarges a blur.']),
  ],
  reflection: {
    discover: 'Cells are below the eye’s limit of resolution; a microscope’s lenses multiply their powers, and the field of view lets you estimate a cell’s real size.',
    evidence: 'You calculated total magnification and estimated cell sizes from field diameters and counts.',
    stillConfusing: [
      { text: 'Why do the lens powers multiply?', refresherId: 'bc1-magnify' },
      { text: 'How does the cell-size estimate work?', refresherId: 'bc1-estimate' },
    ],
  },
};

export const C2: EduLesson = {
  id: 'bc-l2', unitId: 'bc-unit-2', number: 2, title: 'The cell membrane and osmosis',
  objective: 'describe the cell membrane as selectively permeable, explain osmosis using the potato experiment, and predict what happens in hypotonic, isotonic and hypertonic solutions.',
  prerequisiteIds: ['bcp-diffusion'],
  objectives: [
    { id: 'membrane', label: 'Describe the structure and job of the cell membrane' },
    { id: 'osmosis', label: 'Explain osmosis as the diffusion of water through a membrane' },
    { id: 'tonicity', label: 'Predict the effect of hypotonic, isotonic and hypertonic solutions' },
  ],
  steps: [
    {
      id: 'bc2-potato', title: 'Two potato pieces', phase: 'observe',
      paragraphs: [
        'Cut a potato into two pieces of about the same size and weigh them. Put one in plain water (beaker A) and the other in 20 per cent salt or sugar solution (beaker B). Weigh them again after about an hour.',
        'Cutting equal pieces and weighing them first matters: it lets you compare the change fairly.',
      ],
      prediction: { id: 'pr-bc2-potato', prompt: 'Predict: what happens to the two pieces?', options: [{ id: 'p1', text: 'Both gain mass' }, { id: 'p2', text: 'The one in water gains mass; the one in salt solution loses mass' }, { id: 'p3', text: 'Neither changes' }], expectedId: 'p2', reveal: 'The piece in water swells and gets heavier; the piece in salt solution shrinks and gets lighter. Water, not salt, has moved.' },
      visual: v('osmosis', { mode: 'potato', outside: 0, editable: true }, 'A potato piece in a beaker of solution. Change the concentration and see the piece gain or lose mass.'),
      check: pick('chk-bc2-potato', 'Why does the potato piece in salt solution lose mass?', [['Water moves out of its cells into the more concentrated solution', null], ['Salt dissolves the potato', 'The potato does not dissolve; it loses water.', 'solute-moves'], ['The cells fill with salt and sink', 'The membrane blocks the salt; water is what moves.', 'solute-moves']], 'Water moves out.', undefined, 'bc2-potato'),
    },
    {
      id: 'bc2-membrane', title: 'A selectively permeable membrane', phase: 'reasoning',
      paragraphs: [
        'Every cell has a cell membrane (plasma membrane) around it. It is only about 7 to 10 nm thick, made of a double layer of lipid molecules with proteins set into it. The molecules can move sideways and rotate, so it is fluid, and it is patterned like tiles in a mosaic: the fluid-mosaic model.',
        'The membrane is selectively permeable: water passes through, but salt and sugar do not. Proteins in it act like gatekeepers for other substances.',
      ],
      vocabulary: [{ term: 'selectively permeable', meaning: 'letting some substances through and blocking others' }],
      check: pick('chk-bc2-membrane', 'What is the cell membrane mainly made of?', [['Lipids and proteins', null], ['Cellulose', 'Cellulose makes up the plant cell wall, not the membrane.', 'wall-membrane'], ['DNA', 'DNA is in the nucleus; it does not build the membrane.', 'part-mixup']], 'A lipid bilayer with proteins.', undefined, 'bc2-membrane'),
    },
    {
      id: 'bc2-osmosis', title: 'Osmosis and three kinds of solution', phase: 'conjecture',
      paragraphs: [
        'Water moves through a selectively permeable membrane from a dilute solution (more water, less solute) to a concentrated one, until the two are equal. This is osmosis: diffusion of water across a membrane. Root cells take in water from the soil this way.',
        'Compare the outside solution with the inside of the cell. Hypotonic: the outside is more dilute, so water enters. Isotonic: they are equal, so there is no net movement. Hypertonic: the outside is more concentrated, so water leaves.',
      ],
      visual: v('osmosis', { mode: 'cell', kind: 'animal', outside: 0, editable: true }, 'A single cell in a solution. Change the solution from hypotonic to isotonic to hypertonic and watch water move in or out.'),
      check: pick('chk-bc2-osmosis', 'A cell is placed in a solution more concentrated than its contents. The solution is…', [['hypertonic, so water leaves the cell', null], ['hypotonic, so water enters the cell', 'Hypotonic means the outside is more dilute; here it is more concentrated.', 'hypo-hyper'], ['isotonic, so nothing happens', 'Isotonic means equal concentrations; these are different.', 'iso-mixup']], 'Hypertonic.', undefined, 'bc2-osmosis'),
    },
  ],
  investigation: { title: 'Run the osmosis bench', description: 'Try potato pieces and single cells in different solutions.', href: `${CELL_LAB}?view=osmosis`, buttonLabel: 'Open the osmosis bench' },
  worked: {
    id: 'w-bc-l2', title: 'Reading a potato result',
    given: ['A potato piece weighs 20.0 g before and 22.4 g after an hour in a solution.'],
    ask: 'Find the percentage change and decide what kind of solution it was.',
    steps: [
      { text: 'Change = 22.4 − 20.0 = +2.4 g.', why: 'Final minus initial gives the gain or loss.' },
      { text: 'Percentage change = 2.4 ÷ 20.0 × 100 = +12 %.', why: 'Dividing by the starting mass lets us compare pieces of different sizes.' },
      { text: 'It gained water, so the solution was more dilute than the cell sap: hypotonic (for example, plain water).', why: 'Water moves into the cells only from a more dilute solution.' },
    ],
    verify: '20.0 × 1.12 = 22.4 g.',
  },
  guided: {
    id: 'g-bc-l2', prompt: 'Work out what happened to a piece in strong salt solution.',
    steps: [
      { id: 'g1', prompt: 'Change.', question: num('bc-g2-1', 'A piece goes from 30 g to 24 g. What is the percentage change? (Use a minus sign for a loss.)', -20, '(24 − 30) ÷ 30 × 100 = −20 %.', { unit: '%', rules: [[[20], 'The piece got lighter, so the change is a loss: −20 %.', 'sign-slip'], [[-6], 'That is the change in grams; divide by 30 and multiply by 100 for a percentage.', 'grams-not-percent']] }), hints: ['(final − initial) ÷ initial × 100.'] },
      { id: 'g2', prompt: 'Solution.', question: pick('bc-g2-2', 'So the salt solution was…', [['hypertonic to the potato cells', null], ['hypotonic to the potato cells', 'A hypotonic solution would make the piece gain water.', 'hypo-hyper']], 'Water left the cells.'), hints: ['Which way did water move?'] },
    ],
    conclusion: 'Loss of mass means water left the cells: the outside solution was hypertonic.',
  },
  independent: [
    ind('i1', 'Osmosis', 'osmosis', 'Definition.', pick('bc-l2-i1', 'Osmosis is the movement of…', [['water through a selectively permeable membrane', null], ['salt through a membrane into the cell', 'In osmosis the solute is held back; water moves.', 'solute-moves'], ['any particle from low to high concentration', 'Diffusion goes from high to low; osmosis is specifically water across a membrane.', 'gradient-reverse']], 'Water across a membrane.'), ['What moves?'], ['Water moves through the membrane.']),
    ind('i2', 'Tonicity', 'tonicity', 'Plain water.', pick('bc-l2-i2', 'Compared with a cell, pure water is…', [['hypotonic', null], ['hypertonic', 'Pure water has no solute, so it is more dilute than the cell.', 'hypo-hyper'], ['isotonic', 'The cell contains dissolved substances, so the concentrations are not equal.', 'iso-mixup']], 'More dilute.'), ['Which has less solute?'], ['Water is more dilute: hypotonic; water enters the cell.']),
    ind('i3', 'Membrane', 'membrane', 'Fluid mosaic.', pick('bc-l2-i3', 'Why is the membrane model called "fluid"?', [['Its molecules can move sideways, flip and rotate', null], ['It is a liquid that leaks out of the cell', 'It does not leak; it is a stable boundary whose molecules can move within it.', 'fluid-literal']], 'Moving molecules.'), ['What can the lipid molecules do?'], ['They move within the layer, so the membrane is fluid.']),
    ind('i4', 'Seeds', 'osmosis', 'Mung beans.', pick('bc-l2-i4', 'Mung beans soaked in water for 12 hours are put into a concentrated salt solution. What happens?', [['They lose water and shrink', null], ['They swell even more', 'Swelling needs a more dilute outside solution; this one is concentrated.', 'hypo-hyper'], ['Nothing, because seeds have no cells', 'Seeds are made of living cells.', 'cells-unreal']], 'Hypertonic outside.'), ['Compare the solution with the seed’s cells.'], ['The solution is hypertonic; water leaves; the seeds shrink.']),
  ],
  reflection: {
    discover: 'The fluid-mosaic membrane lets water through but holds back salt and sugar, so water moves by osmosis from the dilute side to the concentrated side.',
    evidence: 'You explained the potato results, calculated percentage changes and named hypotonic, isotonic and hypertonic solutions.',
    stillConfusing: [
      { text: 'Which way does water move in osmosis?', refresherId: 'bc2-osmosis' },
      { text: 'What does selectively permeable mean?', refresherId: 'bc2-membrane' },
    ],
  },
};

export const C3: EduLesson = {
  id: 'bc-l3', unitId: 'bc-unit-2', number: 3, title: 'The cell wall: plant cells versus cheek cells',
  objective: 'compare onion peel and cheek cells, explain why plant cells keep their shape in sugar solution while cheek cells shrink, and state what the cell wall is made of and why plants need it.',
  prerequisiteIds: ['bcp-diffusion'],
  objectives: [
    { id: 'compare', label: 'Compare onion peel and cheek cells under the microscope' },
    { id: 'plasmolysis', label: 'Explain what happens to plant and animal cells in sugar solution' },
    { id: 'wall', label: 'Explain the structure and job of the cell wall' },
  ],
  steps: [
    {
      id: 'bc3-slides', title: 'Two slides', phase: 'observe',
      paragraphs: [
        'A thin onion peel (or Rhoeo leaf peel) stained with safranin shows box-shaped cells in neat rows. Cheek cells, gently scraped with a clean cotton swab and stained with methylene blue, are flat, irregular and lie apart.',
        'Why the difference? Plant cells have an extra layer outside the membrane that cheek cells lack.',
      ],
      visual: v('microscope', { specimen: 'cheek', objective: 40, editable: true, specimens: ['onion', 'cheek', 'rhoeo-sugar'] }, 'The virtual microscope with onion peel, cheek cell and Rhoeo-in-sugar slides to compare.'),
      check: pick('chk-bc3-slides', 'Under the microscope, onion peel cells look…', [['box-shaped and regularly arranged', null], ['irregular and scattered', 'That describes cheek cells, which have no cell wall.', 'plant-animal-swap'], ['round and moving', 'Onion peel cells are fixed in rows; they do not move.', 'irrelevant-cause']], 'Box-shaped rows.', undefined, 'bc3-slides'),
    },
    {
      id: 'bc3-sugar', title: 'Into sugar solution', phase: 'conjecture',
      paragraphs: [
        'Add 20 per cent sugar solution to fresh slides and wait half an hour. The plant cells keep their outlines, but their contents shrink and pull away from the walls; the gap between the inner and outer boundaries grows. The cheek cells shrink as a whole.',
        'Both lose water by osmosis. The difference is the rigid cell wall: it holds the plant cell’s shape while the membrane pulls away from it (plasmolysis). Cheek cells have no wall, so the whole cell shrinks.',
      ],
      visual: v('osmosis', { mode: 'cell', kind: 'plant', outside: 20, editable: true }, 'A plant cell in strong sugar solution: the wall keeps its shape while the membrane and contents pull away from it.'),
      check: pick('chk-bc3-sugar', 'Why do plant cells keep their outline in strong sugar solution?', [['The rigid cell wall keeps its shape while the contents shrink', null], ['Plant cells do not lose water', 'They do lose water; that is why the contents shrink.', 'no-water-loss'], ['Sugar enters the cells and fills them', 'The membrane holds sugar back; water leaves.', 'solute-moves']], 'The wall holds the shape.', undefined, 'bc3-sugar'),
    },
    {
      id: 'bc3-wall', title: 'Why plants need walls', phase: 'reasoning',
      paragraphs: [
        'Plants stay in one place and must withstand wind and rain, so their cells have a cell wall outside the membrane. It keeps leaves and flowers firm and helps plants stay upright. It is made mainly of cellulose, a carbohydrate built from many glucose units; in our food, cellulose is roughage that helps digestion.',
        'The wall is rigid but permeable: water and dissolved minerals pass through it. Together with the selectively permeable membrane, this helps roots absorb water. Fungi and bacteria also have walls. Animal cells have none, which lets them change shape and helps animals move.',
      ],
      check: pick('chk-bc3-wall', 'Which statement about the plant cell wall is correct?', [['It is rigid but lets water and minerals through', null], ['It is selectively permeable, like the membrane', 'The wall is freely permeable; the membrane is the selective one.', 'wall-membrane'], ['It is made of protein', 'Plant cell walls are made mainly of cellulose.', 'wall-material']], 'Rigid and permeable.', undefined, 'bc3-wall'),
    },
  ],
  investigation: { title: 'Compare slides in the virtual microscope', description: 'Switch between onion, cheek and Rhoeo-in-sugar slides.', href: `${CELL_LAB}?view=microscope`, buttonLabel: 'Open the microscope' },
  worked: {
    id: 'w-bc-l3', title: 'Explaining a limp carrot',
    given: ['Carrot A in plain water stays stiff and crunchy.', 'Carrot B in concentrated salt solution becomes rubbery and limp.'],
    ask: 'Explain both results using osmosis and the cell wall.',
    steps: [
      { text: 'Plain water is hypotonic, so water enters carrot A’s cells; the vacuoles fill and press against the walls, so the cells are firm.', why: 'Water moves into a more concentrated cell; the wall stops it bursting.' },
      { text: 'Salt solution is hypertonic, so water leaves carrot B’s cells; the contents shrink away from the walls.', why: 'Water moves out to the more concentrated solution.' },
      { text: 'Cells without pressure inside are soft, so carrot B is limp.', why: 'Firmness comes from the full vacuole pushing on the wall.' },
    ],
    verify: 'Both results come from the same rule: water moves towards the more concentrated side.',
  },
  guided: {
    id: 'g-bc-l3', prompt: 'Put the events of plasmolysis in order and compare with a cheek cell.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bc-g3-1', 'Order what happens to a plant cell in strong sugar solution.', [{ id: 'a', text: 'Water leaves the cell by osmosis', needs: [] }, { id: 'b', text: 'The vacuole and contents shrink', needs: ['a'] }, { id: 'c', text: 'The membrane pulls away from the wall, which keeps its shape', needs: ['b'] }], ['c', 'a', 'b'], 'Water loss, shrinking, pulling away.'), hints: ['Start with water moving.'] },
      { id: 'g2', prompt: 'Cheek cell.', question: pick('bc-g3-2', 'In the same solution, a cheek cell…', [['shrinks as a whole, because it has no wall', null], ['keeps its outline', 'Only cells with a rigid wall keep their outline.', 'plant-animal-swap']], 'No wall.'), hints: ['Does a cheek cell have a wall?'] },
    ],
    conclusion: 'The wall, not the membrane, explains why plant cells keep their shape.',
  },
  independent: [
    ind('i1', 'Cell wall', 'wall', 'Material.', pick('bc-l3-i1', 'The plant cell wall is made mainly of…', [['cellulose', null], ['lipids', 'Lipids build the cell membrane, not the wall.', 'wall-membrane'], ['chitin', 'Chitin is found in fungal walls, not plant walls.', 'wall-material']], 'Cellulose.'), ['Roughage in food.'], ['Cellulose, made of glucose units.']),
    ind('i2', 'Who has walls', 'wall', 'Organisms.', pick('bc-l3-i2', 'Which cells have a cell wall?', [['Plant, fungal and bacterial cells', null], ['Only plant cells', 'Fungi and bacteria also have cell walls.', 'wall-only-plants'], ['All cells, including animal cells', 'Animal cells have only a membrane.', 'plant-animal-swap']], 'Plants, fungi, bacteria.'), ['Three groups.'], ['Plants, fungi and bacteria.']),
    ind('i3', 'Flexible wall', 'wall', 'Thought experiment.', pick('bc-l3-i3', 'If a plant cell’s wall became as flexible as a membrane, the cell would most likely…', [['swell and might burst in water, and the plant would droop', null], ['make more food', 'The wall does not make food; its job is support.', 'irrelevant-cause'], ['stop all osmosis', 'Osmosis happens through the membrane, wall or no wall.', 'no-water-loss']], 'No support.'), ['What does the wall resist?'], ['Without a rigid wall, water entering would swell it and the plant would lose support.']),
    ind('i4', 'Plasmolysis', 'plasmolysis', 'Observation.', pick('bc-l3-i4', 'In a Rhoeo peel in sugar solution, the space between the wall and the shrunken contents is filled with…', [['the outside sugar solution, which passes through the permeable wall', null], ['air', 'The cells are under liquid; the permeable wall lets the solution in.', 'irrelevant-cause'], ['nothing at all', 'A permeable wall lets the outside solution fill the gap.', 'wall-membrane']], 'The wall is permeable.'), ['Is the wall permeable?'], ['The permeable wall lets the sugar solution into the gap.']),
  ],
  reflection: {
    discover: 'Plant cells have a rigid, permeable cellulose wall outside the membrane; it keeps their shape when water is lost, while cheek cells, with no wall, shrink.',
    evidence: 'You compared slides, explained plasmolysis and the limp carrot, and reasoned about a flexible wall.',
    stillConfusing: [
      { text: 'Why do plant cells keep their outline?', refresherId: 'bc3-sugar' },
      { text: 'How is the wall different from the membrane?', refresherId: 'bc3-wall' },
    ],
  },
};
