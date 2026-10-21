/**
 * Vibration model for NCERT Class 9 Chapter 10, Sections 10.1 and 10.1.1 (Activities 10.1 and 10.2): a plucked string (the rubber
 * band on a box) and a struck tuning fork. Pure functions of physical time; nothing here draws or plays anything.
 *
 * What is modelled (and what is not):
 *  - A vibrating object moves to and fro about its rest position, x(t) = A(t) cos(2 pi nu t). Frequency nu is cycles per second.
 *  - The amplitude A(t) dies away exponentially, A(t) = A0 exp(-t / tau), so a struck object vibrates for a while and then rests.
 *  - SOUND IS PRODUCED EXACTLY WHILE THE OBJECT VIBRATES. There is one threshold for both ("at rest" below REST_AMPLITUDE), so the
 *    model can never say "silent but moving" or "sound but still".
 *  - String frequency uses the direction the book teaches (more tension raises the pitch; a longer or thicker string lowers it) in
 *    the ideal-string form nu = nu_ref sqrt(tension) / (length x thickness). That exact rule is beyond Class 9; the lab says so.
 *  - Decay times are illustrative (a real fork rings for longer; a real rubber band for less).
 */

export const REST_AMPLITUDE = 0.02;

export interface StringSetup {
  /** Tension relative to the starting tension (1 = the starting tension). */
  tension: number;
  /** Length of the vibrating part in centimetres. */
  lengthCm: number;
  /** Thickness relative to the starting band (1 = the starting band). */
  thickness: number;
  /** How hard it is plucked, 0 (not at all) to 1 (hardest). */
  strike: number;
}

export interface ForkSetup { hz: number }

export const STRING_LIMITS = { tension: [0.6, 1.8], lengthCm: [30, 60], thickness: [0.7, 1.4], strike: [0, 1] } as const;
export const STRING_REFERENCE = { hz: 220, tension: 1, lengthCm: 40, thickness: 1 } as const;
export const DEFAULT_STRING: StringSetup = { tension: 1, lengthCm: 40, thickness: 1, strike: 0.8 };

export const FORK_PRESETS = [256, 320, 512] as const;
export const FORK_DECAY_SECONDS = 4;
export const STRING_DECAY_SECONDS = 1.5;

export type VibratorKind = 'string' | 'fork';

export interface Vibration {
  valid: boolean;
  reason?: string;
  kind: VibratorKind;
  /** Frequency in hertz and period in seconds (T = 1 / nu). */
  hz: number;
  periodS: number;
  /** Decay time constant in seconds. */
  tau: number;
  /** Starting amplitude (0 to 1, relative; a drawing scale, not a length). */
  strike: number;
  /** Seconds from the strike until the amplitude falls to the rest level (0 when nothing was struck). */
  restAfterS: number;
}

const within = (v: number, [lo, hi]: readonly [number, number]) => Number.isFinite(v) && v >= lo && v <= hi;

export function stringFrequency(s: Pick<StringSetup, 'tension' | 'lengthCm' | 'thickness'>): number {
  const r = STRING_REFERENCE;
  return r.hz * Math.sqrt(s.tension / r.tension) * (r.lengthCm / s.lengthCm) * (r.thickness / s.thickness);
}

export function timeToRest(strike: number, tau: number): number {
  return strike > REST_AMPLITUDE ? tau * Math.log(strike / REST_AMPLITUDE) : 0;
}

export function computeString(s: StringSetup): Vibration {
  const base: Vibration = { valid: false, kind: 'string', hz: 0, periodS: 0, tau: STRING_DECAY_SECONDS, strike: 0, restAfterS: 0 };
  if (!within(s.tension, STRING_LIMITS.tension)) return { ...base, reason: `Tension must be between ${STRING_LIMITS.tension[0]} and ${STRING_LIMITS.tension[1]} times the starting tension.` };
  if (!within(s.lengthCm, STRING_LIMITS.lengthCm)) return { ...base, reason: `Length must be between ${STRING_LIMITS.lengthCm[0]} and ${STRING_LIMITS.lengthCm[1]} cm.` };
  if (!within(s.thickness, STRING_LIMITS.thickness)) return { ...base, reason: `Thickness must be between ${STRING_LIMITS.thickness[0]} and ${STRING_LIMITS.thickness[1]} times the starting band.` };
  if (!within(s.strike, STRING_LIMITS.strike)) return { ...base, reason: 'The pluck strength must be between 0 and 1.' };
  const hz = stringFrequency(s);
  return { valid: true, kind: 'string', hz, periodS: 1 / hz, tau: STRING_DECAY_SECONDS, strike: s.strike, restAfterS: timeToRest(s.strike, STRING_DECAY_SECONDS) };
}

export function computeFork(f: ForkSetup & { strike: number }): Vibration {
  const base: Vibration = { valid: false, kind: 'fork', hz: 0, periodS: 0, tau: FORK_DECAY_SECONDS, strike: 0, restAfterS: 0 };
  if (!(FORK_PRESETS as readonly number[]).includes(f.hz)) return { ...base, reason: 'Choose one of the tuning forks: 256, 320 or 512 Hz.' };
  if (!within(f.strike, [0, 1])) return { ...base, reason: 'The strike strength must be between 0 and 1.' };
  return { valid: true, kind: 'fork', hz: f.hz, periodS: 1 / f.hz, tau: FORK_DECAY_SECONDS, strike: f.strike, restAfterS: timeToRest(f.strike, FORK_DECAY_SECONDS) };
}

/** Amplitude envelope at `tS` seconds after the strike (0 before it). */
export const amplitudeAt = (v: Vibration, tS: number): number => (tS < 0 || !v.valid ? 0 : v.strike * Math.exp(-tS / v.tau));

/** True while the object is vibrating. The ONE predicate behind both "moving" and "making sound". */
export const isVibrating = (v: Vibration, tS: number): boolean => amplitudeAt(v, tS) > REST_AMPLITUDE;
export const isSounding = isVibrating;

/** Whole cycles completed t seconds after the strike. */
export const cyclesAt = (v: Vibration, tS: number): number => (v.valid && tS > 0 ? Math.floor(v.hz * tS + 1e-9) : 0);

/** Displacement from the rest position at time t, in units of the starting amplitude scale (0 at rest). */
export const displacementAt = (v: Vibration, tS: number): number => (isVibrating(v, tS) ? amplitudeAt(v, tS) * Math.cos(2 * Math.PI * v.hz * tS) : 0);

export const describeVibration = (v: Vibration, tS = 0): string => {
  if (!v.valid) return v.reason ?? 'The setup is not valid.';
  const what = v.kind === 'string' ? 'The plucked rubber band' : 'The struck tuning fork';
  const f = Math.round(v.hz * 10) / 10;
  if (v.strike <= REST_AMPLITUDE) return `${what} is not struck, so it is at rest and there is no sound.`;
  return `${what} vibrates ${f} times every second (frequency ${f} hertz, period ${Math.round(v.periodS * 10000) / 10} milliseconds). ${isVibrating(v, tS) ? 'It is vibrating, so it makes sound.' : 'It has come to rest, so the sound has stopped.'} The vibration fades after about ${Math.round(v.restAfterS * 10) / 10} seconds.`;
};
