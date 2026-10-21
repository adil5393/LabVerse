/**
 * Longitudinal sound wave in a tube, for NCERT Class 9 Chapter 10, Sections 10.3 to 10.5 (Activity 10.5, Figs. 10.9, 10.12, 10.16).
 * A sinusoidal wave travelling in the +x direction. Pure functions of position and PHYSICAL time; the slow-motion factor only
 * converts the visitor's playback time into physical time.
 *
 *   displacement of the particle whose rest position is x0:   xi(x0, t) = A cos(k x0 - w t)
 *   its position:                                              x(x0, t)  = x0 + xi
 *   density relative to the average:                           rho(x, t) = 1 + a sin(k x - w t)
 *   with k = 2 pi / lambda, w = 2 pi nu, v = nu lambda, T = 1 / nu, and A k = a  (so the density change is the compression of
 *   the particles themselves: rho = 1 - d xi / d x to first order).
 *
 * Consequences the tests check: each particle only oscillates about its own rest position (no drift); the pattern moves at v;
 * compressions are where sin = +1 and rarefactions where sin = -1, spaced lambda apart, compression to rarefaction lambda / 2;
 * the displacement is 90 degrees out of step with the density (a particle in the middle of a compression is momentarily at its
 * rest position).
 *
 * Idealised and exaggerated, and the lab says so: real sound in air changes the density by about one part in a billion, so `a` is
 * enlarged until it can be seen; the sine shape is the simplest wave; there is no damping and no reflection.
 */

export interface WaveSetup {
  /** Frequency nu in hertz. */
  frequencyHz: number;
  /** Speed of sound v in metres per second (the book's value for the medium). */
  speed: number;
  /** Relative density change a (0 to 0.6): the exaggeration of the picture. */
  densityAmp: number;
  /** The picture is shown this many times slower than real time. */
  slow: number;
}

export const WAVE_LIMITS = { frequencyHz: [50, 400], densityAmp: [0, 0.6], slow: [200, 2000], speed: [300, 400] } as const;
export const DEFAULT_WAVE: WaveSetup = { frequencyHz: 100, speed: 340, densityAmp: 0.35, slow: 500 };

/** Length of the tube the model is drawn over, in metres (one wavelength at 50 Hz in air at 340 m/s). */
export const TUBE_LENGTH_M = 6.8;
/** Spacing of the particles at rest, in metres. */
export const PARTICLE_SPACING_M = 0.1;

export interface Wave {
  valid: boolean;
  reason?: string;
  frequencyHz: number;
  speed: number;
  densityAmp: number;
  slow: number;
  /** Wavelength lambda = v / nu, in metres. */
  lambda: number;
  /** Time period T = 1 / nu, in seconds. */
  period: number;
  k: number;
  omega: number;
  /** Largest particle displacement A = a / k, in metres. */
  dispAmp: number;
  /** How many times per second of the SLOWED picture one cycle repeats (nu / slow). */
  visualHz: number;
}

const inRange = (v: number, [lo, hi]: readonly [number, number]) => Number.isFinite(v) && v >= lo && v <= hi;

export function computeWave(s: WaveSetup): Wave {
  const empty: Wave = { valid: false, frequencyHz: s.frequencyHz, speed: s.speed, densityAmp: s.densityAmp, slow: s.slow, lambda: 0, period: 0, k: 0, omega: 0, dispAmp: 0, visualHz: 0 };
  if (!inRange(s.frequencyHz, WAVE_LIMITS.frequencyHz)) return { ...empty, reason: `Frequency must be between ${WAVE_LIMITS.frequencyHz[0]} and ${WAVE_LIMITS.frequencyHz[1]} Hz in this laboratory.` };
  if (!inRange(s.speed, WAVE_LIMITS.speed)) return { ...empty, reason: `The speed of sound must be between ${WAVE_LIMITS.speed[0]} and ${WAVE_LIMITS.speed[1]} m/s for air.` };
  if (!inRange(s.densityAmp, WAVE_LIMITS.densityAmp)) return { ...empty, reason: `The density change must be between 0 and ${WAVE_LIMITS.densityAmp[1]} (kept below 1 so no particle passes another).` };
  if (!inRange(s.slow, WAVE_LIMITS.slow)) return { ...empty, reason: `The slow-motion factor must be between ${WAVE_LIMITS.slow[0]} and ${WAVE_LIMITS.slow[1]}.` };
  const lambda = s.speed / s.frequencyHz;
  const k = (2 * Math.PI) / lambda;
  return { valid: true, frequencyHz: s.frequencyHz, speed: s.speed, densityAmp: s.densityAmp, slow: s.slow, lambda, period: 1 / s.frequencyHz, k, omega: 2 * Math.PI * s.frequencyHz, dispAmp: s.densityAmp / k, visualHz: s.frequencyHz / s.slow };
}

/** Physical seconds that have passed after `visualS` seconds of the slowed picture. */
export const physicalTime = (w: Wave, visualS: number): number => visualS / w.slow;

export const phase = (w: Wave, x: number, tPhys: number): number => w.k * x - w.omega * tPhys;
export const displacement = (w: Wave, x0: number, tPhys: number): number => w.dispAmp * Math.cos(phase(w, x0, tPhys));
export const particlePosition = (w: Wave, x0: number, tPhys: number): number => x0 + displacement(w, x0, tPhys);
/** Density divided by the average density at position x (the graph's y value). */
export const density = (w: Wave, x: number, tPhys: number): number => 1 + w.densityAmp * Math.sin(phase(w, x, tPhys));

/** Rest positions of the particles over a stretch of the tube. */
export function restPositions(from: number, to: number, spacing = PARTICLE_SPACING_M): number[] {
  const out: number[] = [];
  for (let i = Math.ceil(from / spacing - 1e-9); i * spacing <= to + 1e-9; i++) out.push(Math.round(i * spacing * 1e9) / 1e9);
  return out;
}

const centres = (w: Wave, tPhys: number, from: number, to: number, base: number): number[] => {
  const out: number[] = [];
  const start = w.omega * tPhys + base;
  const n0 = Math.ceil((from * w.k - start) / (2 * Math.PI));
  for (let n = n0; ; n++) {
    const x = (start + 2 * Math.PI * n) / w.k;
    if (x > to + 1e-12) break;
    if (x >= from - 1e-12) out.push(x);
  }
  return out;
};

/** Positions (m) of the middles of the compressions (density maximum) between `from` and `to`. */
export const compressionCentres = (w: Wave, tPhys: number, from: number, to: number): number[] => centres(w, tPhys, from, to, Math.PI / 2);
/** Positions (m) of the middles of the rarefactions (density minimum). */
export const rarefactionCentres = (w: Wave, tPhys: number, from: number, to: number): number[] => centres(w, tPhys, from, to, (3 * Math.PI) / 2);

/** Time series of the density at a fixed place (the "density against time" graph). */
export function densityAtPlace(w: Wave, x: number, t0: number, t1: number, n: number): { t: number; rho: number }[] {
  return Array.from({ length: n }, (_, i) => { const t = t0 + ((t1 - t0) * i) / (n - 1); return { t, rho: density(w, x, t) }; });
}

export const describeWave = (w: Wave): string => {
  if (!w.valid) return w.reason ?? 'The setup is not valid.';
  const r = (n: number, d = 2) => String(Math.round(n * 10 ** d) / 10 ** d);
  return `A sound wave of frequency ${r(w.frequencyHz, 0)} hertz travels at ${r(w.speed, 0)} metres per second, so its wavelength is ${r(w.lambda)} metres and its time period is ${r(w.period * 1000, 1)} milliseconds. Compressions (higher density) and rarefactions (lower density) alternate every ${r(w.lambda / 2)} metres and move along the tube. Each particle only moves to and fro about its own rest position, by at most ${r(w.dispAmp * 100, 1)} centimetres in this exaggerated picture. The picture is shown ${r(w.slow, 0)} times slower than real time.`;
};
