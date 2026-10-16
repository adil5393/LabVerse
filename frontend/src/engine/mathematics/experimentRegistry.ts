/**
 * Experiment Definitions & Registry for Mathematics Laboratory
 */

import type { MathObject, MathPoint, MathSegment, MathViewportTransform } from './types';
import { DEFAULT_UNIT_PIXELS } from './coordinates';

export interface MathExperiment {
  id: string;
  moduleId: 'coordinate-geometry' | 'graphs-functions' | 'geometry-constructions' | 'trigonometry';
  moduleTitle: string;
  title: string;
  targetClass: string;
  description: string;
  objective: string;
  formulaTex: string;
  initialObjects: MathObject[];
  initialViewport: MathViewportTransform;
}

export const DISTANCE_EXPERIMENT: MathExperiment = {
  id: 'distance-between-two-points',
  moduleId: 'coordinate-geometry',
  moduleTitle: 'Coordinate Geometry',
  title: 'Distance Between Two Points',
  targetClass: 'Class 9–10',
  description:
    'Explore the Euclidean distance between two points A(x₁, y₁) and B(x₂, y₂) on the Cartesian coordinate plane using the Pythagorean theorem.',
  objective:
    'Observe how horizontal difference Δx and vertical difference Δy form the legs of a right triangle whose hypotenuse is the line segment joining the two points.',
  formulaTex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
  initialObjects: [
    {
      id: 'pt_A',
      kind: 'point',
      label: 'A',
      x: 2,
      y: 3,
      isDraggable: true,
      color: '#4d8eff',
      radius: 7,
    } as MathPoint,
    {
      id: 'pt_B',
      kind: 'point',
      label: 'B',
      x: 7,
      y: 6,
      isDraggable: true,
      color: '#ffb95a',
      radius: 7,
    } as MathPoint,
    {
      id: 'seg_AB',
      kind: 'segment',
      label: 'AB',
      pointAId: 'pt_A',
      pointBId: 'pt_B',
      color: '#a855f7',
      strokeWidth: 3,
      style: 'solid',
    } as MathSegment,
  ],
  initialViewport: {
    panX: 280,
    panY: 420,
    zoom: 1.0,
    unitPixels: DEFAULT_UNIT_PIXELS,
  },
};

export const MATH_EXPERIMENTS: Record<string, MathExperiment> = {
  'distance-between-two-points': DISTANCE_EXPERIMENT,
};
