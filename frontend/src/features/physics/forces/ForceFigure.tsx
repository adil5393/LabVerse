/**
 * The force diagram (PHY-2A): one object with labelled arrows. Each horizontal force has its own row so that equal and
 * opposite arrows never hide each other; the net-force arrow is a separate, thicker arrow that can be switched on and
 * off together with the individual forces. Direction is shown by the arrowhead and the label (never by colour alone).
 * A text list of the same forces, with the net-force working, sits under the drawing for keyboard and screen-reader users.
 */

import React from 'react';
import { netWorking, type Arrow } from '../../../engine/physics/forces/forceDiagram';
import { PHYS } from '../motion/physicsColors';

const W = 620, H = 300, CX = W / 2, GROUND = 214, BW = 100, BH = 56;
const COLOR: Record<Arrow['kind'], string> = { applied: PHYS.force, friction: PHYS.friction, weight: PHYS.vertical, normal: PHYS.vertical, net: PHYS.netForce };
const num = (n: number): string => String(Math.round(n * 100) / 100);

const Head: React.FC<{ x: number; y: number; dir: 'left' | 'right' | 'up' | 'down'; color: string }> = ({ x, y, dir, color }) => {
  const s = 9;
  const pts = dir === 'right' ? `${x},${y} ${x - s * 1.6},${y - s} ${x - s * 1.6},${y + s}` : dir === 'left' ? `${x},${y} ${x + s * 1.6},${y - s} ${x + s * 1.6},${y + s}`
    : dir === 'up' ? `${x},${y} ${x - s},${y + s * 1.6} ${x + s},${y + s * 1.6}` : `${x},${y} ${x - s},${y - s * 1.6} ${x + s},${y - s * 1.6}`;
  return <polygon points={pts} fill={color} />;
};

export interface ForceFigureProps {
  object: string;
  arrows: Arrow[];
  net: Arrow | null;
  showIndividual: boolean;
  showNet: boolean;
  alt: string;
  /** Show the net force and individual forces listing text under the drawing. */
  listing?: boolean;
}

export const ForceFigure: React.FC<ForceFigureProps> = ({ object, arrows, net, showIndividual, showNet, alt, listing = true }) => {
  const horizontals = arrows.filter((a) => a.direction === 'left' || a.direction === 'right');
  const verticals = arrows.filter((a) => a.direction === 'up' || a.direction === 'down');
  const maxMag = Math.max(1e-9, ...horizontals.map((a) => a.magnitude), net?.magnitude ?? 0);
  const k = 190 / maxMag; // pixels per newton for the horizontal arrows (largest = 190 px)
  const len = (m: number) => Math.max(14, m * k);
  const top = GROUND - BH;
  const rowY = (i: number) => top - 22 - i * 26;
  const rows = horizontals.filter((a) => a.kind === 'applied');
  const fric = horizontals.filter((a) => a.kind === 'friction');
  const vMax = Math.max(1e-9, ...verticals.map((a) => a.magnitude));
  const vlen = (m: number) => 22 + (m / vMax) * 28;
  const netY = showIndividual ? rowY(rows.length) - 4 : rowY(0);

  const hArrow = (a: Arrow, y: number, width = 4) => {
    const L = len(a.magnitude);
    const x0 = a.direction === 'right' ? CX - BW / 2 : CX + BW / 2; // tail at the side the force comes from
    const x1 = a.direction === 'right' ? x0 + L : x0 - L;
    const color = COLOR[a.kind];
    return (
      <g key={a.id} data-arrow={a.id} data-direction={a.direction} data-magnitude={a.magnitude}>
        <line x1={x0} y1={y} x2={x1} y2={y} stroke={color} strokeWidth={width} />
        <Head x={x1} y={y} dir={a.direction} color={color} />
        <text x={(x0 + x1) / 2} y={y - 8} textAnchor="middle" fontSize={11} fontWeight={700} fill={color}>{a.label} {num(a.magnitude)} N {a.direction === 'right' ? '→' : '←'}</text>
      </g>
    );
  };

  return (
    <figure className="space-y-2 min-w-0" data-testid="force-figure">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={alt} className="w-full rounded-xl bg-surface-lowest border border-surface-border">
        <line x1={20} y1={GROUND} x2={W - 20} y2={GROUND} stroke={PHYS.axis} strokeWidth={3} />
        <rect x={CX - BW / 2} y={top} width={BW} height={BH} rx={6} fill="#1e293b" stroke={PHYS.position} strokeWidth={2} />
        <text x={CX} y={top + BH / 2 + 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#e2e8f0">{object}</text>
        {showIndividual && rows.map((a, i) => hArrow(a, rowY(i)))}
        {showIndividual && fric.map((a) => hArrow(a, GROUND - 12))}
        {showIndividual && verticals.map((a) => {
          const up = a.direction === 'up';
          const x = up ? CX - 26 : CX + 26;
          const y0 = up ? top : GROUND, y1 = up ? top - vlen(a.magnitude) : GROUND + vlen(a.magnitude) * 0.8;
          return (
            <g key={a.id} data-arrow={a.id} data-direction={a.direction} data-magnitude={a.magnitude}>
              <line x1={x} y1={y0} x2={x} y2={y1} stroke={COLOR[a.kind]} strokeWidth={3} strokeDasharray={a.kind === 'weight' ? '0' : '0'} />
              <Head x={x} y={y1} dir={a.direction} color={COLOR[a.kind]} />
              <text x={up ? x - 8 : x + 8} y={up ? (y0 + y1) / 2 + 4 : y1 + 4} textAnchor={up ? 'end' : 'start'} fontSize={11} fontWeight={700} fill={COLOR[a.kind]}>{a.label} {num(a.magnitude)} N {up ? '↑' : '↓'}</text>
            </g>
          );
        })}
        {showNet && (net
          ? <g data-arrow="net" data-direction={net.direction} data-magnitude={net.magnitude}>{hArrow(net, netY, 6)}<text x={CX} y={netY - 22} textAnchor="middle" fontSize={11} fill={PHYS.netForce}>net force on the {object}</text></g>
          : <text x={CX} y={netY} textAnchor="middle" fontSize={12} fontWeight={700} fill={PHYS.correct} data-arrow="net-zero">{'✓'} net force = 0 N (balanced)</text>)}
      </svg>
      {listing && (
        <figcaption className="text-xs text-slate-200 space-y-1" data-testid="force-listing">
          <ul className="list-disc pl-5" aria-label={`Forces on the ${object}`}>
            {arrows.map((a) => <li key={a.id}><span style={{ color: COLOR[a.kind] }} className="font-bold">{a.label}</span>: {num(a.magnitude)} N {a.direction}, exerted by {a.by} on the {a.on}</li>)}
          </ul>
          <p data-testid="net-working"><strong style={{ color: PHYS.netForce }}>Net horizontal force: </strong>{netWorking(arrows)}</p>
        </figcaption>
      )}
    </figure>
  );
};
