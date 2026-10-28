/**
 * Schematic drawings for the separation bench: the mixture before separation, and the apparatus the model chose with the
 * material flow and labelled inputs and outputs. What goes where is worked out from the mixture's properties (boiling points,
 * layers, which solid sublimes or is magnetic), never from its name, so the drawing always agrees with `chooseMethod`.
 * Drawings are schematic and not to scale. Labels use 13-unit text in a 320-unit-wide picture, about 11 px at a 320 px screen.
 */

import React from 'react';
import { BOILING_POINTS, type Method, type MixtureCase } from '../../../engine/chemistry/mixtures/model';

const W = 320, H = 220;
const INK = '#e2e8f0', MUTED = '#94a3b8', GLASS = '#cbd5e1';
const A = '#38bdf8'; // the part that leaves or is collected
const B = '#c4b5fd'; // the part that stays behind

export interface SeparationRoles {
  /** One line naming the mixture that goes in. */
  input: string;
  /** What is collected, or leaves the mixture. */
  out: string;
  /** What stays behind. */
  stays: string;
}

/** Which part goes where for this mixture and method, read from the properties. */
export function separationRoles(c: MixtureCase, method: Method): SeparationRoles {
  const [p0, p1] = c.parts ?? ['part 1', 'part 2'];
  if (c.liquids && c.boilingPoints) {
    const [la, lb] = c.liquids;
    const [lo, hi] = BOILING_POINTS[la] <= BOILING_POINTS[lb] ? [la, lb] : [lb, la];
    return { input: `${la} + ${lb}`, out: `${lo} (boils ${BOILING_POINTS[lo]} °C)`, stays: `${hi} (boils ${BOILING_POINTS[hi]} °C)` };
  }
  switch (method) {
    case 'separating-funnel': return { input: `${p0} + ${p1}`, out: `lower layer: ${p1}`, stays: `upper layer: ${p0}` };
    case 'distillation': return { input: `${p0} dissolved in ${p1}`, out: `pure ${p1}`, stays: p0 };
    case 'evaporation': return { input: `${p0} dissolved in ${p1}`, out: `${p1} vapour (lost)`, stays: p0 };
    case 'crystallization': return { input: `impure ${p0} in hot ${p1}`, out: `pure ${p0} crystals`, stays: 'impurities, still dissolved' };
    case 'filtration': return { input: `${p0} + ${p1}`, out: `filtrate: ${p1}`, stays: `residue: ${p0}` };
    case 'centrifugation': return { input: `${p0} in ${p1}`, out: `top: ${p1}`, stays: `bottom: ${p0}` };
    case 'coagulation': return { input: `${p0} in ${p1}`, out: `clear ${p1} on top`, stays: `${p0} settles` };
    case 'sublimation': return { input: `${p0} + ${p1}`, out: `${p0} on the cool funnel`, stays: `${p1} in the dish` };
    case 'magnet': return { input: `${p0} + ${p1}`, out: `${p0} on the magnet`, stays: `${p1} left behind` };
    case 'dissolve-filter-evaporate': return { input: `${p0} + ${p1}`, out: `${p0} after evaporating`, stays: `${p1} on the filter paper` };
    case 'chromatography': return { input: p1, out: `separate ${p0}`, stays: 'paper' };
    default: return { input: `${p0} + ${p1}`, out: '—', stays: '—' };
  }
}

const T: React.FC<{ x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; fill?: string; bold?: boolean }> = ({ x, y, children, anchor = 'start', fill = INK, bold }) => (
  <text x={x} y={y} fontSize="13" textAnchor={anchor} fill={fill} fontWeight={bold ? 700 : 400}>{children}</text>
);
/** A label split into two lines at its first ': ' or ' (' so long names stay inside the picture. */
const T2: React.FC<{ x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; fill?: string; bold?: boolean }> = ({ x, y, text, anchor = 'start', fill = INK, bold }) => {
  const m = /^(.*?)(: | \()(.*)$/.exec(text);
  const [a, b] = m ? [m[2] === ': ' ? `${m[1]}:` : m[1], m[2] === ' (' ? `(${m[3]}` : m[3]] : [text, ''];
  return (
    <text x={x} y={y} fontSize="13" textAnchor={anchor} fill={fill} fontWeight={bold ? 700 : 400}>
      <tspan x={x}>{a}</tspan>{b && <tspan x={x} dy="15">{b}</tspan>}
    </text>
  );
};
const Burner: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g aria-hidden>
    <rect x={x - 9} y={y + 8} width="18" height="16" rx="2" fill="#475569" />
    <path d={`M ${x} ${y - 10} C ${x + 8} ${y - 2} ${x + 6} ${y + 8} ${x} ${y + 8} C ${x - 6} ${y + 8} ${x - 8} ${y - 2} ${x} ${y - 10} Z`} fill="#f97316" />
    <path d={`M ${x} ${y - 3} C ${x + 3} ${y + 1} ${x + 3} ${y + 7} ${x} ${y + 7} C ${x - 3} ${y + 7} ${x - 3} ${y + 1} ${x} ${y - 3} Z`} fill="#60a5fa" />
  </g>
);
const Arrow: React.FC<{ d: string; colour?: string; animated?: boolean }> = ({ d, colour = A, animated }) => (
  <path d={d} fill="none" stroke={colour} strokeWidth="2.5" markerEnd="url(#sep-arrow)" className={animated ? 'lab-anim-flow' : undefined} />
);
const Defs: React.FC = () => (
  <defs>
    <marker id="sep-arrow" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" refX="9" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill={A} /></marker>
  </defs>
);
const Beaker: React.FC<{ x: number; y: number; w: number; h: number; fill?: string; level?: number; children?: React.ReactNode }> = ({ x, y, w, h, fill, level = 0.6, children }) => (
  <g>
    {fill && <rect x={x + 2} y={y + h * (1 - level)} width={w - 4} height={h * level - 2} fill={fill} opacity="0.55" />}
    {children}
    <path d={`M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y}`} fill="none" stroke={GLASS} strokeWidth="2" />
  </g>
);

/** The mixture before any separation, with its parts labelled. */
export const MixtureScene: React.FC<{ c: MixtureCase }> = ({ c }) => {
  const [p0, p1] = c.parts ?? c.liquids ?? ['', ''];
  const body = (() => {
    switch (c.kind) {
      case 'two-miscible-liquids':
        return <><Beaker x={110} y={60} w={100} h={110} fill="#7dd3fc" level={0.7} />
          {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={120 + (i * 37) % 80} cy={100 + (i * 23) % 60} r="3" fill={i % 2 ? A : B} />)}
          <T x={160} y={194} anchor="middle">{c.liquids?.[0]} and {c.liquids?.[1]} mixed evenly</T></>;
      case 'two-immiscible-liquids':
        return <><Beaker x={110} y={50} w={100} h={120} />
          <rect x={112} y={80} width="96" height="40" fill={B} opacity="0.6" /><rect x={112} y={120} width="96" height="48" fill={A} opacity="0.6" />
          <T x={220} y={104}>{p0}</T><T x={220} y={148}>{p1}</T><T x={160} y={194} anchor="middle">Two layers: they do not mix</T></>;
      case 'solid-in-liquid-solution':
        return <><Beaker x={110} y={60} w={100} h={110} fill={c.parts?.[0] === 'copper sulfate' ? '#3b82f6' : '#7dd3fc'} level={0.7} />
          <T x={160} y={194} anchor="middle">{p0} dissolved in {p1}: a solution</T></>;
      case 'insoluble-solid-in-liquid':
        return <><Beaker x={110} y={60} w={100} h={110} fill="#7dd3fc" level={0.7} />
          {Array.from({ length: 22 }, (_, i) => <circle key={i} cx={118 + (i * 29) % 84} cy={150 + (i * 7) % 16} r="3" fill="#d6b370" />)}
          <T x={160} y={194} anchor="middle">{p0} does not dissolve in {p1}</T></>;
      case 'fine-particles-in-liquid':
        return <><Beaker x={110} y={60} w={100} h={110} fill={c.id === 'blood' ? '#ef4444' : '#a8a29e'} level={0.7} />
          <T x={160} y={194} anchor="middle">Fine {p0} spread through {p1}</T></>;
      case 'two-solids':
        return <><path d="M 90 140 Q 160 190 230 140" fill="none" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 26 }, (_, i) => <rect key={i} x={110 + (i * 31) % 100} y={142 + (i * 11) % 18} width="6" height={i % 2 ? 3 : 6} fill={i % 2 ? '#f8fafc' : '#a16207'} />)}
          <T x={160} y={194} anchor="middle">{p0} mixed with {p1}</T></>;
      case 'coloured-components':
        return <><rect x={140} y={40} width="40" height="140" fill="#f8fafc" opacity="0.9" /><circle cx={160} cy={160} r="6" fill="#111827" />
          <T x={190} y={164}>a spot of {p1}</T></>;
      default:
        return <><rect x={110} y={110} width="100" height="40" rx="4" fill="#d4a017" /><T x={160} y={194} anchor="middle">{p0} and {p1} spread evenly: an alloy</T></>;
    }
  })();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`The mixture before separation: ${c.name}.`} data-scene="mixture">
      <T x={160} y={22} anchor="middle" bold>{c.name}</T>
      {body}
    </svg>
  );
};

/** The apparatus chosen by the model, with the flow of material and labelled input and outputs. */
export const SeparationScene: React.FC<{ c: MixtureCase; method: Method }> = ({ c, method }) => {
  const r = separationRoles(c, method);
  const label = `${c.name} separated by ${method.replace(/-/g, ' ')}: in ${r.input}; out ${r.out}; stays ${r.stays}.`;
  const io = (
    <g>
      <T x={8} y={20} fill={MUTED}>In:</T><T x={34} y={20} bold>{r.input}</T>
    </g>
  );
  const drawing = (() => {
    switch (method) {
      case 'distillation':
      case 'fractional-distillation': {
        const frac = method === 'fractional-distillation';
        const neckTop = frac ? 46 : 76;
        return <>
          <circle cx={62} cy={140} r={30} fill="none" stroke={GLASS} strokeWidth="2" />
          <path d="M 34 150 A 30 30 0 0 0 90 150 Z" fill={B} opacity="0.6" />
          <rect x={56} y={neckTop} width={12} height={112 - neckTop} fill="none" stroke={GLASS} strokeWidth="2" />
          {frac && Array.from({ length: 6 }, (_, i) => <circle key={i} cx={62} cy={56 + i * 8} r="3" fill="none" stroke={MUTED} />)}
          <Burner x={62} y={184} />
          <line x1={62} y1={neckTop} x2={110} y2={neckTop + 8} stroke={GLASS} strokeWidth="3" />
          <line x1={110} y1={neckTop + 8} x2={232} y2={150} stroke="#334155" strokeWidth="16" strokeLinecap="round" />
          <line x1={110} y1={neckTop + 8} x2={232} y2={150} stroke={GLASS} strokeWidth="3" />
          <Arrow d={`M 62 ${neckTop + 30} L 62 ${neckTop + 2} L 106 ${neckTop + 8} L 226 146`} animated />
          <T x={50} y={neckTop - 8} anchor="end" fill={A}>vapour</T>
          <T x={128} y={frac ? 50 : 66} fill={MUTED}>condenser</T>
          <path d="M 236 150 L 236 168 L 222 200 L 282 200 L 268 168 L 268 150" fill="none" stroke={GLASS} strokeWidth="2" />
          <path d="M 226 192 L 278 192 L 282 200 L 222 200 Z" fill={A} opacity="0.7" />
          <T x={312} y={frac ? 92 : 106} anchor="end" fill={A} bold>Collected:</T><T2 x={312} y={frac ? 108 : 122} anchor="end" text={r.out} />
          <T x={100} y={186} fill={MUTED}>Stays in flask:</T><T2 x={100} y={202} text={r.stays} />
          {frac && <T x={76} y={44} fill={MUTED}>column</T>}
        </>;
      }
      case 'separating-funnel':
        return <>
          <path d="M 110 40 L 210 40 L 168 140 L 168 150 L 152 150 L 152 140 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          <path d="M 116 52 L 204 52 L 189 88 L 131 88 Z" fill={B} opacity="0.65" />
          <path d="M 131 88 L 189 88 L 168 138 L 152 138 Z" fill={A} opacity="0.65" />
          <rect x={146} y={146} width="28" height="7" rx="2" fill="#64748b" />
          <Arrow d="M 160 156 L 160 176" animated />
          <Beaker x={136} y={180} w={48} h={30} fill={A} level={0.5} />
          <line x1={196} y1={70} x2={218} y2={70} stroke={MUTED} /><T2 x={222} y={68} text={r.stays} />
          <line x1={176} y1={114} x2={218} y2={114} stroke={MUTED} /><T2 x={222} y={112} text={r.out} /><T x={222} y={144} fill={A}>runs out first</T>
          <T x={16} y={150} fill={MUTED}>stopcock</T><line x1={74} y1={147} x2={144} y2={149} stroke={MUTED} />
        </>;
      case 'evaporation':
        return <>
          <path d="M 110 140 Q 160 186 210 140 Z" fill="#7dd3fc" opacity="0.4" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={132 + i * 6} y={150 + (i % 3) * 3} width="4" height="4" fill="#f8fafc" />)}
          <Burner x={160} y={192} />
          {[130, 160, 190].map((x, i) => <path key={x} d={`M ${x} 128 q 6 -10 0 -20 q -6 -10 0 -20`} fill="none" stroke={A} strokeWidth="2.5" className="lab-anim-rise" style={{ animationDelay: `${i * 0.6}s` }} />)}
          <T x={160} y={64} anchor="middle" fill={A} bold>Out: {r.out}</T>
          <line x1={224} y1={156} x2={196} y2={156} stroke={MUTED} /><T x={228} y={152} fill={MUTED}>Stays:</T><T x={228} y={168}>{r.stays}</T>
          <T x={16} y={168} fill={MUTED}>china dish</T>
        </>;
      case 'crystallization':
        return <>
          <Beaker x={60} y={60} w={90} h={110} fill="#3b82f6" level={0.7} />
          <T x={105} y={190} anchor="middle" fill={MUTED}>hot, saturated</T>
          <Arrow d="M 160 115 L 196 115" />
          <T x={178} y={104} anchor="middle" fill={MUTED}>cool</T>
          <Beaker x={206} y={60} w={90} h={110} fill="#93c5fd" level={0.7}>
            {Array.from({ length: 9 }, (_, i) => <rect key={i} x={214 + i * 9} y={156 - (i % 3) * 5} width="7" height="7" fill="#1d4ed8" transform={`rotate(45 ${217 + i * 9} ${159 - (i % 3) * 5})`} />)}
          </Beaker>
          <T x={251} y={190} anchor="middle" fill={A} bold>Out: {r.out}</T>
          <T x={251} y={206} anchor="middle">Stays: {r.stays}</T>
        </>;
      case 'filtration':
        return <>
          <path d="M 110 50 L 210 50 L 168 116 L 168 140 L 152 140 L 152 116 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          <path d="M 118 54 L 202 54 L 160 112 Z" fill="#f8fafc" opacity="0.25" stroke="#f8fafc" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={146 + (i * 7) % 28} cy={96 + (i % 3) * 4} r="2.6" fill="#d6b370" />)}
          <Arrow d="M 160 142 L 160 166" animated />
          <Beaker x={128} y={168} w={64} h={42} fill="#7dd3fc" level={0.55} />
          <line x1={186} y1={100} x2={218} y2={100} stroke={MUTED} /><T2 x={222} y={98} text={r.stays} />
          <line x1={196} y1={196} x2={218} y2={196} stroke={MUTED} /><T2 x={222} y={190} fill={A} bold text={r.out} />
          <T x={16} y={84} fill={MUTED}>filter paper</T><line x1={98} y1={80} x2={130} y2={72} stroke={MUTED} />
        </>;
      case 'sublimation':
        return <>
          <path d="M 110 150 Q 160 186 210 150 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => <rect key={i} x={128 + i * 6} y={158 + (i % 2) * 3} width="5" height="3" fill="#a16207" />)}
          <path d="M 116 146 L 204 146 L 168 70 L 168 46 L 152 46 L 152 70 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          <rect x={153} y={38} width="14" height="10" rx="3" fill="#f8fafc" />
          {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={i % 2 ? 176 + (i % 4) : 144 - (i % 4)} cy={84 + i * 5} r="2.6" fill="#f8fafc" />)}
          <Arrow d="M 160 140 L 160 100" animated />
          <Burner x={160} y={194} />
          <T x={186} y={74} fill={A} bold>Collected:</T><T2 x={186} y={90} text={r.out} />
          <T x={16} y={176}>Stays:</T><T x={16} y={192}>{r.stays}</T>
          <T x={176} y={40} fill={MUTED}>cotton plug</T>
        </>;
      case 'magnet':
        return <>
          <path d="M 90 160 Q 160 200 230 160" fill="none" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={110 + i * 6} y={166 + (i % 3) * 3} width="5" height="3" fill="#d6b370" />)}
          <path d="M 130 40 L 130 90 A 30 30 0 0 0 190 90 L 190 40" fill="none" stroke="#ef4444" strokeWidth="14" />
          <rect x={123} y={34} width="14" height="12" fill="#cbd5e1" /><rect x={183} y={34} width="14" height="12" fill="#cbd5e1" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={140 + i * 10} y={124} width="3" height="16" fill="#64748b" transform={`rotate(${i * 15 - 20} ${141 + i * 10} 132)`} />)}
          <Arrow d="M 100 150 L 100 110" />
          <T x={204} y={110} fill={A} bold>Collected:</T><T2 x={204} y={126} text={r.out} />
          <T x={16} y={200}>Stays: {r.stays}</T>
        </>;
      case 'centrifugation':
        return <>
          <rect x={70} y={50} width="34" height="120" rx="12" fill="none" stroke={GLASS} strokeWidth="2" />
          <rect x={72} y={70} width="30" height="98" rx="10" fill={c.id === 'blood' ? '#ef4444' : '#a8a29e'} opacity="0.75" />
          <T x={87} y={194} anchor="middle" fill={MUTED}>before</T>
          <path d="M 130 110 a 22 22 0 1 1 44 0" fill="none" stroke={A} strokeWidth="2.5" markerEnd="url(#sep-arrow)" />
          <T x={152} y={140} anchor="middle" fill={MUTED}>spin fast</T>
          <rect x={200} y={50} width="34" height="120" rx="12" fill="none" stroke={GLASS} strokeWidth="2" />
          <rect x={202} y={70} width="30" height="50" fill={c.id === 'blood' ? '#fde68a' : '#bae6fd'} opacity="0.85" />
          <rect x={202} y={120} width="30" height="48" rx="10" fill={c.id === 'blood' ? '#b91c1c' : '#78716c'} />
          <T2 x={240} y={92} text={r.out} /><T2 x={240} y={142} text={r.stays} />
          <T x={217} y={194} anchor="middle" fill={MUTED}>after</T>
        </>;
      case 'coagulation':
        return <>
          <Beaker x={40} y={60} w={90} h={110} fill="#a8a29e" level={0.7} />
          <T x={85} y={190} anchor="middle" fill={MUTED}>cloudy</T>
          <Arrow d="M 140 115 L 180 115" />
          <T x={160} y={104} anchor="middle" fill={MUTED}>alum</T>
          <Beaker x={190} y={60} w={90} h={110} fill="#bae6fd" level={0.7}>
            <rect x={192} y={150} width="86" height="18" fill="#78716c" />
          </Beaker>
          <T x={235} y={190} anchor="middle" fill={A} bold>{r.out}</T>
          <T x={235} y={206} anchor="middle">{r.stays}</T>
        </>;
      case 'chromatography':
        return <>
          <rect x={140} y={34} width="40" height="150" fill="#f8fafc" opacity="0.9" />
          <rect x={128} y={176} width="64" height="14" fill="#7dd3fc" opacity="0.5" />
          {[['#2563eb', 70], ['#dc2626', 110], ['#ca8a04', 140]].map(([col, y]) => <circle key={String(y)} cx={160} cy={Number(y)} r="6" fill={String(col)} />)}
          <line x1={140} y1={160} x2={180} y2={160} stroke="#334155" strokeDasharray="3 3" />
          <Arrow d="M 120 170 L 120 60" animated />
          <T x={112} y={120} anchor="end" fill={MUTED}>solvent rises</T>
          <T x={190} y={100}>{r.out}</T>
          <T x={190} y={164} fill={MUTED}>start line</T>
        </>;
      case 'dissolve-filter-evaporate':
        return <>
          <Beaker x={14} y={80} w={70} h={80} fill="#7dd3fc" level={0.7} />
          <T x={49} y={180} anchor="middle" fill={MUTED}>1 add water</T>
          <Arrow d="M 90 120 L 110 120" />
          <path d="M 118 80 L 192 80 L 162 126 L 162 140 L 148 140 L 148 126 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={146 + (i * 5) % 20} cy={112 + (i % 2) * 4} r="2.4" fill="#f8fafc" />)}
          <T x={155} y={180} anchor="middle" fill={MUTED}>2 filter</T>
          <Arrow d="M 200 120 L 220 120" />
          <path d="M 228 128 Q 266 160 304 128 Z" fill="none" stroke={GLASS} strokeWidth="2" />
          {Array.from({ length: 6 }, (_, i) => <rect key={i} x={250 + i * 6} y={134} width="4" height="4" fill="#f8fafc" />)}
          <T x={266} y={180} anchor="middle" fill={MUTED}>3 evaporate</T>
          <T x={8} y={208}>Stays: {r.stays}</T>
          <T x={312} y={208} anchor="end" fill={A} bold>{r.out}</T>
        </>;
      default:
        return <>
          <rect x={110} y={90} width="100" height="40" rx="4" fill="#d4a017" />
          <circle cx={160} cy={110} r="44" fill="none" stroke="#f87171" strokeWidth="4" /><line x1={129} y1={79} x2={191} y2={141} stroke="#f87171" strokeWidth="4" />
          <T x={160} y={180} anchor="middle">No simple physical method separates these</T>
        </>;
    }
  })();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} data-scene={method}>
      <Defs />
      {io}
      {drawing}
    </svg>
  );
};
