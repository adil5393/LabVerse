/**
 * Chapter-neutral learning-foundation types (EDU-1).
 *
 * A chapter supplies DATA (prerequisites, explainers, worked examples,
 * practice) and a registry of VISUAL components. The shared components render
 * the data; nothing here knows about any particular chapter.
 *
 * Teaching sequence supported:
 * Prerequisites → Understand → (Investigate) → Worked example (I do)
 * → Guided practice (We do) → Independent practice (You do) → Reflect.
 */

/** A reference to a chapter-provided visual. `alt` is the accessible description. */
export interface VisualRef {
  kind: string;
  props?: Record<string, unknown>;
  alt: string;
}

export interface Vocabulary {
  term: string;
  meaning: string;
}

export interface MisconceptionNote {
  wrong: string;
  right: string;
}

// ---------------------------------------------------------------------------
// Questions (used by comprehension checks, readiness checks and practice)
// ---------------------------------------------------------------------------

export interface FeedbackEntry {
  /** What is wrong, in plain language, and what to think about instead. */
  message: string;
  /** A refresher step or prerequisite that targets this error. */
  refresherId?: string;
  /** A short tag for the kind of mistake, kept as learning evidence. */
  misconception?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
}

export interface ChoiceQuestion {
  kind: 'choice';
  id: string;
  prompt: string;
  visual?: VisualRef;
  options: ChoiceOption[];
  correctId: string;
  /** Feedback keyed by the WRONG option id. */
  feedback: Record<string, FeedbackEntry>;
  explanation: string;
}

export interface NumericRule {
  /** Specific wrong answers with their own explanation (e.g. swapped coordinates). */
  values: number[];
  entry: FeedbackEntry;
}

export interface NumericQuestion {
  kind: 'numeric';
  id: string;
  prompt: string;
  visual?: VisualRef;
  answer: number;
  tolerance?: number;
  unit?: string;
  rules?: NumericRule[];
  defaultFeedback: FeedbackEntry;
  explanation: string;
}

/** The student answers by acting on a visual, which reports an answer id. */
export interface VisualQuestion {
  kind: 'visual';
  id: string;
  prompt: string;
  visual: VisualRef;
  correctId: string;
  feedback: Record<string, FeedbackEntry>;
  defaultFeedback: FeedbackEntry;
  explanation: string;
}

/**
 * Arrange the steps of an argument. Any order is accepted in which every step
 * comes after the steps it needs (`needs`), so a proof with two independent
 * first steps may start with either.
 */
export interface OrderItem {
  id: string;
  text: string;
  /** Ids that must appear EARLIER in a valid argument. */
  needs: string[];
  /** Why this step is valid once its needs are in place. */
  because?: string;
}

export interface OrderQuestion {
  kind: 'order';
  id: string;
  prompt: string;
  visual?: VisualRef;
  /** Listed in a deliberately scrambled order. */
  items: OrderItem[];
  explanation: string;
}

/**
 * The student supplies a whole number and a chapter-provided judge decides
 * (for example, "is this a counterexample to the statement?"). The judge is
 * looked up by id in a JudgeRegistry, so content stays plain data.
 */
export interface JudgedQuestion {
  kind: 'judged';
  id: string;
  prompt: string;
  visual?: VisualRef;
  judgeId: string;
  explanation: string;
  /**
   * 'integer' (default): one whole number. 'pair': a point (x, y), for questions with many right answers such as "give any
   * point on this line"; the judge receives x and y.
   */
  input?: 'integer' | 'pair';
}

/** One labelled number in a multi-part answer ("diameter = 9 cm, circumference = 28.26 cm"). */
export interface NumericPart {
  id: string;
  label: string;
  answer: number;
  tolerance?: number;
  unit?: string;
}

/**
 * Several numbers that must all be right (for example a length and an angle). Every part is checked; a partly right answer
 * says which parts are right so the student can fix the rest.
 */
export interface MultiNumericQuestion {
  kind: 'multi';
  id: string;
  prompt: string;
  visual?: VisualRef;
  parts: NumericPart[];
  defaultFeedback: FeedbackEntry;
  explanation: string;
}

export type Question = ChoiceQuestion | NumericQuestion | VisualQuestion | OrderQuestion | JudgedQuestion | MultiNumericQuestion;

export type AnswerInput =
  | { kind: 'choice' | 'visual'; id: string }
  | { kind: 'numeric'; text: string }
  | { kind: 'order'; ids: string[] }
  | { kind: 'multi'; values: Record<string, string> };

export interface Verdict {
  correct: boolean;
  message: string;
  refresherId?: string;
  misconception?: string;
}

export type JudgeRegistry = Record<string, (value: number, y?: number) => Verdict>;

export interface Evaluation {
  correct: boolean;
  /** The input could not be read (empty or not a number). Not counted as an attempt. */
  invalid?: boolean;
  message: string;
  refresherId?: string;
  misconception?: string;
}

// ---------------------------------------------------------------------------
// Teaching content
// ---------------------------------------------------------------------------

/** Where a step sits on the route from noticing a pattern to proving it. */
export type LearningPhase = 'observe' | 'conjecture' | 'reasoning' | 'proof' | 'apply';

export interface ProofStep {
  claim: string;
  reason: string;
  /** Ids the chapter's visual should emphasise while this step is selected. */
  show?: string[];
  /**
   * Optional "supply the reason" interaction: the student picks the reason for this claim from these choices before it is shown.
   * `reason` must be one of them. Recorded as a quick check (`proofCheckId`), so it is evidence of reasoning, never of mastery alone.
   */
  reasonChoices?: string[];
}

/**
 * A prediction before an investigation. Not graded: the student commits to a choice, then the explanation (and the step's visual,
 * notice and why) is revealed. What they predicted is kept as learning evidence so the reflection can compare it with the result.
 */
export interface PredictionPrompt {
  id: string;
  prompt: string;
  options: ChoiceOption[];
  /** The option that matches what the investigation shows (used only to word the reveal, never to score). */
  expectedId?: string;
  /**
   * A numeric prediction instead of options: the student types a value. `answer` and `closeWithin` only word the reveal
   * ("close" or "worth comparing"); a prediction is never scored.
   */
  numeric?: { unit?: string; answer?: number; closeWithin?: number };
  /** Shown after the student commits. */
  reveal: string;
}

/** One measurable goal of a laboratory task, met by events the laboratory reports (never by pressing a "done" button). */
export interface LabGoal {
  id: string;
  label: string;
  /** Laboratory event names that satisfy this goal (for example "chord-moved"). */
  events?: string[];
  /** Number of qualifying events needed (default 1). */
  count?: number;
  /** A named view or mode the student must open. */
  view?: string;
}

/**
 * A guided investigation inside a real laboratory. The lesson tells the laboratory what to set up (`setup`, passed through the
 * route), the laboratory reports events, and goals are met by those events. Observations are values the laboratory measured.
 */
export interface LabTask {
  id: string;
  title: string;
  instruction: string;
  /** Route of the laboratory; the task id and lesson id are added as query parameters. */
  href: string;
  /** Opaque setup for the laboratory (experiment id, allowed tools, highlighted objects). */
  setup?: Record<string, unknown>;
  goals: LabGoal[];
  /** Prompt for the observation the student records (a measured value plus their own note). */
  observePrompt?: string;
  /** What the observations should show, revealed once goals are met. */
  expectedPattern?: string;
  /** When true, the lesson is not completed (and not mastered) until every goal is met. */
  requiredForMastery?: boolean;
  /** A prediction to commit before the investigation opens (used when no lesson step is free to carry it). */
  prediction?: PredictionPrompt;
}

export type PracticeDifficulty = 'basic' | 'standard' | 'challenge';

export interface ExplainerStep {
  id: string;
  title: string;
  /** Short paragraphs. Plain language first, then the precise statement. */
  paragraphs: string[];
  vocabulary?: Vocabulary[];
  visual?: VisualRef;
  /** What the student should look at in the visual. */
  notice?: string;
  /** Why the relationship holds, at a level suited to the learner. */
  why?: string;
  misconception?: MisconceptionNote;
  check?: ChoiceQuestion;
  phase?: LearningPhase;
  /** A deductive argument, one claim and one reason per line, linked to the diagram. */
  proof?: ProofStep[];
  /** Ask for a prediction first; the rest of the step is revealed after the student commits. */
  prediction?: PredictionPrompt;
  /** Show a laboratory task card (id of one of the lesson's `labTasks`) at the end of this step. */
  labTaskId?: string;
}

export interface Prerequisite {
  id: string;
  title: string;
  /** Why this matters for the chapter or unit. */
  why: string;
  /** Link to earlier learning, e.g. "Class 8: the number line". */
  connection?: string;
  refresher: ExplainerStep[];
  /** Short readiness check. Never blocks the student. */
  checks: Question[];
}

export interface WorkedStep {
  text: string;
  /** Why this step is valid. */
  why: string;
  visual?: VisualRef;
}

export interface WorkedExample {
  id: string;
  title: string;
  given: string[];
  ask: string;
  visual?: VisualRef;
  steps: WorkedStep[];
  verify: string;
}

export interface GuidedStep {
  id: string;
  prompt: string;
  question: Question;
  hints: string[];
}

export interface GuidedItem {
  id: string;
  prompt: string;
  visual?: VisualRef;
  steps: GuidedStep[];
  conclusion: string;
}

export interface IndependentItem {
  id: string;
  /** Topic label used to group evidence and recommend revision. */
  topic: string;
  prompt: string;
  visual?: VisualRef;
  question: Question;
  hints: string[];
  solution: string[];
  /** A diagram shown with the worked solution (never with the question, so it cannot give the answer away). */
  solutionVisual?: VisualRef;
  /** Which lesson objective this item tests (see EduLesson.objectives). */
  objective?: string;
  difficulty?: PracticeDifficulty;
  marks?: number;
  /** Original question aligned to a textbook section, or an original question of LabVerse's own. Never copied text. */
  source?: { kind: 'original' | 'textbook-aligned'; ref?: string };
}

/** A persisted chapter practice bank: groups of independent items, outside any one lesson. */
export interface PracticeGroup {
  id: string;
  title: string;
  blurb: string;
  items: IndependentItem[];
}

export interface PracticeSet {
  id: string;
  title: string;
  groups: PracticeGroup[];
}

/** Where an assessment question sits on the board's competency scale (CBSE question paper design). */
export type Competency = 'knowledge' | 'application' | 'analysis';

export interface AssessmentItem {
  id: string;
  topic: string;
  /** Lesson whose ideas the item tests (for revision recommendations). */
  lessonId?: string;
  competency: Competency;
  marks: number;
  prompt: string;
  visual?: VisualRef;
  question: Question;
  /** Shown only after the assessment is submitted. */
  solution: string[];
}

export interface AssessmentSection {
  id: string;
  title: string;
  items: AssessmentItem[];
}

/**
 * An end-of-chapter assessment. No hints during the attempt; feedback and solutions appear after submission. Results feed
 * readiness and revision recommendations; an attempt made in teacher demonstration mode is recorded as a demonstration.
 */
export interface ChapterAssessment {
  id: string;
  title: string;
  instructions: string;
  sections: AssessmentSection[];
  /** Share of marks for "ready" (default MASTERY_SHARE). */
  readyShare?: number;
}

export interface Reflection {
  discover: string;
  evidence: string;
  /** Things the student may still find confusing, each linking to a refresher. */
  stillConfusing: { text: string; refresherId: string }[];
}

export interface Investigation {
  title: string;
  description: string;
  /** Route to an existing interactive laboratory or guided lesson. */
  href: string;
  buttonLabel: string;
}

export interface LearningObjective {
  id: string;
  label: string;
}

export interface EduLesson {
  id: string;
  unitId: string;
  number: number;
  title: string;
  objective: string;
  prerequisiteIds: string[];
  steps: ExplainerStep[];
  investigation?: Investigation;
  worked: WorkedExample;
  guided: GuidedItem;
  independent: IndependentItem[];
  reflection: Reflection;
  /**
   * Optional. When present, mastery also requires at least one item of EVERY
   * objective answered independently (first try, no help), so several variations
   * of one easy question cannot stand in for the whole lesson.
   */
  objectives?: LearningObjective[];
  /** Guided investigations in a laboratory, shown from steps that name them (`labTaskId`). */
  labTasks?: LabTask[];
  /** Marks the lesson as an optional extension beyond the curriculum: never counted in chapter completion or mastery. */
  extension?: boolean;
}

export interface EduUnit {
  id: string;
  number: number;
  title: string;
  centralIdea: string;
  /** How this unit relates to earlier units or chapters. */
  connection: string;
  vocabulary: Vocabulary[];
  discover: string[];
  prerequisiteIds: string[];
  lessonIds: string[];
}

export interface EduChapter {
  id: string;
  title: string;
  classGrade: number;
  /** Honest statement of what was verified against the textbook. */
  ncertNote: string;
  /** Subject shown first in the lesson breadcrumb (see subjects.ts). Defaults to mathematics. */
  subject?: 'mathematics' | 'physics' | 'chemistry' | 'biology' | 'integrated-science';
  /** Persisted chapter practice bank (optional). */
  practice?: PracticeSet;
  /** End-of-chapter assessment (optional). */
  assessment?: ChapterAssessment;
  purpose: string;
  learn: string[];
  realWorld: string[];
  outcomes: string[];
  prerequisiteIds: string[];
  units: EduUnit[];
  lessons: Record<string, EduLesson>;
  prerequisites: Record<string, Prerequisite>;
  routes: {
    landing: string;
    learn: (lessonId: string) => string;
    prerequisites: (prereqId: string) => string;
    lab: string;
    practice?: string;
    /** Chapter assessment page, when the chapter has one. */
    assessment?: string;
  };
}

// ---------------------------------------------------------------------------
// Evidence (what the student actually did)
// ---------------------------------------------------------------------------

export type ReadinessStatus = 'passed' | 'needs_review' | 'bypassed';

export interface ReadinessRecord {
  status: ReadinessStatus;
  attempts: number;
  /** Ids of checks answered correctly. */
  correct: string[];
  /** Mistakes made, for targeted recommendations. */
  missed: { questionId: string; refresherId?: string; misconception?: string }[];
  updatedAt: number;
}

export interface IndependentRecord {
  attempts: number;
  /** Correct on the very first try AND with no hint, solution or teacher help. */
  firstAttemptUnassisted: boolean | null;
  correct: boolean;
  hintsUsed: number;
  solutionShown: boolean;
  /** Any help at all (hint, solution or teacher demonstration) before the first answer. */
  assisted: boolean;
  misconceptions: string[];
}

export interface GuidedStepRecord {
  done: boolean;
  hints: number;
  wrong: number;
}

export type LessonStage = 'understand' | 'worked' | 'guided' | 'independent' | 'reflect';
export const LESSON_STAGES: LessonStage[] = ['understand', 'worked', 'guided', 'independent', 'reflect'];

export interface LessonRecord {
  stepsSeen: string[];
  checks: Record<string, boolean>;
  workedSeen: boolean;
  guided: Record<string, GuidedStepRecord>;
  independent: Record<string, IndependentRecord>;
  reflected: boolean;
  investigated: boolean;
  /** True once a teacher demonstration was used in this lesson. Never grants mastery. */
  teacherDemo: boolean;
  /** Where the student last was, so a refresh resumes there. Navigation only: it is never evidence. */
  lastStage?: LessonStage;
  /** Predictions committed before investigations, by prediction id. Learning evidence, never scored. */
  predictions?: Record<string, { choiceId: string; at: number }>;
  /** Laboratory task evidence, by task id. */
  labTasks?: Record<string, LabTaskRecord>;
  updatedAt: number;
}

export interface LabObservation {
  id: string;
  /** What was measured, as the laboratory names it. */
  label: string;
  /** The measured value as the laboratory formatted it (units included). */
  value: string;
  /** The student's own note, if any. */
  note?: string;
  at: number;
}

export interface LabTaskRecord {
  /** Count of each laboratory event received for this task. */
  events: Record<string, number>;
  viewsSeen: string[];
  observations: LabObservation[];
  /** Ids of goals met (derived from events and views, stored for display and migration). */
  goalsMet: string[];
  /** True if any part was done in teacher demonstration mode. */
  demonstrated: boolean;
  updatedAt: number;
}

export interface AssessmentAnswerRecord {
  correct: boolean;
  marks: number;
  misconception?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  startedAt: number;
  submittedAt: number;
  answers: Record<string, AssessmentAnswerRecord>;
  score: number;
  maxScore: number;
  /** Made in teacher demonstration mode: shown, never counted as the student's result. */
  demonstrated: boolean;
}

/**
 * Progress imported from an older chapter-specific store. Kept for display ("earlier version") and never counted as mastery:
 * the older stores marked lessons complete on a button press and used looser mastery rules.
 */
export interface LegacyLessonImport {
  legacyLessonId: string;
  /** The current lesson that teaches the same idea, from the chapter's explicit mapping table (never by id equality). */
  mappedLessonId?: string;
  completedClaim: boolean;
  /** 'old-rule' = met the older store's evidence rule; 'unverified' = flag saved before evidence existed. */
  masteryClaim: 'none' | 'old-rule' | 'unverified';
  teacherBypassed: boolean;
  /** Per-question first-attempt evidence, as the older store recorded it. */
  practice: Record<string, { attempts: number; correct: boolean; firstAttemptCorrect: boolean; assisted: boolean }>;
  prediction?: { answer: string; correct?: boolean };
  interactions: number;
  observations: number;
}

export interface LegacyChapterImport {
  /** The storage key the data came from (left untouched). */
  sourceKey: string;
  importedAt: number;
  /** A copy of the raw JSON as found, for audit. */
  raw: string;
  lessons: Record<string, LegacyLessonImport>;
  lastVisitedLessonId?: string;
}

export type LearningStatus = 'not_started' | 'in_progress' | 'completed' | 'demonstrated' | 'mastered' | 'needs_review';

export const MASTERY_SHARE = 0.7;
