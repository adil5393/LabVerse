import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import energySource from '../energyLab?raw';
import { computeEnergy, describeEnergy, energyAtDistance, energyAtTime, energySeries, validateEnergy, type EnergySetup } from '../energyLab';
import { ENERGY_EXPERIMENTS, energyRouteOutcome } from '../energyExperiments';
import { EnergyView } from '../../../../features/physics/work/EnergyView';

const base: EnergySetup = { massKg: 2, startHeight: 5, angleDeg: 90, mu: 0, g: 10, u0: 0, refHeight: 0 };
const run = (o: Partial<EnergySetup>) => computeEnergy({ ...base, ...o });

describe('energy laboratory: independent analytic checks', () => {
  it('free fall: v = sqrt(2 g h), K = m g h at the bottom, t = sqrt(2 h / g)', () => {
    for (const m of [0.5, 2, 30]) for (const h of [1, 5, 20, 80]) for (const g of [1.6, 10, 24]) {
      const r = run({ massKg: m, startHeight: h, g }); const e = energyAtDistance(r, r.sEnd);
      expect(e.v).toBeCloseTo(Math.sqrt(2 * g * h), 9); expect(e.K).toBeCloseTo(m * g * h, 7); expect(r.tEnd).toBeCloseTo(Math.sqrt((2 * h) / g), 9);
      expect(e.h).toBeCloseTo(0, 12); expect(e.U).toBeCloseTo(0, 7);
    }
  });
  it('K + U is constant at every sampled time with no friction, for every ramp angle, mass, height and g (no numerical drift)', () => {
    let n = 0;
    for (const m of [0.3, 4, 90]) for (const h of [0.5, 3, 40]) for (const angle of [5, 30, 45, 60, 90]) for (const g of [1.6, 10]) for (const u0 of [0, 3]) for (const href of [0, 7, -4]) {
      const r = run({ massKg: m, startHeight: h, angleDeg: angle, g, u0, refHeight: href });
      for (const e of energySeries(r, 50)) { expect(e.mechanical, `${m}/${h}/${angle}`).toBeCloseTo(r.E0, 6); expect(e.Q).toBe(0); expect(e.total).toBeCloseTo(r.E0, 6); n++; }
    }
    expect(n).toBeGreaterThan(5000);
  });
  it('the bottom speed depends only on the height: not on the mass or the shape of the smooth ramp (Example 7.8)', () => {
    const ref = Math.sqrt(2 * 10 * 4);
    for (const m of [0.2, 3, 50]) for (const angle of [10, 30, 60, 90]) expect(energyAtDistance(run({ massKg: m, startHeight: 4, angleDeg: angle }), 1e9).v).toBeCloseTo(ref, 9);
    // a steeper ramp is quicker
    expect(run({ startHeight: 4, angleDeg: 60 }).tEnd).toBeLessThan(run({ startHeight: 4, angleDeg: 30 }).tEnd);
  });
  it('with friction: Q = mu m g cos(theta) s, K + U falls by exactly Q, the total K + U + Q is conserved, and the bottom speed is smaller', () => {
    for (const mu of [0.05, 0.2, 0.4]) for (const angle of [30, 45, 60]) for (const m of [1, 3]) {
      const r = run({ massKg: m, startHeight: 4, angleDeg: angle, mu }); expect(r.reachesBottom).toBe(true);
      const e = energyAtDistance(r, r.sEnd); const d = 4 / Math.sin((angle * Math.PI) / 180);
      expect(e.Q).toBeCloseTo(mu * m * 10 * Math.cos((angle * Math.PI) / 180) * d, 9);
      expect(e.mechanical).toBeCloseTo(r.E0 - e.Q, 9); expect(e.total).toBeCloseTo(r.E0, 9);
      expect(e.v).toBeLessThan(Math.sqrt(2 * 10 * 4));
      for (const s of energySeries(r, 40)) expect(s.total).toBeCloseTo(r.E0, 9);
      // an independent kinematic cross-check: v^2 = 2 a d with a = g (sin - mu cos)
      expect(e.v).toBeCloseTo(Math.sqrt(2 * 10 * (Math.sin((angle * Math.PI) / 180) - mu * Math.cos((angle * Math.PI) / 180)) * d), 9);
    }
  });
  it('hand values: the 3 kg block on the 30 degree, 4 m ramp, smooth and with mu = 0.2', () => {
    const s = energyAtDistance(run({ massKg: 3, startHeight: 4, angleDeg: 30 }), 1e9); expect(s.K).toBeCloseTo(120, 9); expect(s.v).toBeCloseTo(Math.sqrt(80), 9);
    const f = energyAtDistance(run({ massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2 }), 1e9);
    expect(f.Q).toBeCloseTo(0.2 * 3 * 10 * Math.cos(Math.PI / 6) * 8, 9); expect(f.K).toBeCloseTo(120 - f.Q, 9); expect(f.Q).toBeCloseTo(41.569, 3);
  });
  it('the reference height changes U but not K, Q, the change of U or the motion; negative U is allowed, negative K never', () => {
    const a = run({ massKg: 2, startHeight: 5, refHeight: 0 }), b = run({ massKg: 2, startHeight: 5, refHeight: 5 }), c = run({ massKg: 2, startHeight: 5, refHeight: 8 });
    for (const [r, u0] of [[a, 100], [b, 0], [c, -60]] as const) { expect(r.U0).toBeCloseTo(u0, 9); expect(energyAtDistance(r, r.sEnd).U - r.U0).toBeCloseTo(-100, 9); expect(energyAtDistance(r, r.sEnd).K).toBeCloseTo(100, 9); expect(r.tEnd).toBe(a.tEnd); }
    expect(energyAtDistance(b, b.sEnd).U).toBeLessThan(0);
    for (const e of energySeries(a, 60)) expect(e.K).toBeGreaterThanOrEqual(0);
  });
  it('friction too large to slide: the object stays at rest, and decelerating cases stop part way, never faking a bottom', () => {
    const hold = run({ angleDeg: 20, mu: 0.5, startHeight: 3 });
    expect(hold.valid).toBe(true); expect(hold.slides).toBe(false); expect(hold.tEnd).toBe(0); expect(describeEnergy(hold)).toMatch(/does not move/);
    const stop = run({ angleDeg: 20, mu: 0.5, startHeight: 3, u0: 3 });
    expect(stop.slides).toBe(true); expect(stop.reachesBottom).toBe(false); expect(stop.sEnd).toBeCloseTo(9 / (2 * 10 * (0.5 * Math.cos(Math.PI * 20 / 180) - Math.sin(Math.PI * 20 / 180))), 9);
    const e = energyAtDistance(stop, stop.sEnd); expect(e.v).toBeCloseTo(0, 9); expect(e.total).toBeCloseTo(stop.E0, 9);
    const fast = run({ angleDeg: 20, mu: 0.5, startHeight: 3, u0: 30 }); expect(fast.reachesBottom).toBe(true);
  });
  it('a vertical drop ignores friction (there is no normal force), zero values and limits are handled, invalid input is refused with a reason', () => {
    expect(energyAtDistance(run({ mu: 0.9 }), 1e9).K).toBeCloseTo(100, 9);
    expect(validateEnergy({ ...base, massKg: 0 })).toMatch(/mass/); expect(validateEnergy({ ...base, startHeight: 0 })).toMatch(/height/); expect(validateEnergy({ ...base, angleDeg: 2 })).toMatch(/angle/);
    expect(validateEnergy({ ...base, mu: 2 })).toMatch(/friction/); expect(validateEnergy({ ...base, g: 0 })).toMatch(/g must/); expect(validateEnergy({ ...base, u0: -1 })).toMatch(/initial speed/);
    expect(validateEnergy({ ...base, refHeight: 500 })).toMatch(/reference/); expect(validateEnergy({ ...base, massKg: NaN })).toMatch(/number/);
    expect(run({ massKg: 0 }).valid).toBe(false); expect(describeEnergy(run({ massKg: 0 }))).toMatch(/not valid/);
  });
  it('state at a time follows s = u t + a t^2 / 2, is clamped and deterministic; the model has no frame counter, bounce or store', () => {
    const r = run({ massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2, u0: 1 });
    for (const t of [0, 0.3, 1, r.tEnd]) { const e = energyAtTime(r, t); expect(e.s).toBeCloseTo(1 * Math.min(t, r.tEnd) + 0.5 * r.a * Math.min(t, r.tEnd) ** 2, 9); expect(e.v).toBeCloseTo(1 + r.a * Math.min(t, r.tEnd), 9); }
    expect(energyAtTime(r, -3).t).toBe(0); expect(energyAtTime(r, 99).s).toBeCloseTo(r.slopeLength, 9);
    expect(JSON.stringify(energySeries(r, 20))).toBe(JSON.stringify(energySeries(run({ massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2, u0: 1 }), 20)));
    expect(energySource).not.toMatch(/requestAnimationFrame|frameCount|performance\.now|useEducationStore|localStorage/);
  });
  it('describeEnergy states the friction accounting honestly', () => {
    expect(describeEnergy(run({ angleDeg: 30, mu: 0.2, startHeight: 4, massKg: 3 }))).toMatch(/decreases by exactly the thermal energy/);
    expect(describeEnergy(run({}))).toMatch(/stays constant/);
  });
});

describe('energy investigations A to F', () => {
  it('exactly one prediction option holds for every route; every option explains itself', () => {
    expect(ENERGY_EXPERIMENTS.map((e) => e.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    for (const e of ENERGY_EXPERIMENTS) for (const r of e.routes) {
      const out = energyRouteOutcome(r);
      expect(out.result.valid, r.id).toBe(true);
      expect(r.options.filter((o) => o.holds(out.state, out.result)).length, `${e.id}/${r.id}`).toBe(1);
      for (const o of r.options) expect(o.why.length, `${r.id} ${o.label}`).toBeGreaterThan(o.holds(out.state, out.result) ? 15 : 25);
      expect(r.explain(out.state, out.result).length).toBeGreaterThan(20);
    }
  });
  it('model outcomes match hand values', () => {
    const g = (id: string) => energyRouteOutcome(ENERGY_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!);
    expect([g('a1').state.v, g('a1').state.K]).toEqual([10, 100]); expect([g('a2').state.v, g('a2').state.K]).toEqual([20, 400]);
    expect([g('b1').state.K, g('b2').state.K, g('b2').state.v]).toEqual([50, 200, 10]);
    expect([g('c1').state.K, g('c1').state.U]).toEqual([100, 100]);
    expect(g('d1').state.K).toBeCloseTo(120, 9); expect(g('d2').state.v).toBeCloseTo(Math.sqrt(80), 9);
    expect(g('e1').state.Q).toBeCloseTo(41.569, 3); expect(g('f1').state.U).toBeCloseTo(-100, 9);
  });
});

describe('rendered Energy Laboratory agrees with the model', () => {
  it('scene, bars, table, total check and reference line show the model values', () => {
    const setup = { massKg: 3, startHeight: 4, angleDeg: 30, mu: 0.2, g: 10, u0: 0, refHeight: 0 };
    const m = renderToStaticMarkup(React.createElement(EnergyView, { initial: setup, editable: true, startFraction: 1 }));
    const r = computeEnergy(setup), e = energyAtTime(r, r.tEnd);
    expect(m).toContain('data-testid="energy-svg"'); expect(m).toContain('data-testid="energy-bars"'); expect(m).toContain('data-bar="thermal"'); expect(m).toContain(`data-value="${e.Q}"`);
    expect(m).toContain('data-testid="reference-line"'); expect(m).toContain('data-testid="energy-total"'); expect(m).toContain('✓ K + U + Q');
    expect(m).toContain('the mechanical energy K + U has dropped by exactly Q');
    expect(m).toContain('Energy against time');
    const bad = renderToStaticMarkup(React.createElement(EnergyView, { initial: { ...setup, massKg: 0 } }));
    expect(bad).toContain('This setup cannot run'); expect(bad).not.toContain('data-testid="energy-total"');
  });
});
