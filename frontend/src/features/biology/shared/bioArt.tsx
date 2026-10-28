/** Small drawing helpers shared by the Biology diagrams. */

import React from 'react';

/** A straight arrow with a solid head, drawn without SVG markers so many diagrams can sit on one page without id clashes. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; colour: string; width?: number; head?: number; dashed?: boolean }> = ({ x1, y1, x2, y2, colour, width = 2.5, head = 7, dashed }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const bx = x2 - head * Math.cos(a), by = y2 - head * Math.sin(a);
  const l = { x: bx + (head * 0.6) * Math.cos(a + Math.PI / 2), y: by + (head * 0.6) * Math.sin(a + Math.PI / 2) };
  const r = { x: bx + (head * 0.6) * Math.cos(a - Math.PI / 2), y: by + (head * 0.6) * Math.sin(a - Math.PI / 2) };
  return (
    <g aria-hidden>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={colour} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '4 3' : undefined} />
      <path d={`M ${x2} ${y2} L ${l.x} ${l.y} L ${r.x} ${r.y} Z`} fill={colour} />
    </g>
  );
};

/** A closed wavy outline around a circle (used for a shrunken, crenated animal cell). */
export function wavyCircle(cx: number, cy: number, r: number, waves = 12, depth = 2.5): string {
  const pts: string[] = [];
  for (let i = 0; i <= 96; i++) {
    const t = (i / 96) * Math.PI * 2;
    const rr = r + depth * Math.sin(t * waves);
    pts.push(`${i ? 'L' : 'M'} ${(cx + rr * Math.cos(t)).toFixed(1)} ${(cy + rr * Math.sin(t)).toFixed(1)}`);
  }
  return `${pts.join(' ')} Z`;
}

/** Text with a dark halo so it stays readable over any part of a drawing. */
export const Label: React.FC<{ x: number; y: number; children: React.ReactNode; anchor?: 'start' | 'middle' | 'end'; size?: number; colour?: string; weight?: number }> = ({ x, y, children, anchor = 'middle', size = 12, colour = '#e2e8f0', weight = 600 }) => (
  <text x={x} y={y} fontSize={size} textAnchor={anchor} fill={colour} fontWeight={weight} stroke="#0a0e16" strokeWidth="3" paintOrder="stroke" strokeLinejoin="round">{children}</text>
);
