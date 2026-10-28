/**
 * The one learning-evidence store for every subject (Physics, Chemistry, Biology, Mathematics).
 *
 * Records what a student actually did: explainer steps seen, readiness and practice answers and whether help was used,
 * predictions, laboratory task events and observations, chapter practice, chapter assessments, and progress imported from the
 * older chapter-specific stores. Rules (mastery, completion, readiness) live in the pure engine (`engine/education/progress.ts`);
 * this store only records evidence.
 *
 * Storage: schema version 2 under 'labverse_learning_v2', namespaced by curriculum and chapter (see
 * `engine/education/persistence.ts`). The version 1 key 'labverse_edu_progress_v1' is read once (migratePersisted) when no
 * version 2 data exists, and is never modified, so it stays readable as a backup. All storage access is wrapped in try/catch: if
 * storage is blocked or full, progress lives in memory for the session.
 */

import { create } from 'zustand';
import { applyLabEvent, emptyIndependent, emptyLessonRecord, migratePersisted, nextReadinessStatus } from '../engine/education/progress';
import { emptyLearningState, loadLearning, serialize, STORAGE_KEY_V2, type LearningPersistedV2, type LearningState, type ScopeResolver } from '../engine/education/persistence';
import type { AssessmentAttempt, Evaluation, IndependentRecord, LabObservation, LabTask, LegacyChapterImport, LessonRecord, LessonStage, ReadinessRecord } from '../engine/education/types';
import { ACTIVE_CURRICULUM, chapterOfLesson, chapterOfPrerequisite } from '../engine/curriculum';

/** Kept for reference and for the one-time import: the version 1 key ('labverse_edu_progress_v1') is read, never written. */
export const LEGACY_V1_KEY = 'labverse_edu_progress_v1';
void migratePersisted;

const CURRICULUM_ID = ACTIVE_CURRICULUM.id;
const SCOPE: ScopeResolver = { lesson: (id) => chapterOfLesson(id), prereq: (id) => chapterOfPrerequisite(id) };

function read(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' || !localStorage ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

let documentCache: LearningPersistedV2 | null = null;

function save(state: LearningState) {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) return;
    const doc = serialize(state, CURRICULUM_ID, SCOPE, documentCache);
    documentCache = doc;
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify({ ...doc, updatedAt: Date.now() }));
  } catch {
    // storage unavailable or full: progress stays in memory for this session
  }
}

function load(): LearningState {
  const result = loadLearning(read, CURRICULUM_ID);
  documentCache = result.document;
  if (result.source === 'corrupt-v2') {
    // Keep the unreadable document before anything overwrites it.
    try {
      const raw = read(STORAGE_KEY_V2);
      if (raw != null) localStorage.setItem(`${STORAGE_KEY_V2}_unreadable_backup`, raw);
    } catch {
      // ignore
    }
  }
  if (result.source === 'v1' || result.source === 'corrupt-v2') save(result.state);
  return result.state;
}

export interface EducationState extends LearningState {
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

  /** Commit a prediction (the first committed choice is kept; predictions are evidence of thinking, never scored). */
  recordPrediction: (lessonId: string, predictionId: string, choiceId: string) => void;
  /** A laboratory reported an event for a lesson's task. Goals are recomputed from the task definition when given. */
  recordLabEvent: (lessonId: string, taskId: string, event: { name: string; view?: string }, task?: LabTask) => void;
  addLabObservation: (lessonId: string, taskId: string, obs: Omit<LabObservation, 'id' | 'at'> & { id?: string }) => void;

  /** Chapter practice bank evidence (same rules as independent practice). */
  submitPractice: (chapterId: string, itemId: string, evaluation: Pick<Evaluation, 'correct' | 'misconception' | 'invalid'>) => void;
  recordPracticeHint: (chapterId: string, itemId: string) => void;
  revealPracticeSolution: (chapterId: string, itemId: string) => void;
  retryPracticeAssisted: (chapterId: string) => void;

  recordAssessmentAttempt: (chapterId: string, attempt: Omit<AssessmentAttempt, 'demonstrated'>) => void;

  /** Store an import from an older chapter store. Idempotent: an import from the same source is kept, never replaced. */
  importLegacyChapter: (chapterId: string, imp: LegacyChapterImport, practice?: Record<string, IndependentRecord>) => void;

  /** Clear this chapter's lesson, readiness, practice and assessment records. Imported earlier-version history is kept. */
  resetChapter: (chapterId: string) => void;
  resetEducation: () => void;
}

export const useEducationStore = create<EducationState>((set, get) => {
  const initial = load();

  const persisted = (): LearningState => {
    const s = get();
    return { lessons: s.lessons, readiness: s.readiness, practice: s.practice, assessments: s.assessments, legacy: s.legacy, migrations: s.migrations };
  };

  const commit = (patch: Partial<LearningState>) => {
    set(patch);
    save(persisted());
  };

  const updateLesson = (lessonId: string, fn: (r: LessonRecord) => LessonRecord) => {
    const cur = get().lessons[lessonId] ?? emptyLessonRecord();
    const next = fn({ ...cur, teacherDemo: cur.teacherDemo || get().teacherMode });
    commit({ lessons: { ...get().lessons, [lessonId]: { ...next, updatedAt: Date.now() } } });
  };

  const updatePractice = (chapterId: string, itemId: string, fn: (r: IndependentRecord) => IndependentRecord) => {
    const chapter = get().practice[chapterId] ?? {};
    const next = fn(chapter[itemId] ?? emptyIndependent());
    commit({ practice: { ...get().practice, [chapterId]: { ...chapter, [itemId]: next } } });
  };

  /** Shared rule for one independent answer (lesson or chapter practice). */
  const answer = (x: IndependentRecord, evaluation: Pick<Evaluation, 'correct' | 'misconception'>): IndependentRecord => {
    const first = x.attempts === 0;
    const assistedNow = x.assisted || x.hintsUsed > 0 || x.solutionShown || get().teacherMode;
    return {
      ...x,
      attempts: x.attempts + 1,
      correct: x.correct || evaluation.correct,
      assisted: assistedNow,
      firstAttemptUnassisted: first ? evaluation.correct && !assistedNow : x.firstAttemptUnassisted,
      misconceptions: !evaluation.correct && evaluation.misconception ? [...x.misconceptions, evaluation.misconception] : x.misconceptions,
    };
  };

  return {
    ...emptyLearningState(),
    ...initial,
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
      updateLesson(lessonId, (r) => ({ ...r, independent: { ...r.independent, [itemId]: answer(r.independent[itemId] ?? emptyIndependent(), evaluation) } }));
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
      const rec: ReadinessRecord = { status: nextReadinessStatus(totalChecks, correct), attempts: (prev?.attempts ?? 0) + 1, correct, missed, updatedAt: Date.now() };
      commit({ readiness: { ...get().readiness, [prereqId]: rec } });
    },

    bypassReadiness: (prereqId) => {
      const prev = get().readiness[prereqId];
      // Never downgrade real evidence of readiness into "bypassed".
      if (prev?.status === 'passed') return;
      commit({ readiness: { ...get().readiness, [prereqId]: { status: 'bypassed', attempts: prev?.attempts ?? 0, correct: [], missed: [], updatedAt: Date.now() } } });
    },

    recordPrediction: (lessonId, predictionId, choiceId) => {
      if (get().lessons[lessonId]?.predictions?.[predictionId]) return; // the first commitment is the evidence
      updateLesson(lessonId, (r) => ({ ...r, predictions: { ...(r.predictions ?? {}), [predictionId]: { choiceId, at: Date.now() } } }));
    },

    recordLabEvent: (lessonId, taskId, event, task) =>
      updateLesson(lessonId, (r) => {
        const prev = r.labTasks?.[taskId];
        const next = applyLabEvent(task, prev, { ...event, demonstrated: get().teacherMode });
        return { ...r, labTasks: { ...(r.labTasks ?? {}), [taskId]: next } };
      }),

    addLabObservation: (lessonId, taskId, obs) =>
      updateLesson(lessonId, (r) => {
        const prev = r.labTasks?.[taskId] ?? applyLabEvent(undefined, undefined, { name: 'observation' });
        const at = Date.now();
        const o: LabObservation = { id: obs.id ?? `obs-${at}-${prev.observations.length}`, label: obs.label, value: obs.value, note: obs.note, at };
        return { ...r, labTasks: { ...(r.labTasks ?? {}), [taskId]: { ...prev, observations: [...prev.observations, o], updatedAt: at } } };
      }),

    submitPractice: (chapterId, itemId, evaluation) => {
      if (evaluation.invalid) return;
      updatePractice(chapterId, itemId, (x) => answer(x, evaluation));
    },

    recordPracticeHint: (chapterId, itemId) => updatePractice(chapterId, itemId, (x) => ({ ...x, hintsUsed: x.hintsUsed + 1, assisted: x.attempts === 0 ? true : x.assisted })),

    revealPracticeSolution: (chapterId, itemId) => updatePractice(chapterId, itemId, (x) => ({ ...x, solutionShown: true, assisted: x.attempts === 0 ? true : x.assisted })),

    retryPracticeAssisted: (chapterId) => {
      const kept: Record<string, IndependentRecord> = {};
      for (const [k, v] of Object.entries(get().practice[chapterId] ?? {})) if (v.firstAttemptUnassisted === true) kept[k] = v;
      commit({ practice: { ...get().practice, [chapterId]: kept } });
    },

    recordAssessmentAttempt: (chapterId, attempt) => {
      const full: AssessmentAttempt = { ...attempt, demonstrated: get().teacherMode };
      commit({ assessments: { ...get().assessments, [chapterId]: [...(get().assessments[chapterId] ?? []), full] } });
    },

    importLegacyChapter: (chapterId, imp, practice) => {
      if (get().legacy[chapterId]?.sourceKey === imp.sourceKey) return; // already imported: never replace or duplicate
      const existing = get().practice[chapterId] ?? {};
      const added: Record<string, IndependentRecord> = {};
      for (const [k, v] of Object.entries(practice ?? {})) if (!existing[k]) added[k] = v;
      commit({
        legacy: { ...get().legacy, [chapterId]: imp },
        practice: Object.keys(added).length ? { ...get().practice, [chapterId]: { ...existing, ...added } } : get().practice,
        migrations: { ...get().migrations, [`legacy-${chapterId}`]: { at: imp.importedAt, note: `Imported ${Object.keys(imp.lessons).length} lesson records from ${imp.sourceKey} (left unchanged); ${Object.keys(added).length} practice records added.` } },
      });
    },

    resetChapter: (chapterId) => {
      const lessons: Record<string, LessonRecord> = {};
      for (const [k, v] of Object.entries(get().lessons)) if (chapterOfLesson(k) !== chapterId) lessons[k] = v;
      const readiness: Record<string, ReadinessRecord> = {};
      for (const [k, v] of Object.entries(get().readiness)) if (chapterOfPrerequisite(k) !== chapterId) readiness[k] = v;
      const practice = { ...get().practice };
      delete practice[chapterId];
      const assessments = { ...get().assessments };
      delete assessments[chapterId];
      commit({ lessons, readiness, practice, assessments });
    },

    resetEducation: () => {
      // Write an empty version 2 document (rather than removing the key) so the version 1 backup is not re-imported.
      const empty = emptyLearningState();
      empty.migrations = { ...get().migrations, reset: { at: Date.now(), note: 'All learning records reset by the user.' } };
      set({ lessons: {}, readiness: {}, practice: {}, assessments: {}, legacy: {}, migrations: empty.migrations });
      save(empty);
    },
  };
});
