/**
 * The sudden-braking demonstration (PHY-2B): a vehicle and one passenger on a straight road, SI units, right positive,
 * deterministic fixed steps. It is a deliberately SIMPLE teaching model of inertia, not crash physics:
 *   - the vehicle brakes with a constant deceleration until it stops;
 *   - an UNRESTRAINED passenger sits on a slippery seat: no horizontal force acts on them, so by the first law their
 *     velocity relative to the road does not change while the vehicle slows under them (no new forward force appears);
 *   - a RESTRAINED passenger has a belt that exerts a backward force of exactly the size that gives the passenger the
 *     vehicle's deceleration (passenger mass × deceleration), so the passenger slows with the vehicle;
 *   - the demonstration ends when an unrestrained passenger has moved forward a small stated gap relative to the vehicle
 *     (the model stops there: it does not simulate contact, collision or injury). A real seat has friction, real belts
 *     stretch and real crashes involve far larger, varying forces.
 */

export const GAP_M = 0.5;
export const VDT = 0.01;

export interface BrakingSetup {
  /** Speed of vehicle and passenger before braking (m/s). */
  speed: number;
  /** Constant deceleration of the vehicle (m/s²), > 0. */
  decel: number;
  passengerMassKg: number;
  restrained: boolean;
}

export const BRAKING_LIMITS = { maxSpeed: 30, minDecel: 1, maxDecel: 10, minMass: 20, maxMass: 120 } as const;

export function validateBraking(s: BrakingSetup): string | null {
  if (![s.speed, s.decel, s.passengerMassKg].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.speed <= 0 || s.speed > BRAKING_LIMITS.maxSpeed) return `Speed must be between 0 and ${BRAKING_LIMITS.maxSpeed} m/s.`;
  if (s.decel < BRAKING_LIMITS.minDecel || s.decel > BRAKING_LIMITS.maxDecel) return `Braking deceleration must be between ${BRAKING_LIMITS.minDecel} and ${BRAKING_LIMITS.maxDecel} m/s².`;
  if (s.passengerMassKg < BRAKING_LIMITS.minMass || s.passengerMassKg > BRAKING_LIMITS.maxMass) return `Passenger mass must be between ${BRAKING_LIMITS.minMass} and ${BRAKING_LIMITS.maxMass} kg.`;
  return null;
}

export type BrakingState = 'cruising' | 'braking' | 'vehicle stopped' | 'gap used up';

export interface BrakingSample {
  t: number;
  vehicleX: number; vehicleV: number;
  passengerX: number; passengerV: number;
  /** Passenger position minus vehicle position: how far forward of their original seat position (m). */
  relative: number;
  /** Horizontal force on the passenger (belt), signed, right positive. */
  passengerForce: number;
  state: BrakingState;
}

const stopT = (s: BrakingSetup) => s.speed / s.decel;

/** Braking starts at t = BRAKE_AT so the student can see steady cruising first. */
export const BRAKE_AT = 1;

/** The time at which an unrestrained passenger has used up the gap (the demonstration ends); Infinity if restrained. */
export function endTime(s: BrakingSetup): number {
  if (s.restrained) return Infinity;
  const ts = stopT(s);
  const tGap = Math.sqrt((2 * GAP_M) / s.decel);
  return tGap <= ts ? BRAKE_AT + tGap : BRAKE_AT + ts + (GAP_M - 0.5 * s.decel * ts * ts) / s.speed;
}

/** Closed-form state at time t (exact); the model freezes at the end time. Fixed-step histories sample this function. */
export function brakingAt(s: BrakingSetup, tIn: number): BrakingSample {
  const tEnd = endTime(s);
  const t = Math.min(Math.max(0, tIn), tEnd);
  const tb = Math.max(0, t - BRAKE_AT);
  const ts = stopT(s);
  const tbc = Math.min(tb, ts);
  const vv = Math.max(0, s.speed - s.decel * tbc);
  const vx = s.speed * Math.min(t, BRAKE_AT) + s.speed * tbc - 0.5 * s.decel * tbc * tbc;
  const braking = t >= BRAKE_AT && tb < ts;
  // after the vehicle has stopped it stays where it stopped, so only the braking time up to ts adds distance
  const px = s.restrained ? vx : s.speed * t;
  const pv = s.restrained ? vv : s.speed;
  const state: BrakingState = t >= tEnd ? 'gap used up' : t < BRAKE_AT ? 'cruising' : braking ? 'braking' : 'vehicle stopped';
  return {
    t: tIn < 0 ? 0 : Math.min(tIn, tEnd), vehicleX: vx, vehicleV: vv, passengerX: px, passengerV: pv, relative: px - vx,
    passengerForce: s.restrained && braking ? -s.passengerMassKg * s.decel : 0, state,
  };
}

/** Fixed-step history from 0 to tMax (ends early when the demonstration ends). */
export function brakingHistory(s: BrakingSetup, tMax = 10): BrakingSample[] {
  const out: BrakingSample[] = [];
  const end = Math.min(tMax, endTime(s));
  for (let i = 0; i * VDT <= end + 1e-9; i++) out.push(brakingAt(s, Math.round(i * VDT * 1000) / 1000));
  return out;
}

export const DEFAULT_BRAKING: BrakingSetup = { speed: 15, decel: 5, passengerMassKg: 60, restrained: false };
