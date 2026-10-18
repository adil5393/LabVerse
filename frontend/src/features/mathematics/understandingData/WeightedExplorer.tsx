/**
 * Weighted Average Explorer (M6 signature experiment).
 * One authoritative table of (value, weight) rows drives the numbers, the
 * balance-line picture and the contribution bar, so they cannot disagree.
 */

import React, { useMemo } from 'react';
import { useUnderstandingDataStore } from '../../../store/useUnderstandingDataStore';
import { getUDExperiment } from '../../../engine/mathematics/understandingData/experimentRegistry';
import { weightedMean, compareNaiveWeighted, describeCalculation, type WeightedItem } from '../../../engine/mathematics/understandingData/weightedMean';
import { type Q, q, add, sub, isNeg, formatSmart, toNumber, cmp, ZERO } from '../../../engine/mathematics/understandingData/rational';
import { NumberField, Card, UndoRow, LockedNotice, useElementWidth } from './Controls';
import { WorkbenchShell } from './WorkbenchShell';

export const ROW_COLORS = ['#38bdf8', '#f59e0b', '#34d399', '#f472b6', '#a78bfa', '#fb7185', '#facc15', '#94a3b8'];
const fmt = (x: Q) => formatSmart(x, 3);

interface Props {
  lesson?: React.ReactNode;
}

/** Round tick values (multiples of 1, 2, 5 × 10ⁿ) inside [lo, hi]. */
function niceTicks(lo: number, hi: number, target = 5): number[] {
  const rough = (hi - lo) / target || 1;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((x) => x >= rough) ?? pow * 10;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(Number(v.toPrecision(12)));
  return out;
}

const BalanceLine: React.FC<{ rows: readonly WeightedItem[]; mean: Q | null; naive: Q | null; unit: string; hidden: boolean }> = ({ rows, mean, naive, unit, hidden }) => {
  const [wrapRef, W] = useElementWidth<HTMLDivElement>(640);
  const H = 230;
  const padX = W < 420 ? 28 : 48;
  const vals = rows.map((r) => toNumber(r.value));
  const extra = !hidden ? [mean, naive].filter((x): x is Q => x !== null).map(toNumber) : [];
  const all = [...vals, ...extra];
  const lo0 = Math.min(...all, 0);
  const hi0 = Math.max(...all, 1);
  const span = hi0 - lo0 || 1;
  const lo = lo0 - span * 0.08;
  const hi = hi0 + span * 0.08;
  const x = (v: number) => padX + ((v - lo) / (hi - lo)) * (W - 2 * padX);
  const wmax = Math.max(...rows.map((r) => toNumber(r.weight)), 1e-9);
  const axisY = 150;
  const ticks = W < 420 ? 4 : 6;
  return (
    <div ref={wrapRef} className="w-full">
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Balance line of ${rows.length} values. Circle area shows each weight.${!hidden && mean ? ` Weighted mean ${fmt(mean)}.` : ''}`} className="block">
      <line x1={padX} y1={axisY} x2={W - padX} y2={axisY} stroke="rgba(226,232,240,0.7)" strokeWidth={2} />
      {niceTicks(lo, hi, ticks).map((v) => (
        <g key={v}>
          <line x1={x(v)} y1={axisY} x2={x(v)} y2={axisY + 6} stroke="rgba(226,232,240,0.5)" />
          <text x={x(v)} y={axisY + 20} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{v}</text>
        </g>
      ))}
      {unit && <text x={W - padX} y={axisY + 38} textAnchor="end" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{unit}</text>}
      {rows.map((r, i) => {
        const w = toNumber(r.weight);
        const rad = 8 + 26 * Math.sqrt(Math.max(w, 0) / wmax);
        return (
          <g key={r.id}>
            <circle cx={x(toNumber(r.value))} cy={axisY - rad - 2} r={rad} fill={ROW_COLORS[i % ROW_COLORS.length]} fillOpacity={0.55} stroke={ROW_COLORS[i % ROW_COLORS.length]} strokeWidth={2} />
            <text x={x(toNumber(r.value))} y={axisY - rad - 2 + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff" fontFamily="ui-monospace, monospace">{fmt(r.weight)}</text>
          </g>
        );
      })}
      {!hidden && naive && (
        <g>
          <line x1={x(toNumber(naive))} y1={22} x2={x(toNumber(naive))} y2={axisY} stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 4" />
          <text x={x(toNumber(naive))} y={14} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fbbf24" fontFamily="ui-monospace, monospace">plain avg {fmt(naive)}</text>
        </g>
      )}
      {!hidden && mean && (
        <g>
          <polygon points={`${x(toNumber(mean))},${axisY + 2} ${x(toNumber(mean)) - 8},${axisY + 16} ${x(toNumber(mean)) + 8},${axisY + 16}`} fill="#34d399" />
          <line x1={x(toNumber(mean))} y1={34} x2={x(toNumber(mean))} y2={axisY} stroke="#34d399" strokeWidth={3} />
          <text x={x(toNumber(mean))} y={H - 4} textAnchor="middle" fontSize={12} fontWeight={800} fill="#6ee7b7" fontFamily="ui-monospace, monospace">weighted mean {fmt(mean)}</text>
        </g>
      )}
    </svg>
    </div>
  );
};

const ContributionBar: React.FC<{ rows: readonly WeightedItem[]; total: Q }> = ({ rows, total }) => {
  const tn = toNumber(total) || 1;
  return (
    <div>
      <div className="flex h-9 rounded-lg overflow-hidden border border-surface-border" role="img" aria-label={`Share of total weight: ${rows.map((r) => `${r.label} ${((toNumber(r.weight) / tn) * 100).toFixed(1)}%`).join(', ')}`}>
        {rows.map((r, i) => {
          const share = (toNumber(r.weight) / tn) * 100;
          return (
            <div key={r.id} style={{ width: `${share}%`, background: ROW_COLORS[i % ROW_COLORS.length] }} className="flex items-center justify-center text-[11px] font-mono font-bold text-slate-900 overflow-hidden" title={`${r.label}: ${share.toFixed(1)}% of the total weight`}>
              {share >= 12 ? `${Math.round(share)}%` : ''}
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-mono text-slate-300">
        {rows.map((r, i) => <span key={r.id} className="flex items-center gap-1"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: ROW_COLORS[i % ROW_COLORS.length] }} />{r.label}</span>)}
      </div>
    </div>
  );
};

export const WeightedExplorer: React.FC<Props> = ({ lesson }) => {
  const rows = useUnderstandingDataStore((s) => s.rows);
  const meaning = useUnderstandingDataStore((s) => s.weightMeaning);
  const valueLabel = useUnderstandingDataStore((s) => s.valueLabel);
  const weightLabel = useUnderstandingDataStore((s) => s.weightLabel);
  const unit = useUnderstandingDataStore((s) => s.valueUnit);
  const experimentId = useUnderstandingDataStore((s) => s.currentExperimentId);
  const locked = useUnderstandingDataStore((s) => s.isLocked());
  const setRowNumber = useUnderstandingDataStore((s) => s.setRowNumber);
  const setRowLabel = useUnderstandingDataStore((s) => s.setRowLabel);
  const setRowRounded = useUnderstandingDataStore((s) => s.setRowRounded);
  const addRow = useUnderstandingDataStore((s) => s.addRow);
  const removeRow = useUnderstandingDataStore((s) => s.removeRow);
  const scaleAll = useUnderstandingDataStore((s) => s.scaleAllWeights);
  const shiftAll = useUnderstandingDataStore((s) => s.shiftAllWeights);

  const exp = getUDExperiment(experimentId);
  const simple = exp.simpleControls;

  const result = useMemo(() => weightedMean(rows), [rows]);
  const cmpRes = useMemo(() => compareNaiveWeighted(rows), [rows]);
  const steps = useMemo(() => describeCalculation(rows, fmt), [rows]);

  const stepBtn = 'w-11 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold hover:bg-surface-elevated shrink-0';
  const nudge = (id: string, field: 'value' | 'weight', cur: Q, d: number) => {
    const next = add(cur, q(d));
    if (field === 'weight' && isNeg(next)) return;
    setRowNumber(id, field, next);
  };

  const canvas = (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">{meaning === 'size' ? 'Combining groups' : 'Combining scores with importance weights'}</h2>
          <p className="text-xs text-slate-400">{meaning === 'size' ? 'Each circle is a group’s average; its area shows how many values it contains.' : 'Each circle is a score; its area shows how important it is.'}</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-2 sm:p-3">
          <BalanceLine rows={rows} mean={result.ok ? result.mean : null} naive={cmpRes ? cmpRes.naive : null} unit={unit} hidden={locked} />
          {result.ok && <div className="mt-2"><div className="text-[11px] font-mono text-slate-400 mb-1">Share of the total weight</div><ContributionBar rows={rows} total={result.totalWeight} /></div>}
        </div>
        {locked && <LockedNotice />}
        {!locked && result.ok && cmpRes && (
          <div className={`rounded-xl border p-3 text-sm ${cmpRes.agree ? 'border-sky-500/40 bg-sky-950/20' : 'border-emerald-500/40 bg-emerald-950/20'}`} role="status" aria-live="polite">
            {cmpRes.agree ? (
              <span className="text-slate-100">The plain average and the weighted mean agree here{cmpRes.equalWeights ? ', because every weight is the same' : ''}.</span>
            ) : (
              <span className="text-slate-100">
                The weighted mean {fmt(cmpRes.weighted)} is {cmp(cmpRes.difference, ZERO) < 0 ? 'lower' : 'higher'} than the plain average {fmt(cmpRes.naive)} by {fmt(cmp(cmpRes.difference, ZERO) < 0 ? sub(ZERO, cmpRes.difference) : cmpRes.difference)}
                {cmpRes.heaviestId ? `, pulled towards ${rows.find((r) => r.id === cmpRes.heaviestId)?.label}, which has the largest weight.` : '.'}
              </span>
            )}
          </div>
        )}
        {!result.ok && <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100" role="alert">{result.error.message}</div>}
      </div>
    </div>
  );

  const tools = (
    <div>
      <UndoRow />
      <Card title={`Data (${meaning === 'size' ? 'group sizes as weights' : 'importance as weights'})`}>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={r.id} className="rounded-xl border border-surface-border bg-surface-lowest p-2 space-y-2" style={{ borderLeft: `4px solid ${ROW_COLORS[i % ROW_COLORS.length]}` }}>
              <div className="flex items-center gap-2">
                <input value={r.label} onChange={(e) => setRowLabel(r.id, e.target.value)} aria-label={`Name of row ${i + 1}`} className="flex-1 min-w-0 h-11 px-2 rounded-lg bg-surface-card border border-surface-border text-white text-sm font-semibold outline-none focus:border-purple-400" />
                {!simple && rows.length > 1 && <button type="button" aria-label={`Remove ${r.label}`} onClick={() => removeRow(r.id)} className="w-11 h-11 rounded-lg text-slate-400 hover:text-rose-300">×</button>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">{valueLabel}</div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Decrease ${valueLabel} of ${r.label}`} className={stepBtn} onClick={() => nudge(r.id, 'value', r.value, simple ? -5 : -1)}>−</button>
                    <NumberField value={r.value} label={`${valueLabel} of ${r.label}`} onCommit={(v) => v && setRowNumber(r.id, 'value', v)} />
                    <button type="button" aria-label={`Increase ${valueLabel} of ${r.label}`} className={stepBtn} onClick={() => nudge(r.id, 'value', r.value, simple ? 5 : 1)}>+</button>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">{weightLabel}</div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Decrease ${weightLabel} of ${r.label}`} className={stepBtn} onClick={() => nudge(r.id, 'weight', r.weight, -1)}>−</button>
                    <NumberField value={r.weight} nonNegative label={`${weightLabel} of ${r.label}`} onCommit={(v) => v && setRowNumber(r.id, 'weight', v)} />
                    <button type="button" aria-label={`Increase ${weightLabel} of ${r.label}`} className={stepBtn} onClick={() => nudge(r.id, 'weight', r.weight, 1)}>+</button>
                  </div>
                </div>
              </div>
              {!simple && (
                <label className="flex items-center gap-2 text-[11px] font-mono text-slate-400 min-h-11">
                  <input type="checkbox" checked={Boolean(r.valueIsRounded)} onChange={(e) => setRowRounded(r.id, e.target.checked)} className="w-4 h-4" />
                  This {valueLabel.toLowerCase()} is a rounded figure
                </label>
              )}
            </div>
          ))}
        </div>
        {!simple && <button type="button" onClick={addRow} disabled={rows.length >= 8} className="mt-2 min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40">+ Add a group</button>}
      </Card>

      {!simple && (
        <Card title="Change every weight at once">
          <div className="flex flex-wrap gap-2">
            {[{ l: 'Weights × 2', f: () => scaleAll(q(2)) }, { l: 'Weights ÷ 2', f: () => scaleAll(q(1, 2)) }, { l: 'Weights + 1', f: () => shiftAll(q(1)) }, { l: 'Weights − 1', f: () => shiftAll(q(-1)) }].map((b) => (
              <button key={b.l} type="button" onClick={b.f} className="min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 hover:bg-surface-elevated">{b.l}</button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">Multiplying keeps the ratios between weights; adding a constant changes them.</p>
        </Card>
      )}

      {locked ? (
        <LockedNotice />
      ) : result.ok ? (
        <>
          <Card title="Result" tone="ok">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm font-mono">
              <dt className="text-slate-400">Weighted mean</dt><dd className="text-emerald-300 font-bold">{fmt(result.mean)}{unit ? ` ${unit}` : ''}</dd>
              {cmpRes && <><dt className="text-slate-400">Plain average</dt><dd className="text-amber-300">{fmt(cmpRes.naive)}{unit ? ` ${unit}` : ''}</dd></>}
              <dt className="text-slate-400">Total weight</dt><dd className="text-white">{fmt(result.totalWeight)}</dd>
            </dl>
            {result.isEstimate && <p className="text-xs text-amber-200">Some inputs are rounded figures, so this result is an estimate, not an exact value.</p>}
            {result.ignored.length > 0 && <p className="text-xs text-slate-400">{result.ignored.length} row(s) with weight 0 have no effect.</p>}
          </Card>
          <details className="m-3 rounded-xl border border-surface-border bg-surface-card">
            <summary className="p-3 text-xs font-mono font-bold text-slate-300 cursor-pointer min-h-11">Show the calculation</summary>
            <ol className="px-3 pb-3 space-y-1 text-xs font-mono text-slate-200 list-decimal list-inside">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </details>
        </>
      ) : null}
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
