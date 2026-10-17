/**
 * NCERT Class 9 Circles: Guided Chapter Learning Path
 * Milestone M2.5
 *
 * Implements the complete sequence of 12 Core Guided Lessons + 1 Optional Extension
 * across 4 Curriculum Units, directly mapping to canonical experiments, staged investigations,
 * progressive tool introduction, and authoritative practice questions.
 */

import type {
  GuidedChapterCurriculum,
  GuidedUnitDefinition,
  GuidedLessonDefinition,
} from '../guidedLearning/types';

export const CIRCLES_GUIDED_UNITS: GuidedUnitDefinition[] = [
  {
    id: 'unit-1-foundations',
    unitNumber: 1,
    title: 'Unit 1 — Foundations & Symmetries',
    badge: 'Lessons 1 – 3',
    description:
      'Master circle anatomy, center, radius, diameter, chords, arcs, reflection/rotation symmetries, and the circumcircle theorem.',
    lessonIds: ['circles-l1', 'circles-l2', 'circles-l3'],
  },
  {
    id: 'unit-2-chords',
    unitNumber: 2,
    title: 'Unit 2 — Chords & Distances',
    badge: 'Lessons 4 – 6',
    description:
      'Investigate perpendicular bisector relationships, equal chords subtending equal central angles, and distance laws derived from Pythagoras.',
    lessonIds: ['circles-l4', 'circles-l5', 'circles-l6'],
  },
  {
    id: 'unit-3-angles',
    unitNumber: 3,
    title: 'Unit 3 — Angles & Theorems',
    badge: 'Lessons 7 – 10',
    description:
      'Discover the central vs inscribed 2:1 angle theorem, angles in the same segment, cyclic quadrilaterals, and converse concyclicity criteria.',
    lessonIds: ['circles-l7', 'circles-l8', 'circles-l9', 'circles-l10'],
  },
  {
    id: 'unit-4-mastery',
    unitNumber: 4,
    title: 'Unit 4 — Mastery, Revision & Extensions',
    badge: 'Lessons 11 – 12 + Ext',
    description:
      'Synthesize Euclidean deductive proofs, tackle chapter-wide examination questions, and explore the optional tangent-radius relationship.',
    lessonIds: ['circles-l11', 'circles-l12', 'circles-ext-tangents'],
  },
];

export const CIRCLES_GUIDED_LESSONS: Record<string, GuidedLessonDefinition> = {
  // ==========================================
  // UNIT 1: FOUNDATIONS
  // ==========================================
  'circles-l1': {
    id: 'circles-l1',
    unitId: 'unit-1-foundations',
    unitTitle: 'Unit 1: Foundations',
    lessonNumber: 1,
    title: 'Understanding a Circle',
    subtitle: 'Center, Radius, Diameter, Chords & Arcs',
    learningObjective:
      'Understand the circle as a collection of equidistant planar points, verify diameter d = 2r as the longest chord, and distinguish chords from arcs.',
    experimentId: 'understanding-circle',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'radius', 'diameter'],
    highlightedObjectIds: ['circle_main', 'rad_OA', 'pt_A'],
    autoFitRadius: 4.0,
    concept: {
      summary:
        'A circle is the locus of all points in a plane that are at a constant distance (the radius) from a fixed center point.',
      detailedPoints: [
        'Center O is the fixed anchor point in the plane.',
        'Radius r is the segment connecting center O to any boundary point P.',
        'Diameter d = 2r connects two opposite points through the center and is the longest chord.',
        'A chord is any straight segment joining two points on the circumference.',
        'An arc is a continuous curved portion of the circle boundary.',
      ],
      keyTerms: [
        { term: 'Radius (r)', definition: 'The constant distance from center O to any circumference point.' },
        { term: 'Diameter (d)', definition: 'A chord passing through the center; exactly 2r.' },
        { term: 'Chord', definition: 'A line segment connecting two circumference points.' },
        { term: 'Circumference (C)', definition: 'The perimeter of the circle, computed as 2πr.' },
      ],
    },
    predictionQuestion: {
      question: 'If you drag point A anywhere along the circle boundary, what happens to distance OA?',
      options: [
        'It increases as point A moves higher on the grid',
        'It remains constant and exactly equal to radius r',
        'It fluctuates depending on the angle',
      ],
      correctIndex: 1,
      explanation: 'By Euclidean definition, every point on a circle boundary is equidistant from the center O.',
    },
    experimentGuide: {
      instruction: 'Drag point A or B around the circle boundary.',
      actionHint: 'Click and drag point A along the cyan circumference path.',
      targetActionDescription: 'Move point A through at least 2 distinct angular positions.',
      targetMetric: 'Distance OA',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that distance OA remains 4.00 units regardless of where point A travels.',
      expectedPattern: 'Distance OA = 4.00 units (constant radial invariance).',
      invariantsDescription: 'Radial invariance: (x - x_O)² + (y - y_O)² = r².',
    },
    whyGuide: {
      explanationType: 'definition',
      explanation:
        'Because the circle is defined algebraically and geometrically by a fixed radial distance from center O(0,0), every point P(x, y) satisfying (x-0)² + (y-0)² = r² maintains distance r from the origin.',
      deductiveTakeaway: 'The radius is strictly invariant across all 360° of the circumference.',
    },
    practiceQuestionIds: ['q_def_radius_diameter', 'q_def_mcq_longest_chord'],
  },

  'circles-l2': {
    id: 'circles-l2',
    unitId: 'unit-1-foundations',
    unitTitle: 'Unit 1: Foundations',
    lessonNumber: 2,
    title: 'Symmetry of a Circle',
    subtitle: 'Reflection, Rotation & Invariant Distances',
    learningObjective:
      'Explore why every diameter acts as an axis of reflection symmetry, and how circles possess continuous rotational symmetry around their center.',
    experimentId: 'symmetry-of-circle',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord'],
    highlightedObjectIds: ['dia_axis', 'chord_PQ'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'A circle is the most symmetric geometric figure in the plane: every diameter is an axis of reflection symmetry, and rotation by any angle leaves the circle unchanged.',
      detailedPoints: [
        'Reflection across any diameter maps the circle boundary perfectly onto itself.',
        'Continuous rotational symmetry: rotating by any angle θ around center O preserves all geometric properties.',
        'Distances between points and chord lengths are preserved under rigid symmetry motions.',
      ],
      keyTerms: [
        { term: 'Reflection Symmetry', definition: 'Folding along any diameter produces two identical congruent semicircular halves.' },
        { term: 'Rotational Invariance', definition: 'The shape and size of a circle remain identical for any rotation angle around the center.' },
      ],
    },
    predictionQuestion: {
      question: 'If chord PQ is reflected across the horizontal diameter axis, what happens to its length?',
      options: [
        'Its length remains exactly the same',
        'Its length doubles because of two halves',
        'Its length depends on the angle with the axis',
      ],
      correctIndex: 0,
      explanation: 'Reflection is a rigid transformation (isometry) that strictly preserves lengths and angles.',
    },
    experimentGuide: {
      instruction: 'Drag chord endpoints P and Q and observe the symmetry axis.',
      actionHint: 'Manipulate points on the boundary to test chord length under transformation.',
      targetActionDescription: 'Drag point P to change chord PQ orientation.',
      targetMetric: 'Chord Length PQ',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice how every diameter divides the circle into two identical congruent halves.',
      expectedPattern: 'Chord length and distance from center are preserved under reflection.',
      invariantsDescription: 'Isometries preserve Euclidean distances: d(T(P), T(Q)) = d(P, Q).',
    },
    whyGuide: {
      explanationType: 'property',
      explanation:
        'A circle centered at the origin is described by x² + y² = r². Under reflection across y = 0, y becomes -y, and x² + (-y)² = x² + y² = r². Under rotation by θ, x² + y² is invariant under rotation matrices. Therefore, geometry inside the circle is invariant.',
      deductiveTakeaway: 'Every diameter is an axis of symmetry, and any rotation around the center preserves chord lengths.',
    },
    practiceQuestionIds: ['q_sym_invariance_reasoning'],
  },

  'circles-l3': {
    id: 'circles-l3',
    unitId: 'unit-1-foundations',
    unitTitle: 'Unit 1: Foundations',
    lessonNumber: 3,
    title: 'How Many Circles?',
    subtitle: 'Circles Through 1, 2, and 3 Points (Circumcircle)',
    learningObjective:
      'Prove that infinitely many circles pass through 1 or 2 points, but one and only one circle passes through three non-collinear points.',
    experimentId: 'how-many-circles',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord'],
    highlightedObjectIds: ['circle_circum', 'pt_A', 'pt_B', 'pt_C'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'A single point allows infinitely many circles. Two points fix the centers along their perpendicular bisector. Three non-collinear points fix a unique center O where perpendicular bisectors intersect.',
      detailedPoints: [
        'Through 1 point: Infinitely many circles of any radius.',
        'Through 2 points A and B: Centers must lie on the perpendicular bisector of AB.',
        'Through 3 non-collinear points A, B, C: The perpendicular bisectors of AB and BC intersect at a single unique point O (the circumcenter).',
        'Through 3 collinear points: No circle can pass through all three.',
      ],
      keyTerms: [
        { term: 'Perpendicular Bisector', definition: 'The locus of points equidistant from two endpoints.' },
        { term: 'Circumcenter (O)', definition: 'The unique point equidistant from all 3 vertices of a triangle: OA = OB = OC.' },
        { term: 'Circumcircle', definition: 'The unique circle passing through all three vertices of a triangle.' },
      ],
    },
    predictionQuestion: {
      question: 'How many distinct circles can pass through three non-collinear points A, B, and C?',
      options: ['Zero', 'One and only one', 'Infinitely many'],
      correctIndex: 1,
      explanation: 'NCERT Theorem: There is one and only one circle passing through three given non-collinear points.',
    },
    experimentGuide: {
      instruction: 'Drag vertices A, B, or C to explore acute, right, and obtuse triangle circumcenters.',
      actionHint: 'Drag vertex A or B and observe where the circumcenter O moves.',
      targetActionDescription: 'Change the triangle shape and observe circumcenter O.',
      targetMetric: 'Circumradius R',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that OA = OB = OC remains true no matter how you adjust the triangle vertices.',
      expectedPattern: 'Perpendicular bisectors always meet at circumcenter O.',
      invariantsDescription: 'OA = OB = OC = R (circumradius).',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Any point on the perpendicular bisector of AB is equidistant from A and B (OA = OB). Any point on the perpendicular bisector of BC is equidistant from B and C (OB = OC). Because the lines are non-parallel (points are non-collinear), they intersect at exactly one unique point O where OA = OB = OC = r.',
      proofSteps: [
        { statement: 'Draw perpendicular bisectors of AB and BC.', reason: 'Euclidean construction.' },
        { statement: 'Since A, B, C are non-collinear, the bisectors intersect at unique point O.', reason: 'Non-parallel lines intersect once.' },
        { statement: 'OA = OB (as O lies on bisector of AB) and OB = OC (as O lies on bisector of BC).', reason: 'Perpendicular bisector property.' },
        { statement: 'Therefore, OA = OB = OC = r.', reason: 'Transitivity of equality.' },
        { statement: 'With center O and radius r, the circle passes through A, B, and C.', reason: 'Definition of circle.' },
      ],
      deductiveTakeaway: 'Three non-collinear points determine a single, unique circumcircle.',
    },
    practiceQuestionIds: ['q_circumcenter_hypotenuse', 'q_collinear_circles_reasoning'],
  },

  // ==========================================
  // UNIT 2: CHORDS
  // ==========================================
  'circles-l4': {
    id: 'circles-l4',
    unitId: 'unit-2-chords',
    unitTitle: 'Unit 2: Chords',
    lessonNumber: 4,
    title: 'Chords and Midpoints',
    subtitle: 'Perpendicular from Center to Chord & Converse',
    learningObjective:
      'Prove and apply the fundamental chord theorem: the perpendicular from the center of a circle to a chord bisects the chord (OM ⊥ AB ⇒ AM = MB) and its converse.',
    experimentId: 'chords-and-properties',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord'],
    highlightedObjectIds: ['chord_1', 'pt_A', 'pt_B'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'A perpendicular dropped from center O onto chord AB always meets AB at its exact midpoint M. Conversely, joining center O to midpoint M creates a right angle OM ⊥ AB.',
      detailedPoints: [
        'Theorem: The perpendicular from the center of a circle to a chord bisects the chord.',
        'Converse: The line segment joining the center of a circle to the midpoint of a chord is perpendicular to the chord.',
        'Right triangle ΔOMA relates radius r, perpendicular distance d, and half-chord length: r² = d² + (L/2)².',
      ],
      keyTerms: [
        { term: 'Midpoint (M)', definition: 'The exact center of chord AB such that AM = MB.' },
        { term: 'Perpendicular Distance (d)', definition: 'The shortest distance from center O to chord AB along OM.' },
      ],
    },
    predictionQuestion: {
      question: 'If chord AB is 8 cm long in a circle of radius 5 cm, what is the distance from center O to the chord?',
      options: ['3 cm', '4 cm', '5 cm'],
      correctIndex: 0,
      explanation: 'In right ΔOMA: OM² = OA² - AM² = 5² - 4² = 25 - 16 = 9 => OM = 3 cm.',
    },
    experimentGuide: {
      instruction: 'Drag chord endpoints A or B along the circle and observe the midpoint M and perpendicular OM.',
      actionHint: 'Move point A or B to different positions around the circle.',
      targetActionDescription: 'Change the chord position to test midpoint bisection.',
      targetMetric: 'AM vs MB equality',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Observe that AM = MB is always true, and ∠OMA is always 90°.',
      expectedPattern: 'AM = MB (exact midpoint bisection) and OM ⊥ AB.',
      invariantsDescription: 'Pythagorean relation: OA² = OM² + AM².',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'In ΔOMA and ΔOMB: OA = OB (radii), OM is common, and ∠OMA = ∠OMB = 90°. By RHS congruence criterion, ΔOMA ≅ ΔOMB. Hence, AM = MB (CPCTC).',
      proofSteps: [
        { statement: 'Join OA and OB to form ΔOMA and ΔOMB.', reason: 'Construction.' },
        { statement: 'OA = OB = radius r.', reason: 'Radii of the same circle.' },
        { statement: 'OM = OM.', reason: 'Common side.' },
        { statement: '∠OMA = ∠OMB = 90°.', reason: 'Given OM ⊥ AB.' },
        { statement: 'ΔOMA ≅ ΔOMB.', reason: 'RHS Congruence Criterion.' },
        { statement: 'AM = MB.', reason: 'Corresponding parts of congruent triangles (CPCTC).' },
      ],
      deductiveTakeaway: 'The perpendicular from the center always bisects the chord.',
    },
    practiceQuestionIds: ['q_chord_perp_pythagoras'],
  },

  'circles-l5': {
    id: 'circles-l5',
    unitId: 'unit-2-chords',
    unitTitle: 'Unit 2: Chords',
    lessonNumber: 5,
    title: 'Equal Chords and Central Angles',
    subtitle: 'Subtended Angles Theorem & Converse',
    learningObjective:
      'Prove that equal chords of a circle subtend equal angles at the center (AB = CD ⇒ ∠AOB = ∠COD), and that chords subtending equal central angles are equal in length.',
    experimentId: 'equal-chords-central-angles',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord', 'angle_measure'],
    highlightedObjectIds: ['chord_AB', 'chord_CD', 'ang_AOB', 'ang_COD'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'If two chords in a circle have the same length, they subtend identical angles at the center. Conversely, if central angles are equal, the corresponding chords are equal.',
      detailedPoints: [
        'Theorem: Equal chords of a circle subtend equal angles at the center.',
        'Converse: If the angles subtended by two chords at the center are equal, the chords are equal.',
        'Proof relies on SSS congruence for the theorem, and SAS congruence for the converse.',
      ],
      keyTerms: [
        { term: 'Subtended Angle', definition: 'The angle formed at the center or boundary by rays connecting to chord endpoints.' },
        { term: 'SSS Congruence', definition: 'Two triangles with all three corresponding sides equal are congruent.' },
      ],
    },
    predictionQuestion: {
      question: 'If chord AB = 7 cm subtends 72° at the center, what angle does another 7 cm chord CD subtend at the center?',
      options: ['36°', '72°', '144°'],
      correctIndex: 1,
      explanation: 'Equal chords of a circle subtend equal angles at the center.',
    },
    experimentGuide: {
      instruction: 'Drag chord endpoints to test central angles for chords of equal and different lengths.',
      actionHint: 'Adjust point B or point D and compare ∠AOB with ∠COD.',
      targetActionDescription: 'Align chords to equal lengths and compare subtended angles.',
      targetMetric: '∠AOB vs ∠COD',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that whenever chord AB = chord CD, ∠AOB = ∠COD exactly.',
      expectedPattern: 'Chord length equality strictly matches central angle equality.',
      invariantsDescription: 'Equal chords <=> Equal central angles.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'In ΔAOB and ΔCOD: OA = OC (radii), OB = OD (radii), and AB = CD (given equal chords). By SSS congruence, ΔAOB ≅ ΔCOD. Therefore ∠AOB = ∠COD (CPCTC).',
      proofSteps: [
        { statement: 'In ΔAOB and ΔCOD: OA = OC = r, OB = OD = r.', reason: 'Radii of the circle.' },
        { statement: 'AB = CD.', reason: 'Given hypothesis.' },
        { statement: 'ΔAOB ≅ ΔCOD.', reason: 'SSS Congruence Criterion.' },
        { statement: '∠AOB = ∠COD.', reason: 'CPCTC.' },
      ],
      deductiveTakeaway: 'Equal chords subtend equal central angles, proven by SSS triangle congruence.',
    },
    practiceQuestionIds: ['q_equal_chords_subtended_angles', 'q_equal_chords_converse'],
  },

  'circles-l6': {
    id: 'circles-l6',
    unitId: 'unit-2-chords',
    unitTitle: 'Unit 2: Chords',
    lessonNumber: 6,
    title: 'Distance of Chords from Centre',
    subtitle: 'Equal Chords Equidistant & Chord Length Ordering',
    learningObjective:
      'Demonstrate that equal chords of a circle are equidistant from the center, and that among unequal chords, the longer chord is nearer to the center.',
    experimentId: 'chord-distance-comparison',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord'],
    highlightedObjectIds: ['ch_1', 'ch_2'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'Chords of equal length lie at the exact same perpendicular distance from the center. As a chord approaches the center, its length increases, reaching maximum at the diameter.',
      detailedPoints: [
        'Theorem: Equal chords of a circle are equidistant from the center.',
        'Theorem: Chords equidistant from the center of a circle are equal in length.',
        'Inequality property: If chord AB > chord CD, then distance(O, AB) < distance(O, CD).',
        'Formula: d = √(r² - (L/2)²); as d decreases, L increases.',
      ],
      keyTerms: [
        { term: 'Equidistant', definition: 'Lying at the exact same perpendicular distance from a reference point.' },
        { term: 'Inverse Distance Relation', definition: 'The closer a chord is to the center (smaller d), the longer its length (larger L).' },
      ],
    },
    predictionQuestion: {
      question: 'Between a chord 2 cm away from center and a chord 4 cm away, which chord is longer?',
      options: [
        'The chord 4 cm away',
        'The chord 2 cm away (nearer the center)',
        'Both chords are the same length',
      ],
      correctIndex: 1,
      explanation: 'Longer chords lie nearer to the center. The diameter has distance 0 and is the longest chord.',
    },
    experimentGuide: {
      instruction: 'Drag chord endpoints to vary their distances from center O.',
      actionHint: 'Move a chord closer to the center and observe how its length grows.',
      targetActionDescription: 'Compare distances d1 and d2 against chord lengths L1 and L2.',
      targetMetric: 'Perpendicular distances OM1, OM2',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that whenever chord lengths match, their perpendicular distances are identical.',
      expectedPattern: 'L1 = L2 <=> d1 = d2, and L1 > L2 <=> d1 < d2.',
      invariantsDescription: 'd² + (L/2)² = r² is constant.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'By Pythagoras: d² = r² - (L/2)². If L1 = L2, then d1² = r² - (L1/2)² = r² - (L2/2)² = d2², hence d1 = d2. If L1 > L2, then (L1/2)² > (L2/2)², so r² - (L1/2)² < r² - (L2/2)², meaning d1 < d2.',
      proofSteps: [
        { statement: 'In right ΔOMA: OM² = OA² - AM² = r² - (L/2)².', reason: 'Pythagoras theorem.' },
        { statement: 'If chords are equal: L1 = L2 => (L1/2)² = (L2/2)²', reason: 'Algebraic equality.' },
        { statement: 'Therefore OM1² = OM2² => OM1 = OM2.', reason: 'Distances are positive reals.' },
        { statement: 'Hence, equal chords are equidistant from the center.', reason: 'Deductive conclusion.' },
      ],
      deductiveTakeaway: 'Perpendicular distance and chord length are locked by Pythagoras: closer = longer.',
    },
    practiceQuestionIds: ['q_distance_chords_comparison', 'q_chord_distance_calc'],
  },

  // ==========================================
  // UNIT 3: ANGLES AND THEOREMS
  // ==========================================
  'circles-l7': {
    id: 'circles-l7',
    unitId: 'unit-3-angles',
    unitTitle: 'Unit 3: Angles',
    lessonNumber: 7,
    title: 'Central and Inscribed Angles',
    subtitle: 'The 2:1 Subtended Angle Theorem',
    learningObjective:
      'Prove that the angle subtended by an arc at the center is double the angle subtended by it at any point on the remaining part of the circle (∠AOB = 2 · ∠APB).',
    experimentId: 'angles-in-a-circle',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'angle_measure'],
    highlightedObjectIds: ['ang_central', 'ang_inscribed', 'pt_P'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'The central angle ∠AOB subtended by arc AB is always exactly twice the inscribed angle ∠APB subtended at any point P on the remaining circumference.',
      detailedPoints: [
        'Central Angle ∠AOB: Vertex is at center O.',
        'Inscribed Angle ∠APB: Vertex P is on the circle boundary.',
        'Ratio: ∠AOB / ∠APB = 2.000 across all positions on the major arc.',
        'Applies equally when arc AB is minor, semicircular, or major (reflex central angle).',
      ],
      keyTerms: [
        { term: 'Central Angle', definition: 'An angle whose vertex is the center of the circle.' },
        { term: 'Inscribed Angle', definition: 'An angle whose vertex lies on the circumference and whose rays pass through endpoints of an arc.' },
      ],
    },
    predictionQuestion: {
      question: 'If central angle ∠AOB is 80°, what is the measure of inscribed angle ∠APB on the circle boundary?',
      options: ['40°', '80°', '160°'],
      correctIndex: 0,
      explanation: 'The inscribed angle is half the central angle: 80° / 2 = 40°.',
    },
    experimentGuide: {
      instruction: 'Drag point P anywhere along the circumference and watch the angle measures.',
      actionHint: 'Drag vertex P along the upper circumference path.',
      targetActionDescription: 'Move point P through multiple positions on the major arc.',
      targetMetric: 'Angle Ratio ∠AOB : ∠APB',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that while ∠APB may stay fixed as P moves, ∠AOB is always exactly twice ∠APB.',
      expectedPattern: '∠AOB = 2 × ∠APB (ratio = 2.00).',
      invariantsDescription: 'Angle ratio invariance: ∠AOB / ∠APB = 2.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Draw line PO produced to point D. In isosceles ΔOPA (OP = OA), exterior angle ∠AOD = ∠OPA + ∠OAP = 2 · ∠OPA. Similarly in ΔOPB, exterior angle ∠BOD = 2 · ∠OPB. Adding both equations gives ∠AOB = ∠AOD + ∠BOD = 2(∠OPA + ∠OPB) = 2 · ∠APB.',
      proofSteps: [
        { statement: 'Draw diameter line POD through vertex P and center O.', reason: 'Construction.' },
        { statement: 'In ΔOAP: OA = OP (radii) => ∠OAP = ∠OPA.', reason: 'Angles opposite equal sides are equal.' },
        { statement: 'Exterior ∠AOD = ∠OAP + ∠OPA = 2 · ∠OPA.', reason: 'Exterior angle of triangle theorem.' },
        { statement: 'Similarly in ΔOBP: Exterior ∠BOD = 2 · ∠OPB.', reason: 'Same exterior angle reasoning.' },
        { statement: '∠AOD + ∠BOD = 2(∠OPA + ∠OPB).', reason: 'Adding equations.' },
        { statement: 'Therefore ∠AOB = 2 · ∠APB.', reason: 'Angle addition postulate.' },
      ],
      deductiveTakeaway: 'The central angle is always twice the inscribed angle subtending the same arc.',
    },
    practiceQuestionIds: ['q_inscribed_angle_calculation', 'q3_inscribed_calc'],
  },

  'circles-l8': {
    id: 'circles-l8',
    unitId: 'unit-3-angles',
    unitTitle: 'Unit 3: Angles',
    lessonNumber: 8,
    title: 'Angles in the Same Segment',
    subtitle: 'Angle Invariance & Angle in a Semicircle',
    learningObjective:
      'Prove that angles in the same segment of a circle are equal (∠APB = ∠AQB), and deduce that the angle subtended by a diameter in a semicircle is a right angle (90°).',
    experimentId: 'angles-in-same-segment',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'angle_measure'],
    highlightedObjectIds: ['ang_P', 'ang_Q', 'pt_P', 'pt_Q'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'Any two angles subtended by the same chord in the same segment are equal. As a special consequence, any inscribed angle subtended by a diameter is exactly 90°.',
      detailedPoints: [
        'Theorem: Angles in the same segment of a circle are equal.',
        'Semicircle Corollary: The angle in a semicircle is a right angle (90°).',
        'Both properties follow directly from the Central Angle Theorem: both inscribed angles equal half the same central angle.',
      ],
      keyTerms: [
        { term: 'Segment of a Circle', definition: 'The region bounded by a chord and its intercepted arc.' },
        { term: 'Angle in Semicircle', definition: 'An inscribed angle whose rays terminate at opposite ends of a diameter; always 90°.' },
      ],
    },
    predictionQuestion: {
      question: 'What is the measure of an angle inscribed in a semicircle (subtended by a diameter)?',
      options: ['45°', '90°', '180°'],
      correctIndex: 1,
      explanation: 'A diameter subtends a 180° straight angle at the center, so the inscribed angle is 180° / 2 = 90°.',
    },
    experimentGuide: {
      instruction: 'Drag point P or point Q along the arc and compare ∠APB and ∠AQB.',
      actionHint: 'Move vertex P and vertex Q around the major segment.',
      targetActionDescription: 'Verify that ∠APB and ∠AQB remain identical.',
      targetMetric: '∠APB and ∠AQB equality',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that no matter where P and Q move in the segment, ∠APB = ∠AQB.',
      expectedPattern: '∠APB = ∠AQB (invariance in the same segment).',
      invariantsDescription: '∠APB = ∠AQB = 1/2 ∠AOB.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Let ∠AOB be the central angle subtended by chord AB. By Lesson 7 theorem: ∠AOB = 2 · ∠APB, so ∠APB = (1/2)∠AOB. Similarly, ∠AOB = 2 · ∠AQB, so ∠AQB = (1/2)∠AOB. Therefore, ∠APB = ∠AQB. When AB is a diameter, ∠AOB = 180°, giving ∠APB = 90°.',
      proofSteps: [
        { statement: 'Let arc AB subtend central angle ∠AOB.', reason: 'Given construction.' },
        { statement: '∠AOB = 2 · ∠APB => ∠APB = 1/2 · ∠AOB.', reason: 'Central angle theorem (Lesson 7).' },
        { statement: '∠AOB = 2 · ∠AQB => ∠AQB = 1/2 · ∠AOB.', reason: 'Central angle theorem on arc AB.' },
        { statement: 'Therefore ∠APB = ∠AQB.', reason: 'Both equal half of the same central angle.' },
        { statement: 'If AB is diameter, ∠AOB = 180° => ∠APB = 90°.', reason: 'Straight angle halved.' },
      ],
      deductiveTakeaway: 'Angles subtended by the same arc in the same segment are perpetually identical.',
    },
    practiceQuestionIds: ['q_semicircle_right_angle', 'q_same_segment_algebra'],
  },

  'circles-l9': {
    id: 'circles-l9',
    unitId: 'unit-3-angles',
    unitTitle: 'Unit 3: Angles',
    lessonNumber: 9,
    title: 'Cyclic Quadrilaterals',
    subtitle: 'Supplementary Opposite Angles Theorem',
    learningObjective:
      'Prove that the sum of either pair of opposite angles of a cyclic quadrilateral is 180° (∠A + ∠C = 180° and ∠B + ∠D = 180°).',
    experimentId: 'cyclic-quadrilaterals',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord', 'angle_measure'],
    highlightedObjectIds: ['quad_ABCD', 'pt_A', 'pt_B', 'pt_C', 'pt_D'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'A quadrilateral whose all four vertices lie on a circle is called a cyclic quadrilateral. The opposite angles of any cyclic quadrilateral always sum to exactly 180°.',
      detailedPoints: [
        'Definition: Quadrilateral ABCD is cyclic if vertices A, B, C, D lie on a circle.',
        'Theorem: The sum of either pair of opposite angles is 180°: ∠A + ∠C = 180° and ∠B + ∠D = 180°.',
        'Exterior Angle Property: The exterior angle formed by extending a side equals the interior opposite angle.',
      ],
      keyTerms: [
        { term: 'Cyclic Quadrilateral', definition: 'A 4-sided polygon whose vertices all lie on a single circle.' },
        { term: 'Supplementary Angles', definition: 'Two angles whose measures add up to 180°.' },
      ],
    },
    predictionQuestion: {
      question: 'In a cyclic quadrilateral ABCD, if ∠A = 70°, what must be the measure of opposite angle ∠C?',
      options: ['70°', '110°', '180°'],
      correctIndex: 1,
      explanation: 'Opposite angles of a cyclic quad are supplementary: ∠C = 180° - 70° = 110°.',
    },
    experimentGuide: {
      instruction: 'Drag any vertex A, B, C, or D around the circle and inspect the opposite angle sums.',
      actionHint: 'Drag vertex B or D and observe how opposite angle measures dynamically balance.',
      targetActionDescription: 'Move vertices to test angle supplementary property.',
      targetMetric: '∠A + ∠C and ∠B + ∠D',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that no matter where the 4 vertices move, ∠A + ∠C = 180° and ∠B + ∠D = 180° always holds.',
      expectedPattern: 'Opposite angles consistently sum to exactly 180.0°.',
      invariantsDescription: '∠A + ∠C = 180° and ∠B + ∠D = 180°.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Arc BCD subtends central angle reflex-∠BOD = 2 · ∠BAD. Arc DAB subtends central angle non-reflex ∠BOD = 2 · ∠BCD. Since the two central angles complete a full 360° turn around center O: 2 · ∠BAD + 2 · ∠BCD = 360°, giving ∠BAD + ∠BCD = 180°.',
      proofSteps: [
        { statement: 'Join OB and OD from center O.', reason: 'Construction.' },
        { statement: 'Central angle subtended by arc BCD is 2 · ∠A.', reason: 'Central angle theorem (Lesson 7).' },
        { statement: 'Central angle subtended by arc BAD is 2 · ∠C.', reason: 'Central angle theorem.' },
        { statement: '2 · ∠A + 2 · ∠C = 360°.', reason: 'Angles around a point sum to 360°.' },
        { statement: 'Dividing by 2: ∠A + ∠C = 180°.', reason: 'Algebraic simplification.' },
        { statement: 'Since total quad angle sum is 360°: ∠B + ∠D = 180°.', reason: 'Quadrilateral angle sum.' },
      ],
      deductiveTakeaway: 'Opposite angles of every cyclic quadrilateral are strictly supplementary.',
    },
    practiceQuestionIds: ['q_cyclic_opposite_angles', 'q4_cyclic_find_angle'],
  },

  'circles-l10': {
    id: 'circles-l10',
    unitId: 'unit-3-angles',
    unitTitle: 'Unit 3: Angles',
    lessonNumber: 10,
    title: 'Concyclicity and Converses',
    subtitle: 'Testing When 4 Points Lie on a Circle',
    learningObjective:
      'Prove and apply converse theorems: if the opposite angles of a quadrilateral are supplementary, or a line segment subtends equal angles at two points on the same side, the quadrilateral is cyclic.',
    experimentId: 'concyclicity-and-converses',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord', 'angle_measure'],
    highlightedObjectIds: ['circle_conv', 'pt_A', 'pt_B', 'pt_C', 'pt_D'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'The converses of circle theorems provide powerful criteria for proving that four points lie on a circle (are concyclic).',
      detailedPoints: [
        'Converse 1: If the sum of a pair of opposite angles of a quadrilateral is 180°, the quadrilateral is cyclic.',
        'Converse 2: If a line segment joining two points subtends equal angles at two other points lying on the same side, the four points are concyclic.',
        'Used extensively in Euclidean geometry to discover hidden circles and cyclic properties.',
      ],
      keyTerms: [
        { term: 'Concyclic Points', definition: 'Points that all lie on the circumference of the same circle.' },
        { term: 'Converse Theorem', definition: 'Reversing the hypothesis and conclusion of a proven theorem.' },
      ],
    },
    predictionQuestion: {
      question: 'If a quadrilateral has opposite angles of 95° and 85°, is it cyclic?',
      options: [
        'Yes, because 95° + 85° = 180° (supplementary)',
        'No, the angles must each be 90°',
        'Cannot be determined without side lengths',
      ],
      correctIndex: 0,
      explanation: 'By the converse theorem, if opposite angles sum to 180°, the quadrilateral is cyclic.',
    },
    experimentGuide: {
      instruction: 'Drag vertices to test whether non-cyclic configurations violate the 180° sum.',
      actionHint: 'Examine quadrilateral angle sums on and off the circle.',
      targetActionDescription: 'Test concyclicity criteria with angle measurements.',
      targetMetric: 'Angle Sum vs 180°',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that whenever 4 vertices are concyclic, their opposite angle sum is exactly 180°.',
      expectedPattern: 'Concyclicity <=> Opposite angles supplementary.',
      invariantsDescription: '∠A + ∠C = 180° is a necessary and sufficient condition.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Proof by contradiction: If circle through A, B, D did not pass through C, let it intersect CD at C\'. Then ABC\'D is cyclic, so ∠B + ∠C\' = 180°. But given ∠B + ∠C = 180°, so ∠C = ∠C\', which is impossible unless C coincides with C\'.',
      proofSteps: [
        { statement: 'Assume circle through A, B, D does not pass through C.', reason: 'Hypothesis for contradiction.' },
        { statement: 'Let the circle intersect line CD at point C\'.', reason: 'Circle intersection.' },
        { statement: 'Then ABC\'D is cyclic => ∠B + ∠C\' = 180°.', reason: 'Cyclic quad theorem.' },
        { statement: 'Given ∠B + ∠C = 180° => ∠C = ∠C\'.', reason: 'Equating both expressions.' },
        { statement: 'In ΔBCC\', an exterior angle equals interior angle, which is impossible unless C = C\'.', reason: 'Exterior angle property.' },
        { statement: 'Therefore point C must lie on the circle, making ABCD cyclic.', reason: 'Proof by contradiction completed.' },
      ],
      deductiveTakeaway: 'The supplementary opposite angle condition guarantees concyclicity.',
    },
    practiceQuestionIds: ['q_concyclicity_verification', 'q_concyclicity_test'],
  },

  // ==========================================
  // UNIT 4: MASTERY
  // ==========================================
  'circles-l11': {
    id: 'circles-l11',
    unitId: 'unit-4-mastery',
    unitTitle: 'Unit 4: Mastery',
    lessonNumber: 11,
    title: 'Guided Theorem Revision',
    subtitle: 'Consolidating Class 9 Euclidean Proof Logic',
    learningObjective:
      'Synthesize deductive proof pathways for all Class 9 circle theorems, connecting triangle congruence (SSS, RHS, SAS) to arc and chord invariants.',
    experimentId: 'theorem-proof-lab',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'chord', 'angle_measure'],
    highlightedObjectIds: ['circle_theorems', 'ch_AB', 'ang_central', 'ang_inscribed'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'Euclidean circle geometry forms a tightly knit deductive web: every property connects back to radial symmetry, isosceles triangles, and triangle congruence criteria.',
      detailedPoints: [
        'Radial Invariance: All radii are equal (OA = OB = OC = r).',
        'Congruence Tools: RHS proves chord bisection; SSS proves equal chord central angles.',
        'Angle Invariance: Central angle = 2 × inscribed angle links arcs to cyclic quadrilaterals.',
        'Mastery means recognizing which theorem applies to an unseen geometric configuration.',
      ],
      keyTerms: [
        { term: 'Deductive Proof', definition: 'A logical chain of reasoning where each step is justified by an axiom, definition, or previously proven theorem.' },
        { term: 'Theorem Synthesis', definition: 'Integrating multiple geometric theorems to solve complex geometric configurations.' },
      ],
    },
    predictionQuestion: {
      question: 'Which triangle congruence criterion is used to prove that the perpendicular from center bisects a chord?',
      options: ['AAA (Angle-Angle-Angle)', 'RHS (Right angle - Hypotenuse - Side)', 'ASA (Angle-Side-Angle)'],
      correctIndex: 1,
      explanation: 'In ΔOMA and ΔOMB: right angles ∠OMA = ∠OMB, hypotenuses OA = OB (radii), and common leg OM prove RHS congruence.',
    },
    experimentGuide: {
      instruction: 'Interact with the synthesis construction to inspect how chord and angle theorems interconnect.',
      actionHint: 'Manipulate chord AB and vertex P to observe simultaneous theorem evaluations.',
      targetActionDescription: 'Explore the synthesized geometry construction.',
      targetMetric: 'Proof deductive logic',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice how changing one parameter preserves all geometric theorems simultaneously.',
      expectedPattern: 'Theorems hold concurrently without contradiction.',
      invariantsDescription: 'Complete Euclidean consistency.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'Mathematics is not a collection of isolated tricks; all 9 circle theorems follow logically from Euclid’s first principles of plane geometry and isometric invariants.',
      proofSteps: [
        { statement: 'Definition of circle gives OA = OB = r.', reason: 'Axiom of circle.' },
        { statement: 'Isosceles triangles ΔOAB create equal base angles.', reason: 'Isosceles triangle theorem.' },
        { statement: 'Exterior angles sum to 2x base angles.', reason: 'Exterior angle theorem.' },
        { statement: 'This derives the 2:1 central:inscribed angle ratio.', reason: 'Euclidean deduction.' },
        { statement: 'From 2:1 ratio, same segment equality and cyclic quad 180° follow immediately.', reason: 'Corollary deduction.' },
      ],
      deductiveTakeaway: 'All circle theorems form a single unified deductive structure.',
    },
    practiceQuestionIds: ['q6_proof_challenge'],
  },

  'circles-l12': {
    id: 'circles-l12',
    unitId: 'unit-4-mastery',
    unitTitle: 'Unit 4: Mastery',
    lessonNumber: 12,
    title: 'Chapter Practice and Revision',
    subtitle: 'Comprehensive NCERT Ganita Manjari Examination Questions',
    learningObjective:
      'Solve rigorous chapter-wide numerical problems, diagram reasoning challenges, geometric constructions, and formal proof questions with step-by-step verification.',
    experimentId: 'chapter-practice-revision',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'circle', 'point_on_circle', 'chord', 'radius', 'diameter', 'angle_measure', 'tangent', 'eraser'],
    highlightedObjectIds: ['circle_rev', 'ch_AB', 'ch_CD', 'quad_ABCD'],
    autoFitRadius: 5.0,
    concept: {
      summary:
        'Put all your Circles knowledge together to solve multi-step examination problems: chord distance calculations, inscribed angle algebra, and cyclic quadrilateral proofs.',
      detailedPoints: [
        'Numerical calculation: Combining Pythagoras with chord perpendiculars.',
        'Angle chasing: Using central angles, same segment equality, and cyclic quad opposite angles.',
        'Construction verification: Constructing diameters, perpendicular bisectors, and circumcircles.',
        'Formal justification: Stating theorem names and reasons clearly in proofs.',
      ],
      keyTerms: [
        { term: 'Angle Chasing', definition: 'Iteratively calculating unknown angles across a geometric figure using circle and triangle theorems.' },
        { term: 'Chapter Mastery', definition: 'The ability to fluidly combine definitions, chords, angles, and cyclic quads to solve novel problems.' },
      ],
    },
    predictionQuestion: {
      question: 'If chord AB = 8 cm in circle of radius 5 cm, and chord CD is 4 cm from center, which chord is longer?',
      options: ['Chord AB (8 cm)', 'Chord CD', 'Both chords are equal in length'],
      correctIndex: 0,
      explanation: 'For AB, distance is √(5² - 4²) = 3 cm. Since AB is 3 cm from center and CD is 4 cm away, AB is closer and therefore longer (CD length = 2√(5²-4²) = 6 cm).',
    },
    experimentGuide: {
      instruction: 'Freely construct, measure, and analyze multi-chord and cyclic quadrilateral configurations.',
      actionHint: 'Test different chords, angles, and quad vertices on the canvas.',
      targetActionDescription: 'Solve synthesis challenges across the entire chapter.',
      targetMetric: 'Multi-theorem verification',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice how multiple theorems confirm each other when solving complex configurations.',
      expectedPattern: 'Analytical geometry measurements match deductive Euclidean theorems.',
      invariantsDescription: 'Full chapter consistency across chords, distances, and angles.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'When solving examination problems, always begin by identifying: (1) circles and centers, (2) radii forming isosceles triangles, (3) chords and perpendicular bisectors, (4) arcs subtending central vs boundary angles, and (5) cyclic quadrilaterals.',
      deductiveTakeaway: 'You have mastered the foundational concepts, theorems, and proofs of Class 9 Circles!',
    },
    practiceQuestionIds: ['q_rev_cyclic_combo', 'q_chord_perp_pythagoras', 'q_inscribed_angle_calculation'],
  },

  // ==========================================
  // OPTIONAL EXTENSION: TANGENTS
  // ==========================================
  'circles-ext-tangents': {
    id: 'circles-ext-tangents',
    unitId: 'unit-4-mastery',
    unitTitle: 'Unit 4: Mastery',
    lessonNumber: 13,
    title: 'Tangents and Radius (Optional Extension)',
    subtitle: 'Perpendicular Tangent Theorem & Minimal Distance',
    learningObjective:
      'Explore the relationship between a circle and a line meeting it at exactly one point (tangent), proving that the tangent is perpendicular to the radius at the point of contact.',
    isOptionalExtension: true,
    experimentId: 'tangents-and-radius',
    stages: ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'],
    allowedTools: ['select', 'point_on_circle', 'radius', 'tangent'],
    highlightedObjectIds: ['rad_OP', 'tangent_P', 'pt_P'],
    autoFitRadius: 4.5,
    concept: {
      summary:
        'A tangent to a circle touches the circle at exactly one point. The tangent is perpendicular to the radius drawn to that point of contact (OP ⊥ Tangent).',
      detailedPoints: [
        'A secant intersects a circle in two distinct points; a tangent touches at exactly one point P.',
        'Theorem: The tangent at any point of a circle is perpendicular to the radius through the point of contact.',
        'The radius OP is the shortest distance from center O to the tangent line.',
        'Preview of Class 10 Circles curriculum.',
      ],
      keyTerms: [
        { term: 'Tangent', definition: 'A straight line that touches the circle at exactly one point of contact.' },
        { term: 'Point of Contact', definition: 'The single point where the tangent touches the circle circumference.' },
      ],
    },
    predictionQuestion: {
      question: 'What is the angle between a tangent line and the radius drawn to the point of contact?',
      options: ['45°', '90° (Right angle)', '180°'],
      correctIndex: 1,
      explanation: 'The tangent is strictly perpendicular (90°) to the radius through the point of contact.',
    },
    experimentGuide: {
      instruction: 'Drag the contact point P around the circle and observe how the tangent line rotates.',
      actionHint: 'Drag point P along the boundary; the tangent line stays perpendicular to radius OP.',
      targetActionDescription: 'Rotate the tangent around the circle.',
      targetMetric: 'Angle between radius OP and tangent',
      minInteractionsNeeded: 2,
    },
    observeGuide: {
      prompt: 'Notice that ∠(Radius, Tangent) is constantly 90.0° regardless of where point P moves.',
      expectedPattern: 'Radius ⊥ Tangent perpetually (90°).',
      invariantsDescription: 'Minimal distance property: OP ⊥ Tangent.',
    },
    whyGuide: {
      explanationType: 'theorem_proof',
      explanation:
        'For every point Q ≠ P on the tangent line, Q lies strictly outside the circle, so OQ > OP. Thus, OP is the strictly shortest distance from center O to the line. In Euclidean geometry, the shortest distance from a point to a line is the perpendicular distance. Hence OP ⊥ Tangent.',
      proofSteps: [
        { statement: 'Let line t be tangent to circle O at point P, and let Q be any point on t other than P.', reason: 'Hypothesis.' },
        { statement: 'Since line t touches circle only at P, Q lies strictly outside the circle.', reason: 'Definition of tangent.' },
        { statement: 'Therefore OQ > OP for every point Q ≠ P on line t.', reason: 'Exterior point distance > radius.' },
        { statement: 'Hence OP is the shortest distance from O to line t.', reason: 'Minimal distance.' },
        { statement: 'The shortest distance from a point to a line is perpendicular.', reason: 'Euclidean geometric theorem.' },
        { statement: 'Therefore OP ⊥ line t.', reason: 'Conclusion.' },
      ],
      deductiveTakeaway: 'The tangent at any point is perpendicular to the radius through that point.',
    },
    practiceQuestionIds: ['q5_tangent_length'],
  },
};

export const CIRCLES_GUIDED_CURRICULUM: GuidedChapterCurriculum = {
  chapterId: 'circles-class-9',
  title: 'Class 9 Circles: "I\'m Up and Down, and Round and Round"',
  subjectId: 'mathematics',
  classGrade: 9,
  textbookReference: 'NCERT Ganita Manjari — Class 9 Mathematics',
  units: CIRCLES_GUIDED_UNITS,
  lessons: CIRCLES_GUIDED_LESSONS,
};

export const ORDERED_LESSON_IDS = [
  'circles-l1',
  'circles-l2',
  'circles-l3',
  'circles-l4',
  'circles-l5',
  'circles-l6',
  'circles-l7',
  'circles-l8',
  'circles-l9',
  'circles-l10',
  'circles-l11',
  'circles-l12',
  'circles-ext-tangents',
];

/**
 * Returns the next recommended lesson for the student given completed lesson IDs.
 * Skips optional extensions unless all 12 core lessons are complete.
 */
export function getNextRecommendedLesson(completedLessonIds: string[]): string {
  const completedSet = new Set(completedLessonIds);
  // Look for first uncompleted core lesson (1-12)
  for (let i = 0; i < 12; i++) {
    const lessonId = ORDERED_LESSON_IDS[i];
    if (!completedSet.has(lessonId)) {
      return lessonId;
    }
  }
  // If all 12 core lessons complete, recommend extension if not done
  if (!completedSet.has('circles-ext-tangents')) {
    return 'circles-ext-tangents';
  }
  // Otherwise return last lesson
  return 'circles-l12';
}
