/**
 * Unit & Integration Tests for Class 9 Circles Laboratory — Milestone M2.4
 *
 * Validates:
 * 1. Part A: Progressive Investigate Mode (6 Stages, Predictions, Manipulation Tracking, Dynamic Observations, Stepwise Proofs)
 * 2. Part B: Practice Engine Redesign (Authoritative Diagram Synchronization, Isolated Scenes, Answer Types, Locked Elements)
 * 3. Part C: Circle Resizing & Dependency Integrity (Numerical, Slider, Points/Chords Constraint Maintenance, Undo/Redo)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCircleStore } from '../../../../store/useCircleStore';
import { CHAPTER_PRACTICE_BANK } from '../practiceBank';
import {
  calculateChordMetrics,
  getCircumferenceCoords,
  validatePracticeAnswer,
} from '../geometry';

describe('Circles Milestone M2.4: Investigation Experience, Practice Engine & Resizing', () => {
  beforeEach(() => {
    useCircleStore.getState().setExperiment('understanding-circle');
    useCircleStore.getState().setMode('explore');
  });

  // =========================================================================
  // PART A: PROGRESSIVE INVESTIGATE MODE
  // =========================================================================
  describe('Part A: Progressive Investigation Experience', () => {
    it('initializes in the "understand" stage without prematurely revealing proof conclusions', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');
      expect(useCircleStore.getState().investigationStage).toBe('understand');
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(0);
      expect(useCircleStore.getState().capturedObservations).toHaveLength(0);
    });

    it('navigates through progressive stages while retaining student predictions', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');

      // 1. Understand -> 2. Predict
      store.setInvestigationStage('predict');
      expect(useCircleStore.getState().investigationStage).toBe('predict');

      // Submit conceptual prediction
      store.submitInvestigationPrediction(
        'understanding-circle',
        'It remains constant and equal to radius r'
      );
      expect(
        useCircleStore.getState().investigationPredictions['understanding-circle']
      ).toBe('It remains constant and equal to radius r');

      // 2. Predict -> 3. Experiment
      store.setInvestigationStage('experiment');
      expect(useCircleStore.getState().investigationStage).toBe('experiment');

      // Back navigation without losing prediction
      store.setInvestigationStage('predict');
      expect(
        useCircleStore.getState().investigationPredictions['understanding-circle']
      ).toBe('It remains constant and equal to radius r');
    });

    it('tracks meaningful manipulation requiring at least 25 degrees angular separation', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');
      store.setInvestigationStage('experiment');

      // 1st position (0 rad)
      store.recordManipulationAngle(0);
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(1);

      // Jitter / micro-movement (<25 deg = 0.436 rad) is rejected
      store.recordManipulationAngle(0.1);
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(1);

      // 2nd distinct position (45 deg = 0.785 rad)
      store.recordManipulationAngle(0.785);
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(2);

      // 3rd distinct position (135 deg = 2.356 rad)
      store.recordManipulationAngle(2.356);
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(3);
    });

    it('allows teacher demonstration bypass without faking completed positions', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');
      store.setInvestigationStage('experiment');

      expect(useCircleStore.getState().investigationTeacherBypassed).toBe(false);
      store.bypassInvestigationGate();
      expect(useCircleStore.getState().investigationTeacherBypassed).toBe(true);
      // Actual student manipulation array remains empty (honest reporting)
      expect(useCircleStore.getState().manipulationPositionsRecorded).toHaveLength(0);
    });

    it('dynamically captures geometric observations derived from live mathematical engine', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');
      store.setInvestigationStage('observe');

      // Capture initial state
      store.captureCurrentObservation();
      const obs1 = useCircleStore.getState().capturedObservations;
      expect(obs1).toHaveLength(1);
      expect(obs1[0]?.measurements?.['Radius (r)']).toBe('4.0 cm');
      expect(obs1[0]?.measurements?.['Dist OA']).toBe('4.0 cm');

      // Change circle radius and point position
      const circleId = Object.keys(store.circles)[0];
      store.setCircleRadius(circleId, 6.0);
      store.updateCircumferencePoint('pt_A', Math.PI / 2); // 90°

      // Capture 2nd state
      store.captureCurrentObservation();
      const obs2 = useCircleStore.getState().capturedObservations;
      expect(obs2).toHaveLength(2);
      expect(obs2[1]?.measurements?.['Radius (r)']).toBe('6.0 cm');
      expect(obs2[1]?.measurements?.['Angle A']).toBe('90°');

      // Clear observations
      store.clearObservations();
      expect(useCircleStore.getState().capturedObservations).toHaveLength(0);
    });

    it('progresses through stepwise Euclidean proof and handles missing-reason validation', () => {
      const store = useCircleStore.getState();
      store.setExperiment('equal-chords-central-angles');
      store.setMode('investigate');
      store.setInvestigationStage('prove_or_conclude');

      expect(useCircleStore.getState().proofStepIndex).toBe(0);

      // Step 0 missing reason selection
      store.selectMissingReason(0, 'Radii of the same circle');
      expect(useCircleStore.getState().selectedMissingReasons[0]).toBe('Radii of the same circle');

      // Step advancement
      store.nextProofStep();
      expect(useCircleStore.getState().proofStepIndex).toBe(1);

      // Previous step
      store.prevProofStep();
      expect(useCircleStore.getState().proofStepIndex).toBe(0);
    });

    it('resets investigation cleanly without corrupting explore scene', () => {
      const store = useCircleStore.getState();
      store.setMode('investigate');
      store.setInvestigationStage('observe');
      store.captureCurrentObservation();
      store.bypassInvestigationGate();

      store.resetInvestigation();
      const s = useCircleStore.getState();
      expect(s.investigationStage).toBe('understand');
      expect(s.capturedObservations).toHaveLength(0);
      expect(s.manipulationPositionsRecorded).toHaveLength(0);
      expect(s.investigationTeacherBypassed).toBe(false);
    });
  });

  // =========================================================================
  // PART B: PRACTICE ENGINE & DIAGRAM SYNCHRONIZATION
  // =========================================================================
  describe('Part B: Practice Engine & Diagram Synchronization', () => {
    it('isolates practice scene and strictly synchronizes diagram geometry with question givens', () => {
      const store = useCircleStore.getState();

      // In Explore: create custom circle with radius 3.2
      const customCircleId = store.addCircle({ x: 1, y: 1 }, 3.2);

      // Switch to Practice mode
      store.setMode('practice');
      expect(useCircleStore.getState().mode).toBe('practice');

      // Verify that Explore scene is snapshotted safely
      expect(useCircleStore.getState().exploreSceneSnapshot?.circles[customCircleId]).toBeDefined();

      // Load chord distance question: r = 5, chord AB = 8
      store.loadPracticeQuestion('q_chord_perp_pythagoras');
      const state = useCircleStore.getState();

      // Active diagram circle MUST have radius = 5.0 (matching question givens)
      const qCircle = Object.values(state.circles)[0];
      expect(qCircle).toBeDefined();
      expect(qCircle.radius).toBe(5.0);

      // Active chord AB length MUST be 8.0 cm
      const chord = Object.values(state.chords)[0];
      const ptA = state.circumferencePoints[chord.pointAId];
      const ptB = state.circumferencePoints[chord.pointBId];
      const posA = getCircumferenceCoords(qCircle, ptA.angleRad);
      const posB = getCircumferenceCoords(qCircle, ptB.angleRad);
      const metrics = calculateChordMetrics(qCircle, posA, posB);
      expect(metrics.length).toBeCloseTo(8.0, 1);
      expect(metrics.distFromCenter).toBeCloseTo(3.0, 1); // Pythagoras: 5^2 - 4^2 = 3^2
    });

    it('restores student Explore construction completely when returning from Practice mode', () => {
      const store = useCircleStore.getState();
      const originalCircleId = store.addCircle({ x: 2, y: 3 }, 4.7);

      store.setMode('practice');
      expect(useCircleStore.getState().circles[originalCircleId]).toBeUndefined();

      store.setMode('explore');
      const restoredState = useCircleStore.getState();
      expect(restoredState.circles[originalCircleId]).toBeDefined();
      expect(restoredState.circles[originalCircleId].radius).toBe(4.7);
      expect(restoredState.exploreSceneSnapshot).toBeNull();
    });

    it('validates numerical answers with tolerance and units', () => {
      const store = useCircleStore.getState();
      store.setMode('practice');
      store.loadPracticeQuestion('q_chord_perp_pythagoras'); // Correct answer is "8 cm"

      // Correct answer with unit
      store.submitPracticeAnswer('q_chord_perp_pythagoras', '8 cm', true);
      expect(useCircleStore.getState().practiceAnswers['q_chord_perp_pythagoras'].isCorrect).toBe(true);

      // Helper geometry function validation check
      expect(validatePracticeAnswer('8', '8 cm', 0.1)).toBe(true);
      expect(validatePracticeAnswer('8.0 cm', '8 cm', 0.1)).toBe(true);
      expect(validatePracticeAnswer('4 cm', '8 cm', 0.1)).toBe(false);
    });

    it('supports progressive hints and worked solution reveals', () => {
      const store = useCircleStore.getState();
      store.setMode('practice');
      const qId = 'q_chord_perp_pythagoras';

      expect(useCircleStore.getState().practiceAnswers[qId]?.hintsRevealed).toBeUndefined();

      store.revealPracticeHint(qId);
      expect(useCircleStore.getState().practiceAnswers[qId].hintsRevealed).toBe(1);

      store.revealPracticeHint(qId);
      expect(useCircleStore.getState().practiceAnswers[qId].hintsRevealed).toBe(2);

      store.togglePracticeSolution(qId);
      expect(useCircleStore.getState().practiceAnswers[qId].showSolution).toBe(true);

      store.retryPracticeQuestion(qId);
      expect(useCircleStore.getState().practiceAnswers[qId]).toBeUndefined();
    });

    it('enforces locked elements in Practice mode', () => {
      const store = useCircleStore.getState();
      store.setMode('practice');
      store.loadPracticeQuestion('q_chord_perp_pythagoras');

      const lockedIds = useCircleStore.getState().lockedElementIds;
      expect(lockedIds.length).toBeGreaterThan(0);
      expect(lockedIds).toContain('prac_circle');
      expect(lockedIds).toContain('pA');
      expect(lockedIds).toContain('pB');
    });

    it('navigates practice questions by difficulty and topic', () => {
      const store = useCircleStore.getState();
      store.setMode('practice');

      store.setPracticeDifficulty('challenge');
      expect(useCircleStore.getState().activePracticeDifficulty).toBe('challenge');
      const activeQ = CHAPTER_PRACTICE_BANK.find(
        (q) => q.id === useCircleStore.getState().activePracticeQuestionId
      );
      expect(activeQ?.difficulty).toBe('challenge');

      store.setPracticeDifficulty('all');
      store.nextPracticeQuestion();
      expect(useCircleStore.getState().activePracticeQuestionId).toBeDefined();
    });
  });

  // =========================================================================
  // PART C: CIRCLE RESIZING & CANVAS IMPROVEMENTS
  // =========================================================================
  describe('Part C: Circle Resizing & Invariant Dependencies', () => {
    it('resizes circle radius while preserving circumference point angular positions', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const ptA = store.circumferencePoints['pt_A'];
      const originalAngle = ptA.angleRad;

      // Resize circle from 4.0 to 6.5
      store.setCircleRadius(circleId, 6.5);
      const updatedCircle = useCircleStore.getState().circles[circleId];
      expect(updatedCircle.radius).toBe(6.5);

      // Angle of point A remains identical
      const updatedPtA = useCircleStore.getState().circumferencePoints['pt_A'];
      expect(updatedPtA.angleRad).toBe(originalAngle);

      // World coordinates scaled with the new radius
      const posA = getCircumferenceCoords(updatedCircle, updatedPtA.angleRad);
      const dist = Math.hypot(posA.x - updatedCircle.center.x, posA.y - updatedCircle.center.y);
      expect(dist).toBeCloseTo(6.5, 4);
    });

    it('validates minimum positive radius preventing negative or degenerate dimensions', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];

      // Negative radius input clamped to 1.0
      store.setCircleRadius(circleId, -5.0);
      expect(useCircleStore.getState().circles[circleId].radius).toBe(1.0);

      // Zero clamped to 1.0
      store.setCircleRadius(circleId, 0);
      expect(useCircleStore.getState().circles[circleId].radius).toBe(1.0);
    });

    it('automatically scales chords and diameters when circle is resized', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const c = store.circles[circleId];

      const pt1 = store.circumferencePoints['pt_A'];
      const pt2 = store.circumferencePoints['pt_B'];
      const pos1 = getCircumferenceCoords(c, pt1.angleRad);
      const pos2 = getCircumferenceCoords(c, pt2.angleRad);
      const initialChordLength = calculateChordMetrics(c, pos1, pos2).length;

      // Double the radius
      store.setCircleRadius(circleId, c.radius * 2);
      const newC = useCircleStore.getState().circles[circleId];
      const newPos1 = getCircumferenceCoords(newC, pt1.angleRad);
      const newPos2 = getCircumferenceCoords(newC, pt2.angleRad);
      const newChordLength = calculateChordMetrics(newC, newPos1, newPos2).length;

      // Chord length scales proportionally with radius
      expect(newChordLength).toBeCloseTo(initialChordLength * 2, 2);
    });

    it('commits circle resize as a single undo/redo action', () => {
      const store = useCircleStore.getState();
      const circleId = Object.keys(store.circles)[0];
      const initialRadius = store.circles[circleId].radius;

      store.setCircleRadius(circleId, 7.5);
      expect(useCircleStore.getState().circles[circleId].radius).toBe(7.5);

      // Undo
      store.undo();
      expect(useCircleStore.getState().circles[circleId].radius).toBe(initialRadius);

      // Redo
      store.redo();
      expect(useCircleStore.getState().circles[circleId].radius).toBe(7.5);
    });
  });
});
