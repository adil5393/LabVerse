/**
 * Guided derivations of the three equations of motion (PHY-1F), NCERT Class 9 Exploration, Chapter 4, Section 4.3:
 *   4.4a  v = u + at        4.4b  s = ut + ½at²        4.4c  v² = u² + 2as
 * The steps follow the textbook: 4.4a from the definition of average acceleration; 4.4b from the area under the
 * velocity–time graph (rectangle OACD plus triangle ABC); 4.4c by eliminating t between 4.4a and 4.4b.
 * Each step names the quantities it uses, why the transformation is valid, and (optionally) a `relation`: the two
 * sides of the step's equation evaluated from the motion engine's own v and s, so the numbers shown to the student
 * come from the same model as the graphs. Numbers illustrate a derivation; they do not prove it.
 */

import type { Question } from '../../education/types';
import { pick } from '../../education/builders';
import { stateAt, type Profile } from './profile';

export type DerivationId = 'A' | 'B' | 'C';
export type Highlight = 'slope' | 'rect' | 'tri' | 'u' | 'v' | 't' | 'total';

export interface Motion { u: number; a: number; t: number; v: number; s: number }

/** Build the shared quantities from a single-stage profile using the exact engine (not the equations). */
export function motionOf(p: Profile): Motion {
  const g = p.segments[0];
  const e = stateAt(p, g.durationS);
  return { u: p.v0, a: g.a, t: g.durationS, v: e.v, s: e.displacement };
}

export interface DerivationStep {
  id: string;
  title: string;
  /** Lines of mathematics, shown once the step is reached (and its check, if any, answered). */
  math: string[];
  /** Why this step is valid, in plain words. */
  why: string;
  uses: Highlight[];
  /** The student supplies the missing reasoning before the mathematics of this step appears. */
  check?: Question;
  /** Both sides of this step's equation from the engine's values; they must agree. Omitted for statements. */
  relation?: (m: Motion) => { label: string; lhs: number; rhs: number };
  /** The step needs a ≠ 0. */
  needsNonzeroA?: boolean;
}

export interface Derivation {
  id: DerivationId;
  equation: string;
  textbookNumber: string;
  title: string;
  assumptions: string[];
  steps: DerivationStep[];
  /** Concise final derivation for revision. */
  summary: string[];
}


export const DERIVATIONS: Derivation[] = [
  {
    id: 'A', equation: 'v = u + at', textbookNumber: '4.4a', title: 'First equation: from the definition of acceleration',
    assumptions: ['The object moves along a straight line.', 'The acceleration a is constant, so at every instant it equals the average acceleration over any interval.', 'u is the velocity at t = 0 and v is the velocity at time t (right is positive).'],
    steps: [
      { id: 'a1', title: 'Start from the definition', math: ['a = (v − u) ÷ t'], uses: ['slope', 'u', 'v', 't'],
        why: 'Average acceleration is the change in velocity divided by the time taken. Because the acceleration is constant, this average is the acceleration at every instant. On the graph it is the slope of the line.',
        relation: (m) => ({ label: 'a and (v − u) ÷ t', lhs: m.a, rhs: (m.v - m.u) / m.t }) },
      { id: 'a2', title: 'Clear the division by t', math: ['a × t = ((v − u) ÷ t) × t', 'at = v − u'], uses: ['u', 'v', 't'],
        check: pick('der-a2', 'The equation is a = (v − u) ÷ t. What should we do to both sides to remove the division by t?', [
          ['Multiply both sides by t', null],
          ['Divide both sides by t', 'That would make the right side (v − u) ÷ t², not remove the division. To cancel a division by t we multiply by t.', 'divide_to_cancel_division'],
          ['Subtract t from both sides', 'Subtracting t does not cancel the division. The inverse of dividing by t is multiplying by t.', 'subtract_for_division'],
        ], 'Doing the same operation to both sides keeps the equation true. Multiplying by t cancels the division on the right.'),
        why: 'Multiplying both sides by the same non-zero number keeps the equality true. On the right, ÷ t and × t cancel, leaving v − u.',
        relation: (m) => ({ label: 'at and v − u', lhs: m.a * m.t, rhs: m.v - m.u }) },
      { id: 'a3', title: 'Isolate v', math: ['at + u = (v − u) + u', 'v = u + at'], uses: ['u', 'v', 't'],
        why: 'Adding the same number u to both sides keeps the equality true. On the right, −u and +u cancel, so v stands alone.',
        relation: (m) => ({ label: 'v and u + at', lhs: m.v, rhs: m.u + m.a * m.t }) },
      { id: 'a4', title: 'The result (Eq. 4.4a)', math: ['v = u + at'], uses: ['slope', 'v'],
        why: 'The velocity at time t is the initial velocity plus the change at, the acceleration times the time. If a is negative the change is negative; if a = 0 then v = u.' },
    ],
    summary: ['a = (v − u) ÷ t', 'at = v − u   (multiply both sides by t)', 'v = u + at   (add u to both sides)  Eq. 4.4a'],
  },
  {
    id: 'B', equation: 's = ut + ½at²', textbookNumber: '4.4b', title: 'Second equation: from the area under the velocity–time graph',
    assumptions: ['Straight-line motion with constant acceleration, so the velocity–time graph is a straight line from u to v.', 'The displacement is the signed area between the graph and the time axis (area above the axis counts as positive, below as negative).', 'We use the first equation v = u + at (Eq. 4.4a), which we derived in Derivation A.'],
    steps: [
      { id: 'b1', title: 'Displacement is area', math: ['s = area under the graph from 0 to t'], uses: ['total'],
        why: 'Velocity × time is displacement, so the area between the velocity–time graph and the time axis is the displacement. Area below the axis is negative displacement.',
        relation: (m) => ({ label: 'engine displacement s and the sum of the two signed pieces', lhs: m.s, rhs: m.u * m.t + 0.5 * (m.v - m.u) * m.t }) },
      { id: 'b2', title: 'Split the area into two simple shapes', math: ['s = (area of rectangle) + (area of triangle)', 'rectangle: height u, width t', 'triangle: width t, height = v − u   (BC = EO − AO in the textbook figure)'], uses: ['rect', 'tri', 'u', 't'],
        check: pick('der-b2', 'The rectangle has height u. The triangle sits on top of it, between the line at height u and the sloping graph, which ends at height v. What is the height of the triangle?', [
          ['v − u', null],
          ['v', 'v is the height of the whole graph at time t. The triangle only reaches from the top of the rectangle (height u) up to v.', 'whole_height_for_triangle'],
          ['u', 'u is the height of the rectangle, not of the triangle on top of it.', 'rectangle_height_for_triangle'],
        ], 'The triangle runs from height u to height v, so its height is v − u (BC = EO − AO in the textbook figure).'),
        why: 'A trapezoid-shaped region is the sum of a rectangle (constant velocity u) and a triangle (the extra velocity v − u that builds up).',
        relation: (m) => ({ label: 'rectangle u × t and triangle ½ × t × (v − u), summed, and s', lhs: m.u * m.t + 0.5 * m.t * (m.v - m.u), rhs: m.s }) },
      { id: 'b3', title: 'Write both areas', math: ['s = u × t + ½ × t × (v − u)'], uses: ['rect', 'tri', 'u', 'v', 't'],
        why: 'Rectangle: height × width = u × t. Triangle: ½ × base × height = ½ × t × (v − u). The triangle area is negative when v < u, which is correct: a falling velocity subtracts displacement.',
        relation: (m) => ({ label: 'u t + ½ t (v − u) and s', lhs: m.u * m.t + 0.5 * m.t * (m.v - m.u), rhs: m.s }) },
      { id: 'b4', title: 'Replace v − u', math: ['from Eq. 4.4a: v − u = at', 's = ut + ½ × t × (at)'], uses: ['tri', 'slope'],
        check: pick('der-b4', 'We want to remove v from s = ut + ½t(v − u). Which earlier result lets us replace v − u?', [
          ['v = u + at, which gives v − u = at', null],
          ['s = ut + ½at², the equation we are trying to prove', 'That is the result we want. Using it would be circular reasoning. We use the already-proved first equation.', 'circular_reasoning'],
          ['v² = u² + 2as', 'That equation is derived later and needs s. Use the first equation, which links v, u, a and t.', 'wrong_equation'],
        ], 'Eq. 4.4a, v = u + at, was derived from the definition of acceleration; subtracting u gives v − u = at.'),
        why: 'Equation 4.4a gives v − u = at exactly, so the substitution only rewrites the same quantity.',
        relation: (m) => ({ label: 'v − u and at', lhs: m.v - m.u, rhs: m.a * m.t }) },
      { id: 'b5', title: 'Simplify', math: ['s = ut + ½ a t²'], uses: ['rect', 'tri'],
        why: 't × t = t², so ½ × t × (at) = ½at². The rectangle gives ut, the triangle gives ½at².',
        relation: (m) => ({ label: 'ut + ½at² and the engine s', lhs: m.u * m.t + 0.5 * m.a * m.t * m.t, rhs: m.s }) },
      { id: 'b6', title: 'Negative u or a, and zero acceleration', math: ['u < 0: ut < 0 (rectangle below the axis)', 'a < 0: ½at² < 0 (triangle below the line)', 'a = 0: triangle has height 0, s = ut'], uses: ['rect', 'tri', 'total'],
        why: 'The derivation used only signed quantities, so the same algebra holds for any signs: the rectangle and the triangle are signed areas that add to the displacement. When the velocity crosses zero the picture overlaps the axis, but s is still the net (signed) displacement, not the distance.',
        relation: (m) => ({ label: 's from the equation and the engine', lhs: m.u * m.t + 0.5 * m.a * m.t * m.t, rhs: m.s }) },
      { id: 'b7', title: 'The result (Eq. 4.4b)', math: ['s = ut + ½at²'], uses: ['total'],
        why: 'The displacement is the initial-velocity term plus the acceleration term.' },
    ],
    summary: ['s = area of rectangle + area of triangle = u·t + ½·t·(v − u)', 'v − u = at   (Eq. 4.4a)', 's = ut + ½at²   Eq. 4.4b'],
  },
  {
    id: 'C', equation: 'v² = u² + 2as', textbookNumber: '4.4c', title: 'Third equation: eliminate the time',
    assumptions: ['Constant acceleration in a straight line, with Eq. 4.4a (v = u + at) and Eq. 4.4b (s = ut + ½at²) already derived.', 'The main derivation needs a ≠ 0, because it divides by a. The case a = 0 is treated separately at the end.'],
    steps: [
      { id: 'c1', title: 'Get t from the first equation', math: ['v = u + at', 'at = v − u', 't = (v − u) ÷ a     (needs a ≠ 0)'], uses: ['u', 'v', 't'], needsNonzeroA: true,
        why: 'Dividing both sides by a keeps the equality true only if a is not zero; this is why a = 0 needs its own case.',
        relation: (m) => ({ label: 't and (v − u) ÷ a', lhs: m.t, rhs: (m.v - m.u) / m.a }) },
      { id: 'c2', title: 'Substitute into the second equation', math: ['s = ut + ½at²', 's = u × (v − u)/a + ½ × a × ((v − u)/a)²'], uses: ['t', 'u', 'v'], needsNonzeroA: true,
        why: 'Both equations describe the same motion, so wherever t appears we may replace it by (v − u) ÷ a. This removes t.',
        relation: (m) => ({ label: 'u(v − u)/a + ½a((v − u)/a)² and s', lhs: m.u * (m.v - m.u) / m.a + 0.5 * m.a * ((m.v - m.u) / m.a) ** 2, rhs: m.s }) },
      { id: 'c3', title: 'Square the bracket', math: ['s = u(v − u)/a + ½ × a × (v − u)²/a²'], uses: ['v', 'u'], needsNonzeroA: true,
        why: '((v − u)/a)² = (v − u)²/a², because both the top and the bottom are squared.',
        relation: (m) => ({ label: 'u(v − u)/a + ½a(v − u)²/a² and s', lhs: m.u * (m.v - m.u) / m.a + 0.5 * m.a * (m.v - m.u) ** 2 / (m.a * m.a), rhs: m.s }) },
      { id: 'c4', title: 'Cancel one a', math: ['s = u(v − u)/a + (v − u)²/(2a)'], uses: ['v', 'u'], needsNonzeroA: true,
        check: pick('der-c4', 'In ½ × a × (v − u)²/a² the letter a appears on top once and on the bottom twice. What is left?', [
          ['(v − u)²/(2a): one a cancels, one stays below', null],
          ['(v − u)²/(2a²): nothing cancels', 'One a on the top cancels with one of the two a on the bottom (a ÷ a² = 1 ÷ a), leaving a single a below.', 'no_cancellation'],
          ['a(v − u)²/2: the a moves to the top', 'Dividing a by a² gives 1 ÷ a, so an a stays on the bottom, not the top.', 'cancel_wrong_way'],
        ], 'a ÷ a² = 1 ÷ a, so ½ × (v − u)²/a = (v − u)²/(2a).'),
        why: 'Cancelling a common non-zero factor from the top and bottom of a fraction does not change its value.',
        relation: (m) => ({ label: 'u(v − u)/a + (v − u)²/(2a) and s', lhs: m.u * (m.v - m.u) / m.a + (m.v - m.u) ** 2 / (2 * m.a), rhs: m.s }) },
      { id: 'c5', title: 'Put over a common denominator 2a', math: ['s = [2u(v − u) + (v − u)²] ÷ 2a', 'numerator = 2uv − 2u² + v² − 2uv + u²', '= v² − u²', 's = (v² − u²) ÷ 2a'], uses: ['u', 'v'], needsNonzeroA: true,
        why: 'Multiplying top and bottom of the first fraction by 2 gives it the denominator 2a. Expanding the brackets, the 2uv terms cancel, and −2u² + u² = −u².',
        relation: (m) => ({ label: '(v² − u²) ÷ 2a and s', lhs: (m.v * m.v - m.u * m.u) / (2 * m.a), rhs: m.s }) },
      { id: 'c6', title: 'Multiply by 2a', math: ['2as = v² − u²', 'v² = u² + 2as'], uses: ['u', 'v'], needsNonzeroA: true,
        why: 'Multiplying both sides by 2a (not zero) removes the division; adding u² to both sides isolates v².',
        relation: (m) => ({ label: 'v² and u² + 2as', lhs: m.v * m.v, rhs: m.u * m.u + 2 * m.a * m.s }) },
      { id: 'c7', title: 'The case a = 0 (no division allowed)', math: ['a = 0: Eq. 4.4a gives v = u, and Eq. 4.4b gives s = ut', 'v² = u² and u² + 2 × 0 × s = u²', 'so v² = u² + 2as still holds'], uses: ['u', 'v'],
        check: pick('der-c7', 'The derivation divided by a. What do we do if a = 0?', [
          ['Treat it separately: v = u and s = ut, and then v² = u² + 2as holds because 2as = 0', null],
          ['Divide by zero anyway; it still works', 'Division by zero is undefined, so the steps above are not valid when a = 0.', 'divide_by_zero'],
          ['The equation does not apply when a = 0', 'It does apply: with a = 0 the equation says v² = u², which is true because v = u.', 'equation_fails_at_zero'],
        ], 'We cannot divide by 0, so we check a = 0 directly from the first two equations.'),
        why: 'The elimination of t needs a ≠ 0. For a = 0 the first two equations are simple enough to check the result directly.',
        relation: (m) => ({ label: 'v² and u² + 2as', lhs: m.v * m.v, rhs: m.u * m.u + 2 * m.a * m.s }) },
    ],
    summary: ['t = (v − u) ÷ a   (a ≠ 0)', 's = ut + ½at²  →  s = (v² − u²) ÷ 2a', 'v² = u² + 2as   Eq. 4.4c   (a = 0 checked separately: v = u)'],
  },
];

export const derivationById = (id: string | null | undefined): Derivation | undefined => DERIVATIONS.find((d) => d.id === id);

export interface DerivationCase { id: string; title: string; profile: Profile }
const one = (v0: number, a: number, d: number): Profile => ({ x0: 0, v0, segments: [{ durationS: d, a }] });

/** Cases for the figure. The first is the first-quadrant introductory case. */
export const DERIVATION_CASES: DerivationCase[] = [
  { id: 'speed-up', title: 'Speeding up (u = 4, a = 2, t = 5)', profile: one(4, 2, 5) },
  { id: 'slow-down', title: 'Slowing down (u = 10, a = −2, t = 4)', profile: one(10, -2, 4) },
  { id: 'leftward', title: 'Moving left (u = −4, a = −2, t = 3)', profile: one(-4, -2, 3) },
  { id: 'crossing', title: 'Velocity crosses zero (u = 6, a = −2, t = 6)', profile: one(6, -2, 6) },
  { id: 'zero-a', title: 'No acceleration (u = 5, a = 0, t = 4)', profile: one(5, 0, 4) },
];

/** Signed areas of the rectangle (height u) and triangle (height v − u) of Derivation B. */
export const signedPieces = (m: Motion): { rect: number; tri: number; total: number } => {
  const rect = m.u * m.t, tri = 0.5 * m.t * (m.v - m.u);
  return { rect, tri, total: rect + tri };
};
