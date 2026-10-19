/**
 * Experiment Catalog & Curriculum Registry for Class 9 Circles Laboratory
 * Aligned with NCERT Ganita Manjari: "I'm Up and Down, and Round and Round"
 *
 * Implements 13 comprehensive interactive experiments organized into 4 thematic units:
 * 1. Foundations: Anatomy, Symmetry of a Circle, How Many Circles?
 * 2. Chords: Chords & Midpoints, Equal Chords & Central Angles, Distance of Chords from Center
 * 3. Angles & Theorems: Central & Inscribed Angles, Angles in Same Segment, Cyclic Quadrilaterals, Concyclicity & Converses
 * 4. Practice & Revision / Extensions: Tangents & Radius, Euclidean Theorem Proofs, Chapter-wide Mastery Challenge
 */

import type { CircleExperimentDefinition } from './types';

export const CIRCLE_EXPERIMENTS: CircleExperimentDefinition[] = [
  // ==========================================
  // UNIT 1: FOUNDATIONS
  // ==========================================

  // Experiment 1: Understanding a Circle
  {
    id: 'understanding-circle',
    title: '1. Understanding a Circle',
    subtitle: 'Center, Radius, Diameter, Chords & Arcs',
    category: 'foundations',
    description:
      'Explore the fundamental anatomy of a circle: how center and radius determine points on the plane, how diameters are the longest chords, and how circumference scales with radius.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.1 Definitions',
    initialScene: {
      circles: [
        {
          id: 'circle_main',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.0,
          color: '#38bdf8',
          fillAlpha: 0.06,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_main', angleRad: 0.5236, color: '#38bdf8' }, // 30°
        { id: 'pt_B', name: 'B', circleId: 'circle_main', angleRad: 2.3562, color: '#38bdf8' }, // 135°
        { id: 'pt_C', name: 'C', circleId: 'circle_main', angleRad: 3.6652, color: '#10b981' }, // 210°
      ],
      chords: [
        {
          id: 'chord_AB',
          name: 'Chord AB',
          circleId: 'circle_main',
          pointAId: 'pt_A',
          pointBId: 'pt_B',
          color: '#f59e0b',
          showMidpoint: true,
        },
      ],
      radiusDiameters: [
        {
          id: 'rad_OA',
          name: 'Radius OA',
          circleId: 'circle_main',
          type: 'radius',
          pointId: 'pt_A',
          color: '#38bdf8',
        },
      ],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_circle_def',
        title: 'Definition of a Circle & Radial Locus',
        statement:
          'A circle is the collection of all points in a plane which are at a fixed distance (radius) from a fixed point (center). Diameter is the longest chord passing through the center.',
        hypothesis: 'Any point P on the circumference satisfies distance(O, P) = r.',
        instructions:
          'Drag point A or B around the circle. Notice that their distance from the origin O(0,0) remains strictly equal to radius 4.0 units.',
        predictionQuestion: {
          question: 'If you drag point A anywhere along the boundary, what happens to distance OA?',
          options: [
            'It increases as A moves higher',
            'It remains constant and equal to radius r',
            'It fluctuates depending on the angle',
          ],
          correctIndex: 1,
          explanation:
            'By definition, every point on the circumference is equidistant from the center point O.',
        },
        proofSteps: [
          {
            statement: 'Let O be the center and r be the radius of the circle.',
            reason: 'Given construction definition.',
          },
          {
            statement: 'For any point P(x, y) on the circumference, (x - x_O)² + (y - y_O)² = r².',
            reason: 'Pythagorean distance formula.',
          },
          {
            statement: 'Therefore, the distance OP is invariant under rotation along the boundary.',
            reason: 'Constant geometric locus.',
          },
        ],
        mathematicalConclusion:
          'A circle is a symmetric 1D closed curve where all points share an identical radial distance from the center.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_radius_diameter',
        title: 'Diameter from Radius',
        question:
          'If a circle has a radius of 4.5 cm, what is the length of its diameter, and what is its circumference (taking π ≈ 3.14)?',
        correctAnswer: '9 cm, 28.26 cm',
        hint: 'Diameter d = 2r. Circumference C = 2πr = πd.',
        stepByStepSolution: [
          'Diameter d = 2 × radius = 2 × 4.5 cm = 9.0 cm.',
          'Circumference C = 2 × π × r = 2 × 3.14 × 4.5 = 28.26 cm.',
        ],
        theoremApplied: 'Relationship between radius, diameter, and circumference.',
      },
    ],
  },

  // Experiment 2: Symmetry of a Circle
  {
    id: 'symmetry-of-circle',
    title: '2. Symmetry of a Circle',
    subtitle: 'Rotational & Reflectional Symmetries Across Diameters',
    category: 'foundations',
    description:
      'Investigate why a circle possesses infinitely many reflection symmetries across any diameter and remains invariant under rotation by any angle around its center.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.2 Symmetries of a Circle',
    initialScene: {
      circles: [
        {
          id: 'circle_sym',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_P', name: 'P (Original)', circleId: 'circle_sym', angleRad: 0.7854, color: '#f59e0b' }, // 45°
        { id: 'pt_Q', name: 'Q (Chord Base)', circleId: 'circle_sym', angleRad: 2.3562, color: '#f59e0b' }, // 135°
        { id: 'pt_D1', name: 'D1 (Axis)', circleId: 'circle_sym', angleRad: 0.0, color: '#a855f7' }, // Diameter Axis start
        { id: 'pt_D2', name: 'D2 (Axis)', circleId: 'circle_sym', angleRad: 3.1416, color: '#a855f7' }, // Diameter Axis end
      ],
      chords: [
        {
          id: 'chord_PQ',
          name: 'Original Chord PQ',
          circleId: 'circle_sym',
          pointAId: 'pt_P',
          pointBId: 'pt_Q',
          color: '#f59e0b',
          showMidpoint: true,
        },
      ],
      radiusDiameters: [
        {
          id: 'dia_axis',
          name: 'Reflection Axis (Diameter D1D2)',
          circleId: 'circle_sym',
          type: 'diameter',
          pointId: 'pt_D1',
          point2Id: 'pt_D2',
          color: '#a855f7',
        },
      ],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_circle_symmetries',
        title: 'Rotational & Reflectional Invariance',
        statement:
          'A circle has infinitely many lines of symmetry (any line passing through its center). It also has continuous rotational symmetry of order infinity around its center.',
        hypothesis:
          'Rotating or reflecting any point or chord across a diameter produces another valid point or chord of identical length lying strictly on the circle.',
        instructions:
          'Use the Rotation and Reflection controls in the inspector. Notice how the rotated image P′ and reflected image P″ both remain exactly on the circumference with distance 4.5 units from center O.',
        predictionQuestion: {
          question: 'How many axes of reflection symmetry does a perfect circle have?',
          options: ['Exactly 4 (horizontal, vertical, two diagonals)', 'Exactly 360', 'Infinitely many (any diameter)'],
          correctIndex: 2,
          explanation:
            'Every single straight line passing through the center of a circle divides it into two congruent semicircles and acts as an axis of reflection symmetry.',
        },
        proofSteps: [
          {
            statement: 'Let the circle have center O and radius r: { P ∈ ℝ² | dist(O, P) = r }.',
            reason: 'Definition of circle locus.',
          },
          {
            statement: 'An orthogonal transformation (rotation about O or reflection across a line through O) preserves Euclidean distances from O: dist(O, T(P)) = dist(O, P).',
            reason: 'Isometry property of orthogonal Euclidean transformations.',
          },
          {
            statement: 'Since dist(O, P) = r, dist(O, T(P)) = r, meaning T(P) also lies on the circle.',
            reason: 'Substitution into circle locus equation.',
          },
          {
            statement: 'For any two points P, Q on the circle, dist(T(P), T(Q)) = dist(P, Q).',
            reason: 'Isometries preserve all segment lengths.',
          },
        ],
        mathematicalConclusion:
          'A circle is the most symmetric planar figure: continuous rotational invariance around O and reflection symmetry across every diameter preserve all geometric metrics.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_sym_chord_length',
        title: 'Invariance of Transformed Chord',
        question:
          'A chord of length 6.2 cm is rotated by 65° around the center of a circle. What is the length of the rotated chord?',
        correctAnswer: '6.2 cm',
        hint: 'Rotation is an isometric transformation; it preserves segment lengths.',
        stepByStepSolution: [
          'Rotation around any point is an isometry (distance-preserving transformation).',
          'Let chord have length L = 6.2 cm.',
          'Under rotation by 65° around center O, distance between endpoints is strictly preserved.',
          'Therefore, length of rotated chord = 6.2 cm.',
        ],
        theoremApplied: 'Isometric invariance under rotation.',
      },
    ],
  },

  // Experiment 3: How Many Circles?
  {
    id: 'how-many-circles',
    title: '3. How Many Circles?',
    subtitle: 'Circles Through 1, 2, and 3 Points & Circumcircle Construction',
    category: 'foundations',
    description:
      'Investigate the number of circles passing through given points: infinitely many through 1 point, locus of centers on perpendicular bisector for 2 points, and a unique circumcircle through 3 non-collinear points.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.3 How Many Circles? (Theorem 1)',
    initialScene: {
      circles: [
        {
          id: 'circle_circum',
          name: 'Circumcircle (ΔABC)',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_circum', angleRad: 1.05, color: '#38bdf8' }, // 60°
        { id: 'pt_B', name: 'B', circleId: 'circle_circum', angleRad: 2.88, color: '#f59e0b' }, // 165°
        { id: 'pt_C', name: 'C', circleId: 'circle_circum', angleRad: 5.24, color: '#10b981' }, // 300°
      ],
      chords: [
        { id: 'side_AB', name: 'Side AB', circleId: 'circle_circum', pointAId: 'pt_A', pointBId: 'pt_B', color: '#64748b', showPerpendicular: true },
        { id: 'side_BC', name: 'Side BC', circleId: 'circle_circum', pointAId: 'pt_B', pointBId: 'pt_C', color: '#64748b', showPerpendicular: true },
        { id: 'side_CA', name: 'Side CA', circleId: 'circle_circum', pointAId: 'pt_C', pointBId: 'pt_A', color: '#64748b', showPerpendicular: true },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_unique_circumcircle',
        title: 'One and Only One Circle Through Three Non-Collinear Points',
        statement:
          'There is one and only one circle passing through three given non-collinear points. The center of this circle is the intersection of perpendicular bisectors of the sides.',
        hypothesis:
          'For any non-collinear points A, B, C, perpendicular bisectors of AB and BC intersect at a single point O such that OA = OB = OC.',
        instructions:
          'Drag vertices A, B, or C. Observe that the perpendicular bisectors always meet at a common circumcenter O, and the circumcircle passes precisely through all three vertices. Watch the circumcenter move inside (acute), on the hypotenuse (right), or outside (obtuse).',
        predictionQuestion: {
          question: 'If three points A, B, and C lie in a straight line (collinear), how many finite circles can pass through all three?',
          options: ['Exactly one', 'Infinitely many', 'None (0 circles)'],
          correctIndex: 2,
          explanation:
            'For collinear points, the perpendicular bisectors of AB and BC are parallel and never intersect. Therefore, no finite center O can be equidistant from all three points.',
        },
        proofSteps: [
          {
            statement: 'Let A, B, C be three non-collinear points. Draw segments AB and BC.',
            reason: 'Given geometric construction.',
          },
          {
            statement: 'Draw the perpendicular bisectors of AB and BC. Since A, B, C are non-collinear, line AB is not parallel to line BC.',
            reason: 'Non-collinearity condition.',
          },
          {
            statement: 'Therefore, their perpendicular bisectors are not parallel and intersect at a unique point O.',
            reason: 'Intersection of non-parallel coplanar lines.',
          },
          {
            statement: 'Since O lies on the perpendicular bisector of AB, OA = OB. Since O lies on the perpendicular bisector of BC, OB = OC.',
            reason: 'Points on perpendicular bisector are equidistant from endpoints.',
          },
          {
            statement: 'Hence OA = OB = OC = r. A circle with center O and radius r passes through A, B, and C.',
            reason: 'Transitive equality of distance.',
          },
          {
            statement: 'Since two straight lines can intersect at only one point, center O is unique, proving uniqueness.',
            reason: 'Euclidean uniqueness axiom.',
          },
        ],
        mathematicalConclusion:
          'Every triangle has a unique circumcircle. Collinear points have parallel perpendicular bisectors, making a common circumcenter impossible.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_circumcenter_right_triangle',
        title: 'Circumcenter of a Right Triangle',
        question:
          'In a right-angled triangle ΔABC with right angle at B, AB = 6 cm and BC = 8 cm. What is the radius of its circumcircle?',
        correctAnswer: '5 cm',
        hint: 'In a right triangle, the hypotenuse is the diameter of the circumcircle. Use Pythagoras: AC = √(AB² + BC²), then radius r = AC / 2.',
        stepByStepSolution: [
          'By Pythagoras theorem: AC² = AB² + BC² = 6² + 8² = 36 + 64 = 100.',
          'Hypotenuse AC = √100 = 10 cm.',
          'In a right triangle, the circumcenter lies on the midpoint of the hypotenuse, so AC is the diameter (d = 10 cm).',
          'Circumcircle radius r = AC / 2 = 10 / 2 = 5 cm.',
        ],
        theoremApplied: 'Circumcircle of right triangle & Thales theorem.',
      },
    ],
  },

  // ==========================================
  // UNIT 2: CHORDS & THEIR PROPERTIES
  // ==========================================

  // Experiment 4: Chords & Midpoints
  {
    id: 'chords-and-properties',
    title: '4. Chords & Midpoints',
    subtitle: 'Perpendicular from Center Bisects Chord & Converse',
    category: 'chords',
    description:
      'Investigate the foundational theorem: The perpendicular from the center of a circle to a chord bisects the chord, and conversely, the line joining the center to the midpoint is perpendicular.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.5 (Theorems 4 and 5): perpendicular from the centre to a chord',
    initialScene: {
      circles: [
        {
          id: 'circle_chords',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_chords', angleRad: 0.6, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_chords', angleRad: 2.2, color: '#38bdf8' },
      ],
      chords: [
        {
          id: 'chord_1',
          name: 'Chord AB',
          circleId: 'circle_chords',
          pointAId: 'pt_A',
          pointBId: 'pt_B',
          color: '#38bdf8',
          showMidpoint: true,
          showPerpendicular: true,
        },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_perpendicular_bisects_chord',
        title: 'Perpendicular from Center Bisects Chord',
        statement:
          'The perpendicular from the center of a circle to a chord bisects the chord (OM ⊥ AB ⇒ AM = MB).',
        hypothesis: 'If OM ⊥ AB where O is the center, then AM = MB.',
        instructions:
          'Drag point A or B to change chord length. Observe that segment OM remains strictly perpendicular to chord AB and M divides AB into two equal segments.',
        predictionQuestion: {
          question: 'If chord AB has length 8 cm and center O is 3 cm away from M, what is AM?',
          options: ['3 cm', '4 cm', '5 cm'],
          correctIndex: 1,
          explanation: 'The perpendicular from the center bisects the chord: AM = AB / 2 = 8 / 2 = 4 cm.',
        },
        proofSteps: [
          { statement: 'Draw radii OA and OB to form triangles ΔOMA and ΔOMB.', reason: 'Construction.' },
          { statement: 'OA = OB = r (radii of the same circle).', reason: 'Common radius.' },
          { statement: 'OM = OM (common side).', reason: 'Reflexive identity.' },
          { statement: '∠OMA = ∠OMB = 90° (OM ⊥ AB).', reason: 'Given perpendicularity.' },
          { statement: 'ΔOMA ≅ ΔOMB by RHS Congruence Criterion.', reason: 'Right angle-Hypotenuse-Side.' },
          { statement: 'Therefore, AM = MB.', reason: 'CPCTC (Corresponding Parts of Congruent Triangles).' },
        ],
        mathematicalConclusion:
          'The line segment joining the center of a circle to the midpoint of a chord is perpendicular to the chord, and vice versa.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q2_chord_pythagoras',
        title: 'Find Chord Length using Pythagoras',
        question:
          'A chord of a circle of radius 5 cm is at a distance of 3 cm from the center. Find the length of the chord.',
        correctAnswer: '8 cm',
        hint: 'In right-angled triangle ΔOMA, OA² = OM² + AM². Then chord AB = 2 × AM.',
        stepByStepSolution: [
          'In right triangle ΔOMA, OA = radius = 5 cm, OM = distance = 3 cm.',
          'By Pythagoras: OA² = OM² + AM² => 5² = 3² + AM² => 25 = 9 + AM².',
          'AM² = 16 => AM = 4 cm.',
          'Chord length AB = 2 × AM = 2 × 4 = 8 cm.',
        ],
        theoremApplied: 'Perpendicular from center bisects chord + Pythagoras theorem.',
      },
    ],
  },

  // Experiment 5: Equal Chords & Central Angles
  {
    id: 'equal-chords-central-angles',
    title: '5. Equal Chords & Central Angles',
    subtitle: 'Equal Chords Subtend Equal Central Angles & Converse',
    category: 'chords',
    description:
      'Discover that equal chords subtend equal angles at the center (AB = CD ⇒ ∠AOB = ∠COD), and conversely, equal central angles correspond to chords of equal length.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.4 (Theorems 2 and 3): equal chords and central angles',
    initialScene: {
      circles: [
        {
          id: 'circle_eq',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_eq', angleRad: 0.5, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_eq', angleRad: 2.1, color: '#38bdf8' },
        { id: 'pt_C', name: 'C', circleId: 'circle_eq', angleRad: 3.5, color: '#10b981' },
        { id: 'pt_D', name: 'D', circleId: 'circle_eq', angleRad: 5.1, color: '#10b981' },
      ],
      chords: [
        { id: 'chord_AB', name: 'Chord AB', circleId: 'circle_eq', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8', showMidpoint: true },
        { id: 'chord_CD', name: 'Chord CD', circleId: 'circle_eq', pointAId: 'pt_C', pointBId: 'pt_D', color: '#10b981', showMidpoint: true },
      ],
      radiusDiameters: [],
      angles: [
        { id: 'ang_AOB', name: 'Central ∠AOB', circleId: 'circle_eq', point1Id: 'pt_A', vertexId: 'center', point2Id: 'pt_B', isCentral: true, color: '#38bdf8' },
        { id: 'ang_COD', name: 'Central ∠COD', circleId: 'circle_eq', point1Id: 'pt_C', vertexId: 'center', point2Id: 'pt_D', isCentral: true, color: '#10b981' },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_equal_chords_equal_angles',
        title: 'Equal Chords Subtend Equal Angles at Center',
        statement:
          'Equal chords of a circle (or of congruent circles) subtend equal angles at the center (AB = CD ⇔ ∠AOB = ∠COD).',
        hypothesis: 'If length(AB) = length(CD), then ∠AOB = ∠COD.',
        instructions:
          'Adjust chord CD by dragging its endpoints until its length matches chord AB. Observe that the subtended central angles ∠AOB and ∠COD become identical.',
        predictionQuestion: {
          question: 'If two chords AB and CD in the same circle are each 7 cm long, and ∠AOB = 72°, what is ∠COD?',
          options: ['36°', '72°', '144°'],
          correctIndex: 1,
          explanation: 'Equal chords subtend equal angles at the center, so ∠COD = ∠AOB = 72°.',
        },
        proofSteps: [
          { statement: 'In triangles ΔAOB and ΔCOD: OA = OC = r (radii).', reason: 'Radii of same circle.' },
          { statement: 'OB = OD = r (radii).', reason: 'Radii of same circle.' },
          { statement: 'AB = CD (given equal chord lengths).', reason: 'Hypothesis.' },
          { statement: 'ΔAOB ≅ ΔCOD by SSS Congruence Criterion.', reason: 'Side-Side-Side congruence.' },
          { statement: 'Therefore, ∠AOB = ∠COD.', reason: 'CPCTC.' },
          { statement: 'CONVERSE: If ∠AOB = ∠COD, then ΔAOB ≅ ΔCOD by SAS Congruence, so AB = CD.', reason: 'Converse SAS proof.' },
        ],
        mathematicalConclusion:
          'Equal chords subtend equal central angles, and conversely, equal central angles correspond to chords of equal length.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_equal_chords_converse',
        title: 'Central Angle to Chord Length',
        question:
          'Two central angles in a circle of radius 6 cm are both measured to be 60°. If the first chord has length 6 cm, what is the length of the second chord?',
        correctAnswer: '6 cm',
        hint: 'By converse of the equal chords theorem, equal central angles subtend chords of equal length.',
        stepByStepSolution: [
          'Both central angles are 60°: ∠AOB = ∠COD = 60°.',
          'By Theorem (Converse of Equal Chords): Chords that subtend equal central angles are equal in length.',
          'Since length of first chord = 6 cm, length of second chord = 6 cm.',
        ],
        theoremApplied: 'Converse of Equal Chords Theorem.',
      },
    ],
  },

  // Experiment 6: Chord Distance Comparison
  {
    id: 'chord-distance-comparison',
    title: '6. Distance of Chords from Center',
    subtitle: '"The Longer Chord is Nearer to the Center" & Equal Chords Equidistant',
    category: 'chords',
    description:
      'Investigate the fundamental distance law: Equal chords are equidistant from the center, and between two unequal chords, the longer chord is strictly nearer to the center (AB > CD ⇔ d₁ < d₂).',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.6 (Theorems 6 to 8): distance of chords from the centre',
    initialScene: {
      circles: [
        {
          id: 'circle_dist',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_dist', angleRad: 0.35, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_dist', angleRad: 2.79, color: '#38bdf8' }, // Long chord
        { id: 'pt_C', name: 'C', circleId: 'circle_dist', angleRad: 3.84, color: '#f59e0b' },
        { id: 'pt_D', name: 'D', circleId: 'circle_dist', angleRad: 4.88, color: '#f59e0b' }, // Short chord
      ],
      chords: [
        { id: 'chord_long', name: 'Chord AB (Long)', circleId: 'circle_dist', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8', showMidpoint: true, showPerpendicular: true },
        { id: 'chord_short', name: 'Chord CD (Short)', circleId: 'circle_dist', pointAId: 'pt_C', pointBId: 'pt_D', color: '#f59e0b', showMidpoint: true, showPerpendicular: true },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_longer_chord_nearer_center',
        title: 'Longer Chord is Nearer to Center',
        statement:
          'Of any two chords in a circle, the longer chord is nearer to the center (AB > CD ⇔ d(O, AB) < d(O, CD)). Equal chords are equidistant from the center.',
        hypothesis: 'If length(AB) > length(CD), then distance(O, AB) < distance(O, CD).',
        instructions:
          'Drag the endpoints of chord AB and chord CD. Compare their lengths and perpendicular distances. Notice that as a chord approaches the center (diameter), its length reaches a maximum (2r = 9.0) and distance becomes 0.',
        predictionQuestion: {
          question: 'In a circle of radius 5 cm, chord AB = 8 cm and chord CD = 6 cm. Which chord is closer to the center?',
          options: ['Chord AB (8 cm)', 'Chord CD (6 cm)', 'Both are at equal distance'],
          correctIndex: 0,
          explanation:
            'By the Distance Theorem, the longer chord is nearer to the center. AB (8 cm) is longer than CD (6 cm), so AB is closer to the center.',
        },
        proofSteps: [
          { statement: 'In any chord of length L in a circle of radius r, let d be perpendicular distance from center.', reason: 'Construction.' },
          { statement: 'By Pythagoras: r² = d² + (L/2)² => d² = r² - (L/2)².', reason: 'Pythagorean relation on right triangle.' },
          { statement: 'Since r is constant for the circle, as chord length L increases, (L/2)² increases.', reason: 'Monotonic function.' },
          { statement: 'Therefore, r² - (L/2)² decreases, which means d² decreases, so distance d decreases.', reason: 'Algebraic inequality.' },
          { statement: 'When L = 2r (diameter), d = 0 (passes directly through center). When L = CD, d₁ = d₂.', reason: 'Boundary conditions.' },
        ],
        mathematicalConclusion:
          'Chord distance is inversely related to chord length: the longest chord (diameter) has distance 0, and equal chords are strictly equidistant.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_chord_distance_calc',
        title: 'Comparing Distances of Chords',
        question:
          'In a circle of radius 10 cm, chord AB has length 16 cm and chord CD has length 12 cm. Find their respective perpendicular distances from the center.',
        correctAnswer: '6 cm, 8 cm',
        hint: 'Use d = √(r² - (L/2)²). For AB, L/2 = 8. For CD, L/2 = 6.',
        stepByStepSolution: [
          'For chord AB (length 16 cm): Half-length = 8 cm. Distance d₁ = √(10² - 8²) = √(100 - 64) = √36 = 6 cm.',
          'For chord CD (length 12 cm): Half-length = 6 cm. Distance d₂ = √(10² - 6²) = √(100 - 36) = √64 = 8 cm.',
          'Notice d₁ (6 cm) < d₂ (8 cm): the longer chord is indeed nearer to the center.',
        ],
        theoremApplied: 'Pythagorean chord distance theorem.',
      },
    ],
  },

  // ==========================================
  // UNIT 3: ANGLES & THEOREMS
  // ==========================================

  // Experiment 7: Central & Inscribed Angles
  {
    id: 'angles-in-a-circle',
    title: '7. Central & Inscribed Angles',
    subtitle: 'Central Angle = 2 × Inscribed Angle & Angle in Semicircle = 90°',
    category: 'angles_theorems',
    description:
      'Discover why the angle subtended by an arc at the center is double the angle subtended by it at the circumference (∠AOB = 2 × ∠APB), and why an angle inscribed in a semicircle is strictly 90°.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.7 (Theorem 9): angle subtended by an arc',
    initialScene: {
      circles: [
        {
          id: 'circle_angles',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_angles', angleRad: 3.8, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_angles', angleRad: 5.6, color: '#38bdf8' },
        { id: 'pt_P', name: 'P', circleId: 'circle_angles', angleRad: 1.57, color: '#f59e0b' },
      ],
      chords: [
        { id: 'ch_AB', name: 'Base Arc AB', circleId: 'circle_angles', pointAId: 'pt_A', pointBId: 'pt_B', color: '#64748b' },
      ],
      radiusDiameters: [],
      angles: [
        { id: 'ang_central', name: 'Central ∠AOB', circleId: 'circle_angles', point1Id: 'pt_A', vertexId: 'center', point2Id: 'pt_B', isCentral: true, color: '#38bdf8' },
        { id: 'ang_inscribed', name: 'Inscribed ∠APB', circleId: 'circle_angles', point1Id: 'pt_A', vertexId: 'pt_P', point2Id: 'pt_B', isCentral: false, color: '#f59e0b' },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_central_double_inscribed',
        title: 'Central Angle Theorem',
        statement:
          'The angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle (∠AOB = 2 · ∠APB).',
        hypothesis: 'For any arc AB, ∠AOB = 2 · ∠APB.',
        instructions:
          'Drag vertex P along the upper circumference. Notice that while P moves, inscribed angle ∠APB stays constant, and central angle ∠AOB is always exactly twice ∠APB!',
        predictionQuestion: {
          question: 'If the central angle ∠AOB is measured to be 100°, what is the inscribed angle ∠APB?',
          options: ['50°', '100°', '200°'],
          correctIndex: 0,
          explanation: 'The inscribed angle is half of the central angle: 100° / 2 = 50°.',
        },
        proofSteps: [
          { statement: 'Join vertex P to center O and extend it to a point D.', reason: 'Construction.' },
          { statement: 'In ΔOAP: OA = OP (radii), so ΔOAP is isosceles and ∠OAP = ∠OPA.', reason: 'Angles opposite equal sides.' },
          { statement: 'Exterior angle ∠AOD = ∠OAP + ∠OPA = 2 · ∠OPA.', reason: 'Exterior Angle Theorem.' },
          { statement: 'Similarly in ΔOBP: exterior angle ∠BOD = 2 · ∠OPB.', reason: 'Exterior Angle Theorem.' },
          { statement: 'Adding both equations: ∠AOD + ∠BOD = 2(∠OPA + ∠OPB) => ∠AOB = 2 · ∠APB.', reason: 'Angle addition.' },
        ],
        mathematicalConclusion:
          'The central angle is universally double the inscribed angle subtended by the same arc.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q3_inscribed_calc',
        title: 'Calculate Inscribed Angle',
        question:
          'In a circle, arc AB subtends an angle of 110° at the center O. Find the angle subtended by this arc at a point P on the remaining part of the circle.',
        correctAnswer: '55°',
        hint: '∠APB = (1/2) × ∠AOB.',
        stepByStepSolution: [
          'Given: Central angle ∠AOB = 110°.',
          'By Central Angle Theorem: ∠APB = (1/2) × ∠AOB = 110° / 2 = 55°.',
        ],
        theoremApplied: 'Angle subtended at center is double the angle at circumference.',
      },
    ],
  },

  // Experiment 8: Angles in the Same Segment
  {
    id: 'angles-in-same-segment',
    title: '8. Angles in the Same Segment',
    subtitle: 'Angles Inscribed in the Same Segment are Strictly Equal',
    category: 'angles_theorems',
    description:
      'Investigate why all inscribed angles that share the same base chord and reside in the same segment of a circle are congruent (∠APB = ∠AQB).',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.7: angles in the same arc segment (a consequence of Theorem 9)',
    initialScene: {
      circles: [
        {
          id: 'circle_seg',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_seg', angleRad: 3.8, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_seg', angleRad: 5.6, color: '#38bdf8' },
        { id: 'pt_P', name: 'P', circleId: 'circle_seg', angleRad: 1.3, color: '#f59e0b' },
        { id: 'pt_Q', name: 'Q', circleId: 'circle_seg', angleRad: 2.3, color: '#a855f7' },
      ],
      chords: [
        { id: 'ch_AB', name: 'Common Base AB', circleId: 'circle_seg', pointAId: 'pt_A', pointBId: 'pt_B', color: '#64748b' },
      ],
      radiusDiameters: [],
      angles: [
        { id: 'ang_P', name: 'Inscribed ∠APB', circleId: 'circle_seg', point1Id: 'pt_A', vertexId: 'pt_P', point2Id: 'pt_B', isCentral: false, color: '#f59e0b' },
        { id: 'ang_Q', name: 'Inscribed ∠AQB', circleId: 'circle_seg', point1Id: 'pt_A', vertexId: 'pt_Q', point2Id: 'pt_B', isCentral: false, color: '#a855f7' },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_angles_same_segment_equal',
        title: 'Angles in the Same Segment are Equal',
        statement:
          'Angles in the same segment of a circle are equal (∠APB = ∠AQB for any points P, Q on the same arc).',
        hypothesis: 'Any two points P and Q on the same arc subtend identical angles from base AB.',
        instructions:
          'Drag point P or point Q anywhere along the major arc. Watch the degree readouts for ∠APB and ∠AQB remain exactly identical!',
        predictionQuestion: {
          question: 'Points P and Q lie in the same segment of a circle subtended by chord AB. If ∠APB = 42°, what is ∠AQB?',
          options: ['42°', '84°', '138°'],
          correctIndex: 0,
          explanation: 'Angles in the same segment of a circle are equal, so ∠AQB = ∠APB = 42°.',
        },
        proofSteps: [
          { statement: 'Let arc AB subtend central angle ∠AOB at center O.', reason: 'Construction.' },
          { statement: 'By the Central Angle Theorem, ∠AOB = 2 · ∠APB.', reason: 'Theorem 9: the angle at the centre is twice the angle on the circle.' },
          { statement: 'Similarly, ∠AOB = 2 · ∠AQB.', reason: 'Theorem 9: the angle at the centre is twice the angle on the circle.' },
          { statement: 'Therefore: 2 · ∠APB = 2 · ∠AQB => ∠APB = ∠AQB.', reason: 'Algebraic division by 2.' },
        ],
        mathematicalConclusion:
          'All angles subtended by a chord in the same segment are congruent because each is exactly half of the invariant central angle.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_same_segment_algebra',
        title: 'Algebraic Angle Equality in Same Segment',
        question:
          'In a circle, angles in the same segment are given by ∠APB = (3x + 10)° and ∠AQB = (5x - 20)°. Find the value of x and the measure of each angle.',
        correctAnswer: 'x = 15, 55°',
        hint: 'Equate 3x + 10 = 5x - 20 because angles in the same segment are equal.',
        stepByStepSolution: [
          'Since angles in the same segment are equal: 3x + 10 = 5x - 20.',
          'Subtract 3x from both sides: 10 = 2x - 20.',
          'Add 20 to both sides: 2x = 30 => x = 15.',
          'Substitute x = 15: ∠APB = 3(15) + 10 = 45 + 10 = 55°.',
          'Verify ∠AQB = 5(15) - 20 = 75 - 20 = 55°.',
        ],
        theoremApplied: 'Angles in the same segment are equal.',
      },
    ],
  },

  // Experiment 9: Cyclic Quadrilaterals
  {
    id: 'cyclic-quadrilaterals',
    title: '9. Cyclic Quadrilaterals',
    subtitle: 'Opposite Angles Sum to 180° (Supplementary)',
    category: 'angles_theorems',
    description:
      'Investigate the properties of quadrilaterals whose four vertices all lie on a single circle. Discover why opposite angles must strictly sum to 180° (∠A + ∠C = 180° and ∠B + ∠D = 180°).',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.8 (Theorem 11): cyclic quadrilaterals',
    initialScene: {
      circles: [
        {
          id: 'circle_quad',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_quad', angleRad: 0.6, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_quad', angleRad: 1.8, color: '#f59e0b' },
        { id: 'pt_C', name: 'C', circleId: 'circle_quad', angleRad: 3.4, color: '#10b981' },
        { id: 'pt_D', name: 'D', circleId: 'circle_quad', angleRad: 4.9, color: '#a855f7' },
      ],
      chords: [
        { id: 'side_AB', name: 'Side AB', circleId: 'circle_quad', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8' },
        { id: 'side_BC', name: 'Side BC', circleId: 'circle_quad', pointAId: 'pt_B', pointBId: 'pt_C', color: '#f59e0b' },
        { id: 'side_CD', name: 'Side CD', circleId: 'circle_quad', pointAId: 'pt_C', pointBId: 'pt_D', color: '#10b981' },
        { id: 'side_DA', name: 'Side DA', circleId: 'circle_quad', pointAId: 'pt_D', pointBId: 'pt_A', color: '#a855f7' },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [
        {
          id: 'quad_ABCD',
          name: 'Cyclic Quad ABCD',
          circleId: 'circle_quad',
          pointAId: 'pt_A',
          pointBId: 'pt_B',
          pointCId: 'pt_C',
          pointDId: 'pt_D',
          color: '#38bdf8',
        },
      ],
    },
    theorems: [
      {
        id: 'thm_cyclic_quad_supplementary',
        title: 'Opposite Angles of a Cyclic Quadrilateral',
        statement:
          'The sum of either pair of opposite angles of a cyclic quadrilateral is 180° (∠A + ∠C = 180° and ∠B + ∠D = 180°).',
        hypothesis: 'If vertices A, B, C, D lie on circle O, then ∠DAB + ∠BCD = 180°.',
        instructions:
          'Drag any vertex (A, B, C, or D) around the circle. Watch the individual angle readouts change while their opposite sum remains exactly 180.0°!',
        predictionQuestion: {
          question: 'If in a cyclic quadrilateral ABCD, ∠A = 70°, what is the opposite angle ∠C?',
          options: ['70°', '110°', '180°'],
          correctIndex: 1,
          explanation: 'Opposite angles of a cyclic quadrilateral sum to 180°: ∠C = 180° - 70° = 110°.',
        },
        proofSteps: [
          { statement: 'Join center O to vertices B and D to form central angles ∠BOD and reflex ∠BOD.', reason: 'Construction.' },
          { statement: 'Central angle ∠BOD subtended by arc BCD is 2 · ∠BAD (or 2 · ∠A).', reason: 'Central Angle Theorem.' },
          { statement: 'Reflex central angle ∠BOD subtended by arc BAD is 2 · ∠BCD (or 2 · ∠C).', reason: 'Central Angle Theorem.' },
          { statement: 'The sum of an angle and its reflex angle around center O is 360°: ∠BOD + reflex ∠BOD = 360°.', reason: 'Complete turn around a point.' },
          { statement: 'Therefore: 2 · ∠A + 2 · ∠C = 360° => ∠A + ∠C = 180°.', reason: 'Divide by 2.' },
        ],
        mathematicalConclusion:
          'In any quadrilateral inscribed in a circle, opposite angles are strictly supplementary.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q4_cyclic_find_angle',
        title: 'Find Opposite Angles',
        question:
          'ABCD is a cyclic quadrilateral. If ∠B = 105° and ∠A = 80°, find the measure of angles ∠D and ∠C.',
        correctAnswer: '∠D = 75°, ∠C = 100°',
        hint: 'Opposite angles sum to 180°: ∠B + ∠D = 180° and ∠A + ∠C = 180°.',
        stepByStepSolution: [
          '∠B and ∠D are opposite angles => ∠B + ∠D = 180° => 105° + ∠D = 180° => ∠D = 75°.',
          '∠A and ∠C are opposite angles => ∠A + ∠C = 180° => 80° + ∠C = 180° => ∠C = 100°.',
        ],
        theoremApplied: 'Opposite angles of a cyclic quadrilateral are supplementary.',
      },
    ],
  },

  // Experiment 10: Concyclicity & Converses
  {
    id: 'concyclicity-and-converses',
    title: '10. Concyclicity & Converses',
    subtitle: 'Converses of Cyclic Quad & Same-Segment Theorems',
    category: 'angles_theorems',
    description:
      'Investigate the converse theorems: If the sum of opposite angles of a quadrilateral is 180°, it is cyclic. Also explore when two equal angles subtended by a common segment imply concyclicity.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.8 (Theorems 10 and 12): concyclicity and converses',
    initialScene: {
      circles: [
        {
          id: 'circle_conv',
          name: 'Target Circumcircle',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#10b981',
          fillAlpha: 0.04,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_conv', angleRad: 0.6, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_conv', angleRad: 1.8, color: '#f59e0b' },
        { id: 'pt_C', name: 'C', circleId: 'circle_conv', angleRad: 3.4, color: '#10b981' },
        { id: 'pt_D', name: 'D (Movable)', circleId: 'circle_conv', angleRad: 4.9, color: '#ec4899' },
      ],
      chords: [
        { id: 's_AB', name: 'Side AB', circleId: 'circle_conv', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8' },
        { id: 's_BC', name: 'Side BC', circleId: 'circle_conv', pointAId: 'pt_B', pointBId: 'pt_C', color: '#f59e0b' },
        { id: 's_CD', name: 'Side CD', circleId: 'circle_conv', pointAId: 'pt_C', pointBId: 'pt_D', color: '#10b981' },
        { id: 's_DA', name: 'Side DA', circleId: 'circle_conv', pointAId: 'pt_D', pointBId: 'pt_A', color: '#ec4899' },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_cyclic_quad_converse',
        title: 'Converse: Supplementary Opposite Angles Imply Concyclicity',
        statement:
          'If the sum of a pair of opposite angles of a quadrilateral is 180°, then the quadrilateral is cyclic (all four vertices lie on a common circle).',
        hypothesis: 'If ∠A + ∠C = 180° in simple convex quadrilateral ABCD, then D lies on circumcircle(ΔABC).',
        instructions:
          'Drag vertex D. Notice that when D moves off the circle, ∠A + ∠C departs from 180°. When ∠A + ∠C reaches 180°, D lands exactly on the circumcircle!',
        predictionQuestion: {
          question: 'A quadrilateral has opposite angles of 95° and 85°. Does a circle pass through all four vertices?',
          options: ['Yes, it is cyclic because 95° + 85° = 180°', 'No, only squares can be cyclic', 'Only if all sides are equal'],
          correctIndex: 0,
          explanation:
            'By Theorem 12 (the converse of the cyclic quadrilateral theorem), if any pair of opposite angles sums to 180°, the quadrilateral is guaranteed to be cyclic.',
        },
        proofSteps: [
          { statement: 'Let ABCD be a quadrilateral with ∠B + ∠D = 180°.', reason: 'Given hypothesis.' },
          { statement: 'Draw the unique circumcircle through non-collinear vertices A, B, C.', reason: 'Theorem 1: a unique circle passes through three non-collinear points.' },
          { statement: 'Suppose D does not lie on this circle. Then the circle intersects line AD (or CD) at another point D′.', reason: 'Proof by contradiction.' },
          { statement: 'Then ABCD′ is a cyclic quadrilateral, so ∠B + ∠D′ = 180°.', reason: 'Theorem 11: opposite angles of a cyclic quadrilateral add to 180°.' },
          { statement: 'Since ∠B + ∠D = 180° and ∠B + ∠D′ = 180°, we have ∠D = ∠D′.', reason: 'Transitive equality.' },
          { statement: 'In ΔDD′C, exterior angle cannot equal interior opposite angle unless D coincides with D′.', reason: 'Exterior Angle Inequality.' },
          { statement: 'Therefore, point D must lie strictly on the circle.', reason: 'Contradiction resolved.' },
        ],
        mathematicalConclusion:
          'Opposite angle supplementarity is both necessary and sufficient for a quadrilateral to be cyclic.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_concyclicity_test',
        title: 'Concyclicity Evaluation',
        question:
          'In a quadrilateral ABCD, ∠A = 88°, ∠B = 76°, ∠C = 92°, and ∠D = 104°. Is ABCD a cyclic quadrilateral?',
        correctAnswer: 'Yes, it is cyclic',
        hint: 'Check if opposite angle pairs sum to 180°: ∠A + ∠C and ∠B + ∠D.',
        stepByStepSolution: [
          'Opposite pair 1: ∠A + ∠C = 88° + 92° = 180°.',
          'Opposite pair 2: ∠B + ∠D = 76° + 104° = 180°.',
          'Both pairs of opposite angles sum to 180°.',
          'Therefore, by Theorem 12, ABCD is a cyclic quadrilateral.',
        ],
        theoremApplied: 'Converse of Cyclic Quadrilateral Theorem.',
      },
    ],
  },

  // ==========================================
  // UNIT 4: EXTENSIONS & PRACTICE / REVISION
  // ==========================================

  // Experiment 11: Tangents & Radius (Extension)
  {
    id: 'tangents-and-radius',
    title: '11. Tangents & Radius (Extension)',
    subtitle: 'Perpendicular Relationship at Contact Point (OP ⊥ Tangent)',
    category: 'extension',
    description:
      'Explore the line that touches a circle at exactly one point (tangent). Investigate why the tangent at any point on a circle is strictly perpendicular to the radius through the point of contact.',
    curriculumClassification: 'optional_extension',
    ncertTopicReference: 'Not part of this NCERT chapter. Optional extension that bridges to later classes',
    initialScene: {
      circles: [
        {
          id: 'circle_tangent',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.2,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_P', name: 'P (Contact Point)', circleId: 'circle_tangent', angleRad: 0.785, color: '#f59e0b' },
      ],
      chords: [],
      radiusDiameters: [
        {
          id: 'rad_OP',
          name: 'Radius OP',
          circleId: 'circle_tangent',
          type: 'radius',
          pointId: 'pt_P',
          color: '#38bdf8',
        },
      ],
      angles: [],
      tangents: [
        {
          id: 'tangent_P',
          name: 'Tangent Line at P',
          circleId: 'circle_tangent',
          contactPointId: 'pt_P',
          length: 8.0,
          color: '#f59e0b',
        },
      ],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_tangent_radius_perp',
        title: 'Tangent Perpendicular to Radius',
        statement:
          'The tangent at any point of a circle is perpendicular to the radius through the point of contact (OP ⊥ Tangent).',
        hypothesis: 'If line t is tangent to circle O at point P, then OP ⊥ t.',
        instructions:
          'Drag the contact point P around the circle. Notice how the tangent line rotates smoothly to remain perpetually perpendicular to radius OP.',
        predictionQuestion: {
          question: 'What is the angle between the tangent line and the radius at the point of contact?',
          options: ['45°', '90°', '180°'],
          correctIndex: 1,
          explanation: 'The tangent at any point of a circle is perpendicular (90°) to the radius through that point.',
        },
        proofSteps: [
          { statement: 'Let line t be tangent to circle O at point P, and let Q be any point on line t other than P.', reason: 'Hypothesis.' },
          { statement: 'Since line t touches the circle only at P, point Q must lie strictly outside the circle.', reason: 'Definition of tangent.' },
          { statement: 'Therefore, OQ > radius OP for every point Q ≠ P on line t.', reason: 'Q lies in the exterior.' },
          { statement: 'This means OP is the shortest distance from center O to the line t.', reason: 'Minimal distance property.' },
          { statement: 'The shortest distance from a point to a line is always perpendicular.', reason: 'Geometric distance axiom.' },
          { statement: 'Hence, OP ⊥ line t.', reason: 'Conclusion.' },
        ],
        mathematicalConclusion:
          'A tangent line makes a right angle (90°) with the radius drawn to the point of contact.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q5_tangent_length',
        title: 'Tangent Triangle Calculation',
        question:
          'A tangent PQ at a point P of a circle of radius 5 cm meets a line through the center O at a point Q so that OQ = 13 cm. Find the length of PQ.',
        correctAnswer: '12 cm',
        hint: 'ΔOPQ is a right triangle at P with hypotenuse OQ = 13 cm and side OP = 5 cm.',
        stepByStepSolution: [
          'Since tangent is perpendicular to radius: ∠OPQ = 90°.',
          'In right triangle ΔOPQ: OQ² = OP² + PQ² => 13² = 5² + PQ².',
          '169 = 25 + PQ² => PQ² = 144 => PQ = 12 cm.',
        ],
        theoremApplied: 'Tangent-radius perpendicularity + Pythagoras theorem.',
      },
    ],
  },

  // Experiment 12: Theorem Investigation & Guided Proofs
  {
    id: 'theorem-proof-lab',
    title: '12. Theorem Investigation & Guided Proofs',
    subtitle: 'Comprehensive NCERT Proof Walkthroughs with Deductive Steps',
    category: 'practice_revision',
    description:
      'Step-by-step interactive proofs combining prediction, dynamic manipulation, mathematical reasoning, and practice for all Class 9 circle theorems.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'Synthesis of Theorems 1 to 12 of NCERT Ganita Manjari Grade 9, Part I, Chapter 5',
    initialScene: {
      circles: [
        {
          id: 'circle_theorems',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 4.5,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_theorems', angleRad: 3.6, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_theorems', angleRad: 5.8, color: '#38bdf8' },
        { id: 'pt_P', name: 'P', circleId: 'circle_theorems', angleRad: 1.57, color: '#f59e0b' },
      ],
      chords: [
        { id: 'ch_AB', name: 'Chord AB', circleId: 'circle_theorems', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8', showMidpoint: true, showPerpendicular: true },
      ],
      radiusDiameters: [],
      angles: [
        { id: 'ang_central', name: 'Central ∠AOB', circleId: 'circle_theorems', point1Id: 'pt_A', vertexId: 'center', point2Id: 'pt_B', isCentral: true, color: '#38bdf8' },
        { id: 'ang_inscribed', name: 'Inscribed ∠APB', circleId: 'circle_theorems', point1Id: 'pt_A', vertexId: 'pt_P', point2Id: 'pt_B', isCentral: false, color: '#f59e0b' },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_synth_1',
        title: 'Axiomatic Synthesis of Class 9 Circle Theorems',
        statement:
          'Euclidean circle geometry derives all properties from radial invariance, isosceles radial triangles, and congruence criteria (SSS, SAS, RHS).',
        hypothesis: 'Any chord property or arc angle property is algebraically deducible from triangle congruence.',
        instructions:
          'Drag point P or base points A and B. Verify the 2:1 ratio holds mathematically across all valid positions on the major arc.',
        predictionQuestion: {
          question: 'If inscribed angle ∠APB is 60°, what must the central angle ∠AOB be?',
          options: ['30°', '60°', '120°'],
          correctIndex: 2,
          explanation: '∠AOB = 2 × 60° = 120°.',
        },
        proofSteps: [
          { statement: 'Connect P to O and produce line to D.', reason: 'Construction.' },
          { statement: 'Exterior angle ∠AOD = 2 · ∠OPA in isosceles ΔOAP.', reason: 'Exterior Angle = sum of opposite interior angles.' },
          { statement: 'Exterior angle ∠BOD = 2 · ∠OPB in isosceles ΔOBP.', reason: 'Exterior Angle Theorem.' },
          { statement: 'Summing: ∠AOD + ∠BOD = 2(∠OPA + ∠OPB) => ∠AOB = 2 · ∠APB.', reason: 'Angle addition.' },
        ],
        mathematicalConclusion: 'This foundational theorem establishes the central:inscribed 2:1 angle invariance.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q6_proof_challenge',
        title: 'Class 9 Circle Reasoning Challenge',
        question:
          'In a circle with center O, chords AB and CD are equal. If distance of AB from center is 5 cm, what is the distance of CD from center?',
        correctAnswer: '5 cm',
        hint: 'Equal chords of a circle are equidistant from the center.',
        stepByStepSolution: [
          'Given: Chords AB = CD.',
          'By Theorem: Equal chords of a circle are equidistant from the center.',
          'Therefore: Distance of CD from center = Distance of AB from center = 5 cm.',
        ],
        theoremApplied: 'Equal chords equidistant theorem.',
      },
    ],
  },

  // Experiment 13: Chapter Practice & Revision Challenge
  {
    id: 'chapter-practice-revision',
    title: '13. Chapter Practice & Revision Challenge',
    subtitle: 'Comprehensive NCERT Ganita Manjari Examination Questions',
    category: 'practice_revision',
    description:
      'Grand Class 9 Circles synthesis: Solve rigorous numerical, chord distance, central angle, same-segment, and cyclic quadrilateral exam questions with tolerance-checked validation.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'Review of NCERT Ganita Manjari Grade 9, Part I, Chapter 5 (questions are original)',
    initialScene: {
      circles: [
        {
          id: 'circle_rev',
          name: 'Circle O',
          center: { x: 0, y: 0 },
          radius: 5.0,
          color: '#38bdf8',
          fillAlpha: 0.05,
        },
      ],
      circumferencePoints: [
        { id: 'pt_A', name: 'A', circleId: 'circle_rev', angleRad: 0.6, color: '#38bdf8' },
        { id: 'pt_B', name: 'B', circleId: 'circle_rev', angleRad: 2.2, color: '#f59e0b' },
        { id: 'pt_C', name: 'C', circleId: 'circle_rev', angleRad: 3.5, color: '#10b981' },
        { id: 'pt_D', name: 'D', circleId: 'circle_rev', angleRad: 5.0, color: '#a855f7' },
      ],
      chords: [
        { id: 'ch_AB', name: 'Chord AB', circleId: 'circle_rev', pointAId: 'pt_A', pointBId: 'pt_B', color: '#38bdf8', showMidpoint: true, showPerpendicular: true },
        { id: 'ch_CD', name: 'Chord CD', circleId: 'circle_rev', pointAId: 'pt_C', pointBId: 'pt_D', color: '#10b981', showMidpoint: true, showPerpendicular: true },
      ],
      radiusDiameters: [],
      angles: [],
      tangents: [],
      cyclicQuads: [
        {
          id: 'quad_ABCD',
          name: 'Cyclic Quad ABCD',
          circleId: 'circle_rev',
          pointAId: 'pt_A',
          pointBId: 'pt_B',
          pointCId: 'pt_C',
          pointDId: 'pt_D',
          color: '#38bdf8',
        },
      ],
    },
    theorems: [
      {
        id: 'thm_rev_synthesis',
        title: 'Mastery Synthesis of Class 9 Circles',
        statement:
          'Mastery of Class 9 Circles requires fluent integration of chord perpendicular bisectors, equal chord central angles, chord distance comparisons, arc angle ratios, and cyclic quadrilaterals.',
        hypothesis: 'All Class 9 circle theorems form a coherent deductive network.',
        instructions:
          'Test various combinations on the canvas and solve the practice problems to achieve full chapter certification.',
        predictionQuestion: {
          question: 'If chord AB = 8 cm in a circle of radius 5 cm, and chord CD is 4 cm away from center, which chord is longer?',
          options: ['Chord AB (8 cm)', 'Chord CD', 'Both are equal in length'],
          correctIndex: 0,
          explanation:
            'For chord AB, its distance from center is √(5² - 4²) = 3 cm. Since AB has distance 3 cm and CD has distance 4 cm, AB is closer to center and thus longer than CD (whose length is 2√(5² - 4²) = 6 cm).',
        },
        proofSteps: [
          { statement: 'd(O, AB) = √(5² - (8/2)²) = √(25 - 16) = 3 cm.', reason: 'Pythagoras on AB.' },
          { statement: 'L(CD) = 2 · √(5² - 4²) = 2 · √(25 - 16) = 6 cm.', reason: 'Pythagoras on CD.' },
          { statement: 'Since 3 cm < 4 cm, chord AB is nearer to center, confirming AB > CD (8 cm > 6 cm).', reason: 'Distance theorem.' },
        ],
        mathematicalConclusion: 'Analytical geometry perfectly corroborates Euclidean deductive theorems.',
      },
    ],
    practiceQuestions: [
      {
        id: 'q_rev_cyclic_combo',
        title: 'Cyclic Quad & Inscribed Angle Combo',
        question:
          'In cyclic quadrilateral ABCD, if ∠DAB = 75° and ∠ABC = 85°, find the measures of ∠BCD and ∠CDA.',
        correctAnswer: '∠BCD = 105°, ∠CDA = 95°',
        hint: 'Opposite angles are supplementary: ∠DAB + ∠BCD = 180° and ∠ABC + ∠CDA = 180°.',
        stepByStepSolution: [
          '∠BCD = 180° - ∠DAB = 180° - 75° = 105°.',
          '∠CDA = 180° - ∠ABC = 180° - 85° = 95°.',
          'Therefore: ∠BCD = 105° and ∠CDA = 95°.',
        ],
        theoremApplied: 'Opposite angles of cyclic quadrilateral are supplementary.',
      },
    ],
  },
];
