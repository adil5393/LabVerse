import { ForceActivityPicker, ForceSceneChoice, type ForceSceneView } from './ForcesSession';
import React, { useState } from 'react';
import {
  MobileLabTransport,
  MobileLabParameterSheet,
  MobileLabAnalysisSheet,
  MobileLabShell,
  type MobileAnalysisTab,
} from '../../workspace/mobile';
import { TwoBodyScene, type useTwoBody, PairIdentifyView } from './TwoBody';
import { PHYS } from '../motion/physicsColors';
import type { DockTab, useSceneState } from '../../workspace';
import { useSearchParams } from 'react-router-dom';

export interface TwoBodyMobileLabProps {
  m: ReturnType<typeof useTwoBody>;
  scene: ReturnType<typeof useSceneState>;
  pairExp: any;
  id: string | null;
  tabs: DockTab[];
  inspector: React.ReactNode;
  onReset?: () => void;
  comparePredict?: React.ReactNode;
  activities?: { id: string; title: string }[];
  onSelectActivity?: (id: string | null) => void;
}

/**
 * TwoBodyMobileLab: Mobile-first implementation of Design A for Two-Body Interactions & Third Law Studio.
 */
export const TwoBodyMobileLab: React.FC<TwoBodyMobileLabProps> = ({
  m,
  scene,
  pairExp,
  id,
  tabs,
  inspector,
  onReset,
  comparePredict,
  activities = [],
  onSelectActivity,
}) => {
  const [searchParams] = useSearchParams();
  const [paramsOpen, setParamsOpen] = useState(searchParams.get('sheet') === 'params');
  const [view, setView] = useState<ForceSceneView>('motion');

  const analysisTabs: MobileAnalysisTab[] = tabs.map((t) => ({
    id: t.id,
    label: t.label,
    icon: t.id === 'measurements' ? 'speed' : 'school',
    content: t.content,
  }));

  const viewportSlot = (
    <div className="app-chrome forces-session p-3 space-y-3">
      {onSelectActivity && <ForceActivityPicker value={id} items={activities} onChange={onSelectActivity} />}
      {!pairExp && <>
        <p className="force-session-hint">Watch the carts move, then compare the forces. Their interaction is equal and opposite.</p>
        <ForceSceneChoice value={view} onChange={setView} />
        <TwoBodyScene m={m} view={view} hidden={{ A: !scene.isVisible('A'), B: !scene.isVisible('B'), link: !scene.isVisible('link') }} />
        <dl className="force-quick-readings">
          <div><dt>Velocity A</dt><dd>{m.p.vA.toFixed(1)} m/s</dd></div>
          <div><dt>Velocity B</dt><dd>{m.p.vB.toFixed(1)} m/s</dd></div>
          <div><dt>Total momentum</dt><dd>{m.p.pTotal.toFixed(1)} kg·m/s</dd></div>
        </dl>
      </>}
      {pairExp && id === 'S' && comparePredict}
      {pairExp && id !== 'S' && <PairIdentifyView key={pairExp.id} scenarioId={pairExp.scenarios[0]} />}
    </div>
  );

  const transportSlot = !pairExp ? (
    <MobileLabTransport
      playing={m.playing}
      onTogglePlay={m.togglePlay}
      onStepBack={m.stepBack}
      onStepForward={m.stepForward}
      onReset={onReset}
      stepBackLabel="−1 s"
      stepForwardLabel="+1 s"
      time={m.tt}
      maxTime={Math.max(m.tMax, 0.1)}
      onScrub={(timeSec) => m.scrub(timeSec)}
      timeFormatter={(t) => `${t.toFixed(1)} s`}
      accentColor={PHYS.time}
    />
  ) : null;

  const toolbarSlot = !pairExp ? (
    <div className="app-chrome forces-session p-3 force-setup-row" data-testid="mobile-lab-toolbar"><p>{m.setup.massA} kg + {m.setup.massB} kg · {m.setup.force} N</p><button type="button" onClick={() => setParamsOpen(true)}>Edit Parameters</button></div>
  ) : null;

  const parameterSheetSlot = (
    <MobileLabParameterSheet
      isOpen={paramsOpen}
      onClose={() => setParamsOpen(false)}
      title="Interaction Parameters"
      subtitle={id ? `Investigation ${id}` : 'Two Carts on Track'}
    >
      <div className="space-y-3">{inspector}</div>
    </MobileLabParameterSheet>
  );

  const analysisSheetSlot = (
    <MobileLabAnalysisSheet
      tabs={analysisTabs}
      defaultTab="measurements"
      title="Telemetry & Reasoning"
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
