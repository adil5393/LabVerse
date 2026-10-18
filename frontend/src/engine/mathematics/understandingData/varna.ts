/**
 * Gold purity in varṇa (M6.1).
 *
 * What the textbook says (Exercise Set 10.1, after Śrīdharācārya's Pāṭīgaṇita):
 *   - 16 varṇa means pure gold.
 *   - k varṇa means the alloy is k/16 gold and the rest impurities.
 *   - "Now the term used is karat; 16 varṇa = 24 karat."
 *
 * Hence, for k in [0, 16]:   gold fraction = k ÷ 16.
 * Mixing pieces by MASS adds the gold masses, so
 *
 *   final varṇa = Σ(massᵢ × varṇaᵢ) ÷ Σ massᵢ        (a weighted mean, weights = masses)
 *
 * The scales are NOT interchangeable and nothing converts between them
 * silently:
 *   - varṇa is the textbook's scale (0 to 16);
 *   - "mass percent gold" is shown as the derived k/16 × 100;
 *   - the karat figure is shown only as a labelled equivalence that follows
 *     the textbook's pair "16 varṇa = 24 karat" and assumes karat is
 *     proportional to the gold fraction (24 karat = pure).
 * This is an idealised mixture model, not an assay or a metallurgy simulation.
 */

import { type Q, q, sub, mul, div, isZero, isNeg, cmp, sum, formatDecimal } from './rational';

export const FULL_VARNA = q(16);
export const FULL_KARAT = q(24);
export type MassUnit = 'g' | 'kg';

export interface VarnaPiece {
  id: string;
  label: string;
  mass: Q;
  unit: MassUnit;
  varna: Q;
}

export type VarnaErrorCode = 'empty' | 'negative_mass' | 'bad_varna' | 'zero_total';
export interface VarnaError {
  code: VarnaErrorCode;
  message: string;
  pieceId?: string;
}

const toGrams = (mass: Q, unit: MassUnit): Q => (unit === 'kg' ? mul(mass, q(1000)) : mass);

export const varnaToGoldFraction = (v: Q): Q => div(v, FULL_VARNA);
export const goldFractionToVarna = (f: Q): Q => mul(f, FULL_VARNA);
/** Gold percent by mass implied by k varṇa: k/16 × 100. */
export const varnaToGoldPercent = (v: Q): Q => mul(varnaToGoldFraction(v), q(100));
export const goldPercentToVarna = (p: Q): Q => goldFractionToVarna(div(p, q(100)));
/** Equivalent karat (24 karat = pure), following the textbook's 16 varṇa = 24 karat. */
export const varnaToKarat = (v: Q): Q => mul(varnaToGoldFraction(v), FULL_KARAT);

export function validateVarna(pieces: readonly VarnaPiece[]): VarnaError | null {
  if (pieces.length === 0) return { code: 'empty', message: 'Add at least one piece of gold to melt together.' };
  for (const p of pieces) {
    if (isNeg(p.mass)) return { code: 'negative_mass', pieceId: p.id, message: `“${p.label}” has a negative mass. Masses cannot be negative.` };
    if (isNeg(p.varna) || cmp(p.varna, FULL_VARNA) > 0) return { code: 'bad_varna', pieceId: p.id, message: `“${p.label}”: purity must be between 0 and 16 varṇa (16 varṇa is pure gold).` };
  }
  if (isZero(sum(pieces.map((p) => toGrams(p.mass, p.unit))))) return { code: 'zero_total', message: 'The total mass is 0, so there is no alloy and no purity to calculate.' };
  return null;
}

export interface VarnaContribution {
  id: string;
  label: string;
  massGrams: Q;
  /** Fraction of the whole melt supplied by this piece. */
  massShare: Q;
  /** Gold in this piece, in grams = mass × varṇa ÷ 16. */
  goldGrams: Q;
}

export interface VarnaResult {
  ok: true;
  totalGrams: Q;
  goldGrams: Q;
  finalVarna: Q;
  goldPercent: Q;
  karatEquivalent: Q;
  contributions: VarnaContribution[];
}
export type VarnaOutcome = VarnaResult | { ok: false; error: VarnaError };

export function mixVarna(pieces: readonly VarnaPiece[]): VarnaOutcome {
  const err = validateVarna(pieces);
  if (err) return { ok: false, error: err };
  const total = sum(pieces.map((p) => toGrams(p.mass, p.unit)));
  const contributions = pieces.map((p) => {
    const g = toGrams(p.mass, p.unit);
    return { id: p.id, label: p.label, massGrams: g, massShare: div(g, total), goldGrams: mul(g, varnaToGoldFraction(p.varna)) };
  });
  const gold = sum(contributions.map((c) => c.goldGrams));
  const finalVarna = goldFractionToVarna(div(gold, total));
  return { ok: true, totalGrams: total, goldGrams: gold, finalVarna, goldPercent: varnaToGoldPercent(finalVarna), karatEquivalent: varnaToKarat(finalVarna), contributions };
}

/** Step-by-step lines for the calculation panel. */
export function describeVarna(pieces: readonly VarnaPiece[], r: VarnaResult): string[] {
  const f = (x: Q) => formatDecimal(x, 4);
  const lines = pieces.map((p, i) => `${p.label}: ${f(r.contributions[i].massGrams)} g at ${f(p.varna)} varṇa → ${f(p.varna)} ÷ 16 = ${f(varnaToGoldFraction(p.varna))} gold → ${f(r.contributions[i].goldGrams)} g of gold`);
  lines.push(`Total gold = ${f(r.goldGrams)} g in a total mass of ${f(r.totalGrams)} g`);
  lines.push(`Gold fraction = ${f(r.goldGrams)} ÷ ${f(r.totalGrams)} = ${f(div(r.goldGrams, r.totalGrams))}`);
  lines.push(`Final purity = gold fraction × 16 = ${f(r.finalVarna)} varṇa`);
  lines.push(`Same result as the weighted mean of the varṇa values: Σ(mass × varṇa) ÷ Σ mass = ${f(r.finalVarna)}`);
  return lines;
}

export type VarnaSolve = { kind: 'mass'; grams: Q } | { kind: 'any_mass' } | { kind: 'impossible'; reason: string };

/**
 * How many grams of extra gold of purity `extraVarna` must be melted in with
 * `known` pieces to reach `target` varṇa?  (A + y·p)/(T + y) = t  ⇒  y = (t·T − A)/(p − t)
 * where A = Σ mass × varṇa and T = Σ mass (all in grams).
 */
export function massToReachTarget(known: readonly VarnaPiece[], extraVarna: Q, target: Q): VarnaSolve {
  const T = sum(known.map((p) => toGrams(p.mass, p.unit)));
  const A = sum(known.map((p) => mul(toGrams(p.mass, p.unit), p.varna)));
  for (const v of [extraVarna, target]) if (isNeg(v) || cmp(v, FULL_VARNA) > 0) return { kind: 'impossible', reason: 'Purity must be between 0 and 16 varṇa.' };
  const denom = sub(extraVarna, target);
  const tT = mul(target, T);
  if (isZero(denom)) return isZero(sub(tT, A)) ? { kind: 'any_mass' } : { kind: 'impossible', reason: 'The added gold already has the target purity, so adding it cannot move the melt away from its current purity.' };
  const y = div(sub(tT, A), denom);
  if (isNeg(y)) return { kind: 'impossible', reason: 'The target is not between the current purity and the added gold’s purity. A melt’s purity always lies between the purities of its pieces.' };
  return { kind: 'mass', grams: y };
}
