/**
 * TypeScript Data Contracts for Class 9 Circles Laboratory (Milestone M2)
 *
 * Implements mathematical world models for circles, constrained circumference points,
 * chords, arcs, angles, tangents, cyclic quadrilaterals, theorem investigations, and practice problems.
 */

export type CircleToolId =
  | 'select'
  | 'circle'
  | 'point_on_circle'
  | 'chord'
  | 'radius'
  | 'diameter'
  | 'radius_diameter' // for backward compatibility
  | 'angle_measure'
  | 'tangent'
  | 'eraser';

export type CircleMode = 'explore' | 'investigate' | 'practice';

export type LabelSizePreference = 'small' | 'normal' | 'large';

export interface WorldPoint {
  x: number;
  y: number;
}

export interface CircleObject {
  id: string;
  name: string;
  center: WorldPoint;
  radius: number;
  color?: string;
  fillAlpha?: number;
}

export interface CircumferencePoint {
  id: string;
  name: string;
  circleId: string;
  angleRad: number; // Angle in radians [0, 2π) from center
  color?: string;
}

export interface CircleChord {
  id: string;
  name: string;
  circleId: string;
  pointAId: string;
  pointBId: string;
  color?: string;
  showMidpoint?: boolean;
  showPerpendicular?: boolean;
}

export interface CircleRadiusDiameter {
  id: string;
  name: string;
  circleId: string;
  type: 'radius' | 'diameter';
  pointId: string; // Point on circle for radius, or start point for diameter
  point2Id?: string; // Opposite point for diameter
  color?: string;
}

export interface CircleAngleMeasurement {
  id: string;
  name: string;
  circleId: string;
  point1Id: string; // First ray point
  vertexId: string; // Vertex (center for central angle, or circumference point for inscribed)
  point2Id: string; // Second ray point
  isCentral: boolean;
  color?: string;
}

export interface CircleTangent {
  id: string;
  name: string;
  circleId: string;
  contactPointId: string;
  length: number; // Visual length on canvas
  color?: string;
}

export interface CyclicQuadrilateral {
  id: string;
  name: string;
  circleId: string;
  pointAId: string;
  pointBId: string;
  pointCId: string;
  pointDId: string;
  color?: string;
}

export interface FreehandDrawingStroke {
  id: string;
  points: WorldPoint[];
  color: string;
  width: number;
}

export interface CircleViewportTransform {
  zoom: number; // Pixels per world unit (e.g., 40 px = 1 unit)
  panX: number; // Screen px offset
  panY: number; // Screen px offset
}

export type CircleConstructionStep =
  | { type: 'idle' }
  | { type: 'creating_circle'; center?: WorldPoint }
  | { type: 'creating_chord'; circleId?: string; firstPointId?: string }
  | { type: 'creating_radius'; circleId?: string }
  | { type: 'creating_diameter'; circleId?: string }
  | { type: 'measuring_angle'; circleId?: string; points: string[] }
  | { type: 'creating_tangent'; circleId?: string };

export type InvestigationCategory = 'definition' | 'property' | 'theorem';

export type InvestigationStageId =
  | 'understand'
  | 'predict'
  | 'experiment'
  | 'observe'
  | 'explain'
  | 'prove_or_conclude';

export interface CapturedObservation {
  id: string;
  stepNumber?: number;
  trialNumber?: number;
  timestamp: number;
  label?: string;
  configurationLabel?: string;
  metrics?: Record<string, number | string>;
  measurements?: Record<string, number | string>;
  notes?: string;
  invariantEvaluated?: string;
}

export interface CircleExperimentDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category?: 'foundations' | 'chords' | 'angles_theorems' | 'practice_revision' | 'extension';
  curriculumClassification: 'direct_chapter' | 'supporting_prerequisite' | 'optional_extension';
  ncertTopicReference: string;
  initialScene: {
    circles: CircleObject[];
    circumferencePoints: CircumferencePoint[];
    chords: CircleChord[];
    radiusDiameters: CircleRadiusDiameter[];
    angles: CircleAngleMeasurement[];
    tangents: CircleTangent[];
    cyclicQuads: CyclicQuadrilateral[];
  };
  theorems: TheoremInvestigation[];
  practiceQuestions: PracticeQuestion[];
}

export interface TheoremInvestigation {
  id: string;
  title: string;
  category?: InvestigationCategory;
  statement: string;
  hypothesis?: string;
  givenContext?: string;
  instructions: string;
  predictionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  experimentTask?: {
    instruction: string;
    actionHint: string;
    requiredInteractionType:
      | 'drag_circumference_point'
      | 'transform_symmetry'
      | 'manipulate_chords'
      | 'drag_triangle_vertices'
      | 'drag_quad_vertices'
      | 'measure_angles';
    targetMetric: string;
    minDistinctPositions: number;
  };
  explainSynthesis?: string;
  proofSteps: {
    statement: string;
    reason: string;
    missingReasonOptions?: string[];
    correctReasonIndex?: number;
  }[];
  mathematicalConclusion: string;
}

export type PracticeQuestionType =
  | 'numeric'
  | 'multiple_choice'
  | 'diagram_reasoning'
  | 'construction'
  | 'proof';

export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

export interface PracticeSceneDefinition {
  circles: CircleObject[];
  circumferencePoints: CircumferencePoint[];
  chords: CircleChord[];
  radiusDiameters: CircleRadiusDiameter[];
  angles: CircleAngleMeasurement[];
  tangents: CircleTangent[];
  cyclicQuads: CyclicQuadrilateral[];
  lockedElementIds?: string[];
}

export interface PracticeQuestion {
  id: string;
  topicId?: string;
  topicTitle?: string;
  difficulty?: PracticeDifficulty;
  type?: PracticeQuestionType;
  title: string;
  question: string;
  diagramDescription?: string;
  diagramValues?: Record<string, number | string>;
  givens?: Record<string, number | string>;
  diagram?: PracticeSceneDefinition;
  options?: string[];
  correctAnswer: number | string;
  correctOptionIndex?: number;
  tolerance?: number;
  unit?: string;
  hint?: string;
  hintSteps?: string[];
  stepByStepSolution: string[];
  theoremApplied: string;
  marks?: number;
  isNCERTSourced?: boolean;
  constructionVerification?: {
    requiredType:
      | 'diameter'
      | 'equal_chords'
      | 'perpendicular_bisector'
      | 'circumcircle'
      | 'cyclic_quad'
      | 'angle';
    tolerance?: number;
    expectedCount?: { diameters?: number; chords?: number };
    minPointsCount?: number;
  };
}
