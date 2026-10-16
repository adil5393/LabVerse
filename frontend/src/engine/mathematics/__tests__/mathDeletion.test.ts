import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import {
  calculateDistanceAnalysis,
  calculateLineAnalysis,
} from '../calculations';
import { mathToScreen, screenToMath } from '../coordinates';
import type { MathPoint, MathSegment } from '../types';

describe('Mathematics Object Deletion, Eraser & Clear Canvas (Milestone M1.2)', () => {
  beforeEach(() => {
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  describe('1. Single-Object Deletion', () => {
    it('deleting a segment removes only that segment, leaving endpoint points intact', () => {
      const store = useMathStore.getState();
      expect(store.objects['seg_AB']).toBeDefined();
      expect(store.objects['pt_A']).toBeDefined();
      expect(store.objects['pt_B']).toBeDefined();

      store.deleteObject('seg_AB');

      const after = useMathStore.getState();
      expect(after.objects['seg_AB']).toBeUndefined();
      expect(after.objects['pt_A']).toBeDefined();
      expect(after.objects['pt_B']).toBeDefined();
      expect(after.objectOrder).not.toContain('seg_AB');
      expect(after.objectOrder).toContain('pt_A');
      expect(after.objectOrder).toContain('pt_B');
    });

    it('deleting an infinite line removes only that line, leaving defining points intact', () => {
      const store = useMathStore.getState();
      const line = store.createLine('pt_A', 'pt_B');
      expect(line).not.toBeNull();
      const lineId = line!.id;

      expect(useMathStore.getState().objects[lineId]).toBeDefined();

      useMathStore.getState().deleteObject(lineId);

      const after = useMathStore.getState();
      expect(after.objects[lineId]).toBeUndefined();
      expect(after.objects['pt_A']).toBeDefined();
      expect(after.objects['pt_B']).toBeDefined();
      expect(after.objectOrder).not.toContain(lineId);
    });

    it('deleteSelectedObject deletes the currently selected item', () => {
      const store = useMathStore.getState();
      store.selectObject('seg_AB');
      expect(useMathStore.getState().selectedId).toBe('seg_AB');

      useMathStore.getState().deleteSelectedObject();

      const after = useMathStore.getState();
      expect(after.objects['seg_AB']).toBeUndefined();
      expect(after.selectedId).toBeNull();
    });

    it('calling deleteObject with nonexistent ID is safe and does not modify history', () => {
      const store = useMathStore.getState();
      const initialHistoryLen = store.history.length;

      expect(() => {
        store.deleteObject('non_existent_id');
      }).not.toThrow();

      expect(useMathStore.getState().history.length).toBe(initialHistoryLen);
    });

    it('calling deleteSelectedObject when nothing is selected does not throw or mutate history', () => {
      const store = useMathStore.getState();
      store.selectObject(null);
      const initialHistoryLen = store.history.length;

      expect(() => {
        store.deleteSelectedObject();
      }).not.toThrow();

      expect(useMathStore.getState().history.length).toBe(initialHistoryLen);
    });
  });

  describe('2. Point Cascading Deletion & Referential Integrity', () => {
    it('deleting a point cascades and removes all dependent segments and infinite lines', () => {
      const store = useMathStore.getState();
      // Add an infinite line connecting A and B
      const line = store.createLine('pt_A', 'pt_B');
      const lineId = line!.id;

      // Add a third point C and a segment AC
      const ptC = store.createPoint(0, 0);
      const segAC = store.createSegment('pt_A', ptC.id);
      const segBC = store.createSegment('pt_B', ptC.id);

      expect(useMathStore.getState().objects['pt_A']).toBeDefined();
      expect(useMathStore.getState().objects['seg_AB']).toBeDefined();
      expect(useMathStore.getState().objects[lineId]).toBeDefined();
      expect(useMathStore.getState().objects[segAC!.id]).toBeDefined();
      expect(useMathStore.getState().objects[segBC!.id]).toBeDefined();

      // Delete Point A
      useMathStore.getState().deleteObject('pt_A');

      const after = useMathStore.getState();
      // Point A and all geometry connected to Point A must be deleted
      expect(after.objects['pt_A']).toBeUndefined();
      expect(after.objects['seg_AB']).toBeUndefined();
      expect(after.objects[lineId]).toBeUndefined();
      expect(after.objects[segAC!.id]).toBeUndefined();

      // Point B, Point C, and segment BC must remain intact
      expect(after.objects['pt_B']).toBeDefined();
      expect(after.objects[ptC.id]).toBeDefined();
      expect(after.objects[segBC!.id]).toBeDefined();
      expect(after.objectOrder).toContain('pt_B');
      expect(after.objectOrder).toContain(ptC.id);
      expect(after.objectOrder).toContain(segBC!.id);
    });

    it('deleting a point clears active measurement if it referenced that point', () => {
      const store = useMathStore.getState();
      store.setActiveMeasurement({
        pointAId: 'pt_A',
        pointBId: 'pt_B',
      });
      expect(useMathStore.getState().activeMeasurement).toEqual({
        pointAId: 'pt_A',
        pointBId: 'pt_B',
      });

      // Delete point A
      useMathStore.getState().deleteObject('pt_A');

      expect(useMathStore.getState().activeMeasurement).toBeNull();
    });

    it('clears selectedId if a dependent segment was selected when the point was deleted', () => {
      const store = useMathStore.getState();
      store.selectObject('seg_AB');
      expect(useMathStore.getState().selectedId).toBe('seg_AB');

      // Delete point A (which cascades to seg_AB)
      useMathStore.getState().deleteObject('pt_A');

      const after = useMathStore.getState();
      expect(after.objects['seg_AB']).toBeUndefined();
      // selectedId must NOT be dangling
      expect(after.selectedId).toBeNull();
    });
  });

  describe('3. Clear Canvas (Atomic Transaction & Isolation)', () => {
    it('clearing canvas removes all geometry and active measurements in a single atomic history step', () => {
      const store = useMathStore.getState();
      expect(store.objectOrder.length).toBeGreaterThan(0);
      const historyBefore = store.history.length;

      store.clearCanvas();

      const after = useMathStore.getState();
      expect(Object.keys(after.objects).length).toBe(0);
      expect(after.objectOrder.length).toBe(0);
      expect(after.selectedId).toBeNull();
      expect(after.activeMeasurement).toBeNull();
      expect(after.constructionState.stage).toBe('idle');
      // Exactly one atomic snapshot was added
      expect(after.history.length).toBe(historyBefore + 1);
    });

    it('clearCanvas is inert when canvas is already empty and does not push redundant history', () => {
      const store = useMathStore.getState();
      store.clearCanvas();

      const afterFirstClear = useMathStore.getState();
      const historyCount = afterFirstClear.history.length;

      // Call clearCanvas a second time on empty canvas
      afterFirstClear.clearCanvas();

      const afterSecondClear = useMathStore.getState();
      expect(afterSecondClear.history.length).toBe(historyCount);
    });

    it('clearCanvas preserves viewport zoom, pan, axes visibility, grid and experiment identity', () => {
      const store = useMathStore.getState();
      store.setViewport({ zoom: 1.75, panX: 120, panY: -45 });
      store.toggleSnapToGrid();
      const snapBefore = useMathStore.getState().snapToGrid;
      const zoomBefore = useMathStore.getState().viewport.zoom;
      const expIdBefore = useMathStore.getState().currentExperimentId;

      store.clearCanvas();

      const after = useMathStore.getState();
      expect(after.viewport.zoom).toBe(zoomBefore);
      expect(after.viewport.panX).toBe(120);
      expect(after.viewport.panY).toBe(-45);
      expect(after.snapToGrid).toBe(snapBefore);
      expect(after.currentExperimentId).toBe(expIdBefore);
      expect(after.showAxes).toBe(true);
      expect(after.showGrid).toBe(true);
    });
  });

  describe('4. Reset Experiment vs Clear Canvas Separation', () => {
    it('resetExperiment restores initial canonical geometry A(2,3), B(7,6), and seg_AB', () => {
      const store = useMathStore.getState();
      store.clearCanvas();
      expect(Object.keys(useMathStore.getState().objects).length).toBe(0);

      // Now reset experiment
      useMathStore.getState().resetExperiment('distance-between-two-points');

      const restored = useMathStore.getState();
      const ptA = restored.objects['pt_A'] as MathPoint;
      const ptB = restored.objects['pt_B'] as MathPoint;
      const seg = restored.objects['seg_AB'] as MathSegment;

      expect(ptA).toBeDefined();
      expect(ptA.x).toBe(2);
      expect(ptA.y).toBe(3);

      expect(ptB).toBeDefined();
      expect(ptB.x).toBe(7);
      expect(ptB.y).toBe(6);

      expect(seg).toBeDefined();
    });
  });

  describe('5. Undo/Redo Integrity', () => {
    it('Delete point with dependent segments -> Undo restores all objects', () => {
      const store = useMathStore.getState();
      expect(store.objects['pt_A']).toBeDefined();
      expect(store.objects['seg_AB']).toBeDefined();

      store.deleteObject('pt_A');
      expect(useMathStore.getState().objects['pt_A']).toBeUndefined();
      expect(useMathStore.getState().objects['seg_AB']).toBeUndefined();

      // Undo deletion
      useMathStore.getState().undo();

      const afterUndo = useMathStore.getState();
      expect(afterUndo.objects['pt_A']).toBeDefined();
      expect(afterUndo.objects['seg_AB']).toBeDefined();
      expect((afterUndo.objects['pt_A'] as MathPoint).x).toBe(2);

      // Redo deletion
      useMathStore.getState().redo();

      const afterRedo = useMathStore.getState();
      expect(afterRedo.objects['pt_A']).toBeUndefined();
      expect(afterRedo.objects['seg_AB']).toBeUndefined();
    });

    it('Clear Canvas -> Undo restores complete previous geometry', () => {
      const store = useMathStore.getState();
      const initialCount = Object.keys(store.objects).length;
      expect(initialCount).toBeGreaterThan(0);

      store.clearCanvas();
      expect(Object.keys(useMathStore.getState().objects).length).toBe(0);

      // Undo clear canvas
      useMathStore.getState().undo();

      const afterUndo = useMathStore.getState();
      expect(Object.keys(afterUndo.objects).length).toBe(initialCount);
      expect(afterUndo.objects['pt_A']).toBeDefined();
      expect(afterUndo.objects['pt_B']).toBeDefined();
      expect(afterUndo.objects['seg_AB']).toBeDefined();

      // Redo clear canvas
      useMathStore.getState().redo();
      expect(Object.keys(useMathStore.getState().objects).length).toBe(0);
    });

    it('performing a new action after Undo invalidates the redo future stack', () => {
      const store = useMathStore.getState();
      store.deleteObject('seg_AB');
      expect(useMathStore.getState().future.length).toBe(0);

      store.undo();
      expect(useMathStore.getState().future.length).toBe(1);

      // Create a new point (new mutation)
      useMathStore.getState().createPoint(5, 5);

      // Redo stack must now be empty
      expect(useMathStore.getState().future.length).toBe(0);
    });
  });

  describe('6. Coordinate and Calculation Invariance', () => {
    it('coordinate transformation calculations remain unchanged before and after object management', () => {
      const viewport = { zoom: 1.0, panX: 0, panY: 0, unitPixels: 50 };
      const screenPt = mathToScreen(3, -2, viewport);
      const mathPt = screenToMath(screenPt.x, screenPt.y, viewport);

      expect(mathPt.x).toBeCloseTo(3, 4);
      expect(mathPt.y).toBeCloseTo(-2, 4);
    });

    it('distance analysis calculations remain mathematically exact', () => {
      const p1: MathPoint = {
        id: 'p1',
        kind: 'point',
        label: 'A',
        x: 0,
        y: 0,
        isDraggable: true,
      };
      const p2: MathPoint = {
        id: 'p2',
        kind: 'point',
        label: 'B',
        x: 3,
        y: 4,
        isDraggable: true,
      };

      const analysis = calculateDistanceAnalysis(p1, p2);
      expect(analysis.distance).toBe(5);
      expect(analysis.dx).toBe(3);
      expect(analysis.dy).toBe(4);
    });

    it('line analysis calculations remain mathematically exact', () => {
      const p1: MathPoint = {
        id: 'p1',
        kind: 'point',
        label: 'A',
        x: 1,
        y: 2,
        isDraggable: true,
      };
      const p2: MathPoint = {
        id: 'p2',
        kind: 'point',
        label: 'B',
        x: 3,
        y: 6,
        isDraggable: true,
      };

      const lineAnalysis = calculateLineAnalysis(p1, p2);
      expect(lineAnalysis.slope).toBe(2);
      expect(lineAnalysis.yIntercept).toBe(0);
      expect(lineAnalysis.equation).toBe('y = 2x');
    });
  });
});
