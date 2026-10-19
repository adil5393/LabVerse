/**
 * Evidence rules for the Propositions guided workbench (EDU-1P). Pure.
 *
 * Mastery is never set by navigation. It is derived from per-question practice
 * evidence with the shared EDU-1 rule (MASTERY_SHARE of questions answered
 * correctly on the FIRST try with no hint and no revealed solution). Records
 * saved before evidence tracking that say "mastered" cannot be verified: they
 * are kept as history and flagged `legacyMasteryUnverified`, never trusted.
 */

import { MASTERY_SHARE } from '../../education/types';

export interface PracticeEvidence {
  attempts: number;
  correct: boolean;
  /** Correct on the very first answer, with no hint and no revealed solution before it. */
  firstAttemptCorrect: boolean;
  /** Any help (hint or solution) before the first answer. */
  assisted: boolean;
  hintsUsed: number;
  solutionShown: boolean;
}

export const emptyEvidence = (): PracticeEvidence => ({ attempts: 0, correct: false, firstAttemptCorrect: false, assisted: false, hintsUsed: 0, solutionShown: false });

/** An answer arrives. Only the FIRST answer decides independence; retries never rewrite it. */
export function applyAnswer(prev: PracticeEvidence | undefined, isCorrect: boolean): PracticeEvidence {
  const ev = prev ?? emptyEvidence();
  const first = ev.attempts === 0;
  const helped = ev.hintsUsed > 0 || ev.solutionShown;
  return {
    ...ev,
    attempts: ev.attempts + 1,
    correct: ev.correct || isCorrect,
    firstAttemptCorrect: first ? isCorrect && !helped : ev.firstAttemptCorrect,
    assisted: ev.assisted || (first && helped),
  };
}

/** A hint or the solution is used. Help before the first answer makes the question assisted for good. */
export function applyHelp(prev: PracticeEvidence | undefined, kind: 'hint' | 'solution'): PracticeEvidence {
  const ev = prev ?? emptyEvidence();
  return {
    ...ev,
    hintsUsed: ev.hintsUsed + (kind === 'hint' ? 1 : 0),
    solutionShown: ev.solutionShown || kind === 'solution',
    assisted: ev.assisted || ev.attempts === 0,
  };
}

/** Mastery of one lesson's practice: enough questions independently right, and none can be repeated to count twice. */
export function isLessonPracticeMastered(questionIds: string[], evidence: Record<string, PracticeEvidence>): boolean {
  const ids = [...new Set(questionIds)];
  if (ids.length === 0) return false;
  const independent = ids.filter((id) => evidence[id]?.firstAttemptCorrect === true).length;
  return independent / ids.length >= MASTERY_SHARE;
}

export interface LessonProgressLike {
  lessonId: string;
  completed: boolean;
  mastered: boolean;
  legacyMasteryUnverified?: boolean;
}

/**
 * Keep every record; withdraw trust from mastery that has no evidence behind it.
 * `evidence` is whatever was found in storage (none for old versions).
 */
export function migrateLessons<T extends LessonProgressLike>(lessons: Record<string, T>, evidence: Record<string, PracticeEvidence>, practiceIds: (lessonId: string) => string[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [id, rec] of Object.entries(lessons)) {
    if (!rec || typeof rec !== 'object') continue;
    const earned = isLessonPracticeMastered(practiceIds(id), evidence);
    if (rec.mastered && !earned) out[id] = { ...rec, mastered: false, legacyMasteryUnverified: true };
    else out[id] = { ...rec, mastered: earned, ...(earned ? { legacyMasteryUnverified: false } : {}) };
  }
  return out;
}

const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

export function parseEvidence(raw: unknown): Record<string, PracticeEvidence> {
  const out: Record<string, PracticeEvidence> = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!v || typeof v !== 'object') continue;
    const e = v as Record<string, unknown>;
    out[k] = { attempts: num(e.attempts), correct: e.correct === true, firstAttemptCorrect: e.firstAttemptCorrect === true, assisted: e.assisted === true, hintsUsed: num(e.hintsUsed), solutionShown: e.solutionShown === true };
  }
  return out;
}

export const PROP_PROGRESS_VERSION = 2;
