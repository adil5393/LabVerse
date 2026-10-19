/**
 * Honest learning-status rules (EDU-1). Pure.
 *
 * Mastery comes ONLY from independent performance: items answered correctly
 * on the first attempt with no hint, no revealed solution and no teacher
 * demonstration. Viewing explanations, clicking Next, bypassing a prerequisite,
 * revealing a solution, or a teacher demonstration never produce mastery.
 */

import { LESSON_STAGES, MASTERY_SHARE, type EduLesson, type IndependentRecord, type LearningStatus, type LessonRecord, type ReadinessRecord, type ReadinessStatus } from './types';

export const emptyLessonRecord = (): LessonRecord => ({
  stepsSeen: [],
  checks: {},
  workedSeen: false,
  guided: {},
  independent: {},
  reflected: false,
  investigated: false,
  teacherDemo: false,
  updatedAt: 0,
});

export const emptyIndependent = (): IndependentRecord => ({
  attempts: 0,
  firstAttemptUnassisted: null,
  correct: false,
  hintsUsed: 0,
  solutionShown: false,
  assisted: false,
  misconceptions: [],
});

export interface LessonProgressSummary {
  stepsSeen: number;
  stepsTotal: number;
  workedSeen: boolean;
  guidedDone: number;
  guidedTotal: number;
  independentAttempted: number;
  independentResolved: number;
  independentUnassisted: number;
  independentTotal: number;
}

export function summarizeLesson(lesson: EduLesson, rec: LessonRecord | undefined): LessonProgressSummary {
  const r = rec ?? emptyLessonRecord();
  const indep = lesson.independent.map((i) => r.independent[i.id]);
  return {
    stepsSeen: lesson.steps.filter((s) => r.stepsSeen.includes(s.id)).length,
    stepsTotal: lesson.steps.length,
    workedSeen: r.workedSeen,
    guidedDone: lesson.guided.steps.filter((s) => r.guided[s.id]?.done).length,
    guidedTotal: lesson.guided.steps.length,
    independentAttempted: indep.filter((x) => x && x.attempts > 0).length,
    // "Resolved" = answered correctly, or attempted and then reviewed the solution.
    independentResolved: indep.filter((x) => x && x.attempts > 0 && (x.correct || x.solutionShown)).length,
    independentUnassisted: indep.filter((x) => x && x.firstAttemptUnassisted === true).length,
    independentTotal: lesson.independent.length,
  };
}

/** For lessons that declare objectives: which objectives have an independent first-try success. */
export function objectiveCoverage(lesson: EduLesson, rec: LessonRecord | undefined): { id: string; label: string; covered: boolean }[] {
  return (lesson.objectives ?? []).map((o) => ({
    id: o.id,
    label: o.label,
    covered: lesson.independent.some((i) => i.objective === o.id && rec?.independent[i.id]?.firstAttemptUnassisted === true),
  }));
}

export function lessonStatus(lesson: EduLesson, rec: LessonRecord | undefined): LearningStatus {
  if (!rec) return 'not_started';
  const s = summarizeLesson(lesson, rec);
  const touched = s.stepsSeen > 0 || rec.workedSeen || s.guidedDone > 0 || s.independentAttempted > 0 || Object.keys(rec.guided).length > 0;
  if (!touched && !rec.teacherDemo) return 'not_started';

  const completed =
    s.stepsSeen === s.stepsTotal &&
    rec.workedSeen &&
    s.guidedDone === s.guidedTotal &&
    s.independentResolved === s.independentTotal;

  const coverageOk = objectiveCoverage(lesson, rec).every((o) => o.covered);
  const mastered = !rec.teacherDemo && completed && coverageOk && s.independentTotal > 0 && s.independentUnassisted / s.independentTotal >= MASTERY_SHARE;
  if (mastered) return 'mastered';
  if (rec.teacherDemo) return 'demonstrated';
  if (completed) {
    const unresolvedMistakes = lesson.independent.some((i) => {
      const x = rec.independent[i.id];
      return x && x.firstAttemptUnassisted !== true && x.misconceptions.length > 0;
    });
    return unresolvedMistakes || s.independentUnassisted / Math.max(1, s.independentTotal) < MASTERY_SHARE ? 'needs_review' : 'completed';
  }
  return 'in_progress';
}

/** Topics (and misconceptions) the student should revisit, most frequent first. */
export function reviewRecommendations(lesson: EduLesson, rec: LessonRecord | undefined): { topic: string; misconceptions: string[] }[] {
  if (!rec) return [];
  // One entry per topic, even if several problems share it.
  const byTopic = new Map<string, Set<string>>();
  for (const item of lesson.independent) {
    const x = rec.independent[item.id];
    if (!x || x.attempts === 0 || x.firstAttemptUnassisted === true) continue;
    const set = byTopic.get(item.topic) ?? new Set<string>();
    x.misconceptions.forEach((m) => set.add(m));
    byTopic.set(item.topic, set);
  }
  return [...byTopic].map(([topic, set]) => ({ topic, misconceptions: [...set] }));
}

export const STATUS_LABEL: Record<LearningStatus, string> = {
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
  demonstrated: 'Demonstrated (not mastery)',
  mastered: 'Mastered',
  needs_review: 'Needs review',
};

// ---------------------------------------------------------------------------
// Readiness
// ---------------------------------------------------------------------------

/** A bypassed check is "unassessed", never "passed". */
export const readinessLabel = (rec: ReadinessRecord | undefined): string =>
  !rec ? 'Not checked' : rec.status === 'passed' ? 'Ready' : rec.status === 'bypassed' ? 'Skipped (not assessed)' : 'Review suggested';

export function nextReadinessStatus(totalChecks: number, correctIds: string[]): ReadinessStatus {
  return totalChecks > 0 && correctIds.length >= totalChecks ? 'passed' : 'needs_review';
}

// ---------------------------------------------------------------------------
// Persistence schema and migration
// ---------------------------------------------------------------------------

export const EDU_SCHEMA_VERSION = 1;

export interface EduPersisted {
  version: number;
  readiness: Record<string, ReadinessRecord>;
  lessons: Record<string, LessonRecord>;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * Accepts anything found in storage and returns a valid current-schema
 * object. Unknown or corrupt parts are dropped; valid records are preserved.
 * Version 0 (no version field, used only during development) stored lessons
 * with `independent` results as plain booleans; these are upgraded to
 * UNASSISTED=false so old data can never be turned into mastery.
 */
export function migratePersisted(raw: unknown): EduPersisted {
  const out: EduPersisted = { version: EDU_SCHEMA_VERSION, readiness: {}, lessons: {} };
  if (!isObj(raw)) return out;
  if (isObj(raw.readiness)) {
    for (const [k, v] of Object.entries(raw.readiness)) {
      if (!isObj(v)) continue;
      const status = v.status === 'passed' || v.status === 'needs_review' || v.status === 'bypassed' ? v.status : 'needs_review';
      out.readiness[k] = {
        status,
        attempts: typeof v.attempts === 'number' ? v.attempts : 0,
        correct: Array.isArray(v.correct) ? v.correct.filter((x): x is string => typeof x === 'string') : [],
        missed: Array.isArray(v.missed) ? (v.missed as EduPersisted['readiness'][string]['missed']) : [],
        updatedAt: typeof v.updatedAt === 'number' ? v.updatedAt : 0,
      };
    }
  }
  if (isObj(raw.lessons)) {
    for (const [k, v] of Object.entries(raw.lessons)) {
      if (!isObj(v)) continue;
      const rec = emptyLessonRecord();
      if (Array.isArray(v.stepsSeen)) rec.stepsSeen = v.stepsSeen.filter((x): x is string => typeof x === 'string');
      if (isObj(v.checks)) for (const [ck, cv] of Object.entries(v.checks)) if (typeof cv === 'boolean') rec.checks[ck] = cv;
      rec.workedSeen = v.workedSeen === true;
      rec.reflected = v.reflected === true;
      rec.investigated = v.investigated === true;
      rec.teacherDemo = v.teacherDemo === true;
      rec.updatedAt = typeof v.updatedAt === 'number' ? v.updatedAt : 0;
      if (typeof v.lastStage === 'string' && (LESSON_STAGES as string[]).includes(v.lastStage)) rec.lastStage = v.lastStage as LessonRecord['lastStage'];
      if (isObj(v.guided)) {
        for (const [gk, gv] of Object.entries(v.guided)) {
          if (isObj(gv)) rec.guided[gk] = { done: gv.done === true, hints: Number(gv.hints) || 0, wrong: Number(gv.wrong) || 0 };
        }
      }
      if (isObj(v.independent)) {
        for (const [ik, iv] of Object.entries(v.independent)) {
          if (typeof iv === 'boolean') {
            // version 0: a bare boolean has no evidence of independence
            rec.independent[ik] = { ...emptyIndependent(), attempts: 1, correct: iv, firstAttemptUnassisted: false, assisted: true };
          } else if (isObj(iv)) {
            rec.independent[ik] = {
              attempts: Number(iv.attempts) || 0,
              firstAttemptUnassisted: iv.firstAttemptUnassisted === true ? true : iv.firstAttemptUnassisted === false ? false : null,
              correct: iv.correct === true,
              hintsUsed: Number(iv.hintsUsed) || 0,
              solutionShown: iv.solutionShown === true,
              assisted: iv.assisted === true,
              misconceptions: Array.isArray(iv.misconceptions) ? iv.misconceptions.filter((x): x is string => typeof x === 'string') : [],
            };
          }
        }
      }
      out.lessons[k] = rec;
    }
  }
  return out;
}
