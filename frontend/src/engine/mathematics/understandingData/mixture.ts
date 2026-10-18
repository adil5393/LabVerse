/**
 * Mixture model (M6): a *mathematical* model, not a physical-chemistry
 * simulation.
 *
 * Modelling assumptions (shown to students):
 *  1. Quantities are on one consistent basis: all by volume (mL, L) or all by
 *     mass (g, kg). Volume and mass are never mixed without an explicit
 *     conversion, which this model does not perform.
 *  2. Quantities are treated as additive (500 mL + 200 mL = 700 mL). Real
 *     liquids are not always perfectly additive.
 *  3. No solute is gained or lost. Each constituent's concentration is the
 *     percentage of THAT constituent's quantity which is the named solute.
 *
 * final concentration = total solute / total mixture
 */

import { type Q, ZERO, HUNDRED, sub, mul, div, isZero, isNeg, cmp, sum, q, formatDecimal } from './rational';

export type Unit = 'mL' | 'L' | 'g' | 'kg';
export type Basis = 'volume' | 'mass';

const UNITS: Record<Unit, { basis: Basis; toBase: Q; base: Unit }> = {
  mL: { basis: 'volume', toBase: q(1), base: 'mL' },
  L: { basis: 'volume', toBase: q(1000), base: 'mL' },
  g: { basis: 'mass', toBase: q(1), base: 'g' },
  kg: { basis: 'mass', toBase: q(1000), base: 'g' },
};

export const unitBasis = (u: Unit): Basis => UNITS[u].basis;
export const baseUnitOf = (u: Unit): Unit => UNITS[u].base;
export const toBaseQuantity = (amount: Q, u: Unit): Q => mul(amount, UNITS[u].toBase);

export interface Constituent {
  id: string;
  label: string;
  quantity: Q;
  unit: Unit;
  /** Percent (0–100) of this constituent's quantity that is each named solute. */
  solutes: Record<string, Q>;
}

export type MixtureErrorCode =
  | 'empty'
  | 'negative_quantity'
  | 'bad_percent'
  | 'incompatible_basis'
  | 'zero_total';

export interface MixtureError {
  code: MixtureErrorCode;
  message: string;
  constituentId?: string;
}

export interface MixtureContribution {
  id: string;
  label: string;
  /** Quantity in the base unit (mL or g). */
  baseQuantity: Q;
  /** Fraction of the whole mixture that this constituent supplies. */
  quantityShare: Q;
  /** Amount of each solute this constituent supplies, in the base unit. */
  soluteAmounts: Record<string, Q>;
}

export interface MixtureResult {
  ok: true;
  basis: Basis;
  baseUnit: Unit;
  totalQuantity: Q;
  /** Total amount of each solute (base unit). */
  soluteTotals: Record<string, Q>;
  /** Final concentration of each solute, in percent. */
  concentrations: Record<string, Q>;
  contributions: MixtureContribution[];
  assumptions: string[];
}

export type MixtureOutcome = MixtureResult | { ok: false; error: MixtureError };

export const MIXTURE_ASSUMPTIONS: readonly string[] = [
  'All quantities use one consistent basis (all by volume, or all by mass).',
  'Quantities are modelled as additive: the mixture quantity is the sum of the parts. Real liquids are not always perfectly additive.',
  'No solute is lost or gained, and each percentage is measured on its own constituent’s quantity.',
];

export function validateConstituents(list: readonly Constituent[]): MixtureError | null {
  if (list.length === 0) return { code: 'empty', message: 'Add at least one constituent to mix.' };
  const basis = unitBasis(list[0].unit);
  for (const c of list) {
    if (isNeg(c.quantity)) return { code: 'negative_quantity', constituentId: c.id, message: `“${c.label}” has a negative quantity. Quantities cannot be negative.` };
    for (const [solute, pct] of Object.entries(c.solutes)) {
      if (isNeg(pct) || cmp(pct, HUNDRED) > 0) {
        return { code: 'bad_percent', constituentId: c.id, message: `“${c.label}”: the ${solute} concentration must be between 0% and 100%.` };
      }
    }
    if (unitBasis(c.unit) !== basis) {
      return {
        code: 'incompatible_basis',
        constituentId: c.id,
        message: `Cannot combine “${list[0].label}” (${basis === 'volume' ? 'by volume' : 'by mass'}) with “${c.label}” (${unitBasis(c.unit) === 'volume' ? 'by volume' : 'by mass'}). Percentages on different bases need an explicit conversion (for example using density), which this model does not assume.`,
      };
    }
  }
  const total = sum(list.map((c) => toBaseQuantity(c.quantity, c.unit)));
  if (isZero(total)) return { code: 'zero_total', message: 'The total quantity is 0, so there is no mixture and no concentration to calculate.' };
  return null;
}

export function mixConstituents(list: readonly Constituent[]): MixtureOutcome {
  const err = validateConstituents(list);
  if (err) return { ok: false, error: err };
  const basis = unitBasis(list[0].unit);
  const total = sum(list.map((c) => toBaseQuantity(c.quantity, c.unit)));
  const soluteNames = [...new Set(list.flatMap((c) => Object.keys(c.solutes)))];
  const contributions: MixtureContribution[] = list.map((c) => {
    const base = toBaseQuantity(c.quantity, c.unit);
    const amounts: Record<string, Q> = {};
    for (const s of soluteNames) amounts[s] = mul(base, div(c.solutes[s] ?? ZERO, HUNDRED));
    return { id: c.id, label: c.label, baseQuantity: base, quantityShare: div(base, total), soluteAmounts: amounts };
  });
  const soluteTotals: Record<string, Q> = {};
  const concentrations: Record<string, Q> = {};
  for (const s of soluteNames) {
    soluteTotals[s] = sum(contributions.map((c) => c.soluteAmounts[s]));
    concentrations[s] = mul(div(soluteTotals[s], total), HUNDRED);
  }
  return {
    ok: true,
    basis,
    baseUnit: baseUnitOf(list[0].unit),
    totalQuantity: total,
    soluteTotals,
    concentrations,
    contributions,
    assumptions: [...MIXTURE_ASSUMPTIONS],
  };
}

/** Lines of text showing each step, for the calculation panel. */
export function describeMixture(r: MixtureResult, solute: string): string[] {
  const u = r.baseUnit;
  const f = (x: Q) => formatDecimal(x, 4);
  const lines = r.contributions.map((c) => `${c.label}: ${f(c.baseQuantity)} ${u} supplies ${f(c.soluteAmounts[solute] ?? ZERO)} ${u} of ${solute}`);
  lines.push(`Total ${solute} = ${f(r.soluteTotals[solute] ?? ZERO)} ${u}`);
  lines.push(`Total mixture = ${f(r.totalQuantity)} ${u}`);
  lines.push(`Final concentration = ${f(r.soluteTotals[solute] ?? ZERO)} ÷ ${f(r.totalQuantity)} × 100 = ${f(r.concentrations[solute] ?? ZERO)}%`);
  return lines;
}

/** The final concentration of any mixture lies between the lowest and highest ingredient percentages. */
export function reachableRange(list: readonly Constituent[], solute: string): { min: Q; max: Q } | null {
  const used = list.filter((c) => !isZero(c.quantity));
  if (used.length === 0) return null;
  const pcts = used.map((c) => c.solutes[solute] ?? ZERO);
  return { min: pcts.reduce((a, b) => (cmp(a, b) <= 0 ? a : b)), max: pcts.reduce((a, b) => (cmp(a, b) >= 0 ? a : b)) };
}

export type QuantitySolve =
  | { kind: 'quantity'; amount: Q }
  | { kind: 'any_quantity' }
  | { kind: 'impossible'; reason: string };

/**
 * How much of an extra constituent (concentration `pct` of `solute`) must be
 * added to `known` (all in the same unit family) to reach `target` percent?
 * Solves (A + y·p)/(T + y) = t  ⇒  y = (t·T − A)/(p − t), in the base unit.
 */
export function quantityToReachTarget(known: readonly Constituent[], solute: string, pct: Q, target: Q): QuantitySolve {
  const err = known.length === 0 ? null : validateConstituents(known);
  if (err && err.code !== 'zero_total') return { kind: 'impossible', reason: err.message };
  const T = sum(known.map((c) => toBaseQuantity(c.quantity, c.unit)));
  const A = sum(known.map((c) => mul(toBaseQuantity(c.quantity, c.unit), c.solutes[solute] ?? ZERO)));
  const tT = mul(target, T);
  if (isNeg(pct) || cmp(pct, HUNDRED) > 0 || isNeg(target) || cmp(target, HUNDRED) > 0) {
    return { kind: 'impossible', reason: 'Concentrations must be between 0% and 100%.' };
  }
  const denom = sub(pct, target);
  if (isZero(denom)) {
    return isZero(sub(tT, A))
      ? { kind: 'any_quantity' }
      : { kind: 'impossible', reason: 'The added liquid already has the target concentration, so adding it cannot move the mixture away from its current concentration.' };
  }
  const y = div(sub(tT, A), denom);
  if (isNeg(y)) {
    const current = isZero(T) ? null : div(A, T);
    return {
      kind: 'impossible',
      reason: `The target ${formatDecimal(target, 3)}% is not between the current concentration${current ? ` (${formatDecimal(current, 3)}%)` : ''} and the added ${formatDecimal(pct, 3)}%. A mixture’s concentration always lies between the concentrations of its ingredients.`,
    };
  }
  return { kind: 'quantity', amount: y };
}

export const sumQuantities = (list: readonly Constituent[]): Q => sum(list.map((c) => toBaseQuantity(c.quantity, c.unit)));