import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import {
  calculateDistance,
  calculateHelperVertices,
  calculateDistanceAnalysis,
} from '../calculations';
import { mathToScreen, DEFAULT_UNIT_PIXELS } from '../coordinates';
import type { MathPoint } from '../types';

describe('Milestone M1.2B: Persistent Measurements, Rendering & Management', () => {
  beforeEach(() => {
    // Reset to clean canonical experiment with points A(2,3) and B(7,6) and initial meas_AB
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  // Requirement 1: Completing a measurement between two existing points
  it('1. completes a measurement between two existing points with a stable ID and reference model', () => {
    const store = useMathStore.getState();
    const ptC = store.createPoint(1, 4);
    const meas = store.createMeasurement('pt_A', ptC.id, 'horizontal-then-vertical');

    expect(meas).not.toBeNull();
    const measId = meas!.id;

    const state = useMathStore.getState();
    expect(measId).toBeDefined();
    expect(state.measurements[measId]).toBeDefined();
    expect(state.measurements[measId].pointAId).toBe('pt_A');
    expect(state.measurements[measId].pointBId).toBe(ptC.id);
    expect(state.measurements[measId].triangleMode).toBe('horizontal-then-vertical');
    expect(state.measurementOrder).toContain(measId);
  });

  // Requirement 2: Correct coordinates of helper triangle vertices
  it('2. calculates exact coordinates for helper vertices C(x2, y1) and D(x1, y2)', () => {
    const p1 = { x: 2, y: 3 };
    const p2 = { x: 7, y: 6 };

    const { helperC, helperD } = calculateHelperVertices(p1, p2);
    expect(helperC).toEqual({ x: 7, y: 3 });
    expect(helperD).toEqual({ x: 2, y: 6 });

    // Negative / mixed quadrant testing: P1(-3, 4), P2(5, -2)
    const negTest = calculateHelperVertices({ x: -3, y: 4 }, { x: 5, y: -2 });
    expect(negTest.helperC).toEqual({ x: 5, y: 4 });
    expect(negTest.helperD).toEqual({ x: -3, y: -2 });
  });

  // Requirement 3: Correct horizontal and vertical guide orientations
  it('3. ensures horizontal guide has constant y and vertical guide has constant x in both math and screen space', () => {
    const pA = { x: 2, y: 3 };
    const pB = { x: 7, y: 6 };
    const { helperC, helperD } = calculateHelperVertices(pA, pB);

    // Math space invariants:
    // Leg A -> C is strictly horizontal (constant y = 3)
    expect(pA.y).toBe(helperC.y);
    // Leg C -> B is strictly vertical (constant x = 7)
    expect(helperC.x).toBe(pB.x);

    // Leg A -> D is strictly vertical (constant x = 2)
    expect(pA.x).toBe(helperD.x);
    // Leg D -> B is strictly horizontal (constant y = 6)
    expect(helperD.y).toBe(pB.y);

    // Screen space verification through viewport transformation
    const viewport = {
      zoom: 1.5,
      panX: 120,
      panY: 80,
      unitPixels: DEFAULT_UNIT_PIXELS,
      viewBox: { width: 1000, height: 600 },
      gridStep: 1,
    };

    const sA = mathToScreen(pA.x, pA.y, viewport);
    const sB = mathToScreen(pB.x, pB.y, viewport);
    const sC = mathToScreen(helperC.x, helperC.y, viewport);
    const sD = mathToScreen(helperD.x, helperD.y, viewport);

    // Horizontal guide on screen must have identical Y
    expect(sA.y).toBeCloseTo(sC.y, 6);
    expect(sD.y).toBeCloseTo(sB.y, 6);

    // Vertical guide on screen must have identical X
    expect(sC.x).toBeCloseTo(sB.x, 6);
    expect(sA.x).toBeCloseTo(sD.x, 6);
  });

  // Requirement 4: Completed measurement remaining visible across tool changes
  it('4. preserves completed measurements when switching tools', () => {
    const store = useMathStore.getState();
    const meas = store.createMeasurement('pt_A', 'pt_B')!;
    const measId = meas.id;

    // Switch tool to select
    store.setTool('select');
    expect(useMathStore.getState().measurements[measId]).toBeDefined();

    // Switch tool to segment
    store.setTool('segment');
    expect(useMathStore.getState().measurements[measId]).toBeDefined();

    // Switch tool to pan
    store.setTool('pan');
    expect(useMathStore.getState().measurements[measId]).toBeDefined();
  });

  // Requirement 5: Creating multiple independent measurements
  it('5. supports multiple independent measurements simultaneously without an arbitrary cap', () => {
    const store = useMathStore.getState();

    // Add points C(1, 1) and D(9, 2)
    const ptC = store.createPoint(1, 1);
    const ptD = store.createPoint(9, 2);

    // Create 3 distinct measurements
    const m1 = store.createMeasurement('pt_A', 'pt_B')!;
    const m2 = store.createMeasurement('pt_A', ptC.id)!;
    const m3 = store.createMeasurement('pt_B', ptD.id)!;

    const state = useMathStore.getState();
    expect(Object.keys(state.measurements)).toContain(m1.id);
    expect(Object.keys(state.measurements)).toContain(m2.id);
    expect(Object.keys(state.measurements)).toContain(m3.id);
    expect(state.measurementOrder).toEqual(expect.arrayContaining([m1.id, m2.id, m3.id]));
  });

  // Requirement 6: Selecting and deleting one measurement without affecting others
  it('6. allows selecting and deleting one measurement while keeping other measurements and points intact', () => {
    const store = useMathStore.getState();
    const ptC = store.createPoint(1, 1);

    const m1 = store.createMeasurement('pt_A', 'pt_B')!;
    const m2 = store.createMeasurement('pt_A', ptC.id)!;

    // Select m1
    store.selectMeasurement(m1.id);
    expect(useMathStore.getState().selectedMeasurementId).toBe(m1.id);
    expect(useMathStore.getState().selectedId).toBeNull(); // isolated from object selection

    // Delete m1
    store.deleteMeasurement(m1.id);

    const state = useMathStore.getState();
    expect(state.measurements[m1.id]).toBeUndefined();
    expect(state.measurementOrder).not.toContain(m1.id);
    expect(state.selectedMeasurementId).toBeNull();

    // Measurement m2 and all points must remain intact
    expect(state.measurements[m2.id]).toBeDefined();
    expect(state.objects['pt_A']).toBeDefined();
    expect(state.objects['pt_B']).toBeDefined();
    expect(state.objects[ptC.id]).toBeDefined();
  });

  // Requirement 7: Deleting a referenced endpoint cascades to dependent measurements
  it('7. cascades deletion of an endpoint to remove all dependent measurements without leaving dangling references', () => {
    const store = useMathStore.getState();
    const ptC = store.createPoint(1, 1);

    const m1 = store.createMeasurement('pt_A', 'pt_B')!;
    const m2 = store.createMeasurement(ptC.id, 'pt_B')!;
    const m3 = store.createMeasurement('pt_A', ptC.id)!;

    // Select m1
    store.selectMeasurement(m1.id);

    // Delete point B
    store.deleteObject('pt_B');

    const state = useMathStore.getState();
    expect(state.objects['pt_B']).toBeUndefined();

    // m1 (A-B) and m2 (C-B) must be removed
    expect(state.measurements[m1.id]).toBeUndefined();
    expect(state.measurements[m2.id]).toBeUndefined();
    expect(state.measurementOrder).not.toContain(m1.id);
    expect(state.measurementOrder).not.toContain(m2.id);

    // m3 (A-C) does not depend on B, so it must survive
    expect(state.measurements[m3.id]).toBeDefined();
    expect(state.measurementOrder).toContain(m3.id);

    // selectedMeasurementId was m1 which was deleted -> must be reset to null
    expect(state.selectedMeasurementId).toBeNull();
  });

  // Requirement 8: Dynamic measurement updates after moving endpoints
  it('8. dynamically updates measurement calculations and helper vertices when endpoints move', () => {
    const store = useMathStore.getState();
    const meas = store.createMeasurement('pt_A', 'pt_B')!;
    expect(meas).toBeDefined();

    // Move A from (2, 3) to (1, 1) and B from (7, 6) to (4, 5) -> 3-4-5 triangle
    store.setPointCoordinates('pt_A', 1, 1);
    store.setPointCoordinates('pt_B', 4, 5);

    const state = useMathStore.getState();
    const ptA = state.objects['pt_A'] as MathPoint;
    const ptB = state.objects['pt_B'] as MathPoint;

    // Measurement resolves coordinates dynamically from point objects
    const analysis = calculateDistanceAnalysis(ptA, ptB);
    expect(analysis.dx).toBe(3);
    expect(analysis.dy).toBe(4);
    expect(analysis.distance).toBe(5);
    expect(analysis.isExactSquare).toBe(true);

    const { helperC, helperD } = calculateHelperVertices(ptA, ptB);
    expect(helperC).toEqual({ x: 4, y: 1 });
    expect(helperD).toEqual({ x: 1, y: 5 });
  });

  // Requirement 9: Preview cancellation without changing committed measurements
  it('9. preview cancellation does not mutate or remove committed measurements', () => {
    const store = useMathStore.getState();
    const m1 = store.createMeasurement('pt_A', 'pt_B')!;

    // Start construction preview by setting active tool and temporary state
    store.setTool('distance');

    // Simulate cancelling preview via Escape / reset
    store.setTool('select');

    const state = useMathStore.getState();
    expect(state.measurements[m1.id]).toBeDefined();
    expect(state.measurementOrder).toContain(m1.id);
  });

  // Requirement 10: Undo and redo of measurement creation/deletion/mode switch
  it('10. supports atomic undo and redo for measurement creation, deletion, and mode toggling', () => {
    const store = useMathStore.getState();
    const initialCount = store.measurementOrder.length;

    // Add point C and create measurement
    const ptC = store.createPoint(5, 1);
    const m2 = store.createMeasurement('pt_A', ptC.id, 'horizontal-then-vertical')!;
    expect(useMathStore.getState().measurementOrder.length).toBe(initialCount + 1);

    // Toggle triangle mode to 'both'
    store.setMeasurementTriangleMode(m2.id, 'both');
    expect(useMathStore.getState().measurements[m2.id].triangleMode).toBe('both');

    // Undo mode change -> back to 'horizontal-then-vertical'
    store.undo();
    expect(useMathStore.getState().measurements[m2.id].triangleMode).toBe('horizontal-then-vertical');

    // Undo measurement creation -> m2 removed
    store.undo();
    expect(useMathStore.getState().measurements[m2.id]).toBeUndefined();

    // Redo measurement creation -> m2 restored
    store.redo();
    expect(useMathStore.getState().measurements[m2.id]).toBeDefined();

    // Redo mode change -> 'both' restored
    store.redo();
    expect(useMathStore.getState().measurements[m2.id].triangleMode).toBe('both');

    // Delete measurement
    store.deleteMeasurement(m2.id);
    expect(useMathStore.getState().measurements[m2.id]).toBeUndefined();

    // Undo delete -> m2 restored
    store.undo();
    expect(useMathStore.getState().measurements[m2.id]).toBeDefined();
  });

  // Requirement 11: Clearing and restoring multiple measurements
  it('11. clearCanvas clears all measurements and undo restores them completely', () => {
    const store = useMathStore.getState();
    const ptC = store.createPoint(1, 1);
    const m1 = store.createMeasurement('pt_A', 'pt_B')!;
    const m2 = store.createMeasurement('pt_A', ptC.id)!;

    // Clear Canvas
    store.clearCanvas();

    const clearedState = useMathStore.getState();
    expect(Object.keys(clearedState.objects).length).toBe(0);
    expect(Object.keys(clearedState.measurements).length).toBe(0);
    expect(clearedState.measurementOrder.length).toBe(0);
    expect(clearedState.selectedMeasurementId).toBeNull();

    // Undo Clear Canvas
    store.undo();

    const restoredState = useMathStore.getState();
    expect(restoredState.objects['pt_A']).toBeDefined();
    expect(restoredState.objects['pt_B']).toBeDefined();
    expect(restoredState.objects[ptC.id]).toBeDefined();
    expect(restoredState.measurements[m1.id]).toBeDefined();
    expect(restoredState.measurements[m2.id]).toBeDefined();
    expect(restoredState.measurementOrder).toContain(m1.id);
    expect(restoredState.measurementOrder).toContain(m2.id);
  });

  // Requirement 12: Correct coordinates after pan and zoom
  it('12. ensures mathematical coordinates and calculations are invariant across viewport pan and zoom', () => {
    const store = useMathStore.getState();
    store.createMeasurement('pt_A', 'pt_B');

    const ptA = store.objects['pt_A'] as MathPoint;
    const ptB = store.objects['pt_B'] as MathPoint;
    const distBefore = calculateDistance(ptA, ptB);

    // Change viewport pan and zoom
    store.setViewport({ panX: 250, panY: -150, zoom: 2.5 });

    const state = useMathStore.getState();
    const ptAAfter = state.objects['pt_A'] as MathPoint;
    const ptBAfter = state.objects['pt_B'] as MathPoint;

    // Mathematical coordinates must be strictly invariant
    expect(ptAAfter.x).toBe(2);
    expect(ptAAfter.y).toBe(3);
    expect(ptBAfter.x).toBe(7);
    expect(ptBAfter.y).toBe(6);

    const distAfter = calculateDistance(ptAAfter, ptBAfter);
    expect(distAfter).toBe(distBefore);
  });

  // Requirement 13: No duplicate measurement when repeatedly selecting the same endpoint pair
  it('13. prevents duplicate measurements when selecting the same endpoint pair (both direct and reverse)', () => {
    const store = useMathStore.getState();
    const ptC = store.createPoint(10, 10);
    const countBefore = store.measurementOrder.length;

    // First creation A -> C
    const m1 = store.createMeasurement('pt_A', ptC.id)!;
    expect(useMathStore.getState().measurementOrder.length).toBe(countBefore + 1);

    // Second creation same pair A -> C
    const m2 = store.createMeasurement('pt_A', ptC.id)!;
    expect(m2.id).toBe(m1.id);
    expect(useMathStore.getState().measurementOrder.length).toBe(countBefore + 1);

    // Third creation reversed pair C -> A
    const m3 = store.createMeasurement(ptC.id, 'pt_A')!;
    expect(m3.id).toBe(m1.id);
    expect(useMathStore.getState().measurementOrder.length).toBe(countBefore + 1);
  });

  // Requirement 14: No dangling references after object or measurement deletion
  it('14. guarantees no dangling references in selectedMeasurementId or measurementOrder after deletions', () => {
    const store = useMathStore.getState();
    const m1 = store.createMeasurement('pt_A', 'pt_B')!;

    store.selectMeasurement(m1.id);
    expect(useMathStore.getState().selectedMeasurementId).toBe(m1.id);

    // Deleting measurement clears selectedMeasurementId
    store.deleteMeasurement(m1.id);
    expect(useMathStore.getState().selectedMeasurementId).toBeNull();
    expect(useMathStore.getState().measurementOrder).not.toContain(m1.id);

    // Recreate with point C, select, then delete endpoint
    const ptC = store.createPoint(3, 8);
    const m2 = store.createMeasurement('pt_A', ptC.id)!;
    store.selectMeasurement(m2.id);
    expect(useMathStore.getState().selectedMeasurementId).toBe(m2.id);

    store.deleteObject('pt_A');
    expect(useMathStore.getState().selectedMeasurementId).toBeNull();
    expect(useMathStore.getState().measurementOrder).not.toContain(m2.id);
    expect(useMathStore.getState().measurements[m2.id]).toBeUndefined();
  });
});
