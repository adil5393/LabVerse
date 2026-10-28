/**
 * Figures and laboratory investigations for Chapter 8 (Journey Inside the Atom): atomic models, an atom builder, the gold foil
 * experiment and an isotope mixer. Every number comes from `engine/chemistry/atom/model.ts`. Atoms have no colour; colours here
 * only tell the particles apart, and every result is also given in words.
 */

import React, { useMemo, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  SHELL_NAMES, averageAtomicMass, configText, elementBySymbol, scatterCounts, simpleAverage, summarize, valenceElectrons, valencyOf, type ScatterModel,
} from '../../../engine/chemistry/atom/model';

const P = '#ef4444', N = '#94a3b8', E = '#38bdf8';

// ---------- Atomic models ----------

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'bohr';
const MODEL_TEXT: Record<ModelId, string> = {
  dalton: 'Dalton (1808): a solid, indivisible sphere.',
  thomson: 'Thomson (1897): a sphere of positive charge with electrons spread through it.',
  rutherford: 'Rutherford (1911): a tiny, dense, positive nucleus with electrons around it; mostly empty space.',
  bohr: 'Bohr (1913): electrons only in fixed shells K, L, M, N of definite energy.',
};

const ModelPicture: React.FC<{ model: ModelId }> = ({ model }) => (
  <svg viewBox="0 0 160 160" className="w-full max-w-[220px] mx-auto block" aria-hidden>
    {model === 'dalton' && <circle cx="80" cy="80" r="55" fill="#64748b" />}
    {model === 'thomson' && <><circle cx="80" cy="80" r="60" fill="#fca5a5" opacity="0.5" />{[[60, 55], [100, 60], [75, 95], [110, 100], [50, 100], [85, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={E} />)}</>}
    {model === 'rutherford' && <><ellipse cx="80" cy="80" rx="62" ry="24" fill="none" stroke="#475569" /><ellipse cx="80" cy="80" rx="24" ry="62" fill="none" stroke="#475569" /><circle cx="80" cy="80" r="3" fill={P} /><circle cx="142" cy="80" r="4" fill={E} /><circle cx="80" cy="18" r="4" fill={E} /></>}
    {model === 'bohr' && <>{[20, 38, 56, 72].map((r, i) => <g key={r}><circle cx="80" cy="80" r={r} fill="none" stroke="#475569" /><text x={80 + r - 4} y="76" fontSize="8" fill="#94a3b8">{SHELL_NAMES[i]}</text></g>)}<circle cx="80" cy="80" r="6" fill={P} /></>}
  </svg>
);

export const AtomModelVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { model?: ModelId; editable?: boolean };
  const [model, setModel] = useState<ModelId>(p.model ?? 'thomson');
  return (
    <div className="space-y-3 p-3" data-testid="atom-model" data-model={model} aria-label={alt}>
      <div className={labCard}><ModelPicture model={model} /><p className="text-sm text-white">{MODEL_TEXT[model]}</p><p className="text-xs text-slate-400">Not to scale: a real nucleus is about 10⁵ times smaller than the atom. Colours only tell the parts apart.</p></div>
      {p.editable && <div className={labCard}><LabChoice name="model" label="Model" value={model} options={(['dalton', 'thomson', 'rutherford', 'bohr'] as ModelId[]).map((m) => ({ id: m, label: m[0].toUpperCase() + m.slice(1) }))} onChange={(v) => setModel(v as ModelId)} /></div>}
    </div>
  );
};

// ---------- Atom builder ----------

const Counter: React.FC<{ id: string; label: string; value: number; set: (n: number) => void; max: number; colour: string }> = ({ id, label, value, set, max, colour }) => (
  <div className="flex items-center justify-between gap-2" data-counter={id}>
    <span className="text-sm text-slate-200"><span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ background: colour }} />{label}</span>
    <span className="flex items-center gap-2">
      <button type="button" aria-label={`Remove one ${label.toLowerCase()}`} data-dec={id} disabled={value <= 0} onClick={() => set(value - 1)} className="min-h-[48px] min-w-[48px] rounded-xl border border-surface-border bg-surface text-lg text-white disabled:opacity-40">−</button>
      <strong className="w-8 text-center font-mono text-white" data-count={id}>{value}</strong>
      <button type="button" aria-label={`Add one ${label.toLowerCase()}`} data-inc={id} disabled={value >= max} onClick={() => set(value + 1)} className="min-h-[48px] min-w-[48px] rounded-xl border border-surface-border bg-surface text-lg text-white disabled:opacity-40">+</button>
    </span>
  </div>
);

/** Colours for the nucleus picture: protons and neutrons alternate while both remain, then the rest follow. */
const nucleons = (p: number, n: number): string[] => {
  const out: string[] = [];
  for (let i = 0; i < Math.max(p, n); i++) { if (i < p) out.push(P); if (i < n) out.push(N); }
  return out;
};

export const AtomBuilderVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { p?: number; n?: number; e?: number; editable?: boolean; showValency?: boolean };
  const [p, setP] = useState(q.p ?? 3);
  const [n, setN] = useState(q.n ?? 4);
  const [e, setE] = useState(q.e ?? 3);
  const s = summarize(p, n, e);
  const val = valencyOf(s.shells);
  const name = s.element ? `${s.element.name} (${s.element.symbol})` : p === 0 ? 'No protons: not an element' : `Element with Z = ${p} (beyond this laboratory’s first twenty)`;
  const chargeText = s.charge === 0 ? 'neutral atom' : `${s.kind}, charge ${s.charge > 0 ? '+' : '−'}${Math.abs(s.charge)}`;
  return (
    <div className="space-y-3 p-3" data-testid="atom-builder" data-element={s.element?.symbol ?? ''} data-mass={s.massNumber} data-charge={s.charge} data-config={configText(s.shells)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 200" className="w-full max-w-[260px] mx-auto block" aria-hidden>
          {s.shells.map((_, i) => <circle key={i} cx="100" cy="100" r={30 + i * 20} fill="none" stroke="#475569" />)}
          {nucleons(p, n).slice(0, 40).map((fill, i) => { const a = i * 2.4, r = 3 + Math.sqrt(i) * 2.6; return <circle key={i} cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r="3.2" fill={fill} />; })}
          {s.shells.flatMap((count, i) => Array.from({ length: count }, (_, k) => { const r = 30 + i * 20, a = (2 * Math.PI * k) / count; return <circle key={`${i}-${k}`} cx={100 + r * Math.cos(a)} cy={100 + r * Math.sin(a)} r="3.5" fill={E} />; }))}
        </svg>
        <p className="text-base font-bold text-white" data-testid="atom-name">{name}</p>
        <p className="text-sm text-slate-200" data-testid="atom-facts">Z = {p}, A = {s.massNumber} ({p} protons + {n} neutrons), {e} electrons: {chargeText}.</p>
        {e > 0 && <p className="text-sm text-slate-200">Electronic configuration: <strong className="font-mono text-white">{s.shells.map((c, i) => `${SHELL_NAMES[i]} ${c}`).join(', ')}</strong> ({configText(s.shells)})</p>}
        {(q.showValency || q.editable) && e > 0 && s.charge === 0 && <p className="text-sm text-slate-200" data-testid="atom-valency">Valence electrons: {valenceElectrons(s.shells)} · valency {val.value} ({val.way === 'none' ? 'complete outer shell: hardly reacts' : val.way === 'share' ? 'shares four electrons' : `${val.way}s ${val.value} electron${val.value === 1 ? '' : 's'} to reach an octet`}).</p>}
        <p className="text-xs text-slate-400">Red: protons (+1). Grey: neutrons (0). Blue: electrons (−1). Not to scale; the nucleus is drawn far too large.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <Counter id="p" label="Protons" value={p} set={setP} max={20} colour={P} />
          <Counter id="n" label="Neutrons" value={n} set={setN} max={30} colour={N} />
          <Counter id="e" label="Electrons" value={e} set={setE} max={20} colour={E} />
        </div>
      )}
    </div>
  );
};

// ---------- Gold foil ----------

export const GoldFoilVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { model?: ScatterModel; editable?: boolean };
  const [model, setModel] = useState<ScatterModel>(q.model ?? 'rutherford');
  const [layers, setLayers] = useState(1);
  const c = useMemo(() => scatterCounts(model, 100000, layers), [model, layers]);
  const pct = (x: number) => (100 * x) / c.total;
  return (
    <div className="space-y-3 p-3" data-testid="gold-foil" data-model={model} data-back={c.back} data-large={c.large} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 220 120" className="w-full max-w-[360px] mx-auto block" aria-hidden>
          <rect x="110" y="10" width={3 + layers} height="100" fill="#facc15" />
          {[30, 45, 60, 75, 90].map((y) => <line key={y} x1="10" y1={y} x2="210" y2={y} stroke="#f472b6" strokeWidth="1.2" opacity="0.7" />)}
          {model === 'rutherford' && <><line x1="10" y1="58" x2="112" y2="58" stroke="#f472b6" strokeWidth="1.2" /><line x1="112" y1="58" x2="180" y2="15" stroke="#f472b6" strokeWidth="1.5" /><line x1="10" y1="62" x2="110" y2="62" stroke="#fb923c" strokeWidth="1.5" /><line x1="110" y1="62" x2="20" y2="100" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" /></>}
        </svg>
        <ul className="text-sm text-white space-y-1" data-testid="gold-foil-counts">
          <li>Passed straight through (under 1°): <strong>{fmtNum(pct(c.straight), 2)} %</strong></li>
          <li>Small deflection (1° to 10°): <strong>{fmtNum(pct(c.small), 2)} %</strong></li>
          <li>Large deflection (10° to 90°): <strong>{c.large}</strong> of {c.total.toLocaleString('en-IN')}</li>
          <li>Bounced back (over 90°): <strong>{c.back}</strong> of {c.total.toLocaleString('en-IN')}</li>
        </ul>
        <p className="text-sm text-slate-200">{model === 'thomson' ? 'If the positive charge were spread out (Thomson), nothing would be strongly deflected and nothing would bounce back.' : 'A tiny, dense, positive nucleus (Rutherford) turns back the few α particles that pass very close to it.'}</p>
        <p className="text-xs text-slate-400">An illustrative model of 100 000 α particles: proportions show the pattern, not the experiment’s exact counts.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="foil-model" label="Atom model" value={model} options={[{ id: 'thomson', label: 'Thomson' }, { id: 'rutherford', label: 'Rutherford' }]} onChange={(v) => setModel(v as ScatterModel)} />
          <LabSlider id="foil-layers" label="Foil thickness (layers of atoms)" value={layers} min={1} max={5} step={1} unit="" onChange={setLayers} />
        </div>
      )}
    </div>
  );
};

// ---------- Isotope mixer ----------

const ISOTOPE_SETS: Record<string, { name: string; masses: [number, number]; percent: number }> = {
  Cl: { name: 'Chlorine', masses: [35, 37], percent: 75 },
  Br: { name: 'Bromine', masses: [79, 81], percent: 49.7 },
  B: { name: 'Boron', masses: [10, 11], percent: 20 },
};

export const IsotopeMixVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { element?: string; editable?: boolean };
  const [el, setEl] = useState(q.element ?? 'Cl');
  const set = ISOTOPE_SETS[el] ?? ISOTOPE_SETS.Cl;
  const [share, setShare] = useState(set.percent);
  const avg = averageAtomicMass([{ mass: set.masses[0], percent: share }, { mass: set.masses[1], percent: 100 - share }]);
  const z = elementBySymbol(el)?.z ?? (el === 'Br' ? 35 : 0);
  return (
    <div className="space-y-3 p-3" data-testid="isotope-mix" data-average={fmtNum(avg, 3)} aria-label={alt}>
      <div className={labCard}>
        <div className="h-5 rounded-full overflow-hidden flex" aria-hidden><div style={{ width: `${share}%`, background: '#38bdf8' }} /><div style={{ width: `${100 - share}%`, background: '#a78bfa' }} /></div>
        <p className="text-sm text-white">{set.name}{z ? ` (Z = ${z})` : ''}: {fmtNum(share, 1)} % of mass {set.masses[0]} u and {fmtNum(100 - share, 1)} % of mass {set.masses[1]} u.</p>
        <p className="text-sm text-white">Weighted average = {set.masses[0]} × {fmtNum(share / 100, 3)} + {set.masses[1]} × {fmtNum((100 - share) / 100, 3)} = <strong data-testid="isotope-average">{fmtNum(avg, 3)} u</strong></p>
        <p className="text-xs text-slate-400">A plain average would be {fmtNum(simpleAverage(set.masses), 1)} u, which ignores how common each isotope is.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="iso-element" label="Element" value={el} options={Object.entries(ISOTOPE_SETS).map(([id, s]) => ({ id, label: s.name }))} onChange={(v) => { setEl(v); setShare(ISOTOPE_SETS[v].percent); }} />
          <LabSlider id="iso-share" label={`Share of mass ${set.masses[0]}`} value={share} min={0} max={100} step={0.1} unit="%" onChange={setShare} />
        </div>
      )}
    </div>
  );
};

export const ATOM_VISUALS: VisualRegistry = { atomModel: AtomModelVisual, atomBuilder: AtomBuilderVisual, goldFoil: GoldFoilVisual, isotopeMix: IsotopeMixVisual };
