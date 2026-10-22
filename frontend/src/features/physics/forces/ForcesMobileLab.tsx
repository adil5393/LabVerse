import { ForceActivityPicker, ForceSceneChoice, type ForceSceneView } from './ForcesSession';
import React, { useState } from 'react';
import {
  MobileLabTransport,
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
  activities?: { id: string; title: string }[];
  onSelectActivity?: (id: string | null) => void;
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
  activities = [],
  onSelectActivity,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');
  const [view, setView] = useState<ForceSceneView>('motion');
  const initialAnalysisOpen = searchParams.get('sheet') === 'analysis';

  const netMag = m.p.net;
  const accel = sg(m.p.a);
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

  const viewportSlot = (
    <div className="app-chrome forces-session p-3 space-y-3">
      {onSelectActivity && <ForceActivityPicker value={exp?.id ?? null} items={activities} onChange={onSelectActivity} />}
      <p className="force-session-hint">{exp ? exp.goal : 'Change one thing. Press Play. Notice what changes.'}</p>
      <ForceSceneChoice value={view} onChange={setView} />
      <div className="force-scene">
        {view === 'motion' ? (isBraking ? (scene.isVisible('vehicle') && <BrakingScene b={b} />) : (scene.isVisible('cart') && <Track setup={m.setup} tMax={m.tMax} t={m.tt} fixedSpan={40} compact />)) : (
          <ForceFigure object={isBraking ? 'passenger' : 'cart'}
            arrows={isBraking ? b.arrows.filter(a => a.id !== 'belt' || scene.isVisible('restraint')) : m.d.arrows.filter(a => !(a.id === 'A' && !scene.isVisible('pushA')) && !(a.id === 'B' && !scene.isVisible('pushB')) && !(a.id === 'friction' && !scene.isVisible('surface')))}
            net={isBraking ? b.net : m.d.net} showIndividual={isBraking || m.showIndividual} showNet={isBraking || m.showNetForce}
            alt={isBraking ? 'Forces on the passenger' : m.figureAlt} listing={false} />
        )}
      </div>
      <dl className="force-quick-readings">
        <div><dt>{isBraking ? 'Vehicle' : 'Velocity'}</dt><dd>{sg(isBraking ? b.s.vehicleV : m.p.v)} m/s</dd></div>
        <div><dt>{isBraking ? 'Passenger' : 'Acceleration'}</dt><dd>{isBraking ? `${sg(b.s.passengerV)} m/s` : `${accel} m/s²`}</dd></div>
        <div><dt>{isBraking ? 'Separation' : 'Net force'}</dt><dd>{isBraking ? `${r2(b.s.relative)} m` : `${sg(netMag)} N`}</dd></div>
      </dl>
    </div>
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

  const toolbarSlot = (
    <div className="app-chrome forces-session p-3 space-y-3" data-testid="mobile-lab-toolbar">
      <div className="force-setup-row"><p>{isBraking ? 'Vehicle and passenger' : `${r2(m.setup.massKg)} kg cart · ${surface.label}`}</p><button type="button" onClick={() => setParamsOpen(true)} data-testid="open-params-button">Edit Setup</button></div>
      {!isBraking && view === 'forces' && <div className="flex flex-wrap gap-2">
        <button type="button" data-toggle="individual" aria-pressed={m.showIndividual} onClick={() => m.setShowIndividual(v => !v)}>Individual forces</button>
        <button type="button" data-toggle="net" aria-pressed={m.showNetForce} onClick={() => m.setShowNetForce(v => !v)}>Net force</button>
      </div>}
    </div>
  );

  // 4. Collapsible Bottom Analysis Sheet Slot
  const analysisSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      initialExpanded={initialAnalysisOpen}
      title={exp ? `Investigation ${exp.id}` : 'Analysis & Data'}
      summaryChip={
        isBraking ? <span>Passenger force: {sg(b.s.passengerForce)} N</span> : <span>
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
      title="Change the experiment"
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
