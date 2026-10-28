/**
 * Figures and laboratory investigations for Chapter 3 (Tissues in Action): the onion root experiment, tree rings, a stem
 * cross-section, animal tissues and joints. Every number comes from `engine/biology/tissues/model.ts`. Diagrams are simplified
 * and not to scale; every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  CONNECTIVE, EPITHELIA, JOINTS, MUSCLES, NEURON_PARTS, PLANT_TISSUES, TEAK_DATA, canMove, isComplex, plantTissue, ringsForAge, rootLength,
  type JointId, type Movement, type MuscleId, type PlantTissueId,
} from '../../../engine/biology/tissues/model';

// ---------- Root growth (Activity 3.1) ----------

export const RootGrowthVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { cutDay?: number | null; editable?: boolean };
  const [cutDay, setCutDay] = useState<number | null>(q.cutDay === undefined ? 3 : q.cutDay);
  const days = [1, 2, 3, 4, 5, 6, 7];
  const a = days.map((d) => rootLength(d, null));
  const b = days.map((d) => rootLength(d, cutDay));
  const x = (d: number) => 30 + (d - 1) * 30;
  const y = (cm: number) => 130 - cm * 18;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'} ${x(i + 1)} ${y(v)}`).join(' ');
  return (
    <div className="space-y-3 p-3" data-testid="root-growth" data-cut-day={cutDay ?? 'none'} data-a7={fmtNum(a[6], 2)} data-b7={fmtNum(b[6], 2)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 230 150" className="w-full max-w-[360px] mx-auto block" aria-hidden>
          <line x1="30" y1="130" x2="215" y2="130" stroke="#64748b" /><line x1="30" y1="130" x2="30" y2="15" stroke="#64748b" />
          {days.map((d) => <text key={d} x={x(d)} y="143" fontSize="8" textAnchor="middle" fill="#94a3b8">{d}</text>)}
          {[0, 2, 4, 6].map((cm) => <text key={cm} x="24" y={y(cm) + 3} fontSize="8" textAnchor="end" fill="#94a3b8">{cm}</text>)}
          <path d={path(a)} fill="none" stroke="#34d399" strokeWidth="2.5" />
          <path d={path(b)} fill="none" stroke="#f472b6" strokeWidth="2.5" strokeDasharray="5 3" />
          {cutDay !== null && <text x={x(cutDay)} y={y(b[cutDay - 1]) + 14} fontSize="8" fill="#f472b6" textAnchor="middle">tips cut</text>}
        </svg>
        <p className="text-sm text-white" data-testid="root-growth-result">Day 7: jar A (tips intact) <strong>{fmtNum(a[6], 1)} cm</strong>; jar B {cutDay === null ? '(tips intact)' : `(tips cut on day ${cutDay})`} <strong>{fmtNum(b[6], 1)} cm</strong>. {cutDay === null ? 'Both keep growing.' : 'After the tips are cut, jar B’s roots stop getting longer: the dividing cells were at the tips.'}</p>
        <table className="w-full text-xs text-slate-200"><thead><tr><th className="text-left font-normal text-slate-400">Day</th>{days.map((d) => <th key={d} className="font-normal text-slate-400">{d}</th>)}</tr></thead>
          <tbody><tr><td>A (cm)</td>{a.map((v, i) => <td key={i} className="text-center">{fmtNum(v, 1)}</td>)}</tr><tr><td>B (cm)</td>{b.map((v, i) => <td key={i} className="text-center">{fmtNum(v, 1)}</td>)}</tr></tbody></table>
        <p className="text-xs text-slate-400">Green line: jar A. Pink dashed line: jar B. Growth of about 0.9 cm a day is an illustrative value.</p>
      </div>
      {q.editable && <div className={labCard}><LabChoice name="cut-day" label="Cut jar B’s root tips on" value={cutDay === null ? 'none' : String(cutDay)} options={[{ id: 'none', label: 'Never' }, ...[2, 3, 4, 5].map((d) => ({ id: String(d), label: `Day ${d}` }))]} onChange={(v) => setCutDay(v === 'none' ? null : Number(v))} /></div>}
    </div>
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
  return (
    <div className="space-y-3 p-3" data-testid="tree-rings" data-rings={rings} data-diameter={fmtNum(dia, 1)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 200" className="w-full max-w-[260px] mx-auto block" aria-hidden>
          <circle cx="100" cy="100" r="92" fill="#78350f" />
          {Array.from({ length: rings }, (_, i) => { const r = 6 + (84 * diameterAt(i + 1)) / diameterAt(Math.max(rings, 1)); return <circle key={i} cx="100" cy="100" r={Math.min(88, r)} fill="none" stroke={i % 2 ? '#fcd34d' : '#d97706'} strokeWidth={i % 3 === 0 ? 1.2 : 0.7} />; })}
          <circle cx="100" cy="100" r="3" fill="#451a03" />
        </svg>
        <p className="text-sm text-white" data-testid="tree-rings-result">A teak tree aged {age} years: <strong>{rings} annual rings</strong>, trunk about <strong>{fmtNum(dia, 1)} cm</strong> across at breast height.</p>
        <table className="w-full text-xs text-slate-200"><thead><tr><th className="text-left font-normal text-slate-400">Age (years)</th><th className="font-normal text-slate-400">Diameter (cm)</th><th className="font-normal text-slate-400">Rings</th></tr></thead>
          <tbody>{TEAK_DATA.map((r) => <tr key={r.age}><td>{r.age}</td><td className="text-center">{r.dbhCm}</td><td className="text-center">{r.rings}</td></tr>)}</tbody></table>
        <p className="text-xs text-slate-400">Data from Table 3.7. The lateral meristem adds one ring of wood each year; wide rings mean good growing years.</p>
      </div>
      {q.editable && <div className={labCard}><LabSlider id="ring-age" label="Age of the tree" value={age} min={1} max={40} step={1} unit="years" onChange={setAge} /></div>}
    </div>
  );
};

// ---------- Stem cross-section ----------

export const PlantTissuesVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { tissue?: PlantTissueId; editable?: boolean };
  const [id, setId] = useState<PlantTissueId>(q.tissue ?? 'epidermis');
  const t = plantTissue(id);
  const hl = (x: PlantTissueId) => (x === id ? '#facc15' : undefined);
  const bundles = Array.from({ length: 8 }, (_, i) => (i * 2 * Math.PI) / 8);
  return (
    <div className="space-y-3 p-3" data-testid="plant-tissues" data-tissue={id} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 200" className="w-full max-w-[280px] mx-auto block" aria-hidden>
          <circle cx="100" cy="100" r="92" fill="#d9f99d" stroke={hl('epidermis') ?? '#3f6212'} strokeWidth={hl('epidermis') ? 5 : 3} />
          <circle cx="100" cy="100" r="84" fill="none" stroke={hl('collenchyma') ?? '#65a30d'} strokeWidth={hl('collenchyma') ? 8 : 6} opacity="0.7" />
          <circle cx="100" cy="100" r="78" fill={hl('parenchyma') ? '#fef08a' : '#ecfccb'} />
          <circle cx="100" cy="100" r="52" fill="none" stroke={hl('meristem') ?? '#a3a3a3'} strokeWidth={hl('meristem') ? 3 : 1} strokeDasharray="3 2" />
          {bundles.map((a, i) => { const cx = 100 + 52 * Math.cos(a), cy = 100 + 52 * Math.sin(a); return (
            <g key={i}>
              <circle cx={100 + 66 * Math.cos(a)} cy={100 + 66 * Math.sin(a)} r="6" fill={hl('sclerenchyma') ?? '#a16207'} />
              <circle cx={100 + 58 * Math.cos(a)} cy={100 + 58 * Math.sin(a)} r="6" fill={hl('phloem') ?? '#22c55e'} />
              <circle cx={100 + 45 * Math.cos(a)} cy={100 + 45 * Math.sin(a)} r="7" fill={hl('xylem') ?? '#1d4ed8'} />
              <circle cx={cx} cy={cy} r="1" fill="#525252" />
            </g>
          ); })}
        </svg>
        <p className="text-base font-bold text-white" data-testid="plant-tissue-name">{t.name}</p>
        <p className="text-sm text-slate-200">{t.job}</p>
        <p className="text-xs text-slate-300">{t.group === 'meristematic' ? 'Meristematic' : t.group === 'protective' ? 'Protective' : t.group === 'simple permanent' ? 'Simple permanent' : 'Complex permanent'} tissue{t.group.includes('permanent') ? ` (${isComplex(t) ? 'several kinds of cell' : 'one kind of cell'})` : ''}; cells {t.living}; {t.wall}. Found in: {t.where}. Tissue system: {t.system}.</p>
        <p className="text-xs text-slate-400">A simplified cross-section of a young dicot stem such as sunflower. Blue: xylem; green: phloem; brown caps: sclerenchyma; dashed ring: lateral meristem. Not to scale.</p>
      </div>
      {q.editable && <div className={labCard}><LabChoice name="plant-tissue" label="Tissue" value={id} options={PLANT_TISSUES.map((p) => ({ id: p.id, label: p.name.replace(' tissue', '') }))} onChange={(v) => setId(v as PlantTissueId)} /></div>}
    </div>
  );
};

// ---------- Animal tissues ----------

type Group = 'epithelial' | 'connective' | 'muscle' | 'nervous';
const MUSCLE_LABEL: Record<MuscleId, string> = { skeletal: 'Skeletal', smooth: 'Smooth', cardiac: 'Cardiac' };

const MusclePicture: React.FC<{ id: MuscleId }> = ({ id }) => (
  <svg viewBox="0 0 200 80" className="w-full max-w-[320px] mx-auto block" aria-hidden>
    {id === 'skeletal' && [12, 32, 52].map((y) => <g key={y}><rect x="10" y={y} width="180" height="16" rx="8" fill="#fca5a5" />{Array.from({ length: 22 }, (_, k) => <line key={k} x1={18 + k * 8} y1={y + 2} x2={18 + k * 8} y2={y + 14} stroke="#b91c1c" strokeWidth="1" />)}{[40, 100, 160].map((x) => <ellipse key={x} cx={x} cy={y + 8} rx="4" ry="2.5" fill="#7f1d1d" />)}</g>)}
    {id === 'smooth' && [20, 50].map((y) => [20, 75, 130].map((x) => <g key={`${x}${y}`}><path d={`M ${x} ${y} Q ${x + 25} ${y - 10} ${x + 50} ${y} Q ${x + 25} ${y + 10} ${x} ${y}`} fill="#fda4af" /><ellipse cx={x + 25} cy={y} rx="4" ry="2" fill="#7f1d1d" /></g>))}
    {id === 'cardiac' && <g><path d="M10 25 H190 M10 55 H190 M60 25 L90 55 M130 25 L150 55" stroke="#fca5a5" strokeWidth="14" strokeLinecap="round" />{[40, 110, 170].map((x) => <ellipse key={x} cx={x} cy="25" rx="4" ry="2.5" fill="#7f1d1d" />)}{Array.from({ length: 22 }, (_, k) => <line key={k} x1={14 + k * 8} y1="20" x2={14 + k * 8} y2="30" stroke="#b91c1c" strokeWidth="0.5" opacity="0.6" />)}</g>}
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
  return (
    <div className="space-y-3 p-3" data-testid="animal-tissues" data-group={group} data-item={item} aria-label={alt}>
      <div className={labCard}>
        {group === 'epithelial' && <>
          <svg viewBox="0 0 200 60" className="w-full max-w-[320px] mx-auto block" aria-hidden>
            {e.id === 'protection' ? [0, 1, 2, 3].map((row) => Array.from({ length: 10 }, (_, k) => <rect key={`${row}-${k}`} x={8 + k * 18 + (row % 2) * 9} y={8 + row * 11} width="17" height={row === 0 ? 6 : 10} fill="#fecaca" stroke="#b91c1c" strokeWidth="0.6" />))
              : Array.from({ length: 10 }, (_, k) => { const h = e.id === 'exchange' ? 6 : e.id === 'secretion' ? 18 : 34; return <g key={k}><rect x={8 + k * 18} y={50 - h} width="17" height={h} fill="#fecaca" stroke="#b91c1c" strokeWidth="0.6" />{(e.id === 'absorption' || e.id === 'sensory') && <line x1={16 + k * 18} y1={50 - h} x2={16 + k * 18} y2={44 - h} stroke="#b91c1c" />}<circle cx={16 + k * 18} cy={50 - h / 2} r="1.8" fill="#7f1d1d" /></g>; })}
          </svg>
          <p className="text-base font-bold text-white" data-testid="animal-tissue-name">{e.job}</p>
          <p className="text-sm text-slate-200">Structure: {e.structure}. Found in: {e.where}.</p>
        </>}
        {group === 'connective' && <>
          <p className="text-base font-bold text-white" data-testid="animal-tissue-name">{c.name}</p>
          <p className="text-sm text-slate-200">Matrix: {c.matrix}. {c.job}</p>
          <p className="text-xs text-slate-400">Feel it: {c.feel}.</p>
        </>}
        {group === 'muscle' && <>
          <MusclePicture id={mus} />
          <p className="text-base font-bold text-white" data-testid="animal-tissue-name">{MUSCLE_LABEL[mus]} muscle: {m.control}</p>
          <p className="text-sm text-slate-200">{m.shape}; {m.nuclei === 'many' ? 'many nuclei' : 'one nucleus'}; {m.striations === 'none' ? 'no striations' : `${m.striations === 'faint' ? 'faint' : 'clear'} striations`}. Found: {m.where}.</p>
        </>}
        {group === 'nervous' && <>
          <svg viewBox="0 0 220 70" className="w-full max-w-[340px] mx-auto block" aria-hidden>
            {[-25, -10, 5, 20].map((a) => <line key={a} x1="35" y1="35" x2={35 - 25 * Math.cos((a * Math.PI) / 180)} y2={35 + 25 * Math.sin((a * Math.PI) / 180) - 10} stroke="#a78bfa" strokeWidth="2" />)}
            <circle cx="35" cy="35" r="12" fill="#c4b5fd" /><circle cx="35" cy="35" r="4" fill="#4c1d95" />
            <line x1="47" y1="35" x2="185" y2="35" stroke="#a78bfa" strokeWidth="3" />
            {[-12, 0, 12].map((d) => <line key={d} x1="185" y1="35" x2="205" y2={35 + d} stroke="#a78bfa" strokeWidth="2" />)}
          </svg>
          <p className="text-base font-bold text-white" data-testid="animal-tissue-name">The neuron</p>
          <ul className="text-sm text-slate-200 list-disc pl-5">{NEURON_PARTS.map((p) => <li key={p.id}><strong>{p.name}</strong>: {p.job}.</li>)}</ul>
        </>}
        <p className="text-xs text-slate-400">Simplified drawings, not to scale.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="tissue-group" label="Tissue" value={group} options={[{ id: 'epithelial', label: 'Epithelial' }, { id: 'connective', label: 'Connective' }, { id: 'muscle', label: 'Muscle' }, { id: 'nervous', label: 'Nervous' }]} onChange={(v) => setGroup(v as Group)} />
          {group === 'epithelial' && <LabChoice name="epithelium" label="Job" value={epi} options={EPITHELIA.map((x) => ({ id: x.id, label: x.id[0].toUpperCase() + x.id.slice(1) }))} onChange={setEpi} />}
          {group === 'connective' && <LabChoice name="connective" label="Connective tissue" value={con} options={CONNECTIVE.map((x) => ({ id: x.id, label: x.name }))} onChange={setCon} />}
          {group === 'muscle' && <LabChoice name="muscle" label="Muscle" value={mus} options={(Object.keys(MUSCLES) as MuscleId[]).map((k) => ({ id: k, label: MUSCLE_LABEL[k] }))} onChange={(v) => setMus(v as MuscleId)} />}
        </div>
      )}
    </div>
  );
};

// ---------- Joints ----------

const MOVES: { id: Movement; label: string }[] = [{ id: 'bend', label: 'Bend' }, { id: 'sideways', label: 'Swing sideways' }, { id: 'circle', label: 'Full circle' }, { id: 'turn', label: 'Turn side to side' }];

export const JointsVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { joint?: JointId; editable?: boolean };
  const [joint, setJoint] = useState<JointId>(q.joint ?? 'ball-socket');
  const [move, setMove] = useState<Movement>('bend');
  const j = JOINTS[joint];
  const ok = canMove(joint, move);
  return (
    <div className="space-y-3 p-3" data-testid="joints" data-joint={joint} data-movement={move} data-allowed={ok ? 'true' : 'false'} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 200 120" className="w-full max-w-[300px] mx-auto block" aria-hidden>
          <rect x="20" y="52" width="70" height="16" rx="8" fill="#e5e7eb" />
          {joint === 'ball-socket' && <><path d="M88 46 A16 16 0 0 1 88 74" fill="none" stroke="#e5e7eb" strokeWidth="6" /><circle cx="100" cy="60" r="11" fill="#f5f5f4" /></>}
          {joint === 'hinge' && <><rect x="88" y="50" width="22" height="20" rx="4" fill="#f5f5f4" /><line x1="99" y1="50" x2="99" y2="70" stroke="#a8a29e" /></>}
          {joint === 'pivot' && <><circle cx="100" cy="60" r="10" fill="#f5f5f4" stroke="#a8a29e" /><circle cx="100" cy="60" r="3" fill="#a8a29e" /></>}
          {joint === 'fixed' && <path d="M90 52 l5 4 l-5 4 l5 4 l-5 4" stroke="#a8a29e" fill="none" strokeWidth="2" />}
          <g transform={ok && move === 'bend' ? 'rotate(-35 100 60)' : undefined}><rect x="108" y="52" width="70" height="16" rx="8" fill="#e5e7eb" /></g>
          {ok ? <path d={move === 'circle' ? 'M150 25 a22 22 0 1 1 -1 0' : move === 'turn' ? 'M130 30 q20 -14 40 0' : move === 'sideways' ? 'M150 20 L150 100' : 'M165 40 q-10 -20 -30 -22'} fill="none" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#jt-arrow)" />
            : <g stroke="#f87171" strokeWidth="4"><line x1="130" y1="20" x2="170" y2="50" /><line x1="170" y1="20" x2="130" y2="50" /></g>}
          <defs><marker id="jt-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 z" fill="#34d399" /></marker></defs>
        </svg>
        <p className="text-base font-bold text-white" data-testid="joint-name">{j.name} ({j.examples})</p>
        <p className="text-sm text-slate-200" data-testid="joint-result">{MOVES.find((m) => m.id === move)!.label}: <strong>{ok ? 'allowed' : 'not possible'}</strong>. This joint {j.picture}.</p>
        <p className="text-xs text-slate-400">Joints do not move bones by themselves: muscles pull on the bones through tendons.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="joint" label="Joint" value={joint} options={(Object.keys(JOINTS) as JointId[]).map((k) => ({ id: k, label: JOINTS[k].name.replace(' joint', '') }))} onChange={(v) => setJoint(v as JointId)} />
          <LabChoice name="movement" label="Try a movement" value={move} options={MOVES} onChange={(v) => setMove(v as Movement)} />
        </div>
      )}
    </div>
  );
};

export const TISSUE_VISUALS: VisualRegistry = { rootGrowth: RootGrowthVisual, treeRings: TreeRingsVisual, plantTissues: PlantTissuesVisual, animalTissues: AnimalTissuesVisual, joints: JointsVisual };
