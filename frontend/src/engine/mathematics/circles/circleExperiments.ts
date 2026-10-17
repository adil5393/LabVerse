/**
 * Experiment Catalog & Curriculum Registry for Class 9 Circles Laboratory
 *
 * Implements:
 * - 6 interactive experiments with canonical scenes
 * - NCERT Ganita Manjari alignment
 * - Guided theorem investigations with prediction, manipulation, observations, and proofs
 * - Class 9 practice questions with step-by-step mathematical solutions
 */

import type { CircleExperimentDefinition } from './types';

export const CIRCLE_EXPERIMENTS: CircleExperimentDefinition[] = [
  // Experiment 1: Understanding a Circle
  {
    id: 'understanding-circle',
    title: '1. Understanding a Circle',
    subtitle: 'Center, Radius, Diameter, Chords & Arcs',
    description:
      'Explore the fundamental anatomy of a circle: how center and radius determine points on the plane, how diameters are the longest chords, and how circumference scales with radius.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Class 9 Chapter: Circles — Basic Terms & Definitions',
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
        title: 'Definition of a Circle',
        statement:
          'A circle is the collection of all points in a plane which are at a fixed distance (radius) from a fixed point (center).',
        hypothesis: 'Any point P on the circumference satisfies distance(O, P) = r.',
        instructions:
          'Drag point A or B around the circle. Notice that their distance from the origin O(0,0) remains exactly equal to the radius 4.0 units.',
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

  // Experiment 2: Chords and Their Properties
  {
    id: 'chords-and-properties',
    title: '2. Chords & Their Properties',
    subtitle: 'Perpendicular Bisectors & Equidistant Chords',
    description:
      'Investigate the famous theorem: The perpendicular from the center of a circle to a chord bisects the chord, and equal chords are equidistant from the center.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Class 9 Theorem: Perpendicular from the Centre to a Chord',
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
        { id: 'pt_C', name: 'C', circleId: 'circle_chords', angleRad: 3.5, color: '#10b981' },
        { id: 'pt_D', name: 'D', circleId: 'circle_chords', angleRad: 5.1, color: '#10b981' },
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
        {
          id: 'chord_2',
          name: 'Chord CD',
          circleId: 'circle_chords',
          pointAId: 'pt_C',
          pointBId: 'pt_D',
          color: '#10b981',
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
          'The perpendicular from the center of a circle to a chord bisects the chord (AM = MB).',
        hypothesis: 'If OM ⊥ AB where O is the center, then AM = MB.',
        instructions:
          'Drag point A or B to change chord length. Observe that segment OM remains strictly perpendicular to chord AB and M divides AB into two equal segments.',
        predictionQuestion: {
          question: 'If chord AB has length 6 cm and center O is 4 cm away from M, what is AM?',
          options: ['2 cm', '3 cm', '4 cm'],
          correctIndex: 1,
          explanation: 'The perpendicular from the center bisects the chord: AM = AB / 2 = 6 / 2 = 3 cm.',
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
      {
        id: 'thm_equal_chords_equidistant',
        title: 'Equal Chords are Equidistant from Center',
        statement:
          'Equal chords of a circle (or of congruent circles) are equidistant from the center.',
        hypothesis: 'If length(AB) = length(CD), then distance(O, AB) = distance(O, CD).',
        instructions:
          'Adjust chord CD until its length matches chord AB. Watch the distance readouts from center O become equal.',
        predictionQuestion: {
          question: 'Two chords of a circle are each 8 cm long. What can you say about their distances from the center?',
          options: [
            'They are equidistant from the center',
            'One is closer to the center than the other',
            'Their distances sum to the radius',
          ],
          correctIndex: 0,
          explanation:
            'By the Equal Chords Theorem, chords of equal length in the same circle are equidistant from the center.',
        },
        proofSteps: [
          { statement: 'Let chords AB = CD. Draw perpendiculars OL ⊥ AB and OM ⊥ CD.', reason: 'Construction.' },
          { statement: 'AL = AB / 2 and CM = CD / 2 (perpendicular bisects chord).', reason: 'Theorem 1.' },
          { statement: 'Since AB = CD, AL = CM.', reason: 'Halves of equal quantities are equal.' },
          { statement: 'In right triangles ΔOLA and ΔOMC: OA = OC = r (radii), and AL = CM.', reason: 'Established.' },
          { statement: 'ΔOLA ≅ ΔOMC by RHS Congruence.', reason: 'RHS Criterion.' },
          { statement: 'Therefore, OL = OM.', reason: 'CPCTC.' },
        ],
        mathematicalConclusion:
          'Chords of equal length are located at the exact same perpendicular distance from the center.',
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

  // Experiment 3: Angles in a Circle
  {
    id: 'angles-in-a-circle',
    title: '3. Angles Subtended by Arcs',
    subtitle: 'Central Angle = 2 × Inscribed Angle & Angles in Same Segment',
    description:
      'Discover why the angle subtended by an arc at the center is double the angle subtended by it at the circumference, why angles in the same segment are equal, and why the angle in a semicircle is 90°.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Class 9 Theorem: Angle Subtended by an Arc of a Circle',
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
        { id: 'pt_A', name: 'A', circleId: 'circle_angles', angleRad: 3.8, color: '#38bdf8' }, // Bottom left
        { id: 'pt_B', name: 'B', circleId: 'circle_angles', angleRad: 5.6, color: '#38bdf8' }, // Bottom right
        { id: 'pt_P', name: 'P', circleId: 'circle_angles', angleRad: 1.57, color: '#f59e0b' }, // Top vertex
        { id: 'pt_Q', name: 'Q', circleId: 'circle_angles', angleRad: 2.35, color: '#a855f7' }, // Second inscribed vertex
      ],
      chords: [
        { id: 'ch_AB', name: 'Arc Base AB', circleId: 'circle_angles', pointAId: 'pt_A', pointBId: 'pt_B', color: '#64748b' },
      ],
      radiusDiameters: [],
      angles: [
        {
          id: 'ang_central',
          name: 'Central ∠AOB',
          circleId: 'circle_angles',
          point1Id: 'pt_A',
          vertexId: 'center',
          point2Id: 'pt_B',
          isCentral: true,
          color: '#38bdf8',
        },
        {
          id: 'ang_inscribed_P',
          name: 'Inscribed ∠APB',
          circleId: 'circle_angles',
          point1Id: 'pt_A',
          vertexId: 'pt_P',
          point2Id: 'pt_B',
          isCentral: false,
          color: '#f59e0b',
        },
        {
          id: 'ang_inscribed_Q',
          name: 'Inscribed ∠AQB',
          circleId: 'circle_angles',
          point1Id: 'pt_A',
          vertexId: 'pt_Q',
          point2Id: 'pt_B',
          isCentral: false,
          color: '#a855f7',
        },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_central_double_inscribed',
        title: 'Central Angle Theorem',
        statement:
          'The angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle (∠AOB = 2 × ∠APB).',
        hypothesis: 'For any arc AB, ∠AOB = 2 · ∠APB.',
        instructions:
          'Drag point P around the upper circumference. Notice that while P moves, ∠APB stays constant, and the central angle ∠AOB is always exactly twice ∠APB!',
        predictionQuestion: {
          question: 'If the central angle ∠AOB is measured to be 80°, what is the inscribed angle ∠APB?',
          options: ['40°', '80°', '160°'],
          correctIndex: 0,
          explanation: 'The inscribed angle is half of the central angle: 80° / 2 = 40°.',
        },
        proofSteps: [
          { statement: 'Join vertex P to center O and extend it to a point D.', reason: 'Construction.' },
          { statement: 'In ΔOAP: OA = OP (radii), so ΔOAP is isosceles and ∠OAP = ∠OPA.', reason: 'Angles opposite equal sides.' },
          { statement: 'Exterior angle ∠AOD = ∠OAP + ∠OPA = 2 · ∠OPA.', reason: 'Exterior Angle Theorem.' },
          { statement: 'Similarly in ΔOBP: exterior angle ∠BOD = 2 · ∠OPB.', reason: 'Exterior Angle Theorem.' },
          { statement: 'Adding both equations: ∠AOD + ∠BOD = 2(∠OPA + ∠OPB) => ∠AOB = 2 · ∠APB.', reason: 'Angle addition.' },
        ],
        mathematicalConclusion:
          'The central angle is always double the inscribed angle subtended by the same arc.',
      },
      {
        id: 'thm_angles_same_segment',
        title: 'Angles in the Same Segment are Equal',
        statement: 'Angles in the same segment of a circle are equal (∠APB = ∠AQB).',
        hypothesis: 'Any two points P and Q on the same arc subtend identical angles from base AB.',
        instructions:
          'Compare the readouts for ∠APB and ∠AQB. Drag Q along the major arc: its angle stays identical to ∠APB!',
        predictionQuestion: {
          question: 'Points P and Q lie in the same segment subtended by chord AB. If ∠APB = 35°, what is ∠AQB?',
          options: ['35°', '70°', '145°'],
          correctIndex: 0,
          explanation: 'Angles in the same segment of a circle are equal, so ∠AQB = ∠APB = 35°.',
        },
        proofSteps: [
          { statement: 'Let arc AB subtend ∠AOB at the center.', reason: 'Central Angle.' },
          { statement: '∠AOB = 2 · ∠APB and ∠AOB = 2 · ∠AQB.', reason: 'Central Angle Theorem.' },
          { statement: '2 · ∠APB = 2 · ∠AQB => ∠APB = ∠AQB.', reason: 'Division by 2.' },
        ],
        mathematicalConclusion:
          'All inscribed angles that share the same base chord and reside in the same segment are congruent.',
      },
      {
        id: 'thm_angle_in_semicircle',
        title: 'Angle in a Semicircle is 90°',
        statement: 'The angle subtended by a diameter at any point on the semicircle is a right angle (90°).',
        hypothesis: 'When chord AB is a diameter passing through center O, ∠APB = 90°.',
        instructions:
          'Drag points A and B until AB forms a diameter straight through center O (∠AOB = 180°). Notice that ∠APB becomes exactly 90.0°!',
        predictionQuestion: {
          question: 'If chord AB passes through the center of the circle, what is the value of inscribed angle ∠APB?',
          options: ['45°', '90°', '180°'],
          correctIndex: 1,
          explanation:
            'A diameter subtends a straight angle (180°) at the center. The inscribed angle is half of 180°, which is 90°.',
        },
        proofSteps: [
          { statement: 'Since AB is a diameter, ∠AOB is a straight line angle = 180°.', reason: 'Straight line definition.' },
          { statement: 'By the Central Angle Theorem, ∠AOB = 2 · ∠APB.', reason: 'Theorem 3.' },
          { statement: '180° = 2 · ∠APB => ∠APB = 180° / 2 = 90°.', reason: 'Algebraic evaluation.' },
        ],
        mathematicalConclusion: 'Every triangle inscribed in a semicircle with the diameter as hypotenuse is a right triangle.',
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

  // Experiment 4: Cyclic Quadrilaterals
  {
    id: 'cyclic-quadrilaterals',
    title: '4. Cyclic Quadrilaterals',
    subtitle: 'Opposite Angles Sum to 180° (Supplementary)',
    description:
      'Investigate the properties of quadrilaterals whose four vertices all lie on a single circle. Discover why opposite angles must sum to 180°.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Class 9 Theorem: Cyclic Quadrilaterals',
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
        title: 'Find Opposite Angle',
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

  // Experiment 5: Tangents and Radius (Supporting / Extension for Class 9)
  {
    id: 'tangents-and-radius',
    title: '5. Tangents & Radius (Extension)',
    subtitle: 'Perpendicular Relationship at Contact Point (∠OPT = 90°)',
    description:
      'Explore the line that touches a circle at exactly one point (tangent). Investigate why the tangent at any point on a circle is perpendicular to the radius through the point of contact.',
    curriculumClassification: 'optional_extension',
    ncertTopicReference: 'Supporting / Extension Topic: Introduction to Tangent-Radius Geometry (Bridging Class 9 & Class 10)',
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
          'Drag the contact point P around the circle. Notice how the tangent line rotates to remain perpetually perpendicular to radius OP.',
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

  // Experiment 6: Theorem Investigation & Guided Proofs
  {
    id: 'theorem-proof-lab',
    title: '6. Theorem Investigation & Guided Proofs',
    subtitle: 'Comprehensive NCERT Proof Walkthroughs with Geometric Steps',
    description:
      'Step-by-step interactive proofs combining prediction, dynamic manipulation, mathematical reasoning, and practice for all Class 9 circle theorems.',
    curriculumClassification: 'direct_chapter',
    ncertTopicReference: 'NCERT Class 9 Circles — Complete Theorem Synthesis',
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
        {
          id: 'ang_central',
          name: 'Central ∠AOB',
          circleId: 'circle_theorems',
          point1Id: 'pt_A',
          vertexId: 'center',
          point2Id: 'pt_B',
          isCentral: true,
          color: '#38bdf8',
        },
        {
          id: 'ang_inscribed',
          name: 'Inscribed ∠APB',
          circleId: 'circle_theorems',
          point1Id: 'pt_A',
          vertexId: 'pt_P',
          point2Id: 'pt_B',
          isCentral: false,
          color: '#f59e0b',
        },
      ],
      tangents: [],
      cyclicQuads: [],
    },
    theorems: [
      {
        id: 'thm_synth_1',
        title: 'Theorem: Subtended Angle at Center is 2 × Circumference',
        statement: 'The angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle.',
        hypothesis: '∠AOB = 2 · ∠APB for any arc AB and point P.',
        instructions:
          'Drag point P or base points A and B. Verify the 2:1 ratio holds mathematically across all valid positions.',
        predictionQuestion: {
          question: 'If ∠APB is 60°, what must ∠AOB be?',
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
];
