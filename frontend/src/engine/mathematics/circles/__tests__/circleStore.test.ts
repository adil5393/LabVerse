import { describe, it, expect, beforeEach } from 'vitest';
import { useCircleStore } from '../../../../store/useCircleStore';
import { useMathStore } from '../../../../store/useMathStore';

describe('useCircleStore & Architectural Module Isolation', () => {
  beforeEach(() => {
    useCircleStore.getState().resetExperiment();
    useMathStore.getState().resetExperiment('distance-between-two-points');
  });

  describe('Circles Store State & Lifecycle', () => {
    it('initializes with canonical Experiment 1 scene', () => {
      const state = useCircleStore.getState();
      expect(state.currentExperimentId).toBe('understanding-circle');
      expect(Object.keys(state.circles).length).toBeGreaterThanOrEqual(1);
      expect(Object.keys(state.circumferencePoints).length).toBeGreaterThanOrEqual(2);
      expect(Object.keys(state.chords).length).toBeGreaterThanOrEqual(1);
    });

    it('adds and updates circle entities', () => {
      const store = useCircleStore.getState();
      const circleId = store.addCircle({ x: 2, y: 3 }, 4.5);

      const circle = useCircleStore.getState().circles[circleId];
      expect(circle).toBeDefined();
      expect(circle.center.x).toBe(2);
      expect(circle.center.y).toBe(3);
      expect(circle.radius).toBe(4.5);

      store.updateCircle(circleId, { radius: 6.0 });
      expect(useCircleStore.getState().circles[circleId].radius).toBe(6.0);
    });

    it('adds and constrains circumference points', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const ptId = store.addCircumferencePoint(circleId, Math.PI / 4, 'Z');
      const pt = useCircleStore.getState().circumferencePoints[ptId];
      expect(pt).toBeDefined();
      expect(pt.name).toBe('Z');
      expect(pt.angleRad).toBeCloseTo(Math.PI / 4, 3);

      // Rotate point along circle
      store.updateCircumferencePoint(ptId, Math.PI);
      expect(useCircleStore.getState().circumferencePoints[ptId].angleRad).toBeCloseTo(Math.PI, 3);
    });

    it('cascades deletion cleanly when parent circle is deleted', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      // Initially has circumference points and chords
      expect(Object.keys(useCircleStore.getState().circumferencePoints).length).toBeGreaterThan(0);

      // Delete the circle
      store.deleteObject(circleId, 'circle');

      // Points and chords belonging to that circle should be purged
      const points = Object.values(useCircleStore.getState().circumferencePoints);
      const remainingForCircle = points.filter((p) => p.circleId === circleId);
      expect(remainingForCircle.length).toBe(0);
    });

    it('executes undo and redo history navigation', () => {
      const store = useCircleStore.getState();
      const initialCount = Object.keys(store.circles).length;

      store.addCircle({ x: 5, y: 5 }, 3.0);
      expect(Object.keys(useCircleStore.getState().circles).length).toBe(initialCount + 1);

      // Undo
      expect(useCircleStore.getState().canUndo()).toBe(true);
      store.undo();
      expect(Object.keys(useCircleStore.getState().circles).length).toBe(initialCount);

      // Redo
      expect(useCircleStore.getState().canRedo()).toBe(true);
      store.redo();
      expect(Object.keys(useCircleStore.getState().circles).length).toBe(initialCount + 1);
    });

    it('records and checks practice problem answers', () => {
      const store = useCircleStore.getState();
      store.submitPracticeAnswer('q1_test', '9 cm', true);

      const record = useCircleStore.getState().practiceAnswers['q1_test'];
      expect(record).toBeDefined();
      expect(record.userAnswer).toBe('9 cm');
      expect(record.isCorrect).toBe(true);
    });
  });

  describe('Architectural Module Isolation: Circles vs Coordinate Geometry', () => {
    it('confirms operations in Circles do not leak into Coordinate Geometry', () => {
      // Record initial Coordinate Geometry state
      const mathInitialObjects = Object.keys(useMathStore.getState().objects).length;
      const mathInitialSelection = useMathStore.getState().selectedId;

      // Perform mutations in Circles store
      const circleStore = useCircleStore.getState();
      const newCircleId = circleStore.addCircle({ x: 10, y: 10 }, 5.0);
      circleStore.selectObject(newCircleId, 'circle');
      circleStore.setActiveTool('chord');

      // Assert Coordinate Geometry state is 100% UNCHANGED
      const mathState = useMathStore.getState();
      expect(Object.keys(mathState.objects).length).toBe(mathInitialObjects);
      expect(mathState.selectedId).toBe(mathInitialSelection);
      expect(mathState.activeTool).not.toBe('chord'); // Coordinate geometry has its own active tool
    });

    it('confirms resetting Circles does not reset or alter Coordinate Geometry', () => {
      // Modify coordinate geometry by setting a selection
      useMathStore.getState().selectObject('pt_A');
      expect(useMathStore.getState().selectedId).toBe('pt_A');

      // Reset circles experiment
      useCircleStore.getState().resetExperiment();

      // Coordinate geometry selection must still be 'pt_A'
      expect(useMathStore.getState().selectedId).toBe('pt_A');
    });

    it('confirms undo/redo stacks remain strictly independent', () => {
      const mathHistoryBefore = useMathStore.getState().history.length;

      // Push multiple actions to Circles
      useCircleStore.getState().addCircle({ x: 0, y: 0 }, 2.0);
      useCircleStore.getState().addCircle({ x: 1, y: 1 }, 3.0);
      useCircleStore.getState().undo();

      // Math store history length must remain unchanged
      expect(useMathStore.getState().history.length).toBe(mathHistoryBefore);
    });
  });

  describe('Milestone M2.1: Diameter Construction & Interactive Invariants', () => {
    it('creates dedicated diameter with diametrically opposite point', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const ptAId = Object.keys(store.circumferencePoints)[0];
      const initialAngle = store.circumferencePoints[ptAId].angleRad;

      const diameterId = store.addDiameter(circleId, ptAId);
      const diameter = useCircleStore.getState().radiusDiameters[diameterId];

      expect(diameter).toBeDefined();
      expect(diameter.type).toBe('diameter');
      expect(diameter.pointId).toBe(ptAId);
      expect(diameter.point2Id).toBeDefined();

      const oppPt = useCircleStore.getState().circumferencePoints[diameter.point2Id!];
      expect(oppPt).toBeDefined();
      expect(oppPt.circleId).toBe(circleId);
      // Angle should be initialAngle + π
      const expectedOppAngle = (initialAngle + Math.PI) % (2 * Math.PI);
      expect(oppPt.angleRad).toBeCloseTo(expectedOppAngle, 2);
    });

    it('maintains diametrical constraint: rotating point A automatically rotates opposite point B', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const ptAId = store.addCircumferencePoint(circleId, 0.0); // angle 0

      const diameterId = store.addDiameter(circleId, ptAId);
      const diameter = useCircleStore.getState().radiusDiameters[diameterId];
      const oppPtId = diameter.point2Id!;

      expect(useCircleStore.getState().circumferencePoints[oppPtId].angleRad).toBeCloseTo(Math.PI, 2);

      // Rotate point A to π/2 (90°)
      store.updateCircumferencePoint(ptAId, Math.PI / 2);

      // Opposite point B must automatically be at 3π/2 (270°)
      expect(useCircleStore.getState().circumferencePoints[ptAId].angleRad).toBeCloseTo(Math.PI / 2, 2);
      expect(useCircleStore.getState().circumferencePoints[oppPtId].angleRad).toBeCloseTo((3 * Math.PI) / 2, 2);
    });

    it('supports user-facing label size preference setting', () => {
      const store = useCircleStore.getState();
      expect(store.labelSize).toBe('normal'); // Default Normal

      store.setLabelSize('large');
      expect(useCircleStore.getState().labelSize).toBe('large');

      store.setLabelSize('small');
      expect(useCircleStore.getState().labelSize).toBe('small');
    });

    it('executes fitToConstruction recalculating viewport comfortably', () => {
      const store = useCircleStore.getState();
      store.fitToConstruction(1200, 800);

      const vp = useCircleStore.getState().viewport;
      expect(vp.zoom).toBeGreaterThanOrEqual(20);
      expect(vp.zoom).toBeLessThanOrEqual(110);
    });

    it('preserves student constructions when switching between explore, investigate, and practice modes', () => {
      const store = useCircleStore.getState();
      const circleId = store.addCircle({ x: 5, y: -2 }, 3.5);

      expect(useCircleStore.getState().circles[circleId]).toBeDefined();

      // Switch to investigate
      store.setMode('investigate');
      expect(useCircleStore.getState().mode).toBe('investigate');
      expect(useCircleStore.getState().circles[circleId]).toBeDefined();

      // Switch to practice
      store.setMode('practice');
      expect(useCircleStore.getState().mode).toBe('practice');
      expect(useCircleStore.getState().circles[circleId]).toBeDefined();

      // Switch back to explore
      store.setMode('explore');
      expect(useCircleStore.getState().mode).toBe('explore');
      expect(useCircleStore.getState().circles[circleId]).toBeDefined();
    });
  });

  describe('Milestone M2.2 Hotfix: Angle Measurement Lifecycle & Interactivity', () => {
    it('constructs central angle A -> O -> B with isCentral=true and correct classification', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const pAId = store.addCircumferencePoint(circleId, 0, 'A'); // (4, 0)
      const pBId = store.addCircumferencePoint(circleId, Math.PI / 2, 'B'); // (0, 4)
      const centerId = `center_${circleId}`;

      const angleId = store.addAngle(circleId, pAId, centerId, pBId, true);
      const angle = useCircleStore.getState().angles[angleId];

      expect(angle).toBeDefined();
      expect(angle.name).toContain('A');
      expect(angle.name).toContain('B');
      expect(angle.isCentral).toBe(true);
      expect(angle.point1Id).toBe(pAId);
      expect(angle.vertexId).toBe(centerId);
      expect(angle.point2Id).toBe(pBId);
    });

    it('constructs inscribed angle A -> P -> B with isCentral=false', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const pAId = store.addCircumferencePoint(circleId, 0, 'A');
      const pPId = store.addCircumferencePoint(circleId, Math.PI * 0.75, 'P');
      const pBId = store.addCircumferencePoint(circleId, Math.PI / 2, 'B');

      const angleId = store.addAngle(circleId, pAId, pPId, pBId, false);
      const angle = useCircleStore.getState().angles[angleId];

      expect(angle).toBeDefined();
      expect(angle.isCentral).toBe(false);
      expect(angle.vertexId).toBe(pPId);
    });

    it('supports live angle updates when points move without storing stale coordinates', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const pAId = store.addCircumferencePoint(circleId, 0, 'A');
      const pBId = store.addCircumferencePoint(circleId, Math.PI / 2, 'B');
      const centerId = `center_${circleId}`;

      const angleId = store.addAngle(circleId, pAId, centerId, pBId, true);
      expect(useCircleStore.getState().angles[angleId]).toBeDefined();

      // Rotate point B from 90° to 180°
      store.updateCircumferencePoint(pBId, Math.PI);

      // Angle entity retains references to pAId and pBId, coordinates update dynamically
      const ptBUpdated = useCircleStore.getState().circumferencePoints[pBId];
      expect(ptBUpdated.angleRad).toBeCloseTo(Math.PI, 2);
    });

    it('supports undo and redo for angle measurements', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const initialAnglesCount = Object.keys(store.angles).length;

      const pAId = store.addCircumferencePoint(circleId, 0, 'A');
      const pBId = store.addCircumferencePoint(circleId, 1, 'B');
      const angleId = store.addAngle(circleId, pAId, `center_${circleId}`, pBId, true);

      expect(Object.keys(useCircleStore.getState().angles).length).toBe(initialAnglesCount + 1);

      // Undo
      store.undo();
      expect(useCircleStore.getState().angles[angleId]).toBeUndefined();

      // Redo
      store.redo();
      expect(useCircleStore.getState().angles[angleId]).toBeDefined();
    });

    it('cascades deletion cleanly when one of the ray points is deleted', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const pAId = store.addCircumferencePoint(circleId, 0, 'A');
      const pBId = store.addCircumferencePoint(circleId, 1, 'B');
      const angleId = store.addAngle(circleId, pAId, `center_${circleId}`, pBId, true);

      expect(useCircleStore.getState().angles[angleId]).toBeDefined();

      // Delete point A
      store.deleteObject(pAId, 'point');

      // Angle should be automatically deleted because point A was removed
      expect(useCircleStore.getState().angles[angleId]).toBeUndefined();
    });

    it('allows deleting an angle directly without affecting parent circle or points', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      const pAId = store.addCircumferencePoint(circleId, 0, 'A');
      const pBId = store.addCircumferencePoint(circleId, 1, 'B');
      const angleId = store.addAngle(circleId, pAId, `center_${circleId}`, pBId, true);

      expect(useCircleStore.getState().angles[angleId]).toBeDefined();

      // Delete angle directly
      store.deleteObject(angleId, 'angle');

      expect(useCircleStore.getState().angles[angleId]).toBeUndefined();
      // Circle and points must remain intact
      expect(useCircleStore.getState().circles[circleId]).toBeDefined();
      expect(useCircleStore.getState().circumferencePoints[pAId]).toBeDefined();
      expect(useCircleStore.getState().circumferencePoints[pBId]).toBeDefined();
    });
  });
});


