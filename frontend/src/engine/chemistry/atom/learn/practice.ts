/** Chapter 8 (Journey Inside the Atom) practice bank and chapter assessment. Original questions; numbers checked by `__tests__/atom.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const ATOM_PRACTICE: PracticeSet = {
  id: 'atom-practice', title: 'Atom chapter practice',
  groups: [
    {
      id: 'g-models', title: 'Atomic models', blurb: 'Thomson, Rutherford and Bohr (Lessons 1 to 3).',
      items: [
        item('ap-1', 'Gold foil', 'Conclusion.', choose('ap-1q', 'Which statement about the gold foil experiment is correct?', [['It disproved the plum pudding model and led to the idea of a nucleus', null], ['It showed that neutrons exist', 'Neutrons were discovered by Chadwick in 1932.'], ['It showed how electrons move around the nucleus', 'The α particles were deflected by the nucleus; the experiment said nothing about electron paths.']], 'Nucleus.'), ['What was new after 1911?'], ['The large deflections required a tiny, dense, positive nucleus.'], 'standard', 2),
        item('ap-2', 'Bohr', 'Statement.', choose('ap-2q', 'According to Bohr, electrons…', [['revolve in orbits of fixed energy without losing energy', null], ['can be anywhere around the nucleus with any energy', 'Only certain shells, each with a definite energy, are allowed.'], ['slowly fall into the nucleus', 'That was the problem with Rutherford’s model that Bohr solved.']], 'Stationary states.'), ['Fixed shells.'], ['Electrons occupy shells of definite energy and do not lose energy there.'], 'basic'),
        item('ap-3', 'Timeline', 'Order.', choose('ap-3q', 'Which is the correct order of atomic models?', [['Dalton, Thomson, Rutherford, Bohr', null], ['Thomson, Dalton, Bohr, Rutherford', 'Dalton (1808) came before Thomson (1897); Rutherford (1911) before Bohr (1913).']], 'By date.'), ['Dates: 1808, 1897, 1911, 1913.'], ['Dalton → Thomson → Rutherford → Bohr.'], 'basic'),
        item('ap-4', 'Thomson', 'Charge.', num('ap-4q', 'A model atom has a positive sphere of +7 and 9 electrons. What is its overall charge?', -2, '+7 − 9 = −2.', { rules: [[[2], 'Check the sign: there is more negative charge.']] }), ['Add the charges.'], ['+7 + 9 × (−1) = −2.'], 'standard'),
      ],
    },
    {
      id: 'g-numbers', title: 'Particles and numbers', blurb: 'Z, A, neutrons and notation (Lessons 4 and 5).',
      items: [
        item('ap-5', 'Neutrons', 'Iron.', num('ap-5q', 'An atom with atomic number 26 has 56 nucleons. How many neutrons?', 30, '56 − 26 = 30.', {}), ['n = A − Z.'], ['30.'], 'basic'),
        item('ap-6', 'Mass number', 'Chlorine.', num('ap-6q', 'An atom has 18 neutrons and atomic number 17. What is its mass number?', 35, '17 + 18 = 35.', {}), ['A = Z + n.'], ['35.'], 'basic'),
        item('ap-7', 'Notation', 'Magnesium.', num('ap-7q', 'Magnesium has mass number 24 and atomic number 12. How many neutrons?', 12, '24 − 12 = 12.', {}), ['A − Z.'], ['12.'], 'basic'),
        item('ap-8', 'Symbols', 'Lead.', choose('ap-8q', 'The symbol Pb stands for…', [['lead (plumbum)', null], ['phosphorus', 'Phosphorus is P.'], ['potassium', 'Potassium is K (kalium).']], 'Plumbum.'), ['Latin.'], ['Pb: plumbum, lead.'], 'basic'),
        item('ap-9', 'Heavy electrons', 'Thought experiment.', choose('ap-9q', 'If every electron in an atom with 12 protons and 12 neutrons were replaced by a particle with the same charge but 500 times heavier, what would NOT change?', [['The atomic number and the mass number', null], ['The atomic mass', 'The new particles add noticeable mass, so the atomic mass rises.']], 'Z counts protons; A counts nucleons.'), ['What do Z and A count?'], ['Z = 12 and A = 24 count only protons and neutrons; the charge stays 0; the atomic mass increases.'], 'challenge', 2),
      ],
    },
    {
      id: 'g-electrons', title: 'Electrons and valency', blurb: 'Configurations and combining capacity (Lessons 6 and 7).',
      items: [
        item('ap-10', 'Configuration', 'Sulfur.', choose('ap-10q', 'The configuration of sulfur (Z = 16) is…', [['2, 8, 6', null], ['2, 6, 8', 'Fill the L shell completely before M.'], ['8, 8', 'The K shell holds only 2 electrons.']], 'K, L, M in order.'), ['Fill in order.'], ['2, 8, 6.'], 'basic'),
        item('ap-11', 'Valency', 'Phosphorus.', num('ap-11q', 'Phosphorus is 2, 8, 5. What is its valency?', 3, 'Gains 8 − 5 = 3.', {}), ['More than four: gain.'], ['3.'], 'standard'),
        item('ap-12', 'Valency', 'Element X.', num('ap-12q', 'Element X has mass number 35 and 18 neutrons. How many valence electrons does it have?', 7, 'Z = 17 (chlorine), 2, 8, 7: seven.', {}), ['Find Z first.'], ['Z = 35 − 18 = 17; 2, 8, 7 → 7.'], 'challenge', 2),
        item('ap-13', 'Capacity', '2n².', num('ap-13q', 'What is the maximum number of electrons in the N shell (n = 4) by the 2n² rule?', 32, '2 × 16 = 32.', { rules: [[[8], 'That is 2 × 4; square n first.']] }), ['2n².'], ['2 × 4² = 32.'], 'standard'),
      ],
    },
    {
      id: 'g-isotopes', title: 'Isotopes and isobars', blurb: 'Relations between nuclei and average atomic mass (Lesson 8).',
      items: [
        item('ap-14', 'Average', 'Bromine.', num('ap-14q', 'Bromine is 49.7 % bromine-79 and 50.3 % bromine-81. What is its average atomic mass, in u, to one decimal place?', 80, '79 × 0.497 + 81 × 0.503 ≈ 80.0 u.', { unit: 'u', tolerance: 0.06 }), ['Mass × share.'], ['39.263 + 40.743 = 80.006 ≈ 80.0 u.'], 'standard', 2),
        item('ap-15', 'Relation', 'Add neutrons.', choose('ap-15q', 'Two neutrons are added to the nucleus of chlorine-35. What is the new atom?', [['Chlorine-37, an isotope of the original', null], ['Argon-37', 'Adding neutrons does not change the number of protons, so it is still chlorine.']], 'Same Z.'), ['Did Z change?'], ['Z stays 17; A becomes 37: an isotope.'], 'standard'),
        item('ap-16', 'Relation', 'Isobars.', choose('ap-16q', 'Which pair are isobars?', [['Argon-40 and calcium-40', null], ['Carbon-12 and carbon-14', 'Same element: isotopes.']], 'Same A, different Z.'), ['Same mass number.'], ['Ar-40 and Ca-40.'], 'basic'),
      ],
    },
  ],
};

export const ATOM_ASSESSMENT: ChapterAssessment = {
  id: 'atom-assessment-1',
  title: 'Journey Inside the Atom: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'ta-1', topic: 'Electron', lessonId: 'ca-l1', competency: 'knowledge', marks: 1, prompt: 'Discovery.', question: choose('ta-1q', 'The electron was discovered from studies of…', [['cathode rays', null], ['α-particle scattering', 'That revealed the nucleus.'], ['radioactive dating', 'Not how electrons were found.']], 'Cathode rays.'), solution: ['Thomson identified cathode rays as streams of electrons (1897).'] },
        { id: 'ta-2', topic: 'Neutron', lessonId: 'ca-l4', competency: 'knowledge', marks: 1, prompt: 'Charge.', question: choose('ta-2q', 'The relative charge of a neutron is…', [['0', null], ['+1', 'That is the proton.'], ['−1', 'That is the electron.']], 'Neutral.'), solution: ['Neutrons carry no charge.'] },
        { id: 'ta-3', topic: 'Isotopes', lessonId: 'ca-l8', competency: 'knowledge', marks: 1, prompt: 'Definition.', question: choose('ta-3q', 'Isotopes are atoms with…', [['the same atomic number but different mass numbers', null], ['the same mass number but different atomic numbers', 'Those are isobars.']], 'Same Z.'), solution: ['Isotopes: same Z, different A.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'ta-4', topic: 'Neutrons', lessonId: 'ca-l4', competency: 'application', marks: 2, prompt: 'Gold.', question: num('ta-4q', 'An atom has 79 protons and mass number 197. How many neutrons?', 118, '197 − 79 = 118.', {}), solution: ['n = A − Z = 197 − 79 = 118.'] },
        { id: 'ta-5', topic: 'Configuration', lessonId: 'ca-l6', competency: 'application', marks: 2, prompt: 'Calcium.', question: choose('ta-5q', 'The electronic configuration of calcium (Z = 20) is…', [['2, 8, 8, 2', null], ['2, 8, 10', 'The outermost shell can hold at most 8.'], ['2, 18', 'L holds at most 8.']], 'Outer shell ≤ 8.'), solution: ['K 2, L 8, M 8, N 2.'] },
        { id: 'ta-6', topic: 'Valency', lessonId: 'ca-l7', competency: 'application', marks: 2, prompt: 'Aluminium.', question: num('ta-6q', 'What is the valency of aluminium (Z = 13)?', 3, '2, 8, 3: loses 3.', {}), solution: ['2, 8, 3.', 'Three valence electrons are lost: valency 3.'] },
        { id: 'ta-7', topic: 'Average mass', lessonId: 'ca-l8', competency: 'application', marks: 2, prompt: 'Chlorine.', question: num('ta-7q', 'Chlorine is 75 % chlorine-35 and 25 % chlorine-37. What is its average atomic mass, in u?', 35.5, '26.25 + 9.25 = 35.5 u.', { unit: 'u' }), solution: ['35 × 0.75 = 26.25.', '37 × 0.25 = 9.25.', 'Sum 35.5 u.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'ta-8', topic: 'Gold foil', lessonId: 'ca-l2', competency: 'analysis', marks: 2, prompt: 'Ruling out a model.', question: choose('ta-8q', 'Why does the bouncing back of even a few α particles rule out Thomson’s model?', [['Spread-out positive charge could never push a fast α particle back', null], ['Thomson’s model has no electrons', 'It does have electrons, spread through the positive sphere.']], 'Needs concentrated charge.'), solution: ['Bouncing back needs a large, concentrated positive charge.', 'Thomson’s spread-out charge gives only tiny deflections.'] },
        { id: 'ta-9', topic: 'Stability', lessonId: 'ca-l3', competency: 'analysis', marks: 2, prompt: 'Two models.', question: choose('ta-9q', 'Both Rutherford’s and Bohr’s models have orbiting electrons. Why does only Bohr’s explain stable atoms?', [['Bohr’s electrons in fixed shells do not lose energy', null], ['Bohr’s electrons do not move', 'They still move around the nucleus.'], ['Rutherford had no nucleus', 'Rutherford introduced the nucleus.']], 'Stationary states.'), solution: ['Rutherford: an accelerating electron should lose energy and spiral in.', 'Bohr: no energy is lost in an allowed shell.'] },
        { id: 'ta-10', topic: 'Relations', lessonId: 'ca-l8', competency: 'analysis', marks: 2, prompt: 'Three nuclei.', question: choose('ta-10q', 'P has 18 protons and 22 neutrons; Q has 20 protons and 20 neutrons. P and Q are…', [['isobars (both A = 40)', null], ['isotopes', 'Their atomic numbers differ.'], ['the same element', 'Different numbers of protons mean different elements.']], 'Same A.'), solution: ['A(P) = 40, A(Q) = 40, Z differ.', 'Isobars.'] },
      ],
    },
  ],
};
