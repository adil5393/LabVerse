/**
 * Chapter 5 (Exploring Mixtures and their Separation): prerequisites and units. Short optional refreshers that never block a
 * lesson. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { num, pick } from '../../../education/builders';

export const CMP_MIXTURE: Prerequisite = {
  id: 'cmp-mixture',
  title: 'Pure substances and mixtures; solute and solvent',
  why: 'The chapter sorts mixtures and separates them. You need to know what a mixture is, and the words solute, solvent and solution.',
  connection: 'Grade 6 and Grade 8 Curiosity: mixtures and solutions',
  refresher: [{
    id: 'cmp-mx-step', title: 'A mixture keeps its parts',
    paragraphs: [
      'A mixture is two or more substances mixed together without forming a new substance. Each part keeps its own properties, which is why mixtures can be separated by physical methods such as filtering, evaporating or using a magnet.',
      'When sugar dissolves in water, sugar is the solute (the substance that dissolves), water is the solvent (the substance it dissolves in), and the result is a solution.',
    ],
    misconception: { wrong: 'When sugar dissolves it disappears.', right: 'The sugar is still there, spread out as particles too small to see: the water tastes sweet.' },
  }],
  checks: [
    pick('cmp-mx-c1', 'In salt water, which is the solvent?', [['Water', null], ['Salt', 'Salt is the solute: it is the substance that dissolves.', 'solute-solvent-swap']], 'The solvent does the dissolving.', undefined, 'cmp-mx-step'),
  ],
};

export const CMP_PERCENT: Prerequisite = {
  id: 'cmp-percent',
  title: 'Percentages: a part out of 100',
  why: 'Concentration is expressed as a percentage. You need to turn "a part of a whole" into "a part out of 100" and back.',
  connection: 'Mathematics: percentages (Grade 7 and Grade 8)',
  refresher: [{
    id: 'cmp-pc-step', title: 'Part ÷ whole × 100',
    paragraphs: [
      'A percentage says how many parts out of 100. To find it, divide the part by the whole and multiply by 100: 15 out of 60 is 15 ÷ 60 × 100 = 25 %.',
      'Going back the other way: 25 % of 60 is 25 × 60 ÷ 100 = 15.',
    ],
  }],
  checks: [
    num('cmp-pc-c1', '12 g of a 48 g sample is sugar. What percentage of the sample is sugar?', 25, '12 ÷ 48 × 100 = 25 %.', { unit: '%', refresherId: 'cmp-pc-step' }),
  ],
};

export const CMP_GRAPH: Prerequisite = {
  id: 'cmp-graph',
  title: 'Reading a line graph',
  why: 'Solubility curves show how much solute dissolves at each temperature. You need to read a value off a line graph.',
  connection: 'Mathematics: reading graphs; Physics Chapter 4 graphs',
  refresher: [{
    id: 'cmp-gr-step', title: 'Up from the x-axis, across to the y-axis',
    paragraphs: [
      'To read a line graph at a given x value, go straight up from that value to the line, then straight across to the y-axis and read the number there.',
      'A line that climbs steeply means the y quantity changes a lot for a small change in x.',
    ],
  }],
  checks: [
    pick('cmp-gr-c1', 'On a graph, line P climbs steeply and line Q is almost flat. Which quantity changes more as x increases?', [['P', null], ['Q', 'A nearly flat line means the y value hardly changes.', 'flat-is-big']], 'Steeper means a bigger change.', undefined, 'cmp-gr-step'),
  ],
};

export const CMP_STATES: Prerequisite = {
  id: 'cmp-states',
  title: 'Melting, boiling, evaporation and condensation',
  why: 'Many separation methods use changes of state. You need to know what boiling point, evaporation and condensation mean.',
  connection: 'Grade 6 and Grade 7 Curiosity: changes of state (optional States of Matter laboratory: /chemistry/states-of-matter)',
  refresher: [{
    id: 'cmp-st-step', title: 'Changes of state',
    paragraphs: [
      'A liquid evaporates from its surface at any temperature, but boils (forms vapour throughout) at its boiling point. Cooling a vapour turns it back into a liquid: condensation.',
      'Different substances have different boiling points: water boils at 100 °C, acetone at about 56 °C.',
    ],
  }],
  checks: [
    pick('cmp-st-c1', 'What is condensation?', [['A vapour turning into a liquid on cooling', null], ['A liquid turning into a vapour', 'That is evaporation or boiling.', 'state-change-direction']], 'Vapour to liquid.', undefined, 'cmp-st-step'),
  ],
};

export const CM_PREREQUISITES: Prerequisite[] = [CMP_MIXTURE, CMP_PERCENT, CMP_GRAPH, CMP_STATES];

export const CM_UNITS: EduUnit[] = [
  {
    id: 'cm-unit-1', number: 1, title: 'Kinds of mixtures and their concentration',
    centralIdea: 'Mixtures are homogeneous or heterogeneous, and the amount of solute in a solution can be stated as a percentage.',
    connection: 'Builds on Grade 6 and 8 work on mixtures and solutions.',
    vocabulary: [{ term: 'homogeneous', meaning: 'the same composition throughout' }, { term: 'concentration', meaning: 'the amount of solute in a given amount of solvent or solution' }],
    discover: ['How to tell a homogeneous mixture from a heterogeneous one', 'How to express concentration as % m/m, % m/v and % v/v'],
    prerequisiteIds: ['cmp-mixture', 'cmp-percent'], lessonIds: ['cm-l1', 'cm-l2'],
  },
  {
    id: 'cm-unit-2', number: 2, title: 'Solubility and crystallization',
    centralIdea: 'How much solid dissolves depends on temperature, and cooling a hot saturated solution gives pure crystals.',
    connection: 'Uses concentration from Unit 1 and graph reading.',
    vocabulary: [{ term: 'solubility', meaning: 'the most solute that dissolves in 100 g of solvent at a given temperature' }, { term: 'crystal', meaning: 'a solid with its particles in a regular pattern' }],
    discover: ['How to read and use a solubility curve', 'Why slow cooling gives larger crystals'],
    prerequisiteIds: ['cmp-graph'], lessonIds: ['cm-l3', 'cm-l4'],
  },
  {
    id: 'cm-unit-3', number: 3, title: 'Separating homogeneous mixtures',
    centralIdea: 'Differences in boiling point or in how components travel on paper let us separate mixtures that look uniform.',
    connection: 'Uses boiling and condensation (changes of state).',
    vocabulary: [{ term: 'distillate', meaning: 'the pure liquid collected after condensing the vapour' }, { term: 'chromatography', meaning: 'separating components by how fast they travel with a solvent' }],
    discover: ['When to use simple or fractional distillation', 'How paper chromatography separates the dyes in an ink'],
    prerequisiteIds: ['cmp-states'], lessonIds: ['cm-l5', 'cm-l6'],
  },
  {
    id: 'cm-unit-4', number: 4, title: 'Separating heterogeneous mixtures',
    centralIdea: 'Density, sublimation and particle size let us separate mixtures whose parts do not mix evenly.',
    connection: 'Extends filtration and decantation from earlier grades.',
    vocabulary: [{ term: 'immiscible', meaning: 'liquids that do not mix and form layers' }, { term: 'sublimation', meaning: 'a solid turning directly into vapour' }],
    discover: ['How a separating funnel and sublimation work', 'How centrifugation and coagulation clear fine particles'],
    prerequisiteIds: ['cmp-mixture', 'cmp-states'], lessonIds: ['cm-l7', 'cm-l8'],
  },
  {
    id: 'cm-unit-5', number: 5, title: 'Colloids and the Tyndall effect',
    centralIdea: 'Solutions, colloids and suspensions differ in particle size, and only the larger particles scatter a beam of light.',
    connection: 'Brings together every kind of mixture in the chapter.',
    vocabulary: [{ term: 'colloid', meaning: 'a mixture with particles 1 to 1000 nm across that do not settle' }, { term: 'Tyndall effect', meaning: 'scattering of light by particles, making the beam visible' }],
    discover: ['How particle size decides the properties of a mixture', 'Why a beam is visible in milk but not in salt water'],
    prerequisiteIds: ['cmp-mixture'], lessonIds: ['cm-l9'],
  },
];
