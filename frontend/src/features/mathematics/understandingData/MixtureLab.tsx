/**
 * Mixture Laboratory (M6). A mathematical mixture model, not a chemistry
 * simulation: the beaker is drawn from the same numbers the calculation uses
 * (layer height = quantity, solute fill = concentration). No particle effects.
 */

import React, { useMemo, useState } from 'react';
import { useUnderstandingDataStore } from '../../../store/useUnderstandingDataStore';
import { mixConstituents, describeMixture, reachableRange, quantityToReachTarget, type Constituent, type Unit } from '../../../engine/mathematics/understandingData/mixture';
import { type Q, q, ZERO, HUNDRED, toNumber, formatSmart, parseQ, cmp } from '../../../engine/mathematics/understandingData/rational';
import { getUDExperiment } from '../../../engine/mathematics/understandingData/experimentRegistry';
import { NumberField, Card, UndoRow, LockedNotice } from './Controls';
import { WorkbenchShell } from './WorkbenchShell';
import { ROW_COLORS } from './WeightedExplorer';

const fmt = (x: Q) => formatSmart(x, 3);
const UNITS: Unit[] = ['mL', 'L', 'g', 'kg'];

const Beaker: React.FC<{ layers: { label: string; base: number; pct: number; color: string }[]; total: number; finalPct: number | null; unit: string; hidden: boolean }> = ({ layers, total, finalPct, unit, hidden }) => {
  const H = 220;
  const W = 120;
  const top = 12;
  const inner = H - top - 10;
  const draw = (ls: { base: number; pct: number; color: string }[], x0: number, key: string) => {
    let y = top + inner;
    return ls.map((l, i) => {
      const h = total > 0 ? (l.base / total) * inner : 0;
      y -= h;
      const sol = h * Math.min(1, Math.max(0, l.pct / 100));
      return (
        <g key={`${key}${i}`}>
          <rect x={x0} y={y} width={W - 20} height={h} fill={l.color} fillOpacity={0.28} />
          <rect x={x0} y={y + h - sol} width={W - 20} height={sol} fill={l.color} fillOpacity={0.9} />
        </g>
      );
    });
  };
  const sepLayers = layers.map((l) => ({ ...l }));
  // The final beaker is one liquid: its solute fill is the final concentration over the whole height.
  const fin = finalPct ?? 0;
  return (
    <svg viewBox={`0 0 ${W * 2 + 120} ${H + 40}`} role="img" aria-label={`Beaker model. Left: ${layers.map((l) => `${l.label} ${l.base} ${unit} at ${l.pct}%`).join(', ')}. ${hidden ? 'Result hidden until you predict.' : `Right: mixture of ${total} ${unit}, ${finalPct === null ? 'no concentration' : `${Number(finalPct.toFixed(3))}% solute`}.`}`} className="w-full h-auto max-h-[320px] block">
      <g transform="translate(10,10)">
        <path d={`M5 ${top} L5 ${H - 5} L${W - 5} ${H - 5} L${W - 5} ${top}`} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth={2} />
        {draw(sepLayers, 10, 'a')}
        <text x={W / 2} y={H + 18} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">ingredients</text>
      </g>
      <text x={W + 60} y={H / 2} textAnchor="middle" fontSize={26} fill="#94a3b8">→</text>
      <g transform={`translate(${W + 100},10)`}>
        <path d={`M5 ${top} L5 ${H - 5} L${W - 5} ${H - 5} L${W - 5} ${top}`} fill="none" stroke="rgba(226,232,240,0.6)" strokeWidth={2} />
        {hidden ? (
          <text x={W / 2} y={H / 2} textAnchor="middle" fontSize={13} fill="#c4b5fd" fontFamily="ui-monospace, monospace">?</text>
        ) : (
          <>
            <rect x={10} y={top} width={W - 20} height={inner} fill="#a78bfa" fillOpacity={0.28} />
            <rect x={10} y={top + inner - (inner * Math.min(100, Math.max(0, fin))) / 100} width={W - 20} height={(inner * Math.min(100, Math.max(0, fin))) / 100} fill="#a78bfa" fillOpacity={0.9} />
            <text x={W / 2} y={top + inner / 2} textAnchor="middle" fontSize={16} fontWeight={800} fill="#fff" fontFamily="ui-monospace, monospace" stroke="#0b1220" strokeWidth={3} paintOrder="stroke">{finalPct === null ? '' : `${Number(fin.toFixed(2))}%`}</text>
          </>
        )}
        <text x={W / 2} y={H + 18} textAnchor="middle" fontSize={11} fill="#94a3b8" fontFamily="ui-monospace, monospace">{hidden ? 'mixture' : `mixture ${Number(total.toFixed(2))} ${unit}`}</text>
      </g>
    </svg>
  );
};

interface Props {
  lesson?: React.ReactNode;
}

export const MixtureLab: React.FC<Props> = ({ lesson }) => {
  const constituents = useUnderstandingDataStore((s) => s.constituents);
  const solute = useUnderstandingDataStore((s) => s.solute);
  const experimentId = useUnderstandingDataStore((s) => s.currentExperimentId);
  const locked = useUnderstandingDataStore((s) => s.isLocked());
  const setC = useUnderstandingDataStore((s) => s.setConstituent);
  const addC = useUnderstandingDataStore((s) => s.addConstituent);
  const removeC = useUnderstandingDataStore((s) => s.removeConstituent);
  const simple = getUDExperiment(experimentId).simpleControls;

  const result = useMemo(() => mixConstituents(constituents), [constituents]);
  const range = useMemo(() => reachableRange(constituents, solute), [constituents, solute]);
  const steps = useMemo(() => (result.ok ? describeMixture(result, solute) : []), [result, solute]);

  const [targetText, setTargetText] = useState('15');
  const [addPct, setAddPct] = useState('0');
  const solve = useMemo(() => {
    const t = parseQ(targetText);
    const p = parseQ(addPct);
    if (!t || !p) return null;
    return quantityToReachTarget(constituents, solute, p, t);
  }, [constituents, solute, targetText, addPct]);

  const layers = result.ok
    ? result.contributions.map((c, i) => ({ label: c.label, base: toNumber(c.baseQuantity), pct: toNumber(constituents.find((k) => k.id === c.id)?.solutes[solute] ?? ZERO), color: ROW_COLORS[i % ROW_COLORS.length] }))
    : [];
  const unit = result.ok ? result.baseUnit : 'mL';
  const finalQ = result.ok ? result.concentrations[solute] ?? ZERO : null;

  const nudgeQty = (c: Constituent, d: number) => {
    const n = c.quantity.n + BigInt(d) * c.quantity.d;
    if (n < 0n) return;
    setC(c.id, { quantity: q(n, c.quantity.d) });
  };
  const nudgePct = (c: Constituent, d: bigint) => {
    const cur = c.solutes[solute] ?? ZERO;
    const next = q(cur.n + d * cur.d, cur.d);
    if (next.n < 0n || cmp(next, HUNDRED) > 0) return;
    setC(c.id, { percent: next });
  };

  const canvas = (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-3 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Mixing liquids (mathematical model)</h2>
          <p className="text-xs text-slate-400">Layer height shows each quantity; the dark fill shows how much of it is {solute}. This models the arithmetic, not real chemistry.</p>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface-lowest p-3">
          {result.ok ? <Beaker layers={layers} total={toNumber(result.totalQuantity)} finalPct={finalQ ? toNumber(finalQ) : null} unit={unit} hidden={locked} /> : <div className="p-6 text-sm text-amber-200" role="alert">{result.error.message}</div>}
        </div>
        {locked && <LockedNotice />}
        {!locked && result.ok && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-3 text-sm text-slate-100" role="status" aria-live="polite">
            Final concentration of {solute}: <strong className="text-emerald-300">{fmt(finalQ!)}%</strong> ({fmt(result.soluteTotals[solute] ?? ZERO)} {unit} of {solute} in {fmt(result.totalQuantity)} {unit}).
            {range && <> It must lie between {fmt(range.min)}% and {fmt(range.max)}%, the weakest and strongest ingredients.</>}
          </div>
        )}
      </div>
    </div>
  );

  const tools = (
    <div>
      <UndoRow />
      <Card title={`Ingredients (percent ${solute})`}>
        <div className="space-y-3">
          {constituents.map((c, i) => (
            <div key={c.id} className="rounded-xl border border-surface-border bg-surface-lowest p-2 space-y-2" style={{ borderLeft: `4px solid ${ROW_COLORS[i % ROW_COLORS.length]}` }}>
              <div className="flex items-center gap-2">
                <input value={c.label} onChange={(e) => setC(c.id, { label: e.target.value })} aria-label={`Name of ingredient ${i + 1}`} className="flex-1 min-w-0 h-10 px-2 rounded-lg bg-surface-card border border-surface-border text-white text-sm font-semibold outline-none focus:border-purple-400" />
                {!simple && constituents.length > 1 && <button type="button" aria-label={`Remove ${c.label}`} onClick={() => removeC(c.id)} className="w-11 h-11 rounded-lg text-slate-400 hover:text-rose-300">×</button>}
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">Quantity</div>
                  <div className="flex items-center gap-1">
                    <button type="button" aria-label={`Decrease quantity of ${c.label}`} className="w-11 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold shrink-0" onClick={() => nudgeQty(c, simple ? -50 : -10)}>−</button>
                    <NumberField value={c.quantity} nonNegative label={`Quantity of ${c.label}`} onCommit={(v) => v && setC(c.id, { quantity: v })} />
                    <button type="button" aria-label={`Increase quantity of ${c.label}`} className="w-11 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold shrink-0" onClick={() => nudgeQty(c, simple ? 50 : 10)}>+</button>
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-slate-400 mb-1">Unit</div>
                  <select value={c.unit} onChange={(e) => setC(c.id, { unit: e.target.value as Unit })} aria-label={`Unit of ${c.label}`} className="h-11 px-2 rounded-lg bg-surface-card border border-surface-border text-white text-sm">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-slate-400 mb-1">Concentration of {solute} (%)</div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label={`Decrease concentration of ${c.label}`} className="w-11 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold shrink-0" onClick={() => nudgePct(c, -5n)}>−</button>
                  <NumberField value={c.solutes[solute] ?? ZERO} nonNegative max={HUNDRED} label={`Concentration of ${solute} in ${c.label}`} onCommit={(v) => v && setC(c.id, { percent: v })} />
                  <button type="button" aria-label={`Increase concentration of ${c.label}`} className="w-11 h-11 rounded-lg bg-surface-card border border-surface-border text-white text-xl font-bold shrink-0" onClick={() => nudgePct(c, 5n)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!simple && <button type="button" onClick={addC} disabled={constituents.length >= 4} className="mt-2 min-h-11 px-3 rounded-lg text-xs font-mono font-bold border bg-surface-card border-surface-border text-slate-200 disabled:opacity-40">+ Add an ingredient</button>}
      </Card>

      {!result.ok && <Card title="Cannot mix" tone="bad"><p className="text-sm text-rose-100" role="alert">{result.error.message}</p></Card>}

      {!locked && result.ok && (
        <>
          <Card title="Calculation" tone="ok">
            <ol className="text-xs font-mono text-slate-200 space-y-1 list-decimal list-inside">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </Card>
          {!simple && (
            <Card title="How much more is needed?">
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <label>Added liquid’s {solute} %<input value={addPct} onChange={(e) => setAddPct(e.target.value)} inputMode="decimal" className="mt-1 w-full h-11 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" /></label>
                <label>Target concentration %<input value={targetText} onChange={(e) => setTargetText(e.target.value)} inputMode="decimal" className="mt-1 w-full h-11 px-2 rounded-lg bg-surface-lowest border border-surface-border text-white text-base outline-none focus:border-purple-400" /></label>
              </div>
              <p className="text-xs text-slate-200" role="status">
                {!solve ? 'Enter two numbers.' : solve.kind === 'quantity' ? `Add ${fmt(solve.amount)} ${unit} of that liquid to reach ${targetText}%.` : solve.kind === 'any_quantity' ? 'Any amount works: the concentration will not change.' : solve.reason}
              </p>
            </Card>
          )}
        </>
      )}

      <Card title="Assumptions of this model">
        <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
          {(result.ok ? result.assumptions : ['All quantities use one consistent basis (all by volume, or all by mass).', 'Quantities are modelled as additive.', 'No solute is lost or gained.']).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </Card>
    </div>
  );

  return <WorkbenchShell canvas={canvas} tools={tools} lesson={lesson} />;
};
