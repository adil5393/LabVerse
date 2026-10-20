import type React from 'react';
import type { FigureProps } from './DerivationView';
import { LFigure, PFigure, RFigure } from './DerivationFigureViews';

/** Figures for the derivations of the simple machines and power, registered by derivation id. */
export const DERIVATION_FIGURES: Record<string, React.FC<FigureProps>> = { R: RFigure, L: LFigure, P: PFigure };
