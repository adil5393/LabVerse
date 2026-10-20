/**
 * "The Journey Beyond" (the chapter's closing activities) and the friction questions of "The Quest Continues…" (PHY-2E).
 * The textbook's four closing activities are listed with an honest status. Only the first can be explored with the existing
 * cart model (investigation U: does friction depend on how hard the surfaces press, and is the friction before motion larger
 * than after?); the others need a new simulation or an outside source and are documented as follow-ups, not faked.
 * Everything here is original; the textbook's wording is not reproduced.
 */

import { DEFAULT_SETUP, sampleAtTime, type Sample, type Setup } from './forceModel';
import type { FirstLawRoute } from './firstLaw';

export interface QuestExperiment { id: 'U'; title: string; goal: string; routes: FirstLawRoute[]; lesson: string }

const base = (o: Partial<Setup>): Setup => ({ ...DEFAULT_SETUP, forceA: 0, forceB: 0, dirB: 'left', ...o });
const near = (a: number, b: number, tol = 1e-6) => Math.abs(a - b) < tol;
const r2 = (n: number) => String(Math.round(n * 100) / 100);

export const QUEST_EXPERIMENTS: QuestExperiment[] = [
  {
    id: 'U', title: 'Friction questions: pressing harder, and before versus after motion', goal: 'Explore two questions from the chapter\'s closing section with the cart on a wooden table: does the friction depend on how hard the surfaces press together, and is the friction before the cart moves larger than after it starts?',
    routes: [
      { id: 'u1', label: 'A 2 kg cart at rest on wood is pushed with 10 N (the largest static friction is 8 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 10 }), tEnd: 3,
        prompt: 'Does the cart move?',
        options: [
          { label: 'Yes: 10 N is more than the largest friction (8 N); it accelerates at 2 m/s²', holds: (_e: Sample, s: Sample) => near(s.a, 2), why: 'Sliding friction is 6 N, so the net force is 10 − 6 = 4 N and a = 4 ÷ 2 = 2 m/s².' },
          { label: 'No: friction matches the push', holds: (e: Sample) => near(e.v, 0), why: 'Friction can match the push only up to its largest value (8 N here); 10 N is more than that.' },
        ],
        explain: (e: Sample, s: Sample) => `The push (10 N) beats the largest static friction (8 N), so the cart slides; the friction is then ${r2(Math.abs(s.friction))} N, the net force ${r2(s.net)} N and the velocity after 3 s is ${r2(e.v)} m/s.` },
      { id: 'u2', label: 'A 4 kg cart at rest on the same wood is pushed with the same 10 N (the largest static friction is now 16 N)', setup: base({ massKg: 4, surfaceId: 'wood', forceA: 10 }), tEnd: 3,
        prompt: 'Now the surfaces press together twice as hard (twice the weight). Does the cart move?',
        options: [
          { label: 'No: the largest friction doubled to 16 N, so friction (10 N) matches the push', holds: (e: Sample) => near(e.v, 0) && near(e.x, 0), why: 'In this model the friction limit is proportional to how hard the surfaces press (the normal force, here equal to the weight): twice the weight, twice the limit.' },
          { label: 'Yes: the same push moves it as before', holds: (e: Sample) => e.v > 1e-9, why: 'The pressing force changed, so the friction limit changed: it is 16 N now, above the 10 N push.' },
        ],
        explain: (_e: Sample, s: Sample) => `The friction is ${r2(Math.abs(s.friction))} N, exactly the push, so the net force is ${r2(s.net)} N and the cart stays at rest. Friction depends on the surfaces (the type of surface) and on how hard they are pressed together.` },
      { id: 'u3', label: 'A 2 kg cart at rest on wood is pushed with 7 N (below the largest static friction of 8 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 7 }), tEnd: 3,
        prompt: 'Does the cart move?',
        options: [
          { label: 'No: static friction matches the 7 N push', holds: (e: Sample) => near(e.v, 0) && near(e.x, 0), why: 'The push is below the largest static friction (8 N), so the net force on the resting cart is zero.' },
          { label: 'Yes: it accelerates', holds: (e: Sample) => e.v > 1e-9, why: 'A push below the friction limit cannot start the cart.' },
        ],
        explain: (_e: Sample, s: Sample) => `Static friction is ${r2(Math.abs(s.friction))} N: it matches the push and the net force is ${r2(s.net)} N.` },
      { id: 'u4', label: 'The same 7 N push on a 2 kg cart that is already sliding right at 1 m/s on wood (sliding friction 6 N)', setup: base({ massKg: 2, surfaceId: 'wood', forceA: 7, startVelocity: 1 }), tEnd: 3,
        prompt: 'The same 7 N push now makes the cart:',
        options: [
          { label: 'accelerate at 0.5 m/s²: the sliding friction (6 N) is smaller than the push', holds: (_e: Sample, s: Sample) => near(s.a, 0.5), why: 'Once sliding, the friction falls to 6 N, so the net force is 7 − 6 = 1 N and a = 1 ÷ 2 = 0.5 m/s².' },
          { label: 'keep a constant velocity', holds: (_e: Sample, s: Sample) => near(s.a, 0), why: 'Constant velocity would need the friction to equal 7 N. The sliding friction is only 6 N.' },
          { label: 'slow down', holds: (_e: Sample, s: Sample) => s.a < -1e-9, why: 'The push (7 N) is larger than the sliding friction (6 N), so the net force is forwards.' },
        ],
        explain: (e: Sample, s: Sample) => `With the cart sliding, friction is ${r2(Math.abs(s.friction))} N, so the net force is ${r2(s.net)} N and the velocity grows to ${r2(e.v)} m/s after 3 s. In this model the friction before motion (up to 8 N) is larger than the friction while sliding (6 N), as in many real surfaces.` },
    ],
    lesson: 'In the model the friction depends on the surfaces (the surface and how hard they are pressed together), static friction can match a push up to its largest value, and the sliding friction is somewhat smaller than that largest value. Rolling versus sliding is not modelled.',
  },
];

export const questExperimentById = (id: string | null | undefined): QuestExperiment | undefined => QUEST_EXPERIMENTS.find((e) => e.id === id);

export function questOutcome(r: FirstLawRoute) {
  const start = sampleAtTime(r.setup, 0, r.tEnd), end = sampleAtTime(r.setup, r.tEnd, r.tEnd);
  return { start, end, holdsIndex: r.options.map((o) => o.holds(end, start)).indexOf(true) };
}

export type JourneyStatus = 'explorable' | 'follow-up' | 'external';

export interface JourneyItem { id: string; title: string; summary: string; status: JourneyStatus; href?: string; note: string }

/** The four closing activities of the chapter, with what LabVerse does (or does not yet do) for each. */
export const JOURNEY_ITEMS: JourneyItem[] = [
  { id: 'j-friction', title: 'Questions about friction (infographic)', summary: 'Does friction depend on how hard the surfaces press? Is the friction before motion larger than after? Is rolling friction smaller than sliding friction?', status: 'explorable', href: '/physics/forces/lab?experiment=U',
    note: 'Investigation U answers the first two with the cart model. Rolling versus sliding friction is not modelled: that part, and drawing the infographic, are left to the student.' },
  { id: 'j-magnets', title: 'Magnet cars: distance and time against mass', summary: 'Two toy cars with magnets repel each other; record the distance each travels before stopping, then repeat with extra equal masses and plot distance against mass.', status: 'follow-up',
    note: 'The two-body model has no friction, so the stopping distances cannot be shown. Follow-up: add the dry-friction model to the two-body interaction. The equal-and-opposite forces and the momentum of the pair are already in the Interactions Laboratory.' },
  { id: 'j-rope', title: 'Rope wrapped round a post', summary: 'Each extra turn of a rope round a rough post makes it much easier to hold a heavy load, so friction does not grow in a simple linear way.', status: 'follow-up',
    note: 'This needs a rope-friction (capstan) model, a new simulation: documented as a follow-up and not simulated here.' },
  { id: 'j-principia', title: 'Newton\'s original work', summary: 'Read excerpts of the Principia and commentaries online to see how the laws were formulated.', status: 'external',
    note: 'An outside reading activity; no interactive version is provided.' },
];
