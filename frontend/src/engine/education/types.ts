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

export type Question = ChoiceQuestion | NumericQuestion | VisualQuestion;

export type AnswerInput = { kind: 'choice' | 'visual'; id: string } | { kind: 'numeric'; text: string };

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
}

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
  updatedAt: number;
}

export type LearningStatus = 'not_started' | 'in_progress' | 'completed' | 'demonstrated' | 'mastered' | 'needs_review';

export const MASTERY_SHARE = 0.7;
