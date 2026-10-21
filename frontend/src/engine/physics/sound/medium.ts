/**
 * The bell-in-a-jar demonstration (NCERT Fig. 10.7, Section 10.2.1) as a small model. The air in the jar is a fraction of normal
 * (1 = the jar full of air, 0 = pumped out). The loudness heard outside falls as the air is removed and is zero in a near vacuum,
 * and returns as air is let back in. The bell itself keeps ringing throughout: the clapper moves whatever the air does.
 *
 * Idealised: the real loudness falls smoothly and a very faint sound can remain until a good vacuum is reached; here the heard
 * loudness is proportional to the air fraction above a small cut-off, which keeps the two facts the book states (fainter as air
 * is removed; almost nothing in a near vacuum) and no more.
 */

/** Below this fraction of normal air the sound can no longer be heard outside the jar. */
export const NEAR_VACUUM = 0.03;

export const clampPressure = (p: number): number => (Number.isFinite(p) ? Math.min(1, Math.max(0, p)) : 1);

/** The bell is switched on; the clapper strikes whatever the air is doing. */
export const bellRinging = (_pressure: number): boolean => true;

/** Loudness heard outside the jar, 0 to 1. Non-decreasing in the air fraction; exactly 0 in a near vacuum. */
export function heardLoudness(pressure: number): number {
  const p = clampPressure(pressure);
  if (p <= NEAR_VACUUM) return 0;
  return (p - NEAR_VACUUM) / (1 - NEAR_VACUUM);
}

export const describeBellJar = (pressure: number): string => {
  const p = clampPressure(pressure);
  const pct = Math.round(p * 100);
  if (p <= NEAR_VACUUM) return `The jar is almost empty (${pct} percent of the normal air). The bell is still ringing: you can see the clapper moving. No sound can be heard outside the jar, because there is almost nothing to carry the vibration to the glass.`;
  const l = Math.round(heardLoudness(p) * 100);
  return `The jar holds ${pct} percent of the normal air. The bell is ringing and the sound heard outside has ${l} percent of its full loudness: ${l >= 80 ? 'loud' : l >= 40 ? 'fainter' : 'faint'}.`;
};
