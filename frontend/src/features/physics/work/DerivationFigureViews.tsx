/** Figures for the derivations of the simple machines and power (PHY-3D): each is the same view as the laboratory, drawn from the derivation's numbers. */

import React from 'react';
import { G } from '../../../engine/physics/work/workModel';
import type { FigureProps } from './DerivationView';
import { LeverView, RampView } from './MachineViews';
import { PowerView } from './PowerView';

export const RFigure: React.FC<FigureProps> = ({ ctx }) => (
  <RampView key={`r-${ctx.m}-${ctx.h}-${ctx.L}`} initial={{ massKg: ctx.m, height: ctx.h, length: ctx.L, mu: 0, g: G }} alt="The ramp of the derivation, with its force arrows, distances and work bars." />
);

export const LFigure: React.FC<FigureProps> = ({ ctx }) => (
  <LeverView key={`l-${ctx.F2}-${ctx.L2}-${ctx.L1}-${ctx.phi}`} initial={{ loadKg: ctx.F2 / G, loadArm: ctx.L2, effortArm: ctx.L1, kind: 'I', effort: ctx.F1, turnDeg: ctx.phi, g: G }} startProgress={1} alt="The lever of the derivation, with its arms and the distances moved by each end." />
);

export const PFigure: React.FC<FigureProps> = ({ ctx }) => (
  <PowerView key={`p-${ctx.W}-${ctx.t}`} initial={{ scenario: 'work', workJ: ctx.W, massKg: 1, height: 0, speed: 0, timeS: ctx.t }} alt="The work-time graph of the derivation: the slope is the power." />
);


