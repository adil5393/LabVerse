/**
 * Lesson and practice diagrams for Chapter 11 (Reproduction): why gametes carry half the chromosomes, self- and
 * cross-pollination, the journey from pollen to seed, human gametes drawn to one scale, and fertilisation to implantation.
 * Flower colours match the flower explorer and the 3D flower.
 */

import React from 'react';
import type { VisualProps } from '../../education/visuals';
import { BioCompare, BioDiagram, BioSequence } from '../shared/BioDiagram';
import { Arrow, Label } from '../shared/bioArt';
import { BIO, SELECTED } from '../shared/bioPalette';

const on = (sel: string | null, id: string, base: string) => (sel === id ? SELECTED : base);

// ---------- The doubling problem ----------

const Box: React.FC<{ x: number; y: number; n: number; label: string; tone: string; warn?: boolean }> = ({ x, y, n, label, tone, warn }) => (
  <g>
    <circle cx={x} cy={y} r="17" fill={tone} opacity="0.3" stroke={warn ? '#f87171' : tone} strokeWidth={warn ? 2.5 : 1.8} />
    <text x={x} y={y + 5} fontSize="14" fontWeight="800" textAnchor="middle" fill="#fff">{n}</text>
    <Label x={x} y={y + 30} size={10}>{label}</Label>
  </g>
);

export const HalvingVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="halving-compare" title="Chromosome numbers with and without meiosis" kind="schematic" note="human numbers" viewBox="0 0 140 170"
    panels={[
      { label: 'If gametes kept every chromosome', title: 'The number doubles', caption: '46 + 46 = 92 in the child, then 184 in the next generation, and so on.', art: <>
        <Box x={34} y={22} n={46} label="parent" tone={BIO.sperm.line} /><Box x={106} y={22} n={46} label="parent" tone={BIO.egg.line} />
        <Arrow x1={42} y1={54} x2={62} y2={74} colour="#94a3b8" /><Arrow x1={98} y1={54} x2={78} y2={74} colour="#94a3b8" />
        <Box x={70} y={92} n={92} label="child" tone="#f87171" warn />
        <Arrow x1={70} y1={126} x2={70} y2={138} colour="#f87171" /><Label x={70} y={160} size={12} colour="#fca5a5">184, 368 …</Label>
      </> },
      { label: 'With meiosis', title: 'The number stays the same', caption: 'Meiosis puts 23 in each sperm and egg; fertilisation brings the zygote back to 46.', art: <>
        <Box x={34} y={22} n={46} label="parent" tone={BIO.sperm.line} /><Box x={106} y={22} n={46} label="parent" tone={BIO.egg.line} />
        <Arrow x1={34} y1={54} x2={34} y2={66} colour="#94a3b8" /><Arrow x1={106} y1={54} x2={106} y2={66} colour="#94a3b8" />
        <Box x={34} y={86} n={23} label="sperm" tone={BIO.sperm.line} /><Box x={106} y={86} n={23} label="egg" tone={BIO.egg.line} />
        <Arrow x1={46} y1={116} x2={60} y2={126} colour="#94a3b8" /><Arrow x1={94} y1={116} x2={80} y2={126} colour="#94a3b8" />
        <Box x={70} y={142} n={46} label="" tone="#34d399" /><Label x={110} y={160} size={10} colour="#6ee7b7">zygote</Label>
      </> },
    ]}
    summary="Meiosis halves the number in every gamete, so each generation keeps 23 pairs." />
);

// ---------- Self- and cross-pollination ----------

const MiniFlower: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g>
    <line x1={x} y1={y + 10 * s} x2={x} y2={y + 40 * s} stroke="#15803d" strokeWidth={3 * s} />
    <path d={`M ${x} ${y + 10 * s} C ${x - 22 * s} ${y + 2 * s} ${x - 26 * s} ${y - 22 * s} ${x - 18 * s} ${y - 30 * s} C ${x - 10 * s} ${y - 16 * s} ${x - 4 * s} ${y - 6 * s} ${x} ${y} C ${x + 4 * s} ${y - 6 * s} ${x + 10 * s} ${y - 16 * s} ${x + 18 * s} ${y - 30 * s} C ${x + 26 * s} ${y - 22 * s} ${x + 22 * s} ${y + 2 * s} ${x} ${y + 10 * s} Z`} fill={BIO.petal.fill} opacity="0.85" />
    <line x1={x} y1={y + 6 * s} x2={x} y2={y - 20 * s} stroke={BIO.style.fill} strokeWidth={2.5 * s} /><ellipse cx={x} cy={y - 22 * s} rx={5 * s} ry={2.5 * s} fill={BIO.stigma.fill} />
    {[-1, 1].map((d) => <g key={d}><line x1={x} y1={y + 6 * s} x2={x + d * 12 * s} y2={y - 14 * s} stroke={BIO.filament.fill} strokeWidth={1.5 * s} /><ellipse cx={x + d * 12 * s} cy={y - 16 * s} rx={3 * s} ry={4.5 * s} fill={BIO.anther.fill} /></g>)}
  </g>
);

export const PollinationKindsVisual: React.FC<VisualProps> = () => (
  <BioCompare testId="pollination-kinds" title="Self-pollination and cross-pollination" kind="schematic" note="not to scale" viewBox="0 0 140 130"
    panels={[
      { label: 'Self-pollination', title: 'Same flower or same plant', caption: 'Pollen from the anther reaches the stigma of the same flower, or of another flower on the same plant.', art: <>
        <MiniFlower x={70} y={60} s={1.5} />
        <path d="M 52 34 Q 58 18 68 25" fill="none" stroke={BIO.pollen.fill} strokeWidth="2.2" strokeDasharray="3 2" /><circle cx="52" cy="34" r="2.5" fill={BIO.pollen.fill} />
        <Label x={70} y={124} size={10}>one plant</Label>
      </> },
      { label: 'Cross-pollination', title: 'Another plant of the same kind', caption: 'Pollen is carried by wind, water or animals to a flower on a different plant. It mixes two plants’ chromosomes.', art: <>
        <MiniFlower x={34} y={60} /><MiniFlower x={106} y={60} />
        <path d="M 46 44 Q 70 6 104 36" fill="none" stroke={BIO.pollen.fill} strokeWidth="2.2" strokeDasharray="3 2" />
        <Arrow x1={96} y1={30} x2={104} y2={37} colour={BIO.pollen.fill} head={6} width={2} />
        <Label x={34} y={124} size={10}>plant 1</Label><Label x={106} y={124} size={10}>plant 2</Label>
      </> },
    ]}
    legend={[{ colour: BIO.pollen.fill, label: 'path of pollen', shape: 'dash' }, { colour: BIO.anther.fill, label: 'anther' }, { colour: BIO.stigma.fill, label: 'stigma' }]} />
);

// ---------- From pollen to seed ----------

/** A pistil in section, at one of four stages after pollination. */
const Pistil: React.FC<{ stage: 0 | 1 | 2 | 3 }> = ({ stage }) => {
  const fruit = stage === 3;
  const ovary = fruit ? { rx: 62, ry: 48 } : { rx: 36, ry: 30 };
  return (
    <g>
      {!fruit && <><path d="M 110 150 C 60 150 40 120 34 104" fill="none" stroke={BIO.petal.line} strokeWidth="3" opacity="0.5" /><path d="M 110 150 C 160 150 180 120 186 104" fill="none" stroke={BIO.petal.line} strokeWidth="3" opacity="0.5" /></>}
      <ellipse cx="110" cy="134" rx={ovary.rx} ry={ovary.ry} fill={fruit ? '#fb923c' : BIO.ovary.fill} opacity={fruit ? 0.55 : 0.35} stroke={fruit ? '#c2410c' : BIO.ovary.line} strokeWidth="2" />
      {!fruit && <><rect x="105" y="34" width="10" height={134 - 30 - 34} fill={BIO.style.fill} opacity="0.45" stroke={BIO.style.line} /><ellipse cx="110" cy="30" rx="20" ry="7" fill={BIO.stigma.fill} stroke={BIO.stigma.line} /></>}
      {/* The ovule; after fertilisation it becomes the seed */}
      <ellipse cx="110" cy="140" rx={fruit ? 20 : 13} ry={fruit ? 14 : 10} fill={fruit ? '#a16207' : BIO.ovule.fill} stroke={BIO.ovule.line} strokeWidth="1.5" />
      {!fruit && <circle cx="110" cy="146" r="3.6" fill={stage === 2 ? '#34d399' : BIO.egg.line} />}
      {fruit && <ellipse cx="110" cy="140" rx="8" ry="5" fill="#fde68a" />}
      {stage >= 0 && !fruit && <circle cx="98" cy="22" r="5" fill={BIO.pollen.fill} stroke={BIO.pollen.line} />}
      {(stage === 1 || stage === 2) && <path d={`M 98 26 C 104 40 108 60 108 ${stage === 1 ? 92 : 124} ${stage === 2 ? 'Q 108 136 110 142' : ''}`} fill="none" stroke={BIO.pollenTube.fill} strokeWidth="2.5" />}
      {stage === 1 && <circle cx="108" cy="92" r="2.6" fill="#38bdf8" />}
      {stage === 2 && <circle cx="110" cy="146" r="7" fill="none" stroke="#34d399" strokeWidth="2" />}
      <Label x={186} y={30} size={11} anchor="end">{fruit ? '' : 'stigma'}</Label>
      <Label x={186} y={70} size={11} anchor="end">{fruit ? '' : 'style'}</Label>
      <Label x={fruit ? 110 : 152} y={fruit ? 196 : 130} size={11} anchor={fruit ? 'middle' : 'start'}>{fruit ? 'ovary → fruit · ovule → seed' : 'ovary'}</Label>
    </g>
  );
};

export const PollenToSeedVisual: React.FC<VisualProps> = () => (
  <BioSequence testId="pollen-to-seed" title="From pollination to fruit and seed" kind="schematic" note="section through a pistil; not to scale" viewBox="0 0 220 204"
    frames={[
      { title: 'Pollen lands', caption: 'A pollen grain of the same kind of plant lands on the sticky stigma.', art: <Pistil stage={0} /> },
      { title: 'Pollen tube grows', caption: 'The pollen grain grows a tube down through the style. A male gamete moves down inside it.', art: <Pistil stage={1} /> },
      { title: 'Fertilisation', caption: 'The tube reaches the ovule. The male gamete fuses with the egg cell, forming a zygote that grows into an embryo.', art: <Pistil stage={2} /> },
      { title: 'Fruit and seed', caption: 'The ovule becomes a seed with the embryo inside; the ovary swells into the fruit. Petals wither and fall.', art: <Pistil stage={3} /> },
    ]}
    legend={[{ colour: BIO.pollen.fill, label: 'pollen grain' }, { colour: BIO.pollenTube.fill, label: 'pollen tube', shape: 'line' }, { colour: BIO.egg.line, label: 'egg cell' }, { colour: '#34d399', label: 'zygote' }]} />
);

// ---------- Sperm and egg ----------

export const GametesVisual: React.FC<VisualProps> = () => (
  <BioDiagram testId="gametes-diagram" title="A human egg and sperm drawn to the same scale, with the sperm also enlarged" kind="schematic" note="left: same scale (1 unit ≈ 1 µm)" viewBox="0 0 240 150"
    parts={[
      { id: 'egg', name: 'Egg cell', at: [66, 18], detail: 'About 0.1 mm across, one of the largest human cells. It cannot move on its own; usually one is released each month.' },
      { id: 'food', name: 'Stored food (in the egg’s cytoplasm)', at: [40, 94], detail: 'Nutrients for the zygote’s first divisions. Sperm carry no stored food.' },
      { id: 'egg-nucleus', name: 'Egg nucleus: 23 chromosomes', at: [70, 66], detail: 'Half the 46 of a body cell, because the egg forms by meiosis.' },
      { id: 'sperm', name: 'Sperm (true size, beside the egg)', at: [150, 26], detail: 'About 0.05 mm long including the tail, and made in millions. Its head is tiny compared with the egg.' },
      { id: 'head', name: 'Sperm head: 23 chromosomes', at: [158, 110], detail: 'Holds the nucleus with 23 chromosomes: an X or a Y decides the baby’s sex.' },
      { id: 'tail', name: 'Tail', at: [214, 92], detail: 'Lashes to make the sperm swim towards the egg.' },
    ]}
    legend={[{ colour: BIO.egg.line, label: 'egg' }, { colour: BIO.sperm.line, label: 'sperm' }]}
    summary="Eggs are large, few and do not move; sperm are tiny, many and swim. Both carry 23 chromosomes."
    art={(sel) => (
      <>
        <circle cx="66" cy="68" r="50" fill={BIO.egg.fill} opacity={sel === 'food' ? 0.55 : 0.32} stroke={on(sel, 'egg', BIO.egg.line)} strokeWidth={sel === 'egg' ? 3.5 : 2} />
        <circle cx="66" cy="68" r="54" fill="none" stroke={BIO.egg.line} strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
        {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={30 + ((i * 29) % 72)} cy={36 + ((i * 41) % 66)} r="1.8" fill={on(sel, 'food', '#fde68a')} opacity="0.85" />)}
        <circle cx="70" cy="66" r="10" fill={on(sel, 'egg-nucleus', BIO.nucleus.fill)} stroke={BIO.nucleus.line} />
        {/* True-size sperm: head 5 units, whole length about 55 units */}
        <g stroke={on(sel, 'sperm', BIO.sperm.line)} fill={on(sel, 'sperm', BIO.sperm.line)}>
          <ellipse cx="128" cy="40" rx="2.6" ry="1.8" />
          <path d="M 131 40 q 10 -4 18 0 t 18 0 t 16 0" fill="none" strokeWidth="0.8" />
        </g>
        <Label x={128} y={60} size={10} anchor="start">sperm, same scale</Label>
        {/* Enlarged sperm */}
        <rect x="120" y="76" width="116" height="60" rx="8" fill="none" stroke="#475569" strokeDasharray="4 3" />
        <Label x={178} y={147} size={10}>enlarged (head ×4)</Label>
        <ellipse cx="140" cy="106" rx="11" ry="7.5" fill={sel === 'head' ? SELECTED : BIO.sperm.fill} stroke={BIO.sperm.line} strokeWidth="1.5" />
        <ellipse cx="138" cy="106" rx="6" ry="4.5" fill={BIO.nucleus.line} opacity="0.8" />
        <rect x="151" y="103" width="12" height="6" rx="3" fill={BIO.sperm.line} opacity="0.7" />
        <path d="M 163 106 q 12 -10 24 0 t 24 0 t 18 -4" fill="none" stroke={on(sel, 'tail', BIO.sperm.line)} strokeWidth={sel === 'tail' ? 3 : 2} />
      </>
    )}
  />
);

// ---------- Fertilisation to implantation ----------

/** Schematic outline of one ovary, oviduct and the uterus, with the egg or embryo at a point along its journey. */
const Journey: React.FC<{ stage: 0 | 1 | 2 | 3 }> = ({ stage }) => {
  const at = [{ x: 38, y: 64 }, { x: 74, y: 40 }, { x: 128, y: 48 }, { x: 150, y: 104 }][stage];
  return (
    <g>
      <path d="M 120 46 C 120 104 136 140 160 140 C 184 140 200 104 200 46 Z" fill="#fecdd3" opacity="0.25" stroke="#fb7185" strokeWidth="2" />
      <path d="M 124 52 C 126 100 140 132 160 132 C 180 132 194 100 196 52" fill="none" stroke="#e11d48" strokeWidth={stage === 3 ? 6 : 2.5} opacity={stage === 3 ? 0.7 : 0.45} />
      <path d="M 120 50 C 100 30 76 26 56 40" fill="none" stroke="#fb7185" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="36" cy="66" rx="16" ry="11" fill="#fda4af" opacity="0.5" stroke="#fb7185" />
      <Label x={36} y={92} size={10}>ovary</Label>
      <Label x={86} y={20} size={10}>oviduct</Label>
      <Label x={160} y={160} size={10}>uterus</Label>
      {stage === 1 && [[94, 36], [102, 42], [98, 30]].map(([x, y]) => <g key={x + y} stroke={BIO.sperm.line} fill={BIO.sperm.line}><ellipse cx={x} cy={y} rx="2" ry="1.4" /><path d={`M ${x + 2} ${y} q 4 -2 8 0`} fill="none" strokeWidth="0.8" /></g>)}
      {stage <= 1 && <circle cx={at.x} cy={at.y} r="6" fill={BIO.egg.fill} stroke={BIO.egg.line} strokeWidth="1.5" />}
      {stage === 2 && <g>{[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={at.x + dx} cy={at.y + dy} r="3.6" fill="#a7f3d0" stroke="#059669" />)}</g>}
      {stage === 3 && <g><circle cx={at.x} cy={at.y} r="9" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />{[[-4, -3], [4, -3], [0, 4]].map(([dx, dy]) => <circle key={`${dx}${dy}`} cx={at.x + dx} cy={at.y + dy} r="3" fill="#6ee7b7" />)}</g>}
      {stage === 0 && <Arrow x1={50} y1={56} x2={62} y2={46} colour="#94a3b8" head={5} width={1.8} />}
      {stage === 2 && <Arrow x1={136} y1={56} x2={144} y2={82} colour="#94a3b8" head={5} width={1.8} />}
    </g>
  );
};

export const ImplantationVisual: React.FC<VisualProps> = () => (
  <BioSequence testId="implantation" title="From ovulation to implantation" kind="schematic" note="one side shown; not to scale" viewBox="0 0 220 170"
    frames={[
      { title: 'Ovulation', caption: 'A mature egg is released from an ovary into the oviduct. The lining of the uterus is already thickening.', art: <Journey stage={0} /> },
      { title: 'Fertilisation', caption: 'If sperm are present, one fuses with the egg in the oviduct. The fertilised egg is a zygote with 46 chromosomes.', art: <Journey stage={1} /> },
      { title: 'Dividing while travelling', caption: 'The zygote divides by mitosis into a ball of cells as it moves down the oviduct towards the uterus.', art: <Journey stage={2} /> },
      { title: 'Implantation', caption: 'The ball of cells sinks into the thick, blood-rich lining, which nourishes it. Pregnancy has begun.', art: <Journey stage={3} /> },
    ]}
    legend={[{ colour: BIO.egg.line, label: 'egg' }, { colour: BIO.sperm.line, label: 'sperm' }, { colour: '#059669', label: 'zygote / embryo' }, { colour: '#e11d48', label: 'uterus lining', shape: 'line' }]} />
);

export const REPRO_DIAGRAMS = { halving: HalvingVisual, pollinationKinds: PollinationKindsVisual, pollenToSeed: PollenToSeedVisual, gametes: GametesVisual, implantation: ImplantationVisual };
