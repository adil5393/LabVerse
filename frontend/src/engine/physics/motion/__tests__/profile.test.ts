import { describe, expect, it } from 'vitest';
import { areaVT, averageAcceleration, classify, SCENARIOS, series, stateAt, totalTime, turningTimes, validateProfile, type Profile } from '../profile';
import { pathFromRoute } from '../speed';
import { sampleAt } from '../kinematics';

// Independent oracle: tiny-step numerical integration of v(t) = u + a t, summing v and |v|.
function numeric(p: Profile, T: number) {
  const n = 200000, h = T / n;
  let x = p.x0, v = p.v0, dist = 0, tt = 0, seg = 0, segEnd = p.segments[0].durationS;
  for (let i = 0; i < n; i++) {
    while (tt >= segEnd - 1e-12 && seg < p.segments.length - 1) { seg++; segEnd += p.segments[seg].durationS; }
    const a = p.segments[seg].a, vm = v + 0.5 * a * h; // midpoint velocity
    x += vm * h; dist += Math.abs(vm) * h; v += a * h; tt += h;
  }
  return { x, v, dist };
}

describe('constant-acceleration profile', () => {
  it('matches closed forms and numerical integration for every scenario', () => {
    for (const sc of SCENARIOS) {
      const T = totalTime(sc.profile), s = stateAt(sc.profile, T), n = numeric(sc.profile, T), g = sc.profile.segments[0];
      expect(s.v, sc.id).toBeCloseTo(sc.profile.v0 + g.a * T, 9);
      expect(s.x, sc.id).toBeCloseTo(sc.profile.x0 + sc.profile.v0 * T + 0.5 * g.a * T * T, 9);
      expect(s.x, sc.id).toBeCloseTo(n.x, 3);
      expect(s.distance, sc.id).toBeCloseTo(n.dist, 3);
    }
  });
  it('reversal: turns at 5 s, distance 50 m, displacement 0', () => {
    const p = SCENARIOS.find((s) => s.id === 'reversal')!.profile;
    expect(turningTimes(p)).toEqual([5]);
    const e = stateAt(p, 10);
    expect(e.distance).toBeCloseTo(50, 9); expect(e.displacement).toBeCloseTo(0, 9); expect(e.v).toBeCloseTo(-10, 9);
    expect(stateAt(p, 5)).toMatchObject({ v: 0 });
    expect(stateAt(p, 5).x).toBeCloseTo(25, 9);
    const area = areaVT(p, 0, 10);
    expect(area.signed).toBeCloseTo(0, 9); expect(area.absolute).toBeCloseTo(50, 9);
  });
  it('average acceleration is change in velocity over time, with sign', () => {
    const p = SCENARIOS.find((s) => s.id === 'slow-down')!.profile;
    expect(averageAcceleration(p, 0, 8)).toBeCloseTo(-2, 9);
    expect(averageAcceleration(p, 3, 3)).toBeNull();
  });
  it('negative acceleration with negative velocity speeds the object up', () => {
    const p: Profile = { x0: 0, v0: -3, segments: [{ durationS: 4, a: -2 }] };
    expect(classify(p)).toBe('speeding up');
    expect(Math.abs(stateAt(p, 4).v)).toBeGreaterThan(3);
  });
  it('classification', () => {
    const c = (id: string) => classify(SCENARIOS.find((s) => s.id === id)!.profile);
    expect([c('rest'), c('const-pos'), c('const-neg'), c('speed-up'), c('slow-down'), c('reversal'), c('uniform-acc')])
      .toEqual(['rest', 'constant velocity', 'constant velocity', 'speeding up', 'slowing down', 'turns back', 'speeding up']);
  });
  it('multi-segment states are continuous at the join', () => {
    const p: Profile = { x0: 0, v0: 0, segments: [{ durationS: 4, a: 2 }, { durationS: 4, a: 0 }, { durationS: 4, a: -2 }] };
    const a = stateAt(p, 4 - 1e-9), b = stateAt(p, 4 + 1e-9);
    expect(a.x).toBeCloseTo(b.x, 6); expect(a.v).toBeCloseTo(b.v, 6);
    expect(stateAt(p, 12).v).toBeCloseTo(0, 9);
    expect(stateAt(p, 12).x).toBeCloseTo(16 + 32 + 16, 9);
  });
  it('with zero acceleration it agrees with the uniform-motion path model', () => {
    const path = pathFromRoute({ startM: 0, legs: [{ toM: 40, durationS: 8 }] });
    const prof: Profile = { x0: 0, v0: 5, segments: [{ durationS: 8, a: 0 }] };
    for (const t of [0, 1.5, 4, 8]) { const s = sampleAt(path, t * 1000), q = stateAt(prof, t); expect(q.x * 100).toBeCloseTo(s.positionCm, 6); expect(q.distance * 100).toBeCloseTo(s.distanceCm, 6); }
  });
  it('series includes the turning point and the end', () => {
    const p = SCENARIOS.find((s) => s.id === 'reversal')!.profile;
    const s = series(p, 20);
    expect(s.some((q) => Math.abs(q.t - 5) < 1e-12)).toBe(true);
    expect(s[s.length - 1].t).toBe(10);
  });
  it('refuses impossible or out-of-range motions', () => {
    expect(validateProfile({ x0: 0, v0: 0, segments: [] })).toMatch(/at least one/);
    expect(validateProfile({ x0: 0, v0: 0, segments: [{ durationS: -1, a: 1 }] })).toMatch(/greater than zero/);
    expect(validateProfile({ x0: 0, v0: 0, segments: [{ durationS: 5, a: 99 }] })).toMatch(/Acceleration/);
    expect(validateProfile({ x0: 0, v0: NaN, segments: [{ durationS: 5, a: 1 }] })).toMatch(/numbers/);
    for (const s of SCENARIOS) expect(validateProfile(s.profile), s.id).toBeNull();
  });
});

describe('numbers quoted in the Unit 3 lessons', () => {
  const sc = (id: string) => SCENARIOS.find((s) => s.id === id)!.profile;
  it('match the engine', () => {
    expect(stateAt(sc('const-pos'), 7).x).toBe(28);
    expect(stateAt(sc('const-pos'), 5).x).toBe(20);
    expect(stateAt(sc('const-neg'), 6).x).toBe(16);
    expect(stateAt(sc('uniform-acc'), 8)).toMatchObject({ v: 20, x: 96 });
    expect(averageAcceleration(sc('uniform-acc'), 0, 8)).toBe(2);
    expect(stateAt(sc('speed-up'), 8)).toMatchObject({ v: 18, x: 80 });
    expect(stateAt(sc('slow-down'), 8)).toMatchObject({ v: 0, x: 64 });
    expect(areaVT(sc('uniform-acc'), 0, 8).signed).toBe(96);
    expect(96 / 8).toBe(12);
    expect(stateAt(sc('reversal'), 5).x).toBe(25);
  });
});
