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
  prediction: '#FACC15',
  correct: '#34D399',
  error: '#FB7185',
  /** Neutral structure (axis, ticks, origin marker). */
  axis: '#64748B',
  origin: '#E2E8F0',
} as const;

export type PhysQuantity = 'position' | 'distance' | 'displacement' | 'time';

/** Label text, a symbol that is not colour, and the accent for each measured quantity. */
export const QUANTITY: Record<PhysQuantity, { label: string; symbol: string; color: string; hint: string }> = {
  time: { label: 'Simulated time', symbol: '⏱', color: PHYS.time, hint: 'clock of the model' },
  position: { label: 'Position', symbol: '●', color: PHYS.position, hint: 'where the object is, from O' },
  distance: { label: 'Distance travelled', symbol: '↔', color: PHYS.distance, hint: 'total path length' },
  displacement: { label: 'Displacement', symbol: '→', color: PHYS.displacement, hint: 'final − initial, with direction' },
};
