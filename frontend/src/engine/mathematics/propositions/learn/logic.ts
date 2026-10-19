/**
 * Serializable predicates and claims for the Propositions Learn path (EDU-1P).
 *
 * A claim "If P then Q" about positive integers is plain data (two Pred values).
 * The number grid, the counterexample judges and the practice questions are all
 * derived from the same Pred values, so a diagram can never disagree with the
 * statement it illustrates. Authored truth values (`holds`) are checked against
 * brute force in the tests: a claim marked true must have no counterexample in
 * the search range, and a claim marked false must have one.
 */

import { getFactors, isDivisible, isEven, isOdd, isPerfectSquare, isPrime } from '../numberPredicates';

export type Pred =
  | { k: 'div'; by: number }
  | { k: 'divAll'; by: number[] }
  | { k: 'even' }
  | { k: 'odd' }
  | { k: 'prime' }
  | { k: 'square' }
  | { k: 'units'; in: number[] }
  | { k: 'oddFactors' }
  | { k: 'factorCount'; n: number };

export const evalPred = (p: Pred, n: number): boolean => {
  switch (p.k) {
    case 'div': return isDivisible(n, p.by);
    case 'divAll': return p.by.every((d) => isDivisible(n, d));
    case 'even': return isEven(n);
    case 'odd': return isOdd(n);
    case 'prime': return isPrime(n);
    case 'square': return isPerfectSquare(n);
    case 'units': return p.in.includes(n % 10);
    case 'oddFactors': return getFactors(n).length % 2 === 1;
    case 'factorCount': return getFactors(n).length === p.n;
  }
};

/** A phrase that completes "n ...", for example "is a multiple of 6". */
export const predPhrase = (p: Pred): string => {
  switch (p.k) {
    case 'div': return `is a multiple of ${p.by}`;
    case 'divAll': return `is divisible by both ${p.by.slice(0, -1).join(', ')} and ${p.by[p.by.length - 1]}`;
    case 'even': return 'is even';
    case 'odd': return 'is odd';
    case 'prime': return 'is a prime number';
    case 'square': return 'is a perfect square';
    case 'units': return p.in.length === 1 ? `ends in ${p.in[0]}` : `ends in ${p.in.slice(0, -1).join(', ')} or ${p.in[p.in.length - 1]}`;
    case 'oddFactors': return 'has an odd number of factors';
    case 'factorCount': return `has exactly ${p.n} factors`;
  }
};

/** A noun phrase for "If a number ..." sentences, e.g. "is a multiple of 6" stays as is. */
export interface Claim {
  id: string;
  P: Pred;
  Q: Pred;
  /** Authored truth of "If P then Q" for ALL positive integers. */
  holds: boolean;
  /** Authored truth of the converse "If Q then P". */
  converseHolds: boolean;
  /** Why the claim holds (a proof idea) or why it fails. */
  whyForward: string;
  whyConverse: string;
}

export const claimSentence = (c: Pick<Claim, 'P' | 'Q'>): string => `If a positive integer n ${predPhrase(c.P)}, then n ${predPhrase(c.Q)}.`;
export const converseOf = (c: Claim): Claim => ({ id: `${c.id}~`, P: c.Q, Q: c.P, holds: c.converseHolds, converseHolds: c.holds, whyForward: c.whyConverse, whyConverse: c.whyForward });

export type Standing = 'supports' | 'disproves' | 'not-applicable';

/** How a single number stands against "If P then Q". */
export function standing(c: Pick<Claim, 'P' | 'Q'>, n: number): Standing {
  if (!evalPred(c.P, n)) return 'not-applicable';
  return evalPred(c.Q, n) ? 'supports' : 'disproves';
}

export function counterexamples(c: Pick<Claim, 'P' | 'Q'>, from = 1, to = 2000): number[] {
  const out: number[] = [];
  for (let n = from; n <= to; n++) if (standing(c, n) === 'disproves') out.push(n);
  return out;
}

export const smallestCounterexample = (c: Pick<Claim, 'P' | 'Q'>, to = 2000): number | null => counterexamples(c, 1, to)[0] ?? null;

/** The four truth combinations, named by (statement, converse). */
export type Combination = 'both-true' | 'true-false' | 'false-true' | 'both-false';
export const combinationOf = (c: Claim): Combination =>
  c.holds ? (c.converseHolds ? 'both-true' : 'true-false') : c.converseHolds ? 'false-true' : 'both-false';

/** Judge for the question "give a counterexample to this claim". */
export function judgeCounterexample(c: Pick<Claim, 'P' | 'Q'>, n: number, refresherId?: string): { correct: boolean; message: string; refresherId?: string; misconception?: string } {
  if (!Number.isInteger(n) || n < 1) {
    return { correct: false, message: 'The claim is about positive integers (1, 2, 3, ...). Choose one of those.', misconception: 'outside_domain', refresherId };
  }
  const s = standing(c, n);
  if (s === 'disproves') return { correct: true, message: `${n} ${predPhrase(c.P)} but does not satisfy "${predPhrase(c.Q)}", so it disproves the claim.` };
  if (s === 'supports') {
    return { correct: false, message: `${n} ${predPhrase(c.P)} and it also ${predPhrase(c.Q)}. An example that fits the claim supports it; it cannot disprove it. A counterexample must make the first part true and the second part false.`, misconception: 'supporting_example_as_counterexample', refresherId };
  }
  return { correct: false, message: `${n} does not even satisfy the first part (n ${predPhrase(c.P)}). The claim says nothing about such numbers, so ${n} cannot disprove it. Choose a number for which the first part is true.`, misconception: 'hypothesis_false_as_counterexample', refresherId };
}

// ---------------------------------------------------------------------------
// The claim bank used by the lessons
// ---------------------------------------------------------------------------

export const CLAIMS: Record<string, Claim> = {
  mult6to3: {
    id: 'mult6to3', P: { k: 'div', by: 6 }, Q: { k: 'div', by: 3 }, holds: true, converseHolds: false,
    whyForward: 'A multiple of 6 is 6k = 3 × (2k), a multiple of 3.',
    whyConverse: '9 is a multiple of 3 but not of 6, so the converse fails.',
  },
  mult4toEven: {
    id: 'mult4toEven', P: { k: 'div', by: 4 }, Q: { k: 'even' }, holds: true, converseHolds: false,
    whyForward: 'A multiple of 4 is 4k = 2 × (2k), which is even.',
    whyConverse: '6 is even but not a multiple of 4.',
  },
  mult3to9: {
    id: 'mult3to9', P: { k: 'div', by: 3 }, Q: { k: 'div', by: 9 }, holds: false, converseHolds: true,
    whyForward: '6 is a multiple of 3 but not of 9.',
    whyConverse: 'A multiple of 9 is 9k = 3 × (3k), a multiple of 3.',
  },
  squareOddFactors: {
    id: 'squareOddFactors', P: { k: 'square' }, Q: { k: 'oddFactors' }, holds: true, converseHolds: true,
    whyForward: 'In a square n = f × f the only factor that is its own partner is f, so the factors are f plus complete pairs: an odd number.',
    whyConverse: 'If the number of factors is odd, some factor must be its own partner (otherwise they would all pair up), so n = f × f.',
  },
  primeOdd: {
    id: 'primeOdd', P: { k: 'prime' }, Q: { k: 'odd' }, holds: false, converseHolds: false,
    whyForward: '2 is prime but even.',
    whyConverse: '9 is odd but not prime (and 1 is odd but not prime).',
  },
  ends5to10: {
    id: 'ends5to10', P: { k: 'units', in: [5] }, Q: { k: 'div', by: 10 }, holds: false, converseHolds: false,
    whyForward: '15 ends in 5 but is not a multiple of 10.',
    whyConverse: '20 is a multiple of 10 but does not end in 5.',
  },
  mult24to46: {
    id: 'mult24to46', P: { k: 'div', by: 24 }, Q: { k: 'divAll', by: [4, 6] }, holds: true, converseHolds: false,
    whyForward: '24 = 4 × 6 and also 24k = 4 × (6k) = 6 × (4k).',
    whyConverse: '12 is divisible by both 4 and 6, but not by 24.',
  },
  primeSquareThreeFactors: {
    id: 'primeSquareThreeFactors', P: { k: 'square' }, Q: { k: 'factorCount', n: 3 }, holds: false, converseHolds: true,
    whyForward: '16 is a perfect square but has 5 factors, not 3.',
    whyConverse: 'A number with exactly 3 factors is the square of a prime, so it is a perfect square.',
  },
};

export const CLAIM_LIST = Object.values(CLAIMS);
