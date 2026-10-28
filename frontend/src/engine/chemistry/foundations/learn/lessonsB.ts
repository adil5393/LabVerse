/**
 * Chapter 9, Units 3 and 4 (Lessons 6 to 8): writing formulae by criss-crossing, properties of ionic and covalent compounds,
 * molecular mass and formula unit mass. Aligned to NCERT Exploration (2026-27), Sections 9.5 to 9.8. Original wording;
 * formulae and masses are checked against `../model.ts` by `__tests__/foundations.test.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, pick } from '../../../education/builders';
import { FORMULA_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const F6: EduLesson = {
  id: 'cf-l6', unitId: 'cf-unit-3', number: 6, title: 'Writing chemical formulae',
  objective: 'write formulae of covalent and ionic compounds by criss-crossing valencies or charges, reducing to the simplest ratio and using brackets for polyatomic ions.',
  prerequisiteIds: ['cfp-valency'],
  objectives: [
    { id: 'criss', label: 'Criss-cross valencies or charges to write a formula' },
    { id: 'reduce', label: 'Reduce to the simplest ratio and use brackets correctly' },
  ],
  steps: [
    {
      id: 'cf6-covalent', title: 'Criss-crossing valencies', phase: 'observe',
      paragraphs: [
        'Write the symbols, write each valency under its symbol, then cross them over as subscripts. Hydrogen (1) and sulfur (2): H₂S. Carbon (4) and chlorine (1): CCl₄. A subscript of 1 is not written: hydrogen (1) and chlorine (1) give HCl.',
      ],
      visual: v('formulaBuilder', { mode: 'covalent', a: 'C', b: 'Cl' }, 'Criss-cross for carbon (valency 4) and chlorine (valency 1): the 1 goes under C and the 4 under Cl, giving CCl₄.'),
      check: pick('chk-cf6-covalent', 'What is the formula of the compound of hydrogen (valency 1) and oxygen (valency 2)?', [['H₂O', null], ['HO₂', 'The valency of oxygen (2) goes to hydrogen, not to oxygen.', 'criss-direction'], ['HO', 'The valencies differ, so the subscripts are not both 1.', 'ignore-valency']], 'Cross over the numbers.', undefined, 'cf6-covalent'),
    },
    {
      id: 'cf6-ionic', title: 'Ionic formulae', phase: 'reasoning',
      paragraphs: [
        'Write the cation first, then the anion, with their charge numbers below. Criss-cross the numbers only, then divide by any common factor so the formula gives the simplest ratio. Ca²⁺ and Cl⁻ give CaCl₂. Al³⁺ and O²⁻ give Al₂O₃. Mg²⁺ and O²⁻ give Mg₂O₂, which reduces to MgO.',
        'The charges cancel in every correct formula: in Al₂O₃, 2 × (+3) + 3 × (−2) = 0. Charges are not written in the formula of the compound.',
      ],
      visual: v('formulaBuilder', { mode: 'ionic', cation: 'al', anion: 'o', editable: true }, 'Criss-cross for Al³⁺ and O²⁻ gives Al₂O₃, and the charges cancel: +6 and −6. Choose other ions to build more formulae.'),
      check: pick('chk-cf6-ionic', 'Zn²⁺ and S²⁻ form…', [['ZnS', null], ['Zn₂S₂', 'Divide by the common factor 2: the simplest ratio is 1 : 1.', 'no-reduce']], 'Reduce 2 : 2.', undefined, 'cf6-ionic'),
    },
    {
      id: 'cf6-brackets', title: 'Brackets for polyatomic ions', phase: 'apply',
      paragraphs: [
        'When more than one of the same polyatomic ion is needed, put it in brackets with the number outside: Mg²⁺ and OH⁻ give Mg(OH)₂; Al³⁺ and SO₄²⁻ give Al₂(SO₄)₃. With only one polyatomic ion, no brackets: Ca²⁺ and CO₃²⁻ give CaCO₃.',
        'Al(OH)₃ means three OH groups; AlOH₃ would wrongly mean one O and three H.',
      ],
      check: pick('chk-cf6-brackets', 'What is the formula of calcium nitrate (Ca²⁺ and NO₃⁻)?', [['Ca(NO₃)₂', null], ['CaNO₃₂', 'Without brackets the 2 would apply only to oxygen.', 'missing-brackets'], ['CaNO₃', 'One nitrate gives only −1; two are needed for Ca²⁺.', 'ignore-valency']], 'Two nitrates in brackets.', undefined, 'cf6-brackets'),
    },
  ],
  investigation: { title: 'Build formulae in the Formula Laboratory', description: 'Pick any cation and anion and watch the criss-cross step by step.', href: `${FORMULA_LAB}?view=formula`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l6', title: 'Aluminium sulfate',
    given: ['Al³⁺ and SO₄²⁻.'],
    ask: 'Write the formula.',
    steps: [
      { text: 'Cross the numbers: Al gets 2, SO₄ gets 3.', why: 'Each ion takes the other’s charge number.' },
      { text: 'No common factor between 2 and 3.', why: 'The ratio is already simplest.' },
      { text: 'Bracket the sulfate: Al₂(SO₄)₃.', why: 'Three polyatomic ions of the same kind need brackets.' },
    ],
    verify: '2 × (+3) + 3 × (−2) = 0.',
  },
  guided: {
    id: 'g-cf-l6', prompt: 'Iron forms ferric ions Fe³⁺, which combine with hydroxide OH⁻.',
    steps: [
      { id: 'g1', prompt: 'Number of hydroxides.', question: num('cf-g6-1', 'How many OH⁻ ions balance one Fe³⁺?', 3, '3 × (−1) balances +3.', {}), hints: ['Total charge 0.'] },
      { id: 'g2', prompt: 'Formula.', question: pick('cf-g6-2', 'Which formula is correct?', [['Fe(OH)₃', null], ['FeOH₃', 'Without brackets, the 3 applies only to H.', 'missing-brackets']], 'Brackets.', undefined, 'cf6-brackets'), hints: ['Polyatomic ion more than once.'] },
    ],
    conclusion: 'Fe(OH)₃, ferric hydroxide.',
  },
  independent: [
    ind('i1', 'Criss-cross', 'criss', 'K and carbonate.', pick('cf-l6-i1', 'Potassium (K⁺) and carbonate (CO₃²⁻) form…', [['K₂CO₃', null], ['K(CO₃)₂', 'Each K⁺ is only +1, so two K⁺ are needed for one CO₃²⁻.', 'criss-direction']], 'Two K⁺.'), ['Balance −2.'], ['K₂CO₃.']),
    ind('i2', 'Reduce', 'reduce', 'Calcium oxide.', pick('cf-l6-i2', 'Calcium (Ca²⁺) and oxide (O²⁻) form…', [['CaO', null], ['Ca₂O₂', 'Reduce by the common factor 2.', 'no-reduce']], 'Simplest ratio.'), ['Common factor?'], ['CaO.']),
    ind('i3', 'Criss-cross', 'criss', 'Cuprous oxide.', pick('cf-l6-i3', 'Cuprous oxide (Cu⁺ and O²⁻) is…', [['Cu₂O', null], ['CuO', 'CuO is cupric oxide (Cu²⁺).', 'ferrous-ferric']], 'Two Cu⁺.'), ['Cuprous is +1.'], ['Cu₂O.']),
    ind('i4', 'Brackets', 'reduce', 'Ammonium sulfate.', pick('cf-l6-i4', 'Ammonium (NH₄⁺) and sulfate (SO₄²⁻) form…', [['(NH₄)₂SO₄', null], ['NH₄SO₄', 'Two NH₄⁺ are needed to balance SO₄²⁻.', 'ignore-valency'], ['NH₄₂SO₄', 'The ammonium ion needs brackets when there are two.', 'missing-brackets']], 'Two ammonium ions.'), ['Bracket the repeated ion.'], ['(NH₄)₂SO₄.']),
  ],
  reflection: {
    discover: 'Cross over the valencies (covalent) or charge numbers (ionic), reduce to the simplest ratio, and bracket a polyatomic ion used more than once; the charges must cancel.',
    evidence: 'You wrote and checked covalent and ionic formulae, including polyatomic ions.',
    stillConfusing: [
      { text: 'Why reduce the subscripts?', refresherId: 'cf6-ionic' },
      { text: 'When are brackets needed?', refresherId: 'cf6-brackets' },
    ],
  },
};

export const F7: EduLesson = {
  id: 'cf-l7', unitId: 'cf-unit-3', number: 7, title: 'Properties of ionic and covalent compounds',
  objective: 'compare ionic and covalent compounds by solubility, electrical conductivity and melting point, and explain the differences with ions.',
  prerequisiteIds: ['cfp-valency'],
  objectives: [
    { id: 'compare', label: 'Compare solubility and conductivity of ionic and covalent compounds' },
    { id: 'explain', label: 'Explain conductivity using free ions' },
  ],
  steps: [
    {
      id: 'cf7-test', title: 'Testing five compounds', phase: 'conjecture',
      paragraphs: [
        'Try dissolving sodium chloride, copper sulfate, sugar, camphor and naphthalene in water and in kerosene, and test whether each solid, and each water solution, lights a bulb in a simple circuit. (Use a low-voltage battery; kerosene and petrol catch fire easily.)',
      ],
      prediction: { id: 'pr-cf7-test', prompt: 'Which water solutions will light the bulb?', options: [{ id: 'p1', text: 'Sodium chloride and copper sulfate' }, { id: 'p2', text: 'Sodium chloride, copper sulfate and sugar' }, { id: 'p3', text: 'All five' }], expectedId: 'p1', reveal: 'Only the ionic compounds, sodium chloride and copper sulfate, conduct in water: their ions are free to move. Sugar dissolves but gives no ions; camphor and naphthalene do not dissolve in water.' },
      visual: v('propertiesTest', { editable: true }, 'A test bench for sodium chloride, copper sulfate, sugar, camphor and naphthalene: solubility in water and kerosene, and whether the solid and the water solution conduct electricity.'),
      check: pick('chk-cf7-test', 'Which dissolves in kerosene but not in water?', [['Camphor', null], ['Sodium chloride', 'Ionic compounds dissolve in water, not kerosene.', 'solubility-swap']], 'A covalent compound.', undefined, 'cf7-test'),
    },
    {
      id: 'cf7-explain', title: 'Why ionic solutions conduct', phase: 'reasoning',
      paragraphs: [
        'A current needs moving charges. In a solid ionic compound the ions are locked in the crystal, so it does not conduct. Dissolved in water (or melted), the ions are free to move, so it conducts.',
        'Sugar dissolves in water as whole molecules, not ions, so sugar water does not conduct. Ionic compounds generally have high melting and boiling points because the forces between ions are strong; covalent compounds usually melt and boil at lower temperatures.',
      ],
      check: pick('chk-cf7-explain', 'Why does solid sodium chloride not conduct electricity?', [['Its ions are held in fixed positions', null], ['It has no charged particles', 'It is made of charged ions; they just cannot move in the solid.', 'no-charges']], 'Ions cannot move.', undefined, 'cf7-explain'),
    },
  ],
  investigation: { title: 'Run the property tests', description: 'Test each compound for solubility and conductivity.', href: `${FORMULA_LAB}?view=properties`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l7', title: 'An unknown solid',
    given: ['A white solid does not conduct as a solid, dissolves in water, and the solution conducts.'],
    ask: 'What kind of bond does it have?',
    steps: [
      { text: 'It conducts only when dissolved.', why: 'Ions must be free to move.' },
      { text: 'So it is made of ions: an ionic compound.', why: 'Covalent compounds like sugar give no ions in water.' },
    ],
    verify: 'Matches sodium chloride and copper sulfate in the tests.',
  },
  guided: {
    id: 'g-cf-l7', prompt: 'Metal M has two electrons in its M shell and reacts with oxygen.',
    steps: [
      { id: 'g1', prompt: 'Formula.', question: pick('cf-g7-1', 'What is the formula of its oxide?', [['MO', null], ['M₂O', 'M forms M²⁺ (loses two), which balances one O²⁻.', 'criss-direction']], 'M²⁺ and O²⁻.', undefined, 'cf7-explain'), hints: ['Two valence electrons: M²⁺.'] },
      { id: 'g2', prompt: 'Bond.', question: pick('cf-g7-2', 'What type of bond does the oxide have, and does its solution conduct?', [['Ionic; the solution conducts', null], ['Covalent; it does not conduct', 'A metal and a non-metal transfer electrons: ionic.', 'bond-type-swap']], 'Metal + non-metal.', undefined, 'cf7-explain'), hints: ['Metal with non-metal.'] },
    ],
    conclusion: 'MO is ionic, and its solution conducts electricity.',
  },
  independent: [
    ind('i1', 'Compare', 'compare', 'Sugar.', pick('cf-l7-i1', 'Sugar dissolves in water. Does the solution conduct?', [['No: sugar dissolves as molecules, not ions', null], ['Yes: everything that dissolves conducts', 'Only solutions with free ions conduct.', 'dissolve-conduct']], 'No ions.'), ['Are there ions?'], ['No ions, no current.']),
    ind('i2', 'Explain', 'explain', 'Melted salt.', pick('cf-l7-i2', 'Would molten (melted) sodium chloride conduct?', [['Yes: the ions are free to move', null], ['No: only solutions conduct', 'Melting also frees the ions.', 'dissolve-conduct']], 'Free ions.'), ['What melting does to the crystal.'], ['Yes; the ions are mobile in the liquid.']),
    ind('i3', 'Compare', 'compare', 'Melting point.', pick('cf-l7-i3', 'Which usually has the higher melting point?', [['An ionic compound such as sodium chloride', null], ['A covalent compound such as naphthalene', 'Covalent compounds like naphthalene melt at low temperatures.', 'mp-swap']], 'Strong ionic forces.'), ['Forces between ions.'], ['Ionic.']),
  ],
  reflection: {
    discover: 'Ionic compounds usually dissolve in water, conduct when dissolved or melted (free ions) and melt at high temperatures; covalent compounds often dissolve in kerosene, do not conduct and melt lower.',
    evidence: 'You predicted and explained the property tests.',
    stillConfusing: [{ text: 'Why do only some solutions conduct?', refresherId: 'cf7-explain' }],
  },
};

export const F8: EduLesson = {
  id: 'cf-l8', unitId: 'cf-unit-4', number: 8, title: 'Molecular mass and formula unit mass',
  objective: 'calculate the molecular mass of a covalent compound and the formula unit mass of an ionic compound from atomic masses.',
  prerequisiteIds: ['cfp-ratio'],
  objectives: [
    { id: 'molecular', label: 'Calculate molecular mass' },
    { id: 'formula-unit', label: 'Calculate formula unit mass, including brackets' },
  ],
  steps: [
    {
      id: 'cf8-molecular', title: 'Adding atomic masses', phase: 'observe',
      paragraphs: [
        'The molecular mass of a covalent compound is the sum of the atomic masses of all the atoms in one molecule. With H = 1 u and O = 16 u, water H₂O is 2 × 1 + 16 = 18 u. With C = 12 u, carbon dioxide CO₂ is 12 + 2 × 16 = 44 u.',
      ],
      visual: v('formulaMass', { formula: 'CO2', editable: true }, 'The molecular mass of CO₂ worked out: 1 carbon × 12 u + 2 oxygen × 16 u = 44 u. Type another formula to see its mass.'),
      check: pick('chk-cf8-molecular', 'What is the molecular mass of methane, CH₄? (C = 12 u, H = 1 u)', [['16 u', null], ['13 u', 'There are four hydrogen atoms: 12 + 4.', 'count-once']], '12 + 4 = 16 u.', undefined, 'cf8-molecular'),
    },
    {
      id: 'cf8-unit', title: 'Formula unit mass', phase: 'reasoning',
      paragraphs: [
        'Ionic compounds have no molecules, so we use the formula unit: the simplest ratio of ions. Its mass is the formula unit mass. Sodium oxide Na₂O (Na = 23 u): 2 × 23 + 16 = 62 u.',
        'A bracket multiplies everything inside: Ca(NO₃)₂ (Ca = 40, N = 14) = 40 + 2 × (14 + 3 × 16) = 40 + 2 × 62 = 164 u.',
      ],
      check: pick('chk-cf8-unit', 'What is the formula unit mass of Mg(OH)₂? (Mg = 24, O = 16, H = 1)', [['58 u', null], ['41 u', 'The bracket doubles both O and H: 24 + 2 × 17.', 'bracket-once']], '24 + 2 × 17 = 58 u.', undefined, 'cf8-unit'),
    },
  ],
  investigation: { title: 'Calculate masses in the Formula Laboratory', description: 'Type any formula and see each atom’s share of the mass.', href: `${FORMULA_LAB}?view=mass`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cf-l8', title: 'Nitric acid',
    given: ['HNO₃; H = 1 u, N = 14 u, O = 16 u.'],
    ask: 'Find its molecular mass.',
    steps: [
      { text: 'H: 1 × 1 = 1 u; N: 1 × 14 = 14 u.', why: 'One atom of each.' },
      { text: 'O: 3 × 16 = 48 u.', why: 'Three oxygen atoms.' },
      { text: 'Total = 1 + 14 + 48 = 63 u.', why: 'Add every atom’s mass.' },
    ],
    verify: '63 u.',
  },
  guided: {
    id: 'g-cf-l8', prompt: 'Potassium chloride is KCl (K = 39 u, Cl = 35.5 u).',
    steps: [
      { id: 'g1', prompt: 'Formula unit mass.', question: num('cf-g8-1', 'What is its formula unit mass, in u?', 74.5, '39 + 35.5 = 74.5 u.', { unit: 'u' }), hints: ['One of each.'] },
      { id: 'g2', prompt: 'Why "formula unit"?', question: pick('cf-g8-2', 'Why is it called a formula unit mass, not a molecular mass?', [['KCl is ionic: it forms a crystal of ions, not molecules', null], ['Because chlorine is a gas', 'The reason is the ionic bonding, not the state of chlorine.', 'irrelevant-evidence']], 'Ionic.', undefined, 'cf8-unit'), hints: ['Ionic or covalent?'] },
    ],
    conclusion: 'KCl, an ionic compound, has a formula unit mass of 74.5 u.',
  },
  independent: [
    ind('i1', 'Molecular', 'molecular', 'Ammonia.', num('cf-l8-i1', 'What is the molecular mass of ammonia, NH₃? (N = 14, H = 1)', 17, '14 + 3 = 17 u.', { unit: 'u' }), ['One N, three H.'], ['17 u.']),
    ind('i2', 'Formula unit', 'formula-unit', 'Calcium carbonate.', num('cf-l8-i2', 'What is the formula unit mass of CaCO₃? (Ca = 40, C = 12, O = 16)', 100, '40 + 12 + 48 = 100 u.', { unit: 'u' }), ['Three oxygen atoms.'], ['100 u.']),
    ind('i3', 'Formula unit', 'formula-unit', 'Aluminium sulfate.', num('cf-l8-i3', 'What is the formula unit mass of Al₂(SO₄)₃? (Al = 27, S = 32, O = 16)', 342, '2 × 27 + 3 × (32 + 64) = 54 + 288 = 342 u.', { unit: 'u', rules: [[[150], 'The bracket multiplies the whole sulfate by 3.', 'bracket-once']] }), ['Each SO₄ is 96 u.'], ['54 + 3 × 96 = 342 u.']),
    ind('i4', 'Molecular', 'molecular', 'Sulfuric acid.', num('cf-l8-i4', 'What is the molecular mass of H₂SO₄? (H = 1, S = 32, O = 16)', 98, '2 + 32 + 64 = 98 u.', { unit: 'u' }), ['Two H, one S, four O.'], ['98 u.']),
  ],
  reflection: {
    discover: 'Molecular mass (covalent) and formula unit mass (ionic) are the sums of the atomic masses in the formula, with brackets multiplying everything inside.',
    evidence: 'You calculated masses including formulae with brackets.',
    stillConfusing: [
      { text: 'How do I add up atomic masses?', refresherId: 'cf8-molecular' },
      { text: 'What does a bracket do?', refresherId: 'cf8-unit' },
    ],
  },
};
