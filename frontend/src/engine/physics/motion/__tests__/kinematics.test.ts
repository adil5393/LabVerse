import { describe, it, expect } from 'vitest';
import {
  addMove, addMoveBy, cm, convertLength, convertTime, currentCm, describeDisplacement, describePath, describePosition, fmtM, metres, newPath, resetPath,
  sampleAt, summary, tickClock, totalDurationMs, turnCount, undoMove, waypointsCm, type MotionPath,
} from '../kinematics';

/** Build a path from a list of target positions in metres (each leg takes 1 s). */
function build(start: number, targets: number[], min = -50, max = 100): MotionPath {
  let p = newPath(start, min, max);
  for (const t of targets) { const r = addMove(p, t); if (!r.ok) throw new Error(r.reason); p = r.path; }
  return p;
}

// Independent oracle: plain arithmetic over the list of positions.
const oracle = (start: number, targets: number[]) => {
  const pts = [start, ...targets];
  let distance = 0;
  for (let i = 1; i < pts.length; i++) distance += Math.abs(pts[i] - pts[i - 1]);
  return { distance, displacement: pts[pts.length - 1] - start };
};

describe('Motion model: distance and displacement against independent arithmetic', () => {
  it('the textbook athlete (O to 100 m, back to 40 m): distance 160 m, displacement 40 m forward', () => {
    const s = summary(build(0, [100, 40]));
    expect(s.distanceCm).toBe(16000); expect(s.displacementCm).toBe(4000); expect(s.positionCm).toBe(4000);
  });
  it('many random paths, including negative positions and several reversals', () => {
    let seed = 11; const r = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    for (let n = 0; n < 500; n++) {
      const start = Math.round((r() * 150 - 50) * 2) / 2;
      const targets = Array.from({ length: 1 + Math.floor(r() * 7) }, () => Math.round((r() * 150 - 50) * 2) / 2);
      const s = summary(build(start, targets));
      const o = oracle(start, targets);
      expect(s.distanceCm / 100).toBeCloseTo(o.distance, 9);
      expect(s.displacementCm / 100).toBeCloseTo(o.displacement, 9);
      expect(Math.abs(s.displacementCm)).toBeLessThanOrEqual(s.distanceCm + 1e-9); // |net change| <= path length
      expect(s.distanceCm).toBeGreaterThanOrEqual(0);
    }
  });
  it('returning to the start gives zero displacement while the distance is the full path', () => {
    const s = summary(build(0, [40, 0]));
    expect(s.displacementCm).toBe(0); expect(s.distanceCm).toBe(8000);
    const s2 = summary(build(-12.5, [30, -12.5]));
    expect(s2.displacementCm).toBe(0); expect(s2.distanceCm).toBe(8500);
  });
  it('a path in one direction: distance equals the magnitude of displacement; a turn makes distance exceed it', () => {
    const s = summary(build(0, [10, 30, 70]));
    expect(s.distanceCm).toBe(Math.abs(s.displacementCm));
    const t = summary(build(0, [30, 20]));
    expect(t.distanceCm).toBeGreaterThan(Math.abs(t.displacementCm));
  });
  it('reversing adds distance without necessarily changing displacement: forward 50, back 20, forward 20 equals forward 50 in displacement only', () => {
    const a = summary(build(0, [50]));
    const b = summary(build(0, [50, 30, 50]));
    expect(b.displacementCm).toBe(a.displacementCm);
    expect(b.distanceCm - a.distanceCm).toBe(4000);
  });
  it('different routes, same displacement, different distance (experiment D)', () => {
    const r1 = summary(build(0, [30])), r2 = summary(build(0, [50, 30]));
    expect(r1.displacementCm).toBe(r2.displacementCm);
    expect(r1.distanceCm).toBe(3000); expect(r2.distanceCm).toBe(7000);
  });
  it('negative positions: sign of position and displacement follow the left/right convention', () => {
    const p = build(0, [-30]);
    const s = summary(p);
    expect(s.positionCm).toBe(-3000); expect(s.displacementCm).toBe(-3000); expect(s.distanceCm).toBe(3000);
    expect(describePosition(s.positionCm)).toBe('30 m to the left of O (−30 m)');
    expect(describeDisplacement(s.displacementCm)).toBe('30 m to the left (−30 m)');
    expect(describePosition(0)).toMatch(/origin/);
  });
  it('crossing the origin: from -20 to +30 is a displacement of +50 m and a distance of 50 m', () => {
    const s = summary(build(-20, [30]));
    expect(s.displacementCm).toBe(5000); expect(s.distanceCm).toBe(5000);
  });
  it('zero motion: no legs or a pause gives zero distance and zero displacement', () => {
    expect(summary(newPath(0)).distanceCm).toBe(0);
    const s = summary(build(25, [25, 25]));
    expect(s.distanceCm).toBe(0); expect(s.displacementCm).toBe(0); expect(s.heading).toBe('at rest');
  });
  it('turn counting', () => {
    expect(turnCount(build(0, [10, 20, 30]))).toBe(0);
    expect(turnCount(build(0, [30, 10, 40]))).toBe(2);
    expect(turnCount(build(0, [30, 30, 10]))).toBe(1); // a pause is not a turn
  });
  it('waypoints list the start and each stop in order', () => {
    expect(waypointsCm(build(5, [20, -10])).map(metres)).toEqual([5, 20, -10]);
  });
});

describe('Motion model: deterministic time, pause and resume, reset', () => {
  const p = build(0, [40, 10, 60]); // three 1-second legs: 40, then back 30, then forward 50
  it('the same simulated time always gives the same sample, however it is reached', () => {
    const a = sampleAt(p, 1500);
    const b = sampleAt(p, 1500);
    expect(a).toEqual(b);
    expect(a.positionCm).toBeCloseTo(cm(40) + (cm(10) - cm(40)) * 0.5, 9);
    expect(a.distanceCm).toBeCloseTo(4000 + 1500, 9);
    expect(a.heading).toBe('left');
  });
  it('distance never decreases as time increases; position is continuous; at leg ends values match the oracle', () => {
    let prev = -1, prevPos = 0;
    for (let t = 0; t <= totalDurationMs(p); t += 37) {
      const s = sampleAt(p, t);
      expect(s.distanceCm).toBeGreaterThanOrEqual(prev);
      expect(Math.abs(s.positionCm - prevPos)).toBeLessThanOrEqual(5000 * (37 / 1000) + 1e-6);
      prev = s.distanceCm; prevPos = s.positionCm;
    }
    expect(sampleAt(p, 1000).distanceCm).toBe(4000);
    expect(sampleAt(p, 2000).distanceCm).toBe(7000);
    expect(sampleAt(p, 3000).distanceCm).toBe(12000);
    expect(sampleAt(p, 3000).displacementCm).toBe(6000);
  });
  it('times outside the path are clamped (before 0 and after the end)', () => {
    expect(sampleAt(p, -500).positionCm).toBe(0);
    expect(sampleAt(p, 10 ** 9)).toMatchObject({ positionCm: 6000, distanceCm: 12000 });
  });
  it('pause and resume: stopping the clock changes nothing; resuming from the same time continues identically', () => {
    // Frame lengths are irrelevant: advancing in many small frames or one big frame reaches the same simulated time.
    let t1 = 0; for (let i = 0; i < 60; i++) t1 = tickClock(t1, 25, 2, totalDurationMs(p));
    expect(t1).toBe(3000);
    expect(tickClock(0, 1500, 1, totalDurationMs(p))).toBe(tickClock(tickClock(0, 600, 1, 3000), 900, 1, 3000));
    expect(tickClock(1000, 0, 2, 3000)).toBe(1000); // paused: no wall time passes
    expect(sampleAt(p, tickClock(1000, 0, 2, 3000))).toEqual(sampleAt(p, 1000));
  });
  it('playback rate scales only the clock, never the physics: at the same simulated time, 0.5x and 2x agree', () => {
    const fast = tickClock(0, 500, 2, 3000), slow = tickClock(0, 2000, 0.5, 3000);
    expect(fast).toBe(1000); expect(slow).toBe(1000);
    expect(sampleAt(p, fast)).toEqual(sampleAt(p, slow));
  });
  it('the clock never runs past the end and rejects negative or zero inputs safely', () => {
    expect(tickClock(2900, 1000, 1, 3000)).toBe(3000);
    expect(tickClock(1000, -5, 1, 3000)).toBe(1000);
    expect(tickClock(1000, 100, 0, 3000)).toBe(1000);
  });
  it('reset clears the history and returns to the start; undo removes only the last move', () => {
    const r = resetPath(p);
    expect(r.legs).toHaveLength(0); expect(summary(r)).toMatchObject({ distanceCm: 0, positionCm: 0, displacementCm: 0 });
    expect(currentCm(undoMove(p))).toBe(cm(10));
    expect(summary(undoMove(p)).distanceCm).toBe(7000);
    expect(p.legs).toHaveLength(3); // immutable
  });
  it('the start position is kept on reset, including a negative start', () => {
    const q = build(-15, [20]);
    expect(summary(resetPath(q)).positionCm).toBe(cm(-15));
  });
});

describe('Motion model: validation and units', () => {
  it('rejects positions off the track, non-numbers and non-positive durations, leaving the path unchanged', () => {
    const p = newPath(0, -10, 10);
    expect(addMove(p, 11).ok).toBe(false);
    expect(addMove(p, -10.01).ok).toBe(false);
    expect(addMove(p, NaN).ok).toBe(false);
    expect(addMove(p, 5, 0).ok).toBe(false);
    expect(addMove(p, 10).ok).toBe(true);
    expect(addMove(p, -10).ok).toBe(true);
    const r = addMoveBy(p, 4); expect(r.ok && currentCm(r.path)).toBe(400);
  });
  it('invalid tracks are refused', () => {
    expect(() => newPath(0, 5, 5)).toThrow();
    expect(() => newPath(200, 0, 100)).toThrow();
  });
  it('decimal positions are exact to the centimetre (no floating-point drift): 0.1 + 0.2 m legs', () => {
    const s = summary(build(0, [0.1, 0.3]));
    expect(s.distanceCm).toBe(30); expect(s.positionCm).toBe(30);
  });
  it('unit conversion matches hand calculation: cm, m, km, mm and s, min, h', () => {
    expect(convertLength(350, 'cm', 'm')).toBeCloseTo(3.5, 12);
    expect(convertLength(2.4, 'km', 'm')).toBeCloseTo(2400, 9);
    expect(convertLength(2500, 'mm', 'cm')).toBeCloseTo(250, 9);
    expect(convertLength(1, 'm', 'km')).toBeCloseTo(0.001, 12);
    expect(convertTime(2, 'min', 's')).toBe(120);
    expect(convertTime(90, 'min', 'h')).toBe(1.5);
  });
  it('formatting uses a true minus sign and the unit m', () => {
    expect(fmtM(-1250)).toBe('−12.5 m'); expect(fmtM(4000)).toBe('40 m');
  });
});

describe('Motion model: the text alternative is generated from the same state as the numbers', () => {
  it('states the track, legs, end position, distance and displacement', () => {
    const p = build(0, [100, 40]);
    const text = describePath('Athlete.', p);
    expect(text).toContain('Total distance travelled 160 m');
    expect(text).toContain('displacement 60 m'.replace('60', '40'));
    expect(text).toContain('leg 1: 0 m to 100 m (100 m to the right)');
    expect(text).toContain('leg 2: 100 m to 40 m (60 m to the left)');
    expect(text).toContain('origin O at 0 m');
  });
});
