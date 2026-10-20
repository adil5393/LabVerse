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
import { EnergyScene, EnergyBars } from './EnergyView';
import { PHYS } from '../motion/physicsColors';
import type { EnergyExperiment } from '../../../engine/physics/work/energyExperiments';
import type { EnergyResult, EnergyState } from '../../../engine/physics/work/energyLab';
import type { DockTab, useSceneState, useTimedPlayback } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface EnergyMobileLabProps {
  r: EnergyResult;
  st: EnergyState | null;
  playback: ReturnType<typeof useTimedPlayback>;
  rate: number;
  setRate: (rate: number) => void;
  scene: ReturnType<typeof useSceneState>;
  exp?: EnergyExperiment | null;
  tabs: DockTab[];
  inspector: React.ReactNode;
  alt: string;
  onHeight: (h: number) => void;
  onReference: (h: number) => void;
}

const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');

/**
 * EnergyMobileLab: Mobile-first implementation of Design A for "Energy Laboratory".
 * Provides a dedicated mobile viewport (36vh), energy bar telemetry, touch transport,
 * parameter drawer, and docked POE / analysis sheet.
 */
export const EnergyMobileLab: React.FC<EnergyMobileLabProps> = ({
  r,
  st,
  playback,
  rate,
  setRate,
  scene,
  exp,
  tabs,
  inspector,
  alt,
  onHeight,
  onReference,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');

  const cycleSpeed = () => {
    const next = rate === 1 ? 2 : rate === 2 ? 0.5 : 1;
    setRate(next);
  };

  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon:
      t.id === 'measurements'
        ? 'speed'
        : t.id === 'graph'
        ? 'show_chart'
        : t.id === 'explanation'
        ? 'menu_book'
        : 'school',
    content: t.content,
  }));

  const viewportSlot = (
    <MobileLabViewport
      className="h-[38vh] min-h-[220px] max-h-[280px]"
      telemetry={
        st ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
            <span className="text-slate-400">h:</span>
            <span className="text-primary font-bold" style={{ color: PHYS.position }}>
              {f2(st.h)}m
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">v:</span>
            <span className="text-amber-400 font-bold" style={{ color: PHYS.velocity }}>
              {f2(st.v)}m/s
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">E:</span>
            <span className="text-emerald-400 font-bold" style={{ color: PHYS.speed }}>
              {f2(st.total)}J
            </span>
          </div>
        ) : undefined
      }
    >
      <div
        data-chapter="energy-lab"
        data-visual="energyLab"
        data-testid="energy-view"
        className="w-full h-full min-h-0 flex flex-col justify-center gap-2 p-1.5"
      >
        {r.valid && st ? (
          <>
            <div className="flex-1 min-h-0 flex items-center justify-center">
              <EnergyScene
                r={r}
                st={st}
                alt={alt}
                interaction={{
                  selectedId: scene.selectedId,
                  onSelect: scene.select,
                  locks: scene.lockMap,
                  visibility: scene.visibility,
                  onHeight,
                  onReference,
                }}
              />
            </div>
            <div className="shrink-0 px-2 pb-1">
              <EnergyBars r={r} st={st} />
            </div>
          </>
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
          data-testid="mobile-energy-speed"
        >
          {rate}x
        </button>
      }
    />
  ) : undefined;

  const toolbarSlot = (
    <div className="w-full p-2.5">
      <MobileLabToolbar
        statusText={`m: ${r.valid ? r.setup.massKg : 0}kg · h₀: ${r.valid ? r.setup.startHeight : 0}m · θ: ${r.valid ? r.setup.angleDeg : 0}° · μ: ${r.valid ? r.setup.mu : 0}`}
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Energy Setup"
      />
    </div>
  );

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Energy Model Properties"
      subtitle={exp ? `Investigation ${exp.id}: ${exp.title}` : 'Conservation of Mechanical Energy'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab={exp ? 'investigation' : 'measurements'}
      title="Data, Graphs & Predictions"
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
