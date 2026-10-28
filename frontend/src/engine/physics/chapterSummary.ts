/**
 * One derived summary per Physics chapter, built from each chapter's own data (curriculum map, lessons, exercises, practice),
 * so the Physics hub can never say "upcoming" about content that exists, or the reverse. The hub reads these numbers; it holds
 * no availability text of its own.
 */

import { MOTION_CHAPTER } from './motion/learn/content';
import { FORCES_CHAPTER } from './forces/learn/content';
import { WORK_CHAPTER } from './work/learn/content';
import { motionCoverageCounts } from './motion/curriculum';
import { forcesCoverageCounts } from './forces/curriculum';
import { workCoverageCounts } from './work/curriculum';
import { MOTION_EXERCISES, solvedExerciseNumbers } from './motion/exercises';
import { FORCE_EXERCISES, solvedForceExerciseNumbers } from './forces/exercises';
import { WORK_EXERCISES, exerciseSolved } from './work/exercises';
import { PRACTICE_ITEMS } from './motion/practice';
import { SOUND_CHAPTER } from './sound/learn/content';
import { soundCoverageCounts, SOUND_SYLLABUS } from './sound/curriculum';
import { soundExerciseCounts } from './sound/exercises';
import { FORCE_PRACTICE_ITEMS } from './forces/practice';
import { WORK_PRACTICE_ITEMS } from './work/practice';

export interface PhysicsChapterSummary {
  id: 'motion' | 'forces' | 'work' | 'sound';
  lessons: number;
  exercisesSolved: number;
  exercisesTotal: number;
  practiceQuestions: number;
  mapAvailable: number;
  mapPlanned: number;
  /** One factual sentence for the hub card. */
  line: string;
}

const make = (id: PhysicsChapterSummary['id'], lessons: number, exercisesSolved: number, exercisesTotal: number, practiceQuestions: number, counts: { available: number; planned: number }): PhysicsChapterSummary => ({
  id, lessons, exercisesSolved, exercisesTotal, practiceQuestions, mapAvailable: counts.available, mapPlanned: counts.planned,
  line: `${lessons} lessons, ${exercisesSolved} of ${exercisesTotal} NCERT exercises solved, ${practiceQuestions} practice questions, a chapter assessment${counts.planned ? `; ${counts.planned} chapter item${counts.planned === 1 ? '' : 's'} still upcoming` : ''}.`,
});

/** Sound is only partly built, so its line says how many of the twelve planned lessons exist and never claims more. */
const soundSummary = (): PhysicsChapterSummary => {
  const counts = soundCoverageCounts();
  const ex = soundExerciseCounts();
  const lessons = Object.keys(SOUND_CHAPTER.lessons).length;
  const planned = SOUND_SYLLABUS.length;
  const practiceCount = SOUND_CHAPTER.practice?.groups.reduce((n, g) => n + g.items.length, 0) ?? 0;
  return {
    id: 'sound', lessons, exercisesSolved: ex.exercisesSolved, exercisesTotal: ex.exercises, practiceQuestions: practiceCount, mapAvailable: counts.available, mapPlanned: counts.planned,
    line: lessons < planned
      ? `${lessons} of ${planned} lessons open; ${ex.exercisesSolved} of ${ex.exercises} NCERT exercises solved; ${planned - lessons} lessons upcoming.`
      : `${lessons} lessons, 3 laboratories, ${ex.exercisesSolved} of ${ex.exercises} NCERT exercises solved, ${practiceCount} practice questions and a chapter assessment.`,
  };
};

export const physicsChapterSummaries = (): PhysicsChapterSummary[] => [
  make('motion', Object.keys(MOTION_CHAPTER.lessons).length, solvedExerciseNumbers().length, MOTION_EXERCISES.length, PRACTICE_ITEMS.length, motionCoverageCounts()),
  make('forces', Object.keys(FORCES_CHAPTER.lessons).length, solvedForceExerciseNumbers().length, FORCE_EXERCISES.length, FORCE_PRACTICE_ITEMS.length, forcesCoverageCounts()),
  make('work', Object.keys(WORK_CHAPTER.lessons).length, WORK_EXERCISES.filter(exerciseSolved).length, WORK_EXERCISES.length, WORK_PRACTICE_ITEMS.length, workCoverageCounts()),
  soundSummary(),
];
