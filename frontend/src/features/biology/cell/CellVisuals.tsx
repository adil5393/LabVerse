/**
 * Figures and laboratory investigations for Chapter 2 (Cell): the osmosis bench, the cell explorer and cell division, plus the
 * shared virtual microscope and size ladder. Every number comes from `engine/biology/cell/model.ts`. Cells are not to scale;
 * colours only tell the parts apart, and every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum, labCard } from '../../education/SubjectLabShell';
import {
  CELL_PARTS, POTATO_SAP_PERCENT, cellResponse, divide, finalMass, partById, potatoMassChangePercent, type CellKind, type CellType,
} from '../../../engine/biology/cell/model';
import { MicroscopeVisual, SizeLadderVisual } from '../shared/Microscope';

// ---------- Osmosis ----------

export const OsmosisVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { mode?: 'potato' | 'cell'; kind?: CellKind; outside?: number; editable?: boolean };
  const [mode, setMode] = useState<'potato' | 'cell'>(q.mode ?? 'potato');
  const [kind, setKind] = useState<CellKind>(q.kind ?? 'plant');
  const [outside, setOutside] = useState(q.outside ?? 0);
  const [boiled, setBoiled] = useState(false);
  const inside = POTATO_SAP_PERCENT;
  const r = cellResponse(kind, outside, inside);
  const change = potatoMassChangePercent(outside, boiled);
  const initial = 20;
  const final = finalMass(initial, change);
  const scale = Math.cbrt(final / initial);
  const solutionName = outside === 0 ? 'plain water' : `${outside} % salt solution`;
  return (
    <div className="space-y-3 p-3" data-testid="osmosis" data-mode={mode} data-tonicity={r.tonicity} data-water={mode === 'potato' && boiled ? 'none' : r.water}
      data-state={mode === 'potato' ? (change > 0 ? 'gained' : change < 0 ? 'lost' : 'unchanged') : r.state} data-change={fmtNum(change, 1)} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 220 150" className="w-full max-w-[340px] mx-auto block" aria-hidden>
          <rect x="20" y="30" width="180" height="110" rx="8" fill="#0ea5e9" opacity={0.12 + Math.min(0.5, outside / 60)} stroke="#64748b" />
          {mode === 'potato' ? (
            <rect x={110 - 34 * scale} y={85 - 24 * scale} width={68 * scale} height={48 * scale} rx="8" fill={boiled ? '#d6c48a' : '#fde68a'} stroke="#a16207" />
          ) : kind === 'plant' ? (
            <g>
              <rect x="70" y="50" width="80" height="70" fill="none" stroke="#16a34a" strokeWidth="3" />
              {(() => { const f = r.state === 'plasmolysed' ? 0.6 : r.state.startsWith('turgid') ? 0.97 : 0.88; const w = 76 * f, h = 66 * f; return <rect x={110 - w / 2} y={85 - h / 2} width={w} height={h} rx={r.state === 'plasmolysed' ? 12 : 2} fill="#86efac" opacity="0.7" stroke="#15803d" />; })()}
              <circle cx="96" cy="78" r="6" fill="#14532d" />
            </g>
          ) : (
            <g>
              <circle cx="110" cy="85" r={r.sizeChange === 'larger' ? 40 : r.sizeChange === 'smaller' ? 22 : 31} fill="#fca5a5" opacity="0.7" stroke="#b91c1c" />
              <circle cx="104" cy="80" r="6" fill="#7f1d1d" />
            </g>
          )}
          {(mode === 'cell' || !boiled) && r.water !== 'none' && [0, 1, 2].map((k) => {
            const y = 60 + k * 25, into = r.water === 'in';
            return <g key={k}><line x1={into ? 30 : 160} y1={y} x2={into ? 60 : 190} y2={y} stroke="#0284c7" strokeWidth="2" /><polygon points={into ? `60,${y - 4} 68,${y} 60,${y + 4}` : `190,${y - 4} 198,${y} 190,${y + 4}`} fill="#0284c7" /></g>;
          })}
          <text x="110" y="22" fontSize="10" textAnchor="middle" fill="#cbd5e1">{solutionName}</text>
        </svg>
        {mode === 'potato' ? (
          <p className="text-sm text-white" data-testid="osmosis-result">Potato piece: {initial} g → <strong>{fmtNum(final, 1)} g</strong> ({change > 0 ? '+' : ''}{fmtNum(change, 1)} %). {boiled ? 'The boiled cells are dead: their membranes no longer act as selectively permeable, so there is no osmosis.' : change > 0 ? 'Water entered the cells: the solution is hypotonic.' : change < 0 ? 'Water left the cells: the solution is hypertonic.' : 'No net movement: the solution is isotonic with the cell sap.'}</p>
        ) : (
          <p className="text-sm text-white" data-testid="osmosis-result">{kind === 'plant' ? 'Plant' : 'Animal'} cell in {solutionName}: the solution is <strong>{r.tonicity}</strong>; the cell is <strong>{r.state}</strong>. {r.explanation}</p>
        )}
        <p className="text-xs text-slate-400">Cell contents are taken as about {inside} % dissolved substances; mass changes are illustrative. Arrows show the net movement of water.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="osm-mode" label="Investigation" value={mode} options={[{ id: 'potato', label: 'Potato piece' }, { id: 'cell', label: 'Single cell' }]} onChange={(v) => setMode(v as 'potato' | 'cell')} />
          {mode === 'cell' && <LabChoice name="osm-kind" label="Cell" value={kind} options={[{ id: 'plant', label: 'Plant cell (Rhoeo)' }, { id: 'animal', label: 'Animal cell (cheek)' }]} onChange={(v) => setKind(v as CellKind)} />}
          <LabSlider id="osm-outside" label="Concentration of the outside solution" value={outside} min={0} max={30} step={1} unit="%" onChange={setOutside} />
          {mode === 'potato' && <button type="button" data-action="boil" aria-pressed={boiled} onClick={() => setBoiled((b) => !b)} className="min-h-[48px] px-3 rounded-xl border border-surface-border bg-surface text-sm text-white">{boiled ? 'Use a raw potato' : 'Use a boiled potato'}</button>}
        </div>
      )}
    </div>
  );
};

// ---------- Cell explorer ----------


const CellDiagram: React.FC<{ type: CellType; part: string }> = ({ type, part }) => {
  const hl = (id: string) => (id === part ? '#facc15' : undefined);
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[300px] mx-auto block" aria-hidden>
      {type === 'bacterial' && <><rect x="20" y="70" width="160" height="60" rx="30" fill="#fde68a" opacity="0.4" stroke={hl('wall') ?? '#a16207'} strokeWidth="5" /><rect x="26" y="76" width="148" height="48" rx="24" fill="none" stroke={hl('membrane') ?? '#ca8a04'} strokeWidth="1.5" /><path d="M90 95 q10 -15 25 0 t25 0" stroke={hl('nucleoid') ?? '#7c3aed'} fill="none" strokeWidth="2.5" />{[60, 75, 130, 145].map((x) => <circle key={x} cx={x} cy={x % 2 ? 110 : 88} r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {type === 'plant' && <><rect x="12" y="12" width="176" height="176" fill="#bbf7d0" opacity="0.3" stroke={hl('wall') ?? '#15803d'} strokeWidth="6" /><rect x="20" y="20" width="160" height="160" fill="none" stroke={hl('membrane') ?? '#22c55e'} strokeWidth="1.5" /><rect x="95" y="70" width="70" height="70" rx="10" fill="#e0f2fe" stroke={hl('vacuole') ?? '#0284c7'} strokeWidth={hl('vacuole') ? 3 : 1} /><circle cx="65" cy="70" r="18" fill="#c4b5fd" stroke={hl('nucleus') ?? '#6d28d9'} strokeWidth={hl('nucleus') ? 3 : 1} />{[[150, 40], [170, 60], [40, 150]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="11" ry="6" fill="#4ade80" stroke={hl('chloroplast') ?? '#166534'} strokeWidth={hl('chloroplast') ? 2.5 : 1} />)}<ellipse cx="60" cy="120" rx="10" ry="5" fill="#fdba74" stroke={hl('mitochondria') ?? '#c2410c'} strokeWidth={hl('mitochondria') ? 2.5 : 1} /><path d="M85 45 q10 8 20 0 t20 0" stroke={hl('er') ?? '#0f766e'} fill="none" strokeWidth={hl('er') ? 3 : 1.5} /><g stroke={hl('golgi') ?? '#be185d'} strokeWidth={hl('golgi') ? 3 : 1.5}>{[0, 4, 8].map((d) => <line key={d} x1={145} y1={150 + d} x2={175} y2={150 + d} />)}</g>{[95, 110, 125].map((x) => <circle key={x} cx={x} cy="38" r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {type === 'animal' && <><ellipse cx="100" cy="100" rx="88" ry="78" fill="#fecaca" opacity="0.35" stroke={hl('membrane') ?? '#dc2626'} strokeWidth={hl('membrane') ? 3 : 1.5} /><circle cx="100" cy="95" r="20" fill="#c4b5fd" stroke={hl('nucleus') ?? '#6d28d9'} strokeWidth={hl('nucleus') ? 3 : 1} /><ellipse cx="60" cy="60" rx="10" ry="5" fill="#fdba74" stroke={hl('mitochondria') ?? '#c2410c'} strokeWidth={hl('mitochondria') ? 2.5 : 1} /><path d="M120 70 q8 8 16 0 t16 0" stroke={hl('er') ?? '#0f766e'} fill="none" strokeWidth={hl('er') ? 3 : 1.5} /><g stroke={hl('golgi') ?? '#be185d'} strokeWidth={hl('golgi') ? 3 : 1.5}>{[0, 4, 8].map((d) => <line key={d} x1={140} y1={118 + d} x2={165} y2={118 + d} />)}</g><circle cx="65" cy="140" r="6" fill="#fde047" stroke={hl('lysosome') ?? '#a16207'} strokeWidth={hl('lysosome') ? 2.5 : 1} /><circle cx="100" cy="150" r="5" fill="#e0f2fe" stroke={hl('vacuole') ?? '#0284c7'} />{[115, 125, 135].map((x) => <circle key={x} cx={x} cy="55" r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {part === 'cytoplasm' && <text x="100" y="196" fontSize="9" textAnchor="middle" fill="#facc15">cytoplasm fills the whole cell</text>}
    </svg>
  );
};

export const CellCompareVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { type?: CellType; editable?: boolean; part?: string };
  const [type, setType] = useState<CellType>(q.type ?? 'plant');
  const present = CELL_PARTS.filter((p) => p.in[type]);
  const [partId, setPartId] = useState(q.part ?? 'membrane');
  const part = partById(present.some((p) => p.id === partId) ? partId : present[0].id)!;
  return (
    <div className="space-y-3 p-3" data-testid="cell-compare" data-cell-type={type} data-part={part.id} aria-label={alt}>
      <div className={labCard}>
        <CellDiagram type={type} part={part.id} />
        <p className="text-base font-bold text-white" data-testid="cell-part-name">{part.name}: {part.nickname}</p>
        <p className="text-sm text-slate-200">{part.job}</p>
        <p className="text-xs text-slate-400">Membranes around it: {part.membranes}. Contains DNA: {part.hasDNA ? 'yes' : 'no'}.{part.note ? ` ${part.note}` : ''}</p>
        <table className="w-full text-sm text-slate-200" data-testid="cell-part-presence"><thead><tr><th className="text-left font-normal text-slate-400">Bacterial</th><th className="text-left font-normal text-slate-400">Plant</th><th className="text-left font-normal text-slate-400">Animal</th></tr></thead>
          <tbody><tr>{(['bacterial', 'plant', 'animal'] as CellType[]).map((t) => <td key={t} data-in={t}>{part.in[t] ? 'present' : 'absent'}</td>)}</tr></tbody></table>
        <p className="text-xs text-slate-400">{type === 'bacterial' ? 'Prokaryotic: no membrane-bound nucleus or organelles; about 1 to 10 µm.' : 'Eukaryotic: a nucleus and membrane-bound organelles; about 10 to 100 µm.'} Not to scale.</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="cell-type" label="Cell" value={type} options={[{ id: 'bacterial', label: 'Bacterial' }, { id: 'plant', label: 'Plant' }, { id: 'animal', label: 'Animal' }]} onChange={(v) => setType(v as CellType)} />
          <LabChoice name="cell-part" label="Part" value={part.id} options={present.map((p) => ({ id: p.id, label: p.name.replace(/ \(.*\)/, '') }))} onChange={setPartId} />
        </div>
      )}
    </div>
  );
};

// ---------- Cell division ----------

const PAIR_COLOURS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24'];

const Chromosomes: React.FC<{ cx: number; cy: number; r: number; pairs: number; half: boolean; seed: number }> = ({ cx, cy, r, pairs, half, seed }) => (
  <g>
    <circle cx={cx} cy={cy} r={r} fill="#1e293b" stroke="#94a3b8" />
    {Array.from({ length: pairs }, (_, p) => (half ? [((seed >> p) & 1)] : [0, 1]).map((k) => {
      const idx = half ? p : p * 2 + k;
      const total = half ? pairs : pairs * 2;
      const x = cx - r * 0.6 + (idx * (r * 1.2)) / Math.max(1, total - 1);
      return <rect key={`${p}-${k}`} x={x - 1.6} y={cy - r * 0.35} width="3.2" height={r * 0.7} rx="1.5" fill={PAIR_COLOURS[p % 4]} opacity={k ? 0.6 : 1} />;
    }))}
  </g>
);

export const DivisionVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { kind?: 'mitosis' | 'meiosis'; chromosomes?: number; editable?: boolean };
  const [kind, setKind] = useState<'mitosis' | 'meiosis'>(q.kind ?? 'mitosis');
  const [chromosomes, setChromosomes] = useState(q.chromosomes ?? 4);
  const d = divide(kind, chromosomes);
  const pairs = chromosomes / 2;
  return (
    <div className="space-y-3 p-3" data-testid="division" data-kind={kind} data-daughters={d.daughters} data-each={d.chromosomesEach} aria-label={alt}>
      <div className={labCard}>
        <svg viewBox="0 0 220 120" className="w-full max-w-[360px] mx-auto block" aria-hidden>
          <Chromosomes cx={30} cy={60} r={24} pairs={pairs} half={false} seed={0} />
          <polygon points="62,56 74,60 62,64" fill="#94a3b8" />
          {Array.from({ length: d.daughters }, (_, i) => {
            const cols = d.daughters === 2 ? 1 : 2;
            const cx = 110 + (i % 2) * 60 + (cols === 1 ? 30 : 0);
            const cy = d.daughters === 2 ? 30 + i * 60 : 30 + Math.floor(i / 2) * 60;
            return <Chromosomes key={i} cx={d.daughters === 2 ? 140 : cx} cy={cy} r={20} pairs={pairs} half={kind === 'meiosis'} seed={i * 5 + 3} />;
          })}
        </svg>
        <p className="text-sm text-white" data-testid="division-result">{kind === 'mitosis' ? 'Mitosis' : 'Meiosis'}: one cell with {chromosomes} chromosomes gives <strong>{d.daughters} cells with {d.chromosomesEach} chromosomes each</strong>, {d.identical ? 'identical to the parent' : 'each with one chromosome from every pair, in different combinations'}. Used for {d.purpose}.</p>
        <p className="text-xs text-slate-400">Each colour is one pair of chromosomes; the paler bar is the partner from the other parent. Real cells have many more chromosomes (46 in humans).</p>
      </div>
      {q.editable && (
        <div className={labCard}>
          <LabChoice name="div-kind" label="Division" value={kind} options={[{ id: 'mitosis', label: 'Mitosis' }, { id: 'meiosis', label: 'Meiosis' }]} onChange={(v) => setKind(v as 'mitosis' | 'meiosis')} />
          <LabSlider id="div-chromosomes" label="Chromosomes in the parent cell" value={chromosomes} min={2} max={8} step={2} unit="" onChange={setChromosomes} />
        </div>
      )}
    </div>
  );
};

export const CELL_VISUALS: VisualRegistry = { microscope: MicroscopeVisual, sizeLadder: SizeLadderVisual, osmosis: OsmosisVisual, cellCompare: CellCompareVisual, division: DivisionVisual };
