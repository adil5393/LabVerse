/**
 * Lesson and practice diagrams for Chapter 12 (Diversity): three protists from a hay infusion, the body of a bread mould,
 * and the simple bodies of an alga and a moss. Organelle colours follow the shared Biology palette.
 */

import React from 'react';
import type { VisualProps } from '../../education/visuals';
import { BioCompare, BioDiagram } from '../shared/BioDiagram';
import { Label } from '../shared/bioArt';
import { BIO, SELECTED } from '../shared/bioPalette';

const on = (sel: string | null, id: string, base: string) => (sel === id ? SELECTED : base);

// ---------- Protists ----------

const Paramecium = () => (
  <g>
    <path d="M 20 60 C 20 30 60 22 96 30 C 116 36 118 54 108 66 C 96 82 46 92 28 80 C 22 76 20 68 20 60 Z" fill="#e0f2fe" opacity="0.35" stroke="#7dd3fc" strokeWidth="1.5" />
    {Array.from({ length: 34 }, (_, i) => { const t = (i / 34) * Math.PI * 2; const x = 66 + 47 * Math.cos(t), y = 56 + 30 * Math.sin(t); return <line key={i} x1={x} y1={y} x2={x + 5 * Math.cos(t)} y2={y + 5 * Math.sin(t)} stroke="#7dd3fc" strokeWidth="0.9" />; })}
    <ellipse cx="62" cy="56" rx="12" ry="8" fill={BIO.nucleus.fill} stroke={BIO.nucleus.line} />
    <circle cx="36" cy="54" r="5" fill="none" stroke={BIO.vacuole.line} strokeWidth="1.5" /><circle cx="96" cy="50" r="5" fill="none" stroke={BIO.vacuole.line} strokeWidth="1.5" />
    <path d="M 70 72 Q 80 64 92 70" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
  </g>
);
const Amoeba = () => (
  <g>
    <path d="M 30 60 C 14 46 26 26 44 34 C 50 14 74 16 76 34 C 96 26 112 40 100 56 C 118 68 104 90 84 80 C 78 98 52 96 52 80 C 34 88 20 76 30 60 Z" fill="#e0f2fe" opacity="0.35" stroke="#7dd3fc" strokeWidth="1.5" />
    <circle cx="64" cy="56" r="9" fill={BIO.nucleus.fill} stroke={BIO.nucleus.line} />
    <circle cx="44" cy="66" r="5" fill="none" stroke={BIO.vacuole.line} strokeWidth="1.5" /><circle cx="84" cy="44" r="6" fill="#fde68a" opacity="0.7" />
  </g>
);
const Euglena = () => (
  <g>
    <path d="M 18 58 C 30 40 70 38 96 50 C 104 54 104 62 96 66 C 70 78 30 76 18 58 Z" fill="#dcfce7" opacity="0.3" stroke="#86efac" strokeWidth="1.5" />
    <path d="M 100 56 C 110 46 116 66 126 52" fill="none" stroke="#86efac" strokeWidth="1.5" />
    {[[40, 54], [52, 64], [64, 52], [76, 62], [46, 62]].map(([x, y]) => <ellipse key={x + y} cx={x} cy={y} rx="5" ry="2.8" fill={BIO.chloroplast.fill} stroke={BIO.chloroplast.line} strokeWidth="0.6" />)}
    <circle cx="60" cy="58" r="6" fill={BIO.nucleus.fill} stroke={BIO.nucleus.line} />
    <circle cx="92" cy="54" r="2.6" fill="#ef4444" />
  </g>
);

export const ProtistsVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="protists" title="Three protists seen in a hay infusion" kind="schematic" note="each about 0.05 to 0.3 mm; not to the same scale" viewBox="0 0 130 110"
    panels={[
      { label: 'Paramecium', title: 'Moves with cilia', caption: 'Slipper-shaped and covered in tiny hair-like cilia that beat to swim. Eats bacteria through a groove.', art: <Paramecium /> },
      { label: 'Amoeba', title: 'Changes shape', caption: 'Pushes out false feet to crawl and to surround its food.', art: <Amoeba /> },
      { label: 'Euglena', title: 'Green and swimming', caption: 'Has chloroplasts to make food in light, a whip-like flagellum to swim, and a red eyespot.', art: <Euglena /> },
    ]}
    legend={[{ colour: BIO.nucleus.line, label: 'nucleus' }, { colour: BIO.chloroplast.fill, label: 'chloroplast' }, { colour: BIO.vacuole.line, label: 'vacuole', shape: 'line' }]}
    summary="All three are single eukaryotic cells: each has a true nucleus. That is why they are Protista, not Monera." />
);

// ---------- Bread mould ----------

export const FungusVisual: React.FC<VisualProps> = () => (
  <BioDiagram testId="fungus-diagram" title="Bread mould growing on bread" kind="schematic" note="threads hugely enlarged" viewBox="0 0 240 170"
    parts={[
      { id: 'sporangium', name: 'Sporangium (spore case)', at: [62, 22], detail: 'A round case on a raised thread, full of spores. It turns black as they ripen; this is the black dust on mouldy bread.' },
      { id: 'spores', name: 'Spores', at: [178, 22], detail: 'Tiny, light cells released from the case and carried by air. Each can grow into a new mould where it lands on damp food.' },
      { id: 'hyphae', name: 'Hyphae', at: [116, 96], detail: 'Fine threads, each a tube with a wall of chitin. They spread over and into the bread.' },
      { id: 'mycelium', name: 'Mycelium', at: [200, 108], detail: 'The whole network of hyphae: the body of the fungus.' },
      { id: 'rhizoids', name: 'Root-like threads', at: [40, 146], detail: 'Branched threads that grow into the bread, release enzymes and absorb the digested food. The fungus cannot make its own food.' },
    ]}
    legend={[{ colour: BIO.hypha.fill, label: 'hyphae' }, { colour: BIO.spore.fill, label: 'spore case' }, { colour: '#cbd5e1', label: 'spores' }, { colour: '#d6a35c', label: 'bread', shape: 'line' }]}
    summary="A fungus is a mass of threads that digests dead food from the outside and absorbs it: a decomposer."
    art={(sel) => (
      <>
        <rect x="0" y="118" width="240" height="52" fill="#d6a35c" opacity="0.35" />
        <line x1="0" y1="118" x2="240" y2="118" stroke="#d6a35c" strokeWidth="2" />
        <path d="M 6 104 C 50 92 90 112 130 100 C 170 88 200 106 236 98" fill="none" stroke={on(sel, 'hyphae', BIO.hypha.line)} strokeWidth={sel === 'hyphae' ? 3.2 : 2.2} />
        <path d="M 10 112 C 60 106 110 120 160 108 C 190 102 214 114 238 110" fill="none" stroke={on(sel, 'mycelium', BIO.hypha.line)} strokeWidth={sel === 'mycelium' ? 3 : 1.6} />
        {sel === 'mycelium' && <rect x="2" y="88" width="236" height="30" rx="8" fill="none" stroke={SELECTED} strokeDasharray="4 3" />}
        {[[40, 102], [100, 106], [150, 98], [196, 102]].map(([x, y]) => (
          <g key={x}>
            {[-8, 0, 8].map((d) => <path key={d} d={`M ${x} ${y + 12} q ${d} 14 ${d * 1.8} 30`} fill="none" stroke={on(sel, 'rhizoids', BIO.rhizoid.line)} strokeWidth={sel === 'rhizoids' ? 2.4 : 1.4} />)}
            <line x1={x} y1={y} x2={x} y2={y - 58 + (x % 3) * 6} stroke={BIO.hypha.line} strokeWidth="2" />
            <circle cx={x} cy={y - 66 + (x % 3) * 6} r="10" fill={BIO.spore.fill} stroke={on(sel, 'sporangium', BIO.spore.line)} strokeWidth={sel === 'sporangium' ? 3 : 1.2} />
            <circle cx={x} cy={y - 66 + (x % 3) * 6} r="10" fill="none" stroke={sel === 'sporangium' ? SELECTED : '#475569'} strokeWidth="1" />
          </g>
        ))}
        {[[164, 30], [172, 18], [184, 34], [192, 22], [204, 14], [210, 30], [176, 46]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r={sel === 'spores' ? 3 : 2.2} fill={sel === 'spores' ? SELECTED : '#cbd5e1'} />)}
        <Label x={226} y={162} size={11} anchor="end" colour="#fde68a">bread</Label>
      </>
    )}
  />
);

// ---------- Alga and moss ----------

const Spirogyra = () => (
  <g>
    {[0, 1, 2].map((k) => <g key={k}>
      <rect x={10 + k * 36} y="40" width="36" height="26" fill="#bbf7d0" opacity="0.18" stroke="#86efac" strokeWidth="1.3" />
      <path d={`M ${10 + k * 36} 46 q 6 14 12 0 t 12 0 t 12 0`} fill="none" stroke={BIO.chloroplast.fill} strokeWidth="3.2" />
      <circle cx={28 + k * 36} cy="53" r="3.2" fill={BIO.nucleus.fill} stroke={BIO.nucleus.line} />
    </g>)}
    <Label x={64} y={88} size={10}>a thread of identical cells</Label>
  </g>
);
const Moss = () => (
  <g>
    <line x1="0" y1="78" x2="130" y2="78" stroke="#a16207" strokeWidth="1.5" />
    {[42, 64, 86].map((x, i) => <g key={x}>
      <line x1={x} y1="78" x2={x} y2={40 + i * 4} stroke="#15803d" strokeWidth="2.5" />
      {[0, 1, 2, 3].map((k) => <g key={k}><path d={`M ${x} ${74 - k * 9} l -8 -4`} stroke="#4ade80" strokeWidth="2.2" /><path d={`M ${x} ${70 - k * 9} l 8 -4`} stroke="#4ade80" strokeWidth="2.2" /></g>)}
      {i === 1 && <><line x1={x} y1={44} x2={x + 4} y2={12} stroke="#a16207" strokeWidth="1.2" /><ellipse cx={x + 5} cy={10} rx="3" ry="6" fill="#a16207" /></>}
      {[-6, 0, 6].map((d) => <path key={d} d={`M ${x} 78 q ${d} 8 ${d * 1.6} 16`} fill="none" stroke={BIO.rhizoid.fill} strokeWidth="1" />)}
    </g>)}
    <Label x={66} y={106} size={10}>a clump of moss plants</Label>
  </g>
);

export const SimplePlantsVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="simple-plants" title="An alga and a moss compared" kind="schematic" note="not to the same scale" viewBox="0 0 130 110"
    panels={[
      { label: 'Alga (Spirogyra)', title: 'Thallophyta: no roots, stems or leaves', caption: 'A green thread of cells with spiral chloroplasts. Every cell takes in water and gases straight from the pond.', art: <Spirogyra /> },
      { label: 'Moss', title: 'Bryophyta: simple parts, no vascular tissue', caption: 'Rhizoids anchor it; stem-like and leaf-like parts make food. Spores form in a capsule on a stalk. It needs water for reproduction.', art: <Moss /> },
    ]}
    legend={[{ colour: BIO.chloroplast.fill, label: 'chloroplast / green tissue' }, { colour: BIO.rhizoid.fill, label: 'rhizoids', shape: 'line' }]}
    summary="Neither has xylem or phloem, so both stay small and live where water is easy to reach." />
);

export const DIVERSITY_DIAGRAMS = { protists: ProtistsVisual, fungusBody: FungusVisual, simplePlants: SimplePlantsVisual };
