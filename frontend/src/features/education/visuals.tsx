/**
 * The clean interface between the shared lesson components and a chapter's
 * own visuals. A chapter registers components by `VisualRef.kind`; the shared
 * components never import chapter code.
 */

import React, { createContext, useContext } from 'react';
import type { VisualRef } from '../../engine/education/types';
import { InteractiveActivity } from '../../components/InteractiveActivity';

const activityKinds = new Set(['motionTrack', 'motionGraphs', 'derivation', 'circularMotion', 'forceArrows', 'forceCart', 'brakingDemo', 'secondLawDerivation', 'twoBody', 'pairIdentify', 'workLab', 'kineticLab', 'workDerivation', 'energyLab', 'powerLab', 'pulleyLab', 'rampLab', 'leverLab', 'soundVibration', 'soundBellJar', 'soundWave', 'soundGraph']);
/** Chemistry and Biology investigations: when a lesson embeds one with its controls (`editable`), it gets the same focus mode
 * and Reset as the laboratory, so the experiment behaves the same in both places. */
const labKinds = new Set(['microscope', 'sizeLadder', 'osmosis', 'cellCompare', 'division', 'rootGrowth', 'treeRings', 'plantTissues', 'animalTissues', 'joints', 'beadCombos', 'flowerParts', 'pollinationTest', 'pollinationStrategy', 'cycleCalendar', 'kingdomKey', 'plantKey', 'animalPhyla', 'hierarchy', 'binomial', 'mixBeam', 'mixConcentration', 'mixSolubility', 'mixSeparation', 'mixChromatography', 'atomModel', 'atomBuilder', 'goldFoil', 'isotopeMix', 'massBalance', 'bondBuilder', 'formulaBuilder', 'formulaMass', 'propertiesTest']);
export const isLabActivity = (visual: VisualRef): boolean => labKinds.has(visual.kind) && Boolean((visual.props as { editable?: boolean } | undefined)?.editable);
const forceActivities: Record<string, string> = { forceArrows: 'Explore the forces', forceCart: 'Explore force and motion', brakingDemo: 'Notice what happens when we brake', secondLawDerivation: 'Build the idea, one step at a time', twoBody: 'Explore two interacting objects', pairIdentify: 'Find a force pair' };

export interface VisualProps {
  props: Record<string, unknown>;
  /** Accessible text alternative (also shown to everyone as the caption). */
  alt: string;
  /** Interactive visuals report the student's choice here (visual questions). */
  onAnswer?: (answerId: string) => void;
  /** Interactive visuals lock after a correct answer. */
  locked?: boolean;
}

export type VisualRegistry = Record<string, React.ComponentType<VisualProps>>;

const RegistryContext = createContext<VisualRegistry>({});
export const VisualRegistryProvider = RegistryContext.Provider;
const CalmContext = createContext(false);
export const CalmVisualsProvider = CalmContext.Provider;

export const VisualHost: React.FC<{ visual: VisualRef; onAnswer?: (id: string) => void; locked?: boolean }> = ({ visual, onAnswer, locked }) => {
  const registry = useContext(RegistryContext);
  const calmContext = useContext(CalmContext);
  const Visual = registry[visual.kind];
  if (!Visual) {
    // A missing visual must never hide the lesson: fall back to the text alternative.
    return <p className="text-xs text-slate-400 border border-dashed border-surface-border rounded-lg p-3">{visual.alt}</p>;
  }
  return (
    <figure className="m-0 min-w-0">
      {isLabActivity(visual)
        ? <InteractiveActivity title="Try it yourself" label="Laboratory activity" resettable><Visual props={visual.props ?? {}} alt={visual.alt} onAnswer={onAnswer} locked={locked} /></InteractiveActivity>
        : activityKinds.has(visual.kind)
        ? <InteractiveActivity calm={calmContext || Boolean(forceActivities[visual.kind])} title={forceActivities[visual.kind] ?? (calmContext ? 'Explore the idea' : undefined)}><Visual props={visual.props ?? {}} alt={visual.alt} onAnswer={onAnswer} locked={locked} /></InteractiveActivity>
        : <div className="science-surface rounded-xl overflow-hidden"><Visual props={visual.props ?? {}} alt={visual.alt} onAnswer={onAnswer} locked={locked} /></div>}
      <figcaption className="mt-2 text-xs text-slate-400 leading-relaxed">{calmContext || forceActivities[visual.kind] ? <details><summary className="min-h-[44px] py-3 cursor-pointer">About this activity</summary>{visual.alt}</details> : visual.alt}</figcaption>
    </figure>
  );
};
