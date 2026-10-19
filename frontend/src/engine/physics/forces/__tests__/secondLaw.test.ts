import { describe, expect, it } from 'vitest';
import {
  accelerationMassCurve, accelerationOf, accelerationRatioFromTimes, combinedAcceleration, distanceFromRest, doublingForce, doublingMass, forceAccelerationLine,
  forceFromMomentum, impulseBetween, massOf, momentum, momentumChange, momentumChangeBetween, momentumHistory, netForceOf, weightOf,
} from '../secondLaw';
import { SECOND_LAW_DERIVATIONS, SL_CASES, contextOf, secondLawDerivationById } from '../secondLawDerivations';
import { SECOND_LAW_EXPERIMENTS, secondLawOutcome } from '../secondLawExperiments';
import { recomputeSecondLaw } from '../exercisesSecondLaw';
import { FORCE_EXERCISES } from '../exercises';
import { DEFAULT_SETUP, G, sampleAtTime, simulate, type Setup } from '../forceModel';
import derivationSource from '../secondLawDerivations?raw';

const S = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const at = (s: Setup, t: number) => sampleAtTime(s, t, 20);

describe('momentum, F = ma and units (hand values)', () => {
  it('momentum and its sign; momentum change; units kg m/s and N = kg m/s²', () => {
    expect(momentum(3, 4)).toBe(12); expect(momentum(5, -2)).toBe(-10); expect(momentum(2, 0)).toBe(0);
    expect(momentumChange(2, 3, 8)).toBe(10); expect(momentumChange(4, 6, 2)).toBe(-16); expect(momentumChange(3, 4, 4)).toBe(0);
    expect(netForceOf(1, 1)).toBe(1); // 1 kg × 1 m/s² = 1 N, the definition of the newton
    expect(forceFromMomentum(20, 4)).toBe(5);
  });
  it('F = ma in both directions, with signs', () => {
    expect(netForceOf(1500, 2)).toBe(3000); expect(netForceOf(1500, -2)).toBe(-3000);
    expect(accelerationOf(6, 2)).toBe(3); expect(accelerationOf(-6, 2)).toBe(-3); expect(massOf(12, 4)).toBe(3);
    expect(accelerationOf(0, 5)).toBe(0);
    expect(weightOf(30, 9.8)).toBeCloseTo(294, 9); expect(weightOf(8)).toBe(80); expect(G).toBe(10);
  });
  it('linear versus inverse: doubling F doubles a; doubling m halves a', () => {
    expect(doublingForce(8, 2)).toEqual({ before: 4, after: 8 }); expect(doublingMass(12, 2)).toEqual({ before: 6, after: 3 });
    const line = forceAccelerationLine(2, 0, 10, 5); expect(line.map((p) => p.a)).toEqual([0, 1, 2, 3, 4, 5]);
    const curve = accelerationMassCurve(12, 1, 4, 3); expect(curve.map((p) => p.a)).toEqual([12, 6, 4, 3]);
    // inverse: a·m is constant (not a straight line in a against m)
    for (const p of accelerationMassCurve(10, 0.5, 5, 20)) expect(p.a * p.m).toBeCloseTo(10, 9);
  });
  it('textbook timing analysis (Activities 6.3 and 6.4)', () => {
    expect(accelerationRatioFromTimes(2, 1)).toBe(0.25); // a1/a2 = T2²/T1²
    expect(distanceFromRest(2, 3)).toBe(9);
    expect(combinedAcceleration(2, 3)).toBeCloseTo(1.2, 12);
  });
});

describe('the cart model, force pulse and graphs agree (single authoritative model)', () => {
  it('the cart obeys F = ma at every sampled time: a = net ÷ m, for a grid of setups with friction, pulses and both directions', () => {
    for (const m of [0.5, 2, 7]) for (const fa of [0, 6, 15]) for (const surf of ['frictionless', 'wood']) for (const u of [-3, 0, 4]) for (const dir of ['left', 'right'] as const) {
      const s = S({ massKg: m, forceA: fa, dirA: dir, surfaceId: surf, startVelocity: u, pulseS: 3 });
      for (const t of [0, 0.5, 2, 3.5, 8]) { const p = at(s, t); expect(p.a).toBeCloseTo(p.net / m, 9); }
    }
  });
  it('momentum history: p = m v at every step and the slope between steps is the net force', () => {
    const s = S({ massKg: 4, forceA: 12, pulseS: 2, startVelocity: 1 });
    const h = momentumHistory(s, 5);
    for (const x of h) expect(x.p).toBeCloseTo(4 * x.v, 9);
    expect((h[100].p - h[0].p) / 1).toBeCloseTo(12 * 1, 6); // slope during the pulse: 12 kg m/s per s
    expect(h[300].p).toBeCloseTo(h[250].p, 9); // constant after the pulse
  });
  it('impulse (sum of net force × step) equals the change of momentum, with friction stopping included', () => {
    const cases = [S({ massKg: 2, forceA: 6, pulseS: 2 }), S({ massKg: 5, forceA: 20, dirA: 'left', startVelocity: 4, pulseS: 1 }), S({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }), S({ massKg: 3, forceA: 9, surfaceId: 'wood' })];
    for (const s of cases) for (const t of [0.5, 1.5, 3]) {
      expect(Math.abs(impulseBetween(s, 0, t, 20) - momentumChangeBetween(s, 0, t, 20)), JSON.stringify(s)).toBeLessThan(0.1);
    }
    expect(impulseBetween(S({ massKg: 2, forceA: 6, pulseS: 2 }), 0, 4, 20)).toBeCloseTo(12, 6);
    expect(momentumChangeBetween(S({ massKg: 2, forceA: 6, pulseS: 2 }), 0, 4, 20)).toBeCloseTo(12, 9);
  });
  it('the same pulse gives equal momentum changes for different masses (5 N for 3 s: 15 kg m/s)', () => {
    for (const m of [1, 5]) expect(momentumChangeBetween(S({ massKg: m, forceA: 5, pulseS: 3 }), 0, 6, 20)).toBeCloseTo(15, 9);
  });
  it('zero net force: zero acceleration, constant (not zero) momentum; zero force and zero velocity: zero momentum', () => {
    const h = momentumHistory(S({ massKg: 3, startVelocity: 4 }), 5);
    for (const x of h) { expect(x.net).toBe(0); expect(x.a).toBe(0); expect(x.p).toBe(12); }
    expect(momentumHistory(S({ massKg: 3 }), 2)[50].p).toBe(0);
  });
  it('a force against the velocity slows the cart, and the same negative force speeds a leftward cart up', () => {
    const slows = S({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: 6 }), speeds = S({ massKg: 2, forceA: 4, dirA: 'left', startVelocity: -2 });
    expect(at(slows, 1).v).toBeCloseTo(4, 9); expect(at(slows, 3).v).toBeCloseTo(0, 6); expect(at(slows, 6).v).toBeCloseTo(-6, 6);
    expect(at(speeds, 2).v).toBeCloseTo(-6, 9); expect(Math.abs(at(speeds, 2).v)).toBeGreaterThan(2);
  });
  it('friction behaviour is unchanged: stops at 2 s and 6 m on wood, never reverses', () => {
    const s = S({ massKg: 2, surfaceId: 'wood', startVelocity: 6 });
    expect(at(s, 2.5).v).toBe(0); expect(at(s, 10).x).toBeCloseTo(6, 9); for (const p of simulate(s, 10)) expect(p.v).toBeGreaterThanOrEqual(0);
  });
});

describe('interactive derivations of F = ma', () => {
  const grid: Setup[] = [];
  for (const m of [1, 2, 5]) for (const f of [0, 6, 9]) for (const dir of ['left', 'right'] as const) for (const u of [-4, 0, 3]) grid.push(S({ massKg: m, forceA: f, dirA: dir, startVelocity: u }));
  it('every step relation holds for every sign combination (zero force, negative velocity and force included)', () => {
    for (const d of SECOND_LAW_DERIVATIONS) for (const st of d.steps) for (const s of grid) for (const t of [0.5, 2, 4]) {
      if (!st.relation) continue;
      const r = st.relation(contextOf(s, t));
      expect(Math.abs(r.lhs - r.rhs), `${d.id}/${st.id} ${JSON.stringify(s)} t=${t}`).toBeLessThan(1e-9);
    }
  });
  it('step order follows the argument; each derivation states assumptions, explains every step and has a student-supplied step', () => {
    expect(secondLawDerivationById('A')!.steps.map((s) => s.id)).toEqual(['sa1', 'sa2', 'sa3', 'sa4', 'sa5', 'sa6']);
    expect(secondLawDerivationById('B')!.steps.map((s) => s.id)).toEqual(['sb1', 'sb2', 'sb3', 'sb4', 'sb5', 'sb6']);
    expect(secondLawDerivationById('B')!.steps[1].math.join(' ')).toContain('m (v − u)');
    expect(secondLawDerivationById('B')!.steps[4].math.join(' ')).toContain('F = Δp ÷ Δt');
    expect(secondLawDerivationById('A')!.steps[4].math.join(' ')).toContain('1 N = 1 kg × 1 m/s²');
    for (const d of SECOND_LAW_DERIVATIONS) {
      expect(d.assumptions.length).toBeGreaterThan(1); expect(d.steps.some((s) => s.check)).toBe(true);
      for (const s of d.steps) { expect(s.why.length, s.id).toBeGreaterThan(30); expect(s.uses.length).toBeGreaterThan(0); }
      for (const s of d.steps) if (s.check && s.check.kind === 'choice') for (const o of s.check.options) if (o.id !== s.check.correctId) expect(s.check.feedback[o.id].message.length).toBeGreaterThan(30);
    }
  });
  it('the textbook route is labelled experimental, and the momentum derivation as enrichment, never as the textbook\'s own proof', () => {
    expect(secondLawDerivationById('A')!.assumptions.join(' ')).toMatch(/not a mathematical proof/);
    expect(secondLawDerivationById('B')!.source).toMatch(/enrichment/);
  });
  it('the numbers of case 1: m = 2, F = 6, u = 2, t = 4: a = 3, v = 14, Δp = 24, F = Δp/Δt = 6', () => {
    const c = contextOf(SL_CASES[0].setup, SL_CASES[0].t);
    [c.a, c.v, c.dp, c.dp / c.t, c.p0, c.p1].forEach((v, i) => expect(v).toBeCloseTo([3, 14, 24, 6, 4, 28][i], 6));
  });
  it('navigation records nothing: the derivation module never touches the progress store', () => {
    expect(derivationSource.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/useEducationStore|localStorage/);
  });
});

describe('investigations K to O', () => {
  it('exactly one option holds for every route and each explains itself', () => {
    expect(SECOND_LAW_EXPERIMENTS.map((e) => e.id)).toEqual(['K', 'L', 'M', 'N', 'O']);
    for (const e of SECOND_LAW_EXPERIMENTS) for (const r of e.routes) {
      const o = secondLawOutcome(r);
      expect(r.options.filter((x) => x.holds(o.end, o.start)).length, `${e.id}/${r.id}`).toBe(1);
      for (const x of r.options) expect(x.why.length, `${e.id}/${r.id}/${x.label}`).toBeGreaterThan(20);
      expect(r.explain(o.end, o.start).length).toBeGreaterThan(20);
    }
  });
  it('outcomes match hand values', () => {
    const o = (id: string, i: number) => secondLawOutcome(SECOND_LAW_EXPERIMENTS.find((e) => e.id === id)!.routes[i]);
    expect([0, 1, 2].map((i) => o('K', i).start.a)).toEqual([2, 4, 6]);
    expect([0, 1, 2].map((i) => o('L', i).start.a)).toEqual([12, 6, 3]);
    expect(o('M', 0).end.v).toBeCloseTo(6, 9); expect(o('M', 1).end.v).toBeCloseTo(12, 9);
    expect(o('N', 0).end.v).toBeCloseTo(15, 9); expect(5 * o('N', 1).end.v).toBeCloseTo(15, 9);
    expect([0, 1, 2].map((i) => Math.round(o('O', i).end.v * 1e6) / 1e6)).toEqual([0, -6, -6]);
  });
});

describe('NCERT exercises 5, 8 and 10 to 15 (verified against independent hand calculations)', () => {
  const r = recomputeSecondLaw();
  const ex = (n: number) => FORCE_EXERCISES[n - 1];
  it('numerical results', () => {
    expect(r.q8Gentle).toBeCloseTo(-20, 9); expect(r.q8Abrupt).toBeCloseTo(-20, 9);
    expect(r.q10Min).toBeCloseTo(10, 9); expect(r.q10Max).toBeCloseTo(10, 9);
    expect(r.q11Slope).toBe(2.5); expect(r.q11Force).toBe(25); expect(r.q11ModelV).toBeCloseTo(30, 9);
    expect(r.q12a).toBe(-10000); expect(r.q12F).toBeCloseTo(-500, 9);
    expect(r.q13a).toBe(2000); expect(r.q13t).toBeCloseTo(0.015, 12);
    expect(r.q14x).toBeCloseTo(10, 9); expect(r.q14v).toBeCloseTo(0, 6);
    expect(r.q15).toBeCloseTo(1.2, 12); expect(r.q15Formula).toBeCloseTo(r.q15, 12);
  });
  it('the stated answers equal those results', () => {
    const num = (n: number, part: string) => ex(n).solution!.answers.find((a) => a.part === part || (!a.part && part === ''))!.numeric!;
    expect(num(11, 'a')).toBe(25); expect(num(12, 'a')).toBe(-10000); expect(num(12, 'b')).toBe(-500); expect(num(13, 'a')).toBe(0.015); expect(num(14, 'a')).toBe(10); expect(num(10, 'a')).toBe(10);
    expect(ex(15).solution!.answers[1].numeric).toBe(1.2);
    expect(ex(5).solution!.answers[0].value).toMatch(/^\(iv\)/);
  });
  it('lab links only where the model fits; out-of-range questions explain why', () => {
    for (const n of [12, 13]) { expect(ex(n).solution!.labs ?? []).toEqual([]); expect(ex(n).solution!.labNote).toMatch(/limits|allows/); }
    for (const n of [5, 8, 10, 11, 14, 15]) expect(ex(n).solution!.labs!.length).toBeGreaterThan(0);
  });
  it('the third-law questions 7, 9 and 16 stay upcoming', () => { for (const n of [7, 9, 16]) { expect(ex(n).status).toBe('upcoming'); expect(ex(n).solution).toBeUndefined(); } });
});
