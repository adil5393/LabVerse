/**
 * Class 9 Physics, Chapter 4 "Describing Motion Around Us": curriculum map.
 *
 * Source: NCERT Class 9 Science, Exploration (2026-27), Chapter 4, official PDF
 * https://ncert.nic.in/textbook/pdf/iesc104.pdf (24 pages), read for PHY-1A. Section
 * numbers, figure and activity numbers below are the chapter's own. LabVerse text,
 * figures and questions are original; rows marked 'enrichment' are not in the book.
 * No exercise numbers other than those printed under "Revise, Reflect, Refine" are used.
 */

export type MapKind = 'textbook' | 'enrichment';
export type MapStatus = 'learn' | 'laboratory' | 'planned';

export interface MotionMapRow {
  id: string;
  section: string;
  topic: string;
  kind: MapKind;
  /** What exists today. 'planned' rows are NOT implemented yet. */
  status: MapStatus;
  lessonIds: string[];
  note?: string;
}

export const MOTION_CHAPTER_ID = 'motion';
export const MOTION_TEXTBOOK = {
  title: 'Describing Motion Around Us',
  chapterNumber: 4,
  book: 'NCERT Class 9 Science: Exploration',
  edition: '2026-27',
  pdf: 'https://ncert.nic.in/textbook/pdf/iesc104.pdf',
} as const;

export const MOTION_MAP: MotionMapRow[] = [
  { id: 'm-ref', section: '4.1.1', topic: 'Describing position: reference point, distance and direction; at rest and in motion; plus and minus signs on a straight line (Figs. 4.2 and 4.3)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l1'] },
  { id: 'm-dist', section: '4.1.2', topic: 'Total distance travelled as path length (athlete example, Fig. 4.4)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l2'] },
  { id: 'm-disp', section: '4.1.2', topic: 'Displacement as the net change in position; magnitude and direction; instant versus time interval; Activity 4.1 and its note (equal only without turning back)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l3'] },
  { id: 'm-vec', section: '4.1.2', topic: 'Scalars and vectors (the "Ready to Go Beyond" note: to be learnt in higher grades)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l3'], note: 'Named only; no vector arithmetic.' },
  { id: 'm-pp', section: '4.1.2', topic: 'Pause and Ponder: when displacement is zero; fuel used versus distance; the ball on an inclined track (Fig. 4.6)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l2', 'pm-l3'] },
  { id: 'm-speed', section: '4.1.3', topic: 'Average speed and average velocity; uniform and non-uniform motion (Eq. 4.1 and following)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l4', 'pm-l5'], note: 'Computed from the same path model; five laboratory investigations E to I.' },
  { id: 'm-acc', section: '4.1.4', topic: 'Average acceleration (Activity 4.2)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l6'], note: 'Signs of acceleration and velocity versus acceleration are in the lesson.' },
  { id: 'm-graph', section: '4.2.1 to 4.2.3', topic: 'Plotting graphs, position-time graphs, velocity-time graphs (Activities 4.3 and 4.4)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l7', 'pm-l8'], note: 'With the Motion Graph Studio. Turning-back graphs and signed area versus the area of |v| are LabVerse enrichment: the textbook graphs show one direction only.' },
  { id: 'm-eq', section: '4.3', topic: 'Kinematic equations for constant acceleration (Eqs. 4.4a to 4.4c; safe following distance, Fig. 4.20)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l9'], note: 'With the Equation Laboratory. The reversal example is LabVerse enrichment.' },
  { id: 'm-ucm', section: '4.4.1', topic: 'Motion in a plane; uniform circular motion (Activity 4.5; distance and displacement on a circle)', kind: 'textbook', status: 'learn', lessonIds: ['pm-l10'], note: 'With the circular motion lab. The arc and chord quantities are LabVerse enrichment; the acceleration towards the centre is explained only as an idea.' },
  { id: 'm-ex', section: 'Revise, Reflect, Refine', topic: 'Sixteen end-of-chapter questions, every part solved step by step', kind: 'textbook', status: 'learn', lessonIds: [], note: 'See the NCERT Exercises page. Graph data for questions 6, 7, 12 and 13 are read from the printed figures.' },
  { id: 'm-lab', section: 'enrichment', topic: 'Laboratories on one deterministic model each: the Motion Laboratory (nine guided investigations), the Motion Graph Studio, the Equation Laboratory and the Uniform Circular Motion experiment, with predictions compared with model values', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'm-practice', section: 'enrichment', topic: 'Chapter Practice: original questions on every unit, with no prerequisites and no repeated items', kind: 'enrichment', status: 'learn', lessonIds: [], note: 'See the Chapter Practice page.' },
  { id: 'm-pre', section: 'enrichment', topic: 'Prerequisite refreshers: units of length and time, signed numbers, reading a position scale', kind: 'enrichment', status: 'learn', lessonIds: ['pm-l1', 'pm-l2', 'pm-l3'] },
];

export const motionCoverageCounts = () => ({
  total: MOTION_MAP.length,
  available: MOTION_MAP.filter((r) => r.status !== 'planned').length,
  planned: MOTION_MAP.filter((r) => r.status === 'planned').length,
});
