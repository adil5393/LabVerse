/**
 * NCERT Chapter 6 exercises 7, 9 and 16 (PHY-2D): the three questions that need Newton's third law (Section 6.6). Original
 * summaries and solutions. The two-body illustrations use clearly labelled illustrative values and the push-apart model
 * (equal and opposite interaction forces for a finite time); no collision, impact or deformation is simulated. Viewing a
 * solution is never mastery evidence: nothing here touches the learning-progress store.
 */

import type { ForceExercise } from './exercises';
import { DEFAULT_TWO_BODY, twoBodyAt, type TwoBodySetup } from './twoBody';

const V = (method: string) => ({ status: 'verified' as const, method });
const tb = (o: Partial<TwoBodySetup>): TwoBodySetup => ({ ...DEFAULT_TWO_BODY, ...o });

const SAILOR = tb({ massA: 120, massB: 60, force: 120, durationS: 0.5 }); // A = boat (pushed backwards, left), B = sailor (pushed forwards, right)
const CARTS = tb({ massA: 20, massB: 10, force: 30, durationS: 0.2 }); // A = loaded cart (20 kg), B = empty cart (10 kg)
const COMPASS = tb({ massA: 0.5, massB: 0.02, force: 0.05, durationS: 0.2 }); // A = bar magnet, B = compass needle

export const SOLVED_2D: Record<number, ForceExercise> = {
  7: {
    number: 7, sections: ['6.6'], topic: "Newton's third law (a sailor jumping from a boat)", status: 'solved', lessonIds: ['pf-l8', 'pf-l9'],
    summary: 'A sailor jumps forward out of a small boat towards the shore. Does the boat move? If it does, in which direction and why?',
    solution: {
      kind: 'conceptual',
      given: ['A sailor jumps forward from a small boat towards the shore.'],
      find: ['Whether the boat moves, in which direction, and the reason.'],
      assumptions: ['The boat floats freely and the water\'s resistance on it is small at first.'],
      principle: 'Newton\'s third law: when the sailor pushes on the boat, the boat pushes on the sailor with an equal and opposite force at the same time. Each force acts on a different object.',
      hint: 'To jump forward the sailor pushes on something. On what, and in which direction? Then use the third law.',
      steps: [
        { text: 'To jump forward the sailor pushes the boat backwards with his feet (a force on the boat, directed backwards, away from the shore).', why: 'The sailor can only push on what he stands on.' },
        { text: 'By the third law the boat pushes the sailor forwards with an equal force, at the same moment. This force on the sailor makes him accelerate towards the shore.', why: 'The partner of "sailor on boat" is "boat on sailor", equal in size and opposite in direction.' },
        { text: 'The force on the BOAT (from the sailor) acts backwards. It is the only horizontal force on the boat (apart from small water resistance), so the net force on the boat is backwards and the boat accelerates backwards, away from the shore.', why: 'Add only the forces acting on the boat; the pair\'s other member acts on the sailor and is not in the boat\'s sum.' },
        { text: 'The boat\'s acceleration is a = F ÷ m(boat), the sailor\'s is a = F ÷ m(sailor) with the same F. A boat heavier than the sailor accelerates less, so it moves back more slowly than the sailor moves forward, but it does move.', why: 'Equal forces, unequal accelerations when the masses differ.' },
      ],
      answers: [{ label: 'Does the boat move?', value: 'Yes: it moves backwards, away from the shore, in the direction opposite to the sailor\'s jump, because the sailor pushes it backwards and it pushes him forwards with an equal force (third law).' }],
      explanation: 'The boat\'s backward motion is the reaction effect of the jump. The same effect is why you roll back on a wheeled chair when you push a table, or why a swimmer pushes off a wall.',
      commonMistakes: [{ mistake: 'Saying the boat stays still because the forces cancel.', fix: 'The two forces act on different objects (sailor and boat), so they do not cancel.' }, { mistake: 'Saying the boat moves forward with the sailor.', fix: 'The force on the boat is the sailor\'s push, which points backwards.' }, { mistake: 'Saying the boat does not move because it is heavy.', fix: 'It moves, but with a smaller acceleration because of its larger mass.' }],
      illustrations: [{ kind: 'twoBody', caption: 'Illustrative values: boat A (120 kg, pushed backwards) and sailor B (60 kg, pushed forwards) with a 120 N push for 0.5 s. The boat ends moving back at 0.5 m/s while the sailor moves forward at 1 m/s; the momenta are equal and opposite. Water resistance is ignored.', setup: SAILOR, t: 1 }],
      labs: [{ href: '/physics/forces/interactions?experiment=P', label: 'Experiment P: two bodies pushing apart (forces equal, accelerations different)' }],
      labNote: 'The values are illustrative: the real jump involves the boat\'s shape and water resistance, which the push-apart model does not include.',
      verification: V('The two-body model gives a boat velocity of −0.5 m/s and a sailor velocity of +1 m/s with equal and opposite momenta (automated test).'),
    },
  },
  9: {
    number: 9, sections: ['6.6'], topic: 'Forces between two colliding carts', status: 'solved', lessonIds: ['pf-l8'],
    parts: [{ id: 'a', label: 'which statement about the forces is correct' }],
    summary: 'A hand cart loaded with vegetables collides with an identical empty cart. Which of four statements about the forces during the collision is correct?',
    solution: {
      kind: 'multiple-choice',
      given: ['(i) the loaded cart exerts a larger force on the empty one; (ii) the empty cart exerts a larger force on the loaded one; (iii) neither exerts a force on the other; (iv) both exert forces of equal magnitude on each other.'],
      find: ['The correct statement.'],
      principle: 'Newton\'s third law: when two objects interact, each exerts on the other an equal and opposite force, at the same time, whatever their masses.',
      hint: 'Do the masses change the size of the forces the two carts exert on each other? Or only what each cart does as a result?',
      steps: [
        { text: 'The carts exert forces on each other because they interact (they touch). So (iii), "neither exerts a force", is wrong.', why: 'A collision is a force interaction.' },
        { text: 'By the third law the force of the loaded cart on the empty cart and the force of the empty cart on the loaded cart are equal in magnitude and opposite in direction.', why: 'The forces of a pair are always equal.' },
        { text: 'So (i) and (ii), which claim that one force is larger, are wrong.', why: 'Having more load does not make a cart push harder on the other.' },
        { text: 'The loaded cart does behave differently: its acceleration (force ÷ mass) is smaller than that of the empty cart because its mass is larger. But the forces are equal.', why: 'Unequal accelerations do not need unequal forces: a = F ÷ m.' },
      ],
      answers: [{ label: 'Correct statement', value: '(iv) the loaded cart and the empty cart both exert an equal magnitude of force on each other', part: 'a' }],
      explanation: 'The load changes how much each cart accelerates (the loaded one accelerates less), not how hard they push on each other.',
      commonMistakes: [{ mistake: 'Choosing (i) because the loaded cart is heavier.', fix: 'A heavier object does not exert a larger interaction force.' }, { mistake: 'Choosing (ii) because the empty cart is thrown back more.', fix: 'It is thrown back more because its mass is smaller, not because the force is larger.' }],
      illustrations: [{ kind: 'twoBody', caption: 'Illustrative values for an idealised interaction: loaded cart A (20 kg) and empty cart B (10 kg) exert 30 N on each other for 0.2 s. The forces are equal; the accelerations are 1.5 and 3 m/s². (A real collision is not simulated.)', setup: CARTS, t: 0.1 }],
      labs: [{ href: '/physics/forces/interactions?experiment=Q', label: 'Experiment Q: different masses, equal interaction forces' }],
      labNote: 'The laboratory does not simulate collisions, impacts or deformation. It shows an idealised interaction in which the two forces are, as in the question, equal in magnitude while the accelerations differ.',
      verification: V('The two-body model gives forces of equal magnitude on the carts and accelerations in the ratio of the inverse masses (automated test).'),
    },
  },
  16: {
    number: 16, sections: ['6.6'], topic: "Newton's third law with unequal masses (magnet and compass)", status: 'solved', lessonIds: ['pf-l8', 'pf-l9'],
    summary: 'A bar magnet and a compass needle exert equal and opposite magnetic forces on each other when brought close. Yet only the compass needle moves. Explain why.',
    solution: {
      kind: 'conceptual',
      given: ['The magnet and the needle exert equal and opposite magnetic forces on each other.', 'The needle moves; the bar magnet does not (visibly).'],
      find: ['Why only the compass needle moves.'],
      principle: 'The third law gives equal forces on the two objects. The second law (a = F ÷ m) then gives each its own acceleration, which depends on its mass and on any other forces on it.',
      hint: 'The forces are equal. So what must be different for the two objects? Think about a = F ÷ m and about what else acts on each.',
      steps: [
        { text: 'The force of the magnet on the needle and the force of the needle on the magnet are equal in size and opposite in direction (third law, which also holds for non-contact magnetic forces). They act on different objects.', why: 'Each object feels one of the two forces.' },
        { text: 'The needle is very light and sits on a nearly frictionless pivot, so the force on it gives it a large acceleration (a = F ÷ m with a small m) and it turns.', why: 'The same force on a small mass gives a large acceleration.' },
        { text: 'The bar magnet is much more massive, so the same force gives it a very small acceleration: too small to notice.', why: 'a = F ÷ m with a large m.' },
        { text: 'Also, the bar magnet usually rests on a table (or is held), where friction (and the hand) balance the small magnetic force, so the net force on it is zero and it stays at rest.', why: 'Only the NET force on an object decides its motion; the magnetic force is not the only horizontal force on it.' },
        { text: 'So the forces are equal, but the effects differ because the masses and the other forces on the two objects differ.', why: 'Equal forces do not imply equal accelerations (compare Example 6.7, the Earth and a fruit).' },
      ],
      answers: [{ label: 'Why only the needle moves', value: 'The two forces are equal, but the needle has a tiny mass (and a pivot with little friction) so it accelerates a lot, while the massive bar magnet, held by friction or the table, shows no noticeable motion: a = F ÷ m and net force differ.' }],
      explanation: 'The third law says nothing about the accelerations: it only says the forces are equal and opposite. The accelerations follow from the second law and the other forces present.',
      commonMistakes: [{ mistake: 'Saying the magnet exerts a larger force on the needle.', fix: 'The forces are equal; the effects differ.' }, { mistake: 'Saying the forces cancel so nothing should move.', fix: 'They act on different objects and never cancel on one.' }, { mistake: 'Saying the bar magnet feels no force.', fix: 'It feels an equal force, but its acceleration is tiny and friction balances the force.' }],
      illustrations: [{ kind: 'twoBody', caption: 'Illustrative values: bar magnet A (0.5 kg) and compass needle B (0.02 kg) with a 0.05 N magnetic repulsion for 0.2 s (friction on the magnet is not modelled). Both feel 0.05 N; the needle accelerates 25 times as much as the magnet.', setup: COMPASS, t: 0.1 }],
      labs: [{ href: '/physics/forces/interactions?experiment=T', label: 'Experiment T: two magnets as a non-contact force pair' }],
      labNote: 'The model shows the equal forces and the unequal accelerations for illustrative masses; it does not model the needle\'s pivot or the friction on the magnet.',
      verification: V('The two-body model gives equal and opposite forces and an acceleration ratio equal to the inverse mass ratio (automated test).'),
    },
  },
};

/** Recompute the model values quoted in solutions 7, 9 and 16. */
export function recomputeThirdLaw(): Record<string, number> {
  const s = twoBodyAt(SAILOR, 1), c0 = twoBodyAt(CARTS, 0.1), m0 = twoBodyAt(COMPASS, 0.1);
  return {
    q7VBoat: s.vA, q7VSailor: s.vB, q7PTotal: s.pTotal, q7Pboat: s.pA, q7Psailor: s.pB,
    q9FOnLoaded: Math.abs(c0.fOnAByB), q9FOnEmpty: Math.abs(c0.fOnBByA), q9aLoaded: Math.abs(c0.aA), q9aEmpty: Math.abs(c0.aB),
    q16FMagnet: Math.abs(m0.fOnAByB), q16FNeedle: Math.abs(m0.fOnBByA), q16aMagnet: Math.abs(m0.aA), q16aNeedle: Math.abs(m0.aB),
  };
}
