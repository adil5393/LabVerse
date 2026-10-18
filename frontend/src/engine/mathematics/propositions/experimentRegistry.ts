/**
 * Experiment Registry for Propositions and Their Converses (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 */

import type { PropositionExperiment } from './types';

export const PROPOSITION_EXPERIMENTS: PropositionExperiment[] = [
  // ==========================================================================
  // Unit 1: Understanding Mathematical Statements
  // ==========================================================================
  {
    id: 'exp-prop-classification',
    title: 'Statements and Propositions',
    subtitle: 'Distinguishing Propositions from Questions, Commands & Opinions',
    unitId: 'unit-1',
    lessonId: 'prop-l1',
    description:
      'Explore declarative sentences that can be classified objectively as true or false. Discover why mathematical propositions cannot depend on personal taste.',
    defaultTab: 'statement_explorer',
    availableTabs: ['statement_explorer', 'number_experiment'],
    primaryPropositionId: 'prop-div2-even-units',
    learningGoals: [
      'Identify whether a mathematical sentence is a proposition',
      'Distinguish questions, commands, and subjective claims from propositions',
      'Understand that false propositions are still valid propositions',
    ],
  },
  {
    id: 'exp-hypothesis-conclusion',
    title: 'Hypothesis and Conclusion',
    subtitle: 'Deconstructing Conditional Statements (If P, then Q)',
    unitId: 'unit-1',
    lessonId: 'prop-l2',
    description:
      'Identify the given hypothesis (antecedent P) and the resulting conclusion (consequent Q). Translate natural language mathematical statements into rigorous if–then form.',
    defaultTab: 'statement_explorer',
    availableTabs: ['statement_explorer', 'counterexample_lab'],
    primaryPropositionId: 'prop-div6-div3',
    learningGoals: [
      'Extract the hypothesis P and conclusion Q from conditional propositions',
      'Translate natural claims ("All multiples of 6 are multiples of 3") into if–then format',
      'Recognize logical implication and conditions',
    ],
  },

  // ==========================================================================
  // Unit 2: Converses
  // ==========================================================================
  {
    id: 'exp-forming-converses',
    title: 'Forming a Converse',
    subtitle: 'Reversing Hypothesis and Conclusion',
    unitId: 'unit-2',
    lessonId: 'prop-l3',
    description:
      'Interactively reverse hypothesis and conclusion to form the converse statement (If Q, then P). Explore why reversing does not guarantee preservation of truth.',
    defaultTab: 'statement_explorer',
    availableTabs: ['statement_explorer', 'counterexample_lab', 'number_experiment'],
    primaryPropositionId: 'prop-div6-div3',
    learningGoals: [
      'Form the converse of any conditional proposition',
      'Compare original and converse statements side-by-side',
      'Observe that swapping parts produces a distinct mathematical claim',
    ],
  },
  {
    id: 'exp-truth-converses',
    title: 'Truth of a Proposition and Its Converse',
    subtitle: 'Exploring the 4 Logical Truth Possibilities',
    unitId: 'unit-2',
    lessonId: 'prop-l4',
    description:
      'Investigate all four logical combinations: both true, original true converse false, original false converse true, and both false.',
    defaultTab: 'statement_explorer',
    availableTabs: ['statement_explorer', 'counterexample_lab', 'number_experiment'],
    primaryPropositionId: 'prop-prime-odd',
    learningGoals: [
      'Explore examples where both proposition and converse are true',
      'Discover propositions whose converses are false',
      'Classify statements into the 4 truth categories',
    ],
  },

  // ==========================================================================
  // Unit 3: Counterexamples
  // ==========================================================================
  {
    id: 'exp-counterexamples-intro',
    title: 'Finding Counterexamples',
    subtitle: 'The Power of a Single Disproving Case',
    unitId: 'unit-3',
    lessonId: 'prop-l5',
    description:
      'Discover counterexamples interactively. Learn that a valid counterexample must satisfy the hypothesis P while violating the conclusion Q.',
    defaultTab: 'counterexample_lab',
    availableTabs: ['counterexample_lab', 'statement_explorer', 'number_experiment'],
    primaryPropositionId: 'prop-div6-div3',
    learningGoals: [
      'Understand the definition of a mathematical counterexample',
      'Distinguish a counterexample from a supporting example and an irrelevant case',
      'Use counterexamples to disprove universal claims',
    ],
  },
  {
    id: 'exp-number-properties',
    title: 'Number Property Laboratory',
    subtitle: 'Divisibility, Parity, Multiples & Squares',
    unitId: 'unit-3',
    lessonId: 'prop-l6',
    description:
      'Investigate divisibility, even and odd arithmetic, factorizations, and square numbers with visual widgets, factor grids, and bounded automated searches.',
    defaultTab: 'number_experiment',
    availableTabs: ['number_experiment', 'counterexample_lab', 'statement_explorer'],
    primaryPropositionId: 'prop-div4-even',
    learningGoals: [
      'Test divisibility and parity hypotheses with custom and slider inputs',
      'Investigate patterns in square numbers and prime factorizations',
      'Analyze counterexamples for number-theoretic conjectures',
    ],
  },

  // ==========================================================================
  // Unit 4: Geometry and Converses
  // ==========================================================================
  {
    id: 'exp-geom-propositions',
    title: 'Geometric Propositions & Converses',
    subtitle: 'Equal Diagonals: Rectangle vs. Isosceles Trapezium',
    unitId: 'unit-4',
    lessonId: 'prop-l7',
    description:
      'Investigate geometric conditional statements. Test whether equal diagonals guarantee a rectangle by discovering the isosceles trapezium counterexample.',
    defaultTab: 'geometry_reasoning',
    availableTabs: ['geometry_reasoning', 'statement_explorer', 'counterexample_lab'],
    learningGoals: [
      'Formulate conditional statements in Euclidean geometry',
      'Discover that an isosceles trapezium has equal diagonals but is not a rectangle',
      'Understand why geometric converses require rigorous verification',
    ],
  },
  {
    id: 'exp-pythagoras-converse',
    title: 'Baudhāyana–Pythagoras Theorem & Converse',
    subtitle: 'Dynamic Triangle & the a² + b² = c² Right-Angle Invariant',
    unitId: 'unit-4',
    lessonId: 'prop-l8',
    description:
      'Manipulate a dynamic triangle, verify triangle inequalities, and investigate the Baudhāyana-Pythagoras theorem (right triangle implies a² + b² = c²) and its converse.',
    defaultTab: 'geometry_reasoning',
    availableTabs: ['geometry_reasoning', 'proof_workbench', 'statement_explorer'],
    learningGoals: [
      'Verify the Baudhāyana-Pythagoras theorem for right triangles',
      'Apply the converse to detect right angles from side lengths alone',
      'Classify triangles as acute, right, or obtuse based on a² + b² vs c²',
    ],
  },

  // ==========================================================================
  // Unit 5: Mathematical Proof
  // ==========================================================================
  {
    id: 'exp-evidence-vs-proof',
    title: 'What Makes a Proof?',
    subtitle: 'Empirical Evidence vs. Deductive Universal Truth',
    unitId: 'unit-5',
    lessonId: 'prop-l9',
    description:
      'Observe why checking 40 consecutive numbers with Euler’s polynomial n² + n + 41 fails at n=40. Understand the necessity of deductive mathematical proof.',
    defaultTab: 'number_experiment',
    availableTabs: ['number_experiment', 'proof_workbench', 'statement_explorer'],
    learningGoals: [
      'Understand why empirical testing cannot prove a statement for infinite numbers',
      'Inspect Euler’s polynomial as a landmark example of empirical limits',
      'Recognize definitions, axioms, and inference rules as foundations of proof',
    ],
  },
  {
    id: 'exp-proof-construction',
    title: 'Constructing Arguments (Proof Workbench)',
    subtitle: 'Assembling Step-by-Step Deductive Proofs',
    unitId: 'unit-5',
    lessonId: 'prop-l10',
    description:
      'Assemble logical proof steps from givens to conclusions. Learn to justify each step with a recognized mathematical reason and detect circular reasoning.',
    defaultTab: 'proof_workbench',
    availableTabs: ['proof_workbench', 'statement_explorer'],
    learningGoals: [
      'Arrange deductive statements in valid logical sequence',
      'Match mathematical statements to definitions, axioms, and theorems',
      'Identify and avoid circular reasoning and unsupported inferences',
    ],
  },

  // ==========================================================================
  // Unit 6: Mastery & Revision
  // ==========================================================================
  {
    id: 'exp-integrated-reasoning',
    title: 'Integrated Reasoning Challenges',
    subtitle: 'Synthesizing Number Properties, Geometry & Proof',
    unitId: 'unit-6',
    lessonId: 'prop-l11',
    description:
      'Tackle advanced multi-step reasoning problems combining numbers, geometric theorems, converses, and deductive justifications.',
    defaultTab: 'statement_explorer',
    availableTabs: [
      'statement_explorer',
      'counterexample_lab',
      'number_experiment',
      'geometry_reasoning',
      'proof_workbench',
    ],
    learningGoals: [
      'Synthesize concepts across all units of the chapter',
      'Discern valid arguments from plausible fallacies',
      'Construct complete deductive justifications independently',
    ],
  },
  {
    id: 'exp-mastery-revision',
    title: 'Chapter Practice and Revision',
    subtitle: 'Class 9 NCERT Ganita Manjari Comprehensive Assessment',
    unitId: 'unit-6',
    lessonId: 'prop-l12',
    description:
      'Engage with the comprehensive chapter practice question bank across Basic, Standard, and Challenge difficulty levels.',
    defaultTab: 'statement_explorer',
    availableTabs: [
      'statement_explorer',
      'counterexample_lab',
      'number_experiment',
      'geometry_reasoning',
      'proof_workbench',
    ],
    learningGoals: [
      'Master the classification of mathematical statements',
      'Identify hypotheses, conclusions, and form accurate converses',
      'Verify counterexamples and validate deductive proof steps',
    ],
  },
];

export function getExperimentById(id: string): PropositionExperiment {
  return (
    PROPOSITION_EXPERIMENTS.find((e) => e.id === id) || PROPOSITION_EXPERIMENTS[0]
  );
}
