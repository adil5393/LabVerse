import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GuidanceStrip } from './GuidanceStrip';
import { EquipmentTray } from './EquipmentTray';
import { CanvasContainer } from './CanvasContainer';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import { CurrentFlowOverlay } from './CurrentFlowOverlay';
import { VoltageBadgeOverlay } from './VoltageBadgeOverlay';
import { SimulationToolbar } from './SimulationToolbar';
import { SimulationFaultBanner } from './SimulationFaultBanner';
import { simulateCircuit } from '../../engine/simulation/simulationClient';
import { InspectorPanel } from './InspectorPanel';
import { PHYSICS_ELECTRICITY_CATALOG } from '../../subjects/physics/equipmentCatalog';
import { useWorkbenchStore } from '../../store/useWorkbenchStore';
import {
  pointerToWorld,
  calculateInitialPlacement,
} from '../../engine/geometry/coordinates';
import { detectBreadboardSnap, type SnapResult } from '../../engine/connectivity/breadboardSnapping';
import {
  BREADBOARD_HOLE_MAP,
  BREADBOARD_400_HOLES,
} from '../../engine/connectivity/breadboardTopology';
import { computeConnectivityGraph } from '../../engine/connectivity/connectivityGraph';
import {
  endpointKey,
  getEndpointKey,
  findNearestEndpoint,
  type NearestEndpointResult,
} from '../../engine/connectivity/endpointGeometry';
import type {
  GenericEquipmentDefinition,
  GenericEquipmentInstance,
  WorkbenchSaveFile,
} from '../../types/workbench';
import type { ConnectionEndpoint, JumperWire } from '../../types/connections';
import { useChapterNavigation, WorkspaceShell } from '../workspace';

type InteractionState = 'idle' | 'dragging-component' | 'panning' | 'creating-wire' | 'reconnecting-wire';

export const WorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isGuided = searchParams.get('mode') !== 'free';
  const { registerLab } = useChapterNavigation('electricity');

  React.useEffect(() => {
    registerLab(window.location.pathname + window.location.search, 'Circuit Workbench');
  }, [registerLab]);

  const {
    instances,
    attachments,
    wires,
    viewport,
    selectedInstanceId,
    selectedWireId,
    selectedHole,
    snapToGrid,
    isWiringMode,
    selectedWireColor,
    activeWireStart,
    highlightedNodeId,
    setWiringMode,
    setActiveWireStart,
    selectWire,
    selectHole,
    addWire,
    removeWire,
    updateWireEndpoint,
    selectInstance,
    removeInstance,
    addInstance,
    updateInstancePosition,
    setAttachmentsForInstance,
    removeAttachmentsForInstance,
    clearWorkbench,
    simulationResult,
    simulationSettings,
    setSimulationResult,
    topologyRevision,
  } = useWorkbenchStore();

  const [notification, setNotification] = useState<string | null>(null);
  const [interactionState, setInteractionState] = useState<InteractionState>('idle');
  const [cursorWorldMM, setCursorWorldMM] = useState<{ xMM: number; yMM: number } | null>(null);
  const [snappedTarget, setSnappedTarget] = useState<NearestEndpointResult | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapResult | null>(null);
  const [reconnectingWire, setReconnectingWire] = useState<{ wireId: string; which: 'from' | 'to' } | null>(null);

  // Authoritative simulation calculation whenever circuit topology or components change
  useEffect(() => {
    let isCancelled = false;
    const store = useWorkbenchStore.getState();
    simulateCircuit(store.instances, PHYSICS_ELECTRICITY_CATALOG, store.attachments, store.wires).then((res) => {
      if (!isCancelled) {
        setSimulationResult(res);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [topologyRevision, setSimulationResult]);

  // Authoritative DOM references for SVG matrix inversion
  const svgRef = useRef<SVGSVGElement | null>(null);
  const worldGroupRef = useRef<SVGGElement | null>(null);
  const snappedTargetRef = useRef<NearestEndpointResult | null>(null);

  // Developer diagnostics HUD toggle
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsTelemetry, setDiagnosticsTelemetry] = useState<{
    clientX: number;
    clientY: number;
    svgX: number;
    svgY: number;
  } | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // 1. CALCULATE REAL-TIME CONNECTIVITY GRAPH & ELECTRICAL NODES
  const connectivityGraph = useMemo(() => {
    return computeConnectivityGraph(instances, PHYSICS_ELECTRICITY_CATALOG, attachments, wires);
  }, [instances, attachments, wires]);

  // Canonical endpoint keys highlighted when an electrical node is clicked in Inspector or a hole/strip is selected
  const { highlightedEndpointKeys, highlightedColor } = useMemo(() => {
    const epKeys = new Set<string>();
    let color = '#4edea3';

    if (highlightedNodeId) {
      const node = connectivityGraph.nodes.find((n) => n.id === highlightedNodeId);
      if (node) {
        color = node.color;
        node.endpoints.forEach((ep) => {
          epKeys.add(endpointKey(ep));
        });
      }
    } else if (selectedHole) {
      const selHoleDef = BREADBOARD_HOLE_MAP.get(selectedHole.holeId);
      if (selHoleDef) {
        color = '#38bdf8';
        // ONLY holes strictly on selectedHole.breadboardInstanceId sharing that strip
        BREADBOARD_400_HOLES
          .filter((h) => h.internalStripId === selHoleDef.internalStripId)
          .forEach((h) => {
            epKeys.add(
              endpointKey({
                kind: 'breadboard-hole',
                breadboardInstanceId: selectedHole.breadboardInstanceId,
                holeId: h.id,
              })
            );
          });
      }
    }

    return {
      highlightedEndpointKeys: epKeys,
      highlightedColor: color,
    };
  }, [highlightedNodeId, selectedHole, connectivityGraph.nodes]);

  // Snap preview hole map for breadboard rendering
  const snapPreviewHoleMap = useMemo(() => {
    if (!snapPreview) return undefined;
    const map = new Map<string, boolean>();
    snapPreview.targetHoles.forEach((th) => {
      map.set(th.hole.id, snapPreview.isValid);
    });
    return map;
  }, [snapPreview]);

  // Global Pointer Tracking during Wire Creation
  useEffect(() => {
    if (!activeWireStart) return;

    const handleGlobalPointerMove = (e: PointerEvent) => {
      const world = pointerToWorld(
        e.clientX,
        e.clientY,
        svgRef.current,
        worldGroupRef.current,
        viewport
      );
      setCursorWorldMM({
        xMM: Math.round(world.xMM * 10) / 10,
        yMM: Math.round(world.yMM * 10) / 10,
      });

      if (showDiagnostics) {
        setDiagnosticsTelemetry({
          clientX: e.clientX,
          clientY: e.clientY,
          svgX: Math.round(world.xMM * 3.7795),
          svgY: Math.round(world.yMM * 3.7795),
        });
      }

      const startKey = getEndpointKey(activeWireStart);
      const snapped = findNearestEndpoint(world, instances, PHYSICS_ELECTRICITY_CATALOG, {
        zoom: viewport.zoom,
        activeTargetKey: snappedTargetRef.current?.key,
        ignoreEndpointKey: startKey,
      });

      setSnappedTarget(snapped);
      snappedTargetRef.current = snapped;
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    return () => window.removeEventListener('pointermove', handleGlobalPointerMove);
  }, [activeWireStart, instances, viewport, showDiagnostics]);

  // Hover pointer move when in idle state
  const handleCanvasPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (interactionState === 'idle') {
        const world = pointerToWorld(
          e.clientX,
          e.clientY,
          svgRef.current,
          worldGroupRef.current,
          viewport
        );
        setCursorWorldMM({
          xMM: Math.round(world.xMM * 10) / 10,
          yMM: Math.round(world.yMM * 10) / 10,
        });

        if (showDiagnostics) {
          setDiagnosticsTelemetry({
            clientX: e.clientX,
            clientY: e.clientY,
            svgX: Math.round(world.xMM * 3.7795),
            svgY: Math.round(world.yMM * 3.7795),
          });
        }
      }
    },
    [interactionState, viewport, showDiagnostics]
  );

  // Background Canvas Pointer Down (Commits wire if snapped target active, or cancels wire creation)
  const handleCanvasPointerDown = useCallback(
    (_e: React.PointerEvent) => {
      if (interactionState === 'creating-wire' && activeWireStart) {
        const currentSnapped = snappedTargetRef.current;
        if (currentSnapped) {
          const startKey = getEndpointKey(activeWireStart);
          if (currentSnapped.key !== startKey) {
            const newWire: JumperWire = {
              id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              color: selectedWireColor,
              from: activeWireStart,
              to: currentSnapped.endpoint,
            };
            addWire(newWire);
            showNotification(`Connected wire to ${currentSnapped.key}`);
          }
        } else {
          showNotification('Wire creation cancelled (clicked empty space)');
        }

        setActiveWireStart(null);
        setSnappedTarget(null);
        snappedTargetRef.current = null;
        setInteractionState('idle');
      }
    },
    [interactionState, activeWireStart, selectedWireColor, addWire, setActiveWireStart]
  );

  // Keyboard shortcut: Delete/Backspace removes selected wire or component; Escape cancels wiring
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWireId) {
          removeWire(selectedWireId);
          showNotification('Wire deleted');
        } else if (selectedInstanceId) {
          removeInstance(selectedInstanceId);
          showNotification('Component removed');
        }
      } else if (e.key === 'Escape') {
        if (reconnectingWire) {
          setReconnectingWire(null);
          setSnappedTarget(null);
          snappedTargetRef.current = null;
          setInteractionState('idle');
          showNotification('Wire reconnection cancelled (original connection preserved)');
        } else if (activeWireStart) {
          setActiveWireStart(null);
          setSnappedTarget(null);
          snappedTargetRef.current = null;
          setInteractionState('idle');
          showNotification('Wire creation cancelled');
        } else if (isWiringMode) {
          setWiringMode(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedWireId,
    selectedInstanceId,
    reconnectingWire,
    activeWireStart,
    isWiringMode,
    removeWire,
    removeInstance,
    setActiveWireStart,
    setWiringMode,
  ]);

  // 2. UNIVERSAL ENDPOINT CLICK (Starts or Completes Jumper Wire)
  const handleEndpointClick = useCallback(
    (endpoint: ConnectionEndpoint) => {
      if (!activeWireStart) {
        // Start wire from this endpoint
        setActiveWireStart(endpoint);
        setInteractionState('creating-wire');
        setWiringMode(true);
        showNotification(`Wire started from ${getEndpointKey(endpoint)}. Click destination endpoint.`);
      } else {
        // Prevent connecting an endpoint directly to itself
        const startKey = getEndpointKey(activeWireStart);
        const endKey = getEndpointKey(endpoint);

        if (startKey === endKey) {
          setActiveWireStart(null);
          setSnappedTarget(null);
          snappedTargetRef.current = null;
          setInteractionState('idle');
          showNotification('Wire creation cancelled (cannot connect terminal to itself)');
          return;
        }

        // Commit new wire
        const newWire: JumperWire = {
          id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          color: selectedWireColor,
          from: activeWireStart,
          to: endpoint,
        };

        addWire(newWire);
        showNotification(`Connected wire between ${startKey} and ${endKey}`);
        setActiveWireStart(null);
        setSnappedTarget(null);
        snappedTargetRef.current = null;
        setInteractionState('idle');
      }
    },
    [activeWireStart, selectedWireColor, addWire, setActiveWireStart, setWiringMode]
  );

  // 3. START RECONNECTING WIRE (DRAGGING AN ENDPOINT OF SELECTED WIRE)
  const handleStartReconnect = useCallback(
    (wireId: string, which: 'from' | 'to', e: React.PointerEvent) => {
      e.stopPropagation();
      const targetWire = wires.find((w) => w.id === wireId);
      if (!targetWire) return;

      const fixedEndpoint = which === 'from' ? targetWire.to : targetWire.from;
      const fixedKey = getEndpointKey(fixedEndpoint);
      setReconnectingWire({ wireId, which });
      setInteractionState('reconnecting-wire');

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const world = pointerToWorld(
          moveEvt.clientX,
          moveEvt.clientY,
          svgRef.current,
          worldGroupRef.current,
          viewport
        );
        setCursorWorldMM({
          xMM: Math.round(world.xMM * 10) / 10,
          yMM: Math.round(world.yMM * 10) / 10,
        });

        const snapped = findNearestEndpoint(world, instances, PHYSICS_ELECTRICITY_CATALOG, {
          zoom: viewport.zoom,
          activeTargetKey: snappedTargetRef.current?.key,
          ignoreEndpointKey: fixedKey,
        });

        setSnappedTarget(snapped);
        snappedTargetRef.current = snapped;
      };

      const handlePointerUp = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);

        const currentSnapped = snappedTargetRef.current;
        if (currentSnapped && currentSnapped.key !== fixedKey) {
          updateWireEndpoint(wireId, which, currentSnapped.endpoint);
          showNotification(`Reconnected wire ${which === 'from' ? 'start' : 'end'} to ${currentSnapped.key}`);
        } else {
          showNotification('Reconnection cancelled (no valid target nearby, original connection preserved)');
        }

        setReconnectingWire(null);
        setSnappedTarget(null);
        snappedTargetRef.current = null;
        setInteractionState('idle');
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
    },
    [wires, viewport, instances, updateWireEndpoint]
  );

  // 4. ADD EQUIPMENT FROM INVENTORY
  const handleAddEquipment = (definition: GenericEquipmentDefinition) => {
    if (definition.id.includes('wire')) {
      setWiringMode(true);
      showNotification('Wire Tool active. Click any terminal or breadboard hole to connect.');
      return;
    }

    const instanceId = `${definition.id}_${Date.now()}`;
    const containerWidth = svgRef.current?.clientWidth || 1000;
    const containerHeight = svgRef.current?.clientHeight || 600;

    const positionMM = calculateInitialPlacement(
      definition,
      instances,
      PHYSICS_ELECTRICITY_CATALOG,
      viewport,
      containerWidth,
      containerHeight
    );

    const connections: Record<string, string | null> = {};
    definition.terminals.forEach((term) => {
      connections[term.id] = null;
    });

    const newInstance: GenericEquipmentInstance = {
      instanceId,
      definitionId: definition.id,
      positionMM,
      rotationDeg: 0,
      properties: { ...definition.defaultProperties },
      connections,
    };

    addInstance(newInstance);
    showNotification(`Placed ${definition.name} (${positionMM.x} mm, ${positionMM.y} mm)`);
  };

  // 5. INDEPENDENT DRAGGING WITH REAL-TIME BREADBOARD SNAPPING PREVIEW
  const handleStartDrag = useCallback(
    (e: React.PointerEvent, targetInstance: GenericEquipmentInstance) => {
      if (isWiringMode || interactionState !== 'idle') return;

      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const initialPosMM = { ...targetInstance.positionMM };
      const initialAtts = attachments.filter((a) => a.instanceId === targetInstance.instanceId);

      const initialWorld = pointerToWorld(
        e.clientX,
        e.clientY,
        svgRef.current,
        worldGroupRef.current,
        viewport
      );

      const offsetMM = {
        x: initialWorld.xMM - targetInstance.positionMM.x,
        y: initialWorld.yMM - targetInstance.positionMM.y,
      };

      const targetDef = PHYSICS_ELECTRICITY_CATALOG.find(
        (d) => d.id === targetInstance.definitionId
      );

      let isDragging = false;
      let latestSnapResult: SnapResult | null = null;

      const cleanupListeners = () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('pointercancel', handlePointerUp);
        window.removeEventListener('keydown', handleKeyDown);
      };

      const handleKeyDown = (keyEvt: KeyboardEvent) => {
        if (keyEvt.key === 'Escape') {
          keyEvt.preventDefault();
          cleanupListeners();
          if (isDragging) {
            updateInstancePosition(targetInstance.instanceId, initialPosMM);
            setAttachmentsForInstance(targetInstance.instanceId, initialAtts);
            showNotification('Drag cancelled');
          }
          setSnapPreview(null);
          setInteractionState('idle');
        }
      };

      const handlePointerMove = (moveEvt: PointerEvent) => {
        const distPx = Math.hypot(moveEvt.clientX - startClientX, moveEvt.clientY - startClientY);
        if (!isDragging) {
          if (distPx < 5) return; // Ignore jitter below 5px threshold
          isDragging = true;
          setInteractionState('dragging-component');
        }

        const currentWorld = pointerToWorld(
          moveEvt.clientX,
          moveEvt.clientY,
          svgRef.current,
          worldGroupRef.current,
          viewport
        );

        let targetX = currentWorld.xMM - offsetMM.x;
        let targetY = currentWorld.yMM - offsetMM.y;

        // Check breadboard snapping if component has 2 terminals (LED or Resistor)
        if (targetDef && targetDef.terminals.length >= 2 && !targetDef.id.includes('breadboard')) {
          const snap = detectBreadboardSnap(
            targetInstance,
            targetDef,
            { x: targetX, y: targetY },
            instances,
            PHYSICS_ELECTRICITY_CATALOG,
            attachments
          );

          latestSnapResult = snap;
          setSnapPreview(snap);

          if (snap && snap.isValid) {
            targetX = snap.snappedPositionMM.x;
            targetY = snap.snappedPositionMM.y;
          }
        } else {
          setSnapPreview(null);
          if (snapToGrid) {
            const PITCH = 2.54;
            targetX = Math.round(targetX / PITCH) * PITCH;
            targetY = Math.round(targetY / PITCH) * PITCH;
          }
        }

        updateInstancePosition(targetInstance.instanceId, {
          x: Math.round(targetX * 10) / 10,
          y: Math.round(targetY * 10) / 10,
        });
      };

      const handlePointerUp = () => {
        cleanupListeners();

        if (!isDragging) {
          // Pure click / selection - PRESERVE all existing attachments intact!
          selectInstance(targetInstance.instanceId);
          setInteractionState('idle');
          return;
        }

        // Commit snap attachments or detachment
        if (latestSnapResult && latestSnapResult.isValid) {
          const newAtts = latestSnapResult.attachments.map((a) => ({
            instanceId: targetInstance.instanceId,
            terminalId: a.terminalId,
            breadboardInstanceId: latestSnapResult!.breadboardInstanceId,
            holeId: a.holeId,
          }));
          setAttachmentsForInstance(targetInstance.instanceId, newAtts);
          showNotification(`Snapped into breadboard holes: ${newAtts.map((a) => a.holeId).join(', ')}`);
        } else {
          removeAttachmentsForInstance(targetInstance.instanceId);
        }

        setSnapPreview(null);
        setInteractionState('idle');
      };

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerUp);
      window.addEventListener('keydown', handleKeyDown);
    },
    [
      isWiringMode,
      interactionState,
      viewport,
      snapToGrid,
      instances,
      attachments,
      selectInstance,
      updateInstancePosition,
      setAttachmentsForInstance,
      removeAttachmentsForInstance,
    ]
  );

  // 6. EXPORT / SAVE WORKBENCH STATE
  const handleExportLab = () => {
    const labFile: WorkbenchSaveFile = {
      version: '0.1.0',
      subjectId: 'physics',
      topicId: 'electricity',
      experimentId: isGuided ? 'exp_01_led_loop' : 'free_workbench',
      timestamp: new Date().toISOString(),
      viewport,
      instances,
      metadata: {
        wires,
        attachments,
      },
    };

    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(labFile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `labverse_${labFile.experimentId}_${Date.now()}.lab`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showNotification('Exported experiment state (.lab JSON file)');
  };

  // 7. RESET WORKBENCH
  const handleResetWorkbench = () => {
    if (instances.length === 0 && wires.length === 0) return;
    if (window.confirm('Reset the workbench? All placed components and wires will be cleared.')) {
      clearWorkbench();
      setSnappedTarget(null);
      setInteractionState('idle');
      showNotification('Workbench reset');
    }
  };

  // Diagnostics HUD Element
  const diagnosticsHUD = showDiagnostics ? (
    <div className="absolute top-4 left-4 bg-surface-lowest/95 border border-cyan-500/50 p-3 rounded-xl shadow-2xl text-[11px] font-mono text-cyan-300 pointer-events-none z-30 max-w-sm backdrop-blur-md">
      <div className="font-bold text-white flex items-center justify-between border-b border-cyan-500/30 pb-1 mb-2">
        <span>COORDINATE DIAGNOSTICS</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">ACTIVE</span>
      </div>
      <div className="space-y-1">
        <div>Pointer Client: X: {diagnosticsTelemetry?.clientX ?? 0}, Y: {diagnosticsTelemetry?.clientY ?? 0} px</div>
        <div>SVG-Local: X: {diagnosticsTelemetry?.svgX ?? 0}, Y: {diagnosticsTelemetry?.svgY ?? 0} px</div>
        <div>World (mm): X: {cursorWorldMM?.xMM ?? 0}, Y: {cursorWorldMM?.yMM ?? 0} mm</div>
        <div>Camera: Zoom: {Math.round(viewport.zoom * 100)}%, Pan: ({Math.round(viewport.panX)}, {Math.round(viewport.panY)})</div>
        <div>State: <span className="text-white uppercase font-bold">{interactionState}</span></div>
        <div>Start Terminal: {activeWireStart ? getEndpointKey(activeWireStart) : 'none'}</div>
        <div>
          Snapped Target:{' '}
          <span className={snappedTarget ? 'text-green-400 font-bold' : 'text-slate-400'}>
            {snappedTarget ? `${snappedTarget.key} @ (${snappedTarget.worldPos.xMM}, ${snappedTarget.worldPos.yMM})` : 'none'}
          </span>
        </div>
      </div>
    </div>
  ) : null;

  const outlinerContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <EquipmentTray
        catalog={PHYSICS_ELECTRICITY_CATALOG}
        onAddEquipment={handleAddEquipment}
      />
    </div>
  );

  const inspectorContent = (
    <InspectorPanel
      catalog={PHYSICS_ELECTRICITY_CATALOG}
      nodes={connectivityGraph.nodes}
      selectedWireId={selectedWireId}
      onSelectWire={(id) => selectWire(id)}
    />
  );

  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <SimulationFaultBanner faults={simulationResult?.faults || []} />
      {isGuided && <GuidanceStrip />}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">COMPONENTS</span>
          <span className="text-white font-bold text-sm">{instances.length} active</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">JUMPER WIRES</span>
          <span className="text-white font-bold text-sm">{wires.length} placed</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">NODES</span>
          <span className="text-white font-bold text-sm">{connectivityGraph.nodes.length} nets</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">SIMULATION</span>
          <span className={`font-bold text-sm ${simulationResult?.faults?.length ? 'text-amber-400' : 'text-emerald-400'}`}>
            {simulationResult?.faults?.length ? `${simulationResult.faults.length} Faults` : 'Equilibrium OK'}
          </span>
        </div>
      </div>
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={handleExportLab}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-surface-variant hover:bg-surface-elevated text-white rounded border border-outline-variant font-mono"
          title="Export circuit snapshot"
        >
          <span className="material-symbols-outlined text-[14px]">download</span>
          <span>Export .lab JSON</span>
        </button>
      </div>
    </div>
  );

  const viewportContent = (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <CanvasContainer
        svgRef={svgRef}
        worldGroupRef={worldGroupRef}
          activeInteractionState={interactionState}
          cursorWorldMM={cursorWorldMM}
          onCanvasPointerMove={handleCanvasPointerMove}
          onCanvasPointerDown={handleCanvasPointerDown}
          showDiagnostics={showDiagnostics}
          onToggleDiagnostics={() => setShowDiagnostics((prev) => !prev)}
          diagnosticsOverlay={diagnosticsHUD}
        >
          {/* Layer 1: Components and Breadboards */}
          {instances.map((instance) => {
            const definition = PHYSICS_ELECTRICITY_CATALOG.find(
              (def) => def.id === instance.definitionId
            );
            if (!definition) return null;

            const isBreadboard = definition.id.includes('breadboard');

            // 1. Highlighted holes strictly on THIS breadboard instance
            const boardHighlightedHoleIds = new Set<string>();
            if (isBreadboard) {
              BREADBOARD_400_HOLES.forEach((h) => {
                const k = endpointKey({
                  kind: 'breadboard-hole',
                  breadboardInstanceId: instance.instanceId,
                  holeId: h.id,
                });
                if (highlightedEndpointKeys.has(k)) {
                  boardHighlightedHoleIds.add(h.id);
                }
              });
            }

            // 2. Highlighted terminals strictly on THIS component instance
            const compHighlightedTerminalIds = new Set<string>();
            if (!isBreadboard) {
              definition.terminals.forEach((term) => {
                const k = endpointKey({
                  kind: 'component-terminal',
                  instanceId: instance.instanceId,
                  terminalId: term.id,
                });
                if (highlightedEndpointKeys.has(k)) {
                  compHighlightedTerminalIds.add(term.id);
                }
              });
            }

            // 3. Selected hole strictly on THIS breadboard instance
            const boardSelectedHoleId =
              selectedHole?.breadboardInstanceId === instance.instanceId ? selectedHole.holeId : null;

            // 4. Snapped hole during wire drawing strictly on THIS breadboard instance
            const boardSnappedHoleId =
              snappedTarget?.endpoint.kind === 'breadboard-hole' &&
              snappedTarget.endpoint.breadboardInstanceId === instance.instanceId
                ? snappedTarget.endpoint.holeId
                : null;

            // 5. Snap preview holes strictly on THIS breadboard instance (during component dragging)
            const boardSnapPreviewMap =
              snapPreview?.breadboardInstanceId === instance.instanceId ? snapPreviewHoleMap : undefined;

            // 6. Occupied holes by selected component strictly on THIS breadboard instance
            const boardOccupiedHoles = new Set<string>();
            if (selectedInstanceId) {
              attachments
                .filter(
                  (att) =>
                    att.instanceId === selectedInstanceId &&
                    att.breadboardInstanceId === instance.instanceId
                )
                .forEach((att) => boardOccupiedHoles.add(att.holeId));
            }

            const simState = simulationResult?.componentStates[instance.instanceId];
            const compFault = simulationResult?.faults.find(
              (f) =>
                f.affectedComponentId === instance.instanceId ||
                (instance.definitionId.includes('dc_source') && f.type === 'DIRECT_SUPPLY_SHORT')
            );

            return (
              <ComponentRenderer
                key={instance.instanceId}
                instance={instance}
                definition={definition}
                isSelected={selectedInstanceId === instance.instanceId}
                isWiringMode={isWiringMode}
                attachments={attachments}
                highlightedTerminalIds={compHighlightedTerminalIds}
                highlightedHoleIds={boardHighlightedHoleIds}
                highlightedColor={highlightedColor}
                selectedOccupiedHoleIds={boardOccupiedHoles}
                selectedHoleId={boardSelectedHoleId}
                snapPreviewHoleMap={boardSnapPreviewMap}
                snappedHoleId={boardSnappedHoleId}
                snappedEndpointKey={snappedTarget?.key}
                simulationState={simState}
                faultType={compFault?.type}
                onSelect={(id) => {
                  selectWire(null);
                  selectInstance(id);
                }}
                onStartDrag={handleStartDrag}
                onTerminalClick={handleEndpointClick}
                onHoleClick={handleEndpointClick}
                onSelectHole={selectHole}
              />
            );
          })}

          {/* Layer 2: Jumper Wires Layer */}
          <WireRenderer
            wires={wires}
            instances={instances}
            catalog={PHYSICS_ELECTRICITY_CATALOG}
            activeWireStart={activeWireStart}
            cursorWorldMM={cursorWorldMM}
            snappedEndpoint={snappedTarget}
            activeWireColor={selectedWireColor}
            selectedWireId={selectedWireId}
            reconnectingWire={reconnectingWire}
            showDiagnostics={showDiagnostics}
            showVoltage={simulationSettings.showVoltage}
            nodeVoltages={simulationResult?.nodeVoltages}
            connectivityMap={connectivityGraph.endpointToNodeMap}
            onSelectWire={(id) => {
              selectInstance(null);
              selectWire(id);
            }}
            onStartReconnect={handleStartReconnect}
          />

          {/* Layer 3: Conventional Current Flow Particle Animation Layer */}
          <CurrentFlowOverlay
            wires={wires}
            instances={instances}
            catalog={PHYSICS_ELECTRICITY_CATALOG}
            simulationResult={simulationResult}
            simulationSettings={simulationSettings}
            connectivityMap={connectivityGraph.endpointToNodeMap}
          />

          {/* Layer 4: Voltage Measurements & Delta-V Badges Layer */}
          <VoltageBadgeOverlay
            instances={instances}
            catalog={PHYSICS_ELECTRICITY_CATALOG}
            simulationResult={simulationResult}
            simulationSettings={simulationSettings}
            connectivityMap={connectivityGraph.endpointToNodeMap}
          />

          {/* Empty Canvas Initial Prompt */}
          {instances.length === 0 && (
            <g transform="translate(140, 110)" pointerEvents="none">
              <rect
                width="440"
                height="150"
                rx="12"
                fill="#121722"
                stroke="#293140"
                strokeWidth="1.5"
                strokeDasharray="6,6"
              />
              <text
                x="220"
                y="55"
                fill="#ffffff"
                fontSize="14"
                fontFamily="Inter"
                fontWeight="600"
                textAnchor="middle"
              >
                Interactive Workbench Ready
              </text>
              <text
                x="220"
                y="85"
                fill="#8c909f"
                fontSize="12"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                Place a breadboard or connect components directly via Jumper Wires
              </text>
              <text
                x="220"
                y="115"
                fill="#4edea3"
                fontSize="11"
                fontFamily="JetBrains Mono"
                textAnchor="middle"
              >
                Universal Terminal Connections & 400-Tie Breadboard Snapping Active
              </text>
            </g>
          )}
      </CanvasContainer>

      {/* Simulation Controls Toolbar (Milestone D) */}
      <SimulationToolbar />
    </div>
  );

  return (
    <>
      <WorkspaceShell
        chapterId="electricity"
        labTitle="Circuit Workbench"
        outlinerTitle="Equipment Tray"
        outliner={outlinerContent}
        viewport={viewportContent}
        inspectorTitle="Component Inspector"
        inspector={inspectorContent}
        analysisDockTitle="Circuit Analysis & Faults"
        analysisDock={analysisDockContent}
        onReset={handleResetWorkbench}
      />

      {/* Ephemeral Toast Notification */}
      {notification && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-surface-lowest/95 border border-primary text-white text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 z-50 animate-fade-in font-mono">
          <span className="material-symbols-outlined text-primary text-[17px]">info</span>
          <span>{notification}</span>
        </div>
      )}
    </>
  );
};
