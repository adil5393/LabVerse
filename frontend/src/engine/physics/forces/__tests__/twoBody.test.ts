import { describe, expect, it } from 'vitest';
import { DEFAULT_TWO_BODY, explainTwoBody, twoBodyAt, twoBodyHistory, validateTwoBody, type TwoBodySetup } from '../twoBody';
import { PAIR_SCENARIOS, genuinePairs, isBalancedOnOneObject, isThirdLawPair, whyNotPair, pairScenarioById } from '../pairs';
import { PAIR_EXPERIMENTS, TB_EXPERIMENTS, tbOutcome } from '../twoBodyExperiments';
import { sampleAtTime, DEFAULT_SETUP } from '../forceModel';
import { recomputeThirdLaw } from '../exercisesThirdLaw';
import { FORCE_EXERCISES, forceExerciseCoverage } from '../exercises';

const S = (o: Partial<TwoBodySetup>): TwoBodySetup => ({ ...DEFAULT_TWO_BODY, ...o });

describe('two-body push apart: the interaction pair and momentum (hand values)', () => {
  it('equal and opposite interaction forces at every time, on different bodies, whatever the masses', () => {
    for (const mA of [0.1, 2, 50]) for (const mB of [0.5, 4, 300]) for (const f of [0, 1, 20]) for (const dur of [0, 0.5, 3]) {
      const s = S({ massA: mA, massB: mB, force: f, durationS: dur });
      for (const t of [0, 0.4, 1, 5]) { const p = twoBodyAt(s, t); expect(p.fOnAByB + p.fOnBByA, JSON.stringify(s)).toBeCloseTo(0, 12); expect(Math.abs(p.fOnAByB)).toBeCloseTo(Math.abs(p.fOnBByA), 12); }
    }
  });
  it('2 kg and 4 kg pushing apart with 6 N for 2 s: a = −3 and +1.5, velocities −6 and +3, total momentum 0', () => {
    const s = S({}); const p = twoBodyAt(s, 1);
    expect(p.fOnAByB).toBe(-6); expect(p.fOnBByA).toBe(6); expect(p.aA).toBe(-3); expect(p.aB).toBe(1.5);
    const e = twoBodyAt(s, 4);
    expect(e.vA).toBeCloseTo(-6, 12); expect(e.vB).toBeCloseTo(3, 12); expect(e.pA).toBeCloseTo(-12, 12); expect(e.pB).toBeCloseTo(12, 12); expect(e.pTotal).toBeCloseTo(0, 12);
    expect(e.xA).toBeCloseTo(-0.5 + 0.5 * -3 * 4 + -6 * 2, 9); expect(e.xB).toBeCloseTo(0.5 + 0.5 * 1.5 * 4 + 3 * 2, 9);
  });
  it('momentum of the isolated system is conserved at every step, also with starting velocities', () => {
    for (const s of [S({}), S({ massA: 3, massB: 7, force: 14, uA: 1, uB: 4, durationS: 1.3 }), S({ massA: 1, massB: 1, force: 5, uA: -2, uB: 2, durationS: 2 })]) {
      const p0 = twoBodyAt(s, 0).pTotal;
      for (const p of twoBodyHistory(s, 6)) expect(p.pTotal, JSON.stringify(s)).toBeCloseTo(p0, 9);
    }
  });
  it('the accelerations differ for different masses (a = F ÷ m for each) and match for equal masses', () => {
    const p = twoBodyAt(S({ massA: 1, massB: 9, force: 10, durationS: 1 }), 0.5);
    expect(Math.abs(p.aA)).toBeCloseTo(10, 12); expect(Math.abs(p.aB)).toBeCloseTo(10 / 9, 12);
    const q = twoBodyAt(S({ massA: 3, massB: 3, force: 9, durationS: 1 }), 0.5); expect(Math.abs(q.aA)).toBe(Math.abs(q.aB));
    // Example 6.8: bullet 0.1 kg, gun 5 kg, 2 N
    const g = twoBodyAt(S({ massA: 5, massB: 0.1, force: 2, durationS: 0.01 }), 0); expect(Math.abs(g.aA)).toBeCloseTo(0.4, 12); expect(Math.abs(g.aB)).toBeCloseTo(20, 12);
  });
  it('the net force on each body is computed separately (the pair is never added on one body)', () => {
    const p = twoBodyAt(S({}), 1);
    expect(p.netA).toBe(p.fOnAByB); expect(p.netB).toBe(p.fOnBByA); expect(p.netA).not.toBe(0); expect(p.netB).not.toBe(0);
  });
  it('zero duration and zero force: no interaction, velocities unchanged', () => {
    for (const s of [S({ durationS: 0, uA: 1, uB: 3 }), S({ force: 0, uA: 1, uB: 3 })]) {
      for (const t of [0, 1, 5]) { const p = twoBodyAt(s, t); expect([p.vA, p.vB, p.aA, p.aB, p.netA, p.netB]).toEqual([1, 3, 0, 0, 0, 0]); expect(p.xA).toBeCloseTo(-0.5 + t, 12); expect(p.xB).toBeCloseTo(0.5 + 3 * t, 12); }
    }
    expect(explainTwoBody(S({ durationS: 0 }), twoBodyAt(S({ durationS: 0 }), 1))).toMatch(/no interaction/);
  });
  it('after the interaction ends each cart coasts at constant velocity and the explanation says so', () => {
    const s = S({}); const e = twoBodyAt(s, 3); expect(e.active).toBe(false); expect(e.netA).toBe(0); expect(e.netB).toBe(0);
    expect(explainTwoBody(s, e)).toMatch(/has ended/);
    expect(explainTwoBody(s, twoBodyAt(s, 1))).toMatch(/B pushes A with 6 N to the left and A pushes B with 6 N to the right/);
  });
  it('deterministic fixed-step history: same result every time, on the 0.01 s grid', () => {
    const a = twoBodyHistory(S({}), 3), b = twoBodyHistory(S({}), 3);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b)); expect(a.length).toBe(301); expect(a[1].t).toBe(0.01);
  });
  it('agrees with the single-cart Force Laboratory when one cart is pushed by the interaction force', () => {
    const s = S({ massA: 2, massB: 4, force: 6, durationS: 2 });
    const single = { ...DEFAULT_SETUP, forceA: 6, dirA: 'right' as const, forceB: 0, massKg: 4, pulseS: 2 };
    for (const t of [0.5, 2, 3.5]) { const q = sampleAtTime(single, t, 20), p = twoBodyAt(s, t); expect(p.vB).toBeCloseTo(q.v, 9); expect(p.xB - 0.5).toBeCloseTo(q.x, 9); }
  });
  it('validation: impossible values and collisions are refused', () => {
    expect(validateTwoBody(S({}))).toBeNull();
    expect(validateTwoBody(S({ massA: 0 }))).toMatch(/mass/); expect(validateTwoBody(S({ force: -1 }))).toMatch(/force/); expect(validateTwoBody(S({ durationS: 99 }))).toMatch(/last/);
    expect(validateTwoBody(S({ uA: 3, uB: 0 }))).toMatch(/Collisions are not modelled/); expect(validateTwoBody(S({ uA: NaN }))).toMatch(/number/);
  });
});

describe('tow mode (Section 6.7, two boxes joined by a string)', () => {
  it('a = F ÷ (m1 + m2) for both boxes, tension T = m2 a, and the string forces are an equal and opposite pair', () => {
    const s = S({ mode: 'tow', massA: 2, massB: 3, force: 10, durationS: 3 }); const p = twoBodyAt(s, 1);
    expect(p.aA).toBeCloseTo(2, 12); expect(p.aB).toBeCloseTo(2, 12); expect(p.fOnBByA).toBeCloseTo(6, 12); expect(p.fOnAByB).toBeCloseTo(-6, 12);
    expect(p.netA).toBeCloseTo(4, 12); // 10 N external − 6 N tension = 2 kg × 2 m/s²
    expect(p.external).toBe(10);
  });
  it('the internal tension cancels for the system: net external force = total mass × common acceleration; total momentum changes by F·t', () => {
    const s = S({ mode: 'tow', massA: 2, massB: 3, force: 10, durationS: 3 });
    const p = twoBodyAt(s, 2);
    expect(p.netA + p.netB).toBeCloseTo(10, 12); expect(p.pTotal).toBeCloseTo(10 * 2, 9); expect(p.vCm).toBeCloseTo(p.vA, 9);
    expect(twoBodyAt(s, 5).pTotal).toBeCloseTo(30, 9); // F × 3 s, then coasting
  });
  it('tow mode needs both carts to start with the same velocity', () => { expect(validateTwoBody(S({ mode: 'tow', uA: 0, uB: 1 }))).toMatch(/same velocity/); });
});

describe('force pairs: identification and misconceptions', () => {
  it('genuine pairs in the textbook scenarios', () => {
    const ids = (id: string) => genuinePairs(pairScenarioById(id)!).map((p) => p.join('+')).sort();
    expect(ids('book')).toEqual(['n+np', 'w+wp']); expect(ids('wall')).toEqual(['hw+wh']); expect(ids('walk')).toEqual(['fg+gf']); expect(ids('canoe')).toEqual(['pw+wp']);
    expect(ids('rocket')).toEqual(['rg+gr']); expect(ids('magnets')).toEqual(['pq+qp']);
  });
  it('weight and the normal force are balanced on the book, and are NOT a pair (same object, different kinds)', () => {
    const f = Object.fromEntries(pairScenarioById('book')!.forces.map((x) => [x.id, x]));
    expect(isBalancedOnOneObject(f.w, f.n)).toBe(true); expect(isThirdLawPair(f.w, f.n)).toBe(false);
    expect(whyNotPair(f.w, f.n)).toMatch(/same object/); expect(isThirdLawPair(f.w, f.wp)).toBe(true);
  });
  it('the rocket thrust is not the partner of the weight, even though thrust is larger (net force upwards)', () => {
    const f = Object.fromEntries(pairScenarioById('rocket')!.forces.map((x) => [x.id, x]));
    expect(isThirdLawPair(f.gr, f.rw)).toBe(false); expect(whyNotPair(f.gr, f.rw)).toMatch(/swap|same object|same kind|equal|opposite/);
  });
  it('two opposing arrows are not automatically a pair: each reason is reported', () => {
    const a = { id: 'a', label: 'a', by: 'X', on: 'Y', kind: 'contact' as const, magnitude: 5, direction: 'right' as const };
    expect(whyNotPair(a, { ...a, id: 'b', by: 'Z', on: 'W', direction: 'left' })).toMatch(/swap/);
    expect(whyNotPair(a, { ...a, id: 'c', by: 'Y', on: 'X', kind: 'gravity', direction: 'left' })).toMatch(/same kind/);
    expect(whyNotPair(a, { ...a, id: 'd', by: 'Y', on: 'X', magnitude: 4, direction: 'left' })).toMatch(/equal in size/);
    expect(whyNotPair(a, { ...a, id: 'e', by: 'Y', on: 'X', direction: 'right' })).toMatch(/opposite/);
  });
  it('every scenario names the source and recipient of every force', () => { for (const s of PAIR_SCENARIOS) for (const f of s.forces) { expect(f.by.length).toBeGreaterThan(1); expect(f.on.length).toBeGreaterThan(1); expect(s.objects).toContain(f.on === 'Earth' || f.by === 'Earth' ? f.on === 'Earth' ? 'Earth' : f.on : f.on); } });
});

describe('investigations P to T', () => {
  it('exactly one option holds for every two-body route, and each explains itself', () => {
    expect(TB_EXPERIMENTS.map((e) => e.id)).toEqual(['P', 'Q']); expect(PAIR_EXPERIMENTS.map((e) => e.id)).toEqual(['R', 'S', 'T']);
    for (const e of TB_EXPERIMENTS) for (const r of e.routes) {
      const o = tbOutcome(r);
      expect(r.options.filter((x) => x.holds(o.start, o.end, r.setup)).length, `${e.id}/${r.id}`).toBe(1);
      for (const x of r.options) expect(x.why.length, `${r.id}/${x.label}`).toBeGreaterThan(20);
      expect(r.explain(o.start, o.end, r.setup).length).toBeGreaterThan(20);
    }
  });
  it('every pair-experiment scenario exists', () => { for (const e of PAIR_EXPERIMENTS) for (const id of e.scenarios) expect(pairScenarioById(id), id).toBeDefined(); });
});

describe('NCERT exercises 7, 9 and 16 and the final inventory', () => {
  const r = recomputeThirdLaw();
  it('Q7: the boat moves backwards while the sailor moves forwards; equal and opposite momenta; total zero', () => {
    expect(r.q7VBoat).toBeCloseTo(-0.5, 12); expect(r.q7VSailor).toBeCloseTo(1, 12); expect(r.q7Pboat).toBeCloseTo(-60, 9); expect(r.q7Psailor).toBeCloseTo(60, 9); expect(r.q7PTotal).toBeCloseTo(0, 9);
  });
  it('Q9: equal forces on the loaded and the empty cart; accelerations in the inverse ratio of the masses (1.5 and 3 m/s²)', () => {
    expect(r.q9FOnLoaded).toBe(30); expect(r.q9FOnEmpty).toBe(30); expect(r.q9aLoaded).toBeCloseTo(1.5, 12); expect(r.q9aEmpty).toBeCloseTo(3, 12);
  });
  it('Q16: equal forces on the magnet and the needle; the needle accelerates 25 times as much', () => {
    expect(r.q16FMagnet).toBeCloseTo(r.q16FNeedle, 12); expect(r.q16aNeedle / r.q16aMagnet).toBeCloseTo(25, 9);
  });
  it('the answers state the textbook choices; numbering and coverage are complete for all sixteen questions', () => {
    expect(FORCE_EXERCISES[8].solution!.answers[0].value).toMatch(/^\(iv\)/);
    expect(FORCE_EXERCISES.map((e) => e.number)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    for (const c of forceExerciseCoverage()) { expect(c.status, `Q${c.number}`).toBe('solved'); expect(c.missing).toEqual([]); }
    for (const n of [7, 9, 16]) { const s = FORCE_EXERCISES[n - 1].solution!; expect(s.labs?.length, `Q${n}`).toBeGreaterThan(0); expect(s.labNote).toMatch(/illustrative|simulate|model/i); }
  });
});
