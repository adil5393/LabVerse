/**
 * Learning-evidence store for the EDU-1 foundations (chapter-neutral).
 *
 * Records what a student actually did: which explainer steps they saw, how
 * they answered readiness and practice questions, and whether help was used.
 * Persisted locally under 'labverse_edu_progress_v1' with a versioned
 * migration. It never touches any chapter's own progress store.
 */

import { create } from 'zustand';
import {
  EDU_SCHEMA_VERSION,
  emptyIndependent,
  emptyLessonRecord,
  migratePersisted,
  nextReadinessStatus,
  type EduPersisted,
} from '../engine/education/progress';
import type { Evaluation, LessonRecord, LessonStage, ReadinessRecord } from '../engine/education/types';

const STORAGE_KEY = 'labverse_edu_progress_v1';

function load(): EduPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? migratePersisted(JSON.parse(raw)) : migratePersisted(null);
  } catch {
    return migratePersisted(null);
  }
}

function save(p: EduPersisted) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...p, version: EDU_SCHEMA_VERSION, updatedAt: Date.now() }));
  } catch {
    // storage unavailable or full: progress stays in memory for this session
  }
}

export interface EducationState {
  readiness: Record<string, ReadinessRecord>;
  lessons: Record<string, LessonRecord>;
  /** Not persisted: while on, everything recorded counts as assisted and the lesson is flagged as demonstrated. */
  teacherMode: boolean;

  setTeacherMode: (on: boolean) => void;
  markStepSeen: (lessonId: string, stepId: string) => void;
  recordCheck: (lessonId: string, checkId: string, correct: boolean) => void;
  markWorkedSeen: (lessonId: string) => void;
  markInvestigated: (lessonId: string) => void;
  /** Remember where the student is (navigation only; not evidence of anything). */
  setLastStage: (lessonId: string, stage: LessonStage) => void;
  recordGuidedHint: (lessonId: string, stepId: string) => void;
  recordGuidedAnswer: (lessonId: string, stepId: string, correct: boolean) => void;
  recordIndependentHint: (lessonId: string, itemId: string) => void;
  revealIndependentSolution: (lessonId: string, itemId: string) => void;
  submitIndependent: (lessonId: string, itemId: string, evaluation: Pick<Evaluation, 'correct' | 'misconception' | 'invalid'>) => void;
  /** Clear only ASSISTED independent attempts so they can be retried; unassisted evidence is kept. */
  retryAssisted: (lessonId: string) => void;
  markReflected: (lessonId: string) => void;
  submitReadiness: (prereqId: string, totalChecks: number, results: { questionId: string; correct: boolean; refresherId?: string; misconception?: string }[]) => void;
  bypassReadiness: (prereqId: string) => void;
  resetEducation: () => void;
}

export const useEducationStore = create<EducationState>((set, get) => {
  const initial = load();

  const commit = (patch: Partial<Pick<EduPersisted, 'readiness' | 'lessons'>>) => {
    const next = { readiness: patch.readiness ?? get().readiness, lessons: patch.lessons ?? get().lessons };
    set(next);
    save({ version: EDU_SCHEMA_VERSION, ...next });
  };

  const updateLesson = (lessonId: string, fn: (r: LessonRecord) => LessonRecord) => {
    const cur = get().lessons[lessonId] ?? emptyLessonRecord();
    const next = fn({ ...cur, teacherDemo: cur.teacherDemo || get().teacherMode });
    commit({ lessons: { ...get().lessons, [lessonId]: { ...next, updatedAt: Date.now() } } });
  };

  return {
    readiness: initial.readiness,
    lessons: initial.lessons,
    teacherMode: false,

    setTeacherMode: (on) => set({ teacherMode: on }),

    markStepSeen: (lessonId, stepId) => {
      if (get().lessons[lessonId]?.stepsSeen.includes(stepId)) return;
      updateLesson(lessonId, (r) => ({ ...r, stepsSeen: [...r.stepsSeen, stepId] }));
    },

    recordCheck: (lessonId, checkId, correct) => updateLesson(lessonId, (r) => ({ ...r, checks: { ...r.checks, [checkId]: r.checks[checkId] === true || correct } })),

    markWorkedSeen: (lessonId) => {
      if (get().lessons[lessonId]?.workedSeen) return;
      updateLesson(lessonId, (r) => ({ ...r, workedSeen: true }));
    },

    markInvestigated: (lessonId) => updateLesson(lessonId, (r) => ({ ...r, investigated: true })),

    setLastStage: (lessonId, stage) => {
      if (get().lessons[lessonId]?.lastStage === stage) return;
      updateLesson(lessonId, (r) => ({ ...r, lastStage: stage }));
    },

    recordGuidedHint: (lessonId, stepId) =>
      updateLesson(lessonId, (r) => {
        const g = r.guided[stepId] ?? { done: false, hints: 0, wrong: 0 };
        return { ...r, guided: { ...r.guided, [stepId]: { ...g, hints: g.hints + 1 } } };
      }),

    recordGuidedAnswer: (lessonId, stepId, correct) =>
      updateLesson(lessonId, (r) => {
        const g = r.guided[stepId] ?? { done: false, hints: 0, wrong: 0 };
        return { ...r, guided: { ...r.guided, [stepId]: { ...g, done: g.done || correct, wrong: g.wrong + (correct ? 0 : 1) } } };
      }),

    recordIndependentHint: (lessonId, itemId) =>
      updateLesson(lessonId, (r) => {
        const x = r.independent[itemId] ?? emptyIndependent();
        return { ...r, independent: { ...r.independent, [itemId]: { ...x, hintsUsed: x.hintsUsed + 1, assisted: x.attempts === 0 ? true : x.assisted } } };
      }),

    revealIndependentSolution: (lessonId, itemId) =>
      updateLesson(lessonId, (r) => {
        const x = r.independent[itemId] ?? emptyIndependent();
        return { ...r, independent: { ...r.independent, [itemId]: { ...x, solutionShown: true, assisted: x.attempts === 0 ? true : x.assisted } } };
      }),

    submitIndependent: (lessonId, itemId, evaluation) => {
      if (evaluation.invalid) return; // an unreadable answer is not an attempt
      const teacher = get().teacherMode;
      updateLesson(lessonId, (r) => {
        const x = r.independent[itemId] ?? emptyIndependent();
        const first = x.attempts === 0;
        const assistedNow = x.assisted || x.hintsUsed > 0 || x.solutionShown || teacher;
        return {
          ...r,
          independent: {
            ...r.independent,
            [itemId]: {
              ...x,
              attempts: x.attempts + 1,
              correct: x.correct || evaluation.correct,
              assisted: assistedNow,
              firstAttemptUnassisted: first ? evaluation.correct && !assistedNow : x.firstAttemptUnassisted,
              misconceptions: !evaluation.correct && evaluation.misconception ? [...x.misconceptions, evaluation.misconception] : x.misconceptions,
            },
          },
        };
      });
    },

    retryAssisted: (lessonId) =>
      updateLesson(lessonId, (r) => {
        const kept: LessonRecord['independent'] = {};
        for (const [k, v] of Object.entries(r.independent)) if (v.firstAttemptUnassisted === true) kept[k] = v;
        return { ...r, independent: kept };
      }),

    markReflected: (lessonId) => updateLesson(lessonId, (r) => ({ ...r, reflected: true })),

    submitReadiness: (prereqId, totalChecks, results) => {
      const prev = get().readiness[prereqId];
      const correct = [...new Set([...(prev?.status === 'bypassed' ? [] : prev?.correct ?? []), ...results.filter((x) => x.correct).map((x) => x.questionId)])];
      const missed = results.filter((x) => !x.correct).map((x) => ({ questionId: x.questionId, refresherId: x.refresherId, misconception: x.misconception }));
      commit({
        readiness: {
          ...get().readiness,
          [prereqId]: { status: nextReadinessStatus(totalChecks, correct), attempts: (prev?.attempts ?? 0) + 1, correct, missed, updatedAt: Date.now() },
        },
      });
    },

    bypassReadiness: (prereqId) => {
      const prev = get().readiness[prereqId];
      // Never downgrade real evidence of readiness into "bypassed".
      if (prev?.status === 'passed') return;
      commit({ readiness: { ...get().readiness, [prereqId]: { status: 'bypassed', attempts: prev?.attempts ?? 0, correct: [], missed: [], updatedAt: Date.now() } } });
    },

    resetEducation: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
      set({ readiness: {}, lessons: {} });
    },
  };
});
