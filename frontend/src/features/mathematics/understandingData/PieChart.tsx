/**
 * Pie chart of ONE group (M6.1): share = value ÷ total, angle = 360° × share,
 * all taken from the exact values (see engine/pie.ts). Nothing invalid is ever
 * drawn: a zero-total group shows an explanation instead of a circle, zero
 * sectors are skipped, and a single 100% sector is drawn as a full disc.
 *
 * The legend rows double as large tap targets for slices that are too thin to
 * tap on a phone, and the table gives the same numbers as text.
 */

import React, { useMemo } from 'react';
import { type ChartDataset, formatChartValue } from './chartHelpers';
import { pieSectors, sectorPath } from '../../../engine/mathematics/understandingData/pie';
import { useElementWidth } from './Controls';
import { CATEGORY_COLORS } from './StackedChart';

interface Props {
  dataset: ChartDataset;
  groupId: string;
  selected?: { groupId: string; categoryId: string } | null;
  onSelect?: (groupId: string, categoryId: string) => void;
  answerMode?: 'none' | 'segment';
  marked?: { groupId: string; categoryId?: string; correct: boolean | null } | null;
  /** Hide percentages and angles (results locked until a prediction is made). */
  hideNumbers?: boolean;
  title?: string;
}

export const PieChart: React.FC<Props> = ({ dataset: ds, groupId, selected, onSelect, answerMode = 'none', marked, hideNumbers, title }) => {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(420);
  const pie = useMemo(() => pieSectors(ds, groupId), [ds, groupId]);
  const group = ds.groups.find((g) => g.id === groupId);
  const size = Math.max(180, Math.min(width, 340));
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 12;
  const clickable = Boolean(onSelect) && (answerMode === 'segment' || answerMode === 'none');

  if (!group) return <div className="p-3 text-sm text-amber-200" role="alert">Choose a group to draw as a pie.</div>;
  if (pie.status === 'no_data') {
    return (
      <div ref={wrapRef} className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-sm text-amber-100" role="status">
        <strong>{group.label}</strong>: {pie.message}
      </div>
    );
  }

  const summary = `Pie chart of ${group.label}, total ${formatChartValue(pie.total)} ${ds.unit}. ${pie.sectors.map((s) => `${ds.categories.find((c) => c.id === s.categoryId)!.label} ${formatChartValue(s.value)}${hideNumbers ? '' : `, ${s.percentText}%, ${s.angleText} degrees`}`).join('; ')}.`;

  return (
    <div ref={wrapRef} className="w-full">
      {title && <div className="text-xs font-mono font-bold text-slate-300 mb-1">{title}</div>}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="group" aria-label={summary} className="block" data-chart-svg="pie" style={{ touchAction: 'manipulation' }}>
          <rect x={0} y={0} width={size} height={size} fill="#0b1220" />
          {pie.sectors.map((s, i) => {
            if (s.isZero) return null;
            const c = ds.categories.find((k) => k.id === s.categoryId)!;
            const isSel = selected?.groupId === groupId && selected?.categoryId === s.categoryId;
            const isMarked = marked && marked.groupId === groupId && marked.categoryId === s.categoryId;
            const mid = ((s.startDeg + s.endDeg) / 2 - 90) * (Math.PI / 180);
            const off = isSel ? 7 : 0;
            const dx = Math.cos(mid) * off;
            const dy = Math.sin(mid) * off;
            const fill = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
            const stroke = isMarked ? (marked!.correct === null ? '#c4b5fd' : marked!.correct ? '#34d399' : '#f87171') : isSel ? '#ffffff' : '#0b1220';
            const name = `${c.label}: ${formatChartValue(s.value)} ${ds.unit}${hideNumbers ? '' : `, ${s.percentText}% of ${group.label}, angle ${s.angleText} degrees`}`;
            const lx = cx + Math.cos(mid) * r * 0.62 + dx;
            const ly = cy + Math.sin(mid) * r * 0.62 + dy;
            const showLabel = !hideNumbers && (s.endDeg - s.startDeg) * (Math.PI / 180) * r * 0.62 > 44;
            return (
              <g
                key={s.categoryId}
                role={clickable ? 'button' : 'img'}
                tabIndex={clickable ? 0 : undefined}
                aria-label={name}
                aria-pressed={clickable ? isSel : undefined}
                data-seg={`${groupId}:${s.categoryId}`}
                onClick={clickable ? () => onSelect!(groupId, s.categoryId) : undefined}
                onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect!(groupId, s.categoryId); } } : undefined}
                style={{ cursor: clickable ? 'pointer' : undefined, outline: 'none' }}
              >
                <title>{name}</title>
                {s.isFullCircle ? (
                  <circle cx={cx + dx} cy={cy + dy} r={r} fill={fill} stroke={stroke} strokeWidth={isSel || isMarked ? 3 : 1.5} />
                ) : (
                  <path d={sectorPath(cx + dx, cy + dy, r, s.startDeg, s.endDeg)} fill={fill} stroke={stroke} strokeWidth={isSel || isMarked ? 3 : 1.5} strokeLinejoin="round" />
                )}
                {showLabel && <text x={lx} y={ly + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="#0b1220" fontFamily="ui-monospace, monospace" pointerEvents="none">{s.percentText}%</text>}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-xs text-slate-300">
        Pie of <strong className="text-white">{group.label}</strong>: the whole circle (360°) is its total of {formatChartValue(pie.total)} {ds.unit}.
      </p>

      <ul className="mt-2 space-y-1" aria-label="Slices">
        {pie.sectors.map((s, i) => {
          const c = ds.categories.find((k) => k.id === s.categoryId)!;
          const isSel = selected?.groupId === groupId && selected?.categoryId === s.categoryId;
          return (
            <li key={s.categoryId}>
              <button
                type="button"
                disabled={!clickable}
                aria-pressed={isSel}
                onClick={() => onSelect?.(groupId, s.categoryId)}
                className={`w-full min-h-11 px-2 rounded-lg border flex items-center gap-2 text-left text-xs font-mono ${isSel ? 'border-white bg-surface-elevated' : 'border-surface-border bg-surface-lowest'} text-slate-100`}
              >
                <span className="inline-block w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                <span className="flex-1 min-w-0 truncate font-sans font-semibold">{c.label}</span>
                <span>{formatChartValue(s.value)}</span>
                {!hideNumbers && <span className="text-slate-300 w-24 text-right">{s.percentText}% · {s.angleText}°</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {!hideNumbers && (
        <p className="mt-2 text-[11px] text-slate-400">
          Angles add up to {pie.angleSumText}° and shares to {pie.percentSumText}%.
          {pie.roundingNote ? ` ${pie.roundingNote}` : ' Each angle is 360° × (value ÷ total).'}
        </p>
      )}
      <p className="mt-1 text-[11px] text-slate-500">A pie shows the parts of one whole. The size of a slice here cannot be compared with a slice of another group’s pie, because the wholes can differ.</p>
    </div>
  );
};
