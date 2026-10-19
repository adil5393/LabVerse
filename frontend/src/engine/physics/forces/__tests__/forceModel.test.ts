import { describe, expect, it } from 'vitest';
import { DEFAULT_SETUP, DT, G, SURFACES, driveForce, explain, sampleAtTime, simulate, stopTime, validateSetup, type Setup } from '../forceModel';
import { diagramOf, individualForces, netFromArrows, netWorking, verticalNetFromArrows } from '../forceDiagram';
import { stateAt } from '../../motion/profile';

const S = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, ...o });
const at = (s: Setup, t: number) => sampleAtTime(s, t, 20);

describe('net force of collinear forces (independent hand values)', () => {
  it('same direction adds: 10 N + 6 N right = 16 N, a = 8 m/s², v(3 s) = 24, x(3 s) = 36', () => {
    const s = S({ massKg: 2, forceA: 10, forceB: 6, dirB: 'right' });
    const p = at(s, 3);
    expect(p.net).toBe(16); expect(p.a).toBe(8); expect(p.v).toBeCloseTo(24, 9); expect(p.x).toBeCloseTo(36, 9);
  });
  it('opposite directions subtract: 10 N right and 6 N left = 4 N right (Example 6.1 b); swapped = 4 N left (c)', () => {
    expect(at(S({ forceA: 10, forceB: 6 }), 0).net).toBe(4);
    expect(at(S({ forceA: 10, dirA: 'left', forceB: 6, dirB: 'right' }), 0).net).toBe(-4);
    expect(at(S({ forceA: 10, forceB: 6 }), 0).a).toBe(2);
  });
  it('equal and opposite forces balance: net 0, velocity stays 0 from rest', () => {
    const s = S({ forceA: 10, forceB: 10 });
    for (const t of [0, 1, 5, 20]) { const p = at(s, t); expect(p.net).toBe(0); expect(p.v).toBe(0); expect(p.x).toBe(0); }
  });
  it('balanced forces on a moving cart: constant velocity (not zero velocity), x = ut', () => {
    const s = S({ forceA: 10, forceB: 10, startVelocity: 3 });
    for (const t of [0.5, 2, 7.25]) { const p = at(s, t); expect(p.v).toBeCloseTo(3, 9); expect(p.x).toBeCloseTo(3 * t, 9); }
  });
  it('zero force on a frictionless track: constant velocity, including zero', () => {
    expect(at(S({ startVelocity: 4 }), 10).v).toBe(4);
    expect(at(S({}), 10).v).toBe(0);
  });
  it('a force to the left (negative) gives a negative acceleration: 5 N left on 2 kg = −2.5 m/s²', () => {
    const p = at(S({ massKg: 2, forceA: 5, dirA: 'left' }), 2);
    expect(p.a).toBe(-2.5); expect(p.v).toBeCloseTo(-5, 9); expect(p.x).toBeCloseTo(-5, 9);
  });
  it('mass: same force on twice the mass gives half the acceleration', () => {
    const a = (m: number) => at(S({ massKg: m, forceA: 8 }), 0).a;
    expect([a(1), a(2), a(4)]).toEqual([8, 4, 2]); expect(a(2) / a(4)).toBe(2);
  });
  it('agrees with the exact constant-acceleration engine of Chapter 4 for an unbalanced push', () => {
    const s = S({ massKg: 3, forceA: 12, startVelocity: 2 });
    const prof = { x0: 0, v0: 2, segments: [{ durationS: 10, a: 4 }] };
    for (const t of [0, 1.5, 4, 10]) { const p = at(s, t), q = stateAt(prof, t); expect(p.x).toBeCloseTo(q.x, 9); expect(p.v).toBeCloseTo(q.v, 9); }
  });
});

describe('friction: stopping, static holding and no impossible motion', () => {
  it('a sliding cart with no push stops after u/(μk g) s and u²/(2 μk g) m, then stays at rest (never reverses)', () => {
    const s = S({ massKg: 2, surfaceId: 'wood', startVelocity: 6 }); // μk 0.3: a = −3
    expect(stopTime(s)).toBeCloseTo(2, 2);
    const stopped = at(s, 2.5);
    expect(stopped.v).toBe(0); expect(stopped.x).toBeCloseTo(6, 9);
    for (const p of simulate(s, 20)) { expect(p.v).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(6 + 1e-9); }
    expect(at(s, 20).x).toBeCloseTo(6, 9);
    expect(at(s, 1).v).toBeCloseTo(3, 9); expect(at(s, 1).x).toBeCloseTo(4.5, 9);
  });
  it('the stopping distance does not depend on mass (friction is proportional to mass)', () => {
    const d = (m: number) => at(S({ massKg: m, surfaceId: 'polished', startVelocity: 6 }), 20).x; // μk 0.15 → 12 m
    expect(d(1)).toBeCloseTo(12, 9); expect(d(10)).toBeCloseTo(12, 9);
  });
  it('less friction: the cart slides farther', () => {
    const d = (id: string) => sampleAtTime(S({ surfaceId: id, startVelocity: 6 }), 30, 30).x;
    expect(d('ice')).toBeGreaterThan(d('polished')); expect(d('polished')).toBeGreaterThan(d('wood')); expect(d('wood')).toBeGreaterThan(d('rough'));
    expect(d('wood')).toBeCloseTo(36 / (2 * 3), 9);
  });
  it('frictionless: a moving cart never stops', () => { expect(stopTime(S({ startVelocity: 5 }))).toBeNull(); expect(at(S({ startVelocity: 5 }), 20).v).toBe(5); });
  it('friction cannot start a cart moving: no push, at rest, rough surface stays at rest', () => {
    const p = at(S({ surfaceId: 'rough' }), 10); expect(p.v).toBe(0); expect(p.x).toBe(0); expect(p.friction).toBe(0); expect(p.frictionKind).toBe('none');
  });
  it('static friction matches a gentle push (3 N on wood, 2 kg: limit 8 N): net 0, friction −3 N, at rest', () => {
    const p = at(S({ massKg: 2, forceA: 3, surfaceId: 'wood' }), 5);
    expect(p.v).toBe(0); expect(p.net).toBe(0); expect(p.friction).toBe(-3); expect(p.frictionKind).toBe('static');
  });
  it('a push beyond the static limit slides: 9 N on wood, 2 kg gives net 9 − 6 = 3 N, a = 1.5 m/s²', () => {
    const p = at(S({ massKg: 2, forceA: 9, surfaceId: 'wood' }), 2);
    expect(p.a).toBe(1.5); expect(p.v).toBeCloseTo(3, 9); expect(p.frictionKind).toBe('kinetic'); expect(p.friction).toBe(-6);
  });
  it('a push equal to the kinetic friction on a moving cart: constant velocity (Example 6.2)', () => {
    const p = at(S({ massKg: 2, forceA: 6, surfaceId: 'wood', startVelocity: 4 }), 8); // μk g m = 6 N
    expect(p.net).toBeCloseTo(0, 9); expect(p.v).toBeCloseTo(4, 9); expect(p.x).toBeCloseTo(32, 9);
  });
  it('a moving cart pushed back: stops at the right instant, then static friction holds the small leftover push', () => {
    const s = S({ massKg: 2, forceA: 2, dirA: 'left', surfaceId: 'wood', startVelocity: 6 }); // a = −(2+6)/2 = −4: stops at 1.5 s, 4.5 m
    expect(stopTime(s)).toBeCloseTo(1.5, 2);
    for (const t of [1.6, 5, 20]) { const p = at(s, t); expect(p.v).toBe(0); expect(p.x).toBeCloseTo(4.5, 9); }
  });
  it('a strong push the other way after stopping starts it moving back (a reversal driven by the push)', () => {
    const p = at(S({ massKg: 2, forceA: 20, dirA: 'left', surfaceId: 'wood', startVelocity: 6 }), 10);
    expect(p.v).toBeLessThan(0);
  });
});

describe('fixed-step determinism, pause and reset', () => {
  it('samples lie on the fixed step grid and the history is reproducible', () => {
    const s = S({ forceA: 10, forceB: 4, surfaceId: 'polished', startVelocity: 1 });
    const a = simulate(s, 5), b = simulate({ ...s }, 5);
    expect(a.length).toBe(Math.round(5 / DT) + 1); expect(a[1].t).toBe(DT); expect(a[a.length - 1].t).toBe(5);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('the state at a time does not depend on which times were asked before (pause, scrub and reset are pure)', () => {
    const s = S({ forceA: 7, surfaceId: 'wood', startVelocity: 2 });
    const first = at(s, 3.37); at(s, 12); at(s, 0); const again = at(s, 3.37);
    expect(again).toEqual(first);
  });
  it('time is a count of simulated steps, never the render frame rate', () => { expect(DT).toBe(0.01); });
});

describe('validation and explanation text', () => {
  it('refuses impossible setups', () => {
    expect(validateSetup(DEFAULT_SETUP)).toBeNull();
    expect(validateSetup({ ...DEFAULT_SETUP, massKg: 0 })).toMatch(/Mass/);
    expect(validateSetup({ ...DEFAULT_SETUP, massKg: -2 })).toMatch(/Mass/);
    expect(validateSetup({ ...DEFAULT_SETUP, forceA: -5 })).toMatch(/negative/);
    expect(validateSetup({ ...DEFAULT_SETUP, forceB: 1000 })).toMatch(/at most/);
    expect(validateSetup({ ...DEFAULT_SETUP, startVelocity: NaN })).toMatch(/number/);
  });
  it('surfaces are ordered by friction and static is at least kinetic', () => {
    for (const s of SURFACES) expect(s.muS).toBeGreaterThanOrEqual(s.muK);
    expect(SURFACES.map((s) => s.muK)).toEqual([...SURFACES.map((s) => s.muK)].sort((a, b) => a - b));
  });
  it('the explanation names the net force, the acceleration and the balanced case', () => {
    const s = S({ forceA: 10, forceB: 6 });
    expect(explain(s, at(s, 0))).toMatch(/net force is \+4 N/);
    const bal = S({ forceA: 10, forceB: 10, startVelocity: 3 });
    expect(explain(bal, at(bal, 0))).toMatch(/velocity stays constant at \+3 m\/s even though the cart is moving/);
  });
  it('drive force is the signed sum', () => { expect(driveForce(S({ forceA: 3, dirA: 'left', forceB: 5, dirB: 'right' }))).toBe(2); expect(G).toBe(10); });
});

describe('force diagrams agree with the model', () => {
  const grid: Setup[] = [];
  for (const fa of [0, 4, 10]) for (const fb of [0, 6, 10]) for (const surf of ['frictionless', 'wood']) for (const u of [0, 3]) grid.push(S({ forceA: fa, forceB: fb, surfaceId: surf, startVelocity: u, massKg: 2 }));
  it('the net arrow recomputed from the individual arrows equals the model net force at every time', () => {
    for (const s of grid) for (const t of [0, 0.7, 2, 6]) {
      const p = at(s, t), d = diagramOf(p);
      expect(Math.abs(netFromArrows(d.arrows) - p.net), JSON.stringify(s)).toBeLessThan(1e-9);
      expect(Math.abs(d.netValue - p.net)).toBeLessThan(1e-9);
    }
  });
  it('weight and the normal force are vertical and cancel; they never enter the horizontal net force', () => {
    for (const s of grid) {
      const p = at(s, 1), d = diagramOf(p);
      expect(d.verticalNet).toBe(0); expect(verticalNetFromArrows(d.arrows)).toBe(0);
      const w = d.arrows.find((a) => a.kind === 'weight')!, n = d.arrows.find((a) => a.kind === 'normal')!;
      expect([w.direction, n.direction]).toEqual(['down', 'up']); expect(w.magnitude).toBe(2 * G); expect(n.magnitude).toBe(2 * G);
    }
  });
  it('every arrow acts ON the cart and names the object that exerts it; direction matches the sign', () => {
    const d = diagramOf(at(S({ forceA: 10, forceB: 6, surfaceId: 'wood', startVelocity: 1 }), 0.5));
    for (const a of d.arrows) { expect(a.on).toBe('cart'); expect(a.by.length).toBeGreaterThan(2); if (a.horizontal !== 0) expect(a.direction).toBe(a.horizontal > 0 ? 'right' : 'left'); }
    expect(d.arrows.find((a) => a.id === 'friction')!.direction).toBe('left');
  });
  it('the net arrow points the way the acceleration points; no net arrow when balanced', () => {
    const p = at(S({ forceA: 10, forceB: 6 }), 0), d = diagramOf(p);
    expect(d.net!.direction).toBe('right'); expect(d.net!.magnitude).toBe(4); expect(Math.sign(p.a)).toBe(1);
    expect(diagramOf(at(S({ forceA: 5, forceB: 5 }), 0)).net).toBeNull();
    expect(netWorking(individualForces(at(S({ forceA: 10, forceB: 6 }), 0)))).toBe('10 N right + 6 N left  →  4 N right');
    expect(diagramOf(at(S({ forceA: 5, forceB: 5 }), 0)).text).toMatch(/cancel/);
  });
  it('zero force gives a diagram with only the vertical pair', () => { const a = individualForces(at(S({}), 0)); expect(a.map((x) => x.id)).toEqual(['normal', 'weight']); });
});
