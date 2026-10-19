/**
 * Authoritative Interactive Experiments Catalog for Class 9 Quadrilaterals
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements 14 complete geometric experiments for:
 * - Free Laboratory exploration
 * - Guided Curriculum backing (Canonical experiment per lesson)
 * - Dynamic constraints, mathematical predicates and practice integration
 */

import type { QuadrilateralExperiment } from './types';
import { CHAPTER_PRACTICE_BANK } from './practiceBank';

export const QUADRILATERAL_EXPERIMENTS: QuadrilateralExperiment[] = [
  // ==========================================================================
  // Unit 1: Understanding Quadrilaterals
  // ==========================================================================
  {
    id: 'what-is-a-quadrilateral',
    title: 'Anatomy of a Quadrilateral & Angle Sum',
    subtitle: 'Vertices, Sides, Diagonals, Convexity & the 360° Invariant',
    curriculumCategory: 'understanding',
    curriculumClassification: 'direct_chapter',
    description:
      'Explore vertices, adjacent and opposite sides, interior angles, and diagonals. Transform the figure between convex and concave configurations and discover why the interior angles always sum to 360°.',
    learningGoals: [
      'Identify adjacent sides, opposite sides, and diagonals',
      'Distinguish convex quadrilaterals (angles < 180°, diagonals interior) from concave ones (one reflex angle > 180°, diagonal exterior)',
      'Verify that diagonal AC divides the quadrilateral into two triangles whose angles sum to 180° + 180° = 360°',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -4, y: -2, role: 'free', color: '#38bdf8' },
        { id: 'pB', name: 'B', x: 3, y: -3, role: 'free', color: '#38bdf8' },
        { id: 'pC', name: 'C', x: 4, y: 2.5, role: 'free', color: '#38bdf8' },
        { id: 'pD', name: 'D', x: -2, y: 3.5, role: 'free', color: '#38bdf8' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#38bdf8' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#38bdf8' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#38bdf8' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#38bdf8' },
        { id: 'diag_AC', name: 'AC', pointAId: 'pA', pointBId: 'pC', isDiagonal: true, lineStyle: 'dashed', color: '#f59e0b' },
        { id: 'diag_BD', name: 'BD', pointAId: 'pB', pointBId: 'pD', isDiagonal: true, lineStyle: 'dashed', color: '#f59e0b' },
      ],
      quadrilaterals: [
        {
          id: 'quad_main',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#38bdf8',
          fillAlpha: 0.12,
          showDiagonals: true,
          showAngles: true,
        },
      ],
      triangles: [],
      angles: [
        { id: 'ang_A', name: '∠A', point1Id: 'pD', vertexId: 'pA', point2Id: 'pB', color: '#38bdf8' },
        { id: 'ang_B', name: '∠B', point1Id: 'pA', vertexId: 'pB', point2Id: 'pC', color: '#38bdf8' },
        { id: 'ang_C', name: '∠C', point1Id: 'pB', vertexId: 'pC', point2Id: 'pD', color: '#38bdf8' },
        { id: 'ang_D', name: '∠D', point1Id: 'pC', vertexId: 'pD', point2Id: 'pA', color: '#38bdf8' },
      ],
    },
    theorems: [
      {
        id: 'thm_angle_sum',
        title: 'Angle Sum Property of a Quadrilateral',
        statement: 'The sum of the four interior angles of a simple quadrilateral is 360°.',
        ncertReference: 'Chapter 12, Section 12.2 (the angle sum is used in the proof of Theorem 3)',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'angle_sum' || q.topicId === 'anatomy'),
  },

  // ==========================================================================
  // Unit 2: Parallelograms
  // ==========================================================================
  {
    id: 'parallelogram-properties',
    title: 'Properties of a Parallelogram',
    subtitle: 'Opposite Sides, Opposite Angles & Congruent Triangles',
    curriculumCategory: 'parallelograms',
    curriculumClassification: 'direct_chapter',
    description:
      'Investigate why a diagonal divides a parallelogram into two congruent triangles. Observe that opposite sides are strictly equal, opposite angles are equal, and adjacent consecutive angles are supplementary.',
    learningGoals: [
      'Verify ΔABC ≅ ΔCDA using alternate interior angles and shared diagonal AC',
      'Demonstrate that AB = CD and BC = DA by CPCTC',
      'Verify that adjacent angles sum to 180° (co-interior angles)',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -4, y: -2, role: 'free', color: '#10b981' },
        { id: 'pB', name: 'B', x: 2, y: -2, role: 'free', color: '#10b981' },
        { id: 'pC', name: 'C', x: 4, y: 2, role: 'free', color: '#10b981' },
        { id: 'pD', name: 'D', x: -2, y: 2, role: 'derived', color: '#10b981' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#10b981', showLength: true },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#10b981', showLength: true },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#10b981', showLength: true },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#10b981', showLength: true },
        { id: 'diag_AC', name: 'AC', pointAId: 'pA', pointBId: 'pC', isDiagonal: true, lineStyle: 'dashed', color: '#f59e0b' },
      ],
      quadrilaterals: [
        {
          id: 'quad_para',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#10b981',
          fillAlpha: 0.15,
          showAngles: true,
        },
      ],
      triangles: [],
      constraints: [
        {
          id: 'c_para',
          type: 'parallel_opposite',
          targetEntityIds: ['pA', 'pB', 'pC', 'pD'],
          active: true,
          description: 'Opposite sides parallel: D = A + (C - B)',
        },
      ],
    },
    theorems: [
      {
        id: 'thm_para_congruent_triangles',
        title: 'Diagonal Divides Parallelogram into 2 Congruent Triangles',
        statement: 'A diagonal of a parallelogram divides it into two congruent triangles (ΔABC ≅ ΔCDA).',
        ncertReference: 'Chapter 12, Section 12.2, Theorem 1 (proof by a diagonal); original question',
      },
      {
        id: 'thm_para_opp_sides_angles',
        title: 'Opposite Sides and Angles are Equal',
        statement: 'In a parallelogram, opposite sides are equal and opposite angles are equal.',
        ncertReference: 'Chapter 12, Section 12.2, Theorem 1 (a) and (b)',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'parallelogram_properties'),
  },

  {
    id: 'parallelogram-diagonals',
    title: 'Diagonals of a Parallelogram',
    subtitle: 'Mutual Bisection at Center Point O',
    curriculumCategory: 'parallelograms',
    curriculumClassification: 'direct_chapter',
    description:
      'Construct both diagonals AC and BD of a parallelogram and inspect their intersection point O. Manipulate the vertices and verify that OA = OC and OB = OD under all transformations.',
    learningGoals: [
      'Locate diagonal intersection point O',
      'Prove ΔAOB ≅ ΔCOD by ASA criterion using alternate interior angles and AB = CD',
      'Verify bisection invariants: OA = OC and OB = OD',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -4, y: -2, role: 'free', color: '#10b981' },
        { id: 'pB', name: 'B', x: 2, y: -2, role: 'free', color: '#10b981' },
        { id: 'pC', name: 'C', x: 4, y: 2, role: 'free', color: '#10b981' },
        { id: 'pD', name: 'D', x: -2, y: 2, role: 'derived', color: '#10b981' },
        { id: 'pO', name: 'O', x: 0, y: 0, role: 'diagonal_intersection', parentEntityIds: ['pA', 'pB', 'pC', 'pD'], color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#10b981' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#10b981' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#10b981' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#10b981' },
        { id: 'diag_AC', name: 'AC', pointAId: 'pA', pointBId: 'pC', isDiagonal: true, lineStyle: 'dashed', color: '#f59e0b' },
        { id: 'diag_BD', name: 'BD', pointAId: 'pB', pointBId: 'pD', isDiagonal: true, lineStyle: 'dashed', color: '#f59e0b' },
      ],
      quadrilaterals: [
        {
          id: 'quad_para_diag',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#10b981',
          fillAlpha: 0.12,
          showDiagonals: true,
        },
      ],
      triangles: [],
      constraints: [
        {
          id: 'c_para_diag',
          type: 'parallel_opposite',
          targetEntityIds: ['pA', 'pB', 'pC', 'pD'],
          active: true,
          description: 'Parallelogram constraint',
        },
      ],
    },
    theorems: [
      {
        id: 'thm_para_diagonals_bisect',
        title: 'Diagonals Bisect Each Other',
        statement: 'The diagonals of a parallelogram bisect each other (OA = OC and OB = OD).',
        ncertReference: 'Chapter 12, Section 12.2, Theorem 1(c); original question',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'parallelogram_diagonals'),
  },

  {
    id: 'parallelogram-converses',
    title: 'Conditions for a Parallelogram (Converses)',
    subtitle: 'Sufficient Criteria & Counterexample Laboratory',
    curriculumCategory: 'parallelograms',
    curriculumClassification: 'direct_chapter',
    description:
      'Test the conditions that guarantee a quadrilateral is a parallelogram: opposite sides equal, opposite angles equal, diagonals bisecting, or one pair equal and parallel. Unlock constraints to build counterexamples.',
    learningGoals: [
      'Differentiate sufficient conditions from inconclusive conditions',
      'Verify that one pair of opposite sides equal AND parallel guarantees a parallelogram',
      'Demonstrate counterexamples (e.g. isosceles trapezium having one pair of equal opposite sides without being a parallelogram)',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -3.5, y: -2, role: 'free', color: '#6366f1' },
        { id: 'pB', name: 'B', x: 2.5, y: -2, role: 'free', color: '#6366f1' },
        { id: 'pC', name: 'C', x: 3.5, y: 2, role: 'free', color: '#6366f1' },
        { id: 'pD', name: 'D', x: -2.5, y: 2, role: 'free', color: '#6366f1' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#6366f1', showLength: true },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#6366f1', showLength: true },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#6366f1', showLength: true },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#6366f1', showLength: true },
      ],
      quadrilaterals: [
        {
          id: 'quad_converse',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#6366f1',
          fillAlpha: 0.12,
          showAngles: true,
          showDiagonals: true,
        },
      ],
      triangles: [],
    },
    theorems: [
      {
        id: 'thm_converses',
        title: 'Sufficient Conditions for Parallelograms',
        statement:
          'A quadrilateral is a parallelogram if opposite sides are equal, or opposite angles are equal, or diagonals bisect, or one pair of opposite sides is equal and parallel.',
        ncertReference: 'Chapter 12, Section 12.2, Theorems 2, 3, 4 and 5',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'parallelogram_converses'),
  },

  // ==========================================================================
  // Unit 3: The Midpoint Theorem
  // ==========================================================================
  {
    id: 'triangle-midpoints',
    title: 'Triangle Midpoints & Medial Triangle',
    subtitle: 'Constructing Side Midpoints & Congruent Sub-Triangles',
    curriculumCategory: 'midpoint_theorem',
    curriculumClassification: 'direct_chapter',
    description:
      'Construct a triangle and locate the midpoints of its three sides. Connect them to form the medial triangle DEF, partitioning the original triangle into four congruent triangles.',
    learningGoals: [
      'Construct midpoints D, E, F of sides AB, BC, CA',
      'Examine the medial triangle DEF formed by joining the midpoints',
      'Observe that Perimeter(DEF) = 0.5 × Perimeter(ABC) and Area(DEF) = 0.25 × Area(ABC)',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: 0, y: 4, role: 'free', color: '#ec4899' },
        { id: 'pB', name: 'B', x: -5, y: -2, role: 'free', color: '#ec4899' },
        { id: 'pC', name: 'C', x: 5, y: -2, role: 'free', color: '#ec4899' },
        { id: 'pD', name: 'D', x: -2.5, y: 1, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#38bdf8' },
        { id: 'pE', name: 'E', x: 0, y: -2, role: 'midpoint', parentEntityIds: ['pB', 'pC'], color: '#38bdf8' },
        { id: 'pF', name: 'F', x: 2.5, y: 1, role: 'midpoint', parentEntityIds: ['pC', 'pA'], color: '#38bdf8' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#ec4899' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#ec4899' },
        { id: 'seg_CA', name: 'CA', pointAId: 'pC', pointBId: 'pA', color: '#ec4899' },
        { id: 'seg_DE', name: 'DE', pointAId: 'pD', pointBId: 'pE', lineStyle: 'dashed', color: '#38bdf8' },
        { id: 'seg_EF', name: 'EF', pointAId: 'pE', pointBId: 'pF', lineStyle: 'dashed', color: '#38bdf8' },
        { id: 'seg_FD', name: 'FD', pointAId: 'pF', pointBId: 'pD', lineStyle: 'dashed', color: '#38bdf8' },
      ],
      quadrilaterals: [],
      triangles: [
        { id: 'tri_main', name: 'ABC', p1Id: 'pA', p2Id: 'pB', p3Id: 'pC', color: '#ec4899', fillAlpha: 0.1 },
        { id: 'tri_medial', name: 'DEF', p1Id: 'pD', p2Id: 'pE', p3Id: 'pF', color: '#38bdf8', fillAlpha: 0.2 },
      ],
    },
    theorems: [
      {
        id: 'thm_medial_triangle',
        title: 'Medial Triangle Partition',
        statement: 'Joining the midpoints of the sides of a triangle divides it into four congruent triangles.',
        ncertReference: 'Chapter 12, Section 12.3.1 (the opening exploration)',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'midpoint_theorem'),
  },

  {
    id: 'midpoint-theorem',
    title: 'The Midpoint Theorem',
    subtitle: 'Parallelism & the 1/2 Length Invariant (Theorem 6)',
    curriculumCategory: 'midpoint_theorem',
    curriculumClassification: 'direct_chapter',
    description:
      'Join midpoints D and E of sides AB and AC. Observe that segment DE is strictly parallel to base BC and exactly half its length under all dynamic drags.',
    learningGoals: [
      'Deduce DE || BC and DE = 1/2 BC using the auxiliary extension DE = EF',
      'Observe that ratio BC / DE = 2.000 continuously holds as vertices are dragged',
      'Understand the application to quadrilaterals, trapeziums, and coordinate proofs',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: 0, y: 4.5, role: 'free', color: '#ec4899' },
        { id: 'pB', name: 'B', x: -5, y: -2, role: 'free', color: '#ec4899' },
        { id: 'pC', name: 'C', x: 5, y: -2, role: 'free', color: '#ec4899' },
        { id: 'pD', name: 'D', x: -2.5, y: 1.25, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#10b981' },
        { id: 'pE', name: 'E', x: 2.5, y: 1.25, role: 'midpoint', parentEntityIds: ['pA', 'pC'], color: '#10b981' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#ec4899' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#ec4899', showLength: true },
        { id: 'seg_CA', name: 'CA', pointAId: 'pC', pointBId: 'pA', color: '#ec4899' },
        { id: 'seg_DE', name: 'DE', pointAId: 'pD', pointBId: 'pE', color: '#10b981', showLength: true },
      ],
      quadrilaterals: [],
      triangles: [
        { id: 'tri_main', name: 'ABC', p1Id: 'pA', p2Id: 'pB', p3Id: 'pC', color: '#ec4899', fillAlpha: 0.1 },
      ],
    },
    theorems: [
      {
        id: 'thm_midpoint_main',
        title: 'The Midpoint Theorem',
        statement: 'The line segment joining the midpoints of two sides of a triangle is parallel to the third side and half of it.',
        ncertReference: 'Chapter 12, Section 12.3.1, Theorem 6; original question',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'midpoint_theorem'),
  },

  {
    id: 'converse-midpoint-theorem',
    title: 'Converse of the Midpoint Theorem',
    subtitle: 'Ray Through Midpoint Parallel to Base Bisects Third Side',
    curriculumCategory: 'midpoint_theorem',
    curriculumClassification: 'direct_chapter',
    description:
      'Draw a line from midpoint D of side AB parallel to base BC. Observe that it necessarily bisects side AC at point E (AE = EC).',
    learningGoals: [
      'Verify Theorem 7: Line through midpoint D parallel to BC bisects AC',
      'Demonstrate that point E is locked to the exact midpoint of AC',
      'Apply the converse theorem to solve division and transversal problems',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: 0, y: 4.5, role: 'free', color: '#06b6d4' },
        { id: 'pB', name: 'B', x: -5, y: -2, role: 'free', color: '#06b6d4' },
        { id: 'pC', name: 'C', x: 5, y: -2, role: 'free', color: '#06b6d4' },
        { id: 'pD', name: 'D', x: -2.5, y: 1.25, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#f59e0b' },
        { id: 'pE', name: 'E', x: 2.5, y: 1.25, role: 'midpoint', parentEntityIds: ['pA', 'pC'], color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#06b6d4' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#06b6d4' },
        { id: 'seg_CA', name: 'CA', pointAId: 'pC', pointBId: 'pA', color: '#06b6d4' },
        { id: 'seg_DE', name: 'DE', pointAId: 'pD', pointBId: 'pE', lineStyle: 'dashed', color: '#f59e0b' },
      ],
      quadrilaterals: [],
      triangles: [
        { id: 'tri_main', name: 'ABC', p1Id: 'pA', p2Id: 'pB', p3Id: 'pC', color: '#06b6d4', fillAlpha: 0.1 },
      ],
    },
    theorems: [
      {
        id: 'thm_converse_midpoint',
        title: 'Converse of Midpoint Theorem',
        statement: 'The line drawn through the midpoint of one side of a triangle parallel to another side bisects the third side.',
        ncertReference: 'Chapter 12, Section 12.3.1, Theorem 7; original question',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'midpoint_theorem'),
  },

  // ==========================================================================
  // Unit 4: Medians and Centroid
  // ==========================================================================
  {
    id: 'triangle-medians',
    title: 'Medians of a Triangle',
    subtitle: 'Concurrency at the Centroid Point G',
    curriculumCategory: 'medians_centroid',
    curriculumClassification: 'direct_chapter',
    description:
      'Construct the three medians of a triangle connecting each vertex to the midpoint of the opposite side. Observe their concurrency at point G under all vertex manipulations.',
    learningGoals: [
      'Construct medians AD, BE, CF of triangle ABC',
      'Verify that all three medians invariably intersect at point G (Centroid)',
      'Observe that G always lies in the strict interior of any non-degenerate triangle',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: 0, y: 5, role: 'free', color: '#8b5cf6' },
        { id: 'pB', name: 'B', x: -5, y: -2, role: 'free', color: '#8b5cf6' },
        { id: 'pC', name: 'C', x: 5, y: -2, role: 'free', color: '#8b5cf6' },
        { id: 'pD', name: 'D', x: 0, y: -2, role: 'midpoint', parentEntityIds: ['pB', 'pC'], color: '#38bdf8' },
        { id: 'pE', name: 'E', x: 2.5, y: 1.5, role: 'midpoint', parentEntityIds: ['pC', 'pA'], color: '#38bdf8' },
        { id: 'pF', name: 'F', x: -2.5, y: 1.5, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#38bdf8' },
        { id: 'pG', name: 'G', x: 0, y: 0.33, role: 'triangle_centroid', parentEntityIds: ['pA', 'pB', 'pC'], color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#8b5cf6' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#8b5cf6' },
        { id: 'seg_CA', name: 'CA', pointAId: 'pC', pointBId: 'pA', color: '#8b5cf6' },
        { id: 'med_AD', name: 'AD', pointAId: 'pA', pointBId: 'pD', isMedian: true, lineStyle: 'dashed', color: '#f59e0b' },
        { id: 'med_BE', name: 'BE', pointAId: 'pB', pointBId: 'pE', isMedian: true, lineStyle: 'dashed', color: '#f59e0b' },
        { id: 'med_CF', name: 'CF', pointAId: 'pC', pointBId: 'pF', isMedian: true, lineStyle: 'dashed', color: '#f59e0b' },
      ],
      quadrilaterals: [],
      triangles: [
        { id: 'tri_main', name: 'ABC', p1Id: 'pA', p2Id: 'pB', p3Id: 'pC', color: '#8b5cf6', fillAlpha: 0.1 },
      ],
    },
    theorems: [
      {
        id: 'thm_medians_concurrent',
        title: 'Concurrency of Triangle Medians',
        statement: 'The three medians of any triangle intersect at a single point called the centroid (G).',
        ncertReference: 'Chapter 12, Section 12.3.2',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'medians_centroid'),
  },

  {
    id: 'centroid-theorem',
    title: 'The Centroid Theorem',
    subtitle: 'The Invariant 2:1 Ratio on Every Median',
    curriculumCategory: 'medians_centroid',
    curriculumClassification: 'direct_chapter',
    description:
      'Measure the distance from each vertex to centroid G and from G to the opposite side midpoint. Discover and verify the exact 2:1 division ratio (AG:GD = 2, BG:GE = 2, CG:GF = 2).',
    learningGoals: [
      'Discover that AG = 2 × GD, BG = 2 × GE, and CG = 2 × GF',
      'Follow the formal Euclidean proof using the Midpoint Theorem and similar triangles',
      'Handle degenerate/collinear triangles with clear mathematical indicators',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: 0, y: 5, role: 'free', color: '#8b5cf6' },
        { id: 'pB', name: 'B', x: -5, y: -2, role: 'free', color: '#8b5cf6' },
        { id: 'pC', name: 'C', x: 5, y: -2, role: 'free', color: '#8b5cf6' },
        { id: 'pD', name: 'D', x: 0, y: -2, role: 'midpoint', parentEntityIds: ['pB', 'pC'], color: '#38bdf8' },
        { id: 'pE', name: 'E', x: 2.5, y: 1.5, role: 'midpoint', parentEntityIds: ['pC', 'pA'], color: '#38bdf8' },
        { id: 'pF', name: 'F', x: -2.5, y: 1.5, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#38bdf8' },
        { id: 'pG', name: 'G', x: 0, y: 0.33, role: 'triangle_centroid', parentEntityIds: ['pA', 'pB', 'pC'], color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#8b5cf6' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#8b5cf6' },
        { id: 'seg_CA', name: 'CA', pointAId: 'pC', pointBId: 'pA', color: '#8b5cf6' },
        { id: 'seg_AG', name: 'AG', pointAId: 'pA', pointBId: 'pG', color: '#f59e0b', showLength: true },
        { id: 'seg_GD', name: 'GD', pointAId: 'pG', pointBId: 'pD', color: '#f59e0b', showLength: true },
        { id: 'med_BE', name: 'BE', pointAId: 'pB', pointBId: 'pE', isMedian: true, lineStyle: 'dashed', color: '#a78bfa' },
        { id: 'med_CF', name: 'CF', pointAId: 'pC', pointBId: 'pF', isMedian: true, lineStyle: 'dashed', color: '#a78bfa' },
      ],
      quadrilaterals: [],
      triangles: [
        { id: 'tri_main', name: 'ABC', p1Id: 'pA', p2Id: 'pB', p3Id: 'pC', color: '#8b5cf6', fillAlpha: 0.1 },
      ],
    },
    theorems: [
      {
        id: 'thm_centroid_ratio',
        title: 'Centroid 2:1 Division Ratio',
        statement: 'The centroid divides each median in the ratio 2:1 from the vertex (AG : GD = 2:1).',
        ncertReference: 'Chapter 12, Section 12.3.2, Theorem 8; original question',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'medians_centroid'),
  },

  // ==========================================================================
  // Unit 5: Varignon Parallelogram
  // ==========================================================================
  {
    id: 'varignon-parallelogram',
    title: 'Varignon Parallelogram Theorem',
    subtitle: 'Midpoints of Any Quadrilateral Form a Parallelogram',
    curriculumCategory: 'varignon',
    curriculumClassification: 'direct_chapter',
    description:
      'Construct midpoints P, Q, R, S of any simple quadrilateral ABCD. Observe that PQRS is always a parallelogram with Area = 1/2 Area(ABCD), provable via the Midpoint Theorem applied to diagonals AC and BD.',
    learningGoals: [
      'Apply Midpoint Theorem to ΔABC and ΔADC to prove PQ || AC, PQ = 1/2 AC and RS || AC, RS = 1/2 AC',
      'Conclude PQ || RS and PQ = RS, proving PQRS is a parallelogram',
      'Explore special cases: rectangle yields rhombus, rhombus yields rectangle, square yields square',
      'Verify the area invariant Area(PQRS) = 0.5 × Area(ABCD)',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -4, y: -2.5, role: 'free', color: '#3b82f6' },
        { id: 'pB', name: 'B', x: 3.5, y: -3.5, role: 'free', color: '#3b82f6' },
        { id: 'pC', name: 'C', x: 4.5, y: 3, role: 'free', color: '#3b82f6' },
        { id: 'pD', name: 'D', x: -2, y: 4, role: 'free', color: '#3b82f6' },
        { id: 'pP', name: 'P', x: -0.25, y: -3, role: 'midpoint', parentEntityIds: ['pA', 'pB'], color: '#f59e0b' },
        { id: 'pQ', name: 'Q', x: 4, y: -0.25, role: 'midpoint', parentEntityIds: ['pB', 'pC'], color: '#f59e0b' },
        { id: 'pR', name: 'R', x: 1.25, y: 3.5, role: 'midpoint', parentEntityIds: ['pC', 'pD'], color: '#f59e0b' },
        { id: 'pS', name: 'S', x: -3, y: 0.75, role: 'midpoint', parentEntityIds: ['pD', 'pA'], color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#3b82f6' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#3b82f6' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#3b82f6' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#3b82f6' },
        { id: 'diag_AC', name: 'AC', pointAId: 'pA', pointBId: 'pC', isDiagonal: true, lineStyle: 'dotted', color: '#94a3b8' },
        { id: 'diag_BD', name: 'BD', pointAId: 'pB', pointBId: 'pD', isDiagonal: true, lineStyle: 'dotted', color: '#94a3b8' },
        { id: 'seg_PQ', name: 'PQ', pointAId: 'pP', pointBId: 'pQ', isMidpointConnector: true, color: '#f59e0b' },
        { id: 'seg_QR', name: 'QR', pointAId: 'pQ', pointBId: 'pR', isMidpointConnector: true, color: '#f59e0b' },
        { id: 'seg_RS', name: 'RS', pointAId: 'pR', pointBId: 'pS', isMidpointConnector: true, color: '#f59e0b' },
        { id: 'seg_SP', name: 'SP', pointAId: 'pS', pointBId: 'pP', isMidpointConnector: true, color: '#f59e0b' },
      ],
      quadrilaterals: [
        {
          id: 'quad_outer',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#3b82f6',
          fillAlpha: 0.08,
          showVarignon: true,
        },
        {
          id: 'quad_varignon',
          name: 'PQRS',
          p1Id: 'pP',
          p2Id: 'pQ',
          p3Id: 'pR',
          p4Id: 'pS',
          color: '#f59e0b',
          fillAlpha: 0.25,
          isVarignon: true,
          parentQuadId: 'quad_outer',
        },
      ],
      triangles: [],
    },
    theorems: [
      {
        id: 'thm_varignon',
        title: 'Varignon’s Theorem',
        statement:
          'The midpoints of the sides of any simple quadrilateral form a parallelogram whose area is half that of the original quadrilateral.',
        ncertReference: 'Chapter 12, Section 12.3.2, Theorem 9 (Midpoint Theorem for Quadrilaterals)',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'varignon'),
  },

  // ==========================================================================
  // Unit 6: Tiling the Plane
  // ==========================================================================
  {
    id: 'quadrilateral-tiling',
    title: 'Quadrilateral Tiling of the Plane',
    subtitle: 'Monohedral Tessellation via 180° Rotations & Angle Sum 360°',
    curriculumCategory: 'tiling',
    curriculumClassification: 'direct_chapter',
    description:
      'Generate a periodic tiling of the Euclidean plane using translated and 180°-rotated copies of any simple quadrilateral. Move any vertex and watch the entire tessellation adapt seamlessly without gaps or overlaps.',
    learningGoals: [
      'Understand how 180° rotations about edge midpoints produce congruent matching boundaries',
      'Observe that exactly four tiles meet at every internal vertex with angles summing to 360°',
      'Experiment with concave simple quadrilaterals and verify that tiling persists',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -2.5, y: -1.5, role: 'free', color: '#14b8a6' },
        { id: 'pB', name: 'B', x: 2, y: -2, role: 'free', color: '#14b8a6' },
        { id: 'pC', name: 'C', x: 2.5, y: 1.5, role: 'free', color: '#14b8a6' },
        { id: 'pD', name: 'D', x: -1.5, y: 2, role: 'free', color: '#14b8a6' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#14b8a6' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#14b8a6' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#14b8a6' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#14b8a6' },
      ],
      quadrilaterals: [
        {
          id: 'quad_base_tiling',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#14b8a6',
          fillAlpha: 0.25,
        },
      ],
      triangles: [],
      tiling: {
        enabled: true,
        rows: 4,
        cols: 5,
        baseQuadId: 'quad_base_tiling',
        showVectors: true,
        showRotationCenters: true,
        opacity: 0.35,
      },
    },
    theorems: [
      {
        id: 'thm_tiling_plane',
        title: 'Universal Quadrilateral Plane Tessellation',
        statement:
          'Any planar simple quadrilateral can tile the plane without gaps or overlaps because its four interior angles sum to 360°.',
        ncertReference: 'Chapter 12, Section 12.4; original question',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.filter((q) => q.topicId === 'tiling'),
  },

  // ==========================================================================
  // Unit 7: Revision & Synthesis
  // ==========================================================================
  {
    id: 'theorem-investigation',
    title: 'Theorem Investigation & Deductive Proofs',
    subtitle: 'Euclidean Synthesis Across All Chapter Theorems',
    curriculumCategory: 'revision',
    curriculumClassification: 'direct_chapter',
    description:
      'Explore structured formal proofs with interactive reason selection, covering parallelogram invariants, converse conditions, the Midpoint Theorem, and the Centroid ratio.',
    learningGoals: [
      'Master two-column geometric proofs with statements and reasons',
      'Distinguish theorems from their converses',
      'Synthesize Midpoint Theorem, Centroid Theorem, and Varignon Theorem into unified geometric intuition',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -4, y: -2, role: 'free', color: '#f59e0b' },
        { id: 'pB', name: 'B', x: 2, y: -2, role: 'free', color: '#f59e0b' },
        { id: 'pC', name: 'C', x: 4, y: 2, role: 'free', color: '#f59e0b' },
        { id: 'pD', name: 'D', x: -2, y: 2, role: 'free', color: '#f59e0b' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#f59e0b' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#f59e0b' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#f59e0b' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#f59e0b' },
        { id: 'diag_AC', name: 'AC', pointAId: 'pA', pointBId: 'pC', isDiagonal: true, lineStyle: 'dashed', color: '#38bdf8' },
        { id: 'diag_BD', name: 'BD', pointAId: 'pB', pointBId: 'pD', isDiagonal: true, lineStyle: 'dashed', color: '#38bdf8' },
      ],
      quadrilaterals: [
        {
          id: 'quad_rev',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#f59e0b',
          fillAlpha: 0.12,
          showDiagonals: true,
          showAngles: true,
        },
      ],
      triangles: [],
    },
    theorems: [
      {
        id: 'thm_revision_summary',
        title: 'NCERT Chapter 12 Theorems Summary',
        statement:
          'Comprehensive integration of angle sums, parallelogram criteria, Midpoint Theorem, Medians/Centroid, and Varignon Theorem.',
        ncertReference: 'Chapter 12, Chapter Summary',
      },
    ],
    practiceQuestions: CHAPTER_PRACTICE_BANK.slice(0, 10),
  },

  {
    id: 'chapter-practice-workbench',
    title: 'Chapter Practice Workbench',
    subtitle: 'Comprehensive NCERT Examination Problem Bank',
    curriculumCategory: 'revision',
    curriculumClassification: 'direct_chapter',
    description:
      'Solve targeted examination problems spanning Basic, Standard, and Challenge difficulty tiers. Includes diagram reasoning, numerical calculations, and formal proof verification.',
    learningGoals: [
      'Solve missing angle and length problems under timed classroom conditions',
      'Compute segments using Midpoint Theorem and Centroid 2:1 division',
      'Analyze Varignon perimeters and areas from given diagonal lengths',
    ],
    initialScene: {
      points: [
        { id: 'pA', name: 'A', x: -3.5, y: -2, role: 'free', color: '#10b981' },
        { id: 'pB', name: 'B', x: 2.5, y: -2, role: 'free', color: '#10b981' },
        { id: 'pC', name: 'C', x: 4, y: 2, role: 'free', color: '#10b981' },
        { id: 'pD', name: 'D', x: -2, y: 2, role: 'free', color: '#10b981' },
      ],
      segments: [
        { id: 'seg_AB', name: 'AB', pointAId: 'pA', pointBId: 'pB', color: '#10b981' },
        { id: 'seg_BC', name: 'BC', pointAId: 'pB', pointBId: 'pC', color: '#10b981' },
        { id: 'seg_CD', name: 'CD', pointAId: 'pC', pointBId: 'pD', color: '#10b981' },
        { id: 'seg_DA', name: 'DA', pointAId: 'pD', pointBId: 'pA', color: '#10b981' },
      ],
      quadrilaterals: [
        {
          id: 'quad_prac',
          name: 'ABCD',
          p1Id: 'pA',
          p2Id: 'pB',
          p3Id: 'pC',
          p4Id: 'pD',
          color: '#10b981',
          fillAlpha: 0.15,
        },
      ],
      triangles: [],
    },
    theorems: [],
    practiceQuestions: CHAPTER_PRACTICE_BANK,
  },
];
