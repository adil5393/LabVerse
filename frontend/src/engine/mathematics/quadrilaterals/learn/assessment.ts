/**
 * Quadrilaterals chapter assessment: original questions across Ganita Manjari Part II Chapter 12 (angle sum, parallelogram
 * properties and tests, the Midpoint Theorem and its converse, medians and the centroid, Varignon, tiling), spread over the
 * CBSE question-paper competencies. Every numeric answer is checked by `__tests__/unifiedQuads.test.ts`.
 */

import type { ChapterAssessment, Question } from '../../../education/types';

const num = (id: string, prompt: string, answer: number, unit: string | undefined, wrong: string, misconception: string, explanation: string): Question =>
  ({ kind: 'numeric', id, prompt, answer, unit, tolerance: 0.05, defaultFeedback: { message: wrong, misconception }, explanation });

const choice = (id: string, prompt: string, options: [string, string][], correct: string, explanation: string): Question => ({
  kind: 'choice', id, prompt, options: options.map(([oid, text]) => ({ id: oid, text })), correctId: correct,
  feedback: Object.fromEntries(options.filter(([oid]) => oid !== correct).map(([oid]) => [oid, { message: explanation, misconception: `quad-${id}` }])),
  explanation,
});

export const QUAD_ASSESSMENT: ChapterAssessment = {
  id: 'quadrilaterals-assessment-1',
  title: 'Quadrilaterals: chapter assessment',
  instructions: 'Nine original questions across the whole chapter. Figures are described in words; use the given values. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'qa-1', topic: 'Angle sum', lessonId: 'quad-l1', competency: 'knowledge', marks: 1, prompt: 'The four angles.', question: num('qa-1q', 'Three angles of a quadrilateral are 70°, 95° and 120°. Find the fourth angle.', 75, 'degrees', 'The four angles of a quadrilateral add up to 360°.', 'angle-sum-180', '360° − (70° + 95° + 120°) = 75°.'), solution: ['A diagonal splits the quadrilateral into two triangles, so the angles add to 2 × 180° = 360°.', '360° − 285° = 75°.'] },
        { id: 'qa-2', topic: 'Parallelogram properties', lessonId: 'quad-l2', competency: 'knowledge', marks: 1, prompt: 'Consecutive angles.', question: num('qa-2q', 'In parallelogram PQRS, ∠P = 64°. Find ∠Q.', 116, 'degrees', 'Consecutive angles of a parallelogram are co-interior angles between parallel sides, so they add up to 180°.', 'consecutive-equal', '∠Q = 180° − 64° = 116°.'), solution: ['PS ∥ QR, so ∠P and ∠Q are co-interior angles: ∠P + ∠Q = 180°.', '∠Q = 116°.'] },
        { id: 'qa-3', topic: 'Parallelogram tests', lessonId: 'quad-l3', competency: 'knowledge', marks: 1, prompt: 'Which test is enough?', question: choice('qa-3q', 'Which condition, on its own, guarantees that a quadrilateral is a parallelogram?', [['a', 'Its diagonals bisect each other'], ['b', 'Its diagonals are equal'], ['c', 'One pair of opposite sides is equal'], ['d', 'Two adjacent angles are equal']], 'a', 'If the diagonals bisect each other, the triangles at the centre are congruent (SAS), which makes both pairs of opposite sides parallel. The other conditions are true of some non-parallelograms (an isosceles trapezium has equal diagonals and one pair of equal opposite sides).'), solution: ['Diagonals bisecting each other give congruent triangles AOB and COD (SAS), so AB ∥ CD; likewise AD ∥ BC.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'qa-4', topic: 'Midpoint Theorem', lessonId: 'quad-l4', competency: 'application', marks: 2, prompt: 'Joining midpoints.', question: num('qa-4q', 'In triangle ABC, M and N are the midpoints of AB and AC, and BC = 13.6 cm. Find MN.', 6.8, 'cm', 'The segment joining the midpoints of two sides is parallel to the third side and half as long.', 'midpoint-equal-length', 'MN = ½ × 13.6 = 6.8 cm.'), solution: ['By the Midpoint Theorem, MN ∥ BC and MN = ½ BC.', 'MN = 6.8 cm.'] },
        { id: 'qa-5', topic: 'Converse of the Midpoint Theorem', lessonId: 'quad-l5', competency: 'application', marks: 2, prompt: 'A parallel line from a midpoint.', question: num('qa-5q', 'In triangle PQR, D is the midpoint of PQ. The line through D parallel to QR meets PR at E. If PR = 15 cm, find PE.', 7.5, 'cm', 'A line through the midpoint of one side, parallel to a second side, bisects the third side.', 'converse-midpoint', 'E is the midpoint of PR, so PE = 7.5 cm.'), solution: ['By the converse of the Midpoint Theorem, E is the midpoint of PR.', 'PE = ½ × 15 = 7.5 cm.'] },
        { id: 'qa-6', topic: 'Centroid', lessonId: 'quad-l6', competency: 'application', marks: 2, prompt: 'Cutting a median.', question: num('qa-6q', 'The median AD of a triangle is 18 cm long and G is the centroid. Find AG.', 12, 'cm', 'The centroid divides each median in the ratio 2 : 1, the longer part next to the vertex.', 'centroid-half', 'AG = ⅔ × 18 = 12 cm.'), solution: ['G divides AD so that AG : GD = 2 : 1.', 'AG = 2/3 × 18 = 12 cm.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'qa-7', topic: 'Varignon parallelogram', lessonId: 'quad-l7', competency: 'analysis', marks: 2, prompt: 'Midpoints of a quadrilateral.', question: num('qa-7q', 'The diagonals of a quadrilateral are 10 cm and 16 cm long. The midpoints of its four sides are joined. Find the perimeter of the figure formed.', 26, 'cm', 'Each side of the midpoint figure is half of one diagonal (Midpoint Theorem in the triangles a diagonal makes).', 'varignon-sides', 'Sides 5, 8, 5, 8 cm, so the perimeter is 26 cm.'), solution: ['In each triangle cut off by a diagonal, the midpoint segment is half that diagonal.', 'The sides are 5 cm, 8 cm, 5 cm and 8 cm: perimeter 26 cm.'] },
        { id: 'qa-8', topic: 'Varignon parallelogram', lessonId: 'quad-l7', competency: 'analysis', marks: 2, prompt: 'Which shape?', question: choice('qa-8q', 'The diagonals of a quadrilateral are equal in length but NOT perpendicular. What is the figure formed by joining the midpoints of its sides?', [['rh', 'A rhombus'], ['sq', 'A square'], ['rect', 'A rectangle'], ['tr', 'A trapezium that is not a parallelogram']], 'rh', 'Its sides are halves of the diagonals, so all four are equal: a rhombus. It is a square only if the diagonals are also perpendicular.'), solution: ['Each side of the midpoint figure is half a diagonal; equal diagonals give four equal sides.', 'Its angles equal the angle between the diagonals, which is not 90°, so it is a rhombus, not a square.'] },
        { id: 'qa-9', topic: 'Tiling', lessonId: 'quad-l8', competency: 'analysis', marks: 2, prompt: 'Why any quadrilateral tiles.', question: choice('qa-9q', 'Why can copies of any quadrilateral (even an irregular one) cover a floor with no gaps?', [['sum', 'Its four angles add up to 360°, so one copy of each angle fits around every corner point'], ['par', 'Every quadrilateral is a parallelogram'], ['eq', 'Its sides are all equal'], ['right', 'It has at least one right angle']], 'sum', 'At each corner of the tiling, one copy of each of the four angles meets, and they add up to a full turn of 360°.'), solution: ['Rotating copies by 180° about the midpoints of the sides matches equal edges.', 'Around each vertex the four different angles meet once each, adding up to 360°.'] },
      ],
    },
  ],
};
