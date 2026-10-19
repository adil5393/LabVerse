/**
 * NCERT Class 9 Mathematics: Ganita Manjari
 * Chapter: "I'm Up and Down, and Round and Round" (Circles)
 *
 * Curriculum Coverage Registry & Topic Mapping
 * Tracks formal syllabus alignment, theorem statements, converses,
 * activities, and implementation status across the LabVerse Circles Laboratory.
 */

export interface CurriculumTopic {
  id: string;
  sectionNumber: string;
  sectionTitle: string;
  topicTitle: string;
  ncertReference: string;
  statement: string;
  converseStatement?: string;
  category: 'foundations' | 'chords' | 'angles_theorems' | 'practice_revision' | 'extension';
  status: 'fully_implemented' | 'partially_implemented' | 'optional_extension';
  experimentId: string;
  learningOutcomes: string[];
  testSuite: string;
}

export const NCERT_CIRCLES_CURRICULUM_REGISTRY: CurriculumTopic[] = [
  // 1. Foundations & Symmetries
  {
    id: 'ncert_circle_def',
    sectionNumber: '5.1',
    sectionTitle: 'Definitions',
    topicTitle: 'Definition & Anatomy of a Circle',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.1 Definitions',
    statement:
      'A circle is the collection of all points in a plane which are at a fixed distance (radius) from a fixed point (center). Diameter is the longest chord passing through the center.',
    category: 'foundations',
    status: 'fully_implemented',
    experimentId: 'understanding-circle',
    learningOutcomes: [
      'Identify center, radius, diameter, chords, minor/major arcs, sectors, and segments',
      'Verify diameter d = 2r and circumference C = 2πr',
      'Understand circular region and boundary locus',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_circle_symmetry',
    sectionNumber: '5.2',
    sectionTitle: 'Symmetries of a Circle',
    topicTitle: 'Rotational & Reflectional Symmetries',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.2 Symmetries of a Circle',
    statement:
      'A circle possesses infinitely many axes of reflection symmetry (any diameter) and is invariant under rotation by any angle around its center. Chord lengths and radial distances are strictly preserved under all symmetry transformations.',
    category: 'foundations',
    status: 'fully_implemented',
    experimentId: 'symmetry-of-circle',
    learningOutcomes: [
      'Explore why every diameter acts as an axis of bilateral symmetry',
      'Verify continuous rotational invariance around center O',
      'Demonstrate that rotation and reflection preserve chord lengths and subtended angles',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_circles_through_points',
    sectionNumber: '5.3',
    sectionTitle: 'How Many Circles?',
    topicTitle: 'Circles Through 1, 2, and 3 Points (Circumcircle)',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.3 How Many Circles? (Theorem 1)',
    statement:
      'There is one and only one circle passing through three given non-collinear points. For two points, the locus of all possible centers is their perpendicular bisector. No finite circle passes through three collinear points.',
    category: 'foundations',
    status: 'fully_implemented',
    experimentId: 'how-many-circles',
    learningOutcomes: [
      'Observe infinitely many circles through 1 point and 2 points',
      'Identify the perpendicular bisector of segment AB as the locus of centers for circles passing through A and B',
      'Construct the unique circumcircle through 3 non-collinear vertices with circumcenter O where OA = OB = OC',
      'Explore circumcenter location across acute (interior), right (hypotenuse midpoint), and obtuse (exterior) triangles',
      'Demonstrate why collinear points cannot determine a finite circle',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },

  // 2. Chords & Their Properties
  {
    id: 'ncert_perp_bisects_chord',
    sectionNumber: '5.5',
    sectionTitle: 'Midpoints and Perpendicular Bisectors of Chords',
    topicTitle: 'Perpendicular from Center to Chord & Converse',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.5 (Theorems 4 and 5)',
    statement:
      'The perpendicular from the center of a circle to a chord bisects the chord (OM ⊥ AB ⇒ AM = MB).',
    converseStatement:
      'The line drawn through the center of a circle to bisect a chord is perpendicular to the chord (AM = MB ⇒ OM ⊥ AB).',
    category: 'chords',
    status: 'fully_implemented',
    experimentId: 'chords-and-properties',
    learningOutcomes: [
      'Directly manipulate chord endpoints to verify midpoint bisection',
      'Prove RHS congruence between ΔOMA and ΔOMB',
      'Apply Pythagoras theorem: r² = d² + (L/2)²',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_equal_chords_central_angles',
    sectionNumber: '5.4',
    sectionTitle: 'Chords and the Angles They Subtend',
    topicTitle: 'Equal Chords Subtend Equal Angles at the Center & Converse',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.4 (Theorems 2 and 3)',
    statement:
      'Equal chords of a circle (or of congruent circles) subtend equal angles at the center (AB = CD ⇒ ∠AOB = ∠COD).',
    converseStatement:
      'If the angles subtended by the chords of a circle at the center are equal, then the chords are equal (∠AOB = ∠COD ⇒ AB = CD).',
    category: 'chords',
    status: 'fully_implemented',
    experimentId: 'equal-chords-central-angles',
    learningOutcomes: [
      'Manipulate chord lengths and observe corresponding central angles',
      'Verify SSS triangle congruence for Theorem and SAS congruence for Converse',
      'Explore counterexamples when chords are unequal',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_chord_distance_comparison',
    sectionNumber: '5.6',
    sectionTitle: 'Distance of Chords from the Centre',
    topicTitle: 'Equal Chords Equidistant & "Longer Chord is Nearer to Center"',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.6 (Theorems 6, 7 and 8)',
    statement:
      'Equal chords of a circle are equidistant from the center. Of two unequal chords in a circle, the longer chord is nearer to the center (AB > CD ⇔ d(O, AB) < d(O, CD)).',
    converseStatement:
      'Chords equidistant from the center of a circle are equal in length (d₁ = d₂ ⇒ L₁ = L₂).',
    category: 'chords',
    status: 'fully_implemented',
    experimentId: 'chord-distance-comparison',
    learningOutcomes: [
      'Verify that equal chords share identical perpendicular distances from center O',
      'Explore dynamic distance behavior: diameter is closest (d = 0), tiny chords are farthest (d → r)',
      'Derive algebraic proof via Pythagoras: d² = r² - (L/2)²',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },

  // 3. Angles Subtended by Arcs
  {
    id: 'ncert_central_double_inscribed',
    sectionNumber: '5.7',
    sectionTitle: 'Angles Subtended by an Arc',
    topicTitle: 'Central Angle is Double the Inscribed Angle',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.7 (Theorem 9)',
    statement:
      'The angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle (∠AOB = 2 × ∠APB).',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'angles-in-a-circle',
    learningOutcomes: [
      'Verify 2:1 angle ratio for minor arcs, semicircles, and major reflex arcs',
      'Inspect exterior angle proofs on isosceles radial triangles ΔOAP and ΔOBP',
      'Calculate inscribed angles given central angle readouts',
    ],
    testSuite: 'circleTheorems.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_angles_same_segment',
    sectionNumber: '5.7',
    sectionTitle: 'Angles Subtended by an Arc',
    topicTitle: 'Angles in the Same Segment are Equal',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.7 (a consequence of Theorem 9: angles in the same arc segment are equal)',
    statement:
      'Angles in the same segment of a circle are equal (∠APB = ∠AQB for any two points P, Q on the same arc).',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'angles-in-same-segment',
    learningOutcomes: [
      'Drag vertex P anywhere along the major arc while observing angle invariance',
      'Compare second independent vertex Q sharing the identical chord base',
      'Verify corollary: angle in a semicircle is a right angle (90°)',
    ],
    testSuite: 'circleTheorems.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_angle_semicircle',
    sectionNumber: '5.7',
    sectionTitle: 'Angles Subtended by an Arc',
    topicTitle: 'Angle in a Semicircle is 90°',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.7 and an end-of-chapter exercise (angle in a semicircle is 90 degrees)',
    statement:
      'The angle subtended by a diameter at any point on the semicircle is a right angle (90°).',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'angles-in-a-circle',
    learningOutcomes: [
      'Construct a diameter and observe that all inscribed triangles are right-angled',
      'Verify Thales theorem as a special case of central angle (180° / 2 = 90°)',
    ],
    testSuite: 'circleTheorems.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_same_segment_converse',
    sectionNumber: '5.8',
    sectionTitle: 'Concyclicity of Points',
    topicTitle: 'Concyclicity from Equal Angles on Common Segment',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.8 (Theorem 10)',
    statement:
      'If a line segment joining two points subtends equal angles at two other points lying on the same side of the line containing the segment, the four points lie on a circle (they are concyclic).',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'concyclicity-and-converses',
    learningOutcomes: [
      'Test conditions under which equality of angles implies concyclicity',
      'Observe critical geometric requirement: points P and Q must lie on the SAME side of segment AB',
      'Dynamically snap fourth point into position to witness circumcircle emergence',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },

  // 4. Cyclic Quadrilaterals
  {
    id: 'ncert_cyclic_quad_supplementary',
    sectionNumber: '5.8',
    sectionTitle: 'Concyclicity of Points',
    topicTitle: 'Opposite Angles of a Cyclic Quadrilateral are Supplementary',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.8 (Theorem 11)',
    statement:
      'The sum of either pair of opposite angles of a cyclic quadrilateral is 180° (∠A + ∠C = 180° and ∠B + ∠D = 180°).',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'cyclic-quadrilaterals',
    learningOutcomes: [
      'Drag vertices A, B, C, D along circumference and observe constant 180° opposite sums',
      'Follow proof using central angles subtended by complementary arcs: 2A + 2C = 360°',
      'Solve missing angle practice problems for cyclic quadrilaterals',
    ],
    testSuite: 'circleTheorems.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_cyclic_quad_converse',
    sectionNumber: '5.8',
    sectionTitle: 'Concyclicity of Points',
    topicTitle: 'Concyclicity Condition: Supplementary Opposite Angles',
    ncertReference: 'NCERT Ganita Manjari Grade 9, Part I, Chapter 5, Section 5.8 (Theorem 12)',
    statement:
      'If the sum of a pair of opposite angles of a quadrilateral is 180°, the quadrilateral is cyclic.',
    category: 'angles_theorems',
    status: 'fully_implemented',
    experimentId: 'concyclicity-and-converses',
    learningOutcomes: [
      'Manipulate four free plane vertices to adjust opposite angles towards 180°',
      'Observe circumcircle lock in when sum equals 180.0°',
      'Explicitly reject self-intersecting / non-simple quadrilaterals',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },

  // 5. Extensions & Comprehensive Practice
  {
    id: 'ncert_tangent_radius_extension',
    sectionNumber: 'Extension',
    sectionTitle: 'Tangents to a Circle (Bridging Class 9 & 10)',
    topicTitle: 'Tangent Perpendicular to Radius at Contact Point',
    ncertReference: 'Not part of this NCERT chapter. Optional extension that bridges to later classes',
    statement:
      'The tangent at any point of a circle is perpendicular to the radius through the point of contact (OP ⊥ Tangent Line).',
    category: 'extension',
    status: 'optional_extension',
    experimentId: 'tangents-and-radius',
    learningOutcomes: [
      'Understand the definition of a tangent line touching the circle at a single point',
      'Verify that radius OP is the shortest distance from center O to the line',
      'Apply Pythagoras theorem in right-angled tangent-secant triangles',
    ],
    testSuite: 'circleGeometry.test.ts, circleStore.test.ts',
  },
  {
    id: 'ncert_theorem_proof_synthesis',
    sectionNumber: 'Synthesis',
    sectionTitle: 'Deductive Euclidean Proof Laboratory',
    topicTitle: 'Comprehensive Theorem Synthesis & Guided Proofs',
    ncertReference: 'Synthesis of Theorems 1 to 12 of NCERT Ganita Manjari Grade 9, Part I, Chapter 5',
    statement:
      'Euclidean geometric deduction combines given conditions, auxiliary constructions, triangle congruence criteria (RHS, SSS, SAS), and angle invariants to prove circle properties universally.',
    category: 'practice_revision',
    status: 'fully_implemented',
    experimentId: 'theorem-proof-lab',
    learningOutcomes: [
      'Step through structured mathematical proofs with explicit statements and reasons',
      'Distinguish student experimental evidence from deductive Euclidean proof',
      'Formulate predictions before testing hypotheses geometrically',
    ],
    testSuite: 'circleTheorems.test.ts',
  },
  {
    id: 'ncert_chapter_practice_revision',
    sectionNumber: 'Practice & Revision',
    sectionTitle: 'Chapter Practice & Revision Challenge',
    topicTitle: 'NCERT Chapter Examination & Numerical Mastery',
    ncertReference: 'Practice on the topics of NCERT Ganita Manjari Grade 9, Part I, Chapter 5 (questions are original)',
    statement:
      'Solve rigorous numerical, geometric, and reasoning problems covering all theorems, converses, chord distances, arc subtended angles, and cyclic quadrilaterals.',
    category: 'practice_revision',
    status: 'fully_implemented',
    experimentId: 'chapter-practice-revision',
    learningOutcomes: [
      'Calculate unknown chord lengths, radii, and perpendicular distances using Pythagoras',
      'Evaluate subtended central and inscribed angles across multiple configurations',
      'Verify concyclicity and cyclic quadrilateral angle properties under exam-level rigor',
    ],
    testSuite: 'circleStore.test.ts',
  },
];
