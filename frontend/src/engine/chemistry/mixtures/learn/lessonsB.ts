/**
 * Chapter 5, Units 3 to 5 (Lessons 5 to 9): distillation, paper chromatography, immiscible liquids and sublimation,
 * suspensions (centrifugation and coagulation), colloids and the Tyndall effect. Aligned to NCERT Exploration (2026-27),
 * Sections 5.3.2 to 5.5. Original wording; method choices are checked against `../model.ts`.
 */

import type { EduLesson, VisualRef } from '../../../education/types';
import { ind, num, ord, pick } from '../../../education/builders';
import { MIX_LAB } from './lessonsA';

const v = (kind: string, props: Record<string, unknown>, alt: string): VisualRef => ({ kind, props, alt });

export const M5: EduLesson = {
  id: 'cm-l5', unitId: 'cm-unit-3', number: 5, title: 'Distillation and fractional distillation',
  objective: 'explain how distillation separates miscible liquids or recovers a solvent, and decide between simple and fractional distillation from the boiling points.',
  prerequisiteIds: ['cmp-states'],
  objectives: [
    { id: 'how', label: 'Explain how distillation works, part by part' },
    { id: 'choose', label: 'Choose simple or fractional distillation from the boiling-point gap' },
  ],
  steps: [
    {
      id: 'cm5-idea', title: 'Boil, then condense', phase: 'observe',
      paragraphs: [
        'Evaporating salt water gives the salt but loses the water. To keep the liquid, heat the mixture until the liquid with the lower boiling point turns to vapour, then cool the vapour so it condenses back into a liquid in another vessel. This is distillation; the collected liquid is the distillate.',
        'It separates two miscible liquids whose boiling points differ enough, and recovers a pure solvent from a solution of a solid.',
      ],
      vocabulary: [{ term: 'distillation', meaning: 'separating by boiling off a liquid and condensing its vapour' }],
      check: pick('chk-cm5-idea', 'What does distillation give that evaporation does not?', [['The solvent, collected as a pure liquid', null], ['The dissolved solid', 'Both methods leave the solid; only distillation also collects the liquid.', 'distillation-solid']], 'It recovers the liquid.', undefined, 'cm5-idea'),
    },
    {
      id: 'cm5-apparatus', title: 'The apparatus', phase: 'reasoning',
      paragraphs: [
        'The mixture is heated in a distillation flask. A thermometer at the side arm reads the temperature of the vapour leaving. The vapour passes through a condenser, a tube cooled by water flowing in at the bottom and out at the top, and drips into a receiving flask.',
        'For acetone (about 56 °C) and water (100 °C), the thermometer stays near 56 °C while acetone distils; the water stays in the flask.',
      ],
      visual: v('mixSeparation', { caseId: 'acetone-water' }, 'Distillation of acetone and water: acetone vapour rises at about 56 °C, condenses in the water-cooled condenser and collects in the conical flask, while water stays in the distillation flask.'),
      check: pick('chk-cm5-apparatus', 'What is the job of the condenser?', [['To cool the vapour back into a liquid', null], ['To heat the mixture', 'The burner heats the flask; the condenser cools.', 'condenser-heats'], ['To measure the boiling point', 'The thermometer does that.', 'part-swap']], 'It cools the vapour.', undefined, 'cm5-apparatus'),
    },
    {
      id: 'cm5-gap', title: 'Simple or fractional?', phase: 'apply',
      paragraphs: [
        'Simple distillation works when the boiling points differ by at least about 25 °C, so one liquid vaporises well before the other. When the gap is smaller, the vapours mix, and fractional distillation is used: a fractionating column lets the vapours condense and re-vaporise many times.',
        'Crude oil is separated this way in refineries into petroleum gas, petrol, kerosene, diesel, lubricating oil and bitumen. Traditional perfume makers in Kannauj use a distillation method (deg-bhapka) to capture fragrances.',
      ],
      visual: v('mixSeparation', { caseId: 'alcohol-benzene', editable: true }, 'Choose two liquids from the table of boiling points; the bench shows the gap and whether simple or fractional distillation is needed.'),
      check: pick('chk-cm5-gap', 'Alcohol (78 °C) and benzene (80 °C) are mixed. How should they be separated?', [['Fractional distillation: the gap is only 2 °C', null], ['Simple distillation', 'A 2 °C gap is far less than about 25 °C; the vapours would distil together.', 'any-gap-simple'], ['A separating funnel', 'They are miscible, so they do not form layers.', 'miscible-funnel']], 'Small gap: fractional.', undefined, 'cm5-gap'),
    },
  ],
  investigation: { title: 'Try the separation bench', description: 'Pick two liquids and see which kind of distillation separates them.', href: `${MIX_LAB}?view=separation`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l5', title: 'Two liquids, A and B',
    given: ['Liquid A boils at 60 °C and liquid B at 90 °C; they are miscible.'],
    ask: 'Which method separates them, and which liquid is collected first?',
    steps: [
      { text: 'Gap = 90 − 60 = 30 °C.', why: 'The choice depends on the difference in boiling points.' },
      { text: '30 °C ≥ 25 °C, so simple distillation works.', why: 'A large gap lets one liquid vaporise before the other.' },
      { text: 'A (60 °C) distils first and is collected; B stays in the flask.', why: 'The lower-boiling liquid vaporises first.' },
    ],
    verify: 'The thermometer would stay near 60 °C while A distils.',
  },
  guided: {
    id: 'g-cm-l5', prompt: 'Chloroform boils at 61 °C and acetone at 56 °C.',
    steps: [
      { id: 'g1', prompt: 'The gap.', question: num('cm-g5-1', 'What is the difference in their boiling points, in °C?', 5, '61 − 56 = 5 °C.', { unit: '°C' }), hints: ['Subtract.'] },
      { id: 'g2', prompt: 'The method.', question: pick('cm-g5-2', 'Which method should be used?', [['Fractional distillation', null], ['Simple distillation', '5 °C is much less than about 25 °C.', 'any-gap-simple']], 'Small gap.', undefined, 'cm5-gap'), hints: ['Compare with 25 °C.'] },
    ],
    conclusion: 'With only a 5 °C gap, fractional distillation is needed.',
  },
  independent: [
    ind('i1', 'Choose', 'choose', 'Water and acetone.', pick('cm-l5-i1', 'Why is simple distillation effective for water and acetone?', [['Their boiling points differ by 44 °C', null], ['They do not mix', 'They are miscible; a funnel would not work.', 'miscible-funnel']], '100 − 56 = 44 °C.'), ['Find the gap.'], ['44 °C ≥ 25 °C.']),
    ind('i2', 'Choose', 'choose', 'Alcohol and water.', pick('cm-l5-i2', 'Alcohol (78 °C) and water (100 °C): which method?', [['Simple distillation', 'The gap is 22 °C, less than about 25 °C, so the vapours would distil together.', 'any-gap-simple'], ['Fractional distillation', null]], 'Gap 22 °C < 25 °C.'), ['100 − 78.'], ['22 °C < 25 °C, so fractional distillation.']),
    ind('i3', 'How it works', 'how', 'Order the steps.', ord('cm-l5-i3', 'Put the stages of distillation in order.', [{ id: 'a', text: 'Heat the mixture in the flask', needs: [] }, { id: 'b', text: 'The lower-boiling liquid vaporises', needs: ['a'] }, { id: 'c', text: 'The vapour cools in the condenser', needs: ['b'] }, { id: 'd', text: 'The distillate collects in the receiver', needs: ['c'] }], ['c', 'a', 'd', 'b'], 'Heat, vaporise, condense, collect.'), ['Start with heating.'], ['Heat → vaporise → condense → collect.']),
    ind('i4', 'How it works', 'how', 'Water flow.', pick('cm-l5-i4', 'Cooling water enters the condenser at the bottom and leaves at the top. Why?', [['So the condenser stays full of cold water and cools best', null], ['So the water boils', 'The cooling water should stay cold; it is not meant to boil.', 'condenser-heats']], 'A full jacket cools best.'), ['Think about air pockets.'], ['Filling from the bottom keeps the jacket full of cold water.']),
  ],
  reflection: {
    discover: 'Distillation boils off the lower-boiling liquid and condenses it; a gap of at least about 25 °C allows simple distillation, otherwise fractional distillation is used.',
    evidence: 'You chose methods from boiling points and described the apparatus.',
    stillConfusing: [
      { text: 'What does each part of the apparatus do?', refresherId: 'cm5-apparatus' },
      { text: 'When is fractional distillation needed?', refresherId: 'cm5-gap' },
    ],
  },
};

export const M6: EduLesson = {
  id: 'cm-l6', unitId: 'cm-unit-3', number: 6, title: 'Paper chromatography',
  objective: 'set up and explain paper chromatography, and use it to tell how many coloured components a mixture has.',
  prerequisiteIds: ['cmp-mixture'],
  objectives: [
    { id: 'setup', label: 'Set up a chromatogram correctly' },
    { id: 'explain', label: 'Explain why the components separate' },
  ],
  steps: [
    {
      id: 'cm6-observe', title: 'An ink spot that spreads', phase: 'observe',
      paragraphs: [
        'A drop of water on a black sketch-pen line makes the colour run, sometimes into several colours. Black ink is often a mixture of dyes.',
        'Paper chromatography uses this. A pencil line is drawn about 2 cm above the bottom of a paper strip and a small ink spot is put on it. The strip is hung in a jar so that the water is below the spot.',
      ],
      vocabulary: [{ term: 'chromatography', meaning: '"writing with colour": separating components as a solvent carries them along paper' }],
      check: pick('chk-cm6-observe', 'Why is the start line drawn in pencil, not ink?', [['Pencil (graphite) does not dissolve and run with the solvent', null], ['Pencil is easier to see', 'The reason is that ink would itself separate and spoil the result.', 'pencil-reason']], 'Graphite does not run.', undefined, 'cm6-observe'),
    },
    {
      id: 'cm6-why', title: 'Why the dyes separate', phase: 'reasoning',
      paragraphs: [
        'As the water rises up the paper it carries the dyes with it. Each dye interacts differently with the paper and the solvent, so each travels at its own rate. After a while the dyes are spread out as separate spots.',
        'The number of spots shows how many components were in the ink. Water does not suit every mixture: plant pigments, for example, need alcohol or another solvent.',
      ],
      visual: v('mixChromatography', { front: 6, editable: true }, 'A paper strip with a black ink spot. As the solvent front rises, the ink separates into blue, red and yellow spots that travel different distances.'),
      notice: 'Each dye always travels the same fraction of the distance the solvent travels.',
      check: pick('chk-cm6-why', 'A spot of green food colour separates into a blue and a yellow spot. What does this show?', [['The colour is a mixture of at least two dyes', null], ['The water changed the colour into new substances', 'The dyes were already there; the paper only separated them.', 'chromatography-reaction']], 'Two spots, two components.', undefined, 'cm6-why'),
    },
    {
      id: 'cm6-setup', title: 'Getting it right', phase: 'apply',
      paragraphs: [
        'The solvent must start below the spot. If the spot is under the solvent, the dyes simply dissolve into the jar instead of travelling up the paper.',
        'Chromatography is used to check the dyes in food colours, separate leaf and flower pigments, and in medical and forensic tests.',
      ],
      check: pick('chk-cm6-setup', 'What goes wrong if the solvent level is above the ink spot?', [['The ink dissolves into the solvent instead of travelling up the paper', null], ['Nothing; it works faster', 'The spot would wash off into the jar.', 'solvent-above-spot']], 'Keep the spot above the solvent.', undefined, 'cm6-setup'),
    },
  ],
  investigation: { title: 'Run a chromatogram in the Mixtures Laboratory', description: 'Let the solvent rise and watch the ink separate.', href: `${MIX_LAB}?view=chromatography`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l6', title: 'Reading a chromatogram',
    given: ['Ink X gives three spots; ink Y gives one spot at the same height as the top spot of X.'],
    ask: 'What can you say about X and Y?',
    steps: [
      { text: 'X is a mixture of at least three dyes.', why: 'Each spot is a separate component.' },
      { text: 'Y is a single dye, probably the same as the top dye in X.', why: 'The same dye travels the same distance in the same conditions.' },
    ],
    verify: 'Running X and Y side by side on one strip would show the matching spot directly.',
  },
  guided: {
    id: 'g-cm-l6', prompt: 'A student wants to find the pigments in spinach leaves.',
    steps: [
      { id: 'g1', prompt: 'The solvent.', question: pick('cm-g6-1', 'Water does not move the green pigment. What should the student try?', [['A different solvent, such as alcohol', null], ['More water', 'If the pigment does not move in water, more water will not help.', 'more-solvent']], 'Change the solvent.', undefined, 'cm6-why'), hints: ['Not every mixture suits water.'] },
      { id: 'g2', prompt: 'The level.', question: pick('cm-g6-2', 'Where should the solvent level be at the start?', [['Below the pigment spot', null], ['Above the pigment spot', 'The pigment would dissolve into the jar.', 'solvent-above-spot']], 'Below the spot.', undefined, 'cm6-setup'), hints: ['Think what happens if the spot is under the liquid.'] },
    ],
    conclusion: 'Use a suitable solvent such as alcohol, with its level below the spot.',
  },
  independent: [
    ind('i1', 'Explain', 'explain', 'Why spots.', pick('cm-l6-i1', 'Why do the dyes in an ink end up at different heights?', [['They travel at different rates with the solvent', null], ['They are heavier or lighter, so they sink', 'The paper is vertical and the solvent carries them up; weight is not the reason.', 'weight-sorts']], 'Different rates.'), ['What carries them?'], ['Different interactions with the paper and solvent give different rates.']),
    ind('i2', 'Setup', 'setup', 'Start line.', pick('cm-l6-i2', 'Why is the spot kept small?', [['So the separated spots do not overlap', null], ['So the paper does not tear', 'A small spot keeps the separated components distinct.', 'spot-size']], 'Distinct spots.'), ['Big spots spread wide.'], ['Small spots give clear, separate bands.']),
    ind('i3', 'Explain', 'explain', 'Count.', num('cm-l6-i3', 'A purple ink separates into a blue, a red and a pink spot. How many components does it contain, at least?', 3, 'Three spots: at least three components.', {}), ['Count the spots.'], ['3.']),
  ],
  reflection: {
    discover: 'In paper chromatography the solvent carries each component up the paper at its own rate, so a mixture of dyes separates into spots.',
    evidence: 'You set up a chromatogram correctly and interpreted the spots.',
    stillConfusing: [
      { text: 'Why do the dyes separate?', refresherId: 'cm6-why' },
      { text: 'Where should the solvent level be?', refresherId: 'cm6-setup' },
    ],
  },
};

export const M7: EduLesson = {
  id: 'cm-l7', unitId: 'cm-unit-4', number: 7, title: 'Immiscible liquids, sublimation and alloys',
  objective: 'separate immiscible liquids with a separating funnel, separate a sublimable solid by sublimation, and explain why an alloy cannot be separated physically.',
  prerequisiteIds: ['cmp-states'],
  objectives: [
    { id: 'funnel', label: 'Use a separating funnel and explain the layers' },
    { id: 'sublime', label: 'Explain sublimation and deposition and use them to separate' },
    { id: 'alloy', label: 'Explain what an alloy is' },
  ],
  steps: [
    {
      id: 'cm7-funnel', title: 'Layers in a separating funnel', phase: 'observe',
      paragraphs: [
        'Oil and water do not mix: they are immiscible and form two layers. The less dense liquid floats on top. Mustard oil, less dense than water, forms the upper layer.',
        'In a separating funnel, open the stopcock to run off the lower layer, close it just before the boundary, discard the small mixed portion, then run off the upper layer into a separate container.',
      ],
      visual: v('mixSeparation', { caseId: 'oil-water' }, 'A separating funnel holding mustard oil above water. Opening the stopcock drains the lower water layer first.'),
      vocabulary: [{ term: 'immiscible', meaning: 'not mixing; forming separate layers' }],
      check: pick('chk-cm7-funnel', 'Which layer comes out first through the stopcock?', [['The lower, denser layer', null], ['The upper layer', 'The stopcock is at the bottom, so the lower layer drains first.', 'top-first']], 'The lower layer.', undefined, 'cm7-funnel'),
    },
    {
      id: 'cm7-sublime', title: 'Sublimation', phase: 'reasoning',
      paragraphs: [
        'Some solids, such as camphor, naphthalene and dry ice (solid carbon dioxide), change directly into vapour on heating without melting: sublimation. When the vapour cools it turns straight back into a solid: deposition.',
        'To separate camphor from sand, heat the mixture gently in a china dish under an inverted funnel plugged with cotton. Camphor vapour deposits as a white solid on the cool funnel walls; sand stays in the dish.',
      ],
      visual: v('mixSeparation', { caseId: 'camphor-sand' }, 'A china dish of camphor and sand heated under an inverted funnel. White camphor deposits on the inner wall of the funnel while sand stays behind.'),
      check: pick('chk-cm7-sublime', 'How is sublimation different from evaporation?', [['A solid turns directly into vapour, without becoming liquid', null], ['They are the same', 'Evaporation is a liquid becoming vapour; sublimation starts from a solid.', 'sublime-is-evaporate']], 'Solid straight to vapour.', undefined, 'cm7-sublime'),
    },
    {
      id: 'cm7-alloy', title: 'Mixtures of metals', phase: 'reasoning',
      paragraphs: [
        'Metals do not dissolve in each other at room temperature, but melted together they form a solution that sets into an alloy: a homogeneous mixture of metals, or of a metal and a non-metal.',
        'Brass is roughly 80 % copper and 20 % zinc; bronze roughly 80 % copper and 20 % tin; stainless steel is iron with chromium, nickel and a little carbon. Alloys are made stronger, harder or more resistant to rusting, and physical methods cannot separate them.',
      ],
      check: pick('chk-cm7-alloy', 'Brass is…', [['a homogeneous mixture of copper and zinc', null], ['a pure element', 'Brass contains two metals.', 'alloy-is-element'], ['a heterogeneous mixture', 'An alloy is uniform throughout.', 'evidence-reversed']], 'An alloy.', undefined, 'cm7-alloy'),
    },
  ],
  investigation: { title: 'Try the separating funnel and sublimation on the bench', description: 'Pick a mixture and see which method works and why.', href: `${MIX_LAB}?view=separation`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l7', title: 'Cooking oil and water',
    given: ['A cooking oil label says 1 litre has a mass of 910 g.', 'Water: 1 litre has a mass of about 1000 g.'],
    ask: 'Which layer is on top, and how are they separated?',
    steps: [
      { text: 'Oil density ≈ 910 g per litre, less than water’s 1000 g per litre.', why: 'Compare mass per litre.' },
      { text: 'The oil forms the upper layer.', why: 'The less dense liquid floats.' },
      { text: 'Separate in a separating funnel: run off the water, then the oil.', why: 'Immiscible liquids separate by layers.' },
    ],
    verify: 'Less dense on top: oil above water, as seen in the kitchen.',
  },
  guided: {
    id: 'g-cm-l7', prompt: 'A mixture contains naphthalene and sand.',
    steps: [
      { id: 'g1', prompt: 'Method.', question: pick('cm-g7-1', 'Which method separates them?', [['Sublimation', null], ['Filtration', 'Both are solids; neither passes through filter paper as a liquid.', 'filter-two-solids']], 'Naphthalene sublimes.', undefined, 'cm7-sublime'), hints: ['Which one sublimes?'] },
      { id: 'g2', prompt: 'Where it collects.', question: pick('cm-g7-2', 'Where is the naphthalene collected?', [['On the cool inner wall of the inverted funnel', null], ['In the china dish', 'Sand stays in the dish; naphthalene leaves as vapour.', 'part-swap']], 'On the funnel.', undefined, 'cm7-sublime'), hints: ['Vapour deposits on cool surfaces.'] },
    ],
    conclusion: 'Naphthalene sublimes and deposits on the funnel; sand stays behind.',
  },
  independent: [
    ind('i1', 'Funnel', 'funnel', 'Why layers.', pick('cm-l7-i1', 'Why do immiscible liquids form two layers?', [['They do not mix, and the less dense one floats on the denser one', null], ['The heavier liquid dissolves the lighter', 'If one dissolved the other, they would be miscible and form one layer.', 'miscible-funnel']], 'Density and immiscibility.'), ['Mixing and density.'], ['They do not mix; the less dense liquid rises.']),
    ind('i2', 'Sublimation', 'sublime', 'Example.', pick('cm-l7-i2', 'Which of these sublimes?', [['Dry ice (solid carbon dioxide)', null], ['Common salt', 'Salt melts at a very high temperature; it does not sublime.', 'salt-sublimes'], ['Sand', 'Sand does not sublime on heating.', 'salt-sublimes']], 'Dry ice.'), ['Think of a solid that "smokes".'], ['Dry ice turns directly into CO₂ gas.']),
    ind('i3', 'Alloy', 'alloy', 'Bronze.', num('cm-l7-i3', 'A 250 g bronze medal is 80 % copper by mass. What mass of tin is in it, in grams?', 50, '20 % of 250 g = 50 g.', { unit: 'g', rules: [[[200], 'That is the copper. The tin is the remaining 20 %.', 'part-swap']] }), ['Tin is 100 − 80 = 20 %.'], ['20 × 250 ÷ 100 = 50 g.']),
    ind('i4', 'Alloy', 'alloy', 'Separating.', pick('cm-l7-i4', 'Why can brass not be separated into copper and zinc by filtering or a magnet?', [['It is a homogeneous mixture of metals', null], ['Copper and zinc are the same element', 'They are different elements, mixed uniformly.', 'alloy-is-element']], 'An alloy.'), ['What kind of mixture?'], ['The metals are mixed uniformly; physical methods cannot separate them.']),
  ],
  reflection: {
    discover: 'Immiscible liquids separate by density in a separating funnel; a sublimable solid separates by sublimation and deposition; an alloy is homogeneous and cannot be separated physically.',
    evidence: 'You chose methods from properties and explained them.',
    stillConfusing: [
      { text: 'Which layer is on top?', refresherId: 'cm7-funnel' },
      { text: 'What is sublimation?', refresherId: 'cm7-sublime' },
      { text: 'What is an alloy?', refresherId: 'cm7-alloy' },
    ],
  },
};

export const M8: EduLesson = {
  id: 'cm-l8', unitId: 'cm-unit-4', number: 8, title: 'Suspensions: centrifugation and coagulation',
  objective: 'describe a suspension, and explain how centrifugation and coagulation separate fine particles that do not settle or filter out easily.',
  prerequisiteIds: ['cmp-mixture'],
  objectives: [
    { id: 'suspension', label: 'Describe a suspension' },
    { id: 'methods', label: 'Explain centrifugation and coagulation and when to use each' },
  ],
  steps: [
    {
      id: 'cm8-suspension', title: 'Suspensions', phase: 'observe',
      paragraphs: [
        'In a suspension, solid particles do not dissolve but are spread through the liquid. They are large enough to see (over 1000 nm), they settle when left alone, and filter paper holds them back. Sand, chalk, sawdust or tea leaves in water are suspensions.',
        'Muddy water left to stand loses its heavier particles, but often stays cloudy: the finest particles settle very slowly and can pass through cloth or filter paper.',
      ],
      vocabulary: [{ term: 'suspension', meaning: 'a heterogeneous mixture of visible solid particles in a liquid that settle on standing' }],
      check: pick('chk-cm8-suspension', 'Which is a property of a suspension?', [['Its particles settle when it is left undisturbed', null], ['It passes through filter paper unchanged', 'Suspension particles are big enough to be held back.', 'suspension-filters'], ['Its particles are invisible', 'Suspension particles are visible to the eye.', 'suspension-invisible']], 'They settle.', undefined, 'cm8-suspension'),
    },
    {
      id: 'cm8-centrifuge', title: 'Centrifugation', phase: 'reasoning',
      paragraphs: [
        'Spin with a partner holding crossed hands and you feel pulled outwards. In a centrifuge, tubes spin very fast and swing horizontal; the denser particles move outwards, to the bottom of each tube, and the lighter liquid stays on top.',
        'Blood is separated this way into plasma, a thin layer of white cells and platelets, and red cells at the bottom. A hand-spun paper centrifuge (paperfuge) does the same for blood tests in places without electricity.',
      ],
      visual: v('mixSeparation', { caseId: 'blood' }, 'A centrifuge tube of blood after spinning: yellow plasma on top, a thin pale layer of white cells and platelets, and red cells at the bottom.'),
      check: pick('chk-cm8-centrifuge', 'After centrifuging blood, where are the red blood cells?', [['At the bottom of the tube', null], ['On top', 'They are the densest part, so they move furthest outwards: to the bottom.', 'centrifuge-light-down']], 'Densest at the bottom.', undefined, 'cm8-centrifuge'),
    },
    {
      id: 'cm8-coagulate', title: 'Coagulation', phase: 'reasoning',
      paragraphs: [
        'Adding powdered alum (fitkari) to muddy water makes the fine particles clump together into larger lumps. This is coagulation, and alum is the coagulant. The lumps settle (sedimentation), and the clear water is poured off (decantation) or filtered.',
        'Making paneer is coagulation too: lemon juice or vinegar makes the milk proteins clump. Water treatment plants use sedimentation, coagulation and filtration.',
      ],
      visual: v('mixSeparation', { caseId: 'muddy-water', editable: true }, 'Cloudy water with alum added: fine particles clump, settle, and leave clear water above.'),
      check: pick('chk-cm8-coagulate', 'What does alum do to muddy water?', [['Makes the fine particles clump together so they settle', null], ['Dissolves the mud', 'The mud does not dissolve; it clumps and sinks.', 'coagulant-dissolves'], ['Kills germs only', 'Alum is used here to make particles clump.', 'coagulant-disinfects']], 'Clumping.', undefined, 'cm8-coagulate'),
    },
  ],
  investigation: { title: 'Compare methods on the separation bench', description: 'Try centrifugation and coagulation on different mixtures.', href: `${MIX_LAB}?view=separation`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l8', title: 'Cleaning cloudy water',
    given: ['Water from a pond stays cloudy after standing overnight and after filtering through cloth.'],
    ask: 'How can it be cleared?',
    steps: [
      { text: 'Add a little powdered alum and stir.', why: 'Alum coagulates the fine particles into larger lumps.' },
      { text: 'Leave it to stand.', why: 'The larger lumps settle quickly (sedimentation).' },
      { text: 'Decant or filter the clear water.', why: 'The settled lumps stay behind.' },
    ],
    verify: 'The water above is now clear; it still needs boiling or disinfecting before drinking.',
  },
  guided: {
    id: 'g-cm-l8', prompt: 'A laboratory needs plasma from a blood sample.',
    steps: [
      { id: 'g1', prompt: 'Method.', question: pick('cm-g8-1', 'Which method is used?', [['Centrifugation', null], ['Filtration', 'Blood cells are too small and fragile for filter paper to separate cleanly.', 'suspension-filters']], 'Spin it.', undefined, 'cm8-centrifuge'), hints: ['Fast spinning.'] },
      { id: 'g2', prompt: 'Where the plasma is.', question: pick('cm-g8-2', 'Where is the plasma after spinning?', [['The top layer', null], ['The bottom layer', 'The bottom holds the densest part: red cells.', 'centrifuge-light-down']], 'The lightest is on top.', undefined, 'cm8-centrifuge'), hints: ['Least dense part.'] },
    ],
    conclusion: 'Centrifuge the blood and collect the top layer, which is plasma.',
  },
  independent: [
    ind('i1', 'Suspension', 'suspension', 'Example.', pick('cm-l8-i1', 'Which is a suspension?', [['Chalk powder in water', null], ['Copper sulfate solution', 'That is a solution: particles are dissolved and invisible.', 'solution-is-suspension']], 'Visible and settles.'), ['Visible particles that settle.'], ['Chalk in water is a suspension.']),
    ind('i2', 'Methods', 'methods', 'Paneer.', pick('cm-l8-i2', 'Making paneer by adding lemon juice to hot milk is an example of…', [['coagulation', null], ['centrifugation', 'Nothing is spun; the acid makes proteins clump.', 'method-swap']], 'Acid as a coagulant.'), ['The lemon juice is the coagulant.'], ['Acid coagulates the milk proteins.']),
    ind('i3', 'Methods', 'methods', 'Why not filter?', pick('cm-l8-i3', 'Why might filtering muddy water through cloth leave it cloudy?', [['The finest particles are small enough to pass through', null], ['Cloth adds particles to water', 'The cloudiness is from mud particles that pass through.', 'cloth-adds']], 'Very fine particles.'), ['Size of the particles vs the holes.'], ['The finest particles slip through the cloth.']),
  ],
  reflection: {
    discover: 'Suspensions have visible particles that settle; centrifugation spins dense particles down, and coagulants such as alum clump fine particles so they settle.',
    evidence: 'You chose between centrifugation and coagulation and explained the layers.',
    stillConfusing: [
      { text: 'Why do the heavier particles go to the bottom when spun?', refresherId: 'cm8-centrifuge' },
      { text: 'What does a coagulant do?', refresherId: 'cm8-coagulate' },
    ],
  },
};

export const M9: EduLesson = {
  id: 'cm-l9', unitId: 'cm-unit-5', number: 9, title: 'Colloids and the Tyndall effect',
  objective: 'compare solutions, colloids and suspensions by particle size and properties, explain the Tyndall effect, and name the phases of a colloid and kinds of emulsion.',
  prerequisiteIds: ['cmp-mixture'],
  objectives: [
    { id: 'size', label: 'Compare the three kinds of mixture by particle size and properties' },
    { id: 'tyndall', label: 'Explain the Tyndall effect and predict where it is seen' },
    { id: 'phases', label: 'Name the dispersed phase and dispersion medium, and kinds of emulsion' },
  ],
  steps: [
    {
      id: 'cm9-size', title: 'Particle size decides', phase: 'observe',
      paragraphs: [
        'Solutions, colloids and suspensions differ mainly in the size of their particles: in a solution under 1 nm; in a colloid 1 to 1000 nm; in a suspension more than 1000 nm. (1 nm is a millionth of a millimetre.)',
        'Colloid particles are too small to see or to filter out, and they do not settle, so a colloid looks uniform. Yet it is heterogeneous. Milk, blood, tomato sauce and ice cream are colloids.',
      ],
      vocabulary: [{ term: 'colloid', meaning: 'a mixture with particles 1 to 1000 nm across, which neither settle nor filter out' }],
      check: pick('chk-cm9-size', 'Particles 200 nm across, spread through water, make a…', [['colloid', null], ['solution', 'Solution particles are under 1 nm.', 'size-band'], ['suspension', 'Suspension particles are over 1000 nm.', 'size-band']], '1 to 1000 nm: colloid.', undefined, 'cm9-size'),
    },
    {
      id: 'cm9-tyndall', title: 'A visible beam', phase: 'conjecture',
      paragraphs: [
        'Shine a narrow beam of light through each beaker and look from the side. In salt water the beam’s path is invisible. In chalk water and in milk water the path is visible, because the larger particles scatter light sideways. This scattering is the Tyndall effect, named after John Tyndall.',
        'Sunbeams through gaps in leaves, a beam through a dusty room, and stadium floodlights at night all show the Tyndall effect. Never look straight into a laser beam.',
      ],
      prediction: { id: 'pr-cm9-beam', prompt: 'Before you shine the beam through salt water, chalk water and milk water: in which will its path be visible?', options: [{ id: 'p1', text: 'Only in chalk water' }, { id: 'p2', text: 'In chalk water and milk water' }, { id: 'p3', text: 'In all three' }], expectedId: 'p2', reveal: 'The beam shows in chalk water and in milk water: colloid and suspension particles scatter light, while dissolved salt particles are too small.' },
      visual: v('mixBeam', { sampleId: 'milk-water', beam: true, editable: true }, 'A light beam through a beaker of milk water: its path is visible from the side because the colloid particles scatter the light. Switch beakers to compare.'),
      check: pick('chk-cm9-tyndall', 'In which mixture is the path of a light beam NOT visible?', [['Copper sulfate solution', null], ['Starch in water', 'Starch forms a colloid, which scatters light.', 'colloid-no-tyndall'], ['Dusty air', 'Dust particles scatter light.', 'colloid-no-tyndall']], 'True solutions do not scatter.', undefined, 'cm9-tyndall'),
    },
    {
      id: 'cm9-table', title: 'The three kinds side by side', phase: 'reasoning',
      paragraphs: [
        'Solution: homogeneous, under 1 nm, invisible particles, passes through filter paper, never settles, no Tyndall effect. Colloid: heterogeneous, 1 to 1000 nm, invisible, passes through filter paper, does not settle, shows the Tyndall effect. Suspension: heterogeneous, over 1000 nm, visible, held back by filter paper, settles, shows the Tyndall effect.',
        'Clouds and fog are tiny droplets in air (colloids); smoky, dusty city air looks hazy because its particles scatter light.',
      ],
      visual: v('mixBeam', { table: true }, 'A table comparing solution, colloid and suspension by nature, particle size, visibility, filtration, settling and the Tyndall effect.'),
      check: pick('chk-cm9-table', 'Which test separates a colloid from a suspension?', [['Leaving it to stand: only the suspension settles', null], ['The Tyndall effect', 'Both scatter light, so the beam test does not tell them apart.', 'tyndall-separates-all']], 'Settling or filtering.', undefined, 'cm9-table'),
    },
    {
      id: 'cm9-phases', title: 'Phases and emulsions', phase: 'apply',
      paragraphs: [
        'A colloid has a dispersed phase (the particles, like a solute) and a dispersion medium (what they are spread through, like a solvent). In blood, cells and proteins are the dispersed phase and the watery plasma is the medium.',
        'When both are liquids the colloid is an emulsion: oil-in-water (milk, vanishing cream) or water-in-oil (butter, cold cream). An emulsifier, such as the proteins in milk or soap, keeps an emulsion from separating.',
      ],
      check: pick('chk-cm9-phases', 'In milk, an oil-in-water emulsion, the dispersion medium is…', [['water', null], ['oil (fat)', 'The fat droplets are the dispersed phase; they are spread through water.', 'phase-swap']], 'The medium surrounds the droplets.', undefined, 'cm9-phases'),
    },
  ],
  investigation: { title: 'Shine a beam in the Mixtures Laboratory', description: 'Test the Tyndall effect, settling and filtration for each beaker.', href: `${MIX_LAB}?view=beam`, buttonLabel: 'Open the laboratory' },
  worked: {
    id: 'w-cm-l9', title: 'Which show the Tyndall effect?',
    given: ['(a) air with dust, (b) copper sulfate in water, (c) starch in water, (d) acetone in water'],
    ask: 'Which mixtures scatter a light beam?',
    steps: [
      { text: '(a) Dust particles are large: scattering, yes.', why: 'Suspended dust is well above 1 nm.' },
      { text: '(b) and (d) are true solutions: no scattering.', why: 'Dissolved particles are under 1 nm.' },
      { text: '(c) Starch forms a colloid: scattering, yes.', why: 'Colloid particles (1 to 1000 nm) scatter light.' },
    ],
    verify: 'So (a) and (c) show the Tyndall effect.',
  },
  guided: {
    id: 'g-cm-l9', prompt: 'A beam of light passes through a sample of blood diluted with water.',
    steps: [
      { id: 'g1', prompt: 'Kind of mixture.', question: pick('cm-g9-1', 'Blood is a…', [['colloid', null], ['true solution', 'Blood cells and proteins are much larger than dissolved particles.', 'size-band'], ['suspension that settles quickly in the body', 'Blood’s components stay dispersed in the body.', 'colloid-settles']], 'A colloid.', undefined, 'cm9-size'), hints: ['Can you see blood cells without a microscope?'] },
      { id: 'g2', prompt: 'The beam.', question: pick('cm-g9-2', 'Will the beam’s path be visible?', [['Yes: the particles scatter light', null], ['No: it is clear', 'Colloid particles scatter light.', 'colloid-no-tyndall']], 'Tyndall effect.', undefined, 'cm9-tyndall'), hints: ['Colloids scatter.'] },
    ],
    conclusion: 'Blood is a colloid, so it shows the Tyndall effect.',
  },
  independent: [
    ind('i1', 'Particle size', 'size', 'Band.', pick('cm-l9-i1', 'A mixture has particles about 5000 nm across that settle on standing. It is a…', [['suspension', null], ['colloid', 'Colloid particles are at most 1000 nm and do not settle.', 'size-band']], 'Over 1000 nm.'), ['Compare with 1000 nm.'], ['5000 nm > 1000 nm: a suspension.']),
    ind('i2', 'Tyndall', 'tyndall', 'Assertion and reason.', pick('cm-l9-i2', 'Assertion: solutions do not show the Tyndall effect. Reason: solution particles are larger than 100 nm. Which is right?', [['The assertion is true but the reason is false', null], ['Both are true and the reason explains the assertion', 'Solution particles are smaller than 1 nm, not larger than 100 nm.', 'size-band'], ['Both are false', 'Solutions indeed do not scatter light: the assertion is true.', 'assertion-false']], 'Tiny particles do not scatter.'), ['Check the size band for solutions.'], ['Solutions do not scatter (true), because their particles are under 1 nm (so the reason is false).']),
    ind('i3', 'Tyndall', 'tyndall', 'Hazy city.', pick('cm-l9-i3', 'Why does a city with smoke and dust in the air look hazy?', [['The particles scatter light', null], ['Smoke dissolves in air', 'Smoke is solid particles suspended in air; it scatters light.', 'smoke-dissolves']], 'Scattering.'), ['Tyndall effect.'], ['Suspended particles scatter light, so distant objects look hazy.']),
    ind('i4', 'Phases', 'phases', 'Butter.', pick('cm-l9-i4', 'Butter is a water-in-oil emulsion. Its dispersed phase is…', [['water', null], ['oil (fat)', 'In water-in-oil, water droplets are dispersed in fat.', 'phase-swap']], 'The first named is dispersed.'), ['Water-in-oil: what is inside what?'], ['Water droplets are dispersed in the fat.']),
    ind('i5', 'Particle size', 'size', 'Clouds.', pick('cm-l9-i5', 'Clouds are tiny water droplets or ice crystals floating in air that do not settle quickly and scatter sunlight. They are best described as a…', [['colloid', null], ['solution', 'Droplets are far larger than dissolved particles, and clouds scatter light.', 'size-band']], 'Dispersed droplets.'), ['Do they scatter light? Do they settle?'], ['Colloid: dispersed droplets that scatter light.']),
  ],
  reflection: {
    discover: 'Particle size sorts mixtures: solutions (< 1 nm) are clear and do not scatter light; colloids (1 to 1000 nm) look uniform but scatter light; suspensions (> 1000 nm) scatter light, settle and filter out.',
    evidence: 'You classified mixtures by size, predicted the Tyndall effect and named colloid phases.',
    stillConfusing: [
      { text: 'What are the size bands?', refresherId: 'cm9-size' },
      { text: 'Why is the beam visible only in some mixtures?', refresherId: 'cm9-tyndall' },
      { text: 'What is the dispersion medium?', refresherId: 'cm9-phases' },
    ],
  },
};
