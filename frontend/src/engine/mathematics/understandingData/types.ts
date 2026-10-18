/**
 * Types for the Understanding Data laboratory (Milestone M6).
 * Class 9 NCERT Ganita Manjari Part II, Chapter 10:
 * How Quantities Combine: Understanding Data.
 */

import type { Q } from './rational';
import type { WeightedItem } from './weightedMean';
import type { Constituent } from './mixture';
import type { ChartDataset, ChartKind, ChartMode } from './charts';

/** Every view of the one raw chart dataset. 'both' shows stacked and 100% stacked together. */
export type ChartView = ChartKind | 'both';

export type UDTab = 'weighted' | 'mixture' | 'charts' | 'average';
export type UDMode = 'explore' | 'practice';
export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

/** What the weight column means in the current experiment. */
export type WeightMeaning = 'size' | 'importance';

export type InteractionKind =
  | 'group_edit'
  | 'row_change'
  | 'mixture_edit'
  | 'chart_edit'
  | 'chart_toggle'
  | 'segment_select'
  | 'challenge_answer'
  | 'calc_view';

export interface RecordedObservation {
  kind: InteractionKind;
  /** A calculated, truthful statement such as "Sizes 10 and 30 → weighted 57.5, naive 65". */
  text: string;
  at: number;
}

export type WeightedRow = WeightedItem;

export interface WeightedSeed {
  meaning: WeightMeaning;
  /** Wording for the value column, e.g. "Average marks". */
  valueLabel: string;
  weightLabel: string;
  unit: string;
  rows: { label: string; value: string; weight: string; rounded?: boolean }[];
}

export interface MixtureSeed {
  solute: string;
  /** 'varna' shows purity on the textbook's 0–16 varṇa scale (stored internally as percent gold = k/16 × 100). */
  scale?: 'percent' | 'varna';
  rows: { label: string; quantity: string; unit: Constituent['unit']; percent: string }[];
}

export type ChartPresetId = 'houses' | 'spending' | 'blooms' | 'daytime' | 'race';

export interface UDExperiment {
  id: string;
  title: string;
  subtitle: string;
  defaultTab: UDTab;
  weighted?: WeightedSeed;
  mixture?: MixtureSeed;
  chart?: { preset: ChartPresetId; mode: ChartMode; view?: ChartKind; pieGroup?: number; weights?: number[] };
  /** Hide advanced editing (add/remove rows, free text) for the very first lessons. */
  simpleControls: boolean;
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------

export type PracticeInput = 'multiple_choice' | 'numeric' | 'chart_select';

export type PracticeTopic =
  | 'average_of_averages'
  | 'weighted_mean'
  | 'custom_weights'
  | 'adding_removing'
  | 'weight_changes'
  | 'mixture'
  | 'mixture_assumptions'
  | 'stacked_reading'
  | 'percent_reading'
  | 'absolute_vs_percent'
  | 'chart_choice'
  | 'error_detection'
  | 'chart_comparison'
  | 'dataset_interpretation'
  | 'clustered_reading'
  | 'pie_charts'
  | 'average_hides'
  | 'gold_purity';

export type AnswerSpec =
  | { kind: 'choice'; index: number }
  /** `decimals`: when set, a student's rounded answer is accepted if it is within half a unit in that place. */
  | { kind: 'number'; value: Q; decimals?: number }
  | { kind: 'segment'; groupId: string; categoryId: string }
  | { kind: 'bar'; groupId: string };

export interface GivensTable {
  headers: string[];
  rows: string[][];
}

export interface UDPracticeQuestion {
  id: string;
  title: string;
  difficulty: PracticeDifficulty;
  inputType: PracticeInput;
  topicId: PracticeTopic;
  statement: string;
  /** Unit text shown beside numeric inputs, e.g. "marks", "%", "mL". */
  unit?: string;
  options?: string[];
  givens?: GivensTable;
  /** Which chart is shown with the question; 'pie' shows `pieGroupId`, 'clustered' clusters by `clusterBy`. */
  chart?: { dataset: ChartDataset; mode: ChartKind; pieGroupId?: string; clusterBy?: 'group' | 'category' };
  answer: AnswerSpec;
  hints: string[];
  workedSolution: string[];
  explanation: string;
}

export type UserAnswer =
  | { kind: 'choice'; index: number }
  | { kind: 'number'; text: string }
  | { kind: 'segment'; groupId: string; categoryId: string }
  | { kind: 'bar'; groupId: string };
