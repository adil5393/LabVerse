/**
 * Core Type Definitions for LabVerse Mathematics Laboratory
 */

export type MathObjectKind = 'point' | 'segment' | 'line';

export interface MathPoint {
  id: string;
  kind: 'point';
  label: string;
  x: number;
  y: number;
  isDraggable?: boolean;
  color?: string;
  radius?: number;
}

export interface MathSegment {
  id: string;
  kind: 'segment';
  label?: string;
  pointAId: string;
  pointBId: string;
  color?: string;
  strokeWidth?: number;
  style?: 'solid' | 'dashed';
}

export interface MathLine {
  id: string;
  kind: 'line';
  label?: string;
  pointAId: string;
  pointBId: string;
  color?: string;
  strokeWidth?: number;
  style?: 'solid' | 'dashed';
}

export type MathObject = MathPoint | MathSegment | MathLine;

export interface MathViewportTransform {
  panX: number;
  panY: number;
  zoom: number;
  unitPixels: number; // Pixels per 1 mathematical coordinate unit (e.g. 44px = 1 unit)
}

export interface DistanceAnalysis {
  p1: { x: number; y: number; label: string };
  p2: { x: number; y: number; label: string };
  dx: number;
  dy: number;
  absDx: number;
  absDy: number;
  dxSquared: number;
  dySquared: number;
  sumOfSquares: number;
  distance: number;
  formattedDistance: string;
  isExactSquare: boolean;
  exactSqrt: number | null;
  midpoint: { x: number; y: number };
  steps: {
    formula: string;
    substitution: string;
    differences: string;
    squared: string;
    sum: string;
    final: string;
  };
}

export interface LineAnalysis {
  p1: { x: number; y: number; label: string };
  p2: { x: number; y: number; label: string };
  isVertical: boolean;
  isHorizontal: boolean;
  slope: number;
  yIntercept: number;
  equation: string;
  angleDeg: number;
}

export type MathToolId =
  | 'select'
  | 'point'
  | 'segment'
  | 'line'
  | 'distance'
  | 'draw'
  | 'eraser'
  | 'pan'
  | 'axes';

export interface MathToolDefinition {
  id: MathToolId;
  displayName: string;
  icon: string;
  category: 'manipulation' | 'construct' | 'measure' | 'view';
  shortcut?: string;
  description: string;
  cursor: string;
}

export interface ConstructionState {
  stage: 'idle' | 'selecting_second';
  firstPointId: string | null;
  previewCoord: { x: number; y: number } | null;
}

export type MeasurementTriangleMode =
  | 'horizontal-then-vertical'
  | 'vertical-then-horizontal'
  | 'both';

export interface DistanceMeasurement {
  id: string;
  pointAId: string;
  pointBId: string;
  triangleMode: MeasurementTriangleMode;
  color?: string;
}

export interface ActiveMeasurement {
  pointAId: string;
  pointBId: string;
}

export interface MathDefaultColors {
  point: string;
  segment: string;
  line: string;
  measurement: string;
}

export interface FreehandStroke {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export type DrawToolMode = 'pen' | 'eraser';

export interface DrawSettings {
  mode: DrawToolMode;
  color: string;
  width: number;
}

export interface MathSaveFile {
  version: '1.0';
  experimentId: string;
  title: string;
  timestamp: string;
  objects: Record<string, MathObject>;
  objectOrder: string[];
  measurements?: Record<string, DistanceMeasurement>;
  measurementOrder?: string[];
  drawings?: Record<string, FreehandStroke>;
  drawingOrder?: string[];
  defaultColors?: MathDefaultColors;
  viewport: MathViewportTransform;
}

