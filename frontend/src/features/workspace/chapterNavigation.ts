/**
 * Chapter Navigation & Context Preservation System (LabVerse Workspace V3)
 *
 * Provides persistent, contextual navigation across Learn, Experiment, Analyze,
 * Exercises, Practice, and Blackboard for all Mathematics, Physics, and Chemistry chapters.
 *
 * Guarantees:
 * 1. Single-click return from Exercises/Practice to exact previous laboratory with experiment state.
 * 2. Single-click return from Exercises to previous lesson and stage.
 * 3. Safe internal route validation preventing arbitrary URL injection or redirect loops.
 * 4. Refresh-safe and bookmark-safe canonical fallbacks when entering directly via URL.
 * 5. Isolation of chapter contexts so state does not leak across subjects.
 */

import { create } from 'zustand';

export type SubjectId = 'physics' | 'mathematics' | 'chemistry';

export interface ChapterMeta {
  id: string;
  title: string;
  shortTitle: string;
  subject: SubjectId;
  subjectTitle: string;
  subjectUrl: string;
  chapterUrl: string;
  defaultLabUrl: string;
  defaultLabTitle: string;
  defaultLearnUrl: string;
  defaultExercisesUrl?: string;
  defaultPracticeUrl?: string;
  themeColor: 'amber' | 'cyan' | 'violet' | 'emerald' | 'teal' | 'sky';
  accentHex: string;
}

export const CHAPTER_REGISTRY: Record<string, ChapterMeta> = {
  // --- Physics Chapters ---
  work: {
    id: 'work',
    title: 'Ch. 7 Work, Energy & Machines',
    shortTitle: 'Work & Energy',
    subject: 'physics',
    subjectTitle: 'Physics',
    subjectUrl: '/physics',
    chapterUrl: '/physics/work',
    defaultLabUrl: '/physics/work/lab',
    defaultLabTitle: 'Work Laboratory',
    defaultLearnUrl: '/physics/work',
    defaultExercisesUrl: '/physics/work/exercises',
    defaultPracticeUrl: '/physics/work/practice',
    themeColor: 'amber',
    accentHex: '#F59E0B',
  },
  motion: {
    id: 'motion',
    title: 'Ch. 4 Describing Motion',
    shortTitle: 'Motion',
    subject: 'physics',
    subjectTitle: 'Physics',
    subjectUrl: '/physics',
    chapterUrl: '/physics/motion',
    defaultLabUrl: '/physics/motion/lab',
    defaultLabTitle: 'Motion Laboratory',
    defaultLearnUrl: '/physics/motion',
    defaultExercisesUrl: '/physics/motion/exercises',
    defaultPracticeUrl: '/physics/motion/practice',
    themeColor: 'cyan',
    accentHex: '#06B6D4',
  },
  forces: {
    id: 'forces',
    title: 'Ch. 6 How Forces Affect Motion',
    shortTitle: 'Forces',
    subject: 'physics',
    subjectTitle: 'Physics',
    subjectUrl: '/physics',
    chapterUrl: '/physics/forces',
    defaultLabUrl: '/physics/forces/lab',
    defaultLabTitle: 'Forces Laboratory',
    defaultLearnUrl: '/physics/forces',
    defaultExercisesUrl: '/physics/forces/exercises',
    defaultPracticeUrl: '/physics/forces/practice',
    themeColor: 'violet',
    accentHex: '#8B5CF6',
  },
  sound: {
    id: 'sound',
    title: 'Ch. 10 Sound Waves',
    shortTitle: 'Sound',
    subject: 'physics',
    subjectTitle: 'Physics',
    subjectUrl: '/physics',
    chapterUrl: '/physics/sound',
    defaultLabUrl: '/physics/sound/vibration',
    defaultLabTitle: 'Vibration Laboratory',
    defaultLearnUrl: '/physics/sound',
    defaultExercisesUrl: '/physics/sound/exercises',
    themeColor: 'teal',
    accentHex: '#14B8A6',
  },
  electricity: {
    id: 'electricity',
    title: 'Electricity & Circuits',
    shortTitle: 'Electricity',
    subject: 'physics',
    subjectTitle: 'Physics',
    subjectUrl: '/physics',
    chapterUrl: '/physics/electricity',
    defaultLabUrl: '/physics/electricity/workbench',
    defaultLabTitle: 'Circuit Workbench',
    defaultLearnUrl: '/physics/electricity',
    defaultExercisesUrl: '/physics/electricity',
    defaultPracticeUrl: '/physics/electricity',
    themeColor: 'amber',
    accentHex: '#F59E0B',
  },

  // --- Mathematics Chapters ---
  'coordinate-geometry': {
    id: 'coordinate-geometry',
    title: 'Coordinate Geometry',
    shortTitle: 'Coordinates',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/coordinate-geometry',
    defaultLabUrl: '/mathematics/workbench',
    defaultLabTitle: 'Coordinate Workbench',
    defaultLearnUrl: '/mathematics/coordinate-geometry',
    defaultExercisesUrl: '/mathematics/coordinate-geometry/practice',
    defaultPracticeUrl: '/mathematics/coordinate-geometry/practice',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },
  circles: {
    id: 'circles',
    title: 'Circles & Theorems',
    shortTitle: 'Circles',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/circles',
    defaultLabUrl: '/mathematics/circles/workbench',
    defaultLabTitle: 'Circles Workbench',
    defaultLearnUrl: '/mathematics/circles',
    defaultExercisesUrl: '/mathematics/circles',
    defaultPracticeUrl: '/mathematics/circles',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },
  quadrilaterals: {
    id: 'quadrilaterals',
    title: 'Quadrilaterals',
    shortTitle: 'Quadrilaterals',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/quadrilaterals',
    defaultLabUrl: '/mathematics/quadrilaterals/workbench',
    defaultLabTitle: 'Quadrilaterals Workbench',
    defaultLearnUrl: '/mathematics/quadrilaterals',
    defaultExercisesUrl: '/mathematics/quadrilaterals',
    defaultPracticeUrl: '/mathematics/quadrilaterals',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },
  'two-variables': {
    id: 'two-variables',
    title: 'Linear Equations in Two Variables',
    shortTitle: 'Two Variables',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/two-variables',
    defaultLabUrl: '/mathematics/two-variables/workbench',
    defaultLabTitle: 'Two Variables Workbench',
    defaultLearnUrl: '/mathematics/two-variables',
    defaultExercisesUrl: '/mathematics/two-variables',
    defaultPracticeUrl: '/mathematics/two-variables',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },
  'understanding-data': {
    id: 'understanding-data',
    title: 'Understanding Data & Statistics',
    shortTitle: 'Data & Stats',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/understanding-data',
    defaultLabUrl: '/mathematics/understanding-data/workbench',
    defaultLabTitle: 'Data Workbench',
    defaultLearnUrl: '/mathematics/understanding-data',
    defaultExercisesUrl: '/mathematics/understanding-data',
    defaultPracticeUrl: '/mathematics/understanding-data',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },
  propositions: {
    id: 'propositions',
    title: 'Propositions & Converses',
    shortTitle: 'Propositions',
    subject: 'mathematics',
    subjectTitle: 'Mathematics',
    subjectUrl: '/mathematics',
    chapterUrl: '/mathematics/propositions',
    defaultLabUrl: '/mathematics/propositions/workbench',
    defaultLabTitle: 'Propositions Workbench',
    defaultLearnUrl: '/mathematics/propositions',
    defaultExercisesUrl: '/mathematics/propositions',
    defaultPracticeUrl: '/mathematics/propositions',
    themeColor: 'emerald',
    accentHex: '#10B981',
  },

  // --- Chemistry Chapters ---
  'states-of-matter': {
    id: 'states-of-matter',
    title: 'Matter in Our Surroundings',
    shortTitle: 'States of Matter',
    subject: 'chemistry',
    subjectTitle: 'Chemistry',
    subjectUrl: '/chemistry',
    chapterUrl: '/chemistry',
    defaultLabUrl: '/chemistry/states-of-matter',
    defaultLabTitle: 'States of Matter Workbench',
    defaultLearnUrl: '/chemistry',
    defaultExercisesUrl: '/chemistry',
    defaultPracticeUrl: '/chemistry',
    themeColor: 'teal',
    accentHex: '#14B8A6',
  },
};

export interface ChapterActiveContext {
  lastLabUrl: string;
  lastLabTitle: string;
  lastLessonUrl?: string;
  lastLessonStage?: number;
  lastSetup?: unknown;
  lastTimestamp: number;
}

const STORAGE_KEY = 'labverse_chapter_nav_v3';

function validateInternalRoute(url: string | undefined, defaultFallback: string): string {
  if (!url || typeof url !== 'string') return defaultFallback;
  const clean = url.trim();
  // Must start with a known root prefix and no external protocols (http, javascript:, //)
  if (
    clean.startsWith('/physics') ||
    clean.startsWith('/mathematics') ||
    clean.startsWith('/chemistry')
  ) {
    return clean;
  }
  return defaultFallback;
}

function loadPersistedContexts(): Record<string, ChapterActiveContext> {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return {};
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return parsed as Record<string, ChapterActiveContext>;
  } catch {
    return {};
  }
}

function savePersistedContexts(contexts: Record<string, ChapterActiveContext>) {
  try {
    if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contexts));
  } catch {
    // Ignore storage quota errors
  }
}

interface ChapterNavigationStore {
  contexts: Record<string, ChapterActiveContext>;
  setLabContext: (
    chapterId: string,
    info: { labUrl: string; labTitle?: string; setup?: unknown }
  ) => void;
  setLessonContext: (
    chapterId: string,
    info: { lessonUrl: string; stage?: number }
  ) => void;
  getLabDestination: (chapterId: string) => { url: string; title: string; isResumed: boolean };
  getLessonDestination: (chapterId: string) => { url: string; stage?: number };
  getLabSetup: <T = unknown>(chapterId: string) => T | undefined;
}

export const useChapterNavigationStore = create<ChapterNavigationStore>((set, get) => ({
  contexts: loadPersistedContexts(),

  setLabContext: (chapterId, info) => {
    const meta = CHAPTER_REGISTRY[chapterId];
    const defaultUrl = meta?.defaultLabUrl || '/';
    const validUrl = validateInternalRoute(info.labUrl, defaultUrl);
    const labTitle = info.labTitle || meta?.defaultLabTitle || 'Laboratory';

    set((state) => {
      const prev = state.contexts[chapterId];
      const updated: ChapterActiveContext = {
        ...prev,
        lastLabUrl: validUrl,
        lastLabTitle: labTitle,
        lastSetup: info.setup !== undefined ? info.setup : prev?.lastSetup,
        lastTimestamp: Date.now(),
      };
      const nextContexts = { ...state.contexts, [chapterId]: updated };
      savePersistedContexts(nextContexts);
      return { contexts: nextContexts };
    });
  },

  setLessonContext: (chapterId, info) => {
    const meta = CHAPTER_REGISTRY[chapterId];
    const defaultUrl = meta?.defaultLearnUrl || meta?.chapterUrl || '/';
    const validUrl = validateInternalRoute(info.lessonUrl, defaultUrl);

    set((state) => {
      const prev = state.contexts[chapterId];
      const updated: ChapterActiveContext = {
        ...prev,
        lastLabUrl: prev?.lastLabUrl || meta?.defaultLabUrl || '/',
        lastLabTitle: prev?.lastLabTitle || meta?.defaultLabTitle || 'Laboratory',
        lastLessonUrl: validUrl,
        lastLessonStage: info.stage,
        lastTimestamp: Date.now(),
      };
      const nextContexts = { ...state.contexts, [chapterId]: updated };
      savePersistedContexts(nextContexts);
      return { contexts: nextContexts };
    });
  },

  getLabDestination: (chapterId) => {
    const meta = CHAPTER_REGISTRY[chapterId];
    const ctx = get().contexts[chapterId];
    if (ctx && ctx.lastLabUrl) {
      return {
        url: validateInternalRoute(ctx.lastLabUrl, meta?.defaultLabUrl || '/'),
        title: ctx.lastLabTitle || meta?.defaultLabTitle || 'Laboratory',
        isResumed: true,
      };
    }
    return {
      url: meta?.defaultLabUrl || '/',
      title: meta?.defaultLabTitle || 'Laboratory',
      isResumed: false,
    };
  },

  getLessonDestination: (chapterId) => {
    const meta = CHAPTER_REGISTRY[chapterId];
    const ctx = get().contexts[chapterId];
    if (ctx && ctx.lastLessonUrl) {
      return {
        url: validateInternalRoute(ctx.lastLessonUrl, meta?.defaultLearnUrl || meta?.chapterUrl || '/'),
        stage: ctx.lastLessonStage,
      };
    }
    return {
      url: meta?.defaultLearnUrl || meta?.chapterUrl || '/',
      stage: undefined,
    };
  },

  getLabSetup: <T = unknown>(chapterId: string): T | undefined => {
    const ctx = get().contexts[chapterId];
    return ctx?.lastSetup as T | undefined;
  },
}));

/**
 * Convenient React hook to bind a view to its contextual chapter navigation.
 */
export function useChapterNavigation(chapterId: string) {
  const meta = CHAPTER_REGISTRY[chapterId];
  const setLabContext = useChapterNavigationStore((s) => s.setLabContext);
  const setLessonContext = useChapterNavigationStore((s) => s.setLessonContext);
  const getLabDestination = useChapterNavigationStore((s) => s.getLabDestination);
  const getLessonDestination = useChapterNavigationStore((s) => s.getLessonDestination);
  const getLabSetup = useChapterNavigationStore((s) => s.getLabSetup);

  const labDest = getLabDestination(chapterId);
  const lessonDest = getLessonDestination(chapterId);

  return {
    meta,
    labDestination: labDest,
    lessonDestination: lessonDest,
    registerLab: (labUrl: string, labTitle?: string, setup?: unknown) =>
      setLabContext(chapterId, { labUrl, labTitle, setup }),
    registerLesson: (lessonUrl: string, stage?: number) =>
      setLessonContext(chapterId, { lessonUrl, stage }),
    getLabSetup: <T = unknown>() => getLabSetup<T>(chapterId),
  };
}
