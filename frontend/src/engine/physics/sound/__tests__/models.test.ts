import { describe, it, expect } from 'vitest';
import {
  amplitudeAt, computeFork, computeString, cyclesAt, DEFAULT_STRING, displacementAt, FORK_PRESETS, isSounding, isVibrating, REST_AMPLITUDE,
  STRING_LIMITS, stringFrequency, timeToRest, describeVibration,
} from '../vibration';
import {
  compressionCentres, computeWave, DEFAULT_WAVE, density, densityAtPlace, describeWave, displacement, particlePosition, PARTICLE_SPACING_M,
  physicalTime, rarefactionCentres, restPositions, TUBE_LENGTH_M, WAVE_LIMITS, type WaveSetup,
} from '../wave';

const near = (a: number, b: number, tol = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe('vibration model (Sections 10.1, 10.1.1)', () => {
  it('sound exists exactly while the object vibrates: one predicate, checked over time for strings and forks', () => {
    const things = [computeString(DEFAULT_STRING), computeString({ ...DEFAULT_STRING, strike: 0.3 }), computeFork({ hz: 256, strike: 1 }), computeFork({ hz: 512, strike: 0.5 })];
    for (const v of things) for (let t = 0; t < 25; t += 0.05) {
      expect(isSounding(v, t)).toBe(isVibrating(v, t));
      if (!isVibrating(v, t)) expect(displacementAt(v, t)).toBe(0);
    }
  });

  it('a struck object that is not struck does not vibrate and makes no sound', () => {
    const v = computeString({ ...DEFAULT_STRING, strike: 0 });
    expect(v.valid).toBe(true);
    for (const t of [0, 0.1, 1]) { expect(isVibrating(v, t)).toBe(false); expect(isSounding(v, t)).toBe(false); }
    expect(describeVibration(v)).toMatch(/not struck/);
  });

  it('the amplitude only ever decreases after the strike (monotonic decay) and reaches rest at the stated time', () => {
    for (const v of [computeFork({ hz: 256, strike: 1 }), computeString(DEFAULT_STRING)]) {
      let prev = Infinity;
      for (let t = 0; t <= 30; t += 0.1) { const a = amplitudeAt(v, t); expect(a).toBeLessThanOrEqual(prev + 1e-15); prev = a; }
      near(amplitudeAt(v, v.restAfterS), REST_AMPLITUDE, 1e-9);
      expect(isVibrating(v, v.restAfterS - 0.01)).toBe(true);
      expect(isVibrating(v, v.restAfterS + 0.01)).toBe(false);
    }
    near(timeToRest(1, 4), 4 * Math.log(50), 1e-12);
  });

  it('every fork rings for less than the 20 second tone limit, so a played fork ends by itself first', () => {
    for (const hz of FORK_PRESETS) expect(computeFork({ hz, strike: 1 }).restAfterS).toBeLessThan(20);
  });

  it('frequency and period are exact inverses; cycles counted are floor(nu t)', () => {
    for (const hz of FORK_PRESETS) { const v = computeFork({ hz, strike: 1 }); near(v.hz * v.periodS, 1, 1e-12); }
    const v = computeFork({ hz: 256, strike: 1 });
    expect(cyclesAt(v, 0)).toBe(0); expect(cyclesAt(v, 1)).toBe(256); expect(cyclesAt(v, 0.5)).toBe(128); expect(cyclesAt(v, 0.0039)).toBe(0); expect(cyclesAt(v, 0.0040)).toBe(1);
  });

  it('the displacement swings between plus and minus the envelope and returns every period', () => {
    const v = computeFork({ hz: 256, strike: 1 });
    const T = v.periodS;
    near(displacementAt(v, 0), 1); near(displacementAt(v, T / 2), -amplitudeAt(v, T / 2));
    for (const t of [0.01, 0.37, 2.2]) near(displacementAt(v, t + T) / amplitudeAt(v, t + T), displacementAt(v, t) / amplitudeAt(v, t), 1e-6);
  });

  it('string pitch moves the way the book teaches: more tension up, longer down, thicker down', () => {
    const f = (o: Partial<typeof DEFAULT_STRING>) => stringFrequency({ ...DEFAULT_STRING, ...o });
    expect(f({ tension: 1.5 })).toBeGreaterThan(f({ tension: 1 }));
    expect(f({ lengthCm: 55 })).toBeLessThan(f({ lengthCm: 40 }));
    expect(f({ thickness: 1.3 })).toBeLessThan(f({ thickness: 1 }));
    near(f({}), 220, 1e-9);
    near(f({ tension: 4 * 1 }) / f({ tension: 1 }), 2, 1e-12);   // sqrt law (only the ratio is a claim; the range is capped below)
    near(f({ lengthCm: 20 }) / f({ lengthCm: 40 }), 2, 1e-12);
  });

  it('the whole string range is a pitch a speaker can usually play and is inside the hearing range', () => {
    const lo = stringFrequency({ tension: STRING_LIMITS.tension[0], lengthCm: STRING_LIMITS.lengthCm[1], thickness: STRING_LIMITS.thickness[1] });
    const hi = stringFrequency({ tension: STRING_LIMITS.tension[1], lengthCm: STRING_LIMITS.lengthCm[0], thickness: STRING_LIMITS.thickness[0] });
    expect(lo).toBeGreaterThan(20); expect(hi).toBeLessThan(20000);
  });

  it('refuses out-of-range setups with a reason instead of inventing numbers', () => {
    expect(computeString({ ...DEFAULT_STRING, tension: 9 })).toMatchObject({ valid: false });
    expect(computeString({ ...DEFAULT_STRING, lengthCm: 5 }).reason).toMatch(/Length/);
    expect(computeFork({ hz: 300, strike: 1 })).toMatchObject({ valid: false });
    expect(computeFork({ hz: 256, strike: 2 })).toMatchObject({ valid: false });
  });
});

const setup = (o: Partial<WaveSetup> = {}): WaveSetup => ({ ...DEFAULT_WAVE, ...o });

describe('longitudinal wave model (Sections 10.3 to 10.5)', () => {
  it('frequency, period, wavelength and speed obey nu T = 1 and v = nu lambda for the whole range', () => {
    for (const f of [50, 75, 100, 133, 256, 400]) for (const v of [331, 340, 344, 345]) {
      const w = computeWave(setup({ frequencyHz: f, speed: v }));
      expect(w.valid).toBe(true);
      near(w.frequencyHz * w.period, 1, 1e-12);
      near(w.frequencyHz * w.lambda, v, 1e-9);
      near(w.lambda / w.period, v, 1e-9);
      near(w.omega / w.k, v, 1e-9);
    }
  });

  it('the book values: 100 Hz in air at 340 m/s has wavelength 3.4 m and period 10 ms', () => {
    const w = computeWave(setup());
    near(w.lambda, 3.4); near(w.period, 0.01);
  });

  it('is periodic in space (lambda) and in time (T), for density and for displacement', () => {
    const w = computeWave(setup({ frequencyHz: 160 }));
    for (const x of [0, 0.3, 1.234, 3.9]) for (const t of [0, 0.0021, 0.0133]) {
      near(density(w, x + w.lambda, t), density(w, x, t), 1e-9);
      near(density(w, x, t + w.period), density(w, x, t), 1e-9);
      near(displacement(w, x + w.lambda, t), displacement(w, x, t), 1e-12);
      near(displacement(w, x, t + w.period), displacement(w, x, t), 1e-12);
    }
  });

  it('NO PARTICLE DRIFT: over 1000 time steps every particle stays within A of its own rest position and its mean position is its rest position', () => {
    const w = computeWave(setup({ frequencyHz: 200, densityAmp: 0.5 }));
    const rest = restPositions(0, TUBE_LENGTH_M);
    const N = 1000, per = 40;                               // 40 steps per period, 25 whole periods
    for (const x0 of rest) {
      let sum = 0, maxDev = 0;
      for (let i = 0; i < N; i++) { const t = (i * w.period) / per; const p = particlePosition(w, x0, t); sum += p - x0; maxDev = Math.max(maxDev, Math.abs(p - x0)); }
      expect(maxDev).toBeLessThanOrEqual(w.dispAmp * (1 + 1e-12));
      near(sum / N, 0, w.dispAmp * 1e-9);                    // no net movement: the particle does not travel with the wave
    }
  });

  it('the largest displacement is exactly A = a / k and the wave moves along the tube at v while particles do not', () => {
    const w = computeWave(setup());
    let max = 0; for (let i = 0; i < 4000; i++) max = Math.max(max, Math.abs(displacement(w, 1.0, (i * w.period) / 400)));
    near(max, w.dispAmp, w.dispAmp * 1e-4);   // sampled, so the peak is hit to within the sampling step
    const c0 = compressionCentres(w, 0, 0, TUBE_LENGTH_M)[0];
    const t = 0.004;                                         // 4 ms of physical time
    const c1 = compressionCentres(w, t, 0, TUBE_LENGTH_M).find((x) => Math.abs(x - c0 - w.speed * t) < 1e-9);
    expect(c1).toBeDefined();                                // the very same compression, v t further on
  });

  it('compressions are density maxima, rarefactions density minima, spaced lambda apart and lambda / 2 from each other', () => {
    const w = computeWave(setup({ frequencyHz: 120 }));
    for (const t of [0, 0.003, 0.0071]) {
      const C = compressionCentres(w, t, 0, TUBE_LENGTH_M), R = rarefactionCentres(w, t, 0, TUBE_LENGTH_M);
      expect(C.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < C.length; i++) near(C[i] - C[i - 1], w.lambda, 1e-9);
      for (let i = 1; i < R.length; i++) near(R[i] - R[i - 1], w.lambda, 1e-9);
      for (const c of C) near(density(w, c, t), 1 + w.densityAmp, 1e-9);
      for (const r of R) near(density(w, r, t), 1 - w.densityAmp, 1e-9);
      const all = [...C.map((x) => ({ x, c: true })), ...R.map((x) => ({ x, c: false }))].sort((a, b) => a.x - b.x);
      for (let i = 1; i < all.length; i++) { expect(all[i].c).not.toBe(all[i - 1].c); near(all[i].x - all[i - 1].x, w.lambda / 2, 1e-9); }
    }
  });

  it('displacement is a quarter of a cycle out of step with density: a particle in the middle of a compression is at its rest position', () => {
    const w = computeWave(setup());
    for (const c of compressionCentres(w, 0.0017, 0, TUBE_LENGTH_M)) near(displacement(w, c, 0.0017), 0, 1e-12);
    for (const r of rarefactionCentres(w, 0.0017, 0, TUBE_LENGTH_M)) near(displacement(w, r, 0.0017), 0, 1e-12);
  });

  it('what is drawn agrees with what is graphed: the crowding of the actual particle positions matches the density graph', () => {
    const w = computeWave(setup({ densityAmp: 0.1 }));
    const t = 0.0023, d = PARTICLE_SPACING_M, rest = restPositions(0, TUBE_LENGTH_M);
    for (let i = 0; i < rest.length - 1; i++) {
      const xa = particlePosition(w, rest[i], t), xb = particlePosition(w, rest[i + 1], t);
      const local = d / (xb - xa), mid = (xa + xb) / 2;                   // particles per length relative to the average
      expect(Math.abs(local - density(w, mid, t))).toBeLessThan(0.03);   // agreement to first order in the exaggeration
    }
  });

  it('the closest-packed pair of particles sits at a compression and the most spread pair at a rarefaction', () => {
    const w = computeWave(setup({ densityAmp: 0.5 }));
    const t = 0.0042, rest = restPositions(0, TUBE_LENGTH_M);
    const gaps = rest.slice(0, -1).map((x0, i) => ({ mid: (particlePosition(w, x0, t) + particlePosition(w, rest[i + 1], t)) / 2, gap: particlePosition(w, rest[i + 1], t) - particlePosition(w, x0, t) }));
    const tight = gaps.reduce((a, b) => (b.gap < a.gap ? b : a)), loose = gaps.reduce((a, b) => (b.gap > a.gap ? b : a));
    const C = compressionCentres(w, t, -w.lambda, TUBE_LENGTH_M + w.lambda), R = rarefactionCentres(w, t, -w.lambda, TUBE_LENGTH_M + w.lambda);
    expect(Math.min(...C.map((c) => Math.abs(c - tight.mid)))).toBeLessThan(PARTICLE_SPACING_M);
    expect(Math.min(...R.map((r) => Math.abs(r - loose.mid)))).toBeLessThan(PARTICLE_SPACING_M);
  });

  it('mass is conserved over whole wavelengths: the average of the density over a wavelength is 1', () => {
    const w = computeWave(setup({ frequencyHz: 100, densityAmp: 0.6 }));
    let s = 0; const n = 3400; for (let i = 0; i < n; i++) s += density(w, (i + 0.5) * (w.lambda / n), 0.0031);
    near(s / n, 1, 1e-9);
  });

  it('the density at a fixed place rises and falls with period T (the density-against-time graph)', () => {
    const w = computeWave(setup({ frequencyHz: 100 }));
    const s = densityAtPlace(w, 1.7, 0, 2 * w.period, 401);
    near(s[0].rho, s[200].rho, 1e-9); near(s[0].rho, s[400].rho, 1e-9);
    expect(Math.max(...s.map((p) => p.rho))).toBeCloseTo(1 + w.densityAmp, 3);
    expect(Math.min(...s.map((p) => p.rho))).toBeCloseTo(1 - w.densityAmp, 3);
  });

  it('changing the frequency changes the wavelength at constant speed and never the speed; changing the amplitude changes neither', () => {
    const a = computeWave(setup({ frequencyHz: 100 })), b = computeWave(setup({ frequencyHz: 200 })), c = computeWave(setup({ densityAmp: 0.1 }));
    near(b.lambda, a.lambda / 2); near(a.omega / a.k, b.omega / b.k, 1e-9);
    near(c.lambda, a.lambda); near(c.period, a.period); expect(c.dispAmp).toBeLessThan(a.dispAmp);
  });

  it('zero amplitude is a flat density and motionless particles', () => {
    const w = computeWave(setup({ densityAmp: 0 }));
    for (const x of [0, 1, 2.2]) { near(density(w, x, 0.003), 1); near(displacement(w, x, 0.003), 0); }
  });

  it('the slow-motion factor only converts playback time to physical time and never changes the physics', () => {
    const a = computeWave(setup({ slow: 500 })), b = computeWave(setup({ slow: 1000 }));
    near(physicalTime(a, 5), 0.01); near(physicalTime(b, 10), 0.01);
    near(a.lambda, b.lambda); near(a.period, b.period);
    near(a.visualHz, a.frequencyHz / 500); expect(b.visualHz).toBeLessThan(a.visualHz);
    // the slowest picture still repeats less often than a flash threshold (well under 3 per second)
    expect(computeWave(setup({ frequencyHz: 400, slow: 200 })).visualHz).toBeLessThanOrEqual(2 + 1e-9);
  });

  it('refuses unsupported setups with a reason (infrasonic frequency, runaway exaggeration)', () => {
    expect(computeWave(setup({ frequencyHz: 10 }))).toMatchObject({ valid: false });
    expect(computeWave(setup({ densityAmp: 0.9 })).reason).toMatch(/below 1/);
    expect(computeWave(setup({ slow: 1 })).valid).toBe(false);
    expect(WAVE_LIMITS.densityAmp[1]).toBeLessThan(1);
  });

  it('the text description carries the numbers, the idealisation and the slow-motion factor', () => {
    const t = describeWave(computeWave(setup()));
    expect(t).toMatch(/wavelength is 3\.4 metres/); expect(t).toMatch(/10 milliseconds|10\.0 milliseconds/); expect(t).toMatch(/exaggerated/); expect(t).toMatch(/500 times slower/);
  });
});
