/**
 * Horizontal stacked / 100% stacked bar chart (M6), drawn as SVG.
 *
 * - The axis always starts at 0 (no truncation).
 * - Percent mode is computed from the raw dataset on every render; nothing is
 *   stored back, and totals are printed beside the bars (not encoded in them).
 * - Every segment is a keyboard- and touch-friendly button with an accessible name.
 * - A group whose total is 0 shows an explicit "no data" bar instead of percentages.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { type ChartDataset, type ChartKind, type ChartMode, cell, groupTotal, groupShares, niceAxis, categoryTotal } from '../../../engine/mathematics/understandingData/charts';
import { toNumber, formatSmart } from '../../../engine/mathematics/understandingData/rational';
import { labelFits } from './chartHelpers';

export const CATEGORY_COLORS = ['#38bdf8', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb7185', '#facc15', '#94a3b8'];

export type AnswerMode = 'none' | 'segment' | 'bar';

interface Props {
  dataset: ChartDataset;
  mode: ChartMode;
  selected?: { groupId: string; categoryId: string } | null;
  onSelect?: (groupId: string, categoryId: string) => void;
  onSelectBar?: (groupId: string) => void;
  answerMode?: AnswerMode;
  /** Highlight the groups/segments that were chosen in an answered challenge. */
  marked?: { groupId: string; categoryId?: string; correct: boolean | null } | null;
  hidePercentText?: boolean;
  title?: string;
}

const f = (x: Parameters<typeof formatSmart>[0]) => formatSmart(x, 2);

export const StackedChart: React.FC<Props> = ({ dataset: ds, mode, selected, onSelect, onSelectBar, answerMode = 'none', marked, hidePercentText, title }) => {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(560);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const apply = (w: number) => w > 40 && setWidth((cur) => (Math.abs(cur - w) > 1 ? w : cur));
    apply(el.getBoundingClientRect().width);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver((e) => apply(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const phone = width < 440;
  const gutterL = phone ? 64 : 100;
  const fontPx = phone ? 11 : 12;
  const longestTotal = Math.max(...ds.groups.map((g) => (mode === 'percent' ? `total ${f(groupTotal(ds, g.id))}` : `= ${f(groupTotal(ds, g.id))}`).length), 4);
  // wide enough for the longest total label at this font size (monospace ≈ 0.62em per character) plus padding
  const gutterR = Math.max(phone ? 58 : 84, Math.ceil(longestTotal * fontPx * 0.62) + 14);
  const barH = phone ? 32 : 40;
  const gap = phone ? 12 : 16;
  const top = 8;
  const axisH = 44;
  const plotW = Math.max(60, width - gutterL - gutterR);
  const height = top + ds.groups.length * (barH + gap) + axisH;

  const maxTotal = useMemo(() => Math.max(0, ...ds.groups.map((g) => toNumber(groupTotal(ds, g.id)))), [ds]);
  const axis = useMemo(() => (mode === 'absolute' ? niceAxis(maxTotal) : { max: 100, step: 25, ticks: [0, 25, 50, 75, 100] }), [mode, maxTotal]);
  const sx = (v: number) => gutterL + (v / axis.max) * plotW;

  const summary = `${ds.title}. ${mode === 'absolute' ? 'Stacked bars of actual values' : '100% stacked bars of each group’s shares'} in ${ds.unit}. ${ds.groups.map((g) => `${g.label}: total ${f(groupTotal(ds, g.id))}`).join('; ')}.`;

  return (
    <div ref={wrap} className="w-full" data-chart-mode={mode}>
      {title && <div className="text-xs font-mono font-bold text-slate-300 mb-1">{title}</div>}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={summary} className="block" data-chart-svg={mode} style={{ touchAction: 'manipulation' }}>
        <rect x={0} y={0} width={width} height={height} fill="#0b1220" />
        {/* grid + axis (always from 0) */}
        {axis.ticks.map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={top - 2} x2={sx(t)} y2={height - axisH + 4} stroke="rgba(148,163,184,0.16)" />
            <text x={sx(t)} y={height - axisH + 20} textAnchor="middle" fontSize={phone ? 11 : 12} fill="#94a3b8" fontFamily="ui-monospace, monospace">{mode === 'percent' ? `${t}%` : Number(t.toPrecision(6))}</text>
          </g>
        ))}
        <line x1={gutterL} y1={height - axisH + 4} x2={gutterL + plotW} y2={height - axisH + 4} stroke="rgba(226,232,240,0.7)" strokeWidth={1.5} />
        <text x={gutterL + plotW / 2} y={height - 6} textAnchor="middle" fontSize={phone ? 11 : 12} fill="#94a3b8" fontFamily="ui-monospace, monospace">
          {mode === 'percent' ? 'share of each group’s own total (%)' : ds.unit}
        </text>

        {ds.groups.map((g, gi) => {
          const y = top + gi * (barH + gap);
          const total = groupTotal(ds, g.id);
          const shares = mode === 'percent' ? groupShares(ds, g.id) : null;
          const noData = mode === 'percent' && shares?.status === 'no_data';
          let acc = 0;
          const barClick = answerMode === 'bar' && onSelectBar ? () => onSelectBar(g.id) : undefined;
          const barMark = marked && marked.groupId === g.id && marked.categoryId === undefined ? marked : null;
          return (
            <g key={g.id}>
              <g onClick={barClick} onKeyDown={barClick ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), barClick()) : undefined} role={barClick ? 'button' : undefined} tabIndex={barClick ? 0 : undefined} aria-label={barClick ? `Choose ${g.label}, total ${f(total)} ${ds.unit}` : undefined} style={{ cursor: barClick ? 'pointer' : undefined }}>
                <text x={gutterL - 8} y={y + barH / 2 + 4} textAnchor="end" fontSize={phone ? 11 : 12} fontWeight={600} fill="#e2e8f0" fontFamily="ui-sans-serif, system-ui">{g.label.length > (phone ? 9 : 14) ? g.label.slice(0, phone ? 8 : 13) + '…' : g.label}</text>
                {barClick && <rect x={0} y={y - gap / 2} width={width} height={barH + gap} fill="transparent" />}
              </g>
              {noData ? (
                <g>
                  <rect x={gutterL} y={y} width={plotW} height={barH} fill="none" stroke="#64748b" strokeDasharray="6 4" rx={4} />
                  <text x={gutterL + plotW / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">no data (total 0)</text>
                </g>
              ) : (
                ds.categories.map((c, ci) => {
                  const raw = cell(ds, g.id, c.id);
                  const v = raw ? toNumber(raw) : 0;
                  const startV = acc;
                  let segV = v;
                  if (mode === 'percent') {
                    const t = toNumber(total);
                    segV = t > 0 ? (v / t) * 100 : 0;
                  }
                  const x0 = sx(startV);
                  const w = Math.max(0, sx(startV + segV) - x0);
                  acc += segV;
                  const isSel = selected?.groupId === g.id && selected?.categoryId === c.id;
                  const isMarked = marked && marked.groupId === g.id && marked.categoryId === c.id;
                  const pct = shares?.status === 'ok' ? shares.rows[ci].text : null;
                  const label = mode === 'percent' ? (pct ? `${pct}%` : '') : raw === null ? '' : f(raw);
                  const accName = `${g.label}, ${c.label}: ${raw === null ? 'missing' : `${f(raw)} ${ds.unit}`}${hidePercentText ? '' : groupShares(ds, g.id).status === 'ok' ? `, ${(groupShares(ds, g.id) as { rows: { text: string }[] }).rows[ci].text}% of ${g.label}` : ''}`;
                  // In "choose a bar" mode a tap anywhere on the bar chooses that bar.
                  const barMode = answerMode === 'bar' && Boolean(onSelectBar);
                  const clickable = barMode || (Boolean(onSelect) && (answerMode === 'segment' || answerMode === 'none'));
                  const activate = () => (barMode ? onSelectBar!(g.id) : onSelect!(g.id, c.id));
                  return (
                    <g
                      key={c.id}
                      role={clickable ? 'button' : 'img'}
                      tabIndex={clickable ? 0 : undefined}
                      aria-label={accName}
                      aria-pressed={clickable ? isSel : undefined}
                      onClick={clickable ? activate : undefined}
                      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } } : undefined}
                      style={{ cursor: clickable ? 'pointer' : undefined, outline: 'none' }}
                      data-seg={`${g.id}:${c.id}`}
                    >
                      <title>{accName}</title>
                      <rect x={x0} y={y} width={w} height={barH} fill={CATEGORY_COLORS[ci % CATEGORY_COLORS.length]} stroke={isMarked ? (marked!.correct === null ? '#c4b5fd' : marked!.correct ? '#34d399' : '#f87171') : isSel ? '#ffffff' : '#0b1220'} strokeWidth={isMarked || isSel ? 3 : 1} />
                      {labelFits(hidePercentText && mode === 'percent' ? '' : label, w, phone ? 11 : 12) && label !== '' && <text x={x0 + w / 2} y={y + barH / 2 + 4} textAnchor="middle" fontSize={phone ? 11 : 12} fontWeight={700} fill="#0b1220" fontFamily="ui-monospace, monospace" pointerEvents="none">{hidePercentText && mode === 'percent' ? '' : label}</text>}
                    </g>
                  );
                })
              )}
              {barMark && <rect x={gutterL - 2} y={y - 2} width={plotW + 4} height={barH + 4} fill="none" stroke={barMark.correct === null ? '#c4b5fd' : barMark.correct ? '#34d399' : '#f87171'} strokeWidth={3} rx={4} />}
              <text x={gutterL + plotW + 8} y={y + barH / 2 + 4} fontSize={phone ? 11 : 12} fill={mode === 'percent' ? '#94a3b8' : '#e2e8f0'} fontStyle={mode === 'percent' ? 'italic' : 'normal'} fontFamily="ui-monospace, monospace">
                {mode === 'percent' ? `total ${f(total)}` : `= ${f(total)}`}
              </text>
            </g>
          );
        })}
      </svg>
      <Legend ds={ds} />
    </div>
  );
};

export const Legend: React.FC<{ ds: ChartDataset }> = ({ ds }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs font-mono text-slate-200" aria-label="Legend">
    {ds.categories.map((c, i) => (
      <li key={c.id} className="flex items-center gap-1.5">
        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
        {c.label} <span className="text-slate-500">({f(categoryTotal(ds, c.id))})</span>
      </li>
    ))}
  </ul>
);

/** Serialise the chart SVG to a PNG and trigger a download. Returns false if it could not. */
export async function downloadChartPng(container: HTMLElement | null, mode: ChartKind, filename: string): Promise<boolean> {
  const svg = container?.querySelector<SVGSVGElement>(`svg[data-chart-svg="${mode}"]`);
  if (!svg) return false;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const w = svg.width.baseVal.value;
  const h = svg.height.baseVal.value;
  const xml = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error('image load failed'));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    const blob: Blob | null = await new Promise((res) => canvas.toBlob((b) => res(b), 'image/png'));
    if (!blob) return false;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return true;
  } catch {
    return false;
  } finally {
    URL.revokeObjectURL(url);
  }
}
