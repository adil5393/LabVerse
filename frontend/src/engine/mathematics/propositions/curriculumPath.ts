/**
 * Guided Curriculum Roadmap & Lesson Registry for Class 9 Propositions & Converses
 * NCERT Ganita Manjari: Chapter on Propositions and Their Converses
 *
 * Implements the 6-Unit, 12-Lesson progressive path:
 * 1. Understand -> 2. Predict -> 3. Experiment -> 4. Observe -> 5. Explain/Prove -> 6. Practise
 */

import type {
  GuidedUnitDefinition,
  GuidedLessonDefinition,
} from '../guidedLearning/types';

export const PROP_GUIDED_UNITS: GuidedUnitDefinition[] = [
  {
    id: 'unit-1',
    unitNumber: 1,
    title: 'Unit 1: Understanding Mathematical Statements',
    badge: 'Foundations • Lessons 1–2',
    description:
      'Learn to identify mathematical propositions with objective truth values and break down conditional "If P, then Q" statements.',
    lessonIds: ['prop-l1', 'prop-l2'],
  },
  {
    id: 'unit-2',
    unitNumber: 2,
    title: 'Unit 2: Converses',
    badge: 'Logical Inversion • Lessons 3–4',
    description:
      'Reverse hypothesis and conclusion to form converses and investigate all 4 truth combinations across numbers and geometry.',
    lessonIds: ['prop-l3', 'prop-l4'],
  },
  {
    id: 'unit-3',
    unitNumber: 3,
    title: 'Unit 3: Counterexamples',
    badge: 'Disproof Method • Lessons 5–6',
    description:
      'Discover how a single counterexample (P=true, Q=false) definitively disproves a universal mathematical conjecture.',
    lessonIds: ['prop-l5', 'prop-l6'],
  },
  {
    id: 'unit-4',
    unitNumber: 4,
    title: 'Unit 4: Geometry and Converses',
    badge: 'Geometric Invariants • Lessons 7–8',
    description:
      'Investigate geometric converses, equal diagonals in quadrilaterals, and the Baudhāyana-Pythagoras theorem and converse.',
    lessonIds: ['prop-l7', 'prop-l8'],
  },
  {
    id: 'unit-5',
    unitNumber: 5,
    title: 'Unit 5: Mathematical Proof',
    badge: 'Deductive Logic • Lessons 9–10',
    description:
      'Contrast empirical checking with universal deductive proof and construct step-by-step mathematical arguments.',
    lessonIds: ['prop-l9', 'prop-l10'],
  },
  {
    id: 'unit-6',
    unitNumber: 6,
    title: 'Unit 6: Mastery & Revision',
    badge: 'Synthesis • Lessons 11–12',
    description:
      'Tackle integrated reasoning challenges and complete multi-tier practice questions aligned to NCERT Ganita Manjari.',
    lessonIds: ['prop-l11', 'prop-l12'],
  },
];

export const PROP_GUIDED_LESSONS: Record<string, GuidedLessonDefinition> = {
  // ==========================================================================
  // Lesson 1: Statements and Propositions
  // ==========================================================================
  'prop-l1': {
    id: 'prop-l1',
    unitId: 'unit-1',
    unitTitle: 'Unit 1: Understanding Mathematical Statements',
    lessonNumber: 1,
    title: 'Statements and Propositions',
    subtitle: 'What Makes a Sentence a Mathematical Proposition?',
    learningObjective:
      'Distinguish mathematical propositions (which possess an objective truth value) from questions, commands, exclamations, and subjective opinions.',
    experimentId: 'exp-prop-classification',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['statement_explorer'],
    concept: {
      summary:
        'In mathematics, a proposition (or statement) is a declarative sentence that is definitively true or definitively false, but not both. Its truth must not depend on human opinion, mood, or personal preference.',
      detailedPoints: [
        'A declarative sentence stating a mathematical fact (e.g. "7 is a prime number") is a proposition.',
        'A false sentence (e.g. "Every rectangle is a square") is STILL a mathematical proposition because it has a clear, objective truth value: False.',
        'Questions ("Is 9 divisible by 3?"), commands ("Draw a line segment"), and subjective claims ("Math is easy") are NOT propositions.',
      ],
      keyTerms: [
        { term: 'Proposition', definition: 'A sentence that is unequivocally either true or false.' },
        { term: 'Truth Value', definition: 'The property of being either True (T) or False (F).' },
        { term: 'Subjective Claim', definition: 'A statement whose truth varies according to individual preference.' },
      ],
    },
    predictionQuestion: {
      question: 'Which of the following sentences is a valid mathematical proposition?',
      options: [
        'Please find the square root of 144.',
        'Why are prime numbers so interesting?',
        'The sum of any two odd numbers is an even number.',
        'Geometry is much more enjoyable than algebra.',
      ],
      correctIndex: 2,
      explanation:
        '"The sum of any two odd numbers is an even number" is a declarative statement with an objective truth value (True). The others are a command, a question, and a subjective opinion.',
    },
    experimentGuide: {
      instruction: 'Explore the Statement Explorer to classify sample sentences.',
      actionHint: 'Click on different statements to inspect their type and truth value.',
      targetActionDescription: 'Inspect at least 3 statements of different types.',
    },
    observeGuide: {
      prompt: 'Notice why "Every rectangle is a square" qualifies as a proposition, while "Math is fun" does not.',
      expectedPattern: 'Propositions have objective truth values that all mathematicians agree upon.',
      invariantsDescription: 'Truth values of mathematical propositions are independent of the observer.',
    },
    whyGuide: {
      explanationType: 'definition',
      explanation:
        'Deductive mathematics requires a stable foundation where each claim is either True or False without ambiguity. Commands and opinions cannot be chained logically to build proofs.',
      deductiveTakeaway: 'A proposition must have a definitive truth value: True or False.',
    },
    practiceQuestionIds: ['q-prop-1', 'q-prop-2', 'q-prop-3'],
  },

  // ==========================================================================
  // Lesson 2: Hypothesis and Conclusion
  // ==========================================================================
  'prop-l2': {
    id: 'prop-l2',
    unitId: 'unit-1',
    unitTitle: 'Unit 1: Understanding Mathematical Statements',
    lessonNumber: 2,
    title: 'Hypothesis and Conclusion',
    subtitle: 'Conditional Statements: If P, then Q',
    learningObjective:
      'Identify the hypothesis (antecedent condition P) and conclusion (consequence Q) in mathematical conditional statements.',
    experimentId: 'exp-hypothesis-conclusion',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['statement_explorer'],
    concept: {
      summary:
        'Most mathematical theorems are conditional propositions written as "If P, then Q" (symbolized as P ⇒ Q). Here, P is the hypothesis (the condition assumed) and Q is the conclusion (what must follow).',
      detailedPoints: [
        'Hypothesis (P): The premise or given situation ("If a number is divisible by 6...").',
        'Conclusion (Q): The necessary outcome ("...then it is divisible by 3").',
        'Natural sentences like "All equilateral triangles are equiangular" translate directly to "If a triangle is equilateral, then it is equiangular."',
      ],
      keyTerms: [
        { term: 'Conditional Statement', definition: 'A proposition of the form "If P, then Q".' },
        { term: 'Hypothesis (P)', definition: 'The condition or premise that is assumed to hold.' },
        { term: 'Conclusion (Q)', definition: 'The assertion that follows whenever the hypothesis is satisfied.' },
      ],
    },
    predictionQuestion: {
      question: 'In the proposition "If a quadrilateral is a rhombus, then its diagonals are perpendicular", what is the hypothesis?',
      options: [
        'The diagonals are perpendicular',
        'A quadrilateral is a rhombus',
        'All quadrilaterals have diagonals',
        'The figure is a square',
      ],
      correctIndex: 1,
      explanation:
        'The hypothesis is the "If" clause: "A quadrilateral is a rhombus". The conclusion is "its diagonals are perpendicular".',
    },
    experimentGuide: {
      instruction: 'Select conditional propositions in the Statement Explorer and highlight hypothesis P and conclusion Q.',
      actionHint: 'Observe how the natural language sentence maps into P and Q.',
      targetActionDescription: 'Inspect the P and Q breakdown for divisibility and geometric statements.',
    },
    observeGuide: {
      prompt: 'What happens to the meaning when you separate the condition P from the result Q?',
      expectedPattern: 'The proposition asserts that whenever P happens, Q is guaranteed to happen.',
      invariantsDescription: 'Implication P ⇒ Q guarantees Q under condition P.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'Clarifying hypothesis and conclusion prevents conflating what is given with what needs to be proved. In any proof, we start with the hypothesis as our toolbox and work toward the conclusion.',
      deductiveTakeaway: 'In "If P, then Q", P is what you are given; Q is what you must deduce.',
    },
    practiceQuestionIds: ['q-prop-4', 'q-prop-5', 'q-prop-6'],
  },

  // ==========================================================================
  // Lesson 3: Forming a Converse
  // ==========================================================================
  'prop-l3': {
    id: 'prop-l3',
    unitId: 'unit-2',
    unitTitle: 'Unit 2: Converses',
    lessonNumber: 3,
    title: 'Forming a Converse',
    subtitle: 'Swapping Hypothesis and Conclusion: If Q, then P',
    learningObjective:
      'Construct the converse of any conditional proposition by swapping the hypothesis and conclusion, and observe that swapping creates an entirely new claim.',
    experimentId: 'exp-forming-converses',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['statement_explorer', 'counterexample_lab'],
    concept: {
      summary:
        'The converse of "If P, then Q" is formed by interchanging the hypothesis and conclusion: "If Q, then P". A statement and its converse are distinct mathematical claims; one being true does not automatically make the other true.',
      detailedPoints: [
        'Original: If P, then Q.',
        'Converse: If Q, then P.',
        'Example: "If you live in Mumbai, you live in India" is TRUE. Its converse: "If you live in India, you live in Mumbai" is FALSE (you could live in Delhi or Bengaluru!).',
      ],
      keyTerms: [
        { term: 'Converse', definition: 'The proposition formed by interchanging the hypothesis and conclusion of a conditional statement.' },
      ],
    },
    predictionQuestion: {
      question: 'What is the converse of: "If an integer is divisible by 10, then its units digit is 0"?',
      options: [
        'If an integer is not divisible by 10, then its units digit is not 0.',
        'If the units digit of an integer is 0, then it is divisible by 10.',
        'If an integer is divisible by 5, then its units digit is 0.',
        'An integer is divisible by 10 if and only if it is even.',
      ],
      correctIndex: 1,
      explanation:
        'The converse is obtained by swapping P and Q: "If the units digit of an integer is 0, then it is divisible by 10."',
    },
    experimentGuide: {
      instruction: 'Click the "Swap to Converse" button in the Statement Explorer and examine the resulting proposition.',
      actionHint: 'Compare the original statement and its converse side-by-side.',
      targetActionDescription: 'Generate the converse for at least 3 canonical propositions.',
    },
    observeGuide: {
      prompt: 'Notice how the role of given condition and expected result are swapped.',
      expectedPattern: 'The converse asks whether the implication works backwards.',
      invariantsDescription: 'Forming a converse is a syntactic reversal: P ⇒ Q becomes Q ⇒ P.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'In daily life and mathematics, people frequently commit the fallacy of assuming the converse is automatically true. Recognizing that Q ⇒ P is an independent statement is essential for mathematical rigor.',
      deductiveTakeaway: 'The truth of "If P, then Q" does NOT guarantee the truth of "If Q, then P".',
    },
    practiceQuestionIds: ['q-prop-7', 'q-prop-8', 'q-prop-9'],
  },

  // ==========================================================================
  // Lesson 4: Truth of a Proposition and Its Converse
  // ==========================================================================
  'prop-l4': {
    id: 'prop-l4',
    unitId: 'unit-2',
    unitTitle: 'Unit 2: Converses',
    lessonNumber: 4,
    title: 'Truth of a Proposition and Its Converse',
    subtitle: 'The 4 Logical Possibilities',
    learningObjective:
      'Investigate and classify statements into the four possible truth combinations for a proposition and its converse.',
    experimentId: 'exp-truth-converses',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['statement_explorer', 'counterexample_lab'],
    concept: {
      summary:
        'There are exactly four logical possibilities for the truth values of a proposition and its converse: 1) Both True, 2) Original True & Converse False, 3) Original False & Converse True, 4) Both False.',
      detailedPoints: [
        'Both True: "If a number is even, it is divisible by 2" (Biconditional / Equivalence).',
        'Original True, Converse False: "If n is divisible by 6, then n is divisible by 3" (Converse fails for n=9).',
        'Original False, Converse True: "If n is divisible by 3, then n is divisible by 9" (Original fails for n=6; Converse is true).',
        'Both False: "If n is prime, then n is odd" (Fails for n=2; Converse fails for n=9).',
      ],
      keyTerms: [
        { term: 'Biconditional (P ⇔ Q)', definition: 'A statement where both original and converse are true ("P if and only if Q").' },
        { term: 'Truth Quadrants', definition: 'The 4 combinations of truth values for (Original, Converse).' },
      ],
    },
    predictionQuestion: {
      question: 'Consider: "If a positive integer is divisible by 4, then it is an even number." What are the truth values of this proposition and its converse?',
      options: [
        'Both original and converse are true.',
        'Original is true, but converse is false.',
        'Original is false, but converse is true.',
        'Both original and converse are false.',
      ],
      correctIndex: 1,
      explanation:
        'Original is true (4k is always even). Converse: "If an integer is even, it is divisible by 4" is FALSE (e.g. 6 and 10 are even but not divisible by 4).',
    },
    experimentGuide: {
      instruction: 'Switch between the 4 categories in the Statement Explorer to see concrete examples of each truth quadrant.',
      actionHint: 'Test the counterexamples provided for each false direction.',
      targetActionDescription: 'Inspect all 4 truth categories.',
    },
    observeGuide: {
      prompt: 'Notice that knowing a statement is true tells you nothing about whether its converse is true.',
      expectedPattern: 'The converse must be investigated as a completely separate proposition.',
      invariantsDescription: 'Truth values of P ⇒ Q and Q ⇒ P are logically independent.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'When both a proposition and its converse are true, we write "P if and only if Q" (P ⇔ Q), meaning P and Q are logically equivalent. This is how mathematical definitions (like right triangles via Pythagoras) operate.',
      deductiveTakeaway: 'Both directions must be proved separately before asserting equivalence.',
    },
    practiceQuestionIds: ['q-prop-10', 'q-prop-11', 'q-prop-12'],
  },

  // ==========================================================================
  // Lesson 5: Finding Counterexamples
  // ==========================================================================
  'prop-l5': {
    id: 'prop-l5',
    unitId: 'unit-3',
    unitTitle: 'Unit 3: Counterexamples',
    lessonNumber: 5,
    title: 'Finding Counterexamples',
    subtitle: 'The Power of a Single Disproving Case',
    learningObjective:
      'Understand how a single counterexample disproves a universal mathematical claim, and learn the strict condition: P(x) is true and Q(x) is false.',
    experimentId: 'exp-counterexamples-intro',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['counterexample_lab', 'statement_explorer'],
    concept: {
      summary:
        'A universal mathematical statement claims that a property holds for every single element in its domain. To disprove such a claim, one does not need to show it fails often; finding just ONE valid counterexample completely destroys the universal claim.',
      detailedPoints: [
        'A valid counterexample x MUST satisfy: P(x) = True AND Q(x) = False.',
        'If P(x) is False, x is NOT a counterexample (e.g., testing 5 for "If a number is divisible by 6..." does not disprove anything).',
        'If P(x) is True and Q(x) is True, x is a supporting example, not a proof.',
      ],
      keyTerms: [
        { term: 'Counterexample', definition: 'A specific value in the domain where the hypothesis is true but the conclusion is false.' },
        { term: 'Disproof', definition: 'Establishing that a universal mathematical claim is false.' },
      ],
    },
    predictionQuestion: {
      question: 'Consider the claim: "If a positive integer is divisible by 3, then it is divisible by 6." Which of the following is a valid counterexample?',
      options: [
        'n = 12 (because 12 is divisible by both 3 and 6)',
        'n = 5 (because 5 is not divisible by 3)',
        'n = 9 (because 9 is divisible by 3, but NOT divisible by 6)',
        'n = 0 (because 0 is not a positive integer)',
      ],
      correctIndex: 2,
      explanation:
        'n = 9 satisfies the hypothesis (9 is divisible by 3: TRUE) but violates the conclusion (9 is divisible by 6: FALSE). n = 12 is a supporting example; n = 5 does not satisfy the hypothesis; n = 0 is outside the domain.',
    },
    experimentGuide: {
      instruction: 'Enter different numbers into the Counterexample Workbench and watch the diagnostic indicators for P(x) and Q(x).',
      actionHint: 'Try numbers like 6, 9, 12, 15 to distinguish supporting examples from counterexamples.',
      targetActionDescription: 'Identify at least 2 distinct counterexamples for the converse proposition.',
    },
    observeGuide: {
      prompt: 'Observe what happens when P(x) is false versus when P(x) is true and Q(x) is false.',
      expectedPattern: 'Only when P is true and Q is false does the indicator light up as a valid counterexample.',
      invariantsDescription: 'Counterexample criterion: P(x) ∧ ¬Q(x).',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'In formal logic, a universal claim states "For all x, if P(x) then Q(x)". The negation of "for all" is "there exists at least one x where P(x) is true and Q(x) is false". Thus a single counterexample is mathematically conclusive.',
      deductiveTakeaway: 'One counterexample is enough to disprove a rule; millions of examples cannot prove it.',
    },
    practiceQuestionIds: ['q-prop-13', 'q-prop-14', 'q-prop-15'],
  },

  // ==========================================================================
  // Lesson 6: Number Property Laboratory
  // ==========================================================================
  'prop-l6': {
    id: 'prop-l6',
    unitId: 'unit-3',
    unitTitle: 'Unit 3: Counterexamples',
    lessonNumber: 6,
    title: 'Number Property Laboratory',
    subtitle: 'Divisibility, Parity, Multiples & Squares',
    learningObjective:
      'Investigate number-theoretic claims, factorizations, and square numbers, using automated range search and manual analysis.',
    experimentId: 'exp-number-properties',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['number_experiment', 'counterexample_lab'],
    concept: {
      summary:
        'Integers have rich multiplicative and additive structures. We can formulate conjectures about divisibility, parity (even/odd), and perfect squares, then test them systematically.',
      detailedPoints: [
        'Divisibility transitivity: If a divides b and b divides c, then a divides c.',
        'Divisibility asymmetry: If a divides b, it does NOT follow that b divides a (unless a = ±b).',
        'Square numbers: The square of any integer leaves a remainder of 0 or 1 when divided by 4.',
      ],
      keyTerms: [
        { term: 'Factor', definition: 'An integer that divides another integer completely without remainder.' },
        { term: 'Multiple', definition: 'The product of any quantity and an integer.' },
      ],
    },
    predictionQuestion: {
      question: 'Consider the claim: "If a number is divisible by 2 and divisible by 4, then it is divisible by 8." Is this claim true or false?',
      options: [
        'True, because 2 × 4 = 8.',
        'False, and n = 12 is a counterexample (12 is divisible by 2 and 4, but not by 8).',
        'False, and n = 8 is a counterexample.',
        'True, because all multiples of 4 are multiples of 8.',
      ],
      correctIndex: 1,
      explanation:
        'For n = 12: 12 is divisible by 2 (True) and by 4 (True), but 12 is NOT divisible by 8 (False). So 12 is a counterexample. Note that 2 and 4 share factors, so their product rule does not apply!',
    },
    experimentGuide: {
      instruction: 'Use the Number Property Workbench to test divisibility and parity across different numbers.',
      actionHint: 'Adjust the slider or enter custom integers to check factor trees and counterexamples.',
      targetActionDescription: 'Run a range search between 1 and 50 on the divisibility propositions.',
    },
    observeGuide: {
      prompt: 'Notice which numbers violate composite divisibility claims.',
      expectedPattern: 'Numbers sharing prime factors require careful least-common-multiple analysis.',
      invariantsDescription: 'Divisibility depends on prime factorization powers.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'A number divisible by both a and b is only guaranteed to be divisible by a × b if a and b are coprime (gcd(a,b) = 1). Since gcd(2,4) = 2, divisibility by 2 and 4 only guarantees divisibility by lcm(2,4) = 4, not 8.',
      deductiveTakeaway: 'Always verify whether divisors are coprime before multiplying divisibility rules.',
    },
    practiceQuestionIds: ['q-prop-16', 'q-prop-17', 'q-prop-18'],
  },

  // ==========================================================================
  // Lesson 7: Geometric Propositions & Converses
  // ==========================================================================
  'prop-l7': {
    id: 'prop-l7',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Geometry and Converses',
    lessonNumber: 7,
    title: 'Geometric Propositions & Converses',
    subtitle: 'Equal Diagonals: Rectangle vs. Isosceles Trapezium',
    learningObjective:
      'Investigate geometric conditional statements and discover why the converse of "If a quadrilateral is a rectangle, then its diagonals are equal" is false.',
    experimentId: 'exp-geom-propositions',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['geometry_reasoning', 'statement_explorer'],
    concept: {
      summary:
        'In geometry, theorems often have natural converse statements. For example, in a rectangle, diagonals are always equal. But if a quadrilateral has equal diagonals, must it be a rectangle? No! An isosceles trapezium also has equal diagonals.',
      detailedPoints: [
        'Theorem: "If a quadrilateral is a rectangle, then its diagonals are equal." (TRUE)',
        'Converse: "If a quadrilateral has equal diagonals, then it is a rectangle." (FALSE)',
        'Counterexample: An isosceles trapezium has non-parallel sides equal and diagonals equal, but its interior angles are not 90°!',
      ],
      keyTerms: [
        { term: 'Isosceles Trapezium', definition: 'A trapezium where the non-parallel sides are equal in length.' },
        { term: 'Geometric Counterexample', definition: 'A figure satisfying the given geometric condition but lacking the asserted classification.' },
      ],
    },
    predictionQuestion: {
      question: 'Which of the following figures has equal diagonals but is NOT a rectangle?',
      options: [
        'Square',
        'Rhombus with unequal diagonals',
        'Isosceles Trapezium',
        'Parallelogram with angles 60° and 120°',
      ],
      correctIndex: 2,
      explanation:
        'An isosceles trapezium has equal diagonals, but its angles are not right angles, making it a counterexample to the converse theorem.',
    },
    experimentGuide: {
      instruction: 'In the Geometry Reasoning Canvas, switch between Rectangle and Isosceles Trapezium.',
      actionHint: 'Compare diagonal lengths AC and BD and check the angle values.',
      targetActionDescription: 'Inspect the isosceles trapezium counterexample.',
    },
    observeGuide: {
      prompt: 'Notice that both diagonals measure the exact same length in the isosceles trapezium, yet the shape is not a rectangle.',
      expectedPattern: 'Equal diagonals alone are not sufficient to force four right angles.',
      invariantsDescription: 'Diagonal equality does not imply equiangularity without the parallelogram property.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'To guarantee a rectangle, a quadrilateral must be BOTH a parallelogram AND have equal diagonals. If it is only known to have equal diagonals, non-parallelograms like isosceles trapeziums and certain kites can also satisfy the condition.',
      deductiveTakeaway: 'A geometric property that is necessary is not always sufficient.',
    },
    practiceQuestionIds: ['q-prop-19', 'q-prop-20', 'q-prop-21'],
  },

  // ==========================================================================
  // Lesson 8: Baudhāyana–Pythagoras Theorem & Converse
  // ==========================================================================
  'prop-l8': {
    id: 'prop-l8',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Geometry and Converses',
    lessonNumber: 8,
    title: 'Baudhāyana–Pythagoras Theorem & Converse',
    subtitle: 'Dynamic Triangle & the a² + b² = c² Invariant',
    learningObjective:
      'Explore the Baudhāyana-Pythagoras theorem (right triangle implies a² + b² = c²) and its converse (a² + b² = c² implies right triangle).',
    experimentId: 'exp-pythagoras-converse',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['geometry_reasoning'],
    concept: {
      summary:
        'The Baudhāyana-Pythagoras theorem states that in any right triangle with legs a, b and hypotenuse c: a² + b² = c². Remarkably, its converse is ALSO true: if a triangle has sides satisfying a² + b² = c², it MUST be a right-angled triangle opposite to side c.',
      detailedPoints: [
        'Theorem: Right triangle ⇒ a² + b² = c².',
        'Converse: a² + b² = c² ⇒ Right triangle.',
        'Since both original and converse are true, this is a biconditional equivalence (P ⇔ Q).',
        'Acute triangle: a² + b² > c²; Obtuse triangle: a² + b² < c².',
      ],
      keyTerms: [
        { term: 'Baudhāyana-Pythagoras Theorem', definition: 'In a right-angled triangle, the square on the hypotenuse equals the sum of squares on the other two sides.' },
        { term: 'Converse of Pythagoras', definition: 'If the square of one side of a triangle equals the sum of squares of the other two sides, the angle opposite the first side is a right angle.' },
      ],
    },
    predictionQuestion: {
      question: 'A triangle has side lengths 6 cm, 8 cm, and 10 cm. Does it contain a right angle?',
      options: [
        'Yes, because 6² + 8² = 36 + 64 = 100 = 10².',
        'No, because 6 + 8 is not equal to 10.',
        'Cannot be determined without measuring angles with a protractor.',
        'Only if the triangle is equilateral.',
      ],
      correctIndex: 0,
      explanation:
        'By the Converse of the Baudhāyana-Pythagoras theorem, since 6² + 8² = 10², the angle opposite to side 10 is guaranteed to be exactly 90°.',
    },
    experimentGuide: {
      instruction: 'Drag the triangle vertex in the Geometry Reasoning Canvas to adjust sides a, b, and c.',
      actionHint: 'Watch how the sum of squares a² + b² compares dynamically with c².',
      targetActionDescription: 'Create a right triangle (3-4-5 or 6-8-10) and observe the 90° angle.',
    },
    observeGuide: {
      prompt: 'Notice what happens to the angle opposite c when a² + b² > c² versus when a² + b² < c².',
      expectedPattern: 'The angle is acute when sum of squares exceeds c², and obtuse when c² exceeds the sum.',
      invariantsDescription: 'Right angle occurs if and only if a² + b² = c² exactly.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Euclid proved the converse by constructing a second right triangle with legs a and b, which has hypotenuse √(a²+b²) = c. By SSS congruence, the original triangle is congruent to the constructed right triangle, so its angle must also be 90°.',
      deductiveTakeaway: 'The Baudhāyana-Pythagoras relationship is an exact biconditional: true in both directions.',
    },
    practiceQuestionIds: ['q-prop-22', 'q-prop-23', 'q-prop-24'],
  },

  // ==========================================================================
  // Lesson 9: What Makes a Proof?
  // ==========================================================================
  'prop-l9': {
    id: 'prop-l9',
    unitId: 'unit-5',
    unitTitle: 'Unit 5: Mathematical Proof',
    lessonNumber: 9,
    title: 'What Makes a Proof?',
    subtitle: 'Empirical Evidence vs. Deductive Universal Truth',
    learningObjective:
      'Contrast empirical testing with deductive proof, and examine Euler’s polynomial as a landmark illustration of the limits of inductive checking.',
    experimentId: 'exp-evidence-vs-proof',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['number_experiment', 'proof_workbench'],
    concept: {
      summary:
        'In science, observing a phenomenon 1,000 times provides strong evidence. In mathematics, checking 1,000 or 1,000,000 cases DOES NOT constitute a proof of a universal statement. Euler’s polynomial f(n) = n² + n + 41 produces primes for n=0 up to n=39 (40 consecutive primes!), but fails at n=40.',
      detailedPoints: [
        'Euler’s polynomial: f(n) = n² + n + 41.',
        'For n = 0, 1, 2, ..., 39, every single value generated is a prime number.',
        'At n = 40: f(40) = 40² + 40 + 41 = 40(41) + 41 = 41 × 41 = 1681 (COMPOSITE!).',
        'This proves that testing even 40 consecutive numbers cannot guarantee universal truth.',
      ],
      keyTerms: [
        { term: 'Deductive Proof', definition: 'A chain of logical reasoning showing that a conclusion must follow from accepted axioms and definitions.' },
        { term: 'Empirical Checking', definition: 'Testing specific numerical examples to see if a pattern holds.' },
      ],
    },
    predictionQuestion: {
      question: 'Suppose a student tests a mathematical claim for n = 1, 2, 3, ..., 100, and it is true for all 100 numbers. Has the student proved the claim for all positive integers?',
      options: [
        'Yes, because 100 examples is more than enough in school mathematics.',
        'No, because there are infinitely many integers, and a counterexample could exist at n = 101 or larger.',
        'Yes, provided no counterexample was found.',
        'It depends on whether the teacher approves the examples.',
      ],
      correctIndex: 1,
      explanation:
        'Empirical verification cannot prove universal claims over infinite domains. A deductive proof is required.',
    },
    experimentGuide: {
      instruction: 'In the Number Experiment Workbench, evaluate Euler’s polynomial n² + n + 41 for values from n = 35 to n = 42.',
      actionHint: 'Look at the factor column when n reaches 40.',
      targetActionDescription: 'Observe the composite factor 41 × 41 at n = 40.',
    },
    observeGuide: {
      prompt: 'Notice how smoothly the prime pattern continues for 40 steps, and how suddenly it breaks down.',
      expectedPattern: 'The formula produces primes up to n=39, then yields 41² at n=40.',
      invariantsDescription: 'Finite patterns can fail outside the tested range.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'Because numbers are infinite, checking cases one by one can never exhaust all possibilities. A proof must use general variables (like n = 2k) to reason about all elements simultaneously.',
      deductiveTakeaway: 'Only deductive reasoning can cover an infinite domain in finite steps.',
    },
    practiceQuestionIds: ['q-prop-25', 'q-prop-26', 'q-prop-27'],
  },

  // ==========================================================================
  // Lesson 10: Constructing Arguments
  // ==========================================================================
  'prop-l10': {
    id: 'prop-l10',
    unitId: 'unit-5',
    unitTitle: 'Unit 5: Mathematical Proof',
    lessonNumber: 10,
    title: 'Constructing Arguments (Proof Workbench)',
    subtitle: 'Assembling Step-by-Step Deductive Proofs',
    learningObjective:
      'Assemble structured deductive arguments, justify each step with an appropriate definition or axiom, and identify invalid inferences and circular reasoning.',
    experimentId: 'exp-proof-construction',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['proof_workbench'],
    concept: {
      summary:
        'A mathematical proof is an ordered sequence of statements where each statement is either a Given condition, an Axiom, a Definition, or follows logically from earlier established steps by an inference rule.',
      detailedPoints: [
        'Every step must have an explicit reason justifying why it follows.',
        'Step order matters: you cannot use a fact before you have proved or introduced it.',
        'Circular reasoning occurs when you assume the very conclusion you are trying to prove.',
      ],
      keyTerms: [
        { term: 'Axiom', definition: 'A self-evident mathematical statement accepted without proof.' },
        { term: 'Circular Reasoning', definition: 'An invalid argument where the conclusion is assumed as a premise.' },
      ],
    },
    predictionQuestion: {
      question: 'In proving that the sum of two even numbers a and b is even, which step must logically come FIRST?',
      options: [
        'a + b = 2(m + k)',
        'Express a = 2m and b = 2k by definition of even numbers',
        'Conclude that a + b is divisible by 2',
        'Add 2m + 2k together',
      ],
      correctIndex: 1,
      explanation:
        'We must first use the definition of even numbers to represent a and b algebraically before we can add or factor them.',
    },
    experimentGuide: {
      instruction: 'In the Proof Workbench, assemble the proof that the sum of two even numbers is even.',
      actionHint: 'Select statements from the bank, match them with correct reasons, and click "Verify Proof".',
      targetActionDescription: 'Complete and verify a 5-step proof without circular logic.',
    },
    observeGuide: {
      prompt: 'Notice how each step builds on the preceding step, forming an unbroken logical chain.',
      expectedPattern: 'The conclusion is inevitably reached once all intermediate steps are justified.',
      invariantsDescription: 'A valid proof has no unverified assumptions.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Deductive validity ensures that if the initial premises are true, the conclusion is impossible to be false. This provides absolute mathematical certainty.',
      deductiveTakeaway: 'A proof is a chain of truth: every link must be securely forged.',
    },
    practiceQuestionIds: ['q-prop-28', 'q-prop-29', 'q-prop-30'],
  },

  // ==========================================================================
  // Lesson 11: Integrated Reasoning Challenges
  // ==========================================================================
  'prop-l11': {
    id: 'prop-l11',
    unitId: 'unit-6',
    unitTitle: 'Unit 6: Mastery & Revision',
    lessonNumber: 11,
    title: 'Integrated Reasoning Challenges',
    subtitle: 'Synthesizing Number Properties, Geometry & Proof',
    learningObjective:
      'Synthesize concepts across all units: classify complex propositions, form converses, find subtle counterexamples, and evaluate multi-step arguments.',
    experimentId: 'exp-integrated-reasoning',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: [
      'statement_explorer',
      'counterexample_lab',
      'number_experiment',
      'geometry_reasoning',
      'proof_workbench',
    ],
    concept: {
      summary:
        'Mastery of mathematical reasoning requires moving flexibly between number theory, algebra, and geometry, applying counterexamples to false conjectures and deductive proofs to true theorems.',
      detailedPoints: [
        'Integrate divisibility rules, prime factorization, and geometric congruence.',
        'Recognize fallacies like affirming the consequent or denying the antecedent.',
        'Distinguish necessary conditions from sufficient conditions.',
      ],
      keyTerms: [
        { term: 'Necessary Condition', definition: 'A condition that MUST hold for a conclusion to be true.' },
        { term: 'Sufficient Condition', definition: 'A condition that ALONE is enough to guarantee the conclusion.' },
      ],
    },
    predictionQuestion: {
      question: 'Consider the claim: "If x² is a multiple of 9, then x is a multiple of 9." Is this claim true or false?',
      options: [
        'True, because the square root of 9 is 3.',
        'False, and x = 3 or x = 6 are valid counterexamples.',
        'True, because 9 divides 81 and 9 divides 9.',
        'False, and x = 9 is a counterexample.',
      ],
      correctIndex: 1,
      explanation:
        'For x = 6: x² = 36, which is a multiple of 9 (36 = 9 × 4: Hypothesis TRUE). But x = 6 is NOT a multiple of 9 (Conclusion FALSE). So x = 6 is a counterexample!',
    },
    experimentGuide: {
      instruction: 'Test advanced conjectures using all workbench tools.',
      actionHint: 'Search for counterexamples in both number and geometry domains.',
      targetActionDescription: 'Solve at least two integrated reasoning challenges.',
    },
    observeGuide: {
      prompt: 'Observe how algebraic factorization reveals the exact prime power conditions.',
      expectedPattern: 'Prime powers in x² double, so x needs only one factor of 3 to make x² divisible by 9.',
      invariantsDescription: 'Prime factorization governs divisibility invariants.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'If x² is divisible by 9 = 3², then x must be divisible by 3, but NOT necessarily by 9. This distinction between necessary and sufficient prime factors is a cornerstone of mathematical reasoning.',
      deductiveTakeaway: 'Always analyze the underlying prime factors to verify divisibility claims.',
    },
    practiceQuestionIds: ['q-prop-31', 'q-prop-32', 'q-prop-33'],
  },

  // ==========================================================================
  // Lesson 12: Chapter Practice and Revision
  // ==========================================================================
  'prop-l12': {
    id: 'prop-l12',
    unitId: 'unit-6',
    unitTitle: 'Unit 6: Mastery & Revision',
    lessonNumber: 12,
    title: 'Chapter Practice and Revision',
    subtitle: 'Comprehensive NCERT Chapter Assessment',
    learningObjective:
      'Complete comprehensive multi-tier chapter practice questions assessing statement classification, converse formation, counterexample verification, and proof validation.',
    experimentId: 'exp-mastery-revision',
    stages: ['understand', 'practice'],
    allowedTools: [
      'statement_explorer',
      'counterexample_lab',
      'number_experiment',
      'geometry_reasoning',
      'proof_workbench',
    ],
    concept: {
      summary:
        'Consolidate everything learned in Class 9 Ganita Manjari: Propositions and Their Converses. Test your mastery across Basic, Standard, and Challenge difficulty questions.',
      detailedPoints: [
        'Review the distinction between propositions, opinions, and commands.',
        'Review the 4 truth categories for a proposition and its converse.',
        'Review how to state counterexamples rigorously: P(x) = True and Q(x) = False.',
        'Review deductive proof construction and the Baudhāyana-Pythagoras theorem.',
      ],
      keyTerms: [
        { term: 'Comprehensive Mastery', definition: 'The ability to apply logical reasoning, converse analysis, and proof deduction across all domains.' },
      ],
    },
    experimentGuide: {
      instruction: 'Engage with the Practice Engine to test yourself on chapter questions.',
      actionHint: 'Filter by difficulty and strive for mastery across all three tiers.',
      targetActionDescription: 'Attempt questions from Basic, Standard, and Challenge categories.',
    },
    observeGuide: {
      prompt: 'Notice your confidence in analyzing whether statements are logically sound.',
      expectedPattern: 'Structured reasoning replaces guesswork.',
      invariantsDescription: 'Logical principles apply uniformly across all mathematical topics.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'Mathematical reasoning is not just a chapter in Class 9; it is the universal language and method of all higher mathematics and sciences.',
      deductiveTakeaway: 'Think clearly, question assumptions, demand proofs, and look for counterexamples.',
    },
    practiceQuestionIds: ['q-prop-1', 'q-prop-7', 'q-prop-13', 'q-prop-22', 'q-prop-28'],
  },
};
