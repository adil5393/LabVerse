/**
 * States of Matter Workbench Page for LabVerse Chemistry Laboratory (Milestone C1)
 *
 * Assembles:
 * - ChemistryToolbar (Header with experiment controls, mode switch, play/pause, speed, reset)
 * - SimulationControls (Left sidebar with substance, thermal power, volume/piston, model count, visuals)
 * - ParticleChamber (Center viewport with 2D canvas particle dynamics, flame/ice burner, piston interaction)
 * - ScientificInspector (Right sidebar with telemetry, dynamic heating curve, guided stepper, and theory)
 */

import React from 'react';
import { ChemistryToolbar } from './ChemistryToolbar';
import { SimulationControls } from './SimulationControls';
import { ParticleChamber } from './ParticleChamber';
import { ScientificInspector } from './ScientificInspector';

export const StatesOfMatterWorkbench: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen bg-surface-lowest text-slate-100 overflow-hidden font-sans">
      {/* 1. Header Toolbar */}
      <ChemistryToolbar />

      {/* 2. Main Workbench 3-Column Layout */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {/* Left Column: Simulation Controls */}
        <SimulationControls />

        {/* Center Column: Particle Chamber Simulation Viewport */}
        <ParticleChamber />

        {/* Right Column: Scientific Inspector & Dynamic Heating Curve */}
        <ScientificInspector />
      </div>
    </div>
  );
};
