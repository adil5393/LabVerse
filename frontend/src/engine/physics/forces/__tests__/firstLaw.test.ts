import { describe, expect, it } from 'vitest';
import { BRAKING_ROUTES, FIRST_LAW_EXPERIMENTS, brakingOutcome, firstLawOutcome } from '../firstLaw';
import { FORCE_EXPERIMENTS } from '../experiments';
import { BRAKE_AT, DEFAULT_BRAKING, GAP_M, brakingAt, brakingHistory, endTime, validateBraking, type BrakingSetup } from '../vehicle';
import { DEFAULT_SETUP, DT, sampleAtTime, simulate, validateSetup, type Setup } from '../forceModel';
import { diagramOf } from '../forceDiagram';
import { FORCE_EXERCISES } from '../exercises';
import { stateAt } from '../../motion/profile';

const S = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const at = (s: Setup, t: number) => sampleAtTime(s, t, 20);

describe('first law: zero net force (independent hand values)', () => {
  it('a moving cart keeps a constant non-zero velocity: v = u and x = ut at every time', () => {
    const s = S({ startVelocity: 4 });
    for (const t of [0, 0.01, 1, 3.33, 10, 20]) { const p = at(s, t); expect(p.v).toBe(4); expect(p.a).toBe(0); expect(p.net).toBe(0); expect(p.x).toBeCloseTo(4 * t, 9); }
  });
  it('a stationary cart stays at rest with zero net force (balanced pushes), exactly', () => {
    const s = S({ forceA: 5, forceB: 5 });
    for (const t of [0, 1, 20]) { const p = at(s, t); expect(p.v).toBe(0); expect(p.x).toBe(0); }
  });
  it('negative velocity with zero net force stays negative and unchanged', () => {
    const s = S({ forceA: 5, forceB: 5, startVelocity: -3 });
    for (const t of [1, 8, 20]) { const p = at(s, t); expect(p.v).toBe(-3); expect(p.x).toBeCloseTo(-3 * t, 9); }
  });
  it('the three starting conditions all retain their own velocities (experiment G)', () => {
    const G = FIRST_LAW_EXPERIMENTS.find((e) => e.id === 'G')!;
    expect(G.routes.map((r) => firstLawOutcome(r).end.v)).toEqual([0, 3, -3]);
  });
  it('frictional deceleration: 6 m/s on wood slows at 3 m/s² and stops at 2 s, 6 m; frictionless does not slow', () => {
    expect(at(S({ surfaceId: 'wood', startVelocity: 6 }), 1).v).toBeCloseTo(3, 9);
    expect(at(S({ surfaceId: 'wood', startVelocity: 6 }), 10).x).toBeCloseTo(6, 9);
    expect(at(S({ startVelocity: 6 }), 10).v).toBe(6);
  });
  it('the force diagram agrees: no net arrow for the moving, balanced cart', () => {
    const d = diagramOf(at(S({ surfaceId: 'wood', forceA: 6, startVelocity: 4 }), 3));
    expect(d.net).toBeNull(); expect(d.netValue).toBeCloseTo(0, 9);
  });
});

describe('force pulse and inertia (mass comparison)', () => {
  it('an 8 N pulse for 1 s changes velocity by 8, 4, 2 m/s for 1, 2, 4 kg; the velocity is then constant', () => {
    for (const [m, dv] of [[1, 8], [2, 4], [4, 2]] as const) {
      const s = S({ massKg: m, forceA: 8, pulseS: 1 });
      expect(at(s, 1).v).toBeCloseTo(dv, 9); expect(at(s, 5).v).toBeCloseTo(dv, 9); expect(at(s, 5).net).toBe(0); expect(at(s, 0.5).net).toBe(8);
      expect(at(s, 5).x).toBeCloseTo(0.5 * dv + dv * 4, 9); // 1 s of acceleration then 4 s at constant velocity
    }
  });
  it('greater mass gives a smaller velocity change for the same pulse; mass is the only thing that changed', () => {
    const dv = (m: number) => at(S({ massKg: m, forceA: 8, pulseS: 1 }), 3).v;
    expect(dv(1)).toBeGreaterThan(dv(2)); expect(dv(2)).toBeGreaterThan(dv(4)); expect(dv(1) / dv(4)).toBeCloseTo(4, 9);
  });
  it('agrees with the exact Chapter 4 engine for a two-stage motion (pulse then coast)', () => {
    const s = S({ massKg: 2, forceA: 8, pulseS: 1 });
    const prof = { x0: 0, v0: 0, segments: [{ durationS: 1, a: 4 }, { durationS: 4, a: 0 }] };
    for (const t of [0.5, 1, 2.5, 5]) { const p = at(s, t), q = stateAt(prof, t); expect(p.x).toBeCloseTo(q.x, 6); expect(p.v).toBeCloseTo(q.v, 9); }
  });
  it('a pulse also stops cleanly under friction: the cart never reverses after it stops', () => {
    const s = S({ massKg: 2, forceA: 12, pulseS: 1, surfaceId: 'wood' }); // a = 3 for 1 s, then −3 until it stops at 2 s
    expect(at(s, 1).v).toBeCloseTo(3, 9); expect(at(s, 2).v).toBe(0); for (const p of simulate(s, 10)) expect(p.v).toBeGreaterThanOrEqual(0);
    expect(at(s, 10).x).toBeCloseTo(3, 9);
  });
  it('pulse input is validated and the original setups are unchanged (PHY-2A regression)', () => {
    expect(validateSetup(S({ pulseS: -1 }))).toMatch(/pulse/); expect(validateSetup(S({ pulseS: 2 }))).toBeNull();
    expect(at(S({ massKg: 2, forceA: 10, forceB: 6 }), 3).v).toBeCloseTo(6, 9);
    expect(DT).toBe(0.01);
  });
});

describe('investigations F to J follow predict, experiment, observe, explain', () => {
  it('PHY-2A investigations A to E are unchanged and F to J are added', () => {
    expect(FORCE_EXPERIMENTS.map((e) => e.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(FIRST_LAW_EXPERIMENTS.map((e) => e.id)).toEqual(['F', 'G', 'H', 'I', 'J']);
  });
  it('exactly one prediction option holds for every cart route, and each explains itself', () => {
    for (const e of FIRST_LAW_EXPERIMENTS) for (const r of e.routes) {
      const o = firstLawOutcome(r);
      expect(r.options.filter((x) => x.holds(o.end, o.start)).length, `${e.id}/${r.id}`).toBe(1);
      for (const x of r.options) expect(x.why.length).toBeGreaterThan(20);
      expect(r.explain(o.end, o.start).length).toBeGreaterThan(20);
    }
  });
  it('experiment results match hand values', () => {
    const f = (id: string, i: number) => firstLawOutcome(FIRST_LAW_EXPERIMENTS.find((e) => e.id === id)!.routes[i]);
    expect(f('F', 0).end.v).toBe(4); expect(f('F', 0).end.x).toBeCloseTo(40, 9);
    expect(f('H', 0).end.v).toBe(6); expect(f('H', 1).end.v).toBe(0); expect(f('H', 1).end.x).toBeCloseTo(6, 6);
    [8, 4, 2].forEach((v, i) => expect(f('I', i).end.v).toBeCloseTo(v, 9));
  });
  it('the lesson never presents the formal second law as a result of these investigations', () => {
    for (const e of FIRST_LAW_EXPERIMENTS) expect(e.lesson).not.toMatch(/F\s*=\s*m\s*a|Newton's second law states/i);
  });
});

describe('sudden braking demonstration assumptions', () => {
  const setup = (o: Partial<BrakingSetup>): BrakingSetup => ({ ...DEFAULT_BRAKING, ...o });
  it('cruising before braking: passenger and vehicle together, no relative motion', () => {
    const s = brakingAt(setup({}), 0.5); expect(s.state).toBe('cruising'); expect(s.vehicleV).toBe(15); expect(s.passengerV).toBe(15); expect(s.relative).toBe(0); expect(s.passengerForce).toBe(0);
  });
  it('unbelted: the passenger keeps 15 m/s (no force) while the vehicle slows; they move forward by ½·d·t² relative to the vehicle', () => {
    const s = brakingAt(setup({}), BRAKE_AT + 0.3);
    expect(s.passengerV).toBe(15); expect(s.passengerForce).toBe(0); expect(s.vehicleV).toBeCloseTo(15 - 5 * 0.3, 9);
    expect(s.relative).toBeCloseTo(0.5 * 5 * 0.09, 9);
  });
  it('the demonstration ends exactly when the gap is used up, before any contact, and then freezes', () => {
    const end = endTime(setup({}));
    expect(end).toBeCloseTo(BRAKE_AT + Math.sqrt((2 * GAP_M) / 5), 9);
    const a = brakingAt(setup({}), end), b = brakingAt(setup({}), end + 5);
    expect(a.relative).toBeCloseTo(GAP_M, 9); expect(b).toEqual(a); expect(a.state).toBe('gap used up');
    for (const p of brakingHistory(setup({}))) expect(p.relative).toBeLessThanOrEqual(GAP_M + 1e-9);
  });
  it('belted: the belt force is backward and equals passenger mass × deceleration; the passenger slows with the vehicle', () => {
    for (const t of [1.5, 2.5, 3.9]) { const s = brakingAt(setup({ restrained: true }), t); expect(s.passengerForce).toBeCloseTo(-60 * 5, 9); expect(s.passengerV).toBeCloseTo(s.vehicleV, 9); expect(s.relative).toBe(0); }
    expect(brakingAt(setup({ restrained: true }), 6).vehicleV).toBe(0); expect(brakingAt(setup({ restrained: true }), 6).passengerForce).toBe(0);
  });
  it('the vehicle stops after speed/deceleration and never reverses', () => {
    const s = setup({ restrained: true }); const h = brakingHistory(s, 8);
    expect(brakingAt(s, BRAKE_AT + 3).vehicleV).toBe(0); for (const p of h) { expect(p.vehicleV).toBeGreaterThanOrEqual(0); expect(p.passengerV).toBeGreaterThanOrEqual(0); }
    expect(brakingAt(s, 8).vehicleX).toBeCloseTo(15 * 1 + 15 * 15 / (2 * 5), 9);
  });
  it('no new forward force ever appears: the passenger force is never positive', () => {
    for (const r of [true, false]) for (const p of brakingHistory(setup({ restrained: r }), 6)) expect(p.passengerForce).toBeLessThanOrEqual(0);
  });
  it('routes: exactly one option holds; validation refuses impossible values', () => {
    for (const r of BRAKING_ROUTES) { const o = brakingOutcome(r); expect(r.options.filter((x) => x.holds(o.end, r.setup)).length, r.id).toBe(1); }
    expect(validateBraking(setup({ speed: 0 }))).toMatch(/Speed/); expect(validateBraking(setup({ decel: 0 }))).toMatch(/deceleration/); expect(validateBraking(setup({ passengerMassKg: 1 }))).toMatch(/mass/);
    expect(validateBraking(setup({}))).toBeNull();
  });
});

describe('NCERT question 6 (first law and graphs)', () => {
  it('is solved with all four parts, and only object C has a net force', () => {
    const q = FORCE_EXERCISES[5];
    expect(q.number).toBe(6); expect(q.status).toBe('solved');
    expect(Object.fromEntries(q.solution!.answers.map((a) => [a.part, /^No net force/.test(a.value) ? 'none' : 'net']))).toEqual({ i: 'none', ii: 'none', iii: 'net', iv: 'none' });
    // the illustrative profiles: constant slope for A, B, D; changing slope for C
    const ill = q.solution!.illustrations!.map((x) => (x.kind === 'graph' ? x.profile.segments[0].a : NaN));
    expect(ill).toEqual([0, 0, 1, 0]);
  });
  it('later-law questions remain upcoming', () => { for (const n of [7, 9, 16]) expect(FORCE_EXERCISES[n - 1].status).toBe('upcoming'); });
});
