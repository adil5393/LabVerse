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

export interface CircleExperimentDefinition {
  id: string;
  title: string;
  subtitle: string;
  description: string;
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
  statement: string;
  hypothesis: string;
  instructions: string;
  predictionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  proofSteps: {
    statement: string;
    reason: string;
  }[];
  mathematicalConclusion: string;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  question: string;
  diagramDescription?: string;
  diagramValues?: Record<string, number | string>;
  correctAnswer: number | string;
  tolerance?: number;
  unit?: string;
  hint: string;
  stepByStepSolution: string[];
  theoremApplied: string;
}
