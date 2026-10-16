import { describe, it, expect, beforeEach } from 'vitest';
import { useMathStore } from '../../../store/useMathStore';
import {
  calculateInfiniteLineEndpoints,
  calculateLineAnalysis,
  generateNextPointLabel,
} from '../calculations';
import type { MathPoint } from '../types';

describe('Mathematics Workbench Tool Functionality & Interactions (Milestone M1.1)', () => {
  beforeEach(() => {
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  describe('Point Tool (P)', () => {
    it('creates a point with auto-generated label, unique ID, and records undo', () => {
      const store = useMathStore.getState();
      expect(store.history.length).toBe(0);

      // Points A and B exist initially, next label should be C
      const newPt = store.createPoint(3, 4);
      expect(newPt.label).toBe('C');
      expect(newPt.x).toBe(3);
      expect(newPt.y).toBe(4);
      expect(useMathStore.getState().objects[newPt.id]).toBeDefined();
      expect(useMathStore.getState().selectedId).toBe(newPt.id);
      expect(useMathStore.getState().history.length).toBe(1);

      // Creating another point should assign label D
      const nextPt = useMathStore.getState().createPoint(5, 6);
      expect(nextPt.label).toBe('D');
    });

    it('generates sequential unique labels from A-Z then P1-P999', () => {
      const existing: MathPoint[] = [
        { id: '1', kind: 'point', label: 'A', x: 0, y: 0 },
        { id: '2', kind: 'point', label: 'B', x: 1, y: 1 },
      ];
      expect(generateNextPointLabel(existing)).toBe('C');

      // Fill all A-Z
      const allLetters: MathPoint[] = Array.from({ length: 26 }, (_, i) => ({
        id: `${i}`,
        kind: 'point',
        label: String.fromCharCode(65 + i),
        x: i,
        y: i,
      }));
      expect(generateNextPointLabel(allLetters)).toBe('P1');
    });
  });

  describe('Line Segment Tool (S)', () => {
    it('creates a valid segment between two distinct points', () => {
      const store = useMathStore.getState();
      const seg = store.createSegment('pt_A', 'pt_B');

      // pt_A and pt_B already have seg_AB, so createSegment should return the existing segment without duplicating
      expect(seg).toBeDefined();
      expect(seg?.pointAId).toBe('pt_A');
      expect(seg?.pointBId).toBe('pt_B');

      // Create a third point C and connect A to C
      const ptC = store.createPoint(0, 5);
      const segAC = useMathStore.getState().createSegment('pt_A', ptC.id);

      expect(segAC).toBeDefined();
      expect(segAC?.pointAId).toBe('pt_A');
      expect(segAC?.pointBId).toBe(ptC.id);
      expect(segAC?.label).toBe('AC');
      expect(useMathStore.getState().objects[segAC!.id]).toBeDefined();
    });

    it('rejects zero-length degenerate segments connecting a point to itself', () => {
      const store = useMathStore.getState();
      const degenerate = store.createSegment('pt_A', 'pt_A');
      expect(degenerate).toBeNull();
    });

    it('prevents accidental duplicate segments connecting the same endpoints', () => {
      const store = useMathStore.getState();
      const ptC = store.createPoint(1, 2);
      const ptD = store.createPoint(3, 4);

      const seg1 = useMathStore.getState().createSegment(ptC.id, ptD.id);
      const seg2 = useMathStore.getState().createSegment(ptD.id, ptC.id);

      expect(seg1).toBeDefined();
      expect(seg2?.id).toBe(seg1?.id); // Must return the existing segment
    });
  });

  describe('Infinite Line Tool (L) & Viewport Clipping', () => {
    it('creates an infinite line connecting two distinct points', () => {
      const store = useMathStore.getState();
      const line = store.createLine('pt_A', 'pt_B');

      expect(line).toBeDefined();
      expect(line?.kind).toBe('line');
      expect(line?.pointAId).toBe('pt_A');
      expect(line?.pointBId).toBe('pt_B');
      expect(useMathStore.getState().objects[line!.id]).toBeDefined();
    });

    it('rejects infinite line with coincident points', () => {
      const store = useMathStore.getState();
      const line = store.createLine('pt_A', 'pt_A');
      expect(line).toBeNull();
    });

    it('accurately clips an oblique infinite line to viewport boundaries', () => {
      const bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };
      // Line passing through (0, 0) and (2, 2) has equation y = x
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 2, y: 2 };

      const clipped = calculateInfiniteLineEndpoints(p1, p2, bounds);
      expect(clipped).not.toBeNull();
      const [cp1, cp2] = clipped!;

      // Both clipped endpoints must satisfy y = x
      expect(cp1.x).toBeCloseTo(cp1.y, 4);
      expect(cp2.x).toBeCloseTo(cp2.y, 4);
      // And must span across the viewport
      expect(Math.abs(cp1.x - cp2.x)).toBeGreaterThan(15);
    });

    it('accurately clips vertical and horizontal infinite lines', () => {
      const bounds = { minX: -10, maxX: 10, minY: -10, maxY: 10 };

      // Vertical line x = 3
      const vertClip = calculateInfiniteLineEndpoints({ x: 3, y: 0 }, { x: 3, y: 5 }, bounds);
      expect(vertClip).not.toBeNull();
      expect(vertClip![0].x).toBe(3);
      expect(vertClip![1].x).toBe(3);

      // Horizontal line y = -2
      const horizClip = calculateInfiniteLineEndpoints({ x: -4, y: -2 }, { x: 6, y: -2 }, bounds);
      expect(horizClip).not.toBeNull();
      expect(horizClip![0].y).toBe(-2);
      expect(horizClip![1].y).toBe(-2);
    });

    it('computes slope, intercept, and equation in calculateLineAnalysis', () => {
      const p1 = { x: 1, y: 3, label: 'A' };
      const p2 = { x: 3, y: 7, label: 'B' };
      // slope m = (7-3)/(3-1) = 2, y-intercept c = 3 - 2*(1) = 1  => y = 2x + 1
      const analysis = calculateLineAnalysis(p1, p2);

      expect(analysis.slope).toBe(2);
      expect(analysis.yIntercept).toBe(1);
      expect(analysis.equation).toBe('y = 2x + 1');
      expect(analysis.isVertical).toBe(false);
      expect(analysis.isHorizontal).toBe(false);
    });
  });

  describe('Distance Measurement Tool (M)', () => {
    it('sets active measurement between any two points without altering permanent geometry', () => {
      const store = useMathStore.getState();
      const ptC = store.createPoint(0, 0);
      const ptD = store.createPoint(3, 4);

      useMathStore.getState().setActiveMeasurement({
        pointAId: ptC.id,
        pointBId: ptD.id,
      });

      const active = useMathStore.getState().activeMeasurement;
      expect(active).toEqual({ pointAId: ptC.id, pointBId: ptD.id });
    });
  });

  describe('Interaction State Machine & Construction Lifecycle', () => {
    it('initiates construction on first point and updates preview coordinates', () => {
      const store = useMathStore.getState();
      store.startConstruction('pt_A');

      const state1 = useMathStore.getState().constructionState;
      expect(state1.stage).toBe('selecting_second');
      expect(state1.firstPointId).toBe('pt_A');
      expect(state1.previewCoord).toBeNull();

      store.updateConstructionPreview({ x: 5, y: 5 });
      expect(useMathStore.getState().constructionState.previewCoord).toEqual({ x: 5, y: 5 });

      // Cancel construction
      store.cancelConstruction();
      expect(useMathStore.getState().constructionState.stage).toBe('idle');
      expect(useMathStore.getState().constructionState.firstPointId).toBeNull();
    });

    it('switching tools automatically cancels an incomplete construction', () => {
      const store = useMathStore.getState();
      store.setTool('segment');
      store.startConstruction('pt_A');
      expect(useMathStore.getState().constructionState.stage).toBe('selecting_second');

      // Switch to point tool
      store.setTool('point');
      expect(useMathStore.getState().constructionState.stage).toBe('idle');
      expect(useMathStore.getState().constructionState.firstPointId).toBeNull();
    });
  });

  describe('Object Deletion & Cascading Cleanups', () => {
    it('deleting a point automatically cleans up all dependent segments and lines', () => {
      const store = useMathStore.getState();
      const ptC = store.createPoint(5, 5);
      const segAC = useMathStore.getState().createSegment('pt_A', ptC.id);
      const lineAC = useMathStore.getState().createLine('pt_A', ptC.id);

      expect(useMathStore.getState().objects[segAC!.id]).toBeDefined();
      expect(useMathStore.getState().objects[lineAC!.id]).toBeDefined();

      // Delete point C
      useMathStore.getState().deleteObject(ptC.id);

      const afterState = useMathStore.getState();
      expect(afterState.objects[ptC.id]).toBeUndefined();
      expect(afterState.objects[segAC!.id]).toBeUndefined();
      expect(afterState.objects[lineAC!.id]).toBeUndefined();

      // Point A must still be preserved
      expect(afterState.objects['pt_A']).toBeDefined();
    });

    it('deleteSelectedObject deletes the currently selected object and clears selection', () => {
      const store = useMathStore.getState();
      const newPt = store.createPoint(9, 9);
      expect(useMathStore.getState().selectedId).toBe(newPt.id);

      useMathStore.getState().deleteSelectedObject();
      expect(useMathStore.getState().objects[newPt.id]).toBeUndefined();
      expect(useMathStore.getState().selectedId).toBeNull();
    });
  });

  describe('Pan Tool & Navigation', () => {
    it('activates pan tool and supports panning the viewport', () => {
      const store = useMathStore.getState();
      store.setTool('pan');
      expect(useMathStore.getState().activeTool).toBe('pan');

      const initialPanX = store.viewport.panX;
      const initialPanY = store.viewport.panY;

      store.panBy(50, -30);
      expect(useMathStore.getState().viewport.panX).toBe(initialPanX + 50);
      expect(useMathStore.getState().viewport.panY).toBe(initialPanY - 30);
    });
  });
});
