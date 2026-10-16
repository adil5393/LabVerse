/**
 * Extensible Tool Registry for LabVerse Mathematics Laboratory
 *
 * Defines the initial mathematical tool definitions and registry interface
 * designed for future modular expansion without architecture changes.
 */

import type { MathToolDefinition, MathToolId } from './types';

export const MATH_TOOLS: MathToolDefinition[] = [
  {
    id: 'select',
    displayName: 'Select & Move',
    icon: 'pan_tool_alt',
    category: 'manipulation',
    shortcut: 'V',
    description: 'Select geometric objects or drag points across the coordinate plane.',
    cursor: 'default',
  },
  {
    id: 'point',
    displayName: 'Point',
    icon: 'adjust',
    category: 'construct',
    shortcut: 'P',
    description: 'Place a new point at coordinate coordinates on the Cartesian plane.',
    cursor: 'crosshair',
  },
  {
    id: 'segment',
    displayName: 'Line Segment',
    icon: 'linear_scale',
    category: 'construct',
    shortcut: 'S',
    description: 'Connect two points with a finite line segment.',
    cursor: 'crosshair',
  },
  {
    id: 'line',
    displayName: 'Line',
    icon: 'trending_flat',
    category: 'construct',
    shortcut: 'L',
    description: 'Draw an infinite line passing through two points.',
    cursor: 'crosshair',
  },
  {
    id: 'distance',
    displayName: 'Distance & Measure',
    icon: 'straighten',
    category: 'measure',
    shortcut: 'M',
    description: 'Inspect Euclidean distance, coordinate differences, and geometric metrics.',
    cursor: 'pointer',
  },
  {
    id: 'axes',
    displayName: 'Coordinate Axes',
    icon: 'grid_4x4',
    category: 'view',
    shortcut: 'G',
    description: 'Configure Cartesian plane axes, origin visibility, and grid snapping.',
    cursor: 'default',
  },
];

export const MATH_TOOL_MAP: Record<MathToolId, MathToolDefinition> = MATH_TOOLS.reduce(
  (acc, tool) => {
    acc[tool.id] = tool;
    return acc;
  },
  {} as Record<MathToolId, MathToolDefinition>
);
