/**
 * Pure Mathematical Number Predicates
 * Class 9 NCERT Ganita Manjari: Propositions and Their Converses
 */

export function isInteger(val: number): boolean {
  return Number.isInteger(val);
}

export function isPositiveInteger(val: number): boolean {
  return Number.isInteger(val) && val > 0;
}

export function isNonNegativeInteger(val: number): boolean {
  return Number.isInteger(val) && val >= 0;
}

export function isDivisible(n: number, d: number): boolean {
  if (!Number.isInteger(n) || !Number.isInteger(d)) return false;
  if (d === 0) return false;
  return n % d === 0;
}

export function isEven(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  return n % 2 === 0;
}

export function isOdd(n: number): boolean {
  if (!Number.isInteger(n)) return false;
  return Math.abs(n % 2) === 1;
}

export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n === 2 || n === 3) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

export function isComposite(n: number): boolean {
  if (!Number.isInteger(n) || n <= 3) return false;
  return !isPrime(n);
}

export function isPerfectSquare(n: number): boolean {
  if (!Number.isInteger(n) || n < 0) return false;
  const root = Math.round(Math.sqrt(n));
  return root * root === n;
}

export function getFactors(n: number): number[] {
  if (!Number.isInteger(n) || n === 0) return [];
  const absN = Math.abs(n);
  const factors: number[] = [];
  for (let i = 1; i * i <= absN; i++) {
    if (absN % i === 0) {
      factors.push(i);
      if (i * i !== absN) {
        factors.push(absN / i);
      }
    }
  }
  return factors.sort((a, b) => a - b);
}

export function getUnitsDigit(n: number): number {
  return Math.abs(Math.trunc(n)) % 10;
}

export function getDigitSum(n: number): number {
  const digits = Math.abs(Math.trunc(n)).toString().split('');
  return digits.reduce((sum, d) => sum + parseInt(d, 10), 0);
}

/**
 * Euler's Polynomial: f(n) = n^2 + n + 41
 * Produces primes for n = 0, 1, 2, ..., 39.
 * At n = 40: f(40) = 40^2 + 40 + 41 = 40(41) + 41 = 41 * 41 = 1681 (Composite!)
 * At n = 41: f(41) = 41^2 + 41 + 41 = 41 * 43 = 1763 (Composite!)
 * Demonstrates why testing 40 consecutive numbers is NOT a proof.
 */
export function evaluateEulerPolynomial(n: number): {
  n: number;
  value: number;
  isPrime: boolean;
  factorization?: string;
} {
  const value = n * n + n + 41;
  const prime = isPrime(value);
  let factorization: string | undefined;

  if (!prime && value > 1) {
    const factors = getFactors(value);
    const nonTrivial = factors.filter((f) => f > 1 && f < value);
    if (nonTrivial.length > 0) {
      const f1 = nonTrivial[0];
      const f2 = value / f1;
      factorization = `${f1} × ${f2}`;
    }
  }

  return {
    n,
    value,
    isPrime: prime,
    factorization,
  };
}
