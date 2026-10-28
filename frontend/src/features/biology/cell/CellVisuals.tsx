/**
 * Figures and laboratory investigations for Chapter 2 (Cell): the osmosis bench, the cell explorer and cell division, plus the
 * shared virtual microscope and size ladder. Every number comes from `engine/biology/cell/model.ts`. Cells are not to scale;
 * colours only tell the parts apart, and every result is also given in words.
 */

import React, { useState } from 'react';
import type { VisualProps, VisualRegistry } from '../../education/visuals';
import { LabChoice, LabSlider, fmtNum } from '../../education/SubjectLabShell';
import { LabKey, LabPredict, LabStage, LabSteps, predictionNote } from '../../education/LabLayout';
import {
  CELL_PARTS, POTATO_SAP_PERCENT, cellResponse, divide, finalMass, partById, potatoMassChangePercent, type CellKind, type CellType,
} from '../../../engine/biology/cell/model';
import { MicroscopeVisual, SizeLadderVisual } from '../shared/Microscope';

// ---------- Osmosis ----------

type Flow = 'in' | 'out' | 'none';
const FLOW_LABEL: Record<Flow, string> = { in: 'Into the cells', out: 'Out of the cells', none: 'No net movement' };

/** Water arrows across the boundary of the piece or cell: inward, outward, or equal both ways. */
const WaterArrows: React.FC<{ flow: Flow; cx: number; cy: number; rx: number; ry: number }> = ({ flow, cx, cy, rx, ry }) => {
  const sides: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  return (
    <g aria-hidden>
      {sides.map(([dx, dy], i) => {
        const near = { x: cx + dx * (rx + 6), y: cy + dy * (ry + 6) };
        const far = { x: cx + dx * (rx + 34), y: cy + dy * (ry + 30) };
        if (flow === 'none') {
          return <g key={i}><line x1={far.x} y1={far.y} x2={near.x} y2={near.y} stroke="#7dd3fc" strokeWidth="2" markerEnd="url(#osm-head)" markerStart="url(#osm-head-start)" /></g>;
        }
        const [from, to] = flow === 'in' ? [far, near] : [near, far];
        return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#38bdf8" strokeWidth="3.5" markerEnd="url(#osm-head)" className="lab-anim-flow" />;
      })}
    </g>
  );
};

export const OsmosisVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { mode?: 'potato' | 'cell'; kind?: CellKind; outside?: number; editable?: boolean };
  const [mode, setMode] = useState<'potato' | 'cell'>(q.mode ?? 'potato');
  const [kind, setKind] = useState<CellKind>(q.kind ?? 'plant');
  const [outside, setOutside] = useState(q.outside ?? 0);
  const [boiled, setBoiled] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);
  const inside = POTATO_SAP_PERCENT;
  const r = cellResponse(kind, outside, inside);
  const change = potatoMassChangePercent(outside, boiled);
  const initial = 20;
  const final = finalMass(initial, change);
  const scale = Math.cbrt(final / initial);
  const flow: Flow = mode === 'potato' && boiled ? 'none' : r.water;
  const solutionName = outside === 0 ? 'plain water' : `${outside} % salt solution`;
  const subject = mode === 'potato' ? `${boiled ? 'Boiled' : 'Raw'} potato piece` : `${kind === 'plant' ? 'Plant' : 'Animal'} cell`;
  const resetPrediction = () => setPrediction(null);

  // Scene geometry (320 × 230 units).
  const cx = 160, cy = 128;
  const potato = { w: 92, h: 62 };
  const cellBody = (() => {
    if (mode === 'potato') {
      const w = potato.w * scale, h = potato.h * scale;
      return { rx: w / 2, ry: h / 2, el: <>
        <rect x={cx - potato.w / 2} y={cy - potato.h / 2} width={potato.w} height={potato.h} rx="10" fill="none" stroke="#f8fafc" strokeDasharray="5 4" strokeWidth="1.5" />
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx="10" fill={boiled ? '#d6c48a' : '#fde68a'} stroke="#a16207" strokeWidth="2" className="lab-transition" />
        <text x={cx} y={cy + 5} fontSize="14" fontWeight="700" textAnchor="middle" fill="#422006">{fmtNum(final, 1)} g</text>
      </> };
    }
    if (kind === 'plant') {
      const f = r.state === 'plasmolysed' ? 0.62 : r.state.startsWith('turgid') ? 0.98 : 0.88;
      const w = 80 * f, h = 64 * f;
      return { rx: 44, ry: 36, el: <>
        <rect x={cx - 44} y={cy - 36} width="88" height="72" fill="none" stroke="#16a34a" strokeWidth="4" />
        <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={r.state === 'plasmolysed' ? 14 : 3} fill="#86efac" opacity="0.75" stroke="#15803d" className="lab-transition" />
        <circle cx={cx - 14} cy={cy - 6} r="6" fill="#14532d" />
      </> };
    }
    const rr = r.sizeChange === 'larger' ? 42 : r.sizeChange === 'smaller' ? 24 : 32;
    return { rx: rr, ry: rr, el: <>
      <circle cx={cx} cy={cy} r={32} fill="none" stroke="#f8fafc" strokeDasharray="5 4" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={rr} fill="#fca5a5" opacity="0.75" stroke="#b91c1c" className="lab-transition" />
      <circle cx={cx - 6} cy={cy - 5} r="6" fill="#7f1d1d" />
    </> };
  })();

  const scene = (
    <svg viewBox="0 0 320 230" role="img" aria-label={`${subject} in ${solutionName}. Water: ${FLOW_LABEL[flow].toLowerCase()}.`}>
      <defs>
        <marker id="osm-head" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" refX="10" refY="7" orient="auto"><path d="M0,0 L14,7 L0,14 Z" fill="#38bdf8" /></marker>
        <marker id="osm-head-start" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto-start-reverse"><path d="M0,0 L12,6 L0,12 Z" fill="#7dd3fc" /></marker>
      </defs>
      <rect x="14" y="36" width="292" height="186" rx="10" fill="#0ea5e9" opacity={0.1 + Math.min(0.45, outside / 60)} stroke="#64748b" strokeWidth="2" />
      {Array.from({ length: Math.round(outside * 1.2) }, (_, i) => <circle key={i} cx={24 + ((i * 53) % 272)} cy={46 + ((i * 37) % 166)} r="2" fill="#f8fafc" opacity="0.7" />)}
      <text x="20" y="24" fontSize="13" fill="#cbd5e1">Outside: <tspan fontWeight="700" fill="#fff">{outside === 0 ? 'plain water (0 %)' : `${outside} % salt`}</tspan></text>
      <WaterArrows flow={flow} cx={cx} cy={cy} rx={cellBody.rx} ry={cellBody.ry} />
      {cellBody.el}
      <text x={cx} y="214" fontSize="13" textAnchor="middle" fill="#fde68a">Inside (cell sap): about {inside} %</text>
      <text x="300" y="24" fontSize="13" textAnchor="end" fill="#7dd3fc" fontWeight="700">{flow === 'in' ? '→ water in' : flow === 'out' ? '← water out' : '⇄ no net flow'}</text>
    </svg>
  );
  const sceneWithKey = <>{scene}<LabKey items={[
    ...(mode === 'cell' && kind === 'plant' ? [{ colour: '#16a34a', label: 'cell wall', shape: 'line' as const }] : [{ colour: '#f8fafc', label: 'size before', shape: 'dash' as const }]),
    { colour: '#38bdf8', label: 'net movement of water', shape: 'line' as const },
  ]} /></>;

  const actual = flow;
  return (
    <LabStage testId="osmosis" alt={alt}
      data={{ 'data-mode': mode, 'data-tonicity': r.tonicity, 'data-water': flow, 'data-state': mode === 'potato' ? (change > 0 ? 'gained' : change < 0 ? 'lost' : 'unchanged') : r.state, 'data-change': fmtNum(change, 1) }}
      question={mode === 'potato' ? 'Does a potato piece gain or lose water in a solution stronger or weaker than its cell sap?' : 'What happens to a cell when the solution outside is weaker or stronger than its contents?'}
      sceneNote="Schematic · mass changes are illustrative"
      scene={sceneWithKey}
      controls={q.editable ? <>
        <LabChoice name="osm-mode" label="Investigation" value={mode} options={[{ id: 'potato', label: 'Potato piece' }, { id: 'cell', label: 'Single cell' }]} onChange={(v) => { setMode(v as 'potato' | 'cell'); resetPrediction(); }} />
        <LabSlider id="osm-outside" label="Salt in the outside solution" value={outside} min={0} max={30} step={1} unit="%" format={(v) => (v === 0 ? '0 % (plain water)' : `${v} %`)} onChange={(v) => { setOutside(v); resetPrediction(); }} />
        {mode === 'cell' && <LabChoice name="osm-kind" label="Cell" value={kind} options={[{ id: 'plant', label: 'Plant cell (Rhoeo)' }, { id: 'animal', label: 'Animal cell (cheek)' }]} onChange={(v) => { setKind(v as CellKind); resetPrediction(); }} />}
        {mode === 'potato' && <LabChoice name="osm-boiled" label="Potato" value={boiled ? 'boiled' : 'raw'} options={[{ id: 'raw', label: 'Raw' }, { id: 'boiled', label: 'Boiled' }]} onChange={(v) => { setBoiled(v === 'boiled'); resetPrediction(); }} />}
        <LabPredict name="osm-predict" label="Which way will water move overall?" value={prediction} options={(['in', 'out', 'none'] as Flow[]).map((f) => ({ id: f, label: FLOW_LABEL[f] }))} onChange={setPrediction} />
      </> : undefined}
      observation={<>
        <dl className="lab-readout">
          <div><dt>Inside (cell sap)</dt><dd>about {inside} %</dd></div>
          <div><dt>Outside</dt><dd>{outside} %</dd></div>
          <div><dt>Water moves</dt><dd>{flow === 'in' ? 'in' : flow === 'out' ? 'out' : 'no net flow'}</dd></div>
          {mode === 'potato'
            ? <div><dt>Mass before → after</dt><dd data-testid="osmosis-mass">{initial} g → {fmtNum(final, 1)} g</dd></div>
            : <div><dt>The cell is</dt><dd>{r.state}</dd></div>}
        </dl>
        {mode === 'potato'
          ? <p className="m-0" data-testid="osmosis-result">{subject}: {initial} g → <strong>{fmtNum(final, 1)} g</strong> ({change > 0 ? '+' : ''}{fmtNum(change, 1)} %). {boiled ? 'The boiled cells are dead: their membranes no longer act as selectively permeable, so there is no osmosis.' : change > 0 ? 'Water entered the cells: the solution is hypotonic.' : change < 0 ? 'Water left the cells: the solution is hypertonic.' : 'No net movement: the solution is isotonic with the cell sap.'}</p>
          : <p className="m-0" data-testid="osmosis-result">{subject} in {solutionName}: the solution is <strong>{r.tonicity}</strong>; the cell is <strong>{r.state}</strong>.</p>}
        {predictionNote(prediction, actual, (id) => FLOW_LABEL[id as Flow])}
      </>}
      explanation={<>
        <p className="m-0">{mode === 'potato' && boiled ? 'Boiling kills the cells. Their membranes no longer control what passes, so water does not move in or out by osmosis and the mass stays the same.' : r.explanation}</p>
        <p className="m-0">Water moves through the selectively permeable membrane from the weaker solution (more water) to the stronger one (less water). The dashed outline shows the size before; arrows show the net movement of water.</p>
        <p className="m-0 text-slate-400">Cell contents are taken as about {inside} % dissolved substances; the masses are an illustrative model of Activity 2.2, not measurements.</p>
      </>}
      finding={{ label: `${subject} in ${solutionName}`, value: mode === 'potato' ? `${initial} g → ${fmtNum(final, 1)} g (${change > 0 ? '+' : ''}${fmtNum(change, 1)} %)` : `${r.state}; water ${flow === 'none' ? 'no net flow' : flow}` }}
    />
  );
};

// ---------- Cell explorer ----------

/** Where each part's labelled hotspot sits on the 200 × 200 diagram of each cell type. */
const HOTSPOTS: Record<CellType, Record<string, [number, number]>> = {
  bacterial: { wall: [100, 64], membrane: [34, 100], nucleoid: [118, 95], ribosome: [60, 110], cytoplasm: [156, 112] },
  plant: { wall: [12, 40], membrane: [20, 150], cytoplasm: [44, 176], vacuole: [130, 105], nucleus: [65, 70], chloroplast: [170, 60], mitochondria: [60, 120], er: [92, 48], golgi: [160, 154], ribosome: [125, 34] },
  animal: { membrane: [100, 22], cytoplasm: [150, 92], nucleus: [100, 95], mitochondria: [60, 60], er: [146, 72], golgi: [152, 124], lysosome: [65, 140], vacuole: [100, 152], ribosome: [118, 52] },
};

const CellDiagram: React.FC<{ type: CellType; part: string; parts: { id: string; name: string }[]; onPick?: (id: string) => void }> = ({ type, part, parts, onPick }) => {
  const hl = (id: string) => (id === part ? '#facc15' : undefined);
  const spots = parts.map((p, i) => ({ ...p, n: i + 1, at: HOTSPOTS[type][p.id] })).filter((p) => p.at);
  return (
    <svg viewBox="-6 -6 212 212" role="group" aria-label={`${type === 'bacterial' ? 'Bacterial' : type === 'plant' ? 'Plant' : 'Animal'} cell diagram with ${spots.length} labelled parts`}>
      {type === 'bacterial' && <><rect x="20" y="70" width="160" height="60" rx="30" fill="#fde68a" opacity="0.4" stroke={hl('wall') ?? '#a16207'} strokeWidth="5" /><rect x="26" y="76" width="148" height="48" rx="24" fill="none" stroke={hl('membrane') ?? '#ca8a04'} strokeWidth="1.5" /><path d="M90 95 q10 -15 25 0 t25 0" stroke={hl('nucleoid') ?? '#7c3aed'} fill="none" strokeWidth="2.5" />{[60, 75, 130, 145].map((x) => <circle key={x} cx={x} cy={x % 2 ? 110 : 88} r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {type === 'plant' && <><rect x="12" y="12" width="176" height="176" fill="#bbf7d0" opacity="0.3" stroke={hl('wall') ?? '#15803d'} strokeWidth="6" /><rect x="20" y="20" width="160" height="160" fill={hl('cytoplasm') ? '#fef9c3' : 'none'} fillOpacity="0.2" stroke={hl('membrane') ?? '#22c55e'} strokeWidth="1.5" /><rect x="95" y="70" width="70" height="70" rx="10" fill="#e0f2fe" stroke={hl('vacuole') ?? '#0284c7'} strokeWidth={hl('vacuole') ? 3 : 1} /><circle cx="65" cy="70" r="18" fill="#c4b5fd" stroke={hl('nucleus') ?? '#6d28d9'} strokeWidth={hl('nucleus') ? 3 : 1} />{[[150, 40], [170, 60], [40, 150]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x} cy={y} rx="11" ry="6" fill="#4ade80" stroke={hl('chloroplast') ?? '#166534'} strokeWidth={hl('chloroplast') ? 2.5 : 1} />)}<ellipse cx="60" cy="120" rx="10" ry="5" fill="#fdba74" stroke={hl('mitochondria') ?? '#c2410c'} strokeWidth={hl('mitochondria') ? 2.5 : 1} /><path d="M85 45 q10 8 20 0 t20 0" stroke={hl('er') ?? '#0f766e'} fill="none" strokeWidth={hl('er') ? 3 : 1.5} /><g stroke={hl('golgi') ?? '#be185d'} strokeWidth={hl('golgi') ? 3 : 1.5}>{[0, 4, 8].map((d) => <line key={d} x1={145} y1={150 + d} x2={175} y2={150 + d} />)}</g>{[95, 110, 125].map((x) => <circle key={x} cx={x} cy="38" r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {type === 'animal' && <><ellipse cx="100" cy="100" rx="88" ry="78" fill={hl('cytoplasm') ? '#fef9c3' : '#fecaca'} opacity="0.35" stroke={hl('membrane') ?? '#dc2626'} strokeWidth={hl('membrane') ? 3 : 1.5} /><circle cx="100" cy="95" r="20" fill="#c4b5fd" stroke={hl('nucleus') ?? '#6d28d9'} strokeWidth={hl('nucleus') ? 3 : 1} /><ellipse cx="60" cy="60" rx="10" ry="5" fill="#fdba74" stroke={hl('mitochondria') ?? '#c2410c'} strokeWidth={hl('mitochondria') ? 2.5 : 1} /><path d="M120 70 q8 8 16 0 t16 0" stroke={hl('er') ?? '#0f766e'} fill="none" strokeWidth={hl('er') ? 3 : 1.5} /><g stroke={hl('golgi') ?? '#be185d'} strokeWidth={hl('golgi') ? 3 : 1.5}>{[0, 4, 8].map((d) => <line key={d} x1={140} y1={118 + d} x2={165} y2={118 + d} />)}</g><circle cx="65" cy="140" r="6" fill="#fde047" stroke={hl('lysosome') ?? '#a16207'} strokeWidth={hl('lysosome') ? 2.5 : 1} /><circle cx="100" cy="150" r="5" fill="#e0f2fe" stroke={hl('vacuole') ?? '#0284c7'} />{[115, 125, 135].map((x) => <circle key={x} cx={x} cy="55" r="2" fill={hl('ribosome') ?? '#475569'} />)}</>}
      {spots.map((s) => {
        const on = s.id === part;
        const activate = () => onPick?.(s.id);
        return (
          <g key={s.id} role={onPick ? 'button' : undefined} tabIndex={onPick ? 0 : undefined} aria-label={onPick ? `${s.n}. ${s.name}` : undefined} aria-pressed={onPick ? on : undefined} data-hotspot={s.id}
            onClick={activate} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } }} className={onPick ? 'lab-hotspot' : undefined}>
            <circle cx={s.at[0]} cy={s.at[1]} r="17" fill="transparent" />
            <circle cx={s.at[0]} cy={s.at[1]} r="8" fill={on ? '#facc15' : '#0f172a'} stroke={on ? '#fff' : '#facc15'} strokeWidth="1.5" />
            <text x={s.at[0]} y={s.at[1] + 3.5} fontSize="10" textAnchor="middle" fill={on ? '#0f172a' : '#fff'} fontWeight="700">{s.n}</text>
          </g>
        );
      })}
    </svg>
  );
};

export const CellCompareVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { type?: CellType; editable?: boolean; part?: string };
  const [type, setType] = useState<CellType>(q.type ?? 'plant');
  const present = CELL_PARTS.filter((p) => p.in[type]);
  const [partId, setPartId] = useState(q.part ?? 'membrane');
  const part = partById(present.some((p) => p.id === partId) ? partId : present[0].id)!;
  const short = (name: string) => name.replace(/ \(.*\)/, '');
  return (
    <LabStage testId="cell-compare" alt={alt} data={{ 'data-cell-type': type, 'data-part': part.id }}
      question="What does each part of the cell do, and which cells have it?"
      sceneNote="Not to scale · colours only tell parts apart · tap a number"
      scene={<CellDiagram type={type} part={part.id} parts={present.map((p) => ({ id: p.id, name: short(p.name) }))} onPick={setPartId} />}
      controls={q.editable ? <>
        <LabChoice name="cell-type" label="Cell" value={type} options={[{ id: 'bacterial', label: 'Bacterial' }, { id: 'plant', label: 'Plant' }, { id: 'animal', label: 'Animal' }]} onChange={(v) => setType(v as CellType)} />
        <LabChoice name="cell-part" label="Part (same numbers as the diagram)" value={part.id} options={present.map((p, i) => ({ id: p.id, label: `${i + 1}. ${short(p.name)}` }))} onChange={setPartId} />
      </> : undefined}
      observation={<>
        <p className="m-0 text-base font-bold" data-testid="cell-part-name">{part.name}: {part.nickname}</p>
        <p className="m-0"><strong>Function:</strong> {part.job}</p>
        <p className="m-0 text-slate-300"><strong>Structure:</strong> membranes around it: {part.membranes}; contains DNA: {part.hasDNA ? 'yes' : 'no'}.{part.note ? ` ${part.note}` : ''}</p>
        <table className="lab-notebook__table" data-testid="cell-part-presence"><thead><tr><th>Bacterial</th><th>Plant</th><th>Animal</th></tr></thead>
          <tbody><tr>{(['bacterial', 'plant', 'animal'] as CellType[]).map((t) => <td key={t} data-in={t}>{part.in[t] ? '✓ present' : '✗ absent'}</td>)}</tr></tbody></table>
      </>}
      explanation={<p className="m-0">{type === 'bacterial' ? 'Prokaryotic: no membrane-bound nucleus or organelles; about 1 to 10 µm.' : 'Eukaryotic: a nucleus and membrane-bound organelles; about 10 to 100 µm.'} Plant cells have a cell wall, chloroplasts and a large central vacuole; animal cells have none of these but have lysosomes.</p>}
      explanationTitle="Prokaryotic or eukaryotic?"
      finding={{ label: `${part.name} (${type} cell)`, value: part.job }}
    />
  );
};

// ---------- Cell division ----------

const PAIR_COLOURS = ['#f87171', '#60a5fa', '#34d399', '#fbbf24'];
interface Chromo { pair: number; partner: 0 | 1; doubled: boolean }

const CellWithChromosomes: React.FC<{ cx: number; cy: number; rx: number; ry: number; list: Chromo[]; label?: string }> = ({ cx, cy, rx, ry, list, label }) => {
  const w = Math.min(14, (rx * 1.5) / Math.max(1, list.length));
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#1e293b" stroke="#94a3b8" />
      {list.map((c, i) => {
        const x = cx - ((list.length - 1) * w) / 2 + i * w;
        const h = Math.min(30, ry * 1.1);
        const fill = PAIR_COLOURS[c.pair % 4];
        return (
          <g key={i} opacity={c.partner ? 0.6 : 1}>
            {c.doubled
              ? <><rect x={x - 3.5} y={cy - h / 2} width="3" height={h} rx="1.5" fill={fill} /><rect x={x + 0.5} y={cy - h / 2} width="3" height={h} rx="1.5" fill={fill} /><circle cx={x} cy={cy} r="2" fill="#f8fafc" /></>
              : <rect x={x - 1.5} y={cy - h / 2} width="3" height={h} rx="1.5" fill={fill} />}
          </g>
        );
      })}
      {label && <text x={cx} y={cy + ry + 16} fontSize="12" textAnchor="middle" fill="#e2e8f0">{label}</text>}
    </g>
  );
};

type DivKind = 'mitosis' | 'meiosis';
const STAGES: Record<DivKind, string[]> = {
  mitosis: ['Parent cell', 'Chromosomes copy themselves', 'Copies line up and are pulled apart', 'Two daughter cells'],
  meiosis: ['Parent cell', 'Chromosomes copy themselves', 'First division: the pairs separate', 'Second division: the copies separate', 'Four gametes'],
};

export const DivisionVisual: React.FC<VisualProps> = ({ props, alt }) => {
  const q = props as { kind?: DivKind; chromosomes?: number; editable?: boolean };
  const [kind, setKind] = useState<DivKind>(q.kind ?? 'mitosis');
  const [chromosomes, setChromosomes] = useState(q.chromosomes ?? 4);
  const [stage, setStage] = useState(q.editable ? 0 : STAGES[q.kind ?? 'mitosis'].length - 1);
  const d = divide(kind, chromosomes);
  const pairs = chromosomes / 2;
  const stages = STAGES[kind];
  const last = stage === stages.length - 1;
  const full = (doubled: boolean): Chromo[] => Array.from({ length: pairs }, (_, p) => [0, 1].map((k) => ({ pair: p, partner: k as 0 | 1, doubled }))).flat();
  const half = (seed: number, doubled: boolean): Chromo[] => Array.from({ length: pairs }, (_, p) => ({ pair: p, partner: ((seed >> p) & 1) as 0 | 1, doubled }));
  const other = (seed: number, doubled: boolean): Chromo[] => half(seed, doubled).map((c) => ({ ...c, partner: (1 - c.partner) as 0 | 1 }));
  const cellCount = kind === 'mitosis' ? [1, 1, 1, 2][stage] : [1, 1, 2, 4, 4][stage];
  const each = kind === 'mitosis' ? chromosomes : stage < 2 ? chromosomes : chromosomes / 2;
  const doubledNow = kind === 'mitosis' ? stage === 1 || stage === 2 : stage === 1 || stage === 2;
  let picture: React.ReactNode;
  if (stage === 0) picture = <CellWithChromosomes cx={160} cy={96} rx={64} ry={50} list={full(false)} label={`${chromosomes} chromosomes`} />;
  else if (stage === 1) picture = <CellWithChromosomes cx={160} cy={96} rx={64} ry={50} list={full(true)} label={`${chromosomes} chromosomes, each now two copies`} />;
  else if (kind === 'mitosis' && stage === 2) picture = <><ellipse cx="160" cy="96" rx="120" ry="48" fill="#1e293b" stroke="#94a3b8" /><CellWithChromosomes cx={100} cy={96} rx={0.1} ry={40} list={full(false)} /><CellWithChromosomes cx={220} cy={96} rx={0.1} ry={40} list={full(false)} /><text x="160" y="164" fontSize="12" textAnchor="middle" fill="#e2e8f0">one copy of every chromosome to each end</text></>;
  else if (kind === 'mitosis') picture = <><CellWithChromosomes cx={90} cy={96} rx={58} ry={46} list={full(false)} label={`${chromosomes} chromosomes`} /><CellWithChromosomes cx={230} cy={96} rx={58} ry={46} list={full(false)} label={`${chromosomes} chromosomes`} /></>;
  else if (stage === 2) picture = <><CellWithChromosomes cx={90} cy={96} rx={58} ry={46} list={half(3, true)} label={`${pairs} (doubled)`} /><CellWithChromosomes cx={230} cy={96} rx={58} ry={46} list={other(3, true)} label={`${pairs} (doubled)`} /></>;
  else picture = <>{[half(3, false), half(3, false), other(3, false), other(3, false)].map((list, i) => <CellWithChromosomes key={i} cx={46 + i * 76} cy={96} rx={34} ry={34} list={list} label={`${pairs}`} />)}</>;
  const scene = (
    <>
      <svg viewBox="0 0 320 190" role="img" aria-label={`${kind === 'mitosis' ? 'Mitosis' : 'Meiosis'}, step ${stage + 1}: ${stages[stage]}. ${cellCount} cell${cellCount === 1 ? '' : 's'} with ${each} chromosomes each.`}>
        <text x="160" y="20" fontSize="14" textAnchor="middle" fill="#fff" fontWeight="700">{stages[stage]}</text>
        {picture}
      </svg>
      <LabKey items={[{ colour: '#f87171', label: 'one pair (bright: from one parent, pale: from the other)' }, { colour: '#f8fafc', label: 'joined copies' }]} />
    </>
  );
  const rows: [string, (k: DivKind) => string][] = [
    ['Cells produced', (k) => String(divide(k, chromosomes).daughters)],
    ['Chromosomes in each', (k) => String(divide(k, chromosomes).chromosomesEach)],
    ['Same as the parent?', (k) => (divide(k, chromosomes).identical ? 'Yes, identical' : 'No, different mixes')],
    ['Used for', (k) => divide(k, chromosomes).purpose],
  ];
  return (
    <LabStage testId="division" alt={alt} data={{ 'data-kind': kind, 'data-daughters': d.daughters, 'data-each': d.chromosomesEach, 'data-stage': stage }}
      question="How do mitosis and meiosis share out the chromosomes?"
      sceneNote="Simplified · real cells have many more chromosomes (46 in humans)"
      scene={scene}
      actions={<LabSteps step={stage} count={stages.length} onStep={setStage} />}
      controls={q.editable ? <>
        <LabChoice name="div-kind" label="Division" value={kind} options={[{ id: 'mitosis', label: 'Mitosis' }, { id: 'meiosis', label: 'Meiosis' }]} onChange={(v) => { setKind(v as DivKind); setStage(0); }} />
        <LabSlider id="div-chromosomes" label="Chromosomes in the parent cell" value={chromosomes} min={2} max={8} step={2} unit="" onChange={(v) => { setChromosomes(v); setStage(0); }} />
      </> : undefined}
      observation={<>
        <dl className="lab-readout">
          <div><dt>Cells now</dt><dd>{cellCount}</dd></div>
          <div><dt>Chromosomes in each</dt><dd data-testid="division-count">{each}{doubledNow ? ' (doubled)' : ''}</dd></div>
        </dl>
        {last
          ? <p className="m-0" data-testid="division-result">{kind === 'mitosis' ? 'Mitosis' : 'Meiosis'}: one cell with {chromosomes} chromosomes gives <strong>{d.daughters} cells with {d.chromosomesEach} chromosomes each</strong>, {d.identical ? 'identical to the parent' : 'each with one chromosome from every pair, in different combinations'}. Used for {d.purpose}.</p>
          : <p className="m-0" data-testid="division-result">Step {stage + 1} of {stages.length}: {stages[stage].toLowerCase()}. Go on to see the daughter cells.</p>}
      </>}
      extra={<table className="lab-notebook__table" data-testid="division-compare"><thead><tr><th scope="col">With {chromosomes} chromosomes</th><th scope="col">Mitosis</th><th scope="col">Meiosis</th></tr></thead>
        <tbody>{rows.map(([label, f]) => <tr key={label}><td>{label}</td><td>{f('mitosis')}</td><td>{f('meiosis')}</td></tr>)}</tbody></table>}
      extraTitle="Compare mitosis and meiosis"
      explanation={<p className="m-0">Before either division each chromosome makes a copy of itself. Mitosis then shares the copies equally, so both cells are identical to the parent. Meiosis divides twice: first the partners of each pair go to different cells, then the copies separate, so each gamete has half the chromosomes, one from every pair. Fertilisation restores the full number.</p>}
      finding={{ label: `${kind === 'mitosis' ? 'Mitosis' : 'Meiosis'}, ${chromosomes} chromosomes`, value: `${d.daughters} cells × ${d.chromosomesEach} chromosomes` }}
    />
  );
};

export const CELL_VISUALS: VisualRegistry = { microscope: MicroscopeVisual, sizeLadder: SizeLadderVisual, osmosis: OsmosisVisual, cellCompare: CellCompareVisual, division: DivisionVisual };
