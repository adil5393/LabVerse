/**
 * Propositions & Their Converses Zustand State Store (Milestone M4)
 * Class 9 NCERT Ganita Manjari
 *
 * Independent, decoupled module state with local progress persistence.
 * Storage Key: 'labverse_propositions_progress_v1'
 */

import { create } from 'zustand';
import type {
  PropositionsWorkbenchTab,
  PropositionsMode,
  PracticeDifficulty,
} from '../engine/mathematics/propositions/types';
import type { GuidedStageId } from '../engine/mathematics/guidedLearning/types';
import { getExperimentById } from '../engine/mathematics/propositions/experimentRegistry';
import { PROP_GUIDED_LESSONS } from '../engine/mathematics/propositions/curriculumPath';

const STORAGE_KEY = 'labverse_propositions_progress_v1';

export interface LessonProgressItem {
  lessonId: string;
  completed: boolean;
  mastered: boolean;
  activeStage: GuidedStageId;
  stagesCompleted: Record<GuidedStageId, boolean>;
  predictionSelectedOption?: number;
  predictionIsCorrect?: boolean;
}

export interface PropositionsState {
  currentExperimentId: string;
  activeTab: PropositionsWorkbenchTab;
  mode: PropositionsMode;

  // Statement & Converse State
  selectedPropositionId: string;
  isConverseView: boolean;

  // Counterexample Lab State
  testedNumber: number;
  counterexampleSearchRange: { start: number; end: number };
  searchResultNotice: string | null;

  // Number Property Experiment State
  numberPropertyInput: number;

  // Geometric Reasoning State
  triangleSides: { a: number; b: number; c: number };
  selectedQuadType: 'rectangle' | 'isosceles_trapezium' | 'square' | 'rhombus' | 'general';

  // Proof Workbench State
  selectedProofTemplateId: string;
  assembledProofSteps: { statementId: string; reasonId: string }[];
  proofVerificationStatus: 'idle' | 'valid' | 'invalid';
  proofFeedback: string | null;

  // Guided Learning State
  activeLessonId: string;
  activeStage: GuidedStageId;
  lessons: Record<string, LessonProgressItem>;

  // Practice Engine State
  activePracticeQuestionId: string;
  practiceDifficultyFilter: PracticeDifficulty | 'all';
  practiceAnswers: Record<
    string,
    {
      userAnswer: string | number;
      isCorrect: boolean;
      hintsRevealed: number;
      showSolution: boolean;
    }
  >;

  // Actions
  setExperiment: (id: string) => void;
  setActiveTab: (tab: PropositionsWorkbenchTab) => void;
  setMode: (mode: PropositionsMode) => void;

  setSelectedPropositionId: (id: string) => void;
  toggleConverseView: () => void;
  setTestedNumber: (n: number) => void;
  setSearchRange: (start: number, end: number) => void;
  setSearchResultNotice: (notice: string | null) => void;

  setNumberPropertyInput: (n: number) => void;

  setTriangleSides: (a: number, b: number, c: number) => void;
  setSelectedQuadType: (
    type: 'rectangle' | 'isosceles_trapezium' | 'square' | 'rhombus' | 'general'
  ) => void;

  setSelectedProofTemplate: (id: string) => void;
  addProofStep: (statementId: string, reasonId: string) => void;
  removeProofStep: (index: number) => void;
  clearProofSteps: () => void;
  setProofFeedback: (status: 'idle' | 'valid' | 'invalid', msg: string | null) => void;

  // Guided learning actions
  selectLesson: (lessonId: string, initialStage?: GuidedStageId) => void;
  setStage: (stage: GuidedStageId) => void;
  recordPrediction: (optionIndex: number, isCorrect: boolean) => void;
  completeCurrentStage: () => void;
  advanceToNextStage: () => void;
  completeLesson: (lessonId: string) => void;
  resetProgress: () => void;

  getCompletionStats: () => {
    completedLessonsCount: number;
    totalLessonsCount: number;
    completionPercentage: number;
    nextRecommendedLessonId: string;
  };

  // Practice engine actions
  selectPracticeQuestion: (id: string) => void;
  setPracticeDifficultyFilter: (diff: PracticeDifficulty | 'all') => void;
  submitPracticeAnswer: (questionId: string, answer: string | number, isCorrect: boolean) => void;
  revealPracticeHint: (questionId: string) => void;
  togglePracticeSolution: (questionId: string) => void;
  retryPracticeQuestion: (questionId: string) => void;
}

function loadPersistedProgress(): Record<string, LessonProgressItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed.lessons || {};
  } catch {
    return {};
  }
}

function persistProgress(lessons: Record<string, LessonProgressItem>) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: Date.now(),
        lessons,
      })
    );
  } catch {
    // Ignore storage quota errors
  }
}

export const usePropositionsStore = create<PropositionsState>((set, get) => {
  const persistedLessons = loadPersistedProgress();

  return {
    currentExperimentId: 'exp-prop-classification',
    activeTab: 'statement_explorer',
    mode: 'explore',

    selectedPropositionId: 'prop-div6-div3',
    isConverseView: false,

    testedNumber: 9,
    counterexampleSearchRange: { start: 1, end: 50 },
    searchResultNotice: null,

    numberPropertyInput: 12,

    triangleSides: { a: 3, b: 4, c: 5 },
    selectedQuadType: 'isosceles_trapezium',

    selectedProofTemplateId: 'proof-sum-even',
    assembledProofSteps: [],
    proofVerificationStatus: 'idle',
    proofFeedback: null,

    activeLessonId: 'prop-l1',
    activeStage: 'understand',
    lessons: persistedLessons,

    activePracticeQuestionId: 'q-prop-1',
    practiceDifficultyFilter: 'all',
    practiceAnswers: {},

    setExperiment: (id: string) => {
      const exp = getExperimentById(id);
      set({
        currentExperimentId: exp.id,
        activeTab: exp.defaultTab,
        selectedPropositionId: exp.primaryPropositionId || get().selectedPropositionId,
        isConverseView: false,
      });
    },

    setActiveTab: (tab: PropositionsWorkbenchTab) => {
      set({ activeTab: tab });
    },

    setMode: (mode: PropositionsMode) => {
      set({ mode });
    },

    setSelectedPropositionId: (id: string) => {
      set({ selectedPropositionId: id, isConverseView: false });
    },

    toggleConverseView: () => {
      set((state) => ({ isConverseView: !state.isConverseView }));
    },

    setTestedNumber: (n: number) => {
      set({ testedNumber: n });
    },

    setSearchRange: (start: number, end: number) => {
      set({ counterexampleSearchRange: { start, end } });
    },

    setSearchResultNotice: (notice: string | null) => {
      set({ searchResultNotice: notice });
    },

    setNumberPropertyInput: (n: number) => {
      set({ numberPropertyInput: n });
    },

    setTriangleSides: (a: number, b: number, c: number) => {
      set({ triangleSides: { a, b, c } });
    },

    setSelectedQuadType: (type) => {
      set({ selectedQuadType: type });
    },

    setSelectedProofTemplate: (id: string) => {
      set({
        selectedProofTemplateId: id,
        assembledProofSteps: [],
        proofVerificationStatus: 'idle',
        proofFeedback: null,
      });
    },

    addProofStep: (statementId: string, reasonId: string) => {
      set((state) => ({
        assembledProofSteps: [
          ...state.assembledProofSteps,
          { statementId, reasonId },
        ],
        proofVerificationStatus: 'idle',
        proofFeedback: null,
      }));
    },

    removeProofStep: (index: number) => {
      set((state) => ({
        assembledProofSteps: state.assembledProofSteps.filter((_, idx) => idx !== index),
        proofVerificationStatus: 'idle',
        proofFeedback: null,
      }));
    },

    clearProofSteps: () => {
      set({
        assembledProofSteps: [],
        proofVerificationStatus: 'idle',
        proofFeedback: null,
      });
    },

    setProofFeedback: (status, msg) => {
      set({ proofVerificationStatus: status, proofFeedback: msg });
    },

    // Guided Learning implementation
    selectLesson: (lessonId: string, initialStage = 'understand') => {
      const lesson = PROP_GUIDED_LESSONS[lessonId];
      if (!lesson) return;

      const currentProgress = get().lessons[lessonId] || {
        lessonId,
        completed: false,
        mastered: false,
        activeStage: initialStage,
        stagesCompleted: {
          understand: false,
          predict: false,
          experiment: false,
          observe: false,
          explain: false,
          practice: false,
        },
      };

      set({
        activeLessonId: lessonId,
        activeStage: initialStage,
        currentExperimentId: lesson.experimentId,
        activeTab: getExperimentById(lesson.experimentId).defaultTab,
        selectedPropositionId:
          getExperimentById(lesson.experimentId).primaryPropositionId ||
          get().selectedPropositionId,
      });

      const updated = {
        ...get().lessons,
        [lessonId]: currentProgress,
      };
      set({ lessons: updated });
      persistProgress(updated);
    },

    setStage: (stage: GuidedStageId) => {
      set({ activeStage: stage });
    },

    recordPrediction: (optionIndex: number, isCorrect: boolean) => {
      const { activeLessonId, lessons } = get();
      const current = lessons[activeLessonId];
      if (!current) return;

      const updatedLesson: LessonProgressItem = {
        ...current,
        predictionSelectedOption: optionIndex,
        predictionIsCorrect: isCorrect,
        stagesCompleted: {
          ...current.stagesCompleted,
          predict: true,
        },
      };

      const updated = { ...lessons, [activeLessonId]: updatedLesson };
      set({ lessons: updated });
      persistProgress(updated);
    },

    completeCurrentStage: () => {
      const { activeLessonId, activeStage, lessons } = get();
      const current = lessons[activeLessonId];
      if (!current) return;

      const updatedLesson: LessonProgressItem = {
        ...current,
        stagesCompleted: {
          ...current.stagesCompleted,
          [activeStage]: true,
        },
      };

      const updated = { ...lessons, [activeLessonId]: updatedLesson };
      set({ lessons: updated });
      persistProgress(updated);
    },

    advanceToNextStage: () => {
      const { activeLessonId, activeStage } = get();
      const lesson = PROP_GUIDED_LESSONS[activeLessonId];
      if (!lesson) return;

      get().completeCurrentStage();

      const stages = lesson.stages;
      const curIdx = stages.indexOf(activeStage);
      if (curIdx >= 0 && curIdx < stages.length - 1) {
        const nextStage = stages[curIdx + 1];
        set({ activeStage: nextStage });
      } else if (curIdx === stages.length - 1) {
        get().completeLesson(activeLessonId);
      }
    },

    completeLesson: (lessonId: string) => {
      const { lessons } = get();
      const current = lessons[lessonId];
      if (!current) return;

      const updatedLesson: LessonProgressItem = {
        ...current,
        completed: true,
        mastered: true,
      };

      const updated = { ...lessons, [lessonId]: updatedLesson };
      set({ lessons: updated });
      persistProgress(updated);
    },

    resetProgress: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({
        lessons: {},
        activeStage: 'understand',
        practiceAnswers: {},
      });
    },

    getCompletionStats: () => {
      const { lessons } = get();
      const allLessonKeys = Object.keys(PROP_GUIDED_LESSONS);
      const totalLessonsCount = allLessonKeys.length;
      let completedLessonsCount = 0;

      for (const k of allLessonKeys) {
        if (lessons[k]?.completed) {
          completedLessonsCount++;
        }
      }

      const completionPercentage =
        totalLessonsCount > 0
          ? Math.round((completedLessonsCount / totalLessonsCount) * 100)
          : 0;

      let nextRecommendedLessonId = 'prop-l1';
      for (const k of allLessonKeys) {
        if (!lessons[k]?.completed) {
          nextRecommendedLessonId = k;
          break;
        }
      }

      return {
        completedLessonsCount,
        totalLessonsCount,
        completionPercentage,
        nextRecommendedLessonId,
      };
    },

    // Practice engine implementation
    selectPracticeQuestion: (id: string) => {
      set({ activePracticeQuestionId: id });
    },

    setPracticeDifficultyFilter: (diff) => {
      set({ practiceDifficultyFilter: diff });
    },

    submitPracticeAnswer: (questionId, answer, isCorrect) => {
      set((state) => ({
        practiceAnswers: {
          ...state.practiceAnswers,
          [questionId]: {
            userAnswer: answer,
            isCorrect,
            hintsRevealed: state.practiceAnswers[questionId]?.hintsRevealed || 0,
            showSolution: state.practiceAnswers[questionId]?.showSolution || isCorrect,
          },
        },
      }));
    },

    revealPracticeHint: (questionId: string) => {
      set((state) => {
        const prev = state.practiceAnswers[questionId] || {
          userAnswer: '',
          isCorrect: false,
          hintsRevealed: 0,
          showSolution: false,
        };
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...prev,
              hintsRevealed: prev.hintsRevealed + 1,
            },
          },
        };
      });
    },

    togglePracticeSolution: (questionId: string) => {
      set((state) => {
        const prev = state.practiceAnswers[questionId] || {
          userAnswer: '',
          isCorrect: false,
          hintsRevealed: 0,
          showSolution: false,
        };
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...prev,
              showSolution: !prev.showSolution,
            },
          },
        };
      });
    },

    retryPracticeQuestion: (questionId: string) => {
      set((state) => {
        const next = { ...state.practiceAnswers };
        delete next[questionId];
        return { practiceAnswers: next };
      });
    },
  };
});
