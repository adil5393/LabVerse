/**
 * Lesson and practice diagrams for Chapter 3 (Tissues in Action): levels of organisation, the three simple supporting tissues,
 * the parts of a movable joint, the neuron, and a pair of muscles working against each other. Colours come from the shared
 * Biology palette (bone, cartilage, ligament and tendon match the 2D and 3D joint models).
 */

import React from 'react';
import type { VisualProps } from '../../education/visuals';
import { BioCompare, BioDiagram, BioSequence } from '../shared/BioDiagram';
import { Arrow, Label } from '../shared/bioArt';
import { BIO, SELECTED } from '../shared/bioPalette';

const on = (sel: string | null, id: string, base: string) => (sel === id ? SELECTED : base);

// ---------- Cell → tissue → organ → organ system → organism (a plant) ----------

const Vessel: React.FC<{ x: number; y: number; w?: number; h?: number }> = ({ x, y, w = 16, h = 26 }) => (
  <g><rect x={x} y={y} width={w} height={h} fill={BIO.xylem.fill} opacity="0.25" stroke={BIO.xylem.line} strokeWidth="2.5" />{[0.3, 0.6].map((k) => <line key={k} x1={x} y1={y + h * k} x2={x + w} y2={y + h * k + 3} stroke={BIO.xylem.line} strokeWidth="1" opacity="0.7" />)}</g>
);

const Leaf: React.FC<{ x: number; y: number; dir: 1 | -1; s?: number }> = ({ x, y, dir, s = 1 }) => (
  <path d={`M ${x} ${y} q ${dir * 14 * s} ${-14 * s} ${dir * 30 * s} ${-6 * s} q ${dir * -12 * s} ${14 * s} ${dir * -30 * s} ${6 * s} Z`} fill="#4ade80" stroke="#166534" strokeWidth="1" />
);

const Plant: React.FC<{ roots: boolean }> = ({ roots }) => (
  <g>
    <line x1="0" y1="100" x2="240" y2="100" stroke="#a16207" strokeWidth="2" />
    {roots && <rect x="0" y="100" width="240" height="50" fill="#78350f" opacity="0.25" />}
    <path d="M 120 100 V 26" stroke="#15803d" strokeWidth="5" />
    <Leaf x={120} y={78} dir={1} /><Leaf x={120} y={64} dir={-1} /><Leaf x={120} y={48} dir={1} s={0.8} /><Leaf x={120} y={40} dir={-1} s={0.7} />
    {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={120 + 7 * Math.cos((a * Math.PI) / 180)} cy={20 + 7 * Math.sin((a * Math.PI) / 180)} rx="6" ry="4" transform={`rotate(${a} ${120 + 7 * Math.cos((a * Math.PI) / 180)} ${20 + 7 * Math.sin((a * Math.PI) / 180)})`} fill={BIO.petal.fill} />)}
    <circle cx="120" cy="20" r="3.5" fill={BIO.anther.fill} />
    {roots && ['M 120 100 q -4 18 -22 34', 'M 120 100 q 2 22 4 44', 'M 120 100 q 8 16 24 30', 'M 110 116 q -10 4 -18 2', 'M 128 118 q 10 2 16 -2'].map((d) => <path key={d} d={d} fill="none" stroke="#d6d3d1" strokeWidth="2" />)}
  </g>
);

export const OrganisationVisual: React.FC<VisualProps> = () => (
  <BioSequence testId="organisation-levels" title="Levels of organisation in a flowering plant" kind="schematic" note="each picture zooms out; not to scale" viewBox="0 0 240 150"
    frames={[
      { title: 'Cell', caption: 'One xylem vessel cell: a long, dead cell with thick walls stiffened by lignin.', art: <><Vessel x={104} y={30} w={32} h={90} /><Label x={120} y={142} size={12}>about 0.1 mm long</Label></> },
      { title: 'Tissue', caption: 'Many such cells joined end to end make xylem, a tissue that carries water up the plant.', art: <>{[60, 92, 124, 156].map((x, i) => [0, 1, 2, 3].map((k) => <Vessel key={`${x}${k}`} x={x + (i % 2) * 4} y={14 + k * 30} w={22} h={30} />))}<Arrow x1={210} y1={130} x2={210} y2={24} colour={BIO.water.line} /><Label x={216} y={142} size={11} anchor="end">water rises</Label></> },
      { title: 'Organ', caption: 'A stem is an organ: xylem, phloem, epidermis and other tissues work together inside it.', art: <><circle cx="120" cy="72" r="58" fill="#d9f99d" stroke="#3f6212" strokeWidth="3" />{Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return <g key={i}><circle cx={120 + 38 * Math.cos(a)} cy={72 + 38 * Math.sin(a)} r="6" fill={BIO.phloem.fill} /><circle cx={120 + 29 * Math.cos(a)} cy={72 + 29 * Math.sin(a)} r="7" fill={BIO.xylem.line} /></g>; })}<Label x={120} y={146} size={11}>stem cut across</Label></> },
      { title: 'Organ system', caption: 'Stem, leaves and flowers together form the shoot system, which makes and moves food.', art: <Plant roots={false} /> },
      { title: 'Organism', caption: 'The shoot system and the root system together make the whole plant.', art: <Plant roots /> },
    ]}
    legend={[{ colour: BIO.xylem.line, label: 'xylem' }, { colour: BIO.phloem.fill, label: 'phloem' }]}
  />
);

// ---------- Parenchyma, collenchyma, sclerenchyma ----------

const Grid: React.FC<{ kind: 'parenchyma' | 'collenchyma' | 'sclerenchyma' }> = ({ kind }) => {
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const x = 18 + c * 24 + (r % 2) * 6, y = 14 + r * 28;
    if (kind === 'parenchyma') cells.push(<circle key={`${r}${c}`} cx={x + 10} cy={y + 12} r="11" fill={BIO.parenchyma.fill} opacity="0.85" stroke={BIO.parenchyma.line} strokeWidth="1.2" />);
    else if (kind === 'collenchyma') cells.push(<g key={`${r}${c}`}><rect x={x} y={y} width="22" height="26" rx="4" fill={BIO.collenchyma.fill} opacity="0.5" stroke={BIO.collenchyma.line} strokeWidth="1.2" />{[[x, y], [x + 22, y], [x, y + 26], [x + 22, y + 26]].map(([a, b]) => <circle key={`${a}${b}`} cx={a} cy={b} r="3.6" fill={BIO.collenchyma.line} />)}</g>);
    else cells.push(<g key={`${r}${c}`}><rect x={x} y={y} width="22" height="26" rx="2" fill={BIO.sclerenchyma.fill} stroke={BIO.sclerenchyma.line} strokeWidth="1" /><ellipse cx={x + 11} cy={y + 13} rx="3" ry="5" fill="#0a0e16" /></g>);
  }
  return <>{cells}</>;
};

export const SupportTissuesVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="support-tissues" title="The three simple permanent tissues in cross-section" kind="schematic" note="cells drawn alike in size; not to scale" viewBox="0 0 120 100"
    panels={[
      { label: 'Parenchyma', title: 'Thin walls, living', caption: 'Rounded cells with air spaces between them. They store food and, with chloroplasts, make it.', art: <Grid kind="parenchyma" /> },
      { label: 'Collenchyma', title: 'Corners thickened, living', caption: 'Walls thicker at the corners. Strong but bendable support in young stems and leaf stalks.', art: <Grid kind="collenchyma" /> },
      { label: 'Sclerenchyma', title: 'Thick walls, dead', caption: 'Walls thickened with lignin leave almost no space inside. Hard, rigid support, as in coconut husk.', art: <Grid kind="sclerenchyma" /> },
    ]}
    summary="Thicker walls give stiffer support. Parenchyma and collenchyma are living; sclerenchyma cells are dead when they do their job." />
);

// ---------- Parts of a movable joint (the knee, a hinge joint) ----------

export const JointAnatomyVisual: React.FC<VisualProps> = () => (
  <BioDiagram testId="joint-anatomy" title="Section through a knee joint" kind="schematic" note="simplified front section; not to scale" viewBox="0 0 220 232"
    parts={[
      { id: 'bone', name: 'Bones', at: [110, 46], detail: 'The thigh bone above and the shin bone below. Bone is hard because its matrix holds calcium and phosphorus salts.' },
      { id: 'cartilage', name: 'Cartilage', at: [124, 143], detail: 'A smooth, slightly springy layer covering the bone ends, so they glide without grinding and shocks are cushioned.' },
      { id: 'fluid', name: 'Fluid-filled cavity', at: [96, 127], detail: 'A thin layer of slippery fluid inside the joint lubricates the cartilage surfaces.' },
      { id: 'ligament', name: 'Ligaments', at: [149, 128], detail: 'Strong, slightly stretchy bands joining bone to bone. They hold the joint together and limit how far it can move.' },
      { id: 'muscle', name: 'Muscle', at: [32, 40], detail: 'Contracts to pull on a bone. Muscles can only pull, never push.' },
      { id: 'tendon', name: 'Tendon', at: [44, 150], detail: 'A tough, non-stretchy cord joining muscle to bone, so the muscle’s pull moves the bone.' },
    ]}
    legend={[{ colour: BIO.bone.fill, label: 'bone' }, { colour: BIO.cartilage.line, label: 'cartilage' }, { colour: BIO.ligament.fill, label: 'ligament' }, { colour: BIO.tendon.line, label: 'tendon' }]}
    summary="Ligaments join bone to bone; tendons join muscle to bone. Cartilage and fluid let the bone ends move smoothly."
    art={(sel) => (
      <>
        <path d="M 80 0 L 80 80 Q 70 112 98 114 Q 110 106 122 114 Q 150 112 140 80 L 140 0 Z" fill={sel === 'bone' ? '#fef9c3' : BIO.bone.fill} stroke={on(sel, 'bone', BIO.bone.line)} strokeWidth={sel === 'bone' ? 3 : 1.5} />
        <path d="M 72 152 Q 72 142 110 142 Q 148 142 148 152 L 136 166 L 136 232 L 84 232 L 84 166 Z" fill={sel === 'bone' ? '#fef9c3' : BIO.bone.fill} stroke={on(sel, 'bone', BIO.bone.line)} strokeWidth={sel === 'bone' ? 3 : 1.5} />
        <path d="M 76 98 Q 72 116 98 118 Q 110 110 122 118 Q 148 116 144 98" fill="none" stroke={on(sel, 'cartilage', BIO.cartilage.line)} strokeWidth={sel === 'cartilage' ? 7 : 5} strokeLinecap="round" />
        <path d="M 75 146 Q 110 139 145 146" fill="none" stroke={on(sel, 'cartilage', BIO.cartilage.line)} strokeWidth={sel === 'cartilage' ? 7 : 5} strokeLinecap="round" />
        <path d="M 78 122 Q 110 114 142 122 Q 142 136 110 138 Q 78 136 78 122 Z" fill={sel === 'fluid' ? SELECTED : BIO.synovial.fill} opacity={sel === 'fluid' ? 0.8 : 0.55} />
        <path d="M 64 84 Q 56 126 70 166 M 156 84 Q 164 126 150 166" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
        {[[78, 92, 80, 168], [142, 92, 140, 168]].map(([a, b, c, d]) => <line key={a} x1={a} y1={b} x2={c} y2={d} stroke={on(sel, 'ligament', BIO.ligament.fill)} strokeWidth={sel === 'ligament' ? 8 : 6} strokeLinecap="round" opacity="0.95" />)}
        <ellipse cx="32" cy="40" rx="17" ry="38" fill={sel === 'muscle' ? SELECTED : BIO.muscle.fill} stroke={BIO.muscle.line} strokeWidth="1.5" />
        {[22, 32, 42].map((x) => <line key={x} x1={x} y1="12" x2={x} y2="68" stroke={BIO.muscle.line} strokeWidth="0.8" opacity="0.6" />)}
        <path d="M 32 78 Q 36 150 84 178" fill="none" stroke={on(sel, 'tendon', BIO.tendon.line)} strokeWidth={sel === 'tendon' ? 5 : 3.5} strokeLinecap="round" />
        <text x="110" y="18" fontSize="11" textAnchor="middle" fill="#44403c" fontWeight="700">thigh bone</text>
        <text x="110" y="222" fontSize="11" textAnchor="middle" fill="#44403c" fontWeight="700">shin bone</text>
      </>
    )}
  />
);

// ---------- The neuron ----------

export const NeuronVisual: React.FC<VisualProps> = () => (
  <BioDiagram testId="neuron-diagram" title="A neuron (nerve cell)" kind="schematic" note="the axon can be up to a metre long" viewBox="0 0 240 150"
    parts={[
      { id: 'dendrites', name: 'Dendrites', at: [22, 34], detail: 'Short branches that receive messages from other neurons or sense organs.' },
      { id: 'body', name: 'Cell body', at: [34, 96], detail: 'Contains the nucleus and most of the cytoplasm; it keeps the neuron alive.' },
      { id: 'nucleus', name: 'Nucleus', at: [58, 62], detail: 'Holds the DNA that controls the cell, as in other cells.' },
      { id: 'axon', name: 'Axon', at: [134, 70], detail: 'A long, thin extension that carries the message away from the cell body as an electrical signal. Many axons are wrapped in a fatty sheath that speeds the signal.' },
      { id: 'endings', name: 'Nerve endings', at: [218, 44], detail: 'Branches at the end of the axon that pass the message on to the next neuron, a muscle or a gland.' },
    ]}
    legend={[{ colour: BIO.neuron.line, label: 'neuron' }, { colour: BIO.myelin.fill, label: 'fatty sheath' }, { colour: '#34d399', label: 'direction of the message', shape: 'dash' }]}
    summary="A message travels one way: in through the dendrites, through the cell body, along the axon and out at the nerve endings."
    art={(sel) => {
      const c = (id: string) => on(sel, id, BIO.neuron.line);
      return (
        <>
          {[[-160, 44], [-125, 46], [-90, 40], [150, 44], [118, 42], [180, 42]].map(([a, len], i) => {
            const r = (a * Math.PI) / 180, x2 = 50 + len * Math.cos(r), y2 = 74 + len * Math.sin(r);
            return <g key={i}><line x1="50" y1="74" x2={x2} y2={y2} stroke={c('dendrites')} strokeWidth={sel === 'dendrites' ? 3.5 : 2.5} strokeLinecap="round" /><line x1={x2} y1={y2} x2={x2 - 8 * Math.cos(r + 0.6)} y2={y2 - 8 * Math.sin(r + 0.6)} stroke={c('dendrites')} strokeWidth="1.6" /><line x1={x2} y1={y2} x2={x2 + 8 * Math.cos(r - 0.6 + Math.PI)} y2={y2 + 8 * Math.sin(r - 0.6 + Math.PI)} stroke={c('dendrites')} strokeWidth="1.6" /></g>;
          })}
          <circle cx="50" cy="74" r="22" fill={sel === 'body' ? '#fef9c3' : BIO.neuron.fill} stroke={c('body')} strokeWidth={sel === 'body' ? 3 : 1.5} />
          <circle cx="52" cy="70" r="8" fill={on(sel, 'nucleus', BIO.nucleus.line)} />
          <line x1="72" y1="74" x2="200" y2="74" stroke={c('axon')} strokeWidth={sel === 'axon' ? 5 : 3.5} />
          {[86, 116, 146, 176].map((x) => <rect key={x} x={x} y="67" width="24" height="14" rx="7" fill={BIO.myelin.fill} opacity="0.9" stroke={BIO.myelin.line} strokeWidth="0.8" />)}
          {[-26, -10, 8, 24].map((d) => <g key={d}><path d={`M 200 74 Q 210 ${74 + d / 2} 220 ${74 + d}`} fill="none" stroke={c('endings')} strokeWidth="2" /><circle cx="222" cy={74 + d} r="3.5" fill={c('endings')} /></g>)}
          <Arrow x1={60} y1={124} x2={196} y2={124} colour="#34d399" dashed />
          <Label x={128} y={142} size={11} colour="#6ee7b7">message travels this way</Label>
        </>
      );
    }}
  />
);

// ---------- Muscles work in pairs ----------

const Arm: React.FC<{ bent: boolean }> = ({ bent }) => {
  const elbow = { x: 52, y: 92 };
  const hand = bent ? { x: 118, y: 44 } : { x: 64, y: 168 };
  return (
    <g>
      <line x1="44" y1="10" x2={elbow.x} y2={elbow.y} stroke={BIO.bone.fill} strokeWidth="9" strokeLinecap="round" />
      <line x1={elbow.x} y1={elbow.y} x2={hand.x} y2={hand.y} stroke={BIO.bone.fill} strokeWidth="8" strokeLinecap="round" />
      {/* Biceps in front of the upper arm, triceps behind it */}
      <ellipse cx="66" cy="50" rx={bent ? 13 : 7} ry={bent ? 22 : 32} fill={BIO.muscle.fill} stroke={BIO.muscle.line} strokeWidth={bent ? 2.5 : 1.2} />
      <ellipse cx="30" cy="52" rx={bent ? 7 : 12} ry={bent ? 32 : 26} fill={BIO.muscle.fill} opacity="0.85" stroke={BIO.muscle.line} strokeWidth={bent ? 1.2 : 2.5} />
      <line x1="66" y1={bent ? 72 : 82} x2={bent ? 66 : 58} y2={bent ? 86 : 104} stroke={BIO.tendon.line} strokeWidth="3" />
      <line x1="30" y1={bent ? 84 : 78} x2={elbow.x - 6} y2={elbow.y + 6} stroke={BIO.tendon.line} strokeWidth="3" />
      <Label x={bent ? 96 : 86} y={bent ? 92 : 50} size={11} anchor="start" colour="#fca5a5">biceps</Label>
      <Label x={6} y={124} size={11} anchor="start" colour="#fca5a5">triceps</Label>
      {bent ? <Arrow x1={104} y1={74} x2={112} y2={54} colour="#34d399" /> : <Arrow x1={70} y1={140} x2={66} y2={160} colour="#34d399" />}
    </g>
  );
};

export const MusclePairVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="muscle-pair" title="Biceps and triceps moving the forearm" kind="schematic" note="side view of the right arm; not to scale" viewBox="0 0 140 180"
    panels={[
      { label: 'Bending the arm', title: 'Biceps contracts', caption: 'The biceps shortens and thickens, pulling the forearm up. The triceps relaxes and is stretched.', art: <Arm bent /> },
      { label: 'Straightening the arm', title: 'Triceps contracts', caption: 'The triceps shortens and pulls the forearm down. Now the biceps relaxes.', art: <Arm bent={false} /> },
    ]}
    legend={[{ colour: BIO.muscle.line, label: 'muscle (thick outline: contracting)' }, { colour: BIO.tendon.line, label: 'tendon', shape: 'line' }, { colour: '#34d399', label: 'movement', shape: 'line' }]}
    summary="A muscle can only pull. So muscles work in pairs: one pulls a bone one way, its partner pulls it back." />
);

export const TISSUE_DIAGRAMS = { organisation: OrganisationVisual, supportTissues: SupportTissuesVisual, jointAnatomy: JointAnatomyVisual, neuronDiagram: NeuronVisual, musclePair: MusclePairVisual };
