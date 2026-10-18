/**
 * Counterexample Engine
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import type {
  ConditionalProposition,
  CounterexampleEvaluation,
  RangeSearchResult,
  QuadrilateralReasoningState,
  TriangleReasoningState,
} from './types';

/**
 * Mathematically evaluates an input against a conditional proposition "If P, then Q".
 * A counterexample exists if and only if P(x) = true and Q(x) = false.
 */
export function evaluateCounterexample<T>(
  prop: ConditionalProposition<T>,
  value: T
): CounterexampleEvaluation<T> {
  // 1. Verify Domain
  const validDomain = prop.domain.contains(value);
  if (!validDomain) {
    return {
      value,
      validDomain: false,
      hypothesisSatisfied: false,
      conclusionSatisfied: false,
      isSupportingExample: false,
      isCounterexample: false,
      isHypothesisViolated: true,
      diagnosticMessage: `Input ${String(value)} is outside the declared domain: ${prop.domain.name}.`,
      detailedAnalysis: `The proposition is only stated for ${prop.domainDescription}. Values outside this domain cannot be evaluated as valid counterexamples.`,
    };
  }

  // 2. Evaluate Hypothesis P(x) and Conclusion Q(x)
  const hypothesisSatisfied = prop.hypothesis(value);
  const conclusionSatisfied = prop.conclusion(value);

  // 3. Classify Educational Status
  const isCounterexample = hypothesisSatisfied && !conclusionSatisfied;
  const isSupportingExample = hypothesisSatisfied && conclusionSatisfied;
  const isHypothesisViolated = !hypothesisSatisfied;

  let diagnosticMessage = '';
  let detailedAnalysis = '';

  if (isCounterexample) {
    diagnosticMessage = `Counterexample Discovered! ${String(value)} disproves the statement.`;
    detailedAnalysis = `Condition P ("${prop.hypothesisText}") is TRUE for ${String(value)}, but conclusion Q ("${prop.conclusionText}") is FALSE. Because a universal proposition claims Q holds whenever P holds, this single counterexample definitively disproves the universal claim.`;
  } else if (isSupportingExample) {
    diagnosticMessage = `Supporting Example: ${String(value)} satisfies both conditions.`;
    detailedAnalysis = `Condition P ("${prop.hypothesisText}") is TRUE, and conclusion Q ("${prop.conclusionText}") is also TRUE. This example confirms the pattern for ${String(value)}, but checking examples alone cannot establish universal mathematical truth for all infinite values.`;
  } else {
    diagnosticMessage = `Premise Not Satisfied: Hypothesis is FALSE for ${String(value)}.`;
    detailedAnalysis = `Condition P ("${prop.hypothesisText}") is FALSE for ${String(value)}. An implication "If P, then Q" only makes a promise when P is true. Therefore, ${String(value)} cannot serve as a counterexample because it never satisfied the original conditions.`;
  }

  return {
    value,
    validDomain: true,
    hypothesisSatisfied,
    conclusionSatisfied,
    isSupportingExample,
    isCounterexample,
    isHypothesisViolated,
    diagnosticMessage,
    detailedAnalysis,
  };
}

/**
 * Finite search for counterexamples across a bounded integer range.
 * Explicitly surfaces the pedagogical caveat that finite empirical testing is not universal proof.
 */
export function searchCounterexamplesInRange(
  prop: ConditionalProposition<number>,
  start: number,
  end: number,
  maxToFind = 10
): RangeSearchResult<number> {
  const min = Math.min(start, end);
  const max = Math.max(start, end);
  const counterexamplesFound: number[] = [];
  let totalTested = 0;

  for (let n = min; n <= max; n++) {
    if (prop.domain.contains(n)) {
      totalTested++;
      const hyp = prop.hypothesis(n);
      const conc = prop.conclusion(n);
      if (hyp && !conc) {
        counterexamplesFound.push(n);
        if (counterexamplesFound.length >= maxToFind) break;
      }
    }
  }

  const hasCounterexample = counterexamplesFound.length > 0;
  const searchedRangeDescription = `Integers n from ${min} to ${max}`;

  const explanation = hasCounterexample
    ? `Found ${counterexamplesFound.length} counterexample(s) in range [${min}, ${max}]: ${counterexamplesFound.join(', ')}. The statement is FALSE.`
    : `No counterexamples found in the range [${min}, ${max}] (tested ${totalTested} values).`;

  const universalProofCaveat = hasCounterexample
    ? `A single counterexample is sufficient to disprove a universal claim.`
    : `WARNING: Absence of counterexamples in the finite interval [${min}, ${max}] does NOT prove that the statement is universally true for all infinite numbers. A deductive proof is required.`;

  return {
    searchedRangeDescription,
    totalTested,
    counterexamplesFound,
    hasCounterexample,
    explanation,
    universalProofCaveat,
  };
}

// ============================================================================
// Geometric Counterexample Models
// ============================================================================

/**
 * Investigates the converse: "If a quadrilateral has equal diagonals, then it is a rectangle."
 * Counterexample: Isosceles Trapezium (equal diagonals, but not a rectangle).
 */
export function evaluateEqualDiagonalsConverse(
  quadType: 'rectangle' | 'isosceles_trapezium' | 'square' | 'rhombus' | 'general'
): QuadrilateralReasoningState {
  if (quadType === 'rectangle' || quadType === 'square') {
    return {
      name: quadType === 'square' ? 'Square ABCD' : 'Rectangle ABCD',
      type: quadType,
      diagonalsEqual: true,
      isRectangle: true,
      diagonalLengthAC: 5.0,
      diagonalLengthBD: 5.0,
      isConverseCounterexample: false,
      explanation: 'Both diagonals are equal, and the figure IS a rectangle (all 4 interior angles are 90°). This is a supporting example.',
    };
  }

  if (quadType === 'isosceles_trapezium') {
    return {
      name: 'Isosceles Trapezium PQRS',
      type: 'isosceles_trapezium',
      diagonalsEqual: true,
      isRectangle: false,
      diagonalLengthAC: 6.4,
      diagonalLengthBD: 6.4,
      isConverseCounterexample: true,
      explanation:
        'VALID COUNTEREXAMPLE: Diagonals PR and QS are equal in length (PR = QS = 6.4), but the angles are not 90° (it is an isosceles trapezium with non-parallel sides equal). Hence, having equal diagonals does NOT guarantee a rectangle.',
    };
  }

  return {
    name: 'General Quadrilateral ABCD',
    type: 'general',
    diagonalsEqual: false,
    isRectangle: false,
    diagonalLengthAC: 4.8,
    diagonalLengthBD: 6.2,
    isConverseCounterexample: false,
    explanation: 'Diagonals are unequal; hypothesis is not satisfied.',
  };
}

/**
 * Investigates Baudhāyana-Pythagoras theorem and converse for triangle side lengths (a, b, c).
 * Assumes c is the longest side.
 */
export function evaluatePythagorasTriangle(
  a: number,
  b: number,
  c: number
): TriangleReasoningState {
  // Validate Triangle Inequality: a + b > c (when c is longest)
  const sides = [a, b, c].sort((x, y) => x - y);
  const sA = sides[0];
  const sB = sides[1];
  const sC = sides[2];

  if (sA <= 0 || sB <= 0 || sC <= 0) {
    return {
      sideA: sA,
      sideB: sB,
      sideC: sC,
      isValidTriangle: false,
      invalidationReason: 'Side lengths must be positive numbers.',
      sumOfSquaresAB: sA * sA + sB * sB,
      squareOfC: sC * sC,
      diffSquares: Math.abs(sA * sA + sB * sB - sC * sC),
      isRightAngled: false,
      classification: 'acute',
      pythagorasSatisfied: false,
      converseTheoremSatisfied: false,
      computedAngleDegreesC: 0,
    };
  }

  if (sA + sB <= sC) {
    return {
      sideA: sA,
      sideB: sB,
      sideC: sC,
      isValidTriangle: false,
      invalidationReason: `Triangle inequality violated: ${sA} + ${sB} = ${sA + sB} is not strictly greater than ${sC}. The two shorter sides cannot meet to form a closed triangle.`,
      sumOfSquaresAB: sA * sA + sB * sB,
      squareOfC: sC * sC,
      diffSquares: Math.abs(sA * sA + sB * sB - sC * sC),
      isRightAngled: false,
      classification: 'acute',
      pythagorasSatisfied: false,
      converseTheoremSatisfied: false,
      computedAngleDegreesC: 0,
    };
  }

  const sumOfSquaresAB = sA * sA + sB * sB;
  const squareOfC = sC * sC;
  const diffSquares = Math.abs(sumOfSquaresAB - squareOfC);

  // Exact or near-exact tolerance for floating point representations
  const isRightAngled = diffSquares < 1e-5;

  // Law of Cosines: cos(C) = (a^2 + b^2 - c^2) / (2ab)
  const cosC = Math.max(-1, Math.min(1, (sumOfSquaresAB - squareOfC) / (2 * sA * sB)));
  const angleRad = Math.acos(cosC);
  const computedAngleDegreesC = (angleRad * 180) / Math.PI;

  let classification: 'right' | 'acute' | 'obtuse' = 'acute';
  if (isRightAngled) {
    classification = 'right';
  } else if (sumOfSquaresAB < squareOfC) {
    classification = 'obtuse'; // angle opposite c > 90°
  } else {
    classification = 'acute'; // angle opposite c < 90°
  }

  return {
    sideA: sA,
    sideB: sB,
    sideC: sC,
    isValidTriangle: true,
    sumOfSquaresAB,
    squareOfC,
    diffSquares,
    isRightAngled,
    classification,
    pythagorasSatisfied: isRightAngled,
    converseTheoremSatisfied: isRightAngled,
    computedAngleDegreesC,
  };
}
