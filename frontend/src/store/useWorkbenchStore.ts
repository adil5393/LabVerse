import { create } from 'zustand';
import type { UserMode, ViewportTransform, GenericEquipmentInstance } from '../types/workbench';
import type { JumperWire, TerminalAttachment, ConnectionEndpoint } from '../types/connections';
import type { CircuitSimulationResult, SimulationVisualSettings } from '../types/simulation';

interface HistorySnapshot {
  instances: GenericEquipmentInstance[];
  wires: JumperWire[];
  attachments: TerminalAttachment[];
}

interface WorkbenchState {
  // Viewport & Canvas
  viewport: ViewportTransform;
  snapToGrid: boolean;
  userMode: UserMode;
  isInspectorOpen: boolean;
  selectedInstanceId: string | null;

  // Equipment Instances & Attachments
  instances: GenericEquipmentInstance[];
  attachments: TerminalAttachment[];

  // Jumper Wires & Interactive Wiring Mode
  wires: JumperWire[];
  selectedWireId: string | null;
  isWiringMode: boolean;
  selectedWireColor: string;
  activeWireStart: ConnectionEndpoint | null;

  // Selected Breadboard Hole / Conductive Strip Selection
  selectedHole: { breadboardInstanceId: string; holeId: string } | null;
  selectHole: (holeRef: { breadboardInstanceId: string; holeId: string } | null) => void;

  // Electrical Node Debug Selection
  highlightedNodeId: string | null;
  setHighlightedNodeId: (nodeId: string | null) => void;

  // Simulation & Visual Feedback State (Milestone D)
  topologyRevision: number;
  simulationResult: CircuitSimulationResult | null;
  simulationSettings: SimulationVisualSettings;
  setSimulationSettings: (settings: Partial<SimulationVisualSettings>) => void;
  setSimulationResult: (result: CircuitSimulationResult | null) => void;
  incrementTopologyRevision: () => void;
  resetSimulation: () => void;

  // History Stacks (Undo/Redo)
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];

  // Viewport Actions
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setPan: (panX: number, panY: number) => void;
  resetViewport: () => void;
  toggleSnapToGrid: () => void;

  // Mode & Panels
  setUserMode: (mode: UserMode) => void;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  selectInstance: (id: string | null) => void;

  // Component Management
  addInstance: (instance: GenericEquipmentInstance) => void;
  removeInstance: (instanceId: string) => void;
  updateInstancePosition: (instanceId: string, positionMM: { x: number; y: number }) => void;
  updateInstanceRotation: (instanceId: string, rotationDeg: number) => void;
  updateInstanceProperties: (instanceId: string, properties: Record<string, number | string | boolean>) => void;
  clearWorkbench: () => void;

  // Attachments
  setAttachmentsForInstance: (instanceId: string, newAttachments: TerminalAttachment[]) => void;
  removeAttachmentsForInstance: (instanceId: string) => void;

  // Wiring Actions
  setWiringMode: (enabled: boolean) => void;
  setSelectedWireColor: (color: string) => void;
  setActiveWireStart: (endpoint: ConnectionEndpoint | null) => void;
  selectWire: (wireId: string | null) => void;
  addWire: (wire: JumperWire) => void;
  removeWire: (wireId: string) => void;
  updateWireColor: (wireId: string, color: string) => void;
  updateWireEndpoint: (wireId: string, which: 'from' | 'to', newEndpoint: ConnectionEndpoint) => void;

  // Undo / Redo
  pushHistorySnapshot: () => void;
  undo: () => void;
  redo: () => void;
}

const DEFAULT_VIEWPORT: ViewportTransform = {
  zoom: 1.0,
  panX: 0,
  panY: 0,
};

export const useWorkbenchStore = create<WorkbenchState>((set, get) => ({
  viewport: DEFAULT_VIEWPORT,
  snapToGrid: true,
  userMode: 'beginner',
  isInspectorOpen: true,
  selectedInstanceId: null,
  selectedHole: null,
  instances: [],
  attachments: [],
  wires: [],
  selectedWireId: null,
  isWiringMode: false,
  selectedWireColor: '#ef4444', // Default red jumper wire
  activeWireStart: null,
  highlightedNodeId: null,
  topologyRevision: 0,
  incrementTopologyRevision: () => set((state) => ({ topologyRevision: state.topologyRevision + 1 })),
  simulationResult: null,
  simulationSettings: {
    isRunning: true,
    showCurrentFlow: true,
    showVoltage: false,
    animationSpeed: 1.0,
  },
  setSimulationSettings: (newSettings) =>
    set((state) => ({
      simulationSettings: { ...state.simulationSettings, ...newSettings },
    })),
  setSimulationResult: (result) => set({ simulationResult: result }),
  resetSimulation: () =>
    set({
      simulationSettings: {
        isRunning: true,
        showCurrentFlow: true,
        showVoltage: false,
        animationSpeed: 1.0,
      },
    }),
  undoStack: [],
  redoStack: [],

  setZoom: (updater) =>
    set((state) => {
      const newZoom = typeof updater === 'function' ? updater(state.viewport.zoom) : updater;
      const clampedZoom = Math.max(0.3, Math.min(2.5, Math.round(newZoom * 100) / 100));
      return {
        viewport: {
          ...state.viewport,
          zoom: clampedZoom,
        },
      };
    }),

  setPan: (panX, panY) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        panX,
        panY,
      },
    })),

  resetViewport: () =>
    set({
      viewport: DEFAULT_VIEWPORT,
    }),

  toggleSnapToGrid: () =>
    set((state) => ({
      snapToGrid: !state.snapToGrid,
    })),

  setUserMode: (mode) =>
    set({
      userMode: mode,
    }),

  toggleInspector: () =>
    set((state) => ({
      isInspectorOpen: !state.isInspectorOpen,
    })),

  setInspectorOpen: (open) =>
    set({
      isInspectorOpen: open,
    }),

  selectInstance: (id) =>
    set({
      selectedInstanceId: id,
      selectedWireId: id ? null : get().selectedWireId,
      selectedHole: id ? null : get().selectedHole,
      isInspectorOpen: id ? true : get().isInspectorOpen,
    }),

  selectHole: (holeRef) =>
    set((state) => {
      const isSame =
        holeRef &&
        state.selectedHole &&
        state.selectedHole.breadboardInstanceId === holeRef.breadboardInstanceId &&
        state.selectedHole.holeId === holeRef.holeId;
      const nextHole = isSame || !holeRef ? null : holeRef;
      return {
        selectedHole: nextHole,
        selectedInstanceId: nextHole ? null : state.selectedInstanceId,
        selectedWireId: nextHole ? null : state.selectedWireId,
        isInspectorOpen: nextHole ? true : state.isInspectorOpen,
      };
    }),

  pushHistorySnapshot: () => {
    const { instances, wires, attachments, undoStack } = get();
    set({
      undoStack: [
        ...undoStack.slice(-25),
        {
          instances: JSON.parse(JSON.stringify(instances)),
          wires: JSON.parse(JSON.stringify(wires)),
          attachments: JSON.parse(JSON.stringify(attachments)),
        },
      ],
      redoStack: [],
    });
  },

  addInstance: (instance) => {
    get().pushHistorySnapshot();
    set((state) => ({
      instances: [...state.instances, instance],
      selectedInstanceId: instance.instanceId,
      selectedWireId: null,
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  removeInstance: (instanceId) => {
    get().pushHistorySnapshot();
    set((state) => ({
      instances: state.instances.filter((inst) => inst.instanceId !== instanceId),
      selectedInstanceId: state.selectedInstanceId === instanceId ? null : state.selectedInstanceId,
      topologyRevision: state.topologyRevision + 1,
      attachments: state.attachments.filter(
        (att) => att.instanceId !== instanceId && att.breadboardInstanceId !== instanceId
      ),
      wires: state.wires.filter(
        (w) =>
          !(
            (w.from.kind === 'component-terminal' && w.from.instanceId === instanceId) ||
            (w.to.kind === 'component-terminal' && w.to.instanceId === instanceId) ||
            (w.from.kind === 'breadboard-hole' && w.from.breadboardInstanceId === instanceId) ||
            (w.to.kind === 'breadboard-hole' && w.to.breadboardInstanceId === instanceId)
          )
      ),
    }));
  },

  updateInstancePosition: (instanceId, newPositionMM) => {
    const state = get();
    const inst = state.instances.find((i) => i.instanceId === instanceId);
    if (!inst) return;

    // Moving a breadboard moves components attached to its holes
    const isBreadboard = inst.definitionId.includes('breadboard');
    if (isBreadboard) {
      const deltaX = newPositionMM.x - inst.positionMM.x;
      const deltaY = newPositionMM.y - inst.positionMM.y;

      const attachedInstanceIds = new Set(
        state.attachments
          .filter((att) => att.breadboardInstanceId === instanceId)
          .map((att) => att.instanceId)
      );

      set((s) => ({
        instances: s.instances.map((i) => {
          if (i.instanceId === instanceId) {
            return { ...i, positionMM: newPositionMM };
          }
          if (attachedInstanceIds.has(i.instanceId)) {
            return {
              ...i,
              positionMM: {
                x: Math.round((i.positionMM.x + deltaX) * 10) / 10,
                y: Math.round((i.positionMM.y + deltaY) * 10) / 10,
              },
            };
          }
          return i;
        }),
      }));
      return;
    }

    set((s) => ({
      instances: s.instances.map((i) =>
        i.instanceId === instanceId ? { ...i, positionMM: newPositionMM } : i
      ),
    }));
  },

  updateInstanceRotation: (instanceId, rotationDeg) => {
    get().pushHistorySnapshot();
    set((state) => ({
      instances: state.instances.map((inst) =>
        inst.instanceId === instanceId ? { ...inst, rotationDeg } : inst
      ),
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  updateInstanceProperties: (instanceId, properties) =>
    set((state) => ({
      instances: state.instances.map((inst) =>
        inst.instanceId === instanceId
          ? { ...inst, properties: { ...inst.properties, ...properties } }
          : inst
      ),
      topologyRevision: state.topologyRevision + 1,
    })),

  clearWorkbench: () => {
    get().pushHistorySnapshot();
    set((state) => ({
      instances: [],
      attachments: [],
      wires: [],
      selectedInstanceId: null,
      selectedWireId: null,
      selectedHole: null,
      activeWireStart: null,
      highlightedNodeId: null,
      simulationResult: null,
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  setAttachmentsForInstance: (instanceId, newAttachments) =>
    set((state) => ({
      attachments: [
        ...state.attachments.filter((att) => att.instanceId !== instanceId),
        ...newAttachments,
      ],
      topologyRevision: state.topologyRevision + 1,
    })),

  removeAttachmentsForInstance: (instanceId) =>
    set((state) => ({
      attachments: state.attachments.filter((att) => att.instanceId !== instanceId),
      topologyRevision: state.topologyRevision + 1,
    })),

  setWiringMode: (enabled) =>
    set({
      isWiringMode: enabled,
      activeWireStart: enabled ? get().activeWireStart : null,
    }),

  setSelectedWireColor: (color) =>
    set({
      selectedWireColor: color,
    }),

  setActiveWireStart: (endpoint) =>
    set({
      activeWireStart: endpoint,
    }),

  selectWire: (wireId) =>
    set({
      selectedWireId: wireId,
      selectedInstanceId: wireId ? null : get().selectedInstanceId, // Clear component selection if wire selected
      selectedHole: wireId ? null : get().selectedHole,
      isInspectorOpen: wireId ? true : get().isInspectorOpen,
    }),

  addWire: (wire) => {
    get().pushHistorySnapshot();
    set((state) => ({
      wires: [...state.wires, wire],
      activeWireStart: null,
      selectedWireId: wire.id,
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  removeWire: (wireId) => {
    get().pushHistorySnapshot();
    set((state) => ({
      wires: state.wires.filter((w) => w.id !== wireId),
      selectedWireId: state.selectedWireId === wireId ? null : state.selectedWireId,
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  updateWireColor: (wireId, color) => {
    get().pushHistorySnapshot();
    set((state) => ({
      wires: state.wires.map((w) => (w.id === wireId ? { ...w, color } : w)),
    }));
  },

  updateWireEndpoint: (wireId, which, newEndpoint) => {
    get().pushHistorySnapshot();
    set((state) => ({
      wires: state.wires.map((w) =>
        w.id === wireId
          ? {
              ...w,
              [which]: newEndpoint,
            }
          : w
      ),
      topologyRevision: state.topologyRevision + 1,
    }));
  },

  setHighlightedNodeId: (nodeId) =>
    set({
      highlightedNodeId: nodeId,
    }),

  undo: () => {
    const { undoStack, redoStack, instances, wires, attachments, topologyRevision } = get();
    if (undoStack.length === 0) return;

    const previous = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);

    set({
      instances: previous.instances,
      wires: previous.wires,
      attachments: previous.attachments,
      undoStack: newUndoStack,
      redoStack: [
        ...redoStack,
        {
          instances: JSON.parse(JSON.stringify(instances)),
          wires: JSON.parse(JSON.stringify(wires)),
          attachments: JSON.parse(JSON.stringify(attachments)),
        },
      ],
      selectedInstanceId: null,
      selectedWireId: null,
      activeWireStart: null,
      topologyRevision: topologyRevision + 1,
    });
  },

  redo: () => {
    const { redoStack, undoStack, instances, wires, attachments, topologyRevision } = get();
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);

    set({
      instances: next.instances,
      wires: next.wires,
      attachments: next.attachments,
      redoStack: newRedoStack,
      undoStack: [
        ...undoStack,
        {
          instances: JSON.parse(JSON.stringify(instances)),
          wires: JSON.parse(JSON.stringify(wires)),
          attachments: JSON.parse(JSON.stringify(attachments)),
        },
      ],
      selectedInstanceId: null,
      selectedWireId: null,
      activeWireStart: null,
      topologyRevision: topologyRevision + 1,
    });
  },
}));
