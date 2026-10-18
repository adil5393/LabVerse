/**
 * Guided Learning Progress Store for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12
 *
 * Implements the reusable GuidedLearningState contract with dedicated local persistence:
 * - Tracks 13 lessons across 7 units
 * - Isolated from Circles store (storage key: labverse_quadrilaterals_progress_v1)
 * - Safely handles localStorage with graceful fallback
 * - Distinguishes between student mastery and teacher demonstration bypass
 */

import { create } from 'zustand';
import type {
  GuidedStageId,
  StudentLessonProgress,
  ChapterProgressState,
  ChapterCompletionStats,
} from '../engine/mathematics/guidedLearning/types';
import {
  QUAD_GUIDED_LESSONS,
  ORDERED_QUAD_LESSON_IDS,
  getNextRecommendedLesson,
} from '../engine/mathematics/quadrilaterals/curriculumPath';

const STORAGE_KEY = 'labverse_quadrilaterals_progress_v1';

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // Ignore
  }
  return null;
}

function getDefaultLessonProgress(lessonId: string): StudentLessonProgress {
  return {
    lessonId,
    completed: false,
    currentStage: 'understand',
    interactionsRecorded: 0,
    observationsCaptured: 0,
    proofCompleted: false,
    practiceAttempted: false,
    practiceMastered: false,
    practiceCorrectCount: 0,
    practiceTotalQuestions: 0,
    teacherBypassed: false,
  };
}

function loadInitialProgress(): ChapterProgressState {
  const fallback: ChapterProgressState = {
    chapterId: 'quadrilaterals-class-9',
    lastVisitedLessonId: 'quad-l1',
    completedLessonIds: [],
    lessons: {},
  };

  try {
    const storage = getStorage();
    if (storage) {
      const serialized = storage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed && parsed.chapterId === 'quadrilaterals-class-9') {
          return {
            chapterId: 'quadrilaterals-class-9',
            lastVisitedLessonId: parsed.lastVisitedLessonId || 'quad-l1',
            completedLessonIds: Array.isArray(parsed.completedLessonIds)
              ? parsed.completedLessonIds
              : [],
            lessons: parsed.lessons || {},
          };
        }
      }
    }
  } catch {
    // Graceful fallback
  }

  return fallback;
}

function persistProgress(state: ChapterProgressState): void {
  try {
    const storage = getStorage();
    if (storage) {
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          chapterId: state.chapterId,
          lastVisitedLessonId: state.lastVisitedLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: state.lessons,
        })
      );
    }
  } catch {
    // Non-blocking in-memory operation
  }
}

interface QuadGuidedLearningState {
  // Navigation & State
  activeLessonId: string;
  activeStage: GuidedStageId;
  teacherMode: boolean;
  teacherBypassedStages: Record<string, boolean>;

  // Progress Data
  completedLessonIds: string[];
  lessons: Record<string, StudentLessonProgress>;

  // Actions
  selectLesson: (lessonId: string, stage?: GuidedStageId) => void;
  setStage: (stage: GuidedStageId) => void;
  nextStage: () => void;
  prevStage: () => void;
  recordPrediction: (lessonId: string, answer: string, isCorrect: boolean) => void;
  recordInteraction: (lessonId: string) => void;
  recordObservation: (lessonId: string) => void;
  recordProofCompleted: (lessonId: string) => void;
  recordPracticeResult: (
    lessonId: string,
    questionId: string,
    isCorrect: boolean,
    totalQuestions: number
  ) => void;
  completeLesson: (lessonId: string, isTeacherBypass?: boolean) => void;
  teacherBypassCurrentStage: (lessonId: string) => void;
  toggleTeacherMode: () => void;
  resetProgress: () => void;

  // Selectors / Helpers
  getCompletionStats: () => ChapterCompletionStats;
  isLessonCompleted: (lessonId: string) => boolean;
  isLessonMastered: (lessonId: string) => boolean;
  getNextLessonId: (currentId: string) => string;
}

const initialPersisted = loadInitialProgress();

export const useQuadGuidedLearningStore = create<QuadGuidedLearningState>(
  (set, get) => ({
    activeLessonId: initialPersisted.lastVisitedLessonId || 'quad-l1',
    activeStage: 'understand',
    teacherMode: false,
    teacherBypassedStages: {},

    completedLessonIds: initialPersisted.completedLessonIds,
    lessons: initialPersisted.lessons,

    selectLesson: (lessonId: string, stage: GuidedStageId = 'understand') => {
      const existingProgress =
        get().lessons[lessonId] || getDefaultLessonProgress(lessonId);

      set((state) => {
        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existingProgress,
            currentStage: stage,
          },
        };

        const newState = {
          activeLessonId: lessonId,
          activeStage: stage,
          lessons: updatedLessons,
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: lessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return newState;
      });
    },

    setStage: (stage: GuidedStageId) => {
      const { activeLessonId, lessons } = get();
      const existing =
        lessons[activeLessonId] || getDefaultLessonProgress(activeLessonId);

      set((state) => {
        const updatedLessons = {
          ...state.lessons,
          [activeLessonId]: {
            ...existing,
            currentStage: stage,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return {
          activeStage: stage,
          lessons: updatedLessons,
        };
      });
    },

    nextStage: () => {
      const { activeLessonId, activeStage } = get();
      const lesson = QUAD_GUIDED_LESSONS[activeLessonId];
      const stages: GuidedStageId[] = lesson
        ? lesson.stages
        : ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
      const currentIndex = stages.indexOf(activeStage);

      if (currentIndex >= 0 && currentIndex < stages.length - 1) {
        get().setStage(stages[currentIndex + 1]);
      }
    },

    prevStage: () => {
      const { activeLessonId, activeStage } = get();
      const lesson = QUAD_GUIDED_LESSONS[activeLessonId];
      const stages: GuidedStageId[] = lesson
        ? lesson.stages
        : ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
      const currentIndex = stages.indexOf(activeStage);

      if (currentIndex > 0) {
        get().setStage(stages[currentIndex - 1]);
      }
    },

    recordPrediction: (lessonId: string, answer: string, isCorrect: boolean) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            predictionAnswer: answer,
            predictionCorrect: isCorrect,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return { lessons: updatedLessons };
      });
    },

    recordInteraction: (lessonId: string) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            interactionsRecorded: (existing.interactionsRecorded || 0) + 1,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return { lessons: updatedLessons };
      });
    },

    recordObservation: (lessonId: string) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            observationsCaptured: (existing.observationsCaptured || 0) + 1,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return { lessons: updatedLessons };
      });
    },

    recordProofCompleted: (lessonId: string) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            proofCompleted: true,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return { lessons: updatedLessons };
      });
    },

    recordPracticeResult: (
      lessonId: string,
      _questionId: string,
      isCorrect: boolean,
      totalQuestions: number
    ) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const newCorrect =
          (existing.practiceCorrectCount || 0) + (isCorrect ? 1 : 0);
        const total = Math.max(
          existing.practiceTotalQuestions || 0,
          totalQuestions
        );
        const mastered = newCorrect >= total && total > 0;

        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            practiceAttempted: true,
            practiceCorrectCount: newCorrect,
            practiceTotalQuestions: total,
            practiceMastered: mastered,
          },
        };

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId,
          completedLessonIds: state.completedLessonIds,
          lessons: updatedLessons,
        });

        return { lessons: updatedLessons };
      });
    },

    completeLesson: (lessonId: string, isTeacherBypass = false) => {
      set((state) => {
        const existing =
          state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
        const completedSet = new Set(state.completedLessonIds);
        completedSet.add(lessonId);

        const updatedLessons = {
          ...state.lessons,
          [lessonId]: {
            ...existing,
            completed: true,
            completedAt: Date.now(),
            teacherBypassed: isTeacherBypass ? true : existing.teacherBypassed,
          },
        };

        const newCompletedList = Array.from(completedSet);

        persistProgress({
          chapterId: 'quadrilaterals-class-9',
          lastVisitedLessonId: state.activeLessonId || lessonId,
          completedLessonIds: newCompletedList,
          lessons: updatedLessons,
        });

        return {
          completedLessonIds: newCompletedList,
          lessons: updatedLessons,
        };
      });
    },

    teacherBypassCurrentStage: (lessonId: string) => {
      const { activeStage, nextStage } = get();
      set((state) => ({
        teacherBypassedStages: {
          ...state.teacherBypassedStages,
          [`${lessonId}_${activeStage}`]: true,
        },
      }));
      nextStage();
    },

    toggleTeacherMode: () => {
      set((state) => ({ teacherMode: !state.teacherMode }));
    },

    resetProgress: () => {
      try {
        const storage = getStorage();
        if (storage) {
          storage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Ignore
      }

      set({
        activeLessonId: 'quad-l1',
        activeStage: 'understand',
        completedLessonIds: [],
        lessons: {},
        teacherBypassedStages: {},
      });
    },

    getCompletionStats: (): ChapterCompletionStats => {
      const { completedLessonIds, lessons } = get();
      const totalCount = ORDERED_QUAD_LESSON_IDS.length; // 13
      const completedCount = ORDERED_QUAD_LESSON_IDS.filter((id) =>
        completedLessonIds.includes(id)
      ).length;
      const masteredCount = ORDERED_QUAD_LESSON_IDS.filter(
        (id) => lessons[id]?.practiceMastered && !lessons[id]?.teacherBypassed
      ).length;

      const percentage = Math.round((completedCount / totalCount) * 100);
      const nextRecommended = getNextRecommendedLesson(completedLessonIds);

      return {
        completedCount,
        totalCount,
        percentage,
        masteredCount,
        nextRecommendedLessonId: nextRecommended,
      };
    },

    isLessonCompleted: (lessonId: string): boolean => {
      return get().completedLessonIds.includes(lessonId);
    },

    isLessonMastered: (lessonId: string): boolean => {
      const lesson = get().lessons[lessonId];
      return Boolean(lesson?.practiceMastered && !lesson?.teacherBypassed);
    },

    getNextLessonId: (currentId: string): string => {
      const index = ORDERED_QUAD_LESSON_IDS.indexOf(currentId);
      if (index >= 0 && index < ORDERED_QUAD_LESSON_IDS.length - 1) {
        return ORDERED_QUAD_LESSON_IDS[index + 1];
      }
      return currentId;
    },
  })
);
