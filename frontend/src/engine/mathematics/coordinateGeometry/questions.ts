/**
 * Question factories for the Coordinate Geometry lessons.
 *
 * Every expected answer AND every targeted wrong-answer explanation is
 * computed from the same Pt values that the lesson's diagram is drawn from.
 */

import type { ChoiceQuestion, FeedbackEntry, NumericQuestion, NumericRule, VisualQuestion, VisualRef } from '../../education/types';
import { describeLocus, distance, distanceFromAxes, fmtNum, fmtPoint, legs, locate, midpointOf, pointId, swapCoordinates, type Pt } from './learn';

export const RANGE: [number, number, number, number] = [-6, 6, -6, 6];

export interface PlaneSpec {
  range?: [number, number, number, number];
  mode?: 'view' | 'explore' | 'pick' | 'choose' | 'distance';
  points?: { x: number; y: number; label?: string; color?: string }[];
  start?: Pt;
  a?: Pt;
  b?: Pt;
  quadrants?: boolean;
  projections?: boolean;
  legs?: boolean;
  midpoint?: boolean;
  segment?: boolean;
}

export const plane = (spec: PlaneSpec, alt: string): VisualRef => ({ kind: 'plane', props: { range: RANGE, ...spec }, alt });

/** Alt text that lists every labelled point, generated from the data itself. */
export const altForPoints = (intro: string, pts: { x: number; y: number; label?: string }[]): string =>
  `${intro} ${pts.map((p) => `${p.label ? `Point ${p.label}` : 'A point'} at ${fmtPoint(p)}`).join('; ')}.`;

// ---------------------------------------------------------------------------
// Plotting
// ---------------------------------------------------------------------------

export function plotQ(id: string, target: Pt): VisualQuestion {
  const feedback: Record<string, FeedbackEntry> = {};
  const sw = swapCoordinates(target);
  const add = (p: Pt, entry: FeedbackEntry) => {
    if (pointId(p.x, p.y) !== pointId(target.x, target.y)) feedback[pointId(p.x, p.y)] = entry;
  };
  add(sw, { message: `You placed ${fmtPoint(sw)}, which has the two numbers the other way round. In ${fmtPoint(target)} the FIRST number (${target.x}) says how far across, and the second (${target.y}) how far up or down.`, refresherId: 'cg-ord-order', misconception: 'swapped_coordinates' });
  add({ x: -target.x, y: target.y }, { message: `That is ${fmtPoint({ x: -target.x, y: target.y })}. Check the sign of x: ${target.x} means ${target.x < 0 ? 'left' : 'right'} of the y-axis.`, refresherId: 'cg-nl-sign', misconception: 'x_sign' });
  add({ x: target.x, y: -target.y }, { message: `That is ${fmtPoint({ x: target.x, y: -target.y })}. Check the sign of y: ${target.y} means ${target.y < 0 ? 'below' : 'above'} the x-axis.`, refresherId: 'cg-nl-sign', misconception: 'y_sign' });
  return {
    kind: 'visual', id,
    prompt: `Plot the point ${fmtPoint(target)}. Choose its place on the grid, then press the place button.`,
    visual: plane({ mode: 'pick' }, 'An empty coordinate plane. Choose a grid intersection with the arrow buttons or by tapping.'),
    correctId: pointId(target.x, target.y), feedback,
    defaultFeedback: { message: `Start at the origin O. Move ${Math.abs(target.x)} ${target.x < 0 ? 'left' : 'right'} for x = ${target.x}, then ${Math.abs(target.y)} ${target.y < 0 ? 'down' : 'up'} for y = ${target.y}.`, refresherId: 'cg-ord-order', misconception: 'plot_path' },
    explanation: `Yes: ${Math.abs(target.x)} ${target.x < 0 ? 'left' : 'right'}, then ${Math.abs(target.y)} ${target.y < 0 ? 'down' : 'up'} gives ${fmtPoint(target)}.`,
  };
}

/** Choose, among labelled points, the one with the given coordinates. The decoys are the classic mistakes. */
export function readQ(id: string, target: Pt): VisualQuestion & { points: { x: number; y: number; label: string }[] } {
  const raw: { p: Pt; why: string; m: string }[] = [
    { p: target, why: '', m: '' },
    { p: swapCoordinates(target), why: 'swapped', m: 'swapped_coordinates' },
    { p: { x: -target.x, y: target.y }, why: 'x_sign', m: 'x_sign' },
    { p: { x: target.x, y: -target.y }, why: 'y_sign', m: 'y_sign' },
  ];
  const seen = new Set<string>();
  const kept = raw.filter((r) => !seen.has(pointId(r.p.x, r.p.y)) && seen.add(pointId(r.p.x, r.p.y)));
  // Deterministic arrangement so the correct point is not always labelled A.
  const arranged = kept.map((_, i) => kept[(i + 2) % kept.length]);
  const labels = ['A', 'B', 'C', 'D'];
  const points = arranged.map((r, i) => ({ x: r.p.x, y: r.p.y, label: labels[i] }));
  const feedback: Record<string, FeedbackEntry> = {};
  let correctId = '';
  arranged.forEach((r, i) => {
    const lab = points[i].label;
    if (r.why === '') { correctId = lab; return; }
    const msg =
      r.why === 'swapped' ? `Point ${lab} is ${fmtPoint(r.p)}: that has the numbers the other way round. The first number is the across-distance.`
      : r.why === 'x_sign' ? `Point ${lab} is ${fmtPoint(r.p)}; its x is ${r.p.x}, but we need ${target.x}. Which side of the y-axis should the point be on?`
      : `Point ${lab} is ${fmtPoint(r.p)}; its y is ${r.p.y}, but we need ${target.y}. Is the point above or below the x-axis?`;
    feedback[lab] = { message: msg, refresherId: r.why === 'swapped' ? 'cg-ord-order' : 'cg-nl-sign', misconception: r.m };
  });
  return {
    kind: 'visual', id,
    prompt: `Which labelled point has coordinates ${fmtPoint(target)}?`,
    visual: plane({ mode: 'choose', points }, altForPoints('A coordinate plane with labelled points:', points)),
    correctId, feedback,
    defaultFeedback: { message: 'Pick one of the labelled points.' },
    explanation: `Point ${correctId} is ${Math.abs(target.x)} ${target.x < 0 ? 'left' : 'right'} and ${Math.abs(target.y)} ${target.y < 0 ? 'down' : 'up'} from O.`,
    points,
  };
}

// ---------------------------------------------------------------------------
// Reading coordinates (numeric)
// ---------------------------------------------------------------------------

export function coordinateQ(id: string, p: Pt, which: 'x' | 'y', label = 'P'): NumericQuestion {
  const ans = p[which];
  const other = p[which === 'x' ? 'y' : 'x'];
  const rules: NumericRule[] = [];
  if (other !== ans) rules.push({ values: [other], entry: { message: `That is the ${which === 'x' ? 'y' : 'x'}-coordinate. The ${which}-coordinate is ${which === 'x' ? 'the across distance, measured from the y-axis' : 'the up/down distance, measured from the x-axis'}.`, refresherId: 'cg-ord-order', misconception: 'swapped_coordinates' } });
  if (ans !== 0) rules.push({ values: [-ans], entry: { message: `The size is right but the sign is not. ${which === 'x' ? (ans < 0 ? 'Left' : 'Right') : (ans < 0 ? 'Below' : 'Above')} of the axis means ${ans < 0 ? 'negative' : 'positive'}.`, refresherId: 'cg-nl-sign', misconception: which === 'x' ? 'x_sign' : 'y_sign' } });
  return {
    kind: 'numeric', id,
    prompt: `What is the ${which}-coordinate of point ${label}?`,
    visual: plane({ mode: 'view', points: [{ ...p, label }], projections: false }, altForPoints('A coordinate plane with', [{ ...p, label }])),
    answer: ans, rules,
    defaultFeedback: { message: `Look at the point and count units ${which === 'x' ? 'across from the y-axis (right is positive, left is negative)' : 'up or down from the x-axis (up is positive, down is negative)'}.`, refresherId: 'cg-ord-order' },
    explanation: `${label} = ${fmtPoint(p)}, so the ${which}-coordinate is ${ans}.`,
  };
}

// ---------------------------------------------------------------------------
// Quadrants and axes
// ---------------------------------------------------------------------------

const QOPTS = [
  { id: 'q1', text: 'Quadrant I' }, { id: 'q2', text: 'Quadrant II' }, { id: 'q3', text: 'Quadrant III' }, { id: 'q4', text: 'Quadrant IV' }, { id: 'axis', text: 'On an axis (no quadrant)' },
];
const SIGNS: Record<string, string> = { q1: '(+, +)', q2: '(−, +)', q3: '(−, −)', q4: '(+, −)' };
const sgn = (n: number) => (n > 0 ? '+' : n < 0 ? '−' : '0');

export function quadrantAnswerId(p: Pt): string {
  const l = locate(p);
  return l.kind === 'quadrant' ? `q${l.n}` : 'axis';
}

export function quadrantQ(id: string, p: Pt, label = 'P'): ChoiceQuestion {
  const correctId = quadrantAnswerId(p);
  const feedback: Record<string, FeedbackEntry> = {};
  for (const o of QOPTS) {
    if (o.id === correctId) continue;
    feedback[o.id] = o.id === 'axis'
      ? { message: `A point is on an axis only when one coordinate is 0. Here the signs are (${sgn(p.x)}, ${sgn(p.y)}), neither is zero, so ${label} is inside a quadrant.`, refresherId: 'cg-q-signs', misconception: 'axis_vs_quadrant' }
      : { message: `${o.text} has signs ${SIGNS[o.id]}, but ${label} = ${fmtPoint(p)} has signs (${sgn(p.x)}, ${sgn(p.y)}). Match the signs of x and y to the quadrant.`, refresherId: 'cg-q-signs', misconception: 'quadrant_signs' };
  }
  return {
    kind: 'choice', id,
    prompt: `Which region contains ${label} = ${fmtPoint(p)}?`,
    visual: plane({ mode: 'view', points: [{ ...p, label }], quadrants: true, projections: false }, altForPoints('A coordinate plane with the four quadrants shaded and', [{ ...p, label }])),
    options: QOPTS, correctId, feedback,
    explanation: correctId === 'axis' ? `${label} has a zero coordinate, so it is ${describeLocus(locate(p))}.` : `Signs (${sgn(p.x)}, ${sgn(p.y)}) mean ${QOPTS.find((o) => o.id === correctId)!.text}.`,
  };
}

export function axisDistanceQ(id: string, p: Pt, from: 'x-axis' | 'y-axis', label = 'P'): NumericQuestion {
  const d = distanceFromAxes(p);
  const ans = from === 'x-axis' ? d.fromXAxis : d.fromYAxis;
  const other = from === 'x-axis' ? d.fromYAxis : d.fromXAxis;
  const rules: NumericRule[] = [];
  if (other !== ans) rules.push({ values: [other], entry: { message: `That is the distance from the ${from === 'x-axis' ? 'y' : 'x'}-axis. Distance from the ${from} is found by looking at the ${from === 'x-axis' ? 'y' : 'x'}-coordinate.`, refresherId: 'cg-ax-dist', misconception: 'axis_distance_swapped' } });
  const signed = from === 'x-axis' ? p.y : p.x;
  if (signed < 0) rules.push({ values: [signed], entry: { message: 'A distance is never negative. The sign only tells the side; the distance is the size of the coordinate.', refresherId: 'cg-ax-dist', misconception: 'negative_distance' } });
  return {
    kind: 'numeric', id,
    prompt: `How far is ${label} = ${fmtPoint(p)} from the ${from}? (in units)`,
    visual: plane({ mode: 'view', points: [{ ...p, label }], projections: true }, altForPoints('A coordinate plane with', [{ ...p, label }]) + ' Dashed lines join it to each axis.'),
    answer: ans, rules,
    defaultFeedback: { message: `Distance from the ${from} comes from the ${from === 'x-axis' ? 'y' : 'x'}-coordinate, ignoring its sign.`, refresherId: 'cg-ax-dist' },
    explanation: `The ${from === 'x-axis' ? 'y' : 'x'}-coordinate is ${signed}, so the distance is ${ans} units.`,
  };
}

// ---------------------------------------------------------------------------
// Distance and midpoint
// ---------------------------------------------------------------------------

export function gridDistanceQ(id: string, a: Pt, b: Pt): NumericQuestion {
  const { dx, dy } = legs(a, b);
  const horizontal = a.y === b.y;
  const ans = horizontal ? dx : dy;
  const ca = horizontal ? [a.x, b.x] : [a.y, b.y];
  const naive = Math.abs(Math.abs(ca[1]) - Math.abs(ca[0]));
  const signed = ca[1] - ca[0];
  const rules: NumericRule[] = [];
  if (naive !== ans) rules.push({ values: [naive], entry: { message: `You subtracted the sizes ${Math.abs(ca[0])} and ${Math.abs(ca[1])}. But ${ca[0]} and ${ca[1]} are on opposite sides of 0, so the distances to 0 add up.`, refresherId: 'cg-nl-dist', misconception: 'ignored_signs_in_distance' } });
  if (signed < 0) rules.push({ values: [signed], entry: { message: 'Distance is never negative. Take the positive size of the difference.', refresherId: 'cg-nl-dist', misconception: 'negative_distance' } });
  return {
    kind: 'numeric', id,
    prompt: `Find the distance between A = ${fmtPoint(a)} and B = ${fmtPoint(b)}.`,
    visual: plane({ mode: 'view', points: [{ ...a, label: 'A', color: '#22d3ee' }, { ...b, label: 'B', color: '#fb7185' }], segment: true, projections: false }, altForPoints('A coordinate plane with', [{ ...a, label: 'A' }, { ...b, label: 'B' }]) + ` They lie on the same ${horizontal ? 'horizontal' : 'vertical'} line.`),
    answer: ans, unit: 'units', rules,
    defaultFeedback: { message: `Both points have the same ${horizontal ? 'y' : 'x'}-coordinate, so count along the ${horizontal ? 'x' : 'y'}-direction only.`, refresherId: 'cg-nl-dist' },
    explanation: `|${ca[1]} − (${ca[0]})| = ${ans}.`,
  };
}

export function legQ(id: string, a: Pt, b: Pt, which: 'dx' | 'dy'): NumericQuestion {
  const L = legs(a, b);
  const ans = L[which];
  const [p1, p2] = which === 'dx' ? [a.x, b.x] : [a.y, b.y];
  const rules: NumericRule[] = [];
  if (p2 - p1 < 0) rules.push({ values: [p2 - p1], entry: { message: 'A leg length is a distance, so it is positive. Use the size of the difference.', refresherId: 'cg-nl-dist', misconception: 'negative_distance' } });
  return {
    kind: 'numeric', id,
    prompt: `The segment from A = ${fmtPoint(a)} to B = ${fmtPoint(b)} is the hypotenuse of a right triangle. How long is its ${which === 'dx' ? 'horizontal' : 'vertical'} side?`,
    visual: plane({ mode: 'view', points: [{ ...a, label: 'A', color: '#22d3ee' }, { ...b, label: 'B', color: '#fb7185' }], segment: true, projections: false }, altForPoints('A coordinate plane with', [{ ...a, label: 'A' }, { ...b, label: 'B' }]) + ' A line segment joins them.'),
    answer: ans, unit: 'units', rules,
    defaultFeedback: { message: `The ${which === 'dx' ? 'horizontal' : 'vertical'} side is the difference of the ${which === 'dx' ? 'x' : 'y'}-coordinates, as a positive length.`, refresherId: 'cg-nl-dist' },
    explanation: `|${p2} − (${p1})| = ${ans}.`,
  };
}

export function distanceQ(id: string, a: Pt, b: Pt, decimals = 0): NumericQuestion {
  const { dx, dy } = legs(a, b);
  const d = distance(a, b);
  const ans = decimals === 0 ? d : Math.round(d * 10 ** decimals) / 10 ** decimals;
  const rules: NumericRule[] = [];
  const sumLegs = dx + dy;
  const sq = dx * dx + dy * dy;
  const tol = decimals === 0 ? 1e-9 : 0.5 / 10 ** decimals;
  if (Math.abs(sumLegs - d) > tol) rules.push({ values: [sumLegs], entry: { message: `You added the two sides (${dx} + ${dy}). The straight segment is shorter than going around the corner; use ${dx}² + ${dy}² and then a square root.`, refresherId: 'cg-pyth', misconception: 'added_legs' } });
  if (Math.abs(sq - d) > tol) rules.push({ values: [sq], entry: { message: `${dx}² + ${dy}² = ${sq} is the square of the distance. One more step: take the square root.`, refresherId: 'cg-pyth', misconception: 'forgot_square_root' } });
  return {
    kind: 'numeric', id,
    prompt: `Find the distance AB between A = ${fmtPoint(a)} and B = ${fmtPoint(b)}${decimals ? ` (give ${decimals} decimal places)` : ''}.`,
    visual: plane({ mode: 'view', points: [{ ...a, label: 'A', color: '#22d3ee' }, { ...b, label: 'B', color: '#fb7185' }], segment: true, projections: false }, altForPoints('A coordinate plane with', [{ ...a, label: 'A' }, { ...b, label: 'B' }]) + ' A line segment joins them.'),
    answer: ans, tolerance: tol, unit: 'units', rules,
    defaultFeedback: { message: 'Build the right triangle: horizontal side |x₂ − x₁|, vertical side |y₂ − y₁|, then use the Pythagoras theorem.', refresherId: 'cg-pyth' },
    explanation: `${dx}² + ${dy}² = ${sq}, so AB = √${sq} = ${fmtNum(d)}.`,
  };
}

export function midpointQ(id: string, a: Pt, b: Pt, which: 'x' | 'y'): NumericQuestion {
  const m = midpointOf(a, b);
  const ans = m[which];
  const s = a[which] + b[which];
  const diff = Math.abs(b[which] - a[which]);
  const rules: NumericRule[] = [];
  if (s !== ans) rules.push({ values: [s], entry: { message: `${s} is the sum. Halfway means the average: divide the sum by 2.`, refresherId: 'cg-mid', misconception: 'sum_not_average' } });
  if (diff / 2 !== ans) rules.push({ values: [diff, diff / 2], entry: { message: 'That uses the difference. The difference tells how far apart the points are. The midpoint is found by adding the coordinates and halving.', refresherId: 'cg-mid', misconception: 'difference_not_average' } });
  return {
    kind: 'numeric', id,
    prompt: `M is the midpoint of A = ${fmtPoint(a)} and B = ${fmtPoint(b)}. What is the ${which}-coordinate of M?`,
    visual: plane({ mode: 'view', points: [{ ...a, label: 'A', color: '#22d3ee' }, { ...b, label: 'B', color: '#fb7185' }], segment: true, midpoint: true, projections: false }, altForPoints('A coordinate plane with', [{ ...a, label: 'A' }, { ...b, label: 'B' }]) + ' Their midpoint M is marked on the segment.'),
    answer: ans, rules,
    defaultFeedback: { message: `Add the ${which}-coordinates of A and B, then divide by 2.`, refresherId: 'cg-mid' },
    explanation: `(${a[which]} + (${b[which]})) ÷ 2 = ${ans}.`,
  };
}

/** A choice question with per-option feedback built from a list of [text, why] pairs. */
export function choice(id: string, prompt: string, options: [string, string | null][], explanation: string, visual?: VisualRef, extra?: Partial<Record<string, { refresherId?: string; misconception?: string }>>): ChoiceQuestion {
  const opts = options.map(([text], i) => ({ id: `o${i}`, text }));
  const correct = options.findIndex(([, why]) => why === null);
  const feedback: Record<string, FeedbackEntry> = {};
  options.forEach(([, why], i) => {
    if (why !== null) feedback[`o${i}`] = { message: why, ...(extra?.[`o${i}`] ?? {}) };
  });
  return { kind: 'choice', id, prompt, visual, options: opts, correctId: `o${correct}`, feedback, explanation };
}

