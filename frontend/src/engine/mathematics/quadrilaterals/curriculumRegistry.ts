/**
 * NCERT Class 9 Mathematics: Ganita Manjari Part II
 * Chapter 12: Quadrilaterals
 *
 * Curriculum Coverage Matrix & Registry
 * Documents exact NCERT sections, definitions, theorems, converses,
 * activities, and learning outcomes across the LabVerse Quadrilaterals Laboratory.
 */

export interface CurriculumTopic {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  topicTitle: string;
  ncertReference: string;
  statement: string;
  converseStatement?: string;
  category:
    | 'understanding'
    | 'parallelograms'
    | 'midpoint_theorem'
    | 'medians_centroid'
    | 'varignon'
    | 'tiling'
    | 'revision';
  status: 'fully_implemented' | 'partially_implemented' | 'optional_extension';
  experimentId: string;
  lessonId: string;
  learningOutcomes: string[];
  testSuite: string;
}

export const NCERT_QUADRILATERALS_CURRICULUM_REGISTRY: CurriculumTopic[] = [
  // --------------------------------------------------------------------------
  // Unit 1: Understanding Quadrilaterals
  // --------------------------------------------------------------------------
  {
    id: 'ncert_quad_def_anatomy',
    sectionNumber: 'Section 12.1',
    sectionTitle: 'Introduction & Anatomy of a Quadrilateral',
    topicTitle: 'Definition, Vertices, Sides, Diagonals & Convexity',
    ncertReference: 'NCERT Class 9 Chapter 12 — Section 12.1: Quadrilaterals',
    statement:
      'A plane figure bounded by four non-collinear line segments is a quadrilateral. It possesses four vertices, four sides, four interior angles, and two diagonals connecting opposite vertices.',
    category: 'understanding',
    status: 'fully_implemented',
    experimentId: 'what-is-a-quadrilateral',
    lessonId: 'quad-l1',
    learningOutcomes: [
      'Distinguish adjacent sides (sharing a vertex) from opposite sides (disjoint)',
      'Identify adjacent angles from opposite angles',
      'Understand the geometric distinction between convex quadrilaterals (diagonals interior, interior angles < 180°) and concave quadrilaterals (one reflex interior angle > 180°, one diagonal exterior)',
      'Recognize and prevent crossed/self-intersecting configurations',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralStore.test.ts',
  },
  {
    id: 'ncert_quad_angle_sum',
    sectionNumber: 'Section 12.2',
    sectionTitle: 'Angle Sum Property of a Quadrilateral',
    topicTitle: 'Sum of the Angles of a Quadrilateral is 360°',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.0 (Angle Sum)',
    statement:
      'The sum of the four interior angles of a simple quadrilateral is 360° (∠A + ∠B + ∠C + ∠D = 360°).',
    category: 'understanding',
    status: 'fully_implemented',
    experimentId: 'what-is-a-quadrilateral',
    lessonId: 'quad-l1',
    learningOutcomes: [
      'Construct a diagonal AC dividing quadrilateral ABCD into two triangles ΔABC and ΔADC',
      'Sum triangle angles (180° + 180° = 360°) to formally deduce the 360° theorem',
      'Verify that the 360° sum holds invariant across both convex and concave simple quadrilaterals',
    ],
    testSuite: 'quadrilateralGeometry.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 2: Parallelograms
  // --------------------------------------------------------------------------
  {
    id: 'ncert_parallelogram_properties',
    sectionNumber: 'Section 12.3',
    sectionTitle: 'Properties of a Parallelogram',
    topicTitle: 'Opposite Sides, Opposite Angles & Supplementary Consecutive Angles',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorems 12.1, 12.2, 12.3',
    statement:
      'In a parallelogram: (1) A diagonal divides it into two congruent triangles (ΔABC ≅ ΔCDA); (2) Opposite sides are equal (AB = CD, BC = DA); (3) Opposite angles are equal (∠A = ∠C, ∠B = ∠D); (4) Adjacent consecutive angles are supplementary (∠A + ∠B = 180°).',
    category: 'parallelograms',
    status: 'fully_implemented',
    experimentId: 'parallelogram-properties',
    lessonId: 'quad-l2',
    learningOutcomes: [
      'Prove congruence of triangles ΔABC and ΔCDA using alternate interior angles and shared diagonal',
      'Deduce CPCTC equality of opposite sides and opposite angles',
      'Observe parallel transversal laws establishing supplementary adjacent angles',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralTheorems.test.ts',
  },
  {
    id: 'ncert_parallelogram_diagonals',
    sectionNumber: 'Section 12.3',
    sectionTitle: 'Diagonals of a Parallelogram',
    topicTitle: 'Mutual Bisection of Diagonals',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.4',
    statement:
      'The diagonals of a parallelogram bisect each other (OA = OC, OB = OD where O is the diagonal intersection point).',
    category: 'parallelograms',
    status: 'fully_implemented',
    experimentId: 'parallelogram-diagonals',
    lessonId: 'quad-l3',
    learningOutcomes: [
      'Locate diagonal intersection point O',
      'Prove ΔAOB ≅ ΔCOD by ASA criterion using alternate interior angles and AB = CD',
      'Conclude AO = OC and BO = OD by CPCTC',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralTheorems.test.ts',
  },
  {
    id: 'ncert_parallelogram_converses',
    sectionNumber: 'Section 12.4',
    sectionTitle: 'Conditions for a Quadrilateral to be a Parallelogram',
    topicTitle: 'Converse Theorems & Sufficient Conditions',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorems 12.5, 12.6, 12.7, 12.8',
    statement:
      'A quadrilateral is a parallelogram if any ONE of the following holds: (1) Both pairs of opposite sides are equal; (2) Both pairs of opposite angles are equal; (3) The diagonals bisect each other; (4) One pair of opposite sides is equal AND parallel.',
    converseStatement:
      'If opposite sides are equal, OR opposite angles are equal, OR diagonals bisect each other, OR one pair of opposite sides is equal and parallel, then the quadrilateral is guaranteed to be a parallelogram.',
    category: 'parallelograms',
    status: 'fully_implemented',
    experimentId: 'parallelogram-converses',
    lessonId: 'quad-l4',
    learningOutcomes: [
      'Differentiate necessary conditions from sufficient conditions',
      'Explore counterexamples when only ONE pair of opposite sides is equal (e.g. isosceles trapezium)',
      'Demonstrate why one pair equal and parallel suffices via SSS/SAS triangle congruence',
    ],
    testSuite: 'quadrilateralTheorems.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 3: The Midpoint Theorem
  // --------------------------------------------------------------------------
  {
    id: 'ncert_triangle_midpoints_intro',
    sectionNumber: 'Section 12.5',
    sectionTitle: 'Triangle Midpoints & Medial Triangle',
    topicTitle: 'Constructing and Inspecting Side Midpoints',
    ncertReference: 'NCERT Class 9 Chapter 12 — Activity 12.1',
    statement:
      'Every triangle has three distinct side midpoints. Joining these midpoints partitions the triangle into four smaller congruent triangles.',
    category: 'midpoint_theorem',
    status: 'fully_implemented',
    experimentId: 'triangle-midpoints',
    lessonId: 'quad-l5',
    learningOutcomes: [
      'Construct midpoints of triangle sides AB, BC, CA',
      'Observe the medial triangle formed by connecting midpoints',
      'Examine perimeter and area relations between medial and original triangle',
    ],
    testSuite: 'quadrilateralGeometry.test.ts',
  },
  {
    id: 'ncert_midpoint_theorem',
    sectionNumber: 'Section 12.5',
    sectionTitle: 'The Midpoint Theorem',
    topicTitle: 'Midpoint Segment Parallelism and Half-Length Law',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.9 (Classic 8.9)',
    statement:
      'The line segment joining the midpoints of two sides of a triangle is parallel to the third side and is equal to half of it (in ΔABC, if D and E are midpoints of AB and AC, then DE || BC and DE = 1/2 BC).',
    category: 'midpoint_theorem',
    status: 'fully_implemented',
    experimentId: 'midpoint-theorem',
    lessonId: 'quad-l6',
    learningOutcomes: [
      'Perform Euclidean extension: extend DE to F such that DE = EF, join CF',
      'Prove ΔADE ≅ ΔCFE by SAS criterion',
      'Show quadrilateral BCFE is a parallelogram, thereby proving DE || BC and DE = 1/2 BC',
      'Interact dynamically with triangle vertices and verify DE = 0.5 * BC continuously',
    ],
    testSuite: 'quadrilateralTheorems.test.ts, quadrilateralGeometry.test.ts',
  },
  {
    id: 'ncert_converse_midpoint_theorem',
    sectionNumber: 'Section 12.5',
    sectionTitle: 'Converse of the Midpoint Theorem',
    topicTitle: 'Ray Through Midpoint Parallel to Base Bisects Third Side',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.10 (Classic 8.10)',
    statement:
      'The line drawn through the midpoint of one side of a triangle, parallel to another side, bisects the third side.',
    converseStatement:
      'In ΔABC, if D is the midpoint of AB and a line is drawn through D parallel to BC meeting AC at E, then E is the midpoint of AC (AE = EC).',
    category: 'midpoint_theorem',
    status: 'fully_implemented',
    experimentId: 'converse-midpoint-theorem',
    lessonId: 'quad-l7',
    learningOutcomes: [
      'Verify converse theorem using constrained geometry where parallel ray locks to opposite side',
      'Deduce uniqueness of midpoint intersection E on AC',
      'Apply to trapeziums and parallel transversals',
    ],
    testSuite: 'quadrilateralTheorems.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 4: Medians and Centroid
  // --------------------------------------------------------------------------
  {
    id: 'ncert_triangle_medians',
    sectionNumber: 'Section 12.6',
    sectionTitle: 'Medians of a Triangle',
    topicTitle: 'Concurrency of the Three Medians',
    ncertReference: 'NCERT Class 9 Chapter 12 — Section 12.6: Medians & Concurrency',
    statement:
      'A median of a triangle is a line segment joining a vertex to the midpoint of the opposite side. The three medians of any triangle are always concurrent at a single point called the centroid (G).',
    category: 'medians_centroid',
    status: 'fully_implemented',
    experimentId: 'triangle-medians',
    lessonId: 'quad-l8',
    learningOutcomes: [
      'Construct medians AD, BE, CF for any triangle ABC',
      'Observe that all three medians invariably intersect at point G',
      'Verify that the centroid G always lies in the strict interior of any non-degenerate triangle',
    ],
    testSuite: 'quadrilateralGeometry.test.ts',
  },
  {
    id: 'ncert_centroid_theorem',
    sectionNumber: 'Section 12.6',
    sectionTitle: 'The Centroid Theorem',
    topicTitle: 'Centroid Divides Each Median in the 2:1 Ratio',
    ncertReference: 'NCERT Class 9 Chapter 12 — Theorem 12.11: Centroid Ratio',
    statement:
      'The centroid of a triangle divides each median in the ratio 2:1, with the longer segment adjacent to the vertex (AG : GD = 2:1, BG : GE = 2:1, CG : GF = 2:1).',
    category: 'medians_centroid',
    status: 'fully_implemented',
    experimentId: 'centroid-theorem',
    lessonId: 'quad-l9',
    learningOutcomes: [
      'Prove the 2:1 ratio by connecting midpoints D and E, applying Midpoint Theorem to show DE || AB and DE = 1/2 AB, and establishing similarity ΔGDE ~ ΔGAB with scale factor 1/2',
      'Measure dynamic distances AG, GD, BG, GE, CG, GF and verify the exact 2.00 ratio under all vertex manipulations',
      'Handle degenerate collinear triangles with graceful visual warning',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralTheorems.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 5: Varignon Parallelogram
  // --------------------------------------------------------------------------
  {
    id: 'ncert_varignon_parallelogram',
    sectionNumber: 'Section 12.7',
    sectionTitle: 'Varignon Parallelogram Theorem',
    topicTitle: 'Midpoints of Any Quadrilateral Form a Parallelogram',
    ncertReference: 'NCERT Class 9 Chapter 12 — Example 1 / Varignon Theorem',
    statement:
      'For any simple planar quadrilateral ABCD (whether convex or concave), the quadrilateral formed by connecting the midpoints of its four sides in order is always a parallelogram. Furthermore, its area is exactly half the area of the original quadrilateral.',
    category: 'varignon',
    status: 'fully_implemented',
    experimentId: 'varignon-parallelogram',
    lessonId: 'quad-l10',
    learningOutcomes: [
      'Construct midpoints P, Q, R, S of sides AB, BC, CD, DA of any quadrilateral ABCD',
      'Draw diagonal AC. Apply Midpoint Theorem to ΔABC (PQ || AC, PQ = 1/2 AC) and ΔADC (SR || AC, SR = 1/2 AC)',
      'Deduce that PQ || SR and PQ = SR, guaranteeing that PQRS is a parallelogram',
      'Explore special cases: When ABCD is a rectangle, PQRS is a rhombus; when ABCD is a rhombus, PQRS is a rectangle; when ABCD is a square, PQRS is a square',
      'Verify area ratio Area(PQRS) = 0.50 * Area(ABCD) across continuous drag manipulations',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralTheorems.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 6: Tiling the Plane
  // --------------------------------------------------------------------------
  {
    id: 'ncert_quadrilateral_tiling',
    sectionNumber: 'Section 12.8',
    sectionTitle: 'Quadrilateral Tiling of the Plane',
    topicTitle: 'Monohedral Tessellation via 180° Rotations & Translations',
    ncertReference: 'NCERT Class 9 Chapter 12 — Enrichment & Practical Geometry: Tiling the Plane',
    statement:
      'Any simple planar quadrilateral (convex or concave) can tile the Euclidean plane without gaps or overlaps. Because the four interior angles sum to 360°, rotating copies by 180° about edge midpoints causes all four angles to meet at every shared vertex (∠A + ∠B + ∠C + ∠D = 360°), forming a periodic tessellation.',
    category: 'tiling',
    status: 'fully_implemented',
    experimentId: 'quadrilateral-tiling',
    lessonId: 'quad-l11',
    learningOutcomes: [
      'Understand how 180° rotation about edge midpoints matches congruent edges',
      'Verify that at every internal vertex of the tessellation, exactly four tiles meet with angles A, B, C, D summing to 360°',
      'Dynamically deform the base quadrilateral vertices and watch the entire plane tiling reshape in real time with zero gaps or overlaps',
      'Explore both convex and concave tiling patterns',
    ],
    testSuite: 'quadrilateralGeometry.test.ts, quadrilateralStore.test.ts',
  },

  // --------------------------------------------------------------------------
  // Unit 7: Revision & Chapter Practice
  // --------------------------------------------------------------------------
  {
    id: 'ncert_revision_theorems',
    sectionNumber: 'Section 12.9',
    sectionTitle: 'Euclidean Synthesis & Theorem Investigation',
    topicTitle: 'Deductive Proof Navigation & Multi-Theorem Synthesis',
    ncertReference: 'NCERT Class 9 Chapter 12 — Summary & Proof Bank',
    statement:
      'Integrate all key theorems: Angle sum property, parallelogram invariants, converses, Midpoint Theorem, Centroid 2:1 division, Varignon parallelogram, and tessellation.',
    category: 'revision',
    status: 'fully_implemented',
    experimentId: 'theorem-investigation',
    lessonId: 'quad-l12',
    learningOutcomes: [
      'Construct multi-step geometric arguments',
      'Select missing reasons in formal two-column Euclidean proofs',
      'Master converse reasoning and counterexample identification',
    ],
    testSuite: 'quadrilateralTheorems.test.ts',
  },
  {
    id: 'ncert_chapter_practice_revision',
    sectionNumber: 'Section 12.10',
    sectionTitle: 'Comprehensive Chapter Practice & Examination Questions',
    topicTitle: 'Basic, Standard and Challenge Practice Problem Bank',
    ncertReference: 'NCERT Class 9 Chapter 12 — Exercises 12.1, 12.2 & Chapter Review',
    statement:
      'Practice question bank containing numerical computations, multiple choice questions, diagram reasoning, and formal geometric proofs covering the entirety of Chapter 12.',
    category: 'revision',
    status: 'fully_implemented',
    experimentId: 'chapter-practice-workbench',
    lessonId: 'quad-l13',
    learningOutcomes: [
      'Solve missing angle and side length problems in parallelograms and special quadrilaterals',
      'Calculate segments using Midpoint Theorem and Centroid 2:1 division',
      'Compute Varignon areas and analyze plane tiling configurations',
    ],
    testSuite: 'quadrilateralPracticeBank.test.ts',
  },
];
