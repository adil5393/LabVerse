/**
 * Comprehensive Practice Question Bank for Class 9 Quadrilaterals
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Difficulty Tiers: Basic, Standard, Challenge
 * Question Types: Numerical, Multiple Choice, Diagram Reasoning, Construction, Proof Step
 * Aligned strictly to authoritative geometric theorems and givens.
 */

import type { PracticeQuestion } from './types';

export const CHAPTER_PRACTICE_BANK: PracticeQuestion[] = [
  // ==========================================================================
  // Unit 1: Understanding Quadrilaterals & Angle Sum Property
  // ==========================================================================
  {
    id: 'quad-q1',
    title: 'Fourth Angle of a Quadrilateral',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'angle_sum',
    ncertReference: 'NCERT Class 9 Chapter 12 — Angle Sum Property',
    statement:
      'Three interior angles of a quadrilateral ABCD are 75°, 90°, and 110°. Find the measure of the fourth interior angle ∠D in degrees.',
    diagramGivens: {
      quadrilateralType: 'general_convex',
      points: {
        A: { x: -3, y: -2 },
        B: { x: 3, y: -2 },
        C: { x: 2, y: 3 },
        D: { x: -2, y: 2 },
      },
      knownValues: { '∠A': '75°', '∠B': '90°', '∠C': '110°' },
    },
    correctAnswer: 85,
    acceptableTolerance: 0.1,
    unit: 'degrees',
    hints: [
      'Recall the fundamental angle sum property of any planar simple quadrilateral.',
      'The sum of the four interior angles is always 360°.',
      'Compute: 360° - (75° + 90° + 110°).',
    ],
    workedSolution: [
      'By the angle sum theorem of a quadrilateral: ∠A + ∠B + ∠C + ∠D = 360°',
      'Substitute known angles: 75° + 90° + 110° + ∠D = 360°',
      '275° + ∠D = 360°',
      '∠D = 360° - 275° = 85°',
    ],
  },
  {
    id: 'quad-q2',
    title: 'Angles in a Given Ratio',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'angle_sum',
    ncertReference: 'NCERT Class 9 Chapter 12 — Exercise 12.1, Q1',
    statement:
      'The angles of a quadrilateral are in the ratio 3 : 5 : 9 : 13. Find the measure of the largest angle in degrees.',
    diagramGivens: {
      quadrilateralType: 'general_convex',
      points: {
        A: { x: -4, y: -1 },
        B: { x: 2, y: -3 },
        C: { x: 4, y: 2 },
        D: { x: -1, y: 3 },
      },
      knownValues: { Ratio: '3 : 5 : 9 : 13' },
    },
    correctAnswer: 156,
    acceptableTolerance: 0.1,
    unit: 'degrees',
    hints: [
      'Let the four angles be 3x, 5x, 9x, and 13x.',
      'Sum all four parts: 3x + 5x + 9x + 13x = 360°.',
      'Find x, then calculate the largest angle 13x.',
    ],
    workedSolution: [
      'Let the angles be 3x, 5x, 9x, and 13x.',
      'Sum of angles: 3x + 5x + 9x + 13x = 30x = 360°',
      'x = 360° / 30 = 12°',
      'The largest angle is 13x = 13 × 12° = 156°.',
      'Verification: 3(12) + 5(12) + 9(12) + 13(12) = 36 + 60 + 108 + 156 = 360°.',
    ],
  },
  {
    id: 'quad-q3',
    title: 'Convex vs Concave Quadrilateral Identification',
    difficulty: 'basic',
    questionType: 'multiple_choice',
    topicId: 'anatomy',
    ncertReference: 'NCERT Class 9 Chapter 12 — Section 12.1',
    statement:
      'A quadrilateral ABCD has interior angles ∠A = 40°, ∠B = 50°, ∠C = 60°, and ∠D = 210°. Which of the following statements is mathematically true?',
    options: [
      'ABCD is a convex quadrilateral because all sides are straight segments.',
      'ABCD is a concave quadrilateral because one interior angle exceeds 180° and one diagonal lies outside the figure.',
      'ABCD is an impossible figure because the angles do not sum to 360°.',
      'ABCD is a regular parallelogram.',
    ],
    correctAnswer: 'ABCD is a concave quadrilateral because one interior angle exceeds 180° and one diagonal lies outside the figure.',
    hints: [
      'First check the angle sum: 40 + 50 + 60 + 210 = 360°. So it is a valid simple quadrilateral.',
      'Look at angle D: 210° is greater than 180° (a reflex angle).',
      'In a concave polygon, at least one interior angle is > 180° and the diagonal connecting adjacent vertices lies outside the shape.',
    ],
    workedSolution: [
      'Sum of angles = 40° + 50° + 60° + 210° = 360°. The shape is geometrically valid.',
      'Because ∠D = 210° > 180°, vertex D forms an inward indentation.',
      'Therefore, quadrilateral ABCD is concave, and diagonal BD falls outside the polygonal region.',
    ],
  },

  // ==========================================================================
  // Unit 2: Parallelogram Properties & Diagonals
  // ==========================================================================
  {
    id: 'quad-q4',
    title: 'Opposite Angles of a Parallelogram',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'parallelogram_properties',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.3',
    statement:
      'In parallelogram ABCD, angle ∠A = (3x - 10)° and opposite angle ∠C = (x + 30)°. Find the value of x in degrees.',
    diagramGivens: {
      quadrilateralType: 'parallelogram',
      points: {
        A: { x: -3, y: -1 },
        B: { x: 2, y: -1 },
        C: { x: 4, y: 2 },
        D: { x: -1, y: 2 },
      },
      knownValues: { '∠A': '3x - 10', '∠C': 'x + 30' },
    },
    correctAnswer: 20,
    acceptableTolerance: 0.1,
    hints: [
      'In any parallelogram, opposite angles are equal.',
      'Set ∠A = ∠C.',
      'Solve the linear equation: 3x - 10 = x + 30.',
    ],
    workedSolution: [
      'Theorem 12.3: In a parallelogram, opposite angles are equal (∠A = ∠C).',
      '3x - 10 = x + 30',
      '2x = 40 => x = 20',
      'Each opposite angle is 3(20) - 10 = 50°.',
    ],
  },
  {
    id: 'quad-q5',
    title: 'Adjacent Angles of a Parallelogram',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'parallelogram_properties',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.1',
    statement:
      'Two adjacent angles of a parallelogram ABCD are in the ratio 4 : 5. Find the measure of the smaller angle in degrees.',
    diagramGivens: {
      quadrilateralType: 'parallelogram',
      points: {
        A: { x: -4, y: -2 },
        B: { x: 2, y: -2 },
        C: { x: 4, y: 2 },
        D: { x: -2, y: 2 },
      },
      knownValues: { '∠A : ∠B': '4 : 5' },
    },
    correctAnswer: 80,
    acceptableTolerance: 0.1,
    unit: 'degrees',
    hints: [
      'Consecutive (adjacent) angles of a parallelogram are supplementary because they are interior angles on the same side of a transversal.',
      'Let the angles be 4x and 5x.',
      'Set 4x + 5x = 180°.',
    ],
    workedSolution: [
      'Since AD || BC and AB is a transversal: ∠A + ∠B = 180° (co-interior angles).',
      '4x + 5x = 180° => 9x = 180° => x = 20°.',
      'Smaller angle = 4x = 4 × 20° = 80°.',
      'Larger angle = 5x = 5 × 20° = 100°.',
    ],
  },
  {
    id: 'quad-q6',
    title: 'Diagonal Bisection in a Parallelogram',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'parallelogram_diagonals',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.4',
    statement:
      'The diagonals of parallelogram ABCD intersect at point O. If OA = 2x + 1 cm and OC = 11 cm, find the value of x in cm.',
    diagramGivens: {
      quadrilateralType: 'parallelogram',
      points: {
        A: { x: -4, y: -2 },
        B: { x: 2, y: -2 },
        C: { x: 4, y: 2 },
        D: { x: -2, y: 2 },
      },
      segments: [
        { pointA: 'A', pointB: 'C', style: 'dashed', label: 'AC' },
        { pointA: 'B', pointB: 'D', style: 'dashed', label: 'BD' },
      ],
      knownValues: { OA: '2x + 1', OC: '11 cm' },
    },
    correctAnswer: 5,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'Theorem 12.4: The diagonals of a parallelogram bisect each other.',
      'Intersection point O is the midpoint of diagonal AC, so OA = OC.',
      'Solve 2x + 1 = 11.',
    ],
    workedSolution: [
      'Since ABCD is a parallelogram, its diagonals bisect each other.',
      'Therefore, OA = OC.',
      '2x + 1 = 11',
      '2x = 10 => x = 5 cm.',
      'The entire diagonal AC = OA + OC = 11 + 11 = 22 cm.',
    ],
  },
  {
    id: 'quad-q7',
    title: 'Two-Column Proof: Diagonals Bisecting Implies Parallelogram',
    difficulty: 'challenge',
    questionType: 'proof_step',
    topicId: 'parallelogram_converses',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.7',
    statement:
      'Complete the deductive proof showing that if the diagonals of quadrilateral ABCD bisect each other at O, then ABCD is a parallelogram.',
    diagramGivens: {
      quadrilateralType: 'parallelogram',
      points: {
        A: { x: -3, y: -1.5 },
        B: { x: 2, y: -1.5 },
        C: { x: 3, y: 1.5 },
        D: { x: -2, y: 1.5 },
      },
      segments: [
        { pointA: 'A', pointB: 'C', style: 'dashed' },
        { pointA: 'B', pointB: 'D', style: 'dashed' },
      ],
    },
    correctAnswer: 'SAS Congruence Criterion',
    proofSteps: [
      {
        statement: 'In ΔAOB and ΔCOD, OA = OC and OB = OD',
        reason: 'Given (diagonals bisect each other at O)',
      },
      {
        statement: '∠AOB = ∠COD',
        reason: 'Vertically opposite angles are equal',
      },
      {
        statement: 'ΔAOB ≅ ΔCOD',
        reason: 'SAS Congruence Criterion',
        missingReasonOptions: [
          'SAS Congruence Criterion',
          'RHS Congruence Criterion',
          'SSS Congruence Criterion',
          'AAA Similarity',
        ],
        correctReasonIndex: 0,
      },
      {
        statement: '∠OAB = ∠OCD and AB = CD',
        reason: 'CPCTC (Corresponding parts of congruent triangles)',
      },
      {
        statement: 'AB || CD (Alternate interior angles ∠OAB = ∠OCD are equal)',
        reason: 'Converse of alternate interior angles theorem',
      },
      {
        statement: 'ABCD is a parallelogram',
        reason: 'A quadrilateral with one pair of opposite sides equal and parallel is a parallelogram',
      },
    ],
    hints: [
      'In ΔAOB and ΔCOD, we have two pairs of equal sides (OA = OC, OB = OD) and their included angle ∠AOB = ∠COD.',
      'Two sides and the included angle define the SAS congruence criterion.',
    ],
    workedSolution: [
      'OA = OC (given), OB = OD (given), and ∠AOB = ∠COD (vertically opposite angles).',
      'By the SAS congruence criterion, ΔAOB ≅ ΔCOD.',
      'By CPCTC, AB = CD and ∠OAB = ∠OCD.',
      'Equal alternate interior angles prove AB || CD.',
      'A quadrilateral with one pair of opposite sides equal and parallel is a parallelogram (Theorem 12.8).',
    ],
  },

  // ==========================================================================
  // Unit 3: Midpoint Theorem & Converse
  // ==========================================================================
  {
    id: 'quad-q8',
    title: 'Midpoint Segment Length',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'midpoint_theorem',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.9',
    statement:
      'In triangle ABC, D and E are the midpoints of sides AB and AC respectively. If base BC = 14.6 cm, find the length of segment DE in cm.',
    diagramGivens: {
      points: {
        A: { x: 0, y: 4 },
        B: { x: -4, y: -2 },
        C: { x: 4, y: -2 },
        D: { x: -2, y: 1 },
        E: { x: 2, y: 1 },
      },
      segments: [
        { pointA: 'A', pointB: 'B', style: 'solid' },
        { pointA: 'B', pointB: 'C', style: 'solid' },
        { pointA: 'C', pointB: 'A', style: 'solid' },
        { pointA: 'D', pointB: 'E', style: 'dashed', label: 'DE' },
      ],
      knownValues: { BC: '14.6 cm' },
    },
    correctAnswer: 7.3,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'Theorem 12.9 (The Midpoint Theorem): The segment joining the midpoints of two sides of a triangle is parallel to the third side and half of it.',
      'DE = 1/2 × BC.',
      'Compute: 14.6 / 2.',
    ],
    workedSolution: [
      'By the Midpoint Theorem: In ΔABC, since D is the midpoint of AB and E is the midpoint of AC, DE || BC and DE = 1/2 BC.',
      'DE = 14.6 / 2 = 7.3 cm.',
    ],
  },
  {
    id: 'quad-q9',
    title: 'Perimeter of the Medial Triangle',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'midpoint_theorem',
    ncertReference: 'NCERT Class 9 Chapter 12 — Midpoint Theorem Applications',
    statement:
      'The sides of triangle ABC are AB = 8 cm, BC = 10 cm, and CA = 12 cm. Points D, E, F are the midpoints of AB, BC, CA respectively. Find the perimeter of the medial triangle DEF in cm.',
    diagramGivens: {
      points: {
        A: { x: 0, y: 4 },
        B: { x: -5, y: -2 },
        C: { x: 5, y: -2 },
        D: { x: -2.5, y: 1 },
        E: { x: 0, y: -2 },
        F: { x: 2.5, y: 1 },
      },
      segments: [
        { pointA: 'D', pointB: 'E', style: 'dashed' },
        { pointA: 'E', pointB: 'F', style: 'dashed' },
        { pointA: 'F', pointB: 'D', style: 'dashed' },
      ],
      knownValues: { AB: '8 cm', BC: '10 cm', CA: '12 cm' },
    },
    correctAnswer: 15,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'By the Midpoint Theorem, each side of the medial triangle is half the length of the opposite original side.',
      'DE = 1/2 CA, EF = 1/2 AB, and FD = 1/2 BC.',
      'Perimeter(DEF) = 1/2 (AB + BC + CA).',
    ],
    workedSolution: [
      'By the Midpoint Theorem:',
      'DE = CA / 2 = 12 / 2 = 6 cm',
      'EF = AB / 2 = 8 / 2 = 4 cm',
      'FD = BC / 2 = 10 / 2 = 5 cm',
      'Perimeter(DEF) = 6 + 4 + 5 = 15 cm.',
      'Note: The perimeter of the medial triangle is always exactly half the perimeter of the original triangle (30 / 2 = 15 cm).',
    ],
  },
  {
    id: 'quad-q10',
    title: 'Converse of Midpoint Theorem Verification',
    difficulty: 'standard',
    questionType: 'multiple_choice',
    topicId: 'midpoint_theorem',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.10',
    statement:
      'In ΔABC, D is the midpoint of AB. A line drawn through D parallel to BC intersects AC at point E. If AC = 18 cm, what is the length of AE?',
    options: ['9 cm', '6 cm', '12 cm', '4.5 cm'],
    correctAnswer: '9 cm',
    hints: [
      'Apply Theorem 12.10 (Converse of Midpoint Theorem).',
      'The line through the midpoint of one side parallel to another side bisects the third side.',
      'Point E must be the midpoint of AC, so AE = AC / 2.',
    ],
    workedSolution: [
      'Theorem 12.10 (Converse of Midpoint Theorem): The line drawn through the midpoint of one side of a triangle parallel to another side bisects the third side.',
      'Here, D is the midpoint of AB and DE || BC.',
      'Therefore, E is the midpoint of AC.',
      'AE = AC / 2 = 18 / 2 = 9 cm.',
    ],
  },

  // ==========================================================================
  // Unit 4: Medians and Centroid
  // ==========================================================================
  {
    id: 'quad-q11',
    title: 'Centroid 2:1 Division of a Median',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'medians_centroid',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.11',
    statement:
      'In triangle ABC, G is the centroid and AD is the median to side BC. If the median AD has total length 18 cm, find the length of the segment AG from vertex to centroid in cm.',
    diagramGivens: {
      points: {
        A: { x: 0, y: 5 },
        B: { x: -4, y: -2 },
        C: { x: 4, y: -2 },
        D: { x: 0, y: -2 },
        G: { x: 0, y: 0.33 },
      },
      segments: [
        { pointA: 'A', pointB: 'D', style: 'dashed', label: 'AD' },
      ],
      knownValues: { AD: '18 cm' },
    },
    correctAnswer: 12,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'The centroid G divides each median in the ratio 2 : 1 from the vertex.',
      'AG : GD = 2 : 1, which means AG is 2/3 of the total median length AD.',
      'Compute: (2/3) × 18.',
    ],
    workedSolution: [
      'Theorem 12.11: The centroid of a triangle divides each median in the ratio 2:1 (AG : GD = 2 : 1).',
      'Total median AD = AG + GD = 2k + 1k = 3k.',
      '3k = 18 cm => k = 6 cm.',
      'AG = 2k = 2 × 6 = 12 cm.',
      'GD = 1k = 6 cm.',
    ],
  },
  {
    id: 'quad-q12',
    title: 'Finding Lower Median Segment GD',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'medians_centroid',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.11',
    statement:
      'In ΔPQR with centroid G, the segment from vertex P to centroid G is measured as PG = 9.4 cm. Find the length of the remaining median segment GD to the midpoint D in cm.',
    correctAnswer: 4.7,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'The centroid G divides the median PD such that PG = 2 × GD.',
      'GD = PG / 2.',
      'Calculate: 9.4 / 2.',
    ],
    workedSolution: [
      'By the Centroid Theorem, PG : GD = 2 : 1.',
      'GD = PG / 2 = 9.4 / 2 = 4.7 cm.',
      'The full median PD = 9.4 + 4.7 = 14.1 cm.',
    ],
  },

  // ==========================================================================
  // Unit 5: Varignon Parallelogram
  // ==========================================================================
  {
    id: 'quad-q13',
    title: 'Varignon Parallelogram Area Relationship',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'varignon',
    ncertReference: 'NCERT Class 9 Chapter 12 — Varignon Theorem',
    statement:
      'A convex quadrilateral ABCD has an area of 56 cm². Points P, Q, R, S are the midpoints of sides AB, BC, CD, DA respectively. Find the area of the Varignon parallelogram PQRS in cm².',
    diagramGivens: {
      quadrilateralType: 'general_convex',
      points: {
        A: { x: -3, y: -2 },
        B: { x: 3, y: -3 },
        C: { x: 4, y: 3 },
        D: { x: -2, y: 4 },
        P: { x: 0, y: -2.5 },
        Q: { x: 3.5, y: 0 },
        R: { x: 1, y: 3.5 },
        S: { x: -2.5, y: 1 },
      },
      knownValues: { 'Area(ABCD)': '56 cm²' },
    },
    correctAnswer: 28,
    acceptableTolerance: 0.1,
    unit: 'cm²',
    hints: [
      'Varignon’s Theorem: The quadrilateral formed by joining the midpoints of the sides of any simple quadrilateral is a parallelogram.',
      'Its area is always exactly half the area of the original quadrilateral.',
      'Area(PQRS) = 56 / 2.',
    ],
    workedSolution: [
      'By Varignon’s Theorem: The area of the parallelogram formed by joining the midpoints of any quadrilateral is exactly half of the quadrilateral’s area.',
      'Area(PQRS) = 1/2 × Area(ABCD)',
      'Area(PQRS) = 56 / 2 = 28 cm².',
    ],
  },
  {
    id: 'quad-q14',
    title: 'Varignon Perimeter and Diagonals',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'varignon',
    ncertReference: 'NCERT Class 9 Chapter 12 — Varignon Properties',
    statement:
      'Quadrilateral ABCD has diagonals AC = 16 cm and BD = 12 cm. Points P, Q, R, S are the midpoints of sides AB, BC, CD, DA. Find the perimeter of the Varignon parallelogram PQRS in cm.',
    correctAnswer: 28,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'By the Midpoint Theorem applied to ΔABC and ΔADC: PQ = RS = 1/2 AC.',
      'By the Midpoint Theorem applied to ΔABD and ΔCBD: SP = QR = 1/2 BD.',
      'Perimeter = 2(PQ + QR) = 2(1/2 AC + 1/2 BD) = AC + BD.',
    ],
    workedSolution: [
      'By the Midpoint Theorem:',
      'PQ = RS = AC / 2 = 16 / 2 = 8 cm',
      'QR = SP = BD / 2 = 12 / 2 = 6 cm',
      'Perimeter(PQRS) = PQ + QR + RS + SP = 8 + 6 + 8 + 6 = 28 cm.',
      'Notice that Perimeter(PQRS) is always exactly equal to the sum of the diagonals of ABCD: AC + BD = 16 + 12 = 28 cm!',
    ],
  },
  {
    id: 'quad-q15',
    title: 'Varignon Parallelogram of a Rectangle',
    difficulty: 'standard',
    questionType: 'multiple_choice',
    topicId: 'varignon',
    ncertReference: 'NCERT Class 9 Chapter 12 — Example 2',
    statement:
      'If ABCD is a rectangle, what special type of quadrilateral is formed by joining the midpoints of its four sides?',
    options: [
      'A Rhombus',
      'A Rectangle',
      'A Trapezium',
      'A General Parallelogram without equal sides',
    ],
    correctAnswer: 'A Rhombus',
    hints: [
      'In a rectangle, the diagonals are equal in length (AC = BD).',
      'The side lengths of the Varignon parallelogram are PQ = RS = AC/2 and QR = SP = BD/2.',
      'Since AC = BD, all four sides of PQRS are equal. A parallelogram with four equal sides is a rhombus!',
    ],
    workedSolution: [
      'In rectangle ABCD, diagonals are equal: AC = BD.',
      'By the Midpoint Theorem, the sides of the Varignon parallelogram PQRS are:',
      'PQ = RS = AC / 2',
      'QR = SP = BD / 2',
      'Since AC = BD, we have PQ = QR = RS = SP.',
      'A parallelogram with all four sides equal is, by definition, a Rhombus.',
    ],
  },

  // ==========================================================================
  // Unit 6: Tiling the Plane
  // ==========================================================================
  {
    id: 'quad-q16',
    title: 'Angles at a Shared Tessellation Vertex',
    difficulty: 'basic',
    questionType: 'numerical',
    topicId: 'tiling',
    ncertReference: 'NCERT Class 9 Chapter 12 — Tiling the Plane',
    statement:
      'When copies of a simple quadrilateral tile the Euclidean plane by 180° edge-rotations, how many individual tile vertices meet at every internal shared junction?',
    correctAnswer: 4,
    acceptableTolerance: 0,
    hints: [
      'A quadrilateral has 4 distinct interior angles: ∠A, ∠B, ∠C, and ∠D.',
      'Their sum is 360° (a full circle turn).',
      'How many angles must meet around a single point to fill 360° without gaps or overlaps?',
    ],
    workedSolution: [
      'Since the sum of the four interior angles of any quadrilateral is 360° (∠A + ∠B + ∠C + ∠D = 360°), exactly four tiles meet at every shared vertex—one presenting ∠A, one ∠B, one ∠C, and one ∠D.',
      'The sum of angles at each internal vertex is 360°, perfectly packing the plane without gaps or overlaps.',
      'Answer: 4.',
    ],
  },
  {
    id: 'quad-q17',
    title: 'Concave Quadrilateral Plane Tiling',
    difficulty: 'standard',
    questionType: 'multiple_choice',
    topicId: 'tiling',
    ncertReference: 'NCERT Class 9 Chapter 12 — Practical Geometry & Tiling',
    statement:
      'Can a concave simple quadrilateral (an arrow/dart shape with one reflex angle > 180°) tile the Euclidean plane without gaps or overlaps?',
    options: [
      'Yes, because any simple quadrilateral has interior angles summing to 360°, and 180° rotations about edge midpoints pair edges congruently.',
      'No, because only convex polygons can tile the plane.',
      'No, because reflex angles cause overlaps when rotated.',
      'Only if all four sides are equal.',
    ],
    correctAnswer:
      'Yes, because any simple quadrilateral has interior angles summing to 360°, and 180° rotations about edge midpoints pair edges congruently.',
    hints: [
      'Recall the topological theorem of monohedral quadrilateral tessellation.',
      'The 360° angle sum holds for concave simple quadrilaterals just as it does for convex ones.',
      'Rotating 180° around edge midpoints causes the reflex angle to interlock perfectly with the other three angles.',
    ],
    workedSolution: [
      'Any simple quadrilateral (both convex and concave) can tile the plane.',
      'Proof: The four interior angles sum to 360°. When two copies are joined along an edge via 180° rotation about its midpoint, adjacent edges are congruently matched, forming a fundamental 2-tile block that translates periodically across the plane.',
    ],
  },

  // ==========================================================================
  // Unit 7: Comprehensive Chapter Revision & Challenge Problems
  // ==========================================================================
  {
    id: 'quad-q18',
    title: 'Rhombus Diagonals and Side Length',
    difficulty: 'challenge',
    questionType: 'numerical',
    topicId: 'special_quadrilaterals',
    ncertReference: 'NCERT Class 9 Chapter 12 — Exercise 12.1',
    statement:
      'The diagonals of a rhombus ABCD are AC = 16 cm and BD = 12 cm. Find the length of each side of the rhombus in cm.',
    correctAnswer: 10,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'In a rhombus, diagonals bisect each other at right angles (90°).',
      'The intersection O forms four right-angled triangles ΔAOB, ΔBOC, ΔCOD, ΔDOA.',
      'In ΔAOB: OA = AC/2 = 8 cm, OB = BD/2 = 6 cm. Use the Pythagorean theorem: AB² = OA² + OB².',
    ],
    workedSolution: [
      'In a rhombus, diagonals are perpendicular bisectors of each other.',
      'OA = 16 / 2 = 8 cm',
      'OB = 12 / 2 = 6 cm',
      '∠AOB = 90°',
      'By Pythagoras in right ΔAOB: AB² = OA² + OB² = 8² + 6² = 64 + 36 = 100',
      'AB = √100 = 10 cm.',
      'Since all four sides of a rhombus are equal, each side is 10 cm.',
    ],
  },
  {
    id: 'quad-q19',
    title: 'Trapezium Midsegment Length',
    difficulty: 'standard',
    questionType: 'numerical',
    topicId: 'midpoint_theorem',
    ncertReference: 'NCERT Class 9 Chapter 12 — Exercise 12.2',
    statement:
      'In trapezium ABCD, AB is parallel to CD with AB = 15 cm and CD = 9 cm. E and F are the midpoints of the non-parallel sides AD and BC respectively. Find the length of midsegment EF in cm.',
    correctAnswer: 12,
    acceptableTolerance: 0.1,
    unit: 'cm',
    hints: [
      'Draw diagonal BD intersecting EF at point G.',
      'Apply the Midpoint Theorem to ΔABD: EG = 1/2 AB.',
      'Apply the Midpoint Theorem to ΔBCD: GF = 1/2 CD.',
      'EF = EG + GF = 1/2 (AB + CD).',
    ],
    workedSolution: [
      'Draw diagonal BD intersecting midsegment EF at G.',
      'In ΔABD, E is the midpoint of AD and EG || AB => EG = AB / 2 = 15 / 2 = 7.5 cm.',
      'In ΔBCD, F is the midpoint of BC and GF || CD => GF = CD / 2 = 9 / 2 = 4.5 cm.',
      'EF = EG + GF = 7.5 + 4.5 = 12 cm.',
      'General rule: The midsegment of a trapezium is parallel to the bases and its length is the arithmetic mean of the bases: (15 + 9) / 2 = 12 cm.',
    ],
  },
  {
    id: 'quad-q20',
    title: 'Square Varignon Parallelogram',
    difficulty: 'challenge',
    questionType: 'multiple_choice',
    topicId: 'varignon',
    ncertReference: 'NCERT Class 9 Chapter 12 — Section 12.7',
    statement:
      'If ABCD is a square, the quadrilateral formed by joining the midpoints of its four sides is:',
    options: [
      'A Square',
      'A non-square Rectangle',
      'A non-square Rhombus',
      'A general Parallelogram',
    ],
    correctAnswer: 'A Square',
    hints: [
      'A square is both a rectangle (equal diagonals) and a rhombus (perpendicular diagonals).',
      'Equal diagonals mean all 4 sides of the Varignon quad are equal (rhombus property).',
      'Perpendicular diagonals of ABCD mean the adjacent sides of the Varignon quad meet at 90° (rectangle property).',
      'A shape that is both a rhombus and a rectangle is a square!',
    ],
    workedSolution: [
      'In square ABCD, diagonals are equal (AC = BD) and perpendicular (AC ⊥ BD).',
      'Since AC = BD, the four sides of the Varignon parallelogram PQRS are equal (PQ = QR = RS = SP = AC/2).',
      'Since AC ⊥ BD, and PQ || AC while QR || BD, adjacent sides PQ and QR are perpendicular (∠PQR = 90°).',
      'A quadrilateral with four equal sides and four right angles is a Square.',
    ],
  },
];
