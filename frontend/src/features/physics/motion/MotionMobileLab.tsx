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
import { MotionScene, type MotionTrackModel } from './MotionTrack';
import { PHYS } from './physicsColors';
import type { MotionExperiment } from '../../../engine/physics/motion/experiments';
import type { DockTab, useSceneState } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface MotionMobileLabProps {
  m: MotionTrackModel;
  scene: ReturnType<typeof useSceneState>;
  exp?: MotionExperiment;
  tabs: DockTab[];
  inspector: React.ReactNode;
  alt: string;
  onReset: () => void;
}

/**
 * MotionMobileLab: Mobile-first implementation of Design A for "Motion Laboratory".
 * Standardizes 1D kinematics with a compact ~36vh simulation viewport, dedicated thumb-sized
 * Move Left/Wait/Right buttons, full-width timeline transport, parameter drawer, and docked analysis sheet.
 */
export const MotionMobileLab: React.FC<MotionMobileLabProps> = ({
  m,
  scene,
  exp,
  tabs,
  inspector,
  alt,
  onReset,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const posM = Math.round(m.s.positionCm) / 100;
  const distM = Math.round(m.s.distanceCm) / 100;
  const dispM = Math.round(m.s.displacementCm) / 100;
  const maxTimeS = Math.max(m.total / 1000, 1);
  const currentTimeS = m.tMs / 1000;

  // Cycle playback speed
  const handleCycleSpeed = () => {
    const next = m.rate === 1 ? 2 : m.rate === 2 ? 0.5 : 1;
    m.setRate(next);
  };

  // Convert DockTabs into MobileAnalysisTabs
  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon:
      t.id === 'measurements'
        ? 'speed'
        : t.id === 'graphs'
        ? 'show_chart'
        : t.id === 'data'
        ? 'table_chart'
        : t.id === 'explanation'
        ? 'menu_book'
        : 'school',
    content: t.content,
  }));

  // 1. Simulation Viewport Slot (35–38% screen height)
  const viewportSlot = (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">x:</span>
          <span className="text-primary font-bold" style={{ color: PHYS.position }}>
            {posM} m
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">d:</span>
          <span className="text-amber-400 font-bold" style={{ color: PHYS.distance }}>
            {distM} m
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Δx:</span>
          <span className="text-emerald-400 font-bold" style={{ color: PHYS.displacement }}>
            {dispM} m
          </span>
        </div>
      }
    >
      <div
        data-visual="motionTrack"
        data-testid="motion-track"
        className="w-full h-full min-h-0 flex items-center justify-center p-2"
      >
        <MotionScene
          m={m}
          alt={alt}
          fill
          scene={{
            visibility: scene.visibility,
            lockMap: scene.lockMap,
            selectedId: scene.selectedId,
            onSelect: scene.select,
          }}
        />
      </div>
    </MobileLabViewport>
  );

  // 2. Playback and Timeline Transport Slot
  const transportSlot = (
    <MobileLabTransport
      playing={m.playing}
      onTogglePlay={m.togglePlay}
      onStepBack={m.stepBack}
      onStepForward={m.stepForward}
      onReset={onReset}
      stepBackLabel="-1s"
      stepForwardLabel="+1s"
      time={currentTimeS}
      maxTime={maxTimeS}
      onScrub={(timeSec) => m.scrub(timeSec * 1000)}
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
          {m.rate}x
        </button>
      }
    />
  );

  // 3. Middle Toolbar & Quick-Action Zone
  const toolbarSlot = (
    <div className="w-full flex flex-col gap-2 p-2.5">
      {/* Primary Movement Buttons: Left, Wait, Right (min 48px touch targets) */}
      <div className="grid grid-cols-3 gap-2 w-full">
        <button
          type="button"
          onClick={() => m.moveBy(-m.step)}
          aria-label={`Move left ${m.step} metres`}
          className="min-h-[48px] px-3 rounded-xl border-2 bg-surface-card border-surface-border text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform touch-manipulation hover:border-primary/50"
          data-testid="mobile-move-left"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Left ({m.step}m)</span>
        </button>

        <button
          type="button"
          onClick={() => m.wait()}
          aria-label={`Wait ${m.moveS} seconds at rest`}
          className="min-h-[48px] px-3 rounded-xl border-2 bg-surface-card border-surface-border text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform touch-manipulation hover:border-amber-400/50"
          data-testid="mobile-move-wait"
        >
          <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
          <span>Wait ({m.moveS}s)</span>
        </button>

        <button
          type="button"
          onClick={() => m.moveBy(m.step)}
          aria-label={`Move right ${m.step} metres`}
          className="min-h-[48px] px-3 rounded-xl border-2 bg-surface-card border-surface-border text-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform touch-manipulation hover:border-primary/50"
          data-testid="mobile-move-right"
        >
          <span>Right ({m.step}m)</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      {/* Quick Status / Parameter Trigger Bar */}
      <MobileLabToolbar
        statusText={`Trip: ${m.path.legs.length} leg${m.path.legs.length === 1 ? '' : 's'} · Range: [${m.range[0]}, ${m.range[1]}]m`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Edit Setup"
      />
    </div>
  );

  // 4. Modal Parameter Drawer
  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Track & Motion Setup"
      subtitle={exp ? `Investigation ${exp.id}: ${exp.title}` : 'Free Kinematics Exploration'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  // 5. Docked Analysis Sheet
  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab="measurements"
      title="Telemetry & Graphs"
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
