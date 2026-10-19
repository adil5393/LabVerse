import { describe, expect, it } from 'vitest';
import { DERIVATIONS, DERIVATION_CASES, derivationById, motionOf, signedPieces } from '../derivations';
import { equationValues } from '../equations';
import type { Profile } from '../profile';

const one = (u: number, a: number, t: number): Profile => ({ x0: 0, v0: u, segments: [{ durationS: t, a }] });
const grid: Profile[] = [];
for (const u of [-8, -3, 0, 2, 11]) for (const a of [-4, -1, 0, 0.5, 3]) for (const t of [0.5, 2, 7]) grid.push(one(u, a, t));

describe('derivation steps are algebraically correct for every sign combination', () => {
  it('every step relation holds (engine values on both sides)', () => {
    for (const d of DERIVATIONS) for (const st of d.steps) for (const p of grid) {
      const m = motionOf(p);
      if (st.needsNonzeroA && m.a === 0) continue;
      if (!st.relation) continue;
      const r = st.relation(m);
      expect(Math.abs(r.lhs - r.rhs), `${d.id}/${st.id} u=${m.u} a=${m.a} t=${m.t}`).toBeLessThan(1e-9);
    }
  });
  it('steps needing a ≠ 0 are exactly the division steps of derivation C (not the a = 0 case step)', () => {
    const c = derivationById('C')!;
    expect(c.steps.filter((s) => s.needsNonzeroA).map((s) => s.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6']);
    expect(c.steps[c.steps.length - 1].needsNonzeroA).toBeFalsy();
    // the final a = 0 step holds with zero acceleration, no division
    const m = motionOf(one(5, 0, 4));
    expect(c.steps[6].relation!(m)).toEqual({ label: expect.any(String), lhs: 25, rhs: 25 });
  });
});

describe('graph areas and signed cases', () => {
  it('rectangle plus triangle equals the engine displacement and the textbook equation', () => {
    for (const p of grid) { const m = motionOf(p); const s = signedPieces(m); expect(s.total).toBeCloseTo(m.s, 9); expect(s.total).toBeCloseTo(equationValues(m.u, m.a, m.t).s, 9); }
  });
  it('first-quadrant case u=4, a=2, t=5: rectangle 20, triangle 25, total 45', () => {
    const s = signedPieces(motionOf(DERIVATION_CASES[0].profile)); expect([s.rect, s.tri, s.total]).toEqual([20, 25, 45]);
  });
  it('negative velocity and negative acceleration give negative pieces', () => {
    const s = signedPieces(motionOf(one(-4, -2, 3))); expect([s.rect, s.tri]).toEqual([-12, -9]);
    const d = signedPieces(motionOf(one(10, -2, 4))); expect([d.rect, d.tri, d.total]).toEqual([40, -16, 24]);
  });
  it('velocity crossing zero: the signed pieces still give the net displacement (0 here), not the distance', () => {
    const m = motionOf(one(6, -2, 6)); expect(signedPieces(m).total).toBeCloseTo(0, 9); expect(m.s).toBeCloseTo(0, 9);
  });
  it('a = 0: the triangle vanishes and no step divides by zero', () => {
    const m = motionOf(one(5, 0, 4)); expect(signedPieces(m).tri).toBe(0); expect(signedPieces(m).total).toBe(20);
    for (const st of derivationById('A')!.steps.concat(derivationById('B')!.steps)) if (st.relation) { const r = st.relation(m); expect(Number.isFinite(r.lhs) && Number.isFinite(r.rhs)).toBe(true); }
  });
});

describe('derivation structure and ordering', () => {
  it('three derivations in textbook order with numbers 4.4a, 4.4b, 4.4c and the expected final equations', () => {
    expect(DERIVATIONS.map((d) => [d.id, d.textbookNumber, d.equation])).toEqual([['A', '4.4a', 'v = u + at'], ['B', '4.4b', 's = ut + ½at²'], ['C', '4.4c', 'v² = u² + 2as']]);
    for (const d of DERIVATIONS) expect(d.summary[d.summary.length - 1]).toContain(d.textbookNumber);
  });
  it('step order follows the reasoning', () => {
    expect(derivationById('A')!.steps.map((s) => s.id)).toEqual(['a1', 'a2', 'a3', 'a4']);
    expect(derivationById('B')!.steps.map((s) => s.id)).toEqual(['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7']);
    expect(derivationById('C')!.steps.map((s) => s.id)).toEqual(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']);
    expect(derivationById('A')!.steps[1].math.join(' ')).toContain('at = v − u');
    expect(derivationById('C')!.steps[0].math.join(' ')).toContain('t = (v − u) ÷ a');
  });
  it('every derivation states assumptions, explains each step, and asks the student to supply at least one step', () => {
    for (const d of DERIVATIONS) {
      expect(d.assumptions.length).toBeGreaterThan(1);
      expect(d.steps.some((s) => s.check), d.id).toBe(true);
      for (const s of d.steps) { expect(s.why.length, s.id).toBeGreaterThan(30); expect(s.uses.length).toBeGreaterThan(0); }
      for (const s of d.steps) if (s.check && s.check.kind === 'choice') for (const o of s.check.options) if (o.id !== s.check.correctId) expect(s.check.feedback[o.id].message.length).toBeGreaterThan(30);
    }
  });
  it('the derivation module is isolated from the progress store: navigation can never be mastery', async () => {
    const src = await import('../derivations?raw').then((m) => (m as unknown as { default: string }).default);
    expect(src.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/useEducationStore|localStorage/);
  });
});
