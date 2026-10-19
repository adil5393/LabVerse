/** Illustrations for NCERT exercise solutions: each is drawn by the same view as the laboratory it comes from (or the shared graph). */

import React from 'react';
import type { ExerciseIllustration } from '../../../engine/physics/work/exerciseTypes';
import { PHYS } from '../motion/physicsColors';
import { EnergyPlot } from './EnergyPlot';
import { KineticView } from './KineticView';
import { WorkView } from './WorkView';

export const ExerciseIllustrationView: React.FC<{ ill: ExerciseIllustration; id: string }> = ({ ill, id }) => (
  <figure className="space-y-2 rounded-xl border border-surface-border bg-surface-card/60 p-3" data-illustration={ill.kind} data-illustration-id={id}>
    <figcaption className="text-xs text-slate-300"><strong style={{ color: PHYS.prediction }}>Illustration. </strong>{ill.caption}</figcaption>
    {ill.kind === 'work' && <WorkView initial={ill.setup} graph />}
    {ill.kind === 'kinetic' && <KineticView initial={ill.setup} />}
    {ill.kind === 'graph' && (
      <>
        <EnergyPlot id={`ex-${id}`} title={`${ill.yName} against ${ill.xName}`} xName={ill.xName} xUnit={ill.xUnit} yName={ill.yName} yUnit={ill.yUnit} xr={ill.xr} yr={ill.yr}
          lines={ill.lines} shade={ill.shade} points={ill.points?.map((p) => ({ ...p }))} caption={ill.caption} alt={`${ill.caption} Values read from the textbook figure.`} />
        <p className="text-[11px]" style={{ color: PHYS.distance }} data-testid="figure-estimate">Reading the figure: {ill.estimate}</p>
      </>
    )}
  </figure>
);
