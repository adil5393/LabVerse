/**
 * Two Variables, One Line — Zustand store (Milestone M5).
 *
 * Independent of every other chapter's store. Only chapter-neutral types are
 * shared. High-frequency pointer state (drag positions, viewport) is NOT kept
 * here; components hold it locally and commit discrete results.
 *
 * Storage key: 'labverse_two_variables_progress_v1'
 */

import { create } from 'zustand';
import type { GuidedStageId } from '../engine/mathematics/guidedLearning/types';
import { type LinearEq, parseEquation, makeEq } from '../engine/mathematics/twoVariables/linearEquation';
import { add, type Rational } from '../engine/mathematics/twoVariables/rational';
import { getTVExperiment } from '../engine/mathematics/twoVariables/experimentRegistry';
import { TV_GUIDED_LESSONS, TV_LESSON_ORDER, TV_LESSON_TARGETS } from '../engine/mathematics/twoVariables/curriculumPath';
import type {
  InteractionKind,
  PracticeDifficulty,
  RecordedObservation,
  TVMode,
  TVWorkbenchTab,
} from '../engine/mathematics/twoVariables/types';

const STORAGE_KEY = 'labverse_two_variables_progress_v1';
const HISTORY_LIMIT = 50;
const OBSERVATION_LIMIT = 40;
export const MASTERY_THRESHOLD = 0.7;

const emptyStages = (): Record<GuidedStageId, boolean> => ({
  understand: false,
  predict: false,
  experiment: false,
  observe: false,
  explain: false,
  practice: false,
});

export interface TVLessonProgress {
  lessonId: string;
  completed: boolean;
  /** True only when the student earned it: no bypass, real interactions, prediction made, practice passed. */
  mastered: boolean;
  teacherBypassed: boolean;
  activeStage: GuidedStageId;
  stagesCompleted: Record<GuidedStageId, boolean>;
  predictionSelectedOption?: number;
  predictionIsCorrect?: boolean;
  /** Counted qualifying student interactions (distinct for solution/table/drag kinds). */
  interactionsRecorded: number;
  observations: RecordedObservation[];
  /** Keys already counted, to keep distinct-only kinds honest. */
  countedKeys: string[];
}

export interface TVPracticeAttempt {
  userAnswerText: string;
  isCorrect: boolean;
  firstAttemptCorrect: boolean;
  attempts: number;
  hintsRevealed: number;
  showSolution: boolean;
}

interface EquationPair {
  eq1: LinearEq;
  eq2: LinearEq;
}

export interface TwoVariablesState {
  currentExperimentId: string;
  activeTab: TVWorkbenchTab;
  mode: TVMode;

  eq1: LinearEq;
  eq2: LinearEq;
  past: EquationPair[];
  future: EquationPair[];
  liveGesture: boolean;

  tableRows: { x: Rational; y: Rational }[];

  activeLessonId: string;
  activeStage: GuidedStageId;
  teacherMode: boolean;
  /** True only inside a guided lesson; the free laboratory never records lesson progress. */
  guidedActive: boolean;
  lessons: Record<string, TVLessonProgress>;

  activePracticeQuestionId: string;
  practiceDifficultyFilter: PracticeDifficulty | 'all';
  practiceAnswers: Record<string, TVPracticeAttempt>;

  // Laboratory
  setExperiment: (id: string) => void;
  setActiveTab: (tab: TVWorkbenchTab) => void;
  setMode: (mode: TVMode) => void;
  setEquation: (which: 1 | 2, eq: LinearEq, recordKind?: InteractionKind) => void;
  /** For continuous drags: one undo entry per gesture; `final` ends the gesture and records the interaction. */
  setEquationLive: (which: 1 | 2, eq: LinearEq, final: boolean) => void;
  nudgeCoefficient: (which: 1 | 2, key: 'a' | 'b' | 'c', delta: Rational) => void;
  undo: () => void;
  redo: () => void;
  addTableRow: (x: Rational, y: Rational) => boolean;
  removeTableRow: (index: number) => void;
  clearTable: () => void;

  // Guided
  setTeacherMode: (on: boolean) => void;
  setGuidedActive: (on: boolean) => void;
  selectLesson: (lessonId: string, initialStage?: GuidedStageId) => void;
  setStage: (stage: GuidedStageId) => void;
  recordPrediction: (optionIndex: number, isCorrect: boolean) => void;
  recordInteraction: (kind: InteractionKind, text: string, key?: string) => boolean;
  canAdvance: () => { ok: boolean; reason: string };
  advanceToNextStage: () => void;
  completeLesson: (lessonId: string) => void;
  resetProgress: () => void;
  getCompletionStats: () => {
    completedLessonsCount: number;
    masteredLessonsCount: number;
    totalLessonsCount: number;
    completionPercentage: number;
    nextRecommendedLessonId: string;
  };

  // Practice
  selectPracticeQuestion: (id: string) => void;
  setPracticeDifficultyFilter: (d: PracticeDifficulty | 'all') => void;
  submitPracticeAnswer: (questionId: string, answerText: string, isCorrect: boolean) => void;
  revealPracticeHint: (questionId: string) => void;
  togglePracticeSolution: (questionId: string) => void;
  retryPracticeQuestion: (questionId: string) => void;
}

function eqFromText(text: string, fallback: LinearEq): LinearEq {
  const r = parseEquation(text);
  return r.ok && r.equation ? r.equation : fallback;
}

const DEFAULT_EQ1 = makeEq(2, 3, -12);
const DEFAULT_EQ2 = makeEq(1, 1, -5);

interface Persisted {
  lessons: Record<string, TVLessonProgress>;
  practiceAnswers: Record<string, TVPracticeAttempt>;
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessons: {}, practiceAnswers: {} };
    const parsed = JSON.parse(raw);
    return {
      lessons: typeof parsed.lessons === 'object' && parsed.lessons ? parsed.lessons : {},
      practiceAnswers: typeof parsed.practiceAnswers === 'object' && parsed.practiceAnswers ? parsed.practiceAnswers : {},
    };
  } catch {
    return { lessons: {}, practiceAnswers: {} };
  }
}

function persist(lessons: Record<string, TVLessonProgress>, practiceAnswers: Record<string, TVPracticeAttempt>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, updatedAt: Date.now(), lessons, practiceAnswers }));
  } catch {
    // Storage may be full or unavailable; progress simply stays in memory.
  }
}

/** An entry only counts as answered once a real answer was submitted (hints alone do not count). */
export const hasAnswered = (a: TVPracticeAttempt | undefined): boolean => Boolean(a && a.attempts > 0);

const blankLesson = (lessonId: string, stage: GuidedStageId): TVLessonProgress => ({
  lessonId,
  completed: false,
  mastered: false,
  teacherBypassed: false,
  activeStage: stage,
  stagesCompleted: emptyStages(),
  interactionsRecorded: 0,
  observations: [],
  countedKeys: [],
});

/** Kinds where only distinct results count (so repeating one action cannot satisfy a gate). */
const DISTINCT_KINDS: InteractionKind[] = ['solution_found', 'table_row', 'point_drag'];

function lessonMasteryEarned(
  p: TVLessonProgress,
  practiceAnswers: Record<string, TVPracticeAttempt>
): boolean {
  const lesson = TV_GUIDED_LESSONS[p.lessonId];
  if (!lesson || p.teacherBypassed) return false;
  const needed = lesson.experimentGuide.minInteractionsNeeded ?? 0;
  if (lesson.stages.includes('predict') && p.predictionSelectedOption === undefined) return false;
  if (p.interactionsRecorded < needed) return false;
  const ids = lesson.practiceQuestionIds;
  if (ids.length === 0) return true;
  const firsts = ids.map((id) => practiceAnswers[id]);
  if (firsts.some((a) => !hasAnswered(a))) return false;
  const correct = firsts.filter((a) => a.firstAttemptCorrect).length;
  return correct / ids.length >= MASTERY_THRESHOLD;
}

function evaluateGate(state: TwoVariablesState): { ok: boolean; reason: string } {
  const { activeLessonId, activeStage, lessons, practiceAnswers } = state;
  const lesson = TV_GUIDED_LESSONS[activeLessonId];
  const p = lessons[activeLessonId];
  if (!lesson || !p) return { ok: false, reason: 'Select a lesson first.' };
  switch (activeStage) {
    case 'predict':
      return p.predictionSelectedOption !== undefined
        ? { ok: true, reason: '' }
        : { ok: false, reason: 'Choose an answer to your prediction first.' };
    case 'experiment': {
      const needed = lesson.experimentGuide.minInteractionsNeeded ?? 0;
      return p.interactionsRecorded >= needed
        ? { ok: true, reason: '' }
        : { ok: false, reason: `Do the experiment first: ${p.interactionsRecorded} of ${needed} done.` };
    }
    case 'observe':
      return p.observations.length > 0
        ? { ok: true, reason: '' }
        : { ok: false, reason: 'Your experiment results will be listed here once you have done the experiment.' };
    case 'practice': {
      const unanswered = lesson.practiceQuestionIds.filter((id) => !hasAnswered(practiceAnswers[id])).length;
      return unanswered === 0
        ? { ok: true, reason: '' }
        : { ok: false, reason: `Answer ${unanswered} more practice question${unanswered === 1 ? '' : 's'}.` };
    }
    default:
      return { ok: true, reason: '' };
  }
}

export const useTwoVariablesStore = create<TwoVariablesState>((set, get) => {
  const persisted = loadPersisted();

  const commitProgress = (lessons: Record<string, TVLessonProgress>, practiceAnswers = get().practiceAnswers) => {
    set({ lessons, practiceAnswers });
    persist(lessons, practiceAnswers);
  };

  return {
    currentExperimentId: 'tv-standard-form',
    activeTab: 'graph',
    mode: 'explore',

    eq1: DEFAULT_EQ1,
    eq2: DEFAULT_EQ2,
    past: [],
    future: [],
    liveGesture: false,

    tableRows: [],

    activeLessonId: 'tv-l1',
    activeStage: 'understand',
    teacherMode: false,
    guidedActive: false,
    lessons: persisted.lessons,

    activePracticeQuestionId: 'q-tv-1',
    practiceDifficultyFilter: 'all',
    practiceAnswers: persisted.practiceAnswers,

    setExperiment: (id) => {
      const exp = getTVExperiment(id);
      set({
        currentExperimentId: exp.id,
        activeTab: exp.defaultTab,
        eq1: eqFromText(exp.eq1, DEFAULT_EQ1),
        eq2: exp.eq2 ? eqFromText(exp.eq2, DEFAULT_EQ2) : DEFAULT_EQ2,
        past: [],
        future: [],
        liveGesture: false,
        tableRows: [],
      });
    },

    setActiveTab: (tab) => set({ activeTab: tab }),
    setMode: (mode) => set({ mode }),

    setEquation: (which, eq, recordKind) => {
      const { eq1, eq2, past } = get();
      const prev = { eq1, eq2 };
      const next = which === 1 ? { eq1: eq, eq2 } : { eq1, eq2: eq };
      set({ ...next, past: [...past, prev].slice(-HISTORY_LIMIT), future: [] });
      if (recordKind) {
        const label = which === 1 ? 'Equation 1' : 'Equation 2';
        get().recordInteraction(recordKind, `${label} changed to a=${eq.a.n}/${eq.a.d}, b=${eq.b.n}/${eq.b.d}, c=${eq.c.n}/${eq.c.d}`);
      }
    },

    setEquationLive: (which, eq, final) => {
      const { eq1, eq2, past, liveGesture } = get();
      const next = which === 1 ? { eq1: eq, eq2 } : { eq1, eq2: eq };
      if (!liveGesture) {
        set({ ...next, past: [...past, { eq1, eq2 }].slice(-HISTORY_LIMIT), future: [], liveGesture: !final });
      } else {
        set({ ...next, liveGesture: !final });
      }
      if (final) {
        const kind: InteractionKind = get().activeTab === 'system' ? 'system_edit' : 'coefficient_change';
        get().recordInteraction(kind, `Line ${which} moved: ${eq.a.n}/${eq.a.d}x + ${eq.b.n}/${eq.b.d}y + ${eq.c.n}/${eq.c.d} = 0`);
      }
    },

    nudgeCoefficient: (which, key, delta) => {
      const cur = which === 1 ? get().eq1 : get().eq2;
      const next: LinearEq = { ...cur, [key]: add(cur[key], delta) };
      const kind: InteractionKind = get().activeTab === 'system' ? 'system_edit' : 'coefficient_change';
      get().setEquation(which, next, kind);
    },

    undo: () => {
      const { past, future, eq1, eq2 } = get();
      if (past.length === 0) return;
      const prev = past[past.length - 1];
      set({ ...prev, past: past.slice(0, -1), future: [{ eq1, eq2 }, ...future].slice(0, HISTORY_LIMIT) });
    },

    redo: () => {
      const { past, future, eq1, eq2 } = get();
      if (future.length === 0) return;
      const [next, ...rest] = future;
      set({ ...next, past: [...past, { eq1, eq2 }].slice(-HISTORY_LIMIT), future: rest });
    },

    addTableRow: (x, y) => {
      const rows = get().tableRows;
      if (rows.some((r) => r.x.n === x.n && r.x.d === x.d)) return false;
      set({ tableRows: [...rows, { x, y }] });
      return true;
    },
    removeTableRow: (index) => set({ tableRows: get().tableRows.filter((_, i) => i !== index) }),
    clearTable: () => set({ tableRows: [] }),

    setTeacherMode: (on) => set({ teacherMode: on }),
    setGuidedActive: (on) => set({ guidedActive: on }),

    selectLesson: (lessonId, initialStage = 'understand') => {
      const lesson = TV_GUIDED_LESSONS[lessonId];
      if (!lesson) return;
      const existing = get().lessons[lessonId] ?? blankLesson(lessonId, initialStage);
      get().setExperiment(lesson.experimentId);
      set({ activeLessonId: lessonId, activeStage: initialStage, mode: 'explore', guidedActive: true });
      commitProgress({ ...get().lessons, [lessonId]: { ...existing, activeStage: initialStage } });
    },

    setStage: (stage) => set({ activeStage: stage }),

    recordPrediction: (optionIndex, isCorrect) => {
      const { activeLessonId, lessons } = get();
      const cur = lessons[activeLessonId];
      if (!cur || cur.predictionSelectedOption !== undefined) return; // first prediction stands
      commitProgress({
        ...lessons,
        [activeLessonId]: {
          ...cur,
          predictionSelectedOption: optionIndex,
          predictionIsCorrect: isCorrect,
          stagesCompleted: { ...cur.stagesCompleted, predict: true },
        },
      });
    },

    recordInteraction: (kind, text, key) => {
      const { activeLessonId, lessons } = get();
      const cur = lessons[activeLessonId];
      if (!get().guidedActive || !cur || get().activeStage === 'understand') return false;
      const target = TV_LESSON_TARGETS[activeLessonId];
      const countKey = `${kind}:${key ?? text}`;
      const distinct = DISTINCT_KINDS.includes(kind);
      const alreadyCounted = cur.countedKeys.includes(countKey);
      const qualifies = kind === target && !(distinct && alreadyCounted);
      const obs: RecordedObservation = { kind, text, at: Date.now() };
      const duplicateObservation = cur.observations.some((o) => o.kind === kind && o.text === text);
      const observations = duplicateObservation ? cur.observations : [...cur.observations, obs].slice(-OBSERVATION_LIMIT);
      const updated: TVLessonProgress = {
        ...cur,
        observations,
        interactionsRecorded: cur.interactionsRecorded + (qualifies ? 1 : 0),
        countedKeys: distinct && !alreadyCounted ? [...cur.countedKeys, countKey].slice(-200) : cur.countedKeys,
      };
      commitProgress({ ...lessons, [activeLessonId]: updated });
      return qualifies;
    },

    canAdvance: () => {
      const gate = evaluateGate(get());
      if (get().teacherMode) {
        return { ok: true, reason: gate.ok ? '' : 'Teacher demonstration: gates are bypassed and mastery will not be recorded.' };
      }
      return gate;
    },

    advanceToNextStage: () => {
      const { activeLessonId, activeStage, lessons, teacherMode } = get();
      const lesson = TV_GUIDED_LESSONS[activeLessonId];
      const cur = lessons[activeLessonId];
      if (!lesson || !cur) return;
      const realGate = evaluateGate(get());
      if (!realGate.ok && !teacherMode) return;
      // A bypass is recorded only when a real gate would have blocked the step.
      const bypassed = !realGate.ok && teacherMode;
      const updated: TVLessonProgress = {
        ...cur,
        stagesCompleted: { ...cur.stagesCompleted, [activeStage]: !bypassed },
        teacherBypassed: cur.teacherBypassed || bypassed,
      };
      const idx = lesson.stages.indexOf(activeStage);
      if (idx >= 0 && idx < lesson.stages.length - 1) {
        const next = lesson.stages[idx + 1];
        set({ activeStage: next });
        commitProgress({ ...lessons, [activeLessonId]: { ...updated, activeStage: next } });
      } else {
        commitProgress({ ...lessons, [activeLessonId]: updated });
        get().completeLesson(activeLessonId);
      }
    },

    completeLesson: (lessonId) => {
      const { lessons, practiceAnswers } = get();
      const cur = lessons[lessonId];
      if (!cur) return;
      const updated: TVLessonProgress = { ...cur, completed: true };
      updated.mastered = lessonMasteryEarned(updated, practiceAnswers);
      commitProgress({ ...lessons, [lessonId]: updated });
    },

    resetProgress: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      set({ lessons: {}, practiceAnswers: {}, activeStage: 'understand' });
    },

    getCompletionStats: () => {
      const { lessons } = get();
      const total = TV_LESSON_ORDER.length;
      const completed = TV_LESSON_ORDER.filter((id) => lessons[id]?.completed).length;
      const mastered = TV_LESSON_ORDER.filter((id) => lessons[id]?.mastered).length;
      const next = TV_LESSON_ORDER.find((id) => !lessons[id]?.completed) ?? TV_LESSON_ORDER[0];
      return {
        completedLessonsCount: completed,
        masteredLessonsCount: mastered,
        totalLessonsCount: total,
        completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        nextRecommendedLessonId: next,
      };
    },

    selectPracticeQuestion: (id) => set({ activePracticeQuestionId: id }),
    setPracticeDifficultyFilter: (d) => set({ practiceDifficultyFilter: d }),

    submitPracticeAnswer: (questionId, answerText, isCorrect) => {
      const prev = get().practiceAnswers[questionId];
      const attempt: TVPracticeAttempt = {
        userAnswerText: answerText,
        isCorrect,
        firstAttemptCorrect: prev ? prev.firstAttemptCorrect : isCorrect,
        attempts: (prev?.attempts ?? 0) + 1,
        hintsRevealed: prev?.hintsRevealed ?? 0,
        showSolution: prev?.showSolution ?? false,
      };
      commitProgress(get().lessons, { ...get().practiceAnswers, [questionId]: attempt });
    },

    revealPracticeHint: (questionId) => {
      const prev = get().practiceAnswers[questionId];
      // Hints before an answer are tracked without creating an "answered" entry.
      const attempt: TVPracticeAttempt = prev
        ? { ...prev, hintsRevealed: prev.hintsRevealed + 1 }
        : { userAnswerText: '', isCorrect: false, firstAttemptCorrect: false, attempts: 0, hintsRevealed: 1, showSolution: false };
      commitProgress(get().lessons, { ...get().practiceAnswers, [questionId]: attempt });
    },

    togglePracticeSolution: (questionId) => {
      const prev = get().practiceAnswers[questionId];
      const attempt: TVPracticeAttempt = prev
        ? { ...prev, showSolution: !prev.showSolution }
        : { userAnswerText: '', isCorrect: false, firstAttemptCorrect: false, attempts: 0, hintsRevealed: 0, showSolution: true };
      commitProgress(get().lessons, { ...get().practiceAnswers, [questionId]: attempt });
    },

    retryPracticeQuestion: (questionId) => {
      const prev = get().practiceAnswers[questionId];
      if (!prev) return;
      // Keep first-attempt record and hint count; clear the displayed answer so the student can retry.
      commitProgress(get().lessons, {
        ...get().practiceAnswers,
        [questionId]: { ...prev, userAnswerText: '', isCorrect: false, showSolution: false },
      });
    },
  };
});
