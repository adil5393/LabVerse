import { describe, expect, it } from 'vitest';
import { intervalStats, legVelocity, motionKind, pathFromRoute, wholeTrip, speedEqualsVelocityMagnitude, msToKmh, kmhToMs, speedVelocityLines } from '../speed';

// Independent expected values are computed by hand from the definitions.
describe('speed and velocity from motion history', () => {
  it('equal distances in different times give different speeds', () => {
    const slow = wholeTrip(pathFromRoute({ startM: 0, legs: [{ toM: 60, durationS: 12 }] }));
    const fast = wholeTrip(pathFromRoute({ startM: 0, legs: [{ toM: 60, durationS: 6 }] }));
    expect(slow.averageSpeed).toBeCloseTo(5, 9);
    expect(fast.averageSpeed).toBeCloseTo(10, 9);
  });
  it('reversal: speed stays positive, velocity is the net', () => {
    const s = wholeTrip(pathFromRoute({ startM: 0, legs: [{ toM: 40, durationS: 4 }, { toM: 10, durationS: 6 }] }));
    expect(s.distanceM).toBe(70);
    expect(s.displacementM).toBe(10);
    expect(s.averageSpeed).toBeCloseTo(7, 9);
    expect(s.averageVelocity).toBeCloseTo(1, 9);
    expect(speedEqualsVelocityMagnitude(s)).toBe(false);
  });
  it('return to start: zero average velocity, positive average speed', () => {
    const s = wholeTrip(pathFromRoute({ startM: 0, legs: [{ toM: 30, durationS: 5 }, { toM: 0, durationS: 5 }] }));
    expect(s.averageVelocity).toBe(0);
    expect(s.averageSpeed).toBeCloseTo(6, 9);
  });
  it('interval stats work on a sub-interval and clamp', () => {
    const p = pathFromRoute({ startM: 0, legs: [{ toM: 40, durationS: 4 }, { toM: 10, durationS: 6 }] });
    const s = intervalStats(p, 2000, 7000); // 20 m at t=2; position 40-... at t=7 (3 s into leg 2, 5 m/s left) = 25
    expect(s.distanceM).toBeCloseTo(20 + 15, 9);
    expect(s.displacementM).toBeCloseTo(5, 9);
    expect(intervalStats(p, 0, 999999).timeS).toBe(10);
    expect(intervalStats(p, 3000, 3000).averageSpeed).toBeNull();
  });
  it('classifies uniform motion, uniform speed with turn, and rest', () => {
    expect(motionKind(pathFromRoute({ startM: 0, legs: [{ toM: 10, durationS: 2 }, { toM: 20, durationS: 2 }] })).kind).toBe('uniform motion');
    const turn = motionKind(pathFromRoute({ startM: 0, legs: [{ toM: 10, durationS: 2 }, { toM: 0, durationS: 2 }] }));
    expect(turn).toMatchObject({ kind: 'non-uniform motion', uniformSpeed: true, uniformVelocity: false });
    expect(motionKind(pathFromRoute({ startM: 5, legs: [] })).kind).toBe('at rest');
  });
  it('leg velocity is signed', () => {
    const p = pathFromRoute({ startM: 20, legs: [{ toM: 0, durationS: 4 }] });
    expect(legVelocity(p.legs[0])).toBe(-5);
  });
  it('unit conversion matches NCERT 72 km/h = 20 m/s', () => {
    expect(kmhToMs(72)).toBeCloseTo(20, 9);
    expect(msToKmh(20)).toBeCloseTo(72, 9);
  });
  it('text lines carry the substitution and direction', () => {
    const l = speedVelocityLines(wholeTrip(pathFromRoute({ startM: 0, legs: [{ toM: -20, durationS: 4 }] })));
    expect(l.speed).toContain('5 m/s');
    expect(l.velocity).toContain('−5 m/s');
    expect(l.direction).toContain('negative');
  });
});

import { compareRatePrediction, experimentById, routeRates } from '../experiments';
describe('PHY-1B experiments E to I against hand-computed values', () => {
  const rate = (id: string, i = 0) => { const e = experimentById(id)!; return routeRates(e, e.routes[i]); };
  it('E: equal distances, different times', () => { expect(rate('E', 0)).toMatchObject({ averageSpeed: 5, averageVelocity: 5 }); expect(rate('E', 1)).toMatchObject({ averageSpeed: 10, averageVelocity: 10 }); });
  it('F: equal times, different distances', () => { expect(rate('F', 0).averageSpeed).toBe(3); expect(rate('F', 1).averageSpeed).toBe(8); });
  it('G: reversal', () => { const r = rate('G'); expect(r.averageSpeed).toBeCloseTo(7, 9); expect(r.averageVelocity).toBeCloseTo(1, 9); });
  it('H: return to start', () => { const r = rate('H'); expect(r.averageSpeed).toBe(6); expect(r.averageVelocity).toBe(0); });
  it('I: equal speed, different velocity', () => { expect([0, 1, 2].map((i) => rate('I', i).averageSpeed)).toEqual([6, 6, 6]); expect([0, 1, 2].map((i) => rate('I', i).averageVelocity)).toEqual([6, 0, -6]); });
  it('feedback names the specific mistake', () => {
    const a = rate('G');
    expect(compareRatePrediction(a, { speed: 1, velocity: 1 }).messages.join(' ')).toMatch(/used the displacement/);
    expect(compareRatePrediction(a, { speed: 7, velocity: 7 }).messages.join(' ')).toMatch(/gave the average speed/);
    expect(compareRatePrediction(a, { speed: 7, velocity: 1 }).messages).toEqual(['Your prediction matches the model.']);
  });
});
