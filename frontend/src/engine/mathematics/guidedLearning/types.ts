/**
 * Reusable Guided Learning Architecture for LabVerse Mathematics
 * Milestone M2.5
 *
 * Provides a chapter-neutral, extensible framework for structured curriculum progression:
 * - Decouples guided learning orchestration from individual chapter geometry engines.
 * - Supports Units, Lessons, Learning Objectives, Configurable Stages, Gradual Tool Unlocking.
 * - Standard 6-Stage progression: Understand -> Predict -> Experiment -> Observe -> Understand Why / Prove -> Practise.
 * - Extensible to future modules (Quadrilaterals, Coordinate Geometry, Surface Areas, etc.)
 */

export type GuidedStageId =
  | 'understand'
  | 'predict'
  | 'experiment'
  | 'observe'
  | 'explain' // 'understand_why' / deductive proof
  | 'practice';

export interface ConceptTerminologyItem {
  term: string;
  definition: string;
  symbol?: string;
}

export interface GuidedLessonConcept {
  summary: string;
  detailedPoints: string[];
  keyTerms?: ConceptTerminologyItem[];
  diagramHighlightIds?: string[];
}

export interface GuidedPredictionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GuidedExperimentGuide {
  instruction: string;
  actionHint: string;
  targetActionDescription: string;
  targetMetric?: string;
  minInteractionsNeeded?: number;
}

export interface GuidedObserveGuide {
  prompt: string;
  expectedPattern: string;
  invariantsDescription: string;
}

export interface GuidedWhyGuide {
  explanationType: 'definition' | 'property' | 'theorem_proof';
  explanation: string;
  proofSteps?: {
    statement: string;
    reason: string;
    missingReasonOptions?: string[];
    correctReasonIndex?: number;
  }[];
  deductiveTakeaway: string;
}

export interface GuidedLessonDefinition {
  id: string; // e.g. 'circles-l1', 'circles-l2'
  unitId: string; // e.g. 'unit-1'
  unitTitle: string;
  lessonNumber: number; // 1 to 12
  title: string;
  subtitle: string;
  learningObjective: string;
  isOptionalExtension?: boolean;
  experimentId: string; // Canonical experiment reference
  stages: GuidedStageId[]; // Configurable stages for this lesson
  allowedTools: string[]; // Gradually introduced tools (CircleToolId)
  highlightedObjectIds?: string[];
  autoFitRadius?: number;
  concept: GuidedLessonConcept;
  predictionQuestion?: GuidedPredictionQuestion;
  experimentGuide: GuidedExperimentGuide;
  observeGuide: GuidedObserveGuide;
  whyGuide: GuidedWhyGuide;
  practiceQuestionIds: string[];
}

export interface GuidedUnitDefinition {
  id: string;
  unitNumber: number;
  title: string;
  badge?: string;
  description: string;
  lessonIds: string[];
}

export interface GuidedChapterCurriculum {
  chapterId: string;
  title: string;
  subjectId: string;
  classGrade: number;
  textbookReference: string;
  units: GuidedUnitDefinition[];
  lessons: Record<string, GuidedLessonDefinition>;
}

export interface StudentLessonProgress {
  lessonId: string;
  completed: boolean;
  completedAt?: number;
  currentStage: GuidedStageId;
  predictionAnswer?: string;
  predictionCorrect?: boolean;
  interactionsRecorded: number;
  observationsCaptured: number;
  proofCompleted: boolean;
  practiceAttempted: boolean;
  practiceMastered: boolean;
  practiceCorrectCount: number;
  practiceTotalQuestions: number;
  teacherBypassed?: boolean;
  /**
   * Per-question practice evidence (EDU-1). `firstAttemptCorrect` means correct
   * on the first try with no hint, no revealed solution and no teacher mode.
   */
  practiceAnswered?: Record<string, PracticeEvidence>;
  /** True for records saved before evidence tracking whose "mastered" flag could not be verified. */
  legacyMasteryUnverified?: boolean;
}

export interface PracticeEvidence {
  attempts: number;
  correct: boolean;
  firstAttemptCorrect: boolean;
  assisted: boolean;
}

export interface ChapterProgressState {
  chapterId: string;
  lastVisitedLessonId: string;
  completedLessonIds: string[];
  lessons: Record<string, StudentLessonProgress>;
}

export interface ChapterCompletionStats {
  completedCount: number;
  totalCount: number;
  percentage: number;
  masteredCount: number;
  nextRecommendedLessonId: string;
}
