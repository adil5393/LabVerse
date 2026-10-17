/**
 * Interactive Workbench Page for Class 9 Circles Laboratory
 *
 * Assembles:
 * - CircleToolbar (Header with experiment selection, modes, undo/redo)
 * - CircleToolRail (Left sidebar with geometry tools)
 * - CircleCanvas (Center viewport with 2D interactive coordinate plane and circle geometry)
 * - CircleInspectorPanel (Right sidebar with live telemetry, theorem proofs, and practice)
 */

import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useCircleStore } from '../../../store/useCircleStore';
import { CircleToolbar } from './CircleToolbar';
import { CircleToolRail } from './CircleToolRail';
import { CircleCanvas } from './CircleCanvas';
import { CircleInspectorPanel } from './CircleInspectorPanel';

export const CircleWorkbenchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setExperiment } = useCircleStore();

  useEffect(() => {
    const expParam = searchParams.get('exp');
    if (expParam) {
      setExperiment(expParam);
    }
  }, [searchParams, setExperiment]);

  return (
    <div className="flex flex-col h-screen w-screen bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <CircleToolbar />

      {/* 2. Main 3-Column Layout */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left: Geometry Tool Rail */}
        <CircleToolRail />

        {/* Center: Interactive Geometry Canvas */}
        <CircleCanvas />

        {/* Right: Live Properties & Theorem Lab */}
        <CircleInspectorPanel />
      </div>
    </div>
  );
};
