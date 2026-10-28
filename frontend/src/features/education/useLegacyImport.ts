/**
 * One-time import of an older chapter store into the unified learning store. Reads the older key (never writes or removes it),
 * converts it with the chapter's explicit lesson mapping, carries per-question first-attempt evidence into the chapter practice
 * bank, and records the import. Idempotent: the store ignores a second import from the same source.
 */

import { useEffect } from 'react';
import { importLegacyProgress, legacyPracticeRecords, type LegacyShape, type LessonMapping } from '../../engine/education/legacy';
import { useEducationStore } from '../../store/useEducationStore';

export function readLegacyKey(key: string): string | null {
  try {
    return typeof localStorage === 'undefined' || !localStorage ? null : localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function runLegacyImport(chapterId: string, key: string, mapping: LessonMapping, itemIds: Record<string, string>, shape?: LegacyShape): boolean {
  const state = useEducationStore.getState();
  if (state.legacy[chapterId]?.sourceKey === key) return false;
  const imp = importLegacyProgress(readLegacyKey(key), key, mapping, shape);
  if (!imp) return false;
  state.importLegacyChapter(chapterId, imp, legacyPracticeRecords(imp, itemIds, state.practice[chapterId]));
  return true;
}

export function useLegacyImport(chapterId: string, key: string, mapping: LessonMapping, itemIds: Record<string, string>, shape?: LegacyShape): void {
  useEffect(() => { runLegacyImport(chapterId, key, mapping, itemIds, shape); }, [chapterId, key, mapping, itemIds, shape]);
}
