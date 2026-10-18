/**
 * Exact rational arithmetic on BigInt for the Understanding Data laboratory (M6).
 *
 * Unlike a number-based rational, BigInt never overflows, so very large and
 * very small decimal inputs (1e15, 0.000000001) stay exact. Values are always
 * normalised: denominator > 0, lowest terms. This file is deliberately
 * independent of every other chapter's rational module.
 */

export interface Q {
  readonly n: bigint;
  readonly d: bigint;
}

const bgcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
};

export function q(n: bigint | number, d: bigint | number = 1n): Q {
  const nn = typeof n === 'number' ? BigInt(n) : n;
  const dd = typeof d === 'number' ? BigInt(d) : d;
  if (dd === 0n) throw new RangeError('Denominator cannot be zero');
  const g = bgcd(nn, dd);
  const s = dd < 0n ? -1n : 1n;
  return { n: (s * nn) / g, d: (s * dd) / g };
}

export const ZERO: Q = q(0);
export const ONE: Q = q(1);
export const HUNDRED: Q = q(100);

export const add = (x: Q, y: Q): Q => q(x.n * y.d + y.n * x.d, x.d * y.d);
export const sub = (x: Q, y: Q): Q => q(x.n * y.d - y.n * x.d, x.d * y.d);
export const mul = (x: Q, y: Q): Q => q(x.n * y.n, x.d * y.d);
export const div = (x: Q, y: Q): Q => {
  if (y.n === 0n) throw new RangeError('Division by zero');
  return q(x.n * y.d, x.d * y.n);
};
export const neg = (x: Q): Q => q(-x.n, x.d);
export const abs = (x: Q): Q => (x.n < 0n ? neg(x) : x);
export const isZero = (x: Q): boolean => x.n === 0n;
export const isNeg = (x: Q): boolean => x.n < 0n;
export const eq = (x: Q, y: Q): boolean => x.n === y.n && x.d === y.d;
export const cmp = (x: Q, y: Q): number => {
  const l = x.n * y.d;
  const r = y.n * x.d;
  return l < r ? -1 : l > r ? 1 : 0;
};
export const lt = (x: Q, y: Q): boolean => cmp(x, y) < 0;
export const gt = (x: Q, y: Q): boolean => cmp(x, y) > 0;
export const max = (x: Q, y: Q): Q => (gt(x, y) ? x : y);

export function sum(xs: readonly Q[]): Q {
  return xs.reduce((a, b) => add(a, b), ZERO);
}

/** Float for drawing only. Safe for huge/small values via scaled division. */
export function toNumber(x: Q): number {
  if (x.n === 0n) return 0;
  const neg = x.n < 0n;
  const n = neg ? -x.n : x.n;
  // Scale so that the quotient keeps ~17 significant digits even for extreme magnitudes.
  const nl = n.toString().length;
  const dl = x.d.toString().length;
  const shift = Math.max(0, 20 - (nl - dl));
  const scaled = (n * 10n ** BigInt(shift)) / x.d;
  const v = Number(scaled) / 10 ** shift;
  return neg ? -v : v;
}

const bigPow10 = (k: number): bigint => 10n ** BigInt(k);

/**
 * Parse "12", "-3.5", "1/3", "2.5e3", "0.000000001". Returns null for anything
 * that is not a finite exact number (NaN, Infinity, 1/0, empty, junk).
 */
export function parseQ(text: string): Q | null {
  const t = text.trim().replace(/,/g, '');
  if (t === '') return null;
  const frac = /^([+-]?[0-9.]+(?:e[+-]?\d+)?)\s*\/\s*([0-9.]+(?:e[+-]?\d+)?)$/i.exec(t);
  if (frac) {
    const a = parseQ(frac[1]);
    const b = parseQ(frac[2]);
    if (!a || !b || isZero(b)) return null;
    return div(a, b);
  }
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(t);
  if (!m) return null;
  const intPart = m[2] ?? '';
  const fracPart = m[3] ?? '';
  if (intPart === '' && fracPart === '') return null;
  if (fracPart.length > 40) return null;
  let exp = m[4] ? parseInt(m[4], 10) : 0;
  if (Math.abs(exp) > 60) return null;
  const digits = BigInt((intPart + fracPart) || '0');
  exp -= fracPart.length;
  const sign = m[1] === '-' ? -1n : 1n;
  return exp >= 0 ? q(sign * digits * bigPow10(exp)) : q(sign * digits, bigPow10(-exp));
}

/** "57.5", "161.0909…" rounded half-up to `places` decimals, trailing zeros trimmed. */
export function formatDecimal(x: Q, places = 2): string {
  const negative = x.n < 0n;
  const n = negative ? -x.n : x.n;
  const scale = bigPow10(places);
  const scaled = (n * scale * 2n + x.d) / (x.d * 2n); // half-up
  const whole = scaled / scale;
  const frac = (scaled % scale).toString().padStart(places, '0');
  let body = places > 0 ? `${whole}.${frac}` : `${whole}`;
  if (places > 0) body = body.replace(/\.?0+$/, '');
  if (body === '' || body === '-') body = '0';
  const isZeroOut = /^0(\.0*)?$/.test(body);
  return negative && !isZeroOut ? `-${body}` : body;
}

/** Exact text: "3", "-1/2". Large values print in full. */
export function formatExact(x: Q): string {
  return x.d === 1n ? x.n.toString() : `${x.n}/${x.d}`;
}

/** True when the decimal expansion terminates (denominator has only 2s and 5s). */
export function isTerminating(x: Q): boolean {
  let d = x.d;
  for (const p of [2n, 5n]) while (d % p === 0n) d /= p;
  return d === 1n;
}

/**
 * Display value: exact decimal when it terminates within `maxPlaces`, otherwise
 * a rounded decimal marked with "≈". Never presents a rounded value as exact.
 */
export function formatSmart(x: Q, maxPlaces = 3): string {
  if (isTerminating(x)) {
    const s = formatDecimal(x, 12);
    const dot = s.indexOf('.');
    if (dot < 0 || s.length - dot - 1 <= maxPlaces) return s;
  }
  return `≈ ${formatDecimal(x, maxPlaces)}`;
}

/** Floor of a rational as bigint. */
export const floorQ = (x: Q): bigint => {
  const r = x.n / x.d;
  return x.n < 0n && x.n % x.d !== 0n ? r - 1n : r;
};
