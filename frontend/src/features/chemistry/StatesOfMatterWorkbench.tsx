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
import { SimulationControls } from './SimulationControls';
import { ParticleChamber } from './ParticleChamber';
import { ScientificInspector } from './ScientificInspector';
import { useChemistryStore } from '../../store/useChemistryStore';
import { SUBSTANCES } from '../../engine/chemistry/substances';
import { WorkspaceShell } from '../workspace';

export const StatesOfMatterWorkbench: React.FC = () => {
  const { thermoState, substanceId, config } = useChemistryStore();
  const currentSubstance = SUBSTANCES[substanceId];

  const outlinerContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <SimulationControls />
    </div>
  );

  const viewportContent = (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden">
      <ParticleChamber />
    </div>
  );

  const inspectorContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <ScientificInspector />
    </div>
  );

  const analysisDockContent = (
    <div className="p-3 text-xs space-y-2 font-mono">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">TEMPERATURE</span>
          <span className="text-emerald-400 font-bold text-sm">
            {Math.round(thermoState.temperatureK)} K ({Math.round(thermoState.temperatureK - 273.15)} &deg;C)
          </span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">ACTIVE PHASE</span>
          <span className="text-white font-bold text-sm uppercase">{thermoState.phase}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">SUBSTANCE</span>
          <span className="text-white font-bold text-sm">{currentSubstance.name}</span>
        </div>
        <div className="p-2 rounded bg-surface-card border border-surface-border">
          <span className="text-outline text-[10px] block">PARTICLES</span>
          <span className="text-white font-bold text-sm">{config.particleCount} active</span>
        </div>
      </div>
    </div>
  );

  return (
    <WorkspaceShell
      chapterId="states-of-matter"
      labTitle="States of Matter Simulator"
      outlinerTitle="Simulation Controls"
      outliner={outlinerContent}
      viewport={viewportContent}
      inspectorTitle="Thermodynamics Inspector"
      inspector={inspectorContent}
      analysisDockTitle="Phase Diagnostics & Heat Telemetry"
      analysisDock={analysisDockContent}
    />
  );
};
