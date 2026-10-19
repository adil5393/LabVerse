/**
 * Propositions and Their Converses, Class 9: original Learn lessons (EDU-1P).
 *
 * Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 9 (7 pages). The
 * chapter has no numbered sections: it has the opening Statements 1 and 2,
 * Examples 1 to 5, "Think and Reflect" prompts, Exercise Set 9.1 (questions 1
 * to 17) and a four-bullet summary. Wording, figures and questions here are
 * original. What goes beyond the chapter is marked "extension" in the lesson:
 * classifying questions, commands and opinions; Euler's n² + n + 41; the
 * acute/obtuse comparison; necessary and sufficient conditions.
 */

import type { EduChapter, EduLesson, GuidedItem, IndependentItem, Question, WorkedExample } from '../../../education/types';
import { CLAIMS, converseOf } from './logic';
import { PROP_PREREQUISITES, PROP_UNITS } from './prerequisites';
import {
  buildJudges, claimGrid, combinationQ, converseQ, counterQ, factorCountQ, firstFailureQ, gridVisual, orderQ, partQ, pick, sticksShapeQ, sticksVisual, truthQ,
} from './questions';
import type { SticksSpec } from './geometry';

export const PROP_JUDGES = buildJudges('conv-different');

const ind = (id: string, topic: string, objective: string, prompt: string, question: Question, hints: string[], solution: string[]): IndependentItem => ({ id, topic, objective, prompt, question, hints, solution });

const C = CLAIMS;
const GRID_63 = claimGrid(C.mult6to3);
const GRID_63_T = claimGrid(C.mult6to3, { toggle: true });

// ---------------------------------------------------------------------------
// Proof step sets (used by ordering questions and proof explainers)
// ---------------------------------------------------------------------------

const SUM_EVEN = [
  { id: 's1', text: 'Since a is even, a = 2m for some whole number m.', needs: [] },
  { id: 's2', text: 'Since b is even, b = 2k for some whole number k.', needs: [] },
  { id: 's3', text: 'Add them: a + b = 2m + 2k.', needs: ['s1', 's2'] },
  { id: 's4', text: 'Factor out 2: a + b = 2(m + k).', needs: ['s3'] },
  { id: 's5', text: 'm + k is a whole number, so a + b is 2 times a whole number. It is even.', needs: ['s4'] },
];
const MULT6 = [
  { id: 'd1', text: 'Since n is a multiple of 6, n = 6k for some whole number k.', needs: [] },
  { id: 'd2', text: 'Write 6 = 3 × 2, so n = 3 × 2 × k.', needs: ['d1'] },
  { id: 'd3', text: 'Regroup the factors: n = 3 × (2k).', needs: ['d2'] },
  { id: 'd4', text: '2k is a whole number, so n is a multiple of 3.', needs: ['d3'] },
];
const ODD_FACTORS = [
  { id: 'f0', text: 'Given: n has an odd number of factors.', needs: [] },
  { id: 'f1', text: 'Every factor f of n has a partner n ÷ f, which is also a factor.', needs: [] },
  { id: 'f2', text: 'If no factor were its own partner, the factors would split into pairs, so there would be an even number of them.', needs: ['f1'] },
  { id: 'f3', text: 'The number is odd, so some factor f is its own partner: f = n ÷ f.', needs: ['f0', 'f2'] },
  { id: 'f4', text: 'f = n ÷ f means n = f × f.', needs: ['f3'] },
  { id: 'f5', text: 'So n is a perfect square.', needs: ['f4'] },
];
const ISOSCELES = [
  { id: 'a0', text: 'Given: in triangle ABC, ∠B = ∠C.', needs: [] },
  { id: 'a1', text: 'Draw the altitude AD from A to BC.', needs: [] },
  { id: 'a2', text: '∠ADB = ∠ADC = 90°, because AD is an altitude.', needs: ['a1'] },
  { id: 'a3', text: 'AD = AD, a side common to both triangles.', needs: ['a1'] },
  { id: 'a4', text: 'Triangles ADB and ADC are congruent: two equal angles and a matching side (AAS).', needs: ['a0', 'a2', 'a3'] },
  { id: 'a5', text: 'So AB = AC, matching sides of congruent triangles.', needs: ['a4'] },
];
const PYTH_CONVERSE = [
  { id: 'p0', text: 'Given: triangle ABC with a² + b² = c².', needs: [] },
  { id: 'p1', text: 'Draw a right triangle XYZ with the right angle at Z, ZY = a and ZX = b.', needs: [] },
  { id: 'p2', text: 'By the Baudhāyana–Pythagoras theorem, XY² = a² + b².', needs: ['p1'] },
  { id: 'p3', text: 'So XY² = c², and XY = c because lengths are positive.', needs: ['p0', 'p2'] },
  { id: 'p4', text: 'Triangles ABC and XYZ have three pairs of equal sides, so they are congruent (SSS).', needs: ['p3'] },
  { id: 'p5', text: 'So ∠C = ∠Z = 90°: triangle ABC has a right angle.', needs: ['p4'] },
];
const MULT24 = [
  { id: 'm1', text: 'Since n is a multiple of 24, n = 24k for some whole number k.', needs: [] },
  { id: 'm2', text: 'Write 24 = 4 × 6, so n = 4 × (6k).', needs: ['m1'] },
  { id: 'm3', text: 'Also 24 = 6 × 4, so n = 6 × (4k).', needs: ['m1'] },
  { id: 'm4', text: '6k and 4k are whole numbers, so n is divisible by both 4 and 6.', needs: ['m2', 'm3'] },
];

// ---------------------------------------------------------------------------
// Sticks (textbook Exercise 17) specs
// ---------------------------------------------------------------------------

const STICKS_MID: SticksSpec = { len1: 8, len2: 8, t1: 0.5, t2: 0.5, angle: 70 };
const STICKS_OFF: SticksSpec = { len1: 8, len2: 8, t1: 0.3, t2: 0.3, angle: 70 };

const stickAlt = (s: SticksSpec) => `Two sticks as diagonals of a four-sided figure ABCD: AC = ${s.len1}, BD = ${s.len2}, crossing ${Math.round(s.t1 * 100)}% along AC and ${Math.round(s.t2 * 100)}% along BD at ${s.angle} degrees. The controls change each of these; the text below names the figure.`;

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

const L1_WORKED: WorkedExample = {
  id: 'w-prop-l1', title: 'Is "9 is a multiple of 4" a proposition?', given: ['The sentence: "9 is a multiple of 4."'], ask: 'Is it a proposition, and is it true or false?',
  steps: [
    { text: 'It is a statement about the number 9 that says something definite.', why: 'A proposition is a statement that is either true or false.' },
    { text: 'Check it: the multiples of 4 are 4, 8, 12, ... and 9 is not one of them.', why: 'We decide a claim about numbers by checking it against the number.' },
    { text: 'So the sentence is a proposition, and it is false.', why: 'A false statement is still a proposition. "False" is its truth value.' },
  ],
  verify: '9 ÷ 4 leaves remainder 1, so 9 is not a multiple of 4. The claim is false.',
};

const L1: EduLesson = {
  id: 'prop-l1', unitId: 'unit-1', number: 1, title: 'Propositions: claims that are true or false',
  objective: 'decide whether a sentence is a proposition, and decide whether a proposition is true or false.',
  prerequisiteIds: ['pp-true-false'],
  objectives: [{ id: 'decide', label: 'Decide whether a sentence is a proposition' }, { id: 'check', label: 'Decide whether a proposition is true or false' }],
  steps: [
    {
      id: 'prop-def', title: 'A proposition is a statement that is true or false',
      paragraphs: [
        'Look at this statement: "If two sides of a triangle are equal, then the angles opposite them are equal." It says something definite, and it is true. The textbook calls a statement that is either true or false a PROPOSITION.',
        'Now look at "Every rectangle is a square". It is false (a 4 cm by 6 cm rectangle is not a square). It is still a proposition, because it is definitely one or the other.',
      ],
      vocabulary: [{ term: 'proposition', meaning: 'a statement that is either true or false' }, { term: 'truth value', meaning: 'whether it is true or false' }],
      misconception: { wrong: 'A proposition has to be true.', right: 'A false statement is also a proposition. "False" is an answer, not a failure to be a proposition.' },
      check: pick('chk-prop-def', 'Is "Every rectangle is a square" a proposition?', [
        ['Yes. It is false, but it is definitely true or false.', null],
        ['No, because it is false.', 'A proposition only has to be definitely true or definitely false. This one is false, so it is a proposition with the truth value "false".', 'false_not_a_proposition'],
        ['No, because it is about shapes.', 'Propositions can be about anything mathematical, shapes included. What matters is that it is true or false.', 'subject_matters'],
      ], 'It is false, and a false statement is still a proposition.'),
    },
    {
      id: 'prop-notprop', title: 'What is not a proposition (extension)',
      paragraphs: [
        'Some sentences are not true or false. A question ("Is 17 prime?") asks; it does not claim. A command ("Draw a circle") tells you to do something. An opinion ("Mathematics is the most enjoyable subject") depends on who is speaking.',
        'The answers to questions are propositions: "17 is prime" is true. This idea of sorting sentences is an extension: the textbook gives only the definition above.',
      ],
      check: pick('chk-prop-notprop', 'Which of these is NOT a proposition?', [
        ['Is 17 a prime number?', null],
        ['17 is a prime number.', 'This claims something definite about 17 and it is true, so it is a proposition.', 'wrong_sort'],
        ['17 is a multiple of 5.', 'This is false, but a false statement is still a proposition.', 'false_not_a_proposition'],
      ], 'A question is not true or false; it asks.'),
    },
    {
      id: 'prop-open', title: 'A sentence about "n" (extension)',
      paragraphs: [
        '"n is a multiple of 3" is true for some numbers and false for others. On its own it is not yet true or false. Pick a number (tap one) and it is: it is true for 12 and false for 14.',
        'In this chapter we mostly meet statements about ALL numbers of some kind, such as "every multiple of 6 is a multiple of 3". That whole statement is true or false.',
      ],
      visual: gridVisual({ k: 'div', by: 3 }, { k: 'div', by: 3 }, { max: 30, single: true }),
      notice: 'Optional demo: the rule is true for the outlined numbers and false for the others.',
    },
  ],
  worked: L1_WORKED,
  guided: {
    id: 'g-prop-l1', prompt: 'Decide about the statement: "Every multiple of 6 is a multiple of 3."',
    steps: [
      { id: 'g1', prompt: 'First, is it a proposition?', question: pick('g-prop-l1-1', 'Is "Every multiple of 6 is a multiple of 3" a proposition?', [['Yes, it is definitely true or false', null], ['No, because it is about many numbers', 'A statement about all numbers of a kind can be definitely true or false. This one is.', 'general_not_a_proposition']], 'It makes a definite claim, so it is a proposition.'), hints: ['Can you decide whether it is true or false?'] },
      { id: 'g2', prompt: 'Now decide whether it is true.', question: truthQ('g-prop-l1-2', C.mult6to3, 'statement'), hints: ['Try 6, 12, 18. Then think: why would any multiple of 6 work?'] },
    ],
    conclusion: 'It is a proposition, and it is true: every multiple of 6 is 3 times a whole number.',
  } satisfies GuidedItem,
  independent: [
    ind('i1', 'Recognising a proposition', 'decide', 'Pick the proposition.', pick('prop-l1-i1', 'Which of these is a proposition?', [['7 is greater than 12.', null], ['Please add 7 and 12.', 'That is a command. It cannot be true or false.', 'command_as_proposition'], ['Is 12 greater than 7?', 'That is a question. It asks; it does not claim.', 'question_as_proposition'], ['Numbers are beautiful.', 'That is an opinion. It depends on who says it.', 'opinion_as_proposition']], '"7 is greater than 12" is false, but it is a proposition.'), ['A proposition makes a definite claim.'], ['"Please add..." is a command, "Is ...?" a question, "beautiful" an opinion.', '"7 is greater than 12" is a claim, and it is false.']),
    ind('i2', 'Why a question is not a proposition', 'decide', 'Explain.', pick('prop-l1-i2', 'Why is "Is 21 a multiple of 7?" not a proposition?', [['It asks something; it does not say something that is true or false.', null], ['Because 21 is a multiple of 7, so the answer is boring.', 'Whether it is boring does not matter. A question is not a statement at all.', 'wrong_reason'], ['Because it contains a number.', 'Propositions often contain numbers.', 'wrong_reason']], 'The answer to the question ("21 is a multiple of 7") is a proposition. The question itself is not.'), ['Does the sentence claim anything?'], ['It asks. Only a statement can be true or false.']),
    ind('i3', 'Checking a statement', 'check', 'True or false?', truthQ('prop-l1-i3', C.primeOdd, 'statement', 'prop-def'), ['Think about the smallest prime number.'], ['2 is prime and even, so the statement is false.']),
    ind('i4', 'Checking a statement', 'check', 'True or false?', pick('prop-l1-i4', 'Is the proposition "The sum of two even numbers is even" true or false?', [['True', null], ['False', 'Try 2 + 4 = 6, 8 + 10 = 18, 6 + 12 = 18. In fact you can show it always works: 2m + 2k = 2(m + k).', 'wrong_check']], 'It is true: 2m + 2k = 2(m + k) is even whatever m and k are.', undefined, 'prop-def'), ['Try a few sums, then ask why it must always work.'], ['2m + 2k = 2(m + k), which is 2 times a whole number.']),
  ],
  reflection: {
    discover: 'A proposition is a statement that is definitely true or definitely false, and a false statement is still a proposition.',
    evidence: 'You sorted sentences into propositions and non-propositions and checked statements.',
    stillConfusing: [{ text: 'Can a false statement be a proposition?', refresherId: 'prop-def' }, { text: 'Why is a question not a proposition?', refresherId: 'prop-notprop' }],
  },
};

const L2: EduLesson = {
  id: 'prop-l2', unitId: 'unit-1', number: 2, title: 'If P, then Q',
  objective: 'split an "if … then …" statement into hypothesis and conclusion, say it in other words, and explain what it promises about every number.',
  prerequisiteIds: ['pp-true-false', 'pp-conditions'],
  objectives: [{ id: 'parts', label: 'Name the hypothesis and the conclusion' }, { id: 'wordings', label: 'Recognise other wordings of "if P then Q"' }, { id: 'meaning', label: 'Say what "if P then Q" promises' }],
  steps: [
    {
      id: 'ift-parts', title: 'Two parts: what is assumed, what follows',
      paragraphs: ['The textbook writes "if X then Y". We will call the first part P (the HYPOTHESIS, what is assumed) and the second Q (the CONCLUSION, what must follow). "If P then Q" is also written "P implies Q".', 'Example: "If two angles of a triangle are equal, then the sides opposite them are equal." P is "two angles of a triangle are equal". Q is "the sides opposite them are equal".'],
      vocabulary: [{ term: 'hypothesis (P)', meaning: 'the part after "if"' }, { term: 'conclusion (Q)', meaning: 'the part after "then"' }, { term: 'implies', meaning: '"P implies Q" means "if P then Q"' }],
      check: partQ('chk-ift-parts', 'If a number is a multiple of 6, then it is a multiple of 3.', 'a number is a multiple of 6', 'it is a multiple of 3', 'hypothesis', [], 'ift-parts'),
    },
    {
      id: 'ift-wordings', title: 'The same claim in other words',
      paragraphs: ['"Y when X" means the same as "if X then Y". The textbook shows: "A number has an odd number of factors when it is a perfect square" says the same as "If a number is a perfect square, then it has an odd number of factors".', '"All squares are rectangles" says: if a figure is a square, then it is a rectangle. Be careful about the direction: it does NOT say that every rectangle is a square.'],
      misconception: { wrong: '"All squares are rectangles" means the same as "If a figure is a rectangle, then it is a square".', right: 'The first part of "if" is the kind of thing the "all" statement is about: squares. So P is "is a square" and Q is "is a rectangle".' },
      check: pick('chk-ift-wordings', '"A number is even when it is a multiple of 4" has the same meaning as:', [
        ['If a number is a multiple of 4, then it is even.', null],
        ['If a number is even, then it is a multiple of 4.', 'That swaps the parts. "Y when X" puts the condition (X) after "when": the multiple of 4 is the condition.', 'swapped_hypothesis_conclusion'],
      ], '"Y when X" means "if X then Y": the condition X comes after "when".'),
    },
    {
      id: 'ift-meaning', title: 'What "if P then Q" promises', phase: 'observe',
      paragraphs: ['Take P = "n is a multiple of 6" and Q = "n is a multiple of 3". In the grid, a blue outline means P is true and a green fill means Q is true. Every outlined number is also green.', '"If P then Q" promises exactly this for EVERY number: whenever P is true, Q is true. Numbers where P is false (not outlined) are not covered by the promise, so they cannot break it.'],
      visual: GRID_63,
      notice: 'Tap 4 (not outlined): the claim says nothing about it. Tap 12 (outlined and green): it fits.',
      check: pick('chk-ift-meaning', 'In the grid, 3 is green but not outlined. What does that say about "If n is a multiple of 6, then n is a multiple of 3"?', [
        ['Nothing. The promise is only about multiples of 6, and 3 is not one.', null],
        ['It breaks the statement, because 3 is not a multiple of 6.', 'The statement only talks about numbers for which P is true. 3 is not a multiple of 6, so it is not covered and cannot break the promise.', 'hypothesis_false_as_counterexample'],
      ], 'Only numbers satisfying P can fit or break "if P then Q".', GRID_63),
    },
  ],
  worked: {
    id: 'w-prop-l2', title: 'Split a statement', given: ['"If a quadrilateral is a rhombus, then its diagonals are perpendicular."'], ask: 'What are P and Q? Write "all rhombuses …" in other words.',
    steps: [
      { text: 'The part after "if" is P: "a quadrilateral is a rhombus".', why: 'The hypothesis is what we assume.' },
      { text: 'The part after "then" is Q: "its diagonals are perpendicular".', why: 'The conclusion is what must follow.' },
      { text: 'Another wording: "The diagonals of a quadrilateral are perpendicular when it is a rhombus."', why: '"Y when X" has the same meaning as "if X then Y".' },
    ],
    verify: 'In each wording the rhombus is the condition and the perpendicular diagonals are the result.',
  },
  guided: {
    id: 'g-prop-l2', prompt: 'Work with "If n is divisible by 24, then n is divisible by both 4 and 6."',
    steps: [
      { id: 'g1', prompt: 'Name the hypothesis.', question: partQ('g-prop-l2-1', 'If n is divisible by 24, then n is divisible by both 4 and 6.', 'n is divisible by 24', 'n is divisible by both 4 and 6', 'hypothesis', [], 'ift-parts'), hints: ['It is the part after "if".'] },
      { id: 'g2', prompt: 'Name the conclusion.', question: partQ('g-prop-l2-2', 'If n is divisible by 24, then n is divisible by both 4 and 6.', 'n is divisible by 24', 'n is divisible by both 4 and 6', 'conclusion', [], 'ift-parts'), hints: ['It is the part after "then".'] },
      { id: 'g3', prompt: 'Now say it with "when".', question: pick('g-prop-l2-3', 'Which sentence has the same meaning?', [['n is divisible by both 4 and 6 when n is divisible by 24.', null], ['n is divisible by 24 when n is divisible by both 4 and 6.', 'That swaps the parts. The condition goes after "when".', 'swapped_hypothesis_conclusion']], '"Q when P" means "if P then Q".', undefined, 'ift-wordings'), hints: ['The condition P goes after "when".'] },
    ],
    conclusion: 'P: n is divisible by 24. Q: n is divisible by both 4 and 6. Q when P says the same as "if P then Q".',
  },
  independent: [
    ind('i1', 'Naming the hypothesis', 'parts', 'Split the statement.', partQ('prop-l2-i1', 'If n is divisible by 60, then n is divisible by both 5 and 12.', 'n is divisible by 60', 'n is divisible by both 5 and 12', 'hypothesis', [], 'ift-parts'), ['Look after "if".'], ['P is "n is divisible by 60".']),
    ind('i2', 'Naming the conclusion', 'parts', 'Split the statement.', partQ('prop-l2-i2', 'If two angles of a triangle are equal, then the sides opposite them are equal.', 'two angles of a triangle are equal', 'the sides opposite them are equal', 'conclusion', [], 'ift-parts'), ['Look after "then".'], ['Q is "the sides opposite them are equal".']),
    ind('i3', 'Other wordings', 'wordings', 'Choose the same meaning.', pick('prop-l2-i3', '"A number has an odd number of factors when it is a perfect square" means:', [['If a number is a perfect square, then it has an odd number of factors.', null], ['If a number has an odd number of factors, then it is a perfect square.', 'That swaps the parts. After "when" comes the condition: "it is a perfect square".', 'swapped_hypothesis_conclusion']], 'The condition after "when" is the "if" part.', undefined, 'ift-wordings'), ['What comes after "when"?'], ['After "when": it is a perfect square. That is P.']),
    ind('i4', 'Other wordings', 'wordings', 'Turn "all" into "if … then".', pick('prop-l2-i4', '"All squares are rectangles" means:', [['If a figure is a square, then it is a rectangle.', null], ['If a figure is a rectangle, then it is a square.', 'That is the other direction. "All squares ..." is about squares: being a square is the condition.', 'swapped_hypothesis_conclusion']], 'Squares are the things the statement is about.', undefined, 'ift-wordings'), ['Which shapes does the statement start from?'], ['It starts from squares.']),
    ind('i5', 'What the promise covers', 'meaning', 'Use the grid.', pick('prop-l2-i5', 'In the grid for "If n is a multiple of 6, then n is a multiple of 3", is 4 a counterexample?', [['No. 4 is not a multiple of 6, so the statement says nothing about it.', null], ['Yes. 4 is not a multiple of 3.', 'A counterexample needs P to be true. 4 is not a multiple of 6, so P is false and 4 is not covered.', 'hypothesis_false_as_counterexample']], 'Only numbers satisfying P can be counterexamples.', GRID_63, 'ift-meaning'), ['Is P true for 4?'], ['P is false for 4, so 4 cannot disprove the statement.']),
    ind('i6', 'What the promise covers', 'meaning', 'One example is not the whole promise.', pick('prop-l2-i6', 'In the grid for "If n is a multiple of 6, then n is a multiple of 3", 6 fits (both true). What does that show about the statement?', [['Only that 6 fits. The statement promises this for every multiple of 6, which one example cannot show.', null], ['That the statement is true for all numbers.', 'One fitting example shows nothing about the others. The promise is about every number with the first part true.', 'testing_as_proof']], 'A single fitting number is not the whole promise.', GRID_63, 'ift-meaning'), ['How many numbers does the statement cover?'], ['Every multiple of 6, infinitely many.']),
  ],
  reflection: {
    discover: '"If P then Q" splits into a hypothesis and a conclusion, has other wordings, and promises Q for every number for which P is true.',
    evidence: 'You named both parts, rewrote statements, and used the grid to see what is and is not covered.',
    stillConfusing: [{ text: 'Which part is P?', refresherId: 'ift-parts' }, { text: 'What does the promise cover?', refresherId: 'ift-meaning' }],
  },
};

const L3: EduLesson = {
  id: 'prop-l3', unitId: 'unit-2', number: 3, title: 'The converse',
  objective: 'write the converse of "if P then Q", and explain why a true statement can have a false converse.',
  prerequisiteIds: ['pp-number-words', 'pp-conditions'],
  objectives: [{ id: 'form', label: 'Write the converse correctly' }, { id: 'different', label: 'Explain that the converse is a different claim' }],
  steps: [
    {
      id: 'conv-form', title: 'Swap the two parts',
      paragraphs: ['The textbook starts with two statements. Statement 1: "If two sides of a triangle are equal, then the angles opposite the equal sides are equal." Statement 2: "If two angles of a triangle are equal, then the sides opposite the equal angles are equal." Statement 2 is the CONVERSE of Statement 1: the two parts are swapped.', 'The converse of "if P then Q" is "if Q then P".'],
      vocabulary: [{ term: 'converse', meaning: '"if Q then P", the statement with the two parts swapped' }],
      visual: GRID_63_T,
      notice: 'Use the button to swap the two parts and compare the original with its converse.',
      check: converseQ('chk-conv-form', 'If a number is a multiple of 6, then it is a multiple of 3.', 'If a number is a multiple of 3, then it is a multiple of 6.', [['If a number is not a multiple of 6, then it is not a multiple of 3.', 'That keeps the order and negates both parts. It is a different statement from the converse. The converse just swaps P and Q.', 'inverse_for_converse']], 'conv-form'),
    },
    {
      id: 'conv-different', title: 'A converse is a new claim',
      paragraphs: ['Example 1 in the textbook: "If it rains, then the road is wet" is true. Its converse, "If the road is wet, then it has rained", may not be: a tanker may have spilled water.', 'The same happens with numbers. "If n is a multiple of 6, then n is a multiple of 3" is true. Its converse, "If n is a multiple of 3, then n is a multiple of 6", is false: 9 is a multiple of 3 but not of 6. A statement being true tells you nothing about its converse.'],
      misconception: { wrong: 'If a statement is true, its converse must be true too.', right: 'The converse is a different claim. It needs its own check: it may be true, or it may be false.' },
      check: pick('chk-conv-different', '"If it rains, then the road is wet" is true. What about "If the road is wet, then it has rained"?', [
        ['It may be false: the road can be wet for another reason.', null],
        ['It must be true, because the first is true.', 'A true statement does not make its converse true. The road could be wet because a tanker spilled water.', 'converse_assumed_true'],
      ], 'The converse is a separate claim and has to be checked.'),
    },
    {
      id: 'conv-backwards', title: 'You cannot go backwards for free',
      paragraphs: ['Suppose "If a number is a multiple of 6, then it is a multiple of 3" is true, and you know that 21 is a multiple of 3. Can you conclude that 21 is a multiple of 6? No. That would be using the converse, which is false here (21 is not a multiple of 6).', 'Knowing Q is true does not tell you P is true.'],
      check: pick('chk-conv-backwards', 'Statement: "If it rains, the road is wet." The road is wet. What follows?', [
        ['Nothing definite about rain: the road might be wet for another reason.', null],
        ['It rained.', 'That uses the converse, "if the road is wet then it rained". The statement only says what rain causes, not that rain is the only cause.', 'affirming_consequent'],
      ], 'From the conclusion alone you cannot go back to the hypothesis.'),
    },
  ],
  worked: {
    id: 'w-prop-l3', title: 'Form the converse and test it', given: ['"If a number is a multiple of 6, then it is a multiple of 3."'], ask: 'What is the converse? Is it true?',
    visual: GRID_63_T,
    steps: [
      { text: 'Swap the parts: "If a number is a multiple of 3, then it is a multiple of 6."', why: 'The converse of "if P then Q" is "if Q then P".' },
      { text: 'Test it. 9 is a multiple of 3 (P true for the converse) but not a multiple of 6.', why: 'One number where the first part is true and the second false disproves a statement.' },
      { text: 'So the converse is false, although the original is true.', why: 'The original and its converse are different claims.' },
    ],
    verify: 'In the grid with the converse showing, 9 has a red ring: it is a counterexample.',
  },
  guided: {
    id: 'g-prop-l3', prompt: 'Work with "If a number ends in 0, then it is divisible by 5."',
    steps: [
      { id: 'g1', prompt: 'Write the converse.', question: converseQ('g-prop-l3-1', 'If a number ends in 0, then it is divisible by 5.', 'If a number is divisible by 5, then it ends in 0.', [['If a number does not end in 0, then it is not divisible by 5.', 'That negates both parts. The converse only swaps them.', 'inverse_for_converse']], 'conv-form'), hints: ['Swap "ends in 0" and "is divisible by 5".'] },
      { id: 'g2', prompt: 'Is the converse true?', question: pick('g-prop-l3-2', 'Is "If a number is divisible by 5, then it ends in 0" true?', [['No. 15 is divisible by 5 but ends in 5.', null], ['Yes, because the original is true.', 'The original being true does not make its converse true. 15 is divisible by 5 and ends in 5.', 'converse_assumed_true']], '15 is a counterexample.', undefined, 'conv-different'), hints: ['Try 5, 10, 15, 20.'] },
    ],
    conclusion: 'The original is true, its converse is false: the converse needed its own check.',
  },
  independent: [
    ind('i1', 'Writing a converse', 'form', 'Form the converse.', converseQ('prop-l3-i1', 'If a quadrilateral is a square, then all its angles are equal.', 'If all the angles of a quadrilateral are equal, then it is a square.', [['If a quadrilateral is not a square, then its angles are not all equal.', 'That negates both parts. A converse just swaps them.', 'inverse_for_converse'], ['If a quadrilateral has equal angles, then it is not a square.', 'That changes the conclusion to its opposite instead of swapping the parts.', 'wrong_converse']], 'conv-form'), ['Swap the part after "if" with the part after "then".'], ['P: a quadrilateral is a square. Q: all its angles are equal. Converse: if Q then P.']),
    ind('i2', 'Writing a converse', 'form', 'Form the converse.', converseQ('prop-l3-i2', 'If two triangles are congruent, then they have the same area.', 'If two triangles have the same area, then they are congruent.', [['If two triangles are not congruent, then they do not have the same area.', 'That negates both parts. It is not the converse.', 'inverse_for_converse'], ['Two triangles with the same area are not congruent.', 'That is not an "if … then" statement and it changes the meaning.', 'wrong_converse']], 'conv-form'), ['Swap the two parts.'], ['The converse is "if the same area, then congruent".']),
    ind('i3', 'The converse can differ', 'different', 'Is the converse true?', truthQ('prop-l3-i3', C.mult4toEven, 'converse', 'conv-different'), ['Look for an even number that is not a multiple of 4.'], ['The converse says every even number is a multiple of 4. 6 is even but not a multiple of 4.']),
    ind('i4', 'Going backwards', 'different', 'What follows?', pick('prop-l3-i4', 'True: "If a number is a multiple of 6, then it is a multiple of 3." Also true: 21 is a multiple of 3. What can you conclude about 21?', [['Nothing about being a multiple of 6 from this statement alone.', null], ['21 is a multiple of 6.', 'That uses the converse, which is false: 21 is not a multiple of 6.', 'affirming_consequent']], 'The statement goes from 6 to 3, not from 3 to 6.', undefined, 'conv-backwards'), ['Which direction does the statement go?'], ['It only tells you about multiples of 6.']),
  ],
  reflection: {
    discover: 'The converse of "if P then Q" is "if Q then P", a different claim whose truth has to be checked separately.',
    evidence: 'You wrote converses, tested one with a number, and avoided concluding the converse from the original.',
    stillConfusing: [{ text: 'How do I form a converse?', refresherId: 'conv-form' }, { text: 'Why is the converse not automatic?', refresherId: 'conv-different' }],
  },
};

const L4: EduLesson = {
  id: 'prop-l4', unitId: 'unit-2', number: 4, title: 'Four possibilities',
  objective: 'decide whether a statement and its converse are true or false, and justify each answer with a reason or a counterexample.',
  prerequisiteIds: ['pp-number-words', 'pp-conditions'],
  objectives: [{ id: 'classify', label: 'Decide the truth of a statement and its converse' }, { id: 'justify', label: 'Justify with a counterexample' }],
  steps: [
    {
      id: 'four-combos', title: 'True or false, and its converse true or false', phase: 'observe',
      paragraphs: ['The textbook summary says: a proposition can be true while its converse is false; both can be true; and both can be false. Putting in the fourth case, there are four possibilities, because each of the two statements is either true or false.', 'Examples with numbers: multiple of 6 → multiple of 3 (true, converse false); multiple of 3 → multiple of 9 (false, converse true); square → odd number of factors (both true, textbook Example 3); prime → odd (both false).'],
      visual: claimGrid(C.mult3to9, { toggle: true }),
      notice: 'Here the original ("multiple of 3 → multiple of 9") has counterexamples; its converse has none.',
      check: pick('chk-four-combos', 'How many different combinations of "true / false" can a statement and its converse have?', [['Four', null], ['Two: both true or both false', 'A statement can be true while its converse is false, and the other way round, so there are more than two.', 'only_matching_truth'], ['One', 'There is no rule linking them, so all four can happen.', 'converse_assumed_same_truth']], 'Statement true/false times converse true/false: four.'),
    },
    {
      id: 'four-justify', title: 'How you know',
      paragraphs: ['To show a statement is FALSE, give one counterexample. To show it is TRUE you need a reason that works for every number, such as 6k = 3 × (2k). Checking some numbers is not enough.', 'The textbook (Example 3) points out that an argument can prove one direction only. Always ask which of the two statements your argument proves.'],
      check: pick('chk-four-justify', 'How do you show "If n is a multiple of 3, then n is a multiple of 9" is false?', [['Give one number such as 6: a multiple of 3 but not of 9.', null], ['Show that 9 and 18 work.', 'Examples that fit never disprove a statement. You need a number that is a multiple of 3 but not of 9.', 'supporting_example_as_counterexample']], 'One counterexample is enough: 6.'),
    },
  ],
  worked: {
    id: 'w-prop-l4', title: 'Classify "If n is prime, then n is odd"', given: ['Statement: if n is prime, then n is odd. Converse: if n is odd, then n is prime.'], ask: 'Which of the four possibilities is it?',
    steps: [
      { text: 'Test the statement: 2 is prime but even. So the statement is false.', why: 'One counterexample disproves a statement.' },
      { text: 'Test the converse: 9 is odd but not prime. So the converse is false.', why: 'Again one counterexample is enough.' },
      { text: 'Both are false.', why: 'The four possibilities are decided separately for the statement and the converse.' },
    ],
    verify: '2 and 9 are each a number for which the first part is true and the second false.',
  },
  guided: {
    id: 'g-prop-l4', prompt: 'Classify "If a number ends in 5, then it is divisible by 10" and its converse.',
    steps: [
      { id: 'g1', prompt: 'The statement.', question: truthQ('g-prop-l4-1', C.ends5to10, 'statement', 'four-justify'), hints: ['Try 5, 15, 25.'] },
      { id: 'g2', prompt: 'The converse.', question: truthQ('g-prop-l4-2', C.ends5to10, 'converse', 'four-justify'), hints: ['Try 10, 20, 30.'] },
      { id: 'g3', prompt: 'Put them together.', question: combinationQ('g-prop-l4-3', C.ends5to10, 'four-combos'), hints: ['You found a counterexample for each.'] },
    ],
    conclusion: 'Both the statement and its converse are false.',
  },
  independent: [
    ind('i1', 'Four possibilities', 'classify', 'Classify the pair.', combinationQ('prop-l4-i1', C.mult4toEven, 'four-combos'), ['Decide each direction separately.'], ['Multiple of 4 gives even (true). Even does not give multiple of 4: 6.']),
    ind('i2', 'Four possibilities', 'classify', 'Classify the pair.', combinationQ('prop-l4-i2', C.ends5to10, 'four-combos'), ['15 and 20 are useful.'], ['15 ends in 5 but is not a multiple of 10; 20 is a multiple of 10 but ends in 0.']),
    ind('i3', 'Four possibilities', 'classify', 'Classify the pair.', combinationQ('prop-l4-i3', C.mult3to9, 'four-combos', claimGrid(C.mult3to9, { toggle: true })), ['One direction fails at 6.'], ['A multiple of 9 is 3 × (3k): true. A multiple of 3 need not be a multiple of 9: 6.']),
    ind('i4', 'Giving a counterexample', 'justify', 'Find one.', counterQ('prop-l4-i4', C.ends5to10), ['Which numbers end in 5? Is each a multiple of 10?'], ['15 ends in 5 but is not a multiple of 10.']),
    ind('i5', 'Giving a counterexample', 'justify', 'Find one for the converse.', counterQ('prop-l4-i5', converseOf(C.ends5to10)), ['The converse starts from multiples of 10.'], ['20 is a multiple of 10 but does not end in 5.']),
  ],
  reflection: {
    discover: 'A statement and its converse can be true or false independently, giving four possibilities, and each answer needs its own reason or counterexample.',
    evidence: 'You classified pairs, gave counterexamples in both directions, and did not assume the converse.',
    stillConfusing: [{ text: 'Why are there four possibilities?', refresherId: 'four-combos' }],
  },
};

const L5: EduLesson = {
  id: 'prop-l5', unitId: 'unit-3', number: 5, title: 'Counterexamples',
  objective: 'say what a counterexample must satisfy, find one, and explain why many fitting examples never prove a statement.',
  prerequisiteIds: ['pp-number-words', 'pp-conditions'],
  objectives: [{ id: 'definition', label: 'Say what a valid counterexample must satisfy' }, { id: 'find', label: 'Find a counterexample' }, { id: 'limits', label: 'Explain why examples do not prove' }],
  steps: [
    {
      id: 'ce-def', title: 'A counterexample: P true and Q false', phase: 'observe',
      paragraphs: ['A situation that shows why a statement is not necessarily true is a COUNTEREXAMPLE. For "if P then Q" it is a case where P is true and Q is false.', 'Take "If n is a multiple of 3, then n is a multiple of 6". Tap numbers in the grid. 12 fits (both true). 4 does not apply (P false). 9 is a counterexample: P true, Q false.'],
      visual: claimGrid({ P: { k: 'div', by: 3 }, Q: { k: 'div', by: 6 } }),
      notice: 'Red ring with ✗: first part true, second false.',
      check: pick('chk-ce-def', 'Which number is a counterexample to "If n is a multiple of 3, then n is a multiple of 6"?', [
        ['9', null],
        ['12', '12 is a multiple of 3 and of 6. It fits the statement, so it cannot disprove it.', 'supporting_example_as_counterexample'],
        ['4', '4 is not a multiple of 3, so the first part is false. The statement does not cover 4.', 'hypothesis_false_as_counterexample'],
      ], '9 is a multiple of 3 but not of 6.'),
    },
    {
      id: 'ce-search', title: 'How to look for one',
      paragraphs: ['Make P true on purpose, then see whether Q fails. For "If n is prime, then n is odd": the smallest prime is 2, and 2 is even. Done.', 'Often the smallest numbers that satisfy P are good to try first. If you find none, that is a clue, not a proof.'],
      check: pick('chk-ce-search', 'To disprove "If n is a multiple of 4 and of 6, then n is a multiple of 24", which number do you test?', [['12: a multiple of 4 and of 6', null], ['24: a multiple of 24', '24 fits the statement. You need a number for which the first part is true and the second part is false.', 'supporting_example_as_counterexample']], '12 is a multiple of both 4 and 6 but not of 24.', undefined, 'ce-def'),
    },
    {
      id: 'ce-limits', title: 'Examples that fit never prove', phase: 'conjecture',
      paragraphs: ['The textbook tells how Fermat claimed that 2^(2^n) + 1 is prime for all n = 0, 1, 2, ... It is: 3, 5, 17, 257, 65537. Euler showed that for n = 5 the number 2^32 + 1 = 4294967297 is composite (641 × 6700417).', 'Five fitting examples did not make it true. A counterexample is a short, convincing way to show a statement is false; fitting examples are never enough to show it is true.'],
      check: pick('chk-ce-limits', 'A claim fits the first five numbers you try. What do you know?', [['It has not been disproved yet, but it is not proved.', null], ['It is proved.', 'Fermat’s claim fitted five values and was still false. Fitting examples are not a proof.', 'testing_as_proof']], 'Only a general reason proves a statement.'),
    },
  ],
  worked: {
    id: 'w-prop-l5', title: 'Disprove "If a number ends in 5, then it is divisible by 10"', given: ['Claim: if n ends in 5, then n is divisible by 10.'], ask: 'Find a counterexample.',
    steps: [
      { text: 'Choose a number that makes P true: it ends in 5. Try 15.', why: 'A counterexample must satisfy the hypothesis.' },
      { text: 'Check Q: is 15 divisible by 10? No.', why: 'A counterexample must fail the conclusion.' },
      { text: 'So 15 is a counterexample and the claim is false.', why: 'One counterexample disproves a statement.' },
    ],
    verify: 'Every number ending in 5 is odd, so none is divisible by 10. The claim fails for all of them.',
  },
  guided: {
    id: 'g-prop-l5', prompt: 'Disprove "If n is a multiple of 3, then n is a multiple of 9."',
    steps: [
      { id: 'g1', prompt: 'Make P true.', question: pick('g-prop-l5-1', 'Which numbers make "n is a multiple of 3" true?', [['3, 6, 9, 12, ...', null], ['9, 18, 27, ...', 'Those are multiples of 9. They are multiples of 3 too, but you are leaving out 3, 6, 12 and others that satisfy the first part.', 'too_narrow']], 'Any multiple of 3 makes P true.', undefined, 'ce-def'), hints: ['Count in threes.'] },
      { id: 'g2', prompt: 'Find the counterexample.', question: counterQ('g-prop-l5-2', C.mult3to9), hints: ['Which multiple of 3 is not a multiple of 9?'] },
    ],
    conclusion: '6 is a multiple of 3 but not of 9, so the statement is false.',
  },
  independent: [
    ind('i1', 'What a counterexample is', 'definition', 'Choose the counterexample.', pick('prop-l5-i1', 'For "If n is even, then n is a multiple of 4", which number is a counterexample?', [['6', null], ['8', '8 is even and a multiple of 4. It fits the statement.', 'supporting_example_as_counterexample'], ['7', '7 is not even, so the first part is false and 7 is not covered.', 'hypothesis_false_as_counterexample']], '6 is even but not a multiple of 4.', undefined, 'ce-def'), ['First part true, second part false.'], ['6: even, and 6 ÷ 4 is not whole.']),
    ind('i2', 'What a counterexample is', 'definition', 'Choose the reason.', pick('prop-l5-i2', 'Why is 10 NOT a counterexample to "If n ends in 5, then n is divisible by 10"?', [['10 does not end in 5, so the first part is false for it.', null], ['10 is divisible by 10, so it fits.', 'It does fit the conclusion, but the main reason is that the first part is false: 10 does not end in 5, so the statement does not cover 10.', 'hypothesis_false_as_counterexample']], 'A counterexample must make P true.', undefined, 'ce-def'), ['Is the first part true for 10?'], ['10 does not end in 5.']),
    ind('i3', 'Finding one', 'find', 'Find a counterexample.', counterQ('prop-l5-i3', C.primeOdd), ['What is the smallest prime?'], ['2 is prime and even.']),
    ind('i4', 'Finding one', 'find', 'Find a counterexample.', counterQ('prop-l5-i4', C.mult3to9), ['It does not have to be the smallest.'], ['Any multiple of 3 that is not a multiple of 9: 3, 6, 12, 15, ...']),
    ind('i5', 'Examples do not prove', 'limits', 'What do examples show?', pick('prop-l5-i5', 'A claim holds for every number you test from 1 to 1000. What is the right conclusion?', [['It might be true, but it is not proved. A counterexample could still exist.', null], ['It is proved.', 'Fermat’s claim held for five values and was false at the sixth. Testing is not proving.', 'testing_as_proof']], 'Only a reason that covers every number is a proof.', undefined, 'ce-limits'), ['Think about Fermat and Euler.'], ['No finite test covers all numbers.']),
    ind('i6', 'Examples do not prove', 'limits', 'Numbers from the textbook story.', pick('prop-l5-i6', 'Fermat\u2019s expression 2^(2^n) + 1 gives 3, 5, 17, 257, 65537 for n = 0 to 4, all prime. What do you conclude?', [['Not that it is always prime: Euler found that n = 5 gives a number that is not prime.', null], ['That all such numbers are prime, because five in a row were.', 'Five in a row is not a proof. For n = 5 the number is 4294967297 = 641 \u00D7 6700417.', 'testing_as_proof']], 'Fitting examples did not make it true.', undefined, 'ce-limits'), ['What did Euler show?'], ['The number for n = 5 is composite.']),
  ],
  reflection: {
    discover: 'A counterexample makes P true and Q false and disproves a statement; examples that fit never prove one.',
    evidence: 'You told counterexamples from supporting examples and from numbers the statement does not cover, and found some.',
    stillConfusing: [{ text: 'What must a counterexample satisfy?', refresherId: 'ce-def' }, { text: 'Why do examples not prove?', refresherId: 'ce-limits' }],
  },
};

const L6: EduLesson = {
  id: 'prop-l6', unitId: 'unit-3', number: 6, title: 'Numbers: factors and squares',
  objective: 'count factors using partner pairs, and say which direction a factor argument proves.',
  prerequisiteIds: ['pp-number-words'],
  objectives: [{ id: 'factors', label: 'Count factors using partner pairs' }, { id: 'squares', label: 'Connect perfect squares and an odd number of factors' }, { id: 'direction', label: 'Say which statement an argument proves' }],
  steps: [
    {
      id: 'num-factors', title: 'Factors come in partners', phase: 'observe',
      paragraphs: ['Every factor of a number has a PARTNER: the factor you multiply it by to get the number. For 12 the pairs are (1, 12), (2, 6), (3, 4). That is 6 factors, an even number.', 'Change the number below. Watch for a pair whose two members are the same: that pair counts only once.'],
      visual: { kind: 'factorPairs', props: { n: 36 }, alt: 'Factor pairs of a number you can change with the minus and plus buttons. For 36 the pairs are (1, 36), (2, 18), (3, 12), (4, 9), (6, 6), so 36 has 9 factors. The text below the pairs summarises the count and whether a pair repeats.' },
      notice: 'Try 16, 25, 36 (squares) and 12, 18, 30 (not squares). This is an observation about some numbers, not yet a reason.',
      check: pick('chk-num-factors', 'How many factors does 36 have?', [['9', null], ['10', 'The pair (6, 6) has the same number twice, so 6 counts only once. 5 pairs but one repeats: 4 × 2 + 1 = 9.', 'counted_repeat_twice'], ['5', '5 is the number of pairs. Each pair gives two factors, except the repeated pair (6, 6), which gives one.', 'counted_pairs']], '4 pairs with two factors each, plus 6 once: 9 factors.'),
    },
    {
      id: 'num-argument', title: 'What does this argument prove?', phase: 'proof',
      paragraphs: ['The textbook gives an argument (Example 3): "If a number has an odd number of factors, then it is a perfect square." Follow each step.', 'This argument starts from "odd number of factors" and ends at "perfect square", so it proves THAT statement only. It does not prove that every perfect square has an odd number of factors; that needs an extra fact (a number has at most one repeated pair), and the textbook adds it separately.'],
      proof: [
        { claim: 'Every factor f of n has a partner n ÷ f, also a factor.', reason: 'f × (n ÷ f) = n.' },
        { claim: 'If no factor is its own partner, the factors pair up, so their number is even.', reason: 'Each factor is in exactly one pair of two different numbers.' },
        { claim: 'So an odd number of factors forces some factor f to be its own partner.', reason: 'The only way to get an odd count is one pair that repeats.' },
        { claim: 'f = n ÷ f gives n = f × f, so n is a perfect square.', reason: 'Multiply both sides by f.' },
      ],
      visual: { kind: 'factorPairs', props: { n: 25 }, alt: 'Factor pairs of 25: (1, 25) and (5, 5). The pair (5, 5) repeats, so 25 has 3 factors.' },
      check: pick('chk-num-argument', 'The argument above starts from "odd number of factors" and ends at "perfect square". It proves:', [
        ['If a number has an odd number of factors, then it is a perfect square.', null],
        ['If a number is a perfect square, then it has an odd number of factors.', 'That is the other direction. The argument went from "odd number of factors" to "perfect square", so it proves the first statement. The other direction needs its own argument.', 'direction_confusion'],
      ], 'An argument proves the statement it starts and ends with, in that direction.'),
    },
  ],
  worked: {
    id: 'w-prop-l6', title: 'Why 36 has an odd number of factors', given: ['n = 36.'], ask: 'List the factor pairs and count the factors.',
    visual: { kind: 'factorPairs', props: { n: 36 }, alt: 'Factor pairs of 36: (1, 36), (2, 18), (3, 12), (4, 9), (6, 6).' },
    steps: [
      { text: 'Pairs: (1, 36), (2, 18), (3, 12), (4, 9), (6, 6).', why: 'Each factor f is paired with 36 ÷ f.' },
      { text: 'Four pairs have two different numbers: 8 factors. The pair (6, 6) adds just one more.', why: 'A repeated pair counts once.' },
      { text: '36 has 9 factors, an odd number, and 36 = 6 × 6.', why: 'A repeated pair appears exactly when the number is a perfect square.' },
    ],
    verify: 'The factors are 1, 2, 3, 4, 6, 9, 12, 18, 36: nine of them.',
  },
  guided: {
    id: 'g-prop-l6', prompt: 'Work out the factors of 16.',
    steps: [
      { id: 'g1', prompt: 'Count them.', question: factorCountQ('g-prop-l6-1', 16, 'num-factors'), hints: ['Pairs: (1, 16), (2, 8), (4, 4).'] },
      { id: 'g2', prompt: 'Is there a repeated pair?', question: pick('g-prop-l6-2', 'Which pair is repeated for 16?', [['(4, 4)', null], ['(2, 8)', 'The two members differ (2 and 8), so this is an ordinary pair.', 'wrong_pair']], '4 × 4 = 16.', undefined, 'num-factors'), hints: ['Look for a factor that multiplies by itself to give 16.'] },
    ],
    conclusion: '16 has 5 factors, an odd number, because 16 = 4 × 4 is a perfect square.',
  },
  independent: [
    ind('i1', 'Counting factors', 'factors', 'Count.', factorCountQ('prop-l6-i1', 30, 'num-factors'), ['(1, 30), (2, 15), (3, 10), (5, 6).'], ['4 pairs of different numbers: 8 factors.']),
    ind('i2', 'Counting factors', 'factors', 'Count.', factorCountQ('prop-l6-i2', 49, 'num-factors'), ['49 = 7 × 7.'], ['(1, 49) and (7, 7): 3 factors.']),
    ind('i3', 'Squares', 'squares', 'True or false?', truthQ('prop-l6-i3', C.primeSquareThreeFactors, 'statement', 'num-factors'), ['What are the factors of 16?'], ['16 is a perfect square with 5 factors, not 3.']),
    ind('i4', 'Squares', 'squares', 'True or false?', pick('prop-l6-i4', 'Is "If a number has an odd number of factors, then it is a perfect square" true?', [['True: an odd count forces a factor to be its own partner, so n = f × f.', null], ['False: 12 has an even number of factors.', '12 has 6 factors, an even number, so it is not a case for this statement: its first part is false. The statement is true.', 'hypothesis_false_as_counterexample']], 'It is true by the partner argument.', undefined, 'num-argument'), ['Use the argument from the lesson.'], ['Pairs force an even count unless a pair repeats.']),
    ind('i5', 'Which direction', 'direction', 'Which statement is proved?', pick('prop-l6-i5', 'An argument starts: "n = f × f, so the pair (f, f) repeats …" and ends: "so the number of factors is odd". Which statement does it argue for?', [['If n is a perfect square, then it has an odd number of factors.', null], ['If n has an odd number of factors, then it is a perfect square.', 'The argument starts from "perfect square" and ends at "odd number of factors". It argues for the other direction.', 'direction_confusion']], 'The statement is read from where the argument starts to where it ends.', undefined, 'num-argument'), ['What is assumed at the start?'], ['Start: n = f × f (square). End: odd number of factors.']),
    ind('i6', 'Which direction', 'direction', 'What is still needed?', pick('prop-l6-i6', 'The partner argument proves "odd number of factors \u21D2 perfect square". To prove the other direction, a perfect square has an odd number of factors, the textbook adds which fact?', [['A number cannot have more than one factor pair whose two members are the same.', null], ['Every number has an even number of factors.', 'That is false (36 has 9 factors). Squares have exactly one repeated pair, which makes the count odd.', 'wrong_fact']], 'With only one repeated pair, the count is odd.', undefined, 'num-argument'), ['How many repeated pairs can there be?'], ['At most one, because f \u00D7 f = n gives f = \u221An.']),
  ],
  reflection: {
    discover: 'Factors come in partner pairs; a perfect square has one repeated pair, so it has an odd number of factors; an argument proves only the direction it follows.',
    evidence: 'You counted factors with pairs and said which statement an argument proves.',
    stillConfusing: [{ text: 'Why do squares have an odd count?', refresherId: 'num-factors' }, { text: 'Which direction does an argument prove?', refresherId: 'num-argument' }],
  },
};

const TRI_STEPS = ISOSCELES;

const L7: EduLesson = {
  id: 'prop-l7', unitId: 'unit-4', number: 7, title: 'Geometry and converses',
  objective: 'test geometry statements and their converses on figures: equal sides and angles, equal area and congruence, equal diagonals and rectangles.',
  prerequisiteIds: ['pp-triangle-basics'],
  objectives: [{ id: 'triangle', label: 'Sides and angles of a triangle, both directions' }, { id: 'area', label: 'Equal area versus congruent' }, { id: 'diagonals', label: 'Equal diagonals versus rectangle' }],
  steps: [
    {
      id: 'geo-tri', title: 'Equal sides and equal angles', phase: 'observe',
      paragraphs: ['Statement 1: if two sides of a triangle are equal, the angles opposite them are equal. Statement 2 (its converse): if two angles are equal, the sides opposite them are equal. The textbook says Statement 1 was proved in an earlier grade and asks whether Statement 2 is true, with the hint to draw the altitude.', 'Move vertex A. When AB and AC are equal, are the angles at C and B equal? When the angles are equal, are the sides equal? Observing a few positions is not a proof; the ordering activity gives the proof.'],
      visual: { kind: 'triangle', props: { mode: 'isosceles' }, alt: 'Triangle ABC with BC fixed from (−3, 0) to (3, 0) and vertex A that you can move. The text below gives AB, AC and the angles at B and C and says whether the sides are equal and whether the angles are equal.' },
      notice: 'Look at the two yes/no lines in the readout: they change together.',
      check: pick('chk-geo-tri', 'Triangle ABC has ∠B = ∠C. What does Statement 2 tell you?', [['AB = AC (the sides opposite equal angles are equal).', null], ['Nothing: only sides give angles, not the other way.', 'The converse of Statement 1 is also true (Statement 2), so equal angles do give equal sides. You can prove it by drawing the altitude.', 'converse_assumed_false']], 'Both Statement 1 and Statement 2 are true.', undefined),
    },
    {
      id: 'geo-area', title: 'Equal area and congruent', phase: 'observe',
      paragraphs: ['Example 4: "If two triangles have the same area, then they are congruent" (false), and its converse "If two triangles are congruent, then they have the same area" (true).', 'Choose the first pair below: both triangles have area 12, but their sides are different, so they are not congruent. The second pair is congruent, and then the areas are equal.'],
      visual: { kind: 'twoTriangles', props: { kind: 'area' }, alt: 'Two pairs of triangles on a grid that you can switch between. In the first pair both triangles have area 12 but different sides (6, 4, √52 and 8, 3, √73). In the second pair one triangle is a reflection of the other, so the three sides match. The text below states the areas and whether they are congruent.' },
      check: pick('chk-geo-area', 'Which is a counterexample to "If two triangles have the same area, then they are congruent"?', [['Triangles with sides 6, 4, √52 and 8, 3, √73, each of area 12.', null], ['Two congruent triangles.', 'Congruent triangles have the same area, so they fit the statement. A counterexample needs equal areas and NOT congruent.', 'supporting_example_as_counterexample']], 'Equal areas but different sides.'),
    },
    {
      id: 'geo-sticks', title: 'Equal diagonals and rectangles (textbook Exercise 17)', phase: 'observe',
      paragraphs: ['Join the ends of two sticks used as diagonals. If the figure is a rectangle, the sticks must be equal (a theorem about rectangles). The converse says: if the diagonals are equal, then the figure is a rectangle.', 'Set both sticks to 8 and cross them in the middle: you get a rectangle. Now move the crossing points to 30% on both sticks. The diagonals are still equal, but the figure changes. Does it stay a rectangle?'],
      visual: sticksVisual(STICKS_MID, stickAlt(STICKS_MID)),
      notice: 'The readout names the figure and its angles for every setting. Equal diagonals do not stop it changing.',
      check: pick('chk-geo-sticks', 'The sticks are equal (8 and 8) and cross at 30% along each, at 70°. What is the figure?', [
        [`An isosceles trapezium, not a rectangle.`, null],
        ['A rectangle, because the diagonals are equal.', 'Equal diagonals are needed for a rectangle but they are not enough. Here the angles are not 90°: the figure is an isosceles trapezium.', 'converse_assumed_true'],
      ], 'It has equal diagonals and is not a rectangle: a counterexample to the converse.', sticksVisual(STICKS_OFF, stickAlt(STICKS_OFF))),
    },
  ],
  worked: {
    id: 'w-prop-l7', title: 'Disprove "If two triangles have the same area, then they are congruent"', given: ['Triangle 1: base 6, height 4. Triangle 2: base 8, height 3 (right triangles).'], ask: 'Show the statement is false.',
    visual: { kind: 'twoTriangles', props: { kind: 'area' }, alt: 'A triangle with legs 6 and 4 and a triangle with legs 8 and 3 side by side. Both have area 12; their sides differ.' },
    steps: [
      { text: 'Area 1 = ½ × 6 × 4 = 12.', why: 'Area of a triangle is half base times height.' },
      { text: 'Area 2 = ½ × 8 × 3 = 12. The areas are equal, so P is true.', why: 'A counterexample must make P true.' },
      { text: 'The sides are different (for example 6 ≠ 8), so the triangles are not congruent: Q is false.', why: 'Congruent triangles have equal corresponding sides.' },
    ],
    verify: 'One example with equal area and unequal sides is enough to disprove the statement.',
  },
  guided: {
    id: 'g-prop-l7', prompt: 'Explore equal diagonals with two sticks.',
    steps: [
      { id: 'g1', prompt: 'Sticks 8 and 8, crossing in the middle.', question: sticksShapeQ('g-prop-l7-1', STICKS_MID, 'geo-sticks'), hints: ['Equal diagonals that bisect each other.'] },
      { id: 'g2', prompt: 'Same sticks, crossing at 30% on each.', question: sticksShapeQ('g-prop-l7-2', STICKS_OFF, 'geo-sticks'), hints: ['Check the angles in the readout.'] },
      { id: 'g3', prompt: 'Draw the conclusion.', question: pick('g-prop-l7-3', 'What do these two figures show about "If a quadrilateral has equal diagonals, then it is a rectangle"?', [['It is false: the second figure has equal diagonals but is not a rectangle.', null], ['It is true: both figures had equal diagonals.', 'One figure that fits does not prove the statement. The second figure has equal diagonals and is not a rectangle, so it disproves it.', 'testing_as_proof']], 'One counterexample is enough.', undefined, 'geo-sticks'), hints: ['Is there a counterexample?'] },
    ],
    conclusion: 'A rectangle always has equal diagonals, but equal diagonals do not force a rectangle.',
  },
  independent: [
    ind('i1', 'Triangle sides and angles', 'triangle', 'Which statement?', pick('prop-l7-i1', 'In triangle PQR, PQ = PR. What is true?', [['∠Q = ∠R (the angles opposite the equal sides are equal).', null], ['∠P = ∠Q.', '∠P is between the equal sides. The angles opposite the equal sides are ∠R (opposite PQ) and ∠Q (opposite PR).', 'wrong_opposite']], 'Equal sides give equal opposite angles.', undefined, 'geo-tri'), ['Which angles are opposite PQ and PR?'], ['∠R is opposite PQ and ∠Q is opposite PR.']),
    ind('i2', 'Proof of Statement 2', 'triangle', 'Arrange the steps.', orderQ('prop-l7-i2', 'Prove Statement 2 (equal angles give equal sides) using the altitude. Arrange the steps so that each one relies only on earlier steps.', TRI_STEPS, ['a5', 'a3', 'a0', 'a4', 'a2', 'a1'], 'Given ∠B = ∠C. Draw the altitude AD. Then ∠ADB = ∠ADC = 90° and AD is common, so the triangles are congruent (AAS) and AB = AC.', { kind: 'triangle', props: { mode: 'altitude', highlight: ['AD'] }, alt: 'An isosceles triangle ABC with the altitude AD dashed from A to the midpoint D of BC, right angles marked at D, and equal angles marked at B and C.' }), ['Which steps use nothing else?'], ['The given and the construction come first; the congruence needs all three facts; the conclusion comes last.']),
    ind('i3', 'Equal area is not congruence', 'area', 'Decide.', pick('prop-l7-i3', 'Two triangles have the same area. Does that make them congruent?', [['No. Triangles with sides 6, 4, √52 and 8, 3, √73 both have area 12 and are not congruent.', null], ['Yes, because equal areas mean equal shapes.', 'Many different triangles share an area (half base times height can be 12 in many ways). Congruent needs equal sides.', 'area_means_congruent']], 'Equal area is not enough.', { kind: 'twoTriangles', props: { kind: 'area' }, alt: 'Two triangles with equal area 12 but different sides, shown on a grid.' }, 'geo-area'), ['Try base 6, height 4 and base 8, height 3.'], ['Both give 12, but the sides differ.']),
    ind('i4', 'Congruent gives equal area', 'area', 'True or false?', pick('prop-l7-i4', 'Is "If two triangles are congruent, then they have the same area" true?', [['True: congruent triangles can be placed exactly on each other, so they cover the same region.', null], ['False: congruent triangles can have different areas.', 'Congruent triangles are the same shape and size, so their areas must be equal.', 'converse_assumed_same_truth']], 'It is true.', undefined, 'geo-area'), ['What does congruent mean?'], ['One triangle fits exactly over the other.']),
    ind('i5', 'Equal diagonals', 'diagonals', 'Name the figure.', sticksShapeQ('prop-l7-i5', { len1: 6, len2: 6, t1: 0.5, t2: 0.5, angle: 60 }, 'geo-sticks'), ['Equal sticks that cross in the middle.'], ['Equal diagonals bisecting each other give a rectangle.']),
    ind('i6', 'Equal diagonals', 'diagonals', 'Decide.', pick('prop-l7-i6', 'A quadrilateral has equal diagonals. Must it be a rectangle?', [['No. An isosceles trapezium has equal diagonals and is not a rectangle.', null], ['Yes, every quadrilateral with equal diagonals is a rectangle.', 'Move the crossing points off the middle with both sticks equal: the figure is an isosceles trapezium.', 'converse_assumed_true']], 'The converse is false.', sticksVisual(STICKS_OFF, stickAlt(STICKS_OFF)), 'geo-sticks'), ['Is there a counterexample?'], ['The isosceles trapezium.']),
    ind('i7', 'Going backwards in geometry', 'diagonals', 'What follows?', pick('prop-l7-i7', 'True: "If a quadrilateral is a rectangle, then its diagonals are equal." A quadrilateral has equal diagonals. What can you conclude?', [['Nothing definite about it being a rectangle: the statement goes from rectangle to equal diagonals, not back.', null], ['That it is a rectangle.', 'That uses the converse, which is false (an isosceles trapezium has equal diagonals).', 'affirming_consequent']], 'The statement only runs one way.', undefined, 'geo-sticks'), ['Which direction does the true statement go?'], ['From rectangle to equal diagonals.']),
    ind('i8', 'Given and to prove', 'triangle', 'Separate what is assumed from what is shown.', pick('prop-l7-i8', 'To prove Statement 2 ("If two angles of a triangle are equal, then the sides opposite them are equal") for triangle ABC, what is GIVEN and what must be PROVED?', [['Given: ∠B = ∠C. To prove: AB = AC.', null], ['Given: AB = AC. To prove: ∠B = ∠C.', 'That is Statement 1 (the original). Statement 2 starts from the equal angles and must end at the equal sides.', 'direction_confusion'], ['Given: nothing. To prove: the triangle is isosceles and ∠B = ∠C.', 'The hypothesis (equal angles) is given. Assuming it is what lets you start; the thing to prove is only the conclusion.', 'assumption_vs_conclusion']], 'Given is the hypothesis (equal angles); to prove is the conclusion (equal sides).', undefined, 'geo-tri'), ['Which part is after "if", which after "then"?'], ['Given (after "if"): ∠B = ∠C. To prove (after "then"): AB = AC.']),
  ],
  reflection: {
    discover: 'Some geometry converses are true (equal angles give equal sides), some are false (equal area does not give congruent, equal diagonals do not give a rectangle).',
    evidence: 'You tested figures, found counterexamples, and arranged the proof of Statement 2.',
    stillConfusing: [{ text: 'When does a geometry converse hold?', refresherId: 'geo-tri' }, { text: 'Why is equal area not enough?', refresherId: 'geo-area' }],
  },
};

const L8: EduLesson = {
  id: 'prop-l8', unitId: 'unit-4', number: 8, title: 'The Baudhāyana–Pythagoras theorem and its converse',
  objective: 'state the theorem and its converse, use the converse to decide whether a triangle has a right angle, and arrange the proof of the converse.',
  prerequisiteIds: ['pp-triangle-basics'],
  objectives: [{ id: 'statement', label: 'State the theorem and its converse' }, { id: 'use', label: 'Use a² + b² = c² to decide about a right angle' }, { id: 'proof', label: 'Arrange the proof of the converse' }],
  steps: [
    {
      id: 'pyth-observe', title: 'Right angle and a² + b² = c²', phase: 'observe',
      paragraphs: ['Textbook Example 5: Let a, b, c be the sides of a triangle. If the triangle is right-angled, then a² + b² = c² (the Baudhāyana–Pythagoras theorem). Its converse: if a² + b² = c², then the triangle is right-angled.', 'Here a = 3 and b = 4. Change the angle at C and watch c, and compare a² + b² = 25 with c². They are equal only when the angle is 90° (an observation, and the textbook proves it in general). Going beyond the chapter: if c² is smaller the angle is acute, if bigger it is obtuse, when c is the longest side.'],
      visual: { kind: 'triangle', props: { mode: 'pythagoras', a: 3, b: 4, angle: 60 }, alt: 'A triangle with sides a = 3 and b = 4 meeting at angle C, which you change with the buttons. The text below gives c, compares a squared plus b squared (25) with c squared and says whether the angle at C is acute, right or obtuse.' },
      notice: 'Use the ±5° buttons to reach 90° and read the comparison.',
      check: pick('chk-pyth-observe', 'Which is the CONVERSE of "If a triangle is right-angled, then a² + b² = c²"?', [['If a² + b² = c², then the triangle is right-angled.', null], ['If a triangle is not right-angled, then a² + b² ≠ c².', 'That negates both parts. The converse only swaps them.', 'inverse_for_converse']], 'Swap the parts: "if a² + b² = c², then right-angled".'),
    },
    {
      id: 'pyth-proof', title: 'Why the converse is true', phase: 'proof',
      paragraphs: ['Measuring tells you about the triangles you tried. The textbook proves the converse for every triangle with the following argument. Select each step to see the matching part of the figure.'],
      proof: [
        { claim: 'Given: △ABC has a² + b² = c².', reason: 'This is the hypothesis of the converse.', show: ['ABC'] },
        { claim: 'Draw a right triangle XYZ with legs a and b (right angle at Z).', reason: 'We can always draw a right triangle with two given leg lengths.', show: ['XYZ'] },
        { claim: 'XY² = a² + b².', reason: 'The Baudhāyana–Pythagoras theorem for the right triangle XYZ.', show: ['XYZ', 'XY'] },
        { claim: 'So XY² = c² and XY = c.', reason: 'a² + b² = c² by the hypothesis, and lengths are positive.', show: ['XY', 'AB'] },
        { claim: '△ABC ≅ △XYZ.', reason: 'Three pairs of equal sides (SSS).', show: ['ABC', 'XYZ'] },
        { claim: 'So ∠C = ∠Z = 90°.', reason: 'Matching angles of congruent triangles are equal.', show: ['ABC', 'XYZ'] },
      ],
      visual: { kind: 'twoTriangles', props: { kind: 'pythProof' }, alt: 'Two triangles side by side. Triangle ABC has sides a = 5, b = 12 and c = 13. Triangle XYZ is a right triangle with legs 5 and 12; its hypotenuse XY is the side the proof finds.' },
      check: pick('chk-pyth-proof', 'Which fact makes triangles ABC and XYZ congruent?', [['Three pairs of equal sides (SSS).', null], ['They look the same.', 'Looks are not a reason. The proof shows all three side lengths match: a, b and XY = c.', 'appearance_as_reason']], 'SSS: a = a, b = b, c = XY.'),
    },
  ],
  worked: {
    id: 'w-prop-l8', title: 'Is a triangle with sides 6, 8, 10 right-angled?', given: ['Sides 6, 8, 10 (10 is the longest).'], ask: 'Does it have a right angle?',
    steps: [
      { text: 'Square the two shorter sides and add: 36 + 64 = 100.', why: 'This is a² + b².' },
      { text: 'Square the longest side: 10² = 100.', why: 'This is c².' },
      { text: 'They are equal, so by the converse the triangle is right-angled (the right angle is opposite the side 10).', why: 'The converse: if a² + b² = c², then right-angled.' },
    ],
    verify: 'It is the 3-4-5 triangle doubled.',
  },
  guided: {
    id: 'g-prop-l8', prompt: 'Decide for a triangle with sides 5, 12, 13.',
    steps: [
      { id: 'g1', prompt: 'Add the squares of the two shorter sides.', question: { kind: 'numeric', id: 'g-prop-l8-1', prompt: 'What is 5² + 12²?', answer: 169, rules: [{ values: [17], entry: { message: '17 is 5 + 12. Square each side first: 25 + 144.', refresherId: 'pyth-observe', misconception: 'added_not_squared' } }, { values: [60], entry: { message: '60 is 5 × 12. Add the squares: 5² + 12².', refresherId: 'pyth-observe', misconception: 'multiplied' } }], defaultFeedback: { message: 'Compute 5 × 5 and 12 × 12, then add.', refresherId: 'pyth-observe' }, explanation: '25 + 144 = 169.' }, hints: ['5² = 25, 12² = 144.'] },
      { id: 'g2', prompt: 'Compare with the square of the longest side.', question: pick('g-prop-l8-2', 'How does 169 compare with 13²?', [['They are equal: 13² = 169.', null], ['13² is bigger.', '13 × 13 = 169, exactly the same.', 'arithmetic_slip']], '13 × 13 = 169.', undefined, 'pyth-observe'), hints: ['13 × 13.'] },
      { id: 'g3', prompt: 'Conclude.', question: pick('g-prop-l8-3', 'What does the converse tell you?', [['The triangle is right-angled.', null], ['Nothing, because we only checked numbers.', 'The converse is a proved statement about every triangle: if a² + b² = c² then the triangle is right-angled.', 'testing_as_proof']], 'a² + b² = c² gives a right angle.', undefined, 'pyth-proof'), hints: ['Which theorem goes from the equation to the angle?'] },
    ],
    conclusion: '5² + 12² = 13², so the triangle with sides 5, 12, 13 is right-angled.',
  },
  independent: [
    ind('i1', 'Statement and converse', 'statement', 'Pick the statement.', pick('prop-l8-i1', 'Which is the Baudhāyana–Pythagoras theorem (not its converse)?', [['If a triangle is right-angled, then a² + b² = c².', null], ['If a² + b² = c², then the triangle is right-angled.', 'That is the converse. The theorem starts from the right angle.', 'direction_confusion']], 'The theorem starts from the right angle.', undefined, 'pyth-observe'), ['Which one starts from the right angle?'], ['Right angle first: the theorem.']),
    ind('i2', 'Statement and converse', 'statement', 'True or false?', pick('prop-l8-i2', 'The theorem and its converse are:', [['Both true.', null], ['The theorem is true; its converse is false.', 'The textbook proves the converse by constructing a second right triangle and using SSS. Both are true.', 'converse_assumed_false']], 'Both are true (Example 5).', undefined, 'pyth-proof'), ['Recall the proof with triangle XYZ.'], ['The converse is proved with SSS.']),
    ind('i3', 'Using the converse', 'use', 'Decide.', pick('prop-l8-i3', 'A triangle has sides 7, 24, 25. Is it right-angled?', [['Yes: 49 + 576 = 625 = 25².', null], ['No: 7 + 24 = 31, not 25.', 'The test uses squares: 7² + 24² = 625 = 25², so it is right-angled.', 'added_not_squared']], '49 + 576 = 625.', undefined, 'pyth-observe'), ['Square before you add.'], ['7² + 24² = 625 = 25².']),
    ind('i4', 'Using the converse', 'use', 'Decide.', pick('prop-l8-i4', 'A triangle has sides 4, 5, 7. Is it right-angled?', [['No: 16 + 25 = 41, which is not 49.', null], ['Yes: it is close enough.', 'a² + b² must equal c² exactly. 41 ≠ 49. (Going beyond the chapter: 41 < 49 means the largest angle is more than 90°.)', 'close_enough']], '4² + 5² = 41 and 7² = 49.', undefined, 'pyth-observe'), ['7 is the longest side.'], ['41 ≠ 49, so no right angle.']),
    ind('i5', 'Arranging the proof', 'proof', 'Arrange the steps of the converse proof.', orderQ('prop-l8-i5', 'Arrange the steps that prove the converse of the Baudhāyana–Pythagoras theorem. Each step may use only the given and earlier steps.', PYTH_CONVERSE, ['p5', 'p3', 'p0', 'p4', 'p2', 'p1'], 'Given a² + b² = c². Build the right triangle XYZ with legs a and b. XY² = a² + b² = c², so XY = c. The triangles are congruent (SSS), so ∠C = 90°.', { kind: 'twoTriangles', props: { kind: 'pythProof' }, alt: 'Triangle ABC with sides 5, 12, 13 and a right triangle XYZ with legs 5 and 12 whose hypotenuse is to be found.' }), ['What must exist before you can use the theorem on XYZ?'], ['XYZ is built first; XY² uses the theorem; XY = c needs the given.']),
    ind('i6', 'Reasons in the proof', 'proof', 'Pick the reason.', pick('prop-l8-i6', 'In the proof of the converse, what gives XY\u00B2 = a\u00B2 + b\u00B2?', [['The Baudh\u0101yana\u2013Pythagoras theorem applied to the right triangle XYZ.', null], ['The converse itself.', 'The converse is what is being proved. Using it would be circular. The theorem for the right triangle XYZ gives this.', 'circular_reasoning']], 'The theorem applies because XYZ has a right angle by construction.', undefined, 'pyth-proof'), ['Which triangle has the right angle by construction?'], ['XYZ.']),
  ],
  reflection: {
    discover: 'The theorem and its converse are both true: a triangle is right-angled exactly when a² + b² = c² for its longest side c.',
    evidence: 'You used the converse on triangles and arranged the proof built from a second right triangle.',
    stillConfusing: [{ text: 'What is the converse?', refresherId: 'pyth-observe' }, { text: 'Why is the converse true?', refresherId: 'pyth-proof' }],
  },
};

const L9: EduLesson = {
  id: 'prop-l9', unitId: 'unit-5', number: 9, title: 'Why testing is not proof',
  objective: 'explain why checking many cases cannot prove a statement about all numbers, and what a proof must do instead.',
  prerequisiteIds: ['pp-letters', 'pp-number-words'],
  objectives: [{ id: 'evidence', label: 'Explain why checking many cases is not a proof' }, { id: 'universal', label: 'Say what a proof must do' }],
  steps: [
    {
      id: 'proof-evidence', title: 'A pattern that breaks', phase: 'observe',
      paragraphs: ['Fermat checked and believed that 2^(2^n) + 1 is always prime; Euler found n = 5 gives a composite. Here is another famous case (an extension, not in the chapter): n² + n + 41 gives a prime for n = 0, 1, 2, ... 39, forty values in a row.', 'Test more numbers with the button. Does forty successes prove it for all n?'],
      visual: { kind: 'eulerStrip', props: { c: 41, to: 34 }, alt: 'A strip of values of n squared plus n plus 41 starting at n = 0. Each is marked prime or, if not, shown as a product of two factors. The button adds five more values. The text below says whether the formula has failed yet.' },
      notice: 'Press "Test 5 more numbers" until something happens.',
      check: pick('chk-proof-evidence', 'The expression gave a prime 40 times in a row. What does that prove?', [['Nothing about all n: it later fails.', null], ['That it gives a prime for every n.', 'It fails at n = 40: 40² + 40 + 41 = 41 × 41. Forty successes were still not a proof.', 'testing_as_proof']], 'A long run of successes is not a proof.'),
    },
    {
      id: 'proof-general', title: 'What a proof does', phase: 'proof',
      paragraphs: ['A proof must cover every case at once. We cannot list all even numbers, so we write a general even number as 2m (m any whole number) and reason with the letter. That is why this argument proves "the sum of two even numbers is even" for all of them.'],
      proof: [
        { claim: 'a = 2m and b = 2k for some whole numbers m and k.', reason: 'This is what "even" means.' },
        { claim: 'a + b = 2m + 2k = 2(m + k).', reason: 'Add, then factor out 2.' },
        { claim: 'm + k is a whole number, so a + b is even.', reason: 'The sum of two whole numbers is a whole number.' },
      ],
      check: pick('chk-proof-general', 'Why does the argument with 2m and 2k cover ALL even numbers?', [['Because m and k can be any whole numbers, so 2m and 2k stand for every even number.', null], ['Because we also tried 2 + 4 and 6 + 8.', 'Trying examples is not what makes it a proof. The letters m and k stand for any whole number, so the reasoning applies to all of them.', 'testing_as_proof']], 'The letters stand for any numbers.'),
    },
  ],
  worked: {
    id: 'w-prop-l9', title: 'When does n² + n + 41 first fail?', given: ['f(n) = n² + n + 41, tested for n = 0, 1, 2, ...'], ask: 'Find the first n that does not give a prime.',
    visual: { kind: 'eulerStrip', props: { c: 41, to: 44 }, alt: 'Values of n squared plus n plus 41 from n = 0 to 44; all are prime until n = 40.' },
    steps: [
      { text: 'For n = 0 to 39 the values 41, 43, 47, ... are all prime.', why: 'These can be checked one by one.' },
      { text: 'At n = 40: 40² + 40 + 41 = 1600 + 40 + 41 = 1681.', why: 'Compute the value.' },
      { text: '1681 = 41 × 41, so it is not prime.', why: 'One counterexample disproves "always prime".' },
    ],
    verify: 'The pattern held 40 times and still failed.',
  },
  guided: {
    id: 'g-prop-l9', prompt: 'Try the claim "n² + n + 11 is prime for every n".',
    steps: [
      { id: 'g1', prompt: 'Find the first failure.', question: firstFailureQ('g-prop-l9-1', 11, 'proof-evidence'), hints: ['Test n = 0, 1, 2, ... Look for a factor.'] },
      { id: 'g2', prompt: 'Decide.', question: pick('g-prop-l9-2', 'The values were prime for n = 0 to 9. What does that show?', [['Not that it is always prime: it fails at n = 10.', null], ['That it is always prime.', 'At n = 10 the value is 121 = 11 × 11. A run of ten successes did not prove the claim.', 'testing_as_proof']], 'Ten successes, then a failure.', undefined, 'proof-evidence'), hints: ['Compare with Euler’s polynomial.'] },
    ],
    conclusion: 'The claim fails at n = 10 (121 = 11 × 11), after ten values in a row that were prime.',
  },
  independent: [
    ind('i1', 'Testing is not proof', 'evidence', 'Find the failure.', firstFailureQ('prop-l9-i1', 41, 'proof-evidence'), ['It is a lot more than ten.'], ['40² + 40 + 41 = 41 × 41.']),
    ind('i2', 'Testing is not proof', 'evidence', 'Decide.', pick('prop-l9-i2', 'A claim has been checked on the first trillion natural numbers by a computer. Is it proved?', [['No. A counterexample could still exist beyond the numbers checked, and only a general reason proves it.', null], ['Yes. A trillion is plenty.', 'A trillion numbers is still a finite check. Only a reason that covers all numbers is a proof.', 'testing_as_proof']], 'Finite checking never proves a statement about all numbers.', undefined, 'proof-evidence'), ['What did Fermat’s claim teach?'], ['A finite check leaves infinitely many numbers unchecked.']),
    ind('i3', 'What a proof does', 'universal', 'Which is a proof?', pick('prop-l9-i3', 'Which argument proves "the sum of two odd numbers is even"?', [['Let a = 2m + 1 and b = 2k + 1. Then a + b = 2(m + k + 1), which is even.', null], ['1 + 3 = 4, 5 + 7 = 12, 9 + 11 = 20: all even.', 'These are examples. They fit, but they do not cover all odd numbers.', 'testing_as_proof']], 'The letters m and k cover every pair.', undefined, 'proof-general'), ['Which argument uses letters for any numbers?'], ['The letters stand for any whole numbers.']),
    ind('i4', 'What a proof does', 'universal', 'Choose the reason.', pick('prop-l9-i4', 'In the proof, why is a + b = 2m + 2k = 2(m + k)?', [['Factor out the common 2 (the distributive property).', null], ['Because we tested it.', 'A proof step needs a reason such as a rule, not a test. Here the reason is factoring out 2.', 'testing_as_proof']], 'The distributive property.', undefined, 'proof-general'), ['What operation turns 2m + 2k into 2(m + k)?'], ['Factoring out the common factor 2.']),
  ],
  reflection: {
    discover: 'Checking cases, however many, cannot prove a statement about all numbers; a proof uses letters for any number and justifies every step.',
    evidence: 'You watched a pattern fail after forty successes and chose general arguments over lists of examples.',
    stillConfusing: [{ text: 'Why is testing not enough?', refresherId: 'proof-evidence' }, { text: 'What does a proof do?', refresherId: 'proof-general' }],
  },
};

const L10: EduLesson = {
  id: 'prop-l10', unitId: 'unit-5', number: 10, title: 'Building an argument',
  objective: 'put proof steps in a valid order, choose a justification for each step, and spot arguments that do not prove what they claim.',
  prerequisiteIds: ['pp-letters'],
  objectives: [{ id: 'order', label: 'Arrange proof steps in a valid order' }, { id: 'justify', label: 'Choose the right justification' }, { id: 'spot', label: 'Spot an invalid argument' }],
  steps: [
    {
      id: 'arg-order', title: 'Each step uses what came before',
      paragraphs: ['A proof is a list of steps from what is GIVEN to what you want to prove. Each step either is given or follows from earlier steps. You cannot use a fact before you have shown it.', 'Many proofs have more than one valid order: two independent first steps can swap. What matters is that nothing is used before it is available.'],
      check: pick('chk-arg-order', 'In the proof that a multiple of 6 is a multiple of 3, which step must come before "n = 3 × (2k)"?', [['n = 6k for some whole number k', null], ['2k is a whole number, so n is a multiple of 3', 'That is the conclusion. It comes last, after n = 3 × (2k).', 'conclusion_first']], 'You need n = 6k before you can rewrite it.'),
    },
    {
      id: 'arg-reasons', title: 'Every step needs a reason',
      paragraphs: ['Typical reasons: "by the definition of even (2m)", "by the given", "factoring out a common factor", "regrouping the factors of a product", "by a theorem we already know (such as SSS)".', 'A reason must really justify the step. "It looked right" and "I tested it" are not reasons.'],
      check: pick('chk-arg-reasons', 'Which is a reason for "n = 6k"?', [['Definition of "n is a multiple of 6" (given).', null], ['I tried n = 12 and it worked.', 'A test is not a reason. The step follows from what "multiple of 6" means.', 'testing_as_proof']], 'The definition of a multiple.'),
    },
    {
      id: 'arg-spot', title: 'Arguments that fail',
      paragraphs: ['Three common failures: (1) using the conclusion to prove itself (circular); (2) going the wrong direction, such as using the converse; (3) offering examples instead of a general reason.', 'Example of (1): "Triangle ABC has three equal angles. Why? Because it is equilateral." If equilateral is what we are trying to prove, we have assumed it.'],
      check: pick('chk-arg-spot', '"Because AB = AC, ∠B = ∠C. So ∠B = ∠C implies AB = AC." What is wrong?', [['It uses the statement as its own proof: it goes from AB = AC to AB = AC.', null], ['Nothing is wrong.', 'The argument assumes AB = AC at the start, which is what it wants to prove. It is circular.', 'circular_reasoning']], 'Circular: it assumes the conclusion.'),
    },
  ],
  worked: {
    id: 'w-prop-l10', title: 'Prove: a multiple of 6 is a multiple of 3', given: ['n is a multiple of 6.'], ask: 'Show n is a multiple of 3, with a reason for each step.',
    steps: [
      { text: 'n = 6k for some whole number k.', why: 'Definition of a multiple of 6.' },
      { text: 'n = 3 × 2 × k = 3 × (2k).', why: 'Write 6 = 3 × 2 and regroup the product.' },
      { text: '2k is a whole number, so n is a multiple of 3.', why: 'Definition of a multiple of 3, using that 2 × a whole number is a whole number.' },
    ],
    verify: 'This works for every multiple of 6 because k can be any whole number.',
  },
  guided: {
    id: 'g-prop-l10', prompt: 'Build the proof that the sum of two even numbers is even.',
    steps: [
      { id: 'g1', prompt: 'Arrange the steps.', question: orderQ('g-prop-l10-1', 'Arrange the five steps of the proof that the sum of two even numbers is even.', SUM_EVEN, ['s4', 's2', 's5', 's1', 's3'], 'a = 2m and b = 2k, then a + b = 2m + 2k = 2(m + k), which is 2 times a whole number.'), hints: ['The two "definition of even" steps need nothing else.', 'Adding comes before factoring.'] },
      { id: 'g2', prompt: 'Give a reason.', question: pick('g-prop-l10-2', 'What justifies "2m + 2k = 2(m + k)"?', [['Factoring out the common factor 2.', null], ['The definition of an even number.', 'The definition gave a = 2m and b = 2k earlier. This step is just rewriting the sum by factoring.', 'wrong_reason']], 'Factor out 2.', undefined, 'arg-reasons'), hints: ['What did you do to the expression?'] },
    ],
    conclusion: 'a + b = 2(m + k) with m + k a whole number, so a + b is even.',
  },
  independent: [
    ind('i1', 'Arranging steps', 'order', 'Arrange the proof.', orderQ('prop-l10-i1', 'Arrange the steps that prove "a multiple of 6 is a multiple of 3".', MULT6, ['d3', 'd1', 'd4', 'd2'], 'n = 6k, so n = 3 × 2 × k = 3 × (2k), a multiple of 3.'), ['What is the starting fact?'], ['n = 6k, then rewrite, then regroup, then conclude.']),
    ind('i2', 'Arranging steps', 'order', 'Arrange the proof.', orderQ('prop-l10-i2', 'Arrange the steps that prove "a number with an odd number of factors is a perfect square" (textbook Example 3).', ODD_FACTORS, ['f5', 'f3', 'f1', 'f4', 'f0', 'f2'], 'Partners pair up the factors unless one factor is its own partner; an odd count forces that, so n = f × f.', { kind: 'factorPairs', props: { n: 36 }, alt: 'Factor pairs of a number you can change; for 36 the pairs include (6, 6), which repeats.' }), ['Which steps do not need anything?'], ['The given and the partner fact come first; then pairing, then the self-partner, then n = f × f.']),
    ind('i3', 'Choosing a reason', 'justify', 'Pick the reason.', pick('prop-l10-i3', 'In the proof that a multiple of 6 is a multiple of 3, what justifies "n = 3 × (2k)" from "n = 3 × 2 × k"?', [['Regrouping the factors of a product.', null], ['The definition of a multiple of 6.', 'That justified the first step (n = 6k). This step only regroups 3 × 2 × k as 3 × (2k).', 'wrong_reason'], ['It was true for n = 12.', 'A test is not a reason.', 'testing_as_proof']], 'Multiplication can be regrouped.', undefined, 'arg-reasons'), ['What changed between the two lines?'], ['Only the grouping changed.']),
    ind('i4', 'Choosing a reason', 'justify', 'Pick the reason.', pick('prop-l10-i4', 'Why can the proof say "m + k is a whole number"?', [['The sum of two whole numbers is a whole number.', null], ['Because m and k are even.', 'm and k are just whole numbers. 2m and 2k are the even numbers.', 'wrong_reason']], 'Whole numbers are closed under addition.', undefined, 'arg-reasons'), ['What kind of numbers are m and k?'], ['Whole numbers.']),
    ind('i5', 'Spotting a flaw', 'spot', 'Find the flaw.', pick('prop-l10-i5', '"If n is a multiple of 3 then n is a multiple of 6. Proof: n = 6k, so n is a multiple of 6." What is wrong?', [['It assumes n = 6k, which is the conclusion, not the given.', null], ['Nothing, it is a correct proof.', 'It starts from what it wants to show. In fact the statement is false: 9 is a multiple of 3 but not of 6.', 'circular_reasoning']], 'The proof assumes the conclusion, and the statement is false.', undefined, 'arg-spot'), ['What was given and what was assumed?'], ['Given: n is a multiple of 3. The proof assumed n = 6k.']),
    ind('i6', 'Spotting a flaw', 'spot', 'Find the flaw.', pick('prop-l10-i6', '"2 + 4 = 6, 8 + 10 = 18, 6 + 12 = 18, all even, so the sum of two even numbers is always even." Why is this not a proof?', [['It checks only a few cases and gives no reason that covers all even numbers.', null], ['Because the numbers are too small.', 'The size does not matter. Any list of examples is not a proof.', 'testing_as_proof']], 'Examples do not prove.', undefined, 'arg-spot'), ['What would cover all even numbers?'], ['A reason using letters such as 2m and 2k.']),
    ind('i7', 'Spotting a flaw', 'spot', 'Which statement was proved?', pick('prop-l10-i7', 'A student wants to prove "If P then Q". The argument starts by assuming Q and finishes with P. What has been proved?', [['The converse, "If Q then P", not the statement asked for.', null], ['"If P then Q", as required.', 'Look at where the argument starts and ends: it starts from Q and ends at P, so it argues for "if Q then P".', 'direction_confusion']], 'An argument proves the statement it starts and ends with, in that direction.', undefined, 'arg-spot'), ['What did the argument assume at the start?'], ['It assumed Q, so it goes from Q to P.']),
  ],
  reflection: {
    discover: 'A proof is steps in a valid order, each with a real reason; circular arguments, wrong direction and lists of examples do not prove.',
    evidence: 'You arranged three different proofs, chose reasons, and spotted invalid arguments.',
    stillConfusing: [{ text: 'What order do the steps go in?', refresherId: 'arg-order' }, { text: 'What counts as a reason?', refresherId: 'arg-reasons' }, { text: 'How do I spot a bad argument?', refresherId: 'arg-spot' }],
  },
};

const L11: EduLesson = {
  id: 'prop-l11', unitId: 'unit-6', number: 11, title: 'Putting it together',
  objective: 'translate a claim into "if P then Q", decide the truth of it and its converse with a counterexample or a proof, and say how P and Q relate (extension).',
  prerequisiteIds: ['pp-conditions', 'pp-letters'],
  objectives: [{ id: 'translate', label: 'Translate a claim into "if P then Q"' }, { id: 'decide', label: 'Decide a claim and its converse' }, { id: 'argue', label: 'Build or judge an argument' }],
  steps: [
    {
      id: 'syn-plan', title: 'A plan for any statement',
      paragraphs: ['Given a statement: (1) write it as "if P then Q"; (2) write its converse; (3) test each with numbers or a figure, looking for a counterexample; (4) if you find none, look for a general reason (a proof); (5) say which direction each argument proves.', 'Example (textbook Exercise 8 style): "If n is divisible by 24, then it is divisible by both 4 and 6." True: 24k = 4 × (6k) = 6 × (4k). The converse is false: 12 is divisible by both 4 and 6 but not by 24.'],
      visual: claimGrid(C.mult24to46, { toggle: true }),
      notice: 'Switch to the converse and look for the counterexample (12, 36, ...).',
      check: pick('chk-syn-plan', 'You cannot find a counterexample to a statement after testing many numbers. What next?', [['Look for a general reason (a proof).', null], ['Decide it is true.', 'Not finding a counterexample is not a proof. Look for a reason that covers every case.', 'testing_as_proof']], 'A proof is needed.'),
    },
    {
      id: 'syn-necsuff', title: 'Necessary and sufficient (extension)',
      paragraphs: ['If "if P then Q" is true, P is SUFFICIENT for Q (P is enough), and Q is NECESSARY for P (without Q, P cannot hold). Being a multiple of 6 is sufficient for being a multiple of 3; being a multiple of 3 is necessary for being a multiple of 6.', 'Being even is necessary for being a multiple of 6, but not sufficient: 4 is even and not a multiple of 6. These words go beyond the chapter; they describe the same "if P then Q".'],
      check: pick('chk-syn-necsuff', 'Is "n is even" necessary, sufficient, or both, for "n is a multiple of 6"?', [['Necessary but not sufficient.', null], ['Sufficient.', 'Being even is not enough: 4 is even but not a multiple of 6.', 'confused_necessary_sufficient'], ['Both.', 'It is not sufficient (4 is even, not a multiple of 6), so it is not both.', 'confused_necessary_sufficient']], 'Every multiple of 6 is even, but not every even number is a multiple of 6.'),
    },
  ],
  worked: {
    id: 'w-prop-l11', title: 'Analyse "If n is divisible by 24, then it is divisible by both 4 and 6"', given: ['n is divisible by 24.'], ask: 'Is the statement true? Is its converse?',
    visual: claimGrid(C.mult24to46, { toggle: true }),
    steps: [
      { text: 'Statement: n = 24k = 4 × (6k) and also = 6 × (4k).', why: 'Rewriting 24 as 4 × 6 and as 6 × 4 shows both divisors.' },
      { text: 'So the statement is true for every such n.', why: 'k is any whole number.' },
      { text: 'Converse: 12 is divisible by 4 and by 6, but 12 ÷ 24 is not whole. The converse is false.', why: 'One counterexample disproves it.' },
    ],
    verify: 'The pair is "true, converse false".',
  },
  guided: {
    id: 'g-prop-l11', prompt: 'Analyse "If n is divisible by 24, then it is divisible by both 4 and 6" step by step.',
    steps: [
      { id: 'g1', prompt: 'Translate the converse.', question: converseQ('g-prop-l11-1', 'If n is divisible by 24, then n is divisible by both 4 and 6.', 'If n is divisible by both 4 and 6, then n is divisible by 24.', [['If n is not divisible by 24, then n is not divisible by both 4 and 6.', 'That negates both parts; it is not the converse.', 'inverse_for_converse']], 'conv-form'), hints: ['Swap the parts.'] },
      { id: 'g2', prompt: 'Is the converse true?', question: truthQ('g-prop-l11-2', C.mult24to46, 'converse', 'ce-def'), hints: ['Try 12.'] },
      { id: 'g3', prompt: 'Give a counterexample.', question: counterQ('g-prop-l11-3', converseOf(C.mult24to46)), hints: ['A number divisible by both 4 and 6.'] },
    ],
    conclusion: 'The statement is true, and its converse is false (12).',
  },
  independent: [
    ind('i1', 'Translating', 'translate', 'Write as if … then.', pick('prop-l11-i1', '"All multiples of 8 are even" means:', [['If a number is a multiple of 8, then it is even.', null], ['If a number is even, then it is a multiple of 8.', 'That is the other direction. "All multiples of 8" starts from multiples of 8.', 'swapped_hypothesis_conclusion']], 'P: multiple of 8. Q: even.', undefined, 'ift-wordings'), ['What are the "all" statement’s things?'], ['Multiples of 8.']),
    ind('i2', 'Deciding', 'decide', 'Classify the pair.', combinationQ('prop-l11-i2', C.mult24to46, 'four-combos'), ['Statement true by factoring; converse fails at 12.'], ['True and the converse false.']),
    ind('i3', 'Deciding', 'decide', 'Find a counterexample.', counterQ('prop-l11-i3', converseOf(C.mult24to46)), ['Which numbers are divisible by both 4 and 6?'], ['12, 36, 60, ... are not multiples of 24.']),
    ind('i4', 'Arguing', 'argue', 'Arrange the proof.', orderQ('prop-l11-i4', 'Arrange the steps that prove "If n is divisible by 24, then n is divisible by both 4 and 6".', MULT24, ['m4', 'm3', 'm1', 'm2'], 'n = 24k = 4 × (6k) = 6 × (4k), so n is divisible by both.'), ['What is the first fact?'], ['n = 24k first; the two rewrites next; the conclusion last.']),
    ind('i5', 'Arguing', 'argue', 'Judge the claim.', pick('prop-l11-i5', 'A student says: "n = 12 is divisible by 4 and 6, and 12 = 24 × ½, so the converse holds." What is wrong?', [['12 is not a multiple of 24 (24k with whole k), so 12 disproves the converse.', null], ['Nothing is wrong.', '12 is divisible by both 4 and 6 but 24 does not divide 12, so 12 is a counterexample to the converse.', 'misread_counterexample']], '12 is a counterexample, not support.', undefined, 'ce-def'), ['Is ½ a whole number?'], ['k must be a whole number.']),
    ind('i6', 'Translating', 'translate', 'Write as if \u2026 then.', pick('prop-l11-i6', '"A triangle is isosceles when two of its sides are equal" means:', [['If two sides of a triangle are equal, then it is isosceles.', null], ['If a triangle is isosceles, then two of its sides are equal.', 'That swaps the parts. The condition comes after "when": two sides are equal.', 'swapped_hypothesis_conclusion']], 'The condition after "when" is P.', undefined, 'ift-wordings'), ['What follows "when"?'], ['Two sides are equal.']),
  ],
  reflection: {
    discover: 'To analyse a statement: write it as "if P then Q", write its converse, look for a counterexample, and if none, look for a proof that goes in the right direction.',
    evidence: 'You worked a full example from translation to counterexample and proof.',
    stillConfusing: [{ text: 'What is my plan?', refresherId: 'syn-plan' }, { text: 'Necessary or sufficient?', refresherId: 'syn-necsuff' }],
  },
};

const LESSON_LIST = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11];

export const PROPOSITIONS_CHAPTER: EduChapter = {
  id: 'propositions',
  title: 'Propositions and Their Converses',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part II, Chapter 9 (Statements 1 and 2, Examples 1 to 5, Exercise Set 9.1, the chapter summary). The chapter has no numbered sections. Explanations, figures and questions are original; none are copied from the textbook. Material beyond the chapter is marked "extension" in its lesson.',
  purpose: 'Mathematics is built from statements that are either true or false. This chapter teaches you to read "if … then …" statements, to swap them into converses, to disprove a claim with a counterexample, and to see why a proof is different from a pile of examples.',
  learn: ['What a proposition is', 'The form "if P then Q" and its other wordings', 'The converse and the four possibilities', 'Counterexamples', 'Why testing is not proof, and how to build an argument'],
  realWorld: ['Checking a rule in a game or contract', 'Debugging: "it works for these inputs"', 'Spotting a faulty argument in a news report', 'Proving that a shortcut always works'],
  outcomes: ['Split and rewrite "if … then" statements', 'Write and test a converse', 'Give a valid counterexample', 'Arrange and judge a proof'],
  prerequisiteIds: ['pp-true-false', 'pp-number-words', 'pp-triangle-basics'],
  units: PROP_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(PROP_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/propositions',
    learn: (id) => `/mathematics/propositions/learn/${id}`,
    prerequisites: (id) => `/mathematics/propositions#${id}`,
    lab: '/mathematics/propositions/workbench',
    practice: '/mathematics/propositions/workbench?mode=practice',
  },
};

