/**
 * TypeScript Data Contracts for Class 9 Quadrilaterals Laboratory (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Implements rigorous geometric models for:
 * - Quadrilaterals (convex, concave, crossed/complex, degenerate)
 * - Special quadrilaterals (parallelograms, rectangles, rhombuses, squares, trapeziums, kites)
 * - Constrained side midpoints, medial triangles, and Varignon parallelograms
 * - Triangle medians and centroid (2:1 division ratio)
 * - Dynamic planar tiling (monohedral tessellation via 180° edge-rotations and translations)
 * - Dynamic dependency constraints (parallelism, perpendicularity, bisections)
 */

export type QuadToolId =
  | 'select'
  | 'point'
  | 'segment'
  | 'quadrilateral'
  | 'midpoint'
  | 'diagonal'
  | 'parallel_constraint'
  | 'perpendicular_constraint'
  | 'angle_measure'
  | 'distance_measure'
  | 'eraser'
  | 'freehand';

export type QuadMode = 'explore' | 'investigate' | 'practice';

export type LabelSizePreference = 'small' | 'normal' | 'large';

export interface WorldPoint {
  x: number;
  y: number;
}

export type PointRole =
  | 'free'
  | 'midpoint'
  | 'diagonal_intersection'
  | 'triangle_centroid'
  | 'derived';

export interface QuadPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  color?: string;
  locked?: boolean;
  role?: PointRole;
  parentEntityIds?: string[]; // IDs of segments or points this point depends on
}

export interface QuadSegment {
  id: string;
  name: string;
  pointAId: string;
  pointBId: string;
  color?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  isDiagonal?: boolean;
  isMedian?: boolean;
  isMidpointConnector?: boolean;
  showLength?: boolean;
}

export type QuadrilateralKind =
  | 'general_convex'
  | 'concave'
  | 'crossed'
  | 'degenerate'
  | 'trapezium'
  | 'parallelogram'
  | 'rectangle'
  | 'rhombus'
  | 'square'
  | 'kite';

export interface QuadrilateralObject {
  id: string;
  name: string;
  p1Id: string; // Ordered vertices counterclockwise or clockwise
  p2Id: string;
  p3Id: string;
  p4Id: string;
  color?: string;
  fillAlpha?: number;
  showDiagonals?: boolean;
  showAngles?: boolean;
  showMidpoints?: boolean;
  showVarignon?: boolean;
  isVarignon?: boolean;
  parentQuadId?: string;
}

export interface TriangleObject {
  id: string;
  name: string;
  p1Id: string;
  p2Id: string;
  p3Id: string;
  color?: string;
  fillAlpha?: number;
  showMedians?: boolean;
  showMidpoints?: boolean;
  showCentroid?: boolean;
}

export interface QuadAngleMeasurement {
  id: string;
  name: string;
  point1Id: string;
  vertexId: string;
  point2Id: string;
  isReflex?: boolean;
  color?: string;
}

export interface QuadDistanceMeasurement {
  id: string;
  name: string;
  pointAId: string;
  pointBId: string;
  color?: string;
}

export type ConstraintType =
  | 'parallel_opposite'
  | 'parallel_segments'
  | 'equal_opposite'
  | 'midpoint'
  | 'perpendicular_diagonals'
  | 'centroid_ratio';

export interface QuadConstraint {
  id: string;
  type: ConstraintType;
  targetEntityIds: string[];
  active: boolean;
  enabled?: boolean;
  description: string;
}

export interface FreehandDrawingStroke {
  id: string;
  points: WorldPoint[];
  color: string;
  width: number;
}

export interface TilingConfig {
  enabled: boolean;
  rows: number;
  cols: number;
  baseQuadId: string;
  showVectors?: boolean;
  showRotationCenters?: boolean;
  opacity?: number;
}

export interface QuadViewportTransform {
  zoom: number; // Pixels per world unit (e.g., 40 px = 1 unit)
  panX: number; // Screen px offset
  panY: number; // Screen px offset
}

export type QuadConstructionStep =
  | { type: 'idle' }
  | { type: 'creating_point' }
  | { type: 'creating_segment'; startPointId?: string }
  | { type: 'creating_quadrilateral'; points: string[] }
  | { type: 'creating_midpoint'; firstPointId?: string }
  | { type: 'creating_diagonal'; startPointId?: string }
  | { type: 'creating_parallel'; baseSegmentId?: string }
  | { type: 'creating_parallel_segments'; firstSegmentId?: string }
  | { type: 'creating_perpendicular'; baseSegmentId?: string }
  | { type: 'measuring_angle'; points: string[] }
  | { type: 'measuring_distance'; startPointId?: string }
  | { type: 'drawing_freehand'; strokeId: string };

export type InvestigationStageId =
  | 'understand'
  | 'predict'
  | 'experiment'
  | 'observe'
  | 'explain'
  | 'practice';

export interface CapturedObservation {
  id: string;
  timestamp: number;
  metricLabel: string;
  currentValue: string;
  expectedInvariant: string;
  isConsistent: boolean;
}

export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

export type PracticeQuestionType =
  | 'numerical'
  | 'multiple_choice'
  | 'diagram_reasoning'
  | 'construction_task'
  | 'proof_step';

export interface PracticeQuestion {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  topicId: string;
  ncertReference?: string;
  statement: string;
  diagramGivens?: {
    quadrilateralType?: QuadrilateralKind;
    points: Record<string, WorldPoint>;
    segments?: { pointA: string; pointB: string; label?: string; style?: 'solid' | 'dashed' }[];
    highlightAngles?: { p1: string; vertex: string; p2: string; label?: string }[];
    knownValues?: Record<string, string | number>;
  };
  options?: string[];
  correctAnswer: string | number;
  acceptableTolerance?: number; // For numerical entries
  unit?: string;
  hints: string[];
  workedSolution: string[];
  proofSteps?: {
    statement: string;
    reason: string;
    missingReasonOptions?: string[];
    correctReasonIndex?: number;
  }[];
}

export interface QuadrilateralSceneSnapshot {
  points: Record<string, QuadPoint>;
  segments: Record<string, QuadSegment>;
  quadrilaterals: Record<string, QuadrilateralObject>;
  triangles: Record<string, TriangleObject>;
  angles: Record<string, QuadAngleMeasurement>;
  distances: Record<string, QuadDistanceMeasurement>;
  constraints: Record<string, QuadConstraint>;
  drawings: Record<string, FreehandDrawingStroke>;
  tiling: TilingConfig | null;
  selectedId: string | null;
  selectedType:
    | 'point'
    | 'segment'
    | 'quadrilateral'
    | 'triangle'
    | 'angle'
    | 'distance'
    | 'constraint'
    | null;
}

export interface QuadrilateralExperiment {
  id: string;
  title: string;
  subtitle: string;
  curriculumCategory:
    | 'understanding'
    | 'parallelograms'
    | 'midpoint_theorem'
    | 'medians_centroid'
    | 'varignon'
    | 'tiling'
    | 'revision';
  curriculumClassification: 'direct_chapter' | 'supporting_prerequisite' | 'extension';
  description: string;
  learningGoals: string[];
  initialScene: {
    points: QuadPoint[];
    segments: QuadSegment[];
    quadrilaterals: QuadrilateralObject[];
    triangles: TriangleObject[];
    angles?: QuadAngleMeasurement[];
    distances?: QuadDistanceMeasurement[];
    constraints?: QuadConstraint[];
    tiling?: TilingConfig;
  };
  theorems: {
    id: string;
    title: string;
    statement: string;
    ncertReference: string;
  }[];
  practiceQuestions: PracticeQuestion[];
}
