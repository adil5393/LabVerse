/**
 * Motion in a straight line: the single authoritative model for PHY-1A.
 *
 * A motion is a PATH: a start position and a list of legs. Each leg moves the object
 * uniformly from one position to the next in a stated amount of simulated time.
 * Everything shown (position, distance, displacement, the history, the readouts and the
 * text) is a pure function of the path and a simulated time `tMs`. Nothing here depends
 * on animation frames or wall-clock time: a rendering frame only chooses WHICH simulated
 * time to ask about (see `tickClock`). Positions are stored in whole centimetres so sums
 * of lengths are exact; time is stored in whole milliseconds.
 *
 * Sign convention (textbook Section 4.1.1): positions to the right of the origin O are
 * positive and to the left are negative. Distance is a length (never negative); displacement
 * is the net change of position and carries a sign.
 *
 * Deliberately 1-D kinematics only. Speed, velocity and acceleration will be derived from
 * the same legs later (rate = length ÷ duration), so the model does not need to change.
 */

export const CM_PER_M = 100;
export const MS_PER_S = 1000;

export interface Leg { fromCm: number; toCm: number; durationMs: number }

export interface MotionPath {
  startCm: number;
  legs: readonly Leg[];
  /** Allowed positions (the track). */
  minCm: number;
  maxCm: number;
}

export const cm = (metres: number): number => Math.round(metres * CM_PER_M);
export const metres = (centimetres: number): number => centimetres / CM_PER_M;

export function newPath(startMetres = 0, minMetres = -50, maxMetres = 100): MotionPath {
  const min = cm(minMetres), max = cm(maxMetres), start = cm(startMetres);
  if (!(min < max)) throw new RangeError('track minimum must be below its maximum');
  if (start < min || start > max) throw new RangeError('start position is off the track');
  return { startCm: start, legs: [], minCm: min, maxCm: max };
}

export const currentCm = (p: MotionPath): number => (p.legs.length ? p.legs[p.legs.length - 1].toCm : p.startCm);
export const totalDurationMs = (p: MotionPath): number => p.legs.reduce((s, l) => s + l.durationMs, 0);

export type MoveResult = { ok: true; path: MotionPath } | { ok: false; reason: string };

/** Move to `toMetres` (a real position on the track). `durationMs` is simulated time, default 1 s. Staying put is a pause. */
export function addMove(p: MotionPath, toMetres: number, durationMs = MS_PER_S): MoveResult {
  if (!Number.isFinite(toMetres)) return { ok: false, reason: 'Enter a number for the position.' };
  const to = cm(toMetres);
  if (to < p.minCm || to > p.maxCm) return { ok: false, reason: `The track runs from ${fmtM(p.minCm)} to ${fmtM(p.maxCm)}, so ${fmtM(to)} is off the track.` };
  if (!Number.isInteger(durationMs) || durationMs <= 0) return { ok: false, reason: 'A move takes a positive amount of time.' };
  return { ok: true, path: { ...p, legs: [...p.legs, { fromCm: currentCm(p), toCm: to, durationMs }] } };
}

/** Move by a signed amount from the current position. */
export const addMoveBy = (p: MotionPath, deltaMetres: number, durationMs = MS_PER_S): MoveResult => addMove(p, metres(currentCm(p)) + deltaMetres, durationMs);

export const undoMove = (p: MotionPath): MotionPath => ({ ...p, legs: p.legs.slice(0, -1) });
/** Reset clears every leg and goes back to the start position. */
export const resetPath = (p: MotionPath): MotionPath => ({ ...p, legs: [] });

export type Heading = 'right' | 'left' | 'at rest';

export interface Sample {
  tMs: number;
  positionCm: number;
  /** Total path length so far (never negative, never decreasing). */
  distanceCm: number;
  /** Net change of position since the start, signed. */
  displacementCm: number;
  /** Direction of the leg in progress. */
  heading: Heading;
  legIndex: number;
}

export function sampleAt(p: MotionPath, tMs: number): Sample {
  const total = totalDurationMs(p);
  const t = Math.min(Math.max(0, tMs), total);
  let elapsed = 0, dist = 0, pos = p.startCm, heading: Heading = 'at rest', idx = -1;
  for (let i = 0; i < p.legs.length; i++) {
    const l = p.legs[i];
    const len = Math.abs(l.toCm - l.fromCm);
    if (t >= elapsed + l.durationMs) { elapsed += l.durationMs; dist += len; pos = l.toCm; idx = i; heading = l.toCm > l.fromCm ? 'right' : l.toCm < l.fromCm ? 'left' : 'at rest'; continue; }
    const f = (t - elapsed) / l.durationMs;
    pos = l.fromCm + (l.toCm - l.fromCm) * f; dist += len * f; idx = i;
    heading = l.toCm > l.fromCm ? 'right' : l.toCm < l.fromCm ? 'left' : 'at rest';
    return { tMs: t, positionCm: pos, distanceCm: dist, displacementCm: pos - p.startCm, heading, legIndex: idx };
  }
  return { tMs: t, positionCm: pos, distanceCm: dist, displacementCm: pos - p.startCm, heading, legIndex: idx };
}

export const summary = (p: MotionPath): Sample => sampleAt(p, totalDurationMs(p));

/** The positions visited at the end of each leg, starting with the start: the path's turning points and ends. */
export const waypointsCm = (p: MotionPath): number[] => [p.startCm, ...p.legs.map((l) => l.toCm)];

export const turnCount = (p: MotionPath): number => {
  let turns = 0, last: Heading = 'at rest';
  for (const l of p.legs) {
    const h: Heading = l.toCm > l.fromCm ? 'right' : l.toCm < l.fromCm ? 'left' : 'at rest';
    if (h === 'at rest') continue;
    if (last !== 'at rest' && h !== last) turns++;
    last = h;
  }
  return turns;
};

/**
 * Advance simulated time for PLAYBACK. `wallMs` is how long a rendering frame took; `rate` is the
 * playback speed (0.5, 1, 2 ...). This only moves the clock we ask the model about; it is NOT a physical
 * speed, and any frame length gives the same physics at the same simulated time.
 */
export function tickClock(tMs: number, wallMs: number, rate: number, totalMs: number): number {
  if (!(wallMs >= 0) || !(rate > 0)) return Math.min(Math.max(0, tMs), totalMs);
  return Math.min(totalMs, Math.max(0, tMs) + wallMs * rate);
}

// ---------------------------------------------------------------------------
// Units and text
// ---------------------------------------------------------------------------

const MINUS = '−';
const trim = (n: number): string => String(Math.round(n * 100) / 100);
export const fmtM = (centimetres: number): string => `${centimetres < 0 ? MINUS : ''}${trim(Math.abs(centimetres) / CM_PER_M)} m`;
export const fmtSigned = (centimetres: number): string => `${centimetres > 0 ? '+' : centimetres < 0 ? MINUS : ''}${trim(Math.abs(centimetres) / CM_PER_M)} m`;
export const fmtLength = (centimetres: number): string => `${trim(Math.abs(centimetres) / CM_PER_M)} m`;

export function describeDisplacement(displacementCm: number): string {
  if (Math.abs(displacementCm) < 0.5) return '0 m (the object is back where it started)';
  return `${fmtLength(displacementCm)} to the ${displacementCm > 0 ? 'right' : 'left'} (${fmtSigned(displacementCm)})`;
}

export function describePosition(positionCm: number): string {
  if (Math.abs(positionCm) < 0.5) return '0 m (at the origin O)';
  return `${fmtLength(positionCm)} to the ${positionCm > 0 ? 'right' : 'left'} of O (${fmtSigned(positionCm)})`;
}

export type LengthUnit = 'mm' | 'cm' | 'm' | 'km';
const TO_M: Record<LengthUnit, number> = { mm: 0.001, cm: 0.01, m: 1, km: 1000 };
export const convertLength = (value: number, from: LengthUnit, to: LengthUnit): number => (value * TO_M[from]) / TO_M[to];

export type TimeUnit = 's' | 'min' | 'h';
const TO_S: Record<TimeUnit, number> = { s: 1, min: 60, h: 3600 };
export const convertTime = (value: number, from: TimeUnit, to: TimeUnit): number => (value * TO_S[from]) / TO_S[to];

/** A text alternative generated from the path itself. */
export function describePath(intro: string, p: MotionPath): string {
  const s = summary(p);
  const legs = p.legs.map((l, i) => `leg ${i + 1}: ${fmtM(l.fromCm)} to ${fmtM(l.toCm)} (${l.toCm === l.fromCm ? 'stays' : fmtLength(l.toCm - l.fromCm) + (l.toCm > l.fromCm ? ' to the right' : ' to the left')})`);
  return `${intro} The track runs from ${fmtM(p.minCm)} to ${fmtM(p.maxCm)} with the origin O at 0 m. The object starts at ${fmtM(p.startCm)}${legs.length ? `, then ${legs.join('; ')}` : ' and has not moved'}. It ends at ${fmtM(s.positionCm)}. Total distance travelled ${fmtLength(s.distanceCm)}; displacement ${describeDisplacement(s.displacementCm)}.`;
}
