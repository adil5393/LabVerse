/**
 * Propositions: chapter and unit prerequisites (EDU-1P).
 * Only ideas the chapter genuinely uses: checking a claim, the number words,
 * a condition picking out numbers, triangle basics, and a letter standing for
 * any number. Original wording.
 */

import type { EduUnit, Prerequisite } from '../../../education/types';
import { factorPairs } from './geometry';
import { factorCountQ, gridVisual, pick } from './questions';

export const PP_TRUE_FALSE: Prerequisite = {
  id: 'pp-true-false',
  title: 'True, false, and checking a claim',
  why: 'A proposition is a claim that is either true or false. You will keep asking "is this claim true?" and answering by checking it.',
  connection: 'Everyday life and earlier grades',
  refresher: [
    {
      id: 'pp-tf-step', title: 'A claim can be checked',
      paragraphs: ['"9 is an odd number" is true. "9 is an even number" is false. Both are claims, and for each you can check the answer: 9 divided by 2 leaves a remainder of 1, so 9 is odd.', 'A claim that is false is still a claim. Saying it is false is also an answer.'],
      check: pick('chk-pp-tf', 'Is "15 is a multiple of 4" true or false?', [
        ['False', null],
        ['True', 'Check it: 4, 8, 12, 16. The multiples of 4 skip over 15, so the claim is false.', 'wrong_check'],
        ['It is not a claim', 'It is a claim. It says something definite about 15 that you can check, and the answer is "false".', 'false_not_a_claim'],
      ], '15 is not in the list 4, 8, 12, 16, ... so the claim is false.'),
    },
  ],
  checks: [
    pick('pp-tf-c1', 'Which of these claims is TRUE?', [
      ['12 is a multiple of 3', null],
      ['12 is a prime number', '12 = 3 × 4, so it has factors other than 1 and 12. It is not prime.', 'wrong_check'],
      ['12 is an odd number', '12 ÷ 2 = 6 exactly, so 12 is even.', 'wrong_check'],
    ], '3 × 4 = 12, so 12 is a multiple of 3.', undefined, 'pp-tf-step'),
  ],
};

export const PP_NUMBER_WORDS: Prerequisite = {
  id: 'pp-number-words',
  title: 'The number words: even, odd, multiple, factor, prime, square',
  why: 'Almost every example in this chapter is a claim about numbers using these words. If a word is unclear, the claim will not make sense.',
  connection: 'Earlier grades: factors, multiples, primes, squares',
  refresher: [
    {
      id: 'pp-nw-step', title: 'What the words mean',
      paragraphs: [
        'A number is a MULTIPLE of 6 if you can reach it by counting in sixes: 6, 12, 18, ... A FACTOR of 12 is a number that divides 12 exactly: 1, 2, 3, 4, 6, 12.',
        'EVEN numbers are multiples of 2; ODD numbers are not. A PRIME has exactly two factors, 1 and itself (so 1 is not prime, and 2 is prime). A PERFECT SQUARE is a number times itself: 1, 4, 9, 16, 25, ...',
      ],
      vocabulary: [{ term: 'multiple of 6', meaning: '6, 12, 18, 24, ...' }, { term: 'factor of 12', meaning: '1, 2, 3, 4, 6, 12' }, { term: 'prime', meaning: 'exactly two factors' }, { term: 'perfect square', meaning: 'a number times itself' }],
      visual: { kind: 'factorPairs', props: { n: 12 }, alt: `Factor pairs of 12: ${factorPairs(12).pairs.map((p) => `(${p[0]}, ${p[1]})`).join(', ')}. Use the minus and plus buttons to change the number.` },
      notice: 'Optional demo: change the number and watch its factor pairs. Every factor has a partner.',
      misconception: { wrong: '1 is a prime number.', right: 'A prime has exactly two different factors. 1 has only one factor, itself, so it is not prime.' },
    },
  ],
  checks: [
    factorCountQ('pp-nw-c1', 12, 'pp-nw-step'),
    pick('pp-nw-c2', 'Which of these is a prime number?', [
      ['13', null],
      ['1', 'A prime has exactly two factors. 1 has only one, so 1 is not prime.', 'one_is_prime'],
      ['15', '15 = 3 × 5, so it has more than two factors.', 'wrong_check'],
    ], '13 has exactly two factors, 1 and 13.', undefined, 'pp-nw-step'),
  ],
};

export const PP_CONDITIONS: Prerequisite = {
  id: 'pp-conditions',
  title: 'A condition picks out some numbers',
  why: 'A rule such as "is a multiple of 6" is true for some numbers and false for others. Seeing the rule as a group of numbers is the key picture for "if P then Q".',
  connection: 'Earlier grades: sets and patterns of numbers',
  refresher: [
    {
      id: 'pp-cond-step', title: 'A rule is a group of numbers',
      paragraphs: ['The rule "n is a multiple of 3" is true for 3, 6, 9, 12, ... and false for 1, 2, 4, 5, ... The numbers for which it is true form a group.', 'Different rules give different groups. Tap numbers below to test the rule on them.'],
      visual: gridVisual({ k: 'div', by: 3 }, { k: 'div', by: 3 }, { max: 30, single: true }),
      notice: 'The outlined numbers are exactly the ones the rule picks out.',
      check: pick('chk-pp-cond', 'Is 14 picked out by the rule "n is a multiple of 3"?', [
        ['No', null],
        ['Yes', '3 × 4 = 12 and 3 × 5 = 15, so 14 is between multiples of 3. It is not picked out.', 'wrong_check'],
      ], '14 is not a multiple of 3.'),
    },
  ],
  checks: [
    pick('pp-cond-c1', 'Which numbers are picked out by "n is even and n is a multiple of 3"?', [
      ['6, 12, 18, ...', null],
      ['2, 4, 6, 8, ...', 'That is just "even". The rule also needs the number to be a multiple of 3.', 'ignored_part_of_rule'],
      ['3, 6, 9, 12, ...', 'That is just "multiple of 3". 3 and 9 are odd, so they fail the first part.', 'ignored_part_of_rule'],
    ], 'Both parts must hold: 6, 12, 18, ...', undefined, 'pp-cond-step'),
  ],
};

export const PP_TRIANGLE_BASICS: Prerequisite = {
  id: 'pp-triangle-basics',
  title: 'Triangles: sides, angles, congruent',
  why: 'The geometry in this chapter compares the sides and angles of triangles and uses the idea that triangles with the same three side lengths are the same shape and size.',
  connection: 'Earlier grades: triangles, congruence (SSS), right angles',
  refresher: [
    {
      id: 'pp-tb-step', title: 'Sides, angles and congruent triangles',
      paragraphs: ['A triangle has three sides and three angles. The three angles always add up to 180°. A right angle is 90°.', 'Two triangles are CONGRUENT when one can be placed exactly on the other. If their three pairs of sides are equal (SSS), they are congruent.'],
      visual: { kind: 'triangle', props: { mode: 'isosceles' }, alt: 'A triangle ABC with base BC fixed and vertex A that you can move. The text below gives the two side lengths from A and the angles at B and C. Optional demo.' },
      notice: 'Optional demo: move A and watch the sides AB, AC and the angles at B and C.',
    },
  ],
  checks: [
    pick('pp-tb-c1', 'Two triangles have all three pairs of sides equal. What can you say?', [
      ['They are congruent', null],
      ['They have the same area but may differ in shape', 'Same three sides fix the shape completely: the triangles are congruent (SSS), not just equal in area.', 'sss_confused'],
      ['Nothing can be said', 'SSS: three equal pairs of sides make the triangles congruent.', 'sss_confused'],
    ], 'Three equal pairs of sides (SSS) make two triangles congruent.', undefined, 'pp-tb-step'),
    {
      kind: 'numeric', id: 'pp-tb-c2', prompt: 'Two angles of a triangle are 50° and 60°. What is the third angle?', answer: 70, unit: '°',
      rules: [{ values: [110], entry: { message: '110° is 50 + 60. The three angles must add to 180°, so the third angle is 180 − 110.', refresherId: 'pp-tb-step', misconception: 'forgot_subtract_from_180' } }],
      defaultFeedback: { message: 'Add the two known angles, then subtract the total from 180°.', refresherId: 'pp-tb-step' }, explanation: '180 − (50 + 60) = 70.',
    },
  ],
};

export const PP_LETTERS: Prerequisite = {
  id: 'pp-letters',
  title: 'A letter that stands for any number',
  why: 'To prove something about EVERY even number you cannot list them all. You write a general even number as 2k, where k is any whole number, and reason with the letter.',
  connection: 'Earlier grades: algebra with letters',
  refresher: [
    {
      id: 'pp-let-step', title: '2k is even, 2k + 1 is odd',
      paragraphs: ['If k is any whole number, then 2k is twice a whole number, so it is even: 2, 4, 6, 8, ... for k = 1, 2, 3, 4. The next number, 2k + 1, is odd: 3, 5, 7, 9, ...', 'Because k can be any whole number, reasoning about 2k covers all even numbers at once.'],
      misconception: { wrong: 'k has to be a particular number such as 3.', right: 'In a proof k stands for any whole number, so what you show is true for all of them.' },
    },
  ],
  checks: [
    pick('pp-let-c1', 'k is a whole number. Which of these is always odd?', [
      ['2k + 1', null],
      ['2k', '2k is twice a whole number, so it is even.', 'even_odd_letters'],
      ['k + 1', 'k + 1 is odd for some k and even for others (k = 1 gives 2).', 'even_odd_letters'],
    ], '2k is even, so one more than it, 2k + 1, is odd.', undefined, 'pp-let-step'),
  ],
};

export const PROP_PREREQUISITES: Prerequisite[] = [PP_TRUE_FALSE, PP_NUMBER_WORDS, PP_CONDITIONS, PP_TRIANGLE_BASICS, PP_LETTERS];

export const PROP_UNITS: EduUnit[] = [
  {
    id: 'unit-1', number: 1, title: 'Understanding mathematical statements',
    centralIdea: 'A proposition is a claim that is either true or false, and most mathematical facts are written as "if P then Q".',
    connection: 'This unit gives you the words and the form that every later unit uses.',
    vocabulary: [{ term: 'proposition', meaning: 'a statement that is either true or false' }, { term: 'hypothesis (P)', meaning: 'the part after "if", what is assumed' }, { term: 'conclusion (Q)', meaning: 'the part after "then", what must follow' }],
    discover: ['What makes a sentence a proposition', 'How to split "if P then Q" and say it in different words'],
    prerequisiteIds: ['pp-true-false'], lessonIds: ['prop-l1', 'prop-l2'],
  },
  {
    id: 'unit-2', number: 2, title: 'Converses',
    centralIdea: 'Swapping the two parts of "if P then Q" gives a different claim, the converse, and its truth has to be checked on its own.',
    connection: 'It builds on reading "if P then Q" from Unit 1 and on seeing a condition as a group of numbers.',
    vocabulary: [{ term: 'converse', meaning: 'the statement "if Q then P"' }],
    discover: ['The converse is a new claim', 'All four combinations of true and false can happen'],
    prerequisiteIds: ['pp-number-words', 'pp-conditions'], lessonIds: ['prop-l3', 'prop-l4'],
  },
  {
    id: 'unit-3', number: 3, title: 'Counterexamples',
    centralIdea: 'A single counterexample proves a statement false, but any number of examples that fit never prove it true.',
    connection: 'It uses the grid picture from Unit 2: a counterexample is a number in P but outside Q.',
    vocabulary: [{ term: 'counterexample', meaning: 'an example where the hypothesis is true and the conclusion is false' }],
    discover: ['What a valid counterexample must satisfy', 'How to search for one', 'Why a long run of successes can still end in failure'],
    prerequisiteIds: ['pp-number-words', 'pp-conditions'], lessonIds: ['prop-l5', 'prop-l6'],
  },
  {
    id: 'unit-4', number: 4, title: 'Geometry and converses',
    centralIdea: 'Geometry theorems have converses too, and some are true (equal angles give equal sides) while others are false (equal diagonals do not give a rectangle).',
    connection: 'It applies the idea of the converse to triangles and quadrilaterals.',
    vocabulary: [{ term: 'congruent', meaning: 'exactly the same shape and size' }],
    discover: ['Which geometry converses hold', 'How to test a figure against a claim'],
    prerequisiteIds: ['pp-triangle-basics'], lessonIds: ['prop-l7', 'prop-l8'],
  },
  {
    id: 'unit-5', number: 5, title: 'Mathematical proof',
    centralIdea: 'A proof is a chain of steps, each justified, that covers every case at once; testing examples cannot do that.',
    connection: 'It uses a letter for "any number" to turn a pattern into a proof.',
    vocabulary: [{ term: 'proof', meaning: 'a chain of justified steps from what is given to what is claimed' }],
    discover: ['Why checking many cases is not a proof', 'How to build a proof and which direction it proves'],
    prerequisiteIds: ['pp-letters', 'pp-number-words'], lessonIds: ['prop-l9', 'prop-l10'],
  },
  {
    id: 'unit-6', number: 6, title: 'Putting it together',
    centralIdea: 'Reasoning well means deciding which direction a statement goes, testing it, and choosing between a counterexample and a proof.',
    connection: 'It uses every idea from Units 1 to 5.',
    vocabulary: [{ term: 'necessary and sufficient', meaning: 'Q is needed for P; P is enough for Q' }],
    discover: ['How to attack an unfamiliar statement'],
    prerequisiteIds: ['pp-conditions', 'pp-letters'], lessonIds: ['prop-l11'],
  },
];
