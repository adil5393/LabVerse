/**
 * Clustered-column chart (M6.1), drawn as SVG from the same raw dataset as
 * the stacked views. Every column has its own base at zero. A MISSING cell is
 * shown as a gap with a dash, never as a zero-height column. Columns are
 * keyboard- and touch-selectable buttons.
 *
 * Colours: when clustering by group the columns are categories and keep the
 * category colours used everywhere else; when clustering by category the
 * columns are groups and use a separate group palette (with its own legend)
 * so a colour never means two different things at once.
 */

import React, { useMemo } from 'react';
import { type ChartDataset, formatChartValue } from './chartHelpers';
import { clusterLayout, columnFraction, type ClusterBy } from '../../../engine/mathematics/understandingData/clustered';
import { toNumber } from '../../../engine/mathematics/understandingData/rational';
import { useElementWidth } from './Controls';
import { CATEGORY_COLORS } from './StackedChart';

export const GROUP_COLORS = ['#e879f9', '#2dd4bf', '#fda4af', '#a3e635', '#fdba74', '#93c5fd', '#c4b5fd', '#fcd34d'];

export type ClusterAnswerMode = 'none' | 'segment' | 'bar';

interface Props {
  dataset: ChartDataset;
  by: ClusterBy;
  selected?: { groupId: string; categoryId: string } | null;
  onSelect?: (groupId: string, categoryId: string) => void;
  onSelectBar?: (groupId: string) => void;
  answerMode?: ClusterAnswerMode;
  marked?: { groupId: string; categoryId?: string; correct: boolean | null } | null;
  title?: string;
}

export const ClusteredChart: React.FC<Props> = ({ dataset: ds, by, selected, onSelect, onSelectBar, answerMode = 'none', marked, title }) => {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(560);
  const layout = useMemo(() => clusterLayout(ds, by), [ds, by]);
  const palette = by === 'group' ? CATEGORY_COLORS : GROUP_COLORS;
  const phone = width < 440;

  const gutterL = phone ? 44 : 56;
  const gutterR = 10;
  const top = 18;
  const axisH = 46;
  const plotH = phone ? 190 : 230;
  const nSeries = layout.series.length;
  const nClusters = layout.clusters.length;
  const MIN_BAR = 18;
  const clusterGap = phone ? 14 : 20;
  const naturalW = nClusters * (nSeries * MIN_BAR + clusterGap);
  const plotW = Math.max(width - gutterL - gutterR, naturalW);
  const svgW = plotW + gutterL + gutterR;
  const clusterW = plotW / nClusters;
  const barW = Math.max(MIN_BAR, (clusterW - clusterGap) / nSeries);
  const height = top + plotH + axisH;
  const y = (v: number) => top + plotH - (v / layout.axis.max) * plotH;
  const scrolls = svgW > width + 1;

  const summary = `${ds.title}. Clustered columns, one cluster per ${by}, ${ds.unit}. ${layout.clusters.map((c) => `${c.label}: ${c.bars.map((b) => `${b.seriesLabel} ${b.value ? formatChartValue(b.value) : 'missing'}`).join(', ')}`).join('; ')}.`;

  return (
    <div ref={wrapRef} className="w-full">
      {title && <div className="text-xs font-mono font-bold text-slate-300 mb-1">{title}</div>}
      <div className={scrolls ? 'overflow-x-auto' : ''} tabIndex={scrolls ? 0 : undefined} role={scrolls ? 'region' : undefined} aria-label={scrolls ? 'Chart (scroll sideways to see every column)' : undefined}>
        <svg width={svgW} height={height} viewBox={`0 0 ${svgW} ${height}`} role="group" aria-label={summary} className="block" data-chart-svg="clustered" style={{ touchAction: 'manipulation' }}>
          <rect x={0} y={0} width={svgW} height={height} fill="#0b1220" />
          {layout.axis.ticks.map((t) => (
            <g key={t}>
              <line x1={gutterL} y1={y(t)} x2={gutterL + plotW} y2={y(t)} stroke="rgba(148,163,184,0.16)" />
              <text x={gutterL - 6} y={y(t) + 4} textAnchor="end" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{Number(t.toPrecision(6))}</text>
            </g>
          ))}
          <line x1={gutterL} y1={y(0)} x2={gutterL + plotW} y2={y(0)} stroke="rgba(226,232,240,0.75)" strokeWidth={1.6} />
          <text x={gutterL} y={11} fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{ds.unit}</text>

          {layout.clusters.map((cl, ci) => {
            const x0 = gutterL + ci * clusterW + (clusterW - nSeries * barW) / 2;
            return (
              <g key={cl.id}>
                {cl.bars.map((b, bi) => {
                  const x = x0 + bi * barW;
                  const frac = columnFraction(b.value, layout.axis.max);
                  const h = frac * plotH;
                  const isSel = selected?.groupId === b.groupId && selected?.categoryId === b.categoryId;
                  const isMarked = marked && marked.groupId === b.groupId && (marked.categoryId === undefined || marked.categoryId === b.categoryId);
                  const barMode = answerMode === 'bar' && Boolean(onSelectBar);
                  const clickable = barMode || (Boolean(onSelect) && answerMode !== 'bar');
                  const activate = () => (barMode ? onSelectBar!(b.groupId) : onSelect!(b.groupId, b.categoryId));
                  const gl = ds.groups.find((g) => g.id === b.groupId)!.label;
                  const cl2 = ds.categories.find((c) => c.id === b.categoryId)!.label;
                  const name = `${gl}, ${cl2}: ${b.value ? `${formatChartValue(b.value)} ${ds.unit}` : 'missing'}`;
                  return (
                    <g
                      key={b.seriesId}
                      role={clickable ? 'button' : 'img'}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={name}
                      aria-pressed={clickable ? isSel : undefined}
                      data-seg={`${b.groupId}:${b.categoryId}`}
                      onClick={clickable ? activate : undefined}
                      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } } : undefined}
                      style={{ cursor: clickable ? 'pointer' : undefined, outline: 'none' }}
                    >
                      <title>{name}</title>
                      {/* enlarged invisible hit area so thin columns remain easy to tap */}
                      <rect x={x} y={top} width={barW} height={plotH} fill="transparent" />
                      {b.value === null ? (
                        <g>
                          <rect x={x + 2} y={y(0) - 14} width={barW - 4} height={14} fill="none" stroke="#64748b" strokeDasharray="3 3" />
                          <text x={x + barW / 2} y={y(0) - 4} textAnchor="middle" fontSize={11} fill="#94a3b8">–</text>
                        </g>
                      ) : (
                        <>
                          <rect x={x + 1} y={y(0) - h} width={Math.max(1, barW - 2)} height={h} fill={palette[b.seriesIndex % palette.length]} stroke={isMarked ? (marked!.correct === null ? '#c4b5fd' : marked!.correct ? '#34d399' : '#f87171') : isSel ? '#ffffff' : 'none'} strokeWidth={isMarked || isSel ? 3 : 0} />
                          {barW >= 30 && <text x={x + barW / 2} y={y(0) - h - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#e2e8f0" fontFamily="ui-monospace, monospace" pointerEvents="none">{formatChartValue(b.value)}</text>}
                        </>
                      )}
                    </g>
                  );
                })}
                <text x={gutterL + ci * clusterW + clusterW / 2} y={y(0) + 18} textAnchor="middle" fontSize={phone ? 11 : 12} fontWeight={600} fill="#e2e8f0" fontFamily="ui-sans-serif, system-ui">{cl.label.length > (phone ? 10 : 16) ? cl.label.slice(0, phone ? 9 : 15) + '…' : cl.label}</text>
              </g>
            );
          })}
          <text x={gutterL + plotW / 2} y={height - 6} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{by === 'group' ? 'one cluster per group' : 'one cluster per category'}</text>
        </svg>
      </div>
      {scrolls && <p className="mt-1 text-[11px] text-slate-500">This chart is wider than the screen. Scroll sideways, or use the text description below.</p>}
      <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-200" aria-label="Legend">
        {layout.series.map((s, i) => (
          <li key={s.id} className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: palette[i % palette.length] }} />{s.label}</li>
        ))}
      </ul>
      <span className="sr-only">Largest value {toNumber(layout.maxValue)}</span>
    </div>
  );
};
