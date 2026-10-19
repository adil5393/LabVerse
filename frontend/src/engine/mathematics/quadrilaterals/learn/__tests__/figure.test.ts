import { describe, it, expect } from 'vitest';
import { analyzeQuad, centroidFacts, completeParallelogram, converseFacts, FIG, KIND_LABEL, midpointFacts, tilingCoverage, varignonFacts, type Pt, type Quad } from '../figure';
import { classifyQuadrilateral } from '../../geometry';

// Deterministic pseudo-random generator so failures are reproducible.
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
const rp = (r: () => number): Pt => ({ x: Math.round(r() * 18) / 2 + 0.5, y: Math.round(r() * 18) / 2 + 0.5 });

describe('Quadrilaterals: presets are what they claim to be', () => {
  it.each([
    ['parallelogram', 'parallelogram'], ['rectangle', 'rectangle'], ['rhombus', 'rhombus'], ['square', 'square'],
    ['trapezium', 'trapezium'], ['isoscelesTrapezium', 'isosceles-trapezium'], ['kite', 'kite'], ['general', 'general'],
    ['dart', 'non-convex'], ['bowtie', 'self-intersecting'], ['collinear', 'not-quadrilateral'],
  ] as const)('%s is a %s', (name, kind) => {
    expect(analyzeQuad(FIG[name]).kind).toBe(kind);
  });
  it('the facts that make the "not enough" counterexamples work are true of the presets', () => {
    const iso = analyzeQuad(FIG.isoscelesTrapezium);
    expect(iso.diagonalsEqual).toBe(true); expect(iso.parallelogram).toBe(false); // equal diagonals do not give a parallelogram
    expect(iso.oppSidesEqual.filter(Boolean).length).toBe(1); // the legs are equal, yet it is not a parallelogram
    const kite = analyzeQuad(FIG.kite);
    expect(kite.diagonalsPerpendicular).toBe(true); expect(kite.parallelogram).toBe(false);
    expect(kite.oppAnglesEqual.filter(Boolean).length).toBe(1); // ONE pair of opposite angles equal is not enough
    const trap = analyzeQuad(FIG.trapezium);
    expect(trap.oppSidesParallel.filter(Boolean).length).toBe(1);
    expect(trap.parallelogram).toBe(false);
  });
});

describe('Quadrilaterals: exact analysis agrees with the textbook statements on random figures', () => {
  const r = rng(7);
  const quads: Quad[] = [];
  for (let i = 0; i < 3000; i++) quads.push([rp(r), rp(r), rp(r), rp(r)]);
  const simple = quads.map((q) => ({ q, a: analyzeQuad(q) })).filter((x) => x.a.isQuadrilateral);

  it('enough random quadrilaterals of every shape were generated', () => {
    expect(simple.length).toBeGreaterThan(800);
    expect(simple.some((x) => x.a.kind === 'non-convex')).toBe(true);
    expect(simple.some((x) => x.a.kind === 'general')).toBe(true);
    expect(quads.some((q) => analyzeQuad(q).crossed)).toBe(true);
  });
  it('angle sum is 360 for every simple quadrilateral (also non-convex)', () => {
    for (const { a } of simple) expect(a.angleSum!).toBeCloseTo(360, 6);
  });
  it('convex <=> diagonals cross (textbook, 12.1)', () => {
    for (const { a } of simple) expect(a.convex).toBe(a.diagonalsCross);
  });
  it('Theorem 1: a parallelogram has equal opposite sides and angles, and bisecting diagonals', () => {
    const r2 = rng(11); let n = 0;
    for (let i = 0; i < 2000; i++) {
      const A = rp(r2), B = rp(r2), C = rp(r2), D = completeParallelogram(A, B, C);
      const an = analyzeQuad([A, B, C, D]);
      if (!an.isQuadrilateral) continue;
      n++;
      expect(an.parallelogram).toBe(true);
      expect(an.oppSidesEqual).toEqual([true, true]); expect(an.oppAnglesEqual).toEqual([true, true]); expect(an.diagonalsBisect).toBe(true);
    }
    expect(n).toBeGreaterThan(1000);
  });
  it('Theorems 2-5: each test is sufficient for every simple quadrilateral generated', () => {
    for (const { a } of simple) {
      if (a.oppSidesEqual[0] && a.oppSidesEqual[1]) expect(a.parallelogram, 'Thm 2').toBe(true);
      if (a.oppAnglesEqual[0] && a.oppAnglesEqual[1]) expect(a.parallelogram, 'Thm 3').toBe(true);
      if (a.diagonalsBisect) expect(a.parallelogram, 'Thm 4').toBe(true);
      if (a.onePairEqualAndParallel) expect(a.parallelogram, 'Thm 5').toBe(true);
    }
  });
  it('and the other direction too: a parallelogram satisfies all four tests', () => {
    for (const { a } of simple.filter((x) => x.a.parallelogram)) {
      expect(a.oppSidesEqual).toEqual([true, true]); expect(a.oppAnglesEqual).toEqual([true, true]); expect(a.diagonalsBisect).toBe(true); expect(a.onePairEqualAndParallel).toBe(true);
    }
  });
  it('the weaker conditions really are NOT sufficient: each has a simple counterexample among random figures', () => {
    expect(simple.some((x) => x.a.diagonalsEqual && !x.a.parallelogram)).toBe(true);
    expect(simple.some((x) => x.a.diagonalsPerpendicular && !x.a.parallelogram)).toBe(true);
    expect(simple.some((x) => (x.a.oppSidesEqual[0] || x.a.oppSidesEqual[1]) && !x.a.parallelogram)).toBe(true);
    expect(simple.some((x) => (x.a.oppSidesParallel[0] || x.a.oppSidesParallel[1]) && !x.a.parallelogram)).toBe(true);
    expect(simple.some((x) => (x.a.oppAnglesEqual[0] || x.a.oppAnglesEqual[1]) && !x.a.parallelogram)).toBe(true);
  });
  it('the exact kind agrees with the free-board engine on clear-cut figures', () => {
    const names: Record<string, string> = { parallelogram: 'parallelogram', rectangle: 'rectangle', rhombus: 'rhombus', square: 'square', kite: 'kite', trapezium: 'trapezium', general: 'general_convex', dart: 'concave', bowtie: 'crossed' };
    for (const [k, v] of Object.entries(names)) expect(classifyQuadrilateral(...(FIG[k as keyof typeof FIG] as Quad)).kind, k).toBe(v);
  });
  it('every kind has a label for the readouts', () => {
    for (const { a } of simple) expect(KIND_LABEL[a.kind].length).toBeGreaterThan(3);
  });
});

describe('Quadrilaterals: triangle theorems are computed, not assumed', () => {
  const r = rng(3);
  const tris = Array.from({ length: 500 }, () => [rp(r), rp(r), rp(r)] as [Pt, Pt, Pt]).filter(([a, b, c]) => Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0.5);
  it('Theorem 6: the segment joining two midpoints is parallel to the third side and half as long', () => {
    for (const t of tris) { const m = midpointFacts(t); expect(m.parallel).toBe(true); expect(m.ratio).toBeCloseTo(0.5, 9); }
  });
  it('Theorem 7: the line through the midpoint of AB parallel to BC meets AC at its midpoint, and PQ is half BC', () => {
    for (const t of tris) { const c = converseFacts(t, 0.5); expect(c.bisects).toBe(true); expect(c.pq / c.bc).toBeCloseTo(0.5, 9); }
  });
  it('but if P is not the midpoint, the parallel line does NOT bisect AC', () => {
    for (const t of tris.slice(0, 100)) for (const s of [0.2, 0.3, 0.7, 0.9]) expect(converseFacts(t, s).bisects).toBe(false);
  });
  it('Theorem 8: the medians AD and BE meet at G, the third median passes through G, and each is cut 2:1', () => {
    for (const t of tris) {
      const g = centroidFacts(t);
      expect(g.thirdMedianMiss).toBeLessThan(1e-9);
      for (const x of g.ratios) expect(x).toBeCloseTo(2, 9);
      expect(g.G.x).toBeCloseTo((t[0].x + t[1].x + t[2].x) / 3, 9);
    }
  });
  it('Theorem 9: the midpoints of ANY simple quadrilateral (convex or not) form a parallelogram of half the area', () => {
    const r2 = rng(5); let n = 0, nonconvex = 0;
    for (let i = 0; i < 3000; i++) {
      const q: Quad = [rp(r2), rp(r2), rp(r2), rp(r2)];
      const a = analyzeQuad(q);
      if (!a.isQuadrilateral) continue;
      n++; if (!a.convex) nonconvex++;
      const v = varignonFacts(q);
      expect(v.parallelogram).toBe(true);
      expect(v.areaRatio!).toBeCloseTo(0.5, 9);
      expect(v.sides[0]).toBeCloseTo(v.acHalf, 9); expect(v.sides[1]).toBeCloseTo(v.bdHalf, 9);
      // extension: rectangle when diagonals are perpendicular, rhombus when equal
      expect(v.rhombus).toBe(a.diagonalsEqual); expect(v.rectangle).toBe(a.diagonalsPerpendicular);
    }
    expect(n).toBeGreaterThan(500); expect(nonconvex).toBeGreaterThan(50);
  });
});

describe('Quadrilaterals: tiling', () => {
  it('copies of ABCD and its half-turn leave no gaps and no overlaps, for convex and non-convex quadrilaterals', () => {
    const shapes: Quad[] = [FIG.parallelogram, FIG.general, FIG.kite, FIG.dart, FIG.trapezium, FIG.rectangle];
    for (const q of shapes) {
      const c = tilingCoverage(q, { x0: -2, x1: 12, y0: -2, y1: 12 });
      expect(c.gaps, `${q.map((p) => `${p.x},${p.y}`)} gaps`).toBe(0);
      expect(c.overlaps, 'overlaps').toBe(0);
    }
  });
});
