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
} from '../engine/mathematics/circles/types';
import { CIRCLE_EXPERIMENTS } from '../engine/mathematics/circles/circleExperiments';
import {
  calculateOppositeDiameterPoint,
  computeConstructionBoundingBox,
  calculateFitViewport,
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

  // Selection
  selectedId: string | null;
  selectedType: 'circle' | 'point' | 'chord' | 'radius_diameter' | 'angle' | 'tangent' | 'cyclic_quad' | null;

  // History / Undo / Redo
  history: CircleSceneSnapshot[];
  historyIndex: number;

  // Investigation & Practice state
  investigationStepIndex: number;
  practiceAnswers: Record<string, { userAnswer: string; isCorrect: boolean }>;

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

  // Practice runner
  submitPracticeAnswer: (questionId: string, answer: string, isCorrect: boolean) => void;
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

    investigationStepIndex: 0,
    practiceAnswers: {},

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
        investigationStepIndex: 0,
      });
    },

    setMode: (mode) => set({ mode }),
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
      const newAngle: CircleAngleMeasurement = {
        id,
        name: isCentral ? 'Central Angle' : 'Inscribed Angle',
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

    submitPracticeAnswer: (questionId, answer, isCorrect) => {
      set((state) => ({
        practiceAnswers: {
          ...state.practiceAnswers,
          [questionId]: { userAnswer: answer, isCorrect },
        },
      }));
    },
  };
});
