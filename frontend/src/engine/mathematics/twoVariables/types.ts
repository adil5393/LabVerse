/**
 * Types for the Two Variables, One Line laboratory (Milestone M5).
 * Class 9 NCERT Ganita Manjari Part II, Chapter 13.
 */

import type { LinearEq } from './linearEquation';
import type { Rational } from './rational';

export type TVWorkbenchTab = 'graph' | 'system' | 'algebra';
export type TVMode = 'explore' | 'practice';

export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

export type PracticeQuestionType = 'multiple_choice' | 'numeric' | 'ordered_pair' | 'graph_point';

export type PracticeTopic =
  | 'identify_linear'
  | 'standard_form'
  | 'check_solution'
  | 'solution_table'
  | 'intercepts'
  | 'slope'
  | 'special_lines'
  | 'plot_line'
  | 'graph_reading'
  | 'graphical_intersection'
  | 'system_classification'
  | 'substitution'
  | 'elimination'
  | 'word_problem';

export interface QuestionDiagram {
  lines: { eq: LinearEq; label: string; colorIndex: 0 | 1 }[];
  points?: { x: number; y: number; label: string }[];
  /** Half-width of the visible square window. */
  extent: number;
  /** When false, the lines are hidden until the question is answered. */
  showLines: boolean;
}

export type AnswerSpec =
  | { kind: 'choice'; index: number }
  | { kind: 'number'; value: Rational }
  | { kind: 'pair'; x: Rational; y: Rational }
  | { kind: 'graph_point'; equations: LinearEq[] };

export interface TVPracticeQuestion {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  questionType: PracticeQuestionType;
  topicId: PracticeTopic;
  statement: string;
  options?: string[];
  diagram?: QuestionDiagram;
  answer: AnswerSpec;
  hints: string[];
  workedSolution: string[];
  explanation: string;
}

export type UserAnswer =
  | { kind: 'choice'; index: number }
  | { kind: 'number'; text: string }
  | { kind: 'pair'; xText: string; yText: string }
  | { kind: 'graph_point'; x: number; y: number };

export interface TVExperiment {
  id: string;
  title: string;
  subtitle: string;
  defaultTab: TVWorkbenchTab;
  /** Equation presets. */
  eq1: string;
  eq2?: string;
  showTable: boolean;
  showSlope: boolean;
  showIntercepts: boolean;
  /** When true the coefficient sliders and free text editor are hidden (gentle first lessons). */
  simpleControls: boolean;
}

/** What kinds of real student action a lesson can require. */
export type InteractionKind =
  | 'solution_found'
  | 'coefficient_change'
  | 'point_drag'
  | 'system_edit'
  | 'algebra_step'
  | 'table_row';

export interface RecordedObservation {
  kind: InteractionKind;
  /** Calculated description such as "(3, 2) satisfies 2x + 3y = 12". */
  text: string;
  at: number;
}
