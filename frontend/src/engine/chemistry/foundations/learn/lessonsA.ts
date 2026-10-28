/**
 * Chapter 9, Units 1 and 2 (Lessons 1 to 5): conservation of mass, constant proportions, Dalton’s atomic theory and molecules,
 * covalent bonds and naming, ionic bonds and ions. Aligned to NCERT Exploration (2026-27), Sections 9.1 to 9.4.2. Original
 * wording; numeric answers are checked against `../model.ts` by `__tests__/foundations.test.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, pick } from '../../../education/builders';

export const FORMULA_LAB = '/chemistry/atomic-foundations/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const F1: EduLesson = {
  id: 'cf-l1', unitId: 'cf-unit-1', number: 1, title: 'The law of conservation of mass',
  objective: 'state the law of conservation of mass, explain why an open reaction that gives off a gas seems to lose mass, and check the law with data.',
  prerequisiteIds: ['cfp-change'],
  objectives: [
    { id: 'law', label: 'State the law and explain open and closed systems' },
    { id: 'check', label: 'Check the law with reactant and product masses' },
  ],
  steps: [
    {
      id: 'cf1-physical', title: 'Mass in a physical change', phase: 'observe',
      paragraphs: [
        'Weigh water and salt, then dissolve the salt and weigh again: the reading does not change. Tear a sheet of paper into pieces: same mass. In physical changes, mass stays the same.',
      ],
      check: pick('chk-cf1-physical', '50 g of water and 5 g of salt are mixed until the salt dissolves. What is the mass of the solution?', [['55 g', null], ['50 g', 'The dissolved salt is still there, adding its 5 g.', 'dissolved-vanishes'], ['Less than 50 g', 'Nothing has escaped, so nothing is lost.', 'dissolved-vanishes']], '50 + 5 = 55 g.', undefined, 'cf1-physical'),
    },
    {
      id: 'cf1-gas', title: 'A fizzing reaction', phase: 'conjecture',
      paragraphs: [
        'Add baking soda to vinegar in an open flask on a balance: it fizzes and the reading drops. Now repeat with the baking soda in a balloon fixed over the mouth of the flask: the balloon inflates, and the reading stays the same.',
        'In the open flask, carbon dioxide gas escaped into the air. In the closed set-up it was trapped in the balloon, so it was still weighed.',
      ],
      prediction: { id: 'pr-cf1-gas', prompt: 'With the balloon fixed over the flask, what will the balance show after the fizzing?', options: [{ id: 'p1', text: 'Less than before' }, { id: 'p2', text: 'The same as before' }, { id: 'p3', text: 'More than before' }], expectedId: 'p2', reveal: 'The reading stays the same: the carbon dioxide is trapped in the balloon and still weighed.' },
      visual: v('massBalance', { reaction: 'soda-vinegar', editable: true }, 'Baking soda reacts with vinegar on a balance. In an open flask the reading falls as gas escapes; with a balloon sealing the flask the reading stays the same.'),
      check: pick('chk-cf1-gas', 'Why did the open flask seem to lose mass?', [['The carbon dioxide gas escaped into the air', null], ['Matter was destroyed in the reaction', 'Matter is not destroyed; the gas simply left the flask.', 'mass-destroyed']], 'Gas escaped.', undefined, 'cf1-gas'),
    },
    {
      id: 'cf1-law', title: 'The law', phase: 'reasoning',
      paragraphs: [
        'In a chemical reaction, matter is neither created nor destroyed: the total mass of the products equals the total mass of the reactants. Antoine Lavoisier stated this law in 1789.',
        'To test it, a reaction must be done in a closed system if a gas is given off or taken in. A reaction between two solutions that gives a solid, such as sodium sulfate with barium chloride, can be tested in open flasks because no gas forms.',
      ],
      check: pick('chk-cf1-law', 'Which set-up tests the law fairly for a reaction that gives off hydrogen gas?', [['A closed container that traps the gas', null], ['An open beaker', 'The hydrogen would escape and the reading would fall.', 'open-system']], 'Closed.', undefined, 'cf1-law'),
    },
  ],
  investigation: { title: 'Weigh reactions in the Formula Laboratory', description: 'Compare open and closed set-ups on a balance.', href: `${FORMULA_LAB}?view=balance`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l1', title: 'Checking the law with data',
    given: ['4.0 g calcium carbonate + 2.92 g hydrochloric acid in a closed container.', 'Products: 1.76 g carbon dioxide, 0.72 g water, 4.44 g calcium chloride.'],
    ask: 'Is the law obeyed?',
    steps: [
      { text: 'Reactants: 4.0 + 2.92 = 6.92 g.', why: 'Add every reactant.' },
      { text: 'Products: 1.76 + 0.72 + 4.44 = 6.92 g.', why: 'Add every product, including the gas.' },
      { text: 'The totals are equal, so the law is obeyed.', why: 'Conservation means equal totals.' },
    ],
    verify: '6.92 g = 6.92 g.',
  },
  guided: {
    id: 'g-cf-l1', prompt: '12 g of carbon burns completely in 32 g of oxygen to give carbon dioxide.',
    steps: [
      { id: 'g1', prompt: 'Product.', question: num('cf-g1-1', 'What mass of carbon dioxide forms, in grams?', 44, '12 + 32 = 44 g.', { unit: 'g' }), hints: ['Mass is conserved.'] },
      { id: 'g2', prompt: 'Scale.', question: num('cf-g1-2', 'How much carbon dioxide forms from 2.4 g of carbon, in grams?', 8.8, '44 × 2.4 ÷ 12 = 8.8 g.', { unit: 'g', rules: [[[44], 'That is from 12 g of carbon; scale to 2.4 g.', 'forgot-scale']] }), hints: ['2.4 g is a fifth of 12 g.'] },
    ],
    conclusion: '12 g of carbon gives 44 g of CO₂, so 2.4 g gives 8.8 g.',
  },
  independent: [
    ind('i1', 'Conservation', 'check', 'Water.', num('cf-l1-i1', 'When 20 g of hydrogen reacts completely with 160 g of oxygen, what mass of water forms, in grams?', 180, '20 + 160 = 180 g.', { unit: 'g' }), ['Add the reactants.'], ['180 g.']),
    ind('i2', 'Open system', 'law', 'Burning ethanol.', pick('cf-l1-i2', '10 g of ethanol burns in an open beaker and nothing is left. Is the law broken?', [['No: the products (carbon dioxide and water vapour) escaped as gases', null], ['Yes: 10 g of matter was destroyed', 'The mass left as gases into the air.', 'mass-destroyed']], 'Gases escaped.'), ['Where did the products go?'], ['The gaseous products left the beaker; their mass, plus the oxygen used, equals the reactants’ mass.']),
    ind('i3', 'Conservation', 'check', 'Missing product.', num('cf-l1-i3', 'In a closed flask, 5.0 g of A reacts with 3.0 g of B to give 6.5 g of C and some D. What is the mass of D, in grams?', 1.5, '8.0 − 6.5 = 1.5 g.', { unit: 'g' }), ['Reactants total − known products.'], ['5.0 + 3.0 − 6.5 = 1.5 g.']),
  ],
  reflection: {
    discover: 'Mass is conserved in chemical reactions; an apparent loss means a gas escaped, so fair tests use closed systems.',
    evidence: 'You checked totals and explained open and closed set-ups.',
    stillConfusing: [
      { text: 'Why did the open flask lose mass?', refresherId: 'cf1-gas' },
      { text: 'When must the system be closed?', refresherId: 'cf1-law' },
    ],
  },
};

export const F2: EduLesson = {
  id: 'cf-l2', unitId: 'cf-unit-1', number: 2, title: 'The law of constant proportions',
  objective: 'state the law of constant proportions and use a fixed mass ratio to find the mass of an element in a compound.',
  prerequisiteIds: ['cfp-ratio'],
  objectives: [
    { id: 'law', label: 'State the law and tell compounds from mixtures' },
    { id: 'use', label: 'Use a mass ratio to calculate masses' },
  ],
  steps: [
    {
      id: 'cf2-law', title: 'Fixed ratios', phase: 'observe',
      paragraphs: [
        'Purify water from a river, a well or the sea and decompose it: every time, hydrogen and oxygen come out in the mass ratio 1 : 8. 9 g of water always gives 1 g of hydrogen and 8 g of oxygen.',
        'Joseph Proust stated it: in a compound, the elements are always combined in the same ratio by mass, whatever its source or how it was made. This is the law of constant (or definite) proportions.',
      ],
      check: pick('chk-cf2-law', '18 g of pure water is decomposed. How much oxygen is obtained?', [['16 g', null], ['9 g', 'The ratio is 1 : 8, so oxygen is 8/9 of the mass.', 'ratio-split'], ['8 g', 'That is for 9 g of water.', 'forgot-scale']], '18 × 8 ÷ 9 = 16 g.', undefined, 'cf2-law'),
    },
    {
      id: 'cf2-mixtures', title: 'Compounds, not mixtures', phase: 'reasoning',
      paragraphs: [
        'The law applies to compounds, not mixtures: you can mix sand and salt, or sugar and water, in any ratio, but a compound has one fixed composition. Cinnabar (mercury sulfide), used as a red pigment since ancient times, is always about 86 % mercury and 14 % sulfur by mass.',
      ],
      check: pick('chk-cf2-mixtures', 'Why does the law not apply to mixtures?', [['A mixture’s parts can be combined in any proportion', null], ['Mixtures contain no elements', 'Mixtures can contain elements; they just have no fixed ratio.', 'mixture-no-elements']], 'Variable composition.', undefined, 'cf2-mixtures'),
    },
    {
      id: 'cf2-use', title: 'Using the ratio', phase: 'apply',
      paragraphs: [
        'Sodium chloride has sodium and chlorine in the mass ratio 23 : 35.5. For 46 g of sodium: chlorine = 46 × 35.5 ÷ 23 = 71 g.',
        'Two samples of a compound obey the law if their ratios are equal: copper oxide made in the ratio 4 : 1 and in the ratio 8 : 2 is the same compound, because 8 : 2 = 4 : 1.',
      ],
      check: pick('chk-cf2-use', 'Carbon monoxide has C : O = 3 : 4 by mass. How much oxygen combines with 9 g of carbon?', [['12 g', null], ['4 g', 'Scale: 9 g of carbon is three times 3 g.', 'forgot-scale'], ['6.75 g', 'Multiply by 4/3, not 3/4.', 'ratio-flip']], '9 × 4 ÷ 3 = 12 g.', undefined, 'cf2-use'),
    },
  ],
  worked: {
    id: 'w-cf-l2', title: 'Sulfur and oxygen',
    given: ['A compound is 40 % sulfur and 60 % oxygen by mass.', 'A sample contains 20 g of sulfur.'],
    ask: 'How much oxygen must it contain?',
    steps: [
      { text: 'S : O = 40 : 60 = 2 : 3.', why: 'Write the fixed ratio.' },
      { text: 'Oxygen = 20 × 3 ÷ 2 = 30 g.', why: 'Scale the ratio to 20 g of sulfur.' },
    ],
    verify: '20 : 30 = 2 : 3, and 20 ÷ 50 = 40 %.',
  },
  guided: {
    id: 'g-cf-l2', prompt: 'Magnesium oxide contains magnesium and oxygen in the ratio 3 : 2 by mass.',
    steps: [
      { id: 'g1', prompt: 'Oxygen.', question: num('cf-g2-1', 'How much oxygen combines with 12 g of magnesium, in grams?', 8, '12 × 2 ÷ 3 = 8 g.', { unit: 'g' }), hints: ['12 is 4 × 3.'] },
      { id: 'g2', prompt: 'Product.', question: num('cf-g2-2', 'What mass of magnesium oxide forms, in grams?', 20, '12 + 8 = 20 g.', { unit: 'g' }), hints: ['Conservation of mass.'] },
    ],
    conclusion: '12 g of magnesium takes 8 g of oxygen to give 20 g of magnesium oxide.',
  },
  independent: [
    ind('i1', 'Using the ratio', 'use', 'Sodium chloride.', num('cf-l2-i1', 'Sodium and chlorine combine in the ratio 23 : 35.5. How much chlorine combines with 11.5 g of sodium, in grams?', 17.75, '11.5 × 35.5 ÷ 23 = 17.75 g.', { unit: 'g' }), ['11.5 is half of 23.'], ['17.75 g.']),
    ind('i2', 'Constant ratio', 'law', 'Two students.', pick('cf-l2-i2', 'Student X made copper oxide with Cu : O = 4 : 1 and student Y with 8 : 2. Do the results agree with the law?', [['Yes: 8 : 2 is the same ratio as 4 : 1', null], ['No: the numbers are different', 'The ratio, not the numbers, must match; 8 : 2 simplifies to 4 : 1.', 'ratio-numbers']], 'Same ratio.'), ['Simplify 8 : 2.'], ['8 : 2 = 4 : 1: the same compound.']),
    ind('i3', 'Using the ratio', 'use', 'Water.', num('cf-l2-i3', 'Hydrogen and oxygen combine in the ratio 1 : 8 in water. How much hydrogen is needed for 40 g of oxygen, in grams?', 5, '40 ÷ 8 = 5 g.', { unit: 'g', rules: [[[320], 'Divide by 8 here: hydrogen is the smaller part.', 'ratio-flip']] }), ['Hydrogen is 1/8 of the oxygen.'], ['5 g.']),
  ],
  reflection: {
    discover: 'A compound always contains its elements in the same mass ratio, so one mass gives the others by scaling; mixtures have no fixed ratio.',
    evidence: 'You used mass ratios and judged whether samples obey the law.',
    stillConfusing: [
      { text: 'Why only compounds?', refresherId: 'cf2-mixtures' },
      { text: 'How do I scale a ratio?', refresherId: 'cf2-use' },
    ],
  },
};

export const F3: EduLesson = {
  id: 'cf-l3', unitId: 'cf-unit-1', number: 3, title: 'Dalton’s atomic theory and molecules',
  objective: 'state Dalton’s postulates, use them to explain the two laws, and define a molecule.',
  prerequisiteIds: ['cfp-change'],
  objectives: [
    { id: 'postulates', label: 'State Dalton’s postulates' },
    { id: 'explain', label: 'Explain the laws with atoms; define a molecule' },
  ],
  steps: [
    {
      id: 'cf3-postulates', title: 'Dalton’s postulates', phase: 'observe',
      paragraphs: [
        'Dalton (1808) assumed: all matter is made of tiny atoms; atoms cannot be created or destroyed in a reaction; atoms of one element are identical in mass and properties, and differ from those of other elements; atoms combine in simple whole-number ratios; a given compound always has the same relative numbers and kinds of atoms.',
      ],
      check: pick('chk-cf3-postulates', 'Which is one of Dalton’s postulates?', [['Atoms combine in simple whole-number ratios', null], ['Atoms are made of protons, neutrons and electrons', 'Subatomic particles were discovered after Dalton.', 'dalton-subatomic']], 'Whole-number ratios.', undefined, 'cf3-postulates'),
    },
    {
      id: 'cf3-explain', title: 'Atoms explain the laws', phase: 'reasoning',
      paragraphs: [
        'If atoms are only rearranged in a reaction, never made or destroyed, the total mass cannot change: conservation of mass. If every molecule of water has the same atoms with fixed masses, every sample has the same mass ratio: constant proportions.',
        'Some of Dalton’s ideas were later revised (atoms have parts, and isotopes of one element differ in mass), but his theory remains the base of chemistry.',
      ],
      check: pick('chk-cf3-explain', 'Which postulate explains conservation of mass?', [['Atoms are neither created nor destroyed in a reaction', null], ['Atoms of different elements have different masses', 'That does not say anything about mass staying the same.', 'wrong-postulate']], 'Atoms only rearrange.', undefined, 'cf3-explain'),
    },
    {
      id: 'cf3-molecule', title: 'Molecules', phase: 'apply',
      paragraphs: [
        'A molecule is an electrically neutral group of two or more atoms that can exist on its own and has the properties of the substance. A hydrogen molecule is H₂ (two hydrogen atoms); a hydrogen chloride molecule is HCl. Helium exists as single atoms because its atoms are already stable.',
      ],
      check: pick('chk-cf3-molecule', 'Why does helium exist as single atoms?', [['Its outer shell is already full, so its atoms are stable', null], ['Helium atoms are too heavy to join', 'Helium is very light; its full shell is the reason.', 'heavy-reason']], 'Stable atoms.', undefined, 'cf3-molecule'),
    },
  ],
  worked: {
    id: 'w-cf-l3', title: 'Water and Dalton',
    given: ['2 g of hydrogen combines with 16 g of oxygen to give 18 g of water.'],
    ask: 'Which laws does this show, and how does Dalton explain them?',
    steps: [
      { text: '2 + 16 = 18: conservation of mass.', why: 'The products weigh the same as the reactants.' },
      { text: '2 : 16 = 1 : 8, the fixed ratio of water: constant proportions.', why: 'Matches every sample of water.' },
      { text: 'Atoms only rearrange, and each water molecule has 2 H and 1 O of fixed masses.', why: 'Dalton’s postulates.' },
    ],
    verify: 'Both laws follow from fixed, indestructible atoms.',
  },
  guided: {
    id: 'g-cf-l3', prompt: 'Magnesium burns in air and forms a white powder, magnesium oxide.',
    steps: [
      { id: 'g1', prompt: 'Atoms.', question: pick('cf-g3-1', 'What happens to the magnesium atoms?', [['They combine with oxygen atoms; none are destroyed', null], ['They are destroyed by the flame', 'Atoms are not destroyed in a chemical reaction.', 'mass-destroyed']], 'Rearranged.', undefined, 'cf3-explain'), hints: ['Dalton’s second postulate.'] },
      { id: 'g2', prompt: 'Mass.', question: pick('cf-g3-2', 'Compared with the magnesium burnt, the magnesium oxide is…', [['heavier, because oxygen from the air has combined', null], ['lighter, because the flame burns some away', 'The oxide includes the oxygen that joined; it weighs more.', 'mass-destroyed']], 'Oxygen added.', undefined, 'cf3-explain'), hints: ['Where does the oxygen come from?'] },
    ],
    conclusion: 'Magnesium atoms join oxygen atoms; the oxide is heavier by the mass of oxygen taken from the air.',
  },
  independent: [
    ind('i1', 'Postulates', 'postulates', 'Identical atoms.', pick('cf-l3-i1', 'Which of Dalton’s ideas was later found not to be strictly true?', [['All atoms of an element have identical mass', null], ['Atoms combine in whole-number ratios', 'This is still used today.', 'wrong-postulate']], 'Isotopes.'), ['Recall isotopes from Chapter 8.'], ['Isotopes of one element differ in mass.']),
    ind('i2', 'Molecule', 'explain', 'Definition.', pick('cf-l3-i2', 'Which is a molecule of a compound?', [['HCl', null], ['H₂', 'H₂ is a molecule of an element.', 'element-compound'], ['He', 'Helium exists as single atoms.', 'element-compound']], 'Different atoms.'), ['Two different elements.'], ['HCl has hydrogen and chlorine.']),
    ind('i3', 'Explain', 'explain', 'Assertion.', pick('cf-l3-i3', 'Assertion: 2 g of hydrogen combines with 16 g of oxygen to form 18 g of water. Reason: atoms combine in a simple whole-number ratio by mass. Which is right?', [['The assertion is true; the reason is false (Dalton’s ratio is by number of atoms, not by mass)', null], ['Both true, and the reason explains the assertion', 'Dalton’s simple whole-number ratio is about numbers of atoms (2 H : 1 O), not mass (1 : 8).', 'ratio-by-mass']], 'Numbers of atoms.'), ['Ratio of what?'], ['2 + 16 = 18 g is true; Dalton’s whole-number ratio refers to atoms, not grams.']),
  ],
  reflection: {
    discover: 'Dalton’s indestructible atoms that combine in fixed whole-number ratios explain conservation of mass and constant proportions; a molecule is a neutral group of atoms that exists on its own.',
    evidence: 'You linked postulates to laws and identified molecules.',
    stillConfusing: [
      { text: 'How do atoms explain the laws?', refresherId: 'cf3-explain' },
      { text: 'What is a molecule?', refresherId: 'cf3-molecule' },
    ],
  },
};

export const F4: EduLesson = {
  id: 'cf-l4', unitId: 'cf-unit-2', number: 4, title: 'Covalent bonds: sharing electrons',
  objective: 'explain how atoms share electrons to form single, double and triple bonds, draw simple molecules, and name binary covalent compounds with prefixes.',
  prerequisiteIds: ['cfp-valency'],
  objectives: [
    { id: 'share', label: 'Explain covalent bonding in H₂, Cl₂, O₂, HCl and H₂O' },
    { id: 'name', label: 'Name binary covalent compounds with prefixes' },
  ],
  steps: [
    {
      id: 'cf4-why', title: 'Why atoms bond', phase: 'observe',
      paragraphs: [
        'Atoms with an incomplete outer shell become more stable by sharing, gaining or losing electrons. When atoms join, their total energy is lower than when apart. The force holding them together is a chemical bond.',
        'A hydrogen atom has one electron and needs two for a full K shell. Two hydrogen atoms each share their electron: the shared pair holds both nuclei. This is a covalent bond, drawn H–H.',
      ],
      visual: v('bondBuilder', { a: 'H', b: 'H' }, 'Two hydrogen atoms share one pair of electrons to form H₂, a single covalent bond.'),
      check: pick('chk-cf4-why', 'In H₂, how many electrons are shared in total?', [['2 (one pair)', null], ['1', 'Each atom gives one, so a pair of two is shared.', 'pair-count']], 'One pair.', undefined, 'cf4-why'),
    },
    {
      id: 'cf4-multiple', title: 'Single, double and triple bonds', phase: 'reasoning',
      paragraphs: [
        'Chlorine (2, 8, 7) needs one electron: two chlorine atoms share one pair, Cl–Cl. Oxygen (2, 6) needs two: two oxygen atoms share two pairs, a double bond, O=O. Nitrogen (2, 5) needs three: N≡N, a triple bond.',
        'Different atoms share too: in HCl, hydrogen and chlorine share one pair; in water, oxygen shares one pair with each of two hydrogen atoms, giving H₂O.',
      ],
      visual: v('bondBuilder', { a: 'O', b: 'O', editable: true }, 'Two oxygen atoms share two pairs of electrons, a double bond. Choose other pairs of atoms to see single, double and triple bonds or ionic bonding.'),
      check: pick('chk-cf4-multiple', 'Why do two oxygen atoms form a double bond?', [['Each needs two more electrons, so they share two pairs', null], ['Oxygen has two shells', 'The number of shells does not set the bond; the electrons needed do.', 'shells-bond']], 'Each needs two.', undefined, 'cf4-multiple'),
    },
    {
      id: 'cf4-name', title: 'Naming covalent compounds', phase: 'apply',
      paragraphs: [
        'Name the first element normally and give the second the ending -ide. Prefixes count atoms: mono 1, di 2, tri 3, tetra 4, penta 5, hexa 6. Mono is left off the first element. Drop the final a or o of a prefix before a vowel (monoxide, tetroxide, pentoxide), but keep the i (dioxide).',
        'CO is carbon monoxide; CO₂ carbon dioxide; PCl₃ phosphorus trichloride; SF₆ sulfur hexafluoride; N₂O₄ dinitrogen tetroxide. With hydrogen first, no prefix: H₂S is hydrogen sulfide. Some keep common names: water, ammonia.',
      ],
      check: pick('chk-cf4-name', 'What is the name of N₂O₅?', [['Dinitrogen pentoxide', null], ['Nitrogen pentaoxide', 'Show both counts, and drop the a before oxide.', 'prefix-rule'], ['Dinitrogen pentaoxide', 'The a of penta is dropped before the vowel of oxide.', 'prefix-rule']], 'Di- and pent-oxide.', undefined, 'cf4-name'),
    },
  ],
  investigation: { title: 'Build bonds in the Formula Laboratory', description: 'Choose two atoms and see whether they share or transfer electrons.', href: `${FORMULA_LAB}?view=bonds`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l4', title: 'Ammonia',
    given: ['Nitrogen 2, 5; hydrogen 1.'],
    ask: 'How do they share electrons, and what is the formula?',
    steps: [
      { text: 'Nitrogen needs 3 electrons; each hydrogen needs 1.', why: 'Count what each atom lacks.' },
      { text: 'Three hydrogen atoms each share one pair with nitrogen.', why: 'Three single bonds give nitrogen its octet and each hydrogen two electrons.' },
      { text: 'Formula NH₃ (ammonia).', why: 'One N and three H.' },
    ],
    verify: 'Nitrogen now has 5 + 3 = 8 electrons around it.',
  },
  guided: {
    id: 'g-cf-l4', prompt: 'Carbon (2, 4) bonds with oxygen (2, 6) to form carbon dioxide.',
    steps: [
      { id: 'g1', prompt: 'Bonds per oxygen.', question: num('cf-g4-1', 'How many pairs does each oxygen share with carbon?', 2, 'Each oxygen needs two more electrons: a double bond.', {}), hints: ['What does oxygen need?'] },
      { id: 'g2', prompt: 'Name.', question: pick('cf-g4-2', 'What is CO₂ called?', [['Carbon dioxide', null], ['Monocarbon dioxide', 'Mono is left off the first element.', 'prefix-rule']], 'Carbon dioxide.', undefined, 'cf4-name'), hints: ['Mono is not used for the first element.'] },
    ],
    conclusion: 'O=C=O: two double bonds; the name is carbon dioxide.',
  },
  independent: [
    ind('i1', 'Share', 'share', 'Fluorine.', pick('cf-l4-i1', 'Fluorine (2, 7) forms F₂ with…', [['a single bond', null], ['a double bond', 'Each fluorine needs only one electron, so one pair is shared.', 'bond-order']], 'One pair.'), ['How many does each need?'], ['Each needs one: F–F.']),
    ind('i2', 'Share', 'share', 'Nitrogen.', num('cf-l4-i2', 'How many pairs of electrons are shared in N₂?', 3, 'Each nitrogen needs 3: a triple bond.', {}), ['8 − 5.'], ['3 pairs: N≡N.']),
    ind('i3', 'Name', 'name', 'PCl₃.', pick('cf-l4-i3', 'Name PCl₃.', [['Phosphorus trichloride', null], ['Monophosphorus trichlorine', 'No mono for the first element, and the second ends in -ide.', 'prefix-rule']], 'Tri-chloride.'), ['Second element ends in -ide.'], ['Phosphorus trichloride.']),
    ind('i4', 'Name', 'name', 'Neon.', pick('cf-l4-i4', 'Neon (2, 8) neither shares nor transfers electrons because…', [['its outer shell is already full', null], ['it has no outer shell', 'Its outer shell (L) is complete with 8.', 'no-electrons']], 'Octet.'), ['Look at the outer shell.'], ['A full octet: already stable.']),
  ],
  reflection: {
    discover: 'In a covalent bond atoms share pairs of electrons to complete their shells (one, two or three pairs); binary covalent compounds are named with number prefixes and -ide.',
    evidence: 'You explained sharing in several molecules and named compounds.',
    stillConfusing: [
      { text: 'Why double or triple bonds?', refresherId: 'cf4-multiple' },
      { text: 'How do the prefixes work?', refresherId: 'cf4-name' },
    ],
  },
};

export const F5: EduLesson = {
  id: 'cf-l5', unitId: 'cf-unit-2', number: 5, title: 'Ionic bonds: transferring electrons',
  objective: 'explain how atoms form cations and anions by losing or gaining electrons, how ions attract to form an ionic compound, and name ionic compounds.',
  prerequisiteIds: ['cfp-valency'],
  objectives: [
    { id: 'ions', label: 'Explain how cations and anions form, with their charges' },
    { id: 'ionic', label: 'Explain the ionic bond and name ionic compounds' },
  ],
  steps: [
    {
      id: 'cf5-ions', title: 'Losing and gaining electrons', phase: 'observe',
      paragraphs: [
        'Sodium (2, 8, 1) loses its one outer electron. It now has 11 protons and 10 electrons: a charge of +1. A positively charged ion is a cation, written Na⁺.',
        'Chlorine (2, 8, 7) gains one electron: 17 protons and 18 electrons, charge −1. A negatively charged ion is an anion, written Cl⁻. Sulfur gains two and becomes S²⁻.',
      ],
      visual: v('bondBuilder', { a: 'Na', b: 'Cl' }, 'A sodium atom transfers its outer electron to a chlorine atom, forming Na⁺ and Cl⁻ ions that attract each other.'),
      check: pick('chk-cf5-ions', 'Magnesium (2, 8, 2) forms which ion?', [['Mg²⁺', null], ['Mg²⁻', 'Magnesium loses electrons, so it becomes positive.', 'ion-sign'], ['Mg⁺', 'It loses two electrons, not one.', 'ion-size']], 'Loses two.', undefined, 'cf5-ions'),
    },
    {
      id: 'cf5-bond', title: 'The ionic bond', phase: 'reasoning',
      paragraphs: [
        'Oppositely charged ions attract each other strongly. This electrostatic attraction is an ionic bond. Ionic compounds do not form separate molecules: the ions stack in a regular 3-D crystal. In sodium chloride each Na⁺ is surrounded by six Cl⁻ and each Cl⁻ by six Na⁺.',
        'Metals usually form cations and non-metals anions, so ionic compounds usually form between metals and non-metals.',
      ],
      check: pick('chk-cf5-bond', 'What holds the ions together in sodium chloride?', [['The attraction between oppositely charged ions', null], ['A shared pair of electrons', 'That is a covalent bond.', 'bond-type-swap']], 'Electrostatic attraction.', undefined, 'cf5-bond'),
    },
    {
      id: 'cf5-name', title: 'Naming ionic compounds and polyatomic ions', phase: 'apply',
      paragraphs: [
        'Name the cation first, then the anion. Simple anions end in -ide: sodium chloride, calcium oxide, magnesium sulfide. Some ions contain several atoms, polyatomic ions: hydroxide OH⁻, nitrate NO₃⁻, hydrogencarbonate HCO₃⁻, carbonate CO₃²⁻, sulfate SO₄²⁻ and ammonium NH₄⁺.',
        'Iron and copper form two ions each: ferrous Fe²⁺ and ferric Fe³⁺; cuprous Cu⁺ and cupric Cu²⁺.',
      ],
      check: pick('chk-cf5-name', 'What is the charge on a sulfate ion?', [['2−', null], ['1−', 'That is nitrate or hydroxide.', 'ion-size'], ['2+', 'Sulfate is an anion.', 'ion-sign']], 'SO₄²⁻.', undefined, 'cf5-name'),
    },
  ],
  investigation: { title: 'Transfer electrons in the Formula Laboratory', description: 'Pair a metal with a non-metal and watch the ions form.', href: `${FORMULA_LAB}?view=bonds`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l5', title: 'Magnesium chloride',
    given: ['Magnesium 2, 8, 2; chlorine 2, 8, 7.'],
    ask: 'How do they form an ionic compound?',
    steps: [
      { text: 'Magnesium loses two electrons: Mg²⁺.', why: 'Two outer electrons are lost to reach an octet.' },
      { text: 'Each chlorine gains one: Cl⁻.', why: 'One electron completes chlorine’s octet.' },
      { text: 'Two Cl⁻ balance one Mg²⁺: MgCl₂, magnesium chloride.', why: 'The compound is neutral: +2 − 2 = 0.' },
    ],
    verify: 'Electrons lost (2) = electrons gained (2 × 1).',
  },
  guided: {
    id: 'g-cf-l5', prompt: 'Sodium sulfide forms from sodium (2, 8, 1) and sulfur (2, 8, 6).',
    steps: [
      { id: 'g1', prompt: 'Sulfide ion.', question: pick('cf-g5-1', 'What ion does sulfur form?', [['S²⁻', null], ['S⁶⁻', 'It needs only two electrons to complete its octet.', 'ion-size']], 'Gains two.', undefined, 'cf5-ions'), hints: ['8 − 6.'] },
      { id: 'g2', prompt: 'Sodium ions needed.', question: num('cf-g5-2', 'How many Na⁺ ions balance one S²⁻?', 2, 'Two +1 charges balance −2: Na₂S.', {}), hints: ['Total charge 0.'] },
    ],
    conclusion: 'Two Na⁺ and one S²⁻: Na₂S, sodium sulfide.',
  },
  independent: [
    ind('i1', 'Ions', 'ions', 'Oxygen.', pick('cf-l5-i1', 'What ion does oxygen (2, 6) form?', [['O²⁻', null], ['O²⁺', 'Oxygen gains electrons, so it becomes negative.', 'ion-sign']], 'Gains two.'), ['8 − 6.'], ['O²⁻.']),
    ind('i2', 'Ions', 'ions', 'Particles.', num('cf-l5-i2', 'How many electrons does a Ca²⁺ ion have? (Z = 20)', 18, '20 − 2 = 18.', { rules: [[[22], 'A positive ion has LOST electrons.', 'ion-sign']] }), ['Cation: lost electrons.'], ['18.']),
    ind('i3', 'Ionic bond', 'ionic', 'Name.', pick('cf-l5-i3', 'The compound of Fe³⁺ and Cl⁻ is called…', [['ferric chloride', null], ['ferrous chloride', 'Ferrous is Fe²⁺; Fe³⁺ is ferric.', 'ferrous-ferric']], 'Fe³⁺ is ferric.'), ['Which charge is ferric?'], ['Ferric chloride, FeCl₃.']),
    ind('i4', 'Ionic bond', 'ionic', 'Molecules?', pick('cf-l5-i4', 'Why do we not speak of a "molecule" of sodium chloride?', [['Its ions form a continuous 3-D crystal, not separate molecules', null], ['It has no atoms', 'It is made of Na⁺ and Cl⁻ ions.', 'no-atoms']], 'Crystal.'), ['How are the ions arranged?'], ['Ions pack into a crystal lattice.']),
  ],
  reflection: {
    discover: 'Metals lose electrons to form cations and non-metals gain them to form anions; the opposite charges attract in an ionic bond, and the ions build a crystal.',
    evidence: 'You worked out ion charges, balanced them and named ionic compounds.',
    stillConfusing: [
      { text: 'Why is sodium +1 and chloride −1?', refresherId: 'cf5-ions' },
      { text: 'How are ionic compounds named?', refresherId: 'cf5-name' },
    ],
  },
};
