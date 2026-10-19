import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import derivationsSource from '../derivations?raw';
import kineticSource from '../kineticModel?raw';
import { computeKinetic, describeKinetic, kineticAt, kineticSeries, validateKinetic, type KineticSetup } from '../kineticModel';
import { KINETIC_EXPERIMENTS, kineticRouteOutcome } from '../kineticExperiments';
import { DERIVATIONS, derivationById } from '../derivations';
import { WORK_CHAPTER } from '../learn/content';
import { allQuestions } from '../../../education/__tests__/chapterIntegrity';
import { evaluateAnswer } from '../../../education/evaluate';
import { KineticView } from '../../../../features/physics/work/KineticView';
import { DerivationView } from '../../../../features/physics/work/DerivationView';

const run = (o: Partial<KineticSetup>) => computeKinetic({ massKg: 2, netForce: 6, u: 0, displacement: 4, ...o });

describe('work-energy laboratory model: independent analytic checks', () => {
  it('W_net = F s equals the change of kinetic energy computed from the velocities, over a grid (positive, negative and zero work)', () => {
    let n = 0;
    for (const m of [0.5, 2, 10]) for (const F of [-20, -5, 0, 3, 12]) for (const u of [-6, -2, 0, 3, 8]) for (const s of [-9, -2, 0.5, 4, 15]) {
      const r = run({ massKg: m, netForce: F, u, displacement: s });
      if (!r.valid) continue;
      n++;
      // independent route: v^2 = u^2 + 2 a s, a = F/m
      const v2 = u * u + 2 * (F / m) * s;
      expect(v2).toBeGreaterThanOrEqual(-1e-9);
      expect(Math.abs(r.v)).toBeCloseTo(Math.sqrt(Math.max(0, v2)), 6);
      expect(r.dK).toBeCloseTo(0.5 * m * v2 - 0.5 * m * u * u, 6);
      expect(r.wNet).toBeCloseTo(F * s, 9);
      expect(r.wNet).toBeCloseTo(r.dK, 6);
      expect(r.K0).toBeGreaterThanOrEqual(0); expect(r.K1).toBeGreaterThanOrEqual(0);
    }
    expect(n).toBeGreaterThan(100);
  });
  it('kinetic energy depends on the square of the speed: doubling the speed gives four times K, tripling gives nine, for any mass', () => {
    for (const m of [0.5, 3, 40]) for (const v of [1, 2.5, 7]) {
      const a = run({ massKg: m, netForce: 0, u: v, displacement: 3 }).K0, b = run({ massKg: m, netForce: 0, u: 2 * v, displacement: 3 }).K0, c = run({ massKg: m, netForce: 0, u: 3 * v, displacement: 3 }).K0;
      expect(b / a).toBeCloseTo(4, 9); expect(c / a).toBeCloseTo(9, 9);
      expect(run({ massKg: 2 * m, netForce: 0, u: v, displacement: 3 }).K0 / a).toBeCloseTo(2, 9);
    }
  });
  it('hand values: pushed from rest, braked, and the textbook-size trolley', () => {
    const d = run({ massKg: 2, netForce: 6, u: 0, displacement: 4 });
    expect(d.wNet).toBe(24); expect(d.K1).toBe(24); expect(d.v).toBeCloseTo(Math.sqrt(24), 9); expect(d.tEnd).toBeCloseTo(Math.sqrt(2 * 4 / 3), 9);
    const e = run({ massKg: 2, netForce: -6, u: 6, displacement: 4 });
    expect(e.wNet).toBe(-24); expect(e.K0).toBe(36); expect(e.K1).toBe(12);
    const stop = run({ massKg: 40, netForce: -60, u: 6, displacement: 12 });
    expect(stop.valid).toBe(true); expect(stop.K0).toBe(720); expect(stop.K1).toBeCloseTo(0, 9); expect(stop.tEnd).toBeCloseTo(4, 9);
  });
  it('zero force and zero displacement', () => {
    const coast = run({ netForce: 0, u: 4, displacement: 3 });
    expect(coast.wNet).toBe(0); expect(coast.dK).toBe(0); expect(coast.v).toBe(4); expect(coast.tEnd).toBeCloseTo(0.75, 9);
    const none = run({ displacement: 0 });
    expect(none.valid).toBe(true); expect(none.tEnd).toBe(0); expect(none.wNet).toBe(0); expect(none.dK).toBe(0);
    expect(run({ netForce: 0, u: 0, displacement: 3 }).valid).toBe(false);
  });
  it('a direction reversal: the work uses the net displacement, the path is longer, and K is zero at the turning point', () => {
    const r = run({ massKg: 1, netForce: -4, u: 4, displacement: -2 });
    expect(r.valid).toBe(true); expect(r.reversal).toBe(true);
    expect(r.tTurn).toBeCloseTo(1, 9);
    expect(r.tEnd).toBeCloseTo((4 + Math.sqrt(32)) / 4, 9);
    expect(r.v).toBeCloseTo(-Math.sqrt(32), 9); expect(r.v).toBeLessThan(0);
    expect(r.wNet).toBe(8); expect(r.K0).toBe(8); expect(r.K1).toBeCloseTo(16, 9); expect(r.distance).toBeCloseTo(6, 9);
    expect(kineticAt(r, r.tTurn!).K).toBeCloseTo(0, 9); expect(kineticAt(r, r.tTurn!).x).toBeCloseTo(2, 9);
    const back = run({ massKg: 1, netForce: -4, u: 4, displacement: -2 });
    for (const q of kineticSeries(back, 200)) expect(q.K).toBeGreaterThanOrEqual(0);
    expect(describeKinetic(r)).toMatch(/turning back/);
  });
  it('unreachable displacements are refused with the reason, never faked', () => {
    const r = run({ netForce: -6, u: 6, displacement: 8 });
    expect(r.valid).toBe(false); expect(r.reason).toMatch(/stops the object after 6 m/);
    expect(run({ netForce: 0, u: 3, displacement: -5 }).reason).toMatch(/away from the target/);
    expect(validateKinetic({ massKg: 0, netForce: 1, u: 0, displacement: 1 })).toMatch(/mass/);
    expect(validateKinetic({ massKg: 1, netForce: NaN, u: 0, displacement: 1 })).toMatch(/number/);
    expect(validateKinetic({ massKg: 1, netForce: 1e9, u: 0, displacement: 1 })).toMatch(/net force/);
    expect(describeKinetic(r)).toMatch(/not valid/);
  });
  it('state at a time follows x = ut + at^2/2 and v = u + at, is clamped, and is deterministic', () => {
    const r = run({ massKg: 2, netForce: 6, u: 1, displacement: 6 });
    for (const t of [0, 0.4, 1, r.tEnd / 2]) {
      const q = kineticAt(r, t);
      expect(q.x).toBeCloseTo(1 * t + 0.5 * 3 * t * t, 9); expect(q.v).toBeCloseTo(1 + 3 * t, 9); expect(q.K).toBeCloseTo(0.5 * 2 * q.v * q.v, 9); expect(q.workSoFar).toBeCloseTo(6 * q.x, 9);
    }
    expect(kineticAt(r, -5).t).toBe(0); expect(kineticAt(r, 999).t).toBe(r.tEnd); expect(kineticAt(r, 999).x).toBeCloseTo(6, 9);
    expect(JSON.stringify(kineticSeries(r, 30))).toBe(JSON.stringify(kineticSeries(run({ massKg: 2, netForce: 6, u: 1, displacement: 6 }), 30)));
  });
  it('the model uses simulated time only (no frame counter, no integration, no store)', () => {
    expect(kineticSource).not.toMatch(/requestAnimationFrame|frameCount|performance\.now|useEducationStore|localStorage/);
  });
});

describe('work-energy investigations A to F', () => {
  it('exactly one prediction option holds for every route; every option explains itself', () => {
    expect(KINETIC_EXPERIMENTS.map((e) => e.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    for (const e of KINETIC_EXPERIMENTS) for (const r of e.routes) {
      const out = kineticRouteOutcome(r);
      expect(out.result.valid, r.id).toBe(true);
      expect(r.options.filter((o) => o.holds(out.result)).length, `${e.id}/${r.id}`).toBe(1);
      for (const o of r.options) expect(o.why.length, `${r.id} ${o.label}`).toBeGreaterThan(o.holds(out.result) ? 15 : 25);
      expect(r.explain(out.result).length).toBeGreaterThan(20);
    }
  });
  it('model outcomes match hand values', () => {
    const g = (id: string) => kineticRouteOutcome(KINETIC_EXPERIMENTS.flatMap((e) => e.routes).find((x) => x.id === id)!).result;
    expect([g('a1').K0, g('a2').K0]).toEqual([8, 24]); expect([g('b1').K0, g('b2').K0]).toEqual([4, 36]); expect([g('c1').K0, g('c2').K0]).toEqual([9, 36]);
    expect([g('d1').wNet, g('d1').K1]).toEqual([24, 24]); expect([g('e1').wNet, g('e1').K1]).toEqual([-24, 12]);
    expect([g('f1').K1, g('f1').dK]).toEqual([19, 15]); expect([g('f2').wNet, g('f2').K1]).toEqual([8, 16]);
  });
});

describe('derivations: every numerical relation holds for every sampled parameter set', () => {
  it('all six derivations exist with assumptions, a summary, parameters, and a missing-step question in key steps', () => {
    expect(DERIVATIONS.map((d) => d.id)).toEqual(['K', 'U', 'C', 'R', 'L', 'P']);
    for (const d of DERIVATIONS) {
      expect(d.assumptions.length, d.id).toBeGreaterThanOrEqual(2); expect(d.summary.length, d.id).toBeGreaterThanOrEqual(3); expect(d.params.length, d.id).toBeGreaterThanOrEqual(2);
      expect(d.steps.length, d.id).toBeGreaterThanOrEqual(5);
      expect(d.steps.filter((s) => s.check).length, `${d.id} missing-step questions`).toBeGreaterThanOrEqual(2);
      for (const s of d.steps) { expect(s.math.length, s.id).toBeGreaterThan(0); expect(s.why.length, s.id).toBeGreaterThan(30); expect(s.uses.length, s.id).toBeGreaterThan(0); }
      expect(d.source).toMatch(/NCERT/);
    }
    expect(derivationById('U')!.steps.some((s) => /enrichment/i.test(s.title))).toBe(true);
    expect(derivationById('L')!.source).toMatch(/enrichment/); expect(derivationById('P')!.steps.some((s) => /Enrichment/.test(s.title))).toBe(true);
  });
  it('step relations (both sides computed separately) agree over grids of parameters; invalid parameters report a problem instead of numbers', () => {
    let checked = 0;
    for (const d of DERIVATIONS) {
      const grid = (p: (typeof d.params)[number]) => [p.min, (p.min + p.max) / 2, p.max, d.defaults[p.id]];
      let combos: Record<string, number>[] = [{}];
      for (const p of d.params) combos = combos.flatMap((c) => grid(p).map((v) => ({ ...c, [p.id]: v })));
      for (const c of combos.slice(0, 300)) {
        const { ctx, problem } = d.context(c);
        if (problem) { expect(problem.length).toBeGreaterThan(10); continue; }
        for (const s of d.steps) if (s.relation) {
          const r = s.relation(ctx);
          expect(Math.abs(r.lhs - r.rhs), `${d.id}/${s.id} ${JSON.stringify(c)}: ${r.lhs} vs ${r.rhs}`).toBeLessThan(1e-6 * Math.max(1, Math.abs(r.lhs)));
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(1000);
  });
  it('the energy derivation numbers are independent of the code that draws them (hand values)', () => {
    const k = derivationById('K')!.context({ m: 2, F: 6, u: 0, s: 4 }).ctx; expect([k.W, k.K1, k.as]).toEqual([24, 24, 12]); expect(k.halfV).toBeCloseTo(12, 9);
    const c = derivationById('C')!.context({ m: 2, h: 10, t: 1 }).ctx; expect([c.v, c.hp, c.U1, c.K1, c.E1, c.E0]).toEqual([10, 5, 100, 100, 200, 200]);
    const u = derivationById('U')!.context({ m: 2, g: 10, h0: 1, dh: 3, ref: 0 }).ctx; expect([u.Wlift, u.Wgrav, u.dU, u.U1]).toEqual([60, -60, 60, 80]);
    const r = derivationById('R')!.context({ m: 20, h: 1, L: 4 }).ctx; expect([r.Fe, r.MA, r.dU, r.Win]).toEqual([50, 4, 200, 200]);
    const l = derivationById('L')!.context({ F2: 100, L2: 0.5, L1: 2, phi: 5 }).ctx; expect(l.F1).toBe(25); expect(l.MA).toBe(4);
    const p = derivationById('P')!.context({ W: 1500, t: 5, d: 10 }).ctx; expect([p.P1, p.P2]).toEqual([300, 600]);
    expect(derivationById('C')!.context({ m: 2, h: 10, t: 3 }).problem).toMatch(/reaches the ground/);
    expect(derivationById('R')!.context({ m: 2, h: 3, L: 1 }).problem).toMatch(/cannot be shorter/);
    expect(derivationById('U')!.context({ m: 2, g: 10, h0: 1, dh: -5, ref: 0 }).problem).toMatch(/below the ground/);
  });
  it('reference level: the change of potential energy does not depend on the chosen zero, but U itself does', () => {
    const a = derivationById('U')!.context({ m: 2, g: 10, h0: 3, dh: 2, ref: 0 }).ctx, b = derivationById('U')!.context({ m: 2, g: 10, h0: 3, dh: 2, ref: 3 }).ctx;
    expect(a.dU).toBe(b.dU); expect(a.U1 - a.U0).toBeCloseTo(b.U1 - b.U0, 9); expect(a.U0).not.toBe(b.U0);
  });
  it('missing-step questions have specific feedback, unique ids and an accepted correct answer', () => {
    const chapterIds = new Set(allQuestions(WORK_CHAPTER).map((x) => x.q.id));
    const seen = new Set<string>();
    for (const d of DERIVATIONS) for (const s of d.steps) if (s.check) {
      const q = s.check;
      expect(seen.has(q.id), q.id).toBe(false); seen.add(q.id); expect(chapterIds.has(q.id), q.id).toBe(false);
      expect(q.kind).toBe('choice');
      if (q.kind !== 'choice') continue;
      expect(evaluateAnswer(q, { kind: 'choice', id: q.correctId }).correct).toBe(true);
      for (const o of q.options) if (o.id !== q.correctId) expect(q.feedback[o.id].message.length, `${q.id}/${o.id}`).toBeGreaterThan(15);
    }
  });
  it('a derivation is data plus reasoning: it imports nothing from learning progress, so pressing Next can never grant mastery', () => {
    const code = derivationsSource.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code).not.toMatch(/useEducationStore|localStorage/);
  });
});

describe('rendered laboratory and derivation agree with the model', () => {
  it('the Work-Energy scene, table and theorem line show the model values', () => {
    const setup = { massKg: 2, netForce: 6, u: 0, displacement: 4 };
    const m = renderToStaticMarkup(React.createElement(KineticView, { initial: setup, editable: true }));
    expect(m).toContain('data-readout="W"'); expect(m).toContain('+24 J'); expect(m).toContain('data-testid="kinetic-theorem"'); expect(m).toContain('W_net = +24 J');
    expect(m).toContain('data-bar="kinetic"'); expect(m).toContain('Net force against position'); expect(m).toContain('Kinetic energy against time');
    const bad = renderToStaticMarkup(React.createElement(KineticView, { initial: { massKg: 2, netForce: -6, u: 6, displacement: 8 } }));
    expect(bad).toContain('This setup cannot run'); expect(bad).not.toContain('data-testid="kinetic-theorem"');
  });
  it('the derivation page starts closed on the missing-step question (the maths of a gated step is hidden)', () => {
    const m = renderToStaticMarkup(React.createElement(DerivationView, { id: 'K' }));
    expect(m).toContain('data-testid="derivation-assumptions"'); expect(m).toContain('data-testid="derivation-params"'); expect(m).toContain('data-testid="derivation-figure"');
    expect(m).toContain('data-testid="derivation-gate"'); expect(m).not.toContain('data-testid="derivation-math"');
  });
});
