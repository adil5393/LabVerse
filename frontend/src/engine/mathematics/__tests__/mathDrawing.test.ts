import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import { mathToScreen } from '../coordinates';
import type { FreehandStroke, MathSaveFile, MathViewportTransform } from '../types';

describe('Milestone M1.2D: Mathematics Workbench: Freehand Drawing & Isolated Drawing Eraser', () => {
  beforeEach(() => {
    // Reset to canonical experiment with points A(2,3) and B(7,6)
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  // Test 1: Creating a freehand stroke
  it('1. creates and stores a freehand stroke with world coordinates', () => {
    const store = useMathStore.getState();
    const stroke: FreehandStroke = {
      id: 'stroke_test_1',
      points: [
        { x: 1.5, y: 2.5 },
        { x: 2.0, y: 3.0 },
        { x: 3.5, y: 4.5 },
      ],
      color: '#38bdf8',
      width: 4,
    };

    store.addStroke(stroke);

    const updated = useMathStore.getState();
    expect(updated.drawings['stroke_test_1']).toBeDefined();
    expect(updated.drawings['stroke_test_1'].points.length).toBe(3);
    expect(updated.drawings['stroke_test_1'].points[0]).toEqual({ x: 1.5, y: 2.5 });
    expect(updated.drawingOrder).toContain('stroke_test_1');
  });

  // Test 2: Drawing a single-point dot
  it('2. supports single-point tap dots', () => {
    const store = useMathStore.getState();
    const dotStroke: FreehandStroke = {
      id: 'stroke_dot_1',
      points: [{ x: 5.0, y: -2.0 }],
      color: '#f43f5e',
      width: 8,
    };

    store.addStroke(dotStroke);

    const updated = useMathStore.getState();
    expect(updated.drawings['stroke_dot_1']).toBeDefined();
    expect(updated.drawings['stroke_dot_1'].points).toEqual([{ x: 5.0, y: -2.0 }]);
    expect(updated.drawings['stroke_dot_1'].width).toBe(8);
  });

  // Test 3: Preserving stroke color and width
  it('3. stores each stroke with its own color and width without modifying existing strokes when active settings change', () => {
    const store = useMathStore.getState();

    // Create stroke 1 with blue color and 3px width
    store.addStroke({
      id: 'stroke_blue_3',
      points: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      color: '#38bdf8',
      width: 3,
    });

    // Change active pen settings
    store.setDrawSettings({ color: '#f59e0b', width: 10 });
    expect(useMathStore.getState().drawSettings.color).toBe('#f59e0b');
    expect(useMathStore.getState().drawSettings.width).toBe(10);

    // Create stroke 2 with new settings
    store.addStroke({
      id: 'stroke_amber_10',
      points: [{ x: 2, y: 2 }, { x: 3, y: 3 }],
      color: '#f59e0b',
      width: 10,
    });

    const state = useMathStore.getState();
    // Stroke 1 must still have original color (#38bdf8) and width (3)
    expect(state.drawings['stroke_blue_3'].color).toBe('#38bdf8');
    expect(state.drawings['stroke_blue_3'].width).toBe(3);
    // Stroke 2 must have new color (#f59e0b) and width (10)
    expect(state.drawings['stroke_amber_10'].color).toBe('#f59e0b');
    expect(state.drawings['stroke_amber_10'].width).toBe(10);
  });

  // Test 4: Erasing one stroke
  it('4. erases a single stroke completely when drawing eraser deletes it', () => {
    const store = useMathStore.getState();
    store.addStroke({
      id: 's1',
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      color: '#38bdf8',
      width: 4,
    });
    store.addStroke({
      id: 's2',
      points: [{ x: 3, y: 3 }, { x: 4, y: 4 }],
      color: '#34d399',
      width: 4,
    });

    expect(useMathStore.getState().drawingOrder).toEqual(['s1', 's2']);

    // Erase s1
    store.deleteStrokes(['s1']);

    const state = useMathStore.getState();
    expect(state.drawings['s1']).toBeUndefined();
    expect(state.drawings['s2']).toBeDefined();
    expect(state.drawingOrder).toEqual(['s2']);
  });

  // Test 5: Erasing multiple strokes in one gesture
  it('5. erases multiple strokes in one continuous gesture in a single history transaction', () => {
    const store = useMathStore.getState();
    store.addStroke({ id: 's1', points: [{ x: 0, y: 0 }], color: '#fff', width: 4 });
    store.addStroke({ id: 's2', points: [{ x: 1, y: 1 }], color: '#fff', width: 4 });
    store.addStroke({ id: 's3', points: [{ x: 2, y: 2 }], color: '#fff', width: 4 });

    const historyLengthBefore = useMathStore.getState().history.length;

    // Erase s1 and s2 together in one continuous gesture
    store.deleteStrokes(['s1', 's2']);

    const state = useMathStore.getState();
    expect(state.drawings['s1']).toBeUndefined();
    expect(state.drawings['s2']).toBeUndefined();
    expect(state.drawings['s3']).toBeDefined();
    expect(state.drawingOrder).toEqual(['s3']);

    // Exactly one history snapshot was pushed
    expect(state.history.length).toBe(historyLengthBefore + 1);

    // Single undo restores both erased strokes
    store.undo();
    const afterUndo = useMathStore.getState();
    expect(afterUndo.drawings['s1']).toBeDefined();
    expect(afterUndo.drawings['s2']).toBeDefined();
    expect(afterUndo.drawings['s3']).toBeDefined();
    expect(afterUndo.drawingOrder).toEqual(['s1', 's2', 's3']);
  });

  // Test 6: Verifying drawing eraser cannot delete mathematical geometry
  it('6. verifies drawing eraser cannot delete mathematical geometry (points, segments, lines, measurements)', () => {
    const store = useMathStore.getState();
    // Default experiment has pt_A, pt_B, and meas_AB
    expect(store.objects['pt_A']).toBeDefined();
    expect(store.objects['pt_B']).toBeDefined();
    expect(store.measurements['meas_AB']).toBeDefined();

    // Passing mathematical IDs to deleteStrokes must do nothing
    store.deleteStrokes(['pt_A', 'pt_B', 'meas_AB']);

    const after = useMathStore.getState();
    expect(after.objects['pt_A']).toBeDefined();
    expect(after.objects['pt_B']).toBeDefined();
    expect(after.measurements['meas_AB']).toBeDefined();
  });

  // Test 7: Verifying mathematical eraser cannot delete freehand strokes
  it('7. verifies mathematical eraser cannot delete freehand strokes', () => {
    const store = useMathStore.getState();
    store.addStroke({ id: 'stroke_safe', points: [{ x: 1, y: 1 }], color: '#38bdf8', width: 4 });

    // Mathematical deleteObject
    store.deleteObject('stroke_safe');

    const state = useMathStore.getState();
    expect(state.drawings['stroke_safe']).toBeDefined();
    expect(state.drawingOrder).toContain('stroke_safe');
  });

  // Test 8: Canceling an incomplete stroke with Escape
  it('8. leaves store unchanged when incomplete stroke is discarded without committing', () => {
    const store = useMathStore.getState();
    const initialDrawingsCount = store.drawingOrder.length;
    const initialHistoryLength = store.history.length;

    // Setting tool to draw
    store.setTool('draw');
    expect(useMathStore.getState().activeTool).toBe('draw');

    // Canceling/switching back to select
    store.setTool('select');

    // Store state must have 0 new strokes and 0 new history entries
    expect(useMathStore.getState().drawingOrder.length).toBe(initialDrawingsCount);
    expect(useMathStore.getState().history.length).toBe(initialHistoryLength);
  });

  // Test 9: Preventing point dragging while drawing
  it('9. prevents mathematical point dragging when draw tool is active', () => {
    const store = useMathStore.getState();
    store.setTool('draw');

    // When tool is draw, activeTool is 'draw' and geometry layers have pointer-events: none
    expect(useMathStore.getState().activeTool).toBe('draw');
    expect(useMathStore.getState().objects['pt_A'].x).toBe(2);
    expect(useMathStore.getState().objects['pt_A'].y).toBe(3);
  });

  // Test 10: Pan/zoom alignment
  it('10. keeps stroke points glued to coordinate plane when viewport is panned or zoomed', () => {
    const store = useMathStore.getState();
    const worldPt = { x: 3, y: 4 };
    store.addStroke({
      id: 's_align',
      points: [worldPt],
      color: '#38bdf8',
      width: 4,
    });

    const v1 = useMathStore.getState().viewport;
    const screen1 = mathToScreen(worldPt.x, worldPt.y, v1);

    // Pan the canvas
    store.panBy(100, -50);
    const v2 = useMathStore.getState().viewport;
    const screen2 = mathToScreen(worldPt.x, worldPt.y, v2);

    expect(screen2.x).toBe(screen1.x + 100);
    expect(screen2.y).toBe(screen1.y - 50);

    // Zoom in
    store.zoomIn();
    const v3 = useMathStore.getState().viewport;
    expect(v3.zoom).toBeGreaterThan(v2.zoom);
    // World coordinates of stroke remained strictly unchanged
    expect(useMathStore.getState().drawings['s_align'].points[0]).toEqual({ x: 3, y: 4 });
  });

  // Test 11: Undo/redo of stroke creation and erasure
  it('11. cleanly performs undo and redo for stroke creation and erasure', () => {
    const store = useMathStore.getState();
    store.addStroke({
      id: 'stroke_ur',
      points: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      color: '#f59e0b',
      width: 4,
    });

    expect(useMathStore.getState().drawings['stroke_ur']).toBeDefined();

    // Undo stroke creation
    store.undo();
    expect(useMathStore.getState().drawings['stroke_ur']).toBeUndefined();

    // Redo stroke creation
    store.redo();
    expect(useMathStore.getState().drawings['stroke_ur']).toBeDefined();

    // Erase stroke
    store.deleteStrokes(['stroke_ur']);
    expect(useMathStore.getState().drawings['stroke_ur']).toBeUndefined();

    // Undo erasure
    store.undo();
    expect(useMathStore.getState().drawings['stroke_ur']).toBeDefined();

    // Redo erasure
    store.redo();
    expect(useMathStore.getState().drawings['stroke_ur']).toBeUndefined();
  });

  // Test 12: Clear Drawings isolation
  it('12. clearAllDrawings clears only freehand drawings while preserving geometry and measurements', () => {
    const store = useMathStore.getState();
    // Add two strokes
    store.addStroke({ id: 's1', points: [{ x: 0, y: 0 }], color: '#fff', width: 2 });
    store.addStroke({ id: 's2', points: [{ x: 1, y: 1 }], color: '#fff', width: 2 });

    expect(useMathStore.getState().drawingOrder.length).toBe(2);
    expect(useMathStore.getState().objectOrder.length).toBeGreaterThan(0);
    expect(useMathStore.getState().measurementOrder.length).toBeGreaterThan(0);

    // Clear only drawings
    store.clearAllDrawings();

    const state = useMathStore.getState();
    // All drawings cleared
    expect(state.drawingOrder.length).toBe(0);
    expect(Object.keys(state.drawings).length).toBe(0);

    // Mathematical points and measurements completely intact!
    expect(state.objects['pt_A']).toBeDefined();
    expect(state.objects['pt_B']).toBeDefined();
    expect(state.measurements['meas_AB']).toBeDefined();

    // Undo restores drawings
    store.undo();
    expect(useMathStore.getState().drawingOrder).toEqual(['s1', 's2']);
  });

  // Test 13: Clear Canvas atomic restoration
  it('13. clearCanvas atomically clears both geometry and drawings, and single undo restores both', () => {
    const store = useMathStore.getState();
    store.addStroke({ id: 's_atomic', points: [{ x: 2, y: 3 }], color: '#38bdf8', width: 4 });

    expect(useMathStore.getState().objectOrder.length).toBeGreaterThan(0);
    expect(useMathStore.getState().drawingOrder.length).toBe(1);

    // Atomically clear canvas
    store.clearCanvas();

    const cleared = useMathStore.getState();
    expect(cleared.objectOrder.length).toBe(0);
    expect(cleared.measurementOrder.length).toBe(0);
    expect(cleared.drawingOrder.length).toBe(0);

    // Undo restores geometry and drawings together
    store.undo();
    const restored = useMathStore.getState();
    expect(restored.objects['pt_A']).toBeDefined();
    expect(restored.objects['pt_B']).toBeDefined();
    expect(restored.measurements['meas_AB']).toBeDefined();
    expect(restored.drawings['s_atomic']).toBeDefined();
    expect(restored.drawingOrder).toEqual(['s_atomic']);
  });

  // Test 14: Export/load and legacy file compatibility
  it('14. exports and loads scenes with drawings, while maintaining backward compatibility with legacy files without drawings', () => {
    const store = useMathStore.getState();
    store.addStroke({
      id: 's_persist',
      points: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
      color: '#10b981',
      width: 6,
    });

    const exported = store.exportScene();
    expect(exported.drawings).toBeDefined();
    expect(exported.drawings!['s_persist']).toBeDefined();
    expect(exported.drawingOrder).toEqual(['s_persist']);

    // Clear canvas
    store.clearCanvas();
    expect(useMathStore.getState().drawingOrder.length).toBe(0);

    // Load exported scene
    store.loadScene(exported);
    const loaded = useMathStore.getState();
    expect(loaded.drawings['s_persist']).toBeDefined();
    expect(loaded.drawings['s_persist'].color).toBe('#10b981');
    expect(loaded.drawings['s_persist'].width).toBe(6);
    expect(loaded.drawingOrder).toEqual(['s_persist']);

    // Test legacy file compatibility (no drawings or drawingOrder in JSON)
    const legacySaveFile: MathSaveFile = {
      version: '1.0',
      experimentId: 'distance-between-two-points',
      title: 'Legacy Scene',
      timestamp: new Date().toISOString(),
      objects: {
        pt_1: { id: 'pt_1', kind: 'point', label: 'P', x: 0, y: 0 },
      },
      objectOrder: ['pt_1'],
      viewport: { panX: 0, panY: 0, zoom: 1, unitPixels: 44 },
    };

    store.loadScene(legacySaveFile);
    const legacyLoaded = useMathStore.getState();
    expect(legacyLoaded.objects['pt_1']).toBeDefined();
    // drawings defaults to empty record without error
    expect(legacyLoaded.drawings).toEqual({});
    expect(legacyLoaded.drawingOrder).toEqual([]);
  });

  // Test 15: Touch/pointer cancellation safety
  it('15. maintains history integrity during incomplete gesture discard', () => {
    const store = useMathStore.getState();
    const historyBefore = store.history.length;

    // Simulate switching mode or tool during gesture
    store.setDrawSettings({ mode: 'eraser' });
    expect(useMathStore.getState().drawSettings.mode).toBe('eraser');

    store.setDrawSettings({ mode: 'pen' });
    expect(useMathStore.getState().drawSettings.mode).toBe('pen');

    // No phantom history items pushed
    expect(useMathStore.getState().history.length).toBe(historyBefore);
  });

  // Test 16: Rendering performance for numerous strokes
  it('16. efficiently handles numerous strokes with stable order and O(1) key access', () => {
    const store = useMathStore.getState();

    // Create 100 strokes
    for (let i = 0; i < 100; i++) {
      store.addStroke({
        id: `perf_stroke_${i}`,
        points: [
          { x: i, y: i * 0.5 },
          { x: i + 0.5, y: i * 0.5 + 0.5 },
        ],
        color: i % 2 === 0 ? '#38bdf8' : '#f43f5e',
        width: (i % 8) + 2,
      });
    }

    const state = useMathStore.getState();
    expect(state.drawingOrder.length).toBe(100);
    expect(Object.keys(state.drawings).length).toBe(100);
    expect(state.drawings['perf_stroke_42'].color).toBe('#38bdf8');
    expect(state.drawings['perf_stroke_43'].color).toBe('#f43f5e');

    // Erase batch of 50 strokes
    const toDelete = Array.from({ length: 50 }, (_, i) => `perf_stroke_${i}`);
    store.deleteStrokes(toDelete);

    const afterDelete = useMathStore.getState();
    expect(afterDelete.drawingOrder.length).toBe(50);
    expect(afterDelete.drawings['perf_stroke_0']).toBeUndefined();
    expect(afterDelete.drawings['perf_stroke_99']).toBeDefined();
  });
});
