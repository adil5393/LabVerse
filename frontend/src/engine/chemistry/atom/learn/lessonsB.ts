/**
 * Chapter 8, Units 2 to 4 (Lessons 4 to 8): subatomic particles, atomic and mass number, symbols and notation, electronic
 * configuration, valency, isotopes, average atomic mass and isobars. Aligned to NCERT Exploration (2026-27), Sections 8.3 to
 * 8.9.2. Original wording; every numeric answer is checked against `../model.ts` by `__tests__/atom.test.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, pick } from '../../../education/builders';
import { ATOM_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const A4: EduLesson = {
  id: 'ca-l4', unitId: 'ca-unit-2', number: 4, title: 'Protons, neutrons, electrons: atomic and mass number',
  objective: 'describe the three subatomic particles, and find the numbers of protons, neutrons and electrons from the atomic number and mass number.',
  prerequisiteIds: ['cap-charge'],
  objectives: [
    { id: 'particles', label: 'State the charge and location of each subatomic particle' },
    { id: 'numbers', label: 'Use Z and A to find protons, neutrons and electrons' },
  ],
  steps: [
    {
      id: 'ca4-neutron', title: 'The missing mass', phase: 'observe',
      paragraphs: [
        'Hydrogen has one proton; helium has two. Yet a helium atom is about four times as heavy as a hydrogen atom, not twice. Something else in the nucleus adds mass without adding charge.',
        'In 1932 James Chadwick found it: the neutron, with almost the same mass as a proton and no charge. Every nucleus except ordinary hydrogen contains neutrons. Electrons are so light that their mass is ignored.',
      ],
      vocabulary: [{ term: 'neutron', meaning: 'an uncharged particle in the nucleus with about the mass of a proton' }],
      check: pick('chk-ca4-neutron', 'Which particle has no charge?', [['Neutron', null], ['Proton', 'A proton has charge +1.', 'particle-charge'], ['Electron', 'An electron has charge −1.', 'particle-charge']], 'The neutron is neutral.', undefined, 'ca4-neutron'),
    },
    {
      id: 'ca4-numbers', title: 'Atomic number and mass number', phase: 'reasoning',
      paragraphs: [
        'The atomic number Z is the number of protons. It decides which element an atom is: every carbon atom has 6 protons, every sodium atom 11. In a neutral atom, electrons = protons = Z.',
        'The mass number A is the number of protons plus neutrons (together called nucleons). So neutrons = A − Z. Lithium (Z = 3, A = 7) has 3 protons, 4 neutrons and 3 electrons.',
      ],
      visual: v('atomBuilder', { p: 3, n: 4, e: 3, editable: true }, 'An atom builder showing a lithium atom: 3 protons and 4 neutrons in the nucleus and 3 electrons, mass number 7. Add or remove particles to see what changes.'),
      notice: 'Changing the number of protons changes the element; changing neutrons changes only the mass number.',
      check: pick('chk-ca4-numbers', 'An atom has Z = 26 and A = 56. How many neutrons does it have?', [['30', null], ['26', 'That is the number of protons.', 'z-is-neutrons'], ['82', 'Subtract Z from A; do not add.', 'add-not-subtract']], '56 − 26 = 30.', undefined, 'ca4-numbers'),
    },
    {
      id: 'ca4-heavy', title: 'Neutrons hold heavy nuclei together', phase: 'apply',
      paragraphs: [
        'Protons repel each other, so why does a nucleus not fly apart? A strong nuclear force binds the nucleons, and neutrons add to it without adding repulsion. Light atoms often have equal numbers of protons and neutrons (carbon 6 and 6); heavy atoms need more neutrons (uranium 92 protons, 146 neutrons).',
      ],
      check: pick('chk-ca4-heavy', 'Uranium-238 has 92 protons. How many neutrons?', [['146', null], ['92', 'That is the protons; neutrons = 238 − 92.', 'z-is-neutrons'], ['330', 'Subtract, do not add.', 'add-not-subtract']], '238 − 92 = 146.', undefined, 'ca4-heavy'),
    },
  ],
  investigation: { title: 'Build atoms in the Atom Laboratory', description: 'Add protons, neutrons and electrons and watch the element, mass number and charge.', href: `${ATOM_LAB}?view=builder`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l4', title: 'Gold',
    given: ['An atom has 79 protons and mass number 197.'],
    ask: 'Find the neutrons and electrons.',
    steps: [
      { text: 'Neutrons = A − Z = 197 − 79 = 118.', why: 'A counts protons and neutrons.' },
      { text: 'Electrons = 79.', why: 'A neutral atom has as many electrons as protons.' },
    ],
    verify: '79 + 118 = 197.',
  },
  guided: {
    id: 'g-ca-l4', prompt: 'An atom has 20 protons and mass number 41.',
    steps: [
      { id: 'g1', prompt: 'Neutrons.', question: num('ca-g4-1', 'How many neutrons?', 21, '41 − 20 = 21.', { rules: [[[61], 'Subtract the protons from A.', 'add-not-subtract']] }), hints: ['n = A − Z.'] },
      { id: 'g2', prompt: 'Electrons.', question: num('ca-g4-2', 'How many electrons in the neutral atom?', 20, 'Electrons = protons = 20.', { rules: [[[21], 'That is the number of neutrons.', 'neutrons-are-electrons']] }), hints: ['Neutral: e = p.'] },
    ],
    conclusion: '21 neutrons and 20 electrons.',
  },
  independent: [
    ind('i1', 'Particles', 'particles', 'Location.', pick('ca-l4-i1', 'Where are neutrons found?', [['In the nucleus', null], ['In the shells around the nucleus', 'Electrons occupy the shells; neutrons are in the nucleus.', 'neutron-shells']], 'Nucleus.'), ['Nucleons.'], ['Protons and neutrons are in the nucleus.']),
    ind('i2', 'Numbers', 'numbers', 'Mass number.', num('ca-l4-i2', 'An atom has 17 protons and 18 neutrons. What is its mass number?', 35, '17 + 18 = 35.', {}), ['A = p + n.'], ['35.']),
    ind('i3', 'Numbers', 'numbers', 'Neutrons.', num('ca-l4-i3', 'An atom with mass number 70 has 31 electrons. How many neutrons?', 39, 'Z = 31, so n = 70 − 31 = 39.', { rules: [[[31], 'That is the number of protons (and electrons).', 'z-is-neutrons']] }), ['Electrons = protons in a neutral atom.'], ['Z = 31; n = 70 − 31 = 39.']),
    ind('i4', 'Numbers', 'numbers', 'Identity.', pick('ca-l4-i4', 'Which number decides what element an atom is?', [['The number of protons', null], ['The number of neutrons', 'Atoms of one element can have different numbers of neutrons.', 'neutrons-decide'], ['The mass number', 'Different elements can share a mass number.', 'a-decides']], 'Atomic number.'), ['Z.'], ['The proton number (Z).']),
  ],
  reflection: {
    discover: 'Protons (+1) and neutrons (0) are in the nucleus and give the mass; electrons (−1) are around it. Z = protons; A = protons + neutrons; neutrons = A − Z.',
    evidence: 'You found protons, neutrons and electrons from Z and A.',
    stillConfusing: [
      { text: 'What is the difference between Z and A?', refresherId: 'ca4-numbers' },
      { text: 'Why are neutrons needed?', refresherId: 'ca4-heavy' },
    ],
  },
};

export const A5: EduLesson = {
  id: 'ca-l5', unitId: 'ca-unit-2', number: 5, title: 'Symbols of elements and atomic notation',
  objective: 'write element symbols by the IUPAC rules, recognise symbols from Latin names, and read and write the notation with A and Z.',
  prerequisiteIds: ['cap-particles'],
  objectives: [
    { id: 'symbols', label: 'Write and recognise element symbols' },
    { id: 'notation', label: 'Read and write the notation with A and Z' },
  ],
  steps: [
    {
      id: 'ca5-symbols', title: 'One or two letters', phase: 'observe',
      paragraphs: [
        'Dalton drew pictures for elements (1803). In 1813 Berzelius proposed letters instead, and today IUPAC approves names and symbols. A symbol is the first letter of the name, sometimes with one more letter: H for hydrogen, Al for aluminium, Cl for chlorine, Zn for zinc.',
        'The first letter is always a capital and a second letter is always small: Co is cobalt, but CO is carbon monoxide, a compound of carbon and oxygen.',
      ],
      check: pick('chk-ca5-symbols', 'Which is written correctly?', [['Mg', null], ['MG', 'The second letter must be lowercase.', 'symbol-case'], ['mg', 'The first letter must be a capital.', 'symbol-case']], 'Capital, then small.', undefined, 'ca5-symbols'),
    },
    {
      id: 'ca5-latin', title: 'Symbols from other languages', phase: 'reasoning',
      paragraphs: [
        'Some symbols come from Latin, Greek or German names: Fe (ferrum) for iron, Cu (cuprum) for copper, Ag (argentum) for silver, Au (aurum) for gold, Pb (plumbum) for lead, Na (natrium) for sodium, K (kalium) for potassium, Hg (hydrargyros, Greek) for mercury, W (wolfram, German) for tungsten.',
        'Because everyone uses the same symbols, scientists everywhere can read each other’s work whatever their language.',
      ],
      check: pick('chk-ca5-latin', 'Why is the symbol for sodium Na?', [['It comes from its Latin name, natrium', null], ['S is already used, so any letters were picked', 'The symbol comes from the Latin name.', 'random-symbol']], 'Natrium.', undefined, 'ca5-latin'),
    },
    {
      id: 'ca5-notation', title: 'Writing A and Z with the symbol', phase: 'apply',
      paragraphs: [
        'An atom is written with the mass number at the top left and the atomic number at the bottom left of the symbol. Carbon with Z = 6 and A = 12 is written ¹²₆C ("carbon-12").',
        'From ²³₁₁Na you can read: 11 protons, 11 electrons, 23 − 11 = 12 neutrons.',
      ],
      visual: v('atomBuilder', { p: 11, n: 12, e: 11 }, 'A sodium atom, written ²³₁₁Na: 11 protons, 12 neutrons and 11 electrons arranged 2, 8, 1.'),
      check: pick('chk-ca5-notation', 'In ³⁵₁₇Cl, what is the number at the top?', [['The mass number, 35', null], ['The atomic number', 'The atomic number (17) is at the bottom.', 'notation-swap']], 'Top: A.', undefined, 'ca5-notation'),
    },
  ],
  investigation: { title: 'Name what you build', description: 'The atom builder shows the symbol and notation for every atom you make.', href: `${ATOM_LAB}?view=builder`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l5', title: 'Reading the notation',
    given: ['²⁷₁₃Al'],
    ask: 'How many protons, neutrons and electrons?',
    steps: [
      { text: 'Protons = 13 (bottom number).', why: 'The bottom number is Z.' },
      { text: 'Neutrons = 27 − 13 = 14.', why: 'The top number is A; n = A − Z.' },
      { text: 'Electrons = 13.', why: 'A neutral atom has e = p.' },
    ],
    verify: '13 + 14 = 27.',
  },
  guided: {
    id: 'g-ca-l5', prompt: 'A riddle: "I have mass number 23 and 11 protons, and I am a soft metal that reacts strongly with water."',
    steps: [
      { id: 'g1', prompt: 'Which element?', question: pick('ca-g5-1', 'Which element is it?', [['Sodium (Na)', null], ['Magnesium (Mg)', 'Magnesium has 12 protons.', 'z-lookup']], 'Z = 11 is sodium.', undefined, 'ca5-notation'), hints: ['Z = 11.'] },
      { id: 'g2', prompt: 'Neutrons.', question: num('ca-g5-2', 'How many neutrons does it have?', 12, '23 − 11 = 12.', {}), hints: ['A − Z.'] },
    ],
    conclusion: 'It is sodium, ²³₁₁Na, with 12 neutrons.',
  },
  independent: [
    ind('i1', 'Symbols', 'symbols', 'Iron.', pick('ca-l5-i1', 'The symbol for iron is…', [['Fe', null], ['Ir', 'Ir is iridium. Iron’s symbol comes from ferrum.', 'random-symbol'], ['I', 'I is the symbol for iodine.', 'random-symbol']], 'Ferrum.'), ['Latin.'], ['Fe, from ferrum.']),
    ind('i2', 'Symbols', 'symbols', 'Cobalt.', pick('ca-l5-i2', 'What is the difference between Co and CO?', [['Co is the element cobalt; CO is a compound of carbon and oxygen', null], ['They are the same', 'Capital letters matter: two capitals mean two elements.', 'symbol-case']], 'Case matters.'), ['Look at the second letter.'], ['Co = cobalt; CO = carbon + oxygen.']),
    ind('i3', 'Notation', 'notation', 'Neutrons.', num('ca-l5-i3', 'How many neutrons are in ⁴⁰₂₀Ca?', 20, '40 − 20 = 20.', {}), ['A − Z.'], ['20.']),
  ],
  reflection: {
    discover: 'Symbols use one capital letter and at most one small letter, some from Latin names; the notation puts A at the top and Z at the bottom of the symbol.',
    evidence: 'You wrote symbols correctly and read particle numbers from the notation.',
    stillConfusing: [
      { text: 'How are symbols written?', refresherId: 'ca5-symbols' },
      { text: 'Which number is A and which is Z?', refresherId: 'ca5-notation' },
    ],
  },
};

export const A6: EduLesson = {
  id: 'ca-l6', unitId: 'ca-unit-3', number: 6, title: 'Electrons in shells: electronic configuration',
  objective: 'use the 2n² rule and the outer-shell limit of 8 to write the electronic configuration of the first twenty elements.',
  prerequisiteIds: ['cap-particles'],
  objectives: [
    { id: 'rules', label: 'State the filling rules (2n², outer shell 8, fill in order)' },
    { id: 'write', label: 'Write the configuration of an element from its atomic number' },
  ],
  steps: [
    {
      id: 'ca6-rules', title: 'The filling rules', phase: 'observe',
      paragraphs: [
        'Bohr and Bury gave three rules: the most electrons a shell can hold is 2n² (K: 2, L: 8, M: 18); the outermost shell holds at most 8; and shells fill in order K, L, M, N, each starting only when the one inside is complete.',
        'The distribution of electrons among the shells is the electronic configuration, written like 2, 8, 1.',
      ],
      vocabulary: [{ term: 'electronic configuration', meaning: 'the number of electrons in each shell, from K outwards' }],
      check: pick('chk-ca6-rules', 'What is the most electrons the L shell (n = 2) can hold?', [['8', null], ['4', '2n² = 2 × 2² = 8, not 2 × 2.', 'forgot-square'], ['18', 'That is the M shell (n = 3).', 'shell-letter']], '2 × 4 = 8.', undefined, 'ca6-rules'),
    },
    {
      id: 'ca6-build', title: 'Building up atoms', phase: 'reasoning',
      paragraphs: [
        'Add one electron at a time as the atomic number goes up. Hydrogen: 1. Helium: 2 (K full). Lithium: 2, 1. Neon: 2, 8 (L full). Sodium: 2, 8, 1. Argon: 2, 8, 8.',
        'Potassium (19) and calcium (20) start the N shell, 2, 8, 8, 1 and 2, 8, 8, 2, because the outermost shell cannot take more than 8.',
      ],
      visual: v('atomBuilder', { p: 17, n: 18, e: 17, editable: true }, 'A chlorine atom with 17 electrons arranged 2, 8, 7 in the K, L and M shells. Change the number of electrons to see the configuration change.'),
      check: pick('chk-ca6-build', 'What is the configuration of magnesium (Z = 12)?', [['2, 8, 2', null], ['2, 10', 'The L shell holds at most 8.', 'overfill'], ['8, 4', 'Fill K first: it holds 2.', 'fill-order']], '2 + 8 + 2 = 12.', undefined, 'ca6-build'),
    },
  ],
  investigation: { title: 'Fill the shells in the Atom Laboratory', description: 'Add electrons one at a time and watch the shells fill.', href: `${ATOM_LAB}?view=builder`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l6', title: 'Sulfur',
    given: ['Sulfur: Z = 16.'],
    ask: 'Write its electronic configuration.',
    steps: [
      { text: 'K takes 2: 14 left.', why: 'K fills first and holds 2.' },
      { text: 'L takes 8: 6 left.', why: 'L holds 2 × 2² = 8.' },
      { text: 'M takes the remaining 6: 2, 8, 6.', why: '6 is within the outer-shell limit of 8.' },
    ],
    verify: '2 + 8 + 6 = 16.',
  },
  guided: {
    id: 'g-ca-l6', prompt: 'Aluminium has Z = 13.',
    steps: [
      { id: 'g1', prompt: 'M shell.', question: num('ca-g6-1', 'How many electrons are in its M shell?', 3, '13 − 2 − 8 = 3.', { rules: [[[5], 'K takes 2 and L takes 8: 13 − 10 = 3.', 'shell-arith']] }), hints: ['Fill K and L first.'] },
      { id: 'g2', prompt: 'Capacity.', question: num('ca-g6-2', 'What is the most electrons the M shell (n = 3) could hold by the 2n² rule?', 18, '2 × 3² = 18.', { rules: [[[6], 'Square n first: 2 × 9 = 18.', 'forgot-square']] }), hints: ['2n².'] },
    ],
    conclusion: 'Aluminium is 2, 8, 3; the M shell could hold 18, but only 3 are present.',
  },
  independent: [
    ind('i1', 'Write', 'write', 'Oxygen.', pick('ca-l6-i1', 'Oxygen (Z = 8) has configuration…', [['2, 6', null], ['2, 8', 'That is neon (10 electrons).', 'z-lookup'], ['8', 'The K shell holds only 2 electrons.', 'fill-order']], '2 + 6 = 8.'), ['K first.'], ['2, 6.']),
    ind('i2', 'Write', 'write', 'Argon.', pick('ca-l6-i2', 'Argon (Z = 18) has configuration…', [['2, 8, 8', null], ['2, 16', 'L holds at most 8.', 'overfill'], ['2, 8, 6, 2', 'M can hold 8 before N starts here.', 'fill-order']], '2, 8, 8.'), ['Fill K, L, M.'], ['2, 8, 8.']),
    ind('i3', 'Rules', 'rules', 'Outer electrons.', num('ca-l6-i3', 'How many electrons are in the outermost shell of silicon (Z = 14)?', 4, '2, 8, 4: four.', {}), ['Write the configuration.'], ['2, 8, 4 → 4.']),
    ind('i4', 'Write', 'write', 'Potassium.', pick('ca-l6-i4', 'Potassium (Z = 19) has configuration…', [['2, 8, 8, 1', null], ['2, 8, 9', 'The outermost shell holds at most 8, so the 19th electron starts N.', 'overfill']], 'Outer shell limit.'), ['Outer shell at most 8.'], ['2, 8, 8, 1.']),
  ],
  reflection: {
    discover: 'Shells fill in order, each holding at most 2n² electrons and the outermost at most 8; this gives configurations like 2, 8, 7 for chlorine.',
    evidence: 'You wrote configurations from atomic numbers and used the 2n² rule.',
    stillConfusing: [
      { text: 'What are the filling rules?', refresherId: 'ca6-rules' },
      { text: 'Why does potassium start a new shell?', refresherId: 'ca6-build' },
    ],
  },
};

export const A7: EduLesson = {
  id: 'ca-l7', unitId: 'ca-unit-3', number: 7, title: 'Valency: the combining capacity of an atom',
  objective: 'define valence electrons and valency, explain the octet idea, and find the valency of the first twenty elements from their configurations.',
  prerequisiteIds: ['cap-particles'],
  objectives: [
    { id: 'octet', label: 'Explain valence electrons and the stable octet' },
    { id: 'valency', label: 'Find valency from the configuration' },
  ],
  steps: [
    {
      id: 'ca7-capacity', title: 'Combining capacity', phase: 'observe',
      paragraphs: [
        'In water, H₂O, one oxygen atom combines with two hydrogen atoms; hydrogen and chlorine each combine one-to-one, so they are used as the measure. Oxygen’s combining capacity is 2. In NH₃ nitrogen’s is 3; in MgCl₂ magnesium’s is 2.',
      ],
      check: pick('chk-ca7-capacity', 'In CH₄, what is the combining capacity of carbon?', [['4', null], ['1', 'Carbon combines with four hydrogen atoms.', 'count-atoms']], 'Four hydrogens.', undefined, 'ca7-capacity'),
    },
    {
      id: 'ca7-octet', title: 'The octet', phase: 'reasoning',
      paragraphs: [
        'The outermost shell that has electrons is the valence shell, and its electrons are valence electrons. Atoms with 8 valence electrons (an octet), or 2 for helium, are stable and hardly react: neon and argon.',
        'Other atoms lose, gain or share electrons to complete an octet. The number lost, gained or shared is the valency.',
      ],
      vocabulary: [{ term: 'octet', meaning: 'eight electrons in the outermost shell' }],
      check: pick('chk-ca7-octet', 'Why does neon (2, 8) hardly react?', [['Its outermost shell already has an octet', null], ['It has no electrons', 'It has 10 electrons.', 'no-electrons']], 'Complete octet.', undefined, 'ca7-octet'),
    },
    {
      id: 'ca7-rule', title: 'Finding valency', phase: 'apply',
      paragraphs: [
        'With 1, 2 or 3 valence electrons, an atom tends to lose them: sodium (2, 8, 1) has valency 1, magnesium (2, 8, 2) has 2. With 5, 6 or 7, it tends to gain 8 minus that many: nitrogen (2, 5) has 3, oxygen (2, 6) has 2, chlorine (2, 8, 7) has 1.',
        'With exactly 4, as in carbon (2, 4), gaining or losing four is hard, so it shares four: valency 4. A full octet means valency 0.',
      ],
      visual: v('atomBuilder', { p: 8, n: 8, e: 8, editable: true, showValency: true }, 'An oxygen atom, 2, 6, with six valence electrons; it gains two to complete an octet, so its valency is 2. Change the element to see other valencies.'),
      check: pick('chk-ca7-rule', 'Sulfur is 2, 8, 6. What is its valency?', [['2', null], ['6', 'Six is the number of valence electrons. It gains 8 − 6 = 2.', 'valence-is-valency']], 'Gains 2.', undefined, 'ca7-rule'),
    },
  ],
  investigation: { title: 'See valencies in the Atom Laboratory', description: 'Build atoms and watch whether they lose, gain or share electrons.', href: `${ATOM_LAB}?view=builder`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l7', title: 'Three valencies',
    given: ['Aluminium 2, 8, 3', 'Phosphorus 2, 8, 5', 'Silicon 2, 8, 4'],
    ask: 'Find each valency.',
    steps: [
      { text: 'Aluminium: 3 valence electrons, lost: valency 3.', why: 'Fewer than four are lost.' },
      { text: 'Phosphorus: 5 valence electrons, gains 3: valency 3.', why: 'More than four: gain 8 − 5.' },
      { text: 'Silicon: 4 valence electrons, shared: valency 4.', why: 'Exactly four are shared.' },
    ],
    verify: 'Each atom ends with an octet: Al loses 3 (2, 8), P gains 3 (2, 8, 8), Si shares 4.',
  },
  guided: {
    id: 'g-ca-l7', prompt: 'Fluorine has Z = 9.',
    steps: [
      { id: 'g1', prompt: 'Valence electrons.', question: num('ca-g7-1', 'How many valence electrons does fluorine have?', 7, '2, 7: seven.', {}), hints: ['Write 2, then the rest.'] },
      { id: 'g2', prompt: 'Valency.', question: num('ca-g7-2', 'What is its valency?', 1, 'It gains 8 − 7 = 1.', { rules: [[[7], 'Seven is the valence electrons. It needs to gain just one.', 'valence-is-valency']] }), hints: ['8 − valence electrons.'] },
    ],
    conclusion: 'Fluorine, 2, 7, gains one electron: valency 1.',
  },
  independent: [
    ind('i1', 'Valency', 'valency', 'Lithium.', num('ca-l7-i1', 'Lithium is 2, 1. What is its valency?', 1, 'It loses 1.', {}), ['Fewer than four: lose.'], ['1.']),
    ind('i2', 'Valency', 'valency', 'Nitrogen.', num('ca-l7-i2', 'Nitrogen is 2, 5. What is its valency?', 3, 'It gains 8 − 5 = 3.', { rules: [[[5], 'Five is the valence electrons; it gains 3.', 'valence-is-valency']] }), ['More than four: gain 8 − v.'], ['3.']),
    ind('i3', 'Octet', 'octet', 'Argon.', num('ca-l7-i3', 'Argon is 2, 8, 8. What is its valency?', 0, 'A complete octet: valency 0.', { rules: [[[8], 'Eight valence electrons is a full octet: it neither gains nor loses.', 'valence-is-valency']] }), ['Is the shell full?'], ['0.']),
    ind('i4', 'Octet', 'octet', 'Reactivity.', pick('ca-l7-i4', 'Which atom is most likely to be unreactive?', [['Helium (2)', null], ['Sodium (2, 8, 1)', 'One valence electron is easily lost: sodium is very reactive.', 'reactive-guess'], ['Chlorine (2, 8, 7)', 'Chlorine readily gains one electron: very reactive.', 'reactive-guess']], 'Full shell.'), ['Full outer shell.'], ['Helium’s only shell is full.']),
  ],
  reflection: {
    discover: 'Valency is the number of electrons an atom loses, gains or shares to reach an octet (or a full first shell): fewer than four are lost, more than four lead to gaining 8 minus that many, four are shared.',
    evidence: 'You found valencies from configurations and explained why noble gases hardly react.',
    stillConfusing: [
      { text: 'What is an octet?', refresherId: 'ca7-octet' },
      { text: 'How do I find the valency?', refresherId: 'ca7-rule' },
    ],
  },
};

export const A8: EduLesson = {
  id: 'ca-l8', unitId: 'ca-unit-4', number: 8, title: 'Isotopes, average atomic mass and isobars',
  objective: 'define isotopes and isobars, explain why isotopes behave alike chemically, name uses of isotopes, and calculate a weighted average atomic mass.',
  prerequisiteIds: ['cap-charge'],
  objectives: [
    { id: 'isotopes', label: 'Identify isotopes and explain their similar chemistry' },
    { id: 'average', label: 'Calculate a weighted average atomic mass' },
    { id: 'isobars', label: 'Identify isobars' },
  ],
  steps: [
    {
      id: 'ca8-isotopes', title: 'Same element, different mass', phase: 'observe',
      paragraphs: [
        'Atoms of the same element always have the same number of protons, but can have different numbers of neutrons, and so different mass numbers. These are isotopes. Hydrogen has three: protium ¹₁H (no neutron, about 99.98 %), deuterium ²₁H (one neutron) and tritium ³₁H (two neutrons, in traces).',
        'Isotopes have the same electrons and configuration, so their chemistry is alike; their physical properties, such as melting and boiling points, differ slightly.',
      ],
      check: pick('chk-ca8-isotopes', 'Two atoms each have 11 protons; one has 12 neutrons and the other 13. They are…', [['isotopes of the same element', null], ['different elements', 'The same number of protons means the same element.', 'neutrons-decide'], ['isobars', 'Isobars have the same mass number; these have 23 and 24.', 'isotope-isobar']], 'Same Z, different A.', undefined, 'ca8-isotopes'),
    },
    {
      id: 'ca8-uses', title: 'Isotopes at work', phase: 'reasoning',
      paragraphs: [
        'Uranium-235 is a fuel in nuclear power stations. Cobalt-60 is used in radiation treatment of cancer. Iodine-131 treats goitre and thyroid cancer. Carbon-14 helps find the age of fossils and ancient objects.',
      ],
      check: pick('chk-ca8-uses', 'Which isotope helps date ancient objects?', [['Carbon-14', null], ['Uranium-235', 'Uranium-235 is a nuclear fuel.', 'isotope-use'], ['Cobalt-60', 'Cobalt-60 is used in cancer treatment.', 'isotope-use']], 'Carbon-14.', undefined, 'ca8-uses'),
    },
    {
      id: 'ca8-average', title: 'Average atomic mass', phase: 'apply',
      paragraphs: [
        'Natural chlorine is about 75 % chlorine-35 and 25 % chlorine-37. A plain average, (35 + 37) ÷ 2 = 36 u, ignores that chlorine-35 is three times as common. The weighted average uses the abundances: 35 × 75 ÷ 100 + 37 × 25 ÷ 100 = 26.25 + 9.25 = 35.5 u.',
        'No single chlorine atom has mass 35.5 u; it is the average over very many atoms. (1 u, the unified atomic mass unit, is the unit used for atomic masses.)',
      ],
      visual: v('isotopeMix', { element: 'Cl', editable: true }, 'An isotope mixer for chlorine: 75 % chlorine-35 and 25 % chlorine-37 give a weighted average atomic mass of 35.5 u. Change the percentages to see the average move.'),
      check: pick('chk-ca8-average', 'Why is the weighted average closer to 35 than to 37 for chlorine?', [['Chlorine-35 is much more common', null], ['Chlorine-35 atoms are heavier', 'Chlorine-37 atoms are heavier; chlorine-35 is just more common.', 'abundance-mass']], 'Abundance.', undefined, 'ca8-average'),
    },
    {
      id: 'ca8-isobars', title: 'Isobars', phase: 'reasoning',
      paragraphs: [
        'Atoms of different elements can have the same mass number. Argon-40 (Z = 18), potassium-40 (Z = 19) and calcium-40 (Z = 20) each have 40 nucleons. Such atoms are isobars: same A, different Z, so different elements.',
      ],
      check: pick('chk-ca8-isobars', '⁴⁰₁₈Ar and ⁴⁰₂₀Ca are…', [['isobars', null], ['isotopes', 'Isotopes have the same Z; these have different Z.', 'isotope-isobar']], 'Same A, different Z.', undefined, 'ca8-isobars'),
    },
  ],
  investigation: { title: 'Mix isotopes in the Atom Laboratory', description: 'Set the abundances and calculate the average atomic mass.', href: `${ATOM_LAB}?view=isotopes`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-ca-l8', title: 'Bromine',
    given: ['Bromine-79: 49.7 %; bromine-81: 50.3 %.'],
    ask: 'Find the average atomic mass.',
    steps: [
      { text: '79 × 49.7 ÷ 100 = 39.263.', why: 'Each isotope contributes mass × share.' },
      { text: '81 × 50.3 ÷ 100 = 40.743.', why: 'Same for the second isotope.' },
      { text: 'Average = 39.263 + 40.743 = 80.006 ≈ 80.0 u.', why: 'Add the contributions.' },
    ],
    verify: 'Nearly equal amounts, so the average is about halfway between 79 and 81.',
  },
  guided: {
    id: 'g-ca-l8', prompt: 'Three nuclei: X has 18 protons and 19 neutrons; Y has 17 protons and 18 neutrons; Z has 17 protons and 20 neutrons.',
    steps: [
      { id: 'g1', prompt: 'Y and Z.', question: pick('ca-g8-1', 'How are Y and Z related?', [['Isotopes: same Z (17), different A (35 and 37)', null], ['Isobars', 'Their mass numbers differ (35 and 37).', 'isotope-isobar']], 'Same protons.', undefined, 'ca8-isotopes'), hints: ['Compare protons.'] },
      { id: 'g2', prompt: 'Z and X.', question: pick('ca-g8-2', 'How are Z and X related?', [['Isobars: same A (37), different Z', null], ['Isotopes', 'They have different numbers of protons (17 and 18).', 'isotope-isobar']], 'Same A.', undefined, 'ca8-isobars'), hints: ['Find A = p + n for each.'] },
    ],
    conclusion: 'Y and Z are isotopes of chlorine; Z and X are isobars.',
  },
  independent: [
    ind('i1', 'Average', 'average', 'Two isotopes.', num('ca-l8-i1', 'An element is 90 % of mass 20 u and 10 % of mass 22 u. What is its average atomic mass, in u?', 20.2, '20 × 0.9 + 22 × 0.1 = 18 + 2.2 = 20.2 u.', { unit: 'u', rules: [[[21], 'That is the plain average; weight each mass by its abundance.', 'plain-average']] }), ['Mass × share, added.'], ['18 + 2.2 = 20.2 u.']),
    ind('i2', 'Isotopes', 'isotopes', 'Electrons.', num('ca-l8-i2', 'How many electrons does a neutral tritium atom (³₁H) have?', 1, 'Z = 1, so one electron.', { rules: [[[3], '3 is the mass number. Electrons equal protons.', 'a-is-electrons']] }), ['Electrons = protons.'], ['1.']),
    ind('i3', 'Isotopes', 'isotopes', 'Chemistry.', pick('ca-l8-i3', 'Why do isotopes of an element have the same chemical properties?', [['They have the same number and arrangement of electrons', null], ['They have the same mass', 'Their masses differ; chemistry depends on electrons.', 'abundance-mass']], 'Same electrons.'), ['What decides chemistry?'], ['Same electronic configuration.']),
    ind('i4', 'Isobars', 'isobars', 'Identify.', pick('ca-l8-i4', 'Which pair are isobars?', [['⁴⁰₁₉K and ⁴⁰₂₀Ca', null], ['¹²₆C and ¹⁴₆C', 'These are isotopes: same Z.', 'isotope-isobar']], 'Same A.'), ['Same top number.'], ['K-40 and Ca-40.']),
  ],
  reflection: {
    discover: 'Isotopes share Z but differ in A and behave alike chemically; isobars share A but are different elements; an element’s atomic mass is the abundance-weighted average of its isotopes.',
    evidence: 'You identified isotopes and isobars and calculated weighted averages.',
    stillConfusing: [
      { text: 'Isotopes or isobars?', refresherId: 'ca8-isobars' },
      { text: 'How is the weighted average found?', refresherId: 'ca8-average' },
    ],
  },
};
