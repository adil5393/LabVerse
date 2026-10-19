/**
 * Question factories for the Circles lessons. Every answer and every targeted
 * wrong-answer message is computed from the same Figure that is drawn.
 */

import type { ChoiceQuestion, FeedbackEntry, NumericQuestion, NumericRule, VisualQuestion, VisualRef } from '../../../education/types';
import { angleAt, arcFigure, chordFigure, norm360, reflectAngle, type Figure } from './figure';

export interface CircleVisualOpts {
  /** Segment ids the student may choose between (pick mode). */
  pick?: boolean;
  /** Relations shown live between two measured angles. */
  relations?: { kind: 'ratio' | 'sum'; a: string; b: string }[];
  /** Point ids the student can drag along the circle. */
  drag?: string[];
  /** Allowed angle range per draggable point, in degrees [from, to] going counter-clockwise. */
  limits?: Record<string, [number, number]>;
  /** What to read out live under the figure. */
  measureAngles?: boolean;
  measureChords?: [string, string][];
  measureDistances?: [string, string][];
  highlight?: string[];
  showValues?: boolean;
  hideLabels?: string[];
}

const fmt = (n: number) => (Math.round(n * 100) / 100).toString();

/** Text alternative generated from the figure itself (never hand-typed coordinates). */
export function altForFigure(intro: string, fig: Figure): string {
  const pts = fig.points.filter((p) => !/^[XY][12]$/.test(p.id)).map((p) => `${p.id} (${Math.round(p.angle)}° around the circle)`).join(', ');
  const segs = (fig.segments ?? []).map((s) => `${s.from === 'O' || s.to === 'O' ? '' : ''}${s.id}${s.kind && s.kind !== 'plain' ? ` is a ${s.kind}` : ''}`).join('; ');
  return `${intro} A circle of radius ${fig.r} with centre O. Points on the circle: ${pts}.${segs ? ` Segments drawn: ${segs}.` : ''}`;
}

export const circleVisual = (fig: Figure, alt: string, opts: CircleVisualOpts = {}): VisualRef => ({ kind: 'circle', props: { figure: fig, ...opts }, alt });

const prettyKind: Record<string, string> = { radius: 'radius', chord: 'chord', diameter: 'diameter' };

// ---------------------------------------------------------------------------
// Parts of a circle (visual pick)
// ---------------------------------------------------------------------------

export const PARTS_FIGURE: Figure = {
  r: 5,
  points: [{ id: 'A', angle: 20 }, { id: 'B', angle: 200 }, { id: 'C', angle: 110 }, { id: 'D', angle: 170 }],
  segments: [
    { id: 'AB', from: 'A', to: 'B', kind: 'diameter' },
    { id: 'OC', from: 'O', to: 'C', kind: 'radius' },
    { id: 'CD', from: 'C', to: 'D', kind: 'chord' },
  ],
};

const WHY: Record<string, Record<string, string>> = {
  radius: {
    diameter: 'That is a diameter: it joins two points of the circle and passes through the centre. A radius has just one end on the circle and the other at the centre O.',
    chord: 'That is a chord: both ends are on the circle. A radius must have one end at the centre O.',
  },
  diameter: {
    radius: 'That is a radius: it reaches only from O to the circle. A diameter goes all the way across, through O, to the circle on the other side.',
    chord: 'That chord does not pass through the centre. A diameter is a chord that DOES pass through O.',
  },
  chord: {
    radius: 'A radius has one end at the centre, which is not on the circle. A chord has BOTH ends on the circle.',
    diameter: 'A diameter is a special chord, but this one is the longest. Here we want the chord that does not pass through the centre.',
  },
};

export function partQ(id: string, ask: 'radius' | 'diameter' | 'chord', fig: Figure = PARTS_FIGURE): VisualQuestion {
  const correct = fig.segments!.find((s) => s.kind === ask)!;
  const feedback: Record<string, FeedbackEntry> = {};
  for (const s of fig.segments!) {
    if (s.id === correct.id || !s.kind || s.kind === 'plain') continue;
    feedback[s.id] = { message: WHY[ask][s.kind] ?? `${s.id} is a ${s.kind}, not a ${ask}.`, refresherId: 'cir-parts', misconception: `${s.kind}_for_${ask}` };
  }
  return {
    kind: 'visual', id,
    prompt: `Tap the ${prettyKind[ask]} in the diagram.`,
    visual: circleVisual(fig, altForFigure('Choose one segment.', fig), { pick: true }),
    correctId: correct.id, feedback,
    defaultFeedback: { message: 'Tap one of the three highlighted segments.' },
    explanation: `${correct.id} is the ${ask}${ask === 'radius' ? ': one end is the centre O' : ask === 'diameter' ? ': it passes through O with both ends on the circle' : ': both ends are on the circle but it misses the centre'}.`,
  };
}

// ---------------------------------------------------------------------------
// Numeric families
// ---------------------------------------------------------------------------

/** Wrong-answer rules. A value that equals the answer is dropped; a value that repeats keeps its FIRST explanation. */
const ruleList = (answer: number, items: [number, string, string?][]): NumericRule[] => {
  const seen: number[] = [];
  const out: NumericRule[] = [];
  for (const [v, message, tag] of items) {
    if (Math.abs(v - answer) <= 0.011 || seen.some((x) => Math.abs(x - v) <= 0.011)) continue;
    seen.push(v);
    out.push({ values: [v], entry: { message, refresherId: undefined, misconception: tag } });
  }
  return out;
};

function num(id: string, prompt: string, visual: VisualRef | undefined, answer: number, rules: NumericRule[], fallback: FeedbackEntry, explanation: string, unit?: string): NumericQuestion {
  return { kind: 'numeric', id, prompt, visual, answer, tolerance: 0.011, unit, rules, defaultFeedback: fallback, explanation };
}

const withRef = (rules: NumericRule[], refresherId: string): NumericRule[] => rules.map((r) => ({ ...r, entry: { ...r.entry, refresherId } }));

/** Radius -> diameter and back. */
export function diameterQ(id: string, r: number): NumericQuestion {
  const fig: Figure = { r, points: [{ id: 'A', angle: 0 }, { id: 'B', angle: 180 }], segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'diameter' }, { id: 'OA', from: 'O', to: 'A', kind: 'radius' }] };
  const d = 2 * r;
  return num(id, `The radius of this circle is ${r} cm. How long is the diameter AB?`, circleVisual(fig, altForFigure(`The radius OA is ${r} cm.`, fig), { highlight: ['AB'] }), d,
    withRef(ruleList(d, [[r, `${r} is the radius. The diameter crosses the whole circle through O, so it is two radii end to end.`, 'radius_for_diameter'], [r / 2, `Half the radius is too small. The diameter is TWICE the radius, not half.`, 'halved_not_doubled'], [Math.PI * d, 'That is the circumference (distance round the circle). The diameter is the straight distance across.', 'circumference_for_diameter']]), 'cir-parts'),
    { message: 'The diameter is two radii laid end to end: diameter = 2 × radius.', refresherId: 'cir-parts' },
    `Diameter = 2 × ${r} = ${d} cm.`, 'cm');
}

/** Perpendicular distance from the centre to a chord, from r and L (Pythagoras). */
export function chordDistanceQ(id: string, r: number, L: number): NumericQuestion {
  const fig = chordFigure(r, L);
  const half = L / 2;
  const d = Math.sqrt(r * r - half * half);
  return num(id, `A chord AB of length ${L} cm lies in a circle of radius ${r} cm. How far is the chord from the centre O? (Distance means the perpendicular distance OM.)`,
    circleVisual(fig, altForFigure(`Chord AB is ${L} cm long and the radius is ${r} cm. OM is perpendicular to AB.`, fig), { highlight: ['OM'] }), d,
    withRef(ruleList(d, [
      [half, `${half} is half the chord, AM. We want OM. Use the right triangle OMA: OM² = OA² − AM².`, 'used_half_chord'],
      [r - half, 'Subtracting lengths does not work in a right triangle. Use squares: OM² = r² − (half the chord)².', 'subtracted_lengths'],
      [Math.sqrt(Math.abs(r * r - L * L)), `Use HALF the chord in the right triangle, not the whole chord: AM = ${half}.`, 'forgot_half_chord'],
      [r * r - half * half, `${fmt(r * r - half * half)} is OM². Take the square root to get OM.`, 'forgot_square_root'],
    ]), 'cir-chord-dist'),
    { message: 'The perpendicular from the centre bisects the chord, giving a right triangle OMA with hypotenuse OA = r. Find OM with the Pythagoras theorem.', refresherId: 'cir-chord-dist' },
    `AM = ${half}. OM² = ${r}² − ${half}² = ${r * r - half * half}, so OM = ${fmt(d)} cm.`, 'cm');
}

/** Chord length from r and the perpendicular distance d. */
export function chordLengthQ(id: string, r: number, d: number): NumericQuestion {
  const half = Math.sqrt(r * r - d * d);
  const L = 2 * half;
  const fig = chordFigure(r, L);
  return num(id, `A chord is ${d} cm from the centre of a circle of radius ${r} cm. How long is the chord?`,
    circleVisual(fig, altForFigure(`The chord AB is ${d} cm from O (OM = ${d}); the radius is ${r} cm.`, fig), { highlight: ['OM'] }), L,
    withRef(ruleList(L, [
      [half, `${fmt(half)} is only half the chord (AM). The perpendicular bisects the chord, so double it.`, 'forgot_doubling'],
      [half * half, `${fmt(half * half)} is AM². Take the square root, then double it.`, 'forgot_square_root'],
      [2 * r, 'That is the diameter, the longest chord. This chord is not through the centre.', 'diameter_for_chord'],
    ]), 'cir-chord-dist'),
    { message: 'Use the right triangle OMA: AM² = r² − d². Then the chord AB = 2 × AM.', refresherId: 'cir-chord-dist' },
    `AM² = ${r}² − ${d}² = ${r * r - d * d}, AM = ${fmt(half)}, so AB = ${fmt(L)} cm.`, 'cm');
}

/** Central angle from an inscribed angle (or the other way). */
export function centralFromInscribedQ(id: string, central: number): NumericQuestion {
  const fig = arcFigure(5, central);
  const ins = central / 2;
  return num(id, `In the diagram, ∠APB = ${fmt(angleAt(fig, 'A', 'P', 'B'))}°. What is the central angle ∠AOB?`,
    circleVisual(fig, altForFigure(`The angle APB at the circle is ${fmt(ins)}°.`, fig), { highlight: ['AOB', 'APB'] }), central,
    withRef(ruleList(central, [[ins, `That is the same as ∠APB. The angle at the centre is DOUBLE the angle at the circle, so multiply by 2.`, 'angles_equal'], [ins / 2, 'You halved it. The centre angle is bigger: double the angle at the circle.', 'halved_wrong_way'], [180 - ins, 'The angles do not add to 180° here. The centre angle is twice the angle at the circle.', 'supplementary_confusion']]), 'cir-inscribed'),
    { message: 'The angle at the centre is twice the angle at the circle on the same arc: ∠AOB = 2 × ∠APB.', refresherId: 'cir-inscribed' },
    `∠AOB = 2 × ${fmt(ins)}° = ${fmt(central)}°.`, '°');
}

export function inscribedFromCentralQ(id: string, central: number): NumericQuestion {
  const fig = arcFigure(5, central);
  const ins = central / 2;
  return num(id, `In the diagram the central angle ∠AOB = ${fmt(angleAt(fig, 'A', 'O', 'B'))}°. What is ∠APB, with P on the major arc?`,
    circleVisual(fig, altForFigure(`The central angle AOB is ${fmt(central)}°.`, fig), { highlight: ['AOB', 'APB'] }), ins,
    withRef(ruleList(ins, [[central, 'That equals the centre angle. The angle at the circle is only HALF of it.', 'angles_equal'], [central * 2, 'You doubled it. The angle at the circle is smaller: half of the centre angle.', 'doubled_wrong_way'], [180 - central / 2, 'The angle on the major arc side is half the central angle, not its supplement.', 'supplementary_confusion']]), 'cir-inscribed'),
    { message: 'The angle at the circle is half the angle at the centre: ∠APB = ½ × ∠AOB.', refresherId: 'cir-inscribed' },
    `∠APB = ${fmt(central)}° ÷ 2 = ${fmt(ins)}°.`, '°');
}

/** Two points P and Q on the major arc of chord AB. */
export function sameSegmentFigure(ang: number): Figure {
  const base = arcFigure(5, ang * 2, 250);
  return {
    ...base,
    points: [...base.points, { id: 'Q', angle: 300 }],
    segments: [...base.segments!, { id: 'QA', from: 'Q', to: 'A', kind: 'chord' }, { id: 'QB', from: 'Q', to: 'B', kind: 'chord' }],
    angles: [{ id: 'APB', a: 'A', v: 'P', b: 'B' }, { id: 'AQB', a: 'A', v: 'Q', b: 'B' }],
  };
}

/** Angles in the same segment are equal. */
export function sameSegmentQ(id: string, ang: number): NumericQuestion {
  const fig = sameSegmentFigure(ang);
  return num(id, `P and Q are on the same side of chord AB, and \u2220APB = ${fmt(angleAt(fig, 'A', 'P', 'B'))}\u00B0. What is \u2220AQB?`,
    circleVisual(fig, altForFigure(`P and Q lie on the major arc. Angle APB is ${fmt(ang)}\u00B0.`, fig), { highlight: ['APB', 'AQB'] }), ang,
    withRef(ruleList(ang, [[ang * 2, 'That is the angle at the centre. Both P and Q are on the circle: their angles on the same arc are equal.', 'centre_angle_for_circle_angle'], [180 - ang, 'Angles in the same segment are EQUAL, not supplementary.', 'supplementary_confusion'], [ang / 2, 'Angles at points on the same arc are equal; they are not halved.', 'halved_wrong_way']]), 'cir-segment'),
    { message: 'Both angles stand on the same arc AB, from points on the same side, so they are equal.', refresherId: 'cir-segment' },
    `\u2220AQB = \u2220APB = ${fmt(ang)}\u00B0.`, '\u00B0');
}

/** Cyclic quadrilateral opposite angles. */
export function cyclicFigure(a: number): Figure {
  // ABCD in order around the circle; angle at A (sees arc BCD) = a, so arc BCD = 2a, arc DAB = 360 - 2a.
  // Place D at 90, B/D split the arcs: A at 90, then going counter-clockwise B, C, D.
  const arcBCD = 2 * a; // arc not containing A
  const B = 90 + 70, D = B + arcBCD; // D is arcBCD further round; C between them
  const C = B + arcBCD * 0.45;
  return {
    r: 5,
    points: [{ id: 'A', angle: 90 }, { id: 'B', angle: B }, { id: 'C', angle: C }, { id: 'D', angle: D }],
    segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'chord' }, { id: 'BC', from: 'B', to: 'C', kind: 'chord' }, { id: 'CD', from: 'C', to: 'D', kind: 'chord' }, { id: 'DA', from: 'D', to: 'A', kind: 'chord' }],
    angles: [{ id: 'DAB', a: 'D', v: 'A', b: 'B' }, { id: 'BCD', a: 'B', v: 'C', b: 'D' }, { id: 'ABC', a: 'A', v: 'B', b: 'C' }, { id: 'CDA', a: 'C', v: 'D', b: 'A' }],
  };
}

export function oppositeAngleQ(id: string, a: number, ask: 'C' | 'D' = 'C'): NumericQuestion {
  const fig = cyclicFigure(a);
  const known = ask === 'C' ? angleAt(fig, 'D', 'A', 'B') : angleAt(fig, 'A', 'B', 'C');
  const answer = 180 - known;
  const askId = ask === 'C' ? '∠BCD' : '∠CDA';
  const knownId = ask === 'C' ? '∠DAB' : '∠ABC';
  return num(id, `ABCD is a cyclic quadrilateral with ${knownId} = ${fmt(known)}°. What is ${askId}, the angle opposite it?`,
    circleVisual(fig, altForFigure(`ABCD is inscribed in the circle in that order.`, fig), { highlight: [ask === 'C' ? 'DAB' : 'ABC', ask === 'C' ? 'BCD' : 'CDA'] }), answer,
    withRef(ruleList(answer, [[known, 'Opposite angles of a cyclic quadrilateral are not equal (unless both are 90°). They add up to 180°.', 'opposite_equal'], [360 - known, '360° is the sum of all four angles. Just the OPPOSITE pair adds to 180°.', 'used_360'], [90, 'Opposite angles add up to 180° but are not each 90° unless the figure is special.', 'assumed_right']]), 'cir-cyclic'),
    { message: 'The two angles opposite each other in a cyclic quadrilateral add up to 180°.', refresherId: 'cir-cyclic' },
    `${askId} = 180° − ${fmt(known)}° = ${fmt(answer)}°.`, '°');
}

/** Angle in a semicircle, as a missing angle of a triangle on a diameter. */
export function semicircleQ(id: string, angleA: number): NumericQuestion {
  // AB is a diameter (A at 180, B at 0); C on the circle so that angle at A equals angleA.
  const cAngle = 2 * angleA; // inscribed at A over arc BC (central 2*angleA) -> C at angle 2*angleA measured from B
  const fig: Figure = {
    r: 5,
    points: [{ id: 'A', angle: 180 }, { id: 'B', angle: 0 }, { id: 'C', angle: cAngle }],
    segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'diameter' }, { id: 'AC', from: 'A', to: 'C', kind: 'chord' }, { id: 'BC', from: 'B', to: 'C', kind: 'chord' }],
    angles: [{ id: 'BAC', a: 'B', v: 'A', b: 'C' }, { id: 'ACB', a: 'A', v: 'C', b: 'B' }],
    rightAngles: [['A', 'C', 'B']],
  };
  const measuredA = angleAt(fig, 'B', 'A', 'C');
  const ans = 90 - measuredA;
  return num(id, `AB is a diameter and C is on the circle. ∠BAC = ${fmt(measuredA)}°. Find ∠ABC.`,
    circleVisual(fig, altForFigure('AB is a diameter; C is on the circle.', fig), { highlight: ['BAC'] }), ans,
    withRef(ruleList(ans, [[90, 'That is ∠ACB, the angle in the semicircle. We want the angle at B.', 'asked_other_angle'], [180 - measuredA, 'A triangle’s angles add to 180°, and one of them is 90°, so the other two add to 90°.', 'forgot_right_angle'], [measuredA, 'The two acute angles are not equal here; together they make 90°.', 'assumed_isosceles']]), 'cir-segment'),
    { message: 'The angle in a semicircle is 90°, so the other two angles of the triangle add to 90°.', refresherId: 'cir-segment' },
    `∠ACB = 90°, so ∠ABC = 90° − ${fmt(measuredA)}° = ${fmt(ans)}°.`, '°');
}

/** Equal chords subtend equal angles at the centre. */
export function equalChordsFigure(central: number): Figure {
  const half = central / 2;
  return {
    r: 5,
    points: [{ id: 'A', angle: 90 + half }, { id: 'B', angle: 90 - half }, { id: 'D', angle: 270 + half }, { id: 'E', angle: 270 - half }],
    segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'chord' }, { id: 'DE', from: 'D', to: 'E', kind: 'chord' }, { id: 'OA', from: 'O', to: 'A', kind: 'radius' }, { id: 'OB', from: 'O', to: 'B', kind: 'radius' }, { id: 'OD', from: 'O', to: 'D', kind: 'radius' }, { id: 'OE', from: 'O', to: 'E', kind: 'radius' }],
    angles: [{ id: 'AOB', a: 'A', v: 'O', b: 'B' }, { id: 'DOE', a: 'D', v: 'O', b: 'E' }],
    equalMarks: [['A', 'B'], ['D', 'E']],
  };
}

export function equalChordAngleQ(id: string, central: number): NumericQuestion {
  const fig = equalChordsFigure(central);
  const known = angleAt(fig, 'A', 'O', 'B');
  return num(id, `Chords AB and DE are equal in length, and ∠AOB = ${fmt(known)}°. What is ∠DOE?`,
    circleVisual(fig, altForFigure('Chords AB and DE have equal length.', fig), { highlight: ['AOB', 'DOE'] }), known,
    withRef(ruleList(known, [[known / 2, 'Equal chords subtend EQUAL angles at the centre, not half.', 'halved_wrong_way'], [180 - known, 'The two angles are equal, not supplementary.', 'supplementary_confusion'], [known * 2, 'The two central angles are equal; do not double.', 'doubled_wrong_way']]), 'cir-equal-chords'),
    { message: 'Equal chords subtend equal angles at the centre, so ∠DOE equals ∠AOB.', refresherId: 'cir-equal-chords' },
    `∠DOE = ∠AOB = ${fmt(known)}°.`, '°');
}

// ---------------------------------------------------------------------------
// Choice helper
// ---------------------------------------------------------------------------

export function pick(id: string, prompt: string, options: [string, string | null, string?][], explanation: string, visual?: VisualRef, refresherId?: string): ChoiceQuestion {
  const opts = options.map(([text], i) => ({ id: `o${i}`, text }));
  const correct = options.findIndex(([, why]) => why === null);
  const feedback: Record<string, FeedbackEntry> = {};
  options.forEach(([, why, tag], i) => { if (why !== null) feedback[`o${i}`] = { message: why, refresherId, misconception: tag }; });
  return { kind: 'choice', id, prompt, visual, options: opts, correctId: `o${correct}`, feedback, explanation };
}


// ---------------------------------------------------------------------------
// Symmetry: positions on the circle are angles measured anticlockwise from the
// right-hand end of the horizontal diameter.
// ---------------------------------------------------------------------------

export function symmetryFigure(start: number, extra: Partial<Figure> = {}): Figure {
  return {
    r: 5,
    points: [{ id: 'P', angle: start }],
    segments: [{ id: 'OP', from: 'O', to: 'P', kind: 'radius' }],
    ...extra,
  };
}

export function rotateQ(id: string, start: number, by: number): NumericQuestion {
  const ans = norm360(start + by);
  const fig = symmetryFigure(start);
  return num(id, `Point P is at ${start}\u00B0 (measured anticlockwise from the right-hand end of the horizontal diameter). The whole circle is turned ${by}\u00B0 anticlockwise about O. Where is P now? Give an angle from 0\u00B0 to 360\u00B0.`,
    circleVisual(fig, altForFigure(`P starts at ${start}\u00B0.`, fig)), ans,
    withRef(ruleList(ans, [[by, `${by}\u00B0 is only the turn. P did not start at 0\u00B0: add the turn to P\u2019s starting angle ${start}\u00B0.`, 'forgot_start'], [norm360(start - by), 'Anticlockwise turning ADDS to the angle. You subtracted.', 'wrong_direction']]), 'cir-sym-rot'),
    { message: 'A turn about the centre adds to the angle: new angle = start + turn.', refresherId: 'cir-sym-rot' },
    `${start}\u00B0 + ${by}\u00B0 = ${ans}\u00B0.`, '\u00B0');
}

export function reflectQ(id: string, start: number, axis: 0 | 90): NumericQuestion {
  const ans = reflectAngle(start, axis);
  const fig = symmetryFigure(start, { segments: [{ id: 'OP', from: 'O', to: 'P', kind: 'radius' }, { id: 'axis', from: axis === 0 ? 'X1' : 'Y1', to: axis === 0 ? 'X2' : 'Y2', kind: 'plain' }], points: [{ id: 'P', angle: start }, ...(axis === 0 ? [{ id: 'X1', angle: 0 }, { id: 'X2', angle: 180 }] : [{ id: 'Y1', angle: 90 }, { id: 'Y2', angle: 270 }])] });
  const other = reflectAngle(start, axis === 0 ? 90 : 0);
  return num(id, `Point P is at ${start}\u00B0. The circle is reflected in its ${axis === 0 ? 'horizontal' : 'vertical'} diameter (the dashed line). Where does P land? Give an angle from 0\u00B0 to 360\u00B0.`,
    circleVisual(fig, altForFigure(`The ${axis === 0 ? 'horizontal' : 'vertical'} diameter is dashed; P is at ${start}\u00B0.`, fig), { hideLabels: ['X1', 'X2', 'Y1', 'Y2'] }), ans,
    withRef(ruleList(ans, [[other, `That is the position after reflecting in the OTHER diameter (${axis === 0 ? 'vertical' : 'horizontal'}). Check which line you fold along.`, 'wrong_axis'], [start, 'A reflection moves P to the other side of the line, so it does not stay where it is.', 'no_change'], [-ans, 'Give the angle between 0\u00B0 and 360\u00B0; negative angles describe the same direction a different way.', 'negative_angle']]), 'cir-sym-line'),
    { message: `Reflecting in the ${axis === 0 ? 'horizontal' : 'vertical'} diameter sends angle \u03B8 to ${axis === 0 ? '360\u00B0 \u2212 \u03B8' : '180\u00B0 \u2212 \u03B8'}.`, refresherId: 'cir-sym-line' },
    `The mirror image of ${start}\u00B0 is ${ans}\u00B0.`, '\u00B0');
}
