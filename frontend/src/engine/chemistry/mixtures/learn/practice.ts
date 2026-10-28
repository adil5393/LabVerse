/**
 * Chapter 5 (Mixtures) chapter practice bank and chapter assessment. Original questions across Lessons 1 to 9, grouped by unit,
 * with difficulty and marks. Numeric answers are checked against `../model.ts` by `__tests__/mixtures.test.ts`. Practice is
 * saved as chapter practice and never changes lesson mastery; assessment feedback appears only after submission.
 */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const MIX_PRACTICE: PracticeSet = {
  id: 'mixtures-practice', title: 'Mixtures chapter practice',
  groups: [
    {
      id: 'g-kinds', title: 'Kinds of mixture and concentration', blurb: 'Homogeneous or heterogeneous, and the three percentages (Lessons 1 and 2).',
      items: [
        item('mp-1', 'Classify', 'Sort the mixtures.', choose('mp-1q', 'Which list is correctly sorted (Hm = homogeneous, Ht = heterogeneous)?', [['Muddy water Ht, milk Ht, brass Hm', null], ['Air Hm, smoke Hm', 'Smoke is solid particles in air: heterogeneous.'], ['Vinegar Ht, fog Hm', 'Vinegar is a solution (Hm) and fog is droplets in air (Ht).']], 'Check each item.'), ['Look for visible parts or uniformity.'], ['Muddy water and milk are heterogeneous; brass is a uniform alloy.'], 'basic'),
        item('mp-2', 'Mass by mass', 'Sugar solutions.', num('mp-2q', 'A student dissolves 30 g of sugar in 80 g of water. What is the % m/m, to one decimal place?', 27.3, '30 ÷ 110 × 100 ≈ 27.3 %.', { unit: '%', tolerance: 0.06, rules: [[[37.5], 'That divides by the water only; divide by the whole solution, 110 g.']] }), ['Solution = 30 + 80.'], ['30 ÷ 110 × 100 ≈ 27.3 %.'], 'standard', 2),
        item('mp-3', 'Mass by mass', 'Cake mix.', num('mp-3q', 'A dry cake mix has 75 g of sugar, 420 g of flour and 5 g of baking soda. What is the % m/m of sugar?', 15, '75 ÷ 500 × 100 = 15 %.', { unit: '%' }), ['Total = 75 + 420 + 5.'], ['Total 500 g; 75 ÷ 500 × 100 = 15 %.'], 'standard', 2),
        item('mp-4', 'Backwards', 'Talc.', num('mp-4q', 'A talcum powder is 4 % m/m zinc oxide. How much zinc oxide is in 300 g of it, in grams?', 12, '4 × 300 ÷ 100 = 12 g.', { unit: 'g' }), ['% × mass ÷ 100.'], ['4 × 300 ÷ 100 = 12 g.'], 'basic'),
        item('mp-5', 'Mass by volume', 'Saline.', num('mp-5q', 'How many grams of salt are needed for 2 litres (2000 mL) of 0.9 % m/v saline?', 18, '0.9 × 2000 ÷ 100 = 18 g.', { unit: 'g', rules: [[[1.8], 'Check the place value: 0.9 × 2000 = 1800, ÷ 100 = 18.']] }), ['Per 100 mL, then scale.'], ['0.9 g per 100 mL × 20 = 18 g.'], 'standard', 2),
      ],
    },
    {
      id: 'g-solubility', title: 'Solubility and crystallization', blurb: 'Reading solubility data and calculating crystals (Lessons 3 and 4).',
      items: [
        item('mp-6', 'Solubility', 'Saturating 50 g.', num('mp-6q', 'Potassium nitrate dissolves 62 g per 100 g of water at 40 °C. What mass saturates 50 g of water at 40 °C, in grams?', 31, '62 ÷ 2 = 31 g.', { unit: 'g' }), ['Half the water, half the solute.'], ['31 g.'], 'basic'),
        item('mp-7', 'Crystals', 'Cooling potassium chloride.', choose('mp-7q', 'A saturated potassium chloride solution at 80 °C cools to room temperature (25 °C). What is seen?', [['Crystals form, because less can stay dissolved when cool', null], ['Nothing, because solubility does not change with temperature', 'Potassium chloride drops from 54 g to about 36 g per 100 g of water.'], ['The solution boils', 'It is cooling, not heating.']], 'Lower solubility when cool.'), ['Compare 80 °C and 25 °C values.'], ['About 54 − 36 = 18 g per 100 g of water crystallizes.'], 'standard', 2),
        item('mp-8', 'Crystals', 'Mass deposited.', num('mp-8q', 'Potassium nitrate: 106 g per 100 g of water at 60 °C and 45 g at 30 °C. How much crystallizes from a saturated solution in 100 g of water cooled from 60 °C to 30 °C, in grams?', 61, '106 − 45 = 61 g.', { unit: 'g' }), ['Hot − cold.'], ['61 g.'], 'standard', 2),
        item('mp-9', 'Temperature', 'Gas solubility.', choose('mp-9q', 'Warm water from a factory flows into a river. Why can this harm fish?', [['Warm water holds less dissolved oxygen', null], ['Warm water holds more dissolved oxygen', 'Gases are less soluble in warmer water.']], 'Gases dissolve less when warm.'), ['Gases and temperature.'], ['Less oxygen dissolves in warmer water.'], 'basic'),
      ],
    },
    {
      id: 'g-separate', title: 'Separation methods', blurb: 'Distillation, chromatography, funnels, sublimation, centrifugation, coagulation (Lessons 5 to 8).',
      items: [
        item('mp-10', 'Choose a method', 'Two miscible liquids.', choose('mp-10q', 'Liquids A (60 °C) and B (90 °C) are miscible. How are they separated?', [['Simple distillation', null], ['Fractional distillation', 'The 30 °C gap is large enough for simple distillation.'], ['Separating funnel', 'Miscible liquids do not form layers.']], 'Gap ≥ 25 °C.'), ['Find the gap.'], ['30 °C gap: simple distillation; A distils first.'], 'standard', 2),
        item('mp-11', 'Choose a method', 'Chalk and salt.', choose('mp-11q', 'How would you separate chalk powder from common salt?', [['Add water, filter off the chalk, evaporate the filtrate to get salt', null], ['Use a magnet', 'Neither substance is magnetic.'], ['Sublimation', 'Neither sublimes.']], 'Use solubility.'), ['Which one dissolves?'], ['Salt dissolves, chalk does not.'], 'standard', 2),
        item('mp-12', 'Choose a method', 'Pigments.', choose('mp-12q', 'How would you find how many pigments a flower petal contains?', [['Paper chromatography', null], ['Centrifugation', 'Spinning separates by density, not by colour components.'], ['Distillation', 'Pigments are not separated by boiling point here.']], 'Chromatography.'), ['Coloured components.'], ['Run a chromatogram with a suitable solvent.'], 'basic'),
        item('mp-13', 'Order', 'Sand, salt and naphthalene.', choose('mp-13q', 'Which order separates a mixture of sand, salt and naphthalene?', [['Sublimation, then dissolve and filter, then evaporate', null], ['Evaporate, then sublime, then filter', 'Nothing can evaporate before water is added.'], ['Filter first, then sublime', 'The dry mixture cannot be filtered.']], 'Remove the sublimable solid first.'), ['Which step uses the dry mixture?'], ['Sublime off naphthalene, dissolve the salt and filter off sand, evaporate the filtrate.'], 'challenge', 3),
        item('mp-14', 'Choose a method', 'Muddy water.', choose('mp-14q', 'Muddy water stays cloudy after filtering. What should be done?', [['Add alum to coagulate the fine particles, then let them settle', null], ['Distil it to get the mud', 'Distillation would give water but is slow and wasteful; coagulation clears the mud cheaply.']], 'Coagulation.'), ['A coagulant.'], ['Alum clumps the fine particles, which settle.'], 'standard', 2),
      ],
    },
    {
      id: 'g-colloids', title: 'Colloids and the Tyndall effect', blurb: 'Particle sizes and light scattering (Lesson 9).',
      items: [
        item('mp-15', 'Tyndall', 'Which scatter?', choose('mp-15q', 'Which pair shows the Tyndall effect?', [['Dusty air and starch in water', null], ['Copper sulfate solution and acetone in water', 'Both are true solutions: no scattering.'], ['Copper sulfate solution and starch in water', 'Copper sulfate solution does not scatter.']], 'Colloids and suspensions.'), ['Which are true solutions?'], ['Dust (suspension) and starch (colloid) scatter light.'], 'standard', 2),
        item('mp-16', 'Particle size', 'Size band.', choose('mp-16q', 'Which particle size fits a colloid?', [['500 nm', null], ['0.5 nm', 'Under 1 nm is a solution.'], ['5000 nm', 'Over 1000 nm is a suspension.']], '1 to 1000 nm.'), ['Recall the bands.'], ['500 nm lies between 1 and 1000 nm.'], 'basic'),
        item('mp-17', 'Phases', 'Blood.', choose('mp-17q', 'In blood, the dispersion medium is…', [['plasma', null], ['red blood cells', 'Cells are part of the dispersed phase.']], 'The medium surrounds the particles.'), ['What are the cells spread in?'], ['Cells are dispersed in plasma.'], 'basic'),
        item('mp-18', 'Properties', 'Settle?', choose('mp-18q', 'If blood behaved like a true suspension, what would happen in the body?', [['Its cells would settle out instead of staying spread through the blood', null], ['It would become a clear solution', 'A suspension has visible particles that settle; it does not become clear.']], 'Suspensions settle.'), ['What do suspensions do on standing?'], ['Cells would sink, so blood could not carry them evenly.'], 'challenge', 2),
      ],
    },
  ],
};

export const MIX_ASSESSMENT: ChapterAssessment = {
  id: 'mixtures-assessment-1',
  title: 'Mixtures and their Separation: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. Use the data each question gives. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'xa-1', topic: 'Homogeneous', lessonId: 'cm-l1', competency: 'knowledge', marks: 1, prompt: 'Classify.', question: choose('xa-1q', 'Which is a homogeneous mixture?', [['Vinegar', null], ['Sand in water', 'Sand is visible and settles.'], ['Oil and water', 'They form layers.']], 'A solution.'), solution: ['Vinegar is acetic acid dissolved in water: a solution.'] },
        { id: 'xa-2', topic: 'Sublimation', lessonId: 'cm-l7', competency: 'knowledge', marks: 1, prompt: 'Definition.', question: choose('xa-2q', 'Sublimation is a change from…', [['solid directly to vapour', null], ['liquid to vapour', 'That is evaporation or boiling.'], ['vapour to liquid', 'That is condensation.']], 'Solid to vapour.'), solution: ['Sublimation: solid → vapour without melting.'] },
        { id: 'xa-3', topic: 'Size bands', lessonId: 'cm-l9', competency: 'knowledge', marks: 1, prompt: 'Particle size.', question: choose('xa-3q', 'Which kind of mixture has particles larger than 1000 nm?', [['Suspension', null], ['Colloid', 'Colloid particles are 1 to 1000 nm.'], ['Solution', 'Solution particles are under 1 nm.']], 'Over 1000 nm.'), solution: ['Suspension particles exceed 1000 nm.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'xa-4', topic: '% m/m', lessonId: 'cm-l2', competency: 'application', marks: 2, prompt: 'Concentration.', question: num('xa-4q', '18 g of salt is dissolved in 162 g of water. What is the % m/m?', 10, '18 ÷ 180 × 100 = 10 %.', { unit: '%' }), solution: ['Solution = 180 g.', '18 ÷ 180 × 100 = 10 %.'] },
        { id: 'xa-5', topic: '% v/v', lessonId: 'cm-l2', competency: 'application', marks: 2, prompt: 'Pesticide spray.', question: num('xa-5q', 'How many mL of liquid pesticide make 5 litres (5000 mL) of a 1 % v/v spray?', 50, '1 × 5000 ÷ 100 = 50 mL.', { unit: 'mL' }), solution: ['1 mL in each 100 mL.', '5000 ÷ 100 = 50 mL.'] },
        { id: 'xa-6', topic: 'Crystallization', lessonId: 'cm-l4', competency: 'application', marks: 2, prompt: 'Crystals.', question: num('xa-6q', 'Ammonium chloride: 55 g per 100 g of water at 60 °C and 37 g at 20 °C. How much crystallizes when a saturated solution in 200 g of water cools from 60 °C to 20 °C, in grams?', 36, '(55 − 37) × 2 = 36 g.', { unit: 'g' }), solution: ['Per 100 g: 55 − 37 = 18 g.', '200 g of water: 36 g.'] },
        { id: 'xa-7', topic: 'Method', lessonId: 'cm-l5', competency: 'application', marks: 2, prompt: 'Choose a method.', question: choose('xa-7q', 'Acetone (56 °C) and alcohol (78 °C) are mixed. Which method separates them?', [['Fractional distillation', null], ['Simple distillation', 'The gap is 22 °C, less than about 25 °C.'], ['Separating funnel', 'They are miscible.']], 'Gap 22 °C.'), solution: ['Gap = 78 − 56 = 22 °C < 25 °C.', 'Fractional distillation.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'xa-8', topic: 'Tyndall', lessonId: 'cm-l9', competency: 'analysis', marks: 2, prompt: 'Telling mixtures apart.', question: choose('xa-8q', 'Two beakers both show a visible beam of light. One settles overnight; the other does not. What are they?', [['A suspension (settles) and a colloid (does not)', null], ['Two solutions', 'Solutions do not show a visible beam.'], ['A solution and a colloid', 'A solution would not scatter the beam.']], 'Scattering rules out solutions; settling separates the rest.'), solution: ['Both scatter: neither is a solution.', 'Settling identifies the suspension.'] },
        { id: 'xa-9', topic: 'Sequence', lessonId: 'cm-l8', competency: 'analysis', marks: 2, prompt: 'Water treatment.', question: choose('xa-9q', 'A water plant receives cloudy river water. Which sequence clears it?', [['Add a coagulant, let the clumps settle, then filter', null], ['Filter, then add a coagulant to the clean water', 'The coagulant must act before settling and filtering.'], ['Centrifuge the whole river', 'Not practical for large volumes; coagulation and sedimentation are used.']], 'Coagulate, settle, filter.'), solution: ['Coagulation makes fine particles clump.', 'Sedimentation lets them settle.', 'Filtration removes what remains.'] },
        { id: 'xa-10', topic: 'Solubility', lessonId: 'cm-l3', competency: 'analysis', marks: 2, prompt: 'Comparing salts.', question: choose('xa-10q', 'Why is crystallization by cooling poor for sodium chloride but good for potassium nitrate?', [['Sodium chloride’s solubility barely changes with temperature; potassium nitrate’s changes a lot', null], ['Sodium chloride does not dissolve in water', 'It dissolves well (about 36 g per 100 g).'], ['Potassium nitrate does not form crystals', 'It forms crystals readily.']], 'Compare the curves.'), solution: ['NaCl: 36 g to 37 g from 10 °C to 80 °C.', 'KNO₃: 21 g to 167 g.', 'Cooling releases solid only if solubility falls.'] },
      ],
    },
  ],
};
