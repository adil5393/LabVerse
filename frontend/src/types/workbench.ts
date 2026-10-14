/**
 * Generic Workbench System Types (Subject-agnostic)
 * Supports Physics, Chemistry, Biology, Mathematics, and Robotics.
 */

export type SubjectId = 'physics' | 'chemistry' | 'biology' | 'mathematics' | 'robotics';

export type UserMode = 'beginner' | 'advanced';

export interface ViewportTransform {
  zoom: number;       // Scale factor (0.25 to 3.0, default 1.0)
  panX: number;       // Pan offset X in screen pixels
  panY: number;       // Pan offset Y in screen pixels
}

export interface GenericTerminal {
  id: string;
  label: string;
  relativePositionMM: { x: number; y: number };
  type: string; // e.g. "electrical_pin", "fluid_port", "mechanical_joint", "optic_axis"
  polarity?: 'positive' | 'negative' | 'neutral';
  colorCode?: string;
}

export interface GenericEquipmentDefinition {
  id: string;
  name: string;
  subjectId: SubjectId;
  category: string;
  description: string;
  icon: string; // Material symbol icon name
  dimensionsMM: { width: number; height: number };
  terminals: GenericTerminal[];
  defaultProperties: Record<string, number | string | boolean>;
}

export interface GenericEquipmentInstance {
  instanceId: string;
  definitionId: string;
  positionMM: { x: number; y: number };
  rotationDeg: number;
  properties: Record<string, number | string | boolean>;
  connections: Record<string, string | null>; // terminalId -> connectionTargetId
}

export interface GuidedStep {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  learningObjective: string;
  hint: string;
  targetComponentId?: string;
  isComplete: boolean;
}

export interface WorkbenchSaveFile {
  version: string;
  subjectId: SubjectId;
  topicId: string;
  experimentId: string;
  timestamp: string;
  viewport: ViewportTransform;
  instances: GenericEquipmentInstance[];
  metadata?: Record<string, unknown>;
}
