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
import { KineticScene } from './KineticView';
import { PHYS } from '../motion/physicsColors';
import type { KineticExperiment } from '../../../engine/physics/work/kineticExperiments';
import { kineticAt, type KineticResult } from '../../../engine/physics/work/kineticModel';
import type { DockTab, useSceneState, useTimedPlayback } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface KineticMobileLabProps {
  r: KineticResult;
  playback: ReturnType<typeof useTimedPlayback>;
  rate: number;
  setRate: (rate: number) => void;
  scene: ReturnType<typeof useSceneState>;
  exp?: KineticExperiment | null;
  tabs: DockTab[];
  inspector: React.ReactNode;
  alt: string;
  onForce: (f: number) => void;
  onDisplacement: (d: number) => void;
}

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

/**
 * KineticMobileLab: Mobile-first implementation of Design A for "Work-Energy Laboratory".
 * Provides a dedicated mobile viewport (36vh), live W_net / K / v telemetry, touch transport,
 * parameter drawer, and docked POE / analysis sheet.
 */
export const KineticMobileLab: React.FC<KineticMobileLabProps> = ({
  r,
  playback,
  rate,
  setRate,
  scene,
  exp,
  tabs,
  inspector,
  alt,
  onForce,
  onDisplacement,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const cycleSpeed = () => {
    const next = rate === 1 ? 2 : rate === 2 ? 0.5 : 1;
    setRate(next);
  };

  const now = r.valid ? kineticAt(r, playback.t) : null;

  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon:
      t.id === 'measurements'
        ? 'speed'
        : t.id === 'graphs'
        ? 'show_chart'
        : t.id === 'explanation'
        ? 'menu_book'
        : 'school',
    content: t.content,
  }));

  const viewportSlot = (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        now ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
            <span className="text-slate-400">v:</span>
            <span className="text-primary font-bold" style={{ color: PHYS.velocity }}>
              {f2(now.v)}m/s
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">W:</span>
            <span className="text-amber-400 font-bold" style={{ color: PHYS.force }}>
              {f2(r.wNet)}J
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">K:</span>
            <span className="text-emerald-400 font-bold" style={{ color: PHYS.speed }}>
              {f2(now.K)}J
            </span>
          </div>
        ) : undefined
      }
    >
      <div
        data-visual="kineticLab"
        data-testid="kinetic-view"
        className="w-full h-full min-h-0 flex items-center justify-center p-2"
      >
        {r.valid ? (
          <KineticScene
            r={r}
            t={playback.t}
            alt={alt}
            interaction={{
              selectedId: scene.selectedId,
              onSelect: scene.select,
              locks: scene.lockMap,
              visibility: scene.visibility,
              onForce,
              onDisplacement,
            }}
          />
        ) : (
          <p
            role="alert"
            className="text-xs rounded-xl border px-3 py-2 mx-auto text-rose-300 border-rose-500/40 bg-rose-950/20"
          >
            Cannot run: {r.reason}
          </p>
        )}
      </div>
    </MobileLabViewport>
  );

  const transportSlot = r.valid ? (
    <MobileLabTransport
      playing={playback.playing}
      onTogglePlay={playback.toggle}
      onReset={playback.reset}
      time={playback.t}
      maxTime={r.tEnd}
      onScrub={(timeSec) => playback.scrub(timeSec)}
      timeFormatter={(t) => `${f2(t)} s`}
      accentColor={PHYS.force}
      extraActions={
        <button
          type="button"
          onClick={cycleSpeed}
          className="min-h-[44px] min-w-[44px] px-2 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-mono font-bold text-slate-200 active:bg-surface-variant flex items-center justify-center touch-manipulation"
          title="Playback Speed"
          data-testid="mobile-kinetic-speed"
        >
          {rate}x
        </button>
      }
    />
  ) : undefined;

  const toolbarSlot = (
    <div className="w-full p-2.5">
      <MobileLabToolbar
        statusText={`m: ${r.valid ? r.setup.massKg : 0}kg · F: ${r.valid ? r.setup.netForce : 0}N · s: ${r.valid ? r.setup.displacement : 0}m · ΔK: ${r.valid ? r.wNet : 0}J`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Work Setup"
      />
    </div>
  );

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Work-Energy Properties"
      subtitle={exp ? `Investigation ${exp.id}: ${exp.title}` : 'Work-Energy Theorem (W = ΔK)'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab={exp ? 'investigation' : 'measurements'}
      title="Measurements & Graphs"
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
