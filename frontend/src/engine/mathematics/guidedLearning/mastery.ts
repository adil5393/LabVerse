/**
 * Evidence rules shared by the guided-workbench stores of Circles and
 * Quadrilaterals (EDU-1 / EDU-1Q). Pure functions of per-question evidence, so
 * every chapter applies the same definition of mastery.
 */

import { MASTERY_SHARE } from '../../education/types';
import type { PracticeEvidence, StudentLessonProgress } from './types';

/**
 * Records saved before per-question evidence existed could mark a lesson
 * "mastered" by answering ONE question correctly several times. Such a flag
 * cannot be verified, so it is kept visible as "legacy" but no longer counts
 * as mastery. Everything else is preserved untouched.
 */
export function migrateLessonProgress(p: StudentLessonProgress): StudentLessonProgress {
  if (p.practiceMastered && !p.practiceAnswered) {
    return { ...p, practiceMastered: false, legacyMasteryUnverified: true };
  }
  return p;
}

/** Mastery: enough practice questions answered correctly on the first try with no help. */
export function isPracticeMastered(answered: Record<string, PracticeEvidence> | undefined, total: number): boolean {
  if (!answered || total <= 0) return false;
  const unassisted = Object.values(answered).filter((a) => a.firstAttemptCorrect).length;
  return unassisted / total >= MASTERY_SHARE;
}
