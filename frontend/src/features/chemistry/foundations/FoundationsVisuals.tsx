/**
 * Figures and laboratory investigations for Chapter 9 (Atomic Foundations of Matter): a reaction on a balance (open and closed),
 * a bond builder, a criss-cross formula builder, a formula mass calculator and the property test bench. Every result comes from
 * `engine/chemistry/foundations/model.ts`, and every result is stated in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSelect, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  ANIONS, ATOMIC_MASS, CATIONS, SAMPLES, balanceReading, bondBetween, covalentFormula, formulaMassParts, ionById, ionText, ionicFormula, ionicName,
  pretty, valencyOfSymbol,
} from '../../../engine/chemistry/foundations/model';

// ---------- Reaction on a balance ----------

const REACTIONS: Record<string, { label: string; start: number; gas: number; gasName: string }> = {
  'soda-vinegar': { label: 'Baking soda + vinegar', start: 152.4, gas: 1.0, gasName: 'carbon dioxide' },
  'marble-acid': { label: 'Marble chips + dilute acid', start: 168.0, gas: 2.2, gasName: 'carbon dioxide' },
  'salts': { label: 'Sodium sulfate + barium chloride solutions', start: 141.6, gas: 0, gasName: '' },
};

export const MassBalanceVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { reaction?: string; editable?: boolean };
  const [rid, setRid] = useState(p.reaction ?? 'soda-vinegar');
  const [closed, setClosed] = useState(false);
  const [reacted, setReacted] = useState(false);
  const r = REACTIONS[rid] ?? REACTIONS['soda-vinegar'];
  const reading = reacted ? balanceReading(r.start, r.gas, closed) : r.start;
  const text = !reacted
    ? `Before mixing: the balance reads ${fmtNum(reading, 1)} g.`
    : r.gas === 0
      ? `After mixing: a white solid forms and the balance still reads ${fmtNum(reading, 1)} g. No gas is given off, so an open set-up is fair.`
      : closed
        ? `After the reaction in the closed set-up: the ${r.gasName} is trapped and the balance still reads ${fmtNum(reading, 1)} g. Mass is conserved.`
        : `After the reaction in the open flask: ${fmtNum(r.gas, 1)} g of ${r.gasName} escaped, so the balance reads ${fmtNum(reading, 1)} g. The mass went into the air; it was not destroyed.`;
  return (
    <div className="space-y-3 p-3" data-testid="mass-balance" data-reading={fmtNum(reading, 1)} data-closed={String(closed)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 120" className="w-full max-w-[280px] mx-auto block" aria-hidden>
          <rect x="30" y="95" width="140" height="18" rx="4" fill="#334155" />
          <rect x="70" y="99" width="60" height="10" rx="2" fill="#0f172a" />
          <text x="100" y="107" fontSize="8" textAnchor="middle" fill="#34d399" fontFamily="monospace">{fmtNum(reading, 1)} g</text>
          <path d="M85 92 L80 50 L95 40 L105 40 L120 50 L115 92 Z" fill="#94a3b8" opacity="0.4" stroke="#cbd5e1" />
          {closed && <ellipse cx="100" cy={reacted && r.gas > 0 ? 22 : 34} rx={reacted && r.gas > 0 ? 16 : 7} ry={reacted && r.gas > 0 ? 18 : 8} fill="#f472b6" opacity="0.7" />}
          {reacted && !closed && r.gas > 0 && [0, 1, 2].map((i) => <circle key={i} cx={95 + i * 6} cy={30 - i * 6} r="2" fill="#cbd5e1" />)}
        </svg>
        <p className="text-sm text-white" data-testid="mass-balance-text">{text}</p>
      </div>
      {p.editable && (
        <div className={labCard}>
          <LabSelect id="mb-reaction" label="Reaction" value={rid} options={Object.entries(REACTIONS).map(([id, x]) => ({ id, label: x.label }))} onChange={(v) => { setRid(v); setReacted(false); }} />
          <LabChoice name="mb-system" label="Set-up" value={closed ? 'closed' : 'open'} options={[{ id: 'open', label: 'Open flask' }, { id: 'closed', label: 'Closed (balloon)' }]} onChange={(v) => { setClosed(v === 'closed'); setReacted(false); }} />
          <div className="flex gap-2">
            <button type="button" data-action="react" onClick={() => setReacted(true)} disabled={reacted} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white disabled:opacity-50">Mix the reactants</button>
            <button type="button" data-action="reset" onClick={() => setReacted(false)} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white">Start again</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Bond builder ----------

const BOND_ELEMENTS = ['H', 'C', 'N', 'O', 'F', 'Cl', 'Ne', 'Na', 'Mg', 'Al', 'K', 'Ca'];

export const BondBuilderVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { a?: string; b?: string; editable?: boolean };
  const [a, setA] = useState(p.a ?? 'H');
  const [b, setB] = useState(p.b ?? 'H');
  const r = bondBetween(a, b);
  const order = r.bondOrder ?? 1;
  return (
    <div className="space-y-3 p-3" data-testid="bond-builder" data-kind={r.kind} data-formula={r.formula} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 220 90" className="w-full max-w-[320px] mx-auto block" aria-hidden>
          <circle cx="70" cy="45" r="28" fill="none" stroke="#475569" /><circle cx="150" cy="45" r="28" fill="none" stroke="#475569" />
          <text x="70" y="50" fontSize="16" textAnchor="middle" fill="#f8fafc">{a}</text><text x="150" y="50" fontSize="16" textAnchor="middle" fill="#f8fafc">{b}</text>
          {r.kind === 'covalent' && Array.from({ length: order }, (_, i) => <g key={i}><circle cx="106" cy={45 - (order - 1) * 7 + i * 14} r="3.5" fill="#38bdf8" /><circle cx="114" cy={45 - (order - 1) * 7 + i * 14} r="3.5" fill="#fbbf24" /></g>)}
          {r.kind === 'ionic' && <><path d="M98 30 Q110 15 122 30" fill="none" stroke="#fbbf24" markerEnd="url(#arr)" /><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#fbbf24" /></marker></defs></>}
        </svg>
        <p className="text-base font-bold text-white" data-testid="bond-result">{r.kind === 'none' ? 'No compound forms' : `${r.kind === 'ionic' ? 'Ionic' : 'Covalent'}: ${pretty(r.formula)}`}</p>
        <p className="text-sm text-slate-200">{r.detail}</p>
        <p className="text-xs text-slate-400">Valencies from Chapter 8: {a} {valencyOfSymbol(a)}, {b} {valencyOfSymbol(b)}. Formulae follow the valency method; a few real compounds differ (carbon and oxygen also form CO).</p>
      </div>
      {p.editable && (
        <div className={labCard}>
          <div className="grid grid-cols-2 gap-2">
            <LabSelect id="bond-a" label="Atom 1" value={a} options={BOND_ELEMENTS.map((e) => ({ id: e, label: e }))} onChange={setA} />
            <LabSelect id="bond-b" label="Atom 2" value={b} options={BOND_ELEMENTS.map((e) => ({ id: e, label: e }))} onChange={setB} />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Criss-cross formula builder ----------

export const FormulaBuilderVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { mode?: 'ionic' | 'covalent'; cation?: string; anion?: string; a?: string; b?: string; editable?: boolean };
  const [cat, setCat] = useState(p.cation ?? 'ca');
  const [an, setAn] = useState(p.anion ?? 'cl');
  const covalent = p.mode === 'covalent';
  const c = covalent ? covalentFormula(p.a ?? 'C', valencyOfSymbol(p.a ?? 'C'), p.b ?? 'Cl', valencyOfSymbol(p.b ?? 'Cl')) : ionicFormula(ionById(cat), ionById(an));
  const reducedNote = c.raw[0] !== c.reduced[0] ? ` Divide ${c.raw[0]} and ${c.raw[1]} by ${c.raw[0] / c.reduced[0]} to get the simplest ratio.` : '';
  const name = covalent ? '' : ionicName(ionById(cat), ionById(an));
  return (
    <div className="space-y-3 p-3" data-testid="formula-builder" data-formula={c.formula} aria-label={alt}>
      <div className={labCard}>
        <div className="grid grid-cols-2 gap-3 text-center font-mono text-white" aria-hidden>
          <div><div className="text-2xl">{pretty(c.left)}</div><div className="text-sm text-amber-300">{c.leftNumber}</div></div>
          <div><div className="text-2xl">{pretty(c.right)}</div><div className="text-sm text-amber-300">{c.rightNumber}</div></div>
        </div>
        <p className="text-sm text-slate-200">{covalent ? 'Valencies' : 'Charge numbers'} crossed over: {pretty(c.left)} takes {c.raw[0]}, {pretty(c.right)} takes {c.raw[1]}.{reducedNote}</p>
        <p className="text-lg font-bold text-white">Formula: <span data-testid="formula-result">{pretty(c.formula)}</span>{name && <span className="text-sm font-normal text-slate-300"> ({name})</span>}</p>
        {!covalent && <p className="text-xs text-slate-400">Check: {c.reduced[0]} × ({ionById(cat).charge > 0 ? '+' : ''}{ionById(cat).charge}) + {c.reduced[1]} × ({ionById(an).charge}) = 0. Ions: {ionText(ionById(cat))} and {ionText(ionById(an))}.</p>}
      </div>
      {p.editable && !covalent && (
        <div className={labCard}>
          <div className="grid grid-cols-2 gap-2">
            <LabSelect id="fb-cation" label="Cation" value={cat} options={CATIONS.map((x) => ({ id: x.id, label: `${x.name} ${ionText(x)}` }))} onChange={setCat} />
            <LabSelect id="fb-anion" label="Anion" value={an} options={ANIONS.map((x) => ({ id: x.id, label: `${x.name} ${ionText(x)}` }))} onChange={setAn} />
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Formula mass calculator ----------

export const FormulaMassVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { formula?: string; editable?: boolean };
  const [text, setText] = useState(p.formula ?? 'CO2');
  let parts: ReturnType<typeof formulaMassParts> | null = null, error = '';
  try { parts = formulaMassParts(text.trim()); } catch (e) { error = (e as Error).message; }
  const total = parts ? parts.reduce((s, x) => s + x.subtotal, 0) : 0;
  return (
    <div className="space-y-3 p-3" data-testid="formula-mass" data-mass={parts ? fmtNum(total, 2) : ''} aria-label={alt}>
      <div className={labCard}>
        {parts ? (
          <>
            <ul className="text-sm text-white space-y-1">{parts.map((x) => <li key={x.symbol}>{x.symbol}: {x.count} × {x.atomicMass} u = {fmtNum(x.subtotal, 2)} u</li>)}</ul>
            <p className="text-lg font-bold text-white">Mass of {pretty(text.trim())} = <span data-testid="formula-mass-result">{fmtNum(total, 2)} u</span></p>
          </>
        ) : <p className="text-sm text-amber-300" role="alert">That formula could not be read ({error}). Use symbols, numbers and brackets, for example Ca(NO3)2.</p>}
        <p className="text-xs text-slate-400">Atomic masses used: {Object.entries(ATOMIC_MASS).slice(0, 12).map(([s, m]) => `${s} ${m}`).join(', ')} u, and more.</p>
      </div>
      {p.editable && (
        <div className={labCard}>
          <label htmlFor="fm-input" className="block text-sm text-slate-200">Formula
            <input id="fm-input" value={text} onChange={(e) => setText(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 font-mono text-base text-on-surface" />
          </label>
        </div>
      )}
    </div>
  );
};

// ---------- Property test bench ----------

export const PropertiesTestVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean };
  const [tested, setTested] = useState<Record<string, boolean>>({});
  const all = !p.editable;
  return (
    <div className="space-y-3 p-3" data-testid="properties-test" aria-label={alt}>
      <ul className="space-y-2 sm:hidden" aria-label="Test results">
        {SAMPLES.map((s) => {
          const show = all || tested[s.id];
          return (
            <li key={s.id} className={labCard} data-sample-card={s.id}>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-white">{s.name}</strong>
                {p.editable && <button type="button" data-test-card={s.id} disabled={Boolean(tested[s.id])} onClick={() => setTested((t) => ({ ...t, [s.id]: true }))} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white disabled:opacity-50">{show ? 'Tested' : 'Test'}</button>}
              </div>
              {show ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                  <dt className="text-slate-400">In water</dt><dd className="text-white">{s.dissolvesInWater ? 'Dissolves' : 'Does not dissolve'}</dd>
                  <dt className="text-slate-400">In kerosene</dt><dd className="text-white">{s.dissolvesInKerosene ? 'Dissolves' : 'Does not dissolve'}</dd>
                  <dt className="text-slate-400">Solid conducts</dt><dd className="text-white">No</dd>
                  <dt className="text-slate-400">Solution conducts</dt><dd className="text-white">{s.dissolvesInWater ? (s.conductsInWater ? 'Yes: bulb glows' : 'No') : 'Does not dissolve'}</dd>
                </dl>
              ) : <p className="text-sm text-slate-400">Not tested yet.</p>}
            </li>
          );
        })}
      </ul>
      <div className={`${labCard} overflow-x-auto hidden sm:block`}>
        <table className="w-full text-sm text-left border-collapse">
          <thead><tr className="text-slate-400"><th className="p-2">Compound</th><th className="p-2">Water</th><th className="p-2">Kerosene</th><th className="p-2">Solid conducts</th><th className="p-2">Solution conducts</th>{p.editable && <th className="p-2"><span className="sr-only">Test</span></th>}</tr></thead>
          <tbody>
            {SAMPLES.map((s) => {
              const show = all || tested[s.id];
              const cell = (b: boolean, yes: string, no: string) => (show ? (b ? yes : no) : '?');
              return (
                <tr key={s.id} className="border-t border-surface-border text-white" data-sample={s.id} data-tested={String(Boolean(show))}>
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{cell(s.dissolvesInWater, 'Dissolves', 'No')}</td>
                  <td className="p-2">{cell(s.dissolvesInKerosene, 'Dissolves', 'No')}</td>
                  <td className="p-2">{cell(s.conductsSolid, 'Yes', 'No')}</td>
                  <td className="p-2">{show ? (s.dissolvesInWater ? (s.conductsInWater ? 'Yes: bulb glows' : 'No') : 'Does not dissolve') : '?'}</td>
                  {p.editable && <td className="p-2"><button type="button" data-test={s.id} disabled={Boolean(tested[s.id])} onClick={() => setTested((t) => ({ ...t, [s.id]: true }))} className="min-h-[48px] px-3 rounded-xl border border-surface-border bg-surface text-sm disabled:opacity-50">Test</button></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">Results as described in the chapter. Safety: use a low-voltage battery; kerosene and petrol catch fire easily.</p>
    </div>
  );
};

export const FOUND_VISUALS: VisualRegistry = { massBalance: MassBalanceVisual, bondBuilder: BondBuilderVisual, formulaBuilder: FormulaBuilderVisual, formulaMass: FormulaMassVisual, propertiesTest: PropertiesTestVisual };
