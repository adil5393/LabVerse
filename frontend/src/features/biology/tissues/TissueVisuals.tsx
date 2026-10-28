/**
 * Figures and laboratory investigations for Chapter 3 (Tissues in Action): the onion root experiment, tree rings, a stem
 * cross-section, animal tissues and joints. Every number comes from `engine/biology/tissues/model.ts`. Diagrams are simplified
 * and not to scale; every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum } from '../../education/SubjectLabShell';
import { LabButton, LabKey, LabPredict, LabStage, predictionNote, prefersReducedMotion, useTicker } from '../../education/LabLayout';
import {
  CONNECTIVE, EPITHELIA, JOINTS, MUSCLES, NEURON_PARTS, PLANT_TISSUES, TEAK_DATA, canMove, isComplex, plantTissue, ringsForAge, rootLength,
  type JointId, type Movement, type MuscleId, type PlantTissueId,
} from '../../../engine/biology/tissues/model';

const TXT = '#e2e8f0', MUTED = '#94a3b8', A_COL = '#34d399', B_COL = '#f472b6';

// ---------- Root growth (Activity 3.1) ----------

const DAYS = [1, 2, 3, 4, 5, 6, 7];

/** One jar with an onion and three roots of the given length (cm). */
const Jar: React.FC<{ x: number; label: string; colour: string; cm: number; cut: boolean }> = ({ x, label, colour, cm, cut }) => {
  const px = 15; // per cm
  const top = 70;
  return (
    <g>
      <path d={`M ${x} ${top} L ${x} 196 Q ${x} 204 ${x + 8} 204 L ${x + 44} 204 Q ${x + 52} 204 ${x + 52} 196 L ${x + 52} ${top}`} fill="#0ea5e9" fillOpacity="0.15" stroke="#94a3b8" strokeWidth="1.5" />
      <ellipse cx={x + 26} cy={top - 6} rx="22" ry="16" fill="#c4b5fd" stroke="#7c3aed" />
      {[-10, 0, 10].map((dx) => <line key={dx} x1={x + 26 + dx} y1={top + 8} x2={x + 26 + dx * 1.3} y2={top + 8 + cm * px} stroke={colour} strokeWidth="2.5" strokeLinecap="round" className="lab-transition" />)}
      {cut && [-10, 0, 10].map((dx) => <g key={`c${dx}`}><line x1={x + 20 + dx * 1.3} y1={top + 8 + cm * px} x2={x + 32 + dx * 1.3} y2={top + 8 + cm * px} stroke="#f8fafc" strokeWidth="1.5" /></g>)}
      <text x={x + 26} y={top - 2} fontSize="14" textAnchor="middle" fill="#2e1065" fontWeight="700">{label}</text>
      <text x={x + 26} y="218" fontSize="12" textAnchor="middle" fill={colour}>{fmtNum(cm, 1)} cm</text>
    </g>
  );
};

export const RootGrowthVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { cutDay?: number | null; editable?: boolean };
  const [cutDay, setCutDay] = useState<number | null>(q.cutDay === undefined ? 3 : q.cutDay);
  const [day, setDay] = useState(q.editable ? 1 : 7);
  const [running, setRunning] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  useTicker(running, () => setDay((d) => { if (d >= 7) { setRunning(false); return 7; } return d + 1; }), 700);
  const a = DAYS.map((d) => rootLength(d, null));
  const b = DAYS.map((d) => rootLength(d, cutDay));
  const X = (d: number) => 152 + (d - 1) * 26, Y = (cm: number) => 186 - cm * 24;
  const path = (vals: number[]) => vals.slice(0, day).map((v, i) => `${i ? 'L' : 'M'} ${X(i + 1)} ${Y(v)}`).join(' ');
  const cutDone = cutDay !== null && day >= cutDay;
  const run = () => { if (day >= 7) setDay(1); if (prefersReducedMotion()) { setDay(7); return; } setRunning((r) => !r); };
  const scene = (
    <>
      <svg viewBox="0 0 320 224" role="img" aria-label={`Day ${day}: jar A roots ${fmtNum(a[day - 1], 1)} cm, jar B roots ${fmtNum(b[day - 1], 1)} cm${cutDay !== null ? `, tips cut on day ${cutDay}` : ''}.`}>
        <text x="8" y="18" fontSize="13" fill={TXT} fontWeight="700">Day {day}</text>
        <Jar x={6} label="A" colour={A_COL} cm={a[day - 1]} cut={false} />
        <Jar x={70} label="B" colour={B_COL} cm={b[day - 1]} cut={cutDone} />
        {cutDone && <text x="96" y="36" fontSize="12" textAnchor="middle" fill="#f9a8d4">tips cut</text>}
        {/* graph linked to the jars */}
        <line x1="148" y1="186" x2="314" y2="186" stroke="#64748b" /><line x1="148" y1="186" x2="148" y2="30" stroke="#64748b" />
        {DAYS.map((d) => <text key={d} x={X(d)} y="202" fontSize="12" textAnchor="middle" fill={d === day ? '#fff' : MUTED} fontWeight={d === day ? 700 : 400}>{d}</text>)}
        {[0, 2, 4, 6].map((cm) => <text key={cm} x="144" y={Y(cm) + 4} fontSize="12" textAnchor="end" fill={MUTED}>{cm}</text>)}
        <text x="232" y="218" fontSize="12" textAnchor="middle" fill={MUTED}>day</text>
        <text x="152" y="24" fontSize="12" fill={MUTED}>root length (cm)</text>
        <line x1={X(day)} y1="30" x2={X(day)} y2="186" stroke="#f8fafc" strokeDasharray="3 3" />
        <path d={path(a)} fill="none" stroke={A_COL} strokeWidth="2.5" />
        <path d={path(b)} fill="none" stroke={B_COL} strokeWidth="2.5" strokeDasharray="5 3" />
        <circle cx={X(day)} cy={Y(a[day - 1])} r="4" fill={A_COL} /><circle cx={X(day)} cy={Y(b[day - 1])} r="4" fill={B_COL} />
        {cutDay !== null && cutDay <= day && <text x={X(cutDay)} y={Y(b[cutDay - 1]) + 16} fontSize="11" fill={B_COL} textAnchor="middle">✂</text>}
      </svg>
      <LabKey items={[{ colour: A_COL, label: 'jar A: tips left on', shape: 'line' }, { colour: B_COL, label: `jar B: ${cutDay === null ? 'tips left on' : `tips cut on day ${cutDay}`}`, shape: 'dash' }]} />
    </>
  );
  return (
    <LabStage testId="root-growth" alt={alt} data={{ 'data-cut-day': cutDay ?? 'none', 'data-day': day, 'data-a7': fmtNum(a[6], 2), 'data-b7': fmtNum(b[6], 2) }}
      question="Where do roots grow from? Compare two jars of onions over a week."
      sceneNote="Illustrative growth of about 0.9 cm a day"
      scene={scene}
      actions={q.editable ? <>
        <LabButton primary icon={running ? 'pause' : 'play_arrow'} data-action="run" aria-pressed={running} onClick={run}>{running ? 'Pause' : day >= 7 ? 'Watch again' : 'Watch the week'}</LabButton>
        <LabButton icon="skip_next" data-action="next-day" disabled={day >= 7} onClick={() => { setRunning(false); setDay((d) => Math.min(7, d + 1)); }}>Next day</LabButton>
      </> : undefined}
      controls={q.editable ? <>
        <LabSlider id="root-day" label="Day" value={day} min={1} max={7} step={1} unit="" format={(v) => `day ${v}`} onChange={(v) => { setRunning(false); setDay(v); }} />
        <LabChoice name="cut-day" label="Cut jar B’s root tips on" value={cutDay === null ? 'none' : String(cutDay)} options={[{ id: 'none', label: 'Never' }, ...[2, 3, 4, 5].map((d) => ({ id: String(d), label: `Day ${d}` }))]} onChange={(v) => { setCutDay(v === 'none' ? null : Number(v)); setPrediction(null); }} />
        {cutDay !== null && <LabPredict name="root-predict" label="After the cut, jar B’s roots will…" value={prediction} options={[{ id: 'grow', label: 'Keep growing' }, { id: 'stop', label: 'Stop growing' }]} onChange={setPrediction} />}
      </> : undefined}
      observation={<>
        <dl className="lab-readout"><div><dt>Jar A, day {day}</dt><dd>{fmtNum(a[day - 1], 1)} cm</dd></div><div><dt>Jar B, day {day}</dt><dd>{fmtNum(b[day - 1], 1)} cm</dd></div></dl>
        <p className="m-0" data-testid="root-growth-result">Day 7: jar A (tips intact) <strong>{fmtNum(a[6], 1)} cm</strong>; jar B {cutDay === null ? '(tips intact)' : `(tips cut on day ${cutDay})`} <strong>{fmtNum(b[6], 1)} cm</strong>. {cutDay === null ? 'Both keep growing.' : 'After the tips are cut, jar B’s roots stop getting longer: the dividing cells were at the tips.'}</p>
        {cutDay !== null && day >= 7 && predictionNote(prediction, 'stop', (x) => (x === 'stop' ? 'stop growing' : 'keep growing'))}
      </>}
      explanation={<p className="m-0">Roots grow longer only at their tips, where the apical meristem’s cells keep dividing. Cutting the tip removes those cells, so the root stops lengthening even though the rest of it is alive.</p>}
      extra={<table className="lab-notebook__table"><thead><tr><th>Day</th>{DAYS.map((d) => <th key={d}>{d}</th>)}</tr></thead>
        <tbody><tr><td>A (cm)</td>{a.map((v, i) => <td key={i}>{fmtNum(v, 1)}</td>)}</tr><tr><td>B (cm)</td>{b.map((v, i) => <td key={i}>{fmtNum(v, 1)}</td>)}</tr></tbody></table>}
      finding={{ label: `Day ${day}, B cut ${cutDay === null ? 'never' : `on day ${cutDay}`}`, value: `A ${fmtNum(a[day - 1], 1)} cm, B ${fmtNum(b[day - 1], 1)} cm` }}
    />
  );
};

// ---------- Tree rings (Table 3.7) ----------

function diameterAt(age: number): number {
  const rows = TEAK_DATA;
  if (age <= rows[0].age) return (rows[0].dbhCm / rows[0].age) * age;
  for (let i = 1; i < rows.length; i++) if (age <= rows[i].age) { const p = rows[i - 1], n = rows[i]; return p.dbhCm + ((n.dbhCm - p.dbhCm) * (age - p.age)) / (n.age - p.age); }
  return rows[rows.length - 1].dbhCm;
}

export const TreeRingsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { age?: number; editable?: boolean };
  const [age, setAge] = useState(q.age ?? 20);
  const rings = ringsForAge(age);
  const dia = diameterAt(age);
  const scene = (
    <svg viewBox="0 0 320 200" role="img" aria-label={`Trunk of a ${age}-year-old teak: ${rings} rings, about ${fmtNum(dia, 1)} cm across.`}>
      <circle cx="100" cy="100" r="92" fill="#78350f" />
      {Array.from({ length: rings }, (_, i) => { const r = 6 + (84 * diameterAt(i + 1)) / diameterAt(Math.max(rings, 1)); return <circle key={i} cx="100" cy="100" r={Math.min(88, r)} fill="none" stroke={i % 2 ? '#fcd34d' : '#d97706'} strokeWidth={i % 3 === 0 ? 1.2 : 0.7} />; })}
      <circle cx="100" cy="100" r="3" fill="#451a03" />
      <line x1="8" y1="196" x2="192" y2="196" stroke="#cbd5e1" /><text x="100" y="190" fontSize="12" textAnchor="middle" fill={TXT}>{fmtNum(dia, 1)} cm across</text>
      <text x="206" y="80" fontSize="13" fill={TXT}>{rings} rings</text>
      <text x="206" y="98" fontSize="13" fill={TXT}>= {age} years</text>
      <text x="206" y="126" fontSize="12" fill={MUTED}>one ring</text><text x="206" y="140" fontSize="12" fill={MUTED}>each year</text>
    </svg>
  );
  return (
    <LabStage testId="tree-rings" alt={alt} data={{ 'data-rings': rings, 'data-diameter': fmtNum(dia, 1) }}
      question="How can you tell a tree’s age from its trunk?"
      sceneNote="Data from Table 3.7 (teak) · rings not to scale"
      scene={scene}
      controls={q.editable ? <LabSlider id="ring-age" label="Age of the tree" value={age} min={1} max={40} step={1} unit="years" onChange={setAge} /> : undefined}
      observation={<p className="m-0" data-testid="tree-rings-result">A teak tree aged {age} years: <strong>{rings} annual rings</strong>, trunk about <strong>{fmtNum(dia, 1)} cm</strong> across at breast height.</p>}
      explanation={<p className="m-0">The lateral meristem adds one ring of wood each year; wide rings mean good growing years. Between the table’s ages the diameter is a straight-line estimate.</p>}
      extra={<table className="lab-notebook__table"><thead><tr><th>Age (years)</th><th>Diameter (cm)</th><th>Rings</th></tr></thead>
        <tbody>{TEAK_DATA.map((r) => <tr key={r.age}><td>{r.age}</td><td>{r.dbhCm}</td><td>{r.rings}</td></tr>)}</tbody></table>}
      finding={{ label: `Teak, ${age} years`, value: `${rings} rings, ${fmtNum(dia, 1)} cm` }}
    />
  );
};

// ---------- Stem cross-section ----------

/** Numbered markers for each tissue, placed on the part of the section where it is. */
const STEM_SPOTS: Record<PlantTissueId, [number, number]> = {
  epidermis: [100, 8], collenchyma: [168, 52], parenchyma: [100, 150], sclerenchyma: [40, 64], phloem: [146, 132], xylem: [64, 120], meristem: [126, 64],
};

export const PlantTissuesVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { tissue?: PlantTissueId; editable?: boolean };
  const [id, setId] = useState<PlantTissueId>(q.tissue ?? 'epidermis');
  const t = plantTissue(id);
  const hl = (x: PlantTissueId) => (x === id ? '#facc15' : undefined);
  const bundles = Array.from({ length: 8 }, (_, i) => (i * 2 * Math.PI) / 8 + Math.PI / 8);
  const scene = (
    <svg viewBox="-4 -4 208 208" role="group" aria-label="Cross-section of a young dicot stem with numbered tissues">
      <circle cx="100" cy="100" r="92" fill="#d9f99d" stroke={hl('epidermis') ?? '#3f6212'} strokeWidth={hl('epidermis') ? 5 : 3} />
      <circle cx="100" cy="100" r="84" fill="none" stroke={hl('collenchyma') ?? '#65a30d'} strokeWidth={hl('collenchyma') ? 8 : 6} opacity="0.7" />
      <circle cx="100" cy="100" r="78" fill={hl('parenchyma') ? '#fef08a' : '#ecfccb'} />
      <circle cx="100" cy="100" r="52" fill="none" stroke={hl('meristem') ?? '#a3a3a3'} strokeWidth={hl('meristem') ? 3 : 1} strokeDasharray="3 2" />
      {bundles.map((a, i) => (
        <g key={i}>
          <circle cx={100 + 66 * Math.cos(a)} cy={100 + 66 * Math.sin(a)} r="6" fill={hl('sclerenchyma') ?? '#a16207'} />
          <circle cx={100 + 58 * Math.cos(a)} cy={100 + 58 * Math.sin(a)} r="6" fill={hl('phloem') ?? '#22c55e'} />
          <circle cx={100 + 45 * Math.cos(a)} cy={100 + 45 * Math.sin(a)} r="7" fill={hl('xylem') ?? '#1d4ed8'} />
        </g>
      ))}
      {PLANT_TISSUES.map((p, i) => {
        const [x, y] = STEM_SPOTS[p.id as PlantTissueId];
        const on = p.id === id;
        const pick = () => q.editable && setId(p.id as PlantTissueId);
        return (
          <g key={p.id} role={q.editable ? 'button' : undefined} tabIndex={q.editable ? 0 : undefined} aria-label={q.editable ? `${i + 1}. ${p.name}` : undefined} aria-pressed={q.editable ? on : undefined} data-hotspot={p.id}
            onClick={pick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } }} className={q.editable ? 'lab-hotspot' : undefined}>
            <circle cx={x} cy={y} r="17" fill="transparent" />
            <circle cx={x} cy={y} r="8" fill={on ? '#facc15' : '#0f172a'} stroke={on ? '#fff' : '#facc15'} strokeWidth="1.5" />
            <text x={x} y={y + 3.5} fontSize="10" textAnchor="middle" fill={on ? '#0f172a' : '#fff'} fontWeight="700">{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
  return (
    <LabStage testId="plant-tissues" alt={alt} data={{ 'data-tissue': id }}
      question="Which tissue in a stem does which job?"
      sceneNote="Simplified young dicot stem · not to scale · tap a number"
      scene={<>{scene}<LabKey items={[{ colour: '#1d4ed8', label: 'xylem' }, { colour: '#22c55e', label: 'phloem' }, { colour: '#a16207', label: 'sclerenchyma' }, { colour: '#a3a3a3', label: 'lateral meristem (dashed)', shape: 'dash' }]} /></>}
      controls={q.editable ? <LabChoice name="plant-tissue" label="Tissue (same numbers as the diagram)" value={id} options={PLANT_TISSUES.map((p, i) => ({ id: p.id, label: `${i + 1}. ${p.name.replace(' tissue', '')}` }))} onChange={(v) => setId(v as PlantTissueId)} /> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="plant-tissue-name">{t.name}</p>
        <p className="m-0"><strong>Function:</strong> {t.job}</p>
        <p className="m-0 text-slate-300"><strong>Structure:</strong> {t.group === 'meristematic' ? 'Meristematic' : t.group === 'protective' ? 'Protective' : t.group === 'simple permanent' ? 'Simple permanent' : 'Complex permanent'} tissue{t.group.includes('permanent') ? ` (${isComplex(t) ? 'several kinds of cell' : 'one kind of cell'})` : ''}; cells {t.living}; {t.wall}. Found in: {t.where}. Tissue system: {t.system}.</p>
      </>}
      finding={{ label: t.name, value: t.job }}
    />
  );
};

// ---------- Animal tissues ----------

type Group = 'epithelial' | 'connective' | 'muscle' | 'nervous';
const MUSCLE_LABEL: Record<MuscleId, string> = { skeletal: 'Skeletal', smooth: 'Smooth', cardiac: 'Cardiac' };

const MusclePicture: React.FC<{ id: MuscleId }> = ({ id }) => (
  <svg viewBox="0 0 200 80" role="img" aria-label={`${MUSCLE_LABEL[id]} muscle fibres`}>
    {id === 'skeletal' && [12, 32, 52].map((y) => <g key={y}><rect x="10" y={y} width="180" height="16" rx="8" fill="#fca5a5" />{Array.from({ length: 22 }, (_, k) => <line key={k} x1={18 + k * 8} y1={y + 2} x2={18 + k * 8} y2={y + 14} stroke="#b91c1c" strokeWidth="1" />)}{[40, 100, 160].map((x) => <ellipse key={x} cx={x} cy={y + 8} rx="4" ry="2.5" fill="#7f1d1d" />)}</g>)}
    {id === 'smooth' && [20, 50].map((y) => [20, 75, 130].map((x) => <g key={`${x}${y}`}><path d={`M ${x} ${y} Q ${x + 25} ${y - 10} ${x + 50} ${y} Q ${x + 25} ${y + 10} ${x} ${y}`} fill="#fda4af" /><ellipse cx={x + 25} cy={y} rx="4" ry="2" fill="#7f1d1d" /></g>))}
    {id === 'cardiac' && <g><path d="M10 25 H190 M10 55 H190 M60 25 L90 55 M130 25 L150 55" stroke="#fca5a5" strokeWidth="14" strokeLinecap="round" />{[40, 110, 170].map((x) => <ellipse key={x} cx={x} cy="25" rx="4" ry="2.5" fill="#7f1d1d" />)}{Array.from({ length: 22 }, (_, k) => <line key={k} x1={14 + k * 8} y1="20" x2={14 + k * 8} y2="30" stroke="#b91c1c" strokeWidth="0.5" opacity="0.6" />)}</g>}
  </svg>
);

const ConnectivePicture: React.FC<{ id: string }> = ({ id }) => (
  <svg viewBox="0 0 200 80" role="img" aria-label={`${id} drawn schematically`}>
    <rect x="4" y="4" width="192" height="72" rx="8" fill={id === 'blood' ? '#fde68a' : id === 'bone' ? '#e7e5e4' : id === 'cartilage' ? '#bae6fd' : '#fecaca'} opacity={id === 'blood' ? 0.5 : 0.7} />
    {id === 'blood' && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={16 + (i * 29) % 172} cy={16 + (i * 17) % 50} r={i % 5 === 0 ? 6 : 5} fill={i % 5 === 0 ? '#f8fafc' : '#dc2626'} />)}
    {id === 'bone' && [20, 70, 120, 170].map((x) => <g key={x}>{[14, 9, 4].map((r) => <circle key={r} cx={x} cy="40" r={r} fill="none" stroke="#78716c" />)}</g>)}
    {id === 'cartilage' && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={18 + (i * 37) % 170} cy={20 + (i * 23) % 44} r="5" fill="#1d4ed8" opacity="0.6" />)}
    {(id === 'tendon' || id === 'ligament') && [16, 28, 40, 52, 64].map((y) => <path key={y} d={`M 8 ${y} q 24 -4 48 0 t 48 0 t 48 0 t 44 0`} fill="none" stroke="#b91c1c" strokeWidth="2" />)}
    <text x="196" y="74" fontSize="11" textAnchor="end" fill="#0f172a">matrix</text>
  </svg>
);

export const AnimalTissuesVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { group?: Group; editable?: boolean };
  const [group, setGroup] = useState<Group>(q.group ?? 'epithelial');
  const [epi, setEpi] = useState(EPITHELIA[0].id);
  const [con, setCon] = useState(CONNECTIVE[0].id);
  const [mus, setMus] = useState<MuscleId>('skeletal');
  const e = EPITHELIA.find((x) => x.id === epi)!;
  const c = CONNECTIVE.find((x) => x.id === con)!;
  const m = MUSCLES[mus];
  const item = group === 'epithelial' ? epi : group === 'connective' ? con : group === 'muscle' ? mus : 'neuron';
  const scene = group === 'epithelial'
    ? <svg viewBox="0 0 200 60" role="img" aria-label={`Epithelium for ${e.id}`}>
      {e.id === 'protection' ? [0, 1, 2, 3].map((row) => Array.from({ length: 10 }, (_, k) => <rect key={`${row}-${k}`} x={8 + k * 18 + (row % 2) * 9} y={8 + row * 11} width="17" height={row === 0 ? 6 : 10} fill="#fecaca" stroke="#b91c1c" strokeWidth="0.6" />))
        : Array.from({ length: 10 }, (_, k) => { const h = e.id === 'exchange' ? 6 : e.id === 'secretion' ? 18 : 34; return <g key={k}><rect x={8 + k * 18} y={50 - h} width="17" height={h} fill="#fecaca" stroke="#b91c1c" strokeWidth="0.6" />{(e.id === 'absorption' || e.id === 'sensory') && <line x1={16 + k * 18} y1={50 - h} x2={16 + k * 18} y2={44 - h} stroke="#b91c1c" />}<circle cx={16 + k * 18} cy={50 - h / 2} r="1.8" fill="#7f1d1d" /></g>; })}
    </svg>
    : group === 'connective' ? <ConnectivePicture id={con} />
      : group === 'muscle' ? <MusclePicture id={mus} />
        : <svg viewBox="0 0 220 80" role="img" aria-label="A neuron: dendrites, cell body, axon and nerve endings">
          {[-25, -10, 5, 20].map((a) => <line key={a} x1="35" y1="35" x2={35 - 25 * Math.cos((a * Math.PI) / 180)} y2={35 + 25 * Math.sin((a * Math.PI) / 180) - 10} stroke="#a78bfa" strokeWidth="2" />)}
          <circle cx="35" cy="35" r="12" fill="#c4b5fd" /><circle cx="35" cy="35" r="4" fill="#4c1d95" />
          <line x1="47" y1="35" x2="185" y2="35" stroke="#a78bfa" strokeWidth="3" />
          {[-12, 0, 12].map((d) => <line key={d} x1="185" y1="35" x2="205" y2={35 + d} stroke="#a78bfa" strokeWidth="2" />)}
          <text x="10" y="74" fontSize="9" fill={TXT}>dendrites · cell body</text><text x="110" y="52" fontSize="9" textAnchor="middle" fill={TXT}>axon</text><text x="214" y="74" fontSize="9" textAnchor="end" fill={TXT}>endings</text>
        </svg>;
  return (
    <LabStage testId="animal-tissues" alt={alt} data={{ 'data-group': group, 'data-item': item }}
      question="How does the structure of each animal tissue suit its job?"
      sceneNote="Simplified drawings · not to scale"
      scene={scene}
      controls={q.editable ? <>
        <LabChoice name="tissue-group" label="Tissue" value={group} options={[{ id: 'epithelial', label: 'Epithelial' }, { id: 'connective', label: 'Connective' }, { id: 'muscle', label: 'Muscle' }, { id: 'nervous', label: 'Nervous' }]} onChange={(v) => setGroup(v as Group)} />
        {group === 'epithelial' && <LabChoice name="epithelium" label="Job" value={epi} options={EPITHELIA.map((x) => ({ id: x.id, label: x.id[0].toUpperCase() + x.id.slice(1) }))} onChange={setEpi} />}
        {group === 'connective' && <LabChoice name="connective" label="Connective tissue" value={con} options={CONNECTIVE.map((x) => ({ id: x.id, label: x.name }))} onChange={setCon} />}
        {group === 'muscle' && <LabChoice name="muscle" label="Muscle" value={mus} options={(Object.keys(MUSCLES) as MuscleId[]).map((k) => ({ id: k, label: MUSCLE_LABEL[k] }))} onChange={(v) => setMus(v as MuscleId)} />}
      </> : undefined}
      observation={<>
        {group === 'epithelial' && <><p className="m-0 text-base font-bold" data-testid="animal-tissue-name">{e.job}</p><p className="m-0">Structure: {e.structure}. Found in: {e.where}.</p></>}
        {group === 'connective' && <><p className="m-0 text-base font-bold" data-testid="animal-tissue-name">{c.name}</p><p className="m-0">Matrix: {c.matrix}. {c.job}</p><p className="m-0 text-slate-400">Feel it: {c.feel}.</p></>}
        {group === 'muscle' && <><p className="m-0 text-base font-bold" data-testid="animal-tissue-name">{MUSCLE_LABEL[mus]} muscle: {m.control}</p><p className="m-0">{m.shape}; {m.nuclei === 'many' ? 'many nuclei' : 'one nucleus'}; {m.striations === 'none' ? 'no striations' : `${m.striations === 'faint' ? 'faint' : 'clear'} striations`}. Found: {m.where}.</p></>}
        {group === 'nervous' && <><p className="m-0 text-base font-bold" data-testid="animal-tissue-name">The neuron</p><ul className="m-0 pl-4 list-disc">{NEURON_PARTS.map((p) => <li key={p.id}><strong>{p.name}</strong>: {p.job}.</li>)}</ul></>}
      </>}
      finding={{ label: group === 'nervous' ? 'Nervous tissue' : group === 'epithelial' ? `Epithelium: ${e.id}` : group === 'connective' ? c.name : `${MUSCLE_LABEL[mus]} muscle`, value: group === 'epithelial' ? e.structure : group === 'connective' ? c.job : group === 'muscle' ? m.control : 'carries messages as electrical signals' }}
    />
  );
};

// ---------- Joints ----------

const MOVES: { id: Movement; label: string }[] = [{ id: 'bend', label: 'Bend' }, { id: 'sideways', label: 'Swing sideways' }, { id: 'circle', label: 'Full circle' }, { id: 'turn', label: 'Turn side to side' }];
const BONE = '#e7e5e4', CART = '#93c5fd';

/** Each joint drawn differently: a hinge with its pin, a ring turning on a peg, a ball in a cup, or interlocking skull plates. */
const JointPicture: React.FC<{ joint: JointId; move: Movement; ok: boolean; pose: boolean }> = ({ joint, move, ok, pose }) => {
  const jx = 150, jy = 104;
  const moving = ok && pose;
  const angle = !moving ? 0 : move === 'bend' ? -45 : move === 'sideways' ? 40 : 0;
  const rot = { transform: `rotate(${angle}deg)`, transformOrigin: `${jx}px ${jy}px`, transition: 'transform .6s ease' };
  if (joint === 'fixed') {
    return (
      <g>
        <path d="M 40 60 Q 160 0 280 60 L 280 150 L 40 150 Z" fill={BONE} opacity="0.85" />
        <path d="M 160 22 l 8 12 l -10 10 l 10 12 l -10 12 l 10 12 l -8 12 l 8 12 l -8 14 l 8 12 l -8 14" fill="none" stroke="#57534e" strokeWidth="2.5" />
        <text x="172" y="176" fontSize="13" fill={TXT}>skull bones joined by a suture</text>
      </g>
    );
  }
  if (joint === 'pivot') {
    const turn = moving && move === 'turn' ? 40 : 0;
    return (
      <g>
        <rect x="140" y="120" width="20" height="70" rx="6" fill={BONE} />
        <text x="168" y="180" fontSize="12" fill={MUTED}>backbone (peg)</text>
        <ellipse cx="150" cy="104" rx="70" ry="24" fill="none" stroke="#475569" strokeDasharray="4 4" />
        <g style={{ transform: `rotate(${turn}deg)`, transformOrigin: '150px 104px', transition: 'transform .6s ease' }}>
          <ellipse cx="150" cy="104" rx="36" ry="14" fill="none" stroke={BONE} strokeWidth="8" />
          <path d="M 186 104 L 214 104" stroke="#fbbf24" strokeWidth="3" />
          <text x="218" y="100" fontSize="12" fill="#fde68a">facing</text>
        </g>
        <circle cx="150" cy="104" r="7" fill={CART} />
        <text x="150" y="60" fontSize="12" textAnchor="middle" fill={MUTED}>ring of the top vertebra turns on the peg</text>
      </g>
    );
  }
  return (
    <g>
      <rect x="20" y={jy - 10} width={jx - 36} height="20" rx="10" fill={BONE} />
      {joint === 'hinge' && <>
        <rect x={jx - 18} y={jy - 16} width="36" height="32" rx="8" fill={BONE} />
        <circle cx={jx} cy={jy} r="5" fill="#57534e" /><text x={jx} y={jy + 34} fontSize="12" textAnchor="middle" fill={MUTED}>hinge pin: one plane only</text>
      </>}
      {joint === 'ball-socket' && <>
        <path d={`M ${jx - 4} ${jy - 22} A 22 22 0 0 0 ${jx - 4} ${jy + 22}`} fill="none" stroke={BONE} strokeWidth="9" />
        <text x={jx - 14} y={jy + 40} fontSize="12" textAnchor="middle" fill={MUTED}>socket (cup)</text>
        {moving && move === 'circle' && <ellipse cx={jx + 90} cy={jy} rx="18" ry="54" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="5 4" className="lab-anim-flow" />}
      </>}
      <g style={rot}>
        <rect x={jx + 10} y={jy - 10} width="120" height="20" rx="10" fill={BONE} />
        {joint === 'ball-socket' && <circle cx={jx + 4} cy={jy} r="15" fill={BONE} stroke="#a8a29e" />}
      </g>
      {joint === 'ball-socket' && <text x={jx + 30} y={jy - 22} fontSize="12" fill={MUTED}>ball</text>}
      {moving && move === 'bend' && <path d={`M ${jx + 110} ${jy - 18} A 110 110 0 0 0 ${jx + 74} ${jy - 82}`} fill="none" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#jt-head)" />}
      {moving && move === 'sideways' && <path d={`M ${jx + 110} ${jy + 18} A 110 110 0 0 1 ${jx + 80} ${jy + 76}`} fill="none" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#jt-head)" />}
    </g>
  );
};

export const JointsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { joint?: JointId; editable?: boolean };
  const [joint, setJoint] = useState<JointId>(q.joint ?? 'ball-socket');
  const [move, setMove] = useState<Movement>('bend');
  const [pose, setPose] = useState(!q.editable);
  const j = JOINTS[joint];
  const ok = canMove(joint, move);
  const tried = pose;
  const scene = (
    <svg viewBox="0 0 320 200" role="img" aria-label={`${j.name}: ${MOVES.find((m) => m.id === move)!.label.toLowerCase()} is ${ok ? 'allowed' : 'not possible'}.`}>
      <defs><marker id="jt-head" markerUnits="userSpaceOnUse" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#34d399" /></marker></defs>
      <text x="8" y="20" fontSize="14" fill="#fff" fontWeight="700">{j.name}</text>
      <text x="8" y="38" fontSize="12" fill={MUTED}>{j.examples}{move === 'sideways' && joint === 'ball-socket' ? ' · seen from the front' : ''}</text>
      <JointPicture joint={joint} move={move} ok={ok} pose={pose} />
      {tried && !ok && <g><circle cx="282" cy="40" r="16" fill="none" stroke="#f87171" strokeWidth="3" /><line x1="271" y1="29" x2="293" y2="51" stroke="#f87171" strokeWidth="3" /><text x="282" y="72" fontSize="12" textAnchor="middle" fill="#fca5a5">blocked</text></g>}
      {tried && ok && <text x="312" y="24" fontSize="12" textAnchor="end" fill="#6ee7b7">✓ moves</text>}
    </svg>
  );
  return (
    <LabStage testId="joints" alt={alt} data={{ 'data-joint': joint, 'data-movement': move, 'data-allowed': ok ? 'true' : 'false', 'data-tried': String(tried) }}
      question="Which movements does each kind of joint allow?"
      sceneNote="Simplified · not to scale"
      scene={scene}
      actions={q.editable ? <LabButton primary icon="pan_tool" data-action="try-move" onClick={() => setPose((p) => !p)}>{pose ? 'Back to rest' : 'Try the movement'}</LabButton> : undefined}
      controls={q.editable ? <>
        <LabChoice name="joint" label="Joint" value={joint} options={(Object.keys(JOINTS) as JointId[]).map((k) => ({ id: k, label: JOINTS[k].name.replace(' joint', '') }))} onChange={(v) => { setJoint(v as JointId); setPose(false); }} />
        <LabChoice name="movement" label="Movement" value={move} options={MOVES} onChange={(v) => { setMove(v as Movement); setPose(false); }} />
      </> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="joint-name">{j.name} ({j.examples})</p>
        <p className="m-0" data-testid="joint-result">{MOVES.find((m) => m.id === move)!.label}: <strong>{tried ? (ok ? 'allowed' : 'not possible') : 'try it to find out'}</strong>. {tried ? `This joint ${j.picture}.` : ''}</p>
      </>}
      explanation={<p className="m-0">The shape of the bone ends decides the movement. Joints do not move bones by themselves: muscles pull on the bones through tendons, and ligaments hold the bones together.</p>}
      finding={tried ? { label: `${j.name}: ${MOVES.find((m) => m.id === move)!.label.toLowerCase()}`, value: ok ? 'allowed' : 'not possible' } : null}
    />
  );
};

export const TISSUE_VISUALS: VisualRegistry = { rootGrowth: RootGrowthVisual, treeRings: TreeRingsVisual, plantTissues: PlantTissuesVisual, animalTissues: AnimalTissuesVisual, joints: JointsVisual };
