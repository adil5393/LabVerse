/** Chapter 9 (Atomic Foundations of Matter) practice bank and chapter assessment. Original; checked by `__tests__/foundations.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const FOUND_PRACTICE: PracticeSet = {
  id: 'foundations-practice', title: 'Atomic foundations chapter practice',
  groups: [
    {
      id: 'g-laws', title: 'Laws of chemical combination', blurb: 'Conservation, constant proportions and Dalton (Lessons 1 to 3).',
      items: [
        item('fp-1', 'Conservation', 'Closed flask.', num('fp-1q', 'In a sealed flask, 6.0 g of zinc reacts with 7.3 g of hydrochloric acid. The products are zinc chloride and 0.2 g of hydrogen. What mass of zinc chloride forms, in grams?', 13.1, '13.3 − 0.2 = 13.1 g.', { unit: 'g' }), ['Reactants − hydrogen.'], ['6.0 + 7.3 = 13.3 g; 13.3 − 0.2 = 13.1 g.'], 'standard', 2),
        item('fp-2', 'Proportions', 'Carbon monoxide.', num('fp-2q', 'Carbon monoxide has C : O = 3 : 4 by mass. How much carbon combines with 20 g of oxygen, in grams?', 15, '20 × 3 ÷ 4 = 15 g.', { unit: 'g' }), ['Scale the ratio.'], ['15 g.'], 'standard'),
        item('fp-3', 'Dalton', 'Postulate.', choose('fp-3q', 'Which observation does the postulate "atoms are neither created nor destroyed in a reaction" explain?', [['The mass of products equals the mass of reactants', null], ['Water always contains H and O in the ratio 1 : 8', 'That is explained by atoms combining in fixed numbers with fixed masses.']], 'Conservation.'), ['Which law is about total mass?'], ['Conservation of mass.'], 'basic'),
        item('fp-4', 'Conservation', 'Open beaker.', choose('fp-4q', 'Marble chips react with acid in an open beaker and the balance reading falls. Why?', [['Carbon dioxide gas escapes', null], ['Mass is destroyed', 'Mass is never destroyed in a reaction.']], 'Gas escapes.'), ['What is given off?'], ['CO₂ leaves the beaker.'], 'basic'),
      ],
    },
    {
      id: 'g-bonds', title: 'Bonds and naming', blurb: 'Covalent and ionic bonding (Lessons 4 and 5).',
      items: [
        item('fp-5', 'Covalent', 'Name.', choose('fp-5q', 'What is the name of SF₆?', [['Sulfur hexafluoride', null], ['Monosulfur hexafluorine', 'Mono is dropped for the first element and the second ends in -ide.']], 'Hexa-fluoride.'), ['Prefix rules.'], ['Sulfur hexafluoride.'], 'basic'),
        item('fp-6', 'Covalent', 'Name.', choose('fp-6q', 'What is the name of N₂O₄?', [['Dinitrogen tetroxide', null], ['Dinitrogen tetraoxide', 'Drop the a of tetra before oxide.']], 'Tetroxide.'), ['Vowel rule.'], ['Dinitrogen tetroxide.'], 'standard'),
        item('fp-7', 'Ionic', 'Ion.', num('fp-7q', 'How many electrons does a chloride ion (Cl⁻, Z = 17) have?', 18, '17 + 1 = 18.', {}), ['Anion: gained one.'], ['18.'], 'basic'),
        item('fp-8', 'Ionic', 'Fill the blank.', choose('fp-8q', 'Magnesium gives two electrons to become Mg²⁺; chlorine takes one to become Cl⁻. How do they combine?', [['One Mg²⁺ with two Cl⁻: MgCl₂', null], ['One Mg²⁺ with one Cl⁻: MgCl', 'The charges would not cancel: +2 − 1 = +1.']], 'Charges cancel.'), ['Balance the charges.'], ['MgCl₂.'], 'standard'),
      ],
    },
    {
      id: 'g-formulae', title: 'Formulae and properties', blurb: 'Criss-cross, brackets and properties (Lessons 6 and 7).',
      items: [
        item('fp-9', 'Formula', 'Ferric chloride.', choose('fp-9q', 'Ferric chloride is…', [['FeCl₃', null], ['FeCl₂', 'That is ferrous chloride (Fe²⁺).']], 'Fe³⁺.'), ['Ferric is +3.'], ['FeCl₃.'], 'basic'),
        item('fp-10', 'Formula', 'Sodium hydrogencarbonate.', choose('fp-10q', 'Sodium hydrogencarbonate is…', [['NaHCO₃', null], ['Na(HCO₃)₂', 'Na⁺ and HCO₃⁻ combine 1 : 1.']], 'One to one.'), ['Both have charge 1.'], ['NaHCO₃.'], 'basic'),
        item('fp-11', 'Formula', 'Ferric hydroxide.', choose('fp-11q', 'Fe³⁺ and OH⁻ form…', [['Fe(OH)₃', null], ['FeOH₃', 'Brackets are needed around the three OH groups.'], ['Fe₃OH', 'The 3 belongs to the hydroxide.']], 'Brackets.'), ['Three hydroxides.'], ['Fe(OH)₃.'], 'standard'),
        item('fp-12', 'Properties', 'Conductor.', choose('fp-12q', 'A solid that does not conduct but whose water solution conducts is probably…', [['ionic', null], ['covalent', 'Covalent compounds give no ions in water.']], 'Free ions.'), ['When do ions move?'], ['Ionic.'], 'basic'),
      ],
    },
    {
      id: 'g-mass', title: 'Molecular and formula unit mass', blurb: 'Adding atomic masses (Lesson 8).',
      items: [
        item('fp-13', 'Mass', 'Nitric acid.', num('fp-13q', 'What is the molecular mass of HNO₃? (H 1, N 14, O 16)', 63, '1 + 14 + 48 = 63 u.', { unit: 'u' }), ['Three O.'], ['63 u.'], 'basic'),
        item('fp-14', 'Mass', 'Calcium nitrate.', num('fp-14q', 'What is the formula unit mass of Ca(NO₃)₂? (Ca 40, N 14, O 16)', 164, '40 + 2 × 62 = 164 u.', { unit: 'u', rules: [[[102], 'The bracket doubles the whole nitrate group.']] }), ['Nitrate = 62 u.'], ['164 u.'], 'standard', 2),
        item('fp-15', 'Mass', 'Magnesium hydroxide.', num('fp-15q', 'What is the formula unit mass of Mg(OH)₂? (Mg 24, O 16, H 1)', 58, '24 + 2 × 17 = 58 u.', { unit: 'u' }), ['OH = 17 u.'], ['58 u.'], 'standard'),
        item('fp-16', 'Mass', 'Glucose.', num('fp-16q', 'What is the molecular mass of glucose, C₆H₁₂O₆? (C 12, H 1, O 16)', 180, '72 + 12 + 96 = 180 u.', { unit: 'u' }), ['Multiply each by its count.'], ['180 u.'], 'challenge', 2),
      ],
    },
  ],
};

export const FOUND_ASSESSMENT: ChapterAssessment = {
  id: 'foundations-assessment-1',
  title: 'Atomic Foundations of Matter: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Use the atomic masses each question gives. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'fa9-1', topic: 'Law', lessonId: 'cf-l2', competency: 'knowledge', marks: 1, prompt: 'Law.', question: choose('fa9-1q', 'The law of constant proportions says that…', [['a compound always contains its elements in the same ratio by mass', null], ['mass is neither created nor destroyed', 'That is the law of conservation of mass.']], 'Fixed ratio.'), solution: ['Proust: fixed mass ratio in a compound.'] },
        { id: 'fa9-2', topic: 'Bond', lessonId: 'cf-l4', competency: 'knowledge', marks: 1, prompt: 'Covalent.', question: choose('fa9-2q', 'A covalent bond is formed by…', [['sharing a pair of electrons', null], ['transferring electrons', 'Transfer gives ions and an ionic bond.']], 'Sharing.'), solution: ['A shared electron pair.'] },
        { id: 'fa9-3', topic: 'Ion', lessonId: 'cf-l5', competency: 'knowledge', marks: 1, prompt: 'Cation.', question: choose('fa9-3q', 'Which is a cation?', [['Na⁺', null], ['Cl⁻', 'A negative ion is an anion.'], ['O²⁻', 'A negative ion is an anion.']], 'Positive.'), solution: ['Cations are positive.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'fa9-4', topic: 'Conservation', lessonId: 'cf-l1', competency: 'application', marks: 2, prompt: 'Carbon dioxide.', question: num('fa9-4q', '12 g of carbon gives 44 g of carbon dioxide. How much carbon dioxide does 6 g of carbon give, in grams?', 22, '44 × 6 ÷ 12 = 22 g.', { unit: 'g' }), solution: ['6 g is half of 12 g.', 'Half of 44 g = 22 g.'] },
        { id: 'fa9-5', topic: 'Formula', lessonId: 'cf-l6', competency: 'application', marks: 2, prompt: 'Aluminium oxide.', question: choose('fa9-5q', 'Al³⁺ and O²⁻ form…', [['Al₂O₃', null], ['Al₃O₂', 'Cross the charges: Al takes 2 and O takes 3.'], ['AlO', 'The charges +3 and −2 would not cancel.']], 'Criss-cross.'), solution: ['Al gets 2, O gets 3: Al₂O₃.', '2 × 3 = 3 × 2 = 6.'] },
        { id: 'fa9-6', topic: 'Mass', lessonId: 'cf-l8', competency: 'application', marks: 2, prompt: 'Sodium oxide.', question: num('fa9-6q', 'What is the formula unit mass of Na₂O? (Na 23, O 16)', 62, '46 + 16 = 62 u.', { unit: 'u' }), solution: ['2 × 23 + 16 = 62 u.'] },
        { id: 'fa9-7', topic: 'Name', lessonId: 'cf-l4', competency: 'application', marks: 2, prompt: 'Name.', question: choose('fa9-7q', 'What is the name of PCl₃?', [['Phosphorus trichloride', null], ['Phosphorus chloride', 'The prefix tri- shows three chlorine atoms.']], 'Prefix.'), solution: ['Tri = 3, chlorine → chloride.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'fa9-8', topic: 'Properties', lessonId: 'cf-l7', competency: 'analysis', marks: 2, prompt: 'Conductivity.', question: choose('fa9-8q', 'Sugar water and salt water are both clear. Only salt water lights a bulb. Why?', [['Salt gives free ions in water; sugar dissolves as neutral molecules', null], ['Salt water is more concentrated', 'Even concentrated sugar water does not conduct: it has no ions.']], 'Ions.'), solution: ['NaCl → Na⁺ and Cl⁻ that move.', 'Sugar molecules are neutral.'] },
        { id: 'fa9-9', topic: 'Proportions', lessonId: 'cf-l2', competency: 'analysis', marks: 2, prompt: 'Two samples.', question: choose('fa9-9q', 'Sample P of a compound has 2 g of A with 5 g of B; sample Q has 6 g of A with 15 g of B. What can you conclude?', [['They have the same ratio (2 : 5), consistent with one compound', null], ['They are different compounds because the masses differ', 'Masses differ but the ratio 6 : 15 = 2 : 5 is the same.']], 'Compare ratios.'), solution: ['6 : 15 simplifies to 2 : 5.', 'Same ratio: consistent with constant proportions.'] },
        { id: 'fa9-10', topic: 'Formula and mass', lessonId: 'cf-l8', competency: 'analysis', marks: 2, prompt: 'Two steps.', question: num('fa9-10q', 'Write the formula of the compound of Ca²⁺ and OH⁻ and find its formula unit mass. (Ca 40, O 16, H 1) Give the mass in u.', 74, 'Ca(OH)₂ = 40 + 2 × 17 = 74 u.', { unit: 'u', rules: [[[57], 'Two OH groups are needed: Ca(OH)₂.']] }), solution: ['Criss-cross: Ca(OH)₂.', '40 + 2 × (16 + 1) = 74 u.'] },
      ],
    },
  ],
};
