/**
 * Guided Curriculum Roadmap & Lesson Registry for Class 9 Quadrilaterals
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements the 7-Unit, 13-Lesson progressive curriculum path:
 * 1. Understand -> 2. Predict -> 3. Experiment -> 4. Observe -> 5. Explain/Prove -> 6. Practise
 * Conforming strictly to GuidedLessonDefinition & GuidedUnitDefinition.
 */

import type {
  GuidedUnitDefinition,
  GuidedLessonDefinition,
} from '../guidedLearning/types';

export const QUAD_GUIDED_UNITS: GuidedUnitDefinition[] = [
  {
    id: 'unit-1',
    unitNumber: 1,
    title: 'Unit 1: Understanding Quadrilaterals',
    badge: 'Foundations • Lesson 1',
    description:
      'Explore vertices, sides, diagonals, interior angles, convex vs concave configurations, and the 360° angle sum invariant.',
    lessonIds: ['quad-l1'],
  },
  {
    id: 'unit-2',
    unitNumber: 2,
    title: 'Unit 2: Parallelograms & Invariants',
    badge: 'Properties & Proofs • Lessons 2–4',
    description:
      'Investigate opposite sides/angles equality, diagonal bisection, and converse conditions that guarantee a parallelogram.',
    lessonIds: ['quad-l2', 'quad-l3', 'quad-l4'],
  },
  {
    id: 'unit-3',
    unitNumber: 3,
    title: 'Unit 3: The Midpoint Theorem',
    badge: 'Theorems & Converses • Lessons 5–7',
    description:
      'Construct side midpoints, prove parallelism and the half-length law (DE = 1/2 BC), and investigate the converse theorem.',
    lessonIds: ['quad-l5', 'quad-l6', 'quad-l7'],
  },
  {
    id: 'unit-4',
    unitNumber: 4,
    title: 'Unit 4: Triangle Medians & Centroid',
    badge: 'Medians • Lessons 8–9',
    description:
      'Construct medians, establish their concurrency at centroid G, and prove the universal 2:1 division ratio.',
    lessonIds: ['quad-l8', 'quad-l9'],
  },
  {
    id: 'unit-5',
    unitNumber: 5,
    title: 'Unit 5: Varignon Parallelogram',
    badge: 'Midpoint Quadrilateral • Lesson 10',
    description:
      'Connect the midpoints of any simple quadrilateral to form a parallelogram whose area is always half the original area.',
    lessonIds: ['quad-l10'],
  },
  {
    id: 'unit-6',
    unitNumber: 6,
    title: 'Unit 6: Tiling the Plane',
    badge: 'Tessellation • Lesson 11',
    description:
      'Tile the Euclidean plane with translated and 180°-rotated copies of any simple quadrilateral, utilizing the 360° angle sum.',
    lessonIds: ['quad-l11'],
  },
  {
    id: 'unit-7',
    unitNumber: 7,
    title: 'Unit 7: Synthesis, Revision & Practice',
    badge: 'Revision & Proofs • Lessons 12–13',
    description:
      'Euclidean proof deduction across all chapter theorems, followed by comprehensive multi-difficulty NCERT practice questions.',
    lessonIds: ['quad-l12', 'quad-l13'],
  },
];

export const QUAD_GUIDED_LESSONS: Record<string, GuidedLessonDefinition> = {
  // ==========================================================================
  // Lesson 1: What is a Quadrilateral?
  // ==========================================================================
  'quad-l1': {
    id: 'quad-l1',
    unitId: 'unit-1',
    unitTitle: 'Unit 1: Understanding Quadrilaterals',
    lessonNumber: 1,
    title: 'What is a Quadrilateral?',
    subtitle: 'Anatomy, Convexity & the 360° Angle Sum',
    learningObjective:
      'Identify vertices, sides, angles, and diagonals. Distinguish convex from concave configurations and prove the 360° angle sum.',
    experimentId: 'what-is-a-quadrilateral',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'quadrilateral', 'diagonal', 'angle_measure', 'eraser'],
    concept: {
      summary:
        'A quadrilateral is a 4-sided polygon in a plane. Connecting opposite vertices gives two diagonals. A diagonal divides the quadrilateral into two triangles, each having angles summing to 180°.',
      detailedPoints: [
        'A quadrilateral has 4 vertices, 4 sides, and 4 interior angles.',
        'Consecutive sides share a common vertex; opposite sides do not.',
        'Convex quadrilateral: All interior angles are strictly less than 180°, and both diagonals lie inside the figure.',
        'Concave quadrilateral: Exactly one interior angle exceeds 180° (reflex angle), and one diagonal falls outside the shape.',
        'Angle Sum Property: The sum of the four interior angles is always 360° (180° + 180°).',
      ],
      keyTerms: [
        { term: 'Convex', definition: 'All interior angles are < 180°; diagonals lie inside.' },
        { term: 'Concave', definition: 'One interior angle is > 180°; one diagonal lies outside.' },
        { term: 'Diagonals', definition: 'Line segments connecting two non-consecutive vertices.' },
      ],
    },
    predictionQuestion: {
      question:
        'If you drag vertex D inward until quadrilateral ABCD becomes concave (with angle D > 180°), what happens to the sum of the four interior angles?',
      options: [
        'The sum remains exactly 360°.',
        'The sum decreases below 360° because the shape folded inward.',
        'The sum increases to 540° because of the reflex angle.',
        'A concave quadrilateral does not have an angle sum.',
      ],
      correctIndex: 0,
      explanation:
        'Because any simple quadrilateral can be divided by an interior diagonal into two triangles (each having 180°), the total angle sum remains strictly 360° even in concave configurations.',
    },
    experimentGuide: {
      instruction:
        'Drag vertices A, B, C, and D to reshape the quadrilateral. Observe how the four interior angles and diagonals change while the sum is continuously computed.',
      actionHint: 'Click and drag any blue vertex handle on the canvas.',
      targetActionDescription: 'Transform vertices across convex and concave configurations',
      minInteractionsNeeded: 3,
    },
    observeGuide: {
      prompt: 'Look at the live sum of ∠A + ∠B + ∠C + ∠D displayed on the canvas and in the inspector.',
      expectedPattern: 'The calculated sum remains exactly 360.0° at all times.',
      invariantsDescription: 'Angle sum invariant: ∠A + ∠B + ∠C + ∠D = 360.0°',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Draw diagonal AC. In ΔABC, ∠CAB + ∠B + ∠BCA = 180°. In ΔADC, ∠DAC + ∠D + ∠ACD = 180°. Adding these gives (∠CAB + ∠DAC) + ∠B + (∠BCA + ∠ACD) + ∠D = 180° + 180° = 360°, which simplifies to ∠A + ∠B + ∠C + ∠D = 360°.',
      deductiveTakeaway:
        'The angle sum of any simple n-gon is (n - 2) × 180°. For n = 4, (4 - 2) × 180° = 360°.',
    },
    practiceQuestionIds: ['quad-q1', 'quad-q2', 'quad-q3'],
  },

  // ==========================================================================
  // Lesson 2: Properties of Parallelograms
  // ==========================================================================
  'quad-l2': {
    id: 'quad-l2',
    unitId: 'unit-2',
    unitTitle: 'Unit 2: Parallelograms & Invariants',
    lessonNumber: 2,
    title: 'Properties of Parallelograms',
    subtitle: 'Opposite Sides, Opposite Angles & Supplementary Consecutive Angles',
    learningObjective:
      'Prove that a diagonal divides a parallelogram into two congruent triangles, and deduce that opposite sides and opposite angles are equal.',
    experimentId: 'parallelogram-properties',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'diagonal', 'angle_measure', 'distance_measure'],
    concept: {
      summary:
        'A parallelogram is a quadrilateral in which both pairs of opposite sides are parallel. A diagonal splits it into two congruent triangles by ASA criterion.',
      detailedPoints: [
        'Definition: AB || CD and BC || DA.',
        'Theorem 12.1: A diagonal (e.g. AC) divides it into two congruent triangles (ΔABC ≅ ΔCDA).',
        'Theorem 12.2: Opposite sides are equal (AB = CD and BC = DA) by CPCTC.',
        'Theorem 12.3: Opposite angles are equal (∠A = ∠C and ∠B = ∠D) by CPCTC.',
        'Consecutive adjacent angles are supplementary (∠A + ∠B = 180°) due to co-interior angles.',
      ],
      keyTerms: [
        { term: 'Parallelogram', definition: 'A quadrilateral with both pairs of opposite sides parallel.' },
        { term: 'CPCTC', definition: 'Corresponding parts of congruent triangles are congruent.' },
        { term: 'Supplementary', definition: 'Two angles summing to 180°.' },
      ],
    },
    predictionQuestion: {
      question:
        'If adjacent angle ∠A of a parallelogram is 65°, what must be the measure of adjacent angle ∠B and opposite angle ∠C?',
      options: [
        '∠B = 115° and ∠C = 65°',
        '∠B = 65° and ∠C = 115°',
        '∠B = 90° and ∠C = 90°',
        '∠B = 125° and ∠C = 55°',
      ],
      correctIndex: 0,
      explanation:
        'Consecutive angles are supplementary (180° - 65° = 115°), and opposite angles are equal (∠C = ∠A = 65°).',
    },
    experimentGuide: {
      instruction:
        'Drag vertices A, B, or C. Observe that the opposite side lengths remain matched, and opposite angles stay equal.',
      actionHint: 'Drag vertex B or C to shear or scale the parallelogram.',
      targetActionDescription: 'Shear and resize the parallelogram',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Inspect the side lengths AB vs CD, and BC vs DA, as well as the angle badges.',
      expectedPattern: 'AB = CD, BC = DA, ∠A = ∠C, and ∠B = ∠D under all configurations.',
      invariantsDescription: 'Opposite side and angle equality invariants hold continuously.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'In ΔABC and ΔCDA: Since AB || CD with transversal AC, alternate interior angles ∠BAC = ∠DCA. Since BC || DA, ∠BCA = ∠DAC. Common side AC = CA. By ASA congruence, ΔABC ≅ ΔCDA. Therefore, AB = CD, BC = DA, and ∠B = ∠D by CPCTC.',
      deductiveTakeaway:
        'A single diagonal decomposes the parallelogram into two identical triangles, locking all opposite features into equality.',
    },
    practiceQuestionIds: ['quad-q4', 'quad-q5'],
  },

  // ==========================================================================
  // Lesson 3: Diagonals of a Parallelogram
  // ==========================================================================
  'quad-l3': {
    id: 'quad-l3',
    unitId: 'unit-2',
    unitTitle: 'Unit 2: Parallelograms & Invariants',
    lessonNumber: 3,
    title: 'Diagonals of a Parallelogram',
    subtitle: 'Mutual Bisection at Intersection Point O',
    learningObjective:
      'Construct both diagonals of a parallelogram and prove that they bisect each other at point O.',
    experimentId: 'parallelogram-diagonals',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'diagonal', 'distance_measure'],
    concept: {
      summary:
        'When both diagonals of a parallelogram are drawn, they cross at point O. Point O is the exact midpoint of both diagonal AC and diagonal BD.',
      detailedPoints: [
        'Theorem 12.4: The diagonals of a parallelogram bisect each other.',
        'This means OA = OC (O bisects AC) and OB = OD (O bisects BD).',
        'Proof relies on establishing congruence of opposite triangle pairs: ΔAOB ≅ ΔCOD by ASA criterion.',
        'In general parallelograms, diagonals are NOT equal in length (unless it is a rectangle) and NOT perpendicular (unless it is a rhombus).',
      ],
      keyTerms: [
        { term: 'Bisect', definition: 'To divide into two equal parts.' },
        { term: 'Diagonal Intersection', definition: 'The common point O where AC and BD cross.' },
      ],
    },
    predictionQuestion: {
      question:
        'In parallelogram ABCD, diagonal AC is 14 cm long and diagonal BD is 10 cm long. How far is the intersection point O from vertex A and from vertex B?',
      options: [
        'OA = 7 cm and OB = 5 cm',
        'OA = 14 cm and OB = 10 cm',
        'OA = 10 cm and OB = 14 cm',
        'OA = 6 cm and OB = 6 cm',
      ],
      correctIndex: 0,
      explanation:
        'Because the diagonals bisect each other, OA = AC / 2 = 14 / 2 = 7 cm, and OB = BD / 2 = 10 / 2 = 5 cm.',
    },
    experimentGuide: {
      instruction:
        'Drag the parallelogram vertices to change diagonal lengths. Observe the distance readouts for OA, OC, OB, and OD.',
      actionHint: 'Drag vertex A or C to alter the diagonal lengths.',
      targetActionDescription: 'Change diagonal lengths and inspect segment bisections',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Check the measured lengths of OA vs OC and OB vs OD.',
      expectedPattern: 'OA always equals OC, and OB always equals OD.',
      invariantsDescription: 'Diagonal bisection invariant: OA = OC and OB = OD.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'In ΔAOB and ΔCOD: AB = CD (opposite sides of parallelogram). ∠OAB = ∠OCD (alternate interior angles for AB || CD). ∠OBA = ∠ODC (alternate interior angles for AB || CD). By ASA congruence, ΔAOB ≅ ΔCOD. By CPCTC, OA = OC and OB = OD.',
      deductiveTakeaway:
        'The center of symmetry of a parallelogram is the mutual midpoint of its two diagonals.',
    },
    practiceQuestionIds: ['quad-q6'],
  },

  // ==========================================================================
  // Lesson 4: Converse Properties of Parallelograms
  // ==========================================================================
  'quad-l4': {
    id: 'quad-l4',
    unitId: 'unit-2',
    unitTitle: 'Unit 2: Parallelograms & Invariants',
    lessonNumber: 4,
    title: 'Converse Properties & Sufficient Conditions',
    subtitle: 'When is a Quadrilateral Guaranteed to be a Parallelogram?',
    learningObjective:
      'Explore sufficient geometric criteria that prove a quadrilateral is a parallelogram, including the "one pair equal and parallel" theorem.',
    experimentId: 'parallelogram-converses',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'parallel_constraint', 'distance_measure', 'angle_measure'],
    concept: {
      summary:
        'A converse theorem answers: "If certain side or angle conditions are met, can we conclude the shape is a parallelogram?"',
      detailedPoints: [
        'Theorem 12.5: If each pair of opposite sides of a quadrilateral is equal, then it is a parallelogram.',
        'Theorem 12.6: If each pair of opposite angles of a quadrilateral is equal, then it is a parallelogram.',
        'Theorem 12.7: If the diagonals of a quadrilateral bisect each other, then it is a parallelogram.',
        'Theorem 12.8: A quadrilateral is a parallelogram if ONE pair of opposite sides is BOTH equal and parallel.',
        'Warning: If only one pair of opposite sides is equal (without being parallel), the shape might be an isosceles trapezium, NOT a parallelogram!',
      ],
      keyTerms: [
        { term: 'Converse', definition: 'A theorem formed by swapping the hypothesis and conclusion.' },
        { term: 'Sufficient Condition', definition: 'A geometric condition that guarantees the conclusion.' },
      ],
    },
    predictionQuestion: {
      question:
        'A quadrilateral ABCD has side AB = 6 cm and CD = 6 cm. Is this information alone sufficient to prove that ABCD is a parallelogram?',
      options: [
        'No, because the sides must also be parallel, or the other two sides must also be equal. Otherwise, it could be a trapezium.',
        'Yes, any quadrilateral with one pair of equal sides is a parallelogram.',
        'Yes, because equal sides force equal angles.',
        'No, because a quadrilateral must have all four sides equal.',
      ],
      correctIndex: 0,
      explanation:
        'An isosceles trapezium has one pair of equal opposite sides (the legs), but they are not parallel. To guarantee a parallelogram, the sides must be both equal AND parallel, or both pairs of opposite sides must be equal.',
    },
    experimentGuide: {
      instruction:
        'Drag vertices of the free quadrilateral to test whether making one pair equal and parallel immediately forces the other pair to be equal and parallel.',
      actionHint: 'Adjust vertex D so that AD and BC align in length and slope.',
      targetActionDescription: 'Test opposite side and angle conditions',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Observe whether the quadrilateral classification badge switches to "Parallelogram".',
      expectedPattern: 'Whenever AB || CD and AB = CD, the shape instantly satisfies all parallelogram invariants.',
      invariantsDescription: 'One pair equal and parallel is sufficient for a parallelogram.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Given AB = CD and AB || CD. Draw diagonal AC. Since AB || CD, alternate interior angles ∠BAC = ∠DCA. With AB = CD and shared side AC, ΔABC ≅ ΔCDA by SAS. By CPCTC, ∠BCA = ∠DAC, which proves BC || DA. Hence ABCD is a parallelogram.',
      proofSteps: [
        { statement: 'AB = CD and AB || CD', reason: 'Given' },
        { statement: '∠BAC = ∠DCA', reason: 'Alternate interior angles for AB || CD' },
        { statement: 'AC = CA', reason: 'Common side' },
        {
          statement: 'ΔABC ≅ ΔCDA',
          reason: 'SAS Congruence Criterion',
          missingReasonOptions: ['SAS Congruence Criterion', 'SSS Congruence', 'RHS Criterion', 'ASA Criterion'],
          correctReasonIndex: 0,
        },
        { statement: '∠BCA = ∠DAC and BC = DA', reason: 'CPCTC' },
        { statement: 'BC || DA', reason: 'Converse of alternate interior angles' },
        { statement: 'ABCD is a parallelogram', reason: 'Both pairs of opposite sides are parallel' },
      ],
      deductiveTakeaway:
        'Pairing equality with parallelism on just one side pair fully constrains the opposite pair.',
    },
    practiceQuestionIds: ['quad-q7'],
  },

  // ==========================================================================
  // Lesson 5: Triangle Midpoints
  // ==========================================================================
  'quad-l5': {
    id: 'quad-l5',
    unitId: 'unit-3',
    unitTitle: 'Unit 3: The Midpoint Theorem',
    lessonNumber: 5,
    title: 'Triangle Midpoints & Medial Triangle',
    subtitle: 'Locating Midpoints and Constructing Sub-Triangles',
    learningObjective:
      'Construct the midpoints of the three sides of a triangle and examine the medial triangle formed by connecting them.',
    experimentId: 'triangle-midpoints',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'midpoint', 'distance_measure'],
    concept: {
      summary:
        'The midpoint of a segment divides it into two segments of equal length. Connecting the three side midpoints of any triangle creates a medial triangle.',
      detailedPoints: [
        'Every triangle has 3 sides and therefore 3 side midpoints: D on AB, E on BC, and F on CA.',
        'Connecting D, E, F forms the medial triangle DEF.',
        'The medial triangle partitions the parent triangle into four smaller congruent triangles: ΔADF, ΔDBE, ΔFEC, and ΔEFD.',
        'Perimeter(DEF) = 1/2 Perimeter(ABC).',
        'Area(DEF) = 1/4 Area(ABC).',
      ],
      keyTerms: [
        { term: 'Midpoint', definition: 'The unique point on a segment that divides it into two equal lengths.' },
        { term: 'Medial Triangle', definition: 'The triangle whose vertices are the midpoints of the sides of a given triangle.' },
      ],
    },
    predictionQuestion: {
      question:
        'If the perimeter of triangle ABC is 24 cm, what is the perimeter of its medial triangle DEF formed by connecting the side midpoints?',
      options: ['12 cm', '6 cm', '8 cm', '16 cm'],
      correctIndex: 0,
      explanation:
        'Because each side of the medial triangle is half the length of the corresponding side of the parent triangle, its perimeter is exactly half: 24 / 2 = 12 cm.',
    },
    experimentGuide: {
      instruction:
        'Drag the vertices of triangle ABC. Watch how midpoints D, E, and F update dynamically and maintain their midpoint positions.',
      actionHint: 'Drag vertex A, B, or C on the canvas.',
      targetActionDescription: 'Drag triangle vertices and verify midpoint tracking',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Compare the side lengths of the inner medial triangle DEF to the outer sides of ABC.',
      expectedPattern: 'Each side of DEF is half as long as the parallel side of ABC.',
      invariantsDescription: 'Medial side lengths are exactly half the corresponding outer side lengths.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'By the Midpoint Theorem, DE = 1/2 AC, EF = 1/2 AB, and FD = 1/2 BC. Summing these three gives Perimeter(DEF) = 1/2 (AC + AB + BC) = 1/2 Perimeter(ABC).',
      deductiveTakeaway:
        'The medial triangle scales the parent perimeter by 1/2 and its area by (1/2)² = 1/4.',
    },
    practiceQuestionIds: ['quad-q9'],
  },

  // ==========================================================================
  // Lesson 6: The Midpoint Theorem
  // ==========================================================================
  'quad-l6': {
    id: 'quad-l6',
    unitId: 'unit-3',
    unitTitle: 'Unit 3: The Midpoint Theorem',
    lessonNumber: 6,
    title: 'The Midpoint Theorem',
    subtitle: 'Parallelism & the Half-Length Invariant (Theorem 12.9)',
    learningObjective:
      'Prove Theorem 12.9: The segment joining the midpoints of two sides of a triangle is parallel to the third side and half of it.',
    experimentId: 'midpoint-theorem',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'midpoint', 'distance_measure', 'parallel_constraint'],
    concept: {
      summary:
        'Theorem 12.9 is one of the most powerful theorems in Euclidean geometry: In ΔABC, if D and E are midpoints of AB and AC, then DE || BC and DE = 1/2 BC.',
      detailedPoints: [
        'Theorem statement: The line segment joining the midpoints of two sides of a triangle is parallel to the third side and is half as long as that third side.',
        'Proof strategy: Extend DE to F such that DE = EF, and join CF.',
        'Prove ΔADE ≅ ΔCFE by SAS criterion (AE = EC, ∠AED = ∠CEF, DE = EF).',
        'This gives AD = CF and ∠DAE = ∠FCE (alternate interior angles, so AB || CF).',
        'Since AD = BD, we have BD = CF and BD || CF, making quadrilateral BCFD a parallelogram!',
        'In parallelogram BCFD, DF = BC and DF || BC. Since DE = 1/2 DF, we have DE = 1/2 BC and DE || BC.',
      ],
      keyTerms: [
        { term: 'Midpoint Theorem', definition: 'Segment joining midpoints of two sides of a triangle is || third side and half its length.' },
        { term: 'Auxiliary Construction', definition: 'Extending DE to F such that DE = EF to form a parallelogram.' },
      ],
    },
    predictionQuestion: {
      question:
        'In triangle ABC, D is the midpoint of AB and E is the midpoint of AC. If base BC has a length of 15.4 cm, what is the length of segment DE?',
      options: ['7.7 cm', '10.2 cm', '5.1 cm', '15.4 cm'],
      correctIndex: 0,
      explanation:
        'By the Midpoint Theorem, DE = 1/2 × BC = 15.4 / 2 = 7.7 cm.',
    },
    experimentGuide: {
      instruction:
        'Drag vertex A, B, or C. Observe the live length readout for DE and BC, and watch their ratio.',
      actionHint: 'Drag vertex A upwards or sideways to alter the triangle shape.',
      targetActionDescription: 'Transform the triangle and observe DE vs BC',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Check the ratio BC / DE in the inspector.',
      expectedPattern: 'The ratio BC / DE is always 2.000, and DE remains strictly parallel to BC.',
      invariantsDescription: 'Midpoint Theorem invariant: DE || BC and DE = 0.500 × BC.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Extend DE to F with DE = EF. ΔADE ≅ ΔCFE (SAS) implies CF = AD = BD and CF || BD. Thus BCFD is a parallelogram. Opposite sides are equal: DF = BC, so 2 DE = BC => DE = 1/2 BC. Also DF || BC => DE || BC.',
      proofSteps: [
        { statement: 'Extend DE to F such that DE = EF; join CF', reason: 'Auxiliary construction' },
        { statement: 'AE = EC, DE = EF, and ∠AED = ∠CEF', reason: 'E is midpoint, construction, vertically opposite angles' },
        {
          statement: 'ΔADE ≅ ΔCFE',
          reason: 'SAS Congruence Criterion',
          missingReasonOptions: ['SAS Congruence Criterion', 'RHS Criterion', 'SSS Criterion', 'AAA Criterion'],
          correctReasonIndex: 0,
        },
        { statement: 'AD = CF and ∠DAE = ∠FCE (so AB || CF)', reason: 'CPCTC and alternate interior angles' },
        { statement: 'BD = CF and BD || CF', reason: 'D is midpoint of AB, so AD = BD' },
        { statement: 'BCFD is a parallelogram', reason: 'One pair of opposite sides is equal and parallel' },
        { statement: 'DF || BC and DF = BC', reason: 'Opposite sides of parallelogram BCFD' },
        { statement: 'DE || BC and DE = 1/2 BC', reason: 'DE = 1/2 DF since DE = EF' },
      ],
      deductiveTakeaway:
        'By completing the parallelogram BCFD, the half-length and parallelism relations follow inevitably.',
    },
    practiceQuestionIds: ['quad-q8'],
  },

  // ==========================================================================
  // Lesson 7: Converse of Midpoint Theorem
  // ==========================================================================
  'quad-l7': {
    id: 'quad-l7',
    unitId: 'unit-3',
    unitTitle: 'Unit 3: The Midpoint Theorem',
    lessonNumber: 7,
    title: 'Converse of the Midpoint Theorem',
    subtitle: 'Ray Through Midpoint Parallel to Base Bisects Third Side',
    learningObjective:
      'Prove and apply Theorem 12.10: The line drawn through the midpoint of one side of a triangle parallel to another side bisects the third side.',
    experimentId: 'converse-midpoint-theorem',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'parallel_constraint', 'distance_measure'],
    concept: {
      summary:
        'Theorem 12.10 is the logical converse of the Midpoint Theorem: Instead of starting with two midpoints, we start with ONE midpoint D and draw a line parallel to BC.',
      detailedPoints: [
        'Theorem 12.10 statement: The line drawn through the midpoint of one side of a triangle parallel to another side bisects the third side.',
        'Given: D is the midpoint of AB (AD = DB) and line l through D is parallel to BC, intersecting AC at E.',
        'Conclusion: E is the midpoint of AC (AE = EC).',
        'Proof method: Draw CM || BA meeting DE extended at F. Show DBCF is a parallelogram and ΔADE ≅ ΔCFE.',
      ],
      keyTerms: [
        { term: 'Converse of Midpoint Theorem', definition: 'Line through midpoint of one side parallel to second side bisects third side.' },
      ],
    },
    predictionQuestion: {
      question:
        'In ΔABC, D is the midpoint of AB. A line drawn through D parallel to BC cuts AC at point E. If side AC has a length of 22 cm, what is the length of AE?',
      options: ['11 cm', '14 cm', '7 cm', '22 cm'],
      correctIndex: 0,
      explanation:
        'By the Converse of the Midpoint Theorem, E bisects AC. Therefore, AE = AC / 2 = 22 / 2 = 11 cm.',
    },
    experimentGuide: {
      instruction:
        'Drag triangle vertices. Observe that line DE, constrained parallel to BC through midpoint D, always cuts AC into two exactly equal halves (AE = EC).',
      actionHint: 'Drag vertex B or C to change the slope of BC.',
      targetActionDescription: 'Change base slope and inspect AC bisection',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Check the lengths of AE and EC in the inspector.',
      expectedPattern: 'AE always equals EC under all triangle shapes.',
      invariantsDescription: 'Converse midpoint invariant: AE = EC.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Draw CF || BA intersecting DE extended at F. Since DF || BC and CF || BD, quadrilateral BCFD is a parallelogram, so CF = BD = AD. In ΔADE and ΔCFE: ∠DAE = ∠FCE (alternate interior), AD = CF, and ∠ADE = ∠CFE (alternate interior). By ASA, ΔADE ≅ ΔCFE. By CPCTC, AE = EC.',
      deductiveTakeaway:
        'Parallel projection from the midpoint of one side guarantees equal partitioning of the opposite side.',
    },
    practiceQuestionIds: ['quad-q10'],
  },

  // ==========================================================================
  // Lesson 8: Triangle Medians
  // ==========================================================================
  'quad-l8': {
    id: 'quad-l8',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Medians and Centroid',
    lessonNumber: 8,
    title: 'Medians of a Triangle',
    subtitle: 'Concurrency at the Single Point Centroid G',
    learningObjective:
      'Construct the three medians of a triangle and establish their invariant concurrency at the centroid G.',
    experimentId: 'triangle-medians',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'midpoint'],
    concept: {
      summary:
        'A median is a segment from a vertex to the midpoint of the opposite side. Any triangle has exactly 3 medians, and remarkably, all three always meet at a single point called the centroid (G).',
      detailedPoints: [
        'Median 1: Connects vertex A to midpoint D of side BC.',
        'Median 2: Connects vertex B to midpoint E of side CA.',
        'Median 3: Connects vertex C to midpoint F of side AB.',
        'Concurrency: Three or more lines are concurrent if they intersect at a single common point.',
        'The centroid G always lies strictly inside the triangle (unlike orthocenter or circumcenter, which can lie outside).',
      ],
      keyTerms: [
        { term: 'Median', definition: 'Segment joining a vertex to the midpoint of the opposite side.' },
        { term: 'Centroid', definition: 'The point of concurrency of the three medians of a triangle.' },
        { term: 'Concurrent', definition: 'Intersecting at a single common point.' },
      ],
    },
    predictionQuestion: {
      question:
        'Can the centroid G of a triangle ever fall outside the triangle (for example, in an obtuse-angled triangle)?',
      options: [
        'No, the centroid G always lies strictly in the interior of any triangle.',
        'Yes, for an obtuse-angled triangle it lies outside.',
        'Yes, for a right-angled triangle it lies on the hypotenuse.',
        'It depends on which side is longest.',
      ],
      correctIndex: 0,
      explanation:
        'Because each median lies entirely within the convex polygonal region of the triangle, their intersection G is guaranteed to remain strictly in the interior.',
    },
    experimentGuide: {
      instruction:
        'Drag any vertex of triangle ABC to acute, right, and obtuse configurations. Verify that all three medians AD, BE, and CF never fail to meet at point G.',
      actionHint: 'Drag vertex A far to the side to create an extreme obtuse triangle.',
      targetActionDescription: 'Transform triangle across acute, right, and obtuse shapes',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Observe the three medians AD, BE, CF crossing at G.',
      expectedPattern: 'All three lines meet at exactly one point G with zero separation.',
      invariantsDescription: 'Median concurrency invariant holds unconditionally.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'By Ceva’s Theorem: (AF/FB) × (BD/DC) × (CE/EA) = (1/1) × (1/1) × (1/1) = 1. Since this product is 1, the three medians are guaranteed to be concurrent at centroid G.',
      deductiveTakeaway:
        'Centroid G represents the physical center of mass (barycenter) of the triangular region.',
    },
    practiceQuestionIds: ['quad-q11'],
  },

  // ==========================================================================
  // Lesson 9: The Centroid Theorem
  // ==========================================================================
  'quad-l9': {
    id: 'quad-l9',
    unitId: 'unit-4',
    unitTitle: 'Unit 4: Medians and Centroid',
    lessonNumber: 9,
    title: 'The Centroid Theorem',
    subtitle: 'The Invariant 2:1 Ratio on Every Median',
    learningObjective:
      'Prove and verify Theorem 12.11: The centroid of a triangle divides each median in the ratio 2:1 from the vertex.',
    experimentId: 'centroid-theorem',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'midpoint', 'distance_measure'],
    concept: {
      summary:
        'On every median, centroid G is positioned twice as far from the vertex as it is from the opposite side midpoint: AG : GD = 2 : 1, BG : GE = 2 : 1, CG : GF = 2 : 1.',
      detailedPoints: [
        'Theorem 12.11: The centroid of a triangle divides each median in the ratio 2:1.',
        'AG = 2/3 AD and GD = 1/3 AD.',
        'Proof uses the Midpoint Theorem: Join midpoints D and E. DE || AB and DE = 1/2 AB.',
        'Triangles ΔGDE and ΔGAB are similar (AA criterion) because alternate interior angles are equal.',
        'Ratio of sides is AG / GD = AB / DE = 2 / 1.',
      ],
      keyTerms: [
        { term: '2:1 Ratio', definition: 'The vertex-to-centroid segment is twice the length of the centroid-to-midpoint segment.' },
      ],
    },
    predictionQuestion: {
      question:
        'If median BE has total length 21 cm, what is the length of segment BG from vertex B to centroid G?',
      options: ['14 cm', '7 cm', '10.5 cm', '12 cm'],
      correctIndex: 0,
      explanation:
        'Centroid G divides median BE in ratio 2:1 from vertex B. Therefore, BG = 2/3 × 21 = 14 cm, and GE = 1/3 × 21 = 7 cm.',
    },
    experimentGuide: {
      instruction:
        'Drag the vertices of the triangle and observe the live lengths AG and GD, as well as the computed ratio AG / GD.',
      actionHint: 'Drag vertex A to change the length of median AD.',
      targetActionDescription: 'Change median lengths and observe the 2:1 division',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Check the computed ratio AG / GD in the inspector.',
      expectedPattern: 'The ratio is always 2.000 (AG = 2 × GD).',
      invariantsDescription: 'Centroid 2:1 division ratio invariant.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Join midpoints D and E of sides BC and AC. By the Midpoint Theorem, DE || AB and DE = 1/2 AB. In ΔGAB and ΔGDE: ∠GAB = ∠GDE and ∠GBA = ∠GED (alternate interior angles for DE || AB). Also vertically opposite angles ∠AGB = ∠DGE. Therefore ΔGAB ~ ΔGDE by AAA similarity. Hence AG / GD = BG / GE = AB / DE = 2 / 1.',
      deductiveTakeaway:
        'The Midpoint Theorem directly proves the 2:1 centroid division via similar triangles.',
    },
    practiceQuestionIds: ['quad-q11', 'quad-q12'],
  },

  // ==========================================================================
  // Lesson 10: Varignon Parallelogram
  // ==========================================================================
  'quad-l10': {
    id: 'quad-l10',
    unitId: 'unit-5',
    unitTitle: 'Unit 5: Varignon Parallelogram',
    lessonNumber: 10,
    title: 'Varignon Parallelogram',
    subtitle: 'Connecting Side Midpoints of Any Quadrilateral',
    learningObjective:
      'Prove Varignon’s Theorem: The midpoints of the sides of any simple quadrilateral form a parallelogram whose area is half the original area.',
    experimentId: 'varignon-parallelogram',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'quadrilateral', 'midpoint', 'distance_measure'],
    concept: {
      summary:
        'Take ANY simple quadrilateral ABCD, whether convex or concave, irregular or regular. Mark the midpoints of its four sides: P, Q, R, S. Joining them always yields a parallelogram!',
      detailedPoints: [
        'Varignon’s Theorem: The quadrilateral formed by joining the midpoints of the sides of any simple quadrilateral in order is a parallelogram.',
        'Proof relies on applying the Midpoint Theorem to diagonal AC: In ΔABC, PQ || AC and PQ = 1/2 AC. In ΔADC, RS || AC and RS = 1/2 AC.',
        'Therefore, PQ || RS and PQ = RS. A quadrilateral with one pair of opposite sides equal and parallel is a parallelogram (Theorem 12.8)!',
        'Area invariant: Area(PQRS) = 1/2 Area(ABCD).',
        'Special cases: Rectangle yields Rhombus, Rhombus yields Rectangle, Square yields Square.',
      ],
      keyTerms: [
        { term: 'Varignon Parallelogram', definition: 'The parallelogram formed by joining the side midpoints of any quadrilateral.' },
        { term: 'Area Invariant', definition: 'Area of the Varignon parallelogram is always exactly half the outer quadrilateral area.' },
      ],
    },
    predictionQuestion: {
      question:
        'If the area of a large irregular convex quadrilateral ABCD is 84 cm², what is the area of its Varignon parallelogram PQRS?',
      options: ['42 cm²', '21 cm²', '56 cm²', '63 cm²'],
      correctIndex: 0,
      explanation:
        'By Varignon’s Theorem, the area of the midpoint parallelogram is always exactly half the area of the quadrilateral: 84 / 2 = 42 cm².',
    },
    experimentGuide: {
      instruction:
        'Drag vertices A, B, C, and D into various wild, irregular, or concave shapes. Observe that PQRS remains a strict parallelogram whose area is continuously half of ABCD.',
      actionHint: 'Drag vertex B far out or inward.',
      targetActionDescription: 'Deform quadrilateral ABCD and observe Varignon parallelogram invariants',
      minInteractionsNeeded: 3,
    },
    observeGuide: {
      prompt: 'Check the side lengths and opposite parallelism of PQRS, and the area ratio Area(PQRS) / Area(ABCD).',
      expectedPattern: 'PQ = RS, QR = SP, PQ || RS, and the area ratio is exactly 0.500.',
      invariantsDescription: 'Varignon invariants: PQRS is a parallelogram; Area ratio = 0.500.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Draw diagonal AC. In ΔABC, P and Q are midpoints of AB and BC. By the Midpoint Theorem, PQ || AC and PQ = 1/2 AC. In ΔADC, S and R are midpoints of AD and CD. By the Midpoint Theorem, SR || AC and SR = 1/2 AC. Therefore, PQ || SR and PQ = SR. By Theorem 12.8, PQRS is a parallelogram.',
      deductiveTakeaway:
        'The Midpoint Theorem connects diagonals of the outer quadrilateral to sides of the inner parallelogram.',
    },
    practiceQuestionIds: ['quad-q13', 'quad-q14', 'quad-q15', 'quad-q20'],
  },

  // ==========================================================================
  // Lesson 11: Tiling the Plane
  // ==========================================================================
  'quad-l11': {
    id: 'quad-l11',
    unitId: 'unit-6',
    unitTitle: 'Unit 6: Tiling the Plane',
    lessonNumber: 11,
    title: 'Quadrilateral Tiling of the Plane',
    subtitle: 'Monohedral Tessellation via 180° Rotations & 360° Angle Sum',
    learningObjective:
      'Investigate how any simple quadrilateral (convex or concave) can tile the Euclidean plane without gaps or overlaps.',
    experimentId: 'quadrilateral-tiling',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'quadrilateral'],
    concept: {
      summary:
        'Can ANY quadrilateral tile the floor with zero gaps or overlaps? Yes! Because the four interior angles sum to 360°, rotating copies 180° about edge midpoints causes all four angles to meet at every vertex.',
      detailedPoints: [
        'Monohedral tiling: A tessellation using only one congruent prototile shape.',
        'Why does it work? At every vertex of the tiling, four corners meet: one ∠A, one ∠B, one ∠C, and one ∠D.',
        'Since ∠A + ∠B + ∠C + ∠D = 360°, they sum to a complete circle with zero gaps and zero overlap.',
        'Geometric transformation: A 180° rotation around the midpoint of edge BC pairs edge BC to itself and creates an adjacent tile.',
        'Repeating this along edge midpoints produces two translational lattice vectors that tile the infinite plane.',
        'Concave simple quadrilaterals also tile the plane!',
      ],
      keyTerms: [
        { term: 'Tessellation', definition: 'Covering a plane with geometric shapes without gaps or overlaps.' },
        { term: 'Monohedral', definition: 'A tiling using only a single tile shape.' },
        { term: 'Prototile', definition: 'The base shape used to generate the tiling.' },
      ],
    },
    predictionQuestion: {
      question:
        'Why is any simple quadrilateral guaranteed to tile the plane, whereas an arbitrary pentagon cannot?',
      options: [
        'Because the interior angles of a quadrilateral sum to 360°, allowing one of each angle (A + B + C + D) to fit around every vertex.',
        'Because quadrilaterals have an even number of sides.',
        'Because all quadrilaterals have parallel sides.',
        'Only squares can tile the plane, not general quadrilaterals.',
      ],
      correctIndex: 0,
      explanation:
        'The 360° angle sum matches the exact degree measure around a point. Four copies meeting at each vertex with one of each angle pack the plane seamlessly.',
    },
    experimentGuide: {
      instruction:
        'Drag any vertex of the highlighted base tile ABCD. Observe how the entire plane of tiles adapts instantly, shifting and rotating in perfect unison without gaps.',
      actionHint: 'Drag a vertex of the bright highlighted tile ABCD.',
      targetActionDescription: 'Deform base tile and watch real-time tessellation update',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Look at the junction where four tiles meet. Observe the four colored angles surrounding the vertex.',
      expectedPattern: 'The four corners at each junction sum to 360°, and adjacent tile edges match congruently.',
      invariantsDescription: 'Zero-gap, zero-overlap monohedral tessellation invariant.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'A 180° rotation around edge midpoint M maps edge E onto itself with reversed orientation. Applying this to all four edges generates a periodic lattice with two translation vectors. Because the angle sum is 360°, four rotated tiles assemble at each vertex without gaps.',
      deductiveTakeaway:
        'Plane tiling is the direct physical realization of the 360° quadrilateral angle sum.',
    },
    practiceQuestionIds: ['quad-q16', 'quad-q17'],
  },

  // ==========================================================================
  // Lesson 12: Theorem Investigation and Proof
  // ==========================================================================
  'quad-l12': {
    id: 'quad-l12',
    unitId: 'unit-7',
    unitTitle: 'Unit 7: Synthesis, Revision & Practice',
    lessonNumber: 12,
    title: 'Theorem Investigation and Proof',
    subtitle: 'Euclidean Synthesis Across All Chapter Theorems',
    learningObjective:
      'Synthesize all key theorems of Chapter 12 through two-column formal proofs and multi-step geometric reasoning.',
    experimentId: 'theorem-investigation',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'diagonal', 'angle_measure', 'distance_measure'],
    concept: {
      summary:
        'Connect the complete deductive web of Chapter 12: from Angle Sum -> Parallelogram Congruence -> Diagonal Bisection -> Midpoint Theorem -> Centroid 2:1 -> Varignon Parallelogram.',
      detailedPoints: [
        'Review the key theorem hierarchy and converse connections.',
        'Practice identifying the correct congruence criteria (SAS, ASA, SSS, RHS) in proof steps.',
        'Understand how auxiliary constructions (e.g. extending segments, drawing diagonals) unlock non-trivial proofs.',
      ],
      keyTerms: [
        { term: 'Deductive Proof', definition: 'A logical chain of statements supported by axioms and prior theorems.' },
        { term: 'Theorem Hierarchy', definition: 'How foundational theorems derive advanced theorems.' },
      ],
    },
    predictionQuestion: {
      question:
        'Which prior theorem is the primary foundation used to prove Varignon’s Theorem?',
      options: [
        'The Midpoint Theorem (applied to diagonals of the outer quadrilateral)',
        'The Centroid Theorem',
        'Pythagoras’ Theorem',
        'Ceva’s Theorem',
      ],
      correctIndex: 0,
      explanation:
        'Varignon’s Theorem is proved by drawing diagonal AC, applying the Midpoint Theorem to ΔABC (PQ || AC, PQ = 1/2 AC) and ΔADC (RS || AC, RS = 1/2 AC), which immediately establishes that PQ || RS and PQ = RS.',
    },
    experimentGuide: {
      instruction:
        'Inspect the synthesis construction on the canvas. Drag vertices to verify how multiple theorems operate simultaneously.',
      actionHint: 'Drag vertices and review the highlighted proof steps in the inspector.',
      targetActionDescription: 'Explore multi-theorem interactions',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Review the steps in the formal deductive proof.',
      expectedPattern: 'Each statement is justified by a defined definition or theorem.',
      invariantsDescription: 'Formal Euclidean deduction validity.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Euclidean geometry is a unified logical network where simpler theorems (such as congruent triangles) systematically build complex theorems (such as the Midpoint Theorem and Varignon Parallelograms).',
      deductiveTakeaway:
        'Mastery of geometry lies in recognizing the underlying theorem that solves a complex diagram.',
    },
    practiceQuestionIds: ['quad-q7', 'quad-q18'],
  },

  // ==========================================================================
  // Lesson 13: Chapter Practice and Revision
  // ==========================================================================
  'quad-l13': {
    id: 'quad-l13',
    unitId: 'unit-7',
    unitTitle: 'Unit 7: Synthesis, Revision & Practice',
    lessonNumber: 13,
    title: 'Chapter Practice and Revision',
    subtitle: 'Comprehensive NCERT Examination Problem Bank',
    learningObjective:
      'Master examination problems across Basic, Standard, and Challenge difficulty tiers covering all aspects of Chapter 12.',
    experimentId: 'chapter-practice-workbench',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point', 'segment', 'diagonal', 'angle_measure', 'distance_measure'],
    concept: {
      summary:
        'Put all your skills to the test with comprehensive NCERT examination problems spanning angle calculations, side metrics, Midpoint Theorem applications, and Varignon invariants.',
      detailedPoints: [
        'Solve missing angle problems using the 360° sum and supplementary adjacent angles.',
        'Calculate segment lengths using the Midpoint Theorem (DE = 1/2 BC) and Centroid 2:1 division.',
        'Compute Varignon parallelogram areas and perimeters from diagonal givens.',
        'Identify special quadrilaterals: rectangles, rhombuses, squares, trapeziums, and kites.',
      ],
      keyTerms: [
        { term: 'Comprehensive Revision', definition: 'Synthesis across all 12 prior lessons.' },
      ],
    },
    predictionQuestion: {
      question:
        'In rhombus ABCD with diagonals AC = 16 cm and BD = 12 cm, what is the length of each side of the rhombus?',
      options: ['10 cm', '14 cm', '8 cm', '12 cm'],
      correctIndex: 0,
      explanation:
        'The diagonals of a rhombus bisect each other at right angles (90°). In right triangle ΔAOB, OA = 8 cm and OB = 6 cm. By Pythagoras: AB = √(8² + 6²) = √(64 + 36) = √100 = 10 cm.',
    },
    experimentGuide: {
      instruction:
        'Review the practice questions below. Work through each problem using the hints and instant validation.',
      actionHint: 'Solve the practice questions in the inspector panel.',
      targetActionDescription: 'Work through the chapter practice problem set',
      minInteractionsNeeded: 1,
    },
    observeGuide: {
      prompt: 'Notice your mastery score updating as you solve questions.',
      expectedPattern: 'Full chapter completion is achieved upon mastering practice problems.',
      invariantsDescription: 'Examination readiness across all difficulty tiers.',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'Regular practice solidifies mathematical concepts and builds problem-solving confidence for school examinations.',
      deductiveTakeaway:
        'Congratulations on completing the Class 9 Quadrilaterals Laboratory!',
    },
    practiceQuestionIds: ['quad-q18', 'quad-q19', 'quad-q20'],
  },
};

export const ORDERED_QUAD_LESSON_IDS = [
  'quad-l1',
  'quad-l2',
  'quad-l3',
  'quad-l4',
  'quad-l5',
  'quad-l6',
  'quad-l7',
  'quad-l8',
  'quad-l9',
  'quad-l10',
  'quad-l11',
  'quad-l12',
  'quad-l13',
];

export function getNextRecommendedLesson(completedIds: string[]): string {
  for (const id of ORDERED_QUAD_LESSON_IDS) {
    if (!completedIds.includes(id)) {
      return id;
    }
  }
  return ORDERED_QUAD_LESSON_IDS[0];
}
