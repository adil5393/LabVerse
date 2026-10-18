/**
 * Small display helpers shared by the chart components (M6.1).
 */

import { type Q, formatSmart } from '../../../engine/mathematics/understandingData/rational';
export type { ChartDataset } from '../../../engine/mathematics/understandingData/charts';

/** A value as shown on a chart: exact when it terminates, otherwise rounded with "≈". */
export const formatChartValue = (v: Q): string => formatSmart(v, 2);

/**
 * Does `text` fit in `width` pixels at `fontSize` (monospace-ish estimate)?
 * Used to skip in-segment labels that would overlap or clip; the selected-value
 * panel and the text alternative always carry the full information.
 */
export const labelFits = (text: string, width: number, fontSize: number): boolean => width >= text.length * fontSize * 0.62 + 8;
