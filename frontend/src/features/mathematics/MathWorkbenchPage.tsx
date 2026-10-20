/**
 * Main Mathematics Workbench Page for LabVerse
 *
 * Integrates Top Toolbar, Left Tool Rail, Center Interactive Canvas,
 * and Right Inspector & Educational Panel into a cohesive instrument.
 */

import React, { useEffect, useMemo } from 'react';
import { MathToolRail } from './MathToolRail';
import { MathCanvas } from './MathCanvas';
import { MathInspectorPanel } from './MathInspectorPanel';
import { useMathStore } from '../../store/useMathStore';
import { WorkspaceShell } from '../workspace';

export const MathWorkbenchPage: React.FC = () => {
  const {
    activeTool,
    objects,
    objectOrder,
    measurementOrder,
    setTool,
    undo,
    redo,
    selectObject,
    deleteSelectedObject,
    toggleAxes,
  } = useMathStore();

  const pointsCount = useMemo(
    () => objectOrder.filter((id) => objects[id]?.kind === 'point').length,
    [objects, objectOrder]
  );
  const segmentsCount = useMemo(
    () => objectOrder.filter((id) => objects[id]?.kind === 'segment').length,
    [objects, objectOrder]
  );

  // Global Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing into an input field or contenteditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedMeasurementId: selMeasId, deleteMeasurement: delMeas } = useMathStore.getState();
        if (selMeasId) {
          delMeas(selMeasId);
          return;
        }
        deleteSelectedObject();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          setTool('select');
          break;
        case 'p':
          setTool('point');
          break;
        case 's':
          setTool('segment');
          break;
        case 'l':
          setTool('line');
          break;
        case 'm':
          setTool('distance');
          break;
        case 'd':
          setTool('draw');
          break;
        case 'e':
          setTool('eraser');
          break;
        case 'h':
          setTool('pan');
          break;
        case 'g':
          toggleAxes();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setTool, undo, redo, selectObject, deleteSelectedObject, toggleAxes]);

  const outlinerContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <MathToolRail />
    </div>
  );

  const viewportContent = (
    <main className="flex-1 relative h-full overflow-hidden">
      <MathCanvas />
    </main>
  );

  const inspectorContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <MathInspectorPanel />
    </div>
  );

  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">ACTIVE TOOL</span>
          <span className="text-primary font-bold text-sm uppercase">{activeTool}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">POINTS</span>
          <span className="text-white font-bold text-sm">{pointsCount} placed</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">SEGMENTS</span>
          <span className="text-white font-bold text-sm">{segmentsCount} drawn</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">MEASUREMENTS</span>
          <span className="text-emerald-400 font-bold text-sm">{measurementOrder.length} active</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="coordinate-geometry"
      labTitle="Coordinate Geometry Workbench"
      outlinerTitle="Geometry Tools"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Properties & Proofs"
      inspector={inspectorContent}
      analysisDockTitle="Geometric Telemetry & Coordinates"
      analysisDock={analysisDockContent}
    />
  );
};
