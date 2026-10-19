/**
 * Structured Deductive Proof Engine
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

import type {
  ProofTemplate,
  ProofValidationReport,
} from './types';

// ============================================================================
// Canonical Proof Templates
// ============================================================================

export const CANONICAL_PROOF_TEMPLATES: ProofTemplate[] = [
  // --------------------------------------------------------------------------
  // Theorem 1: Sum of Two Even Numbers
  // --------------------------------------------------------------------------
  {
    id: 'proof-sum-even',
    theoremTitle: 'Sum of Two Even Integers',
    claimStatement: 'The sum of any two even integers is an even integer.',
    givens: ['a is an even integer', 'b is an even integer'],
    toProve: 'a + b is an even integer',
    contextNotes:
      'A formal deductive proof using the definition of even integers (n = 2k for some integer k) and algebraic factoring.',
    idealSteps: [
      {
        id: 's1',
        statement: 'Since a is even, a = 2m for some integer m.',
        requiredReason: 'Definition of Even Number',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: [],
        explanation: 'Every even number by definition can be represented as twice an integer.',
      },
      {
        id: 's2',
        statement: 'Since b is even, b = 2k for some integer k.',
        requiredReason: 'Definition of Even Number',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: [],
        explanation: 'Similarly, b can be written as 2k.',
      },
      {
        id: 's3',
        statement: 'The sum is a + b = 2m + 2k.',
        requiredReason: 'Substitution / Addition',
        allowedReasonTypes: ['substitution', 'algebraic_simplification'],
        prerequisiteStepIds: ['s1', 's2'],
        explanation: 'Substitute 2m for a and 2k for b into the sum.',
      },
      {
        id: 's4',
        statement: 'Factoring out 2 gives a + b = 2(m + k).',
        requiredReason: 'Distributive Property',
        allowedReasonTypes: ['algebraic_simplification'],
        prerequisiteStepIds: ['s3'],
        explanation: 'Apply the distributive law: 2m + 2k = 2(m + k).',
      },
      {
        id: 's5',
        statement: 'Since m + k is an integer, a + b is of the form 2 · (integer), hence even.',
        requiredReason: 'Definition of Even Number',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: ['s4'],
        explanation: 'Closure of integers under addition ensures m + k is an integer, completing the proof.',
      },
    ],
    candidateStatements: [
      { id: 's1', statement: 'Since a is even, a = 2m for some integer m.' },
      { id: 's2', statement: 'Since b is even, b = 2k for some integer k.' },
      { id: 's3', statement: 'The sum is a + b = 2m + 2k.' },
      { id: 's4', statement: 'Factoring out 2 gives a + b = 2(m + k).' },
      { id: 's5', statement: 'Since m + k is an integer, a + b is of the form 2 · (integer), hence even.' },
      {
        id: 'dist-1',
        statement: 'We tested 2 + 4 = 6 and 4 + 8 = 12, which are both even.',
        isDistractor: true,
        distractorFeedback: 'Checking specific numerical examples is empirical observation, not a general deductive proof.',
      },
      {
        id: 'dist-2',
        statement: 'Assume a + b is odd; then its converse must be even.',
        isDistractor: true,
        distractorFeedback: 'This introduces circular terminology; a converse applies to conditional statements, not numbers.',
      },
    ],
    candidateReasons: [
      { id: 'r1', text: 'Definition of Even Number', type: 'definition' },
      { id: 'r2', text: 'Substitution / Addition', type: 'substitution' },
      { id: 'r3', text: 'Distributive Property', type: 'algebraic_simplification' },
      { id: 'r4', text: 'Given', type: 'given' },
      { id: 'r5', text: 'Empirical Trial', type: 'empirical_trial' },
    ],
  },

  // --------------------------------------------------------------------------
  // Theorem 2: Divisibility by 6 implies Divisibility by 3
  // --------------------------------------------------------------------------
  {
    id: 'proof-div6-implies-3',
    theoremTitle: 'Divisibility Deduction: 6 implies 3',
    claimStatement: 'If a positive integer n is divisible by 6, then n is divisible by 3.',
    givens: ['n is a positive integer', 'n is divisible by 6'],
    toProve: 'n is divisible by 3',
    contextNotes:
      'Proving logical implication via definition of divisibility and prime factorization of the divisor.',
    idealSteps: [
      {
        id: 'd1',
        statement: 'Since n is divisible by 6, n = 6k for some positive integer k.',
        requiredReason: 'Definition of Divisibility',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: [],
        explanation: 'Divisibility by 6 means n is an integer multiple of 6.',
      },
      {
        id: 'd2',
        statement: 'We can express 6 as 3 × 2, so n = (3 × 2)k.',
        requiredReason: 'Prime Factorization of 6',
        allowedReasonTypes: ['algebraic_simplification', 'definition'],
        prerequisiteStepIds: ['d1'],
        explanation: 'Decompose the divisor 6 into 3 × 2.',
      },
      {
        id: 'd3',
        statement: 'By the associative property of multiplication, n = 3 × (2k).',
        requiredReason: 'Associative Property of Multiplication',
        allowedReasonTypes: ['algebraic_simplification'],
        prerequisiteStepIds: ['d2'],
        explanation: 'Regroup factors to isolate the divisor 3.',
      },
      {
        id: 'd4',
        statement: 'Since k is an integer, 2k is an integer; thus n is a multiple of 3, so n is divisible by 3.',
        requiredReason: 'Definition of Divisibility',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: ['d3'],
        explanation: 'Because n = 3m where m = 2k is an integer, n is divisible by 3.',
      },
    ],
    candidateStatements: [
      { id: 'd1', statement: 'Since n is divisible by 6, n = 6k for some positive integer k.' },
      { id: 'd2', statement: 'We can express 6 as 3 × 2, so n = (3 × 2)k.' },
      { id: 'd3', statement: 'By the associative property of multiplication, n = 3 × (2k).' },
      { id: 'd4', statement: 'Since k is an integer, 2k is an integer; thus n is a multiple of 3, so n is divisible by 3.' },
      {
        id: 'd-dist-1',
        statement: 'If n is divisible by 3, then n is divisible by 6.',
        isDistractor: true,
        distractorFeedback: 'This is the converse statement, which is false (counterexample n=9) and not what we are proving.',
      },
    ],
    candidateReasons: [
      { id: 'dr1', text: 'Definition of Divisibility', type: 'definition' },
      { id: 'dr2', text: 'Prime Factorization of 6', type: 'algebraic_simplification' },
      { id: 'dr3', text: 'Associative Property of Multiplication', type: 'algebraic_simplification' },
      { id: 'dr4', text: 'Given', type: 'given' },
    ],
  },

  // --------------------------------------------------------------------------
  // Theorem 3: Converse of Isosceles Triangle Theorem
  // --------------------------------------------------------------------------
  {
    id: 'proof-converse-isosceles',
    theoremTitle: 'Converse of Isosceles Triangle Theorem',
    claimStatement: 'If two angles of a triangle are equal, then the sides opposite to them are equal.',
    givens: ['In triangle ABC, ∠B = ∠C'],
    toProve: 'Side AB = Side AC',
    contextNotes:
      'Geometric proof using auxiliary angle bisector construction and the AAS congruence criterion.',
    idealSteps: [
      {
        id: 'g1',
        statement: 'Draw the angle bisector AD of ∠A intersecting BC at point D.',
        requiredReason: 'Construction',
        allowedReasonTypes: ['axiom', 'definition'],
        prerequisiteStepIds: [],
        explanation: 'Introduce an auxiliary angle bisector to divide the triangle into two sub-triangles.',
      },
      {
        id: 'g2',
        statement: 'In △ABD and △ACD: ∠BAD = ∠CAD.',
        requiredReason: 'Definition of Angle Bisector',
        allowedReasonTypes: ['definition'],
        prerequisiteStepIds: ['g1'],
        explanation: 'AD bisects ∠BAC by construction.',
      },
      {
        id: 'g3',
        statement: '∠B = ∠C.',
        requiredReason: 'Given',
        allowedReasonTypes: ['given'],
        prerequisiteStepIds: [],
        explanation: 'Equality of base angles is the given hypothesis.',
      },
      {
        id: 'g4',
        statement: 'AD = AD.',
        requiredReason: 'Common Side',
        allowedReasonTypes: ['axiom'],
        prerequisiteStepIds: ['g1'],
        explanation: 'The segment AD is shared by both triangles.',
      },
      {
        id: 'g5',
        statement: '△ABD ≅ △ACD.',
        requiredReason: 'AAS Congruence Criterion',
        allowedReasonTypes: ['theorem', 'axiom'],
        prerequisiteStepIds: ['g2', 'g3', 'g4'],
        explanation: 'Two angles and a non-included side are equal, so AAS congruence applies.',
      },
      {
        id: 'g6',
        statement: 'Therefore, AB = AC.',
        requiredReason: 'CPCTC (Corresponding Parts of Congruent Triangles)',
        allowedReasonTypes: ['definition', 'theorem'],
        prerequisiteStepIds: ['g5'],
        explanation: 'Corresponding sides of congruent triangles are equal.',
      },
    ],
    candidateStatements: [
      { id: 'g1', statement: 'Draw the angle bisector AD of ∠A intersecting BC at point D.' },
      { id: 'g2', statement: 'In △ABD and △ACD: ∠BAD = ∠CAD.' },
      { id: 'g3', statement: '∠B = ∠C.' },
      { id: 'g4', statement: 'AD = AD.' },
      { id: 'g5', statement: '△ABD ≅ △ACD.' },
      { id: 'g6', statement: 'Therefore, AB = AC.' },
      {
        id: 'g-dist-1',
        statement: 'Because AB = AC, ∠B must equal ∠C.',
        isDistractor: true,
        distractorFeedback: 'Circular reasoning! AB = AC is the conclusion to be proved; it cannot be used as a premise.',
      },
    ],
    candidateReasons: [
      { id: 'gr1', text: 'Construction', type: 'axiom' },
      { id: 'gr2', text: 'Definition of Angle Bisector', type: 'definition' },
      { id: 'gr3', text: 'Given', type: 'given' },
      { id: 'gr4', text: 'Common Side', type: 'axiom' },
      { id: 'gr5', text: 'AAS Congruence Criterion', type: 'theorem' },
      { id: 'gr6', text: 'CPCTC (Corresponding Parts of Congruent Triangles)', type: 'definition' },
    ],
  },
];

// ============================================================================
// Proof Step Validation Logic
// ============================================================================

export function validateProofAssembly(
  template: ProofTemplate,
  assembledSteps: { statementId: string; reasonId: string }[]
): ProofValidationReport {
  const idealStepsMap = new Map(template.idealSteps.map((s) => [s.id, s]));
  const candidateStatementsMap = new Map(template.candidateStatements.map((c) => [c.id, c]));
  const candidateReasonsMap = new Map(template.candidateReasons.map((r) => [r.id, r]));

  const establishedStepIds = new Set<string>();
  const unsupportedStepNumbers: number[] = [];
  let hasCircularLogic = false;

  for (let i = 0; i < assembledSteps.length; i++) {
    const { statementId, reasonId } = assembledSteps[i];
    const candidateStmt = candidateStatementsMap.get(statementId);
    const candidateReason = candidateReasonsMap.get(reasonId);
    const stepNumber = i + 1;

    // Check distractor
    if (candidateStmt?.isDistractor) {
      return {
        isFullyValid: false,
        completedStepsCount: i,
        totalRequiredSteps: template.idealSteps.length,
        hasCircularLogic: true,
        unsupportedStepNumbers: [stepNumber],
        feedbackMessage: `Step ${stepNumber} contains an invalid deduction: "${candidateStmt.statement}". ${candidateStmt.distractorFeedback || ''}`,
      };
    }

    // A step can be used only once: repeating a step is not progress.
    if (establishedStepIds.has(statementId)) {
      return {
        isFullyValid: false,
        completedStepsCount: i,
        totalRequiredSteps: template.idealSteps.length,
        hasCircularLogic: false,
        unsupportedStepNumbers: [stepNumber],
        feedbackMessage: `Step ${stepNumber} repeats a statement you already used. Each step of a proof says something new that follows from what came before.`,
        nextHelpfulHint: 'Choose the next statement that follows from the steps already placed.',
      };
    }

    const idealStep = idealStepsMap.get(statementId);
    if (!idealStep) {
      unsupportedStepNumbers.push(stepNumber);
      continue;
    }

    // Check prerequisites
    const missingPrereqs = idealStep.prerequisiteStepIds.filter((pId) => !establishedStepIds.has(pId));
    if (missingPrereqs.length > 0) {
      unsupportedStepNumbers.push(stepNumber);
      return {
        isFullyValid: false,
        completedStepsCount: i,
        totalRequiredSteps: template.idealSteps.length,
        hasCircularLogic: false,
        unsupportedStepNumbers: [stepNumber],
        feedbackMessage: `Step ${stepNumber} is placed prematurely. It depends on facts that have not yet been established in earlier steps.`,
        nextHelpfulHint: `Look for prerequisite statements that provide the necessary foundation.`,
      };
    }

    // Check reason suitability
    if (candidateReason) {
      // The reason must be the actual justification for this step. A reason of the
      // "right kind" is not enough (a test run is not a definition).
      const reasonMatches = candidateReason.text.toLowerCase().trim() === idealStep.requiredReason.toLowerCase().trim();

      if (!reasonMatches) {
        return {
          isFullyValid: false,
          completedStepsCount: i,
          totalRequiredSteps: template.idealSteps.length,
          hasCircularLogic: false,
          unsupportedStepNumbers: [stepNumber],
          feedbackMessage: `Step ${stepNumber}: Reason "${candidateReason.text}" is not the correct justification for this statement.`,
          nextHelpfulHint: `Consider what rule or definition directly supports "${idealStep.statement}".`,
        };
      }
    } else {
      unsupportedStepNumbers.push(stepNumber);
      return {
        isFullyValid: false,
        completedStepsCount: i,
        totalRequiredSteps: template.idealSteps.length,
        hasCircularLogic: false,
        unsupportedStepNumbers: [stepNumber],
        feedbackMessage: `Step ${stepNumber} is missing a selected justification reason.`,
      };
    }

    establishedStepIds.add(statementId);
  }

  const completedStepsCount = establishedStepIds.size;
  // Every required step, each once, with its own justification.
  const isFullyValid =
    completedStepsCount === template.idealSteps.length &&
    assembledSteps.length === template.idealSteps.length &&
    template.idealSteps.every((s) => establishedStepIds.has(s.id)) &&
    unsupportedStepNumbers.length === 0 &&
    !hasCircularLogic;

  let feedbackMessage = '';
  if (isFullyValid) {
    feedbackMessage = 'Proof Complete & Verified! All logical implications follow strictly from given premises and established inference rules.';
  } else if (completedStepsCount < template.idealSteps.length) {
    feedbackMessage = `Progress: ${completedStepsCount} of ${template.idealSteps.length} valid steps assembled. Add the next logical step to reach the conclusion.`;
  }

  return {
    isFullyValid,
    completedStepsCount,
    totalRequiredSteps: template.idealSteps.length,
    hasCircularLogic,
    unsupportedStepNumbers,
    feedbackMessage,
  };
}

export function getProofTemplateById(id: string): ProofTemplate | undefined {
  return CANONICAL_PROOF_TEMPLATES.find((t) => t.id === id);
}
