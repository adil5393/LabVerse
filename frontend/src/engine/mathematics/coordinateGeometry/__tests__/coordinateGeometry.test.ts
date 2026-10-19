import { describe, it, expect } from 'vitest';
import { describeChapterIntegrity, allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { COORDINATE_GEOMETRY as CH } from '../content';
import {
  clampToRange, distance, distanceFromAxes, fmtPoint, legs, locate, makePlaneView, midpointOf, parsePointId, pointId, snapToGrid, swapCoordinates, toMath, toScreen,
} from '../learn';
import { axisDistanceQ, distanceQ, gridDistanceQ, legQ, midpointQ, plotQ, quadrantQ, readQ } from '../questions';

describeChapterIntegrity('Coordinate Geometry', CH, ['plane', 'numberLine']);

describe('learn helpers (independent oracles)', () => {
  it('locates every sign combination, axis and origin', () => {
    const cases: [number, number, string][] = [[3, 4, 'q1'], [-3, 4, 'q2'], [-3, -4, 'q3'], [3, -4, 'q4'], [5, 0, 'x-axis'], [-5, 0, 'x-axis'], [0, 2, 'y-axis'], [0, -2, 'y-axis'], [0, 0, 'origin']];
    for (const [x, y, want] of cases) {
      const l = locate({ x, y });
      expect(l.kind === 'quadrant' ? `q${l.n}` : l.kind, `${x},${y}`).toBe(want);
    }
  });
  it('quadrant numbering is counter-clockwise from the top right (NCERT)', () => {
    const angleOf = (n: number) => ({ 1: 45, 2: 135, 3: 225, 4: 315 }[n]!);
    const pts = [{ x: 1, y: 1 }, { x: -1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }];
    pts.forEach((p) => {
      const l = locate(p);
      if (l.kind !== 'quadrant') throw new Error('not a quadrant');
      const deg = ((Math.atan2(p.y, p.x) * 180) / Math.PI + 360) % 360;
      expect(deg).toBeCloseTo(angleOf(l.n), 6);
    });
  });
  it('distance, legs, midpoint and swap agree with direct formulas', () => {
    expect(distance({ x: 1, y: 1 }, { x: 4, y: 5 })).toBe(5);
    expect(distance({ x: -3, y: -1 }, { x: 2, y: 11 })).toBe(13);
    expect(legs({ x: -2, y: 1 }, { x: 2, y: 4 })).toEqual({ dx: 4, dy: 3 });
    expect(midpointOf({ x: -4, y: 2 }, { x: 2, y: -6 })).toEqual({ x: -1, y: -2 });
    expect(swapCoordinates({ x: 3, y: 5 })).toEqual({ x: 5, y: 3 });
    expect(distanceFromAxes({ x: -4, y: 3 })).toEqual({ fromXAxis: 3, fromYAxis: 4 });
    const a = { x: 2, y: -7 }, b = { x: -5, y: 3 };
    expect(distance(a, b)).toBeCloseTo(distance(b, a), 12);
  });
  it('screen mapping round-trips and puts positive y upward', () => {
    const v = makePlaneView({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
    for (const p of [{ x: 0, y: 0 }, { x: 3, y: -2 }, { x: -6, y: 6 }]) {
      const back = toMath(v, toScreen(v, p));
      expect(back.x).toBeCloseTo(p.x, 9); expect(back.y).toBeCloseTo(p.y, 9);
    }
    expect(toScreen(v, { x: 0, y: 3 }).y).toBeLessThan(toScreen(v, { x: 0, y: 0 }).y);
    expect(toScreen(v, { x: 3, y: 0 }).x).toBeGreaterThan(toScreen(v, { x: 0, y: 0 }).x);
    expect(v.height).toBeCloseTo(v.width, 9);
  });
  it('snapping stays on the grid, inside the range, and never produces negative zero', () => {
    const r = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
    expect(snapToGrid(r, { x: 2.4, y: -3.6 })).toEqual({ x: 2, y: -4 });
    expect(Object.is(snapToGrid(r, { x: -0.3, y: 0.2 }).x, -0)).toBe(false);
    expect(clampToRange(r, { x: 99, y: -99 })).toEqual({ x: 6, y: -6 });
    expect(parsePointId(pointId(-3, 4))).toEqual({ x: -3, y: 4 });
    expect(parsePointId('x')).toBeNull();
  });
});

// --- Every authored question is re-derived from its own prompt and diagram ---

const num = (s: string) => Number(s.replace('−', '-'));
const parsePt = (s: string) => { const m = /\(\s*(\S+?)\s*,\s*(\S+?)\s*\)/.exec(s); if (!m) throw new Error(s); return { x: num(m[1]), y: num(m[2]) }; };
const labelled = (q: { visual?: { props?: Record<string, unknown> } }) => ((q.visual?.props?.points as { x: number; y: number; label?: string }[]) ?? []);

describe('Coordinate Geometry: diagrams, givens and answers share one truth', () => {
  const qs = allQuestions(CH).map((x) => x.q);

  it('plot questions: the expected grid point is exactly the coordinates in the prompt', () => {
    const plots = qs.filter((q) => q.kind === 'visual' && q.prompt.startsWith('Plot the point'));
    expect(plots.length).toBeGreaterThanOrEqual(5);
    for (const q of plots) {
      if (q.kind !== 'visual') continue;
      const t = parsePt(q.prompt.replace('Plot the point', ''));
      expect(q.correctId).toBe(`${t.x},${t.y}`);
      expect(q.feedback[`${t.y},${t.x}`]?.misconception ?? (t.x === t.y ? 'n/a' : 'MISSING')).toMatch(t.x === t.y ? /n\/a/ : /swapped_coordinates/);
      expect(q.feedback[`${t.x},${t.y}`]).toBeUndefined();
    }
  });

  it('read questions: the correct label is drawn at the asked coordinates and the decoys are the classic mistakes', () => {
    const reads = qs.filter((q) => q.kind === 'visual' && q.prompt.startsWith('Which labelled point'));
    expect(reads.length).toBeGreaterThanOrEqual(1);
    for (const q of reads) {
      if (q.kind !== 'visual') continue;
      const t = parsePt(q.prompt);
      const pts = labelled(q);
      const correct = pts.find((p) => p.label === q.correctId)!;
      expect(correct).toMatchObject(t);
      expect(pts.filter((p) => p.x === t.x && p.y === t.y)).toHaveLength(1);
      expect(pts.map((p) => `${p.x},${p.y}`).sort()).toEqual([...new Set(pts.map((p) => `${p.x},${p.y}`))].sort());
      for (const p of pts) if (p.label !== q.correctId) expect(q.feedback[p.label!], p.label).toBeDefined();
    }
  });

  it('quadrant questions: diagram point, answer and wrong-option reasons match the sign rule', () => {
    const quads = qs.filter((q) => q.kind === 'choice' && q.prompt.startsWith('Which region contains'));
    expect(quads.length).toBeGreaterThanOrEqual(4);
    for (const q of quads) {
      if (q.kind !== 'choice') continue;
      const p = parsePt(q.prompt.split('=')[1]);
      expect(labelled(q)[0]).toMatchObject(p);
      const want = p.x === 0 || p.y === 0 ? 'axis' : p.x > 0 && p.y > 0 ? 'q1' : p.x < 0 && p.y > 0 ? 'q2' : p.x < 0 && p.y < 0 ? 'q3' : 'q4';
      expect(q.correctId).toBe(want);
    }
  });

  it('distance questions equal an independent hypot of the plotted points', () => {
    const ds = qs.filter((q) => q.kind === 'numeric' && q.prompt.startsWith('Find the distance AB'));
    expect(ds.length).toBeGreaterThanOrEqual(4);
    for (const q of ds) {
      if (q.kind !== 'numeric') continue;
      const [a, b] = labelled(q);
      expect(q.prompt).toContain(fmtPoint(a));
      expect(q.prompt).toContain(fmtPoint(b));
      const dec = /(\d) decimal/.exec(q.prompt);
      const d = Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
      expect(q.answer).toBeCloseTo(dec ? Number(d.toFixed(Number(dec[1]))) : d, 9);
    }
  });

  it('grid, leg, axis and midpoint answers all re-derive from the stated points', () => {
    let seen = 0;
    for (const q of qs) {
      if (q.kind !== 'numeric') continue;
      if (q.prompt.startsWith('Find the distance between A')) {
        const [a, b] = labelled(q); seen++;
        expect(a.x === b.x || a.y === b.y).toBe(true);
        expect(q.answer).toBe(a.y === b.y ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y));
      } else if (q.prompt.includes('hypotenuse of a right triangle')) {
        const [a, b] = labelled(q); seen++;
        expect(q.answer).toBe(q.prompt.includes('horizontal side') ? Math.abs(b.x - a.x) : Math.abs(b.y - a.y));
      } else if (q.prompt.startsWith('How far is')) {
        const p = labelled(q)[0]; seen++;
        expect(q.answer).toBe(q.prompt.includes('x-axis') ? Math.abs(p.y) : Math.abs(p.x));
      } else if (q.prompt.includes('midpoint of A') && labelled(q).length === 2) {
        const [a, b] = labelled(q); seen++;
        expect(q.answer).toBe((q.prompt.includes('x-coordinate of M') ? a.x + b.x : a.y + b.y) / 2);
      } else if (q.prompt.startsWith('What is the') && q.prompt.includes('-coordinate of point')) {
        const p = labelled(q)[0]; seen++;
        expect(q.answer).toBe(q.prompt.includes('the x-coordinate') ? p.x : p.y);
      }
    }
    expect(seen).toBeGreaterThanOrEqual(15);
  });

  it('the backwards midpoint question is arithmetically right', () => {
    const q = qs.find((x) => x.id === 'cg-l7-i3');
    expect(q && q.kind === 'numeric' && (-3 + q.answer) / 2).toBe(1);
  });

  it('targeted wrong-answer rules are exactly the mistakes they name', () => {
    const a = { x: 1, y: 1 }, b = { x: 4, y: 5 };
    const d = distanceQ('t', a, b);
    expect(d.rules!.map((r) => [r.entry.misconception, r.values[0]])).toEqual([['added_legs', 7], ['forgot_square_root', 25]]);
    const g = gridDistanceQ('t', { x: -2, y: 3 }, { x: 5, y: 3 });
    expect(g.answer).toBe(7); expect(g.rules![0].values[0]).toBe(3); // 5 - 2 ignoring the sign
    expect(legQ('t', { x: 5, y: 2 }, { x: 1, y: 2 }, 'dx').rules![0].values[0]).toBe(-4);
    expect(midpointQ('t', { x: -6, y: 0 }, { x: 4, y: 0 }, 'x').rules!.some((r) => r.values.includes(-2))).toBe(true);
    expect(axisDistanceQ('t', { x: -4, y: 3 }, 'x-axis').rules![0].values[0]).toBe(4);
    expect(quadrantQ('t', { x: 3, y: 4 }).correctId).toBe('q1');
    const pq = plotQ('t', { x: 1, y: 6 });
    expect(pq.feedback['6,1'].misconception).toBe('swapped_coordinates');
    expect(readQ('t', { x: 2, y: -3 }).points.length).toBe(4);
  });

  it('the NCERT-mandated chapter facts hold: (x,y)=(y,x) only when x=y', () => {
    for (const [x, y] of [[3, 5], [-2, 4], [0, 7], [4, 4], [-3, -3]]) {
      const same = swapCoordinates({ x, y });
      expect(same.x === x && same.y === y).toBe(x === y);
    }
  });
});
