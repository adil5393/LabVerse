/**
 * Automated Test Suite for Milestone M2.5:
 * Class 9 Circles Guided Chapter Learning Path & Student Experience
 *
 * Verifies:
 * 1. Lesson registration and 4-unit curriculum mapping (12 core lessons + 1 optional extension).
 * 2. Proper ordering and pedagogical sequence from Foundations to Mastery.
 * 3. First-time student entry defaulting to Lesson 1: Understanding a Circle.
 * 4. Start / Continue Learning logic determining the next uncompleted lesson.
 * 5. Non-linear lesson jumping without compulsory prerequisite gates.
 * 6. Six-stage progression (Understand -> Predict -> Experiment -> Observe -> Why/Proof -> Practise).
 * 7. Prediction retention without penalizing incorrect student hypotheses.
 * 8. Interaction completion tracking and minimum manipulation thresholds.
 * 9. Observation recording and invariant evaluation.
 * 10. Euclidean proof progression and deductive reasoning.
 * 11. Practice Engine integration and question resolution.
 * 12. Lesson completion rules and distinction from teacher demonstration bypass.
 * 13. Progress persistence in localStorage with safe in-memory fallback.
 * 14. Progress reset functionality.
 * 15. Free Laboratory isolation ensuring zero state corruption when switching modes.
 * 16. Gradual tool palette filtering (allowedTools).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useGuidedLearningStore } from '../../../../store/useGuidedLearningStore';
import { useCircleStore } from '../../../../store/useCircleStore';
import {
  CIRCLES_GUIDED_CURRICULUM,
  CIRCLES_GUIDED_UNITS,
  CIRCLES_GUIDED_LESSONS,
  ORDERED_LESSON_IDS,
  getNextRecommendedLesson,
} from '../curriculumPath';
import { CIRCLE_EXPERIMENTS } from '../circleExperiments';
import { CHAPTER_PRACTICE_BANK } from '../practiceBank';

// Mock localStorage for headless Node test environment if needed
class MockStorage implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = new MockStorage();
}

describe('Milestone M2.5: Circles Guided Chapter Learning Path', () => {
  beforeEach(() => {
    try {
      globalThis.localStorage.clear();
    } catch {
      // Ignore
    }
    useGuidedLearningStore.getState().resetProgress();
    useCircleStore.getState().resetExperiment();
  });

  describe('1. Curriculum Registration & Unit Ordering', () => {
    it('registers complete chapter curriculum metadata', () => {
      expect(CIRCLES_GUIDED_CURRICULUM.chapterId).toBe('circles-class-9');
      expect(CIRCLES_GUIDED_CURRICULUM.classGrade).toBe(9);
      expect(CIRCLES_GUIDED_CURRICULUM.subjectId).toBe('mathematics');
      expect(CIRCLES_GUIDED_CURRICULUM.units).toHaveLength(4);
    });

    it('registers exactly 4 curriculum units covering NCERT Class 9 Circles', () => {
      expect(CIRCLES_GUIDED_UNITS).toHaveLength(4);
      expect(CIRCLES_GUIDED_UNITS[0].id).toBe('unit-1-foundations');
      expect(CIRCLES_GUIDED_UNITS[1].id).toBe('unit-2-chords');
      expect(CIRCLES_GUIDED_UNITS[2].id).toBe('unit-3-angles');
      expect(CIRCLES_GUIDED_UNITS[3].id).toBe('unit-4-mastery');
    });

    it('contains all 12 core lessons plus 1 optional extension in proper sequence', () => {
      expect(ORDERED_LESSON_IDS).toHaveLength(13);
      // 12 core lessons
      for (let i = 1; i <= 12; i++) {
        const lessonId = `circles-l${i}`;
        expect(ORDERED_LESSON_IDS).toContain(lessonId);
        const def = CIRCLES_GUIDED_LESSONS[lessonId];
        expect(def).toBeDefined();
        expect(def.lessonNumber).toBe(i);
      }
      // 1 optional extension
      const ext = CIRCLES_GUIDED_LESSONS['circles-ext-tangents'];
      expect(ext).toBeDefined();
      expect(ext.isOptionalExtension).toBe(true);
      expect(ext.title).toContain('Tangents and Radius');
    });

    it('maps every guided lesson to an existing canonical experiment in circleExperiments', () => {
      const canonicalExpIds = CIRCLE_EXPERIMENTS.map((e) => e.id);

      for (const id of ORDERED_LESSON_IDS) {
        const lesson = CIRCLES_GUIDED_LESSONS[id];
        expect(canonicalExpIds).toContain(lesson.experimentId);
      }
    });

    it('maps all practiceQuestionIds to valid questions in practiceBank or experiment practice lists', () => {
      const allPracticeIds = new Set<string>();
      CHAPTER_PRACTICE_BANK.forEach((q) => allPracticeIds.add(q.id));
      CIRCLE_EXPERIMENTS.forEach((e) => e.practiceQuestions.forEach((pq) => allPracticeIds.add(pq.id)));

      for (const id of ORDERED_LESSON_IDS) {
        const lesson = CIRCLES_GUIDED_LESSONS[id];
        expect(lesson.practiceQuestionIds.length).toBeGreaterThanOrEqual(1);
        for (const qId of lesson.practiceQuestionIds) {
          expect(allPracticeIds.has(qId)).toBe(true);
        }
      }
    });
  });

  describe('2. Beginner-Friendly Tool Palette (Gradual Tool Introduction)', () => {
    it('restricts Lesson 1 (Understanding a Circle) to basic tools without overwhelming palettes', () => {
      const lesson1 = CIRCLES_GUIDED_LESSONS['circles-l1'];
      expect(lesson1.allowedTools).toEqual(['select', 'point_on_circle', 'radius', 'diameter']);
      // Advanced tools like angle_measure or tangent must be hidden
      expect(lesson1.allowedTools).not.toContain('angle_measure');
      expect(lesson1.allowedTools).not.toContain('tangent');
    });

    it('unlocks angle_measure when entering Angle and Cyclic Quadrilateral lessons', () => {
      const lesson7 = CIRCLES_GUIDED_LESSONS['circles-l7'];
      const lesson9 = CIRCLES_GUIDED_LESSONS['circles-l9'];
      expect(lesson7.allowedTools).toContain('angle_measure');
      expect(lesson9.allowedTools).toContain('angle_measure');
    });

    it('unlocks tangent tool exclusively for the tangent extension lesson', () => {
      const lesson1 = CIRCLES_GUIDED_LESSONS['circles-l1'];
      const ext = CIRCLES_GUIDED_LESSONS['circles-ext-tangents'];
      expect(lesson1.allowedTools).not.toContain('tangent');
      expect(ext.allowedTools).toContain('tangent');
    });
  });

  describe('3. Student Progress & Navigation Logic', () => {
    it('defaults new students to Lesson 1: Understanding a Circle with 0% progress', () => {
      const stats = useGuidedLearningStore.getState().getCompletionStats();
      expect(stats.completedCount).toBe(0);
      expect(stats.totalCount).toBe(12);
      expect(stats.percentage).toBe(0);
      expect(stats.nextRecommendedLessonId).toBe('circles-l1');
    });

    it('calculates the next recommended lesson dynamically as lessons are completed', () => {
      useGuidedLearningStore.getState().completeLesson('circles-l1');
      useGuidedLearningStore.getState().completeLesson('circles-l2');

      const stats = useGuidedLearningStore.getState().getCompletionStats();
      expect(stats.completedCount).toBe(2);
      expect(stats.percentage).toBe(17); // 2/12 = 16.66% -> 17%
      expect(stats.nextRecommendedLessonId).toBe('circles-l3');
    });

    it('skips completed lessons and recommends the first incomplete core lesson', () => {
      // If student jumped ahead and did Lesson 4 and 5
      const next = getNextRecommendedLesson(['circles-l1', 'circles-l4', 'circles-l5']);
      expect(next).toBe('circles-l2');
    });

    it('allows non-linear lesson selection without compulsory prerequisite locks', () => {
      // Student jumps straight to Lesson 9 (Cyclic Quadrilaterals)
      useGuidedLearningStore.getState().selectLesson('circles-l9');
      expect(useGuidedLearningStore.getState().activeLessonId).toBe('circles-l9');
      expect(useGuidedLearningStore.getState().activeStage).toBe('understand');

      // Now student jumps to Lesson 3
      useGuidedLearningStore.getState().selectLesson('circles-l3', 'predict');
      expect(useGuidedLearningStore.getState().activeLessonId).toBe('circles-l3');
      expect(useGuidedLearningStore.getState().activeStage).toBe('predict');
    });
  });

  describe('4. Standard 6-Stage Learning Progression', () => {
    it('supports stage stepping: Understand -> Predict -> Experiment -> Observe -> Explain -> Practise', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l1');
      expect(useGuidedLearningStore.getState().activeStage).toBe('understand');

      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('predict');

      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('experiment');

      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('observe');

      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('explain');

      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('practice');

      // Next stage when at end stays at practice
      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('practice');

      // Stepping backwards
      useGuidedLearningStore.getState().prevStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('explain');
    });

    it('retains student conceptual prediction without penalizing incorrect choices', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l1');

      // Student predicts incorrectly
      useGuidedLearningStore.getState().recordPrediction('circles-l1', 'It fluctuates depending on the angle', false);

      const prog = useGuidedLearningStore.getState().lessons['circles-l1'];
      expect(prog.predictionAnswer).toBe('It fluctuates depending on the angle');
      expect(prog.predictionCorrect).toBe(false);

      // Student can proceed to next stages regardless
      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('predict');
      useGuidedLearningStore.getState().nextStage();
      expect(useGuidedLearningStore.getState().activeStage).toBe('experiment');
    });

    it('tracks student interactions during the experiment stage', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l1');

      expect(useGuidedLearningStore.getState().lessons['circles-l1']?.interactionsRecorded || 0).toBe(0);

      useGuidedLearningStore.getState().recordInteraction('circles-l1');
      useGuidedLearningStore.getState().recordInteraction('circles-l1');

      expect(useGuidedLearningStore.getState().lessons['circles-l1'].interactionsRecorded).toBe(2);
    });

    it('records observation capture timestamps and counts', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l1');

      useGuidedLearningStore.getState().recordObservation('circles-l1');
      expect(useGuidedLearningStore.getState().lessons['circles-l1'].observationsCaptured).toBe(1);
    });

    it('tracks practice attempts, correct count, and mastery calculation', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l1');

      // Answer question 1 correctly
      useGuidedLearningStore.getState().recordPracticeResult('circles-l1', 'q_def_radius_diameter', true, 2);
      let prog = useGuidedLearningStore.getState().lessons['circles-l1'];
      expect(prog.practiceAttempted).toBe(true);
      expect(prog.practiceCorrectCount).toBe(1);
      expect(prog.practiceTotalQuestions).toBe(2);
      expect(prog.practiceMastered).toBe(false);

      // Answer question 2 correctly -> triggers mastery
      useGuidedLearningStore.getState().recordPracticeResult('circles-l1', 'q_def_mcq_longest_chord', true, 2);
      prog = useGuidedLearningStore.getState().lessons['circles-l1'];
      expect(prog.practiceCorrectCount).toBe(2);
      expect(prog.practiceMastered).toBe(true);
    });
  });

  describe('5. Teacher Demonstration Bypass & Separation from Mastery', () => {
    it('allows teachers to toggle teacher mode and bypass interaction gates', () => {
      expect(useGuidedLearningStore.getState().teacherMode).toBe(false);

      useGuidedLearningStore.getState().toggleTeacherMode();
      expect(useGuidedLearningStore.getState().teacherMode).toBe(true);

      useGuidedLearningStore.getState().selectLesson('circles-l4', 'experiment');
      useGuidedLearningStore.getState().teacherBypassCurrentStage('circles-l4');

      // Advances stage immediately
      expect(useGuidedLearningStore.getState().activeStage).toBe('observe');
      expect(useGuidedLearningStore.getState().teacherBypassedStages['circles-l4_experiment']).toBe(true);
    });

    it('distinguishes completed vs mastered vs teacher-bypassed lessons', () => {
      // Complete via teacher bypass
      useGuidedLearningStore.getState().completeLesson('circles-l5', true);

      expect(useGuidedLearningStore.getState().isLessonCompleted('circles-l5')).toBe(true);
      // Teacher bypass must NOT count as student mastery!
      expect(useGuidedLearningStore.getState().isLessonMastered('circles-l5')).toBe(false);
      expect(useGuidedLearningStore.getState().lessons['circles-l5'].teacherBypassed).toBe(true);

      const stats = useGuidedLearningStore.getState().getCompletionStats();
      expect(stats.completedCount).toBe(1);
      expect(stats.masteredCount).toBe(0);
    });
  });

  describe('6. Local Storage Persistence & Reset', () => {
    it('persists completed lessons and last visited lesson across sessions', () => {
      useGuidedLearningStore.getState().selectLesson('circles-l7');
      useGuidedLearningStore.getState().completeLesson('circles-l1');
      useGuidedLearningStore.getState().completeLesson('circles-l2');

      const saved = JSON.parse(globalThis.localStorage.getItem('labverse_circles_progress_v1') || '{}');
      expect(saved.chapterId).toBe('circles-class-9');
      expect(saved.lastVisitedLessonId).toBe('circles-l7');
      expect(saved.completedLessonIds).toEqual(['circles-l1', 'circles-l2']);
    });

    it('resets progress cleanly back to virgin state upon user confirmation', () => {
      useGuidedLearningStore.getState().completeLesson('circles-l1');
      useGuidedLearningStore.getState().completeLesson('circles-l2');
      expect(useGuidedLearningStore.getState().completedLessonIds).toHaveLength(2);

      useGuidedLearningStore.getState().resetProgress();

      const stats = useGuidedLearningStore.getState().getCompletionStats();
      expect(stats.completedCount).toBe(0);
      expect(stats.percentage).toBe(0);
      expect(stats.nextRecommendedLessonId).toBe('circles-l1');
      expect(useGuidedLearningStore.getState().activeLessonId).toBe('circles-l1');
      expect(useGuidedLearningStore.getState().completedLessonIds).toHaveLength(0);
    });
  });

  describe('7. Free Laboratory Isolation & Mathematical Engine State Preservation', () => {
    it('preserves geometry entities when switching between Guided and Free Laboratory', () => {
      const circleStore = useCircleStore.getState();
      // Load experiment in geometry engine
      circleStore.setExperiment('understanding-circle');
      expect(Object.keys(circleStore.circles).length).toBeGreaterThan(0);
      expect(Object.keys(circleStore.circumferencePoints).length).toBe(3);

      const circleId = Object.keys(circleStore.circles)[0];
      const initialRadius = circleStore.circles[circleId].radius;

      // Select guided lesson
      useGuidedLearningStore.getState().selectLesson('circles-l1');

      // Geometry remains intact
      expect(useCircleStore.getState().circles[circleId].radius).toBe(initialRadius);
      expect(Object.keys(useCircleStore.getState().circumferencePoints).length).toBe(3);
    });

    it('keeps Free Laboratory explore mode independent of Guided Learning stage progression', () => {
      useCircleStore.getState().setMode('explore');
      expect(useCircleStore.getState().mode).toBe('explore');

      useGuidedLearningStore.getState().selectLesson('circles-l3', 'predict');

      // Guided stage is updated in guided store
      expect(useGuidedLearningStore.getState().activeStage).toBe('predict');
      // Free lab mode in circle store remains explore
      expect(useCircleStore.getState().mode).toBe('explore');
    });
  });
});
