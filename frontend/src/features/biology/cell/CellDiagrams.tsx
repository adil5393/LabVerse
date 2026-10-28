/**
 * Lesson and practice diagrams for Chapter 2 (Cell): a section through the nucleus, the two energy organelles, a model of the
 * selectively permeable membrane, and cells in solutions of different strength. Colours come from the shared Biology palette,
 * so a nucleus or chloroplast looks the same here as in the cell explorer and the 3D cell.
 */

import React from 'react';
import type { VisualProps } from '../../education/visuals';
import { BioCompare, BioDiagram, type ComparePanel } from '../shared/BioDiagram';
import { Arrow, Label, wavyCircle } from '../shared/bioArt';
import { BIO, SELECTED } from '../shared/bioPalette';

const on = (sel: string | null, id: string, base: string) => (sel === id ? SELECTED : base);

// ---------- The nucleus ----------

export const NucleusVisual: React.FC<VisualProps> = () => {
  const cx = 118, cy = 104;
  // Matching dash patterns on both membranes leave gaps in the same places: the nuclear pores.
  const outer = 66, inner = 60;
  const dash = (r: number) => `${(2 * Math.PI * r) / 10 - 7 * (r / outer)} ${7 * (r / outer)}`;
  return (
    <BioDiagram testId="nucleus-diagram" title="Section through the nucleus of an animal cell" kind="schematic" note="not to scale" viewBox="0 0 220 200"
      parts={[
        { id: 'envelope', name: 'Nuclear envelope', at: [cx, cy - outer], detail: 'Two membranes, one inside the other, separating the nucleus from the cytoplasm.' },
        { id: 'pore', name: 'Nuclear pores', at: [cx + 64, cy + 42], detail: 'Openings where the two membranes meet. Messages copied from DNA leave the nucleus through them to reach the ribosomes.' },
        { id: 'nucleolus', name: 'Nucleolus', at: [cx + 20, cy - 12], detail: 'A dense region inside the nucleus that makes the parts of ribosomes. It has no membrane of its own.' },
        { id: 'chromatin', name: 'Chromatin (DNA)', at: [cx - 30, cy + 26], detail: 'Long threads of DNA with proteins. They carry the coded instructions and coil up into chromosomes when the cell divides.' },
        { id: 'er', name: 'Rough ER joined to the envelope', at: [26, 54], detail: 'The endoplasmic reticulum is continuous with the outer nuclear membrane. Ribosomes on it make proteins.' },
      ]}
      legend={[{ colour: BIO.nucleus.line, label: 'nuclear membranes' }, { colour: BIO.chromatin.line, label: 'chromatin', shape: 'line' }, { colour: BIO.er.line, label: 'rough ER', shape: 'line' }]}
      summary="The nucleus holds the cell’s DNA. Its double envelope, with pores, controls what passes between the nucleus and the cytoplasm."
      art={(sel) => (
        <>
          <rect x="0" y="0" width="220" height="200" rx="10" fill={BIO.cytoplasm.fill} opacity="0.08" />
          {/* Rough ER leaving the outer membrane, studded with ribosomes */}
          {[0, 10].map((d) => <path key={d} d={`M ${cx - outer + 4} ${cy - 22 - d} C ${30 - d} ${90 - d}, ${18 - d} ${60 - d}, ${40 - d} ${24 - d / 2}`} fill="none" stroke={on(sel, 'er', BIO.er.line)} strokeWidth={sel === 'er' ? 3 : 2} />)}
          {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={28 + (i % 2) * 6 - i * 1.5} cy={34 + i * 9} r="1.8" fill={BIO.ribosome.line} />)}
          <circle cx={cx} cy={cy} r={inner} fill={BIO.nucleus.fill} opacity="0.3" />
          <circle cx={cx} cy={cy} r={outer} fill="none" stroke={on(sel, 'envelope', BIO.nucleus.line)} strokeWidth={sel === 'envelope' ? 3.5 : 2.5} strokeDasharray={dash(outer)} />
          <circle cx={cx} cy={cy} r={inner} fill="none" stroke={on(sel, 'envelope', BIO.nucleus.line)} strokeWidth={sel === 'envelope' ? 3.5 : 2.5} strokeDasharray={dash(inner)} />
          {sel === 'pore' && Array.from({ length: 10 }, (_, i) => { const a = ((i + 1) * 2 * Math.PI) / 10 - (3.5 / outer); return <circle key={i} cx={cx + 63 * Math.cos(a)} cy={cy + 63 * Math.sin(a)} r="5" fill="none" stroke={SELECTED} strokeWidth="2" />; })}
          <circle cx={cx + 20} cy={cy - 12} r="15" fill={BIO.nucleolus.fill} stroke={on(sel, 'nucleolus', BIO.nucleolus.line)} strokeWidth={sel === 'nucleolus' ? 3 : 1} />
          {['M 76 92 q 10 -14 20 0 t 18 4', 'M 82 128 q 8 10 18 0 t 22 -2', 'M 120 136 q 12 -10 22 2', 'M 96 66 q 6 -8 16 -2', 'M 146 112 q 8 12 18 2'].map((d) => (
            <path key={d} d={d} fill="none" stroke={on(sel, 'chromatin', BIO.chromatin.line)} strokeWidth={sel === 'chromatin' ? 3 : 2} strokeLinecap="round" />
          ))}
          <Label x={cx} y={194} size={11} colour="#cbd5e1">cytoplasm outside the nucleus</Label>
        </>
      )}
    />
  );
};

// ---------- Mitochondrion and chloroplast ----------

export const EnergyOrganellesVisual: React.FC<VisualProps> = () => (
  <BioDiagram testId="energy-organelles" title="Sections through a mitochondrion and a chloroplast" kind="schematic" note="chloroplast drawn longer, as it is in real cells" viewBox="0 0 240 214"
    parts={[
      { id: 'mito-outer', name: 'Outer membrane (mitochondrion)', at: [146, 40], detail: 'The smooth outer of the mitochondrion’s two membranes.' },
      { id: 'cristae', name: 'Cristae: folded inner membrane', at: [52, 58], detail: 'The inner membrane is folded many times. The folds give a large surface where respiration releases energy from glucose and stores it as ATP.' },
      { id: 'matrix', name: 'Matrix', at: [108, 64], detail: 'The fluid inside the inner membrane. It holds the mitochondrion’s own DNA and ribosomes.' },
      { id: 'envelope', name: 'Double membrane (chloroplast)', at: [26, 150], detail: 'Like a mitochondrion, a chloroplast is wrapped in two membranes.' },
      { id: 'grana', name: 'Grana: stacks of thylakoids', at: [104, 150], detail: 'Flat sacs stacked like coins. Chlorophyll in their membranes absorbs sunlight for photosynthesis.' },
      { id: 'stroma', name: 'Stroma', at: [158, 178], detail: 'The fluid around the grana, where sugar is built. It holds the chloroplast’s own DNA and ribosomes.' },
    ]}
    legend={[{ colour: BIO.mitochondria.line, label: 'mitochondrion (respiration)' }, { colour: BIO.chloroplast.line, label: 'chloroplast (photosynthesis)' }]}
    summary="Both organelles have two membranes and their own DNA. Mitochondria release energy from food in every plant and animal cell; chloroplasts, found only in plants and algae, capture energy from light."
    art={(sel) => (
      <>
        {/* Mitochondrion, about 1 to 4 µm long */}
        <ellipse cx="86" cy="58" rx="62" ry="30" fill={BIO.mitochondria.fill} opacity="0.3" stroke={on(sel, 'mito-outer', BIO.mitochondria.line)} strokeWidth={sel === 'mito-outer' ? 3.5 : 2.5} />
        <ellipse cx="86" cy="58" rx="55" ry="23" fill={sel === 'matrix' ? '#fde68a' : BIO.mitochondria.fill} opacity={sel === 'matrix' ? 0.55 : 0.35} stroke={on(sel, 'cristae', BIO.mitochondria.line)} strokeWidth={sel === 'cristae' ? 3 : 1.8} />
        {[44, 58, 72, 86, 100, 114, 128].map((x, i) => {
          const top = i % 2 === 0;
          const y0 = top ? 58 - 23 * Math.sqrt(Math.max(0, 1 - ((x - 86) / 55) ** 2)) : 58 + 23 * Math.sqrt(Math.max(0, 1 - ((x - 86) / 55) ** 2));
          const y1 = top ? 62 : 54;
          return <path key={x} d={`M ${x - 3} ${y0} L ${x - 3} ${y1} Q ${x} ${y1 + (top ? 5 : -5)} ${x + 3} ${y1} L ${x + 3} ${y0}`} fill="none" stroke={on(sel, 'cristae', BIO.mitochondria.line)} strokeWidth={sel === 'cristae' ? 2.5 : 1.6} />;
        })}
        <circle cx="96" cy="66" r="4" fill="none" stroke={BIO.chromatin.line} strokeWidth="1.5" />
        <Label x={120} y={106} size={11} colour="#fdba74">Mitochondrion · about 1–4 µm long</Label>
        {/* Chloroplast, about 5 to 10 µm long */}
        <ellipse cx="124" cy="156" rx="104" ry="36" fill={sel === 'stroma' ? '#bbf7d0' : BIO.chloroplast.fill} opacity={sel === 'stroma' ? 0.5 : 0.22} stroke={on(sel, 'envelope', BIO.chloroplast.line)} strokeWidth={sel === 'envelope' ? 3.5 : 2.5} />
        <ellipse cx="124" cy="156" rx="99" ry="31" fill="none" stroke={on(sel, 'envelope', BIO.chloroplast.line)} strokeWidth={sel === 'envelope' ? 2.5 : 1.4} />
        <path d="M 46 156 H 202" stroke={BIO.chloroplast.line} strokeWidth="1.2" />
        {[70, 104, 138, 172].map((gx) => (
          <g key={gx}>{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={gx - 11} y={142 + k * 6} width="22" height="4.4" rx="2" fill={BIO.chloroplast.fill} stroke={on(sel, 'grana', BIO.chloroplast.line)} strokeWidth={sel === 'grana' ? 1.8 : 0.8} />)}</g>
        ))}
        <circle cx="186" cy="176" r="4" fill="none" stroke={BIO.chromatin.line} strokeWidth="1.5" />
        <Label x={124} y={208} size={11} colour="#86efac">Chloroplast · about 5–10 µm long</Label>
      </>
    )}
  />
);

// ---------- The selectively permeable membrane ----------

export const MembraneModelVisual: React.FC<VisualProps> = ({ props }) => {
  const wall = Boolean((props as { wall?: boolean }).wall);
  const mx = wall ? 150 : 124; // membrane position
  const pores = [46, 78, 110, 142];
  // Membrane pieces between the pores (each pore is a 6-unit gap).
  const edges = [24, ...pores.flatMap((p) => [p - 3, p + 3]), 166];
  const segments = Array.from({ length: edges.length / 2 }, (_, i) => [edges[2 * i], edges[2 * i + 1]] as [number, number]);
  const left = wall ? 78 : 104;
  const water = Array.from({ length: 22 }, (_, i) => [10 + ((i * 37) % (left - 14)), 32 + ((i * 53) % 120)] as [number, number]);
  const waterR = Array.from({ length: 10 }, (_, i) => [mx + 16 + ((i * 41) % (226 - mx - 16)), 34 + ((i * 47) % 118)] as [number, number]);
  const soluteL: [number, number][] = [[38, 112], [24, 140]];
  const soluteR: [number, number][] = wall ? [[178, 52], [206, 84], [184, 122], [214, 142], [168, 150]] : [[160, 52], [196, 70], [172, 110], [210, 128], [150, 146], [204, 152]];
  const parts = [
    { id: 'water', name: 'Water molecules', at: [24, 50] as [number, number], detail: 'Very small particles. They pass through the membrane in both directions, but more move from the side with more water.' },
    { id: 'solute', name: 'Dissolved particles (solute)', at: [56, 140] as [number, number], detail: 'Larger particles such as sugar. The membrane holds them back, so they stay on their own side.' },
    { id: 'membrane', name: 'Cell membrane', at: [mx + 4, 172] as [number, number], detail: 'Selectively permeable: it lets water through but blocks many dissolved substances. It is alive, and stops working when the cell dies.' },
    ...(wall ? [{ id: 'wall', name: 'Cell wall (plants)', at: [100, 172] as [number, number], detail: 'A mesh of cellulose with wide gaps. It is freely permeable: water and dissolved substances pass straight through. It gives strength, not selection.' }] : []),
  ];
  return (
    <BioDiagram testId="membrane-model" title={wall ? 'Model of a plant cell boundary: wall and membrane' : 'Model of a selectively permeable membrane'} kind="model" note="particles hugely enlarged" viewBox="0 0 240 190"
      parts={parts}
      legend={[{ colour: BIO.water.fill, label: 'water' }, { colour: BIO.solute.fill, label: 'dissolved particle' }, { colour: '#38bdf8', label: 'net movement of water', shape: 'line' }]}
      summary={wall ? 'The wall lets almost everything through; the membrane is the layer that chooses. Water moves into the side with more dissolved particles.' : 'Water passes through the tiny gaps; the larger dissolved particles cannot. So water moves overall from the weaker solution into the stronger one: osmosis.'}
      art={(sel) => (
        <>
          <Label x={left / 2 + 4} y={18} size={11}>Weaker solution</Label>
          <Label x={(mx + 240) / 2 + 4} y={18} size={11}>Stronger solution</Label>
          {wall && <g>
            {Array.from({ length: 9 }, (_, i) => <line key={`h${i}`} x1={left + 4} y1={28 + i * 17} x2={left + 30} y2={36 + i * 17} stroke={on(sel, 'wall', BIO.wall.line)} strokeWidth={sel === 'wall' ? 3 : 2} />)}
            {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={left + 30} y1={28 + i * 17} x2={left + 4} y2={36 + i * 17} stroke={on(sel, 'wall', BIO.wall.line)} strokeWidth={sel === 'wall' ? 3 : 2} />)}
            <circle cx={left + 46} cy={74} r="6" fill={BIO.solute.fill} stroke={BIO.solute.line} />
          </g>}
          {segments.map(([y0, y1]) => <rect key={y0} x={mx - 4} y={y0} width="8" height={y1 - y0} rx="3" fill={on(sel, 'membrane', BIO.membrane.line)} opacity={sel === 'membrane' ? 1 : 0.85} />)}
          {[...water, ...waterR].map(([x, y], i) => <circle key={`w${i}`} cx={x} cy={y} r={sel === 'water' ? 3.4 : 2.6} fill={sel === 'water' ? SELECTED : BIO.water.fill} />)}
          {[...soluteL, ...soluteR].map(([x, y], i) => <circle key={`s${i}`} cx={x} cy={y} r="6.5" fill={sel === 'solute' ? SELECTED : BIO.solute.fill} stroke={BIO.solute.line} />)}
          {[pores[0], pores[2]].map((y) => <Arrow key={y} x1={mx - 22} y1={y} x2={mx + 22} y2={y} colour="#38bdf8" width={2.4} />)}
          {/* A dissolved particle bounces back from the membrane */}
          <path d={`M ${mx - 34} 136 Q ${mx - 12} 130 ${mx - 30} 120`} fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="3 3" />
          <Label x={mx - 24} y={154} size={10} colour="#fca5a5">blocked</Label>
        </>
      )}
    />
  );
};

// ---------- Cells in different solutions ----------

type Tonicity = 'hypotonic' | 'isotonic' | 'hypertonic';

const WaterArrows: React.FC<{ dir: 'in' | 'out' | 'none'; cx: number; cy: number; r: number }> = ({ dir, cx, cy, r }) => (
  <g>{[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([dx, dy], i) => {
    const near = { x: cx + dx * (r + 3), y: cy + dy * (r + 3) };
    const far = { x: cx + dx * (r + 16), y: cy + dy * (r + 16) };
    if (dir === 'none') return <g key={i}><Arrow x1={far.x} y1={far.y} x2={near.x} y2={near.y} colour="#7dd3fc" width={1.6} head={5} /></g>;
    const [a, b] = dir === 'in' ? [far, near] : [near, far];
    return <Arrow key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} colour="#38bdf8" width={2.2} head={6} />;
  })}</g>
);

const AnimalCell: React.FC<{ t: Tonicity; burst?: boolean }> = ({ t, burst }) => {
  const r = t === 'hypotonic' ? 36 : t === 'isotonic' ? 28 : 21;
  return (
    <>
      <rect x="0" y="0" width="120" height="110" rx="8" fill="#0ea5e9" opacity={t === 'hypertonic' ? 0.28 : t === 'isotonic' ? 0.18 : 0.08} />
      {t !== 'isotonic' && <circle cx="60" cy="55" r="28" fill="none" stroke="#f8fafc" strokeDasharray="4 3" strokeWidth="1.2" />}
      {t === 'hypertonic'
        ? <path d={wavyCircle(60, 55, r, 11, 2.2)} fill={BIO.membrane.fill} opacity="0.85" stroke={BIO.membrane.line} strokeWidth="1.5" />
        : <circle cx="60" cy="55" r={r} fill={BIO.membrane.fill} opacity="0.8" stroke={BIO.membrane.line} strokeWidth="1.5" />}
      <circle cx="56" cy="52" r="6" fill={BIO.nucleus.line} />
      {burst && <g stroke="#f87171" strokeWidth="2">{[[96, 28, 104, 20], [98, 82, 107, 90], [22, 30, 14, 22]].map(([a, b, c, d]) => <line key={a + b} x1={a} y1={b} x2={c} y2={d} />)}</g>}
      <WaterArrows dir={t === 'hypotonic' ? 'in' : t === 'hypertonic' ? 'out' : 'none'} cx={60} cy={55} r={r} />
    </>
  );
};

const PlantCell: React.FC<{ t: Tonicity }> = ({ t }) => {
  const shrink = t === 'hypertonic' ? 0.6 : t === 'isotonic' ? 0.9 : 1;
  const w = 66 * shrink, h = 58 * shrink;
  return (
    <>
      <rect x="0" y="0" width="120" height="110" rx="8" fill="#0ea5e9" opacity={t === 'hypertonic' ? 0.28 : t === 'isotonic' ? 0.18 : 0.08} />
      <rect x="24" y="22" width="72" height="64" fill="none" stroke={BIO.wall.line} strokeWidth="5" />
      <rect x={60 - w / 2} y={54 - h / 2} width={w} height={h} rx={t === 'hypertonic' ? 14 : 2} fill={BIO.plantMembrane.fill} opacity="0.6" stroke={BIO.plantMembrane.line} strokeWidth="1.5" />
      <rect x={60 - w / 2 + 8} y={54 - h / 2 + 7} width={Math.max(6, w - 16)} height={Math.max(6, h - 14)} rx="5" fill={BIO.vacuole.fill} opacity="0.75" stroke={BIO.vacuole.line} strokeWidth="1" />
      <circle cx={60 - w / 2 + 7} cy={54 - h / 2 + 7} r="4.5" fill={BIO.nucleus.line} />
      <WaterArrows dir={t === 'hypotonic' ? 'in' : t === 'hypertonic' ? 'out' : 'none'} cx={60} cy={54} r={38} />
    </>
  );
};

const TONIC: Record<Tonicity, string> = { hypotonic: 'Weaker outside (hypotonic)', isotonic: 'Equal (isotonic)', hypertonic: 'Stronger outside (hypertonic)' };

export const TonicityVisual: React.FC<VisualProps> = ({ props }) => {
  const cell = (props as { cell?: 'animal' | 'plant' | 'water' }).cell ?? 'animal';
  let panels: ComparePanel[];
  if (cell === 'water') {
    panels = [
      { label: 'Animal cell in pure water', title: 'Swells and may burst', caption: 'Water keeps entering. Only a thin membrane holds it in, so the cell can burst.', art: <AnimalCell t="hypotonic" burst /> },
      { label: 'Plant cell in pure water', title: 'Turgid but safe', caption: 'Water enters until the contents press on the wall. The strong wall pushes back and stops the cell bursting.', art: <PlantCell t="hypotonic" /> },
    ];
  } else {
    const states: Record<'animal' | 'plant', Record<Tonicity, [string, string]>> = {
      animal: { hypotonic: ['Swells', 'Water enters, the cell swells and may burst.'], isotonic: ['No change', 'Water enters and leaves equally.'], hypertonic: ['Shrinks', 'Water leaves, the cell shrinks and wrinkles.'] },
      plant: { hypotonic: ['Turgid', 'Water enters; the contents press firmly on the wall.'], isotonic: ['Flaccid', 'No net movement; the cell is limp but not shrunken.'], hypertonic: ['Plasmolysed', 'Water leaves; the membrane and contents pull away from the wall.'] },
    };
    panels = (['hypotonic', 'isotonic', 'hypertonic'] as Tonicity[]).map((t) => ({ label: TONIC[t], title: states[cell][t][0], caption: states[cell][t][1], art: cell === 'animal' ? <AnimalCell t={t} /> : <PlantCell t={t} /> }));
  }
  return (
    <BioCompare testId="tonicity-compare" title={cell === 'water' ? 'An animal cell and a plant cell in pure water' : `A ${cell} cell in three solutions`} kind="schematic" note="not to scale" viewBox="0 0 120 110" panels={panels}
      legend={[{ colour: '#38bdf8', label: 'net movement of water', shape: 'line' }, { colour: '#f8fafc', label: 'size before', shape: 'dash' }, ...(cell !== 'animal' ? [{ colour: BIO.wall.line, label: 'cell wall', shape: 'line' as const }] : [])]}
      summary="Water always moves overall towards the side with more dissolved substances. Deeper blue means a stronger outside solution." />
  );
};

export const CELL_DIAGRAMS = { nucleusSection: NucleusVisual, energyOrganelles: EnergyOrganellesVisual, membraneModel: MembraneModelVisual, tonicity: TonicityVisual };
