/**
 * Data figures for the Understanding Data Learn lessons (EDU-1M6).
 *
 * `udWeighted`: values and weights you can edit; bar width is the weight, bar height is
 * the value, so area is weight × value; the weighted mean and the plain average are drawn
 * and calculated from the same numbers.
 * `udChart`: one editable table drawn as clustered, stacked, 100% or pie charts using the
 * existing chart components, with the totals and shares computed from the same table.
 * Every number comes from engine/.../learn/model.ts (exact fractions). All controls work
 * by keyboard and by buttons; nothing is animated.
 */

import { UdQuestionChart } from './UdQuestionChart';
import React, { useMemo, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../../education/visuals';
import { ClusteredChart } from '../ClusteredChart';
import { PieChart } from '../PieChart';
import { StackedChart } from '../StackedChart';
import { pieSectors } from '../../../../engine/mathematics/understandingData/pie';
import { describeChart, setCell } from '../../../../engine/mathematics/understandingData/charts';
import { parseQ } from '../../../../engine/mathematics/understandingData/rational';
import {
  datasetOf, describeDataset, groupShares, groupTotal, categoryTotal, grandTotal, cell, show, weightedView, withAverageRow, q, type ChartDataset,
} from '../../../../engine/mathematics/understandingData/learn/model';
import type { UdChartKind, UdChartProps, UdWeightedProps } from '../../../../engine/mathematics/understandingData/learn/questions';

const C = { mean: '#34d399', naive: '#fbbf24', bar: ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ec4899', '#a78bfa'], text: '#e2e8f0', axis: '#94a3b8' };

const NumBox: React.FC<{ label: string; value: string; onChange: (v: string) => void; testId?: string }> = ({ label, value, onChange, testId }) => {
  const ok = parseQ(value) !== null;
  const bump = (d: number) => { const cur = parseQ(value) ?? q(0); onChange(show({ n: cur.n + BigInt(d) * cur.d, d: cur.d })); };
  return (
    <div className="flex items-center gap-1" data-field={testId}>
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => bump(-1)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">−</button>
      <input type="text" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} aria-invalid={!ok}
        className={`w-16 min-h-[44px] rounded-lg border px-2 text-center font-mono text-sm bg-surface-lowest text-white ${ok ? 'border-surface-border' : 'border-rose-500'}`} />
      <button type="button" aria-label={`Increase ${label}`} onClick={() => bump(1)} className="min-w-[44px] min-h-[44px] rounded-lg border border-surface-border bg-surface-card text-slate-100 text-lg">+</button>
    </div>
  );
};

// ---------------------------------------------------------------------------

const UdWeighted: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as UdWeightedProps;
  const init = useMemo(() => p.items.map((i) => ({ label: i.label, value: String(i.value), weight: String(i.weight) })), [p.items]);
  const [rows, setRows] = useState(init);
  const [prev, setPrev] = useState(init);
  if (prev !== init) { setPrev(init); setRows(init); }
  const edit = p.edit !== false;

  const parsed = rows.map((r) => ({ label: r.label, value: parseQ(r.value), weight: parseQ(r.weight) }));
  const allOk = parsed.every((r) => r.value && r.weight);
  const view = allOk ? weightedView(parsed.map((r) => ({ label: r.label, value: r.value!, weight: r.weight! }))) : null;

  const W = 400, H = 240, L = 44, R = 12, T = 16, B = 40;
  const nums = parsed.map((r) => (r.value ? Number(r.value.n) / Number(r.value.d) : 0));
  const ws = parsed.map((r) => (r.weight ? Math.max(0, Number(r.weight.n) / Number(r.weight.d)) : 0));
  const totalW = ws.reduce((a, b) => a + b, 0);
  const vMax = Math.max(1, ...nums, 0), vMin = Math.min(0, ...nums);
  const Y = (v: number) => T + ((vMax - v) / (vMax - vMin)) * (H - T - B);
  const meanN = view?.ok ? Number(view.mean.n) / Number(view.mean.d) : null;
  const naiveN = view?.ok && view.naive ? Number(view.naive.n) / Number(view.naive.d) : null;
  let x = L;

  const summary = !allOk ? 'Enter a number in every box.' : !view || !view.ok ? (view as { message: string } | null)?.message ?? '' : `Weighted mean = ${show(view.mean)}${view.naive ? `; plain average of the ${p.valueLabel} figures = ${show(view.naive)}${view.differsFromNaive ? ' (different, because the weights are unequal)' : ' (the same)'}` : ''}.`;

  return (
    <div className="space-y-3" data-visual="udWeighted" data-mode={p.mode}>
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={alt} className="w-full max-w-[460px] mx-auto rounded-xl bg-surface-lowest border border-surface-border">
        <title>{alt}</title>
        <line x1={L} y1={Y(0)} x2={W - R} y2={Y(0)} stroke={C.axis} strokeWidth={1.5} />
        <line x1={L} y1={T} x2={L} y2={H - B} stroke={C.axis} strokeWidth={1.5} />
        <text x={4} y={T + 8} fill={C.axis} fontSize={10}>{p.valueLabel}</text>
        {[vMin, vMax].map((v) => <text key={v} x={L - 4} y={Y(v) + 4} textAnchor="end" fill={C.axis} fontSize={10}>{Number(v.toFixed(2))}</text>)}
        {totalW > 0 && parsed.map((r, i) => {
          const w = (ws[i] / totalW) * (W - L - R);
          const x0 = x; x += w;
          const top = Y(Math.max(0, nums[i])), bottom = Y(Math.min(0, nums[i]));
          return (
            <g key={i} pointerEvents="none">
              <rect x={x0 + 1} y={top} width={Math.max(0, w - 2)} height={Math.max(1, bottom - top)} fill={C.bar[i % C.bar.length]} fillOpacity={0.55} stroke="#0f172a" />
              <text x={x0 + w / 2} y={H - B + 14} textAnchor="middle" fill={C.text} fontSize={11}>{r.label}</text>
              <text x={x0 + w / 2} y={H - B + 27} textAnchor="middle" fill={C.axis} fontSize={10}>{rows[i].weight}</text>
            </g>
          );
        })}
        {naiveN !== null && view?.ok && view.differsFromNaive && <g pointerEvents="none"><line x1={L} y1={Y(naiveN)} x2={W - R} y2={Y(naiveN)} stroke={C.naive} strokeWidth={2} strokeDasharray="6 4" /><text x={W - R - 2} y={Y(naiveN) - 4} textAnchor="end" fill={C.naive} fontSize={10}>plain average {view.naive ? show(view.naive) : ''}</text></g>}
        {meanN !== null && view?.ok && <g pointerEvents="none"><line x1={L} y1={Y(meanN)} x2={W - R} y2={Y(meanN)} stroke={C.mean} strokeWidth={2.5} /><text x={L + 4} y={Y(meanN) - 4} fill={C.mean} fontSize={11} fontWeight={700}>weighted mean {show(view.mean)}</text></g>}
      </svg>

      <div role="status" aria-live="polite" className="text-sm font-medium text-slate-100 text-center" data-testid="ud-summary">{summary}</div>

      <div className="overflow-x-auto" role="region" aria-label="Values and weights table (scrolls sideways on small screens)" tabIndex={0}>
      <table data-testid="ud-wtable" className="w-full text-xs font-mono border border-surface-border rounded-xl overflow-hidden">
        <caption className="sr-only">Values, weights and weight × value for each row.</caption>
        <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Item</th><th scope="col" className="p-2 text-left">{p.valueLabel}</th><th scope="col" className="p-2 text-left">{p.weightLabel}</th><th scope="col" className="p-2 text-left">weight × value</th></tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-surface-border">
              <td className="p-2">{r.label}</td>
              <td className="p-1">{edit ? <NumBox label={`${r.label} ${p.valueLabel}`} value={r.value} onChange={(v) => setRows((s) => s.map((x2, j) => (j === i ? { ...x2, value: v } : x2)))} testId={`v${i}`} /> : r.value}</td>
              <td className="p-1">{edit ? <NumBox label={`${r.label} ${p.weightLabel}`} value={r.weight} onChange={(v) => setRows((s) => s.map((x2, j) => (j === i ? { ...x2, weight: v } : x2)))} testId={`w${i}`} /> : r.weight}</td>
              <td className="p-2" data-cell="product">{view?.ok ? show(view.products[i].product) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {view?.ok && (
        <ol data-testid="ud-steps" className="list-decimal pl-5 text-xs font-mono text-slate-300 space-y-0.5 rounded-xl border border-surface-border bg-surface-card p-3 pl-8">
          {view.steps.map((s) => <li key={s}>{s}</li>)}
        </ol>
      )}
      {p.mode === 'mixture' && <p className="text-xs text-slate-400">Assumption: the volumes simply add up. Real liquids can differ slightly.</p>}
      {edit && <button type="button" onClick={() => setRows(init)} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-xs text-slate-200">Reset</button>}
    </div>
  );
};

// ---------------------------------------------------------------------------

const KIND_LABEL: Record<UdChartKind, string> = { absolute: 'Stacked', percent: '100% stacked', 'clustered-group': 'Clustered by group', 'clustered-category': 'Clustered by category', pie: 'Pie' };

const UdChart: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as unknown as UdChartProps;
  const base = useMemo(() => datasetOf(p.spec), [p.spec]);
  const [ds, setDs] = useState<ChartDataset>(base);
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [prevBase, setPrevBase] = useState(base);
  if (prevBase !== base) { setPrevBase(base); setDs(base); setTexts({}); }
  const [kind, setKind] = useState<UdChartKind>(p.kind);
  const [pieGroup, setPieGroup] = useState(base.groups[0]?.id ?? '');
  const kinds = p.kinds ?? [p.kind];
  const edit = p.edit !== false && !p.avgWeights;

  const shown: ChartDataset = useMemo(() => (p.avgWeights ? withAverageRow(ds, Object.fromEntries(ds.groups.map((g, i) => [g.id, q(p.avgWeights![i] ?? 1)]))).dataset : ds), [ds, p.avgWeights]);
  const key = (g: string, c: string) => `${g}|${c}`;
  const textFor = (g: string, c: string) => texts[key(g, c)] ?? (cell(ds, g, c) ? show(cell(ds, g, c)!) : '');
  const onCell = (g: string, c: string, v: string) => {
    setTexts((t) => ({ ...t, [key(g, c)]: v }));
    const val = parseQ(v);
    if (val && val.n >= 0n) { const r = setCell(ds, g, c, val); if (r.ok) setDs(r.dataset); }
  };
  const pg = shown.groups.some((g) => g.id === pieGroup) ? pieGroup : shown.groups[0]?.id ?? '';

  const summary = (() => {
    if (kind === 'absolute' || kind === 'percent') return describeChart(shown, kind).slice(0, 1).concat(shown.groups.map((g) => {
      const t = groupTotal(shown, g.id);
      if (kind === 'absolute') return `${g.label}: total ${show(t)}.`;
      const s = groupShares(shown, g.id);
      return s.status === 'ok' ? `${g.label}: ${shown.categories.map((c, i) => `${c.label} ${s.rows[i].text}%`).join(', ')}.` : `${g.label}: no data.`;
    })).join(' ');
    if (kind === 'pie') {
      const s = pieSectors(shown, pg);
      const gl = shown.groups.find((g) => g.id === pg)?.label ?? '';
      return s.status === 'ok' ? `${gl}: ${s.sectors.map((x, i) => `${shown.categories[i].label} ${x.percentText}% (${x.angleText}°)`).join(', ')}. Total ${show(s.total)} is not shown by a pie.` : s.message;
    }
    return describeDataset('Clustered columns.', shown);
  })();

  return (
    <div className="space-y-3" data-visual="udChart" data-kind={kind}>
      <span className="sr-only">{alt}</span>
      {kinds.length > 1 && (
        <div role="group" aria-label="Chart type" className="flex flex-wrap gap-2" data-testid="ud-kinds">
          {kinds.map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={`min-h-[44px] px-3 rounded-lg border text-xs font-bold ${kind === k ? 'bg-purple-600 border-purple-400 text-white' : 'bg-surface-card border-surface-border text-slate-200'}`}>{KIND_LABEL[k]}</button>)}
        </div>
      )}
      <div data-testid="ud-chart">
        {kind === 'absolute' || kind === 'percent' ? <StackedChart dataset={shown} mode={kind} title={shown.title} />
          : kind === 'clustered-group' ? <ClusteredChart dataset={shown} by="group" title={shown.title} />
            : kind === 'clustered-category' ? <ClusteredChart dataset={shown} by="category" title={shown.title} />
              : (
                <div className="space-y-2">
                  {shown.groups.length > 1 && (
                    <label className="flex items-center gap-2 text-xs text-slate-300">Group
                      <select value={pg} onChange={(e) => setPieGroup(e.target.value)} aria-label="Which group to draw as a pie" className="min-h-[44px] rounded-lg border border-surface-border bg-surface-lowest px-2 text-white">
                        {shown.groups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
                      </select>
                    </label>
                  )}
                  <PieChart dataset={shown} groupId={pg} title={shown.title} />
                </div>
              )}
      </div>
      <div role="status" aria-live="polite" className="text-xs text-slate-300 rounded-xl border border-surface-border bg-surface-card p-3" data-testid="ud-summary">{summary}</div>

      <div className="overflow-x-auto" role="region" aria-label="Data table (scrolls sideways on small screens)" tabIndex={0}>
      <table data-testid="ud-table" className="w-full text-xs font-mono border border-surface-border rounded-xl overflow-hidden">
        <caption className="sr-only">{shown.title} in {shown.unit}. Each row is a group, each column a category, with totals.</caption>
        <thead><tr className="bg-surface-card text-slate-300"><th scope="col" className="p-2 text-left">Group</th>{shown.categories.map((c) => <th scope="col" key={c.id} className="p-2 text-left">{c.label}</th>)}<th scope="col" className="p-2 text-left">Total</th></tr></thead>
        <tbody>
          {shown.groups.map((g) => (
            <tr key={g.id} className="border-t border-surface-border">
              <th scope="row" className="p-2 text-left font-normal">{g.label}</th>
              {shown.categories.map((c) => (
                <td key={c.id} className="p-1" data-cell={`${g.id}|${c.id}`}>
                  {edit && g.id !== 'avg' ? <input type="text" inputMode="decimal" value={textFor(g.id, c.id)} aria-label={`${g.label}, ${c.label}`} aria-invalid={parseQ(textFor(g.id, c.id)) === null} onChange={(e) => onCell(g.id, c.id, e.target.value)}
                    className="w-16 min-h-[44px] rounded-lg border border-surface-border px-2 bg-surface-lowest text-white" /> : <span className="px-1">{cell(shown, g.id, c.id) ? show(cell(shown, g.id, c.id)!) : '—'}</span>}
                </td>
              ))}
              <td className="p-2 font-bold" data-cell={`${g.id}|total`}>{show(groupTotal(shown, g.id))}</td>
            </tr>
          ))}
          <tr className="border-t border-surface-border text-slate-400"><th scope="row" className="p-2 text-left font-normal">All groups</th>{shown.categories.map((c) => <td key={c.id} className="p-2">{show(categoryTotal(shown, c.id))}</td>)}<td className="p-2">{show(grandTotal(shown))}</td></tr>
        </tbody>
      </table>
      </div>
      {edit && <button type="button" onClick={() => { setDs(base); setTexts({}); }} className="min-h-[44px] px-3 rounded-lg border border-surface-border bg-surface-card text-xs text-slate-200">Reset table</button>}
    </div>
  );
};

export const UD_VISUALS: VisualRegistry = { udWeighted: UdWeighted, udChart: UdChart, udQuestionChart: UdQuestionChart };
