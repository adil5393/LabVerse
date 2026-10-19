/**
 * Class 9 Physics, Chapter 6 "How Forces Affect Motion": curriculum map (PHY-2A).
 *
 * Source: NCERT Class 9 Science, Exploration (2026-27), Chapter 6, official PDF
 * https://ncert.nic.in/textbook/pdf/iesc106.pdf (22 pages), read in full for PHY-2A. Section, example, activity and
 * question numbers below are the chapter's own. LabVerse text, figures and questions are original; rows marked
 * 'enrichment' are not in the book. Status: 'learn' (a Learn lesson exists), 'laboratory' (an interactive laboratory
 * only) or 'planned' (not built yet: shown as Upcoming, never as complete).
 */

export type ForceMapKind = 'textbook' | 'enrichment';
export type ForceMapStatus = 'learn' | 'laboratory' | 'planned';

export interface ForceMapRow {
  id: string;
  section: string;
  topic: string;
  kind: ForceMapKind;
  status: ForceMapStatus;
  lessonIds: string[];
  /** The planned milestone that will cover it. */
  milestone?: string;
  note?: string;
}

export const FORCES_CHAPTER_ID = 'forces';
export const FORCES_TEXTBOOK = {
  title: 'How Forces Affect Motion',
  chapterNumber: 6,
  book: 'NCERT Class 9 Science: Exploration',
  edition: '2026-27',
  pdf: 'https://ncert.nic.in/textbook/pdf/iesc106.pdf',
} as const;

export const FORCES_MAP: ForceMapRow[] = [
  { id: 'f-concept', section: '6.1', topic: 'The concept of force: pushes and pulls, effects of a force (Fig. 6.1), direction and magnitude, the newton (N)', kind: 'textbook', status: 'learn', lessonIds: ['pf-l1'] },
  { id: 'f-measure', section: '6.1.1', topic: 'Measuring the magnitude of a force with a spring balance (Fig. 6.2); weight as a force; orders of magnitude', kind: 'textbook', status: 'learn', lessonIds: ['pf-l1'], note: 'Spring-balance reading is taught as an idea; the laboratory shows force values directly.' },
  { id: 'f-net', section: '6.2', topic: 'Balanced and unbalanced forces; net force of two forces in the same or opposite directions (Figs. 6.3 to 6.5); Example 6.1; Pause and Ponder 1 and 2', kind: 'textbook', status: 'learn', lessonIds: ['pf-l2'], note: 'Forces at an angle and turning effects are "Ready to Go Beyond" and are only named.' },
  { id: 'f-friction', section: '6.3', topic: 'The force of friction: opposes the applied force, surfaces, forces on a pushed box (Figs. 6.10, 6.11); Activities 6.1 and 6.2; the thought experiment without friction', kind: 'textbook', status: 'learn', lessonIds: ['pf-l3'], note: 'Activities 6.1 and 6.2 are modelled by the Force Laboratory (investigation D); the physical activities are suggested, not replaced. The book states friction acts opposite to the motion; LabVerse adds that its direction is set by the sliding or the tendency to slide at the contact.' },
  { id: 'f-lab', section: 'enrichment', topic: 'Force Laboratory: one cart with two pushes, mass, surface and starting velocity; force diagrams; five guided investigations', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'f-static', section: 'enrichment', topic: 'Static and kinetic friction on a resting cart (the book mentions the larger force needed to start motion)', kind: 'enrichment', status: 'laboratory', lessonIds: ['pf-l3'] },
  { id: 'f-first', section: '6.4', topic: "Newton's first law of motion; inertia; Examples 6.2 and 6.3 (graphs with no net force); Pause and Ponder 3 to 5", kind: 'textbook', status: 'learn', lessonIds: ['pf-l4', 'pf-l5'], note: 'First-law investigations F to H in the Force Laboratory. Example 6.2 is modelled by lesson 4 and investigation H; Example 6.3 by the graphs in lesson 4.' },
  { id: 'f-inertia', section: 'enrichment', topic: 'Mass as a measure of inertia (equal force pulses on carts of different mass), sudden braking and seat belts (a simplified model, not crash data), balanced forces versus action-reaction pairs', kind: 'enrichment', status: 'laboratory', lessonIds: ['pf-l5'], note: 'Investigations I and J. The book names inertia (Meet a Scientist) but does not discuss these examples.' },
  { id: 'f-second', section: '6.5', topic: "Newton's second law: Activities 6.3 and 6.4, Eqs. 6.1 to 6.3 (F = ma, the newton, weight F = mg), Examples 6.4 to 6.6, Pause and Ponder 6 to 8", kind: 'textbook', status: 'learn', lessonIds: ['pf-l6'], note: 'Interactive derivation A follows the textbook argument from the cart experiments (an experimental argument, ending by choosing the unit). Investigations K to M and the synchronised graphs model Activities 6.3 and 6.4.' },
  { id: 'f-momentum', section: '6.5 (Ready to Go Beyond)', topic: 'Momentum p = mv, the rate-of-change-of-momentum form of the second law, and the cricket catch, airbag and coconut examples (Bridging Science and Society)', kind: 'textbook', status: 'learn', lessonIds: ['pf-l7'], note: 'The book states the momentum form without a derivation; the step-by-step derivation B, the momentum-time and force-time graphs, impulse and investigations N and O are LabVerse enrichment.' },
  { id: 'f-third', section: '6.6', topic: "Newton's third law: Activities 6.5 to 6.7, Examples 6.7 and 6.8", kind: 'textbook', status: 'planned', lessonIds: [], milestone: 'PHY-2D' },
  { id: 'f-system', section: '6.7', topic: 'Forces acting on a system of objects (Fig. 6.34, Eq. 6.4, tension, internal and external forces)', kind: 'textbook', status: 'planned', lessonIds: [], milestone: 'PHY-2E' },
  { id: 'f-ex', section: 'Revise, Reflect, Refine', topic: 'Sixteen end-of-chapter questions (thirteen solved so far: 1 to 6, 8, 10 to 15; the third-law questions 7, 9 and 16 are upcoming)', kind: 'textbook', status: 'learn', lessonIds: [], note: 'See the NCERT Exercises page; the others are Upcoming.' },
  { id: 'f-quest', section: 'The Journey Beyond', topic: 'Closing activities (infographic on friction, magnet cars, rope friction, Principia)', kind: 'textbook', status: 'planned', lessonIds: [], milestone: 'later' },
  { id: 'f-pre', section: 'enrichment', topic: 'Prerequisite refreshers: motion ideas from Chapter 4, positive and negative directions, mass and the kilogram, reading arrows, reading position-time graphs, proportional and inverse relationships', kind: 'enrichment', status: 'learn', lessonIds: ['pf-l1', 'pf-l2', 'pf-l3', 'pf-l4', 'pf-l5', 'pf-l6', 'pf-l7'] },
];

export const forcesCoverageCounts = () => ({
  total: FORCES_MAP.length,
  available: FORCES_MAP.filter((r) => r.status !== 'planned').length,
  planned: FORCES_MAP.filter((r) => r.status === 'planned').length,
});

/** Textbook inventory kept for the coverage audit: examples, activities and Pause-and-Ponder items of Sections 6.1 to 6.7. */
export const FORCES_TEXTBOOK_INVENTORY = {
  sections: ['6.1', '6.1.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7'],
  examples: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8'],
  activities: ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7'],
  exercises: 16,
} as const;
