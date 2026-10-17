/**
 * Guided Learning Progress Store for LabVerse Mathematics (Milestone M2.5)
 *
 * Provides lightweight local browser progress persistence:
 * - Tracks completed lessons, active lesson, active stage, predictions, observations, practice attempts & mastery.
 * - Safely handles localStorage availability with graceful in-memory fallback.
 * - Keeps lesson completion, practice attempted, and practice mastered strictly separated.
 * - Supports teacher demonstration bypass without falsely counting as student mastery.
 * - Provides clean progress reset.
 */

import { create } from 'zustand';
import type {
  GuidedStageId,
  StudentLessonProgress,
  ChapterProgressState,
  ChapterCompletionStats,
} from '../engine/mathematics/guidedLearning/types';
import {
  CIRCLES_GUIDED_LESSONS,
  ORDERED_LESSON_IDS,
  getNextRecommendedLesson,
} from '../engine/mathematics/circles/curriculumPath';

const STORAGE_KEY = 'labverse_circles_progress_v1';

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
    chapterId: 'circles-class-9',
    lastVisitedLessonId: 'circles-l1',
    completedLessonIds: [],
    lessons: {},
  };

  try {
    const storage = getStorage();
    if (storage) {
      const serialized = storage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        if (parsed && parsed.chapterId === 'circles-class-9') {
          return {
            chapterId: 'circles-class-9',
            lastVisitedLessonId: parsed.lastVisitedLessonId || 'circles-l1',
            completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
            lessons: parsed.lessons || {},
          };
        }
      }
    }
  } catch {
    // Graceful fallback to initial state if localStorage is blocked or corrupt
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
    // Non-blocking in-memory operation if storage quota exceeded or disabled
  }
}

interface GuidedLearningState {
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

export const useGuidedLearningStore = create<GuidedLearningState>((set, get) => ({
  activeLessonId: initialPersisted.lastVisitedLessonId || 'circles-l1',
  activeStage: 'understand',
  teacherMode: false,
  teacherBypassedStages: {},

  completedLessonIds: initialPersisted.completedLessonIds,
  lessons: initialPersisted.lessons,

  selectLesson: (lessonId: string, stage: GuidedStageId = 'understand') => {
    const existingProgress = get().lessons[lessonId] || getDefaultLessonProgress(lessonId);

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
        chapterId: 'circles-class-9',
        lastVisitedLessonId: lessonId,
        completedLessonIds: state.completedLessonIds,
        lessons: updatedLessons,
      });

      return newState;
    });
  },

  setStage: (stage: GuidedStageId) => {
    const { activeLessonId, lessons } = get();
    const existing = lessons[activeLessonId] || getDefaultLessonProgress(activeLessonId);

    set((state) => {
      const updatedLessons = {
        ...state.lessons,
        [activeLessonId]: {
          ...existing,
          currentStage: stage,
        },
      };

      persistProgress({
        chapterId: 'circles-class-9',
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
    const lesson = CIRCLES_GUIDED_LESSONS[activeLessonId];
    const stages: GuidedStageId[] = lesson ? lesson.stages : ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
    const currentIndex = stages.indexOf(activeStage);

    if (currentIndex >= 0 && currentIndex < stages.length - 1) {
      get().setStage(stages[currentIndex + 1]);
    }
  },

  prevStage: () => {
    const { activeLessonId, activeStage } = get();
    const lesson = CIRCLES_GUIDED_LESSONS[activeLessonId];
    const stages: GuidedStageId[] = lesson ? lesson.stages : ['understand', 'predict', 'experiment', 'observe', 'explain', 'practice'];
    const currentIndex = stages.indexOf(activeStage);

    if (currentIndex > 0) {
      get().setStage(stages[currentIndex - 1]);
    }
  },

  recordPrediction: (lessonId: string, answer: string, isCorrect: boolean) => {
    set((state) => {
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const updatedLessons = {
        ...state.lessons,
        [lessonId]: {
          ...existing,
          predictionAnswer: answer,
          predictionCorrect: isCorrect,
        },
      };

      persistProgress({
        chapterId: 'circles-class-9',
        lastVisitedLessonId: state.activeLessonId,
        completedLessonIds: state.completedLessonIds,
        lessons: updatedLessons,
      });

      return { lessons: updatedLessons };
    });
  },

  recordInteraction: (lessonId: string) => {
    set((state) => {
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const updatedLessons = {
        ...state.lessons,
        [lessonId]: {
          ...existing,
          interactionsRecorded: (existing.interactionsRecorded || 0) + 1,
        },
      };

      persistProgress({
        chapterId: 'circles-class-9',
        lastVisitedLessonId: state.activeLessonId,
        completedLessonIds: state.completedLessonIds,
        lessons: updatedLessons,
      });

      return { lessons: updatedLessons };
    });
  },

  recordObservation: (lessonId: string) => {
    set((state) => {
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const updatedLessons = {
        ...state.lessons,
        [lessonId]: {
          ...existing,
          observationsCaptured: (existing.observationsCaptured || 0) + 1,
        },
      };

      persistProgress({
        chapterId: 'circles-class-9',
        lastVisitedLessonId: state.activeLessonId,
        completedLessonIds: state.completedLessonIds,
        lessons: updatedLessons,
      });

      return { lessons: updatedLessons };
    });
  },

  recordProofCompleted: (lessonId: string) => {
    set((state) => {
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const updatedLessons = {
        ...state.lessons,
        [lessonId]: {
          ...existing,
          proofCompleted: true,
        },
      };

      persistProgress({
        chapterId: 'circles-class-9',
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
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const newCorrect = (existing.practiceCorrectCount || 0) + (isCorrect ? 1 : 0);
      const total = Math.max(existing.practiceTotalQuestions || 0, totalQuestions);
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
        chapterId: 'circles-class-9',
        lastVisitedLessonId: state.activeLessonId,
        completedLessonIds: state.completedLessonIds,
        lessons: updatedLessons,
      });

      return { lessons: updatedLessons };
    });
  },

  completeLesson: (lessonId: string, isTeacherBypass: boolean = false) => {
    set((state) => {
      const existing = state.lessons[lessonId] || getDefaultLessonProgress(lessonId);
      const completedSet = new Set(state.completedLessonIds);
      completedSet.add(lessonId);

      const updatedLessons = {
        ...state.lessons,
        [lessonId]: {
          ...existing,
          completed: true,
          completedAt: Date.now(),
          teacherBypassed: isTeacherBypass ? true : existing.teacherBypassed,
          // Notice: Teacher demonstration bypass does NOT grant practiceMastered
        },
      };

      const newCompletedList = Array.from(completedSet);

      persistProgress({
        chapterId: 'circles-class-9',
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
      activeLessonId: 'circles-l1',
      activeStage: 'understand',
      completedLessonIds: [],
      lessons: {},
      teacherBypassedStages: {},
    });
  },

  getCompletionStats: (): ChapterCompletionStats => {
    const { completedLessonIds, lessons } = get();
    // Count only core 12 lessons for official chapter percentage
    const core12 = ORDERED_LESSON_IDS.slice(0, 12);
    const completedCoreCount = core12.filter((id) => completedLessonIds.includes(id)).length;
    const masteredCount = core12.filter((id) => lessons[id]?.practiceMastered && !lessons[id]?.teacherBypassed).length;

    const percentage = Math.round((completedCoreCount / 12) * 100);
    const nextRecommended = getNextRecommendedLesson(completedLessonIds);

    return {
      completedCount: completedCoreCount,
      totalCount: 12,
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
    const index = ORDERED_LESSON_IDS.indexOf(currentId);
    if (index >= 0 && index < ORDERED_LESSON_IDS.length - 1) {
      return ORDERED_LESSON_IDS[index + 1];
    }
    return currentId;
  },
}));
