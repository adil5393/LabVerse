/** Small helpers for the machine scenes (kept out of the component files so fast refresh stays clean). */

import React from 'react';
import { ENERGY, PHYS } from '../motion/physicsColors';

export const f2 = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '\u2212');

export const cellOf = (k: string, label: string, v: string, color?: string) =>
  React.createElement('div', { key: k, 'data-readout': k, className: 'rounded-lg bg-surface-card px-2 py-1' },
    React.createElement('div', { className: 'text-[10px] text-slate-400' }, label),
    React.createElement('div', { className: 'font-mono text-sm font-bold', style: { color: color ?? '#e2e8f0' } }, v));

export const barColors = { input: ENERGY.work, useful: ENERGY.potential, lost: ENERGY.thermal, stored: PHYS.distance } as const;
