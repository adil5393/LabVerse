/**
 * Reusable Zustand State Store for LabVerse Mathematics Laboratory
 *
 * Implements authoritative mathematical scene state, undo/redo history,
 * viewport transformations, and educational predict/reveal state.
 */

import { create } from 'zustand';
import type {
  MathObject,
  MathPoint,
  MathToolId,
  MathViewportTransform,
  MathSaveFile,
} from '../engine/mathematics/types';
import {
  DISTANCE_EXPERIMENT,
  MATH_EXPERIMENTS,
  type MathExperiment,
} from '../engine/mathematics/experimentRegistry';

interface HistorySnapshot {
  objects: Record<string, MathObject>;
  objectOrder: string[];
  selectedId: string | null;
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

  addObject: (object: MathObject) => void;
  deleteObject: (id: string) => void;

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
}): HistorySnapshot {
  return {
    objects: JSON.parse(JSON.stringify(state.objects)),
    objectOrder: [...state.objectOrder],
    selectedId: state.selectedId,
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
    predictRevealed: false,
    studentPrediction: '',
    predictionSubmitted: false,
    history: [] as HistorySnapshot[],
    future: [] as HistorySnapshot[],
  };
}

export const useMathStore = create<MathState>((set, get) => ({
  ...initializeExperiment(DISTANCE_EXPERIMENT),

  setTool: (tool) => set({ activeTool: tool }),

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
    // Drag commits are placed onto undo stack
    const snapshot = createSnapshot(state);
    set({
      history: [...state.history.slice(-MAX_HISTORY + 1), snapshot],
      future: [],
    });
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

    // If point was deleted, also delete dependent segments
    for (const [key, obj] of Object.entries(newObjects)) {
      if ((obj.kind === 'segment' || obj.kind === 'line') && (obj.pointAId === id || obj.pointBId === id)) {
        delete newObjects[key];
      }
    }

    const newOrder = state.objectOrder.filter((oId) => Boolean(newObjects[oId]));

    set({
      objects: newObjects,
      objectOrder: newOrder,
      selectedId: state.selectedId === id ? null : state.selectedId,
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
