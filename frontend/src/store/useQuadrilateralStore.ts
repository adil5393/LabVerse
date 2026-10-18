/**
 * Dedicated Zustand State Store for Class 9 Quadrilaterals Laboratory (Milestone M3)
 * NCERT Ganita Manjari Part II, Chapter 12: Quadrilaterals
 *
 * Fully isolated from Circles and Coordinate Geometry:
 * - Independent scene entities (points, segments, quadrilaterals, triangles, angles, distances, constraints, tiling)
 * - Independent undo/redo history stack
 * - Independent tool lifecycle, pointer interactions, and viewport transformations
 * - Independent progressive investigation and practice engine state
 * - Real-time constraint solver (midpoints, centroids, parallel lines, diagonal intersections)
 */

import { create } from 'zustand';
import type {
  QuadPoint,
  QuadSegment,
  QuadrilateralObject,
  TriangleObject,
  QuadAngleMeasurement,
  QuadDistanceMeasurement,
  QuadConstraint,
  FreehandDrawingStroke,
  TilingConfig,
  QuadToolId,
  QuadMode,
  LabelSizePreference,
  QuadViewportTransform,
  QuadConstructionStep,
  WorldPoint,
  InvestigationStageId,
  CapturedObservation,
  PracticeDifficulty,
  QuadrilateralSceneSnapshot,
  PointRole,
  ConstraintType,
} from '../engine/mathematics/quadrilaterals/types';
import { QUADRILATERAL_EXPERIMENTS } from '../engine/mathematics/quadrilaterals/quadrilateralExperiments';
import { CHAPTER_PRACTICE_BANK } from '../engine/mathematics/quadrilaterals/practiceBank';
import {
  calculateFitViewport,
  solveQuadConstraints,
  classifyQuadrilateral,
  computeVarignonParallelogram,
} from '../engine/mathematics/quadrilaterals/geometry';

interface QuadrilateralState {
  currentExperimentId: string;
  mode: QuadMode;
  activeTool: QuadToolId;
  constructionStep: QuadConstructionStep;
  viewport: QuadViewportTransform;
  labelSize: LabelSizePreference;

  // View toggles
  showGrid: boolean;
  showAxes: boolean;
  showCoordinates: boolean;
  showConstructions: boolean;
  snapToGrid: boolean;

  // Geometric Scene Entities
  points: Record<string, QuadPoint>;
  segments: Record<string, QuadSegment>;
  quadrilaterals: Record<string, QuadrilateralObject>;
  triangles: Record<string, TriangleObject>;
  angles: Record<string, QuadAngleMeasurement>;
  distances: Record<string, QuadDistanceMeasurement>;
  constraints: Record<string, QuadConstraint>;
  drawings: Record<string, FreehandDrawingStroke>;
  tiling: TilingConfig | null;

  // Selection & Protection
  selectedId: string | null;
  selectedType:
    | 'point'
    | 'segment'
    | 'quadrilateral'
    | 'triangle'
    | 'angle'
    | 'distance'
    | 'constraint'
    | null;
  lockedElementIds: string[];
  exploreSceneSnapshot: QuadrilateralSceneSnapshot | null;

  // History / Undo / Redo
  history: QuadrilateralSceneSnapshot[];
  historyIndex: number;

  // Progressive Investigation state
  investigationStage: InvestigationStageId;
  investigationPredictions: Record<string, string>;
  manipulationPositionsRecorded: number;
  capturedObservations: CapturedObservation[];
  proofStepIndex: number;
  selectedMissingReasons: Record<number, string>;
  investigationTeacherBypassed: boolean;

  // Practice Engine state
  activePracticeDifficulty: PracticeDifficulty | 'all';
  activePracticeQuestionId: string;
  practiceAnswers: Record<
    string,
    { userAnswer: string; isCorrect: boolean; showSolution?: boolean; hintsRevealed?: number }
  >;

  // Actions
  setExperiment: (id: string) => void;
  setMode: (mode: QuadMode) => void;
  setActiveTool: (tool: QuadToolId) => void;
  setConstructionStep: (step: QuadConstructionStep) => void;
  setViewport: (transform: Partial<QuadViewportTransform>) => void;
  setLabelSize: (size: LabelSizePreference) => void;
  fitToConstruction: (canvasWidth: number, canvasHeight: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  toggleCoordinates: () => void;
  toggleConstructions: () => void;
  selectObject: (
    id: string | null,
    type?: QuadrilateralState['selectedType']
  ) => void;

  // Entity mutations
  addPoint: (
    pos: WorldPoint,
    name?: string,
    role?: PointRole,
    parents?: string[],
    color?: string
  ) => string;
  updatePoint: (id: string, partial: Partial<QuadPoint>) => void;
  movePoint: (id: string, newPos: WorldPoint) => void;
  addSegment: (
    pointAId: string,
    pointBId: string,
    isDiagonal?: boolean,
    isMedian?: boolean,
    isMidpointConnector?: boolean
  ) => string;
  addQuadrilateral: (
    p1Id: string,
    p2Id: string,
    p3Id: string,
    p4Id: string,
    name?: string
  ) => string;
  addTriangle: (p1Id: string, p2Id: string, p3Id: string, name?: string) => string;
  addAngleMeasurement: (
    point1Id: string,
    vertexId: string,
    point2Id: string,
    isReflex?: boolean
  ) => string;
  toggleAngleReflex: (id: string) => void;
  clearAngleMeasurements: () => void;
  clearDistanceMeasurements: () => void;
  clearAllMeasurements: () => void;
  toggleQuadAnglesVisibility: (quadId?: string) => void;
  addDistanceMeasurement: (pointAId: string, pointBId: string) => string;
  addConstraint: (
    type: ConstraintType,
    targetIds: string[],
    desc: string
  ) => string;
  addParallelSegmentsConstraint: (seg1Id: string, seg2Id: string) => string;
  toggleConstraint: (id: string) => void;
  deleteConstraint: (id: string) => void;
  setTiling: (config: TilingConfig | null) => void;
  toggleTiling: () => void;

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
  recordManipulationAction: () => void;
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
  setPracticeDifficulty: (diff: PracticeDifficulty | 'all') => void;
  submitPracticeAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
  revealPracticeHint: (questionId: string) => void;
  togglePracticeSolution: (questionId: string) => void;
  retryPracticeQuestion: (questionId: string) => void;
}

function createSceneFromExperiment(experimentId: string): {
  points: Record<string, QuadPoint>;
  segments: Record<string, QuadSegment>;
  quadrilaterals: Record<string, QuadrilateralObject>;
  triangles: Record<string, TriangleObject>;
  angles: Record<string, QuadAngleMeasurement>;
  distances: Record<string, QuadDistanceMeasurement>;
  constraints: Record<string, QuadConstraint>;
  tiling: TilingConfig | null;
} {
  const exp =
    QUADRILATERAL_EXPERIMENTS.find((e) => e.id === experimentId) ||
    QUADRILATERAL_EXPERIMENTS[0];

  const points: Record<string, QuadPoint> = {};
  const segments: Record<string, QuadSegment> = {};
  const quadrilaterals: Record<string, QuadrilateralObject> = {};
  const triangles: Record<string, TriangleObject> = {};
  const angles: Record<string, QuadAngleMeasurement> = {};
  const distances: Record<string, QuadDistanceMeasurement> = {};
  const constraints: Record<string, QuadConstraint> = {};

  exp.initialScene.points.forEach((p) => (points[p.id] = { ...p }));
  exp.initialScene.segments.forEach((s) => (segments[s.id] = { ...s }));
  exp.initialScene.quadrilaterals.forEach((q) => (quadrilaterals[q.id] = { ...q }));
  exp.initialScene.triangles.forEach((t) => (triangles[t.id] = { ...t }));
  if (exp.initialScene.angles) {
    exp.initialScene.angles.forEach((a) => (angles[a.id] = { ...a }));
  }
  if (exp.initialScene.distances) {
    exp.initialScene.distances.forEach((d) => (distances[d.id] = { ...d }));
  }
  if (exp.initialScene.constraints) {
    exp.initialScene.constraints.forEach((c) => (constraints[c.id] = { ...c }));
  }

  return {
    points,
    segments,
    quadrilaterals,
    triangles,
    angles,
    distances,
    constraints,
    tiling: exp.initialScene.tiling ? { ...exp.initialScene.tiling } : null,
  };
}

export const useQuadrilateralStore = create<QuadrilateralState>((set, get) => {
  const initialEntities = createSceneFromExperiment('what-is-a-quadrilateral');
  const initialSnapshot: QuadrilateralSceneSnapshot = {
    ...initialEntities,
    drawings: {},
    selectedId: null,
    selectedType: null,
  };

  return {
    currentExperimentId: 'what-is-a-quadrilateral',
    mode: 'explore',
    activeTool: 'select',
    constructionStep: { type: 'idle' },
    viewport: { zoom: 45, panX: 0, panY: 0 },
    labelSize: 'normal',

    showGrid: true,
    showAxes: true,
    showCoordinates: true,
    showConstructions: true,
    snapToGrid: false,

    points: initialEntities.points,
    segments: initialEntities.segments,
    quadrilaterals: initialEntities.quadrilaterals,
    triangles: initialEntities.triangles,
    angles: initialEntities.angles,
    distances: initialEntities.distances,
    constraints: initialEntities.constraints,
    drawings: {},
    tiling: initialEntities.tiling,

    selectedId: null,
    selectedType: null,
    lockedElementIds: [],
    exploreSceneSnapshot: null,

    history: [initialSnapshot],
    historyIndex: 0,

    investigationStage: 'understand',
    investigationPredictions: {},
    manipulationPositionsRecorded: 0,
    capturedObservations: [],
    proofStepIndex: 0,
    selectedMissingReasons: {},
    investigationTeacherBypassed: false,

    activePracticeDifficulty: 'all',
    activePracticeQuestionId: 'quad-q1',
    practiceAnswers: {},

    setExperiment: (id: string) => {
      const entities = createSceneFromExperiment(id);
      const snapshot: QuadrilateralSceneSnapshot = {
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
        investigationStage: 'understand',
        manipulationPositionsRecorded: 0,
        capturedObservations: [],
        proofStepIndex: 0,
        selectedMissingReasons: {},
        investigationTeacherBypassed: false,
      });
    },

    setMode: (mode: QuadMode) => {
      const state = get();
      if (mode === 'practice' && state.mode !== 'practice') {
        const snapshot: QuadrilateralSceneSnapshot = {
          points: state.points,
          segments: state.segments,
          quadrilaterals: state.quadrilaterals,
          triangles: state.triangles,
          angles: state.angles,
          distances: state.distances,
          constraints: state.constraints,
          drawings: state.drawings,
          tiling: state.tiling,
          selectedId: state.selectedId,
          selectedType: state.selectedType,
        };
        set({ mode, exploreSceneSnapshot: snapshot });
        get().loadPracticeQuestion(state.activePracticeQuestionId);
      } else if (mode !== 'practice' && state.mode === 'practice' && state.exploreSceneSnapshot) {
        set({
          mode,
          ...state.exploreSceneSnapshot,
          exploreSceneSnapshot: null,
        });
      } else {
        set({ mode });
      }
    },

    setActiveTool: (tool: QuadToolId) => {
      set({ activeTool: tool, constructionStep: { type: 'idle' } });
    },

    setConstructionStep: (step: QuadConstructionStep) => {
      set({ constructionStep: step });
    },

    setViewport: (transform: Partial<QuadViewportTransform>) => {
      set((state) => ({ viewport: { ...state.viewport, ...transform } }));
    },

    setLabelSize: (size: LabelSizePreference) => {
      set({ labelSize: size });
    },

    fitToConstruction: (canvasWidth: number, canvasHeight: number) => {
      const { points } = get();
      const ptsList = Object.values(points).map((p) => ({ x: p.x, y: p.y }));
      const newVp = calculateFitViewport(ptsList, canvasWidth, canvasHeight);
      set({ viewport: newVp });
    },

    zoomIn: () => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.min(120, state.viewport.zoom * 1.25),
        },
      }));
    },

    zoomOut: () => {
      set((state) => ({
        viewport: {
          ...state.viewport,
          zoom: Math.max(15, state.viewport.zoom / 1.25),
        },
      }));
    },

    resetZoom: () => {
      set((state) => ({
        viewport: { ...state.viewport, zoom: 45, panX: 0, panY: 0 },
      }));
    },

    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
    toggleCoordinates: () => set((state) => ({ showCoordinates: !state.showCoordinates })),
    toggleConstructions: () => set((state) => ({ showConstructions: !state.showConstructions })),

    selectObject: (id, type = null) => {
      set({ selectedId: id, selectedType: type });
    },

    addPoint: (pos, name, role = 'free', parents = [], color = '#38bdf8') => {
      const id = `pt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const ptName = name || `P${Object.keys(get().points).length + 1}`;
      const newPt: QuadPoint = {
        id,
        name: ptName,
        x: pos.x,
        y: pos.y,
        role,
        parentEntityIds: parents,
        color,
      };

      set((state) => {
        const updatedPoints = { ...state.points, [id]: newPt };
        return { points: updatedPoints };
      });
      get().pushHistory();
      return id;
    },

    updatePoint: (id, partial) => {
      set((state) => {
        if (!state.points[id]) return state;
        const updated = {
          ...state.points,
          [id]: { ...state.points[id], ...partial },
        };
        const solved = solveQuadConstraints(
          updated,
          Object.values(state.constraints),
          id,
          state.segments
        );
        return { points: solved };
      });
    },

    movePoint: (id, newPos) => {
      set((state) => {
        const pt = state.points[id];
        if (!pt || pt.locked) return state;

        const updatedPoints = {
          ...state.points,
          [id]: { ...pt, x: newPos.x, y: newPos.y },
        };

        const solvedPoints = solveQuadConstraints(
          updatedPoints,
          Object.values(state.constraints),
          id,
          state.segments
        );

        return {
          points: solvedPoints,
          manipulationPositionsRecorded: state.manipulationPositionsRecorded + 1,
        };
      });
    },

    addSegment: (p1Id, p2Id, isDiagonal = false, isMedian = false, isMidpointConnector = false) => {
      const id = `seg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const p1 = get().points[p1Id];
      const p2 = get().points[p2Id];
      const name = `${p1?.name || 'A'}${p2?.name || 'B'}`;

      const newSeg: QuadSegment = {
        id,
        name,
        pointAId: p1Id,
        pointBId: p2Id,
        isDiagonal,
        isMedian,
        isMidpointConnector,
        color: isDiagonal ? '#f59e0b' : isMedian ? '#a855f7' : '#38bdf8',
        lineStyle: isDiagonal || isMedian ? 'dashed' : 'solid',
      };

      set((state) => ({ segments: { ...state.segments, [id]: newSeg } }));
      get().pushHistory();
      return id;
    },

    addQuadrilateral: (p1Id, p2Id, p3Id, p4Id, name) => {
      const id = `quad_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const pts = get().points;
      const quadName =
        name ||
        `${pts[p1Id]?.name || 'A'}${pts[p2Id]?.name || 'B'}${pts[p3Id]?.name || 'C'}${pts[p4Id]?.name || 'D'}`;

      const newQuad: QuadrilateralObject = {
        id,
        name: quadName,
        p1Id,
        p2Id,
        p3Id,
        p4Id,
        color: '#38bdf8',
        fillAlpha: 0.12,
        showDiagonals: false,
        showAngles: true,
      };

      // Also ensure segments exist
      get().addSegment(p1Id, p2Id);
      get().addSegment(p2Id, p3Id);
      get().addSegment(p3Id, p4Id);
      get().addSegment(p4Id, p1Id);

      set((state) => ({ quadrilaterals: { ...state.quadrilaterals, [id]: newQuad } }));
      get().pushHistory();
      return id;
    },

    addTriangle: (p1Id, p2Id, p3Id, name) => {
      const id = `tri_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const pts = get().points;
      const triName =
        name ||
        `${pts[p1Id]?.name || 'A'}${pts[p2Id]?.name || 'B'}${pts[p3Id]?.name || 'C'}`;

      const newTri: TriangleObject = {
        id,
        name: triName,
        p1Id,
        p2Id,
        p3Id,
        color: '#ec4899',
        fillAlpha: 0.1,
      };

      get().addSegment(p1Id, p2Id);
      get().addSegment(p2Id, p3Id);
      get().addSegment(p3Id, p1Id);

      set((state) => ({ triangles: { ...state.triangles, [id]: newTri } }));
      get().pushHistory();
      return id;
    },

    addAngleMeasurement: (point1Id, vertexId, point2Id, isReflex) => {
      const id = `ang_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const pts = get().points;
      const name = `∠${pts[point1Id]?.name || 'A'}${pts[vertexId]?.name || 'B'}${pts[point2Id]?.name || 'C'}`;

      const newAngle: QuadAngleMeasurement = {
        id,
        name,
        point1Id,
        vertexId,
        point2Id,
        isReflex: isReflex || false,
        color: '#38bdf8',
      };

      set((state) => ({ angles: { ...state.angles, [id]: newAngle } }));
      get().pushHistory();
      return id;
    },

    toggleAngleReflex: (id: string) => {
      set((state) => {
        const ang = state.angles[id];
        if (!ang) return state;
        return {
          angles: {
            ...state.angles,
            [id]: { ...ang, isReflex: !ang.isReflex },
          },
        };
      });
      get().pushHistory();
    },

    clearAngleMeasurements: () => {
      set({ angles: {} });
      get().pushHistory();
    },

    clearDistanceMeasurements: () => {
      set({ distances: {} });
      get().pushHistory();
    },

    clearAllMeasurements: () => {
      set({ angles: {}, distances: {} });
      get().pushHistory();
    },

    toggleQuadAnglesVisibility: (quadId?: string) => {
      set((state) => {
        const targetId = quadId || Object.keys(state.quadrilaterals)[0];
        if (!targetId || !state.quadrilaterals[targetId]) return state;
        const q = state.quadrilaterals[targetId];
        return {
          quadrilaterals: {
            ...state.quadrilaterals,
            [targetId]: { ...q, showAngles: q.showAngles === false ? true : false },
          },
        };
      });
      get().pushHistory();
    },

    addDistanceMeasurement: (pointAId, pointBId) => {
      const id = `dist_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const pts = get().points;
      const name = `${pts[pointAId]?.name || 'A'}${pts[pointBId]?.name || 'B'}`;

      const newDist: QuadDistanceMeasurement = {
        id,
        name,
        pointAId,
        pointBId,
        color: '#a855f7',
      };

      set((state) => ({ distances: { ...state.distances, [id]: newDist } }));
      get().pushHistory();
      return id;
    },

    addConstraint: (type, targetIds, desc) => {
      const id = `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newConstraint: QuadConstraint = {
        id,
        type,
        targetEntityIds: targetIds,
        active: true,
        description: desc,
      };

      set((state) => {
        const updated = { ...state.constraints, [id]: newConstraint };
        const solved = solveQuadConstraints(state.points, Object.values(updated), undefined, state.segments);
        return { constraints: updated, points: solved };
      });
      get().pushHistory();
      return id;
    },

    addParallelSegmentsConstraint: (seg1Id: string, seg2Id: string) => {
      const seg1 = get().segments[seg1Id];
      const seg2 = get().segments[seg2Id];
      const pts = get().points;
      const s1Name = seg1 ? `${pts[seg1.pointAId]?.name || ''}${pts[seg1.pointBId]?.name || ''}` : 'Seg1';
      const s2Name = seg2 ? `${pts[seg2.pointAId]?.name || ''}${pts[seg2.pointBId]?.name || ''}` : 'Seg2';
      const desc = `Parallel Constraint: ${s1Name} ∥ ${s2Name}`;
      return get().addConstraint('parallel_segments', [seg1Id, seg2Id], desc);
    },

    toggleConstraint: (id) => {
      set((state) => {
        const c = state.constraints[id];
        if (!c) return state;
        const updated = {
          ...state.constraints,
          [id]: { ...c, active: !c.active },
        };
        const solved = solveQuadConstraints(state.points, Object.values(updated), undefined, state.segments);
        return { constraints: updated, points: solved };
      });
      get().pushHistory();
    },

    deleteConstraint: (id: string) => {
      set((state) => {
        const updated = { ...state.constraints };
        delete updated[id];
        const solved = solveQuadConstraints(state.points, Object.values(updated), undefined, state.segments);
        return { constraints: updated, points: solved };
      });
      get().pushHistory();
    },

    setTiling: (config) => {
      set({ tiling: config });
    },

    toggleTiling: () => {
      set((state) => {
        if (!state.tiling) {
          const firstQuad = Object.values(state.quadrilaterals)[0];
          if (!firstQuad) return state;
          return {
            tiling: {
              enabled: true,
              rows: 4,
              cols: 5,
              baseQuadId: firstQuad.id,
              showVectors: true,
              showRotationCenters: true,
              opacity: 0.35,
            },
          };
        }
        return {
          tiling: {
            ...state.tiling,
            enabled: !state.tiling.enabled,
          },
        };
      });
    },

    deleteObject: (id, type) => {
      set((state) => {
        const newPoints = { ...state.points };
        const newSegments = { ...state.segments };
        const newQuads = { ...state.quadrilaterals };
        const newTriangles = { ...state.triangles };
        const newAngles = { ...state.angles };
        const newDistances = { ...state.distances };
        const newConstraints = { ...state.constraints };

        if (type === 'point') {
          delete newPoints[id];
          // Delete connected segments
          for (const [sId, s] of Object.entries(newSegments)) {
            if (s.pointAId === id || s.pointBId === id) delete newSegments[sId];
          }
          // Delete connected quads
          for (const [qId, q] of Object.entries(newQuads)) {
            if (q.p1Id === id || q.p2Id === id || q.p3Id === id || q.p4Id === id) delete newQuads[qId];
          }
        } else if (type === 'segment') {
          delete newSegments[id];
        } else if (type === 'quadrilateral') {
          delete newQuads[id];
        } else if (type === 'triangle') {
          delete newTriangles[id];
        } else if (type === 'angle') {
          delete newAngles[id];
        } else if (type === 'distance') {
          delete newDistances[id];
        } else if (type === 'constraint') {
          delete newConstraints[id];
        }

        return {
          points: newPoints,
          segments: newSegments,
          quadrilaterals: newQuads,
          triangles: newTriangles,
          angles: newAngles,
          distances: newDistances,
          constraints: newConstraints,
          selectedId: state.selectedId === id ? null : state.selectedId,
          selectedType: state.selectedId === id ? null : state.selectedType,
        };
      });
      get().pushHistory();
    },

    deleteSelected: () => {
      const { selectedId, selectedType } = get();
      if (selectedId && selectedType) {
        get().deleteObject(selectedId, selectedType);
      }
    },

    clearCanvas: () => {
      set({
        points: {},
        segments: {},
        quadrilaterals: {},
        triangles: {},
        angles: {},
        distances: {},
        constraints: {},
        drawings: {},
        tiling: null,
        selectedId: null,
        selectedType: null,
      });
      get().pushHistory();
    },

    resetExperiment: () => {
      get().setExperiment(get().currentExperimentId);
    },

    // Undo / Redo
    pushHistory: () => {
      const state = get();
      const snapshot: QuadrilateralSceneSnapshot = {
        points: { ...state.points },
        segments: { ...state.segments },
        quadrilaterals: { ...state.quadrilaterals },
        triangles: { ...state.triangles },
        angles: { ...state.angles },
        distances: { ...state.distances },
        constraints: { ...state.constraints },
        drawings: { ...state.drawings },
        tiling: state.tiling ? { ...state.tiling } : null,
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

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        const snapshot = history[nextIdx];
        set({
          ...snapshot,
          historyIndex: nextIdx,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        const snapshot = history[nextIdx];
        set({
          ...snapshot,
          historyIndex: nextIdx,
        });
      }
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Progressive Investigation
    setInvestigationStage: (stage) => set({ investigationStage: stage }),

    submitInvestigationPrediction: (experimentId, prediction) => {
      set((state) => ({
        investigationPredictions: {
          ...state.investigationPredictions,
          [experimentId]: prediction,
        },
      }));
    },

    recordManipulationAction: () => {
      set((state) => ({
        manipulationPositionsRecorded: state.manipulationPositionsRecorded + 1,
      }));
    },

    captureCurrentObservation: () => {
      const state = get();
      const firstQuad = Object.values(state.quadrilaterals)[0];
      const pts = state.points;

      if (firstQuad) {
        const p1 = pts[firstQuad.p1Id];
        const p2 = pts[firstQuad.p2Id];
        const p3 = pts[firstQuad.p3Id];
        const p4 = pts[firstQuad.p4Id];

        if (p1 && p2 && p3 && p4) {
          const analysis = classifyQuadrilateral(p1, p2, p3, p4);
          let metricLabel = `Angles: A=${analysis.interiorAngles[0].toFixed(1)}°, B=${analysis.interiorAngles[1].toFixed(1)}°, C=${analysis.interiorAngles[2].toFixed(1)}°, D=${analysis.interiorAngles[3].toFixed(1)}°`;
          let currentValue = `Sum = ${analysis.angleSum.toFixed(1)}° | Kind: ${analysis.kind.toUpperCase()}`;
          let expectedInvariant = 'Interior angle sum = 360.0°';
          let isConsistent = Math.abs(analysis.angleSum - 360) < 1.0;

          if (!analysis.isSimple) {
            metricLabel = `Configuration: ${analysis.kind.toUpperCase()}`;
            currentValue = analysis.isCrossed
              ? 'Crossed (Self-Intersecting): interior angles undefined'
              : 'Degenerate: 3+ collinear vertices';
            expectedInvariant = 'Requires a simple quadrilateral (Angle Sum Theorem applies to simple polygons)';
            isConsistent = false;
          } else if (!analysis.isConvex && analysis.reflexVertexIndex !== null) {
            const vName = ['A', 'B', 'C', 'D'][analysis.reflexVertexIndex];
            currentValue = `Sum = ${analysis.angleSum.toFixed(1)}° | Reflex at ${vName} (${analysis.interiorAngles[analysis.reflexVertexIndex].toFixed(1)}°)`;
          }

          const obs: CapturedObservation = {
            id: `obs_${Date.now()}`,
            timestamp: Date.now(),
            metricLabel,
            currentValue,
            expectedInvariant,
            isConsistent,
          };
          set((s) => ({ capturedObservations: [...s.capturedObservations, obs] }));
          return;
        }
      }

      // If varignon experiment
      const pP = pts['pP'];
      const pQ = pts['pQ'];
      const pR = pts['pR'];
      const pS = pts['pS'];
      if (pP && pQ && pR && pS) {
        const vGeo = computeVarignonParallelogram(
          pts['pA'] || { x: -4, y: -2 },
          pts['pB'] || { x: 3, y: -3 },
          pts['pC'] || { x: 4, y: 3 },
          pts['pD'] || { x: -2, y: 4 }
        );
        const obs: CapturedObservation = {
          id: `obs_${Date.now()}`,
          timestamp: Date.now(),
          metricLabel: `Varignon Sides: PQ=${vGeo.pqLength.toFixed(2)}, RS=${vGeo.rsLength.toFixed(2)}`,
          currentValue: `Area Ratio = ${vGeo.ratio.toFixed(3)} (50%)`,
          expectedInvariant: 'PQ = RS and Area(PQRS) = 0.5 × Area(ABCD)',
          isConsistent: Math.abs(vGeo.ratio - 0.5) < 0.05,
        };
        set((s) => ({ capturedObservations: [...s.capturedObservations, obs] }));
        return;
      }

      // Fallback observation
      const obs: CapturedObservation = {
        id: `obs_${Date.now()}`,
        timestamp: Date.now(),
        metricLabel: 'Geometric Configuration',
        currentValue: `${Object.keys(pts).length} points, ${Object.keys(state.segments).length} segments`,
        expectedInvariant: 'Preserved Euclidean relations',
        isConsistent: true,
      };
      set((s) => ({ capturedObservations: [...s.capturedObservations, obs] }));
    },

    clearObservations: () => set({ capturedObservations: [] }),

    setProofStepIndex: (index) => set({ proofStepIndex: index }),
    nextProofStep: () => set((s) => ({ proofStepIndex: s.proofStepIndex + 1 })),
    prevProofStep: () => set((s) => ({ proofStepIndex: Math.max(0, s.proofStepIndex - 1) })),

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
        manipulationPositionsRecorded: 0,
        capturedObservations: [],
        proofStepIndex: 0,
        selectedMissingReasons: {},
        investigationTeacherBypassed: false,
      });
    },

    bypassInvestigationGate: () => {
      set({ investigationTeacherBypassed: true });
    },

    // Practice Engine
    loadPracticeQuestion: (questionId) => {
      const q = CHAPTER_PRACTICE_BANK.find((item) => item.id === questionId) || CHAPTER_PRACTICE_BANK[0];
      const pts: Record<string, QuadPoint> = {};
      const segs: Record<string, QuadSegment> = {};
      const quads: Record<string, QuadrilateralObject> = {};

      if (q.diagramGivens) {
        Object.entries(q.diagramGivens.points).forEach(([name, p]) => {
          pts[name] = {
            id: name,
            name,
            x: p.x,
            y: p.y,
            role: 'free',
            locked: true,
            color: '#38bdf8',
          };
        });

        if (q.diagramGivens.segments) {
          q.diagramGivens.segments.forEach((s, idx) => {
            const segId = `seg_${idx}`;
            segs[segId] = {
              id: segId,
              name: s.label || `${s.pointA}${s.pointB}`,
              pointAId: s.pointA,
              pointBId: s.pointB,
              lineStyle: s.style || 'solid',
              color: '#38bdf8',
            };
          });
        }

        if (q.diagramGivens.quadrilateralType) {
          quads['quad_practice'] = {
            id: 'quad_practice',
            name: 'ABCD',
            p1Id: 'A',
            p2Id: 'B',
            p3Id: 'C',
            p4Id: 'D',
            color: '#38bdf8',
            fillAlpha: 0.12,
          };
        }
      }

      set({
        activePracticeQuestionId: q.id,
        points: pts,
        segments: segs,
        quadrilaterals: quads,
        triangles: {},
        angles: {},
        distances: {},
        constraints: {},
        tiling: null,
      });
    },

    nextPracticeQuestion: () => {
      const { activePracticeQuestionId, activePracticeDifficulty } = get();
      const filtered =
        activePracticeDifficulty === 'all'
          ? CHAPTER_PRACTICE_BANK
          : CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === activePracticeDifficulty);

      const idx = filtered.findIndex((q) => q.id === activePracticeQuestionId);
      if (idx >= 0 && idx < filtered.length - 1) {
        get().loadPracticeQuestion(filtered[idx + 1].id);
      }
    },

    prevPracticeQuestion: () => {
      const { activePracticeQuestionId, activePracticeDifficulty } = get();
      const filtered =
        activePracticeDifficulty === 'all'
          ? CHAPTER_PRACTICE_BANK
          : CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === activePracticeDifficulty);

      const idx = filtered.findIndex((q) => q.id === activePracticeQuestionId);
      if (idx > 0) {
        get().loadPracticeQuestion(filtered[idx - 1].id);
      }
    },

    setPracticeDifficulty: (diff) => {
      set({ activePracticeDifficulty: diff });
      const filtered =
        diff === 'all'
          ? CHAPTER_PRACTICE_BANK
          : CHAPTER_PRACTICE_BANK.filter((q) => q.difficulty === diff);
      if (filtered.length > 0) {
        get().loadPracticeQuestion(filtered[0].id);
      }
    },

    submitPracticeAnswer: (questionId, answer, isCorrect) => {
      set((state) => {
        const existing = state.practiceAnswers[questionId] || {
          userAnswer: '',
          isCorrect: false,
          showSolution: false,
          hintsRevealed: 0,
        };
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...existing,
              userAnswer: answer,
              isCorrect,
            },
          },
        };
      });
    },

    revealPracticeHint: (questionId) => {
      set((state) => {
        const existing = state.practiceAnswers[questionId] || {
          userAnswer: '',
          isCorrect: false,
          showSolution: false,
          hintsRevealed: 0,
        };
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...existing,
              hintsRevealed: (existing.hintsRevealed || 0) + 1,
            },
          },
        };
      });
    },

    togglePracticeSolution: (questionId) => {
      set((state) => {
        const existing = state.practiceAnswers[questionId] || {
          userAnswer: '',
          isCorrect: false,
          showSolution: false,
          hintsRevealed: 0,
        };
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...existing,
              showSolution: !existing.showSolution,
            },
          },
        };
      });
    },

    retryPracticeQuestion: (questionId) => {
      set((state) => {
        const existing = state.practiceAnswers[questionId];
        if (!existing) return state;
        return {
          practiceAnswers: {
            ...state.practiceAnswers,
            [questionId]: {
              ...existing,
              userAnswer: '',
              isCorrect: false,
              showSolution: false,
            },
          },
        };
      });
    },
  };
});
