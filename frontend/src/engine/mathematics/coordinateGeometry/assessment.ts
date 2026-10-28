/**
 * Coordinate geometry chapter assessment: original questions on Ganita Manjari Part I Chapter 1 and the CBSE outcomes for it
 * (locating points, distance, midpoint, three points in a line, checking a right angle with coordinates).
 */

import type { ChapterAssessment, Question } from '../../education/types';

const num = (id: string, prompt: string, answer: number, wrong: string, mis: string, explanation: string, unit?: string): Question =>
  ({ kind: 'numeric', id, prompt, answer, unit, tolerance: 0.005, defaultFeedback: { message: wrong, misconception: mis }, explanation });
const pick = (id: string, prompt: string, options: [string, string][], correct: string, explanation: string, mis: string): Question => ({
  kind: 'choice', id, prompt, options: options.map(([oid, text]) => ({ id: oid, text })), correctId: correct,
  feedback: Object.fromEntries(options.filter(([oid]) => oid !== correct).map(([oid]) => [oid, { message: explanation, misconception: mis }])), explanation,
});

export const CG_ASSESSMENT: ChapterAssessment = {
  id: 'coordinate-geometry-assessment-1',
  title: 'Coordinates: chapter assessment',
  instructions: 'Eight original questions. Give decimals to two places where needed. No hints during the assessment.',
  sections: [
    {
      id: 'sec-a', title: 'Section A: Knowledge and understanding',
      items: [
        { id: 'cga-1', topic: 'Quadrants', lessonId: 'cg-l3', competency: 'knowledge', marks: 1, prompt: 'Which quadrant?', question: pick('cga-1q', 'In which quadrant is the point (−3, 5)?', [['ii', 'Quadrant II'], ['i', 'Quadrant I'], ['iii', 'Quadrant III'], ['iv', 'Quadrant IV']], 'ii', 'x is negative (left) and y is positive (up): Quadrant II.', 'quadrant-signs'), solution: ['x < 0 and y > 0 is Quadrant II.'] },
        { id: 'cga-2', topic: 'Points on the axes', lessonId: 'cg-l4', competency: 'knowledge', marks: 1, prompt: 'On an axis.', question: pick('cga-2q', 'Where does the point (0, −4) lie?', [['y', 'On the y-axis, 4 units below the origin'], ['x', 'On the x-axis, 4 units to the left'], ['q', 'In Quadrant IV']], 'y', 'x = 0 means the point is on the y-axis; y = −4 is 4 units down.', 'axis-swap'), solution: ['x = 0: on the y-axis; y = −4: 4 units below O.'] },
      ],
    },
    {
      id: 'sec-b', title: 'Section B: Application',
      items: [
        { id: 'cga-3', topic: 'Distance', lessonId: 'cg-l6', competency: 'application', marks: 2, prompt: 'Distance between two points.', question: num('cga-3q', 'Find the distance between A(1, 2) and B(7, 10).', 10, 'Use √((x₂ − x₁)² + (y₂ − y₁)²).', 'forgot-square-root', '√(6² + 8²) = √100 = 10.', 'units'), solution: ['Differences: 6 and 8.', 'Distance = √(36 + 64) = 10 units.'] },
        { id: 'cga-4', topic: 'Midpoint', lessonId: 'cg-l7', competency: 'application', marks: 2, prompt: 'The midpoint.', question: { kind: 'multi', id: 'cga-4q', prompt: 'Find the midpoint of P(−2, 5) and Q(6, −1).', parts: [{ id: 'x', label: 'x', answer: 2, tolerance: 1e-6 }, { id: 'y', label: 'y', answer: 2, tolerance: 1e-6 }], defaultFeedback: { message: 'Average the x-coordinates and the y-coordinates separately.', misconception: 'midpoint-difference' }, explanation: '((−2 + 6) ÷ 2, (5 − 1) ÷ 2) = (2, 2).' }, solution: ['x = (−2 + 6) ÷ 2 = 2.', 'y = (5 + (−1)) ÷ 2 = 2.'] },
        { id: 'cga-5', topic: 'Distance', lessonId: 'cg-l6', competency: 'application', marks: 2, prompt: 'A non-whole distance.', question: num('cga-5q', 'Find the distance between (1, 1) and (4, 3), to two decimal places.', 3.61, 'Differences are 3 and 2: √(9 + 4) = √13.', 'forgot-square-root', '√13 ≈ 3.61.', 'units'), solution: ['For (1, 1) and (4, 3): differences 3 and 2.', '√(9 + 4) = √13 ≈ 3.61 units.'] },
      ],
    },
    {
      id: 'sec-c', title: 'Section C: Analyse and reason',
      items: [
        { id: 'cga-6', topic: 'Three points in a line', lessonId: 'cg-l6', competency: 'analysis', marks: 2, prompt: 'Collinear?', question: pick('cga-6q', 'Are A(1, 1), B(3, 5) and C(4, 7) on one straight line?', [['yes', 'Yes: AB + BC = AC'], ['no', 'No: the distances do not add up']], 'yes', 'AB = √20, BC = √5, AC = √45 = 3√5 = 2√5 + √5 = AB + BC, so B lies on AC.', 'collinear-check'), solution: ['AB = √(4 + 16) = 2√5; BC = √(1 + 4) = √5; AC = √(9 + 36) = 3√5.', 'AB + BC = AC, so the points are collinear.'] },
        { id: 'cga-7', topic: 'Right angles with coordinates', lessonId: 'cg-l6', competency: 'analysis', marks: 2, prompt: 'Right-angled?', question: pick('cga-7q', 'Is the triangle with vertices O(0, 0), P(4, 0) and Q(4, 3) right-angled?', [['yes', 'Yes: OP² + PQ² = OQ² (16 + 9 = 25)'], ['no', 'No: none of its sides is horizontal']], 'yes', 'Compute the squared sides: 16, 9 and 25. By the converse of the Baudhāyana–Pythagoras theorem the angle at P is 90°.', 'converse-pythagoras'), solution: ['OP² = 16, PQ² = 9, OQ² = 25.', '16 + 9 = 25, so the angle at P is a right angle.'] },
        { id: 'cga-8', topic: 'Midpoint', lessonId: 'cg-l7', competency: 'analysis', marks: 2, prompt: 'Find the other end.', question: { kind: 'multi', id: 'cga-8q', prompt: 'M(3, −1) is the midpoint of AB, and A is (1, 4). Find B.', parts: [{ id: 'x', label: 'x', answer: 5, tolerance: 1e-6 }, { id: 'y', label: 'y', answer: -6, tolerance: 1e-6 }], defaultFeedback: { message: 'M is halfway: B is as far beyond M as A is before it. x = 2 × 3 − 1, y = 2 × (−1) − 4.', misconception: 'midpoint-reverse' }, explanation: 'B = (2 × 3 − 1, 2 × (−1) − 4) = (5, −6).' }, solution: ['(1 + x) ÷ 2 = 3 gives x = 5.', '(4 + y) ÷ 2 = −1 gives y = −6.'] },
      ],
    },
  ],
};
