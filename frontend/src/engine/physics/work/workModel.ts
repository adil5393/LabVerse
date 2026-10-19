/**
 * Work Laboratory model (PHY-3A): the work done by CONSTANT forces on one object that is displaced along a straight line.
 *
 * This is a KINEMATIC WORK MODEL: the displacement is prescribed by the student, it is not found by solving Newton's second law.
 * The model reports the work done by each force (W = F x s with F the component of the force along the line of motion and s the
 * signed displacement, which is the scalar product of the force and the displacement vectors) and the net work. It does not
 * claim that the chosen force and displacement are the trajectory the forces would produce; where that matters the result says
 * so (a held object, or the kinetic energy an object must already have). Weight g = 10 N per kg, as in the textbook.
 *
 * Positive direction: right on the horizontal track, up on the vertical rail. Angles are measured from "right",
 * anticlockwise: 0 right, 90 up, 180 left, 270 down.
 */

export const G = 10;
/** Length of the track (horizontal) and of the rail (vertical), in metres. */
export const TRACK_LENGTH = 12;

export type Axis = 'horizontal' | 'vertical';
export type SurfaceId = 'smooth' | 'wood' | 'rough';
export interface Surface { id: SurfaceId; label: string; mu: number }
export const SURFACES: Surface[] = [
  { id: 'smooth', label: 'Smooth (no friction)', mu: 0 },
  { id: 'wood', label: 'Wood (friction coefficient 0.3)', mu: 0.3 },
  { id: 'rough', label: 'Rough (friction coefficient 0.5)', mu: 0.5 },
];
export const surfaceById = (id: SurfaceId): Surface => SURFACES.find((s) => s.id === id) ?? SURFACES[0];

export interface WorkSetup {
  axis: Axis;
  /** Magnitude of the applied force, N. */
  forceN: number;
  /** Direction of the applied force, degrees from "right", anticlockwise. */
  angleDeg: number;
  /** Signed displacement along the axis, m (positive is right or up). */
  displacement: number;
  /** Starting position along the axis, m from the left end of the track (or the bottom of the rail). */
  startPos: number;
  massKg: number;
  /** Only used on the horizontal track. */
  surfaceId: SurfaceId;
}

export const DEFAULT_WORK: WorkSetup = { axis: 'horizontal', forceN: 10, angleDeg: 0, displacement: 3, startPos: 1, massKg: 2, surfaceId: 'smooth' };
export const WORK_LIMITS = { forceMax: 200, massMin: 0.1, massMax: 100 } as const;

export type ForceKind = 'applied' | 'weight' | 'normal' | 'friction';
export type Relation = 'no-force' | 'no-displacement' | 'along' | 'opposite' | 'perpendicular' | 'oblique';

export interface WorkForce {
  id: ForceKind;
  label: string;
  /** What exerts the force. */
  by: string;
  fx: number;
  fy: number;
  magnitude: number;
  /** Component along the line of motion (signed). */
  alongAxis: number;
  /** Work done by this force on the object, J. */
  work: number;
  relation: Relation;
}

export interface WorkResult {
  valid: boolean;
  reason?: string;
  setup: WorkSetup;
  endPos: number;
  forces: WorkForce[];
  applied: WorkForce;
  /** Net force (vector sum), N. */
  netFx: number;
  netFy: number;
  appliedWork: number;
  frictionWork: number;
  netWork: number;
  /** True when the forces do not add to zero although the displacement is zero: something (a wall, a hand, the table) must hold the object. */
  heldInPlace: boolean;
  /** The kinetic energy the object must already have for the prescribed displacement to happen under these forces (J). */
  minInitialKE: number;
  /** The friction at a resting object is static friction (no sliding). */
  staticFriction: boolean;
}

const clean = (n: number): number => (Math.abs(n) < 1e-9 ? 0 : Math.round(n * 1e9) / 1e9);
export const cosDeg = (deg: number): number => { const n = ((deg % 360) + 360) % 360; return n === 0 ? 1 : n === 90 || n === 270 ? 0 : n === 180 ? -1 : Math.cos((n * Math.PI) / 180); };
export const sinDeg = (deg: number): number => { const n = ((deg % 360) + 360) % 360; return n === 90 ? 1 : n === 270 ? -1 : n === 0 || n === 180 ? 0 : Math.sin((n * Math.PI) / 180); };

/** Convenience conversions to SI used by the textbook examples (cm to m, g to kg, kJ to J, km/h to m/s). */
export const cmToM = (cm: number): number => cm / 100;
export const gToKg = (g: number): number => g / 1000;
export const kJToJ = (kJ: number): number => kJ * 1000;
export const kmhToMs = (kmh: number): number => kmh / 3.6;

export function validateWork(s: WorkSetup): string | null {
  if (![s.forceN, s.angleDeg, s.displacement, s.startPos, s.massKg].every(Number.isFinite)) return 'Every value must be a number.';
  if (s.forceN < 0) return 'The force magnitude cannot be negative. Choose its direction with the direction buttons.';
  if (s.forceN > WORK_LIMITS.forceMax) return `The force must be at most ${WORK_LIMITS.forceMax} N.`;
  if (s.massKg < WORK_LIMITS.massMin || s.massKg > WORK_LIMITS.massMax) return `The mass must be between ${WORK_LIMITS.massMin} and ${WORK_LIMITS.massMax} kg.`;
  if (s.startPos < 0 || s.startPos > TRACK_LENGTH) return `The starting position must be between 0 and ${TRACK_LENGTH} m.`;
  const end = s.startPos + s.displacement;
  if (end < -1e-9 || end > TRACK_LENGTH + 1e-9) return `The object would leave the ${s.axis === 'horizontal' ? 'track' : 'rail'}: the end position ${Math.round(end * 100) / 100} m must be between 0 and ${TRACK_LENGTH} m.`;
  return null;
}

const relationOf = (alongAxis: number, magnitude: number, displacement: number): Relation => {
  if (magnitude === 0) return 'no-force';
  if (displacement === 0) return 'no-displacement';
  if (alongAxis === 0) return 'perpendicular';
  return (alongAxis > 0) === (displacement > 0) ? (Math.abs(alongAxis) === magnitude ? 'along' : 'oblique') : (Math.abs(alongAxis) === magnitude ? 'opposite' : 'oblique');
};

export function computeWork(setup: WorkSetup): WorkResult {
  const reason = validateWork(setup);
  const horizontal = setup.axis === 'horizontal';
  const s = setup.displacement;
  const make = (id: ForceKind, label: string, by: string, fx: number, fy: number): WorkForce => {
    const x = clean(fx), y = clean(fy);
    const mag = clean(Math.hypot(x, y));
    const alongAxis = horizontal ? x : y;
    return { id, label, by, fx: x, fy: y, magnitude: mag, alongAxis, work: clean(alongAxis * s), relation: relationOf(alongAxis, mag, s) };
  };
  const applied = make('applied', 'Applied force', 'the person pushing or pulling', setup.forceN * cosDeg(setup.angleDeg), setup.forceN * sinDeg(setup.angleDeg));
  const weight = make('weight', 'Weight', 'the Earth', 0, -setup.massKg * G);
  const forces: WorkForce[] = [applied, weight];
  let staticFriction = false;
  if (horizontal) {
    // Normal force from the track: it supports whatever part of the weight the applied force does not.
    let n = setup.massKg * G - applied.fy;
    if (n < -1e-9 && !reason) {
      return { ...invalid(setup, applied, weight, 'The upward part of the applied force is larger than the weight, so the object would lift off the track. This model keeps the object on the track.'), forces };
    }
    n = Math.max(0, clean(n));
    if (n > 0) forces.push(make('normal', 'Normal force', 'the track', 0, n));
    const mu = surfaceById(setup.surfaceId).mu;
    if (mu > 0 && n > 0) {
      if (s !== 0) forces.push(make('friction', 'Kinetic friction', 'the surface', -Math.sign(s) * mu * n, 0));
      else if (applied.fx !== 0) { staticFriction = true; forces.push(make('friction', 'Static friction', 'the surface', -Math.sign(applied.fx) * Math.min(Math.abs(applied.fx), mu * n), 0)); }
    }
  }
  const netFx = clean(forces.reduce((a, f) => a + f.fx, 0));
  const netFy = clean(forces.reduce((a, f) => a + f.fy, 0));
  const netWork = clean(forces.reduce((a, f) => a + f.work, 0));
  const friction = forces.find((f) => f.id === 'friction');
  return {
    valid: !reason, reason: reason ?? undefined, setup, endPos: clean(setup.startPos + s), forces, applied,
    netFx, netFy, appliedWork: applied.work, frictionWork: friction?.work ?? 0, netWork,
    heldInPlace: s === 0 && Math.abs(horizontal ? netFx : netFy) > 1e-9,
    minInitialKE: netWork < 0 ? -netWork : 0, staticFriction,
  };
}

function invalid(setup: WorkSetup, applied: WorkForce, weight: WorkForce, reason: string): WorkResult {
  return { valid: false, reason, setup, endPos: setup.startPos + setup.displacement, forces: [applied, weight], applied, netFx: 0, netFy: 0, appliedWork: 0, frictionWork: 0, netWork: 0, heldInPlace: false, minInitialKE: 0, staticFriction: false };
}

/** Work done by each force up to a fraction p (0 to 1) of the displacement. */
export const workAtProgress = (r: WorkResult, p: number): { position: number; byForce: Record<ForceKind, number>; net: number } => {
  const q = Math.max(0, Math.min(1, p));
  const byForce = { applied: 0, weight: 0, normal: 0, friction: 0 } as Record<ForceKind, number>;
  for (const f of r.forces) byForce[f.id] = clean(f.alongAxis * r.setup.displacement * q);
  return { position: clean(r.setup.startPos + r.setup.displacement * q), byForce, net: clean(Object.values(byForce).reduce((a, b) => a + b, 0)) };
};

export const fmt = (n: number): string => String(Math.round(n * 100) / 100).replace('-', '−');
export const fmtSigned = (n: number): string => (n > 0 ? `+${fmt(n)}` : fmt(n));

const dirWord = (f: WorkForce): string => {
  if (f.magnitude === 0) return 'no direction (the force is zero)';
  if (f.fy === 0) return f.fx > 0 ? 'to the right' : 'to the left';
  if (f.fx === 0) return f.fy > 0 ? 'upwards' : 'downwards';
  return `at an angle (${fmt(f.fx)} N ${f.fx > 0 ? 'right' : 'left'} and ${fmt(Math.abs(f.fy))} N ${f.fy > 0 ? 'up' : 'down'})`;
};

export const RELATION_TEXT: Record<Relation, string> = {
  'no-force': 'the force is zero',
  'no-displacement': 'there is no displacement',
  along: 'the force acts along the displacement',
  opposite: 'the force acts opposite to the displacement',
  perpendicular: 'the force is perpendicular to the displacement (no part of it is along the displacement)',
  oblique: 'the force is at an angle to the displacement (only its component along the displacement counts)',
};

/** A sentence for each force: what it is, how big, how it relates to the displacement, and the work with its sign and unit. */
export function describeForceWork(f: WorkForce, s: number): string {
  const w = f.work === 0 ? '0 J' : `${fmtSigned(f.work)} J`;
  const how = f.work > 0 ? 'positive work' : f.work < 0 ? 'negative work' : 'zero work';
  const calc = f.work === 0 && (f.magnitude === 0 || s === 0) ? '' : ` (${fmt(f.alongAxis)} N × ${fmt(s)} m)`;
  return `${f.label} (exerted by ${f.by}): ${fmt(f.magnitude)} N ${dirWord(f)}; ${RELATION_TEXT[f.relation]}, so it does ${how}: ${w}${calc}.`;
}

/** Complete text alternative and explanation, derived from the same result that is drawn. */
export function describeWork(r: WorkResult): string {
  if (!r.valid) return `This setup is not valid: ${r.reason}`;
  const s = r.setup.displacement;
  const where = r.setup.axis === 'horizontal' ? 'on a horizontal track' : 'on a vertical rail';
  const move = s === 0 ? `The object stays at ${fmt(r.setup.startPos)} m (displacement 0 m).` : `The object moves from ${fmt(r.setup.startPos)} m to ${fmt(r.endPos)} m, a displacement of ${fmtSigned(s)} m (${r.setup.axis === 'horizontal' ? (s > 0 ? 'to the right' : 'to the left') : (s > 0 ? 'upwards' : 'downwards')}).`;
  const parts = r.forces.map((f) => describeForceWork(f, s));
  const net = `Net work = ${r.forces.map((f) => fmt(f.work)).join(' + ')} = ${fmtSigned(r.netWork)} J.`;
  const held = r.heldInPlace ? ' The forces do not add to zero, so something else (a wall, a hand or a stop) must hold the object in place; the model only prescribes the displacement.' : '';
  const ke = r.netWork > 0 ? ' Positive net work: by the work–energy theorem the object gains kinetic energy.' : r.netWork < 0 ? ` Negative net work: by the work–energy theorem the object loses kinetic energy, so it must already have at least ${fmt(r.minInitialKE)} J to move this far.` : s !== 0 ? ' Zero net work: its kinetic energy does not change.' : '';
  return `A kinematic work model ${where}. Mass ${fmt(r.setup.massKg)} kg. ${move} ${parts.join(' ')} ${net}${ke}${held}`;
}
