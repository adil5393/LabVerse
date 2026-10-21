/**
 * Class 9 Physics, Chapter 7 "Work, Energy, and Simple Machines": curriculum map (PHY-3A).
 *
 * Source: NCERT Class 9 Science, Exploration (2026-27), Chapter 7, official PDF https://ncert.nic.in/textbook/pdf/iesc107.pdf
 * (24 pages), read in full for PHY-3A. Section, equation, example, activity and question numbers are the chapter's own.
 * LabVerse text, figures and questions are original; rows marked 'enrichment' are not in the book.
 * Status: 'learn' (a Learn lesson exists), 'laboratory' (interactive laboratory only) or 'planned' (not built: shown as Upcoming).
 */

export type WorkMapKind = 'textbook' | 'enrichment';
export type WorkMapStatus = 'learn' | 'laboratory' | 'planned';

export interface WorkMapRow {
  id: string;
  section: string;
  topic: string;
  kind: WorkMapKind;
  status: WorkMapStatus;
  lessonIds: string[];
  note?: string;
}

export const WORK_CHAPTER_ID = 'work';
export const WORK_TEXTBOOK = {
  title: 'Work, Energy, and Simple Machines',
  chapterNumber: 7,
  book: 'NCERT Class 9 Science: Exploration',
  edition: '2026-27',
  pdf: 'https://ncert.nic.in/textbook/pdf/iesc107.pdf',
} as const;

export const WORK_MAP: WorkMapRow[] = [
  { id: 'w-work', section: '7.1', topic: 'Work done by a constant force: lifting bags (Fig. 7.2), W = F × s (Eqs. 7.1, 7.2, Fig. 7.3), naming the force and the object, the joule (1 J = 1 N × 1 m = 1 kg m² s⁻²), the force-displacement graph and the area under it (Fig. 7.4)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l1'], note: 'The area under a force-displacement graph is shown in the Work Laboratory for a constant force; the non-constant case is only named.' },
  { id: 'w-zero', section: '7.1.1', topic: 'When is work zero? Zero force, zero displacement (pushing a wall, Fig. 7.5, tiredness) and a force perpendicular to the displacement (carrying a box, Fig. 7.6); Pause and Ponder 1 (the weightlifter)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l2'], note: 'The angle control for a force at any angle (W = F s cos θ) is "Ready to Go Beyond" in the book and is enrichment here.' },
  { id: 'w-sign', section: '7.1.2', topic: 'Positive and negative work (wheelchair and goalkeeper, Fig. 7.7), Examples 7.1 and 7.2, Pause and Ponder 2 (friction on the stack of coins)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l3'], note: 'Net work as the sum of the work of every force (Experiment E) is a preview of the work-energy theorem and is LabVerse enrichment.' },
  { id: 'w-lab', section: 'enrichment', topic: 'Work Laboratory: a kinematic work model (the displacement is chosen, not solved) with a force of any size and direction, signed work by each force, net work, friction, and five guided investigations A to E', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'w-wet', section: '7.2', topic: 'The work-energy theorem (Eq. 7.3), energy as the capacity to do work, ways of transferring energy, carrom Example 7.3, Pause and Ponder 3, Meet a Scientist (Joule)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l4'], note: 'Work-Energy Laboratory investigation F checks W_net = ΔK for a cart.' },
  { id: 'w-forms', section: '7.3', topic: 'Forms of energy (Fig. 7.10) and energy transformations', kind: 'textbook', status: 'learn', lessonIds: ['pw-l4'] },
  { id: 'w-ke', section: '7.4.1', topic: 'Kinetic energy: Eqs. 7.4 to 7.6 (the derivation), Examples 7.4 to 7.6, Pause and Ponder 4 and 5', kind: 'textbook', status: 'learn', lessonIds: ['pw-l5'], note: 'Interactive derivation K with a force-displacement graph (area = work) and the Work-Energy Laboratory (investigations A to F). The derivation is the textbook algebra; the graph, the missing-step questions and the reversal case are LabVerse enrichment.' },
  { id: 'w-keexp', section: 'enrichment', topic: 'Work-Energy Laboratory: a cart under a constant net force, with the force graph, the kinetic-energy graph and a W_net = ΔK check, including negative net work and a direction reversal', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'w-pe', section: '7.4.2', topic: 'Potential energy: elastic and gravitational (Activity 7.1, Eqs. 7.7 and 7.8, Example 7.7, Pause and Ponder 6)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l6'], note: 'Interactive derivation U (U = mgh from the work of lifting). The reference-level idea (only changes of U matter) is LabVerse enrichment. Activity 7.1 (the ball in sand) is taught as an idea and suggested as a home activity; elastic and magnetic potential energy are explained but not simulated.' },
  { id: 'w-cons', section: '7.4.3', topic: 'Conservation of mechanical energy: Eqs. 7.9 and 7.10, Activity 7.2 (the pendulum), Examples 7.8 and 7.9, Pause and Ponder 7 and 8', kind: 'textbook', status: 'learn', lessonIds: ['pw-l7'], note: 'Interactive derivation C (free fall) and the Energy Laboratory (investigations A to F). The pendulum and the ball roller coaster are explained; the laboratory models a ramp or a drop with friction. The escape-ramp Example 7.9 is covered by the energy method with a resisting force.' },
  { id: 'w-eexp', section: 'enrichment', topic: 'Energy Laboratory: an object released on a ramp or in free fall, with energy bars, an energy graph, thermal energy from friction, a chosen reference height and the check K + U + Q = constant', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'w-power', section: '7.5', topic: 'Power: Eq. 7.11, the watt, Examples 7.10 and 7.11, horsepower (Threads of Curiosity)', kind: 'textbook', status: 'learn', lessonIds: ['pw-l8'], note: 'Interactive explanation P (P = W ÷ t, with a work-time graph; the P = F v step is enrichment) and the Power Laboratory (investigations A to C). Examples 7.10 and 7.11 are covered by lifting (m g h) and speeding up (kinetic energy) in the lesson and the laboratory.' },
  { id: 'w-pexp', section: 'enrichment', topic: 'Power Laboratory: the work from a direct amount, a lift or a speed-up, the time, the power in watts, kilowatts and horsepower, and the same work in half and twice the time', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'w-machines', section: '7.6', topic: 'Simple machines, effort, load and mechanical advantage (Eq. 7.12): the pulley (7.6.1, Figs. 7.23 to 7.25), the inclined plane (7.6.2, Activity 7.3, Eq. 7.13, Example 7.12) and the lever (7.6.3, Activities 7.4 and 7.5, Eqs. 7.14 to 7.16, Tables 7.1 and 7.2, Example 7.13); Pause and Ponder 9 to 13', kind: 'textbook', status: 'learn', lessonIds: ['pw-l9', 'pw-l10'], note: 'Interactive derivations R (ramp) and L (lever), and the Simple Machines Laboratory (inclined plane, pulley, lever: investigations). Activities 7.3 to 7.5 are modelled by the laboratory; the physical activities are suggested, not replaced. The torque (force × arm) in the lever model is used only to decide the balance and is enrichment; the textbook uses effort × effort arm = load × load arm.' },
  { id: 'w-mexp', section: 'enrichment', topic: 'Simple Machines Laboratory: an inclined plane with friction (the useful work and thermal energy), a pulley system with the rope constraint and the weight of the movable block, and a lever of Class I, II or III with the distance moved by each end', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
  { id: 'w-ex', section: 'Revise, Reflect, Refine', topic: 'Fifteen end-of-chapter questions (43 subparts) listed with their textbook numbers, every part solved step by step', kind: 'textbook', status: 'learn', lessonIds: [], note: 'See the NCERT Exercises page.' },
  { id: 'w-quest', section: 'The Journey Beyond; The Quest Continues', topic: 'Rubber-band pen launcher, building simple machines, PhET simulations; dark energy', kind: 'textbook', status: 'planned', lessonIds: [] },
  { id: 'w-watermill', section: 'Bridging Science and Society', topic: 'The watermill (gharat or panchakki): flowing water turns potential energy into kinetic energy that drives a grinding stone', kind: 'textbook', status: 'learn', lessonIds: ['pw-l4'], note: 'Taught as a worked example of an energy transformation in lesson 4 ("Forms of energy and how they change"); there is no separate interactive model.' },
  { id: 'w-glance', section: 'At a Glance', topic: 'The chapter summary list', kind: 'textbook', status: 'planned', lessonIds: [], note: 'Not built as a single page; each lesson and derivation ends with its own revision summary.' },
  { id: 'w-pre', section: 'enrichment', topic: 'Prerequisite refreshers: force and Newton\'s laws, displacement and direction, speed and velocity, mass and weight, multiplying, dividing and units, reading a basic graph, equations of motion, squares and rearranging, ratios and right-angled triangles', kind: 'enrichment', status: 'learn', lessonIds: ['pw-l1', 'pw-l2', 'pw-l3', 'pw-l4', 'pw-l5', 'pw-l6', 'pw-l7', 'pw-l8', 'pw-l9', 'pw-l10'] },
  { id: 'w-practice', section: 'enrichment', topic: 'Chapter Practice: 33 original questions on the whole chapter (work, energy, conservation, friction, power, machines, diagrams and derivation reasoning), each mapped to a lesson objective', kind: 'enrichment', status: 'learn', lessonIds: [], note: 'Open to everyone; practice results are shown to the student only and never change lesson mastery.' },
  { id: 'w-found', section: 'enrichment', topic: 'Energy and power calculation helpers (kinetic, potential and mechanical energy, work-energy bookkeeping, power) shared by the laboratories', kind: 'enrichment', status: 'laboratory', lessonIds: [] },
];

export const workCoverageCounts = () => ({
  total: WORK_MAP.length,
  available: WORK_MAP.filter((r) => r.status !== 'planned').length,
  planned: WORK_MAP.filter((r) => r.status === 'planned').length,
});

/** Textbook inventory kept for the coverage audit: sections, equations, examples, activities and Pause-and-Ponder items. */
export const WORK_TEXTBOOK_INVENTORY = {
  sections: ['7.1', '7.1.1', '7.1.2', '7.2', '7.3', '7.4', '7.4.1', '7.4.2', '7.4.3', '7.5', '7.6', '7.6.1', '7.6.2', '7.6.3'],
  equations: '7.1 to 7.16',
  examples: ['7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10', '7.11', '7.12', '7.13'],
  activities: ['7.1', '7.2', '7.3', '7.4', '7.5'],
  pausePonder: 13,
  exercises: 15,
} as const;
