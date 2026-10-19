/** Types for the Chapter 7 NCERT exercise solutions (shared by the solution files and the page). */

import type { WorkSetup } from './workModel';
import type { KineticSetup } from './kineticModel';

export interface SolutionStep { text: string; why: string }

export interface GraphLine { id: string; name: string; color: string; pts: [number, number][]; dash?: string }

export type ExerciseIllustration =
  | { kind: 'work'; caption: string; setup: WorkSetup }
  | { kind: 'kinetic'; caption: string; setup: KineticSetup }
  | {
    kind: 'graph'; caption: string; xName: string; xUnit: string; yName: string; yUnit: string; xr: [number, number]; yr: [number, number];
    lines: GraphLine[]; shade?: { x0: number; x1: number; y: number; color: string }; points?: { x: number; y: number; label: string }[];
    /** How the values were read from the textbook figure and how precise they are. */
    estimate: string;
  };

export interface WorkSolution {
  given: string[];
  find: string[];
  assumptions?: string[];
  /** The physical law and why this formula was chosen. */
  principle: string;
  hint: string;
  reasoning: SolutionStep[];
  calculation: string[];
  finalAnswer: string;
  /** What the answer means physically. */
  meaning: string;
  commonMistake: string;
  illustrations?: ExerciseIllustration[];
  /** A real laboratory link that shows the same idea, or null with the reason in labNote. */
  lab: { href: string; label: string } | null;
  labNote?: string;
  verification: string;
}
