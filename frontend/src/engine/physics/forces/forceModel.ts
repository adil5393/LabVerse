/**
 * The Force Laboratory model (PHY-2A): ONE cart on a horizontal straight track, SI units.
 *
 * Assumptions (stated on screen): the cart is a point mass moving along a line; right is positive;
 * two horizontal pushes or pulls A and B act on it, each with a size and a direction; the surface is
 * horizontal, so the normal force equals the weight, N = m g with g = 10 m/s² (a round value, a stated idealisation);
 * air resistance is ignored. Friction is the simple dry-friction model:
 *   - while the cart slides, kinetic friction of size μk N acts opposite to its velocity;
 *   - while it is at rest, static friction matches the horizontal push exactly (so the net force is zero)
 *     up to its largest value μs N; a bigger push starts the cart sliding;
 *   - friction alone can never start the cart moving, and it can only bring it to rest, never reverse it.
 * Net force = A + B + friction (horizontal); acceleration a = net force ÷ mass (Newton's second law, previewed here
 * without its formal treatment). The motion is computed with a FIXED time step: inside a step all forces are
 * constant, so the update is exact, and the instant a sliding cart reaches zero velocity is found exactly and
 * handled, so friction can never push a stopped cart backwards. Rendering frame rate is never used as time.
 */

export const G = 10; // m/s²
export const DT = 0.01; // s, fixed simulation step
export const MAX_TIME = 30; // s

export type Dir = 'right' | 'left';

export interface Surface { id: string; label: string; muS: number; muK: number; note: string }

export const SURFACES: Surface[] = [
  { id: 'frictionless', label: 'Frictionless (idealised)', muS: 0, muK: 0, note: 'An idealised surface with no friction. No real surface is like this.' },
  { id: 'ice', label: 'Ice', muS: 0.05, muK: 0.03, note: 'Very slippery.' },
  { id: 'polished', label: 'Polished floor', muS: 0.2, muK: 0.15, note: 'Smooth tile or marble.' },
  { id: 'wood', label: 'Wooden table', muS: 0.4, muK: 0.3, note: 'A typical wooden surface.' },
  { id: 'rough', label: 'Rough ground', muS: 0.7, muK: 0.6, note: 'Rough cement or gravel.' },
];
export const surfaceById = (id: string): Surface => SURFACES.find((s) => s.id === id) ?? SURFACES[0];

export interface Setup {
  massKg: number;
  /** Push A: size in newtons (≥ 0) and direction. */
  forceA: number; dirA: Dir;
  /** Push B: size in newtons (≥ 0) and direction (by default the opposing one). */
  forceB: number; dirB: Dir;
  surfaceId: string;
  /** Starting velocity in m/s (right positive). */
  startVelocity: number;
  /** Starting position in metres. */
  startPosition: number;
  /** Optional: the pushes A and B act only for this long (a force pulse, in seconds, a multiple of the step); absent = always. */
  pulseS?: number;
}

export const LIMITS = { minMass: 0.5, maxMass: 50, maxForce: 100, maxVelocity: 20 } as const;

export function validateSetup(s: Setup): string | null {
  const nums = [s.massKg, s.forceA, s.forceB, s.startVelocity, s.startPosition];
  if (nums.some((n) => !Number.isFinite(n))) return 'Every value must be a number.';
  if (s.massKg < LIMITS.minMass || s.massKg > LIMITS.maxMass) return `Mass must be between ${LIMITS.minMass} and ${LIMITS.maxMass} kg (a cart cannot have zero or negative mass).`;
  if (s.forceA < 0 || s.forceB < 0) return 'A force size cannot be negative: choose the direction with the Left / Right buttons.';
  if (s.forceA > LIMITS.maxForce || s.forceB > LIMITS.maxForce) return `A force can be at most ${LIMITS.maxForce} N in this laboratory.`;
  if (Math.abs(s.startVelocity) > LIMITS.maxVelocity) return `Starting velocity must be between −${LIMITS.maxVelocity} and ${LIMITS.maxVelocity} m/s.`;
  if (!SURFACES.some((x) => x.id === s.surfaceId)) return 'Unknown surface.';
  if (s.pulseS !== undefined && (!Number.isFinite(s.pulseS) || s.pulseS < 0 || s.pulseS > MAX_TIME)) return `The force pulse must last between 0 and ${MAX_TIME} s.`;
  return null;
}

export const signed = (magnitude: number, dir: Dir): number => (dir === 'right' ? magnitude : -magnitude);
/** The sum of the two pushes (signed, right positive): the driving force before friction. */
/** The setup as it acts at simulated time t: after a force pulse ends the pushes are zero (friction and mass are unchanged). */
export const effectiveAt = (s: Setup, t: number): Setup => (s.pulseS !== undefined && t >= s.pulseS - 1e-9 ? { ...s, forceA: 0, forceB: 0 } : s);

export const driveForce = (s: Setup): number => signed(s.forceA, s.dirA) + signed(s.forceB, s.dirB);

export type FrictionKind = 'none' | 'static' | 'kinetic';

export interface Sample {
  t: number;
  x: number;
  v: number;
  /** Acceleration during the step that starts at t (0 once the cart is at rest and balanced). */
  a: number;
  forceA: number; forceB: number;
  /** Signed horizontal friction force on the cart. */
  friction: number;
  frictionKind: FrictionKind;
  /** Signed net horizontal force: A + B + friction. */
  net: number;
  weight: number; normal: number;
}

const EPS = 1e-12;

interface Forces { friction: number; kind: FrictionKind; net: number; a: number }

/** The horizontal forces on a cart with velocity v (in the state "sliding" if |v| > 0). */
function forcesAt(s: Setup, v: number): Forces {
  const sf = surfaceById(s.surfaceId);
  const n = s.massKg * G;
  const drive = driveForce(s);
  if (Math.abs(v) > EPS) {
    const f = -Math.sign(v) * sf.muK * n;
    return { friction: f, kind: sf.muK > 0 ? 'kinetic' : 'none', net: drive + f, a: (drive + f) / s.massKg };
  }
  // at rest: static friction balances the push up to its maximum, otherwise the cart starts sliding the way it is pushed
  const maxStatic = sf.muS * n;
  if (Math.abs(drive) <= maxStatic + EPS) {
    return { friction: drive === 0 ? 0 : -drive, kind: drive === 0 ? 'none' : 'static', net: 0, a: 0 };
  }
  const f = -Math.sign(drive) * sf.muK * n;
  return { friction: f, kind: 'kinetic', net: drive + f, a: (drive + f) / s.massKg };
}

/** Advance one fixed step exactly (forces are constant inside it), stopping exactly at a zero-velocity instant. */
function advance(s: Setup, x: number, v: number, dt: number): { x: number; v: number } {
  let t = 0;
  let px = x, pv = v;
  for (let guard = 0; guard < 4 && t < dt - EPS; guard++) {
    const f = forcesAt(s, pv);
    const rem = dt - t;
    if (f.a === 0) { px += pv * rem; t = dt; break; }
    // sliding: does the velocity reach zero inside this slice?
    const tStop = Math.abs(pv) > EPS ? -pv / f.a : Infinity;
    if (tStop > 0 && tStop < rem) {
      px += pv * tStop + 0.5 * f.a * tStop * tStop; pv = 0; t += tStop; // then re-decide static/kinetic from rest
    } else {
      px += pv * rem + 0.5 * f.a * rem * rem; pv += f.a * rem; t = dt;
    }
  }
  return { x: px, v: Math.abs(pv) < EPS ? 0 : pv };
}

export function sampleOf(s0: Setup, t: number, x: number, v: number): Sample {
  const s = effectiveAt(s0, t);
  const f = forcesAt(s, v);
  return {
    t, x, v, a: f.a, forceA: signed(s.forceA, s.dirA), forceB: signed(s.forceB, s.dirB),
    friction: f.friction, frictionKind: f.kind, net: f.net, weight: s.massKg * G, normal: s.massKg * G,
  };
}

const cache = new Map<string, Sample[]>();
const key = (s: Setup, tMax: number) => JSON.stringify([s, tMax]);

/** All samples from t = 0 to tMax, one per fixed step. Deterministic: the same setup always gives the same history. */
export function simulate(s: Setup, tMax = 20): Sample[] {
  const k = key(s, tMax);
  const hit = cache.get(k);
  if (hit) return hit;
  const n = Math.round(Math.min(tMax, MAX_TIME) / DT);
  const out: Sample[] = [];
  let x = s.startPosition, v = s.startVelocity;
  for (let i = 0; i <= n; i++) {
    out.push(sampleOf(s, Math.round(i * DT * 1000) / 1000, x, v));
    const nx = advance(effectiveAt(s, Math.round(i * DT * 1000) / 1000), x, v, DT); x = nx.x; v = nx.v;
  }
  if (cache.size > 200) cache.clear();
  cache.set(k, out);
  return out;
}

export const sampleAtTime = (s: Setup, t: number, tMax = 20): Sample => {
  const all = simulate(s, tMax);
  const i = Math.min(all.length - 1, Math.max(0, Math.round(t / DT)));
  return all[i];
};

/** The time the cart first comes to rest after sliding, or null if it never does within tMax. */
export function stopTime(s: Setup, tMax = 20): number | null {
  const all = simulate(s, tMax);
  if (Math.abs(all[0].v) < EPS) return null;
  for (const p of all) if (p.t > 0 && Math.abs(p.v) < EPS) return p.t;
  return null;
}

export const DEFAULT_SETUP: Setup = { massKg: 2, forceA: 10, dirA: 'right', forceB: 0, dirB: 'left', surfaceId: 'frictionless', startVelocity: 0, startPosition: 0 };

export const fmtN = (n: number): string => `${n < 0 ? '−' : ''}${Math.round(Math.abs(n) * 100) / 100} N`;
const r2 = (n: number): string => `${n < 0 ? '−' : n > 0 ? '+' : ''}${Math.round(Math.abs(n) * 100) / 100}`;
export const dirWord = (n: number): string => (n > 0 ? 'to the right' : n < 0 ? 'to the left' : 'none');

/** One plain-language sentence about what is happening at this moment (for the live region and screen readers). */
export function explain(s: Setup, p: Sample): string {
  const drive = p.forceA + p.forceB;
  const parts: string[] = [];
  if (p.forceA !== 0 || p.forceB !== 0) parts.push(`The pushes are ${r2(p.forceA)} N and ${r2(p.forceB)} N, together ${r2(drive)} N.`);
  if (p.frictionKind === 'static') parts.push(`The cart is at rest and static friction (${r2(p.friction)} N) exactly balances the push, so the net force is zero.`);
  else if (p.frictionKind === 'kinetic') parts.push(`The cart slides, so kinetic friction of ${r2(p.friction)} N acts against its motion.`);
  else if (surfaceById(s.surfaceId).muK === 0) parts.push('There is no friction on this idealised surface.');
  if (Math.abs(p.net) < 1e-9) parts.push(p.v === 0 ? 'The net force is zero and the cart is at rest, so its velocity does not change.' : `The net force is zero, so the velocity stays constant at ${r2(p.v)} m/s even though the cart is moving.`);
  else parts.push(`The net force is ${r2(p.net)} N (${dirWord(p.net)}), so the acceleration is ${r2(p.net)} ÷ ${s.massKg} = ${r2(p.a)} m/s² (${dirWord(p.a)}).`);
  return parts.join(' ');
}
