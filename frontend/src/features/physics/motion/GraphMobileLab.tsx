import React, { useState } from 'react';
import {
  MobileLabViewport,
  MobileLabTransport,
  MobileLabToolbar,
  MobileLabParameterSheet,
  MobileLabAnalysisSheet,
  MobileLabShell,
  type MobileAnalysisTab,
} from '../../workspace/mobile';
import { GraphScene, type useGraphStudio } from './MotionGraphs';
import { PHYS } from './physicsColors';
import type { GraphKind } from '../../../engine/physics/motion/profile';
import type { DockTab, useSceneState } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface GraphMobileLabProps {
  g: ReturnType<typeof useGraphStudio>;
  scene: ReturnType<typeof useSceneState>;
  kinds: GraphKind[];
  tabs: DockTab[];
  inspector: React.ReactNode;
  activeId: string;
  items: { id: string; title: string; goal?: string }[];
  onPick: (id: string) => void;
  listTitle: string;
}

const GRAPH_LABELS: Record<GraphKind, { label: string; symbol: string; color: string }> = {
  xt: { label: 'Position', symbol: 'x–t', color: PHYS.position },
  vt: { label: 'Velocity', symbol: 'v–t', color: PHYS.velocity },
  at: { label: 'Acceleration', symbol: 'a–t', color: PHYS.acceleration },
};

/**
 * GraphMobileLab: Mobile-first implementation of Design A for Motion Graph Studio and Equation Lab.
 * Replaces vertically crushed 3-graph stacks with a touch-friendly single-graph selector,
 * full-width scrubber transport, scenario picker drawer, and telemetry sheet.
 */
export const GraphMobileLab: React.FC<GraphMobileLabProps> = ({
  g,
  scene: _scene,
  kinds,
  tabs,
  inspector,
  activeId,
  items,
  onPick,
  listTitle,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');
  const [activeGraph, setActiveGraph] = useState<GraphKind>(kinds[0] || 'xt');

  const currentTimeS = g.tClamped;
  const maxTimeS = Math.max(g.T, 0.1);

  // Cycle playback speed
  const handleCycleSpeed = () => {
    const next = g.rate === 1 ? 2 : g.rate === 2 ? 0.5 : 1;
    g.setRate(next);
  };

  // Convert DockTabs into MobileAnalysisTabs
  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon:
      t.id === 'measurements'
        ? 'speed'
        : t.id === 'equations'
        ? 'functions'
        : t.id === 'investigation'
        ? 'verified'
        : 'menu_book',
    content: t.content,
  }));

  // 1. Simulation & Graph Viewport Slot
  const viewportSlot = (
    <MobileLabViewport
      className="h-[44vh] min-h-[295px] max-h-[410px] flex flex-col"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">x:</span>
          <span className="font-bold" style={{ color: PHYS.position }}>
            {g.s.x.toFixed(1)} m
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">v:</span>
          <span className="font-bold" style={{ color: PHYS.velocity }}>
            {g.s.v.toFixed(1)} m/s
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">a:</span>
          <span className="font-bold" style={{ color: PHYS.acceleration }}>
            {g.s.a.toFixed(1)} m/s²
          </span>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col p-1.5 min-h-0">
        {/* Graph Kind Selector Tabs */}
        {kinds.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pb-1 shrink-0">
            {kinds.map((k) => {
              const active = activeGraph === k;
              const meta = GRAPH_LABELS[k];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActiveGraph(k)}
                  aria-pressed={active}
                  className={`min-h-[32px] px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
                    active
                      ? 'bg-primary text-slate-950 shadow-sm'
                      : 'bg-surface-container-high text-slate-300 border border-outline-variant hover:text-white'
                  }`}
                  style={active ? { background: meta.color, color: '#090d16' } : {}}
                  data-testid={`mobile-graph-tab-${k}`}
                >
                  <span>{meta.symbol}</span>
                  <span className="hidden xs:inline text-[10px]">({meta.label})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* The Selected Graph Scene - adapts cleanly to container height with touch scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar touch-pan-y pb-2">
          <GraphScene g={g} kinds={[activeGraph]} showTrack={true} />
        </div>
      </div>
    </MobileLabViewport>
  );

  // 2. Playback and Timeline Transport Slot
  const transportSlot = (
    <MobileLabTransport
      playing={g.playing}
      onTogglePlay={g.togglePlay}
      onStepBack={g.stepBack}
      onStepForward={g.stepForward}
      onReset={g.rewind}
      stepBackLabel="-1s"
      stepForwardLabel="+1s"
      time={currentTimeS}
      maxTime={maxTimeS}
      onScrub={(timeSec) => g.scrub(timeSec)}
      timeFormatter={(t) => `${t.toFixed(1)} s`}
      accentColor={PHYS.time}
      extraActions={
        <button
          type="button"
          onClick={handleCycleSpeed}
          className="min-h-[44px] min-w-[44px] px-2 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-mono font-bold text-slate-200 active:bg-surface-variant flex items-center justify-center touch-manipulation"
          title="Playback Speed"
          data-testid="mobile-speed-button"
        >
          {g.rate}x
        </button>
      }
    />
  );

  // 3. Middle Toolbar Slot
  const activeItem = items.find((x) => x.id === activeId);
  const toolbarSlot = (
    <div className="w-full flex flex-col gap-2 p-2.5">
      <MobileLabToolbar
        statusText={`Scenario: ${activeItem?.title || activeId}`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Scenarios & Edit"
      />
    </div>
  );

  // 4. Modal Parameter Drawer
  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Graph Kinematics & Scenarios"
      subtitle={activeItem?.title || 'Preset Configuration'}
    >
      <div className="space-y-4">
        {/* Scenario Selection Grid */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono uppercase text-slate-400 font-bold block">
            {listTitle}
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {items.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onPick(item.id);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between min-h-[44px] ${
                    active
                      ? 'border-primary bg-primary/10 text-white font-bold'
                      : 'border-surface-border bg-surface-card text-slate-300 hover:bg-surface-card/80'
                  }`}
                  data-testid={`mobile-scenario-${item.id}`}
                >
                  <span>{item.title}</span>
                  {active && (
                    <span className="material-symbols-outlined text-[16px] text-primary">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Parameters & Inspector */}
        <div className="border-t border-surface-border pt-3">{inspector}</div>
      </div>
    </MobileLabParameterSheet>
  );

  // 5. Docked Analysis Sheet
  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab="measurements"
      title="Telemetry & Equations"
    />
  );

  return (
    <MobileLabShell
      viewport={viewportSlot}
      transport={transportSlot}
      toolbar={toolbarSlot}
      parameterSheet={parameterSheetSlot}
      analysisSheet={analysisSheetSlot}
    />
  );
};
