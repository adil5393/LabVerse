/**
 * Figures and laboratory investigations for Chapter 5 (Mixtures). Every number and verdict comes from
 * `engine/chemistry/mixtures/model.ts`; the drawings only illustrate it. Each investigation uses the shared laboratory layout
 * (question, scene, controls, observation, explanation, record), works with touch and keyboard, and states its result in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSelect, LabSlider, fmtNum } from '../../education/SubjectLabShell';
import { LabButton, LabKey, LabPredict, LabStage, predictionNote, prefersReducedMotion, useTicker } from '../../education/LabLayout';
import { MixtureScene, SeparationScene, separationRoles } from './SeparationScene';
import {
  BLACK_INK, BOILING_POINTS, METHOD_LABEL, MIXTURE_CASES, SALTS, SAMPLE_MIXTURES, SOLUBILITY_TEMPS, caseById, chooseMethod, crystalYield, describeBeam, twoLiquidCase,
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

/** Particle view: a magnified circle with particles drawn by size band (solution tiny, colloid medium, suspension large). */
const ParticleView: React.FC<{ type: MixtureType; cx: number; cy: number; r: number }> = ({ type, cx, cy, r }) => {
  const size = type === 'solution' ? 1.4 : type === 'colloid' ? 3.2 : 7;
  const count = type === 'solution' ? 40 : type === 'colloid' ? 18 : 6;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0b1220" stroke="#94a3b8" strokeWidth="1.5" />
      {Array.from({ length: count }, (_, i) => {
        const a = i * 2.39996, d = Math.sqrt((i + 0.5) / count) * (r - size - 3);
        return <circle key={i} cx={cx + d * Math.cos(a)} cy={cy + d * Math.sin(a)} r={size} fill={type === 'solution' ? '#7dd3fc' : '#f8fafc'} opacity="0.9" />;
      })}
      {type === 'solution' && Array.from({ length: 22 }, (_, i) => { const a = i * 1.7, d = ((i * 37) % 100) / 100 * (r - 6); return <circle key={`w${i}`} cx={cx + d * Math.cos(a)} cy={cy + d * Math.sin(a)} r="1" fill="#38bdf8" opacity="0.6" />; })}
    </g>
  );
};

export const MixBeamVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { sampleId?: string; beam?: boolean; settle?: boolean; editable?: boolean; table?: boolean };
  const [id, setId] = useState(p.sampleId ?? 'salt-water');
  const [beam, setBeam] = useState(Boolean(p.beam));
  const [settled, setSettled] = useState(Boolean(p.settle));
  const [filtered, setFiltered] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  if (p.table) return <div className="p-3" aria-label={alt}><PropertiesTable /></div>;
  const m = sampleById(id);
  const pr = propertiesOf(m.type);
  const cloud = m.type === 'solution' ? 0.18 : m.type === 'colloid' ? 0.38 : 0.5;
  const showSettled = settled && pr.settles;
  const susp = m.type === 'suspension';
  const dots = Array.from({ length: susp ? 34 : 0 }, (_, i) => ({ x: 28 + ((i * 37) % 100), y: showSettled ? 176 - ((i * 7) % 10) : 82 + ((i * 53) % 90) }));
  const residue = filtered && pr.filterable;
  const scene = (
    <svg viewBox="0 0 320 220" role="img" aria-label={`${m.name}. ${beam ? (pr.tyndall ? 'The beam’s path is visible.' : 'No visible beam path.') : 'Beam off.'} ${settled ? (pr.settles ? 'Particles have settled.' : 'Nothing has settled.') : ''} ${filtered ? (pr.filterable ? 'Residue on the filter paper.' : 'No residue on the filter paper.') : ''}`}>
      {/* torch and beaker */}
      <rect x="0" y="118" width="14" height="18" rx="3" fill="#475569" /><text x="0" y="152" fontSize="11" fill="#94a3b8">torch</text>
      <rect x="20" y="60" width="116" height="128" rx="6" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <rect x="22" y="76" width="112" height="110" fill={m.type === 'solution' ? '#38bdf8' : '#e2e8f0'} opacity={showSettled ? 0.12 : cloud} className="lab-transition" />
      {showSettled && <rect x="22" y="170" width="112" height="16" fill="#d6b370" opacity="0.9" />}
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="2.4" fill="#f8fafc" className="lab-transition" />)}
      {beam && <line x1="14" y1="127" x2="148" y2="127" stroke="#ef4444" strokeWidth="1.5" opacity="0.7" />}
      {beam && pr.tyndall && <line x1="22" y1="127" x2="134" y2="127" stroke="#fca5a5" strokeWidth="9" opacity="0.6" />}
      <text x="78" y="50" fontSize="13" textAnchor="middle" fill="#e2e8f0">{TYPE_LABEL[m.type]}</text>
      {showSettled && <text x="78" y="206" fontSize="12" textAnchor="middle" fill="#fde68a">settled layer</text>}
      {beam && <text x="78" y={showSettled ? 160 : 150} fontSize="12" textAnchor="middle" fill="#fca5a5">{pr.tyndall ? 'beam path visible' : 'no beam path'}</text>}
      {/* particle view */}
      <ParticleView type={m.type} cx={232} cy={62} r={44} />
      <text x="232" y="122" fontSize="12" textAnchor="middle" fill="#94a3b8">particle view (not to scale)</text>
      <text x="232" y="136" fontSize="12" textAnchor="middle" fill="#e2e8f0">about {fmtNm(m.diameterNm)}</text>
      {/* filter */}
      {filtered ? <g>
        <path d="M 196 148 L 268 148 L 238 186 L 238 196 L 226 196 L 226 186 Z" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M 202 151 L 262 151 L 232 182 Z" fill="#f8fafc" opacity="0.2" />
        {residue && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={222 + (i * 7) % 20} cy={170 + (i % 3) * 3} r="2.4" fill="#d6b370" />)}
        <rect x="216" y="200" width="32" height="18" fill={m.type === 'solution' ? '#38bdf8' : '#e2e8f0'} opacity={pr.filterable ? 0.18 : cloud} stroke="#94a3b8" />
        <text x="276" y="172" fontSize="12" fill="#e2e8f0">{residue ? 'residue' : 'no residue'}</text>
        <text x="256" y="214" fontSize="12" fill="#e2e8f0">filtrate</text>
      </g> : <text x="232" y="182" fontSize="12" textAnchor="middle" fill="#64748b">(not filtered yet)</text>}
    </svg>
  );
  const resetSteps = () => { setSettled(false); setFiltered(false); setPrediction(null); };
  return (
    <LabStage testId="mix-beam" alt={alt} data={{ 'data-sample': m.id, 'data-type': m.type, 'data-tyndall': beam ? String(pr.tyndall) : 'off', 'data-settled': settled ? 'true' : 'false', 'data-filtered': filtered ? 'true' : 'false' }}
      question="Which mixtures scatter a beam of light, settle on standing, or leave a residue on filter paper?"
      sceneNote="Schematic · particle view not to scale"
      scene={scene}
      actions={p.editable ? <>
        <LabButton primary={!beam} icon="flashlight_on" data-action="beam" aria-pressed={beam} onClick={() => setBeam((b) => !b)}>{beam ? 'Beam off' : 'Shine a beam'}</LabButton>
        <LabButton icon="hourglass_bottom" data-action="settle" disabled={settled} onClick={() => setSettled(true)}>Leave to stand</LabButton>
        <LabButton icon="filter_alt" data-action="filter" disabled={filtered} onClick={() => setFiltered(true)}>Filter it</LabButton>
      </> : undefined}
      controls={p.editable ? <>
        <LabSelect id="mix-sample" label="Beaker" value={id} options={SAMPLE_MIXTURES.map((s) => ({ id: s.id, label: s.name }))} onChange={(v) => { setId(v); resetSteps(); }} />
        {!beam && <LabPredict name="beam-predict" label="Will the beam’s path show from the side?" value={prediction} options={[{ id: 'yes', label: 'Yes, visible' }, { id: 'no', label: 'No path' }]} onChange={setPrediction} />}
      </> : undefined}
      observation={<>
        <dl className="lab-readout">
          <div><dt>Mixture type</dt><dd>{TYPE_LABEL[m.type]}</dd></div>
          <div><dt>Beam path</dt><dd>{beam ? (pr.tyndall ? 'visible' : 'not visible') : '—'}</dd></div>
          <div><dt>After standing</dt><dd>{settled ? (pr.settles ? 'settled' : 'no change') : '—'}</dd></div>
          <div><dt>Filter paper</dt><dd>{filtered ? (pr.filterable ? 'residue' : 'no residue') : '—'}</dd></div>
        </dl>
        <p className="m-0" data-testid="mix-beam-text">{beam ? describeBeam(m) : `${m.name} (${TYPE_LABEL[m.type]}, particles about ${fmtNm(m.diameterNm)}).`}</p>
        {settled && <p className="m-0 text-slate-200" data-testid="mix-settle-text">{pr.settles ? 'After standing, the particles have settled at the bottom.' : 'After standing, nothing has settled: the mixture looks the same.'}</p>}
        {filtered && <p className="m-0 text-slate-200" data-testid="mix-filter-text">{pr.filterable ? 'Filtering leaves a residue on the filter paper; the filtrate is clearer.' : 'Filtering leaves no residue: the particles pass through the filter paper.'}</p>}
        {beam && predictionNote(prediction, pr.tyndall ? 'yes' : 'no', (x) => (x === 'yes' ? 'visible' : 'no path'))}
      </>}
      explanation={<>
        <p className="m-0">It depends on the size of the particles. Dissolved particles (under 1 nm) are too small to scatter light, to be stopped by filter paper or to settle. Colloid particles (1 to 1000 nm) are big enough to scatter light, so the beam’s path shows (the Tyndall effect), but they still pass through filter paper and stay spread out. Suspension particles (over 1000 nm) scatter light, settle on standing and are held back by filter paper.</p>
        <p className="m-0 text-slate-400">{m.note} Safety: never look into a laser beam.</p>
      </>}
      explanationTitle="What the particles are doing"
      extra={<PropertiesTable />}
      extraTitle="Compare solutions, colloids and suspensions"
      finding={{ label: m.name, value: `${TYPE_LABEL[m.type]}${beam ? `; beam ${pr.tyndall ? 'visible' : 'not visible'}` : ''}${settled ? `; ${pr.settles ? 'settles' : 'does not settle'}` : ''}${filtered ? `; ${pr.filterable ? 'residue' : 'no residue'}` : ''}` }}
    />
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
  const valid = mode === 'm/m' || mode === 'm/v' || b > a;
  const soluteUnit = mode === 'v/v' ? 'mL' : 'g';
  const otherLabel = mode === 'm/m' ? 'Solvent (water)' : 'Total solution';
  const otherUnit = mode === 'm/m' ? 'g' : 'mL';
  const formula = mode === 'm/m' ? `${fmtNum(a)} ÷ (${fmtNum(a)} + ${fmtNum(b)}) × 100` : `${fmtNum(a)} ÷ ${fmtNum(b)} × 100`;
  const filled = Math.max(0, Math.min(100, Math.round(pct)));
  const scene = (
    <svg viewBox="0 0 320 190" role="img" aria-label={`${fmtNum(pct, 2)} percent: about ${filled} parts in every 100 parts of solution.`}>
      <text x="8" y="18" fontSize="13" fill="#e2e8f0">Every 100 parts of solution</text>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        return <rect key={i} x={10 + col * 15} y={28 + row * 15} width="13" height="13" rx="2" fill={i < filled ? '#2dd4bf' : '#1f2937'} stroke={i < filled ? '#99f6e4' : '#334155'} strokeWidth="0.6" />;
      })}
      <rect x="180" y="40" width="14" height="14" rx="2" fill="#2dd4bf" /><text x="200" y="52" fontSize="13" fill="#e2e8f0">solute</text>
      <rect x="180" y="64" width="14" height="14" rx="2" fill="#1f2937" stroke="#334155" /><text x="200" y="76" fontSize="13" fill="#e2e8f0">{mode === 'm/m' ? 'solvent' : 'rest of solution'}</text>
      <text x="180" y="120" fontSize="28" fontWeight="700" fill="#fff">{fmtNum(pct, 1)} %</text>
      <text x="180" y="142" fontSize="13" fill="#94a3b8">{mode}</text>
    </svg>
  );
  return (
    <LabStage testId="mix-concentration" alt={alt} data={{ 'data-mode': mode, 'data-percent': fmtNum(pct, 2) }}
      question="How much solute is there in every 100 parts of the solution?"
      sceneNote="Each square is 1 % (rounded)"
      scene={scene}
      controls={p.editable ? <>
        <LabChoice name="mode" label="Way of expressing" value={mode} options={[{ id: 'm/m', label: '% m/m' }, { id: 'm/v', label: '% m/v' }, { id: 'v/v', label: '% v/v' }]} onChange={(v) => setMode(v as Mode)} />
        <LabSlider id="conc-a" label="Solute" value={a} min={0.5} max={100} step={0.5} unit={soluteUnit} onChange={setA} />
        <LabSlider id="conc-b" label={otherLabel} value={b} min={10} max={1000} step={5} unit={otherUnit} onChange={setB} />
      </> : undefined}
      observation={<>
        <p className="m-0">% {mode} = {formula} = <strong data-testid="mix-percent">{fmtNum(pct, 2)} %</strong></p>
        {!valid && <p className="m-0 text-amber-300">The solute cannot be more than the whole solution.</p>}
      </>}
      explanation={<p className="m-0">{mode === 'm/m' ? 'Grams of solute in 100 g of solution; the solution is solute + solvent, so the solvent’s mass is added to the solute’s.' : mode === 'm/v' ? 'Grams of solute in 100 mL of solution (medicines, saline).' : 'Millilitres of a liquid solute in 100 mL of solution (vinegar, perfumes).'}</p>}
      finding={{ label: `${fmtNum(a)} ${soluteUnit} solute, ${fmtNum(b)} ${otherUnit} ${mode === 'm/m' ? 'solvent' : 'solution'}`, value: `${fmtNum(pct, 2)} % ${mode}` }}
    />
  );
};

// ---------- Solubility curves, dissolving and crystallization (one linked graph and beaker) ----------

const SALT_COLOUR: Record<string, string> = { kno3: '#f59e0b', nacl: '#38bdf8', kcl: '#a78bfa', nh4cl: '#34d399' };

export const MixSolubilityVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { saltIds?: string[]; temp?: number; hot?: number; cold?: number; water?: number; editable?: boolean; cooling?: boolean };
  const ids = p.saltIds ?? SALTS.map((s) => s.id);
  const startHot = p.cooling ? (p.hot ?? 60) : (p.temp ?? 40);
  const [saltId, setSaltId] = useState(ids[0]);
  const [satAt, setSatAt] = useState(startHot);
  const [temp, setTemp] = useState(p.cooling ? (p.cold ?? 20) : startHot);
  const [water, setWater] = useState(p.water ?? 100);
  const [running, setRunning] = useState(false);
  const target = 10;
  useTicker(running, () => setTemp((t) => { const n = Math.max(target, t - 5); if (n === target) setRunning(false); return n; }), 350);
  const salt = saltById(saltId);
  const inBeaker = saturatedMass(salt, satAt, water); // a solution saturated at `satAt`
  const canHold = saturatedMass(salt, temp, water);
  const dissolved = Math.min(inBeaker, canHold);
  const crystals = Math.max(0, inBeaker - canHold);
  const yieldG = crystalYield(salt, satAt, temp, water);
  const per100 = (g: number) => (g * 100) / water;
  // Graph geometry (graph on the left, beaker on the right).
  const X = (t: number) => 40 + ((t - 10) / 70) * 168, Y = (g: number) => 168 - (g / 180) * 150;
  const crystalCount = Math.min(40, Math.round(per100(crystals) / 2.5));
  const cool = () => { if (prefersReducedMotion()) { setTemp(target); return; } setRunning((r) => !r); };
  const scene = (
    <>
      <svg viewBox="0 0 320 212" role="img" aria-label={`${salt.name}: saturated at ${satAt} °C, now at ${temp} °C. ${fmtNum(dissolved, 1)} g dissolved, ${fmtNum(crystals, 1)} g of crystals.`}>
        <line x1="40" y1="168" x2="210" y2="168" stroke="#64748b" /><line x1="40" y1="12" x2="40" y2="168" stroke="#64748b" />
        {[10, 30, 50, 70].map((t) => <text key={t} x={X(t)} y="184" fontSize="14" textAnchor="middle" fill="#cbd5e1">{t}</text>)}
        {[0, 50, 100, 150].map((g) => <text key={g} x="35" y={Y(g) + 4} fontSize="14" textAnchor="end" fill="#cbd5e1">{g}</text>)}
        <text x="125" y="204" fontSize="13" textAnchor="middle" fill="#94a3b8">temperature (°C)</text>
        {ids.map((sid) => { const s = saltById(sid); const on = sid === saltId; return <polyline key={sid} fill="none" stroke={SALT_COLOUR[sid]} strokeWidth={on ? 3.5 : 1.5} opacity={on ? 1 : 0.45} strokeDasharray={on ? undefined : '4 3'} points={SOLUBILITY_TEMPS.map((t, i) => `${X(t)},${Y(s.g100[i])}`).join(' ')} />; })}
        <line x1={X(temp)} y1="12" x2={X(temp)} y2="168" stroke="#f8fafc" strokeDasharray="3 3" />
        <line x1="40" y1={Y(per100(inBeaker))} x2="210" y2={Y(per100(inBeaker))} stroke="#fbbf24" strokeDasharray="5 3" />
        <circle cx={X(satAt)} cy={Y(solubilityAt(salt, satAt))} r="5" fill="#ef4444" />
        <circle cx={X(temp)} cy={Y(Math.min(solubilityAt(salt, temp), per100(inBeaker)))} r="5" fill="#f8fafc" stroke="#0f172a" />
        {/* beaker */}
        <text x="270" y="40" fontSize="15" textAnchor="middle" fill="#e2e8f0" fontWeight="700">{temp} °C</text>
        <rect x="230" y="50" width="80" height="112" rx="5" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="232" y="72" width="76" height="88" fill="#38bdf8" opacity="0.16" />
        {Array.from({ length: Math.min(60, Math.round(per100(dissolved) / 3)) }, (_, i) => <circle key={`d${i}`} cx={236 + ((i * 37) % 68)} cy={78 + ((i * 23) % 64)} r="1.6" fill={SALT_COLOUR[saltId]} />)}
        {Array.from({ length: crystalCount }, (_, i) => <rect key={i} x={236 + (i * 9) % 68} y={152 - Math.floor(i / 8) * 6} width="6" height="6" fill="#f8fafc" stroke={SALT_COLOUR[saltId]} transform={`rotate(45 ${239 + (i * 9) % 68} ${155 - Math.floor(i / 8) * 6})`} />)}
        <text x="270" y="183" fontSize="14" textAnchor="middle" fill="#e2e8f0">dissolved {fmtNum(dissolved, 0)} g</text>
        <text x="270" y="201" fontSize="14" textAnchor="middle" fill={crystals > 0 ? '#fde68a' : '#94a3b8'}>crystals {fmtNum(crystals, 0)} g</text>
      </svg>
      <LabKey items={[
        ...ids.map((sid) => ({ colour: SALT_COLOUR[sid], label: saltById(sid).name, shape: 'line' as const })),
        { colour: '#fbbf24', label: 'salt in the beaker', shape: 'dash' as const },
        { colour: '#f8fafc', label: 'dots: dissolved salt; white squares: crystals' },
      ]} />
    </>
  );
  return (
    <LabStage testId="mix-solubility" alt={alt} data={{ 'data-yield': fmtNum(yieldG, 1), 'data-temp': temp, 'data-salt': saltId, 'data-dissolved': fmtNum(dissolved, 1), 'data-crystals': fmtNum(crystals, 1) }}
      question="How much salt can stay dissolved as a saturated solution cools, and how much comes out as crystals?"
      sceneNote="Graph: chapter data table, straight lines between table values"
      scene={scene}
      actions={p.editable ? <>
        <LabButton primary icon={running ? 'pause' : 'ac_unit'} data-action="cool" aria-pressed={running} disabled={!running && temp <= target} onClick={cool}>{running ? 'Pause' : 'Cool slowly'}</LabButton>
        <LabButton icon="remove" data-action="step-cool" disabled={temp <= 10} onClick={() => setTemp((t) => Math.max(10, t - 5))}>5 °C</LabButton>
        <LabButton icon="add" data-action="step-heat" disabled={temp >= 80} onClick={() => setTemp((t) => Math.min(80, t + 5))}>5 °C</LabButton>
      </> : undefined}
      controls={p.editable ? <>
        {ids.length > 1 && <LabSelect id="sol-salt" label="Salt" value={saltId} options={ids.map((sid) => ({ id: sid, label: saltById(sid).name }))} onChange={setSaltId} />}
        <LabSlider id="sol-temp" label="Temperature now" value={temp} min={10} max={80} step={1} unit="°C" onChange={(v) => { setRunning(false); setTemp(v); }} />
      </> : undefined}
      more={p.editable ? <>
        <LabSlider id="sol-hot" label="Solution was saturated at" value={satAt} min={10} max={80} step={5} unit="°C" onChange={setSatAt} />
        <LabSlider id="sol-water" label="Water" value={water} min={25} max={500} step={25} unit="g" onChange={setWater} />
      </> : undefined}
      observation={<>
        <dl className="lab-readout">
          <div><dt>Can dissolve at {temp} °C</dt><dd>{fmtNum(canHold, 1)} g</dd></div>
          <div><dt>Salt in the beaker</dt><dd>{fmtNum(inBeaker, 1)} g</dd></div>
          <div><dt>Dissolved</dt><dd>{fmtNum(dissolved, 1)} g</dd></div>
          <div><dt>Crystals</dt><dd data-testid="mix-crystals">{fmtNum(crystals, 1)} g</dd></div>
        </dl>
        <p className="m-0" data-testid="mix-yield-text">{salt.name} saturated in {water} g of water at {satAt} °C holds {fmtNum(inBeaker, 1)} g. {temp < satAt
          ? <>At {temp} °C only {fmtNum(canHold, 1)} g can stay dissolved, so <strong>{fmtNum(yieldG, 1)} g</strong> crystallizes.</>
          : temp > satAt ? <>At {temp} °C it could hold {fmtNum(canHold, 1)} g, so the solution is unsaturated and no crystals form.</>
            : <>It is just saturated: no crystals yet. Cool it to see crystals form.</>}</p>
      </>}
      explanation={<>
        <p className="m-0">Each curve is the most salt 100 g of water can hold at each temperature. Below the curve the salt stays dissolved; when the solution cools below the temperature at which it was saturated, the extra salt comes out as crystals.</p>
        <p className="m-0">A steep curve (potassium nitrate) gives a large crop of crystals on cooling; a flat curve (sodium chloride) gives almost none, which is why salt is obtained by evaporation instead.</p>
      </>}
      extra={<ul className="m-0 pl-4 list-disc space-y-1" data-testid="mix-solubility-readings">
        {ids.map((sid) => { const s = saltById(sid); return <li key={sid}>{s.name}: <strong>{fmtNum(solubilityAt(s, temp), 1)} g</strong> per 100 g of water at {temp} °C</li>; })}
      </ul>}
      extraTitle={`Read every curve at ${temp} °C`}
      finding={{ label: `${salt.name}, saturated at ${satAt} °C, now ${temp} °C`, value: `${fmtNum(dissolved, 1)} g dissolved, ${fmtNum(crystals, 1)} g crystals` }}
    />
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
  const initial = caseById(p.caseId ?? 'acetone-water');
  const [caseId, setCaseId] = useState(initial.id);
  const [liquids, setLiquids] = useState<[string, string]>(initial.liquids ?? ['acetone', 'water']);
  const [pick, setPick] = useState<Method | ''>('');
  const [guess, setGuess] = useState<Method | null>(null);
  const base = caseById(caseId);
  // Two-liquid mixtures are always built from the chosen liquids, so the preset, pickers, name and boiling points agree.
  const liquidMode = Boolean(p.editable) && (caseId === CUSTOM_PAIR || Boolean(base.liquids));
  const c: MixtureCase = liquidMode ? twoLiquidCase(liquids[0], liquids[1]) : base;
  const choice = chooseMethod(c);
  const revealed = !p.quiz || guess !== null;
  const roles = separationRoles(c, choice.method);
  const restart = () => { setGuess(null); setPick(''); };
  const chooseCase = (id: string) => {
    restart();
    if (id === CUSTOM_PAIR) { setCaseId(CUSTOM_PAIR); setLiquids(['alcohol', 'water']); return; }
    setCaseId(id);
    const next = caseById(id);
    if (next.liquids) setLiquids(next.liquids);
  };
  const chooseLiquid = (slot: 0 | 1, liquid: string) => {
    restart();
    const pair: [string, string] = slot === 0 ? [liquid, liquids[1]] : [liquids[0], liquid];
    setLiquids(pair);
    const match = twoLiquidCase(pair[0], pair[1]);
    setCaseId(MIXTURE_CASES.some((m) => m.id === match.id) ? match.id : CUSTOM_PAIR);
  };
  const caseOptions = [...MIXTURE_CASES.map((m) => ({ id: m.id, label: m.name })), { id: CUSTOM_PAIR, label: caseId === CUSTOM_PAIR ? `Your two liquids: ${c.name}` : 'Your own two liquids' }];
  const liquidOptions = (other: string) => LIQUIDS.filter((l) => l !== other).map((l) => ({ id: l, label: `${l} (boils ${BOILING_POINTS[l]} °C)` }));
  const right = guess !== null && guess === choice.method;
  return (
    <LabStage testId="mix-separation" alt={alt}
      data={{ 'data-case': c.id, 'data-method': revealed ? choice.method : 'hidden', 'data-liquids': c.liquids?.join('+') ?? '', 'data-boiling-points': c.boilingPoints?.join(',') ?? '' }}
      question={p.quiz ? 'Which property differs between the parts, and which method uses it?' : `How are the parts of this mixture separated?`}
      sceneNote="Schematic apparatus · not to scale"
      scene={revealed ? <SeparationScene c={c} method={choice.method} /> : <MixtureScene c={c} />}
      controls={p.editable ? <>
        <LabSelect id="sep-case" label="Mixture" value={caseId} options={caseOptions} onChange={chooseCase} />
        {liquidMode && (
          <div className="grid grid-cols-2 gap-2" data-testid="sep-liquids">
            <LabSelect id="sep-a" label="Liquid 1" value={liquids[0]} options={liquidOptions(liquids[1])} onChange={(v) => chooseLiquid(0, v)} />
            <LabSelect id="sep-b" label="Liquid 2" value={liquids[1]} options={liquidOptions(liquids[0])} onChange={(v) => chooseLiquid(1, v)} />
          </div>
        )}
        {p.quiz && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[12rem]"><LabSelect id="sep-guess" label="Your method" value={pick} options={[{ id: '', label: 'Choose a method…' }, ...ALL_METHODS.map((m) => ({ id: m, label: METHOD_LABEL[m] }))]} onChange={(v) => { setPick(v as Method | ''); setGuess(null); }} /></div>
            <LabButton primary icon="science" data-action="check-method" disabled={pick === ''} onClick={() => { if (pick) setGuess(pick); }}>Check</LabButton>
          </div>
        )}
      </> : undefined}
      observation={<>
        <p className="m-0" data-testid="mix-separation-mixture"><strong>{c.name}</strong>: {propertyHint(c)}</p>
        {!revealed && <p className="m-0 text-slate-300">Choose the method you would use, then check it. The apparatus appears once you have chosen.</p>}
        {revealed && <div className="space-y-1" data-testid="mix-separation-result">
          {p.quiz && guess && <p className={`m-0 font-semibold ${right ? 'text-emerald-300' : 'text-amber-300'}`} data-verdict={right ? 'right' : 'try-again'}>
            <span aria-hidden className="material-symbols-outlined text-[16px] align-[-3px] mr-1">{right ? 'check_circle' : 'info'}</span>
            {right ? 'Yes, that works.' : `Not the best choice. ${METHOD_LABEL[guess]} does not use the property that differs here.`}</p>}
          <p className="m-0">Method: <strong>{METHOD_LABEL[choice.method]}</strong></p>
          <p className="m-0 text-slate-200">{choice.reason}</p>
          {choice.method !== 'none' && <dl className="lab-readout"><div><dt>Goes in</dt><dd className="text-sm">{roles.input}</dd></div><div><dt>Collected or leaves</dt><dd className="text-sm">{roles.out}</dd></div><div><dt>Stays behind</dt><dd className="text-sm">{roles.stays}</dd></div></dl>}
        </div>}
      </>}
      explanation={revealed && METHOD_PICTURE[choice.method] ? <p className="m-0">{METHOD_PICTURE[choice.method]}</p> : undefined}
      explanationTitle="How the apparatus is used"
      finding={revealed ? { label: c.name, value: `${METHOD_LABEL[choice.method]}${p.quiz && guess ? (right ? ' (my choice was right)' : ` (I chose ${METHOD_LABEL[guess].toLowerCase()})`) : ''}` } : null}
    />
  );
};

const CUSTOM_PAIR = 'custom-liquids';

/** The property that decides the method, in words. */
function propertyHint(c: MixtureCase): string {
  switch (c.kind) {
    case 'two-miscible-liquids': return `the liquids mix completely; they boil at ${c.boilingPoints?.[0]} °C and ${c.boilingPoints?.[1]} °C (a gap of ${Math.abs((c.boilingPoints?.[0] ?? 0) - (c.boilingPoints?.[1] ?? 0))} °C).`;
    case 'two-immiscible-liquids': return 'the liquids do not mix and form two layers.';
    case 'solid-in-liquid-solution': return c.want === 'solvent' ? 'a dissolved solid; the pure liquid is wanted.' : c.want === 'pure-crystals' ? 'a dissolved solid with impurities; pure crystals are wanted.' : 'a dissolved solid; the solid is wanted.';
    case 'insoluble-solid-in-liquid': return 'a solid that does not dissolve, with particles big enough to see.';
    case 'fine-particles-in-liquid': return c.needsSpinning ? 'very fine particles that stay spread out unless spun.' : 'very fine particles that settle only very slowly.';
    case 'two-solids': return c.sublimes ? 'two solids; one turns straight into vapour on heating.' : c.magnetic ? 'two solids; one is attracted to a magnet.' : c.oneSoluble ? 'two solids; only one dissolves in water.' : 'two solids.';
    case 'coloured-components': return 'several coloured substances dissolved together.';
    default: return 'metals mixed evenly in one solid.';
  }
}

// ---------- Paper chromatography ----------

const MAX_FRONT = 8;

export const MixChromatographyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const p = props as { front?: number; editable?: boolean };
  const [front, setFront] = useState(p.front ?? 6);
  const [running, setRunning] = useState(false);
  useTicker(running, () => setFront((f) => { const n = Math.min(MAX_FRONT, Math.round((f + 0.5) * 10) / 10); if (n >= MAX_FRONT) setRunning(false); return n; }), 400);
  const base = 176, cmPx = 18;
  const run = () => {
    if (front >= MAX_FRONT) setFront(0);
    if (prefersReducedMotion()) { setFront(MAX_FRONT); return; }
    setRunning((r) => !r);
  };
  const scene = (
    <svg viewBox="0 0 320 210" role="img" aria-label={`Solvent front ${fmtNum(front, 1)} cm above the start line. ${front > 0 ? BLACK_INK.map((d) => `${d.id} dye at ${fmtNum(spotDistance(d.rate, front), 1)} cm`).join(', ') : 'The ink spot has not moved.'}`}>
      <rect x="110" y="186" width="100" height="18" fill="#38bdf8" opacity="0.35" stroke="#64748b" />
      <text x="216" y="200" fontSize="12" fill="#94a3b8">solvent</text>
      <rect x="140" y="20" width="40" height="176" fill="#f8fafc" opacity="0.92" />
      <rect x="140" y={base - front * cmPx} width="40" height={front * cmPx} fill="#38bdf8" opacity="0.18" className="lab-transition" />
      <line x1="140" y1={base} x2="180" y2={base} stroke="#334155" strokeDasharray="3 2" />
      <text x="186" y={base + 4} fontSize="12" fill="#94a3b8">start line</text>
      {front > 0 && <><line x1="136" y1={base - front * cmPx} x2="184" y2={base - front * cmPx} stroke="#0ea5e9" strokeWidth="2" /><text x="188" y={base - front * cmPx + 4} fontSize="12" fill="#7dd3fc">solvent front {fmtNum(front, 1)} cm</text></>}
      {Array.from({ length: MAX_FRONT + 1 }, (_, k) => <g key={k}><line x1="122" y1={base - k * cmPx} x2="134" y2={base - k * cmPx} stroke="#94a3b8" /><text x="118" y={base - k * cmPx + 4} fontSize="12" textAnchor="end" fill="#cbd5e1">{k}</text></g>)}
      <text x="70" y="14" fontSize="12" fill="#94a3b8">cm</text>
      {BLACK_INK.map((d) => <circle key={d.id} cx="160" cy={base - spotDistance(d.rate, front) * cmPx} r="5.5" fill={front > 0 ? d.colour : '#111827'} className="lab-transition" />)}
      {front > 0 && BLACK_INK.map((d, i) => <text key={`l${d.id}`} x={i % 2 ? 60 : 30} y={base - spotDistance(d.rate, front) * cmPx + 4} fontSize="12" fill={d.colour}>{d.id}</text>)}
    </svg>
  );
  return (
    <LabStage testId="mix-chromatography" alt={alt} data={{ 'data-front': front }}
      question="Is black ink one substance or several?"
      sceneNote="Illustrative ink of three dyes"
      scene={scene}
      actions={p.editable ? <>
        <LabButton primary icon={running ? 'pause' : 'play_arrow'} data-action="run" aria-pressed={running} onClick={run}>{running ? 'Pause' : front >= MAX_FRONT ? 'Run again' : 'Run'}</LabButton>
        <LabButton icon="skip_next" data-action="step" disabled={front >= MAX_FRONT} onClick={() => { setRunning(false); setFront((f) => Math.min(MAX_FRONT, f + 0.5)); }}>+0.5 cm</LabButton>
      </> : undefined}
      controls={p.editable ? <LabSlider id="chrom-front" label="Solvent front" value={front} min={0} max={MAX_FRONT} step={0.5} unit="cm" onChange={(v) => { setRunning(false); setFront(v); }} /> : undefined}
      observation={<>
        <p className="m-0" data-testid="mix-chromatography-text">Solvent front {fmtNum(front, 1)} cm above the start line: {front > 0 ? BLACK_INK.map((d) => `${d.id} ${fmtNum(spotDistance(d.rate, front), 1)} cm`).join(', ') : 'the ink spot has not moved yet'}.</p>
        {front > 0 && <table className="lab-notebook__table"><thead><tr><th>Dye</th><th>Distance</th><th>Distance ÷ front</th></tr></thead>
          <tbody>{BLACK_INK.map((d) => <tr key={d.id}><td>{d.id}</td><td>{fmtNum(spotDistance(d.rate, front), 1)} cm</td><td>{fmtNum(d.rate, 2)}</td></tr>)}</tbody></table>}
      </>}
      explanation={<p className="m-0">The solvent rises up the paper and carries each dye along. A dye that dissolves well in the solvent and clings less to the paper travels further, so the ink separates into spots. Each dye always travels the same fraction of the solvent’s distance (last column), which is how a dye can be identified.</p>}
      finding={front > 0 ? { label: `Solvent front ${fmtNum(front, 1)} cm`, value: BLACK_INK.map((d) => `${d.id} ${fmtNum(spotDistance(d.rate, front), 1)} cm`).join(', ') } : null}
    />
  );
};

export const MIX_VISUALS: VisualRegistry = {
  mixBeam: MixBeamVisual, mixConcentration: MixConcentrationVisual, mixSolubility: MixSolubilityVisual, mixSeparation: MixSeparationVisual, mixChromatography: MixChromatographyVisual,
};
