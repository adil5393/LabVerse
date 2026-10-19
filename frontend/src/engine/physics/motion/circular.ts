/**
 * Uniform circular motion (PHY-1D), Section 4.4.1. A model with a true two-dimensional geometry:
 * the object moves on a circle of radius r at constant speed, starting at angle 0 (the point (r, 0))
 * and turning counter-clockwise (+) or clockwise (−). Everything derives from (r, T, direction, t):
 *   angle  θ = ±2π t / T            position (r cos θ, r sin θ)        speed v = 2π r / T  (constant)
 *   velocity = v × (the unit vector tangent to the circle): its SIZE is constant but its DIRECTION changes.
 *   distance = arc length r|θ|      displacement = the straight chord from the start to now, a 2-D vector
 * Do not confuse the 1-D signed displacement of the straight-track model with this: here displacement is a
 * vector, and its size is 2 r |sin(θ/2)|, never more than the arc length. The acceleration is only described
 * conceptually (the changing direction of velocity implies an acceleration towards the centre).
 */

export type Spin = 'counterclockwise' | 'clockwise';

export interface CircleSetup { radiusM: number; periodS: number; spin: Spin }

export const CIRCLE_LIMITS = { minR: 0.5, maxR: 50, minT: 0.5, maxT: 60, maxTime: 120 } as const;

export interface CircleState {
  t: number;
  /** Signed angle from the start in radians (positive counter-clockwise). */
  theta: number;
  x: number; y: number;
  /** Constant size of the velocity, 2πr/T, in m/s. */
  speed: number;
  vx: number; vy: number;
  /** Direction of the velocity in degrees, measured counter-clockwise from the +x axis, in [0, 360). */
  velocityAngleDeg: number;
  /** Arc length travelled (distance), in metres. */
  distance: number;
  /** Chord from the start to the object, as a 2-D vector, in metres. */
  dx: number; dy: number;
  /** Size of that displacement. */
  displacement: number;
  revolutions: number;
  averageSpeed: number | null;
  /** Size of the average velocity = displacement ÷ time (its direction is that of the chord). */
  averageVelocity: number | null;
}

export function validateCircle(c: CircleSetup): string | null {
  if (!Number.isFinite(c.radiusM) || !Number.isFinite(c.periodS)) return 'Radius and period must be numbers.';
  if (c.radiusM < CIRCLE_LIMITS.minR || c.radiusM > CIRCLE_LIMITS.maxR) return `Radius must be between ${CIRCLE_LIMITS.minR} and ${CIRCLE_LIMITS.maxR} m.`;
  if (c.periodS < CIRCLE_LIMITS.minT || c.periodS > CIRCLE_LIMITS.maxT) return `Period must be between ${CIRCLE_LIMITS.minT} and ${CIRCLE_LIMITS.maxT} s.`;
  return null;
}

export const circleSpeed = (c: CircleSetup): number => (2 * Math.PI * c.radiusM) / c.periodS;

export function circleStateAt(c: CircleSetup, tIn: number): CircleState {
  const t = Math.max(0, tIn);
  const dir = c.spin === 'counterclockwise' ? 1 : -1;
  const speed = circleSpeed(c);
  const theta = dir * ((2 * Math.PI * t) / c.periodS);
  const x = c.radiusM * Math.cos(theta), y = c.radiusM * Math.sin(theta);
  // tangent for counter-clockwise motion is (−sin θ, cos θ); clockwise reverses it
  const vx = dir * speed * -Math.sin(theta), vy = dir * speed * Math.cos(theta);
  let ang = (Math.atan2(vy, vx) * 180) / Math.PI; if (ang < 0) ang += 360; if (Math.abs(ang - 360) < 1e-9) ang = 0;
  const distance = c.radiusM * Math.abs(theta);
  const dx = x - c.radiusM, dy = y;
  const displacement = Math.hypot(dx, dy);
  return {
    t, theta, x, y, speed, vx, vy, velocityAngleDeg: ang, distance, dx, dy, displacement,
    revolutions: Math.abs(theta) / (2 * Math.PI),
    averageSpeed: t > 0 ? distance / t : null,
    averageVelocity: t > 0 ? displacement / t : null,
  };
}

export const describeCircle = (c: CircleSetup, s: CircleState): string =>
  `Uniform circular motion, radius ${c.radiusM} m, period ${c.periodS} s, ${c.spin}. At ${Math.round(s.t * 100) / 100} s the object has turned ${Math.round(s.revolutions * 100) / 100} revolutions and is at (${Math.round(s.x * 100) / 100} m, ${Math.round(s.y * 100) / 100} m). Its speed is ${Math.round(s.speed * 100) / 100} m/s, always the same, but its velocity points ${Math.round(s.velocityAngleDeg)} degrees from the positive x axis and keeps turning. Distance travelled along the circle: ${Math.round(s.distance * 100) / 100} m. Straight-line displacement from the start: ${Math.round(s.displacement * 100) / 100} m.`;
