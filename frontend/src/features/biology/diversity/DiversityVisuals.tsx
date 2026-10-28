/**
 * Figures and laboratory investigations for Chapter 12 (Diversity and Classification): the five kingdom key, the plant key, the
 * animal phyla, the classification ladder and a scientific-name checker, plus the shared virtual microscope. Every rule comes
 * from `engine/biology/diversity/model.ts`; every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, labCard } from '../../education/SubjectLabShell';
import {
  KINGDOM_FACTS, ORGANISMS, PHYLA, PLANT_GROUPS, RANKS, checkBinomial, classifyKingdom, classifyPlant, lowestSharedRank, organism,
  type OrganismFeatures, type Phylum, type PlantFeatures,
} from '../../../engine/biology/diversity/model';
import { MicroscopeVisual } from '../shared/Microscope';

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

export const KingdomKeyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { preset?: string; editable?: boolean };
  const initial = ORGANISM_PRESETS.find((p) => p.id === q.preset) ?? ORGANISM_PRESETS[0];
  const [preset, setPreset] = useState(initial.id);
  const [f, setF] = useState<OrganismFeatures>(initial.f);
  const r = classifyKingdom(f);
  const set = <K extends keyof OrganismFeatures>(k: K, v: OrganismFeatures[K]) => { setPreset('custom'); setF((x) => ({ ...x, [k]: v })); };
  return (
    <div className="space-y-3 p-3" data-testid="kingdom-key" data-kingdom={r.kingdom ?? 'none'} aria-label={alt}>
      <div className={labCard}>
        <ol className="text-sm text-slate-200 list-decimal pl-5" data-testid="kingdom-steps">{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        <p className="text-base font-bold text-white" data-testid="kingdom-result">{r.kingdom ? `Kingdom ${r.kingdom}` : 'Not in any of the five kingdoms'}</p>
        {r.kingdom && <p className="text-xs text-slate-300">{KINGDOM_FACTS[r.kingdom].cells}; {KINGDOM_FACTS[r.kingdom].nucleus}; wall: {KINGDOM_FACTS[r.kingdom].wall}; {KINGDOM_FACTS[r.kingdom].nutrition}. Examples: {KINGDOM_FACTS[r.kingdom].examples}.</p>}
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="organism" label="Start from an example" value={preset} options={ORGANISM_PRESETS.map((p) => ({ id: p.id, label: p.label }))} onChange={(id) => { const p = ORGANISM_PRESETS.find((x) => x.id === id)!; setPreset(id); setF(p.f); }} />
          <LabChoice name="k-cellular" label="Made of cells?" value={f.cellular ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No (acellular)' }]} onChange={(v) => set('cellular', v === 'yes')} />
          {f.cellular && <LabChoice name="k-nucleus" label="True nucleus?" value={f.nucleus} options={[{ id: 'true', label: 'Yes' }, { id: 'none', label: 'No' }]} onChange={(v) => set('nucleus', v as OrganismFeatures['nucleus'])} />}
          {f.cellular && f.nucleus === 'true' && <>
            <LabChoice name="k-cells" label="Number of cells" value={f.cells} options={[{ id: 'uni', label: 'One' }, { id: 'multi', label: 'Many' }]} onChange={(v) => set('cells', v as OrganismFeatures['cells'])} />
            <LabChoice name="k-wall" label="Cell wall" value={f.wall} options={[{ id: 'none', label: 'None' }, { id: 'cellulose', label: 'Cellulose' }, { id: 'chitin', label: 'Chitin' }, { id: 'other', label: 'Other' }]} onChange={(v) => set('wall', v as OrganismFeatures['wall'])} />
            <LabChoice name="k-nutrition" label="Nutrition" value={f.nutrition} options={[{ id: 'autotrophic', label: 'Makes its own food' }, { id: 'heterotrophic', label: 'Depends on others' }, { id: 'both', label: 'Both' }]} onChange={(v) => set('nutrition', v as OrganismFeatures['nutrition'])} />
          </>}
        </div>
      )}
    </div>
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

export const PlantKeyVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { preset?: string; editable?: boolean };
  const initial = PLANT_PRESETS.find((p) => p.id === q.preset) ?? PLANT_PRESETS[2];
  const [preset, setPreset] = useState(initial.id);
  const [f, setF] = useState<PlantFeatures>(initial.f);
  const g = classifyPlant(f);
  const info = PLANT_GROUPS[g];
  const set = <K extends keyof PlantFeatures>(k: K, v: PlantFeatures[K]) => { setPreset('custom'); setF((x) => ({ ...x, [k]: v })); };
  return (
    <div className="space-y-3 p-3" data-testid="plant-key" data-group={g} aria-label={alt}>
      <div className={labCard}>
        <p className="text-base font-bold text-white" data-testid="plant-key-result">{g}</p>
        <p className="text-sm text-slate-200">{info.features}. Example: {info.example}.</p>
        <p className="text-xs text-slate-300">Name: {info.meaning}. Needs water for reproduction: {info.needsWaterToReproduce ? 'yes' : 'no'}.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="plant" label="Start from an example" value={preset} options={PLANT_PRESETS.map((p) => ({ id: p.id, label: p.label }))} onChange={(id) => { const p = PLANT_PRESETS.find((x) => x.id === id)!; setPreset(id); setF(p.f); }} />
          <LabChoice name="p-body" label="Body" value={f.body} options={[{ id: 'thallus', label: 'Thallus' }, { id: 'simple parts', label: 'Simple parts, rhizoids' }, { id: 'roots, stems and leaves', label: 'True roots, stems, leaves' }]} onChange={(v) => set('body', v as PlantFeatures['body'])} />
          <LabChoice name="p-vascular" label="Xylem and phloem?" value={f.vascular ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('vascular', v === 'yes')} />
          <LabChoice name="p-seeds" label="Seeds?" value={f.seeds ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('seeds', v === 'yes')} />
          <LabChoice name="p-fruits" label="Seeds inside fruits?" value={f.fruits ? 'yes' : 'no'} options={[{ id: 'yes', label: 'Yes' }, { id: 'no', label: 'No' }]} onChange={(v) => set('fruits', v === 'yes')} />
        </div>
      )}
    </div>
  );
};

// ---------- Animal phyla ----------

const LEVEL_WIDTH: Record<string, number> = { cellular: 25, tissue: 50, organ: 75, 'organ system': 100 };

export const AnimalPhylaVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { phylum?: Phylum; editable?: boolean };
  const [phylum, setPhylum] = useState<Phylum>(q.phylum ?? 'Porifera');
  const p = PHYLA[phylum];
  return (
    <div className="space-y-3 p-3" data-testid="animal-phyla" data-phylum={phylum} aria-label={alt}>
      <div className={labCard}>
        <p className="text-base font-bold text-white" data-testid="phylum-name">{phylum} <span className="text-sm font-normal text-slate-300">({p.meaning})</span></p>
        <p className="text-sm text-slate-200">{p.key}. Examples: {p.examples}.</p>
        <p className="text-xs text-slate-300">Habitat: {p.habitat}. Skeleton: {p.skeleton === 'none' ? 'none' : p.skeleton}.</p>
        <div><p className="text-xs text-slate-400">Level of organisation: {p.level}</p><span className="block h-2 rounded bg-surface"><span className="block h-2 rounded bg-teal-400" style={{ width: `${LEVEL_WIDTH[p.level]}%` }} /></span></div>
        <p className="text-xs text-slate-400">All eight are non-chordates: none has a notochord. Chordates (protochordates and vertebrates: fish, amphibians, reptiles, birds, mammals) have one at some stage.</p>
      </div>
      {q.editable && <div className={labCard}><LabChoice name="phylum" label="Phylum" value={phylum} options={(Object.keys(PHYLA) as Phylum[]).map((k) => ({ id: k, label: k }))} onChange={(v) => setPhylum(v as Phylum)} /></div>}
    </div>
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
  return (
    <div className="space-y-3 p-3" data-testid="hierarchy" data-shared={shared ?? 'none'} aria-label={alt}>
      <div className={labCard}>
        <table className="w-full text-sm text-slate-200">
          <thead><tr><th className="text-left font-normal text-slate-400">Rank</th><th className="text-left font-normal text-slate-400">{A.common}</th><th className="text-left font-normal text-slate-400">{B.common}</th></tr></thead>
          <tbody>{RANKS.map((r, i) => <tr key={r} className={i <= sharedIdx ? 'text-emerald-300' : ''} data-rank={r}><td className="capitalize">{r}</td><td className={r === 'species' || r === 'genus' ? 'italic' : ''}>{A[r]}</td><td className={r === 'species' || r === 'genus' ? 'italic' : ''}>{B[r]}</td></tr>)}</tbody>
        </table>
        <p className="text-sm text-white" data-testid="hierarchy-result">{shared ? <>The {A.common.toLowerCase()} and the {B.common.toLowerCase()} share every rank down to the <strong>{shared}</strong> ({A[shared]}).</> : <>They are in different kingdoms, so they share no rank.</>} The lower the shared rank, the more closely related they are.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="org-a" label="First organism" value={A.common} options={ORGANISMS.map((o) => ({ id: o.common, label: o.common }))} onChange={setA} />
          <LabChoice name="org-b" label="Second organism" value={B.common} options={ORGANISMS.map((o) => ({ id: o.common, label: o.common }))} onChange={setB} />
        </div>
      )}
    </div>
  );
};

// ---------- Binomial names ----------

export const BinomialVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { name?: string; editable?: boolean };
  const [name, setName] = useState(q.name ?? 'panthera Tigris');
  const c = checkBinomial(name);
  return (
    <div className="space-y-3 p-3" data-testid="binomial" data-ok={c.ok ? 'true' : 'false'} aria-label={alt}>
      <div className={labCard}>
        {c.ok
          ? <p className="text-base text-white" data-testid="binomial-result">Correct: <em className="font-bold">{c.genus} {c.species}</em>. Genus <em>{c.genus}</em>, species <em>{c.species}</em>. Print it in italics, or underline it when handwritten.</p>
          : <div data-testid="binomial-result"><p className="text-sm text-white">“{name}” does not follow the rules:</p><ul className="text-sm text-amber-200 list-disc pl-5">{c.problems.map((p) => <li key={p}>{p}</li>)}</ul></div>}
        <p className="text-xs text-slate-400">Examples: Panthera tigris (tiger), Mangifera indica (mango), Homo sapiens (human), Nasikabatrachus sahyadrensis (purple frog).</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <label htmlFor="binomial-input" className="block text-sm text-slate-200">Type a scientific name
            <input id="binomial-input" value={name} onChange={(e) => setName(e.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} className="mt-1 w-full min-h-[48px] rounded-xl border border-surface-border bg-surface px-3 text-on-surface" />
          </label>
        </div>
      )}
    </div>
  );
};

export const DIVERSITY_VISUALS: VisualRegistry = { microscope: MicroscopeVisual, kingdomKey: KingdomKeyVisual, plantKey: PlantKeyVisual, animalPhyla: AnimalPhylaVisual, hierarchy: HierarchyVisual, binomial: BinomialVisual };
