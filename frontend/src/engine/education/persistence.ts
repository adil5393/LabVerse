/**
 * Learning-evidence storage, schema version 2 (pure; no browser APIs).
 *
 * Version 2 files every record under its curriculum and chapter:
 *
 *   { version: 2, curricula: { [curriculumId]: { chapters: { [chapterId]: ChapterBucket } } }, migrations: {...} }
 *
 * In memory the store keeps flat maps keyed by lesson / prerequisite id (ids are unique across the curriculum; the registry
 * test enforces it). On save, records are grouped by chapter using a scope resolver built from the registry's id prefixes, so
 * no lesson content needs to be loaded. A record whose chapter cannot be resolved is filed under `UNSCOPED` and loaded back
 * unchanged: nothing is ever dropped for being unrecognised.
 *
 * Migration from version 1 (`labverse_edu_progress_v1`, flat maps) is a pure read: the version 1 key is never written or removed,
 * so it remains a readable backup. Loading is idempotent: the same input always gives the same state, and loading the saved
 * output gives the same state again.
 */

import { migratePersisted, sanitizeAssessmentAttempt, sanitizeIndependent, sanitizeLessonRecord, sanitizeReadiness, isPlainObject as isObj } from './progress';
import type { AssessmentAttempt, IndependentRecord, LegacyChapterImport, LessonRecord, ReadinessRecord } from './types';

export const LEARNING_SCHEMA_VERSION = 2;
export const STORAGE_KEY_V2 = 'labverse_learning_v2';
export const STORAGE_KEY_V1 = 'labverse_edu_progress_v1';
export const UNSCOPED = '_unscoped';

export interface ChapterBucket {
  lessons: Record<string, LessonRecord>;
  readiness: Record<string, ReadinessRecord>;
  /** Chapter practice bank evidence, by practice item id. */
  practice: Record<string, IndependentRecord>;
  assessments: AssessmentAttempt[];
  legacy?: LegacyChapterImport;
}

export interface LearningPersistedV2 {
  version: 2;
  curricula: Record<string, { chapters: Record<string, ChapterBucket> }>;
  migrations: Record<string, { at: number; note: string }>;
}

/** The in-memory learning state for the active curriculum. */
export interface LearningState {
  lessons: Record<string, LessonRecord>;
  readiness: Record<string, ReadinessRecord>;
  practice: Record<string, Record<string, IndependentRecord>>;
  assessments: Record<string, AssessmentAttempt[]>;
  legacy: Record<string, LegacyChapterImport>;
  migrations: Record<string, { at: number; note: string }>;
}

export interface ScopeResolver {
  lesson: (lessonId: string) => string | undefined;
  prereq: (prereqId: string) => string | undefined;
}

export const emptyLearningState = (): LearningState => ({ lessons: {}, readiness: {}, practice: {}, assessments: {}, legacy: {}, migrations: {} });

const emptyBucket = (): ChapterBucket => ({ lessons: {}, readiness: {}, practice: {}, assessments: [] });

function sanitizeLegacy(v: unknown): LegacyChapterImport | undefined {
  if (!isObj(v) || typeof v.sourceKey !== 'string' || !isObj(v.lessons)) return undefined;
  const lessons: LegacyChapterImport['lessons'] = {};
  for (const [k, l] of Object.entries(v.lessons)) {
    if (!isObj(l)) continue;
    const practice: LegacyChapterImport['lessons'][string]['practice'] = {};
    if (isObj(l.practice)) for (const [q, e] of Object.entries(l.practice)) if (isObj(e)) practice[q] = { attempts: Number(e.attempts) || 0, correct: e.correct === true, firstAttemptCorrect: e.firstAttemptCorrect === true, assisted: e.assisted === true };
    lessons[k] = {
      legacyLessonId: typeof l.legacyLessonId === 'string' ? l.legacyLessonId : k,
      mappedLessonId: typeof l.mappedLessonId === 'string' ? l.mappedLessonId : undefined,
      completedClaim: l.completedClaim === true,
      masteryClaim: l.masteryClaim === 'old-rule' || l.masteryClaim === 'unverified' ? l.masteryClaim : 'none',
      teacherBypassed: l.teacherBypassed === true,
      practice,
      prediction: isObj(l.prediction) && typeof l.prediction.answer === 'string' ? { answer: l.prediction.answer, correct: typeof l.prediction.correct === 'boolean' ? l.prediction.correct : undefined } : undefined,
      interactions: Number(l.interactions) || 0,
      observations: Number(l.observations) || 0,
    };
  }
  return { sourceKey: v.sourceKey, importedAt: Number(v.importedAt) || 0, raw: typeof v.raw === 'string' ? v.raw : '', lessons, lastVisitedLessonId: typeof v.lastVisitedLessonId === 'string' ? v.lastVisitedLessonId : undefined };
}

function sanitizeBucket(v: unknown): ChapterBucket {
  const b = emptyBucket();
  if (!isObj(v)) return b;
  if (isObj(v.lessons)) for (const [k, r] of Object.entries(v.lessons)) { const x = sanitizeLessonRecord(r); if (x) b.lessons[k] = x; }
  if (isObj(v.readiness)) for (const [k, r] of Object.entries(v.readiness)) { const x = sanitizeReadiness(r); if (x) b.readiness[k] = x; }
  if (isObj(v.practice)) for (const [k, r] of Object.entries(v.practice)) { const x = sanitizeIndependent(r); if (x) b.practice[k] = x; }
  if (Array.isArray(v.assessments)) b.assessments = v.assessments.map(sanitizeAssessmentAttempt).filter((x): x is AssessmentAttempt => x !== null);
  const legacy = sanitizeLegacy(v.legacy);
  if (legacy) b.legacy = legacy;
  return b;
}

/** Group the in-memory state by chapter for one curriculum. Pure. */
export function stateToBuckets(state: LearningState, scope: ScopeResolver): Record<string, ChapterBucket> {
  const out: Record<string, ChapterBucket> = {};
  const bucket = (id: string | undefined) => (out[id ?? UNSCOPED] ??= emptyBucket());
  for (const [id, r] of Object.entries(state.lessons)) bucket(scope.lesson(id)).lessons[id] = r;
  for (const [id, r] of Object.entries(state.readiness)) bucket(scope.prereq(id)).readiness[id] = r;
  for (const [ch, recs] of Object.entries(state.practice)) if (Object.keys(recs).length) bucket(ch).practice = { ...recs };
  for (const [ch, list] of Object.entries(state.assessments)) if (list.length) bucket(ch).assessments = [...list];
  for (const [ch, l] of Object.entries(state.legacy)) bucket(ch).legacy = l;
  return out;
}

/** Flatten one curriculum's buckets back into in-memory state. Pure. */
export function bucketsToState(chapters: Record<string, ChapterBucket>, migrations: LearningState['migrations']): LearningState {
  const s = emptyLearningState();
  s.migrations = { ...migrations };
  for (const [ch, b] of Object.entries(chapters)) {
    Object.assign(s.lessons, b.lessons);
    Object.assign(s.readiness, b.readiness);
    if (Object.keys(b.practice).length) s.practice[ch] = { ...b.practice };
    if (b.assessments.length) s.assessments[ch] = [...b.assessments];
    if (b.legacy) s.legacy[ch] = b.legacy;
  }
  return s;
}

/** Build the version 2 document, keeping other curricula's data exactly as it was. Pure. */
export function serialize(state: LearningState, curriculumId: string, scope: ScopeResolver, previous?: LearningPersistedV2 | null): LearningPersistedV2 {
  return {
    version: 2,
    curricula: { ...(previous?.curricula ?? {}), [curriculumId]: { chapters: stateToBuckets(state, scope) } },
    migrations: { ...(previous?.migrations ?? {}), ...state.migrations },
  };
}

export function parseV2(raw: unknown): LearningPersistedV2 | null {
  if (!isObj(raw) || raw.version !== 2 || !isObj(raw.curricula)) return null;
  const curricula: LearningPersistedV2['curricula'] = {};
  for (const [cid, c] of Object.entries(raw.curricula)) {
    if (!isObj(c) || !isObj(c.chapters)) continue;
    const chapters: Record<string, ChapterBucket> = {};
    for (const [ch, b] of Object.entries(c.chapters)) chapters[ch] = sanitizeBucket(b);
    curricula[cid] = { chapters };
  }
  const migrations: LearningPersistedV2['migrations'] = {};
  if (isObj(raw.migrations)) for (const [k, m] of Object.entries(raw.migrations)) if (isObj(m)) migrations[k] = { at: Number(m.at) || 0, note: String(m.note ?? '') };
  return { version: 2, curricula, migrations };
}

export type LoadSource = 'v2' | 'v1' | 'empty' | 'corrupt-v2';

export interface LoadResult {
  state: LearningState;
  source: LoadSource;
  /** The parsed version 2 document (other curricula are preserved from it on save). */
  document: LearningPersistedV2 | null;
}

/**
 * Load the learning state for a curriculum from whatever storage holds. `read` returns the raw string for a key or null.
 * Prefers version 2; falls back to version 1 (marking the migration); a corrupt version 2 document is not overwritten with
 * version 1 data silently: it is reported as `corrupt-v2` and loading continues from version 1 so nothing is lost.
 */
export function loadLearning(read: (key: string) => string | null, curriculumId: string, now: number = Date.now()): LoadResult {
  const parse = (k: string): unknown => { const t = read(k); if (t == null) return undefined; try { return JSON.parse(t); } catch { return null; } };
  const v2raw = parse(STORAGE_KEY_V2);
  const doc = v2raw === undefined ? null : parseV2(v2raw);
  if (doc) {
    const chapters = doc.curricula[curriculumId]?.chapters ?? {};
    return { state: bucketsToState(chapters, doc.migrations), source: 'v2', document: doc };
  }
  const v1raw = parse(STORAGE_KEY_V1);
  if (v1raw !== undefined && v1raw !== null) {
    const v1 = migratePersisted(v1raw);
    const state = emptyLearningState();
    state.lessons = v1.lessons;
    state.readiness = v1.readiness;
    state.migrations['edu-v1-to-v2'] = { at: now, note: `Imported ${Object.keys(v1.lessons).length} lesson and ${Object.keys(v1.readiness).length} readiness records from ${STORAGE_KEY_V1} (left unchanged).` };
    return { state, source: v2raw === undefined ? 'v1' : 'corrupt-v2', document: null };
  }
  return { state: emptyLearningState(), source: v2raw === undefined ? 'empty' : 'corrupt-v2', document: null };
}
