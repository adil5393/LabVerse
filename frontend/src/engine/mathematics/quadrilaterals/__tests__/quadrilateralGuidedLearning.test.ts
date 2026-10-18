/**
 * Guided Learning Orchestrator Tests for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuadGuidedLearningStore } from '../../../../store/useQuadGuidedLearningStore';
import {
  QUAD_GUIDED_LESSONS,
  QUAD_GUIDED_UNITS,
  ORDERED_QUAD_LESSON_IDS,
} from '../curriculumPath';

describe('Quadrilateral Guided Learning Orchestrator', () => {
  beforeEach(() => {
    useQuadGuidedLearningStore.getState().resetProgress();
  });

  it('contains all 13 core lessons across 7 units', () => {
    expect(ORDERED_QUAD_LESSON_IDS.length).toBe(13);
    expect(QUAD_GUIDED_UNITS.length).toBe(7);

    // Verify each lesson has standard 6 stages and required guidance guides
    ORDERED_QUAD_LESSON_IDS.forEach((id) => {
      const lesson = QUAD_GUIDED_LESSONS[id];
      expect(lesson).toBeDefined();
      expect(lesson.stages).toEqual([
        'understand',
        'predict',
        'experiment',
        'observe',
        'explain',
        'practice',
      ]);
      expect(lesson.concept).toBeDefined();
      expect(lesson.experimentGuide).toBeDefined();
      expect(lesson.observeGuide).toBeDefined();
      expect(lesson.whyGuide).toBeDefined();
      expect(lesson.practiceQuestionIds.length).toBeGreaterThan(0);
    });
  });

  it('allows non-linear lesson jumping without prerequisite locks', () => {
    const store = useQuadGuidedLearningStore.getState();
    expect(store.activeLessonId).toBe('quad-l1');

    // Jump directly to Lesson 10 (Varignon Parallelogram)
    store.selectLesson('quad-l10');
    expect(useQuadGuidedLearningStore.getState().activeLessonId).toBe('quad-l10');
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('understand');

    // Jump to Lesson 6 (Midpoint Theorem) at predict stage
    store.selectLesson('quad-l6', 'predict');
    expect(useQuadGuidedLearningStore.getState().activeLessonId).toBe('quad-l6');
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('predict');
  });

  it('navigates sequentially through the 6 stages', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.selectLesson('quad-l1');

    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('understand');
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('predict');
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('experiment');
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('observe');
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('explain');
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('practice');

    // Cannot advance past last stage
    store.nextStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('practice');

    // Step back
    store.prevStage();
    expect(useQuadGuidedLearningStore.getState().activeStage).toBe('explain');
  });

  it('records student prediction without premature answers', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.selectLesson('quad-l1');

    store.recordPrediction('quad-l1', 'The sum remains exactly 360°.', true);
    const lessonProg = useQuadGuidedLearningStore.getState().lessons['quad-l1'];
    expect(lessonProg?.predictionAnswer).toBe('The sum remains exactly 360°.');
    expect(lessonProg?.predictionCorrect).toBe(true);
  });

  it('tracks interactions and observations', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.selectLesson('quad-l1');

    store.recordInteraction('quad-l1');
    store.recordInteraction('quad-l1');
    expect(useQuadGuidedLearningStore.getState().lessons['quad-l1'].interactionsRecorded).toBe(2);

    store.recordObservation('quad-l1');
    expect(useQuadGuidedLearningStore.getState().lessons['quad-l1'].observationsCaptured).toBe(1);
  });

  it('handles teacher demonstration bypass without falsely granting mastery', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.selectLesson('quad-l2');

    // Complete lesson via teacher demonstration bypass
    store.completeLesson('quad-l2', true);

    const progress = useQuadGuidedLearningStore.getState().lessons['quad-l2'];
    expect(progress?.completed).toBe(true);
    expect(progress?.teacherBypassed).toBe(true);
    // Student mastery is strictly false when bypassed by teacher demonstration!
    expect(useQuadGuidedLearningStore.getState().isLessonMastered('quad-l2')).toBe(false);
  });

  it('computes accurate chapter completion stats', () => {
    const store = useQuadGuidedLearningStore.getState();
    expect(store.getCompletionStats().completedCount).toBe(0);
    expect(store.getCompletionStats().percentage).toBe(0);

    store.completeLesson('quad-l1');
    store.completeLesson('quad-l2');

    const stats = useQuadGuidedLearningStore.getState().getCompletionStats();
    expect(stats.completedCount).toBe(2);
    expect(stats.totalCount).toBe(13);
    expect(stats.percentage).toBe(Math.round((2 / 13) * 100)); // ~15%
    expect(stats.nextRecommendedLessonId).toBe('quad-l3');
  });

  it('records practice answers and grants mastery upon full correct completion', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.selectLesson('quad-l1');

    // 3 questions in Lesson 1 practice
    store.recordPracticeResult('quad-l1', 'quad-q1', true, 3);
    expect(useQuadGuidedLearningStore.getState().lessons['quad-l1'].practiceMastered).toBe(false);

    store.recordPracticeResult('quad-l1', 'quad-q2', true, 3);
    expect(useQuadGuidedLearningStore.getState().lessons['quad-l1'].practiceMastered).toBe(false);

    store.recordPracticeResult('quad-l1', 'quad-q3', true, 3);
    expect(useQuadGuidedLearningStore.getState().lessons['quad-l1'].practiceMastered).toBe(true);
    expect(useQuadGuidedLearningStore.getState().isLessonMastered('quad-l1')).toBe(true);
  });

  it('resets chapter progress completely', () => {
    const store = useQuadGuidedLearningStore.getState();
    store.completeLesson('quad-l1');
    store.completeLesson('quad-l2');
    expect(useQuadGuidedLearningStore.getState().completedLessonIds.length).toBe(2);

    store.resetProgress();
    expect(useQuadGuidedLearningStore.getState().completedLessonIds.length).toBe(0);
    expect(useQuadGuidedLearningStore.getState().activeLessonId).toBe('quad-l1');
  });
});
