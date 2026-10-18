/**
 * State Store & Interaction Tests for Class 9 Quadrilaterals (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useQuadrilateralStore } from '../../../../store/useQuadrilateralStore';

describe('useQuadrilateralStore State Store', () => {
  beforeEach(() => {
    useQuadrilateralStore.getState().setExperiment('what-is-a-quadrilateral');
    useQuadrilateralStore.getState().setMode('explore');
  });

  it('initializes with what-is-a-quadrilateral experiment', () => {
    const state = useQuadrilateralStore.getState();
    expect(state.currentExperimentId).toBe('what-is-a-quadrilateral');
    expect(Object.keys(state.points).length).toBe(4);
    expect(Object.keys(state.quadrilaterals).length).toBe(1);
    expect(state.mode).toBe('explore');
  });

  it('adds a point and updates history', () => {
    const store = useQuadrilateralStore.getState();
    const initHistoryLen = store.history.length;
    const ptId = store.addPoint({ x: 2, y: 3 }, 'P_New');

    const updated = useQuadrilateralStore.getState();
    expect(updated.points[ptId]).toBeDefined();
    expect(updated.points[ptId].name).toBe('P_New');
    expect(updated.history.length).toBeGreaterThan(initHistoryLen);
  });

  it('adds a segment between two points', () => {
    const store = useQuadrilateralStore.getState();
    const p1 = store.addPoint({ x: 0, y: 0 }, 'A1');
    const p2 = store.addPoint({ x: 4, y: 4 }, 'B1');
    const segId = store.addSegment(p1, p2);

    const updated = useQuadrilateralStore.getState();
    expect(updated.segments[segId]).toBeDefined();
    expect(updated.segments[segId].pointAId).toBe(p1);
    expect(updated.segments[segId].pointBId).toBe(p2);
  });

  it('moves a point and triggers constraint solver', () => {
    const store = useQuadrilateralStore.getState();
    store.setExperiment('parallelogram-properties');

    // Move vertex C
    store.movePoint('pC', { x: 5, y: 3 });
    const updated = useQuadrilateralStore.getState();
    expect(updated.points['pC'].x).toBe(5);
    expect(updated.points['pC'].y).toBe(3);
    // Since parallelogram constraint is active: D = A + (C - B)
    // pA is (-4, -2), pB is (2, -2). C is (5, 3)
    // D should be (-4 + (5 - 2), -2 + (3 - -2)) = (-1, 3)
    expect(updated.points['pD'].x).toBeCloseTo(-1, 2);
    expect(updated.points['pD'].y).toBeCloseTo(3, 2);
  });

  it('supports atomic undo and redo operations', () => {
    const store = useQuadrilateralStore.getState();
    const initialPointsCount = Object.keys(store.points).length;

    const newPtId = store.addPoint({ x: 10, y: 10 }, 'UndoPt');
    expect(Object.keys(useQuadrilateralStore.getState().points).length).toBe(initialPointsCount + 1);
    expect(useQuadrilateralStore.getState().canUndo()).toBe(true);

    useQuadrilateralStore.getState().undo();
    expect(useQuadrilateralStore.getState().points[newPtId]).toBeUndefined();
    expect(useQuadrilateralStore.getState().canRedo()).toBe(true);

    useQuadrilateralStore.getState().redo();
    expect(useQuadrilateralStore.getState().points[newPtId]).toBeDefined();
  });

  it('deletes an object and cascades to attached segments', () => {
    const store = useQuadrilateralStore.getState();
    const pA = store.addPoint({ x: -2, y: 0 }, 'DelA');
    const pB = store.addPoint({ x: 2, y: 0 }, 'DelB');
    const seg = store.addSegment(pA, pB);

    expect(useQuadrilateralStore.getState().segments[seg]).toBeDefined();

    // Delete point pA
    useQuadrilateralStore.getState().deleteObject(pA, 'point');

    const updated = useQuadrilateralStore.getState();
    expect(updated.points[pA]).toBeUndefined();
    expect(updated.segments[seg]).toBeUndefined(); // Cascade deleted!
  });

  it('captures live observation data', () => {
    const store = useQuadrilateralStore.getState();
    expect(store.capturedObservations.length).toBe(0);

    store.captureCurrentObservation();
    expect(useQuadrilateralStore.getState().capturedObservations.length).toBe(1);
    expect(useQuadrilateralStore.getState().capturedObservations[0].isConsistent).toBe(true);

    store.clearObservations();
    expect(useQuadrilateralStore.getState().capturedObservations.length).toBe(0);
  });

  it('switches between explore and practice modes seamlessly', () => {
    const store = useQuadrilateralStore.getState();
    store.setMode('practice');
    expect(useQuadrilateralStore.getState().mode).toBe('practice');
    expect(useQuadrilateralStore.getState().exploreSceneSnapshot).not.toBeNull();

    store.setMode('explore');
    expect(useQuadrilateralStore.getState().mode).toBe('explore');
    expect(useQuadrilateralStore.getState().exploreSceneSnapshot).toBeNull();
  });

  it('handles practice questions with scoring and hint revelations', () => {
    const store = useQuadrilateralStore.getState();
    store.setMode('practice');
    store.loadPracticeQuestion('quad-q1');

    store.revealPracticeHint('quad-q1');
    expect(useQuadrilateralStore.getState().practiceAnswers['quad-q1']?.hintsRevealed).toBe(1);

    store.submitPracticeAnswer('quad-q1', '85', true);
    expect(useQuadrilateralStore.getState().practiceAnswers['quad-q1']?.isCorrect).toBe(true);

    store.togglePracticeSolution('quad-q1');
    expect(useQuadrilateralStore.getState().practiceAnswers['quad-q1']?.showSolution).toBe(true);
  });

  it('toggles planar tiling configuration', () => {
    const store = useQuadrilateralStore.getState();
    expect(store.tiling).toBeNull();

    store.toggleTiling();
    expect(useQuadrilateralStore.getState().tiling?.enabled).toBe(true);

    store.toggleTiling();
    expect(useQuadrilateralStore.getState().tiling?.enabled).toBe(false);
  });
});
