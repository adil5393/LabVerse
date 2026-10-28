/**
 * Figures and laboratory investigations for Chapter 5 (Mixtures). Every number and verdict comes from
 * `engine/chemistry/mixtures/model.ts`; the drawings only illustrate it. Each figure works with touch and keyboard and states
 * its result in text, so nothing depends on seeing the drawing.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSelect, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  BLACK_INK, BOILING_POINTS, METHOD_LABEL, MIXTURE_CASES, SALTS, SAMPLE_MIXTURES, SOLUBILITY_TEMPS, caseById, chooseMethod, crystalYield, describeBeam,
  fmtNm, massByMass, massByVolume, propertiesOf, sampleById, saltById, saturatedMass, solubilityAt, spotDistance, volumeByVolume,
  type Method, type MixtureCase, type MixtureType,
} from '../../../engine/chemistry/mixtures/model';

const TYPE_LABEL: Record<MixtureType, string> = { solution: 'Solution', colloid: 'Colloid', suspension: 'Suspension' };
const yes = (b: boolean) => (b ? 'Yes' : 'No');

// ---------- Beaker, beam, settling and filtration ----------

const PropertiesTable: React.FC = () => {
  const rows: [string, (t: MixtureType) => string][] = [
    ['Nature', (t) => propertiesOf(t).nature],
    ['Particle size', (t) => propertiesOf(t).sizeBand],
    ['Particles visible', (t) => yes(propertiesOf(t).visible)],
    ['Held back by filter paper', (t) => yes(propertiesOf(t).filterable)],
    ['Settles on standing', (t) => yes(propertiesOf(t).settles)],
    ['Tyndall effect', (t) => yes(propertiesOf(t).tyndall)],
  ];
  const types: MixtureType[] = ['solution', 'colloid', 'suspension'];
  return (
    <div className="overflow-x-auto" data-testid="mix-table">
      <table className="w-full text-sm text-left border-collapse">
        <thead><tr><th className="p-2 text-slate-400">Property</th>{types.map((t) => <th key={t} className="p-2 text-white">{TYPE_LABEL[t]}</th>)}</tr></thead>
        <tbody>{rows.map(([name, f]) => <tr key={name} className="border-t border-surface-border"><td className="p-2 text-slate-300">{name}</td>{types.map((t) => <td key={t} className="p-2 text-white">{f(t)}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
};

export const MixBeamVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { sampleId?: string; beam?: boolean; settle?: boolean; editable?: boolean; table?: boolean };
  const [id, setId] = useState(p.sampleId ?? 'salt-water');
  const [beam, setBeam] = useState(Boolean(p.beam));
  const [settled, setSettled] = useState(Boolean(p.settle));
  const [filtered, setFiltered] = useState(false);
  if (p.table) return <div className="p-3" aria-label={alt}><PropertiesTable /></div>;
  const m = sampleById(id);
  const props5 = propertiesOf(m.type);
  const cloud = m.type === 'solution' ? 0 : m.type === 'colloid' ? 0.35 : 0.55;
  const showSettled = settled && props5.settles;
  const dots = Array.from({ length: m.type === 'suspension' ? 40 : 0 }, (_, i) => ({ x: 40 + ((i * 37) % 120), y: showSettled ? 150 - ((i * 7) % 12) : 60 + ((i * 53) % 90) }));
  return (
    <div className="space-y-3 p-3" data-testid="mix-beam" data-sample={m.id} data-type={m.type} data-tyndall={beam ? String(props5.tyndall) : 'off'} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 180" className="w-full max-w-[300px] mx-auto block" aria-hidden>
          <rect x="30" y="40" width="140" height="125" rx="6" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
          <rect x="32" y="55" width="136" height="108" fill={m.type === 'solution' ? '#38bdf8' : '#e2e8f0'} opacity={m.type === 'solution' ? 0.18 : cloud} />
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="2.2" fill="#f8fafc" />)}
          {beam && <line x1="0" y1="100" x2="200" y2="100" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />}
          {beam && props5.tyndall && <line x1="32" y1="100" x2="168" y2="100" stroke="#fca5a5" strokeWidth="7" opacity="0.55" />}
        </svg>
        <p className="text-sm text-white" data-testid="mix-beam-text">{beam ? describeBeam(m) : `${m.name} (${TYPE_LABEL[m.type]}, particles about ${fmtNm(m.diameterNm)}).`}</p>
        {settled && <p className="text-sm text-slate-200" data-testid="mix-settle-text">{props5.settles ? 'After standing, the particles have settled at the bottom.' : 'After standing, nothing has settled: the mixture looks the same.'}</p>}
        {filtered && <p className="text-sm text-slate-200" data-testid="mix-filter-text">{props5.filterable ? 'Filtering leaves a residue on the filter paper; the filtrate is clearer.' : 'Filtering leaves no residue: the particles pass through the filter paper.'}</p>}
        <p className="text-xs text-slate-400">{m.note} Safety: never look into a laser beam.</p>
      </div>
      {p.editable && (
        <div className={labCard}>
          <LabSelect id="mix-sample" label="Beaker" value={id} options={SAMPLE_MIXTURES.map((s) => ({ id: s.id, label: s.name }))} onChange={(v) => { setId(v); setSettled(false); setFiltered(false); }} />
          <div className="flex flex-wrap gap-2">
            <button type="button" data-action="beam" aria-pressed={beam} onClick={() => setBeam((b) => !b)} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white">{beam ? 'Switch the beam off' : 'Shine a beam'}</button>
            <button type="button" data-action="settle" onClick={() => setSettled(true)} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white">Leave to stand</button>
            <button type="button" data-action="filter" onClick={() => setFiltered(true)} className="min-h-[48px] px-4 rounded-xl border border-surface-border bg-surface text-sm text-white">Filter it</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------- Concentration ----------

type Mode = 'm/m' | 'm/v' | 'v/v';
export const MixConcentrationVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { mode?: Mode; solute?: number; other?: number; editable?: boolean };
  const [mode, setMode] = useState<Mode>(p.mode ?? 'm/m');
  const [a, setA] = useState(p.solute ?? 10);
  const [b, setB] = useState(p.other ?? 90);
  const pct = mode === 'm/m' ? massByMass(a, b) : mode === 'm/v' ? massByVolume(a, b) : volumeByVolume(a, b);
  const valid = mode === 'm/m' || b > a || mode === 'm/v';
  const soluteUnit = mode === 'v/v' ? 'mL' : 'g';
  const otherLabel = mode === 'm/m' ? 'Solvent (water)' : 'Total solution';
  const otherUnit = mode === 'm/m' ? 'g' : 'mL';
  const formula = mode === 'm/m' ? `${fmtNum(a)} ÷ (${fmtNum(a)} + ${fmtNum(b)}) × 100` : `${fmtNum(a)} ÷ ${fmtNum(b)} × 100`;
  return (
    <div className="space-y-3 p-3" data-testid="mix-concentration" data-mode={mode} data-percent={fmtNum(pct, 2)} aria-label={alt}>
      <div className={labCard}>
        <div className="h-4 rounded-full bg-surface-high overflow-hidden" aria-hidden><div className="h-full bg-teal-400" style={{ width: `${Math.min(100, pct)}%` }} /></div>
        <p className="text-sm text-white">% {mode} = {formula} = <strong data-testid="mix-percent">{fmtNum(pct, 2)} %</strong></p>
        {!valid && <p className="text-xs text-amber-300">The solute cannot be more than the whole solution.</p>}
        <p className="text-xs text-slate-400">{mode === 'm/m' ? 'Grams of solute in 100 g of solution; the solution is solute + solvent.' : mode === 'm/v' ? 'Grams of solute in 100 mL of solution (medicines, saline).' : 'Millilitres of a liquid solute in 100 mL of solution (vinegar, perfumes).'}</p>
      </div>
      {p.editable && (
        <div className={labCard}>
          <LabChoice name="mode" label="Way of expressing" value={mode} options={[{ id: 'm/m', label: '% m/m' }, { id: 'm/v', label: '% m/v' }, { id: 'v/v', label: '% v/v' }]} onChange={(v) => setMode(v as Mode)} />
          <LabSlider id="conc-a" label="Solute" value={a} min={0.5} max={100} step={0.5} unit={soluteUnit} onChange={setA} />
          <LabSlider id="conc-b" label={otherLabel} value={b} min={10} max={1000} step={5} unit={otherUnit} onChange={setB} />
        </div>
      )}
    </div>
  );
};

// ---------- Solubility curves and crystallization ----------

const SALT_COLOUR: Record<string, string> = { kno3: '#f59e0b', nacl: '#38bdf8', kcl: '#a78bfa', nh4cl: '#34d399' };

export const MixSolubilityVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { saltIds?: string[]; temp?: number; hot?: number; cold?: number; water?: number; editable?: boolean; cooling?: boolean };
  const ids = p.saltIds ?? SALTS.map((s) => s.id);
  const [temp, setTemp] = useState(p.temp ?? 40);
  const [saltId, setSaltId] = useState(ids[0]);
  const [hot, setHot] = useState(p.hot ?? 60);
  const [cold, setCold] = useState(p.cold ?? 20);
  const [water, setWater] = useState(p.water ?? 100);
  const X = (t: number) => 30 + ((t - 10) / 70) * 180, Y = (g: number) => 140 - (g / 180) * 125;
  const salt = saltById(saltId);
  const yieldG = crystalYield(salt, hot, cold, water);
  return (
    <div className="space-y-3 p-3" data-testid="mix-solubility" data-yield={fmtNum(yieldG, 1)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 220 160" className="w-full max-w-[420px] mx-auto block" aria-hidden>
          <line x1="30" y1="140" x2="212" y2="140" stroke="#64748b" /><line x1="30" y1="10" x2="30" y2="140" stroke="#64748b" />
          {SOLUBILITY_TEMPS.map((t) => <text key={t} x={X(t)} y="152" fontSize="7" textAnchor="middle" fill="#94a3b8">{t}</text>)}
          {[0, 50, 100, 150].map((g) => <text key={g} x="26" y={Y(g) + 2} fontSize="7" textAnchor="end" fill="#94a3b8">{g}</text>)}
          {ids.map((sid) => { const s = saltById(sid); return <polyline key={sid} fill="none" stroke={SALT_COLOUR[sid]} strokeWidth="2" points={SOLUBILITY_TEMPS.map((t, i) => `${X(t)},${Y(s.g100[i])}`).join(' ')} />; })}
          {!p.cooling && <line x1={X(temp)} y1="10" x2={X(temp)} y2="140" stroke="#f8fafc" strokeDasharray="3 3" />}
          {p.cooling && <><line x1={X(hot)} y1={Y(solubilityAt(salt, hot))} x2={X(cold)} y2={Y(solubilityAt(salt, cold))} stroke="#f8fafc" strokeDasharray="3 3" /><circle cx={X(hot)} cy={Y(solubilityAt(salt, hot))} r="3" fill="#ef4444" /><circle cx={X(cold)} cy={Y(solubilityAt(salt, cold))} r="3" fill="#38bdf8" /></>}
        </svg>
        <p className="text-xs text-slate-400">x: temperature (°C); y: solubility (g per 100 g of water). Values from the chapter&apos;s data table; between table temperatures the line is a straight-line estimate.</p>
        {!p.cooling && (
          <ul className="text-sm text-white space-y-1" data-testid="mix-solubility-readings">
            {ids.map((sid) => { const s = saltById(sid); return <li key={sid}><span className="inline-block w-3 h-3 rounded-sm mr-2 align-middle" style={{ background: SALT_COLOUR[sid] }} />{s.name}: <strong>{fmtNum(solubilityAt(s, temp), 1)} g</strong> per 100 g of water at {temp} °C</li>; })}
          </ul>
        )}
        {p.cooling && (
          <p className="text-sm text-white" data-testid="mix-yield-text">{salt.name} saturated in {water} g of water at {hot} °C holds {fmtNum(saturatedMass(salt, hot, water), 1)} g; at {cold} °C only {fmtNum(saturatedMass(salt, cold, water), 1)} g can stay dissolved, so <strong>{fmtNum(yieldG, 1)} g</strong> {hot > cold ? 'crystallizes' : 'would crystallize (choose a lower final temperature)'}.</p>
        )}
      </div>
      {p.editable && !p.cooling && <div className={labCard}><LabSlider id="sol-temp" label="Temperature" value={temp} min={10} max={80} step={1} unit="°C" onChange={setTemp} /></div>}
      {p.editable && p.cooling && (
        <div className={labCard}>
          <LabSelect id="sol-salt" label="Salt" value={saltId} options={SALTS.map((s) => ({ id: s.id, label: s.name }))} onChange={setSaltId} />
          <LabSlider id="sol-hot" label="Saturated at" value={hot} min={10} max={80} step={5} unit="°C" onChange={setHot} />
          <LabSlider id="sol-cold" label="Cooled to" value={cold} min={10} max={80} step={5} unit="°C" onChange={setCold} />
          <LabSlider id="sol-water" label="Water" value={water} min={25} max={500} step={25} unit="g" onChange={setWater} />
        </div>
      )}
    </div>
  );
};

// ---------- Separation bench ----------

const METHOD_PICTURE: Partial<Record<Method, string>> = {
  distillation: 'Flask heated → vapour → water-cooled condenser → distillate in the receiver.',
  'fractional-distillation': 'Flask heated → fractionating column → condenser → fractions collected one by one.',
  'separating-funnel': 'Layers settle in the funnel; the lower layer runs out through the stopcock first.',
  sublimation: 'China dish heated gently under an inverted, cotton-plugged funnel; the solid deposits on the cool funnel wall.',
  centrifugation: 'Tubes spun fast; the densest part collects at the bottom, the lightest stays on top.',
  coagulation: 'Alum added; fine particles clump, settle, and the clear liquid is decanted or filtered.',
  chromatography: 'A spot on a paper strip above the solvent; the solvent rises and carries each component at its own rate.',
  crystallization: 'Hot saturated solution filtered, cooled slowly; crystals filtered off and dried.',
  evaporation: 'The solution is heated gently until the solvent has gone and the solid remains.',
  filtration: 'The mixture is poured through filter paper in a funnel; the solid stays on the paper.',
  magnet: 'A magnet drawn through the mixture picks out the magnetic part.',
  'dissolve-filter-evaporate': 'Add water and stir; filter off the insoluble solid; evaporate the filtrate to get the soluble one.',
};
const LIQUIDS = Object.keys(BOILING_POINTS);
const ALL_METHODS: Method[] = ['distillation', 'fractional-distillation', 'separating-funnel', 'evaporation', 'crystallization', 'filtration', 'sublimation', 'magnet', 'centrifugation', 'coagulation', 'chromatography', 'dissolve-filter-evaporate', 'none'];

export const MixSeparationVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { caseId?: string; editable?: boolean; quiz?: boolean };
  const [caseId, setCaseId] = useState(p.caseId ?? 'acetone-water');
  const [liqA, setLiqA] = useState('alcohol');
  const [liqB, setLiqB] = useState('benzene');
  const [guess, setGuess] = useState<Method | null>(null);
  const base = caseById(caseId);
  const twoLiquids = p.editable && base.kind === 'two-miscible-liquids';
  const c: MixtureCase = twoLiquids ? { id: 'custom', name: `${liqA} and ${liqB}`, kind: 'two-miscible-liquids', boilingPoints: [BOILING_POINTS[liqA], BOILING_POINTS[liqB]] } : base;
  const choice = chooseMethod(c);
  const revealed = !p.quiz || guess !== null;
  return (
    <div className="space-y-3 p-3" data-testid="mix-separation" data-case={c.id} data-method={revealed ? choice.method : 'hidden'} aria-label={alt}>
      <div className={labCard}>
        <p className="text-sm text-slate-300">Mixture: <strong className="text-white">{c.name}</strong>{c.boilingPoints ? ` (boiling points ${c.boilingPoints[0]} °C and ${c.boilingPoints[1]} °C)` : ''}</p>
        {p.quiz && (
          <LabChoice name="method" label="Which method would you use?" value={guess ?? ''} options={ALL_METHODS.map((m) => ({ id: m, label: METHOD_LABEL[m] }))} onChange={(v) => setGuess(v as Method)} />
        )}
        {revealed && (
          <div className="space-y-1" data-testid="mix-separation-result">
            {p.quiz && guess && <p className={`text-sm font-semibold ${guess === choice.method ? 'text-emerald-300' : 'text-amber-300'}`} data-verdict={guess === choice.method ? 'right' : 'try-again'}>{guess === choice.method ? 'Yes, that works.' : `Not the best choice. ${METHOD_LABEL[guess]} does not use the property that differs here.`}</p>}
            <p className="text-sm text-white">Method: <strong>{METHOD_LABEL[choice.method]}</strong></p>
            <p className="text-sm text-slate-200">{choice.reason}</p>
            {METHOD_PICTURE[choice.method] && <p className="text-xs text-slate-400">{METHOD_PICTURE[choice.method]}</p>}
          </div>
        )}
      </div>
      {p.editable && (
        <div className={labCard}>
          <LabSelect id="sep-case" label="Mixture" value={caseId} options={MIXTURE_CASES.map((m) => ({ id: m.id, label: m.name }))} onChange={(v) => { setCaseId(v); setGuess(null); }} />
          {twoLiquids && (
            <div className="grid grid-cols-2 gap-2">
              <LabSelect id="sep-a" label="Liquid 1" value={liqA} options={LIQUIDS.map((l) => ({ id: l, label: `${l} (${BOILING_POINTS[l]} °C)` }))} onChange={(v) => { setLiqA(v); setGuess(null); }} />
              <LabSelect id="sep-b" label="Liquid 2" value={liqB} options={LIQUIDS.map((l) => ({ id: l, label: `${l} (${BOILING_POINTS[l]} °C)` }))} onChange={(v) => { setLiqB(v); setGuess(null); }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------- Paper chromatography ----------

export const MixChromatographyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { front?: number; editable?: boolean };
  const [front, setFront] = useState(p.front ?? 6);
  const base = 150, cmPx = 15;
  return (
    <div className="space-y-3 p-3" data-testid="mix-chromatography" data-front={front} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 120 170" className="w-full max-w-[180px] mx-auto block" aria-hidden>
          <rect x="40" y="10" width="40" height="155" fill="#f8fafc" opacity="0.9" />
          <rect x="30" y="155" width="60" height="12" fill="#38bdf8" opacity="0.4" />
          <rect x="40" y={base - front * cmPx} width="40" height={front * cmPx} fill="#38bdf8" opacity="0.15" />
          <line x1="40" y1={base - 2 * cmPx + 30} x2="80" y2={base - 2 * cmPx + 30} stroke="#334155" strokeDasharray="2 2" />
          {BLACK_INK.map((d) => <circle key={d.id} cx="60" cy={base - spotDistance(d.rate, front) * cmPx} r="4" fill={front > 0 ? d.colour : '#111827'} />)}
        </svg>
        <p className="text-sm text-white" data-testid="mix-chromatography-text">Solvent front {fmtNum(front, 1)} cm above the start line: {front > 0 ? BLACK_INK.map((d) => `${d.id} ${fmtNum(spotDistance(d.rate, front), 1)} cm`).join(', ') : 'the ink spot has not moved yet'}.</p>
        <p className="text-xs text-slate-400">An illustrative black ink made of three dyes. Each dye always moves the same fraction of the solvent&apos;s distance.</p>
      </div>
      {p.editable && <div className={labCard}><LabSlider id="chrom-front" label="Solvent front" value={front} min={0} max={8} step={0.5} unit="cm" onChange={setFront} /></div>}
    </div>
  );
};

export const MIX_VISUALS: VisualRegistry = {
  mixBeam: MixBeamVisual, mixConcentration: MixConcentrationVisual, mixSolubility: MixSolubilityVisual, mixSeparation: MixSeparationVisual, mixChromatography: MixChromatographyVisual,
};
