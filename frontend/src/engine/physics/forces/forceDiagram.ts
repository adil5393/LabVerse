/**
 * Force diagrams (PHY-2A): the arrows drawn for one object at one instant, built from the same Sample the
 * Force Laboratory computes. The NET arrow is recomputed here from the individual horizontal arrows alone, so a test
 * (and the on-screen check) can confirm the diagram agrees with the model. Every arrow names the object it acts ON and
 * the object that exerts it. Vertical forces (weight and normal) are kept apart from horizontal ones: they balance each
 * other on this horizontal track and do not enter the horizontal net force. Opposite forces on DIFFERENT objects (the
 * pairs of Newton's third law, a later milestone) are never combined here: all arrows act on the one cart.
 */

import type { Sample } from './forceModel';

export type ArrowKind = 'applied' | 'friction' | 'weight' | 'normal' | 'net';
export type Direction = 'right' | 'left' | 'up' | 'down';

export interface Arrow {
  id: string;
  kind: ArrowKind;
  /** Short label drawn next to the arrow. */
  label: string;
  /** What exerts the force. */
  by: string;
  /** The object the force acts on. */
  on: string;
  /** Size in newtons (≥ 0). */
  magnitude: number;
  direction: Direction;
  /** Signed horizontal value (right +); 0 for vertical arrows. */
  horizontal: number;
}

const horiz = (id: string, kind: ArrowKind, label: string, by: string, value: number): Arrow | null =>
  Math.abs(value) < 1e-12 ? null : { id, kind, label, by, on: 'cart', magnitude: Math.abs(value), direction: value > 0 ? 'right' : 'left', horizontal: value };

/** The individual forces on the cart (no net arrow). */
export function individualForces(p: Sample): Arrow[] {
  const out: (Arrow | null)[] = [
    horiz('A', 'applied', 'Push A', 'hand A', p.forceA),
    horiz('B', 'applied', 'Push B', 'hand B', p.forceB),
    horiz('friction', 'friction', p.frictionKind === 'static' ? 'Static friction' : 'Friction', 'the surface', p.friction),
  ];
  const arrows = out.filter((a): a is Arrow => a !== null);
  arrows.push({ id: 'normal', kind: 'normal', label: 'Normal force', by: 'the surface', on: 'cart', magnitude: p.normal, direction: 'up', horizontal: 0 });
  arrows.push({ id: 'weight', kind: 'weight', label: 'Weight', by: 'the Earth', on: 'cart', magnitude: p.weight, direction: 'down', horizontal: 0 });
  return arrows;
}

/** Net horizontal force recomputed from the arrows alone. */
export const netFromArrows = (arrows: Arrow[]): number => arrows.reduce((s, a) => s + a.horizontal, 0);
/** Net vertical force from the arrows alone (up positive). */
export const verticalNetFromArrows = (arrows: Arrow[]): number => arrows.reduce((s, a) => s + (a.direction === 'up' ? a.magnitude : a.direction === 'down' ? -a.magnitude : 0), 0);

export function netArrow(arrows: Arrow[]): Arrow | null {
  const net = netFromArrows(arrows);
  return Math.abs(net) < 1e-9 ? null : { id: 'net', kind: 'net', label: 'Net force', by: 'all the forces together', on: 'cart', magnitude: Math.abs(net), direction: net > 0 ? 'right' : 'left', horizontal: net };
}

export interface Diagram { arrows: Arrow[]; net: Arrow | null; netValue: number; verticalNet: number; text: string }

export function diagramOf(p: Sample): Diagram {
  const arrows = individualForces(p);
  const net = netArrow(arrows);
  const netValue = netFromArrows(arrows);
  const verticalNet = verticalNetFromArrows(arrows);
  return { arrows, net, netValue, verticalNet, text: describeDiagram(arrows, net, p) };
}

const r = (n: number): string => String(Math.round(n * 100) / 100);

export function describeDiagram(arrows: Arrow[], net: Arrow | null, p: Pick<Sample, 'a'>): string {
  const list = arrows.map((a) => `${a.label} on the cart, by ${a.by}: ${r(a.magnitude)} N ${a.direction}`).join('; ');
  const sum = net ? `Net horizontal force ${r(net.magnitude)} N ${net.direction}, so the acceleration points ${net.direction}.` : 'The horizontal forces cancel: the net force is zero and there is no acceleration. Weight and the normal force also cancel vertically.';
  void p;
  return `Force diagram of the cart. ${list}. ${sum}`;
}

/** The working of the net force as a line of arithmetic, e.g. "10 N right + 6 N left = 4 N right". */
export function netWorking(arrows: Arrow[]): string {
  const h = arrows.filter((a) => a.direction === 'left' || a.direction === 'right');
  if (h.length === 0) return 'No horizontal forces: net force = 0 N';
  const terms = h.map((a) => `${r(a.magnitude)} N ${a.direction}`).join(' + ');
  const net = netFromArrows(arrows);
  return `${terms}  →  ${net === 0 ? '0 N (balanced)' : `${r(Math.abs(net))} N ${net > 0 ? 'right' : 'left'}`}`;
}
