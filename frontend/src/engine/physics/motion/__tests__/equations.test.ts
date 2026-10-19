import { describe, expect, it } from 'vitest';
import { checkAgainstProfile, chooseEquation, EQUATION_PRESETS, equationsApply, equationValues, stoppingDistance, substitutions } from '../equations';
import { circleSpeed, circleStateAt, describeCircle, validateCircle, type CircleSetup } from '../circular';
import { stateAt } from '../profile';

describe('equations of motion', () => {
  it('hand-computed values', () => {
    const e = equationValues(4, 2, 5); // v = 14, s = 20 + 25 = 45, v² = 196 = 16 + 180
    expect(e.v).toBe(14); expect(e.s).toBe(45); expect(e.v2Left).toBe(196); expect(e.v2Right).toBe(196);
    const b = equationValues(20, -4, 5); // brakes to rest: s = 100 − 50 = 50
    expect(b.v).toBe(0); expect(b.s).toBe(50);
    expect(stoppingDistance(20, 4)).toBe(50);
  });
  it('v² = u² + 2as holds for many combinations, including negative u and a and a = 0', () => {
    for (const u of [-8, -3, 0, 2, 11]) for (const a of [-4, -1, 0, 0.5, 3]) for (const t of [0, 0.5, 2, 7]) {
      const e = equationValues(u, a, t);
      expect(e.v2Left).toBeCloseTo(e.v2Right, 9);
    }
  });
  it('agrees with the profile engine for every single-stage preset and a range of times', () => {
    for (const p of EQUATION_PRESETS.filter((x) => equationsApply(x.profile).ok)) for (const t of [0, 1, 2.5, 4, 5]) {
      expect(checkAgainstProfile(p.profile, t), `${p.id} t=${t}`).toBeLessThan(1e-9);
    }
  });
  it('zero acceleration reduces to v = u and s = ut', () => { const e = equationValues(6, 0, 10); expect(e.v).toBe(6); expect(e.s).toBe(60); });
  it('s is the displacement, not the distance, when the velocity reverses', () => {
    const p = EQUATION_PRESETS.find((x) => x.id === 'throw-up')!.profile;
    const e = equationValues(p.v0, p.segments[0].a, 10);
    expect(e.s).toBeCloseTo(0, 9);
    expect(stateAt(p, 10).distance).toBeCloseTo(50, 9);
  });
  it('refuses to apply the equations across a change of acceleration, and shows what goes wrong', () => {
    const p = EQUATION_PRESETS.find((x) => x.id === 'two-stage')!.profile;
    const r = equationsApply(p);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toMatch(/4 s/);
    // naive: v = u + a1 t over 8 s would give 24 m/s, the truth is 12 − 4 = 8 m/s
    expect(equationValues(0, 3, 8).v).toBe(24);
    expect(stateAt(p, 8).v).toBeCloseTo(8, 9);
  });
  it('chooses the equation from the given and wanted quantities', () => {
    expect(chooseEquation(['u', 'a', 't'], 'v')?.equation).toBe('v = u + at');
    expect(chooseEquation(['u', 'a', 't'], 's')?.equation).toBe('s = ut + ½at²');
    expect(chooseEquation(['u', 'v', 'a'], 's')?.equation).toBe('v² = u² + 2as');
    expect(chooseEquation(['u', 'v', 's'], 'a')?.equation).toBe('v² = u² + 2as');
    expect(chooseEquation(['u', 'v', 'a'], 't')?.equation).toBe('v = u + at');
    expect(chooseEquation(['u', 'v'], 's')).toBeNull();
  });
  it('substitution text keeps the signs', () => {
    const s = substitutions(equationValues(-3, -2, 4));
    expect(s[0].result).toBe('v = −11 m/s');
    expect(s[0].working).toContain('(−2)');
    expect(s[1].result).toBe('s = −28 m');
  });
});

describe('uniform circular motion geometry', () => {
  const c: CircleSetup = { radiusM: 10, periodS: 20, spin: 'counterclockwise' };
  it('speed is constant and equals 2πr/T', () => {
    expect(circleSpeed(c)).toBeCloseTo(Math.PI, 12);
    for (const t of [0, 1, 3.7, 10, 20, 33]) expect(Math.hypot(circleStateAt(c, t).vx, circleStateAt(c, t).vy)).toBeCloseTo(Math.PI, 9);
  });
  it('velocity is perpendicular to the radius at every time and keeps turning', () => {
    let prev = -1;
    for (const t of [0, 2, 5, 9, 14, 19]) {
      const s = circleStateAt(c, t);
      expect(s.x * s.vx + s.y * s.vy).toBeCloseTo(0, 9);
      expect(s.velocityAngleDeg).not.toBeCloseTo(prev, 3); prev = s.velocityAngleDeg;
    }
  });
  it('start, quarter, half and full turn (hand values)', () => {
    const q = circleStateAt(c, 5), h = circleStateAt(c, 10), f = circleStateAt(c, 20);
    expect(q.x).toBeCloseTo(0, 9); expect(q.y).toBeCloseTo(10, 9);
    expect(q.distance).toBeCloseTo((Math.PI * 10) / 2, 9); expect(q.displacement).toBeCloseTo(10 * Math.SQRT2, 9);
    expect(h.displacement).toBeCloseTo(20, 9); expect(h.distance).toBeCloseTo(10 * Math.PI, 9);
    expect(f.displacement).toBeCloseTo(0, 9); expect(f.distance).toBeCloseTo(20 * Math.PI, 9);
    expect(f.averageVelocity).toBeCloseTo(0, 9); expect(f.averageSpeed).toBeCloseTo(Math.PI, 9);
  });
  it('displacement size never exceeds the arc length and uses 2-D geometry (chord = 2r|sin(θ/2)|)', () => {
    for (const t of [0.5, 3, 7, 11, 17, 25, 40]) {
      const s = circleStateAt(c, t);
      expect(s.displacement).toBeLessThanOrEqual(s.distance + 1e-9);
      expect(s.displacement).toBeCloseTo(2 * 10 * Math.abs(Math.sin(s.theta / 2)), 9);
    }
  });
  it('clockwise motion mirrors the counter-clockwise one', () => {
    const cw = circleStateAt({ ...c, spin: 'clockwise' }, 5);
    expect(cw.y).toBeCloseTo(-10, 9);
    expect(cw.velocityAngleDeg).toBeCloseTo(180, 9); // at (0,−10) clockwise motion heads towards −x
    expect(cw.distance).toBeCloseTo(circleStateAt(c, 5).distance, 9);
  });
  it('averages are undefined at t = 0 and the description states the changing direction', () => {
    const s0 = circleStateAt(c, 0);
    expect(s0.averageSpeed).toBeNull(); expect(s0.averageVelocity).toBeNull(); expect(s0.distance).toBe(0);
    expect(describeCircle(c, circleStateAt(c, 5))).toMatch(/keeps turning/);
  });
  it('validates the setup', () => {
    expect(validateCircle(c)).toBeNull();
    expect(validateCircle({ ...c, radiusM: 0 })).toMatch(/Radius/);
    expect(validateCircle({ ...c, periodS: -1 })).toMatch(/Period/);
    expect(validateCircle({ ...c, radiusM: NaN })).toMatch(/numbers/);
  });
});

describe('numbers quoted in lessons 9 and 10', () => {
  it('equation lesson', () => {
    expect(equationValues(5, 3, 4).v).toBe(17);
    expect(equationValues(4, 2, 5).s).toBe(45);
    expect(equationValues(18, -3, 6)).toMatchObject({ v: 0, s: 54 });
    expect(stoppingDistance(18, 3)).toBe(54);
    expect(equationValues(3, 2, 6).v).toBe(15); expect(equationValues(20, -4, 3).v).toBe(8);
    expect(equationValues(0, 2, 6).s).toBe(36); expect(equationValues(10, -2, 4).s).toBe(24); expect(equationValues(-4, -2, 3).s).toBe(-21);
    expect(Math.sqrt(2 * 5 * 40)).toBe(20); expect(stoppingDistance(15, 3)).toBe(37.5);
    expect((10 * 10 - 6 * 6) / (2 * 16)).toBe(2);
    // changing acceleration stage by stage: 1 m/s² for 10 s then 0.5 m/s² for 20 s
    expect(equationValues(equationValues(0, 1, 10).v, 0.5, 20).v).toBe(20);
  });
  it('circular lesson (π = 3.14)', () => {
    const c: CircleSetup = { radiusM: 10, periodS: 20, spin: 'counterclockwise' };
    expect(circleSpeed(c)).toBeCloseTo(3.14, 2);
    expect(circleStateAt(c, 5).distance).toBeCloseTo(15.7, 1);
    expect(circleStateAt(c, 10).displacement).toBeCloseTo(20, 9);
    expect(circleStateAt(c, 10).distance).toBeCloseTo(31.4, 1);
    const track: CircleSetup = { radiusM: 50, periodS: 157, spin: 'counterclockwise' };
    expect(circleSpeed(track)).toBeCloseTo(2, 2);
    expect(circleStateAt(track, 78.5).displacement).toBeCloseTo(100, 6);
  });
});
