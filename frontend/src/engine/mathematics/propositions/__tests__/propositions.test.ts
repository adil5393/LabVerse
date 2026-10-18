/**
 * Comprehensive Automated Test Suite for Milestone M4:
 * Class 9 NCERT Ganita Manjari - Propositions and Their Converses
 */

import { describe, it, expect } from 'vitest';
import {
  isDivisible,
  isEven,
  isOdd,
  isPrime,
  isPerfectSquare,
  getFactors,
  getUnitsDigit,
  evaluateEulerPolynomial,
} from '../numberPredicates';
import {
  POSITIVE_INTEGER_DOMAIN,
  INTEGER_DOMAIN,
  WHOLE_NUMBER_DOMAIN,
  CLASSIFIED_STATEMENTS_BANK,
  CANONICAL_PROPOSITIONS,
  createConverse,
  getPropositionById,
} from '../propositionEngine';
import {
  evaluateCounterexample,
  searchCounterexamplesInRange,
  evaluatePythagorasTriangle,
  evaluateEqualDiagonalsConverse,
} from '../counterexampleEngine';
import {
  CANONICAL_PROOF_TEMPLATES,
  validateProofAssembly,
} from '../proofEngine';
import { NCERT_PROPOSITIONS_CURRICULUM_MATRIX } from '../curriculumRegistry';
import { PROP_GUIDED_UNITS, PROP_GUIDED_LESSONS } from '../curriculumPath';
import { PROPOSITIONS_PRACTICE_BANK } from '../practiceBank';
import { usePropositionsStore } from '../../../../store/usePropositionsStore';

describe('1. Number Predicates & Scientific Integrity', () => {
  it('correctly calculates divisibility including negative and zero', () => {
    expect(isDivisible(12, 3)).toBe(true);
    expect(isDivisible(12, 5)).toBe(false);
    expect(isDivisible(0, 5)).toBe(true);
    expect(isDivisible(5, 0)).toBe(false);
    expect(isDivisible(-18, 6)).toBe(true);
    expect(isDivisible(-18, 5)).toBe(false);
  });

  it('correctly handles parity', () => {
    expect(isEven(0)).toBe(true);
    expect(isEven(2)).toBe(true);
    expect(isEven(-4)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isOdd(3)).toBe(true);
    expect(isOdd(-5)).toBe(true);
    expect(isOdd(0)).toBe(false);
  });

  it('correctly identifies primes and handles non-primes', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(41)).toBe(true);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(0)).toBe(false);
    expect(isPrime(-7)).toBe(false);
    expect(isPrime(4)).toBe(false);
    expect(isPrime(9)).toBe(false);
  });

  it('correctly detects perfect squares and rejects non-squares and negative numbers', () => {
    expect(isPerfectSquare(0)).toBe(true);
    expect(isPerfectSquare(1)).toBe(true);
    expect(isPerfectSquare(4)).toBe(true);
    expect(isPerfectSquare(25)).toBe(true);
    expect(isPerfectSquare(26)).toBe(false);
    expect(isPerfectSquare(-4)).toBe(false);
    expect(isPerfectSquare(144)).toBe(true);
  });

  it('retrieves accurate factors', () => {
    expect(getFactors(12)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(getFactors(7)).toEqual([1, 7]);
    expect(getFactors(1)).toEqual([1]);
    expect(getFactors(0)).toEqual([]);
  });

  it('extracts units digits correctly for positive and negative numbers', () => {
    expect(getUnitsDigit(123)).toBe(3);
    expect(getUnitsDigit(-456)).toBe(6);
    expect(getUnitsDigit(0)).toBe(0);
  });

  it('verifies Euler polynomial f(n) = n^2 + n + 41 generates primes up to n=39 and fails at n=40', () => {
    const n39 = evaluateEulerPolynomial(39);
    expect(n39.value).toBe(39 * 39 + 39 + 41); // 1601
    expect(n39.isPrime).toBe(true);

    // n = 40 produces 40^2 + 40 + 41 = 40(40 + 1) + 41 = 40(41) + 41 = 41 * 41 = 1681 (composite!)
    const n40 = evaluateEulerPolynomial(40);
    expect(n40.value).toBe(1681);
    expect(n40.isPrime).toBe(false);
    expect(n40.value % 41).toBe(0);
  });
});

describe('2. Domains & Statement Classification', () => {
  it('validates mathematical domain memberships', () => {
    expect(POSITIVE_INTEGER_DOMAIN.contains(5)).toBe(true);
    expect(POSITIVE_INTEGER_DOMAIN.contains(0)).toBe(false);
    expect(POSITIVE_INTEGER_DOMAIN.contains(-3)).toBe(false);
    expect(POSITIVE_INTEGER_DOMAIN.contains(3.14)).toBe(false);

    expect(INTEGER_DOMAIN.contains(-5)).toBe(true);
    expect(INTEGER_DOMAIN.contains(0)).toBe(true);
    expect(INTEGER_DOMAIN.contains(5)).toBe(true);
    expect(INTEGER_DOMAIN.contains(2.5)).toBe(false);

    expect(WHOLE_NUMBER_DOMAIN.contains(0)).toBe(true);
    expect(WHOLE_NUMBER_DOMAIN.contains(-1)).toBe(false);
  });

  it('correctly classifies mathematical statements vs questions/imperatives', () => {
    expect(CLASSIFIED_STATEMENTS_BANK.length).toBeGreaterThanOrEqual(8);
    const propositions = CLASSIFIED_STATEMENTS_BANK.filter((s) => s.isProposition);
    const nonPropositions = CLASSIFIED_STATEMENTS_BANK.filter((s) => !s.isProposition);

    expect(propositions.length).toBeGreaterThan(0);
    expect(nonPropositions.length).toBeGreaterThan(0);

    propositions.forEach((p) => {
      expect(typeof p.truthValue).toBe('boolean');
      expect(p.explanation).toBeTruthy();
    });

    nonPropositions.forEach((np) => {
      expect(np.truthValue).toBeUndefined();
      expect(np.explanation).toBeTruthy();
    });
  });
});

describe('3. Canonical Propositions & Converse Generation', () => {
  it('contains canonical propositions across all 4 truth combinations', () => {
    const truthCombinations = new Set(CANONICAL_PROPOSITIONS.map((p) => p.truthCategory));
    expect(truthCombinations.has('both_true')).toBe(true);
    expect(truthCombinations.has('original_true_converse_false')).toBe(true);
    expect(truthCombinations.has('original_false_converse_true')).toBe(true);
    expect(truthCombinations.has('both_false')).toBe(true);
  });

  it('accurately forms the converse of a conditional proposition by swapping P and Q', () => {
    const p1 = getPropositionById('prop-div6-div3');
    expect(p1).toBeDefined();
    if (!p1) return;

    const conv = createConverse(p1);
    expect(conv.id).toBe('prop-div6-div3_converse');
    expect(conv.hypothesisText).toBe(p1.conclusionText);
    expect(conv.conclusionText).toBe(p1.hypothesisText);

    // In converse: hypothesis is "divisible by 3", conclusion is "divisible by 6"
    // For 9: hypothesis(9) is true, conclusion(9) is false
    expect(conv.hypothesis(9)).toBe(true);
    expect(conv.conclusion(9)).toBe(false);
  });

  it('evaluates statement truth for specific numbers correctly', () => {
    const p1 = getPropositionById('prop-div6-div3');
    if (!p1) return;

    // 12 is divisible by 6 (true) and divisible by 3 (true)
    expect(p1.hypothesis(12)).toBe(true);
    expect(p1.conclusion(12)).toBe(true);

    // 9 is NOT divisible by 6 (false) but is divisible by 3 (true)
    expect(p1.hypothesis(9)).toBe(false);
    expect(p1.conclusion(9)).toBe(true);
  });
});

describe('4. Counterexample Engine & Rigorous Logic', () => {
  it('identifies valid counterexamples where hypothesis is true and conclusion is false', () => {
    const p1 = getPropositionById('prop-div6-div3');
    expect(p1).toBeDefined();
    if (!p1) return;

    const converse = createConverse(p1);
    // Testing 9 for "If divisible by 3, then divisible by 6"
    const eval9 = evaluateCounterexample(converse, 9);
    expect(eval9.validDomain).toBe(true);
    expect(eval9.hypothesisSatisfied).toBe(true);
    expect(eval9.conclusionSatisfied).toBe(false);
    expect(eval9.isCounterexample).toBe(true);
    expect(eval9.isSupportingExample).toBe(false);
    expect(eval9.isHypothesisViolated).toBe(false);
  });

  it('rejects numbers where hypothesis is violated as counterexamples', () => {
    const p1 = getPropositionById('prop-div6-div3');
    if (!p1) return;

    const converse = createConverse(p1);
    // Testing 8 (not divisible by 3)
    const eval8 = evaluateCounterexample(converse, 8);
    expect(eval8.validDomain).toBe(true);
    expect(eval8.hypothesisSatisfied).toBe(false);
    expect(eval8.isCounterexample).toBe(false);
    expect(eval8.isHypothesisViolated).toBe(true);
  });

  it('classifies cases where both hypothesis and conclusion hold as supporting examples, NOT counterexamples', () => {
    const p1 = getPropositionById('prop-div6-div3');
    if (!p1) return;

    const converse = createConverse(p1);
    // Testing 12 (divisible by 3 AND divisible by 6)
    const eval12 = evaluateCounterexample(converse, 12);
    expect(eval12.hypothesisSatisfied).toBe(true);
    expect(eval12.conclusionSatisfied).toBe(true);
    expect(eval12.isCounterexample).toBe(false);
    expect(eval12.isSupportingExample).toBe(true);
  });

  it('searches counterexamples in a finite range and explicitly returns universal proof caveat', () => {
    const p1 = getPropositionById('prop-div6-div3');
    if (!p1) return;

    const converse = createConverse(p1);
    const rangeSearch = searchCounterexamplesInRange(converse, 1, 20);
    expect(rangeSearch.counterexamplesFound.length).toBeGreaterThan(0);
    expect(rangeSearch.counterexamplesFound).toContain(3);
    expect(rangeSearch.counterexamplesFound).toContain(9);
    expect(rangeSearch.counterexamplesFound).toContain(15);
    expect(rangeSearch.hasCounterexample).toBe(true);
    expect(rangeSearch.universalProofCaveat).toContain('counterexample');
  });
});

describe('5. Geometric Propositions: Baudhāyana-Pythagoras & Equal Diagonals', () => {
  it('correctly evaluates right triangle theorem and converse with triangle inequality validation', () => {
    // 3, 4, 5 is a valid right triangle
    const t345 = evaluatePythagorasTriangle(3, 4, 5);
    expect(t345.isValidTriangle).toBe(true);
    expect(t345.isRightAngled).toBe(true);
    expect(t345.sumOfSquaresAB).toBe(25);
    expect(t345.squareOfC).toBe(25);
    expect(t345.classification).toBe('right');

    // 5, 12, 13 is a valid right triangle
    const t51213 = evaluatePythagorasTriangle(5, 12, 13);
    expect(t51213.isValidTriangle).toBe(true);
    expect(t51213.isRightAngled).toBe(true);

    // 4, 5, 8 is an obtuse triangle (4^2 + 5^2 = 41 < 64)
    const t458 = evaluatePythagorasTriangle(4, 5, 8);
    expect(t458.isValidTriangle).toBe(true);
    expect(t458.isRightAngled).toBe(false);
    expect(t458.classification).toBe('obtuse');

    // 1, 2, 5 violates triangle inequality (1 + 2 < 5)
    const tInvalid = evaluatePythagorasTriangle(1, 2, 5);
    expect(tInvalid.isValidTriangle).toBe(false);
    expect(tInvalid.isRightAngled).toBe(false);
    expect(tInvalid.invalidationReason).toContain('Triangle inequality violated');
  });

  it('demonstrates counterexample to converse of rectangle equal diagonals theorem using isosceles trapezium', () => {
    const quadEval = evaluateEqualDiagonalsConverse('isosceles_trapezium');
    expect(quadEval.diagonalsEqual).toBe(true);
    expect(quadEval.isRectangle).toBe(false);
    expect(quadEval.isConverseCounterexample).toBe(true);
    expect(quadEval.explanation).toContain('VALID COUNTEREXAMPLE');
  });
});

describe('6. Deductive Proof Engine', () => {
  it('provides canonical proof templates with non-empty steps and reasons', () => {
    expect(CANONICAL_PROOF_TEMPLATES.length).toBeGreaterThanOrEqual(3);
    CANONICAL_PROOF_TEMPLATES.forEach((tpl) => {
      expect(tpl.id).toBeTruthy();
      expect(tpl.theoremTitle).toBeTruthy();
      expect(tpl.givens.length).toBeGreaterThan(0);
      expect(tpl.toProve).toBeTruthy();
      expect(tpl.candidateStatements.length).toBeGreaterThanOrEqual(3);
      expect(tpl.candidateReasons.length).toBeGreaterThanOrEqual(3);
      expect(tpl.idealSteps.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('validates a complete, logically ordered proof assembly', () => {
    const tpl = CANONICAL_PROOF_TEMPLATES.find((t) => t.id === 'proof-sum-even');
    expect(tpl).toBeDefined();
    if (!tpl) return;

    // Build perfect steps
    const assembledSteps = [
      { statementId: 's1', reasonId: 'r1' }, // Since a is even, a = 2m (Definition of Even Number)
      { statementId: 's2', reasonId: 'r1' }, // Since b is even, b = 2k (Definition of Even Number)
      { statementId: 's3', reasonId: 'r2' }, // a + b = 2m + 2k (Substitution / Addition)
      { statementId: 's4', reasonId: 'r3' }, // Factoring out 2: 2(m + k) (Distributive Property)
      { statementId: 's5', reasonId: 'r1' }, // m+k is int -> 2*(int) is even (Definition of Even Number)
    ];

    const report = validateProofAssembly(tpl, assembledSteps);
    expect(report.isFullyValid).toBe(true);
    expect(report.completedStepsCount).toBe(tpl.idealSteps.length);
    expect(report.feedbackMessage).toContain('Proof Complete');
  });

  it('detects and flags invalid steps, missing prerequisites, or wrong reasons', () => {
    const tpl = CANONICAL_PROOF_TEMPLATES.find((t) => t.id === 'proof-sum-even');
    if (!tpl) return;

    // Assembled with wrong reason for step 3
    const assembledSteps = [
      { statementId: 's1', reasonId: 'r1' },
      { statementId: 's2', reasonId: 'r1' },
      { statementId: 's3', reasonId: 'r5' }, // wrong reason! (Transitive Property instead of Substitution)
    ];

    const report = validateProofAssembly(tpl, assembledSteps);
    expect(report.isFullyValid).toBe(false);
    expect(report.feedbackMessage).toContain('not the correct justification');
  });

  it('rejects circular logic / distractor statements', () => {
    const tpl = CANONICAL_PROOF_TEMPLATES.find((t) => t.id === 'proof-sum-even');
    if (!tpl) return;

    // Assembled with distractor
    const assembledSteps = [
      { statementId: 'dist-1', reasonId: 'r1' },
    ];

    const report = validateProofAssembly(tpl, assembledSteps);
    expect(report.isFullyValid).toBe(false);
    expect(report.hasCircularLogic).toBe(true);
    expect(report.feedbackMessage).toContain('invalid deduction');
  });

  it('rejects prematurely concluding before prerequisites are proven', () => {
    const tpl = CANONICAL_PROOF_TEMPLATES.find((t) => t.id === 'proof-sum-even');
    if (!tpl) return;

    // Step s3 requires s1 and s2; attempting s3 first
    const assembledSteps = [
      { statementId: 's3', reasonId: 'r2' },
    ];

    const report = validateProofAssembly(tpl, assembledSteps);
    expect(report.isFullyValid).toBe(false);
    expect(report.feedbackMessage).toContain('placed prematurely');
  });
});

describe('7. Guided Curriculum & Matrix Alignment', () => {
  it('covers 12 progressive guided lessons conforming to educational contracts', () => {
    const lessonKeys = Object.keys(PROP_GUIDED_LESSONS);
    expect(lessonKeys.length).toBe(12);

    expect(PROP_GUIDED_UNITS.length).toBe(6);

    lessonKeys.forEach((key) => {
      const lesson = PROP_GUIDED_LESSONS[key];
      expect(lesson.id).toBeTruthy();
      expect(lesson.title).toBeTruthy();
      expect(lesson.learningObjective).toBeTruthy();
      expect(lesson.concept.detailedPoints.length).toBeGreaterThan(0);
      expect(lesson.stages.length).toBeGreaterThanOrEqual(2);
      expect(lesson.whyGuide.deductiveTakeaway).toBeTruthy();
    });
  });

  it('aligns to NCERT Ganita Manjari topics in curriculum matrix', () => {
    expect(NCERT_PROPOSITIONS_CURRICULUM_MATRIX.length).toBeGreaterThanOrEqual(10);
    NCERT_PROPOSITIONS_CURRICULUM_MATRIX.forEach((entry) => {
      expect(entry.topicNumber).toBeTruthy();
      expect(entry.topicTitle).toBeTruthy();
      expect(entry.ncertReference).toBeTruthy();
      expect(entry.coreConcepts.length).toBeGreaterThan(0);
    });
  });
});

describe('8. Chapter Practice Question Bank', () => {
  it('contains at least 30 verified questions across basic, standard, and challenge tiers', () => {
    expect(PROPOSITIONS_PRACTICE_BANK.length).toBeGreaterThanOrEqual(30);

    const basicCount = PROPOSITIONS_PRACTICE_BANK.filter((q) => q.difficulty === 'basic').length;
    const standardCount = PROPOSITIONS_PRACTICE_BANK.filter((q) => q.difficulty === 'standard').length;
    const challengeCount = PROPOSITIONS_PRACTICE_BANK.filter((q) => q.difficulty === 'challenge').length;

    expect(basicCount).toBeGreaterThanOrEqual(10);
    expect(standardCount).toBeGreaterThanOrEqual(10);
    expect(challengeCount).toBeGreaterThanOrEqual(10);
  });

  it('ensures all multiple-choice questions have valid options and a valid correctAnswer index', () => {
    PROPOSITIONS_PRACTICE_BANK.forEach((q) => {
      expect(q.id).toBeTruthy();
      expect(q.title).toBeTruthy();
      expect(q.statement).toBeTruthy();
      expect(q.hints.length).toBeGreaterThanOrEqual(1);
      expect(q.workedSolution.length).toBeGreaterThan(0);

      if (q.questionType === 'multiple_choice') {
        expect(q.options).toBeDefined();
        expect(q.options?.length).toBeGreaterThanOrEqual(3);
        const ansIdx = Number(q.correctAnswer);
        expect(ansIdx).toBeGreaterThanOrEqual(0);
        expect(ansIdx).toBeLessThan(q.options!.length);
      }
    });
  });
});

describe('9. Propositions Store & State Isolation', () => {
  it('initializes with default state without coupling to other chapter stores', () => {
    const state = usePropositionsStore.getState();
    expect(state.activeLessonId).toBe('prop-l1');
    expect(state.testedNumber).toBe(9);
    expect(state.selectedProofTemplateId).toBe('proof-sum-even');
    expect(state.assembledProofSteps.length).toBe(0);
  });

  it('correctly updates tested number and manages proof steps', () => {
    const { setTestedNumber, setSelectedProofTemplate, addProofStep, clearProofSteps } =
      usePropositionsStore.getState();

    setTestedNumber(15);
    expect(usePropositionsStore.getState().testedNumber).toBe(15);

    setSelectedProofTemplate('proof-div6-div3');
    expect(usePropositionsStore.getState().selectedProofTemplateId).toBe('proof-div6-div3');

    addProofStep('s1', 'r1');
    expect(usePropositionsStore.getState().assembledProofSteps.length).toBe(1);

    clearProofSteps();
    expect(usePropositionsStore.getState().assembledProofSteps.length).toBe(0);
  });

  it('computes completion statistics correctly', () => {
    const stats = usePropositionsStore.getState().getCompletionStats();
    expect(stats.totalLessonsCount).toBe(12);
    expect(stats.completedLessonsCount).toBeGreaterThanOrEqual(0);
    expect(stats.nextRecommendedLessonId).toBeTruthy();
  });
});
