/**
 * Circles, Class 9: original Learn lessons (EDU-1).
 *
 * Aligned to NCERT Ganita Manjari Grade 9 Part I, Chapter 5
 * "I'm Up and Down, and Round and Round": 5.1 Definitions, 5.2 Symmetries of a
 * Circle, 5.3 How Many Circles? (Theorem 1), 5.4 Chords and the Angles They
 * Subtend (Theorems 2 and 3), 5.5 Midpoints and Perpendicular Bisectors of
 * Chords (Theorems 4 and 5), 5.6 Distance of Chords from the Centre (Theorems
 * 6 to 8), 5.7 Angles Subtended by an Arc (Theorem 9), 5.8 Concyclicity of
 * Points (Theorems 10 to 12). Wording, figures and questions are original.
 * The LabVerse lesson order differs slightly from the book's (midpoints come
 * before equal chords); each lesson says which section it follows.
 */

import type { EduChapter, EduLesson, ExplainerStep } from '../../../education/types';
import { arcFigure, chordFigure, type Figure } from './figure';
import { CIRCLES_PREREQUISITES, CIRCLES_UNITS } from './prerequisites';
import {
  PARTS_FIGURE, altForFigure, chordDistanceQ, chordLengthQ, centralFromInscribedQ, circleVisual, cyclicFigure, diameterQ, equalChordAngleQ, equalChordsFigure,
  inscribedFromCentralQ, oppositeAngleQ, partQ, pick, reflectQ, rotateQ, sameSegmentFigure, sameSegmentQ, semicircleQ, symmetryFigure,
} from './questions';

// ---------------------------------------------------------------------------
// Figures used by explainers and worked examples
// ---------------------------------------------------------------------------

const DRAG_P: Figure = { r: 5, points: [{ id: 'P', angle: 40 }], segments: [{ id: 'OP', from: 'O', to: 'P', kind: 'radius' }] };

const THREE: Figure = {
  r: 5,
  points: [{ id: 'A', angle: 90 }, { id: 'B', angle: 210 }, { id: 'C', angle: 330 }],
  segments: [
    { id: 'OA', from: 'O', to: 'A', kind: 'radius' }, { id: 'OB', from: 'O', to: 'B', kind: 'radius' }, { id: 'OC', from: 'O', to: 'C', kind: 'radius' },
    { id: 'OM', from: 'O', to: 'mid:A:B', kind: 'plain' }, { id: 'ON', from: 'O', to: 'mid:B:C', kind: 'plain' },
  ],
  rightAngles: [['O', 'mid:A:B', 'A'], ['O', 'mid:B:C', 'B']],
};

const CHORD_8 = chordFigure(5, 8);
const CHORD_DRAG = chordFigure(5, 8);

const HALF = Math.asin(3 / 5) * (180 / Math.PI); // chord of length 6 at distance 4
const TWO_CHORDS: Figure = {
  r: 5,
  points: [{ id: 'A', angle: 90 + (Math.asin(4 / 5) * 180) / Math.PI }, { id: 'B', angle: 90 - (Math.asin(4 / 5) * 180) / Math.PI }, { id: 'D', angle: 270 + HALF }, { id: 'E', angle: 270 - HALF }],
  segments: [
    { id: 'AB', from: 'A', to: 'B', kind: 'chord' }, { id: 'DE', from: 'D', to: 'E', kind: 'chord' },
    { id: 'OM', from: 'O', to: 'mid:A:B', kind: 'plain' }, { id: 'ON', from: 'O', to: 'mid:D:E', kind: 'plain' },
  ],
  rightAngles: [['O', 'mid:A:B', 'A'], ['O', 'mid:D:E', 'D']],
};

const ARC_80 = arcFigure(5, 80);
const A80 = 90 + 40, B80 = 90 - 40;

const PROOF_FIG: Figure = {
  r: 5,
  points: [{ id: 'A', angle: A80 }, { id: 'B', angle: B80 }, { id: 'P', angle: 270 }, { id: 'Q', angle: 90 }],
  segments: [
    { id: 'OA', from: 'O', to: 'A', kind: 'radius' }, { id: 'OB', from: 'O', to: 'B', kind: 'radius' }, { id: 'OP', from: 'O', to: 'P', kind: 'radius' }, { id: 'OQ', from: 'O', to: 'Q', kind: 'radius' },
    { id: 'PA', from: 'P', to: 'A', kind: 'chord' }, { id: 'PB', from: 'P', to: 'B', kind: 'chord' },
  ],
  angles: [
    { id: 'OPA', a: 'O', v: 'P', b: 'A' }, { id: 'OPB', a: 'O', v: 'P', b: 'B' }, { id: 'AOQ', a: 'A', v: 'O', b: 'Q' }, { id: 'BOQ', a: 'B', v: 'O', b: 'Q' },
    { id: 'AOB', a: 'A', v: 'O', b: 'B' }, { id: 'APB', a: 'A', v: 'P', b: 'B' },
  ],
};

const SAME = sameSegmentFigure(40);
const SEMI: Figure = {
  r: 5,
  points: [{ id: 'A', angle: 180 }, { id: 'B', angle: 0 }, { id: 'C', angle: 65 }],
  segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'diameter' }, { id: 'AC', from: 'A', to: 'C', kind: 'chord' }, { id: 'BC', from: 'B', to: 'C', kind: 'chord' }],
  angles: [{ id: 'ACB', a: 'A', v: 'C', b: 'B' }, { id: 'BAC', a: 'B', v: 'A', b: 'C' }, { id: 'ABC', a: 'A', v: 'B', b: 'C' }],
  rightAngles: [['A', 'C', 'B']],
};

const CYC = cyclicFigure(75);
const cycPt = (id: string) => CYC.points.find((p) => p.id === id)!.angle;
const CYC_LIMITS: Record<string, [number, number]> = { B: [cycPt('A') + 10, cycPt('C') - 10], D: [cycPt('C') + 10, cycPt('A') + 350] };
const CYC_PROOF: Figure = { ...CYC, arcs: [{ id: 'arcBCD', from: 'B', to: 'D' }, { id: 'arcDAB', from: 'D', to: 'B' }], angles: [{ id: 'DAB', a: 'D', v: 'A', b: 'B' }, { id: 'BCD', a: 'B', v: 'C', b: 'D' }] };
const CYC_82 = cyclicFigure(82);

const REVISE: Figure = { ...arcFigure(5, 100), segments: [...arcFigure(5, 100).segments!, { id: 'AB', from: 'A', to: 'B', kind: 'chord' }], angles: [{ id: 'AOB', a: 'A', v: 'O', b: 'B' }, { id: 'APB', a: 'A', v: 'P', b: 'B' }, { id: 'OAB', a: 'O', v: 'A', b: 'B' }] };

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

const L1: EduLesson = {
  id: 'circles-l1', unitId: 'unit-1-foundations', number: 1, title: 'Understanding a circle',
  objective: 'define a circle by equal distance from the centre, and tell a radius, a chord and a diameter apart.',
  prerequisiteIds: ['cpre-equal-distance'],
  steps: [
    {
      id: 'cir-def', title: 'Every point is the same distance away', phase: 'observe',
      paragraphs: ['Drag P round the circle. Watch the length OP. A circle is exactly the set of points that are the same distance from one fixed point, the centre O. That distance is the radius.'],
      visual: circleVisual(DRAG_P, altForFigure('A point P you can move round the circle. The length OP is shown under the diagram.', DRAG_P), { drag: ['P'], measureChords: [['O', 'P']] }),
      notice: 'OP never changes, however far round you move P.',
      check: pick('chk-def', 'P moves from one place on the circle to another. What happens to OP?', [
        ['It stays the same', null],
        ['It gets longer when P is higher up', 'Height does not matter. Every point on the circle is the same distance from O.'],
        ['It changes depending on the angle', 'The angle changes where P is, not how far it is from O.'],
      ], 'OP is always equal to the radius.', undefined, 'cir-def'),
    },
    {
      id: 'cir-parts', title: 'Radius, chord, diameter',
      paragraphs: ['A radius joins the centre to a point on the circle. A chord joins two points of the circle. A diameter is a chord that passes through the centre.', 'Because a diameter is two radii laid end to end, diameter = 2 × radius, and no chord is longer than a diameter.'],
      vocabulary: [{ term: 'radius', meaning: 'centre to circle' }, { term: 'chord', meaning: 'circle to circle' }, { term: 'diameter', meaning: 'a chord through the centre' }],
      visual: circleVisual(PARTS_FIGURE, altForFigure('Three segments: AB is a diameter, OC is a radius and CD is a chord.', PARTS_FIGURE)),
      misconception: { wrong: 'A diameter is not a chord, because chords never pass through the centre.', right: 'A diameter IS a chord: the special one that passes through the centre.' },
      check: pick('chk-parts', 'Which statement is true?', [
        ['Every diameter is a chord', null],
        ['Every chord is a diameter', 'A diameter must pass through the centre. Most chords do not.'],
        ['A radius is a chord', 'A radius has one end at the centre O, which is not on the circle, so it is not a chord.'],
      ], 'A diameter is the chord through the centre.', undefined, 'cir-parts'),
    },
  ],
  worked: {
    id: 'w-circ-l1', title: 'Naming the three segments', given: ['AB, OC and CD are drawn in the circle with centre O.'], ask: 'Which is the radius, which the chord, which the diameter?',
    visual: circleVisual(PARTS_FIGURE, altForFigure('Three segments in a circle.', PARTS_FIGURE)),
    steps: [
      { text: 'AB has both ends on the circle and passes through O: it is a diameter.', why: 'A diameter is a chord through the centre.' },
      { text: 'OC has one end at O and one on the circle: it is a radius.', why: 'A radius runs from the centre to the circle.' },
      { text: 'CD has both ends on the circle but misses O: it is a chord that is not a diameter.', why: 'A chord only needs both ends on the circle.' },
    ],
    verify: 'AB is the longest of the three, as a diameter should be.',
  },
  guided: {
    id: 'g-circ-l1', prompt: 'Work out which segment is which, then use the rule diameter = 2 × radius.',
    steps: [
      { id: 'g1', prompt: 'Start with the segment that passes through the centre.', question: partQ('g-circ-l1-1', 'diameter'), hints: ['A diameter passes through O and has both ends on the circle.'] },
      { id: 'g2', prompt: 'Now the segment with one end at O.', question: partQ('g-circ-l1-2', 'radius'), hints: ['One end must be the centre.'] },
      { id: 'g3', prompt: 'Use the rule.', question: diameterQ('g-circ-l1-3', 4), hints: ['Two radii make a diameter.'] },
    ],
    conclusion: 'A diameter is a chord through the centre, equal to two radii.',
  },
  independent: [
    { id: 'i1', topic: 'Parts of a circle', prompt: 'Look at the figure.', question: partQ('circles-l1-i1', 'chord'), hints: ['A chord has both ends on the circle. Which one misses the centre?'], solution: ['CD has both ends on the circle.', 'It does not pass through O, so it is a chord and not the diameter.'] },
    { id: 'i2', topic: 'Parts of a circle', prompt: 'Look at the figure.', question: partQ('circles-l1-i2', 'radius'), hints: ['A radius touches the centre.'], solution: ['OC starts at the centre O.'] },
    { id: 'i3', topic: 'Diameter and radius', prompt: 'Use diameter = 2 × radius.', question: diameterQ('circles-l1-i3', 6.5), hints: ['Double the radius.'], solution: ['2 × 6.5 = 13 cm.'] },
  ],
  reflection: {
    discover: 'A circle is all points at one distance from the centre; a diameter is the longest chord and equals two radii.',
    evidence: 'You moved a point round the circle and saw OP stay constant, then named radius, chord and diameter.',
    stillConfusing: [{ text: 'Is a diameter a chord?', refresherId: 'cir-parts' }, { text: 'Why is OP always the same?', refresherId: 'cir-def' }],
  },
};

const L2_FIG = symmetryFigure(30, { points: [{ id: 'P', angle: 30 }, { id: 'P2', angle: 150 }, { id: 'Y1', angle: 90 }, { id: 'Y2', angle: 270 }], segments: [{ id: 'OP', from: 'O', to: 'P', kind: 'radius' }, { id: 'OP2', from: 'O', to: 'P2', kind: 'radius' }, { id: 'axis', from: 'Y1', to: 'Y2', kind: 'plain' }] });
const L2: EduLesson = {
  id: 'circles-l2', unitId: 'unit-1-foundations', number: 2, title: 'Symmetry of a circle',
  objective: 'explain why a circle looks the same after any turn about its centre or any fold along a diameter.',
  prerequisiteIds: ['cpre-equal-distance'],
  steps: [
    {
      id: 'cir-sym-rot', title: 'Turn it and nothing changes',
      paragraphs: ['Turn a circle about its centre by any angle. Every point moves to another point of the same circle, because it is still the same distance from O.', 'So a circle has rotational symmetry about O for every angle. A turn adds to a point’s position round the circle: a point at 30° turned by 50° is at 80°.'],
      visual: circleVisual(DRAG_P, altForFigure('A point P you can move round the circle.', DRAG_P), { drag: ['P'], measureChords: [['O', 'P']] }),
      notice: 'Moving P is the same as turning the whole circle: OP stays the same.',
    },
    {
      id: 'cir-sym-line', title: 'Fold along any diameter',
      paragraphs: ['Fold the circle along any diameter and the two halves match exactly. In the picture, P and its mirror image P2 are the same distance from O and the dashed diameter.', 'A circle has a line of symmetry along EVERY diameter, so it has infinitely many lines of symmetry.'],
      visual: circleVisual(L2_FIG, altForFigure('P at 30° and its mirror image P2 at 150° across the vertical (dashed) diameter.', L2_FIG), { hideLabels: ['Y1', 'Y2'] }),
      misconception: { wrong: 'A circle has just four lines of symmetry, like a square.', right: 'Every diameter is a line of symmetry, and there are infinitely many diameters.' },
      check: pick('chk-sym', 'How many lines of symmetry does a circle have?', [
        ['4', 'A square has 4. For a circle, EVERY diameter is a line of symmetry.'],
        ['Infinitely many', null],
        ['1', 'You can fold a circle along any diameter, and there are as many as you like.'],
      ], 'Every diameter works, so infinitely many.', undefined, 'cir-sym-line'),
    },
  ],
  worked: {
    id: 'w-circ-l2', title: 'Where does a turn send P?', given: ['P is at 40° round the circle.', 'The circle is turned 70° anticlockwise about O.'], ask: 'Where is P afterwards?',
    visual: circleVisual(symmetryFigure(40), altForFigure('P starts at 40°.', symmetryFigure(40))),
    steps: [{ text: 'A turn about O adds to the angle: 40° + 70°.', why: 'Anticlockwise is the direction angles grow.' }, { text: 'P is now at 110°.', why: 'It is still on the circle, the same distance from O.' }],
    verify: 'Turning back by 70° returns P to 40°.',
  },
  guided: {
    id: 'g-circ-l2', prompt: 'Find the image of P under a turn and under a fold.',
    steps: [
      { id: 'g1', prompt: 'First the turn.', question: rotateQ('g-circ-l2-1', 25, 60), hints: ['Add the turn to the start angle.'] },
      { id: 'g2', prompt: 'Now a reflection in the horizontal diameter.', question: reflectQ('g-circ-l2-2', 40, 0), hints: ['Reflecting in the horizontal diameter sends θ to 360° − θ.'] },
    ],
    conclusion: 'A turn adds to the angle; a fold across a diameter reflects it.',
  },
  independent: [
    { id: 'i1', topic: 'Rotation symmetry', prompt: 'Turn the circle.', question: rotateQ('circles-l2-i1', 30, 100), hints: ['Add the turn.'], solution: ['30° + 100° = 130°.'] },
    { id: 'i2', topic: 'Reflection symmetry', prompt: 'Fold along the vertical diameter.', question: reflectQ('circles-l2-i2', 50, 90), hints: ['Reflecting in the vertical diameter sends θ to 180° − θ.'], solution: ['180° − 50° = 130°.'] },
    { id: 'i3', topic: 'Lines of symmetry', prompt: 'Think about every diameter.', question: pick('circles-l2-i3', 'Which is true of a circle?', [['It has a line of symmetry along every diameter', null], ['It is only symmetric about a horizontal diameter', 'Any diameter, at any angle, is a line of symmetry.'], ['It has no symmetry', 'A circle is the most symmetric shape: it matches itself after every turn and every fold along a diameter.']], 'Every diameter is a line of symmetry.', undefined, 'cir-sym-line'), hints: ['Try folding along different diameters.'], solution: ['Fold along any diameter: the halves match.', 'So every diameter is a line of symmetry.'] },
  ],
  reflection: {
    discover: 'A circle matches itself after any turn about its centre and any fold along a diameter.',
    evidence: 'You turned P and reflected it and kept it on the circle each time.',
    stillConfusing: [{ text: 'How many lines of symmetry?', refresherId: 'cir-sym-line' }],
  },
};

const L3: EduLesson = {
  id: 'circles-l3', unitId: 'unit-1-foundations', number: 3, title: 'How many circles?',
  objective: 'say how many circles pass through one, two or three points, and find the centre from perpendicular bisectors.',
  prerequisiteIds: ['cpre-perp-bisector', 'cpre-equal-distance'],
  steps: [
    {
      id: 'cir-count', title: 'One point, two points, three points', phase: 'reasoning',
      paragraphs: ['Through ONE point you can draw infinitely many circles. Through TWO points there are still infinitely many: the centre can be any point on the perpendicular bisector of the segment joining them.', 'Through THREE points that are not in a straight line there is exactly one circle (Theorem 1 of the chapter). Through three points in a straight line there is none.'],
      visual: circleVisual(THREE, altForFigure('Three points A, B, C on a circle with centre O. The dashed lines from O meet AB and BC at right angles at their midpoints M and N.', THREE)),
      check: pick('chk-count', 'How many circles pass through two given points?', [['Exactly one', 'Two points do not fix a circle: the centre can be anywhere on their perpendicular bisector.'], ['Infinitely many', null], ['None', 'Two points always lie on many circles.']], 'The centre can be any point on the perpendicular bisector, so infinitely many.', undefined, 'cir-count'),
    },
    {
      id: 'cir-circumcentre', title: 'Finding the centre', phase: 'proof',
      paragraphs: ['Why is there only one circle through three points A, B, C that are not in a line? The centre must be equally far from A and B, and from B and C.'],
      proof: [
        { claim: 'The centre O lies on the perpendicular bisector of AB.', reason: 'Every point on that line is equally far from A and from B, and the centre of a circle through A and B is equally far from them (both distances are radii).', show: ['OM'] },
        { claim: 'The centre O also lies on the perpendicular bisector of BC.', reason: 'The same argument with B and C.', show: ['ON'] },
        { claim: 'OA = OB = OC.', reason: 'O is equally far from A and B, and equally far from B and C.', show: ['OA', 'OB', 'OC'] },
        { claim: 'There is only one such circle.', reason: 'Two bisectors that are not parallel meet at exactly one point. They are parallel only if A, B, C are in a line, and then no circle exists.', show: ['OM', 'ON'] },
      ],
      visual: circleVisual(THREE, altForFigure('Same figure: perpendicular bisectors of AB and BC meet at the centre O.', THREE)),
      misconception: { wrong: 'Any three points lie on a circle.', right: 'Three points lie on a circle unless they are in a straight line.' },
    },
  ],
  worked: {
    id: 'w-circ-l3', title: 'A circle through three points', given: ['A, B, C are not in a straight line.', 'The circle through them has radius 5 cm (OA = 5 cm).'], ask: 'How long are OB and OC, and how many circles are there?',
    visual: circleVisual(THREE, altForFigure('A circle through A, B, C with centre O.', THREE)),
    steps: [
      { text: 'OA, OB and OC are all radii of the same circle.', why: 'A, B and C are on the circle and O is its centre.' },
      { text: 'So OB = OC = OA = 5 cm.', why: 'All radii of a circle are equal.' },
      { text: 'There is exactly one circle through A, B, C.', why: 'Three points not in a line fix a unique circle (Theorem 1).' },
    ],
    verify: 'The centre is where the perpendicular bisectors of AB and BC meet, 5 cm from each point.',
  },
  guided: {
    id: 'g-circ-l3', prompt: 'Think about how many circles fit through different sets of points.',
    steps: [
      { id: 'g1', prompt: 'Three points in a triangle shape.', question: pick('g-circ-l3-1', 'A, B, C are three points NOT in a line. How many circles pass through all three?', [['Exactly one', null], ['Infinitely many', 'That is true for two points, but a third point (not in line) fixes the circle.'], ['None', 'A circle exists unless the three points are in a straight line.']], 'Exactly one.', undefined, 'cir-count'), hints: ['Two perpendicular bisectors meet at one point.'] },
      { id: 'g2', prompt: 'Now three points in a line.', question: pick('g-circ-l3-2', 'P, Q, R are in a straight line. Can a circle pass through all three?', [['No', null], ['Yes, exactly one', 'The perpendicular bisectors of PQ and QR are parallel, so they never meet: there is no centre.'], ['Yes, infinitely many', 'There are infinitely many circles through TWO points. Through three in a line there is none.']], 'The bisectors are parallel and never meet, so no centre exists.', undefined, 'cir-circumcentre'), hints: ['Where would the centre be?'] },
      { id: 'g3', prompt: 'Use equal radii.', question: { kind: 'numeric', id: 'g-circ-l3-3', prompt: 'A circle through A, B and C has centre O and OA = 6 cm. What is OC?', answer: 6, unit: 'cm', rules: [{ values: [12], entry: { message: '12 is the diameter. OC is a radius, the same length as OA.', refresherId: 'cir-parts', misconception: 'diameter_for_radius' } }, { values: [3], entry: { message: 'OC is a radius, the same as OA. Nothing halves it.', refresherId: 'cir-parts', misconception: 'halved_wrong_way' } }], defaultFeedback: { message: 'OA and OC are both radii of the same circle, so they are equal.', refresherId: 'cir-parts' }, explanation: 'All radii are equal: OC = OA = 6 cm.' }, hints: ['Both are radii.'] },
    ],
    conclusion: 'Three points not in a line fix exactly one circle; every radius of it is equal.',
  },
  independent: [
    { id: 'i1', topic: 'Circles through points', prompt: 'Count the circles.', question: pick('circles-l3-i1', 'How many circles pass through one given point?', [['Infinitely many', null], ['Exactly one', 'One point does not fix a circle: its centre and size can vary.'], ['Exactly two', 'There is no limit of two: you can choose any centre and radius.']], 'Infinitely many.', undefined, 'cir-count'), hints: ['Pick any other point as the centre.'], solution: ['Choose any centre and radius so the circle reaches the point.', 'There are infinitely many ways.'] },
    { id: 'i2', topic: 'Circles through points', prompt: 'Think about where the centre can be.', question: pick('circles-l3-i2', 'Where can the centre of a circle through A and B lie?', [['Anywhere on the perpendicular bisector of AB', null], ['Only at the midpoint of AB', 'The midpoint gives ONE such circle (AB as diameter). The centre can be elsewhere on the bisector too.'], ['Anywhere in the plane', 'The centre must be equally far from A and B, so it lies on their perpendicular bisector.']], 'Equal distance from A and B means on the perpendicular bisector.', undefined, 'cir-circumcentre'), hints: ['The centre is equally far from A and B.'], solution: ['The centre is the same distance from A and B.', 'Points like that lie on the perpendicular bisector of AB.'] },
    { id: 'i3', topic: 'Equal radii', prompt: 'Use equal radii.', question: { kind: 'numeric', id: 'circles-l3-i3', prompt: 'A circle passes through A, B and C. Its centre O is 7 cm from A. How far is O from B?', answer: 7, unit: 'cm', rules: [{ values: [14], entry: { message: '14 is a diameter. OB is a radius, equal to OA.', refresherId: 'cir-parts', misconception: 'diameter_for_radius' } }], defaultFeedback: { message: 'OA and OB are both radii, so they are equal.', refresherId: 'cir-parts' }, explanation: 'OB = OA = 7 cm.' }, hints: ['Both are radii of the same circle.'], solution: ['OB and OA are radii.', 'Radii are equal: OB = 7 cm.'] },
  ],
  reflection: {
    discover: 'Three points not in a line lie on exactly one circle, whose centre is where two perpendicular bisectors meet.',
    evidence: 'You followed a proof that links each claim to a part of the diagram.',
    stillConfusing: [{ text: 'Why is the centre on the bisector?', refresherId: 'cir-circumcentre' }, { text: 'What if the points are in a line?', refresherId: 'cir-count' }],
  },
};

const L4_PROOF: ExplainerStep = {
  id: 'cir-mid-proof', title: 'Why the perpendicular bisects the chord', phase: 'proof',
  paragraphs: ['Let AB be a chord and OM the perpendicular from the centre O to AB, meeting it at M. We want to show M is the midpoint, so AM = MB.'],
  proof: [
    { claim: 'OA = OB.', reason: 'Both are radii of the same circle.', show: ['OA', 'OB'] },
    { claim: 'Angle OMA = angle OMB = 90°.', reason: 'OM is perpendicular to AB (given).', show: ['OM'] },
    { claim: 'AM² = OA² − OM² and MB² = OB² − OM².', reason: 'Pythagoras theorem in the right triangles OMA and OMB.', show: ['OA', 'OM', 'OB'] },
    { claim: 'AM² = MB², so AM = MB.', reason: 'OA = OB (step 1) and the same OM appears in both; lengths are positive.', show: ['AB'] },
    { claim: 'M is the midpoint of AB.', reason: 'It splits AB into two equal parts.', show: ['AB'] },
  ],
  visual: circleVisual(CHORD_8, altForFigure('A chord AB with the perpendicular OM from the centre.', CHORD_8)),
};

const L4: EduLesson = {
  id: 'circles-l4', unitId: 'unit-2-chords', number: 4, title: 'Chords and midpoints',
  objective: 'use the fact that the perpendicular from the centre bisects a chord, and find a chord’s distance from the centre.',
  prerequisiteIds: ['cpre-triangles', 'cpre-perp-bisector'],
  steps: [
    {
      id: 'cir-mid-observe', title: 'Drag A and watch the halves', phase: 'observe',
      paragraphs: ['OM is drawn from the centre perpendicular to chord AB. Drag A. Compare AM and MB each time.'],
      visual: circleVisual(CHORD_DRAG, altForFigure('Chord AB with OM perpendicular to it. Drag A to change the chord.', CHORD_DRAG), { drag: ['A'], limits: { A: [50, 175] }, measureChords: [['A', 'mid:A:B'], ['mid:A:B', 'B']] }),
      notice: 'The two lengths stay equal for every chord you make.',
      check: pick('chk-mid', 'OM is perpendicular to chord AB at M. What do you notice about AM and MB?', [['They are equal', null], ['AM is longer', 'The readout shows AM and MB equal for every position of A.'], ['They depend on where A is', 'They change in size together but are always equal to each other.']], 'M is the midpoint of AB.', undefined, 'cir-mid-observe'),
    },
    L4_PROOF,
    {
      id: 'cir-chord-dist', title: 'Using it: the distance from the centre', phase: 'apply',
      paragraphs: ['Because AM is half the chord, the right triangle OMA has legs OM and half the chord and hypotenuse r (the radius).', 'So OM² = r² − (half the chord)². For r = 5 and chord 8: half = 4, OM² = 25 − 16 = 9, OM = 3.'],
      visual: circleVisual(CHORD_8, altForFigure('A chord 8 cm long in a circle of radius 5 cm.', CHORD_8), { highlight: ['OM', 'OA'] }),
      misconception: { wrong: 'OM = r − half the chord (5 − 4 = 1).', right: 'Lengths in a right triangle combine with squares: OM² = r² − (half chord)².' },
    },
  ],
  worked: {
    id: 'w-circ-l4', title: 'Distance of an 8 cm chord from the centre of a 5 cm circle', given: ['Radius r = 5 cm', 'Chord AB = 8 cm'], ask: 'How far is AB from O?',
    visual: circleVisual(CHORD_8, altForFigure('Chord AB of length 8 cm; the radius is 5 cm; OM is perpendicular.', CHORD_8), { highlight: ['OM'] }),
    steps: [
      { text: 'The perpendicular OM bisects AB, so AM = 8 ÷ 2 = 4 cm.', why: 'The perpendicular from the centre bisects the chord.' },
      { text: 'In right triangle OMA: OM² = OA² − AM² = 25 − 16 = 9.', why: 'Pythagoras theorem, with OA = r = 5.' },
      { text: 'OM = 3 cm.', why: 'Take the square root.' },
    ],
    verify: '3² + 4² = 5² matches the 3-4-5 right triangle.',
  },
  guided: {
    id: 'g-circ-l4', prompt: 'A chord is 24 cm long in a circle of radius 13 cm. Find its distance from the centre.',
    steps: [
      { id: 'g1', prompt: 'First find half the chord.', question: { kind: 'numeric', id: 'g-circ-l4-1', prompt: 'What is AM, half of the 24 cm chord?', answer: 12, unit: 'cm', rules: [{ values: [24], entry: { message: '24 is the whole chord. The perpendicular from the centre cuts it into two equal halves.', refresherId: 'cir-mid-proof', misconception: 'forgot_half_chord' } }], defaultFeedback: { message: 'M is the midpoint, so AM is half of AB.', refresherId: 'cir-mid-proof' }, explanation: '24 ÷ 2 = 12.' }, hints: ['The perpendicular bisects the chord.'] },
      { id: 'g2', prompt: 'Now the whole calculation.', question: chordDistanceQ('g-circ-l4-2', 13, 24), hints: ['OM² = 13² − 12².'] },
    ],
    conclusion: 'OM = √(169 − 144) = 5 cm.',
  },
  independent: [
    { id: 'i1', topic: 'Distance from the centre', prompt: 'A chord and a radius are given.', question: chordDistanceQ('circles-l4-i1', 17, 30), hints: ['Half the chord is 15.'], solution: ['AM = 15.', 'OM² = 17² − 15² = 64.', 'OM = 8 cm.'] },
    { id: 'i2', topic: 'Chord length from distance', prompt: 'A distance and a radius are given.', question: chordLengthQ('circles-l4-i2', 10, 6), hints: ['AM² = r² − d², then double.'], solution: ['AM² = 100 − 36 = 64, so AM = 8.', 'AB = 2 × 8 = 16 cm.'] },
    { id: 'i3', topic: 'Distance from the centre', prompt: 'Try another chord.', question: chordDistanceQ('circles-l4-i3', 5, 6), hints: ['Half the chord is 3.'], solution: ['AM = 3.', 'OM² = 25 − 9 = 16.', 'OM = 4 cm.'] },
  ],
  reflection: {
    discover: 'The perpendicular from the centre to a chord bisects it, and this makes a right triangle that gives the chord’s distance from the centre.',
    evidence: 'You compared the two halves while dragging, then followed a five-line proof using radii and the Pythagoras theorem.',
    stillConfusing: [{ text: 'Why are the halves equal?', refresherId: 'cir-mid-proof' }, { text: 'How do I find OM?', refresherId: 'cir-chord-dist' }],
  },
};

const L5: EduLesson = {
  id: 'circles-l5', unitId: 'unit-2-chords', number: 5, title: 'Equal chords and central angles',
  objective: 'explain why equal chords make equal angles at the centre, and use the converse.',
  prerequisiteIds: ['cpre-triangles'],
  steps: [
    {
      id: 'cir-equal-chords', title: 'Equal chords, equal angles', phase: 'reasoning',
      paragraphs: ['Chords AB and DE have the same length. Look at the triangles OAB and ODE. OA = OD and OB = OE (all radii), and AB = DE (given). Three pairs of equal sides make the triangles congruent, so the angles at O are equal.', 'The converse also holds: if two chords make equal angles at the centre, the chords are equal.'],
      visual: circleVisual(equalChordsFigure(80), altForFigure('Two equal chords AB and DE (equal tick marks) and the angles they make at the centre O.', equalChordsFigure(80)), { highlight: ['AOB', 'DOE'] }),
      notice: 'The tick marks show AB = DE. The two central angles are equal.',
      proof: [
        { claim: 'OA = OD and OB = OE.', reason: 'All radii of a circle are equal.', show: ['OA', 'OD', 'OB', 'OE'] },
        { claim: 'AB = DE.', reason: 'The chords are given to be equal.', show: ['AB', 'DE'] },
        { claim: 'Triangle OAB is congruent to triangle ODE.', reason: 'Three pairs of equal sides (SSS).', show: ['OA', 'OB', 'AB', 'OD', 'OE', 'DE'] },
        { claim: 'Angle AOB = angle DOE.', reason: 'Matching angles of congruent triangles are equal.', show: ['AOB', 'DOE'] },
      ],
      check: pick('chk-equal', 'Which fact gives OA = OD?', [['Both are radii of the same circle', null], ['The chords are equal', 'The chords being equal is a different fact (AB = DE). OA = OD comes from both being radii.'], ['The angles are equal', 'We want to PROVE the angles equal, so we cannot use that.']], 'All radii are equal.', undefined, 'cir-equal-chords'),
    },
  ],
  worked: {
    id: 'w-circ-l5', title: 'Equal chords, find the angle', given: ['Chords AB and DE are equal.', '∠AOB = 80°.'], ask: 'What is ∠DOE?',
    visual: circleVisual(equalChordsFigure(80), altForFigure('Chords AB and DE are equal; the angle AOB is 80°.', equalChordsFigure(80)), { highlight: ['AOB', 'DOE'] }),
    steps: [{ text: 'AB = DE, so the chords subtend equal angles at O.', why: 'Equal chords subtend equal angles at the centre.' }, { text: '∠DOE = ∠AOB = 80°.', why: 'The two central angles are equal, not related by any other factor.' }],
    verify: 'Both angles are drawn the same size in the diagram.',
  },
  guided: {
    id: 'g-circ-l5', prompt: 'Chords AB and DE are equal and ∠AOB = 60°.',
    steps: [
      { id: 'g1', prompt: 'Name the fact.', question: pick('g-circ-l5-1', 'Which fact tells you ∠DOE?', [['Equal chords subtend equal angles at the centre', null], ['The angle at the centre is twice the angle at the circle', 'That fact compares an angle at the centre with one on the circle. Here both angles are at the centre.'], ['Opposite angles of a cyclic quadrilateral add to 180°', 'There is no quadrilateral here. Both angles are central angles of equal chords.']], 'Equal chords, equal central angles.', undefined, 'cir-equal-chords'), hints: ['Both angles are at O.'] },
      { id: 'g2', prompt: 'Apply it.', question: equalChordAngleQ('g-circ-l5-2', 60), hints: ['The two angles are equal.'] },
    ],
    conclusion: '∠DOE = 60°.',
  },
  independent: [
    { id: 'i1', topic: 'Equal chords and angles', prompt: 'Use equal chords.', question: equalChordAngleQ('circles-l5-i1', 110), hints: ['Equal chords, equal central angles.'], solution: ['AB = DE.', 'So ∠DOE = ∠AOB = 110°.'] },
    { id: 'i2', topic: 'Equal chords and angles', prompt: 'Use equal chords.', question: equalChordAngleQ('circles-l5-i2', 50), hints: ['Do not halve or double.'], solution: ['∠DOE = ∠AOB = 50°.'] },
    { id: 'i3', topic: 'Converse', prompt: 'Think about the converse.', question: pick('circles-l5-i3', 'Two chords make equal angles at the centre. What can you say about the chords?', [['They are equal in length', null], ['They are parallel', 'Equal angles at the centre do not make chords parallel.'], ['Nothing', 'The converse of the theorem says they must be equal.']], 'Equal central angles give equal chords (the converse).', undefined, 'cir-equal-chords'), hints: ['Triangles OAB and ODE would have two equal sides and the same angle between them.'], solution: ['OA = OD, OB = OE, and the angle between them is equal.', 'The triangles are congruent, so the third sides AB = DE.'] },
  ],
  reflection: {
    discover: 'Equal chords make equal angles at the centre, and the other way round.',
    evidence: 'You used three pairs of equal sides to show two triangles congruent, then applied the result.',
    stillConfusing: [{ text: 'Why are the triangles congruent?', refresherId: 'cir-equal-chords' }],
  },
};

const L6: EduLesson = {
  id: 'circles-l6', unitId: 'unit-2-chords', number: 6, title: 'Distance of chords from the centre',
  objective: 'compare chords by their distance from the centre: equal chords are equally far, and a longer chord is closer.',
  prerequisiteIds: ['cpre-triangles'],
  steps: [
    {
      id: 'cir-dist-compare', title: 'Longer chord, shorter distance', phase: 'observe',
      paragraphs: ['In this circle (radius 5) chord AB is 8 long and chord DE is 6 long. The readout gives each length and its distance from the centre.'],
      visual: circleVisual(TWO_CHORDS, altForFigure('Two chords of different lengths with the perpendicular distances to the centre marked.', TWO_CHORDS), { measureChords: [['A', 'B'], ['D', 'E']], measureDistances: [['A', 'B'], ['D', 'E']] }),
      notice: 'The longer chord (8) is closer to the centre (3) than the shorter one (6, at 4).',
      check: pick('chk-dist', 'Which chord is closer to the centre?', [['The longer chord', null], ['The shorter chord', 'In the readout the 8-long chord is only 3 from O; the 6-long one is 4 away.'], ['They are the same distance', 'Only EQUAL chords are equally far from the centre.']], 'The longer chord is closer.', undefined, 'cir-dist-compare'),
    },
    {
      id: 'cir-dist-why', title: 'Why: Pythagoras again', phase: 'reasoning',
      paragraphs: ['For a chord of length L at distance d in a circle of radius r: d² = r² − (L/2)². The radius r is fixed.', 'So if L gets bigger, (L/2)² gets bigger, d² gets smaller, and the chord is closer to the centre. Two chords of the same length give the same d, so equal chords are equally far from the centre. The converse follows the same way.'],
      misconception: { wrong: 'A longer chord is farther from the centre, because it is bigger.', right: 'The longest chord, the diameter, passes THROUGH the centre: distance 0.' },
    },
  ],
  worked: {
    id: 'w-circ-l6', title: 'Which chord is nearer?', given: ['Radius 5. Chord AB = 8. Chord DE = 6.'], ask: 'Which chord is closer to O, and by how much?',
    visual: circleVisual(TWO_CHORDS, altForFigure('Two chords AB (8) and DE (6).', TWO_CHORDS), { highlight: ['OM', 'ON'] }),
    steps: [
      { text: 'For AB: d² = 25 − 16 = 9, so d = 3.', why: 'Half of 8 is 4; use Pythagoras with r = 5.' },
      { text: 'For DE: d² = 25 − 9 = 16, so d = 4.', why: 'Half of 6 is 3.' },
      { text: 'AB is closer, by 1 unit.', why: '3 < 4.' },
    ],
    verify: 'The longer chord has the smaller distance, as the theorem says.',
  },
  guided: {
    id: 'g-circ-l6', prompt: 'A circle has radius 10. A chord is 6 from the centre.',
    steps: [
      { id: 'g1', prompt: 'Find the chord.', question: chordLengthQ('g-circ-l6-1', 10, 6), hints: ['AM² = 100 − 36.'] },
      { id: 'g2', prompt: 'Compare with a nearer chord.', question: pick('g-circ-l6-2', 'Another chord is only 3 from the centre. Is it longer or shorter than the 16 cm chord?', [['Longer', null], ['Shorter', 'A chord nearer to the centre is LONGER. The diameter, through the centre, is the longest.'], ['The same', 'Only chords at the SAME distance are equal.']], 'Nearer to the centre means longer.', undefined, 'cir-dist-why'), hints: ['The diameter is at distance 0 and is the longest chord.'] },
    ],
    conclusion: 'Closer to the centre means longer.',
  },
  independent: [
    { id: 'i1', topic: 'Chord and distance', prompt: 'Compute the length.', question: chordLengthQ('circles-l6-i1', 13, 5), hints: ['AM² = 169 − 25 = 144.'], solution: ['AM = 12.', 'AB = 24 cm.'] },
    { id: 'i2', topic: 'Comparing chords', prompt: 'Compare two chords.', question: pick('circles-l6-i2', 'Chord P is 5 cm from the centre and chord Q is 3 cm from it, in the same circle. Which is longer?', [['Q', null], ['P', 'The chord farther from the centre is SHORTER.'], ['They are equal', 'Equal chords are equally far from the centre; these are at different distances.']], 'Q is nearer, so longer.', undefined, 'cir-dist-why'), hints: ['Nearer to the centre means longer.'], solution: ['Distances differ, so the chords differ.', 'The nearer one (Q) is longer.'] },
    { id: 'i3', topic: 'Equal chords', prompt: 'Think about equal chords.', question: pick('circles-l6-i3', 'Two chords of the same circle are equal in length. What is true of their distances from the centre?', [['They are equal', null], ['The shorter one is nearer', 'The chords are equal, so neither is shorter.'], ['One is nearer, one farther', 'Equal chords are equally far from the centre.']], 'Equal chords are equidistant from the centre.', undefined, 'cir-dist-why'), hints: ['d² = r² − (L/2)² depends only on L.'], solution: ['Same L gives the same d.'] },
  ],
  reflection: {
    discover: 'Equal chords are equally far from the centre, and a longer chord is closer to it.',
    evidence: 'You compared measured values, then saw the Pythagoras formula explain why.',
    stillConfusing: [{ text: 'Why does a longer chord come closer?', refresherId: 'cir-dist-why' }],
  },
};

const L7: EduLesson = {
  id: 'circles-l7', unitId: 'unit-3-angles', number: 7, title: 'Central and inscribed angles',
  objective: 'state and prove that the angle at the centre is double the angle at the circle, and use it.',
  prerequisiteIds: ['cpre-angles', 'cpre-triangles'],
  steps: [
    {
      id: 'cir-inscribed-observe', title: 'Drag P and compare', phase: 'observe',
      paragraphs: ['An arc AB subtends the angle AOB at the centre and the angle APB at a point P on the rest of the circle. Drag P along the major arc and watch the two angles and their ratio.'],
      visual: circleVisual(ARC_80, altForFigure('Arc AB with the angle at the centre (AOB) and the angle at P on the circle (APB). The ratio is shown below.', ARC_80), { drag: ['P'], limits: { P: [A80 + 8, B80 + 352] }, measureAngles: true, relations: [{ kind: 'ratio', a: 'AOB', b: 'APB' }], highlight: ['arcAB'] }),
      notice: 'The ratio stays 2.00 as P moves. That is a pattern, not yet a proof.',
    },
    {
      id: 'cir-inscribed', title: 'The conjecture', phase: 'conjecture',
      paragraphs: ['Conjecture: the angle that an arc makes at the centre is twice the angle it makes at any point of the circle outside that arc.', 'You saw it for one arc and many positions of P. A proof must show it for every circle and every arc.'],
      misconception: { wrong: 'It is true because the numbers I measured agree.', right: 'Measuring many examples makes a conjecture believable but a proof shows why it MUST hold.' },
      check: pick('chk-insc', 'The angle at the centre of an arc is 100°. What is the angle at a point on the major arc?', [['50°', null], ['100°', 'The angle at the circle is half of the one at the centre.'], ['200°', 'You doubled instead of halving. The circle angle is smaller.']], 'Half of 100° is 50°.', undefined, 'cir-inscribed'),
    },
    {
      id: 'cir-inscribed-proof', title: 'Proof (centre inside angle APB)', phase: 'proof',
      paragraphs: ['Draw the line from P through O to the circle again at Q. Let ∠OPA = α and ∠OPB = β. This proof covers the case where O lies inside ∠APB, as drawn.'],
      proof: [
        { claim: 'Draw PO and extend to Q on the circle.', reason: 'A construction: O is the centre, so OP and OQ are radii.', show: ['OP', 'OQ'] },
        { claim: 'Triangle OAP is isosceles, so ∠OAP = ∠OPA = α.', reason: 'OA = OP (radii), and angles opposite equal sides are equal.', show: ['OA', 'OP', 'OPA'] },
        { claim: '∠AOQ = α + α = 2α.', reason: '∠AOQ is an exterior angle of triangle OAP, equal to the two opposite interior angles.', show: ['AOQ', 'OPA'] },
        { claim: 'In the same way ∠BOQ = 2β.', reason: 'OB = OP, so triangle OBP is isosceles, then the exterior angle again.', show: ['OB', 'OP', 'OPB', 'BOQ'] },
        { claim: '∠AOB = 2α + 2β = 2(α + β) = 2∠APB.', reason: '∠AOB = ∠AOQ + ∠BOQ and ∠APB = α + β.', show: ['AOB', 'APB'] },
      ],
      visual: circleVisual(PROOF_FIG, altForFigure('Arc AB, point P on the major arc, and Q opposite P through the centre O.', PROOF_FIG), { showValues: true }),
      notice: 'When P is placed so that O is outside ∠APB, the diagram changes but the idea is the same.',
    },
  ],
  worked: {
    id: 'w-circ-l7', title: 'Finding an angle at the circle', given: ['The arc AB makes ∠AOB = 100° at the centre.'], ask: 'What is ∠APB at a point P on the major arc?',
    visual: circleVisual(arcFigure(5, 100), altForFigure('Arc AB with central angle 100°.', arcFigure(5, 100)), { highlight: ['AOB', 'APB'] }),
    steps: [{ text: 'The angle at the centre is double the angle at the circle.', why: 'The angle subtended by an arc at the centre is twice the angle at any point of the circle outside the arc.' }, { text: '∠APB = 100° ÷ 2 = 50°.', why: 'Divide by two.' }],
    verify: '2 × 50° = 100°, matching the central angle.',
  },
  guided: {
    id: 'g-circ-l7', prompt: 'Practise going both ways.',
    steps: [
      { id: 'g1', prompt: 'Centre to circle.', question: inscribedFromCentralQ('g-circ-l7-1', 80), hints: ['Halve it.'] },
      { id: 'g2', prompt: 'Circle to centre.', question: centralFromInscribedQ('g-circ-l7-2', 70), hints: ['Double it.'] },
    ],
    conclusion: 'Centre angle = 2 × circle angle.',
  },
  independent: [
    { id: 'i1', topic: 'Central and inscribed angle', prompt: 'Find the angle at the circle.', question: inscribedFromCentralQ('circles-l7-i1', 130), hints: ['Halve.'], solution: ['∠APB = 130° ÷ 2 = 65°.'] },
    { id: 'i2', topic: 'Central and inscribed angle', prompt: 'Find the angle at the centre.', question: centralFromInscribedQ('circles-l7-i2', 100), hints: ['Double.'], solution: ['∠AOB = 2 × 50° = 100°.'] },
    { id: 'i3', topic: 'Central and inscribed angle', prompt: 'Find the angle at the circle.', question: inscribedFromCentralQ('circles-l7-i3', 70), hints: ['Half of the centre angle.'], solution: ['70° ÷ 2 = 35°.'] },
  ],
  reflection: {
    discover: 'An arc makes an angle at the centre twice the angle it makes anywhere on the rest of the circle, and this can be proved with isosceles triangles.',
    evidence: 'You saw the ratio stay at 2 while dragging, then followed a proof step by step with each step highlighted in the diagram.',
    stillConfusing: [{ text: 'Why is measuring not a proof?', refresherId: 'cir-inscribed' }, { text: 'Which steps use radii?', refresherId: 'cir-inscribed-proof' }],
  },
};

const L8: EduLesson = {
  id: 'circles-l8', unitId: 'unit-3-angles', number: 8, title: 'Angles in the same segment',
  objective: 'explain why angles in the same segment are equal and why the angle in a semicircle is 90°.',
  prerequisiteIds: ['cpre-angles'],
  steps: [
    {
      id: 'cir-segment', title: 'Same arc, same angle', phase: 'reasoning',
      paragraphs: ['Take a chord AB and two points P and Q on the same side of it. Drag them and watch ∠APB and ∠AQB.', 'Each is half the angle the arc AB makes at the centre. Two halves of the same angle are equal.'],
      visual: circleVisual(SAME, altForFigure('Chord AB and two points P and Q on the major arc. The angles at P and Q are shown.', SAME), { drag: ['P', 'Q'], limits: { P: [(SAME.points[0].angle) + 8, SAME.points[1].angle + 352], Q: [(SAME.points[0].angle) + 8, SAME.points[1].angle + 352] }, measureAngles: true, relations: [{ kind: 'ratio', a: 'APB', b: 'AQB' }] }),
      notice: 'The ratio of the two angles stays 1.00, so they are equal.',
      check: pick('chk-seg', 'P and Q are on the same side of chord AB and ∠APB = 35°. What is ∠AQB?', [['35°', null], ['70°', 'That is the angle at the centre. P and Q are both on the circle.'], ['145°', 'Angles in the same segment are equal, not supplementary.']], 'Both are half of the same central angle.', undefined, 'cir-segment'),
    },
    {
      id: 'cir-semicircle', title: 'The angle in a semicircle', phase: 'apply',
      paragraphs: ['If AB is a diameter, the angle it makes at the centre is a straight angle, 180°. Half of that is 90°, so the angle at any point C on the circle is a right angle.', 'Drag C round the semicircle. ∠ACB stays 90°.'],
      visual: circleVisual(SEMI, altForFigure('AB is a diameter; C is a point on the semicircle; the angle at C is 90 degrees.', SEMI), { drag: ['C'], limits: { C: [8, 172] }, measureAngles: true }),
      misconception: { wrong: 'The angle in a semicircle changes as the point moves.', right: 'It is always 90°, whatever the position of C on the semicircle.' },
    },
  ],
  worked: {
    id: 'w-circ-l8', title: 'Using the angle in a semicircle', given: ['AB is a diameter and C is on the circle.', '∠BAC = 35°.'], ask: 'Find ∠ABC.',
    visual: circleVisual(semicircleQFig(35), altForFigure('AB is a diameter; the angle BAC is 35°.', semicircleQFig(35)), { highlight: ['BAC'] }),
    steps: [{ text: '∠ACB = 90°.', why: 'The angle in a semicircle is a right angle.' }, { text: '∠ABC = 180° − 90° − 35° = 55°.', why: 'The angles of triangle ABC add up to 180°.' }],
    verify: '35° + 55° + 90° = 180°.',
  },
  guided: {
    id: 'g-circ-l8', prompt: 'Apply the two facts.',
    steps: [
      { id: 'g1', prompt: 'Same segment.', question: sameSegmentQ('g-circ-l8-1', 36), hints: ['Both angles are halves of the same central angle.'] },
      { id: 'g2', prompt: 'Semicircle.', question: semicircleQ('g-circ-l8-2', 40), hints: ['The third angle is 90°.'] },
    ],
    conclusion: 'Angles on the same arc are equal; the angle in a semicircle is 90°.',
  },
  independent: [
    { id: 'i1', topic: 'Angles in the same segment', prompt: 'Same side, same arc.', question: sameSegmentQ('circles-l8-i1', 28), hints: ['They are equal.'], solution: ['∠AQB = ∠APB = 28°.'] },
    { id: 'i2', topic: 'Angle in a semicircle', prompt: 'A diameter and an angle.', question: semicircleQ('circles-l8-i2', 52), hints: ['One angle of the triangle is 90°.'], solution: ['∠ACB = 90°.', '∠ABC = 90° − 52° = 38°.'] },
    { id: 'i3', topic: 'Angles in the same segment', prompt: 'Opposite sides is different.', question: pick('circles-l8-i3', 'Which statement is correct?', [['Angles on the same side of a chord, standing on the same arc, are equal', null], ['Angles on opposite sides of a chord are equal', 'Opposite sides give angles that add to 180°, not equal ones.'], ['All angles in a circle are equal', 'Only angles standing on the same arc from the same side are equal.']], 'Same arc, same side: equal.', undefined, 'cir-segment'), hints: ['Which side are P and Q on?'], solution: ['The theorem needs the two points on the same side of the chord.'] },
  ],
  reflection: {
    discover: 'Angles on the same arc from the same side are equal, and an angle on a diameter is a right angle.',
    evidence: 'You dragged two points and saw their angles stay equal, and dragged C to see the right angle stay put.',
    stillConfusing: [{ text: 'Why are they equal?', refresherId: 'cir-segment' }, { text: 'Why 90°?', refresherId: 'cir-semicircle' }],
  },
};

function semicircleQFig(angleA: number): Figure {
  return { r: 5, points: [{ id: 'A', angle: 180 }, { id: 'B', angle: 0 }, { id: 'C', angle: 2 * angleA }], segments: [{ id: 'AB', from: 'A', to: 'B', kind: 'diameter' }, { id: 'AC', from: 'A', to: 'C', kind: 'chord' }, { id: 'BC', from: 'B', to: 'C', kind: 'chord' }], angles: [{ id: 'BAC', a: 'B', v: 'A', b: 'C' }, { id: 'ABC', a: 'A', v: 'B', b: 'C' }], rightAngles: [['A', 'C', 'B']] };
}

const L9: EduLesson = {
  id: 'circles-l9', unitId: 'unit-3-angles', number: 9, title: 'Cyclic quadrilaterals',
  objective: 'state and prove that opposite angles of a cyclic quadrilateral add to 180°, and use it.',
  prerequisiteIds: ['cpre-angles'],
  steps: [
    {
      id: 'cir-cyclic-observe', title: 'Drag B and D and add opposite angles', phase: 'observe',
      paragraphs: ['ABCD has all four corners on the circle. Drag B and D to change its shape and watch the readout for ∠DAB + ∠BCD.'],
      visual: circleVisual(CYC, altForFigure('A quadrilateral ABCD with all four corners on the circle. Opposite angles are measured.', CYC), { drag: ['B', 'D'], limits: CYC_LIMITS, measureAngles: true, relations: [{ kind: 'sum', a: 'DAB', b: 'BCD' }, { kind: 'sum', a: 'ABC', b: 'CDA' }] }),
      notice: 'Each pair of opposite angles keeps adding to 180°, however you reshape it.',
    },
    {
      id: 'cir-cyclic', title: 'The conjecture', phase: 'conjecture',
      paragraphs: ['Conjecture: in a cyclic quadrilateral, opposite angles add up to 180°.', 'The readout supports it for these shapes. To be sure it holds for every cyclic quadrilateral we need a proof.'],
      check: pick('chk-cyc', 'In cyclic quadrilateral ABCD, ∠DAB = 70°. What is ∠BCD?', [['110°', null], ['70°', 'Opposite angles are not equal; they add to 180°.'], ['90°', 'They need not be right angles. They add to 180°.']], '180° − 70° = 110°.', undefined, 'cir-cyclic'),
    },
    {
      id: 'cir-cyclic-proof', title: 'Proof using the centre angle theorem', phase: 'proof',
      paragraphs: ['Let the arc BCD (the one without A) and the arc DAB (without C) together make the whole circle.'],
      proof: [
        { claim: 'The central angles of arcs BCD and DAB add to 360°.', reason: 'Together the two arcs make a full circle.', show: ['arcBCD', 'arcDAB'] },
        { claim: '∠DAB is half the central angle of arc BCD.', reason: 'A lies on the circle outside arc BCD, and the angle at the centre is twice the angle at the circle.', show: ['arcBCD', 'DAB'] },
        { claim: '∠BCD is half the central angle of arc DAB.', reason: 'C lies on the circle outside arc DAB; the same theorem.', show: ['arcDAB', 'BCD'] },
        { claim: '∠DAB + ∠BCD = ½ × 360° = 180°.', reason: 'Add the two halves of the two central angles.', show: ['DAB', 'BCD'] },
      ],
      visual: circleVisual(CYC_PROOF, altForFigure('Quadrilateral ABCD with the two arcs BCD and DAB marked and the opposite angles at A and C.', CYC_PROOF), { showValues: true }),
    },
  ],
  worked: {
    id: 'w-circ-l9', title: 'Opposite angle of a cyclic quadrilateral', given: ['ABCD is cyclic.', '∠DAB = 75°.'], ask: 'Find ∠BCD.',
    visual: circleVisual(CYC, altForFigure('Cyclic quadrilateral ABCD.', CYC), { highlight: ['DAB', 'BCD'] }),
    steps: [{ text: 'Opposite angles of a cyclic quadrilateral add to 180°.', why: 'This is the theorem we just proved.' }, { text: '∠BCD = 180° − 75° = 105°.', why: 'Subtract from 180°.' }],
    verify: '75° + 105° = 180°.',
  },
  guided: {
    id: 'g-circ-l9', prompt: 'Find two unknown angles.',
    steps: [
      { id: 'g1', prompt: 'One pair.', question: oppositeAngleQ('g-circ-l9-1', 70, 'C'), hints: ['180° minus the known angle.'] },
      { id: 'g2', prompt: 'The other pair.', question: oppositeAngleQ('g-circ-l9-2', 60, 'D'), hints: ['Use the pair ∠ABC and ∠CDA.'] },
    ],
    conclusion: 'In each pair the opposite angles add to 180°.',
  },
  independent: [
    { id: 'i1', topic: 'Cyclic quadrilateral angles', prompt: 'Opposite angles.', question: oppositeAngleQ('circles-l9-i1', 65, 'C'), hints: ['Opposite angles are supplementary.'], solution: ['∠BCD = 180° − ∠DAB.'] },
    { id: 'i2', topic: 'Cyclic quadrilateral angles', prompt: 'The other pair.', question: oppositeAngleQ('circles-l9-i2', 100, 'D'), hints: ['∠CDA is opposite ∠ABC.'], solution: ['∠CDA = 180° − ∠ABC.'] },
    { id: 'i3', topic: 'Cyclic quadrilateral angles', prompt: 'A special case.', question: pick('circles-l9-i3', 'A rectangle has all angles 90°. Can it be cyclic?', [['Yes, opposite angles 90° + 90° = 180°', null], ['No, because its angles are equal', 'Opposite angles only need to add to 180°, and 90° + 90° does.'], ['No, only squares are cyclic', 'Every rectangle has a circle through its four corners.']], 'Opposite angles add to 180°, so it can be cyclic.', undefined, 'cir-cyclic'), hints: ['Add the opposite angles.'], solution: ['90° + 90° = 180° for each pair.'] },
  ],
  reflection: {
    discover: 'Opposite angles of a cyclic quadrilateral are supplementary, which follows from the angle-at-the-centre theorem applied twice.',
    evidence: 'You reshaped the quadrilateral and the sums stayed 180°, then followed the proof through the two marked arcs.',
    stillConfusing: [{ text: 'Where does 360° come from?', refresherId: 'cir-cyclic-proof' }],
  },
};

const L10: EduLesson = {
  id: 'circles-l10', unitId: 'unit-3-angles', number: 10, title: 'Concyclicity and converses',
  objective: 'decide whether four points lie on one circle using the two tests, and explain why they work.',
  prerequisiteIds: ['cpre-angles'],
  steps: [
    {
      id: 'cir-conc-test', title: 'Two tests for four points on a circle',
      paragraphs: ['Test 1: if two opposite angles of a quadrilateral add to 180°, its corners lie on a circle.', 'Test 2: if a segment AB makes EQUAL angles at two points C and D that are on the SAME side of AB, then A, B, C, D lie on a circle.'],
      visual: circleVisual(CYC_82, altForFigure('Quadrilateral ABCD with opposite angles at A and C shown; they add to 180 degrees.', CYC_82), { measureAngles: true, relations: [{ kind: 'sum', a: 'DAB', b: 'BCD' }] }),
      misconception: { wrong: 'Test 2 works even if C and D are on opposite sides of AB.', right: 'The two points must be on the SAME side of AB. On opposite sides, equal angles do not make the points concyclic.' },
      check: pick('chk-conc', 'In quadrilateral ABCD, ∠A = 82° and ∠C = 98°. Are A, B, C, D on one circle?', [['Yes, 82° + 98° = 180°', null], ['No, the angles are different', 'The angles do not have to be equal. Opposite angles adding to 180° is the test.'], ['Cannot tell', 'This test decides it: opposite angles add to 180°.']], 'Opposite angles sum to 180°, so the quadrilateral is cyclic.', undefined, 'cir-conc-test'),
    },
    {
      id: 'cir-conc-why', title: 'Why the tests work', phase: 'reasoning',
      paragraphs: ['Idea of the argument for Test 2: through A, B and C there is exactly one circle (Theorem 1). If D were not on it, ∠ADB would be bigger or smaller than the angles at points that ARE on it, which would break the equal angles we were given. So D must be on the circle. The textbook carries this out carefully; here we only keep the idea.', 'Test 1 follows the same way: the angle sum forces the fourth point onto the circle through the other three.'],
    },
  ],
  worked: {
    id: 'w-circ-l10', title: 'Are these four points concyclic?', given: ['In quadrilateral ABCD, ∠A = 82° and ∠C = 98°.'], ask: 'Do A, B, C, D lie on a circle?',
    visual: circleVisual(CYC_82, altForFigure('Quadrilateral ABCD.', CYC_82), { highlight: ['DAB', 'BCD'] }),
    steps: [{ text: 'Add the opposite angles: 82° + 98° = 180°.', why: 'Test 1 looks at opposite angles.' }, { text: 'The sum is 180°, so the four points are concyclic.', why: 'If two opposite angles add to 180°, the quadrilateral is cyclic.' }],
    verify: 'The other pair, ∠B + ∠D, must then also be 180°.',
  },
  guided: {
    id: 'g-circ-l10', prompt: 'Decide for two quadrilaterals.',
    steps: [
      { id: 'g1', prompt: 'First one.', question: pick('g-circ-l10-1', '∠A = 70° and ∠C = 100°. Are the four points on a circle?', [['No, 70° + 100° = 170°, not 180°', null], ['Yes, because the angles are close', 'Close is not enough. The test needs exactly 180°.'], ['Yes, because 70° + 100° = 180°', 'Check the sum: 70 + 100 = 170.']], 'The sum is 170°, so not concyclic.', undefined, 'cir-conc-test'), hints: ['Add them first.'] },
      { id: 'g2', prompt: 'Second one.', question: pick('g-circ-l10-2', 'Segment AB makes 40° at C and 40° at D, with C and D on the SAME side of AB. What follows?', [['A, B, C, D lie on a circle', null], ['Nothing, the angles are too small', 'The size does not matter; equal angles from the same side is the test.'], ['C and D are the same point', 'Two different points can make equal angles; that is when they lie on the circle through A and B.']], 'Equal angles on the same side mean the four points are concyclic.', undefined, 'cir-conc-test'), hints: ['Use Test 2.'] },
    ],
    conclusion: 'Check exactly 180° for opposite angles, and that equal angles come from the same side.',
  },
  independent: [
    { id: 'i1', topic: 'Concyclic points', prompt: 'Use the angle sum.', question: pick('circles-l10-i1', '∠A = 110° and ∠C = 70° in quadrilateral ABCD. Concyclic?', [['Yes', null], ['No', '110° + 70° = 180°, so the test says yes.']], 'The sum is 180°.', undefined, 'cir-conc-test'), hints: ['Add opposite angles.'], solution: ['110° + 70° = 180°, so the points lie on a circle.'] },
    { id: 'i2', topic: 'Concyclic points', prompt: 'Look at the condition.', question: pick('circles-l10-i2', 'AB makes 40° at C and 40° at D, but C and D are on OPPOSITE sides of AB. Do the four points have to be on a circle?', [['Not necessarily', null], ['Yes, equal angles always give a circle', 'The test needs both points on the SAME side of AB.'], ['No, never', 'They might lie on a circle, but this test does not prove it.']], 'The test needs the same side.', undefined, 'cir-conc-test'), hints: ['Where is the condition about sides used?'], solution: ['Test 2 needs C and D on the same side of AB.', 'With opposite sides the conclusion is not guaranteed.'] },
    { id: 'i3', topic: 'Concyclic points', prompt: 'Use the sum.', question: pick('circles-l10-i3', '∠A = 95° and ∠C = 80°. Concyclic?', [['No, they add to 175°', null], ['Yes, they add to 180°', 'Check the sum: 95 + 80 = 175, which is not 180, so this test does not say yes.']], '175° ≠ 180°.', undefined, 'cir-conc-test'), hints: ['Add carefully.'], solution: ['95° + 80° = 175°, not 180°, so the points are not concyclic.'] },
  ],
  reflection: {
    discover: 'Four points are concyclic if opposite angles add to 180°, or if a segment makes equal angles from the same side at two points.',
    evidence: 'You applied each test and checked the condition about the side.',
    stillConfusing: [{ text: 'Why does the same side matter?', refresherId: 'cir-conc-test' }, { text: 'Why do the tests work?', refresherId: 'cir-conc-why' }],
  },
};

const L11: EduLesson = {
  id: 'circles-l11', unitId: 'unit-4-mastery', number: 11, title: 'Guided theorem revision',
  objective: 'choose the right circle theorem for a figure and combine two steps in a short argument.',
  prerequisiteIds: ['cpre-angles', 'cpre-proof'],
  steps: [
    {
      id: 'cir-choose', title: 'Which fact do I use?', phase: 'apply',
      paragraphs: ['Look at what the figure gives you:', '• Two radii and a chord: an isosceles triangle, so base angles are equal.', '• An angle at the centre and one on the circle on the same arc: centre angle = 2 × circle angle.', '• Two points on the same side of a chord: equal angles.', '• A diameter: the angle at the circle is 90°.', '• A quadrilateral with corners on the circle: opposite angles add to 180°.'],
      check: pick('chk-choose', 'A, B, P are on a circle with centre O, and you know ∠AOB. Which fact gives ∠APB?', [['Centre angle = 2 × circle angle', null], ['Opposite angles of a cyclic quadrilateral add to 180°', 'There is no quadrilateral here, just one arc and two angles on it.'], ['Angles in the same segment are equal', 'That needs two angles at the circle, but one of these is at the centre.']], 'One arc, one centre angle and one circle angle: the double-angle theorem.', undefined, 'cir-choose'),
    },
    {
      id: 'cir-angle-chase', title: 'Angle chasing: two steps', phase: 'apply',
      paragraphs: ['Here ∠AOB = 100°. First, triangle OAB is isosceles (OA = OB). Its base angles are (180° − 100°) ÷ 2 = 40° each. Second, ∠APB = 100° ÷ 2 = 50°.', 'Each line is a claim with a reason: that is a short proof.'],
      visual: circleVisual(REVISE, altForFigure('Chord AB, the centre O, the angle at O and the angle at P on the major arc.', REVISE), { measureAngles: true }),
    },
  ],
  worked: {
    id: 'w-circ-l11', title: 'Two steps from one figure', given: ['∠AOB = 100°, P on the major arc.'], ask: 'Find ∠OAB and ∠APB.',
    visual: circleVisual(REVISE, altForFigure('The figure from the explanation.', REVISE), { highlight: ['OAB', 'APB'] }),
    steps: [
      { text: 'OA = OB, so triangle OAB is isosceles.', why: 'Both are radii.' },
      { text: '∠OAB = (180° − 100°) ÷ 2 = 40°.', why: 'Base angles of an isosceles triangle are equal and the three angles add to 180°.' },
      { text: '∠APB = 100° ÷ 2 = 50°.', why: 'Angle at the circle is half the angle at the centre.' },
    ],
    verify: 'The two answers use two different facts about the same figure.',
  },
  guided: {
    id: 'g-circ-l11', prompt: 'Use the same kind of figure with ∠AOB = 100°.',
    steps: [
      { id: 'g1', prompt: 'Pick the fact.', question: pick('g-circ-l11-1', 'To find ∠OAB, which fact helps?', [['Triangle OAB is isosceles (OA = OB)', null], ['Opposite angles of a cyclic quadrilateral add to 180°', 'There is no cyclic quadrilateral. You have a triangle with two radii as sides.'], ['The angle in a semicircle is 90°', 'AB is not a diameter here, so that does not apply.']], 'Two radii make an isosceles triangle.', undefined, 'cir-choose'), hints: ['Which sides are radii?'] },
      { id: 'g2', prompt: 'Find it.', question: { kind: 'numeric', id: 'g-circ-l11-2', prompt: 'With ∠AOB = 100°, find ∠OAB.', answer: 40, unit: '°', rules: [{ values: [50], entry: { message: '50° is ∠APB (half of 100°). ∠OAB comes from the triangle: (180° − 100°) ÷ 2.', refresherId: 'cir-angle-chase', misconception: 'wrong_angle_asked' } }, { values: [80], entry: { message: '80° is 180° − 100°, the sum of the two base angles. Each base angle is half of that.', refresherId: 'cir-angle-chase', misconception: 'forgot_to_halve' } }], defaultFeedback: { message: 'The base angles share 180° − 100° equally.', refresherId: 'cir-angle-chase' }, explanation: '(180° − 100°) ÷ 2 = 40°.' }, hints: ['The two base angles are equal.'] },
    ],
    conclusion: '∠OAB = 40° from the isosceles triangle.',
  },
  independent: [
    { id: 'i1', topic: 'Choosing a theorem', prompt: 'Decide.', question: pick('circles-l11-i1', 'AB is a diameter and C is on the circle. Which fact gives ∠ACB?', [['The angle in a semicircle is 90°', null], ['Equal chords subtend equal angles at the centre', 'Nothing here says two chords are equal.'], ['Perpendicular from the centre bisects the chord', 'That is about a chord and the centre, not the angle at C.']], '∠ACB = 90°.', undefined, 'cir-choose'), hints: ['What is special about AB?'], solution: ['AB is a diameter, so the angle at C on the circle is 90°.'] },
    { id: 'i2', topic: 'Angle chasing', prompt: 'Two facts.', question: { kind: 'numeric', id: 'circles-l11-i2', prompt: 'O is the centre and ∠AOB = 70°. Find ∠OAB.', answer: 55, unit: '°', rules: [{ values: [35], entry: { message: '35° is the angle at the circle (half of 70°), not the base angle of the triangle.', refresherId: 'cir-angle-chase', misconception: 'wrong_angle_asked' } }, { values: [110], entry: { message: '110° is the sum of the two base angles. Each one is half of that.', refresherId: 'cir-angle-chase', misconception: 'forgot_to_halve' } }], defaultFeedback: { message: 'Triangle OAB is isosceles: the base angles are equal.', refresherId: 'cir-angle-chase' }, explanation: '(180° − 70°) ÷ 2 = 55°.' }, hints: ['Use the isosceles triangle.'], solution: ['OA = OB (radii).', '∠OAB = (180° − 70°) ÷ 2 = 55°.'] },
    { id: 'i3', topic: 'Choosing a theorem', prompt: 'Decide.', question: pick('circles-l11-i3', 'ABCD has all four corners on a circle and ∠A = 60°. Which fact gives ∠C?', [['Opposite angles of a cyclic quadrilateral add to 180°', null], ['The angle in a semicircle is 90°', 'No diameter is given.'], ['Angles in the same segment are equal', 'A and C are not on the same side of BD.']], '∠C = 120°.', undefined, 'cir-choose'), hints: ['What shape is formed?'], solution: ['ABCD is a cyclic quadrilateral.', '∠C = 180° − 60° = 120°.'] },
  ],
  reflection: {
    discover: 'To solve a circle problem, look at what the figure gives you, choose the matching fact, and write each step with its reason.',
    evidence: 'You picked facts for different figures and combined two in one angle chase.',
    stillConfusing: [{ text: 'Which fact do I use?', refresherId: 'cir-choose' }],
  },
};

const LESSON_LIST = [L1, L2, L3, L4, L5, L6, L7, L8, L9, L10, L11];

export const CIRCLES_CHAPTER: EduChapter = {
  id: 'circles',
  title: 'Circles',
  classGrade: 9,
  ncertNote: 'Aligned to NCERT Ganita Manjari Grade 9, Part I, Chapter 5 (sections 5.1 to 5.8, Theorems 1 to 12). Explanations, figures and questions are original; none are copied from the textbook. Tangents are not part of this chapter and appear only as an optional extension in the laboratory.',
  purpose: 'Circles are about one idea: every point is the same distance from the centre. From it you can explain chords, symmetry, angles and four-point tests with reasons, not only measurements.',
  learn: ['Radius, chord and diameter', 'How many circles pass through points', 'Chords, midpoints and distances', 'Central and inscribed angles', 'Cyclic quadrilaterals'],
  realWorld: ['Wheels, gears and clocks', 'Roundabouts and curved roads', 'Camera and telescope lenses', 'Satellite and orbit paths'],
  outcomes: ['Explain a circle from its definition', 'Prove the angle at the centre is double', 'Use cyclic quadrilateral facts', 'Choose the right theorem for a figure'],
  prerequisiteIds: ['cpre-equal-distance', 'cpre-angles', 'cpre-triangles'],
  units: CIRCLES_UNITS,
  lessons: Object.fromEntries(LESSON_LIST.map((l) => [l.id, l])),
  prerequisites: Object.fromEntries(CIRCLES_PREREQUISITES.map((p) => [p.id, p])),
  routes: {
    landing: '/mathematics/circles',
    learn: (id) => `/mathematics/circles/learn/${id}`,
    prerequisites: (id) => `/mathematics/circles#${id}`,
    lab: '/mathematics/circles/workbench',
    practice: '/mathematics/circles/workbench?mode=practice',
  },
};
