/**
 * Chapter 2, Units 3 and 4 (Lessons 4 to 6): prokaryotic and eukaryotic cells and the nucleus, the organelles of a eukaryotic
 * cell, and cell division with the cell theory. Aligned to NCERT Exploration (2026-27) Sections 2.3 to 2.5, Tables 2.1 and 2.2,
 * Activities 2.4 and 2.5. Original wording.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';
import { CELL_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const C4: EduLesson = {
  id: 'bc-l4', unitId: 'bc-unit-3', number: 4, title: 'Prokaryotic and eukaryotic cells',
  objective: 'compare bacterial, plant and animal cells, classify cells as prokaryotic or eukaryotic, and describe the nucleus and how DNA is packed into chromosomes.',
  prerequisiteIds: ['bcp-living'],
  objectives: [
    { id: 'compare', label: 'Compare the parts of bacterial, plant and animal cells (Table 2.1)' },
    { id: 'classify', label: 'Classify a cell as prokaryotic or eukaryotic (Table 2.2)' },
    { id: 'nucleus', label: 'Describe the nucleus, chromatin, chromosomes and genes' },
  ],
  steps: [
    {
      id: 'bc4-three', title: 'Three typical cells', phase: 'observe',
      paragraphs: [
        'Most cells have three basic parts: a plasma membrane, a jelly-like cytoplasm and genetic material. Compare a typical bacterial cell, plant cell and animal cell part by part.',
        'The bacterial cell has a wall, membrane, cytoplasm and ribosomes, but its DNA lies loose in a region called the nucleoid, with no membrane around it. Plant and animal cells have a nucleus with a membrane and many membrane-bound organelles.',
      ],
      visual: v('cellCompare', { type: 'bacterial', editable: true }, 'A typical bacterial, plant and animal cell. Choose a cell and tap a part to see what it does and which cells have it.'),
      check: pick('chk-bc4-three', 'Which part do bacterial, plant and animal cells all have?', [['Cell membrane', null], ['Nucleus with a membrane', 'Bacteria have no membrane-bound nucleus, only a nucleoid.', 'bacteria-nucleus'], ['Cell wall', 'Animal cells have no cell wall.', 'plant-animal-swap']], 'All cells have a membrane.', undefined, 'bc4-three'),
    },
    {
      id: 'bc4-pro', title: 'Prokaryotic and eukaryotic', phase: 'reasoning',
      paragraphs: [
        'Cells without a well-defined nucleus and without membrane-bound organelles are prokaryotic ("pro" primitive, "karyon" nucleus). Bacteria are prokaryotes; they are usually single cells about 1 to 10 µm across, and most of their activities happen in the cytoplasm.',
        'Cells with a membrane-bound nucleus and organelles are eukaryotic ("eu" true). They are larger, about 10 to 100 µm, and may form single-celled or multicellular organisms. In eukaryotic cells a network of fibres, the cytoskeleton, supports the cell and moves materials around. Viruses are not cells at all.',
      ],
      visual: v('cellCompare', { type: 'bacterial', part: 'nucleoid' }, 'A bacterial cell with numbered parts. Its DNA lies in a nucleoid with no membrane around it.'),
      check: pick('chk-bc4-pro', 'A cell has DNA but no membrane-bound nucleus or organelles. It is…', [['prokaryotic, like a bacterium', null], ['eukaryotic, like a plant cell', 'Eukaryotic cells have a membrane-bound nucleus.', 'pro-eu-swap'], ['a virus', 'A virus is not a cell; it has no cytoplasm or membrane of its own.', 'virus-cell']], 'Prokaryotic.', undefined, 'bc4-pro'),
    },
    {
      id: 'bc4-nucleus', title: 'The nucleus: coded instructions', phase: 'reasoning',
      paragraphs: [
        'The nucleus has a double nuclear membrane with pores that let materials pass to and from the cytoplasm. The dense nucleolus inside makes the subunits of ribosomes.',
        'The nucleus holds DNA, which carries the information for inheriting characters. In a cell that is not dividing, DNA with proteins forms a tangle of threads called chromatin. Just before division, chromatin coils up into rod-shaped chromosomes. Functional segments of DNA are called genes. Mature human red blood cells have no nucleus, which leaves more room for haemoglobin, but they cannot divide and live only about 120 days.',
      ],
      visual: v('nucleusSection', {}, 'A section through the nucleus: the double nuclear envelope with pores, the nucleolus, threads of chromatin, and rough ER joined to the outer membrane.'),
      check: pick('chk-bc4-nucleus', 'When does chromatin become visible as chromosomes?', [['When the cell is about to divide', null], ['All the time', 'In a non-dividing cell DNA is spread out as chromatin threads.', 'chromosome-always'], ['Only after the cell dies', 'Chromosomes form for division, not at death.', 'irrelevant-cause']], 'Before division.', undefined, 'bc4-nucleus'),
    },
  ],
  investigation: { title: 'Compare cells in the Cell Laboratory', description: 'Switch between bacterial, plant and animal cells and tap each part.', href: `${CELL_LAB}?view=cells`, buttonLabel: 'Open the cell explorer' },
  worked: {
    id: 'w-bc-l4', title: 'Classifying three unknown cells',
    given: ['Cell P: 2 µm, wall, no nucleus, DNA in a nucleoid.', 'Cell Q: 40 µm, wall, nucleus, chloroplasts.', 'Cell R: 30 µm, no wall, nucleus, mitochondria.'],
    ask: 'Classify each cell and name the likely kind of organism.',
    steps: [
      { text: 'P has no membrane-bound nucleus, so it is prokaryotic: a bacterium.', why: 'A nucleoid without a membrane marks a prokaryote; its size also fits 1 to 10 µm.' },
      { text: 'Q has a nucleus, a wall and chloroplasts: a eukaryotic plant cell.', why: 'Only plant cells among these have chloroplasts.' },
      { text: 'R has a nucleus but no wall: a eukaryotic animal cell.', why: 'Animal cells have no cell wall.' },
    ],
    verify: 'Sizes agree: prokaryotes 1 to 10 µm, eukaryotes 10 to 100 µm.',
  },
  guided: {
    id: 'g-bc-l4', prompt: 'Trace DNA from the nucleus to a gene.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bc-g4-1', 'Order from the largest to the smallest.', [{ id: 'a', text: 'Nucleus', needs: [] }, { id: 'b', text: 'Chromosome', needs: ['a'] }, { id: 'c', text: 'DNA molecule', needs: ['b'] }, { id: 'd', text: 'Gene (a functional segment of DNA)', needs: ['c'] }], ['d', 'a', 'c', 'b'], 'Nucleus → chromosome → DNA → gene.'), hints: ['Each is part of the one before it.'] },
      { id: 'g2', prompt: 'Bacteria.', question: pick('bc-g4-2', 'Where is the DNA of a bacterium?', [['In the nucleoid, as a single circular molecule', null], ['Inside a nucleus with a double membrane', 'Bacteria lack a membrane-bound nucleus.', 'bacteria-nucleus']], 'Nucleoid.'), hints: ['Prokaryote.'] },
    ],
    conclusion: 'DNA is packed into chromosomes in eukaryotes; in bacteria it lies free in the nucleoid.',
  },
  independent: [
    ind('i1', 'Prokaryotes', 'classify', 'Size.', pick('bc-l4-i1', 'A typical prokaryotic cell is about…', [['1 to 10 µm across', null], ['10 to 100 µm across', 'That is the range for eukaryotic cells.', 'pro-eu-swap'], ['1 to 10 mm across', 'That is far too large; such cells would be visible to the eye.', 'unit-slip']], 'Table 2.2.'), ['Bacteria are small.'], ['1 to 10 µm.']),
    ind('i2', 'Red blood cells', 'nucleus', 'No nucleus.', pick('bc-l4-i2', 'Why can mature human red blood cells not divide?', [['They have no nucleus', null], ['They have no cell membrane', 'They do have a membrane; what they lack is a nucleus.', 'part-mixup'], ['They are prokaryotic', 'They are human, eukaryotic cells that have lost their nucleus.', 'pro-eu-swap']], 'Enucleate.'), ['What controls division?'], ['Without a nucleus they cannot divide or repair themselves.']),
    ind('i3', 'Nucleolus', 'nucleus', 'Job.', pick('bc-l4-i3', 'The nucleolus makes…', [['subunits of ribosomes', null], ['energy for the cell', 'Energy is released in mitochondria.', 'part-mixup'], ['the cell wall', 'The nucleolus is inside the nucleus and has nothing to do with the wall.', 'part-mixup']], 'Ribosome subunits.'), ['Inside the nucleus.'], ['Ribosome subunits, which then leave the nucleus.']),
    ind('i4', 'Eukaryotes', 'compare', 'Present in both.', pick('bc-l4-i4', 'Which structure is found in plant and animal cells but not in bacteria?', [['Mitochondria', null], ['Ribosomes', 'Bacteria have ribosomes too.', 'bacteria-ribosome'], ['Cell membrane', 'All cells have a membrane.', 'part-mixup']], 'Membrane-bound organelle.'), ['Bacteria lack membrane-bound organelles.'], ['Mitochondria.']),
  ],
  reflection: {
    discover: 'Prokaryotic cells keep DNA in a nucleoid and lack membrane-bound organelles; eukaryotic cells have a nucleus where DNA forms chromatin and, before division, chromosomes.',
    evidence: 'You compared three cells, classified unknown cells and traced DNA down to genes.',
    stillConfusing: [
      { text: 'What makes a cell prokaryotic?', refresherId: 'bc4-pro' },
      { text: 'Chromatin or chromosomes?', refresherId: 'bc4-nucleus' },
    ],
  },
};

export const C5: EduLesson = {
  id: 'bc-l5', unitId: 'bc-unit-3', number: 5, title: 'Organelles: a factory inside the cell',
  objective: 'state the job of each organelle (ribosomes, ER, Golgi apparatus, lysosomes, mitochondria, plastids and vacuoles), follow a protein from ribosome to secretion, and identify which organelles contain DNA.',
  prerequisiteIds: ['bcp-living'],
  objectives: [
    { id: 'jobs', label: 'Match each organelle with its job' },
    { id: 'pathway', label: 'Follow the pathway of a secreted protein' },
    { id: 'plastids', label: 'Distinguish chloroplasts, chromoplasts and leucoplasts and explain the vacuole' },
  ],
  steps: [
    {
      id: 'bc5-factory', title: 'Making and shipping proteins', phase: 'reasoning',
      paragraphs: [
        'A eukaryotic cell is like a factory with departments. Ribosomes, free or on the ER, make proteins. The rough ER, studded with ribosomes, makes and secretes proteins (as in gland cells of the pancreas); the smooth ER makes and stores fats and some hormones.',
        'The Golgi apparatus, stacks of flat sacs first seen by Camillo Golgi in 1898, works like a post office: it modifies, sorts and packages proteins and lipids into vesicles that go to the membrane for secretion or become lysosomes. Lysosomes are sacs of enzymes that break down wastes and worn-out parts.',
      ],
      visual: v('cellCompare', { type: 'animal', editable: true }, 'A typical animal cell. Tap ribosomes, the ER, the Golgi apparatus and lysosomes to read their jobs.'),
      check: pick('chk-bc5-factory', 'Which organelle packages proteins into vesicles for secretion?', [['Golgi apparatus', null], ['Lysosome', 'Lysosomes break things down; they do not package proteins for export.', 'organelle-swap'], ['Nucleolus', 'The nucleolus makes ribosome subunits.', 'organelle-swap']], 'The post office.', undefined, 'bc5-factory'),
    },
    {
      id: 'bc5-energy', title: 'Energy and food', phase: 'reasoning',
      paragraphs: [
        'Mitochondria are the powerhouses: in cellular respiration they break down glucose and store the energy released as ATP, the cell’s energy currency. Each has a smooth outer membrane and an inner membrane folded into cristae, which give a large surface for the reactions.',
        'Plants also make food in plastids. Chloroplasts contain chlorophyll, which absorbs sunlight for photosynthesis; sugars and starch are stored in their fluid stroma. Mitochondria and chloroplasts both have two membranes and their own DNA and ribosomes, a sign that they share history with bacteria.',
      ],
      visual: v('energyOrganelles', {}, 'Sections through a mitochondrion, with its folded inner membrane, and a larger chloroplast with stacks of thylakoids. Both have two membranes and their own DNA.'),
      check: pick('chk-bc5-energy', 'Why is the inner membrane of a mitochondrion folded into cristae?', [['To increase the surface area for energy-releasing reactions', null], ['To store starch', 'Starch is stored in plastids, not in cristae.', 'organelle-swap'], ['To let the mitochondrion move', 'The folds are about surface area, not movement.', 'irrelevant-cause']], 'More surface.', undefined, 'bc5-energy'),
    },
    {
      id: 'bc5-colour', title: 'Colours, storage and support', phase: 'apply',
      paragraphs: [
        'Not all plastids are green. Chromoplasts hold yellow, orange or red pigments that colour flowers and fruits and attract pollinators and seed dispersers. Leucoplasts are colourless and store starch, oils or proteins, as in potato and taro.',
        'A mature plant cell has one large central vacuole filled with cell sap, storing water, minerals, sugars and wastes. A full vacuole presses on the wall and keeps the cell firm; when a plant lacks water, the vacuoles shrink and it wilts. Animal cells have only small vacuoles, if any.',
      ],
      check: pick('chk-bc5-colour', 'Potato cells store starch in…', [['leucoplasts', null], ['chromoplasts', 'Chromoplasts hold coloured pigments, not stored starch.', 'plastid-swap'], ['lysosomes', 'Lysosomes digest materials; they do not store food.', 'organelle-swap']], 'Colourless storage plastids.', undefined, 'bc5-colour'),
    },
  ],
  investigation: { title: 'Tap through the organelles', description: 'Find each part in plant and animal cells and see where DNA is found.', href: `${CELL_LAB}?view=cells`, buttonLabel: 'Open the cell explorer' },
  worked: {
    id: 'w-bc-l5', title: 'The journey of a digestive enzyme',
    given: ['A pancreas cell makes an enzyme (a protein) and releases it from the cell.'],
    ask: 'Trace the enzyme from where it is made to where it leaves the cell.',
    steps: [
      { text: 'Ribosomes on the rough ER join amino acids into the enzyme.', why: 'Ribosomes are the sites of protein synthesis; secreted proteins are made on the rough ER.' },
      { text: 'The ER carries the protein to the Golgi apparatus.', why: 'The ER makes and transports proteins and is linked to the Golgi.' },
      { text: 'The Golgi modifies and packages it into vesicles, which fuse with the membrane and release it.', why: 'The Golgi sorts and ships proteins for secretion.' },
    ],
    verify: 'Ribosome → rough ER → Golgi apparatus → vesicle → cell membrane.',
  },
  guided: {
    id: 'g-bc-l5', prompt: 'Order a protein’s path and spot organelles with DNA.',
    steps: [
      { id: 'g1', prompt: 'Order.', question: ord('bc-g5-1', 'Order the path of a secreted protein.', [{ id: 'a', text: 'Ribosome on the rough ER', needs: [] }, { id: 'b', text: 'Golgi apparatus', needs: ['a'] }, { id: 'c', text: 'Vesicle', needs: ['b'] }, { id: 'd', text: 'Cell membrane (released)', needs: ['c'] }], ['b', 'd', 'a', 'c'], 'Ribosome, Golgi, vesicle, membrane.'), hints: ['Made first, packaged next, shipped last.'] },
      { id: 'g2', prompt: 'DNA.', question: pick('bc-g5-2', 'Which pair of organelles contains DNA?', [['Mitochondria and nucleus', null], ['Golgi apparatus and ribosomes', 'Neither the Golgi nor ribosomes contain DNA.', 'dna-where'], ['Nucleus and lysosomes', 'Lysosomes contain enzymes, not DNA.', 'dna-where']], 'Nucleus, mitochondria, chloroplasts.'), hints: ['Which organelles can make some of their own proteins?'] },
    ],
    conclusion: 'Proteins flow ribosome → ER → Golgi → vesicle; DNA is found in the nucleus, mitochondria and chloroplasts.',
  },
  independent: [
    ind('i1', 'Mitochondria', 'jobs', 'Energy currency.', pick('bc-l5-i1', 'The energy released in mitochondria is stored as…', [['ATP', null], ['starch', 'Starch is stored food in plastids, not the energy currency.', 'plastid-swap'], ['DNA', 'DNA carries information, not energy.', 'dna-where']], 'Adenosine triphosphate.'), ['Energy currency.'], ['ATP.']),
    ind('i2', 'Smooth ER', 'jobs', 'Function.', pick('bc-l5-i2', 'Smooth ER is mainly involved in…', [['making and storing fats and some hormones', null], ['making proteins on its ribosomes', 'Smooth ER has no ribosomes; that is the rough ER.', 'rer-ser'], ['photosynthesis', 'Photosynthesis happens in chloroplasts.', 'organelle-swap']], 'Lipids.'), ['No ribosomes.'], ['Fats (lipids) and some hormones.']),
    ind('i3', 'White flowers', 'plastids', 'Pigments.', pick('bc-l5-i3', 'A white flower most likely has…', [['petals without coloured pigments, such as with colourless plastids', null], ['chromoplasts full of red pigment', 'Red pigment would make the petals red, not white.', 'plastid-swap'], ['no cells in its petals', 'Petals are made of living cells.', 'cells-unreal']], 'No pigment.'), ['What gives colour?'], ['Coloured pigments are absent, so the petal looks white.']),
    ind('i4', 'No mitochondria', 'jobs', 'Prediction.', pick('bc-l5-i4', 'If all the mitochondria were removed from a eukaryotic cell, what would happen?', [['It could not release enough energy for its activities and would die', null], ['It would make more proteins', 'Making proteins needs energy, which would now be short.', 'irrelevant-cause'], ['Nothing, because ribosomes make energy', 'Ribosomes make proteins, not energy.', 'organelle-swap']], 'No ATP supply.'), ['Powerhouse.'], ['Cellular respiration stops; the cell runs out of ATP.']),
  ],
  reflection: {
    discover: 'Organelles divide the cell’s work: ribosomes and ER make, the Golgi ships, lysosomes clean up, mitochondria release energy as ATP, plastids make, colour or store food, and the vacuole stores and supports.',
    evidence: 'You traced a secreted protein, identified organelles with DNA and explained wilting and white flowers.',
    stillConfusing: [
      { text: 'ER, Golgi or lysosome?', refresherId: 'bc5-factory' },
      { text: 'Which plastid does what?', refresherId: 'bc5-colour' },
    ],
  },
};

export const C6: EduLesson = {
  id: 'bc-l6', unitId: 'bc-unit-4', number: 6, title: 'New cells from old: division and the cell theory',
  objective: 'compare mitosis and meiosis by the number of daughter cells and chromosomes, state the cell theory, and explain contact inhibition and why uncontrolled division forms tumours.',
  prerequisiteIds: ['bcp-living'],
  objectives: [
    { id: 'mitosis', label: 'Describe mitosis and its role in growth and repair' },
    { id: 'meiosis', label: 'Describe meiosis and why gametes have half the chromosomes' },
    { id: 'theory', label: 'State the cell theory and explain contact inhibition and cancer' },
  ],
  steps: [
    {
      id: 'bc6-root', title: 'Growing roots', phase: 'observe',
      paragraphs: [
        'Stand an onion on a jar of water for five or six days and new roots grow. A stained, squashed root tip seen under the microscope shows cells looking different from one another: they are caught at different stages of dividing.',
        'A cut heals and hair grows back because cells divide to replace old and damaged ones. An organism grows mainly because its cells divide, not because cells get ever bigger.',
      ],
      visual: v('microscope', { specimen: 'root-tip', objective: 40, editable: true }, 'An onion root tip squash under the virtual microscope, with cells at different stages of division.'),
      check: pick('chk-bc6-root', 'Why do onion root tip cells look different from one another?', [['They are at different stages of cell division', null], ['They come from different plants', 'They are all from the same root tip.', 'irrelevant-cause'], ['Some are bacteria', 'They are onion cells; bacteria are far smaller.', 'irrelevant-cause']], 'Dividing cells.', undefined, 'bc6-root'),
    },
    {
      id: 'bc6-two', title: 'Mitosis and meiosis', phase: 'reasoning',
      paragraphs: [
        'In mitosis one parent cell gives two daughter cells, each with the same DNA and the same number of chromosomes as the parent. It is used for growth, repair, maintenance and asexual reproduction; you began as one fertilised egg that divided into trillions of cells.',
        'Meiosis happens only in reproductive organs (testes and ovaries in animals, anthers and ovaries in flowers). The cell divides twice to give four cells, each with half the chromosomes; these are gametes. Fertilisation joins two gametes and restores the full number. Mistakes in mitosis can cause tumours; mistakes in meiosis can cause genetic disorders.',
      ],
      visual: v('division', { kind: 'mitosis', chromosomes: 4, editable: true }, 'Mitosis and meiosis side by side: the number of daughter cells and the chromosomes in each.'),
      check: pick('chk-bc6-two', 'A cell with 46 chromosomes divides by meiosis. Each daughter cell has…', [['23 chromosomes, and there are four cells', null], ['46 chromosomes, and there are two cells', 'That describes mitosis.', 'mitosis-meiosis'], ['92 chromosomes', 'Division never doubles the number in each daughter.', 'double-not-half']], 'Halved, four cells.', undefined, 'bc6-two'),
    },
    {
      id: 'bc6-theory', title: 'The cell theory and controlled growth', phase: 'reasoning',
      paragraphs: [
        'Schleiden (1838) found that all plants are made of cells, and Schwann (1839) that all animals are. Virchow (1855) added that new cells come only from existing cells. The cell theory states: all living things are made of one or more cells; the cell is the basic unit of structure and function; all cells arise from pre-existing cells.',
        'Normal cells divide in a controlled way and eventually die. Many animal cells stop dividing when they touch their neighbours (contact inhibition). Cancer cells lose this control and keep dividing, forming tumours. Plant cells, with rigid walls, follow a different pattern and do not show contact inhibition.',
      ],
      check: pick('chk-bc6-theory', 'Which statement is part of the cell theory?', [['All cells arise from pre-existing cells', null], ['All cells have a cell wall', 'Animal cells have no wall; this is not part of the theory.', 'plant-animal-swap'], ['Cells can arise from non-living matter', 'Virchow’s idea says the opposite.', 'spontaneous']], 'Virchow.', undefined, 'bc6-theory'),
    },
  ],
  investigation: { title: 'Compare mitosis and meiosis', description: 'Change the chromosome number and see the daughter cells.', href: `${CELL_LAB}?view=division`, buttonLabel: 'Open cell division' },
  worked: {
    id: 'w-bc-l6', title: 'Counting cells and chromosomes',
    given: ['A fertilised egg has 46 chromosomes.'],
    ask: 'How many cells are there after 5 rounds of mitosis, and how many chromosomes does each have?',
    steps: [
      { text: 'Each round doubles the number of cells: 1 → 2 → 4 → 8 → 16 → 32.', why: 'In mitosis every cell gives two daughter cells.' },
      { text: 'After 5 rounds there are 2 × 2 × 2 × 2 × 2 = 32 cells.', why: 'Doubling five times.' },
      { text: 'Each cell still has 46 chromosomes.', why: 'Mitosis keeps the chromosome number the same.' },
    ],
    verify: '32 cells × 46 chromosomes; the number per cell has not changed.',
  },
  guided: {
    id: 'g-bc-l6', prompt: 'Follow chromosome numbers through meiosis and fertilisation.',
    steps: [
      { id: 'g1', prompt: 'Gamete.', question: num('bc-g6-1', 'A body cell of a plant has 14 chromosomes. How many does each of its gametes have?', 7, '14 ÷ 2 = 7.', { rules: [[[14], 'Gametes come from meiosis, which halves the number.', 'mitosis-meiosis'], [[28], 'Meiosis halves the number; it does not double it.', 'double-not-half']] }), hints: ['Meiosis halves.'] },
      { id: 'g2', prompt: 'Zygote.', question: num('bc-g6-2', 'Two such gametes fuse at fertilisation. How many chromosomes does the zygote have?', 14, '7 + 7 = 14.', { rules: [[[7], 'Two gametes join, so add their chromosomes together.', 'one-gamete']] }), hints: ['Add the two gametes.'] },
    ],
    conclusion: 'Meiosis halves the number and fertilisation restores it, so the number stays constant from generation to generation.',
  },
  independent: [
    ind('i1', 'Mitosis', 'mitosis', 'Daughters.', num('bc-l6-i1', 'How many daughter cells does one round of mitosis give?', 2, 'Two identical cells.', { rules: [[[4], 'Four cells come from meiosis, not mitosis.', 'mitosis-meiosis']] }), ['Growth and repair.'], ['2.']),
    ind('i2', 'Skin', 'meiosis', 'Wrong division.', pick('bc-l6-i2', 'If skin cells divided by meiosis instead of mitosis, a cut would…', [['heal badly: new cells would have half the chromosomes and not be normal skin cells', null], ['heal faster, because meiosis makes four cells', 'The four cells would have half the chromosomes, so they could not work as normal skin.', 'more-is-better'], ['heal exactly the same', 'Meiosis changes the chromosome number, so the result is not the same.', 'mitosis-meiosis']], 'Half chromosomes.'), ['What does meiosis do to chromosome number?'], ['Repair needs identical cells; meiosis gives cells with half the chromosomes.']),
    ind('i3', 'Contact inhibition', 'theory', 'Tumours.', pick('bc-l6-i3', 'Which process normally prevents tumours forming in the human body?', [['Contact inhibition', null], ['Osmosis', 'Osmosis moves water; it does not control division.', 'irrelevant-cause'], ['Meiosis', 'Meiosis makes gametes; it does not stop body cells dividing.', 'mitosis-meiosis']], 'Stopping on contact.'), ['Cells touching their neighbours.'], ['Contact inhibition stops division when cells touch.']),
    ind('i4', 'Cell theory', 'theory', 'Scientist.', pick('bc-l6-i4', 'Who added the idea that new cells arise only from existing cells?', [['Rudolf Virchow', null], ['Robert Hooke', 'Hooke first saw and named cells in 1665.', 'scientist-swap'], ['Matthias Schleiden', 'Schleiden showed that plants are made of cells.', 'scientist-swap']], 'Virchow, 1855.'), ['1855.'], ['Virchow.']),
  ],
  reflection: {
    discover: 'Cells come only from cells: mitosis makes two identical cells for growth and repair, meiosis makes four gametes with half the chromosomes, and losing control of division leads to tumours.',
    evidence: 'You counted cells and chromosomes, stated the cell theory and reasoned about contact inhibition.',
    stillConfusing: [
      { text: 'Mitosis or meiosis?', refresherId: 'bc6-two' },
      { text: 'What is contact inhibition?', refresherId: 'bc6-theory' },
    ],
  },
};
