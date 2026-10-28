/**
 * Figures and laboratory investigations for Chapter 9 (Atomic Foundations of Matter): a reaction on a balance (open and closed),
 * a bond builder, a criss-cross formula builder, a formula mass calculator and the property test bench. Every result comes from
 * `engine/chemistry/foundations/model.ts` (and the shells from `engine/chemistry/atom/model.ts`), and every result is stated in
 * words. Drawings are schematic.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSelect, fmtNum } from '../../education/SubjectLabShell';
import { LabButton, LabKey, LabPredict, LabStage, LabSteps, predictionNote } from '../../education/LabLayout';
import {
  ANIONS, ATOMIC_MASS, CATIONS, SAMPLES, balanceReading, bondBetween, covalentFormula, formulaMassParts, ionById, ionText, ionicFormula, ionicName,
  isMetal, pretty, valencyOfSymbol, type CompoundSample,
} from '../../../engine/chemistry/foundations/model';
import { configuration, elementBySymbol, valenceElectrons } from '../../../engine/chemistry/atom/model';

const TXT = '#e2e8f0', MUTED = '#94a3b8', EA = '#38bdf8', EB = '#fbbf24';
const sup = (n: number) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('');
const chargeText = (q: number) => (q === 0 ? '' : `${Math.abs(q) === 1 ? '' : sup(Math.abs(q))}${q > 0 ? '⁺' : '⁻'}`);

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
  const [prediction, setPrediction] = useState<string | null>(null);
  const r = REACTIONS[rid] ?? REACTIONS['soda-vinegar'];
  const reading = reacted ? balanceReading(r.start, r.gas, closed) : r.start;
  const lost = r.start - reading;
  const gasOut = reacted && !closed && r.gas > 0;
  const balloonBig = reacted && closed && r.gas > 0;
  const text = !reacted
    ? `Before mixing: the balance reads ${fmtNum(reading, 1)} g.`
    : r.gas === 0
      ? `After mixing: a white solid forms and the balance still reads ${fmtNum(reading, 1)} g. No gas is given off, so an open set-up is fair.`
      : closed
        ? `After the reaction in the closed set-up: the ${r.gasName} is trapped and the balance still reads ${fmtNum(reading, 1)} g. Mass is conserved.`
        : `After the reaction in the open flask: ${fmtNum(r.gas, 1)} g of ${r.gasName} escaped, so the balance reads ${fmtNum(reading, 1)} g. The mass went into the air; it was not destroyed.`;
  const scene = (
    <svg viewBox="0 0 320 220" role="img" aria-label={`${r.label}, ${closed ? 'closed with a balloon' : 'open flask'}. ${text}`}>
      {/* system boundary */}
      <rect x="92" y={closed ? 18 : 52} width="136" height={closed ? 150 : 116} rx="8" fill="none" stroke={closed ? '#6ee7b7' : '#fbbf24'} strokeWidth="2" strokeDasharray="6 4" />
      <text x="234" y={closed ? 30 : 64} fontSize="12" fill={closed ? '#6ee7b7' : '#fde68a'}>system</text>
      <text x="234" y={closed ? 44 : 78} fontSize="12" fill={closed ? '#6ee7b7' : '#fde68a'}>boundary</text>
      <text x="234" y={closed ? 58 : 92} fontSize="12" fill={MUTED}>{closed ? '(sealed)' : '(open top)'}</text>
      {/* flask */}
      <path d="M 146 66 L 146 92 L 116 160 L 204 160 L 174 92 L 174 66" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M 124 142 L 196 142 L 204 160 L 116 160 Z" fill={reacted && r.gas === 0 ? '#e2e8f0' : '#7dd3fc'} opacity="0.6" />
      {!reacted && <rect x="150" y="100" width="20" height="32" rx="3" fill="#f8fafc" opacity="0.8" />}
      {!reacted && <text x="8" y="116" fontSize="12" fill={MUTED}>reactants</text>}
      {!reacted && <text x="8" y="130" fontSize="12" fill={MUTED}>kept apart</text>}
      {reacted && r.gas > 0 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={130 + (i * 11) % 60} cy={150 - (i % 3) * 5} r="2" fill="#f8fafc" />)}
      {reacted && r.gas === 0 && <text x="8" y="150" fontSize="12" fill={TXT}>white solid</text>}
      {/* balloon */}
      {closed && <ellipse cx="160" cy={balloonBig ? 36 : 56} rx={balloonBig ? 22 : 9} ry={balloonBig ? 24 : 10} fill="#f472b6" opacity="0.75" className="lab-transition" />}
      {balloonBig && <text x="8" y="40" fontSize="12" fill="#f9a8d4">gas trapped</text>}
      {/* escaping gas */}
      {gasOut && [0, 1, 2].map((i) => <g key={i} className="lab-anim-rise" style={{ animationDelay: `${i * 0.7}s` }}><circle cx={150 + i * 10} cy={50 - i * 4} r="4" fill="none" stroke="#cbd5e1" strokeWidth="1.5" /></g>)}
      {gasOut && <><path d="M 160 60 L 160 14" stroke="#fbbf24" strokeWidth="2.5" markerEnd="url(#mb-head)" /><text x="168" y="16" fontSize="12" fill="#fde68a">{fmtNum(r.gas, 1)} g {r.gasName} leaves</text></>}
      <defs><marker id="mb-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#fbbf24" /></marker></defs>
      {/* balance */}
      <rect x="70" y="168" width="180" height="12" rx="3" fill="#64748b" />
      <rect x="60" y="180" width="200" height="34" rx="6" fill="#334155" />
      <rect x="116" y="186" width="88" height="22" rx="3" fill="#0f172a" />
      <text x="160" y="202" fontSize="15" textAnchor="middle" fill="#34d399" fontFamily="monospace" data-testid="mass-balance-display">{fmtNum(reading, 1)} g</text>
    </svg>
  );
  const changeSetup = (next: () => void) => { next(); setReacted(false); setPrediction(null); };
  return (
    <LabStage testId="mass-balance" alt={alt} data={{ 'data-reading': fmtNum(reading, 1), 'data-closed': String(closed), 'data-reacted': String(reacted) }}
      question="Does the mass on the balance change when the reactants are mixed?"
      sceneNote="Schematic · illustrative balance readings"
      scene={scene}
      actions={p.editable ? <>
        <LabButton primary icon="science" data-action="react" disabled={reacted} onClick={() => setReacted(true)}>Mix the reactants</LabButton>
        <LabButton icon="restart_alt" data-action="unreact" disabled={!reacted} onClick={() => setReacted(false)}>Start again</LabButton>
      </> : undefined}
      controls={p.editable ? <>
        <LabSelect id="mb-reaction" label="Reaction" value={rid} options={Object.entries(REACTIONS).map(([id, x]) => ({ id, label: x.label }))} onChange={(v) => changeSetup(() => setRid(v))} />
        <LabChoice name="mb-system" label="Set-up" value={closed ? 'closed' : 'open'} options={[{ id: 'open', label: 'Open flask' }, { id: 'closed', label: 'Closed (balloon)' }]} onChange={(v) => changeSetup(() => setClosed(v === 'closed'))} />
        {!reacted && <LabPredict name="mb-predict" label="After mixing, the reading will…" value={prediction} options={[{ id: 'same', label: 'Stay the same' }, { id: 'less', label: 'Go down' }, { id: 'more', label: 'Go up' }]} onChange={setPrediction} />}
      </> : undefined}
      observation={<>
        <dl className="lab-readout">
          <div><dt>Before</dt><dd>{fmtNum(r.start, 1)} g</dd></div>
          <div><dt>After</dt><dd>{reacted ? `${fmtNum(reading, 1)} g` : '—'}</dd></div>
          <div><dt>Change</dt><dd>{reacted ? (lost > 0 ? `−${fmtNum(lost, 1)} g` : '0 g') : '—'}</dd></div>
        </dl>
        <p className="m-0" data-testid="mass-balance-text">{text}</p>
        {reacted && predictionNote(prediction, lost > 0 ? 'less' : 'same', (x) => ({ same: 'stays the same', less: 'goes down', more: 'goes up' }[x] ?? x))}
      </>}
      explanation={<p className="m-0">Atoms are not created or destroyed in a reaction; they only rearrange. Everything inside the system boundary is weighed. In an open flask the gas crosses the boundary and leaves, so the reading falls by exactly the mass of gas. Seal the system (the balloon) and nothing leaves, so the reading does not change.</p>}
      finding={reacted ? { label: `${r.label}, ${closed ? 'closed' : 'open'}`, value: `${fmtNum(r.start, 1)} g → ${fmtNum(reading, 1)} g` } : null}
    />
  );
};

// ---------- Bond builder ----------

const BOND_ELEMENTS = ['H', 'C', 'N', 'O', 'F', 'Cl', 'Ne', 'Na', 'Mg', 'Al', 'K', 'Ca'];
const valence = (sym: string) => { const e = elementBySymbol(sym); return e ? valenceElectrons(configuration(e.z)) : 0; };
const countsOf = (formula: string): { symbol: string; count: number }[] => formulaMassParts(formula).map((x) => ({ symbol: x.symbol, count: x.count }));
const BOND_STEPS = ['Outer electrons', 'Transfer or share', 'Result'];
/** Which metal atom gives electrons to which non-metal atom: every atom takes part at least once. */
const transferPairs = (nm: number, nn: number): [number, number][] => {
  const keys = new Set<string>();
  for (let i = 0; i < nm; i++) keys.add(`${i},${i % nn}`);
  for (let k = 0; k < nn; k++) keys.add(`${k % nm},${k}`);
  return [...keys].map((x) => x.split(',').map(Number) as [number, number]);
};

/** An atom drawn with its outer electrons around it. `give` electrons are drawn in the second colour (those that move or are shared). */
const AtomDots: React.FC<{ x: number; y: number; sym: string; dots: number; colour: string; label?: string; r?: number; gained?: number }> = ({ x, y, sym, dots, colour, label, r = 22, gained = 0 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#0f172a" stroke="#475569" />
    <text x={x} y={y + 5} fontSize="15" textAnchor="middle" fill="#fff" fontWeight="700">{sym}</text>
    {Array.from({ length: dots + gained }, (_, k) => { const a = (2 * Math.PI * k) / Math.max(dots + gained, 1) - Math.PI / 2; return <circle key={k} cx={x + (r + 6) * Math.cos(a)} cy={y + (r + 6) * Math.sin(a)} r="3.5" fill={k >= dots ? EA : colour} />; })}
    {label && <text x={x} y={y + r + 22} fontSize="12" textAnchor="middle" fill={TXT}>{label}</text>}
  </g>
);

export const BondBuilderVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { a?: string; b?: string; editable?: boolean };
  const [a, setA] = useState(p.a ?? 'H');
  const [b, setB] = useState(p.b ?? 'H');
  const [step, setStep] = useState(2);
  const r = bondBetween(a, b);
  const order = r.bondOrder ?? 1;
  const parts = r.formula ? countsOf(r.formula) : [];
  const diatomic = a === b;
  let scene: React.ReactNode;
  let stepText = '';
  if (r.kind === 'ionic') {
    const metal = parts.find((x) => isMetal(x.symbol))!, non = parts.find((x) => !isMetal(x.symbol))!;
    const vm = valencyOfSymbol(metal.symbol), vn = valencyOfSymbol(non.symbol);
    const ys = (n: number) => Array.from({ length: n }, (_, i) => 110 + (i - (n - 1) / 2) * 62);
    scene = (
      <svg viewBox="0 0 320 220" role="img" aria-label={`${metal.count} ${metal.symbol} and ${non.count} ${non.symbol}: ${step === 0 ? 'outer electrons' : step === 1 ? 'electrons move from the metal to the non-metal' : 'ions with opposite charges'}.`}>
        <defs><marker id="bb-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={EA} /></marker></defs>
        {ys(metal.count).map((y, i) => <AtomDots key={`m${i}`} x={70} y={y} sym={step === 2 ? `${metal.symbol}${chargeText(vm)}` : metal.symbol} dots={step === 2 ? 0 : valence(metal.symbol)} colour={EA} />)}
        {ys(non.count).map((y, i) => <AtomDots key={`n${i}`} x={250} y={y} sym={step === 2 ? `${non.symbol}${chargeText(-vn)}` : non.symbol} dots={valence(non.symbol)} gained={step === 2 ? vn : 0} colour={EB} />)}
        {step === 1 && transferPairs(metal.count, non.count).map(([i, k]) => { const y1 = ys(metal.count)[i], y2 = ys(non.count)[k]; return <path key={`${i}-${k}`} d={`M 100 ${y1} C 160 ${y1 - 30} 160 ${y2 - 30} 218 ${y2}`} fill="none" stroke={EA} strokeWidth="2" markerEnd="url(#bb-head)" className="lab-anim-flow" />; })}
        {step === 1 && <text x="160" y="22" fontSize="13" textAnchor="middle" fill={EA}>{metal.symbol} gives {vm} electron{vm === 1 ? '' : 's'} each</text>}
        {step === 2 && <text x="160" y="22" fontSize="13" textAnchor="middle" fill={TXT}>{metal.count} × ({chargeText(vm) ? `+${vm}` : ''}) + {non.count} × (−{vn}) = 0</text>}
      </svg>
    );
    stepText = step === 0 ? `${metal.symbol} has ${valence(metal.symbol)} outer electron${valence(metal.symbol) === 1 ? '' : 's'}; ${non.symbol} has ${valence(non.symbol)} and needs ${vn} more.`
      : step === 1 ? `Each ${metal.symbol} atom gives ${vm} electron${vm === 1 ? '' : 's'} to ${non.symbol}: electron transfer.`
        : `Charge balance: ${metal.count} × (+${vm}) + ${non.count} × (−${vn}) = 0, so the formula is ${pretty(r.formula)}.`;
  } else if (r.kind === 'covalent' && !(diatomic || parts.some((x) => x.count === 1))) {
    scene = (
      <svg viewBox="0 0 320 220" role="img" aria-label={`${pretty(r.formula)}: the atoms share electrons.`}>
        <AtomDots x={100} y={110} sym={parts[0].symbol} dots={valence(parts[0].symbol)} colour={EA} /><AtomDots x={220} y={110} sym={parts[1].symbol} dots={valence(parts[1].symbol)} colour={EB} />
        <text x="160" y="200" fontSize="13" textAnchor="middle" fill={TXT}>{pretty(r.formula)}: shared pairs (structure not drawn)</text>
      </svg>
    );
    stepText = `${pretty(r.formula)}: the atoms share electrons. This simple drawing only shows molecules with one central atom.`;
  } else if (r.kind === 'covalent') {
    const centre = diatomic ? { symbol: a, count: 1 } : parts.find((x) => x.count === 1) ?? parts[0];
    const outer = diatomic ? { symbol: a, count: 1 } : parts.find((x) => x !== centre) ?? parts[0];
    const pairs = diatomic ? order : valencyOfSymbol(outer.symbol);
    const n = outer.count;
    const pos = (i: number) => { if (n === 1) return { x: step === 0 ? 250 : 222, y: 110 }; const ang = (2 * Math.PI * i) / n + (n === 2 ? 0 : -Math.PI / 2); const d = step === 0 ? 92 : 64; return { x: 140 + d * Math.cos(ang), y: 110 + d * Math.sin(ang) * 0.95 }; };
    const cx = n === 1 ? (step === 0 ? 70 : 98) : 140;
    scene = (
      <svg viewBox="0 0 320 220" role="img" aria-label={`${pretty(r.formula)}: ${step === 0 ? 'outer electrons of each atom' : `${pairs} shared pair${pairs === 1 ? '' : 's'} between each pair of bonded atoms`}.`}>
        <AtomDots x={cx} y={110} sym={centre.symbol} dots={step === 0 ? valence(centre.symbol) : 0} colour={EA} />
        {Array.from({ length: n }, (_, i) => { const q = pos(i); return (
          <g key={i}>
            {step > 0 && <line x1={cx} y1={110} x2={q.x} y2={q.y} stroke="#334155" strokeWidth="2" />}
            {step > 0 && Array.from({ length: pairs }, (_, k) => { const t = 0.5, mx = cx + (q.x - cx) * t, my = 110 + (q.y - 110) * t; const nx = -(q.y - 110), ny = q.x - cx; const len = Math.hypot(nx, ny) || 1; const off = (k - (pairs - 1) / 2) * 11; return <g key={k}><circle cx={mx + (nx / len) * off - 4} cy={my + (ny / len) * off} r="3.6" fill={EA} /><circle cx={mx + (nx / len) * off + 4} cy={my + (ny / len) * off} r="3.6" fill={EB} /></g>; })}
            <AtomDots x={q.x} y={q.y} sym={outer.symbol} dots={step === 0 ? valence(outer.symbol) : 0} colour={EB} r={18} />
          </g>
        ); })}
        <text x="160" y="22" fontSize="13" textAnchor="middle" fill={TXT}>{step === 0 ? 'outer electrons' : step === 1 ? `${pairs} shared pair${pairs === 1 ? '' : 's'} per bond` : `${pretty(r.formula)}: every atom has a full outer shell`}</text>
      </svg>
    );
    stepText = step === 0 ? `${centre.symbol} has ${valence(centre.symbol)} outer electrons; ${outer.symbol} has ${valence(outer.symbol)}.`
      : step === 1 ? `Each bond is ${pairs} shared pair${pairs === 1 ? '' : 's'} of electrons: one electron of each pair from each atom.`
        : `${pretty(r.formula)}: no electrons are transferred and no ions form; the shared pairs hold the atoms together.`;
  } else {
    scene = (
      <svg viewBox="0 0 320 220" role="img" aria-label={`${a} and ${b}: no compound forms.`}>
        <AtomDots x={90} y={110} sym={a} dots={valence(a)} colour={EA} /><AtomDots x={230} y={110} sym={b} dots={valence(b)} colour={EB} />
        <text x="160" y="200" fontSize="13" textAnchor="middle" fill={TXT}>no transfer, no sharing</text>
      </svg>
    );
    stepText = r.detail;
  }
  return (
    <LabStage testId="bond-builder" alt={alt} data={{ 'data-kind': r.kind, 'data-formula': r.formula, 'data-step': step }}
      question="Do these atoms transfer electrons or share them, and what formula results?"
      sceneNote="Outer electrons only · not to scale"
      scene={<>{scene}<LabKey items={[{ colour: EA, label: `electron from ${r.kind === 'ionic' ? 'the metal' : 'the first atom'}` }, { colour: EB, label: 'electron from the other atom' }]} /></>}
      actions={r.kind !== 'none' ? <LabSteps step={step} count={3} onStep={setStep} labels={BOND_STEPS} /> : undefined}
      controls={p.editable ? <div className="grid grid-cols-2 gap-2">
        <LabSelect id="bond-a" label="Atom 1" value={a} options={BOND_ELEMENTS.map((e) => ({ id: e, label: e }))} onChange={(v) => { setA(v); setStep(0); }} />
        <LabSelect id="bond-b" label="Atom 2" value={b} options={BOND_ELEMENTS.map((e) => ({ id: e, label: e }))} onChange={(v) => { setB(v); setStep(0); }} />
      </div> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="bond-result">{r.kind === 'none' ? 'No compound forms' : `${r.kind === 'ionic' ? 'Ionic' : 'Covalent'}: ${pretty(r.formula)}`}</p>
        <p className="m-0" data-testid="bond-step-text">{stepText}</p>
      </>}
      explanation={<><p className="m-0">{r.detail}</p><p className="m-0 text-slate-400">Valencies from Chapter 8: {a} {valencyOfSymbol(a)}, {b} {valencyOfSymbol(b)}. Formulae follow the valency method; a few real compounds differ (carbon and oxygen also form CO).</p></>}
      finding={{ label: `${a} + ${b}`, value: r.kind === 'none' ? 'no compound' : `${r.kind}, ${pretty(r.formula)}` }}
    />
  );
};

// ---------- Criss-cross formula builder ----------

const CROSS_STEPS = ['Ions and charges', 'Cross over', 'Simplest ratio', 'Check the charges'];

export const FormulaBuilderVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { mode?: 'ionic' | 'covalent'; cation?: string; anion?: string; a?: string; b?: string; editable?: boolean };
  const [cat, setCat] = useState(p.cation ?? 'ca');
  const [an, setAn] = useState(p.anion ?? 'cl');
  const [step, setStep] = useState(p.editable ? 0 : 3);
  const covalent = p.mode === 'covalent';
  const c = covalent ? covalentFormula(p.a ?? 'C', valencyOfSymbol(p.a ?? 'C'), p.b ?? 'Cl', valencyOfSymbol(p.b ?? 'Cl')) : ionicFormula(ionById(cat), ionById(an));
  const reduced = c.raw[0] !== c.reduced[0];
  const reducedNote = reduced ? ` Divide ${c.raw[0]} and ${c.raw[1]} by ${c.raw[0] / c.reduced[0]} to get the simplest ratio.` : '';
  const name = covalent ? '' : ionicName(ionById(cat), ionById(an));
  const qa = covalent ? 0 : ionById(cat).charge, qb = covalent ? 0 : ionById(an).charge;
  const leftTop = covalent ? `${pretty(c.left)}` : ionText(ionById(cat));
  const rightTop = covalent ? `${pretty(c.right)}` : ionText(ionById(an));
  const nums = step >= 2 ? c.reduced : c.raw;
  const scene = (
    <svg viewBox="0 0 320 200" role="img" aria-label={`${leftTop} and ${rightTop}: ${CROSS_STEPS[step]}. Formula ${pretty(c.formula)}.`}>
      <defs><marker id="fb-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill={EB} /></marker></defs>
      <text x="90" y="56" fontSize="26" textAnchor="middle" fill="#fff" fontWeight="700">{pretty(c.left)}</text>
      <text x="230" y="56" fontSize="26" textAnchor="middle" fill="#fff" fontWeight="700">{pretty(c.right)}</text>
      <text x="90" y="82" fontSize="14" textAnchor="middle" fill={EB}>{covalent ? `valency ${c.leftNumber}` : `charge ${qa > 0 ? '+' : ''}${qa}`}</text>
      <text x="230" y="82" fontSize="14" textAnchor="middle" fill={EB}>{covalent ? `valency ${c.rightNumber}` : `charge ${qb}`}</text>
      {step >= 1 && <><path d="M 104 88 L 214 150" stroke={EB} strokeWidth="2" markerEnd="url(#fb-head)" /><path d="M 216 88 L 106 150" stroke={EB} strokeWidth="2" markerEnd="url(#fb-head)" /></>}
      {step >= 1 && <><text x="90" y="176" fontSize="18" textAnchor="middle" fill="#fff">× {nums[0]}</text><text x="230" y="176" fontSize="18" textAnchor="middle" fill="#fff">× {nums[1]}</text></>}
      {step >= 2 && reduced && <text x="160" y="124" fontSize="13" textAnchor="middle" fill={MUTED}>÷ {c.raw[0] / c.reduced[0]}</text>}
      {step >= 3 && <text x="160" y="198" fontSize="15" textAnchor="middle" fill="#6ee7b7" fontWeight="700">{pretty(c.formula)}</text>}
    </svg>
  );
  return (
    <LabStage testId="formula-builder" alt={alt} data={{ 'data-formula': c.formula, 'data-step': step }}
      question="How many of each ion make a neutral compound?"
      scene={scene}
      actions={<LabSteps step={step} count={4} onStep={setStep} labels={CROSS_STEPS} />}
      controls={p.editable && !covalent ? <div className="grid grid-cols-2 gap-2">
        <LabSelect id="fb-cation" label="Cation" value={cat} options={CATIONS.map((x) => ({ id: x.id, label: `${x.name} ${ionText(x)}` }))} onChange={(v) => { setCat(v); setStep(0); }} />
        <LabSelect id="fb-anion" label="Anion" value={an} options={ANIONS.map((x) => ({ id: x.id, label: `${x.name} ${ionText(x)}` }))} onChange={(v) => { setAn(v); setStep(0); }} />
      </div> : undefined}
      observation={<>
        <p className="m-0">{covalent ? 'Valencies' : 'Charge numbers'} crossed over: {pretty(c.left)} takes {c.raw[0]}, {pretty(c.right)} takes {c.raw[1]}.{reducedNote}</p>
        <p className="m-0 text-lg font-bold">Formula: <span data-testid="formula-result">{pretty(c.formula)}</span>{name && <span className="text-sm font-normal text-slate-300"> ({name})</span>}</p>
        {!covalent && <p className="m-0" data-testid="formula-charge-check">Check: {c.reduced[0]} × ({qa > 0 ? '+' : ''}{qa}) + {c.reduced[1]} × ({qb}) = {c.reduced[0] * qa + c.reduced[1] * qb}. Ions: {ionText(ionById(cat))} and {ionText(ionById(an))}.</p>}
      </>}
      explanation={<p className="m-0">A compound has no overall charge. Crossing each ion’s charge number over to become the other’s subscript makes the positive and negative charges equal; dividing by any common factor gives the simplest whole-number ratio. Brackets keep a polyatomic ion together when there is more than one of it.</p>}
      finding={{ label: covalent ? `${c.left} and ${c.right}` : `${ionText(ionById(cat))} + ${ionText(ionById(an))}`, value: pretty(c.formula) }}
    />
  );
};

// ---------- Formula mass calculator ----------

const ELEMENT_COLOURS = ['#38bdf8', '#f472b6', '#fbbf24', '#34d399', '#a78bfa', '#fb923c'];

export const FormulaMassVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { formula?: string; editable?: boolean };
  const [text, setText] = useState(p.formula ?? 'CO2');
  let parts: ReturnType<typeof formulaMassParts> | null = null, error = '';
  try { parts = formulaMassParts(text.trim()); } catch (e) { error = (e as Error).message; }
  const total = parts ? parts.reduce((s, x) => s + x.subtotal, 0) : 0;
  const starts = parts ? parts.map((_, i) => 10 + parts!.slice(0, i).reduce((n, x) => n + (300 * x.subtotal) / total, 0)) : [];
  const scene = parts ? (
    <svg viewBox="0 0 320 120" role="img" aria-label={`${pretty(text.trim())}: ${parts.map((x) => `${x.symbol} ${fmtNum(x.subtotal, 2)} u`).join(', ')}; total ${fmtNum(total, 2)} u.`}>
      <text x="10" y="20" fontSize="13" fill={TXT}>Share of the mass of {pretty(text.trim())} ({fmtNum(total, 2)} u)</text>
      {parts.map((x, i) => { const w = (300 * x.subtotal) / total; const x0 = starts[i]; return <g key={x.symbol}><rect x={x0} y="32" width={w} height="40" fill={ELEMENT_COLOURS[i % ELEMENT_COLOURS.length]} stroke="#0f172a" />{w > 34 && <text x={x0 + w / 2} y="57" fontSize="14" textAnchor="middle" fill="#0f172a" fontWeight="700">{x.symbol}</text>}<text x={x0 + w / 2} y={i % 2 ? 108 : 90} fontSize="12" textAnchor="middle" fill={TXT}>{w > 20 || i % 2 ? `${x.count}×${x.atomicMass}` : ''}</text></g>; })}
    </svg>
  ) : <svg viewBox="0 0 320 60" role="img" aria-label="No formula yet"><text x="160" y="34" fontSize="13" textAnchor="middle" fill={MUTED}>Type a formula to see its mass</text></svg>;
  return (
    <LabStage testId="formula-mass" alt={alt} data={{ 'data-mass': parts ? fmtNum(total, 2) : '' }}
      question="What is the mass of one molecule or formula unit, in atomic mass units?"
      scene={scene}
      controls={p.editable ? <label htmlFor="fm-input" className="block text-sm text-slate-200">Formula
        <input id="fm-input" value={text} onChange={(e) => setText(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 font-mono text-base text-on-surface" />
      </label> : undefined}
      observation={parts ? <>
        <ul className="m-0 pl-4 list-disc space-y-0.5">{parts.map((x) => <li key={x.symbol}>{x.symbol}: {x.count} × {x.atomicMass} u = {fmtNum(x.subtotal, 2)} u</li>)}</ul>
        <p className="m-0 text-lg font-bold">Mass of {pretty(text.trim())} = <span data-testid="formula-mass-result">{fmtNum(total, 2)} u</span></p>
      </> : <p className="m-0 text-amber-300" role="alert">That formula could not be read ({error}). Use symbols, numbers and brackets, for example Ca(NO3)2.</p>}
      explanation={<p className="m-0">Add the atomic masses of all the atoms in the formula; a number after a bracket multiplies everything inside it. Atomic masses used: {Object.entries(ATOMIC_MASS).slice(0, 12).map(([s, m]) => `${s} ${m}`).join(', ')} u, and more.</p>}
      finding={parts ? { label: pretty(text.trim()), value: `${fmtNum(total, 2)} u` } : null}
    />
  );
};

// ---------- Property test bench ----------

type Setup = 'solid' | 'water' | 'kerosene';
const SETUP_LABEL: Record<Setup, string> = { solid: 'Dry solid', water: 'In water', kerosene: 'In kerosene' };
interface TestResult { dissolves?: boolean; conducts?: boolean }
const conductsIn = (s: CompoundSample, setup: Setup): boolean | undefined => (setup === 'solid' ? s.conductsSolid : setup === 'water' ? s.dissolvesInWater && s.conductsInWater : undefined);
const dissolvesIn = (s: CompoundSample, setup: Setup): boolean | undefined => (setup === 'water' ? s.dissolvesInWater : setup === 'kerosene' ? s.dissolvesInKerosene : undefined);

export const PropertiesTestVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { editable?: boolean };
  const [sid, setSid] = useState(SAMPLES[0].id);
  const [setup, setSetup] = useState<Setup>('water');
  const [tested, setTested] = useState<Record<string, Partial<Record<Setup, TestResult>>>>({});
  const [prediction, setPrediction] = useState<string | null>(null);
  const s = SAMPLES.find((x) => x.id === sid) ?? SAMPLES[0];
  const done = tested[sid]?.[setup];
  const all = !p.editable;
  const dissolves = dissolvesIn(s, setup);
  const conducts = conductsIn(s, setup);
  const circuit = setup !== 'kerosene';
  const glow = Boolean(done && circuit && conducts);
  const run = () => setTested((t) => ({ ...t, [sid]: { ...t[sid], [setup]: { dissolves, conducts } } }));
  const liquid = setup === 'water' ? '#38bdf8' : setup === 'kerosene' ? '#fde68a' : null;
  const sampleColour = s.id === 'cuso4' ? '#3b82f6' : '#f8fafc';
  const scene = (
    <svg viewBox="0 0 320 220" role="img" aria-label={`${s.name}, ${SETUP_LABEL[setup].toLowerCase()}. ${done ? `${dissolves === undefined ? '' : dissolves ? 'It dissolves. ' : 'It does not dissolve. '}${circuit ? (glow ? 'The bulb glows.' : 'The bulb stays dark.') : ''}` : 'Not tested yet.'}`}>
      {/* container */}
      {setup === 'solid'
        ? <path d="M 110 168 Q 170 206 230 168 Z" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        : <path d="M 110 96 L 110 196 L 230 196 L 230 96" fill="none" stroke="#cbd5e1" strokeWidth="2" />}
      {liquid && <rect x="112" y="122" width="116" height="72" fill={done && dissolves && s.id === 'cuso4' ? '#3b82f6' : liquid} opacity={done && dissolves && s.id === 'cuso4' ? 0.55 : 0.28} className="lab-transition" />}
      {(!done || setup === 'solid' || !dissolves) && Array.from({ length: 14 }, (_, i) => <rect key={i} x={128 + (i * 13) % 84} y={(setup === 'solid' ? 172 : 186) - (i % 3) * 4} width="6" height="6" fill={sampleColour} stroke="#64748b" strokeWidth="0.5" transform={`rotate(${i * 25} ${131 + (i * 13) % 84} ${(setup === 'solid' ? 175 : 189) - (i % 3) * 4})`} />)}
      <text x="240" y="186" fontSize="12" fill={TXT}>{setup === 'solid' ? 'dry solid' : done ? (dissolves ? 'dissolved' : 'not dissolved') : SETUP_LABEL[setup].toLowerCase()}</text>
      {/* circuit */}
      {circuit ? <g>
        <rect x="146" y="70" width="4" height={setup === 'solid' ? 104 : 116} fill="#94a3b8" /><rect x="190" y="70" width="4" height={setup === 'solid' ? 104 : 116} fill="#94a3b8" />
        <text x="198" y="112" fontSize="12" fill={MUTED}>electrodes</text>
        <path d="M 148 70 L 148 34 L 90 34" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M 192 70 L 192 34 L 250 34 L 250 52" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="40" y="26" width="50" height="18" rx="3" fill="#475569" /><text x="65" y="20" fontSize="12" textAnchor="middle" fill={MUTED}>battery</text>
        <path d="M 250 80 L 250 90 L 306 90 L 306 10 L 22 10 L 22 35 L 40 35" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        {glow && <circle cx="250" cy="66" r="24" fill="#fde047" opacity="0.35" />}
        <circle cx="250" cy="66" r="13" fill={glow ? '#fde047' : '#1f2937'} stroke="#cbd5e1" strokeWidth="2" />
        <path d="M 245 70 l 3 -7 l 4 7" fill="none" stroke={glow ? '#a16207' : '#64748b'} />
        <text x="270" y="70" fontSize="12" fill={glow ? '#fde047' : MUTED}>{done ? (glow ? 'glows' : 'dark') : 'bulb'}</text>
      </g> : <text x="170" y="60" fontSize="12" textAnchor="middle" fill={MUTED}>(solubility test only)</text>}
    </svg>
  );
  const resultFor = (x: CompoundSample, st: Setup): string => {
    const r = all ? { dissolves: dissolvesIn(x, st), conducts: conductsIn(x, st) } : tested[x.id]?.[st];
    if (!r) return '?';
    if (st === 'solid') return r.conducts ? 'conducts' : 'does not conduct';
    if (st === 'kerosene') return r.dissolves ? 'dissolves' : 'does not dissolve';
    return `${r.dissolves ? 'dissolves' : 'does not dissolve'}${r.dissolves ? `; ${r.conducts ? 'bulb glows' : 'bulb dark'}` : ''}`;
  };
  return (
    <LabStage testId="properties-test" alt={alt} data={{ 'data-sample': sid, 'data-setup': setup, 'data-tested': String(Boolean(done)), 'data-glow': String(glow) }}
      question="Which compounds dissolve in water or kerosene, and which conduct electricity?"
      sceneNote="Schematic circuit · results as described in the chapter"
      scene={scene}
      actions={p.editable ? <LabButton primary icon={circuit ? 'bolt' : 'science'} data-action="run-test" disabled={Boolean(done)} onClick={run}>{done ? 'Tested' : circuit ? 'Add and switch on' : 'Add and stir'}</LabButton> : undefined}
      controls={p.editable ? <>
        <LabSelect id="pt-sample" label="Compound" value={sid} options={SAMPLES.map((x) => ({ id: x.id, label: x.name }))} onChange={(v) => { setSid(v); setPrediction(null); }} />
        <LabChoice name="pt-setup" label="Test" value={setup} options={(['solid', 'water', 'kerosene'] as Setup[]).map((x) => ({ id: x, label: SETUP_LABEL[x] }))} onChange={(v) => { setSetup(v as Setup); setPrediction(null); }} />
        {!done && circuit && <LabPredict name="pt-predict" label="Will the bulb glow?" value={prediction} options={[{ id: 'yes', label: 'Glows' }, { id: 'no', label: 'Stays dark' }]} onChange={setPrediction} />}
      </> : undefined}
      observation={<>
        <p className="m-0" data-testid="properties-result">{done || all ? `${s.name}, ${SETUP_LABEL[setup].toLowerCase()}: ${resultFor(s, setup)}.` : `${s.name}: choose a test and run it.`}</p>
        {done && circuit && predictionNote(prediction, glow ? 'yes' : 'no', (x) => (x === 'yes' ? 'glows' : 'stays dark'))}
        <table className="lab-notebook__table" aria-label="Test results">
          <thead><tr><th scope="col">Compound</th>{(['water', 'kerosene', 'solid'] as Setup[]).map((x) => <th key={x} scope="col">{SETUP_LABEL[x]}</th>)}</tr></thead>
          <tbody>{SAMPLES.map((x) => <tr key={x.id} data-sample={x.id} data-tested={String(all || Boolean(tested[x.id]))} className={x.id === sid ? 'text-white font-semibold' : ''}><td>{x.name}</td>{(['water', 'kerosene', 'solid'] as Setup[]).map((st) => <td key={st}>{resultFor(x, st)}</td>)}</tr>)}</tbody>
        </table>
      </>}
      explanation={<p className="m-0">Ionic compounds (sodium chloride, copper sulfate) dissolve in water and their solutions conduct, because the ions are free to move. As dry solids they do not conduct: the ions are locked in place. Covalent compounds have no ions, so they do not conduct; many dissolve in kerosene rather than water. Safety: use a low-voltage battery; kerosene and petrol catch fire easily.</p>}
      finding={done ? { label: `${s.name}, ${SETUP_LABEL[setup].toLowerCase()}`, value: resultFor(s, setup) } : null}
    />
  );
};

export const FOUND_VISUALS: VisualRegistry = { massBalance: MassBalanceVisual, bondBuilder: BondBuilderVisual, formulaBuilder: FormulaBuilderVisual, formulaMass: FormulaMassVisual, propertiesTest: PropertiesTestVisual };
