/**
 * Pie-chart model (M6.1): one group's composition as parts of one whole.
 *
 *   total = Σ vᵢ      share = vᵢ ÷ total      sector angle = 360° × share
 *
 * All values are exact; text is derived from the exact values. A group with a
 * total of 0 has NO sectors (nothing invalid is ever drawn). Missing cells
 * count as 0 here, exactly as in the stacked charts.
 */

import { type Q, ZERO, HUNDRED, q, mul, div, add, isZero, isNeg, eq, parseQ, formatDecimal, toNumber } from './rational';
import { type ChartDataset, cell, groupTotal } from './charts';

export interface PieSector {
  categoryId: string;
  value: Q;
  share: Q;
  percent: Q;
  /** Exact angle in degrees. */
  angle: Q;
  /** Drawing angles in degrees, measured clockwise from 12 o'clock. */
  startDeg: number;
  endDeg: number;
  percentText: string;
  angleText: string;
  /** A zero-valued category: listed in the table, never drawn. */
  isZero: boolean;
  /** The only non-zero sector: a full 360° disc (an arc cannot draw this). */
  isFullCircle: boolean;
}

export type PieResult =
  | { status: 'no_data'; message: string }
  | {
      status: 'ok';
      groupId: string;
      total: Q;
      sectors: PieSector[];
      /** Exact angles always sum to 360°. */
      exactAngleSumIs360: boolean;
      angleSumText: string;
      percentSumText: string;
      /** Set when the rounded figures shown do not add to exactly 360° / 100%. */
      roundingNote: string | null;
    };

const FULL_TURN = q(360);

export function pieSectors(ds: ChartDataset, groupId: string, places = 1): PieResult {
  const total = groupTotal(ds, groupId);
  if (isZero(total) || isNeg(total)) {
    return { status: 'no_data', message: 'This group’s total is 0, so a pie chart has no whole to divide. No sectors are drawn.' };
  }
  let cursor = 0;
  const sectors: PieSector[] = ds.categories.map((c) => {
    const raw = cell(ds, groupId, c.id);
    const value = raw && !isNeg(raw) ? raw : ZERO;
    const share = div(value, total);
    const angle = mul(FULL_TURN, share);
    const start = cursor;
    cursor += toNumber(angle);
    return {
      categoryId: c.id,
      value,
      share,
      percent: mul(share, HUNDRED),
      angle,
      startDeg: start,
      endDeg: cursor,
      percentText: formatDecimal(mul(share, HUNDRED), places),
      angleText: formatDecimal(angle, places),
      isZero: isZero(value),
      isFullCircle: eq(value, total),
    };
  });
  let angleSum = ZERO;
  let pctSum = ZERO;
  for (const s of sectors) {
    angleSum = add(angleSum, parseQ(s.angleText) ?? ZERO);
    pctSum = add(pctSum, parseQ(s.percentText) ?? ZERO);
  }
  const angleOk = eq(angleSum, FULL_TURN);
  const pctOk = eq(pctSum, HUNDRED);
  return {
    status: 'ok',
    groupId,
    total,
    sectors,
    exactAngleSumIs360: true,
    angleSumText: formatDecimal(angleSum, places),
    percentSumText: formatDecimal(pctSum, places),
    roundingNote:
      angleOk && pctOk
        ? null
        : `The rounded figures shown add up to ${formatDecimal(angleSum, places)}° and ${formatDecimal(pctSum, places)}% because each is rounded to ${places} decimal place${places === 1 ? '' : 's'}. The exact angles add up to exactly 360° and the exact shares to exactly 100%.`,
  };
}

/** SVG path for a pie sector (angles in degrees clockwise from the top). */
export function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
}
