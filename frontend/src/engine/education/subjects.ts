/** Subject metadata for lesson breadcrumbs: a chapter names its subject; chapters that do not are Mathematics (the original subject). */

import type { EduChapter } from './types';

export interface SubjectCrumb { label: string; href: string }

export const SUBJECTS: Record<string, SubjectCrumb> = {
  mathematics: { label: 'Mathematics', href: '/mathematics' },
  physics: { label: 'Physics', href: '/physics' },
  chemistry: { label: 'Chemistry', href: '/chemistry' },
};

export const subjectCrumb = (chapter: Pick<EduChapter, 'subject'>): SubjectCrumb => SUBJECTS[chapter.subject ?? 'mathematics'] ?? SUBJECTS.mathematics;
