import { describe, it, expect } from 'vitest';
import { rat, parseRational, formatRational, add, mul, div, ZERO, fromNumberFixed } from '../rational';
import {
  makeEq,
  parseEquation,
  evaluate,
  isExactSolution,
  classifyFloatPoint,
  classifyDecimalPoint,
  slope,
  xIntercept,
  yIntercept,
  lineKind,
  validateEquation,
  solveForX,
  solveForY,
  formatStandard,
  formatSlopeIntercept,
  formatGeneral,
  sameLine,
  scaleEq,
} from '../linearEquation';
import { analyzeSystem, verifyPair } from '../system';
import {
  startSubstitution,
  stepSubstitution,
  startElimination,
  stepElimination,
  isolate,
  pairFromState,
  elimPair,
  type SubstitutionState,
  type EliminationState,
} from '../algebraSteps';
import {
  defaultViewport,
  viewportBounds,
  clipLineToBounds,
  toScreen,
  toWorld,
  zoomAt,
  panBy,
  niceStep,
  gridTicks,
  fitViewport,
  constrainToLine,
  translateLineThrough,
  describeTranslation,
  projectOntoLine,
} from '../graphMath';

const ok = <T>(r: T | { ok: false; error: string }): T => {
  if (r && typeof r === 'object' && 'ok' in r && (r as { ok: boolean }).ok === false) {
    throw new Error((r as { error: string }).error);
  }
  return r as T;
};

describe('rational arithmetic', () => {
  it('normalises and stays exact', () => {
    expect(rat(2, -4)).toEqual({ n: -1, d: 2 });
    expect(add(rat(1, 3), rat(1, 6))).toEqual(rat(1, 2));
    expect(mul(rat(2, 3), rat(3, 2))).toEqual(rat(1));
    expect(div(rat(1), rat(3))).toEqual(rat(1, 3));
    // 0.1 + 0.2 is exactly 0.3 as rationals (unlike floats)
    expect(add(parseRational('0.1')!, parseRational('0.2')!)).toEqual(parseRational('0.3'));
  });
  it('rejects zero denominators and bad text', () => {
    expect(() => rat(1, 0)).toThrow();
    expect(parseRational('1/0')).toBeNull();
    expect(parseRational('abc')).toBeNull();
    expect(parseRational('-3/6')).toEqual(rat(-1, 2));
    expect(formatRational(rat(-3, 6))).toBe('-1/2');
  });
});

describe('equation evaluation and solutions', () => {
  const e = makeEq(2, 3, -12);
  it('checks ordered pairs exactly', () => {
    expect(isExactSolution(e, rat(3), rat(2))).toBe(true);
    expect(isExactSolution(e, rat(0), rat(4))).toBe(true);
    expect(isExactSolution(e, rat(6), rat(0))).toBe(true);
    expect(isExactSolution(e, rat(1), rat(1))).toBe(false);
    expect(evaluate(e, rat(1), rat(1))).toEqual(rat(-7));
  });
  it('rational solution (3/2, 3) is exact', () => {
    expect(isExactSolution(e, rat(3, 2), rat(3))).toBe(true);
  });
  it('distinguishes exact from approximate floats', () => {
    expect(classifyFloatPoint(e, 3, 2).status).toBe('exact');
    expect(classifyFloatPoint(e, 3.01, 2).status).toBe('approximate');
    expect(classifyFloatPoint(e, 4, 4).status).toBe('not_solution');
  });
  it('solves for y given x and x given y', () => {
    expect(solveForY(e, rat(3))).toEqual({ kind: 'unique', value: rat(2) });
    expect(solveForX(e, rat(2))).toEqual({ kind: 'unique', value: rat(3) });
    expect(solveForY(e, rat(1))).toEqual({ kind: 'unique', value: rat(10, 3) });
  });
});

describe('decimal point classification (exact vs approximate)', () => {
  const e = makeEq(2, 3, -12);
  it('is exact only when the shown decimals give a zero residual', () => {
    expect(classifyDecimalPoint(e, 3, 2).status).toBe('exact');
    expect(classifyDecimalPoint(e, 1.5, 3).status).toBe('exact');
    const near = classifyDecimalPoint(e, 3.1, 2);
    expect(near.status).toBe('approximate');
    expect(near.residual).toEqual(rat(1, 5));
    expect(classifyDecimalPoint(e, 5, 5).status).toBe('not_solution');
  });
  it('never calls a point on a degenerate equation a solution', () => {
    expect(classifyDecimalPoint(makeEq(0, 0, 0), 1, 1).status).toBe('not_solution');
  });
  it('treats 0.1 + 0.2 style float noise as exact when the decimals are exact', () => {
    const l = makeEq(1, 1, rat(-3, 10));
    expect(classifyDecimalPoint(l, 0.1, 0.2).status).toBe('exact');
    expect(0.1 + 0.2 === 0.3).toBe(false);
  });
});

describe('slope, intercepts and special lines', () => {
  it('computes slope and intercepts', () => {
    const e = makeEq(2, 3, -12);
    expect(slope(e)).toEqual(rat(-2, 3));
    expect(xIntercept(e)).toEqual({ kind: 'point', value: rat(6) });
    expect(yIntercept(e)).toEqual({ kind: 'point', value: rat(4) });
  });
  it('vertical line x = 4 has undefined slope and no y-intercept', () => {
    const v = makeEq(1, 0, -4);
    expect(lineKind(v)).toBe('vertical');
    expect(slope(v)).toBeNull();
    expect(xIntercept(v)).toEqual({ kind: 'point', value: rat(4) });
    expect(yIntercept(v)).toEqual({ kind: 'none' });
    expect(solveForY(v, rat(4))).toEqual({ kind: 'any' });
    expect(solveForY(v, rat(3))).toEqual({ kind: 'none' });
    expect(formatSlopeIntercept(v)).toBe('x = 4');
  });
  it('horizontal line y = -2 has slope 0', () => {
    const h = makeEq(0, 1, 2);
    expect(lineKind(h)).toBe('horizontal');
    expect(slope(h)).toEqual(ZERO);
    expect(xIntercept(h)).toEqual({ kind: 'none' });
    expect(yIntercept(h)).toEqual({ kind: 'point', value: rat(-2) });
    expect(solveForX(h, rat(-2))).toEqual({ kind: 'any' });
  });
  it('x-axis itself intercepts the x-axis everywhere', () => {
    expect(xIntercept(makeEq(0, 1, 0))).toEqual({ kind: 'whole_axis' });
  });
  it('degenerate equations are explicit', () => {
    expect(validateEquation(makeEq(0, 0, 0)).valid).toBe(false);
    expect(validateEquation(makeEq(0, 0, 5)).valid).toBe(false);
    expect(lineKind(makeEq(0, 0, 0))).toBe('degenerate_identity');
    expect(lineKind(makeEq(0, 0, 5))).toBe('degenerate_contradiction');
    expect(slope(makeEq(0, 0, 5))).toBeNull();
    expect(isExactSolution(makeEq(0, 0, 0), rat(1), rat(1))).toBe(false);
    expect(clipLineToBounds(makeEq(0, 0, 3), { xMin: -5, xMax: 5, yMin: -5, yMax: 5 })).toBeNull();
  });
});

describe('formatting and parsing', () => {
  it('formats standard form', () => {
    expect(formatStandard(makeEq(2, 3, -12))).toBe('2x + 3y = 12');
    expect(formatStandard(makeEq(1, -1, 0))).toBe('x − y = 0');
    expect(formatStandard(makeEq(0, 1, 2))).toBe('y = -2');
    expect(formatGeneral(makeEq(2, 3, -12))).toBe('2x + 3y − 12 = 0');
    expect(formatSlopeIntercept(makeEq(2, 3, -12))).toBe('y = (-2/3)x + 4');
  });
  it('parses assorted forms', () => {
    const cases: [string, [number, number, number]][] = [
      ['2x + 3y = 12', [2, 3, -12]],
      ['x = 4', [1, 0, -4]],
      ['y = -2', [0, 1, 2]],
      ['2x+3y-12=0', [2, 3, -12]],
      ['3x = y', [3, -1, 0]],
      ['x + y = 5', [1, 1, -5]],
    ];
    for (const [text, [a, b, c]] of cases) {
      const r = parseEquation(text);
      expect(r.ok, text).toBe(true);
      expect(r.equation).toEqual(makeEq(a, b, c));
    }
    const half = parseEquation('x/2 + 0.5y = 3').equation!;
    expect(half).toEqual(makeEq(rat(1, 2), rat(1, 2), rat(-3)));
    expect(parseEquation('y = -x/2 + 1').equation).toEqual(makeEq(rat(1, 2), rat(1), rat(-1)));
  });
  it('rejects malformed input', () => {
    expect(parseEquation('2x + 3y').ok).toBe(false);
    expect(parseEquation('x = = 3').ok).toBe(false);
    expect(parseEquation('x^2 = 4').ok).toBe(false);
    expect(parseEquation('x/0 = 1').ok).toBe(false);
    expect(parseEquation('= 3').ok).toBe(false);
  });
  it('parses equations that are not lines but flags them', () => {
    const r = parseEquation('x = x');
    expect(r.ok).toBe(true);
    expect(validateEquation(r.equation!).valid).toBe(false);
  });
});

describe('two-line system classification', () => {
  it('unique intersection (3, 2)', () => {
    const p = makeEq(2, 3, -12);
    const q = makeEq(1, 1, -5);
    const r = analyzeSystem(p, q);
    expect(r.type).toBe('unique');
    expect(r.solution).toEqual({ x: rat(3), y: rat(2) });
    expect(verifyPair(p, q, rat(3), rat(2)).both).toBe(true);
    expect(verifyPair(p, q, rat(3), rat(3)).both).toBe(false);
  });
  it('parallel distinct lines', () => {
    const r = analyzeSystem(makeEq(1, 2, -3), makeEq(2, 4, -5));
    expect(r.type).toBe('parallel');
    expect(r.solution).toBeUndefined();
    expect(r.solutionCount).toBe('none');
  });
  it('coincident lines', () => {
    const r = analyzeSystem(makeEq(1, 2, -3), makeEq(3, 6, -9));
    expect(r.type).toBe('coincident');
    expect(r.solution).toBeUndefined();
    expect(sameLine(makeEq(1, 2, -3), scaleEq(makeEq(1, 2, -3), rat(-3, 2)))).toBe(true);
  });
  it('vertical with horizontal intersect without dividing by zero', () => {
    const r = analyzeSystem(makeEq(1, 0, -4), makeEq(0, 1, 2));
    expect(r.type).toBe('unique');
    expect(r.solution).toEqual({ x: rat(4), y: rat(-2) });
  });
  it('two verticals: parallel or coincident', () => {
    expect(analyzeSystem(makeEq(1, 0, -4), makeEq(1, 0, -5)).type).toBe('parallel');
    expect(analyzeSystem(makeEq(1, 0, -4), makeEq(2, 0, -8)).type).toBe('coincident');
  });
  it('nearly parallel lines are NOT classified parallel (exact arithmetic)', () => {
    const p = makeEq(rat(1), rat(1), rat(0));
    const q = makeEq(parseRational('1.000001')!, rat(1), rat(-1));
    const r = analyzeSystem(p, q);
    expect(r.type).toBe('unique');
    expect(verifyPair(p, q, r.solution!.x, r.solution!.y).both).toBe(true);
  });
  it('degenerate equations produce invalid systems', () => {
    expect(analyzeSystem(makeEq(0, 0, 3), makeEq(1, 1, 0)).type).toBe('invalid');
    expect(analyzeSystem(makeEq(1, 1, 0), makeEq(0, 0, 0)).type).toBe('invalid');
  });
  it('brute-force: unique solutions always verify on both lines', () => {
    for (let a1 = -3; a1 <= 3; a1++)
      for (let b1 = -3; b1 <= 3; b1++)
        for (let a2 = -3; a2 <= 3; a2++)
          for (let b2 = -3; b2 <= 3; b2++) {
            const p = makeEq(a1, b1, -4);
            const q = makeEq(a2, b2, 7);
            const r = analyzeSystem(p, q);
            if (r.type === 'unique') expect(verifyPair(p, q, r.solution!.x, r.solution!.y).both).toBe(true);
          }
  });
});

describe('substitution', () => {
  const p = makeEq(2, 3, -12);
  const q = makeEq(1, 1, -5);
  const run = (): SubstitutionState => {
    let s = startSubstitution(p, q);
    s = ok(stepSubstitution(s, { type: 'isolate', source: 2, variable: 'x' })) as SubstitutionState;
    s = ok(stepSubstitution(s, { type: 'substitute' })) as SubstitutionState;
    s = ok(stepSubstitution(s, { type: 'simplify_solve' })) as SubstitutionState;
    s = ok(stepSubstitution(s, { type: 'back_substitute' })) as SubstitutionState;
    return ok(stepSubstitution(s, { type: 'verify' })) as SubstitutionState;
  };
  it('solves the example and matches the graphical intersection', () => {
    const s = run();
    expect(s.phase).toBe('verified');
    expect(pairFromState(s)).toEqual({ x: rat(3), y: rat(2) });
    expect(pairFromState(s)).toEqual(analyzeSystem(p, q).solution);
  });
  it('rejects isolating a variable with zero coefficient', () => {
    const r = isolate(makeEq(0, 1, 2), 'x');
    expect('ok' in r && r.ok === false).toBe(true);
    const s = startSubstitution(makeEq(0, 1, 2), q);
    const res = stepSubstitution(s, { type: 'isolate', source: 1, variable: 'x' });
    expect('ok' in res).toBe(true);
  });
  it('rejects out-of-order steps and wrong claimed values', () => {
    const s0 = startSubstitution(p, q);
    expect('ok' in stepSubstitution(s0, { type: 'substitute' })).toBe(true);
    expect('ok' in stepSubstitution(s0, { type: 'verify' })).toBe(true);
    let s = ok(stepSubstitution(s0, { type: 'isolate', source: 2, variable: 'x' })) as SubstitutionState;
    s = ok(stepSubstitution(s, { type: 'substitute' })) as SubstitutionState;
    const wrong = stepSubstitution(s, { type: 'simplify_solve', claimed: rat(5) });
    expect('ok' in wrong).toBe(true);
    const right = stepSubstitution(s, { type: 'simplify_solve', claimed: rat(2) });
    expect('ok' in right).toBe(false);
  });
  it('detects parallel and coincident outcomes when the variable vanishes', () => {
    let s = startSubstitution(makeEq(1, 1, -2), makeEq(2, 2, -9));
    s = ok(stepSubstitution(s, { type: 'isolate', source: 1, variable: 'y' })) as SubstitutionState;
    s = ok(stepSubstitution(s, { type: 'substitute' })) as SubstitutionState;
    expect(s.phase).toBe('finished_no_unique');
    expect(s.outcome).toBe('parallel');
    let t = startSubstitution(makeEq(1, 1, -2), makeEq(2, 2, -4));
    t = ok(stepSubstitution(t, { type: 'isolate', source: 1, variable: 'y' })) as SubstitutionState;
    t = ok(stepSubstitution(t, { type: 'substitute' })) as SubstitutionState;
    expect(t.outcome).toBe('coincident');
  });
});

describe('elimination', () => {
  const p = makeEq(2, 3, -12);
  const q = makeEq(1, 1, -5);
  it('solves via multiply, subtract, solve, back-substitute, verify', () => {
    let s = startElimination(p, q);
    s = ok(stepElimination(s, { type: 'multiply', target: 2, factor: rat(2) })) as EliminationState;
    s = ok(stepElimination(s, { type: 'combine', op: 'subtract', eliminate: 'x' })) as EliminationState;
    expect(formatStandard(s.combined!)).toBe('y = 2');
    s = ok(stepElimination(s, { type: 'solve' })) as EliminationState;
    s = ok(stepElimination(s, { type: 'back_substitute' })) as EliminationState;
    s = ok(stepElimination(s, { type: 'verify' })) as EliminationState;
    expect(elimPair(s)).toEqual({ x: rat(3), y: rat(2) });
    expect(s.phase).toBe('verified');
  });
  it('rejects multiplying by zero', () => {
    const r = stepElimination(startElimination(p, q), { type: 'multiply', target: 1, factor: rat(0) });
    expect('ok' in r && r.ok === false).toBe(true);
  });
  it('rejects a combine that does not eliminate the chosen variable', () => {
    const r = stepElimination(startElimination(p, q), { type: 'combine', op: 'subtract', eliminate: 'x' });
    expect('ok' in r).toBe(true);
    const r2 = stepElimination(startElimination(p, q), { type: 'combine', op: 'add', eliminate: 'y' });
    expect('ok' in r2).toBe(true);
  });
  it('every intermediate equation is satisfied by the true solution', () => {
    let s = startElimination(p, q);
    s = ok(stepElimination(s, { type: 'multiply', target: 1, factor: rat(1) })) as EliminationState;
    s = ok(stepElimination(s, { type: 'multiply', target: 2, factor: rat(-3) })) as EliminationState;
    expect(isExactSolution(s.work1, rat(3), rat(2))).toBe(true);
    expect(isExactSolution(s.work2, rat(3), rat(2))).toBe(true);
    s = ok(stepElimination(s, { type: 'combine', op: 'add', eliminate: 'y' })) as EliminationState;
    expect(isExactSolution(s.combined!, rat(3), rat(2))).toBe(true);
  });
  it('detects parallel / coincident pairs', () => {
    let s = startElimination(makeEq(1, 1, -2), makeEq(2, 2, -9));
    s = ok(stepElimination(s, { type: 'multiply', target: 1, factor: rat(2) })) as EliminationState;
    s = ok(stepElimination(s, { type: 'combine', op: 'subtract', eliminate: 'x' })) as EliminationState;
    expect(s.phase).toBe('finished_no_unique');
    expect(s.outcome).toBe('parallel');
  });
});

describe('graph math', () => {
  const vp = defaultViewport(800, 600);
  const bd = viewportBounds(vp);
  it('round-trips screen and world coordinates', () => {
    const s = toScreen(vp, 3, -2);
    const w = toWorld(vp, s.sx, s.sy);
    expect(w.x).toBeCloseTo(3);
    expect(w.y).toBeCloseTo(-2);
  });
  it('clips oblique, vertical and horizontal lines to the viewport', () => {
    const seg = clipLineToBounds(makeEq(2, 3, -12), bd)!;
    for (const [x, y] of [
      [seg.x1, seg.y1],
      [seg.x2, seg.y2],
    ]) {
      expect(Math.abs(2 * x + 3 * y - 12)).toBeLessThan(1e-6);
      expect(x).toBeGreaterThanOrEqual(bd.xMin - 1e-6);
      expect(x).toBeLessThanOrEqual(bd.xMax + 1e-6);
      expect(y).toBeGreaterThanOrEqual(bd.yMin - 1e-6);
      expect(y).toBeLessThanOrEqual(bd.yMax + 1e-6);
    }
    const v = clipLineToBounds(makeEq(1, 0, -4), bd)!;
    expect(v.x1).toBeCloseTo(4);
    expect(v.x2).toBeCloseTo(4);
    expect(Math.abs(v.y1 - v.y2)).toBeCloseTo(bd.yMax - bd.yMin);
    const h = clipLineToBounds(makeEq(0, 1, 2), bd)!;
    expect(h.y1).toBeCloseTo(-2);
    expect(h.y2).toBeCloseTo(-2);
  });
  it('returns null when the line is outside the view', () => {
    expect(clipLineToBounds(makeEq(1, 0, -100), bd)).toBeNull();
    expect(clipLineToBounds(makeEq(1, 1, -1000), bd)).toBeNull();
  });
  it('zooms about a fixed screen point and pans', () => {
    const z = zoomAt(vp, 2, 600, 150);
    const before = toWorld(vp, 600, 150);
    const after = toWorld(z, 600, 150);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
    expect(zoomAt(vp, 1e6, 0, 0).scale).toBeLessThanOrEqual(240);
    expect(zoomAt(vp, 1e-6, 0, 0).scale).toBeGreaterThanOrEqual(6);
    const p = panBy(vp, 40, -40);
    expect(p.cx).toBeCloseTo(-1);
    expect(p.cy).toBeCloseTo(-1);
  });
  it('only produces visible grid ticks with nice steps', () => {
    expect(niceStep(40)).toBe(1);
    expect(niceStep(10)).toBe(5);
    expect(niceStep(200)).toBe(0.2);
    const ticks = gridTicks(-3.5, 6.2, 1);
    expect(ticks[0]).toBe(-3);
    expect(ticks[ticks.length - 1]).toBe(6);
    expect(gridTicks(-1e9, 1e9, 1e-3).length).toBeLessThanOrEqual(400);
  });
  it('fits a viewport around intercepts', () => {
    const f = fitViewport([{ x: 6, y: 0 }, { x: 0, y: 4 }], 800, 600);
    const b = viewportBounds(f);
    expect(b.xMin).toBeLessThan(0);
    expect(b.xMax).toBeGreaterThan(6);
    expect(b.yMax).toBeGreaterThan(4);
  });
  it('constrained dragging always yields an exact solution', () => {
    for (const e of [makeEq(2, 3, -12), makeEq(1, 0, -4), makeEq(0, 1, 2), makeEq(5, 1, -3), makeEq(1, 7, 1)]) {
      for (const [wx, wy] of [[1.3, 2.7], [-4.2, 0.1], [7.9, -3.3]]) {
        const pt = constrainToLine(e, wx, wy)!;
        expect(isExactSolution(e, pt.x, pt.y)).toBe(true);
      }
    }
    expect(constrainToLine(makeEq(0, 0, 1), 1, 1)).toBeNull();
  });
  it('line drag only changes c and says so', () => {
    const e = makeEq(2, 3, -12);
    const eff = translateLineThrough(e, 3, 3)!;
    expect(eff.after.a).toEqual(e.a);
    expect(eff.after.b).toEqual(e.b);
    expect(isExactSolution(eff.after, rat(3), rat(3))).toBe(true);
    expect(eff.explanation).toMatch(/Only c changed/);
    expect(eff.after.c).toEqual(rat(-15));
    expect(translateLineThrough(e, 3, 2)!.explanation).toMatch(/unchanged/);
  });
  it('describes a whole drag gesture from its starting line, not the last frame', () => {
    const start = makeEq(2, 3, -12);
    let live = start;
    for (const [x, y] of [[3, 2.5], [3, 3], [3, 3.5]]) live = translateLineThrough(live, x, y)!.after;
    expect(describeTranslation(start, live)).toMatch(/Only c changed \(from -12 to -33\/2\)/);
    expect(describeTranslation(start, start)).toMatch(/unchanged/);
    expect(describeTranslation(start, makeEq(2, 4, -12))).toMatch(/slope changed/);
  });
  it('projects onto a line', () => {
    const p = projectOntoLine(makeEq(1, -1, 0), 0, 4)!;
    expect(p.x).toBeCloseTo(2);
    expect(p.y).toBeCloseTo(2);
  });
  it('fromNumberFixed snaps floats to exact rationals', () => {
    expect(fromNumberFixed(0.1 + 0.2, 2)).toEqual(rat(3, 10));
  });
});
