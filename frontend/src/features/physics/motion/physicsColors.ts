/**
 * Semantic colours for Physics (PHY-1A refinement). Each colour stands for ONE physical
 * quantity or state and is always paired with a word, symbol or shape: never colour alone.
 * All sit on the existing dark surfaces with contrast above 4.5:1.
 */

export const PHYS = {
  position: '#38BDF8',
  distance: '#F59E0B',
  displacement: '#A78BFA',
  time: '#94A3B8',
  speed: '#2DD4BF',
  velocity: '#F472B6',
  acceleration: '#FB923C',
  force: '#818CF8',
  friction: '#E879F9',
  netForce: '#F8FAFC',
  vertical: '#A3E635',
  prediction: '#FACC15',
  correct: '#34D399',
  error: '#FB7185',
  /** Neutral structure (axis, ticks, origin marker). */
  axis: '#64748B',
  origin: '#E2E8F0',
} as const;

export type PhysQuantity = 'position' | 'distance' | 'displacement' | 'time' | 'speed' | 'velocity' | 'instant';

/** Label text, a symbol that is not colour, and the accent for each measured quantity. */
export const QUANTITY: Record<PhysQuantity, { label: string; symbol: string; color: string; hint: string }> = {
  time: { label: 'Simulated time', symbol: '⏱', color: PHYS.time, hint: 'clock of the model' },
  position: { label: 'Position', symbol: '●', color: PHYS.position, hint: 'where the object is, from O' },
  distance: { label: 'Distance travelled', symbol: '↔', color: PHYS.distance, hint: 'total path length' },
  speed: { label: 'Average speed', symbol: '⚡', color: PHYS.speed, hint: 'distance ÷ time, never negative' },
  velocity: { label: 'Average velocity', symbol: '➤', color: PHYS.velocity, hint: 'displacement ÷ time, signed' },
  instant: { label: 'Velocity now', symbol: '➤', color: PHYS.velocity, hint: 'instantaneous, signed' },
  displacement: { label: 'Displacement', symbol: '→', color: PHYS.displacement, hint: 'final − initial, with direction' },
};
