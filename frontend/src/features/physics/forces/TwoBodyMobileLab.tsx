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
        !pairExp ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-card/90 backdrop-blur border border-outline-variant text-[11px] font-mono shadow-sm">
            <span className="text-slate-400">vA:</span>
            <span className="font-bold text-sky-400">{m.p.vA.toFixed(1)} m/s</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">vB:</span>
            <span className="font-bold text-amber-400">{m.p.vB.toFixed(1)} m/s</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">Σp:</span>
            <span className="font-bold text-emerald-400">
              {(m.setup.massA * m.p.vA + m.setup.massB * m.p.vB).toFixed(1)}
            </span>
          </div>
        ) : undefined
      }
    >
      <div className="w-full h-full flex flex-col p-1.5 overflow-y-auto no-scrollbar justify-center">
        {!pairExp && (
          <TwoBodyScene
            m={m}
            hidden={{
              A: !scene.isVisible('A'),
              B: !scene.isVisible('B'),
              link: !scene.isVisible('link'),
            }}
          />
        )}
        {pairExp && id === 'S' && comparePredict}
        {pairExp && id !== 'S' && (
          <PairIdentifyView key={pairExp.id} scenarioId={pairExp.scenarios[0]} />
        )}
      </div>
    </MobileLabViewport>
  );

  const transportSlot = !pairExp ? (
    <MobileLabTransport
      playing={m.playing}
      onTogglePlay={m.togglePlay}
      onStepBack={m.stepBack}
      onStepForward={m.stepForward}
      onReset={onReset}
      stepBackLabel="-0.5s"
      stepForwardLabel="+0.5s"
      time={m.tt}
      maxTime={Math.max(m.tMax, 0.1)}
      onScrub={(timeSec) => m.scrub(timeSec)}
      timeFormatter={(t) => `${t.toFixed(1)} s`}
      accentColor={PHYS.time}
    />
  ) : null;

  const toolbarSlot = (
    <div className="w-full flex flex-col gap-2 p-2.5">
      <MobileLabToolbar
        statusText={
          !pairExp
            ? `mA: ${m.setup.massA}kg · mB: ${m.setup.massB}kg · F: ${m.setup.force}N`
            : `Investigation ${id ?? 'Pairs'}`
        }
        onOpenParameters={() => setParamsOpen(true)}
        parameterButtonLabel="Edit Parameters"
      />
    </div>
  );

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
