/**
 * Curriculum matrix: Class 9 Propositions and Their Converses
 *
 * The textbook chapter (NCERT Ganita Manjari Grade 9, Part II, Chapter 9, 7 pages)
 * has NO numbered sections. It has the opening Statements 1 and 2, Examples 1 to 5,
 * "Think and Reflect" prompts, Exercise Set 9.1 (questions 1 to 17) and a summary.
 * `topicNumber` below is a LabVerse topic label, not a textbook section number.
 * Topics that go beyond the chapter say "extension".
 */

export interface CurriculumTopicMapping {
  topicNumber: string;
  topicTitle: string;
  ncertReference: string;
  mappedLessonId: string;
  mappedExperimentId: string;
  pedagogicalFocus: string;
  coreConcepts: string[];
}

export const NCERT_PROPOSITIONS_CURRICULUM_MATRIX: CurriculumTopicMapping[] = [
  {
    topicNumber: 'Topic 1',
    topicTitle: 'Statements and Mathematical Propositions',
    ncertReference: 'Chapter 9, the opening definition of a proposition. Sorting questions, commands and opinions is an extension.',
    mappedLessonId: 'prop-l1',
    mappedExperimentId: 'exp-prop-classification',
    pedagogicalFocus: 'Distinguishing declarative mathematical sentences from questions, commands, and subjective preferences.',
    coreConcepts: ['Mathematical Statement', 'Truth Value (True/False)', 'Objective Verifiability'],
  },
  {
    topicNumber: 'Topic 2',
    topicTitle: 'Conditional Statements: Hypothesis and Conclusion',
    ncertReference: 'Chapter 9, the "if X then Y" form and "Y when X" (A Note).',
    mappedLessonId: 'prop-l2',
    mappedExperimentId: 'exp-hypothesis-conclusion',
    pedagogicalFocus: 'Translating mathematical facts into "If P, then Q" conditional format and isolating premises.',
    coreConcepts: ['Hypothesis (P)', 'Conclusion (Q)', 'Logical Implication (P ⇒ Q)', 'Domain Quantification'],
  },
  {
    topicNumber: 'Topic 3',
    topicTitle: 'Forming Converses of Statements',
    ncertReference: 'Chapter 9, Statements 1 and 2; Example 1.',
    mappedLessonId: 'prop-l3',
    mappedExperimentId: 'exp-forming-converses',
    pedagogicalFocus: 'Swapping hypothesis and conclusion side-by-side and noting that truth value is not automatically preserved.',
    coreConcepts: ['Converse (If Q, then P)', 'Syntactic Inversion', 'Asymmetry of Implication'],
  },
  {
    topicNumber: 'Topic 4',
    topicTitle: 'Truth Values of a Statement and its Converse',
    ncertReference: 'Chapter 9, Examples 2 to 4, the Think and Reflect prompts and the summary.',
    mappedLessonId: 'prop-l4',
    mappedExperimentId: 'exp-truth-converses',
    pedagogicalFocus: 'Systematic exploration of the 4 truth possibilities across number theory and geometry.',
    coreConcepts: ['Biconditional (P ⇔ Q)', 'Independent Truth Values', '4 Logical Quadrants'],
  },
  {
    topicNumber: 'Topic 5',
    topicTitle: 'Disproving Statements: The Method of Counterexamples',
    ncertReference: 'Chapter 9, Example 1, the Fermat and Euler paragraph.',
    mappedLessonId: 'prop-l5',
    mappedExperimentId: 'exp-counterexamples-intro',
    pedagogicalFocus: 'Understanding that a single counterexample (P=true, Q=false) definitively disproves a universal statement.',
    coreConcepts: ['Counterexample Definition', 'P(x) ∧ ¬Q(x)', 'Supporting vs Disproving Instances'],
  },
  {
    topicNumber: 'Topic 6',
    topicTitle: 'Number Properties and Divisibility Conjectures',
    ncertReference: 'Chapter 9, Examples 2 and 3; Exercise Set 9.1, questions 5 to 16.',
    mappedLessonId: 'prop-l6',
    mappedExperimentId: 'exp-number-properties',
    pedagogicalFocus: 'Interactive integer exploration of divisibility, parity, factors, and perfect squares.',
    coreConcepts: ['Divisibility Rules', 'Parity Invariants', 'Multiples and Factors', 'Bounded Range Search'],
  },
  {
    topicNumber: 'Topic 7',
    topicTitle: 'Geometric Propositions and Their Converses',
    ncertReference: 'Chapter 9, Example 4 and Exercise Set 9.1, question 17.',
    mappedLessonId: 'prop-l7',
    mappedExperimentId: 'exp-geom-propositions',
    pedagogicalFocus: 'Investigating geometric converse statements: Equal diagonals guarantee a rectangle? Counterexample: Isosceles Trapezium.',
    coreConcepts: ['Geometric Converses', 'Diagonals Equality', 'Isosceles Trapezium Counterexample'],
  },
  {
    topicNumber: 'Topic 8',
    topicTitle: 'Baudhāyana–Pythagoras Theorem and its Converse',
    ncertReference: 'Chapter 9, Example 5. The acute and obtuse comparison is an extension.',
    mappedLessonId: 'prop-l8',
    mappedExperimentId: 'exp-pythagoras-converse',
    pedagogicalFocus: 'Dynamic triangle manipulation: right triangle implies a²+b²=c² vs a²+b²=c² implies right triangle.',
    coreConcepts: ['Baudhāyana-Pythagoras Invariant', 'Converse Theorem', 'Triangle Inequality', 'Acute/Right/Obtuse Triangles'],
  },
  {
    topicNumber: 'Topic 9',
    topicTitle: 'Limits of Empirical Verification and the Need for Proof (Fermat and Euler; extension: n\u00B2 + n + 41)',
    ncertReference: 'Chapter 9, the Fermat and Euler paragraph. The polynomial n\u00B2 + n + 41 is an extension.',
    mappedLessonId: 'prop-l9',
    mappedExperimentId: 'exp-evidence-vs-proof',
    pedagogicalFocus: 'Demonstrating why finite testing cannot prove a universal claim, featuring Euler’s polynomial n²+n+41.',
    coreConcepts: ['Empirical Evidence vs Proof', 'Euler’s Prime Polynomial', 'Failure at n=40', 'Universal Quantification'],
  },
  {
    topicNumber: 'Topic 10',
    topicTitle: 'Constructing Mathematical Arguments',
    ncertReference: 'Chapter 9, the arguments in Examples 3 and 5. The step-assembly activity is an extension.',
    mappedLessonId: 'prop-l10',
    mappedExperimentId: 'exp-proof-construction',
    pedagogicalFocus: 'Assembling deductive steps, assigning axioms/definitions as justifications, and detecting circular logic.',
    coreConcepts: ['Direct Deductive Proof', 'Logical Premises', 'Valid Inference Chains', 'Fallacy Detection'],
  },
  {
    topicNumber: 'Topic 11',
    topicTitle: 'Integrated Reasoning & Mathematical Synthesis',
    ncertReference: 'Extension beyond the chapter.',
    mappedLessonId: 'prop-l11',
    mappedExperimentId: 'exp-integrated-reasoning',
    pedagogicalFocus: 'Multi-domain reasoning challenges uniting integer predicates, geometric converses, and deductive proofs.',
    coreConcepts: ['Complex Conjectures', 'Multi-Step Argumentation', 'Mathematical Synthesis'],
  },
  {
    topicNumber: 'Topic 12',
    topicTitle: 'Chapter Revision and Comprehensive Practice',
    ncertReference: 'Exercise Set 9.1 is the textbook analogue; the questions here are original.',
    mappedLessonId: 'prop-l12',
    mappedExperimentId: 'exp-mastery-revision',
    pedagogicalFocus: 'Formative assessment across all difficulty levels to consolidate mathematical reasoning and proof mastery.',
    coreConcepts: ['Formative Assessment', 'Difficulty-Tiered Practice', 'Self-Explanation'],
  },
];
