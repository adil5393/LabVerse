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
import type { DockTab, useTimedPlayback } from '../../workspace';
import type { PowerSetup, PowerResult } from '../../../engine/physics/work/power';
import { useSearchParams } from 'react-router-dom';

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

export interface MachinesMobileLabProps {
  app: 'ramp' | 'pulley' | 'lever';
  sceneView: React.ReactNode;
  playback: ReturnType<typeof useTimedPlayback>;
  runSeconds: number;
  progress: number;
  runLabel: string;
  exp?: { id: string; title: string } | null;
  tabs: DockTab[];
  inspector: React.ReactNode;
  onReset: () => void;
  onSelectApparatus: (app: 'ramp' | 'pulley' | 'lever') => void;
}

/**
 * MachinesMobileLab: Design A mobile layout for Simple Machines Laboratory.
 * Allows quick switching between inclined plane, pulley, and lever, with compact
 * animation viewport, progress scrubbing, parameter drawer, and docked measurements/POE.
 */
export const MachinesMobileLab: React.FC<MachinesMobileLabProps> = ({
  app,
  sceneView,
  playback,
  runSeconds,
  progress,
  runLabel,
  exp,
  tabs,
  inspector,
  onReset,
  onSelectApparatus,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon: t.id === 'measurements' ? 'speed' : 'school',
    content: t.content,
  }));

  const appLabel = app === 'ramp' ? 'Inclined Plane' : app === 'pulley' ? 'Pulley' : 'Lever';

  const viewportSlot = (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">Machine:</span>
          <span className="text-primary font-bold" style={{ color: PHYS.force }}>
            {appLabel}
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Prog:</span>
          <span className="text-amber-400 font-bold" style={{ color: PHYS.position }}>
            {Math.round(progress * 100)}%
          </span>
        </div>
      }
    >
      <div
        data-chapter="machines-lab"
        data-testid="machines-view"
        className="w-full h-full min-h-0 flex items-center justify-center p-2"
      >
        {sceneView}
      </div>
    </MobileLabViewport>
  );

  const transportSlot = (
    <MobileLabTransport
      playing={playback.playing}
      onTogglePlay={playback.toggle}
      onReset={onReset}
      time={playback.t}
      maxTime={runSeconds}
      onScrub={(timeSec) => playback.scrub(timeSec)}
      timeFormatter={(t) => `${Math.round((t / runSeconds) * 100)}%`}
      accentColor={PHYS.force}
    />
  );

  const toolbarSlot = (
    <div className="w-full flex flex-col gap-2 p-2.5">
      {/* Quick Machine Type Selector Bar */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        {(['ramp', 'pulley', 'lever'] as const).map((type) => {
          const active = app === type;
          const label = type === 'ramp' ? 'Ramp' : type === 'pulley' ? 'Pulley' : 'Lever';
          const icon = type === 'ramp' ? 'trending_up' : type === 'pulley' ? 'settings' : 'balance';
          return (
            <button
              key={type}
              type="button"
              onClick={() => onSelectApparatus(type)}
              className={`min-h-[44px] px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all touch-manipulation ${
                active
                  ? 'bg-primary/20 border-primary text-primary font-bold'
                  : 'bg-surface-card border-surface-border text-slate-300 hover:border-slate-500'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <MobileLabToolbar
        statusText={`${appLabel} · ${runLabel}: ${Math.round(progress * 100)}%`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Machine Setup"
      />
    </div>
  );

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title={`${appLabel} Properties`}
      subtitle={exp ? `Investigation ${exp.id}: ${exp.title}` : 'Mechanical Advantage & Efficiency'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab={exp ? 'investigation' : 'measurements'}
      title="Apparatus Telemetry & Observations"
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

export interface PowerMobileLabProps {
  s: PowerSetup;
  power: PowerResult;
  sceneView: React.ReactNode;
  exp?: { id: string; title: string } | null;
  tabs: DockTab[];
  inspector: React.ReactNode;
}

/**
 * PowerMobileLab: Design A mobile layout for Power Laboratory.
 * Focuses on rate of energy transfer, providing clear P = W/t telemetry,
 * parameter drawer for power sources, and POE investigation sheets.
 */
export const PowerMobileLab: React.FC<PowerMobileLabProps> = ({
  s,
  power,
  sceneView,
  exp,
  tabs,
  inspector,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon: t.id === 'measurements' ? 'speed' : 'school',
    content: t.content,
  }));

  const viewportSlot = (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">W:</span>
          <span className="text-primary font-bold" style={{ color: PHYS.force }}>
            {f2(power.work)}J
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">t:</span>
          <span className="text-amber-400 font-bold" style={{ color: PHYS.time }}>
            {f2(s.timeS)}s
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">P:</span>
          <span className="text-emerald-400 font-bold" style={{ color: PHYS.speed }}>
            {f2(power.power)}W
          </span>
        </div>
      }
    >
      <div
        data-chapter="power-lab"
        data-testid="power-scene"
        className="w-full h-full min-h-0 flex items-center justify-center p-2"
      >
        {sceneView}
      </div>
    </MobileLabViewport>
  );

  const toolbarSlot = (
    <div className="w-full p-2.5">
      <MobileLabToolbar
        statusText={`Scenario: ${s.scenario} · Power: ${f2(power.power)} W`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Power Setup"
      />
    </div>
  );

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Power Model Properties"
      subtitle={exp ? `Investigation ${exp.id}: ${exp.title}` : 'Rate of Doing Work (P = W / t)'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab={exp ? 'investigation' : 'measurements'}
      title="Power Calculations & Observations"
    />
  );

  return (
    <MobileLabShell
      viewport={viewportSlot}
      toolbar={toolbarSlot}
      parameterSheet={parameterSheetSlot}
      analysisSheet={analysisSheetSlot}
    />
  );
};
