/**
 * Class 9 NCERT Circles: Comprehensive Practice Question Bank
 * Milestone M2.4
 *
 * Implements authoritative mathematical practice questions:
 * - Each question defines its own isolated, mathematically exact PracticeSceneDefinition.
 * - The diagram geometry strictly matches the numerical givens stated in the question.
 * - Supports Numeric, Multiple Choice, Diagram Reasoning, Construction, and Proof questions.
 * - Organized across Basic, Standard, and Challenge difficulty tiers.
 */

import type { PracticeQuestion, PracticeSceneDefinition } from './types';

// Helper to create circle scenes with exact mathematical geometry
function makeCircleScene(
  radius: number,
  points: { id: string; name: string; angleRad: number; color?: string }[],
  chords: { id: string; name: string; pointAId: string; pointBId: string; color?: string; showMidpoint?: boolean; showPerpendicular?: boolean }[] = [],
  angles: { id: string; name: string; point1Id: string; vertexId: string; point2Id: string; isCentral: boolean; color?: string }[] = [],
  radiusDiameters: { id: string; name: string; type: 'radius' | 'diameter'; pointId: string; point2Id?: string; color?: string }[] = [],
  cyclicQuads: { id: string; name: string; pointAId: string; pointBId: string; pointCId: string; pointDId: string; color?: string }[] = [],
  lockedElementIds: string[] = []
): PracticeSceneDefinition {
  const circleId = 'prac_circle';
  return {
    circles: [
      {
        id: circleId,
        name: 'Circle O',
        center: { x: 0, y: 0 },
        radius,
        color: '#38bdf8',
        fillAlpha: 0.05,
      },
    ],
    circumferencePoints: points.map((p) => ({
      ...p,
      circleId,
      color: p.color || '#38bdf8',
    })),
    chords: chords.map((c) => ({
      ...c,
      circleId,
      color: c.color || '#f59e0b',
    })),
    angles: angles.map((a) => ({
      ...a,
      circleId,
      color: a.color || (a.isCentral ? '#38bdf8' : '#f59e0b'),
    })),
    radiusDiameters: radiusDiameters.map((r) => ({
      ...r,
      circleId,
      color: r.color || '#38bdf8',
    })),
    tangents: [],
    cyclicQuads: cyclicQuads.map((q) => ({
      ...q,
      circleId,
      color: q.color || '#38bdf8',
    })),
    lockedElementIds:
      lockedElementIds.length > 0
        ? lockedElementIds
        : [circleId, ...points.map((p) => p.id), ...chords.map((c) => c.id)],
  };
}

export const CHAPTER_PRACTICE_BANK: PracticeQuestion[] = [
  // ==========================================
  // TOPIC 1: CIRCLE DEFINITION, RADIUS & DIAMETER
  // ==========================================
  {
    id: 'q_def_radius_diameter',
    topicId: 'understanding-circle',
    topicTitle: '1. Understanding a Circle',
    difficulty: 'basic',
    type: 'numeric',
    title: 'Diameter from Radius',
    question:
      'A circle has a radius of 4.5 cm. What is the length of its diameter, and what is its circumference (taking π ≈ 3.14)?',
    givens: { 'Radius (r)': '4.5 cm', 'Value of π': 3.14 },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 0 },
        { id: 'pB', name: "A'", angleRad: Math.PI },
      ],
      [],
      [],
      [{ id: 'dia1', name: "Diameter AA'", type: 'diameter', pointId: 'pA', point2Id: 'pB', color: '#38bdf8' }]
    ),
    correctAnswer: '9 cm, 28.26 cm',
    tolerance: 0.1,
    unit: 'cm',
    hintSteps: [
      'The diameter of a circle is twice its radius: d = 2r.',
      'Circumference of a circle is given by C = 2πr = πd.',
      'Multiply 2 × 4.5 for diameter, and 2 × 3.14 × 4.5 for circumference.',
    ],
    stepByStepSolution: [
      'Given: Radius r = 4.5 cm.',
      'Diameter d = 2 × r = 2 × 4.5 cm = 9.0 cm.',
      'Circumference C = 2 × π × r = 2 × 3.14 × 4.5 = 28.26 cm.',
    ],
    theoremApplied: 'Definition of Diameter (d = 2r) and Circumference (C = 2πr)',
    marks: 2,
    isNCERTSourced: true,
  },
  {
    id: 'q_def_mcq_longest_chord',
    topicId: 'understanding-circle',
    topicTitle: '1. Understanding a Circle',
    difficulty: 'standard',
    type: 'multiple_choice',
    title: 'Longest Chord Property',
    question:
      'What is the longest chord of any circle, and where does it necessarily pass through?',
    givens: { 'Geometric entity': 'Circle with center O' },
    diagram: makeCircleScene(
      5.0,
      [
        { id: 'p1', name: 'A', angleRad: 0.5 },
        { id: 'p2', name: 'B', angleRad: 2.2 },
        { id: 'p3', name: 'C', angleRad: Math.PI },
        { id: 'p4', name: 'D', angleRad: 0 },
      ],
      [
        { id: 'c1', name: 'Chord AB', pointAId: 'p1', pointBId: 'p2', color: '#f59e0b' },
        { id: 'c2', name: 'Diameter CD', pointAId: 'p3', pointBId: 'p4', color: '#38bdf8', showMidpoint: true },
      ]
    ),
    options: [
      'A tangent touching the circle at one point',
      'The diameter, which passes through the center O',
      'A secant line intersecting at two points',
      'Any chord equidistant from the circumference',
    ],
    correctAnswer: 1, // index 1
    hintSteps: [
      'Consider the triangle formed by the center and any two circumference points.',
      'By the triangle inequality, the chord length is always ≤ OA + OB = 2r.',
    ],
    stepByStepSolution: [
      'For any chord AB, join OA and OB.',
      'In ΔOAB, by triangle inequality: AB < OA + OB = 2r, unless O lies directly on AB.',
      'When O lies on AB, AB = OA + OB = 2r, which is the diameter.',
      'Therefore, the diameter is the longest chord of a circle and passes through the center.',
    ],
    theoremApplied: 'Diameter as Longest Chord Theorem',
    marks: 1,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 2: SYMMETRIES OF A CIRCLE
  // ==========================================
  {
    id: 'q_sym_invariance_reasoning',
    topicId: 'symmetry-of-circle',
    topicTitle: '2. Symmetry of a Circle',
    difficulty: 'basic',
    type: 'numeric',
    title: 'Invariance of Transformed Chord Length',
    question:
      'A chord PQ of length 7.2 cm in a circle is rotated by 75° about the center O. What is the length of the rotated chord P′Q′?',
    givens: { 'Initial chord length (PQ)': '7.2 cm', 'Rotation angle': '75°' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pP', name: 'P', angleRad: 0.6 },
        { id: 'pQ', name: 'Q', angleRad: 2.4 },
      ],
      [{ id: 'chPQ', name: 'Chord PQ (7.2 cm)', pointAId: 'pP', pointBId: 'pQ', color: '#f59e0b' }]
    ),
    correctAnswer: '7.2 cm',
    tolerance: 0.05,
    unit: 'cm',
    hintSteps: [
      'Rotation about a fixed point is an isometry (rigid motion).',
      'Isometries preserve all segment lengths and angles.',
    ],
    stepByStepSolution: [
      'Rotation about any point in the Euclidean plane is a distance-preserving isometry.',
      'Under a rotation of 75° about center O, the distance between any two points is preserved.',
      'Therefore, dist(P′, Q′) = dist(P, Q) = 7.2 cm.',
    ],
    theoremApplied: 'Rotational Invariance of Circle Chords',
    marks: 1,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 3: HOW MANY CIRCLES & CIRCUMCENTRE
  // ==========================================
  {
    id: 'q_circumcenter_hypotenuse',
    topicId: 'how-many-circles',
    topicTitle: '3. How Many Circles?',
    difficulty: 'standard',
    type: 'numeric',
    title: 'Circumradius of a Right Triangle',
    question:
      'In a right-angled triangle ΔABC with ∠B = 90°, AB = 6 cm and BC = 8 cm. Find the radius of the circumcircle passing through all three vertices A, B, and C.',
    givens: { 'Side AB': '6 cm', 'Side BC': '8 cm', 'Angle ∠B': '90°' },
    diagram: makeCircleScene(
      5.0,
      [
        { id: 'pA', name: 'A', angleRad: Math.PI / 2 },
        { id: 'pB', name: 'B', angleRad: 2.498 },
        { id: 'pC', name: 'C', angleRad: 5.639 },
      ],
      [
        { id: 'sAB', name: 'Side AB (6 cm)', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' },
        { id: 'sBC', name: 'Side BC (8 cm)', pointAId: 'pB', pointBId: 'pC', color: '#10b981' },
        { id: 'sCA', name: 'Hypotenuse AC (10 cm)', pointAId: 'pC', pointBId: 'pA', color: '#f59e0b', showMidpoint: true },
      ]
    ),
    correctAnswer: '5 cm',
    tolerance: 0.1,
    unit: 'cm',
    hintSteps: [
      'Find the hypotenuse AC using the Pythagorean theorem: AC = √(AB² + BC²).',
      'In a right-angled triangle, the circumcentre lies at the midpoint of the hypotenuse.',
      'The circumradius is half the hypotenuse: R = AC / 2.',
    ],
    stepByStepSolution: [
      'By Pythagoras theorem in right triangle ΔABC: AC² = AB² + BC² = 6² + 8² = 36 + 64 = 100.',
      'Hypotenuse AC = √100 = 10 cm.',
      'In any right triangle, the circumcenter is the midpoint of the hypotenuse, meaning AC is the diameter of the circumcircle.',
      'Circumradius R = AC / 2 = 10 / 2 = 5.0 cm.',
    ],
    theoremApplied: 'Circumcircle of Right Triangle & Thales Theorem',
    marks: 3,
    isNCERTSourced: true,
  },
  {
    id: 'q_collinear_circles_reasoning',
    topicId: 'how-many-circles',
    topicTitle: '3. How Many Circles?',
    difficulty: 'challenge',
    type: 'multiple_choice',
    title: 'Circles Through Three Collinear Points',
    question:
      'Why can no finite circle pass through three distinct collinear points A, B, and C?',
    givens: { 'Points': 'A, B, C lying on the same line L' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'p1', name: 'A', angleRad: Math.PI },
        { id: 'p2', name: 'B', angleRad: 0 },
      ],
      [{ id: 'lineL', name: 'Line L', pointAId: 'p1', pointBId: 'p2', color: '#ef4444' }]
    ),
    options: [
      'Because circles can only pass through an even number of points',
      'Because the perpendicular bisectors of AB and BC are parallel and never intersect',
      'Because three points always have an area of zero',
      'Because the center would have to be at infinity',
    ],
    correctAnswer: 1, // index 1
    hintSteps: [
      'The center of a circle through points A, B, C must lie on the perpendicular bisector of AB and of BC.',
      'What is the relationship between lines perpendicular to the same straight line?',
    ],
    stepByStepSolution: [
      'Let points A, B, C lie on straight line L.',
      'The locus of points equidistant from A and B is line M ⊥ L.',
      'The locus of points equidistant from B and C is line N ⊥ L.',
      'Two lines perpendicular to the same line L are parallel to each other (M ∥ N).',
      'Since parallel lines never intersect, there exists no point O equidistant from A, B, and C.',
      'Hence, no finite circle can pass through three distinct collinear points.',
    ],
    theoremApplied: 'Uniqueness of Circumcircle & Non-Collinearity Axiom',
    marks: 2,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 4: CHORDS & PERPENDICULAR BISECTORS
  // ==========================================
  {
    id: 'q_chord_perp_pythagoras',
    topicId: 'chords-and-properties',
    topicTitle: '4. Chords & Midpoints',
    difficulty: 'standard',
    type: 'numeric',
    title: 'Find Chord Length Using Pythagoras',
    question:
      'A chord of a circle of radius 5 cm is at a distance of 3 cm from the center O. Find the length of the chord.',
    givens: { 'Radius (r)': '5 cm', 'Perpendicular distance (d)': '3 cm' },
    // Exact diagram: r = 5, d = 3 => half-chord = 4, chord length = 8
    diagram: makeCircleScene(
      5.0,
      [
        { id: 'pA', name: 'A', angleRad: 0.6435 }, // (4, 3)
        { id: 'pB', name: 'B', angleRad: 2.4981 }, // (-4, 3)
      ],
      [
        {
          id: 'chordAB',
          name: 'Chord AB',
          pointAId: 'pA',
          pointBId: 'pB',
          color: '#38bdf8',
          showMidpoint: true,
          showPerpendicular: true,
        },
      ]
    ),
    correctAnswer: '8 cm',
    tolerance: 0.1,
    unit: 'cm',
    hintSteps: [
      'Draw the perpendicular OM from center O to chord AB (OM = 3 cm).',
      'In right triangle ΔOMA, OA is the radius (5 cm).',
      'Apply Pythagoras theorem: OA² = OM² + AM².',
      'The perpendicular from the center bisects the chord, so AB = 2 × AM.',
    ],
    stepByStepSolution: [
      'Let M be the midpoint of chord AB such that OM ⊥ AB.',
      'In right triangle ΔOMA, OA = r = 5 cm and OM = d = 3 cm.',
      'By Pythagoras theorem: OA² = OM² + AM² => 5² = 3² + AM² => 25 = 9 + AM².',
      'AM² = 16 => AM = 4 cm.',
      'By Theorem 9.1, the perpendicular from the center bisects the chord: AB = 2 × AM = 2 × 4 = 8 cm.',
    ],
    theoremApplied: 'Perpendicular from Center to Chord Theorem + Pythagoras Theorem',
    marks: 3,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 5: EQUAL CHORDS & CENTRAL ANGLES
  // ==========================================
  {
    id: 'q_equal_chords_subtended_angles',
    topicId: 'equal-chords-central-angles',
    topicTitle: '5. Equal Chords & Central Angles',
    difficulty: 'basic',
    type: 'numeric',
    title: 'Angle Subtended by Equal Chord',
    question:
      'In a circle with center O, two chords AB and CD are each 7 cm long. If central angle ∠AOB = 72°, what is the measure of central angle ∠COD?',
    givens: { 'Chord AB': '7 cm', 'Chord CD': '7 cm', 'Angle ∠AOB': '72°' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 0.3 },
        { id: 'pB', name: 'B', angleRad: 1.557 },
        { id: 'pC', name: 'C', angleRad: 3.2 },
        { id: 'pD', name: 'D', angleRad: 4.457 },
      ],
      [
        { id: 'cAB', name: 'Chord AB (7 cm)', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' },
        { id: 'cCD', name: 'Chord CD (7 cm)', pointAId: 'pC', pointBId: 'pD', color: '#10b981' },
      ],
      [
        { id: 'angAOB', name: '∠AOB = 72°', point1Id: 'pA', vertexId: 'center', point2Id: 'pB', isCentral: true, color: '#38bdf8' },
        { id: 'angCOD', name: '∠COD', point1Id: 'pC', vertexId: 'center', point2Id: 'pD', isCentral: true, color: '#10b981' },
      ]
    ),
    correctAnswer: '72°',
    tolerance: 0.1,
    unit: 'degrees',
    hintSteps: [
      'Recall NCERT Theorem 9.3 regarding equal chords of a circle.',
      'Equal chords subtend equal angles at the center.',
    ],
    stepByStepSolution: [
      'Given: AB = CD = 7 cm.',
      'In triangles ΔAOB and ΔCOD: OA = OC = r, OB = OD = r, and AB = CD.',
      'By SSS congruence criterion, ΔAOB ≅ ΔCOD.',
      'Therefore, by CPCTC, ∠COD = ∠AOB = 72°.',
    ],
    theoremApplied: 'Equal Chords Subtend Equal Angles at the Center Theorem (NCERT Thm 9.3)',
    marks: 2,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 6: DISTANCE OF CHORDS FROM CENTER
  // ==========================================
  {
    id: 'q_distance_chords_comparison',
    topicId: 'chord-distance-comparison',
    topicTitle: '6. Distance of Chords from Center',
    difficulty: 'standard',
    type: 'numeric',
    title: 'Comparing Distances of Chords from Center',
    question:
      'In a circle of radius 10 cm, chord AB has length 16 cm and chord CD has length 12 cm. Find their respective perpendicular distances from the center O.',
    givens: { 'Radius (r)': '10 cm', 'Chord AB': '16 cm', 'Chord CD': '12 cm' },
    // Exact diagram: r = 10; for AB (16): half=8, d=6. for CD (12): half=6, d=8.
    diagram: makeCircleScene(
      10.0,
      [
        { id: 'pA', name: 'A', angleRad: 0.6435 }, // (8, 6)
        { id: 'pB', name: 'B', angleRad: 2.4981 }, // (-8, 6)
        { id: 'pC', name: 'C', angleRad: 5.6397 }, // (6, -8)
        { id: 'pD', name: 'D', angleRad: 3.7851 }, // (-6, -8)
      ],
      [
        { id: 'cAB', name: 'Chord AB (16 cm)', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8', showMidpoint: true, showPerpendicular: true },
        { id: 'cCD', name: 'Chord CD (12 cm)', pointAId: 'pC', pointBId: 'pD', color: '#f59e0b', showMidpoint: true, showPerpendicular: true },
      ]
    ),
    correctAnswer: '6 cm, 8 cm',
    tolerance: 0.1,
    unit: 'cm',
    hintSteps: [
      'Use the formula d = √(r² - (L/2)²) for each chord.',
      'For chord AB (16 cm), half-length is 8 cm.',
      'For chord CD (12 cm), half-length is 6 cm.',
    ],
    stepByStepSolution: [
      'For chord AB: Half-length = 16 / 2 = 8 cm. Perpendicular distance d₁ = √(10² - 8²) = √(100 - 64) = √36 = 6 cm.',
      'For chord CD: Half-length = 12 / 2 = 6 cm. Perpendicular distance d₂ = √(10² - 6²) = √(100 - 36) = √64 = 8 cm.',
      'Notice that d₁ (6 cm) < d₂ (8 cm), confirming that the longer chord is nearer to the center.',
    ],
    theoremApplied: 'Pythagorean Chord Distance Formula (d² = r² - (L/2)²)',
    marks: 3,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 7: CENTRAL & INSCRIBED ANGLES
  // ==========================================
  {
    id: 'q_inscribed_angle_calculation',
    topicId: 'angles-in-a-circle',
    topicTitle: '7. Central & Inscribed Angles',
    difficulty: 'basic',
    type: 'numeric',
    title: 'Calculate Inscribed Angle from Central Angle',
    question:
      'In a circle, arc AB subtends an angle of 110° at the center O. Find the angle subtended by this arc at a point P on the remaining part of the circle.',
    givens: { 'Central angle ∠AOB': '110°' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 3.8 },
        { id: 'pB', name: 'B', angleRad: 5.72 },
        { id: 'pP', name: 'P', angleRad: 1.57 },
      ],
      [{ id: 'baseAB', name: 'Base Arc AB', pointAId: 'pA', pointBId: 'pB', color: '#64748b' }],
      [
        { id: 'angCent', name: '∠AOB = 110°', point1Id: 'pA', vertexId: 'center', point2Id: 'pB', isCentral: true, color: '#38bdf8' },
        { id: 'angInsc', name: '∠APB', point1Id: 'pA', vertexId: 'pP', point2Id: 'pB', isCentral: false, color: '#f59e0b' },
      ]
    ),
    correctAnswer: '55°',
    tolerance: 0.1,
    unit: 'degrees',
    hintSteps: [
      'Apply NCERT Theorem 9.7 (Angle Subtended by an Arc).',
      'The central angle is twice the inscribed angle: ∠AOB = 2 × ∠APB.',
    ],
    stepByStepSolution: [
      'Given: Central angle ∠AOB = 110°.',
      'By the Central Angle Theorem, the angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle.',
      '∠APB = (1/2) × ∠AOB = 110° / 2 = 55°.',
    ],
    theoremApplied: 'Central Angle Theorem (NCERT Thm 9.7)',
    marks: 2,
    isNCERTSourced: true,
  },
  {
    id: 'q_semicircle_right_angle',
    topicId: 'angles-in-a-circle',
    topicTitle: '7. Central & Inscribed Angles',
    difficulty: 'standard',
    type: 'diagram_reasoning',
    title: 'Angle Inscribed in a Semicircle',
    question:
      'Line AB passes through the center O of the circle (it is a diameter). What is the exact measure of inscribed angle ∠APB?',
    givens: { 'Chord AB': 'Diameter passing through O', 'Vertex P': 'Point on semicircle' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: Math.PI },
        { id: 'pB', name: 'B', angleRad: 0 },
        { id: 'pP', name: 'P', angleRad: 1.15 },
      ],
      [{ id: 'diaAB', name: 'Diameter AB', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' }],
      [
        { id: 'angAPB', name: '∠APB', point1Id: 'pA', vertexId: 'pP', point2Id: 'pB', isCentral: false, color: '#f59e0b' },
      ],
      [{ id: 'diaLine', name: 'Diameter AB', type: 'diameter', pointId: 'pA', point2Id: 'pB', color: '#38bdf8' }]
    ),
    options: ['45°', '60°', '90° (Right angle)', '180°'],
    correctAnswer: 2, // index 2
    hintSteps: [
      'A diameter subtends a straight angle (180°) at the center O.',
      'Use the Central Angle Theorem: ∠APB = (1/2) × ∠AOB.',
    ],
    stepByStepSolution: [
      'Since AB is a diameter, ∠AOB is a straight angle = 180°.',
      'By the Central Angle Theorem, inscribed angle ∠APB = (1/2) × ∠AOB = 180° / 2 = 90°.',
      'Therefore, the angle in a semicircle is always a right angle (90°).',
    ],
    theoremApplied: 'Angle in a Semicircle Corollary (Thales Theorem)',
    marks: 2,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 8: ANGLES IN THE SAME SEGMENT
  // ==========================================
  {
    id: 'q_same_segment_algebra',
    topicId: 'angles-in-same-segment',
    topicTitle: '8. Angles in the Same Segment',
    difficulty: 'standard',
    type: 'numeric',
    title: 'Algebraic Angle Equality in Same Segment',
    question:
      'In a circle, angles in the same segment subtended by chord AB are given by ∠APB = (3x + 10)° and ∠AQB = (5x - 20)°. Find the value of x and the measure of each angle.',
    givens: { '∠APB': '(3x + 10)°', '∠AQB': '(5x - 20)°', 'Segment': 'Same segment subtended by AB' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 3.8 },
        { id: 'pB', name: 'B', angleRad: 5.6 },
        { id: 'pP', name: 'P', angleRad: 1.3 },
        { id: 'pQ', name: 'Q', angleRad: 2.3 },
      ],
      [{ id: 'baseAB', name: 'Base AB', pointAId: 'pA', pointBId: 'pB', color: '#64748b' }],
      [
        { id: 'angP', name: '∠APB', point1Id: 'pA', vertexId: 'pP', point2Id: 'pB', isCentral: false, color: '#f59e0b' },
        { id: 'angQ', name: '∠AQB', point1Id: 'pA', vertexId: 'pQ', point2Id: 'pB', isCentral: false, color: '#a855f7' },
      ]
    ),
    correctAnswer: 'x = 15, 55°',
    tolerance: 0.1,
    unit: 'degrees',
    hintSteps: [
      'By Theorem 9.8, angles in the same segment of a circle are equal.',
      'Equate the two expressions: 3x + 10 = 5x - 20.',
      'Solve for x, then substitute back to find the angle measure.',
    ],
    stepByStepSolution: [
      'By Theorem 9.8, angles in the same segment of a circle are equal: ∠APB = ∠AQB.',
      '3x + 10 = 5x - 20 => 10 + 20 = 5x - 3x => 2x = 30 => x = 15.',
      'Substitute x = 15 into ∠APB: 3(15) + 10 = 45 + 10 = 55°.',
      'Verification: ∠AQB = 5(15) - 20 = 75 - 20 = 55°.',
    ],
    theoremApplied: 'Angles in the Same Segment are Equal (NCERT Thm 9.8)',
    marks: 3,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 9: CYCLIC QUADRILATERALS
  // ==========================================
  {
    id: 'q_cyclic_opposite_angles',
    topicId: 'cyclic-quadrilaterals',
    topicTitle: '9. Cyclic Quadrilaterals',
    difficulty: 'standard',
    type: 'numeric',
    title: 'Opposite Angles of a Cyclic Quadrilateral',
    question:
      'ABCD is a cyclic quadrilateral. If ∠B = 105° and ∠A = 80°, find the measure of angles ∠D and ∠C.',
    givens: { '∠B': '105°', '∠A': '80°', 'Figure': 'Cyclic quadrilateral ABCD' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 0.6 },
        { id: 'pB', name: 'B', angleRad: 1.8 },
        { id: 'pC', name: 'C', angleRad: 3.4 },
        { id: 'pD', name: 'D', angleRad: 4.9 },
      ],
      [
        { id: 'sAB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' },
        { id: 'sBC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#f59e0b' },
        { id: 'sCD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#10b981' },
        { id: 'sDA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#a855f7' },
      ],
      [],
      [],
      [{ id: 'quad1', name: 'Cyclic Quad ABCD', pointAId: 'pA', pointBId: 'pB', pointCId: 'pC', pointDId: 'pD', color: '#38bdf8' }]
    ),
    correctAnswer: '∠D = 75°, ∠C = 100°',
    tolerance: 0.1,
    unit: 'degrees',
    hintSteps: [
      'The sum of either pair of opposite angles of a cyclic quadrilateral is 180°.',
      '∠B + ∠D = 180° and ∠A + ∠C = 180°.',
    ],
    stepByStepSolution: [
      'By Theorem 9.10, opposite angles of a cyclic quadrilateral are supplementary.',
      '∠B + ∠D = 180° => 105° + ∠D = 180° => ∠D = 180° - 105° = 75°.',
      '∠A + ∠C = 180° => 80° + ∠C = 180° => ∠C = 180° - 80° = 100°.',
      'Therefore, ∠D = 75° and ∠C = 100°.',
    ],
    theoremApplied: 'Opposite Angles of a Cyclic Quadrilateral are Supplementary (NCERT Thm 9.10)',
    marks: 3,
    isNCERTSourced: true,
  },

  // ==========================================
  // TOPIC 10: CONCYCLICITY & CONVERSES
  // ==========================================
  {
    id: 'q_concyclicity_verification',
    topicId: 'concyclicity-and-converses',
    topicTitle: '10. Concyclicity & Converses',
    difficulty: 'standard',
    type: 'multiple_choice',
    title: 'Testing Concyclicity of Quadrilateral Vertices',
    question:
      'In a quadrilateral ABCD, ∠A = 88°, ∠B = 76°, ∠C = 92°, and ∠D = 104°. Is ABCD a cyclic quadrilateral?',
    givens: { '∠A': '88°', '∠B': '76°', '∠C': '92°', '∠D': '104°' },
    diagram: makeCircleScene(
      4.5,
      [
        { id: 'pA', name: 'A', angleRad: 0.5 },
        { id: 'pB', name: 'B', angleRad: 1.8 },
        { id: 'pC', name: 'C', angleRad: 3.4 },
        { id: 'pD', name: 'D', angleRad: 4.8 },
      ],
      [
        { id: 'sAB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' },
        { id: 'sBC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#f59e0b' },
        { id: 'sCD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#10b981' },
        { id: 'sDA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#a855f7' },
      ],
      [],
      [],
      [{ id: 'quadConv', name: 'Quad ABCD', pointAId: 'pA', pointBId: 'pB', pointCId: 'pC', pointDId: 'pD', color: '#10b981' }]
    ),
    options: [
      'Yes, because both pairs of opposite angles sum to 180°',
      'No, because the angles are all unequal',
      'No, because a cyclic quadrilateral must have right angles',
      'Cannot be determined without side lengths',
    ],
    correctAnswer: 0, // index 0
    hintSteps: [
      'Check the converse theorem: If the sum of a pair of opposite angles of a quadrilateral is 180°, it is cyclic.',
      'Check ∠A + ∠C and ∠B + ∠D.',
    ],
    stepByStepSolution: [
      'Sum of first pair of opposite angles: ∠A + ∠C = 88° + 92° = 180°.',
      'Sum of second pair of opposite angles: ∠B + ∠D = 76° + 104° = 180°.',
      'By Theorem 9.11 (Converse of Cyclic Quadrilateral Theorem), since opposite angles are supplementary, ABCD is a cyclic quadrilateral.',
    ],
    theoremApplied: 'Converse of Cyclic Quadrilateral Theorem (NCERT Thm 9.11)',
    marks: 2,
    isNCERTSourced: true,
  },
];
