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
import { PHYS } from '../motion/physicsColors';
import {
  computeWork,
  describeWork,
  fmt,
  type WorkSetup,
  type WorkResult,
} from '../../../engine/physics/work/workModel';
import { SimulationViewport, PropertiesInspector } from './components';
import { FsGraph } from './WorkView';
import { useSearchParams } from 'react-router-dom';

export interface WorkMobileLabProps {
  setup: WorkSetup;
  result: WorkResult;
  progress: number;
  playing: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onProgressChange: (p: number) => void;
  onSetupChange: (patch: Partial<WorkSetup>) => void;
  showVertical: boolean;
  onShowVerticalChange: (show: boolean) => void;
  selectedObjectId: string | null;
  onSelectObject: (id: string | null) => void;
  visibilityMap: Record<string, boolean>;
  lockMap: Record<string, boolean>;
  alt?: string;
  expTitle?: string;
}

/**
 * WorkMobileLab: Mobile-first Design A layout for the Work Laboratory (/physics/work/lab).
 * Replaces the cramped desktop layout and floating inspector button with a compact 36vh
 * viewport, large touch transport, parameter bottom sheet, and docked analysis sheet.
 */
export const WorkMobileLab: React.FC<WorkMobileLabProps> = ({
  setup,
  result: r,
  progress,
  playing,
  onTogglePlay,
  onReset,
  onProgressChange,
  onSetupChange,
  showVertical,
  onShowVerticalChange,
  selectedObjectId,
  onSelectObject,
  visibilityMap,
  lockMap,
  alt = 'Cart on a track under an applied force',
  expTitle,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const SIM_SECONDS = 3;
  const currentSimTime = progress * SIM_SECONDS;

  const analysisTabs: MobileAnalysisTab[] = [
    {
      id: 'measurements',
      label: 'Measurements',
      icon: 'speed',
      content: (
        <div className="p-3 space-y-3 font-mono text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-slate-400 text-[10px] uppercase">Applied Work</span>
              <p className="text-sm font-bold text-primary mt-0.5">{fmt(r.applied.work)} J</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-slate-400 text-[10px] uppercase">Friction Work</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{fmt(r.frictionWork)} J</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-slate-400 text-[10px] uppercase">Net Work (W_net)</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">{fmt(r.netWork)} J</p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-card border border-surface-border">
              <span className="text-slate-400 text-[10px] uppercase">Displacement</span>
              <p className="text-sm font-bold text-slate-200 mt-0.5">{fmt(setup.displacement)} m</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {describeWork(r)}
          </p>
        </div>
      ),
    },
    {
      id: 'graph',
      label: 'F-s Graph',
      icon: 'show_chart',
      content: (
        <div className="p-3 flex flex-col items-center justify-center">
          <FsGraph r={r} />
        </div>
      ),
    },
  ];

  const viewportSlot = (
    <MobileLabViewport
      className="h-[46dvh] min-h-[380px] max-h-[430px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">F:</span>
          <span className="text-primary font-bold" style={{ color: PHYS.force }}>
            {setup.forceN}N
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">s:</span>
          <span className="text-amber-400 font-bold" style={{ color: PHYS.displacement }}>
            {setup.displacement}m
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">W:</span>
          <span className="text-emerald-400 font-bold" style={{ color: PHYS.force }}>
            {fmt(r.netWork)}J
          </span>
        </div>
      }
    >
      <div className="w-full h-full min-h-0 flex items-center justify-center p-1">
        <SimulationViewport
          result={r}
          progress={progress}
          showVertical={showVertical}
          onShowVerticalChange={onShowVerticalChange}
          alt={alt}
          playing={playing}
          onTogglePlay={onTogglePlay}
          onReset={onReset}
          onProgressChange={onProgressChange}
          selectedObjectId={selectedObjectId}
          onSelectObject={onSelectObject}
          onSetupChange={onSetupChange}
          lockMap={lockMap}
          showCart={visibilityMap.cart ?? true}
          showTrack={visibilityMap.track ?? true}
          showCaliper={visibilityMap.caliper ?? true}
          showVectors={visibilityMap.force ?? true}
        />
      </div>
    </MobileLabViewport>
  );

  const transportSlot = (
    <MobileLabTransport
      playing={playing}
      onTogglePlay={onTogglePlay}
      onReset={onReset}
      time={currentSimTime}
      maxTime={SIM_SECONDS}
      onScrub={(timeSec) => onProgressChange(timeSec / SIM_SECONDS)}
      timeFormatter={(t) => `${t.toFixed(1)} s`}
      accentColor={PHYS.force}
    />
  );

  const toolbarSlot = (
    <div className="w-full">
      <MobileLabToolbar
        toggles={[
          {
            id: 'vertical-forces',
            label: 'Weight & Normal',
            active: showVertical,
            onToggle: () => onShowVerticalChange(!showVertical),
            activeColor: PHYS.vertical,
          },
        ]}
        secondaryRow={
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => setParamsOpen(true)}
              className="min-h-[38px] px-2 rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center gap-1 text-[11px] text-slate-300 active:bg-surface-variant touch-manipulation min-w-0"
              data-testid="mobile-work-force-chip"
            >
              <span className="text-slate-400 shrink-0">F:</span>
              <span className="font-semibold text-primary truncate" style={{ color: PHYS.force }}>
                {setup.forceN}N
              </span>
            </button>

            <button
              type="button"
              onClick={() => setParamsOpen(true)}
              className="min-h-[38px] px-2 rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center gap-1 text-[11px] text-slate-300 active:bg-surface-variant touch-manipulation min-w-0"
              data-testid="mobile-work-mass-chip"
            >
              <span className="text-slate-400 shrink-0">m:</span>
              <span className="font-semibold text-amber-300 truncate">{setup.massKg}kg</span>
            </button>

            <button
              type="button"
              onClick={() => setParamsOpen(true)}
              className="min-h-[38px] px-2 rounded-lg border border-primary/50 bg-primary/15 text-primary text-xs font-bold flex items-center justify-center gap-1 active:bg-primary/25 touch-manipulation shadow-sm min-w-0"
              data-testid="open-params-button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Params</span>
            </button>
          </div>
        }
        statusText={`m: ${setup.massKg}kg · F: ${setup.forceN}N · s: ${setup.displacement}m · W: ${fmt(r.netWork)}J`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Work Parameters"
      />
    </div>
  );

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Work Model Properties"
      subtitle={expTitle ? `Investigation: ${expTitle}` : 'Cart Under Constant Applied Force'}
    >
      <div className="w-full px-0.5">
        <PropertiesInspector
          setup={setup}
          result={r}
          onChange={(patch) => {
            const next = { ...setup, ...patch };
            if (computeWork(next).valid) onSetupChange(patch);
          }}
          showVertical={showVertical}
          onShowVerticalChange={onShowVerticalChange}
          selectedObjectId={selectedObjectId}
          lockMap={lockMap}
          compact={true}
        />
      </div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab="measurements"
      title="Measurements & F-s Graph"
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
