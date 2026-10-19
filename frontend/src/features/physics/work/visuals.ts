import type { VisualRegistry } from '../../education/visuals';
import { WorkVisual } from './WorkView';

/** Visuals the Chapter 7 lessons can use (registered by VisualRef.kind). */
export const WORK_VISUALS: VisualRegistry = { workLab: WorkVisual };
