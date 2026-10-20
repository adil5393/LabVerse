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
import { type ForceCartModel, r2, sg, Track } from './ForceCart';
import { ForceFigure } from './ForceFigure';
import { PHYS } from '../motion/physicsColors';
import { surfaceById } from '../../../engine/physics/forces/forceModel';
import type { ForceExperiment } from '../../../engine/physics/forces/experiments';
import type { FirstLawExperiment } from '../../../engine/physics/forces/firstLaw';
import type { SecondLawExperiment } from '../../../engine/physics/forces/secondLawExperiments';
import type { DockTab, useSceneState } from '../../workspace';
import { BrakingScene, type useBrakingDemo } from './BrakingDemo';

import { useSearchParams } from 'react-router-dom';

export interface ForcesMobileLabProps {
  m: ForceCartModel;
  scene: ReturnType<typeof useSceneState>;
  isBraking: boolean;
  b: ReturnType<typeof useBrakingDemo>;
  exp?: ForceExperiment | FirstLawExperiment | SecondLawExperiment;
  tabs: DockTab[];
  inspector: React.ReactNode;
}

/**
 * ForcesMobileLab: Mobile-first implementation of Design A for "Forces Affect Motion — Free Lab".
 * Compacts the experiment viewport into 35–40% of screen height, groups all playback controls into
 * a thumb-friendly sticky console, places timeline scrubbing in its own full-width row, and provides
 * non-intrusive drawers for parameters and analysis.
 */
export const ForcesMobileLab: React.FC<ForcesMobileLabProps> = ({
  m,
  scene,
  isBraking,
  b,
  exp,
  tabs,
  inspector,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');
  const initialAnalysisOpen = searchParams.get('sheet') === 'analysis';

  // Live telemetry metrics
  const net = m.d.net;
  const netMag = net ? Math.round(net.magnitude * 10) / 10 : 0;
  const accel = r2(netMag / m.setup.massKg);
  const surface = surfaceById(m.setup.surfaceId);

  // Cycle replay speed
  const handleCycleSpeed = () => {
    if (isBraking) return;
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

  // 1. Simulation Viewport Slot (35-38% screen height)
  const viewportSlot = isBraking ? (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">v:</span>
          <span className="text-amber-400 font-bold">{r2(b.s.vehicleV)} m/s</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Rel:</span>
          <span className="text-emerald-400 font-bold">{r2(b.s.relative)} m</span>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col p-1.5 overflow-hidden">
        <div className="shrink-0 h-16">{scene.isVisible('vehicle') ? <BrakingScene b={b} /> : null}</div>
        <div className="flex-1 min-h-0 pt-1">
          <ForceFigure
            object="passenger"
            arrows={b.arrows.filter((a) => a.id !== 'belt' || scene.isVisible('restraint'))}
            net={b.net}
            fixedScale={2.2}
            compact={true}
            showIndividual
            showNet
            alt={`Forces on passenger`}
            listing={false}
            fill
          />
        </div>
      </div>
    </MobileLabViewport>
  ) : (
    <MobileLabViewport
      className="h-[36vh] min-h-[210px] max-h-[270px]"
      telemetry={
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
          <span className="text-slate-400">v:</span>
          <span className="text-cyan-300 font-bold">{sg(m.p.v)} m/s</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">F<sub>net</sub>:</span>
          <span className="text-amber-300 font-bold">{netMag} N</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">a:</span>
          <span className="text-emerald-300 font-bold">{accel} m/s²</span>
        </div>
      }
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        {/* Track Ruler (36px high on mobile) */}
        <div className="w-full h-11 px-2 pt-0.5 border-b border-surface-border/40 shrink-0">
          {scene.isVisible('cart') ? (
            <Track setup={m.setup} tMax={m.tMax} t={m.tt} fixedSpan={40} compact={true} />
          ) : null}
        </div>

        {/* Free-Body Diagram with auto-framed cart & vectors */}
        <div className="flex-1 min-h-0 relative flex items-center justify-center p-1">
          <ForceFigure
            object="cart"
            arrows={m.d.arrows.filter(
              (a) =>
                !(a.id === 'A' && !scene.isVisible('pushA')) &&
                !(a.id === 'B' && !scene.isVisible('pushB')) &&
                !(a.id === 'friction' && !scene.isVisible('surface'))
            )}
            net={m.d.net}
            fixedScale={2.2}
            compact={true}
            showIndividual={m.showIndividual}
            showNet={m.showNetForce}
            alt={m.figureAlt}
            listing={false}
            fill
          />
        </div>
      </div>
    </MobileLabViewport>
  );

  // 2. Playback Transport Slot
  const transportSlot = isBraking ? (
    <MobileLabTransport
      playing={b.playing}
      onTogglePlay={() => b.setPlaying((p) => !p)}
      onReset={b.reset}
      time={b.tt}
      maxTime={10}
      onScrub={(t) => b.setT(t)}
      timeFormatter={(t) => `${r2(t)} s`}
      accentColor={PHYS.time}
    />
  ) : (
    <MobileLabTransport
      playing={m.playing}
      onTogglePlay={m.togglePlay}
      onStepBack={m.stepBack}
      onStepForward={m.stepForward}
      onReset={m.resetTime}
      time={m.tt}
      maxTime={m.tMax}
      onScrub={m.scrub}
      timeFormatter={(t) => `${r2(t)} s`}
      accentColor={PHYS.time}
      extraActions={
        <button
          type="button"
          onClick={handleCycleSpeed}
          className="min-h-[44px] px-2.5 rounded-lg border border-outline-variant bg-surface-container-high text-xs font-mono font-bold text-amber-300 active:bg-surface-variant flex items-center gap-0.5 touch-manipulation"
          aria-label={`Cycle replay speed. Current: ${m.rate}x`}
          data-testid="mobile-speed-button"
        >
          <span>{m.rate}×</span>
        </button>
      }
    />
  );

  // 3. Toggles & Quick Controls Slot
  const toolbarSlot = (
    <div className="space-y-2 pb-2">
      <MobileLabToolbar
        toggles={[
          {
            id: 'individual-forces',
            label: 'Show Forces',
            active: m.showIndividual,
            onToggle: () => m.setShowIndividual((v) => !v),
            activeColor: PHYS.force,
          },
          {
            id: 'net-force',
            label: 'Show Net Force',
            active: m.showNetForce,
            onToggle: () => m.setShowNetForce((v) => !v),
            activeColor: PHYS.netForce,
          },
        ]}
        secondaryRow={
          <div className="grid grid-cols-3 gap-1.5 w-full">
            <button
              type="button"
              onClick={() => setParamsOpen(true)}
              className="min-h-[38px] px-2 rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center gap-1 text-[11px] text-slate-300 active:bg-surface-variant touch-manipulation min-w-0"
              data-testid="mobile-surface-chip"
            >
              <span className="text-slate-400 shrink-0">Surf:</span>
              <span className="font-semibold text-cyan-300 truncate">
                {surface.label.split(' ')[0]}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setParamsOpen(true)}
              className="min-h-[38px] px-2 rounded-lg border border-outline-variant bg-surface-container flex items-center justify-center gap-1 text-[11px] text-slate-300 active:bg-surface-variant touch-manipulation min-w-0"
              data-testid="mobile-mass-chip"
            >
              <span className="text-slate-400 shrink-0">m:</span>
              <span className="font-semibold text-amber-300 truncate">{r2(m.setup.massKg)} kg</span>
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
      />

      {/* Live Scientific Metrics Cards */}
      <div className="grid grid-cols-3 gap-1.5 px-2.5 text-xs">
        <div className="rounded-xl bg-surface-container border border-outline-variant p-2 flex flex-col justify-center min-w-0">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">Velocity</span>
          <span className="text-sm font-mono font-bold text-cyan-300 mt-0.5 truncate">{sg(m.p.v)} m/s</span>
        </div>
        <div className="rounded-xl bg-surface-container border border-outline-variant p-2 flex flex-col justify-center min-w-0">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">Accel (a)</span>
          <span className="text-sm font-mono font-bold text-emerald-300 mt-0.5 truncate">{accel} m/s²</span>
        </div>
        <div className="rounded-xl bg-surface-container border border-outline-variant p-2 flex flex-col justify-center min-w-0">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">F (net)</span>
          <span className="text-sm font-mono font-bold text-amber-300 mt-0.5 truncate">{netMag} N</span>
        </div>
      </div>

      {/* Optional Investigation Banner */}
      {exp && (
        <div className="mx-2.5 p-2.5 rounded-xl border border-primary/30 bg-primary/10 text-xs text-slate-200 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-primary font-bold">
            <span>Investigation {exp.id}: {exp.title}</span>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">{exp.goal}</p>
        </div>
      )}
    </div>
  );

  // 4. Collapsible Bottom Analysis Sheet Slot
  const analysisSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      initialExpanded={initialAnalysisOpen}
      title={exp ? `Investigation ${exp.id}` : 'Analysis & Data'}
      summaryChip={
        <span>
          <strong className="text-amber-300">F<sub>net</sub>:</strong> {netMag} N ·{' '}
          <strong className="text-emerald-300">a:</strong> {accel} m/s²
        </span>
      }
    />
  );

  // 5. Slide-up Parameter Sheet Slot
  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Forces Parameters & Inspector"
    >
      {inspector}
    </MobileLabParameterSheet>
  );

  return (
    <MobileLabShell
      viewport={viewportSlot}
      transport={transportSlot}
      toolbar={toolbarSlot}
      analysisSheet={analysisSlot}
      parameterSheet={parameterSheetSlot}
    />
  );
};
