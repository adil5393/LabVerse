/**
 * Weighted mean and group combination (M6).
 *
 *   weighted mean = Σ(wᵢ·xᵢ) / Σwᵢ      (all arithmetic exact)
 *
 * Nothing is rounded until display. Invalid input is reported as structured
 * errors, never as NaN or Infinity.
 */

import { type Q, ZERO, add, sub, mul, div, isZero, isNeg, eq, sum, cmp, toNumber } from './rational';

export interface WeightedItem {
  id: string;
  label: string;
  value: Q;
  weight: Q;
  /**
   * True when `value` is itself a rounded figure (e.g. a mean quoted as 149.33).
   * The combined result is then an estimate and is labelled so.
   */
  valueIsRounded?: boolean;
}

export type WeightedErrorCode = 'empty' | 'negative_weight' | 'zero_total_weight' | 'no_items';

export interface WeightedError {
  code: WeightedErrorCode;
  message: string;
  itemId?: string;
}

export interface Contribution {
  id: string;
  label: string;
  value: Q;
  weight: Q;
  /** weight × value */
  product: Q;
  /** weight ÷ total weight (fraction of the overall pull). */
  weightShare: Q;
  /** share × (value − mean): how far this item pulls the mean away from the others. */
  pullOnMean: Q;
}

export interface WeightedResult {
  ok: true;
  mean: Q;
  totalWeight: Q;
  sumProducts: Q;
  contributions: Contribution[];
  /** Items whose weight is zero and therefore have no effect. */
  ignored: string[];
  /** True when any input value was a rounded estimate. */
  isEstimate: boolean;
}

export type WeightedOutcome = WeightedResult | { ok: false; error: WeightedError };

export function validateWeights(items: readonly WeightedItem[]): WeightedError | null {
  if (items.length === 0) return { code: 'empty', message: 'Add at least one value to average.' };
  for (const it of items) {
    if (isNeg(it.weight)) {
      return { code: 'negative_weight', itemId: it.id, message: `“${it.label}” has a negative weight. Weights (sizes, importance) cannot be negative.` };
    }
  }
  if (isZero(sum(items.map((i) => i.weight)))) {
    return { code: 'zero_total_weight', message: 'All weights are 0, so there is nothing to average. At least one weight must be positive.' };
  }
  return null;
}

export function weightedMean(items: readonly WeightedItem[]): WeightedOutcome {
  const err = validateWeights(items);
  if (err) return { ok: false, error: err };
  const totalWeight = sum(items.map((i) => i.weight));
  const sumProducts = sum(items.map((i) => mul(i.weight, i.value)));
  const mean = div(sumProducts, totalWeight);
  const contributions: Contribution[] = items.map((i) => {
    const share = div(i.weight, totalWeight);
    return {
      id: i.id,
      label: i.label,
      value: i.value,
      weight: i.weight,
      product: mul(i.weight, i.value),
      weightShare: share,
      pullOnMean: mul(share, sub(i.value, mean)),
    };
  });
  return {
    ok: true,
    mean,
    totalWeight,
    sumProducts,
    contributions,
    ignored: items.filter((i) => isZero(i.weight)).map((i) => i.id),
    isEstimate: items.some((i) => i.valueIsRounded && !isZero(i.weight)),
  };
}

/** Plain average of the values, ignoring weights. Used to show why that is wrong for unequal groups. */
export function naiveMean(items: readonly WeightedItem[]): Q | null {
  if (items.length === 0) return null;
  return div(sum(items.map((i) => i.value)), { n: BigInt(items.length), d: 1n });
}

export interface NaiveComparison {
  weighted: Q;
  naive: Q;
  /** weighted − naive */
  difference: Q;
  /** Naive and weighted agree exactly (equal weights, or all values equal). */
  agree: boolean;
  /** Which way the weighted mean moves relative to the naive one. */
  direction: 'toward_larger_group' | 'none';
  heaviestId: string | null;
  /** True when every positive weight is the same. */
  equalWeights: boolean;
}

export function compareNaiveWeighted(items: readonly WeightedItem[]): NaiveComparison | null {
  const w = weightedMean(items);
  if (!w.ok) return null;
  const active = items.filter((i) => !isZero(i.weight));
  const naive = naiveMean(active);
  if (!naive) return null;
  const diff = sub(w.mean, naive);
  const equalWeights = active.every((i) => eq(i.weight, active[0].weight));
  const heaviest = active.reduce<WeightedItem | null>((best, i) => (best === null || cmp(i.weight, best.weight) > 0 ? i : best), null);
  const unique = heaviest !== null && active.filter((i) => eq(i.weight, heaviest.weight)).length === 1;
  return {
    weighted: w.mean,
    naive,
    difference: diff,
    agree: isZero(diff),
    direction: isZero(diff) ? 'none' : 'toward_larger_group',
    heaviestId: unique ? heaviest!.id : null,
    equalWeights,
  };
}

/**
 * Combine group means. `means` are the groups' averages and `sizes` the number
 * of values each average came from. If any mean is a rounded figure the combined
 * mean is flagged as an estimate instead of being presented as exact.
 */
export function combineGroups(
  groups: readonly { id: string; label: string; mean: Q; size: Q; meanIsRounded?: boolean }[]
): WeightedOutcome {
  return weightedMean(groups.map((g) => ({ id: g.id, label: g.label, value: g.mean, weight: g.size, valueIsRounded: g.meanIsRounded })));
}

/** Weighted mean after multiplying every weight by k > 0 (the mean must not change). */
export function scaleWeights(items: readonly WeightedItem[], k: Q): WeightedItem[] {
  if (!(cmp(k, ZERO) > 0)) throw new RangeError('The scale factor must be positive.');
  return items.map((i) => ({ ...i, weight: mul(i.weight, k) }));
}

/** Weighted mean after adding a constant c to every weight (the mean generally DOES change). */
export function shiftWeights(items: readonly WeightedItem[], c: Q): WeightedItem[] {
  return items.map((i) => ({ ...i, weight: add(i.weight, c) }));
}

/**
 * New mean after adding `count` copies of `value` to data whose mean is `mean`
 * over `n` values. (Exercise-style "21st day" situation.)
 */
export function meanAfterAdding(mean: Q, n: Q, value: Q, count: Q): Q | null {
  const total = add(n, count);
  if (isZero(total) || isNeg(total)) return null;
  return div(add(mul(mean, n), mul(value, count)), total);
}

/** New mean after removing `count` copies of `value`. Null when that is impossible. */
export function meanAfterRemoving(mean: Q, n: Q, value: Q, count: Q): Q | null {
  const rest = sub(n, count);
  if (isNeg(rest) || isZero(rest)) return null;
  return div(sub(mul(mean, n), mul(value, count)), rest);
}

/**
 * Given the combined mean of two groups, one group's size and mean, and the
 * second group's size, find the second group's mean. (Reverse problem.)
 */
export function missingGroupMean(combined: Q, totalSize: Q, knownSize: Q, knownMean: Q): Q | null {
  const other = sub(totalSize, knownSize);
  if (isZero(other) || isNeg(other)) return null;
  return div(sub(mul(combined, totalSize), mul(knownMean, knownSize)), other);
}

export type UnknownWeight =
  | { kind: 'weight'; value: Q }
  | { kind: 'any_weight' }
  | { kind: 'impossible'; reason: string };

/**
 * Weight w that an extra value x needs so the weighted mean of everything
 * equals `target`:  (Σp + w·x)/(T + w) = t  ⇒  w = (t·T − Σp)/(x − t).
 */
export function solveUnknownWeight(known: readonly WeightedItem[], x: Q, target: Q): UnknownWeight {
  const err = known.length === 0 ? null : validateWeights(known);
  if (err) return { kind: 'impossible', reason: err.message };
  const T = sum(known.map((i) => i.weight));
  const P = sum(known.map((i) => mul(i.weight, i.value)));
  const tT = mul(target, T);
  const denom = sub(x, target);
  if (isZero(denom)) {
    return isZero(sub(tT, P)) ? { kind: 'any_weight' } : { kind: 'impossible', reason: 'The extra value already equals the target, so it cannot move the mean towards it.' };
  }
  const w = div(sub(tT, P), denom);
  if (isNeg(w)) {
    return { kind: 'impossible', reason: 'The target is not between the current mean and the extra value. A weighted mean always lies between the smallest and largest values it combines.' };
  }
  return { kind: 'weight', value: w };
}

/** Show the calculation as lines of text for the "Show calculation" panel. */
export function describeCalculation(items: readonly WeightedItem[], fmt: (x: Q) => string): string[] {
  const r = weightedMean(items);
  if (!r.ok) return [r.error.message];
  const active = items.filter((i) => !isZero(i.weight));
  const lines: string[] = [];
  lines.push(`Sum of (weight × value): ${active.map((i) => `${fmt(i.weight)}×${fmt(i.value)}`).join(' + ')} = ${fmt(r.sumProducts)}`);
  lines.push(`Total weight: ${active.map((i) => fmt(i.weight)).join(' + ')} = ${fmt(r.totalWeight)}`);
  lines.push(`Weighted mean = ${fmt(r.sumProducts)} ÷ ${fmt(r.totalWeight)} = ${fmt(r.mean)}`);
  if (r.ignored.length > 0) lines.push(`${r.ignored.length} item(s) with weight 0 do not affect the result.`);
  if (r.isEstimate) lines.push('Some inputs are rounded figures, so this result is an estimate.');
  return lines;
}

export const approxEqual = (a: Q, b: Q, tol: number): boolean => Math.abs(toNumber(a) - toNumber(b)) <= tol;
