/**
 * Chapter 5, Units 1 and 2 (Lessons 1 to 4): kinds of mixtures, concentration, solubility and crystallization. Aligned to
 * NCERT Exploration (2026-27), Sections 5.1 to 5.3.1. Original wording and numbers; every numeric answer is checked against
 * `../model.ts` by `__tests__/mixtures.test.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, pick } from '../../../education/builders';

export const MIX_LAB = '/chemistry/mixtures/lab';
const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const M1: EduLesson = {
  id: 'cm-l1', unitId: 'cm-unit-1', number: 1, title: 'Homogeneous and heterogeneous mixtures',
  objective: 'tell a homogeneous mixture (a solution) from a heterogeneous one by whether its composition is the same throughout.',
  prerequisiteIds: ['cmp-mixture'],
  objectives: [
    { id: 'classify', label: 'Classify a mixture as homogeneous or heterogeneous' },
    { id: 'evidence', label: 'Use evidence (settling, visible particles, layers) to decide' },
  ],
  steps: [
    {
      id: 'cm1-uniform', title: 'The same in every sip', phase: 'observe',
      paragraphs: [
        'Stir sugar into water and taste it: the first sip and the last sip are equally sweet. The mixture has the same composition everywhere. Such a mixture is homogeneous, and a homogeneous mixture is also called a solution.',
        'Vinegar (acetic acid in water) and soda water (carbon dioxide in water) are other solutions. Air, a mixture of gases, is homogeneous too.',
      ],
      vocabulary: [{ term: 'homogeneous mixture', meaning: 'a mixture with the same composition throughout; a solution' }],
      check: pick('chk-cm1-uniform', 'Which of these is homogeneous?', [['Well-stirred sugar water', null], ['Sand stirred into water', 'The sand grains are visible and settle, so the composition is not the same everywhere.', 'stirred-is-uniform'], ['Oil shaken with water', 'Oil and water separate into layers.', 'stirred-is-uniform']], 'Sugar water is the same throughout.', undefined, 'cm1-uniform'),
    },
    {
      id: 'cm1-nonuniform', title: 'Mixtures that are not uniform', phase: 'reasoning',
      paragraphs: [
        'Stir sand into water: the grains stay visible and sink when you stop stirring. Oil and water form two layers. The composition differs from place to place, so these mixtures are heterogeneous.',
        'Evidence that a mixture is heterogeneous: you can see separate parts, the parts settle, or they form layers.',
      ],
      visual: v('mixBeam', { sampleId: 'chalk-water', beam: false, settle: true }, 'A beaker of chalk powder in water: the white particles are visible and slowly settle to the bottom.'),
      check: pick('chk-cm1-nonuniform', 'Which observation shows that a mixture is heterogeneous?', [['Particles settle at the bottom when it is left to stand', null], ['It tastes the same everywhere', 'That shows the mixture is uniform: homogeneous.', 'evidence-reversed'], ['It is colourless', 'Colour alone does not decide; many solutions are coloured and many are not.', 'colour-decides']], 'Settling shows the composition is not uniform.', undefined, 'cm1-nonuniform'),
    },
    {
      id: 'cm1-groups', title: 'Three beakers, three kinds', phase: 'conjecture',
      paragraphs: [
        'Imagine three beakers: salt in water, chalk powder in water, and a few drops of milk in water. Salt water is clear. Chalk water is cloudy and settles. Milk water looks uniform but slightly cloudy.',
        'Are these three the same kind of mixture? This chapter shows they are not: solution, suspension and colloid. Lessons 8 and 9 come back to these beakers.',
      ],
      visual: v('mixBeam', { sampleId: 'milk-water', beam: false, editable: true }, 'Choose salt water, chalk water or milk water and compare how each beaker looks.'),
      check: pick('chk-cm1-groups', 'Which beaker settles if left alone?', [['Chalk powder in water', null], ['Salt in water', 'Dissolved salt never settles out of a solution.', 'solution-settles'], ['Milk in water', 'Milk particles stay spread out; they do not settle in a few minutes.', 'colloid-settles']], 'Chalk is a suspension and settles.', undefined, 'cm1-groups'),
    },
  ],
  investigation: { title: 'Compare the beakers in the Mixtures Laboratory', description: 'Look at solutions, colloids and suspensions side by side.', href: `${MIX_LAB}?view=beam`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l1', title: 'Sorting four mixtures',
    given: ['Air', 'Muddy water', 'Brass (copper and zinc melted together)', 'Oil and water'],
    ask: 'Which are homogeneous and which heterogeneous?',
    steps: [
      { text: 'Air: homogeneous.', why: 'Gas particles spread evenly, so every sample of air has the same composition.' },
      { text: 'Muddy water: heterogeneous.', why: 'Mud particles are visible and settle.' },
      { text: 'Brass: homogeneous.', why: 'An alloy is a uniform mixture of metals; it looks and behaves the same throughout.' },
      { text: 'Oil and water: heterogeneous.', why: 'They form two separate layers.' },
    ],
    verify: 'Each heterogeneous one shows visible parts, settling or layers; the homogeneous ones show none.',
  },
  guided: {
    id: 'g-cm-l1', prompt: 'A student shakes sawdust with water and also dissolves a spoon of sugar in a second glass.',
    steps: [
      { id: 'g1', prompt: 'The sawdust glass.', question: pick('cm-g1-1', 'What kind of mixture is sawdust in water?', [['Heterogeneous', null], ['Homogeneous', 'Sawdust bits are visible and float or settle, so it is not uniform.', 'stirred-is-uniform']], 'Visible parts.', undefined, 'cm1-nonuniform'), hints: ['Can you see separate pieces?'] },
      { id: 'g2', prompt: 'The sugar glass.', question: pick('cm-g1-2', 'What kind of mixture is the sugar water?', [['Homogeneous: a solution', null], ['Heterogeneous', 'Dissolved sugar is spread evenly and cannot be seen.', 'solution-settles']], 'Uniform.', undefined, 'cm1-uniform'), hints: ['Is every sip equally sweet?'] },
    ],
    conclusion: 'Sawdust in water is heterogeneous; sugar water is a homogeneous solution.',
  },
  independent: [
    ind('i1', 'Classify', 'classify', 'Soda water.', pick('cm-l1-i1', 'Soda water (carbon dioxide dissolved in water) is…', [['homogeneous', null], ['heterogeneous', 'The dissolved gas is spread evenly; you see bubbles only when it comes out of solution.', 'gas-makes-heterogeneous']], 'A solution.'), ['Is the dissolved gas visible?'], ['Dissolved CO₂ is spread evenly: homogeneous.']),
    ind('i2', 'Classify', 'classify', 'Fog.', pick('cm-l1-i2', 'Fog (tiny water droplets in air) is…', [['heterogeneous', null], ['homogeneous', 'The droplets are separate bits of liquid in the air; fog is not uniform.', 'stirred-is-uniform']], 'Droplets in air.'), ['Are there separate droplets?'], ['Fog has liquid droplets dispersed in air: heterogeneous.']),
    ind('i3', 'Evidence', 'evidence', 'Layers.', pick('cm-l1-i3', 'Kerosene poured into water forms a layer on top. This shows the mixture is…', [['heterogeneous', null], ['a solution', 'A solution never separates into layers.', 'evidence-reversed']], 'Layers mean heterogeneous.'), ['What do layers tell you?'], ['Two layers: not uniform, heterogeneous.']),
    ind('i4', 'Evidence', 'evidence', 'A uniform metal.', pick('cm-l1-i4', 'Bronze looks the same everywhere and cannot be separated by filtering or a magnet. It is…', [['a homogeneous mixture (an alloy)', null], ['a pure element', 'Bronze is copper and tin mixed; it is a mixture, not an element.', 'alloy-is-element'], ['heterogeneous', 'Its composition is uniform throughout.', 'evidence-reversed']], 'An alloy.'), ['Is bronze made of one substance?'], ['Bronze is about 80 % copper and 20 % tin, mixed uniformly.']),
  ],
  reflection: {
    discover: 'A homogeneous mixture (solution) is uniform throughout; a heterogeneous mixture shows visible parts, layers or settling.',
    evidence: 'You sorted everyday mixtures using what you can observe.',
    stillConfusing: [
      { text: 'What makes a mixture homogeneous?', refresherId: 'cm1-uniform' },
      { text: 'What evidence shows a heterogeneous mixture?', refresherId: 'cm1-nonuniform' },
    ],
  },
};

export const M2: EduLesson = {
  id: 'cm-l2', unitId: 'cm-unit-1', number: 2, title: 'Concentration: % m/m, % m/v and % v/v',
  objective: 'calculate and use the concentration of a solution as mass by mass, mass by volume or volume by volume percentage, and choose the right one.',
  prerequisiteIds: ['cmp-percent'],
  objectives: [
    { id: 'mm', label: 'Calculate mass by mass percentage' },
    { id: 'mv-vv', label: 'Calculate mass by volume and volume by volume percentage' },
    { id: 'choose', label: 'Choose the suitable way and work backwards to a mass or volume' },
  ],
  steps: [
    {
      id: 'cm2-why', title: 'Why the right proportion matters', phase: 'observe',
      paragraphs: [
        'Oral Rehydration Solution (ORS) works only with the right amounts of salt and sugar in a fixed amount of water. A crop spray with too little pesticide does not protect the crop; too much harms the crop, the soil and the environment.',
        'The amount of solute in a given amount of solvent or solution is the concentration of the solution.',
      ],
      vocabulary: [{ term: 'concentration', meaning: 'the amount of solute in a given amount of solvent or solution' }],
      check: pick('chk-cm2-why', 'Why must ORS be made to an exact recipe?', [['Its effect depends on the right concentration of salt and sugar', null], ['Any sweet drink works as ORS', 'Not every sugary drink is ORS; the proportions matter.', 'any-sweet-is-ors']], 'The proportion matters.', undefined, 'cm2-why'),
    },
    {
      id: 'cm2-mm', title: 'Mass by mass percentage', phase: 'reasoning',
      paragraphs: [
        '% m/m tells you how many grams of solute are in 100 g of solution: % m/m = mass of solute ÷ mass of solution × 100. The mass of the solution is solute + solvent.',
        'For 15 g of salt in 135 g of water: solution = 150 g, so % m/m = 15 ÷ 150 × 100 = 10 %. It is used for solutions and also for mixtures such as milk powder and food labels.',
      ],
      visual: v('mixConcentration', { mode: 'm/m', solute: 15, other: 135 }, '15 g of salt in 135 g of water makes 150 g of solution, which is 10 % m/m.'),
      notice: 'The denominator is the whole solution, not just the water.',
      misconception: { wrong: 'Divide by the mass of water.', right: 'Divide by the mass of the whole solution (solute + solvent).' },
      check: pick('chk-cm2-mm', '20 g of sugar is dissolved in 80 g of water. What is the % m/m?', [['20 %', null], ['25 %', '20 ÷ 80 uses only the water. The solution is 100 g.', 'divide-by-solvent'], ['80 %', 'That is the share of water.', 'part-swap']], '20 ÷ 100 × 100 = 20 %.', undefined, 'cm2-mm'),
    },
    {
      id: 'cm2-mv', title: 'Mass by volume and volume by volume', phase: 'reasoning',
      paragraphs: [
        '% m/v = mass of solute (g) ÷ volume of solution (mL) × 100. It is used when a liquid is easier to measure by volume, as in medicines: a hospital saline drip is 0.9 % m/v, 0.9 g of salt in every 100 mL.',
        '% v/v = volume of solute ÷ volume of solution × 100, used when two liquids are mixed, as in vinegar (about 5 % v/v acetic acid) or perfumes.',
      ],
      visual: v('mixConcentration', { mode: 'v/v', solute: 30, other: 150, editable: true }, '30 mL of juice concentrate made up to 150 mL of drink is 20 % v/v. Change the amounts to see the percentage change.'),
      check: pick('chk-cm2-mv', 'Which is best for a solution of one liquid in another?', [['% v/v', null], ['% m/m', 'Possible, but for two liquids the volumes are what you measure.', 'wrong-kind'], ['% m/v', 'That is for a solid measured by mass in a liquid measured by volume.', 'wrong-kind']], 'Two liquids: % v/v.', undefined, 'cm2-mv'),
    },
    {
      id: 'cm2-back', title: 'Working backwards', phase: 'apply',
      paragraphs: [
        'If you know the percentage, you can find the amount: mass of component = percentage × mass of sample ÷ 100. A 300 g tin of talc that is 4 % m/m zinc oxide holds 4 × 300 ÷ 100 = 12 g of zinc oxide.',
        'To make a diluted solution, find the amount of solute first, then make up to the final total with solvent.',
      ],
      check: pick('chk-cm2-back', 'How much salt is in 500 mL of 0.9 % m/v saline?', [['4.5 g', null], ['0.9 g', 'That is the salt in 100 mL; 500 mL holds five times as much.', 'forgot-scale'], ['45 g', 'Check the arithmetic: 0.9 × 500 ÷ 100.', 'decimal-slip']], '0.9 × 500 ÷ 100 = 4.5 g.', undefined, 'cm2-back'),
    },
  ],
  investigation: { title: 'Mix solutions in the Mixtures Laboratory', description: 'Change the solute and solvent and watch each percentage update.', href: `${MIX_LAB}?view=concentration`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l2', title: 'Three percentages',
    given: ['A: 12 g of salt in 108 g of water.', 'B: 4 g of glucose made up to 80 mL of solution.', 'C: 6 mL of alcohol made up to 120 mL of solution.'],
    ask: 'Find the concentration of each, in the suitable form.',
    steps: [
      { text: 'A: solution = 12 + 108 = 120 g; % m/m = 12 ÷ 120 × 100 = 10 %.', why: 'Solid and solvent both weighed: mass by mass, over the whole solution.' },
      { text: 'B: % m/v = 4 ÷ 80 × 100 = 5 %.', why: 'Solid by mass in a solution measured by volume.' },
      { text: 'C: % v/v = 6 ÷ 120 × 100 = 5 %.', why: 'A liquid in a liquid: volume by volume.' },
    ],
    verify: 'A: 10 % of 120 g is 12 g, the salt given.',
  },
  guided: {
    id: 'g-cm-l2', prompt: 'A brass sample of 120 g is 70 % copper by mass; the rest is zinc.',
    steps: [
      { id: 'g1', prompt: 'Copper.', question: num('cm-g2-1', 'What mass of copper is in the sample, in grams?', 84, '70 × 120 ÷ 100 = 84 g.', { unit: 'g', rules: [[[70], 'That is the percentage, not the mass. Multiply by the sample mass and divide by 100.', 'percent-as-mass']] }), hints: ['mass = % × sample ÷ 100.'] },
      { id: 'g2', prompt: 'Zinc.', question: num('cm-g2-2', 'What mass of zinc is in the sample, in grams?', 36, '120 − 84 = 36 g.', { unit: 'g', rules: [[[30], 'That is the zinc percentage (30 %). Find the mass: 30 % of 120 g.', 'percent-as-mass']] }), hints: ['The rest of the 120 g.'] },
    ],
    conclusion: 'The 120 g of brass holds 84 g of copper and 36 g of zinc.',
  },
  independent: [
    ind('i1', 'Mass by mass', 'mm', 'Salt solution.', num('cm-l2-i1', '25 g of salt is dissolved in 225 g of water. What is the % m/m of the solution?', 10, '25 ÷ 250 × 100 = 10 %.', { unit: '%', rules: [[[11.11, 11.1, 11.11111], 'You divided by the water only. Divide by the whole solution, 250 g.', 'divide-by-solvent']] }), ['Solution = solute + solvent.'], ['25 + 225 = 250 g.', '25 ÷ 250 × 100 = 10 %.']),
    ind('i2', 'Mass by volume', 'mv-vv', 'Glucose drip.', num('cm-l2-i2', 'A doctor prepares 250 mL of a glucose solution containing 12.5 g of glucose. What is its % m/v?', 5, '12.5 ÷ 250 × 100 = 5 %.', { unit: '%' }), ['% m/v = g ÷ mL × 100.'], ['12.5 ÷ 250 × 100 = 5 %.']),
    ind('i3', 'Volume by volume', 'mv-vv', 'Juice.', num('cm-l2-i3', 'Two tablespoons (15 mL each) of juice concentrate are made up to 150 mL of drink. What is the % v/v of concentrate?', 20, '30 ÷ 150 × 100 = 20 %.', { unit: '%', rules: [[[10], 'Use both tablespoons: 30 mL.', 'one-spoon']] }), ['Total concentrate = 2 × 15 mL.'], ['30 ÷ 150 × 100 = 20 %.']),
    ind('i4', 'Backwards', 'choose', 'Vinegar.', num('cm-l2-i4', 'How many mL of pure acetic acid are needed to make 400 mL of 5 % v/v vinegar?', 20, '5 × 400 ÷ 100 = 20 mL, then water is added up to 400 mL.', { unit: 'mL' }), ['volume = % × total ÷ 100.'], ['5 × 400 ÷ 100 = 20 mL of acid, made up to 400 mL with water.']),
    ind('i5', 'Choose', 'choose', 'Which form?', pick('cm-l2-i5', 'A medicine label gives grams of drug in every 100 mL of syrup. Which concentration is that?', [['% m/v', null], ['% v/v', 'The drug is given in grams, a mass.', 'wrong-kind'], ['% m/m', 'The syrup is measured in mL, a volume.', 'wrong-kind']], 'Grams per 100 mL.'), ['Mass of solute, volume of solution.'], ['Grams per 100 mL is mass by volume.']),
  ],
  reflection: {
    discover: 'Concentration = amount of solute ÷ amount of solution × 100, as % m/m, % m/v or % v/v, and can be used backwards to find an amount.',
    evidence: 'You calculated each kind and found masses from percentages.',
    stillConfusing: [
      { text: 'Why divide by the whole solution?', refresherId: 'cm2-mm' },
      { text: 'Which percentage should I use?', refresherId: 'cm2-mv' },
      { text: 'How do I find a mass from a percentage?', refresherId: 'cm2-back' },
    ],
  },
};

export const M3: EduLesson = {
  id: 'cm-l3', unitId: 'cm-unit-2', number: 3, title: 'Solubility and solubility curves',
  objective: 'define solubility and a saturated solution, read a solubility curve or table, and describe how temperature changes the solubility of solids and gases.',
  prerequisiteIds: ['cmp-graph'],
  objectives: [
    { id: 'define', label: 'Define solubility and a saturated solution' },
    { id: 'read', label: 'Read and use a solubility curve or table' },
    { id: 'temperature', label: 'Describe the effect of temperature on solubility' },
  ],
  steps: [
    {
      id: 'cm3-define', title: 'How much can dissolve?', phase: 'observe',
      paragraphs: [
        'Keep adding salt to water and stirring: at some point no more dissolves and the extra stays at the bottom. The solution is then saturated at that temperature.',
        'The solubility of a substance is the largest mass that dissolves in 100 g (or 100 mL) of the solvent at a given temperature.',
      ],
      vocabulary: [{ term: 'saturated solution', meaning: 'a solution that can dissolve no more solute at that temperature' }],
      check: pick('chk-cm3-define', 'Solid stays at the bottom of a beaker even after long stirring. The solution is…', [['saturated', null], ['unsaturated', 'An unsaturated solution would dissolve more solid.', 'saturation-reversed']], 'No more dissolves: saturated.', undefined, 'cm3-define'),
    },
    {
      id: 'cm3-curve', title: 'Reading a solubility curve', phase: 'reasoning',
      paragraphs: [
        'A solubility curve plots solubility (g per 100 g of water) against temperature. Go up from a temperature to the curve and across to read the solubility.',
        'Data for four salts show the pattern: potassium nitrate rises from 21 g at 10 °C to 167 g at 80 °C, while sodium chloride barely changes (36 g to 37 g).',
      ],
      visual: v('mixSolubility', { saltIds: ['kno3', 'nacl', 'kcl', 'nh4cl'], temp: 40, editable: true }, 'Solubility curves of potassium nitrate, sodium chloride, potassium chloride and ammonium chloride from 10 °C to 80 °C. Move the temperature marker to read each one.'),
      notice: 'The steepest curve belongs to the salt whose solubility changes most with temperature.',
      check: pick('chk-cm3-curve', 'Whose solubility increases most between 10 °C and 80 °C?', [['Potassium nitrate', null], ['Sodium chloride', 'Its curve is almost flat: 36 g to 37 g.', 'flat-is-big'], ['Potassium chloride', 'It rises from 35 g to 54 g, much less than potassium nitrate.', 'misread-curve']], 'Potassium nitrate: 21 g to 167 g.', undefined, 'cm3-curve'),
    },
    {
      id: 'cm3-temp', title: 'Temperature, solids and gases', phase: 'reasoning',
      paragraphs: [
        'The solubility of most solids in water increases as the temperature rises. Gases are different: their solubility in water generally decreases as the water gets warmer.',
        'That is why fish in a warm pond can struggle for oxygen, and why a warm bottle of soda goes flat faster.',
      ],
      check: pick('chk-cm3-temp', 'What happens to the amount of oxygen water can hold when the water warms up?', [['It decreases', null], ['It increases, like a solid', 'Gases behave the other way: warmer water holds less dissolved gas.', 'gas-like-solid']], 'Gases dissolve less in warm water.', undefined, 'cm3-temp'),
    },
    {
      id: 'cm3-scale', title: 'Scaling to other amounts of water', phase: 'apply',
      paragraphs: [
        'A solubility is for 100 g of water. For a different amount, scale in proportion: in 50 g of water, half as much dissolves.',
        'Potassium nitrate at 40 °C: 62 g per 100 g, so 31 g in 50 g of water saturates it.',
      ],
      check: pick('chk-cm3-scale', 'Ammonium chloride dissolves 55 g per 100 g of water at 60 °C. How much saturates 200 g of water at 60 °C?', [['110 g', null], ['55 g', 'That is for 100 g of water; 200 g holds twice as much.', 'forgot-scale'], ['27.5 g', 'You halved instead of doubling.', 'scale-direction']], '55 × 2 = 110 g.', undefined, 'cm3-scale'),
    },
  ],
  investigation: { title: 'Use the solubility curves in the Mixtures Laboratory', description: 'Read solubilities and see when a solution becomes saturated.', href: `${MIX_LAB}?view=solubility`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l3', title: 'Is it saturated?',
    given: ['Potassium chloride: 40 g per 100 g of water at 40 °C.', 'A student adds 25 g of potassium chloride to 50 g of water at 40 °C.'],
    ask: 'Does all of it dissolve?',
    steps: [
      { text: 'Saturated amount in 50 g of water = 40 × 50 ÷ 100 = 20 g.', why: 'Solubility is per 100 g of water, so scale to 50 g.' },
      { text: '25 g is more than 20 g, so 5 g stays undissolved.', why: 'Only the saturated amount can dissolve at that temperature.' },
    ],
    verify: '20 g dissolved + 5 g left = 25 g added.',
  },
  guided: {
    id: 'g-cm-l3', prompt: 'Potassium nitrate dissolves 62 g per 100 g of water at 40 °C.',
    steps: [
      { id: 'g1', prompt: 'Saturate 50 g of water.', question: num('cm-g3-1', 'What mass of potassium nitrate saturates 50 g of water at 40 °C, in grams?', 31, '62 × 50 ÷ 100 = 31 g.', { unit: 'g', rules: [[[62], 'That is for 100 g of water; scale to 50 g.', 'forgot-scale']] }), hints: ['Scale from 100 g to 50 g.'] },
      { id: 'g2', prompt: 'A warmer solution.', question: pick('cm-g3-2', 'If the water is warmed to 60 °C, the solubility of potassium nitrate…', [['increases (to 106 g per 100 g)', null], ['decreases', 'For this solid, solubility rises with temperature.', 'gas-like-solid']], 'It rises.', undefined, 'cm3-temp'), hints: ['Read the table at 60 °C.'] },
    ],
    conclusion: '31 g saturates 50 g of water at 40 °C, and more dissolves when it is warmer.',
  },
  independent: [
    ind('i1', 'Definition', 'define', 'Solubility.', pick('cm-l3-i1', 'Solubility is the…', [['largest mass of solute that dissolves in 100 g of solvent at a given temperature', null], ['speed at which a solute dissolves', 'How fast it dissolves is a different idea from how much dissolves.', 'rate-vs-amount']], 'Maximum amount.'), ['How much, not how fast.'], ['The maximum amount in 100 g of solvent at that temperature.']),
    ind('i2', 'Reading data', 'read', 'Sodium chloride.', num('cm-l3-i2', 'Sodium chloride dissolves 36.5 g per 100 g of water at 40 °C. How much saturates 300 g of water at 40 °C, in grams?', 109.5, '36.5 × 3 = 109.5 g.', { unit: 'g', tolerance: 0.05 }), ['Scale by 3.'], ['36.5 × 300 ÷ 100 = 109.5 g.']),
    ind('i3', 'Reading data', 'read', 'Compare.', pick('cm-l3-i3', 'At 20 °C, which dissolves more in 100 g of water: ammonium chloride (37 g) or potassium nitrate (32 g)?', [['Ammonium chloride', null], ['Potassium nitrate', '32 g is less than 37 g at 20 °C (it overtakes at higher temperatures).', 'misread-curve']], 'Compare the two values at 20 °C.'), ['Look only at 20 °C.'], ['37 g > 32 g.']),
    ind('i4', 'Temperature', 'temperature', 'Soda.', pick('cm-l3-i4', 'Why does an opened soda lose its fizz faster on a hot day?', [['Carbon dioxide is less soluble in warmer water', null], ['Heat makes carbon dioxide more soluble', 'For gases it is the other way round.', 'gas-like-solid']], 'Gases dissolve less when warm.'), ['Gases and temperature.'], ['Warm water holds less dissolved gas, so the gas escapes.']),
  ],
  reflection: {
    discover: 'Solubility is the most solute that dissolves in 100 g of solvent at a temperature; solids usually dissolve more when hot, gases less.',
    evidence: 'You read solubility data and scaled it to other amounts of water.',
    stillConfusing: [
      { text: 'What is a saturated solution?', refresherId: 'cm3-define' },
      { text: 'How do I read a solubility curve?', refresherId: 'cm3-curve' },
      { text: 'Why scale to the amount of water?', refresherId: 'cm3-scale' },
    ],
  },
};

export const M4: EduLesson = {
  id: 'cm-l4', unitId: 'cm-unit-2', number: 4, title: 'Crystallization',
  objective: 'explain how cooling a hot saturated solution gives pure crystals, calculate the mass deposited from solubility data, and compare crystallization with evaporation.',
  prerequisiteIds: ['cmp-graph'],
  objectives: [
    { id: 'process', label: 'Describe the steps of crystallization and why each is done' },
    { id: 'yield', label: 'Calculate the mass of crystals deposited on cooling' },
    { id: 'compare', label: 'Compare crystallization with evaporation' },
  ],
  steps: [
    {
      id: 'cm4-why', title: 'Cooling a saturated solution', phase: 'observe',
      paragraphs: [
        'A solution saturated when hot holds more solute than it can keep when cold. As it cools, the extra solute comes out of solution as a solid, often as crystals: solids whose particles are arranged in a regular pattern.',
        'Snowflakes, frost, rock salt and candy sugar (mishri) are all crystals.',
      ],
      vocabulary: [{ term: 'crystallization', meaning: 'forming crystals from a saturated solution' }],
      check: pick('chk-cm4-why', 'Why do crystals appear as a hot saturated solution cools?', [['The solubility falls, so the extra solute can no longer stay dissolved', null], ['The solvent turns into the solute', 'The solvent does not change into anything; the solute separates out.', 'solvent-changes']], 'Lower solubility when cold.', undefined, 'cm4-why'),
    },
    {
      id: 'cm4-yield', title: 'How much comes out?', phase: 'reasoning',
      paragraphs: [
        'Mass of crystals = mass dissolved when hot − mass that can stay dissolved when cold.',
        'Potassium nitrate in 100 g of water, cooled from 60 °C (106 g) to 20 °C (32 g): 106 − 32 = 74 g of crystals.',
      ],
      visual: v('mixSolubility', { saltIds: ['kno3'], hot: 60, cold: 20, water: 100, editable: true, cooling: true }, 'Potassium nitrate saturated in 100 g of water at 60 °C and cooled to 20 °C deposits 74 g of crystals.'),
      notice: 'The steeper the curve, the more crystals a given cooling gives.',
      check: pick('chk-cm4-yield', 'Why does cooling a sodium chloride solution give very few crystals?', [['Its solubility hardly changes with temperature', null], ['Salt does not form crystals', 'Salt forms crystals; there is just little extra to come out on cooling.', 'no-salt-crystals']], 'A flat curve.', undefined, 'cm4-yield'),
    },
    {
      id: 'cm4-steps', title: 'Making pure crystals', phase: 'reasoning',
      paragraphs: [
        'To purify copper sulfate: dissolve it in a little hot water until saturated; filter the hot solution to remove insoluble impurities; let the filtrate cool slowly, covered and undisturbed; filter off the crystals, rinse with a little cold water and dry them.',
        'Slow cooling gives the particles time to arrange, so the crystals are larger and better shaped. Soluble impurities, present in small amounts, stay in the solution. Copper sulfate is toxic: it is handled with gloves under supervision.',
      ],
      check: pick('chk-cm4-steps', 'Why is the hot solution filtered before cooling?', [['To remove insoluble impurities', null], ['To make the crystals form faster', 'Filtering removes solids that do not dissolve; it does not speed up crystal growth.', 'filter-purpose']], 'Remove insoluble impurities.', undefined, 'cm4-steps'),
    },
    {
      id: 'cm4-compare', title: 'Crystallization or evaporation?', phase: 'apply',
      paragraphs: [
        'Evaporating a solution to dryness also leaves the solid, but any dissolved impurities are left in it too, and some solids decompose on strong heating. Crystallization gives a purer product.',
        'Salt from seawater is obtained by letting the sun evaporate shallow pans of brine until it is saturated and crystals grow.',
      ],
      check: pick('chk-cm4-compare', 'Which method gives purer crystals from an impure sample?', [['Crystallization', null], ['Evaporating to dryness', 'Evaporation leaves dissolved impurities in the solid.', 'evaporation-purifies']], 'Crystallization.', undefined, 'cm4-compare'),
    },
  ],
  investigation: { title: 'Cool a solution in the Mixtures Laboratory', description: 'Choose a salt and temperatures and see how many grams crystallize.', href: `${MIX_LAB}?view=solubility`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l4', title: 'Crystals from potassium chloride',
    given: ['Potassium chloride: 54 g per 100 g of water at 80 °C and 35 g at 20 °C.', 'A saturated solution in 200 g of water at 80 °C is cooled to 20 °C.'],
    ask: 'What mass of crystals forms?',
    steps: [
      { text: 'Dissolved at 80 °C: 54 × 2 = 108 g.', why: '200 g of water holds twice the per-100 g value.' },
      { text: 'Can stay dissolved at 20 °C: 35 × 2 = 70 g.', why: 'Same scaling at the lower temperature.' },
      { text: 'Crystals = 108 − 70 = 38 g.', why: 'Whatever cannot stay dissolved comes out as solid.' },
    ],
    verify: '70 g dissolved + 38 g crystals = 108 g, the starting amount.',
  },
  guided: {
    id: 'g-cm-l4', prompt: 'Ammonium chloride: 66 g per 100 g of water at 80 °C, 37 g at 20 °C. A saturated solution in 100 g of water at 80 °C is cooled to 20 °C.',
    steps: [
      { id: 'g1', prompt: 'Crystals.', question: num('cm-g4-1', 'What mass of crystals forms, in grams?', 29, '66 − 37 = 29 g.', { unit: 'g', rules: [[[103], 'Subtract the two amounts; do not add them.', 'add-not-subtract']] }), hints: ['Hot amount − cold amount.'] },
      { id: 'g2', prompt: 'Slow or fast?', question: pick('cm-g4-2', 'To get large, well-shaped crystals, the solution should be cooled…', [['slowly and undisturbed', null], ['quickly in ice-cold water', 'Rapid cooling gives many small, poorly formed crystals.', 'fast-is-better']], 'Slowly.', undefined, 'cm4-steps'), hints: ['Particles need time to arrange.'] },
    ],
    conclusion: '29 g of ammonium chloride crystallizes, and slow cooling gives larger crystals.',
  },
  independent: [
    ind('i1', 'Yield', 'yield', 'Potassium nitrate.', num('cm-l4-i1', 'Potassium nitrate: 167 g per 100 g of water at 80 °C, 106 g at 60 °C. How much crystallizes when a saturated solution in 100 g of water is cooled from 80 °C to 60 °C, in grams?', 61, '167 − 106 = 61 g.', { unit: 'g' }), ['Hot − cold.'], ['167 − 106 = 61 g.']),
    ind('i2', 'Yield', 'yield', 'Which gives more?', pick('cm-l4-i2', 'Equal saturated solutions of potassium nitrate and sodium chloride are cooled from 80 °C to 20 °C. Which deposits more solid?', [['Potassium nitrate', null], ['Sodium chloride', 'Its solubility hardly changes (37 g to 36 g), so very little comes out.', 'flat-is-big']], 'The steeper curve.'), ['Compare the drops in solubility.'], ['KNO₃ drops by 135 g; NaCl by 1 g.']),
    ind('i3', 'Process', 'process', 'Rinsing.', pick('cm-l4-i3', 'Why are the crystals rinsed with cold water, not hot?', [['Hot water would dissolve more of the crystals', null], ['Cold water removes the crystal shape', 'Cold water keeps the crystals; hot water would dissolve them.', 'rinse-reason']], 'Solubility is lower when cold.'), ['Think about solubility and temperature.'], ['Cold water dissolves less of the crystals while washing off the remaining solution.']),
    ind('i4', 'Compare', 'compare', 'Rate of evaporation.', pick('cm-l4-i4', 'Common salt crystals form from brine that evaporates slowly or quickly. Which gives larger crystals?', [['Slow evaporation', null], ['Fast evaporation', 'Fast change gives many small crystals; slow change lets fewer, larger crystals grow.', 'fast-is-better']], 'Slow means larger.'), ['Time for particles to arrange.'], ['Slow evaporation gives larger crystals.']),
  ],
  reflection: {
    discover: 'Cooling a hot saturated solution deposits crystals equal to the drop in the dissolved amount; slow cooling gives larger, purer crystals.',
    evidence: 'You calculated crystal masses from solubility data and explained each step.',
    stillConfusing: [
      { text: 'How is the mass of crystals found?', refresherId: 'cm4-yield' },
      { text: 'Why filter hot and cool slowly?', refresherId: 'cm4-steps' },
      { text: 'Why not just evaporate?', refresherId: 'cm4-compare' },
    ],
  },
};
