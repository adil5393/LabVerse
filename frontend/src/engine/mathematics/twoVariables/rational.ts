/**
 * Exact rational arithmetic for the Two Variables, One Line laboratory (M5).
 * Values are always normalised: denominator > 0, lowest terms.
 * Operations throw RangeError instead of silently losing exactness.
 */

export interface Rational {
  readonly n: number;
  readonly d: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function checkSafe(v: number): number {
  if (!Number.isSafeInteger(v)) {
    throw new RangeError('Rational overflow: value too large for exact arithmetic');
  }
  return v;
}

export function rat(n: number, d = 1): Rational {
  if (!Number.isInteger(n) || !Number.isInteger(d)) {
    throw new RangeError('Rational requires integer numerator and denominator');
  }
  if (d === 0) throw new RangeError('Rational denominator cannot be zero');
  const g = gcd(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: checkSafe((s * n) / g) + 0, d: checkSafe(Math.abs(d) / g) };
}

export const ZERO: Rational = rat(0);
export const ONE: Rational = rat(1);

export const add = (x: Rational, y: Rational): Rational =>
  rat(checkSafe(x.n * y.d + y.n * x.d), checkSafe(x.d * y.d));
export const sub = (x: Rational, y: Rational): Rational =>
  rat(checkSafe(x.n * y.d - y.n * x.d), checkSafe(x.d * y.d));
export const mul = (x: Rational, y: Rational): Rational =>
  rat(checkSafe(x.n * y.n), checkSafe(x.d * y.d));
export const div = (x: Rational, y: Rational): Rational => {
  if (y.n === 0) throw new RangeError('Division by zero');
  return rat(checkSafe(x.n * y.d), checkSafe(x.d * y.n));
};
export const neg = (x: Rational): Rational => rat(-x.n, x.d);
export const abs = (x: Rational): Rational => rat(Math.abs(x.n), x.d);
export const isZero = (x: Rational): boolean => x.n === 0;
export const isInteger = (x: Rational): boolean => x.d === 1;
export const eq = (x: Rational, y: Rational): boolean => x.n === y.n && x.d === y.d;
export const cmp = (x: Rational, y: Rational): number => Math.sign(x.n * y.d - y.n * x.d);
export const toNumber = (x: Rational): number => x.n / x.d;

/** Exact text: "3", "-1/2". */
export function formatRational(x: Rational): string {
  return x.d === 1 ? String(x.n) : `${x.n}/${x.d}`;
}

/** Student-friendly decimal (rounded) for approximate display only. */
export function formatDecimal(x: Rational, places = 3): string {
  return String(Number(toNumber(x).toFixed(places)));
}

/**
 * Parse "3", "-2.5", "1/2", "-3/4". Returns null when the text is not a
 * finite exact number. Decimals are converted exactly (2.5 -> 5/2).
 */
export function parseRational(text: string): Rational | null {
  const t = text.trim();
  if (t === '') return null;
  const frac = /^([+-]?\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/.exec(t);
  try {
    if (frac) {
      const num = parseRational(frac[1]);
      const den = parseRational(frac[2]);
      if (!num || !den || den.n === 0) return null;
      return div(num, den);
    }
    const dec = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(t);
    if (!dec) return null;
    const places = (dec[3] ?? '').length;
    if (places > 6) return null;
    const scale = 10 ** places;
    const digits = Number(dec[2] + (dec[3] ?? ''));
    return rat((dec[1] === '-' ? -1 : 1) * digits, scale);
  } catch {
    return null;
  }
}

/** Snap a float to an exact rational with the given decimal places. */
export function fromNumberFixed(v: number, places = 2): Rational {
  const scale = 10 ** places;
  return rat(Math.round(v * scale), scale);
}
