/**
 * Identifying Newton's third-law pairs (PHY-2D). A force is described by WHO exerts it, WHAT it acts on, its kind, size and
 * direction. Two forces form a genuine action-reaction pair only if ALL of these hold: the first is exerted by the object the
 * second acts on and the second is exerted by the object the first acts on (the objects swap), they are the same kind of
 * force, they are equal in size and opposite in direction. Two opposite arrows on the SAME object are balanced forces,
 * never a pair; two opposite arrows that are not a swap (weight and the normal force on a book) are not a pair either.
 * The scenarios follow the textbook's own examples (Figs. 6.22 to 6.33); sizes are illustrative.
 */

export type ForceKind = 'contact' | 'gravity' | 'friction' | 'magnetic' | 'tension' | 'thrust';
export type Dir = 'left' | 'right' | 'up' | 'down';

export interface PairForce { id: string; label: string; by: string; on: string; kind: ForceKind; magnitude: number; direction: Dir }

const OPPOSITE: Record<Dir, Dir> = { left: 'right', right: 'left', up: 'down', down: 'up' };

export function isThirdLawPair(a: PairForce, b: PairForce): boolean {
  return a.id !== b.id && a.by === b.on && a.on === b.by && a.kind === b.kind && Math.abs(a.magnitude - b.magnitude) < 1e-9 && b.direction === OPPOSITE[a.direction];
}

/** Two forces on the same object that are equal and opposite: balanced forces (not a third-law pair). */
export function isBalancedOnOneObject(a: PairForce, b: PairForce): boolean {
  return a.id !== b.id && a.on === b.on && Math.abs(a.magnitude - b.magnitude) < 1e-9 && b.direction === OPPOSITE[a.direction];
}

/** Why a chosen couple of forces is NOT a pair: the first reason that applies, in student-friendly words. */
export function whyNotPair(a: PairForce, b: PairForce): string {
  if (a.id === b.id) return 'Choose two different forces.';
  if (a.on === b.on) return `Both forces act on the same object (the ${a.on}). Forces on one object that are equal and opposite are balanced forces. An action–reaction pair always acts on two DIFFERENT objects.`;
  if (!(a.by === b.on && a.on === b.by)) return `In a pair the objects swap roles: if the first force is exerted by the ${a.by} on the ${a.on}, the partner is exerted by the ${a.on} on the ${a.by}. Here the second force is exerted by the ${b.by} on the ${b.on}.`;
  if (a.kind !== b.kind) return 'The two forces of a pair are always the same kind of force (both gravitational, both contact, and so on).';
  if (Math.abs(a.magnitude - b.magnitude) > 1e-9) return 'The two forces of a pair are always equal in size.';
  return 'The two forces of a pair point in opposite directions.';
}

export interface PairScenario {
  id: string;
  title: string;
  /** The objects involved, in the order they are drawn. */
  objects: string[];
  source: string;
  setup: string;
  forces: PairForce[];
  /** What the student should notice about the forces and the motion. */
  explain: string;
}

const f = (id: string, label: string, by: string, on: string, kind: ForceKind, magnitude: number, direction: Dir): PairForce => ({ id, label, by, on, kind, magnitude, direction });

export const PAIR_SCENARIOS: PairScenario[] = [
  { id: 'book', title: 'A book resting on a table', objects: ['book', 'table', 'Earth'], source: 'Section 6.6 note and Section 6.2 (balanced forces)',
    setup: 'A book rests on a table. Four forces are drawn: the Earth pulls the book down, the table pushes the book up, the book pulls the Earth up, and the book presses on the table.',
    forces: [f('w', 'Weight of the book', 'Earth', 'book', 'gravity', 10, 'down'), f('n', 'Normal force on the book', 'table', 'book', 'contact', 10, 'up'), f('wp', 'Book pulls the Earth', 'book', 'Earth', 'gravity', 10, 'up'), f('np', 'Book presses the table', 'book', 'table', 'contact', 10, 'down')],
    explain: 'The weight and the normal force are equal and opposite on the SAME object (the book): balanced forces. Each of them has its own partner on a different object: the book pulls the Earth up, and the book presses down on the table.' },
  { id: 'wall', title: 'Pushing a wall', objects: ['hand', 'wall'], source: 'Section 6.6, Activity 6.5',
    setup: 'You push a wall with your hand. The hand pushes the wall to the right and the wall pushes the hand to the left.',
    forces: [f('hw', 'Hand pushes the wall', 'hand', 'wall', 'contact', 40, 'right'), f('wh', 'Wall pushes the hand', 'wall', 'hand', 'contact', 40, 'left')],
    explain: 'The forces are equal and opposite, they are exerted at the same moment and they act on different objects, so they do not cancel on either one. The wall does not move because the ground and the building hold it; your hand feels the wall\'s push.' },
  { id: 'walk', title: 'Walking', objects: ['foot', 'ground'], source: 'Section 6.6, Figs. 6.24 and 6.25 (Bridging Science and Society)',
    setup: 'You walk forward. Your foot pushes the ground backwards; the ground exerts a frictional force on your foot.',
    forces: [f('fg', 'Foot pushes the ground backwards', 'foot', 'ground', 'friction', 60, 'left'), f('gf', 'Friction by the ground on the foot', 'ground', 'foot', 'friction', 60, 'right')],
    explain: 'Your foot tries to slide backwards, so friction on the foot acts forwards: here friction helps you move rather than opposing you. The force on the foot is the ground\'s reaction to the foot\'s push, and it acts on a different object. On wet polished floors or ice the friction is small and you slip.' },
  { id: 'canoe', title: 'Rowing a canoe', objects: ['paddle', 'water'], source: 'Section 6.6, Fig. 6.28',
    setup: 'A canoeist pushes the water backwards with the paddle; the water pushes the paddle forwards.',
    forces: [f('pw', 'Paddle pushes the water backwards', 'paddle', 'water', 'contact', 80, 'left'), f('wp', 'Water pushes the paddle forwards', 'water', 'paddle', 'contact', 80, 'right')],
    explain: 'The two forces are equal in size but act on different objects, the paddle and the water, so they do not cancel. The forward force on the paddle (and canoe) is the one that moves the canoe forward.' },
  { id: 'rocket', title: 'A rocket lifting off', objects: ['rocket', 'exhaust gas'], source: 'Section 6.6, Fig. 6.30 and Activity 6.7',
    setup: 'The engine pushes the exhaust gas downwards; the gas pushes the rocket upwards.',
    forces: [f('rg', 'Rocket pushes the gas down', 'rocket', 'exhaust gas', 'thrust', 5000, 'down'), f('gr', 'Gas pushes the rocket up', 'exhaust gas', 'rocket', 'thrust', 5000, 'up'), f('rw', 'Weight of the rocket', 'Earth', 'rocket', 'gravity', 3000, 'down')],
    explain: 'The thrust on the rocket is the partner of the push on the gas. The rocket lifts off because the upward thrust is larger than its weight, so the NET force on the rocket is upwards. (The weight is not the partner of the thrust: it is exerted by a different object and is a different kind of force.)' },
  { id: 'magnets', title: 'Two bar magnets (a non-contact pair)', objects: ['magnet P', 'magnet Q'], source: 'Section 6.6, Fig. 6.31',
    setup: 'Two bar magnets repel each other. P pushes Q to the right and Q pushes P to the left, without touching.',
    forces: [f('pq', 'P repels Q', 'magnet P', 'magnet Q', 'magnetic', 2, 'right'), f('qp', 'Q repels P', 'magnet Q', 'magnet P', 'magnetic', 2, 'left')],
    explain: 'The third law applies to non-contact forces too (magnetic, electrostatic and gravitational): the forces are equal and opposite and act on different objects.' },
];

export const pairScenarioById = (id: string): PairScenario | undefined => PAIR_SCENARIOS.find((s) => s.id === id);

/** All genuine pairs in a scenario, as unordered id pairs. */
export function genuinePairs(s: PairScenario): [string, string][] {
  const out: [string, string][] = [];
  for (let i = 0; i < s.forces.length; i++) for (let j = i + 1; j < s.forces.length; j++) if (isThirdLawPair(s.forces[i], s.forces[j])) out.push([s.forces[i].id, s.forces[j].id]);
  return out;
}
