/**
 * Safety rules for synthesised sound (Web Audio foundation, SND-1). Pure functions and constants, no audio objects, so every
 * rule can be tested without a sound card. Nothing here knows any subject.
 *
 * Frequency classes (lower bound inclusive): below 20 Hz infrasonic, 20 to 100 very low, 100 to 8000 reliable, 8000 to 16 000
 * high, 16 000 to 20 000 very high (inclusive of 20 000), above 20 000 ultrasonic. Infrasonic and ultrasonic requests are
 * refused: they are never synthesised, so nobody is told they are hearing something they are not.
 */

export const AUDIO = {
  /** Linear gain ceiling at full volume and full amplitude (about -12 dBFS). */
  masterCeiling: 0.25,
  /** Volume setting a visitor starts with, as a fraction of the ceiling. */
  defaultVolume: 0.4,
  fadeInSeconds: 0.03,
  fadeOutSeconds: 0.06,
  /** A continuous audible tone stops by itself after this long. */
  maxToneSeconds: 20,
  minHz: 20,
  maxHz: 20000,
} as const;

export type FrequencyClass = 'infrasonic' | 'very-low' | 'reliable' | 'high' | 'very-high' | 'ultrasonic';

export function classifyFrequency(hz: number): FrequencyClass {
  if (!Number.isFinite(hz) || hz < AUDIO.minHz) return 'infrasonic';
  if (hz < 100) return 'very-low';
  if (hz < 8000) return 'reliable';
  if (hz < 16000) return 'high';
  if (hz <= AUDIO.maxHz) return 'very-high';
  return 'ultrasonic';
}

export const isPlayableFrequency = (hz: number): boolean => { const c = classifyFrequency(hz); return c !== 'infrasonic' && c !== 'ultrasonic'; };

/** Why a frequency is refused (or warned about), in words a student can read; null when there is nothing to say. */
export function frequencyNote(hz: number): string | null {
  switch (classifyFrequency(hz)) {
    case 'infrasonic': return 'This frequency is below the human hearing range (20 Hz). It is shown on the screen but never played.';
    case 'ultrasonic': return 'This frequency is above the human hearing range (20 000 Hz). It is shown on the screen but never played.';
    case 'very-low': return 'Very low pitch: many laptop and phone speakers cannot reproduce it, so you may hear nothing even though people can hear 20 Hz. That is the speaker, not your ears.';
    case 'high': return 'High pitch: hearing and speakers vary, so it may sound faint to you.';
    case 'very-high': return 'Very high pitch: many adults and most phone speakers cannot reproduce this. Silence does not mean the tone is not playing.';
    default: return null;
  }
}

export const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/** The gain actually sent to the speaker: perceptual (amplitude squared), scaled by the volume setting, never above the ceiling. */
export function toneGain(amplitude: number, volume: number): number {
  const a = clamp(Number.isFinite(amplitude) ? amplitude : 0, 0, 1);
  const v = clamp(Number.isFinite(volume) ? volume : AUDIO.defaultVolume, 0, 1);
  if (a === 0 || v === 0) return 0;
  return clamp(AUDIO.masterCeiling * v * Math.max(a * a, 0.02), 0, AUDIO.masterCeiling);
}
