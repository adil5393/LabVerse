/**
 * Dedicated Zustand State Store for Class 9 Circles Laboratory (Milestone M2)
 *
 * Independent of Coordinate Geometry:
 * - Isolated circle scene entities (circles, circumference points, chords, angles, tangents, cyclic quads)
 * - Independent undo/redo history stack
 * - Independent tool lifecycle and viewport transformations
 * - Independent experiment and investigation modes
 */

import { create } from 'zustand';
import type {
  CircleObject,
  CircumferencePoint,
  CircleChord,
  CircleRadiusDiameter,
  CircleAngleMeasurement,
  CircleTangent,
  CyclicQuadrilateral,
  FreehandDrawingStroke,
  CircleToolId,
  CircleMode,
  LabelSizePreference,
  CircleViewportTransform,
  CircleConstructionStep,
  WorldPoint,
  InvestigationStageId,
  CapturedObservation,
  PracticeDifficulty,
} from '../engine/mathematics/circles/types';
import { CIRCLE_EXPERIMENTS } from '../engine/mathematics/circles/circleExperiments';
import { CHAPTER_PRACTICE_BANK } from '../engine/mathematics/circles/practiceBank';
import {
  calculateOppositeDiameterPoint,
  computeConstructionBoundingBox,
  calculateFitViewport,
  resolveCirclePointCoords,
  getCircumferenceCoords,
  calculateAngleDegrees,
  calculateChordMetrics,
} from '../engine/mathematics/circles/geometry';

interface CircleSceneSnapshot {
  circles: Record<string, CircleObject>;
  circumferencePoints: Record<string, CircumferencePoint>;
  chords: Record<string, CircleChord>;
  radiusDiameters: Record<string, CircleRadiusDiameter>;
  angles: Record<string, CircleAngleMeasurement>;
  tangents: Record<string, CircleTangent>;
  cyclicQuads: Record<string, CyclicQuadrilateral>;
  drawings: Record<string, FreehandDrawingStroke>;
  selectedId: string | null;
  selectedType: 'circle' | 'point' | 'chord' | 'radius_diameter' | 'angle' | 'tangent' | 'cyclic_quad' | null;
}

interface CircleState {
  currentExperimentId: string;
  mode: CircleMode;
  activeTool: CircleToolId;
  constructionStep: CircleConstructionStep;
  viewport: CircleViewportTransform;
  labelSize: LabelSizePreference;

  // View toggles
  showGrid: boolean;
  showAxes: boolean;
  showCoordinates: boolean;
  showConstructions: boolean;
  snapToGrid: boolean;

  // Geometric Scene Entities
  circles: Record<string, CircleObject>;
  circumferencePoints: Record<string, CircumferencePoint>;
  chords: Record<string, CircleChord>;
  radiusDiameters: Record<string, CircleRadiusDiameter>;
  angles: Record<string, CircleAngleMeasurement>;
  tangents: Record<string, CircleTangent>;
  cyclicQuads: Record<string, CyclicQuadrilateral>;
  drawings: Record<string, FreehandDrawingStroke>;

  // Selection & Protection
  selectedId: string | null;
  selectedType: 'circle' | 'point' | 'chord' | 'radius_diameter' | 'angle' | 'tangent' | 'cyclic_quad' | null;
  lockedElementIds: string[];
  exploreSceneSnapshot: CircleSceneSnapshot | null;

  // History / Undo / Redo
  history: CircleSceneSnapshot[];
  historyIndex: number;

  // Progressive Investigation state (Milestone M2.4 Part A)
  investigationStage: InvestigationStageId;
  investigationPredictions: Record<string, string>;
  manipulationPositionsRecorded: number[];
  capturedObservations: CapturedObservation[];
  proofStepIndex: number;
  selectedMissingReasons: Record<number, string>;
  investigationTeacherBypassed: boolean;

  // Practice Engine state (Milestone M2.4 Part B)
  activePracticeTopicId: string;
  activePracticeDifficulty: PracticeDifficulty | 'all';
  activePracticeQuestionId: string;
  practiceAnswers: Record<string, { userAnswer: string; isCorrect: boolean; showSolution?: boolean; hintsRevealed?: number }>;

  // Actions
  setExperiment: (id: string) => void;
  setMode: (mode: CircleMode) => void;
  setActiveTool: (tool: CircleToolId) => void;
  setConstructionStep: (step: CircleConstructionStep) => void;
  setViewport: (transform: Partial<CircleViewportTransform>) => void;
  setLabelSize: (size: LabelSizePreference) => void;
  fitToConstruction: (canvasWidth: number, canvasHeight: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  toggleCoordinates: () => void;
  toggleConstructions: () => void;
  selectObject: (id: string | null, type?: CircleState['selectedType']) => void;

  // Circle Resizing (Milestone M2.4 Part C)
  setCircleRadius: (circleId: string, radius: number) => void;

  // Entity mutations
  addCircle: (center: WorldPoint, radius: number) => string;
  updateCircle: (id: string, partial: Partial<CircleObject>) => void;
  addCircumferencePoint: (circleId: string, angleRad: number, name?: string) => string;
  updateCircumferencePoint: (id: string, angleRad: number) => void;
  addChord: (circleId: string, pointAId: string, pointBId: string) => string;
  addRadiusDiameter: (circleId: string, type: 'radius' | 'diameter', pointId: string, point2Id?: string) => string;
  addDiameter: (circleId: string, pointId: string) => string;
  addAngle: (circleId: string, point1Id: string, vertexId: string, point2Id: string, isCentral?: boolean) => string;
  addTangent: (circleId: string, contactPointId: string) => string;
  addCyclicQuad: (circleId: string, ptAId: string, ptBId: string, ptCId: string, ptDId: string) => string;

  // Deletion & Reset
  deleteObject: (id: string, type: string) => void;
  deleteSelected: () => void;
  clearCanvas: () => void;
  resetExperiment: () => void;

  // Undo / Redo
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Progressive Investigation actions
  setInvestigationStage: (stage: InvestigationStageId) => void;
  submitInvestigationPrediction: (experimentId: string, prediction: string) => void;
  recordManipulationAngle: (angleRad: number) => void;
  captureCurrentObservation: () => void;
  clearObservations: () => void;
  setProofStepIndex: (index: number) => void;
  nextProofStep: () => void;
  prevProofStep: () => void;
  selectMissingReason: (stepIndex: number, reason: string) => void;
  resetInvestigation: () => void;
  bypassInvestigationGate: () => void;

  // Practice Engine actions
  loadPracticeQuestion: (questionId: string) => void;
  nextPracticeQuestion: () => void;
  prevPracticeQuestion: () => void;
  setPracticeTopic: (topicId: string) => void;
  setPracticeDifficulty: (diff: PracticeDifficulty | 'all') => void;
  submitPracticeAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  revealPracticeHint: (questionId: string) => void;
  togglePracticeSolution: (questionId: string) => void;
  retryPracticeQuestion: (questionId: string) => void;

  // Experiment-specific interactive state & actions
  symmetryRotation: number;
  symmetryReflectionAxis: number;
  symmetryShowRotated: boolean;
  symmetryShowReflected: boolean;
  equalChordsLocked: boolean;
  howManyCirclesPointCount: 1 | 2 | 3;

  setSymmetryRotation: (deg: number) => void;
  setSymmetryReflectionAxis: (deg: number) => void;
  toggleSymmetryShowRotated: () => void;
  toggleSymmetryShowReflected: () => void;
  setEqualChordsLocked: (locked: boolean) => void;
  setHowManyCirclesPointCount: (count: 1 | 2 | 3) => void;
}

function createSceneFromExperiment(experimentId: string): {
  circles: Record<string, CircleObject>;
  circumferencePoints: Record<string, CircumferencePoint>;
  chords: Record<string, CircleChord>;
  radiusDiameters: Record<string, CircleRadiusDiameter>;
  angles: Record<string, CircleAngleMeasurement>;
  tangents: Record<string, CircleTangent>;
  cyclicQuads: Record<string, CyclicQuadrilateral>;
} {
  const exp = CIRCLE_EXPERIMENTS.find((e) => e.id === experimentId) || CIRCLE_EXPERIMENTS[0];
  const circles: Record<string, CircleObject> = {};
  const circumferencePoints: Record<string, CircumferencePoint> = {};
  const chords: Record<string, CircleChord> = {};
  const radiusDiameters: Record<string, CircleRadiusDiameter> = {};
  const angles: Record<string, CircleAngleMeasurement> = {};
  const tangents: Record<string, CircleTangent> = {};
  const cyclicQuads: Record<string, CyclicQuadrilateral> = {};

  exp.initialScene.circles.forEach((c) => (circles[c.id] = { ...c }));
  exp.initialScene.circumferencePoints.forEach((p) => (circumferencePoints[p.id] = { ...p }));
  exp.initialScene.chords.forEach((c) => (chords[c.id] = { ...c }));
  exp.initialScene.radiusDiameters.forEach((r) => (radiusDiameters[r.id] = { ...r }));
  exp.initialScene.angles.forEach((a) => (angles[a.id] = { ...a }));
  exp.initialScene.tangents.forEach((t) => (tangents[t.id] = { ...t }));
  exp.initialScene.cyclicQuads.forEach((q) => (cyclicQuads[q.id] = { ...q }));

  return {
    circles,
    circumferencePoints,
    chords,
    radiusDiameters,
    angles,
    tangents,
    cyclicQuads,
  };
}

export const useCircleStore = create<CircleState>((set, get) => {
  const initialEntities = createSceneFromExperiment('understanding-circle');
  const initialSnapshot: CircleSceneSnapshot = {
    ...initialEntities,
    drawings: {},
    selectedId: null,
    selectedType: null,
  };

  return {
    currentExperimentId: 'understanding-circle',
    mode: 'explore',
    activeTool: 'select',
    constructionStep: { type: 'idle' },
    viewport: { zoom: 55, panX: 0, panY: 0 },
    labelSize: 'normal',

    showGrid: true,
    showAxes: true,
    showCoordinates: true,
    showConstructions: true,
    snapToGrid: false,

    ...initialEntities,
    drawings: {},
    selectedId: null,
    selectedType: null,

    history: [initialSnapshot],
    historyIndex: 0,

    lockedElementIds: [],
    exploreSceneSnapshot: null,

    // Progressive Investigation State
    investigationStage: 'understand',
    investigationPredictions: {},
    manipulationPositionsRecorded: [],
    capturedObservations: [],
    proofStepIndex: 0,
    selectedMissingReasons: {},
    investigationTeacherBypassed: false,

    // Practice Engine State
    activePracticeTopicId: 'all',
    activePracticeDifficulty: 'all',
    activePracticeQuestionId: CHAPTER_PRACTICE_BANK[0]?.id || 'q_ncert_def_1',
    practiceAnswers: {},

    // Experiment-specific interactive state & actions
    symmetryRotation: 45,
    symmetryReflectionAxis: 0,
    symmetryShowRotated: true,
    symmetryShowReflected: true,
    equalChordsLocked: true,
    howManyCirclesPointCount: 3,

    setSymmetryRotation: (deg) => set({ symmetryRotation: deg }),
    setSymmetryReflectionAxis: (deg) => set({ symmetryReflectionAxis: deg }),
    toggleSymmetryShowRotated: () => set((state) => ({ symmetryShowRotated: !state.symmetryShowRotated })),
    toggleSymmetryShowReflected: () => set((state) => ({ symmetryShowReflected: !state.symmetryShowReflected })),
    setEqualChordsLocked: (locked) => set({ equalChordsLocked: locked }),
    setHowManyCirclesPointCount: (count) => set({ howManyCirclesPointCount: count }),

    pushHistory: () => {
      const state = get();
      const snapshot: CircleSceneSnapshot = {
        circles: { ...state.circles },
        circumferencePoints: { ...state.circumferencePoints },
        chords: { ...state.chords },
        radiusDiameters: { ...state.radiusDiameters },
        angles: { ...state.angles },
        tangents: { ...state.tangents },
        cyclicQuads: { ...state.cyclicQuads },
        drawings: { ...state.drawings },
        selectedId: state.selectedId,
        selectedType: state.selectedType,
      };

      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(snapshot);
      if (newHistory.length > 50) newHistory.shift();

      set({
        history: newHistory,
        historyIndex: newHistory.length - 1,
      });
    },

    setExperiment: (id) => {
      const entities = createSceneFromExperiment(id);
      const snapshot: CircleSceneSnapshot = {
        ...entities,
        drawings: {},
        selectedId: null,
        selectedType: null,
      };
      set({
        currentExperimentId: id,
        ...entities,
        drawings: {},
        selectedId: null,
        selectedType: null,
        history: [snapshot],
        historyIndex: 0,
        activeTool: 'select',
        constructionStep: { type: 'idle' },
        investigationStage: 'understand',
        manipulationPositionsRecorded: [],
        capturedObservations: [],
        proofStepIndex: 0,
        selectedMissingReasons: {},
        investigationTeacherBypassed: false,
      });
    },

    setMode: (nextMode) => {
      const state = get();
      if (state.mode === nextMode) return;

      // 1. Transitioning into Practice Mode: isolate explore scene and load practice question diagram
      if (nextMode === 'practice' && state.mode !== 'practice') {
        const exploreSnapshot: CircleSceneSnapshot = {
          circles: { ...state.circles },
          circumferencePoints: { ...state.circumferencePoints },
          chords: { ...state.chords },
          radiusDiameters: { ...state.radiusDiameters },
          angles: { ...state.angles },
          tangents: { ...state.tangents },
          cyclicQuads: { ...state.cyclicQuads },
          drawings: { ...state.drawings },
          selectedId: state.selectedId,
          selectedType: state.selectedType,
        };

        const qId = state.activePracticeQuestionId || CHAPTER_PRACTICE_BANK[0]?.id;
        const q = CHAPTER_PRACTICE_BANK.find((item) => item.id === qId) || CHAPTER_PRACTICE_BANK[0];

        const practiceCircles: Record<string, CircleObject> = {};
        const practicePoints: Record<string, CircumferencePoint> = {};
        const practiceChords: Record<string, CircleChord> = {};
        const practiceRadii: Record<string, CircleRadiusDiameter> = {};
        const practiceAngles: Record<string, CircleAngleMeasurement> = {};
        const practiceTangents: Record<string, CircleTangent> = {};
        const practiceQuads: Record<string, CyclicQuadrilateral> = {};

        if (q.diagram) {
          q.diagram.circles.forEach((c) => (practiceCircles[c.id] = { ...c }));
          q.diagram.circumferencePoints.forEach((p) => (practicePoints[p.id] = { ...p }));
          q.diagram.chords.forEach((c) => (practiceChords[c.id] = { ...c }));
          q.diagram.radiusDiameters.forEach((r) => (practiceRadii[r.id] = { ...r }));
          q.diagram.angles.forEach((a) => (practiceAngles[a.id] = { ...a }));
          q.diagram.tangents.forEach((t) => (practiceTangents[t.id] = { ...t }));
          q.diagram.cyclicQuads.forEach((k) => (practiceQuads[k.id] = { ...k }));
        }

        set({
          mode: 'practice',
          exploreSceneSnapshot: exploreSnapshot,
          activePracticeQuestionId: q.id,
          circles: practiceCircles,
          circumferencePoints: practicePoints,
          chords: practiceChords,
          radiusDiameters: practiceRadii,
          angles: practiceAngles,
          tangents: practiceTangents,
          cyclicQuads: practiceQuads,
          lockedElementIds: q.diagram?.lockedElementIds || [],
          selectedId: null,
          selectedType: null,
          activeTool: 'select',
        });
        return;
      }

      // 2. Transitioning out of Practice Mode: restore intact explore scene
      if (state.mode === 'practice' && nextMode !== 'practice') {
        if (state.exploreSceneSnapshot) {
          set({
            mode: nextMode,
            ...state.exploreSceneSnapshot,
            exploreSceneSnapshot: null,
            lockedElementIds: [],
            selectedId: null,
            selectedType: null,
          });
          return;
        }
      }

      set({ mode: nextMode });
    },
    setActiveTool: (activeTool) => set({ activeTool, constructionStep: { type: 'idle' } }),
    setConstructionStep: (constructionStep) => set({ constructionStep }),
    setViewport: (transform) =>
      set((state) => ({ viewport: { ...state.viewport, ...transform } })),
    setLabelSize: (labelSize) => set({ labelSize }),

    fitToConstruction: (canvasWidth: number, canvasHeight: number) => {
      const state = get();
      const circleList = Object.values(state.circles);
      const pointsList = Object.values(state.circumferencePoints).map((pt) => {
        const c = state.circles[pt.circleId];
        if (!c) return { x: 0, y: 0 };
        return {
          x: c.center.x + c.radius * Math.cos(pt.angleRad),
          y: c.center.y + c.radius * Math.sin(pt.angleRad),
        };
      });

      const bounds = computeConstructionBoundingBox(circleList, pointsList);
      const fit = calculateFitViewport(bounds, canvasWidth, canvasHeight, 90);
      set({ viewport: fit });
    },

    zoomIn: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.min(130, Math.round(state.viewport.zoom * 1.2)),
        },
      })),

    zoomOut: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.max(18, Math.round(state.viewport.zoom / 1.2)),
        },
      })),

    resetZoom: () =>
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: 55,
          panX: 0,
          panY: 0,
        },
      })),

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
    toggleCoordinates: () => set((state) => ({ showCoordinates: !state.showCoordinates })),
    toggleConstructions: () => set((state) => ({ showConstructions: !state.showConstructions })),
    selectObject: (selectedId, selectedType = null) => set({ selectedId, selectedType }),

    addCircle: (center, radius) => {
      const id = `circle_${Date.now()}`;
      const count = Object.keys(get().circles).length + 1;
      const newCircle: CircleObject = {
        id,
        name: `Circle ${count}`,
        center,
        radius: Math.max(0.5, radius),
        color: '#38bdf8',
        fillAlpha: 0.05,
      };
      set((state) => ({
        circles: { ...state.circles, [id]: newCircle },
        selectedId: id,
        selectedType: 'circle',
      }));
      get().pushHistory();
      return id;
    },

    updateCircle: (id, partial) => {
      set((state) => {
        if (!state.circles[id]) return state;
        return {
          circles: {
            ...state.circles,
            [id]: { ...state.circles[id], ...partial },
          },
        };
      });
    },

    addCircumferencePoint: (circleId, angleRad, name) => {
      const id = `pt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const ptCount = Object.keys(get().circumferencePoints).length;
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const pointName = name || letters[ptCount % letters.length] || `P${ptCount + 1}`;

      const newPoint: CircumferencePoint = {
        id,
        name: pointName,
        circleId,
        angleRad,
        color: '#38bdf8',
      };
      set((state) => ({
        circumferencePoints: { ...state.circumferencePoints, [id]: newPoint },
        selectedId: id,
        selectedType: 'point',
      }));
      get().pushHistory();
      return id;
    },

    updateCircumferencePoint: (id, angleRad) => {
      set((state) => {
        if (!state.circumferencePoints[id]) return state;
        const updatedPoints: Record<string, CircumferencePoint> = {
          ...state.circumferencePoints,
          [id]: { ...state.circumferencePoints[id], angleRad },
        };

        // Maintain diametrical constraint: if point is part of a diameter, update opposite point
        Object.values(state.radiusDiameters).forEach((item) => {
          if (item.type === 'diameter') {
            const oppId =
              item.pointId === id ? item.point2Id : item.point2Id === id ? item.pointId : null;
            if (oppId && updatedPoints[oppId]) {
              let oppAngle = (angleRad + Math.PI) % (2 * Math.PI);
              if (oppAngle < 0) oppAngle += 2 * Math.PI;
              updatedPoints[oppId] = {
                ...updatedPoints[oppId],
                angleRad: Number(oppAngle.toFixed(4)),
              };
            }
          }
        });

        // In Equal Chords experiment: if equalChordsLocked, sync angular span between AB and CD
        if (state.currentExperimentId === 'equal-chords-central-angles' && state.equalChordsLocked) {
          if ((id === 'pt_A' || id === 'pt_B') && updatedPoints['pt_A'] && updatedPoints['pt_B'] && updatedPoints['pt_C'] && updatedPoints['pt_D']) {
            let spanAB = (updatedPoints['pt_B'].angleRad - updatedPoints['pt_A'].angleRad) % (2 * Math.PI);
            if (spanAB < 0) spanAB += 2 * Math.PI;
            if (spanAB > Math.PI) spanAB = 2 * Math.PI - spanAB;
            const newAngleD = (updatedPoints['pt_C'].angleRad + spanAB) % (2 * Math.PI);
            updatedPoints['pt_D'] = { ...updatedPoints['pt_D'], angleRad: Number(newAngleD.toFixed(4)) };
          }
        }

        return {
          circumferencePoints: updatedPoints,
        };
      });
    },

    addChord: (circleId, pointAId, pointBId) => {
      const id = `chord_${Date.now()}`;
      const ptA = get().circumferencePoints[pointAId];
      const ptB = get().circumferencePoints[pointBId];
      const name = ptA && ptB ? `Chord ${ptA.name}${ptB.name}` : `Chord`;

      const newChord: CircleChord = {
        id,
        name,
        circleId,
        pointAId,
        pointBId,
        color: '#f59e0b',
        showMidpoint: true,
        showPerpendicular: true,
      };
      set((state) => ({
        chords: { ...state.chords, [id]: newChord },
        selectedId: id,
        selectedType: 'chord',
      }));
      get().pushHistory();
      return id;
    },

    addRadiusDiameter: (circleId, type, pointId, point2Id) => {
      const id = `${type}_${Date.now()}`;
      const pt = get().circumferencePoints[pointId];
      const name = type === 'radius' ? `Radius O${pt?.name || ''}` : `Diameter`;

      const newItem: CircleRadiusDiameter = {
        id,
        name,
        circleId,
        type,
        pointId,
        point2Id,
        color: '#38bdf8',
      };
      set((state) => ({
        radiusDiameters: { ...state.radiusDiameters, [id]: newItem },
        selectedId: id,
        selectedType: 'radius_diameter',
      }));
      get().pushHistory();
      return id;
    },

    addDiameter: (circleId, pointId) => {
      const circle = get().circles[circleId];
      const ptA = get().circumferencePoints[pointId];
      if (!circle || !ptA) return '';

      // Calculate opposite point A' coordinates & angle
      const worldA = {
        x: circle.center.x + circle.radius * Math.cos(ptA.angleRad),
        y: circle.center.y + circle.radius * Math.sin(ptA.angleRad),
      };
      const opp = calculateOppositeDiameterPoint(circle, worldA);

      // Create diametrically opposite point
      const oppPointId = `pt_${Date.now()}_opp`;
      const oppPointName = `${ptA.name}'`;
      const newOppPoint: CircumferencePoint = {
        id: oppPointId,
        name: oppPointName,
        circleId,
        angleRad: opp.oppositeAngleRad,
        color: '#38bdf8',
      };

      const diameterId = `diameter_${Date.now()}`;
      const newDiameter: CircleRadiusDiameter = {
        id: diameterId,
        name: `Diameter ${ptA.name}${oppPointName}`,
        circleId,
        type: 'diameter',
        pointId,
        point2Id: oppPointId,
        color: '#38bdf8',
      };

      set((state) => ({
        circumferencePoints: {
          ...state.circumferencePoints,
          [oppPointId]: newOppPoint,
        },
        radiusDiameters: {
          ...state.radiusDiameters,
          [diameterId]: newDiameter,
        },
        selectedId: diameterId,
        selectedType: 'radius_diameter',
      }));
      get().pushHistory();
      return diameterId;
    },

    addAngle: (circleId, point1Id, vertexId, point2Id, isCentral = false) => {
      const id = `angle_${Date.now()}`;
      const state = get();
      const p1 = resolveCirclePointCoords(point1Id, state.circles, state.circumferencePoints);
      const v = resolveCirclePointCoords(vertexId, state.circles, state.circumferencePoints);
      const p2 = resolveCirclePointCoords(point2Id, state.circles, state.circumferencePoints);
      const name = p1 && v && p2 ? `∠${p1.name}${v.name}${p2.name}` : isCentral ? 'Central Angle' : 'Inscribed Angle';

      const newAngle: CircleAngleMeasurement = {
        id,
        name,
        circleId,
        point1Id,
        vertexId,
        point2Id,
        isCentral,
        color: isCentral ? '#38bdf8' : '#f59e0b',
      };
      set((state) => ({
        angles: { ...state.angles, [id]: newAngle },
        selectedId: id,
        selectedType: 'angle',
      }));
      get().pushHistory();
      return id;
    },

    addTangent: (circleId, contactPointId) => {
      const id = `tangent_${Date.now()}`;
      const pt = get().circumferencePoints[contactPointId];
      const newTangent: CircleTangent = {
        id,
        name: `Tangent at ${pt?.name || 'P'}`,
        circleId,
        contactPointId,
        length: 7.0,
        color: '#f59e0b',
      };
      set((state) => ({
        tangents: { ...state.tangents, [id]: newTangent },
        selectedId: id,
        selectedType: 'tangent',
      }));
      get().pushHistory();
      return id;
    },

    addCyclicQuad: (circleId, ptAId, ptBId, ptCId, ptDId) => {
      const id = `quad_${Date.now()}`;
      const newQuad: CyclicQuadrilateral = {
        id,
        name: 'Cyclic Quadrilateral',
        circleId,
        pointAId: ptAId,
        pointBId: ptBId,
        pointCId: ptCId,
        pointDId: ptDId,
        color: '#38bdf8',
      };
      set((state) => ({
        cyclicQuads: { ...state.cyclicQuads, [id]: newQuad },
        selectedId: id,
        selectedType: 'cyclic_quad',
      }));
      get().pushHistory();
      return id;
    },

    deleteObject: (id, type) => {
      set((state) => {
        const circles = { ...state.circles };
        const circumferencePoints = { ...state.circumferencePoints };
        const chords = { ...state.chords };
        const radiusDiameters = { ...state.radiusDiameters };
        const angles = { ...state.angles };
        const tangents = { ...state.tangents };
        const cyclicQuads = { ...state.cyclicQuads };

        if (type === 'circle') {
          delete circles[id];
          // Delete all dependent circumference points, chords, etc.
          Object.values(circumferencePoints).forEach((p) => {
            if (p.circleId === id) delete circumferencePoints[p.id];
          });
          Object.values(chords).forEach((c) => {
            if (c.circleId === id) delete chords[c.id];
          });
          Object.values(radiusDiameters).forEach((r) => {
            if (r.circleId === id) delete radiusDiameters[r.id];
          });
          Object.values(angles).forEach((a) => {
            if (a.circleId === id) delete angles[a.id];
          });
          Object.values(tangents).forEach((t) => {
            if (t.circleId === id) delete tangents[t.id];
          });
          Object.values(cyclicQuads).forEach((q) => {
            if (q.circleId === id) delete cyclicQuads[q.id];
          });
        } else if (type === 'point') {
          delete circumferencePoints[id];
          // Delete dependent chords and angles referencing this point
          Object.values(chords).forEach((c) => {
            if (c.pointAId === id || c.pointBId === id) delete chords[c.id];
          });
          Object.values(radiusDiameters).forEach((r) => {
            if (r.pointId === id || r.point2Id === id) delete radiusDiameters[r.id];
          });
          Object.values(angles).forEach((a) => {
            if (a.point1Id === id || a.vertexId === id || a.point2Id === id) delete angles[a.id];
          });
          Object.values(tangents).forEach((t) => {
            if (t.contactPointId === id) delete tangents[t.id];
          });
          Object.values(cyclicQuads).forEach((q) => {
            if (q.pointAId === id || q.pointBId === id || q.pointCId === id || q.pointDId === id) {
              delete cyclicQuads[q.id];
            }
          });
        } else if (type === 'chord') {
          delete chords[id];
        } else if (type === 'radius_diameter') {
          delete radiusDiameters[id];
        } else if (type === 'angle') {
          delete angles[id];
        } else if (type === 'tangent') {
          delete tangents[id];
        } else if (type === 'cyclic_quad') {
          delete cyclicQuads[id];
        }

        return {
          circles,
          circumferencePoints,
          chords,
          radiusDiameters,
          angles,
          tangents,
          cyclicQuads,
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedType: state.selectedId === id ? null : state.selectedType,
        };
      });
      get().pushHistory();
    },

    deleteSelected: () => {
      const { selectedId, selectedType } = get();
      if (!selectedId || !selectedType) return;
      get().deleteObject(selectedId, selectedType);
    },

    clearCanvas: () => {
      set({
        circles: {},
        circumferencePoints: {},
        chords: {},
        radiusDiameters: {},
        angles: {},
        tangents: {},
        cyclicQuads: {},
        drawings: {},
        selectedId: null,
        selectedType: null,
      });
      get().pushHistory();
    },

    resetExperiment: () => {
      const { currentExperimentId } = get();
      get().setExperiment(currentExperimentId);
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        const snapshot = history[nextIndex];
        set({
          ...snapshot,
          historyIndex: nextIndex,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        const snapshot = history[nextIndex];
        set({
          ...snapshot,
          historyIndex: nextIndex,
        });
      }
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    setCircleRadius: (circleId, radius) => {
      const safeRadius = Math.max(1.0, Math.min(15.0, Number(radius) || 1.0));
      set((state) => {
        const c = state.circles[circleId];
        if (!c) return state;
        return {
          circles: {
            ...state.circles,
            [circleId]: { ...c, radius: Number(safeRadius.toFixed(2)) },
          },
        };
      });
      get().pushHistory();
    },

    // Progressive Investigation actions (Milestone M2.4 Part A)
    setInvestigationStage: (stage) => set({ investigationStage: stage }),

    submitInvestigationPrediction: (experimentId, prediction) => {
      set((state) => ({
        investigationPredictions: {
          ...state.investigationPredictions,
          [experimentId]: prediction,
        },
      }));
    },

    recordManipulationAngle: (angleRad) => {
      set((state) => {
        const recorded = [...state.manipulationPositionsRecorded];
        const isDistinct = recorded.every((prev) => {
          let diff = Math.abs(prev - angleRad) % (2 * Math.PI);
          if (diff > Math.PI) diff = 2 * Math.PI - diff;
          return diff >= 0.436; // 25 degrees separation
        });
        if (isDistinct) {
          recorded.push(angleRad);
          return { manipulationPositionsRecorded: recorded };
        }
        return state;
      });
    },

    captureCurrentObservation: () => {
      const state = get();
      const primaryCircle = Object.values(state.circles)[0];
      const count = state.capturedObservations.length + 1;
      const metrics: Record<string, string | number> = {};
      let invariantSummary = '';

      if (primaryCircle) {
        metrics['Radius (r)'] = `${primaryCircle.radius.toFixed(1)} cm`;
        const ptA = state.circumferencePoints['pt_A'];
        const ptB = state.circumferencePoints['pt_B'];
        if (ptA) {
          const posA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
          metrics['Point A'] = `(${posA.x.toFixed(1)}, ${posA.y.toFixed(1)})`;
          metrics['Angle A'] = `${((ptA.angleRad * 180) / Math.PI).toFixed(0)}°`;
          metrics['Dist OA'] = `${primaryCircle.radius.toFixed(1)} cm`;
          invariantSummary = `OA = ${primaryCircle.radius.toFixed(1)} cm (Constant radial locus)`;
        }
        if (ptA && ptB) {
          const posA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
          const posB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
          const chordMetrics = calculateChordMetrics(primaryCircle, posA, posB);
          metrics['Chord AB'] = `${chordMetrics.length.toFixed(1)} cm`;
          metrics['Dist from Center'] = `${chordMetrics.distFromCenter.toFixed(1)} cm`;
        }
      }

      const quad = Object.values(state.cyclicQuads)[0];
      if (quad && primaryCircle) {
        const ptA = state.circumferencePoints[quad.pointAId];
        const ptB = state.circumferencePoints[quad.pointBId];
        const ptC = state.circumferencePoints[quad.pointCId];
        const ptD = state.circumferencePoints[quad.pointDId];
        if (ptA && ptB && ptC && ptD) {
          const posA = getCircumferenceCoords(primaryCircle, ptA.angleRad);
          const posB = getCircumferenceCoords(primaryCircle, ptB.angleRad);
          const posC = getCircumferenceCoords(primaryCircle, ptC.angleRad);
          const posD = getCircumferenceCoords(primaryCircle, ptD.angleRad);
          const angA = calculateAngleDegrees(posD, posA, posB);
          const angC = calculateAngleDegrees(posB, posC, posD);
          metrics['∠A'] = `${angA.toFixed(1)}°`;
          metrics['∠C'] = `${angC.toFixed(1)}°`;
          metrics['∠A + ∠C'] = `${(angA + angC).toFixed(1)}°`;
          invariantSummary = `∠A + ∠C = ${(angA + angC).toFixed(1)}° (Opposite angles supplementary)`;
        }
      }

      const newObs: CapturedObservation = {
        id: `obs_${Date.now()}_${count}`,
        trialNumber: count,
        timestamp: Date.now(),
        configurationLabel: `Trial ${count}`,
        measurements: metrics,
        invariantEvaluated: invariantSummary || 'Geometric configuration recorded',
      };

      set((prev) => ({
        capturedObservations: [...prev.capturedObservations, newObs],
      }));
    },

    clearObservations: () => set({ capturedObservations: [] }),

    setProofStepIndex: (index) => set({ proofStepIndex: index }),

    nextProofStep: () => {
      set((state) => ({ proofStepIndex: state.proofStepIndex + 1 }));
    },

    prevProofStep: () => {
      set((state) => ({ proofStepIndex: Math.max(0, state.proofStepIndex - 1) }));
    },

    selectMissingReason: (stepIndex, reason) => {
      set((state) => ({
        selectedMissingReasons: {
          ...state.selectedMissingReasons,
          [stepIndex]: reason,
        },
      }));
    },

    resetInvestigation: () => {
      set({
        investigationStage: 'understand',
        manipulationPositionsRecorded: [],
        capturedObservations: [],
        proofStepIndex: 0,
        selectedMissingReasons: {},
        investigationTeacherBypassed: false,
      });
      get().resetExperiment();
    },

    bypassInvestigationGate: () => {
      set({ investigationTeacherBypassed: true });
    },

    // Practice Engine actions (Milestone M2.4 Part B)
    loadPracticeQuestion: (questionId) => {
      const q = CHAPTER_PRACTICE_BANK.find((item) => item.id === questionId);
      if (!q) return;

      const practiceCircles: Record<string, CircleObject> = {};
      const practicePoints: Record<string, CircumferencePoint> = {};
      const practiceChords: Record<string, CircleChord> = {};
      const practiceRadii: Record<string, CircleRadiusDiameter> = {};
      const practiceAngles: Record<string, CircleAngleMeasurement> = {};
      const practiceTangents: Record<string, CircleTangent> = {};
      const practiceQuads: Record<string, CyclicQuadrilateral> = {};

      if (q.diagram) {
        q.diagram.circles.forEach((c) => (practiceCircles[c.id] = { ...c }));
        q.diagram.circumferencePoints.forEach((p) => (practicePoints[p.id] = { ...p }));
        q.diagram.chords.forEach((c) => (practiceChords[c.id] = { ...c }));
        q.diagram.radiusDiameters.forEach((r) => (practiceRadii[r.id] = { ...r }));
        q.diagram.angles.forEach((a) => (practiceAngles[a.id] = { ...a }));
        q.diagram.tangents.forEach((t) => (practiceTangents[t.id] = { ...t }));
        q.diagram.cyclicQuads.forEach((k) => (practiceQuads[k.id] = { ...k }));
      }

      set({
        activePracticeQuestionId: q.id,
        circles: practiceCircles,
        circumferencePoints: practicePoints,
        chords: practiceChords,
        radiusDiameters: practiceRadii,
        angles: practiceAngles,
        tangents: practiceTangents,
        cyclicQuads: practiceQuads,
        lockedElementIds: q.diagram?.lockedElementIds || [],
        selectedId: null,
        selectedType: null,
      });
    },

    nextPracticeQuestion: () => {
      const state = get();
      const filtered = CHAPTER_PRACTICE_BANK.filter((q) => {
        const matchTopic = state.activePracticeTopicId === 'all' || q.topicId === state.activePracticeTopicId;
        const matchDiff = state.activePracticeDifficulty === 'all' || q.difficulty === state.activePracticeDifficulty;
        return matchTopic && matchDiff;
      });
      if (filtered.length === 0) return;
      const currentIdx = filtered.findIndex((q) => q.id === state.activePracticeQuestionId);
      const nextQ = filtered[(currentIdx + 1) % filtered.length];
      if (nextQ) get().loadPracticeQuestion(nextQ.id);
    },

    prevPracticeQuestion: () => {
      const state = get();
      const filtered = CHAPTER_PRACTICE_BANK.filter((q) => {
        const matchTopic = state.activePracticeTopicId === 'all' || q.topicId === state.activePracticeTopicId;
        const matchDiff = state.activePracticeDifficulty === 'all' || q.difficulty === state.activePracticeDifficulty;
        return matchTopic && matchDiff;
      });
      if (filtered.length === 0) return;
      const currentIdx = filtered.findIndex((q) => q.id === state.activePracticeQuestionId);
      const prevIdx = (currentIdx - 1 + filtered.length) % filtered.length;
      const prevQ = filtered[prevIdx];
      if (prevQ) get().loadPracticeQuestion(prevQ.id);
    },

    setPracticeTopic: (topicId) => {
      set({ activePracticeTopicId: topicId });
      const state = get();
      const filtered = CHAPTER_PRACTICE_BANK.filter((q) => {
        const matchTopic = topicId === 'all' || q.topicId === topicId;
        const matchDiff = state.activePracticeDifficulty === 'all' || q.difficulty === state.activePracticeDifficulty;
        return matchTopic && matchDiff;
      });
      if (filtered.length > 0) {
        get().loadPracticeQuestion(filtered[0].id);
      }
    },

    setPracticeDifficulty: (difficulty) => {
      set({ activePracticeDifficulty: difficulty });
      const state = get();
      const filtered = CHAPTER_PRACTICE_BANK.filter((q) => {
        const matchTopic = state.activePracticeTopicId === 'all' || q.topicId === state.activePracticeTopicId;
        const matchDiff = difficulty === 'all' || q.difficulty === difficulty;
        return matchTopic && matchDiff;
      });
      if (filtered.length > 0) {
        get().loadPracticeQuestion(filtered[0].id);
      }
    },

    submitPracticeAnswer: (questionId, answer, isCorrect) => {
      set((state) => ({
        practiceAnswers: {
          ...state.practiceAnswers,
          [questionId]: {
            ...(state.practiceAnswers[questionId] || {}),
            userAnswer: answer,
            isCorrect,
          },
        },
      }));
    },

    revealPracticeHint: (questionId) => {
      set((state) => {
        const current = state.practiceAnswers[questionId];
        const hintsRevealed = (current?.hintsRevealed || 0) + 1;
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...(current || { userAnswer: '', isCorrect: false, showSolution: false }),
              hintsRevealed,
            },
          },
        };
      });
    },

    togglePracticeSolution: (questionId) => {
      set((state) => {
        const current = state.practiceAnswers[questionId];
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...(current || { userAnswer: '', isCorrect: false, hintsRevealed: 0 }),
              showSolution: !current?.showSolution,
            },
          },
        };
      });
    },

    retryPracticeQuestion: (questionId) => {
      set((state) => {
        const updated = { ...state.practiceAnswers };
        delete updated[questionId];
        return { practiceAnswers: updated };
      });
      get().loadPracticeQuestion(questionId);
    },
  };
});
