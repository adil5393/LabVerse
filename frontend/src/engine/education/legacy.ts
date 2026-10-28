/**
 * Import of progress saved by the older chapter-specific guided-workbench stores (Circles, Quadrilaterals, Propositions,
 * Understanding Data, Two Variables). Pure: it takes the raw JSON string and an explicit lesson mapping table and returns a
 * `LegacyChapterImport`. It never writes storage and never produces lesson mastery:
 *
 * - "completed" in the older stores was set by pressing a button, so it becomes `completedClaim` (history only).
 * - A "mastered" flag becomes `masteryClaim: 'old-rule'` when the older store had per-question evidence for it, or
 *   `'unverified'` when it did not. Neither counts as mastery under the shared rules.
 * - Per-question first-attempt and assisted evidence is preserved exactly as recorded.
 * - Lessons map to current lessons ONLY through the table (`mapping`). Old and new ids that look alike may be different
 *   lessons (Quadrilaterals `quad-l4` is "converse properties" in the older path but "Midpoint Theorem" now).
 */

import type { IndependentRecord, LegacyChapterImport, LegacyLessonImport } from './types';

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Old lesson id → current lesson id (or null when the old lesson has no current counterpart, e.g. a revision lesson). */
export type LessonMapping = Record<string, string | null>;

export interface LegacyShape {
  /** Where the lessons live in the old JSON (default `lessons`). */
  lessonsField?: string;
  /** Field holding per-question evidence (default `practiceAnswered`). */
  evidenceField?: string;
  /** Field holding the old mastery flag (default `practiceMastered`; some stores use `mastered`). */
  masteredField?: string;
  /**
   * Some stores keep practice evidence at the top level (`practiceAnswers`, `practiceEvidence`) instead of per lesson. Each
   * question is then filed under the older lesson(s) that list it (`questionsOf`).
   */
  rootEvidenceField?: string;
  questionsOf?: (legacyLessonId: string) => string[];
}

/**
 * One question's evidence in any of the older formats. `isCorrect` is the Two Variables / Understanding Data spelling. When an
 * older record has no `assisted` flag but shows help (hints revealed or the solution shown), it is treated as assisted, because
 * the record cannot tell whether the help came before the first answer.
 */
function evidenceOf(v: unknown): LegacyLessonImport['practice'] {
  const out: LegacyLessonImport['practice'] = {};
  if (!isObj(v)) return out;
  for (const [q, e] of Object.entries(v)) {
    if (!isObj(e)) continue;
    const helped = Number(e.hintsRevealed) > 0 || Number(e.hintsUsed) > 0 || e.showSolution === true || e.solutionShown === true;
    const assisted = typeof e.assisted === 'boolean' ? e.assisted || (helped && e.firstAttemptCorrect !== true) : helped;
    out[q] = { attempts: Number(e.attempts) || 0, correct: e.correct === true || e.isCorrect === true, firstAttemptCorrect: e.firstAttemptCorrect === true && !assisted, assisted };
  }
  return out;
}

/**
 * Parse an older store's saved JSON. Returns null for missing, empty or unreadable data (nothing to import), so a corrupt old
 * record never blocks the new system. The raw string is kept on the import for audit.
 */
export function importLegacyProgress(rawText: string | null, sourceKey: string, mapping: LessonMapping, shape: LegacyShape = {}, now: number = Date.now()): LegacyChapterImport | null {
  if (!rawText) return null;
  let raw: unknown;
  try { raw = JSON.parse(rawText); } catch { return null; }
  if (!isObj(raw)) return null;
  const lessonsRaw = raw[shape.lessonsField ?? 'lessons'];
  const rootEvidence = shape.rootEvidenceField ? evidenceOf(raw[shape.rootEvidenceField]) : {};
  const completedList = Array.isArray(raw.completedLessonIds) ? raw.completedLessonIds.filter((x): x is string => typeof x === 'string') : [];
  const lessons: LegacyChapterImport['lessons'] = {};
  const ids = new Set<string>([...completedList, ...(isObj(lessonsRaw) ? Object.keys(lessonsRaw) : [])]);
  // Evidence for questions of lessons the student never opened still belongs somewhere: file it under the listing lesson.
  if (shape.rootEvidenceField && shape.questionsOf) for (const lid of Object.keys(mapping)) if ((shape.questionsOf(lid) ?? []).some((q) => rootEvidence[q])) ids.add(lid);
  for (const id of ids) {
    const l = isObj(lessonsRaw) && isObj(lessonsRaw[id]) ? (lessonsRaw[id] as Record<string, unknown>) : {};
    const practice = shape.rootEvidenceField
      ? Object.fromEntries((shape.questionsOf?.(id) ?? []).filter((q) => rootEvidence[q]).map((q) => [q, rootEvidence[q]]))
      : evidenceOf(l[shape.evidenceField ?? 'practiceAnswered']);
    const mastered = l[shape.masteredField ?? 'practiceMastered'] === true || (shape.masteredField === undefined && l.mastered === true);
    const hasEvidence = Object.keys(practice).length > 0;
    const masteryClaim: LegacyLessonImport['masteryClaim'] = l.legacyMasteryUnverified === true ? 'unverified' : mastered ? (hasEvidence ? 'old-rule' : 'unverified') : 'none';
    const prediction = typeof l.predictionAnswer === 'string' ? { answer: l.predictionAnswer, correct: typeof l.predictionCorrect === 'boolean' ? l.predictionCorrect : undefined }
      : typeof l.predictionSelectedOption === 'number' || typeof l.predictionSelectedOption === 'string' ? { answer: String(l.predictionSelectedOption), correct: typeof l.predictionIsCorrect === 'boolean' ? l.predictionIsCorrect : undefined }
      : typeof l.predictionOption === 'number' ? { answer: String(l.predictionOption), correct: typeof l.predictionIsCorrect === 'boolean' ? l.predictionIsCorrect : undefined }
      : l.predictionMade === true ? { answer: typeof l.predictionText === 'string' ? l.predictionText : '(recorded)' } : undefined;
    const mapped = Object.prototype.hasOwnProperty.call(mapping, id) ? mapping[id] : undefined;
    lessons[id] = {
      legacyLessonId: id,
      mappedLessonId: mapped ?? undefined,
      completedClaim: completedList.includes(id) || l.completed === true,
      masteryClaim,
      teacherBypassed: l.teacherBypassed === true,
      practice,
      prediction,
      interactions: Number(l.interactionsRecorded) || 0,
      observations: Number(l.observationsCaptured) || (Array.isArray(l.observations) ? l.observations.length : 0),
    };
  }
  if (!Object.keys(lessons).length) return null;
  return {
    sourceKey,
    importedAt: now,
    raw: rawText,
    lessons,
    lastVisitedLessonId: typeof raw.lastVisitedLessonId === 'string' ? raw.lastVisitedLessonId : undefined,
  };
}

/**
 * First-attempt evidence from the older practice questions, as chapter-practice records, for the questions that now live in the
 * chapter practice bank (`itemIds`: old question id → new practice item id). Existing records are never overwritten: only items
 * with no record yet are filled. Assisted answers stay assisted; nothing becomes unassisted that was not.
 */
export function legacyPracticeRecords(imp: LegacyChapterImport, itemIds: Record<string, string>, existing: Record<string, IndependentRecord> = {}): Record<string, IndependentRecord> {
  const out: Record<string, IndependentRecord> = {};
  for (const l of Object.values(imp.lessons)) {
    for (const [q, e] of Object.entries(l.practice)) {
      const target = itemIds[q];
      if (!target || existing[target] || out[target] || e.attempts <= 0) continue;
      const unassisted = e.firstAttemptCorrect && !e.assisted && !l.teacherBypassed;
      out[target] = {
        attempts: e.attempts,
        firstAttemptUnassisted: unassisted,
        correct: e.correct,
        hintsUsed: 0,
        solutionShown: false,
        assisted: e.assisted || l.teacherBypassed,
        misconceptions: [],
      };
    }
  }
  return out;
}

export interface LegacySummary { lessons: number; completedClaims: number; oldRuleMastery: number; unverified: number; unmapped: string[] }

export function summarizeLegacy(imp: LegacyChapterImport | undefined): LegacySummary {
  const ls = Object.values(imp?.lessons ?? {});
  return {
    lessons: ls.length,
    completedClaims: ls.filter((l) => l.completedClaim).length,
    oldRuleMastery: ls.filter((l) => l.masteryClaim === 'old-rule').length,
    unverified: ls.filter((l) => l.masteryClaim === 'unverified').length,
    unmapped: ls.filter((l) => !l.mappedLessonId).map((l) => l.legacyLessonId),
  };
}

/** What a current lesson inherited from the older path (for an "earlier version" badge). Display only. */
export function legacyFor(imp: LegacyChapterImport | undefined, lessonId: string): LegacyLessonImport[] {
  return Object.values(imp?.lessons ?? {}).filter((l) => l.mappedLessonId === lessonId);
}
