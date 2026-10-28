/**
 * The curriculum registry: which curriculum is active, its chapters by subject, and how a lesson or prerequisite id maps to its
 * chapter (the progress namespace). Pure data and functions; no lesson content is imported here.
 */

import { CBSE_CLASS_9_2026_27 } from './cbseClass9_2026_27';
import type { Curriculum, CurriculumChapter, ImplementationStatus, SubjectArea } from './types';

export type { Curriculum, CurriculumChapter, ImplementationStatus, SubjectArea } from './types';

export const CURRICULA: Record<string, Curriculum> = { [CBSE_CLASS_9_2026_27.id]: CBSE_CLASS_9_2026_27 };

/** The curriculum LabVerse serves today. Progress is filed under this id. */
export const ACTIVE_CURRICULUM: Curriculum = CBSE_CLASS_9_2026_27;

export const SUBJECT_ORDER: SubjectArea[] = ['physics', 'chemistry', 'biology', 'mathematics', 'integrated-science'];

export const SUBJECT_LABEL: Record<SubjectArea, string> = {
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  mathematics: 'Mathematics',
  'integrated-science': 'Integrated Science',
};

export const SUBJECT_ROUTE: Record<SubjectArea, string> = {
  physics: '/physics',
  chemistry: '/chemistry',
  biology: '/biology',
  mathematics: '/mathematics',
  'integrated-science': '/science',
};

export function chapterById(id: string, curriculum: Curriculum = ACTIVE_CURRICULUM): CurriculumChapter | undefined {
  return curriculum.chapters.find((c) => c.id === id);
}

/** Chapters shown under a subject, in textbook order (textbook chapters first, then board-only topics). */
export function chaptersFor(subject: SubjectArea, curriculum: Curriculum = ACTIVE_CURRICULUM): CurriculumChapter[] {
  const order = (c: CurriculumChapter) => (c.source === 'cbse-only' ? 1000 : 0) + (c.number ?? 999);
  return curriculum.chapters.filter((c) => c.subject === subject).sort((a, b) => order(a) - order(b));
}

/** Science chapters of other subjects that connect to this subject (shown as cross-links). */
export function connectedChapters(subject: SubjectArea, curriculum: Curriculum = ACTIVE_CURRICULUM): CurriculumChapter[] {
  return curriculum.chapters.filter((c) => c.subject !== subject && c.connects?.includes(subject));
}

function longestPrefixMatch(id: string, pick: (c: CurriculumChapter) => string[] | undefined, curriculum: Curriculum): CurriculumChapter | undefined {
  let best: CurriculumChapter | undefined;
  let bestLen = 0;
  for (const c of curriculum.chapters) {
    for (const p of pick(c) ?? []) {
      if (id.startsWith(p) && p.length > bestLen) { best = c; bestLen = p.length; }
    }
  }
  return best;
}

/** The chapter a lesson id belongs to, from the registered lesson prefixes. */
export const chapterOfLesson = (lessonId: string, curriculum: Curriculum = ACTIVE_CURRICULUM): string | undefined =>
  longestPrefixMatch(lessonId, (c) => c.scope?.lessonPrefixes, curriculum)?.id;

/** The chapter a prerequisite id belongs to, from the registered prerequisite prefixes. */
export const chapterOfPrerequisite = (prereqId: string, curriculum: Curriculum = ACTIVE_CURRICULUM): string | undefined =>
  longestPrefixMatch(prereqId, (c) => c.scope?.prereqPrefixes, curriculum)?.id;

export interface SubjectSummary {
  subject: SubjectArea;
  chapters: number;
  complete: number;
  partial: number;
  notStarted: number;
  lessons: number;
  plannedLessons: number;
}

export function subjectSummary(subject: SubjectArea, curriculum: Curriculum = ACTIVE_CURRICULUM): SubjectSummary {
  const list = chaptersFor(subject, curriculum).filter((c) => c.implementation.status !== 'optional-support');
  const count = (s: ImplementationStatus) => list.filter((c) => c.implementation.status === s).length;
  return {
    subject,
    chapters: list.length,
    complete: count('complete'),
    partial: count('partial'),
    notStarted: count('not-started'),
    lessons: list.reduce((n, c) => n + c.implementation.lessons, 0),
    plannedLessons: list.reduce((n, c) => n + c.implementation.plannedLessons, 0),
  };
}

export const STATUS_TEXT: Record<ImplementationStatus, string> = {
  complete: 'Complete',
  partial: 'Partly built',
  'not-started': 'Not built yet',
  'optional-support': 'Optional',
};
