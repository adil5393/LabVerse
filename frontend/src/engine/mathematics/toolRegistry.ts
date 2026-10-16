/**
 * Extensible Tool Registry for LabVerse Mathematics Laboratory
 *
 * Defines the mathematical tool definitions and registry interface.
 */

import type { MathToolDefinition, MathToolId } from './types';

export const MATH_TOOLS: MathToolDefinition[] = [
  {
    id: 'select',
    displayName: 'Select / Move',
    icon: 'pan_tool_alt',
    category: 'manipulation',
    shortcut: 'V',
    description: 'Select geometric objects or drag points across the plane.',
    cursor: 'default',
  },
  {
    id: 'point',
    displayName: 'Point',
    icon: 'adjust',
    category: 'construct',
    shortcut: 'P',
    description: 'Place new points at Cartesian coordinates with automatic labels.',
    cursor: 'crosshair',
  },
  {
    id: 'segment',
    displayName: 'Line Segment',
    icon: 'linear_scale',
    category: 'construct',
    shortcut: 'S',
    description: 'Connect two points with a finite line segment with length pill.',
    cursor: 'crosshair',
  },
  {
    id: 'line',
    displayName: 'Infinite Line',
    icon: 'trending_flat',
    category: 'construct',
    shortcut: 'L',
    description: 'Draw an infinite line passing through two points with slope equation.',
    cursor: 'crosshair',
  },
  {
    id: 'distance',
    displayName: 'Distance Measure',
    icon: 'straighten',
    category: 'measure',
    shortcut: 'M',
    description: 'Select two points to measure distance, Δx, and Δy without clutter.',
    cursor: 'pointer',
  },
  {
    id: 'eraser',
    displayName: 'Eraser',
    icon: 'ink_eraser',
    category: 'manipulation',
    shortcut: 'E',
    description: 'Click any point, segment, or line to delete it.',
    cursor: 'pointer',
  },
  {
    id: 'pan',
    displayName: 'Pan & Navigate',
    icon: 'drag_pan',
    category: 'view',
    shortcut: 'H',
    description: 'Drag anywhere to pan across the infinite Cartesian coordinate plane.',
    cursor: 'grab',
  },
];

export const MATH_TOOL_MAP: Record<MathToolId, MathToolDefinition> = MATH_TOOLS.reduce(
  (acc, tool) => {
    acc[tool.id] = tool;
    return acc;
  },
  {} as Record<MathToolId, MathToolDefinition>
);
