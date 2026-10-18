/**
 * NCERT Ganita Manjari Curriculum Matrix
 * Class 9: Propositions and Their Converses
 *
 * Mappings of textbook topics, activities, worked examples, and exercises
 * to LabVerse interactive learning modules.
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
    topicNumber: '1.1',
    topicTitle: 'Statements and Mathematical Propositions',
    ncertReference: 'NCERT Ganita Manjari, Chapter: Propositions and Their Converses, Section 1',
    mappedLessonId: 'prop-l1',
    mappedExperimentId: 'exp-prop-classification',
    pedagogicalFocus: 'Distinguishing declarative mathematical sentences from questions, commands, and subjective preferences.',
    coreConcepts: ['Mathematical Statement', 'Truth Value (True/False)', 'Objective Verifiability'],
  },
  {
    topicNumber: '1.2',
    topicTitle: 'Conditional Statements: Hypothesis and Conclusion',
    ncertReference: 'NCERT Ganita Manjari, Section 2',
    mappedLessonId: 'prop-l2',
    mappedExperimentId: 'exp-hypothesis-conclusion',
    pedagogicalFocus: 'Translating mathematical facts into "If P, then Q" conditional format and isolating premises.',
    coreConcepts: ['Hypothesis (P)', 'Conclusion (Q)', 'Logical Implication (P ⇒ Q)', 'Domain Quantification'],
  },
  {
    topicNumber: '2.1',
    topicTitle: 'Forming Converses of Statements',
    ncertReference: 'NCERT Ganita Manjari, Section 3',
    mappedLessonId: 'prop-l3',
    mappedExperimentId: 'exp-forming-converses',
    pedagogicalFocus: 'Swapping hypothesis and conclusion side-by-side and noting that truth value is not automatically preserved.',
    coreConcepts: ['Converse (If Q, then P)', 'Syntactic Inversion', 'Asymmetry of Implication'],
  },
  {
    topicNumber: '2.2',
    topicTitle: 'Truth Values of a Statement and its Converse',
    ncertReference: 'NCERT Ganita Manjari, Section 4',
    mappedLessonId: 'prop-l4',
    mappedExperimentId: 'exp-truth-converses',
    pedagogicalFocus: 'Systematic exploration of the 4 truth possibilities across number theory and geometry.',
    coreConcepts: ['Biconditional (P ⇔ Q)', 'Independent Truth Values', '4 Logical Quadrants'],
  },
  {
    topicNumber: '3.1',
    topicTitle: 'Disproving Statements: The Method of Counterexamples',
    ncertReference: 'NCERT Ganita Manjari, Section 5',
    mappedLessonId: 'prop-l5',
    mappedExperimentId: 'exp-counterexamples-intro',
    pedagogicalFocus: 'Understanding that a single counterexample (P=true, Q=false) definitively disproves a universal statement.',
    coreConcepts: ['Counterexample Definition', 'P(x) ∧ ¬Q(x)', 'Supporting vs Disproving Instances'],
  },
  {
    topicNumber: '3.2',
    topicTitle: 'Number Properties and Divisibility Conjectures',
    ncertReference: 'NCERT Ganita Manjari, Section 6',
    mappedLessonId: 'prop-l6',
    mappedExperimentId: 'exp-number-properties',
    pedagogicalFocus: 'Interactive integer exploration of divisibility, parity, factors, and perfect squares.',
    coreConcepts: ['Divisibility Rules', 'Parity Invariants', 'Multiples and Factors', 'Bounded Range Search'],
  },
  {
    topicNumber: '4.1',
    topicTitle: 'Geometric Propositions and Their Converses',
    ncertReference: 'NCERT Ganita Manjari, Section 7',
    mappedLessonId: 'prop-l7',
    mappedExperimentId: 'exp-geom-propositions',
    pedagogicalFocus: 'Investigating geometric converse statements: Equal diagonals guarantee a rectangle? Counterexample: Isosceles Trapezium.',
    coreConcepts: ['Geometric Converses', 'Diagonals Equality', 'Isosceles Trapezium Counterexample'],
  },
  {
    topicNumber: '4.2',
    topicTitle: 'Baudhāyana–Pythagoras Theorem and its Converse',
    ncertReference: 'NCERT Ganita Manjari, Section 8',
    mappedLessonId: 'prop-l8',
    mappedExperimentId: 'exp-pythagoras-converse',
    pedagogicalFocus: 'Dynamic triangle manipulation: right triangle implies a²+b²=c² vs a²+b²=c² implies right triangle.',
    coreConcepts: ['Baudhāyana-Pythagoras Invariant', 'Converse Theorem', 'Triangle Inequality', 'Acute/Right/Obtuse Triangles'],
  },
  {
    topicNumber: '5.1',
    topicTitle: 'Limits of Empirical Verification and the Need for Proof',
    ncertReference: 'NCERT Ganita Manjari, Section 9',
    mappedLessonId: 'prop-l9',
    mappedExperimentId: 'exp-evidence-vs-proof',
    pedagogicalFocus: 'Demonstrating why finite testing cannot prove a universal claim, featuring Euler’s polynomial n²+n+41.',
    coreConcepts: ['Empirical Evidence vs Proof', 'Euler’s Prime Polynomial', 'Failure at n=40', 'Universal Quantification'],
  },
  {
    topicNumber: '5.2',
    topicTitle: 'Constructing Mathematical Arguments',
    ncertReference: 'NCERT Ganita Manjari, Section 10',
    mappedLessonId: 'prop-l10',
    mappedExperimentId: 'exp-proof-construction',
    pedagogicalFocus: 'Assembling deductive steps, assigning axioms/definitions as justifications, and detecting circular logic.',
    coreConcepts: ['Direct Deductive Proof', 'Logical Premises', 'Valid Inference Chains', 'Fallacy Detection'],
  },
  {
    topicNumber: '6.1',
    topicTitle: 'Integrated Reasoning & Mathematical Synthesis',
    ncertReference: 'NCERT Ganita Manjari, Section 11',
    mappedLessonId: 'prop-l11',
    mappedExperimentId: 'exp-integrated-reasoning',
    pedagogicalFocus: 'Multi-domain reasoning challenges uniting integer predicates, geometric converses, and deductive proofs.',
    coreConcepts: ['Complex Conjectures', 'Multi-Step Argumentation', 'Mathematical Synthesis'],
  },
  {
    topicNumber: '6.2',
    topicTitle: 'Chapter Revision and Comprehensive Practice',
    ncertReference: 'NCERT Ganita Manjari, Chapter Review & Exercises',
    mappedLessonId: 'prop-l12',
    mappedExperimentId: 'exp-mastery-revision',
    pedagogicalFocus: 'Formative assessment across all difficulty levels to consolidate mathematical reasoning and proof mastery.',
    coreConcepts: ['Formative Assessment', 'Difficulty-Tiered Practice', 'Self-Explanation'],
  },
];
