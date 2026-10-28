/**
 * Figures and laboratory investigations for Chapter 8 (Journey Inside the Atom): atomic models, an atom builder, the gold foil
 * experiment and an isotope mixer. Every number comes from `engine/chemistry/atom/model.ts`. Atoms have no colour; colours here
 * only tell the particles apart, every coloured part is also labelled, and every result is given in words.
 */

import React, { useMemo, useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum } from '../../education/SubjectLabShell';
import { LabKey, LabPredict, LabStage, predictionNote } from '../../education/LabLayout';
import {
  MODEL_TIMELINE, SHELL_NAMES, averageAtomicMass, configText, elementBySymbol, scatterCounts, simpleAverage, summarize, valenceElectrons, valencyOf, type ScatterModel,
} from '../../../engine/chemistry/atom/model';

const P = '#ef4444', N = '#94a3b8', E = '#38bdf8';
const TXT = '#e2e8f0', MUTED = '#94a3b8';

// ---------- Atomic models ----------

type ModelId = 'dalton' | 'thomson' | 'rutherford' | 'bohr';
const MODELS: ModelId[] = ['dalton', 'thomson', 'rutherford', 'bohr'];
const MODEL_TEXT: Record<ModelId, string> = {
  dalton: 'Dalton (1808): a solid, indivisible sphere.',
  thomson: 'Thomson (1897): a sphere of positive charge with electrons spread through it.',
  rutherford: 'Rutherford (1911): a tiny, dense, positive nucleus with electrons around it; mostly empty space.',
  bohr: 'Bohr (1913): electrons only in fixed shells K, L, M, N of definite energy.',
};
const MODEL_EVIDENCE: Record<ModelId, string> = {
  dalton: 'It explained the laws of chemical combination, but could not explain electrons, discovered later.',
  thomson: 'It explained that atoms contain electrons and are neutral overall, but not the gold foil result.',
  rutherford: 'It explained why a few α particles bounce back from gold foil, but not why electrons do not spiral into the nucleus.',
  bohr: 'Fixed shells explain why atoms are stable and give the electronic configurations used for valency.',
};

const ModelPicture: React.FC<{ model: ModelId }> = ({ model }) => (
  <svg viewBox="0 0 320 200" role="img" aria-label={MODEL_TEXT[model]}>
    {model === 'dalton' && <><circle cx="130" cy="100" r="70" fill="#64748b" /><line x1="200" y1="100" x2="226" y2="100" stroke={MUTED} /><text x="230" y="96" fontSize="13" fill={TXT}>solid sphere,</text><text x="230" y="112" fontSize="13" fill={TXT}>no parts</text></>}
    {model === 'thomson' && <>
      <circle cx="130" cy="100" r="74" fill="#fca5a5" opacity="0.45" />
      {[[110, 70], [150, 76], [124, 120], [164, 122], [96, 116], [134, 48]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7" fill={E} />)}
      <line x1="171" y1="122" x2="226" y2="140" stroke={MUTED} /><text x="230" y="144" fontSize="13" fill={TXT}>electron (−)</text>
      <line x1="190" y1="70" x2="226" y2="60" stroke={MUTED} /><text x="230" y="58" fontSize="13" fill={TXT}>positive</text><text x="230" y="74" fontSize="13" fill={TXT}>charge spread out</text>
    </>}
    {model === 'rutherford' && <>
      <ellipse cx="130" cy="100" rx="80" ry="30" fill="none" stroke="#475569" /><ellipse cx="130" cy="100" rx="30" ry="80" fill="none" stroke="#475569" />
      <circle cx="130" cy="100" r="5" fill={P} /><circle cx="210" cy="100" r="6" fill={E} /><circle cx="130" cy="20" r="6" fill={E} />
      <line x1="135" y1="104" x2="226" y2="150" stroke={MUTED} /><text x="230" y="150" fontSize="13" fill={TXT}>tiny + nucleus</text>
      <line x1="216" y1="100" x2="226" y2="100" stroke={MUTED} /><text x="230" y="104" fontSize="13" fill={TXT}>electron</text>
      <text x="230" y="40" fontSize="13" fill={MUTED}>mostly</text><text x="230" y="56" fontSize="13" fill={MUTED}>empty space</text>
    </>}
    {model === 'bohr' && <>
      {[24, 44, 64, 84].map((r, i) => <g key={r}><circle cx="130" cy="100" r={r} fill="none" stroke="#475569" /><text x={130 + r * 0.72 + 2} y={100 - r * 0.72} fontSize="13" fill={TXT}>{SHELL_NAMES[i]}</text></g>)}
      <circle cx="130" cy="100" r="8" fill={P} />
      <text x="230" y="96" fontSize="13" fill={TXT}>fixed shells</text><text x="230" y="112" fontSize="13" fill={TXT}>K, L, M, N</text>
    </>}
  </svg>
);

export const AtomModelVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { model?: ModelId; editable?: boolean };
  const [model, setModel] = useState<ModelId>(p.model ?? 'thomson');
  const year = MODEL_TIMELINE.find((m) => m.id === model)?.year;
  return (
    <LabStage testId="atom-model" alt={alt} data={{ 'data-model': model }}
      question="How did the picture of the atom change as new evidence arrived?"
      sceneNote="Not to scale · colours only tell parts apart"
      scene={<>
        <ModelPicture model={model} />
        <ol className="lab-timeline" aria-label="Timeline of models">
          {MODELS.map((m) => <li key={m} aria-current={m === model ? 'step' : undefined}><span>{MODEL_TIMELINE.find((x) => x.id === m)?.year}</span>{m[0].toUpperCase() + m.slice(1)}</li>)}
        </ol>
      </>}
      controls={p.editable ? <LabChoice name="model" label="Model" value={model} options={MODELS.map((m) => ({ id: m, label: m[0].toUpperCase() + m.slice(1) }))} onChange={(v) => setModel(v as ModelId)} /> : undefined}
      observation={<p className="m-0">{MODEL_TEXT[model]}</p>}
      explanation={<p className="m-0">{MODEL_EVIDENCE[model]} A real nucleus is about 10⁵ times smaller than its atom.</p>}
      explanationTitle="What evidence it explained"
      finding={{ label: `Model of ${year}`, value: MODEL_TEXT[model] }}
    />
  );
};

// ---------- Atom builder ----------

const Counter: React.FC<{ id: string; label: string; value: number; set: (n: number) => void; max: number; colour: string }> = ({ id, label, value, set, max, colour }) => (
  <div className="flex items-center justify-between gap-2" data-counter={id}>
    <span className="text-sm text-slate-200"><span className="inline-block w-3 h-3 rounded-full mr-2 align-middle" style={{ background: colour }} />{label}</span>
    <span className="flex items-center gap-2">
      <button type="button" aria-label={`Remove one ${label.toLowerCase().replace(/s$/, '')}`} data-dec={id} disabled={value <= 0} onClick={() => set(value - 1)} className="lab-btn text-lg">−</button>
      <strong className="w-8 text-center font-mono text-white" data-count={id} aria-live="polite">{value}</strong>
      <button type="button" aria-label={`Add one ${label.toLowerCase().replace(/s$/, '')}`} data-inc={id} disabled={value >= max} onClick={() => set(value + 1)} className="lab-btn text-lg">+</button>
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
  const showVal = (q.showValency || q.editable) && e > 0 && s.charge === 0;
  const scene = (
    <>
      <svg viewBox="0 0 320 220" role="img" aria-label={`${name}: ${p} protons and ${n} neutrons in the nucleus, ${e} electrons in shells ${configText(s.shells) || 'none'}.`}>
        {s.shells.map((_, i) => <g key={i}><circle cx="130" cy="110" r={34 + i * 22} fill="none" stroke="#475569" /><text x={130 + (34 + i * 22) * 0.7 + 3} y={110 - (34 + i * 22) * 0.7} fontSize="13" fill={MUTED}>{SHELL_NAMES[i]}</text></g>)}
        {nucleons(p, n).slice(0, 50).map((fill, i) => { const a = i * 2.4, r = 3 + Math.sqrt(i) * 2.8; return <circle key={i} cx={130 + r * Math.cos(a)} cy={110 + r * Math.sin(a)} r="3.4" fill={fill} />; })}
        {s.shells.flatMap((count, i) => Array.from({ length: count }, (_, k) => { const r = 34 + i * 22, a = (2 * Math.PI * k) / count - Math.PI / 2; return <circle key={`${i}-${k}`} cx={130 + r * Math.cos(a)} cy={110 + r * Math.sin(a)} r="4" fill={E} />; }))}
        <text x="232" y="40" fontSize="13" fill={TXT}>nucleus:</text>
        <text x="232" y="56" fontSize="13" fill={TXT}>{p} p + {n} n</text>
        <text x="232" y="84" fontSize="13" fill={TXT}>electrons: {e}</text>
        <text x="232" y="112" fontSize="22" fontWeight="700" fill="#fff">{s.element?.symbol ?? '?'}</text>
        <text x="232" y="132" fontSize="13" fill={TXT}>A = {s.massNumber}</text>
        <text x="232" y="148" fontSize="13" fill={TXT}>Z = {p}</text>
        <text x="232" y="172" fontSize="13" fill={s.charge === 0 ? '#6ee7b7' : '#fcd34d'}>{s.charge === 0 ? 'neutral' : `charge ${s.charge > 0 ? '+' : '−'}${Math.abs(s.charge)}`}</text>
      </svg>
      <LabKey items={[{ colour: P, label: 'proton (+1)' }, { colour: N, label: 'neutron (0)' }, { colour: E, label: 'electron (−1)' }]} />
    </>
  );
  return (
    <LabStage testId="atom-builder" alt={alt} data={{ 'data-element': s.element?.symbol ?? '', 'data-mass': s.massNumber, 'data-charge': s.charge, 'data-config': configText(s.shells) }}
      question="What decides which element an atom is, its mass number and its charge?"
      sceneNote="Not to scale · the nucleus is drawn far too large"
      scene={scene}
      controls={q.editable ? <>
        <Counter id="p" label="Protons" value={p} set={setP} max={20} colour={P} />
        <Counter id="n" label="Neutrons" value={n} set={setN} max={30} colour={N} />
        <Counter id="e" label="Electrons" value={e} set={setE} max={20} colour={E} />
      </> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="atom-name">{name}</p>
        <p className="m-0" data-testid="atom-facts">Z = {p}, A = {s.massNumber} ({p} protons + {n} neutrons), {e} electrons: {chargeText}.</p>
        {e > 0 && <p className="m-0">Electronic configuration: <strong className="font-mono">{s.shells.map((c, i) => `${SHELL_NAMES[i]} ${c}`).join(', ')}</strong> ({configText(s.shells)})</p>}
        {showVal && <p className="m-0" data-testid="atom-valency">Valence electrons: {valenceElectrons(s.shells)} · valency {val.value} ({val.way === 'none' ? 'complete outer shell: hardly reacts' : val.way === 'share' ? 'shares four electrons' : `${val.way}s ${val.value} electron${val.value === 1 ? '' : 's'} to reach an octet`}).</p>}
      </>}
      explanation={<p className="m-0">The number of protons (Z) decides the element. Protons plus neutrons give the mass number A. When electrons and protons are equal the atom is neutral; extra electrons make a negative ion, missing ones a positive ion. Shells fill in order: K holds 2, L 8, M 8 for the first twenty elements.</p>}
      finding={{ label: `${p} p, ${n} n, ${e} e`, value: `${s.element?.symbol ?? '?'}: A = ${s.massNumber}, ${chargeText}, ${configText(s.shells) || 'no electrons'}` }}
    />
  );
};

// ---------- Gold foil ----------

const TOTAL = 100000;
const oneIn = (count: number) => (count > 0 ? `about 1 in ${Math.round(TOTAL / count).toLocaleString('en-IN')}` : 'none');

export const GoldFoilVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { model?: ScatterModel; editable?: boolean };
  const [model, setModel] = useState<ScatterModel>(q.model ?? 'rutherford');
  const [layers, setLayers] = useState(1);
  const [prediction, setPrediction] = useState<string | null>(null);
  const c = useMemo(() => scatterCounts(model, TOTAL, layers), [model, layers]);
  const pct = (x: number) => (100 * x) / c.total;
  const fx = 180, fy = 108;
  const rows: { id: string; label: string; count: number; colour: string }[] = [
    { id: 'straight', label: 'Straight through (under 1°)', count: c.straight, colour: '#f472b6' },
    { id: 'small', label: 'Small deflection (1° to 10°)', count: c.small, colour: '#fbbf24' },
    { id: 'large', label: 'Large deflection (10° to 90°)', count: c.large, colour: '#fb923c' },
    { id: 'back', label: 'Bounced back (over 90°)', count: c.back, colour: '#f87171' },
  ];
  const scene = (
    <>
      <svg viewBox="0 0 320 220" role="img" aria-label={`α particles fired at gold foil (${model} model). ${rows.map((r) => `${r.label}: ${r.count} of 100 000`).join('; ')}.`}>
        <defs><marker id="foil-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#f8fafc" /></marker></defs>
        <circle cx={fx} cy={fy} r="100" fill="none" stroke="#334155" strokeDasharray="4 4" />
        <text x="312" y="214" fontSize="12" textAnchor="end" fill={MUTED}>detector screen (all round)</text>
        <rect x="6" y={fy - 12} width="30" height="24" rx="3" fill="#475569" /><text x="6" y={fy - 18} fontSize="12" fill={MUTED}>α source</text>
        <rect x={fx - 2} y={fy - 62} width={3 + layers * 1.5} height="124" fill="#facc15" /><text x={fx - 6} y={fy + 78} fontSize="12" textAnchor="end" fill="#fde68a">gold foil</text>
        {[-36, -18, 0, 18, 36].map((dy) => <line key={dy} x1="36" y1={fy + dy / 3} x2={fx + 98} y2={fy + dy} stroke={rows[0].colour} strokeWidth="1.6" opacity="0.85" markerEnd="url(#foil-head)" />)}
        {c.small > 0 && <><line x1="36" y1={fy - 4} x2={fx} y2={fy - 4} stroke={rows[1].colour} strokeWidth="1.8" /><line x1={fx} y1={fy - 4} x2={fx + 94} y2={fy - 36} stroke={rows[1].colour} strokeWidth="1.8" markerEnd="url(#foil-head)" /></>}
        {c.large > 0 && <><line x1="36" y1={fy - 2} x2={fx} y2={fy - 2} stroke={rows[2].colour} strokeWidth="2" /><line x1={fx} y1={fy - 2} x2={fx + 50} y2={fy - 88} stroke={rows[2].colour} strokeWidth="2" markerEnd="url(#foil-head)" /></>}
        {c.back > 0 && <><line x1="36" y1={fy + 2} x2={fx} y2={fy + 2} stroke={rows[3].colour} strokeWidth="2" /><line x1={fx} y1={fy + 2} x2={fx - 92} y2={fy + 38} stroke={rows[3].colour} strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#foil-head)" /></>}
        {/* one gold atom, magnified */}
        <circle cx="62" cy="44" r="30" fill={model === 'thomson' ? '#fca5a5' : '#0b1220'} opacity={model === 'thomson' ? 0.45 : 1} stroke="#94a3b8" />
        {model === 'rutherford' ? <circle cx="62" cy="44" r="2.5" fill={P} /> : null}
        <text x="98" y="38" fontSize="12" fill={MUTED}>one atom</text><text x="98" y="52" fontSize="12" fill={MUTED}>{model === 'rutherford' ? 'tiny nucleus' : 'charge spread'}</text>
      </svg>
      <LabKey items={rows.filter((r) => r.count > 0).map((r) => ({ colour: r.colour, label: r.id === 'straight' ? 'straight' : r.id === 'small' ? 'small angle' : r.id === 'large' ? 'large angle' : 'back', shape: 'line' as const }))} />
    </>
  );
  return (
    <LabStage testId="gold-foil" alt={alt} data={{ 'data-model': model, 'data-back': c.back, 'data-large': c.large }}
      question="If atoms were like Thomson’s model, would any α particle bounce back from gold foil?"
      sceneNote="Example paths of each kind · counts from the model"
      scene={scene}
      controls={q.editable ? <>
        <LabChoice name="foil-model" label="Atom model" value={model} options={[{ id: 'thomson', label: 'Thomson' }, { id: 'rutherford', label: 'Rutherford' }]} onChange={(v) => { setModel(v as ScatterModel); setPrediction(null); }} />
        <LabPredict name="foil-predict" label="Will any α particles bounce back?" value={prediction} options={[{ id: 'yes', label: 'Yes, a few' }, { id: 'no', label: 'No, none' }]} onChange={setPrediction} />
      </> : undefined}
      more={q.editable ? <LabSlider id="foil-layers" label="Foil thickness (layers of atoms)" value={layers} min={1} max={5} step={1} unit="" onChange={setLayers} /> : undefined}
      observation={<>
        <table className="lab-notebook__table" data-testid="gold-foil-counts">
          <caption className="sr-only">Out of 100 000 α particles</caption>
          <thead><tr><th scope="col">Path</th><th scope="col">Count of 100 000</th><th scope="col">Percent</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} data-row={r.id}><td><span aria-hidden className="inline-block w-3 h-0.5 align-middle mr-1" style={{ background: r.colour }} />{r.label}</td><td className="font-mono">{r.count.toLocaleString('en-IN')}</td><td className="font-mono">{fmtNum(pct(r.count), 3)} %</td></tr>)}</tbody>
        </table>
        <p className="m-0">Bounced back: <strong>{oneIn(c.back)}</strong>. {model === 'thomson' ? 'With the positive charge spread out, nothing is strongly deflected and nothing bounces back.' : 'A tiny, dense, positive nucleus turns back the very few α particles that pass very close to it.'}</p>
        {predictionNote(prediction, c.back > 0 ? 'yes' : 'no', (x) => (x === 'yes' ? 'a few bounce back' : 'none bounce back'))}
      </>}
      explanation={<p className="m-0">Most α particles pass straight through, so the atom is mostly empty space. The few that bounce back must have met something very small, dense and positive: the nucleus. Thomson’s spread-out charge is too weak anywhere to turn an α particle back. The paths drawn are one example of each kind; the table gives the model’s counts for an illustrative 100 000 particles.</p>}
      finding={{ label: `${model === 'thomson' ? 'Thomson' : 'Rutherford'} model, ${layers} layer${layers === 1 ? '' : 's'}`, value: `${c.back} back, ${c.large} large, ${fmtNum(pct(c.straight), 2)} % straight` }}
    />
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
  const [m0, m1] = set.masses;
  const X = (m: number) => 40 + ((m - m0) / (m1 - m0)) * 240;
  const scene = (
    <svg viewBox="0 0 320 150" role="img" aria-label={`${fmtNum(share, 1)} % of mass ${m0} and ${fmtNum(100 - share, 1)} % of mass ${m1}: average ${fmtNum(avg, 3)} u.`}>
      <rect x="10" y="16" width={300 * share / 100} height="30" fill="#38bdf8" />
      <rect x={10 + 300 * share / 100} y="16" width={300 * (100 - share) / 100} height="30" fill="#a78bfa" />
      {share >= 18 && <text x="16" y="36" fontSize="13" fill="#082f49" fontWeight="700">mass {m0}: {fmtNum(share, 1)} %</text>}
      {100 - share >= 18 && <text x="304" y="36" fontSize="13" textAnchor="end" fill="#2e1065" fontWeight="700">mass {m1}: {fmtNum(100 - share, 1)} %</text>}
      <line x1="40" y1="100" x2="280" y2="100" stroke="#64748b" strokeWidth="2" />
      {[m0, m1].map((m) => <g key={m}><line x1={X(m)} y1="92" x2={X(m)} y2="108" stroke="#cbd5e1" strokeWidth="2" /><text x={X(m)} y="126" fontSize="13" textAnchor="middle" fill={TXT}>{m} u</text></g>)}
      <line x1={X(simpleAverage(set.masses))} y1="94" x2={X(simpleAverage(set.masses))} y2="106" stroke={MUTED} strokeDasharray="2 2" />
      <polygon points={`${X(avg) - 7},80 ${X(avg) + 7},80 ${X(avg)},93`} fill="#fbbf24" className="lab-transition" />
      <text x={X(avg)} y="74" fontSize="13" textAnchor="middle" fill="#fde68a" fontWeight="700">{fmtNum(avg, 2)} u</text>
      <text x="160" y="144" fontSize="12" textAnchor="middle" fill={MUTED}>the average sits nearer the more common isotope</text>
    </svg>
  );
  return (
    <LabStage testId="isotope-mix" alt={alt} data={{ 'data-average': fmtNum(avg, 3) }}
      question="Why is chlorine’s atomic mass 35.5 u and not a whole number?"
      sceneNote="Proportions of atoms in a natural sample"
      scene={scene}
      controls={q.editable ? <>
        <LabChoice name="iso-element" label="Element" value={el} options={Object.entries(ISOTOPE_SETS).map(([id, s]) => ({ id, label: s.name }))} onChange={(v) => { setEl(v); setShare(ISOTOPE_SETS[v].percent); }} />
        <LabSlider id="iso-share" label={`Share of mass ${m0}`} value={share} min={0} max={100} step={0.1} unit="%" onChange={setShare} />
      </> : undefined}
      observation={<>
        <p className="m-0">{set.name}{z ? ` (Z = ${z})` : ''}: {fmtNum(share, 1)} % of mass {m0} u and {fmtNum(100 - share, 1)} % of mass {m1} u.</p>
        <p className="m-0">Weighted average = {m0} × {fmtNum(share / 100, 3)} + {m1} × {fmtNum((100 - share) / 100, 3)} = <strong data-testid="isotope-average">{fmtNum(avg, 3)} u</strong></p>
      </>}
      explanation={<p className="m-0">A plain average would be {fmtNum(simpleAverage(set.masses), 1)} u (dotted tick), which ignores how common each isotope is. Isotopes have the same number of protons but different numbers of neutrons, so they have the same chemistry but different masses.</p>}
      finding={{ label: `${set.name}, ${fmtNum(share, 1)} % mass ${m0}`, value: `${fmtNum(avg, 3)} u` }}
    />
  );
};

export const ATOM_VISUALS: VisualRegistry = { atomModel: AtomModelVisual, atomBuilder: AtomBuilderVisual, goldFoil: GoldFoilVisual, isotopeMix: IsotopeMixVisual };
