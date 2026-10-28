/**
 * Figures and laboratory investigations for Chapter 12 (Diversity and Classification): the five kingdom key, the plant key, the
 * animal phyla, the classification ladder and a scientific-name checker, plus the shared virtual microscope. Every rule comes
 * from `engine/biology/diversity/model.ts`; the keys are drawn as branching paths that follow the same questions in the same
 * order as the model (a test checks they always end in the model's answer). Organism drawings are simple illustrations.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice } from '../../education/SubjectLabShell';
import { LabStage } from '../../education/LabLayout';
import {
  KINGDOM_FACTS, ORGANISMS, PHYLA, PLANT_GROUPS, RANKS, checkBinomial, classifyKingdom, classifyPlant, lowestSharedRank, organism,
  type OrganismFeatures, type Phylum, type PlantFeatures, type PlantGroup,
} from '../../../engine/biology/diversity/model';
import { MicroscopeVisual } from '../shared/Microscope';

const TXT = '#e2e8f0', MUTED = '#64748b', ON = '#2dd4bf';

// ---------- Branching key (shared drawing) ----------

export interface KeyStep { question: string; answer: string; /** Where the other answer leads (shown greyed). */ otherLeaf?: string; /** The leaf this answer reaches, if the path stops here. */ leaf?: string }

/** Draw a key as a branching path: a spine of questions, each with a side branch; the student's path is highlighted. */
const BranchingKey: React.FC<{ steps: KeyStep[]; remaining: string[]; title: string; result: string }> = ({ steps, remaining, title, result }) => {
  const rowH = 34, top = 30;
  const rows = [...steps.map((s) => ({ ...s, reached: true })), ...remaining.map((q) => ({ question: q, answer: '', reached: false } as KeyStep & { reached: boolean }))];
  const h = top + rows.length * rowH + 12;
  return (
    <svg viewBox={`0 0 320 ${h}`} role="img" aria-label={`${title}. ${steps.map((s) => `${s.question} ${s.answer}`).join('; ')}. Result: ${result}.`}>
      <text x="6" y="18" fontSize="13" fill={TXT} fontWeight="700">{title}</text>
      {rows.map((r, i) => {
        const y = top + i * rowH;
        const reached = (r as { reached: boolean }).reached;
        const col = reached ? ON : MUTED;
        return (
          <g key={i}>
            {i > 0 && <line x1="14" y1={y - rowH + 22} x2="14" y2={y + 4} stroke={reached ? ON : '#334155'} strokeWidth={reached ? 3 : 1.5} />}
            <circle cx="14" cy={y + 12} r="6" fill={reached ? ON : '#1f2937'} stroke={col} />
            <text x="26" y={y + 16} fontSize="12" fill={reached ? TXT : MUTED}>{r.question}{reached ? <tspan fill={ON} fontWeight="700"> {r.answer}</tspan> : null}</text>
            {r.leaf && <><line x1="200" y1={y + 12} x2="214" y2={y + 12} stroke={ON} strokeWidth="3" /><rect x="214" y={y + 1} width="102" height="22" rx="6" fill="#134e4a" stroke={ON} /><text x="265" y={y + 16} fontSize="12" textAnchor="middle" fill="#fff" fontWeight="700">{r.leaf}</text></>}
            {!r.leaf && r.otherLeaf && reached && <><line x1="200" y1={y + 12} x2="214" y2={y + 12} stroke="#334155" strokeDasharray="3 2" /><text x="218" y={y + 16} fontSize="11" fill={MUTED}>else: {r.otherLeaf}</text></>}
          </g>
        );
      })}
    </svg>
  );
};

/** The five kingdom key as a path of questions, in the order `classifyKingdom` asks them. */
export function kingdomPath(f: OrganismFeatures): { steps: KeyStep[]; remaining: string[] } {
  const Q = ['Made of cells?', 'True nucleus?', 'Cell wall of chitin?', 'One cell or many?', 'Any cell wall?', 'Makes its own food?'];
  const steps: KeyStep[] = [];
  const rest = (from: number) => Q.slice(from);
  if (!f.cellular) return { steps: [{ question: Q[0], answer: 'No', leaf: 'none (virus)' }], remaining: [] };
  steps.push({ question: Q[0], answer: 'Yes', otherLeaf: 'not a kingdom' });
  if (f.nucleus === 'none') { steps.push({ question: Q[1], answer: 'No', leaf: 'Monera' }); return { steps, remaining: rest(2) }; }
  steps.push({ question: Q[1], answer: 'Yes', otherLeaf: 'Monera' });
  if (f.wall === 'chitin') { steps.push({ question: Q[2], answer: 'Yes', leaf: 'Fungi' }); return { steps, remaining: rest(3) }; }
  steps.push({ question: Q[2], answer: 'No', otherLeaf: 'Fungi' });
  if (f.cells === 'uni') { steps.push({ question: Q[3], answer: 'One', leaf: 'Protista' }); return { steps, remaining: rest(4) }; }
  steps.push({ question: Q[3], answer: 'Many', otherLeaf: 'Protista' });
  if (f.wall === 'none') { steps.push({ question: Q[4], answer: 'No', leaf: 'Animalia' }); return { steps, remaining: rest(5) }; }
  steps.push({ question: Q[4], answer: 'Yes', otherLeaf: 'Animalia' });
  steps.push(f.nutrition === 'autotrophic' ? { question: Q[5], answer: 'Yes', leaf: 'Plantae' } : { question: Q[5], answer: 'No', leaf: 'Fungi' });
  return { steps, remaining: [] };
}

/** The plant key as a path of questions, in the order `classifyPlant` asks them. */
export function plantPath(f: PlantFeatures): { steps: KeyStep[]; remaining: string[] } {
  const Q = ['Body in parts?', 'Xylem and phloem?', 'Seeds?', 'Seeds inside fruits?'];
  const steps: KeyStep[] = [];
  if (f.body === 'thallus') return { steps: [{ question: Q[0], answer: 'No', leaf: 'Thallophyta' }], remaining: Q.slice(1) };
  steps.push({ question: Q[0], answer: 'Yes', otherLeaf: 'Thallophyta' });
  if (!f.vascular) { steps.push({ question: Q[1], answer: 'No', leaf: 'Bryophyta' }); return { steps, remaining: Q.slice(2) }; }
  steps.push({ question: Q[1], answer: 'Yes', otherLeaf: 'Bryophyta' });
  if (!f.seeds) { steps.push({ question: Q[2], answer: 'No', leaf: 'Pteridophyta' }); return { steps, remaining: Q.slice(3) }; }
  steps.push({ question: Q[2], answer: 'Yes', otherLeaf: 'Pteridophyta' });
  steps.push(f.fruits ? { question: Q[3], answer: 'Yes', leaf: 'Angiosperm' } : { question: Q[3], answer: 'No', leaf: 'Gymnosperm' });
  return { steps, remaining: [] };
}

// ---------- Organism illustrations ----------

const OrganismIcon: React.FC<{ id: string }> = ({ id }) => {
  const g = (() => {
    switch (id) {
      case 'bacterium': return <><rect x="10" y="26" width="44" height="18" rx="9" fill="#fde68a" stroke="#a16207" /><path d="M 54 35 q 6 -6 10 0" fill="none" stroke="#a16207" /></>;
      case 'amoeba': return <path d="M 14 34 q -6 -14 10 -16 q 6 -12 18 -2 q 14 -4 12 10 q 12 8 0 16 q -2 12 -16 8 q -12 8 -18 -4 q -12 -2 -6 -12 z" fill="#93c5fd" opacity="0.8" stroke="#1d4ed8" />;
      case 'euglena': return <><ellipse cx="34" cy="36" rx="22" ry="9" fill="#86efac" stroke="#15803d" /><path d="M 12 34 q -6 -10 -10 -4" fill="none" stroke="#15803d" /><circle cx="22" cy="34" r="2.5" fill="#ef4444" /></>;
      case 'yeast': return <><ellipse cx="28" cy="38" rx="14" ry="11" fill="#fde68a" stroke="#a16207" /><ellipse cx="46" cy="28" rx="7" ry="6" fill="#fde68a" stroke="#a16207" /></>;
      case 'mushroom': return <><path d="M 10 32 Q 34 4 58 32 Z" fill="#fca5a5" stroke="#b91c1c" /><rect x="29" y="32" width="10" height="24" rx="3" fill="#f5f5f4" /></>;
      case 'mango': return <><rect x="30" y="38" width="8" height="22" fill="#78350f" /><circle cx="34" cy="28" r="20" fill="#22c55e" /><ellipse cx="44" cy="34" rx="4" ry="6" fill="#facc15" /></>;
      case 'earthworm': return <path d="M 6 40 q 10 -14 20 0 t 20 0 t 18 -4" fill="none" stroke="#f472b6" strokeWidth="7" strokeLinecap="round" strokeDasharray="6 1.5" />;
      case 'virus': return <><polygon points="34,18 50,27 50,45 34,54 18,45 18,27" fill="#c4b5fd" stroke="#6d28d9" />{[0, 60, 120, 180, 240, 300].map((a) => <line key={a} x1={34 + 18 * Math.cos((a * Math.PI) / 180)} y1={36 + 18 * Math.sin((a * Math.PI) / 180)} x2={34 + 24 * Math.cos((a * Math.PI) / 180)} y2={36 + 24 * Math.sin((a * Math.PI) / 180)} stroke="#6d28d9" strokeWidth="2" />)}</>;
      case 'spirogyra': return <><rect x="6" y="28" width="56" height="14" fill="none" stroke="#15803d" /><path d="M 6 35 q 7 -8 14 0 t 14 0 t 14 0 t 14 0" fill="none" stroke="#22c55e" strokeWidth="2" /></>;
      case 'moss': return <>{[14, 26, 38, 50].map((x) => <g key={x}><line x1={x} y1="58" x2={x} y2="30" stroke="#16a34a" strokeWidth="2" />{[30, 38, 46].map((y) => <path key={y} d={`M ${x} ${y} l -4 4 M ${x} ${y} l 4 4`} stroke="#22c55e" />)}</g>)}</>;
      case 'fern': return <><path d="M 34 60 Q 30 30 50 10" fill="none" stroke="#15803d" strokeWidth="2" />{[0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={36 + i * 2.4 - 8} cy={52 - i * 7.5} rx="7" ry="2.5" fill="#22c55e" transform={`rotate(-25 ${36 + i * 2.4 - 8} ${52 - i * 7.5})`} />)}</>;
      case 'pine': return <><rect x="31" y="46" width="6" height="14" fill="#78350f" /><polygon points="34,8 52,48 16,48" fill="#15803d" /><ellipse cx="44" cy="42" rx="3" ry="5" fill="#a16207" /></>;
      default: return <><circle cx="34" cy="36" r="20" fill="#1e293b" stroke="#94a3b8" strokeDasharray="4 3" /><text x="34" y="42" fontSize="18" textAnchor="middle" fill="#94a3b8">?</text></>;
    }
  })();
  return <svg viewBox="0 0 68 68" className="w-14 h-14 shrink-0" aria-hidden>{g}</svg>;
};

// ---------- Five kingdom key ----------

const ORGANISM_PRESETS: { id: string; label: string; f: OrganismFeatures }[] = [
  { id: 'bacterium', label: 'Bacterium', f: { cellular: true, nucleus: 'none', cells: 'uni', wall: 'other', nutrition: 'heterotrophic' } },
  { id: 'amoeba', label: 'Amoeba', f: { cellular: true, nucleus: 'true', cells: 'uni', wall: 'none', nutrition: 'heterotrophic' } },
  { id: 'euglena', label: 'Euglena', f: { cellular: true, nucleus: 'true', cells: 'uni', wall: 'none', nutrition: 'both' } },
  { id: 'yeast', label: 'Yeast', f: { cellular: true, nucleus: 'true', cells: 'uni', wall: 'chitin', nutrition: 'heterotrophic' } },
  { id: 'mushroom', label: 'Mushroom', f: { cellular: true, nucleus: 'true', cells: 'multi', wall: 'chitin', nutrition: 'heterotrophic' } },
  { id: 'mango', label: 'Mango tree', f: { cellular: true, nucleus: 'true', cells: 'multi', wall: 'cellulose', nutrition: 'autotrophic' } },
  { id: 'earthworm', label: 'Earthworm', f: { cellular: true, nucleus: 'true', cells: 'multi', wall: 'none', nutrition: 'heterotrophic' } },
  { id: 'virus', label: 'Virus', f: { cellular: false, nucleus: 'none', cells: 'uni', wall: 'none', nutrition: 'heterotrophic' } },
];
export const KINGDOM_PRESETS = ORGANISM_PRESETS;

export const KingdomKeyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { preset?: string; editable?: boolean };
  const initial = ORGANISM_PRESETS.find((p) => p.id === q.preset) ?? ORGANISM_PRESETS[0];
  const [preset, setPreset] = useState(initial.id);
  const [f, setF] = useState<OrganismFeatures>(initial.f);
  const r = classifyKingdom(f);
  const path = kingdomPath(f);
  const set = <K extends keyof OrganismFeatures>(k: K, v: OrganismFeatures[K]) => { setPreset('custom'); setF((x) => ({ ...x, [k]: v })); };
  const label = ORGANISM_PRESETS.find((p) => p.id === preset)?.label ?? 'Your organism';
  const result = r.kingdom ? `Kingdom ${r.kingdom}` : 'Not in any of the five kingdoms';
  return (
    <LabStage testId="kingdom-key" alt={alt} data={{ 'data-kingdom': r.kingdom ?? 'none', 'data-organism': preset }}
      question="Which kingdom does this organism belong to? Follow the key one question at a time."
      sceneNote="Illustrations are simplified"
      scene={<>
        <div className="flex items-center gap-2 px-1"><OrganismIcon id={preset} /><strong className="text-white">{label}</strong></div>
        <BranchingKey steps={path.steps} remaining={path.remaining} title="Five kingdom key" result={result} />
      </>}
      controls={q.editable ? <>
        <LabChoice name="organism" label="Organism" value={preset} options={ORGANISM_PRESETS.map((p) => ({ id: p.id, label: p.label }))} onChange={(id) => { const p = ORGANISM_PRESETS.find((x) => x.id === id)!; setPreset(id); setF(p.f); }} />
      </> : undefined}
      more={q.editable ? <>
        <p className="m-0 text-slate-400">Change one feature to see where the path turns.</p>
        <LabChoice name="k-cellular" label="Made of cells?" value={f.cellular ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No (acellular)' }]} onChange={(v) => set('cellular', v === 'yes')} />
        {f.cellular && <LabChoice name="k-nucleus" label="True nucleus?" value={f.nucleus} options={[{ id: 'true', label: 'Yes' }, { id: 'none', label: 'No' }]} onChange={(v) => set('nucleus', v as OrganismFeatures['nucleus'])} />}
        {f.cellular && f.nucleus === 'true' && <>
          <LabChoice name="k-cells" label="Number of cells" value={f.cells} options={[{ id: 'uni', label: 'One' }, { id: 'multi', label: 'Many' }]} onChange={(v) => set('cells', v as OrganismFeatures['cells'])} />
          <LabChoice name="k-wall" label="Cell wall" value={f.wall} options={[{ id: 'none', label: 'None' }, { id: 'cellulose', label: 'Cellulose' }, { id: 'chitin', label: 'Chitin' }, { id: 'other', label: 'Other' }]} onChange={(v) => set('wall', v as OrganismFeatures['wall'])} />
          <LabChoice name="k-nutrition" label="Nutrition" value={f.nutrition} options={[{ id: 'autotrophic', label: 'Makes its own food' }, { id: 'heterotrophic', label: 'Depends on others' }, { id: 'both', label: 'Both' }]} onChange={(v) => set('nutrition', v as OrganismFeatures['nutrition'])} />
        </>}
      </> : undefined}
      moreTitle="Change the features"
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="kingdom-result">{result}</p>
        <ol className="m-0 pl-5 list-decimal" data-testid="kingdom-steps">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </>}
      explanation={r.kingdom ? <p className="m-0">{r.kingdom}: {KINGDOM_FACTS[r.kingdom].cells}; {KINGDOM_FACTS[r.kingdom].nucleus}; wall: {KINGDOM_FACTS[r.kingdom].wall}; {KINGDOM_FACTS[r.kingdom].nutrition}. Examples: {KINGDOM_FACTS[r.kingdom].examples}.</p> : <p className="m-0">Viruses have no cells: they can only multiply inside living cells, so the five kingdom system leaves them out.</p>}
      explanationTitle="About this kingdom"
      finding={{ label: label, value: result }}
    />
  );
};

// ---------- Plant key ----------

const PLANT_PRESETS: { id: string; label: string; f: PlantFeatures }[] = [
  { id: 'spirogyra', label: 'Spirogyra', f: { body: 'thallus', vascular: false, seeds: false, fruits: false } },
  { id: 'moss', label: 'Moss', f: { body: 'simple parts', vascular: false, seeds: false, fruits: false } },
  { id: 'fern', label: 'Fern', f: { body: 'roots, stems and leaves', vascular: true, seeds: false, fruits: false } },
  { id: 'pine', label: 'Pine', f: { body: 'roots, stems and leaves', vascular: true, seeds: true, fruits: false } },
  { id: 'mango', label: 'Mango', f: { body: 'roots, stems and leaves', vascular: true, seeds: true, fruits: true } },
];
export const PLANT_KEY_PRESETS = PLANT_PRESETS;

export const PlantKeyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { preset?: string; editable?: boolean };
  const initial = PLANT_PRESETS.find((p) => p.id === q.preset) ?? PLANT_PRESETS[2];
  const [preset, setPreset] = useState(initial.id);
  const [f, setF] = useState<PlantFeatures>(initial.f);
  const g: PlantGroup = classifyPlant(f);
  const info = PLANT_GROUPS[g];
  const path = plantPath(f);
  const set = <K extends keyof PlantFeatures>(k: K, v: PlantFeatures[K]) => { setPreset('custom'); setF((x) => ({ ...x, [k]: v })); };
  const label = PLANT_PRESETS.find((p) => p.id === preset)?.label ?? 'Your plant';
  return (
    <LabStage testId="plant-key" alt={alt} data={{ 'data-group': g }}
      question="Which group does this plant belong to?"
      sceneNote="Illustrations are simplified"
      scene={<>
        <div className="flex items-center gap-2 px-1"><OrganismIcon id={preset} /><strong className="text-white">{label}</strong></div>
        <BranchingKey steps={path.steps} remaining={path.remaining} title="Plant key" result={g} />
      </>}
      controls={q.editable ? <LabChoice name="plant" label="Plant" value={preset} options={PLANT_PRESETS.map((p) => ({ id: p.id, label: p.label }))} onChange={(id) => { const p = PLANT_PRESETS.find((x) => x.id === id)!; setPreset(id); setF(p.f); }} /> : undefined}
      more={q.editable ? <>
        <LabChoice name="p-body" label="Body" value={f.body} options={[{ id: 'thallus', label: 'Thallus' }, { id: 'simple parts', label: 'Simple parts, rhizoids' }, { id: 'roots, stems and leaves', label: 'True roots, stems, leaves' }]} onChange={(v) => set('body', v as PlantFeatures['body'])} />
        <LabChoice name="p-vascular" label="Xylem and phloem?" value={f.vascular ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('vascular', v === 'yes')} />
        <LabChoice name="p-seeds" label="Seeds?" value={f.seeds ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('seeds', v === 'yes')} />
        <LabChoice name="p-fruits" label="Seeds inside fruits?" value={f.fruits ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('fruits', v === 'yes')} />
      </> : undefined}
      moreTitle="Change the features"
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="plant-key-result">{g}</p>
        <p className="m-0">{info.features}. Example: {info.example}.</p>
      </>}
      explanation={<p className="m-0">Name: {info.meaning}. Needs water for reproduction: {info.needsWaterToReproduce ? 'yes' : 'no'}. The key asks first about the body, then the transport tissue, then seeds, then fruits, the same order in which these features appeared in plant evolution.</p>}
      finding={{ label, value: g }}
    />
  );
};

// ---------- Animal phyla ----------

const LEVELS = ['cellular', 'tissue', 'organ', 'organ system'] as const;

export const AnimalPhylaVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { phylum?: Phylum; editable?: boolean };
  const [phylum, setPhylum] = useState<Phylum>(q.phylum ?? 'Porifera');
  const p = PHYLA[phylum];
  const at = LEVELS.indexOf(p.level);
  const scene = (
    <div className="p-1 space-y-2">
      <p className="m-0 text-sm text-slate-300">Level of organisation</p>
      <ol className="lab-levels" aria-label={`Level of organisation: ${p.level}`} data-testid="phylum-level">
        {LEVELS.map((lv, i) => (
          <li key={lv} data-level={lv} aria-current={i === at ? 'true' : undefined} className={i === at ? 'is-current' : i < at ? 'is-below' : ''}>
            <span aria-hidden className="material-symbols-outlined text-[18px]">{i === at ? 'radio_button_checked' : i < at ? 'check' : 'radio_button_unchecked'}</span>{lv}
          </li>
        ))}
      </ol>
      <dl className="lab-readout">
        <div><dt>Skeleton</dt><dd className="text-sm">{p.skeleton === 'none' ? 'none' : p.skeleton}</dd></div>
        <div><dt>Habitat</dt><dd className="text-sm">{p.habitat}</dd></div>
      </dl>
    </div>
  );
  return (
    <LabStage testId="animal-phyla" alt={alt} data={{ 'data-phylum': phylum, 'data-level': p.level }}
      question="How do the non-chordate phyla differ in body organisation?"
      scene={scene}
      controls={q.editable ? <LabChoice name="phylum" label="Phylum" value={phylum} options={(Object.keys(PHYLA) as Phylum[]).map((k) => ({ id: k, label: k }))} onChange={(v) => setPhylum(v as Phylum)} /> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="phylum-name">{phylum} <span className="text-sm font-normal text-slate-300">({p.meaning})</span></p>
        <p className="m-0">{p.key}. Examples: {p.examples}.</p>
        <p className="m-0 text-slate-300">Level of organisation: <strong>{p.level}</strong> (step {at + 1} of 4).</p>
      </>}
      explanation={<p className="m-0">The four levels are categories, not amounts: cells working loosely together (cellular), cells forming tissues, tissues forming organs, and organs working together as organ systems. All eight phyla are non-chordates: none has a notochord. Chordates (protochordates and vertebrates: fish, amphibians, reptiles, birds, mammals) have one at some stage.</p>}
      finding={{ label: phylum, value: `${p.level} level; ${p.skeleton === 'none' ? 'no skeleton' : p.skeleton}` }}
    />
  );
};

// ---------- Hierarchy ----------

export const HierarchyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { a?: string; b?: string; editable?: boolean };
  const [a, setA] = useState(q.a ?? 'Tiger');
  const [b, setB] = useState(q.b ?? 'Lion');
  const A = organism(a) ?? ORGANISMS[0], B = organism(b) ?? ORGANISMS[1];
  const shared = lowestSharedRank(A, B);
  const sharedIdx = shared ? RANKS.indexOf(shared) : -1;
  const rowH = 28, top = 14;
  const scene = (
    <svg viewBox={`0 0 320 ${top + RANKS.length * rowH + 6}`} role="img" aria-label={shared ? `${A.common} and ${B.common} share every rank down to the ${shared}, then branch apart.` : `${A.common} and ${B.common} are in different kingdoms.`}>
      {RANKS.map((r, i) => {
        const y = top + i * rowH;
        const same = i <= sharedIdx;
        const italic = r === 'genus' || r === 'species';
        return (
          <g key={r}>
            <text x="4" y={y + 14} fontSize="11" fill="#94a3b8">{r}</text>
            {same
              ? <><rect x="72" y={y} width="244" height="22" rx="6" fill="#134e4a" stroke={ON} /><text x="194" y={y + 15} fontSize="12" textAnchor="middle" fill="#fff" fontStyle={italic ? 'italic' : undefined}>{A[r]}</text></>
              : <><rect x="72" y={y} width="118" height="22" rx="6" fill="#1e293b" stroke="#475569" /><text x="131" y={y + 15} fontSize="12" textAnchor="middle" fill={TXT} fontStyle={italic ? 'italic' : undefined}>{A[r]}</text>
                <rect x="198" y={y} width="118" height="22" rx="6" fill="#1e293b" stroke="#475569" /><text x="257" y={y + 15} fontSize="12" textAnchor="middle" fill={TXT} fontStyle={italic ? 'italic' : undefined}>{B[r]}</text></>}
            {i === sharedIdx && i < RANKS.length - 1 && <path d={`M 194 ${y + 22} L 194 ${y + 25} L 131 ${y + rowH} M 194 ${y + 25} L 257 ${y + rowH}`} fill="none" stroke={ON} strokeWidth="2" />}
          </g>
        );
      })}
    </svg>
  );
  return (
    <LabStage testId="hierarchy" alt={alt} data={{ 'data-shared': shared ?? 'none' }}
      question="How closely related are two organisms? Find the lowest rank they share."
      scene={<>{scene}<p className="m-0 px-1 text-sm text-slate-300">Left: {A.common} · right: {B.common} · one wide box: a rank they share</p></>}
      controls={q.editable ? <>
        <LabChoice name="org-a" label="First organism" value={A.common} options={ORGANISMS.map((o) => ({ id: o.common, label: o.common }))} onChange={setA} />
        <LabChoice name="org-b" label="Second organism" value={B.common} options={ORGANISMS.map((o) => ({ id: o.common, label: o.common }))} onChange={setB} />
      </> : undefined}
      observation={<p className="m-0" data-testid="hierarchy-result">{shared ? <>The {A.common.toLowerCase()} and the {B.common.toLowerCase()} share every rank down to the <strong>{shared}</strong> ({A[shared]}).</> : <>They are in different kingdoms, so they share no rank.</>} The lower the shared rank, the more closely related they are.</p>}
      extra={<table className="lab-notebook__table"><thead><tr><th>Rank</th><th>{A.common}</th><th>{B.common}</th></tr></thead>
        <tbody>{RANKS.map((r, i) => <tr key={r} className={i <= sharedIdx ? 'text-emerald-300' : ''} data-rank={r}><td className="capitalize">{r}</td><td className={r === 'species' || r === 'genus' ? 'italic' : ''}>{A[r]}</td><td className={r === 'species' || r === 'genus' ? 'italic' : ''}>{B[r]}</td></tr>)}</tbody></table>}
      extraTitle="As a table"
      finding={{ label: `${A.common} and ${B.common}`, value: shared ? `share down to ${shared}` : 'different kingdoms' }}
    />
  );
};

// ---------- Binomial names ----------

export const BinomialVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { name?: string; editable?: boolean };
  const [name, setName] = useState(q.name ?? 'panthera Tigris');
  const c = checkBinomial(name);
  return (
    <LabStage testId="binomial" alt={alt} data={{ 'data-ok': c.ok ? 'true' : 'false' }}
      question="Does this scientific name follow the binomial rules?"
      scene={<div className="p-3 text-center">
        {c.ok ? <p className="m-0 text-2xl text-white"><em><span className="underline decoration-teal-400">{c.genus}</span> <span className="underline decoration-amber-400">{c.species}</span></em></p> : <p className="m-0 text-2xl text-white font-mono break-words">{name || '—'}</p>}
        {c.ok && <p className="m-0 mt-2 text-sm text-slate-300"><span className="text-teal-300">genus</span> (capital first letter) · <span className="text-amber-300">species</span> (all small letters)</p>}
      </div>}
      controls={q.editable ? <label htmlFor="binomial-input" className="block text-sm text-slate-200">Type a scientific name
        <input id="binomial-input" value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface" />
      </label> : undefined}
      observation={c.ok
        ? <p className="m-0" data-testid="binomial-result">✓ Correct: <em className="font-bold">{c.genus} {c.species}</em>. Genus <em>{c.genus}</em>, species <em>{c.species}</em>. Print it in italics, or underline it when handwritten.</p>
        : <div data-testid="binomial-result"><p className="m-0">✗ “{name}” does not follow the rules:</p><ul className="m-0 pl-5 list-disc text-amber-200">{c.problems.map((p) => <li key={p}>{p}</li>)}</ul></div>}
      explanation={<p className="m-0">Examples: Panthera tigris (tiger), Mangifera indica (mango), Homo sapiens (human), Nasikabatrachus sahyadrensis (purple frog). The checker can test capital and small letters but not italics, which are a matter of printing.</p>}
      finding={{ label: name, value: c.ok ? 'follows the rules' : c.problems.join('; ') }}
    />
  );
};

export const DIVERSITY_VISUALS: VisualRegistry = { microscope: MicroscopeVisual, kingdomKey: KingdomKeyVisual, plantKey: PlantKeyVisual, animalPhyla: AnimalPhylaVisual, hierarchy: HierarchyVisual, binomial: BinomialVisual };
