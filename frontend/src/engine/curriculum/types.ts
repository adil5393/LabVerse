/**
 * Versioned curriculum registry types.
 *
 * A curriculum is one board's syllabus for one class in one academic year (for example CBSE Class 9, 2026-27). It lists every
 * official chapter with its textbook numbering, the board's unit, the student-facing subject it is shown under, and what LabVerse
 * has actually built for it. Nothing here imports lesson content: the registry is light enough to load on the home page, and a
 * test cross-checks every declared count against the real content (see `__tests__/registry.test.ts`).
 */

/** The four student-facing subject areas, plus integrated Science chapters that belong to none of them alone. */
export type SubjectArea = 'physics' | 'chemistry' | 'biology' | 'mathematics' | 'integrated-science';

export type TextbookId = 'ncert-exploration-9' | 'ncert-ganita-manjari-9-1' | 'ncert-ganita-manjari-9-2';

export interface Textbook {
  id: TextbookId;
  title: string;
  publisher: 'NCERT';
  edition: string;
  /** Where the chapter PDFs can be read (public NCERT URL pattern). */
  pdfPattern: string;
}

/**
 * Where a chapter comes from:
 * - `textbook`: an NCERT chapter that is also in the board's course structure.
 * - `textbook-unassessed`: an NCERT chapter the board does not list among its examined units (for example Science Chapter 1).
 * - `cbse-only`: listed in the board's course structure but not a chapter of the prescribed textbooks (needs reviewer confirmation).
 */
export type ChapterSource = 'textbook' | 'textbook-unassessed' | 'cbse-only';

/**
 * What exists in LabVerse for a chapter. Honest by construction: `complete` is only declared after the chapter's lessons,
 * laboratories, practice and assessment exist and have tests; the registry test fails if a declared count disagrees with content.
 */
export type ImplementationStatus = 'complete' | 'partial' | 'not-started' | 'optional-support';

export interface ChapterImplementation {
  status: ImplementationStatus;
  /** Lessons that exist in the chapter's EduChapter (must equal the real count). */
  lessons: number;
  /** Lessons the chapter is planned to have when complete. */
  plannedLessons: number;
  /** Interactive laboratories (routes) that exist for this chapter. */
  labs: string[];
  practice: boolean;
  assessment: boolean;
  narration: boolean;
  /** Short honest note about what is missing. */
  note?: string;
}

export interface CurriculumChapter {
  /** Stable LabVerse id; also the progress namespace for this chapter. Never reuse an id for a different chapter. */
  id: string;
  subject: SubjectArea;
  textbook?: TextbookId;
  /** Chapter number in the textbook (Science 1-13, Mathematics 1-14). */
  number?: number;
  /** Title exactly as printed in the textbook table of contents. */
  title: string;
  /** The board's name for the chapter when it differs (for example "Structure of an Atom" for "Journey Inside the Atom"). */
  boardTitle?: string;
  /** The board's unit, as in its course structure. */
  boardUnit?: string;
  /** Marks for the whole board unit (shared by its chapters). */
  boardUnitMarks?: number;
  source: ChapterSource;
  /** Other subject areas this chapter connects to (shown as cross-links, never as duplicate chapters). */
  connects?: SubjectArea[];
  /** Learning route of the chapter hub, when built. */
  route?: string;
  /**
   * Progress namespace: every lesson id of this chapter starts with one of `lessonPrefixes`, and every prerequisite id with one
   * of `prereqPrefixes`. The progress store uses these to file records under the right chapter without loading lesson content.
   */
  scope?: { lessonPrefixes: string[]; prereqPrefixes: string[] };
  implementation: ChapterImplementation;
  /** Items a teacher or subject expert should check. */
  reviewFlags?: string[];
}

export interface OptionalTrack {
  id: string;
  title: string;
  document: string;
  chapters: string[];
  status: ImplementationStatus;
  note: string;
}

export interface Curriculum {
  id: string;
  board: 'CBSE';
  classGrade: number;
  academicYear: string;
  /** The official documents this registry was checked against. */
  sources: { title: string; url: string; checked: string }[];
  textbooks: Textbook[];
  chapters: CurriculumChapter[];
  optionalTracks: OptionalTrack[];
  /** Material LabVerse keeps but that is outside this curriculum's required scope. */
  supportingMaterial: { id: string; title: string; route: string; subject: SubjectArea | 'robotics'; reason: string }[];
  /** Recorded disagreements between official sources. */
  contradictions: { id: string; summary: string; decision: string }[];
}
