import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import type { MathPoint, MathSegment } from '../types';

describe('useMathStore State & Interaction Architecture', () => {
  beforeEach(() => {
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  it('initializes with reference experiment Distance Between Two Points A(2,3) and B(7,6)', () => {
    const state = useMathStore.getState();
    const ptA = state.objects['pt_A'] as MathPoint;
    const ptB = state.objects['pt_B'] as MathPoint;
    const seg = state.objects['seg_AB'] as MathSegment;

    expect(ptA).toBeDefined();
    expect(ptA.x).toBe(2);
    expect(ptA.y).toBe(3);

    expect(ptB).toBeDefined();
    expect(ptB.x).toBe(7);
    expect(ptB.y).toBe(6);

    expect(seg).toBeDefined();
    expect(seg.pointAId).toBe('pt_A');
    expect(seg.pointBId).toBe('pt_B');
  });

  it('moving a point updates its coordinates while preserving independent identities', () => {
    const store = useMathStore.getState();
    store.setPointCoordinates('pt_A', 4, 5);

    const updated = useMathStore.getState();
    const ptA = updated.objects['pt_A'] as MathPoint;
    const ptB = updated.objects['pt_B'] as MathPoint;

    expect(ptA.x).toBe(4);
    expect(ptA.y).toBe(5);

    // Point B must remain unchanged
    expect(ptB.x).toBe(7);
    expect(ptB.y).toBe(6);
  });

  it('moving a point updates the dependent segment length', () => {
    const store = useMathStore.getState();
    // Move A to (1, 1) and B to (4, 5) -> 3-4-5 triangle -> length 5
    store.setPointCoordinates('pt_A', 1, 1);
    store.setPointCoordinates('pt_B', 4, 5);

    const state = useMathStore.getState();
    const ptA = state.objects['pt_A'] as MathPoint;
    const ptB = state.objects['pt_B'] as MathPoint;
    const dist = Math.hypot(ptB.x - ptA.x, ptB.y - ptA.y);

    expect(dist).toBe(5);
  });

  it('selecting an object does NOT mutate its geometry or other objects', () => {
    const store = useMathStore.getState();
    const initialA = { ...(store.objects['pt_A'] as MathPoint) };

    store.selectObject('pt_A');
    expect(useMathStore.getState().selectedId).toBe('pt_A');

    const afterSelectA = useMathStore.getState().objects['pt_A'] as MathPoint;
    expect(afterSelectA.x).toBe(initialA.x);
    expect(afterSelectA.y).toBe(initialA.y);

    store.selectObject(null);
    expect(useMathStore.getState().selectedId).toBeNull();
  });

  it('handles in-flight drag updates without spamming undo, and commits only on pointer up', () => {
    const store = useMathStore.getState();
    expect(store.history.length).toBe(0);

    // In-flight drag updates
    store.updatePointDrag('pt_A', 2.1, 3.1);
    store.updatePointDrag('pt_A', 2.2, 3.2);
    store.updatePointDrag('pt_A', 2.5, 3.5);

    // History must still be empty during continuous dragging
    expect(useMathStore.getState().history.length).toBe(0);

    // Pointer up commits drag
    store.commitPointDrag('pt_A');
    expect(useMathStore.getState().history.length).toBe(1);
  });

  it('accurately supports undo and redo operations', () => {
    const store = useMathStore.getState();
    store.setPointCoordinates('pt_A', 10, 10, true);

    expect((useMathStore.getState().objects['pt_A'] as MathPoint).x).toBe(10);
    expect(useMathStore.getState().history.length).toBe(1);

    // Undo restores previous coordinates (2, 3)
    useMathStore.getState().undo();
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).x).toBe(2);
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).y).toBe(3);

    // Redo restores new coordinates (10, 10)
    useMathStore.getState().redo();
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).x).toBe(10);
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).y).toBe(10);
  });

  it('resets experiment to the initial scene', () => {
    const store = useMathStore.getState();
    store.setPointCoordinates('pt_A', -50, -50);
    store.selectObject('pt_A');

    useMathStore.getState().resetExperiment();

    const state = useMathStore.getState();
    expect((state.objects['pt_A'] as MathPoint).x).toBe(2);
    expect((state.objects['pt_A'] as MathPoint).y).toBe(3);
    expect((state.objects['pt_B'] as MathPoint).x).toBe(7);
    expect((state.objects['pt_B'] as MathPoint).y).toBe(6);
    expect(state.selectedId).toBeNull();
  });

  it('exports and restores scene via serialization', () => {
    const store = useMathStore.getState();
    store.setPointCoordinates('pt_A', -4, -3);
    const exported = store.exportScene();

    expect(exported.version).toBe('1.0');
    expect((exported.objects['pt_A'] as MathPoint).x).toBe(-4);

    // Reset, then reload saved scene
    store.resetExperiment();
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).x).toBe(2);

    store.loadScene(exported);
    expect((useMathStore.getState().objects['pt_A'] as MathPoint).x).toBe(-4);
  });

  it('manages Predict & Reveal educational workflow correctly', () => {
    const store = useMathStore.getState();
    expect(store.predictRevealed).toBe(false);
    expect(store.predictionSubmitted).toBe(false);

    store.setStudentPrediction('5.8');
    expect(useMathStore.getState().studentPrediction).toBe('5.8');

    store.submitPrediction();
    expect(useMathStore.getState().predictionSubmitted).toBe(true);
    expect(useMathStore.getState().predictRevealed).toBe(true);

    store.resetPrediction();
    expect(useMathStore.getState().predictRevealed).toBe(false);
    expect(useMathStore.getState().studentPrediction).toBe('');
    expect(useMathStore.getState().predictionSubmitted).toBe(false);
  });
});
