/**
 * Reusable Zustand State Store for LabVerse Mathematics Laboratory
 *
 * Implements authoritative mathematical scene state, construction state machine,
 * active measurements, undo/redo history, viewport transformations, and educational state.
 */

import { create } from 'zustand';
import type {
  MathObject,
  MathPoint,
  MathSegment,
  MathLine,
  MathToolId,
  MathViewportTransform,
  MathSaveFile,
  ConstructionState,
  ActiveMeasurement,
} from '../engine/mathematics/types';
import {
  DISTANCE_EXPERIMENT,
  MATH_EXPERIMENTS,
  type MathExperiment,
} from '../engine/mathematics/experimentRegistry';
import { generateNextPointLabel } from '../engine/mathematics/calculations';

interface HistorySnapshot {
  objects: Record<string, MathObject>;
  objectOrder: string[];
  selectedId: string | null;
  activeMeasurement: ActiveMeasurement | null;
}

interface MathState {
  currentExperimentId: string;
  objects: Record<string, MathObject>;
  objectOrder: string[];
  selectedId: string | null;
  activeTool: MathToolId;
  viewport: MathViewportTransform;
  snapToGrid: boolean;
  gridSnapStep: number;
  showGrid: boolean;
  showAxes: boolean;
  showCoordinates: boolean;
  showConstructions: boolean;

  // Interaction Lifecycle & Construction State
  constructionState: ConstructionState;
  activeMeasurement: ActiveMeasurement | null;

  // Educational Mode
  predictRevealed: boolean;
  studentPrediction: string;
  predictionSubmitted: boolean;

  // Undo / Redo Stacks
  history: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setTool: (tool: MathToolId) => void;
  setViewport: (viewport: Partial<MathViewportTransform>) => void;
  panBy: (deltaScreenX: number, deltaScreenY: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;

  toggleSnapToGrid: () => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  toggleConstructions: () => void;

  selectObject: (id: string | null) => void;
  setPointCoordinates: (id: string, x: number, y: number, recordUndo?: boolean) => void;
  updatePointDrag: (id: string, x: number, y: number) => void;
  commitPointDrag: (id: string) => void;

  // Construction State Machine Actions
  startConstruction: (firstPointId: string) => void;
  updateConstructionPreview: (coord: { x: number; y: number } | null) => void;
  cancelConstruction: () => void;

  // Measurement Actions
  setActiveMeasurement: (measurement: ActiveMeasurement | null) => void;

  // Object Creation & Management
  createPoint: (x: number, y: number) => MathPoint;
  createSegment: (pointAId: string, pointBId: string) => MathSegment | null;
  createLine: (pointAId: string, pointBId: string) => MathLine | null;
  addObject: (object: MathObject) => void;
  deleteObject: (id: string) => void;
  deleteSelectedObject: () => void;
  clearCanvas: () => void;

  undo: () => void;
  redo: () => void;
  resetExperiment: (experimentId?: string) => void;

  loadScene: (saveFile: MathSaveFile) => void;
  exportScene: () => MathSaveFile;

  setStudentPrediction: (val: string) => void;
  submitPrediction: () => void;
  revealSolution: () => void;
  resetPrediction: () => void;
}

const MAX_HISTORY = 30;

function createSnapshot(state: {
  objects: Record<string, MathObject>;
  objectOrder: string[];
  selectedId: string | null;
  activeMeasurement?: ActiveMeasurement | null;
}): HistorySnapshot {
  return {
    objects: JSON.parse(JSON.stringify(state.objects)),
    objectOrder: [...state.objectOrder],
    selectedId: state.selectedId,
    activeMeasurement: state.activeMeasurement ? { ...state.activeMeasurement } : null,
  };
}

function initializeExperiment(experiment: MathExperiment) {
  const objects: Record<string, MathObject> = {};
  const objectOrder: string[] = [];

  for (const obj of experiment.initialObjects) {
    objects[obj.id] = JSON.parse(JSON.stringify(obj));
    objectOrder.push(obj.id);
  }

  return {
    currentExperimentId: experiment.id,
    objects,
    objectOrder,
    selectedId: null,
    activeTool: 'select' as MathToolId,
    viewport: { ...experiment.initialViewport },
    snapToGrid: true,
    gridSnapStep: 1.0,
    showGrid: true,
    showAxes: true,
    showCoordinates: true,
    showConstructions: true,
    constructionState: {
      stage: 'idle' as const,
      firstPointId: null,
      previewCoord: null,
    },
    activeMeasurement: {
      pointAId: 'pt_A',
      pointBId: 'pt_B',
    },
    predictRevealed: false,
    studentPrediction: '',
    predictionSubmitted: false,
    history: [] as HistorySnapshot[],
    future: [] as HistorySnapshot[],
  };
}

export const useMathStore = create<MathState>((set, get) => ({
  ...initializeExperiment(DISTANCE_EXPERIMENT),

  setTool: (tool) => {
    // When switching tools, cancel any incomplete construction
    set({
      activeTool: tool,
      constructionState: {
        stage: 'idle',
        firstPointId: null,
        previewCoord: null,
      },
    });
  },

  setViewport: (patch) =>
    set((state) => ({
      viewport: { ...state.viewport, ...patch },
    })),

  panBy: (dx, dy) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX: state.viewport.panX + dx,
        panY: state.viewport.panY + dy,
      },
    })),

  zoomIn: () =>
    set((state) => {
      const newZoom = Math.min(3.0, Number((state.viewport.zoom * 1.2).toFixed(2)));
      return { viewport: { ...state.viewport, zoom: newZoom } };
    }),

  zoomOut: () =>
    set((state) => {
      const newZoom = Math.max(0.3, Number((state.viewport.zoom / 1.2).toFixed(2)));
      return { viewport: { ...state.viewport, zoom: newZoom } };
    }),

  resetView: () =>
    set((state) => {
      const exp = MATH_EXPERIMENTS[state.currentExperimentId] || DISTANCE_EXPERIMENT;
      return { viewport: { ...exp.initialViewport } };
    }),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  toggleAxes: () => set((state) => ({ showAxes: !state.showAxes })),
  toggleConstructions: () => set((state) => ({ showConstructions: !state.showConstructions })),

  selectObject: (id) => set({ selectedId: id }),

  setPointCoordinates: (id, x, y, recordUndo = true) => {
    const state = get();
    const existing = state.objects[id];
    if (!existing || existing.kind !== 'point') return;

    const newSnapshot = recordUndo ? createSnapshot(state) : null;
    const updatedPoint: MathPoint = {
      ...existing,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
    };

    set({
      objects: { ...state.objects, [id]: updatedPoint },
      ...(newSnapshot && {
        history: [...state.history.slice(-MAX_HISTORY + 1), newSnapshot],
        future: [],
      }),
    });
  },

  updatePointDrag: (id, x, y) => {
    const state = get();
    const existing = state.objects[id];
    if (!existing || existing.kind !== 'point') return;

    set({
      objects: {
        ...state.objects,
        [id]: {
          ...existing,
          x: Number(x.toFixed(4)),
          y: Number(y.toFixed(4)),
        },
      },
    });
  },

  commitPointDrag: (_id) => {
    const state = get();
    const snapshot = createSnapshot(state);
    set({
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
  },

  // Construction State Machine
  startConstruction: (firstPointId) =>
    set({
      constructionState: {
        stage: 'selecting_second',
        firstPointId,
        previewCoord: null,
      },
    }),

  updateConstructionPreview: (coord) =>
    set((state) => ({
      constructionState: {
        ...state.constructionState,
        previewCoord: coord,
      },
    })),

  cancelConstruction: () =>
    set({
      constructionState: {
        stage: 'idle',
        firstPointId: null,
        previewCoord: null,
      },
    }),

  setActiveMeasurement: (measurement) => set({ activeMeasurement: measurement }),

  createPoint: (x, y) => {
    const state = get();
    const existingPoints = Object.values(state.objects).filter(
      (o): o is MathPoint => o.kind === 'point'
    );
    const label = generateNextPointLabel(existingPoints);
    const id = `pt_${label}_${Date.now()}`;

    const newPoint: MathPoint = {
      id,
      kind: 'point',
      label,
      x: Number(x.toFixed(4)),
      y: Number(y.toFixed(4)),
      isDraggable: true,
      color: '#38bdf8',
      radius: 7,
    };

    const snapshot = createSnapshot(state);
    set({
      objects: { ...state.objects, [id]: newPoint },
      objectOrder: [...state.objectOrder, id],
      selectedId: id,
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });

    return newPoint;
  },

  createSegment: (pointAId, pointBId) => {
    const state = get();
    if (pointAId === pointBId) return null; // Reject zero-length self-segment

    const pA = state.objects[pointAId] as MathPoint | undefined;
    const pB = state.objects[pointBId] as MathPoint | undefined;
    if (!pA || !pB) return null;

    // Check if duplicate segment already connects these two points
    const existing = Object.values(state.objects).find(
      (o): o is MathSegment =>
        o.kind === 'segment' &&
        ((o.pointAId === pointAId && o.pointBId === pointBId) ||
          (o.pointAId === pointBId && o.pointBId === pointAId))
    );
    if (existing) {
      set({ selectedId: existing.id });
      return existing;
    }

    const id = `seg_${pA.label}${pB.label}_${Date.now()}`;
    const newSegment: MathSegment = {
      id,
      kind: 'segment',
      label: `${pA.label}${pB.label}`,
      pointAId,
      pointBId,
      color: '#a855f7',
      strokeWidth: 3,
      style: 'solid',
    };

    const snapshot = createSnapshot(state);
    set({
      objects: { ...state.objects, [id]: newSegment },
      objectOrder: [...state.objectOrder, id],
      selectedId: id,
      constructionState: {
        stage: 'idle',
        firstPointId: null,
        previewCoord: null,
      },
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });

    return newSegment;
  },

  createLine: (pointAId, pointBId) => {
    const state = get();
    if (pointAId === pointBId) return null; // Reject coincident points

    const pA = state.objects[pointAId] as MathPoint | undefined;
    const pB = state.objects[pointBId] as MathPoint | undefined;
    if (!pA || !pB) return null;

    // Check if duplicate line already exists
    const existing = Object.values(state.objects).find(
      (o): o is MathLine =>
        o.kind === 'line' &&
        ((o.pointAId === pointAId && o.pointBId === pointBId) ||
          (o.pointAId === pointBId && o.pointBId === pointAId))
    );
    if (existing) {
      set({ selectedId: existing.id });
      return existing;
    }

    const id = `line_${pA.label}${pB.label}_${Date.now()}`;
    const newLine: MathLine = {
      id,
      kind: 'line',
      label: `Line ${pA.label}${pB.label}`,
      pointAId,
      pointBId,
      color: '#06b6d4',
      strokeWidth: 2.5,
      style: 'solid',
    };

    const snapshot = createSnapshot(state);
    set({
      objects: { ...state.objects, [id]: newLine },
      objectOrder: [...state.objectOrder, id],
      selectedId: id,
      constructionState: {
        stage: 'idle',
        firstPointId: null,
        previewCoord: null,
      },
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });

    return newLine;
  },

  addObject: (object) => {
    const state = get();
    const snapshot = createSnapshot(state);
    set({
      objects: { ...state.objects, [object.id]: object },
      objectOrder: [...state.objectOrder, object.id],
      selectedId: object.id,
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
  },

  deleteObject: (id) => {
    const state = get();
    if (!state.objects[id]) return;

    const snapshot = createSnapshot(state);
    const newObjects = { ...state.objects };
    delete newObjects[id];

    // If point was deleted, also delete dependent segments and lines
    for (const [key, obj] of Object.entries(newObjects)) {
      if (
        (obj.kind === 'segment' || obj.kind === 'line') &&
        (obj.pointAId === id || obj.pointBId === id)
      ) {
        delete newObjects[key];
      }
    }

    const newOrder = state.objectOrder.filter((oId) => Boolean(newObjects[oId]));

    // If measurement references deleted point, reset measurement to default
    let activeMeasurement = state.activeMeasurement;
    if (activeMeasurement && (activeMeasurement.pointAId === id || activeMeasurement.pointBId === id)) {
      activeMeasurement = null;
    }

    set({
      objects: newObjects,
      objectOrder: newOrder,
      selectedId: (state.selectedId && newObjects[state.selectedId]) ? state.selectedId : null,
      activeMeasurement,
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
  },

  deleteSelectedObject: () => {
    const state = get();
    if (state.selectedId) {
      get().deleteObject(state.selectedId);
    }
  },

  clearCanvas: () => {
    const state = get();
    if (state.objectOrder.length === 0) return;

    const snapshot = createSnapshot(state);

    set({
      objects: {},
      objectOrder: [],
      selectedId: null,
      activeMeasurement: null,
      constructionState: {
        stage: 'idle',
        firstPointId: null,
        previewCoord: null,
      },
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.history.length === 0) return;

    const currentSnapshot = createSnapshot(state);
    const prevSnapshot = state.history[state.history.length - 1];
    const remainingHistory = state.history.slice(0, -1);

    set({
      objects: prevSnapshot.objects,
      objectOrder: prevSnapshot.objectOrder,
      selectedId: prevSnapshot.selectedId,
      activeMeasurement: prevSnapshot.activeMeasurement || null,
      history: remainingHistory,
      future: [currentSnapshot, ...state.future.slice(0, MAX_HISTORY)],
    });
  },

  redo: () => {
    const state = get();
    if (state.future.length === 0) return;

    const currentSnapshot = createSnapshot(state);
    const nextSnapshot = state.future[0];
    const remainingFuture = state.future.slice(1);

    set({
      objects: nextSnapshot.objects,
      objectOrder: nextSnapshot.objectOrder,
      selectedId: nextSnapshot.selectedId,
      activeMeasurement: nextSnapshot.activeMeasurement || null,
      history: [...state.history.slice(-MAX_HISTORY + 1), currentSnapshot],
      future: remainingFuture,
    });
  },

  resetExperiment: (experimentId) => {
    const state = get();
    const expId = experimentId || state.currentExperimentId;
    const exp = MATH_EXPERIMENTS[expId] || DISTANCE_EXPERIMENT;
    set(initializeExperiment(exp));
  },

  loadScene: (saveFile) => {
    const state = get();
    const snapshot = createSnapshot(state);
    set({
      objects: saveFile.objects,
      objectOrder: saveFile.objectOrder,
      viewport: saveFile.viewport,
      selectedId: null,
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
  },

  exportScene: (): MathSaveFile => {
    const state = get();
    return {
      version: '1.0',
      experimentId: state.currentExperimentId,
      title: 'Mathematics Experiment',
      timestamp: new Date().toISOString(),
      objects: JSON.parse(JSON.stringify(state.objects)),
      objectOrder: [...state.objectOrder],
      viewport: { ...state.viewport },
    };
  },

  setStudentPrediction: (val) => set({ studentPrediction: val }),
  submitPrediction: () => set({ predictionSubmitted: true, predictRevealed: true }),
  revealSolution: () => set({ predictRevealed: true }),
  resetPrediction: () => set({ predictRevealed: false, studentPrediction: '', predictionSubmitted: false }),
}));
