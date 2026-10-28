/** Chapter 3 (Tissues in Action) practice bank and chapter assessment. Original questions; numbers checked by `__tests__/tissues.test.ts`. */

import type { ChapterAssessment, IndependentItem, PracticeSet, Question } from '../../../education/types';
import { num, pick } from '../../../education/builders';

const item = (id: string, topic: string, prompt: string, question: Question, hints: string[], solution: string[], difficulty: IndependentItem['difficulty'], marks = 1, ref?: string): IndependentItem =>
  ({ id, topic, prompt, question, hints, solution, difficulty, marks, source: ref ? { kind: 'textbook-aligned', ref } : { kind: 'original' } });
const choose = (id: string, prompt: string, options: [string, string | null][], explanation: string) => pick(id, prompt, options, explanation);

export const TISSUES_PRACTICE: PracticeSet = {
  id: 'tissues-practice', title: 'Tissues chapter practice',
  groups: [
    {
      id: 'g-plant', title: 'Plant tissues', blurb: 'Meristems and permanent tissues (Lessons 1 and 2).',
      items: [
        item('btx-1', 'Meristem cells', 'Why they divide.', choose('btx-1q', 'Meristematic cells divide repeatedly. Which property allows this?', [['Thin walls, dense cytoplasm and a large, prominent nucleus', null], ['Thick walls for protection', 'Thick walls belong to non-dividing tissues such as sclerenchyma.'], ['Large vacuoles that store nutrients', 'Meristem cells have no vacuoles.']], 'Built for division.'), ['Think of active cells.'], ['Thin walls, dense cytoplasm, large nucleus.'], 'basic', 1, 'Revise, Reflect, Refine Q1'),
        item('btx-2', 'Phloem', 'Food transport.', choose('btx-2q', 'A plant cannot transport food from leaves to roots. Which tissue is malfunctioning?', [['Phloem', null], ['Xylem', 'Xylem carries water and minerals upwards.'], ['Epidermis', 'The epidermis is protective.']], 'Food in phloem.'), ['Food, not water.'], ['Phloem.'], 'basic', 1, 'Revise, Reflect, Refine Q2'),
        item('btx-3', 'Teak growth', 'Table 3.7.', num('btx-3q', 'A teak tree is 8 cm across at 10 years and 24 cm at 20 years. What was its average growth in diameter, in cm per year?', 1.6, '(24 − 8) ÷ (20 − 10) = 1.6 cm per year.', { unit: 'cm per year', rules: [[[1.2], 'That divides 24 by 20; use the change in diameter over the change in age.']] }), ['Change ÷ years.'], ['16 ÷ 10 = 1.6 cm per year.'], 'standard', 2, 'Revise, Reflect, Refine Q7'),
        item('btx-4', 'Sugarcane cuttings', 'Regrowth.', choose('btx-4q', 'Sugarcane cuttings with a node sprout, but cuttings without a node do not. Why?', [['The node region has intercalary meristem that can divide and form new shoots', null], ['Nodes contain more sugar', 'Sugar alone cannot make new shoots; dividing meristem cells can.'], ['Cuttings without nodes have no cells', 'All parts of the stem are made of cells.']], 'Meristem at the node.'), ['Where are the dividing cells?'], ['Only cuttings with meristematic tissue at the node can regrow.'], 'challenge', 2, 'Revise, Reflect, Refine Q10'),
        item('btx-5', 'Simple or complex', 'Definition.', choose('btx-5q', '"A tissue is a group of similar cells doing a similar job." For which tissues is this not exactly true?', [['Complex tissues such as xylem and phloem, which have several kinds of cell working together', null], ['Simple tissues such as parenchyma', 'Simple tissues fit the definition: one kind of cell.']], 'Complex tissues.'), ['Count the cell types.'], ['Xylem and phloem combine different cells for one job.'], 'challenge', 2, 'Revise, Reflect, Refine Q11'),
      ],
    },
    {
      id: 'g-animal', title: 'Animal tissues', blurb: 'Epithelial, connective, muscular and nervous tissue (Lessons 3 to 5).',
      items: [
        item('btx-6', 'Thin linings', 'Exchange.', choose('btx-6q', 'Why is the epithelium lining internal organs such as the lungs only one or a few cells thick?', [['To allow quick exchange of materials across it', null], ['To store food efficiently', 'Linings like this are for exchange, not storage.'], ['To provide maximum strength', 'Strength would need many layers.']], 'Short path.'), ['Diffusion distance.'], ['Thin linings allow fast exchange.'], 'basic', 1, 'Revise, Reflect, Refine Q3'),
        item('btx-7', 'Cardiac muscle', 'No fatigue.', choose('btx-7q', 'Claim: cardiac muscle can contract continuously without tiring. Reason: its cells have many mitochondria and a rich blood supply. Choose.', [['Both are true and the reason explains the claim', null], ['Both are true but the reason does not explain the claim', 'A steady energy supply is exactly why it does not tire.'], ['The claim is false', 'The heart beats all through life without fatigue.']], 'Energy supply.'), ['Where does energy come from?'], ['Mitochondria and blood supply provide constant energy.'], 'standard', 2, 'Revise, Reflect, Refine Q6B'),
        item('btx-8', 'Plasma', 'Blood volume.', num('btx-8q', 'A person has 5 litres of blood. About how many litres are formed elements (cells and platelets), at 45 %?', 2.25, '5 × 0.45 = 2.25 litres.', { unit: 'litres', rules: [[[2.75], 'That is the plasma (55 %).']] }), ['5 × 45 ÷ 100.'], ['2.25 litres.'], 'standard'),
        item('btx-9', 'Muscle identification', 'Microscope.', choose('btx-9q', 'Under a microscope you see spindle-shaped cells, each with one nucleus and no bands. This is…', [['smooth muscle', null], ['skeletal muscle', 'Skeletal fibres are striated with many nuclei.'], ['cardiac muscle', 'Cardiac fibres are branched with faint striations.']], 'Spindle, no striations.'), ['No bands.'], ['Smooth muscle.'], 'basic'),
      ],
    },
    {
      id: 'g-movement', title: 'Movement and support', blurb: 'Joints and the skeleton (Lesson 6).',
      items: [
        item('btx-10', 'Joints', 'Bending.', choose('btx-10q', 'Which joint works when you bend your knees and ankles to jump?', [['Hinge', null], ['Ball and socket', 'Ball and socket joints are at the shoulder and hip.'], ['Pivot', 'The pivot joint is at the neck.']], 'Bending in one plane.'), ['One direction only.'], ['Hinge joints.'], 'basic', 1, 'Revise, Reflect, Refine Q5'),
        item('btx-11', 'Bone mass', 'Activity 3.4.', num('btx-11q', 'A 45 kg student’s skeleton is about 14 % of body mass. Estimate it, in kg.', 6.3, '45 × 14 ÷ 100 = 6.3 kg.', { unit: 'kg', rules: [[[3.2], '45 ÷ 14 is not a percentage; multiply by 14 and divide by 100.']] }), ['Total × percent ÷ 100.'], ['6.3 kg.'], 'standard'),
        item('btx-12', 'Debarking', 'Elephant damage.', choose('btx-12q', 'An elephant strips the bark from a tree trunk. If the tissue just beneath the bark is also damaged all the way round, what is most affected?', [['Transport of food from the leaves to the roots, through the phloem', null], ['Absorption of water by root hairs', 'Root hairs are in the soil, away from the damaged trunk.'], ['Photosynthesis in the leaves directly', 'Leaves can still photosynthesise at first; the food cannot reach the roots.']], 'Phloem lies close to the bark.'), ['Which tissue lies just inside the bark?'], ['Phloem near the bark carries food down; damaging it starves the roots.'], 'challenge', 2, 'Revise, Reflect, Refine Q8'),
      ],
    },
  ],
};

export const TISSUES_ASSESSMENT: ChapterAssessment = {
  id: 'tissues-assessment-1',
  title: 'Tissues in Action: chapter assessment',
  instructions: 'Ten original questions across the whole chapter. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'bta-1', topic: 'Meristems', lessonId: 'bt-l1', competency: 'knowledge', marks: 1, prompt: 'Length.', question: choose('bta-1q', 'Which tissue makes roots and shoots longer?', [['Apical meristem', null], ['Lateral meristem', 'The lateral meristem increases girth.'], ['Collenchyma', 'Collenchyma gives flexible support; it does not divide.']], 'At the tips.'), solution: ['Apical meristems at root and shoot tips.'] },
        { id: 'bta-2', topic: 'Xylem', lessonId: 'bt-l2', competency: 'knowledge', marks: 1, prompt: 'Job.', question: choose('bta-2q', 'Xylem carries…', [['water and minerals from the roots upwards', null], ['food from the leaves', 'That is phloem.'], ['oxygen to every cell', 'Gases move by diffusion, not in xylem.']], 'Water up.'), solution: ['Xylem carries water and minerals; it also gives strength.'] },
        { id: 'bta-3', topic: 'Ligaments', lessonId: 'bt-l4', competency: 'knowledge', marks: 1, prompt: 'Connection.', question: choose('bta-3q', 'Ligaments join…', [['bone to bone', null], ['muscle to bone', 'Tendons join muscle to bone.'], ['nerve to muscle', 'Nerves are nervous tissue, not linked by ligaments.']], 'Bone to bone.'), solution: ['Ligaments connect bones and limit movement.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'bta-4', topic: 'Tree rings', lessonId: 'bt-l1', competency: 'application', marks: 2, prompt: 'Age.', question: num('bta-4q', 'A teak log has 25 annual rings. How old was the tree when cut, in years?', 25, 'One ring per year.', {}), solution: ['One ring forms each year.', '25 rings: 25 years.'] },
        { id: 'bta-5', topic: 'Supporting tissues', lessonId: 'bt-l2', competency: 'application', marks: 2, prompt: 'Coconut husk.', question: choose('bta-5q', 'Coconut fibre mats are very tough. Which tissue gives the fibres this strength?', [['Sclerenchyma, with thick lignified walls', null], ['Parenchyma, with thin walls', 'Thin-walled living cells cannot give such strength.'], ['Collenchyma, with pectin', 'Collenchyma gives flexibility, not hardness.']], 'Lignin.'), solution: ['Sclerenchyma has thick walls hardened by lignin.', 'Parenchyma’s thin walls give no strength.'] },
        { id: 'bta-6', topic: 'Blood', lessonId: 'bt-l4', competency: 'application', marks: 2, prompt: 'Plasma.', question: num('bta-6q', 'A 6-litre volume of blood is 55 % plasma. How many litres of plasma is that?', 3.3, '6 × 0.55 = 3.3 litres.', { unit: 'litres' }), solution: ['6 × 55 ÷ 100 = 3.3 litres.'] },
        { id: 'bta-7', topic: 'Joints', lessonId: 'bt-l6', competency: 'application', marks: 2, prompt: 'Dance pose.', question: choose('bta-7q', 'A dancer swings an arm in a full circle while turning the head side to side. Which joints are used?', [['Ball and socket at the shoulder, pivot at the neck', null], ['Hinge at the shoulder, fixed at the neck', 'A hinge cannot circle and a fixed joint cannot move.'], ['Pivot at the shoulder, hinge at the neck', 'The shoulder is ball and socket; the neck is a pivot.']], 'Circle and turn.'), solution: ['A full circle needs a ball and socket joint (shoulder).', 'Turning the head uses the pivot joint.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'bta-8', topic: 'Cuticle', lessonId: 'bt-l2', competency: 'analysis', marks: 2, prompt: 'Desert and water.', question: choose('bta-8q', 'Why is a thick cuticle useful to a desert plant but a disadvantage to a plant living underwater?', [['It saves water in the desert, but underwater it would block the exchange of gases and substances with the water', null], ['It makes food in the desert but not underwater', 'The cuticle does not make food.'], ['It is useful in both places in the same way', 'Underwater plants need easy exchange with the water, which a thick cuticle blocks.']], 'Waterproof barrier.'), solution: ['In the desert, a waxy layer cuts water loss.', 'Underwater, water loss is no problem and a thick layer would hinder exchange.'] },
        { id: 'bta-9', topic: 'Muscles', lessonId: 'bt-l5', competency: 'analysis', marks: 2, prompt: 'Identify.', question: choose('bta-9q', 'A tissue has branched fibres with one nucleus each and faint bands, and works rhythmically for life. It is…', [['cardiac muscle in the heart', null], ['skeletal muscle in the arm', 'Skeletal fibres are unbranched and multinucleate, and they tire.'], ['smooth muscle in the stomach', 'Smooth muscle cells are spindle-shaped with no bands.']], 'Branched and tireless.'), solution: ['Branched, single nucleus, faint striations, no fatigue: cardiac muscle.'] },
        { id: 'bta-10', topic: 'Root experiment', lessonId: 'bt-l1', competency: 'analysis', marks: 2, prompt: 'Fair test.', question: choose('bta-10q', 'In the onion root experiment, why must both jars use similar onions, the same water and the same place?', [['So that cutting the tips is the only difference, and any change in growth can be put down to it', null], ['So that both onions grow at exactly the same speed forever', 'The aim is a fair test, not identical growth.'], ['Because onions only grow in matching jars', 'Onions grow anywhere with water; the point is a fair comparison.']], 'Change one thing.'), solution: ['Keep everything the same except the variable tested.', 'Then a difference in growth is due to cutting the tips.'] },
      ],
    },
  ],
};
