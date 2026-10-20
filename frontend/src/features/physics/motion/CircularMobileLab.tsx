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
import { CircleScene, type useCircularMotion } from './CircularMotion';
import { PHYS } from './physicsColors';
import type { DockTab, useSceneState } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface CircularMobileLabProps {
  c: ReturnType<typeof useCircularMotion>;
  scene: ReturnType<typeof useSceneState>;
  tabs: DockTab[];
  inspector: React.ReactNode;
}

/**
 * CircularMobileLab: Mobile-first implementation of Design A for Circular Motion Laboratory.
 */
export const CircularMobileLab: React.FC<CircularMobileLabProps> = ({
  c,
  scene,
  tabs,
  inspector,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const speedVal = (c.s.speed).toFixed(1);
  const revsVal = (c.s.revolutions).toFixed(1);

  // Convert DockTabs into MobileAnalysisTabs
  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon: t.id === 'measurements' ? 'speed' : 'menu_book',
    content: t.content,
  }));

  // 1. Simulation Viewport Slot
  const viewportSlot = (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">v:</span>
          <span className="font-bold" style={{ color: PHYS.velocity }}>
            {speedVal} m/s
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">r:</span>
          <span className="font-bold text-amber-400">{c.setup.radiusM} m</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Turns:</span>
          <span className="font-bold text-emerald-400">{revsVal}</span>
        </div>
      }
    >
      <div className="w-full h-full flex items-center justify-center p-1.5">
        <CircleScene
          c={c}
          hidden={{
            velocity: !scene.isVisible('velocity'),
            displacement: !scene.isVisible('displacement'),
            arc: !scene.isVisible('arc'),
            acceleration: !scene.isVisible('acceleration'),
          }}
        />
      </div>
    </MobileLabViewport>
  );

  // 2. Transport Slot
  const transportSlot = (
    <MobileLabTransport
      playing={c.playing}
      onTogglePlay={c.togglePlay}
      onStepBack={c.stepBack}
      onStepForward={c.stepForward}
      onReset={c.rewind}
      stepBackLabel="-1s"
      stepForwardLabel="+1s"
      time={c.tt}
      maxTime={c.tMax}
      onScrub={(timeSec) => c.jumpTo(timeSec)}
      timeFormatter={(t) => `${t.toFixed(1)} s`}
      accentColor={PHYS.time}
      extraActions={
        <button
          type="button"
          onClick={() => c.jumpTo(c.setup.periodS)}
          className="min-h-[44px] min-w-[44px] px-2 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-mono font-bold text-slate-200 active:bg-surface-variant flex items-center justify-center touch-manipulation"
          title="Jump one full turn"
          data-testid="jump-full-turn"
        >
          1 Turn
        </button>
      }
    />
  );

  // 3. Middle Toolbar Slot
  const toolbarSlot = (
    <div className="w-full flex flex-col gap-2 p-2.5">
      <div className="flex items-center gap-2 w-full">
        <button
          type="button"
          onClick={() =>
            c.change({
              spin:
                c.setup.spin === 'counterclockwise' ? 'clockwise' : 'counterclockwise',
            })
          }
          className="flex-1 min-h-[46px] px-3 rounded-xl border border-outline-variant bg-surface-card text-xs font-bold text-slate-100 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>{c.setup.spin === 'counterclockwise' ? '↺ Anticlockwise' : '↻ Clockwise'}</span>
        </button>

        <MobileLabToolbar
          statusText={`r=${c.setup.radiusM}m · T=${c.setup.periodS}s`}
          onOpenParameters={() => setParamsOpen(true)}
          parameterButtonLabel="Edit Orbit"
        />
      </div>
    </div>
  );

  // 4. Modal Parameter Drawer
  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Circular Motion Setup"
      subtitle="Orbit radius, period, and vector toggles"
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  // 5. Docked Analysis Sheet
  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab="measurements"
      title="Circular Telemetry"
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
