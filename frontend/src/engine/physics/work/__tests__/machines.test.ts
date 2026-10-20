import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import machinesSource from '../machines?raw';
import { computeLever, computePulley, computeRamp, DEFAULT_LEVER, DEFAULT_PULLEY, DEFAULT_RAMP, leverClassOf, pulleyAt, validateLever, validatePulley, validateRamp, type LeverSetup, type PulleySetup, type RampSetup } from '../machines';
import { computePower, describePower, HORSEPOWER_W, validatePower, workOf, type PowerSetup } from '../power';
import { LEVER_EXPERIMENTS, leverOutcome, PULLEY_EXPERIMENTS, pulleyOutcome, RAMP_EXPERIMENTS, rampOutcome } from '../machineExperiments';
import { POWER_EXPERIMENTS, powerOutcome } from '../powerExperiments';
import { LeverView, PulleyView, RampView } from '../../../../features/physics/work/MachineViews';
import { PowerView } from '../../../../features/physics/work/PowerView';

const ramp = (o: Partial<RampSetup>) => computeRamp({ ...DEFAULT_RAMP, ...o });
const pulley = (o: Partial<PulleySetup>) => computePulley({ ...DEFAULT_PULLEY, ...o });
const lever = (o: Partial<LeverSetup>) => computeLever({ ...DEFAULT_LEVER, ...o });
const power = (o: Partial<PowerSetup>) => computePower({ scenario: 'work', workJ: 1500, massKg: 60, height: 3, speed: 20, timeS: 5, ...o });

describe('inclined plane: independent calculations', () => {
  it('smooth ramp: F\' L = m g h, MA = L / h = load / effort, input work = output work (any mass, height, length, g)', () => {
    for (const m of [1, 20, 300]) for (const h of [0.2, 1, 4]) for (const L of [h, h * 1.5, 2 * h, 10 * h].filter((x) => x <= 20)) for (const g of [1.6, 10]) {
      const r = ramp({ massKg: m, height: h, length: L, mu: 0, g });
      expect(r.valid).toBe(true);
      expect(r.effort * L).toBeCloseTo(m * g * h, 8); expect(r.idealMA).toBeCloseTo(L / h, 9); expect(r.actualMA).toBeCloseTo((m * g) / r.effort, 8); expect(r.inputWork).toBeCloseTo(r.outputWork, 8); expect(r.lost).toBeCloseTo(0, 8); expect(r.efficiency).toBeCloseTo(1, 9);
    }
  });
  it('friction: effort adds mu m g cos(theta); the extra work is thermal energy; useful work never exceeds the input; the efficiency follows from mu', () => {
    for (const mu of [0.05, 0.3, 0.8]) for (const [h, L] of [[1, 4], [1, 2], [3, 5]]) {
      const m = 20, g = 10, r = ramp({ massKg: m, height: h, length: L, mu });
      const cos = Math.sqrt(L * L - h * h) / L, sin = h / L;
      expect(r.effort).toBeCloseTo(m * g * sin + mu * m * g * cos, 8);
      expect(r.inputWork).toBeCloseTo(m * g * h + mu * m * g * cos * L, 8); expect(r.lost).toBeCloseTo(mu * m * g * cos * L, 8);
      expect(r.outputWork).toBeLessThan(r.inputWork); expect(r.outputWork + r.lost).toBeCloseTo(r.inputWork, 8);
      expect(r.efficiency).toBeCloseTo((m * g * h) / (m * g * h + mu * m * g * cos * L), 9); expect(r.efficiency).toBeGreaterThan(0); expect(r.efficiency).toBeLessThan(1);
      expect(r.actualMA).toBeLessThan(r.idealMA);
    }
  });
  it('geometry: width = sqrt(L^2 - h^2) and the angle; textbook-size ramps (0.3 m by 0.4 m is a 0.5 m ramp; a 5-12-13 ramp)', () => {
    const a = ramp({ massKg: 10, height: 0.3, length: 0.5 }); expect(a.width).toBeCloseTo(0.4, 9); expect(a.actualMA).toBeCloseTo(5 / 3, 9); expect(a.angleDeg).toBeCloseTo(36.8699, 3);
    const b = ramp({ massKg: 10, height: 0.5, length: 1.3 }); expect(b.width).toBeCloseTo(1.2, 9); expect(b.actualMA).toBeCloseTo(2.6, 9);
    expect(ramp({ height: 1, length: 1 }).angleDeg).toBeCloseTo(90, 9); expect(ramp({ height: 1, length: 1 }).effort).toBeCloseTo(200, 9);
    // lifting straight up needs the full weight over h: the same work
    const c = ramp({ massKg: 20, height: 1, length: 4 }); expect(c.directEffort).toBe(200); expect(c.directWork).toBe(c.outputWork);
  });
  it('invalid ramps are refused with a reason, never silently', () => {
    expect(validateRamp({ ...DEFAULT_RAMP, height: 2, length: 1 })).toMatch(/cannot be shorter/); expect(validateRamp({ ...DEFAULT_RAMP, massKg: 0 })).toMatch(/mass/);
    expect(validateRamp({ ...DEFAULT_RAMP, mu: 2 })).toMatch(/friction/); expect(validateRamp({ ...DEFAULT_RAMP, length: 50 })).toMatch(/length/); expect(validateRamp({ ...DEFAULT_RAMP, height: NaN })).toMatch(/number/);
    expect(ramp({ height: 2, length: 1 }).valid).toBe(false);
  });
  it('escape-ramp style energy balance (Example 7.9 numbers): K = m g (d/2) + F d gives d = 20 m', () => {
    const m = 10000, v = 20, F = 50000, g = 10; const K = 0.5 * m * v * v;
    const d = K / ((m * g) / 2 + F); expect(d).toBe(20);
  });
});

describe('pulley: the rope constraint and the work', () => {
  it('effort = (load + movable block) / n, rope pulled = n x rise, work in = effort x rope, useful work = m g h, in = out + energy stored in the block', () => {
    for (const m of [5, 20, 100]) for (const n of [2, 3, 4, 6]) for (const blk of [0, 2, 10]) for (const lift of [0.5, 1, 3]) {
      const r = pulley({ massKg: m, strands: n, blockKg: blk, lift });
      expect(r.effort).toBeCloseTo((m * 10 + blk * 10) / n, 9); expect(r.ropePulled).toBeCloseTo(n * lift, 9);
      expect(r.inputWork).toBeCloseTo(r.effort * r.ropePulled, 8); expect(r.inputWork).toBeCloseTo((m * 10 + blk * 10) * lift, 8);
      expect(r.outputWork).toBeCloseTo(m * 10 * lift, 8); expect(r.storedInBlock).toBeCloseTo(blk * 10 * lift, 8);
      expect(r.outputWork + r.storedInBlock).toBeCloseTo(r.inputWork, 8); expect(r.outputWork).toBeLessThanOrEqual(r.inputWork + 1e-9);
      expect(r.idealMA).toBe(n); expect(r.actualMA).toBeLessThanOrEqual(n + 1e-9); expect(r.efficiency).toBeCloseTo(m / (m + blk), 9);
      if (blk === 0) { expect(r.inputWork).toBeCloseTo(r.outputWork, 8); expect(r.actualMA).toBeCloseTo(n, 9); }
    }
  });
  it('a single fixed pulley: mechanical advantage 1 (direction only), the block mass is irrelevant, rope pulled equals the rise', () => {
    const r = pulley({ massKg: 20, strands: 1, blockKg: 7, lift: 2 });
    expect(r.effort).toBe(200); expect(r.actualMA).toBe(1); expect(r.ropePulled).toBe(2); expect(r.changesDirectionOnly).toBe(true); expect(r.inputWork).toBe(r.outputWork); expect(r.blockWeight).toBe(0);
  });
  it('the rope and the load are one constraint at every fraction of the lift, and work done grows in step', () => {
    const r = pulley({ massKg: 20, strands: 4, blockKg: 2, lift: 1.5 });
    for (const p of [0, 0.25, 0.5, 1, 2, -1]) { const a = pulleyAt(r, p), q = Math.max(0, Math.min(1, p)); expect(a.rope).toBeCloseTo(4 * a.rise, 9); expect(a.rise).toBeCloseTo(1.5 * q, 9); expect(a.inWork).toBeCloseTo(r.inputWork * q, 8); expect(a.outWork).toBeCloseTo(r.outputWork * q, 8); }
  });
  it('invalid pulleys are refused (non-integer strands, too many, bad masses)', () => {
    expect(validatePulley({ ...DEFAULT_PULLEY, strands: 2.5 })).toMatch(/whole number/); expect(validatePulley({ ...DEFAULT_PULLEY, strands: 0 })).toMatch(/whole number/); expect(validatePulley({ ...DEFAULT_PULLEY, strands: 9 })).toMatch(/whole number/);
    expect(validatePulley({ ...DEFAULT_PULLEY, massKg: 0 })).toMatch(/load/); expect(validatePulley({ ...DEFAULT_PULLEY, blockKg: -1 })).toMatch(/block/); expect(validatePulley({ ...DEFAULT_PULLEY, lift: 0 })).toMatch(/lift/);
    expect(pulley({ strands: 0 }).valid).toBe(false);
  });
});

describe('lever: balance, classes and the trade of force for distance', () => {
  it('balance effort = load x load arm / effort arm; the two turning effects are equal at balance; MA = effort arm / load arm = load / effort', () => {
    for (const kg of [1, 10, 80]) for (const l2 of [0.2, 0.5, 1.5]) for (const l1 of [0.3, 1, 3.5]) {
      const r = lever({ loadKg: kg, loadArm: l2, effortArm: l1, kind: 'I', effort: 0 });
      expect(r.balanceEffort).toBeCloseTo((kg * 10 * l2) / l1, 9); expect(r.balanceEffort * l1).toBeCloseTo(kg * 10 * l2, 8); expect(r.mechanicalAdvantage).toBeCloseTo(l1 / l2, 9); expect(r.mechanicalAdvantage).toBeCloseTo((kg * 10) / r.balanceEffort, 9);
      const b = lever({ loadKg: kg, loadArm: l2, effortArm: l1, kind: 'I', effort: (kg * 10 * l2) / l1 }); expect(b.state).toBe('balanced'); expect(b.netTorque).toBeCloseTo(0, 8);
    }
  });
  it('tilting: more effort raises the load, less lets it fall, and the sign of the net turning effect decides', () => {
    expect(lever({ effort: 30 }).state).toBe('load rises'); expect(lever({ effort: 20 }).state).toBe('load falls'); expect(lever({ effort: 25 }).state).toBe('balanced');
    expect(lever({ effort: 30 }).netTorque).toBeCloseTo(30 * 2 - 100 * 0.5, 9);
  });
  it('work in = work out for the balancing effort over a small turn: the effort end moves L1/L2 times as far (arc = arm x angle)', () => {
    for (const turn of [1, 5, 10]) for (const l1 of [0.5, 2, 4]) for (const l2 of [0.3, 1]) {
      const r = lever({ loadKg: 10, loadArm: l2, effortArm: l1, effort: 0, turnDeg: turn });
      const phi = (turn * Math.PI) / 180;
      expect(r.effortDistance).toBeCloseTo(l1 * phi, 9); expect(r.loadDistance).toBeCloseTo(l2 * phi, 9); expect(r.effortWork).toBeCloseTo(r.loadWork, 8); expect(r.effortDistance / r.loadDistance).toBeCloseTo(l1 / l2, 8);
    }
    expect(lever({ turnDeg: 0 }).effortDistance).toBe(0);
  });
  it('classes: II needs the effort arm longer (MA > 1); III needs it shorter (MA < 1); Class I is unrestricted; wrong geometry is refused with a reason', () => {
    expect(lever({ kind: 'II', loadArm: 0.4, effortArm: 1.2, effort: 0 }).mechanicalAdvantage).toBeCloseTo(3, 9);
    expect(lever({ kind: 'III', loadKg: 1, loadArm: 0.3, effortArm: 0.1, effort: 0 }).mechanicalAdvantage).toBeCloseTo(1 / 3, 9);
    expect(lever({ kind: 'I', loadArm: 2, effortArm: 0.5, effort: 0 }).mechanicalAdvantage).toBeLessThan(1);
    expect(validateLever({ ...DEFAULT_LEVER, kind: 'II', loadArm: 1, effortArm: 0.5 })).toMatch(/Class II/); expect(validateLever({ ...DEFAULT_LEVER, kind: 'III', loadArm: 0.5, effortArm: 1 })).toMatch(/Class III/);
    expect(lever({ kind: 'II', loadArm: 1, effortArm: 0.5 }).valid).toBe(false);
    expect(leverClassOf(-2, 1)).toBe('I'); expect(leverClassOf(2, 1)).toBe('II'); expect(leverClassOf(1, 2)).toBe('III');
    for (const [e, l] of [[-3, 1], [1.2, 0.4], [0.1, 0.3]]) { const c = leverClassOf(e, l); const mA = Math.abs(e) / Math.abs(l); if (c === 'II') expect(mA).toBeGreaterThan(1); if (c === 'III') expect(mA).toBeLessThan(1); }
  });
  it('textbook-size seesaws: 15 kg at 2 m balances 30 kg at 1 m; the 30 kg child sits closer; 20 kg and 30 kg need 1.5 m and 1 m', () => {
    expect(lever({ loadKg: 30, loadArm: 1, effortArm: 2, effort: 150 }).state).toBe('balanced');
    expect(lever({ loadKg: 30, loadArm: 1, effortArm: 1, effort: 150 }).state).toBe('load falls');
    expect(lever({ loadKg: 30, loadArm: 1, effortArm: 1.5, effort: 0 }).balanceEffort).toBeCloseTo(200, 9);
    // 2w x L_a = w x L_c gives L_c = 2 L_a for any w
    for (const w of [50, 120]) { const r = lever({ loadKg: (2 * w) / 10, loadArm: 1, effortArm: 2, effort: w }); expect(r.state).toBe('balanced'); }
  });
  it('invalid levers are refused with a reason', () => {
    expect(validateLever({ ...DEFAULT_LEVER, loadKg: 0 })).toMatch(/load/); expect(validateLever({ ...DEFAULT_LEVER, loadArm: 0 })).toMatch(/arm/); expect(validateLever({ ...DEFAULT_LEVER, effort: -1 })).toMatch(/effort/);
    expect(validateLever({ ...DEFAULT_LEVER, turnDeg: 30 })).toMatch(/small-angle/); expect(validateLever({ ...DEFAULT_LEVER, effort: NaN })).toMatch(/number/);
  });
  it('the machine models are pure: no store, no frame counter', () => { expect(machinesSource).not.toMatch(/useEducationStore|localStorage|requestAnimationFrame/); });
});

describe('power: P = W / t', () => {
  it('matches W / t over a grid, and work from lifting (m g h) and from speeding up (1/2 m v^2)', () => {
    for (const W of [10, 1500, 90000]) for (const t of [0.5, 5, 120]) { const r = power({ workJ: W, timeS: t }); expect(r.power).toBeCloseTo(W / t, 8); expect(r.kilowatts).toBeCloseTo(W / t / 1000, 8); expect(r.horsepower).toBeCloseTo(W / t / HORSEPOWER_W, 8); expect(r.powerHalfTime).toBeCloseTo(2 * r.power, 8); expect(r.powerDoubleTime).toBeCloseTo(r.power / 2, 8); expect(r.power * t).toBeCloseTo(W, 7); }
    for (const [m, h, t] of [[60, 3, 4], [200, 5, 10], [0.5, 100, 7]]) expect(power({ scenario: 'lift', massKg: m, height: h, timeS: t }).power).toBeCloseTo((m * 10 * h) / t, 8);
    for (const [m, v, t] of [[1200, 25, 10], [800, 15, 9]]) expect(power({ scenario: 'accelerate', massKg: m, speed: v, timeS: t }).power).toBeCloseTo((0.5 * m * v * v) / t, 6);
  });
  it('hand values: 75 kg raised 2 m in 5 s is 300 W; 1000 kg from rest to 20 m/s in 10 s is 20 000 W; 1 hp = 746 W; zero work gives zero power; the same work twice as fast doubles it', () => {
    expect(power({ scenario: 'lift', massKg: 75, height: 2, timeS: 5 }).power).toBe(300);
    expect(power({ scenario: 'accelerate', massKg: 1000, speed: 20, timeS: 10 }).power).toBe(20000);
    expect(HORSEPOWER_W).toBe(746); expect(power({ workJ: 746, timeS: 1 }).horsepower).toBe(1);
    expect(power({ workJ: 0 }).power).toBe(0); expect(workOf({ scenario: 'lift', workJ: 0, massKg: 2, height: 0, speed: 0, timeS: 1 })).toBe(0);
    expect(power({ workJ: 1500, timeS: 5 }).power * 2).toBe(power({ workJ: 1500, timeS: 2.5 }).power);
  });
  it('refuses zero or negative time, bad values and out-of-range input, with the reason', () => {
    expect(validatePower({ scenario: 'work', workJ: 1, massKg: 1, height: 1, speed: 1, timeS: 0 })).toMatch(/time/); expect(power({ timeS: 0 }).valid).toBe(false); expect(power({ timeS: -2 }).valid).toBe(false);
    expect(power({ workJ: -5 }).reason).toMatch(/work/); expect(power({ scenario: 'lift', massKg: 0 }).reason).toMatch(/mass/); expect(power({ timeS: NaN }).reason).toMatch(/number/);
    expect(describePower(power({ timeS: 0 }))).toMatch(/not valid/); expect(describePower(power({ scenario: 'lift', massKg: 60, height: 3, timeS: 4 }))).toMatch(/450 W/);
  });
});

describe('machine and power investigations', () => {
  it('exactly one prediction option holds for every route, every option explains itself, and outcomes match hand values', () => {
    const check = <S, R>(exps: { id: string; routes: { id: string; setup: S; options: { label: string; why: string }[]; explain: (r: R) => string }[] }[], out: (r: never) => { result: R; holdsIndex: number }, holds: (r: never, i: number) => boolean) => {
      for (const e of exps) for (const r of e.routes) { const o = out(r as never); expect((o.result as { valid: boolean }).valid, r.id).toBe(true); expect(r.options.filter((_, i) => holds(r as never, i)).length, `${e.id}/${r.id}`).toBe(1); for (const op of r.options) expect(op.why.length, `${r.id} ${op.label}`).toBeGreaterThan(20); expect(r.explain(o.result).length).toBeGreaterThan(20); }
    };
    check(RAMP_EXPERIMENTS as never, rampOutcome as never, ((r: (typeof RAMP_EXPERIMENTS)[0]['routes'][0], i: number) => r.options[i].holds(rampOutcome(r).result)) as never);
    check(PULLEY_EXPERIMENTS as never, pulleyOutcome as never, ((r: (typeof PULLEY_EXPERIMENTS)[0]['routes'][0], i: number) => r.options[i].holds(pulleyOutcome(r).result)) as never);
    check(LEVER_EXPERIMENTS as never, leverOutcome as never, ((r: (typeof LEVER_EXPERIMENTS)[0]['routes'][0], i: number) => r.options[i].holds(leverOutcome(r).result)) as never);
    for (const e of POWER_EXPERIMENTS) for (const r of e.routes) { const o = powerOutcome(r); expect(r.options.filter((op) => op.holds(o.result)).length, r.id).toBe(1); for (const op of r.options) expect(op.why.length).toBeGreaterThan(20); }
    const rr = (id: string) => rampOutcome(RAMP_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!).result;
    expect([rr('ra1').effort, rr('ra2').effort, rr('ra2').inputWork]).toEqual([100, 25, 200]); expect(rr('rb1').effort).toBeCloseTo(108.09, 2); expect(rr('rc1').actualMA).toBeCloseTo(5 / 3, 9);
    const pr = (id: string) => pulleyOutcome(PULLEY_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!).result;
    expect([pr('pa1').effort, pr('pb1').effort, pr('pb1').ropePulled, pr('pc1').effort, pr('pc1').inputWork]).toEqual([200, 100, 2, 55, 220]);
    const lr = (id: string) => leverOutcome(LEVER_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!).result;
    expect(lr('la1').state).toBe('balanced'); expect(lr('lb1').state).toBe('balanced'); expect(lr('lb2').state).toBe('load falls'); expect(lr('lc1').mechanicalAdvantage).toBeCloseTo(3, 9); expect(lr('lc2').mechanicalAdvantage).toBeCloseTo(1 / 3, 9); expect(lr('ld1').effortWork).toBeCloseTo(lr('ld1').loadWork, 9);
    const wr = (id: string) => powerOutcome(POWER_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!).result;
    expect([wr('pa1').power, wr('pa2').power, wr('pb1').power, wr('pb2').power, wr('pc1').power]).toEqual([50, 150, 1000, 2000, 37500]);
  });
});

describe('rendered machines and power agree with the models', () => {
  it('ramp: arrows, geometry labels, readouts and the work check come from the model', () => {
    const m = renderToStaticMarkup(React.createElement(RampView, { initial: { ...DEFAULT_RAMP, mu: 0.3 }, editable: true }));
    const r = computeRamp({ ...DEFAULT_RAMP, mu: 0.3 });
    expect(m).toContain('data-arrow="effort"'); expect(m).toContain('data-arrow="friction"'); expect(m).toContain('data-testid="slope"'); expect(m).toContain(`${Math.round(r.effort * 100) / 100} N`); expect(m).toContain('data-testid="ramp-check"'); expect(m).toContain('thermal energy');
    expect(renderToStaticMarkup(React.createElement(RampView, { initial: { ...DEFAULT_RAMP, height: 5, length: 1 } }))).toContain('This setup cannot run');
  });
  it('pulley: the drawn strands equal the number of supporting strands, and the rope constraint text uses the same numbers', () => {
    for (const n of [1, 2, 3, 5]) {
      const m = renderToStaticMarkup(React.createElement(PulleyView, { initial: { ...DEFAULT_PULLEY, strands: n }, startProgress: 1 }));
      expect((m.match(/data-strand="/g) ?? []).length, `n=${n}`).toBe(n === 1 ? 2 : n);
      expect(m).toContain(`rope pulled ${n} m = ${n} × 1 m`);
    }
    expect(renderToStaticMarkup(React.createElement(PulleyView, { initial: { ...DEFAULT_PULLEY, strands: 2.5 } }))).toContain('This setup cannot run');
  });
  it('lever: effort, load, both arms and the readouts are drawn; the state text follows the model', () => {
    const m = renderToStaticMarkup(React.createElement(LeverView, { initial: DEFAULT_LEVER, editable: true }));
    expect(m).toContain('data-testid="fulcrum"'); expect(m).toContain('data-arrow="load"'); expect(m).toContain('data-arrow="effort"'); expect(m).toContain('effort arm L₁ = 2 m'); expect(m).toContain('load arm L₂ = 0.5 m'); expect(m).toContain('data-testid="lever-check"'); expect(m).toContain('balanced');
    expect(renderToStaticMarkup(React.createElement(LeverView, { initial: { ...DEFAULT_LEVER, kind: 'II', loadArm: 2, effortArm: 1 } }))).toContain('This setup cannot run');
  });
  it('power: the readouts and the graph show W, t and P = W / t', () => {
    const m = renderToStaticMarkup(React.createElement(PowerView, { initial: { scenario: 'lift', workJ: 0, massKg: 60, height: 3, speed: 0, timeS: 4 }, editable: true }));
    expect(m).toContain('1800 J'); expect(m).toContain('450 W'); expect(m).toContain('data-graph="power-graph"'); expect(m).toContain('900 W'); expect(m).toContain('225 W');
    expect(renderToStaticMarkup(React.createElement(PowerView, { initial: { scenario: 'work', workJ: 100, massKg: 1, height: 0, speed: 0, timeS: 0 } }))).toContain('This setup cannot run');
  });
});
