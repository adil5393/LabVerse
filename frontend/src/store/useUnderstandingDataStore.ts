/**
 * Understanding Data — Zustand store (Milestone M6).
 *
 * Independent of every other chapter's store. Only the chapter-neutral
 * guided-learning types are shared. One authoritative dataset per experiment
 * kind (weighted rows, mixture constituents, chart dataset) feeds every view,
 * so two visualisations of the same data can never disagree.
 *
 * Storage key: 'labverse_understanding_data_progress_v1'
 */

import { create } from 'zustand';
import type { GuidedStageId } from '../engine/mathematics/guidedLearning/types';
import { type Q, parseQ, formatSmart, isNeg, cmp, ZERO, q, abs, sub, formatExact } from '../engine/mathematics/understandingData/rational';
import { weightedMean, compareNaiveWeighted, scaleWeights, shiftWeights, type WeightedItem } from '../engine/mathematics/understandingData/weightedMean';
import { mixConstituents, type Constituent } from '../engine/mathematics/understandingData/mixture';
import {
  type ChartDataset, groupTotal, groupShares, cell, setCell, addGroup, removeGroup, addCategory, removeCategory,
  renameGroup, renameCategory, buildOppositeCases,
} from '../engine/mathematics/understandingData/charts';
import { getUDExperiment } from '../engine/mathematics/understandingData/experimentRegistry';
import { CHART_PRESETS, weightedRowsFromSeed, constituentsFromSeed, newId } from '../engine/mathematics/understandingData/presets';
import { UD_GUIDED_LESSONS, UD_LESSON_ORDER, UD_OPTIONAL_LESSON_IDS } from '../engine/mathematics/understandingData/curriculumPath';
import type { ChartView, InteractionKind, PracticeDifficulty, RecordedObservation, UDMode, UDTab, WeightMeaning, WeightedRow } from '../engine/mathematics/understandingData/types';
import { averageDay, closestGroup, type GroupWeights } from '../engine/mathematics/understandingData/averageDay';

const STORAGE_KEY = 'labverse_understanding_data_progress_v1';
const HISTORY_LIMIT = 50;
const OBSERVATION_LIMIT = 40;
export const MASTERY_THRESHOLD = 0.7;

export type { ChartView };
export type NumericVerdict = 'exact' | 'close' | 'naive' | 'other';
export type LessonStatus = 'not_started' | 'attempted' | 'completed' | 'demonstrated' | 'mastered';

const emptyStages = (): Record<GuidedStageId, boolean> => ({ understand: false, predict: false, experiment: false, observe: false, explain: false, practice: false });

export interface UDLessonProgress {
  lessonId: string;
  completed: boolean;
  /** Earned: no bypass, prediction made, real experiments, practice passed on first attempts. */
  mastered: boolean;
  teacherBypassed: boolean;
  activeStage: GuidedStageId;
  stagesCompleted: Record<GuidedStageId, boolean>;
  predictionMade: boolean;
  predictionOption?: number;
  predictionIsCorrect?: boolean;
  predictionText?: string;
  predictionVerdict?: NumericVerdict;
  interactionsRecorded: number;
  observations: RecordedObservation[];
  countedKeys: string[];
  /** Mastery recorded before evidence tracking could not be verified. Kept as history, never trusted. */
  legacyMasteryUnverified?: boolean;
  /** Chart views the student has opened during the experiment (absent in progress saved before M6.1). */
  viewsSeen?: string[];
}

export interface UDPracticeAttempt {
  userAnswerText: string;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attempts: number;
  hintsRevealed: number;
  showSolution: boolean;
  /** A hint or the solution was used BEFORE the first answer. Absent in progress saved before EDU-1M6. */
  assisted?: boolean;
}

/**
 * Independent evidence: correct on the very first answer with no help before it.
 * Older saved attempts have no `assisted` flag; if they used a hint or the solution we
 * cannot tell whether it came before the answer, so they are not trusted as independent.
 */
export const isIndependent = (a: UDPracticeAttempt | undefined): boolean =>
  Boolean(a && a.attempts > 0 && a.firstAttemptCorrect && a.assisted !== true && !(a.assisted === undefined && (a.hintsRevealed > 0 || a.showSolution)));

interface Snapshot {
  rows: WeightedRow[];
  constituents: Constituent[];
  dataset: ChartDataset;
}

export interface UnderstandingDataState {
  currentExperimentId: string;
  activeTab: UDTab;
  mode: UDMode;

  // Authoritative data
  weightMeaning: WeightMeaning;
  valueLabel: string;
  weightLabel: string;
  valueUnit: string;
  rows: WeightedRow[];
  solute: string;
  constituents: Constituent[];
  dataset: ChartDataset;
  chartView: ChartView;
  /** How clustered columns are grouped: one cluster per group, or per category. */
  clusterBy: 'group' | 'category';
  /** The single group shown by the pie chart. */
  pieGroupId: string;
  /** Population weights of the groups for the average-day investigation (default 1). */
  popWeights: GroupWeights;
  mixtureScale: 'percent' | 'varna';
  selected: { groupId: string; categoryId: string } | null;
  /** Which "opposite case" dataset is displayed in the comparison panel (0 = none). */
  oppositeCase: 0 | 1 | 2;
  challengeResults: Record<string, { answered: boolean; correct: boolean }>;
  past: Snapshot[];
  future: Snapshot[];

  // Guided
  activeLessonId: string;
  activeStage: GuidedStageId;
  teacherMode: boolean;
  guidedActive: boolean;
  lessons: Record<string, UDLessonProgress>;

  // Practice
  activePracticeQuestionId: string;
  practiceDifficultyFilter: PracticeDifficulty | 'all';
  practiceAnswers: Record<string, UDPracticeAttempt>;

  // Laboratory
  setExperiment: (id: string) => void;
  setActiveTab: (t: UDTab) => void;
  setMode: (m: UDMode) => void;
  resetExperiment: () => void;
  undo: () => void;
  redo: () => void;

  // Weighted
  setRowNumber: (id: string, field: 'value' | 'weight', v: Q) => void;
  setRowLabel: (id: string, label: string) => void;
  setRowRounded: (id: string, rounded: boolean) => void;
  addRow: () => void;
  removeRow: (id: string) => void;
  scaleAllWeights: (k: Q) => void;
  shiftAllWeights: (c: Q) => void;

  // Mixture
  setConstituent: (id: string, patch: Partial<Pick<Constituent, 'label' | 'quantity' | 'unit'>> & { percent?: Q }) => void;
  addConstituent: () => void;
  removeConstituent: (id: string) => void;

  // Charts
  setChartCell: (g: string, c: string, v: Q | null) => string | null;
  addChartGroup: () => string | null;
  removeChartGroup: (id: string) => string | null;
  addChartCategory: () => string | null;
  removeChartCategory: (id: string) => string | null;
  renameChartGroup: (id: string, label: string) => void;
  renameChartCategory: (id: string, label: string) => void;
  replaceDataset: (ds: ChartDataset) => void;
  setChartView: (v: ChartView) => void;
  setClusterBy: (by: 'group' | 'category') => void;
  setPieGroup: (id: string) => void;
  setPopWeight: (id: string, w: Q) => void;
  allowedViews: () => ChartView[];
  selectSegment: (g: string, c: string) => void;
  showOppositeCase: (k: 1 | 2) => string | null;
  recordChallenge: (id: string, correct: boolean, text: string) => void;

  // Guided
  setTeacherMode: (on: boolean) => void;
  setGuidedActive: (on: boolean) => void;
  selectLesson: (id: string, stage?: GuidedStageId) => void;
  setStage: (s: GuidedStageId) => void;
  recordPrediction: (index: number, correct: boolean) => void;
  recordNumericPrediction: (text: string) => NumericVerdict | null;
  recordInteraction: (kind: InteractionKind, text: string, key: string) => boolean;
  canAdvance: () => { ok: boolean; reason: string };
  isLocked: () => boolean;
  advanceToNextStage: () => void;
  completeLesson: (id: string) => void;
  resetProgress: () => void;
  getCompletionStats: () => { completed: number; mastered: number; total: number; percentage: number; nextRecommendedLessonId: string };

  // Practice
  selectPracticeQuestion: (id: string) => void;
  setPracticeDifficultyFilter: (d: PracticeDifficulty | 'all') => void;
  submitPracticeAnswer: (id: string, text: string, correct: boolean) => void;
  revealPracticeHint: (id: string) => void;
  togglePracticeSolution: (id: string) => void;
  retryPracticeQuestion: (id: string) => void;
}

// ---------------------------------------------------------------------------
// persistence
// ---------------------------------------------------------------------------

interface Persisted {
  lessons: Record<string, UDLessonProgress>;
  practiceAnswers: Record<string, UDPracticeAttempt>;
  lastLessonId?: string;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, practiceAnswers: {} };
    const p = JSON.parse(raw);
    const lessons: Record<string, UDLessonProgress> = p && typeof p.lessons === 'object' && p.lessons && !Array.isArray(p.lessons) ? p.lessons : {};
    const practiceAnswers: Record<string, UDPracticeAttempt> = p && typeof p.practiceAnswers === 'object' && p.practiceAnswers && !Array.isArray(p.practiceAnswers) ? p.practiceAnswers : {};
    // Keep every record; withdraw trust from mastery the evidence no longer supports.
    for (const [id, l] of Object.entries(lessons)) {
      if (l && typeof l === 'object' && l.mastered && !masteryEarned(l, practiceAnswers)) lessons[id] = { ...l, mastered: false, legacyMasteryUnverified: true };
    }
    return { lessons, practiceAnswers, lastLessonId: typeof p?.lastLessonId === 'string' ? p.lastLessonId : undefined };
  } catch {
    return { lessons: {}, practiceAnswers: {} };
  }
}

function persist(data: Persisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, updatedAt: Date.now(), ...data }));
  } catch {
    // Storage may be unavailable or full; progress then stays in memory only.
  }
}

export const hasAnswered = (a: UDPracticeAttempt | undefined): boolean => Boolean(a && a.attempts > 0);

export function lessonStatus(p: UDLessonProgress | undefined): LessonStatus {
  if (!p) return 'not_started';
  if (p.completed) return p.mastered ? 'mastered' : p.teacherBypassed ? 'demonstrated' : 'completed';
  const any = p.predictionMade || p.interactionsRecorded > 0 || Object.values(p.stagesCompleted).some(Boolean);
  return any ? 'attempted' : 'not_started';
}

const blankLesson = (lessonId: string, stage: GuidedStageId): UDLessonProgress => ({
  lessonId, completed: false, mastered: false, teacherBypassed: false, activeStage: stage, stagesCompleted: emptyStages(),
  predictionMade: false, interactionsRecorded: 0, observations: [], countedKeys: [],
});

function masteryEarned(p: UDLessonProgress, answers: Record<string, UDPracticeAttempt>): boolean {
  const lesson = UD_GUIDED_LESSONS[p.lessonId];
  if (!lesson || p.teacherBypassed) return false;
  if (lesson.stages.includes('predict') && !p.predictionMade) return false;
  if (p.interactionsRecorded < (lesson.experimentGuide.minInteractionsNeeded ?? 0)) return false;
  if ((lesson.mustVisitViews ?? []).some((v) => !(p.viewsSeen ?? []).includes(v))) return false;
  const ids = lesson.practiceQuestionIds;
  if (ids.length === 0) return true;
  if (ids.some((id) => !hasAnswered(answers[id]))) return false;
  return ids.filter((id) => isIndependent(answers[id])).length / ids.length >= MASTERY_THRESHOLD;
}

const VIEW_NAME: Record<string, string> = { clustered: 'clustered-column', percent: '100% stacked', pie: 'pie', absolute: 'stacked', both: 'side-by-side' };

function evaluateGate(s: UnderstandingDataState): { ok: boolean; reason: string } {
  const lesson = UD_GUIDED_LESSONS[s.activeLessonId];
  const p = s.lessons[s.activeLessonId];
  if (!lesson || !p) return { ok: false, reason: 'Select a lesson first.' };
  switch (s.activeStage) {
    case 'predict':
      return p.predictionMade ? { ok: true, reason: '' } : { ok: false, reason: 'Make your prediction first.' };
    case 'experiment': {
      const need = lesson.experimentGuide.minInteractionsNeeded ?? 0;
      if (p.interactionsRecorded < need) return { ok: false, reason: `Do the experiment first: ${p.interactionsRecorded} of ${need} done.` };
      const missing = (lesson.mustVisitViews ?? []).filter((v) => !(p.viewsSeen ?? []).includes(v));
      if (missing.length > 0) return { ok: false, reason: `Also open the ${missing.map((v) => VIEW_NAME[v] ?? v).join(' and ')} view of the chart.` };
      return { ok: true, reason: '' };
    }
    case 'observe':
      return p.observations.length > 0 ? { ok: true, reason: '' } : { ok: false, reason: 'Your experiment results will be listed here once you have done the experiment.' };
    case 'practice': {
      const un = lesson.practiceQuestionIds.filter((id) => !hasAnswered(s.practiceAnswers[id])).length;
      return un === 0 ? { ok: true, reason: '' } : { ok: false, reason: `Answer ${un} more practice question${un === 1 ? '' : 's'}.` };
    }
    default:
      return { ok: true, reason: '' };
  }
}

// ---------------------------------------------------------------------------
// text helpers for truthful observations
// ---------------------------------------------------------------------------

const f = (x: Q) => formatSmart(x, 3);

function weightedObservation(rows: WeightedRow[]): string | null {
  const w = weightedMean(rows);
  if (!w.ok) return null;
  const c = compareNaiveWeighted(rows);
  const parts = rows.map((r) => `${r.label}: ${f(r.value)} (weight ${f(r.weight)})`).join('; ');
  return `${parts} → weighted mean ${f(w.mean)}${c ? `, plain average ${f(c.naive)}${c.agree ? ' (same)' : ''}` : ''}`;
}

function mixtureObservation(cs: Constituent[], solute: string): string | null {
  const r = mixConstituents(cs);
  if (!r.ok) return null;
  const parts = cs.map((c) => `${f(c.quantity)} ${c.unit} at ${f(c.solutes[solute] ?? ZERO)}%`).join(' + ');
  return `${parts} → ${f(r.totalQuantity)} ${r.baseUnit}, ${f(r.concentrations[solute] ?? ZERO)}% ${solute}`;
}

const signature = (parts: unknown[]): string => parts.map((x) => (typeof x === 'bigint' ? x.toString() : String(x))).join('|');
const rowsSig = (rows: WeightedRow[]) => signature(rows.flatMap((r) => [r.id, formatExact(r.value), formatExact(r.weight)]));
const mixSig = (cs: Constituent[]) => signature(cs.flatMap((c) => [c.id, formatExact(c.quantity), c.unit, ...Object.values(c.solutes).map(formatExact)]));
const dsSig = (ds: ChartDataset) => signature(ds.groups.flatMap((g) => ds.categories.map((c) => `${g.id}.${c.id}=${cell(ds, g.id, c.id) ? formatExact(cell(ds, g.id, c.id)!) : 'x'}`)));

export const useUnderstandingDataStore = create<UnderstandingDataState>((set, get) => {
  const persisted = loadPersisted();

  const commit = (lessons: Record<string, UDLessonProgress>, answers = get().practiceAnswers, lastLessonId = get().activeLessonId) => {
    set({ lessons, practiceAnswers: answers });
    persist({ lessons, practiceAnswers: answers, lastLessonId });
  };

  const snap = (): Snapshot => {
    const s = get();
    return { rows: s.rows, constituents: s.constituents, dataset: s.dataset };
  };
  const pushHistory = () => set({ past: [...get().past, snap()].slice(-HISTORY_LIMIT), future: [] });

  const exp0 = getUDExperiment('ud-weighted');
  const seedWeighted = exp0.weighted!;

  return {
    currentExperimentId: 'ud-weighted',
    activeTab: 'weighted',
    mode: 'explore',

    weightMeaning: seedWeighted.meaning,
    valueLabel: seedWeighted.valueLabel,
    weightLabel: seedWeighted.weightLabel,
    valueUnit: seedWeighted.unit,
    rows: weightedRowsFromSeed(seedWeighted),
    solute: 'jaggery',
    constituents: constituentsFromSeed({ solute: 'jaggery', rows: [{ label: 'Glass 1', quantity: '200', unit: 'mL', percent: '10' }, { label: 'Glass 2', quantity: '300', unit: 'mL', percent: '20' }] }),
    dataset: CHART_PRESETS.houses(),
    chartView: 'absolute',
    clusterBy: 'group',
    pieGroupId: 'g1',
    popWeights: {},
    mixtureScale: 'percent',
    selected: null,
    oppositeCase: 0,
    challengeResults: {},
    past: [],
    future: [],

    activeLessonId: persisted.lastLessonId && UD_GUIDED_LESSONS[persisted.lastLessonId] ? persisted.lastLessonId : 'ud-l1',
    activeStage: 'understand',
    teacherMode: false,
    guidedActive: false,
    lessons: persisted.lessons,

    activePracticeQuestionId: 'q-ud-1',
    practiceDifficultyFilter: 'all',
    practiceAnswers: persisted.practiceAnswers,

    // ----- laboratory -----
    setExperiment: (id) => {
      const e = getUDExperiment(id);
      const next: Partial<UnderstandingDataState> = {
        currentExperimentId: e.id,
        activeTab: e.defaultTab,
        past: [],
        future: [],
        selected: null,
        oppositeCase: 0,
        challengeResults: {},
      };
      if (e.weighted) {
        next.weightMeaning = e.weighted.meaning;
        next.valueLabel = e.weighted.valueLabel;
        next.weightLabel = e.weighted.weightLabel;
        next.valueUnit = e.weighted.unit;
        next.rows = weightedRowsFromSeed(e.weighted);
      }
      if (e.mixture) {
        next.solute = e.mixture.solute;
        next.constituents = constituentsFromSeed(e.mixture);
        next.mixtureScale = e.mixture.scale ?? 'percent';
      }
      if (e.chart) {
        const ds = CHART_PRESETS[e.chart.preset]();
        next.dataset = ds;
        next.chartView = e.chart.view ?? e.chart.mode;
        next.clusterBy = 'group';
        next.pieGroupId = ds.groups[Math.min(e.chart.pieGroup ?? 0, ds.groups.length - 1)].id;
        const w: GroupWeights = {};
        e.chart.weights?.forEach((n, i) => { if (ds.groups[i]) w[ds.groups[i].id] = q(n); });
        next.popWeights = w;
      }
      set(next);
    },
    setActiveTab: (t) => set({ activeTab: t }),
    setMode: (m) => set({ mode: m }),

    resetExperiment: () => get().setExperiment(get().currentExperimentId),

    undo: () => {
      const { past, future } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      set({ ...prev, past: past.slice(0, -1), future: [snap(), ...future].slice(0, HISTORY_LIMIT) });
    },
    redo: () => {
      const { past, future } = get();
      if (future.length === 0) return;
      const [next, ...rest] = future;
      set({ ...next, past: [...past, snap()].slice(-HISTORY_LIMIT), future: rest });
    },

    // ----- weighted -----
    setRowNumber: (id, field, v) => {
      pushHistory();
      const rows = get().rows.map((r) => (r.id === id ? { ...r, [field]: v } : r));
      set({ rows });
      const text = weightedObservation(rows);
      if (text) get().recordInteraction('group_edit', text, rowsSig(rows));
    },
    setRowLabel: (id, label) => {
      pushHistory();
      set({ rows: get().rows.map((r) => (r.id === id ? { ...r, label } : r)) });
    },
    setRowRounded: (id, rounded) => {
      pushHistory();
      set({ rows: get().rows.map((r) => (r.id === id ? { ...r, valueIsRounded: rounded } : r)) });
    },
    addRow: () => {
      if (get().rows.length >= 8) return;
      pushHistory();
      const n = get().rows.length + 1;
      const rows = [...get().rows, { id: newId('r'), label: `Group ${n}`, value: q(50), weight: q(1) } as WeightedItem];
      set({ rows });
      const text = weightedObservation(rows);
      if (text) get().recordInteraction('row_change', `Added a group. ${text}`, `add:${rowsSig(rows)}`);
    },
    removeRow: (id) => {
      if (get().rows.length <= 1) return;
      pushHistory();
      const rows = get().rows.filter((r) => r.id !== id);
      set({ rows });
      const text = weightedObservation(rows);
      if (text) get().recordInteraction('row_change', `Removed a group. ${text}`, `rm:${rowsSig(rows)}`);
    },
    scaleAllWeights: (k) => {
      if (cmp(k, ZERO) <= 0) return;
      pushHistory();
      const before = weightedMean(get().rows);
      const rows = scaleWeights(get().rows, k) as WeightedRow[];
      set({ rows });
      const after = weightedMean(rows);
      if (before.ok && after.ok) {
        get().recordInteraction('group_edit', `All weights × ${f(k)}: mean went from ${f(before.mean)} to ${f(after.mean)}${cmp(before.mean, after.mean) === 0 ? ' (unchanged)' : ''}`, `scale:${rowsSig(rows)}`);
      }
    },
    shiftAllWeights: (c) => {
      const rows0 = get().rows;
      const shifted = shiftWeights(rows0, c);
      if (shifted.some((r) => isNeg(r.weight))) return; // weights must stay non-negative
      pushHistory();
      const before = weightedMean(rows0);
      set({ rows: shifted as WeightedRow[] });
      const after = weightedMean(shifted);
      if (before.ok && after.ok) {
        get().recordInteraction('group_edit', `${isNeg(c) ? 'Subtracted' : 'Added'} ${f(abs(c))} ${isNeg(c) ? 'from' : 'to'} every weight: mean went from ${f(before.mean)} to ${f(after.mean)}${cmp(before.mean, after.mean) === 0 ? ' (unchanged)' : ''}`, `shift:${rowsSig(shifted)}`);
      }
    },

    // ----- mixture -----
    setConstituent: (id, patch) => {
      pushHistory();
      const solute = get().solute;
      const constituents = get().constituents.map((c) => {
        if (c.id !== id) return c;
        const { percent, ...rest } = patch;
        return { ...c, ...rest, solutes: percent !== undefined ? { ...c.solutes, [solute]: percent } : c.solutes };
      });
      set({ constituents });
      const text = mixtureObservation(constituents, solute);
      if (text) get().recordInteraction('mixture_edit', text, mixSig(constituents));
    },
    addConstituent: () => {
      if (get().constituents.length >= 4) return;
      pushHistory();
      const solute = get().solute;
      const constituents = [...get().constituents, { id: newId('m'), label: `Part ${get().constituents.length + 1}`, quantity: q(100), unit: get().constituents[0]?.unit ?? 'mL', solutes: { [solute]: q(0) } } as Constituent];
      set({ constituents });
      const text = mixtureObservation(constituents, solute);
      if (text) get().recordInteraction('mixture_edit', `Added a part. ${text}`, `add:${mixSig(constituents)}`);
    },
    removeConstituent: (id) => {
      if (get().constituents.length <= 1) return;
      pushHistory();
      const constituents = get().constituents.filter((c) => c.id !== id);
      set({ constituents });
      const text = mixtureObservation(constituents, get().solute);
      if (text) get().recordInteraction('mixture_edit', `Removed a part. ${text}`, `rm:${mixSig(constituents)}`);
    },

    // ----- charts -----
    setChartCell: (g, c, v) => {
      const r = setCell(get().dataset, g, c, v);
      if (!r.ok) return r.error;
      pushHistory();
      set({ dataset: r.dataset, oppositeCase: 0 });
      const ds = r.dataset;
      const gl = ds.groups.find((x) => x.id === g)!.label;
      const cl = ds.categories.find((x) => x.id === c)!.label;
      let extra = '';
      if (get().activeTab === 'average') {
        const r = averageDay(ds, get().popWeights);
        const row = r.ok ? r.rows.find((x) => x.categoryId === c) : undefined;
        if (row) extra = `; average ${cl} is now ${f(row.mean)} h`;
      }
      get().recordInteraction('chart_edit', `${gl} / ${cl} set to ${v ? f(v) : 'missing'}; ${gl} total is now ${f(groupTotal(ds, g))} ${ds.unit}${extra}`, dsSig(ds) + '|' + Object.values(get().popWeights).map(formatExact).join(','));
      return null;
    },
    addChartGroup: () => {
      const r = addGroup(get().dataset);
      if (!r.ok) return r.error;
      pushHistory();
      set({ dataset: r.dataset, oppositeCase: 0 });
      get().recordInteraction('chart_edit', `Added a group (${r.dataset.groups.length} groups now)`, `addg:${dsSig(r.dataset)}`);
      return null;
    },
    removeChartGroup: (id) => {
      const r = removeGroup(get().dataset, id);
      if (!r.ok) return r.error;
      pushHistory();
      set({ dataset: r.dataset, selected: null, oppositeCase: 0, pieGroupId: get().pieGroupId === id ? r.dataset.groups[0].id : get().pieGroupId });
      get().recordInteraction('chart_edit', `Removed a group (${r.dataset.groups.length} groups left)`, `rmg:${dsSig(r.dataset)}`);
      return null;
    },
    addChartCategory: () => {
      const r = addCategory(get().dataset);
      if (!r.ok) return r.error;
      pushHistory();
      set({ dataset: r.dataset, oppositeCase: 0 });
      get().recordInteraction('chart_edit', `Added a category (${r.dataset.categories.length} categories now)`, `addc:${dsSig(r.dataset)}`);
      return null;
    },
    removeChartCategory: (id) => {
      const r = removeCategory(get().dataset, id);
      if (!r.ok) return r.error;
      pushHistory();
      set({ dataset: r.dataset, selected: null, oppositeCase: 0 });
      get().recordInteraction('chart_edit', `Removed a category (${r.dataset.categories.length} left)`, `rmc:${dsSig(r.dataset)}`);
      return null;
    },
    renameChartGroup: (id, label) => {
      pushHistory();
      set({ dataset: renameGroup(get().dataset, id, label) });
    },
    renameChartCategory: (id, label) => {
      pushHistory();
      set({ dataset: renameCategory(get().dataset, id, label) });
    },
    replaceDataset: (ds) => {
      pushHistory();
      set({ dataset: ds, selected: null, oppositeCase: 0 });
    },
    allowedViews: () => {
      const s = get();
      if (s.isLocked()) return ['absolute'];
      if (!s.guidedActive) return ['absolute', 'percent', 'clustered', 'pie', 'both'];
      return UD_GUIDED_LESSONS[s.activeLessonId]?.allowedViews ?? ['absolute', 'percent', 'both'];
    },
    setChartView: (v) => {
      if (!get().allowedViews().includes(v)) return;
      set({ chartView: v });
      const { guidedActive, activeLessonId, lessons, activeStage } = get();
      const cur = lessons[activeLessonId];
      if (guidedActive && cur && activeStage !== 'understand' && activeStage !== 'predict' && !(cur.viewsSeen ?? []).includes(v)) {
        commit({ ...lessons, [activeLessonId]: { ...cur, viewsSeen: [...(cur.viewsSeen ?? []), v] } });
      }
      const names: Record<string, string> = { absolute: 'stacked (actual values)', percent: '100% stacked', both: 'side-by-side stacked and 100%', clustered: 'clustered-column', pie: 'pie' };
      get().recordInteraction('chart_toggle', `Switched to the ${names[v]} view of the same data`, `to:${v}`);
    },
    setClusterBy: (by) => set({ clusterBy: by }),
    setPieGroup: (id) => {
      set({ pieGroupId: id, selected: null });
    },
    setPopWeight: (id, w) => {
      if (isNeg(w)) return;
      const weights = { ...get().popWeights, [id]: w };
      set({ popWeights: weights });
      const ds = get().dataset;
      const r = averageDay(ds, weights);
      if (r.ok) {
        const c = closestGroup(ds, r.rows);
        const parts = r.rows.map((x) => `${ds.categories.find((k) => k.id === x.categoryId)?.label} ${f(x.mean)} h`).join(', ');
        get().recordInteraction('chart_edit', `Population weights ${ds.groups.map((g) => f(weights[g.id] ?? q(1))).join(' : ')} → average day: ${parts}${c ? `; closest real group: ${ds.groups.find((g) => g.id === c.groupId)?.label}, ${f(c.hoursToShift)} h different` : ''}`, `w:${Object.values(weights).map(formatExact).join(',')}`);
      }
    },
    selectSegment: (g, c) => {
      set({ selected: { groupId: g, categoryId: c } });
      const ds = get().dataset;
      const v = cell(ds, g, c);
      const sh = groupShares(ds, g);
      const gl = ds.groups.find((x) => x.id === g)?.label ?? g;
      const cl = ds.categories.find((x) => x.id === c)?.label ?? c;
      const pct = sh.status === 'ok' ? sh.rows.find((r) => r.categoryId === c)?.text : null;
      get().recordInteraction('segment_select', `${gl} / ${cl}: ${v ? f(v) : 'missing'} ${ds.unit}${pct ? ` = ${pct}% of ${gl}'s total ${f(groupTotal(ds, g))}` : ''}`, `${g}:${c}`);
    },
    showOppositeCase: (k) => {
      const ds = get().dataset;
      if (ds.groups.length < 2 || ds.categories.length < 1) return 'Add at least two groups first.';
      const oc = buildOppositeCases(ds, ds.groups[0].id, ds.groups[1].id, ds.categories[0].id);
      if (!oc) return 'These two groups have equal shares (or a zero share) for the first category, so no pair of datasets can flip their comparison.';
      set({ oppositeCase: k });
      const d = k === 1 ? oc.case1 : oc.case2;
      const a = cell(d, ds.groups[0].id, ds.categories[0].id);
      const b = cell(d, ds.groups[1].id, ds.categories[0].id);
      get().recordInteraction('calc_view', `Dataset ${k}: ${ds.groups[0].label} ${a ? f(a) : '?'} vs ${ds.groups[1].label} ${b ? f(b) : '?'} ${ds.categories[0].label}; the 100% chart is identical in both`, `case:${k}`);
      return null;
    },
    recordChallenge: (id, correct, text) => {
      set({ challengeResults: { ...get().challengeResults, [id]: { answered: true, correct } } });
      get().recordInteraction('challenge_answer', `${correct ? 'Correct' : 'Not yet'}: ${text}`, id);
    },

    // ----- guided -----
    setTeacherMode: (on) => set({ teacherMode: on }),
    setGuidedActive: (on) => set({ guidedActive: on }),

    selectLesson: (id, requestedStage) => {
      const lesson = UD_GUIDED_LESSONS[id];
      if (!lesson) return;
      const saved = get().lessons[id];
      // Resume where an unfinished lesson was left; finished lessons reopen at the start for review.
      const resume = saved && !saved.completed && lesson.stages.includes(saved.activeStage) ? saved.activeStage : 'understand';
      const stage: GuidedStageId = requestedStage ?? resume;
      const existing = saved ?? blankLesson(id, stage);
      get().setExperiment(lesson.experimentId);
      // A lesson whose results are hidden until the prediction must not open on the revealing view.
      const hidden = lesson.hidesResultsUntilPrediction && !existing.predictionMade;
      set({ activeLessonId: id, activeStage: stage, mode: 'explore', guidedActive: true, ...(hidden ? { chartView: 'absolute' as ChartView } : {}) });
      commit({ ...get().lessons, [id]: { ...existing, activeStage: stage } }, get().practiceAnswers, id);
    },
    setStage: (s) => set({ activeStage: s }),

    recordPrediction: (index, correct) => {
      const { activeLessonId, lessons } = get();
      const cur = lessons[activeLessonId];
      if (!cur || cur.predictionMade) return;
      commit({ ...lessons, [activeLessonId]: { ...cur, predictionMade: true, predictionOption: index, predictionIsCorrect: correct, stagesCompleted: { ...cur.stagesCompleted, predict: true } } });
    },

    recordNumericPrediction: (text) => {
      const { activeLessonId, lessons } = get();
      const cur = lessons[activeLessonId];
      const lesson = UD_GUIDED_LESSONS[activeLessonId];
      const np = lesson?.numericPrediction;
      if (!cur || !np || cur.predictionMade) return null;
      const v = parseQ(text);
      if (!v) return null;
      let verdict: NumericVerdict = 'other';
      if (cmp(v, np.correct) === 0) verdict = 'exact';
      else if (np.naive && cmp(v, np.naive) === 0) verdict = 'naive';
      else if (cmp(abs(sub(v, np.correct)), np.closeWithin) <= 0) verdict = 'close';
      commit({ ...lessons, [activeLessonId]: { ...cur, predictionMade: true, predictionText: text.trim(), predictionVerdict: verdict, predictionIsCorrect: verdict === 'exact', stagesCompleted: { ...cur.stagesCompleted, predict: true } } });
      return verdict;
    },

    recordInteraction: (kind, text, key) => {
      const { activeLessonId, lessons } = get();
      const cur = lessons[activeLessonId];
      if (!get().guidedActive || !cur || get().activeStage === 'understand' || get().activeStage === 'predict') return false;
      const target = UD_GUIDED_LESSONS[activeLessonId]?.targetMetric;
      const countKey = `${kind}:${key}`;
      const already = cur.countedKeys.includes(countKey);
      const qualifies = kind === target && !already;
      const dup = cur.observations.some((o) => o.kind === kind && o.text === text);
      const observations = dup ? cur.observations : [...cur.observations, { kind, text, at: Date.now() }].slice(-OBSERVATION_LIMIT);
      commit({
        ...lessons,
        [activeLessonId]: {
          ...cur,
          observations,
          interactionsRecorded: cur.interactionsRecorded + (qualifies ? 1 : 0),
          countedKeys: already ? cur.countedKeys : [...cur.countedKeys, countKey].slice(-300),
        },
      });
      return qualifies;
    },

    canAdvance: () => {
      const gate = evaluateGate(get());
      if (get().teacherMode) return { ok: true, reason: gate.ok ? '' : 'Teacher demonstration: gates are bypassed and mastery will not be recorded.' };
      return gate;
    },

    isLocked: () => {
      const s = get();
      if (!s.guidedActive) return false;
      const lesson = UD_GUIDED_LESSONS[s.activeLessonId];
      const p = s.lessons[s.activeLessonId];
      return Boolean(lesson?.hidesResultsUntilPrediction && p && !p.predictionMade);
    },

    advanceToNextStage: () => {
      const { activeLessonId, activeStage, lessons, teacherMode } = get();
      const lesson = UD_GUIDED_LESSONS[activeLessonId];
      const cur = lessons[activeLessonId];
      if (!lesson || !cur) return;
      const real = evaluateGate(get());
      if (!real.ok && !teacherMode) return;
      const bypassed = !real.ok && teacherMode;
      const updated: UDLessonProgress = {
        ...cur,
        stagesCompleted: { ...cur.stagesCompleted, [activeStage]: !bypassed },
        teacherBypassed: cur.teacherBypassed || bypassed,
      };
      const idx = lesson.stages.indexOf(activeStage);
      if (idx >= 0 && idx < lesson.stages.length - 1) {
        const next = lesson.stages[idx + 1];
        set({ activeStage: next });
        commit({ ...lessons, [activeLessonId]: { ...updated, activeStage: next } });
      } else {
        commit({ ...lessons, [activeLessonId]: updated });
        get().completeLesson(activeLessonId);
      }
    },

    completeLesson: (id) => {
      const { lessons, practiceAnswers } = get();
      const cur = lessons[id];
      if (!cur) return;
      const updated: UDLessonProgress = { ...cur, completed: true };
      updated.mastered = masteryEarned(updated, practiceAnswers);
      if (updated.mastered) updated.legacyMasteryUnverified = false;
      commit({ ...lessons, [id]: updated });
    },

    resetProgress: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      set({ lessons: {}, practiceAnswers: {}, activeStage: 'understand', activeLessonId: 'ud-l1' });
    },

    getCompletionStats: () => {
      const { lessons } = get();
      const total = UD_LESSON_ORDER.length;
      // Only the 13 required lessons count toward the chapter percentage; optional extensions have their own status.
      const completed = UD_LESSON_ORDER.filter((id) => lessons[id]?.completed).length;
      const mastered = UD_LESSON_ORDER.filter((id) => lessons[id]?.mastered).length;
      const inProgress = UD_LESSON_ORDER.find((id) => lessonStatus(lessons[id]) === 'attempted') ?? UD_OPTIONAL_LESSON_IDS.find((id) => lessonStatus(lessons[id]) === 'attempted');
      const next = inProgress ?? UD_LESSON_ORDER.find((id) => !lessons[id]?.completed) ?? UD_LESSON_ORDER[0];
      return { completed, mastered, total, percentage: total ? Math.round((completed / total) * 100) : 0, nextRecommendedLessonId: next };
    },

    // ----- practice -----
    selectPracticeQuestion: (id) => set({ activePracticeQuestionId: id }),
    setPracticeDifficultyFilter: (d) => set({ practiceDifficultyFilter: d }),
    submitPracticeAnswer: (id, text, correct) => {
      const prev = get().practiceAnswers[id];
      const first = !prev || prev.attempts === 0;
      const helped = Boolean(prev && (prev.assisted || prev.hintsRevealed > 0 || prev.showSolution));
      commit(get().lessons, {
        ...get().practiceAnswers,
        [id]: {
          userAnswerText: text,
          isCorrect: correct,
          // Only the FIRST answer decides independence, and help before it rules it out for good.
          firstAttemptCorrect: first ? correct && !helped : prev!.firstAttemptCorrect,
          attempts: (prev?.attempts ?? 0) + 1,
          hintsRevealed: prev?.hintsRevealed ?? 0,
          showSolution: prev?.showSolution ?? false,
          assisted: first ? helped : Boolean(prev?.assisted),
        },
      });
    },
    revealPracticeHint: (id) => {
      const prev = get().practiceAnswers[id];
      const before = !prev || prev.attempts === 0;
      const next: UDPracticeAttempt = prev
        ? { ...prev, hintsRevealed: prev.hintsRevealed + 1, assisted: prev.assisted || before }
        : { userAnswerText: '', isCorrect: false, firstAttemptCorrect: false, attempts: 0, hintsRevealed: 1, showSolution: false, assisted: true };
      commit(get().lessons, { ...get().practiceAnswers, [id]: next });
    },
    togglePracticeSolution: (id) => {
      const prev = get().practiceAnswers[id];
      const before = !prev || prev.attempts === 0;
      const next: UDPracticeAttempt = prev
        ? { ...prev, showSolution: !prev.showSolution, assisted: prev.assisted || before }
        : { userAnswerText: '', isCorrect: false, firstAttemptCorrect: false, attempts: 0, hintsRevealed: 0, showSolution: true, assisted: true };
      commit(get().lessons, { ...get().practiceAnswers, [id]: next });
    },
    retryPracticeQuestion: (id) => {
      const prev = get().practiceAnswers[id];
      if (!prev) return;
      commit(get().lessons, { ...get().practiceAnswers, [id]: { ...prev, userAnswerText: '', isCorrect: false, showSolution: false } });
    },
  };
});

