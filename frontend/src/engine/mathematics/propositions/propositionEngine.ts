/**
 * Proposition Engine & Canonical Mathematical Statements
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import type {
  ConditionalProposition,
  ClassifiedStatement,
  PropositionDomain,
  TruthPossibilityCategory,
} from './types';
import {
  isInteger,
  isPositiveInteger,
  isNonNegativeInteger,
  isDivisible,
  isEven,
  isOdd,
  isPrime,
  getUnitsDigit,
} from './numberPredicates';

// ============================================================================
// Mathematical Domains
// ============================================================================

export const POSITIVE_INTEGER_DOMAIN: PropositionDomain<number> = {
  id: 'positive_integers',
  name: 'Positive Integers (ℕ)',
  description: 'Natural numbers {1, 2, 3, 4, 5, ...}',
  contains: (v: number) => isPositiveInteger(v),
  sampleValues: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 18, 20, 24, 25, 27, 30, 36],
};

export const INTEGER_DOMAIN: PropositionDomain<number> = {
  id: 'integers',
  name: 'Integers (ℤ)',
  description: 'Numbers {..., -3, -2, -1, 0, 1, 2, 3, ...}',
  contains: (v: number) => isInteger(v),
  sampleValues: [-6, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 9, 12],
};

export const WHOLE_NUMBER_DOMAIN: PropositionDomain<number> = {
  id: 'whole_numbers',
  name: 'Whole Numbers (𝕎)',
  description: 'Non-negative integers {0, 1, 2, 3, 4, ...}',
  contains: (v: number) => isNonNegativeInteger(v),
  sampleValues: [0, 1, 2, 3, 4, 5, 6, 9, 10, 16, 25],
};

// ============================================================================
// Lesson 1: Statements & Propositions Classification Bank
// ============================================================================

export const CLASSIFIED_STATEMENTS_BANK: ClassifiedStatement[] = [
  {
    id: 'stmt-1',
    statement: 'The sum of all interior angles of a triangle is 180°.',
    type: 'proposition',
    isProposition: true,
    truthValue: true,
    explanation:
      'This is a mathematical proposition because it is a declarative sentence that is unequivocally true in Euclidean geometry.',
    pedagogicalNote: 'Theorem proven in Chapter on Lines and Angles.',
  },
  {
    id: 'stmt-2',
    statement: 'Every rectangle is a square.',
    type: 'proposition',
    isProposition: true,
    truthValue: false,
    explanation:
      'This is a mathematical proposition because it can be classified definitively as true or false. It is false, because a 4cm × 6cm rectangle is not a square.',
    pedagogicalNote: 'Notice that a statement does not need to be true to be a proposition; it just needs a definite truth value.',
  },
  {
    id: 'stmt-3',
    statement: 'Mathematics is the most enjoyable subject in school.',
    type: 'subjective_opinion',
    isProposition: false,
    explanation:
      'This is a personal opinion or value judgment. Some students agree, while others do not. Its truth depends on individual preference, so it is not a mathematical proposition.',
    pedagogicalNote: 'Mathematical propositions must be objective and independent of subjective human feelings.',
  },
  {
    id: 'stmt-4',
    statement: 'Please draw a circle of radius 5 cm on your paper.',
    type: 'command',
    isProposition: false,
    explanation:
      'This is an instruction or command. It cannot be judged as true or false.',
    pedagogicalNote: 'Commands, instructions, and requests are not propositions.',
  },
  {
    id: 'stmt-5',
    statement: 'Is 17 a prime number?',
    type: 'question',
    isProposition: false,
    explanation:
      'This is an interrogative question. A question seeks information and is neither true nor false.',
    pedagogicalNote: 'The answer ("Yes, 17 is prime") is a proposition, but the question itself is not.',
  },
  {
    id: 'stmt-6',
    statement: 'What a beautiful geometric pattern!',
    type: 'exclamation',
    isProposition: false,
    explanation:
      'This is an exclamation expressing emotion. It does not assert a fact that can be classified as true or false.',
  },
  {
    id: 'stmt-7',
    statement: 'The square of an odd integer is always an odd integer.',
    type: 'proposition',
    isProposition: true,
    truthValue: true,
    explanation:
      'This is a proposition and is true. If n = 2k + 1, then n² = 4k² + 4k + 1 = 2(2k² + 2k) + 1, which is always odd.',
  },
  {
    id: 'stmt-8',
    statement: 'All prime numbers are odd.',
    type: 'proposition',
    isProposition: true,
    truthValue: false,
    explanation:
      'This is a proposition and is false. The number 2 is prime, but it is an even number.',
    pedagogicalNote: 'The single number 2 serves as a decisive counterexample.',
  },
  {
    id: 'stmt-9',
    statement: '7 is greater than 12.',
    type: 'proposition',
    isProposition: true,
    truthValue: false,
    explanation:
      'This is a proposition because it makes a definite mathematical claim, even though it is false (7 < 12).',
  },
  {
    id: 'stmt-10',
    statement: 'Tomorrow will be a very lucky day for you.',
    type: 'subjective_opinion',
    isProposition: false,
    explanation:
      'This is an ambiguous astrological claim without an objective mathematical definition of "lucky".',
  },
];

// ============================================================================
// Canonical Conditional Propositions Bank
// ============================================================================

export const CANONICAL_PROPOSITIONS: ConditionalProposition<number>[] = [
  // --------------------------------------------------------------------------
  // Category 1: Both Original and Converse are TRUE
  // --------------------------------------------------------------------------
  {
    id: 'prop-div2-even-units',
    title: 'Even Numbers & Units Digit',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer is divisible by 2, then its units digit is 0, 2, 4, 6, or 8.',
    hypothesisText: 'n is divisible by 2',
    conclusionText: 'the units digit of n is 0, 2, 4, 6, or 8',
    converseNaturalStatement: 'If the units digit of a positive integer is 0, 2, 4, 6, or 8, then it is divisible by 2.',
    hypothesis: (n: number) => isDivisible(n, 2),
    conclusion: (n: number) => [0, 2, 4, 6, 8].includes(getUnitsDigit(n)),
    isOriginalTrue: true,
    isConverseTrue: true,
    truthCategory: 'both_true',
    mathematicalExplanation:
      'Any integer n can be written in base 10 as 10k + d, where d is the units digit. Since 10k is always divisible by 2, n is divisible by 2 if and only if d is divisible by 2. Thus both directions hold universally.',
    converseExplanation:
      'If the units digit d ∈ {0, 2, 4, 6, 8}, then d = 2m. Then n = 10k + 2m = 2(5k + m), so n is divisible by 2.',
  },

  // --------------------------------------------------------------------------
  // Category 2: Original is TRUE, Converse is FALSE
  // --------------------------------------------------------------------------
  {
    id: 'prop-div6-div3',
    title: 'Divisibility by 6 and 3',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer is divisible by 6, then it is divisible by 3.',
    hypothesisText: 'n is divisible by 6',
    conclusionText: 'n is divisible by 3',
    converseNaturalStatement: 'If a positive integer is divisible by 3, then it is divisible by 6.',
    hypothesis: (n: number) => isDivisible(n, 6),
    conclusion: (n: number) => isDivisible(n, 3),
    isOriginalTrue: true,
    isConverseTrue: false,
    truthCategory: 'original_true_converse_false',
    converseCounterexampleHint: 'Try an odd multiple of 3, such as 3, 9, or 15.',
    knownConverseCounterexamples: [3, 9, 15, 21, 27, 33],
    mathematicalExplanation:
      'Because 6 = 2 × 3, any multiple of 6 is 6k = 3(2k), which is inevitably a multiple of 3. Hence the original proposition is universally true.',
    converseExplanation:
      'The converse claims: "If n is divisible by 3, then n is divisible by 6." For n = 9: 9 is divisible by 3 (Hypothesis TRUE), but 9 is NOT divisible by 6 (Conclusion FALSE). Thus 9 is a decisive counterexample.',
  },

  {
    id: 'prop-div4-even',
    title: 'Divisibility by 4 and Even Parity',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer is divisible by 4, then it is an even number.',
    hypothesisText: 'n is divisible by 4',
    conclusionText: 'n is an even number',
    converseNaturalStatement: 'If a positive integer is an even number, then it is divisible by 4.',
    hypothesis: (n: number) => isDivisible(n, 4),
    conclusion: (n: number) => isEven(n),
    isOriginalTrue: true,
    isConverseTrue: false,
    truthCategory: 'original_true_converse_false',
    converseCounterexampleHint: 'Look for an even number that leaves a remainder of 2 when divided by 4.',
    knownConverseCounterexamples: [2, 6, 10, 14, 18, 22],
    mathematicalExplanation:
      'If n is divisible by 4, n = 4k = 2(2k), which is even. So the original proposition is true.',
    converseExplanation:
      'The converse claims that every even number is divisible by 4. For n = 6: 6 is even (Hypothesis TRUE), but 6 is not divisible by 4 (Conclusion FALSE). Thus 6 is a counterexample.',
  },

  // --------------------------------------------------------------------------
  // Category 3: Original is FALSE, Converse is TRUE
  // --------------------------------------------------------------------------
  {
    id: 'prop-div3-div9',
    title: 'Divisibility by 3 and 9',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer is divisible by 3, then it is divisible by 9.',
    hypothesisText: 'n is divisible by 3',
    conclusionText: 'n is divisible by 9',
    converseNaturalStatement: 'If a positive integer is divisible by 9, then it is divisible by 3.',
    hypothesis: (n: number) => isDivisible(n, 3),
    conclusion: (n: number) => isDivisible(n, 9),
    isOriginalTrue: false,
    isConverseTrue: true,
    truthCategory: 'original_false_converse_true',
    originalCounterexampleHint: 'Consider multiples of 3 that are smaller than 9 or not divisible by 9, like 6.',
    knownOriginalCounterexamples: [3, 6, 12, 15, 21, 24],
    mathematicalExplanation:
      'The original statement fails for n = 6: 6 is divisible by 3, but 6 is not divisible by 9. So 6 disproves the original proposition.',
    converseExplanation:
      'The converse is: "If n is divisible by 9, then n is divisible by 3." Since 9 = 3 × 3, any multiple of 9 is 9k = 3(3k), which is always divisible by 3. The converse is universally true.',
  },

  // --------------------------------------------------------------------------
  // Category 4: Both Original and Converse are FALSE
  // --------------------------------------------------------------------------
  {
    id: 'prop-prime-odd',
    title: 'Prime Numbers and Odd Parity',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer is a prime number, then it is an odd number.',
    hypothesisText: 'n is a prime number',
    conclusionText: 'n is an odd number',
    converseNaturalStatement: 'If a positive integer is an odd number, then it is a prime number.',
    hypothesis: (n: number) => isPrime(n),
    conclusion: (n: number) => isOdd(n),
    isOriginalTrue: false,
    isConverseTrue: false,
    truthCategory: 'both_false',
    originalCounterexampleHint: 'What is the smallest prime number?',
    converseCounterexampleHint: 'Can an odd number have factors other than 1 and itself? Try 9, 15, or 21.',
    knownOriginalCounterexamples: [2],
    knownConverseCounterexamples: [1, 9, 15, 21, 25, 27],
    mathematicalExplanation:
      'The original is false because n = 2 is prime, yet 2 is not odd (it is even). Hence 2 is a counterexample to the original proposition.',
    converseExplanation:
      'The converse is: "If n is odd, then n is prime." For n = 9: 9 is odd, but 9 is composite (3 × 3 = 9), not prime. So 9 disproves the converse. (Also n = 1 is odd but not prime).',
  },

  {
    id: 'prop-ends5-div10',
    title: 'Units Digit 5 and Divisibility by 10',
    domain: POSITIVE_INTEGER_DOMAIN,
    domainDescription: 'n ∈ {1, 2, 3, ...}',
    naturalStatement: 'If a positive integer ends in 5, then it is divisible by 10.',
    hypothesisText: 'the units digit of n is 5',
    conclusionText: 'n is divisible by 10',
    converseNaturalStatement: 'If a positive integer is divisible by 10, then it ends in 5.',
    hypothesis: (n: number) => getUnitsDigit(n) === 5,
    conclusion: (n: number) => isDivisible(n, 10),
    isOriginalTrue: false,
    isConverseTrue: false,
    truthCategory: 'both_false',
    originalCounterexampleHint: 'Take 15, 25, or 35.',
    converseCounterexampleHint: 'Take 10, 20, or 30.',
    knownOriginalCounterexamples: [5, 15, 25, 35],
    knownConverseCounterexamples: [10, 20, 30, 40],
    mathematicalExplanation:
      'For n = 15: ends in 5, but 15 is not divisible by 10. Thus original is false.',
    converseExplanation:
      'For n = 20: 20 is divisible by 10, but ends in 0, not 5. Thus converse is false.',
  },
];

// ============================================================================
// Engine Helper Functions
// ============================================================================

export function getPropositionById(id: string): ConditionalProposition<number> | undefined {
  return CANONICAL_PROPOSITIONS.find((p) => p.id === id);
}

export function getAllPropositions(): ConditionalProposition<number>[] {
  return CANONICAL_PROPOSITIONS;
}

export function getPropositionsByCategory(
  category: TruthPossibilityCategory
): ConditionalProposition<number>[] {
  return CANONICAL_PROPOSITIONS.filter((p) => p.truthCategory === category);
}

/**
 * Creates the converse of a conditional proposition by swapping hypothesis and conclusion.
 */
export function createConverse<T>(
  prop: ConditionalProposition<T>
): ConditionalProposition<T> {
  return {
    id: `${prop.id}_converse`,
    title: `Converse of: ${prop.title}`,
    domain: prop.domain,
    domainDescription: prop.domainDescription,
    naturalStatement: prop.converseNaturalStatement,
    hypothesisText: prop.conclusionText,
    conclusionText: prop.hypothesisText,
    converseNaturalStatement: prop.naturalStatement,
    hypothesis: prop.conclusion,
    conclusion: prop.hypothesis,
    isOriginalTrue: prop.isConverseTrue,
    isConverseTrue: prop.isOriginalTrue,
    truthCategory:
      prop.truthCategory === 'original_true_converse_false'
        ? 'original_false_converse_true'
        : prop.truthCategory === 'original_false_converse_true'
        ? 'original_true_converse_false'
        : prop.truthCategory,
    originalCounterexampleHint: prop.converseCounterexampleHint,
    converseCounterexampleHint: prop.originalCounterexampleHint,
    knownOriginalCounterexamples: prop.knownConverseCounterexamples,
    knownConverseCounterexamples: prop.knownOriginalCounterexamples,
    mathematicalExplanation: prop.converseExplanation,
    converseExplanation: prop.mathematicalExplanation,
  };
}
