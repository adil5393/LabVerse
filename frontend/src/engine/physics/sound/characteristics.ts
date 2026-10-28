/**
 * Characteristics of a sound wave, echoes and SONAR (NCERT Exploration Chapter 10, Sections 10.6 to 10.8). Pure functions in SI
 * units. The speed of sound is ALWAYS a parameter: the chapter itself uses 331, 340, 343, 344, 345 and 346 m/s for air and 1500,
 * 1525 and 1530 m/s for water in different places, so every result uses the value its own problem gives.
 *
 * Equations from the chapter: T ν = 1 (Eq. 10.1) and v = ν λ (Eq. 10.2); echo and sonar distance d = v t ÷ 2 (the sound goes
 * there and back). Thresholds for hearing a separate echo (about 0.1 s) and the reverberation figure (less than 0.05 s) are the
 * book's approximate perceptual rules, not laws of nature.
 */

export interface MediumPreset { id: string; label: string; speed: number; note: string }

/** Speeds as the chapter states them (approximate; Table 10.1 and the text of 10.6.3). */
export const MEDIA: MediumPreset[] = [
  { id: 'air-0', label: 'Dry air at 0 °C', speed: 331, note: 'about 331 m/s (Section 10.6.3)' },
  { id: 'air-15', label: 'Air at 15 °C', speed: 340, note: 'about 340 m/s (Table 10.1)' },
  { id: 'air-22', label: 'Air at 22 °C', speed: 344, note: 'nearly 344 m/s (Section 10.6.3)' },
  { id: 'water', label: 'Water', speed: 1500, note: 'about 1500 m/s (Table 10.1)' },
  { id: 'seawater', label: 'Sea water', speed: 1530, note: '1530 m/s (Example 10.6)' },
  { id: 'steel', label: 'Steel', speed: 5000, note: 'about 5000 m/s (Table 10.1)' },
];

export const AUDIBLE_MIN_HZ = 20;
export const AUDIBLE_MAX_HZ = 20000;
export const ECHO_GAP_S = 0.1;
export const REVERBERATION_GAP_S = 0.05;

const pos = (x: number, name: string) => { if (!(x > 0) || !Number.isFinite(x)) throw new RangeError(`${name} must be a positive number`); return x; };

/** T = 1 ÷ ν (Eq. 10.1). */
export const periodFromFrequency = (nuHz: number): number => 1 / pos(nuHz, 'frequency');
export const frequencyFromPeriod = (tS: number): number => 1 / pos(tS, 'time period');
/** Frequency from a count of oscillations (or compressions passing a point) in a time. */
export const frequencyFromCount = (count: number, seconds: number): number => pos(count, 'count') / pos(seconds, 'time');
/** v = ν λ (Eq. 10.2). */
export const speedOf = (nuHz: number, lambdaM: number): number => pos(nuHz, 'frequency') * pos(lambdaM, 'wavelength');
export const wavelengthOf = (speed: number, nuHz: number): number => pos(speed, 'speed') / pos(nuHz, 'frequency');
export const frequencyOf = (speed: number, lambdaM: number): number => pos(speed, 'speed') / pos(lambdaM, 'wavelength');
/** One-way travel time over a distance. */
export const travelTime = (distanceM: number, speed: number): number => pos(distanceM, 'distance') / pos(speed, 'speed');
/** Distance to a reflector from the time between sending and hearing the reflection: d = v t ÷ 2. */
export const reflectorDistance = (speed: number, roundTripS: number): number => (pos(speed, 'speed') * pos(roundTripS, 'time')) / 2;
/** Round-trip time to a reflector at a distance: t = 2 d ÷ v. */
export const roundTripTime = (distanceM: number, speed: number): number => (2 * pos(distanceM, 'distance')) / pos(speed, 'speed');
/** The least distance of a reflector for a separate echo (17 m at 340 m/s with the 0.1 s rule). */
export const minimumEchoDistance = (speed: number, gapS: number = ECHO_GAP_S): number => reflectorDistance(speed, gapS);

export type FrequencyBand = 'infrasonic' | 'audible' | 'ultrasonic';
/** The chapter's ranges: below 20 Hz infrasonic, 20 Hz to 20 kHz audible (for a typical young person), above 20 kHz ultrasonic. */
export function classifyFrequency(nuHz: number): FrequencyBand {
  pos(nuHz, 'frequency');
  if (nuHz < AUDIBLE_MIN_HZ) return 'infrasonic';
  if (nuHz > AUDIBLE_MAX_HZ) return 'ultrasonic';
  return 'audible';
}

export type EchoVerdict = 'reverberation' | 'not-separate' | 'echo';
/**
 * What a listener hears for a reflection arriving `gapS` seconds after the original sound. The book gives two rules: a separate
 * echo needs at least about 0.1 s; reflections less than 0.05 s apart merge (reverberation). Between 0.05 s and 0.1 s the book
 * gives no name: the reflection is still not heard separately. At exactly 0.05 s (Exercise 4) the answer is "not an echo,
 * reverberation range"; no sharp boundary is claimed.
 */
export function echoVerdict(gapS: number): EchoVerdict {
  if (gapS < 0) throw new RangeError('time gap cannot be negative');
  if (gapS >= ECHO_GAP_S) return 'echo';
  if (gapS <= REVERBERATION_GAP_S) return 'reverberation';
  return 'not-separate';
}

/**
 * Intensity for a source of fixed power spreading over a sphere: I = P ÷ (4 π r²). The chapter says intensity falls with
 * distance; the inverse-square form is shown only as an idealised model (open space, no reflections).
 */
export const intensityAt = (powerW: number, distanceM: number): number => pos(powerW, 'power') / (4 * Math.PI * pos(distanceM, 'distance') ** 2);

/** Notes of an octave on a just-intonation ladder (Activity 10.7 compares note frequencies as ratios of the first Sa). */
export const NOTE_RATIOS: { note: string; ratio: number; text: string }[] = [
  { note: 'Sa', ratio: 1, text: '1' }, { note: 'Re', ratio: 9 / 8, text: '9/8' }, { note: 'Ga', ratio: 5 / 4, text: '5/4' }, { note: 'Ma', ratio: 4 / 3, text: '4/3' },
  { note: 'Pa', ratio: 3 / 2, text: '3/2' }, { note: 'Dha', ratio: 5 / 3, text: '5/3' }, { note: 'Ni', ratio: 15 / 8, text: '15/8' }, { note: "Sa'", ratio: 2, text: '2' },
];
export const noteFrequencies = (saHz: number) => NOTE_RATIOS.map((n) => ({ ...n, hz: pos(saHz, 'Sa frequency') * n.ratio }));
