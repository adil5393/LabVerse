/**
 * Core Types for Propositions and Their Converses (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 */

export type PropositionDomainId =
  | 'integers'
  | 'positive_integers'
  | 'whole_numbers'
  | 'natural_numbers'
  | 'triangles'
  | 'quadrilaterals'
  | 'polygons'
  | 'real_numbers';

export interface PropositionDomain<T = unknown> {
  id: PropositionDomainId;
  name: string;
  description: string;
  contains: (value: T) => boolean;
  sampleValues?: T[];
}

export type StatementType = 'proposition' | 'question' | 'command' | 'exclamation' | 'subjective_opinion';

export interface ClassifiedStatement {
  id: string;
  statement: string;
  type: StatementType;
  isProposition: boolean;
  truthValue?: boolean; // defined only if isProposition === true
  explanation: string;
  pedagogicalNote?: string;
}

export type TruthPossibilityCategory =
  | 'both_true'
  | 'original_true_converse_false'
  | 'original_false_converse_true'
  | 'both_false';

export interface ConditionalProposition<T = unknown> {
  id: string;
  title: string;
  domain: PropositionDomain<T>;
  domainDescription: string;
  naturalStatement: string; // "If a number is divisible by 6, then it is divisible by 3."
  hypothesisText: string; // "A number is divisible by 6" (P)
  conclusionText: string; // "It is divisible by 3" (Q)
  converseNaturalStatement: string; // "If a number is divisible by 3, then it is divisible by 6."
  
  hypothesis: (value: T) => boolean;
  conclusion: (value: T) => boolean;

  isOriginalTrue: boolean;
  isConverseTrue: boolean;
  truthCategory: TruthPossibilityCategory;

  originalCounterexampleHint?: string;
  converseCounterexampleHint?: string;
  
  knownOriginalCounterexamples?: T[];
  knownConverseCounterexamples?: T[];
  
  mathematicalExplanation: string;
  converseExplanation: string;
}

export interface CounterexampleEvaluation<T = unknown> {
  value: T;
  validDomain: boolean;
  hypothesisSatisfied: boolean;
  conclusionSatisfied: boolean;
  isSupportingExample: boolean; // P(x) = true AND Q(x) = true
  isCounterexample: boolean; // P(x) = true AND Q(x) = false
  isHypothesisViolated: boolean; // P(x) = false
  diagnosticMessage: string;
  detailedAnalysis: string;
}

export interface RangeSearchResult<T = unknown> {
  searchedRangeDescription: string;
  totalTested: number;
  counterexamplesFound: T[];
  hasCounterexample: boolean;
  explanation: string;
  universalProofCaveat: string;
}

// ============================================================================
// Geometry Reasoning Types
// ============================================================================

export type TriangleAngleClassification = 'right' | 'acute' | 'obtuse';

export interface TriangleReasoningState {
  sideA: number;
  sideB: number;
  sideC: number; // longest side
  isValidTriangle: boolean;
  invalidationReason?: string;
  sumOfSquaresAB: number; // a^2 + b^2
  squareOfC: number; // c^2
  diffSquares: number; // |(a^2 + b^2) - c^2|
  isRightAngled: boolean;
  classification: TriangleAngleClassification;
  pythagorasSatisfied: boolean;
  converseTheoremSatisfied: boolean;
  computedAngleDegreesC: number;
}

export interface QuadrilateralReasoningState {
  name: string;
  type: 'rectangle' | 'square' | 'isosceles_trapezium' | 'parallelogram' | 'rhombus' | 'kite' | 'general';
  diagonalsEqual: boolean;
  isRectangle: boolean;
  diagonalLengthAC: number;
  diagonalLengthBD: number;
  isConverseCounterexample: boolean;
  explanation: string;
  /** The figure's corners (in order) and their names: the diagram draws exactly these. */
  vertices: { x: number; y: number }[];
  vertexLabels: string[];
}

// ============================================================================
// Proof Engine Types
// ============================================================================

export type ProofReasonType =
  | 'given'
  | 'definition'
  | 'axiom'
  | 'theorem'
  | 'algebraic_simplification'
  | 'substitution'
  | 'modus_ponens'
  | 'empirical_trial';

export interface ProofStepTemplate {
  id: string;
  statement: string;
  requiredReason: string;
  allowedReasonTypes: ProofReasonType[];
  prerequisiteStepIds: string[]; // Steps that must be established before this one
  explanation: string;
}

export interface CandidateStatement {
  id: string;
  statement: string;
  isDistractor?: boolean;
  distractorFeedback?: string;
}

export interface CandidateReason {
  id: string;
  text: string;
  type: ProofReasonType;
}

export interface ProofTemplate {
  id: string;
  theoremTitle: string;
  claimStatement: string;
  givens: string[];
  toProve: string;
  idealSteps: ProofStepTemplate[];
  candidateStatements: CandidateStatement[];
  candidateReasons: CandidateReason[];
  contextNotes: string;
}

export interface AssembledProofStep {
  stepNumber: number;
  statementId: string;
  statementText: string;
  reasonId: string;
  reasonText: string;
  isStatementCorrect: boolean;
  isReasonCorrect: boolean;
  arePrerequisitesMet: boolean;
  errorMessage?: string;
  isValid: boolean;
}

export interface ProofValidationReport {
  isFullyValid: boolean;
  completedStepsCount: number;
  totalRequiredSteps: number;
  hasCircularLogic: boolean;
  unsupportedStepNumbers: number[];
  feedbackMessage: string;
  nextHelpfulHint?: string;
}

// ============================================================================
// Practice Engine Types
// ============================================================================

export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

export type PracticeQuestionType =
  | 'true_false'
  | 'multiple_choice'
  | 'numerical'
  | 'hypothesis_conclusion'
  | 'form_converse'
  | 'find_counterexample'
  | 'proof_step';

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  topicId: string;
  ncertReference?: string;
  statement: string;
  options?: string[];
  correctAnswer: string | number;
  acceptableTolerance?: number;
  hints: string[];
  workedSolution: string[];
  explanation: string;
}

export type PropositionsWorkbenchTab =
  | 'statement_explorer'
  | 'counterexample_lab'
  | 'number_experiment'
  | 'geometry_reasoning'
  | 'proof_workbench';

export type PropositionsMode = 'explore' | 'practice';

export interface PropositionExperiment {
  id: string;
  title: string;
  subtitle: string;
  unitId: string;
  lessonId: string;
  description: string;
  defaultTab: PropositionsWorkbenchTab;
  availableTabs: PropositionsWorkbenchTab[];
  primaryPropositionId?: string;
  learningGoals: string[];
}
