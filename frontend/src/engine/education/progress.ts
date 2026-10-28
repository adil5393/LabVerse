/**
 * Honest learning-status rules (EDU-1). Pure.
 *
 * Mastery comes ONLY from independent performance: items answered correctly
 * on the first attempt with no hint, no revealed solution and no teacher
 * demonstration. Viewing explanations, clicking Next, bypassing a prerequisite,
 * revealing a solution, or a teacher demonstration never produce mastery.
 */

import { LESSON_STAGES, MASTERY_SHARE, type AssessmentAttempt, type ChapterAssessment, type EduLesson, type IndependentRecord, type LabGoal, type LabTask, type LabTaskRecord, type LearningStatus, type LessonRecord, type PracticeSet, type ReadinessRecord, type ReadinessStatus } from './types';

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

// ---------------------------------------------------------------------------
// Laboratory tasks
// ---------------------------------------------------------------------------

export const emptyLabTaskRecord = (): LabTaskRecord => ({ events: {}, viewsSeen: [], observations: [], goalsMet: [], demonstrated: false, updatedAt: 0 });

/** Whether one goal is met by the recorded events and views. Pure. */
export function labGoalMet(goal: LabGoal, rec: LabTaskRecord | undefined): boolean {
  if (!rec) return false;
  if (goal.view && !rec.viewsSeen.includes(goal.view)) return false;
  if (goal.events?.length) {
    const n = goal.events.reduce((sum, e) => sum + (rec.events[e] ?? 0), 0);
    if (n < (goal.count ?? 1)) return false;
  }
  return Boolean(goal.view || goal.events?.length);
}

export function labTaskGoals(task: LabTask, rec: LabTaskRecord | undefined): { id: string; label: string; met: boolean }[] {
  return task.goals.map((g) => ({ id: g.id, label: g.label, met: labGoalMet(g, rec) }));
}

export const labTaskComplete = (task: LabTask, rec: LabTaskRecord | undefined): boolean => task.goals.every((g) => labGoalMet(g, rec));

/** Every task marked `requiredForMastery` has all its goals met. Lessons without such tasks always pass. */
export function requiredLabTasksMet(lesson: EduLesson, rec: LessonRecord | undefined): boolean {
  return (lesson.labTasks ?? []).filter((t) => t.requiredForMastery).every((t) => labTaskComplete(t, rec?.labTasks?.[t.id]));
}

/** Apply one laboratory event to a task record. Pure; returns a new record with goals recomputed. */
export function applyLabEvent(task: LabTask | undefined, prev: LabTaskRecord | undefined, event: { name: string; view?: string; demonstrated?: boolean; at?: number }): LabTaskRecord {
  const r = prev ? { ...prev, events: { ...prev.events }, viewsSeen: [...prev.viewsSeen] } : emptyLabTaskRecord();
  r.events[event.name] = (r.events[event.name] ?? 0) + 1;
  if (event.view && !r.viewsSeen.includes(event.view)) r.viewsSeen.push(event.view);
  r.demonstrated = r.demonstrated || Boolean(event.demonstrated);
  r.updatedAt = event.at ?? Date.now();
  r.goalsMet = task ? task.goals.filter((g) => labGoalMet(g, r)).map((g) => g.id) : r.goalsMet;
  return r;
}

// ---------------------------------------------------------------------------
// Chapter practice and assessment
// ---------------------------------------------------------------------------

export interface PracticeSetSummary { total: number; attempted: number; correct: number; unassisted: number; byGroup: Record<string, { total: number; unassisted: number }> }

export function summarizePractice(set: PracticeSet | undefined, recs: Record<string, IndependentRecord> | undefined): PracticeSetSummary {
  const out: PracticeSetSummary = { total: 0, attempted: 0, correct: 0, unassisted: 0, byGroup: {} };
  for (const g of set?.groups ?? []) {
    const gs = { total: 0, unassisted: 0 };
    for (const it of g.items) {
      const r = recs?.[it.id];
      out.total += 1; gs.total += 1;
      if (r && r.attempts > 0) out.attempted += 1;
      if (r?.correct) out.correct += 1;
      if (r?.firstAttemptUnassisted === true) { out.unassisted += 1; gs.unassisted += 1; }
    }
    out.byGroup[g.id] = gs;
  }
  return out;
}

export const assessmentMaxScore = (a: ChapterAssessment): number => a.sections.reduce((n, s) => n + s.items.reduce((m, i) => m + i.marks, 0), 0);

/** Score a set of evaluated answers. Unanswered items score zero. Pure. */
export function scoreAssessment(a: ChapterAssessment, evaluations: Record<string, { correct: boolean; misconception?: string }>): Pick<AssessmentAttempt, 'answers' | 'score' | 'maxScore'> {
  const answers: AssessmentAttempt['answers'] = {};
  let score = 0;
  for (const s of a.sections) for (const it of s.items) {
    const ev = evaluations[it.id];
    const marks = ev?.correct ? it.marks : 0;
    score += marks;
    answers[it.id] = { correct: Boolean(ev?.correct), marks, misconception: ev?.misconception };
  }
  return { answers, score, maxScore: assessmentMaxScore(a) };
}

export type AssessmentReadiness = 'not_attempted' | 'ready' | 'review' | 'demonstrated';

/** Readiness from the most recent attempt that was the student's own (demonstrations never count). */
export function assessmentReadiness(a: ChapterAssessment | undefined, attempts: AssessmentAttempt[] | undefined): AssessmentReadiness {
  if (!a) return 'not_attempted';
  const own = (attempts ?? []).filter((x) => x.assessmentId === a.id && !x.demonstrated);
  if (!own.length) return (attempts ?? []).some((x) => x.assessmentId === a.id) ? 'demonstrated' : 'not_attempted';
  const last = own[own.length - 1];
  return last.maxScore > 0 && last.score / last.maxScore >= (a.readyShare ?? MASTERY_SHARE) ? 'ready' : 'review';
}

/** Topics (with their lesson) answered wrongly in the latest own attempt, for targeted revision. */
export function assessmentRevision(a: ChapterAssessment, attempt: AssessmentAttempt | undefined): { topic: string; lessonId?: string; misconceptions: string[] }[] {
  if (!attempt) return [];
  const map = new Map<string, { topic: string; lessonId?: string; misconceptions: Set<string> }>();
  for (const s of a.sections) for (const it of s.items) {
    const ans = attempt.answers[it.id];
    if (!ans || ans.correct) continue;
    const e = map.get(it.topic) ?? { topic: it.topic, lessonId: it.lessonId, misconceptions: new Set<string>() };
    if (ans.misconception) e.misconceptions.add(ans.misconception);
    map.set(it.topic, e);
  }
  return [...map.values()].map((e) => ({ topic: e.topic, lessonId: e.lessonId, misconceptions: [...e.misconceptions] }));
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
    s.independentResolved === s.independentTotal &&
    requiredLabTasksMet(lesson, rec);

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
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : Number(v) || 0);

export function sanitizeReadiness(v: unknown): ReadinessRecord | null {
  if (!isObj(v)) return null;
  const status = v.status === 'passed' || v.status === 'needs_review' || v.status === 'bypassed' ? v.status : 'needs_review';
  return {
    status,
    attempts: typeof v.attempts === 'number' ? v.attempts : 0,
    correct: strs(v.correct),
    missed: Array.isArray(v.missed) ? (v.missed as ReadinessRecord['missed']) : [],
    updatedAt: typeof v.updatedAt === 'number' ? v.updatedAt : 0,
  };
}

/** One independent-practice record. A bare boolean (version 0) has no evidence of independence, so it is never unassisted. */
export function sanitizeIndependent(iv: unknown): IndependentRecord | null {
  if (typeof iv === 'boolean') return { ...emptyIndependent(), attempts: 1, correct: iv, firstAttemptUnassisted: false, assisted: true };
  if (!isObj(iv)) return null;
  return {
    attempts: num(iv.attempts),
    firstAttemptUnassisted: iv.firstAttemptUnassisted === true ? true : iv.firstAttemptUnassisted === false ? false : null,
    correct: iv.correct === true,
    hintsUsed: num(iv.hintsUsed),
    solutionShown: iv.solutionShown === true,
    assisted: iv.assisted === true,
    misconceptions: strs(iv.misconceptions),
  };
}

function sanitizeLabTask(v: unknown): LabTaskRecord | null {
  if (!isObj(v)) return null;
  const events: Record<string, number> = {};
  if (isObj(v.events)) for (const [k, n] of Object.entries(v.events)) if (num(n) > 0) events[k] = num(n);
  const observations = Array.isArray(v.observations)
    ? v.observations.filter(isObj).map((o) => ({ id: String(o.id ?? ''), label: String(o.label ?? ''), value: String(o.value ?? ''), note: typeof o.note === 'string' ? o.note : undefined, at: num(o.at) }))
    : [];
  return { events, viewsSeen: strs(v.viewsSeen), observations, goalsMet: strs(v.goalsMet), demonstrated: v.demonstrated === true, updatedAt: num(v.updatedAt) };
}

export function sanitizeLessonRecord(v: unknown): LessonRecord | null {
  if (!isObj(v)) return null;
  const rec = emptyLessonRecord();
  rec.stepsSeen = strs(v.stepsSeen);
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
      const r = sanitizeIndependent(iv);
      if (r) rec.independent[ik] = r;
    }
  }
  if (isObj(v.predictions)) {
    const p: NonNullable<LessonRecord['predictions']> = {};
    for (const [k, pv] of Object.entries(v.predictions)) if (isObj(pv) && typeof pv.choiceId === 'string') p[k] = { choiceId: pv.choiceId, at: num(pv.at) };
    if (Object.keys(p).length) rec.predictions = p;
  }
  if (isObj(v.labTasks)) {
    const t: NonNullable<LessonRecord['labTasks']> = {};
    for (const [k, tv] of Object.entries(v.labTasks)) { const r = sanitizeLabTask(tv); if (r) t[k] = r; }
    if (Object.keys(t).length) rec.labTasks = t;
  }
  return rec;
}

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
      const r = sanitizeReadiness(v);
      if (r) out.readiness[k] = r;
    }
  }
  if (isObj(raw.lessons)) {
    for (const [k, v] of Object.entries(raw.lessons)) {
      const r = sanitizeLessonRecord(v);
      if (r) out.lessons[k] = r;
    }
  }
  return out;
}

export const sanitizeAssessmentAttempt = (v: unknown): AssessmentAttempt | null => {
  if (!isObj(v) || typeof v.assessmentId !== 'string') return null;
  const answers: AssessmentAttempt['answers'] = {};
  if (isObj(v.answers)) for (const [k, a] of Object.entries(v.answers)) if (isObj(a)) answers[k] = { correct: a.correct === true, marks: num(a.marks), misconception: typeof a.misconception === 'string' ? a.misconception : undefined };
  return { id: String(v.id ?? ''), assessmentId: v.assessmentId, startedAt: num(v.startedAt), submittedAt: num(v.submittedAt), answers, score: num(v.score), maxScore: num(v.maxScore), demonstrated: v.demonstrated === true };
};

export { isObj as isPlainObject };
